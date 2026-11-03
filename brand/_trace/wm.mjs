// Split wreath-band ink by radius zone: stem corridor vs leaf zone, per 15° sector.
import sharp from 'sharp';
const { data, info } = await sharp('brand/_trace/base.png').ensureAlpha().raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width, CH = info.channels;
const stem = new Array(24).fill(0), leaf = new Array(24).fill(0), inner = new Array(24).fill(0);
for (let y = 0; y < info.height; y++) for (let x = 0; x < W; x++) {
  const i = (y * W + x) * CH; if (data[i + 3] < 40) continue;
  const dx = x - 512, dy = y + 32 - 512, r = Math.hypot(dx, dy);
  if (r < 316 || r > 430) continue;
  if (y + 32 < 258 && Math.abs(dx) < 200) continue;
  if (y + 32 > 795 && Math.abs(dx) < 120) continue;
  if (data[i] < data[i + 2] + 12) continue;
  const k = Math.floor((((Math.atan2(dy, dx) * 180 / Math.PI) + 360) % 360) / 15);
  (r < 344 ? inner : r < 372 ? stem : leaf)[k]++;
}
console.log('sec  inner stem  leaf   tot');
for (let k = 0; k < 24; k++) console.log(`${String(k * 15).padStart(3)} ${String(inner[k]).padStart(6)} ${String(stem[k]).padStart(6)} ${String(leaf[k]).padStart(6)} ${String(inner[k] + stem[k] + leaf[k]).padStart(6)}`);
const s = a => a.reduce((p, q) => p + q, 0);
console.log('TOTAL inner', s(inner), 'stem', s(stem), 'leaf', s(leaf));
