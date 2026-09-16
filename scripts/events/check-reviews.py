"""出典を読んだ精査記録と掲載データの一致を検査する（外部の事実判定はしない）。"""
import argparse
from datetime import date, datetime, timedelta, timezone
import hashlib
import json
from pathlib import Path
import re
import subprocess
import sys
import unicodedata
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
CHECKS = ('identity', 'schedule', 'location', 'admission', 'audience', 'latest_notice')


def fingerprint(event):
    raw = json.dumps(event, ensure_ascii=False, sort_keys=True, separators=(',', ':'))
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()


def normalized(value):
    return re.sub(r'[\W_]+', '', unicodedata.normalize('NFKC', value))


def iso_date(value):
    if not isinstance(value, str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', value):
        raise ValueError('YYYY-MM-DD が必要')
    return date.fromisoformat(value)


def validate(data, before, ledger, today=None):
    today = today or datetime.now(timezone(timedelta(hours=9))).date()
    errors = []
    events = data['events']
    by_id = {e['id']: e for e in events}
    old = {e['id']: e for e in before['events']}
    reviews = ledger.get('events', {})
    if ledger.get('version') != 1 or not isinstance(reviews, dict):
        return ['精査記録の形式が不正です']
    if len(events) != len(by_id):
        errors.append('IDが重複しています')
    removed = old.keys() - by_id.keys()
    if removed:
        errors.append('保存済み記録が削除されています: ' + ', '.join(sorted(removed)))
    changed = {eid for eid, e in by_id.items() if e != old.get(eid)}
    for eid in sorted(changed - reviews.keys()):
        errors.append(f'{eid}: 追加・変更に対する精査記録がありません')
    try:
        updated = iso_date(data['updated_at'])
        if updated > today:
            errors.append('updated_at が未来日です')
    except (ValueError, TypeError):
        updated = today
        errors.append('updated_at が不正です')
    if data['updated_at'] != before['updated_at'] and not changed:
        errors.append('個別記録を確認せずに全体の確認日だけ更新しています')
    duplicates = {}
    for e in events:
        eid = e['id']
        try:
            if iso_date(e['date']) < date(2022, 1, 1):
                errors.append(f'{eid}: 保存対象の2022年より前です')
            checked = iso_date(e['checked_at'])
            if checked > today or checked > updated:
                errors.append(f'{eid}: 確認日が未来または全体の確認日より後です')
        except (ValueError, TypeError):
            errors.append(f'{eid}: 開催日または確認日が不正です')
        key = (normalized(e['name']), e['date'], e['prefecture'], normalized(e['venue']))
        if key in duplicates:
            errors.append(f'{eid}: {duplicates[key]} と大会名・開催日・会場が重複しています')
        duplicates[key] = eid
        times = [e.get(k) for k in ('open_time', 'start_time', 'end_time') if e.get(k)]
        if any(not re.fullmatch(r'(?:[01]\d|2[0-3]):[0-5]\d', t) for t in times):
            errors.append(f'{eid}: 時刻の形式が不正です')
        elif times != sorted(times):
            errors.append(f'{eid}: 開場・開演・終演の順序が逆です')
        if e['fee_status'] == 'unknown' and e['admission'] is not None:
            errors.append(f'{eid}: 観覧料未確認なのに金額の記載があります')
        if e['fee_status'] in {'paid', 'free'} and not e['admission']:
            errors.append(f'{eid}: 観覧料の説明がありません')
    for eid, review in reviews.items():
        if eid not in by_id:
            errors.append(f'{eid}: 精査記録に対応する催事がありません')
            continue
        e = by_id[eid]
        if review.get('record_sha256') != fingerprint(e):
            errors.append(f'{eid}: 精査後に掲載内容が変わっています。再精査が必要です')
        if review.get('decision') != 'verified':
            errors.append(f'{eid}: 精査が完了していません（矛盾・保留は公開不可）')
        try:
            reviewed = iso_date(review.get('reviewed_at'))
            if reviewed > today or review['reviewed_at'] != e['checked_at']:
                errors.append(f'{eid}: 精査日と情報確認日が一致しません')
        except (ValueError, TypeError):
            errors.append(f'{eid}: 精査日が不正です')
        sources = {s['url'] for s in e['sources']}
        checks = review.get('checks', {})
        for field in CHECKS:
            check = checks.get(field, {})
            unknown = (field == 'admission' and e['fee_status'] == 'unknown') or (
                field == 'audience' and e['audience'] == 'unknown')
            expected = 'unknown' if unknown else 'verified'
            if check.get('result') != expected:
                errors.append(f'{eid}/{field}: 掲載値と確認結果が一致しません（{expected} が必要）')
            urls = check.get('urls', [])
            if not isinstance(urls, list) or not urls or any(
                not isinstance(u, str) or u not in sources or urlparse(u).scheme != 'https'
                for u in urls
            ):
                errors.append(f'{eid}/{field}: 掲載出典に含まれる確認URLが必要です')
            if not isinstance(check.get('note'), str) or not check['note'].strip():
                errors.append(f'{eid}/{field}: 原文との照合内容・未確認の理由が必要です')
        if not isinstance(review.get('cross_check'), str) or not review['cross_check'].strip():
            errors.append(f'{eid}: 別資料との照合結果、または一資料のみの理由が必要です')
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--base', default='HEAD', help='更新前のGitコミット（CIではpush前のSHA）')
    parser.add_argument('--prepare', metavar='EVENT_ID', help='未承認の精査用ひな型を標準出力へ出す')
    args = parser.parse_args()
    data = json.loads((ROOT / 'events/events.json').read_text(encoding='utf-8'))
    if args.prepare:
        e = next(e for e in data['events'] if e['id'] == args.prepare)
        print(json.dumps({e['id']: {
            'record_sha256': fingerprint(e), 'reviewed_at': e['checked_at'], 'decision': 'pending',
            'cross_check': '', 'checks': {k: {'result': 'pending', 'urls': [], 'note': ''} for k in CHECKS}
        }}, ensure_ascii=False, indent=2))
        return
    # 比較元が取れない場合は無検査で公開せず、失敗終了する。
    before = json.loads(subprocess.check_output(
        ['git', 'show', f'{args.base}:events/events.json'], cwd=ROOT).decode('utf-8'))
    ledger = json.loads((ROOT / 'scripts/events/reviews.json').read_text(encoding='utf-8'))
    errors = validate(data, before, ledger)
    if errors:
        print('\n'.join('FAIL: ' + error for error in errors), file=sys.stderr)
        raise SystemExit(1)
    changed = sum(e not in before['events'] for e in data['events'])
    print(f'PASS: データ整合性・保存維持・変更{changed}件の精査記録。出典の内容の真偽は原文照合で確認します。')


if __name__ == '__main__':
    main()
