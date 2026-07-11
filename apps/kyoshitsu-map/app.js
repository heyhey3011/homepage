// 全国 詩吟教室マップ
// data.js の window.CLASSROOM_DATA / window.CITY_YOMI を <script> で読み込む前提。
// fetch は使いません（ダブルクリック＝file:// でそのまま動きます）。

// ---------- 公開設定（β公開向け） ----------
// 管理者向けの編集モード（✏️編集モード／＋教室を追加／編集内容の管理）を
// 公開ページで見せるかどうかのスイッチ。β公開では必ず false にする。
// TODO: 将来、教室情報を安全に更新する方法を用意する場合は、
//       このファイルに直接ON/OFFを書くのではなく、
//       別リポジトリ／ローカル環境で data.js を編集・再生成してから
//       本番へデプロイする運用（管理者ログインやDB連携は導入しない）を想定。
const ADMIN_MODE = false;

// このマップからの「修正・削除」導線のURL設定（一元管理）
// TODO: 下記は仮のダミーURLです。Googleフォームを用意でき次第、本番URLに差し替えてください。
const FORM_URLS = {
  requestForm: "https://forms.gle/DUMMY-request-form",
};

// 地方ブロック → 都道府県 のドリルダウン定義
const REGIONS = [
  { name: "北海道・東北", prefs: ["北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県"] },
  { name: "関東", prefs: ["茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県"] },
  { name: "中部", prefs: ["新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県"] },
  { name: "近畿", prefs: ["三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県"] },
  { name: "中国・四国", prefs: ["鳥取県", "島根県", "岡山県", "広島県", "山口県", "徳島県", "香川県", "愛媛県", "高知県"] },
  { name: "九州・沖縄", prefs: ["福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"] },
];
const OVERSEAS = "海外"; // 国内以外（prefecture が47都道府県でないもの）

// 都道府県 → 地方 の逆引き
const PREF_TO_REGION = {};
REGIONS.forEach(region => region.prefs.forEach(pref => { PREF_TO_REGION[pref] = region.name; }));

// 並び順用の都道府県リスト（北から南）
const PREF_ORDER = REGIONS.flatMap(region => region.prefs);

// 流派（表示順）
const SCHOOL_STYLE_ORDER = ["岳風流", "関西吟詩", "岳精流", "吟道学院", "吟道館流", "哲山流"];

// 出典（source → 団体名）
const SOURCE_NAMES = {
  gakufukai_official: "日本詩吟学院 岳風会",
  kangin: "関西吟詩文化協会",
  gakuseiryu: "岳精流日本吟院",
  gindoh: "日本吟道学院",
  gindoukan: "吟道館流",
  tetsuzan: "吟道哲山流興風吟詠会",
};
const DATA_DATE = "2026年7月10日";

const DAY_ORDER = ["月", "火", "水", "木", "金", "土", "日"];
const JAPAN_BOUNDS = [[24.0, 122.5], [45.8, 146.5]]; // 日本全体
const LIST_STEP = 200; // 一覧の初期表示件数（「さらに表示」で増える）

// 手動編集（上書きレイヤー）: data.js は読み取り専用のまま、差分だけを localStorage に保存する
const EDITS_KEY = "shiginMapEdits_v1";
let editsStore = { version: 1, edits: {}, deletes: [], additions: [] };

const state = {
  records: [],
  filtered: [],
  selectedRegion: "",
  selectedPrefecture: "",
  selectedCity: "",
  selectedStyles: [],    // 流派・複数選択
  selectedDays: [],      // 曜日・複数選択
  search: "",
  selectedId: "",
  userLocation: null,    // {lat, lng}
  sortByDistance: false,
  listLimit: LIST_STEP,
  view: "list",          // スマホ用: list / map
  styleList: [],         // データに実在する流派（表示順）
  regionNames: [],       // データに実在する地方（海外含む）
  editMode: false,       // 編集モード
  editingId: null,       // 編集フォームで編集中のレコードid（新規追加は null）
  mapPick: false,        // 地図クリックで位置指定中
  pickReturnView: "list",
};

let map;
let markerLayer;
let userMarker = null;
const markers = new Map(); // id -> L.marker（一度作ったら使い回す）

const elements = {};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();
  applyAdminModeVisibility();
  initMap();
  bindEvents();

  loadEdits();
  state.records = mergeRecords().map(normalizeRecord);

  // フェイルセーフ: データが読み込めていないときはやさしく案内する
  if (state.records.length === 0) {
    elements.resultList.innerHTML =
      '<div class="empty-state">データを読み込めませんでした。<br>' +
      '「data.js」というファイルが「index.html」と同じフォルダにあるか、<br>' +
      'ご確認のうえ、ページを開き直してみてください。</div>';
    elements.mapNotice.textContent = "データを読み込めませんでした";
    elements.resultLabel.textContent = "0件";
    return;
  }

  computeLists();
  buildAllFilters();
  buildAboutContacts();
  setupEditForm();
  updateEditCountBadge();
  restoreFromHash();
  applyFilters();
  maybeAutoLocateOnFirstVisit();
}

// 公開ページでは編集モード関連のUIを丸ごと非表示にする（β公開向け）
function applyAdminModeVisibility() {
  if (ADMIN_MODE) return;
  if (elements.editModeButton) elements.editModeButton.hidden = true;
  if (elements.editBar) elements.editBar.hidden = true;
}

// データに実在する流派・地方を確定する
function computeLists() {
  const stylesInData = new Set(state.records.map(r => r.school_style).filter(Boolean));
  state.styleList = SCHOOL_STYLE_ORDER.filter(s => stylesInData.has(s))
    .concat([...stylesInData].filter(s => !SCHOOL_STYLE_ORDER.includes(s)).sort());
  const regionsInData = new Set(state.records.map(r => r.region));
  state.regionNames = REGIONS.map(r => r.name).filter(n => regionsInData.has(n));
  if (regionsInData.has(OVERSEAS)) state.regionNames.push(OVERSEAS); // 海外は最後に
}

function buildAllFilters() {
  buildRegionFilters();
  buildPrefectureFilters();
  buildCityFilters();
  buildStyleFilters();
  buildDayFilters();
}

// 手動編集を反映した後、画面全体を作り直す
function refreshData() {
  state.records = mergeRecords().map(normalizeRecord);
  computeLists();
  buildAllFilters();
  markers.clear();          // 位置が変わった可能性があるためマーカーを作り直す
  updateEditCountBadge();
  applyFilters();
}

function cacheElements() {
  const ids = [
    "searchInput", "resetButton", "locateButton",
    "regionFilters", "prefBlock", "prefectureFilters",
    "cityBlock", "cityFilters", "styleFilters", "dayFilters",
    "filtersToggle", "filterBadge", "filtersBar",
    "resultLabel", "resultList", "mapNotice",
    "tabList", "tabMap",
    "detailOverlay", "detailPanel", "detailClose", "detailBody",
    "aboutLink", "aboutOverlay", "aboutModal", "aboutClose", "aboutContacts",
    "toast",
    // 手動編集機能
    "editModeButton", "editBar", "addClassroomButton", "manageEditsButton", "editCountBadge",
    "editOverlay", "editModal", "editClose", "editFormTitle", "editForm",
    "ef_name", "ef_style", "styleOptions", "ef_org", "ef_rep", "ef_pref", "ef_city",
    "ef_address", "ef_geocode", "ef_mapPick", "ef_lat", "ef_lng",
    "ef_day", "ef_time", "ef_phone", "ef_email", "ef_note", "ef_cancel",
    "manageOverlay", "manageModal", "manageClose", "manageSummary", "manageList",
    "manageExport", "manageImportButton", "manageImportFile", "manageClearAll",
    "mapPickHint", "mapPickCancel",
  ];
  ids.forEach(id => { elements[id] = document.getElementById(id); });
  elements.appMain = document.querySelector(".app-main");
}

/* ---------- データ正規化 ---------- */

