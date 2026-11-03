import sharp from 'sharp';
const { data, info } = await sharp('brand/_trace/base.png').ensureAlpha().raw()
  .toBuffer({ resolveWithObject: true });
const W = info.width, H = info.height, CH = info.channels;
const A = (x, y) => data[(y * W + x) * CH + 3];
const RGB = (x, y) => { const i = (y*W+x)*CH; return '#'+data.slice(i,i+3).toString('hex'); };
let x0=1e9,x1=-1,y0=1e9,y1=-1;
for (let y=0;y<H;y++) for (let x=0;x<W;x++) if (A(x,y)>28){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; }
console.log('alpha bbox', {x0,x1,y0,y1,w:x1-x0,h:y1-y0,cx:((x0+x1)/2).toFixed(1),cy:((y0+y1)/2).toFixed(1)});
const cx=(x0+x1)/2, cy=(y0+y1)/2;
// radial profile: fraction of opaque samples per radius
const bins={};
for (let y=y0;y<=y1;y++) for (let x=x0;x<=x1;x++){
  if (A(x,y)<=28) continue;
  const r=Math.round(Math.hypot(x-cx,y-cy)); bins[r]=(bins[r]||0)+1;
}
console.log('--- radial density (r: count) every 5px, only r>150 ---');
let s=''; for (let r=150;r<=470;r+=5){ const c=bins[r]||0; s+=`${r}:${c} `; } console.log(s);
// scanline through centre: opaque runs
function runs(axis){ const n=axis==='h'?W:H; let out=[],inr=false,st=0;
  for(let i=0;i<n;i++){ const on=axis==='h'?A(i,cy)>60:A(cx,i)>60;
    if(on&&!inr){inr=true;st=i;} if(!on&&inr){inr=false; if(i-st>1)out.push([st,i-1]);} }
  if(inr)out.push([st,n-1]); return out; }
console.log('h-runs @cy:', JSON.stringify(runs('h')));
console.log('v-runs @cx:', JSON.stringify(runs('v')));
console.log('h-runs @cy-120:', JSON.stringify((()=>{const c=cy-120;let o=[],inr=false,st=0;
  for(let i=0;i<W;i++){const on=A(i,c)>60; if(on&&!inr){inr=true;st=i;} if(!on&&inr){inr=false;if(i-st>1)o.push([st,i-1]);} } return o;})()));
