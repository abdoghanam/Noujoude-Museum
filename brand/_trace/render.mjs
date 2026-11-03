import sharp from 'sharp';
import fs from 'fs';
const svg = 'brand/noujoude-monogram-seal.svg';
const out = 'brand/_trace/render.png';
await sharp(Buffer.from(fs.readFileSync(svg, 'utf8')), { density: 300 })
  .resize(1024, 1024).flatten({ background: '#ffffff' }).png().toFile(out);
const a = await sharp('brand/_trace/base.png').flatten({ background: '#fff' }).png().toBuffer();
await sharp({ create: { width: 2064, height: 1024, channels: 3, background: '#ffffff' } })
  .composite([{ input: a, left: 0, top: 0 }, { input: fs.readFileSync(out), left: 1040, top: 0 }])
  .jpeg({ quality: 88 }).toFile('brand/_trace/side.jpg');
console.log('rendered', fs.statSync(out).size, 'bytes');
