"""Generate src/data and public/data grammar JSON files."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIRS = [ROOT / "src" / "data", ROOT / "public" / "data"]

# (title, rule, example, exampleKo, tip, quizzes[(sentence, answer, choices)])
Quiz = tuple[str, str, list[str]]
Lesson = tuple[str, str, str, str, str, list[Quiz]]


def pack(lesson: Lesson) -> dict:
    title, rule, ex, exko, tip, quizzes = lesson
    return {
        "title": title,
        "rule": rule,
        "example": ex,
        "exampleKo": exko,
        "tip": tip,
        "quizzes": [
            {"sentence": s, "answer": a, "choices": c} for s, a, c in quizzes
        ],
    }


def write_level(name: str, lessons: list[Lesson]) -> None:
    data = [pack(l) for l in lessons]
    for d in OUT_DIRS:
        d.mkdir(parents=True, exist_ok=True)
        path = d / f"{name}Grammar.json"
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Wrote {path} ({len(data)} lessons, {sum(len(l[5]) for l in lessons)} quizzes)")


# --- Import lesson banks ---
from grammar_content_middle import MIDDLE  # noqa: E402
from grammar_content_high import HIGH  # noqa: E402
from grammar_content_basic import BASIC  # noqa: E402
from grammar_content_practical import PRACTICAL  # noqa: E402


if __name__ == "__main__":
    write_level("middle", MIDDLE)
    write_level("high", HIGH)
    write_level("basic", BASIC)
    write_level("practical", PRACTICAL)
