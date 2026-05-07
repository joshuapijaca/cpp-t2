// =====================================================================
// Phase B5 — L4 citation re-grounding specialist
// =====================================================================
// Per RULE 4: L4 Q4 Write main was 90% FAKE. Replace fake "C++T2 spec §X"
// citations with real source-data citations + add `drills:` field
// linking to one of the 10 Q4 atoms.
// =====================================================================

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { glob } from 'glob';
import { resolve, basename, relative } from 'path';

const ROOT = resolve(import.meta.dirname, '..');
const L4_DIR = resolve(ROOT, 'data/v2/cards/L4');
const ARCHIVE_DIR = resolve(ROOT, 'data/v2/archive/L4-fake-citations-2026-05-07');
const GAPS_FILE = resolve(ROOT, 'build-v2/B5_GAPS.md');

// 10 Q4 atom IDs per brief: int main / const MAX / struct array decl /
// count var / prompt for count / read count / fn call no-& / print loop /
// chained cout / return 0
//
// Q-00 = S1 Tour (full main intro)        → atom: int-main
// Q-01 = S2 Template (typeline/fillslot)  → maps by file token
// Q-02 = Block A const                    → const-int-MAX
// Q-03 = Block B array                    → struct-array-decl
// Q-04 = Block C count                    → count-var-decl
// Q-05 = Block D call                     → fn-call-no-&
// Q-06 = Block E print                    → print-loop / chained-cout
// Q-07 = Block F return                   → return-0
// Q-08 = S4 Compose (full main)           → all 10 atoms
// Q-09 = S5 Variations (full main)        → all 10 atoms
// Q-10 = S6 Speed (full main)             → all 10 atoms

const ATOM_LABEL = {
  'int-main':           'tier1:Q4:int-main',
  'const-int-MAX':      'tier1:Q4:const-int-MAX',
  'struct-array-decl':  'tier1:Q4:struct-array-decl',
  'count-var-decl':     'tier1:Q4:count-var-decl',
  'prompt-for-count':   'tier1:Q4:prompt-for-count',
  'read-count':         'tier1:Q4:read-count',
  'fn-call-no-amp':     'tier1:Q4:fn-call-no-amp',
  'print-loop':         'tier1:Q4:print-loop',
  'chained-cout':       'tier1:Q4:chained-cout',
  'return-0':           'tier1:Q4:return-0',
};

const ALL_TIER1 = Object.values(ATOM_LABEL);

// Real-source citations available per the catalog
const PFG_MAIN_COMPOSE = 'tier2:pfg:part-2-organised-code/1-starting-cpp/2-trailside/4-1-variable-constant';
const PFG_FN_CALLS    = 'tier2:pfg:part-2-organised-code/1-starting-cpp/2-trailside/4-2-function-calls';
const PFG_FOR_LOOP    = 'tier2:pfg:part-2-organised-code/1-starting-cpp/2-trailside/4-6-for';
const PFG_ARRAYS      = 'tier2:pfg:part-3-programs-as-concepts/3-collections/2-trailside/10-arrays';
const PFG_ARRAYS_MAN  = 'tier2:pfg:part-3-programs-as-concepts/3-collections/2-trailside/11-manipulating-arrays';
const PFG_CUSTOM_TYPES = 'tier2:pfg:part-2-organised-code/3-structuring-data/2-trailside/04-declaring-variables-with-custom-types';
const PFG_TYPE_DECL_PROG = 'tier2:pfg:part-2-organised-code/3-structuring-data/2-trailside/02-program-with-type-declarations';
const PFG_RETURN      = 'tier2:pfg:part-2-organised-code/2-organising-code/2-trailside/05-return';
const PFG_PASS_BY_REF = 'tier2:pfg:part-2-organised-code/2-organising-code/0-panorama/04-parameter';
const PFG_VAR_DECL    = 'tier2:pfg:part-1-instructions/1-sequence-and-data/2-trailside/07-variable';

const SEM_Q4         = 'tier2:seminar:saloni-2 @ 46:30';
const SEM_Q4_PRINT   = 'tier2:seminar:saloni-2 @ 46:54';
const SEM_Q4_MAX     = 'tier2:seminar:saloni-2 @ 46:40';
const SEM_Q4_MAIN    = 'tier2:seminar:saloni-2 @ 47:17';

const PRACTICE_Q4    = 'tier2:practice:Q4';
const V2_Q4          = 'tier2:v2:Q4';
const VARIANT_Q4     = 'tier2:variant:Q4';

const TASKSHEET_P9   = 'tier2:task-sheet:P9';
const TASKSHEET_P7   = 'tier2:task-sheet:P7';

