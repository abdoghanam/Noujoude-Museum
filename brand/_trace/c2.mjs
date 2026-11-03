import sharp from 'sharp';
const jobs=[['crest',330,60,370,200,3],['footer',400,750,230,200,3],['curl',290,320,200,180,3],['leaf',640,300,200,160,3]];
for(const [n,x,y,w,h,k] of jobs){
  await sharp('brand/_trace/base.png').extract({left:x,top:y-32,width:w,height:h})
    .flatten({background:'#ffffff'}).resize(w*k,h*k,{kernel:'lanczos3'}).png()
    .toFile(`brand/_trace/z_${n}.png`);
}
console.log('ok');
