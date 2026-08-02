#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Google Sheets API v4 からメルマガ登録リスト（Googleフォームの回答シート）を集計し、
assets/data/list-summary.json を生成する。

⚠️ 個人情報の絶対ルール（最重要）:
- シートにはメールアドレス・お名前などの個人情報が入っている。
  このスクリプトが出力してよいのは **集計値（人数・日付）だけ**。
  セルの値は JSON にも標準出力（Actionsのログ）にも 1文字たりとも出さない。
- ログに出してよいのは「ヘッダー行の列名」「件数」「日付範囲」まで。
  （重複排除でもアドレスの値は出さず、除外した「件数」だけをログに出す）

人数の数え方:
- 同じ人が複数回登録することがあるため、メールアドレスで重複を除いた
  **ユニーク人数**を「人数」とする（total / added7 / added28 / daily すべて）。
- 同一アドレスが複数行ある場合は、最古の登録日をその人の登録日として数える。
- メールアドレスが空の行はユニーク判定できないため 1行=1人 として数える。
- メール列が見つからない場合は重複排除をスキップし、従来どおり行数で数える（警告を出す）。
- 処理順は「テスト行の除外 → 重複排除」。

設計方針（build_analytics_summary.py と同じ思想）:
- 認証情報（サービスアカウント鍵JSON・シートID）は環境変数からのみ受け取る。
  値はログに出さない（print しない / set -x しない）。
- API呼び出しに1つでも失敗したら例外を投げて異常終了する。
  その場合、既存の list-summary.json は書き換えない（前回値の保護）。
- データ行が0件のときも「異常」とみなして書き換えない。
- 成功時のみ、まるごと新しい内容でファイルを上書きする（isSample: false）。
- 依存を増やさないため google-api-python-client は使わず、
  google-auth + requests で REST（GET /v4/spreadsheets/...）を直接叩く。

必要な環境変数:
  GA4_SA_KEY     … サービスアカウントの鍵JSON（全文。GA4連携のものを流用）
  LIST_SHEET_ID  … スプレッドシートのID

集計の区切り:
- 「今日（日本時間）」までを対象にする。
  GA4集計は「昨日」までだが、スプレッドシートはGA4と違って当日分も完全に揃っている
  （未確定日によるデータ欠けが起きない）ため、当日の登録もその日のうちに反映する。
  こうすることで `total` と `daily` 末尾の `cumulative` が常に一致する。
  ※登録完了率（added7 ÷ GA4のmailmag_click d7）は分母側の窓が1日ずれるが、
    参考値としての率なので許容する（指示書 追記2 の判断）。
- 集計の開始日は LIST_START_DATE（メルマガ正式スタート日）。それより前の登録は数えない。

人数の数え方の全体像（処理順）:
  テスト行の除外 → メールアドレスでの重複排除 → 開始日フィルタ
