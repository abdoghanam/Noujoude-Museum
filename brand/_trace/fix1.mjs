import fs from 'fs';
const f = 'brand/noujoude-monogram-seal.svg';
let t = fs.readFileSync(f, 'utf8');
const sub = (a, b, name) => { if (!t.includes(a)) { console.error('NO MATCH: ' + name); process.exit(1); } t = t.replace(a, b); };

sub(`      <stop offset="0"   stop-color="#EFD9B4"/>
      <stop offset=".3"  stop-color="#DFC39A"/>
      <stop offset=".62" stop-color="#CBAC7F"/>
      <stop offset=".85" stop-color="#B8966B"/>
      <stop offset="1"   stop-color="#A78A62"/>`,
`      <stop offset="0"   stop-color="#E8CFA6"/>
      <stop offset=".3"  stop-color="#DAC094"/>
      <stop offset=".6"  stop-color="#C8A87A"/>
      <stop offset=".82" stop-color="#B79468"/>
      <stop offset="1"   stop-color="#A6875F"/>`, 'gWide');

sub(`      <stop offset="0"   stop-color="#EFDCB9"/>
      <stop offset=".45" stop-color="#E0C79D"/>
      <stop offset=".78" stop-color="#CDAA7E"/>
      <stop offset="1"   stop-color="#B9946C"/>`,
`      <stop offset="0"   stop-color="#E7CFA8"/>
      <stop offset=".45" stop-color="#D9BC8F"/>
      <stop offset=".78" stop-color="#C7A273"/>
      <stop offset="1"   stop-color="#B08A60"/>`, 'gLetter');

sub(`      <path d="M13-16C31-42 62-42 64-18 65-2 50 10 36 4" stroke-width="12"/>
      <!-- arm: leaves the band, curls into a volute, then runs down onto the ring -->
      <path d="M18 26C40 12 66 10 82 22" stroke-width="10"/>
      <path d="M82 22C97 31 95 48 80 50 68 51 62 42 66 33" stroke-width="8"/>
      <path d="M82 24C106 38 134 58 174 78" stroke-width="7"/>
      <path d="M18 26C44 34 74 50 108 72" stroke-width="5"/>
      <circle cx="74" cy="36" r="7" fill="url(#gWide)" stroke="none"/>`,
`      <path d="M14-18C34-48 70-46 72-18 73 2 54 14 36 6" stroke-width="14"/>
      <!-- arm: leaves the band, curls into a volute, then runs down onto the ring -->
      <path d="M18 28C42 12 70 8 88 22" stroke-width="11"/>
      <path d="M88 22C104 32 102 52 84 54 70 55 63 44 68 34" stroke-width="9"/>
      <path d="M88 24C112 38 140 58 176 78" stroke-width="8"/>
      <path d="M120 46C136 44 150 50 156 62" stroke-width="7"/>
      <circle cx="78" cy="38" r="8" fill="url(#gWide)" stroke="none"/>`, 'crest-half');

sub(`      <path d="M12-46C30-52 50-48 60-36C72-22 66 0 48 0 34-1 30-16 41-21" stroke-width="10"/>
      <path d="M60-36C70-27 74-16 72-6" stroke-width="7"/>
      <circle cx="45" cy="-14" r="6.5" fill="url(#gWide)" stroke="none"/>`,
`      <path d="M12-46C32-54 56-48 66-34C78-18 70 6 50 6 34 5 30-14 43-20" stroke-width="12"/>
      <path d="M66-34C78-24 82-10 78 4" stroke-width="8"/>
      <circle cx="47" cy="-12" r="7.5" fill="url(#gWide)" stroke="none"/>`, 'footer-half');

sub(`      <path d="M0-76C10-52 16-30 13-12-13-12-16-30-13-52Z" fill="url(#gGem)"/>`,
`      <path d="M0-78C11-52 17-30 14-11-14-11-17-30-14-52Z" fill="url(#gGem)"/>`, 'spire');

sub(`      <path d="M0-59 17-30 0-22-17-30Z" fill="url(#gGem)"/>
      <path d="M0-59 17-30 0-22-17-30Z" fill="none" stroke="#C89A87" stroke-width="1.6" opacity=".5"/>
      <!-- lower diamond gem with side points -->
      <path d="M0-22 26 16 0 47-26 16Z" fill="url(#gGem)"/>
      <path d="M0-22V47M-26 16H26" fill="none" stroke="#FBEAE2" stroke-width="2" opacity=".55"/>
      <path d="M0-22 26 16 0 47-26 16Z" fill="none" stroke="#C89A87" stroke-width="1.8" opacity=".5"/>
      <path d="M-26 16-38 8M26 16 38 8" fill="none" stroke="url(#gWide)" stroke-width="4"
            stroke-linecap="round"/>`,
`      <path d="M0-56 15-31 0-24-15-31Z" fill="url(#gGem)"/>
      <path d="M0-56 15-31 0-24-15-31Z" fill="none" stroke="#C89A87" stroke-width="1.6" opacity=".5"/>
      <!-- lower diamond gem with side points -->
      <path d="M0-24 23 14 0 43-23 14Z" fill="url(#gGem)"/>
      <path d="M0-24V43M-23 14H23" fill="none" stroke="#FBEAE2" stroke-width="2" opacity=".5"/>
      <path d="M0-24 23 14 0 43-23 14Z" fill="none" stroke="#C89A87" stroke-width="1.8" opacity=".5"/>
      <path d="M-23 14-34 7M23 14 34 7" fill="none" stroke="url(#gWide)" stroke-width="4"
            stroke-linecap="round"/>`, 'footer gems');

fs.writeFileSync(f, t);
console.log('applied');
