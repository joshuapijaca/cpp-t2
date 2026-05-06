#!/usr/bin/env node
/**
 * audit-trace-cards.js
 * Audits every trace card in data/cards.json for correctness.
 * Reports issues WITHOUT modifying the file.
 */

const fs = require('fs');
const path = require('path');

const cardsPath = path.join(__dirname, 'data', 'cards.json');
const cards = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));
const traceCards = cards.filter(c => c.type === 'trace');

console.log(`Auditing ${traceCards.length} trace cards...\n`);

const issues = [];
let cardIndex = 0;

// ─── Tiny C++ simulator ───────────────────────────────────────────────────────

/**
 * Tokenise a single C++ expression into its constituent parts.
 * Returns {value, type} where type is 'int','double','string','bool','char'.
 */
function parseValue(s) {
  s = s.trim();
  if (s === 'true') return { value: 1, type: 'bool' };
  if (s === 'false') return { value: 0, type: 'bool' };
  if (/^-?\d+\.\d+$/.test(s)) return { value: parseFloat(s), type: 'double' };
  if (/^-?\d+$/.test(s)) return { value: parseInt(s, 10), type: 'int' };
  if (/^"(.*)"$/.test(s)) return { value: s.slice(1, -1), type: 'string' };
  if (/^'(.)'$/.test(s)) return { value: s[1], type: 'char' };
  return null;
}

/**
 * Evaluate a C++ expression in the context of known variables.
 * Handles: arithmetic, comparisons, pre/post increment/decrement,
 * ternary, string concatenation, struct member access, pointer deref.
 *
 * Returns computed value (JS number/string/boolean), or UNEVALUATED sentinel.
 */
const UNEVALUATED = Symbol('UNEVALUATED');