"""

import json
import os
import re
import sys
from datetime import date, datetime, timedelta, timezone
from urllib.parse import quote

import requests
from google.oauth2 import service_account
from google.auth.transport.requests import Request as GoogleAuthRequest

API_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly"
OUTPUT_PATH = "assets/data/list-summary.json"

# 読みたいタブ名（この優先順で探す）。どれも無ければ先頭タブにフォールバックする。
PREFERRED_SHEET_TITLES = ["フォームの回答1", "フォームの回答 1", "Form_Responses"]

# 登録日として扱う列のヘッダー候補（部分一致・大文字小文字は無視）
DATE_HEADER_CANDIDATES = ["タイムスタンプ", "登録日", "日付", "timestamp", "date"]

# お名前列のヘッダー候補（テスト行の判定に使う）
NAME_HEADER_CANDIDATES = ["お名前"]

# メールアドレス列のヘッダー候補（重複排除に使う）
EMAIL_HEADER_CANDIDATES = ["メール", "mail"]

# お名前にこの文字列を含む行は運営者の動作確認なので全集計から除外する
TEST_ROW_MARKER = "テスト"

# 日本時間（シートのタイムスタンプがJST表記のため、日付の区切りもJSTで判定する）
JST = timezone(timedelta(hours=9))

# daily に出す日数
DAILY_DAYS = 28

# メルマガ正式スタート日。これより前の登録は集計対象外（total / added7 / added28 / daily すべて）。
# 重複排除後の「その人の登録日（＝最古の登録日）」で判定するため、
# スタート前に登録した人が後から再登録しても集計には入らない。
# 登録日が読み取れない人は判定できないので除外しない（従来どおり累計の底に含める）。
LIST_START_DATE = date(2026, 8, 1)

# スプレッドシートのシリアル値（1899-12-30 起点）を日付に戻すときの基準
SERIAL_EPOCH = date(1899, 12, 30)
SERIAL_MIN = 20000  # 1954年ごろ
SERIAL_MAX = 80000  # 2119年ごろ


def fail(message):
    """異常終了（ファイルは書き換えない）。認証情報やセルの値は出さない。"""
    print("::error::{}".format(message))
    sys.exit(1)


def get_access_token(sa_key_json):
    try:
        info = json.loads(sa_key_json)
    except (ValueError, TypeError):
        fail("サービスアカウント鍵JSONの形式が不正です（JSONとして読めません）。前回の値を維持します。")
    try:
        creds = service_account.Credentials.from_service_account_info(
            info, scopes=[API_SCOPE]
        )
        creds.refresh(GoogleAuthRequest())
    except Exception:
        # 例外メッセージに鍵の内容が混じらないよう、詳細は出さない
        fail("サービスアカウントの認証に失敗しました。鍵JSONの内容をご確認ください。前回の値を維持します。")
    return creds.token


def sheets_get(token, url, params):
    headers = {"Authorization": "Bearer {}".format(token)}
    try:
        resp = requests.get(url, headers=headers, params=params, timeout=60)
    except requests.RequestException:
        fail("Google Sheets APIへの接続に失敗しました。前回の値を維持します。")
    if resp.status_code != 200:
        # レスポンス本文にはシートの中身が混じる可能性があるため、ステータスだけを出す
        hint = ""
        if resp.status_code == 403:
            hint = "（サービスアカウントにシートが共有されているか / Sheets APIが有効かをご確認ください）"
        elif resp.status_code == 404:
            hint = "（LIST_SHEET_ID のシートが見つかりません）"
        fail(
            "Google Sheets APIがエラーを返しました（HTTP {}）。{}前回の値を維持します。".format(
                resp.status_code, hint
            )
        )
    try:
        return resp.json()
    except ValueError:
        fail("Google Sheets APIの応答をJSONとして読めませんでした。前回の値を維持します。")


def fetch_sheet_titles(token, sheet_id):
    """タブ名の一覧だけを取得する（セルの値は取らない）。"""
    url = "https://sheets.googleapis.com/v4/spreadsheets/{}".format(quote(sheet_id, safe=""))
    data = sheets_get(token, url, {"fields": "sheets.properties.title"})
    titles = []
    for sheet in data.get("sheets", []) or []:
        title = (sheet.get("properties", {}) or {}).get("title")
        if title:
            titles.append(title)
    return titles


def pick_sheet_title(titles):
    """希望のタブ名（優先順）があればそれを、どれも無ければ先頭タブを使う。"""
    if not titles:
        fail("スプレッドシートにタブが1つも見つかりませんでした。前回の値を維持します。")
    for candidate in PREFERRED_SHEET_TITLES:
        if candidate in titles:
            return candidate
    print(
        "::notice::タブ「{}」が見つからないため、先頭タブ「{}」を使用します。".format(
            "」「".join(PREFERRED_SHEET_TITLES), titles[0]
        )
    )
    return titles[0]


def fetch_values(token, sheet_id, sheet_title):
    """指定タブの全セルを取得する。取得した値は絶対にログへ出さない。"""
    # A1記法のシート名はシングルクォートで囲み、中のクォートは2つに重ねてエスケープする
    a1_range = "'{}'".format(sheet_title.replace("'", "''"))
    url = "https://sheets.googleapis.com/v4/spreadsheets/{}/values/{}".format(
        quote(sheet_id, safe=""), quote(a1_range, safe="")
    )
    data = sheets_get(
        token,
        url,
        {
            "majorDimension": "ROWS",
            "valueRenderOption": "FORMATTED_VALUE",
        },
    )
    return data.get("values", []) or []


def cell(row, index):
    if index is None or index < 0 or index >= len(row):
        return ""
    value = row[index]
    return value if isinstance(value, str) else str(value)


def is_blank_row(row):
    return all(not cell(row, i).strip() for i in range(len(row)))


def parse_date(raw):
    """
    セルの文字列から日付部分だけを取り出す。
    対応: 2026/07/31 14:01:17 / 2026-07-31 / 2026/7/31 / 2026年7月31日 /
          2026-07-31T14:01:17 / スプレッドシートのシリアル値
    読めなければ None を返す（値そのものはログに出さない）。
    """
    if raw is None:
        return None
    text = str(raw).strip()
    if not text:
        return None

    match = re.match(r"^(\d{4})\s*[-/年.]\s*(\d{1,2})\s*[-/月.]\s*(\d{1,2})", text)
    if match:
        try:
            return date(int(match.group(1)), int(match.group(2)), int(match.group(3)))
        except ValueError:
            return None

    # 表示形式によっては数値（シリアル値）で返ることがあるため、その場合も救済する
    if re.match(r"^\d+(\.\d+)?$", text):
        try:
            serial = float(text)
        except ValueError:
            return None
        if SERIAL_MIN <= serial <= SERIAL_MAX:
            return SERIAL_EPOCH + timedelta(days=int(serial))
    return None


def find_column_by_header(header, candidates):
    """ヘッダー名に候補文字列を含む列の index を返す（見つからなければ None）。"""
    for index in range(len(header)):
        name = cell(header, index).strip().lower()
        if not name:
            continue
        for candidate in candidates:
            if candidate.lower() in name:
                return index
    return None


def find_date_column(header, rows):
    """
    登録日列を決める。
    1. ヘッダー名の候補（タイムスタンプ／登録日／日付／date）で探す
    2. 見つからなければ、日付としてパースできる行が最も多い列を使う
    決定結果は「列名」だけログに出す（セルの値は出さない）。
    """
    index = find_column_by_header(header, DATE_HEADER_CANDIDATES)
    if index is not None:
        print("登録日として使用する列: 「{}」（ヘッダー名で判定）".format(cell(header, index).strip()))
        return index

    width = max([len(header)] + [len(row) for row in rows]) if rows else len(header)
    best_index = None
    best_hits = 0
    for i in range(width):
        hits = sum(1 for row in rows if parse_date(cell(row, i)) is not None)
        if hits > best_hits:
            best_index = i
            best_hits = hits

    if best_index is None or best_hits == 0:
        fail("登録日として使える列が見つかりませんでした。前回の値を維持します。")

    label = cell(header, best_index).strip() or "（列名なし・{}列目）".format(best_index + 1)
    print("登録日として使用する列: 「{}」（日付としてパースできた行数で判定）".format(label))
    return best_index


def find_name_column(header):
    """お名前列（テスト行の判定用）。見つからなければ None（除外はスキップ）。"""
    index = find_column_by_header(header, NAME_HEADER_CANDIDATES)
    if index is None:
        print(
            "::warning::お名前の列が見つからなかったため、テスト行の除外をスキップします。"
        )
        return None
    print("テスト行の判定に使用する列: 「{}」".format(cell(header, index).strip()))
    return index


def find_email_column(header):
    """メールアドレス列（重複排除用）。見つからなければ None（重複排除はスキップ）。"""
    index = find_column_by_header(header, EMAIL_HEADER_CANDIDATES)
    if index is None:
        print(
            "::warning::メールアドレスの列が見つからなかったため、重複排除をスキップして行数で数えます。"
        )
        return None
    print("重複排除に使用する列: 「{}」".format(cell(header, index).strip()))
    return index


def build_people(data_rows, date_index, email_index):
    """
    データ行を「人」の単位にまとめ、各人の登録日（date または None）のリストを返す。

    - メールアドレス（前後空白除去＋小文字化のみで正規化）が同じ行は同一人物とみなす。
      アドレスの値はログにもJSONにも出さない（キーとしてメモリ上で使うだけ）。
    - 同一人物の登録日は「最古の登録日」を採用する。
      日付が読めない行しか無い人は None（＝最古扱い）とする。
    - アドレスが空の行はユニーク判定できないため、1行=1人として数える。
    - email_index が None のときは重複排除せず、1行=1人として数える。

    戻り値: (people, duplicates)
      people     … 各人の登録日（date か None）のリスト
      duplicates … 重複として1人にまとめた「行数」
    """
    people = []
    index_by_email = {}
    duplicates = 0

    for row in data_rows:
        registered = parse_date(cell(row, date_index))

        email = ""
        if email_index is not None:
            email = cell(row, email_index).strip().lower()

        if not email:
            people.append(registered)
            continue

        if email in index_by_email:
            duplicates += 1
            position = index_by_email[email]
            existing = people[position]
            if existing is None:
                # これまで日付が読めていなかった人は、読める日付が来たら採用する
                people[position] = registered
            elif registered is not None and registered < existing:
                people[position] = registered
        else:
            index_by_email[email] = len(people)
            people.append(registered)

    return people, duplicates


def main():
    sa_key = os.environ.get("GA4_SA_KEY", "")
    sheet_id = os.environ.get("LIST_SHEET_ID", "")

    if not sa_key or not sheet_id:
        # ワークフロー側で事前チェック済みだが、二重の安全策
        fail("GA4_SA_KEY または LIST_SHEET_ID が未設定です。前回の値を維持します。")

    sheet_id = sheet_id.strip()

    token = get_access_token(sa_key)
    sheet_title = pick_sheet_title(fetch_sheet_titles(token, sheet_id))
    values = fetch_values(token, sheet_id, sheet_title)

    # 先頭の空行を飛ばし、最初の非空行をヘッダーとみなす
    rows = [row for row in values if not is_blank_row(row)]
    if len(rows) < 2:
        fail("シートにデータ行が1件もありませんでした。前回の値を維持します。")

    header = rows[0]
    data_rows = rows[1:]

    date_index = find_date_column(header, data_rows)
    name_index = find_name_column(header)
    email_index = find_email_column(header)

    # 処理順は「テスト行の除外 → 重複排除」
    # テスト行（お名前に「テスト」を含む行）を全集計から除外する
    if name_index is not None:
        kept = [
            row for row in data_rows if TEST_ROW_MARKER not in cell(row, name_index)
        ]
        excluded = len(data_rows) - len(kept)
        if excluded:
            print("テスト行を {} 件除外しました。".format(excluded))
        data_rows = kept

    if not data_rows:
        fail("集計対象のデータ行が0件でした。前回の値を維持します。")

    # メールアドレスで重複を排除し、ここから先は「人」単位で数える
    people, duplicates = build_people(data_rows, date_index, email_index)
    if duplicates:
        print(
            "同じメールアドレスの重複登録を {} 件まとめました（{} 行 → {} 人）。".format(
                duplicates, len(data_rows), len(people)
            )
        )

    # 開始日フィルタ（重複排除のあと）。
    # メルマガ正式スタート前に登録した人は集計に入れない。
    # 判定はその人の登録日（＝最古の登録日）で行うため、スタート前に登録した人が
    # あとから再登録していても対象外のまま。日付が読めない人は判定できないので残す。
    kept_people = [
        registered
        for registered in people
        if registered is None or registered >= LIST_START_DATE
    ]
    before_start = len(people) - len(kept_people)
    if before_start:
        print(
            "開始日（{}）より前の登録を {} 人分、集計から除外しました。".format(
                LIST_START_DATE.isoformat(), before_start
            )
        )
    people = kept_people

    if not people:
        fail("集計対象の人数が0人でした。前回の値を維持します。")

    # 「今日（日本時間）」までを対象にする。
    # シートは当日分も完全に揃っているので、当日の登録もその日のうちに反映する。
    # これにより total と daily 末尾の cumulative が常に一致する。
    end = datetime.now(JST).date()
    start28 = end - timedelta(days=DAILY_DAYS - 1)
    start7 = end - timedelta(days=6)

    counts = {}
    unknown = 0  # 登録日が読めない人は最古扱い（累計の底に含める）
    before_window = 0
    future = 0  # 入力ミス等で未来日になっている人（当日扱いにして数え漏らさない）
    for registered in people:
        if registered is None:
            unknown += 1
            continue
        if registered > end:
            future += 1
            registered = end
        elif registered < start28:
            before_window += 1
        key = registered.isoformat()
        counts[key] = counts.get(key, 0) + 1

    if unknown:
        print("登録日が読み取れない人が {} 人いました（最古扱いで累計に含めます）。".format(unknown))
    if future:
        print("登録日が未来日になっている人が {} 人いました（本日扱いで数えます）。".format(future))

    daily = []
    cumulative = unknown + before_window
    for offset in range(DAILY_DAYS):
        day = start28 + timedelta(days=offset)
        added = counts.get(day.isoformat(), 0)
        cumulative += added
        daily.append(
            {"date": day.isoformat(), "added": added, "cumulative": cumulative}
        )

    added7 = sum(
        counts.get((start7 + timedelta(days=offset)).isoformat(), 0)
        for offset in range((end - start7).days + 1)
    )
    added28 = sum(entry["added"] for entry in daily)

    result = {
        "isSample": False,
        "updatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "total": len(people),
        "added7": added7,
        "added28": added28,
        "daily": daily,
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(
        "{} を更新しました（累計 {} 人 / 直近7日 +{} / 直近28日 +{} / 集計終端 {}）。".format(
            OUTPUT_PATH, result["total"], added7, added28, end.isoformat()
        )
    )


if __name__ == "__main__":
    main()
