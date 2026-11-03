import sharp from 'sharp';
const { data, info } = await sharp('brand/_trace/base.png').raw().toBuffer({ resolveWithObject: true });
const W = info.width, CH = info.channels;
const A = (x, y) => data[(y * W + x) * CH + 3] > 60;
for (const y of [150,170,190,200,210,220,230,240]) {
  const r=[]; let s=null;
  for (let x=330;x<700;x++){const on=A(x,y-32); if(on&&s===null)s=x; if(!on&&s!==null){r.push(`${s}-${x-1}`);s=null;}}
  if(s!==null)r.push(`${s}-699`);
  console.log(`y=${y}: `+r.join(' '));
}
console.log('--- footer ---');
for (const y of [790,810,830,850,870,890,910]) {
  const r=[]; let s=null;
  for (let x=400;x<630;x++){const on=A(x,y-32); if(on&&s===null)s=x; if(!on&&s!==null){r.push(`${s}-${x-1}`);s=null;}}
  if(s!==null)r.push(`${s}-629`);
  console.log(`y=${y}: `+r.join(' '));
}
