import sharp from 'sharp';
const src = 'brand/_trace/base.png';
const jobs = [
  ['wreathL', 40, 300, 300, 420],     // x,y,w,h  left branch upper
  ['wreathB', 300, 700, 420, 300],    // bottom-left branch
  ['crest',   300, 40, 424, 220],
  ['footer',  300, 800, 424, 220],
  ['mono',    260, 280, 500, 460],
];
for (const [n, x, y, w, h] of jobs) {
  await sharp(src).extract({ left: x, top: y, width: w, height: h })
    .flatten({ background: '#ffffff' })
    .resize(w * 2, h * 2)
    .png()
    .toFile(`brand/_trace/c_${n}.png`);
}
console.log('done');
