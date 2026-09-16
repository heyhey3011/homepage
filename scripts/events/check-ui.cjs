// 実ブラウザは使わず、絞り込み・日付境界・キーボード操作を検証する。
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'events/events.json'), 'utf8'));
const code = fs.readFileSync(path.join(root, 'events/events.js'), 'utf8');

function setup(instant = '2026-09-16T03:00:00Z', search = '') {
  const nodes = new Map();
  class Element {
    constructor(id) { this.id = id; this.dataset = {}; this.listeners = {}; this.attributes = {}; this.hidden = false; this.disabled = true; this.value = ''; }
    addEventListener(name, fn) { this.listeners[name] = fn; }
    setAttribute(name, value) { this.attributes[name] = value; }
    focus() { this.focused = true; }
    querySelector() { return this.state; }
    fire(name, event = {}) { this.listeners[name](event); }
  }
  for (const id of ['event-period','event-prefecture','prefecture-field','event-count','event-results-heading','event-list-note','event-empty','show-past','event-panel','event-list']) nodes.set(id, new Element(id));
  const cards = data.events.map((e) => { const card = new Element(e.id); card.dataset = {date:e.date,scope:e.scope,prefecture:e.prefecture}; card.state = new Element(e.id+'-state'); return card; });
  const tabs = ['national','prefecture'].map((scope) => { const tab = new Element('tab-'+scope); tab.dataset.scope = scope; return tab; });
  nodes.get('event-period').value = 'upcoming';
  nodes.get('event-prefecture').options = ['', '東京都','兵庫県','福島県','沖縄県','鳥取県'].map(value => ({value}));
  const order = [];
  nodes.get('event-list').appendChild = (card) => { const old = order.indexOf(card); if (old >= 0) order.splice(old,1); order.push(card); };
  const dateState = {now:instant};
  class FixedDate extends Date { constructor(...args) { super(...(args.length ? args : [dateState.now])); } }
  const timers = [];
  const history = {replaceState(_a,_b,url) { this.url = url; }};
  const context = {
    document:{querySelectorAll(sel) { return sel === '.event-card' ? cards : tabs; },getElementById(id) { return nodes.get(id); }},
    Date:FixedDate,Intl,URLSearchParams,location:{pathname:'/events/',search,hash:''},history,
    window:{addEventListener(){},setInterval(fn){timers.push(fn);}}
  };
  vm.runInNewContext(code,context);
  return {nodes,cards,tabs,history,order,timers,dateState,visible:()=>order.filter(c=>!c.hidden)};
}
const ui=setup();
assert.equal(ui.visible().length,7);
assert.ok(ui.visible().every(c=>c.dataset.scope==='national'&&c.dataset.date>='2026-09-16'));
assert.equal(ui.visible()[0].id,'E057');
ui.nodes.get('event-period').value='past'; ui.nodes.get('event-period').fire('change');
assert.equal(ui.visible().length,13);
assert.equal(ui.visible()[0].id,'E010');
ui.tabs[1].fire('click');
assert.equal(ui.visible().length,56);
ui.nodes.get('event-prefecture').value='福島県'; ui.nodes.get('event-prefecture').fire('change');
assert.equal(ui.visible().length,2);
ui.nodes.get('event-period').value='upcoming'; ui.nodes.get('event-period').fire('change');
assert.equal(ui.visible().length,0);
assert.equal(ui.nodes.get('event-empty').hidden,false);
ui.nodes.get('show-past').fire('click');
assert.equal(ui.visible().length,2);
ui.tabs[1].fire('keydown',{key:'ArrowRight',preventDefault(){}});
assert.equal(ui.tabs[0].attributes['aria-selected'],'true');
assert.equal(ui.visible().length,13);
assert.equal(ui.nodes.get('prefecture-field').hidden,true);
assert.equal(ui.tabs[0].focused,true);
assert.equal(setup('2026-09-16T03:00:00Z','?view=prefecture&period=past&prefecture=東京都').visible().length,18);
assert.equal(setup('2026-09-16T03:00:00Z','?view=bad&period=bad&prefecture=bad').visible().length,7);
const day=setup('2026-09-20T14:59:00Z');
assert.equal(day.visible()[0].id,'E057');
assert.equal(day.visible()[0].state.textContent,'本日の予定');
day.dateState.now='2026-09-20T15:01:00Z'; day.timers[0]();
assert.equal(day.visible().length,6);
assert.equal(day.visible()[0].id,'E058');
assert.equal(setup('2028-01-01T03:00:00Z').visible().length,0);
console.log('PASS: upcoming/past, prefectures, empty state, URL parameters, keyboard tabs, JST midnight rollover.');
