// M15 — Author 40 worked examples (10 per Q × 4 Qs).
//
// Q-archetype "demo-style" walkthroughs of the four T2 question shapes.
// Each example shows a complete solution + 1-line explanation; the variant
// hypothesis is honored (entity names, fields, format specs vary; shape stable).
//
// Files emitted:
//   outlines/worked_examples/Q1.yml  -- 10 hand-trace variants
//   outlines/worked_examples/Q2.yml  -- 10 struct-write variants
//   outlines/worked_examples/Q3.yml  -- 10 read_X variants
//   outlines/worked_examples/Q4.yml  -- 10 main variants
//
// Spec: cpp-t2/docs/14_see_cards_master_plan.md ("worked-example demo style").

import { mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const DIR = resolve(ROOT, 'outlines/worked_examples');

interface WorkedExample {
  id: string;
  q: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  variant_name: string;
  code: string;
  highlights: string[];
  expected_output?: string;
  explanation: string;
}

function dump(qLabel: string, list: WorkedExample[]): string {
  const lines: string[] = [];
  lines.push(`# ${qLabel} -- 10 worked examples (M15)`);
  lines.push(`# Spec: cpp-t2/docs/14_see_cards_master_plan.md ("worked-example").`);
  lines.push(`question: ${qLabel}`);
  lines.push(`status: locked`);
  lines.push(`examples:`);
  for (const e of list) {
    lines.push(`  - id: ${e.id}`);
    lines.push(`    variant_name: ${JSON.stringify(e.variant_name)}`);
    lines.push(`    explanation: ${JSON.stringify(e.explanation)}`);
    if (e.expected_output) lines.push(`    expected_output: ${JSON.stringify(e.expected_output)}`);
    lines.push(`    highlights: [${e.highlights.map((h) => JSON.stringify(h)).join(', ')}]`);
    lines.push(`    code: |`);
    for (const ln of e.code.split('\n')) lines.push(`      ${ln}`);
  }
  return lines.join('\n') + '\n';
}

// === Q1: hand-trace who_am_i variants ===========================================
// Each shows a stat_double struct + a who_am_i function with a different mystery rule.

const Q1: WorkedExample[] = [
  {
    id: 'we-q1-01', q: 'Q1', variant_name: 'max-of-two',
    explanation: 'mystery becomes the larger of a and b. Branch picks one side.',
    expected_output: 'mystery = 7',
    highlights: ['stat_double &data', 'data.mystery'],
    code:
      'struct stat_double { double mystery; double a; double b; };\n' +
      '\n' +
      'void who_am_i(stat_double &data) {\n' +
      '  if (data.a > data.b) data.mystery = data.a;\n' +
      '  else                data.mystery = data.b;\n' +
      '}\n' +
      '\n' +
      '// caller: d.a = 7, d.b = 3 -> d.mystery = 7',
  },
  {
    id: 'we-q1-02', q: 'Q1', variant_name: 'sum-of-two',
    explanation: 'mystery becomes a + b. No branching.',
    expected_output: 'mystery = 10',
    highlights: ['data.a + data.b'],
    code:
      'void who_am_i(stat_double &data) {\n' +
      '  data.mystery = data.a + data.b;\n' +
      '}\n' +
      '// caller: d.a = 4, d.b = 6 -> d.mystery = 10',
  },
  {
    id: 'we-q1-03', q: 'Q1', variant_name: 'array-max',
    explanation: 'walk an array field, keep the max. Q1 archetype on real T2.',
    expected_output: 'mystery = 9',
    highlights: ['data.numbers[i]', 'data.numbers[i] > data.mystery'],
    code:
      'struct stat_double { double mystery; double numbers[5]; };\n' +
      '\n' +
      'void who_am_i(stat_double &data) {\n' +
      '  data.mystery = data.numbers[0];\n' +
      '  for (int i = 1; i < 5; i++) {\n' +
      '    if (data.numbers[i] > data.mystery) {\n' +
      '      data.mystery = data.numbers[i];\n' +
      '    }\n' +
      '  }\n' +
      '}\n' +
      '// caller: numbers = {3, 9, 1, 7, 4} -> mystery = 9',
  },
  {
    id: 'we-q1-04', q: 'Q1', variant_name: 'array-min',
    explanation: 'same loop shape, < instead of >. Watch the comparison flip.',
    expected_output: 'mystery = 1',
    highlights: ['data.numbers[i] < data.mystery'],
    code:
      'void who_am_i(stat_double &data) {\n' +
      '  data.mystery = data.numbers[0];\n' +
      '  for (int i = 1; i < 5; i++) {\n' +
      '    if (data.numbers[i] < data.mystery) {\n' +
      '      data.mystery = data.numbers[i];\n' +
      '    }\n' +
      '  }\n' +
      '}\n' +
      '// caller: numbers = {3, 9, 1, 7, 4} -> mystery = 1',
  },
  {
    id: 'we-q1-05', q: 'Q1', variant_name: 'array-sum',
    explanation: 'accumulate over the array; mystery is the running total.',
    expected_output: 'mystery = 24',
    highlights: ['data.mystery = data.mystery + data.numbers[i]'],
    code:
      'void who_am_i(stat_double &data) {\n' +
      '  data.mystery = 0;\n' +
      '  for (int i = 0; i < 5; i++) {\n' +
      '    data.mystery = data.mystery + data.numbers[i];\n' +
      '  }\n' +
      '}\n' +
      '// caller: numbers = {3, 9, 1, 7, 4} -> mystery = 24',
  },
  {
    id: 'we-q1-06', q: 'Q1', variant_name: 'count-greater-than-threshold',
    explanation: 'count how many entries beat a threshold; mystery is the count.',
    expected_output: 'mystery = 3',
    highlights: ['if (data.numbers[i] > 5)', 'data.mystery'],
    code:
      'void who_am_i(stat_double &data) {\n' +
      '  data.mystery = 0;\n' +
      '  for (int i = 0; i < 5; i++) {\n' +
      '    if (data.numbers[i] > 5) data.mystery = data.mystery + 1;\n' +
      '  }\n' +
      '}\n' +
      '// caller: numbers = {3, 9, 1, 7, 8} -> mystery = 3',
  },
  {
    id: 'we-q1-07', q: 'Q1', variant_name: 'first-positive',
    explanation: 'find the first positive entry; break out of loop semantics.',
    expected_output: 'mystery = 7',
    highlights: ['if (data.numbers[i] > 0)', 'break'],
    code:
      'void who_am_i(stat_double &data) {\n' +
      '  data.mystery = -1;\n' +
      '  for (int i = 0; i < 5; i++) {\n' +
      '    if (data.numbers[i] > 0) {\n' +
      '      data.mystery = data.numbers[i];\n' +
      '      break;\n' +
      '    }\n' +
      '  }\n' +
      '}\n' +
      '// caller: numbers = {0, -2, 7, 4, 1} -> mystery = 7',
  },
  {
    id: 'we-q1-08', q: 'Q1', variant_name: 'average',
    explanation: 'sum then divide. Watch int vs double division.',
    expected_output: 'mystery = 4.8',
    highlights: ['data.mystery = data.mystery / 5'],
    code:
      'void who_am_i(stat_double &data) {\n' +
      '  data.mystery = 0;\n' +
      '  for (int i = 0; i < 5; i++) {\n' +
      '    data.mystery = data.mystery + data.numbers[i];\n' +
      '  }\n' +
      '  data.mystery = data.mystery / 5;\n' +
      '}\n' +
      '// caller: numbers = {3, 9, 1, 7, 4} -> mystery = 4.8 (double / int)',
  },
  {
    id: 'we-q1-09', q: 'Q1', variant_name: 'product-of-two',
    explanation: 'mystery = a * b; simplest non-additive formula.',
    expected_output: 'mystery = 35',
    highlights: ['data.a * data.b'],
    code:
      'void who_am_i(stat_double &data) {\n' +
      '  data.mystery = data.a * data.b;\n' +
      '}\n' +
      '// caller: d.a = 5, d.b = 7 -> d.mystery = 35',
  },
  {
    id: 'we-q1-10', q: 'Q1', variant_name: 'no-ampersand-trap',
    explanation: 'WITHOUT &, mutation never reaches caller. mystery stays at its initial value.',
    expected_output: 'mystery = 0 (unchanged)',
    highlights: ['stat_double data', 'data.mystery = 99'],
    code:
      '// SUBTLE: missing & means caller is untouched.\n' +
      'void who_am_i(stat_double data) {   // <-- no &\n' +
      '  data.mystery = 99;\n' +
      '}\n' +
      '// caller: d.mystery = 0 -> after call: d.mystery STILL 0',
  },
];

// === Q2: struct-write variants ===================================================

const Q2: WorkedExample[] = [
  {
    id: 'we-q2-01', q: 'Q2', variant_name: 'book',
    explanation: 'book: int id, string title, double price.',
    highlights: ['struct book', 'string title', 'double price'],
    code:
      'struct book {\n' +
      '  int id;\n' +
      '  string title;\n' +
      '  double price;\n' +
      '};',
  },
  {
    id: 'we-q2-02', q: 'Q2', variant_name: 'movie',
    explanation: 'movie: int id, string title, int year.',
    highlights: ['struct movie', 'int year'],
    code:
      'struct movie {\n' +
      '  int id;\n' +
      '  string title;\n' +
      '  int year;\n' +
      '};',
  },
  {
    id: 'we-q2-03', q: 'Q2', variant_name: 'student',
    explanation: 'student: int id, string name, double gpa.',
    highlights: ['struct student', 'string name', 'double gpa'],
    code:
      'struct student {\n' +
      '  int id;\n' +
      '  string name;\n' +
      '  double gpa;\n' +
      '};',
  },
  {
    id: 'we-q2-04', q: 'Q2', variant_name: 'product',
    explanation: 'product: int id, string description, double price.',
    highlights: ['string description'],
    code:
      'struct product {\n' +
      '  int id;\n' +
      '  string description;\n' +
      '  double price;\n' +
      '};',
  },
  {
    id: 'we-q2-05', q: 'Q2', variant_name: 'employee',
    explanation: 'employee: int id, string name, string department.',
    highlights: ['string department'],
    code:
      'struct employee {\n' +
      '  int id;\n' +
      '  string name;\n' +
      '  string department;\n' +
      '};',
  },
  {
    id: 'we-q2-06', q: 'Q2', variant_name: 'car',
    explanation: 'car: string make, string model, int year.',
    highlights: ['struct car'],
    code:
      'struct car {\n' +
      '  string make;\n' +
      '  string model;\n' +
      '  int year;\n' +
      '};',
  },
  {
    id: 'we-q2-07', q: 'Q2', variant_name: 'recipe',
    explanation: 'recipe: int id, string name, int servings.',
    highlights: ['int servings'],
    code:
      'struct recipe {\n' +
      '  int id;\n' +
      '  string name;\n' +
      '  int servings;\n' +
      '};',
  },
  {
    id: 'we-q2-08', q: 'Q2', variant_name: 'song',
    explanation: 'song: string title, string artist, double duration.',
    highlights: ['struct song'],
    code:
      'struct song {\n' +
      '  string title;\n' +
      '  string artist;\n' +
      '  double duration;\n' +
      '};',
  },
  {
    id: 'we-q2-09', q: 'Q2', variant_name: 'trap-missing-semicolon',
    explanation: 'WRONG. Missing ; after closing }. SIT102 grader fails this.',
    highlights: ['}'],
    code:
      '// WRONG: missing semicolon -- the grader rejects this.\n' +
      'struct book {\n' +
      '  int id;\n' +
      '  string title;\n' +
      '  double price;\n' +
      '}                  // <-- missing ;',
  },
  {
    id: 'we-q2-10', q: 'Q2', variant_name: 'trap-comma-separated-fields',
    explanation: 'WRONG. Each field is its own statement; commas are illegal here.',
    highlights: [','],
    code:
      '// WRONG: cannot comma-separate inside struct.\n' +
      'struct book {\n' +
      '  int id, string title, double price   // <-- not allowed\n' +
      '};',
  },
];

// === Q3: read_X variants =========================================================

const Q3: WorkedExample[] = [
  {
    id: 'we-q3-01', q: 'Q3', variant_name: 'read_book',
    explanation: 'canonical Q3: void + &list[] + int count + for-loop + cin per field.',
    highlights: ['book &list[]', 'cin >> list[i].title'],
    code:
      'void read_book(book &list[], int count) {\n' +
      '  for (int i = 0; i < count; i++) {\n' +
      '    cout << "id: ";    cin >> list[i].id;\n' +
      '    cout << "title: "; cin >> list[i].title;\n' +
      '    cout << "price: "; cin >> list[i].price;\n' +
      '  }\n' +
      '}',
  },
  {
    id: 'we-q3-02', q: 'Q3', variant_name: 'read_movie',
    explanation: 'movie variant: same shape, three different fields.',
    highlights: ['movie &list[]', 'cin >> list[i].year'],
    code:
      'void read_movie(movie &list[], int count) {\n' +
      '  for (int i = 0; i < count; i++) {\n' +
      '    cin >> list[i].id;\n' +
      '    cin >> list[i].title;\n' +
      '    cin >> list[i].year;\n' +
      '  }\n' +
      '}',
  },
  {
    id: 'we-q3-03', q: 'Q3', variant_name: 'read_student',
    explanation: 'student variant; cin >> on a double field for gpa.',
    highlights: ['student &list[]', 'list[i].gpa'],
    code:
      'void read_student(student &list[], int count) {\n' +
      '  for (int i = 0; i < count; i++) {\n' +
      '    cin >> list[i].id;\n' +
      '    cin >> list[i].name;\n' +
      '    cin >> list[i].gpa;\n' +
      '  }\n' +
      '}',
  },
  {
    id: 'we-q3-04', q: 'Q3', variant_name: 'read_product',
    explanation: 'product: id, description, price.',
    highlights: ['product &list[]'],
    code:
      'void read_product(product &list[], int count) {\n' +
      '  for (int i = 0; i < count; i++) {\n' +
      '    cin >> list[i].id;\n' +
      '    cin >> list[i].description;\n' +
      '    cin >> list[i].price;\n' +
      '  }\n' +
      '}',
  },
  {
    id: 'we-q3-05', q: 'Q3', variant_name: 'read_employee',
    explanation: 'employee variant; two strings.',
    highlights: ['employee &list[]'],
    code:
      'void read_employee(employee &list[], int count) {\n' +
      '  for (int i = 0; i < count; i++) {\n' +
      '    cin >> list[i].id;\n' +
      '    cin >> list[i].name;\n' +
      '    cin >> list[i].department;\n' +
      '  }\n' +
      '}',
  },
  {
    id: 'we-q3-06', q: 'Q3', variant_name: 'read_car',
    explanation: 'car: two string fields then int.',
    highlights: ['car &list[]'],
    code:
      'void read_car(car &list[], int count) {\n' +
      '  for (int i = 0; i < count; i++) {\n' +
      '    cin >> list[i].make;\n' +
      '    cin >> list[i].model;\n' +
      '    cin >> list[i].year;\n' +
      '  }\n' +
      '}',
  },
  {
    id: 'we-q3-07', q: 'Q3', variant_name: 'read_recipe',
    explanation: 'recipe: id, name, servings.',
    highlights: ['recipe &list[]'],
    code:
      'void read_recipe(recipe &list[], int count) {\n' +
      '  for (int i = 0; i < count; i++) {\n' +
      '    cin >> list[i].id;\n' +
      '    cin >> list[i].name;\n' +
      '    cin >> list[i].servings;\n' +
      '  }\n' +
      '}',
  },
  {
    id: 'we-q3-08', q: 'Q3', variant_name: 'read_song',
    explanation: 'song: title, artist, duration.',
    highlights: ['song &list[]'],
    code:
      'void read_song(song &list[], int count) {\n' +
      '  for (int i = 0; i < count; i++) {\n' +
      '    cin >> list[i].title;\n' +
      '    cin >> list[i].artist;\n' +
      '    cin >> list[i].duration;\n' +
      '  }\n' +
      '}',
  },
  {
    id: 'we-q3-09', q: 'Q3', variant_name: 'trap-no-ampersand',
    explanation: 'WRONG. Without &, writes vanish at return. Caller array stays empty.',
    highlights: ['book list[]'],
    code:
      '// WRONG: no & means writes never reach caller.\n' +
      'void read_book(book list[], int count) {   // <-- missing &\n' +
      '  for (int i = 0; i < count; i++) {\n' +
      '    cin >> list[i].id;          // local copy\n' +
      '    cin >> list[i].title;\n' +
      '    cin >> list[i].price;\n' +
      '  }\n' +
      '}',
  },
  {
    id: 'we-q3-10', q: 'Q3', variant_name: 'trap-wrong-loop-bound',
    explanation: 'WRONG. i <= count walks one past the last record.',
    highlights: ['i <= count'],
    code:
      '// WRONG: i <= count is off-by-one.\n' +
      'void read_book(book &list[], int count) {\n' +
      '  for (int i = 0; i <= count; i++) {        // <-- should be i < count\n' +
      '    cin >> list[i].id;\n' +
      '  }\n' +
      '}',
  },
];

// === Q4: main() variants =========================================================

const Q4: WorkedExample[] = [
  {
    id: 'we-q4-01', q: 'Q4', variant_name: 'book-main',
    explanation: 'canonical Q4: const MAX, list[MAX], count, cin, call read, printf loop.',
    highlights: ['const int MAX = 100;', 'read_book(list, count);', '%d %s %.2f\\n', '.c_str()'],
    code:
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
  },
  {
    id: 'we-q4-02', q: 'Q4', variant_name: 'movie-main',
    explanation: 'movie variant; year is %d not %.2f.',
    highlights: ['movie list[MAX];', '%d %s %d\\n'],
    code:
      'int main() {\n' +
      '  const int MAX = 100;\n' +
      '  movie list[MAX];\n' +
      '  int count;\n' +
      '  cin >> count;\n' +
      '  read_movie(list, count);\n' +
      '  for (int i = 0; i < count; i++) {\n' +
      '    printf("%d %s %d\\n", list[i].id, list[i].title.c_str(), list[i].year);\n' +
      '  }\n' +
      '  return 0;\n' +
      '}',
  },
  {
    id: 'we-q4-03', q: 'Q4', variant_name: 'student-main',
    explanation: 'student variant; gpa formatted as %.2f.',
    highlights: ['student list[MAX];', '%.2f'],
    code:
      'int main() {\n' +
      '  const int MAX = 100;\n' +
      '  student list[MAX];\n' +
      '  int count;\n' +
      '  cin >> count;\n' +
      '  read_student(list, count);\n' +
      '  for (int i = 0; i < count; i++) {\n' +
      '    printf("%d %s %.2f\\n", list[i].id, list[i].name.c_str(), list[i].gpa);\n' +
      '  }\n' +
      '  return 0;\n' +
      '}',
  },
  {
    id: 'we-q4-04', q: 'Q4', variant_name: 'product-main',
    explanation: 'product variant; description is the string field.',
    highlights: ['product list[MAX];'],
    code:
      'int main() {\n' +
      '  const int MAX = 100;\n' +
      '  product list[MAX];\n' +
      '  int count;\n' +
      '  cin >> count;\n' +
      '  read_product(list, count);\n' +
      '  for (int i = 0; i < count; i++) {\n' +
      '    printf("%d %s %.2f\\n", list[i].id, list[i].description.c_str(), list[i].price);\n' +
      '  }\n' +
      '  return 0;\n' +
      '}',
  },
  {
    id: 'we-q4-05', q: 'Q4', variant_name: 'employee-main',
    explanation: 'employee variant; two %s fields.',
    highlights: ['%d %s %s\\n', '.c_str()'],
    code:
      'int main() {\n' +
      '  const int MAX = 100;\n' +
      '  employee list[MAX];\n' +
      '  int count;\n' +
      '  cin >> count;\n' +
      '  read_employee(list, count);\n' +
      '  for (int i = 0; i < count; i++) {\n' +
      '    printf("%d %s %s\\n", list[i].id, list[i].name.c_str(), list[i].department.c_str());\n' +
      '  }\n' +
      '  return 0;\n' +
      '}',
  },
  {
    id: 'we-q4-06', q: 'Q4', variant_name: 'car-main',
    explanation: 'car variant; %s %s %d.',
    highlights: ['car list[MAX];'],
    code:
      'int main() {\n' +
      '  const int MAX = 100;\n' +
      '  car list[MAX];\n' +
      '  int count;\n' +
      '  cin >> count;\n' +
      '  read_car(list, count);\n' +
      '  for (int i = 0; i < count; i++) {\n' +
      '    printf("%s %s %d\\n", list[i].make.c_str(), list[i].model.c_str(), list[i].year);\n' +
      '  }\n' +
      '  return 0;\n' +
      '}',
  },
  {
    id: 'we-q4-07', q: 'Q4', variant_name: 'recipe-main',
    explanation: 'recipe variant.',
    highlights: ['recipe list[MAX];'],
    code:
      'int main() {\n' +
      '  const int MAX = 100;\n' +
      '  recipe list[MAX];\n' +
      '  int count;\n' +
      '  cin >> count;\n' +
      '  read_recipe(list, count);\n' +
      '  for (int i = 0; i < count; i++) {\n' +
      '    printf("%d %s %d\\n", list[i].id, list[i].name.c_str(), list[i].servings);\n' +
      '  }\n' +
      '  return 0;\n' +
      '}',
  },
  {
    id: 'we-q4-08', q: 'Q4', variant_name: 'song-main',
    explanation: 'song variant; duration as %.2f.',
    highlights: ['song list[MAX];'],
    code:
      'int main() {\n' +
      '  const int MAX = 100;\n' +
      '  song list[MAX];\n' +
      '  int count;\n' +
      '  cin >> count;\n' +
      '  read_song(list, count);\n' +
      '  for (int i = 0; i < count; i++) {\n' +
      '    printf("%s %s %.2f\\n", list[i].title.c_str(), list[i].artist.c_str(), list[i].duration);\n' +
      '  }\n' +
      '  return 0;\n' +
      '}',
  },
  {
    id: 'we-q4-09', q: 'Q4', variant_name: 'trap-cout-instead-of-printf',
    explanation: 'WRONG. SIT102 Q4 marks demand printf with format specifiers, not cout.',
    highlights: ['cout <<'],
    code:
      '// WRONG: T2 grader expects printf in Q4.\n' +
      'int main() {\n' +
      '  const int MAX = 100;\n' +
      '  book list[MAX];\n' +
      '  int count;\n' +
      '  cin >> count;\n' +
      '  read_book(list, count);\n' +
      '  for (int i = 0; i < count; i++) {\n' +
      '    cout << list[i].id << " " << list[i].title << "\\n";   // not printf\n' +
      '  }\n' +
      '  return 0;\n' +
      '}',
  },
  {
    id: 'we-q4-10', q: 'Q4', variant_name: 'trap-missing-c_str',
    explanation: 'WRONG. printf %s expects const char*; pass string.c_str() not the string.',
    highlights: ['list[i].title', 'list[i].price'],
    code:
      '// WRONG: %s with string (not .c_str()) prints garbage.\n' +
      'int main() {\n' +
      '  const int MAX = 100;\n' +
      '  book list[MAX];\n' +
      '  int count;\n' +
      '  cin >> count;\n' +
      '  read_book(list, count);\n' +
      '  for (int i = 0; i < count; i++) {\n' +
      '    printf("%d %s %.2f\\n", list[i].id, list[i].title, list[i].price); // missing .c_str()\n' +
      '  }\n' +
      '  return 0;\n' +
      '}',
  },
];

function main() {
  mkdirSync(DIR, { recursive: true });
  writeFileSync(resolve(DIR, 'Q1.yml'), dump('Q1', Q1));
  writeFileSync(resolve(DIR, 'Q2.yml'), dump('Q2', Q2));
  writeFileSync(resolve(DIR, 'Q3.yml'), dump('Q3', Q3));
  writeFileSync(resolve(DIR, 'Q4.yml'), dump('Q4', Q4));
  console.log(`wrote 40 worked examples (10 per Q) to ${DIR}`);
}

main();
