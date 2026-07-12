// ===== 詩吟大辞典 データ：伴奏・楽器 =====
// このファイルの編集方法は README.md を参照してください。
// 項目は window.SHIGIN_DAIJITEN.entries に追記されます（読み込み順に依存しません）。
//
// 1項目は次の形のオブジェクトです：
//   id        … 全カテゴリで重複しない識別子（このカテゴリは "bansou-" で始めます）
//   category  … "bansou" 固定
//   title/reading/aliases/tags … 見出し・よみ・別名・タグ
//   summary   … 一覧カードに出る短い説明
//   body      … [{ heading, text }] の配列（本文。text 内の改行 \n は <br> になります）
//   fields    … くわしい情報の表
//   related_ids … 関連項目の id（実在する id のみ表示されます）
//   sources   … [{ title, url, accessed, reliability }]（reliability は official/press/community/uncertain）
//
// ※ 事実と異なる情報は書かないこと。不確かな点は本文に「流派により異なる」「要確認」等を明記してください。

window.SHIGIN_DAIJITEN = window.SHIGIN_DAIJITEN || { entries: [] };
window.SHIGIN_DAIJITEN.entries.push(
{
  "id": "bansou-kihon",
  "category": "bansou",
  "title": "詩吟の伴奏の基本（無伴奏と伴奏）",
  "reading": "しぎんのばんそうのきほん（むばんそうとばんそう）",
  "aliases": [
    "無伴奏"
  ],
  "tags": [
    "伴奏",
    "基礎"
  ],
  "summary": "詩吟は本来「無伴奏」で吟じるのが基本。演奏効果を高めるために尺八・琴（箏）・琵琶などの邦楽器が添えられることもある。",
  "body": [
    {
      "heading": "無伴奏が基本",
      "text": "詩吟（吟詠）は本来、伴奏を付けずに声だけで吟じる「無伴奏」が基本の形とされる。素読（詩を声に出して読むこと）に節調を加えたものが詩吟であり、拍子（リズム）を持たず、1句を5〜10秒ほどかけてゆったりと吟じ進める。この自由なテンポで吟じられる点が、拍子に合わせて歌う一般の歌との大きな違いとされる。"
    },
    {
      "heading": "伴奏が添えられる場合",
      "text": "演奏効果を高めるために、尺八・琴（箏）・琵琶などの邦楽器による伴奏が添えられることも一般的である。発表会・大会や音源では、あらかじめ収録された伴奏や、電子邦楽器（コンダクター）による自動伴奏が広く使われている。伴奏を付ける場合も、詩吟は吟者の「間（ま）」を主体に進むため、伴奏側が吟に寄り添う形をとる点が特徴とされる。"
    }
  ],
  "fields": {
    "guide_type": "伴奏"
  },
  "related_ids": [
    "bansou-shakuhachi",
    "bansou-koto",
    "bansou-conductor-bansou",
    "yougo-hougaku-bansou"
  ],
  "sources": [
    {
      "title": "詩吟 - Wikipedia",
      "url": "https://ja.wikipedia.org/wiki/%E8%A9%A9%E5%90%9F",
      "accessed": "2026-07-12",
      "reliability": "community"
    },
    {
      "title": "吟詠音楽の基礎知識 2020年11月 - 日本吟剣詩舞振興会",
      "url": "https://www.ginken.or.jp/index.php/reading_content/reading_content-2236/",
      "accessed": "2026-07-12",
      "reliability": "official"
    }
  ],
  "poem_ids": [],
  "video_ids": [],
  "performer_ids": [],
  "updated": "2026-07-12"
},
{
  "id": "bansou-shakuhachi",
  "category": "bansou",
  "title": "尺八の伴奏",
  "reading": "しゃくはちのばんそう",
  "aliases": [],
  "tags": [
    "伴奏",
    "楽器",
    "尺八"
  ],
  "summary": "詩吟の伴奏に用いられる代表的な邦楽器。本数（キー）に合わせて長さの違う複数の管を持ち替えて演奏する。",
  "body": [
    {
      "heading": "役割と特徴",
      "text": "尺八は、詩吟の前奏や伴奏に添えられる代表的な邦楽器。日本吟剣詩舞振興会の解説によれば、尺八は吟者の音程（本数）に合わせるために、長さの異なる複数の管を用意して持ち替える必要がある。本数ごとに専用の管をそろえるのは現実的でないため、実際には5種類くらいの尺八と3種類ほどの運指を組み合わせて幅広い本数に対応するとされる。"
    },
    {
      "heading": "コンダクターとの違い",
      "text": "同じ解説では、電子邦楽器のコンダクターが弾き方は一種類でスイッチ切り替えだけで本数を変えられるのに対し、尺八は管の持ち替えと運指の工夫が必要である点が対比されている。生の尺八ならではの音色・余韻が、吟の情感を引き立てる。"
    }
  ],
  "fields": {
    "guide_type": "楽器"
  },
  "related_ids": [
    "bansou-kihon",
    "bansou-koto",
    "yougo-hougaku-bansou"
  ],
  "sources": [
    {
      "title": "吟詠音楽の基礎知識 2020年11月 - 日本吟剣詩舞振興会",
      "url": "https://www.ginken.or.jp/index.php/reading_content/reading_content-2236/",
      "accessed": "2026-07-12",
      "reliability": "official"
    }
  ],
  "poem_ids": [],
  "video_ids": [],
  "performer_ids": [],
  "updated": "2026-07-12"
},
{
  "id": "bansou-koto",
  "category": "bansou",
  "title": "箏（琴）の伴奏",
  "reading": "こと（きん）のばんそう",
  "aliases": [
    "琴の伴奏"
  ],
  "tags": [
    "伴奏",
    "楽器",
    "箏"
  ],
  "summary": "尺八と並ぶ代表的な伴奏楽器。箏柱（じ）を動かして調絃し、平調子・中空調子などの調絃で吟に合わせる。",
  "body": [
    {
      "heading": "役割と特徴",
      "text": "箏（琴）は、尺八と並んで詩吟の伴奏に用いられる代表的な邦楽器。日本吟剣詩舞振興会の解説によれば、箏は箏柱（ことじ）と呼ばれるコマを動かして各絃の音の高さを変えて調絃する。基本の調絃として平調子・中空調子などが紹介されており、一の絃が低音である必要から低い本数への対応には限界があり、ぎりぎり4本あたりまでとされている。"
    },
    {
      "heading": "尺八・コンダクターとの併用",
      "text": "実際の伴奏では、箏と尺八が組み合わされたり、電子邦楽器のコンダクターが用いられたりする。市販の伴奏CDにも「琴と尺八による吟詠伴奏」といった形の音源があり、発表会や自宅練習で活用されている。"
    }
  ],
  "fields": {
    "guide_type": "楽器"
  },
  "related_ids": [
    "bansou-kihon",
    "bansou-shakuhachi",
    "bansou-onsource-nyushu",
    "yougo-hougaku-bansou"
  ],
  "sources": [
    {
      "title": "吟詠音楽の基礎知識 2020年11月 - 日本吟剣詩舞振興会",
      "url": "https://www.ginken.or.jp/index.php/reading_content/reading_content-2236/",
      "accessed": "2026-07-12",
      "reliability": "official"
    }
  ],
  "poem_ids": [],
  "video_ids": [],
  "performer_ids": [],
  "updated": "2026-07-12"
},
{
  "id": "bansou-conductor-bansou",
  "category": "bansou",
  "title": "コンダクター（電子伴奏）",
  "reading": "こんだくたー（でんしばんそう）",
  "aliases": [
    "電子邦楽器",
    "吟トレ"
  ],
  "tags": [
    "伴奏",
    "楽器",
    "音程"
  ],
  "summary": "詩吟の前奏・音取り・伴奏に使う電子邦楽器。本数の切り替えが簡単で、練習から大会まで広く使われる。",
  "body": [
    {
      "heading": "概要",
      "text": "コンダクターは、詩吟の練習や大会で前奏・音取り・伴奏に使う電子邦楽器。琴や尺八の音色を再現し、本数（キー）はスイッチや操作で水4本から12本まで簡単に切り替えられる。前奏メロディーを鳴らす機能のほか、4分の1本単位の微調整、陰旋法・俳句・陽旋法などの音階切り替え、複数の音色、時間計測タイマーなどを備えた機種がある。「コンダクター」はもと特定メーカーの商品名だったが、現在は同種の電子邦楽器全般を指す一般名として使われている。"
    },
    {
      "heading": "アプリ版",
      "text": "近年は機器を持ち歩かずに使えるスマートフォンアプリ版（「吟トレ」など）も普及しており、自宅での音取り・音程練習に活用されている。生楽器の尺八・箏に比べて本数合わせが容易なため、伴奏者を確保しにくい場面でも使いやすい。"
    }
  ],
  "fields": {
    "guide_type": "楽器"
  },
  "related_ids": [
    "bansou-kihon",
    "gihou-conductor",
    "yougo-conductor",
    "gihou-honsu"
  ],
  "sources": [
    {
      "title": "[詩吟用語] 詩吟の『コンダクター』とは | 詩吟ファン",
      "url": "https://www.shigin-fan.net/yougo/conductor/",
      "accessed": "2026-07-12",
      "reliability": "community"
    },
    {
      "title": "吟詠音楽の基礎知識 2020年11月 - 日本吟剣詩舞振興会",
      "url": "https://www.ginken.or.jp/index.php/reading_content/reading_content-2236/",
      "accessed": "2026-07-12",
      "reliability": "official"
    }
  ],
  "poem_ids": [],
  "video_ids": [],
  "performer_ids": [],
  "updated": "2026-07-12"
},
{
  "id": "bansou-onsource-nyushu",
  "category": "bansou",
  "title": "伴奏音源・カラオケ音源の入手",
  "reading": "ばんそうおんげん・からおけおんげんのにゅうしゅ",
  "aliases": [
    "伴奏CD"
  ],
  "tags": [
    "伴奏",
    "音源",
    "練習法"
  ],
  "summary": "琴・尺八の伴奏やコンダクター音源を収めた市販CDや、流派・団体が指定・頒布する伴奏CDがある。",
  "body": [
    {
      "heading": "一般的な入手先",
      "text": "詩吟の伴奏・カラオケ音源は、琴と尺八による吟詠伴奏を収めた市販CDや、流派・団体が指定・頒布する伴奏CDなどの形で入手できる。例えば日本詩吟協会は、詩の内容に合った伴奏を選べるよう協会指定の伴奏CDを紹介している。教本に対応した伴奏CDを頒布している流派もある。"
    },
    {
      "heading": "電子機器・アプリでの代替",
      "text": "市販音源のほか、コンダクターやスマートフォンアプリ（「吟トレ」など）を使えば、本数を自分の声に合わせて前奏・伴奏を鳴らすことができる。なお、当ポータルには自分の吟の音程を確認できる「吟猫コンダクター」も無料で公開されているが、伴奏そのものの入手・練習は各流派の音源や上記ツールを併用するとよい。どの音源が使えるかは流派・大会の方針によって異なる場合があるため、所属先に確認するのが確実である。"
    }
  ],
  "fields": {
    "guide_type": "音源"
  },
  "related_ids": [
    "bansou-koto",
    "bansou-conductor-bansou",
    "gihou-rokuon-jiko-bunseki"
  ],
  "sources": [
    {
      "title": "日本詩吟協会指定の伴奏CDの紹介 – 日本詩吟協会",
      "url": "https://nissikyo.jp/cd_info/",
      "accessed": "2026-07-12",
      "reliability": "official"
    },
    {
      "title": "琴と尺八による吟詠・詩吟の伴奏カラオケ（ＣＤ）",
      "url": "https://www.kyoto-wel.com/item/IS81212N04700.html",
      "accessed": "2026-07-12",
      "reliability": "community"
    }
  ],
  "poem_ids": [],
  "video_ids": [],
  "performer_ids": [],
  "updated": "2026-07-12"
},
{
  "id": "bansou-taikai-bansou",
  "category": "bansou",
  "title": "大会・コンクールでの伴奏",
  "reading": "たいかい・こんくーるでのばんそう",
  "aliases": [],
  "tags": [
    "伴奏",
    "大会",
    "コンクール"
  ],
  "summary": "大会では前奏で音を取ってから吟じる形が一般的。伴奏の有無や使う音源のルールは大会・流派によって異なる。",
  "body": [
    {
      "heading": "一般的な進め方",
      "text": "詩吟の大会・コンクールでは、前奏（音取り）で主音や音階を確認してから吟じ始める形が一般的とされる。前奏にはコンダクターや尺八・箏などが用いられる。吟そのものは無伴奏で行われることも多いが、伴奏付きで吟じる大会・部門もある。"
    },
    {
      "heading": "ルールは大会・流派による（要確認）",
      "text": "伴奏を付けるか無伴奏か、コンダクター・生楽器・伴奏CDのいずれを使ってよいか、前奏の扱いなどの細かい規定は、大会や流派によって異なる。本調査では全国共通の統一ルールは確認できなかったため、出場する大会の要項や所属流派に確認する必要がある（要確認）。"
    }
  ],
  "fields": {
    "guide_type": "伴奏"
  },
  "related_ids": [
    "bansou-conductor-bansou",
    "taikai-shinsa-kijun-gainen"
  ],
  "sources": [
    {
      "title": "[詩吟用語] 詩吟の『コンダクター』とは | 詩吟ファン",
      "url": "https://www.shigin-fan.net/yougo/conductor/",
      "accessed": "2026-07-12",
      "reliability": "community"
    },
    {
      "title": "【疑問】詩吟の大会ってどんなもの？どうすれば参加できるの？｜heyhey@詩吟の先生",
      "url": "https://note.com/shigispel/n/n73f90cddedfd",
      "accessed": "2026-07-12",
      "reliability": "community"
    }
  ],
  "poem_ids": [],
  "video_ids": [],
  "performer_ids": [],
  "updated": "2026-07-12"
}
);
