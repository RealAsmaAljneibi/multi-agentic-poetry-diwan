# The Poetic Majlis · المجلس الشعري

An Emirati Nabati poetry multi-agent system. A council of master Critics — drawn from the documented schools of **Al-Mājidī bin Ẓāhir**, **Ousha bint Khalifa**, and **Sheikh Zayed** — convenes to read the verses of living poets. Not to write for them. To listen, to weigh, and to teach.

This is a **functional prototype** built in two days, intended for entity demos and proof-of-concept review. It runs entirely on a local machine.

---

## What works in v1

| Feature | Status |
|---|---|
| Heritage-aesthetic landing page with role chooser | ✅ |
| Three Critic agents (Curator & Critic Protocol — never impersonate, never generate verse) | ✅ |
| Live Debate UI: Convener selects critics → each renders a structured verdict in turn | ✅ |
| Deterministic qāfiyah quick-detection (pre-LLM) | ✅ |
| Poet/Scholar Gate — three modes: Compose for Critique, Archive, Contribute Term | ✅ |
| Public / Anonymous / Private visibility on every submission | ✅ |
| Library of 80 verses across 10 contemporary Khaleeji masters with translations | ✅ |
| Unified Dictionary — 20 curated entries with full provenance | ✅ |
| AI-attribution labels on every output ("Critic, not author" + "Inspired by the council — AI Assisted") | ✅ |
| SQLite-backed submission archive | ✅ |

## What is honestly **not** in v1 (Phase 2)

| Feature | Why deferred |
|---|---|
| Voice intake (Khaleeji ASR) | Requires fine-tuning data and is its own research project |
| Manuscript image OCR | Lives in the `handwritten-poems` repo; integration costs more than a day |
| Verses by the three deceased Critics themselves | The DCT Abu Dhabi archive crawl is Phase 2; current Critics speak from documented principles, not from verse retrieval |
| Living-master Inspirers (Sheikh Mohammed bin Rashid, Fazza) | Requires formal estate consent before launch |
| Hosted deployment | Local only — `localhost:3000` |
| Neo4j knowledge graph | SQLite stands in for v1 |

---

## How to run it

You need **Python 3.10+** and **Node.js 18+** installed.

### Backend (Python · FastAPI)

```bash
cd apps/api
pip install -r requirements.txt
# .env is already populated with the OpenAI key from handwritten-poems/.env
uvicorn main:app --reload --port 8000
```

The API serves at `http://127.0.0.1:8000`. Quick check:

```bash
curl http://127.0.0.1:8000/api/health
```

### Frontend (Next.js)

In a separate terminal:

```bash
cd apps/web
npm install
npm run dev
```

Open **http://localhost:3000**. The frontend proxies `/api/*` calls to the Python backend.

---

## Project structure

```
multi-agentic poetry diwan/
├── apps/
│   ├── api/                    # FastAPI service
│   │   ├── agents/
│   │   │   ├── personas.py     # Critic system prompts (the heart)
│   │   │   ├── llm.py          # OpenAI adapter
│   │   │   └── critique.py     # Convene → critique pipeline
│   │   ├── data/
│   │   │   ├── poets.json      # The 3 Critic agents + library poets note
│   │   │   ├── library.json    # 80 verses with provenance
│   │   │   └── dictionary.json # 20 curated terms
│   │   ├── main.py             # All API routes
│   │   └── .env                # OPENAI_API_KEY
│   │
│   └── web/                    # Next.js 14 (App Router)
│       ├── app/
│       │   ├── page.tsx              # Landing
│       │   ├── poet/page.tsx         # Poet & Scholar gate
│       │   ├── enthusiast/page.tsx   # Library browser
│       │   └── dictionary/page.tsx   # Dictionary
│       ├── components/
│       │   ├── LiveDebate.tsx        # The centerpiece interaction
│       │   ├── MarkdownLite.tsx      # Tiny renderer for Critic verdicts
│       │   └── Header.tsx
│       ├── lib/api.ts                # Typed API client
│       └── public/
│           ├── calligraphy-hero.png  # From handwritten-poems
│           └── icons/                # Majlis icons from poetry repo
└── README.md
```

---

## The Curator & Critic Protocol

The most important design decision in this system. Encoded in `apps/api/agents/personas.py`:

1. The Critics speak **about** each poet's documented school, never **as** the poet in the first person.
2. They critique submitted verse — they never produce verse on the poet's behalf.
3. Every verdict closes with a signature formula reminding the user that a tradition is speaking through a teacher, not the ghost of the historical figure.
4. They refuse to write poetry on request and redirect: *"This Majlis exists to refine your own voice, not replace it."*

This is what makes the system defensible to the Poetry Society and to the families and institutions that hold the legacies of these poets.

## Nabati prosody — the right framing

The Critics judge:

- **Qāfiyah (rhyme)** as the rigorous, deterministic axis — Nabati strictly demands sustained rhyme.
- **Wazn (meter)** descriptively, not arithmetically — Nabati operates on rhythmic-melodic templates (al-Hilali, al-Masḥūb, etc.), **not** the Khalilian buḥūr of classical Fusha.

Trying to scan a Nabati line with classical Fusha meter is a category error. The system prompts explicitly forbid this.

---

## Privacy commitment

- Public submissions: archived openly, credited to the poet handle, searchable.
- Anonymous submissions: archived publicly, no name attached.
- **Private submissions: stored in the poet's vault only. The Majlis will not train on private work, will not surface it in search, and will not allow Critics to retain it after a session.**

This commitment is structurally enforced: the API filters private submissions out of any list endpoint, and the SQLite schema separates visibility from the storage path.

---

## Credits & data sources

- Verse corpus: MAAI7103 audio-aligned Khaleeji corpus (Aljneibi).
- Poet biographies: NABAT-AI ground-truth set (handwritten-poems repo).
- Calligraphy hero asset: handwritten-poems repo.
- Majlis icons (dallah, dates, dihn oud, dukhon, finjan): poetry repo.
- LLM: OpenAI gpt-4o-mini.

Built with reverence for Emirati Nabati tradition.
