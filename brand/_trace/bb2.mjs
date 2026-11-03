// bbox of the ink strictly inside the dotted ring (the monogram alone)
import sharp from 'sharp';
const { data, info } = await sharp('brand/_trace/render.png').removeAlpha().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
let a=1e9,b=1e9,c=-1,d=-1,n=0;
for (let y=0;y<info.height;y++) for (let x=0;x<W;x++) {
  const r=Math.hypot(x-512,y-512); if (r>272) continue;
  const i=(y*W+x)*3; if (255-Math.min(data[i],data[i+1],data[i+2])<=24) continue;
  n++; a=Math.min(a,x); b=Math.min(b,y); c=Math.max(c,x); d=Math.max(d,y);
}
console.log('monogram bbox', a+'–'+c+' × '+b+'–'+d, n+' px');
