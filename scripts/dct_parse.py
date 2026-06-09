"""
dct_parse.py — parse a fetched DCT poem page (from web_fetch markdown output)
and produce a structured verse record.

Why this exists: the DCT web_fetch returns Markdown where the poem body lands
as a two-column table — sadr on the right, ajuz on the left. We need to
extract those bayts in order and reconstruct each as a single Arabic line.

Usage (programmatic):
  from scripts.dct_parse import parse_poem_md
  rec = parse_poem_md(markdown_text, source_url, agent_id)

This module is intentionally pure (no network) so it's testable and reusable.
"""
from __future__ import annotations

import datetime as dt
import hashlib
import re


def parse_poem_md(md: str, source_url: str, agent_id: str) -> dict:
    """
    Parse the rendered DCT poem markdown and return a structured record.

    Returns dict with: agent_id, verse_id, source_url, retrieved_at, title,
    poet_name_dct, text_ar, bayts (list of {sadr, ajuz}), bahr, qafiya,
    diwan, era, note (commentary), bayt_count, raw_meta.
    """
    title = _extract_title(md)
    poet_name = _extract_poet_name(md)
    bahr = _extract_bahr(md)
    diwan = _extract_diwan(md)
    note = _extract_note(md)
    bayts = _extract_bayts(md)

    # Reconstruct full Arabic body — one bayt per line (sadr then ajuz, separated by ‏)
    text_lines: list[str] = []
    for b in bayts:
        # Arabic poetry is read sadr-first (right side), then ajuz (left).
        # The DCT table has sadr on the LEFT in markdown order though, so check both.
        text_lines.append(f"{b['sadr']} {b['ajuz']}".strip())
    text_ar = "\n".join(text_lines)

    # Detect rhyme letter as the last Arabic letter of the first bayt's ajuz
    qafiya = ""
    if bayts:
        for ch in reversed(bayts[0]["ajuz"]):
            if "؀" <= ch <= "ۿ":
                qafiya = ch
                break

    return {
        "agent_id": agent_id,
        "verse_id": f"DCT-{hashlib.sha1(source_url.encode()).hexdigest()[:8]}",
        "source_url": source_url,
        "retrieved_at": dt.datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "title": title,
        "poet_name_dct": poet_name,
        "text_ar": text_ar,
        "bayts": bayts,
        "bayt_count": len(bayts),
        "meta": {
            "meter": bahr,
            "rhyme": qafiya,
            "source": diwan,
            "era": "modern",  # all three anchors are modern enough; refine per-poet later
        },
        "note": note,
    }


def _extract_title(md: str) -> str:
    """Title is in the meta-DC.title or as the H1 line just below the masthead."""
    m = re.search(r"^meta-DC\.title:\s*(.+?)\s*-\s*[^\-]+-\s*الموسوعة", md, re.MULTILINE)
    if m:
        return m.group(1).strip()
    # Fallback: first standalone heading-ish line after the breadcrumbs
    return ""


def _extract_poet_name(md: str) -> str:
    m = re.search(r"\[([^\]]+)\]\(https://poetry\.dct\.gov\.ae/poets/\d+", md)
    return m.group(1).strip() if m else ""


def _extract_bahr(md: str) -> str:
    m = re.search(r"\[([^\]]+)\]\(https://poetry\.dct\.gov\.ae/bahrs/\d+", md)
    return m.group(1).strip() if m else ""


def _extract_diwan(md: str) -> str:
    m = re.search(r"\[([^\]]+)\]\(https://poetry\.dct\.gov\.ae/diwan/\d+", md)
    return m.group(1).strip() if m else ""


def _extract_note(md: str) -> str:
    """The commentary line that often appears under the bahr/diwan tags."""
    # Look for "قصيدة ... الفائزة" or any short Arabic note line
    m = re.search(r"(قصيدة[^\n|]{5,160})", md)
    if m and "[" not in m.group(1):
        return m.group(1).strip()
    return ""


# Match a single markdown table row of the form: | sadr | ajuz |
TABLE_ROW_RE = re.compile(r"^\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$", re.MULTILINE)


def _extract_bayts(md: str) -> list[dict]:
    """
    Pull the verses out of the markdown table.

    The DCT page renders bayts as a 2-column table where each row holds one bayt.
    Skip the header row "| --- | --- |" and any rows where the second column is "---".
    Strip the directional markers and decorative dashes Markdown sometimes adds.
    """
    bayts: list[dict] = []
    for m in TABLE_ROW_RE.finditer(md):
        a = m.group(1).strip()
        b = m.group(2).strip()
        # Skip the markdown table separator
        if set(a) <= set("- ") or set(b) <= set("- "):
            continue
        # Skip rows that aren't poetry (e.g., dimension labels)
        if not _looks_like_arabic_verse(a) or not _looks_like_arabic_verse(b):
            continue
        # Clean up internal extra spaces but keep ZWNJ/tatweel as the manuscript has them
        a_clean = re.sub(r"\s+", " ", a)
        b_clean = re.sub(r"\s+", " ", b)
        bayts.append({"sadr": a_clean, "ajuz": b_clean})
    return bayts


def _looks_like_arabic_verse(s: str) -> bool:
    if len(s) < 4:
        return False
    arabic_count = sum(1 for ch in s if "؀" <= ch <= "ۿ")
    return arabic_count >= 4
