// ===== 詩吟大辞典 データ：装束・道具 =====
// このファイルの編集方法は README.md を参照してください。
// 項目は window.SHIGIN_DAIJITEN.entries に追記されます（読み込み順に依存しません）。
//
// 1項目は次の形のオブジェクトです：
//   id        … 全カテゴリで重複しない識別子（このカテゴリは "dougu-" で始めます）
//   category  … "dougu" 固定
//   title/reading/aliases/tags … 見出し・よみ・別名・タグ
//   summary   … 一覧カードに出る短い説明
//   body      … [{ heading, text }] の配列（本文。text 内の改行 \n は <br> になります）
//   fields    … くわしい情報の表（difficulty / skill_type などのキー）
//   related_ids … 関連項目の id（実在する id のみ表示されます）
//   sources   … [{ title, url, accessed, reliability }]（reliability は official/press/community/uncertain）
//
// ※ 事実と異なる情報は書かないこと。不確かな点は本文に「流派により異なる」「要確認」等を明記し、
//   出典の reliability を uncertain / community にしてください。

window.SHIGIN_DAIJITEN = window.SHIGIN_DAIJITEN || { entries: [] };
window.SHIGIN_DAIJITEN.entries.push(
{
  "id": "dougu-butai-ishou",
  "category": "dougu",
  "title": "吟詠の舞台衣装",
  "reading": "ぎんえいのぶたいいしょう",
  "aliases": [
    "詩吟の服装",
    "発表会の衣装"
  ],
  "tags": [
    "装束",
    "服装",
    "舞台",
    "マナー"
  ],
  "summary": "発表会・大会で吟じる際の服装。現代は和装（着物・袴）が主流だが、まず「服装が芸を邪魔しないこと」が第一とされる。",
  "body": [
    {
      "heading": "基本の考え方",
      "text": "日本吟剣詩舞振興会の解説では、舞台衣装は「心の晴れ着」であり、まず「服装が芸を邪魔をしないこと」が第一とされる。演奏者は「無」であり「芸」だけが舞台に存在するという謙虚さが求められる一方で、積極的に芸を引き立たせるための衣装の工夫も必要とされている。"
    },
    {
      "heading": "男性・女性の服装",
      "text": "男性は黒紋付に袴が圧倒的とされるが、黒に限らず節度をもって色・柄やネクタイを選ぶこともでき、襦袢の衿の色の工夫でも効果を上げられるとされる。女性は現代では和服が主流で、色・柄・模様の着物や帯、帯締め・衿を組み合わせて選ぶ。祝儀曲では黒留袖・色留袖・色無地、教訓詩などでは寒色系の地味なもの、というように吟題（詩の内容）に合わせて色柄を選ぶ考え方が示されている。ただし発表会・大会の規模や流派によって求められる装いは異なる。"
    },
    {
      "heading": "初心者・ふだんの稽古では",
      "text": "教室でのふだんの稽古や規模の小さい発表会では、スーツなど通勤用の服や学生服で臨む例も多いとされる。着物は必須ではなく、大きな大会や重要な発表の場ほど袴・着物などの正装が用いられる傾向がある（流派・大会により異なる）。"
    }
  ],
  "fields": {
    "guide_type": "服装・マナー"
  },
  "related_ids": [
    "dougu-sensu",
    "dougu-goukin-soroi",
    "dougu-hatsu-soroeru"
  ],
  "sources": [
    {
      "title": "吟剣詩舞の衣装を考える 2020年2月 - 日本吟剣詩舞振興会",
      "url": "https://www.ginken.or.jp/index.php/reading_content/reading_content-1575/",
      "accessed": "2026-07-12",
      "reliability": "official"
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
},
{
  "id": "dougu-sensu",
  "category": "dougu",
  "title": "扇（末広）",
  "reading": "おうぎ（すえひろ）",
  "aliases": [
    "扇子",
    "末広"
  ],
  "tags": [
    "道具",
    "装束",
    "所作"
  ],
  "summary": "和装で吟じる際に携える扇。吟詠では所作・礼装の一部として持ち、扇を使って舞う詩舞の「舞扇」とは役割が異なる。",
  "body": [
    {
      "heading": "吟詠で携える扇",
      "text": "吟剣詩舞の解説によれば、和装で吟詠する場合には扇を携帯することが定められており、男性は九寸、女性は七寸程度の扇を携える。男性は扇の骨をまとめる釘（要）の部分を押さえるように持ち、斜め下・45度の角度に向けて持つよう指導されるとされる。女性は帯に差して吟詠するとされる。祝いの席で用いる縁起物の扇を「末広」と呼び、末広がりの形から吉事に用いられる。"
    },
    {
      "heading": "詩舞の「舞扇」との違い",
      "text": "同じ扇でも、吟詠に合わせて舞う詩舞では日本舞踊と同様の「舞扇」を使い、扇を傘・手綱・笛などに見立てて演じる（見立て振り）。舞扇は投げたり指で挟んで回す「要返し」などを行うため、要の部分に鉛の重りが仕込まれているのが特徴とされる。つまり、詩吟（吟じる人）が携える扇はおもに礼装・所作のためのもの、詩舞（舞う人）の舞扇は表現の道具、という違いがある。"
    }
  ],
  "fields": {
    "guide_type": "道具"
  },
  "related_ids": [
    "dougu-butai-ishou"
  ],
  "sources": [
    {
      "title": "吟剣詩舞の衣装と小道具／ホームメイト",
      "url": "https://www.touken-world.jp/tips/21616/",
      "accessed": "2026-07-12",
      "reliability": "community"
    },
    {
      "title": "２分３０秒の芸術〜「詩舞（しぶ）」を知る | 和ものびと",
      "url": "https://www.wamonobito.com/article/265/",
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
  "id": "dougu-goukin-soroi",
  "category": "dougu",
  "title": "合吟・連吟のそろいの装い",
  "reading": "ごうぎん・れんぎんのそろいのよそおい",
  "aliases": [
    "そろいの衣装"
  ],
  "tags": [
    "装束",
    "服装",
    "舞台",
    "合吟"
  ],
  "summary": "複数人で吟じる合吟・連吟では、衣装をそろえて統一感を出すことが大切とされる。",
  "body": [
    {
      "heading": "統一感を大切にする",
      "text": "複数人で声をそろえて吟じる合吟などでは、「おそろい」による統一感が大切とされる。日本吟剣詩舞振興会の解説では、男性はほとんどが黒紋付で衿を白またはグレーで統一し、女性は流派そろいの着物を活用するとされる。人数が少ない場合は、あえて色ちがいの着物を組み合わせて舞台効果を高めることもあるという。"
    },
    {
      "heading": "留意点",
      "text": "そろいの装いの具体的な決まりは流派・団体や大会によって異なる。所属する会がそろいの着物や衿の色を定めていることもあるため、合吟に出る際は指導者や所属団体に確認するのがよい。"
    }
  ],
  "fields": {
    "guide_type": "服装・マナー"
  },
  "related_ids": [
    "dougu-butai-ishou"
  ],
  "sources": [
    {
      "title": "吟剣詩舞の衣装を考える 2020年2月 - 日本吟剣詩舞振興会",
      "url": "https://www.ginken.or.jp/index.php/reading_content/reading_content-1575/",
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
  "id": "dougu-butai-mic",
  "category": "dougu",
  "title": "大会・発表会の舞台と道具",
  "reading": "たいかい・はっぴょうかいのぶたいとどうぐ",
  "aliases": [
    "スタンドマイク"
  ],
  "tags": [
    "道具",
    "舞台",
    "大会"
  ],
  "summary": "詩吟の大会の舞台は、多くの場合スタンドマイク1本のみというシンプルなもの。大道具・小道具はほとんど使わない。",
  "body": [
    {
      "heading": "舞台のようす",
      "text": "詩吟の大会では、ステージの真ん中にスタンドマイクが1本立っているだけというのが一般的とされる。出場者は舞台袖から歩み出て一礼し、1分半～2分ほど吟じてまた一礼して下がる、という進行が多い。演劇のような大道具は使わず、吟じる人が持つのは（和装であれば）扇程度で、道具の少なさが詩吟の特徴の一つといえる。"
    },
    {
      "heading": "見台・譜面について",
      "text": "大会の本番では、暗記した詩を見台や譜面に頼らず吟じるのが基本とされることが多い。ただし、見台（譜面台）や譜面を舞台上でどこまで用いてよいかは大会・流派の規定によって異なる可能性があり、本調査では統一されたルールを確認できなかった（要確認）。出場する大会の要項や指導者に確認するのが確実である。"
    }
  ],
  "fields": {
    "guide_type": "道具"
  },
  "related_ids": [
    "dougu-butai-ishou",
    "bansou-conductor-bansou"
  ],
  "sources": [
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
},
{
  "id": "dougu-hatsu-soroeru",
  "category": "dougu",
  "title": "初心者が最初に用意するもの",
  "reading": "しょしんしゃがさいしょによういするもの",
  "aliases": [],
  "tags": [
    "道具",
    "初心者",
    "教室"
  ],
  "summary": "詩吟は道具が少なく、始めるのに必要なのは教本と筆記用具程度。着物などは入門時点では必須でないことが多い。",
  "body": [
    {
      "heading": "まず必要なもの",
      "text": "詩吟は他の和の稽古事に比べて道具を揃える費用がかかりにくく、始めやすい習い事とされる。入門時にまず必要になるのは、流派・教室の教本（吟譜）と、アクセントや節を書き込むための筆記用具程度であることが多い。着物や扇は発表会・大会に出るようになってから用意する場合が多く、入門の時点では必須でないことが多い。"
    },
    {
      "heading": "あると役立つもの",
      "text": "音取り・音程練習のために、コンダクターやスマートフォンのアプリ（「吟トレ」など）があると自宅練習に役立つとされる。必要な持ち物は流派・教室によって異なるため、体験や入会の際に確認するのがよい。"
    }
  ],
  "fields": {
    "guide_type": "道具",
    "checklist": [
      "流派・教室の教本（吟譜）",
      "筆記用具（アクセント・節の書き込み用）",
      "音取り用のコンダクターまたはアプリ（あると便利）"
    ]
  },
  "related_ids": [
    "dougu-butai-ishou",
    "bansou-onsource-nyushu",
    "gihou-conductor"
  ],
  "sources": [
    {
      "title": "詩吟の趣味教室一覧 | 趣味なび",
      "url": "https://coto.shuminavi.net/schools/category/tradition/shigin",
      "accessed": "2026-07-12",
      "reliability": "community"
    },
    {
      "title": "詩吟の音階とは？音取りはアプリ「吟トレ」が便利 | ナチュラル詩吟教室",
      "url": "https://natural-shigin.com/column/gintore",
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
