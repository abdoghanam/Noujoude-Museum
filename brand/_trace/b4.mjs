import sharp from 'sharp';
const { data, info } = await sharp('brand/_trace/base.png').raw().toBuffer({ resolveWithObject: true });
const W = info.width, CH = info.channels;
const A = (x, y) => data[(y * W + x) * CH + 3] > 60;
const box = (x0, y0, x1, y1, label) => {
  let a=1e9,b=-1,c=1e9,d=-1;
  for (let y = y0-32; y <= y1-32; y++) for (let x = x0; x <= x1; x++)
    if (A(x,y)) { a=Math.min(a,x); b=Math.max(b,x); c=Math.min(c,y); d=Math.max(d,y); }
  console.log(`${label}: x ${a}-${b} (${b-a+1})  y ${c+32}-${d+32} (${d-c+1})`);
};
box(420,760,604,960,'footerCore');
box(360,780,664,860,'footerWide');
box(470,90,554,260,'crestCenter');
box(330,190,700,260,'crestArms');
