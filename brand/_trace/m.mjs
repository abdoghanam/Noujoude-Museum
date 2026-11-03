import sharp from 'sharp';
const { data, info } = await sharp('brand/_trace/base.png').raw().toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height;
const A = (x, y) => data[(y * W + x) * info.channels + 3];
// svg coords: x same, y = raw + 32
const ys = process.argv.slice(2).map(Number);
for (const sy of ys) {
  const y = Math.round(sy - 32);
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
