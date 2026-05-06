// Hardcoded 3 walkthrough cards for M14 verification.
// Pattern matches M1/M12/M13: inline cards prove component renders end-to-end
// before content authoring (M15) and generation (M16).
//
// Three walkthroughs cover increasing complexity:
//   1. L0 hello-world (entry point + cout)
//   2. L4 arithmetic (variables + operators + output)
//   3. L9 pass-by-ref (R-atoms in context: alias, mutation, caller-visible)
//
// Step count capped at 12 per docs/13 M14 risk note. All text ASCII.
//
// Spec: cpp-t2/docs/14_see_cards_master_plan.md ("walkthrough card UX").

import type { WalkthroughCard } from '../types/card';

export const M14_WALKTHROUGH_PREVIEW: WalkthroughCard[] = [
  // ── 1. L0 hello-world ────────────────────────────────────────────────
  {
    type: 'walkthrough',
    atomId: 'S-01',
    levelLabel: 'L0 source skeleton -- hello world',
    fullCode:
      '#include <iostream>\n' +
      'using namespace std;\n' +
      '\n' +
      'int main() {\n' +
      '  cout << "hello, world" << endl;\n' +
      '  return 0;\n' +
      '}',
    steps: [
      {
        line: 1,
        code: '#include <iostream>',
        annotation:
          'pulls cin/cout/endl into scope. without it, the compiler does not know what cout is.',
        atomIds: ['S-01'],
      },
      {
        line: 2,
        code: 'using namespace std;',
        annotation:
          'lets you write cout instead of std::cout. SIT102 always uses this convention.',
        atomIds: ['S-02'],
      },
      {
        line: 4,
        code: 'int main() {',
        annotation:
          'entry point. every program starts here. returns int (0 = success).',
        atomIds: ['S-03'],
      },
      {
        line: 5,
        code: 'cout << "hello, world" << endl;',
        annotation:
          'writes the string to stdout. << chains output. endl emits a newline. ; terminates the statement.',
        atomIds: ['O-01', 'O-02', 'O-05', 'S-04'],
      },
      {
        line: 6,
        code: 'return 0;',
        annotation: 'reports success to the OS. main must return an int.',
        atomIds: ['S-06'],
      },
    ],
  },

  // ── 2. L4 arithmetic ──────────────────────────────────────────────────
  {
    type: 'walkthrough',
    atomId: 'A-01',
    levelLabel: 'L4 operators -- area of a rectangle',
    fullCode:
      '#include <iostream>\n' +
      'using namespace std;\n' +
      '\n' +
      'int main() {\n' +
      '  int width = 4;\n' +
      '  int height = 3;\n' +
      '  int area = width * height;\n' +
      '  cout << "area = " << area << endl;\n' +
      '  return 0;\n' +
      '}',
    steps: [
      {
        line: 5,
        code: 'int width = 4;',
        annotation:
          'declare an int box named width and store 4 in it. type + name + = + literal + ; .',
        atomIds: ['V-04', 'V-10', 'V-15', 'A-05', 'S-04'],
      },
      {
        line: 6,
        code: 'int height = 3;',
        annotation: 'second int box. same shape as width.',
        atomIds: ['V-04', 'V-10', 'V-15', 'A-05'],
      },
      {
        line: 7,
        code: 'int area = width * height;',
        annotation:
          'evaluate width * height (= 12) and store in area. * is the multiplication operator.',
        atomIds: ['V-04', 'A-03', 'A-05'],
      },
      {
        line: 8,
        code: 'cout << "area = " << area << endl;',
        annotation:
          'chain three things to cout: a string literal, the int variable area, and a newline. printf-style formatting NOT used here.',
        atomIds: ['O-01', 'O-02', 'O-05'],
      },
      {
        line: 9,
        code: 'return 0;',
        annotation: 'success status to the OS.',
        atomIds: ['S-06'],
      },
    ],
  },

  // ── 3. L9 pass-by-ref ────────────────────────────────────────────────
  {
    type: 'walkthrough',
    atomId: 'R-03',
    levelLabel: 'L9 RDS -- pass-by-reference end-to-end',
    fullCode:
      '#include <iostream>\n' +
      'using namespace std;\n' +
      '\n' +
      'void increment(int &x) {\n' +
      '  x = x + 1;\n' +
      '}\n' +
      '\n' +
      'int main() {\n' +
      '  int n = 5;\n' +
      '  increment(n);\n' +
      '  cout << n << endl;\n' +
      '  return 0;\n' +
      '}',
    steps: [
      {
        line: 4,
        code: 'void increment(int &x) {',
        annotation:
          'function takes ONE parameter, by reference. the & between int and x makes x an alias for whatever variable the caller passes.',
        atomIds: ['H-02', 'R-03', 'R-04'],
      },
      {
        line: 5,
        code: '  x = x + 1;',
        annotation:
          'mutate x. because x is an alias (line 4), this writes through to the caller box. NOT a local-only mutation.',
        atomIds: ['R-05', 'A-01', 'A-05', 'S-04'],
      },
      {
        line: 8,
        code: 'int n = 5;',
        annotation: 'caller declares n and stores 5.',
        atomIds: ['V-04', 'V-10', 'V-15', 'A-05'],
      },
      {
        line: 9,
        code: '  increment(n);',
        annotation:
          'call the function. NO & at the call site -- just the variable name. the binding x = n happens inside the function frame.',
        atomIds: ['H-05'],
      },
      {
        line: 10,
        code: '  cout << n << endl;',
        annotation:
          'print n. value is now 6, not 5, because increment mutated through the alias. compare to R-01/R-02 (no &), where this would still print 5.',
        atomIds: ['O-01', 'O-02', 'O-05'],
      },
      {
        line: 11,
        code: '  return 0;',
        annotation: 'main exits success. n persisted its mutation.',
        atomIds: ['S-06'],
      },
    ],
  },
];
