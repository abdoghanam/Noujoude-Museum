// Source vs render occupancy silhouettes for one region. argv: x y w h [cols]
import sharp from 'sharp';
import fs from 'fs';
const [x0, y0, w, h, cols = 64] = process.argv.slice(2).map(Number);
const OP = 32;

async function img(p, flat) {
  const src = p.endsWith('.svg')
    ? Buffer.from(fs.readFileSync(p, 'utf8'))
    : p;
  let q = sharp(src, p.endsWith('.svg') ? { density: 300 } : undefined)
    .resize(1024, 1024).ensureAlpha();
  if (flat) q = q.flatten({ background: '#000000' });
  const { data, info } = await q.raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, c: info.channels };
}
function grid(I, test, OP) {
  const R = Math.max(6, Math.round(cols * h / w / 2)), sx = w / cols, sy = h / R;
  const out = [];
  for (let r = 0; r < R; r++) {
    let line = '';
    for (let c = 0; c < cols; c++) {
      let n = 0, tot = 0;
      for (let yy = 0; yy < Math.max(1, Math.floor(sy)); yy++)
        for (let xx = 0; xx < Math.max(1, Math.floor(sx)); xx++) {
          const px = Math.round(x0 + c * sx + xx), py = Math.round(y0 + r * sy + yy);
          if (!test(px, py)) { tot = -1; break; }
          const i = ((py - OP) * I.w + px) * I.c;
          tot++; if (I.d[i + 3] > 60) n++;
        }
      line += tot <= 0 ? ' ' : n === 0 ? '.' : n / tot > .7 ? '@' : n / tot > .35 ? 'O' : n / tot > .15 ? 'o' : ':';
    }
    out.push([Math.round(y0 + r * sy), line]);
  }
  return out;
}
const S = await img('brand/_trace/base.png'), Rd = await img('brand/noujoude-monogram-seal.svg');
const inRegion = (px, py) => px >= x0 && px < x0 + w && py >= y0 && py < y0 + h;
const gs = grid(S, inRegion, 32), gr = grid(Rd, inRegion, 0);
console.log(`   region x ${x0}…${x0 + w}  cols=${cols} step ${(w / cols).toFixed(1)}   LEFT=source  RIGHT=render`);
for (let i = 0; i < Math.max(gs.length, gr.length); i++)
  console.log(String(gs[i] ? gs[i][0] : gr[i][0]).padStart(4), (gs[i] ? gs[i][1] : '').padEnd(cols), '|', gr[i] ? gr[i][1] : '');