function normalizeRecord(record) {
  const region = PREF_TO_REGION[record.prefecture] || OVERSEAS;
  const cityKey = normalizeCityKey(record);
  const yomi = window.CITY_YOMI || {};

  const searchSource = [
    record.prefecture, record.city, record.address_raw, record.address_normalized,
    record.venue_name, record.organization, record.classroom_name,
    record.representative, record.practice_day_raw, record.practice_time_raw,
    record.note, record.school_style,
    // 読み仮名も検索対象に含める（「よこはま」「ヨコハマ」でヒットさせる）
    cityKey,
    record.city_yomi || "",
    yomi[record.prefecture] || "",
    yomi[record.city] || "",
    yomi[cityKey] || "",
  ].filter(Boolean).join(" ");

  return {
    ...record,
    region,
    latitudeNumber: toNumber(record.latitude),
    longitudeNumber: toNumber(record.longitude),
    needsReview: record.needs_review === "1",
    // 市区町村チップ用の正規化キー（例: 横浜市西区 → 横浜市、江戸川区清新町 → 江戸川区）
    cityKey,
    // 稽古日の構造化された曜日（「月２回」「毎月」の月などは含まない）
    days: extractDays(record.practice_day_raw),
    // 検索用の正規化インデックス（NFKC＋カタカナ→ひらがな＋小文字）
    searchIndex: normalizeForSearch(searchSource),
    distance: null,
  };
}

// 市区町村名を「〜市/区/郡〜町村」の単位に正規化する
// 例: 横浜市西区 → 横浜市、江戸川区清新町 → 江戸川区、鎌ケ谷市 → 鎌ヶ谷市
function normalizeCityKey(record) {
  let city = String(record.city || "").trim();
  if (!city) return "その他";
  if (typeof city.normalize === "function") city = city.normalize("NFKC");

  // 都道府県名が先頭に混入している場合は取り除く（例: 千葉県木更津市）
  const pref = String(record.prefecture || "");
  if (pref && city.startsWith(pref)) city = city.slice(pref.length);
  for (const p of PREF_ORDER) {
    if (city.startsWith(p)) {
      city = city.slice(p.length);
      break;
    }
  }

  // 「ケ/ヶ」の表記ゆれを統一（鎌ケ谷市/鎌ヶ谷市、茅ケ崎市/茅ヶ崎市）
  city = city.replace(/ケ/g, "ヶ");

  // 「〜郡〜町/村」はひとまとまりで切り出す
  let m = city.match(/^(.+?郡.+?[町村])/);
  if (m) return m[1];
  // それ以外は最初の行政区分（市→区→町→村の順で判定）まで
  m = city.match(/^(.+?市)/);
  if (m) return m[1];
  m = city.match(/^(.+?区)/);
  if (m) return m[1];
  m = city.match(/^(.+?町)/);
  if (m) return m[1];
  m = city.match(/^(.+?村)/);
  if (m) return m[1];
  return city || "その他";
}

// 稽古日テキストから曜日を抽出する
// - 「X曜」の形だけを曜日として扱う（「毎月」「月２回」「第３」「15日」等の月/日は除外）
// - 「月・水・金曜日」のような列挙は全体を曜日として展開する
// - 「（土）」のような括弧書きの単独曜日も拾う
function extractDays(raw) {
  if (!raw) return [];
  let text = String(raw);
  if (typeof text.normalize === "function") text = text.normalize("NFKC");

  // 「曜日」の「日」を曜日として誤検出しないよう、先に「曜日」→「曜」に正規化する
  // （例: 「火曜日・水曜日」で「日・水曜」が列挙とマッチして「日」を拾ってしまうのを防ぐ）
  text = text.replace(/曜日/g, "曜");

  const found = new Set();

  // 「月・水・金曜」「土曜」など、末尾に「曜」が付く並び
  const enumRe = /[月火水木金土日](?:\s*[・、,，/／]\s*[月火水木金土日])*\s*曜/g;
  const matches = text.match(enumRe) || [];
  matches.forEach(part => {
    for (const ch of part) {
      if (DAY_ORDER.includes(ch)) found.add(ch);
    }
  });

  // 「（土）」「(日)」のような括弧書きの単独曜日
  const parenRe = /[(（]\s*([月火水木金土日])\s*[)）]/g;
  let m;
  while ((m = parenRe.exec(text)) !== null) found.add(m[1]);

  return DAY_ORDER.filter(day => found.has(day));
}

function toNumber(value) {
  // 空文字は Number("") === 0 になってしまうため、先に除外する
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

// 全角/半角ゆらぎ・カタカナ/ひらがなゆらぎを吸収した検索キーを作る
function normalizeForSearch(value) {
  let text = String(value ?? "");
  if (typeof text.normalize === "function") text = text.normalize("NFKC");
  text = text.toLowerCase();
  // カタカナ → ひらがな
  text = text.replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60));
  // 空白を除去して「横浜 市」なども拾えるように
  return text.replace(/\s+/g, "");
}

function hasCoordinates(record) {
  return record.latitudeNumber !== null && record.longitudeNumber !== null;
}

/* ---------- 地図 ---------- */

function initMap() {
  map = L.map("map", { zoomControl: true });
  map.fitBounds(JAPAN_BOUNDS, { padding: [10, 10] }); // 日本全体が見える初期表示

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  markerLayer = L.markerClusterGroup({
    maxClusterRadius: 46,
    showCoverageOnHover: false,
    spiderfyDistanceMultiplier: 1.35,
    chunkedLoading: true,       // 約5,000マーカーの初期ロード対策
    chunkInterval: 100,
    chunkDelay: 20,
  });
  map.addLayer(markerLayer);

  // 「地図をクリックして位置を指定」モード
  map.on("click", e => {
    if (!state.mapPick) return;
    elements.ef_lat.value = e.latlng.lat.toFixed(6);
    elements.ef_lng.value = e.latlng.lng.toFixed(6);
    endMapPick();
    showToast("地図から位置を設定しました");
  });
}

/* ---------- イベント ---------- */

function bindEvents() {
  elements.searchInput.addEventListener("input", () => {
    state.search = elements.searchInput.value.trim();
    state.listLimit = LIST_STEP;
    applyFilters();
  });

  elements.resetButton.addEventListener("click", resetFilters);
  elements.locateButton.addEventListener("click", locateUser);

  elements.tabList.addEventListener("click", () => switchView("list"));
  elements.tabMap.addEventListener("click", () => switchView("map"));

  // モバイル用: 絞り込みの開閉
  elements.filtersToggle.addEventListener("click", () => {
    const open = elements.filtersBar.classList.toggle("open");
    elements.filtersToggle.classList.toggle("open", open);
    elements.filtersToggle.setAttribute("aria-expanded", String(open));
  });

  elements.detailClose.addEventListener("click", closeDetail);
  elements.detailOverlay.addEventListener("click", closeDetail);

  // このマップについて（出典モーダル）
  elements.aboutLink.addEventListener("click", openAbout);
  elements.aboutClose.addEventListener("click", closeAbout);
  elements.aboutOverlay.addEventListener("click", closeAbout);

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      if (state.mapPick) { endMapPick(); return; }
      closeEditForm();
      closeManage();
      closeDetail();
      closeAbout();
    }
  });

  window.addEventListener("hashchange", () => {
    restoreFromHash();
    applyFilters();
  });

  // ---- 手動編集機能 ----
  elements.editModeButton.addEventListener("click", toggleEditMode);
  elements.addClassroomButton.addEventListener("click", () => openEditForm(null));
  elements.manageEditsButton.addEventListener("click", openManage);

  elements.editForm.addEventListener("submit", e => { e.preventDefault(); saveEditForm(); });
  elements.ef_cancel.addEventListener("click", closeEditForm);
  elements.editClose.addEventListener("click", closeEditForm);
  elements.editOverlay.addEventListener("click", closeEditForm);
  elements.ef_geocode.addEventListener("click", geocodeAddress);
  elements.ef_mapPick.addEventListener("click", startMapPick);
  elements.mapPickCancel.addEventListener("click", endMapPick);

  elements.manageClose.addEventListener("click", closeManage);
  elements.manageOverlay.addEventListener("click", closeManage);
  elements.manageExport.addEventListener("click", exportEdits);
  elements.manageImportButton.addEventListener("click", () => elements.manageImportFile.click());
  elements.manageImportFile.addEventListener("change", importEditsFile);
  elements.manageClearAll.addEventListener("click", clearAllEdits);
}

