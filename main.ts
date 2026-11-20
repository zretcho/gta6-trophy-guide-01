// Leonida Trophy Guide — entry program (make.fun program/v1).
// Copies app/ and screenshots/ into the output directory and writes
// /output/dossier.json with buildDossier from vendor/makefun-frontend.ts.
// Run: MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader the output directory is /output and the repo is read-only.

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

// The caps the bounty's scorer hands buildDossier, from the gate in the
// kit's RULES.txt: text at most 163,840 bytes, 3 to 4 screenshots of at
// most 256 KiB, app/ at most 993 entries and 48 MiB, paths at most 1,000
// bytes. Only text_max_bytes shapes the dossier bytes; the rest refuse
// input the scorer would refuse, so they are passed through unchanged.
const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 256 * 1024 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000,
};

function clearOutputContents(dir) {
  mkdirSync(dir, { recursive: true });
  // The grader's /output is a mounted volume: never remove the directory
  // itself, only what is inside it, one entry at a time.
  for (const entry of readdirSync(dir)) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

function copyTree(source, target) {
  if (!existsSync(source)) throw new Error(`missing input directory: ${source}`);
  cpSync(source, target, { recursive: true });
}

clearOutputContents(outputDir);
copyTree(join(repoRoot, 'app'), join(outputDir, 'app'));
copyTree(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));
const dossier = buildDossier(outputDir, caps);
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`wrote ${join(outputDir, 'dossier.json')} (${dossier.length} bytes)`);
