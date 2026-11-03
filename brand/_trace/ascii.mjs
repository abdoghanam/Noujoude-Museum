import sharp from 'sharp';
const { data, info } = await sharp('brand/_trace/base.png').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W=info.width,H=info.height,CH=info.channels;
const A=(x,y)=> x<0||y<0||x>=W||y>=H?0:data[(y*W+x)*CH+3];
// args: x0 y0 x1 y1 step
const [x0,y0,x1,y1,sx,sy]=process.argv.slice(2).map(Number);
for(let y=y0;y<=y1;y+=sy){ let r='';
  for(let x=x0;x<=x1;x+=sx){ let m=0; for(let j=0;j<sy;j+=2) for(let i=0;i<sx;i+=2){ const a=A(x+i,y+j); if(a>140)m=2; else if(a>50&&m<1)m=1; }
    r+= m===2?'#':m===1?'.':' '; }
  console.log(String(y+32).padStart(4)+' '+r); }
console.log('    0123456789'.padStart(10)+' x='+x0+'..'+x1+' step '+sx+'y'+sy);
