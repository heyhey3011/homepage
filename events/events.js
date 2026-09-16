(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const cards = Array.from(document.querySelectorAll('.event-card'));
  const tabs = Array.from(document.querySelectorAll('.event-tabs [role="tab"]'));
  const mapLinks = Array.from(document.querySelectorAll('.map-prefecture'));
  const period = $('event-period'), prefecture = $('event-prefecture'), monthSelect = $('calendar-month');
  let scope = 'national', dateFilter = '', calendarMonth = todayInJapan().slice(0, 7), lastToday = '';
  const pad = (n) => String(n).padStart(2, '0');
  function todayInJapan() {
    const parts = new Intl.DateTimeFormat('en-US', {timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const get = (name) => parts.find((part) => part.type === name).value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  }
  function validDate(value) {
    if (!/^\d{4}-\d{2}(?:-\d{2})?$/.test(value || '')) return false;
    const normalized = value.length === 7 ? value + '-01' : value;
    const d = new Date(normalized + 'T00:00:00Z');
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === normalized;
  }
  function monthLabel(value) { return `${Number(value.slice(0,4))}年${Number(value.slice(5,7))}月`; }
  function dateLabel(value) { return monthLabel(value) + (value.length === 10 ? `${Number(value.slice(8))}日` : ''); }
  function regionCards() { return cards.filter((card) => !prefecture.value || card.dataset.prefecture === prefecture.value); }
  function focusResults() { $('event-results-heading').focus(); }
  function renderMap(today) {
    for (const link of mapLinks) {
      const local = cards.filter((card) => card.dataset.prefecture === link.dataset.prefecture);
      const future = local.filter((card) => card.dataset.date >= today).length, past = local.length - future;
      const label = `${link.dataset.prefecture}：予定${future}件・過去${past}件`;
      link.dataset.state = future ? 'upcoming' : past ? 'past' : 'none';
      link.setAttribute('aria-label', label);
      link.setAttribute('aria-current', String(prefecture.value === link.dataset.prefecture));
      link.querySelector('title').textContent = label;
    }
    const local = regionCards(), future = local.filter((card) => card.dataset.date >= today).length;
    const name = prefecture.value || '全国すべて';
    $('map-selection').textContent = local.length ? `${name}：これから${future}件 ／ 過去${local.length-future}件` : `${name}：情報募集中です。開催がないという意味ではありません。`;
    $('map-results-link').textContent = `${name}の一覧を見る ↓`;
    for (const option of Array.from(prefecture.options)) {
      if (!option.value) continue;
      const localEvents = cards.filter((card) => card.dataset.prefecture === option.value);
      const upcoming = localEvents.filter((card) => card.dataset.date >= today).length;
      option.textContent = `${option.value}（予定${upcoming}／過去${localEvents.length-upcoming}）`;
    }
  }
  function renderCalendar(today) {
    const months = cards.map((card) => card.dataset.date.slice(0,7)).concat([today.slice(0,7),calendarMonth]).sort();
    const start = months[0], end = months[months.length-1], monthKeys = [];
    let y = Number(start.slice(0,4)), m = Number(start.slice(5,7));
    while (`${y}-${pad(m)}` <= end) { monthKeys.push(`${y}-${pad(m)}`); m++; if (m > 12) { y++; m=1; } }
    // 月選択はキーが変わった場合だけ生成し、選択中のフォーカスを保つ。
    if (monthSelect.dataset.keys !== monthKeys.join(',')) {
      monthSelect.replaceChildren();
      for (const value of monthKeys) {
        const option = document.createElement('option'); option.value=value; option.textContent=monthLabel(value); monthSelect.appendChild(option);
      }
      monthSelect.dataset.keys = monthKeys.join(',');
    }
    monthSelect.value = calendarMonth;
    $('calendar-prev').disabled = calendarMonth === start;
    $('calendar-next').disabled = calendarMonth === end;
    const monthEvents = regionCards().filter((card) => card.dataset.date.startsWith(calendarMonth)).sort((a,b) => a.dataset.date.localeCompare(b.dataset.date));
    const counts = new Map();
    for (const card of monthEvents) counts.set(card.dataset.date,(counts.get(card.dataset.date)||0)+1);
    $('calendar-region').textContent = `${prefecture.value || '全国すべて'}の催事（全国大会・地域の催事）`;
    $('calendar-caption').textContent = `${monthLabel(calendarMonth)} ${prefecture.value || '全国すべて'}の開催日`;
    $('calendar-status').textContent = monthEvents.length ? `${monthLabel(calendarMonth)}は${monthEvents.length}件を掲載しています。` : 'この月の掲載情報はまだありません。前後の月もご覧ください。';
    $('calendar-list').disabled = monthEvents.length === 0;
    const year = Number(calendarMonth.slice(0,4)), month = Number(calendarMonth.slice(5,7));
    const first = new Date(Date.UTC(year,month-1,1)).getUTCDay(), days = new Date(Date.UTC(year,month,0)).getUTCDate();
    const body = $('calendar-days'); body.replaceChildren();
    let row;
    for (let i=0; i<Math.ceil((first+days)/7)*7; i++) {
      if (i%7===0) { row=document.createElement('tr'); body.appendChild(row); }
      const cell=document.createElement('td'); row.appendChild(cell);
      const day=i-first+1;
      if (day<1 || day>days) continue;
      const date=`${calendarMonth}-${pad(day)}`, count=counts.get(date)||0;
      const element=document.createElement(count ? 'button' : 'span');
      element.className='calendar-day'; element.textContent=String(day);
      element.setAttribute('aria-label',`${dateLabel(date)}：${count ? count+'件'+(date<today ? '（過去の情報）' : '') : '掲載情報なし'}`);
      if (date===today) element.setAttribute('aria-current','date');
      if (count) {
        element.type='button'; element.dataset.date=date; element.dataset.past=String(date<today);
        element.setAttribute('aria-pressed',String(dateFilter===date));
        const badge=document.createElement('small'); badge.textContent=`${count}件`; badge.setAttribute('aria-hidden','true'); element.appendChild(badge);
        element.addEventListener('click',()=>selectDate(date));
      }
      cell.appendChild(element);
    }
    const preview=$('calendar-preview'); preview.replaceChildren();
    const forthcoming = monthEvents.filter((card) => card.dataset.date >= today);
    for (const card of (forthcoming.length ? forthcoming : monthEvents).slice(0,3)) {
      const li=document.createElement('li'), button=document.createElement('button');
      button.type='button'; button.textContent=`${Number(card.dataset.date.slice(5,7))}/${Number(card.dataset.date.slice(8))}　${card.querySelector('h3').textContent}`;
      button.addEventListener('click',()=>{ selectDate(card.dataset.date); card.querySelector('h3').setAttribute('tabindex','-1'); card.querySelector('h3').focus(); });
      li.appendChild(button); preview.appendChild(li);
    }
  }
  function filter() {
    const today=todayInJapan(); lastToday=today;
    const past=period.value==='past'; let count=0;
    cards.sort((a,b)=>past ? b.dataset.date.localeCompare(a.dataset.date) : a.dataset.date.localeCompare(b.dataset.date));
    for (const card of cards) {
      const ended=card.dataset.date<today;
      card.dataset.past=String(ended);
      card.querySelector('.event-date__state').textContent=ended ? '過去の開催情報' : card.dataset.date===today ? '本日の予定' : '開催予定';
      const scopeMatch=scope==='prefecture' || card.dataset.scope==='national';
      const regionMatch=!prefecture.value || card.dataset.prefecture===prefecture.value;
      const periodMatch=period.value==='all' || ended===past;
      const dateMatch=!dateFilter || card.dataset.date.startsWith(dateFilter);
      card.hidden=!(scopeMatch && regionMatch && periodMatch && dateMatch);
      if (!card.hidden) count++;
      $('event-list').appendChild(card);
    }
    $('event-count').textContent=`${count}件`;
    $('event-results-heading').textContent=`${prefecture.value ? prefecture.value+'の' : ''}${dateFilter ? dateLabel(dateFilter)+'の催事' : past ? '過去の開催情報' : period.value==='all' ? '予定と過去の開催情報' : 'これからの開催予定'}`;
    $('event-list-note').textContent=past || (dateFilter && dateFilter < today.slice(0,dateFilter.length)) ? '調査で集めた開催記録と過去の告知です。料金・観覧条件は当時の情報で、次回も同じとは限りません。' : '観覧料と出場参加費は異なります。お出かけ前に、主催者の最新案内で開催・開演時刻・入場方法をご確認ください。';
    $('event-empty').hidden=count>0; $('show-past').hidden=past;
    $('event-active-filter').hidden=!dateFilter;
    $('event-date-filter-label').textContent=dateFilter ? `${dateLabel(dateFilter)}で絞り込み中` : '';
    $('event-panel').setAttribute('aria-labelledby','tab-'+scope);
    for (const tab of tabs) { const selected=tab.dataset.scope===scope; tab.setAttribute('aria-selected',String(selected)); tab.tabIndex=selected ? 0 : -1; }
    renderMap(today); renderCalendar(today);
    const params=new URLSearchParams();
    if (scope!=='national') params.set('view',scope);
    if (period.value!=='upcoming') params.set('period',period.value);
    if (prefecture.value) params.set('prefecture',prefecture.value);
    if (dateFilter) params.set('date',dateFilter);
    if (calendarMonth!==today.slice(0,7)) params.set('month',calendarMonth);
    try { history.replaceState(null,'',location.pathname+(params.size ? '?'+params.toString() : '')+location.hash); } catch (_) { /* ローカルファイル表示 */ }
  }
  function selectRegion(value) {
    scope='prefecture'; prefecture.value=value; dateFilter='';
    const today=todayInJapan(), local=regionCards();
    const future=local.filter((card)=>card.dataset.date>=today).sort((a,b)=>a.dataset.date.localeCompare(b.dataset.date));
    period.value=future.length || !local.length ? 'upcoming' : 'past';
    calendarMonth=future.length ? future[0].dataset.date.slice(0,7) : local.length ? local.map((card)=>card.dataset.date).sort().pop().slice(0,7) : today.slice(0,7);
    filter();
  }
  function selectDate(value) { dateFilter=value; scope='prefecture'; period.value='all'; calendarMonth=value.slice(0,7); filter(); focusResults(); }
  function changeMonth(value) { calendarMonth=value; if (dateFilter) dateFilter=value; filter(); }
  function selectTab(value) { scope=value; dateFilter=''; if (scope==='national') prefecture.value=''; filter(); }
  const params=new URLSearchParams(location.search);
  if (params.get('view')==='prefecture') scope='prefecture';
  if (['past','all'].includes(params.get('period'))) period.value=params.get('period');
  if (Array.from(prefecture.options).some((option)=>option.value===params.get('prefecture'))) { prefecture.value=params.get('prefecture'); if (prefecture.value) scope='prefecture'; }
  const minimum=cards.map((card)=>card.dataset.date.slice(0,7)).concat([calendarMonth]).sort()[0];
  const maximum=cards.map((card)=>card.dataset.date.slice(0,7)).concat([calendarMonth]).sort().pop();
  const inRange=(value)=>validDate(value) && value.slice(0,7)>=minimum && value.slice(0,7)<=maximum;
  if (inRange(params.get('month')) && params.get('month').length===7) calendarMonth=params.get('month');
  if (inRange(params.get('date'))) { dateFilter=params.get('date'); calendarMonth=dateFilter.slice(0,7); scope='prefecture'; period.value='all'; }
  for (const tab of tabs) {
    tab.disabled=false;
    tab.addEventListener('click',()=>selectTab(tab.dataset.scope));
    tab.addEventListener('keydown',(event)=>{
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const index=event.key==='Home' ? 0 : event.key==='End' ? tabs.length-1 : (tabs.indexOf(tab)+(event.key==='ArrowRight' ? 1 : -1)+tabs.length)%tabs.length;
      selectTab(tabs[index].dataset.scope); tabs[index].focus();
    });
  }
  for (const link of mapLinks) link.addEventListener('click',(event)=>{ event.preventDefault(); selectRegion(link.dataset.prefecture); });
  for (const id of ['event-period','event-prefecture','calendar-month','calendar-today','calendar-list']) $(id).disabled=false;
  period.addEventListener('change',()=>{ dateFilter=''; filter(); });
  prefecture.addEventListener('change',()=>selectRegion(prefecture.value));
  $('map-results-link').addEventListener('click',(event)=>{ event.preventDefault(); selectRegion(prefecture.value); focusResults(); });
  monthSelect.addEventListener('change',()=>changeMonth(monthSelect.value));
  for (const [id,offset] of [['calendar-prev',-1],['calendar-next',1]]) $(id).addEventListener('click',()=>{
    const d=new Date(Date.UTC(Number(calendarMonth.slice(0,4)),Number(calendarMonth.slice(5,7))-1+offset,1)); changeMonth(d.toISOString().slice(0,7));
  });
  $('calendar-today').addEventListener('click',()=>changeMonth(todayInJapan().slice(0,7)));
  $('calendar-list').addEventListener('click',()=>selectDate(calendarMonth));
  $('clear-date').addEventListener('click',()=>{ dateFilter=''; period.value='upcoming'; filter(); focusResults(); });
  $('show-past').addEventListener('click',()=>{ period.value='past'; dateFilter=''; filter(); focusResults(); });
  filter();
  window.addEventListener('pageshow',filter);
  // 毎分の再描画で操作中のフォーカスを失わせず、日本時間の日付が変わった時に更新する。
  window.setInterval(()=>{ if (todayInJapan()!==lastToday) filter(); },60000);
}());
