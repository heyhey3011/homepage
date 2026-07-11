/**
 * ============================================================
 *  サイト共通スクリプト
 * ------------------------------------------------------------
 *  すべてのページで読み込んでください:
 *    <script src="assets/js/site.js" defer></script>
 *    ※サブディレクトリからは src="../assets/js/site.js"
 *
 *  担当する挙動:
 *  1. ハンバーガーメニューの開閉（.nav-toggle / .mobile-menu）
 *  2. スクロール時のヘッダー影（.site-header に .is-scrolled）
 *  3. .reveal 要素のスクロールフェードイン
 *  4. FAQ は <details>/<summary> のネイティブ挙動を使うためJS不要
 * ============================================================
 */

(function () {
    "use strict";

    // JSが動いていることをCSSに伝える（.no-js フォールバック解除）
    document.documentElement.classList.remove("no-js");

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupHeaderShadow();
        setupReveal();
    });

    /* ---------- 1. ハンバーガーメニュー ---------- */
    function setupMobileMenu() {
        var toggle = document.querySelector(".nav-toggle");
        var menu = document.querySelector(".mobile-menu");
        if (!toggle || !menu) return;

        toggle.addEventListener("click", function () {
            var isOpen = menu.classList.toggle("is-open");
            toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });

        // メニュー内リンクを押したら閉じる
        menu.addEventListener("click", function (e) {
            if (e.target.closest("a")) {
                menu.classList.remove("is-open");
                toggle.setAttribute("aria-expanded", "false");
            }
        });

        // Escキーで閉じる
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && menu.classList.contains("is-open")) {
                menu.classList.remove("is-open");
                toggle.setAttribute("aria-expanded", "false");
                toggle.focus();
            }
        });
    }

    /* ---------- 2. スクロール時のヘッダー影 ---------- */
    function setupHeaderShadow() {
        var header = document.querySelector(".site-header");
        if (!header) return;

        var ticking = false;
        function update() {
            header.classList.toggle("is-scrolled", window.scrollY > 8);
            ticking = false;
        }
        window.addEventListener("scroll", function () {
            if (!ticking) {
                ticking = true;
                requestAnimationFrame(update);
            }
        }, { passive: true });
        update();
    }

    /* ---------- 3. スクロールフェードイン ---------- */
    function setupReveal() {
        var targets = document.querySelectorAll(".reveal");
        if (targets.length === 0) return;

        // 動きを減らす設定、または IntersectionObserver 非対応なら即表示
        var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced || !("IntersectionObserver" in window)) {
            targets.forEach(function (el) { el.classList.add("is-visible"); });
            return;
        }

        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

        targets.forEach(function (el) { observer.observe(el); });
    }
})();
