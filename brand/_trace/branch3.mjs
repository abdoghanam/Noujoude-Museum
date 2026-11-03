const C=[512,512]; const rad=d=>d*Math.PI/180, deg=r=>r*180/Math.PI;
const P=(a,r)=>[C[0]+r*Math.cos(rad(a)), C[1]+r*Math.sin(rad(a))];
const f=v=>Number(v.toFixed(1)); const norm=v=>{const m=Math.hypot(v[0],v[1]);return[v[0]/m,v[1]/m];};
const nodes=[[93,360,72],[82,357,92],[71,354,104],[60,352,110],[49,351,112],[38,350,110],
             [27,350,106],[16,350,100],[5,351,94],[-6,352,86],[-17,354,76],[-28,357,64],[-38,360,50]];
const out=[];
nodes.forEach(([a,r,L],i)=>{
  const T=[Math.sin(rad(a)),-Math.cos(rad(a))], N=[Math.cos(rad(a)),Math.sin(rad(a))];
  let [x,y]=P(a,r), D=norm([T[0]+0.95*N[0],T[1]+0.95*N[1]]);
  out.push(`<use href="#leaf" transform="translate(${f(x)} ${f(y)}) rotate(${f(deg(Math.atan2(D[1],D[0])))}) scale(${f(L/100)})"/>`);
  if(i<11){ [x,y]=P(a-7,r+2); D=norm([T[0]-0.75*N[0],T[1]-0.75*N[1]]);
    out.push(`<use href="#leaf" transform="translate(${f(x)} ${f(y)}) rotate(${f(deg(Math.atan2(D[1],D[0])))}) scale(${f(L*0.6/100)})"/>`); }
});
for(const a of [76,54,32,10,-12,-34]){ const [x,y]=P(a,356); const T=[Math.sin(rad(a)),-Math.cos(rad(a))],N=[Math.cos(rad(a)),Math.sin(rad(a))];
  const D=norm([T[0]+1.35*N[0],T[1]+1.35*N[1]]);
  out.push(`<use href="#sprig" transform="translate(${f(x)} ${f(y)}) rotate(${f(deg(Math.atan2(D[1],D[0])))})"/>`); }
console.log(out.join('\n        '));
