"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import { api, Verse } from "@/lib/api";
import { poetUrl } from "@/lib/slug";

export default function EnthusiastGate() {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [poetFilter, setPoetFilter] = useState<string>("");

  useEffect(() => {
    api.library(80).then((r) => { setVerses(r.items); setLoading(false); });
  }, []);

  const filtered = verses.filter((v) => {
    if (poetFilter && v.poet_en !== poetFilter) return false;
    if (query) {
      const q = query.toLowerCase();
      return v.text_ar.includes(query) || v.translation_en.toLowerCase().includes(q) || v.poet_en.toLowerCase().includes(q);
    }
    return true;
  });

  const poetCounts = new Map<string, number>();
  verses.forEach((v) => poetCounts.set(v.poet_en, (poetCounts.get(v.poet_en) || 0) + 1));

  return (
    <>
      <Header subtitle="Library & Lookup" />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-sage-500 mb-2">For the Explorer</p>
          <h1 className="font-display text-4xl text-ink-300 mb-2">The Library</h1>
          <p className="font-arabic text-xl text-ink-200" dir="rtl">المكتبة</p>
          <p className="text-sm text-ink-100/75 mt-3 max-w-2xl">
            Eighty verses across ten contemporary Khaleeji masters — the foundation
            on which the Majlis listens. Every verse is sourced. Click any verse to
            ask the Critics what they hear in it.
          </p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Filters */}
          <aside className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-100/70 mb-2">Search</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Word, poet, or theme"
                className="w-full text-sm bg-parchment-50 border border-gold-400/30 rounded-sm px-3 py-2"
              />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-ink-100/70 mb-2">By poet</p>
              <div className="space-y-1 max-h-[420px] overflow-auto pr-1">
                <button
                  onClick={() => setPoetFilter("")}
                  className={`w-full text-left text-sm px-2 py-1 rounded-sm ${poetFilter === "" ? "bg-gold-400/15 text-ink-300" : "text-ink-100 hover:bg-gold-400/5"}`}
                >
                  All poets <span className="text-xs text-ink-100/60">({verses.length})</span>
                </button>
                {[...poetCounts.entries()].sort((a, b) => b[1] - a[1]).map(([p, n]) => (
                  <div key={p} className="flex items-center group">
                    <button
                      onClick={() => setPoetFilter(p)}
                      className={`flex-1 text-left text-sm px-2 py-1 rounded-sm ${poetFilter === p ? "bg-gold-400/15 text-ink-300" : "text-ink-100 hover:bg-gold-400/5"}`}
                    >
                      {p} <span className="text-xs text-ink-100/60">({n})</span>
                    </button>
                    <Link
                      href={poetUrl(p)}
                      className="text-xs text-gold-600/0 group-hover:text-gold-600 transition-colors px-1.5"
                      title={`See ${p}'s profile`}
                      aria-label={`See ${p}'s profile`}
                    >
                      →
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-sm border border-gold-400/25 p-4 bg-parchment-100/40">
              <p className="text-xs uppercase tracking-wider text-gold-600 mb-2">A note on the corpus</p>
              <p className="text-xs text-ink-100/80 leading-relaxed">
                These are contemporary Khaleeji masters, audio-aligned with translations.
                Phase 2 will add verified verses from the DCT Abu Dhabi Poetry Archive,
                including works by the three deceased-master Critics themselves.
              </p>
            </div>
          </aside>

          {/* Verse grid */}
          <section>
            {loading ? (
              <p className="text-sm text-ink-100/60 italic">Opening the library…</p>
            ) : (
              <>
                <p className="text-xs text-ink-100/60 mb-4">{filtered.length} of {verses.length} verses</p>
                <div className="grid md:grid-cols-2 gap-4">
                  {filtered.map((v) => (
                    <div key={v.verse_id} className="manuscript-card rounded-sm p-5 relative">
                      {/* Tap target for the verse → its detail page */}
                      <Link
                        href={`/library/${v.verse_id}`}
                        className="block"
                        aria-label={`Open verse ${v.verse_id}`}
                      >
                        <p className="font-arabic text-lg text-ink-300 mb-3 leading-relaxed line-clamp-3" dir="rtl">
                          {v.text_ar}
                        </p>
                        {v.translation_en && (
                          <p className="text-xs text-ink-100/75 italic mb-3 line-clamp-2">"{v.translation_en}"</p>
                        )}
                      </Link>
                      <div className="flex items-baseline justify-between">
                        <Link
                          href={poetUrl(v.poet_en)}
                          className="text-xs text-ink-200 hover:text-gold-600 transition-colors"
                        >
                          <span className="font-arabic">{v.poet_ar}</span> · {v.poet_en}
                        </Link>
                        {v.genre_en && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-sage-500/10 text-sage-600 border border-sage-500/20">
                            {v.genre_en.split("(")[0].trim()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
