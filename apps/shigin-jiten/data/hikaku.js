// ===== 詩吟大辞典 データ：流派比較 =====
// このファイルの編集方法は README.md を参照してください。
// 比較トピックは window.SHIGIN_DAIJITEN.comparisons に格納されます（entries とは別配列）。
// school_id と related_entry_ids は、必ず実在する entry の id を指定してください。
// 1つのトピックには最低2つの流派を並べてください。

window.SHIGIN_DAIJITEN = window.SHIGIN_DAIJITEN || { entries: [] };
window.SHIGIN_DAIJITEN.comparisons = [
  {
    "id": "hikaku-shihan-nensuu",
    "topic": "師範免許取得までの年数・道のり",
    "reading": "しはんめんきょしゅとくまでのねんすう・みちのり",
    "aspect": "段位・称号",
    "summary": "師範になるまでの目安年数や段階の踏み方は流派によって大きく異なる。",
    "intro": "詩吟の師範免許は各流派・団体が独自に定める資格で、全国共通の基準はない。\n修行年数の目安や、師範に至るまでの段階の刻み方は、各流派が公表している情報からも差が見て取れる。",
    "schools": [
      {
        "school": "吟詠吟舞錦凰流",
        "school_id": "ryuha-kinouryu",
        "position": "入門から10年程度の修練で師範免許を取得できるとされる。四世宗家自身がブログで「10年やると師範の免許が取得できます」と説明している。",
        "sources": [
          {
            "title": "10年やると師範の免許が取得できます。 – 剣舞教室／詩吟教室【錦凰流 四世宗家 荒井龍凰】",
            "url": "http://singingsamurai.com/2020/02/22/10年やると師範の免許が取得できます。/",
            "accessed": "2026-07-11",
            "reliability": "community"
          }
        ]
      },
      {
        "school": "公益社団法人関西吟詩文化協会（公認華洲会）",
        "school_id": "ryuha-kansai-ginshi",
        "position": "初段から師範代（指導者資格）までを6年のカリキュラムで取得できるとし、その後さらに五段・準師範・六段・師範へと段階を踏んで進む運用を、協会公認の支部組織「華洲会」が自らの教室紹介ページで説明している。",
        "sources": [
          {
            "title": "定年後 お仕事以外での仲間作り 指導者養成コース",
            "url": "https://imagin-shigin.com/contents_51.html",
            "accessed": "2026-07-11",
            "reliability": "community"
          }
        ]
      },
      {
        "school": "公益社団法人日本詩吟学院（岳風会）",
        "school_id": "ryuha-gakufukai",
        "position": "初段から十段までの「段」に、初伝・中伝・奥伝・皆伝・総伝という「伝位」を組み合わせた14段階の体系を持つ。長崎岳風会の準師範を務める会員は自身のブログで、20数年間修行を続けても師範・正師範への到達は「生きている間には難しいかもしれない」と述べており、段階の多さから師範到達までに長期間を要する例があることがうかがえる（会員個人の体験談であり、公式に定められた必要年数を示すものではない点に注意）。",
        "sources": [
          {
            "title": "日本詩吟学院。岳風会。 - ここでトヨさん出番です！2023",
            "url": "https://kimieko0829heteml.wordpress.com/2017/07/26/%E6%97%A5%E6%9C%AC%E8%A9%A9%E5%90%9F%E5%AD%A6%E9%99%A2%E3%80%82%E5%B2%B3%E9%A2%A8%E4%BC%9A%E3%80%82/",
            "accessed": "2026-07-11",
            "reliability": "community"
          }
        ]
      }
    ],
    "common_note": "師範制度の基準は流派ごとに独自に運用されており、全国共通の年数基準は存在しない。",
    "related_entry_ids": [
      "yougo-shihan",
      "yougo-dan-i",
      "taikai-shihan-menkyo-seido",
      "taikai-danikyui-seido"
    ],
    "updated": "2026-07-11"
  },
  {
    "id": "hikaku-soshiki-touritsu",
    "topic": "流派を統率する体制（宗家世襲制か理事長制か）",
    "reading": "りゅうはをとうそつするたいせい（そうけせしゅうせいかりじちょうせいか）",
    "aspect": "段位・称号",
    "summary": "流派のトップに立つ仕組みが、家系による宗家の世襲か、法人としての理事長選任かで流派ごとに異なる。",
    "intro": "詩吟の流派・団体には、創始者の血筋・弟子筋が「宗家」を代々継承する体制と、公益法人として理事長を選任する体制の両方が存在する。\nいずれも段位や免状の認定に責任を持つ立場である点は共通するが、トップの選ばれ方・呼び方が異なる。",
    "schools": [
      {
        "school": "公益社団法人日本詩吟学院（岳風会）",
        "school_id": "ryuha-gakufukai",
        "position": "創始者・木村岳風の没後は世襲によらず、理事長職が笹川良一・笹川鎮江・河田和良・福井玲子・菅原道雄と継承され、現在は第6代理事長の真島岳元が務める公益社団法人としての運営体制をとる。",
        "sources": [
          {
            "title": "日本詩吟学院について",
            "url": "https://www.gakufukai.or.jp/know/about/",
            "accessed": "2026-07-11",
            "reliability": "official"
          }
        ]
      },
      {
        "school": "一般社団法人詩吟朗詠錦城会",
        "school_id": "ryuha-kinjoryu",
        "position": "流祖・山元錦城の後を継ぐ形で宗家が代々継承されており、現在4代目宗家は城戸城濤が務めている。",
        "sources": [
          {
            "title": "錦城会について",
            "url": "https://kinjoukai.or.jp/kinjoukai/about.html",
            "accessed": "2026-07-11",
            "reliability": "official"
          }
        ]
      },
      {
        "school": "吟道摂楠流",
        "school_id": "ryuha-setsunanryu",
        "position": "初代宗家・藤原摂楠（藤原六一）以来、公式サイトで「宗家制を護持しながら現在も総勢1700人超の会員を擁する」と説明されており、宗家制の継続を掲げている。",
        "sources": [
          {
            "title": "吟道摂楠流TOPページ",
            "url": "https://setsunanryuu.com/",
            "accessed": "2026-07-11",
            "reliability": "official"
          }
        ]
      },
      {
        "school": "吟詠吟舞錦凰流",
        "school_id": "ryuha-kinouryu",
        "position": "初代・松木錦凰から現在の四世宗家・荒井龍凰まで、代数を付した「○世宗家」という呼び方で継承者を呼ぶ。",
        "sources": [
          {
            "title": "流派とは何か。 – 剣舞教室／詩吟教室【錦凰流 四世宗家 荒井龍凰】",
            "url": "http://singingsamurai.com/2020/02/14/流派とは何か。/",
            "accessed": "2026-07-11",
            "reliability": "community"
          }
        ]
      }
    ],
    "common_note": "宗家制・理事長制のいずれであっても、段位・免状の最終的な認定に流派トップが関わる点は共通する。",
    "related_entry_ids": [
      "yougo-souke",
      "yougo-iemoto",
      "yougo-ryuha"
    ],
    "updated": "2026-07-11"
  },
  {
    "id": "hikaku-ginshikensha-seido",
    "topic": "「吟士権者」という称号の運用の違い",
    "reading": "ぎんしけんしゃというしょうごうのうんようのちがい",
    "aspect": "段位・称号",
    "summary": "同じ「吟士権者」という呼称でも、団体によって認定の仕組みが異なる。",
    "intro": "「吟士権者」は指導者級の実力者に贈られる称号だが、特定の流派に固有の言葉ではなく、複数の団体がそれぞれ独自の基準で運用している。\n日本吟道学院自身も、この言葉が他団体でも使われていることを踏まえ、認定基準・審査方法は団体ごとに異なる点に注意を呼びかけている。",
    "schools": [
      {
        "school": "公益社団法人関西吟詩文化協会",
        "school_id": "ryuha-kansai-ginshi",
        "position": "「関西吟詩全国指導者級吟士権者決定大会」という全国大会を毎年（おおむね12月ごろ）開催し、そこでの成績によって指導者級の「吟士権者」を決定する運用をとる。",
        "sources": [
          {
            "title": "大会速報 - 公益社団法人関西吟詩文化協会",
            "url": "http://www.kangin.or.jp/about/tournament/",
            "accessed": "2026-07-11",
            "reliability": "official"
          }
        ]
      },
      {
        "school": "公益社団法人日本吟道学院",
        "school_id": "ryuha-gindogakuin",
        "position": "「吟道の普及のため、切磋琢磨による魅力ある吟詠を目指して」創設した独自の称号制度で、平成10年（1998年）からコンクールを実施して認定者を輩出している。具体的な認定基準・審査方法は公式サイトに明記されておらず、公式に「団体ごとに認定基準・審査方法は異なるため、一律に理解しないよう注意が必要」と説明している。",
        "sources": [
          {
            "title": "日本吟道吟士権者歴代認定者 - 日本吟道学院",
            "url": "https://www.gindoh.jp/certification.html",
            "accessed": "2026-07-11",
            "reliability": "official"
          }
        ]
      }
    ],
    "common_note": "少壮吟士（日本吟剣詩舞振興会）やコロムビア吟士（日本コロムビア）のように、特定の流派に属さない横断的な称号も別に存在する。",
    "related_entry_ids": [
      "taikai-kangin-shidosha-ginshiken-taikai",
      "taikai-gindogakuin-ginshikensha",
      "yougo-shihan"
    ],
    "updated": "2026-07-11"
  },
  {
    "id": "hikaku-gagou-henka",
    "topic": "雅号の変化のしかた",
    "reading": "がごうのへんかのしかた",
    "aspect": "段位・称号",
    "summary": "個人の雅号が段位に応じて変わる流派と、宗家の代替わりを代数で呼ぶことに重点を置く流派とがある。",
    "intro": "詩吟の世界での「雅号」の扱いは、会員個人の雅号が段位・伝位に応じて変わっていく場合と、流派のトップである宗家の継承代数を数える場合とがあり、同じ「雅号」という言葉でも指すものの重点が異なることがある。",
    "schools": [
      {
        "school": "公益社団法人日本詩吟学院（岳風会）",
        "school_id": "ryuha-gakufukai",
        "position": "会員個人の雅号が伝位の進級ごとに変わっていく。長崎岳風会の準師範を務める会員の記述によれば、初伝で雅号末尾に「泉」、中伝で「山」、奥伝で「風」、皆伝で「岳」を付し、最高位の総伝では雅号の頭に「岳」を冠する慣習があるという（会員本人による記述で、公式な規定文書は確認できていない）。",
        "sources": [
          {
            "title": "日本詩吟学院。岳風会。 - ここでトヨさん出番です！2023",
            "url": "https://kimieko0829heteml.wordpress.com/2017/07/26/%E6%97%A5%E6%9C%AC%E8%A9%A9%E5%90%9F%E5%AD%A6%E9%99%A2%E3%80%82%E5%B2%B3%E9%A2%A8%E4%BC%9A%E3%80%82/",
            "accessed": "2026-07-11",
            "reliability": "community"
          }
        ]
      },
      {
        "school": "吟詠吟舞錦凰流",
        "school_id": "ryuha-kinouryu",
        "position": "会員個人の雅号変化よりも、流派トップである宗家の継承代数を「四世宗家」のように付して呼ぶ慣習が中心になっている。",
        "sources": [
          {
            "title": "流派とは何か。 – 剣舞教室／詩吟教室【錦凰流 四世宗家 荒井龍凰】",
            "url": "http://singingsamurai.com/2020/02/14/流派とは何か。/",
            "accessed": "2026-07-11",
            "reliability": "community"
          }
        ]
      }
    ],
    "common_note": "",
    "related_entry_ids": [
      "yougo-souke",
      "yougo-dan-i",
      "yougo-shihan"
    ],
    "updated": "2026-07-11"
  },
  {
    "id": "hikaku-gaibu-shougou",
    "topic": "流派内の頂点を極めるか、外部団体の称号を目指すか",
    "reading": "りゅうはないのちょうてんをきわめるか、がいぶだんたいのしょうごうをめざすか",
    "aspect": "段位・称号",
    "summary": "流派独自の最高位を頂点とする流派と、日本吟剣詩舞振興会や日本コロムビアなど外部団体の称号を会員の実績としてアピールする流派がある。",
    "intro": "詩吟の「称号」には、流派内部で完結する段位・伝位の最高位と、日本吟剣詩舞振興会の「少壮吟士」や日本コロムビアの「コロムビア吟士」のように流派の枠を超えた外部団体の称号の2種類がある。会員の実績としてどちらを前面に出すかは流派によって異なる。",
    "schools": [
      {
        "school": "淡窓伝光霊流",
        "school_id": "ryuha-koreiryu",
        "position": "公式サイトで、会員の中に「コロムビア吟士や吟界最高峰の称号である少壮吟士も在籍」していることを紹介しており、流派外部の横断的な称号を持つ会員の存在を実績としてアピールしている。",
        "sources": [
          {
            "title": "淡窓伝光霊流 公式サイト",
            "url": "http://www.koreiryu.com/",
            "accessed": "2026-07-11",
            "reliability": "official"
          }
        ]
      },
      {
        "school": "公益社団法人日本詩吟学院（岳風会）",
        "school_id": "ryuha-gakufukai",
        "position": "流派内部の段位・伝位の最高位である「総伝」を頂点とする独自の序列を持つ（会員本人の記述による）。外部団体の称号との関係を強調する説明は今回確認できなかった。",
        "sources": [
          {
            "title": "日本詩吟学院。岳風会。 - ここでトヨさん出番です！2023",
            "url": "https://kimieko0829heteml.wordpress.com/2017/07/26/%E6%97%A5%E6%9C%AC%E8%A9%A9%E5%90%9F%E5%AD%A6%E9%99%A2%E3%80%82%E5%B2%B3%E9%A2%A8%E4%BC%9A%E3%80%82/",
            "accessed": "2026-07-11",
            "reliability": "community"
          }
        ]
      }
    ],
    "common_note": "少壮吟士・コロムビア吟士は特定の流派に属さない横断的な称号であり、複数の流派の会員が対象になり得る。",
    "related_entry_ids": [
      "taikai-nihon-columbia-zenkoku-ginei-concours",
      "yougo-dan-i"
    ],
    "updated": "2026-07-11"
  },
  {
    "id": "hikaku-setchou-manabikata",
    "topic": "節調の学習アプローチの違い",
    "reading": "せっちょうのまなびかたのちがい",
    "aspect": "節調・吟法",
    "summary": "節調をどう体系化し、どのくらいの期間で習得できるとしているかは流派によって大きく異なる。",
    "intro": "節調（節回し）の複雑さや、それを学ぶまでの想定期間は流派ごとに違いがある。少数のパターンに整理して短期間での習得を掲げる流派もあれば、段階を踏んで長期にわたり体得していく流派もある。",
    "schools": [
      {
        "school": "泉心流",
        "position": "節調の型を31種類に整理し、ふりがな付きの一巻の教本とお手本CDを使って、練習を重ねるうちに自然に31種類の節調が身につくとする学習法を掲げている。",
        "sources": [
          {
            "title": "独創的な吟 - 泉心流",
            "url": "https://sigin.jimdofree.com/%E7%8B%AC%E5%89%B5%E7%9A%84%E3%81%AA%E5%90%9F/",
            "accessed": "2026-07-11",
            "reliability": "community"
          }
        ]
      },
      {
        "school": "特定非営利活動法人日本國風流詩吟吟舞会",
        "school_id": "ryuha-nihon-kokufu",
        "position": "音符で節調を表現した「節調集」を整備しており、公式サイトでは入門半年程度で初歩の吟詠ができるようなカリキュラムになっていると説明している。",
        "sources": [
          {
            "title": "詩吟",
            "url": "https://nihonkokufu.jp/shigin/",
            "accessed": "2026-07-11",
            "reliability": "official"
          }
        ]
      },
      {
        "school": "公益社団法人日本詩吟学院（岳風会）",
        "school_id": "ryuha-gakufukai",
        "position": "初段から総伝まで14段階の段位・伝位を段階的に修練していく体系をとり、最高位への到達には長期間を要する例があるとされる（会員個人の記述による）。",
        "sources": [
          {
            "title": "日本詩吟学院。岳風会。 - ここでトヨさん出番です！2023",
            "url": "https://kimieko0829heteml.wordpress.com/2017/07/26/%E6%97%A5%E6%9C%AC%E8%A9%A9%E5%90%9F%E5%AD%A6%E9%99%A2%E3%80%82%E5%B2%B3%E9%A2%A8%E4%BC%9A%E3%80%82/",
            "accessed": "2026-07-11",
            "reliability": "community"
          }
        ]
      }
    ],
    "common_note": "",
    "related_entry_ids": [
      "gihou-fushimawashi",
      "yougo-dan-i",
      "gihou-yuri"
    ],
    "updated": "2026-07-11"
  },
  {
    "id": "hikaku-tajanru-yugo",
    "topic": "他の芸能・楽器との融合のしかた",
    "reading": "たじゃんるげいのう・がっきとのゆうごうのしかた",
    "aspect": "節調・吟法",
    "summary": "伝統的な詩吟に他の芸能・楽器をどう取り入れるかは流派によって様々な工夫がある。",
    "intro": "詩吟は本来、無伴奏の素読に節調を加えた芸能だが、流派によっては琵琶・謡曲・オーケストラ・ピアノなど他の芸能や楽器を積極的に取り入れ、独自色を打ち出している例がある。",
    "schools": [
      {
        "school": "特定非営利活動法人日本國風流詩吟吟舞会",
        "school_id": "ryuha-nihon-kokufu",
        "position": "漢詩を題材にした吟詠に加え、近代詩、錦心流琵琶の語りを取り入れたものや、歌舞伎に題材を求めた物語的な吟詠なども創作している。",
        "sources": [
          {
            "title": "活動内容",
            "url": "https://nihonkokufu.jp/information/",
            "accessed": "2026-07-11",
            "reliability": "official"
          }
        ]
      },
      {
        "school": "泉心流",
        "position": "謡曲・琵琶・民謡・唱歌・叙情歌・歌謡曲などを詩吟に融合させ、ピアノとの協奏やスクリーン映像との組み合わせなど「新しい時代の詩吟」への試みを行っているとする。",
        "sources": [
          {
            "title": "泉心流 (sigin.jimdofree.com)",
            "url": "https://sigin.jimdofree.com/",
            "accessed": "2026-07-11",
            "reliability": "community"
          }
        ]
      },
      {
        "school": "日本樽美流吟詠会",
        "school_id": "ryuha-tarumiryu",
        "position": "公式サイトで「琴や尺八、オーケストラなどを伴奏としたり、剣舞や詩舞と合わせて吟じられることもあります」と紹介しており、オーケストラ伴奏や剣舞・詩舞との組み合わせを特色の一つとしている。",
        "sources": [
          {
            "title": "日本樽美流吟詠会総本部",
            "url": "https://www.tarumiryu-shigin.jp/",
            "accessed": "2026-07-11",
            "reliability": "official"
          }
        ]
      }
    ],
    "common_note": "琴・尺八による伴奏そのものは詩吟全般で広く行われる一般的な形態であり（yougo-hougaku-bansou参照）、ここに挙げた例はそれに加えて各流派が独自に取り入れている要素である。",
    "related_entry_ids": [
      "yougo-hougaku-bansou",
      "ryuha-kimura-gakufu-kei"
    ],
    "updated": "2026-07-11"
  },
  {
    "id": "hikaku-tokui-bunya",
    "topic": "得意とする吟の傾向の違い",
    "reading": "とくいとするぎんのけいこうのちがい",
    "aspect": "節調・吟法",
    "summary": "長編漢詩の吟詠に定評がある流派もあれば、節調を少数の型に整理してシンプルさを重視する流派もある。",
    "intro": "同じ詩吟でも、流派によって得意とする吟の傾向や重視する点は異なる。長い漢詩を多彩な節調で吟じることを得意とする流派もあれば、節調をあらかじめ少数の型に整理し、誰でも身につけやすくすることを重視する流派もある。",
    "schools": [
      {
        "school": "詩吟神風流",
        "school_id": "ryuha-shinpuryu",
        "position": "「決して単調ではない、多彩な節調」を特徴とし、「琵琶行」「長恨歌」など長編漢詩の符付けに定評があると公式サイトで紹介している。力強い気魄のある節調から情緒的な節調まで幅広く表現できることを魅力としている。",
        "sources": [
          {
            "title": "詩吟神風流 – ことばを吟じ こころを感じる 本流の詩吟を 伝え継ぐ",
            "url": "https://shigin-shinpuryu.com/",
            "accessed": "2026-07-11",
            "reliability": "official"
          }
        ]
      },
      {
        "school": "泉心流",
        "position": "節調の型を31種類に整理し、一巻の教本とお手本CDで習得できるようにする、分かりやすさを重視したアプローチをとる。",
        "sources": [
          {
            "title": "独創的な吟 - 泉心流",
            "url": "https://sigin.jimdofree.com/%E7%8B%AC%E5%89%B5%E7%9A%84%E3%81%AA%E5%90%9F/",
            "accessed": "2026-07-11",
            "reliability": "community"
          }
        ]
      }
    ],
    "common_note": "",
    "related_entry_ids": [
      "gihou-fushimawashi",
      "gihou-yuri"
    ],
    "updated": "2026-07-11"
  },
  {
    "id": "hikaku-kyouhon-kousei",
    "topic": "教本の構成の違い",
    "reading": "きょうほんのこうせいのちがい",
    "aspect": "教本・伴奏",
    "summary": "詩の型ごとに編まれた教本を持つ流派もあれば、独自の譜づけで分かりやすさを追求した一冊完結型の教本を持つ流派もある。",
    "intro": "詩吟の教本は流派ごとに独自に編纂されており、構成の考え方にも違いが見られる。",
    "schools": [
      {
        "school": "公益社団法人日本詩吟学院（岳風会）",
        "school_id": "ryuha-gakufukai",
        "position": "『吟詠教本 律詩・古体詩篇』のように、絶句・律詩・古体詩など詩の型ごとに編まれた教本を発行している。公式サイトの案内によれば、絶句以外の詩に親しんでもらうことを狙いとして、通常の教本に掲載されていない律詩・古体詩を厳選した教本も別途頒布されている。",
        "sources": [
          {
            "title": "『吟詠教本 律詩・古体詩篇（下）』教本の改訂及び新頒布CDのご案内 - 公益社団法人 日本詩吟学院",
            "url": "https://www.gakufukai.or.jp/category/koza/",
            "accessed": "2026-07-11",
            "reliability": "official"
          }
        ]
      },
      {
        "school": "一般社団法人詩吟朗詠錦城会",
        "school_id": "ryuha-kinjoryu",
        "position": "「錦城流独自の分かりやすい譜づけの教本」を使用し、持ちやすいサイズで作られた教本を用いて、個人指導を原則とした指導を行っている。",
        "sources": [
          {
            "title": "錦城会について",
            "url": "https://kinjoukai.or.jp/kinjoukai/about.html",
            "accessed": "2026-07-11",
            "reliability": "official"
          }
        ]
      },
      {
        "school": "泉心流",
        "position": "ふりがな付きの一巻の教本とお手本CDをセットで用い、練習を重ねる中で31種類の節調を自然に身につけられるようにしている。",
        "sources": [
          {
            "title": "独創的な吟 - 泉心流",
            "url": "https://sigin.jimdofree.com/%E7%8B%AC%E5%89%B5%E7%9A%84%E3%81%AA%E5%90%9F/",
            "accessed": "2026-07-11",
            "reliability": "community"
          }
        ]
      }
    ],
    "common_note": "",
    "related_entry_ids": [
      "gihou-ginpu",
      "gihou-sodoku"
    ],
    "updated": "2026-07-11"
  },
  {
    "id": "hikaku-bansou-gakki",
    "topic": "伴奏に使う楽器の幅の違い",
    "reading": "ばんそうにつかうがっきのはばのちがい",
    "aspect": "教本・伴奏",
    "summary": "尺八・琴を中心とした伴奏が一般的だが、オーケストラやピアノとの共演を特色とする流派もある。",
    "intro": "詩吟の伴奏は尺八・琴などの邦楽器を用いるのが一般的だが（yougo-hougaku-bansou参照）、流派によってはオーケストラやピアノなど洋楽器との共演を積極的に取り入れている例もある。",
    "schools": [
      {
        "school": "日本樽美流吟詠会",
        "school_id": "ryuha-tarumiryu",
        "position": "琴・尺八に加えてオーケストラとの伴奏を特色の一つとして公式サイトで紹介している。",
        "sources": [
          {
            "title": "日本樽美流吟詠会総本部",
            "url": "https://www.tarumiryu-shigin.jp/",
            "accessed": "2026-07-11",
            "reliability": "official"
          }
        ]
      },
      {
        "school": "泉心流",
        "position": "ピアノとの協奏や映像スクリーンとの組み合わせなど、伝統的な邦楽器の伴奏にとどまらない「新しい詩吟」への試みを行っているとする。",
        "sources": [
          {
            "title": "泉心流 (sigin.jimdofree.com)",
            "url": "https://sigin.jimdofree.com/",
            "accessed": "2026-07-11",
            "reliability": "community"
          }
        ]
      }
    ],
    "common_note": "尺八・琴による伴奏そのものは詩吟全般で広く用いられる一般的な形態である。",
    "related_entry_ids": [
      "yougo-hougaku-bansou",
      "gihou-conductor"
    ],
    "updated": "2026-07-11"
  },
  {
    "id": "hikaku-bumon-kubun",
    "topic": "コンクール部門の区分方法の違い",
    "reading": "こんくーるぶもんのくぶんほうほうのちがい",
    "aspect": "審査",
    "summary": "年齢によって部門を分ける大会もあれば、実力段階によって部門を分ける大会もある。",
    "intro": "詩吟のコンクールでは出場者を複数の部門に分けて審査するのが一般的だが、その分け方には年齢を基準にするものと、実力・段階を基準にするものがある。",
    "schools": [
      {
        "school": "公益財団法人日本吟剣詩舞振興会",
        "school_id": "ryuha-ginken-shinkokai",
        "position": "主催する全国吟詠コンクール・全国剣詩舞コンクールでは、幼年の部・少年の部・青年の部・一般一部・一般二部・一般三部という年齢による部門構成を採用している（年度により部門数・呼称が変わる場合がある）。",
        "sources": [
          {
            "title": "「令和4年度全国剣詩舞コンクール決勝大会」および「令和4年度全国吟詠コンクール決勝大会」を開催しました",
            "url": "https://www.ginken.or.jp/index.php/news/news-11853/",
            "accessed": "2026-07-11",
            "reliability": "official"
          }
        ]
      },
      {
        "school": "公益社団法人関西吟詩文化協会（公認華洲会）",
        "school_id": "ryuha-kansai-ginshi",
        "position": "傘下の華洲会が紹介する全国大会（全国中間層全国大会）では、「初級の部」「上級の部」のように実力段階による部門区分が用いられている。",
        "sources": [
          {
            "title": "（公益社団法人）関西吟詩文化協会 上級の部 今井紀子 全国大会 優勝",
            "url": "https://imagin-shigin.com/contents_104.html",
            "accessed": "2026-07-11",
            "reliability": "community"
          }
        ]
      }
    ],
    "common_note": "",
    "related_entry_ids": [
      "taikai-bumon-nenrei-kubun",
      "taikai-zenkoku-ginei-concours"
    ],
    "updated": "2026-07-11"
  }
];