/* ---------- フィルタUI ---------- */

function buildRegionFilters() {
  const counts = new Map();
  state.records.forEach(r => counts.set(r.region, (counts.get(r.region) || 0) + 1));

  elements.regionFilters.innerHTML = state.regionNames
    .map(name => {
      const minor = name === OVERSEAS ? " chip-minor" : "";
      return `<button class="chip${minor}" type="button" data-type="region" data-value="${escapeHtml(name)}">`
        + `${escapeHtml(name)} <span>${counts.get(name) || 0}</span></button>`;
    })
    .join("");

  elements.regionFilters.querySelectorAll(".chip").forEach(btn => {
    btn.addEventListener("click", () => {
      const value = btn.dataset.value;
      state.selectedRegion = state.selectedRegion === value ? "" : value;
      state.selectedPrefecture = "";
      state.selectedCity = "";
      state.listLimit = LIST_STEP;
      buildPrefectureFilters();
      buildCityFilters();
      applyFilters();
    });
  });
}

function buildPrefectureFilters() {
  if (!state.selectedRegion) {
    elements.prefBlock.hidden = true;
    elements.prefectureFilters.innerHTML = "";
    return;
  }

  const counts = new Map();
  state.records
    .filter(r => r.region === state.selectedRegion)
    .forEach(r => counts.set(r.prefecture, (counts.get(r.prefecture) || 0) + 1));

  // 地方定義の順に並べる（海外はデータに出てきた順）
  const regionDef = REGIONS.find(r => r.name === state.selectedRegion);
  const prefs = regionDef
    ? regionDef.prefs.filter(p => counts.has(p))
    : [...counts.keys()].sort((a, b) => a.localeCompare(b, "ja"));

  elements.prefBlock.hidden = false;
  elements.prefectureFilters.innerHTML = prefs
    .map(pref => chipHtml(pref, counts.get(pref) || 0, "prefecture", pref))
    .join("");

  elements.prefectureFilters.querySelectorAll(".chip").forEach(btn => {
    btn.addEventListener("click", () => {
      const value = btn.dataset.value;
      state.selectedPrefecture = state.selectedPrefecture === value ? "" : value;
      state.selectedCity = "";
      state.listLimit = LIST_STEP;
      buildCityFilters();
      applyFilters();
    });
  });
}

function buildCityFilters() {
  if (!state.selectedPrefecture) {
    elements.cityBlock.hidden = true;
    elements.cityFilters.innerHTML = "";
    return;
  }

  const counts = new Map();
  state.records
    .filter(r => r.prefecture === state.selectedPrefecture)
    .forEach(r => {
      counts.set(r.cityKey, (counts.get(r.cityKey) || 0) + 1);
    });

  const cities = Array.from(counts.keys()).sort((a, b) => a.localeCompare(b, "ja"));
  elements.cityBlock.hidden = false;
  elements.cityFilters.innerHTML = cities
    .map(city => chipHtml(city, counts.get(city), "city", city))
    .join("");

  elements.cityFilters.querySelectorAll(".chip").forEach(btn => {
    btn.addEventListener("click", () => {
      const value = btn.dataset.value;
      state.selectedCity = state.selectedCity === value ? "" : value;
      state.listLimit = LIST_STEP;
      applyFilters();
    });
  });
}

function buildStyleFilters() {
  const counts = new Map();
  state.records.forEach(r => {
    if (r.school_style) counts.set(r.school_style, (counts.get(r.school_style) || 0) + 1);
  });

  elements.styleFilters.innerHTML = state.styleList
    .map(style => chipHtml(style, counts.get(style) || 0, "style", style))
    .join("");

  elements.styleFilters.querySelectorAll(".chip").forEach(btn => {
    btn.addEventListener("click", () => {
      const value = btn.dataset.value;
      const idx = state.selectedStyles.indexOf(value);
      if (idx === -1) state.selectedStyles.push(value);
      else state.selectedStyles.splice(idx, 1);
      state.listLimit = LIST_STEP;
      applyFilters();
    });
  });
}

function buildDayFilters() {
  const counts = new Map(DAY_ORDER.map(day => [
    day,
    state.records.filter(r => r.days.includes(day)).length,
  ]));

  elements.dayFilters.innerHTML = DAY_ORDER
    .map(day => chipHtml(day, counts.get(day) || 0, "day", day))
    .join("");

  elements.dayFilters.querySelectorAll(".chip").forEach(btn => {
    btn.addEventListener("click", () => {
      const value = btn.dataset.value;
      const idx = state.selectedDays.indexOf(value);
      if (idx === -1) state.selectedDays.push(value);
      else state.selectedDays.splice(idx, 1);
      state.listLimit = LIST_STEP;
      applyFilters();
    });
  });
}

function chipHtml(label, count, type, value) {
  return `<button class="chip" type="button" data-type="${type}" data-value="${escapeHtml(value)}">`
    + `${escapeHtml(label)} <span>${count}</span></button>`;
}

function updateActiveChips() {
  elements.regionFilters.querySelectorAll(".chip").forEach(btn => {
    btn.classList.toggle("active", state.selectedRegion === btn.dataset.value);
  });
  elements.prefectureFilters.querySelectorAll(".chip").forEach(btn => {
    btn.classList.toggle("active", state.selectedPrefecture === btn.dataset.value);
  });
  elements.cityFilters.querySelectorAll(".chip").forEach(btn => {
    btn.classList.toggle("active", state.selectedCity === btn.dataset.value);
  });
  elements.styleFilters.querySelectorAll(".chip").forEach(btn => {
    btn.classList.toggle("active", state.selectedStyles.includes(btn.dataset.value));
  });
  elements.dayFilters.querySelectorAll(".chip").forEach(btn => {
    btn.classList.toggle("active", state.selectedDays.includes(btn.dataset.value));
  });
}

/* ---------- 絞り込み ---------- */

function applyFilters() {
  const query = normalizeForSearch(state.search);

  state.filtered = state.records.filter(record => {
    if (state.selectedRegion && record.region !== state.selectedRegion) return false;
    if (state.selectedPrefecture && record.prefecture !== state.selectedPrefecture) return false;
    if (state.selectedCity && record.cityKey !== state.selectedCity) return false;
    if (state.selectedStyles.length && !state.selectedStyles.includes(record.school_style)) return false;
    if (state.selectedDays.length) {
      const hit = state.selectedDays.some(d => record.days.includes(d));
      if (!hit) return false;
    }
    if (query && !record.searchIndex.includes(query)) return false;
    return true;
  });

  sortRecords();
  updateActiveChips();
  updateFilterBadge();
  renderResults();
  renderMarkers();
  updateCount();
  updateHash();
}

// モバイルの「絞り込み」ボタンに選択中の条件数を表示する
function updateFilterBadge() {
  let count = 0;
  if (state.selectedRegion) count += 1;
  if (state.selectedPrefecture) count += 1;
  if (state.selectedCity) count += 1;
  count += state.selectedStyles.length;
  count += state.selectedDays.length;
  if (state.search) count += 1;

  if (count > 0) {
    elements.filterBadge.textContent = String(count);
    elements.filterBadge.hidden = false;
  } else {
    elements.filterBadge.hidden = true;
  }
}

