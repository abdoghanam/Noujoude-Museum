// Overlay diff: RED = source only, CYAN = render only, DARK = both, WHITE = neither.
// render.png is flattened on white (alpha always 255) → ink = distance from white.
// base.png is RGBA (alpha carries the shape) → ink = alpha.
// usage: node brand/_trace/ov.mjs name x y w h [scale]
import sharp from 'sharp';
const [name, x, y, w, h, sc = '2'] = process.argv.slice(2);
const OP = 32;
const src = await sharp('brand/_trace/base.png').extract({ left: +x, top: +y - OP, width: +w, height: +h })
  .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const ren = await sharp('brand/_trace/render.png').extract({ left: +x, top: +y, width: +w, height: +h })
  .removeAlpha().raw().toBuffer({ resolveWithObject: true });
const ink = v => Math.min(1, Math.max(0, (255 - v) / 70));      // 0 = white, 1 = solid-ish
const out = Buffer.alloc(+w * +h * 3);
for (let i = 0; i < w * h; i++) {
  const sa = Math.min(1, src.data[i * 4 + 3] / 200);
  const j = i * 3;
  const ra = Math.max(ink(ren.data[j]), Math.max(ink(ren.data[j + 1]), ink(ren.data[j + 2])));
  const k = i * 3;
  out[k] = 255 * sa * (1 - ra * .85);
  out[k + 1] = 255 * ra * (1 - sa * .85);
  out[k + 2] = 255 * ra * (1 - sa * .85);
  const both = Math.min(sa, ra);
  out[k] = Math.round(out[k] * (1 - both) + 30 * both);
  out[k + 1] = Math.round(out[k + 1] * (1 - both) + 30 * both);
  out[k + 2] = Math.round(out[k + 2] * (1 - both) + 30 * both);
}
await sharp(out, { raw: { width: +w, height: +h, channels: 3 } })
  .resize(+w * +sc, +h * +sc, { kernel: 'lanczos3' })
  .jpeg({ quality: 92 }).toFile(`brand/_trace/o_${name}.jpg`);
console.log(`o_${name}.jpg  ${x},${y} ${w}x${h} @${sc}x  RED=src only  CYAN=render only  DARK=match`);
