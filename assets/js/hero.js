/**
 * ============================================================
 *  ヒーロー背景演出（three.js / WebGPURenderer）
 * ------------------------------------------------------------
 *  - three@0.182.0 の WebGPU ビルドを assets/vendor/three/ から
 *    importmap 経由で読み込みます（index.html の importmap 参照）。
 *  - WebGPURenderer は WebGPU 非対応環境では自動的に WebGL2 に
 *    フォールバックします（renderer.backend で判定してログ出力）。
 *  - 演出: 生成り和紙の上を墨の霞がゆっくり流れ、金の粒子が漂う。
 *  - 性能配慮:
 *      * devicePixelRatio 上限 2（モバイルは 1.5）
 *      * requestIdleCallback で初期化を遅延
 *      * IntersectionObserver で画面外は描画停止
 *      * document.hidden で描画停止
 *      * prefers-reduced-motion 時は一切初期化しない
 *  - 失敗してもヒーローはCSS背景で成立する（プログレッシブ・
 *    エンハンスメント）。エラーは握りつぶして静的表示のまま。
 * ============================================================
 */

const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const mount = document.getElementById("hero-canvas");

if (mount && !REDUCED_MOTION) {
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 200));
    idle(() => {
        initHero().catch((err) => {
            // 3D演出は飾りなので、失敗しても静的ヒーローのまま進める
            console.info("[hero] 3D背景の初期化をスキップしました:", err && err.message ? err.message : err);
        });
    });
}