function evalExpr(expr, vars) {
  expr = expr.trim();

  // Null/nullptr
  if (expr === 'nullptr' || expr === 'NULL') return 0;

  // Boolean literals
  if (expr === 'true') return 1;
  if (expr === 'false') return 0;

  // Numeric literal (int or double)
  if (/^-?\d+\.\d+$/.test(expr)) return parseFloat(expr);
  if (/^-?\d+$/.test(expr)) return parseInt(expr, 10);

  // String literal
  if (/^".*"$/.test(expr)) return expr.slice(1, -1);

  // Char literal
  if (/^'.'$/.test(expr)) return expr[1];

  // sizeof(type) – common patterns
  if (/^sizeof\s*\(/.test(expr)) {
    const inner = expr.replace(/^sizeof\s*\(/, '').replace(/\)$/, '').trim();
    const sizeMap = { int: 4, double: 8, char: 1, float: 4, long: 8, short: 2, bool: 1 };
    if (sizeMap[inner] !== undefined) return sizeMap[inner];
    return UNEVALUATED;
  }

  // Pointer dereference *ptr
  if (/^\*[a-zA-Z_]\w*$/.test(expr)) {
    const ptrName = expr.slice(1);
    const ptrVal = vars[ptrName];
    // If we stored the pointed-to variable name in the pointer
    if (typeof ptrVal === 'string' && vars[ptrVal] !== undefined) return vars[ptrVal];
    return UNEVALUATED;
  }

  // Address-of &var (we just note it as a reference to variable)
  if (/^&[a-zA-Z_]\w*$/.test(expr)) return UNEVALUATED;

  // Pre-increment/decrement: ++x, --x
  if (/^\+\+[a-zA-Z_][\w.]*$/.test(expr)) {
    const vname = expr.slice(2);
    if (vars[vname] !== undefined) {
      vars[vname] = Number(vars[vname]) + 1;
      return vars[vname];
    }
    return UNEVALUATED;
  }
  if (/^--[a-zA-Z_][\w.]*$/.test(expr)) {
    const vname = expr.slice(2);
    if (vars[vname] !== undefined) {
      vars[vname] = Number(vars[vname]) - 1;
      return vars[vname];
    }
    return UNEVALUATED;
  }

  // Post-increment: x++, x--
  if (/^[a-zA-Z_][\w.]*\+\+$/.test(expr)) {
    const vname = expr.slice(0, -2);
    if (vars[vname] !== undefined) {
      const old = Number(vars[vname]);
      vars[vname] = old + 1;
      return old;
    }
    return UNEVALUATED;
  }
  if (/^[a-zA-Z_][\w.]*--$/.test(expr)) {
    const vname = expr.slice(0, -2);
    if (vars[vname] !== undefined) {
      const old = Number(vars[vname]);
      vars[vname] = old - 1;
      return old;
    }
    return UNEVALUATED;
  }

  // Unary negation: -x
  if (/^-[a-zA-Z_][\w.]*$/.test(expr)) {
    const vname = expr.slice(1);
    if (vars[vname] !== undefined) return -Number(vars[vname]);
    return UNEVALUATED;
  }

  // Unary not: !x
  if (/^![a-zA-Z_][\w.]*$/.test(expr)) {
    const vname = expr.slice(1);
    if (vars[vname] !== undefined) return Number(vars[vname]) === 0 ? 1 : 0;
    return UNEVALUATED;
  }

  // Cast: (int)x, (double)x
  const castMatch = expr.match(/^\((\w+)\)\s*(.+)$/);
  if (castMatch) {
    const castType = castMatch[1];
    const castExpr = castMatch[2];
    const inner = evalExpr(castExpr, vars);
    if (inner === UNEVALUATED) return UNEVALUATED;
    if (castType === 'int') return Math.trunc(Number(inner));
    if (castType === 'double' || castType === 'float') return Number(inner);
    if (castType === 'char') return String.fromCharCode(Number(inner));
    return inner;
  }

  // Variable lookup (including struct member access like a.x, p->x)
  // Convert ptr->member to ptr.member for lookup
  const normalised = expr.replace(/->/g, '.');
  if (/^[a-zA-Z_][\w.]*$/.test(normalised)) {
    if (vars[normalised] !== undefined) return vars[normalised];
    // Try array/vector size: v.size(), s.length(), s.size()
    return UNEVALUATED;
  }

  // Ternary: cond ? a : b
  const ternaryMatch = expr.match(/^(.+?)\s*\?\s*(.+?)\s*:\s*(.+)$/);
  if (ternaryMatch) {
    const cond = evalExpr(ternaryMatch[1], vars);
    if (cond === UNEVALUATED) return UNEVALUATED;
    return cond ? evalExpr(ternaryMatch[2], vars) : evalExpr(ternaryMatch[3], vars);
  }

  // Parenthesised expression
  if (/^\(.*\)$/.test(expr)) {
    return evalExpr(expr.slice(1, -1), vars);
  }

  // Binary operations – split carefully respecting precedence
  // We handle: + - * / % == != < > <= >= && || << >>
  // Simple recursive split on lowest-precedence operator
  const binResult = evalBinary(expr, vars);
  if (binResult !== UNEVALUATED) return binResult;

  return UNEVALUATED;
}

/** Split a binary expression at the lowest-precedence operator outside parens/brackets. */
function evalBinary(expr, vars) {
  // Operator precedence (lower index = lower precedence = split first)
  const opGroups = [
    ['||'],
    ['&&'],
    ['==', '!='],
    ['<=', '>=', '<', '>'],
    ['+', '-'],
    ['*', '/', '%'],
  ];

  for (const ops of opGroups) {
    for (const op of ops) {
      const idx = findOperator(expr, op);
      if (idx !== -1) {
        const left = expr.slice(0, idx).trim();
        const right = expr.slice(idx + op.length).trim();
        if (!left || !right) continue;
        const lv = evalExpr(left, vars);
        const rv = evalExpr(right, vars);
        if (lv === UNEVALUATED || rv === UNEVALUATED) return UNEVALUATED;
        switch (op) {
          case '+': return (typeof lv === 'string' || typeof rv === 'string')
            ? String(lv) + String(rv)
            : lv + rv;
          case '-': return Number(lv) - Number(rv);
          case '*': return Number(lv) * Number(rv);
          case '/': {
            const n = Number(lv), d = Number(rv);
            if (d === 0) return UNEVALUATED;
            // Integer division if both look like integers
            if (Number.isInteger(n) && Number.isInteger(d)) return Math.trunc(n / d);
            return n / d;
          }
          case '%': {
            const n = Number(lv), d = Number(rv);
            if (!Number.isInteger(n) || !Number.isInteger(d)) return UNEVALUATED;
            return ((n % d) + d) % d; // match C++ behaviour for positive operands
          }
          case '==': return (lv == rv) ? 1 : 0;
          case '!=': return (lv != rv) ? 1 : 0;
          case '<': return (Number(lv) < Number(rv)) ? 1 : 0;
          case '>': return (Number(lv) > Number(rv)) ? 1 : 0;
          case '<=': return (Number(lv) <= Number(rv)) ? 1 : 0;
          case '>=': return (Number(lv) >= Number(rv)) ? 1 : 0;
          case '&&': return (lv && rv) ? 1 : 0;
          case '||': return (lv || rv) ? 1 : 0;
        }
      }
    }
  }
  return UNEVALUATED;
}

/** Find the rightmost occurrence of `op` at depth 0 (outside parens/quotes). */
function findOperator(expr, op) {
  let depth = 0, inStr = false, strChar = '';
  // Scan right-to-left so we split on rightmost (left-assoc)
  for (let i = expr.length - op.length; i >= 0; i--) {
    const ch = expr[i];
    if (!inStr) {
      if (ch === ')' || ch === ']') depth++;
      if (ch === '(' || ch === '[') depth--;
      if (ch === '"' || ch === "'") { inStr = true; strChar = ch; continue; }
    } else {
      if (ch === strChar && expr[i - 1] !== '\\') inStr = false;
      continue;
    }
    if (depth === 0 && expr.slice(i, i + op.length) === op) {
      // Don't match partial operators: e.g. '<' must not match '<='
      const after = expr[i + op.length];
      const before = i > 0 ? expr[i - 1] : ' ';
      // For single-char operators, ensure they're not part of a 2-char op
      if (op === '<' && (after === '=' || after === '<')) continue;
      if (op === '>' && (after === '=' || after === '>')) continue;
      if (op === '!' && after === '=') continue;
      if (op === '=' && (after === '=' || before === '!' || before === '<' || before === '>' || before === '=')) continue;
      if (op === '+' && after === '+') continue;
      if (op === '+' && before === '+') continue;
      if (op === '-' && after === '-') continue;
      if (op === '-' && before === '-') continue;
      if (op === '&' && after === '&') continue;
      if (op === '|' && after === '|') continue;
      return i;
    }
  }
  return -1;
}

// ─── C++ Code Simulator ──────────────────────────────────────────────────────

/**
 * Simulate a simple C++ program (no loops for now — most trace cards are linear).
 * Returns { vars: Map<string,value>, output: string[], steps: [{line,variable,value}] }
 *
 * Limitations (flagged in issues if we can't handle):
 * - No heap allocation
 * - No complex loops (simple for/while with literal bounds are OK)
 * - No switch
 * - No recursion
 * - No STL beyond basic cout
 */
function simulateCpp(code, trackedVars) {
  const lines = code.split('\n');
  const vars = {};       // variable state
  const output = [];     // cout segments (we assemble lines from these)
  const steps = [];      // { line, variable, value }
  let currentOutputLine = ''; // accumulate cout without newline
  const stack = [];      // call stack frames (for functions)
  let UNSUPPORTED = false;

  // Extract function definitions so we can inline-call them
  const funcDefs = extractFunctions(code);

  // Determine the line-number offset for main() body
  // We'll simulate all lines sequentially within main, then return
  let mainStart = null;
  for (let i = 0; i < lines.length; i++) {
    if (/int\s+main\s*\(/.test(lines[i])) { mainStart = i; break; }
  }

  // ── run lines ───────────────────────────────────────────────────────────────
  function runLines(lineArr, baseLineNum, localVars, depth) {
    if (depth > 10) { UNSUPPORTED = true; return; }
    let i = 0;
    while (i < lineArr.length) {
      const rawLine = lineArr[i];
      const ln = baseLineNum + i + 1; // 1-based
      const line = rawLine.trim();
      i++;

      // Skip blank lines, comments, preprocessor, using, braces-only, return 0
      if (!line || /^\/\//.test(line) || /^#/.test(line) || /^using\s/.test(line)
        || line === '{' || line === '}' || /^return\s+0/.test(line) || /^return;/.test(line)) continue;

      // Function call (void return) — detect standalone calls like f(a); or f(&a);
      // But NOT declarations like int x = f(a);
      const standaloneFuncCall = line.match(/^([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*;$/);
      if (standaloneFuncCall && !isDeclarationLine(line) && !isCoutLine(line)) {
        const fname = standaloneFuncCall[1];
        if (funcDefs[fname]) {
          const argStr = standaloneFuncCall[2].trim();
          inlineCall(fname, argStr, ln, localVars, depth + 1);
        }
        continue;
      }

      // Variable declaration + assignment:  type name = expr;
      // Also handles: type name;  (no init)
      // Also handles: type a = x, b = y;  (multi-declare — simplified)
      const declMatch = line.match(/^(int|double|float|char|bool|string|long|short|unsigned\s+int|unsigned)\s+(.+?)\s*;$/);
      if (declMatch) {
        const typeStr = declMatch[1].trim();
        const rest = declMatch[2];
        // Split on comma for multi-declare (simple: no commas inside expressions)
        const parts = rest.split(',');
        for (const part of parts) {
          const p = part.trim();
          const eqIdx = p.indexOf('=');
          if (eqIdx === -1) {
            // Declare with no init — default value
            const vname = p.trim();
            if (!vname.includes('(')) localVars[vname] = typeStr === 'string' ? '' : 0;
          } else {
            const vname = p.slice(0, eqIdx).trim();
            const exprStr = p.slice(eqIdx + 1).trim();
            const val = evalExpr(exprStr, localVars);
            if (val !== UNEVALUATED) {
              localVars[vname] = val;
              if (trackedVars.includes(vname)) {
                steps.push({ line: ln, variable: vname, value: String(val) });
              }
            }
          }
        }
        continue;
      }

      // Struct variable declaration: Type name = {a, b, ...};
      const structDeclMatch = line.match(/^([A-Z][a-zA-Z_]\w*)\s+([a-zA-Z_]\w*)\s*=\s*\{([^}]*)\}\s*;$/);
      if (structDeclMatch) {
        const structType = structDeclMatch[1];
        const varName = structDeclMatch[2];
        const vals = structDeclMatch[3].split(',').map(v => v.trim());
        // We need to know the struct fields — look them up
        const fields = getStructFields(code, structType);
        for (let fi = 0; fi < fields.length && fi < vals.length; fi++) {
          const memberName = `${varName}.${fields[fi]}`;
          const val = evalExpr(vals[fi], localVars);
          if (val !== UNEVALUATED) {
            localVars[memberName] = val;
            if (trackedVars.includes(memberName)) {
              steps.push({ line: ln, variable: memberName, value: String(val) });
            }
          }
        }
        continue;
      }

      // Struct declaration (no init): Type name;
      const structDeclNoInit = line.match(/^([A-Z][a-zA-Z_]\w*)\s+([a-zA-Z_]\w*)\s*;$/);
      if (structDeclNoInit) {
        // nothing to track unless fields are set later
        continue;
      }

      // Assignment: varname = expr;  or  varname += expr;  etc.
      const assignMatch = line.match(/^([a-zA-Z_][\w.>-]*)\s*([\+\-\*\/%]?=)\s*(.+?)\s*;$/);
      if (assignMatch && !isDeclarationLine(line)) {
        let vname = assignMatch[1].replace(/->/g, '.');
        const op = assignMatch[2];
        const exprStr = assignMatch[3];
        const rhs = evalExpr(exprStr, localVars);
        if (rhs !== UNEVALUATED) {
          let newVal;
          if (op === '=') newVal = rhs;
          else {
            const cur = Number(localVars[vname] || 0);
            const r = Number(rhs);
            if (op === '+=') newVal = cur + r;
            else if (op === '-=') newVal = cur - r;
            else if (op === '*=') newVal = cur * r;
            else if (op === '/=') newVal = Math.trunc(cur / r);
            else if (op === '%=') newVal = cur % r;
            else newVal = rhs;
          }
          localVars[vname] = newVal;
          if (trackedVars.includes(vname)) {
            steps.push({ line: ln, variable: vname, value: String(newVal) });
          }
        }
        continue;
      }

      // Pre-increment standalone: ++x;
      if (/^\+\+[a-zA-Z_][\w.]*\s*;$/.test(line)) {
        const vname = line.replace(/^\+\+/, '').replace(/\s*;$/, '').trim();
        if (localVars[vname] !== undefined) {
          localVars[vname] = Number(localVars[vname]) + 1;
          if (trackedVars.includes(vname)) steps.push({ line: ln, variable: vname, value: String(localVars[vname]) });
        }
        continue;
      }
      // Post-increment standalone: x++;
      if (/^[a-zA-Z_][\w.]*\+\+\s*;$/.test(line)) {
        const vname = line.replace(/\+\+\s*;$/, '').trim();
        if (localVars[vname] !== undefined) {
          localVars[vname] = Number(localVars[vname]) + 1;
          if (trackedVars.includes(vname)) steps.push({ line: ln, variable: vname, value: String(localVars[vname]) });
        }
        continue;
      }
      // Pre-decrement: --x;
      if (/^--[a-zA-Z_][\w.]*\s*;$/.test(line)) {
        const vname = line.replace(/^--/, '').replace(/\s*;$/, '').trim();
        if (localVars[vname] !== undefined) {
          localVars[vname] = Number(localVars[vname]) - 1;
          if (trackedVars.includes(vname)) steps.push({ line: ln, variable: vname, value: String(localVars[vname]) });
        }
        continue;
      }
      // Post-decrement: x--;
      if (/^[a-zA-Z_][\w.]*--\s*;$/.test(line)) {
        const vname = line.replace(/--\s*;$/, '').trim();
        if (localVars[vname] !== undefined) {
          localVars[vname] = Number(localVars[vname]) - 1;
          if (trackedVars.includes(vname)) steps.push({ line: ln, variable: vname, value: String(localVars[vname]) });
        }
        continue;
      }

      // cout statement
      if (/^cout\s*<</.test(line) || /^\s*cout\s*<</.test(rawLine)) {
        processCout(line, ln, localVars);
        continue;
      }

      // if/else — handle single-line and block
      const ifMatch = line.match(/^if\s*\((.+)\)\s*(.*)$/);
      if (ifMatch) {
        const condStr = ifMatch[1].trim();
        const rest2 = ifMatch[2].trim();
        const condVal = evalExpr(condStr, localVars);
        // Find the if block
        const block = extractBlock(lineArr, i - 1, baseLineNum); // i-1 because we already incremented
        if (condVal !== UNEVALUATED) {
          if (condVal) {
            if (rest2 && rest2 !== '{' && !rest2.startsWith('//')) {
              // Single-line if body on same line
              runLines([rest2], ln, localVars, depth + 1);
            } else {
              runLines(block.thenLines, block.thenBase, localVars, depth + 1);
            }
          } else {
            if (block.elseLines) {
              runLines(block.elseLines, block.elseBase, localVars, depth + 1);
            }
          }
          i = block.nextI;
        } else {
          UNSUPPORTED = true;
          i = block.nextI || i;
        }
        continue;
      }

      // for loop — handle simple counted loops
      const forMatch = line.match(/^for\s*\((.+?)\s*;\s*(.+?)\s*;\s*(.+?)\)\s*(.*)$/);
      if (forMatch) {
        const initStr = forMatch[1].trim();
        const condStr = forMatch[2].trim();
        const incrStr = forMatch[3].trim();
        const bodyRest = forMatch[4].trim();
        const block = extractBlock(lineArr, i - 1, baseLineNum);

        // Execute init
        const initLine = initStr + ';';
        runLines([initLine], ln, localVars, depth + 1);

        let iterations = 0;
        while (iterations < 1000) {
          iterations++;
          const condVal = evalExpr(condStr, localVars);
          if (condVal === UNEVALUATED) { UNSUPPORTED = true; break; }
          if (!condVal) break;
          // Run body
          if (bodyRest && bodyRest !== '{') {
            runLines([bodyRest + ';'], ln, localVars, depth + 1);
          } else {
            runLines(block.thenLines, block.thenBase, localVars, depth + 1);
          }
          // Run increment
          runLines([incrStr + ';'], ln, localVars, depth + 1);
        }
        i = block.nextI;
        continue;
      }

      // while loop
      const whileMatch = line.match(/^while\s*\((.+)\)\s*(.*)$/);
      if (whileMatch) {
        const condStr = whileMatch[1].trim();
        const bodyRest = whileMatch[2].trim();
        const block = extractBlock(lineArr, i - 1, baseLineNum);

        let iterations = 0;
        while (iterations < 1000) {
          iterations++;
          const condVal = evalExpr(condStr, localVars);
          if (condVal === UNEVALUATED) { UNSUPPORTED = true; break; }
          if (!condVal) break;
          if (bodyRest && bodyRest !== '{') {
            runLines([bodyRest + ';'], ln, localVars, depth + 1);
          } else {
            runLines(block.thenLines, block.thenBase, localVars, depth + 1);
          }
        }
        i = block.nextI;
        continue;
      }

      // do-while loop
      if (/^do\s*\{?$/.test(line)) {
        const block = extractBlock(lineArr, i - 1, baseLineNum);
        // find while condition after the block
        let nextLine = lineArr[block.nextI - 1] || '';
        const whileCond = nextLine.match(/}\s*while\s*\((.+)\)/);
        let condStr = whileCond ? whileCond[1].trim() : null;

        let iterations = 0;
        do {
          iterations++;
          if (iterations > 1000) break;
          runLines(block.thenLines, block.thenBase, localVars, depth + 1);
          if (!condStr) break;
          const condVal = evalExpr(condStr, localVars);
          if (condVal === UNEVALUATED) { UNSUPPORTED = true; break; }
          if (!condVal) break;
        } while (true);
        i = block.nextI + (whileCond ? 1 : 0);
        continue;
      }

      // Pointer declaration: int* p = &x;
      const ptrDeclMatch = line.match(/^(int|double|char|float)\s*\*\s*([a-zA-Z_]\w*)\s*=\s*&([a-zA-Z_]\w*)\s*;$/);
      if (ptrDeclMatch) {
        const ptrName = ptrDeclMatch[2];
        const targetName = ptrDeclMatch[3];
        localVars[ptrName] = targetName; // store the target variable name
        continue;
      }

      // Pass-by-reference param assignment: *p = expr; or p->field = expr;
      const derefAssign = line.match(/^\*([a-zA-Z_]\w*)\s*=\s*(.+?)\s*;$/);
      if (derefAssign) {
        const ptrName = derefAssign[1];
        const exprStr = derefAssign[2];
        const targetName = localVars[ptrName];
        if (typeof targetName === 'string' && localVars[targetName] !== undefined) {
          const val = evalExpr(exprStr, localVars);
          if (val !== UNEVALUATED) {
            localVars[targetName] = val;
            if (trackedVars.includes(targetName)) {
              steps.push({ line: ln, variable: targetName, value: String(val) });
            }
          }
        }
        continue;
      }

      // return statement with expression (for non-void functions)
      const retMatch = line.match(/^return\s+(.+?)\s*;$/);
      if (retMatch) {
        const retVal = evalExpr(retMatch[1], localVars);
        localVars['__return__'] = retVal !== UNEVALUATED ? retVal : 0;
        return; // exit runLines for this scope
      }

      // Anything else we skip (struct defs, function sigs, etc.)
    }
  }

  // ── processCout ─────────────────────────────────────────────────────────────
  function processCout(line, ln, localVars) {
    // Strip 'cout' and trailing semicolon
    let rest = line.replace(/^cout\s*/, '').replace(/\s*;\s*$/, '');
    // Split on << (but not inside strings)
    const parts = splitCoutParts(rest);
    for (const part of parts) {
      const p = part.trim();
      if (!p) continue;
      if (p === 'endl' || p === '"\\n"' || p === "'\\n'") {
        // newline
        output.push(currentOutputLine);
        currentOutputLine = '';
      } else if (p === '"\\t"' || p === "'\\t'") {
        currentOutputLine += '\t';
      } else if (/^".*"$/.test(p)) {
        currentOutputLine += p.slice(1, -1);
      } else if (/^'[^']'$/.test(p)) {
        currentOutputLine += p[1];
      } else {
        const val = evalExpr(p, localVars);
        if (val !== UNEVALUATED) {
          // Format doubles: if integer value print without decimal (like C++ default)
          if (typeof val === 'number' && !Number.isInteger(val)) {
            // C++ default: up to 6 significant figures
            currentOutputLine += formatDouble(val);
          } else {
            currentOutputLine += String(val);
          }
        } else {
          currentOutputLine += `<?${p}?>`;
        }
      }
    }
  }

  function formatDouble(val) {
    // C++ default stream formatting: 6 significant digits
    const s = val.toPrecision(6);
    // Remove trailing zeros after decimal
    if (s.includes('.')) {
      return s.replace(/\.?0+$/, '');
    }
    return s;
  }

  function splitCoutParts(str) {
    const parts = [];
    let current = '';
    let inStr = false;
    let strChar = '';
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (!inStr) {
        if (ch === '"' || ch === "'") { inStr = true; strChar = ch; current += ch; }
        else if (ch === '<' && str[i + 1] === '<') { parts.push(current); current = ''; i++; }
        else { current += ch; }
      } else {
        current += ch;
        if (ch === strChar && str[i - 1] !== '\\') inStr = false;
      }
    }
    if (current.trim()) parts.push(current);
    return parts;
  }

  // ── extractBlock ─────────────────────────────────────────────────────────────
  // Given the index of the if/for/while line (0-based in lineArr), extract
  // the body lines. Returns { thenLines, thenBase, elseLines?, elseBase?, nextI }
  function extractBlock(lineArr, startI, baseLineNum) {
    // lineArr[startI] is the if/for/while line
    let i = startI + 1;
    // Skip past the opening brace if it's on its own line
    if (i < lineArr.length && lineArr[i].trim() === '{') i++;
    const thenLines = [];
    let depth = 1;
    // The if line itself might end with '{' already, or the next line is '{'
    // We need to find the matching '}'
    // If the if/for/while body is a single statement (no braces), just take one line
    const headerLine = lineArr[startI].trim();
    const hasBrace = headerLine.endsWith('{') || (i < lineArr.length && lineArr[i - 1].trim() === '{');

    if (!hasBrace && !headerLine.endsWith('{')) {
      // Single-statement body
      if (i < lineArr.length) thenLines.push(lineArr[i++]);
      return { thenLines, thenBase: baseLineNum + i - thenLines.length, elseLines: null, elseBase: null, nextI: i };
    }

    // Multi-line body with braces
    let braceDepth = headerLine.endsWith('{') ? 1 : (lineArr[startI + 1] && lineArr[startI + 1].trim() === '{' ? 1 : 0);
    if (braceDepth === 0) {
      // brace not yet found
      while (i < lineArr.length && lineArr[i].trim() !== '{') i++;
      i++; // skip '{'
    }

    braceDepth = 1;
    const thenStart = i;
    while (i < lineArr.length && braceDepth > 0) {
      const l = lineArr[i].trim();
      if (l === '{') braceDepth++;
      else if (l === '}' || l.endsWith('}')) {
        braceDepth--;
        if (braceDepth === 0) { i++; break; }
      }
      if (braceDepth > 0) thenLines.push(lineArr[i]);
      i++;
    }

    // Check for else
    let elseLines = null, elseBase = null;
    if (i < lineArr.length && lineArr[i].trim().startsWith('else')) {
      const elseLine = lineArr[i].trim();
      i++;
      if (elseLine === 'else {' || elseLine === 'else{') {
        elseLines = [];
        let eDepth = 1;
        while (i < lineArr.length && eDepth > 0) {
          const l = lineArr[i].trim();
          if (l === '{') eDepth++;
          else if (l === '}' || l.endsWith('}')) {
            eDepth--;
            if (eDepth === 0) { i++; break; }
          }
          if (eDepth > 0) elseLines.push(lineArr[i]);
          i++;
        }
        elseBase = baseLineNum + i - elseLines.length - 1;
      } else if (elseLine.startsWith('else if')) {
        // else-if: treat remainder as body
        elseLines = [elseLine.replace(/^else\s+/, '')];
        elseBase = baseLineNum + i;
      } else {
        // else single statement
        const stmt = elseLine.replace(/^else\s+/, '');
        elseLines = [stmt];
        elseBase = baseLineNum + i - 1;
      }
    }

    return {
      thenLines,
      thenBase: baseLineNum + thenStart,
      elseLines,
      elseBase,
      nextI: i,
    };
  }

  // ── inline function call ─────────────────────────────────────────────────────
  function inlineCall(fname, argStr, callLine, callerVars, depth) {
    const funcDef = funcDefs[fname];
    if (!funcDef) return;

    const args = argStr ? argStr.split(',').map(a => a.trim()) : [];
    const params = funcDef.params;

    // Build local scope for the function
    const localScope = { ...callerVars };

    for (let pi = 0; pi < params.length; pi++) {
      const param = params[pi];
      const argExpr = args[pi] || '0';

      if (param.byRef) {
        // Pass by reference — the param name points to the caller's variable
        // We handle this by aliasing: any write to param also writes to caller's var
        // We use a simple approach: copy value, then after call, propagate back
        const argVarName = argExpr.replace(/^&/, '');
        localScope[param.name] = callerVars[argVarName] !== undefined ? callerVars[argVarName] : evalExpr(argExpr, callerVars);
        localScope[`__ref_${param.name}__`] = argVarName; // track aliasing
      } else if (param.isPtr) {
        // Pass by pointer
        const argVarName = argExpr.replace(/^&/, '');
        localScope[param.name] = argVarName;
      } else {
        // Pass by value
        const val = evalExpr(argExpr, callerVars);
        localScope[param.name] = val !== UNEVALUATED ? val : 0;
      }

      // Handle struct members: if arg is struct, copy all its fields
      if (!param.byRef && !param.isPtr) {
        const structFields = Object.keys(callerVars).filter(k => k.startsWith(argExpr + '.'));
        for (const field of structFields) {
          const memberName = param.name + field.slice(argExpr.length);
          localScope[memberName] = callerVars[field];
        }
      }
    }

    // Run function body
    runLines(funcDef.bodyLines, funcDef.startLine, localScope, depth);

    // Propagate reference changes back to caller
    for (const param of params) {
      if (param.byRef) {
        const refTarget = localScope[`__ref_${param.name}__`];
        if (refTarget && localScope[param.name] !== undefined) {
          callerVars[refTarget] = localScope[param.name];
          if (trackedVars.includes(refTarget)) {
            steps.push({ line: callLine, variable: refTarget, value: String(callerVars[refTarget]) });
          }
        }
      }
    }

    // If return value needed
    if (localScope['__return__'] !== undefined) {
      callerVars['__lastReturn__'] = localScope['__return__'];
    }
  }

  // ── Start simulation ─────────────────────────────────────────────────────────
  // Find main() body
  let mainBody = [];
  let mainLineBase = 0;
  if (mainStart !== null) {
    // Find opening brace of main
    let braceStart = mainStart;
    while (braceStart < lines.length && !lines[braceStart].includes('{')) braceStart++;
    braceStart++; // skip opening brace line
    let depth2 = 1;
    let mainEnd = braceStart;
    while (mainEnd < lines.length && depth2 > 0) {
      const l = lines[mainEnd].trim();
      if (l.includes('{')) depth2 += (l.match(/\{/g) || []).length;
      if (l.includes('}')) depth2 -= (l.match(/\}/g) || []).length;
      if (depth2 > 0) mainBody.push(lines[mainEnd]);
      mainEnd++;
    }
    mainLineBase = braceStart; // 0-based index of first body line
  } else {
    // No explicit main — treat whole code as body
    mainBody = lines;
    mainLineBase = 0;
  }

  runLines(mainBody, mainLineBase, vars, 0);

  // Flush any remaining output
  if (currentOutputLine !== '' || output.length > 0) {
    if (currentOutputLine !== '' || output.length === 0) {
      // Don't add trailing newline entry if nothing was printed after last endl
    }
  }

  // Build final output array: each entry = one line
  const finalOutput = [...output];
  if (currentOutputLine !== '') finalOutput.push(currentOutputLine);
  // If no output at all and nothing printed
  if (output.length === 0 && currentOutputLine === '') {
    // No output
  }

  return { vars, output: finalOutput, steps, unsupported: UNSUPPORTED };
}

// ─── Extract function definitions from code ─────────────────────────────────

function extractFunctions(code) {
  const lines = code.split('\n');
  const funcs = {};

  for (let i = 0; i < lines.length; i++) {
    // Match function signatures: returnType funcName(params) {
    const sigMatch = lines[i].match(/^(\w[\w\s*]*)\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*\{?\s*$/);
    if (!sigMatch) continue;
    const retType = sigMatch[1].trim();
    const fname = sigMatch[2];
    if (fname === 'main' || fname === 'if' || fname === 'for' || fname === 'while') continue;
    const paramStr = sigMatch[3].trim();

    const params = parseParams(paramStr);

    // Find the function body
    let bodyStart = i;
    while (bodyStart < lines.length && !lines[bodyStart].includes('{')) bodyStart++;
    bodyStart++; // skip opening brace line

    let depth = 1;
    const bodyLines = [];
    let j = bodyStart;
    while (j < lines.length && depth > 0) {
      const l = lines[j].trim();
      if (l.includes('{')) depth += (l.match(/\{/g) || []).length;
      if (l.includes('}')) depth -= (l.match(/\}/g) || []).length;
      if (depth > 0) bodyLines.push(lines[j]);
      j++;
    }

    funcs[fname] = { params, bodyLines, startLine: bodyStart, retType };
  }

  return funcs;
}

function parseParams(paramStr) {
  if (!paramStr.trim()) return [];
  const params = [];
  for (const part of paramStr.split(',')) {
    const p = part.trim();
    const byRef = p.includes('&');
    const isPtr = p.includes('*') && !p.includes('&');
    // Extract param name (last token)
    const tokens = p.replace(/[&*]/g, ' ').trim().split(/\s+/);
    const name = tokens[tokens.length - 1];
    params.push({ name, byRef, isPtr, type: tokens.slice(0, -1).join(' ') });
  }
  return params;
}

function getStructFields(code, structName) {
  const lines = code.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (l.startsWith(`struct ${structName}`) && l.includes('{')) {
      const fields = [];
      // Inline struct: struct Point { int x; int y; };
      const inlineMatch = l.match(/\{([^}]+)\}/);
      if (inlineMatch) {
        for (const part of inlineMatch[1].split(';')) {
          const tokens = part.trim().split(/\s+/);
          if (tokens.length >= 2) fields.push(tokens[tokens.length - 1]);
        }
        return fields;
      }
      // Multi-line struct
      let j = i + 1;
      while (j < lines.length && !lines[j].includes('}')) {
        const fl = lines[j].trim();
        if (fl && !fl.startsWith('//')) {
          const tokens = fl.replace(';', '').trim().split(/\s+/);
          if (tokens.length >= 2) fields.push(tokens[tokens.length - 1]);
        }
        j++;
      }
      return fields;
    }
  }
  return [];
}

