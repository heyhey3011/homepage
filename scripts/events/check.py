"""公開前のデータ・リンク・表示項目の検査。ブラウザ操作は行わない。"""
from pathlib import Path
from html.parser import HTMLParser
from datetime import date, time
from urllib.parse import urlparse, parse_qs, unquote
import importlib.util
import json
import re
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[2]
data=json.loads((ROOT/'events/events.json').read_text(encoding='utf-8'))
events=data['events']
html=(ROOT/'events/index.html').read_text(encoding='utf-8')
assert len({e['id'] for e in events})==len(events)
assert len(events)>=63
assert not {'E061','E065','E066','E067','E068','E069','E070','E071'} & {e['id'] for e in events}
for e in events:
    date.fromisoformat(e['date'])
    assert e['prefecture'] and e['city'] and e['venue']
    for key in ['open_time','start_time','end_time']:
        if e[key]: time.fromisoformat(e[key])
    assert e['audience'] in {'open','contact','restricted','unknown'}
    assert e['fee_status'] in {'paid','free','unknown'}
    assert e['audience_basis']
    if e['fee_status']=='unknown': assert e['admission'] is None
    assert e['sources'] and all(urlparse(s['url']).scheme=='https' for s in e['sources'])
    maps=urlparse(e['map_url'])
    assert maps.hostname=='www.google.com'
    query=parse_qs(maps.query)['query'][0]
    assert e['prefecture'] in query and e['city'] in query and e['venue'] in query
    assert f'id="event-{e["id"]}"' in html
    assert f'<time datetime="{e["date"]}">' in html
byid={e['id']:e for e in events}
assert byid['E060']['fee_status']=='unknown' # 全国大会の出場料6,000円を観覧料にしない。
assert byid['E064']['fee_status']=='unknown' # 選手権参加費5,000円も同様。
assert byid['E062']['fee_status']=='paid' and byid['E062']['audience']=='open'
assert all(word in html for word in ['「詩吟に興味があって見に来ました」','席を立ったり','スーツまでは不要','吟詠中の私語は厳禁'])
assert '{{' not in html and '<!-- EVENT-CARDS -->' not in html

class Inspect(HTMLParser):
    def __init__(self): super().__init__(); self.ids=[]; self.assets=[]; self.links=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a: self.ids.append(a['id'])
        if tag in ['script','img'] and a.get('src'): self.assets.append(a['src'])
        if tag=='link' and a.get('href'): self.assets.append(a['href'])
        if tag=='a' and a.get('href'):
            self.links.append(a['href'])
            if a.get('target')=='_blank': assert 'noopener' in a.get('rel','')
p=Inspect(); p.feed(html)
assert len(set(p.ids))==len(p.ids)
for url in p.assets+p.links:
    parsed=urlparse(url)
    if parsed.scheme or parsed.netloc or not parsed.path: continue
    path=(ROOT/parsed.path.lstrip('/')) if parsed.path.startswith('/') else (ROOT/'events'/unquote(parsed.path))
    if parsed.path.endswith('/'): path=path/'index.html'
    assert path.exists(),str(path)

for file in [ROOT/'index.html',ROOT/'beginner/index.html',ROOT/'tools/index.html']:
    content=file.read_text(encoding='utf-8')
    assert 'href="'+('events/' if file.parent==ROOT else '../events/')+'"' in content
    assert '>全国詩吟イベントナビ</a>' in content
ET.parse(ROOT/'sitemap.xml')
assert '<loc>https://shigin-portal.com/events/</loc>' in (ROOT/'sitemap.xml').read_text(encoding='utf-8')

# 自由記述や外部URLからHTML／スクリプトが混入しない。
spec=importlib.util.spec_from_file_location('renderer',Path(__file__).with_name('render.py'))
renderer=importlib.util.module_from_spec(spec); spec.loader.exec_module(renderer)
unsafe={**events[0],'name':'<script>alert(1)</script>','visitor_note':'<img src=x onerror=alert(1)>'}
output=renderer.card(unsafe,data['updated_at'])
assert '<script>alert' not in output and '<img src=x' not in output
try: renderer.secure_link('javascript:alert(1)')
except ValueError: pass
else: raise AssertionError('unsafe URL accepted')
# 地図の47県と県選択が一致し、県名ラベル・検索用リンクを持つ。
map_names=re.findall(r'class="map-prefecture" data-prefecture="([^"]+)"',html)
assert len(map_names)==47 and len(set(map_names))==47
assert {e['prefecture'] for e in events} <= set(map_names)
assert html.count('id="calendar-month"')==1 and html.count('id="event-prefecture"')==1
regions=json.loads((ROOT/'events/regions.json').read_text(encoding='utf-8'))
region_prefs=[p for r in regions for p in r['prefectures']]
assert len(regions)==11 and len(region_prefs)==47 and set(region_prefs)==set(map_names)
assert len(set(r['id'] for r in regions))==11
assert next(r['prefectures'] for r in regions if r['id']=='koshinetsu')==['山梨県','長野県','新潟県']
assert 'id="period-upcoming"' in html and 'id="period-past"' in html
assert 'id="event-period"' not in html and '予定と過去の情報すべて' not in html
assert html.count('id="event-region"')==1
assert '<h1>全国詩吟イベントナビ</h1>' in html
assert 'id="calendar-pair"' in html
assert 'この月の一覧を見る' in (ROOT/'events/events.js').read_text(encoding='utf-8-sig')
assert re.search(r'href="events\.[a-f0-9]{12}\.css"',html)
assert re.search(r'src="events\.[a-f0-9]{12}\.js"',html)
assert 'id="map-connectors"' in html and 'id="map-callouts-left"' in html
assert '地形を簡略化した地図' in html
for e in events:
    if '第38回日本詩吟選手権' in e['name']: assert e['fee_status']=='unknown'
assert not re.search(r'<(?:script|foreignObject)',renderer.japan_map(events,data['updated_at']))
print(f'PASS: {len(events)} records, 47 map regions, calendar controls, dates/times, admissions, sources, TPO, links, navigation, escaping.')
