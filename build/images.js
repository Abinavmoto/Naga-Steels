/* ============================================================
   NAGA STEELS, lossless image optimisation
   ------------------------------------------------------------
   Run:  npm run images

   Re-encodes assets/img/home/*.png as WebP in LOSSLESS mode,
   verifies the output is pixel-identical to the source, and
   only then rewrites the markup to point at the new files.

   ON QUALITY
   ----------
   This is not a quality trade. WebP lossless and PNG both decode
   to the same bitmap; WebP simply compresses that bitmap better.
   There is no quality parameter, no resampling, no resizing, no
   quantisation and no chroma subsampling anywhere in this file.

   Every converted file is then decoded back to raw RGBA and
   compared byte-for-byte against the source. If a single pixel
   differs the file is deleted and the markup is left untouched,
   so a bad encode can never reach the site.

   effort: 6 is the slowest, most thorough setting. This runs
   once at build time, so the extra seconds cost nothing.

   ORDER OF OPERATIONS
   -------------------
   Conversion and verification happen first, across every file.
   The markup is only rewritten if ALL of them passed. A partial
   rewrite would leave some <img> tags pointing at .webp files
   that do not exist, which is a worse failure than doing nothing.

   The .png originals are NOT deleted. Reverting is a git
   checkout of the HTML alone.
   ============================================================ */

import { readdir, stat, readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const IMG_DIR = path.join(ROOT, 'assets', 'img', 'home');

/* sharp is a devDependency and is only needed for this script, so fail
   with an instruction rather than an unhandled module error. */
let sharp;
try {
  ({ default: sharp } = await import('sharp'));
} catch {
  console.error('\n  sharp is not installed.\n');
  console.error('  npm install --save-dev sharp\n');
  process.exit(1);
}

const kb = (n) => String(Math.round(n / 1024)).padStart(6) + ' KB';
const pct = (a, b) => (100 - (b / a) * 100).toFixed(0);

/* ---- 1 · Convert and verify ------------------------------------------- */

const pngs = (await readdir(IMG_DIR)).filter((f) => f.endsWith('.png')).sort();

if (pngs.length === 0) {
  console.log('No .png files in assets/img/home. Nothing to do.');
  process.exit(0);
}

console.log(`\nConverting ${pngs.length} files, lossless.\n`);

let before = 0;
let after = 0;
const failed = [];

for (const file of pngs) {
  const src = path.join(IMG_DIR, file);
  const out = src.replace(/\.png$/, '.webp');

  await sharp(src).webp({ lossless: true, effort: 6 }).toFile(out);

  // Decode both back to raw pixels and compare. This is the guarantee,
  // not the `lossless: true` flag on its own.
  const [rawA, rawB] = await Promise.all([
    sharp(src).raw().toBuffer(),
    sharp(out).raw().toBuffer(),
  ]);

  if (!rawA.equals(rawB)) {
    await unlink(out);
    failed.push(file);
    console.log(`${file.padEnd(24)} PIXEL MISMATCH, discarded`);
    continue;
  }

  const a = (await stat(src)).size;
  const b = (await stat(out)).size;
  before += a;
  after += b;

  console.log(`${file.padEnd(24)} ${kb(a)} -> ${kb(b)}   -${pct(a, b)}%`);
}

console.log('\n' + '-'.repeat(56));

if (failed.length) {
  console.error(`\n  ${failed.length} file(s) did not round-trip identically:`);
  failed.forEach((f) => console.error(`    ${f}`));
  console.error('\n  Markup NOT rewritten. Nothing has changed.\n');
  process.exit(1);
}

console.log(`total ${kb(before)} -> ${kb(after)}   -${pct(before, after)}%`);
console.log(`saved ${kb(before - after)}`);
console.log('\nAll files verified pixel-identical to their source.');

/* ---- 2 · Rewrite the markup ------------------------------------------- */

/* Walk for .html rather than hard-coding a list: assets/img/home is
   referenced by index.html and by the nine product pages that carry a
   .product-shots grid, and that set will grow. */
async function htmlFiles(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...await htmlFiles(full));
    else if (entry.name.endsWith('.html')) found.push(full);
  }
  return found;
}

const REF = /(assets\/img\/home\/[a-z0-9-]+)\.png/g;

let touched = 0;
let refs = 0;

for (const file of await htmlFiles(ROOT)) {
  const original = await readFile(file, 'utf8');
  const matches = original.match(REF);
  if (!matches) continue;

  await writeFile(file, original.replace(REF, '$1.webp'), 'utf8');
  touched += 1;
  refs += matches.length;
  console.log(`  ${path.relative(ROOT, file).padEnd(52)} ${matches.length} refs`);
}

console.log(`\nRewrote ${refs} references across ${touched} file(s).`);
console.log('The <link rel="preload"> in index.html is included.\n');
console.log('The .png originals are untouched. Once you are happy with');
console.log('the result they can be deleted, along with the 24 leftover');
console.log('.svg scaffold placeholders in the same folder.\n');
