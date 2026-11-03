// Wreath branch generator v6 — profile fitted to the corrected radial/sector measurements.
// Source ink in band r 316…420 per 30° sector (both branches):
//   0…30 9465 · 30…60 8908 · 60…90 5499 · 90…120 5626 · 120…150 8891 · 150…180 9368
//   180…210 6736 · 210…240 3788 · 240…270 2544 · 270…300 2712 · 300…330 3762 · 330…360 6685
// → mass peaks just BELOW the horizontal, stays strong through the lower diagonals,
//   thins at the very bottom, and the branch ends at a ≈ -47 (env.mjs: no leaves above it).
const R = Math.PI / 180;
const rad = a => (a > 62 ? Math.max(310, 358 - 1.9 * (a - 62)) : 358);
const pt = (a, r) => [512 + r * Math.cos(a * R), 512 + r * Math.sin(a * R)];
const f = n => +n.toFixed(1);

const N = 26, a0 = 68, a1 = -45;   // env.mjs: below a ≈ 70 the branch is bare stem
// density knots = measured source ink per degree, normalised to the peak (a ≈ 15)
const KNOTS = [[-50, .36], [-15, .48], [15, 1], [45, .92], [62, .46], [70, .28]];
const dens = a => {
  for (let i = 0; i < KNOTS.length - 1; i++) {
    const [x0, y0] = KNOTS[i], [x1, y1] = KNOTS[i + 1];
    if (a <= x1) return y0 + (y1 - y0) * (Math.max(a, x0) - x0) / (x1 - x0);
  }
  return .22;
};
// leaf area ∝ scale², so scale follows √density
const bell = a => Math.sqrt(dens(a));
const L = [], S = [];
for (let i = 0; i < N; i++) {
  const a = a0 + (a1 - a0) * i / (N - 1);
  const b = bell(a);
  const [x, y] = pt(a, rad(a));
  const T = [Math.sin(a * R), -Math.cos(a * R)];       // forward = decreasing a
  const O = [Math.cos(a * R), Math.sin(a * R)];        // outward
  const mk = (u, v) => Math.atan2(u * T[1] + v * O[1], u * T[0] + v * O[0]) / R;
  const k = i % 3;
  // leaves sweep FORWARD along the stem (≈20° off the tangent), they do not radiate outward
  const tilt = [0.40, 0.26, 0.52][k];                   // outward splay off the tangent
  const big = (0.42 + 0.50 * b) * [1, 0.93, 1.06][k];
  const stalk = [9, 14, 5][k];
  const put = (ang, sc, st) => {
    if (sc < 0.28) return;
    const d = ang * R;
    L.push(`<use href="#leaf" transform="translate(${f(x + st * Math.cos(d))} ${f(y + st * Math.sin(d))}) rotate(${f(ang)}) scale(${sc.toFixed(2)})"/>`);
  };
  put(mk(1, tilt), big, stalk);
  if (b > 0.28 && a < 55) put(mk(0.95, -0.5 - 0.12 * k), big * [0.62, 0.74, 0.55][k], 4);
  if (b > 0.62) put(mk(1.1, 0.05), big * 0.5, 18);
  if (k === 1 && b > 0.20) S.push(`<use href="#sprig" transform="translate(${f(x)} ${f(y)}) rotate(${mk(0.55, 0.9).toFixed(1)}) scale(${(0.84 * (0.7 + 0.3 * b)).toFixed(2)})"/>`);
}
// stem: tip at a 88 r 312, sweeping out to r 358 by a 62, then a true arc up to a -45
const stem = 'M522.9 823.8Q558.5 833.2 599 835.8Q639.3 847.1 680.1 828.1' +
  `A358 358 0 0 0 ${f(pt(-45, 358)[0])} ${f(pt(-45, 358)[1])}`;
console.log('STEM  ' + stem);
console.log(L.join('\n'));
console.log('--');
console.log(S.join('\n'));
