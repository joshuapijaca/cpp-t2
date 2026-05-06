// M15 — Author 18 level walkthroughs in outlines/walkthroughs/L-1..L17.yml.
//
// One walkthrough per level. Each shows a real working snippet exercising the
// level's atoms with per-line annotations and atom-ID badges.
//
// Files emitted:
//   outlines/walkthroughs/L-1.yml ... L17.yml
//
// Spec: cpp-t2/docs/14_see_cards_master_plan.md ("walkthrough card UX").

import { mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const DIR = resolve(ROOT, 'outlines/walkthroughs');

interface Step {
  line: number;
  code: string;
  annotation: string;
  atom_ids: string[];
}

interface Walkthrough {
  id: string;            // walkthrough atom id (e.g. WT-L-1)
  level: number;
  level_label: string;
  anchor_atom_id: string;
  full_code: string;
  steps: Step[];
  status: 'locked';
}

function dump(wt: Walkthrough): string {
  const lines: string[] = [];
  lines.push(`id: ${wt.id}`);
  lines.push(`level: ${wt.level}`);
  lines.push(`level_label: "${wt.level_label}"`);
  lines.push(`anchor_atom_id: ${wt.anchor_atom_id}`);
  lines.push(`status: ${wt.status}`);
  lines.push(`full_code: |`);
  for (const ln of wt.full_code.split('\n')) lines.push(`  ${ln}`);
  lines.push(`steps:`);
  for (const s of wt.steps) {
    lines.push(`  - line: ${s.line}`);
    lines.push(`    code: ${JSON.stringify(s.code)}`);
    lines.push(`    annotation: ${JSON.stringify(s.annotation)}`);
    lines.push(`    atom_ids: [${s.atom_ids.join(', ')}]`);
  }
  return lines.join('\n') + '\n';
}

const walkthroughs: Walkthrough[] = [
  {
    id: 'WT-L-1',
    level: -1,
    level_label: 'L-1 pre-programming -- the smallest possible program',
    anchor_atom_id: 'P-01',
    status: 'locked',
    full_code:
      '#include <iostream>\n' +
      'using namespace std;\n' +
      '\n' +
      'int main() {\n' +
      '  cout << "running" << endl;\n' +
      '  return 0;\n' +
      '}',
    steps: [
      { line: 1, code: '#include <iostream>',
        annotation: 'a .cpp file is text the compiler reads. The first line tells the compiler to also pull in cin/cout.',
        atom_ids: ['P-03', 'P-04', 'S-01'] },
      { line: 4, code: 'int main() {',
        annotation: 'every program enters at main(). The OS literally calls this function.',
        atom_ids: ['P-05', 'S-03'] },
      { line: 5, code: '  cout << "running" << endl;',
        annotation: 'the compiler turned this line into machine instructions; running them prints to your terminal.',
        atom_ids: ['P-06', 'O-01', 'O-02', 'O-05'] },
      { line: 6, code: '  return 0;',
        annotation: 'control returns to the OS with status 0 (success).',
        atom_ids: ['P-04', 'S-07'] },
    ],
  },

  {
    id: 'WT-L0',
    level: 0,
    level_label: 'L0 source skeleton -- hello world end-to-end',
    anchor_atom_id: 'S-03',
    status: 'locked',
    full_code:
      '#include <iostream>\n' +
      'using namespace std;\n' +
      '\n' +
      'int main() {\n' +
      '  cout << "hello, world" << endl;\n' +
      '  return 0;\n' +
      '}',
    steps: [
      { line: 1, code: '#include <iostream>', annotation: 'pulls cin/cout/endl into scope.', atom_ids: ['S-01'] },
      { line: 2, code: 'using namespace std;', annotation: 'lets you write cout instead of std::cout (SIT102 convention).', atom_ids: ['S-02'] },
      { line: 4, code: 'int main() {', annotation: 'entry point. Returns int (0 = success).', atom_ids: ['S-03', 'S-05'] },
      { line: 5, code: '  cout << "hello, world" << endl;', annotation: '<< chains to cout. ; terminates.', atom_ids: ['O-01', 'O-02', 'O-05', 'S-04'] },
      { line: 6, code: '  return 0;', annotation: 'reports success.', atom_ids: ['S-07'] },
      { line: 7, code: '}', annotation: 'closes main\'s body.', atom_ids: ['S-06'] },
    ],
  },

  {
    id: 'WT-L1',
    level: 1,
    level_label: 'L1 output -- chained values + printf for Q4',
    anchor_atom_id: 'O-08',
    status: 'locked',
    full_code:
      '#include <iostream>\n' +
      '#include <cstdio>\n' +
      'using namespace std;\n' +
      '\n' +
      'int main() {\n' +
      '  int id = 42;\n' +
      '  string name = "ada";\n' +
      '  cout << id << " " << name << endl;\n' +
      '  printf("%d %s\\n", id, name.c_str());\n' +
      '  return 0;\n' +
      '}',
    steps: [
      { line: 6, code: '  int id = 42;', annotation: 'declare an int, store 42.', atom_ids: ['V-04', 'V-10', 'V-15'] },
      { line: 7, code: '  string name = "ada";', annotation: 'declare a string, store the literal.', atom_ids: ['V-12', 'V-17'] },
      { line: 8, code: '  cout << id << " " << name << endl;', annotation: 'cout chain: int + space + string + newline.', atom_ids: ['O-01', 'O-02', 'O-04', 'O-05', 'O-07'] },
      { line: 9, code: '  printf("%d %s\\n", id, name.c_str());', annotation: 'Q4 printf shape. %d for int, %s for c_str, \\n for newline.', atom_ids: ['O-08', 'O-09', 'O-10', 'O-11', 'MW-09'] },
    ],
  },

  {
    id: 'WT-L2',
    level: 2,
    level_label: 'L2 variables -- declare, init, mutate, read',
    anchor_atom_id: 'V-04',
    status: 'locked',
    full_code:
      '#include <iostream>\n' +
      '#include <string>\n' +
      'using namespace std;\n' +
      '\n' +
      'int main() {\n' +
      '  int n;\n' +
      '  n = 5;\n' +
      '  double price = 9.95;\n' +
      '  string title = "C++";\n' +
      '  cout << n << " " << price << " " << title << endl;\n' +
      '  return 0;\n' +
      '}',
    steps: [
      { line: 6, code: '  int n;', annotation: 'declare an int box named n. Value undefined until written.', atom_ids: ['V-01', 'V-04', 'V-10'] },
      { line: 7, code: '  n = 5;', annotation: 'assignment writes 5 into the box.', atom_ids: ['V-07', 'V-08', 'V-15'] },
      { line: 8, code: '  double price = 9.95;', annotation: 'declare + initialize in one line; double for decimals.', atom_ids: ['V-05', 'V-11', 'V-16'] },
      { line: 9, code: '  string title = "C++";', annotation: 'string holds text; needs <string> include.', atom_ids: ['V-12', 'V-17', 'V-20'] },
      { line: 10, code: '  cout << n << " " << price << " " << title << endl;', annotation: 'reading variables means using their names in expressions.', atom_ids: ['V-06', 'O-07'] },
    ],
  },

  {
    id: 'WT-L3',
    level: 3,
    level_label: 'L3 input -- prompt, read, echo',
    anchor_atom_id: 'I-01',
    status: 'locked',
    full_code:
      '#include <iostream>\n' +
      'using namespace std;\n' +
      '\n' +
      'int main() {\n' +
      '  int n;\n' +
      '  cout << "enter a count: ";\n' +
      '  cin >> n;\n' +
      '  cout << "got " << n << endl;\n' +
      '  return 0;\n' +
      '}',
    steps: [
      { line: 5, code: '  int n;', annotation: 'declare destination box.', atom_ids: ['V-04', 'V-10'] },
      { line: 6, code: '  cout << "enter a count: ";', annotation: 'always prompt before cin so the user knows what to type.', atom_ids: ['O-01', 'O-03'] },
      { line: 7, code: '  cin >> n;', annotation: 'cin pauses, reads the typed token, parses to int, stores in n.', atom_ids: ['I-01', 'I-02', 'I-03', 'I-05'] },
      { line: 8, code: '  cout << "got " << n << endl;', annotation: 'echo back so the user can confirm.', atom_ids: ['O-01', 'O-02', 'O-04', 'O-05'] },
    ],
  },

  {
    id: 'WT-L4',
    level: 4,
    level_label: 'L4 operators -- arithmetic with order of operations',
    anchor_atom_id: 'A-01',
    status: 'locked',
    full_code:
      '#include <iostream>\n' +
      'using namespace std;\n' +
      '\n' +
      'int main() {\n' +
      '  int width = 4;\n' +
      '  int height = 3;\n' +
      '  int area = width * height;\n' +
      '  int perim = 2 * (width + height);\n' +
      '  cout << "area = " << area << endl;\n' +
      '  cout << "perim = " << perim << endl;\n' +
      '  return 0;\n' +
      '}',
    steps: [
      { line: 5, code: '  int width = 4;', annotation: 'declare and store.', atom_ids: ['V-04', 'V-15'] },
      { line: 7, code: '  int area = width * height;', annotation: '* binds tighter than +; here width * height = 12.', atom_ids: ['A-03'] },
      { line: 8, code: '  int perim = 2 * (width + height);', annotation: '() forces + first: 2 * (4 + 3) = 14.', atom_ids: ['A-01', 'A-03', 'A-07', 'A-08'] },
    ],
  },

  {
    id: 'WT-L5',
    level: 5,
    level_label: 'L5 comparison + logical -- bool from compare',
    anchor_atom_id: 'C-07',
    status: 'locked',
    full_code:
      '#include <iostream>\n' +
      'using namespace std;\n' +
      '\n' +
      'int main() {\n' +
      '  int score = 75;\n' +
      '  bool passed = (score >= 50);\n' +
      '  bool top = (score > 90);\n' +
      '  bool either = passed || top;\n' +
      '  cout << passed << " " << top << " " << either << endl;\n' +
      '  return 0;\n' +
      '}',
    steps: [
      { line: 6, code: '  bool passed = (score >= 50);', annotation: '>= returns bool; stored directly.', atom_ids: ['C-06', 'C-07', 'V-13'] },
      { line: 7, code: '  bool top = (score > 90);', annotation: '> compares greater-than.', atom_ids: ['C-04', 'C-07'] },
      { line: 8, code: '  bool either = passed || top;', annotation: '|| chains two bools; true if either is true.', atom_ids: ['L-02'] },
    ],
  },

  {
    id: 'WT-L6',
    level: 6,
    level_label: 'L6 conditionals -- if / else if / else',
    anchor_atom_id: 'F-01',
    status: 'locked',
    full_code:
      '#include <iostream>\n' +
      'using namespace std;\n' +
      '\n' +
      'int main() {\n' +
      '  int score = 75;\n' +
      '  if (score >= 90) {\n' +
      '    cout << "A";\n' +
      '  } else if (score >= 50) {\n' +
      '    cout << "P";\n' +
      '  } else {\n' +
      '    cout << "F";\n' +
      '  }\n' +
      '  return 0;\n' +
      '}',
    steps: [
      { line: 6, code: '  if (score >= 90) {', annotation: 'first test; runs body if true.', atom_ids: ['F-01', 'C-06', 'F-04'] },
      { line: 8, code: '  } else if (score >= 50) {', annotation: 'else if chains another test only when prior was false.', atom_ids: ['F-03'] },
      { line: 10, code: '  } else {', annotation: 'else runs when no prior test matched.', atom_ids: ['F-02'] },
    ],
  },

  {
    id: 'WT-L7',
    level: 7,
    level_label: 'L7 loops -- for-loop walks 0..n-1',
    anchor_atom_id: 'W-03',
    status: 'locked',
    full_code:
      '#include <iostream>\n' +
      'using namespace std;\n' +
      '\n' +
      'int main() {\n' +
      '  int n = 5;\n' +
      '  for (int i = 0; i < n; i++) {\n' +
      '    cout << i << " ";\n' +
      '  }\n' +
      '  cout << endl;\n' +
      '  return 0;\n' +
      '}',
    steps: [
      { line: 6, code: '  for (int i = 0; i < n; i++) {', annotation: 'init runs once, cond before each, step after.', atom_ids: ['W-03', 'W-04', 'W-05', 'W-06'] },
      { line: 7, code: '    cout << i << " ";', annotation: 'body runs while cond is true.', atom_ids: ['O-02', 'O-04'] },
    ],
  },

  {
    id: 'WT-L8',
    level: 8,
    level_label: 'L8 functions -- call, parameter, return',
    anchor_atom_id: 'H-02',
    status: 'locked',
    full_code:
      '#include <iostream>\n' +
      'using namespace std;\n' +
      '\n' +
      'int square(int n) {\n' +
      '  return n * n;\n' +
      '}\n' +
      '\n' +
      'int main() {\n' +
      '  int r = square(5);\n' +
      '  cout << r << endl;\n' +
      '  return 0;\n' +
      '}',
    steps: [
      { line: 4, code: 'int square(int n) {', annotation: 'signature: returns int, named square, takes one int param.', atom_ids: ['H-01', 'H-02', 'H-04'] },
      { line: 5, code: '  return n * n;', annotation: 'compute and hand value back to the caller.', atom_ids: ['H-05', 'A-03'] },
      { line: 9, code: '  int r = square(5);', annotation: 'caller binds 5 to n inside the function frame, gets 25 back.', atom_ids: ['H-03', 'H-09'] },
    ],
  },

  {
    id: 'WT-L9',
    level: 9,
    level_label: 'L9 RDS -- pass-by-reference end-to-end',
    anchor_atom_id: 'R-03',
    status: 'locked',
    full_code:
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
      { line: 4, code: 'void increment(int &x) {', annotation: '& between type and name makes x an alias for caller box.', atom_ids: ['H-02', 'R-03', 'R-04'] },
      { line: 5, code: '  x = x + 1;', annotation: 'mutation writes through the alias to caller.', atom_ids: ['R-05', 'A-01', 'A-05'] },
      { line: 9, code: '  int n = 5;', annotation: 'caller variable.', atom_ids: ['V-04', 'V-15'] },
      { line: 10, code: '  increment(n);', annotation: 'no & at call site; binding happens inside the function frame.', atom_ids: ['H-03'] },
      { line: 11, code: '  cout << n << endl;', annotation: 'prints 6 (mutated), not 5. Compare to R-01/R-02 (no &).', atom_ids: ['R-08'] },
    ],
  },

  {
    id: 'WT-L10',
    level: 10,
    level_label: 'L10 arrays -- declare, fill, walk, sum',
    anchor_atom_id: 'G-11',
    status: 'locked',
    full_code:
      '#include <iostream>\n' +
      'using namespace std;\n' +
      '\n' +
      'int main() {\n' +
      '  int arr[5] = {10, 20, 30, 40, 50};\n' +
      '  int total = 0;\n' +
      '  for (int i = 0; i < 5; i++) {\n' +
      '    total = total + arr[i];\n' +
      '  }\n' +
      '  cout << total << endl;\n' +
      '  return 0;\n' +
      '}',
    steps: [
      { line: 5, code: '  int arr[5] = {10, 20, 30, 40, 50};', annotation: 'declare and initialize a fixed-size array.', atom_ids: ['G-01', 'G-02', 'G-03'] },
      { line: 7, code: '  for (int i = 0; i < 5; i++) {', annotation: 'walk 0..4. arr[5] would be out of bounds.', atom_ids: ['G-06', 'G-08', 'G-11', 'W-03'] },
      { line: 8, code: '    total = total + arr[i];', annotation: 'arr[i] reads the i-th slot.', atom_ids: ['G-04', 'G-05'] },
    ],
  },

  {
    id: 'WT-L11',
    level: 11,
    level_label: 'L11 structs -- define, declare, write, read',
    anchor_atom_id: 'T-01',
    status: 'locked',
    full_code:
      '#include <iostream>\n' +
      '#include <string>\n' +
      'using namespace std;\n' +
      '\n' +
      'struct book {\n' +
      '  int id;\n' +
      '  string title;\n' +
      '  double price;\n' +
      '};\n' +
      '\n' +
      'int main() {\n' +
      '  book b;\n' +
      '  b.id = 1;\n' +
      '  b.title = "C++";\n' +
      '  b.price = 9.95;\n' +
      '  cout << b.id << " " << b.title << endl;\n' +
      '  return 0;\n' +
      '}',
    steps: [
      { line: 5, code: 'struct book {', annotation: 'open the type definition.', atom_ids: ['T-01', 'T-02'] },
      { line: 6, code: '  int id;', annotation: 'each field: type fieldName;', atom_ids: ['T-03'] },
      { line: 9, code: '};', annotation: '; required after } when defining a type.', atom_ids: ['T-04'] },
      { line: 12, code: '  book b;', annotation: 'now book is a usable type.', atom_ids: ['T-05'] },
      { line: 13, code: '  b.id = 1;', annotation: '. accesses one field; = writes it.', atom_ids: ['T-06', 'T-07'] },
      { line: 16, code: '  cout << b.id << " " << b.title << endl;', annotation: 'reading fields via .field', atom_ids: ['T-08'] },
    ],
  },

  {
    id: 'WT-L12',
    level: 12,
    level_label: 'L12 pass composites -- struct and array via &',
    anchor_atom_id: 'PC-02',
    status: 'locked',
    full_code:
      '#include <iostream>\n' +
      'using namespace std;\n' +
      '\n' +
      'struct stat_double { double mystery; double a; double b; };\n' +
      '\n' +
      'void compute(stat_double &d) {\n' +
      '  d.mystery = d.a + d.b;\n' +
      '}\n' +
      '\n' +
      'int main() {\n' +
      '  stat_double d;\n' +
      '  d.a = 3; d.b = 4;\n' +
      '  compute(d);\n' +
      '  cout << d.mystery << endl;\n' +
      '  return 0;\n' +
      '}',
    steps: [
      { line: 6, code: 'void compute(stat_double &d) {', annotation: '& on struct param: caller and d are the SAME struct.', atom_ids: ['PC-02', 'R-04'] },
      { line: 7, code: '  d.mystery = d.a + d.b;', annotation: 'writing d.mystery persists in caller (PC-03).', atom_ids: ['PC-03', 'T-07'] },
      { line: 13, code: '  compute(d);', annotation: 'pass d by ref; no special syntax at call site.', atom_ids: ['H-03'] },
      { line: 14, code: '  cout << d.mystery << endl;', annotation: 'main sees the mutation: prints 7.', atom_ids: ['T-08'] },
    ],
  },

  {
    id: 'WT-L13',
    level: 13,
    level_label: 'L13 hand-execution -- predicting d.mystery',
    anchor_atom_id: 'HE-01',
    status: 'locked',
    full_code:
      'struct stat_double { double mystery; double a; double b; };\n' +
      '\n' +
      'void who_am_i(stat_double &data) {\n' +
      '  data.mystery = 0;\n' +
      '  if (data.a > data.b) {\n' +
      '    data.mystery = data.a;\n' +
      '  } else {\n' +
      '    data.mystery = data.b;\n' +
      '  }\n' +
      '}',
    steps: [
      { line: 3, code: 'void who_am_i(stat_double &data) {', annotation: 'remember & means main\'s d and data are the same struct.', atom_ids: ['HE-08', 'R-04'] },
      { line: 4, code: '  data.mystery = 0;', annotation: 'overwrite data.mystery to 0; record this state.', atom_ids: ['HE-03', 'T-07'] },
      { line: 5, code: '  if (data.a > data.b) {', annotation: 'pick branch by current values of data.a and data.b.', atom_ids: ['HE-05', 'C-04'] },
      { line: 6, code: '    data.mystery = data.a;', annotation: 'if true, write data.a into data.mystery.', atom_ids: ['HE-17'] },
      { line: 8, code: '    data.mystery = data.b;', annotation: 'else, write data.b. only ONE side runs.', atom_ids: ['HE-13'] },
    ],
  },

  {
    id: 'WT-L14',
    level: 14,
    level_label: 'L14 struct-write -- Q2 from spec',
    anchor_atom_id: 'SW-01',
    status: 'locked',
    full_code:
      '// Q2 spec: book has id, title, price.\n' +
      '\n' +
      'struct book {\n' +
      '  int id;\n' +
      '  string title;\n' +
      '  double price;\n' +
      '};',
    steps: [
      { line: 3, code: 'struct book {', annotation: 'header: keyword + name + opening brace.', atom_ids: ['SW-01', 'T-02'] },
      { line: 4, code: '  int id;', annotation: 'pick int for ids.', atom_ids: ['SW-02', 'SW-04', 'V-10'] },
      { line: 5, code: '  string title;', annotation: 'string for text fields.', atom_ids: ['SW-04', 'V-12'] },
      { line: 6, code: '  double price;', annotation: 'double for amounts.', atom_ids: ['SW-04', 'V-11'] },
      { line: 7, code: '};', annotation: 'closing brace + ; -- skipping ; fails the grader.', atom_ids: ['SW-03', 'T-04'] },
    ],
  },

  {
    id: 'WT-L15',
    level: 15,
    level_label: 'L15 read-function -- Q3 read_book',
    anchor_atom_id: 'RW-01',
    status: 'locked',
    full_code:
      'void read_book(book &list[], int count) {\n' +
      '  for (int i = 0; i < count; i++) {\n' +
      '    cout << "id: ";    cin >> list[i].id;\n' +
      '    cout << "title: "; cin >> list[i].title;\n' +
      '    cout << "price: "; cin >> list[i].price;\n' +
      '  }\n' +
      '}',
    steps: [
      { line: 1, code: 'void read_book(book &list[], int count) {', annotation: 'void return + array-by-ref + int count = Q3 signature shape.', atom_ids: ['RW-01', 'RW-02', 'RW-03', 'PC-04'] },
      { line: 2, code: '  for (int i = 0; i < count; i++) {', annotation: 'walk 0..count-1.', atom_ids: ['RW-04', 'W-03'] },
      { line: 3, code: '    cout << "id: ";    cin >> list[i].id;', annotation: 'prompt then cin into one field.', atom_ids: ['RW-05', 'RW-07', 'I-01'] },
      { line: 4, code: '    cout << "title: "; cin >> list[i].title;', annotation: 'one cin per field; order matches struct definition.', atom_ids: ['RW-06'] },
    ],
  },

  {
    id: 'WT-L16',
    level: 16,
    level_label: 'L16 main-write -- Q4 full main',
    anchor_atom_id: 'MW-01',
    status: 'locked',
    full_code:
      'int main() {\n' +
      '  const int MAX = 100;\n' +
      '  book list[MAX];\n' +
      '  int count;\n' +
      '  cin >> count;\n' +
      '  read_book(list, count);\n' +
      '  for (int i = 0; i < count; i++) {\n' +
      '    printf("%d %s %.2f\\n", list[i].id, list[i].title.c_str(), list[i].price);\n' +
      '  }\n' +
      '  return 0;\n' +
      '}',
    steps: [
      { line: 1, code: 'int main() {', annotation: 'Q4 always asks for a complete main.', atom_ids: ['MW-01', 'S-03'] },
      { line: 2, code: '  const int MAX = 100;', annotation: 'capacity constant; declared FIRST.', atom_ids: ['MW-02'] },
      { line: 3, code: '  book list[MAX];', annotation: 'array of structs sized to MAX.', atom_ids: ['MW-03', 'T-11'] },
      { line: 4, code: '  int count;', annotation: 'storage for actual record count.', atom_ids: ['MW-04'] },
      { line: 5, code: '  cin >> count;', annotation: 'user types record count.', atom_ids: ['MW-05', 'I-03'] },
      { line: 6, code: '  read_book(list, count);', annotation: 'call Q3 to fill the array.', atom_ids: ['MW-06'] },
      { line: 7, code: '  for (int i = 0; i < count; i++) {', annotation: 'print loop walks the records.', atom_ids: ['MW-07', 'W-03'] },
      { line: 8, code: '    printf("%d %s %.2f\\n", list[i].id, list[i].title.c_str(), list[i].price);', annotation: 'printf with %d, %s, %.2f, .c_str() for the string.', atom_ids: ['MW-08', 'MW-09', 'O-08', 'O-09', 'O-10'] },
      { line: 10, code: '  return 0;', annotation: 'main ends with success.', atom_ids: ['S-07'] },
    ],
  },

  {
    id: 'WT-L17',
    level: 17,
    level_label: 'L17 mock exam -- the four shapes back-to-back',
    anchor_atom_id: 'ME-01',
    status: 'locked',
    full_code:
      '// Q1 trace: who_am_i(stat_double &data)\n' +
      '// Q2 write: struct book { int id; string title; double price; };\n' +
      '// Q3 write: void read_book(book &list[], int count) { ... }\n' +
      '// Q4 write: int main() { const MAX, list, count, cin, call, printf, return 0 }\n' +
      '//\n' +
      '// Each Q has one stable shape; the variant-name only changes (book -> car -> ...).',
    steps: [
      { line: 1, code: '// Q1 trace', annotation: 'predict d.mystery after who_am_i runs (HE-* atoms).', atom_ids: ['HE-01', 'ME-01'] },
      { line: 2, code: '// Q2 write struct', annotation: 'three fields, types from spec, ; after } (SW-* atoms).', atom_ids: ['SW-01', 'ME-02'] },
      { line: 3, code: '// Q3 write read_X', annotation: 'void + &list[] + int count + for-loop + cin per field (RW-* atoms).', atom_ids: ['RW-01', 'ME-03'] },
      { line: 4, code: '// Q4 write main', annotation: 'const MAX + list[MAX] + count + cin + call read + printf loop (MW-* atoms).', atom_ids: ['MW-01', 'ME-04'] },
    ],
  },
];

function main() {
  mkdirSync(DIR, { recursive: true });
  let written = 0;
  for (const wt of walkthroughs) {
    const filename = `L${wt.level}.yml`.replace('L-1', 'L-1');
    const out = resolve(DIR, filename);
    writeFileSync(out, dump(wt));
    written++;
  }
  console.log(`wrote ${written} walkthroughs to ${DIR}`);
}

main();
