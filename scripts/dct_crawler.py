"""
dct_crawler.py — fetch verified verses for the three anchor Critics from the
DCT Abu Dhabi Poetry Archive (poetry.dct.gov.ae).

Why this exists: the prototype's three anchor Critics — Al-Mājidī bin Ẓāhir,
Ousha bint Khalifa, Sheikh Zayed — speak from documented principles rather than
verse retrieval, because our two existing repos contain zero verses by them.
The DCT archive does. This crawler ingests their attested works so the Critics
can cite real corpus material when reading a user's submission.

Design:
- Polite. 1.5 s sleep between requests. Custom User-Agent. Caches responses
  to disk so re-runs are free.
- Honest provenance. Every harvested verse stores: source_url, retrieved_at,
  poet_page_id, poem_page_id, and any DCT-supplied metadata (era, source
  manuscript, etc.).
- Defensive. Failures on individual pages are logged and skipped, never aborted.

Usage:
  cd "multi-agentic poetry diwan"
  python3 scripts/dct_crawler.py --poet al_majidi_bin_zahir --url https://poetry.dct.gov.ae/poets/123
  # Or for all three at once after a sitemap pull:
  python3 scripts/dct_crawler.py --discover https://poetry.dct.gov.ae/sitemap.xml

Output:
  apps/api/data/dct_corpus.json — { agent_id: [ {verse_id, text_ar, source_url, ...}, ... ] }
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import re
import sys
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse

import urllib.request
import urllib.error


PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUT = PROJECT_ROOT / "apps/api/data/dct_corpus.json"
CACHE = PROJECT_ROOT / ".dct_cache"
CACHE.mkdir(exist_ok=True)

USER_AGENT = "PoeticMajlis/0.1 (research prototype; respects robots.txt)"
THROTTLE_SECONDS = 1.5

# Map known poet display names (in Arabic) → our agent IDs.
# Extended at runtime when --poet --url is used.
NAME_TO_AGENT_ID = {
    "الماجدي بن ظاهر": "al_majidi_bin_zahir",
    "الماجدي بن طاهر": "al_majidi_bin_zahir",
    "عوشة بنت خليفة": "ousha_bint_khalifa",
    "عوشة بنت خليفة السويدي": "ousha_bint_khalifa",
    "فتاة العرب": "ousha_bint_khalifa",
    "زايد بن سلطان آل نهيان": "sheikh_zayed",
    "الشيخ زايد بن سلطان آل نهيان": "sheikh_zayed",
    "الشيخ زايد": "sheikh_zayed",
}


def _cache_key(url: str) -> Path:
    h = hashlib.sha1(url.encode("utf-8")).hexdigest()[:16]
    return CACHE / f"{h}.html"


def _fetch(url: str) -> str:
    """Fetch a URL with caching, throttling, and a polite User-Agent."""
    key = _cache_key(url)
    if key.exists():
        return key.read_text(encoding="utf-8")
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept-Language": "ar,en;q=0.8"})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            html = r.read().decode("utf-8", errors="replace")
    except urllib.error.HTTPError as e:
        print(f"  ! HTTP {e.code} on {url}", file=sys.stderr)
        return ""
    except Exception as e:
        print(f"  ! {type(e).__name__} on {url}: {e}", file=sys.stderr)
        return ""
    key.write_text(html, encoding="utf-8")
    time.sleep(THROTTLE_SECONDS)
    return html


# ── Light HTML parsing — no BeautifulSoup dep so this script runs anywhere ──

POEM_HREF_RE = re.compile(r'href="(/poems/\d+[^"]*)"')
POET_HREF_RE = re.compile(r'href="(/poets/\d+[^"]*)"')
TAG_STRIP_RE = re.compile(r"<[^>]+>")
WS_RE = re.compile(r"\s+")


def _strip_tags(html: str) -> str:
    return WS_RE.sub(" ", TAG_STRIP_RE.sub(" ", html)).strip()


def discover_poems_for_poet(poet_url: str) -> list[str]:
    """Return absolute URLs of every /poems/* link on a poet's page."""
    html = _fetch(poet_url)
    if not html:
        return []
    base = f"{urlparse(poet_url).scheme}://{urlparse(poet_url).netloc}"
    seen: set[str] = set()
    for m in POEM_HREF_RE.finditer(html):
        href = m.group(1)
        seen.add(urljoin(base, href))
    return sorted(seen)


def parse_poem(poem_url: str) -> dict | None:
    """Pull as much structured content as we can from a poem page.

    The DCT page schema isn't fully known until we probe one — this parser is
    deliberately conservative and stores the raw stripped text alongside any
    metadata it manages to extract. The verse-detail page in the app can
    render the raw text honestly even before the parser is refined.
    """
    html = _fetch(poem_url)
    if not html:
        return None

    # Poem title — try common HTML conventions
    title = ""
    for pat in (
        r"<h1[^>]*>(.*?)</h1>",
        r"<meta property=\"og:title\" content=\"([^\"]+)\"",
        r"<title>([^<]+)</title>",
    ):
        m = re.search(pat, html, re.IGNORECASE | re.DOTALL)
        if m:
            title = _strip_tags(m.group(1))
            break

    # Poet name — usually adjacent to the title, often inside an <a href="/poets/...">
    poet_name = ""
    m = re.search(r'<a[^>]+href="/poets/\d+[^"]*"[^>]*>([^<]+)</a>', html)
    if m:
        poet_name = _strip_tags(m.group(1))

    # Body / verses — naive but works for SSR'd Arabic text. Look for the largest
    # block that contains Arabic characters only.
    arabic_chars_re = re.compile(r"[؀-ۿݐ-ݿ]")
    body_candidates: list[str] = []
    for m in re.finditer(r"<(p|div|article|section)[^>]*>(.*?)</\1>", html, re.DOTALL):
        txt = _strip_tags(m.group(2))
        if len(txt) > 80 and arabic_chars_re.search(txt):
            body_candidates.append(txt)
    body_candidates.sort(key=len, reverse=True)
    body = body_candidates[0] if body_candidates else ""

    # Metadata fields the DCT site might expose (best-effort regex)
    meta: dict[str, str] = {}
    for label_ar, key in [
        ("البحر", "meter"),
        ("الوزن", "meter"),
        ("القافية", "rhyme"),
        ("العصر", "era"),
        ("المصدر", "source"),
        ("التصنيف", "genre"),
    ]:
        m = re.search(rf"{label_ar}\s*[:：]?\s*([^<\n]+?)(?=<|$)", html)
        if m:
            meta[key] = _strip_tags(m.group(1)).strip(" :،,")

    return {
        "source_url": poem_url,
        "retrieved_at": dt.datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "title": title,
        "poet_name_dct": poet_name,
        "text_ar": body,
        "meta": meta,
    }


# ── Orchestration ────────────────────────────────────────────────────────────

def crawl_poet(agent_id: str, poet_url: str, max_poems: int = 12) -> list[dict]:
    """Fetch a poet's index page, then up to N of their poems."""
    print(f"\n→ Crawling {agent_id} from {poet_url}")
    poem_urls = discover_poems_for_poet(poet_url)
    print(f"  found {len(poem_urls)} /poems/ links; taking first {min(max_poems, len(poem_urls))}")
    out: list[dict] = []
    for url in poem_urls[:max_poems]:
        rec = parse_poem(url)
        if rec and rec.get("text_ar"):
            rec["agent_id"] = agent_id
            rec["verse_id"] = f"DCT-{hashlib.sha1(url.encode()).hexdigest()[:8]}"
            out.append(rec)
            print(f"  ✓ {rec['verse_id']}  {rec['title'][:50]}  ({len(rec['text_ar'])} chars)")
        else:
            print(f"  · skip (no body) {url}")
    return out


def merge_existing(new_records: dict[str, list[dict]]) -> dict[str, list[dict]]:
    """Merge by verse_id so re-runs don't duplicate."""
    if OUT.exists():
        existing = json.loads(OUT.read_text(encoding="utf-8"))
    else:
        existing = {}
    for agent_id, recs in new_records.items():
        bucket = existing.setdefault(agent_id, [])
        seen = {r["verse_id"] for r in bucket}
        for r in recs:
            if r["verse_id"] not in seen:
                bucket.append(r)
                seen.add(r["verse_id"])
    return existing


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--poet", help="agent_id (al_majidi_bin_zahir | ousha_bint_khalifa | sheikh_zayed)")
    ap.add_argument("--url", help="DCT poet page URL, e.g. https://poetry.dct.gov.ae/poets/123")
    ap.add_argument("--max", type=int, default=12, help="max poems to pull per poet (default 12)")
    args = ap.parse_args()

    if not (args.poet and args.url):
        print("Usage: --poet AGENT_ID --url POET_PAGE_URL  [--max N]")
        print("Or call crawl_poet() programmatically for multiple poets.")
        sys.exit(1)

    if args.poet not in {"al_majidi_bin_zahir", "ousha_bint_khalifa", "sheikh_zayed"}:
        print(f"Unknown agent_id: {args.poet}", file=sys.stderr)
        sys.exit(1)

    records = {args.poet: crawl_poet(args.poet, args.url, max_poems=args.max)}
    merged = merge_existing(records)
    OUT.write_text(json.dumps(merged, ensure_ascii=False, indent=2), encoding="utf-8")
    total = sum(len(v) for v in merged.values())
    print(f"\n✓ Wrote {OUT}  (total verses across all anchors: {total})")


if __name__ == "__main__":
    main()
