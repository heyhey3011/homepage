// DOMの小さな代替で、実際の events.js の状態遷移を検査する（ブラウザ操作なし）。
const fs=require('node:fs'), path=require('node:path'), vm=require('node:vm'), assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const data=JSON.parse(fs.readFileSync(path.join(root,'events/events.json'),'utf8'));
const html=fs.readFileSync(path.join(root,'events/index.html'),'utf8');
const code=fs.readFileSync(path.join(root,'events/events.js'),'utf8');
const today='2026-09-16';
const expected=(predicate)=>data.events.filter(predicate).length;
function setup(instant='2026-09-16T03:00:00Z',search='') {
  const nodes=new Map();
  class Element {
    constructor(id='') { this.id=id; this.dataset={}; this.listeners={}; this.attributes={}; this.children=[]; this.hidden=false; this.disabled=true; this.value=''; this.textContent=''; }
    addEventListener(name,fn){this.listeners[name]=fn;}
    setAttribute(name,value){this.attributes[name]=value;}
    appendChild(child){const i=this.children.indexOf(child);if(i>=0)this.children.splice(i,1);this.children.push(child);return child;}
    replaceChildren(){this.children=[];}
    get options(){return this.children;}
    focus(){this.focused=true;}
    querySelector(selector){return selector==='h3'?this.title:this.state;}
    fire(name,event={}){assert.ok(this.listeners[name],`${this.id} missing ${name}`);this.listeners[name](event);}
  }
  for(const [,id] of html.matchAll(/\bid="([^"]+)"/g)) nodes.set(id,new Element(id));
  const cards=data.events.map(e=>{const c=new Element(e.id);c.dataset={date:e.date,scope:e.scope,prefecture:e.prefecture};c.state=new Element();c.title=new Element();c.title.textContent=e.name;return c;});
  const tabs=['national','prefecture'].map(scope=>{const e=new Element('tab-'+scope);e.dataset.scope=scope;return e;});
  const prefs=Array.from(html.matchAll(/class="map-prefecture" data-prefecture="([^"]+)"/g),m=>m[1]);
  const maps=prefs.map(pref=>{const e=new Element();e.dataset.prefecture=pref;e.state=new Element();return e;});
  for(const value of ['',...prefs]){const o=new Element();o.value=value;nodes.get('event-prefecture').appendChild(o);}
  nodes.get('event-period').value='upcoming';
  const state={now:instant};class FixedDate extends Date{constructor(...args){super(...(args.length?args:[state.now]));}}
  const timers=[],history={replaceState(_a,_b,url){this.url=url;}};
  const context={document:{getElementById:id=>nodes.get(id),createElement:tag=>{const e=new Element();e.tagName=tag;return e;},querySelectorAll:sel=>sel==='.event-card'?cards:sel==='.map-prefecture'?maps:tabs},Date:FixedDate,Intl,URLSearchParams,location:{pathname:'/events/',search,hash:''},history,window:{addEventListener(){},setInterval(fn){timers.push(fn);}}};
  vm.runInNewContext(code,context);
  const descendants=(e)=>e.children.flatMap(c=>[c,...descendants(c)]);
  return {nodes,cards,tabs,maps,history,timers,state,visible:()=>nodes.get('event-list').children.filter(c=>!c.hidden),calendar:()=>descendants(nodes.get('calendar-days')),day:date=>descendants(nodes.get('calendar-days')).find(c=>c.dataset.date===date),change:(id,value)=>{nodes.get(id).value=value;nodes.get(id).fire('change');},region:pref=>maps.find(m=>m.dataset.prefecture===pref).fire('click',{preventDefault(){}})};
}
const ui=setup();
assert.equal(ui.maps.length,47);
assert.equal(ui.visible().length,expected(e=>e.scope==='national'&&e.date>=today));
assert.equal(ui.visible()[0].id,'E057');
ui.change('event-period','past');
assert.equal(ui.visible().length,expected(e=>e.scope==='national'&&e.date<today));
ui.tabs[1].fire('click');
assert.equal(ui.visible().length,expected(e=>e.date<today));
ui.change('event-prefecture','福島県');
assert.equal(ui.visible().length,expected(e=>e.prefecture==='福島県'&&e.date<today));
ui.change('event-period','upcoming');assert.equal(ui.visible().length,0);assert.equal(ui.nodes.get('event-empty').hidden,false);
ui.nodes.get('show-past').fire('click');assert.equal(ui.visible().length,2);
ui.tabs[1].fire('keydown',{key:'ArrowRight',preventDefault(){}});
assert.equal(ui.tabs[0].attributes['aria-selected'],'true');assert.equal(ui.nodes.get('event-prefecture').value,'');assert.equal(ui.tabs[0].focused,true);
// 日本地図はすべての県を選べる。予定がない県では過去へ、未掲載県では空表示へ。
ui.region('福岡県');assert.equal(ui.visible()[0].id,'E084');assert.equal(ui.nodes.get('calendar-month').value,'2026-10');assert.equal(ui.day('2026-10-17').attributes['aria-label'],'2026年10月17日：1件');
assert.equal(ui.maps.find(m=>m.dataset.prefecture==='福岡県').attributes['aria-current'],'true');
ui.day('2026-10-17').fire('click');assert.equal(ui.visible().length,1);assert.ok(ui.history.url.includes('date=2026-10-17'));assert.equal(ui.nodes.get('event-results-heading').focused,true);
ui.region('鳥取県');assert.equal(ui.visible()[0].id,'E093');assert.equal(ui.nodes.get('event-period').value,'past');assert.equal(ui.nodes.get('calendar-month').value,'2026-06');
ui.region('佐賀県');assert.equal(ui.visible().length,0);assert.match(ui.nodes.get('map-selection').textContent,/情報募集中/);
// カレンダーは当月の過去も含む。全国タブの初期表示でも地域催事を日付から開ける。
const dates=setup();assert.ok(dates.day('2026-09-23'));dates.day('2026-09-23').fire('click');assert.equal(dates.visible()[0].id,'E094');assert.equal(dates.tabs[1].attributes['aria-selected'],'true');
dates.nodes.get('calendar-next').fire('click');assert.ok(dates.visible().every(c=>c.dataset.date.startsWith('2026-10')));assert.equal(dates.visible().length,expected(e=>e.date.startsWith('2026-10')));
dates.nodes.get('calendar-next').fire('click');assert.match(dates.day('2026-11-03').attributes['aria-label'],/3件/);
dates.day('2026-11-03').fire('click');assert.equal(dates.visible().length,3);
dates.nodes.get('clear-date').fire('click');assert.equal(dates.nodes.get('event-active-filter').hidden,true);assert.equal(dates.visible().length,expected(e=>e.date>=today));
dates.change('calendar-month','2026-02');assert.equal(dates.calendar().filter(e=>e.className==='calendar-day').length,28);assert.equal(dates.nodes.get('calendar-days').children.length,4);
dates.nodes.get('calendar-list').fire('click');assert.ok(dates.visible().every(c=>c.dataset.date.startsWith('2026-02')));
dates.change('calendar-month','2026-12');assert.equal(dates.nodes.get('calendar-list').disabled,true);assert.equal(dates.nodes.get('event-empty').hidden,false);
dates.nodes.get('calendar-today').fire('click');assert.equal(dates.nodes.get('calendar-month').value,'2026-09');
dates.change('calendar-month','2025-09');assert.equal(dates.nodes.get('calendar-prev').disabled,true);
dates.change('calendar-month','2027-04');assert.equal(dates.nodes.get('calendar-next').disabled,true);
// URL復元・不正日付・範囲外の年に対応し、極端な範囲の月生成を防ぐ。
assert.equal(setup(undefined,'?view=prefecture&period=past&prefecture=東京都').visible().length,expected(e=>e.prefecture==='東京都'&&e.date<today));
assert.equal(setup(undefined,'?date=2026-11-03').visible().length,3);
for(const query of ['?date=2026-02-30','?date=9999-01-01','?view=bad&period=bad&prefecture=bad','?month=2026-13']) assert.equal(setup(undefined,query).visible().length,expected(e=>e.scope==='national'&&e.date>=today));
// 同一日中のタイマーは再描画しない。日本時間0時を越えると本日の予定を過去に移す。
const boundary=setup('2026-09-20T14:59:00Z');assert.equal(boundary.visible()[0].state.textContent,'本日の予定');
const first=boundary.nodes.get('calendar-days').children[0];boundary.timers[0]();assert.equal(boundary.nodes.get('calendar-days').children[0],first);
boundary.state.now='2026-09-20T15:01:00Z';boundary.timers[0]();assert.ok(!boundary.visible().some(c=>c.id==='E057'));
assert.equal(setup('2028-01-01T03:00:00Z').visible().length,0);
console.log('PASS: map selection, 47 regions, calendar dates/counts/months, combined filters, URL restoration, keyboard tabs, empty state, JST rollover.');
