# 全国詩吟イベントナビの更新

公開ページは `/events/`。正本は `events/events.json`、表示は `scripts/events/render.py` で生成する。

1. `events/events.json` の催事を更新する。既存IDは変更しない。
2. `python scripts/events/render.py` を実行する。
3. `python scripts/events/check.py`、`node scripts/events/check-ui.cjs` を実行する。
4. ページ本体、データ、必要なスタイル・スクリプトを同じ更新として扱う。公開は既存のCloudflare Pages運用に従う。

## 観覧と出場を区別する

- `admission` / `fee_status` は**観覧料**。出場参加費を入れない。観覧料が不明なら `admission: null`、`fee_status: "unknown"`。
- `fee_status` は `paid` / `free` / `unknown`。
- `audience` は `open`（一般向け観覧案内あり）、`contact`（非会員の申込・問い合わせ窓口あり）、`restricted`（関係者のみ）、`unknown`（不明）。有料・無料だけを根拠に見学可を推定しない。
- `audience_note` は来場者向けの案内、`audience_basis` は確認資料または運営者が判断した理由を残す。運営者判断で変更する場合はその日付と根拠を記録する。
- 開場・開演・終演予定は `open_time` / `start_time` / `end_time`（24時間表記）。不明は `null`。
- 開催日と開催県に不整合がある催事は、解消してから追加する。

## 出典・地図・日時

- `sources` に資料の名称、HTTPSのURL、主催者／会場／参加団体等の種類を残す。主催者の公開X・Facebook投稿も登録できる。投稿者が主催者かを確かめ、転載投稿だけで確定しない。
- Googleマップには県・市・会場名（住所が分かる場合は住所）を渡す。未確認の座標やPlace IDを作らない。
- 画面の「これから／過去」は閲覧時の日本時間で自動分類する。これは情報収集の自動更新ではない。`updated_at` と `checked_at` は実際に確認した日付に限って更新する。
- 開催予定の終了時刻が不明なため、開催当日は終日「本日の予定」と表示する。
- 調査時の確認待ち8件は公開データへ取り込んでいない。調査原本は `output/research/shigin-events-2026-09-16`（ポータルリポジトリの外）。

## 表示とナビゲーション

`page.template.html` と `events/events.css` / `events/events.js` がページ構成。共通ヘッダー・フッターは `tools/index.html` の共有マーカー内を生成時に取り込む。データ取得通信をせず、生成済みHTMLを絞り込むため、JavaScript無効時にも全件の本文と外部リンクを読める。

### 地図・カレンダー

- 地図の色は「今後の予定あり／過去のみ／未掲載」。全国大会も開催県に数える。未掲載は開催なしを意味しない。
- 県を選ぶと地域タブへ切り替わる。今後の予定があれば直近の月、過去の情報だけなら最後に掲載した月を表示する。県名のセレクトでも同じ操作ができる。
- カレンダーは選択県の全国大会・地域催事を掲載。日付か「この月の一覧」を選ぶと期間を「すべて」にして、過去の日付も正しく表示する。月を動かすと、適用中の日付条件も移動先の月全体へ切り替える。
- URLの `view`、`period`、`prefecture`、`date`（日または月）、`month` を復元。日付の妥当性と掲載範囲を検証する。
- 月の下の短い一覧は3件まで。当月に今後の予定があれば優先し、それ以外は過去の催事を表示する。
- 地図素材は `assets/maps/README.md` を参照。47都道府県の形状を使った簡略地図（CC0）。レンダー時は安全なパスだけを抽出する。
- 追加調査はリポジトリ外の `output/research/shigin-events-regions-2026-09-16`。2026-09-16の追加は27件、掲載県は25から36都道府県へ拡大。
