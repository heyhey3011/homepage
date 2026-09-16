"""公開を止める条件の回帰検査。実在催事の精査済み記録は作らない。"""
from copy import deepcopy
from datetime import date
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('reviews', Path(__file__).with_name('check-reviews.py'))
reviews = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reviews)


class ReviewGateTest(unittest.TestCase):
    def setUp(self):
        self.event = {
            'id': 'TEST', 'name': '検査用大会', 'date': '2026-10-11', 'checked_at': '2026-09-17',
            'prefecture': '東京都', 'venue': '検査用会場', 'open_time': '09:00', 'start_time': '10:00',
            'end_time': None, 'fee_status': 'unknown', 'admission': None, 'audience': 'unknown',
            'sources': [{'url': 'https://example.org/notice'}]
        }
        self.before = {'updated_at': '2026-09-17', 'events': []}
        self.data = {'updated_at': '2026-09-17', 'events': [self.event]}
        self.ledger = {'version': 1, 'events': {'TEST': {
            'record_sha256': reviews.fingerprint(self.event), 'reviewed_at': '2026-09-17',
            'decision': 'verified', 'cross_check': '自動検査用の架空の照合記録。',
            'checks': {k: {
                'result': 'unknown' if k in {'admission', 'audience'} else 'verified',
                'urls': ['https://example.org/notice'], 'note': '架空の検査用メモ。'
            } for k in reviews.CHECKS}
        }}}

    def errors(self):
        return reviews.validate(self.data, self.before, self.ledger, date(2026, 9, 17))

    def test_reviewed_addition_and_explicit_unknown_pass(self):
        self.assertEqual(self.errors(), [])

    def test_missing_review_blocks(self):
        self.ledger['events'] = {}
        self.assertTrue(any('精査記録がありません' in e for e in self.errors()))

    def test_post_review_edit_blocks(self):
        self.event['venue'] = '別会場'
        self.assertTrue(any('精査後' in e for e in self.errors()))

    def test_conflict_and_pending_block(self):
        for decision in ('pending', 'conflict'):
            self.ledger['events']['TEST']['decision'] = decision
            self.assertTrue(any('精査が完了' in e for e in self.errors()))

    def test_missing_or_unlisted_evidence_blocks(self):
        for urls in ([], ['https://example.org/unread']):
            self.ledger['events']['TEST']['checks']['location']['urls'] = urls
            self.assertTrue(any('確認URL' in e for e in self.errors()))

    def test_unsupported_free_admission_blocks(self):
        self.event['fee_status'] = 'free'
        self.event['admission'] = '無料'
        self.ledger['events']['TEST']['record_sha256'] = reviews.fingerprint(self.event)
        self.assertTrue(any('admission' in e for e in self.errors()))

    def test_schedule_cannot_be_unknown(self):
        self.ledger['events']['TEST']['checks']['schedule']['result'] = 'unknown'
        self.assertTrue(any('schedule' in e for e in self.errors()))

    def test_wrong_order_times_and_future_confirmation_block(self):
        self.event['start_time'] = '08:00'
        self.event['checked_at'] = '2026-09-18'
        self.assertTrue(any('順序' in e for e in self.errors()))
        self.assertTrue(any('未来' in e for e in self.errors()))

    def test_date_only_update_and_archive_deletion_block(self):
        self.before = deepcopy(self.data)
        self.data['updated_at'] = '2026-09-16'
        self.assertTrue(any('全体の確認日だけ' in e for e in self.errors()))
        self.data['events'] = []
        self.assertTrue(any('削除' in e for e in self.errors()))

    def test_duplicate_with_spacing_blocks(self):
        duplicate = {**self.event, 'id': 'TEST2', 'name': '検査用 大会'}
        self.data['events'].append(duplicate)
        self.assertTrue(any('重複' in e for e in self.errors()))

    def test_legacy_unchanged_is_not_marked_reviewed(self):
        self.before = deepcopy(self.data)
        self.ledger['events'] = {}
        self.assertEqual(self.errors(), [])
        self.event['checked_at'] = '2026-09-16'
        self.assertTrue(any('精査記録がありません' in e for e in self.errors()))


if __name__ == '__main__':
    unittest.main()
