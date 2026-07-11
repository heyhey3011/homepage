/**
 * ============================================================
 *  サイト全体のリンク管理ファイル
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
            url: "",
            status: "coming-soon",
            label: "準備中"
        },
        // 実力派吟士アーカイブス
        ginshiArchives: {
            url: "",
            status: "coming-soon",
            label: "準備中"
        },
        // 詩吟大辞典
        shiginDictionary: {
            url: "",
            status: "coming-soon",
            label: "準備中"
        },
        // 漢詩辞典
        kanshiDictionary: {
            url: "",
            status: "coming-soon",
            label: "準備中"
        },
        // 吟猫コンダクター
        ginnekoConductor: {
            url: "",
            status: "coming-soon",
            label: "準備中"
        },
        // 吟猫ピッチマップ
        ginnekoPitchmap: {
            url: "",
            status: "coming-soon",
            label: "準備中"
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
        url: ""
    },

    // requestForm.url が空のときのフォールバック先（サイト内の相対パス）
    requestFormFallbackUrl: "/contact/",

    // ------------------------------------------------------------
    // コミュニティ
    // ------------------------------------------------------------
    community: {
        // LINEオープンチャット（未着）
        openChat: {
            url: ""
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
    // Kindle書籍（3冊）
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
            el.setAttribute("href", url);
            el.classList.remove("is-coming-soon");
            el.removeAttribute("aria-disabled");
            el.removeAttribute("role");
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
