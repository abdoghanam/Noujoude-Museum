import fs from 'fs';
const f = 'brand/noujoude-monogram-seal.svg';
let t = fs.readFileSync(f, 'utf8');
const leaves = `        <use href="#leaf" transform="translate(523.1 828.5) rotate(59.2) scale(.88)"/>
        <use href="#leaf" transform="translate(523.1 828.5) rotate(-65.4) scale(.52)"/>
        <use href="#leaf" transform="translate(559.2 835.3) rotate(52.9) scale(.88)"/>
        <use href="#leaf" transform="translate(596.9 837.9) rotate(46.6) scale(.88)"/>
        <use href="#leaf" transform="translate(596.9 837.9) rotate(-78) scale(.52)"/>
        <use href="#leaf" transform="translate(635.7 835.9) rotate(40.3) scale(.88)"/>
        <use href="#leaf" transform="translate(675.1 829.3) rotate(34) scale(.88)"/>
        <use href="#leaf" transform="translate(675.1 829.3) rotate(-90.6) scale(.52)"/>
        <use href="#leaf" transform="translate(709.6 810.5) rotate(27.7) scale(.88)"/>
        <use href="#leaf" transform="translate(741.2 787) rotate(21.4) scale(.88)"/>
        <use href="#leaf" transform="translate(741.2 787) rotate(-103.2) scale(.52)"/>
        <use href="#leaf" transform="translate(770 760.2) rotate(15.1) scale(.88)"/>
        <use href="#leaf" transform="translate(795.6 730.4) rotate(8.8) scale(.88)"/>
        <use href="#leaf" transform="translate(795.6 730.4) rotate(-115.8) scale(.52)"/>
        <use href="#leaf" transform="translate(817.9 698) rotate(2.5) scale(.88)"/>
        <use href="#leaf" transform="translate(836.5 663.3) rotate(-3.8) scale(.88)"/>
        <use href="#leaf" transform="translate(836.5 663.3) rotate(-128.4) scale(.52)"/>
        <use href="#leaf" transform="translate(851.1 626.8) rotate(-10.1) scale(.88)"/>
        <use href="#leaf" transform="translate(861.6 588.9) rotate(-16.4) scale(.88)"/>
        <use href="#leaf" transform="translate(861.6 588.9) rotate(-141) scale(.52)"/>
        <use href="#leaf" transform="translate(868 550) rotate(-22.7) scale(.88)"/>
        <use href="#leaf" transform="translate(870 510.8) rotate(-29) scale(.88)"/>
        <use href="#leaf" transform="translate(870 510.8) rotate(-153.6) scale(.52)"/>
        <use href="#leaf" transform="translate(867.7 471.5) rotate(-35.3) scale(.88)"/>
        <use href="#leaf" transform="translate(861.1 432.7) rotate(-41.6) scale(.88)"/>
        <use href="#leaf" transform="translate(861.1 432.7) rotate(-166.2) scale(.52)"/>
        <use href="#leaf" transform="translate(850.3 394.9) rotate(-47.9) scale(.86)"/>
        <use href="#leaf" transform="translate(842.6 355) rotate(-54.2) scale(.77)"/>
        <use href="#leaf" transform="translate(842.6 355) rotate(-178.8) scale(.46)"/>
        <use href="#leaf" transform="translate(823.4 319.7) rotate(-60.5) scale(.69)"/>
        <use href="#leaf" transform="translate(800.4 286.7) rotate(-66.8) scale(.6)"/>
        <use href="#leaf" transform="translate(800.4 286.7) rotate(168.6) scale(.35)"/>`;
const berries = `        <use href="#sprig" transform="translate(559.2 835.3) rotate(62.4) scale(.92)"/>
        <use href="#sprig" transform="translate(675.1 829.3) rotate(43.5) scale(.92)"/>
        <use href="#sprig" transform="translate(770 760.2) rotate(24.6) scale(.92)"/>
        <use href="#sprig" transform="translate(836.5 663.3) rotate(5.7) scale(.92)"/>
        <use href="#sprig" transform="translate(868 550) rotate(-13.2) scale(.92)"/>
        <use href="#sprig" transform="translate(861.1 432.7) rotate(-32.1) scale(.92)"/>
        <use href="#sprig" transform="translate(823.4 319.7) rotate(-51) scale(.72)"/>`;
const rep = (re, out, name) => {
  if (!re.test(t)) { console.error('NO MATCH ' + name); process.exit(1); }
  t = t.replace(re, () => out);
};
rep(/<g id="branch-leaves">[\s\S]*?<\/g>/, `<g id="branch-leaves">\n${leaves}\n      </g>`, 'leaves');
rep(/<g id="branch-berries">[\s\S]*?<\/g>/, `<g id="branch-berries">\n${berries}\n      </g>`, 'berries');
fs.writeFileSync(f, t);
console.log('swapped');
