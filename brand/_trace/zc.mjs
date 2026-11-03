// Tight crops of the SOURCE at 3-4x for eye-reading. argv: name x y w h [scale]
import sharp from 'sharp';
const [name, x, y, w, h, sc = '3'] = process.argv.slice(2);
const OP = 32; // svg y -> png y
await sharp('brand/_trace/base.png')
  .extract({ left: +x, top: +y - OP, width: +w, height: +h })
  .resize(+w * +sc, +h * +sc, { kernel: 'lanczos3' })
  .flatten({ background: '#ffffff' })
  .png().toFile(`brand/_trace/z_${name}.png`);
console.log(`z_${name}.png  ${x},${y} ${w}x${h} @${sc}x`);
