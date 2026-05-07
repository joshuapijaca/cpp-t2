/**
 * trace-code-parser.ts
 *
 * Pure parsers for TraceCard / WalkthroughCard `code` strings. Extracts
 * paper-sim hints the MemoryBoxes component needs:
 *   - Array initializers   → arrayInits map
 *   - Struct type bindings → varShapes hints
 *   - Pass-by-reference    → passByRef alias
 *   - SIZE constants       → array sizes
 *
 * Heuristic regex matchers, NOT a full C++ parser. Good enough for the
 * narrow Test-2 idioms (one struct per program, one scalar/array field
 * each, brace-list initializers). Bail out gracefully on anything weird.
 *
 * No React, no zod, no I/O. Pure data only.
 */

// ─────────────────────────────────────────────────────────────────────
// Public types — match the schema shapes (mirror, no import to keep
// this module dependency-free)
// ─────────────────────────────────────────────────────────────────────

export interface ParsedStructDef {
  name: string;             // "stat_double"
  fields: Array<{
    name: string;           // "numbers" / "mystery"
    kind: 'scalar' | 'array';
    cppType: string;        // "double" / "int"
    sizeRef?: string;        // e.g. "SIZE" — symbolic dimension
  }>;
}

export interface ParsedSizeConst {
  name: string;             // "SIZE"
  value: number;            // 5
}

export interface ParsedVarDecl {
  name: string;             // "d"
  cppType: string;           // "stat_double"
  init?: string;            // raw init expression (e.g. "{ {-20.0, 3.2, ...}, 0.0 }")
}

export interface ParsedPassByRef {
  paramName: string;        // "data"
  callerName: string;        // "d"
}

// ─────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────

/** Strip line comments + block comments. */
function stripComments(src: string): string {
  let out = '';
  let i = 0;
  while (i < src.length) {
    if (src[i] === '/' && src[i + 1] === '/') {
      // line comment
      while (i < src.length && src[i] !== '\n') i++;
    } else if (src[i] === '/' && src[i + 1] === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i += 2;
    } else {
      out += src[i];
      i++;
    }
  }
  return out;
}

// ─────────────────────────────────────────────────────────────────────
// Parsers
// ─────────────────────────────────────────────────────────────────────

/** const int SIZE = 5;  →  { name: "SIZE", value: 5 } */
export function parseSizeConsts(code: string): ParsedSizeConst[] {
  const src = stripComments(code);
  const out: ParsedSizeConst[] = [];
  const re = /\bconst\s+int\s+([A-Za-z_][\w]*)\s*=\s*(-?\d+)\s*;/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    const name = m[1];
    const value = parseInt(m[2] ?? '0', 10);
    if (name && Number.isFinite(value)) out.push({ name, value });
  }
  return out;
}

/**
 * struct stat_double {
 *   double numbers[SIZE];
 *   double mystery;
 * };
 *
 * Multi-line tolerant. Returns one entry per struct found in the code.
 */
export function parseStructDefs(code: string): ParsedStructDef[] {
  const src = stripComments(code);
  const out: ParsedStructDef[] = [];
  // Outer match: struct NAME { BODY };
  const re = /\bstruct\s+([A-Za-z_][\w]*)\s*\{([\s\S]*?)\}\s*;/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    const name = m[1];
    const body = m[2];
    if (!name || body === undefined) continue;
    const fields: ParsedStructDef['fields'] = [];
    // Field forms:
    //   <type> <name> ;            → scalar
    //   <type> <name> [ <dim> ] ;   → array
    const fieldRe =
      /\b([A-Za-z_][\w]*)\s+([A-Za-z_][\w]*)\s*(?:\[\s*([A-Za-z_0-9]+)\s*\])?\s*;/g;
    let f: RegExpExecArray | null;
    while ((f = fieldRe.exec(body)) !== null) {
      const cppType = f[1];
      const fieldName = f[2];
      const dim = f[3];
      if (!cppType || !fieldName) continue;
      if (dim) {
        fields.push({ name: fieldName, kind: 'array', cppType, sizeRef: dim });
      } else {
        fields.push({ name: fieldName, kind: 'scalar', cppType });
      }
    }
    out.push({ name, fields });
  }
  return out;
}

/**
 * stat_double d = { {-20.0, 3.2, 1.9, -1.5, 1.3}, 0.0 };
 *
 * Returns: variable `d` of type `stat_double`, init = the brace expr.
 * `cppType` matches the declared type — caller decides if it's a struct
 * by cross-referencing parseStructDefs().
 */
