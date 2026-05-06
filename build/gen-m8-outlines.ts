// One-shot script: write all 39 M8 outlines (S/O/I/MW) to outlines/L00/L01/L03/L16/.
// Run once: npx tsx build/gen-m8-outlines.ts
// Idempotent: overwrites existing.

import { writeFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');

interface OutlineSpec {
  dir: string;
  id: string;
  fact: string;
  words: number;
  level: number;
  deps?: string[];
  q_tags: { Q1: string; Q2: string; Q3: string; Q4: string };
  seeds: string[];
  l1_fill?: { template: string; blank_value: string };
  l2_complete?: { template: string; blank_value: string };
  forbid?: string[];
}

const SPECS: OutlineSpec[] = [
  // === L00 Source Skeleton (S-01..S-10) ===
  {
    dir: 'L00', id: 'S-01', fact: '#include <iostream> adds I/O', words: 4, level: 0,
    q_tags: { Q1: 'S', Q2: 'N', Q3: 'S', Q4: 'C' },
    seeds: ['#include <iostream> for I/O', 'iostream gives cin and cout', 'include iostream first', 'iostream is for I/O', 'top of file: include iostream'],
    l1_fill: { template: '#include <___>', blank_value: 'iostream' },
  },
  {
    dir: 'L00', id: 'S-02', fact: 'using namespace std; saves typing', words: 5, level: 0,
    q_tags: { Q1: 'S', Q2: 'N', Q3: 'S', Q4: 'C' },
    seeds: ['using namespace std saves typing', 'avoids std:: prefix everywhere', 'lets you write cout not std::cout', 'saves typing std:: each time', 'common at top of file'],
  },
  {
    dir: 'L00', id: 'S-03', fact: 'int main() { } is entry', words: 5, level: 0,
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'C' },
    seeds: ['int main() is program entry', 'main is where execution starts', 'every program has main()', 'int main returns int code', 'run starts at main()'],
    l1_fill: { template: '___ main() { return 0; }', blank_value: 'int' },
  },
  {
    dir: 'L00', id: 'S-04', fact: '; ends every statement', words: 4, level: 0,
    q_tags: { Q1: 'C', Q2: 'C', Q3: 'C', Q4: 'C' },
    seeds: ['; ends every C++ statement', 'forget ; → compile error', 'each statement ends in semicolon', 'all statements need semicolon', 'semicolon = end of line'],
  },
  {
    dir: 'L00', id: 'S-05', fact: '{ opens code block', words: 4, level: 0,
    q_tags: { Q1: 'C', Q2: 'C', Q3: 'C', Q4: 'C' },
    seeds: ['{ opens a code block', 'curly brace starts body', 'use { for function body', '{ groups statements', 'after main() comes {'],
  },
  {
    dir: 'L00', id: 'S-06', fact: '} closes code block', words: 4, level: 0,
    deps: ['S-05'],
    q_tags: { Q1: 'C', Q2: 'C', Q3: 'C', Q4: 'C' },
    seeds: ['} ends a code block', 'matching close for {', '} balances every {', 'each { needs a }', '} ends body of function'],
  },
  {
    dir: 'L00', id: 'S-07', fact: 'return 0; ends main', words: 4, level: 0,
    deps: ['S-03'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'C' },
    seeds: ['return 0 ends main()', 'return 0 = success exit', 'last line of main() is return 0', '0 means program OK', 'return 0 finishes main'],
  },
  {
    dir: 'L00', id: 'S-08', fact: '// is single-line comment', words: 4, level: 0,
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['// starts a comment', 'compiler ignores // line', 'use // for notes', '// → rest of line ignored', 'one-line comment uses //'],
  },
  {
    dir: 'L00', id: 'S-09', fact: 'whitespace mostly does not matter', words: 5, level: 0,
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['whitespace does not change meaning', 'extra spaces compile fine', 'tabs vs spaces equivalent', 'newlines OK between tokens', 'whitespace cosmetic for compiler'],
  },
  {
    dir: 'L00', id: 'S-10', fact: 'indentation is style not syntax', words: 5, level: 0,
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['indentation purely cosmetic', 'compiler ignores indent level', '4 spaces or tab both fine', 'indent for human readers', 'no Python-style indent rules'],
  },

  // === L01 Output (O-01..O-13) ===
  {
    dir: 'L01', id: 'O-01', fact: 'cout prints to terminal', words: 4, level: 1,
    deps: ['S-01', 'S-02'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'S', Q4: 'S' },
    seeds: ['cout writes to stdout', 'cout sends text to screen', 'use cout for output', 'cout is the output stream', 'cout displays values'],
  },
  {
    dir: 'L01', id: 'O-02', fact: '<< sends value to cout', words: 5, level: 1,
    deps: ['O-01'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'S', Q4: 'S' },
    seeds: ['<< feeds value into cout', 'cout << pushes value out', 'arrow points to cout', '<< is output operator', '<< chains values into cout'],
  },
  {
    dir: 'L01', id: 'O-03', fact: 'cout << "text"; prints text', words: 4, level: 1,
    deps: ['O-02'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'S', Q4: 'S' },
    seeds: ['cout << "hello" prints hello', 'string in quotes goes to terminal', 'use double quotes for text', 'cout << "..." → stdout', 'literal text needs quotes'],
  },
  {
    dir: 'L01', id: 'O-04', fact: 'cout << 5; prints number', words: 4, level: 1,
    deps: ['O-02'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'S', Q4: 'S' },
    seeds: ['cout << 5 prints 5', 'numbers print without quotes', 'integer literal prints as int', 'cout converts numbers to text', '5 is int literal'],
  },
  {
    dir: 'L01', id: 'O-05', fact: 'endl prints newline', words: 3, level: 1,
    deps: ['O-01'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'S', Q4: 'S' },
    seeds: ['endl ends the line', 'cout << endl moves down', 'endl = newline + flush', 'use endl after output', 'endl breaks to new line'],
  },
  {
    dir: 'L01', id: 'O-06', fact: '\\n also prints newline', words: 4, level: 1,
    deps: ['O-03'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'S', Q4: 'C' },
    seeds: ['"\\n" embeds newline in text', 'newline char inside string', '\\n breaks line in printf', 'shorter than endl', 'use \\n inside quotes'],
  },
  {
    dir: 'L01', id: 'O-07', fact: 'chain: cout << a << b;', words: 5, level: 1,
    deps: ['O-02'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'S', Q4: 'S' },
    seeds: ['chain << for many values', 'cout << a << b prints both', 'multiple << in one line', '<< chains left-to-right', 'one statement many outputs'],
  },
  {
    dir: 'L01', id: 'O-08', fact: 'printf(format, args) outputs text', words: 4, level: 1,
    deps: ['S-01'],
    q_tags: { Q1: 'C', Q2: 'N', Q3: 'N', Q4: 'C' },
    seeds: ['printf with format string', 'C-style printf for output', 'printf takes format then values', 'printf prints formatted text', 'use printf in Q4'],
  },
  {
    dir: 'L01', id: 'O-09', fact: '%d formats int', words: 3, level: 1,
    deps: ['O-08'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'C' },
    seeds: ['%d for integer values', '%d → int placeholder', 'use %d to print int', 'printf int with %d', '%d formats whole number'],
  },
  {
    dir: 'L01', id: 'O-10', fact: '%s formats C-string', words: 3, level: 1,
    deps: ['O-08'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'C' },
    seeds: ['%s for C-string values', '%s → string placeholder', 'use %s for char array', 'printf string with %s', '%s prints null-terminated text'],
  },
  {
    dir: 'L01', id: 'O-11', fact: '\\n in printf adds newline', words: 5, level: 1,
    deps: ['O-08', 'O-06'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'C' },
    seeds: ['\\n inside printf format', 'newline at end of format', 'printf("...\\n", ...) breaks line', 'add \\n to wrap output', '\\n moves cursor down'],
  },
  {
    dir: 'L01', id: 'O-12', fact: 'printf first arg is format', words: 5, level: 1,
    deps: ['O-08'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'C' },
    seeds: ['format string is first arg', 'printf format goes first', 'first parameter has %s and %d', 'format precedes data', 'first arg holds template'],
  },
  {
    dir: 'L01', id: 'O-13', fact: 'printf extra args fill placeholders', words: 5, level: 1,
    deps: ['O-12'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'C' },
    seeds: ['args after format fill %d %s', 'extra args go in order', 'printf args match placeholders', 'each %d %s gets one value', 'args fill the format slots'],
  },

  // === L03 Input (I-01..I-07) ===
  {
    dir: 'L03', id: 'I-01', fact: 'cin reads from terminal', words: 4, level: 3,
    deps: ['O-01'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'C', Q4: 'C' },
    seeds: ['cin reads stdin input', 'cin pulls from keyboard', 'cin = input stream', 'use cin for user typing', 'cin gets terminal input'],
  },
  {
    dir: 'L03', id: 'I-02', fact: '>> reads value into variable', words: 5, level: 3,
    deps: ['I-01'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'C', Q4: 'C' },
    seeds: ['>> stores input in variable', 'arrow points to variable', '>> is input operator', '>> writes from cin', 'cin >> assigns to var'],
  },
  {
    dir: 'L03', id: 'I-03', fact: 'cin >> x; waits for input', words: 5, level: 3,
    deps: ['I-02'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'C', Q4: 'C' },
    seeds: ['cin >> pauses for typing', 'waits until user enters value', 'blocks until input received', 'cin >> reads one value', 'pauses for keyboard input'],
    l1_fill: { template: 'cin ___ x;', blank_value: '>>' },
  },
  {
    dir: 'L03', id: 'I-04', fact: 'whitespace separates input values', words: 4, level: 3,
    deps: ['I-03'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'S', Q4: 'S' },
    seeds: ['spaces separate cin values', 'tab or space ends input', 'whitespace splits inputs', 'each value before whitespace', 'cin stops at whitespace'],
  },
  {
    dir: 'L03', id: 'I-05', fact: 'cin parses to variable type', words: 5, level: 3,
    deps: ['I-03'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'S', Q4: 'S' },
    seeds: ['cin reads as variable type', 'int reads as integer', 'string reads as word', 'cin matches the var type', 'parsing follows variable type'],
  },
  {
    dir: 'L03', id: 'I-06', fact: 'chain cin >> a >> b;', words: 5, level: 3,
    deps: ['I-02'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'S', Q4: 'S' },
    seeds: ['chain >> for multiple inputs', 'cin >> a >> b reads both', 'multiple inputs one statement', 'chain reads sequentially', 'each >> reads one value'],
  },
  {
    dir: 'L03', id: 'I-07', fact: 'getline(cin, s) reads full line', words: 5, level: 3,
    deps: ['I-01'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['getline reads whole line', 'getline includes spaces', 'use getline for sentences', 'getline ends at newline', 'reads up to enter key'],
  },

  // === L16 Main Write (MW-01..MW-09) ===
  {
    dir: 'L16', id: 'MW-01', fact: 'int main() { ... return 0; }', words: 6, level: 16,
    deps: ['S-03', 'S-07'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'C' },
    seeds: ['int main() body return 0', 'standard main shape', 'main returns int code', 'every program: int main', 'main signature is fixed'],
    l2_complete: { template: 'int main() {\n    ___\n    return 0;\n}', blank_value: '// body here' },
  },
  {
    dir: 'L16', id: 'MW-02', fact: 'const int MAX = 100;', words: 5, level: 16,
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'C' },
    seeds: ['const int MAX = 100', 'use const for array size', 'capital MAX is convention', 'const = compile-time constant', 'MAX bounds the array'],
    l1_fill: { template: '___ int MAX = 100;', blank_value: 'const' },
  },
  {
    dir: 'L16', id: 'MW-03', fact: 'declare Type list[MAX];', words: 3, level: 16,
    deps: ['MW-02'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'C' },
    seeds: ['Type list[MAX] declares array', 'list[MAX] holds many items', 'use array of structs', 'declare struct array via Type list[MAX]', 'list[MAX] is fixed-size array'],
    l1_fill: { template: 'computer_data ___[MAX];', blank_value: 'list' },
  },
  {
    dir: 'L16', id: 'MW-04', fact: 'declare int count;', words: 3, level: 16,
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'C' },
    seeds: ['int count holds size', 'count tracks how many', 'declare int count for input', 'int count; for user N', 'count is loop bound'],
  },
  {
    dir: 'L16', id: 'MW-05', fact: 'cin >> count; reads N', words: 5, level: 16,
    deps: ['I-03', 'MW-04'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'C' },
    seeds: ['cin >> count gets size', 'user types count value', 'read count from keyboard', 'cin >> count waits for input', 'reads how-many'],
    l1_fill: { template: 'cin ___ count;', blank_value: '>>' },
  },
  {
    dir: 'L16', id: 'MW-06', fact: 'call read_X(list, count);', words: 3, level: 16,
    deps: ['MW-03', 'MW-05'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'C' },
    seeds: ['call read_X(list, count)', 'pass list and count', 'invoke read function', 'read_X fills the array', 'no & at call site'],
  },
  {
    dir: 'L16', id: 'MW-07', fact: 'print loop: for-loop i < count', words: 6, level: 16,
    deps: ['MW-06'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'C' },
    seeds: ['for-loop print every entry', 'iterate list with for-loop', 'for (int i = 0; i < count;)', 'loop i from 0 to count', 'print one per iteration'],
    l1_fill: { template: 'for (int i = 0; i < ___; i++) printf(...);', blank_value: 'count' },
  },
  {
    dir: 'L16', id: 'MW-08', fact: 'printf("%d %s\\n", id, name);', words: 5, level: 16,
    deps: ['O-08', 'O-09', 'O-10'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'C' },
    seeds: ['printf %d %s with values', 'format string then args', 'printf format matches types', '%d for int %s for string', 'one printf per record'],
  },
  {
    dir: 'L16', id: 'MW-09', fact: '.c_str() converts string for %s', words: 5, level: 16,
    deps: ['O-10'],
    q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'C' },
    seeds: ['.c_str() gets C-string', 'name.c_str() for printf %s', 'string needs c_str() for %s', 'convert C++ string to char*', 'use .c_str() with %s'],
    forbid: ['cout', 'std::string'],
  },
];

