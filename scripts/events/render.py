"""events/events.json を正本として、JSなしでも読める一覧HTMLを生成する。"""
from pathlib import Path
from html import escape
from datetime import date
from urllib.parse import urlparse
import json
import hashlib
import re
import xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[2]
DATA=ROOT/'events/events.json'
TEMPLATE=Path(__file__).with_name('page.template.html')
REGIONS=json.loads((ROOT/'events/regions.json').read_text(encoding='utf-8'))
REGION_BY_PREF={pref:r['id'] for r in REGIONS for pref in r['prefectures']}
assert len(REGION_BY_PREF)==47 and sum(len(r['prefectures']) for r in REGIONS)==47

def h(value): return escape(str(value or ''),quote=True)

def secure_link(url):
    if urlparse(url).scheme!='https': raise ValueError('外部URLにはhttpsが必要です: '+url)
    return h(url)

def japan_map(events,asof):
    # MIT素材から形状だけを抽出。編集ソフトのスタイル・外部参照は取り込まない。
    source=ET.parse(ROOT/'assets/maps/japan-geographic.svg')
    label_key='{http://www.inkscape.org/namespaces/inkscape}label'
    groups={e.get(label_key):e for e in source.iter() if e.get(label_key)}
    names='北海道 青森県 岩手県 宮城県 秋田県 山形県 福島県 茨城県 栃木県 群馬県 埼玉県 千葉県 東京都 神奈川県 新潟県 富山県 石川県 福井県 山梨県 長野県 岐阜県 静岡県 愛知県 三重県 滋賀県 京都府 大阪府 兵庫県 奈良県 和歌山県 鳥取県 島根県 岡山県 広島県 山口県 徳島県 香川県 愛媛県 高知県 福岡県 佐賀県 長崎県 熊本県 大分県 宮崎県 鹿児島県 沖縄県'.split()
    keys='hokkaido aomori iwate miyagi akita yamagata fukushima ibaraki tochigi gunma saitama chiba tokyo kanagawa nigata toyama ishikawa fukui yamanashi nagano gifu shizuoka aichi mie shiga kyoto osaka hyogo nara wakayama tottori shimane okayama hiroshima yamaguchi tokushima kagawa ehime kochi fukuoka saga nagasaki kumamoto oita miyazaki kagoshima okinawa'.split()
    content=['<svg viewBox="-35 -35 1607 1820" role="group" aria-labelledby="japan-map-title"><title id="japan-map-title">開催地を選ぶ日本地図。県名からも選べます。</title><g transform="translate(-542.3661,-311.44048)">']
    for name,key in zip(names,keys):
        paths=[p for p in groups[key].iter() if p.tag.endswith('}path')]
        shapes=[]
        for p in paths:
            d=p.get('d')
            if not re.fullmatch(r'[MmLlHhVvCcSsQqTtAaZz0-9.eE+ ,\s\-]+',d): raise ValueError('想定外の地図パス')
            shapes.append(f'<path d="{d}" fill="#dce8dc" stroke="#ffffff" stroke-width="2.5"/>')
        side='right' if names.index(name)<14 else 'left'
        content.append(f'<a href="?view=prefecture&amp;prefecture={h(name)}#event-results-heading" class="map-prefecture" data-prefecture="{name}" data-side="{side}" aria-label="{name}の開催情報" aria-current="false"><title>{name}</title>{"".join(shapes)}</a>')
    content.append('</g></svg>')
    return '\n'.join(content)

def card(e,asof):
    d=date.fromisoformat(e['date'])
    weekday='月火水木金土日'[d.weekday()]
    past=e['date']<asof
    label='過去の開催情報' if past else '開催予定'
    times=[]
    for key,text in [('open_time','開場'),('start_time','開演'),('end_time','終演予定')]:
        if e.get(key): times.append(h(e[key])+' '+text)
    time_label=' ／ '.join(times) or '時刻は主催者に確認'
    fee_label=e['admission'] or '有料・無料とも未確認'
    audience={'open':'一般の方も観覧できます','contact':'事前申込・問い合わせ','restricted':'関係者のみ','unknown':'主催者に確認'}[e['audience']]
    source_links=''.join(f'<li><a href="{secure_link(s["url"])}" target="_blank" rel="noopener noreferrer">{h(s["title"])}</a></li>' for s in e['sources'])
    extra=''
    if e.get('visitor_note'): extra+=f'<p>{h(e["visitor_note"])}</p>'
    if e.get('source_note'): extra+=f'<p>{h(e["source_note"])}</p>'
    if e.get('participation_note'): extra+=f'<p><strong>出場・申込について：</strong>{h(e["participation_note"])}</p>'
    kind='関連公演' if e.get('related') else '全国大会・公演' if e['scope']=='national' else '地域大会・公演'
    short=e.get('short_name') or re.sub(r'（[^）]*）|\([^)]*\)','',e['name']).strip()
    return f'''<article class="event-card" id="event-{h(e['id'])}" data-date="{h(e['date'])}" data-scope="{h(e['scope'])}" data-prefecture="{h(e['prefecture'])}" data-region="{REGION_BY_PREF[e['prefecture']]}" data-short-name="{h(short)}" data-past="{str(past).lower()}">
  <div class="event-date"><time datetime="{h(e['date'])}"><span class="event-date__year">{d.year}年</span><span class="event-date__day">{d.month}/{d.day}</span><span class="event-date__weekday">{weekday}曜日</span></time><span class="event-date__state">{label}</span></div>
  <div class="event-body">
    <div class="event-tags"><span class="event-tag{' event-tag--related' if e.get('related') else ''}">{kind}</span><span class="event-tag">{h(e['category'])}</span></div>
    <h3>{h(e['name'])}</h3>
    <dl class="event-facts">
      <div class="event-place"><dt>場所</dt><dd>{h(e['prefecture'])} {h(e['city'])}｜{h(e['venue'])}{'<small>'+h(e['address'])+'</small>' if e.get('address') else ''}</dd></div>
      <div><dt>時間</dt><dd>{time_label}</dd></div>
      <div><dt>観覧料（出場参加費ではありません）</dt><dd class="{'event-unknown' if e['fee_status']=='unknown' else 'event-known'}">{h(fee_label)}</dd></div>
      <div class="event-place"><dt>一般の方の見学</dt><dd><span class="{'event-unknown' if e['audience']=='unknown' else 'event-known'}">{audience}</span><small>{h(e['audience_note'])}</small></dd></div>
    </dl>
    <div class="event-actions"><a href="{secure_link(e['action_url'])}" target="_blank" rel="noopener noreferrer">{h(e['action_label'])}</a><a href="{secure_link(e['map_url'])}" target="_blank" rel="noopener noreferrer">Googleマップで場所を見る</a></div>
    <details class="event-details"><summary>主催者・詳しい案内・出典</summary><p><strong>主催・担当：</strong>{h(e['organizer'] or '開催案内でご確認ください')}</p>{extra}<ul>{source_links}</ul><p>情報確認日：{h(e['checked_at'])} ／ 外部リンクは別のタブで開きます。</p></details>
  </div>
</article>'''

