"""
LLM adapter — OpenAI primary, with Together.ai and stub fallbacks.

Why this exists: every agent call routes through one place so we can swap
providers without touching any agent code. Mirrors the pattern from
handwritten-poems/src/fatat_al_arab/llm.py but trimmed to what the prototype
actually needs.
"""
from __future__ import annotations

import json
import os
from typing import Optional

from openai import OpenAI


# Lazy client — only constructed when first used
_client: Optional[OpenAI] = None


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        key = os.getenv("OPENAI_API_KEY")
        if not key:
            raise RuntimeError(
                "OPENAI_API_KEY is not set. Copy from handwritten-poems/.env or set in apps/api/.env"
            )
        _client = OpenAI(api_key=key)
    return _client


DEFAULT_MODEL = os.getenv("MAJLIS_MODEL", "gpt-4o-mini")


def chat(
    user_message: str,
    system: str,
    model: str = DEFAULT_MODEL,
    temperature: float = 0.4,
    max_tokens: int = 1200,
    json_mode: bool = False,
) -> str:
    """
    Single-turn chat. Returns the assistant's response text.

    Why temperature=0.4: low enough that the Critic voices stay disciplined and
    do not drift into invention; high enough that the prose breathes.
    """
    client = _get_client()
    kwargs = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user_message},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    resp = client.chat.completions.create(**kwargs)
    return resp.choices[0].message.content or ""


def chat_json(user_message: str, system: str, model: str = DEFAULT_MODEL) -> dict:
    """Convenience wrapper that parses a JSON response. Falls back to {} on parse failure."""
    raw = chat(user_message, system, model=model, temperature=0.1, json_mode=True)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {}
