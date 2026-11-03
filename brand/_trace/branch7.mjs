// Wreath branch generator v10 — ONE leaf per node, alternating long / short,
// with the leaf LENGTH following the radius the tip actually reaches in the source.
//   measured outer envelope (wr.mjs, right branch): tip r 398 @ a −22 · 413 @ −4 ·
//   419 @ 16 · 425 @ 35 · 429 @ 54 · 396 @ 68 → leaves grow from the bare top end to a
//   maximum around a 45…55 and shrink again toward the bottom tip.
// Arrangement evidence (s_R.jpg + o_R.jpg over svg 730 380 210×260, z_lf.png):
//   thin bare stem between nodes · every node sweeps ONE leaf forward, ~32° off the
//   tangent · tip angles come in pairs 5° apart, pairs 19° apart → one node every 9.5°.
// Ink budget (wm.mjs, crest + footer boxes removed): 31 100 gold px per branch.
const R = Math.PI / 180;
const rad = a => (a > 58 ? Math.max(308, 358 - 2.0 * (a - 58)) : 358);
const pt = (a, r) => [512 + r * Math.cos(a * R), 512 + r * Math.sin(a * R)];
const f = n => +n.toFixed(1);

// leaf scale envelope — 1.00 == the 100-long #leaf template
const KNOTS = [[-50, .55], [-22, .70], [0, .86], [16, 1.00], [35, 1.12], [50, 1.20], [62, 1.02], [74, .74], [86, .52]];
// K is a global gain: the annulus ink has to land on 31 100 px per branch (wm.mjs) and
// the envelope alone undershoots it, so the whole garland is scaled up together.
const K = +(process.env.K || 1.16);
const sc = a => {
  const at = k => K * KNOTS[k][1];
  if (a <= KNOTS[0][0]) return at(0);
  for (let i = 0; i < KNOTS.length - 1; i++) {
    const [x0, y0] = KNOTS[i], [x1, y1] = KNOTS[i + 1];
    if (a <= x1) return K * (y0 + (y1 - y0) * (Math.max(a, x0) - x0) / (x1 - x0));
  }
  return at(KNOTS.length - 1);
};

const N = 14, a0 = 84, a1 = -46;
const L = [], S = [];
for (let i = 0; i < N; i++) {
  const a = a0 + (a1 - a0) * i / (N - 1);
  const [x, y] = pt(a, rad(a));
  const T = [Math.sin(a * R), -Math.cos(a * R)];                 // forward = decreasing a
  const O = [Math.cos(a * R), Math.sin(a * R)];                  // outward
  const mk = (u, v) => Math.atan2(u * T[1] + v * O[1], u * T[0] + v * O[0]) / R;
  const put = (u, v, s, st) => {
    const ang = mk(u, v), d = ang * R;
    L.push(`<use href="#leaf" transform="translate(${f(x + st * Math.cos(d))} ${f(y + st * Math.sin(d))}) rotate(${f(ang)}) scale(${s.toFixed(2)})"/>`);
  };
  const s = sc(a);
  // one long leaf per node, plus a shorter "shoulder" leaf just behind it that
  // opens wider — this is what fills the annulus without becoming a herringbone.
  // The leaves run NEARLY ALONG the stem (≈20° off the tangent) and reach their
  // radius by being LONG, not by splaying.  s_R/s_L.jpg: the source leaves are almost
  // parallel to the stem; anything wider reads as a fan.
  put(1, .38, s, 6);
  put(1, .66, .55 * s, 3);
  if (i % 2 === 1) put(1, .16, .66 * s, 9);
  if (i % 4 === 1) S.push(`<use href="#sprig" transform="translate(${f(x)} ${f(y)}) rotate(${mk(.35, 1).toFixed(1)}) scale(${(0.90 * s).toFixed(2)})"/>`);
  if (i % 4 === 3) S.push(`<use href="#sprig" transform="translate(${f(x)} ${f(y)}) rotate(${mk(-.2, 1).toFixed(1)}) scale(${(0.72 * s).toFixed(2)})"/>`);
}
// stem: tip at a 84 r 308, sweeping out to r 358 by a 58, then a true arc to a −46
const stem = `M${f(pt(84, 308)[0])} ${f(pt(84, 308)[1])}Q566 828 600 828Q640 830 672 806` +
  `A358 358 0 0 0 ${f(pt(-46, 358)[0])} ${f(pt(-46, 358)[1])}`;
console.log('STEM  ' + stem);
console.log(L.join('\n'));
console.log('--');
console.log(S.join('\n'));
