// One-shot generator for M5 Q1 sim cards.
// 15 variants × 2 modes (full + partial-stop at i==3) = 30 cards.
// Tags: atomId = HE-16 (max-finder; load-bearing atom for Q1).
// Run: npx tsx build/gen-q1-sims.ts (appends to data/cards.json).

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

interface TraceCard {
  type: 'trace';
  atomId: string;
  code: string;
  variables: string[];
  expectedSteps: Step[];
  userInputs: string[];
  inputLabels: string[];
  terminalOutput: string[];
  q4StopCondition?: string;
  inputMode: 'per-step' | 'final-only';
  teachMe: string;
}

interface Variant {
  id: number;
  numbers: number[];
}

const VARIANTS: Variant[] = [
  { id: 1, numbers: [3.2, 7.1, 5.0, 9.4, 2.8] },
  { id: 2, numbers: [88.5, 91.0, 76.2, 65.4, 82.1] },
  { id: 3, numbers: [4.4, 1.2, 8.7, 6.0, 3.5] },
  { id: 4, numbers: [0.5, 1.8, 2.1, 0.9, 3.0] },
  { id: 5, numbers: [5.0, 4.2, 6.8, 3.1, 7.7] },
  { id: 6, numbers: [1.0, 2.0, 3.0, 4.0, 5.0] },
  { id: 7, numbers: [5.0, 4.0, 3.0, 2.0, 1.0] },
  { id: 8, numbers: [3.0, 3.0, 3.0, 3.0, 3.0] },
  { id: 9, numbers: [-1.0, -2.0, -3.0, -4.0, -5.0] },
  { id: 10, numbers: [10.0, 5.0, 15.0, 8.0, 12.0] },
  { id: 11, numbers: [0.1, 0.2, 0.3, 0.4, 0.5] },
  { id: 12, numbers: [2.5, 7.5, 6.5, 3.5, 4.5] },
  { id: 13, numbers: [6.0, 6.5, 6.2, 6.8, 6.1] },
  { id: 14, numbers: [99.9, 50.0, 75.0, 25.0, 60.0] },
  { id: 15, numbers: [1.5, 9.5, 3.5, 9.5, 5.5] },
];

function fmt(n: number): string {
  // Match C++ canonical form (e.g., "3.2", "-1.0", "99.9")
  return Number.isInteger(n) ? n.toFixed(1) : String(n);
}

function buildCode(v: Variant): string {
  return `struct stat_double {
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
    d.numbers[0] = ${fmt(v.numbers[0]!)};
    d.numbers[1] = ${fmt(v.numbers[1]!)};
    d.numbers[2] = ${fmt(v.numbers[2]!)};
    d.numbers[3] = ${fmt(v.numbers[3]!)};
    d.numbers[4] = ${fmt(v.numbers[4]!)};
    who_am_i(d);
    return 0;
}`;
}

function simulate(numbers: number[], stopBeforeI: number | null): {
  steps: Step[];
  finalMystery: number;
  trail: string[];
} {
  const steps: Step[] = [];
  const trail: string[] = [];
  let mystery = numbers[0]!;
  steps.push({ line: 6, variable: 'data.mystery', value: fmt(mystery) });
  trail.push(`init: ${fmt(mystery)}`);

  const limit = stopBeforeI !== null ? stopBeforeI : 5;
  for (let i = 1; i < limit; i++) {
    const candidate = numbers[i]!;
    const condText = `${fmt(candidate)} > ${fmt(mystery)}`;
    if (candidate > mystery) {
      mystery = candidate;
      steps.push({
        line: 9,
        variable: 'data.mystery',
        value: fmt(mystery),
        condition: `${condText} → true`,
      });
      trail.push(`i=${i}: ${condText} ✓ → ${fmt(mystery)}`);
    } else {
      trail.push(`i=${i}: ${condText} ✗ (no update)`);
    }
  }
  return { steps, finalMystery: mystery, trail };
}

function buildCards(): TraceCard[] {
  const cards: TraceCard[] = [];

  for (const v of VARIANTS) {
    const code = buildCode(v);

    // Full trace
    const full = simulate(v.numbers, null);
    cards.push({
      type: 'trace',
      atomId: 'HE-16',
      code,
      variables: ['data.mystery'],
      expectedSteps: full.steps,
      userInputs: [],
      inputLabels: [],
      terminalOutput: [],
      inputMode: 'final-only',
      teachMe: `Q1 sim variant ${v.id}, full trace.\n${full.trail.join('\n')}\nFinal mystery = ${fmt(full.finalMystery)}.`,
    });

    // Partial-stop at i == 3 (stop BEFORE iter i=3 runs; trace iters i=1, i=2)
    const partial = simulate(v.numbers, 3);
    cards.push({
      type: 'trace',
      atomId: 'HE-16',
      code,
      variables: ['data.mystery'],
      expectedSteps: partial.steps,
      userInputs: [],
      inputLabels: [],
      terminalOutput: [],
      q4StopCondition: 'i == 3',
      inputMode: 'final-only',
      teachMe: `Q1 sim variant ${v.id}, partial-stop at i==3 (BEFORE iter i=3 runs; iters i=1, i=2 already complete).\n${partial.trail.join('\n')}\nMystery at stop = ${fmt(partial.finalMystery)}.`,
    });
  }

  return cards;
}

function main() {
  const existing = JSON.parse(readFileSync(CARDS_PATH, 'utf8')) as unknown[];

  // Filter out any prior Q1 sim cards (atomId HE-16 with q4StopCondition or specific code pattern)
  // For safety, just append fresh sims (manual: dedup by hash if needed)
  const newCards = buildCards();
  const merged = [...existing, ...newCards];

  writeFileSync(CARDS_PATH, JSON.stringify(merged, null, 2));
  console.log(`appended ${newCards.length} Q1 sim cards (15 variants × 2 modes).`);
  console.log(`total cards: ${merged.length}`);
}

main();
