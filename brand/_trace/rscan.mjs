import sharp from 'sharp';
const { data, info } = await sharp('brand/_trace/base.png').raw().toBuffer({ resolveWithObject: true });
const W = info.width, CH = info.channels;
const A = (x, y) => data[(y * W + x) * CH + 3] > 60;
for (const deg of [0, -20, -40, -60, -80, 20, 40, 60]) {
  const a = deg * Math.PI / 180;
  const runs = []; let s = null;
  for (let r = 300; r < 450; r++) {
    const x = Math.round(512 + r * Math.cos(a)), y = Math.round(480 + r * Math.sin(a));
    const on = x >= 0 && x < W && y >= 0 && y < info.height && A(x, y);
    if (on && s === null) s = r;
    if (!on && s !== null) { runs.push(`${s}-${r - 1}`); s = null; }
  }
  if (s !== null) runs.push(`${s}-449`);
  console.log(`a=${deg}\t` + runs.join(' '));
}
