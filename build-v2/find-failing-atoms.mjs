import yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { glob } from 'glob';
import { dirname } from 'path';

const failing = ['M-02','R-05','R-04','L-26','L-24','L-23c','L-23a','C-30','C-28','C-21','C-20','C-19','C-18','C-17','C-16','C-15','C-13','C-12','C-11','C-10','C-09','C-08','C-07','C-05','T-07','T-06','T-05','T-04','T-08','T-03','T-02','T-01','F-24','F-23','F-25','F-22e','F-13'];

const files = glob.sync('data/v2/cards/**/*.yml', { cwd: '.' });
const map = {};
for (const f of files) {
  let raw;
  try { raw = yaml.load(readFileSync(f, 'utf8')); } catch { continue; }
  const arr = Array.isArray(raw) ? raw : [raw];
  for (const r of arr) {
    if (r?.atomId && failing.includes(r.atomId)) {
      const dir = dirname(f);
      if (!map[r.atomId]) map[r.atomId] = { dir, cards: [], types: new Set() };
      map[r.atomId].cards.push(f);
      map[r.atomId].types.add(r.type);
    }
  }
}
for (const id of failing) {
  const m = map[id] || { dir: 'NOT FOUND', cards: [], types: new Set() };
  console.log(`${id}\tdir=${m.dir}\tcards=${m.cards.length}\ttypes=${[...m.types].join(',')}`);
}
