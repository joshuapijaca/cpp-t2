// Hardcoded 5 demo cards for M12 verification.
// Pattern matches M1: 5 inline R-atom cards prove the component renders end-to-end
// before content generation begins (M16). Real demo cards will be authored via
// outline `render_hints.see_demo` in M15 and emitted by `gen-see-demo-cards.ts` in M16.
//
// Spec: cpp-t2/docs/14_see_cards_master_plan.md ("demo card UX").
// All text ASCII per asciify-content.ts: `->` not `arrow`, `-` not em-dash, etc.

import type { DemoCard } from '../types/card';

export const M12_DEMO_PREVIEW: DemoCard[] = [
  {
    type: 'demo',
    atomId: 'R-01',
    whyOneLine: "C++ default: parameter is a copy; caller untouched",
    demoCode:
      'void increment_copy(int x) {\n' +
      '  x = x + 1;\n' +
      '}\n' +
      'int main() {\n' +
      '  int n = 5;\n' +
      '  increment_copy(n);\n' +
      '  cout << n << endl;   // 5 -- caller unchanged\n' +
      '  return 0;\n' +
      '}',
    highlightTokens: ['int x', '// 5 -- caller unchanged'],
    usedIn: ['Q1', 'Q3', 'Q4'],
  },
  {
    type: 'demo',
    atomId: 'R-02',
    whyOneLine: "mutation lives + dies inside function; vanishes at return",
    demoCode:
      'void increment_copy(int x) {\n' +
      '  x = x + 1;          // mutates local box\n' +
      '}\n' +
      'int main() {\n' +
      '  int n = 5;\n' +
      '  increment_copy(n);\n' +
      '  cout << n;           // still 5\n' +
      '}',
    highlightTokens: ['x = x + 1;', '// still 5'],
    usedIn: ['Q1', 'Q3', 'Q4'],
  },
  {
    type: 'demo',
    atomId: 'R-03',
    whyOneLine: "& binds parameter to caller box: same memory, two names",
    demoCode:
      'void increment(int &x) {\n' +
      '  x = x + 1;\n' +
      '}\n' +
      'int main() {\n' +
      '  int n = 5;\n' +
      '  increment(n);        // x and n alias same box\n' +
      '  cout << n << endl;   // 6\n' +
      '  return 0;\n' +
      '}',
    highlightTokens: ['int &x', 'increment(n)', '// 6'],
    usedIn: ['Q1', 'Q3', 'Q4'],
  },
  {
    type: 'demo',
    atomId: 'R-04',
    whyOneLine: "& goes between type and name in the signature",
    demoCode:
      'void who_am_i(stat_double &data) {\n' +
      '  // signature shape used in Q1\n' +
      '  data.mystery = data.a + data.b;\n' +
      '}\n' +
      '\n' +
      'void read_book(book &list[], int count) {\n' +
      '  // signature shape used in Q3\n' +
      '}',
    highlightTokens: ['stat_double &data', 'book &list[]'],
    usedIn: ['Q1', 'Q3'],
  },
  {
    type: 'demo',
    atomId: 'R-05',
    whyOneLine: "with &, every mutation persists: caller sees the change",
    demoCode:
      'void increment(int &x) {\n' +
      '  x = x + 1;            // writes through to caller\n' +
      '}\n' +
      'int main() {\n' +
      '  int n = 5;\n' +
      '  increment(n);\n' +
      '  cout << n << endl;    // 6 -- caller mutated\n' +
      '  return 0;\n' +
      '}',
    highlightTokens: ['int &x', '// 6 -- caller mutated'],
    usedIn: ['Q1', 'Q3', 'Q4'],
  },
];
