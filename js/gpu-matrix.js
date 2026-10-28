(() => {
  'use strict';
  const dataElement = document.getElementById('matrix-data');
  if (!dataElement) return;
  const { entries, generations, formats, reviewed } = JSON.parse(dataElement.textContent);
  const form = document.getElementById('matrix-controls');
  const search = document.getElementById('matrix-search');
  const generation = document.getElementById('matrix-generation');
  const format = document.getElementById('matrix-format');
  const table = document.getElementById('gpu-matrix');
  const scroll = document.getElementById('matrix-scroll');
  const count = document.getElementById('matrix-count');
  const empty = document.getElementById('matrix-empty');
  const exportButton = document.getElementById('matrix-export');
  const reset = form.querySelector('[type="reset"]');
  const generationNames = Object.fromEntries(generations.map(g => [g.id, g.name]));
  const formatNames = Object.fromEntries(formats.map(f => [f.id, f.name]));
  const searchable = new Map(entries.map(e => [e.id, [e.name, e.summary, generationNames[e.generation], formatNames[e.format]].join(' ').toLowerCase()]));
  const entryElements = new Map([...table.querySelectorAll('[data-entry]')].map(el => [el.dataset.entry, el]));
  let visibleEntries = entries;
  let searchTimer;

  function readLocation() {
    const params = new URLSearchParams(location.search);
    search.value = (params.get('q') || '').slice(0, 120);
    generation.value = generations.some(g => g.id === params.get('generation')) ? params.get('generation') : 'all';
    format.value = formats.some(f => f.id === params.get('format')) ? params.get('format') : 'all';
  }

  function update(saveLocation = true) {
    const query = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    visibleEntries = entries.filter(e => (generation.value === 'all' || e.generation === generation.value) && (format.value === 'all' || e.format === format.value) && query.every(word => searchable.get(e.id).includes(word)));
    const ids = new Set(visibleEntries.map(e => e.id));
    for (const [id, el] of entryElements) {
      el.hidden = !ids.has(id);
      if (el.hidden) el.open = false;
    }
    const familyIds = new Set(visibleEntries.map(e => e.generation));
    table.querySelectorAll('tbody tr').forEach(row => { row.hidden = !familyIds.has(row.dataset.generation); });
    table.querySelectorAll('[data-format]').forEach(cell => {
      cell.hidden = format.value !== 'all' && cell.dataset.format !== format.value;
      const placeholder = cell.querySelector('.matrix-cell-empty');
      if (placeholder) {
        const hasMatch = [...cell.querySelectorAll('[data-entry]')].some(el => !el.hidden);
        placeholder.hidden = hasMatch;
        placeholder.querySelector('.sr-only').textContent = query.length && cell.querySelector('[data-entry]') ? 'No matching entries in this cell' : 'No example included in this guide';
      }
    });
    table.classList.toggle('is-single-format', format.value !== 'all');
    scroll.hidden = !visibleEntries.length;
    empty.hidden = Boolean(visibleEntries.length);
    const n = visibleEntries.length, g = familyIds.size;
    count.textContent = `${n} ${n === 1 ? 'entry' : 'entries'} · ${g} ${g === 1 ? 'family' : 'families'}`;
    exportButton.disabled = !n;
    reset.disabled = !search.value && generation.value === 'all' && format.value === 'all';
    if (saveLocation) {
      const url = new URL(location.href);
      for (const [key, value] of [['q', search.value.trim()], ['generation', generation.value], ['format', format.value]]) {
        if (!value || (key !== 'q' && value === 'all')) url.searchParams.delete(key);
        else url.searchParams.set(key, value);
      }
      history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }

  function resetFilters() {
    clearTimeout(searchTimer);
    search.value = '';
    generation.value = format.value = 'all';
    update();
    scroll.scrollLeft = scroll.scrollTop = 0;
    search.focus({ preventScroll: true });
  }
  form.addEventListener('submit', e => { e.preventDefault(); clearTimeout(searchTimer); update(); });
  form.addEventListener('reset', e => { e.preventDefault(); resetFilters(); });
  search.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(update, 120); });
  for (const select of [generation, format]) select.addEventListener('change', () => { clearTimeout(searchTimer); update(); scroll.scrollLeft = scroll.scrollTop = 0; });
  document.getElementById('matrix-clear').addEventListener('click', resetFilters);
  window.addEventListener('popstate', () => { clearTimeout(searchTimer); readLocation(); update(false); });

  exportButton.addEventListener('click', () => {
    clearTimeout(searchTimer);
    update();
    if (!visibleEntries.length) return;
    // Quote all fields, escape quotes, and neutralize spreadsheet formula prefixes.
    const cell = value => `"${String(value).replace(/^[=+@-]/, "'$&").replace(/"/g, '""')}"`;
    const rows = [['Architecture family', 'Product format', 'Product', 'Summary', 'Notes', 'NVIDIA source', 'Reviewed'], ...visibleEntries.map(e => [generationNames[e.generation], formatNames[e.format], e.name, e.summary, e.detail, e.source, reviewed])];
    const blob = new Blob(['\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n') + '\r\n'], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ateamdata-nvidia-gpu-matrix.csv';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  readLocation();
  update(false);
  form.hidden = exportButton.hidden = false;
})();
