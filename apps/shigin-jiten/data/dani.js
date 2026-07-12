// ===== 詩吟大辞典 データ：段位・資格 =====
// このファイルの編集方法は README.md を参照してください。
// 項目は window.SHIGIN_DAIJITEN.entries に追記されます（読み込み順に依存しません）。
//
// このカテゴリは、各流派に共通して見られる段位・資格の「一般的なしくみ」を説明します。
// 個々の流派ごとの違い（師範までの年数など）は「流派比較」トピックで扱っているため、
// ここでは仕組みの説明を中心にし、本文から流派比較や関連用語へ誘導してください。
//
// 1項目は次の形のオブジェクトです：
//   id        … 全カテゴリで重複しない識別子（このカテゴリは "dani-" で始めます）
//   category  … "dani" 固定
//   title/reading/aliases/tags / summary / body[{heading,text}] / fields
//   related_ids … 関連項目の id（実在する entry の id のみ表示されます）
//   sources   … [{ title, url, accessed, reliability }]（official/press/community/uncertain）
//
// ※ 全国共通の資格制度は存在しません。事実と異なる断定を避け、「流派により異なる」「要確認」を明記してください。

window.SHIGIN_DAIJITEN = window.SHIGIN_DAIJITEN || { entries: [] };
window.SHIGIN_DAIJITEN.entries.push(
{
  "id": "dani-shikaku-gaisetsu",
  "category": "dani",
  "title": "詩吟の段位・資格のしくみ（概説）",
  "reading": "しぎんのだんい・しかくのしくみ（がいせつ）",
  "aliases": [
    "資格制度"
  ],
  "tags": [
    "段位",
    "資格",
    "制度",
    "基礎"
  ],
  "summary": "詩吟には剣道や書道のような全国共通の資格はなく、各流派・団体が独自に級・段・師範などの制度を定めている。",
  "body": [
    {
      "heading": "全国共通の資格はない",
      "text": "詩吟の段位・資格は、各流派・団体がそれぞれ独自に定めているもので、剣道や書道のような全国統一の基準は存在しない。詩吟の流派・団体は全国に多数あり、名称・基準・昇段にかかる年数はそれぞれ異なる。したがって、ある流派の「五段」と別の流派の「五段」が同じ実力を意味するとは限らない点に注意が必要である。"
    },
    {
      "heading": "おおまかな枠組み",
      "text": "細かな運用は流派で異なるが、多くの流派に共通して見られる枠組みとして、（1）技量の等級を示す「級位・段位（・伝位）」、（2）人に教える資格である「師範」などの指導者資格、（3）流派そのものを統率する「宗家・家元」といった立場、が挙げられる。段位が上がると「雅号」が授与・変更されたり、認定を示す「免状」が交付されたりする流派もある。"
    },
    {
      "heading": "流派ごとの違いを見くらべるには",
      "text": "師範になるまでの年数や、流派を統率する体制（宗家の世襲か法人の理事長制か）などの具体的な違いは、当辞典の「流派比較」の各トピック（「師範免許取得までの年数・道のり」「流派を統率する体制」など）で流派を対等に並べて確認できる。"
    }
  ],
  "fields": {
    "definition": "各流派・団体が独自に定める、詩吟の技量・指導資格の制度の総称。全国共通の基準はない。",
    "term_type": "制度"
  },
  "related_ids": [
    "dani-kyui-dani",
    "dani-shougou",
    "yougo-dan-i",
    "yougo-shihan",
    "taikai-danikyui-seido",
    "taikai-shihan-menkyo-seido"
  ],
  "sources": [
    {
      "title": "詩吟 - Wikipedia",
      "url": "https://ja.wikipedia.org/wiki/%E8%A9%A9%E5%90%9F",
      "accessed": "2026-07-12",
      "reliability": "community"
    },
    {
      "title": "本部の窓「何段まで？」資格認定についての回答 - 関西吟詩文化協会",
      "url": "http://www.kangin.or.jp/member/hiroba/list2.php?id=1068",
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
  "id": "dani-kyui-dani",
  "category": "dani",
  "title": "級位・段位・伝位のしくみ",
  "reading": "きゅうい・だんい・でんいのしくみ",
  "aliases": [
    "級と段の違い"
  ],
  "tags": [
    "段位",
    "級位",
    "伝位",
    "制度"
  ],
  "summary": "多くの流派で、入門後はまず「級位」から始まり、上達すると「段位」に進む。段の間に「伝位」を挟む流派もある。",
  "body": [
    {
      "heading": "級位と段位の進み方",
      "text": "武道や書道と同じく、詩吟でも下位の「級位」から始めて上位の「段位」へ進む流派が多い。級位は数字が小さくなるほど上位（例：4級→3級→…→1級）で、段位は数字が大きくなるほど上位（初段→二段→…）になるのが一般的である。入門者は級位から、あるいは流派によっては初段からスタートするなど、始まり方は流派で異なる。"
    },
    {
      "heading": "「伝位」を挟む流派",
      "text": "流派によっては、段位の途中に「伝位（でんい）」を組み込む体系をとる。例えば、初段・二段の後に初伝、三段・四段の後に中伝、さらに奥伝・皆伝・総伝…というように段と伝位を交互に置き、総伝を最高位とする例がある。伝位の名称（初伝・中伝・奥伝・皆伝・総伝など）や順序は流派によって異なる。"
    },
    {
      "heading": "最高位までの呼び方の例（諸説あり）",
      "text": "ある流派では、段位ごとに与えられる雅号の「号」を段階分けし、初段〜五段、六段・七段、八段・師範、九段、十段…のように区切って呼ぶ例もある。呼称・区切り方は流派独自であり、統一された規則はない。具体的な差は「流派比較」も参照。"
    }
  ],
  "fields": {
    "definition": "技量に応じて与えられる等級。多くは級位から段位へ進み、段の間に伝位を挟む流派もある。",
    "term_type": "制度"
  },
  "related_ids": [
    "dani-shikaku-gaisetsu",
    "dani-shoudan-shinsa",
    "yougo-dan-i",
    "taikai-danikyui-seido"
  ],
  "sources": [
    {
      "title": "詩吟 - Wikipedia",
      "url": "https://ja.wikipedia.org/wiki/%E8%A9%A9%E5%90%9F",
      "accessed": "2026-07-12",
      "reliability": "community"
    },
    {
      "title": "昇段規定 - 鳳珠流",
      "url": "https://ho-fu-ryu.webnode.jp/%E6%98%87%E6%AE%B5%E8%A6%8F%E5%AE%9A/",
      "accessed": "2026-07-12",
      "reliability": "community"
    },
    {
      "title": "詩吟披露の高校生は、所属流派の師範だった！ 小学生で始め、飛び級昇格も - まいどなニュース",
      "url": "https://www.hotosena.com/article/14496193/",
      "accessed": "2026-07-12",
      "reliability": "press"
    }
  ],
  "poem_ids": [],
  "video_ids": [],
  "performer_ids": [],
  "updated": "2026-07-12"
},
{
  "id": "dani-shoudan-shinsa",
  "category": "dani",
  "title": "昇段審査",
  "reading": "しょうだんしんさ",
  "aliases": [
    "昇段試験"
  ],
  "tags": [
    "段位",
    "審査",
    "制度"
  ],
  "summary": "上の級・段へ進むための審査。流派の会長・宗家などの前で実際に吟じて評価を受ける。受験できる間隔は段位が上がるほど長くなる傾向がある。",
  "body": [
    {
      "heading": "審査のようす",
      "text": "昇段・昇級するには、流派・地区連盟などが実施する昇段審査（昇段試験）を受ける。多くは流派の会長・宗家や審査員の前で、課題となる吟（課題吟）を実際に吟じて評価を受ける形をとる。合格すると上の段位・級位が認定され、流派によっては新しい雅号（号）が授与される。"
    },
    {
      "heading": "受験の間隔（流派により異なる）",
      "text": "受験できる間隔は流派によって異なるが、下位のうちは半年に一度ほど受けられ、初段以上は年に一度、さらに高段（六段前後以上）になると数年に一度、というように、段位が上がるほど間隔が長くなる例が報告されている。飛び級（飛び段）を認める流派もある。いずれも流派独自の運用であり、正確な条件は所属先に確認する必要がある。"
    }
  ],
  "fields": {
    "definition": "上位の級・段へ進むために、実際に吟じて評価を受ける審査。",
    "term_type": "制度"
  },
  "related_ids": [
    "dani-kyui-dani",
    "dani-gagou",
    "taikai-danikyui-seido"
  ],
  "sources": [
    {
      "title": "祝？詩吟昇段審査の合格 - すぎもと整体院",
      "url": "http://sugimoto-seitai.com/%E7%A5%9D%EF%BC%9F%E8%A9%A9%E5%90%9F%E6%98%87%E6%AE%B5%E5%AF%A9%E6%9F%BB%E3%81%AE%E5%90%88%E6%A0%BC-890.html",
      "accessed": "2026-07-12",
      "reliability": "community"
    },
    {
      "title": "詩吟披露の高校生は、所属流派の師範だった！ 小学生で始め、飛び級昇格も - まいどなニュース",
      "url": "https://www.hotosena.com/article/14496193/",
      "accessed": "2026-07-12",
      "reliability": "press"
    }
  ],
  "poem_ids": [],
  "video_ids": [],
  "performer_ids": [],
  "updated": "2026-07-12"
},
{
  "id": "dani-shougou",
  "category": "dani",
  "title": "師範・宗家・家元などの称号",
  "reading": "しはん・そうけ・いえもとなどのしょうごう",
  "aliases": [
    "称号の違い"
  ],
  "tags": [
    "資格",
    "師範",
    "称号",
    "制度"
  ],
  "summary": "「師範」は人に教える資格、「宗家・家元」は流派そのものを統率する立場を指す、位置づけの異なる称号。",
  "body": [
    {
      "heading": "指導者の資格（師範など）",
      "text": "「師範」は、門人を指導する資格を持つ教授者を指す。多くの流派で、一定の段位・修練年数に達すると師範免許が取得できる。流派によっては師範代（指導補助）→準師範→師範のように段階が分かれ、その上に上師範・高師範・総師範・宗範などの称号を設ける団体もある。つまり師範系の称号は「教える資格の高さ」を表す。"
    },
    {
      "heading": "流派を統率する立場（宗家・家元）",
      "text": "一方、「宗家」「家元」は、流派そのものの正統を代表し、段位・免状の最終的な認定権を持つ流派の長を指す。宗家は創始者の系統を継ぐ当主を「○世宗家」のように呼ぶことが多く、家元とほぼ同じ意味で使われることもあるが、家系による継承を強調して使われる傾向がある。なお、流派のトップを世襲の宗家とするか、公益法人の理事長とするかは流派によって異なる（「流派比較」参照）。"
    },
    {
      "heading": "流派外の称号もある",
      "text": "以上は流派内部の称号だが、これとは別に、日本吟剣詩舞振興会の「少壮吟士」や日本コロムビアの「コロムビア吟士」のように、特定の流派に属さない横断的な称号も存在する。これらはコンクールなどを通じて認定される実力者の称号で、流派の段位とは別の系統にあたる。"
    }
  ],
  "fields": {
    "definition": "師範は指導資格、宗家・家元は流派を統率する立場を指す称号。",
    "term_type": "制度"
  },
  "related_ids": [
    "dani-shikaku-gaisetsu",
    "yougo-shihan",
    "yougo-souke",
    "yougo-iemoto",
    "taikai-shihan-menkyo-seido"
  ],
  "sources": [
    {
      "title": "本部の窓「何段まで？」資格認定についての回答 - 関西吟詩文化協会",
      "url": "http://www.kangin.or.jp/member/hiroba/list2.php?id=1068",
      "accessed": "2026-07-12",
      "reliability": "official"
    },
    {
      "title": "10年やると師範の免許が取得できます。 – 錦凰流 四世宗家 荒井龍凰",
      "url": "http://singingsamurai.com/2020/02/22/10年やると師範の免許が取得できます。/",
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
  "id": "dani-gagou",
  "category": "dani",
  "title": "雅号",
  "reading": "がごう",
  "aliases": [
    "吟名"
  ],
  "tags": [
    "資格",
    "段位",
    "称号"
  ],
  "summary": "流派から授与される、吟詠家としての名前。一定の修練や段位に応じて与えられ、昇段に伴って変わっていく流派もある。",
  "body": [
    {
      "heading": "雅号とは",
      "text": "雅号（吟名）は、流派から授与される吟詠家としての名前。ある流派では、一定期間の稽古を続けると雅号（芸名）が取得できるとされる。昇段審査に合格した際に新しい雅号が授与される流派もあり、段位・伝位が上がるごとに雅号に用いる文字が変わっていく慣習を持つ流派もある。"
    },
    {
      "heading": "付け方の例（流派により異なる）",
      "text": "付け方は流派独自で、例えば本人の姓名の一字に流派ゆかりの漢字一字を組み合わせる形や、段位の階梯ごとに雅号末尾・冒頭に決まった文字を冠する形などがある。どの段階で・どのような雅号が与えられるかは流派によって大きく異なり、統一された規則はない。段位ごとの雅号の変化のしかたを流派間で見くらべる例は「流派比較」でも扱っている。"
    }
  ],
  "fields": {
    "definition": "流派から授与される吟詠家としての名。段位に応じて変わる流派もある。",
    "term_type": "制度"
  },
  "related_ids": [
    "dani-shoudan-shinsa",
    "yougo-dan-i"
  ],
  "sources": [
    {
      "title": "1年以上継続すると芸名が取得できます。 – 錦凰流 四世宗家 荒井龍凰",
      "url": "http://singingsamurai.com/2020/02/25/1年以上継続すると芸名が取得できます。/",
      "accessed": "2026-07-12",
      "reliability": "community"
    },
    {
      "title": "昇段規定 - 鳳珠流",
      "url": "https://ho-fu-ryu.webnode.jp/%E6%98%87%E6%AE%B5%E8%A6%8F%E5%AE%9A/",
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
  "id": "dani-menjo",
  "category": "dani",
  "title": "免状（免許状）",
  "reading": "めんじょう（めんきょじょう）",
  "aliases": [
    "免許状"
  ],
  "tags": [
    "資格",
    "師範",
    "制度"
  ],
  "summary": "段位や師範資格の認定を証する証書。流派・団体が審査・推薦を経て認定・授与する。",
  "body": [
    {
      "heading": "免状とは",
      "text": "免状（免許状）は、詩吟の段位や師範などの資格に達したことを証する証書。流派・団体が独自に発行するもので、例えば関西吟詩文化協会の説明では、研修年数と修得した教本数に応じて昇段審査を行い、各会会長の推薦を経て総本部が認定して授与する、という流れが示されている。師範資格の場合は「師範免許」として交付される。"
    },
    {
      "heading": "留意点",
      "text": "免状の名称・様式・交付の条件は流派によって異なり、全国共通の様式や効力があるわけではない。ある流派の免状が他流派でそのまま通用するとは限らない。正確な取得条件は所属する流派・教室に確認する必要がある。"
    }
  ],
  "fields": {
    "definition": "段位・師範資格の認定を証する、流派発行の証書。",
    "term_type": "制度"
  },
  "related_ids": [
    "dani-shougou",
    "yougo-shihan",
    "taikai-shihan-menkyo-seido"
  ],
  "sources": [
    {
      "title": "本部の窓「何段まで？」資格認定についての回答 - 関西吟詩文化協会",
      "url": "http://www.kangin.or.jp/member/hiroba/list2.php?id=1068",
      "accessed": "2026-07-12",
      "reliability": "official"
    },
    {
      "title": "10年やると師範の免許が取得できます。 – 錦凰流 四世宗家 荒井龍凰",
      "url": "http://singingsamurai.com/2020/02/22/10年やると師範の免許が取得できます。/",
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
