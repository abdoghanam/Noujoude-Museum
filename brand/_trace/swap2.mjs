import fs from 'fs';
const f = 'brand/noujoude-monogram-seal.svg';
let t = fs.readFileSync(f, 'utf8');
const all = fs.readFileSync('brand/_trace/br.txt', 'utf8').split('\n--\n');
const fmt = s => s.replace(/scale\(0?\.(\d+)\)/g, 'scale(.$1)').replace(/scale\(0\.(\d+)\)/g, 'scale(.$1)')
                  .replace(/scale\((\d)\.00\)/g, 'scale($1)').replace(/scale\(1\)/g, 'scale(1)')
                  .split('\n').map(l => '        ' + l.trim()).join('\n');
const leaves = fmt(all[0].split('\n').slice(1).filter(l => l.includes('#leaf')).join('\n'));
const berries = fmt(all[1].trim());
const rep = (re, out, name) => { if (!re.test(t)) { console.error('NO MATCH ' + name); process.exit(1); } t = t.replace(re, () => out); };
rep(/<g id="branch-leaves">[\s\S]*?<\/g>/, `<g id="branch-leaves">\n${leaves}\n      </g>`, 'leaves');
rep(/<g id="branch-berries">[\s\S]*?<\/g>/, `<g id="branch-berries">\n${berries}\n      </g>`, 'berries');
// stem path: keep the element, swap only its d attribute (function form → no $-substitution)
const stem = all[0].split('\n')[0].replace(/^STEM\s+/, '').trim();
if (!/ id="branch-stem"/.test(t)) { console.error('NO MATCH stem'); process.exit(1); }
t = t.replace(/(<path id="branch-stem"[\s\S]*?\sd=")[^"]*(")/, (m, a, b) => a + stem + b);
// the stem geometry changed, so the hand-written "curves in to r 308 at the tip" note is stale
t = t.replace(/stem r ≈ 358, sweeping in to r 308 at the bottom tip · leaf tips r ≈ 410/,
              'stem r 358 (arc a −46…58) curving in to r 308 at the tip · leaf tips r 396…429');
fs.writeFileSync(f, t);
console.log('ok');
