// One-shot generator for M10 mock exams.
// 5 mock exam variants × 4 questions (Q1 trace + Q2/Q3/Q4 writes) = 20 cards.
// All tagged atomId = ME-NN to enable timer overlay detection.
//
// Run: npx tsx build/gen-m10-mock-exams.ts (appends to data/cards.json + writes 5 outlines)

import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const CARDS_PATH = resolve(ROOT, 'data/cards.json');

interface Step {
  line: number;
  variable: string;
  value: string;
  condition?: string;
}

interface TraceCardOut {
  type: 'trace';
  atomId: string;
  code: string;
  variables: string[];
  expectedSteps: Step[];
  userInputs: string[];
  inputLabels: string[];
  terminalOutput: string[];
  inputMode: 'final-only';
  teachMe: string;
}

interface WriteCardOut {
  type: 'write';
  atomId: string;
  level: 1 | 2 | 3;
  spec: string;
  expectedAnswer: string;
  keyChecks: string[];
  forbidden?: string[];
  explanation: string;
}

interface MockExam {
  id: string;
  entity: string;
  funcName: string;
  numbers: number[];   // Q1 array
  fields: { type: string; name: string }[];
}

const EXAMS: MockExam[] = [
  { id: 'ME-01', entity: 'computer_data', funcName: 'read_computers',
    numbers: [3.2, 7.1, 5.0, 9.4, 2.8],
    fields: [{ type: 'int', name: 'id' }, { type: 'string', name: 'description' }, { type: 'string', name: 'location' }] },
  { id: 'ME-02', entity: 'student_data', funcName: 'read_students',
    numbers: [88.5, 91.0, 76.2, 65.4, 82.1],
    fields: [{ type: 'int', name: 'id' }, { type: 'string', name: 'name' }, { type: 'string', name: 'course' }] },
  { id: 'ME-03', entity: 'vehicle_data', funcName: 'read_vehicles',
    numbers: [4.4, 1.2, 8.7, 6.0, 3.5],
    fields: [{ type: 'int', name: 'year' }, { type: 'string', name: 'make' }, { type: 'string', name: 'model' }] },
  { id: 'ME-04', entity: 'sensor_data', funcName: 'read_sensors',
    numbers: [0.5, 1.8, 2.1, 0.9, 3.0],
    fields: [{ type: 'int', name: 'id' }, { type: 'string', name: 'type' }, { type: 'string', name: 'location' }] },
  { id: 'ME-05', entity: 'patient_record', funcName: 'read_patients',
    numbers: [5.0, 4.2, 6.8, 3.1, 7.7],
    fields: [{ type: 'int', name: 'id' }, { type: 'string', name: 'name' }, { type: 'string', name: 'ward' }] },
];

function fmt(n: number): string {
  return Number.isInteger(n) ? n.toFixed(1) : String(n);
}

function fmtSpec(f: { type: string; name: string }): string {
  return f.type === 'int' ? '%d' : '%s';
}

function fmtArg(f: { type: string; name: string }): string {
  return f.type === 'int' ? `list[i].${f.name}` : `list[i].${f.name}.c_str()`;
}

function buildQ1Trace(e: MockExam): TraceCardOut {
  const code = `struct stat_double {
    double numbers[5];
    double mystery;
};

void who_am_i(stat_double &data) {
    data.mystery = data.numbers[0];
    for (int i = 1; i < 5; i++) {
        if (data.numbers[i] > data.mystery) {
            data.mystery = data.numbers[i];
        }
    }
}

int main() {
    stat_double d;
    d.numbers[0] = ${fmt(e.numbers[0]!)};
    d.numbers[1] = ${fmt(e.numbers[1]!)};
    d.numbers[2] = ${fmt(e.numbers[2]!)};
    d.numbers[3] = ${fmt(e.numbers[3]!)};
    d.numbers[4] = ${fmt(e.numbers[4]!)};
    who_am_i(d);
    return 0;
}`;
  const steps: Step[] = [];
  let mystery = e.numbers[0]!;
  steps.push({ line: 6, variable: 'data.mystery', value: fmt(mystery) });
  for (let i = 1; i < 5; i++) {
    const c = e.numbers[i]!;
    if (c > mystery) {
      mystery = c;
      steps.push({ line: 9, variable: 'data.mystery', value: fmt(mystery), condition: `${fmt(c)} > prev → true` });
    }
  }
  return {
    type: 'trace',
    atomId: e.id,
    code,
    variables: ['data.mystery'],
    expectedSteps: steps,
    userInputs: [],
    inputLabels: [],
    terminalOutput: [],
    inputMode: 'final-only',
    teachMe: `Mock exam ${e.id} Q1: trace who_am_i. Final mystery = ${fmt(mystery)}.`,
  };
}

