import sharp from 'sharp';
const { data, info } = await sharp('brand/_trace/base.png').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W=info.width,H=info.height,CH=info.channels; const C=[512,480];
const A=(x,y)=> x<0||y<0||x>=W||y>=H?0:data[(y*W+x)*CH+3];
const hist=new Array(360).fill(0); let rmin=1e9,rmax=0;
for(let y=60;y<910;y++)for(let x=95;x<935;x++){ if(A(x,y)>70){ const dx=x-C[0],dy=y-C[1],r=Math.hypot(dx,dy);
  if(r>318&&r<460){ let a=Math.round(Math.atan2(dy,dx)*180/Math.PI); if(a<0)a+=360; hist[a]++; rmin=Math.min(rmin,r);rmax=Math.max(rmax,r); } } }
console.log('wreath r range', rmin.toFixed(0), rmax.toFixed(0));
let s=''; for(let a=0;a<360;a++) s+= hist[a]>0 ? '#' : hist[a]===0?'.' : '.';
// print in 10deg buckets
for(let a=0;a<360;a+=10){ const t=hist.slice(a,a+10).reduce((p,c)=>p+c,0); console.log(String(a).padStart(3)+'deg', String(t).padStart(5), t>0?'█'.repeat(Math.min(40,Math.round(t/60))):''); }
// radial extent per angle band on right side
console.log('\n-- right side leaf clusters: for each 5deg, min/max r --');
for(let a=315;a<405;a+=5){ const ang=((a%360)+360)%360; let lo=1e9,hi=0;
  for(let r=318;r<465;r++){ const x=Math.round(C[0]+r*Math.cos(ang*Math.PI/180)), y=Math.round(C[1]+r*Math.sin(ang*Math.PI/180)); if(A(x,y)>70){lo=Math.min(lo,r);hi=Math.max(hi,r);} }
  console.log(String(a).padStart(3), lo===1e9?'empty':`r ${lo}-${hi}`); }
