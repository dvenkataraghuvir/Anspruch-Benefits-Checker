"""Consistency tests for the grounding corpus.

Two guarantees:
  1. Every citation_id the Wohngeld module can emit has a corpus entry.
  2. Every corpus entry has valid, non-null metadata and an empty text field
     (text must be pasted from the official statute — never generated).
"""
from __future__ import annotations

from datetime import date

import pytest

from grounding.corpus import get_section, load_corpus

# ── Known citation_id set ─────────────────────────────────────────────────────
#
# All citation_ids the Wohngeld module references across its code paths —
# covering every eligibility gate (§7, §21) and every formula section
# (§12, §16, §19, Anlagen 1–3).
# Hardcoded here because _citation() is a private helper; the full set spans
# more sections than the single "§ 19 WoGG" the current helper emits.
#
WOHNGELD_CITATION_IDS: frozenset[str] = frozenset({
    "§ 7 WoGG",
    "§ 12 WoGG",
    "§ 16 WoGG",
    "§ 19 WoGG",
    "§ 21 WoGG",
    "WoGG Anlage 1",
    "WoGG Anlage 2",
    "WoGG Anlage 3",
})

# The citation_id emitted by module.py's _citation() helper today.
# Update this constant whenever the module starts emitting additional ids.
_CURRENTLY_EMITTED = {"§ 19 WoGG"}


# ── Corpus completeness ───────────────────────────────────────────────────────

def test_corpus_loads_without_error():
    corpus = load_corpus()
    assert isinstance(corpus, dict)
    assert len(corpus) > 0


def test_all_wohngeld_citation_ids_have_corpus_entry():
    corpus = load_corpus()
    missing = WOHNGELD_CITATION_IDS - corpus.keys()
    assert not missing, (
        f"Corpus is missing entries for: {sorted(missing)}\n"
        "Add a JSON file in packages/grounding/corpus/ for each."
    )


def test_corpus_contains_no_unexpected_extra_ids():
    corpus = load_corpus()
    extra = corpus.keys() - WOHNGELD_CITATION_IDS
    assert not extra, (
        f"Corpus has entries not listed in WOHNGELD_CITATION_IDS: {sorted(extra)}\n"
        "Either add them to WOHNGELD_CITATION_IDS or remove the file."
    )


def test_currently_emitted_citation_is_in_corpus():
    for cid in _CURRENTLY_EMITTED:
        assert get_section(cid) is not None, (
            f"The engine emits citation_id {cid!r} but the corpus has no entry for it."
        )


# ── Per-entry metadata validity ───────────────────────────────────────────────

@pytest.mark.parametrize("citation_id", sorted(WOHNGELD_CITATION_IDS))
def test_entry_has_required_metadata(citation_id: str):
    section = get_section(citation_id)
    assert section is not None, f"No corpus entry for {citation_id!r}"
    assert section.get("citation_id") == citation_id
    assert section.get("title"), f"{citation_id}: 'title' is empty"
    assert section.get("source_url"), f"{citation_id}: 'source_url' is empty"
    assert section.get("effective_date"), f"{citation_id}: 'effective_date' is empty"
    assert section.get("retrieved_date"), f"{citation_id}: 'retrieved_date' is empty"


@pytest.mark.parametrize("citation_id", sorted(WOHNGELD_CITATION_IDS))
def test_effective_date_is_valid_iso(citation_id: str):
    section = get_section(citation_id)
    assert section is not None
    date.fromisoformat(section["effective_date"])  # raises ValueError if invalid


@pytest.mark.parametrize("citation_id", sorted(WOHNGELD_CITATION_IDS))
def test_has_at_least_one_chunk(citation_id: str):
    section = get_section(citation_id)
    assert section is not None
    chunks = section.get("chunks", [])
    assert isinstance(chunks, list) and len(chunks) > 0, (
        f"{citation_id}: 'chunks' must be a non-empty list"
    )
    for chunk in chunks:
        assert chunk.get("chunk_id"), f"{citation_id}: a chunk is missing 'chunk_id'"
        assert chunk.get("heading"), f"{citation_id}: chunk {chunk.get('chunk_id')!r} is missing 'heading'"
        assert "text" in chunk, f"{citation_id}: chunk {chunk.get('chunk_id')!r} is missing 'text' key"


@pytest.mark.parametrize("citation_id", sorted(WOHNGELD_CITATION_IDS))
def test_no_text_fields_contain_generated_content(citation_id: str):
    # ALL text fields must be empty strings — official statute text is pasted
    # by the user from the dated source, never generated or invented here.
    section = get_section(citation_id)
    assert section is not None
    for chunk in section.get("chunks", []):
        assert chunk["text"] == "", (
            f"{citation_id} chunk {chunk['chunk_id']!r}: text must be empty; "
            "paste official statute text from the source URL, do not generate it."
        )


# ── Loader contract ───────────────────────────────────────────────────────────

def test_get_section_returns_none_for_unknown_id():
    assert get_section("§ 999 WoGG") is None


def test_get_section_exact_match_only():
    # Partial or case-variant strings must not match.
    assert get_section("19 WoGG") is None
    assert get_section("§19 WoGG") is None    # missing space
    assert get_section("§ 19 wogg") is None   # wrong case
