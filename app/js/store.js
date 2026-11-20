// Progress store: which trophies are earned, saved in localStorage.
// Keyed by trophy id so a reordered list never loses a tick.
const KEY = 'leonida-trophy-guide-v1';

function readRaw() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { earned: [] };
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.earned)) return { earned: [] };
    return { earned: parsed.earned.filter((n) => Number.isInteger(n)) };
  } catch (_err) {
    return { earned: [] };
  }
}

export function loadEarned() {
  return new Set(readRaw().earned);
}

export function saveEarned(earnedSet) {
  const earned = [...earnedSet].sort((a, b) => a - b);
  localStorage.setItem(KEY, JSON.stringify({ earned, savedAt: new Date().toISOString() }));
}

export function exportProgress(earnedSet) {
  const payload = {
    app: 'leonida-trophy-guide',
    version: 1,
    exportedAt: new Date().toISOString(),
    earned: [...earnedSet].sort((a, b) => a - b),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'leonida-trophy-progress.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseImportFile(text) {
  const parsed = JSON.parse(text);
  const list = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(list)) throw new Error('No earned list in file');
  const ids = list.map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 55);
  return new Set(ids);
}
