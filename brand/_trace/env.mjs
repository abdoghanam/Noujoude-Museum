// Radial envelope: for each angle, the ink runs beyond r 300. Reveals stem radius + leaf reach.
import sharp from 'sharp';
const OP = 32;
const { data, info } = await sharp('brand/_trace/base.png').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width, C = info.channels;
const A = (x, y) => (y < 0 || y >= info.height || x < 0 || x >= W) ? 0 : data[((y | 0) * W + (x | 0)) * C + 3];
const from = +(process.argv[2] ?? -95), to = +(process.argv[3] ?? 95), step = +(process.argv[4] ?? 3);
for (let a = from; a <= to; a += step) {
  const r0 = a * Math.PI / 180;
  const dx = Math.cos(r0), dy = Math.sin(r0);
  const runs = [];
  let s = -1;
  for (let r = 300; r < 470; r += 1) {
    const hit = A(512 + r * dx, 512 + r * dy - OP) > 60;
    if (hit && s < 0) s = r;
    if (!hit && s >= 0) { if (r - s >= 3) runs.push(`${s}-${r}`); s = -1; }
  }
  if (s >= 0) runs.push(`${s}-end`);
  console.log(String(a).padStart(4), runs.join(' ').padEnd(46), runs.length);
}
