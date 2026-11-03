// Connected components of gold in the wreath band → the real leaf inventory.
// usage: node brand/_trace/cc.mjs [side] [aLo] [aHi]  (side 1=right, -1=left)
import sharp from 'sharp';
const { data, info } = await sharp('brand/_trace/base.png').ensureAlpha().raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, CH = info.channels;
const side = +(process.argv[2] || 1);
const aLo = +(process.argv[3] || -52), aHi = +(process.argv[4] || 95);
const R0 = +(process.argv[5] || 313), R1 = +(process.argv[6] || 432);
const inBand = (x, y) => {
  const dx = (x - 512) * side, dy = y - 512;
  const r = Math.hypot(dx, dy);
  if (r < R0 || r > R1) return false;
  const a = Math.atan2(dy, dx) * 180 / Math.PI;
  return a >= aLo && a <= aHi;
};
const gold = (x, y) => {
  const i = (y * W + x) * CH;
  if (data[i + 3] < 90) return false;
  return data[i] > data[i + 2] + 12;            // gold: red channel well above blue
};
const seen = new Uint8Array(W * H);
const comps = [];
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (!inBand(x, y) || !gold(x, y) || seen[y * W + x]) continue;
  const stack = [[x, y]]; const px = [];
  seen[y * W + x] = 1;
  while (stack.length) {
    const [cx, cy] = stack.pop(); px.push([cx, cy]);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const nx = cx + dx, ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const k = ny * W + nx; if (seen[k]) continue;
      if (!inBand(nx, ny) || !gold(nx, ny)) { seen[k] = 1; continue; }
      seen[k] = 1; stack.push([nx, ny]);
    }
  }
  if (px.length < 60) continue;
  const n = px.length;
  const mx = px.reduce((s, p) => s + p[0], 0) / n, my = px.reduce((s, p) => s + p[1], 0) / n;
  let a = 0, b = 0, c = 0;
  for (const [X, Y] of px) { const dx = X - mx, dy = Y - my; a += dx * dx; b += dx * dy; c += dy * dy; }
  a /= n; b /= n; c /= n;
  const t = Math.atan2(2 * b, a - c) / 2;
  const ca = Math.cos(t), sa = Math.sin(t);
  const u = px.map(p => (p[0] - mx) * ca + (p[1] - my) * sa);
  const v = px.map(p => -(p[0] - mx) * sa + (p[1] - my) * ca);
  const q = (arr, k) => { const s = [...arr].sort((p, q) => p - q); return s[Math.round(k * (s.length - 1))]; };
  const ux = q(u, .98) - q(u, .02), wy = (q(v, .98) - q(v, .02)) / 2;
  const dxm = (mx - 512) * side, dym = my - 512;
  comps.push({ area: n, cx: mx, cy: my + 32, ang: Math.atan2(dym, dxm) * 180 / Math.PI,
    rad: Math.hypot(dxm, dym), L: ux, Wd: wy, rot: t * 180 / Math.PI });
}
comps.sort((p, q) => p.ang - q.ang);
console.log('angle    r     area   len  wid  ratio  axisrot   centroid');
for (const k of comps) console.log(
  `${k.ang.toFixed(1).padStart(6)} ${k.rad.toFixed(0).padStart(5)} ${String(k.area).padStart(6)} ` +
  `${k.L.toFixed(0).padStart(5)} ${k.Wd.toFixed(0).padStart(4)} ${(k.L / k.Wd).toFixed(1).padStart(6)} ` +
  `${k.rot.toFixed(0).padStart(7)}   ${k.cx.toFixed(0)} ${k.cy.toFixed(0)}`);
console.log(`count=${comps.length} totalArea=${comps.reduce((s, k) => s + k.area, 0)}`);
