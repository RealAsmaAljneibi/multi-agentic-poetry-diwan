"""
The Poetic Majlis — FastAPI service.

Routes:
  GET  /api/health
  GET  /api/poets             → roster (Critics + library poets)
  GET  /api/library           → all 80 verses (paginated)
  GET  /api/library/search    → search by query, poet, genre, emotion
  GET  /api/dictionary        → all entries
  GET  /api/dictionary/search → search by Arabic or English term
  POST /api/agents/convene    → who should speak (no critique yet)
  POST /api/agents/critique   → full Live Debate verdict pipeline
  POST /api/submissions       → archive a submission (public/private)
  GET  /api/submissions       → list public submissions only
  POST /api/dictionary/propose → propose a new term (public/private)

Why FastAPI: thin, async-friendly, runs in one process, clean OpenAPI for the
Next.js client. SQLite for storage — zero-config and the dataset is small.
"""
from __future__ import annotations

import json
import os
import sqlite3
import time
from contextlib import contextmanager
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Load .env from apps/api/.env if present
load_dotenv(Path(__file__).parent / ".env")

from agents.critique import run_critique, convene, detect_qafiyah


ROOT = Path(__file__).parent
DATA = ROOT / "data"
# DB path is overridable via env so tests / sandboxes can use /tmp
DB_PATH = Path(os.getenv("MAJLIS_DB_PATH", str(ROOT / "majlis.db")))