function emit(spec: OutlineSpec): string {
  const deps = spec.deps && spec.deps.length > 0 ? spec.deps.map((d) => `[${d}]`).join(' / ') : '';
  const lines: string[] = [];
  lines.push(`id: ${spec.id}`);
  lines.push(`fact: "${spec.fact.replace(/"/g, '\\"')}"`);
  lines.push(`words: ${spec.words}`);
  lines.push(`level: ${spec.level}`);
  if (spec.deps && spec.deps.length > 0) {
    lines.push(`deps: [${spec.deps.join(', ')}]`);
  } else {
    lines.push(`deps: []`);
  }
  lines.push(`q_tags: { Q1: ${spec.q_tags.Q1}, Q2: ${spec.q_tags.Q2}, Q3: ${spec.q_tags.Q3}, Q4: ${spec.q_tags.Q4} }`);
  lines.push(`pfg_source: []`);
  lines.push(`test2_evidence: []`);
  lines.push(`canonical_example: ""`);
  lines.push(`expected_output: ""`);
  lines.push(`sit102_quirks: []`);
  lines.push(`misconceptions: []`);
  lines.push(`render_hints:`);
  lines.push(`  memorize_seed_phrases:`);
  for (const s of spec.seeds) {
    lines.push(`    - "${s.replace(/"/g, '\\"')}"`);
  }
  if (spec.l1_fill) {
    lines.push(`  write_L1_fill:`);
    lines.push(`    template: ${JSON.stringify(spec.l1_fill.template)}`);
    lines.push(`    blank_value: ${JSON.stringify(spec.l1_fill.blank_value)}`);
  }
  if (spec.l2_complete) {
    lines.push(`  write_L2_complete:`);
    lines.push(`    template: ${JSON.stringify(spec.l2_complete.template)}`);
    lines.push(`    blank_value: ${JSON.stringify(spec.l2_complete.blank_value)}`);
  }
  lines.push(`acceptance:`);
  lines.push(`  memorize: ["≤7 words"]`);
  lines.push(`lint:`);
  if (spec.forbid && spec.forbid.length > 0) {
    lines.push(`  forbid_tokens: [${spec.forbid.map((t) => `"${t}"`).join(', ')}]`);
  }
  lines.push(`  miller_max_words: 7`);
  lines.push(`status: locked`);
  void deps;
  return lines.join('\n') + '\n';
}

function main() {
  for (const s of SPECS) {
    const path = resolve(ROOT, 'outlines', s.dir, `${s.id}.yml`);
    writeFileSync(path, emit(s));
  }
  console.log(`wrote ${SPECS.length} outlines.`);
}

main();
