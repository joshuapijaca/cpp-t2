import yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { glob } from 'glob';
import { resolve } from 'path';

const ROOT = process.cwd();
const STUBS = [
  'CM-Q4-return-wrong-value',
  'CM-Q4-read-count-after-call',
  'CM-Q4-MAX-as-define',
  'CM-Q1-mystery-wrong-type',
  'CM-Q1-array-no-size',
  'CM-guesses-from-literals',
  'CM-F22e-1',
  'CM-F22d-3',
  'CM-F22b-3',
  'CM-F18a-2',
  'CM-F13b-2',
  'CM-F12c',
  'CM-confuses-panel-with-output',
  'CM-Q4-arg-order-swap',
  'CM-Q1-wrong-return-type',
  'CM-no-separate-compile-step',
  'CM-F22e-3',
  'CM-F19c'
];

const cardFiles = glob.sync('data/v2/cards/**/*.yml', { cwd: ROOT });
const byCM = new Map();
for (const f of cardFiles) {
  let raw;
  try { raw = yaml.load(readFileSync(resolve(ROOT, f), 'utf8')); }
  catch { continue; }
  const arr = Array.isArray(raw) ? raw : [raw];
  for (const r of arr) {
    if (r && r.commonMistakeIds && Array.isArray(r.commonMistakeIds)) {
      for (const cm of r.commonMistakeIds) {
        if (STUBS.includes(cm)) {
          if (!byCM.has(cm)) byCM.set(cm, []);
          byCM.get(cm).push({ file: f, id: r.id, type: r.type, atomId: r.atomId, qTags: r.qTags, stage: r.stage, prompt: r.prompt?.slice(0, 200) });
        }
      }
    }
  }
}

for (const stub of STUBS) {
  console.log('\n===', stub, '===');
  const items = byCM.get(stub) || [];
  console.log(`  card count: ${items.length}`);
  items.forEach(i => {
    console.log(`   - file: ${i.file}`);
    console.log(`     id: ${i.id} | type: ${i.type} | atomId: ${i.atomId} | qTags: ${JSON.stringify(i.qTags)} | stage: ${i.stage}`);
    if (i.prompt) console.log(`     prompt: ${i.prompt.replace(/\n/g, ' ')}`);
  });
}