function buildQ2Write(e: MockExam): WriteCardOut {
  const expected = `struct ${e.entity} {\n    ${e.fields[0]!.type} ${e.fields[0]!.name};\n    ${e.fields[1]!.type} ${e.fields[1]!.name};\n    ${e.fields[2]!.type} ${e.fields[2]!.name};\n};`;
  return {
    type: 'write',
    atomId: e.id,
    level: 3,
    spec: `Mock exam ${e.id} Q2: Write the struct ${e.entity} with fields:\n  - ${e.fields[0]!.type} ${e.fields[0]!.name}\n  - ${e.fields[1]!.type} ${e.fields[1]!.name}\n  - ${e.fields[2]!.type} ${e.fields[2]!.name}`,
    expectedAnswer: expected,
    keyChecks: ['struct', e.entity, ...e.fields.flatMap((f) => [f.type, f.name]), '};'],
    forbidden: ['typedef', 'class'],
    explanation: 'Q2 archetype: struct + name + 3 fields + };.',
  };
}

function buildQ3Write(e: MockExam): WriteCardOut {
  const cinLines = e.fields.map((f) => `        cin >> list[i].${f.name};`).join('\n');
  const expected = `void ${e.funcName}(${e.entity} &list[], int count) {\n    for (int i = 0; i < count; i++) {\n${cinLines}\n    }\n}`;
  return {
    type: 'write',
    atomId: e.id,
    level: 3,
    spec: `Mock exam ${e.id} Q3: Write a function ${e.funcName} that reads ${e.fields.length} fields per element from cin into a ${e.entity} array. Use & on the array param. Read fields in order: ${e.fields.map((f) => f.name).join(', ')}.`,
    expectedAnswer: expected,
    keyChecks: ['void', e.funcName, '&list[]', 'int count', 'for', 'i = 0', 'i < count', 'cin', '>>', ...e.fields.map((f) => `list[i].${f.name}`)],
    forbidden: ['*list', 'cin <<'],
    explanation: 'Q3 archetype: void + & on array param + for-loop + cin per field.',
  };
}

function buildQ4Write(e: MockExam): WriteCardOut {
  const fmtString = e.fields.map(fmtSpec).join(' ') + '\\n';
  const args = e.fields.map(fmtArg).join(', ');
  const printfLine = `printf("${fmtString}", ${args});`;
  const expected = `int main() {
    const int MAX = 100;
    ${e.entity} list[MAX];
    int count;
    cout << "How many? ";
    cin >> count;
    ${e.funcName}(list, count);
    for (int i = 0; i < count; i++) {
        ${printfLine}
    }
    return 0;
}`;
  return {
    type: 'write',
    atomId: e.id,
    level: 3,
    spec: `Mock exam ${e.id} Q4: Write a full main() that reads count from cin, calls ${e.funcName}(list, count), and prints each record using printf with format "${fmtString}".`,
    expectedAnswer: expected,
    keyChecks: ['int main', 'const int MAX', `${e.entity} list[MAX]`, 'int count', 'cin', '>>', `${e.funcName}(list, count)`, 'for', 'i = 0', 'i < count', 'printf', 'return 0'],
    forbidden: undefined,
    explanation: 'Q4 archetype: const + array + cin + read_X call + printf loop + return 0.',
  };
}

function buildOutline(e: MockExam): string {
  return `id: ${e.id}
fact: "mock exam ${e.id.toLowerCase()}"
words: 4
level: 17
deps: [HE-16, SW-01, RW-01, MW-01]
q_tags: { Q1: C, Q2: C, Q3: C, Q4: C }
pfg_source: []
test2_evidence: []
canonical_example: ""
expected_output: ""
sit102_quirks: ["90-min timed exam", "no retry inside exam", "all 4 questions in sequence"]
misconceptions: []
render_hints:
  memorize_seed_phrases:
    - "mock exam ${e.id.toLowerCase()}"
acceptance: { memorize: ["≤7 words"] }
lint: { miller_max_words: 7 }
status: locked
`;
}

function main() {
  // Write 5 ME outlines
  for (const e of EXAMS) {
    const path = resolve(ROOT, 'outlines/L17', `${e.id}.yml`);
    writeFileSync(path, buildOutline(e));
  }

  // Build 20 mock exam cards
  const cards: (TraceCardOut | WriteCardOut)[] = [];
  for (const e of EXAMS) {
    cards.push(buildQ1Trace(e));
    cards.push(buildQ2Write(e));
    cards.push(buildQ3Write(e));
    cards.push(buildQ4Write(e));
  }

  const existing = JSON.parse(readFileSync(CARDS_PATH, 'utf8')) as unknown[];
  const merged = [...existing, ...cards];
  writeFileSync(CARDS_PATH, JSON.stringify(merged, null, 2));

  console.log(`wrote 5 ME outlines + ${cards.length} mock exam cards.`);
  console.log(`total cards: ${merged.length}`);
}

main();
