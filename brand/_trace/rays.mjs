import sharp from 'sharp';
const { data, info } = await sharp('brand/_trace/base.png').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W=info.width,H=info.height,CH=info.channels;
const A=(x,y)=> x<0||y<0||x>=W||y>=H?0:data[(y*W+x)*CH+3];
function crossings(cx,cy,a0,deg){ const out=[]; let inr=false,st=0;
  for(let r=200;r<345;r++){ const x=Math.round(cx+r*Math.cos(a0)), y=Math.round(cy+r*Math.sin(a0));
    const on=A(x,y)>80; if(on&&!inr){inr=true;st=r;} if(!on&&inr){inr=false;out.push([st,r-1]);} }
  if(inr)out.push([st,344]); return out; }
for (const [name,c] of [['top',['x',512]],['bottom',['x',512]]]) {}
// cardinal + diagonals from several candidate centres
for (const [cx,cy] of [[512,480],[512,505],[512,512],[505,500]]) {
  console.log(`\ncentre ${cx},${cy}`);
  for (const [lbl,ang] of [['up',-90],['down',90],['left',180],['right',0],['ul',-135],['ur',-45],['dl',135],['dr',45]]) {
    const a=ang*Math.PI/180; console.log(' ',lbl.padEnd(6), JSON.stringify(crossings(cx,cy,a)));
  }
}