function sortRecords() {
  const prefRank = new Map(PREF_ORDER.map((p, i) => [p, i]));

  if (state.sortByDistance && state.userLocation) {
    state.filtered.sort((a, b) => {
      const da = a.distance == null ? Infinity : a.distance;
      const db = b.distance == null ? Infinity : b.distance;
      return da - db;
    });
    return;
  }

  state.filtered.sort((a, b) => {
    const prefDiff = (prefRank.get(a.prefecture) ?? 99) - (prefRank.get(b.prefecture) ?? 99);
    if (prefDiff !== 0) return prefDiff;
    return (a.city || a.address_raw || "").localeCompare(b.city || b.address_raw || "", "ja");
  });
}

/* ---------- 一覧描画 ---------- */

function renderResults() {
  const total = state.filtered.length;
  const list = state.filtered.slice(0, state.listLimit);

  if (total === 0) {
    elements.resultList.innerHTML =
      '<div class="empty-state">条件に合う教室が見つかりませんでした。<br>「条件をリセット」で最初からやり直せます。</div>';
    return;
  }

  elements.resultList.innerHTML = list.map(cardHtml).join("");
  elements.resultList.querySelectorAll(".class-card").forEach(card => {
    card.addEventListener("click", () => openDetail(card.dataset.id, true));
  });

  if (total > state.listLimit) {
    const remaining = total - state.listLimit;
    const btn = document.createElement("button");
    btn.className = "more-button";
    btn.type = "button";
    btn.textContent = `さらに表示（残り ${remaining} 件）`;
    btn.addEventListener("click", () => {
      state.listLimit += LIST_STEP;
      renderResults();
    });
    elements.resultList.appendChild(btn);
  }
}

function cardHtml(record) {
  const selected = state.selectedId === record.id ? " selected" : "";
  const location = [record.prefecture, record.city, record.venue_name || record.address_raw]
    .filter(Boolean).join(" ");
  const detail = [
    record.school_style,
    record.practice_day_raw,
    record.practice_time_raw,
  ].filter(Boolean).join(" ・ ");
  const distanceBadge = record.distance != null
    ? `<span class="distance-badge">約${formatDistance(record.distance)}</span>`
    : "";
  const phoneBadge = record.contact_phone
    ? '<span class="phone-badge">📞あり</span>'
    : "";
  const editBadge = record._manual
    ? '<span class="edit-flag-badge manual">手動追加</span>'
    : (record._edited ? '<span class="edit-flag-badge">編集済み</span>' : "");

  return `
    <button class="class-card${selected}" type="button" data-id="${escapeHtml(record.id)}">
      <div class="card-head">
        <h2 class="class-name">${escapeHtml(record.classroom_name || "詩吟教室")}</h2>
        ${editBadge}
        ${phoneBadge}
        ${distanceBadge}
      </div>
      <p class="meta-line">${escapeHtml(location)}</p>
      ${detail ? `<p class="detail-line">${escapeHtml(detail)}</p>` : ""}
    </button>
  `;
}

function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)}m`;
  if (km < 10) return `${km.toFixed(1)}km`;
  return `${Math.round(km)}km`;
}

/* ---------- マーカー描画 ---------- */

// マーカーは一度だけ生成して使い回す（約5,000件の再生成を避ける）
function getMarker(record) {
  let marker = markers.get(record.id);
  if (!marker) {
    marker = L.marker([record.latitudeNumber, record.longitudeNumber], {
      icon: L.divIcon({
        className: "",
        html: '<div class="marker-dot"></div>',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      }),
    });
    marker.on("click", () => openDetail(record.id, false));
    markers.set(record.id, marker);
  }
  return marker;
}

function renderMarkers() {
  markerLayer.clearLayers();

  const withCoords = state.filtered.filter(hasCoordinates);
  // addLayers（複数一括）は addLayer の繰り返しより大幅に速い
  markerLayer.addLayers(withCoords.map(getMarker));

  const missing = state.filtered.length - withCoords.length;
  elements.mapNotice.textContent = missing > 0
    ? `地図には ${withCoords.length} 件を表示中（${missing} 件は場所の情報が未登録のため一覧のみ）`
    : `地図に ${withCoords.length} 件を表示中`;
}

/* ---------- 件数 ---------- */

function updateCount() {
  elements.resultLabel.textContent = `${state.filtered.length}件見つかりました`;
}

/* ---------- 詳細パネル ---------- */

function openDetail(id, moveMap) {
  const record = state.records.find(r => r.id === id);
  if (!record) return;

  state.selectedId = id;
  elements.resultList.querySelectorAll(".class-card.selected")
    .forEach(c => c.classList.remove("selected"));
  const card = elements.resultList.querySelector(`[data-id="${cssEscape(id)}"]`);
  if (card) card.classList.add("selected");

  elements.detailBody.innerHTML = detailHtml(record);
  elements.detailPanel.hidden = false;
  elements.detailOverlay.hidden = false;
  requestAnimationFrame(() => {
    elements.detailPanel.classList.add("open");
    elements.detailOverlay.classList.add("open");
  });

  const copyBtn = elements.detailBody.querySelector("[data-copy]");
  if (copyBtn) {
    copyBtn.addEventListener("click", () => copyAddress(copyBtn.dataset.copy));
  }

  // 編集モード中の編集・削除ボタン
  const editBtn = elements.detailBody.querySelector("[data-edit-record]");
  if (editBtn) editBtn.addEventListener("click", () => openEditForm(record));
  const deleteBtn = elements.detailBody.querySelector("[data-delete-record]");
  if (deleteBtn) deleteBtn.addEventListener("click", () => deleteRecord(record.id));

  const marker = markers.get(id);
  if (marker && moveMap && hasCoordinates(record)) {
    map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 14), { duration: 0.6 });
  }
}

function detailHtml(record) {
  const rows = [
    ["流派", record.school_style],
    ["代表者", record.representative],
    ["会場", record.venue_name],
    ["住所", record.address_normalized || record.address_raw],
    ["稽古日", record.practice_day_raw],
    ["時間", record.practice_time_raw],
    ["備考", record.note],
  ].filter(([, value]) => value);

  const rowsHtml = rows.map(([label, value]) =>
    `<div class="detail-row"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`
  ).join("");

  const address = record.address_normalized || record.address_raw || "";
  const routeUrl = hasCoordinates(record)
    ? `https://www.google.com/maps/dir/?api=1&destination=${record.latitudeNumber},${record.longitudeNumber}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

  const reviewNote = record.needsReview
    ? '<p class="review-note">※ 情報が古くなっている可能性があります。お出かけ前に主催者へご確認ください。</p>'
    : "";

  // 出典＋情報の日付（1行のフッタに統合）
  let sourceHtml;
  if (record.source === "manual") {
    sourceHtml = `<p class="source-line">手動追加（${escapeHtml(formatDateJa(record.scraped_at) || DATA_DATE)}）</p>`;
  } else {
    const sourceName = SOURCE_NAMES[record.source] || record.school_style || "提供元";
    const updated = formatDateJa(record.source_updated_at);
    const scraped = formatDateJa(record.scraped_at) || DATA_DATE;
    const dateInfo = updated
      ? `出典サイト更新: ${updated}`
      : `${scraped}取得の情報`;
    sourceHtml = record.source_url
      ? `<p class="source-line">出典: <a href="${escapeHtml(record.source_url)}" target="_blank" rel="noopener">${escapeHtml(sourceName)}</a> ・ ${escapeHtml(dateInfo)}</p>`
      : `<p class="source-line">出典: ${escapeHtml(sourceName)} ・ ${escapeHtml(dateInfo)}</p>`;
  }

  const copyBtn = address
    ? `<button class="ghost-button" type="button" data-copy="${escapeHtml(address)}">住所をコピー</button>`
    : "";

  // 編集済み・手動追加のバッジ
  const flagBadge = record._manual
    ? '<span class="edit-flag-badge manual">手動追加</span>'
    : (record._edited ? '<span class="edit-flag-badge">編集済み</span>' : "");

  // 編集モード中は編集・削除ボタンを表示
  const editButtons = state.editMode
    ? `<div class="detail-edit-actions">
        <button class="ghost-button" type="button" data-edit-record>✏️ 編集</button>
        <button class="danger-button" type="button" data-delete-record>🗑️ 削除</button>
      </div>`
    : "";

  return `
    <h2 class="detail-title">${escapeHtml(record.classroom_name || "詩吟教室")} ${flagBadge}</h2>
    ${editButtons}
    <dl class="detail-list">${rowsHtml}</dl>
    ${contactHtml(record)}
    ${reviewNote}
    <div class="detail-actions">
      <a class="primary-button" href="${escapeHtml(routeUrl)}" target="_blank" rel="noopener">
        Googleマップで経路を見る
      </a>
      ${copyBtn}
    </div>
    ${sourceHtml}
    <p class="report-edit-line">
      <a class="report-edit-link" href="${escapeHtml(FORM_URLS.requestForm)}" target="_blank" rel="noopener">この教室情報を修正・削除する</a><br>
      <span class="report-edit-note">（フォーム準備中。それまでは <a href="../../request/">こちら</a> から）</span>
    </p>
  `;
}

