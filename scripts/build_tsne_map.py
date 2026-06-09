"""
build_tsne_map.py — one-shot offline job

Why this exists:
The poetry repo has pre-computed AraPoemBERT CLS embeddings for ~3,300 poem clips.
Re-running the embedder at request time is expensive (~110M-param model + GPU);
re-running t-SNE per request is even worse (seconds per call). But the projection
itself is *static* — once we run t-SNE over all clips, the (x,y) coordinates are
fixed, so we run it once at build time and ship a tiny JSON.

Output:
  apps/api/data/tsne_points.json  — list of {clip_id, poem_id, start, x, y, genre, emotion, text_preview}
  apps/api/data/full_poems.json   — {poem_id: [{start, text_corrected, translation, ...}, ...]} for full-poem reconstruction
  apps/api/data/library_with_tsne.json — library.json enriched with each verse's tsne (x,y) coords

Usage:
  cd "multi-agentic poetry diwan"
  python3 scripts/build_tsne_map.py
"""
from __future__ import annotations

import csv
import json
import pickle
import sys
from pathlib import Path
from collections import defaultdict

import numpy as np
from sklearn.manifold import TSNE
from sklearn.preprocessing import StandardScaler


PROJECT_ROOT = Path(__file__).resolve().parent.parent

# The poetry repo can live at either the macOS host path or the Linux mount path
# (when this script runs inside a workspace sandbox).
def _find_poetry_repo() -> Path:
    candidates = [
        Path("/Users/Asma Salem Mubarak Najem Aljneibi/poetry"),
        Path("/sessions/nifty-zealous-ramanujan/mnt/poetry"),
    ]
    for c in candidates:
        if (c / "data/processed/master_dataset.csv").exists():
            return c
    raise SystemExit(
        "Could not locate the poetry repo. Tried:\n  "
        + "\n  ".join(str(c) for c in candidates)
    )

POETRY_REPO = _find_poetry_repo()
EMBED_DIR = POETRY_REPO / "data/processed/embeddings"
DATASET_CSV = POETRY_REPO / "data/processed/master_dataset.csv"

OUT_API_DATA = PROJECT_ROOT / "apps/api/data"
OUT_API_DATA.mkdir(parents=True, exist_ok=True)


GENRE_CLASSES = [
    "Ghazal (Delicate love)",
    "Shajan (Sorrow / Regret)",
    "Fakhr (Pride & Honor)",
    "Hikma (Wisdom)",
    "Badawa (Bedouin & Desert)",
    "Wataniyya (Patriotic)",
    "Ritha (Elegy & Lament)",
    "Hija (Satire)",
]

EMOTION_CLASSES = [
    "Longing (Shawq)",
    "Delicate Love (Hub Raqeeq)",
    "Sorrow (Huzn)",
    "Pride (Fakhr)",
    "Admiration (I'jab)",
    "Contemplation (Ta'ammul)",
    "Disappointment (Khayba)",
    "Defiance (Tahaddi)",
    "Hope (Amal)",
    "Compassion (Hanaan)",
    "Humor (Turfah)",
    "Neutral / Descriptive (Wasfi)",
]


def short_label(s: str) -> str:
    for sep in ("(", ",", "/", "،"):
        if sep in s:
            return s.split(sep)[0].strip()
    return s


def emotion_to_id(label: str) -> int:
    """Map a textual emotion label (short or long form) to its class id, or -1."""
    if not label:
        return -1
    norm = label.strip()
    for i, full in enumerate(EMOTION_CLASSES):
        if norm == full or norm == short_label(full):
            return i
    return -1


# ── Step 1: load every (poem_id, start, cls_vec, genre, emotion) triple ─────

def load_clips() -> tuple[np.ndarray, list[dict]]:
    """Walk the train/val/test pickles, return (X[N,768], rows_meta[N])."""
    print(f"→ Loading embeddings from {EMBED_DIR}")
    # First, build a (poem_id, start) → emotion + text lookup from the master CSV
    # because the pickles only carry genre, not emotion or original Arabic text.
    csv_lookup: dict[tuple[str, int], dict] = {}
    with DATASET_CSV.open(encoding="utf-8") as f:
        for row in csv.DictReader(f):
            row = {k.lstrip("﻿"): v for k, v in row.items()}
            try:
                key = (row["source_poem"], int(row["start"]))
            except (KeyError, ValueError):
                continue
            csv_lookup[key] = row

    rows_meta: list[dict] = []
    cls_vectors: list[np.ndarray] = []

    for split in ("train", "val", "test"):
        path = EMBED_DIR / f"{split}.pkl"
        with path.open("rb") as f:
            emb_dict = pickle.load(f)
        for poem_id, items in emb_dict.items():
            for item in items:
                start = int(item["start"])
                vec = np.asarray(item["cls"], dtype=np.float32)
                meta = csv_lookup.get((poem_id, start), {})
                rows_meta.append({
                    "clip_id": f"{poem_id}__{start}",
                    "poem_id": poem_id,
                    "start": start,
                    "split": split,
                    "genre_id": int(item["label"]),
                    "emotion_id": emotion_to_id(meta.get("emotion_text", "")),
                    "text_corrected": meta.get("text_corrected", "") or item.get("text", ""),
                    "translation_en": meta.get("translation_en", ""),
                    "poet_en": meta.get("poet_en", item.get("poet", "")),
                    "poet_ar": meta.get("poet_ar", ""),
                    "imagery_tags": meta.get("imagery_tags_en", ""),
                    "audio_filename": (meta.get("audio_filename") or "").split("/")[-1] if meta.get("audio_filename") else "",
                })
                cls_vectors.append(vec)

    X = np.stack(cls_vectors)
    print(f"  loaded {len(X)} clips, dim={X.shape[1]}, genre dist={np.bincount([r['genre_id'] for r in rows_meta]).tolist()}")
    return X, rows_meta


