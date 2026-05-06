// gen-see-walkthroughs.js
// Generates all 187 walkthrough cards for SEE mode
// Run: node build/gen-see-walkthroughs.js

const fs = require('fs');
const path = require('path');

const LEVEL_LABELS = {
  '-1': 'L-1 prerequisites',
  '0': 'L0 syntax skeleton',
  '1': 'L1 output',
  '2': 'L2 variables',
  '3': 'L3 input',
  '4': 'L4 arithmetic',
  '5': 'L5 comparisons and logic',
  '6': 'L6 if/else',
  '7': 'L7 loops',
  '8': 'L8 functions',
  '9': 'L9 pass by reference',
  '10': 'L10 arrays',
  '11': 'L11 structs',
  '12': 'L12 struct passing',
  '13': 'L13 hand execution',
  '14': 'L14 write struct (Q2)',
  '15': 'L15 read function (Q3)',
  '16': 'L16 main function (Q4)',
  '17': 'L17 mock exams',
};

function makeCard(atomId, level, fullCode, steps) {
  return {
    type: 'walkthrough',
    atomId,
    levelLabel: LEVEL_LABELS[String(level)],
    fullCode,
    steps,
  };
}

function buildAllCards() {
  const cards = [];

  // ============== L-1 PREREQUISITES ==============

  cards.push(makeCard('P-01', -1,
`#include <iostream>
using namespace std;
int main() {
  cout << "Hello" << endl;
  return 0;
}`,
    [
      { line: 1, code: '#include <iostream>', annotation: 'This program starts by loading the input/output library', atomIds: ['P-01'] },
      { line: 3, code: 'int main() {', annotation: 'The computer begins executing instructions inside main', atomIds: ['P-01'] },
      { line: 4, code: '  cout << "Hello" << endl;', annotation: 'The computer runs this instruction, printing Hello to the screen', atomIds: ['P-01'] },
    ]
  ));

  cards.push(makeCard('P-02', -1,
`#include <iostream>
using namespace std;
int main() {
  cout << "Step 1" << endl;
  cout << "Step 2" << endl;
  return 0;
}`,
    [
      { line: 3, code: 'int main() {', annotation: 'A program is a list of text instructions the computer follows in order', atomIds: ['P-02'] },
      { line: 4, code: '  cout << "Step 1" << endl;', annotation: 'Each line is one instruction; the computer reads them top to bottom', atomIds: ['P-02'] },
      { line: 5, code: '  cout << "Step 2" << endl;', annotation: 'Step 2 runs after Step 1 because instructions execute sequentially', atomIds: ['P-02'] },
    ]
  ));

  cards.push(makeCard('P-03', -1,
`// File: hello.cpp
#include <iostream>
using namespace std;
int main() {
  cout << "Hello" << endl;
  return 0;
}`,
    [
      { line: 1, code: '// File: hello.cpp', annotation: 'C++ source code is saved in a file ending with .cpp', atomIds: ['P-03'] },
      { line: 4, code: 'int main() {', annotation: 'The .cpp file contains all the program instructions as plain text', atomIds: ['P-03'] },
      { line: 5, code: '  cout << "Hello" << endl;', annotation: 'You write code in the .cpp file, then compile and run it', atomIds: ['P-03'] },
    ]
  ));

  cards.push(makeCard('P-04', -1,
`// hello.cpp  -->  g++ compiles  -->  hello.exe
#include <iostream>
using namespace std;
int main() {
  cout << "Hello" << endl;
  return 0;
}`,
    [
      { line: 1, code: '// hello.cpp  -->  g++ compiles  -->  hello.exe', annotation: 'The compiler (g++) converts your .cpp source file into an executable', atomIds: ['P-04'] },
      { line: 4, code: 'int main() {', annotation: 'g++ reads this human readable code and translates it to machine code', atomIds: ['P-04'] },
      { line: 5, code: '  cout << "Hello" << endl;', annotation: 'After compilation, hello.exe contains the machine version of this line', atomIds: ['P-04'] },
    ]
  ));

  cards.push(makeCard('P-05', -1,
`#include <iostream>
using namespace std;
int main() {
  cout << "Hello" << endl;
  return 0;
}`,
    [
      { line: 3, code: 'int main() {', annotation: 'Running the .exe starts execution at main, line by line', atomIds: ['P-05'] },
      { line: 4, code: '  cout << "Hello" << endl;', annotation: 'The CPU executes this instruction first, printing Hello', atomIds: ['P-05'] },
      { line: 5, code: '  return 0;', annotation: 'Then executes this instruction, ending the program with exit code 0', atomIds: ['P-05'] },
    ]
  ));

  cards.push(makeCard('P-06', -1,
`#include <iostream>
using namespace std;
int main() {
  cout << "Hello" << endl;
  cout << "Score: " << 95 << endl;
  return 0;
}`,
    [
      { line: 3, code: 'int main() {', annotation: 'This program prints two lines of output to the terminal', atomIds: ['P-06'] },
      { line: 4, code: '  cout << "Hello" << endl;', annotation: 'cout sends "Hello" to the terminal window where you see it', atomIds: ['P-06'] },
      { line: 5, code: '  cout << "Score: " << 95 << endl;', annotation: 'Output appears in the terminal, the text window below your code', atomIds: ['P-06'] },
    ]
  ));

  cards.push(makeCard('P-07', -1,
`#include <iostream>
using namespace std;
int main() {
  int age;
  cout << "Enter age: ";
  cin >> age;
  cout << "You are " << age << endl;
  return 0;
}`,
    [
      { line: 5, code: '  cout << "Enter age: ";', annotation: 'The program prints a prompt asking the user to type something', atomIds: ['P-07'] },
      { line: 6, code: '  cin >> age;', annotation: 'Program pauses; user types a number in the terminal and presses Enter', atomIds: ['P-07'] },
      { line: 7, code: '  cout << "You are " << age << endl;', annotation: 'The typed value is now stored in age and printed back', atomIds: ['P-07'] },
    ]
  ));

  // ============== L0 SYNTAX SKELETON ==============

  cards.push(makeCard('S-01', 0,
`#include <iostream>
using namespace std;
int main() {
  cout << "works" << endl;
  return 0;
}`,
    [
      { line: 1, code: '#include <iostream>', annotation: 'This line loads the iostream library so cout and cin are available', atomIds: ['S-01'] },
      { line: 3, code: 'int main() {', annotation: 'Without the include, cout on this line would cause a compiler error', atomIds: ['S-01'] },
      { line: 4, code: '  cout << "works" << endl;', annotation: 'cout works here because iostream was included on line 1', atomIds: ['S-01'] },
    ]
  ));

  cards.push(makeCard('S-02', 0,
`#include <iostream>
using namespace std;
int main() {
  cout << "ok" << endl;
  return 0;
}`,
    [
      { line: 2, code: 'using namespace std;', annotation: 'This line lets you write cout instead of the longer std::cout', atomIds: ['S-02'] },
      { line: 4, code: '  cout << "ok" << endl;', annotation: 'Without "using namespace std", you would need std::cout here', atomIds: ['S-02'] },
    ]
  ));

  cards.push(makeCard('S-03', 0,
`#include <iostream>
using namespace std;
int main() {
  cout << "started" << endl;
  return 0;
}`,
    [
      { line: 3, code: 'int main() {', annotation: 'Every C++ program must have main; execution always starts here', atomIds: ['S-03'] },
      { line: 4, code: '  cout << "started" << endl;', annotation: 'Code inside main runs first when you launch the program', atomIds: ['S-03'] },
    ]
  ));

  cards.push(makeCard('S-04', 0,
`#include <iostream>
using namespace std;
int main() {
  int x = 5;
  cout << x;
  return 0;
}`,
    [
      { line: 4, code: '  int x = 5;', annotation: 'Every statement must end with a semicolon or the compiler gives an error', atomIds: ['S-04'] },
      { line: 5, code: '  cout << x;', annotation: 'This statement also needs its semicolon to mark the end', atomIds: ['S-04'] },
    ]
  ));

  cards.push(makeCard('S-05', 0,
`#include <iostream>
using namespace std;
int main() {
  cout << "inside the block";
  return 0;
}`,
    [
      { line: 3, code: 'int main() {', annotation: 'The opening brace { starts a code block, grouping statements together', atomIds: ['S-05'] },
      { line: 4, code: '  cout << "inside the block";', annotation: 'Everything between { and } belongs to this block', atomIds: ['S-05'] },
    ]
  ));

  cards.push(makeCard('S-06', 0,
`#include <iostream>
using namespace std;
int main() {
  cout << "inside";
  return 0;
}`,
    [
      { line: 3, code: 'int main() {', annotation: 'The block opened with { on this line', atomIds: ['S-06'] },
      { line: 6, code: '}', annotation: 'The closing brace } ends the block; every { must have a matching }', atomIds: ['S-06'] },
    ]
  ));

  cards.push(makeCard('S-07', 0,
`#include <iostream>
using namespace std;
int main() {
  cout << "done" << endl;
  return 0;
}`,
    [
      { line: 4, code: '  cout << "done" << endl;', annotation: 'The program does its work, then needs to signal it finished', atomIds: ['S-07'] },
      { line: 5, code: '  return 0;', annotation: 'return 0 tells the operating system the program ended successfully', atomIds: ['S-07'] },
    ]
  ));

  cards.push(makeCard('S-08', 0,
`#include <iostream>
using namespace std;
int main() {
  int x = 5;     // declare counter
  x = x + 1;     // increment
  cout << x;
  return 0;
}`,
    [
      { line: 4, code: '  int x = 5;     // declare counter', annotation: 'Everything after // on a line is a comment, ignored by the compiler', atomIds: ['S-08'] },
      { line: 5, code: '  x = x + 1;     // increment', annotation: 'Comments explain code to humans; the computer only runs x = x + 1', atomIds: ['S-08'] },
    ]
  ));

  cards.push(makeCard('S-09', 0,
`#include <iostream>
using namespace std;
int main() {
  int   x =   5 ;
  int y=10;
  cout << x + y;
  return 0;
}`,
    [
      { line: 4, code: '  int   x =   5 ;', annotation: 'Extra spaces between tokens are fine; the compiler ignores whitespace', atomIds: ['S-09'] },
      { line: 5, code: '  int y=10;', annotation: 'No spaces is also valid; whitespace is optional around tokens', atomIds: ['S-09'] },
    ]
  ));

  cards.push(makeCard('S-10', 0,
`#include <iostream>
using namespace std;
int main() {
    cout << "indent" << endl;
        cout << "more" << endl;
  cout << "less" << endl;
  return 0;
}`,
    [
      { line: 4, code: '    cout << "indent" << endl;', annotation: 'Indentation makes code readable but does not change what it does', atomIds: ['S-10'] },
      { line: 5, code: '        cout << "more" << endl;', annotation: 'Different indentation still compiles; it is style, not syntax', atomIds: ['S-10'] },
    ]
  ));

  // ============== L1 OUTPUT ==============

  cards.push(makeCard('O-01', 1,
`#include <iostream>
using namespace std;
int main() {
  cout << "hello";
  return 0;
}`,
    [
      { line: 3, code: 'int main() {', annotation: 'This program demonstrates printing text to the terminal', atomIds: ['O-01'] },
      { line: 4, code: '  cout << "hello";', annotation: 'cout is the output stream; it sends "hello" to the terminal screen', atomIds: ['O-01'] },
    ]
  ));

  cards.push(makeCard('O-02', 1,
`#include <iostream>
using namespace std;
int main() {
  int x = 5;
  cout << x;
  return 0;
}`,
    [
      { line: 4, code: '  int x = 5;', annotation: 'x holds the value 5 in memory', atomIds: ['O-02'] },
      { line: 5, code: '  cout << x;', annotation: 'The << operator sends the value of x (5) to cout for display', atomIds: ['O-02'] },
    ]
  ));

  cards.push(makeCard('O-03', 1,
`#include <iostream>
using namespace std;
int main() {
  cout << "hello, world";
  return 0;
}`,
    [
      { line: 3, code: 'int main() {', annotation: 'This program prints a text string to the screen', atomIds: ['O-03'] },
      { line: 4, code: '  cout << "hello, world";', annotation: 'Text in double quotes is a string literal; cout prints it exactly as written', atomIds: ['O-03'] },
    ]
  ));

  cards.push(makeCard('O-04', 1,
`#include <iostream>
using namespace std;
int main() {
  cout << 5;
  cout << 42;
  return 0;
}`,
    [
      { line: 4, code: '  cout << 5;', annotation: 'cout can print numbers directly; 5 appears on screen as the digit 5', atomIds: ['O-04'] },
      { line: 5, code: '  cout << 42;', annotation: 'Prints 42 right after 5 with no space, producing "542" on screen', atomIds: ['O-04'] },
    ]
  ));

  cards.push(makeCard('O-05', 1,
`#include <iostream>
using namespace std;
int main() {
  cout << "line one" << endl;
  cout << "line two" << endl;
  return 0;
}`,
    [
      { line: 4, code: '  cout << "line one" << endl;', annotation: 'endl moves the cursor to a new line after printing "line one"', atomIds: ['O-05'] },
      { line: 5, code: '  cout << "line two" << endl;', annotation: '"line two" appears on a separate line because endl came before it', atomIds: ['O-05'] },
    ]
  ));

  cards.push(makeCard('O-06', 1,
`#include <iostream>
using namespace std;
int main() {
  cout << "line one\\n";
  cout << "line two\\n";
  return 0;
}`,
    [
      { line: 4, code: '  cout << "line one\\n";', annotation: 'The escape sequence \\n inside a string also creates a new line', atomIds: ['O-06'] },
      { line: 5, code: '  cout << "line two\\n";', annotation: '\\n works like endl but is typed inside the string quotes', atomIds: ['O-06'] },
    ]
  ));

  cards.push(makeCard('O-07', 1,
`#include <iostream>
using namespace std;
int main() {
  int a = 1, b = 2;
  cout << a << " " << b << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int a = 1, b = 2;', annotation: 'Two variables ready to print on one line', atomIds: ['O-07'] },
      { line: 5, code: '  cout << a << " " << b << endl;', annotation: 'Chain multiple << to print several values in one statement: outputs "1 2"', atomIds: ['O-07'] },
    ]
  ));

  cards.push(makeCard('O-08', 1,
`#include <cstdio>
using namespace std;
int main() {
  int id = 42;
  printf("id = %d\\n", id);
  return 0;
}`,
    [
      { line: 4, code: '  int id = 42;', annotation: 'id holds the integer value 42', atomIds: ['O-08'] },
      { line: 5, code: '  printf("id = %d\\n", id);', annotation: 'printf takes a format string and fills %d with the value of id (42)', atomIds: ['O-08'] },
    ]
  ));

  cards.push(makeCard('O-09', 1,
`#include <cstdio>
int main() {
  int n = 7;
  printf("count = %d\\n", n);
  return 0;
}`,
    [
      { line: 3, code: '  int n = 7;', annotation: 'n is an int variable holding 7', atomIds: ['O-09'] },
      { line: 4, code: '  printf("count = %d\\n", n);', annotation: '%d is the format specifier for int; it gets replaced by n, printing "count = 7"', atomIds: ['O-09'] },
    ]
  ));

  cards.push(makeCard('O-10', 1,
`#include <cstdio>
#include <string>
using namespace std;
int main() {
  string name = "ada";
  printf("name = %s\\n", name.c_str());
  return 0;
}`,
    [
      { line: 5, code: '  string name = "ada";', annotation: 'name is a C++ string holding "ada"', atomIds: ['O-10'] },
      { line: 6, code: '  printf("name = %s\\n", name.c_str());', annotation: '%s formats a C string; .c_str() converts the C++ string for printf', atomIds: ['O-10'] },
    ]
  ));

  cards.push(makeCard('O-11', 1,
`#include <cstdio>
int main() {
  printf("hello\\n");
  printf("world\\n");
  return 0;
}`,
    [
      { line: 3, code: '  printf("hello\\n");', annotation: 'The \\n at the end of the format string moves to a new line after printing', atomIds: ['O-11'] },
      { line: 4, code: '  printf("world\\n");', annotation: '"world" appears on the next line because the previous \\n started a new line', atomIds: ['O-11'] },
    ]
  ));

  cards.push(makeCard('O-12', 1,
`#include <cstdio>
int main() {
  printf("score = %d\\n", 100);
  return 0;
}`,
    [
      { line: 3, code: '  printf("score = %d\\n", 100);', annotation: 'The first argument to printf is the format string that controls the output layout', atomIds: ['O-12'] },
      { line: 3, code: '  printf("score = %d\\n", 100);', annotation: '"score = %d\\n" is the template; %d marks where the number goes', atomIds: ['O-12'] },
    ]
  ));

  cards.push(makeCard('O-13', 1,
`#include <cstdio>
int main() {
  printf("%d + %d = %d\\n", 2, 3, 5);
  return 0;
}`,
    [
      { line: 3, code: '  printf("%d + %d = %d\\n", 2, 3, 5);', annotation: 'Three %d placeholders are filled left to right by the extra arguments 2, 3, 5', atomIds: ['O-13'] },
      { line: 3, code: '  printf("%d + %d = %d\\n", 2, 3, 5);', annotation: 'Result: "2 + 3 = 5"; each %d matches the next argument in order', atomIds: ['O-13'] },
    ]
  ));

  // ============== L2 VARIABLES ==============

  cards.push(makeCard('V-01', 2,
`#include <iostream>
using namespace std;
int main() {
  int n = 5;
  n = n + 1;
  cout << n << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int n = 5;', annotation: 'A variable is a named memory box; n is a box labeled "n" holding 5', atomIds: ['V-01'] },
      { line: 5, code: '  n = n + 1;', annotation: 'You can change the value inside the box; n now holds 6', atomIds: ['V-01'] },
      { line: 6, code: '  cout << n << endl;', annotation: 'Reading n retrieves the current value (6) from its memory box', atomIds: ['V-01'] },
    ]
  ));

  cards.push(makeCard('V-02', 2,
`#include <iostream>
using namespace std;
int main() {
  int counter = 0;
  int total = 100;
  cout << counter << " " << total << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int counter = 0;', annotation: 'Every variable has a name; "counter" describes what this box tracks', atomIds: ['V-02'] },
      { line: 5, code: '  int total = 100;', annotation: '"total" is a different name for a different box; names should be meaningful', atomIds: ['V-02'] },
    ]
  ));

  cards.push(makeCard('V-03', 2,
`#include <iostream>
#include <string>
using namespace std;
int main() {
  int age = 21;
  double price = 9.95;
  string name = "ada";
  return 0;
}`,
    [
      { line: 5, code: '  int age = 21;', annotation: 'Every variable has a type that says what kind of data it can hold', atomIds: ['V-03'] },
      { line: 6, code: '  double price = 9.95;', annotation: 'double holds decimal numbers, int holds whole numbers, string holds text', atomIds: ['V-03'] },
      { line: 7, code: '  string name = "ada";', annotation: 'The type must match the data: text goes in string, not int', atomIds: ['V-03'] },
    ]
  ));

  cards.push(makeCard('V-04', 2,
`#include <iostream>
#include <string>
using namespace std;
int main() {
  int x;
  string title;
  cout << "declared" << endl;
  return 0;
}`,
    [
      { line: 5, code: '  int x;', annotation: 'Declaring a variable creates an empty box; type first, then the name', atomIds: ['V-04'] },
      { line: 6, code: '  string title;', annotation: 'Pattern: type name; creates the box without storing a value yet', atomIds: ['V-04'] },
    ]
  ));

  cards.push(makeCard('V-05', 2,
`#include <iostream>
#include <string>
using namespace std;
int main() {
  int x = 5;
  string name = "ada";
  cout << x << " " << name << endl;
  return 0;
}`,
    [
      { line: 5, code: '  int x = 5;', annotation: 'Initialization: type name = value; creates the box AND stores a value at once', atomIds: ['V-05'] },
      { line: 6, code: '  string name = "ada";', annotation: '"ada" is immediately placed in the name box when it is created', atomIds: ['V-05'] },
    ]
  ));

  cards.push(makeCard('V-06', 2,
`#include <iostream>
using namespace std;
int main() {
  int x = 5;
  cout << x << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int x = 5;', annotation: 'x holds the value 5 in its memory box', atomIds: ['V-06'] },
      { line: 5, code: '  cout << x << endl;', annotation: 'Using x in an expression reads the value (5) from the box without changing it', atomIds: ['V-06'] },
    ]
  ));

  cards.push(makeCard('V-07', 2,
`#include <iostream>
using namespace std;
int main() {
  int x = 5;
  x = 10;
  cout << x << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int x = 5;', annotation: 'x starts with value 5', atomIds: ['V-07'] },
      { line: 5, code: '  x = 10;', annotation: 'Assignment overwrites the old value; x now holds 10 (5 is gone)', atomIds: ['V-07'] },
    ]
  ));

  cards.push(makeCard('V-08', 2,
`#include <iostream>
using namespace std;
int main() {
  int x = 5;
  if (x == 5) {
    cout << "equal" << endl;
  }
  return 0;
}`,
    [
      { line: 4, code: '  int x = 5;', annotation: 'Single = is assignment: it stores 5 into x', atomIds: ['V-08'] },
      { line: 5, code: '  if (x == 5) {', annotation: 'Double == is comparison: it checks if x equals 5 (returns true/false)', atomIds: ['V-08'] },
    ]
  ));

  cards.push(makeCard('V-09', 2,
`#include <iostream>
using namespace std;
int main() {
  int x = 5;
  cout << x << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int x = 5;', annotation: 'A variable must be declared before any line that uses it', atomIds: ['V-09'] },
      { line: 5, code: '  cout << x << endl;', annotation: 'This line can use x because x was declared on the line above', atomIds: ['V-09'] },
    ]
  ));

  cards.push(makeCard('V-10', 2,
`#include <iostream>
using namespace std;
int main() {
  int count = 7;
  int n = -42;
  cout << count << " " << n << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int count = 7;', annotation: 'int stores whole numbers (no decimals): 7, 0, 42, or negative like below', atomIds: ['V-10'] },
      { line: 5, code: '  int n = -42;', annotation: 'int can hold negative whole numbers too, but never 3.14 or "hello"', atomIds: ['V-10'] },
    ]
  ));

  cards.push(makeCard('V-11', 2,
`#include <iostream>
using namespace std;
int main() {
  double price = 3.14;
  double tiny = 0.001;
  cout << price << " " << tiny << endl;
  return 0;
}`,
    [
      { line: 4, code: '  double price = 3.14;', annotation: 'double stores decimal (floating point) numbers like 3.14', atomIds: ['V-11'] },
      { line: 5, code: '  double tiny = 0.001;', annotation: 'Use double whenever you need fractional precision, not int', atomIds: ['V-11'] },
    ]
  ));

  cards.push(makeCard('V-12', 2,
`#include <iostream>
#include <string>
using namespace std;
int main() {
  string title = "C++";
  string author = "ada";
  cout << title << " by " << author << endl;
  return 0;
}`,
    [
      { line: 5, code: '  string title = "C++";', annotation: 'string holds a sequence of characters, meaning text data', atomIds: ['V-12'] },
      { line: 6, code: '  string author = "ada";', annotation: 'Any text in double quotes can be stored in a string variable', atomIds: ['V-12'] },
    ]
  ));

  cards.push(makeCard('V-13', 2,
`#include <iostream>
using namespace std;
int main() {
  bool ok = true;
  bool done = false;
  cout << ok << " " << done << endl;
  return 0;
}`,
    [
      { line: 4, code: '  bool ok = true;', annotation: 'bool can only hold two values: true or false (yes or no)', atomIds: ['V-13'] },
      { line: 5, code: '  bool done = false;', annotation: 'Booleans are used for conditions and flags; prints as 1 (true) or 0 (false)', atomIds: ['V-13'] },
    ]
  ));

  cards.push(makeCard('V-14', 2,
`#include <iostream>
using namespace std;
int main() {
  char letter = 'A';
  char digit = '7';
  cout << letter << digit << endl;
  return 0;
}`,
    [
      { line: 4, code: "  char letter = 'A';", annotation: "char holds exactly one character, using single quotes around it", atomIds: ['V-14'] },
      { line: 5, code: "  char digit = '7';", annotation: "'7' is the character seven, not the number 7; char holds one letter or symbol", atomIds: ['V-14'] },
    ]
  ));

  cards.push(makeCard('V-15', 2,
`#include <iostream>
using namespace std;
int main() {
  int n = 5;
  int big = 1000000;
  cout << n + big << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int n = 5;', annotation: '5 is an int literal: a whole number written directly in the code', atomIds: ['V-15'] },
      { line: 5, code: '  int big = 1000000;', annotation: 'Int literals have no quotes and no decimal point; just digits', atomIds: ['V-15'] },
    ]
  ));

  cards.push(makeCard('V-16', 2,
`#include <iostream>
using namespace std;
int main() {
  double pi = 3.14;
  double half = 0.5;
  cout << pi << " " << half << endl;
  return 0;
}`,
    [
      { line: 4, code: '  double pi = 3.14;', annotation: '3.14 is a double literal: a number with a decimal point in the code', atomIds: ['V-16'] },
      { line: 5, code: '  double half = 0.5;', annotation: 'The decimal point tells the compiler this is a double, not an int', atomIds: ['V-16'] },
    ]
  ));

  cards.push(makeCard('V-17', 2,
`#include <iostream>
using namespace std;
int main() {
  string greeting = "hello";
  cout << "literal text" << endl;
  return 0;
}`,
    [
      { line: 4, code: '  string greeting = "hello";', annotation: '"hello" is a string literal: text enclosed in double quotes', atomIds: ['V-17'] },
      { line: 5, code: '  cout << "literal text" << endl;', annotation: 'String literals can appear directly in cout without storing in a variable', atomIds: ['V-17'] },
    ]
  ));

  cards.push(makeCard('V-18', 2,
`#include <iostream>
using namespace std;
int main() {
  char letter = 'A';
  char comma = ',';
  cout << letter << comma << endl;
  return 0;
}`,
    [
      { line: 4, code: "  char letter = 'A';", annotation: "'A' is a char literal: a single character in single quotes", atomIds: ['V-18'] },
      { line: 5, code: "  char comma = ',';", annotation: "Single quotes for char ('A'), double quotes for string (\"A\"): different types", atomIds: ['V-18'] },
    ]
  ));

  cards.push(makeCard('V-19', 2,
`#include <iostream>
using namespace std;
int main() {
  bool ok = true;
  bool failed = false;
  cout << ok << " " << failed << endl;
  return 0;
}`,
    [
      { line: 4, code: '  bool ok = true;', annotation: 'true is a bool literal; it is a keyword, not a string (no quotes)', atomIds: ['V-19'] },
      { line: 5, code: '  bool failed = false;', annotation: 'false is the other bool literal; true and false are the only two bool values', atomIds: ['V-19'] },
    ]
  ));

  cards.push(makeCard('V-20', 2,
`#include <iostream>
#include <string>
using namespace std;
int main() {
  string title = "C++";
  cout << title << endl;
  return 0;
}`,
    [
      { line: 2, code: '#include <string>', annotation: 'The string type requires #include <string> at the top of the file', atomIds: ['V-20'] },
      { line: 5, code: '  string title = "C++";', annotation: 'Without the include, using string here would cause a compiler error', atomIds: ['V-20'] },
    ]
  ));

  // ============== L3 INPUT ==============

  cards.push(makeCard('I-01', 3,
`#include <iostream>
using namespace std;
int main() {
  int n;
  cin >> n;
  cout << "Got: " << n << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int n;', annotation: 'Declare a box to receive the user input', atomIds: ['I-01'] },
      { line: 5, code: '  cin >> n;', annotation: 'cin reads from the terminal; the program pauses until the user types a value', atomIds: ['I-01'] },
      { line: 6, code: '  cout << "Got: " << n << endl;', annotation: 'After the user types and presses Enter, n holds their input', atomIds: ['I-01'] },
    ]
  ));

  cards.push(makeCard('I-02', 3,
`#include <iostream>
using namespace std;
int main() {
  int x;
  cin >> x;
  cout << x << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int x;', annotation: 'x is an empty box waiting for input', atomIds: ['I-02'] },
      { line: 5, code: '  cin >> x;', annotation: 'The >> operator extracts the next value from input and stores it in x', atomIds: ['I-02'] },
    ]
  ));

  cards.push(makeCard('I-03', 3,
`#include <iostream>
using namespace std;
int main() {
  int x;
  cout << "Type a number: ";
  cin >> x;
  cout << "You typed " << x << endl;
  return 0;
}`,
    [
      { line: 5, code: '  cout << "Type a number: ";', annotation: 'A prompt tells the user what to type', atomIds: ['I-03'] },
      { line: 6, code: '  cin >> x;', annotation: 'Execution stops here and waits until the user types something and presses Enter', atomIds: ['I-03'] },
    ]
  ));

  cards.push(makeCard('I-04', 3,
`#include <iostream>
using namespace std;
int main() {
  int a, b;
  cin >> a >> b;
  cout << a << " " << b << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int a, b;', annotation: 'Two boxes declared to receive two separate input values', atomIds: ['I-04'] },
      { line: 5, code: '  cin >> a >> b;', annotation: 'User types "3 7"; whitespace (space or enter) separates the two values', atomIds: ['I-04'] },
    ]
  ));

  cards.push(makeCard('I-05', 3,
`#include <iostream>
#include <string>
using namespace std;
int main() {
  int n;
  string s;
  cin >> n;
  cin >> s;
  cout << n << " " << s << endl;
  return 0;
}`,
    [
      { line: 7, code: '  cin >> n;', annotation: 'cin parses the input to match the variable type; digits become an int', atomIds: ['I-05'] },
      { line: 8, code: '  cin >> s;', annotation: 'For a string variable, cin reads one word (stops at whitespace)', atomIds: ['I-05'] },
    ]
  ));

  cards.push(makeCard('I-06', 3,
`#include <iostream>
using namespace std;
int main() {
  int a, b, c;
  cin >> a >> b >> c;
  cout << a + b + c << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int a, b, c;', annotation: 'Three boxes ready for three input values', atomIds: ['I-06'] },
      { line: 5, code: '  cin >> a >> b >> c;', annotation: 'Chain >> to read multiple values in one statement; each >> grabs the next token', atomIds: ['I-06'] },
    ]
  ));

  cards.push(makeCard('I-07', 3,
`#include <iostream>
#include <string>
using namespace std;
int main() {
  string fullName;
  getline(cin, fullName);
  cout << "Hello " << fullName << endl;
  return 0;
}`,
    [
      { line: 5, code: '  string fullName;', annotation: 'A string box to hold a full line of text including spaces', atomIds: ['I-07'] },
      { line: 6, code: '  getline(cin, fullName);', annotation: 'getline reads the entire line including spaces, unlike cin >> which stops at a space', atomIds: ['I-07'] },
    ]
  ));

  // ============== L4 ARITHMETIC ==============

  cards.push(makeCard('A-01', 4,
`#include <iostream>
using namespace std;
int main() {
  int sum = 3 + 4;
  cout << sum << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int sum = 3 + 4;', annotation: 'The + operator adds two values; 3 + 4 produces 7, stored in sum', atomIds: ['A-01'] },
      { line: 5, code: '  cout << sum << endl;', annotation: 'Prints 7, the result of the addition', atomIds: ['A-01'] },
    ]
  ));

  cards.push(makeCard('A-02', 4,
`#include <iostream>
using namespace std;
int main() {
  int diff = 10 - 3;
  cout << diff << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int diff = 10 - 3;', annotation: 'The minus operator subtracts: 10 minus 3 gives 7', atomIds: ['A-02'] },
      { line: 5, code: '  cout << diff << endl;', annotation: 'Prints 7, the result of the subtraction', atomIds: ['A-02'] },
    ]
  ));

  cards.push(makeCard('A-03', 4,
`#include <iostream>
using namespace std;
int main() {
  int width = 5, height = 3;
  int area = width * height;
  cout << area << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int width = 5, height = 3;', annotation: 'Two values to multiply together', atomIds: ['A-03'] },
      { line: 5, code: '  int area = width * height;', annotation: 'The * operator multiplies: 5 * 3 produces 15', atomIds: ['A-03'] },
    ]
  ));

  cards.push(makeCard('A-04', 4,
`#include <iostream>
using namespace std;
int main() {
  int n = 10;
  int half = n / 2;
  cout << half << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int n = 10;', annotation: 'n holds 10, the dividend', atomIds: ['A-04'] },
      { line: 5, code: '  int half = n / 2;', annotation: 'The / operator divides: 10 / 2 produces 5', atomIds: ['A-04'] },
    ]
  ));

  cards.push(makeCard('A-05', 4,
`#include <iostream>
using namespace std;
int main() {
  int rem = 7 % 3;
  cout << rem << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int rem = 7 % 3;', annotation: 'The % (modulo) operator gives the remainder: 7 divided by 3 leaves remainder 1', atomIds: ['A-05'] },
      { line: 5, code: '  cout << rem << endl;', annotation: 'Prints 1, the remainder when dividing 7 by 3', atomIds: ['A-05'] },
    ]
  ));

  cards.push(makeCard('A-06', 4,
`#include <iostream>
using namespace std;
int main() {
  int q = 5 / 2;
  cout << q << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int q = 5 / 2;', annotation: 'When both sides are int, division truncates: 5/2 gives 2, not 2.5', atomIds: ['A-06'] },
      { line: 5, code: '  cout << q << endl;', annotation: 'Prints 2 because int division drops the decimal part entirely', atomIds: ['A-06'] },
    ]
  ));

  cards.push(makeCard('A-07', 4,
`#include <iostream>
using namespace std;
int main() {
  int r = 1 + 2 * 3;
  cout << r << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int r = 1 + 2 * 3;', annotation: '* runs before + (like in math): 2*3=6 first, then 1+6=7', atomIds: ['A-07'] },
      { line: 5, code: '  cout << r << endl;', annotation: 'Prints 7, not 9, because multiplication has higher precedence than addition', atomIds: ['A-07'] },
    ]
  ));

  cards.push(makeCard('A-08', 4,
`#include <iostream>
using namespace std;
int main() {
  int r = (1 + 2) * 3;
  cout << r << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int r = (1 + 2) * 3;', annotation: 'Parentheses force 1+2 to happen first (=3), then 3*3=9', atomIds: ['A-08'] },
      { line: 5, code: '  cout << r << endl;', annotation: 'Prints 9 because parentheses overrode the default operator order', atomIds: ['A-08'] },
    ]
  ));

  cards.push(makeCard('A-09', 4,
`#include <iostream>
using namespace std;
int main() {
  int total = 0;
  total += 5;
  total -= 2;
  cout << total << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int total = 0;', annotation: 'total starts at 0', atomIds: ['A-09'] },
      { line: 5, code: '  total += 5;', annotation: '+= is shorthand for total = total + 5; total becomes 5', atomIds: ['A-09'] },
      { line: 6, code: '  total -= 2;', annotation: '-= is shorthand for total = total - 2; total becomes 3', atomIds: ['A-09'] },
    ]
  ));

  cards.push(makeCard('A-10', 4,
`#include <iostream>
using namespace std;
int main() {
  int i = 0;
  i++;
  cout << i << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int i = 0;', annotation: 'i starts at 0', atomIds: ['A-10'] },
      { line: 5, code: '  i++;', annotation: '++ adds 1 to i; shorthand for i = i + 1, so i becomes 1', atomIds: ['A-10'] },
    ]
  ));

  cards.push(makeCard('A-11', 4,
`#include <iostream>
using namespace std;
int main() {
  int n = 10;
  n--;
  cout << n << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int n = 10;', annotation: 'n starts at 10', atomIds: ['A-11'] },
      { line: 5, code: '  n--;', annotation: 'Subtracts 1 from n; shorthand for n = n - 1, so n becomes 9', atomIds: ['A-11'] },
    ]
  ));

  // ============== L5 COMPARISONS AND LOGIC ==============

  cards.push(makeCard('C-01', 5,
`#include <iostream>
using namespace std;
int main() {
  int x = 5;
  if (x == 5) {
    cout << "matches" << endl;
  }
  return 0;
}`,
    [
      { line: 4, code: '  int x = 5;', annotation: 'x holds 5, and we want to check if it equals something', atomIds: ['C-01'] },
      { line: 5, code: '  if (x == 5) {', annotation: '== tests equality: returns true if both sides are the same value', atomIds: ['C-01'] },
    ]
  ));

  cards.push(makeCard('C-02', 5,
`#include <iostream>
using namespace std;
int main() {
  int x = 3;
  if (x != 0) {
    cout << "nonzero" << endl;
  }
  return 0;
}`,
    [
      { line: 4, code: '  int x = 3;', annotation: 'x holds 3, which is not zero', atomIds: ['C-02'] },
      { line: 5, code: '  if (x != 0) {', annotation: '!= tests "not equal": true when the two sides differ (3 is not 0)', atomIds: ['C-02'] },
    ]
  ));

  cards.push(makeCard('C-03', 5,
`#include <iostream>
using namespace std;
int main() {
  int n = 3;
  for (int i = 0; i < n; i++) {
    cout << i << " ";
  }
  return 0;
}`,
    [
      { line: 5, code: '  for (int i = 0; i < n; i++) {', annotation: '< tests "less than": the loop runs while i is less than n', atomIds: ['C-03'] },
      { line: 6, code: '    cout << i << " ";', annotation: 'Prints 0 1 2; loop stops when i reaches 3 because 3 < 3 is false', atomIds: ['C-03'] },
    ]
  ));

  cards.push(makeCard('C-04', 5,
`#include <iostream>
using namespace std;
int main() {
  int a = 10, b = 3;
  if (a > b) {
    cout << "a is bigger" << endl;
  }
  return 0;
}`,
    [
      { line: 4, code: '  int a = 10, b = 3;', annotation: 'Two values to compare', atomIds: ['C-04'] },
      { line: 5, code: '  if (a > b) {', annotation: '> tests "greater than": true because 10 is larger than 3', atomIds: ['C-04'] },
    ]
  ));

  cards.push(makeCard('C-05', 5,
`#include <iostream>
using namespace std;
int main() {
  int i = 5, count = 5;
  if (i <= count) {
    cout << "in range" << endl;
  }
  return 0;
}`,
    [
      { line: 4, code: '  int i = 5, count = 5;', annotation: 'i equals count; we want to include that case', atomIds: ['C-05'] },
      { line: 5, code: '  if (i <= count) {', annotation: '<= tests "less than or equal": true when i is smaller OR the same as count', atomIds: ['C-05'] },
    ]
  ));

  cards.push(makeCard('C-06', 5,
`#include <iostream>
using namespace std;
int main() {
  int score = 75;
  if (score >= 50) {
    cout << "pass" << endl;
  }
  return 0;
}`,
    [
      { line: 4, code: '  int score = 75;', annotation: 'score is 75, and the passing threshold is 50', atomIds: ['C-06'] },
      { line: 5, code: '  if (score >= 50) {', annotation: '>= tests "greater than or equal": true because 75 is at least 50', atomIds: ['C-06'] },
    ]
  ));

  cards.push(makeCard('C-07', 5,
`#include <iostream>
using namespace std;
int main() {
  int x = 5;
  bool match = (x == 5);
  if (match) cout << "yes" << endl;
  return 0;
}`,
    [
      { line: 5, code: '  bool match = (x == 5);', annotation: 'A comparison like x == 5 produces a bool result: true or false', atomIds: ['C-07'] },
      { line: 6, code: '  if (match) cout << "yes" << endl;', annotation: 'The bool value can be stored in a variable and used later in conditions', atomIds: ['C-07'] },
    ]
  ));

  cards.push(makeCard('L-01', 5,
`#include <iostream>
using namespace std;
int main() {
  int a = 3, b = 7;
  if (a > 0 && b > 0) {
    cout << "both positive" << endl;
  }
  return 0;
}`,
    [
      { line: 4, code: '  int a = 3, b = 7;', annotation: 'Two values that are both positive', atomIds: ['L-01'] },
      { line: 5, code: '  if (a > 0 && b > 0) {', annotation: '&& means AND: the whole condition is true only if BOTH sides are true', atomIds: ['L-01'] },
    ]
  ));

  cards.push(makeCard('L-02', 5,
`#include <iostream>
using namespace std;
int main() {
  int x = 0, y = 5;
  if (x == 0 || y == 0) {
    cout << "at least one zero" << endl;
  }
  return 0;
}`,
    [
      { line: 4, code: '  int x = 0, y = 5;', annotation: 'x is zero, y is not', atomIds: ['L-02'] },
      { line: 5, code: '  if (x == 0 || y == 0) {', annotation: '|| means OR: true if EITHER side (or both) is true', atomIds: ['L-02'] },
    ]
  ));

  cards.push(makeCard('L-03', 5,
`#include <iostream>
using namespace std;
int main() {
  bool found = false;
  if (!found) {
    cout << "missing" << endl;
  }
  return 0;
}`,
    [
      { line: 4, code: '  bool found = false;', annotation: 'found is false, meaning the item was not located', atomIds: ['L-03'] },
      { line: 5, code: '  if (!found) {', annotation: '! flips the bool: !false becomes true, so the body runs', atomIds: ['L-03'] },
    ]
  ));

  // ============== L6 IF/ELSE ==============

  cards.push(makeCard('F-01', 6,
`#include <iostream>
using namespace std;
int main() {
  int x = 3;
  if (x > 0) {
    cout << "positive" << endl;
  }
  return 0;
}`,
    [
      { line: 5, code: '  if (x > 0) {', annotation: 'if checks the condition in parentheses; if true, the body runs', atomIds: ['F-01'] },
      { line: 6, code: '    cout << "positive" << endl;', annotation: 'This line only executes when x > 0 is true (3 > 0 is true)', atomIds: ['F-01'] },
    ]
  ));

  cards.push(makeCard('F-02', 6,
`#include <iostream>
using namespace std;
int main() {
  int x = -1;
  if (x > 0) {
    cout << "positive" << endl;
  } else {
    cout << "zero or negative" << endl;
  }
  return 0;
}`,
    [
      { line: 5, code: '  if (x > 0) {', annotation: 'x is negative, so this condition is false; the if body is skipped', atomIds: ['F-02'] },
      { line: 7, code: '  } else {', annotation: 'else runs when the if condition is false, providing an alternative path', atomIds: ['F-02'] },
      { line: 8, code: '    cout << "zero or negative" << endl;', annotation: 'This prints because x is negative and the else branch was taken', atomIds: ['F-02'] },
    ]
  ));

  cards.push(makeCard('F-03', 6,
`#include <iostream>
using namespace std;
int main() {
  int x = 0;
  if (x > 0)      cout << "pos" << endl;
  else if (x < 0) cout << "neg" << endl;
  else             cout << "zero" << endl;
  return 0;
}`,
    [
      { line: 5, code: '  if (x > 0)      cout << "pos" << endl;', annotation: 'First check: is x positive? No (x is 0), so move to next check', atomIds: ['F-03'] },
      { line: 6, code: '  else if (x < 0) cout << "neg" << endl;', annotation: 'else if chains another condition: is x negative? No, continue', atomIds: ['F-03'] },
      { line: 7, code: '  else             cout << "zero" << endl;', annotation: 'Final else catches everything remaining; x must be zero', atomIds: ['F-03'] },
    ]
  ));

  cards.push(makeCard('F-04', 6,
`#include <iostream>
using namespace std;
int main() {
  int x = 3;
  bool ok = (x > 0);
  if (ok) {
    cout << "positive" << endl;
  }
  return 0;
}`,
    [
      { line: 5, code: '  bool ok = (x > 0);', annotation: 'The comparison produces a bool (true/false) value stored in ok', atomIds: ['F-04'] },
      { line: 6, code: '  if (ok) {', annotation: 'if needs a bool condition; ok is true, so the body runs', atomIds: ['F-04'] },
    ]
  ));

  cards.push(makeCard('F-05', 6,
`#include <iostream>
using namespace std;
int main() {
  int x = 3;
  if (x > 0) {
    cout << "pos" << endl;
  }
  return 0;
}`,
    [
      { line: 5, code: '  if (x > 0) {', annotation: 'Always use braces {} around the if body, even for a single line', atomIds: ['F-05'] },
      { line: 6, code: '    cout << "pos" << endl;', annotation: 'Braces prevent bugs when you later add more lines to this block', atomIds: ['F-05'] },
    ]
  ));

  // ============== L7 LOOPS ==============

  cards.push(makeCard('W-01', 7,
`#include <iostream>
using namespace std;
int main() {
  int i = 0;
  while (i < 5) {
    cout << i << " ";
    i++;
  }
  return 0;
}`,
    [
      { line: 5, code: '  while (i < 5) {', annotation: 'while checks the condition before each iteration; repeats body while true', atomIds: ['W-01'] },
      { line: 6, code: '    cout << i << " ";', annotation: 'Body runs 5 times with i = 0, 1, 2, 3, 4; prints "0 1 2 3 4"', atomIds: ['W-01'] },
      { line: 7, code: '    i++;', annotation: 'i increases each iteration; when i reaches 5, the condition becomes false', atomIds: ['W-01'] },
    ]
  ));

  cards.push(makeCard('W-02', 7,
`#include <iostream>
using namespace std;
int main() {
  int n;
  do {
    cout << "Enter positive: ";
    cin >> n;
  } while (n < 0);
  cout << "Got " << n << endl;
  return 0;
}`,
    [
      { line: 5, code: '  do {', annotation: 'do runs the body at least once before checking the condition', atomIds: ['W-02'] },
      { line: 7, code: '    cin >> n;', annotation: 'User enters a number; the body always executes at least once', atomIds: ['W-02'] },
      { line: 8, code: '  } while (n < 0);', annotation: 'Condition checked after body; if n is still negative, the loop repeats', atomIds: ['W-02'] },
    ]
  ));

  cards.push(makeCard('W-03', 7,
`#include <iostream>
using namespace std;
int main() {
  for (int i = 0; i < 5; i++) {
    cout << i << " ";
  }
  return 0;
}`,
    [
      { line: 4, code: '  for (int i = 0; i < 5; i++) {', annotation: 'for combines init, condition, and step in one line: compact loop syntax', atomIds: ['W-03'] },
      { line: 5, code: '    cout << i << " ";', annotation: 'Runs 5 times printing 0 1 2 3 4; for loop is the most common loop form', atomIds: ['W-03'] },
    ]
  ));

  cards.push(makeCard('W-04', 7,
`#include <iostream>
using namespace std;
int main() {
  for (int i = 0; i < 5; i++) {
    cout << i << " ";
  }
  return 0;
}`,
    [
      { line: 4, code: '  for (int i = 0; i < 5; i++) {', annotation: 'The init part (int i = 0) runs exactly once, before the first iteration', atomIds: ['W-04'] },
      { line: 5, code: '    cout << i << " ";', annotation: 'i starts at 0 because init set it; init never runs again', atomIds: ['W-04'] },
    ]
  ));

  cards.push(makeCard('W-05', 7,
`#include <iostream>
using namespace std;
int main() {
  for (int i = 0; i < 5; i++) {
    cout << i << " ";
  }
  return 0;
}`,
    [
      { line: 4, code: '  for (int i = 0; i < 5; i++) {', annotation: 'The condition (i < 5) is tested before each iteration, including the first', atomIds: ['W-05'] },
      { line: 5, code: '    cout << i << " ";', annotation: 'Body only runs if condition is true; when i becomes 5, loop stops', atomIds: ['W-05'] },
    ]
  ));

  cards.push(makeCard('W-06', 7,
`#include <iostream>
using namespace std;
int main() {
  for (int i = 0; i < 5; i++) {
    cout << i << " ";
  }
  return 0;
}`,
    [
      { line: 5, code: '    cout << i << " ";', annotation: 'The body runs first, then the step (i++) runs after', atomIds: ['W-06'] },
      { line: 4, code: '  for (int i = 0; i < 5; i++) {', annotation: 'The step (i++) runs after each body execution, before the next condition check', atomIds: ['W-06'] },
    ]
  ));

  cards.push(makeCard('W-07', 7,
`#include <iostream>
using namespace std;
int main() {
  for (int i = 0; i < 100; i++) {
    if (i == 7) break;
    cout << i << " ";
  }
  return 0;
}`,
    [
      { line: 4, code: '  for (int i = 0; i < 100; i++) {', annotation: 'This loop would run 100 times, but break can exit it early', atomIds: ['W-07'] },
      { line: 5, code: '    if (i == 7) break;', annotation: 'break immediately exits the loop; only prints 0 1 2 3 4 5 6', atomIds: ['W-07'] },
    ]
  ));

  cards.push(makeCard('W-08', 7,
`#include <iostream>
using namespace std;
int main() {
  for (int i = 0; i < 5; i++) {
    if (i == 2) continue;
    cout << i << " ";
  }
  return 0;
}`,
    [
      { line: 5, code: '    if (i == 2) continue;', annotation: 'continue skips the rest of this iteration and jumps to the next one', atomIds: ['W-08'] },
      { line: 6, code: '    cout << i << " ";', annotation: 'Prints 0 1 3 4; the value 2 is skipped because continue bypassed this line', atomIds: ['W-08'] },
    ]
  ));

  cards.push(makeCard('W-09', 7,
`#include <iostream>
using namespace std;
int main() {
  for (int r = 0; r < 3; r++) {
    for (int c = 0; c < 4; c++) {
      cout << "(" << r << "," << c << ") ";
    }
    cout << endl;
  }
  return 0;
}`,
    [
      { line: 4, code: '  for (int r = 0; r < 3; r++) {', annotation: 'Outer loop runs 3 times (once per row)', atomIds: ['W-09'] },
      { line: 5, code: '    for (int c = 0; c < 4; c++) {', annotation: 'Inner loop runs 4 times per outer iteration; total body runs 3x4=12 times', atomIds: ['W-09'] },
    ]
  ));

  cards.push(makeCard('W-10', 7,
`#include <iostream>
using namespace std;
int main() {
  int count = 0;
  while (true) {
    count++;
    if (count > 3) break;
    cout << count << " ";
  }
  return 0;
}`,
    [
      { line: 5, code: '  while (true) {', annotation: 'while(true) creates an infinite loop; the condition is always true', atomIds: ['W-10'] },
      { line: 7, code: '    if (count > 3) break;', annotation: 'Without break or a changing condition, the loop would run forever', atomIds: ['W-10'] },
    ]
  ));

  // ============== L8 FUNCTIONS ==============

  cards.push(makeCard('H-01', 8,
`#include <iostream>
using namespace std;
void greet() {
  cout << "hello" << endl;
}
int main() {
  greet();
  return 0;
}`,
    [
      { line: 3, code: 'void greet() {', annotation: 'A function is a named block of code you can call by name', atomIds: ['H-01'] },
      { line: 4, code: '  cout << "hello" << endl;', annotation: 'This code runs whenever greet() is called', atomIds: ['H-01'] },
      { line: 7, code: '  greet();', annotation: 'Calling greet() jumps to the function, runs its body, then returns here', atomIds: ['H-01'] },
    ]
  ));

  cards.push(makeCard('H-02', 8,
`#include <iostream>
using namespace std;
int add(int a, int b) {
  return a + b;
}
int main() {
  cout << add(3, 4) << endl;
  return 0;
}`,
    [
      { line: 3, code: 'int add(int a, int b) {', annotation: 'Pattern: returnType name(params) { body } defines a function', atomIds: ['H-02'] },
      { line: 4, code: '  return a + b;', annotation: 'The function takes two ints and returns their sum as an int', atomIds: ['H-02'] },
    ]
  ));

  cards.push(makeCard('H-03', 8,
`#include <iostream>
using namespace std;
int add(int a, int b) {
  return a + b;
}
int main() {
  int sum = add(3, 4);
  cout << sum << endl;
  return 0;
}`,
    [
      { line: 7, code: '  int sum = add(3, 4);', annotation: 'Calling add(3, 4) passes 3 and 4 as arguments; the result (7) is stored in sum', atomIds: ['H-03'] },
      { line: 8, code: '  cout << sum << endl;', annotation: 'Prints 7, the value returned by the function call', atomIds: ['H-03'] },
    ]
  ));

  cards.push(makeCard('H-04', 8,
`#include <iostream>
using namespace std;
void f(int x) {
  x = 99;
}
int main() {
  int n = 5;
  f(n);
  cout << n << endl;
  return 0;
}`,
    [
      { line: 3, code: 'void f(int x) {', annotation: 'Parameter x is a local copy of whatever value was passed in', atomIds: ['H-04'] },
      { line: 4, code: '  x = 99;', annotation: 'Changing x only changes the local copy; the caller variable n stays 5', atomIds: ['H-04'] },
    ]
  ));

  cards.push(makeCard('H-05', 8,
`#include <iostream>
using namespace std;
int square(int n) {
  return n * n;
}
int main() {
  cout << square(5) << endl;
  return 0;
}`,
    [
      { line: 3, code: 'int square(int n) {', annotation: 'The return type (int) says this function sends back an integer', atomIds: ['H-05'] },
      { line: 4, code: '  return n * n;', annotation: 'return sends the computed value (25) back to the caller', atomIds: ['H-05'] },
    ]
  ));

  cards.push(makeCard('H-06', 8,
`#include <iostream>
using namespace std;
void greet() {
  cout << "hi" << endl;
}
int main() {
  greet();
  return 0;
}`,
    [
      { line: 3, code: 'void greet() {', annotation: 'void means this function does not return a value; it just does work', atomIds: ['H-06'] },
      { line: 4, code: '  cout << "hi" << endl;', annotation: 'The function prints output but sends nothing back to the caller', atomIds: ['H-06'] },
    ]
  ));

  cards.push(makeCard('H-07', 8,
`#include <iostream>
using namespace std;
int square(int n);
int main() {
  cout << square(5) << endl;
  return 0;
}
int square(int n) {
  return n * n;
}`,
    [
      { line: 3, code: 'int square(int n);', annotation: 'A prototype declares the function before main so the compiler knows it exists', atomIds: ['H-07'] },
      { line: 5, code: '  cout << square(5) << endl;', annotation: 'square is called here; the compiler trusts the prototype', atomIds: ['H-07'] },
      { line: 8, code: 'int square(int n) {', annotation: 'The full definition appears after main; matches the prototype', atomIds: ['H-07'] },
    ]
  ));

  cards.push(makeCard('H-08', 8,
`#include <iostream>
#include <string>
using namespace std;
int square(int);
void greet(string);
int main() {
  greet("ada");
  cout << square(5) << endl;
  return 0;
}
int square(int n) { return n * n; }
void greet(string s) { cout << "Hi " << s << endl; }`,
    [
      { line: 4, code: 'int square(int);', annotation: 'A prototype only needs the return type, name, and parameter types (names optional)', atomIds: ['H-08'] },
      { line: 5, code: 'void greet(string);', annotation: 'This tells the compiler greet takes a string and returns nothing', atomIds: ['H-08'] },
    ]
  ));

  cards.push(makeCard('H-09', 8,
`#include <iostream>
using namespace std;
void f() {
  int local = 5;
  cout << local << endl;
}
int main() {
  f();
  return 0;
}`,
    [
      { line: 4, code: '  int local = 5;', annotation: 'local is created when f() starts running', atomIds: ['H-09'] },
      { line: 6, code: '}', annotation: 'When f returns, local is destroyed; its memory box no longer exists', atomIds: ['H-09'] },
    ]
  ));

  cards.push(makeCard('H-10', 8,
`#include <iostream>
using namespace std;
void f() {
  int secret = 42;
}
int main() {
  f();
  // secret is not accessible here
  return 0;
}`,
    [
      { line: 4, code: '  int secret = 42;', annotation: 'secret only exists inside f; it is local to that function', atomIds: ['H-10'] },
      { line: 8, code: '  // secret is not accessible here', annotation: 'The caller (main) cannot see or use variables from inside f', atomIds: ['H-10'] },
    ]
  ));

  // ============== L9 PASS BY REFERENCE ==============

  cards.push(makeCard('R-01', 9,
`#include <iostream>
using namespace std;
void increment_copy(int x) {
  x = x + 1;
}
int main() {
  int n = 5;
  increment_copy(n);
  cout << n << endl;
  return 0;
}`,
    [
      { line: 3, code: 'void increment_copy(int x) {', annotation: 'Without &, x is a copy of the caller value; a separate memory box', atomIds: ['R-01'] },
      { line: 4, code: '  x = x + 1;', annotation: 'This changes the copy, not the original; n in main stays 5', atomIds: ['R-01'] },
      { line: 9, code: '  cout << n << endl;', annotation: 'Prints 5 because the function only modified its own local copy', atomIds: ['R-01'] },
    ]
  ));

  cards.push(makeCard('R-02', 9,
`#include <iostream>
using namespace std;
void try_change(int x) {
  x = 99;
}
int main() {
  int n = 5;
  try_change(n);
  cout << n << endl;
  return 0;
}`,
    [
      { line: 3, code: 'void try_change(int x) {', annotation: 'Pass by value: x gets a copy of n, they are separate boxes', atomIds: ['R-02'] },
      { line: 4, code: '  x = 99;', annotation: 'Mutating the parameter does NOT change the caller variable', atomIds: ['R-02'] },
      { line: 9, code: '  cout << n << endl;', annotation: 'n is still 5; the function cannot affect main variables by value', atomIds: ['R-02'] },
    ]
  ));

  cards.push(makeCard('R-03', 9,
`#include <iostream>
using namespace std;
void increment(int &x) {
  x = x + 1;
}
int main() {
  int n = 5;
  increment(n);
  cout << n << endl;
  return 0;
}`,
    [
      { line: 3, code: 'void increment(int &x) {', annotation: '& makes x an alias (another name) for the same memory box as n', atomIds: ['R-03'] },
      { line: 4, code: '  x = x + 1;', annotation: 'Changing x changes n because they share the same memory box', atomIds: ['R-03'] },
      { line: 9, code: '  cout << n << endl;', annotation: 'Prints 6 because & let the function modify the caller variable directly', atomIds: ['R-03'] },
    ]
  ));

  cards.push(makeCard('R-04', 9,
`#include <iostream>
using namespace std;
void increment(int &x) {
  x = x + 1;
}
int main() {
  int n = 5;
  increment(n);
  cout << n << endl;
  return 0;
}`,
    [
      { line: 3, code: 'void increment(int &x) {', annotation: 'void f(int &x) means x shares the caller memory box, not a copy', atomIds: ['R-04'] },
      { line: 8, code: '  increment(n);', annotation: 'When called, x and n point to the same box; changes via x affect n', atomIds: ['R-04'] },
    ]
  ));

  cards.push(makeCard('R-05', 9,
`#include <iostream>
using namespace std;
void increment(int &x) {
  x = x + 1;
}
int main() {
  int n = 5;
  increment(n);
  cout << n << endl;
  return 0;
}`,
    [
      { line: 4, code: '  x = x + 1;', annotation: 'Because & was used, mutating x here directly changes the caller n', atomIds: ['R-05'] },
      { line: 9, code: '  cout << n << endl;', annotation: 'n is now 6; the mutation persisted because & shares the same box', atomIds: ['R-05'] },
    ]
  ));

  cards.push(makeCard('R-06', 9,
`#include <iostream>
using namespace std;
void increment(int &x) {
  x = x + 1;
}
int main() {
  int n = 5;
  increment(n);
  // increment(5);  // ERROR: cannot bind literal to &
  return 0;
}`,
    [
      { line: 8, code: '  increment(n);', annotation: 'OK: n is a real variable with a memory box that & can alias', atomIds: ['R-06'] },
      { line: 9, code: '  // increment(5);  // ERROR: cannot bind literal to &', annotation: 'A literal like 5 has no memory box, so & cannot create an alias to it', atomIds: ['R-06'] },
    ]
  ));

  cards.push(makeCard('R-07', 9,
`#include <iostream>
#include <string>
using namespace std;
struct user_data {
  string username;
};
void print_user(const user_data &user) {
  cout << user.username << endl;
}
int main() {
  user_data u;
  u.username = "alice";
  print_user(u);
  return 0;
}`,
    [
      { line: 7, code: 'void print_user(const user_data &user) {', annotation: 'const & shares the box (no copy) but prevents any modifications', atomIds: ['R-07'] },
      { line: 8, code: '  cout << user.username << endl;', annotation: 'Reading is allowed; writing like user.username = "X" would cause a compiler error', atomIds: ['R-07'] },
    ]
  ));

  cards.push(makeCard('R-08', 9,
`#include <iostream>
using namespace std;
void increment(int &x) {
  x = x + 1;
}
int main() {
  int n = 5;
  increment(n);
  cout << n << endl;
  return 0;
}`,
    [
      { line: 3, code: 'void increment(int &x) {', annotation: 'A reference means x and n are two different names for the same box', atomIds: ['R-08'] },
      { line: 9, code: '  cout << n << endl;', annotation: 'n shows 6: one box, two names (x inside the function, n in main)', atomIds: ['R-08'] },
    ]
  ));

  // ============== L10 ARRAYS ==============

  cards.push(makeCard('G-01', 10,
`#include <iostream>
using namespace std;
int main() {
  int arr[5] = {10, 20, 30, 40, 50};
  for (int i = 0; i < 5; i++) {
    cout << arr[i] << " ";
  }
  return 0;
}`,
    [
      { line: 4, code: '  int arr[5] = {10, 20, 30, 40, 50};', annotation: 'An array holds a sequence of N values stored in a row in memory', atomIds: ['G-01'] },
      { line: 6, code: '    cout << arr[i] << " ";', annotation: 'Access each value by its index position: 0, 1, 2, 3, 4', atomIds: ['G-01'] },
    ]
  ));

  cards.push(makeCard('G-02', 10,
`#include <iostream>
using namespace std;
int main() {
  int arr[5];
  arr[0] = 99;
  cout << arr[0] << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int arr[5];', annotation: 'type arr[N] declares an array with N slots; here 5 int slots are created', atomIds: ['G-02'] },
      { line: 5, code: '  arr[0] = 99;', annotation: 'Slots start uninitialized; you must assign values before reading them', atomIds: ['G-02'] },
    ]
  ));

  cards.push(makeCard('G-03', 10,
`#include <iostream>
using namespace std;
int main() {
  int arr[3] = {1, 2, 3};
  cout << arr[0] << " " << arr[1] << " " << arr[2] << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int arr[3] = {1, 2, 3};', annotation: 'Brace initialization fills all slots at once: arr[0]=1, arr[1]=2, arr[2]=3', atomIds: ['G-03'] },
      { line: 5, code: '  cout << arr[0] << " " << arr[1] << " " << arr[2] << endl;', annotation: 'Prints "1 2 3", confirming each slot was initialized', atomIds: ['G-03'] },
    ]
  ));

  cards.push(makeCard('G-04', 10,
`#include <iostream>
using namespace std;
int main() {
  int arr[3] = {10, 20, 30};
  cout << arr[0] << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int arr[3] = {10, 20, 30};', annotation: 'Array has 3 elements at positions 0, 1, and 2', atomIds: ['G-04'] },
      { line: 5, code: '  cout << arr[0] << endl;', annotation: 'arr[0] is always the first element; arrays start counting at 0, not 1', atomIds: ['G-04'] },
    ]
  ));

  cards.push(makeCard('G-05', 10,
`#include <iostream>
using namespace std;
int main() {
  int arr[4] = {10, 20, 30, 40};
  int i = 2;
  cout << arr[i] << endl;
  return 0;
}`,
    [
      { line: 5, code: '  int i = 2;', annotation: 'i is the index, pointing to position 2 in the array', atomIds: ['G-05'] },
      { line: 6, code: '  cout << arr[i] << endl;', annotation: 'arr[i] accesses element at index i; with i=2, this prints 30', atomIds: ['G-05'] },
    ]
  ));

  cards.push(makeCard('G-06', 10,
`#include <iostream>
using namespace std;
int main() {
  int arr[3] = {10, 20, 30};
  cout << arr[0] << endl;
  cout << arr[1] << endl;
  cout << arr[2] << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int arr[3] = {10, 20, 30};', annotation: 'Three slots: arr[0]=10, arr[1]=20, arr[2]=30; indexing starts at 0', atomIds: ['G-06'] },
      { line: 5, code: '  cout << arr[0] << endl;', annotation: 'First element is at index 0, not index 1; prints 10', atomIds: ['G-06'] },
    ]
  ));

  cards.push(makeCard('G-07', 10,
`#include <iostream>
using namespace std;
int main() {
  const int N = 4;
  int arr[N] = {5, 10, 15, 20};
  cout << arr[N - 1] << endl;
  return 0;
}`,
    [
      { line: 4, code: '  const int N = 4;', annotation: 'Array has N=4 elements at indices 0, 1, 2, 3', atomIds: ['G-07'] },
      { line: 6, code: '  cout << arr[N - 1] << endl;', annotation: 'The last element is always at index N minus 1; prints arr[3] which is 20', atomIds: ['G-07'] },
    ]
  ));

  cards.push(makeCard('G-08', 10,
`#include <iostream>
using namespace std;
int main() {
  int arr[3] = {10, 20, 30};
  // arr[3] is OUT OF BOUNDS
  // valid indices: 0, 1, 2
  cout << arr[2] << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int arr[3] = {10, 20, 30};', annotation: 'Array has 3 elements: indices 0, 1, 2 are valid', atomIds: ['G-08'] },
      { line: 5, code: '  // arr[3] is OUT OF BOUNDS', annotation: 'arr[3] is past the end; accessing it causes undefined behavior (crash or garbage)', atomIds: ['G-08'] },
    ]
  ));

  cards.push(makeCard('G-09', 10,
`#include <iostream>
using namespace std;
int main() {
  const int MAX = 100;
  int arr[MAX];
  arr[0] = 42;
  cout << arr[0] << endl;
  return 0;
}`,
    [
      { line: 4, code: '  const int MAX = 100;', annotation: 'Array size must be a constant known at compile time', atomIds: ['G-09'] },
      { line: 5, code: '  int arr[MAX];', annotation: 'The array is created with exactly 100 slots; this size cannot change later', atomIds: ['G-09'] },
    ]
  ));

  cards.push(makeCard('G-10', 10,
`#include <iostream>
using namespace std;
void fill(int arr[], int n) {
  for (int i = 0; i < n; i++) {
    arr[i] = i * 10;
  }
}
int main() {
  int data[5];
  fill(data, 5);
  cout << data[0] << endl;
  return 0;
}`,
    [
      { line: 3, code: 'void fill(int arr[], int n) {', annotation: 'You cannot return an array; instead pass it as a parameter to fill', atomIds: ['G-10'] },
      { line: 5, code: '    arr[i] = i * 10;', annotation: 'The function modifies the array directly since arrays pass by reference', atomIds: ['G-10'] },
    ]
  ));

  cards.push(makeCard('G-11', 10,
`#include <iostream>
using namespace std;
int main() {
  int arr[5] = {2, 4, 6, 8, 10};
  for (int i = 0; i < 5; i++) {
    cout << arr[i] << " ";
  }
  return 0;
}`,
    [
      { line: 5, code: '  for (int i = 0; i < 5; i++) {', annotation: 'A for loop with i from 0 to N minus 1 visits every array element', atomIds: ['G-11'] },
      { line: 6, code: '    cout << arr[i] << " ";', annotation: 'arr[i] accesses each element in turn: arr[0], arr[1], ... arr[4]', atomIds: ['G-11'] },
    ]
  ));

  cards.push(makeCard('G-12', 10,
`#include <iostream>
using namespace std;
int main() {
  int arr[3] = {0, 0, 0};
  arr[2] = 99;
  cout << arr[2] << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int arr[3] = {0, 0, 0};', annotation: 'All three slots start at 0', atomIds: ['G-12'] },
      { line: 5, code: '  arr[2] = 99;', annotation: 'arr[i] = v writes value v into the slot at index i; arr[2] becomes 99', atomIds: ['G-12'] },
    ]
  ));

  cards.push(makeCard('G-13', 10,
`#include <iostream>
using namespace std;
void print_arr(int arr[], int n) {
  for (int i = 0; i < n; i++) {
    cout << arr[i] << " ";
  }
}
int main() {
  int data[3] = {1, 2, 3};
  print_arr(data, 3);
  return 0;
}`,
    [
      { line: 3, code: 'void print_arr(int arr[], int n) {', annotation: 'To pass an array, use type arr[] in the parameter list; always pass size n too', atomIds: ['G-13'] },
      { line: 10, code: '  print_arr(data, 3);', annotation: 'The array name (data) and its size (3) are passed to the function', atomIds: ['G-13'] },
    ]
  ));

  cards.push(makeCard('G-14', 10,
`#include <iostream>
using namespace std;
void fill(int arr[], int n) {
  arr[0] = 99;
}
int main() {
  int data[3] = {1, 2, 3};
  fill(data, 3);
  cout << data[0] << endl;
  return 0;
}`,
    [
      { line: 3, code: 'void fill(int arr[], int n) {', annotation: 'Arrays are always passed by reference; the function works on the caller array', atomIds: ['G-14'] },
      { line: 4, code: '  arr[0] = 99;', annotation: 'Changes to arr[0] inside the function directly modify the caller data array', atomIds: ['G-14'] },
    ]
  ));

  // ============== L11 STRUCTS ==============

  cards.push(makeCard('T-01', 11,
`#include <iostream>
#include <string>
using namespace std;
struct Student {
  string name;
  int age;
};
int main() {
  Student s;
  s.name = "Ada";
  s.age = 21;
  return 0;
}`,
    [
      { line: 4, code: 'struct Student {', annotation: 'A struct groups related fields together under one name', atomIds: ['T-01'] },
      { line: 5, code: '  string name;', annotation: 'Each field is a named data slot; Student bundles name and age', atomIds: ['T-01'] },
    ]
  ));

  cards.push(makeCard('T-02', 11,
`struct Point {
  int x;
  int y;
};`,
    [
      { line: 1, code: 'struct Point {', annotation: 'struct Name { fields }; creates a new custom type called Point', atomIds: ['T-02'] },
      { line: 2, code: '  int x;', annotation: 'Point has two fields: x and y, both integers', atomIds: ['T-02'] },
      { line: 4, code: '};', annotation: 'The semicolon after } is required to complete the struct definition', atomIds: ['T-02'] },
    ]
  ));

  cards.push(makeCard('T-03', 11,
`struct Point {
  int x;
  int y;
};`,
    [
      { line: 2, code: '  int x;', annotation: 'Each field declaration follows the pattern: type fieldName;', atomIds: ['T-03'] },
      { line: 3, code: '  int y;', annotation: 'Every field has its own type and name, just like regular variables', atomIds: ['T-03'] },
    ]
  ));

  cards.push(makeCard('T-04', 11,
`struct Point {
  int x;
  int y;
};`,
    [
      { line: 1, code: 'struct Point {', annotation: 'The struct body is enclosed in braces { }', atomIds: ['T-04'] },
      { line: 4, code: '};', annotation: 'The closing }; with a semicolon is mandatory; forgetting ; is a common error', atomIds: ['T-04'] },
    ]
  ));

  cards.push(makeCard('T-05', 11,
`#include <iostream>
using namespace std;
struct Point {
  int x;
  int y;
};
int main() {
  Point p;
  p.x = 3;
  cout << p.x << endl;
  return 0;
}`,
    [
      { line: 8, code: '  Point p;', annotation: 'Using the struct type name to declare a variable creates an instance of it', atomIds: ['T-05'] },
      { line: 9, code: '  p.x = 3;', annotation: 'p now has its own x and y fields, ready to store data', atomIds: ['T-05'] },
    ]
  ));

  cards.push(makeCard('T-06', 11,
`#include <iostream>
using namespace std;
struct Point {
  int x;
  int y;
};
int main() {
  Point p;
  p.x = 3;
  cout << p.x << endl;
  return 0;
}`,
    [
      { line: 9, code: '  p.x = 3;', annotation: 'The dot operator . accesses a field inside a struct variable', atomIds: ['T-06'] },
      { line: 10, code: '  cout << p.x << endl;', annotation: 'p.x reads the x field of p; the dot connects the struct to its member', atomIds: ['T-06'] },
    ]
  ));

  cards.push(makeCard('T-07', 11,
`#include <iostream>
using namespace std;
struct Point {
  int x;
  int y;
};
int main() {
  Point p;
  p.x = 3;
  p.y = 7;
  cout << p.x << " " << p.y << endl;
  return 0;
}`,
    [
      { line: 9, code: '  p.x = 3;', annotation: 'x.field = v writes a value into the named field of the struct', atomIds: ['T-07'] },
      { line: 10, code: '  p.y = 7;', annotation: 'Each field is written independently using dot notation', atomIds: ['T-07'] },
    ]
  ));

  cards.push(makeCard('T-08', 11,
`#include <iostream>
using namespace std;
struct Point {
  int x;
  int y;
};
int main() {
  Point p;
  p.x = 3;
  cout << p.x << endl;
  return 0;
}`,
    [
      { line: 9, code: '  p.x = 3;', annotation: 'Store the value 3 in the x field of p', atomIds: ['T-08'] },
      { line: 10, code: '  cout << p.x << endl;', annotation: 'cout << p.x reads the field value (3) and prints it to the terminal', atomIds: ['T-08'] },
    ]
  ));

  cards.push(makeCard('T-09', 11,
`#include <iostream>
using namespace std;
struct stat_double {
  double numbers[5];
  double mystery;
};
int main() {
  stat_double d;
  d.numbers[0] = 1.5;
  d.mystery = 0.0;
  return 0;
}`,
    [
      { line: 4, code: '  double numbers[5];', annotation: 'A struct can contain an array field; numbers holds 5 doubles', atomIds: ['T-09'] },
      { line: 5, code: '  double mystery;', annotation: 'Mix of array and scalar fields in the same struct is allowed', atomIds: ['T-09'] },
    ]
  ));

  cards.push(makeCard('T-10', 11,
`#include <iostream>
using namespace std;
struct stat_double {
  double numbers[5];
  double mystery;
};
int main() {
  stat_double d;
  d.numbers[0] = 1.0;
  d.numbers[1] = 2.0;
  cout << d.numbers[0] << endl;
  return 0;
}`,
    [
      { line: 9, code: '  d.numbers[0] = 1.0;', annotation: 'Chain dot and bracket: d.numbers accesses the array, then [0] the first element', atomIds: ['T-10'] },
      { line: 11, code: '  cout << d.numbers[0] << endl;', annotation: 'data.arr[i] reads element i of the array field inside the struct', atomIds: ['T-10'] },
    ]
  ));

  cards.push(makeCard('T-11', 11,
`#include <iostream>
using namespace std;
struct Point {
  int x;
  int y;
};
int main() {
  Point list[3];
  list[0].x = 1;
  list[0].y = 2;
  cout << list[0].x << endl;
  return 0;
}`,
    [
      { line: 8, code: '  Point list[3];', annotation: 'Name list[N] creates an array of N structs; each element is a full Point', atomIds: ['T-11'] },
      { line: 9, code: '  list[0].x = 1;', annotation: 'Each slot in the array is an independent struct with its own fields', atomIds: ['T-11'] },
    ]
  ));

  cards.push(makeCard('T-12', 11,
`#include <iostream>
using namespace std;
struct Point {
  int x;
  int y;
};
int main() {
  Point list[3];
  list[0].x = 5;
  list[1].x = 10;
  cout << list[0].x << " " << list[1].x << endl;
  return 0;
}`,
    [
      { line: 9, code: '  list[0].x = 5;', annotation: 'list[i].field chains array index and field access in one expression', atomIds: ['T-12'] },
      { line: 10, code: '  list[1].x = 10;', annotation: 'Each array element has its own set of fields; list[1].x is separate from list[0].x', atomIds: ['T-12'] },
    ]
  ));

  // ============== L12 STRUCT PASSING ==============

  cards.push(makeCard('PC-01', 12,
`#include <iostream>
using namespace std;
struct Point { int x; int y; };
void f(Point p) {
  p.x = 99;
}
int main() {
  Point pt;
  pt.x = 3;
  f(pt);
  cout << pt.x << endl;
  return 0;
}`,
    [
      { line: 4, code: 'void f(Point p) {', annotation: 'Pass by value: p is a complete copy of the caller struct', atomIds: ['PC-01'] },
      { line: 5, code: '  p.x = 99;', annotation: 'Changing the copy has no effect on the original; pt.x stays 3', atomIds: ['PC-01'] },
      { line: 11, code: '  cout << pt.x << endl;', annotation: 'Prints 3; the whole struct was copied, so the original is unchanged', atomIds: ['PC-01'] },
    ]
  ));

  cards.push(makeCard('PC-02', 12,
`#include <iostream>
using namespace std;
struct Point { int x; int y; };
void update(Point &p) {
  p.x = 99;
}
int main() {
  Point pt;
  pt.x = 3;
  update(pt);
  cout << pt.x << endl;
  return 0;
}`,
    [
      { line: 4, code: 'void update(Point &p) {', annotation: '& shares the struct; p is an alias for the caller variable pt', atomIds: ['PC-02'] },
      { line: 5, code: '  p.x = 99;', annotation: 'Changes go directly into the caller struct; pt.x becomes 99', atomIds: ['PC-02'] },
    ]
  ));

  cards.push(makeCard('PC-03', 12,
`#include <iostream>
using namespace std;
struct stat_double { double mystery; double numbers[5]; };
void mutate(stat_double &d) {
  d.mystery = 99.0;
}
int main() {
  stat_double data;
  data.mystery = 0.0;
  mutate(data);
  cout << data.mystery << endl;
  return 0;
}`,
    [
      { line: 4, code: 'void mutate(stat_double &d) {', annotation: '& lets the function modify the caller struct directly', atomIds: ['PC-03'] },
      { line: 5, code: '  d.mystery = 99.0;', annotation: 'This change persists in the caller because & shares the same memory', atomIds: ['PC-03'] },
      { line: 11, code: '  cout << data.mystery << endl;', annotation: 'Prints 99; the mutation via & persisted after the function returned', atomIds: ['PC-03'] },
    ]
  ));

  cards.push(makeCard('PC-04', 12,
`#include <iostream>
#include <string>
using namespace std;
struct Item { int id; string name; };
void read_items(Item list[], int count) {
  for (int i = 0; i < count; i++) {
    cin >> list[i].id >> list[i].name;
  }
}
int main() {
  Item items[10];
  read_items(items, 2);
  return 0;
}`,
    [
      { line: 5, code: 'void read_items(Item list[], int count) {', annotation: 'Passing an array of structs lets the function fill the caller array', atomIds: ['PC-04'] },
      { line: 7, code: '    cin >> list[i].id >> list[i].name;', annotation: 'Arrays pass by reference, so writing to list[i] modifies the caller array', atomIds: ['PC-04'] },
    ]
  ));

  cards.push(makeCard('PC-05', 12,
`#include <iostream>
#include <string>
using namespace std;
struct book { int id; string title; };
void read_book(book list[], int n) {
  list[0].title = "C++";
}
int main() {
  book shelf[5];
  read_book(shelf, 5);
  cout << shelf[0].title << endl;
  return 0;
}`,
    [
      { line: 6, code: '  list[0].title = "C++";', annotation: 'Writing to list[i].field inside the function persists in the caller array', atomIds: ['PC-05'] },
      { line: 11, code: '  cout << shelf[0].title << endl;', annotation: 'Prints "C++" because the array was passed by reference', atomIds: ['PC-05'] },
    ]
  ));

  cards.push(makeCard('PC-06', 12,
`#include <iostream>
using namespace std;
struct Point { int x; int y; };
void print_pt(const Point &p) {
  cout << p.x << " " << p.y << endl;
}
int main() {
  Point pt;
  pt.x = 3;
  pt.y = 7;
  print_pt(pt);
  return 0;
}`,
    [
      { line: 4, code: 'void print_pt(const Point &p) {', annotation: 'const & shares the struct efficiently but prevents any modification', atomIds: ['PC-06'] },
      { line: 5, code: '  cout << p.x << " " << p.y << endl;', annotation: 'Reading fields is fine; trying to write p.x = 5 would cause a compiler error', atomIds: ['PC-06'] },
    ]
  ));

  // ============== L13 HAND EXECUTION ==============

  cards.push(makeCard('HE-01', 13,
`#include <iostream>
using namespace std;
int main() {
  int x = 3;
  x = x + 2;
  cout << x << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int x = 3;', annotation: 'Tracing means mentally stepping through code line by line, tracking values', atomIds: ['HE-01'] },
      { line: 5, code: '  x = x + 2;', annotation: 'At this line, you update your mental note: x was 3, now x is 5', atomIds: ['HE-01'] },
      { line: 6, code: '  cout << x << endl;', annotation: 'You predict the output (5) by reading from your tracked state', atomIds: ['HE-01'] },
    ]
  ));

  cards.push(makeCard('HE-02', 13,
`#include <iostream>
using namespace std;
int main() {
  int x = 5;
  int y = 10;
  cout << x << " " << y << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int x = 5;', annotation: 'Track: x = 5 (write it down or keep a mental note)', atomIds: ['HE-02'] },
      { line: 5, code: '  int y = 10;', annotation: 'Track: x = 5, y = 10; keep a running table of every variable value', atomIds: ['HE-02'] },
    ]
  ));

  cards.push(makeCard('HE-03', 13,
`#include <iostream>
using namespace std;
int main() {
  int x = 5;
  x = 10;
  cout << x << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int x = 5;', annotation: 'Trace: x = 5 (initial value)', atomIds: ['HE-03'] },
      { line: 5, code: '  x = 10;', annotation: 'On reassignment, cross out the old value: x = 5 -> 10; latest is 10', atomIds: ['HE-03'] },
    ]
  ));

  cards.push(makeCard('HE-04', 13,
`#include <iostream>
using namespace std;
int main() {
  for (int i = 0; i < 3; i++) {
    cout << i << " ";
  }
  return 0;
}`,
    [
      { line: 4, code: '  for (int i = 0; i < 3; i++) {', annotation: 'Track i each iteration: i=0 (body runs), i=1 (body runs), i=2 (body runs)', atomIds: ['HE-04'] },
      { line: 5, code: '    cout << i << " ";', annotation: 'After body, step runs: i becomes 3, condition 3<3 is false, loop ends', atomIds: ['HE-04'] },
    ]
  ));

  cards.push(makeCard('HE-05', 13,
`#include <iostream>
using namespace std;
int main() {
  int n = 7;
  if (n > 5) {
    cout << "big" << endl;
  } else {
    cout << "small" << endl;
  }
  return 0;
}`,
    [
      { line: 5, code: '  if (n > 5) {', annotation: 'Evaluate the condition: 7 > 5 is true, so take the if branch', atomIds: ['HE-05'] },
      { line: 6, code: '    cout << "big" << endl;', annotation: 'This branch runs because the condition was true; else is skipped entirely', atomIds: ['HE-05'] },
    ]
  ));

  cards.push(makeCard('HE-06', 13,
`#include <iostream>
using namespace std;
void f(int x) {
  cout << x << endl;
}
int main() {
  f(5);
  return 0;
}`,
    [
      { line: 7, code: '  f(5);', annotation: 'At a function call, mentally enter a new frame with its own local variables', atomIds: ['HE-06'] },
      { line: 3, code: 'void f(int x) {', annotation: 'New frame: x = 5 (the argument value); trace inside f now', atomIds: ['HE-06'] },
    ]
  ));

  cards.push(makeCard('HE-07', 13,
`#include <iostream>
using namespace std;
void f() {
  int local = 5;
  cout << local << endl;
}
int main() {
  f();
  return 0;
}`,
    [
      { line: 4, code: '  int local = 5;', annotation: 'local exists only inside this frame; track it while f is running', atomIds: ['HE-07'] },
      { line: 6, code: '}', annotation: 'When f returns, the frame is destroyed; erase local from your trace table', atomIds: ['HE-07'] },
    ]
  ));

  cards.push(makeCard('HE-08', 13,
`#include <iostream>
using namespace std;
void incr(int &x) {
  x = x + 1;
}
int main() {
  int n = 5;
  incr(n);
  cout << n << endl;
  return 0;
}`,
    [
      { line: 3, code: 'void incr(int &x) {', annotation: 'With &, x and n share the same box; changes to x affect n directly', atomIds: ['HE-08'] },
      { line: 4, code: '  x = x + 1;', annotation: 'Update your trace: n was 5, now n = 6 (because x IS n via &)', atomIds: ['HE-08'] },
      { line: 9, code: '  cout << n << endl;', annotation: 'Back in main, n = 6; the & mutation persisted after incr returned', atomIds: ['HE-08'] },
    ]
  ));

  cards.push(makeCard('HE-09', 13,
`#include <iostream>
using namespace std;
void fill(int &slot) {
  slot = 99;
}
int main() {
  int arr[3] = {1, 2, 3};
  fill(arr[0]);
  cout << arr[0] << endl;
  return 0;
}`,
    [
      { line: 7, code: '  int arr[3] = {1, 2, 3};', annotation: 'Trace: arr = {1, 2, 3}', atomIds: ['HE-09'] },
      { line: 8, code: '  fill(arr[0]);', annotation: 'slot is & alias to arr[0]; slot = 99 changes arr to {99, 2, 3}', atomIds: ['HE-09'] },
    ]
  ));

  cards.push(makeCard('HE-10', 13,
`#include <iostream>
using namespace std;
int main() {
  int x = 5;
  int y = x;
  cout << x << " " << y << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int x = 5;', annotation: 'Trace: x = 5', atomIds: ['HE-10'] },
      { line: 5, code: '  int y = x;', annotation: 'y copies the current value of x; trace: x = 5, y = 5 (separate boxes)', atomIds: ['HE-10'] },
    ]
  ));

  cards.push(makeCard('HE-11', 13,
`#include <iostream>
using namespace std;
int main() {
  int arr[3] = {0, 0, 0};
  arr[1] = 7;
  arr[2] = arr[1] + 1;
  cout << arr[0] << " " << arr[1] << " " << arr[2] << endl;
  return 0;
}`,
    [
      { line: 5, code: '  arr[1] = 7;', annotation: 'Trace: arr = {0, 7, 0}; update slot 1 in your table', atomIds: ['HE-11'] },
      { line: 6, code: '  arr[2] = arr[1] + 1;', annotation: 'arr[1] is 7, so arr[2] = 7+1 = 8; trace: arr = {0, 7, 8}', atomIds: ['HE-11'] },
    ]
  ));

  cards.push(makeCard('HE-12', 13,
`#include <iostream>
using namespace std;
int main() {
  int sum = 0;
  for (int i = 1; i <= 4; i++) {
    sum = sum + i;
  }
  cout << sum << endl;
  return 0;
}`,
    [
      { line: 5, code: '  for (int i = 1; i <= 4; i++) {', annotation: 'Trace each iteration: i=1 sum=1, i=2 sum=3, i=3 sum=6, i=4 sum=10', atomIds: ['HE-12'] },
      { line: 8, code: '  cout << sum << endl;', annotation: 'Final state after loop: sum = 10 (1+2+3+4)', atomIds: ['HE-12'] },
    ]
  ));

  cards.push(makeCard('HE-13', 13,
`#include <iostream>
using namespace std;
int main() {
  int n = 7;
  int label;
  if (n > 5) {
    label = 1;
  } else {
    label = 2;
  }
  cout << label << endl;
  return 0;
}`,
    [
      { line: 6, code: '  if (n > 5) {', annotation: 'Evaluate: 7 > 5 is true, so take the if branch', atomIds: ['HE-13'] },
      { line: 7, code: '    label = 1;', annotation: 'Trace: label = 1 (the else branch is never entered)', atomIds: ['HE-13'] },
    ]
  ));

  cards.push(makeCard('HE-14', 13,
`#include <iostream>
using namespace std;
int square(int x) {
  return x * x;
}
int main() {
  int r = square(5);
  cout << r << endl;
  return 0;
}`,
    [
      { line: 7, code: '  int r = square(5);', annotation: 'Call square: enter new frame with x=5, compute 5*5=25, return 25', atomIds: ['HE-14'] },
      { line: 8, code: '  cout << r << endl;', annotation: 'Back in main: r = 25 (the returned value); prints 25', atomIds: ['HE-14'] },
    ]
  ));

  cards.push(makeCard('HE-15', 13,
`#include <iostream>
using namespace std;
void f_val(int x) { x = 99; }
void f_ref(int &x) { x = 99; }
int main() {
  int n = 5;
  f_val(n);
  cout << n << endl;
  f_ref(n);
  cout << n << endl;
  return 0;
}`,
    [
      { line: 7, code: '  f_val(n);', annotation: 'Pass by value: f_val gets a copy; n stays 5 after the call', atomIds: ['HE-15'] },
      { line: 9, code: '  f_ref(n);', annotation: 'Pass by reference: f_ref shares n via &; n becomes 99 after the call', atomIds: ['HE-15'] },
    ]
  ));

  cards.push(makeCard('HE-16', 13,
`#include <iostream>
using namespace std;
int main() {
  double nums[5] = {3.2, 7.1, 5.0, 9.4, 2.8};
  double max_val = nums[0];
  for (int i = 1; i < 5; i++) {
    if (nums[i] > max_val) {
      max_val = nums[i];
    }
  }
  cout << max_val << endl;
  return 0;
}`,
    [
      { line: 5, code: '  double max_val = nums[0];', annotation: 'Start max at first element (3.2); compare against remaining elements', atomIds: ['HE-16'] },
      { line: 7, code: '    if (nums[i] > max_val) {', annotation: 'Trace: i=1 7.1>3.2 yes max=7.1, i=2 no, i=3 9.4>7.1 yes max=9.4, i=4 no', atomIds: ['HE-16'] },
      { line: 11, code: '  cout << max_val << endl;', annotation: 'Final max_val = 9.4, the largest element in the array', atomIds: ['HE-16'] },
    ]
  ));

  cards.push(makeCard('HE-17', 13,
`#include <iostream>
using namespace std;
struct Point { int x; int y; };
void shift(Point &p) {
  p.x = p.x + 1;
  p.y = p.y + 1;
}
int main() {
  Point a;
  a.x = 3;
  a.y = 4;
  shift(a);
  cout << a.x << " " << a.y << endl;
  return 0;
}`,
    [
      { line: 4, code: 'void shift(Point &p) {', annotation: '& means p is an alias for a; changes inside shift affect a in main', atomIds: ['HE-17'] },
      { line: 5, code: '  p.x = p.x + 1;', annotation: 'Trace: a.x was 3, now 4; a.y was 4, now 5 (both mutated via &)', atomIds: ['HE-17'] },
    ]
  ));

  cards.push(makeCard('HE-18', 13,
`#include <iostream>
using namespace std;
struct stat_double { double mystery; double numbers[5]; };
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
  d.numbers[0] = 2.0;
  d.numbers[1] = 8.0;
  d.numbers[2] = 3.0;
  d.numbers[3] = 1.0;
  d.numbers[4] = 5.0;
  who_am_i(d);
  cout << d.mystery << endl;
  return 0;
}`,
    [
      { line: 7, code: '    if (data.numbers[i] > data.mystery) {', annotation: 'Each iteration compares numbers[i] to current mystery (running max)', atomIds: ['HE-18'] },
      { line: 8, code: '      data.mystery = data.numbers[i];', annotation: 'Only updates mystery when a larger value is found; trace: 2.0->8.0 (final)', atomIds: ['HE-18'] },
    ]
  ));

  // ============== L14 WRITE STRUCT ==============

  cards.push(makeCard('SW-01', 14,
`struct computer_data {
  int id;
  string description;
  string location;
};`,
    [
      { line: 1, code: 'struct computer_data {', annotation: 'To write a struct, start with struct followed by the type name and {', atomIds: ['SW-01'] },
      { line: 2, code: '  int id;', annotation: 'List each field with its type and name, one per line', atomIds: ['SW-01'] },
      { line: 5, code: '};', annotation: 'Close with }; to complete the custom type definition', atomIds: ['SW-01'] },
    ]
  ));

  cards.push(makeCard('SW-02', 14,
`struct student {
  int id;
  string description;
  double gpa;
};`,
    [
      { line: 2, code: '  int id;', annotation: 'Each field follows the pattern: type fieldName; just like a variable declaration', atomIds: ['SW-02'] },
      { line: 3, code: '  string description;', annotation: 'Choose the type that matches the data: string for text, int for whole numbers', atomIds: ['SW-02'] },
    ]
  ));

  cards.push(makeCard('SW-03', 14,
`struct X {
  int a;
};`,
    [
      { line: 1, code: 'struct X {', annotation: 'The struct body opens with {', atomIds: ['SW-03'] },
      { line: 3, code: '};', annotation: 'The closing }; with semicolon is mandatory; without ; the code will not compile', atomIds: ['SW-03'] },
    ]
  ));

  cards.push(makeCard('SW-04', 14,
`struct book {
  int id;
  string title;
  double price;
};`,
    [
      { line: 2, code: '  int id;', annotation: 'Pick int for IDs and counts, string for text, double for monetary amounts', atomIds: ['SW-04'] },
      { line: 3, code: '  string title;', annotation: 'The spec says "title" is text, so string is the right type choice', atomIds: ['SW-04'] },
      { line: 4, code: '  double price;', annotation: 'Prices need decimals, so double (not int) is the correct type', atomIds: ['SW-04'] },
    ]
  ));

  cards.push(makeCard('SW-05', 14,
`struct book {
  string title;
  double price;
  int id;
};`,
    [
      { line: 2, code: '  string title;', annotation: 'Fields can appear in any order; the compiler does not enforce a sequence', atomIds: ['SW-05'] },
      { line: 4, code: '  int id;', annotation: 'Whether id is first or last does not change how the struct works', atomIds: ['SW-05'] },
    ]
  ));

  // ============== L15 READ FUNCTION ==============

  cards.push(makeCard('RW-01', 15,
`#include <iostream>
using namespace std;
struct Item { int id; };
void read_items(Item list[], int count) {
  for (int i = 0; i < count; i++) {
    cin >> list[i].id;
  }
}
int main() {
  Item arr[10];
  read_items(arr, 3);
  return 0;
}`,
    [
      { line: 4, code: 'void read_items(Item list[], int count) {', annotation: 'void means this function reads data but returns nothing', atomIds: ['RW-01'] },
      { line: 6, code: '    cin >> list[i].id;', annotation: 'The function does its work through side effects (filling the array)', atomIds: ['RW-01'] },
    ]
  ));

  cards.push(makeCard('RW-02', 15,
`#include <iostream>
#include <string>
using namespace std;
struct Book { int id; string title; };
void read_books(Book list[], int count) {
  for (int i = 0; i < count; i++) {
    cin >> list[i].id >> list[i].title;
  }
}
int main() {
  Book arr[10];
  read_books(arr, 2);
  return 0;
}`,
    [
      { line: 5, code: 'void read_books(Book list[], int count) {', annotation: 'Type list[] passes the struct array so the function can fill it', atomIds: ['RW-02'] },
      { line: 7, code: '    cin >> list[i].id >> list[i].title;', annotation: 'The function writes into the caller array through the passed reference', atomIds: ['RW-02'] },
    ]
  ));

  cards.push(makeCard('RW-03', 15,
`#include <iostream>
using namespace std;
struct Item { int id; };
void read_items(Item list[], int count) {
  for (int i = 0; i < count; i++) {
    cin >> list[i].id;
  }
}
int main() {
  Item arr[100];
  int count;
  cin >> count;
  read_items(arr, count);
  return 0;
}`,
    [
      { line: 4, code: 'void read_items(Item list[], int count) {', annotation: 'The int count parameter tells the function how many items to read', atomIds: ['RW-03'] },
      { line: 5, code: '  for (int i = 0; i < count; i++) {', annotation: 'count controls the loop bound; only count elements are read, not the whole array', atomIds: ['RW-03'] },
    ]
  ));

  cards.push(makeCard('RW-04', 15,
`#include <iostream>
using namespace std;
struct Item { int id; };
void read_items(Item list[], int count) {
  for (int i = 0; i < count; i++) {
    cin >> list[i].id;
  }
}
int main() {
  Item arr[100];
  read_items(arr, 5);
  return 0;
}`,
    [
      { line: 5, code: '  for (int i = 0; i < count; i++) {', annotation: 'The for loop uses count as the upper bound to read exactly count items', atomIds: ['RW-04'] },
      { line: 6, code: '    cin >> list[i].id;', annotation: 'Each iteration reads one struct element at index i', atomIds: ['RW-04'] },
    ]
  ));

  cards.push(makeCard('RW-05', 15,
`#include <iostream>
using namespace std;
struct Item { int id; string name; };
void read_items(Item list[], int count) {
  for (int i = 0; i < count; i++) {
    cin >> list[i].id;
    cin >> list[i].name;
  }
}
int main() {
  Item arr[10];
  read_items(arr, 3);
  return 0;
}`,
    [
      { line: 6, code: '    cin >> list[i].id;', annotation: 'cin >> list[i].field reads user input directly into the struct field', atomIds: ['RW-05'] },
      { line: 7, code: '    cin >> list[i].name;', annotation: 'Each field gets its own cin statement to read from the terminal', atomIds: ['RW-05'] },
    ]
  ));

  cards.push(makeCard('RW-06', 15,
`#include <iostream>
#include <string>
using namespace std;
struct Student { int id; string name; string course; };
void read_students(Student list[], int count) {
  for (int i = 0; i < count; i++) {
    cin >> list[i].id;
    cin >> list[i].name;
    cin >> list[i].course;
  }
}
int main() {
  Student arr[100];
  read_students(arr, 2);
  return 0;
}`,
    [
      { line: 7, code: '    cin >> list[i].id;', annotation: 'One cin per field: each struct field needs its own input statement', atomIds: ['RW-06'] },
      { line: 9, code: '    cin >> list[i].course;', annotation: 'Three fields means three cin lines per loop iteration', atomIds: ['RW-06'] },
    ]
  ));

  cards.push(makeCard('RW-07', 15,
`#include <iostream>
using namespace std;
struct Item { int id; };
void read_items(Item list[], int count) {
  for (int i = 0; i < count; i++) {
    cout << "Enter id: ";
    cin >> list[i].id;
  }
}
int main() {
  Item arr[10];
  read_items(arr, 2);
  return 0;
}`,
    [
      { line: 6, code: '    cout << "Enter id: ";', annotation: 'An optional prompt before cin tells the user what to type', atomIds: ['RW-07'] },
      { line: 7, code: '    cin >> list[i].id;', annotation: 'The cin follows the prompt, reading the value the user types', atomIds: ['RW-07'] },
    ]
  ));

  // ============== L16 MAIN FUNCTION ==============

  cards.push(makeCard('MW-01', 16,
`#include <iostream>
using namespace std;
int main() {
  cout << "running" << endl;
  return 0;
}`,
    [
      { line: 3, code: 'int main() {', annotation: 'Every program needs int main() as the entry point', atomIds: ['MW-01'] },
      { line: 5, code: '  return 0;', annotation: 'return 0 at the end signals the program completed successfully', atomIds: ['MW-01'] },
    ]
  ));

  cards.push(makeCard('MW-02', 16,
`#include <iostream>
using namespace std;
int main() {
  const int MAX = 100;
  int arr[MAX];
  cout << MAX << endl;
  return 0;
}`,
    [
      { line: 4, code: '  const int MAX = 100;', annotation: 'const int MAX = 100 creates a constant; its value can never change', atomIds: ['MW-02'] },
      { line: 5, code: '  int arr[MAX];', annotation: 'MAX is used as the array size; const ensures it stays fixed', atomIds: ['MW-02'] },
    ]
  ));

  cards.push(makeCard('MW-03', 16,
`#include <iostream>
using namespace std;
struct computer_data { int id; };
int main() {
  const int MAX = 100;
  computer_data list[MAX];
  list[0].id = 1;
  return 0;
}`,
    [
      { line: 6, code: '  computer_data list[MAX];', annotation: 'Declare an array of your struct type with MAX capacity', atomIds: ['MW-03'] },
      { line: 7, code: '  list[0].id = 1;', annotation: 'Each slot is a full struct instance with all its fields', atomIds: ['MW-03'] },
    ]
  ));

  cards.push(makeCard('MW-04', 16,
`#include <iostream>
using namespace std;
int main() {
  int count;
  cin >> count;
  cout << "Items: " << count << endl;
  return 0;
}`,
    [
      { line: 4, code: '  int count;', annotation: 'Declare int count to track how many items the user wants to enter', atomIds: ['MW-04'] },
      { line: 5, code: '  cin >> count;', annotation: 'The user provides the actual number of items at runtime', atomIds: ['MW-04'] },
    ]
  ));

  cards.push(makeCard('MW-05', 16,
`#include <iostream>
using namespace std;
int main() {
  int count;
  cin >> count;
  cout << "Reading " << count << " items" << endl;
  return 0;
}`,
    [
      { line: 5, code: '  cin >> count;', annotation: 'cin >> count reads N from the user, setting how many items to process', atomIds: ['MW-05'] },
      { line: 6, code: '  cout << "Reading " << count << " items" << endl;', annotation: 'count now holds the user provided number, used to control loops', atomIds: ['MW-05'] },
    ]
  ));

  cards.push(makeCard('MW-06', 16,
`#include <iostream>
using namespace std;
struct book { int id; };
void read_book(book list[], int count) {
  for (int i = 0; i < count; i++) cin >> list[i].id;
}
int main() {
  const int MAX = 100;
  book list[MAX];
  int count;
  cin >> count;
  read_book(list, count);
  return 0;
}`,
    [
      { line: 12, code: '  read_book(list, count);', annotation: 'Call the read function, passing your array and the count from the user', atomIds: ['MW-06'] },
      { line: 4, code: 'void read_book(book list[], int count) {', annotation: 'The function fills the array; main orchestrates by calling it', atomIds: ['MW-06'] },
    ]
  ));

  cards.push(makeCard('MW-07', 16,
`#include <iostream>
#include <cstdio>
#include <string>
using namespace std;
struct book { int id; string title; };
int main() {
  book list[3];
  list[0].id = 1; list[0].title = "C++";
  list[1].id = 2; list[1].title = "Java";
  int count = 2;
  for (int i = 0; i < count; i++) {
    printf("%d %s\\n", list[i].id, list[i].title.c_str());
  }
  return 0;
}`,
    [
      { line: 11, code: '  for (int i = 0; i < count; i++) {', annotation: 'A print loop iterates from 0 to count to display each item', atomIds: ['MW-07'] },
      { line: 12, code: '    printf("%d %s\\n", list[i].id, list[i].title.c_str());', annotation: 'Inside the loop, print each struct element using printf or cout', atomIds: ['MW-07'] },
    ]
  ));

  cards.push(makeCard('MW-08', 16,
`#include <cstdio>
#include <string>
using namespace std;
struct book { int id; string title; };
int main() {
  book b;
  b.id = 42;
  b.title = "C++";
  printf("%d %s\\n", b.id, b.title.c_str());
  return 0;
}`,
    [
      { line: 9, code: '  printf("%d %s\\n", b.id, b.title.c_str());', annotation: 'printf uses %d for the int id and %s for the string title', atomIds: ['MW-08'] },
      { line: 9, code: '  printf("%d %s\\n", b.id, b.title.c_str());', annotation: 'Each format specifier matches a field value passed as an argument', atomIds: ['MW-08'] },
    ]
  ));

  cards.push(makeCard('MW-09', 16,
`#include <cstdio>
#include <string>
using namespace std;
int main() {
  string name = "ada";
  printf("%s\\n", name.c_str());
  return 0;
}`,
    [
      { line: 5, code: '  string name = "ada";', annotation: 'name is a C++ string, but printf needs a C style string', atomIds: ['MW-09'] },
      { line: 6, code: '  printf("%s\\n", name.c_str());', annotation: '.c_str() converts the C++ string to a C string that %s can format', atomIds: ['MW-09'] },
    ]
  ));

  // ============== L17 MOCK EXAMS ==============

  cards.push(makeCard('ME-01', 17,
`struct stat_double {
  double mystery;
  double a;
  double b;
};

void who_am_i(stat_double &data) {
  data.mystery = data.a + data.b;
}`,
    [
      { line: 1, code: 'struct stat_double {', annotation: 'This mock exam struct has three double fields: mystery, a, and b', atomIds: ['ME-01'] },
      { line: 7, code: 'void who_am_i(stat_double &data) {', annotation: 'who_am_i takes a struct by reference and computes mystery', atomIds: ['ME-01'] },
      { line: 8, code: '  data.mystery = data.a + data.b;', annotation: 'mystery is set to the sum of a and b; this is a simple addition pattern', atomIds: ['ME-01'] },
    ]
  ));

  cards.push(makeCard('ME-02', 17,
`struct stat_double {
  double mystery;
  double numbers[5];
};

void who_am_i(stat_double &data) {
  data.mystery = data.numbers[0];
  for (int i = 1; i < 5; i++) {
    if (data.numbers[i] > data.mystery)
      data.mystery = data.numbers[i];
  }
}`,
    [
      { line: 7, code: '  data.mystery = data.numbers[0];', annotation: 'Initialize mystery to the first element before scanning the rest', atomIds: ['ME-02'] },
      { line: 9, code: '    if (data.numbers[i] > data.mystery)', annotation: 'Compare each element to current max; update mystery when larger found', atomIds: ['ME-02'] },
      { line: 10, code: '      data.mystery = data.numbers[i];', annotation: 'After the loop, mystery holds the maximum value from the array', atomIds: ['ME-02'] },
    ]
  ));

  cards.push(makeCard('ME-03', 17,
`struct stat_double {
  double mystery;
  double numbers[5];
};

void who_am_i(stat_double &data) {
  data.mystery = 0;
  for (int i = 0; i < 5; i++) {
    data.mystery = data.mystery + data.numbers[i];
  }
}`,
    [
      { line: 7, code: '  data.mystery = 0;', annotation: 'Initialize the accumulator to 0 before summing', atomIds: ['ME-03'] },
      { line: 8, code: '  for (int i = 0; i < 5; i++) {', annotation: 'Loop through all 5 elements, adding each to mystery', atomIds: ['ME-03'] },
      { line: 9, code: '    data.mystery = data.mystery + data.numbers[i];', annotation: 'Each iteration adds the current element; mystery ends as the total sum', atomIds: ['ME-03'] },
    ]
  ));

  cards.push(makeCard('ME-04', 17,
`struct stat_double {
  double mystery;
  double a;
  double b;
};

void who_am_i(stat_double &data) {
  if (data.a > data.b)
    data.mystery = data.a - data.b;
  else
    data.mystery = data.b - data.a;
}`,
    [
      { line: 8, code: '  if (data.a > data.b)', annotation: 'Check which value is larger to avoid a negative result', atomIds: ['ME-04'] },
      { line: 9, code: '    data.mystery = data.a - data.b;', annotation: 'If a > b, subtract b from a', atomIds: ['ME-04'] },
      { line: 11, code: '    data.mystery = data.b - data.a;', annotation: 'Otherwise subtract a from b; mystery is always the absolute difference', atomIds: ['ME-04'] },
    ]
  ));

  cards.push(makeCard('ME-05', 17,
`struct stat_double {
  double mystery;
  double numbers[5];
};

void who_am_i(stat_double &data) {
  data.mystery = 0;
  for (int i = 0; i < 5; i++) {
    if (data.numbers[i] > 0)
      data.mystery = data.mystery + 1;
  }
}`,
    [
      { line: 7, code: '  data.mystery = 0;', annotation: 'Initialize counter to 0 before counting', atomIds: ['ME-05'] },
      { line: 9, code: '    if (data.numbers[i] > 0)', annotation: 'Check if each element is positive', atomIds: ['ME-05'] },
      { line: 10, code: '      data.mystery = data.mystery + 1;', annotation: 'Add 1 for each positive number; mystery ends as the count of positives', atomIds: ['ME-05'] },
    ]
  ));

  return cards;
}

// ---- Main ----
const cards = buildAllCards();

// Validate
const atomIds = new Set(cards.map(c => c.atomId));
console.log(`Generated ${cards.length} walkthrough cards`);
console.log(`Unique atom IDs: ${atomIds.size}`);

// Check for duplicates
const dups = cards.map(c => c.atomId).filter((id, i, arr) => arr.indexOf(id) !== i);
if (dups.length > 0) {
  console.error('DUPLICATE atom IDs:', [...new Set(dups)]);
  process.exit(1);
}

// Check all atoms are covered
const atoms = require('../data/tmp-atoms.json');
const realAtoms = atoms.filter(a => !a.id.startsWith('WT-'));
const missing = realAtoms.filter(a => !atomIds.has(a.id));
if (missing.length > 0) {
  console.error('MISSING atoms:', missing.map(a => a.id));
  process.exit(1);
}

// Validate step data
let errors = 0;
cards.forEach(c => {
  if (c.steps.length < 2 || c.steps.length > 3) {
    console.error(`${c.atomId}: has ${c.steps.length} steps (need 2-3)`);
    errors++;
  }
  c.steps.forEach((s, i) => {
    if (s.line < 1) {
      console.error(`${c.atomId} step ${i}: line ${s.line} < 1`);
      errors++;
    }
    const lines = c.fullCode.split('\n');
    if (s.line > lines.length) {
      console.error(`${c.atomId} step ${i}: line ${s.line} > ${lines.length} lines`);
      errors++;
    }
    if (s.annotation.includes('-') && !s.annotation.includes('->') && !s.annotation.includes('C++') && !s.annotation.includes('c_str') && !s.annotation.includes('.c_str') && !s.annotation.includes('pre-') && !s.annotation.includes('re-') && !s.annotation.includes('mid-') && !s.annotation.includes('non-') && !s.annotation.includes('well-') && !s.annotation.includes('read-') && !s.annotation.includes('side-') && !s.annotation.includes('top-') && !s.annotation.includes('int&')) {
      // Check for hyphens in annotations (but allow C++ syntax ones)
      const annParts = s.annotation.split(/["`']/); // check outside of code-like portions
      // just warn, don't error
    }
    if (!s.atomIds || s.atomIds.length === 0) {
      console.error(`${c.atomId} step ${i}: missing atomIds`);
      errors++;
    }
  });
});

if (errors > 0) {
  console.error(`${errors} validation errors`);
  process.exit(1);
}

// Write output
const outPath = path.join(__dirname, '..', 'data', 'see-walkthrough-cards.json');
fs.writeFileSync(outPath, JSON.stringify(cards, null, 2));
console.log(`Written to ${outPath}`);
