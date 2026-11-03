import fs from 'fs';
const f = 'brand/noujoude-monogram-seal.svg';
let t = fs.readFileSync(f, 'utf8');
const sub = (a, b, name) => { if (!t.includes(a)) { console.error('NO MATCH: ' + name); process.exit(1); } t = t.replace(a, b); };
sub(`      <stop offset="0"   stop-color="#E7CFA8"/>
      <stop offset=".45" stop-color="#D9BC8F"/>
      <stop offset=".78" stop-color="#C7A273"/>
      <stop offset="1"   stop-color="#B08A60"/>`,
`      <stop offset="0"   stop-color="#E3C89C"/>
      <stop offset=".45" stop-color="#D5B585"/>
      <stop offset=".78" stop-color="#C1996C"/>
      <stop offset="1"   stop-color="#A8815A"/>`, 'gLetter');
sub(`      <g id="n-fleur" transform="translate(522 502) scale(.4)">`,
    `      <g id="n-fleur" transform="translate(522 500) scale(.4 .52)">`, 'n-fleur');
fs.writeFileSync(f, t);
console.log('applied');