// Atom -> default tier2 citations
const ATOM_TIER2 = {
  'int-main':          [PFG_TYPE_DECL_PROG, SEM_Q4_MAIN, V2_Q4, PRACTICE_Q4],
  'const-int-MAX':     [PFG_VAR_DECL, SEM_Q4_MAX, V2_Q4, PRACTICE_Q4],
  'struct-array-decl': [PFG_ARRAYS, PFG_CUSTOM_TYPES, V2_Q4, PRACTICE_Q4, TASKSHEET_P9],
  'count-var-decl':    [PFG_VAR_DECL, V2_Q4, PRACTICE_Q4],
  'prompt-for-count':  [PFG_MAIN_COMPOSE, V2_Q4, PRACTICE_Q4],
  'read-count':        [PFG_MAIN_COMPOSE, V2_Q4, PRACTICE_Q4],
  'fn-call-no-amp':    [PFG_FN_CALLS, PFG_PASS_BY_REF, SEM_Q4, V2_Q4, PRACTICE_Q4, TASKSHEET_P7],
  'print-loop':        [PFG_FOR_LOOP, PFG_ARRAYS_MAN, SEM_Q4_PRINT, V2_Q4, PRACTICE_Q4],
  'chained-cout':      [PFG_FOR_LOOP, SEM_Q4_PRINT, V2_Q4, PRACTICE_Q4],
  'return-0':          [PFG_RETURN, V2_Q4, PRACTICE_Q4],
};

// ---------------------------------------------------------------------
// Map a card file → which atoms it drills + the appropriate citation
// ---------------------------------------------------------------------

