// One-shot generator for M7 cards.
// L10 G atoms (14): 5 memorize + write per atom (where templates exist) ≈ 80 cards
// L12 PC atoms (6): 5 memorize + write per atom (where templates exist) ≈ 35 cards
// L15 RW atoms (7): 5 memorize + write per atom (where templates exist) ≈ 50 cards
// Q3 sims: 15 entity variants × 3 cards each (1 fill + 1 complete + 1 free) = 45 cards
// Total ~210 new cards.
//
// Run: npx tsx build/gen-l10-l12-l15-q3.ts (appends to data/cards.json)

import { readFileSync, writeFileSync } from 'fs';
import yaml from 'js-yaml';
import { glob } from 'glob';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const CARDS_PATH = resolve(ROOT, 'data/cards.json');

interface RenderHints {
  memorize_seed_phrases?: string[];
  write_L1_fill?: { template?: string; blank_value?: string };
  write_L2_complete?: { template?: string; blank_value?: string };
  write_L3_free_spec?: string;
}

interface Outline {
  id: string;
  fact: string;
  level: number;
  status: string;
  render_hints?: RenderHints;
  lint?: { forbid_tokens?: string[] };
}

interface MemorizeCardOut {
  type: 'memorize';
  atomId: string;
  fact: string;
  flashSeconds: number;
  mode: 'race' | 'recall';
  keyChecks: string[];
  explanation: string;
}

interface WriteCardOut {
  type: 'write';
  atomId: string;
  level: 1 | 2 | 3;
  spec: string;
  template?: string;
  expectedAnswer: string;
  keyChecks: string[];
  forbidden?: string[];
  explanation: string;
}

type CardOut = MemorizeCardOut | WriteCardOut;

function deriveKeyChecks(fact: string): string[] {
  const STOP = new Set(['a', 'an', 'the', 'is', 'are', 'be', 'to', 'in', 'on', 'of', 'or', 'and', 'with', 'by', 'for', 'as', 'at', 'it']);
  const words = fact
    .toLowerCase()
    .replace(/[(){};.,]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w))
    .slice(0, 4);
  return words.slice(0, Math.min(3, Math.max(2, words.length)));
}

function loadOutlines(): Outline[] {
  const files = glob.sync('outlines/**/*.yml', { cwd: ROOT });
  return files
    .map((f) => yaml.load(readFileSync(resolve(ROOT, f), 'utf8')) as Outline)
    .filter((o) => o && o.status === 'locked');
}

function memorizeCardsFor(o: Outline): MemorizeCardOut[] {
  const seeds = o.render_hints?.memorize_seed_phrases ?? [o.fact];
  return seeds.slice(0, 5).map((s) => ({
    type: 'memorize',
    atomId: o.id,
    fact: s,
    flashSeconds: 3,
    mode: 'recall' as const,
    keyChecks: deriveKeyChecks(s),
    explanation: o.fact + '. (Per outline acceptance criteria.)',
  }));
}

function writeCardsForAtom(o: Outline): WriteCardOut[] {
  const cards: WriteCardOut[] = [];
  const rh = o.render_hints;
  if (!rh) return cards;
  const forbid = o.lint?.forbid_tokens ?? [];

  if (rh.write_L1_fill?.template && rh.write_L1_fill?.blank_value) {
    cards.push({
      type: 'write',
      atomId: o.id,
      level: 1,
      spec: 'Fill the blank to complete this code:',
      template: rh.write_L1_fill.template,
      expectedAnswer: rh.write_L1_fill.blank_value,
      keyChecks: [rh.write_L1_fill.blank_value.replace(/[;{}]/g, '').trim().toLowerCase()].filter(Boolean),
      forbidden: forbid.length > 0 ? forbid : undefined,
      explanation: o.fact,
    });
  }

  if (rh.write_L2_complete?.template && rh.write_L2_complete?.blank_value) {
    cards.push({
      type: 'write',
      atomId: o.id,
      level: 2,
      spec: 'Complete this code:',
      template: rh.write_L2_complete.template,
      expectedAnswer: rh.write_L2_complete.blank_value,
      keyChecks: deriveKeyChecks(rh.write_L2_complete.blank_value).filter((k) => k.length > 1),
      forbidden: forbid.length > 0 ? forbid : undefined,
      explanation: o.fact,
    });
  }

  if (rh.write_L3_free_spec) {
    cards.push({
      type: 'write',
      atomId: o.id,
      level: 3,
      spec: rh.write_L3_free_spec,
      expectedAnswer: '<freeform>',
      keyChecks: [],
      forbidden: forbid.length > 0 ? forbid : undefined,
      explanation: o.fact,
    });
  }

  return cards;
}

// Q3 entity variants — match Q2 entities for consistency
interface Q3Variant {
  entity: string;
  funcName: string;
  fields: { type: string; name: string }[];
}

