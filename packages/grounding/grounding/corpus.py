"""
ARCHITECTURAL INVARIANT: The corpus is READ for display and explanation ONLY.
It must never feed the rules engine or influence any computed number or
eligibility decision. Retrieval grounds citations; it never computes.

This module is intentionally isolated: it imports nothing from the rules engine,
the API, or any LLM provider.
"""
from __future__ import annotations

import json
import pathlib
from typing import Any

_CORPUS_DIR = pathlib.Path(__file__).parent.parent / "corpus"

_cache: dict[str, Any] | None = None


def _load_all() -> dict[str, Any]:
    corpus: dict[str, Any] = {}
    for path in sorted(_CORPUS_DIR.glob("*.json")):
        with path.open(encoding="utf-8") as fh:
            section = json.load(fh)
        corpus[section["citation_id"]] = section
    return corpus


def load_corpus() -> dict[str, Any]:
    """Return the full corpus keyed by citation_id. Result is cached after first load."""
    global _cache
    if _cache is None:
        _cache = _load_all()
    return _cache


def get_section(citation_id: str) -> dict[str, Any] | None:
    """Exact-match lookup by citation_id. Returns None if not found. No fuzzy matching."""
    return load_corpus().get(citation_id)
