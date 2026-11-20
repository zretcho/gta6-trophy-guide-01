// Leonida Trophy Guide — entry program (make.fun program/v1).
// Copies app/ and screenshots/ into the output directory and writes
// /output/dossier.json with buildDossier from vendor/makefun-frontend.ts.
// Run: MAKEFUN_OUTPUT_DIR=out node main.ts
// In the grader the output directory is /output and the repo is read-only.

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
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

// Re-reads the dossier just written and checks it against the files on
// disk: every screenshot's recorded sha256 must match its file, every
// first-load file's recorded raw size must match, and the whole-app file
// count and byte total must match. A truncated copy or a stale file would
// otherwise hand the scorer a dossier that does not describe the output;
// fail loudly (non-zero exit) instead of passing silently.
function verifyDossier(outputDir) {
  const dossierPath = join(outputDir, 'dossier.json');
  const dossier = JSON.parse(readFileSync(dossierPath, 'utf8'));
  if (dossier.schema !== 'makefun/dossier/v1') {
    throw new Error(`dossier schema mismatch: ${dossier.schema}`);
  }
  for (const image of dossier.images) {
    const file = join(outputDir, 'screenshots', image.name);
    if (!existsSync(file)) throw new Error(`dossier lists missing screenshot: ${image.name}`);
    const actual = createHash('sha256').update(readFileSync(file)).digest('hex');
    if (actual !== image.sha256) {
      throw new Error(`screenshot sha256 mismatch: ${image.name} (dossier ${image.sha256}, disk ${actual})`);
    }
  }
  const loadBlock = dossier.text.slice(0, dossier.text.indexOf('## Sources'));
  for (const [, path, bytes] of loadBlock.matchAll(/^  app\/([^:]+): (\d+) bytes raw/gm)) {
    const file = join(outputDir, 'app', path);
    if (!existsSync(file)) throw new Error(`dossier lists missing app file: app/${path}`);
    const actual = statSync(file).size;
    if (actual !== Number(bytes)) {
      throw new Error(`app file size mismatch: app/${path} (dossier ${bytes}, disk ${actual})`);
    }
  }
  const whole = loadBlock.match(/^Whole app: (\d+) files, (\d+) bytes/m);
  if (!whole) throw new Error('dossier Load block has no Whole app line');
  let files = 0;
  let bytes = 0;
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) {
        files += 1;
        bytes += statSync(full).size;
      }
    }
  };
  walk(join(outputDir, 'app'));
  if (files !== Number(whole[1]) || bytes !== Number(whole[2])) {
    throw new Error(`whole app mismatch: dossier ${whole[1]} files, ${whole[2]} bytes; disk ${files} files, ${bytes} bytes`);
  }
  console.log(`verified dossier: ${dossier.images.length} screenshots, ${files} app files, ${bytes} bytes`);
}

clearOutputContents(outputDir);
copyTree(join(repoRoot, 'app'), join(outputDir, 'app'));
copyTree(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'));
const dossier = buildDossier(outputDir, caps);
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`wrote ${join(outputDir, 'dossier.json')} (${dossier.length} bytes)`);
verifyDossier(outputDir);
