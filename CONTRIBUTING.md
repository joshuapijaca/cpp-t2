# CONTRIBUTING — How to Update Without Drift

This project's source-of-truth is durable and resistant to AI shortcut-taking. Updates are welcome — drift is not. Use this protocol.

---

## When to Update

| Trigger | Action |
|---------|--------|
| New evidence contradicts a decision in MISSION.md | Propose explicit re-litigation (see below) |
| Atom enumeration error found (missing prereq, wrong dep) | Fix in `docs/07_master_plan.md` + CHANGELOG entry |
| Test 2 variant differs from current Q1-Q4 shape | Update `docs/03_mastery_state_t2.md` variation hypothesis + CHANGELOG |
| Build-tool / framework version bump | Update `CLAUDE.md` tech stack table + CHANGELOG |
| User authorizes new feature | Update spec + CHANGELOG with authorization quote |
| Authoring template improvement | Update `docs/07_master_plan.md` schemas + CHANGELOG |

| Forbidden trigger | Why |
|------|-----|
| "I think we should also add SRS" | See ANTIPATTERNS #3 |
| "Maybe runtime AI grading just for partial credit" | See ANTIPATTERNS #4 |
| "Let's reuse the IT ELO cards" | See ANTIPATTERNS #6 |
| "It would be cleaner if we skipped Level 0 axioms" | See ANTIPATTERNS #2 |
| Speculative-future feature flags | See ANTIPATTERNS #14 |

---

## Update Protocol

### For routine updates (atom additions, schema refinements, doc clarifications)

1. Edit the affected file in `docs/`
2. Append CHANGELOG entry with:
   - Date
   - Decision summary
   - Why (cite evidence)
   - Source files affected
   - Authorized by (user / explicit request / measured failure)
3. If touching `docs/07_master_plan.md`, ensure consistency with `MISSION.md` — flag any conflict for user decision

### For non-routine updates (re-litigating a settled decision)

A decision is settled if it appears in MISSION.md or has a CHANGELOG entry. Re-litigation requires:

1. **Cite measured failure**. Not speculation. Concrete evidence: failed mock exam, student stuck at specific atom, build artifact broke an acceptance criterion.
2. **Show why original rejection no longer applies**. The original `Why` line in CHANGELOG must be addressed.
3. **Get explicit user authorization**. Quote the user's exact authorization in the new CHANGELOG entry.
4. **Update MISSION.md only after authorization**. Don't soften wording in MISSION.md as a backdoor.

### For experimental ideas (not yet authorized)

Park them. Create `docs/EXPERIMENTS.md` if it doesn't exist. Add as a numbered hypothesis with:
- What's being tested
- Why current spec doesn't cover it
- Required evidence to promote to MISSION

Do not implement. Do not propose mid-conversation as if settled.

---

## CHANGELOG Entry Template

```
## YYYY-MM-DD | brief title

**Decision**: what changed in 1 sentence.

**Why**: motivation. Cite docs/##_filename.md or measurement or user quote.

**Source**: list every file modified.

**Authorized by**: one of:
  - user (explicit request: "...quoted instruction...")
  - user (verbal agreement to proposed change)
  - claude-internal (typo / formatting / consistency fix; no user-visible meaning change)
  - measured failure ("acceptance criterion X failed: Y, fix is Z")
```

claude-internal is reserved for spelling/formatting fixes and link updates. Anything affecting the spec's *meaning* requires explicit user authorization.

---

## Questions to Ask Before Editing

1. Does this change conflict with anything in MISSION.md? → Pause, ask user.
2. Does this contradict ANTIPATTERNS.md? → STOP. Re-read.
3. Am I about to skip writing a CHANGELOG entry? → Don't.
4. Is this change motivated by AI's preference for "cleanness" rather than measured need? → Consider not making it.
5. Does this introduce a feature the user explicitly listed in "things I don't need"? → STOP.
6. Is the canonical doc (`docs/07_master_plan.md`) being updated to match? → It must be.

---

## Test Before Merging Spec Changes

Run mental acceptance check (also enforceable as a build step later):

| Test | Pass condition |
|------|--------------|
| Strict prereq order | Every atom's `deps` resolves to atoms in earlier or same level |
| ≤7 words per memorize-card fact | Lint check |
| Card type ∈ {memorize, mcq, trace, write} | No 5th type |
| MCQ ratio ≤20% | Volume calc |
| RDS at Level 9 | Sequence position 11/19 |
| Forward-only | No back-jump UI in any spec'd component |
| Offline grading only | No `fetch(*api*)` in any code spec |
| No save state | No `localStorage.setItem` in any code spec |
| No timeframes | No "week N" / calendar / hour estimate in non-CHANGELOG docs |

If any test fails, the change isn't ready.
