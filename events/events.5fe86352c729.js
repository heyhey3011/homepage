(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const cards = Array.from(document.querySelectorAll('.event-card'));
  const tabs = Array.from(document.querySelectorAll('.event-tabs [role="tab"]'));
  const mapLinks = Array.from(document.querySelectorAll('.map-prefecture'));
  const period = $('event-period'), prefecture = $('event-prefecture'), monthSelect = $('calendar-month');
  let scope='national', dateFilter='', calendarMonth=todayInJapan().slice(0,7), lastToday='', mapGroups=[];
  const pad=(n)=>String(n).padStart(2,'0');
  function todayInJapan() {
    const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const get=(name)=>parts.find((part)=>part.type===name).value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  }
  function validDate(value) {
    if (!/^\d{4}-\d{2}(?:-\d{2})?$/.test(value||'')) return false;
    const normalized=value.length===7?value+'-01':value, d=new Date(normalized+'T00:00:00Z');
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0,10)===normalized;
  }
  function shiftMonth(value,offset) { return new Date(Date.UTC(Number(value.slice(0,4)),Number(value.slice(5,7))-1+offset,1)).toISOString().slice(0,7); }
  function monthLabel(value) { return `${Number(value.slice(0,4))}年${Number(value.slice(5,7))}月`; }
  function dateLabel(value) { return monthLabel(value)+(value.length===10?`${Number(value.slice(8))}日`:''); }
  function shortDate(value) { return `${Number(value.slice(5,7))}/${Number(value.slice(8))}`; }
  function regionCards() { return cards.filter((card)=>!prefecture.value||card.dataset.prefecture===prefecture.value); }
  function sorted(items) { return items.slice().sort((a,b)=>a.dataset.date.localeCompare(b.dataset.date)); }
  function el(tag,className,text) { const node=document.createElement(tag); if(className) node.className=className; if(text!==undefined) node.textContent=text; return node; }
  function focusResults() { $('event-results-heading').focus(); }
  function openEvent(card) {
    scope='prefecture'; prefecture.value=card.dataset.prefecture; dateFilter=card.dataset.date; period.value='all'; filter();
    const heading=card.querySelector('h3'); heading.setAttribute('tabindex','-1'); heading.focus();
  }
  function eventLink(card,className) {
    const link=el('a',className); link.href='#'+card.id;
    link.setAttribute('aria-label',`${dateLabel(card.dataset.date)} ${card.dataset.prefecture} ${card.querySelector('h3').textContent}の詳しい案内`);
    link.addEventListener('click',(event)=>{event.preventDefault();openEvent(card);}); return link;
  }
  function renderMap(today) {
    const next=shiftMonth(calendarMonth,1), historical=next<today.slice(0,7);
    const windowCards=sorted(cards.filter((card)=>card.dataset.date.slice(0,7)>=calendarMonth&&card.dataset.date.slice(0,7)<=next&&(historical||card.dataset.date>=today)));
    $('explorer-range').textContent=`${monthLabel(calendarMonth)}・${monthLabel(next)}`;
    $('map-window-note').textContent=historical?'この2か月の過去の開催情報です。線の先に、日付と催事名を表示しています。':`地図はこの2か月の、今日からの予定 ${windowCards.length}件。カレンダーでは過ぎた日程も見られます。`;
    $('map-empty').hidden=windowCards.length>0;
    for(const side of ['left','right']) $('map-callouts-'+side).replaceChildren();
    mapGroups=[];
    for(const link of mapLinks) {
      const name=link.dataset.prefecture, items=windowCards.filter((card)=>card.dataset.prefecture===name), label=`${name}：表示期間${items.length}件`;
      link.dataset.state=items.length?'upcoming':'none'; link.setAttribute('aria-label',label); link.querySelector('title').textContent=label;
      link.setAttribute('aria-current',String(prefecture.value===name));
      if(!items.length) continue;
      const number=mapGroups.length+1,side=link.dataset.side,box=el('section','map-callout');box.dataset.prefecture=name;box.setAttribute('style',`--map-order:${number}`);
      const heading=el('h4');heading.appendChild(el('span','map-number',String(number)));heading.appendChild(el('span','',name));box.appendChild(heading);
      const list=el('ul');
      for(const card of items) {
        const item=el('li'),anchor=eventLink(card,'map-event'),date=el('time','map-event-date',shortDate(card.dataset.date));date.setAttribute('datetime',card.dataset.date);
        if(card.dataset.date.slice(0,7)===next) date.className+=' is-next';
        anchor.appendChild(date);anchor.appendChild(el('span','map-event-name',card.dataset.shortName||card.querySelector('h3').textContent));item.appendChild(anchor);list.appendChild(item);
      }
      box.appendChild(list);$('map-callouts-'+side).appendChild(box);mapGroups.push({link,box,number,side});
    }
    // 地形の上下順に配置して線の交差を減らす。
    for(const side of ['left','right']) {
      const groups=mapGroups.filter(g=>g.side===side).sort((a,b)=>anchorY(a)-anchorY(b));
      for(const group of groups) $('map-callouts-'+side).appendChild(group.box);
    }
    const local=regionCards(),future=local.filter(card=>card.dataset.date>=today).length,name=prefecture.value||'全国すべて';
    $('map-selection').textContent=local.length?`${name}：これから${future}件 ／ 過去${local.length-future}件`:`${name}：情報募集中です。開催がないという意味ではありません。`;
    $('map-results-link').textContent=`${name}の詳しい一覧へ ↓`;
    for(const option of Array.from(prefecture.options)) {
      if(!option.value) continue;
      const localEvents=cards.filter(card=>card.dataset.prefecture===option.value),upcoming=localEvents.filter(card=>card.dataset.date>=today).length;
      option.textContent=`${option.value}（予定${upcoming}／過去${localEvents.length-upcoming}）`;
    }
    window.requestAnimationFrame(drawConnectors);
  }
  function anchorY(group) { const box=group.link.querySelector('path').getBoundingClientRect(); return box.top+box.height/2; }
  function drawConnectors() {
    const svg=$('map-connectors'),bounds=$('map-board').getBoundingClientRect();svg.replaceChildren();if(!bounds.width)return;
    svg.setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);
    const compact=window.matchMedia('(max-width: 959px)').matches;
    function shape(tag,attrs,text) {
      const node=document.createElementNS('http://www.w3.org/2000/svg',tag);
      for(const [key,value] of Object.entries(attrs))node.setAttribute(key,String(value));
      if(text)node.textContent=text;svg.appendChild(node);
    }
    const mapBounds=$('japan-map').getBoundingClientRect(),counts={left:0,right:0},indices={left:0,right:0};
    for(const group of mapGroups)counts[group.side]++;
    for(const group of mapGroups.slice().sort((a,b)=>anchorY(a)-anchorY(b))) {
      const p=group.link.querySelector('path').getBoundingClientRect(),b=group.box.getBoundingClientRect();
      const x=p.left+p.width/2-bounds.left,y=p.top+p.height/2-bounds.top;
      let endX=group.side==='left'?b.right-bounds.left:b.left-bounds.left,endY=b.top-bounds.top+24;
      if(compact){endX=group.side==='left'?64:bounds.width-64;endY=mapBounds.top-bounds.top+24+(indices[group.side]++)*(Math.max(mapBounds.height-48,1)/Math.max(counts[group.side]-1,1));}
      const elbow=group.side==='left'?endX+18:endX-18;
      shape('path',{d:`M${x},${y} L${elbow},${endY} L${endX},${endY}`,class:'map-leader',fill:'none',stroke:'#87a593','stroke-width':1.4});
      shape('circle',{cx:x,cy:y,r:3.5,fill:'#49775e',stroke:'#fff','stroke-width':1.5});
      if(compact){const lx=group.side==='left'?0:bounds.width-62;shape('rect',{x:lx,y:endY-12,width:62,height:25,rx:5,fill:'#fffdf7',stroke:'#c8d9cb'});shape('text',{x:lx+31,y:endY+4,'text-anchor':'middle',fill:'#355b49','font-size':12,'font-weight':700},`${group.number} ${group.link.dataset.prefecture.replace(/[都府県]$/,'')}`);}
    }
  }
  function renderCalendar(today) {
    const months=cards.map(card=>card.dataset.date.slice(0,7)).concat([today.slice(0,7),calendarMonth]).sort(),start=months[0],end=months[months.length-1],keys=[];
    for(let value=start;value<=end;value=shiftMonth(value,1))keys.push(value);
    if(monthSelect.dataset.keys!==keys.join(',')){monthSelect.replaceChildren();for(const value of keys){const option=el('option','',monthLabel(value));option.value=value;monthSelect.appendChild(option);}monthSelect.dataset.keys=keys.join(',');}
    monthSelect.value=calendarMonth;$('calendar-prev').disabled=calendarMonth===start;$('calendar-next').disabled=calendarMonth===end;
    $('calendar-region').textContent=`${prefecture.value||'全国すべて'}の催事（全国大会・地域の催事）`;
    const pair=$('calendar-pair');pair.replaceChildren();let total=0;
    for(let offset=0;offset<2;offset++) {
      const key=shiftMonth(calendarMonth,offset),items=sorted(regionCards().filter(card=>card.dataset.date.startsWith(key)));total+=items.length;
      const section=el('section','calendar-month-panel');section.dataset.month=key;
      const heading=el('h4','calendar-month-heading',monthLabel(key));heading.appendChild(el('span','',`${items.length}件`));section.appendChild(heading);
      const scroller=el('div','calendar-scroll');scroller.tabIndex=0;scroller.setAttribute('role','region');scroller.setAttribute('aria-label',`${monthLabel(key)}のカレンダー。狭い画面では横にスクロールできます`);
      const table=el('table','event-calendar');table.appendChild(el('caption','',`${monthLabel(key)} ${prefecture.value||'全国すべて'}の催事`));
      const thead=el('thead'),header=el('tr');for(const day of '日月火水木金土'){const th=el('th','',day);th.setAttribute('scope','col');header.appendChild(th);}thead.appendChild(header);table.appendChild(thead);
      const body=el('tbody');table.appendChild(body);
      const year=Number(key.slice(0,4)),month=Number(key.slice(5,7)),first=new Date(Date.UTC(year,month-1,1)).getUTCDay(),days=new Date(Date.UTC(year,month,0)).getUTCDate();let row;
      for(let i=0;i<Math.ceil((first+days)/7)*7;i++) {
        if(i%7===0){row=el('tr');body.appendChild(row);}const cell=el('td');row.appendChild(cell);const day=i-first+1;
        if(day<1||day>days){cell.className='calendar-blank';continue;}
        const date=`${key}-${pad(day)}`,events=items.filter(card=>card.dataset.date===date);cell.dataset.date=date;cell.dataset.past=String(date<today);
        const dayNumber=el(events.length?'button':'span','calendar-day',String(day));dayNumber.setAttribute('aria-label',`${dateLabel(date)}：${events.length}件${date<today?'（終了）':''}`);
        if(date===today){dayNumber.setAttribute('aria-current','date');dayNumber.appendChild(el('small','','今日'));}
        if(events.length){dayNumber.type='button';dayNumber.addEventListener('click',()=>selectDate(date));}cell.appendChild(dayNumber);
        for(const card of events){const link=eventLink(card,'calendar-event');link.appendChild(el('span','calendar-event-place',card.dataset.prefecture));link.appendChild(el('span','calendar-event-name',card.dataset.shortName||card.querySelector('h3').textContent));if(date<today)link.appendChild(el('small','calendar-ended','終了'));cell.appendChild(link);}
      }
      scroller.appendChild(table);section.appendChild(scroller);section.appendChild(el('p','calendar-scroll-hint','← 横にスクロールして土曜日まで見られます →'));
      const button=el('button','calendar-month-list','この月の一覧を見る ↓');button.type='button';button.disabled=!items.length;button.addEventListener('click',()=>selectDate(key));section.appendChild(button);pair.appendChild(section);
    }
    $('calendar-status').textContent=`表示中の2か月：${total}件。催事名を押すと、日時・会場・観覧料・見学方法を確認できます。`;
  }
  function filter() {
    const today=todayInJapan();lastToday=today;const past=period.value==='past';let count=0;
    cards.sort((a,b)=>past?b.dataset.date.localeCompare(a.dataset.date):a.dataset.date.localeCompare(b.dataset.date));
    for(const card of cards){const ended=card.dataset.date<today;card.dataset.past=String(ended);card.querySelector('.event-date__state').textContent=ended?'過去の開催情報':card.dataset.date===today?'本日の予定':'開催予定';card.hidden=!((scope==='prefecture'||card.dataset.scope==='national')&&(!prefecture.value||card.dataset.prefecture===prefecture.value)&&(period.value==='all'||ended===past)&&(!dateFilter||card.dataset.date.startsWith(dateFilter)));if(!card.hidden)count++;$('event-list').appendChild(card);}
    $('event-count').textContent=`${count}件`;
    $('event-results-heading').textContent=`${prefecture.value?prefecture.value+'の':''}${dateFilter?dateLabel(dateFilter)+'の催事':past?'過去の開催情報':period.value==='all'?'予定と過去の開催情報':'これからの開催予定'}`;
    $('event-list-note').textContent=past||(dateFilter&&dateFilter<today.slice(0,dateFilter.length))?'調査で集めた開催記録と過去の告知です。料金・観覧条件は当時の情報で、次回も同じとは限りません。':'観覧料と出場参加費は異なります。お出かけ前に、主催者の最新案内で開催・開演時刻・入場方法をご確認ください。';
    $('event-empty').hidden=count>0;$('show-past').hidden=past;$('event-active-filter').hidden=!dateFilter;$('event-date-filter-label').textContent=dateFilter?`${dateLabel(dateFilter)}で絞り込み中`:'';
    $('event-panel').setAttribute('aria-labelledby','tab-'+scope);for(const tab of tabs){const selected=tab.dataset.scope===scope;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;}
    renderMap(today);renderCalendar(today);
    const params=new URLSearchParams();if(scope!=='national')params.set('view',scope);if(period.value!=='upcoming')params.set('period',period.value);if(prefecture.value)params.set('prefecture',prefecture.value);if(dateFilter)params.set('date',dateFilter);if(calendarMonth!==today.slice(0,7))params.set('month',calendarMonth);
    try{history.replaceState(null,'',location.pathname+(params.size?'?'+params.toString():'')+location.hash);}catch(_){/* ローカルファイル表示 */}
  }
  function selectRegion(value){scope='prefecture';prefecture.value=value;dateFilter='';const local=regionCards(),today=todayInJapan();period.value=local.some(card=>card.dataset.date>=today)||!local.length?'upcoming':'past';filter();}
  function selectDate(value){dateFilter=value;scope='prefecture';period.value='all';if(value.slice(0,7)<calendarMonth||value.slice(0,7)>shiftMonth(calendarMonth,1))calendarMonth=value.slice(0,7);filter();focusResults();}
  function changeMonth(value){calendarMonth=value;if(dateFilter)dateFilter=value;filter();}
  function selectTab(value){scope=value;dateFilter='';if(scope==='national')prefecture.value='';filter();}
  const params=new URLSearchParams(location.search);
  if(params.get('view')==='prefecture')scope='prefecture';if(['past','all'].includes(params.get('period')))period.value=params.get('period');
  if(Array.from(prefecture.options).some(option=>option.value===params.get('prefecture'))){prefecture.value=params.get('prefecture');if(prefecture.value)scope='prefecture';}
  const minimum=cards.map(card=>card.dataset.date.slice(0,7)).concat([calendarMonth]).sort()[0],maximum=cards.map(card=>card.dataset.date.slice(0,7)).concat([calendarMonth]).sort().pop();
  const inRange=value=>validDate(value)&&value.slice(0,7)>=minimum&&value.slice(0,7)<=maximum;
  if(inRange(params.get('month'))&&params.get('month').length===7)calendarMonth=params.get('month');
  if(inRange(params.get('date'))){dateFilter=params.get('date');scope='prefecture';period.value='all';if(!params.get('month')&&(dateFilter.slice(0,7)<calendarMonth||dateFilter.slice(0,7)>shiftMonth(calendarMonth,1)))calendarMonth=dateFilter.slice(0,7);}
  for(const tab of tabs){tab.disabled=false;tab.addEventListener('click',()=>selectTab(tab.dataset.scope));tab.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const index=event.key==='Home'?0:event.key==='End'?tabs.length-1:(tabs.indexOf(tab)+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;selectTab(tabs[index].dataset.scope);tabs[index].focus();});}
  for(const link of mapLinks)link.addEventListener('click',event=>{event.preventDefault();selectRegion(link.dataset.prefecture);});
  for(const id of ['event-period','event-prefecture','calendar-month','calendar-today'])$(id).disabled=false;
  period.addEventListener('change',()=>{dateFilter='';filter();});prefecture.addEventListener('change',()=>selectRegion(prefecture.value));
  $('map-results-link').addEventListener('click',event=>{event.preventDefault();selectRegion(prefecture.value);focusResults();});monthSelect.addEventListener('change',()=>changeMonth(monthSelect.value));
  for(const [id,offset] of [['calendar-prev',-1],['calendar-next',1]])$(id).addEventListener('click',()=>changeMonth(shiftMonth(calendarMonth,offset)));
  $('calendar-today').addEventListener('click',()=>{prefecture.value='';dateFilter='';changeMonth(todayInJapan().slice(0,7));});
  $('clear-date').addEventListener('click',()=>{dateFilter='';period.value='upcoming';filter();focusResults();});$('show-past').addEventListener('click',()=>{period.value='past';dateFilter='';filter();focusResults();});
  filter();window.addEventListener('pageshow',filter);if(window.ResizeObserver)new ResizeObserver(drawConnectors).observe($('map-board'));window.addEventListener('resize',drawConnectors);if(document.fonts)document.fonts.ready.then(drawConnectors);
  window.setInterval(()=>{const today=todayInJapan();if(today!==lastToday){if(calendarMonth===lastToday.slice(0,7))calendarMonth=today.slice(0,7);filter();}},60000);
}());
