// Wreath geometry probe: cluster source gold in the wreath band by ANGLE to find
// where leaves actually sit on the stem, and how far out their tips reach.
import sharp from 'sharp';
const { data, info } = await sharp('brand/_trace/base.png').ensureAlpha().raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width, CH = info.channels;
const OP = 32;                       // svg y = png y + OP  →  png y = svg y - OP
const A = (x, y) => (x < 0 || y < 0 || x >= W || y >= info.height ? 0 : data[(y * W + x) * CH + 3]);
const GOLD = (x, y) => {
  if (A(x, y) < 60) return false;
  const i = (y * W + x) * CH, r = data[i], g = data[i + 1], b = data[i + 2];
  return r > b + 18;                 // rose pixels are r≈b; gold is r>>b
};
const side = +(process.argv[2] || 1); // +1 right branch, -1 left
const lo = +(process.argv[3] || -50), hi = +(process.argv[4] || 92);
const step = +(process.argv[5] || 2);
for (let a = lo; a <= hi; a += step) {
  const out = [];
  for (let r = 313; r <= 430; r++) {
    const x = 512 + side * r * Math.cos(a * Math.PI / 180);
    const y = 512 + r * Math.sin(a * Math.PI / 180) - OP;
    out.push(GOLD(Math.round(x), Math.round(y)) ? '#' : (A(Math.round(x), Math.round(y)) > 40 ? '.' : ' '));
  }
  const s = out.join('');
  const first = s.indexOf('#'), last = s.lastIndexOf('#');
  console.log(String(a).padStart(4) + ' ' + s +
    (first < 0 ? '   —' : `   in ${313 + first} out ${313 + last} span ${last - first}`));
}