async function initHero() {
    const THREE = await import("three");

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const MAX_DPR = isMobile ? 1.5 : 2;

    // --- レンダラー（WebGPU、非対応なら three が WebGL2 に自動フォールバック） ---
    const renderer = new THREE.WebGPURenderer({
        antialias: true,
        alpha: true
    });
    await renderer.init();

    const backendName =
        renderer.backend && renderer.backend.isWebGPUBackend ? "WebGPU" : "WebGL2";
    console.info(`[hero] three.js r${THREE.REVISION} / バックエンド: ${backendName}`);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0); // 透過（下のCSS背景＝和紙を活かす）
    mount.appendChild(renderer.domElement);

    // --- シーン / カメラ ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
        50,
        mount.clientWidth / mount.clientHeight,
        0.1,
        100
    );
    camera.position.set(0, 0, 10);

    // ============================================================
    // 1) 墨の霞: 大きな半透明スプライトを数枚、ゆっくり流す
    // ============================================================
    const inkTexture = makeInkTexture();
    const inkGroup = new THREE.Group();
    const inkSprites = [];
    const INK_COUNT = isMobile ? 4 : 6;

    for (let i = 0; i < INK_COUNT; i++) {
        const material = new THREE.SpriteMaterial({
            map: inkTexture,
            transparent: true,
            opacity: 0.05 + Math.random() * 0.06,
            depthWrite: false
        });
        const sprite = new THREE.Sprite(material);
        const scale = 9 + Math.random() * 8;
        sprite.scale.set(scale, scale * (0.55 + Math.random() * 0.3), 1);
        sprite.position.set(
            (Math.random() - 0.5) * 22,
            (Math.random() - 0.5) * 9,
            -2 - Math.random() * 3
        );
        sprite.userData = {
            speed: 0.08 + Math.random() * 0.1,     // 横に流れる速さ
            drift: 0.15 + Math.random() * 0.25,    // 縦の揺らぎ幅
            phase: Math.random() * Math.PI * 2
        };
        inkGroup.add(sprite);
        inkSprites.push(sprite);
    }
    scene.add(inkGroup);

    // ============================================================
    // 2) 金の粒子: ふわっと漂うポイントクラウド
    // ============================================================
    const PARTICLE_COUNT = isMobile ? 500 : 1400;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const seeds = new Float32Array(PARTICLE_COUNT); // 個体差用の乱数

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i * 3 + 0] = (Math.random() - 0.5) * 24; // x
        positions[i * 3 + 1] = (Math.random() - 0.5) * 12; // y
        positions[i * 3 + 2] = (Math.random() - 0.5) * 8;  // z
        seeds[i] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
        map: makeGoldDotTexture(),
        color: 0xd8b25f,          // 金
        size: isMobile ? 0.09 : 0.08,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);

    // ============================================================
    // 視差（マウス / ジャイロ）— 極わずかに
    // ============================================================
    const parallax = { x: 0, y: 0, tx: 0, ty: 0 };

    window.addEventListener("pointermove", (e) => {
        parallax.tx = (e.clientX / window.innerWidth - 0.5) * 0.4;
        parallax.ty = (e.clientY / window.innerHeight - 0.5) * 0.25;
    }, { passive: true });

    window.addEventListener("deviceorientation", (e) => {
        if (e.gamma == null || e.beta == null) return;
        parallax.tx = Math.max(-1, Math.min(1, e.gamma / 45)) * 0.3;
        parallax.ty = Math.max(-1, Math.min(1, (e.beta - 45) / 45)) * 0.2;
    }, { passive: true });

    // ============================================================
    // 描画ループ制御（画面外・タブ非表示で停止）
    // ============================================================
    let isInView = true;
    let rafId = 0;
    let running = false;
    const clock = new THREE.Clock();

    const visibilityObserver = new IntersectionObserver((entries) => {
        isInView = entries[0].isIntersecting;
        updateRunningState();
    }, { threshold: 0.01 });
    visibilityObserver.observe(mount);

    document.addEventListener("visibilitychange", updateRunningState);

    function updateRunningState() {
        const shouldRun = isInView && !document.hidden;
        if (shouldRun && !running) {
            running = true;
            clock.start();
            rafId = requestAnimationFrame(tick);
        } else if (!shouldRun && running) {
            running = false;
            cancelAnimationFrame(rafId);
            clock.stop();
        }
    }

    function tick() {
        if (!running) return;
        const t = clock.getElapsedTime();

        // 墨の霞: ゆっくり右へ流れ、端まで行ったら左へ戻す
        for (const sprite of inkSprites) {
            const u = sprite.userData;
            sprite.position.x += u.speed * 0.016;
            sprite.position.y += Math.sin(t * 0.15 + u.phase) * 0.0015;
            sprite.material.rotation = Math.sin(t * 0.05 + u.phase) * 0.05;
            if (sprite.position.x > 14) sprite.position.x = -14;
        }

        // 金の粒子: sin波でふわふわ漂わせる（全体をゆっくり回す＋上下の揺らぎ）
        particles.rotation.y = Math.sin(t * 0.05) * 0.08;
        const pos = geometry.attributes.position;
        // 全頂点を毎フレーム更新するとモバイルで重いので、1/3ずつ更新
        const stride = 3;
        const offset = Math.floor(t * 60) % stride;
        for (let i = offset; i < PARTICLE_COUNT; i += stride) {
            const base = i * 3;
            pos.array[base + 1] += Math.sin(t * 0.4 + seeds[i]) * 0.0011;
            pos.array[base + 0] += Math.cos(t * 0.25 + seeds[i]) * 0.0006;
        }
        pos.needsUpdate = true;

        // 視差: カメラを極わずかに寄せる
        parallax.x += (parallax.tx - parallax.x) * 0.03;
        parallax.y += (parallax.ty - parallax.y) * 0.03;
        camera.position.x = parallax.x;
        camera.position.y = -parallax.y;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
        rafId = requestAnimationFrame(tick);
    }

    // リサイズ対応
    let resizeTimer = 0;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const w = mount.clientWidth;
            const h = mount.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        }, 150);
    }, { passive: true });

    updateRunningState();

    // ------------------------------------------------------------
    // テクスチャ生成（外部画像に依存せず canvas で作る）
    // ------------------------------------------------------------

    /** 墨の霞テクスチャ: 柔らかい放射グラデーションを重ねた滲み */
    function makeInkTexture() {
        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        for (let i = 0; i < 7; i++) {
            const cx = size / 2 + (Math.random() - 0.5) * size * 0.35;
            const cy = size / 2 + (Math.random() - 0.5) * size * 0.35;
            const r = size * (0.2 + Math.random() * 0.28);
            const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
            g.addColorStop(0, "rgba(34, 33, 30, 0.55)");
            g.addColorStop(0.6, "rgba(34, 33, 30, 0.18)");
            g.addColorStop(1, "rgba(34, 33, 30, 0)");
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, size, size);
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }

    /** 金の粒テクスチャ: 中心が明るい丸い光点 */
    function makeGoldDotTexture() {
        const size = 64;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        g.addColorStop(0, "rgba(255, 244, 214, 1)");
        g.addColorStop(0.3, "rgba(232, 197, 120, 0.9)");
        g.addColorStop(0.7, "rgba(216, 178, 95, 0.25)");
        g.addColorStop(1, "rgba(216, 178, 95, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);

        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }
}
