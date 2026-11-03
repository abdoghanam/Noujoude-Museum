import sharp from 'sharp';
const { data, info } = await sharp('brand/_trace/base.png').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W=info.width,H=info.height,CH=info.channels; const C=[512,480];
const A=(x,y)=> x<0||y<0||x>=W||y>=H?0:data[(y*W+x)*CH+3];
// angular occupancy at dotted-ring radius
const band=[]; for(let d=0;d<3600;d++){ const a=d/10*Math.PI/180; let on=false;
  for(let r=274;r<=288;r+=1){ const x=Math.round(C[0]+r*Math.cos(a)), y=Math.round(C[1]+r*Math.sin(a)); if(A(x,y)>90){on=true;break;} }
  band.push(on?1:0); }
// count runs of 1s
let runs=[],i=0; while(i<3600){ if(band[i]){ let j=i; while(j<3600&&band[j])j++; runs.push([i/10,j/10]); i=j;} else i++; }
const cov=runs.reduce((p,[a,b])=>p+(b-a),0);
console.log('dot runs:',runs.length,'coverage deg:',cov.toFixed(1),'mean width deg:',(cov/runs.length).toFixed(2),'mean gap:',(360/runs.length-cov/runs.length).toFixed(2));
console.log('first 12 runs', runs.slice(0,12).map(r=>r.map(v=>v.toFixed(1)).join('-')).join(' | '));
// ring stroke widths
for (const [lbl,ang] of [['right',0],['left',180]]) { const a=ang*Math.PI/180; let s='';
  for(let r=270;r<320;r++){ const x=Math.round(C[0]+r*Math.cos(a)), y=Math.round(C[1]+r*Math.sin(a)); s+=A(x,y)>200?'#':A(x,y)>70?'+':'.'; }
  console.log('ring profile r270-320',lbl,s); }
