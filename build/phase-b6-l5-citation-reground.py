#!/usr/bin/env python3
"""
Phase B6 — L5 citation re-grounding.

Task:
  1. Add `drills:` field after qTags: (lists Q-tracks card covers).
     - Mocks (full-paper) drill all 4: [Q1, Q2, Q3, Q4]
     - Per-Q L5 cards drill just their qTag (1-element list)
  2. Standardize source.kind taxonomy:
     - V2.0 references (Test Code: V2.0, M02, M09 desk variants) → kind: v2
     - Practice paper (Test2-SIT102-practice-2026T1.txt) → kind: practice
     - Semester2 / V0.0 practice → kind: practice-variant
     - Seminar references → kept as kind: seminar
  3. Idempotent — safe to re-run.

In-place edit. No new files created.
"""
from __future__ import annotations
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
L5_DIR = ROOT / "data" / "v2" / "cards" / "L5"
MOCKS_DIR = ROOT / "data" / "v2" / "mocks"

V20_REF_PATTERNS = [
    re.compile(r"V2\.0", re.IGNORECASE),
    re.compile(r"v20[\-_]"),
    re.compile(r"sum-positive[-_]desk", re.IGNORECASE),
    re.compile(r"find-max[-_]desk[-_]q", re.IGNORECASE),
]
SEMINAR_PATTERN = re.compile(r"seminar", re.IGNORECASE)
PRACTICE_VARIANT_PATTERNS = [
    re.compile(r"semester2", re.IGNORECASE),
    re.compile(r"V0\.0", re.IGNORECASE),
    re.compile(r"variant", re.IGNORECASE),
]


def parse_qtags(text: str) -> list[str]:
    """Pull qTags list out of YAML text. Supports both inline and multiline."""
    inline = re.search(r"qTags:\s*\[([^\]]+)\]", text)
    if inline:
        return [t.strip().strip('"').strip("'") for t in inline.group(1).split(",") if t.strip()]
    multi = re.search(r"qTags:\s*\n((?:\s*-\s*[^\n]+\n)+)", text)
    if multi:
        return [
            line.strip().lstrip("-").strip().strip('"').strip("'")
            for line in multi.group(1).splitlines()
            if line.strip()
        ]
    return []


def is_full_mock(path: Path) -> bool:
    """A full mock (M01..M09) drills all 4 Q-tracks simultaneously."""
    return path.parent.name == "mocks"


def determine_drills(path: Path, qtags: list[str]) -> list[str]:
    if is_full_mock(path):
        return ["Q1", "Q2", "Q3", "Q4"]
    return qtags


def determine_source_kind(text: str, current_kind: str) -> str:
    if SEMINAR_PATTERN.search(text):
        return "seminar"
    for p in V20_REF_PATTERNS:
        if p.search(text):
            return "v2"
    for p in PRACTICE_VARIANT_PATTERNS:
        if p.search(text):
            return "practice-variant"
    if current_kind in ("practice", "v2", "seminar", "practice-variant"):
        return current_kind
    return "practice"


def add_drills_field(text: str, drills: list[str]) -> str:
    if re.search(r"^drills:", text, re.MULTILINE):
        return text  # idempotent — already added
    drills_yaml = "drills: [" + ", ".join(f'"{d}"' for d in drills) + "]"
    inline_qtags = re.search(r"^qTags:\s*\[[^\]]+\]\s*$", text, re.MULTILINE)
    if inline_qtags:
        end = inline_qtags.end()
        return text[:end] + "\n" + drills_yaml + text[end:]
    multi_qtags = re.search(
        r"^qTags:\s*\n((?:\s*-\s*[^\n]+\n)+)", text, re.MULTILINE
    )
    if multi_qtags:
        end = multi_qtags.end()
        return text[:end] + drills_yaml + "\n" + text[end:]
    return text


def normalize_source_kind(text: str) -> str:
    m = re.search(r"^(\s*)kind:\s*['\"]?([\w\-]+)['\"]?", text, re.MULTILINE)
    if not m:
        return text
    current = m.group(2)
    new_kind = determine_source_kind(text, current)
    if new_kind == current:
        return text
    return re.sub(
        r"(^\s*kind:\s*)['\"]?[\w\-]+['\"]?",
        rf'\1"{new_kind}"',
        text,
        count=1,
        flags=re.MULTILINE,
    )


def process(path: Path) -> dict:
    original = path.read_text(encoding="utf-8")
    qtags = parse_qtags(original)
    drills = determine_drills(path, qtags)
    text = original
    text = add_drills_field(text, drills)
    text = normalize_source_kind(text)
    if text != original:
        path.write_text(text, encoding="utf-8")
        return {"path": str(path.relative_to(ROOT)), "changed": True, "drills": drills}
    return {"path": str(path.relative_to(ROOT)), "changed": False, "drills": drills}


def main():
    files = sorted(list(L5_DIR.rglob("*.yml")) + list(MOCKS_DIR.glob("*.yml")))
    results = [process(p) for p in files]
    changed = sum(1 for r in results if r["changed"])
    print(f"Phase B6: {len(files)} files scanned, {changed} files modified.")
    by_kind: dict[str, int] = {}
    for p in files:
        m = re.search(
            r"^\s*kind:\s*['\"]?([\w\-]+)['\"]?", p.read_text(encoding="utf-8"), re.MULTILINE
        )
        if m:
            by_kind[m.group(1)] = by_kind.get(m.group(1), 0) + 1
    print("Source kind distribution after run:")
    for k, v in sorted(by_kind.items()):
        print(f"  {k}: {v}")
    return results


if __name__ == "__main__":
    main()
