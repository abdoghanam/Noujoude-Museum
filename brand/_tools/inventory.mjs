// ═══════════════════════════════════════════════════════════════════════════════
// brand/_tools/inventory.mjs — the asset-catalogue row set for the identity system
// ───────────────────────────────────────────────────────────────────────────────
//     node brand/_tools/inventory.mjs        # → docs/BRAND_ASSET_INVENTORY.csv
//
// Why this is a separate file and not rows in docs/ASSET_INVENTORY_AUDIT.csv:
// that CSV is the output of scripts/audit-assets.mjs, which enumerates
// Noujoude.photo/ and reconciles it against the reference traceability sheet.
// Hand-appending rows there would be erased on its next run and would make the
// file disagree with its own generator. Same 20 columns, so a merge is mechanical
// if the audit script is ever widened to cover brand/.
//
// Nothing here is asserted from a name. Each column is measured or read from the
// record that made the file:
//   · size, SHA-256 and dimensions come from the bytes (viewBox for SVG, IHDR for PNG).
//   · role and script come from brand/svg/manifest.json, written by build.mjs.
//   · a PNG's vector master comes from brand/_tools/export-manifest.json, written by
//     export.mjs at the moment it rasterised it. Deriving it from the filename instead
//     is how og-1200x630-arabic.png ended up catalogued against the Latin lockup: the
//     size token swallows the language marker.
//   · rights status comes from the markup. An asset that carries seal artwork inherits
//     NDM-AST-001's UNKNOWN rights; one that carries only HarfBuzz outlines does not.
//     That is tested per file, not per naming convention — and testing it moved ten
//     colour and ten mono files from the clean column to the open-question column.
// ═══════════════════════════════════════════════════════════════════════════════
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT = path.resolve(import.meta.dirname, '../..');
const cd = (...p) => path.join(ROOT, ...p);
const OUT = cd('docs', 'BRAND_ASSET_INVENTORY.csv');
const TODAY = '2026-11-02';

const COLS = ['Asset ID', 'Filename', 'Expected Category', 'Physical Status', 'Actual Path',
  'MIME Type', 'Width', 'Height', 'File Size', 'SHA-256', 'Source/Creator', 'Rights Status',
  'Brand/Curatorial Approval', 'Intended Usage', 'Actual Usage', 'Derivative Status',
  'Alt Text Status', 'Notes', 'Verified By', 'Verified Date'];

