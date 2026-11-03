// Tight crops of the RENDER at 3-4x for eye-reading. argv: name x y w h [scale]
// reads brand/_trace/render.png (1024², produced by render.mjs), where pixel y == svg y.
import sharp from 'sharp';
const [name, x, y, w, h, sc = '3'] = process.argv.slice(2);
await sharp('brand/_trace/render.png')
  .extract({ left: +x, top: +y, width: +w, height: +h })
  .resize(+w * +sc, +h * +sc, { kernel: 'lanczos3' })
  .flatten({ background: '#ffffff' })
  .png().toFile(`brand/_trace/r_${name}.png`);
console.log(`r_${name}.png  ${x},${y} ${w}x${h} @${sc}x`);
