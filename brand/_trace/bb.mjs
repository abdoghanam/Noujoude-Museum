// Bounding boxes of named element groups in the current render, plus the palette means.
import sharp from 'sharp';
import fs from 'fs';
const { data, info } = await sharp('brand/_trace/render.png').removeAlpha().raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width;
const ink = (x, y) => { const i = (y * W + x) * 3; return 255 - Math.min(data[i], data[i + 1], data[i + 2]) > 24; };
const box = (x0, y0, x1, y1) => {
  let a = 1e9, b = 1e9, c = -1, d = -1, n = 0;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++)
    if (ink(x, y)) { n++; a = Math.min(a, x); b = Math.min(b, y); c = Math.max(c, x); d = Math.max(d, y); }
  return `${a}–${c} × ${b}–${d}  (${n} px)`;
};
console.log('whole      ', box(0, 0, 1023, 1023));
console.log('inside ring', box(240, 240, 784, 784));
console.log('crest zone ', box(300, 60, 724, 260));
console.log('footer zone', box(400, 790, 624, 1000));
console.log('wreath band', box(96, 96, 928, 928));
