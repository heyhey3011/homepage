/**
 * ============================================================
 *  アクセス解析スクリプト（Googleアナリティクス4 / GA4）
 * ------------------------------------------------------------
 *  すべてのページで読み込んでください:
 *    <script src="assets/js/analytics.js" defer></script>
 *    ※サブディレクトリからは src="../assets/js/analytics.js"
 *      apps 配下からは src="../../assets/js/analytics.js"
 *
 *  ▼▼▼ ここに測定IDを入れると計測が始まります ▼▼▼
 *  GA4の測定ID（G-XXXXXXXXXX の形）を下の "" の中に貼り付けてください。
 *  空のままだと、このスクリプトは何もしません（計測オフ）。
 *  例: const ANALYTICS_ID = "G-ABCDEFGHIJ";
 */
const ANALYTICS_ID = "G-HFVMQXTYRY";
/*  ▲▲▲ 変更するのはこの1行だけでOKです ▲▲▲  */

(function () {
    "use strict";

    // ------------------------------------------------------------
    // 1. 測定IDが未設定なら、ここで終了（gtag.jsも読み込まない）
    // ------------------------------------------------------------
    if (!ANALYTICS_ID || ANALYTICS_ID.indexOf("G-") !== 0) {
        return;
    }

    // ------------------------------------------------------------
    // 2. gtag.js を動的に読み込み、基本設定（page_viewは自動送信）
    // ------------------------------------------------------------
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;

    var loader = document.createElement("script");
    loader.async = true;
    loader.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ANALYTICS_ID);
    document.head.appendChild(loader);

    gtag("js", new Date());
    gtag("config", ANALYTICS_ID);

    // ------------------------------------------------------------
    // 3. クリックイベントの計測
    //    documentへの委任リスナーで、クリックされたリンクを判定します。
    // ------------------------------------------------------------

    // リンクの文言（表示テキスト）を取り出す。無ければaria-label等で補う。
    function getLinkText(a) {
        var text = (a.textContent || "").replace(/\s+/g, " ").trim();
        if (!text) {
            text = a.getAttribute("aria-label") || a.getAttribute("title") || "";
        }
        return text.slice(0, 100); // 長すぎる場合は切り詰め
    }

    // apps/ 配下のリンクから、どのツールかを取り出す。
    function detectTool(href) {
        var m = href.match(/apps\/([a-z0-9\-]+)/i);
        return m ? m[1] : "unknown";
    }

    function send(eventName, params) {
        try {
            window.gtag("event", eventName, params);
        } catch (e) {
            // 計測でサイト本体の動作を止めない
        }
    }

    document.addEventListener("click", function (ev) {
        var a = ev.target && ev.target.closest ? ev.target.closest("a") : null;
        if (!a) return;

        var href = a.getAttribute("href") || "";
        if (!href) return;

        var pagePath = window.location.pathname;
        var linkText = getLinkText(a);

        // 判定の順番が大切です。
        // 「吟猫道場のjoinリンク」は youtube.com を含むため、
        // 先に道場判定を行い、その後で一般のYouTube判定を行います。

        // (1) メルマガ（配信スタンド shigin.net への登録リンク）
        if (href.indexOf("shigin.net") !== -1) {
            send("mailmag_click", { page_path: pagePath, link_text: linkText });
            return;
        }

        // (2) Kindle（Amazonアソシエイトの書籍リンク）
        if (href.indexOf("amzn.to") !== -1 || href.indexOf("amazon.co.jp") !== -1) {
            send("kindle_click", { page_path: pagePath, link_text: linkText });
            return;
        }

        // (3) 吟猫道場（詳細ページ / YouTubeメンバーシップ加入）
        if (href.indexOf("dojo-details") !== -1 ||
            href.indexOf("youtube.com/@shigin_channel/join") !== -1) {
            send("dojo_click", { page_path: pagePath, link_text: linkText });
            return;
        }

        // (4) LINEオープンチャット
        if (href.indexOf("line.me") !== -1) {
            send("openchat_click", { page_path: pagePath, link_text: linkText });
            return;
        }

        // (5) 練習補助ツール（apps/ 配下）
        if (href.indexOf("apps/") !== -1) {
            send("tool_open", { page_path: pagePath, link_text: linkText, tool_name: detectTool(href) });
            return;
        }

        // (6) Googleフォーム（お問い合わせ・リクエスト等）
        if (href.indexOf("forms.gle") !== -1 || href.indexOf("docs.google.com/forms") !== -1) {
            send("form_click", { page_path: pagePath, link_text: linkText });
            return;
        }

        // (7) YouTube（(3)のメンバーシップ加入リンク以外の動画・チャンネル）
        if (href.indexOf("youtube.com") !== -1 || href.indexOf("youtu.be") !== -1) {
            send("youtube_click", { page_path: pagePath, link_text: linkText });
            return;
        }
    }, true);
})();
