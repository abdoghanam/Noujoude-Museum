// ═══════════════════════════════════════════════════════════════════════════════
// brand/_tools/joincheck.mjs — proves Arabic joining from pixels, not from claims
// ───────────────────────────────────────────────────────────────────────────────
//     node brand/_tools/joincheck.mjs <svg|png> [width] [color]
//
// A shaper can report that it selected init/medi/fina forms and still lay the
// glyphs out so they never touch. This renders the file and counts ink islands,
// which is the only evidence that matters.
//
//   نجود in naskh = 4 islands: the joined ن+ج+و body, the detached د, two dots.
//   An unjoined nun splits the body and gives 5; nothing joined gives 6.
//
// Cross-checked against Blink/HarfBuzz rendering the same TTF as a base64
// @font-face: advance width 143.7/100em, 4 islands. Both wordmarks agree.
// ═══════════════════════════════════════════════════════════════════════════════
import sharp from 'sharp';
import { readFileSync } from 'fs';

const [file, wstr, color] = process.argv.slice(2);
const W = +(wstr || 1024);
let src = readFileSync(file, 'utf8');
if (color) src = src.replace(/<svg ([^>]*?)>/, (m, a) => `<svg ${a}${/\scolor=/.test(a) ? '' : ` color="${color}"`}>`);

const { data, info } = await sharp(
  /\.svg$/i.test(file) ? Buffer.from(src, 'utf8') : readFileSync(file),
  { density: 300 })
  .resize(W, null, { fit: 'inside' }).flatten({ background: '#000000' })
  .ensureAlpha().raw().toBuffer({ resolveWithObject: true });

const { width: w, height: h, channels: ch } = info;
const on = new Uint8Array(w * h);
for (let i = 0; i < w * h; i++) {
  const p = i * ch;
  on[i] = (data[p] * 0.299 + data[p + 1] * 0.587 + data[p + 2] * 0.114) > 40 ? 1 : 0;
}

const seen = new Int32Array(w * h).fill(-1);
const comps = [];
const stack = new Int32Array(w * h);
for (let s = 0; s < w * h; s++) {
  if (!on[s] || seen[s] !== -1) continue;
  const id = comps.length;
  let sp = 0, area = 0, x0 = w, y0 = h, x1 = 0, y1 = 0;
  stack[sp++] = s; seen[s] = id;
  while (sp) {
    const p = stack[--sp], x = p % w, y = (p / w) | 0;
    area++;
    if (x < x0) x0 = x; if (x > x1) x1 = x;
    if (y < y0) y0 = y; if (y > y1) y1 = y;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const q = ny * w + nx;
      if (on[q] && seen[q] === -1) { seen[q] = id; stack[sp++] = q; }
    }
  }
  comps.push({ area, x0, y0, x1, y1 });
}
comps.sort((a, b) => b.area - a.area);
const big = comps.filter((c) => c.area > (w * h) * 0.0004);
console.log(`${w}x${h}  ${comps.length} components, ${big.length} above the noise floor`);
for (const c of big) {
  console.log(`  area ${String(c.area).padStart(7)}  box ${c.x0},${c.y0} -> ${c.x1},${c.y1}  (${c.x1 - c.x0 + 1}x${c.y1 - c.y0 + 1})`);
}
