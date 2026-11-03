// ═══════════════════════════════════════════════════════════════════════════════
// brand/_tools/export.mjs — raster exports for the Noujoude identity system
// ───────────────────────────────────────────────────────────────────────────────
//     node brand/_tools/export.mjs            # write brand/png/**
//     node brand/_tools/export.mjs --check    # also write the legibility contact sheets
//
// Reads brand/svg/ (generated — run brand/_tools/build.mjs first) and writes the
// PNG matrix: favicons, app icons, wordmarks at 1x/2x, lockups, badges, og card.
//
// Two things this file exists to prove rather than assume:
//   · librsvg ignores CSS custom properties, so the colour SVGs rasterise to their
//     hex fallbacks. Verified. Light-ground exports therefore come from the mono
//     set with an explicit `color` attribute, which librsvg does honour.
//   · gold on ivory is 1.9:1. Any export whose ground is ivory or paper is built
//     from mono/burgundy ink, never from the gold artwork.
// ═══════════════════════════════════════════════════════════════════════════════
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '../..');
const cd = (p) => path.join(ROOT, p).split('\\').join('/');
const SVG = cd('brand/svg');
const PNG = cd('brand/png');

const HEX = {
  transparent: null, noir: '#111014', midnight: '#1A151C', burgundy: '#351522',
  ivory: '#F3EBDD', paper: '#E5D8C3', wood: '#30241F',
};
// ink used when a mark is placed on a light ground (gold fails there)
const DARK_INK = '#351522';

const load = (rel, color) => {
  let s = fs.readFileSync(path.join(SVG, rel), 'utf8');
  if (color) s = s.replace(/<svg ([^>]*?)>/, (m, a) => `<svg ${a}${/\scolor=/.test(a) ? '' : ` color="${color}"`}>`);
  return Buffer.from(s, 'utf8');
};
/** Render at `w` px wide (height follows the viewBox ratio), on a ground. */
async function render(rel, w, bg, color) {
  let img = sharp(load(rel, color), { density: 300 }).resize(Math.round(w), null, { fit: 'inside' });
  if (bg) img = img.flatten({ background: bg });
  return img.png().toBuffer();
}
/** Render onto a fixed canvas, centred. */
async function onCanvas(rel, W, H, bg, maxW, maxH, color) {
  const buf = await render(rel, maxW, null, color);
  const m = await sharp(buf).metadata();
  const k = Math.min(1, maxH / m.height);
  const w = Math.round(m.width * k), h = Math.round(m.height * k);
  const flat = await sharp(buf).resize(w, h).ensureAlpha().png().toBuffer();
  return sharp({ create: { width: W, height: H, channels: 4, background: bg ?? '#00000000' } })
    .composite([{ input: flat, left: Math.round((W - w) / 2), top: Math.round((H - h) / 2) }])
    .png().toBuffer();
}

const written = [];
const extra = [];
const manifest = [];
// `src` is the SVG this file was rasterised from, `ground` the flattened background,
// `ink` the colour attribute when a mono cut is used. Recorded at the moment of making
// because brand/_tools/inventory.mjs reads it instead of re-deriving provenance from the
// filename — a name-based guess can drift from this table and still look correct.
async function emit(dir, name, buf, src, ground, ink) {
  fs.mkdirSync(path.join(PNG, dir), { recursive: true });
  await sharp(buf).toFile(path.join(PNG, dir, name));
  const m = await sharp(buf).metadata();
  manifest.push({ file: `${dir}/${name}`, src, ground, ink: ink ?? null,
    width: m.width, height: m.height, bytes: buf.length });
  written.push(`${dir}/${name}  ${m.width}×${m.height}  ${(buf.length / 1024).toFixed(1)} KB`);
}

