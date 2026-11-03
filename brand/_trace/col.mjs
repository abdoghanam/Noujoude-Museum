// Colour-classified occupancy grid of the SOURCE: R = rose/pink, o = gold, ' ' = empty.
// argv: x y w h [cols]   (svg coords; png y = svg y - 32)
import sharp from 'sharp';
const [x0, y0, w, h, cols = 48] = process.argv.slice(2).map(Number);
const OP = 32;
const { data: d, info } = await sharp('brand/_trace/base.png')
  .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const C = info.channels, W = info.width;
const px = (x, y) => { const i = ((y - OP) * W + x) * C; return [d[i], d[i + 1], d[i + 2], d[i + 3]]; };
const R = Math.max(6, Math.round(cols * h / w / 2)), sx = w / cols, sy = h / R;
for (let r = 0; r < R; r++) {
  let line = '';
  for (let c = 0; c < cols; c++) {
    const [rr, gg, bb, aa] = px(Math.round(x0 + c * sx), Math.round(y0 + r * sy));
    line += aa < 70 ? ' ' : (rr - gg) > 30 && (gg - bb) < 26 ? 'R' : (rr - gg) > 14 ? 'o' : '.';
  }
  console.log(String(y0 + r * sy).padStart(4), line);
}
