import sharp from 'sharp';
const { data, info } = await sharp('brand/_trace/base.png').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W=info.width,H=info.height,CH=info.channels;
const A=(x,y)=> x<0||y<0||x>=W||y>=H?0:data[(y*W+x)*CH+3];
const O=(x,y)=>A(x,y)>140;
function hruns(y,x0,x1){ const o=[]; let i=x0; while(i<=x1){ if(O(i,y)){let j=i;while(j<=x1&&O(j,y))j++; o.push([i,j-1,Math.round((i+j-1)/2)]); i=j;} else i++; } return o.filter(r=>r[1]-r[0]>=3); }
const y0=Number(process.argv[2]), y1=Number(process.argv[3]), dy=Number(process.argv[4]), x0=Number(process.argv[5]), x1=Number(process.argv[6]);
for(let y=y0;y<=y1;y+=dy) console.log('y='+String(y).padStart(4), hruns(y,x0,x1).map(r=>`${r[0]}-${r[1]}@${r[2]}`).join('  '));
