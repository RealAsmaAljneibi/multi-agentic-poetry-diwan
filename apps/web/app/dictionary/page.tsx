"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { api, DictionaryEntry } from "@/lib/api";

export default function DictionaryPage() {
  const [entries, setEntries] = useState<DictionaryEntry[]>([]);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<DictionaryEntry | null>(null);

  useEffect(() => {
    api.dictionary().then((r) => setEntries(r.items));
  }, []);

  const filtered = entries.filter((e) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return e.headword_ar.includes(query) || e.headword_translit.toLowerCase().includes(q) || e.definition_en.toLowerCase().includes(q);
  });

  return (
    <>
      <Header subtitle="Unified Dictionary" />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-gold-600 mb-2">A living archive</p>
          <h1 className="font-display text-4xl text-ink-300 mb-2">The Unified Dictionary</h1>
          <p className="font-arabic text-xl text-ink-200" dir="rtl">المعجم الموحَّد</p>
          <p className="text-sm text-ink-100/75 mt-3 max-w-3xl">
            A growing record of Khaleeji and classical Nabati terms — defined, traced, and (when possible)
            attested in the corpus. Every entry shows where it came from. Poets and scholars may
            contribute new terms through the Poet Gate.
          </p>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search headword, transliteration, or definition…"
          className="w-full md:w-96 text-sm bg-parchment-50 border border-gold-400/30 rounded-sm px-3 py-2 mb-8 focus:outline-none focus:border-gold-500"
        />

        <p className="text-xs text-ink-100/60 mb-4">{filtered.length} entries</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((e) => (
            <button
              key={e.entry_id}
              onClick={() => setActive(e)}
              className="manuscript-card rounded-sm p-5 text-left"
            >
              <div className="flex items-baseline justify-between mb-2">
                <p className="font-arabic text-2xl text-ink-300" dir="rtl">{e.headword_ar}</p>
                <p className="text-xs text-ink-100/60 italic">{e.headword_translit}</p>
              </div>
              <p className="text-xs text-ink-100/60 mb-2 uppercase tracking-wider">{e.pos}</p>
              <p className="text-sm text-ink-200 line-clamp-3">{e.definition_en}</p>
              <div className="flex flex-wrap gap-1 mt-3">
                {e.semantic_field.slice(0, 3).map((f) => (
                  <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-sage-500/10 text-sage-600 border border-sage-500/20">
                    {f}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </main>

      {active && <EntryDetail entry={active} onClose={() => setActive(null)} />}
    </>
  );
}

function EntryDetail({ entry, onClose }: { entry: DictionaryEntry; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-40 bg-ink-400/60 flex items-center justify-center p-6" onClick={onClose}>
      <div
        className="bg-parchment-50 max-w-2xl w-full rounded-sm border border-gold-400/40 p-8 max-h-[88vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="font-arabic text-4xl text-ink-300 mb-1" dir="rtl">{entry.headword_ar}</p>
            <p className="text-sm text-ink-100/70 italic">{entry.headword_translit} · {entry.pos}</p>
          </div>
          <button onClick={onClose} className="text-ink-100 hover:text-crimson-500 text-2xl leading-none">×</button>
        </div>

        <div className="ornament my-4"><span className="ornament-glyph">۞</span></div>

        <div className="mb-5">
          <p className="text-xs uppercase tracking-wider text-gold-600 mb-1">Definition</p>
          <p className="font-arabic text-lg text-ink-300 leading-relaxed mb-3 text-right" dir="rtl">{entry.definition_ar}</p>
          <p className="text-sm text-ink-200 italic leading-relaxed">{entry.definition_en}</p>
        </div>

        {entry.etymology && (
          <div className="mb-5">
            <p className="text-xs uppercase tracking-wider text-gold-600 mb-1">Etymology</p>
            <p className="text-sm text-ink-200">{entry.etymology}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
          <div>
            <p className="uppercase tracking-wider text-ink-100/60 text-[10px]">Region</p>
            <p className="text-ink-200">{entry.region}</p>
          </div>
          <div>
            <p className="uppercase tracking-wider text-ink-100/60 text-[10px]">Rarity</p>
            <p className="text-ink-200">{entry.rarity}</p>
          </div>
          {entry.semantic_field.length > 0 && (
            <div className="col-span-2">
              <p className="uppercase tracking-wider text-ink-100/60 text-[10px] mb-1">Semantic field</p>
              <div className="flex flex-wrap gap-1">
                {entry.semantic_field.map((f) => (
                  <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-sage-500/10 text-sage-600 border border-sage-500/20">
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-5 border-t border-gold-400/20">
          <p className="text-xs uppercase tracking-wider text-gold-600 mb-2">Provenance</p>
          {entry.attestation_count > 0 ? (
            <div>
              <p className="text-xs text-sage-600 mb-2">
                ✓ Attested in the corpus ({entry.attestation_count} verse{entry.attestation_count > 1 ? "s" : ""})
              </p>
              {entry.attested_in.map((a) => (
                <p key={a.verse_id} className="text-xs text-ink-200">
                  {a.verse_id} · <span className="font-arabic">{a.poet_ar}</span> ({a.poet_en})
                </p>
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink-100/70">
              ◌ Curated entry — not yet attested in the prototype's seed corpus.
              Phase 2 will scan the DCT Abu Dhabi archive for attestations.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
