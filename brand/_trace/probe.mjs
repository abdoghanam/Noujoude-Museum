import sharp from 'sharp';
const SRC = 'Noujoude.photo/brand_seal_monogram_1024.webp';
await sharp(SRC).resize(1024, 1024, { kernel: 'lanczos3' }).png().toFile('brand/_trace/base.png');
const base = sharp('brand/_trace/base.png');
const crops = {
  letterN:   { left: 270, top: 290, width: 420, height: 440 },
  topCrest:  { left: 330, top: 110, width: 360, height: 270 },
  bottomOrn: { left: 350, top: 700, width: 330, height: 280 },
  leafL:     { left: 55,  top: 370, width: 270, height: 310 },
  berryL:    { left: 85,  top: 240, width: 210, height: 230 },
  sparkle:   { left: 555, top: 285, width: 170, height: 170 },
  ringSeg:   { left: 390, top: 145, width: 250, height: 210 },
};
for (const [k, c] of Object.entries(crops)) {
  await sharp('brand/_trace/base.png').extract(c).resize(c.width * 2, c.height * 2, { kernel: 'lanczos3' })
      .png().toFile(`brand/_trace/${k}.png`);
}
const { data, info } = await sharp('brand/_trace/base.png').raw().toBuffer({ resolveWithObject: true });
const px = (x, y) => { const i = (y * info.width + x) * info.channels; return data.slice(i, i + 3).toString('hex'); };
const pts = { bg: [512,50], ringStroke: [512,186], stemTop: [424,380], stemMid: [424,510], stemBot: [424,640],
  diagL: [495,430], diagD: [525,540], rStem: [612,480], rose: [548,478], leafL: [150,500], leafD: [120,560],
  berry: [152,300], dot: [512,214], crestGold: [512,200], crestRose: [512,175] };
for (const [n, [x,y]] of Object.entries(pts)) console.log(n.padEnd(11), x, y, '#'+px(x,y));
