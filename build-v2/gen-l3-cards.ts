// =====================================================================
// build-v2/gen-l3-cards.ts
// Generator for L3 Q3 (read_X function) cards.
// Author: SA-L3-Q3
// =====================================================================
// Emits 390 hand-templated YAML card files into:
//   cpp-t2/data/v2/cards/L3/{S1-Tour,S2-Template,S3-Components/{A,B,C,D,E},
//                            S4-Compose,S5-Variations,S6-Speed}/
// =====================================================================

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..');
const OUT = resolve(ROOT, 'data/v2/cards/L3');

function w(rel: string, content: string) {
  const p = resolve(OUT, rel);
  if (!existsSync(dirname(p))) mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
}

// ---------- Entity catalog (struct + 3 fields) ----------
interface Entity {
  name: string;          // "desk"
  plural: string;        // "desks"
  list: string;          // "desks"  (list parameter name in read_X)
  count: string;         // "number_to_read"
  fields: { name: string; type: string; prompt: string }[];
}
const E_DESK: Entity = {
  name: 'desk', plural: 'desks', list: 'desks', count: 'number_to_read',
  fields: [
    { name: 'width',  type: 'double', prompt: 'Width: ' },
    { name: 'height', type: 'double', prompt: 'Height: ' },
    { name: 'depth',  type: 'double', prompt: 'Depth: ' },
  ],
};
const E_COMP: Entity = {
  name: 'computer', plural: 'computers', list: 'computers', count: 'number_to_read',
  fields: [
    { name: 'cpu_speed', type: 'double', prompt: 'CPU speed (GHz): ' },
    { name: 'ram_gb',    type: 'int',    prompt: 'RAM (GB): ' },
    { name: 'price',     type: 'double', prompt: 'Price ($): ' },
  ],
};
const E_BOOK: Entity = {
  name: 'book', plural: 'books', list: 'books', count: 'number_to_read',
  fields: [
    { name: 'pages',  type: 'int',    prompt: 'Pages: ' },
    { name: 'price',  type: 'double', prompt: 'Price: ' },
    { name: 'rating', type: 'double', prompt: 'Rating: ' },
  ],
};
const E_CAR: Entity = {
  name: 'car', plural: 'cars', list: 'cars', count: 'number_to_read',
  fields: [
    { name: 'engine_l', type: 'double', prompt: 'Engine litres: ' },
    { name: 'doors',    type: 'int',    prompt: 'Doors: ' },
    { name: 'mileage',  type: 'double', prompt: 'Mileage (km): ' },
  ],
};
const E_PHONE: Entity = {
  name: 'phone', plural: 'phones', list: 'phones', count: 'number_to_read',
  fields: [
    { name: 'storage_gb', type: 'int',    prompt: 'Storage (GB): ' },
    { name: 'battery_mah', type: 'int',   prompt: 'Battery (mAh): ' },
    { name: 'price',      type: 'double', prompt: 'Price: ' },
  ],
};
const E_PLANT: Entity = {
  name: 'plant', plural: 'plants', list: 'plants', count: 'number_to_read',
  fields: [
    { name: 'height_cm', type: 'double', prompt: 'Height (cm): ' },
    { name: 'leaves',    type: 'int',    prompt: 'Leaves: ' },
    { name: 'water_ml',  type: 'double', prompt: 'Water (ml): ' },
  ],
};
const E_DOG: Entity = {
  name: 'dog', plural: 'dogs', list: 'dogs', count: 'number_to_read',
  fields: [
    { name: 'age_yrs', type: 'int',    prompt: 'Age (yrs): ' },
    { name: 'weight_kg', type: 'double', prompt: 'Weight (kg): ' },
    { name: 'visits', type: 'int',    prompt: 'Vet visits: ' },
  ],
};
const E_HOUSE: Entity = {
  name: 'house', plural: 'houses', list: 'houses', count: 'number_to_read',
  fields: [
    { name: 'bedrooms', type: 'int',    prompt: 'Bedrooms: ' },
    { name: 'area_m2',  type: 'double', prompt: 'Area (m^2): ' },
    { name: 'price',    type: 'double', prompt: 'Price: ' },
  ],
};
const E_BIKE: Entity = {
  name: 'bike', plural: 'bikes', list: 'bikes', count: 'number_to_read',
  fields: [
    { name: 'gears',     type: 'int',    prompt: 'Gears: ' },
    { name: 'weight_kg', type: 'double', prompt: 'Weight (kg): ' },
    { name: 'price',     type: 'double', prompt: 'Price: ' },
  ],
};
const E_PIZZA: Entity = {
  name: 'pizza', plural: 'pizzas', list: 'pizzas', count: 'number_to_read',
  fields: [
    { name: 'diameter_cm', type: 'double', prompt: 'Diameter (cm): ' },
    { name: 'toppings',    type: 'int',    prompt: 'Toppings: ' },
    { name: 'price',       type: 'double', prompt: 'Price: ' },
  ],
};
const E_FRIDGE: Entity = {
  name: 'fridge', plural: 'fridges', list: 'fridges', count: 'number_to_read',
  fields: [
    { name: 'volume_l', type: 'double', prompt: 'Volume (L): ' },
    { name: 'shelves',  type: 'int',    prompt: 'Shelves: ' },
    { name: 'price',    type: 'double', prompt: 'Price: ' },
  ],
};
const E_GAME: Entity = {
  name: 'game', plural: 'games', list: 'games', count: 'number_to_read',
  fields: [
    { name: 'players',  type: 'int',    prompt: 'Players: ' },
    { name: 'duration', type: 'double', prompt: 'Duration (h): ' },
    { name: 'price',    type: 'double', prompt: 'Price: ' },
  ],
};
const E_BOAT: Entity = {
  name: 'boat', plural: 'boats', list: 'boats', count: 'number_to_read',
  fields: [
    { name: 'length_m', type: 'double', prompt: 'Length (m): ' },
    { name: 'capacity', type: 'int',    prompt: 'Capacity: ' },
    { name: 'price',    type: 'double', prompt: 'Price: ' },
  ],
};
const E_CHAIR: Entity = {
  name: 'chair', plural: 'chairs', list: 'chairs', count: 'number_to_read',
  fields: [
    { name: 'height_cm', type: 'double', prompt: 'Height (cm): ' },
    { name: 'legs',      type: 'int',    prompt: 'Legs: ' },
    { name: 'weight_kg', type: 'double', prompt: 'Weight (kg): ' },
  ],
};
const E_LAPTOP: Entity = {
  name: 'laptop', plural: 'laptops', list: 'laptops', count: 'number_to_read',
  fields: [
    { name: 'cpu_speed', type: 'double', prompt: 'CPU speed (GHz): ' },
    { name: 'ram_gb',    type: 'int',    prompt: 'RAM (GB): ' },
    { name: 'price',     type: 'double', prompt: 'Price: ' },
  ],
};
const E_TABLET: Entity = {
  name: 'tablet', plural: 'tablets', list: 'tablets', count: 'number_to_read',
  fields: [
    { name: 'screen_in', type: 'double', prompt: 'Screen (in): ' },
    { name: 'storage_gb', type: 'int',   prompt: 'Storage (GB): ' },
    { name: 'price',     type: 'double', prompt: 'Price: ' },
  ],
};
const E_FAN: Entity = {
  name: 'fan', plural: 'fans', list: 'fans', count: 'number_to_read',
  fields: [
    { name: 'blade_cm', type: 'double', prompt: 'Blade (cm): ' },
    { name: 'speeds',   type: 'int',    prompt: 'Speeds: ' },
    { name: 'price',    type: 'double', prompt: 'Price: ' },
  ],
};
const E_DRONE: Entity = {
  name: 'drone', plural: 'drones', list: 'drones', count: 'number_to_read',
  fields: [
    { name: 'flight_min', type: 'double', prompt: 'Flight (min): ' },
    { name: 'rotors',     type: 'int',    prompt: 'Rotors: ' },
    { name: 'price',      type: 'double', prompt: 'Price: ' },
  ],
};
const E_KETTLE: Entity = {
  name: 'kettle', plural: 'kettles', list: 'kettles', count: 'number_to_read',
  fields: [
    { name: 'volume_l', type: 'double', prompt: 'Volume (L): ' },
    { name: 'watts',    type: 'int',    prompt: 'Watts: ' },
    { name: 'price',    type: 'double', prompt: 'Price: ' },
  ],
};
const E_MOUSE: Entity = {
  name: 'mouse', plural: 'mice', list: 'mice', count: 'number_to_read',
  fields: [
    { name: 'dpi',       type: 'int',    prompt: 'DPI: ' },
    { name: 'buttons',   type: 'int',    prompt: 'Buttons: ' },
    { name: 'weight_g',  type: 'double', prompt: 'Weight (g): ' },
  ],
};
const E_KEYBOARD: Entity = {
  name: 'keyboard', plural: 'keyboards', list: 'keyboards', count: 'number_to_read',
  fields: [
    { name: 'keys',     type: 'int',    prompt: 'Keys: ' },
    { name: 'layout_n', type: 'int',    prompt: 'Layout id: ' },
    { name: 'price',    type: 'double', prompt: 'Price: ' },
  ],
};
const E_HEADSET: Entity = {
  name: 'headset', plural: 'headsets', list: 'headsets', count: 'number_to_read',
  fields: [
    { name: 'driver_mm', type: 'double', prompt: 'Driver (mm): ' },
    { name: 'cable_m',   type: 'double', prompt: 'Cable (m): ' },
    { name: 'price',     type: 'double', prompt: 'Price: ' },
  ],
};
const ENTITIES: Entity[] = [
  E_DESK, E_COMP, E_BOOK, E_CAR, E_PHONE,
  E_PLANT, E_DOG, E_HOUSE, E_BIKE, E_PIZZA,
  E_FRIDGE, E_GAME, E_BOAT, E_CHAIR, E_LAPTOP,
  E_TABLET, E_FAN, E_DRONE, E_KETTLE, E_MOUSE,
  E_KEYBOARD, E_HEADSET,
];

// ---------- Render helpers ----------
function readFn(e: Entity): string {
  const lines: string[] = [];
  lines.push(`void read_${e.plural}(${e.name}_data &${e.list}[], int ${e.count})`);
  lines.push(`{`);
  lines.push(`  for (int i = 0; i < ${e.count}; i++)`);
  lines.push(`  {`);
  for (const f of e.fields) {
    lines.push(`    cout << "${f.prompt}";`);
    lines.push(`    cin >> ${e.list}[i].${f.name};`);
  }
  lines.push(`  }`);
  lines.push(`}`);
  return lines.join('\n');
}
function readFnNFields(e: Entity, n: number): string {
  const fs = e.fields.slice(0, n);
  const lines: string[] = [];
  lines.push(`void read_${e.plural}(${e.name}_data &${e.list}[], int ${e.count})`);
  lines.push(`{`);
  lines.push(`  for (int i = 0; i < ${e.count}; i++)`);
  lines.push(`  {`);
  for (const f of fs) {
    lines.push(`    cout << "${f.prompt}";`);
    lines.push(`    cin >> ${e.list}[i].${f.name};`);
  }
  lines.push(`  }`);
  lines.push(`}`);
  return lines.join('\n');
}

function structDef(e: Entity, n?: number): string {
  const fs = (n ? e.fields.slice(0, n) : e.fields);
  const lines: string[] = [`struct ${e.name}_data`, `{`];
  for (const f of fs) lines.push(`  ${f.type} ${f.name};`);
  lines.push(`};`);
  return lines.join('\n');
}