/* ---------- 連絡先（3段階フォールバック） ---------- */

// tel: リンク用に数字と+だけを残す
function telHref(phone) {
  return "tel:" + String(phone).replace(/[^\d+]/g, "");
}

// "2026-06-26" や "2026-05-08T23:37..." を「2026年6月26日」に変換
function formatDateJa(value) {
  const m = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return "";
  return `${m[1]}年${Number(m[2])}月${Number(m[3])}日`;
}

function contactHtml(record) {
  const parts = [];

  // 1. 教室の連絡先（電話・メールが公開されている場合）
  if (record.contact_phone) {
    if (record.region === OVERSEAS) {
      // 海外の番号は日本から tel: でかけると誤接続になるため、テキスト表示に留める
      parts.push(
        `<p class="tel-plain"><span aria-hidden="true">📞</span> ${escapeHtml(record.contact_phone)}` +
        `<span class="tel-plain-note">（海外の番号です）</span></p>`
      );
    } else {
      parts.push(
        `<a class="tel-button" href="${escapeHtml(telHref(record.contact_phone))}">` +
        `<span aria-hidden="true">📞</span> ${escapeHtml(record.contact_phone)}</a>`
      );
    }
    if (record.contact_person) {
      parts.push(`<p class="contact-person">担当: ${escapeHtml(record.contact_person)}</p>`);
    }
  }
  if (record.contact_email) {
    parts.push(
      `<a class="mail-link" href="mailto:${escapeHtml(record.contact_email)}">` +
      `<span aria-hidden="true">✉️</span> ${escapeHtml(record.contact_email)}</a>`
    );
  }

  // 2. 所属団体（教室に直接の連絡先が無いときは本部へ誘導）
  if (record.organization) {
    const note = record.contact_phone || record.contact_email
      ? ""
      : '<span class="org-note">（連絡先は下記の本部へ）</span>';
    parts.push(`<p class="org-line">所属: ${escapeHtml(record.organization)}${note}</p>`);
  } else if (!record.contact_phone && !record.contact_email) {
    parts.push('<p class="org-line"><span class="org-note">この教室の連絡先は下記の本部にお問い合わせください。</span></p>');
  }

  // 3. 本部への問い合わせ（常時表示・折りたたみ）
  parts.push(hqHtml(record));

  return `<div class="contact-block">${parts.join("")}</div>`;
}

function hqHtml(record) {
  const contacts = window.SOURCE_CONTACTS || {};
  const hq = contacts[record.source];
  if (!hq) return "";

  const inner = [];
  inner.push(`<p class="hq-name">${escapeHtml(hq.name)}</p>`);

  // 岳風会は公式Googleフォームを第一導線にする
  const formFirst = record.source === "gakufukai_official" && hq.contact_form_url;
  const formLink = hq.contact_form_url
    ? `<a class="hq-form-button" href="${escapeHtml(hq.contact_form_url)}" target="_blank" rel="noopener">問い合わせフォームを開く</a>`
    : "";
  const formGuide = formFirst
    ? '<p class="hq-guide">教室名と市区町村を伝えるとスムーズです。</p>'
    : "";

  if (formFirst) {
    inner.push(formLink, formGuide);
  }

  if (hq.phone) {
    const hours = hq.phone_hours ? `（${escapeHtml(hq.phone_hours)}）` : "";
    inner.push(
      `<p class="hq-row"><span aria-hidden="true">📞</span> ` +
      `<a href="${escapeHtml(telHref(hq.phone))}">${escapeHtml(hq.phone)}</a>${hours}</p>`
    );
  }
  if (hq.email) {
    inner.push(
      `<p class="hq-row"><span aria-hidden="true">✉️</span> ` +
      `<a href="mailto:${escapeHtml(hq.email)}">${escapeHtml(hq.email)}</a></p>`
    );
  }
  if (!formFirst && formLink) {
    inner.push(formLink);
  }
  if (hq.website) {
    inner.push(
      `<p class="hq-row">公式サイト: <a href="${escapeHtml(hq.website)}" target="_blank" rel="noopener">${escapeHtml(hq.website)}</a></p>`
    );
  }

  return `
    <details class="hq-details">
      <summary>この流派の本部に問い合わせる</summary>
      <div class="hq-body">${inner.join("")}</div>
    </details>
  `;
}

// 「このマップについて」モーダルに6本部の連絡先一覧を描画する
function buildAboutContacts() {
  if (!elements.aboutContacts) return;
  const contacts = window.SOURCE_CONTACTS || {};
  const items = Object.values(contacts).map(hq => {
    const bits = [];
    if (hq.phone) {
      const hours = hq.phone_hours ? `（${escapeHtml(hq.phone_hours)}）` : "";
      bits.push(`<a href="${escapeHtml(telHref(hq.phone))}">${escapeHtml(hq.phone)}</a>${hours}`);
    }
    if (hq.contact_form_url) {
      bits.push(`<a href="${escapeHtml(hq.contact_form_url)}" target="_blank" rel="noopener">問い合わせフォーム</a>`);
    }
    return `<li>${escapeHtml(hq.school_style)}: ${escapeHtml(hq.name)}` +
      (bits.length ? ` ─ ${bits.join(" ／ ")}` : "") + `</li>`;
  });
  elements.aboutContacts.innerHTML = items.join("");
}

function closeDetail() {
  elements.detailPanel.classList.remove("open");
  elements.detailOverlay.classList.remove("open");
  state.selectedId = "";
  elements.resultList.querySelectorAll(".class-card.selected")
    .forEach(c => c.classList.remove("selected"));
  setTimeout(() => {
    elements.detailPanel.hidden = true;
    elements.detailOverlay.hidden = true;
  }, 220);
}

/* ---------- このマップについて（出典モーダル） ---------- */

function openAbout() {
  elements.aboutModal.hidden = false;
  elements.aboutOverlay.hidden = false;
  requestAnimationFrame(() => {
    elements.aboutModal.classList.add("open");
    elements.aboutOverlay.classList.add("open");
  });
}

function closeAbout() {
  if (elements.aboutModal.hidden) return;
  elements.aboutModal.classList.remove("open");
  elements.aboutOverlay.classList.remove("open");
  setTimeout(() => {
    elements.aboutModal.hidden = true;
    elements.aboutOverlay.hidden = true;
  }, 220);
}

function copyAddress(text) {
  const done = () => showToast("住所をコピーしました");
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
  } else {
    fallbackCopy(text, done);
  }
}

function fallbackCopy(text, done) {
  const area = document.createElement("textarea");
  area.value = text;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  try { document.execCommand("copy"); done(); }
  catch (e) { showToast("コピーできませんでした"); }
  document.body.removeChild(area);
}