const QUOTE = '"';
const cell = (v) => {
  const s = String(v ?? '');
  if (!/[",\r\n]/.test(s)) return s;
  return QUOTE + s.replaceAll(QUOTE, QUOTE + QUOTE) + QUOTE;
};

const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

/** SVG: the viewBox is the truth about proportion; width/height attrs are its px echo. */
function svgDims(txt) {
  const vb = /viewBox="([-\d. ]+)"/.exec(txt);
  if (!vb) return { w: '', h: '', note: 'NO viewBox — dimensions unknown' };
  const [x, y, w, h] = vb[1].trim().split(/\s+/).map(Number);
  return { w, h, note: (x !== 0 || y !== 0) ? `viewBox origin ${x},${y}` : '' };
}
/** PNG: IHDR, read straight from the header bytes. */
function pngDims(buf) {
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

const MIME = { '.svg': 'image/svg+xml', '.png': 'image/png' };
const CATEGORY = 'A.2 Brand Identity Assets';

// ── the two provenance classes, stated once ───────────────────────────────────
// SEAL: a redraw of NDM-AST-001, whose provenance and rights are UNKNOWN. A
// derivative inherits the question; it does not answer it.
// TYPE: outlines drawn by HarfBuzz from OFL 1.1 families. Independent creation,
// clean licence, no dependency on the unknown asset.
const SEAL_RIGHTS = 'UNKNOWN — contains artwork redrawn from NDM-AST-001 whose rights are UNKNOWN; a derivative inherits the question, it does not answer it';
const TYPE_RIGHTS = 'OPEN QUESTION — outlines drawn from SIL OFL 1.1 fonts (licence permits embedding and redistribution of derived artwork); institutional mark itself not yet approved';
const NOT_APPROVED = 'Not Approved — no approval record supplied; OID-18 (final logo and variants) is Outstanding';
const DERIV_SEAL = 'DERIVATIVE (vector redraw) of NDM-AST-001 brand_seal_monogram_1024.webp';
const DERIV_TYPE = 'Original (vector outlines generated from an OFL font; no reference asset involved)';

/** Does this markup carry seal artwork? Tested by the ids only the seal drawing has. */
const embedsSeal = (txt) => /id="n-half"|<g id="artwork">/.test(txt) || /href="#leaf"/.test(txt);

// ── what the build recorded about itself ─────────────────────────────────────
const BUILD = JSON.parse(fs.readFileSync(cd('brand/svg/manifest.json'), 'utf8'));
const ROLE = new Map(BUILD.assets.map((a) => [a.file, a]));

/** §12.7 usage, keyed by the role name build.mjs writes. Documentation, not provenance. */
const USAGE = {
  'N Monogram / Seal': 'compact navigation, loading identity, watermark, small brand signatures',
  'Primary Wordmark': 'main site identity, formal institutional presentation',
  'Primary Wordmark + laurel': 'editorial and promotional compositions',
  'Primary Wordmark (alternate)': 'alternate cut for Arabic display assignments (§12.5)',
  'Primary Wordmark (display variant)': 'display settings only; kashida is a justification, not a spelling',
  'Primary lockup': 'header and formal presentation',
  'Primary lockup (mirrored)': 'header and formal presentation, RTL (§10 mirroring)',
  'Stacked Wordmark': 'vertical compositions, promotional use, social cards',
  'Burgundy Badge': 'selected approved identity applications',
  'Application icon': 'home screen, app tile, launcher',
  'Small-size mark / favicon': 'favicon and any rendering at 48 px or below',
  'Watermark': 'approved original collection photographs only',
};

// ── what the exporter recorded about each PNG ───────────────────────────────
const EXPORT_PATH = 'brand/_tools/export-manifest.json';
const EXPORTS = fs.existsSync(cd(EXPORT_PATH))
  ? new Map(JSON.parse(fs.readFileSync(cd(EXPORT_PATH), 'utf8')).assets.map((a) => [a.file, a]))
  : null;

const rows = [];
let n = 0;
const id = () => 'NDM-BRD-' + String(++n).padStart(3, '0');

function add(absRel, { category = CATEGORY, role, rights, deriv, creator, extra = '' }) {
  const p = cd(absRel);
  if (!fs.existsSync(p)) {
    rows.push([id(), path.basename(absRel), category, 'MISSING', absRel,
      '', '', '', '', '', creator ?? '', rights ?? '', NOT_APPROVED, role,
      '', deriv ?? '', '', extra, 'brand/_tools/inventory.mjs', TODAY]);
    return;
  }
  const buf = fs.readFileSync(p);
  const ext = path.extname(p).toLowerCase();
  const isSvg = ext === '.svg';
  const txt = isSvg ? buf.toString('utf8') : '';
  const d = isSvg ? svgDims(txt) : pngDims(buf);
  const notes = [extra,
    isSvg && d.note,
    /watermark/.test(absRel) ? 'WATERMARK RULE §12.7: must not obscure the object or documentary details' : '',
    /arabic/i.test(absRel) ? 'Arabic: never letterspace, never stretch; joining verified by brand/_tools/joincheck.mjs (4 ink islands for نجود)' : '',
    absRel.startsWith('brand/svg/mono/') ? 'Single ink (currentColor) — required for librsvg rasterisers, which ignore var()' : '',
  ].filter(Boolean).join(' ; ');
  rows.push([id(), path.basename(absRel), category, 'PRESENT', absRel, MIME[ext],
    d.w, d.h, buf.length, sha(p), creator, rights, NOT_APPROVED, role,
    'None — no application code exists yet (src/ is empty)', deriv, 'Not Recorded',
    notes, 'brand/_tools/inventory.mjs (measured from the file)', TODAY]);
}

// ── 1 · the hand-authored parent ──────────────────────────────────────────────
add('brand/noujoude-monogram-seal.svg', {
  role: 'N Monogram / Seal — parent artwork; §12.7 seal in every use',
  rights: SEAL_RIGHTS,
  deriv: DERIV_SEAL,
  creator: 'Not supplied in any reference document (the source raster has no creator record); redrawn as vector by Qoder at Owner request "重绘成可编辑 SVG", 2026-11-02',
  extra: 'LAYERED, NOT TRACED — #frame #wreath #crest #footer #monogram, with symmetric halves mirrored; this is the only identity file meant to be edited by hand',
});

// ── 2 · the generated vector masters ─────────────────────────────────────────
const vectorMasters = [
  ...fs.readdirSync(cd('brand/svg')).filter((f) => f.endsWith('.svg')).sort().map((f) => ['brand/svg/' + f, f]),
  ...fs.readdirSync(cd('brand/svg/mono')).filter((f) => f.endsWith('.svg')).sort().map((f) => ['brand/svg/mono/' + f, f]),
];
for (const [rel, file] of vectorMasters) {
  const mono = rel.includes('/mono/');
  const a = ROLE.get(file) ?? { role: 'N Monogram / Seal', script: 'none' };
  const txt = fs.readFileSync(cd(rel), 'utf8');
  const fromSeal = embedsSeal(txt);
  const usage = [a.role, USAGE[a.role] ?? '—',
    a.script === 'Arabic' ? 'ar locale' : null, mono ? 'mono cut' : null].filter(Boolean).join(' — ');
  add(rel, {
    rights: fromSeal ? SEAL_RIGHTS : TYPE_RIGHTS,
    deriv: fromSeal
      ? DERIV_SEAL + ' — seal artwork inlined by build.mjs' + (mono ? '; repainted to a single ink' : '')
      : DERIV_TYPE + (mono ? '; single-ink variant of the colour master' : ''),
    creator: 'Generated by brand/_tools/build.mjs'
      + (a.face ? ` from ${a.face}` : fromSeal ? ' (seal artwork + type)' : ' from an OFL 1.1 font'),
    role: usage,
    extra: 'GENERATED — do not edit; change build.mjs and re-run'
      + (a.note ? ' ; ' + a.note : ''),
  });
}

// ── 3 · the raster matrix, one row per size ──────────────────────────────────
function walk(dir) {
  return fs.readdirSync(cd(dir), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name).split('\\').join('/')]);
}
const unrecorded = [];
for (const rel of walk('brand/png').sort()) {
  const key = rel.slice('brand/png/'.length);
  const rec = EXPORTS?.get(key);
  if (!rec) {
    // The asset is still catalogued: dropping it would make the inventory lie by
    // omission. What is unknown is stated as unknown, in the provenance columns.
    unrecorded.push(key);
    add(rel, {
      rights: 'UNVERIFIED — the raster exists but no export record names its master',
      deriv: 'UNKNOWN — no entry for this file in ' + EXPORT_PATH,
      creator: 'Unknown — run brand/_tools/export.mjs to record provenance',
      role: 'Raster export of an unrecorded master — §12.7 role cannot be established',
      extra: 'PROVENANCE NOT RECORDED',
    });
    continue;
  }
  const master = 'brand/svg/' + rec.src;
  const masterStem = path.basename(rec.src);
  const a = ROLE.get(masterStem) ?? { role: 'N Monogram / Seal', script: 'none' };
  const mtxt = fs.existsSync(cd(master)) ? fs.readFileSync(cd(master), 'utf8') : '';
  const fromSeal = embedsSeal(mtxt);
  add(rel, {
    rights: fromSeal ? SEAL_RIGHTS : TYPE_RIGHTS,
    deriv: 'DERIVATIVE raster of ' + master + (fromSeal ? ' — which is itself ' + DERIV_SEAL : ''),
    creator: `Generated by brand/_tools/export.mjs (librsvg via sharp) from ${rec.src}`
      + ` on a ${rec.ground} ground` + (rec.ink ? `, ink ${rec.ink}` : ''),
    role: `${a.role} — raster export, ${rec.width}×${rec.height}${rec.ink ? ', mono cut re-inked for a light ground' : ''}`,
    extra: 'GENERATED — re-run brand/_tools/export.mjs',
  });
}
if (unrecorded.length) {
  console.error(`\nWARNING ${unrecorded.length} PNG(s) have no record in ${EXPORT_PATH}: ${unrecorded.join(', ')}`);
  console.error('        → run brand/_tools/export.mjs, then re-run this tool.');
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, [COLS, ...rows].map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n', 'utf8');

const byCat = rows.reduce((a, r) => (a[r[2]] = (a[r[2]] || 0) + 1, a), {});
const openRights = rows.filter((r) => r[11] === SEAL_RIGHTS).length;
console.log(`${rows.length} rows → docs/BRAND_ASSET_INVENTORY.csv`);
for (const [k, v] of Object.entries(byCat)) console.log(`  ${String(v).padStart(4)}  ${k}`);
console.log(`  ${String(openRights).padStart(4)}  rows carrying seal artwork → rights UNKNOWN (NDM-AST-001)`);
console.log(`  ${String(rows.length - openRights).padStart(4)}  rows that are type-only → OFL, mark unapproved`);
if (EXPORTS) console.log(`  provenance source: ${EXPORT_PATH} (${EXPORTS.size} records)`);
