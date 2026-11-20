import { loadEarned, saveEarned, exportProgress, parseImportFile } from './js/store.js';
import { makeFilter, isSpoilerHidden, STAGE_NAMES, STAGE_TEXT } from './js/filters.js';

const listEl = document.getElementById('list');
const detailEl = document.getElementById('detail');
const emptyMsg = document.getElementById('emptyMsg');
const shownCount = document.getElementById('shownCount');
const earnedCount = document.getElementById('earnedCount');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const stagesEl = document.getElementById('stages');

const state = { kind: 'all', tier: 'all', earnedState: 'all', query: '', spoilers: false };
let trophies = [];
let earned = loadEarned();
let selectedId = null;

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function gradeLabel(grade) {
  return grade === 'platinum' ? 'Platinum' : grade[0].toUpperCase() + grade.slice(1);
}

function renderStages() {
  stagesEl.textContent = '';
  for (const stage of [1, 2, 3, 4, 5, 6]) {
    const items = trophies.filter((t) => t.stage === stage);
    const got = items.filter((t) => earned.has(t.id)).length;
    const li = el('li');
    const h3 = el('h3');
    h3.appendChild(el('span', null, `Stage ${stage} — `));
    h3.appendChild(document.createTextNode(STAGE_NAMES[stage]));
    li.appendChild(h3);
    li.appendChild(el('p', null, STAGE_TEXT[stage]));
    li.appendChild(el('p', 'count', `${got} / ${items.length} earned in this stage`));
    stagesEl.appendChild(li);
  }
}

function renderProgress() {
  const n = earned.size;
  earnedCount.textContent = String(n);
  progressBar.style.width = `${Math.round((n / trophies.length) * 100)}%`;
  progressText.textContent = n === trophies.length
    ? 'Platinum earned — you are a Leonida Legend.'
    : `${Math.round((n / trophies.length) * 100)}% to the Platinum — ${trophies.length - n} to go`;
}

function renderList() {
  const test = makeFilter(state);
  const shown = trophies.filter((t) => test(t, earned));
  listEl.textContent = '';
  shownCount.textContent = `— showing ${shown.length} of ${trophies.length}`;
  emptyMsg.hidden = shown.length !== 0;
  for (const trophy of shown) {
    const li = el('li');
    if (earned.has(trophy.id)) li.classList.add('earned');
    if (trophy.id === selectedId) li.classList.add('selected');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(trophy.id);
    box.setAttribute('aria-label', `Mark ${trophy.name} earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(trophy.id);
      else earned.delete(trophy.id);
      saveEarned(earned);
      renderProgress();
      renderStages();
      renderList();
    });
    li.appendChild(box);
    const body = el('div');
    const hiddenNow = isSpoilerHidden(trophy, state.spoilers, earned);
    body.appendChild(el('div', 'name', hiddenNow ? 'Hidden story trophy' : trophy.name));
    body.appendChild(el('div', 'desc', hiddenNow ? 'Earn it to reveal its name and description.' : trophy.description));
    const meta = el('div', 'meta');
    meta.appendChild(el('span', `tag grade-${trophy.grade}`, gradeLabel(trophy.grade)));
    if (trophy.hidden) meta.appendChild(el('span', 'tag hidden-tag', 'Hidden'));
    if (trophy.missable) meta.appendChild(el('span', 'tag missable-tag', 'Missable'));
    if (trophy.target) meta.appendChild(el('span', 'tag', `${trophy.target} ${trophy.targetUnit}`));
    body.appendChild(meta);
    li.appendChild(body);
    li.addEventListener('click', (event) => {
      if (event.target === box) return;
      selectedId = trophy.id;
      renderDetail();
      renderList();
    });
    listEl.appendChild(li);
  }
}

function renderDetail() {
  const trophy = trophies.find((t) => t.id === selectedId);
  detailEl.textContent = '';
  if (!trophy) {
    detailEl.appendChild(el('p', 'detail-hint', 'Pick a trophy from the list to read its guide and sources.'));
    return;
  }
  const hiddenNow = isSpoilerHidden(trophy, state.spoilers, earned);
  detailEl.appendChild(el('h2', null, hiddenNow ? 'Hidden story trophy' : trophy.name));
  const meta = el('div', 'meta');
  meta.appendChild(el('span', `tag grade-${trophy.grade}`, gradeLabel(trophy.grade)));
  if (trophy.hidden) meta.appendChild(el('span', 'tag hidden-tag', 'Hidden'));
  if (trophy.missable) meta.appendChild(el('span', 'tag missable-tag', 'Missable'));
  detailEl.appendChild(meta);
  detailEl.appendChild(el('p', 'official', hiddenNow ? 'Official description hidden until earned.' : trophy.description));
  if (trophy.target) {
    detailEl.appendChild(el('p', 'target', `Target: ${trophy.target} ${trophy.targetUnit}`));
  }
  detailEl.appendChild(el('p', 'guide', hiddenNow ? 'Turn the spoiler setting off, or earn this trophy, to read its guide.' : trophy.guide));
  if (trophy.missable) {
    detailEl.appendChild(el('p', 'target', 'Missable: do it before the window closes — see the warning at the top of the page.'));
  }
  const src = el('p', 'src', 'Sources: ');
  src.appendChild(document.createTextNode(trophy.sources.join(' · ')));
  detailEl.appendChild(src);
}

function renderAll() {
  renderProgress();
  renderStages();
  renderList();
  renderDetail();
}

document.getElementById('search').addEventListener('input', (event) => {
  state.query = event.target.value.trim().toLowerCase();
  renderList();
});

document.getElementById('kindFilters').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-kind]');
  if (!button) return;
  state.kind = button.dataset.kind;
  for (const b of document.querySelectorAll('#kindFilters button')) {
    b.classList.toggle('active', b === button);
  }
  renderList();
});

document.getElementById('tierFilter').addEventListener('change', (event) => {
  state.tier = event.target.value;
  renderList();
});

document.getElementById('stateFilter').addEventListener('change', (event) => {
  state.earnedState = event.target.value;
  renderList();
});

document.getElementById('spoilerToggle').addEventListener('change', (event) => {
  state.spoilers = event.target.checked;
  renderList();
  renderDetail();
});

document.getElementById('exportBtn').addEventListener('click', () => exportProgress(earned));

document.getElementById('importBtn').addEventListener('click', () => {
  document.getElementById('importFile').click();
});

document.getElementById('importFile').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const next = parseImportFile(await file.text());
    earned = next;
    saveEarned(earned);
    renderAll();
  } catch (_err) {
    alert('That file is not a Leonida Trophy Guide progress export.');
  }
  event.target.value = '';
});

fetch('data/trophies.json')
  .then((response) => {
    if (!response.ok) throw new Error(`trophies.json: ${response.status}`);
    return response.json();
  })
  .then((data) => {
    trophies = data.trophies;
    renderAll();
  })
  .catch(() => {
    listEl.textContent = '';
    emptyMsg.hidden = false;
    emptyMsg.textContent = 'Could not load data/trophies.json. Serve this folder over HTTP and try again.';
  });
