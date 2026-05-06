// Card type discriminated union — DO half (4) + SEE half (3) = 7 max.
// Spec: cpp-t2/docs/07_master_plan.md (DO), cpp-t2/docs/14_see_cards_master_plan.md (SEE),
//       cpp-t2/docs/08_outline_spec.md (outline schema).
// Cap of 7 enforced by MISSION.md + ANTIPATTERNS.md #7.

export type Card =
  | MemorizeCard
  | MCQCard
  | TraceCard
  | WriteCard
  | ClozeCard
  | DecomposeCard
  | WalkthroughCard;

// === DO half (production / a priori / bottom-up) ===

export interface MemorizeCard {
  type: 'memorize';
  atomId: string;
  fact: string;            // <=7 words; Miller's law (the variant student types)
  context?: string;        // canonical outline.fact - shown as subtitle for orientation
  flashSeconds: number;    // 2-5
  mode: 'race' | 'recall'; // race = visible during input; recall = hide first
  keyChecks: string[];     // tokens that must all appear
  explanation: string;     // shown on fail
}

export interface MCQCard {
  type: 'mcq';
  atomId: string;
  stem: string;
  correct: string;
  distractors: [string, string, string];
  explanation: string;
}

export interface TraceCard {
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

export interface Step {
  line: number;
  variable: string;          // "" for output-only
  value: string;
  output?: string | null;
  condition?: string | null;
}

export interface WriteCard {
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

// === SEE half (observation / a posteriori / top-down / mirror-neuron) ===
// Per cpp-t2/docs/14_see_cards_master_plan.md.

export interface ClozeCard {
  type: 'cloze';
  atomId: string;
  code: string;                // code context
  clozeSentence: string;       // "The ___ operator sends values into cout"
  answer: string;              // "<<"
  explanation: string;
}

// Legacy — kept for type compat but removed from Card union + deck
export interface DemoCard {
  type: 'demo';
  atomId: string;
  whyOneLine: string;
  demoCode: string;
  highlightTokens: string[];
  usedIn: string[];
}

export interface DecomposeCard {
  type: 'decompose';
  atomId: string;              // primary atom this card emphasizes
  code: string;                // 1-3 line snippet
  question: string;            // specific question targeting code element, e.g. "What does `&x` do here?"
  options: Array<{ label: string; text: string }>;  // A/B/C/D — 1 correct + 3 false
  correctLabel: string;        // 'A' | 'B' | 'C' | 'D'
  explanation: string;
}

export interface WalkthroughCard {
  type: 'walkthrough';
  atomId: string;              // anchor atom (level summary atoms reuse the level lead)
  levelLabel: string;          // "L0 -> L1 hello-world"
  fullCode: string;            // entire snippet shown statically
  steps: Array<{
    line: number;
    code: string;
    annotation: string;        // "entry point - every program needs main()"
    atomIds: string[];         // ["S-03"]
  }>;
}
