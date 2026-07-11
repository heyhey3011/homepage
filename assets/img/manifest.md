# 画像アセット一覧（詩吟ポータルサイト）

生成日: 2026-07-11
使用モデル: **fal-ai/nano-banana-2**（Google製）※フォールバック採用（下記「モデル選定について」参照）

## 共通アートディレクション

以下のベースプロンプトを全画像で共通利用し、各シーン説明を末尾に追加して生成しました。

```
Minimal modern Japanese sumi-e ink wash illustration on warm off-white washi paper
background (#F8F5EF), soft expressive brush strokes, matcha green (#B4D455) and muted
gold (#D8B25F) accent colors, featuring a cute round tuxedo cat character (a black and
white bicolor hachiware cat who loves shigin, traditional Japanese poetry recitation),
generous negative space, elegant, calm, welcoming, flat illustration, no text, no
letters, no watermark
```

## モデル選定について

1. まず `openai/gpt-image-2` の仕様を確認したところ、BYOK（利用者自身のOpenAI APIキーが別途必須）の仕様であることが判明し、今回のfal.aiキーのみでは利用不可でした。
2. 指示に従い `fal-ai/nano-banana-2`（Google Nano Banana 2）にフォールバックし、以降すべての画像をこのモデルで統一生成しました。BYOK不要、fal.aiキーのみで生成可能。
3. テスト生成1枚で和モダン・猫キャラの作風が期待通りだったため、そのまま全画像に採用しました。

## 画像一覧

| ファイル名 | サイズ | 用途 | 生成プロンプト（シーン部分） |
|---|---|---|---|
| `hero-main.webp` | 1536×1024 | トップページのヒーロー背景 | misty mountains and a golden sunrise, a tiny cat silhouette reciting poetry on a hilltop, generous negative space |
| `washi-texture.webp` | 1024×1024 | 和紙の背景テクスチャ（タイル用） | extreme close-up of blank warm off-white washi paper texture, subtle visible natural fiber texture and grain, no illustration, no motifs |
| `entrance-start.webp` | 1024×1024 | 「詩吟を始めたい」入口 | cat taking a first confident step forward onto a path, budding sprout and fresh green leaves, hopeful new beginning |
| `entrance-classroom.webp` | 1024×1024 | 「近くの教室を探したい」入口 | cat walking through a small stylized townscape, a map pin marker glowing above a building |
| `entrance-listen.webp` | 1024×1024 | 「よい吟を聴きたい」入口 | cat sitting with eyes closed, listening intently, concentric ink brush ripples like sound waves |
| `entrance-kanshi.webp` | 1024×1024 | 「漢詩を学びたい」入口 | cat peeking over an open classical scroll and calligraphy brush, abstract ink texture only, no readable characters |
| `entrance-analyze.webp` | 1024×1024 | 「自分の吟を分析したい」入口 | cat gazing at a flowing ink brush-stroke line resembling a pitch curve |
| `entrance-teach.webp` | 1024×1024 | 「指導に使いたい」入口 | teacher tuxedo cat instructing two kitten students |
| `map-section.webp` | 1536×1024 | 地図セクション | stylized map of Japan in ink wash, glowing pins, cat as friendly guide |
| `tool-map.webp` | 1536×1024 | 教室マップ機能 | close-up stylized map of Japan with glowing pins, elegant cartography |
| `tool-archives.webp` | 1536×1024 | 動画アーカイブ機能 | stage with microphone under spotlight, organized shelves with video reel motifs |
| `tool-shigin-dict.webp` | 1536×1024 | 詩吟用語辞典機能 | stack of layered dictionaries with silk bookmark ribbons, cat beside them |
| `tool-kanshi-dict.webp` | 1536×1024 | 漢詩辞典機能 | classical ink wash landscape scroll unrolling beside a minimal timeline motif |
| `tool-conductor.webp` | 1536×1024 | 指揮者機能 | cat standing as a conductor waving a baton, dynamic ink brush motion lines |
| `tool-pitchmap.webp` | 1536×1024 | 音程マップ機能 | single flowing ink brush stroke forming a pitch curve / waveform |
| `course-7days.webp` | 1536×1024 | 7日間講座 | cat hopping across seven stepping stones over calm water |
| `community.webp` | 1536×1024 | コミュニティセクション | five cats sitting together in a friendly circle, warmly chatting |
| `beginner-hero.webp` | 1536×1024 | 始め方ガイドのヘッダー | cat standing at the start of a path under a soft dawn sky glow |
| `ogp.jpg` | 1200×630 | OGP画像 | hero系の朝焼け・山水・猫のビジュアルに、Yu Mincho Demibold（明朝体）で「詩吟を、もっと探しやすく、学びやすく、続けやすく。」をPILで合成 |

