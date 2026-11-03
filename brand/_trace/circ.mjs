import sharp from 'sharp';
const { data, info } = await sharp('brand/_trace/base.png').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W=info.width,H=info.height,CH=info.channels;
const A=(x,y)=> x<0||y<0||x>=W||y>=H?0:data[(y*W+x)*CH+3];
// collect candidate ring pixels
const cand=[]; for(let y=100;y<900;y++) for(let x=100;x<950;x++){ if(A(x,y)>90){ const r=Math.hypot(x-512,y-480); if(r>255&&r<330) cand.push([x,y]); } }
// iterative concentric-circle fit (Kasa) on two bands
function fit(pts){ let mx=0,my=0; pts.forEach(p=>{mx+=p[0];my+=p[1]}); mx/=pts.length;my/=pts.length;
  let b1=0,b2=0,b3=0,b4=0,b5=0; for(const [x,y] of pts){const u=x-mx,v=y-my; b1+=u*u; b2+=u*v; b3+=v*v; b4+=u*(u*u+v*v); b5+=v*(u*u+v*v);}
  const d=b1*b3-b2*b2, uc=(b4*b3-b5*b2)/d, vc=(b5*b1-b4*b2)/d, cx=mx+uc, cy=my+vc, R=Math.sqrt(uc*uc+vc*vc+(b1+b3)/pts.length); return {cx,cy,R}; }
for (const [lo,hi,label] of [[300,320,'outer band'],[270,292,'inner band']]) {
  let pts=cand.filter(([x,y])=>{const r=Math.hypot(x-512,y-480);return r>lo&&r<hi;});
  let f=null; for(let i=0;i<8;i++){ f=fit(pts); const rr=f.R; pts=cand.filter(([x,y])=>Math.abs(Math.hypot(x-f.cx,y-f.cy)-rr)<4); }
  console.log(label.padEnd(12), 'cx',f.cx.toFixed(1),'cy',f.cy.toFixed(1),'R',f.R.toFixed(1),'n',pts.length);
}
