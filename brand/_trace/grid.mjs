// Occupancy silhouette of a source region. argv: x y w h cols
import sharp from 'sharp';
const [x0, y0, w, h, cols = '60'] = process.argv.slice(2).map(Number);
const OP = 32;
const { data, info } = await sharp('brand/_trace/base.png').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const C = +cols, R = Math.max(8, Math.round(C * h / w / 2));
const sx = w / C, sy = h / R;
for (let r = 0; r < R; r++) {
  let line = '';
  for (let c = 0; c < C; c++) {
    let n = 0, tot = 0;
    for (let yy = 0; yy < Math.max(1, Math.floor(sy)); yy++)
      for (let xx = 0; xx < Math.max(1, Math.floor(sx)); xx++) {
        const i = (((y0 - OP + r * sy + yy) | 0) * info.width + ((x0 + c * sx + xx) | 0)) * info.channels;
        tot++; if (data[i + 3] > 60) n++;
      }
    line += n === 0 ? '.' : n / tot > .7 ? '@' : n / tot > .35 ? 'O' : n / tot > .15 ? 'o' : ':';
  }
  console.log(String(Math.round(y0 + r * sy)).padStart(4) + ' ' + line);
}
console.log('     ' + `x from ${x0} to ${+x0 + w} · cols=${C} step ${(w / C).toFixed(1)}`);