let toastTimer = null;
function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  elements.toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    elements.toast.classList.remove("show");
    setTimeout(() => { elements.toast.hidden = true; }, 200);
  }, 1800);
}

/* ---------- 現在地から探す ---------- */

function locateUser() {
  if (!("geolocation" in navigator)) {
    showToast("この端末では現在地を取得できません");
    return;
  }

  elements.locateButton.disabled = true;
  elements.locateButton.classList.add("loading");

  navigator.geolocation.getCurrentPosition(
    pos => {
      elements.locateButton.disabled = false;
      elements.locateButton.classList.remove("loading");
      applyUserLocation(pos.coords.latitude, pos.coords.longitude);
      showToast("近い順に並べ替えました");
    },
    err => {
      elements.locateButton.disabled = false;
      elements.locateButton.classList.remove("loading");
      let message = "現在地を取得できませんでした。";
      if (err.code === err.PERMISSION_DENIED) {
        message = "位置情報の利用が許可されていません。地域や都道府県から探してみてください。";
      } else if (err.code === err.TIMEOUT) {
        message = "現在地の取得に時間がかかっています。もう一度お試しください。";
      }
      showToast(message);
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
  );
}

// 現在地の座標を受け取り、地図の移動・マーカー表示・距離順の並べ替えを行う
// （手動の「現在地へ移動」ボタンと、初回訪問時の自動表示の両方から呼ばれる共通処理）
function applyUserLocation(latitude, longitude) {
  state.userLocation = { lat: latitude, lng: longitude };
  state.sortByDistance = true;

  // 各教室の距離を計算
  state.records.forEach(r => {
    r.distance = hasCoordinates(r)
      ? haversine(latitude, longitude, r.latitudeNumber, r.longitudeNumber)
      : null;
  });

  // 現在地マーカー
  if (userMarker) map.removeLayer(userMarker);
  userMarker = L.marker([latitude, longitude], {
    icon: L.divIcon({
      className: "",
      html: '<div class="user-dot"></div>',
      iconSize: [26, 26],
      iconAnchor: [13, 13],
    }),
    zIndexOffset: 1000,
  }).addTo(map);

  map.flyTo([latitude, longitude], 12, { duration: 0.8 });
  state.listLimit = LIST_STEP;
  applyFilters();
}

// ---------- 初回訪問時の現在地表示 ----------
// 初めてこのページを開いたときだけ、そっと現在地の取得を試みる。
// 許可されたら現在地周辺を初期表示。拒否・非対応・タイムアウトのときは
// 何も表示せず（メッセージも出さず）、従来どおり全国表示のままにする。
// 一度試した後は（許可・拒否どちらでも）このフラグが立つため、
// 次回以降は自動では位置情報を尋ねない（ボタンからはいつでも手動で使える）。
const FIRST_VISIT_LOCATE_KEY = "shiginMapFirstVisitLocate_v1";

function maybeAutoLocateOnFirstVisit() {
  let alreadyTried = true;
  try {
    alreadyTried = window.localStorage.getItem(FIRST_VISIT_LOCATE_KEY) === "1";
  } catch (e) {
    // localStorageが使えない環境では毎回は聞かず、自動表示はしない
    return;
  }
  if (alreadyTried) return;

  try {
    window.localStorage.setItem(FIRST_VISIT_LOCATE_KEY, "1");
  } catch (e) {
    // 保存できない場合でも、今回だけは通常どおり試みる
  }

  if (!("geolocation" in navigator)) return;

  navigator.geolocation.getCurrentPosition(
    pos => {
      applyUserLocation(pos.coords.latitude, pos.coords.longitude);
      showToast("現在地の近くを表示しました");
    },
    () => {
      // 拒否・タイムアウト等: 何も知らせず、全国表示のまま
    },
    { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
  );
}

// 2点間の距離（km）
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = deg => deg * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ---------- 表示切替（スマホ） ---------- */

function switchView(view) {
  state.view = view;
  elements.appMain.dataset.view = view;
  elements.tabList.classList.toggle("active", view === "list");
  elements.tabMap.classList.toggle("active", view === "map");
  elements.tabList.setAttribute("aria-selected", String(view === "list"));
  elements.tabMap.setAttribute("aria-selected", String(view === "map"));
  if (view === "map") setTimeout(() => map.invalidateSize(), 60);
}

/* ---------- リセット ---------- */

function resetFilters() {
  state.selectedRegion = "";
  state.selectedPrefecture = "";
  state.selectedCity = "";
  state.selectedStyles = [];
  state.selectedDays = [];
  state.search = "";
  state.selectedId = "";
  state.sortByDistance = false;
  state.listLimit = LIST_STEP;
  elements.searchInput.value = "";
  buildPrefectureFilters();
  buildCityFilters();
  if (userMarker) { map.removeLayer(userMarker); userMarker = null; }
  state.userLocation = null;
  state.records.forEach(r => { r.distance = null; });
  map.fitBounds(JAPAN_BOUNDS, { padding: [10, 10] });
  applyFilters();
}

/* ---------- URLハッシュ同期（共有用） ---------- */

function updateHash() {
  const params = new URLSearchParams();
  if (state.selectedRegion) params.set("region", state.selectedRegion);
  if (state.selectedPrefecture) params.set("pref", state.selectedPrefecture);
  if (state.selectedCity) params.set("city", state.selectedCity);
  if (state.selectedStyles.length) params.set("styles", state.selectedStyles.join(","));
  if (state.selectedDays.length) params.set("days", state.selectedDays.join(","));
  if (state.search) params.set("q", state.search);

  const hash = params.toString();
  const newHash = hash ? `#${hash}` : "";
  if (newHash !== window.location.hash) {
    // hashchange の無限ループを避けるため replaceState を使う
    history.replaceState(null, "", newHash || window.location.pathname + window.location.search);
  }
}

function restoreFromHash() {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) return;
  const params = new URLSearchParams(raw);

  const region = params.get("region") || "";
  const pref = params.get("pref") || "";

  // pref が正しければ、その都道府県が属する地方も自動で選ぶ（共有リンク対応）
  if (pref && (PREF_TO_REGION[pref] || state.records.some(r => r.prefecture === pref))) {
    state.selectedPrefecture = pref;
    state.selectedRegion = PREF_TO_REGION[pref] || OVERSEAS;
  } else {
    state.selectedPrefecture = "";
    state.selectedRegion = state.regionNames.includes(region) ? region : "";
  }
  state.selectedCity = state.selectedPrefecture ? (params.get("city") || "") : "";

  const styles = (params.get("styles") || "").split(",").filter(s => state.styleList.includes(s));
  state.selectedStyles = styles;
  const days = (params.get("days") || "").split(",").filter(d => DAY_ORDER.includes(d));
  state.selectedDays = days;
  state.search = params.get("q") || "";
  elements.searchInput.value = state.search;
  buildPrefectureFilters();
  buildCityFilters();
}

/* ==========================================================
   手動編集機能（上書きレイヤー方式）
   - data.js（公式データ）は読み取り専用
   - 差分だけを localStorage（shiginMapEdits_v1）に保存
   - データ再取得（data.js再生成）でも手動編集は消えない
   ========================================================== */

/* ---------- 保存・読み込み ---------- */

function storageAvailable() {
  try {
    const key = "__shiginMapTest__";
    window.localStorage.setItem(key, "1");
    window.localStorage.removeItem(key);
    return true;
  } catch (e) {
    return false;
  }
}

function emptyEditsStore() {
  return { version: 1, edits: {}, deletes: [], additions: [] };
}

function loadEdits() {
  editsStore = emptyEditsStore();
  try {
    const raw = window.localStorage.getItem(EDITS_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    editsStore = normalizeEditsStore(parsed) || emptyEditsStore();
  } catch (e) {
    // 壊れたデータは無視して空から始める（公式データは無事）
    editsStore = emptyEditsStore();
  }
}

// 読み込んだ差分データの形を検証・整形する（インポート時にも使用）
function normalizeEditsStore(parsed) {
  if (!parsed || typeof parsed !== "object") return null;
  const store = emptyEditsStore();
  if (parsed.edits && typeof parsed.edits === "object" && !Array.isArray(parsed.edits)) {
    Object.keys(parsed.edits).forEach(id => {
      const fields = parsed.edits[id];
      if (fields && typeof fields === "object" && !Array.isArray(fields)) {
        store.edits[String(id)] = fields;
      }
    });
  }
  if (Array.isArray(parsed.deletes)) {
    store.deletes = [...new Set(parsed.deletes.map(String))];
  }
  if (Array.isArray(parsed.additions)) {
    store.additions = parsed.additions.filter(a => a && typeof a === "object" && a.id);
  }
  return store;
}

function saveEdits() {
  try {
    window.localStorage.setItem(EDITS_KEY, JSON.stringify(editsStore));
    return true;
  } catch (e) {
    showToast("編集内容を保存できませんでした（ブラウザの保存容量をご確認ください）");
    return false;
  }
}

function editCount() {
  return Object.keys(editsStore.edits).length + editsStore.deletes.length + editsStore.additions.length;
}

function updateEditCountBadge() {
  if (!elements.editCountBadge) return;
  const n = editCount();
  elements.editCountBadge.textContent = String(n);
  elements.editCountBadge.hidden = n === 0;
}

/* ---------- マージ（公式データ＋差分） ---------- */

function mergeRecords() {
  const base = Array.isArray(window.CLASSROOM_DATA) ? window.CLASSROOM_DATA : [];
  const deletes = new Set(editsStore.deletes);
  const merged = [];
  base.forEach(record => {
    if (deletes.has(record.id)) return; // ソフト削除
    const fields = editsStore.edits[record.id];
    if (fields) merged.push({ ...record, ...fields, _edited: true });
    else merged.push(record);
  });
  editsStore.additions.forEach(added => {
    if (deletes.has(added.id)) return;
    merged.push({ ...added, _manual: true });
  });
  return merged;
}

/* ---------- 編集モード ---------- */

function toggleEditMode() {
  if (!ADMIN_MODE) return; // 公開ページでは編集モードは無効（β公開向け）
  if (!state.editMode && !storageAvailable()) {
    showToast("この環境では編集内容を保存できないため、編集モードを使えません");
    return;
  }
  state.editMode = !state.editMode;
  document.body.classList.toggle("edit-mode", state.editMode);
  elements.editModeButton.classList.toggle("active", state.editMode);
  elements.editModeButton.setAttribute("aria-pressed", String(state.editMode));
  elements.editBar.hidden = !state.editMode;
  closeDetail();
  showToast(state.editMode
    ? "編集モードをオンにしました。教室を開くと編集できます"
    : "編集モードをオフにしました");
}

/* ---------- 編集フォーム ---------- */

// 都道府県セレクトと流派候補を用意する（初期化時に1回）
function setupEditForm() {
  const prefsInData = [...new Set((window.CLASSROOM_DATA || []).map(r => r.prefecture))];
  const extras = prefsInData.filter(p => p && !PREF_ORDER.includes(p)).sort();
  const options = ['<option value="">選択してください</option>']
    .concat(PREF_ORDER.map(p => `<option value="${escapeHtml(p)}">${escapeHtml(p)}</option>`))
    .concat(extras.map(p => `<option value="${escapeHtml(p)}">${escapeHtml(p)}（海外）</option>`));
  elements.ef_pref.innerHTML = options.join("");

  elements.styleOptions.innerHTML = SCHOOL_STYLE_ORDER
    .map(s => `<option value="${escapeHtml(s)}"></option>`)
    .join("");
}

function openEditForm(record) {
  state.editingId = record ? record.id : null;
  elements.editFormTitle.textContent = record ? "教室を編集" : "教室を追加";

  elements.ef_name.value = record ? (record.classroom_name || "") : "";
  elements.ef_style.value = record ? (record.school_style || "") : "";
  elements.ef_org.value = record ? (record.organization || "") : "";
  elements.ef_rep.value = record ? (record.representative || "") : "";
  elements.ef_pref.value = record ? (record.prefecture || "") : "";
  elements.ef_city.value = record ? (record.city || "") : "";
  elements.ef_address.value = record ? (record.address_normalized || record.address_raw || "") : "";
  elements.ef_day.value = record ? (record.practice_day_raw || "") : "";
  elements.ef_time.value = record ? (record.practice_time_raw || "") : "";
  elements.ef_phone.value = record ? (record.contact_phone || "") : "";
  elements.ef_email.value = record ? (record.contact_email || "") : "";
  elements.ef_note.value = record ? (record.note || "") : "";
  elements.ef_lat.value = record ? (record.latitude || "") : "";
  elements.ef_lng.value = record ? (record.longitude || "") : "";

  closeDetail();
  elements.editModal.hidden = false;
  elements.editOverlay.hidden = false;
  requestAnimationFrame(() => {
    elements.editModal.classList.add("open");
    elements.editOverlay.classList.add("open");
  });
  elements.ef_name.focus();
}

function closeEditForm() {
  endMapPick(); // 位置指定モードのまま閉じられても必ず解除する
  if (elements.editModal.hidden) return;
  elements.editModal.classList.remove("open");
  elements.editOverlay.classList.remove("open");
  setTimeout(() => {
    elements.editModal.hidden = true;
    elements.editOverlay.hidden = true;
  }, 220);
}

function saveEditForm() {
  const name = elements.ef_name.value.trim();
  if (!name) {
    showToast("教室名を入力してください");
    elements.ef_name.focus();
    return;
  }

  // 緯度・経度の入力チェック（空欄はOK）
  const latText = elements.ef_lat.value.trim();
  const lngText = elements.ef_lng.value.trim();
  if ((latText && !Number.isFinite(Number(latText))) || (lngText && !Number.isFinite(Number(lngText)))) {
    showToast("緯度・経度は数字で入力してください（例: 35.68 / 139.76）");
    return;
  }

  const address = elements.ef_address.value.trim();
  const fields = {
    classroom_name: name,
    school_style: elements.ef_style.value.trim(),
    organization: elements.ef_org.value.trim(),
    representative: elements.ef_rep.value.trim(),
    prefecture: elements.ef_pref.value,
    city: elements.ef_city.value.trim(),
    address_raw: address,
    address_normalized: address,
    practice_day_raw: elements.ef_day.value.trim(),
    practice_time_raw: elements.ef_time.value.trim(),
    contact_phone: elements.ef_phone.value.trim(),
    contact_email: elements.ef_email.value.trim(),
    note: elements.ef_note.value.trim(),
    latitude: latText,
    longitude: lngText,
  };

  let targetId = state.editingId;

  if (!targetId) {
    // 新規追加
    targetId = `manual-${Date.now()}`;
    editsStore.additions.push({
      id: targetId,
      source: "manual",
      source_no: "",
      venue_name: "",
      geocode_status: latText && lngText ? "manual" : "needs_geocode",
      data_quality_status: "manual",
      needs_review: "0",
      review_reason: "",
      source_url: "",
      source_updated_at: null,
      contact_person: "",
      city_yomi: "",
      scraped_at: new Date().toISOString(),
      ...fields,
    });
  } else {
    const addition = editsStore.additions.find(a => a.id === targetId);
    if (addition) {
      // 手動追加した教室の編集は additions を直接更新
      Object.assign(addition, fields);
    } else {
      // 公式データの教室は差分として記録
      editsStore.edits[targetId] = fields;
    }
  }

  if (!saveEdits()) return;
  closeEditForm();
  refreshData();
  showToast("保存しました");
  openDetail(targetId, true);
}

/* ---------- 削除（ソフト削除） ---------- */

function deleteRecord(id) {
  const record = state.records.find(r => r.id === id);
  const name = record ? (record.classroom_name || "この教室") : "この教室";
  if (!window.confirm(`「${name}」を一覧から削除しますか？\n（削除は「編集内容の管理」からいつでも取り消せます）`)) return;

  const additionIndex = editsStore.additions.findIndex(a => a.id === id);
  if (additionIndex !== -1) {
    // 手動追加した教室は追加自体を取り消す
    editsStore.additions.splice(additionIndex, 1);
  } else {
    if (!editsStore.deletes.includes(id)) editsStore.deletes.push(id);
  }

  if (!saveEdits()) return;
  closeDetail();
  refreshData();
  showToast("削除しました（管理画面から取り消せます）");
}

/* ---------- 位置の指定 ---------- */

// 国土地理院APIで住所から緯度経度を取得（オンライン時のみ）
async function geocodeAddress() {
  const query = elements.ef_address.value.trim()
    || `${elements.ef_pref.value}${elements.ef_city.value.trim()}`;
  if (!query) {
    showToast("先に住所を入力してください");
    return;
  }

  elements.ef_geocode.disabled = true;
  elements.ef_geocode.textContent = "検索中…";
  try {
    const url = "https://msearch.gsi.go.jp/address-search/AddressSearch?q=" + encodeURIComponent(query);
    const response = await fetch(url);
    if (!response.ok) throw new Error("bad status");
    const list = await response.json();
    if (!Array.isArray(list) || list.length === 0) {
      showToast("住所が見つかりませんでした。書き方を少し変えてお試しください");
      return;
    }
    const hit = list[0];
    const [lng, lat] = hit.geometry.coordinates;
    elements.ef_lat.value = String(lat);
    elements.ef_lng.value = String(lng);

    // 見つかった住所から都道府県を自動推定（未選択のときだけ）
    const title = (hit.properties && hit.properties.title) || "";
    if (!elements.ef_pref.value) {
      const pref = PREF_ORDER.find(p => title.startsWith(p));
      if (pref) elements.ef_pref.value = pref;
    }
    showToast(`位置を設定しました: ${title || "見つかった地点"}`);
  } catch (e) {
    showToast("住所検索に接続できませんでした。インターネット接続をご確認ください");
  } finally {
    elements.ef_geocode.disabled = false;
    elements.ef_geocode.textContent = "住所から場所を探す";
  }
}

// 地図クリックで位置を指定するモード
function startMapPick() {
  state.mapPick = true;
  state.pickReturnView = state.view;
  if (window.innerWidth <= 768) switchView("map");
  elements.editModal.classList.add("picking");
  elements.editOverlay.classList.add("picking");
  elements.mapPickHint.hidden = false;
  document.getElementById("map").classList.add("picking");
  setTimeout(() => map.invalidateSize(), 60);
}

function endMapPick() {
  if (!state.mapPick) return;
  state.mapPick = false;
  elements.editModal.classList.remove("picking");
  elements.editOverlay.classList.remove("picking");
  elements.mapPickHint.hidden = true;
  document.getElementById("map").classList.remove("picking");
  if (window.innerWidth <= 768) switchView(state.pickReturnView);
}

/* ---------- 編集内容の管理パネル ---------- */

function openManage() {
  renderManageList();
  elements.manageModal.hidden = false;
  elements.manageOverlay.hidden = false;
  requestAnimationFrame(() => {
    elements.manageModal.classList.add("open");
    elements.manageOverlay.classList.add("open");
  });
}

function closeManage() {
  if (elements.manageModal.hidden) return;
  elements.manageModal.classList.remove("open");
  elements.manageOverlay.classList.remove("open");
  setTimeout(() => {
    elements.manageModal.hidden = true;
    elements.manageOverlay.hidden = true;
  }, 220);
}

function baseRecordName(id) {
  const base = (window.CLASSROOM_DATA || []).find(r => r.id === id);
  return base ? (base.classroom_name || id) : id;
}

function renderManageList() {
  const rows = [];

  Object.keys(editsStore.edits).forEach(id => {
    const name = editsStore.edits[id].classroom_name || baseRecordName(id);
    rows.push(manageRowHtml("edit", id, "編集", name));
  });
  editsStore.additions.forEach(added => {
    rows.push(manageRowHtml("addition", added.id, "追加", added.classroom_name || added.id));
  });
  editsStore.deletes.forEach(id => {
    rows.push(manageRowHtml("delete", id, "削除", baseRecordName(id)));
  });

  elements.manageSummary.textContent =
    `編集 ${Object.keys(editsStore.edits).length} 件 ・ 追加 ${editsStore.additions.length} 件 ・ 削除 ${editsStore.deletes.length} 件`;

  elements.manageList.innerHTML = rows.length
    ? rows.join("")
    : '<p class="manage-empty">編集内容はまだありません。</p>';

  elements.manageList.querySelectorAll("[data-undo-type]").forEach(btn => {
    btn.addEventListener("click", () => undoChange(btn.dataset.undoType, btn.dataset.undoKey));
  });
}

function manageRowHtml(type, id, label, name) {
  const typeClass = type === "delete" ? " is-delete" : type === "addition" ? " is-add" : "";
  return `
    <div class="manage-row">
      <span class="manage-type${typeClass}">${escapeHtml(label)}</span>
      <span class="manage-name">${escapeHtml(name)}</span>
      <button class="ghost-button small" type="button"
        data-undo-type="${escapeHtml(type)}" data-undo-key="${escapeHtml(id)}">取り消す</button>
    </div>
  `;
}

function undoChange(type, id) {
  if (type === "edit") delete editsStore.edits[id];
  if (type === "addition") editsStore.additions = editsStore.additions.filter(a => a.id !== id);
  if (type === "delete") editsStore.deletes = editsStore.deletes.filter(d => d !== id);
  if (!saveEdits()) return;
  refreshData();
  renderManageList();
  showToast("取り消しました");
}

function clearAllEdits() {
  if (editCount() === 0) {
    showToast("取り消す編集内容がありません");
    return;
  }
  if (!window.confirm("すべての編集・追加・削除を取り消して、元のデータに戻しますか？")) return;
  editsStore = emptyEditsStore();
  if (!saveEdits()) return;
  refreshData();
  renderManageList();
  showToast("すべて取り消しました");
}

/* ---------- 書き出し・読み込み ---------- */

function exportEdits() {
  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  const blob = new Blob([JSON.stringify(editsStore, null, 1)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `shigin-map-edits_${stamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast("編集内容をファイルに書き出しました");
}

function importEditsFile(event) {
  const file = event.target.files && event.target.files[0];
  event.target.value = ""; // 同じファイルをもう一度選べるように
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    let incoming;
    try {
      incoming = normalizeEditsStore(JSON.parse(String(reader.result)));
    } catch (e) {
      incoming = null;
    }
    if (!incoming) {
      showToast("このファイルは読み込めませんでした（書き出したファイルを選んでください）");
      return;
    }

    const counts = `編集 ${Object.keys(incoming.edits).length} 件 ・ 追加 ${incoming.additions.length} 件 ・ 削除 ${incoming.deletes.length} 件`;
    if (!window.confirm(`ファイルの内容（${counts}）を、今の編集内容に統合します。よろしいですか？`)) return;

    // マージ（同じ教室への編集はファイル側を優先）
    Object.assign(editsStore.edits, incoming.edits);
    editsStore.deletes = [...new Set([...editsStore.deletes, ...incoming.deletes])];
    incoming.additions.forEach(added => {
      const index = editsStore.additions.findIndex(a => a.id === added.id);
      if (index === -1) editsStore.additions.push(added);
      else editsStore.additions[index] = added;
    });

    if (!saveEdits()) return;
    refreshData();
    renderManageList();
    showToast("読み込みました");
  };
  reader.onerror = () => showToast("ファイルを読み込めませんでした");
  reader.readAsText(file, "utf-8");
}

/* ---------- ユーティリティ ---------- */

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cssEscape(value) {
  if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(value);
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}
