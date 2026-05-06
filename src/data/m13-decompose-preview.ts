// Hardcoded 5 decompose cards for M13 verification (redesigned: specific question + false distractors).
// Each card: targeted question about code + A/B/C/D options (1 correct, 3 false).

import type { DecomposeCard } from '../types/card';

export const M13_DECOMPOSE_PREVIEW: DecomposeCard[] = [
  {
    type: 'decompose',
    atomId: 'S-04',
    code: 'int x = 5;',
    question: 'What does the ; at the end of this line do?',
    options: [
      { label: 'A', text: 'Ends the statement so the compiler knows this instruction is complete' },
      { label: 'B', text: 'Assigns the value 5 to variable x' },
      { label: 'C', text: 'Declares x as an integer type' },
      { label: 'D', text: 'Creates a new memory location named x' },
    ],
    correctLabel: 'A',
    explanation: 'The semicolon terminates each statement in C++. Without it the compiler cannot tell where one instruction ends and the next begins.',
  },
  {
    type: 'decompose',
    atomId: 'R-03',
    code: 'void increment(int &x) {\n  x = x + 1;\n}',
    question: 'What does &x mean in the parameter list?',
    options: [
      { label: 'A', text: 'x is a copy of the argument passed in' },
      { label: 'B', text: 'x is an alias for the caller\'s variable (same memory)' },
      { label: 'C', text: 'x stores the memory address as a pointer' },
      { label: 'D', text: 'x is a constant that cannot be modified' },
    ],
    correctLabel: 'B',
    explanation: '& in a parameter declaration means pass-by-reference: the parameter becomes another name for the caller\'s variable, sharing the same memory box.',
  },
  {
    type: 'decompose',
    atomId: 'O-02',
    code: 'cout << n << endl;',
    question: 'What does the << operator do here?',
    options: [
      { label: 'A', text: 'Reads input from the keyboard into n' },
      { label: 'B', text: 'Compares n with endl' },
      { label: 'C', text: 'Sends (inserts) values into the output stream' },
      { label: 'D', text: 'Shifts the bits of n to the left' },
    ],
    correctLabel: 'C',
    explanation: '<< is the insertion operator: it sends the value on its right into cout for display. Chaining multiple << prints multiple values in sequence.',
  },
  {
    type: 'decompose',
    atomId: 'W-01',
    code: 'for (int i = 0; i < n; i++) {\n  cout << i;\n}',
    question: 'What are the three parts inside the for(...) parentheses?',
    options: [
      { label: 'A', text: 'init; condition; step — sets start, checks when to stop, updates counter' },
      { label: 'B', text: 'condition; body; return — checks, runs body, then returns' },
      { label: 'C', text: 'declare; assign; print — creates variable, sets it, outputs it' },
      { label: 'D', text: 'input; process; output — reads data, transforms, displays' },
    ],
    correctLabel: 'A',
    explanation: 'A for loop has exactly three semicolon-separated parts: initialization (int i = 0), condition (i < n), and step (i++). The body runs while the condition is true.',
  },
  {
    type: 'decompose',
    atomId: 'S-02',
    code: '#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hello";\n  return 0;\n}',
    question: 'What does "using namespace std;" allow you to do?',
    options: [
      { label: 'A', text: 'Include the iostream library so cout exists' },
      { label: 'B', text: 'Write cout and endl without the std:: prefix' },
      { label: 'C', text: 'Define main() as the program entry point' },
      { label: 'D', text: 'End the program with a success code' },
    ],
    correctLabel: 'B',
    explanation: '"using namespace std;" imports the std namespace so you can write cout instead of std::cout, endl instead of std::endl, etc.',
  },
];
