/**
 * ============================================================
 *  書籍データ（データ駆動）
 * ------------------------------------------------------------
 *  このファイルだけを編集すれば、書籍カードの内容が差し替わります。
 *  各ページのHTMLには書籍を直接書かず、
 *    <div class="grid grid--3 mt-3" data-books="main"></div>
 *    <div class="grid grid--3 mt-3" data-books="small"></div>
 *  のように data-books 属性でグループ名（"main" / "small"）を指定してください。
 *  site.js の renderSiteBooks() がページ読み込み時に自動でカードを描画します。
 *
 *  各書籍のフィールド:
 *    id          … 一意なキー（半角英数）
 *    title       … 書名（カード見出し）
 *    description … 一言説明（憶測で盛らない）
 *    amazonUrl   … Amazon（アフィリエイト）リンク
 *    size        … "normal"（大きめカード） | "small"（小さめカード）
 *    category    … 分類（"textbook" 教科書シリーズ / "kanshi" 漢詩を味わうシリーズ）
 *    imageUrl    … （任意）表紙画像のパス。サイトルートからの相対パスで指定
 *                  （例: "assets/img/legacy/kindle-nyumon.jpg"）。
 *                  site.js の resolveSiteUrl() でページの階層差を自動補正します。
 *                  未指定なら従来どおりテキストのみのカードで表示されます。
 *
 *  ※ 表示のあるページには「このページにはアフィリエイトリンクが含まれます。」の
 *    注記を必ず添えてください（books-affiliate-note クラスのひな型を用意しています）。
 * ============================================================
 */

window.SITE_BOOKS = {
    // ------------------------------------------------------------
    // メイン3冊：詩吟の教科書シリーズ（大きめカード）
    // ------------------------------------------------------------
    main: [
        {
            id: "textbook-nyumon",
            title: "詩吟の教科書 －入門編－",
            description: "詩吟をこれから知りたい方向け。",
            amazonUrl: "https://amzn.to/4gyN56i",
            size: "normal",
            category: "textbook",
            imageUrl: "assets/img/legacy/kindle-nyumon.jpg"
        },
        {
            id: "textbook-shoshinsya",
            title: "詩吟の教科書 －初心者編－",
            description: "実際に練習を始めたい方向け。",
            amazonUrl: "https://amzn.to/4fcD2S4",
            size: "normal",
            category: "textbook",
            imageUrl: "assets/img/legacy/kindle-shoshinsya.jpg"
        },
        {
            id: "textbook-chukyu",
            title: "詩吟の教科書 －中級編－",
            description: "さらに表現や技術を深めたい方向け。",
            amazonUrl: "https://amzn.to/4ffb1Jy",
            size: "normal",
            category: "textbook"
        }
    ],

    // ------------------------------------------------------------
    // 小カード4冊：「詩吟で深める漢詩の世界」シリーズ（吟猫書房）
    // タイトルは Amazon 商品ページ（amzn.to リンク先）から取得しました。
    // ------------------------------------------------------------
    small: [
        {
            id: "kanshi-kessenya",
            title: "九月十三夜、陣中の月 ― 上杉謙信の漢詩を味わう旅",
            description: "上杉謙信ゆかりの漢詩を、その背景とともに味わう一冊です。",
            amazonUrl: "https://amzn.to/453LhuJ",
            size: "small",
            category: "kanshi"
        },
        {
            id: "kanshi-ippo",
            title: "一歩歩高くして光景開く ― 草場佩川「山行同志に示す」を味わう旅",
            description: "草場佩川「山行同志に示す」を、その背景とともに味わう一冊です。",
            amazonUrl: "https://amzn.to/4vl8nrz",
            size: "small",
            category: "kanshi"
        },
        {
            id: "kanshi-tabaruzaka",
            title: "田原坂で敗れた青年 ― 佐々友房の漢詩を味わう旅",
            description: "佐々友房の漢詩を、田原坂の物語とともに味わう一冊です。",
            amazonUrl: "https://amzn.to/4gte5nz",
            size: "small",
            category: "kanshi"
        },
        {
            id: "kanshi-choujou",
            title: "万里の長城より高い三尺の徳 ― 汪遵『長城』を味わう旅",
            description: "汪遵の漢詩「長城」を、その背景とともに味わう一冊です。",
            amazonUrl: "https://amzn.to/4bCeSPA",
            size: "small",
            category: "kanshi"
        }
    ]
};
