// Stack a list of SVG files into one contact sheet on a ground, for eyeballing.
// usage: node brand/_tools/contact.mjs out.jpg bg [width] [cols] [color=#HEX] file1.svg file2.svg ...
// cols defaults to 1 (a single row); with cols > 1 the tiles flow into a grid.
// color= sets the root `color` attribute — needed to see the mono set in an ink,
// because those files paint everything currentColor and librsvg honours that.
import sharp from 'sharp';
import { readFileSync } from 'fs';
let [out, bg, ...toks] = process.argv.slice(2);
let ink = null;
const files = [];
for (const t of toks) {
  if (/^color=/i.test(t)) ink = t.slice(t.indexOf('=') + 1);
  else files.push(t);
}
toks = files;
// Leading numeric tokens are [width] [cols]; everything after them is the file list.
const nums = [];
while (toks.length && /^-?[\d.]+$/.test(toks[0])) nums.push(+toks.shift());
const W = nums[0] ?? 2000;
const COLS = Math.min(toks.length, nums[1] ?? 1);
const pad = 40;
const cell = Math.round((W - pad * (COLS + 1)) / COLS);
const tiles = [];
for (const f of toks) {
  let src = readFileSync(f, 'utf8');
  if (ink) src = src.replace(/<svg ([^>]*?)>/, (m, a) => `<svg ${a}${/\scolor=/.test(a) ? '' : ` color="${ink}"`}>`);
  const buf = await sharp(Buffer.from(src, 'utf8'), { density: 300 })
    .flatten({ background: bg })
    .resize(cell, null, { fit: 'inside' })
    .png().toBuffer();
  tiles.push(buf);
}
const rows = [];
for (let i = 0; i < tiles.length; i += COLS) rows.push(tiles.slice(i, i + COLS));
const rowH = [];
for (const r of rows) {
  const hs = [];
  for (const t of r) hs.push((await sharp(t).metadata()).height);
  rowH.push(Math.max(...hs));
}
const H = rowH.reduce((a, b) => a + b, 0) + pad * (rows.length + 1);
let y = pad;
const comp = [];
for (let ri = 0; ri < rows.length; ri++) {
  for (let ci = 0; ci < rows[ri].length; ci++) {
    const m = await sharp(rows[ri][ci]).metadata();
    // centre each tile in its own column so rows read as a grid, not a ragged strip
    const cx = pad + ci * (cell + pad) + Math.round((cell - m.width) / 2);
    comp.push({ input: rows[ri][ci], left: cx, top: y + Math.round((rowH[ri] - m.height) / 2) });
  }
  y += rowH[ri] + pad;
}
await sharp({ create: { width: W, height: H, channels: 3, background: bg } })
  .composite(comp).jpeg({ quality: 90 }).toFile(out);
console.log(out, W + 'x' + H, tiles.length + ' tiles in ' + rows.length + ' rows');
