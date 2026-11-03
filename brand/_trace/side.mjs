// side.mjs name x y w h [scale] — source (LEFT) vs render (RIGHT), same SVG-space box.
// base.png is a 1024 upscale of the 512-native asset with svg y = png y + 32;
// render.png is rasterised straight from the SVG at 1024, so its offset is 0.
import sharp from 'sharp';
const [name, x, y, w, h, sc = '4'] = process.argv.slice(2);
const crop = async (file, top, scale) =>
  sharp(file).extract({ left: +x, top, width: +w, height: +h })
    .resize(+w * +scale, +h * +scale, { kernel: 'lanczos3' })
    .flatten({ background: '#ffffff' }).png().toBuffer();
const a = await crop('brand/_trace/base.png', +y - 32, +sc);
const b = await crop('brand/_trace/render.png', +y, +sc);
const W = +w * +sc, H = +h * +sc;
await sharp({ create: { width: W * 2 + 12, height: H, channels: 3, background: '#888888' } })
  .composite([{ input: a, left: 0, top: 0 }, { input: b, left: W + 12, top: 0 }])
  .jpeg({ quality: 92 }).toFile(`brand/_trace/s_${name}.jpg`);
console.log(`s_${name}.jpg  ${x},${y} ${w}x${h} @${sc}x   LEFT=source RIGHT=render`);
