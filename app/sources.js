// Leonida Trophy Guide — Sources tab: bibliography, Trophy x Source matrix,
// and the disputes section. Renders from window.Leonida once data is loaded.
let srcType = 'all';
let srcRel = 'all';
let srcSort = 'used';

function renderBibliography() {
  const { doc, citedBy } = window.Leonida;
  let list = [...doc.sourceIndex];
  if (srcType !== 'all') list = list.filter((s) => s.type === srcType);
  if (srcRel !== 'all') list = list.filter((s) => s.reliability === srcRel);
  if (srcSort === 'used') list.sort((a, b) => citedBy(b.id) - citedBy(a.id));
  else list.sort((a, b) => a.site.localeCompare(b.site));
  document.getElementById('bibliography').innerHTML = list.map((s) => `
    <div class="src-card">
      <h4>[${s.id}] ${s.site}</h4>
      <p><b>Type:</b> ${s.type} · <b>Reliability:</b> ${s.reliability}</p>
      <p><b>Cited by ${citedBy(s.id)} / 55 guides</b> · read 20 Nov 2026</p>
      <p><a href="${s.url}" target="_blank" rel="noopener">${s.url}</a></p>
    </div>`).join('') || '<p>No sources match these filters.</p>';
}

function renderSourceMatrix() {
  const { doc } = window.Leonida;
  const head = doc.sourceIndex.map((s) => `<th>[${s.id}] ${s.site}</th>`).join('');
  const rows = doc.trophies.map((t) => {
    const used = new Set(t.steps.flatMap((s) => s.src));
    const cells = doc.sourceIndex.map((s) => `<td class="${used.has(s.id) ? 'src-cell' : ''}">${used.has(s.id) ? '✓' : ''}</td>`).join('');
    return `<tr><td>${t.name}</td>${cells}</tr>`;
  }).join('');
  document.getElementById('sourceMatrix').innerHTML =
    `<table class="matrix"><thead><tr><th>Trophy</th>${head}</tr></thead><tbody>${rows}</tbody></table>`;
}

function renderDisputes() {
  const { doc } = window.Leonida;
  const disputed = doc.trophies.filter((t) => t.disputed && t.dispute);
  document.getElementById('disputesList').innerHTML = disputed.map((t) => `
    <div class="dispute-item"><h4>${t.name}</h4><p>${t.dispute}</p>
    <p class="map-note">Shown two-sided in the trophy's own guide — this guide does not pick a winner.</p></div>`).join('');
}

function initSources() {
  renderBibliography();
  renderSourceMatrix();
  renderDisputes();
  document.getElementById('srcTypeChips').addEventListener('click', (e) => {
    const b = e.target.closest('[data-srctype]');
    if (!b) return;
    srcType = b.dataset.srctype;
    document.querySelectorAll('#srcTypeChips .chip').forEach((c) => c.classList.toggle('active', c === b));
    renderBibliography();
  });
  document.getElementById('srcRelChips').addEventListener('click', (e) => {
    const b = e.target.closest('[data-srcrel]');
    if (!b) return;
    srcRel = b.dataset.srcrel;
    document.querySelectorAll('#srcRelChips .chip').forEach((c) => c.classList.toggle('active', c === b));
    renderBibliography();
  });
  document.getElementById('srcSortSelect').addEventListener('change', (e) => {
    srcSort = e.target.value;
    renderBibliography();
  });
}
if (window.Leonida) initSources();
else document.addEventListener('leonida-ready', initSources);
