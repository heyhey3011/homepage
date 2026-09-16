// 実際のページスクリプトを固定日時で実行し、表示する予定と状態遷移を検証。
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),data=JSON.parse(fs.readFileSync(path.join(root,'events/events.json'),'utf8'));
const html=fs.readFileSync(path.join(root,'events/index.html'),'utf8'),code=fs.readFileSync(path.join(root,'events/events.js'),'utf8');
const expected=predicate=>data.events.filter(predicate).length;
function setup(instant='2026-09-17T03:00:00Z',search='') {
  const nodes=new Map();
  class Element {
    constructor(id=''){this.id=id;this.dataset={};this.listeners={};this.attributes={};this.children=[];this.hidden=false;this.disabled=true;this.value='';this.textContent='';}
    addEventListener(name,fn){this.listeners[name]=fn;}setAttribute(name,value){this.attributes[name]=value;}
    appendChild(child){const i=this.children.indexOf(child);if(i>=0)this.children.splice(i,1);this.children.push(child);return child;}
    replaceChildren(){this.children=[];}get options(){return this.children;}focus(){this.focused=true;}
    querySelector(selector){return selector==='h3'?this.title:selector==='path'?this:this.state;}
    getBoundingClientRect(){return {top:0,left:0,right:0,width:0,height:0};}
    fire(name,event={preventDefault(){}}){assert.ok(this.listeners[name],`${this.id} missing ${name}`);this.listeners[name](event);}
  }
  for(const [,id]of html.matchAll(/\bid="([^"]+)"/g))nodes.set(id,new Element(id));
  const cards=data.events.map(e=>{const c=new Element('event-'+e.id);c.dataset={date:e.date,scope:e.scope,prefecture:e.prefecture,shortName:e.short_name||e.name};c.state=new Element();c.title=new Element();c.title.textContent=e.name;return c;});
  const tabs=['national','prefecture'].map(scope=>{const e=new Element('tab-'+scope);e.dataset.scope=scope;return e;});
  const prefs=Array.from(html.matchAll(/class="map-prefecture" data-prefecture="([^"]+)" data-side="([^"]+)"/g));
  const maps=prefs.map(([,pref,side])=>{const e=new Element();e.dataset={prefecture:pref,side};e.state=new Element();return e;});
  for(const value of ['',...maps.map(m=>m.dataset.prefecture)]){const o=new Element();o.value=value;nodes.get('event-prefecture').appendChild(o);}
  nodes.get('event-period').value='upcoming';
  const state={now:instant};class FixedDate extends Date{constructor(...args){super(...(args.length?args:[state.now]));}}
  const timers=[],history={replaceState(_a,_b,url){this.url=url;}};
  vm.runInNewContext(code,{document:{getElementById:id=>nodes.get(id),createElement:tag=>{const e=new Element();e.tagName=tag;return e;},querySelectorAll:sel=>sel==='.event-card'?cards:sel==='.map-prefecture'?maps:tabs},Date:FixedDate,Intl,URLSearchParams,location:{pathname:'/events/',search,hash:''},history,window:{requestAnimationFrame(fn){fn();},addEventListener(){},setInterval(fn){timers.push(fn);}}});
  const descendants=e=>e.children.flatMap(c=>[c,...descendants(c)]);
  const calendar=()=>descendants(nodes.get('calendar-pair'));
  return {nodes,cards,tabs,maps,history,timers,state,visible:()=>nodes.get('event-list').children.filter(c=>!c.hidden),calendar,panels:()=>nodes.get('calendar-pair').children,day:date=>calendar().find(c=>c.dataset.date===date),mapEvents:()=>['left','right'].flatMap(side=>descendants(nodes.get('map-callouts-'+side))).filter(n=>n.className==='map-event'),change:(id,value)=>{nodes.get(id).value=value;nodes.get(id).fire('change');},region:pref=>maps.find(m=>m.dataset.prefecture===pref).fire('click')};
}
const ui=setup();
assert.equal(ui.maps.length,47);
assert.equal(ui.visible().length,expected(e=>e.scope==='national'&&e.date>='2026-09-17'));
assert.deepEqual(ui.panels().map(p=>p.dataset.month),['2026-09','2026-10']);
assert.equal(ui.mapEvents().length,13);
assert.equal(ui.calendar().filter(n=>n.className==='calendar-event').length,17);
assert.equal(ui.day('2026-09-05').dataset.past,'true');
assert.ok(ui.day('2026-09-05').children.some(n=>n.className==='calendar-event'));
// クリック前に日付・開催県・略称がある。同日の複数催事も省略されない。
const oct18=ui.day('2026-10-18').children.filter(n=>n.className==='calendar-event');assert.equal(oct18.length,2);
assert.ok(oct18.every(link=>link.children.some(c=>c.className==='calendar-event-name'&&c.textContent.length>0)));
assert.ok(ui.mapEvents().every(link=>link.children[0].attributes.datetime&&link.children[1].textContent.length>0));
// 来月の催事から詳細を開いても、表示期間を翌月へずらさない。
oct18[0].fire('click');assert.equal(ui.visible().length,1);assert.ok(ui.visible()[0].dataset.date==='2026-10-18');assert.equal(ui.nodes.get('calendar-month').value,'2026-09');
ui.nodes.get('calendar-today').fire('click');assert.equal(ui.nodes.get('event-prefecture').value,'');
ui.region('福岡県');assert.equal(ui.visible()[0].id,'event-E084');assert.equal(ui.nodes.get('calendar-month').value,'2026-09');assert.equal(ui.calendar().filter(n=>n.className==='calendar-event').length,2);
ui.region('鳥取県');assert.equal(ui.visible()[0].id,'event-E093');assert.equal(ui.nodes.get('event-period').value,'past');
ui.region('佐賀県');assert.equal(ui.visible().length,0);assert.match(ui.nodes.get('map-selection').textContent,/情報募集中/);
ui.tabs[1].fire('keydown',{key:'ArrowRight',preventDefault(){}});assert.equal(ui.tabs[0].attributes['aria-selected'],'true');assert.equal(ui.nodes.get('event-prefecture').value,'');
const dates=setup();dates.day('2026-09-23').children[0].fire('click');assert.equal(dates.visible()[0].id,'event-E094');
dates.nodes.get('calendar-next').fire('click');assert.equal(dates.visible().length,expected(e=>e.date.startsWith('2026-10')));
dates.nodes.get('calendar-next').fire('click');assert.equal(dates.day('2026-11-03').children.filter(n=>n.className==='calendar-event').length,3);
dates.day('2026-11-03').children[0].fire('click');assert.equal(dates.visible().length,3);
dates.change('calendar-month','2026-12');assert.deepEqual(dates.panels().map(p=>p.dataset.month),['2026-12','2027-01']);
assert.equal(dates.panels()[0].children.at(-1).disabled,true);
dates.change('calendar-month','2026-02');assert.equal(dates.calendar().filter(n=>n.dataset.date?.startsWith('2026-02')).length,28);
dates.change('calendar-month','2024-02');assert.equal(dates.calendar().filter(n=>n.dataset.date?.startsWith('2024-02')).length,29);
assert.equal(dates.day('2024-02-29').children[0].textContent,'29');
dates.change('calendar-month','2025-09');assert.equal(dates.nodes.get('calendar-prev').disabled,true);
dates.change('calendar-month','2027-04');assert.equal(dates.nodes.get('calendar-next').disabled,true);
// 過去の2か月は過去の記録を地図でも読める。
const archive=setup(undefined,'?month=2026-06');assert.equal(archive.mapEvents().length,expected(e=>e.date>='2026-06-01'&&e.date<'2026-08-01'));
assert.equal(setup(undefined,'?view=prefecture&period=past&prefecture=東京都').visible().length,expected(e=>e.prefecture==='東京都'&&e.date<'2026-09-17'));
assert.equal(setup(undefined,'?date=2026-11-03').visible().length,3);
for(const query of ['?date=2026-02-30','?date=9999-01-01','?view=bad&period=bad&prefecture=bad','?month=2026-13'])assert.equal(setup(undefined,query).visible().length,expected(e=>e.scope==='national'&&e.date>='2026-09-17'));
// 日本時間の日・月・年の境界。操作中に毎分再生成しない。
const boundary=setup('2026-09-20T14:59:00Z'),first=boundary.panels()[0];boundary.timers[0]();assert.equal(boundary.panels()[0],first);
boundary.state.now='2026-09-20T15:01:00Z';boundary.timers[0]();assert.ok(!boundary.visible().some(c=>c.id==='event-E057'));assert.equal(boundary.mapEvents().length,12);
const rollover=setup('2026-12-31T14:59:00Z');rollover.state.now='2026-12-31T15:01:00Z';rollover.timers[0]();assert.deepEqual(rollover.panels().map(p=>p.dataset.month),['2027-01','2027-02']);
assert.equal(setup('2028-01-01T03:00:00Z').mapEvents().length,0);
console.log('PASS: 47 regions; 2 visible months; 13 map / 17 calendar events; inline names; same-day events; detail links; filters; archives; URL validation; leap year; JST day/month/year rollover.');