export function parseVarDecls(code: string): ParsedVarDecl[] {
  const src = stripComments(code);
  const out: ParsedVarDecl[] = [];
  // <type> <name> = <init> ;
  // Type can include & for refs (declarations omit & — we only catch defs).
  const re =
    /\b([A-Za-z_][\w]*)\s+([A-Za-z_][\w]*)\s*=\s*(\{[\s\S]*?\}|[^;]+?)\s*;/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    const cppType = m[1];
    const name = m[2];
    const init = m[3];
    if (!cppType || !name) continue;
    if (cppType === 'return' || cppType === 'const' || cppType === 'struct') continue;
    out.push({
      name,
      cppType,
      ...(init !== undefined ? { init: init.trim() } : {}),
    });
  }
  return out;
}

/**
 * Brace-list initializer extractor for a struct with one array field
 * + scalar fields. Used to derive array contents from declarations.
 *
 *   "{ {-20.0, 3.2, 1.9, -1.5, 1.3}, 0.0 }"
 *
 * Returns the top-level slots as raw strings:
 *   [ "{-20.0, 3.2, 1.9, -1.5, 1.3}", "0.0" ]
 *
 * For a slot that is itself a brace-list, you can call this recursively.
 */
export function splitBraceList(expr: string): string[] {
  const t = expr.trim();
  if (!t.startsWith('{') || !t.endsWith('}')) return [];
  const inner = t.slice(1, -1);
  const out: string[] = [];
  let depth = 0;
  let buf = '';
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (c === '{') {
      depth++;
      buf += c;
    } else if (c === '}') {
      depth--;
      buf += c;
    } else if (c === ',' && depth === 0) {
      out.push(buf.trim());
      buf = '';
    } else {
      buf += c;
    }
  }
  if (buf.trim().length > 0) out.push(buf.trim());
  return out;
}

/** Parse an array-init brace list "{a, b, c}" → ["a", "b", "c"]. */
export function parseArrayInit(expr: string): string[] {
  return splitBraceList(expr);
}

/**
 * Detect pass-by-reference aliasing.
 *
 *   void f(stat_double &data) { ... }       // function with &param
 *   f(d);                                     // call site
 *
 * Returns the pair { paramName: "data", callerName: "d" } when we can
 * unambiguously identify a single call site.
 */
export function parsePassByRef(code: string): ParsedPassByRef | null {
  const src = stripComments(code);

  // 1. Function with one &-param, capture param name + function name.
  //    void NAME ( <type> & PARAM ) { ... }
  const fnRe =
    /\b(?:void|int|double|bool|char|string)\s+([A-Za-z_][\w]*)\s*\(\s*[A-Za-z_][\w]*\s*&\s*([A-Za-z_][\w]*)\s*\)/;
  const fn = fnRe.exec(src);
  if (!fn) return null;
  const fnName = fn[1];
  const paramName = fn[2];
  if (!fnName || !paramName) return null;

  // 2. Find a call site: NAME ( ARG ) ; outside the definition
  //    (the same regex will hit the def too — search from end of def
  //    to avoid that).
  const defEnd = fn.index + fn[0].length;
  const after = src.slice(defEnd);
  const callRe = new RegExp(`\\b${fnName}\\s*\\(\\s*([A-Za-z_][\\w]*)\\s*\\)\\s*;`);
  const call = callRe.exec(after);
  if (!call) return null;
  const callerName = call[1];
  if (!callerName || callerName === paramName) return null;

  return { paramName, callerName };
}

/**
 * One-stop convenience: parse a code blob into structured paper-sim
 * hints. Components can call this once and feed MemoryBoxes from the
 * result.
 */
export interface ParsedTraceCode {
  sizeConsts: ParsedSizeConst[];
  structDefs: ParsedStructDef[];
  varDecls: ParsedVarDecl[];
  passByRef: ParsedPassByRef | null;
}

export function parseTraceCode(code: string): ParsedTraceCode {
  return {
    sizeConsts: parseSizeConsts(code),
    structDefs: parseStructDefs(code),
    varDecls: parseVarDecls(code),
    passByRef: parsePassByRef(code),
  };
}

/**
 * Resolve an array dimension string. If `sizeRef` is a number, return
 * it; if it's a symbolic name (e.g. "SIZE"), look it up in the size
 * constants list. Returns undefined when unresolvable.
 */
export function resolveSize(
  sizeRef: string,
  consts: ParsedSizeConst[]
): number | undefined {
  if (/^\d+$/.test(sizeRef)) return parseInt(sizeRef, 10);
  const found = consts.find((c) => c.name === sizeRef);
  return found?.value;
}
