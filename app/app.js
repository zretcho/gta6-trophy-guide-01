// Leonida Trophy Guide — boot, render and events. Loads data/trophies.json, renders the
// checklist, and keeps progress and settings in localStorage (see js/store.js).
import { loadEarned, saveEarned, loadSettings, saveSettings, exportFile, importFile } from './js/store.js';
import { KIND_LABELS, KIND_ORDER, trophyIsSpoilerHidden, trophyMatches } from './js/filters.js';

// The deterministic demo set for screenshots: 13 trophies, ?seed=13 in the URL.
const SEED_IDS = [2, 3, 8, 20, 21, 33, 35, 37, 44, 46, 51, 52, 55];

const params = new URLSearchParams(location.search);
const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;
const sourceInfo = data.sources ?? {};
const byId = new Map(trophies.map((t) => [t.id, t]));
const byName = new Map(trophies.map((t) => [t.name, t]));

let earned = loadEarned();
let settings = loadSettings();
let openId = null;

const filters = {
  kind: params.get('kind') ?? 'all',
  grade: params.get('grade') ?? 'all',
  query: (params.get('q') ?? '').trim().toLowerCase(),
  missableOnly: false,
  hideEarned: settings.hideEarned,
};

if (params.get('spoilers') === 'off') settings.spoilers = false;
if (params.get('spoilers') === 'on') settings.spoilers = true;
if (params.get('seed') === '13') {
  for (const id of SEED_IDS) earned.add(byId.get(id).name);
  saveEarned(earned);
}
const openParam = Number(params.get('open'));
if (byId.has(openParam)) openId = openParam;

const $ = (id) => document.getElementById(id);
const listEl = $('trophyList');
const progressText = $('progressText');
const progressBar = $('progressBar');
const gradeCounts = $('gradeCounts');
const nextUp = $('nextUp');
const resultCount = $('resultCount');
const emptyState = $('emptyState');

function gradeLabel(grade) {
  return grade[0].toUpperCase() + grade.slice(1);
}

function formatTarget(target) {
  return target == null ? '' : `PSN counts to ${target.toLocaleString('en-US')}`;
}