def main():
    data=json.loads(DATA.read_text(encoding='utf-8'))
    events=data['events']
    if len({e['id'] for e in events})!=len(events): raise ValueError('ID重複')
    asof=data['updated_at']
    # 固定HTMLも、予定→過去の順。表示時にはJSが日本時間の当日で再分類する。
    ordered=sorted(events,key=lambda e:(e['date']<asof,e['date'] if e['date']>=asof else str(99999999-int(e['date'].replace('-','')))))
    html=TEMPLATE.read_text(encoding='utf-8')
    # クエリ文字列だけでは古いCSSが残る環境があるため、内容に応じたファイル名を使う。
    for ext in ['css','js']:
        # Windowsと公開前検査（Linux）で同じ内容・ファイル名になるよう改行をそろえる。
        asset=(ROOT/f'events/events.{ext}').read_text(encoding='utf-8').encode('utf-8')
        name=f'events.{hashlib.sha256(asset).hexdigest()[:12]}.{ext}'
        (ROOT/'events'/name).write_bytes(asset)
        html=html.replace('{{EVENT_'+ext.upper()+'}}',name)
    shared=(ROOT/'tools/index.html').read_text(encoding='utf-8')
    for part in ['HEADER','FOOTER']:
        fragment=re.search(f'<!-- SHARED-{part}-START -->.*?<!-- SHARED-{part}-END -->',shared,re.S).group()
        if part=='HEADER':
            fragment=fragment.replace('href="../events/"','href="../events/" aria-current="page"')
        else:
            fragment=re.sub(r'最終更新日: [^<]+','最終更新日: '+asof,fragment)
        html=html.replace(f'<!-- SHARED-{part} -->',fragment)
    html=html.replace('<!-- EVENT-CARDS -->','\n'.join(card(e,asof) for e in ordered))
    prefectures='北海道 青森県 岩手県 宮城県 秋田県 山形県 福島県 茨城県 栃木県 群馬県 埼玉県 千葉県 東京都 神奈川県 新潟県 富山県 石川県 福井県 山梨県 長野県 岐阜県 静岡県 愛知県 三重県 滋賀県 京都府 大阪府 兵庫県 奈良県 和歌山県 鳥取県 島根県 岡山県 広島県 山口県 徳島県 香川県 愛媛県 高知県 福岡県 佐賀県 長崎県 熊本県 大分県 宮崎県 鹿児島県 沖縄県'.split()
    html=html.replace('<!-- PREFECTURES -->',''.join(f'<option value="{p}" data-region="{REGION_BY_PREF[p]}">{p}</option>' for p in prefectures))
    html=html.replace('<!-- REGIONS -->',''.join(f'<option value="{r["id"]}">{r["label"]}</option>' for r in REGIONS))
    html=html.replace('<!-- JAPAN-MAP -->',japan_map(events,asof))
    months=sorted({e['date'][:7] for e in events}|{asof[:7]})
    start=int(months[0][:4])*12+int(months[0][5:])-1
    end=int(months[-1][:4])*12+int(months[-1][5:])-1
    options=[]
    for month in range(start,end+1):
        y,m=divmod(month,12); value=f'{y:04}-{m+1:02}'
        options.append(f'<option value="{value}"'+(' selected' if value==asof[:7] else '')+f'>{y}年{m+1}月</option>')
    html=html.replace('<!-- CALENDAR-MONTHS -->',''.join(options))
    html=html.replace('{{PREFECTURE_COUNT}}',str(len({e['prefecture'] for e in events})))
    html=html.replace('{{UPDATED}}',asof).replace('{{TOTAL}}',str(len(events)))
    (ROOT/'events/index.html').write_text(html,encoding='utf-8')
    print(f'Rendered {len(events)} event cards.')

if __name__=='__main__': main()