function classifyCard(file, atomId) {
  const fname = basename(file).toLowerCase();
  const seg = file.replace(/\\/g, '/').split('/');
  const subdir = seg[seg.length - 2] || '';
  const isV20 = /v20|v2[-_]/i.test(fname) || /desk/i.test(fname);
  const isPrac = /prac/i.test(fname) || /computer/i.test(fname);
  const isVariant = /variant|printer/i.test(fname);

  // S1 Tour
  if (subdir === 'S1-Tour') {
    // Walkthroughs, compares, what-happens, spot-errors, demo-variants
    if (/walkthrough-prac/i.test(fname)) {
      return {
        drills: ALL_TIER1,
        kind: 'practice',
        ref: 'practice:Q4 — full main() walkthrough; computer_data MAX=100, find-max',
        tier2: [PFG_TYPE_DECL_PROG, SEM_Q4_MAIN, PRACTICE_Q4],
      };
    }
    if (/walkthrough-v20/i.test(fname)) {
      return {
        drills: ALL_TIER1,
        kind: 'v2',
        ref: 'v2:Q4 — full main() walkthrough; desk_data MAX=700, sum-positive',
        tier2: [PFG_TYPE_DECL_PROG, SEM_Q4_MAIN, V2_Q4],
      };
    }
    if (/compare-01-array-decl/i.test(fname)) {
      return {
        drills: ['tier1:Q4:struct-array-decl'],
        kind: 'v2',
        ref: 'v2:Q4 — desk_data desks[MAX]; array decl line',
        tier2: [PFG_ARRAYS, V2_Q4, TASKSHEET_P9],
      };
    }
    if (/compare-02-fn-call/i.test(fname)) {
      return {
        drills: ['tier1:Q4:fn-call-no-amp'],
        kind: 'v2',
        ref: 'v2:Q4 — read_desks(desks, desk_num) call site; no &',
        tier2: [PFG_FN_CALLS, PFG_PASS_BY_REF, SEM_Q4, V2_Q4],
      };
    }
    if (/compare-03-loop-bound/i.test(fname)) {
      return {
        drills: ['tier1:Q4:print-loop'],
        kind: 'v2',
        ref: 'v2:Q4 — for(i=0;i<desk_num;i++) loop bound',
        tier2: [PFG_FOR_LOOP, V2_Q4],
      };
    }
    if (/compare-04-count-decl/i.test(fname)) {
      return {
        drills: ['tier1:Q4:count-var-decl'],
        kind: 'v2',
        ref: 'v2:Q4 — int desk_num; count var distinct from MAX',
        tier2: [PFG_VAR_DECL, V2_Q4],
      };
    }
    if (/demo-variant-01/i.test(fname)) {
      return {
        drills: ALL_TIER1,
        kind: 'practice',
        ref: 'practice:Q4 — demo of computer_data main()',
        tier2: [PRACTICE_Q4, PFG_TYPE_DECL_PROG],
      };
    }
    if (/demo-variant-02/i.test(fname)) {
      return {
        drills: ALL_TIER1,
        kind: 'variant',
        ref: 'variant:Q4 — printer_data main() (Sem 1 2025 retired)',
        tier2: [VARIANT_Q4, PFG_TYPE_DECL_PROG],
      };
    }
    // spot-errors map to specific atom
    if (/spoterror-01-missing-const/i.test(fname)) {
      return {
        drills: ['tier1:Q4:const-int-MAX'],
        kind: 'v2',
        ref: 'v2:Q4 — common-mistake: missing const on MAX',
        tier2: [PFG_VAR_DECL, V2_Q4],
      };
    }
    if (/spoterror-02-var-sized-array/i.test(fname)) {
      return {
        drills: ['tier1:Q4:struct-array-decl', 'tier1:Q4:const-int-MAX'],
        kind: 'v2',
        ref: 'v2:Q4 — common-mistake: variable-length array (no const → VLA)',
        tier2: [PFG_ARRAYS, V2_Q4],
      };
    }
    if (/spoterror-03-read-count/i.test(fname)) {
      return {
        drills: ['tier1:Q4:read-count', 'tier1:Q4:fn-call-no-amp'],
        kind: 'v2',
        ref: 'v2:Q4 — common-mistake: cin >> count AFTER read fn call',
        tier2: [PFG_MAIN_COMPOSE, V2_Q4],
      };
    }
    if (/spoterror-04-pass-MAX/i.test(fname)) {
      return {
        drills: ['tier1:Q4:fn-call-no-amp'],
        kind: 'v2',
        ref: 'v2:Q4 — common-mistake: passing MAX (capacity) instead of count',
        tier2: [PFG_FN_CALLS, V2_Q4],
      };
    }
    if (/spoterror-05-amp/i.test(fname)) {
      return {
        drills: ['tier1:Q4:fn-call-no-amp'],
        kind: 'v2',
        ref: 'v2:Q4 — common-mistake: & at call site (& only on signature)',
        tier2: [PFG_PASS_BY_REF, SEM_Q4, V2_Q4],
      };
    }
    if (/spoterror-06-loop-uses-MAX/i.test(fname)) {
      return {
        drills: ['tier1:Q4:print-loop'],
        kind: 'v2',
        ref: 'v2:Q4 — common-mistake: loop bound uses MAX (capacity), not count',
        tier2: [PFG_FOR_LOOP, V2_Q4],
      };
    }
    if (/spoterror-07-missing-return/i.test(fname)) {
      return {
        drills: ['tier1:Q4:return-0'],
        kind: 'v2',
        ref: 'v2:Q4 — common-mistake: missing return 0',
        tier2: [PFG_RETURN, V2_Q4],
      };
    }
    if (/spoterror-08-no-endl/i.test(fname)) {
      return {
        drills: ['tier1:Q4:chained-cout'],
        kind: 'v2',
        ref: 'v2:Q4 — common-mistake: no endl on last cout',
        tier2: [PFG_FOR_LOOP, V2_Q4],
      };
    }
    if (/spoterror-09-count-decl/i.test(fname)) {
      return {
        drills: ['tier1:Q4:count-var-decl'],
        kind: 'v2',
        ref: 'v2:Q4 — common-mistake: wrong type on count var',
        tier2: [PFG_VAR_DECL, V2_Q4],
      };
    }
    if (/spoterror-10-arg-order/i.test(fname)) {
      return {
        drills: ['tier1:Q4:fn-call-no-amp'],
        kind: 'v2',
        ref: 'v2:Q4 — common-mistake: argument order swapped',
        tier2: [PFG_FN_CALLS, V2_Q4],
      };
    }
    if (/spoterror-11-fn-name-typo/i.test(fname)) {
      return {
        drills: ['tier1:Q4:fn-call-no-amp'],
        kind: 'v2',
        ref: 'v2:Q4 — common-mistake: fn name typo (must match P3 signature)',
        tier2: [PFG_FN_CALLS, V2_Q4],
      };
    }
    if (/spoterror-12-no-prompt/i.test(fname)) {
      return {
        drills: ['tier1:Q4:prompt-for-count'],
        kind: 'v2',
        ref: 'v2:Q4 — common-mistake: cin >> count with no prompt',
        tier2: [PFG_MAIN_COMPOSE, V2_Q4],
      };
    }
    if (/spoterror-13-array-size-too-small/i.test(fname)) {
      return {
        drills: ['tier1:Q4:struct-array-decl'],
        kind: 'v2',
        ref: 'v2:Q4 — common-mistake: array size too small (< likely count)',
        tier2: [PFG_ARRAYS, V2_Q4],
      };
    }
    if (/whathappens-01/i.test(fname)) {
      return {
        drills: ALL_TIER1,
        kind: 'v2',
        ref: 'v2:Q4 — trace: user enters 3, predict output',
        tier2: [PFG_FOR_LOOP, V2_Q4],
      };
    }
    if (/whathappens-02/i.test(fname)) {
      return {
        drills: ['tier1:Q4:print-loop', 'tier1:Q4:read-count'],
        kind: 'v2',
        ref: 'v2:Q4 — trace: user enters 0, no iterations',
        tier2: [PFG_FOR_LOOP, V2_Q4],
      };
    }
    if (/whathappens-03/i.test(fname)) {
      return {
        drills: ['tier1:Q4:const-int-MAX', 'tier1:Q4:struct-array-decl'],
        kind: 'v2',
        ref: 'v2:Q4 — trace: forgot const → VLA (off-scope behaviour)',
        tier2: [PFG_VAR_DECL, V2_Q4],
      };
    }
    if (/whathappens-04/i.test(fname)) {
      return {
        drills: ['tier1:Q4:struct-array-decl'],
        kind: 'v2',
        ref: 'v2:Q4 — trace: array elements uninitialised before fn',
        tier2: [PFG_ARRAYS, V2_Q4],
      };
    }
    if (/whathappens-05/i.test(fname)) {
      return {
        drills: ['tier1:Q4:return-0'],
        kind: 'v2',
        ref: 'v2:Q4 — trace: missing return 0; behaviour',
        tier2: [PFG_RETURN, V2_Q4],
      };
    }
    return null; // unsalvageable — flag for archive
  }

  // S2 Template (typeline/fillslot/fulltype/orderlines)
  if (subdir === 'S2-Template') {
    // FillSlot line/token + typeline + fulltype + orderlines
    // Match by line index in filename or token name
    if (/fillslot-line-01-ln-const/i.test(fname) || /tk-const|tk-MAX/i.test(fname) ||
        /typeline-02-l03|typeline-12-l03/i.test(fname)) {
      return {
        drills: ['tier1:Q4:const-int-MAX'],
        kind: 'v2',
        ref: 'v2:Q4 — template fill: const int MAX = 700;',
        tier2: [PFG_VAR_DECL, V2_Q4],
      };
    }
    if (/fillslot-line-02-ln-arr/i.test(fname) ||
        /typeline-03-l04|typeline-13-l04/i.test(fname)) {
      return {
        drills: ['tier1:Q4:struct-array-decl'],
        kind: 'v2',
        ref: 'v2:Q4 — template fill: desk_data desks[MAX];',
        tier2: [PFG_ARRAYS, PFG_CUSTOM_TYPES, V2_Q4],
      };
    }
    if (/fillslot-line-03-ln-count/i.test(fname) || /tk-count/i.test(fname) ||
        /typeline-04-l05|typeline-14-l05/i.test(fname)) {
      return {
        drills: ['tier1:Q4:count-var-decl'],
        kind: 'v2',
        ref: 'v2:Q4 — template fill: int desk_num;',
        tier2: [PFG_VAR_DECL, V2_Q4],
      };
    }
    if (/fillslot-line-04-ln-cinread|tk-cin/i.test(fname) ||
        /typeline-06-l07|typeline-16-l07/i.test(fname)) {
      return {
        drills: ['tier1:Q4:read-count'],
        kind: 'v2',
        ref: 'v2:Q4 — template fill: cin >> desk_num;',
        tier2: [PFG_MAIN_COMPOSE, V2_Q4],
      };
    }
    if (/fillslot-line-05-ln-fncall/i.test(fname) ||
        /typeline-07-l08|typeline-17-l08/i.test(fname)) {
      return {
        drills: ['tier1:Q4:fn-call-no-amp'],
        kind: 'v2',
        ref: 'v2:Q4 — template fill: read_desks(desks, desk_num);',
        tier2: [PFG_FN_CALLS, PFG_PASS_BY_REF, SEM_Q4, V2_Q4],
      };
    }
    if (/fillslot-line-06-ln-forhdr/i.test(fname) ||
        /typeline-08-l09|typeline-18-l09/i.test(fname)) {
      return {
        drills: ['tier1:Q4:print-loop'],
        kind: 'v2',
        ref: 'v2:Q4 — template fill: for(int i=0;i<desk_num;i++)',
        tier2: [PFG_FOR_LOOP, V2_Q4],
      };
    }
    if (/fillslot-line-07-ln-return|tk-return/i.test(fname) ||
        /typeline-11-l15/i.test(fname)) {
      return {
        drills: ['tier1:Q4:return-0'],
        kind: 'v2',
        ref: 'v2:Q4 — template fill: return 0;',
        tier2: [PFG_RETURN, V2_Q4],
      };
    }
    if (/tk-cout|tk-endl/i.test(fname) ||
        /typeline-09-l11|typeline-10-l13/i.test(fname) ||
        /typeline-05-l06|typeline-15-l06/i.test(fname)) {
      return {
        drills: ['tier1:Q4:chained-cout', 'tier1:Q4:print-loop', 'tier1:Q4:prompt-for-count'],
        kind: 'v2',
        ref: 'v2:Q4 — template fill: cout chained line / prompt / endl',
        tier2: [PFG_FOR_LOOP, SEM_Q4_PRINT, V2_Q4],
      };
    }
    if (/tk-int/i.test(fname)) {
      return {
        drills: ['tier1:Q4:int-main', 'tier1:Q4:count-var-decl'],
        kind: 'v2',
        ref: 'v2:Q4 — template fill: int token (return type / count type)',
        tier2: [PFG_VAR_DECL, V2_Q4],
      };
    }
    if (/typeline-01-l01-int-main/i.test(fname)) {
      return {
        drills: ['tier1:Q4:int-main'],
        kind: 'v2',
        ref: 'v2:Q4 — template fill: int main() function header',
        tier2: [PFG_TYPE_DECL_PROG, SEM_Q4_MAIN, V2_Q4],
      };
    }
    if (/fulltype-01-V2.0/i.test(fname)) {
      return {
        drills: ALL_TIER1,
        kind: 'v2',
        ref: 'v2:Q4 — full main() type-out (desk_data, MAX=700)',
        tier2: [V2_Q4, PFG_TYPE_DECL_PROG, SEM_Q4_MAIN],
      };
    }
    if (/fulltype-02-practice/i.test(fname)) {
      return {
        drills: ALL_TIER1,
        kind: 'practice',
        ref: 'practice:Q4 — full main() type-out (computer_data, MAX=100)',
        tier2: [PRACTICE_Q4, PFG_TYPE_DECL_PROG, SEM_Q4_MAIN],
      };
    }
    if (/fulltype-/i.test(fname)) {
      return {
        drills: ALL_TIER1,
        kind: 'v2',
        ref: 'v2:Q4 — novel-entity full main() type-out',
        tier2: [V2_Q4, PFG_TYPE_DECL_PROG],
      };
    }
    if (/orderlines-/i.test(fname)) {
      return {
        drills: ALL_TIER1,
        kind: 'v2',
        ref: 'v2:Q4 — order the lines of the canonical main() skeleton',
        tier2: [V2_Q4, PFG_TYPE_DECL_PROG, SEM_Q4_MAIN],
      };
    }
    return null;
  }

  // S3-Components subdirs A-const / B-array / C-count / D-call / E-print / F-return
  if (subdir.match(/^[A-F]-/) || seg.includes('S3-Components')) {
    const block = subdir.charAt(0);
    const cmIds = (raw) => raw && raw.commonMistakeIds || [];
    if (block === 'A') {
      return {
        drills: ['tier1:Q4:const-int-MAX'],
        kind: 'v2',
        ref: 'v2:Q4 — Block A: const int MAX = N; (compile-time constant for array bound)',
        tier2: [PFG_VAR_DECL, SEM_Q4_MAX, V2_Q4, PRACTICE_Q4],
      };
    }
    if (block === 'B') {
      return {
        drills: ['tier1:Q4:struct-array-decl'],
        kind: 'v2',
        ref: 'v2:Q4 — Block B: desk_data desks[MAX]; (struct array sized by MAX)',
        tier2: [PFG_ARRAYS, PFG_CUSTOM_TYPES, V2_Q4, PRACTICE_Q4, TASKSHEET_P9],
      };
    }
    if (block === 'C') {
      return {
        drills: ['tier1:Q4:count-var-decl', 'tier1:Q4:prompt-for-count', 'tier1:Q4:read-count'],
        kind: 'v2',
        ref: 'v2:Q4 — Block C: int desk_num + cout prompt + cin >> desk_num',
        tier2: [PFG_VAR_DECL, PFG_MAIN_COMPOSE, V2_Q4, PRACTICE_Q4],
      };
    }
    if (block === 'D') {
      return {
        drills: ['tier1:Q4:fn-call-no-amp'],
        kind: 'v2',
        ref: 'v2:Q4 — Block D: read_desks(desks, desk_num); — no &, count not MAX',
        tier2: [PFG_FN_CALLS, PFG_PASS_BY_REF, SEM_Q4, V2_Q4, PRACTICE_Q4, TASKSHEET_P7],
      };
    }
    if (block === 'E') {
      return {
        drills: ['tier1:Q4:print-loop', 'tier1:Q4:chained-cout'],
        kind: 'v2',
        ref: 'v2:Q4 — Block E: print loop with chained cout (3 fields + endl)',
        tier2: [PFG_FOR_LOOP, PFG_ARRAYS_MAN, SEM_Q4_PRINT, V2_Q4, PRACTICE_Q4],
      };
    }
    if (block === 'F') {
      return {
        drills: ['tier1:Q4:return-0'],
        kind: 'v2',
        ref: 'v2:Q4 — Block F: return 0; (success exit, last statement)',
        tier2: [PFG_RETURN, V2_Q4, PRACTICE_Q4],
      };
    }
  }

  // S4-Compose
  if (subdir === 'S4-Compose') {
    if (/coldstart/i.test(fname)) {
      return {
        drills: ALL_TIER1,
        kind: 'v2',
        ref: 'v2:Q4 — S4 cold-start: novel entity + write Q2+Q3+Q4 chain',
        tier2: [V2_Q4, PFG_TYPE_DECL_PROG, SEM_Q4_MAIN],
      };
    }
    if (/end2end/i.test(fname)) {
      return {
        drills: ALL_TIER1,
        kind: 'v2',
        ref: 'v2:Q4 — S4 end-to-end pipeline: full main() with self-checklist',
        tier2: [V2_Q4, PFG_TYPE_DECL_PROG, SEM_Q4],
      };
    }
    if (/novel-/i.test(fname)) {
      return {
        drills: ALL_TIER1,
        kind: 'v2',
        ref: 'v2:Q4 — S4 novel-entity transfer: full main() for new entity',
        tier2: [V2_Q4, PFG_TYPE_DECL_PROG],
      };
    }
    if (/prac-trial-/i.test(fname)) {
      return {
        drills: ALL_TIER1,
        kind: 'practice',
        ref: 'practice:Q4 — S4 trial: write the practice computer_data main()',
        tier2: [PRACTICE_Q4, PFG_TYPE_DECL_PROG, SEM_Q4_MAIN],
      };
    }
    if (/scaffold-fillblank/i.test(fname)) {
      return {
        drills: ALL_TIER1,
        kind: 'v2',
        ref: 'v2:Q4 — S4 fill-blank scaffold matching test format',
        tier2: [V2_Q4, PFG_TYPE_DECL_PROG],
      };
    }
    if (/twopane/i.test(fname)) {
      return {
        drills: ALL_TIER1,
        kind: 'v2',
        ref: 'v2:Q4 — S4 two-pane: Q2 struct + Q3 read fn + Q4 main integration',
        tier2: [V2_Q4, PFG_TYPE_DECL_PROG, SEM_Q4],
      };
    }
    if (/v20-trial/i.test(fname)) {
      return {
        drills: ALL_TIER1,
        kind: 'v2',
        ref: 'v2:Q4 — S4 trial: write the V2.0 desk_data main()',
        tier2: [V2_Q4, PFG_TYPE_DECL_PROG, SEM_Q4_MAIN],
      };
    }
    return null;
  }

  // S5-Variations
  if (subdir === 'S5-Variations') {
    if (/diffmax/i.test(fname)) {
      return {
        drills: ['tier1:Q4:const-int-MAX', 'tier1:Q4:struct-array-decl'],
        kind: 'v2',
        ref: 'v2:Q4 — S5 variation: different MAX value, same skeleton',
        tier2: [V2_Q4, PFG_VAR_DECL, PFG_ARRAYS],
      };
    }
    if (/diffcount/i.test(fname)) {
      return {
        drills: ['tier1:Q4:count-var-decl', 'tier1:Q4:read-count'],
        kind: 'v2',
        ref: 'v2:Q4 — S5 variation: different count-var name, same role',
        tier2: [V2_Q4, PFG_VAR_DECL],
      };
    }
    if (/diffentity/i.test(fname)) {
      return {
        drills: ALL_TIER1,
        kind: 'v2',
        ref: 'v2:Q4 — S5 variation: different entity name, same skeleton',
        tier2: [V2_Q4, PFG_CUSTOM_TYPES],
      };
    }
    if (/difffields/i.test(fname)) {
      return {
        drills: ['tier1:Q4:print-loop', 'tier1:Q4:chained-cout'],
        kind: 'v2',
        ref: 'v2:Q4 — S5 variation: different field count in print loop',
        tier2: [V2_Q4, PFG_FOR_LOOP],
      };
    }
    if (/dynamiccount/i.test(fname)) {
      return {
        drills: ['tier1:Q4:read-count', 'tier1:Q4:print-loop'],
        kind: 'v2',
        ref: 'v2:Q4 — S5 variation: edge cases for count value (0, 1, MAX)',
        tier2: [V2_Q4, PFG_FOR_LOOP],
      };
    }
    if (/withprintfn/i.test(fname)) {
      return {
        drills: ['tier1:Q4:fn-call-no-amp', 'tier1:Q4:print-loop'],
        kind: 'variant',
        ref: 'variant:Q4 — printer-style: print fn supplied (Sem 1 2025 retired pattern)',
        tier2: [VARIANT_Q4, PFG_FN_CALLS],
      };
    }
    return null;
  }

  // S6-Speed
  if (subdir === 'S6-Speed') {
    if (/novel-timed/i.test(fname)) {
      return {
        drills: ALL_TIER1,
        kind: 'v2',
        ref: 'v2:Q4 — S6 timed novel: full main() under 90s',
        tier2: [V2_Q4, PFG_TYPE_DECL_PROG],
      };
    }
    if (/prac-timed/i.test(fname)) {
      return {
        drills: ALL_TIER1,
        kind: 'practice',
        ref: 'practice:Q4 — S6 timed: practice main() under 90s',
        tier2: [PRACTICE_Q4, PFG_TYPE_DECL_PROG],
      };
    }
    if (/v20-timed/i.test(fname)) {
      return {
        drills: ALL_TIER1,
        kind: 'v2',
        ref: 'v2:Q4 — S6 timed: V2.0 desk_data main() under 90s',
        tier2: [V2_Q4, PFG_TYPE_DECL_PROG],
      };
    }
    return null;
  }

  // cm-immunization (CM-* subdirs)
  if (subdir.startsWith('CM-') || file.includes('cm-immunization')) {
    // Map by parent CM dir
    const cmDir = seg.find(s => s.startsWith('CM-'));
    const cmMap = {
      'CM-Q4-MAX-as-define':         { atom: 'const-int-MAX',   desc: '#define vs const for MAX' },
      'CM-Q4-arg-order-swap':        { atom: 'fn-call-no-amp',  desc: 'argument order swap (count vs array)' },
      'CM-Q4-read-count-after-call': { atom: 'read-count',      desc: 'cin >> count AFTER fn call' },
      'CM-Q4-return-wrong-value':    { atom: 'return-0',        desc: 'return 1 / non-zero (wrong success code)' },
      'CM-calling-fn-before-def':    { atom: 'fn-call-no-amp',  desc: 'calling fn before its declaration is in scope' },
      'CM-fn-call-extra-amp':        { atom: 'fn-call-no-amp',  desc: 'extra & at call site (& only on signature)' },
      'CM-missing-include':          { atom: 'int-main',        desc: 'missing #include <iostream>' },
      'CM-missing-return-0':         { atom: 'return-0',        desc: 'missing return 0; in main' },
      'CM-wrong-namespace':          { atom: 'int-main',        desc: 'using std missing or wrong namespace' },
    };
    const m = cmMap[cmDir];
    if (m) {
      return {
        drills: [`tier1:Q4:${m.atom}`],
        kind: 'v2',
        ref: `v2:Q4 — CM immunization: ${m.desc}`,
        tier2: ATOM_TIER2[m.atom] || [V2_Q4],
      };
    }
    return null;
  }

  return null;
}

