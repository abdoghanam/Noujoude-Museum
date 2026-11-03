const f=n=>Number(n.toFixed(1));
function cr(pts){ // Catmull-Rom -> cubic bezier segments; returns array of [p0,c1,c2,p1]
  const s=[]; const P=(i)=>pts[Math.max(0,Math.min(pts.length-1,i))];
  for(let i=0;i<pts.length-1;i++){ const p0=P(i-1),p1=P(i),p2=P(i+1),p3=P(i+2);
    s.push([p1,[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6],[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6],p2]); }
  return s; }
function sample(pts,n=120){ const seg=cr(pts); const out=[];
  for(let k=0;k<seg.length;k++){ const [p0,c1,c2,p1]=seg[k]; const steps=Math.max(2,Math.round(n/seg.length));
    for(let j=0;j<steps;j++){ const t=j/steps; const u=1-t;
      out.push([u*u*u*p0[0]+3*u*u*t*c1[0]+3*u*t*t*c2[0]+t*t*t*p1[0], u*u*u*p0[1]+3*u*u*t*c1[1]+3*u*t*t*c2[1]+t*t*t*p1[1]]); } }
  out.push(pts[pts.length-1]); return out; }
function ribbon(pts,widths,n=140){ const s=sample(pts,n); const w=[];
  for(let i=0;i<s.length;i++){ const t=i/(s.length-1); const x=t*(widths.length-1); const k=Math.min(Math.floor(x),widths.length-2);
    w.push(widths[k]+(widths[k+1]-widths[k])*(x-k)); }
  const L=[],R=[];
  for(let i=0;i<s.length;i++){ const a=s[Math.max(0,i-1)], b=s[Math.min(s.length-1,i+1)];
    let dx=b[0]-a[0], dy=b[1]-a[1]; const m=Math.hypot(dx,dy)||1; dx/=m; dy/=m;
    const h=w[i]/2; L.push([s[i][0]-dy*h, s[i][1]+dx*h]); R.push([s[i][0]+dy*h, s[i][1]-dx*h]); }
  const path=[`M${f(L[0][0])} ${f(L[0][1])}`, ...cr(L).map(([p0,c1,c2,p1])=>`C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p1[0])} ${f(p1[1])}`),
    `L${f(R[R.length-1][0])} ${f(R[R.length-1][1])}`, ...cr(R.slice().reverse()).map(([p0,c1,c2,p1])=>`C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p1[0])} ${f(p1[1])}`),'Z'];
  return path.join(' '); }
const line=(pts,n=140)=>{const s=sample(pts,n);return 'M'+s.map(p=>`${f(p[0])} ${f(p[1])}`).join(' L');};
console.log('DIAG1', ribbon([[421,338],[452,392],[489,450],[533,520],[579,600],[614,660],[640,690]],[10,12,15,18,19,16,3]));
  console.log();
  console.log('DIAG2', ribbon([[462,344],[490,392],[523,450],[566,520],[621,600],[652,646],[662,662]],[16,19,17,13,11,8,2]));
  console.log();
  console.log('ARCH', ribbon([[436,346],[404,318],[352,300],[300,318],[278,362],[288,408],[322,432],[352,424],[360,400],[344,384],[328,392]],
    [16,26,38,34,22,13,9,8,8,7,7,7]));
  console.log();
  console.log('STEM', ribbon([[425,352],[425,420],[424,540],[425,648]],[15,11,11,13]));
  console.log();
  console.log('WSTEM', line([[518,884],[640,872],[748,806],[822,700],[860,566],[862,440],[828,330],[770,248]]));
