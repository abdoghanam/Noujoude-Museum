// Scanline ink runs of the SVG render (pixel y == svg y). argv: list of svg y values.
import sharp from 'sharp';
import fs from 'fs';
const { data, info } = await sharp(Buffer.from(fs.readFileSync('brand/noujoude-monogram-seal.svg', 'utf8')), { density: 300 })
  .resize(1024, 1024).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, C = info.channels;
const A = (x, y) => data[(y * W + x) * C + 3];
for (const sy of process.argv.slice(2).map(Number)) {
  const y = Math.round(sy);
  const runs = [];
  let s = null;
  for (let x = 0; x < W; x++) {
    const on = A(x, y) > 60;
    if (on && s === null) s = x;
    if (!on && s !== null) { runs.push([s, x - 1, x - s]); s = null; }
  }
  if (s !== null) runs.push([s, W - 1, W - s]);
  console.log(`y=${sy}  ` + runs.map(r => `${r[0]}-${r[1]}(${r[2]})`).join(' '));
}