function isDeclarationLine(line) {
  return /^(int|double|float|char|bool|string|long|short|unsigned)\s/.test(line.trim())
    || /^[A-Z][a-zA-Z_]\w*\s+\w/.test(line.trim()); // struct type
}

function isCoutLine(line) {
  return /cout\s*<</.test(line);
}

// ─── Main audit loop ─────────────────────────────────────────────────────────

let cardNum = 0;
const REPORT = [];

for (const card of traceCards) {
  cardNum++;
  const cardId = `[Card #${cardNum} atomId=${card.atomId}]`;
  const cardIssues = [];

  if (!card.code) {
    REPORT.push({ cardId, issues: ['MISSING code field'] });
    continue;
  }

  // ── Simulate ────────────────────────────────────────────────────────────────
  let simResult;
  try {
    simResult = simulateCpp(card.code, card.variables || []);
  } catch (e) {
    REPORT.push({ cardId, code: card.code, issues: [`SIMULATOR CRASH: ${e.message}`] });
    continue;
  }

  if (simResult.unsupported) {
    // We still report what we can but mark it
    cardIssues.push('NOTE: simulator hit unsupported construct — results may be partial');
  }

  // ── Check terminalOutput ────────────────────────────────────────────────────
  const expectedOut = card.terminalOutput || [];
  const actualOut = simResult.output;

  // Flatten expected output to a string for comparison
  const expectedStr = expectedOut.join('\n');
  const actualStr = actualOut.join('\n');

  if (expectedStr !== actualStr) {
    cardIssues.push(
      `terminalOutput MISMATCH:\n  Expected: ${JSON.stringify(expectedOut)}\n  Simulated: ${JSON.stringify(actualOut)}`
    );
  }

  // ── Check for multi-entry terminal output that should be one entry ──────────
  // This is the bug we just fixed: cout << 4; cout << 6; should be ["46"] not ["4","6"]
  // Check: if code has consecutive cout without endl/\n between them, output should be joined
  if (expectedOut.length > 1) {
    // Verify each line break corresponds to an endl/\n in the code
    // (already caught above if wrong, but flag the specific pattern)
    const coutLines = card.code.split('\n').filter(l => /cout\s*<</.test(l.trim()));
    const coutWithNewline = coutLines.filter(l => /endl|\\n/.test(l));
    const coutWithout = coutLines.filter(l => !/endl|\\n/.test(l));
    if (expectedOut.length > coutWithNewline.length + (coutWithout.length > 0 ? 1 : 0)) {
      cardIssues.push(
        `POSSIBLE terminalOutput over-split: ${expectedOut.length} entries but only ${coutWithNewline.length} cout-with-newline lines. Expected entries: ${JSON.stringify(expectedOut)}`
      );
    }
  }

  // ── Check expectedSteps final values ───────────────────────────────────────
  if (card.expectedSteps && card.variables) {
    // Build map of last expected value per variable
    const lastExpected = {};
    for (const step of card.expectedSteps) {
      lastExpected[step.variable] = step.value;
    }

    // Build map of last simulated value per variable
    const lastSimulated = {};
    for (const step of simResult.steps) {
      lastSimulated[step.variable] = step.value;
    }

    for (const varName of card.variables) {
      const exp = lastExpected[varName];
      const sim = lastSimulated[varName];

      if (exp === undefined) {
        // Variable in variables[] but never appears in expectedSteps
        if (sim !== undefined) {
          cardIssues.push(`Variable '${varName}' in variables[] has no entry in expectedSteps (simulated final value: ${sim})`);
        }
        // else: variable might not change — acceptable
      } else if (sim !== undefined && exp !== sim) {
        cardIssues.push(
          `expectedSteps final value MISMATCH for '${varName}': expected="${exp}" simulated="${sim}"`
        );
      }
    }
  }

  // ── Check variables[] matches declared variables ────────────────────────────
  if (card.variables) {
    // Variables in the card should appear in the code
    for (const v of card.variables) {
      // Allow struct member access (a.x) — check base name appears
      const baseName = v.split('.')[0].split('[')[0];
      if (!card.code.includes(baseName)) {
        cardIssues.push(`Variable '${v}' in variables[] not found in code`);
      }
    }
  }

  if (cardIssues.length > 0) {
    REPORT.push({ cardId, code: card.code, issues: cardIssues });
  }
}

