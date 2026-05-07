# B3 Gaps — L2 (Q2 Write struct) re-grounding

Generated: 2026-05-07T13:36:06.695Z

## Drill atom coverage (target ≥3 cards each)

| Atom | Cards | Status |
|---|---:|---|
| q2-struct-keyword | 15 | OK |
| q2-entity-snake-case | 21 | OK |
| q2-opening-brace | 9 | OK |
| q2-field-type-decl | 101 | OK |
| q2-field-semi | 9 | OK |
| q2-closing-brace | 9 | OK |
| q2-trailing-semi | 41 | OK |
| q2-noun-to-type | 54 | OK |

## Re-grounding stats

- Total L2 cards scanned: 259
- Regrounded (replaced fake/planning-doc citation): 0
- Already real (verified citation, tier2 added): 259
- Skipped (parse fail or unknown ref form): 0

## Atoms below 3-card target

None — all 8 Q2 atoms covered ≥3 cards.

## Phase B3 summary

- **Initial state**: 259 L2 cards, ~211 cited the planning doc
  `docs/16_test2_specific_redesign_v2.md` (per audit: L2 was the worst-grounded
  level at 1% verified).
- **After B3 (first run)**: 255 cards regrounded, 2 already-real, 2 unknown
  (subsequently fixed in script). On second run, 259 already-real, 0 unknown.
- **0 cards now cite the planning doc**. All 259 cite a real on-disk source
  under `cpp-t2/source-data/`:
  - `pfg-content/part-2-organised-code/3-structuring-data/0-panorama/1-struct.md`
  - `pfg-content/part-2-organised-code/3-structuring-data/2-trailside/03-01-struct.md`
  - `pfg-content/part-2-organised-code/3-structuring-data/2-trailside/02-program-with-type-declarations.md`
  - `pfg-content/part-2-organised-code/3-structuring-data/3-explore/3-1-entity.md`
  - `tests/Test2-SIT102-practice-2026T1.txt` (computer_data, MAX=100)
  - `tests/test two attempt 1/Screenshot_20260507-152936.png` (desk_data V2.0)
  - `tests/test2-semester2-variant.txt` (printer_data variant)
- **Drills field added to all 259 cards**: `tier1:Q2:{atom-id}` across 8 atoms.
- **tier2 mirror field added**: machine-readable `tier2:{kind}:Q2 — {ref}`.
- **Archived (unsalvageable)**: 0 cards. Every card had enough internal
  content (canonical struct, prompt, atom-id, dir-name) to be confidently
  re-grounded against a real source. The hallucination was confined to
  citations; payloads themselves were sound.
- **Lint result (L2 only)**: 0 errors / 5 warnings (4 short-stem MCQs in
  CM immunization + 1 no-semicolon fill-in-blank cloze; all pre-existing,
  unchanged by B3).
