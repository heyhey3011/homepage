// 実際のページスクリプトを固定日時で実行し、表示する予定と状態遷移を検証。
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),data=JSON.parse(fs.readFileSync(path.join(root,'events/events.json'),'utf8'));
const html=fs.readFileSync(path.join(root,'events/index.html'),'utf8'),code=fs.readFileSync(path.join(root,'events/events.js'),'utf8');
const regions=JSON.parse(fs.readFileSync(path.join(root,'events/regions.json'),'utf8'));
const regionByPref=Object.fromEntries(regions.flatMap(r=>r.prefectures.map(p=>[p,r.id])));
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
  const cards=data.events.map(e=>{const c=new Element('event-'+e.id);c.dataset={date:e.date,scope:e.scope,prefecture:e.prefecture,region:regionByPref[e.prefecture],shortName:e.short_name||e.name};c.state=new Element();c.title=new Element();c.title.textContent=e.name;return c;});
  const tabs=['national','prefecture'].map(scope=>{const e=new Element('tab-'+scope);e.dataset.scope=scope;return e;});
  const periodTabs=['upcoming','past'].map(period=>{const e=nodes.get('period-'+period);e.dataset.period=period;return e;});
  for(const r of [{id:'',label:'全国すべて'},...regions]){const o=new Element();o.value=r.id;o.textContent=r.label;nodes.get('event-region').appendChild(o);}
  const prefs=Array.from(html.matchAll(/class="map-prefecture" data-prefecture="([^"]+)" data-side="([^"]+)"/g));
  const maps=prefs.map(([,pref,side])=>{const e=new Element();e.dataset={prefecture:pref,side};e.state=new Element();return e;});
  for(const value of ['',...maps.map(m=>m.dataset.prefecture)]){const o=new Element();o.value=value;o.dataset.region=regionByPref[value];nodes.get('event-prefecture').appendChild(o);}
  const state={now:instant};class FixedDate extends Date{constructor(...args){super(...(args.length?args:[state.now]));}}
  const timers=[],history={replaceState(_a,_b,url){this.url=url;}};
  vm.runInNewContext(code,{document:{getElementById:id=>nodes.get(id),createElement:tag=>{const e=new Element();e.tagName=tag;return e;},querySelectorAll:sel=>sel==='.event-card'?cards:sel==='.map-prefecture'?maps:sel==='.event-period-tabs [role="tab"]'?periodTabs:tabs},Date:FixedDate,Intl,URLSearchParams,location:{pathname:'/events/',search,hash:''},history,window:{requestAnimationFrame(fn){fn();},addEventListener(){},setInterval(fn){timers.push(fn);}}});
  const descendants=e=>e.children.flatMap(c=>[c,...descendants(c)]);
  const calendar=()=>descendants(nodes.get('calendar-pair'));
  return {nodes,cards,tabs,periodTabs,maps,history,timers,state,visible:()=>nodes.get('event-list').children.filter(c=>!c.hidden),calendar,panels:()=>nodes.get('calendar-pair').children,day:date=>calendar().find(c=>c.dataset.date===date),mapEvents:()=>['left','right'].flatMap(side=>descendants(nodes.get('map-callouts-'+side))).filter(n=>n.className==='map-event'),change:(id,value)=>{nodes.get(id).value=value;nodes.get(id).fire('change');},region:pref=>maps.find(m=>m.dataset.prefecture===pref).fire('click')};
}
const today='2026-09-17';
const ui=setup();
assert.equal(ui.maps.length,47);
assert.equal(ui.visible().length,expected(e=>e.scope==='national'&&e.date>=today));
assert.equal(ui.nodes.get('period-upcoming').attributes['aria-selected'],'true');
assert.equal(ui.nodes.get('archive-notice').hidden,true);
assert.deepEqual(ui.panels().map(p=>p.dataset.month),['2026-09','2026-10']);
const twoMonths=e=>e.date>=today&&e.date<'2026-11-01';
assert.equal(ui.mapEvents().length,expected(twoMonths));
assert.equal(ui.calendar().filter(n=>n.className==='calendar-event').length,expected(twoMonths));
assert.equal(ui.day('2026-09-05').dataset.past,'true');
assert.equal(ui.day('2026-09-05').children.filter(n=>n.className==='calendar-event').length,0);
// 来月の詳しい案内を開いても「予定」のまま。旧 period=all も予定へ移行する。
const oct18=ui.day('2026-10-18').children.filter(n=>n.className==='calendar-event');
assert.equal(oct18.length,expected(e=>e.date==='2026-10-18'));
assert.ok(oct18.every(link=>link.children.some(c=>c.className==='calendar-event-name'&&c.textContent.length>0)));
oct18[0].fire('click');assert.ok(ui.visible().every(c=>c.dataset.date==='2026-10-18'));
assert.equal(ui.nodes.get('period-upcoming').attributes['aria-selected'],'true');assert.equal(ui.nodes.get('calendar-month').value,'2026-09');assert.ok(!ui.history.url.includes('period=all'));
const legacy=setup(undefined,'?view=prefecture&period=all');assert.ok(legacy.visible().every(c=>c.dataset.date>=today));assert.equal(legacy.nodes.get('period-upcoming').attributes['aria-selected'],'true');
// 地方を変えると県選択をクリアし、対象地方の県のみ選択できる。地図・カレンダーも一致。
ui.change('event-region','kanto');assert.equal(ui.nodes.get('event-prefecture').value,'');
assert.equal(ui.visible().length,expected(e=>regionByPref[e.prefecture]==='kanto'&&e.date>=today));
assert.equal(ui.mapEvents().length,expected(e=>regionByPref[e.prefecture]==='kanto'&&twoMonths(e)));
assert.equal(ui.calendar().filter(n=>n.className==='calendar-event').length,ui.mapEvents().length);
assert.equal(ui.nodes.get('event-prefecture').options.length,8);
ui.change('event-prefecture','東京都');assert.ok(ui.visible().every(c=>c.dataset.prefecture==='東京都'));
ui.change('event-region','tohoku');assert.equal(ui.nodes.get('event-prefecture').value,'');assert.equal(ui.nodes.get('event-prefecture').options.length,7);
assert.equal(ui.visible().length,expected(e=>regionByPref[e.prefecture]==='tohoku'&&e.date>=today));
ui.change('event-region','koshinetsu');assert.deepEqual(ui.nodes.get('event-prefecture').options.map(o=>o.value).filter(Boolean).sort(),['山梨県','新潟県','長野県'].sort());
assert.equal(ui.visible().length,expected(e=>regionByPref[e.prefecture]==='koshinetsu'&&e.date>=today));
// 予定なしでも勝手にアーカイブへ移動しない。明示した時だけ過去を見る。
ui.region('鳥取県');assert.equal(ui.visible().length,0);assert.equal(ui.nodes.get('period-upcoming').attributes['aria-selected'],'true');
ui.nodes.get('show-past').fire('click');assert.ok(ui.visible().some(c=>c.id==='event-E093'));assert.ok(ui.visible().every(c=>c.dataset.date<today));assert.equal(ui.nodes.get('archive-notice').hidden,false);
ui.nodes.get('period-upcoming').fire('click');assert.equal(ui.visible().length,0);
ui.nodes.get('calendar-today').fire('click');assert.equal(ui.nodes.get('event-region').value,'');assert.equal(ui.nodes.get('event-prefecture').value,'');
// アーカイブでは2022年まで選べる。地方と過去の条件を組み合わせられる。
const archive=setup(undefined,'?period=past&region=tohoku&month=2026-06');
assert.equal(archive.visible().length,expected(e=>regionByPref[e.prefecture]==='tohoku'&&e.date<today));
assert.equal(archive.nodes.get('calendar-month').options[0].value,'2022-01');
assert.ok(archive.calendar().filter(n=>n.className==='calendar-event').every(n=>n.children.some(c=>c.className==='calendar-ended')));
archive.change('event-region','');archive.change('calendar-month','2026-06');
assert.equal(archive.mapEvents().length,expected(e=>e.date>='2026-06-01'&&e.date<'2026-08-01'));
archive.change('calendar-month','2024-02');assert.equal(archive.calendar().filter(n=>n.dataset.date?.startsWith('2024-02')).length,29);
archive.change('calendar-month','2026-02');assert.equal(archive.calendar().filter(n=>n.dataset.date?.startsWith('2026-02')).length,28);
archive.change('calendar-month','2022-01');assert.equal(archive.nodes.get('calendar-prev').disabled,true);
archive.nodes.get('period-upcoming').fire('click');assert.equal(archive.nodes.get('calendar-month').value,'2026-09');assert.ok(archive.visible().every(c=>c.dataset.date>=today));
const dates=setup();dates.day('2026-09-23').children[0].fire('click');assert.ok(dates.visible().some(c=>c.id==='event-E094'));
dates.nodes.get('calendar-next').fire('click');assert.equal(dates.visible().length,expected(e=>e.date.startsWith('2026-10')));
dates.nodes.get('calendar-next').fire('click');dates.day('2026-11-03').children[0].fire('click');assert.equal(dates.visible().length,expected(e=>e.date==='2026-11-03'));
dates.change('calendar-month','2026-12');assert.deepEqual(dates.panels().map(p=>p.dataset.month),['2026-12','2027-01']);
assert.equal(dates.panels()[0].children.at(-1).disabled,expected(e=>e.date.startsWith('2026-12'))===0);
const pastLink=setup(undefined,'?date=2026-09-12');assert.equal(pastLink.nodes.get('period-past').attributes['aria-selected'],'true');assert.equal(pastLink.visible().length,expected(e=>e.date==='2026-09-12'));
for(const query of ['?date=2026-02-30','?date=9999-01-01','?view=bad&period=bad&prefecture=bad&region=bad','?month=2026-13'])assert.equal(setup(undefined,query).visible().length,expected(e=>e.scope==='national'&&e.date>=today));
const inconsistent=setup(undefined,'?region=tohoku&prefecture=東京都');assert.equal(inconsistent.nodes.get('event-region').value,'kanto');assert.ok(inconsistent.visible().every(c=>c.dataset.prefecture==='東京都'));
ui.periodTabs[0].fire('keydown',{key:'End',preventDefault(){}});assert.equal(ui.periodTabs[1].attributes['aria-selected'],'true');assert.equal(ui.periodTabs[1].focused,true);
const boundary=setup('2026-09-20T14:59:00Z'),first=boundary.panels()[0];boundary.timers[0]();assert.equal(boundary.panels()[0],first);
boundary.state.now='2026-09-20T15:01:00Z';boundary.timers[0]();assert.ok(!boundary.visible().some(c=>c.id==='event-E057'));
const rollover=setup('2026-12-31T14:59:00Z');rollover.state.now='2026-12-31T15:01:00Z';rollover.timers[0]();assert.deepEqual(rollover.panels().map(p=>p.dataset.month),['2027-01','2027-02']);
assert.equal(setup('2028-01-01T03:00:00Z').mapEvents().length,0);
console.log('PASS: upcoming default; archive separation; legacy all URL; 11 regions/47 prefectures; map/calendar/list consistency; prefecture reset; detail links; archive from 2022; keyboard; leap year; JST rollover.');
