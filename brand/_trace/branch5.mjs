// Wreath branch generator v5 — sparse outward-pointing laurel, bare at the bottom.
// Ink profile measured from source (px in band r 316…420 per 30° sector):
//   a 60…90 ≈ 700 (bare stem)   30…60 ≈ 4 600   0…30 ≈ 7 200
//   a -30…0 ≈ 9 600 (peak)      -60…-30 ≈ 8 100  -90…-60 ≈ 5 300 (crest overlap)
const R = Math.PI / 180;
const rad = a => (a > 62 ? 308 + (358 - 308) * (93.5 - a) / (93.5 - 62) : 358);
const pt = (a, r) => [512 + r * Math.cos(a * R), 512 + r * Math.sin(a * R)];

const N = 24, a0 = 52, a1 = -56;          // leaves stop well above the bottom tip
const bell = a => Math.exp(-(((a + 8) / 44) ** 2)) * (a < -46 ? 1 - (-46 - a) / 14 : 1);
const f = n => +n.toFixed(1);
const L = [], S = [];
for (let i = 0; i < N; i++) {
  const a = a0 + (a1 - a0) * i / (N - 1);
  const b = bell(a);
  const [x, y] = pt(a, rad(a));
  const T = [Math.sin(a * R), -Math.cos(a * R)];       // forward = decreasing a
  const O = [Math.cos(a * R), Math.sin(a * R)];        // outward
  const mk = (u, v) => Math.atan2(u * T[1] + v * O[1], u * T[0] + v * O[0]) / R;
  // three-beat irregularity so the garland never reads as a repeating sheaf
  const k = i % 3;
  const tilt = [0.62, 0.34, 0.80][k];                  // forward tilt off the radius
  const big = (0.48 + 0.44 * b) * [1, 0.93, 1.06][k];
  const stalk = [12, 18, 8][k];
  const put = (ang, sc, st) => {
    const d = ang * R, bx = x + st * Math.cos(d), by = y + st * Math.sin(d);
    L.push(`<use href="#leaf" transform="translate(${f(bx)} ${f(by)}) rotate(${f(ang)}) scale(${sc.toFixed(2)})"/>`);
  };
  put(mk(tilt, 1), big, stalk);
  if (b > 0.30) put(mk(-0.30 - 0.22 * k, 0.72), big * [0.66, 0.78, 0.58][k], 4);
  if (b > 0.72) put(mk(1.15, 0.6), big * 0.52, 20);
  if (k === 1 && b > 0.22) S.push(`<use href="#sprig" transform="translate(${f(x)} ${f(y)}) rotate(${mk(0.5, 1).toFixed(1)}) scale(${(0.86 * (0.7 + 0.3 * b)).toFixed(2)})"/>`);
}
const [sx, sy] = pt(93.5, 308), [mx, my] = pt(62, 358), [ex, ey] = pt(-56, 358);
console.log(`STEM  M${f(sx)} ${f(sy)}Q${pt(78, 330).map(f).join(' ')} ${f(mx)} ${f(my)}A358 358 0 0 0 ${f(ex)} ${f(ey)}`);
console.log(L.join('\n'));
console.log('--');
console.log(S.join('\n'));
