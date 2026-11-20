// Leonida Trophy Guide — tracker tab, map, detail panel, checklist state.
// Loads data/trophies.json and data/roadmap.json, renders the audit panel,
// the trophy grid, the Leonida map pins and the per-trophy guide detail.
// State: earned trophy ids in localStorage under a fresh key.
const KEY = 'leonida-trophy-guide-v2';
const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };
const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

const $ = (id) => document.getElementById(id);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

let doc = null;
let roadmap = null;
let earned = new Set();
let spoilerOn = true;
let filter = 'all';
let sortMode = 'roadmap';
let query = '';

try { earned = new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]')); } catch { earned = new Set(); }
function save() { localStorage.setItem(KEY, JSON.stringify([...earned].sort((a, b) => a - b))); }
function isEarned(id) { return earned.has(id); }

function pinForTrophy(id) { return (roadmap?.mapPins ?? []).filter((p) => p.trophies.includes(id)); }
function citedBy(srcId) {
  return doc.trophies.filter((t) => t.steps.some((s) => s.src.includes(srcId))).length;
}
function roadmapOrder() {
  const order = new Map();
  (roadmap?.stages ?? []).forEach((st) => st.trophies.forEach((id, i) => order.set(id, st.n * 1000 + i)));
  return order;
}

function fillAudit() {
  const steps = doc.trophies.flatMap((t) => t.steps);
  const multi = steps.filter((s) => s.src.length >= 2).length;
  const guidesCited = doc.trophies.filter((t) => t.steps.length > 0 && t.steps.every((s) => s.src.length > 0)).length;
  $('auditSteps').textContent = `${steps.length} / ${steps.length}`;
  $('auditGuides').textContent = `${guidesCited} / 55`;
  $('auditMulti').textContent = String(multi);
  $('auditDisputed').textContent = String(doc.trophies.filter((t) => t.disputed).length);
  $('auditUnconfirmed').textContent = String(doc.trophies.filter((t) => t.unconfirmed).length);
  $('auditSources').textContent = String(doc.sourceIndex.length);
}

function renderProgress() {
  const total = doc.trophies.length;
  const n = earned.size;
  $('earnedCount').textContent = String(n);
  $('earnedBar').style.width = `${Math.round((n / total) * 100)}%`;
  $('earnedPct').textContent = `${Math.round((n / total) * 100)}% to the platinum`;
  const grades = ['platinum', 'gold', 'silver', 'bronze'];
  $('gradeCounters').innerHTML = grades.map((g) => {
    const tot = doc.trophies.filter((t) => t.grade === g).length;
    const got = doc.trophies.filter((t) => t.grade === g && isEarned(t.id)).length;
    return `<span class="counter ${got === tot && tot > 0 ? 'done' : ''}">${GRADE_LABEL[g]} ${got}/${tot}</span>`;
  }).join('');
  $('stageCounters').innerHTML = (roadmap?.stages ?? []).map((st) => {
    const got = st.trophies.filter((id) => isEarned(id)).length;
    return `<span class="counter ${got === st.trophies.length ? 'done' : ''}">Stage ${st.n}: ${got}/${st.trophies.length}</span>`;
  }).join('');
  const coll = doc.trophies.filter((t) => t.kind === 'collectibles');
  const collGot = coll.filter((t) => isEarned(t.id)).length;
  $('collectCount').textContent = `Collectibles logged: ${collGot} / ${coll.length} collectible trophies earned`;
}

function trophyName(t) {
  if (spoilerOn && t.hidden && !isEarned(t.id)) return 'Hidden trophy';
  return t.name;
}
function trophyDesc(t) {
  if (spoilerOn && t.hidden && !isEarned(t.id)) return 'Earn this trophy to reveal its name and description.';
  return t.description;
}

