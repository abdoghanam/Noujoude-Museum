import sharp from 'sharp';
const { data, info } = await sharp('brand/_trace/base.png').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const W=info.width,H=info.height,CH=info.channels;
const A=(x,y)=> x<0||y<0||x>=W||y>=H?0:data[(y*W+x)*CH+3];
function bbox(x0,y0,x1,y1,thr=60){ let a=1e9,b=-1,c=1e9,d=-1;
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++) if(A(x,y)>thr){ if(x<a)a=x; if(x>b)b=x; if(y<c)c=y; if(y>d)d=y; }
  return {x:[a,b],y:[c,d],w:b-a,h:d-c}; }
console.log('crest   ', JSON.stringify(bbox(300,60,730,215)));
console.log('footer  ', JSON.stringify(bbox(330,790,700,930)));
console.log('wreath R', JSON.stringify(bbox(690,200,960,800)));
console.log('dots band', JSON.stringify(bbox(200,180,830,230)));
// colour of the gold at several heights for gradient stops
const hex=(x,y)=>{const i=(y*W+x)*CH;return '#'+data.slice(i,i+3).toString('hex');};
console.log('gold samples  top',hex(512,120),' ring',hex(512,208),' leaf',hex(860,512),' letterHi',hex(425,470),' letterLo',hex(425,620),' footer',hex(512,860));
