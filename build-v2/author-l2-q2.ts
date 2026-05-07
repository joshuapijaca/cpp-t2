// =====================================================================
// cpp-t2 / build-v2 / author-l2-q2.ts
// Skeleton author — L2 Q2 Write Struct, 240 cards across S1..S6
// Author: SA-L2-Q2 (skeleton-author)
// =====================================================================
//
// Emits 240 cards as individual YAMLs under data/v2/cards/L2/<atom>/.
//
// Stage breakdown:
//   S1 Tour       20  (showAnswer 4, spotError 6, worked 5, compare 3, recall 2)
//   S2 Template   30  (skeleton 12, closing-semi 6, struct-keyword 4, ident 5, reserved 3)
//   S3 Components 80  (50 noun-to-type + 15 naming + 10 ordering + 5 spacing)
//   S4 Compose    70  (30 entity prompts × 1-3 + free-write tail)
//   S5 Variations 30  (10 entityMatrix, 8 reverse, 4 bool, 3 char, 3 array, 2 four-field)
//   S6 Speed      20  (8 @ 30s, 8 @ 60s, 4 @ 90s)
// =====================================================================

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const CARDS = resolve(ROOT, 'data/v2/cards/L2');
const CB = 'SA-L2-Q2';
const SRC_PRACTICE_V2 = { kind: 'practice', ref: 'Test 2 V2.0 — desk_data { int room_id; int d_id; int number_of_screens; }' };
const SRC_PRACTICE_COMPUTER = { kind: 'practice', ref: 'Practice test — computer_data { int id; string description; string location; }' };
const SRC_PFG_STRUCT = { kind: 'pfg', ref: 'Programming Fundamentals Guide § part-2/3-structuring-data/2-trailside/03-01-struct' };
const SRC_SPEC_S1 = { kind: 'practice', ref: 'docs/16_test2_specific_redesign_v2.md PART IV §4.3 S1 TOUR' };
const SRC_SPEC_S2 = { kind: 'practice', ref: 'docs/16_test2_specific_redesign_v2.md PART IV §4.3 S2 TEMPLATE' };
const SRC_SPEC_S3 = { kind: 'practice', ref: 'docs/16_test2_specific_redesign_v2.md PART IV §4.4 S3 COMPONENTS' };
const SRC_SPEC_S4 = { kind: 'practice', ref: 'docs/16_test2_specific_redesign_v2.md PART IV §4.5 S4 COMPOSE' };
const SRC_SPEC_S5 = { kind: 'practice', ref: 'docs/16_test2_specific_redesign_v2.md PART IV §4.6 S5 VARIATIONS' };
const SRC_SPEC_S6 = { kind: 'practice', ref: 'docs/16_test2_specific_redesign_v2.md PART IV §4.3 S6 SPEED' };

const FORBIDDEN_DEFAULT = ['class', 'Struct', 'STRUCT', 'typedef', '*', '->'];
const CMS_STRUCT = ['CM-F20a', 'CM-F20b', 'CM-F20c', 'CM-F20d', 'CM-F20e'];

type Card = Record<string, unknown>;

function yamlEscape(s: string): string {
  // Use literal block scalar to avoid escaping
  return s;
}

function dumpYaml(c: Card): string {
  // tiny YAML dumper that handles strings, arrays, nested objects, multiline strings
  const lines: string[] = [];
  emit(c, '', lines);
  return lines.join('\n') + '\n';
}

function emit(value: unknown, indent: string, out: string[]): void {
  if (value === null || value === undefined) { out.push(indent + 'null'); return; }
  if (typeof value === 'string') {
    if (value.includes('\n')) {
      out.push('|');
      for (const line of value.split('\n')) {
        out.push(indent + '  ' + line);
      }
    } else {
      out.push(JSON.stringify(value));
    }
    return;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    out.push(String(value));
    return;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) { out.push('[]'); return; }
    out.push('');
    for (const item of value) {
      const sub: string[] = [];
      emit(item, indent + '  ', sub);
      // first sub line follows "- "
      out.push(indent + '- ' + sub[0]);
      for (let i = 1; i < sub.length; i++) out.push(sub[i]);
    }
    return;
  }
  // object
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length === 0) { out.push('{}'); return; }
  out.push('');
  for (const [k, v] of entries) {
    if (typeof v === 'string' && v.includes('\n')) {
      out.push(indent + k + ': |');
      for (const line of v.split('\n')) {
        out.push(indent + '  ' + line);
      }
    } else if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object') {
      out.push(indent + k + ':');
      for (const item of v) {
        const sub: string[] = [];
        emit(item, indent + '  ', sub);
        // sub[0] is empty string (from object header), so iterate
        const innerEntries = Object.entries(item as Record<string, unknown>);
        const firstKey = innerEntries[0];
        if (firstKey) {
          const [fk, fv] = firstKey;
          out.push(indent + '  - ' + fk + ': ' + JSON.stringify(fv));
          for (let i = 1; i < innerEntries.length; i++) {
            const [ik, iv] = innerEntries[i] as [string, unknown];
            out.push(indent + '    ' + ik + ': ' + JSON.stringify(iv));
          }
        }
      }
    } else if (Array.isArray(v)) {
      out.push(indent + k + ': ' + JSON.stringify(v));
    } else if (typeof v === 'object' && v !== null) {
      const innerEntries = Object.entries(v as Record<string, unknown>);
      if (innerEntries.length === 0) {
        out.push(indent + k + ': {}');
      } else {
        out.push(indent + k + ':');
        for (const [ik, iv] of innerEntries) {
          if (typeof iv === 'string' && iv.includes('\n')) {
            out.push(indent + '  ' + ik + ': |');
            for (const line of iv.split('\n')) {
              out.push(indent + '    ' + line);
            }
          } else {
            out.push(indent + '  ' + ik + ': ' + JSON.stringify(iv));
          }
        }
      }
    } else {
      out.push(indent + k + ': ' + JSON.stringify(v));
    }
  }
}

