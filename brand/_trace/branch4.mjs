const R = Math.PI / 180;
const rad = a => (a > 62 ? 308 + (358 - 308) * (93.5 - a) / (93.5 - 62) : a < -25 ? 366 : 358);
const pt = (a, r) => [512 + r * Math.cos(a * R), 512 + r * Math.sin(a * R)];
const N = 24, a0 = 90, a1 = -40;
const L = [], S = [];
for (let i = 0; i < N; i++) {
  const a = a0 + (a1 - a0) * i / (N - 1);
  const r = rad(a);
  const [x, y] = pt(a, r);
  const T = [Math.sin(a * R), -Math.cos(a * R)];          // forward = decreasing a
  const O = [Math.cos(a * R), Math.sin(a * R)];            // outward
  const mk = (u, v) => Math.atan2(u * T[1] + v * O[1], u * T[0] + v * O[0]) / R;
  const taper = Math.min(1, (a < -18 ? 1 - (-18 - a) / 62 : 1), (a > 74 ? 1 - (a - 74) / 34 : 1));
  const k = i % 3;                                   // three-beat rhythm so leaves do not fan uniformly
  const spread = [0.8, 1.05, 0.62][k];               // outward splay
  const big = [0.97, 0.82, 1.02][k];
  L.push(`<use href="#leaf" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${mk(spread, 1).toFixed(1)}) scale(${(big * taper).toFixed(2)})"/>`);
  if (k !== 2) L.push(`<use href="#leaf" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${mk(.9, -[0.95, .8, 1][k]).toFixed(1)}) scale(${([0.62, .5, .58][k] * taper).toFixed(2)})"/>`);
  if (k === 1) S.push(`<use href="#sprig" transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${mk(.7, .9).toFixed(1)}) scale(${(0.92 * taper).toFixed(2)})"/>`);
}
// stem: arc r 358 from a=62 to a=-38, plus an inward sweep to the bottom tip
const [sx, sy] = pt(93.5, 308), [mx, my] = pt(62, 358), [ex, ey] = pt(-38, 366);
console.log(`STEM  M${sx.toFixed(1)} ${sy.toFixed(1)} Q${pt(78, 330).map(v => v.toFixed(1)).join(' ')} ${mx.toFixed(1)} ${my.toFixed(1)} A358 358 0 0 0 ${ex.toFixed(1)} ${ey.toFixed(1)}`);
console.log(L.join('\n'));
console.log('--');
console.log(S.join('\n'));
