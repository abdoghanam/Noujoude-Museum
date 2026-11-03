const C=[512,512]; const rad=d=>d*Math.PI/180, deg=r=>r*180/Math.PI;
const P=(a,r)=>[C[0]+r*Math.cos(rad(a)), C[1]+r*Math.sin(rad(a))];
const f=v=>Number(v.toFixed(1));
const norm=v=>{const m=Math.hypot(v[0],v[1]);return[v[0]/m,v[1]/m];};
const nodes=[[92,372,62],[80,368,76],[68,364,86],[56,361,92],[44,358,94],[32,357,92],
             [20,356,88],[8,356,82],[-4,357,74],[-16,359,64],[-28,362,52],[-38,366,40]];
const out=[];
nodes.forEach(([a,r,L],i)=>{
  const [x,y]=P(a,r); const T=[Math.sin(rad(a)),-Math.cos(rad(a))], N=[Math.cos(rad(a)),Math.sin(rad(a))];
  let D=norm([T[0]+0.92*N[0],T[1]+0.92*N[1]]);
  out.push(`<use href="#leaf" transform="translate(${f(x)} ${f(y)}) rotate(${f(deg(Math.atan2(D[1],D[0])))}) scale(${f(L/100)})"/>`);
  if(i%2===0&&i<10){ const [x2,y2]=P(a-6,r-2); D=norm([T[0]-0.7*N[0],T[1]-0.7*N[1]]);
    out.push(`<use href="#leaf" transform="translate(${f(x2)} ${f(y2)}) rotate(${f(deg(Math.atan2(D[1],D[0])))}) scale(${f(L*0.62/100)})"/>`); }
});
for(const a of [74,50,26,2,-22,-44]){ const [x,y]=P(a,368); const T=[Math.sin(rad(a)),-Math.cos(rad(a))],N=[Math.cos(rad(a)),Math.sin(rad(a))];
  const D=norm([T[0]+1.3*N[0],T[1]+1.3*N[1]]);
  out.push(`<use href="#sprig" transform="translate(${f(x)} ${f(y)}) rotate(${f(deg(Math.atan2(D[1],D[0])))})"/>`); }
console.log(out.join('\n      '));
