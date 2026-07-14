/**
 * ============================================================
 *  サイト全体のリンク管理ファイル
 * ------------------------------------------------------------
 *  【公開先について（Cloudflare Pages 移行メモ）】
 *  - 本サイトは相対パスのみで構成しており、ルート絶対パス（/...）は使用していません。
 *    そのため GitHub Pages / Cloudflare Pages のどちらでもそのまま動作します。
 *  - 各HTMLの <link rel="canonical"> と og:url は現在 GitHub Pages のURL
 *    （https://shigin-portal.com/）を指しています。
 *    独自ドメインが確定したら、全ページのこの2箇所を一括置換してください。
 * ------------------------------------------------------------
 *  このファイルだけを編集すれば、サイト全体のリンクが差し替わります。
 *  各ページのHTMLには URL を直接書かず、
 *    <a data-link="tools.classroomMap">...</a>
 *  のように data-link 属性でキー名だけを指定してください。
 *  ページ読み込み時に applySiteLinks() が自動実行され、
 *  ここで定義した url を href に注入します。
 *
 *  url が空文字 "" のリンクは「準備中」として扱われ、
 *  クリックできないボタン状態（is-coming-soon）になります。
 *  URL が決まったら、このファイルの該当箇所に文字列を入れるだけでOKです。
 * ============================================================
 */

