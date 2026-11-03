// Builds the diagonal strand path from a measured (y, centre, half-width) table.
// Catmull-Rom -> cubic, closed lens. argv: [gap] prints strand A + its rotate(180) copy check.
const T = [
  [368, 425.0, 7.0],   // tucked under the thorn / stem junction
  [396, 444.0, 6.5],
  [420, 460.5, 6.3],
  [460, 483.5, 6.2],
  [480, 494.0, 6.8],
  [500, 506.0, 9.5],   // hidden behind the fleur — the pinch where widths trade
  [522, 519.0, 10.2],
  [560, 537.5, 9.7],
  [600, 558.5, 9.5],
  [630, 576.0, 9.6],
  [650, 592.0, 10.2],
  [658, 600.0, 10.0],  // merges into the rotated thorn at the foot
];
const n = v => (Math.round(v * 10) / 10).toString();
const L = T.map(([y, c, h]) => [c - h, y]);
const R = T.map(([y, c, h]) => [c + h, y]);

function cr(pts) {                 // open Catmull-Rom chain -> cubic segments
  let d = `M${n(pts[0][0])} ${n(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += `C${n(p1[0] + (p2[0] - p0[0]) / 6)} ${n(p1[1] + (p2[1] - p0[1]) / 6)} `
       + `${n(p2[0] - (p3[0] - p1[0]) / 6)} ${n(p2[1] - (p3[1] - p1[1]) / 6)} `
       + `${n(p2[0])} ${n(p2[1])}`;
  }
  return d;
}
const back = cr(R.slice().reverse()).replace('M', 'L');
const path = cr(L) + back + 'Z';
console.log(path);
console.log('--- vein (centre line) ---');
console.log(cr(T.map(([y, c]) => [c, y])));

// sanity: compare the rotate(180 533 518) image of the table with the measured right strand
const M = { 396: 480.5, 420: 495, 460: 517, 480: 527, 560: 570.5, 600: 593, 620: 606 };
for (const [y, c] of T) {
  const iy = 1036 - y, ix = 1066 - c;
  let best = null;
  for (const k in M) if (Math.abs(k - iy) < 12 && (!best || Math.abs(k - iy) < Math.abs(best - iy))) best = k;
  if (best) console.log(`  img(${n(c)},${y}) -> (${n(ix)},${iy})   measured ${M[best]} @${best}  Δ${n(ix - M[best])}`);
}