# ── Step 2: t-SNE projection ─────────────────────────────────────────────────

def run_tsne(X: np.ndarray) -> np.ndarray:
    print(f"→ Running t-SNE (n={len(X)}, perplexity=40)…")
    Xs = StandardScaler().fit_transform(X)
    tsne = TSNE(
        n_components=2, perplexity=40, max_iter=1000,
        random_state=42, learning_rate="auto", init="pca",
    )
    Z = tsne.fit_transform(Xs)
    # Normalise to [0, 100] for easier SVG plotting in the frontend
    Z -= Z.min(axis=0)
    Z /= Z.max(axis=0)
    Z *= 100.0
    print(f"  KL div: {tsne.kl_divergence_:.3f} · range [0,100]")
    return Z


# ── Step 3: persist artefacts ────────────────────────────────────────────────

def write_outputs(rows: list[dict], Z: np.ndarray, library_path: Path) -> None:
    # tsne_points.json — every clip's projected position + class labels
    points = []
    for r, (x, y) in zip(rows, Z):
        points.append({
            "clip_id": r["clip_id"],
            "poem_id": r["poem_id"],
            "start": r["start"],
            "x": round(float(x), 2),
            "y": round(float(y), 2),
            "genre_id": r["genre_id"],
            "emotion_id": r["emotion_id"],
            "poet_en": r["poet_en"],
            "text_preview": (r["text_corrected"] or "")[:80],
        })
    with (OUT_API_DATA / "tsne_points.json").open("w", encoding="utf-8") as f:
        json.dump({
            "genre_classes": GENRE_CLASSES,
            "emotion_classes": EMOTION_CLASSES,
            "points": points,
        }, f, ensure_ascii=False, separators=(",", ":"))
    print(f"  wrote tsne_points.json  ({len(points)} pts)")

    # full_poems.json — for the verse detail page to show the full source poem
    poems: dict[str, list[dict]] = defaultdict(list)
    for r in rows:
        poems[r["poem_id"]].append({
            "start": r["start"],
            "text_ar": r["text_corrected"],
            "translation_en": r["translation_en"],
            "poet_en": r["poet_en"],
            "poet_ar": r["poet_ar"],
            "imagery_tags": r["imagery_tags"],
            "audio_filename": r["audio_filename"],
        })
    for pid in poems:
        poems[pid].sort(key=lambda x: x["start"])
    with (OUT_API_DATA / "full_poems.json").open("w", encoding="utf-8") as f:
        json.dump(poems, f, ensure_ascii=False, separators=(",", ":"))
    print(f"  wrote full_poems.json  ({len(poems)} poems)")

    # library_with_tsne.json — enrich each library verse with its tsne coords + poem_id
    # Match by (poet_en + text_ar prefix) since library.json doesn't carry poem_id directly.
    with library_path.open(encoding="utf-8") as f:
        library = json.load(f)

    # Build a lookup for quick matching
    text_to_clip: dict[tuple[str, str], dict] = {}
    for r, (x, y) in zip(rows, Z):
        if not r["text_corrected"]:
            continue
        key = (r["poet_en"], r["text_corrected"][:50])
        text_to_clip[key] = {
            "x": round(float(x), 2),
            "y": round(float(y), 2),
            "clip_id": r["clip_id"],
            "poem_id": r["poem_id"],
            "start": r["start"],
            "genre_id": r["genre_id"],
            "emotion_id": r["emotion_id"],
        }

    matched = 0
    for v in library:
        key = (v["poet_en"], (v["text_ar"] or "")[:50])
        info = text_to_clip.get(key)
        if info:
            v["tsne_x"] = info["x"]
            v["tsne_y"] = info["y"]
            v["clip_id"] = info["clip_id"]
            v["poem_id"] = info["poem_id"]
            v["start"] = info["start"]
            v["genre_id"] = info["genre_id"]
            v["emotion_id"] = info["emotion_id"]
            matched += 1

    with library_path.open("w", encoding="utf-8") as f:
        json.dump(library, f, ensure_ascii=False, indent=2)
    print(f"  enriched library.json — matched {matched}/{len(library)} verses to t-SNE coords")


def main() -> None:
    X, rows = load_clips()
    Z = run_tsne(X)
    write_outputs(rows, Z, OUT_API_DATA / "library.json")
    print("\n✓ Done. Three artefacts in apps/api/data/:")
    print("  - tsne_points.json      (the map)")
    print("  - full_poems.json       (full-poem reconstruction)")
    print("  - library.json          (now carries tsne coords per verse)")


if __name__ == "__main__":
    main()