window.SITE_LINKS = {
    // ------------------------------------------------------------
    // ツール集（各種外部ツール・辞典など）
    // status: "coming-soon"（準備中） | "beta"（試験公開中） | "live"（公開中） | "growing"（随時追加中）
    // ------------------------------------------------------------
    tools: {
        // 全国詩吟教室マップ
        classroomMap: {
            url: "apps/kyoshitsu-map/",
            status: "live",
            label: "公開中"
        },
        // 実力派吟士アーカイブス
        ginshiArchives: {
            url: "apps/ginshi-archives/",
            status: "growing",
            label: "随時追加中"
        },
        // 詩吟大辞典
        shiginDictionary: {
            url: "apps/shigin-jiten/",
            status: "growing",
            label: "随時追加中"
        },
        // 漢詩の図書館
        kanshiDictionary: {
            url: "apps/kanshi-jiten/",
            status: "growing",
            label: "随時追加中"
        },
        // 吟猫コンダクター
        ginnekoConductor: {
            url: "https://ginneko-conductor.netlify.app/",
            status: "live",
            label: "公開中"
        },
        // 吟猫ピッチマップ
        ginnekoPitchmap: {
            url: "apps/pitchmap/",
            status: "live",
            label: "公開中"
        }
    },

    // ------------------------------------------------------------
    // メルマガ（読者層別）
    // url が空の場合は、既存メルマガ https://shigin.net/p/r/cbWMf1ve に
    // フォールバックする仕様（applySiteLinks 内で処理）
    // ------------------------------------------------------------
    newsletter: {
        // 初心者向け
        beginner: {
            url: ""
        },
        // 学習者・ツール利用者向け
        learner: {
            url: ""
        },
        // 教室・指導者向け
        teacher: {
            url: ""
        }
    },

    // 既存メルマガURL（newsletter.* が空のときのフォールバック先）
    newsletterFallbackUrl: "https://shigin.net/p/r/cbWMf1ve",

    // ------------------------------------------------------------
    // お問い合わせ・申し込みフォーム
    // url が空の場合は /contact ページへフォールバック
    // ------------------------------------------------------------
    requestForm: {
        // 修正・削除依頼フォーム
        // ※お問い合わせ・各種依頼は1つの統一Googleフォームに集約する方針。
        url: "https://docs.google.com/forms/d/e/1FAIpQLSfTae1WmuDbTgIqUKCQMHahGo7RJ1gVgEchbMoCmsQEQFbdMA/viewform?usp=dialog"
    },

    // requestForm.url が空のときのフォールバック先
    // ※GitHub Pagesのプロジェクトサイトのため、先頭に / を付けず
    //   「サイトルートからの相対パス」で書くこと。
    //   ページ階層に応じた ../ は applySiteLinks() が自動補正します。
    requestFormFallbackUrl: "contact/",

    // ------------------------------------------------------------
    // お問い合わせフォーム（種別ごと）
    // contact/ ページのボタンから使用します。
    // ※現在はすべてダミーURLです。Googleフォームが用意できたら、
    //   下記の各 url を実際の https://forms.gle/... に差し替えてください。
    // ------------------------------------------------------------
    // ※お問い合わせは種別を問わず1つの統一Googleフォームに集約する方針になったため、
    //   全種別を同じ実URLに統一しています。
    contactForms: {
        // 講演依頼
        koen:   { url: "https://docs.google.com/forms/d/e/1FAIpQLSfTae1WmuDbTgIqUKCQMHahGo7RJ1gVgEchbMoCmsQEQFbdMA/viewform?usp=dialog" },
        // 取材依頼
        shuzai: { url: "https://docs.google.com/forms/d/e/1FAIpQLSfTae1WmuDbTgIqUKCQMHahGo7RJ1gVgEchbMoCmsQEQFbdMA/viewform?usp=dialog" },
        // 吟猫道場について
        dojo:   { url: "https://docs.google.com/forms/d/e/1FAIpQLSfTae1WmuDbTgIqUKCQMHahGo7RJ1gVgEchbMoCmsQEQFbdMA/viewform?usp=dialog" },
        // 掲載情報について
        keisai: { url: "https://docs.google.com/forms/d/e/1FAIpQLSfTae1WmuDbTgIqUKCQMHahGo7RJ1gVgEchbMoCmsQEQFbdMA/viewform?usp=dialog" },
        // その他のお問い合わせ
        other:  { url: "https://docs.google.com/forms/d/e/1FAIpQLSfTae1WmuDbTgIqUKCQMHahGo7RJ1gVgEchbMoCmsQEQFbdMA/viewform?usp=dialog" }
    },

    // ------------------------------------------------------------
    // コミュニティ
    // ------------------------------------------------------------
    community: {
        // LINEオープンチャット「吟ねこコミュニティ」
        openChat: {
            url: "https://line.me/ti/g2/dQ7kQC3l9VKQwCiWqvT3qB20hVzkjw0LmVQmhg?utm_source=invitation&utm_medium=link_copy&utm_campaign=default"
        },
        // 吟猫道場の詳細ページ（既存ページ）
        dojo: {
            url: "dojo-details.html"
        }
    },

    // ------------------------------------------------------------
    // 既存リンク（index.html 等から転記。挙動を変えたい場合はここを編集）
    // ------------------------------------------------------------
    youtube: {
        url: "https://www.youtube.com/channel/UCerBISByAKR3KU9CD9Tz5ZQ"
    },
    x: {
        url: "https://x.com/heyhey3011"
    },
    standfm: {
        url: "https://stand.fm/channels/5f18a737907968e29d7a6b68"
    },
    spotify: {
        url: "https://open.spotify.com/show/6GtLnXezwhCTmwDuKNBraE?si=jAoPXuPaSVeaXnkvivDxlQ"
    },
    suno: {
        url: "https://suno.com/me"
    },
    note: {
        url: "https://note.com/shigispel"
    },
    // Kindle書籍（個別リンク・data-link 互換のため従来キーを維持）
    kindle1: {
        url: "https://amzn.to/3uMn6QC" // 自分の声に自信が持てる!!本当の腹式呼吸
    },
    kindle2: {
        url: "https://amzn.to/3Mkz5Oe" // 詩吟の教科書－初心者編－
    },
    kindle3: {
        url: "https://amzn.to/43hkDP6" // 詩吟の教科書－入門編－
    },
    // Audible（音声版があるのは2冊）
    audible1: {
        url: "https://amzn.to/3pJyB8H" // 自分の声に自信が持てる!!本当の腹式呼吸（Audible）
    },
    audible2: {
        url: "https://amzn.to/4bE7i4b" // 詩吟の教科書－初心者編－（Audible）
    },

    // ------------------------------------------------------------
    // 詩吟の教科書シリーズ（3冊まとめ・カード導線用）
    // ※書籍カードの表示は assets/js/books.js に一元化しました。
    //   ここは data-link="books.*" を使う旧コードとの互換のために残しています。
    //   URLは books.js と揃えてあります（変更時は両方を更新）。
    // status: "live"（公開中） | "coming-soon"（準備中）
    // ------------------------------------------------------------
    books: {
        // 入門編：詩吟をこれから知りたい方向け
        nyumon: {
            url: "https://amzn.to/4gyN56i",
            status: "live",
            label: "公開中"
        },
        // 初心者編：実際に練習を始めたい方向け
        shoshinsya: {
            url: "https://amzn.to/4fcD2S4",
            status: "live",
            label: "公開中"
        },
        // 中級編：さらに表現や技術を深めたい方向け
        chukyu: {
            url: "https://amzn.to/4ffb1Jy",
            status: "live",
            label: "公開中"
        }
    }
};