// ---------------------------------------------------------------------
// YAML rewriting
// ---------------------------------------------------------------------

function rewriteCard(file, txt, mapping) {
  let out = txt;

  // 1. Replace source.kind + source.ref
  // Match formats:
  //   source:
  //     kind: "v2"
  //     ref: "C++T2 spec §X"
  //   source:
  //     kind: v2
  //     ref: 'C++T2 ...'
  const sourceBlockRegex = /(\n[ \t]*source:[ \t]*\n[ \t]+kind:[ \t]*['"]?)([^'"\n]+)(['"]?[ \t]*\n[ \t]+ref:[ \t]*['"]?)([^'"\n]+)(['"]?)/;
  const m = out.match(sourceBlockRegex);
  if (m) {
    out = out.replace(sourceBlockRegex,
      `$1${mapping.kind}$3${mapping.ref}$5`);
  } else {
    // Try alternate: ref before kind, or single line
    const altRefRegex = /(\n[ \t]*ref:[ \t]*['"]?)([^'"\n]+)(['"]?)/;
    out = out.replace(altRefRegex, `$1${mapping.ref}$3`);
    const altKindRegex = /(\n[ \t]*kind:[ \t]*['"]?)([^'"\n]+)(['"]?)/;
    out = out.replace(altKindRegex, `$1${mapping.kind}$3`);
  }

  // 2. Add drills: + tier2: as new top-level YAML keys (insert after source block)
  //    Lint accepts unknown YAML keys, so this is safe.
  const drillsBlock =
    `drills:\n` +
    mapping.drills.map(d => `  - ${d}`).join('\n') + '\n' +
    `tier2:\n` +
    mapping.tier2.map(t => `  - ${t}`).join('\n') + '\n';

  // Remove any pre-existing drills:/tier2: blocks (rerun-safe)
  out = out.replace(/\ndrills:\n(?:[ \t]+-[ \t][^\n]*\n)+/g, '\n');
  out = out.replace(/\ntier2:\n(?:[ \t]+-[ \t][^\n]*\n)+/g, '\n');

  // Append drills+tier2 at end of file (before trailing newline if any)
  if (!out.endsWith('\n')) out += '\n';
  out += drillsBlock;

  return out;
}