## 補足

- `ogp.jpg` の日本語テキストは、AI生成に文字を描かせると崩れるリスクが高いため、テキストなしの背景画像をNano Banana 2で生成し、Python（Pillow）でシステムフォント「游明朝 Demibold」を使って確実に読める形で合成しました。
- 全画像とも1回の生成で問題なく採用（リトライなし）。品質チェックはReadツールで目視確認済み。
- 元のPNG（未加工・高解像度）はスクラッチパッド側に保存されており、リポジトリには最終のwebp/jpgのみを配置しています。

## v2（公式キャラクター準拠版）

追記日: 2026-07-11

サイト運営者の要望「猫は自分の公式キャラクターに似せてほしい」を受け、猫が登場する13点を
**公式キャラクター（`必要画像/吟ねこ.jpg`、YouTubeマスコットの吟猫）準拠**で作り直しました。

- 使用モデル: **fal-ai/nano-banana-2/edit**（画像編集エンドポイント）
- 生成方法: 公式アイコン `吟ねこ.jpg` をfalストレージにアップロードし、`image_urls` の参照画像として
  毎回渡した上で「参照画像のキャラクターの顔・ハチワレ模様・黒紋付・太いペン輪郭線・フラット塗りを
  忠実に維持し、シーンだけ変える」プロンプトで生成（テキストのみの代替ではなく参照画像方式）。
- 画風: 太い手描きペンの黒輪郭線＋フラット塗りのゆるかわマスコット風。背景は明るい生成り〜淡い黄緑
  ベースに抹茶グリーン（#B4D455）と金（#D8B25F）の差し色。文字なし。
- **v1ファイルはすべて削除せずそのまま残しています**（ファイル名末尾に `-v2` を付けて追加）。
  HTML/CSSの参照はv2に差し替え済み。
- 猫が登場しない6点（washi-texture / tool-map / tool-archives / tool-shigin-dict /
  tool-kanshi-dict / tool-pitchmap）はv1をそのまま継続使用。

### v2画像一覧

| ファイル名 | サイズ | シーン |
|---|---|---|
| `hero-main-v2.webp` | 1536×1024 | 丘の上で吟じる吟猫、霞と金の朝日 |
| `entrance-start-v2.webp` | 1024×1024 | 一歩を踏み出す吟猫、道と芽吹き |
| `entrance-classroom-v2.webp` | 1024×1024 | 地図ピンと街並み、教室を探して歩く吟猫 |
| `entrance-listen-v2.webp` | 1024×1024 | 目を閉じて聴き入る吟猫、音の波紋 |
| `entrance-kanshi-v2.webp` | 1024×1024 | 開いた巻物を覗き込む吟猫（読める文字なし） |
| `entrance-analyze-v2.webp` | 1024×1024 | 音程カーブの線を眺める吟猫 |
| `entrance-teach-v2.webp` | 1024×1024 | 教える吟猫先生と聞き入る小さい猫たち |
| `map-section-v2.webp` | 1536×1024 | 様式化した日本地図と抹茶色ピン、案内する吟猫 |
| `tool-conductor-v2.webp` | 1536×1024 | 指揮棒を振る吟猫の指揮者 |
| `course-7days-v2.webp` | 1536×1024 | 7つの飛び石を渡る吟猫 |
| `community-v2.webp` | 1536×1024 | 輪になって和やかに語らう吟猫と猫たち |
| `beginner-hero-v2.webp` | 1536×1024 | 朝焼けの道の起点に立つ吟猫 |
| `ogp-v2.jpg` | 1200×630 | 吟猫入り背景（キャラは右側）＋游明朝 Demiboldでキャッチコピーを Pillow 合成 |

### v2の生成メモ

- 13点中12点は1回の生成で採用。`entrance-listen-v2` のみ、初回生成で鼻が公式より大きく
  描かれたため1回再生成（「小さな点の鼻」を強調）して採用。合計生成回数14回。
- 品質チェックはReadツールで全点目視確認済み（ハチワレ模様・黒紋付・白丸紋・太い輪郭線・
  ピンクの舌の一貫性、構図破綻・文字混入なしを確認）。
