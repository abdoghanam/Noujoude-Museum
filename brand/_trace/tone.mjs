// Quantitative tone + coverage comparison: source (base.png) vs current render.
// IMPORTANT: the two images do NOT share a y-origin.
//   base.png  : svg y = png y + 32   (1024 upscale of the 512 native asset)
//   the SVG   : pixel y = svg y      (rasterised straight to 1024)
// so every region predicate is built with the image's own offset.
import sharp from 'sharp';
import fs from 'fs';

const load = async (p, isSvg) => {
  const src = isSvg
    ? sharp(Buffer.from(fs.readFileSync(p, 'utf8')), { density: 300 }).resize(1024, 1024)
    : sharp(p);
  const { data, info } = await src.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, h: info.height, c: info.channels };
};
const px = (I, x, y) => {
  const i = (y * I.w + x) * I.c;
  return i < 0 || i >= I.d.length ? null : [I.d[i], I.d[i + 1], I.d[i + 2], I.d[i + 3]];
};
// mean colour + ink count of pixels with alpha > 40 inside a predicate region
function stats(I, test) {
  let n = 0, r = 0, g = 0, b = 0, lum = 0;
  for (let y = 0; y < I.h; y++) for (let x = 0; x < I.w; x++) {
    if (!test(x, y)) continue;
    const p = px(I, x, y);
    if (!p || p[3] < 40) continue;
    n++; r += p[0]; g += p[1]; b += p[2];
    lum += 0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2];
  }
  return n ? { n, mean: [Math.round(r / n), Math.round(g / n), Math.round(b / n)], lum: Math.round(lum / n) } : null;
}
const hex = c => '#' + c.map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();

const src = await load('brand/_trace/base.png', false);   // svg y = y + 32
const ren = await load('brand/noujoude-monogram-seal.svg', true); // svg y = y

// region definitions are given in SVG space; O is the per-image offset
const regions = {
  ring:   O => (x, y) => { const r = Math.hypot(x - 512, y + O - 512); return r > 274 && r < 312; },
  wreath: O => (x, y) => { const r = Math.hypot(x - 512, y + O - 512); return r > 316 && r < 420; },
  letter: O => (x, y) => Math.abs(x - 512) < 230 && Math.abs(y + O - 512) < 200,
  crest:  O => (x, y) => y + O < 255 && y + O > 90 && Math.abs(x - 512) < 190,
  foot:   O => (x, y) => y + O > 800 && Math.abs(x - 512) < 110,
};
for (const [name, mk] of Object.entries(regions)) {
  const a = stats(src, mk(32)), b = stats(ren, mk(0));
  console.log(name.padEnd(7),
    'src', a ? `${String(a.n).padStart(6)} lum ${String(a.lum).padStart(3)} ${hex(a.mean)}` : '   -   ',
    '| rend', b ? `${String(b.n).padStart(6)} lum ${String(b.lum).padStart(3)} ${hex(b.mean)}  ${((b.n / a.n - 1) * 100).toFixed(0)}%` : '   -   ');
}

function sectors(I, O) {
  const out = Array(12).fill(0);
  for (let y = 0; y < I.h; y++) for (let x = 0; x < I.w; x++) {
    const dx = x - 512, dy = y + O - 512, r = Math.hypot(dx, dy);
    if (r < 316 || r > 420) continue;
    const p = px(I, x, y);
    if (!p || p[3] < 40) continue;
    out[Math.floor(((Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360) / 30) % 12]++;
  }
  return out;
}
const cs = sectors(src, 32), cr = sectors(ren, 0);
console.log('\nsector  src   rend   ratio');
cs.forEach((v, i) => console.log(
  `${String(i * 30).padStart(3)}-${String(i * 30 + 30).padEnd(4)}`,
  String(v).padStart(5), String(cr[i]).padStart(5), (cr[i] / v).toFixed(2).padStart(7)));
