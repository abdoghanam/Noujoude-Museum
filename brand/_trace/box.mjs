// Ink + mean-tone of a box, source vs render. argv: x y w h
import sharp from 'sharp';
import fs from 'fs';
const [x0, y0, w, h] = process.argv.slice(2).map(Number);
const load = async (p, isSvg) => {
  const s = isSvg ? sharp(Buffer.from(fs.readFileSync(p, 'utf8')), { density: 300 }).resize(1024, 1024) : sharp(p);
  const { data, info } = await s.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { d: data, w: info.width, c: info.channels };
};
const S = await load('brand/_trace/base.png', false);
const R = await load('brand/noujoude-monogram-seal.svg', true);
const stat = (I, O) => {
  let n = 0, lum = 0, r = 0, g = 0, b = 0;
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
    const i = ((y - O) * I.w + x) * I.c;
    if (I.d[i + 3] < 40) continue;
    n++; r += I.d[i]; g += I.d[i + 1]; b += I.d[i + 2];
    lum += .299 * I.d[i] + .587 * I.d[i + 1] + .114 * I.d[i + 2];
  }
  return n ? `ink ${String(n).padStart(6)}  lum ${String(Math.round(lum / n)).padStart(3)}  #${[r, g, b].map(v => Math.round(v / n).toString(16).padStart(2, '0')).join('').toUpperCase()}` : 'ink      0';
};
console.log(`box ${x0} ${y0} ${w}x${h}`);
console.log(' src ', stat(S, 32));
console.log(' rend', stat(R, 0));