// ── the matrix ────────────────────────────────────────────────────────────────
const MARK = 'noujoude-mark-small.svg';
const SEAL = 'noujoude-seal.svg';
const BADGE = 'noujoude-badge-burgundy.svg';
const ICON = 'noujoude-icon-app.svg';
const STACK_LAT = 'noujoude-lockup-stacked-latin.svg';
const STACK_ARA = 'noujoude-lockup-stacked-arabic.svg';
const H_LAT = 'noujoude-lockup-horizontal-latin.svg';
const H_ARA = 'noujoude-lockup-horizontal-arabic.svg';
const W_LAT = 'noujoude-wordmark-latin.svg';
const W_ARA = 'noujoude-wordmark-arabic.svg';
const W_LAT_O = 'noujoude-wordmark-latin-ornamented.svg';
const MONO = (n) => 'mono/' + n;

const JOBS = [
  // marks that carry their own plate: transparent ground, no re-ink
  { src: MARK, dir: 'favicon', name: (w) => `favicon-${w}.png`, sizes: [16, 32, 48], bg: 'transparent' },
  { src: MARK, dir: 'app-icon', name: (w) => `apple-touch-${w}.png`, sizes: [180], bg: 'transparent' },
  { src: ICON, dir: 'app-icon', name: (w) => `icon-${w}.png`, sizes: [1024, 512, 384, 192, 167, 152, 120, 96, 76, 64], bg: 'transparent' },
  { src: BADGE, dir: 'badge', name: (w) => `badge-${w}.png`, sizes: [1024, 512, 256], bg: 'transparent' },

  // the seal is transparent artwork: it needs a ground, and on light grounds it
  // must be the mono cut in burgundy ink
  { src: SEAL, dir: 'seal', name: (w, bg) => `seal-${w}-${bg}.png`, sizes: [1024, 512, 256, 128], bg: ['noir', 'midnight', 'burgundy'] },
  { src: MONO(SEAL), dir: 'seal', name: (w, bg) => `seal-${w}-${bg}.png`, sizes: [1024, 512, 256, 128], bg: ['ivory', 'paper'], color: DARK_INK },

  // wordmarks and lockups — dark grounds get the colour artwork
  { src: W_LAT, dir: 'wordmark', name: (w, bg) => `latin-${w}-${bg}.png`, sizes: [264, 528, 1056], bg: ['noir', 'burgundy'] },
  { src: W_ARA, dir: 'wordmark', name: (w, bg) => `arabic-${w}-${bg}.png`, sizes: [220, 440, 880], bg: ['noir', 'burgundy'] },
  { src: W_LAT_O, dir: 'wordmark', name: (w, bg) => `latin-ornamented-${w}-${bg}.png`, sizes: [264, 528], bg: ['noir'] },
  { src: MONO(W_LAT), dir: 'wordmark', name: (w, bg) => `latin-${w}-${bg}.png`, sizes: [264, 528, 1056], bg: ['ivory', 'paper'], color: DARK_INK },
  { src: MONO(W_ARA), dir: 'wordmark', name: (w, bg) => `arabic-${w}-${bg}.png`, sizes: [220, 440, 880], bg: ['ivory', 'paper'], color: DARK_INK },

  { src: H_LAT, dir: 'lockup', name: (w, bg) => `horizontal-latin-${w}-${bg}.png`, sizes: [320, 640, 1280], bg: ['noir', 'burgundy'] },
  { src: H_ARA, dir: 'lockup', name: (w, bg) => `horizontal-arabic-${w}-${bg}.png`, sizes: [320, 640, 1280], bg: ['noir', 'burgundy'] },
  { src: STACK_LAT, dir: 'lockup', name: (w, bg) => `stacked-latin-${w}-${bg}.png`, sizes: [240, 480, 960], bg: ['noir'] },
  { src: STACK_ARA, dir: 'lockup', name: (w, bg) => `stacked-arabic-${w}-${bg}.png`, sizes: [240, 480, 960], bg: ['noir'] },
  { src: MONO(H_LAT), dir: 'lockup', name: (w, bg) => `horizontal-latin-${w}-${bg}.png`, sizes: [320, 640], bg: ['ivory'], color: DARK_INK },
  { src: MONO(H_ARA), dir: 'lockup', name: (w, bg) => `horizontal-arabic-${w}-${bg}.png`, sizes: [320, 640], bg: ['ivory'], color: DARK_INK },
];