function renderProgress() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.name)).length;
  progressText.textContent = `${done} of ${total} earned`;
  progressBar.style.width = `${Math.round((done / total) * 100)}%`;
  const counts = {};
  for (const t of trophies) {
    counts[t.grade] = counts[t.grade] ?? [0, 0];
    counts[t.grade][1] += 1;
    if (earned.has(t.name)) counts[t.grade][0] += 1;
  }
  gradeCounts.textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${gradeLabel(g)} ${counts[g][0]}/${counts[g][1]}`)
    .join(' · ');
  const next = trophies.find((t) => t.kind !== 'platinum' && !earned.has(t.name));
  if (!next) {
    nextUp.textContent = done === total ? 'Platinum earned — every trophy is yours.' : '';
  } else if (trophyIsSpoilerHidden(next, earned, settings.spoilers)) {
    nextUp.textContent = 'Next up: a hidden story trophy.';
  } else {
    nextUp.textContent = `Next up: ${next.name} — ${next.description}`;
  }
}

function renderKindChips() {
  const wrap = $('kindChips');
  wrap.replaceChildren();
  for (const kind of KIND_ORDER) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = KIND_LABELS[kind];
    chip.setAttribute('aria-pressed', String(filters.kind === kind));
    chip.addEventListener('click', () => {
      filters.kind = kind;
      renderKindChips();
      renderList();
    });
    wrap.append(chip);
  }
}

function sourceLinks(trophy) {
  return (trophy.sources ?? []).map((key) => {
    const info = sourceInfo[key];
    return info ? { label: info.label, url: info.url } : { label: key, url: '' };
  });
}

function renderTrophy(trophy) {
  const li = document.createElement('li');
  li.className = 'trophy';
  if (earned.has(trophy.name)) li.classList.add('earned');

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(trophy.name);
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(trophy.name);
    else earned.delete(trophy.name);
    saveEarned(earned);
    renderProgress();
    renderList();
  });
  li.append(box);

  const body = document.createElement('div');
  const hidden = trophyIsSpoilerHidden(trophy, earned, settings.spoilers);
  const nameEl = document.createElement('p');
  nameEl.className = 'trophy-name';
  if (hidden) {
    nameEl.textContent = 'Hidden trophy — earn it to reveal';
    const tag = document.createElement('span');
    tag.className = 'hidden-tag';
    tag.textContent = 'hidden on PSN';
    nameEl.append(tag);
  } else {
    nameEl.textContent = trophy.name;
    if (trophy.hidden) {
      const tag = document.createElement('span');
      tag.className = 'hidden-tag';
      tag.textContent = 'hidden on PSN';
      nameEl.append(tag);
    }
  }
  nameEl.style.cursor = 'pointer';
  nameEl.addEventListener('click', () => {
    openId = openId === trophy.id ? null : trophy.id;
    renderList();
  });
  body.append(nameEl);

  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = hidden ? 'Its name and description stay hidden until you earn it.' : trophy.description;
  body.append(desc);

  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  const kindTag = document.createElement('span');
  kindTag.className = 'tag';
  kindTag.textContent = KIND_LABELS[trophy.kind] ?? trophy.kind;
  meta.append(kindTag);
  if (trophy.target != null) {
    const targetTag = document.createElement('span');
    targetTag.className = 'tag target';
    targetTag.textContent = formatTarget(trophy.target);
    meta.append(targetTag);
  }
  if (trophy.missable) {
    const missTag = document.createElement('span');
    missTag.className = 'tag missable';
    missTag.textContent = '⚠ Missable';
    meta.append(missTag);
  }
  body.append(meta);

  if (openId === trophy.id) {
    const guide = document.createElement('div');
    guide.className = 'trophy-guide';
    if (hidden) {
      const p = document.createElement('p');
      p.textContent = 'This trophy is hidden on PlayStation. Earn it to reveal its guide — the spoiler setting keeps story trophies masked until then.';
      guide.append(p);
    } else {
      if (trophy.missable) {
        const note = document.createElement('p');
        note.className = 'missable-note';
        note.textContent = 'Missable: do the Chapter 1 balcony meditation before that chapter ends, and keep a Chapter 1 save until this pops. See the Missable trophies section above.';
        guide.append(note);
      }
      const p = document.createElement('p');
      p.textContent = trophy.guide;
      guide.append(p);
      const sources = sourceLinks(trophy);
      if (sources.length) {
        const src = document.createElement('p');
        src.className = 'sources';
        src.textContent = 'Sources: ';
        sources.forEach((s, i) => {
          if (i > 0) src.append(document.createTextNode(' · '));
          const a = document.createElement('a');
          a.href = s.url;
          a.rel = 'noopener';
          a.textContent = s.label;
          src.append(a);
        });
        guide.append(src);
      }
    }
    body.append(guide);
  }
  li.append(body);

  const badge = document.createElement('span');
  badge.className = `grade-badge grade-${trophy.grade}`;
  badge.textContent = trophy.grade;
  li.append(badge);
  return li;
}

function renderList() {
  document.body.classList.toggle('spoilers-on', settings.spoilers);
  const shown = trophies.filter((t) => trophyMatches(t, filters, earned));
  listEl.replaceChildren();
  for (const t of shown) listEl.append(renderTrophy(t));
  resultCount.textContent = `Showing ${shown.length} of ${trophies.length} trophies`;
  emptyState.hidden = shown.length !== 0;
}

function applySettingsToControls() {
  $('spoilerToggle').checked = settings.spoilers;
  $('hideEarned').checked = settings.hideEarned;
  $('gradeSelect').value = filters.grade;
  $('searchInput').value = params.get('q') ?? '';
  $('missableOnly').checked = filters.missableOnly;
}

$('spoilerToggle').addEventListener('change', (e) => {
  settings.spoilers = e.target.checked;
  saveSettings(settings);
  renderProgress();
  renderList();
});
$('hideEarned').addEventListener('change', (e) => {
  filters.hideEarned = e.target.checked;
  settings.hideEarned = e.target.checked;
  saveSettings(settings);
  renderList();
});
$('gradeSelect').addEventListener('change', (e) => {
  filters.grade = e.target.value;
  renderList();
});
$('missableOnly').addEventListener('change', (e) => {
  filters.missableOnly = e.target.checked;
  renderList();
});
$('searchInput').addEventListener('input', (e) => {
  filters.query = e.target.value.trim().toLowerCase();
  renderList();
});
$('exportBtn').addEventListener('click', () => exportFile(earned, settings));
$('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const { earned: next, settings: nextSettings, ignored } = await importFile(file, trophies.map((t) => t.name));
    earned = next;
    saveEarned(earned);
    if (nextSettings) {
      settings = { ...settings, ...nextSettings };
      saveSettings(settings);
    }
    applySettingsToControls();
    renderProgress();
    renderList();
    resultCount.textContent = ignored > 0
      ? `Imported ${earned.size} trophies (${ignored} unknown names skipped).`
      : `Imported ${earned.size} trophies.`;
  } catch (err) {
    resultCount.textContent = `Import failed: ${err.message}`;
  }
  e.target.value = '';
});
$('resetBtn').addEventListener('click', () => {
  if (!window.confirm('Clear all earned trophies and settings?')) return;
  earned = new Set();
  saveEarned(earned);
  settings = { spoilers: true, hideEarned: false };
  saveSettings(settings);
  filters.hideEarned = false;
  filters.missableOnly = false;
  applySettingsToControls();
  renderProgress();
  renderList();
});

applySettingsToControls();
renderKindChips();
renderProgress();
renderList();
