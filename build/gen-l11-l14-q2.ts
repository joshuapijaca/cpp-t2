// One-shot generator for M6 cards.
// L11 T atoms: 12 atoms × 5 memorize = 60 cards
// L14 SW atoms: 5 atoms × 5 memorize + 8 write per atom (3 fill + 3 complete + 2 free) = 65 cards
// Q2 sims: 15 entity variants × 3 cards each (1 fill + 1 complete + 1 free) = 45 cards
// Total ~170 new cards.
//
// Run: npx tsx build/gen-l11-l14-q2.ts (appends to data/cards.json)

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
  acceptance?: { memorize?: string[] };
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

// === keyCheck heuristic: pull 2-3 distinctive lowercase tokens from fact ===
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

// === Memorize cards from outline ===
function memorizeCardsFor(o: Outline): MemorizeCardOut[] {
  const seeds = o.render_hints?.memorize_seed_phrases ?? [o.fact];
  return seeds.slice(0, 5).map((s) => ({
    type: 'memorize',
    atomId: o.id,
    fact: s,
    flashSeconds: 3,
    mode: 'recall' as const,
    keyChecks: deriveKeyChecks(s),
    explanation: o.fact + '. (Auto-explanation: see outline acceptance criteria.)',
  }));
}

// === Per-atom write cards from outline render_hints ===
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
      spec: `Fill the blank to complete this code:`,
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
      spec: `Complete this code:`,
      template: rh.write_L2_complete.template,
      expectedAnswer: rh.write_L2_complete.blank_value,
      keyChecks: deriveKeyChecks(rh.write_L2_complete.blank_value).filter((k) => k.length > 1),
      forbidden: forbid.length > 0 ? forbid : undefined,
      explanation: o.fact,
    });
  }

  if (rh.write_L3_free_spec) {
    // Reasonable expected answer for SW atoms only; T atoms typically don't have L3 specs
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

// === Q2 entity variants ===
interface Q2Variant {
  entity: string;
  field1: { type: string; name: string };
  field2: { type: string; name: string };
  field3: { type: string; name: string };
}

const Q2_VARIANTS: Q2Variant[] = [
  { entity: 'computer_data', field1: { type: 'int', name: 'id' }, field2: { type: 'string', name: 'description' }, field3: { type: 'string', name: 'location' } },
  { entity: 'student_data', field1: { type: 'int', name: 'id' }, field2: { type: 'string', name: 'name' }, field3: { type: 'string', name: 'course' } },
  { entity: 'employee_data', field1: { type: 'int', name: 'id' }, field2: { type: 'string', name: 'name' }, field3: { type: 'string', name: 'department' } },
  { entity: 'vehicle_data', field1: { type: 'int', name: 'year' }, field2: { type: 'string', name: 'make' }, field3: { type: 'string', name: 'model' } },
  { entity: 'sensor_data', field1: { type: 'int', name: 'id' }, field2: { type: 'string', name: 'type' }, field3: { type: 'string', name: 'location' } },
  { entity: 'book_data', field1: { type: 'int', name: 'year' }, field2: { type: 'string', name: 'title' }, field3: { type: 'string', name: 'author' } },
  { entity: 'patient_record', field1: { type: 'int', name: 'id' }, field2: { type: 'string', name: 'name' }, field3: { type: 'string', name: 'ward' } },
  { entity: 'product_data', field1: { type: 'int', name: 'code' }, field2: { type: 'string', name: 'name' }, field3: { type: 'string', name: 'category' } },
  { entity: 'event_data', field1: { type: 'int', name: 'id' }, field2: { type: 'string', name: 'date' }, field3: { type: 'string', name: 'venue' } },
  { entity: 'account_data', field1: { type: 'int', name: 'number' }, field2: { type: 'string', name: 'holder' }, field3: { type: 'string', name: 'branch' } },
  { entity: 'movie_data', field1: { type: 'int', name: 'id' }, field2: { type: 'string', name: 'title' }, field3: { type: 'string', name: 'genre' } },
  { entity: 'song_data', field1: { type: 'int', name: 'id' }, field2: { type: 'string', name: 'title' }, field3: { type: 'string', name: 'artist' } },
  { entity: 'course_data', field1: { type: 'int', name: 'code' }, field2: { type: 'string', name: 'name' }, field3: { type: 'string', name: 'instructor' } },
  { entity: 'ticket_data', field1: { type: 'int', name: 'id' }, field2: { type: 'string', name: 'event' }, field3: { type: 'string', name: 'seat' } },
  { entity: 'order_data', field1: { type: 'int', name: 'id' }, field2: { type: 'string', name: 'customer' }, field3: { type: 'string', name: 'status' } },
];

function q2SimCards(): WriteCardOut[] {
  const cards: WriteCardOut[] = [];

  for (const v of Q2_VARIANTS) {
    const fields = [v.field1, v.field2, v.field3];

    // L1 fill: complete the keyword
    cards.push({
      type: 'write',
      atomId: 'SW-01',
      level: 1,
      spec: `Q2 sim — ${v.entity}: fill the keyword`,
      template: `___ ${v.entity} {\n    ${v.field1.type} ${v.field1.name};\n    ${v.field2.type} ${v.field2.name};\n    ${v.field3.type} ${v.field3.name};\n};`,
      expectedAnswer: 'struct',
      keyChecks: ['struct'],
      forbidden: ['typedef', 'class'],
      explanation: `Q2 always asks for a struct definition. The keyword is "struct".`,
    });

    // L2 complete: write all 3 fields
    cards.push({
      type: 'write',
      atomId: 'SW-02',
      level: 2,
      spec: `Q2 sim — ${v.entity}: write the 3 fields`,
      template: `struct ${v.entity} {\n    ___\n};`,
      expectedAnswer: fields.map((f) => `${f.type} ${f.name};`).join('\n    '),
      keyChecks: fields.flatMap((f) => [f.type, f.name]),
      forbidden: ['typedef', 'class'],
      explanation: `Each field: type then name then ;. Order matches spec.`,
    });

    // L3 free-form: full struct
    cards.push({
      type: 'write',
      atomId: 'SW-01',
      level: 3,
      spec: `Q2 sim — write the full struct ${v.entity} with fields:\n  - ${v.field1.type} ${v.field1.name}\n  - ${v.field2.type} ${v.field2.name}\n  - ${v.field3.type} ${v.field3.name}`,
      expectedAnswer: `struct ${v.entity} {\n    ${v.field1.type} ${v.field1.name};\n    ${v.field2.type} ${v.field2.name};\n    ${v.field3.type} ${v.field3.name};\n};`,
      keyChecks: ['struct', v.entity, v.field1.type, v.field1.name, v.field2.type, v.field2.name, v.field3.type, v.field3.name, '};'],
      forbidden: ['typedef', 'class'],
      explanation: `Standard Q2 struct definition. struct + name + 3 fields + };.`,
    });
  }

  return cards;
}

function main() {
  const outlines = loadOutlines();
  const l11_l14 = outlines.filter((o) => o.level === 11 || o.level === 14);

  const newCards: CardOut[] = [];
  for (const o of l11_l14) {
    newCards.push(...memorizeCardsFor(o));
    newCards.push(...writeCardsForAtom(o));
  }

  newCards.push(...q2SimCards());

  const existing = JSON.parse(readFileSync(CARDS_PATH, 'utf8')) as unknown[];
  const merged = [...existing, ...newCards];

  writeFileSync(CARDS_PATH, JSON.stringify(merged, null, 2));
  console.log(`generated ${newCards.length} new cards.`);
  console.log(`  - L11 + L14 atom cards: ${newCards.length - 45}`);
  console.log(`  - Q2 sims: 45`);
  console.log(`total cards: ${merged.length}`);
}

main();
