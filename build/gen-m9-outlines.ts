// One-shot script: write all 73 M9 foundation outlines.
// Run once: npx tsx build/gen-m9-outlines.ts
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
  mcq?: { stem: string; correct: string; distractors: [string, string, string] };
  l1_fill?: { template: string; blank_value: string };
  forbid?: string[];
}

const SPECS: OutlineSpec[] = [
  // === L-1 Pre-Programming (P-01..P-07) ===
  { dir: 'L-1', id: 'P-01', fact: 'computer runs programs', words: 3, level: -1, q_tags: { Q1: 'S', Q2: 'S', Q3: 'S', Q4: 'S' },
    seeds: ['computer executes programs', 'computers run software', 'CPU runs programs', 'machine runs program code', 'computer obeys instructions'] },
  { dir: 'L-1', id: 'P-02', fact: 'program is text instructions', words: 4, level: -1, deps: ['P-01'], q_tags: { Q1: 'S', Q2: 'S', Q3: 'S', Q4: 'S' },
    seeds: ['program is written instructions', 'programs are sequences of steps', 'instructions in text form', 'programs are text files', 'program = list of instructions'] },
  { dir: 'L-1', id: 'P-03', fact: 'source code is .cpp file', words: 5, level: -1, deps: ['P-02'], q_tags: { Q1: 'S', Q2: 'S', Q3: 'S', Q4: 'S' },
    seeds: ['source code lives in .cpp', 'C++ files end in cpp', '.cpp holds source code', 'source code = text in .cpp', 'we write code in .cpp files'] },
  { dir: 'L-1', id: 'P-04', fact: 'compiler converts source to exe', words: 5, level: -1, deps: ['P-03'], q_tags: { Q1: 'S', Q2: 'S', Q3: 'S', Q4: 'S' },
    seeds: ['compiler turns code into program', 'g++ compiles source to exe', 'compiler builds the executable', 'source becomes runnable via compiler', 'compile = source → exe'] },
  { dir: 'L-1', id: 'P-05', fact: 'running exe executes instructions', words: 4, level: -1, deps: ['P-04'], q_tags: { Q1: 'S', Q2: 'S', Q3: 'S', Q4: 'S' },
    seeds: ['running an exe runs the code', 'execute = follow each instruction', 'CPU runs each line in order', 'running executes the program', 'exe steps through instructions'] },
  { dir: 'L-1', id: 'P-06', fact: 'output appears in terminal', words: 4, level: -1, deps: ['P-05'], q_tags: { Q1: 'S', Q2: 'S', Q3: 'S', Q4: 'S' },
    seeds: ['program prints to terminal', 'output goes to console', 'terminal shows program output', 'cout writes to terminal', 'print results to terminal'] },
  { dir: 'L-1', id: 'P-07', fact: 'input typed in terminal', words: 4, level: -1, deps: ['P-05'], q_tags: { Q1: 'S', Q2: 'S', Q3: 'S', Q4: 'S' },
    seeds: ['user types input at terminal', 'cin reads typed input', 'keyboard input via terminal', 'terminal reads what user types', 'input typed into console'] },

  // === L02 Variables + Types (V-01..V-20) ===
  { dir: 'L02', id: 'V-01', fact: 'variable is named memory box', words: 5, level: 2, q_tags: { Q1: 'C', Q2: 'C', Q3: 'C', Q4: 'C' },
    seeds: ['variable = memory box with name', 'variable is labeled storage', 'variable holds one value', 'name + box = variable', 'variable stores a value'] },
  { dir: 'L02', id: 'V-02', fact: 'variable has a name', words: 4, level: 2, deps: ['V-01'], q_tags: { Q1: 'C', Q2: 'C', Q3: 'C', Q4: 'C' },
    seeds: ['name identifies the variable', 'each variable has unique name', 'name is how we refer to it', 'variable is named', 'name = variable identifier'] },
  { dir: 'L02', id: 'V-03', fact: 'variable has a type', words: 4, level: 2, deps: ['V-01'], q_tags: { Q1: 'C', Q2: 'C', Q3: 'C', Q4: 'C' },
    seeds: ['type defines what value fits', 'each variable has a type', 'type sets the kind of value', 'type = int, double, string, etc.', 'type chosen at declaration'] },
  { dir: 'L02', id: 'V-04', fact: 'declare with type name;', words: 4, level: 2, deps: ['V-02', 'V-03'], q_tags: { Q1: 'C', Q2: 'C', Q3: 'C', Q4: 'C' },
    seeds: ['type name; declares variable', 'declaration: type then name', 'int x; declares an int', 'syntax: type then name then ;', 'declare with type then name'],
    l1_fill: { template: '___ x;  // declare an int', blank_value: 'int' } },
  { dir: 'L02', id: 'V-05', fact: 'initialize: type name = value;', words: 4, level: 2, deps: ['V-04'], q_tags: { Q1: 'C', Q2: 'N', Q3: 'C', Q4: 'C' },
    seeds: ['init at declaration with =', 'type name = value sets initial', 'int x = 5; both declares and inits', 'declaration plus assignment', 'one line: declare and assign'] },
  { dir: 'L02', id: 'V-06', fact: 'read: cout << name;', words: 3, level: 2, deps: ['V-04'], q_tags: { Q1: 'N', Q2: 'N', Q3: 'S', Q4: 'S' },
    seeds: ['read variable to print', 'cout << name shows value', 'use name in expression to read', 'reading uses the name', 'access variable by name'] },
  { dir: 'L02', id: 'V-07', fact: 'write: name = newValue;', words: 3, level: 2, deps: ['V-04'], q_tags: { Q1: 'C', Q2: 'N', Q3: 'C', Q4: 'C' },
    seeds: ['= writes new value', 'name = expr assigns', 'assignment overwrites the value', 'write to variable with =', 'name = value updates the box'] },
  { dir: 'L02', id: 'V-08', fact: '= is assignment, not equality', words: 5, level: 2, deps: ['V-07'], q_tags: { Q1: 'C', Q2: 'N', Q3: 'C', Q4: 'C' },
    seeds: ['= assigns; == compares', 'single = is assignment', 'don\'t confuse = with ==', 'assign vs equality: = vs ==', '= writes; == reads boolean'] },
  { dir: 'L02', id: 'V-09', fact: 'declare before use', words: 3, level: 2, deps: ['V-04'], q_tags: { Q1: 'C', Q2: 'C', Q3: 'C', Q4: 'C' },
    seeds: ['must declare first', 'declaration precedes use', 'cannot use undeclared variable', 'always declare first', 'compiler needs declaration first'] },
  { dir: 'L02', id: 'V-10', fact: 'int holds whole numbers', words: 4, level: 2, deps: ['V-03'], q_tags: { Q1: 'C', Q2: 'C', Q3: 'C', Q4: 'C' },
    seeds: ['int = whole numbers', 'int stores integers', 'integers like 5 -3 0 fit in int', 'int has no decimal part', 'int = -2 -1 0 1 2 ...'] },
  { dir: 'L02', id: 'V-11', fact: 'double holds decimals', words: 3, level: 2, deps: ['V-03'], q_tags: { Q1: 'C', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['double stores decimals', 'double = floating-point number', '3.14 is a double', 'double has fractional part', 'use double for non-integer'] },
  { dir: 'L02', id: 'V-12', fact: 'string holds text', words: 3, level: 2, deps: ['V-03'], q_tags: { Q1: 'N', Q2: 'C', Q3: 'C', Q4: 'C' },
    seeds: ['string stores text', 'string = sequence of characters', 'use string for words sentences', '"hello" is a string', 'string holds many chars'] },
  { dir: 'L02', id: 'V-13', fact: 'bool holds true or false', words: 5, level: 2, deps: ['V-03'], q_tags: { Q1: 'S', Q2: 'N', Q3: 'S', Q4: 'S' },
    seeds: ['bool = true or false', 'boolean truth value', 'bool stores yes/no', 'bool comes from comparison', 'true and false are bool'] },
  { dir: 'L02', id: 'V-14', fact: 'char holds one letter', words: 4, level: 2, deps: ['V-03'], q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['char = single character', 'char stores one letter', 'single-quoted: \'a\' is char', 'char is one byte typically', 'char fits one symbol'] },
  { dir: 'L02', id: 'V-15', fact: '5 is int literal', words: 4, level: 2, deps: ['V-10'], q_tags: { Q1: 'C', Q2: 'N', Q3: 'C', Q4: 'C' },
    seeds: ['5 = int literal value', 'whole number literal is int', 'int literal: 0 1 -3 100', 'plain numbers are ints', '5 in code is int literal'] },
  { dir: 'L02', id: 'V-16', fact: '3.14 is double literal', words: 4, level: 2, deps: ['V-11'], q_tags: { Q1: 'C', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['3.14 = double literal', 'decimal literal is double', 'literal with dot is double', '3.14 fits in double', 'numbers with decimals are doubles'] },
  { dir: 'L02', id: 'V-17', fact: '"hi" is string literal', words: 4, level: 2, deps: ['V-12'], q_tags: { Q1: 'N', Q2: 'C', Q3: 'C', Q4: 'C' },
    seeds: ['"hi" = string literal', 'double-quoted text is string', 'string literal: "hello"', 'quotes make string literals', 'text in "..." is string'] },
  { dir: 'L02', id: 'V-18', fact: "'a' is char literal", words: 4, level: 2, deps: ['V-14'], q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ["'a' = char literal", 'single quotes make char', 'char literal in single quotes', "'b' is one char", 'single-quote each char'] },
  { dir: 'L02', id: 'V-19', fact: 'true and false are bool literals', words: 6, level: 2, deps: ['V-13'], q_tags: { Q1: 'S', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['true and false bool values', 'literal true / false', 'true = 1, false = 0', 'bool literals: true, false', 'two bool literal values'] },
  { dir: 'L02', id: 'V-20', fact: 'string needs <string> include', words: 4, level: 2, deps: ['V-12'], q_tags: { Q1: 'N', Q2: 'C', Q3: 'C', Q4: 'C' },
    seeds: ['#include <string> for string', 'string requires <string> header', 'add <string> to use string', 'string needs the string header', 'forgetting <string> = compile error'] },

  // === L04 Operators (A-01..A-11) ===
  { dir: 'L04', id: 'A-01', fact: '+ adds', words: 2, level: 4, deps: ['V-10'], q_tags: { Q1: 'C', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['+ adds two numbers', 'plus operator sums', 'a + b = sum', 'addition uses +', 'use + for sum'] },
  { dir: 'L04', id: 'A-02', fact: '- subtracts', words: 2, level: 4, deps: ['V-10'], q_tags: { Q1: 'S', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['- subtracts second from first', 'minus operator subtracts', 'a - b = difference', 'subtraction uses -', 'use - for difference'] },
  { dir: 'L04', id: 'A-03', fact: '* multiplies', words: 2, level: 4, deps: ['V-10'], q_tags: { Q1: 'S', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['* multiplies two numbers', 'star operator multiplies', 'a * b = product', 'multiplication uses *', 'use * for product'] },
  { dir: 'L04', id: 'A-04', fact: '/ divides', words: 2, level: 4, deps: ['V-10'], q_tags: { Q1: 'S', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['/ divides first by second', 'slash operator divides', 'a / b = quotient', 'division uses /', 'use / for quotient'] },
  { dir: 'L04', id: 'A-05', fact: '% gives remainder', words: 3, level: 4, deps: ['A-04'], q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['% computes modulo remainder', 'a % b = leftover', '% returns division remainder', 'modulo uses %', 'use % for remainder'] },
  { dir: 'L04', id: 'A-06', fact: 'int division truncates', words: 3, level: 4, deps: ['A-04'], q_tags: { Q1: 'S', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['int / int drops decimal', 'int division throws away fraction', '7 / 2 = 3 not 3.5', 'int / int = int', 'int division floors toward zero'] },
  { dir: 'L04', id: 'A-07', fact: '* / % before + -', words: 5, level: 4, deps: ['A-01', 'A-03'], q_tags: { Q1: 'S', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['multiply divide before add subtract', 'precedence: * / % before + -', '* / % bind tighter than + -', 'PEMDAS-style ordering', 'higher precedence: * / %'] },
  { dir: 'L04', id: 'A-08', fact: '() overrides operator order', words: 4, level: 4, deps: ['A-07'], q_tags: { Q1: 'S', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['parens override precedence', '() forces evaluation order', 'use () to control order', 'parens evaluate first', '() group expressions'] },
  { dir: 'L04', id: 'A-09', fact: '+= -= *= /= update', words: 5, level: 4, deps: ['A-01', 'V-07'], q_tags: { Q1: 'S', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['+= adds then assigns', 'compound assign: x += y', '+= -= *= /= modify in place', 'shortcut: x += 1 means x = x+1', 'update with += -= *= /='] },
  { dir: 'L04', id: 'A-10', fact: '++ adds 1', words: 3, level: 4, deps: ['A-01', 'V-07'], q_tags: { Q1: 'C', Q2: 'N', Q3: 'C', Q4: 'C' },
    seeds: ['++ increments by 1', 'i++ adds one to i', '++ = +1 to variable', 'increment with ++', '++ used in for-loops'] },
  { dir: 'L04', id: 'A-11', fact: '-- subtracts 1', words: 3, level: 4, deps: ['A-02', 'V-07'], q_tags: { Q1: 'S', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['-- decrements by 1', 'i-- subtracts one from i', '-- = -1 to variable', 'decrement with --', 'opposite of ++'] },

  // === L05 Comparison + Logical (C-01..C-07 + L-01..L-03) ===
  { dir: 'L05', id: 'C-01', fact: '== tests equality', words: 3, level: 5, deps: ['V-13'], q_tags: { Q1: 'S', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['== checks equal', 'a == b is true if equal', '== returns bool', 'use == not = for compare', 'equality test'] },
  { dir: 'L05', id: 'C-02', fact: '!= tests not equal', words: 4, level: 5, deps: ['V-13'], q_tags: { Q1: 'S', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['!= = not equal', 'a != b true if differ', '! negates =', '!= opposite of ==', 'inequality test'] },
  { dir: 'L05', id: 'C-03', fact: '< less than', words: 3, level: 5, deps: ['V-13'], q_tags: { Q1: 'C', Q2: 'N', Q3: 'C', Q4: 'C' },
    seeds: ['< less-than test', 'a < b true if a smaller', 'less-than operator', '< compares numerically', '< for ordered types'] },
  { dir: 'L05', id: 'C-04', fact: '> greater than', words: 3, level: 5, deps: ['V-13'], q_tags: { Q1: 'C', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['> greater-than test', 'a > b true if a bigger', 'greater-than operator', '> compares numerically', 'opposite of <'] },
  { dir: 'L05', id: 'C-05', fact: '<= less or equal', words: 4, level: 5, deps: ['V-13'], q_tags: { Q1: 'S', Q2: 'N', Q3: 'S', Q4: 'S' },
    seeds: ['<= less-than-or-equal', 'a <= b includes equal', 'use <= for inclusive', '<= = < or ==', 'no space in <='] },
  { dir: 'L05', id: 'C-06', fact: '>= greater or equal', words: 4, level: 5, deps: ['V-13'], q_tags: { Q1: 'S', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['>= greater-than-or-equal', 'a >= b includes equal', 'use >= for inclusive', '>= = > or ==', 'no space in >='] },
  { dir: 'L05', id: 'C-07', fact: 'comparison returns bool', words: 3, level: 5, deps: ['V-13'], q_tags: { Q1: 'C', Q2: 'N', Q3: 'C', Q4: 'C' },
    seeds: ['compare → true or false', 'comparisons return bool', '< > == produce bool', 'result is true/false', 'comparison yields boolean'] },
  { dir: 'L05', id: 'L-01', fact: '&& is AND', words: 3, level: 5, deps: ['V-13'], q_tags: { Q1: 'S', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['&& logical AND', 'both true → && true', 'a && b means both', '&& joins conditions', 'use && for AND'] },
  { dir: 'L05', id: 'L-02', fact: '|| is OR', words: 3, level: 5, deps: ['V-13'], q_tags: { Q1: 'S', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['|| logical OR', 'either true → || true', 'a || b means either', '|| joins conditions', 'use || for OR'] },
  { dir: 'L05', id: 'L-03', fact: '! is NOT', words: 3, level: 5, deps: ['V-13'], q_tags: { Q1: 'S', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['! logical NOT', '! negates a bool', '!true = false', '! flips bool value', 'use ! to invert'] },

  // === L06 Conditionals (F-01..F-05) ===
  { dir: 'L06', id: 'F-01', fact: 'if (cond) runs body', words: 4, level: 6, deps: ['C-07'], q_tags: { Q1: 'C', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['if (cond) { body } runs body if true', 'if statement = conditional', 'if: run body when true', 'use if for branching', 'if (cond) executes body'] },
  { dir: 'L06', id: 'F-02', fact: 'else runs otherwise', words: 3, level: 6, deps: ['F-01'], q_tags: { Q1: 'S', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['else for false branch', 'else runs when if false', 'pair with if', 'else = otherwise', 'else covers the false path'] },
  { dir: 'L06', id: 'F-03', fact: 'else if chains conditions', words: 4, level: 6, deps: ['F-02'], q_tags: { Q1: 'S', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['else if for chained tests', 'multiple branches via else if', 'else if checks next condition', 'chain conditions with else if', 'use else if to add cases'] },
  { dir: 'L06', id: 'F-04', fact: 'condition must be bool', words: 4, level: 6, deps: ['F-01'], q_tags: { Q1: 'C', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['if needs a boolean', 'cond is bool expression', 'if (true) or if (a < b)', 'condition evaluates to bool', 'must produce true or false'] },
  { dir: 'L06', id: 'F-05', fact: 'use {} even one line', words: 5, level: 6, deps: ['F-01'], q_tags: { Q1: 'S', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['always wrap body in {}', '{} for one-line body too', 'safer to always use braces', 'avoid dangling-else with {}', 'braces even for single statement'] },

  // === L07 Loops (W-01..W-10) ===
  { dir: 'L07', id: 'W-01', fact: 'while (cond) repeats body', words: 4, level: 7, deps: ['F-04'], q_tags: { Q1: 'S', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['while loop runs while true', 'while (cond) { body } repeats', 'while = conditional loop', 'use while for unknown count', 'while keeps looping while true'] },
  { dir: 'L07', id: 'W-02', fact: 'do { body } while runs once first', words: 7, level: 7, deps: ['W-01'], q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['do-while runs body first', 'check after first iteration', 'guarantees one execution', 'do-while = post-condition', 'body runs at least once'] },
  { dir: 'L07', id: 'W-03', fact: 'for (init; cond; step) loop', words: 5, level: 7, deps: ['W-01', 'V-05', 'A-10'], q_tags: { Q1: 'C', Q2: 'N', Q3: 'C', Q4: 'C' },
    seeds: ['for (init; cond; step) { body }', 'for-loop with three parts', 'for combines init cond step', 'use for when count known', 'standard counting loop'] },
  { dir: 'L07', id: 'W-04', fact: 'init runs once', words: 3, level: 7, deps: ['W-03'], q_tags: { Q1: 'C', Q2: 'N', Q3: 'C', Q4: 'C' },
    seeds: ['init runs only once', 'first part: init once', 'init sets up loop var', 'init not repeated', 'init at the start'] },
  { dir: 'L07', id: 'W-05', fact: 'cond checked before each iter', words: 5, level: 7, deps: ['W-03'], q_tags: { Q1: 'C', Q2: 'N', Q3: 'C', Q4: 'C' },
    seeds: ['cond tested at top of iter', 'check cond each loop pass', 'cond decides continue or stop', 'before body: cond check', 'cond gate the body'] },
  { dir: 'L07', id: 'W-06', fact: 'step runs after each iter', words: 5, level: 7, deps: ['W-03'], q_tags: { Q1: 'C', Q2: 'N', Q3: 'C', Q4: 'C' },
    seeds: ['step runs after body', 'step = i++ usually', 'step at end of each iter', 'step updates the loop var', 'step before next cond check'] },
  { dir: 'L07', id: 'W-07', fact: 'break exits loop', words: 3, level: 7, deps: ['W-01'], q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['break stops the loop', 'break = early exit', 'jump out via break', 'break leaves immediately', 'break ends the loop'] },
  { dir: 'L07', id: 'W-08', fact: 'continue skips to next iter', words: 5, level: 7, deps: ['W-01'], q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['continue jumps to next iter', 'continue skips remaining body', 'continue = skip rest', 'goto next loop pass', 'continue advances to step'] },
  { dir: 'L07', id: 'W-09', fact: 'nested loops allowed', words: 3, level: 7, deps: ['W-03'], q_tags: { Q1: 'S', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['loop inside loop', 'nest for-loops freely', 'inner loop runs each outer iter', 'nested = loop within loop', 'multiple levels of looping'] },
  { dir: 'L07', id: 'W-10', fact: 'infinite loop if cond never false', words: 6, level: 7, deps: ['W-01', 'F-04'], q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['cond never false = infinite', 'infinite loop traps program', 'always check cond changes', 'forgetting i++ → infinite', 'always update loop var'] },

  // === L08 Functions (H-01..H-10) ===
  { dir: 'L08', id: 'H-01', fact: 'function = named code block', words: 5, level: 8, q_tags: { Q1: 'C', Q2: 'N', Q3: 'C', Q4: 'C' },
    seeds: ['function is named code', 'function bundles code', 'reusable named block', 'function = group of statements', 'name + body = function'] },
  { dir: 'L08', id: 'H-02', fact: 'returnType name(params) { body }', words: 4, level: 8, deps: ['H-01', 'V-04'], q_tags: { Q1: 'C', Q2: 'N', Q3: 'C', Q4: 'C' },
    seeds: ['signature: returnType name(params)', 'function header has type and name', 'returnType name(params) { body }', 'declare function with signature', 'header then body in {}'] },
  { dir: 'L08', id: 'H-03', fact: 'call: name(args);', words: 3, level: 8, deps: ['H-02'], q_tags: { Q1: 'C', Q2: 'N', Q3: 'S', Q4: 'C' },
    seeds: ['call function: name(args)', 'parens after name = call', 'call with arguments', 'name(args) executes body', 'invoke a function'] },
  { dir: 'L08', id: 'H-04', fact: 'parameters become local boxes', words: 4, level: 8, deps: ['H-02', 'V-01'], q_tags: { Q1: 'C', Q2: 'N', Q3: 'C', Q4: 'C' },
    seeds: ['params are local variables', 'each param gets its own box', 'arguments fill param boxes', 'params live in function scope', 'param = local copy by default'] },
  { dir: 'L08', id: 'H-05', fact: 'return value; sends back', words: 4, level: 8, deps: ['H-02'], q_tags: { Q1: 'S', Q2: 'N', Q3: 'N', Q4: 'C' },
    seeds: ['return ends function with value', 'return sends a value back', 'caller receives returned value', 'use return for output', 'return exits the function'] },
  { dir: 'L08', id: 'H-06', fact: 'void = no return value', words: 5, level: 8, deps: ['H-02'], q_tags: { Q1: 'C', Q2: 'N', Q3: 'C', Q4: 'N' },
    seeds: ['void function returns nothing', 'use void when no value', 'void = silent function', 'void f() returns no value', 'no return needed if void'] },
  { dir: 'L08', id: 'H-07', fact: 'declare before use (or prototype)', words: 5, level: 8, deps: ['H-02'], q_tags: { Q1: 'S', Q2: 'N', Q3: 'S', Q4: 'S' },
    seeds: ['function must be declared first', 'declare or prototype above use', 'put functions before main()', 'compiler reads top-down', 'pre-declare via prototype'] },
  { dir: 'L08', id: 'H-08', fact: 'prototype: returnType name(types);', words: 4, level: 8, deps: ['H-07'], q_tags: { Q1: 'N', Q2: 'N', Q3: 'N', Q4: 'N' },
    seeds: ['prototype declares without body', 'prototype ends with semicolon', 'no body in prototype', 'forward-declare with prototype', 'prototype = signature only'] },
  { dir: 'L08', id: 'H-09', fact: 'locals die at return', words: 5, level: 8, deps: ['H-04'], q_tags: { Q1: 'C', Q2: 'N', Q3: 'S', Q4: 'S' },
    seeds: ['locals end at return', 'after return locals gone', 'function-local lifetime', 'frame popped on return', 'locals don\'t escape function'] },
  { dir: 'L08', id: 'H-10', fact: 'caller cannot see locals', words: 5, level: 8, deps: ['H-04'], q_tags: { Q1: 'C', Q2: 'N', Q3: 'S', Q4: 'S' },
    seeds: ['locals are private to function', 'caller has no access', 'scope rules block external access', 'each frame isolated', 'locals not visible outside'] },
];

function emit(spec: OutlineSpec): string {
  const lines: string[] = [];
  lines.push(`id: ${spec.id}`);
  lines.push(`fact: ${JSON.stringify(spec.fact)}`);
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
    lines.push(`    - ${JSON.stringify(s)}`);
  }
  if (spec.l1_fill) {
    lines.push(`  write_L1_fill:`);
    lines.push(`    template: ${JSON.stringify(spec.l1_fill.template)}`);
    lines.push(`    blank_value: ${JSON.stringify(spec.l1_fill.blank_value)}`);
  }
  if (spec.mcq) {
    lines.push(`  mcq:`);
    lines.push(`    stem: ${JSON.stringify(spec.mcq.stem)}`);
    lines.push(`    correct: ${JSON.stringify(spec.mcq.correct)}`);
    lines.push(`    distractors:`);
    for (const d of spec.mcq.distractors) {
      lines.push(`      - ${JSON.stringify(d)}`);
    }
  }
  lines.push(`acceptance:`);
  lines.push(`  memorize: ["≤7 words"]`);
  lines.push(`lint:`);
  if (spec.forbid && spec.forbid.length > 0) {
    lines.push(`  forbid_tokens: [${spec.forbid.map((t) => JSON.stringify(t)).join(', ')}]`);
  }
  lines.push(`  miller_max_words: 7`);
  lines.push(`status: locked`);
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
