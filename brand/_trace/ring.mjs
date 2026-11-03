// Radial ink profile: for each radius, the median alpha over all angles.
// argv: file(from png/svg) r0 r1 step
import sharp from 'sharp';
import fs from 'fs';

const file = process.argv[2] || 'brand/_trace/base.png';
const OP = file.endsWith('.svg') ? 0 : 32;   // svg y = png y + 32; render pixels are svg coords
const r0 = +(process.argv[3] || 265);
const r1 = +(process.argv[4] || 325);
const st = +(process.argv[5] || 1);

async function load(p) {
  if (p.endsWith('.svg')) {
    const { data, info } = await sharp(Buffer.from(fs.readFileSync(p, 'utf8')), { density: 300 })
      .resize(1024, 1024).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    return { d: data, w: info.width, c: info.channels };
  }
  const { data, info } = await sharp(p).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, c: info.channels };
}
const I = await load(file);
const A = (x, y) => (x < 0 || y < 0 || x >= 1024 || y >= 1024) ? 0 : I.d[((y * I.w + x) * I.c) + 3];

for (let r = r0; r <= r1; r += st) {
  const v = [];
  for (let a = 0; a < 360; a += 0.5) {
    const d = a * Math.PI / 180;
    v.push(A(Math.round(512 + r * Math.cos(d)), Math.round(512 + r * Math.sin(d) - OP)));
  }
  v.sort((p, q) => p - q);
  const med = v[v.length >> 1];
  const mean = Math.round(v.reduce((s, x) => s + x, 0) / v.length);
  const frac = (v.filter(x => x > 60).length / v.length).toFixed(2);
  console.log(`r ${String(r).padStart(3)}  med ${String(med).padStart(3)}  mean ${String(mean).padStart(3)}  on ${frac}  ${'#'.repeat(Math.round(med / 12))}`);
}