function ensureDir(p: string): void {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function writeCard(atomDir: string, filename: string, card: Card): void {
  ensureDir(atomDir);
  const target = resolve(atomDir, filename);
  writeFileSync(target, dumpYaml(card));
}

// ---------------------------------------------------------------------
// Helper builders for each card type
// ---------------------------------------------------------------------

function structAnswer(name: string, fields: Array<[string, string]>): string {
  const lines = [`struct ${name}`, '{'];
  for (const [t, f] of fields) lines.push(`    ${t} ${f};`);
  lines.push('};');
  return lines.join('\n');
}

function tourShowAnswer(idx: number, atomId: string, entity: string, name: string, fields: Array<[string, string]>, qContext: string): Card {
  const code = structAnswer(name, fields);
  return {
    id: `L2-S1-tour-${String(idx).padStart(2, '0')}`,
    schemaVersion: 'v2',
    atomId,
    qTags: ['Q2'],
    stage: 1,
    level: 'L2',
    type: 'DemoCard',
    stem: `Q2 Tour ${idx} — see the canonical answer for ${entity}. ${qContext} Read the structure top-to-bottom: keyword, name, brace, fields, closing \`};\`.`,
    whyOneLine: `Q2 always produces this 6-line shape — keyword + snake_case name + brace + 1-line-per-field + ${name === 'desk_data' ? 'closing }; (the highest-frequency exam loss)' : 'closing };'}.`,
    demoCode: code,
    highlightTokens: ['struct', name, '};'],
    usedIn: ['Q2'],
    source: name === 'desk_data' ? SRC_PRACTICE_V2 : (name === 'computer_data' ? SRC_PRACTICE_COMPUTER : SRC_PFG_STRUCT),
    commonMistakeIds: CMS_STRUCT,
    status: 'NEW',
    authoringStatus: 'DRAFT',
    createdBy: CB,
    notes: `S1 show-answer #${idx}. Pure recognition — no input.`,
  };
}

function tourSpotError(idx: number, atomId: string, brokenCode: string, fixedCode: string, bugCategory: string, explanation: string, bugLocations: number[] = [3]): Card {
  return {
    id: `L2-S1-tour-${String(idx).padStart(2, '0')}-spot`,
    schemaVersion: 'v2',
    atomId,
    qTags: ['Q2'],
    stage: 1,
    level: 'L2',
    type: 'FaultInjectionCard',
    stem: `Q2 Tour spot-error #${idx}. The struct below has a single bug: ${bugCategory}. Identify what's wrong and write the fixed version.`,
    brokenCode,
    bugLocations,
    fixedCode,
    bugCategory,
    keyChecks: ['struct', '};'],
    explanation,
    source: SRC_SPEC_S1,
    commonMistakeIds: CMS_STRUCT,
    status: 'NEW',
    authoringStatus: 'DRAFT',
    createdBy: CB,
    notes: `Spot-error tour card. Drills the ${bugCategory} immunization.`,
  };
}

function tourWorked(idx: number, atomId: string, entity: string, name: string, prompt: string, fields: Array<[string, string]>, walkSteps: Array<[string, string]>): Card {
  const code = structAnswer(name, fields);
  return {
    id: `L2-S1-tour-${String(idx).padStart(2, '0')}-worked`,
    schemaVersion: 'v2',
    atomId,
    qTags: ['Q2'],
    stage: 1,
    level: 'L2',
    type: 'WalkthroughCard',
    stem: `Q2 worked example — produce \`${name}\` from the prompt: "${prompt}". Watch the 6-line shape build line by line.`,
    levelLabel: `L2 · Q2 Tour · ${name}`,
    fullCode: code,
    steps: walkSteps.map(([codeStep, annotation], i) => ({ line: i + 1, code: codeStep, annotation, atomIds: ['F-20'] })),
    source: SRC_SPEC_S1,
    commonMistakeIds: CMS_STRUCT,
    status: 'NEW',
    authoringStatus: 'DRAFT',
    createdBy: CB,
    notes: `Worked walkthrough #${idx} for ${entity}.`,
  };
}

function tourCompare(idx: number, atomId: string, codeA: string, codeB: string, prompt: string, canonicalAnswer: string, explanation: string): Card {
  return {
    id: `L2-S1-tour-${String(idx).padStart(2, '0')}-compare`,
    schemaVersion: 'v2',
    atomId,
    qTags: ['Q2'],
    stage: 1,
    level: 'L2',
    type: 'DeltaCard',
    stem: `Q2 Tour compare #${idx}. Two struct definitions side by side. Identify the meaningful difference.`,
    codeA,
    codeB,
    prompt,
    canonicalAnswer,
    keyChecks: [],
    explanation,
    source: SRC_SPEC_S1,
    commonMistakeIds: CMS_STRUCT,
    status: 'NEW',
    authoringStatus: 'DRAFT',
    createdBy: CB,
    notes: `Compare card sharpens spotting tiny differences (a missing ; vs not).`,
  };
}

function tourRecall(idx: number, atomId: string, code: string, question: string, options: Array<[string, string]>, correctLabel: string, explanation: string): Card {
  return {
    id: `L2-S1-tour-${String(idx).padStart(2, '0')}-recall`,
    schemaVersion: 'v2',
    atomId,
    qTags: ['Q2'],
    stage: 1,
    level: 'L2',
    type: 'DecomposeCard',
    stem: `Q2 Tour recall #${idx}. Read the struct and answer the comprehension question — pure recognition, no writing.`,
    code,
    question,
    options: options.map(([label, text]) => ({ label, text })),
    correctLabel,
    explanation,
    source: SRC_SPEC_S1,
    commonMistakeIds: CMS_STRUCT,
    status: 'NEW',
    authoringStatus: 'DRAFT',
    createdBy: CB,
    notes: `End-of-tour recognition check.`,
  };
}

function templSkeleton(idx: number, atomId: string, prompt: string, name: string, fields: Array<[string, string]>, focus: string): Card {
  const ans = structAnswer(name, fields);
  return {
    id: `L2-S2-templ-${String(idx).padStart(2, '0')}`,
    schemaVersion: 'v2',
    atomId,
    qTags: ['Q2'],
    stage: 2,
    level: 'L2',
    type: 'StructWriteCard',
    stem: `Q2 Template #${idx} — type the canonical 6-line skeleton verbatim. ${focus}`,
    prompt,
    canonicalAnswer: ans,
    requiredFields: fields.map(f => f[1]),
    keyChecks: ['struct ' + name, '};', ...fields.map(([t, f]) => `${t} ${f};`)],
    forbiddenTokens: FORBIDDEN_DEFAULT,
    explanation: `Skeleton drill: \`struct\` lowercase + name + opening \`{\` + one field per line each ending \`;\` + closing \`};\` (the highest-frequency Q2 error). ${focus}`,
    source: name === 'desk_data' ? SRC_PRACTICE_V2 : (name === 'computer_data' ? SRC_PRACTICE_COMPUTER : SRC_SPEC_S2),
    commonMistakeIds: CMS_STRUCT,
    status: 'NEW',
    authoringStatus: 'DRAFT',
    createdBy: CB,
    notes: `S2 skeleton drill.`,
  };
}

function templClosingSemi(idx: number, atomId: string, prompt: string, brokenCode: string, fixedCode: string): Card {
  return {
    id: `L2-S2-close-${String(idx).padStart(2, '0')}`,
    schemaVersion: 'v2',
    atomId,
    qTags: ['Q2'],
    stage: 2,
    level: 'L2',
    type: 'FaultInjectionCard',
    stem: `Q2 closing-\`};\` drill #${idx}. ${prompt} Add the missing terminator and write the fix.`,
    brokenCode,
    bugLocations: [brokenCode.split('\n').length],
    fixedCode,
    bugCategory: 'missing ; after closing }',
    keyChecks: ['};'],
    explanation: `The closing brace of a struct definition MUST be followed by a semicolon. \`}\` alone is a compile error and the most expensive Q2 mistake on the SIT102 test.`,
    source: SRC_SPEC_S2,
    commonMistakeIds: ['CM-F20a'],
    status: 'NEW',
    authoringStatus: 'DRAFT',
    createdBy: CB,
    notes: `Isolation drill on the highest-cost Q2 error.`,
  };
}

function templStructKeyword(idx: number, atomId: string, brokenCode: string, fixedCode: string, bugCategory: string): Card {
  return {
    id: `L2-S2-keyword-${String(idx).padStart(2, '0')}`,
    schemaVersion: 'v2',
    atomId,
    qTags: ['Q2'],
    stage: 2,
    level: 'L2',
    type: 'FaultInjectionCard',
    stem: `Q2 \`struct\` keyword drill #${idx}. The keyword must be lowercase; the type is not a class.`,
    brokenCode,
    bugLocations: [1],
    fixedCode,
    bugCategory,
    keyChecks: ['struct'],
    explanation: `C++ is case-sensitive: only \`struct\` (lowercase) is a valid keyword. \`Struct\`, \`STRUCT\`, and \`class\` are all wrong on Q2.`,
    source: SRC_SPEC_S2,
    commonMistakeIds: ['CM-F20c', 'CM-F20e'],
    status: 'NEW',
    authoringStatus: 'DRAFT',
    createdBy: CB,
    notes: `Keyword case + class-vs-struct immunization.`,
  };
}

function templIdent(idx: number, atomId: string, code: string, question: string, options: Array<[string, string]>, correctLabel: string, explanation: string): Card {
  return {
    id: `L2-S2-ident-${String(idx).padStart(2, '0')}`,
    schemaVersion: 'v2',
    atomId,
    qTags: ['Q2'],
    stage: 2,
    level: 'L2',
    type: 'DecomposeCard',
    stem: `Q2 identifier rules drill #${idx}. ${question.split('?')[0]}?`,
    code,
    question,
    options: options.map(([label, text]) => ({ label, text })),
    correctLabel,
    explanation,
    source: SRC_SPEC_S2,
    commonMistakeIds: ['CM-Q2-camelcase', 'CM-Q2-hyphen'],
    status: 'NEW',
    authoringStatus: 'DRAFT',
    createdBy: CB,
    notes: `Identifier-rules pick-the-correct.`,
  };
}

function templReserved(idx: number, atomId: string, badField: string, replacement: string): Card {
  const broken = `struct car_data\n{\n    int ${badField};\n    string make;\n};`;
  const fixed = `struct car_data\n{\n    int ${replacement};\n    string make;\n};`;
  return {
    id: `L2-S2-reserved-${String(idx).padStart(2, '0')}`,
    schemaVersion: 'v2',
    atomId,
    qTags: ['Q2'],
    stage: 2,
    level: 'L2',
    type: 'FaultInjectionCard',
    stem: `Q2 reserved-word ban drill #${idx}. The field name \`${badField}\` is a C++ keyword and cannot be used as an identifier. Choose a non-reserved alternative.`,
    brokenCode: broken,
    bugLocations: [3],
    fixedCode: fixed,
    bugCategory: 'reserved word as field name',
    keyChecks: [replacement, 'struct car_data', '};'],
    explanation: `\`${badField}\` is a C++ reserved word. Field names must be non-reserved snake_case identifiers. \`${replacement}\` works because it is not a keyword.`,
    source: SRC_SPEC_S2,
    commonMistakeIds: ['CM-Q2-reserved'],
    status: 'NEW',
    authoringStatus: 'DRAFT',
    createdBy: CB,
    notes: `Reserved-word ban with concrete substitution.`,
  };
}

function noun2type(idx: number, atomId: string, noun: string, correctType: 'int' | 'double' | 'string' | 'bool' | 'char', distractorTypes: string[], rationale: string): Card {
  const stem = `Q2 noun→type #${idx}. A struct field needs a type. The English noun \`${noun}\` should be stored as which C++ primitive?`;
  // craft three distractors (string forms) — make them look like valid lines
  const correct = `\`${correctType}\` — ${rationale}`;
  const distractors = distractorTypes.slice(0, 3).map((t) => {
    let why: string;
    if (t === 'int') why = 'integers cannot represent decimal or text content this noun implies.';
    else if (t === 'double') why = 'a floating-point number is overkill for this noun.';
    else if (t === 'string') why = 'a string is the wrong type for this scalar quantity.';
    else if (t === 'bool') why = 'a true/false flag does not capture this noun.';
    else if (t === 'char') why = 'a single character cannot hold this noun.';
    else why = 'wrong type for this noun.';
    return `\`${t}\` — ${why}`;
  });
  while (distractors.length < 3) distractors.push(`\`void\` — \`void\` is not a value type and cannot store data.`);
  return {
    id: `L2-S3a-n2t-${String(idx).padStart(2, '0')}`,
    schemaVersion: 'v2',
    atomId,
    qTags: ['Q2'],
    stage: 3,
    level: 'L2',
    type: 'MCQCard',
    stem,
    correct,
    distractors,
    explanation: `\`${noun}\` is best stored as \`${correctType}\` because ${rationale}`,
    source: SRC_SPEC_S3,
    commonMistakeIds: ['CM-Q2-wrong-type'],
    status: 'NEW',
    authoringStatus: 'DRAFT',
    createdBy: CB,
    notes: `Noun→type drill, ${correctType} bucket.`,
  };
}

function naming(idx: number, atomId: string, code: string, question: string, options: Array<[string, string]>, correctLabel: string, explanation: string): Card {
  return {
    id: `L2-S3b-name-${String(idx).padStart(2, '0')}`,
    schemaVersion: 'v2',
    atomId,
    qTags: ['Q2'],
    stage: 3,
    level: 'L2',
    type: 'DecomposeCard',
    stem: `Q2 field-naming drill #${idx}. snake_case only. Choose the legal field-name format.`,
    code,
    question,
    options: options.map(([l, t]) => ({ label: l, text: t })),
    correctLabel,
    explanation,
    source: SRC_SPEC_S3,
    commonMistakeIds: ['CM-Q2-camelcase', 'CM-Q2-hyphen', 'CM-Q2-reserved'],
    status: 'NEW',
    authoringStatus: 'DRAFT',
    createdBy: CB,
    notes: `Field-naming legality check.`,
  };
}

function ordering(idx: number, atomId: string, prompt: string, name: string, fields: Array<[string, string]>): Card {
  const ans = structAnswer(name, fields);
  return {
    id: `L2-S3-order-${String(idx).padStart(2, '0')}`,
    schemaVersion: 'v2',
    atomId,
    qTags: ['Q2'],
    stage: 3,
    level: 'L2',
    type: 'StructWriteCard',
    stem: `Q2 multi-field ordering #${idx}. Write a struct with fields appearing in the exact order given in the prompt. Field-order discipline supports later Q3 read-loop and Q4 print-loop sequencing.`,
    prompt,
    canonicalAnswer: ans,
    requiredFields: fields.map(f => f[1]),
    keyChecks: ['struct ' + name, '};', ...fields.map(([t, f]) => `${t} ${f};`)],
    forbiddenTokens: FORBIDDEN_DEFAULT,
    explanation: `${fields.length} fields, listed top-to-bottom in the prompt order. Each field on its own line, each ending \`;\`, closing \`};\`.`,
    source: SRC_SPEC_S3,
    commonMistakeIds: ['CM-Q2-twofields'],
    status: 'NEW',
    authoringStatus: 'DRAFT',
    createdBy: CB,
    notes: `Multi-field write — order matters.`,
  };
}

function spacing(idx: number, atomId: string, brokenCode: string, fixedCode: string, bugCategory: string): Card {
  return {
    id: `L2-S3c-space-${String(idx).padStart(2, '0')}`,
    schemaVersion: 'v2',
    atomId,
    qTags: ['Q2'],
    stage: 3,
    level: 'L2',
    type: 'FaultInjectionCard',
    stem: `Q2 spacing drill #${idx}. The struct compiles but its layout is wrong by SIT102 style: ${bugCategory}. One field per line, 4-space indent inside braces.`,
    brokenCode,
    bugLocations: [2],
    fixedCode,
    bugCategory,
    keyChecks: ['};'],
    explanation: `SIT102 Q2 expects one field per line. Two-fields-on-one-line is graded as a defect even though it compiles.`,
    source: SRC_SPEC_S3,
    commonMistakeIds: ['CM-Q2-twofields'],
    status: 'NEW',
    authoringStatus: 'DRAFT',
    createdBy: CB,
    notes: `Whitespace correctness card.`,
  };
}

function compose(idx: number, atomId: string, prompt: string, name: string, fields: Array<[string, string]>, isRealTest: 'desk' | 'computer' | null = null): Card {
  const ans = structAnswer(name, fields);
  const realLabel = isRealTest === 'desk' ? ' (REAL TEST V2.0 entity)' : (isRealTest === 'computer' ? ' (PRACTICE TEST entity)' : '');
  return {
    id: `L2-S4-compose-${String(idx).padStart(2, '0')}-${name}`,
    schemaVersion: 'v2',
    atomId,
    qTags: ['Q2'],
    stage: 4,
    level: 'L2',
    type: 'StructWriteCard',
    stem: `Q2 Compose #${idx}${realLabel}. From the English description, write the full struct: name, opening brace, fields one per line, closing \`};\`.`,
    prompt,
    canonicalAnswer: ans,
    requiredFields: fields.map(f => f[1]),
    keyChecks: ['struct ' + name, '};', ...fields.map(([t, f]) => `${t} ${f};`)],
    forbiddenTokens: FORBIDDEN_DEFAULT,
    explanation: `${name} captures ${fields.length} attributes (${fields.map(f => f[1]).join(', ')}). Type-by-noun: ${fields.map(([t, f]) => `${f}→${t}`).join(', ')}.`,
    source: isRealTest === 'desk' ? SRC_PRACTICE_V2 : (isRealTest === 'computer' ? SRC_PRACTICE_COMPUTER : SRC_SPEC_S4),
    commonMistakeIds: CMS_STRUCT,
    status: 'NEW',
    authoringStatus: 'DRAFT',
    createdBy: CB,
    notes: `S4 full-compose card${realLabel}.`,
  };
}

function entityMatrix(idx: number, atomId: string, examples: Array<[string, string]>, prompt: string, canonicalAnswer: string): Card {
  return {
    id: `L2-S5-matrix-${String(idx).padStart(2, '0')}`,
    schemaVersion: 'v2',
    atomId,
    qTags: ['Q2'],
    stage: 5,
    level: 'L2',
    type: 'EntityMatrixCard',
    stem: `Q2 EntityMatrix #${idx}. Three example structs share a pattern. Apply the same pattern to a new entity.`,
    examples: examples.map(([l, t]) => ({ label: l, text: t })),
    prompt,
    canonicalAnswer,
    keyChecks: ['struct', '};'],
    explanation: `Pattern transfer: 3 fields, snake_case, one field per line. Fill in the new entity.`,
    source: SRC_SPEC_S5,
    commonMistakeIds: CMS_STRUCT,
    status: 'NEW',
    authoringStatus: 'DRAFT',
    createdBy: CB,
    notes: `RAVEN-style entity transfer.`,
  };
}

function reverse(idx: number, atomId: string, code: string, question: string, options: Array<[string, string]>, correctLabel: string, explanation: string): Card {
  return {
    id: `L2-S5-reverse-${String(idx).padStart(2, '0')}`,
    schemaVersion: 'v2',
    atomId,
    qTags: ['Q2'],
    stage: 5,
    level: 'L2',
    type: 'DecomposeCard',
    stem: `Q2 reverse drill #${idx}. Given the struct code, infer the most likely English entity description.`,
    code,
    question,
    options: options.map(([l, t]) => ({ label: l, text: t })),
    correctLabel,
    explanation,
    source: SRC_SPEC_S5,
    commonMistakeIds: ['CM-Q2-wrong-type'],
    status: 'NEW',
    authoringStatus: 'DRAFT',
    createdBy: CB,
    notes: `Reverse-engineer the prompt from the code.`,
  };
}

function bool(idx: number, atomId: string, prompt: string, name: string, fields: Array<[string, string]>): Card {
  const ans = structAnswer(name, fields);
  return {
    id: `L2-S5-bool-${String(idx).padStart(2, '0')}`,
    schemaVersion: 'v2',
    atomId,
    qTags: ['Q2'],
    stage: 5,
    level: 'L2',
    type: 'StructWriteCard',
    stem: `Q2 bool edge case #${idx}. Boolean fields use \`bool\`, not \`int\`, and idiomatically prefix with \`is_\` or \`has_\`.`,
    prompt,
    canonicalAnswer: ans,
    requiredFields: fields.map(f => f[1]),
    keyChecks: ['bool ', '};', 'struct ' + name],
    forbiddenTokens: FORBIDDEN_DEFAULT,
    explanation: `Boolean fields drill: \`bool ${fields.find(f => f[0] === 'bool')?.[1] ?? 'flag'};\` is the canonical form. \`int 0/1\` is wrong on Q2.`,
    source: SRC_SPEC_S5,
    commonMistakeIds: ['CM-Q2-bool-edge'],
    status: 'NEW',
    authoringStatus: 'DRAFT',
    createdBy: CB,
    notes: `bool edge case.`,
  };
}

function ch(idx: number, atomId: string, prompt: string, name: string, fields: Array<[string, string]>): Card {
  const ans = structAnswer(name, fields);
  return {
    id: `L2-S5-char-${String(idx).padStart(2, '0')}`,
    schemaVersion: 'v2',
    atomId,
    qTags: ['Q2'],
    stage: 5,
    level: 'L2',
    type: 'StructWriteCard',
    stem: `Q2 char edge case #${idx}. Single-character fields (grade, initial) use \`char\`, not \`string\`.`,
    prompt,
    canonicalAnswer: ans,
    requiredFields: fields.map(f => f[1]),
    keyChecks: ['char ', '};', 'struct ' + name],
    forbiddenTokens: FORBIDDEN_DEFAULT,
    explanation: `Single character → \`char field;\`. Multi-letter strings still use \`string\`.`,
    source: SRC_SPEC_S5,
    commonMistakeIds: ['CM-Q2-char-edge'],
    status: 'NEW',
    authoringStatus: 'DRAFT',
    createdBy: CB,
    notes: `char edge case.`,
  };
}

function arrayField(idx: number, atomId: string, prompt: string, name: string, fields: Array<[string, string]>): Card {
  // peek at array field; field syntax is `type name[SIZE];` so we encode that as the type "double[SIZE]" + name handle
  const lines = [`struct ${name}`, '{'];
  for (const [t, f] of fields) {
    if (t.includes('[')) {
      // type was `double[SIZE]`; emit `double name[SIZE];`
      const baseType = t.split('[')[0];
      const dim = t.substring(t.indexOf('['));
      lines.push(`    ${baseType} ${f}${dim};`);
    } else {
      lines.push(`    ${t} ${f};`);
    }
  }
  lines.push('};');
  const ans = lines.join('\n');
  return {
    id: `L2-S5-array-${String(idx).padStart(2, '0')}`,
    schemaVersion: 'v2',
    atomId,
    qTags: ['Q2'],
    stage: 5,
    level: 'L2',
    type: 'StructWriteCard',
    stem: `Q2 array-field peek #${idx}. A struct can hold a fixed-size array as one of its fields, written \`type name[SIZE];\`.`,
    prompt,
    canonicalAnswer: ans,
    requiredFields: fields.map(f => f[1]),
    keyChecks: ['struct ' + name, '};', '['],
    forbiddenTokens: FORBIDDEN_DEFAULT,
    explanation: `Q1 uses an array-field struct (\`stat_double { double numbers[SIZE]; double mystery; }\`). The pattern: \`type field_name[SIZE];\`.`,
    source: SRC_SPEC_S5,
    commonMistakeIds: CMS_STRUCT,
    status: 'NEW',
    authoringStatus: 'DRAFT',
    createdBy: CB,
    notes: `Q1-shape preview through Q2 lens.`,
  };
}

function fourField(idx: number, atomId: string, prompt: string, name: string, fields: Array<[string, string]>): Card {
  const ans = structAnswer(name, fields);
  return {
    id: `L2-S5-four-${String(idx).padStart(2, '0')}`,
    schemaVersion: 'v2',
    atomId,
    qTags: ['Q2'],
    stage: 5,
    level: 'L2',
    type: 'StructWriteCard',
    stem: `Q2 four-field mixed #${idx}. The struct has 4 fields with mixed primitive types — the closing \`};\` rule is unchanged.`,
    prompt,
    canonicalAnswer: ans,
    requiredFields: fields.map(f => f[1]),
    keyChecks: ['struct ' + name, '};'],
    forbiddenTokens: FORBIDDEN_DEFAULT,
    explanation: `Field count is variable; the 6-line skeleton becomes 7-line. Closing \`};\` is unchanged.`,
    source: SRC_SPEC_S5,
    commonMistakeIds: CMS_STRUCT,
    status: 'NEW',
    authoringStatus: 'DRAFT',
    createdBy: CB,
    notes: `4-field S5 wildcard preview.`,
  };
}

function speed(idx: number, atomId: string, prompt: string, name: string, fields: Array<[string, string]>, flashSeconds: number, targetSeconds: number, isRealTest: 'desk' | 'computer' | null = null): Card {
  const ans = structAnswer(name, fields);
  const realLabel = isRealTest === 'desk' ? ' [REAL TEST V2.0]' : (isRealTest === 'computer' ? ' [PRACTICE]' : '');
  return {
    id: `L2-S6-speed-${String(idx).padStart(2, '0')}-${name}`,
    schemaVersion: 'v2',
    atomId,
    qTags: ['Q2'],
    stage: 6,
    level: 'L2',
    type: 'SpeedDrillCard',
    stem: `Q2 Speed #${idx}${realLabel}. ${targetSeconds}s clock — type the full struct from the prompt. Closing \`};\` is the most-missed token under time pressure.`,
    prompt,
    canonicalAnswer: ans,
    keyChecks: ['struct ' + name, '};', ...fields.map(([t, f]) => `${t} ${f};`)],
    flashSeconds,
    targetSeconds,
    explanation: `Under-clock target ${targetSeconds}s. Closing \`};\` is the highest-frequency loss when rushed; type it before reviewing the body.`,
    source: isRealTest === 'desk' ? SRC_PRACTICE_V2 : (isRealTest === 'computer' ? SRC_PRACTICE_COMPUTER : SRC_SPEC_S6),
    commonMistakeIds: ['CM-F20a', 'CM-F20d'],
    status: 'NEW',
    authoringStatus: 'DRAFT',
    createdBy: CB,
    notes: `S6 timed drill at ${targetSeconds}s.`,
  };
}

// ---------------------------------------------------------------------
// S1 Tour content (20 cards)
// ---------------------------------------------------------------------

function buildS1Tour(): Card[] {
  const out: Card[] = [];
  // 4 showAnswer
  out.push(tourShowAnswer(1, 'L-21', 'desk_data', 'desk_data',
    [['int', 'room_id'], ['int', 'd_id'], ['int', 'number_of_screens']],
    'This is the literal struct from Test 2 V2.0 (the real exam attempt 1).'));
  out.push(tourShowAnswer(2, 'L-21', 'computer_data', 'computer_data',
    [['int', 'id'], ['string', 'description'], ['string', 'location']],
    'This is the practice-test entity used in the SIT102 seminar walkthrough.'));
  out.push(tourShowAnswer(3, 'L-21', 'book_data', 'book_data',
    [['string', 'title'], ['string', 'author'], ['int', 'pages']],
    'Generic 3-field example with mixed string/int types.'));
  out.push(tourShowAnswer(4, 'L-21', 'employee_data', 'employee_data',
    [['int', 'id'], ['string', 'name'], ['double', 'salary']],
    'Three primitives — int, string, double — in one struct.'));

  // 6 spotError
  out.push(tourSpotError(5, 'L-21',
    'struct desk_data\n{\n    int room_id;\n    int d_id;\n    int number_of_screens;\n}',
    'struct desk_data\n{\n    int room_id;\n    int d_id;\n    int number_of_screens;\n};',
    'missing ; after closing }',
    'The closing brace of a struct definition must be followed by a semicolon. This is the highest-frequency Q2 error on the SIT102 test.', [6]));
  out.push(tourSpotError(6, 'L-21',
    'struct Computer_Data\n{\n    int id;\n    string description;\n    string location;\n};',
    'struct computer_data\n{\n    int id;\n    string description;\n    string location;\n};',
    'capitalised struct name', 'Struct names use snake_case. Capitalisation breaks SIT102 style.', [1]));
  out.push(tourSpotError(7, 'L-21',
    'Struct desk_data\n{\n    int room_id;\n    int d_id;\n    int number_of_screens;\n};',
    'struct desk_data\n{\n    int room_id;\n    int d_id;\n    int number_of_screens;\n};',
    'capital Struct keyword', 'C++ keywords are case-sensitive. Use lowercase \`struct\`.', [1]));
  out.push(tourSpotError(8, 'L-21',
    'struct order_data\n{\n    int order_id\n    double total;\n    bool paid;\n};',
    'struct order_data\n{\n    int order_id;\n    double total;\n    bool paid;\n};',
    'missing ; on field line', 'Every field declaration must end with a semicolon, like every C++ statement.', [3]));
  out.push(tourSpotError(9, 'L-21',
    'class product_data\n{\n    string sku;\n    string name;\n    double price;\n};',
    'struct product_data\n{\n    string sku;\n    string name;\n    double price;\n};',
    'used class instead of struct', 'SIT102 Q2 specifies \`struct\`. \`class\` and \`struct\` differ on default access — use what the test asks for.', [1]));
  out.push(tourSpotError(10, 'L-21',
    'struct house_data\n{\n    string address; int bedrooms;\n    double price;\n};',
    'struct house_data\n{\n    string address;\n    int bedrooms;\n    double price;\n};',
    'two fields on one line', 'One field per line is SIT102 style for Q2. The compiler accepts the dense form, but the rubric does not.', [3]));

  // 5 worked — each step = [codeFragment, annotation]
  out.push(tourWorked(11, 'L-21', 'desk_data', 'desk_data',
    'A desk in a uni computer lab has three things: a room id, a desk id, and a screen count.',
    [['int', 'room_id'], ['int', 'd_id'], ['int', 'number_of_screens']],
    [
      ['struct desk_data', 'Pick the struct keyword (lowercase) and write the snake_case name.'],
      ['{', 'Open the body with a brace on its own line.'],
      ['    int room_id;', 'Field 1: a room id is a whole-number counter → int.'],
      ['    int d_id;', 'Field 2: another counter → int.'],
      ['    int number_of_screens;', 'Field 3: a count of screens → int.'],
      ['};', 'Close with `};` — this is the load-bearing terminator and the highest-frequency Q2 error.'],
    ]));
  out.push(tourWorked(12, 'L-21', 'computer_data', 'computer_data',
    'A computer record stores its inventory id, a free-text description, and where it lives in the building.',
    [['int', 'id'], ['string', 'description'], ['string', 'location']],
    [
      ['struct computer_data', 'Keyword `struct` plus snake_case name `computer_data`.'],
      ['{', 'Open body: `{` on its own line.'],
      ['    int id;', 'id is a counter → int.'],
      ['    string description;', 'description is free-text → string.'],
      ['    string location;', 'location is free-text → string.'],
      ['};', 'Close: `};` — do not forget the semicolon.'],
    ]));
  out.push(tourWorked(13, 'L-21', 'student_data', 'student_data',
    'A student has a numeric id, a full legal name, and a GPA between 0.0 and 4.0.',
    [['int', 'student_id'], ['string', 'full_name'], ['double', 'gpa']],
    [
      ['struct student_data', 'Keyword + snake_case name.'],
      ['{', 'Open the body.'],
      ['    int student_id;', 'student_id is a counter → int.'],
      ['    string full_name;', 'full_name is text → string.'],
      ['    double gpa;', 'GPA is decimal (0.0..4.0) → double.'],
      ['};', 'Close with `};`.'],
    ]));
  out.push(tourWorked(14, 'L-21', 'order_data', 'order_data',
    'An order has an order id, a money total, and a paid/unpaid flag.',
    [['int', 'order_id'], ['double', 'total'], ['bool', 'paid']],
    [
      ['struct order_data', 'Lowercase struct + snake_case name.'],
      ['{', 'Open body.'],
      ['    int order_id;', 'order_id is a counter → int.'],
      ['    double total;', 'total is money (decimal) → double.'],
      ['    bool paid;', 'paid is a true/false flag → bool.'],
      ['};', 'Close with `};` — always.'],
    ]));
  out.push(tourWorked(15, 'L-21', 'vehicle_data', 'vehicle_data',
    'A vehicle stores its rego, the make, and the year of manufacture.',
    [['string', 'rego'], ['string', 'make'], ['int', 'year']],
    [
      ['struct vehicle_data', 'Keyword + snake_case name.'],
      ['{', 'Open body.'],
      ['    string rego;', 'rego mixes letters + digits → string.'],
      ['    string make;', 'make is text → string.'],
      ['    int year;', 'year is a counter (e.g. 2026) → int.'],
      ['};', 'Close with `};`.'],
    ]));

  // 3 compare — canonicalAnswer must end in `}` or `;` (uses code-shape answer)
  out.push(tourCompare(16, 'L-21',
    'struct desk_data\n{\n    int room_id;\n    int d_id;\n    int number_of_screens;\n}',
    'struct desk_data\n{\n    int room_id;\n    int d_id;\n    int number_of_screens;\n};',
    'Which version compiles? What is the single-character difference? Write the corrected code.',
    'struct desk_data\n{\n    int room_id;\n    int d_id;\n    int number_of_screens;\n};',
    'Version B has the closing `;` after `}`. Version A is a compile error: `expected \';\' after struct definition`. The trailing `;` after the closing brace is the highest-frequency Q2 error.'));
  out.push(tourCompare(17, 'L-21',
    'struct computer_data\n{\n    int id;\n    string description;\n    string location;\n};',
    'struct Computer_Data\n{\n    int id;\n    string description;\n    string location;\n};',
    'Both compile. Which one matches SIT102 style? Write the SIT102-style version.',
    'struct computer_data\n{\n    int id;\n    string description;\n    string location;\n};',
    'C++ allows both forms. SIT102 grades on style: snake_case names like `computer_data` are correct. Version A is the styled answer.'));
  out.push(tourCompare(18, 'L-21',
    'struct order_data\n{\n    int order_id\n    double total;\n    bool paid;\n};',
    'struct order_data\n{\n    int order_id;\n    double total;\n    bool paid;\n};',
    'Find the missing token in version A. Write the corrected code.',
    'struct order_data\n{\n    int order_id;\n    double total;\n    bool paid;\n};',
    'Version A is missing the `;` after `int order_id`. Every C++ statement ends with `;`; field declarations inside a struct are no exception.'));

  // 2 recall
  out.push(tourRecall(19, 'L-21',
    'struct desk_data\n{\n    int room_id;\n    int d_id;\n    int number_of_screens;\n};',
    'How many fields does `desk_data` have?',
    [['A', '2'], ['B', '3'], ['C', '4'], ['D', '0 — these are local variables']],
    'B', 'Three: `room_id`, `d_id`, `number_of_screens`. Each line ending with `;` inside the braces is one field.'));
  out.push(tourRecall(20, 'L-21',
    'struct computer_data\n{\n    int id;\n    string description;\n    string location;\n};',
    'What single character ends the struct definition (after the closing brace)?',
    [['A', '`.`'], ['B', '`,`'], ['C', '`;`'], ['D', 'nothing — `}` alone is enough']],
    'C', 'A struct definition is a statement; like every C++ statement it terminates with `;` AFTER the closing `}`. This is the most-missed token on Q2.'));
  return out;
}

// ---------------------------------------------------------------------
// S2 Template (30 cards)
// ---------------------------------------------------------------------

function buildS2Template(): Card[] {
  const out: Card[] = [];
  // 12 skeleton (StructWrite — full skeleton)
  // emphasise desk_data + computer_data each ≥ once
  const skel: Array<[string, Array<[string, string]>, string]> = [
    ['Real test V2.0 entity desk_data with int fields room_id, d_id, number_of_screens.', [['int', 'room_id'], ['int', 'd_id'], ['int', 'number_of_screens']], 'Type all 6 lines verbatim from memory; do NOT skip the closing `};`.'],
    ['Practice-test entity computer_data with int id, string description, string location.', [['int', 'id'], ['string', 'description'], ['string', 'location']], 'Practice-test entity. The 3 primitives are int + string + string.'],
    ['book_data: title (string), author (string), pages (int).', [['string', 'title'], ['string', 'author'], ['int', 'pages']], 'Mixed types — string fields stay one-per-line.'],
    ['employee_data: id (int), name (string), salary (double).', [['int', 'id'], ['string', 'name'], ['double', 'salary']], 'Salary is decimal currency → `double`.'],
    ['student_data: student_id (int), full_name (string), gpa (double).', [['int', 'student_id'], ['string', 'full_name'], ['double', 'gpa']], 'GPA decimal → `double`.'],
    ['order_data: order_id (int), total (double), paid (bool).', [['int', 'order_id'], ['double', 'total'], ['bool', 'paid']], 'paid is a flag → `bool`.'],
    ['vehicle_data: rego (string), make (string), year (int).', [['string', 'rego'], ['string', 'make'], ['int', 'year']], 'rego allows letters+numbers → `string`.'],
    ['product_data: sku (string), name (string), price (double).', [['string', 'sku'], ['string', 'name'], ['double', 'price']], 'price decimal → `double`.'],
    ['animal_data: species (string), age (int), weight (double).', [['string', 'species'], ['int', 'age'], ['double', 'weight']], 'weight decimal → `double`; age counter → `int`.'],
    ['house_data: address (string), bedrooms (int), price (double).', [['string', 'address'], ['int', 'bedrooms'], ['double', 'price']], 'bedrooms counter → `int`; price money → `double`.'],
    ['Real test V2.0 entity desk_data, retyped from blank canvas — drill the closing `};` once more.', [['int', 'room_id'], ['int', 'd_id'], ['int', 'number_of_screens']], 'desk_data repeat — fluency drill.'],
    ['Practice-test entity computer_data, retyped from blank canvas.', [['int', 'id'], ['string', 'description'], ['string', 'location']], 'computer_data repeat — fluency drill.'],
  ];
  let idx = 1;
  for (const [prompt, fields, focus] of skel) {
    const name = (prompt.match(/(\w+_data)/) ?? ['', 'unknown_data'])[1];
    out.push(templSkeleton(idx++, 'L-22', prompt, name, fields, focus));
  }

  // 6 closing-semi (FaultInjection)
  const closings: Array<[string, string, string]> = [
    ['desk_data missing the closing `;`. Add it.',
      'struct desk_data\n{\n    int room_id;\n    int d_id;\n    int number_of_screens;\n}',
      'struct desk_data\n{\n    int room_id;\n    int d_id;\n    int number_of_screens;\n};'],
    ['computer_data missing the closing `;`.',
      'struct computer_data\n{\n    int id;\n    string description;\n    string location;\n}',
      'struct computer_data\n{\n    int id;\n    string description;\n    string location;\n};'],
    ['book_data missing the closing `;`.',
      'struct book_data\n{\n    string title;\n    string author;\n    int pages;\n}',
      'struct book_data\n{\n    string title;\n    string author;\n    int pages;\n};'],
    ['employee_data missing the closing `;`.',
      'struct employee_data\n{\n    int id;\n    string name;\n    double salary;\n}',
      'struct employee_data\n{\n    int id;\n    string name;\n    double salary;\n};'],
    ['order_data missing the closing `;`.',
      'struct order_data\n{\n    int order_id;\n    double total;\n    bool paid;\n}',
      'struct order_data\n{\n    int order_id;\n    double total;\n    bool paid;\n};'],
    ['vehicle_data missing the closing `;`.',
      'struct vehicle_data\n{\n    string rego;\n    string make;\n    int year;\n}',
      'struct vehicle_data\n{\n    string rego;\n    string make;\n    int year;\n};'],
  ];
  for (let i = 0; i < closings.length; i++) {
    const [p, broken, fixed] = closings[i] as [string, string, string];
    out.push(templClosingSemi(idx++, 'L-22', p, broken, fixed));
  }

  // 4 struct-keyword (FaultInjection)
  const keys: Array<[string, string, string]> = [
    ['Struct desk_data\n{\n    int room_id;\n    int d_id;\n    int number_of_screens;\n};',
      'struct desk_data\n{\n    int room_id;\n    int d_id;\n    int number_of_screens;\n};',
      'capital Struct keyword'],
    ['STRUCT computer_data\n{\n    int id;\n    string description;\n    string location;\n};',
      'struct computer_data\n{\n    int id;\n    string description;\n    string location;\n};',
      'all-caps STRUCT keyword'],
    ['class product_data\n{\n    string sku;\n    string name;\n    double price;\n};',
      'struct product_data\n{\n    string sku;\n    string name;\n    double price;\n};',
      'class instead of struct'],
    ['typedef student_data\n{\n    int student_id;\n    string full_name;\n    double gpa;\n};',
      'struct student_data\n{\n    int student_id;\n    string full_name;\n    double gpa;\n};',
      'wrong keyword (typedef instead of struct)'],
  ];
  for (const [b, f, cat] of keys) {
    out.push(templStructKeyword(idx++, 'L-22', b, f, cat));
  }

  // 5 ident-rules (Decompose pick legal identifier)
  const idents: Array<[string, Array<[string, string]>, string, string]> = [
    [`struct house_data\n{\n    string address;\n    int bedrooms;\n    double price;\n};`,
      [['A', '`bedrooms`'], ['B', '`Bedrooms`'], ['C', '`bed-rooms`'], ['D', '`#bedrooms`']],
      'Which identifier follows SIT102 snake_case style for the bedroom field?',
      '`bedrooms` is lowercase snake_case and matches SIT102 style.'],
    [`struct student_data\n{\n    int student_id;\n    string full_name;\n    double gpa;\n};`,
      [['A', '`fullName`'], ['B', '`Full_Name`'], ['C', '`full_name`'], ['D', '`full name`']],
      'Which identifier is legal AND SIT102-styled for the full-name field?',
      '`full_name` is snake_case and contains no spaces; `full name` is illegal in C++.'],
    [`struct hotel_data\n{\n    string name;\n    int stars;\n    double price_per_night;\n};`,
      [['A', '`pricePerNight`'], ['B', '`price_per_night`'], ['C', '`price-per-night`'], ['D', '`PricePerNight`']],
      'Which is the SIT102 snake_case form for "price per night"?',
      'Underscore separates words: `price_per_night`. Hyphens are illegal C++; camelCase is wrong style.'],
    [`struct flight_data\n{\n    string flight_no;\n    string origin;\n    string destination;\n};`,
      [['A', '`1st_origin`'], ['B', '`origin`'], ['C', '`Origin`'], ['D', '`origin!`']],
      'Which is a legal identifier for the origin field?',
      'Identifiers cannot start with a digit and cannot contain `!`. Lowercase `origin` is SIT102-styled.'],
    [`struct movie_data\n{\n    string title;\n    string director;\n    int runtime;\n};`,
      [['A', '`title`'], ['B', '`Title`'], ['C', '`title 1`'], ['D', '`title$`']],
      'Pick the legal SIT102 field name.',
      '`title` is lowercase + no whitespace + no special characters. The other three break C++ rules or SIT102 style.'],
  ];
  for (let i = 0; i < idents.length; i++) {
    const [code, options, q, e] = idents[i] as [string, Array<[string, string]>, string, string];
    out.push(templIdent(idx++, 'L-22', code, q, options, 'C', e));
  }

  // 3 reserved-ban (FaultInjection — bad field name is keyword)
  const reserved: Array<[string, string]> = [
    ['class', 'category'],
    ['return', 'return_type'],
    ['int', 'count'],
  ];
  for (const [bad, fix] of reserved) {
    out.push(templReserved(idx++, 'L-22', bad, fix));
  }

  return out;
}

// ---------------------------------------------------------------------
// S3 Components — 80 cards = 50 noun→type + 15 naming + 10 ordering + 5 spacing
// ---------------------------------------------------------------------

function buildS3Components(): Card[] {
  const out: Card[] = [];
  let idx = 1;

  // 10 int nouns
  const ints: Array<[string, string]> = [
    ['id', 'an id is a non-decimal counter from 1, 2, 3, ...'],
    ['count', 'a count is a whole-number quantity'],
    ['age', 'age in years is conventionally a whole number'],
    ['year', 'a calendar year (e.g. 2026) is a whole number'],
    ['quantity', 'a quantity is a whole number of items'],
    ['score', 'an integer score (e.g. test mark out of 100) has no fractional part'],
    ['room_id', 'a room id is a whole-number identifier — exactly the V2.0 desk_data shape'],
    ['desk_id', 'a desk id, like room_id, is a whole-number identifier'],
    ['number_of_screens', 'a count of screens at a desk is a whole number — V2.0 desk_data shape'],
    ['copies', 'how many copies of a book exist is a whole-number count'],
  ];
  for (const [noun, why] of ints) {
    out.push(noun2type(idx++, 'L-23a', noun, 'int', ['double', 'string', 'bool'], why));
  }

  // 10 double nouns
  const doubles: Array<[string, string]> = [
    ['price', 'price has cents — `$19.99` cannot fit in `int`'],
    ['weight', 'weight in kg has decimals (e.g. 2.4kg)'],
    ['height', 'height in metres has decimals (e.g. 1.83m)'],
    ['distance', 'distance in km has decimals (e.g. 12.7km)'],
    ['percentage', 'percentages are decimals (e.g. 87.5%)'],
    ['rate', 'a rate (interest, exchange) is a decimal'],
    ['gpa', 'a GPA is a decimal between 0.0 and 4.0'],
    ['salary', 'salary in dollars has decimals (e.g. 65432.10)'],
    ['balance', 'a bank balance has decimals'],
    ['temperature', 'temperature in degrees has decimals (e.g. 21.4°C)'],
  ];
  for (const [noun, why] of doubles) {
    out.push(noun2type(idx++, 'L-23a', noun, 'double', ['int', 'string', 'bool'], why));
  }

  // 10 string nouns
  const strings: Array<[string, string]> = [
    ['name', 'a name is a sequence of characters of unknown length'],
    ['title', 'a book/movie title is free text'],
    ['description', 'a description is free text — exactly the practice computer_data shape'],
    ['location', 'a location label is free text — exactly the practice computer_data shape'],
    ['address', 'an address contains digits + letters + commas + spaces — text'],
    ['material', 'a material name like "oak" or "leather" is text'],
    ['colour', 'a colour name like "red" is text'],
    ['full_name', 'a full name like "Joshua Pijaca" is text'],
    ['brand', 'a brand name is text'],
    ['genre', 'a genre name like "fantasy" is text'],
  ];
  for (const [noun, why] of strings) {
    out.push(noun2type(idx++, 'L-23a', noun, 'string', ['int', 'double', 'char'], why));
  }

  // 5 bool nouns
  const bools: Array<[string, string]> = [
    ['is_active', 'an `is_*` flag is true/false → `bool`'],
    ['has_warranty', 'a `has_*` flag is true/false → `bool`'],
    ['paid', 'paid/not-paid is a binary flag → `bool`'],
    ['available', 'available/not-available is a flag → `bool`'],
    ['is_student', '`is_*` prefix → `bool`'],
  ];
  for (const [noun, why] of bools) {
    out.push(noun2type(idx++, 'L-23a', noun, 'bool', ['int', 'string', 'char'], why));
  }

  // 5 char nouns
  const chars: Array<[string, string]> = [
    ['grade', 'a letter grade is a single character (A/B/C/D/F)'],
    ['initial', 'a single-letter initial → `char`'],
    ['gender', 'a single-letter gender code (M/F/X) → `char`'],
    ['classification', 'a single-letter classification code → `char`'],
    ['single_letter', 'when the field stores ONE letter, prefer `char` over `string`'],
  ];
  for (const [noun, why] of chars) {
    out.push(noun2type(idx++, 'L-23a', noun, 'char', ['string', 'int', 'bool'], why));
  }

  // 10 mixed-review nouns (alternate types, harder)
  const mixed: Array<[string, 'int' | 'double' | 'string' | 'bool' | 'char', string]> = [
    ['stars', 'int', 'a hotel star rating (1, 2, ..., 5) is a whole number'],
    ['runtime', 'int', 'a movie runtime in minutes is conventionally an integer'],
    ['servings', 'int', 'recipe servings (e.g. 4) is a whole number'],
    ['rating', 'double', 'a restaurant rating like 4.7 has decimals → `double`'],
    ['duration', 'double', 'song duration in minutes (3.45) has decimals → `double`'],
    ['humidity', 'double', 'humidity percentage (62.4%) has decimals → `double`'],
    ['account_no', 'string', 'an account number can contain leading zeros and dashes → `string`'],
    ['flight_no', 'string', 'a flight number like "QF11" mixes letters + digits → `string`'],
    ['is_finished', 'bool', '`is_*` prefix → `bool`'],
    ['mark', 'char', 'a single-letter mark on a record → `char`'],
  ];
  for (const [noun, t, why] of mixed) {
    const distractors = (['int', 'double', 'string', 'bool', 'char'] as const).filter(d => d !== t);
    out.push(noun2type(idx++, 'L-23a', noun, t, distractors as unknown as string[], why));
  }

  // 15 naming
  idx = 1;
  const namingCases: Array<[string, string, Array<[string, string]>, string, string]> = [
    ['Q2 field-naming: pick the snake_case version of a money field.',
      `struct order_data\n{\n    int order_id;\n    double total;\n    bool paid;\n};`,
      [['A', '`Total`'], ['B', '`total`'], ['C', '`TOTAL`'], ['D', '`tot-al`']], 'B', '`total` is lowercase snake_case (single word, no separator needed).'],
    ['Pick the snake_case version of a user-id field.',
      `struct user_data\n{\n    int user_id;\n    string name;\n};`,
      [['A', '`UserID`'], ['B', '`userId`'], ['C', '`user_id`'], ['D', '`user id`']], 'C', '`user_id`: words separated by `_`, all lowercase.'],
    ['Pick the legal identifier for a percentage field.',
      `struct stats_data\n{\n    string label;\n    double percentage;\n};`,
      [['A', '`%age`'], ['B', '`percentage`'], ['C', '`percent age`'], ['D', '`Percent Age`']], 'B', '`%`, space, and uppercase break either C++ rules or SIT102 style.'],
    ['Which is a legal C++ identifier?',
      `struct generic\n{\n    int x;\n};`,
      [['A', '`2nd_field`'], ['B', '`field_2`'], ['C', '`field-2`'], ['D', '`field 2`']], 'B', 'Identifiers cannot start with a digit; cannot contain `-` or space.'],
    ['Pick the SIT102-styled name for "phone number".',
      `struct contact_data\n{\n    string name;\n    string phone_number;\n};`,
      [['A', '`phoneNumber`'], ['B', '`PhoneNumber`'], ['C', '`phone_number`'], ['D', '`phone-number`']], 'C', 'Snake_case: `phone_number`.'],
    ['Pick the snake_case form of "first name".',
      `struct contact_data\n{\n    string first_name;\n    string last_name;\n};`,
      [['A', '`first_name`'], ['B', '`firstname`'], ['C', '`firstName`'], ['D', '`First_Name`']], 'A', '`first_name` separates the two words with `_`. `firstname` is one word and harder to read.'],
    ['Pick the legal name for a year field.',
      `struct vehicle_data\n{\n    string make;\n    int year;\n};`,
      [['A', '`year`'], ['B', '`1year`'], ['C', '`year#1`'], ['D', '`year of make`']], 'A', '`1year` starts with a digit; `#` is illegal; spaces are illegal.'],
    ['Pick the SIT102-style snake_case for "is currently active".',
      `struct user_data\n{\n    int id;\n    bool is_active;\n};`,
      [['A', '`isActive`'], ['B', '`is_active`'], ['C', '`is-active`'], ['D', '`IsActive`']], 'B', 'Snake_case lowercase with `_`.'],
    ['Pick the legal field name (no reserved-word collision).',
      `struct car_data\n{\n    string make;\n    int model_year;\n};`,
      [['A', '`int`'], ['B', '`year`'], ['C', '`return`'], ['D', '`class`']], 'B', '`int`, `return`, and `class` are C++ keywords and cannot be identifiers.'],
    ['Pick the SIT102 form for "GPA" (a 3-letter acronym).',
      `struct student_data\n{\n    int student_id;\n    double gpa;\n};`,
      [['A', '`GPA`'], ['B', '`gpa`'], ['C', '`Gpa`'], ['D', '`g.p.a`']], 'B', 'SIT102 fields are lowercase snake_case even for acronyms: `gpa`.'],
    ['Pick the snake_case form for "max value".',
      `struct stats_data\n{\n    int count;\n    double max_value;\n};`,
      [['A', '`max_value`'], ['B', '`maxValue`'], ['C', '`MaxValue`'], ['D', '`max-value`']], 'A', 'Snake_case: `max_value`.'],
    ['Pick the legal identifier (no whitespace).',
      `struct event_data\n{\n    string name;\n    int attendees;\n};`,
      [['A', '`name`'], ['B', '`event name`'], ['C', '`event-name`'], ['D', '`event.name`']], 'A', 'Whitespace, `-`, and `.` are not allowed in C++ identifiers.'],
    ['Pick the SIT102-style form for "USD price".',
      `struct product_data\n{\n    string sku;\n    double usd_price;\n};`,
      [['A', '`USDPrice`'], ['B', '`usdPrice`'], ['C', '`usd_price`'], ['D', '`USD-price`']], 'C', 'Lowercase snake_case = `usd_price`.'],
    ['Pick the legal field name (no reserved word).',
      `struct stats_data\n{\n    string label;\n    int total_score;\n};`,
      [['A', '`double`'], ['B', '`total_score`'], ['C', '`for`'], ['D', '`if`']], 'B', '`double`, `for`, and `if` are C++ keywords and cannot be field names.'],
    ['Pick the snake_case form for "has warranty".',
      `struct product_data\n{\n    string sku;\n    bool has_warranty;\n};`,
      [['A', '`hasWarranty`'], ['B', '`has_warranty`'], ['C', '`HasWarranty`'], ['D', '`has-warranty`']], 'B', 'Snake_case prefix `has_` followed by the noun.'],
  ];
  for (let i = 0; i < namingCases.length; i++) {
    const tup = namingCases[i] as [string, string, Array<[string, string]>, string, string];
    const code = tup[1]; const options = tup[2]; const correctLabel = tup[3]; const explanation = tup[4];
    out.push(naming(idx++, 'L-23b', code, tup[0], options, correctLabel, explanation));
  }

  // 10 ordering (multi-field write, fields appear in PROMPT order)
  idx = 1;
  const orderCases: Array<[string, string, Array<[string, string]>]> = [
    ['Write `desk_data` with fields IN THIS ORDER: room_id, d_id, number_of_screens — all int.', 'desk_data', [['int', 'room_id'], ['int', 'd_id'], ['int', 'number_of_screens']]],
    ['Write `computer_data` with fields IN THIS ORDER: id (int), description (string), location (string).', 'computer_data', [['int', 'id'], ['string', 'description'], ['string', 'location']]],
    ['Write `book_data` with fields IN THIS ORDER: title (string), author (string), pages (int).', 'book_data', [['string', 'title'], ['string', 'author'], ['int', 'pages']]],
    ['Write `student_data` IN THIS ORDER: student_id (int), full_name (string), gpa (double).', 'student_data', [['int', 'student_id'], ['string', 'full_name'], ['double', 'gpa']]],
    ['Write `vehicle_data` IN THIS ORDER: rego (string), make (string), year (int).', 'vehicle_data', [['string', 'rego'], ['string', 'make'], ['int', 'year']]],
    ['Write `house_data` IN THIS ORDER: address (string), bedrooms (int), price (double).', 'house_data', [['string', 'address'], ['int', 'bedrooms'], ['double', 'price']]],
    ['Write `recipe_data` IN THIS ORDER: name (string), servings (int), prep_time (int).', 'recipe_data', [['string', 'name'], ['int', 'servings'], ['int', 'prep_time']]],
    ['Write `phone_data` IN THIS ORDER: brand (string), model (string), price (double).', 'phone_data', [['string', 'brand'], ['string', 'model'], ['double', 'price']]],
    ['Write `flight_data` IN THIS ORDER: flight_no (string), origin (string), destination (string).', 'flight_data', [['string', 'flight_no'], ['string', 'origin'], ['string', 'destination']]],
    ['Write `room_data` IN THIS ORDER: room_id (int), capacity (int), has_projector (bool).', 'room_data', [['int', 'room_id'], ['int', 'capacity'], ['bool', 'has_projector']]],
  ];
  for (const [prompt, name, fields] of orderCases) {
    out.push(ordering(idx++, 'L-23b', prompt, name, fields));
  }

  // 5 spacing (FaultInjection)
  idx = 1;
  const spacings: Array<[string, string, string]> = [
    ['struct order_data\n{\n    int order_id; double total;\n    bool paid;\n};',
      'struct order_data\n{\n    int order_id;\n    double total;\n    bool paid;\n};',
      'two fields on one line'],
    ['struct desk_data\n{\nint room_id;\nint d_id;\nint number_of_screens;\n};',
      'struct desk_data\n{\n    int room_id;\n    int d_id;\n    int number_of_screens;\n};',
      'fields not indented (no 4-space indent inside braces)'],
    ['struct computer_data\n{ int id; string description; string location; };',
      'struct computer_data\n{\n    int id;\n    string description;\n    string location;\n};',
      'all fields on one line'],
    ['struct book_data\n{\n    string title;string author;\n    int pages;\n};',
      'struct book_data\n{\n    string title;\n    string author;\n    int pages;\n};',
      'two fields jammed without space'],
    ['struct house_data{\n    string address;\n    int bedrooms;\n    double price;};',
      'struct house_data\n{\n    string address;\n    int bedrooms;\n    double price;\n};',
      'opening `{` and closing `};` jammed onto same line as code'],
  ];
  for (const [b, f, cat] of spacings) {
    out.push(spacing(idx++, 'L-23c', b, f, cat));
  }

  return out;
}

// ---------------------------------------------------------------------
// S4 Compose — 70 cards
// 30 entity prompts (top 10 + 20 variants).
// Each entity gets a Compose card; we also include repeats for desk/computer
// so we hit ≥5 of each as required.
// Total = 30 main + 20 repeats + 10 variant prompts = 60 ≈ → +10 free-write
// to reach 70.
// ---------------------------------------------------------------------

interface Entity { name: string; prompt: string; fields: Array<[string, string]>; tag?: 'desk' | 'computer' | null; }

const ENTITIES: Entity[] = [
  { name: 'computer_data', prompt: 'A computer in the lab has an inventory id, a free-text description, and a location string.', fields: [['int', 'id'], ['string', 'description'], ['string', 'location']], tag: 'computer' },
  { name: 'desk_data', prompt: 'A desk in a uni computer lab is identified by its room id, its desk id, and the number of screens at it.', fields: [['int', 'room_id'], ['int', 'd_id'], ['int', 'number_of_screens']], tag: 'desk' },
  { name: 'book_data', prompt: 'A book has a title, an author, and a page count.', fields: [['string', 'title'], ['string', 'author'], ['int', 'pages']] },
  { name: 'employee_data', prompt: 'An employee has an id, a name, and a salary.', fields: [['int', 'id'], ['string', 'name'], ['double', 'salary']] },
  { name: 'student_data', prompt: 'A student has a student id, a full name, and a GPA.', fields: [['int', 'student_id'], ['string', 'full_name'], ['double', 'gpa']] },
  { name: 'vehicle_data', prompt: 'A vehicle has a rego, a make, and a year of manufacture.', fields: [['string', 'rego'], ['string', 'make'], ['int', 'year']] },
  { name: 'order_data', prompt: 'An order has an order id, a total amount of money, and a paid/unpaid flag.', fields: [['int', 'order_id'], ['double', 'total'], ['bool', 'paid']] },
  { name: 'product_data', prompt: 'A product has a sku, a name, and a price.', fields: [['string', 'sku'], ['string', 'name'], ['double', 'price']] },
  { name: 'animal_data', prompt: 'An animal has a species, an age in years, and a weight.', fields: [['string', 'species'], ['int', 'age'], ['double', 'weight']] },
  { name: 'house_data', prompt: 'A house has an address, a bedroom count, and a sale price.', fields: [['string', 'address'], ['int', 'bedrooms'], ['double', 'price']] },
  // 20 variants
  { name: 'movie_data', prompt: 'A movie has a title, a director, and a runtime in minutes.', fields: [['string', 'title'], ['string', 'director'], ['int', 'runtime']] },
  { name: 'recipe_data', prompt: 'A recipe has a name, a servings count, and a prep time in minutes.', fields: [['string', 'name'], ['int', 'servings'], ['int', 'prep_time']] },
  { name: 'restaurant_data', prompt: 'A restaurant has a name, a location, and a rating.', fields: [['string', 'name'], ['string', 'location'], ['double', 'rating']] },
  { name: 'game_data', prompt: 'A game has a title, a genre, and a release year.', fields: [['string', 'title'], ['string', 'genre'], ['int', 'year']] },
  { name: 'song_data', prompt: 'A song has a title, an artist, and a duration in minutes.', fields: [['string', 'title'], ['string', 'artist'], ['double', 'duration']] },
  { name: 'painting_data', prompt: 'A painting has a title, an artist, and a year painted.', fields: [['string', 'title'], ['string', 'artist'], ['int', 'year']] },
  { name: 'flight_data', prompt: 'A flight has a flight number, an origin airport, and a destination airport.', fields: [['string', 'flight_no'], ['string', 'origin'], ['string', 'destination']] },
  { name: 'hotel_data', prompt: 'A hotel has a name, a star rating, and a price per night.', fields: [['string', 'name'], ['int', 'stars'], ['double', 'price_per_night']] },
  { name: 'course_data', prompt: 'A course has a code, a name, and a credit-point count.', fields: [['string', 'code'], ['string', 'name'], ['int', 'credits']] },
  { name: 'invoice_data', prompt: 'An invoice has an invoice id, an amount, and a paid flag.', fields: [['int', 'invoice_id'], ['double', 'amount'], ['bool', 'paid']] },
  { name: 'phone_data', prompt: 'A phone has a brand, a model, and a price.', fields: [['string', 'brand'], ['string', 'model'], ['double', 'price']] },
  { name: 'dog_data', prompt: 'A dog has a name, a breed, and an age.', fields: [['string', 'name'], ['string', 'breed'], ['int', 'age']] },
  { name: 'shoe_data', prompt: 'A shoe has a brand, a size, and a colour.', fields: [['string', 'brand'], ['double', 'size'], ['string', 'colour']] },
  { name: 'laptop_data', prompt: 'A laptop has a brand, a RAM size in GB, and a weight in kg.', fields: [['string', 'brand'], ['int', 'ram_gb'], ['double', 'weight']] },
  { name: 'room_data', prompt: 'A room has a room id, a capacity, and a projector flag.', fields: [['int', 'room_id'], ['int', 'capacity'], ['bool', 'has_projector']] },
  { name: 'event_data', prompt: 'An event has a name, a date string, and an attendee count.', fields: [['string', 'name'], ['string', 'date'], ['int', 'attendees']] },
  { name: 'ticket_data', prompt: 'A ticket has a ticket id, a seat label, and a price.', fields: [['int', 'ticket_id'], ['string', 'seat'], ['double', 'price']] },
  { name: 'club_data', prompt: 'A club has a name, a member count, and a fee.', fields: [['string', 'name'], ['int', 'members'], ['double', 'fee']] },
  { name: 'weather_data', prompt: 'A weather record has a city, a temperature, and a humidity reading.', fields: [['string', 'city'], ['double', 'temperature'], ['double', 'humidity']] },
  { name: 'pet_data', prompt: 'A pet has a name, a species, and a vaccinated flag.', fields: [['string', 'name'], ['string', 'species'], ['bool', 'is_vaccinated']] },
];

function buildS4Compose(): Card[] {
  const out: Card[] = [];
  let idx = 1;
  // 30 main
  for (const e of ENTITIES) {
    out.push(compose(idx++, 'L-24', e.prompt, e.name, e.fields, e.tag ?? null));
  }
  // 20 repeats with rephrased prompts (slightly different wording)
  const repeats: Entity[] = [
    { name: 'desk_data', prompt: 'V2.0 RESIT-PREP repeat: a lab desk is recorded by its room number, its desk identifier, and how many screens are mounted on it.', fields: [['int', 'room_id'], ['int', 'd_id'], ['int', 'number_of_screens']], tag: 'desk' },
    { name: 'computer_data', prompt: 'PRACTICE repeat: a computer record carries an id, a free-text description, and a location.', fields: [['int', 'id'], ['string', 'description'], ['string', 'location']], tag: 'computer' },
    { name: 'desk_data', prompt: 'V2.0 repeat #2: capture a desk via three integers — its room id, its own id, and a screen count.', fields: [['int', 'room_id'], ['int', 'd_id'], ['int', 'number_of_screens']], tag: 'desk' },
    { name: 'computer_data', prompt: 'PRACTICE repeat #2: model a uni computer with id (int), description (text), location (text).', fields: [['int', 'id'], ['string', 'description'], ['string', 'location']], tag: 'computer' },
    { name: 'desk_data', prompt: 'V2.0 repeat #3 — exact field order matters: room_id, d_id, number_of_screens.', fields: [['int', 'room_id'], ['int', 'd_id'], ['int', 'number_of_screens']], tag: 'desk' },
    { name: 'computer_data', prompt: 'PRACTICE repeat #3 — exact field order: id, description, location.', fields: [['int', 'id'], ['string', 'description'], ['string', 'location']], tag: 'computer' },
    { name: 'book_data', prompt: 'A library book is described by its title, the author, and how many pages it has.', fields: [['string', 'title'], ['string', 'author'], ['int', 'pages']] },
    { name: 'employee_data', prompt: 'A payroll system tracks employee id, full name, and yearly salary.', fields: [['int', 'id'], ['string', 'name'], ['double', 'salary']] },
    { name: 'student_data', prompt: 'A registrar tracks each student\'s student id, full name, and GPA.', fields: [['int', 'student_id'], ['string', 'full_name'], ['double', 'gpa']] },
    { name: 'vehicle_data', prompt: 'A registry stores each vehicle\'s rego, manufacturer make, and year built.', fields: [['string', 'rego'], ['string', 'make'], ['int', 'year']] },
    { name: 'order_data', prompt: 'An e-commerce order is captured by its id, the total cost, and whether the customer has paid.', fields: [['int', 'order_id'], ['double', 'total'], ['bool', 'paid']] },
    { name: 'product_data', prompt: 'A retailer tracks each product by sku, customer-facing name, and price.', fields: [['string', 'sku'], ['string', 'name'], ['double', 'price']] },
    { name: 'animal_data', prompt: 'A zoo tracks each animal by species, age in years, and weight in kg.', fields: [['string', 'species'], ['int', 'age'], ['double', 'weight']] },
    { name: 'house_data', prompt: 'A real-estate listing has the property address, bedroom count, and asking price.', fields: [['string', 'address'], ['int', 'bedrooms'], ['double', 'price']] },
    { name: 'desk_data', prompt: 'V2.0 repeat #4 — last consolidation pass before resit.', fields: [['int', 'room_id'], ['int', 'd_id'], ['int', 'number_of_screens']], tag: 'desk' },
    { name: 'computer_data', prompt: 'PRACTICE repeat #4 — fluency check.', fields: [['int', 'id'], ['string', 'description'], ['string', 'location']], tag: 'computer' },
    { name: 'employee_data', prompt: 'Repeat: id (int), name (string), salary (double).', fields: [['int', 'id'], ['string', 'name'], ['double', 'salary']] },
    { name: 'order_data', prompt: 'Repeat: order_id (int), total (double), paid (bool).', fields: [['int', 'order_id'], ['double', 'total'], ['bool', 'paid']] },
    { name: 'student_data', prompt: 'Repeat: student_id (int), full_name (string), gpa (double).', fields: [['int', 'student_id'], ['string', 'full_name'], ['double', 'gpa']] },
    { name: 'desk_data', prompt: 'V2.0 repeat #5 — final fluency rep.', fields: [['int', 'room_id'], ['int', 'd_id'], ['int', 'number_of_screens']], tag: 'desk' },
  ];
  for (const e of repeats) {
    out.push(compose(idx++, 'L-24', e.prompt, e.name, e.fields, e.tag ?? null));
  }
  // 20 free-write — body-only or 1-line scaffold prompts
  const free: Entity[] = [
    { name: 'tv_show_data', prompt: 'COLD START: a TV show has a title, a season count, and a finale flag. Pick types yourself.', fields: [['string', 'title'], ['int', 'season_count'], ['bool', 'is_finished']] },
    { name: 'drink_data', prompt: 'COLD START: a drink has a name and a price.', fields: [['string', 'name'], ['double', 'price']] },
    { name: 'bicycle_data', prompt: 'COLD START 4-field: a bicycle has a brand, a number of gears, a price, and a colour.', fields: [['string', 'brand'], ['int', 'gears'], ['double', 'price'], ['string', 'colour']] },
    { name: 'painting_data', prompt: 'COLD START: a painting record — title, artist, year painted.', fields: [['string', 'title'], ['string', 'artist'], ['int', 'year']] },
    { name: 'song_data', prompt: 'COLD START: a song record — title, artist, duration (minutes).', fields: [['string', 'title'], ['string', 'artist'], ['double', 'duration']] },
    { name: 'invoice_data', prompt: 'COLD START: an invoice — invoice id, amount, paid flag.', fields: [['int', 'invoice_id'], ['double', 'amount'], ['bool', 'paid']] },
    { name: 'phone_data', prompt: 'COLD START: a phone — brand, model, price.', fields: [['string', 'brand'], ['string', 'model'], ['double', 'price']] },
    { name: 'pet_data', prompt: 'COLD START: a pet — name, species, vaccinated flag.', fields: [['string', 'name'], ['string', 'species'], ['bool', 'is_vaccinated']] },
    { name: 'desk_data', prompt: 'COLD START FINAL — reproduce desk_data from memory; no scaffolding.', fields: [['int', 'room_id'], ['int', 'd_id'], ['int', 'number_of_screens']], tag: 'desk' },
    { name: 'computer_data', prompt: 'COLD START FINAL — reproduce computer_data from memory; no scaffolding.', fields: [['int', 'id'], ['string', 'description'], ['string', 'location']], tag: 'computer' },
    { name: 'animal_data', prompt: 'COLD START fluency: animal_data — species, age, weight.', fields: [['string', 'species'], ['int', 'age'], ['double', 'weight']] },
    { name: 'house_data', prompt: 'COLD START fluency: house_data — address, bedrooms, price.', fields: [['string', 'address'], ['int', 'bedrooms'], ['double', 'price']] },
    { name: 'movie_data', prompt: 'COLD START fluency: movie_data — title, director, runtime.', fields: [['string', 'title'], ['string', 'director'], ['int', 'runtime']] },
    { name: 'product_data', prompt: 'COLD START fluency: product_data — sku, name, price.', fields: [['string', 'sku'], ['string', 'name'], ['double', 'price']] },
    { name: 'order_data', prompt: 'COLD START fluency: order_data — order_id, total, paid.', fields: [['int', 'order_id'], ['double', 'total'], ['bool', 'paid']] },
    { name: 'student_data', prompt: 'COLD START fluency: student_data — student_id, full_name, gpa.', fields: [['int', 'student_id'], ['string', 'full_name'], ['double', 'gpa']] },
    { name: 'employee_data', prompt: 'COLD START fluency: employee_data — id, name, salary.', fields: [['int', 'id'], ['string', 'name'], ['double', 'salary']] },
    { name: 'vehicle_data', prompt: 'COLD START fluency: vehicle_data — rego, make, year.', fields: [['string', 'rego'], ['string', 'make'], ['int', 'year']] },
    { name: 'desk_data', prompt: 'COLD START fluency rep #2: desk_data — V2.0 anchor.', fields: [['int', 'room_id'], ['int', 'd_id'], ['int', 'number_of_screens']], tag: 'desk' },
    { name: 'computer_data', prompt: 'COLD START fluency rep #2: computer_data — practice anchor.', fields: [['int', 'id'], ['string', 'description'], ['string', 'location']], tag: 'computer' },
  ];
  for (const e of free) {
    out.push(compose(idx++, 'L-24', e.prompt, e.name, e.fields, e.tag ?? null));
  }
  return out;
}

// ---------------------------------------------------------------------
// S5 Variations — 30 cards
// 10 EntityMatrix + 8 reverse + 4 bool + 3 char + 3 array + 2 four-field
// ---------------------------------------------------------------------

function buildS5Variations(): Card[] {
  const out: Card[] = [];

  // 10 EntityMatrix
  for (let i = 1; i <= 10; i++) {
    const examples: Array<[string, string]> = [
      ['A', 'struct book_data\n{\n    string title;\n    string author;\n    int pages;\n};'],
      ['B', 'struct movie_data\n{\n    string title;\n    string director;\n    int runtime;\n};'],
      ['C', 'struct game_data\n{\n    string title;\n    string genre;\n    int year;\n};'],
    ];
    const prompt = [
      'Apply the same 3-field title/text/int pattern to a `painting_data` entity (title, artist, year).',
      'Apply the same pattern to a `song_data` entity (title, artist, duration in minutes — note: duration is a double).',
      'Apply the same pattern to a `phone_data` entity (brand, model, price double).',
      'Apply the same pattern to a `dog_data` entity (name, breed, age int).',
      'Apply the same pattern to a `shoe_data` entity (brand, colour, size double).',
      'Apply the same pattern to a `recipe_data` entity (name, ingredients string, servings int).',
      'Apply the same pattern to a `restaurant_data` entity (name, location, rating double).',
      'Apply the same pattern to a `course_data` entity (code, name, credits int).',
      'Apply the same pattern to a `flight_data` entity (flight_no, origin, destination string).',
      'Apply the same pattern to a `weather_data` entity (city, temperature double, humidity double).',
    ][i - 1];
    const ans = ([
      structAnswer('painting_data', [['string', 'title'], ['string', 'artist'], ['int', 'year']]),
      structAnswer('song_data', [['string', 'title'], ['string', 'artist'], ['double', 'duration']]),
      structAnswer('phone_data', [['string', 'brand'], ['string', 'model'], ['double', 'price']]),
      structAnswer('dog_data', [['string', 'name'], ['string', 'breed'], ['int', 'age']]),
      structAnswer('shoe_data', [['string', 'brand'], ['string', 'colour'], ['double', 'size']]),
      structAnswer('recipe_data', [['string', 'name'], ['string', 'ingredients'], ['int', 'servings']]),
      structAnswer('restaurant_data', [['string', 'name'], ['string', 'location'], ['double', 'rating']]),
      structAnswer('course_data', [['string', 'code'], ['string', 'name'], ['int', 'credits']]),
      structAnswer('flight_data', [['string', 'flight_no'], ['string', 'origin'], ['string', 'destination']]),
      structAnswer('weather_data', [['string', 'city'], ['double', 'temperature'], ['double', 'humidity']]),
    ])[i - 1] as string;
    out.push(entityMatrix(i, 'L-25', examples, prompt!, ans));
  }

  // 8 reverse
  const reverses: Array<[string, Array<[string, string]>, string]> = [
    [`struct car_data\n{\n    string make;\n    string model;\n    int year;\n};`, [['A', 'A book record (title, author, pages).'], ['B', 'A car record (make, model, year of manufacture).'], ['C', 'A person record (first name, last name, age).'], ['D', 'A song record (title, artist, duration).']], 'B'],
    [`struct order_data\n{\n    int order_id;\n    double total;\n    bool paid;\n};`, [['A', 'A receipt with id, line-item count, taxed flag.'], ['B', 'An e-commerce order with id, total, paid flag.'], ['C', 'A discount with code, percentage, active flag.'], ['D', 'A subscription with id, monthly cost, cancelled flag.']], 'B'],
    [`struct desk_data\n{\n    int room_id;\n    int d_id;\n    int number_of_screens;\n};`, [['A', 'A book record (id, page count, year).'], ['B', 'A bench in a workshop (id, station id, tools count).'], ['C', 'A desk in a uni computer lab (room id, desk id, screen count).'], ['D', 'A car (id, year, doors).']], 'C'],
    [`struct hotel_data\n{\n    string name;\n    int stars;\n    double price_per_night;\n};`, [['A', 'A movie record (title, year, runtime).'], ['B', 'A hotel record (name, star rating, nightly price).'], ['C', 'A song (title, year, duration).'], ['D', 'A vehicle (name, year, price).']], 'B'],
    [`struct computer_data\n{\n    int id;\n    string description;\n    string location;\n};`, [['A', 'A book record (id, description, author).'], ['B', 'A computer in a uni lab (id, description, location).'], ['C', 'A library record (id, title, shelf).'], ['D', 'A car (id, model, garage).']], 'B'],
    [`struct invoice_data\n{\n    int invoice_id;\n    double amount;\n    bool paid;\n};`, [['A', 'An invoice (invoice id, amount, paid flag).'], ['B', 'An order (order id, total, shipped flag).'], ['C', 'A receipt (receipt id, total, refunded flag).'], ['D', 'A subscription (id, fee, cancelled flag).']], 'A'],
    [`struct grade_data\n{\n    int student_id;\n    string course;\n    char mark;\n};`, [['A', 'A student transcript line (student id, course code, single-letter mark).'], ['B', 'A class register (student id, name, grade level).'], ['C', 'An assignment (student id, course, score percent).'], ['D', 'A schedule (student id, course, time slot).']], 'A'],
    [`struct pet_data\n{\n    string name;\n    string species;\n    bool is_vaccinated;\n};`, [['A', 'A vet record for a pet (name, species, vaccinated flag).'], ['B', 'A zoo animal (name, species, age).'], ['C', 'A breeder log (name, breed, sale price).'], ['D', 'A wildlife survey (name, location, count).']], 'A'],
  ];
  for (let i = 0; i < reverses.length; i++) {
    const [code, options, correctLabel] = reverses[i] as [string, Array<[string, string]>, string];
    out.push(reverse(i + 1, 'L-25', code,
      'Which English description best matches this struct?',
      options, correctLabel,
      'The field name + type combination uniquely fingerprints the entity.'));
  }

  // 4 bool edge case
  out.push(bool(1, 'L-25', 'pet_data: a pet has name, species, and a is_vaccinated flag.', 'pet_data', [['string', 'name'], ['string', 'species'], ['bool', 'is_vaccinated']]));
  out.push(bool(2, 'L-25', 'invoice_data: invoice_id (int), amount (double), paid flag (bool).', 'invoice_data', [['int', 'invoice_id'], ['double', 'amount'], ['bool', 'paid']]));
  out.push(bool(3, 'L-25', 'subscription_data: subscriber_id (int), monthly_fee (double), is_active flag.', 'subscription_data', [['int', 'subscriber_id'], ['double', 'monthly_fee'], ['bool', 'is_active']]));
  out.push(bool(4, 'L-25', 'product_data with warranty: sku (string), price (double), has_warranty (bool).', 'product_data', [['string', 'sku'], ['double', 'price'], ['bool', 'has_warranty']]));

  // 3 char edge case
  out.push(ch(1, 'L-25', 'grade_data: student_id (int), course (string), mark (char — single letter A-F).', 'grade_data', [['int', 'student_id'], ['string', 'course'], ['char', 'mark']]));
  out.push(ch(2, 'L-25', 'initial_data: full_name (string), middle_initial (char), age (int).', 'initial_data', [['string', 'full_name'], ['char', 'middle_initial'], ['int', 'age']]));
  out.push(ch(3, 'L-25', 'classification_data: id (int), name (string), classification (char single letter).', 'classification_data', [['int', 'id'], ['string', 'name'], ['char', 'classification']]));

  // 3 array-field peek (Q1-shape)
  out.push(arrayField(1, 'L-25', 'stat_double for Q1: an array of `numbers[SIZE]` doubles plus a `mystery` double.', 'stat_double', [['double[SIZE]', 'numbers'], ['double', 'mystery']]));
  out.push(arrayField(2, 'L-25', 'lab_data for an extended desk lab: an array of `desk_ids[SIZE]` ints plus the room_id int.', 'lab_data', [['int[SIZE]', 'desk_ids'], ['int', 'room_id']]));
  out.push(arrayField(3, 'L-25', 'class_data: an array of `student_ids[CLASS_SIZE]` ints plus a course string.', 'class_data', [['int[CLASS_SIZE]', 'student_ids'], ['string', 'course']]));

  // 2 four-field
  out.push(fourField(1, 'L-25', 'bicycle_data 4-field: brand (string), gears (int), price (double), colour (string).', 'bicycle_data', [['string', 'brand'], ['int', 'gears'], ['double', 'price'], ['string', 'colour']]));
  out.push(fourField(2, 'L-25', 'tv_show_data 4-field: title (string), season_count (int), rating (double), is_finished (bool).', 'tv_show_data', [['string', 'title'], ['int', 'season_count'], ['double', 'rating'], ['bool', 'is_finished']]));

  return out;
}

// ---------------------------------------------------------------------
// S6 Speed — 20 cards
// 8 @ 30s (3-field, simplest), 8 @ 60s (mixed types), 4 @ 90s (cold start novel)
// ---------------------------------------------------------------------

function buildS6Speed(): Card[] {
  const out: Card[] = [];

  // 8 @ 30s
  const fast: Entity[] = [
    { name: 'desk_data', prompt: 'V2.0: desk_data — room_id, d_id, number_of_screens (all int).', fields: [['int', 'room_id'], ['int', 'd_id'], ['int', 'number_of_screens']], tag: 'desk' },
    { name: 'computer_data', prompt: 'PRACTICE: computer_data — id, description, location.', fields: [['int', 'id'], ['string', 'description'], ['string', 'location']], tag: 'computer' },
    { name: 'desk_data', prompt: 'V2.0 SPEED REP: desk_data, all int.', fields: [['int', 'room_id'], ['int', 'd_id'], ['int', 'number_of_screens']], tag: 'desk' },
    { name: 'computer_data', prompt: 'PRACTICE SPEED REP: computer_data.', fields: [['int', 'id'], ['string', 'description'], ['string', 'location']], tag: 'computer' },
    { name: 'book_data', prompt: 'book_data — title, author, pages.', fields: [['string', 'title'], ['string', 'author'], ['int', 'pages']] },
    { name: 'order_data', prompt: 'order_data — order_id, total, paid.', fields: [['int', 'order_id'], ['double', 'total'], ['bool', 'paid']] },
    { name: 'student_data', prompt: 'student_data — student_id, full_name, gpa.', fields: [['int', 'student_id'], ['string', 'full_name'], ['double', 'gpa']] },
    { name: 'vehicle_data', prompt: 'vehicle_data — rego, make, year.', fields: [['string', 'rego'], ['string', 'make'], ['int', 'year']] },
  ];
  for (let i = 0; i < fast.length; i++) {
    const e = fast[i] as Entity;
    out.push(speed(i + 1, 'L-26', e.prompt, e.name, e.fields, 5, 30, e.tag ?? null));
  }

  // 8 @ 60s
  const med: Entity[] = [
    { name: 'employee_data', prompt: 'employee_data — id, name, salary.', fields: [['int', 'id'], ['string', 'name'], ['double', 'salary']] },
    { name: 'product_data', prompt: 'product_data — sku, name, price.', fields: [['string', 'sku'], ['string', 'name'], ['double', 'price']] },
    { name: 'animal_data', prompt: 'animal_data — species, age, weight.', fields: [['string', 'species'], ['int', 'age'], ['double', 'weight']] },
    { name: 'house_data', prompt: 'house_data — address, bedrooms, price.', fields: [['string', 'address'], ['int', 'bedrooms'], ['double', 'price']] },
    { name: 'recipe_data', prompt: 'recipe_data — name, servings, prep_time.', fields: [['string', 'name'], ['int', 'servings'], ['int', 'prep_time']] },
    { name: 'phone_data', prompt: 'phone_data — brand, model, price.', fields: [['string', 'brand'], ['string', 'model'], ['double', 'price']] },
    { name: 'flight_data', prompt: 'flight_data — flight_no, origin, destination.', fields: [['string', 'flight_no'], ['string', 'origin'], ['string', 'destination']] },
    { name: 'desk_data', prompt: 'V2.0 60s REP: desk_data full retype.', fields: [['int', 'room_id'], ['int', 'd_id'], ['int', 'number_of_screens']], tag: 'desk' },
  ];
  for (let i = 0; i < med.length; i++) {
    const e = med[i] as Entity;
    out.push(speed(i + 9, 'L-26', e.prompt, e.name, e.fields, 8, 60, e.tag ?? null));
  }

  // 4 @ 90s — novel cold start, including a 4-field and a bool/char edge
  const slow: Entity[] = [
    { name: 'bicycle_data', prompt: '90s COLD START 4-FIELD: bicycle_data — brand, gears, price, colour.', fields: [['string', 'brand'], ['int', 'gears'], ['double', 'price'], ['string', 'colour']] },
    { name: 'pet_data', prompt: '90s COLD: pet_data — name, species, is_vaccinated.', fields: [['string', 'name'], ['string', 'species'], ['bool', 'is_vaccinated']] },
    { name: 'grade_data', prompt: '90s COLD char-edge: grade_data — student_id, course, mark (single char).', fields: [['int', 'student_id'], ['string', 'course'], ['char', 'mark']] },
    { name: 'desk_data', prompt: '90s FINAL FLUENCY: desk_data full retype.', fields: [['int', 'room_id'], ['int', 'd_id'], ['int', 'number_of_screens']], tag: 'desk' },
  ];
  for (let i = 0; i < slow.length; i++) {
    const e = slow[i] as Entity;
    out.push(speed(i + 17, 'L-26', e.prompt, e.name, e.fields, 10, 90, e.tag ?? null));
  }

  return out;
}

// ---------------------------------------------------------------------
// Driver — write all 240 cards
// ---------------------------------------------------------------------

function main() {
  const tour = buildS1Tour();
  const tmpl = buildS2Template();
  const comp = buildS3Components();
  const compose_cards = buildS4Compose();
  const var_cards = buildS5Variations();
  const speed_cards = buildS6Speed();

  console.log(`S1 Tour:      ${tour.length} (target 20)`);
  console.log(`S2 Template:  ${tmpl.length} (target 30)`);
  console.log(`S3 Components: ${comp.length} (target 80)`);
  console.log(`S4 Compose:   ${compose_cards.length} (target 70)`);
  console.log(`S5 Variations: ${var_cards.length} (target 30)`);
  console.log(`S6 Speed:     ${speed_cards.length} (target 20)`);
  console.log(`TOTAL:        ${tour.length + tmpl.length + comp.length + compose_cards.length + var_cards.length + speed_cards.length} (target 240)`);

  for (const c of tour) writeCard(resolve(CARDS, 'L2-tour'), `${c.id}.yml`, c);
  for (const c of tmpl) writeCard(resolve(CARDS, 'L2-template'), `${c.id}.yml`, c);
  for (const c of comp) {
    const atomDir = c.atomId === 'L-23a' ? 'L2-23a' : c.atomId === 'L-23b' ? 'L2-23b' : 'L2-23c';
    writeCard(resolve(CARDS, atomDir), `${c.id}.yml`, c);
  }
  for (const c of compose_cards) writeCard(resolve(CARDS, 'L2-compose'), `${c.id}.yml`, c);
  for (const c of var_cards) writeCard(resolve(CARDS, 'L2-variations'), `${c.id}.yml`, c);
  for (const c of speed_cards) writeCard(resolve(CARDS, 'L2-speed'), `${c.id}.yml`, c);
}

main();
