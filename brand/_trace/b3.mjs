import sharp from 'sharp';
const { data, info } = await sharp('brand/_trace/base.png').raw().toBuffer({ resolveWithObject: true });
const W = info.width, CH = info.channels;
const A = (x, y) => data[(y * W + x) * CH + 3];
const sy = y => y - 32;                       // svg -> raw
const box = (x0, y0, x1, y1) => {             // svg coords
  let minX = 1e9, maxX = -1, minY = 1e9, maxY = -1, n = 0;
  for (let y = sy(y0); y <= sy(y1); y++) for (let x = x0; x <= x1; x++)
    if (A(x, y) > 60) { if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y; n++; }
  return `x ${minX}-${maxX} (${maxX - minX + 1})  y ${minY + 32}-${maxY + 32} (${maxY - minY + 1})  px ${n}`;
};
console.log('crest   ', box(300, 30, 730, 250));
console.log('footer  ', box(300, 800, 730, 1010));
console.log('spiral  ', box(300, 400, 400, 480));
console.log('starL   ', box(380, 640, 470, 720));
console.log('letter  ', box(290, 320, 740, 720));
console.log('branchR ', box(500, 260, 1000, 900));
for (const y of [430, 440, 450, 460, 470]) {
  const r = []; let s = null;
  for (let x = 290; x < 420; x++) { const on = A(x, sy(y)) > 60;
    if (on && s === null) s = x; if (!on && s !== null) { r.push(`${s}-${x - 1}`); s = null; } }
  if (s !== null) r.push(`${s}-end`);
  console.log(`curl y=${y}:`, r.join(' '));
}
