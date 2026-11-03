import sharp from 'sharp';
const { data, info } = await sharp('brand/_trace/base.png').raw().toBuffer({ resolveWithObject: true });
const W = info.width, CH = info.channels;
const A = (x, y) => data[(y * W + x) * CH + 3];
const hist = new Array(460).fill(0);
for (let y = 60; y < 980; y++) for (let x = 512; x < 1010; x++) {
  if (A(x, y - 32) > 60) {
    const r = Math.round(Math.hypot(x - 512, y - 32 - 512));
    if (r < 460) hist[r]++;
  }
}
let s = '';
for (let r = 240; r < 460; r++) s += `${r}:${hist[r]} `;
console.log(s);
