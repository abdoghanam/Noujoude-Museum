// Leaf metrics: PCA of gold pixels inside a box (svg coords) → length, width, axis angle.
// usage: node brand/_trace/leaf.mjs x y w h
import sharp from 'sharp';
const { data, info } = await sharp('brand/_trace/base.png').ensureAlpha().raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width, CH = info.channels;
const A = (x, y) => (x < 0 || y < 0 || x >= W || y >= info.height ? 0 : data[(y * W + x) * CH + 3]);
const RGB = (x, y) => { const i = (y * W + x) * CH; return [data[i], data[i + 1], data[i + 2]]; };
const [x0, y0, bw, bh] = process.argv.slice(2).map(Number);
const pts = [];
for (let y = y0 - 32; y < y0 - 32 + bh; y++) for (let x = x0 - 32 * 0; x < x0 + bw; x++) {
  if (A(x, y) < 90) continue;
  const [r, g, b] = RGB(x, y);
  if (r > b + 18 || r < b - 18) { if (r > b + 18) pts.push([x, y]); }   // gold only
  else pts.push([x, y]);
}
if (pts.length < 40) { console.log('too few', pts.length); process.exit(0); }
const mx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
const my = pts.reduce((s, p) => s + p[1], 0) / pts.length;
let a = 0, b2 = 0, c = 0;
for (const [px, py] of pts) { const dx = px - mx, dy = py - my; a += dx * dx; b2 += dx * dy; c += dy * dy; }
const n = pts.length; a /= n; b2 /= n; c /= n;
const t = Math.atan2(2 * b2, a - c) / 2;                       // principal axis angle
const l1 = (a + c) / 2 + Math.hypot(b2, (a - c) / 2), l2 = (a + c) / 2 - Math.hypot(b2, (a - c) / 2);
const ca = Math.cos(t), sa = Math.sin(t);
const u = pts.map(p => (p[0] - mx) * ca + (p[1] - my) * sa);
const v = pts.map(p => -(p[0] - mx) * sa + (p[1] - my) * ca);
const q = (arr, k) => { const s = [...arr].sort((p, q) => p - q); return s[Math.floor(k * (s.length - 1))]; };
const len = q(u, .99) - q(u, .01);
const wid = q(v.map(Math.abs), .95) * 2;
console.log(`n=${n} centroid=(${mx.toFixed(1)} ${my.toFixed(1)}) axis=${(t * 180 / Math.PI).toFixed(1)}deg` +
  ` length=${len.toFixed(0)} width=${wid.toFixed(0)} ratio=${(len / wid).toFixed(1)}` +
  ` u=${q(u, .01).toFixed(0)}..${q(u, .99).toFixed(0)} v=${q(v, .01).toFixed(0)}..${q(v, .99).toFixed(0)}`);
