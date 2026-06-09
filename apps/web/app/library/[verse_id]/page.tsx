"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import TsneMap from "@/components/TsneMap";
import { api, VerseDetail } from "@/lib/api";
import { poetUrl } from "@/lib/slug";

export default function VerseDetailPage() {
  const params = useParams<{ verse_id: string }>();
  const verseId = params.verse_id;
  const [data, setData] = useState<VerseDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!verseId) return;
    api.verseDetail(verseId).then(setData).catch((e) => setError(e.message));
  }, [verseId]);

  if (error) {
    return (
      <>
        <Header subtitle="Verse" />
        <main className="max-w-4xl mx-auto px-6 py-10">
          <p className="text-crimson-600 text-sm">Could not load this verse: {error}</p>
          <Link href="/enthusiast" className="gold-link text-sm">← Back to the Library</Link>
        </main>
      </>
    );
  }
  if (!data) {
    return (
      <>
        <Header subtitle="Verse" />
        <main className="max-w-4xl mx-auto px-6 py-10">
          <p className="text-sm text-ink-100/60 italic">Opening the manuscript folio…</p>
        </main>
      </>
    );
  }

  const { verse, full_poem, same_poet, same_genre } = data;
  const tags = (verse.imagery_tags || "").split(",").map((s) => s.trim()).filter(Boolean);
  const focusedClipStart = verse.start;

  return (
    <>
      <Header subtitle="Verse" />
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <Link href="/enthusiast" className="text-xs text-ink-100/60 hover:text-gold-600 inline-block mb-4">
          ← Back to the Library
        </Link>

        {/* ── Hero: the focused verse ─────────────────────────────────── */}
        <section className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-gold-600 mb-2">
            {verse.verse_id} {verse.poem_id ? `· ${verse.poem_id}` : ""}
          </p>
          <Link href={poetUrl(verse.poet_en)} className="inline-block group">
            <p className="font-display text-2xl text-ink-300 group-hover:text-gold-600 transition-colors">
              {verse.poet_en}
              <span className="text-sm text-gold-600 opacity-0 group-hover:opacity-100 transition-opacity ml-2">→</span>
            </p>
            <p className="font-arabic text-lg text-ink-200" dir="rtl">{verse.poet_ar}</p>
          </Link>
          {verse.poem_title && (
            <p className="text-sm text-ink-100/70 italic mt-1">From: {verse.poem_title}</p>
          )}

          <div className="ornament my-6"><span className="ornament-glyph">۞</span></div>

          <p className="font-arabic text-3xl md:text-4xl text-ink-300 leading-loose text-right" dir="rtl">
            {verse.text_ar}
          </p>
          {verse.translation_en && (
            <div className="mt-5 rounded-sm bg-parchment-100/50 border border-gold-400/20 p-4 max-w-3xl">
              <p className="text-xs uppercase tracking-wider text-gold-600 mb-1">Translation</p>
              <p className="text-base text-ink-200 italic leading-relaxed">"{verse.translation_en}"</p>
            </div>
          )}
        </section>

        {/* ── Analytical row: t-SNE map + classification cards ────────── */}
        <section className="grid lg:grid-cols-[1fr_320px] gap-6 mb-10">
          <TsneMap
            highlightPoemId={verse.poem_id}
            highlightStart={focusedClipStart}
            defaultMode="genre"
          />

          <aside className="space-y-4">
            <div className="manuscript-card rounded-sm p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-gold-600 mb-3">Classification</p>
              {verse.genre_en && (
                <div className="mb-3">
                  <p className="text-[10px] uppercase tracking-wider text-ink-100/60">Genre</p>
                  <p className="text-sm text-ink-200">{verse.genre_en}</p>
                  <p className="font-arabic text-base text-ink-300" dir="rtl">{verse.genre_ar}</p>
                </div>
              )}
              {verse.emotion_en && (
                <div className="mb-3">
                  <p className="text-[10px] uppercase tracking-wider text-ink-100/60">Emotion</p>
                  <p className="text-sm text-ink-200">{verse.emotion_en}</p>
                  <p className="font-arabic text-base text-ink-300" dir="rtl">{verse.emotion_ar}</p>
                </div>
              )}
              <p className="text-[10px] text-ink-100/50 italic mt-2 pt-2 border-t border-gold-400/15">
                Labels from the MAAI7103 multimodal pipeline (AraPoemBERT classifier; macro-F1≈0.41).
              </p>
            </div>

            {tags.length > 0 && (
              <div className="manuscript-card rounded-sm p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-gold-600 mb-3">Imagery</p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2.5 py-1 rounded-full bg-sage-500/10 text-sage-600 border border-sage-500/25"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Link
              href={`/poet?prefill=${encodeURIComponent(verse.text_ar)}`}
              className="block text-center px-5 py-3 bg-ink-300 text-parchment-50 rounded-sm hover:bg-ink-400 transition-colors text-sm"
            >
              Ask the Critics what they hear in this verse →
            </Link>
          </aside>
        </section>

        {/* ── Full poem reconstruction ────────────────────────────────── */}
        {full_poem.length > 0 && (
          <section className="mb-10">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gold-600">The full poem</p>
                <h2 className="font-display text-2xl text-ink-300">
                  {full_poem.length} bayts in sequence
                </h2>
              </div>
              <p className="font-arabic text-base text-crimson-500" dir="rtl">القصيدة كاملةً</p>
            </div>
            <div className="manuscript-card rounded-sm p-6 space-y-5">
              {full_poem.map((clip, i) => {
                const isFocused = clip.start === verse.start;
                return (
                  <div
                    key={`${clip.start}-${i}`}
                    className={`pb-5 border-b last:border-b-0 last:pb-0 ${
                      isFocused ? "border-gold-500/60 bg-gold-400/8 -mx-3 px-3 py-2 rounded-sm" : "border-gold-400/15"
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-wider text-ink-100/55 mb-1">
                      Bayt {i + 1}
                      {isFocused && <span className="ml-2 text-gold-600">— this is the verse you're reading</span>}
                    </p>
                    <p className="font-arabic text-xl text-ink-300 leading-relaxed text-right" dir="rtl">
                      {clip.text_ar || "—"}
                    </p>
                    {clip.translation_en && (
                      <p className="text-sm text-ink-100/80 italic mt-2">"{clip.translation_en}"</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Sibling verses ──────────────────────────────────────────── */}
        {(same_poet.length > 0 || same_genre.length > 0) && (
          <section className="grid md:grid-cols-2 gap-6 mb-10">
            {same_poet.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gold-600 mb-3">
                  More from{" "}
                  <Link href={poetUrl(verse.poet_en)} className="hover:text-gold-700 underline underline-offset-2">
                    {verse.poet_en}
                  </Link>
                </p>
                <div className="space-y-2">
                  {same_poet.map((v) => (
                    <Link
                      key={v.verse_id}
                      href={`/library/${v.verse_id}`}
                      className="block manuscript-card rounded-sm p-3 text-sm"
                    >
                      <p className="font-arabic text-base text-ink-300 line-clamp-1" dir="rtl">{v.text_ar}</p>
                      {v.translation_en && (
                        <p className="text-xs text-ink-100/70 italic line-clamp-1 mt-1">"{v.translation_en}"</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {same_genre.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gold-600 mb-3">
                  Same genre · {verse.genre_en?.split("(")[0].trim()}
                </p>
                <div className="space-y-2">
                  {same_genre.map((v) => (
                    <Link
                      key={v.verse_id}
                      href={`/library/${v.verse_id}`}
                      className="block manuscript-card rounded-sm p-3 text-sm"
                    >
                      <p className="font-arabic text-base text-ink-300 line-clamp-1" dir="rtl">{v.text_ar}</p>
                      <p className="text-xs text-ink-100/60 mt-1">— {v.poet_en}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Provenance */}
        <div className="ornament my-8"><span className="ornament-glyph">۞</span></div>
        <p className="text-xs text-ink-100/60 italic text-center max-w-2xl mx-auto">
          Source: {verse.source}. Genre and emotion labels produced by AraPoemBERT classifiers from
          the MAAI7103 pipeline. The t-SNE projection uses 768-dimensional CLS embeddings,
          perplexity 40, projected once at build time.
        </p>
      </main>
    </>
  );
}
