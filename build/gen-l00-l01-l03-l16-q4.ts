// One-shot generator for M8 cards.
// L00 + L01 + L03 + L16 atom cards (memorize + write where templates exist) ≈ 200 cards
// Q4 sims: 15 entity variants × 3 cards each (1 fill + 1 complete + 1 free) = 45 cards
// Total ~245 new cards.
//
// Run: npx tsx build/gen-l00-l01-l03-l16-q4.ts (appends to data/cards.json)

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
    explanation: o.fact + '. (Per outline.)',
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

interface Q4Variant {
  entity: string;
  funcName: string;
  fields: { type: string; name: string }[];
}

const Q4_VARIANTS: Q4Variant[] = [
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

function fmtSpec(f: { type: string; name: string }): string {
  if (f.type === 'int') return '%d';
  return '%s';
}

function fmtArg(f: { type: string; name: string }): string {
  if (f.type === 'int') return `list[i].${f.name}`;
  return `list[i].${f.name}.c_str()`;
}

function q4SimCards(): WriteCardOut[] {
  const cards: WriteCardOut[] = [];

  for (const v of Q4_VARIANTS) {
    const fmtString = v.fields.map(fmtSpec).join(' ') + '\\n';
    const args = v.fields.map(fmtArg).join(', ');
    const printfLine = `printf("${fmtString}", ${args});`;

    const fullMain = `int main() {
    const int MAX = 100;
    ${v.entity} list[MAX];
    int count;
    cout << "How many? ";
    cin >> count;
    ${v.funcName}(list, count);
    for (int i = 0; i < count; i++) {
        ${printfLine}
    }
    return 0;
}`;

    // L1 fill: const keyword
    cards.push({
      type: 'write',
      atomId: 'MW-02',
      level: 1,
      spec: `Q4 sim — ${v.entity}: fill the const keyword for MAX`,
      template: `int main() {\n    ___ int MAX = 100;\n    ${v.entity} list[MAX];\n    int count;\n    cin >> count;\n    ${v.funcName}(list, count);\n    return 0;\n}`,
      expectedAnswer: 'const',
      keyChecks: ['const'],
      forbidden: undefined,
      explanation: 'const int MAX defines the array size constant.',
    });

    // L2 complete: print loop body
    cards.push({
      type: 'write',
      atomId: 'MW-08',
      level: 2,
      spec: `Q4 sim — ${v.entity}: write the printf line for one record`,
      template: `for (int i = 0; i < count; i++) {\n    ___\n}`,
      expectedAnswer: printfLine,
      keyChecks: ['printf', 'list[i]', ...v.fields.map((f) => f.name)],
      forbidden: ['cout'],
      explanation: `printf with format ${fmtString} and ${v.fields.length} args.`,
    });

    // L3 free-form: full main
    cards.push({
      type: 'write',
      atomId: 'MW-01',
      level: 3,
      spec: `Q4 sim — write a full main() that:\n  - declares const int MAX = 100\n  - declares ${v.entity} list[MAX]\n  - reads count from cin\n  - calls ${v.funcName}(list, count)\n  - prints each record with printf using ${fmtString}\n  - returns 0`,
      expectedAnswer: fullMain,
      keyChecks: ['int main', 'const int MAX', `${v.entity} list[MAX]`, 'int count', 'cin', '>>', `${v.funcName}(list, count)`, 'for', 'i = 0', 'i < count', 'printf', 'return 0'],
      forbidden: undefined,
      explanation: `Q4 archetype: const + array + cin + read_X call + printf loop + return 0.`,
    });
  }

  return cards;
}

function main() {
  const outlines = loadOutlines();
  const m8Outlines = outlines.filter((o) => o.level === 0 || o.level === 1 || o.level === 3 || o.level === 16);

  const newCards: CardOut[] = [];
  for (const o of m8Outlines) {
    newCards.push(...memorizeCardsFor(o));
    newCards.push(...writeCardsForAtom(o));
  }

  newCards.push(...q4SimCards());

  const existing = JSON.parse(readFileSync(CARDS_PATH, 'utf8')) as unknown[];
  const merged = [...existing, ...newCards];

  writeFileSync(CARDS_PATH, JSON.stringify(merged, null, 2));
  console.log(`generated ${newCards.length} new cards.`);
  console.log(`  - L00+L01+L03+L16 atom cards: ${newCards.length - 45}`);
  console.log(`  - Q4 sims: 45`);
  console.log(`total cards: ${merged.length}`);
}

main();