async function main() {
  for (const job of JOBS) {
    const grounds = Array.isArray(job.bg) ? job.bg : [job.bg];
    for (const w of job.sizes) {
      for (const bg of grounds) {
        const buf = await render(job.src, w, HEX[bg], job.color);
        await emit(job.dir, job.name(w, bg), buf, job.src, bg, job.color);
      }
    }
  }

  // ── social ────────────────────────────────────────────────────────────────
  await emit('social', 'og-1200x630.png',
    await onCanvas(STACK_LAT, 1200, 630, '#111014', 300, 430), STACK_LAT, 'noir');
  await emit('social', 'og-1200x630-arabic.png',
    await onCanvas(STACK_ARA, 1200, 630, '#111014', 300, 430), STACK_ARA, 'noir');
  await emit('social', 'square-1024.png',
    await onCanvas(BADGE, 1024, 1024, null, 1024, 1024), BADGE, 'transparent');

  // ── the legibility check ────────────────────────────────────────────────────
  // Sizes are not a preference: below these the artwork stops being readable, and
  // the only way to know where "below" is is to look at it.
  if (process.argv.includes('--check')) {
    const strip = [];
    for (const w of [16, 24, 32, 48, 64, 96]) {
      strip.push(await render(MARK, w, null));
    }
    for (const w of [64, 96, 128, 192, 256]) {
      strip.push(await render(SEAL, w, '#111014'));
    }
    const metas = [];
    for (const b of strip) metas.push(await sharp(b).metadata());
    const H = 300, pad = 24;
    const W = metas.reduce((a, m) => a + m.width, 0) + pad * (strip.length + 1);
    const comp = [];
    let x = pad;
    for (let i = 0; i < strip.length; i++) {
      comp.push({ input: strip[i], left: x, top: Math.round((H - metas[i].height) / 2) });
      x += metas[i].width + pad;
    }
    await sharp({ create: { width: W, height: H, channels: 3, background: '#111014' } })
      .composite(comp).jpeg({ quality: 92 }).toFile(cd('brand/_tools/_t/sizes.jpg'));
    extra.push(`_tools/_t/sizes.jpg  ${W}×${H}  small-size strip (mark 16→96, seal 64→256)`);

    // watermark over a real photograph, because that is the only use it has
    const photo = cd('Noujoude.photo/archive_chamber.webp');
    if (fs.existsSync(photo)) {
      const wm = await render('noujoude-watermark-latin.svg', 420, null);
      const base = await sharp(photo).resize(1200, 800, { fit: 'cover' }).png().toBuffer();
      const m = await sharp(wm).metadata();
      await sharp(base).composite([{ input: wm, left: 1200 - m.width - 60, top: 800 - m.height - 40 }])
        .jpeg({ quality: 90 }).toFile(cd('brand/_tools/_t/wm-photo.jpg'));
      extra.push('_tools/_t/wm-photo.jpg  1200×800  watermark over archive_chamber');
    }
  }

  fs.writeFileSync(cd('brand/_tools/export-manifest.json'),
    JSON.stringify({ generatedBy: 'brand/_tools/export.mjs', count: manifest.length, assets: manifest }, null, 1) + '\n');
  extra.push('_tools/export-manifest.json  provenance for every PNG above');

  console.log(written.map((n) => '  + brand/png/' + n).join('\n'));
  console.log(extra.map((n) => '  + brand/' + n).join('\n'));
  const total = written.length + extra.length;
  console.log(`\n${total} files`);
}
await main();
