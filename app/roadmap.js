// Leonida Trophy Guide — Roadmap tab and Missables tab.
// Renders from window.Leonida once the tracker has loaded the data.
function countsTable(counts) {
  const rows = counts.map((c) => `<tr><td>${c.item}</td><td>${c.trophy === null ? '—' : c.trophy}</td><td>${c.checklist}</td><td>${c.note}</td></tr>`).join('');
  return `<table class="counts"><thead><tr><th>What</th><th>Trophy target</th><th>100% checklist target</th><th>Note</th></tr></thead><tbody>${rows}</tbody></table>`;
}

function renderRoadmap() {
  const { doc, roadmap, isEarned } = window.Leonida;
  const meta = roadmap.meta;
  document.getElementById('metaTiles').innerHTML = [
    [`~${meta.totalHours} h`, 'to the platinum'],
    [meta.difficulty, 'difficulty'],
    [`${meta.playthroughs}`, 'playthrough'],
    [`${meta.online}`, 'online trophies'],
    [`${meta.glitched}`, 'glitched trophies'],
    [`${meta.manualSaves} + ${meta.autosaveSlots}`, 'manual + autosave slots'],
  ].map(([b, s]) => `<div class="meta-tile"><b>${b}</b><span>${s}</span></div>`).join('');

  const byId = new Map(doc.trophies.map((t) => [t.id, t]));
  let start = 1;
  const next = document.getElementById('nextUpList');
  next.innerHTML = roadmap.stages.map((st) => {
    const items = st.trophies.map((id) => {
      const t = byId.get(id);
      const miss = t.missable ? ' <span class="badge missable">missable · do first</span>' : '';
      const watch = t.watch ? ' <span class="badge watch">Watch</span>' : '';
      return `<li class="${isEarned(id) ? 'done' : ''}">${t.name}${miss}${watch}</li>`;
    }).join('');
    const html = `<h4 class="nextup-stage">Stage ${st.n} — ${st.title} (${st.hours} h)</h4><ol class="nextup-list" start="${start}">${items}</ol>`;
    start += st.trophies.length;
    return html;
  }).join('');

  const missable = doc.trophies.filter((t) => t.missable).length;
  const watch = doc.trophies.filter((t) => t.watch).length;
  document.getElementById('missableWatchText').textContent =
    `${missable} possibly missable trophy (Positive Mental Attitude, Chapter 1) and ${watch} trophies to watch ` +
    `(methods still unconfirmed). Everything else is safe after the story. ${roadmap.meta.timeNote}`;

  document.getElementById('stageCards').innerHTML = roadmap.stages.map((st) => `
    <div class="stage-card">
      <h4>Stage ${st.n} — ${st.title}</h4>
      <div class="stage-hours">${st.hours} h</div>
      <div class="stage-priority">${st.priority}</div>
      <p>${st.blurb}</p>
      <div class="stage-trophies">${st.trophies.map((id) => `<span class="${isEarned(id) ? 'done' : ''}">${byId.get(id).name}</span>`).join('')}</div>
    </div>`).join('');

  document.getElementById('countsTableRoadmap').innerHTML = countsTable(roadmap.counts);
  document.getElementById('platinumPanel').innerHTML = `<h3>${roadmap.platinum.title}</h3><p>${roadmap.platinum.text}</p>`;
}

function renderMissables() {
  const { roadmap } = window.Leonida;
  const cols = ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Chapter 4', 'Chapter 5', 'Post-game'];
  const cellLabel = { safe: 'Safe', last: 'Last chance', never: 'Never available', missable: 'Missable', watch: 'Watch' };
  const rows = roadmap.matrix.map((r) => {
    const cells = r.cells.map((c) => `<td class="cell-${c}">${cellLabel[c]}</td>`).join('');
    return `<tr><td>${r.name}</td>${cells}</tr>`;
  }).join('');
  document.getElementById('missMatrix').innerHTML =
    `<table class="matrix"><thead><tr><th>Trophy</th>${cols.map((c) => `<th>${c}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>
     <p class="map-note" style="margin-top:10px">${Object.entries(roadmap.matrixLegend).map(([k, v]) => `<b>${cellLabel[k]}:</b> ${v}`).join(' ')}</p>`;
  document.getElementById('storyGates').innerHTML = roadmap.gates.map((g) => `
    <div class="gate"><h4>${g.title}</h4><ul>${g.notes.map((n) => `<li>${n}</li>`).join('')}</ul></div>`).join('');
  document.getElementById('countsTableMissables').innerHTML = countsTable(roadmap.counts);
}

function initRoadmap() {
  renderRoadmap();
  renderMissables();
  document.addEventListener('leonida-progress', () => { renderRoadmap(); });
}
if (window.Leonida) initRoadmap();
else document.addEventListener('leonida-ready', initRoadmap);
