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
        // 書籍カードの描画は .reveal を付けた要素を生成するので、
        // setupReveal より前に実行して監視対象に含める。
        renderSiteBooks();
        setupReveal();
    });

    /* ---------- 0. 書籍カードのデータ駆動描画 ---------- */
    // books.js が読み込まれているページで、[data-books="main|small"]
    // コンテナに window.SITE_BOOKS の内容を自動描画する。
    function renderSiteBooks() {
        var containers = document.querySelectorAll("[data-books]");
        if (containers.length === 0) return;
        if (typeof window.SITE_BOOKS === "undefined") {
            console.warn("[site.js] SITE_BOOKS が見つかりません（books.js の読み込みをご確認ください）。");
            return;
        }

        containers.forEach(function (container) {
            var group = container.getAttribute("data-books");
            var books = window.SITE_BOOKS[group];
            if (!Array.isArray(books)) {
                console.warn('[site.js] SITE_BOOKS に "' + group + '" が見つかりません。');
                return;
            }
            container.innerHTML = books.map(renderBookCard).join("");
        });
    }

    function renderBookCard(book) {
        var isSmall = book.size === "small";
        var cardClass = "card book-card reveal" + (isSmall ? " book-card--small" : "");
        var btnClass = isSmall ? "btn btn-ghost btn--small" : "btn btn-secondary btn--small";
        var btnLabel = isSmall ? "Amazonで見る →" : "Amazonで見る";
        var title = escapeHtml(book.title || "（タイトル要確認）");
        var desc = escapeHtml(book.description || "");
        var url = escapeHtml(book.amazonUrl || "");

        // imageUrl が指定されていれば表紙画像を表示する。
        // ページの階層（トップ／サブページ）によって相対パスが異なるため、
        // links.js の resolveSiteUrl() があればそれで補正する。
        var mediaHtml = "";
        if (book.imageUrl) {
            var resolvedSrc = (typeof window.resolveSiteUrl === "function")
                ? window.resolveSiteUrl(book.imageUrl)
                : book.imageUrl;
            // 表紙画像もクリックで Amazon へ飛べるように <a> でラップする。
            var imgTag = '<img src="' + escapeHtml(resolvedSrc) + '" alt="' + title + '" loading="lazy">';
            var mediaInner = url
                ? '<a href="' + url + '" target="_blank" rel="noopener noreferrer sponsored" aria-label="' + title + 'をAmazonで見る">' + imgTag + "</a>"
                : imgTag;
            mediaHtml =
                '<div class="card__media">' +
                    mediaInner +
                "</div>";
        }

        return (
            '<div class="' + cardClass + '">' +
                mediaHtml +
                '<div class="card__body">' +
                    '<h3 class="card__title">' + title + "</h3>" +
                    (desc ? '<p class="card__text">' + desc + "</p>" : "") +
                    '<div class="book-card__links">' +
                        '<a href="' + url + '" target="_blank" rel="noopener noreferrer sponsored" class="' + btnClass + '">' + btnLabel + "</a>" +
                    "</div>" +
                "</div>" +
            "</div>"
        );
    }

    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

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
