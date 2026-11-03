const C=[512,512];
const rad=d=>d*Math.PI/180, deg=r=>r*180/Math.PI;
const P=(a,r)=>[C[0]+r*Math.cos(rad(a)), C[1]+r*Math.sin(rad(a))];
const f=v=>Number(v.toFixed(1));
const nodes=[ // angle, stemRadius, leafLen, out?, in?
  [ 94,372,58],[ 83,368,74],[ 72,364,86],[ 61,361,92],[ 50,358,96],[ 39,356,98],
  [ 28,355,98],[ 17,354,96],[  6,354,92],[ -5,355,86],[ -16,357,78],[ -27,360,68],
  [ -37,364,56],[ -46,368,42],
];
const norm=v=>{const m=Math.hypot(v[0],v[1]);return [v[0]/m,v[1]/m];};
const out=[];
for (const [a,r,L] of nodes){
  const [x,y]=P(a,r); const T=[Math.sin(rad(a)),-Math.cos(rad(a))], N=[Math.cos(rad(a)),Math.sin(rad(a))];
  // outward leaf
  let D=norm([T[0]+0.85*N[0], T[1]+0.85*N[1]]);
  out.push(`    <use href="#leaf" x="0" y="0" transform="translate(${f(x)} ${f(y)}) rotate(${f(deg(Math.atan2(D[1],D[0])))}) scale(${f(L/100)})"/>`);
  // inward leaf, node nudged along travel
  const [x2,y2]=P(a-5, r-4);
  D=norm([T[0]-0.72*N[0], T[1]-0.72*N[1]]);
  out.push(`    <use href="#leaf" x="0" y="0" transform="translate(${f(x2)} ${f(y2)}) rotate(${f(deg(Math.atan2(D[1],D[0])))}) scale(${f(L*0.72/100)})"/>`);
}
for (const a of [88,66,44,22,0,-22,-42]) {
  const [x,y]=P(a,366); const T=[Math.sin(rad(a)),-Math.cos(rad(a))], N=[Math.cos(rad(a)),Math.sin(rad(a))];
  const D=norm([T[0]+1.25*N[0], T[1]+1.25*N[1]]); const ang=f(deg(Math.atan2(D[1],D[0])));
  const [bx,by]=[x+D[0]*66, y+D[1]*66];
  out.push(`    <use href="#sprig" x="0" y="0" transform="translate(${f(x)} ${f(y)}) rotate(${ang})"/>`);
}
console.log(out.join('\n'));