// ---------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------

const files = glob.sync('**/*.yml', { cwd: L4_DIR });
let migrated = 0;
let archived = 0;
let unchanged = 0;
const archiveLog = [];
const atomCoverage = {};
for (const a of Object.keys(ATOM_LABEL)) atomCoverage[a] = 0;

if (!existsSync(ARCHIVE_DIR)) mkdirSync(ARCHIVE_DIR, { recursive: true });

for (const f of files) {
  const fullPath = resolve(L4_DIR, f);
  const txt = readFileSync(fullPath, 'utf8');
  const mapping = classifyCard(fullPath, null);

  if (!mapping) {
    // Unsalvageable — archive
    const archivePath = resolve(ARCHIVE_DIR, f);
    const archiveDir = resolve(archivePath, '..');
    if (!existsSync(archiveDir)) mkdirSync(archiveDir, { recursive: true });
    writeFileSync(archivePath, txt, 'utf8');
    archiveLog.push(f);
    archived++;
    continue;
  }

  const updated = rewriteCard(fullPath, txt, mapping);
  if (updated !== txt) {
    writeFileSync(fullPath, updated, 'utf8');
    migrated++;
    for (const d of mapping.drills) {
      const aKey = d.replace(/^tier1:Q4:/, '');
      if (atomCoverage[aKey] !== undefined) atomCoverage[aKey]++;
    }
  } else {
    unchanged++;
  }
}