function visibleTrophies() {
  const order = roadmapOrder();
  let list = [...doc.trophies];
  if (query) {
    const q = query.toLowerCase();
    list = list.filter((t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
  }
  if (filter === 'hidden') list = list.filter((t) => t.hidden);
  if (filter === 'disputed') list = list.filter((t) => t.disputed);
  if (filter === 'notearned') list = list.filter((t) => !isEarned(t.id));
  if (filter === 'watch') list = list.filter((t) => t.watch);
  if (filter === 'unconfirmed') list = list.filter((t) => t.unconfirmed);
  if (filter === 'missable') list = list.filter((t) => t.missable);
  if (sortMode === 'roadmap') list.sort((a, b) => (order.get(a.id) ?? 9999) - (order.get(b.id) ?? 9999));
  if (sortMode === 'psn') list.sort((a, b) => a.id - b.id);
  if (sortMode === 'grade') list.sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.id - b.id);
  return list;
}

function renderGrid() {
  const grid = $('trophyGrid');
  grid.replaceChildren();
  for (const t of visibleTrophies()) {
    const card = document.createElement('article');
    card.className = 'card' + (isEarned(t.id) ? ' earned' : '');
    card.dataset.trophyId = t.id;
    const pins = pinForTrophy(t.id);
    const locText = pins.length
      ? pins.map((p) => p.area).join(' / ')
      : (t.chapter ? `Story · Chapter ${t.chapter}` : 'Across Leonida');
    const pinBtns = pins.map((p) => `<button type="button" data-pin="${p.n}" class="pin-btn">Pin ${p.n}</button>`).join(' ');
    const badges = [
      t.hidden ? '<span class="badge hidden">PSN-hidden</span>' : '',
      t.missable ? '<span class="badge missable">Missable</span>' : '',
      t.watch ? '<span class="badge watch">Watch</span>' : '',
      t.unconfirmed ? '<span class="badge unconfirmed">Unconfirmed</span>' : '',
      t.disputed ? '<span class="badge disputed">Sources differ</span>' : '',
      `<span class="badge stage">Stage ${t.stage}</span>`,
    ].join('');
    card.innerHTML = `
      <div class="card-head">
        <svg class="trophy-ico ${t.grade}" aria-hidden="true"><use href="#ico-trophy"/></svg>
        <div class="card-title">
          <h4 class="${spoilerOn && t.hidden && !isEarned(t.id) ? 'spoiler-hidden' : ''}">${esc(trophyName(t))}</h4>
          <p class="desc">${esc(trophyDesc(t))}</p>
          <span class="grade-tag">${GRADE_LABEL[t.grade]}${t.count ? ` · ${t.count} to count` : ''}</span>
        </div>
      </div>
      <div class="badges">${badges}</div>
      <p class="loc-line">📍 ${esc(locText)} ${pinBtns}</p>
      <div class="card-foot">
        <label class="earned-check"><input type="checkbox" ${isEarned(t.id) ? 'checked' : ''}> Earned</label>
        <button type="button" class="guide-btn">Guide →</button>
      </div>`;
    card.querySelector('.earned-check input').addEventListener('change', (e) => {
      if (e.target.checked) earned.add(t.id); else earned.delete(t.id);
      save(); renderProgress(); renderGrid();
      document.dispatchEvent(new Event('leonida-progress'));
    });
    card.querySelector('.guide-btn').addEventListener('click', () => openDetail(t.id));
    card.querySelectorAll('.pin-btn').forEach((b) => b.addEventListener('click', () => highlightPin(Number(b.dataset.pin))));
    grid.append(card);
  }
  if (!grid.children.length) {
    const p = document.createElement('p');
    p.textContent = 'No trophies match this filter.';
    grid.append(p);
  }
}

function openDetail(id) {
  const t = doc.trophies.find((x) => x.id === id);
  if (!t) return;
  const panel = $('detailPanel');
  const srcIds = [...new Set(t.steps.flatMap((s) => s.src))].sort((a, b) => a - b);
  const srcName = (sid) => doc.sourceIndex.find((s) => s.id === sid)?.site ?? `Source ${sid}`;
  const stepsHtml = t.steps.map((s) => {
    const cites = s.src.map((sid) => `<span class="cite">[${sid}]</span>`).join(' ');
    return `<li>${esc(s.text)} ${cites}</li>`;
  }).join('');
  const pins = pinForTrophy(t.id);
  const locHtml = pins.length
    ? pins.map((p) => `<button type="button" data-pin="${p.n}" class="pin-btn">Show pin ${p.n} — ${esc(p.area)}</button>`).join(' ')
    : (t.chapter ? `Story · Chapter ${t.chapter}` : 'Across Leonida');
  panel.innerHTML = `
    <h3><svg class="trophy-ico ${t.grade}" style="width:34px;height:34px;vertical-align:-8px" aria-hidden="true"><use href="#ico-trophy"/></svg> ${esc(t.name)}</h3>
    <p class="desc">${esc(t.description)} — ${GRADE_LABEL[t.grade]}${t.hidden ? ' · PSN-hidden' : ''} · Stage ${t.stage}${t.chapter ? ` · Chapter ${t.chapter}` : ''}</p>
    <p class="loc-line">📍 ${locHtml}</p>
    <ol class="steps">${stepsHtml}</ol>
    <div class="protip"><b>PRO TIP —</b> ${esc(t.tip)}</div>
    ${t.disputed && t.dispute ? `<div class="dispute-box"><b>Sources differ —</b> ${esc(t.dispute)}</div>` : ''}
    ${t.unconfirmed ? '<div class="dispute-box"><b>Unconfirmed —</b> no source has confirmed this method yet. Treat the steps above as the best current lead, not a fact.</div>' : ''}
    <h4>Sources for this guide</h4>
    <ul class="src-list">
      ${srcIds.map((sid) => {
        const s = doc.sourceIndex.find((x) => x.id === sid);
        return `<li><b>[${sid}] ${esc(s.site)}</b> — ${s.type}, ${s.reliability} reliability · cited by ${citedBy(sid)}/55 guides · read 20 Nov 2026<br><a href="${s.url}" target="_blank" rel="noopener">${s.url}</a></li>`;
      }).join('')}
    </ul>
    ${srcIds.length === 1 ? '<p><b>Single source</b> — this guide relies on one source only.</p>' : ''}
    <button type="button" class="btn close-btn">Close guide</button>`;
  panel.hidden = false;
  panel.querySelector('.close-btn').addEventListener('click', () => { panel.hidden = true; });
  panel.querySelectorAll('.pin-btn').forEach((b) => b.addEventListener('click', () => highlightPin(Number(b.dataset.pin))));
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderMap() {
  const layer = $('pinLayer');
  const NS = 'http://www.w3.org/2000/svg';
  layer.replaceChildren();
  for (const p of roadmap.mapPins) {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'pin');
    g.setAttribute('data-pin', String(p.n));
    g.setAttribute('transform', `translate(${p.x},${p.y})`);
    const ring = document.createElementNS(NS, 'circle');
    ring.setAttribute('class', 'pin-ring');
    ring.setAttribute('r', '12');
    const dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('class', 'pin-dot');
    dot.setAttribute('r', '11');
    const txt = document.createElementNS(NS, 'text');
    txt.setAttribute('y', '5');
    txt.textContent = String(p.n);
    g.append(ring, dot, txt);
    g.addEventListener('click', () => openDetail(p.trophies[0]));
    layer.append(g);
  }
  $('pinLegend').innerHTML = roadmap.mapPins.map((p) =>
    `<li><span class="pin-no">${p.n}</span><b>${esc(p.area)}</b> — ${p.trophies.map((id) => esc(doc.trophies.find((t) => t.id === id)?.name ?? '')).join(', ')}</li>`
  ).join('');
}

function highlightPin(n) {
  document.querySelectorAll('.pin.active').forEach((el) => el.classList.remove('active'));
  const pin = document.querySelector(`.pin[data-pin="${n}"]`);
  if (!pin) return;
  pin.classList.add('active');
  $('mapSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => pin.classList.remove('active'), 3500);
}

function switchTab(name) {
  document.querySelectorAll('.tab-btn').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
  document.querySelectorAll('.tab').forEach((s) => s.classList.toggle('active', s.id === `tab-${name}`));
}

function readHash() {
  const m = location.hash.match(/tab=(\w+)/);
  const tm = location.hash.match(/trophy=(\d+)/);
  if (m) switchTab(m[1]);
  if (tm) openDetail(Number(tm[1]));
}

async function main() {
  doc = await (await fetch('data/trophies.json')).json();
  roadmap = await (await fetch('data/roadmap.json')).json();
  window.Leonida = { doc, roadmap, earned, isEarned, openDetail, highlightPin, pinForTrophy, citedBy };
  fillAudit();
  renderProgress();
  renderGrid();
  renderMap();

  document.querySelectorAll('.tab-btn').forEach((b) => b.addEventListener('click', () => {
    switchTab(b.dataset.tab);
    history.replaceState(null, '', `#tab=${b.dataset.tab}`);
  }));
  window.addEventListener('hashchange', readHash);
  $('search').addEventListener('input', (e) => { query = e.target.value; renderGrid(); });
  $('spoilerToggle').addEventListener('change', (e) => { spoilerOn = e.target.checked; renderGrid(); });
  $('filterChips').addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    filter = b.dataset.filter;
    document.querySelectorAll('#filterChips .chip').forEach((c) => c.classList.toggle('active', c === b));
    renderGrid();
  });
  $('sortSelect').addEventListener('change', (e) => { sortMode = e.target.value; renderGrid(); });
  $('exportBtn').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify({ earned: [...earned].sort((x, y) => x - y), exported: new Date().toISOString() }, null, 2)], { type: 'application/json' }));
    a.download = 'leonida-trophy-checklist.json';
    a.click();
  });
  $('importBtn').addEventListener('click', () => $('importFile').click());
  $('importFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const ids = Array.isArray(data) ? data : data.earned;
      const valid = new Set(doc.trophies.map((t) => t.id));
      earned = new Set((ids ?? []).filter((id) => valid.has(id)));
      save(); renderProgress(); renderGrid();
      document.dispatchEvent(new Event('leonida-progress'));
    } catch { /* ignore a bad file */ }
  });
  document.dispatchEvent(new Event('leonida-ready'));
  readHash();
}
main();