// ─── Print report ────────────────────────────────────────────────────────────
console.log('═══════════════════════════════════════════════════════════════');
console.log('                    TRACE CARD AUDIT REPORT');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`Total trace cards: ${traceCards.length}`);
console.log(`Cards with issues: ${REPORT.length}`);
console.log('');

// Separate real issues from notes
const realIssues = REPORT.filter(r => r.issues.some(i => !i.startsWith('NOTE:')));
const noteOnly = REPORT.filter(r => r.issues.every(i => i.startsWith('NOTE:')));

console.log(`Cards with real issues: ${realIssues.length}`);
console.log(`Cards with simulator limitations only: ${noteOnly.length}`);
console.log('');

if (realIssues.length === 0) {
  console.log('NO ISSUES FOUND — all trace cards appear correct.');
} else {
  console.log('─── ISSUES FOUND ───────────────────────────────────────────────');
  for (const r of realIssues) {
    console.log(`\n${r.cardId}`);
    if (r.code) {
      console.log(`Code:\n  ${r.code.replace(/\n/g, '\n  ')}`);
    }
    for (const issue of r.issues) {
      if (!issue.startsWith('NOTE:')) {
        console.log(`  ISSUE: ${issue}`);
      }
    }
  }
}

if (noteOnly.length > 0) {
  console.log('\n─── SIMULATOR LIMITATION NOTES (not counted as issues) ────────');
  for (const r of noteOnly) {
    console.log(`  ${r.cardId} — ${r.issues[0]}`);
  }
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('END OF REPORT');
console.log('═══════════════════════════════════════════════════════════════');
