// ═══════════════════════════════════════════════════════════════════════════════
// brand/_tools/build.mjs — the Noujoude identity system generator
// ───────────────────────────────────────────────────────────────────────────────
// Everything in brand/svg/ is GENERATED. Do not hand-edit the output; edit a source
// below and re-run:
//
//     node brand/_tools/build.mjs            # write brand/svg/ + manifest.json
//     node brand/_tools/build.mjs --preview  # also write brand/_tools/_t/sheet.jpg
//
// Sources of truth
//   brand/noujoude-monogram-seal.svg   the seal — parent artwork, inlined not linked
//   brand/_tools/fonts/*.ttf           OFL 1.1 faces, drawn out as outlines by HarfBuzz
//   docs/OWNER_INPUT_REGISTER.md        OID-01/02 — the Arabic name نجود is Owner-supplied
//
// Two rules are structural here, because they are the ones a human forgets:
//   1 · Arabic never gets letterspacing. run() throws on a right-to-left run that
//       carries tracking. Tracking is a Latin-device convention; spacing joined
//       script apart destroys the word.
//   2 · Nothing is stretched. Every placement is one uniform k for x and y, so
//       §12.7 "no stretching or proportion distortion" cannot be broken by accident.
// ═══════════════════════════════════════════════════════════════════════════════
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '../..');
const cd = (p) => path.join(ROOT, p).split('\\').join('/');
const PY = process.env.PY || 'C:/Users/NaDa/.venvs/noujoude-type/Scripts/python.exe';
const T2S = cd('brand/_tools/text2svg.py');
const FONT = (n) => cd(`brand/_tools/fonts/${n}`);
const OUTDIR = cd('brand/svg');
const PREVIEW = process.argv.includes('--preview');

// §12.2 canonical palette. Every colour in every file is one of these twelve,
// emitted as a CSS custom property with the hex as its fallback — so the marks
// re-tint from the design tokens in a browser and still render standalone.
const T = {
  noir: '#111014', midnight: '#1A151C', burgundy: '#351522', burgundy2: '#552536',
  gold: '#C6A56B', champagne: '#DFC99E', ivory: '#F3EBDD', paper: '#E5D8C3',
  stone: '#9D9184', rose: '#A96D78', wood: '#30241F', glass: '#D8D9D5',
};
const ink = (name) => `var(--ndm-${name},${T[name]})`;

const f2 = (n) => { const s = Number(n).toFixed(2).replace(/\.?0+$/, ''); return s === '' || s === '-0' ? '0' : s; };

// ─────────────────────────────────────────── text → outlines ──────────────────
const cache = new Map();
function shape({ font, text, size = 100, wght, tracking = 0, centre = false }) {
  const key = [font, text, size, wght, tracking, centre].join('|');
  if (cache.has(key)) return cache.get(key);
  const argv = [T2S, '--font', font, '--text', text, '--size', String(size),
    '--tracking', String(tracking), '--emit', 'json'];
  if (wght != null) argv.push('--wght', String(wght));
  if (centre) argv.push('--centre-baseline');
  const j = JSON.parse(execFileSync(PY, argv, { encoding: 'utf8', maxBuffer: 1 << 26,
    stdio: ['ignore', 'pipe', 'ignore'] }));
  cache.set(key, j);
  return j;
}

/** Place a shaped run with its INK box top-left at (X, Y), uniform scale from k|w|h. */
function run(j, X, Y, o = {}) {
  if (j.direction === 'rtl' && j.tracking) {
    throw new Error(`tracking ${j.tracking} on a right-to-left run — never letterspace Arabic`);
  }
  const k = o.k ?? (o.w != null ? o.w / j.ink.w : o.h != null ? o.h / j.ink.h : 1);
  const tx = X - k * j.ink.x0, ty = Y - k * j.ink.y0;
  const fill = o.fill ?? ink('gold');
  return {
    k, w: j.ink.w * k, h: j.ink.h * k,
    xml: `<g transform="translate(${f2(tx)} ${f2(ty)}) scale(${f2(k)})">`
       + `<path fill="${fill}" fill-rule="nonzero" d="${j.path}"/></g>`,
  };
}

// ─────────────────────────────────────────── the seal ─────────────────────────
const SEAL_PATH = cd('brand/noujoude-monogram-seal.svg');
const sealSrc = fs.readFileSync(SEAL_PATH, 'utf8');
const SEAL_DEFS = sealSrc.match(/\n  <defs>([\s\S]*?)\n  <\/defs>/)[1];
const SEAL_ART = sealSrc.match(/\n  <g id="artwork">([\s\S]*?)\n  <\/g>\n<\/svg>/)[1];
if (!SEAL_DEFS || !SEAL_ART) throw new Error('could not split the seal into defs + artwork');

