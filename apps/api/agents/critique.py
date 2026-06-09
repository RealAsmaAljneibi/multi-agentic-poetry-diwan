"""
Critique pipeline — convene critics, run their verdicts, return structured result.

Why a thin pipeline rather than LangGraph: at prototype scale (3 critics, no
loops, no retries) a sequential function is faster to read, faster to debug,
and ships in two days. We can graduate to LangGraph in Phase 2 if the
orchestration grows real branches.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, asdict
from typing import Optional

from .personas import PERSONAS
from .llm import chat, chat_json


VALID_CRITICS = {"al_majidi_bin_zahir", "ousha_bint_khalifa", "sheikh_zayed"}


@dataclass
class CriticVerdict:
    agent_id: str
    verdict_md: str          # Markdown body the UI renders
    error: Optional[str] = None


@dataclass
class CritiqueResult:
    selected: list[str]
    lead: str
    convener_reasoning: str
    verdicts: list[dict]


def convene(verse_text: str) -> dict:
    """Ask the Convener which Critics should speak on this verse."""
    user_msg = f"The submitted Nabati verse is:\n\n{verse_text.strip()}\n\nWhich critic(s) should speak, and in what order?"
    result = chat_json(user_msg, PERSONAS["convener"])

    # Validate and sanitize
    selected_raw = result.get("selected", [])
    selected = [s for s in selected_raw if s in VALID_CRITICS]
    if not selected:
        # Fallback: include all three with Al-Majidi leading
        selected = ["al_majidi_bin_zahir", "ousha_bint_khalifa", "sheikh_zayed"]
    selected = selected[:3]  # cap

    lead = result.get("lead", selected[0])
    if lead not in selected:
        lead = selected[0]

    return {
        "selected": selected,
        "lead": lead,
        "reasoning": result.get("reasoning", "Multiple registers detected; convening the full council."),
    }


def critique_one(agent_id: str, verse_text: str, position: str = "") -> CriticVerdict:
    """Run a single critic over a verse."""
    if agent_id not in PERSONAS:
        return CriticVerdict(agent_id=agent_id, verdict_md="", error="Unknown critic.")

    user_msg = f"""A poet has submitted the following verse to the Majlis for your critique.{position}

Verse:
{verse_text.strip()}

Render your verdict according to your school's principles and your output format. Be specific. Quote the line you address before you address it.
"""
    try:
        body = chat(user_msg, PERSONAS[agent_id], max_tokens=900)
        return CriticVerdict(agent_id=agent_id, verdict_md=body)
    except Exception as e:
        return CriticVerdict(
            agent_id=agent_id,
            verdict_md="",
            error=f"This critic could not be reached. ({type(e).__name__})",
        )


def run_critique(verse_text: str, forced_critics: list[str] | None = None) -> dict:
    """
    Full pipeline: convene → critique each in order → return structured result.

    If `forced_critics` is provided, the Convener step is skipped and exactly those
    critics speak (in the given order). This supports the "Convene with this Critic
    alone" flow from the poet pages.
    """
    if not verse_text or not verse_text.strip():
        return {
            "error": "No verse submitted.",
            "selected": [],
            "lead": "",
            "convener_reasoning": "",
            "verdicts": [],
        }

    if forced_critics:
        # Sanitise to only valid agents, preserving order, deduped, capped at 3
        seen = set()
        cleaned: list[str] = []
        for cid in forced_critics:
            if cid in VALID_CRITICS and cid not in seen:
                cleaned.append(cid)
                seen.add(cid)
            if len(cleaned) >= 3:
                break
        if not cleaned:
            # fall back to normal convene if the input was bogus
            plan = convene(verse_text)
        else:
            plan = {
                "selected": cleaned,
                "lead": cleaned[0],
                "reasoning": (
                    f"Summoned directly: the user requested this critic{'s' if len(cleaned) > 1 else ''} "
                    f"speak on the verse without the Convener's selection."
                ),
            }
    else:
        plan = convene(verse_text)

    verdicts = []
    for i, agent_id in enumerate(plan["selected"]):
        position = ""
        if i > 0:
            position = f" You are speaking after {plan['selected'][i-1].replace('_', ' ').title()}; you may build on or temper their reading if you choose, but render your own verdict in full."
        v = critique_one(agent_id, verse_text, position=position)
        verdicts.append(asdict(v))

    return {
        "selected": plan["selected"],
        "lead": plan["lead"],
        "convener_reasoning": plan["reasoning"],
        "verdicts": verdicts,
    }


# ── Qāfiyah quick analyzer (deterministic, no LLM) ──────────────────────
# Why this is here: the rhyme judgment is the rigorous axis in Nabati. We
# can run a basic check ourselves before the LLM speaks, so the UI can show
# a quick "rhyme detected: ر" badge and the Critic prose can build on it.

ARABIC_LETTER = re.compile(r'[ء-ي]')
DIACRITICS = re.compile(r'[ً-ْٰ]')


def detect_qafiyah(verse_text: str) -> dict:
    """
    Naive qāfiyah detector: split into lines, strip diacritics, take the last
    Arabic letter of each line, see if they agree. Honest about its limits.
    """
    lines = [l.strip() for l in verse_text.splitlines() if l.strip()]
    if not lines:
        return {"detected": None, "consistent": False, "lines": 0, "note": "no lines"}

    last_letters = []
    for line in lines:
        cleaned = DIACRITICS.sub('', line)
        letters = ARABIC_LETTER.findall(cleaned)
        if letters:
            last_letters.append(letters[-1])

    if not last_letters:
        return {"detected": None, "consistent": False, "lines": len(lines), "note": "no Arabic letters"}

    consistent = len(set(last_letters)) == 1
    return {
        "detected": last_letters[-1],
        "rawiyy_candidates": list(set(last_letters)),
        "consistent": consistent,
        "lines": len(lines),
        "note": "consistent rawiyy across all lines" if consistent else "rhyme letter shifts between lines",
    }
