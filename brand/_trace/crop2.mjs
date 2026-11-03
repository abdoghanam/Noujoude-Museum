import sharp from 'sharp';
const crops = {
  letterN:  { left: 295, top: 290, width: 460, height: 400, z: 2 },
  topCrest: { left: 400, top: 55,  width: 230, height: 250, z: 3 },
  botOrn:   { left: 400, top: 745, width: 230, height: 160, z: 3 },
  leafR:    { left: 760, top: 330, width: 190, height: 300, z: 3 },
  berryR:   { left: 700, top: 200, width: 180, height: 200, z: 3 },
  sparkle:  { left: 570, top: 280, width: 130, height: 130, z: 4 },
  roseFdl:  { left: 490, top: 430, width: 110, height: 110, z: 5 },
  ringSeg:  { left: 300, top: 165, width: 180, height: 130, z: 4 },
  curlTR:   { left: 300, top: 285, width: 160, height: 130, z: 4 },
  curlBR:   { left: 590, top: 540, width: 160, height: 140, z: 4 },
};
for (const [k,c] of Object.entries(crops)) {
  await sharp('brand/_trace/base.png').extract({left:c.left,top:c.top,width:c.width,height:c.height})
    .resize(c.width*c.z, c.height*c.z, {kernel:'lanczos3'}).flatten({background:'#ffffff'}).png().toFile(`brand/_trace/${k}.png`);
}
console.log('ok');
