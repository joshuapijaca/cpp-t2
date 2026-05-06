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

export function gradeMemorize(
  studentInput: string,
  keyChecks: string[]
): boolean {
  const normInput = normalize(studentInput);
  return keyChecks.every((token) => normInput.includes(normalize(token)));
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
  const normStudent = normalize(studentCode);
  const normExpected = normalize(expectedAnswer);
  if (normStudent === normExpected) return true;
  const allKeysPresent = keyChecks.every((token) =>
    normStudent.includes(normalize(token))
  );
  const noForbidden = forbidden.every(
    (token) => !normStudent.includes(normalize(token))
  );
  return allKeysPresent && noForbidden;
}

export function gradeTraceFinal(
  studentValue: string,
  expectedValue: string
): boolean {
  return normalize(studentValue) === normalize(expectedValue);
}
