import sharp from 'sharp';
const { data, info } = await sharp('brand/_trace/base.png').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W=info.width,H=info.height,CH=info.channels;
const A=(x,y)=> x<0||y<0||x>=W||y>=H?0:data[(y*W+x)*CH+3];
const C=[512,480];
// letter mask = opaque AND r<252
const inL=(x,y)=>{const r=Math.hypot(x-C[0],y-C[1]);return A(x,y)>70&&r<252;};
let x0=1e9,x1=-1,y0=1e9,y1=-1;
for(let y=0;y<H;y++)for(let x=0;x<W;x++) if(inL(x,y)){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
console.log('letter bbox x',x0,x1,'y',y0,y1,'w',x1-x0,'h',y1-y0);
const runs=(f,n,other)=>{const o=[];let inr=false,st=0;for(let i=0;i<n;i++){const on=f(i);if(on&&!inr){inr=true;st=i;}if(!on&&inr){inr=false;if(i-st>=2)o.push([st,i-1]);}}if(inr)o.push([st,n-1]);return o;};
console.log('\n-- horizontal runs (x) at given y --');
for(const y of [300,310,320,330,340,350,360,380,400,420,440,460,480,500,520,540,560,580,600,620,640,650,660,670,680,690,700])
  console.log(String(y).padStart(4), JSON.stringify(runs(x=>inL(x,y),W)));
console.log('\n-- vertical runs (y) at given x --');
for(const x of [300,320,340,360,380,395,405,415,425,435,445,455,470,485,500,515,530,545,560,575,590,600,610,620,630,640,650,660])
  console.log(String(x).padStart(4), JSON.stringify(runs(y=>inL(x,y),H)));
