(function () {
  'use strict';
  const cards = Array.from(document.querySelectorAll('.event-card'));
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const period = document.getElementById('event-period');
  const prefecture = document.getElementById('event-prefecture');
  const regionField = document.getElementById('prefecture-field');
  const result = document.getElementById('event-count');
  const heading = document.getElementById('event-results-heading');
  const note = document.getElementById('event-list-note');
  const empty = document.getElementById('event-empty');
  const pastButton = document.getElementById('show-past');
  let scope = 'national';

  function todayInJapan() {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
    const get = (name) => parts.find((part) => part.type === name).value;
    return `${get('year')}-${get('month')}-${get('day')}`;
  }

  function filter() {
    const today = todayInJapan();
    const past = period.value === 'past';
    let count = 0;
    cards.sort((a, b) => past ? b.dataset.date.localeCompare(a.dataset.date) : a.dataset.date.localeCompare(b.dataset.date));
    for (const card of cards) {
      const ended = card.dataset.date < today;
      card.dataset.past = String(ended);
      card.querySelector('.event-date__state').textContent = ended ? '過去の開催情報' : card.dataset.date === today ? '本日の予定' : '開催予定';
      const scopeMatch = scope === 'prefecture' || card.dataset.scope === 'national';
      const regionMatch = scope !== 'prefecture' || !prefecture.value || card.dataset.prefecture === prefecture.value;
      card.hidden = !(scopeMatch && regionMatch && ended === past);
      if (!card.hidden) count++;
      document.getElementById('event-list').appendChild(card);
    }
    regionField.hidden = scope !== 'prefecture';
    result.textContent = `${count}件`;
    heading.textContent = `${scope === 'prefecture' && prefecture.value ? prefecture.value + 'の' : ''}${past ? '過去の開催情報' : 'これからの開催予定'}`;
    note.textContent = past
      ? '調査で集めた開催記録と過去の告知です。料金・観覧条件は当時の情報で、次回も同じとは限りません。'
      : '観覧料と出場参加費は異なります。お出かけ前に、主催者の最新案内で開催・開演時刻・入場方法をご確認ください。';
    empty.hidden = count > 0;
    pastButton.hidden = past;
    document.getElementById('event-panel').setAttribute('aria-labelledby', scope === 'national' ? 'tab-national' : 'tab-prefecture');
    for (const tab of tabs) {
      const selected = tab.dataset.scope === scope;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    }
    const params = new URLSearchParams();
    if (scope !== 'national') params.set('view', scope);
    if (past) params.set('period', 'past');
    if (scope === 'prefecture' && prefecture.value) params.set('prefecture', prefecture.value);
    const suffix = params.size ? '?' + params.toString() : '';
    try { history.replaceState(null, '', location.pathname + suffix + location.hash); } catch (_) { /* file preview */ }
  }

  const params = new URLSearchParams(location.search);
  if (params.get('view') === 'prefecture') scope = 'prefecture';
  if (params.get('period') === 'past') period.value = 'past';
  if (Array.from(prefecture.options).some((option) => option.value === params.get('prefecture'))) prefecture.value = params.get('prefecture');
  for (const tab of tabs) {
    tab.disabled = false;
    tab.addEventListener('click', () => { scope = tab.dataset.scope; filter(); });
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const index = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (tabs.indexOf(tab) + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      scope = tabs[index].dataset.scope;
      filter();
      tabs[index].focus();
    });
  }
  period.disabled = false;
  prefecture.disabled = false;
  period.addEventListener('change', filter);
  prefecture.addEventListener('change', filter);
  pastButton.addEventListener('click', () => { period.value = 'past'; filter(); heading.focus(); });
  filter();
  window.addEventListener('pageshow', filter);
  // Open tabs must also stop presenting yesterday's events as upcoming after midnight.
  window.setInterval(filter, 60000);
}());
