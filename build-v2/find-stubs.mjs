import yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { glob } from 'glob';
import { resolve, basename } from 'path';

const ROOT = process.cwd();
const files = glob.sync('data/v2/common-mistakes/*.yml', { cwd: ROOT });
const stubs = [];
const cardsByCM = new Map();

const cardFiles = glob.sync('data/v2/cards/**/*.yml', { cwd: ROOT });
for (const f of cardFiles) {
  let raw;
  try { raw = yaml.load(readFileSync(resolve(ROOT, f), 'utf8')); }
  catch { continue; }
  const arr = Array.isArray(raw) ? raw : [raw];
  for (const r of arr) {
    if (r && r.commonMistakeIds && Array.isArray(r.commonMistakeIds)) {
      for (const cm of r.commonMistakeIds) {
        cardsByCM.set(cm, (cardsByCM.get(cm) ?? 0) + 1);
      }
    }
  }
}

for (const f of files) {
  let raw;
  try { raw = yaml.load(readFileSync(resolve(ROOT, f), 'utf8')); }
  catch { continue; }
  let id = (raw && raw.id) || basename(f, '.yml');
  const refStr = raw?.source?.ref ?? '';
  const descStr = (raw?.description ?? '') + ' ' + (raw?.whyItHappens ?? '');
  const isStub = raw?.stub === true ||
                 /auto-?stub|auto-?generated/i.test(refStr) ||
                 /auto-?stub|auto-?generated|^Stub /m.test(descStr);
  if (isStub) {
    stubs.push({ id, file: f, cardCount: cardsByCM.get(id) ?? 0, refStr });
  }
}

console.log('Total stub CMs:', stubs.length);
console.log('Stubs with <3 cards:', stubs.filter(s => s.cardCount < 3).length);
console.log('Stubs with 0 cards:', stubs.filter(s => s.cardCount === 0).length);
console.log('\nFirst 25 stubs sorted by card count:');
stubs.sort((a, b) => a.cardCount - b.cardCount).slice(0, 25).forEach(s => {
  console.log(`  ${s.id} (cards=${s.cardCount}, ref='${s.refStr}')`);
});