app = FastAPI(title="The Poetic Majlis", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Storage ────────────────────────────────────────────────────────────

@contextmanager
def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


# ── Cached static data ─────────────────────────────────────────────────

with open(DATA / "poets.json", encoding="utf-8") as f:
    POETS = json.load(f)
with open(DATA / "library.json", encoding="utf-8") as f:
    LIBRARY = json.load(f)
with open(DATA / "dictionary.json", encoding="utf-8") as f:
    DICTIONARY = json.load(f)

# Optional t-SNE artefacts — present after `python3 scripts/build_tsne_map.py` runs
TSNE_POINTS: dict | None = None
FULL_POEMS: dict[str, list] | None = None
try:
    with open(DATA / "tsne_points.json", encoding="utf-8") as f:
        TSNE_POINTS = json.load(f)
    with open(DATA / "full_poems.json", encoding="utf-8") as f:
        FULL_POEMS = json.load(f)
except FileNotFoundError:
    # The t-SNE map is optional in v1 — endpoints that need it return 404 instead.
    pass

# Optional DCT corpus — present after `python3 scripts/dct_crawler.py …` runs.
# Maps agent_id → list of attested verse records with full provenance.
DCT_CORPUS: dict[str, list[dict]] = {}
try:
    with open(DATA / "dct_corpus.json", encoding="utf-8") as f:
        DCT_CORPUS = json.load(f)
except FileNotFoundError:
    pass

# Per-anchor Phase 2 context — biographical excerpt, authoritative diwan citation,
# verified-authority URL — shown when an anchor has no attested DCT verses yet.
ANCHOR_PHASE2_CONTEXT: dict[str, dict] = {}
try:
    with open(DATA / "anchor_phase2_context.json", encoding="utf-8") as f:
        raw = json.load(f)
        ANCHOR_PHASE2_CONTEXT = {k: v for k, v in raw.items() if not k.startswith("_")}
except FileNotFoundError:
    pass


# Initialise DB at import time so the schema is ready before the first
# request — startup events do not fire under TestClient without `with`.
def _ensure_schema():
    with db() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                kind TEXT NOT NULL,
                visibility TEXT NOT NULL,
                poet_handle TEXT,
                text_ar TEXT NOT NULL,
                translation_en TEXT,
                note TEXT,
                critique_json TEXT,
                created_at INTEGER NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_subs_visibility ON submissions(visibility);
            """
        )

_ensure_schema()


# ── Schemas ────────────────────────────────────────────────────────────

class CritiqueRequest(BaseModel):
    verse_text: str = Field(..., min_length=2, max_length=4000)
    # Optional: pin the critique to one or more specific critics, bypassing the Convener.
    # Useful when a user comes from a poet page and wants that poet alone to read their verse.
    forced_critics: list[str] | None = None


class ConveneRequest(BaseModel):
    verse_text: str = Field(..., min_length=2, max_length=4000)


class SubmitRequest(BaseModel):
    kind: str  # 'archive' | 'composition' | 'dictionary'
    visibility: str  # 'public' | 'private' | 'anonymous'
    poet_handle: str | None = None
    text_ar: str
    translation_en: str | None = None
    note: str | None = None
    run_critique: bool = False


class DictionaryProposeRequest(BaseModel):
    headword_ar: str
    headword_translit: str | None = None
    definition_ar: str
    definition_en: str | None = None
    semantic_field: list[str] = []
    visibility: str = "public"
    poet_handle: str | None = None


# ── Routes ─────────────────────────────────────────────────────────────

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "openai_key_set": bool(os.getenv("OPENAI_API_KEY")),
        "library_size": len(LIBRARY),
        "dictionary_size": len(DICTIONARY),
        "critics": [p["agent_id"] for p in POETS["deceased_masters_critics"]],
    }


@app.get("/api/poets")
def get_poets():
    return POETS


def _slugify(name: str) -> str:
    """Stable URL-safe id derived from a poet's English name."""
    out = []
    for ch in name.lower():
        if ch.isalnum():
            out.append(ch)
        elif ch in (" ", "-", "_"):
            out.append("-")
    s = "".join(out).strip("-")
    while "--" in s:
        s = s.replace("--", "-")
    return s


def _contemporary_poets_index() -> dict[str, dict]:
    """
    Build a lookup of {slug: {name_en, name_ar, verses, fingerprint}} for every
    poet appearing in the library. Computed on demand — small enough that it
    doesn't matter at our scale.
    """
    by_poet: dict[str, list[dict]] = {}
    for v in LIBRARY:
        by_poet.setdefault(v["poet_en"], []).append(v)

    index: dict[str, dict] = {}
    for poet_en, verses in by_poet.items():
        poet_ar = verses[0].get("poet_ar", "")
        slug = _slugify(poet_en)
        # Fingerprint: count of verses by genre and emotion (using whatever labels are populated)
        genre_counts: dict[str, int] = {}
        emotion_counts: dict[str, int] = {}
        imagery_bag: dict[str, int] = {}
        for v in verses:
            g = (v.get("genre_en") or "").split("(")[0].strip()
            if g:
                genre_counts[g] = genre_counts.get(g, 0) + 1
            e = (v.get("emotion_en") or "").strip()
            if e:
                emotion_counts[e] = emotion_counts.get(e, 0) + 1
            for tag in (v.get("imagery_tags") or "").split(","):
                tag = tag.strip()
                if tag:
                    imagery_bag[tag] = imagery_bag.get(tag, 0) + 1
        index[slug] = {
            "slug": slug,
            "name_en": poet_en,
            "name_ar": poet_ar,
            "kind": "contemporary",
            "verses": verses,
            "verse_count": len(verses),
            "fingerprint": {
                "genres": sorted(genre_counts.items(), key=lambda kv: -kv[1]),
                "emotions": sorted(emotion_counts.items(), key=lambda kv: -kv[1]),
                "imagery": sorted(imagery_bag.items(), key=lambda kv: -kv[1])[:12],
            },
        }
    return index


@app.get("/api/poets/{poet_id}")
def get_poet(poet_id: str):
    """
    Return a poet's profile.

    Two kinds: an anchor Critic (Al-Mājidī, Ousha, Sheikh Zayed) returns a rich
    profile plus an explicit Phase-2 marker noting that verified verses are
    pending the DCT Abu Dhabi crawl. A contemporary library poet returns their
    full attested verse list and a derived genre/emotion/imagery fingerprint.
    """
    # Anchor critic?
    for c in POETS["deceased_masters_critics"]:
        if c["agent_id"] == poet_id or _slugify(c["name_en"]) == poet_id:
            # Library matches (usually empty for the three anchors in v1)
            cmatches = [v for v in LIBRARY if v["poet_en"].strip().lower() == c["name_en"].strip().lower()]
            # DCT-crawled verses (present after scripts/dct_crawler.py runs)
            dct_verses = DCT_CORPUS.get(c["agent_id"], [])
            phase2_context = ANCHOR_PHASE2_CONTEXT.get(c["agent_id"]) if not dct_verses else None
            return {
                "kind": "anchor_critic",
                "agent_id": c["agent_id"],
                "profile": c,
                "verses": cmatches,
                "verse_count": len(cmatches),
                "dct_verses": dct_verses,
                "dct_verse_count": len(dct_verses),
                "phase2_note": (
                    "Verified verses by this master will be loaded in Phase 2 "
                    "(corpus integration pending). The Critic's voice in this "
                    "prototype speaks from the school's documented principles, "
                    "not from verse retrieval."
                ) if not dct_verses else None,
                "phase2_context": phase2_context,
            }

    # Contemporary poet?
    contemporary = _contemporary_poets_index()
    if poet_id in contemporary:
        return {"kind": "contemporary", **contemporary[poet_id]}

    raise HTTPException(404, f"Poet not found: {poet_id}")


@app.get("/api/poets-index")
def get_poets_index():
    """
    Return a flat index of every poet known to the system, with slugs.
    Used by the Library to make poet names link-able.
    """
    contemporary = _contemporary_poets_index()
    return {
        "anchor_critics": [
            {
                "slug": c["agent_id"],
                "name_en": c["name_en"],
                "name_ar": c["name_ar"],
                "epithet_en": c.get("epithet_en", ""),
                "kind": "anchor_critic",
            }
            for c in POETS["deceased_masters_critics"]
        ],
        "contemporary": [
            {"slug": p["slug"], "name_en": p["name_en"], "name_ar": p["name_ar"], "verse_count": p["verse_count"], "kind": "contemporary"}
            for p in sorted(contemporary.values(), key=lambda x: -x["verse_count"])
        ],
    }


@app.get("/api/library")
def get_library(
    limit: int = Query(40, ge=1, le=200),
    offset: int = Query(0, ge=0),
    poet: str | None = None,
    genre: str | None = None,
):
    rows = LIBRARY
    if poet:
        rows = [v for v in rows if poet.lower() in v["poet_en"].lower() or poet in v["poet_ar"]]
    if genre:
        rows = [v for v in rows if genre.lower() in v["genre_en"].lower() or genre in v["genre_ar"]]
    total = len(rows)
    return {"total": total, "items": rows[offset : offset + limit]}


@app.get("/api/library/search")
def search_library(q: str = Query(..., min_length=1)):
    ql = q.lower().strip()
    hits = []
    for v in LIBRARY:
        if (
            ql in v["text_ar"].lower()
            or ql in v["translation_en"].lower()
            or ql in v["poet_en"].lower()
            or ql in v["poet_ar"]
            or ql in v["imagery_tags"].lower()
        ):
            hits.append(v)
    return {"total": len(hits), "items": hits[:60]}


@app.get("/api/library/verse/{verse_id}")
def get_verse(verse_id: str):
    """One verse plus its analytical context: full source poem and sibling verses."""
    verse = next((v for v in LIBRARY if v["verse_id"] == verse_id), None)
    if verse is None:
        raise HTTPException(404, f"verse_id {verse_id} not found")
    full_poem = []
    if FULL_POEMS and verse.get("poem_id"):
        full_poem = FULL_POEMS.get(verse["poem_id"], [])
    same_poet = [v for v in LIBRARY if v["poet_en"] == verse["poet_en"] and v["verse_id"] != verse_id][:6]
    same_genre = [v for v in LIBRARY if v.get("genre_en") == verse.get("genre_en") and v["verse_id"] != verse_id][:6]
    return {
        "verse": verse,
        "full_poem": full_poem,
        "same_poet": same_poet,
        "same_genre": same_genre,
    }


@app.get("/api/tsne")
def get_tsne():
    """The pre-computed t-SNE map — 3,340 clips' (x,y) coords with genre+emotion class ids."""
    if TSNE_POINTS is None:
        raise HTTPException(503, "t-SNE map not built yet. Run scripts/build_tsne_map.py")
    return TSNE_POINTS


@app.get("/api/dictionary")
def get_dictionary():
    return {"total": len(DICTIONARY), "items": DICTIONARY}


@app.get("/api/dictionary/search")
def search_dictionary(q: str = Query(..., min_length=1)):
    ql = q.lower().strip()
    hits = []
    for e in DICTIONARY:
        if (
            ql in e["headword_ar"]
            or ql in e["headword_translit"].lower()
            or ql in e["definition_ar"]
            or ql in e["definition_en"].lower()
        ):
            hits.append(e)
    return {"total": len(hits), "items": hits[:40]}


@app.post("/api/agents/convene")
def api_convene(req: ConveneRequest):
    plan = convene(req.verse_text)
    qaf = detect_qafiyah(req.verse_text)
    return {"convener": plan, "qafiyah_quick": qaf}


@app.post("/api/agents/critique")
def api_critique(req: CritiqueRequest):
    qaf = detect_qafiyah(req.verse_text)
    result = run_critique(req.verse_text, forced_critics=req.forced_critics)
    result["qafiyah_quick"] = qaf
    return result


@app.post("/api/submissions")
def submit(req: SubmitRequest):
    if req.kind not in {"archive", "composition", "dictionary"}:
        raise HTTPException(400, "kind must be archive, composition, or dictionary")
    if req.visibility not in {"public", "private", "anonymous"}:
        raise HTTPException(400, "visibility must be public, private, or anonymous")

    critique_json = None
    if req.run_critique and req.kind == "composition":
        result = run_critique(req.text_ar)
        result["qafiyah_quick"] = detect_qafiyah(req.text_ar)
        critique_json = json.dumps(result, ensure_ascii=False)

    with db() as conn:
        cur = conn.execute(
            """INSERT INTO submissions
            (kind, visibility, poet_handle, text_ar, translation_en, note, critique_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                req.kind,
                req.visibility,
                req.poet_handle if req.visibility != "anonymous" else None,
                req.text_ar,
                req.translation_en,
                req.note,
                critique_json,
                int(time.time()),
            ),
        )
        sid = cur.lastrowid

    return {
        "id": sid,
        "stored": True,
        "visibility": req.visibility,
        "critique": json.loads(critique_json) if critique_json else None,
    }


@app.get("/api/submissions")
def list_submissions(limit: int = Query(50, ge=1, le=200)):
    """Public submissions only — never returns private ones."""
    with db() as conn:
        rows = conn.execute(
            """SELECT id, kind, visibility, poet_handle, text_ar, translation_en, note, created_at
            FROM submissions WHERE visibility IN ('public','anonymous')
            ORDER BY created_at DESC LIMIT ?""",
            (limit,),
        ).fetchall()
    return {
        "total": len(rows),
        "items": [
            {
                "id": r["id"],
                "kind": r["kind"],
                "visibility": r["visibility"],
                "poet_handle": r["poet_handle"] if r["visibility"] == "public" else None,
                "text_ar": r["text_ar"],
                "translation_en": r["translation_en"],
                "note": r["note"],
                "created_at": r["created_at"],
            }
            for r in rows
        ],
    }


@app.post("/api/dictionary/propose")
def propose_term(req: DictionaryProposeRequest):
    """A poet contributes a term. Public goes into the public dictionary table; private is stored only against the poet."""
    if req.visibility not in {"public", "private"}:
        raise HTTPException(400, "visibility must be public or private")
    with db() as conn:
        conn.execute(
            """INSERT INTO submissions
            (kind, visibility, poet_handle, text_ar, translation_en, note, critique_json, created_at)
            VALUES ('dictionary', ?, ?, ?, ?, ?, NULL, ?)""",
            (
                req.visibility,
                req.poet_handle,
                req.headword_ar,
                req.definition_en or "",
                json.dumps({
                    "translit": req.headword_translit,
                    "definition_ar": req.definition_ar,
                    "semantic_field": req.semantic_field,
                }, ensure_ascii=False),
                int(time.time()),
            ),
        )
    return {"stored": True, "visibility": req.visibility}
