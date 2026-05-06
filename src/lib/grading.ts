// Offline char-match grading. Zero API calls. Pure functions.
// Spec: cpp-t2/docs/11_build_outline.md §"Lint Pipeline"

// Map Unicode symbols common in cards → ASCII equivalents student can type
// on a standard laptop keyboard.
const UNICODE_TO_ASCII: Array<[string, string]> = [
  ['→', '->'],
  ['←', '<-'],
  ['↑', '^'],
  ['↓', 'v'],
  ['≤', '<='],
  ['≥', '>='],
  ['≠', '!='],
  ['—', '-'],   // em dash
  ['–', '-'],   // en dash
  ['…', '...'],
  ['★', '*'],
  ['•', '*'],
  ['✓', 'OK'],
  ['✗', 'X'],
  ['✕', 'X'],
  ['×', 'x'],
  ['‘', "'"],
  ['’', "'"],
  ['“', '"'],
  ['”', '"'],
];

function asciify(s: string): string {
  let out = s;
  for (const [from, to] of UNICODE_TO_ASCII) {
    if (out.includes(from)) out = out.split(from).join(to);
  }
  return out;
}

export function normalize(input: string): string {
  return asciify(input).trim().toLowerCase().replace(/\s+/g, ' ');
}

/** Lenient normalize: also strips spaces around C++ operators.
 *  "cin >> x" and "cin>>x" both become "cin>>x".
 *  Used for keyCheck matching so valid compact C++ isn't rejected. */
function normalizeLenient(input: string): string {
  let s = normalize(input);
  // Multi-char operators first (>> before >)
  s = s.replace(/\s*(>>|<<|>=|<=|!=|==|\+=|-=|\*=|\/=|%=|&&|\|\|)\s*/g, '$1');
  // Single-char operators
  s = s.replace(/\s*([=<>+\-*/%&|!])\s*/g, '$1');
  return s;
}

export function gradeMemorize(
  studentInput: string,
  keyChecks: string[]
): boolean {
  const normInput = normalizeLenient(studentInput);
  return keyChecks.every((token) => normInput.includes(normalizeLenient(token)));
}

export function gradeMCQ(selected: string, correct: string): boolean {
  return selected === correct;
}

export function gradeWrite(
  studentCode: string,
  expectedAnswer: string,
  keyChecks: string[],
  forbidden: string[] = []
): boolean {
  // Exact match (base normalize)
  if (normalize(studentCode) === normalize(expectedAnswer)) return true;
  // Exact match (lenient — ignore operator spacing)
  if (normalizeLenient(studentCode) === normalizeLenient(expectedAnswer)) return true;
  // KeyCheck fallback: lenient normalization
  const normStudent = normalizeLenient(studentCode);
  const allKeysPresent = keyChecks.every((token) =>
    normStudent.includes(normalizeLenient(token))
  );
  const noForbidden = forbidden.every(
    (token) => !normStudent.includes(normalizeLenient(token))
  );
  return allKeysPresent && noForbidden;
}

export function gradeTraceFinal(
  studentValue: string,
  expectedValue: string
): boolean {
  return normalize(studentValue) === normalize(expectedValue);
}
