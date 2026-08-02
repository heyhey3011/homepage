#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GA4 Data API からアクセス解析を集計し、assets/data/analytics-summary.json を生成する。

設計方針（YouTube統計スクリプトと同じ思想）:
- 認証情報（サービスアカウント鍵JSON・プロパティID）は環境変数からのみ受け取る。
  値はログに出さない（print しない / set -x しない）。
- API呼び出しに1つでも失敗したら例外を投げて異常終了する。
  その場合、既存の analytics-summary.json は書き換えない（前回値の保護）。
- 成功時のみ、まるごと新しい内容でファイルを上書きする（isSample: false）。

必要な環境変数:
  GA4_SA_KEY       … サービスアカウントの鍵JSON（全文）
  GA4_PROPERTY_ID  … 数値のGA4プロパティID

集計の開始日:
- ダッシュボードは STATS_START_DATE（計測の正式スタート日）以降だけを対象にする。
  それより前の「まだ発信していなかった期間」の数字が混ざると現在地が読み取りにくいため、
  GA4への全リクエストの開始日をこの日でクランプする。
"""

import json
import os
import sys
from datetime import date, datetime, timedelta, timezone

import requests
from google.oauth2 import service_account
from google.auth.transport.requests import Request as GoogleAuthRequest

API_SCOPE = "https://www.googleapis.com/auth/analytics.readonly"
OUTPUT_PATH = "assets/data/analytics-summary.json"

# メルマガ・計測の正式スタート日。
# ダッシュボードの数字はすべてこの日以降だけを対象にする（これより前のデータは出さない）。
# build_list_summary.py の STATS_START_DATE と同じ日付にそろえること。
STATS_START_DATE = date(2026, 8, 1)

# 日本時間（GA4プロパティのタイムゾーンに合わせて「今日／昨日」を判定する）
JST = timezone(timedelta(hours=9))

# analytics.js が送信している当サイトの7つのカスタムイベントだけを集計対象にする
CUSTOM_EVENTS = [
    "mailmag_click",
    "kindle_click",
    "dojo_click",
    "openchat_click",
    "tool_open",
    "form_click",
    "youtube_click",
]


def fail(message):
    """異常終了（ファイルは書き換えない）。詳細な認証情報は出さない。"""
    print("::error::{}".format(message))
    sys.exit(1)


def date_range(days_ago):
    """
    「N日前〜昨日」の期間を、開始日を STATS_START_DATE でクランプして返す。

    GA4の "28daysAgo" などの相対指定はプロパティのタイムゾーン基準なので、
    同じ基準（JST）で絶対日付に直したうえで max(N日前, STATS_START_DATE) を取る。
    計測スタート直後で「昨日」がスタート日より前になる場合は、
    開始日より前を終端にしない（APIに開始>終端の不正な範囲を投げない）。
    """
    today = datetime.now(JST).date()
    end = today - timedelta(days=1)
    start = max(today - timedelta(days=days_ago), STATS_START_DATE)
    if start > end:
        end = start
    return {"startDate": start.isoformat(), "endDate": end.isoformat()}


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


def run_report(token, property_id, body):
    url = "https://analyticsdata.googleapis.com/v1beta/properties/{}:runReport".format(
        property_id
    )
    headers = {
        "Authorization": "Bearer {}".format(token),
        "Content-Type": "application/json",
    }
    try:
        resp = requests.post(url, headers=headers, json=body, timeout=60)
    except requests.RequestException:
        fail("GA4 Data APIへの接続に失敗しました。前回の値を維持します。")
    if resp.status_code != 200:
        # レスポンス本文にはトークンや鍵は含まれないが、念のため要点だけ
        fail("GA4 Data APIがエラーを返しました（HTTP {}）。前回の値を維持します。".format(resp.status_code))
    try:
        return resp.json()
    except ValueError:
        fail("GA4 Data APIの応答をJSONとして読めませんでした。前回の値を維持します。")


def rows_of(report):
    return report.get("rows", []) or []


def dim(row, i):
    vals = row.get("dimensionValues", [])
    return vals[i].get("value", "") if i < len(vals) else ""


def metric(row, i):
    vals = row.get("metricValues", [])
    raw = vals[i].get("value", "0") if i < len(vals) else "0"
    try:
        return int(float(raw))
    except (ValueError, TypeError):
        return 0


def build_daily(token, property_id):
    report = run_report(
        token,
        property_id,
        {
            "dateRanges": [date_range(28)],
            "dimensions": [{"name": "date"}],
            "metrics": [{"name": "screenPageViews"}, {"name": "activeUsers"}],
            "orderBys": [{"dimension": {"dimensionName": "date"}}],
            "limit": 40,
        },
    )
    daily = []
    limit_iso = STATS_START_DATE.isoformat()
    for row in rows_of(report):
        ymd = dim(row, 0)  # 例: 20260716
        iso = "{}-{}-{}".format(ymd[0:4], ymd[4:6], ymd[6:8]) if len(ymd) == 8 else ymd
        # 開始日より前の日付は載せない（リクエスト側でクランプ済みだが二重の安全策）
        if iso < limit_iso:
            continue
        daily.append(
            {
                "date": iso,
                "screenPageViews": metric(row, 0),
                "activeUsers": metric(row, 1),
            }
        )
    daily.sort(key=lambda d: d["date"])
    return daily


def build_channels(token, property_id, days_ago):
    report = run_report(
        token,
        property_id,
        {
            "dateRanges": [date_range(days_ago)],
            "dimensions": [{"name": "sessionDefaultChannelGroup"}],
            "metrics": [{"name": "sessions"}],
            "orderBys": [{"metric": {"metricName": "sessions"}, "desc": True}],
            "limit": 20,
        },
    )
    return [
        {"channel": dim(row, 0), "sessions": metric(row, 0)}
        for row in rows_of(report)
    ]


def build_pages(token, property_id):
    report = run_report(
        token,
        property_id,
        {
            "dateRanges": [date_range(7)],
            "dimensions": [{"name": "pagePath"}, {"name": "pageTitle"}],
            "metrics": [{"name": "screenPageViews"}],
            "orderBys": [{"metric": {"metricName": "screenPageViews"}, "desc": True}],
            "limit": 15,
        },
    )
    return [
        {
            "pagePath": dim(row, 0),
            "pageTitle": dim(row, 1),
            "views": metric(row, 0),
        }
        for row in rows_of(report)
    ]


def build_events(token, property_id, days_ago):
    report = run_report(
        token,
        property_id,
        {
            "dateRanges": [date_range(days_ago)],
            "dimensions": [{"name": "eventName"}],
            "metrics": [{"name": "eventCount"}],
            "dimensionFilter": {
                "filter": {
                    "fieldName": "eventName",
                    "inListFilter": {"values": CUSTOM_EVENTS},
                }
            },
            "limit": 20,
        },
    )
    counts = {name: 0 for name in CUSTOM_EVENTS}
    for row in rows_of(report):
        name = dim(row, 0)
        if name in counts:
            counts[name] = metric(row, 0)
    return counts


def main():
    sa_key = os.environ.get("GA4_SA_KEY", "")
    property_id = os.environ.get("GA4_PROPERTY_ID", "")

    if not sa_key or not property_id:
        # ワークフロー側で事前チェック済みだが、二重の安全策
        fail("GA4_SA_KEY または GA4_PROPERTY_ID が未設定です。前回の値を維持します。")

    property_id = property_id.strip()

    token = get_access_token(sa_key)

    daily = build_daily(token, property_id)
    channels_d7 = build_channels(token, property_id, 7)
    channels_d28 = build_channels(token, property_id, 28)
    pages = build_pages(token, property_id)
    events_d7 = build_events(token, property_id, 7)
    events_d28 = build_events(token, property_id, 28)

    # 取得できたデータが空すぎる場合は異常とみなし、書き換えない
    if not daily:
        fail("日別データが1件も取得できませんでした。前回の値を維持します。")

    result = {
        "isSample": False,
        "updatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "rangeEnd": daily[-1]["date"] if daily else "",
        "daily": daily,
        "channels": {"d7": channels_d7, "d28": channels_d28},
        "pages": pages,
        "events": {"d7": events_d7, "d28": events_d28},
    }

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print("{} を更新しました（日別 {} 件 / ページ {} 件）。".format(
        OUTPUT_PATH, len(daily), len(pages)
    ))


if __name__ == "__main__":
    main()