const Q3_VARIANTS: Q3Variant[] = [
  { entity: 'computer_data', funcName: 'read_computers', fields: [{ type: 'int', name: 'id' }, { type: 'string', name: 'description' }, { type: 'string', name: 'location' }] },
  { entity: 'student_data', funcName: 'read_students', fields: [{ type: 'int', name: 'id' }, { type: 'string', name: 'name' }, { type: 'string', name: 'course' }] },
  { entity: 'employee_data', funcName: 'read_employees', fields: [{ type: 'int', name: 'id' }, { type: 'string', name: 'name' }, { type: 'string', name: 'department' }] },
  { entity: 'vehicle_data', funcName: 'read_vehicles', fields: [{ type: 'int', name: 'year' }, { type: 'string', name: 'make' }, { type: 'string', name: 'model' }] },
  { entity: 'sensor_data', funcName: 'read_sensors', fields: [{ type: 'int', name: 'id' }, { type: 'string', name: 'type' }, { type: 'string', name: 'location' }] },
  { entity: 'book_data', funcName: 'read_books', fields: [{ type: 'int', name: 'year' }, { type: 'string', name: 'title' }, { type: 'string', name: 'author' }] },
  { entity: 'patient_record', funcName: 'read_patients', fields: [{ type: 'int', name: 'id' }, { type: 'string', name: 'name' }, { type: 'string', name: 'ward' }] },
  { entity: 'product_data', funcName: 'read_products', fields: [{ type: 'int', name: 'code' }, { type: 'string', name: 'name' }, { type: 'string', name: 'category' }] },
  { entity: 'event_data', funcName: 'read_events', fields: [{ type: 'int', name: 'id' }, { type: 'string', name: 'date' }, { type: 'string', name: 'venue' }] },
  { entity: 'account_data', funcName: 'read_accounts', fields: [{ type: 'int', name: 'number' }, { type: 'string', name: 'holder' }, { type: 'string', name: 'branch' }] },
  { entity: 'movie_data', funcName: 'read_movies', fields: [{ type: 'int', name: 'id' }, { type: 'string', name: 'title' }, { type: 'string', name: 'genre' }] },
  { entity: 'song_data', funcName: 'read_songs', fields: [{ type: 'int', name: 'id' }, { type: 'string', name: 'title' }, { type: 'string', name: 'artist' }] },
  { entity: 'course_data', funcName: 'read_courses', fields: [{ type: 'int', name: 'code' }, { type: 'string', name: 'name' }, { type: 'string', name: 'instructor' }] },
  { entity: 'ticket_data', funcName: 'read_tickets', fields: [{ type: 'int', name: 'id' }, { type: 'string', name: 'event' }, { type: 'string', name: 'seat' }] },
  { entity: 'order_data', funcName: 'read_orders', fields: [{ type: 'int', name: 'id' }, { type: 'string', name: 'customer' }, { type: 'string', name: 'status' }] },
];

function q3SimCards(): WriteCardOut[] {
  const cards: WriteCardOut[] = [];

  for (const v of Q3_VARIANTS) {
    const cinLines = v.fields.map((f) => `        cin >> list[i].${f.name};`).join('\n');
    const fullFunc = `void ${v.funcName}(${v.entity} &list[], int count) {
    for (int i = 0; i < count; i++) {
${cinLines}
    }
}`;

    // L1 fill: the & in &list[]
    cards.push({
      type: 'write',
      atomId: 'PC-04',
      level: 1,
      spec: `Q3 sim — ${v.funcName}: fill the reference operator`,
      template: `void ${v.funcName}(${v.entity} ___list[], int count) {\n    for (int i = 0; i < count; i++) {\n${cinLines}\n    }\n}`,
      expectedAnswer: '&',
      keyChecks: ['&'],
      forbidden: ['*'],
      explanation: `Q3 always uses & before list[]. SIT102 idiom: void f(T &list[], int count).`,
    });

    // L2 complete: write the cin loop body
    cards.push({
      type: 'write',
      atomId: 'RW-05',
      level: 2,
      spec: `Q3 sim — ${v.funcName}: write the for-loop body that reads each field via cin`,
      template: `void ${v.funcName}(${v.entity} &list[], int count) {\n    for (int i = 0; i < count; i++) {\n        ___\n    }\n}`,
      expectedAnswer: v.fields.map((f) => `cin >> list[i].${f.name};`).join('\n        '),
      keyChecks: ['cin', '>>', 'list[i]', ...v.fields.map((f) => f.name)],
      forbidden: ['cin <<'],
      explanation: `One cin per struct field; reads stdin into list[i].field.`,
    });

    // L3 free-form: full function
    cards.push({
      type: 'write',
      atomId: 'RW-01',
      level: 3,
      spec: `Q3 sim — write a function ${v.funcName} that reads ${v.fields.length} fields per element from stdin into a ${v.entity} array. Signature must use & on the array param. Read fields in order: ${v.fields.map((f) => f.name).join(', ')}.`,
      expectedAnswer: fullFunc,
      keyChecks: ['void', v.funcName, '&list[]', 'int count', 'for', 'i = 0', 'i < count', 'i++', 'cin', '>>', ...v.fields.map((f) => `list[i].${f.name}`)],
      forbidden: ['*list', 'cin <<'],
      explanation: `Q3 archetype: void + & on array param + for-loop + cin per field.`,
    });
  }

  return cards;
}

function main() {
  const outlines = loadOutlines();
  const m7Outlines = outlines.filter((o) => o.level === 10 || o.level === 12 || o.level === 15);

  const newCards: CardOut[] = [];
  for (const o of m7Outlines) {
    newCards.push(...memorizeCardsFor(o));
    newCards.push(...writeCardsForAtom(o));
  }

  newCards.push(...q3SimCards());

  const existing = JSON.parse(readFileSync(CARDS_PATH, 'utf8')) as unknown[];
  const merged = [...existing, ...newCards];

  writeFileSync(CARDS_PATH, JSON.stringify(merged, null, 2));
  console.log(`generated ${newCards.length} new cards.`);
  console.log(`  - L10+L12+L15 atom cards: ${newCards.length - 45}`);
  console.log(`  - Q3 sims: 45`);
  console.log(`total cards: ${merged.length}`);
}

main();
