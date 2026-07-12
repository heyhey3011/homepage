// ===== 詩吟大辞典 スキーマ定義 =====
// カテゴリの一覧・信頼度ラベルを定義します。
// このファイルは index.html が最初に読み込みます（各カテゴリjsより前）。
// window.SHIGIN_DAIJITEN.entries には各カテゴリjsが項目を追記していきます。

window.SHIGIN_DAIJITEN = window.SHIGIN_DAIJITEN || { entries: [] };

// カテゴリ定義（表示順）
window.SHIGIN_DAIJITEN.categories = [
  { key: "gihou",     label: "技法・発声・上達", icon: "声" },
  { key: "ryuha",     label: "流派・団体",       icon: "流" },
  { key: "taikai",    label: "大会・審査",       icon: "賞" },
  { key: "yougo",     label: "歴史・用語",       icon: "史" },
  { key: "dougu",     label: "装束・道具",       icon: "装" },
  { key: "bansou",    label: "伴奏・楽器",       icon: "楽" },
  { key: "dani",      label: "段位・資格",       icon: "位" },
  { key: "kyoshitsu", label: "教室の探し方",     icon: "門" }
];

// 信頼度ラベル（出典バッジで使用）
window.SHIGIN_DAIJITEN.reliabilityLevels = {
  official:  { label: "公式",      note: "流派・協会・行政の公式サイト/刊行物" },
  press:     { label: "報道・公共", note: "新聞・テレビ・大学など" },
  community: { label: "愛好者",    note: "個人ブログ・SNS・愛好家サイト" },
  uncertain: { label: "諸説あり",  note: "情報源が限られる/流派で異なる" }
};
