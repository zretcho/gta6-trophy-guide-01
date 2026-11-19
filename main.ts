// Leonida Trophy Guide — the entry program (Node 22, standard library only).
//
// The guide itself is plain static files under app/: index.html opens in desktop
// Chrome and works with the network off, its trophy data in data/trophies.json and
// its tracker in app.js with js/store.js and js/filters.js. No build step.
//
// This program hands the guide in: it copies app/ and screenshots/ from beside
// this file into the output directory and writes output/dossier.json with the
// vendored make.fun library (vendor/makefun-frontend.ts, unchanged — the scorer
// requires the dossier to be byte for byte what its own copy of that library
// writes). Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The program runs twice and must write the same bytes both times; it writes
// nothing else, so it does. Serve the guide locally with `node serve.ts` and
// open http://localhost:8080.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Start from a clean output directory so a stale file from an earlier run can
// never ride along into the entry.
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });

const shotsDir = join(repoRoot, 'screenshots');
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's own caps for this bounty (reference/gate.json): the dossier text
// is capped at 160 KiB, at most 4 screenshots of at most 256 KiB each, app/ at
// most 993 files and directories and 48 MiB in all.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