// Delete archived originals from live tree
for (const f of archiveLog) {
  const fullPath = resolve(L4_DIR, f);
  try {
    require('fs').unlinkSync(fullPath);
  } catch (e) { /* noop */ }
}

// Report
console.log(`Migrated: ${migrated}`);
console.log(`Archived: ${archived}`);
console.log(`Unchanged: ${unchanged}`);
console.log('Per-atom coverage:');
for (const [a, c] of Object.entries(atomCoverage)) {
  console.log(`  ${a}: ${c}${c < 3 ? ' [GAP — < 3]' : ''}`);
}

// Write GAPS file
const gaps = [];
for (const [a, c] of Object.entries(atomCoverage)) {
  if (c < 3) gaps.push(`- ${a}: only ${c} cards drill this atom (target ≥3)`);
}
let gapsContent = `# B5_GAPS.md — L4 Q4 Write main coverage\n\n`;
gapsContent += `Run: ${new Date().toISOString()}\n`;
gapsContent += `Total cards processed: ${files.length}\n`;
gapsContent += `Migrated: ${migrated}\n`;
gapsContent += `Archived: ${archived}\n`;
gapsContent += `Unchanged: ${unchanged}\n\n`;
gapsContent += `## Per-atom coverage (target ≥3 each)\n\n`;
for (const [a, c] of Object.entries(atomCoverage)) {
  gapsContent += `- **${a}**: ${c} cards${c < 3 ? ' — GAP' : ' — OK'}\n`;
}
gapsContent += `\n## Gaps requiring author fill-in\n\n`;
gapsContent += gaps.length === 0 ? '_None — every atom has ≥3 cards drilling it._\n' : gaps.join('\n') + '\n';
gapsContent += `\n## Archived files (unsalvageable — no source-data anchor)\n\n`;
gapsContent += archiveLog.length === 0 ? '_None._\n' : archiveLog.map(x => `- ${x}`).join('\n') + '\n';
gapsContent += `\nArchive location: \`data/v2/archive/L4-fake-citations-2026-05-07/\`\n`;
writeFileSync(GAPS_FILE, gapsContent, 'utf8');
console.log(`\nGaps report → ${GAPS_FILE}`);