/** True ink box of the seal, measured by rasterising it once. Lockups align to
 *  this, not to the 1024 frame — the wreath overhangs the ring by ~120 units, so
 *  aligning to the frame leaves the mark visibly high and left. */
async function sealBox() {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">'
    + `<defs>${SEAL_DEFS}</defs><g id="artwork">${SEAL_ART}</g></svg>`;
  const { data, info } = await sharp(Buffer.from(svg), { density: 300 })
    .resize(1024, 1024).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] > 6) {
      if (x < x0) x0 = x; if (x > x1) x1 = x;
      if (y < y0) y0 = y; if (y > y1) y1 = y;
    }
  }
  return { x0, y0, x1, y1, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

/** The seal artwork at ink-diameter d, ink-centred on (cx, cy).
 *  mono = one currentColor, no gradients — for watermarks and single-ink use.
 *  The wreath, the letter and the ornaments all live in DEFS, so a mono pass has
 *  to rewrite DEFS too or the leaves keep their champagne gradient. */
const paint = (s) => s
  .replace(/url\(#g(?:Wide|Letter|Leaf|Berry|Gem)\)/g, 'currentColor')
  .replace(/#FBEAE2|#F6DED2|#9C8058/g, 'currentColor');
function sealMonoDefs(defs) {
  const a = defs.lastIndexOf('<!--', defs.indexOf('PALETTE'));
  const b = defs.lastIndexOf('<!--', defs.indexOf('ORNAMENTS'));
  return a > -1 && b > a ? defs.slice(0, a) + defs.slice(b) : defs;   // drop the unused ramps
}
function sealAt(box, cx, cy, d, o = {}) {
  const k = d / Math.max(box.w, box.h);
  const ox = box.x0 + box.w / 2, oy = box.y0 + box.h / 2;
  const body = o.mono ? paint(SEAL_ART) : SEAL_ART;
  // `color` is the only thing a mono wrapper may set: fill/stroke are inherited
  // properties, so setting them here would stroke every unstroked path in the seal.
  return `<!-- seal: brand/noujoude-monogram-seal.svg, ink-centred, uniform scale -->\n`
    + `    <g${o.mono ? ` color="${o.color ?? ink('ivory')}"` : ''}`
    + ` transform="translate(${f2(cx)} ${f2(cy)}) scale(${f2(k)}) translate(${f2(-ox)} ${f2(-oy)})">`
    + `${body}</g>`;
}
const sealDefsFor = (mono) => mono
  ? `  <defs><!-- inlined from brand/noujoude-monogram-seal.svg, single ink -->${sealMonoDefs(paint(SEAL_DEFS))}</defs>\n`
  : `  <defs><!-- inlined from brand/noujoude-monogram-seal.svg -->${SEAL_DEFS}</defs>\n`;
const SEAL_DEFS_BLOCK = sealDefsFor(false);

// ─────────────────────────────────────── file scaffolding ─────────────────────
/** XML comments may not contain a double hyphen. Every string that can reach a
 *  comment goes through here, so the failure is a clear message and not a corrupt
 *  file that only shows up when something tries to render it. */
const xss = (s) => String(s).replace(/-{2,}/g, ' ‑ ').replace(/<\/?(svg|style|script)/gi, '< $1');
function file({ name, role, title, vb, body, defs = '', note, dir = 'ltr' }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!--
  GENERATED — do not edit.  brand/_tools/build.mjs writes this file; re-run it.
      role        · ${xss(role)}
      type        · outlines only (HarfBuzz-shaped from OFL 1.1 faces); no live text
      colour      · CSS custom properties ndm-*, each with its §12.2 hex as fallback
      direction   · ${dir}
      clear space · see brand/README.md — it is NOT baked into this viewBox
  ${xss(note)}
-->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map(f2).join(' ')}" width="${f2(vb[2])}" height="${f2(vb[3])}"
     role="img" aria-labelledby="${name}-t ${name}-d" direction="${dir}">
  <title id="${name}-t">${xss(title)}</title>
  <desc id="${name}-d">${xss(role)} Generated by brand/_tools/build.mjs.</desc>
${defs}${body}
</svg>
`;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  THE TYPE STACK
//  Latin display · Cormorant Garamond 600 — §12.5 "Main display" for English.
//  Latin caps    · Cormorant Garamond 500, tracked 300/1000 em.
//  Latin tagline · Cormorant Garamond 500, tracked 320/1000 em.
//  Arabic name   · Amiri Bold.  DEVIATION, deliberate and recorded: §12.5 maps
//      Arabic main display to Tajawal. Tajawal is a geometric UI sans and it is
//      kept for Arabic headings, body and labels. For the institutional NAME the
//      naskh proportion and contrast of Amiri is what carries "archival
//      authenticity", and it is the face that pairs with a Garamond-class Latin.
//      A Tajawal cut of the same wordmark ships alongside it so the Owner can
//      choose — that choice is BA-001 territory, not this script's to make
//      silently.
//  Arabic tagline· Tajawal Bold — the specified Arabic display role.
// ═══════════════════════════════════════════════════════════════════════════════
const CG = FONT('CormorantGaramond.ttf');
const AMIRI_B = FONT('Amiri-Bold.ttf');
const TAJ_B = FONT('Tajawal-Bold.ttf');

const AR_NAME = 'نجود';
const AR_TAG = 'متحف التراث الرقمي';
const EN_TAG = 'DIGITAL HERITAGE MUSEUM';

const written = [];
const write = (n, s) => { fs.writeFileSync(path.join(OUTDIR, n), s); written.push(n); };

/** A laurel sprig: two mirrored branches, built from the seal's own #leaf so the
 *  ornament and the monogram are literally the same plant. */
function sprig(cx, cy, span, colour = ink('gold')) {
  const half = span / 2;
  const P = (sgn, t) => {                       // point on the quadratic branch
    const p0 = [0, 0], p1 = [sgn * half * 0.55, -half * 0.20], p2 = [sgn * half, -half * 0.16];
    const u = 1 - t;
    return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0],
            u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]];
  };
  const TAN = (sgn, t) => {                     // tangent angle of that quadratic
    const p1 = [sgn * half * 0.55, -half * 0.20], p2 = [sgn * half, -half * 0.16];
    const dx = 2 * (1 - t) * p1[0] + 2 * t * (p2[0] - p1[0]);
    const dy = 2 * (1 - t) * p1[1] + 2 * t * (p2[1] - p1[1]);
    return Math.atan2(dy, dx) * 180 / Math.PI;
  };
  const stem = (sgn) => `M0 0Q${f2(sgn * half * 0.55)} ${f2(-half * 0.20)} ${f2(sgn * half)} ${f2(-half * 0.16)}`;
  let g = `<g transform="translate(${f2(cx)} ${f2(cy)})">`
    + `<g fill="none" stroke="${colour}" stroke-linecap="round">`
    + `<path d="${stem(1)}" stroke-width="2.6"/><path d="${stem(-1)}" stroke-width="2.6"/></g>`
    + `<circle cx="0" cy="0" r="3.4" fill="${colour}"/>`;
  for (const sgn of [1, -1]) {
    for (const [t, s, open] of [[0.24, 0.20, 26], [0.48, 0.26, 24], [0.72, 0.21, 22], [0.94, 0.16, 20]]) {
      const [px, py] = P(sgn, t);
      // #leaf points along +X and is 100 units long, so scale = wanted length / 100.
      // stroke="none" is load-bearing: the leaf path carries no stroke of its own and
      // would otherwise inherit the stem stroke and come out twice as fat.
      const len = s * half;
      const rot = TAN(sgn, t) - open * sgn;
      g += `<use href="#leaf" stroke="none" transform="translate(${f2(px)} ${f2(py)}) rotate(${f2(rot)}) scale(${f2(len / 100)})"/>`;
    }
  }
  return g + '</g>';
}

async function build() {
  fs.mkdirSync(OUTDIR, { recursive: true });
  const box = await sealBox();

  // ── the runs ───────────────────────────────────────────────────────────────
  const lat = shape({ font: CG, text: 'Noujoude', size: 200, wght: 600, tracking: 30 });
  const latCaps = shape({ font: CG, text: 'NOUJOUDE', size: 100, wght: 500, tracking: 300 });
  const tagLat = shape({ font: CG, text: EN_TAG, size: 46, wght: 500, tracking: 320 });
  const ara = shape({ font: AMIRI_B, text: AR_NAME, size: 200 });
  const araTaj = shape({ font: TAJ_B, text: AR_NAME, size: 200 });
  const araKash = shape({ font: AMIRI_B, text: 'نــجــود', size: 200 });
  const tagAra = shape({ font: TAJ_B, text: AR_TAG, size: 60 });

  const PAD = 12;                       // breathing room in the viewBox, NOT clear space
  const SEAL_D = 300;                   // working seal ink diameter in the lockups

  // ── bilingual sizing rule ────────────────────────────────────────────────────
  // The Latin name is 4.01:1, so width is the axis that carries it and the tagline
  // can be justified to it. The Arabic name is 1.30:1 — matching WIDTHS makes it
  // twice the height and the two lockups stop reading as one system in two scripts.
  // So the Arabic name is sized by HEIGHT against the Latin name. The 1.25 allowance
  // is because naskh carries its mass vertically; an exact height match makes the
  // Arabic look under-scaled next to a Latin word with ascenders and descenders.
  const LAT_NAME_W = 470;
  const latNameH = lat.ink.h * (LAT_NAME_W / lat.ink.w);
  const ARA_NAME_H = latNameH * 1.25;
  const ARA_NAME_W = ARA_NAME_H * (ara.ink.w / ara.ink.h);
  // In the stacked form the Latin line is tracked capitals — a caption, not a name.
  // The Arabic counterpart is the name itself, so it is sized against the seal
  // instead: just under half its diameter keeps the roundel dominant.
  const ARA_STACK_H = SEAL_D * 0.46;
  const ARA_STACK_W = ARA_STACK_H * (ara.ink.w / ara.ink.h);

  // ═════════════════════════════════ 1 · WORDMARKS ════════════════════════════
  const wordmark = (j, fn, title, note, extra) => {
    const vb = [0, 0, j.ink.w + PAD * 2, j.ink.h + PAD * 2];
    write(fn, file({
      name: fn.replace(/\.svg$/, '').replace(/[^a-z0-9]+/gi, '-'),
      role: 'Primary Wordmark — main site identity, formal institutional presentation (§12.7)',
      title, vb, dir: j.direction === 'rtl' ? 'rtl' : 'ltr', note,
      defs: extra ? SEAL_DEFS_BLOCK : '',
      body: `\n    ${run(j, PAD, PAD).xml}\n${extra ?? ''}`,
    }));
  };
  wordmark(lat, 'noujoude-wordmark-latin.svg', 'Noujoude',
    'Cormorant Garamond 600, tracked 30/1000 em, drawn to outlines.');
  wordmark(ara, 'noujoude-wordmark-arabic.svg', AR_NAME,
    'Amiri Bold, no tracking. Arabic is joined script — letterspacing is forbidden. '
    + 'The name is Owner-supplied (OWNER_INPUT_REGISTER OID-01/02).');
  wordmark(araTaj, 'noujoude-wordmark-arabic-tajawal.svg', AR_NAME,
    'Tajawal Bold — the §12.5 literal Arabic display role. Alternate cut, pending BA-001.');
  wordmark(araKash, 'noujoude-wordmark-arabic-kashida.svg', 'نــجــود',
    'Kashida-justified cut, matching the Owner’s own spelling نــجــود. Display use only.');

  // 1e — wordmark + laurel (Owner reference 4)
  {
    const gap = 30, sprigSpan = lat.ink.w * 0.30, sprigH = sprigSpan * 0.16 + sprigSpan * 0.10;
    const vb = [0, 0, lat.ink.w + PAD * 2, lat.ink.h + gap + sprigH + PAD * 2];
    write('noujoude-wordmark-latin-ornamented.svg', file({
      name: 'wm-lat-laurel', role: 'Primary Wordmark with laurel — editorial and promotional',
      title: 'Noujoude', vb, defs: SEAL_DEFS_BLOCK,
      note: 'The sprig is composed from the seal’s own #leaf, so ornament and monogram share one plant.',
      body: `\n    ${run(lat, PAD, PAD).xml}\n    `
          + sprig(PAD + lat.ink.w / 2, PAD + lat.ink.h + gap + sprigH * 0.62, sprigSpan) + '\n',
    }));
  }

  // ═════════════════════════════════ 2 · LOCKUPS ══════════════════════════════
  // 2a — horizontal Latin: seal · hairline · name over tagline (Owner reference 2)
  {
    const nameW = LAT_NAME_W, gap = 64;
    const k = nameW / lat.ink.w, nameH = lat.ink.h * k;
    const tag = run(tagLat, 0, 0, { w: nameW });
    const blockH = nameH + 26 + tag.h;
    const H = Math.max(SEAL_D, blockH);
    const vb = [0, 0, SEAL_D + gap + nameW + PAD * 2, H + PAD * 2];
    const x0 = PAD, y0 = PAD + (H - SEAL_D) / 2;
    const tx = x0 + SEAL_D + gap;
    const nameTop = PAD + (H - blockH) / 2;
    const body = `
    ${sealAt(box, x0 + SEAL_D / 2, y0 + SEAL_D / 2, SEAL_D)}
    <line x1="${f2(tx - gap / 2)}" y1="${f2(PAD + H * 0.18)}" x2="${f2(tx - gap / 2)}" y2="${f2(PAD + H * 0.82)}"
          stroke="${ink('gold')}" stroke-width="1.6" opacity=".5"/>
    ${run(lat, tx, nameTop, { w: nameW }).xml}
    ${run(tagLat, tx, nameTop + nameH + 26, { w: nameW }).xml}
`;
    write('noujoude-lockup-horizontal-latin.svg', file({
      name: 'lk-lat', role: 'Primary lockup (horizontal) — header, formal presentation (§12.7)',
      title: `Noujoude — ${EN_TAG}`, vb, defs: SEAL_DEFS_BLOCK, body,
      note: 'Optical centring against the seal INK box, not its 1024 frame. The tagline is justified to '
          + 'the name width, which is what makes its own size fall out rather than being guessed.',
    }));
  }

  // 2b — horizontal Arabic: mirrored, per the §10 RTL rule
  {
    const nameW = ARA_NAME_W, nameH = ARA_NAME_H, gap = 64;
    const tag = run(tagAra, 0, 0, { w: nameW });
    const blockH = nameH + 22 + tag.h;
    const H = Math.max(SEAL_D, blockH);
    const vb = [0, 0, SEAL_D + gap + nameW + PAD * 2, H + PAD * 2];
    const y0 = PAD + (H - SEAL_D) / 2;
    // the exact mirror of the Latin lockup: seal on the right, text on the left,
    // divider between them at the same offset from each.
    const sealCx = PAD + SEAL_D + gap + nameW - SEAL_D / 2;
    const divX = PAD + nameW + gap / 2;
    const nameTop = PAD + (H - blockH) / 2;
    const body = `
    ${sealAt(box, sealCx, y0 + SEAL_D / 2, SEAL_D)}
    <line x1="${f2(divX)}" y1="${f2(PAD + H * 0.18)}" x2="${f2(divX)}" y2="${f2(PAD + H * 0.82)}"
          stroke="${ink('gold')}" stroke-width="1.6" opacity=".5"/>
    ${run(ara, PAD, nameTop, { w: nameW }).xml}
    ${run(tagAra, PAD, nameTop + nameH + 22, { w: nameW }).xml}
`;
    write('noujoude-lockup-horizontal-arabic.svg', file({
      name: 'lk-ara', role: 'Primary lockup (horizontal) — Arabic (§10 mirroring)',
      title: `${AR_NAME} — ${AR_TAG}`, vb, defs: SEAL_DEFS_BLOCK, dir: 'rtl', body,
      note: 'Mirrored composition: the seal leads from the right and the text runs to the left. Nothing is '
          + 'flipped — the Arabic keeps its own shaping, proportions and face.',
    }));
  }

  // 2c — stacked Latin: seal over tracked caps (Owner reference 3). No tagline:
  //      at the size a stacked lockup is used, a 23-character tagline matched to
  //      the name width drops below legible. It belongs to the horizontal form.
  {
    const capsW = 340, k = capsW / latCaps.ink.w, capsH = latCaps.ink.h * k;
    const gap = 46;
    const W = Math.max(SEAL_D, capsW);
    const vb = [0, 0, W + PAD * 2, SEAL_D + gap + capsH + PAD * 2];
    const cx = PAD + W / 2;
    const body = `
    ${sealAt(box, cx, PAD + SEAL_D / 2, SEAL_D)}
    ${run(latCaps, cx - capsW / 2, PAD + SEAL_D + gap, { w: capsW }).xml}
`;
    write('noujoude-lockup-stacked-latin.svg', file({
      name: 'st-lat', role: 'Stacked Wordmark — vertical compositions, promotional (§12.7)',
      title: 'Noujoude', vb, defs: SEAL_DEFS_BLOCK, body,
      note: 'All-caps Cormorant tracked 300/1000 em, centred on the seal axis.',
    }));
  }

  // 2d — stacked Arabic
  {
    const nameW = ARA_STACK_W, k = nameW / ara.ink.w, nameH = ara.ink.h * k;
    const gap = 40;
    const W = Math.max(SEAL_D, nameW);
    const vb = [0, 0, W + PAD * 2, SEAL_D + gap + nameH + PAD * 2];
    const cx = PAD + W / 2;
    const body = `
    ${sealAt(box, cx, PAD + SEAL_D / 2, SEAL_D)}
    ${run(ara, cx - nameW / 2, PAD + SEAL_D + gap, { w: nameW }).xml}
`;
    write('noujoude-lockup-stacked-arabic.svg', file({
      name: 'st-ara', role: 'Stacked Wordmark — Arabic',
      title: AR_NAME, vb, defs: SEAL_DEFS_BLOCK, dir: 'rtl', body,
      note: 'The stacked form is centred, so it does not mirror — only the reading order changes.',
    }));
  }

  // ═════════════════════ 3 · BADGE · APP ICON · SMALL MARK ════════════════════
  // 3a — Burgundy Badge: the seal on a Deep Burgundy disc (Owner reference 1)
  {
    const D = 1024, r = D / 2;
    const body = `
    <circle cx="${r}" cy="${r}" r="${r}" fill="${ink('burgundy')}"/>
    <circle cx="${r}" cy="${r}" r="${r - 34}" fill="none" stroke="${ink('gold')}" stroke-width="3" opacity=".7"/>
    <circle cx="${r}" cy="${r}" r="${r - 46}" fill="none" stroke="${ink('gold')}" stroke-width="1.4" opacity=".45"/>
    ${sealAt(box, r, r, D - 196)}
`;
    write('noujoude-badge-burgundy.svg', file({
      name: 'bg-bur', role: 'Burgundy Badge — selected approved identity applications (§12.7)',
      title: 'Noujoude seal on Deep Burgundy', vb: [0, 0, D, D], defs: SEAL_DEFS_BLOCK, body,
      note: 'Language-neutral: the seal carries no text. Do not recolour the disc (§12.7).',
    }));
  }

  // 3b — App icon master
  {
    const D = 1024, rr = 228;
    const body = `
    <rect width="${D}" height="${D}" rx="${rr}" fill="${ink('burgundy')}"/>
    <rect x="18" y="18" width="${D - 36}" height="${D - 36}" rx="${rr - 18}" fill="none"
          stroke="${ink('gold')}" stroke-width="3" opacity=".5"/>
    ${sealAt(box, D / 2, D / 2, D * 0.66)}
`;
    write('noujoude-icon-app.svg', file({
      name: 'ic-app', role: 'Application icon master',
      title: 'Noujoude', vb: [0, 0, D, D], defs: SEAL_DEFS_BLOCK, body,
      note: 'Seal at 66% of the plate — inside the usual 80% icon safe area.',
    }));
  }

  // 3c — Small-size mark. NOT a shrunken seal: below ~48 px the wreath and the 176
  //      ring dots turn to mud and the letter’s 1.2%-wide hairlines vanish, so the
  //      small mark is drawn for that size with strokes that survive it.
  {
    const D = 64;
    // N as one polygon: 6-unit stems on a 26-tall box, the diagonal’s two edges parallel.
    // No serifs — at 16 px a serif is the first thing to go, and a floating sparkle just
    // reads as a printing artefact.
    const N = 'M17 19H23L41 39V19H47V45H41L23 25V45H17Z';
    const body = `
    <rect width="${D}" height="${D}" rx="14" fill="${ink('burgundy')}"/>
    <circle cx="32" cy="32" r="25.5" fill="none" stroke="${ink('gold')}" stroke-width="2.4" opacity=".85"/>
    <path d="${N}" fill="${ink('gold')}"/>
`;
    write('noujoude-mark-small.svg', file({
      name: 'mk-sm', role: 'Small-size mark — favicon, tab, loading identity, brand signature (§12.7)',
      title: 'Noujoude N', vb: [0, 0, D, D], body,
      note: 'Solid 6-unit stems, no wreath, no dotted ring. Use at 16–48 px; the seal takes over at '
          + '64 px and above. Never scale the seal below 64 px.',
    }));
  }

  // ═════════════════════════════════ 4 · WATERMARKS ═══════════════════════════
  // One colour, one opacity. The host may lower it; it must not raise it.
  const watermark = (j, fn, title, nameW, dir) => {
    const k = nameW / j.ink.w, nameH = j.ink.h * k;
    const gap = 34, D = SEAL_D * 1.4;
    const vb = [0, 0, Math.max(D, nameW) + PAD * 2, D + gap + nameH + PAD * 2];
    const cx = vb[2] / 2;
    const body = `
    <g color="${ink('ivory')}" opacity="0.18">
      ${sealAt(box, cx, PAD + D / 2, D, { mono: true })}
      ${run(j, cx - nameW / 2, PAD + D + gap, { w: nameW, fill: 'currentColor' }).xml}
    </g>
`;
    write(fn, file({
      name: fn.replace(/\.svg$/, '').replace(/[^a-z0-9]+/gi, '-'),
      role: 'Watermark — approved collection photographs and museum visual material (§12.7)',
      title, vb, defs: sealDefsFor(true), dir, body,
      note: 'Single ink, 0.18 opacity. Place it in a corner; it must not obscure the object or its '
          + 'documentary detail. Re-tint with the ndm-ivory or ndm-gold custom property.',
    }));
  };
  watermark(lat, 'noujoude-watermark-latin.svg', 'Noujoude watermark', 420, 'ltr');
  watermark(ara, 'noujoude-watermark-arabic.svg', `${AR_NAME} watermark`, 260, 'rtl');

  // ═════════════════════════════ 5 · MONO CHROMES ════════════════════════════
  // A single-ink set, painted with currentColor. This is the honest answer to two
  // problems at once:
  //   · the colour files carry var(--ndm-*, hex), and librsvg (so sharp, so every
  //     PNG here) IGNORES custom properties and paints the fallback hex. Verified,
  //     not assumed. currentColor, by contrast, is supported everywhere.
  //   · gold on ivory is 1.9:1 — unreadable. On a light ground the host sets
  //     `color`, and the mono file follows. The badge, the app icon and the small
  //     mark are excluded: they are plate-based marks whose ground is part of them.
  const MONO_SKIP = new Set(['noujoude-badge-burgundy.svg', 'noujoude-icon-app.svg',
    'noujoude-mark-small.svg', 'noujoude-watermark-latin.svg', 'noujoude-watermark-arabic.svg']);
  const toMono = (s) => s
    .replace(/var\(--ndm-[a-z0-9]+,#[0-9A-Fa-f]{6}\)/g, 'currentColor')
    .replace(/url\(#g(?:Wide|Letter|Leaf|Berry|Gem)\)/g, 'currentColor')
    .replace(/#FBEAE2|#F6DED2|#9C8058/g, 'currentColor')
    .replace(/<linearGradient[\s\S]*?<\/linearGradient>|<radialGradient[\s\S]*?<\/radialGradient>/g, '')
    .replace(/color="currentColor"/g, '')
    .replace(/opacity="0\.18"/g, '')
    .replace(/^<\?xml[^>]*\?>\s*<!--[\s\S]*?-->/, `<?xml version="1.0" encoding="UTF-8"?>
<!--
  GENERATED — do not edit.  brand/_tools/build.mjs writes this file.
      single ink · every paint is currentColor, so the host sets \`color\` and the mark follows
      use        · light grounds, foil, embossing, stamping, engraving, one-colour print
      colour     · on ivory set color:#351522 — gold on ivory is 1.9:1 and fails
-->`);
  fs.copyFileSync(SEAL_PATH, path.join(OUTDIR, 'noujoude-seal.svg'));
  written.push('noujoude-seal.svg');
  const MONO = [];
  fs.mkdirSync(path.join(OUTDIR, 'mono'), { recursive: true });
  for (const n of [...written]) {
    if (MONO_SKIP.has(n) || !n.endsWith('.svg')) continue;
    const out = path.join(OUTDIR, 'mono', n);
    fs.writeFileSync(out, toMono(fs.readFileSync(path.join(OUTDIR, n), 'utf8')));
    MONO.push('mono/' + n);
  }
  written.push(...MONO);

  // ═════════════════════════════ 6 · MANIFEST ════════════════════════════════

  const m = (j) => ({ text: j.text, direction: j.direction, ink: { w: +j.ink.w.toFixed(2), h: +j.ink.h.toFixed(2) },
    aspect: +(j.ink.w / j.ink.h).toFixed(2), glyphs: j.glyph_count, tracking: j.tracking });
  const manifest = {
    generatedBy: 'brand/_tools/build.mjs',
    generatedAt: new Date().toISOString().slice(0, 10),
    name: { latin: 'Noujoude', arabic: AR_NAME,
      arabicSource: 'Owner-supplied 2026-11-02 — docs/OWNER_INPUT_REGISTER.md OID-01 / OID-02' },
    tagline: { latin: EN_TAG, arabic: AR_TAG,
      status: 'DERIVED. The Arabic tagline is a build proposal, not an Owner fact; OID-02 is still open. '
            + 'It must not be published as approved copy.' },
    palette: T,
    sealInkBox: box,
    type: { latin: m(lat), latinCaps: m(latCaps), latinTagline: m(tagLat),
      arabicAmiri: m(ara), arabicTajawal: m(araTaj), arabicKashida: m(araKash), arabicTagline: m(tagAra) },
    assets: [
      { file: 'noujoude-wordmark-latin.svg', role: 'Primary Wordmark', script: 'Latin' },
      { file: 'noujoude-wordmark-latin-ornamented.svg', role: 'Primary Wordmark + laurel', script: 'Latin' },
      { file: 'noujoude-wordmark-arabic.svg', role: 'Primary Wordmark', script: 'Arabic', face: 'Amiri Bold' },
      { file: 'noujoude-wordmark-arabic-tajawal.svg', role: 'Primary Wordmark (alternate)', script: 'Arabic', face: 'Tajawal Bold' },
      { file: 'noujoude-wordmark-arabic-kashida.svg', role: 'Primary Wordmark (display variant)', script: 'Arabic', face: 'Amiri Bold + kashida' },
      { file: 'noujoude-lockup-horizontal-latin.svg', role: 'Primary lockup', script: 'Latin' },
      { file: 'noujoude-lockup-horizontal-arabic.svg', role: 'Primary lockup (mirrored)', script: 'Arabic' },
      { file: 'noujoude-lockup-stacked-latin.svg', role: 'Stacked Wordmark', script: 'Latin' },
      { file: 'noujoude-lockup-stacked-arabic.svg', role: 'Stacked Wordmark', script: 'Arabic' },
      { file: 'noujoude-badge-burgundy.svg', role: 'Burgundy Badge', script: 'none' },
      { file: 'noujoude-icon-app.svg', role: 'Application icon', script: 'none' },
      { file: 'noujoude-mark-small.svg', role: 'Small-size mark / favicon', script: 'none' },
      { file: 'noujoude-watermark-latin.svg', role: 'Watermark', script: 'Latin' },
      { file: 'noujoude-watermark-arabic.svg', role: 'Watermark', script: 'Arabic' },
      { file: 'noujoude-seal.svg', role: 'N Monogram / Seal', script: 'none',
        note: 'copy of brand/noujoude-monogram-seal.svg — edit the master, not this' },
    ],
    monoSet: {
      dir: 'brand/svg/mono/',
      files: MONO.map((n) => n.replace('mono/', '')),
      excludes: [...MONO_SKIP],
      note: 'Single ink, painted with currentColor. Use it wherever a CSS custom property cannot reach '
          + '(librsvg-based rasterisers ignore var()), and on any ground that is not dark.',
    },
    rules: {
      clearSpace: 'lockups and badges: 0.24 × seal ink diameter on every side. Wordmark alone: 1 × its own '
                + 'cap height. Small mark: 0.5 × the mark box. Clear space is NOT baked into any viewBox.',
      minimumSize: { smallMarkPx: 16, sealPx: 64, wordmarkLatinPxWidth: 132, wordmarkArabicPxWidth: 110,
        lockupHorizontalPxWidth: 260, lockupStackedPxWidth: 150, printWordmarkMm: 24 },
      neverStretch: 'uniform scale only — run() applies one k to x and y',
      neverLetterspaceArabic: true,
      shaping: 'HarfBuzz with the default feature set. isol/init/medi/fina are deliberately NOT requested: '
             + 'the Arabic shaper already selects the positional forms, and re-enabling those tags as user '
             + 'features runs the GSUB lookups a second time over the output glyphs, which un-joins them. '
             + 'Verified against Blink: نجود = 143.7/100em and 4 ink islands either way.',
      joinCheck: 'node brand/_tools/joincheck.mjs brand/svg/noujoude-wordmark-arabic.svg 1024  → 4 components',
      bilingualSizing: 'the Arabic name is sized by HEIGHT against the Latin name (×1.25), never by width — '
                     + 'Arabic ink is 1.30:1 against Latin 4.01:1, so matched widths give a 2× taller word.',
      neverRecreateTheSealFromText: 'the seal is drawn artwork; §12.7 forbids substituting type for it',
      backgrounds: ['noir #111014', 'midnight #1A151C', 'burgundy #351522', 'ivory #F3EBDD', 'paper #E5D8C3'],
      onLightGrounds: 'gold on ivory measures 1.9:1 — below any text threshold. On light grounds set '
                    + '--ndm-gold to burgundy #351522, or use the badge form on its own disc.',
    },
    licences: {
      'Cormorant Garamond': 'OFL 1.1 — brand/_tools/fonts/CormorantGaramond-OFL.txt',
      'Inter': 'OFL 1.1 — brand/_tools/fonts/Inter-OFL.txt',
      'Tajawal': 'OFL 1.1 — brand/_tools/fonts/Tajawal-OFL.txt',
      'Amiri': 'OFL 1.1 — brand/_tools/fonts/Amiri-OFL.txt',
      note: 'All four are SIL Open Font Licence 1.1. Outlines were drawn from them by HarfBuzz and shipped as '
          + 'paths, so no font file is redistributed with a mark and no licence text has to travel with one. '
          + 'The OFL does reserve the font NAMES — do not rename a face to "Noujoude".',
    },
  };
  fs.writeFileSync(path.join(OUTDIR, 'manifest.json'), JSON.stringify(manifest, null, 1) + '\n');
  written.push('manifest.json');

  console.log('seal ink box  ' + JSON.stringify(box));
  console.log(written.map((n) => '  + brand/svg/' + n).join('\n'));
  return manifest;
}

const manifest = await build();

if (PREVIEW) {
  const files = manifest.assets.map((a) => path.join(OUTDIR, a.file));
  execFileSync(process.execPath, [cd('brand/_tools/contact.mjs'), cd('brand/_tools/_t/sheet.jpg'),
    '#111014', '1600', '2', ...files], { stdio: 'inherit' });
}