function yamlEscape(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

interface CardCommon {
  id: string; atomId: string; stage: number; type: string;
}

function header(c: CardCommon, kind?: string): string {
  return `# =====================================================================
# L3 / ${c.atomId} / ${c.type}${kind ? ' — ' + kind : ''}
# =====================================================================
id: "${c.id}"
schemaVersion: "v2"
atomId: "${c.atomId}"
qTags: ["Q3"]
stage: ${c.stage}
level: "L3"
type: "${c.type}"
`;
}

const SOURCE_V2 = `source:
  kind: "v2"
  ref: "cpp-t2/docs/16_test2_specific_redesign_v2.md#PART V"
`;
const SOURCE_PR = `source:
  kind: "practice"
  ref: "Test2-SIT102-practice-2026T1.txt — Q3 read_computers"
`;
const SOURCE_PFG = `source:
  kind: "pfg"
  ref: "Programming Fundamentals Guide § part-2/2-organising-code/1-tour/02-01-read-fns"
`;

const FOOTER = `status: "NEW"
authoringStatus: "DRAFT"
createdBy: "SA-L3-Q3"
`;

// ---------- S1 TOUR (30) ----------
function s1Tour() {
  const dir = 'S1-Tour';
  let n = 0;

  // 1 full V2.0 read_desks walkthrough
  const code1 = readFn(E_DESK);
  w(`${dir}/walk-01-desks.yml`, header({id:'L3-R00-walk-01', atomId:'R-00', stage:1, type:'WalkthroughCard'}, 'V2.0 read_desks tour') +
`stem: |
  Tour: full read_desks function. Read each line and predict its role.
  Hover the variables panel — it stays empty (no execution yet).
levelLabel: "L3 Q3 Tour — V2.0 read_desks"
fullCode: |
${indent(code1)}
steps:
  - line: 1
    code: "void read_desks(desk_data &desks[], int number_to_read)"
    annotation: "void = no return. read_desks = entity-named procedure. & means BY REFERENCE so the caller's array is filled. [] = parameter is an array."
    atomIds: ["F-22", "F-22a"]
  - line: 3
    code: "  for (int i = 0; i < number_to_read; i++)"
    annotation: "Count parameter is the bound, not SIZE. i takes 0..number_to_read-1 (half-open)."
    atomIds: ["F-18"]
  - line: 5
    code: "    cout << \\"Width: \\";"
    annotation: "cout prompt comes BEFORE the cin so the user sees what to type."
    atomIds: ["F-15"]
  - line: 6
    code: "    cin >> desks[i].width;"
    annotation: "cin >> desks[i].width — composite token: index [i] then .field. Skipping either is the #1 Q3 error."
    atomIds: ["F-21", "F-15"]
${SOURCE_V2}${FOOTER}`);
  n++;

  // 2 practice read_computers walkthrough
  const code2 = readFn(E_COMP);
  w(`${dir}/walk-02-computers.yml`, header({id:'L3-R00-walk-02', atomId:'R-00', stage:1, type:'WalkthroughCard'}, 'practice read_computers tour') +
`stem: |
  Practice-test shape: read_computers. Same skeleton, different surface tokens.
levelLabel: "L3 Q3 Tour — practice read_computers"
fullCode: |
${indent(code2)}
steps:
  - line: 1
    code: "void read_computers(computer_data &computers[], int number_to_read)"
    annotation: "Entity name swapped desks -> computers. Field types may include int + double mixed."
    atomIds: ["F-22", "F-22a"]
  - line: 3
    code: "  for (int i = 0; i < number_to_read; i++)"
    annotation: "Same for-loop pattern. Always parameter as bound."
    atomIds: ["F-18"]
  - line: 5
    code: "    cout << \\"CPU speed (GHz): \\";"
    annotation: "Prompt strings change but the pair pattern is identical."
    atomIds: ["F-15"]
${SOURCE_PR}${FOOTER}`);
  n++;

  // 3 worked read_books
  const code3 = readFn(E_BOOK);
  w(`${dir}/walk-03-books.yml`, header({id:'L3-R00-walk-03', atomId:'R-00', stage:1, type:'WalkthroughCard'}, 'worked read_books') +
`stem: |
  Worked example: read_books. Confirm you can map the skeleton to a third entity.
levelLabel: "L3 Q3 Tour — worked read_books"
fullCode: |
${indent(code3)}
steps:
  - line: 1
    code: "void read_books(book_data &books[], int number_to_read)"
    annotation: "books_data &books[], int number_to_read — three rotation axes from desks."
    atomIds: ["F-22", "F-22a"]
  - line: 5
    code: "    cout << \\"Pages: \\";"
    annotation: "First field 'pages' is an int — cin >> still works because >> is overloaded for int + double."
    atomIds: ["F-15"]
${SOURCE_V2}${FOOTER}`);
  n++;

  // 4-7: four more worked read_X variants
  const variants = [E_CAR, E_PHONE, E_PLANT, E_DOG];
  variants.forEach((e, idx) => {
    const code = readFn(e);
    w(`${dir}/walk-${String(4+idx).padStart(2,'0')}-${e.plural}.yml`, header({id:`L3-R00-walk-${String(4+idx).padStart(2,'0')}`, atomId:'R-00', stage:1, type:'WalkthroughCard'}, `worked read_${e.plural}`) +
`stem: |
  Worked example: read_${e.plural}. Confirm skeleton mapping.
levelLabel: "L3 Q3 Tour — worked read_${e.plural}"
fullCode: |
${indent(code)}
steps:
  - line: 1
    code: "void read_${e.plural}(${e.name}_data &${e.list}[], int ${e.count})"
    annotation: "${e.name}_data &${e.list}[], int ${e.count}."
    atomIds: ["F-22", "F-22a"]
  - line: 6
    code: "    cin >> ${e.list}[i].${e.fields[0]!.name};"
    annotation: "cin >> ${e.list}[i].${e.fields[0]!.name} — index then .field."
    atomIds: ["F-21", "F-15"]
${SOURCE_V2}${FOOTER}`);
    n++;
  });

  // 8-23: 16 SpotError MCQs
  const errors = [
    {bug:'cin >> desks[i]', fix:'cin >> desks[i].width', why:'Missing .field — cin would try to read into the whole struct, which fails to compile.'},
    {bug:'cin >> desks.width', fix:'cin >> desks[i].width', why:'Missing [i] — would try to read into the array as if it were a struct.'},
    {bug:'cin << desks[i].width', fix:'cin >> desks[i].width', why:'cin uses >>, not <<. Direction is INTO cin from the variable.'},
    {bug:'for (int i = 0; i <= number_to_read; i++)', fix:'for (int i = 0; i < number_to_read; i++)', why:'Off-by-one: <= reads one extra element past the end.'},
    {bug:'for (int i = 0; i < SIZE; i++)', fix:'for (int i = 0; i < number_to_read; i++)', why:'Wrong bound: must use the count parameter, not the array capacity.'},
    {bug:'void read_desks(desk_data desks[], int number_to_read)', fix:'void read_desks(desk_data &desks[], int number_to_read)', why:'Missing &: changes would not propagate to caller.'},
    {bug:'void read_desks(desk_data &desks, int number_to_read)', fix:'void read_desks(desk_data &desks[], int number_to_read)', why:'Missing []: signature claims a single struct, not an array.'},
    {bug:'cin >> desks[0].width', fix:'cin >> desks[i].width', why:'Used [0] instead of [i] — every iteration would overwrite element 0.'},
    {bug:'int read_desks(desk_data &desks[], int number_to_read)', fix:'void read_desks(desk_data &desks[], int number_to_read)', why:'Wrong return type: read functions return void.'},
    {bug:'cout << "Width: " << endl; cin >> desks[i].width;', fix:'cout << "Width: "; cin >> desks[i].width;', why:'endl pushes prompt to next line — user input separated from prompt.'},
    {bug:'for (int i = 1; i <= number_to_read; i++)', fix:'for (int i = 0; i < number_to_read; i++)', why:'Both off-by-one bugs at once: starts at 1, exits at <=.'},
    {bug:'cin >> desks[i] . width', fix:'cin >> desks[i].width', why:'Spaces around dot are tolerated by C++ but visually error-prone — write it tight.'},
    {bug:'cin >> &desks[i].width', fix:'cin >> desks[i].width', why:'No & before the variable name in cin >>; the operator already takes a reference.'},
    {bug:'cout << "Width: "; cin << desks[i].width;', fix:'cout << "Width: "; cin >> desks[i].width;', why:'cin << is wrong direction — must be cin >>.'},
    {bug:'while (i < number_to_read)', fix:'for (int i = 0; i < number_to_read; i++)', why:'Off-template — Q3 invariant uses for, not while.'},
    {bug:'for (int i = 0; i < number_to_read; i--)', fix:'for (int i = 0; i < number_to_read; i++)', why:'i-- decrements forever — infinite loop.'},
  ];
  errors.forEach((er, idx) => {
    w(`${dir}/spot-${String(idx+1).padStart(2,'0')}.yml`, header({id:`L3-R00-spot-${String(idx+1).padStart(2,'0')}`, atomId:'R-00', stage:1, type:'MCQCard'}, 'spot the error') +
`stem: |
  Inside the read_desks loop, one line below is buggy. Pick the buggy form.
correct: "${yamlEscape(er.bug)}"
distractors:
  - "${yamlEscape(er.fix)}"
  - "${yamlEscape(er.bug.replace('desks','items'))}"
  - "${yamlEscape(er.bug.replace('width','height'))}"
explanation: |
  ${er.why} Correct form: ${er.fix}
${SOURCE_V2}commonMistakeIds: ["CM-Q3-spot"]
${FOOTER}`);
    n++;
  });

  // 24-28: 5 Compare (decompose)
  const compares = [
    {a:'cin >> desks[i].width', b:'cin >> desks.width', diff:'Missing [i] in B — does not compile.', distractors:['B is faster','A and B are equivalent','B reads more data']},
    {a:'for (int i = 0; i < n; i++)', b:'for (int i = 0; i <= n; i++)', diff:'B reads one element too many.', distractors:['B reads one less','A and B are equivalent','B is infinite loop']},
    {a:'desk_data &desks[]', b:'desk_data desks[]', diff:'B is by-value: caller would not see changes.', distractors:['A and B are equivalent','B is faster','B is by-pointer']},
    {a:'cout << "Width: "; cin >> w;', b:'cin >> w; cout << "Width: ";', diff:'B prompts AFTER reading — user has no idea what to type.', distractors:['A and B are equivalent','B is more efficient','B reads twice']},
    {a:'void read_desks(...)', b:'int read_desks(...)', diff:'B returns int; read functions return void.', distractors:['A and B are equivalent','B returns the count','B is the practice form']},
  ];
  compares.forEach((cm, idx) => {
    w(`${dir}/compare-${String(idx+1).padStart(2,'0')}.yml`, header({id:`L3-R00-compare-${String(idx+1).padStart(2,'0')}`, atomId:'R-00', stage:1, type:'DecomposeCard'}, 'compare A vs B') +
`stem: |
  Compare two forms. Pick the option that names the real difference.
code: |
  // A:
  ${cm.a}
  // B:
  ${cm.b}
question: "Which option correctly describes the difference between A and B?"
options:
  - label: "A"
    text: "${yamlEscape(cm.diff)}"
  - label: "B"
    text: "${yamlEscape(cm.distractors[0]!)}"
  - label: "C"
    text: "${yamlEscape(cm.distractors[1]!)}"
  - label: "D"
    text: "${yamlEscape(cm.distractors[2]!)}"
correctLabel: "A"
explanation: |
  ${cm.diff}
${SOURCE_V2}${FOOTER}`);
    n++;
  });

  // 29-33: 5 Identify (MCQ)
  const ids = [
    {q:'Which token in `void read_desks(desk_data &desks[], int n)` makes changes propagate to the caller?', a:'&', d:['void','[]','int']},
    {q:'Which loop bound is correct for read_desks given n items?', a:'i < n', d:['i <= n', 'i < SIZE', 'i <= SIZE']},
    {q:'Which form correctly reads ONE field of the i-th desk?', a:'cin >> desks[i].width', d:['cin >> desks.width', 'cin >> desks[i]', 'cin << desks[i].width']},
    {q:'Which is the canonical return type of read_X?', a:'void', d:['int','double','bool']},
    {q:'Which placement of the prompt is canonical?', a:'cout BEFORE cin in the same iteration', d:['cout AFTER cin', 'cout outside the loop only', 'cout never used']},
  ];
  ids.forEach((q, idx) => {
    w(`${dir}/identify-${String(idx+1).padStart(2,'0')}.yml`, header({id:`L3-R00-id-${String(idx+1).padStart(2,'0')}`, atomId:'R-00', stage:1, type:'MCQCard'}, 'identify') +
`stem: |
  ${q.q}
correct: "${yamlEscape(q.a)}"
distractors:
${q.d.map(x=>`  - "${yamlEscape(x)}"`).join('\n')}
explanation: |
  Q3 anatomy: void return, by-reference array, count parameter as bound, prompt-then-cin pair, [i].field index.
${SOURCE_V2}${FOOTER}`);
    n++;
  });

  // 34-35: 2 WhatHappens (TraceCard for tour)
  const wh = [
    {q:'If you write `cin >> desks[i]` (no .field), what happens at compile?', a:'Compile error — cannot read a struct directly with cin >>.'},
    {q:'If the caller passes 3 but the loop runs `i <= number_to_read`, how many times does the body run?', a:'4 times — one too many; reads desks[3] which is past the data.'},
  ];
  wh.forEach((q, idx) => {
    w(`${dir}/what-${String(idx+1).padStart(2,'0')}.yml`, header({id:`L3-R00-what-${String(idx+1).padStart(2,'0')}`, atomId:'R-00', stage:1, type:'MCQCard'}, 'what happens') +
`stem: |
  ${q.q}
correct: "${yamlEscape(q.a)}"
distractors:
  - "Runs 3 times and is fine."
  - "Runs 0 times — loop never enters."
  - "Reads only the first byte of the struct."
explanation: |
  ${q.a}
${SOURCE_V2}${FOOTER}`);
    n++;
  });

  // 36-37: 2 Vocab (MCQ)
  const vocab = [
    {q:'In the signature, what does `&` mean?', a:'pass by reference (caller sees changes)', d:['address-of operator','pointer dereference','bitwise AND']},
    {q:'In the signature, what does `[]` after the parameter name mean?', a:'parameter is an array', d:['default value','array of pointers','optional parameter']},
  ];
  vocab.forEach((q, idx) => {
    w(`${dir}/vocab-${String(idx+1).padStart(2,'0')}.yml`, header({id:`L3-R00-vocab-${String(idx+1).padStart(2,'0')}`, atomId:'R-00', stage:1, type:'MCQCard'}, 'vocab') +
`stem: |
  ${q.q}
correct: "${yamlEscape(q.a)}"
distractors:
${q.d.map(x=>`  - "${yamlEscape(x)}"`).join('\n')}
explanation: |
  Term in context: ${q.a}.
${SOURCE_PFG}${FOOTER}`);
    n++;
  });

  console.log(`S1 Tour: ${n} cards`);
}

function indent(s: string, n=2): string {
  return s.split('\n').map(l => ' '.repeat(n) + l).join('\n');
}

// ---------- S2 TEMPLATE (60) ----------
function s2Template() {
  const dir = 'S2-Template';
  let n = 0;

  // 12 TypeLine — type a single line of the skeleton from prompt
  // Wrap fragments so each canonicalAnswer ends in } or ; AND has balanced braces.
  const lines = [
    {prompt:'Type the read function signature for desks (3 fields).', ans:'void read_desks(desk_data &desks[], int number_to_read)\n{\n}', kc:['void','read_desks','desk_data','&desks[]','int number_to_read']},
    {prompt:'Type the function-body opening brace pair (open + close on next line).', ans:'{\n}', kc:['{','}']},
    {prompt:'Type the for-loop header using number_to_read.', ans:'for (int i = 0; i < number_to_read; i++)\n{\n}', kc:['for','int i = 0','i < number_to_read','i++']},
    {prompt:'Type the for-loop body brace pair (open + close).', ans:'{\n}', kc:['{','}']},
    {prompt:'Type the cout for the width prompt.', ans:'    cout << "Width: ";', kc:['cout','"Width: "',';']},
    {prompt:'Type the cin for the width into desks[i].', ans:'    cin >> desks[i].width;', kc:['cin >>','desks[i].width',';']},
    {prompt:'Type the cout for the height prompt.', ans:'    cout << "Height: ";', kc:['cout','"Height: "',';']},
    {prompt:'Type the cin for the height.', ans:'    cin >> desks[i].height;', kc:['cin >>','desks[i].height',';']},
    {prompt:'Type the cout for the depth prompt.', ans:'    cout << "Depth: ";', kc:['cout','"Depth: "',';']},
    {prompt:'Type the cin for the depth.', ans:'    cin >> desks[i].depth;', kc:['cin >>','desks[i].depth',';']},
    {prompt:'Type the for-loop closing brace; close the function body too.', ans:'  }\n}', kc:['}']},
    {prompt:'Type the function-closing brace inside an empty body.', ans:'{\n}', kc:['{','}']},
  ];
  lines.forEach((l, idx) => {
    w(`${dir}/typeline-${String(idx+1).padStart(2,'0')}.yml`, header({id:`L3-R01-typeline-${String(idx+1).padStart(2,'0')}`, atomId:'R-01', stage:2, type:'TemplateRecallCard'}, 'type a single line') +
`stem: |
  ${l.prompt} The 12-line read_desks skeleton is fixed; type just this line.
prompt: "Single-line type from skeleton."
template: "${yamlEscape(l.ans)}"
canonicalAnswer: |
  ${l.ans}
keyChecks:
${l.kc.map(k=>`  - "${yamlEscape(k)}"`).join('\n')}
explanation: |
  Line is one of the 12 in the canonical read_desks skeleton.
${SOURCE_V2}${FOOTER}`);
    n++;
  });

  // 12 OrderLines (decompose) — pick the right next line
  for (let i=0;i<12;i++) {
    const order = [
      'void read_desks(desk_data &desks[], int number_to_read)',
      '{',
      '  for (int i = 0; i < number_to_read; i++)',
      '  {',
      '    cout << "Width: ";',
      '    cin >> desks[i].width;',
      '    cout << "Height: ";',
      '    cin >> desks[i].height;',
      '    cout << "Depth: ";',
      '    cin >> desks[i].depth;',
      '  }',
      '}',
    ];
    const correct = order[i];
    const distractors = order.filter((_,j)=>j!==i).slice(0,3);
    w(`${dir}/order-${String(i+1).padStart(2,'0')}.yml`, header({id:`L3-R01-order-${String(i+1).padStart(2,'0')}`, atomId:'R-01', stage:2, type:'MCQCard'}, 'next line in skeleton') +
`stem: |
  Given the read_desks skeleton lines so far (lines 1..${i}), what is line ${i+1}?
correct: "${yamlEscape(correct)}"
distractors:
${distractors.map(d=>`  - "${yamlEscape(d)}"`).join('\n')}
explanation: |
  Skeleton order is fixed: signature, brace, for, brace, three prompt-pairs, close brace, close brace.
${SOURCE_V2}${FOOTER}`);
    n++;
  }

  // 24 FillSlot — placeholders in the template (8 each for sig/loop/cin)
  // 8 signature slots
  for (let i=0;i<8;i++) {
    const slots: [string,string,string,string][] = [
      ['{{R}}','void',`Return type for read_desks.`,'void read_desks(desk_data &desks[], int number_to_read)'],
      ['{{N}}','read_desks','Function name follows the read_X convention.','void read_desks(desk_data &desks[], int number_to_read)'],
      ['{{T}}','desk_data','First parameter type.','void read_desks(desk_data &desks[], int number_to_read)'],
      ['{{A}}','&','Pass-by-reference token.','void read_desks(desk_data &desks[], int number_to_read)'],
      ['{{L}}','desks','List parameter name (matches plural).','void read_desks(desk_data &desks[], int number_to_read)'],
      ['{{B}}','[]','Array brackets after the list name.','void read_desks(desk_data &desks[], int number_to_read)'],
      ['{{I}}','int','Type of the count parameter.','void read_desks(desk_data &desks[], int number_to_read)'],
      ['{{C}}','number_to_read','Count parameter name.','void read_desks(desk_data &desks[], int number_to_read)'],
    ];
    const [ph, ans, why, full] = slots[i]!;
    const fullWrapped = full + '\n{\n}';
    const tmpl = full.replace(ans, ph) + '\n{\n}';
    w(`${dir}/fill-sig-${String(i+1).padStart(2,'0')}.yml`, header({id:`L3-R01-fill-sig-${String(i+1).padStart(2,'0')}`, atomId:'R-01', stage:2, type:'TemplateRecallCard'}, 'fill signature slot') +
`stem: |
  Fill the ${ph} slot in the read_desks signature.
prompt: "Fill ${ph} placeholder."
template: |
${indent(tmpl)}
canonicalAnswer: |
${indent(fullWrapped)}
keyChecks:
  - "${yamlEscape(ans)}"
forbiddenTokens:
  - "function"
  - "->"
explanation: |
  ${why}
${SOURCE_V2}${FOOTER}`);
    n++;
  }

  // 8 loop slots
  for (let i=0;i<8;i++) {
    const slots: [string,string,string,string][] = [
      ['{{INIT}}','int i = 0','Init: declare counter at 0.','for (int i = 0; i < number_to_read; i++)'],
      ['{{TEST}}','i < number_to_read','Half-open test using parameter as bound.','for (int i = 0; i < number_to_read; i++)'],
      ['{{STEP}}','i++','Post-increment by 1.','for (int i = 0; i < number_to_read; i++)'],
      ['{{COUNTER}}','i','Counter variable name.','for (int i = 0; i < number_to_read; i++)'],
      ['{{LT}}','<','Half-open less-than (NOT <=).','for (int i = 0; i < number_to_read; i++)'],
      ['{{BOUND}}','number_to_read','The count parameter is the bound.','for (int i = 0; i < number_to_read; i++)'],
      ['{{START}}','0','Counter starts at 0.','for (int i = 0; i < number_to_read; i++)'],
      ['{{KW}}','for','for keyword.','for (int i = 0; i < number_to_read; i++)'],
    ];
    const [ph, ans, why, full] = slots[i]!;
    const fullWrapped = full + '\n{\n}';
    const tmpl = full.replace(ans, ph) + '\n{\n}';
    w(`${dir}/fill-loop-${String(i+1).padStart(2,'0')}.yml`, header({id:`L3-R01-fill-loop-${String(i+1).padStart(2,'0')}`, atomId:'R-01', stage:2, type:'TemplateRecallCard'}, 'fill loop slot') +
`stem: |
  Fill the ${ph} slot in the for-loop header.
prompt: "Fill ${ph} placeholder."
template: |
${indent(tmpl)}
canonicalAnswer: |
${indent(fullWrapped)}
keyChecks:
  - "${yamlEscape(ans)}"
explanation: |
  ${why}
${SOURCE_V2}${FOOTER}`);
    n++;
  }

  // 8 cin slots
  for (let i=0;i<8;i++) {
    const slots: [string,string,string,string][] = [
      ['{{S}}','cin','Stream object for input.','cin >> desks[i].width;'],
      ['{{O}}','>>','Right-shift for read direction.','cin >> desks[i].width;'],
      ['{{L}}','desks','List parameter name.','cin >> desks[i].width;'],
      ['{{IDX}}','[i]','Element index brackets.','cin >> desks[i].width;'],
      ['{{DOT}}','.','Member access operator.','cin >> desks[i].width;'],
      ['{{F}}','width','Field name (first field).','cin >> desks[i].width;'],
      ['{{SEMI}}',';','Statement terminator.','cin >> desks[i].width;'],
      ['{{TARGET}}','desks[i].width','Whole l-value: list[i].field.','cin >> desks[i].width;'],
    ];
    const [ph, ans, why, full] = slots[i]!;
    const tmpl = full.replace(ans, ph);
    w(`${dir}/fill-cin-${String(i+1).padStart(2,'0')}.yml`, header({id:`L3-R01-fill-cin-${String(i+1).padStart(2,'0')}`, atomId:'R-01', stage:2, type:'TemplateRecallCard'}, 'fill cin slot') +
`stem: |
  Fill the ${ph} slot in the cin statement.
prompt: "Fill ${ph} placeholder."
template: |
  ${tmpl}
canonicalAnswer: |
  ${full}
keyChecks:
  - "${yamlEscape(ans)}"
explanation: |
  ${why}
${SOURCE_V2}${FOOTER}`);
    n++;
  }

  // 8 FullType — type the full skeleton from a one-line prompt
  const fullSpecs = [E_DESK, E_COMP, E_BOOK, E_CAR, E_PHONE, E_PLANT, E_DOG, E_HOUSE];
  fullSpecs.forEach((e, idx) => {
    const code = readFn(e);
    w(`${dir}/fulltype-${String(idx+1).padStart(2,'0')}.yml`, header({id:`L3-R01-fulltype-${String(idx+1).padStart(2,'0')}`, atomId:'R-01', stage:2, type:'FunctionWriteCard'}, `full skeleton for ${e.plural}`) +
`stem: |
  Type the full read_${e.plural} function from memory. ${e.fields.length} fields:
  ${e.fields.map(f=>`${f.type} ${f.name}`).join(', ')}.
prompt: "Full read_${e.plural} from skeleton."
signatureHint: "void read_${e.plural}(${e.name}_data &${e.list}[], int ${e.count}) { ... }"
canonicalAnswer: |
${indent(code)}
keyChecks:
  - "void read_${e.plural}"
  - "&${e.list}[]"
  - "int ${e.count}"
  - "for (int i = 0; i < ${e.count}; i++)"
${e.fields.map(f=>`  - "cin >> ${e.list}[i].${f.name};"`).join('\n')}
forbiddenTokens:
  - "function"
  - "->"
  - "while"
  - "scanf"
explanation: |
  Skeleton is fixed: void name + by-ref array + count int + for-loop + ${e.fields.length} prompt-pairs.
passByRefRequired: true
${SOURCE_V2}${FOOTER}`);
    n++;
  });

  // 4 TimedType (SpeedDrillCard)
  for (let i=0;i<4;i++) {
    const e = [E_DESK, E_COMP, E_BOOK, E_CAR][i]!;
    const code = readFn(e);
    w(`${dir}/timed-${String(i+1).padStart(2,'0')}.yml`, header({id:`L3-R01-timed-${String(i+1).padStart(2,'0')}`, atomId:'R-01', stage:2, type:'SpeedDrillCard'}, `timed type read_${e.plural}`) +
`stem: |
  Timed: type the full read_${e.plural} function in 90 seconds.
flashSeconds: 5
targetSeconds: 90
prompt: "Type the full read_${e.plural} function."
canonicalAnswer: |
${indent(code)}
keyChecks:
  - "void read_${e.plural}"
  - "&${e.list}[]"
  - "for (int i = 0; i < ${e.count}; i++)"
  - "cin >> ${e.list}[i].${e.fields[0]!.name};"
explanation: |
  Speed drill: skeleton is fixed; muscle-memory the 12 lines.
${SOURCE_V2}${FOOTER}`);
    n++;
  }

  console.log(`S2 Template: ${n} cards`);
}

// ---------- S3 COMPONENTS (140) ----------
function s3Components() {
  // Block A: signature anatomy (35)
  blockA();
  // Block B: for-loop bound (30)
  blockB();
  // Block C: cin into struct array (35) — GATING
  blockC();
  // Block D: prompt-pair (20)
  blockD();
  // Block E: multi-field sequencing (20)
  blockE();
}

function blockA() {
  const dir = 'S3-Components/A-sig';
  let n = 0;
  // 20 write
  const sigSpecs = ENTITIES.slice(0, 20);
  sigSpecs.forEach((e, idx) => {
    w(`${dir}/write-${String(idx+1).padStart(2,'0')}.yml`, header({id:`L3-R02a-write-${String(idx+1).padStart(2,'0')}`, atomId:'R-02a', stage:3, type:'FunctionWriteCard'}, `signature for ${e.plural}`) +
`stem: |
  Write ONLY the signature line (no body) for read_${e.plural} that reads
  ${e.fields.length} ${e.name}_data items by reference.
prompt: "Signature only for read_${e.plural}."
signatureHint: "void read_${e.plural}(${e.name}_data &${e.list}[], int ${e.count})"
canonicalAnswer: |
  void read_${e.plural}(${e.name}_data &${e.list}[], int ${e.count})
  {
  }
keyChecks:
  - "void"
  - "read_${e.plural}"
  - "${e.name}_data"
  - "&${e.list}[]"
  - "int ${e.count}"
forbiddenTokens:
  - "function"
  - "->"
explanation: |
  void = no return. ${e.name}_data &${e.list}[] = reference to array of struct.
  int ${e.count} = element count. Order: return-type, name, params.
passByRefRequired: true
${SOURCE_V2}commonMistakeIds: ["CM-Q3-missing-amp","CM-Q3-missing-brackets-sig"]
${FOOTER}`);
    n++;
  });
  // 10 mcq (signature errors)
  const mcqs = [
    {q:'Which signature passes the array by reference?', a:'void read_X(X_data &items[], int n)', d:['void read_X(X_data items[], int n)','void read_X(X_data &items, int n)','void read_X(X_data items, int n)']},
    {q:'What does removing & do?', a:'caller will not see changes', d:['compile error','runs faster','reads twice']},
    {q:'What does removing [] do?', a:'parameter is now a single struct, not an array', d:['nothing','reads first element only','syntax error always']},
    {q:'Correct return type?', a:'void', d:['int','double','bool']},
    {q:'Order of params?', a:'array first, count second', d:['count first','count only','array only']},
    {q:'Identifier convention for read fn name?', a:'read_<plural>', d:['Read_X','readX','readx']},
    {q:'Type of count parameter?', a:'int', d:['size_t','double','char']},
    {q:'Reference token placement?', a:'before parameter name', d:['after parameter name','before type','optional']},
    {q:'Brackets [] go where?', a:'after parameter name', d:['after type','after & only','outside parens']},
    {q:'What if the signature line ends with a semicolon?', a:'it becomes a forward declaration, not a definition', d:['nothing changes','illegal','it changes return type']},
  ];
  mcqs.forEach((q,idx)=>{
    w(`${dir}/mcq-${String(idx+1).padStart(2,'0')}.yml`, header({id:`L3-R02a-mcq-${String(idx+1).padStart(2,'0')}`, atomId:'R-02a', stage:3, type:'MCQCard'}, 'signature mcq') +
`stem: |
  ${q.q}
correct: "${yamlEscape(q.a)}"
distractors:
${q.d.map(x=>`  - "${yamlEscape(x)}"`).join('\n')}
explanation: |
  ${q.a}
${SOURCE_V2}${FOOTER}`);
    n++;
  });
  // 5 decompose
  const decs = [
    {a:'void read_desks(desk_data &desks[], int n)', b:'void read_desks(desk_data desks[], int n)', why:'B is by-value: caller does not see writes.', d:['B is by-pointer','B is faster','A and B are equivalent']},
    {a:'void read_desks(desk_data &desks[], int n)', b:'void read_desks(desk_data &desks, int n)', why:'B is by-ref single struct, not an array.', d:['B uses [] differently','A and B are equivalent','B is correct']},
    {a:'void read_desks(desk_data &desks[], int n)', b:'int read_desks(desk_data &desks[], int n)', why:'B returns int — wrong return type.', d:['B returns count','A and B are equivalent','B is shorter']},
    {a:'void read_desks(desk_data &desks[], int n)', b:'void read_desks(int n, desk_data &desks[])', why:'B has reversed parameter order.', d:['A and B are equivalent','B is the new style','B is faster']},
    {a:'void read_desks(desk_data &desks[], int n)', b:'void read_desks(desk_data &desks[], double n)', why:'B count is double; it must be int.', d:['A and B are equivalent','B is more flexible','B reads doubles']},
  ];
  decs.forEach((c,idx)=>{
    w(`${dir}/decompose-${String(idx+1).padStart(2,'0')}.yml`, header({id:`L3-R02a-decompose-${String(idx+1).padStart(2,'0')}`, atomId:'R-02a', stage:3, type:'DecomposeCard'}, 'compare signatures') +
`stem: |
  Compare two read function signatures. Pick the option that names the difference.
code: |
  // A:
  ${c.a}
  // B:
  ${c.b}
question: "Which option correctly describes the difference between A and B?"
options:
  - label: "A"
    text: "${yamlEscape(c.why)}"
  - label: "B"
    text: "${yamlEscape(c.d[0]!)}"
  - label: "C"
    text: "${yamlEscape(c.d[1]!)}"
  - label: "D"
    text: "${yamlEscape(c.d[2]!)}"
correctLabel: "A"
explanation: |
  ${c.why}
${SOURCE_V2}${FOOTER}`);
    n++;
  });
  console.log(`S3 Block A: ${n} cards`);
}

function blockB() {
  const dir = 'S3-Components/B-loop';
  let n = 0;
  // 18 write — full for-loop header with various count parameter names
  const params = ['number_to_read','count','n','total','num','many','size_in','given','read_count','length','items_n','passed','arg','c','m','k','q','t'];
  for (let i=0;i<18;i++) {
    const c = params[i]!;
    w(`${dir}/write-${String(i+1).padStart(2,'0')}.yml`, header({id:`L3-R02b-write-${String(i+1).padStart(2,'0')}`, atomId:'R-02b', stage:3, type:'FunctionWriteCard'}, `for-loop with ${c} bound`) +
`stem: |
  Write ONLY the for-loop header (no body) using ${c} as the count parameter.
prompt: "for-loop header with ${c} bound"
signatureHint: "for (int i = 0; i < ${c}; i++)"
canonicalAnswer: |
  for (int i = 0; i < ${c}; i++)
  {
  }
keyChecks:
  - "for (int i = 0; i < ${c}; i++)"
forbiddenTokens:
  - "while"
  - "<="
  - "SIZE"
explanation: |
  Use the count parameter (${c}) as the bound. Half-open <, NOT <=.
  Counter is int i; starts at 0; post-increment.
${SOURCE_V2}commonMistakeIds: ["CM-Q3-off-by-one","CM-Q3-wrong-bound-SIZE"]
${FOOTER}`);
    n++;
  }
  // 8 mcq
  const mcqs = [
    {q:'Which for-loop is canonical for read_X with count parameter n?', a:'for (int i = 0; i < n; i++)', d:['for (int i = 0; i <= n; i++)','for (int i = 1; i < n; i++)','for (int i = 0; i < SIZE; i++)']},
    {q:'Off-by-one: what does i <= n cause?', a:'reads one element past the end', d:['nothing','infinite loop','reads first only']},
    {q:'SIZE vs count: which to use?', a:'count parameter (the runtime length)', d:['SIZE (the capacity)','MAX','either']},
    {q:'Counter init?', a:'int i = 0', d:['int i = 1','int i','i = 0']},
    {q:'Step?', a:'i++', d:['++i','i--','i+=2']},
    {q:'Why <, not <=?', a:'array indices are 0..n-1', d:['style','speed','readability']},
    {q:'Body brace placement?', a:'opens on next line after for-header', d:['same line as for','no braces','only with single statement']},
    {q:'Counter scope?', a:'limited to the for-loop body', d:['file-scope','function-scope','global']},
  ];
  mcqs.forEach((q,idx)=>{
    w(`${dir}/mcq-${String(idx+1).padStart(2,'0')}.yml`, header({id:`L3-R02b-mcq-${String(idx+1).padStart(2,'0')}`, atomId:'R-02b', stage:3, type:'MCQCard'}, 'loop mcq') +
`stem: |
  ${q.q}
correct: "${yamlEscape(q.a)}"
distractors:
${q.d.map(x=>`  - "${yamlEscape(x)}"`).join('\n')}
explanation: |
  ${q.a}
${SOURCE_V2}${FOOTER}`);
    n++;
  });
  // 4 procedural — 3-streak loop variants
  for (let i=0;i<4;i++) {
    const counts = [
      ['n','count','number_to_read'],
      ['total','passed','arg'],
      ['c','m','k'],
      ['size_in','given','length'],
    ][i]!;
    w(`${dir}/proc-${String(i+1).padStart(2,'0')}.yml`, header({id:`L3-R02b-proc-${String(i+1).padStart(2,'0')}`, atomId:'R-02b', stage:3, type:'ProceduralCard'}, '3-streak loop variants') +
`section: "for-loop with parameter as bound"
stem: |
  3-streak: write three for-loop headers, each using a different count parameter.
prompt: |
  Write three for-loop headers using counters ${counts[0]}, ${counts[1]}, ${counts[2]} as bounds. Include empty body braces.
expectedAnswer: |
  for (int i = 0; i < ${counts[0]}; i++) { }
  for (int i = 0; i < ${counts[1]}; i++) { }
  for (int i = 0; i < ${counts[2]}; i++) { }
keyChecks:
  - "for (int i = 0; i < ${counts[0]}; i++)"
  - "for (int i = 0; i < ${counts[1]}; i++)"
  - "for (int i = 0; i < ${counts[2]}; i++)"
variants:
  - prompt: |
      Same three headers but bound is doubled, e.g. < 2*n.
    expectedAnswer: |
      for (int i = 0; i < 2*${counts[0]}; i++) { }
      for (int i = 0; i < 2*${counts[1]}; i++) { }
      for (int i = 0; i < 2*${counts[2]}; i++) { }
${SOURCE_V2}${FOOTER}`);
    n++;
  }
  console.log(`S3 Block B: ${n} cards`);
}

function blockC() {
  const dir = 'S3-Components/C-cin';
  let n = 0;
  // 18 mcq — gating block needs strong recognition drills
  const mcqs = [
    {q:'Which writes ONE field of the i-th desk into cin?', a:'cin >> desks[i].width;', d:['cin >> desks.width;','cin >> desks[i];','cin << desks[i].width;']},
    {q:'What is wrong with `cin >> desks.width;`?', a:'missing [i] index', d:['wrong operator','missing semicolon','extra space']},
    {q:'What is wrong with `cin >> desks[i];`?', a:'missing .field', d:['wrong index','missing &','wrong type']},
    {q:'What is wrong with `cin << desks[i].width;`?', a:'wrong operator direction (must be >>)', d:['missing index','missing field','too many tokens']},
    {q:'What is wrong with `cin >> desks[0].width;` inside the loop?', a:'always reads element 0; should be desks[i]', d:['nothing','syntax error','wrong type']},
    {q:'Which is the composite token to read into the i-th element\'s field?', a:'list[i].field', d:['list.field[i]','list[i]','list.field']},
    {q:'Order of [i] and .field?', a:'[i] first, then .field', d:['.field first','either works','depends']},
    {q:'Operator between cin and target?', a:'>>', d:['<<','=','->']},
    {q:'Statement terminator?', a:';', d:['none',':',',']},
    {q:'Whitespace required between cin and >>?', a:'no, cin>> compiles same as cin >>', d:['yes','only one space','two spaces']},
    {q:'Ampersand before target name?', a:'no — operator already takes a reference', d:['yes always','only for int','only outside loop']},
    {q:'Where does prompt go relative to cin?', a:'before, on its own cout line', d:['after','same line','optional']},
    {q:'What if you swap [i] and .field as `desks.field[i]`?', a:'compile error — wrong member access', d:['nothing','reads first byte','reads last']},
    {q:'What if you write `cin >> desks[i].field` without semicolon (line by itself)?', a:'compile error — statement requires ;', d:['nothing','warning only','runs once']},
    {q:'Index variable inside [...] should be?', a:'the loop counter (i)', d:['0','SIZE','number_to_read']},
    {q:'Why does `cin >> desks[i]` fail?', a:'no overloaded operator>> for desk_data', d:['array out of range','too slow','missing namespace']},
    {q:'What would `cin >> desks` (no [i], no .field) do?', a:'compile error', d:['reads first element','reads all elements','nothing']},
    {q:'Three syntactic pieces of the cin target?', a:'list, [i], .field', d:['list, .field','list, [i]','only list']},
  ];
  mcqs.forEach((q,idx)=>{
    w(`${dir}/mcq-${String(idx+1).padStart(2,'0')}.yml`, header({id:`L3-R02c-mcq-${String(idx+1).padStart(2,'0')}`, atomId:'R-02c', stage:3, type:'MCQCard'}, 'cin into struct array (gating)') +
`stem: |
  GATING DRILL: Block C tests cin >> list[i].field composite token.
  ${q.q}
correct: "${yamlEscape(q.a)}"
distractors:
${q.d.map(x=>`  - "${yamlEscape(x)}"`).join('\n')}
explanation: |
  Block C gating answer: ${q.a}.
  The composite token list[i].field has fixed shape: list name, then
  [i] index, then .field. Skipping any piece is the #1 Q3 error.
${SOURCE_V2}commonMistakeIds: ["CM-Q3-missing-index","CM-Q3-missing-field","CM-Q3-zero-instead-of-i","CM-Q3-cin-leftshift"]
${FOOTER}`);
    n++;
  });
  // 14 write — type the cin statement only, multiple entities
  const writeSpecs = ENTITIES.slice(0, 14);
  writeSpecs.forEach((e, idx)=>{
    const f = e.fields[0]!;
    w(`${dir}/write-${String(idx+1).padStart(2,'0')}.yml`, header({id:`L3-R02c-write-${String(idx+1).padStart(2,'0')}`, atomId:'R-02c', stage:3, type:'FunctionWriteCard'}, `cin into ${e.list}[i].${f.name}`) +
`stem: |
  GATING (Block C): write ONE cin statement that reads the field
  '${f.name}' into the i-th element of '${e.list}'.
prompt: "Single cin statement: list[i].field shape."
signatureHint: "cin >> ${e.list}[i].${f.name};"
canonicalAnswer: |
  cin >> ${e.list}[i].${f.name};
keyChecks:
  - "cin >> ${e.list}[i].${f.name};"
forbiddenTokens:
  - "while"
  - "scanf"
explanation: |
  cin >> list[i].field; — composite shape. Index then dot then field.
${SOURCE_V2}commonMistakeIds: ["CM-Q3-missing-index","CM-Q3-missing-field","CM-Q3-zero-instead-of-i"]
${FOOTER}`);
    n++;
  });
  // 3 procedural — 3-streak cin variants
  const trios = [
    [E_DESK, E_COMP, E_BOOK],
    [E_CAR, E_PHONE, E_PLANT],
    [E_DOG, E_HOUSE, E_BIKE],
  ];
  trios.forEach((trio, idx)=>{
    const lines = trio.map(e=>`cin >> ${e.list}[i].${e.fields[0]!.name};`);
    w(`${dir}/proc-${String(idx+1).padStart(2,'0')}.yml`, header({id:`L3-R02c-proc-${String(idx+1).padStart(2,'0')}`, atomId:'R-02c', stage:3, type:'ProceduralCard'}, '3-streak cin variants') +
`section: "cin into struct array element"
stem: |
  3-streak (Block C gating): write three cin statements, one per entity.
prompt: |
  Write the three cin statements to read the FIRST field of each:
  ${trio.map(e=>e.list+' / '+e.fields[0]!.name).join(', ')}.
expectedAnswer: |
${lines.map(l=>'  '+l).join('\n')}
keyChecks:
${lines.map(l=>`  - "${yamlEscape(l)}"`).join('\n')}
variants:
  - prompt: |
      Same three lists but second field of each.
    expectedAnswer: |
${trio.map(e=>'      cin >> '+e.list+'[i].'+e.fields[1]!.name+';').join('\n')}
${SOURCE_V2}${FOOTER}`);
    n++;
  });
  console.log(`S3 Block C: ${n} cards (GATING)`);
}

function blockD() {
  const dir = 'S3-Components/D-pair';
  let n = 0;
  // 12 write — write a complete prompt-pair for various entities/fields
  for (let i=0;i<12;i++) {
    const e = ENTITIES[i % ENTITIES.length]!;
    const f = e.fields[i % e.fields.length]!;
    w(`${dir}/write-${String(i+1).padStart(2,'0')}.yml`, header({id:`L3-R02d-write-${String(i+1).padStart(2,'0')}`, atomId:'R-02d', stage:3, type:'FunctionWriteCard'}, `prompt-pair ${e.list}.${f.name}`) +
`stem: |
  Write the two-line prompt-pair to read the '${f.name}' field of
  '${e.list}[i]'. Prompt comes first (cout, no endl), then cin.
prompt: "Two-line cout/cin prompt-pair."
canonicalAnswer: |
  cout << "${f.prompt}";
  cin >> ${e.list}[i].${f.name};
keyChecks:
  - "cout << \\"${yamlEscape(f.prompt)}\\";"
  - "cin >> ${e.list}[i].${f.name};"
forbiddenTokens:
  - "endl"
  - "while"
explanation: |
  cout << "Prompt: "; on its own line (no endl), then cin >> list[i].field; .
  Without endl, the user types on the same line as the prompt.
${SOURCE_V2}commonMistakeIds: ["CM-Q3-prompt-outside-loop","CM-Q3-skipped-prompt"]
${FOOTER}`);
    n++;
  }
  // 5 decompose — A vs B prompt placement
  const ds = [
    {a:'cout << "Width: "; cin >> desks[i].width;', b:'cin >> desks[i].width; cout << "Width: ";', why:'B prompts AFTER reading.', d:['B is faster','A and B are equivalent','B reads twice']},
    {a:'cout << "Width: "; cin >> desks[i].width;', b:'cout << "Width: " << endl; cin >> desks[i].width;', why:'B newline pushes input to next line.', d:['B is more readable','A and B are equivalent','B reads twice']},
    {a:'cout << "Width: "; cin >> desks[i].width;', b:'cout << "Width: "; cin << desks[i].width;', why:'B uses wrong cin operator.', d:['B is bidirectional','A and B are equivalent','B writes to cin']},
    {a:'cout << "Width: "; cin >> desks[i].width;', b:'cout << "Width:"; cin >> desks[i].width;', why:'B prompt has no trailing space — input touches the colon.', d:['A and B are equivalent','B is shorter','B reads differently']},
    {a:'cout << "Width: "; cin >> desks[i].width;', b:'cout << Width; cin >> desks[i].width;', why:'B prompt is identifier, not string literal.', d:['A and B are equivalent','B is faster','B reads a variable']},
  ];
  ds.forEach((c,idx)=>{
    w(`${dir}/decompose-${String(idx+1).padStart(2,'0')}.yml`, header({id:`L3-R02d-decompose-${String(idx+1).padStart(2,'0')}`, atomId:'R-02d', stage:3, type:'DecomposeCard'}, 'compare prompt-pair') +
`stem: |
  Compare two prompt-pair forms. Pick the option that names the difference.
code: |
  // A:
  ${c.a}
  // B:
  ${c.b}
question: "Which option correctly describes the difference between A and B?"
options:
  - label: "A"
    text: "${yamlEscape(c.why)}"
  - label: "B"
    text: "${yamlEscape(c.d[0]!)}"
  - label: "C"
    text: "${yamlEscape(c.d[1]!)}"
  - label: "D"
    text: "${yamlEscape(c.d[2]!)}"
correctLabel: "A"
explanation: |
  ${c.why}
${SOURCE_V2}${FOOTER}`);
    n++;
  });
  // 3 mcq
  const mcqs = [
    {q:'Where should the prompt go?', a:'right before the cin in the same iteration', d:['after the cin','outside the loop','only once']},
    {q:'Should the prompt include endl?', a:'no — input should be on same line as prompt', d:['yes','only sometimes','only with cin >> string']},
    {q:'What separates the prompt and the cin?', a:'a semicolon ending the cout line', d:['comma','plus','arrow']},
  ];
  mcqs.forEach((q,idx)=>{
    w(`${dir}/mcq-${String(idx+1).padStart(2,'0')}.yml`, header({id:`L3-R02d-mcq-${String(idx+1).padStart(2,'0')}`, atomId:'R-02d', stage:3, type:'MCQCard'}, 'prompt-pair mcq') +
`stem: |
  ${q.q}
correct: "${yamlEscape(q.a)}"
distractors:
${q.d.map(x=>`  - "${yamlEscape(x)}"`).join('\n')}
explanation: |
  ${q.a}
${SOURCE_V2}${FOOTER}`);
    n++;
  });
  console.log(`S3 Block D: ${n} cards`);
}

function blockE() {
  const dir = 'S3-Components/E-multi';
  let n = 0;
  // 12 write — multi-field bodies (2/3/4/5 fields)
  for (let i=0;i<12;i++) {
    const e = ENTITIES[i % ENTITIES.length]!;
    const fc = (i % 4) + 2; // 2..5 fields
    const fields = [...e.fields];
    while (fields.length < fc) {
      // synth extra fields
      fields.push({name: `extra${fields.length+1}`, type: 'double', prompt: `Extra ${fields.length+1}: `});
    }
    const fs = fields.slice(0, fc);
    const lines = fs.flatMap(f=>[`cout << "${f.prompt}";`, `cin >> ${e.list}[i].${f.name};`]);
    w(`${dir}/write-${String(i+1).padStart(2,'0')}.yml`, header({id:`L3-R02e-write-${String(i+1).padStart(2,'0')}`, atomId:'R-02e', stage:3, type:'FunctionWriteCard'}, `${fc}-field body for ${e.list}`) +
`stem: |
  Write the BODY of the for-loop only (no signature, no for-header):
  ${fc} prompt-pair sequence for '${e.list}[i]' fields:
  ${fs.map(f=>f.name).join(', ')}.
prompt: "${fc}-field prompt-pair sequence"
canonicalAnswer: |
${lines.map(l=>'  '+l).join('\n')}
keyChecks:
${fs.map(f=>`  - "cin >> ${e.list}[i].${f.name};"`).join('\n')}
forbiddenTokens:
  - "while"
  - "endl"
explanation: |
  ${fc} fields means ${fc} prompt-pairs in struct-declaration order.
  Each pair is cout-prompt + cin-into-list[i].field.
${SOURCE_V2}commonMistakeIds: ["CM-Q3-skipped-field","CM-Q3-reordered-field"]
${FOOTER}`);
    n++;
  }
  // 6 decompose — order/skip/duplicate
  const ds = [
    {a:'cin >> d[i].w; cin >> d[i].h; cin >> d[i].depth;', b:'cin >> d[i].w; cin >> d[i].depth; cin >> d[i].h;', why:'B reorders — should follow struct declaration order.', d:['A and B are equivalent','B reads same data','B is faster']},
    {a:'cin >> d[i].w; cin >> d[i].h; cin >> d[i].depth;', b:'cin >> d[i].w; cin >> d[i].depth;', why:'B skips a field.', d:['A and B are equivalent','B is shorter and identical','B reads more']},
    {a:'cin >> d[i].w; cin >> d[i].h;', b:'cin >> d[i].w; cin >> d[i].w;', why:'B reads first field twice.', d:['A and B are equivalent','B reads two fields','B is faster']},
    {a:'cout<<"W: "; cin>>d[i].w; cout<<"H: "; cin>>d[i].h;', b:'cout<<"W: "; cout<<"H: "; cin>>d[i].w; cin>>d[i].h;', why:'B groups all prompts then all cins — user sees both prompts before any input.', d:['A and B are equivalent','B is the right pattern','B is faster']},
    {a:'for(...) { cout<<"W: "; cin>>d[i].w; }', b:'cout<<"W: "; for(...) { cin>>d[i].w; }', why:'B prompts once outside the loop — user only sees one prompt for n inputs.', d:['A and B are equivalent','B is more efficient','B reads twice']},
    {a:'cin>>d[i].a; cin>>d[i].b; cin>>d[i].c; cin>>d[i].dd;', b:'cin>>d[i].a; cin>>d[i].b; cin>>d[i].dd;', why:'B drops one field (3 instead of 4).', d:['A and B are equivalent','B is shorter and equal','B is faster']},
  ];
  ds.forEach((c,idx)=>{
    w(`S3-Components/E-multi/decompose-${String(idx+1).padStart(2,'0')}.yml`, header({id:`L3-R02e-decompose-${String(idx+1).padStart(2,'0')}`, atomId:'R-02e', stage:3, type:'DecomposeCard'}, 'multi-field compare') +
`stem: |
  Compare two multi-field bodies. Pick the option that names the difference.
code: |
  // A:
  ${c.a}
  // B:
  ${c.b}
question: "Which option correctly describes the difference between A and B?"
options:
  - label: "A"
    text: "${yamlEscape(c.why)}"
  - label: "B"
    text: "${yamlEscape(c.d[0]!)}"
  - label: "C"
    text: "${yamlEscape(c.d[1]!)}"
  - label: "D"
    text: "${yamlEscape(c.d[2]!)}"
correctLabel: "A"
explanation: |
  ${c.why}
${SOURCE_V2}${FOOTER}`);
    n++;
  });
  // 2 mcq
  const mcqs = [
    {q:'Order of fields in the loop body must match what?', a:'struct declaration order', d:['alphabetical','reverse','any order']},
    {q:'How many prompt-pairs for a 4-field struct?', a:'4', d:['1','3','5']},
  ];
  mcqs.forEach((q,idx)=>{
    w(`S3-Components/E-multi/mcq-${String(idx+1).padStart(2,'0')}.yml`, header({id:`L3-R02e-mcq-${String(idx+1).padStart(2,'0')}`, atomId:'R-02e', stage:3, type:'MCQCard'}, 'multi-field mcq') +
`stem: |
  ${q.q}
correct: "${yamlEscape(q.a)}"
distractors:
${q.d.map(x=>`  - "${yamlEscape(x)}"`).join('\n')}
explanation: |
  ${q.a}
${SOURCE_V2}${FOOTER}`);
    n++;
  });
  console.log(`S3 Block E: ${n} cards`);
}

// ---------- S4 COMPOSE (90) ----------
function s4Compose() {
  const dir = 'S4-Compose';
  let n = 0;
  // 10 V2.0 desks (full read_desks)
  for (let i=0;i<10;i++) {
    const code = readFn(E_DESK);
    w(`${dir}/desks-${String(i+1).padStart(2,'0')}.yml`, header({id:`L3-R03-desks-${String(i+1).padStart(2,'0')}`, atomId:'R-03', stage:4, type:'FunctionWriteCard'}, 'V2.0 read_desks') +
`stem: |
  Write the FULL read_desks function (V2.0 exam shape). desk_data has
  3 double fields: width, height, depth. Use number_to_read as the count.
prompt: "Compose: full read_desks."
signatureHint: "void read_desks(desk_data &desks[], int number_to_read) { ... }"
canonicalAnswer: |
${indent(code)}
keyChecks:
  - "void read_desks(desk_data &desks[], int number_to_read)"
  - "for (int i = 0; i < number_to_read; i++)"
  - "cin >> desks[i].width;"
  - "cin >> desks[i].height;"
  - "cin >> desks[i].depth;"
forbiddenTokens:
  - "function"
  - "->"
  - "while"
  - "scanf"
explanation: |
  V2.0 exam Q3. Skeleton 12 lines: signature, brace, for, brace, 3 prompt-pairs, brace, brace.
passByRefRequired: true
${SOURCE_V2}commonMistakeIds: ["CM-Q3-off-by-one","CM-Q3-missing-amp","CM-Q3-missing-index"]
${FOOTER}`);
    n++;
  }
  // 10 practice computers (full read_computers)
  for (let i=0;i<10;i++) {
    const code = readFn(E_COMP);
    w(`${dir}/computers-${String(i+1).padStart(2,'0')}.yml`, header({id:`L3-R03-computers-${String(i+1).padStart(2,'0')}`, atomId:'R-03', stage:4, type:'FunctionWriteCard'}, 'practice read_computers') +
`stem: |
  Write the FULL read_computers function. computer_data has 3 fields:
  cpu_speed (double), ram_gb (int), price (double).
prompt: "Compose: full read_computers."
signatureHint: "void read_computers(computer_data &computers[], int number_to_read) { ... }"
canonicalAnswer: |
${indent(code)}
keyChecks:
  - "void read_computers(computer_data &computers[], int number_to_read)"
  - "for (int i = 0; i < number_to_read; i++)"
  - "cin >> computers[i].cpu_speed;"
  - "cin >> computers[i].ram_gb;"
  - "cin >> computers[i].price;"
forbiddenTokens:
  - "function"
  - "->"
  - "while"
explanation: |
  Practice-test Q3 shape. Same 12-line skeleton with rotated entity.
passByRefRequired: true
${SOURCE_PR}commonMistakeIds: ["CM-Q3-off-by-one","CM-Q3-missing-amp","CM-Q3-missing-index"]
${FOOTER}`);
    n++;
  }
  // 20 novel entities full read fn
  const novels = ENTITIES.slice(2, 22); // skip desks, computers
  novels.forEach((e, idx)=>{
    const code = readFn(e);
    w(`${dir}/novel-${String(idx+1).padStart(2,'0')}-${e.plural}.yml`, header({id:`L3-R03-novel-${String(idx+1).padStart(2,'0')}`, atomId:'R-03', stage:4, type:'FunctionWriteCard'}, `novel read_${e.plural}`) +
`stem: |
  Write the FULL read_${e.plural} function. ${e.name}_data has 3 fields:
  ${e.fields.map(f=>`${f.type} ${f.name}`).join(', ')}.
prompt: "Compose: novel entity read_${e.plural}."
signatureHint: "void read_${e.plural}(${e.name}_data &${e.list}[], int ${e.count}) { ... }"
canonicalAnswer: |
${indent(code)}
keyChecks:
  - "void read_${e.plural}(${e.name}_data &${e.list}[], int ${e.count})"
  - "for (int i = 0; i < ${e.count}; i++)"
${e.fields.map(f=>`  - "cin >> ${e.list}[i].${f.name};"`).join('\n')}
forbiddenTokens:
  - "function"
  - "->"
  - "while"
explanation: |
  Novel entity. Same skeleton; only entity + field surface rotates.
passByRefRequired: true
${SOURCE_V2}commonMistakeIds: ["CM-Q3-off-by-one","CM-Q3-missing-amp","CM-Q3-missing-index","CM-Q3-missing-field"]
${FOOTER}`);
    n++;
  });
  // 10 body-only completion
  for (let i=0;i<10;i++) {
    const e = ENTITIES[i]!;
    const body: string[] = [];
    body.push(`  for (int i = 0; i < ${e.count}; i++)`);
    body.push(`  {`);
    for (const f of e.fields) {
      body.push(`    cout << "${f.prompt}";`);
      body.push(`    cin >> ${e.list}[i].${f.name};`);
    }
    body.push(`  }`);
    w(`${dir}/body-${String(i+1).padStart(2,'0')}-${e.plural}.yml`, header({id:`L3-R03-body-${String(i+1).padStart(2,'0')}`, atomId:'R-03', stage:4, type:'FunctionWriteCard'}, `body-only ${e.plural}`) +
`stem: |
  The signature and braces are given. Write ONLY the body (for-loop +
  prompt-pairs) for read_${e.plural}.
prompt: "Body-only completion."
signatureHint: |
  void read_${e.plural}(${e.name}_data &${e.list}[], int ${e.count})
  {
    // YOUR BODY HERE
  }
canonicalAnswer: |
${body.map(l=>l).join('\n')}
keyChecks:
  - "for (int i = 0; i < ${e.count}; i++)"
${e.fields.map(f=>`  - "cin >> ${e.list}[i].${f.name};"`).join('\n')}
forbiddenTokens:
  - "while"
  - "scanf"
explanation: |
  Body = for-loop + 3 prompt-pairs. Signature already provided.
${SOURCE_V2}${FOOTER}`);
    n++;
  }
  // 10 fill-blank
  for (let i=0;i<10;i++) {
    const e = ENTITIES[i]!;
    const f1 = e.fields[0]!;
    const code = readFn(e);
    const blanked = code
      .replace('void', '{{R}}')
      .replace(`&${e.list}`, '{{A}}'+e.list)
      .replace(`int ${e.count}`, '{{I}} '+e.count)
      .replace(`< ${e.count}`, '< {{B}}')
      .replace(`${e.list}[i].${f1.name}`, '{{T}}');
    w(`${dir}/fill-${String(i+1).padStart(2,'0')}-${e.plural}.yml`, header({id:`L3-R03-fill-${String(i+1).padStart(2,'0')}`, atomId:'R-03', stage:4, type:'TemplateRecallCard'}, `fill-blank ${e.plural}`) +
`stem: |
  Fill the 5 placeholders {{R}} {{A}} {{I}} {{B}} {{T}} in read_${e.plural}.
prompt: "5-blank fill-in"
template: |
${indent(blanked)}
canonicalAnswer: |
${indent(code)}
keyChecks:
  - "void read_${e.plural}(${e.name}_data &${e.list}[], int ${e.count})"
  - "${e.list}[i].${f1.name}"
explanation: |
  {{R}}=void, {{A}}=&, {{I}}=int, {{B}}=${e.count}, {{T}}=${e.list}[i].${f1.name}.
${SOURCE_V2}${FOOTER}`);
    n++;
  }
  // 10 two-pane Q2->Q3
  for (let i=0;i<10;i++) {
    const e = ENTITIES[i+2]!;
    const sd = structDef(e);
    const fn = readFn(e);
    w(`${dir}/twopane-${String(i+1).padStart(2,'0')}-${e.plural}.yml`, header({id:`L3-R03-twopane-${String(i+1).padStart(2,'0')}`, atomId:'R-03', stage:4, type:'FunctionWriteCard'}, `two-pane Q2->Q3 ${e.plural}`) +
`stem: |
  Two-pane: Q2 struct shown left. Write the matching Q3 read_${e.plural}.
prompt: "Two-pane Q2 -> Q3."
signatureHint: |
  Given:
${indent(sd)}
  Write read_${e.plural}.
canonicalAnswer: |
${indent(fn)}
keyChecks:
  - "void read_${e.plural}(${e.name}_data &${e.list}[], int ${e.count})"
  - "for (int i = 0; i < ${e.count}; i++)"
${e.fields.map(f=>`  - "cin >> ${e.list}[i].${f.name};"`).join('\n')}
forbiddenTokens:
  - "while"
explanation: |
  Read fields in struct-declaration order. Each field gets one prompt-pair.
passByRefRequired: true
${SOURCE_V2}${FOOTER}`);
    n++;
  }
  // 10 with-typos
  for (let i=0;i<10;i++) {
    const e = ENTITIES[i+1]!;
    const sd = structDef(e).replace(';', ';  // <-- typo: extra semicolon expected here?');
    const fn = readFn(e);
    w(`${dir}/typo-${String(i+1).padStart(2,'0')}-${e.plural}.yml`, header({id:`L3-R03-typo-${String(i+1).padStart(2,'0')}`, atomId:'R-03', stage:4, type:'FunctionWriteCard'}, `with-typos ${e.plural}`) +
`stem: |
  The Q2 struct on the left has minor formatting noise. Use it AS-IF
  correct; write the canonical read_${e.plural}.
prompt: "With Q2 typos: filter signal."
signatureHint: |
  Q2 (with typos):
${indent(sd)}
  Write read_${e.plural} canonically.
canonicalAnswer: |
${indent(fn)}
keyChecks:
  - "void read_${e.plural}(${e.name}_data &${e.list}[], int ${e.count})"
  - "for (int i = 0; i < ${e.count}; i++)"
${e.fields.map(f=>`  - "cin >> ${e.list}[i].${f.name};"`).join('\n')}
explanation: |
  Q3 skeleton is invariant — typos in Q2 do not propagate to Q3.
passByRefRequired: true
${SOURCE_V2}${FOOTER}`);
    n++;
  }
  // 10 cold-start (entity name only -> Q2+Q3)
  for (let i=0;i<10;i++) {
    const e = ENTITIES[i+3]!;
    const sd = structDef(e);
    const fn = readFn(e);
    w(`${dir}/cold-${String(i+1).padStart(2,'0')}-${e.plural}.yml`, header({id:`L3-R03-cold-${String(i+1).padStart(2,'0')}`, atomId:'R-03', stage:4, type:'FunctionWriteCard'}, `cold-start ${e.plural}`) +
`stem: |
  Cold start. You are given only the entity name '${e.plural}'. Choose
  3 plausible fields, write the struct, and then the matching read_${e.plural}.
prompt: "Cold-start ${e.plural} (Q2 + Q3)."
signatureHint: "Entity: ${e.plural}. Choose fields, write Q2 struct, then Q3 read fn."
canonicalAnswer: |
${indent(sd)}

${indent(fn)}
keyChecks:
  - "struct ${e.name}_data"
  - "void read_${e.plural}(${e.name}_data &${e.list}[], int ${e.count})"
  - "for (int i = 0; i < ${e.count}; i++)"
${e.fields.map(f=>`  - "${e.list}[i].${f.name}"`).join('\n')}
forbiddenTokens:
  - "while"
  - "function"
explanation: |
  Cold-start drill: any plausible 3 fields work, but the read fn skeleton stays fixed.
passByRefRequired: true
${SOURCE_V2}${FOOTER}`);
    n++;
  }
  console.log(`S4 Compose: ${n} cards`);
}

// ---------- S5 VARIATIONS (50) ----------
function s5Variations() {
  const dir = 'S5-Variations';
  let n = 0;
  // 10 2-field
  for (let i=0;i<10;i++) {
    const e = ENTITIES[i]!;
    const fn = readFnNFields(e, 2);
    w(`${dir}/v2-${String(i+1).padStart(2,'0')}-${e.plural}.yml`, header({id:`L3-R04-v2-${String(i+1).padStart(2,'0')}`, atomId:'R-04', stage:5, type:'FunctionWriteCard'}, `2-field ${e.plural}`) +
`stem: |
  Variation: ${e.plural} with ONLY 2 fields (${e.fields[0]!.name}, ${e.fields[1]!.name}).
prompt: "2-field variation"
canonicalAnswer: |
${indent(fn)}
keyChecks:
  - "void read_${e.plural}(${e.name}_data &${e.list}[], int ${e.count})"
  - "cin >> ${e.list}[i].${e.fields[0]!.name};"
  - "cin >> ${e.list}[i].${e.fields[1]!.name};"
forbiddenTokens:
  - "while"
explanation: |
  Same skeleton; the body has 2 prompt-pairs instead of 3.
passByRefRequired: true
${SOURCE_V2}${FOOTER}`);
    n++;
  }
  // 10 4-field
  for (let i=0;i<10;i++) {
    const e = ENTITIES[i]!;
    const extraField = {name: 'extra', type: 'double' as const, prompt: 'Extra: '};
    const fields = [...e.fields, extraField];
    const lines: string[] = [];
    lines.push(`void read_${e.plural}(${e.name}_data &${e.list}[], int ${e.count})`);
    lines.push(`{`);
    lines.push(`  for (int i = 0; i < ${e.count}; i++)`);
    lines.push(`  {`);
    for (const f of fields) {
      lines.push(`    cout << "${f.prompt}";`);
      lines.push(`    cin >> ${e.list}[i].${f.name};`);
    }
    lines.push(`  }`);
    lines.push(`}`);
    const fn = lines.join('\n');
    w(`${dir}/v4-${String(i+1).padStart(2,'0')}-${e.plural}.yml`, header({id:`L3-R04-v4-${String(i+1).padStart(2,'0')}`, atomId:'R-04', stage:5, type:'FunctionWriteCard'}, `4-field ${e.plural}`) +
`stem: |
  Variation: ${e.plural} with 4 fields (3 original + extra).
prompt: "4-field variation"
canonicalAnswer: |
${indent(fn)}
keyChecks:
  - "void read_${e.plural}(${e.name}_data &${e.list}[], int ${e.count})"
${fields.map(f=>`  - "cin >> ${e.list}[i].${f.name};"`).join('\n')}
forbiddenTokens:
  - "while"
explanation: |
  4 fields = 4 prompt-pairs in struct-declaration order.
passByRefRequired: true
${SOURCE_V2}${FOOTER}`);
    n++;
  }
  // 5 5-field
  for (let i=0;i<5;i++) {
    const e = ENTITIES[i]!;
    const extras = [
      {name:'extra1', type:'double' as const, prompt:'Extra1: '},
      {name:'extra2', type:'int' as const,    prompt:'Extra2: '},
    ];
    const fields = [...e.fields, ...extras];
    const lines: string[] = [];
    lines.push(`void read_${e.plural}(${e.name}_data &${e.list}[], int ${e.count})`);
    lines.push(`{`);
    lines.push(`  for (int i = 0; i < ${e.count}; i++)`);
    lines.push(`  {`);
    for (const f of fields) {
      lines.push(`    cout << "${f.prompt}";`);
      lines.push(`    cin >> ${e.list}[i].${f.name};`);
    }
    lines.push(`  }`);
    lines.push(`}`);
    const fn = lines.join('\n');
    w(`${dir}/v5-${String(i+1).padStart(2,'0')}-${e.plural}.yml`, header({id:`L3-R04-v5-${String(i+1).padStart(2,'0')}`, atomId:'R-04', stage:5, type:'FunctionWriteCard'}, `5-field ${e.plural}`) +
`stem: |
  Variation: ${e.plural} with 5 fields (3 original + 2 extras).
prompt: "5-field variation"
canonicalAnswer: |
${indent(fn)}
keyChecks:
  - "void read_${e.plural}(${e.name}_data &${e.list}[], int ${e.count})"
${fields.map(f=>`  - "cin >> ${e.list}[i].${f.name};"`).join('\n')}
forbiddenTokens:
  - "while"
explanation: |
  5 fields = 5 prompt-pairs in struct-declaration order.
passByRefRequired: true
${SOURCE_V2}${FOOTER}`);
    n++;
  }
  // 10 param-name variants (rename count parameter)
  const paramNames = ['n','count','total','length','size_in','given','passed','arg','m','k'];
  paramNames.forEach((p, idx) => {
    const e = ENTITIES[idx]!;
    const orig = readFn(e);
    const fn = orig.replace(/number_to_read/g, p);
    w(`${dir}/param-${String(idx+1).padStart(2,'0')}-${p}.yml`, header({id:`L3-R04-param-${String(idx+1).padStart(2,'0')}`, atomId:'R-04', stage:5, type:'FunctionWriteCard'}, `param name '${p}'`) +
`stem: |
  Variation: read_${e.plural} with count parameter renamed to '${p}'.
prompt: "param-name variant"
canonicalAnswer: |
${indent(fn)}
keyChecks:
  - "int ${p}"
  - "for (int i = 0; i < ${p}; i++)"
forbiddenTokens:
  - "while"
explanation: |
  Same skeleton; the count parameter name is just a label. Use it consistently in the for-loop bound.
passByRefRequired: true
${SOURCE_V2}${FOOTER}`);
    n++;
  });
  // 5 list-name variants
  const listNames = [
    {p:'items', e: E_DESK},
    {p:'arr',   e: E_COMP},
    {p:'data',  e: E_BOOK},
    {p:'list',  e: E_CAR},
    {p:'all',   e: E_PHONE},
  ];
  listNames.forEach((spec, idx) => {
    const e: Entity = {...spec.e, list: spec.p};
    const fn = readFn(e);
    w(`${dir}/listname-${String(idx+1).padStart(2,'0')}-${spec.p}.yml`, header({id:`L3-R04-listname-${String(idx+1).padStart(2,'0')}`, atomId:'R-04', stage:5, type:'FunctionWriteCard'}, `list-name '${spec.p}'`) +
`stem: |
  Variation: read_${spec.e.plural} but the list parameter is named '${spec.p}'.
prompt: "list-name variant"
canonicalAnswer: |
${indent(fn)}
keyChecks:
  - "&${spec.p}[]"
${e.fields.map(f=>`  - "${spec.p}[i].${f.name}"`).join('\n')}
forbiddenTokens:
  - "while"
explanation: |
  Use the list name consistently in [i].field accesses.
passByRefRequired: true
${SOURCE_V2}${FOOTER}`);
    n++;
  });
  // 5 string fields
  for (let i=0;i<5;i++) {
    const eBase = ENTITIES[i+5]!;
    const stringField = {name: 'name', type: 'string' as const, prompt: 'Name: '};
    const e: Entity = {...eBase, fields: [stringField, ...eBase.fields.slice(0,2)]};
    const fn = readFn(e);
    w(`${dir}/string-${String(i+1).padStart(2,'0')}-${e.plural}.yml`, header({id:`L3-R04-string-${String(i+1).padStart(2,'0')}`, atomId:'R-04', stage:5, type:'FunctionWriteCard'}, `string field ${e.plural}`) +
`stem: |
  Variation: ${e.plural} with a string 'name' as the first field.
  cin >> works for whitespace-delimited string tokens.
prompt: "string-field variant"
canonicalAnswer: |
${indent(fn)}
keyChecks:
  - "cin >> ${e.list}[i].name;"
forbiddenTokens:
  - "while"
  - "getline"
explanation: |
  cin >> reads up to first whitespace into the string. No getline required for single-token names.
passByRefRequired: true
${SOURCE_V2}${FOOTER}`);
    n++;
  }
  // 5 mixed-type
  for (let i=0;i<5;i++) {
    const e = ENTITIES[i+10]!;
    const fn = readFn(e);
    w(`${dir}/mixed-${String(i+1).padStart(2,'0')}-${e.plural}.yml`, header({id:`L3-R04-mixed-${String(i+1).padStart(2,'0')}`, atomId:'R-04', stage:5, type:'FunctionWriteCard'}, `mixed-type ${e.plural}`) +
`stem: |
  Variation: ${e.plural} with mixed int + double fields.
  ${e.fields.map(f=>`${f.type} ${f.name}`).join(', ')}.
prompt: "mixed-type variant"
canonicalAnswer: |
${indent(fn)}
keyChecks:
${e.fields.map(f=>`  - "cin >> ${e.list}[i].${f.name};"`).join('\n')}
forbiddenTokens:
  - "while"
explanation: |
  cin >> is overloaded for int and double. Same prompt-pair pattern works for both.
passByRefRequired: true
${SOURCE_V2}${FOOTER}`);
    n++;
  }
  console.log(`S5 Variations: ${n} cards`);
}

// ---------- S6 SPEED (20) ----------
function s6Speed() {
  const dir = 'S6-Speed';
  let n = 0;
  // 5 V2.0 timed (read_desks)
  for (let i=0;i<5;i++) {
    const code = readFn(E_DESK);
    w(`${dir}/v20-${String(i+1).padStart(2,'0')}.yml`, header({id:`L3-R05-v20-${String(i+1).padStart(2,'0')}`, atomId:'R-05', stage:6, type:'SpeedDrillCard'}, 'V2.0 timed read_desks') +
`stem: |
  TIMED (V2.0): write the full read_desks function in 60 seconds.
flashSeconds: 5
targetSeconds: 60
prompt: "V2.0 timed: read_desks (3 fields)."
canonicalAnswer: |
${indent(code)}
keyChecks:
  - "void read_desks(desk_data &desks[], int number_to_read)"
  - "for (int i = 0; i < number_to_read; i++)"
  - "cin >> desks[i].width;"
  - "cin >> desks[i].height;"
  - "cin >> desks[i].depth;"
forbiddenTokens:
  - "while"
explanation: |
  V2.0 exam shape; muscle-memory the 12 lines.
${SOURCE_V2}${FOOTER}`);
    n++;
  }
  // 5 practice timed (read_computers)
  for (let i=0;i<5;i++) {
    const code = readFn(E_COMP);
    w(`${dir}/practice-${String(i+1).padStart(2,'0')}.yml`, header({id:`L3-R05-practice-${String(i+1).padStart(2,'0')}`, atomId:'R-05', stage:6, type:'SpeedDrillCard'}, 'practice timed read_computers') +
`stem: |
  TIMED (practice): write the full read_computers function in 60 seconds.
flashSeconds: 5
targetSeconds: 60
prompt: "Practice timed: read_computers (3 fields)."
canonicalAnswer: |
${indent(code)}
keyChecks:
  - "void read_computers(computer_data &computers[], int number_to_read)"
  - "for (int i = 0; i < number_to_read; i++)"
  - "cin >> computers[i].cpu_speed;"
  - "cin >> computers[i].ram_gb;"
  - "cin >> computers[i].price;"
forbiddenTokens:
  - "while"
explanation: |
  Practice-test Q3 shape under timed conditions.
${SOURCE_PR}${FOOTER}`);
    n++;
  }
  // 5 novel timed
  for (let i=0;i<5;i++) {
    const e = ENTITIES[i+5]!;
    const code = readFn(e);
    w(`${dir}/novel-${String(i+1).padStart(2,'0')}-${e.plural}.yml`, header({id:`L3-R05-novel-${String(i+1).padStart(2,'0')}`, atomId:'R-05', stage:6, type:'SpeedDrillCard'}, `novel timed read_${e.plural}`) +
`stem: |
  TIMED (novel): write the full read_${e.plural} function in 75 seconds.
  ${e.fields.map(f=>`${f.type} ${f.name}`).join(', ')}.
flashSeconds: 5
targetSeconds: 75
prompt: "Novel timed: read_${e.plural}."
canonicalAnswer: |
${indent(code)}
keyChecks:
  - "void read_${e.plural}(${e.name}_data &${e.list}[], int ${e.count})"
  - "for (int i = 0; i < ${e.count}; i++)"
${e.fields.map(f=>`  - "cin >> ${e.list}[i].${f.name};"`).join('\n')}
forbiddenTokens:
  - "while"
explanation: |
  Novel entity under time pressure. Skeleton is invariant.
${SOURCE_V2}${FOOTER}`);
    n++;
  }
  // 5 mixed mocks (random entity)
  const mocks = [E_FRIDGE, E_GAME, E_BOAT, E_CHAIR, E_LAPTOP];
  mocks.forEach((e, idx)=>{
    const code = readFn(e);
    w(`${dir}/mock-${String(idx+1).padStart(2,'0')}-${e.plural}.yml`, header({id:`L3-R05-mock-${String(idx+1).padStart(2,'0')}`, atomId:'R-05', stage:6, type:'SpeedDrillCard'}, `mixed mock read_${e.plural}`) +
`stem: |
  MIXED MOCK: write the full read_${e.plural} function in 90 seconds.
  Random entity surface; check for off-by-one and missing-& errors after writing.
flashSeconds: 5
targetSeconds: 90
prompt: "Mixed mock: read_${e.plural}."
canonicalAnswer: |
${indent(code)}
keyChecks:
  - "void read_${e.plural}(${e.name}_data &${e.list}[], int ${e.count})"
  - "for (int i = 0; i < ${e.count}; i++)"
${e.fields.map(f=>`  - "cin >> ${e.list}[i].${f.name};"`).join('\n')}
forbiddenTokens:
  - "while"
explanation: |
  Final fluency check. Same skeleton at exam pace.
${SOURCE_V2}${FOOTER}`);
    n++;
  });
  console.log(`S6 Speed: ${n} cards`);
}

// ---------- main ----------
function main() {
  s1Tour();
  s2Template();
  s3Components();
  s4Compose();
  s5Variations();
  s6Speed();
  console.log('DONE');
}
main();
