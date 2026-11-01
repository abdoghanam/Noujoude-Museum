import fs from 'node:fs';
const lines = fs.readFileSync('reference/Noujoude_Master_Specification_EN.md', 'utf8').split(/\r?\n/);
for (const spec of process.argv.slice(2)) {
  const [a, b] = spec.split('-').map(Number);
  for (let i = a; i <= (b || a); i++) {
    const t = (lines[i - 1] ?? '').trim();
    console.log(`${i}: ${t.slice(0, 170)}`);
  }
  console.log('········');
}