// ------------------------------------------------------------
// ステータスバッジの表示文言
// ------------------------------------------------------------
const SITE_LINK_STATUS_LABELS = {
    "coming-soon": "準備中",
    "beta": "試験公開中",
    "live": "公開中",
    "growing": "随時追加中"
};

/**
 * オブジェクトのパス文字列（例: "tools.classroomMap"）から値を取得する
 */
function getSiteLinkByPath(path) {
    const parts = path.split(".");
    let current = window.SITE_LINKS;
    for (const part of parts) {
        if (current == null) return undefined;
        current = current[part];
    }
    return current;
}

/**
 * サイトルートへの相対パス接頭辞を求める
 * （例: ルート直下ページ → ""、map/ 配下のページ → "../"）
 * links.js 自身の <script src="..."> から逆算するので、
 * 各ページは自分の階層に合わせた相対パスで links.js を読み込むだけでよい。
 */
function getSiteRootPrefix() {
    const script = document.querySelector('script[src$="links.js"]');
    if (!script) return "";
    const src = script.getAttribute("src") || "";
    // ".../assets/js/links.js" より前の部分が接頭辞（"../" など）
    return src.replace(/assets\/js\/links\.js$/, "");
}

/**
 * サイト内リンク（http等で始まらないURL）に階層接頭辞を付ける
 */
function resolveSiteUrl(url) {
    if (!url) return url;
    // 外部URL・アンカー・特殊スキームはそのまま
    if (/^(https?:|mailto:|tel:|#|javascript:|\/)/.test(url)) return url;
    // すでに ../ で始まる場合もそのまま（手書き相対パスを尊重）
    if (url.startsWith("../") || url.startsWith("./")) return url;
    return getSiteRootPrefix() + url;
}

/**
 * data-link / data-link-status 属性を持つ要素にリンクとステータスを反映する
 */
window.applySiteLinks = function applySiteLinks() {
    // data-link="tools.classroomMap" の形の要素に href を注入
    document.querySelectorAll("[data-link]").forEach((el) => {
        const path = el.getAttribute("data-link");
        const linkData = getSiteLinkByPath(path);

        if (!linkData) {
            console.warn(`[links.js] SITE_LINKS に "${path}" が見つかりません。`);
            return;
        }

        let url = linkData.url || "";

        // フォールバック処理
        if (!url) {
            if (path.startsWith("newsletter.")) {
                url = window.SITE_LINKS.newsletterFallbackUrl || "";
            } else if (path === "requestForm") {
                url = window.SITE_LINKS.requestFormFallbackUrl || "";
            }
        }

        if (url) {
            el.setAttribute("href", resolveSiteUrl(url));
            el.classList.remove("is-coming-soon");
            el.removeAttribute("aria-disabled");
            el.removeAttribute("role");

            // 学習ツール（tools.*）は原則すべて別タブで開く。
            // 内部のアプリ（apps/配下）も外部ツールも新しいタブで開き、
            // ポータル本体のタブが残るようにする。
            if (path.indexOf("tools.") === 0) {
                el.setAttribute("target", "_blank");
                el.setAttribute("rel", "noopener noreferrer");
            }
        } else {
            // urlが空（準備中）の場合はクリックできないボタン状態にする
            el.classList.add("is-coming-soon");
            el.setAttribute("href", "javascript:void(0)");
            el.setAttribute("role", "button");
            el.setAttribute("aria-disabled", "true");
        }

        // data-link-status も同じ要素に付いていれば、ここでまとめて処理
        if (el.hasAttribute("data-link-status")) {
            applyStatusBadge(el, linkData.status);
        }
    });

    // data-link は無いが data-link-status だけ付いている要素にも対応
    document.querySelectorAll("[data-link-status]:not([data-link])").forEach((el) => {
        const path = el.getAttribute("data-link-status");
        const linkData = getSiteLinkByPath(path);
        if (linkData) {
            applyStatusBadge(el, linkData.status);
        }
    });
};

/**
 * ステータスバッジ文言を要素に注入する
 */
function applyStatusBadge(el, status) {
    const label = SITE_LINK_STATUS_LABELS[status] || SITE_LINK_STATUS_LABELS["coming-soon"];
    el.textContent = label;
    el.setAttribute("data-status", status || "coming-soon");
}

// DOMContentLoaded で自動実行
document.addEventListener("DOMContentLoaded", () => {
    window.applySiteLinks();
});
