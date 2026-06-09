"use client";

/**
 * Poet profile page.
 *
 * Why under /poet-profile/ rather than /poet/: the existing /poet/ route is the
 * Poet & Scholar GATE (where one composes for critique). Profile pages are a
 * different surface — they describe a poet — so they get their own namespace
 * to avoid breaking the existing /poet entry.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import {
  api,
  AnchorPoetResponse,
  ContemporaryPoetResponse,
  DctVerse,
  Phase2Context,
  PoetResponse,
  Verse,
} from "@/lib/api";

export default function PoetProfilePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [data, setData] = useState<PoetResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    api.poet(slug).then(setData).catch((e) => setError(e.message));
  }, [slug]);

  if (error) {
    return (
      <>
        <Header subtitle="Poet" />
        <main className="max-w-4xl mx-auto px-6 py-10">
          <p className="text-crimson-600 text-sm">Could not load this poet: {error}</p>
          <Link href="/enthusiast" className="gold-link text-sm">← Back to the Library</Link>
        </main>
      </>
    );
  }
  if (!data) {
    return (
      <>
        <Header subtitle="Poet" />
        <main className="max-w-4xl mx-auto px-6 py-10">
          <p className="text-sm text-ink-100/60 italic">Opening the poet's pages…</p>
        </main>
      </>
    );
  }

  return (
    <>
      <Header subtitle={data.kind === "anchor_critic" ? "Master Critic" : "Library Poet"} />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <Link href="/enthusiast" className="text-xs text-ink-100/60 hover:text-gold-600 inline-block mb-4">
          ← Back to the Library
        </Link>

        {data.kind === "anchor_critic" ? <AnchorView data={data} /> : <ContemporaryView data={data} />}
      </main>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Anchor Critic — Al-Mājidī, Ousha, Sheikh Zayed
// ─────────────────────────────────────────────────────────────────────

const SCHOOL_DIMENSIONS: Record<string, { ar: string; en: string; description: string }[]> = {
  al_majidi_bin_zahir: [
    { ar: "القافية", en: "Qāfiyah · Rhyme", description: "The rigorous axis. The rawiyy must hold; reaching for the rhyme-slot is a confession." },
    { ar: "الإيقاع", en: "Wazn · Rhythm", description: "Read against the Nabati templates (al-Hilali, al-Masḥūb). Descriptive, never arithmetic — Nabati is not Khalilian." },
    { ar: "الألفاظ", en: "Diction", description: "The Bedouin register. Weighty, drawn from the desert, the tribe, the conduct of honor. Urbanized softness is flagged." },
    { ar: "المعنى", en: "Meaning", description: "Moral clarity over ornament. Observed nature over decoration. Wisdom of restraint." },
  ],
  ousha_bint_khalifa: [
    { ar: "القافية", en: "Qāfiyah · Rhyme", description: "Firm. A rhyme reached by force is a kind of dishonesty her school does not forgive." },
    { ar: "صدق الشعور", en: "Truth of Feeling", description: "The defining axis. Does the verse confess what it claims to feel, or perform a feeling it has not earned?" },
    { ar: "الاقتصاد في الصورة", en: "Economy of Image", description: "Praise the image that does its work in few words. Decoration without revelation is flagged." },
    { ar: "الإيقاع", en: "Rhythm", description: "Descriptive only. Does the line ride a consistent Nabati cadence?" },
    { ar: "اللفظ", en: "Diction", description: "Intimate registers welcome. The domestic and the small are valid subjects — provided every word earns its place." },
  ],
  sheikh_zayed: [
    { ar: "القافية", en: "Qāfiyah · Rhyme", description: "The rhyme must hold with the discipline of leadership: deliberate, sustained, never lazy." },
    { ar: "الرسوخ", en: "Steadfastness", description: "The defining axis. Would the verse stand under the open sky? Would it endure repeating? Cleverness without rooting fails this test." },
    { ar: "اللحمة", en: "Cohesion · Unity", description: "The school listens for verse that builds. Satire has its place, but his school chooses construction over demolition." },
    { ar: "الصلة بالأرض", en: "Bond with the Land", description: "The dunes named, the falaj followed, the falcon's flight tracked. Is the land truly observed, or merely decorated with?" },
    { ar: "الإيقاع", en: "Rhythm", description: "Descriptive. The Khaleeji cadence the reciter and the listener can carry." },
    { ar: "اللفظ", en: "Diction", description: "Dignified, accessible, weighty. Overstrained vocabulary is alien to this register." },
  ],
};

function AnchorView({ data }: { data: AnchorPoetResponse }) {
  const dims = SCHOOL_DIMENSIONS[data.agent_id] || [];
  const p = data.profile;

  return (
    <>
      {/* Hero */}
      <section className="grid md:grid-cols-[200px_1fr] gap-8 items-start mb-12">
        <div
          className="aspect-square rounded-sm flex items-center justify-center"
          style={{ background: p.color + "15", border: `1px solid ${p.color}40` }}
        >
          <Image src={p.icon} alt="" width={96} height={96} className="opacity-90" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-crimson-500 mb-3">Master Critic of the Majlis</p>
          <p className="font-arabic text-4xl md:text-5xl text-ink-300 mb-2 leading-tight" dir="rtl">
            {p.name_ar}
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-ink-300">{p.name_en}</h1>
          {(p.epithet_ar || p.epithet_en) && (
            <p className="text-sm text-ink-100/75 italic mt-2">
              {p.epithet_ar && <span className="font-arabic mr-3">{p.epithet_ar}</span>}
              {p.epithet_en}
            </p>
          )}
          <p className="text-sm text-ink-100/70 mt-3">
            <span className="text-gold-600">{p.era}</span> · {p.region}
          </p>
        </div>
      </section>

      <div className="ornament my-8"><span className="ornament-glyph">۞</span></div>

      {/* Bilingual bio */}
      <section className="grid md:grid-cols-2 gap-6 mb-12">
        <div className="manuscript-card rounded-sm p-6">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-600 mb-3">About</p>
          <p className="text-base text-ink-200 leading-relaxed">{p.bio_short_en}</p>
        </div>
        <div className="manuscript-card rounded-sm p-6" dir="rtl">
          <p className="text-xs uppercase tracking-[0.18em] text-gold-600 mb-3">عن الشاعر</p>
          <p className="font-arabic text-base text-ink-200 leading-loose">{p.bio_short_ar}</p>
        </div>
      </section>

      {/* The school's principles */}
      <section className="mb-12">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-gold-600 mb-2">The school's principles</p>
          <h2 className="font-display text-3xl text-ink-300">How this Critic reads a verse</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {dims.map((d, i) => (
            <div key={d.en} className="manuscript-card rounded-sm p-5" style={{ borderLeftColor: p.color, borderLeftWidth: 3 }}>
              <div className="flex items-baseline justify-between mb-2">
                <p className="text-xs uppercase tracking-wider" style={{ color: p.color }}>
                  Dimension {i + 1}
                </p>
                <p className="font-arabic text-base text-ink-300" dir="rtl">{d.ar}</p>
              </div>
              <p className="font-display text-lg text-ink-300 mb-2">{d.en}</p>
              <p className="text-sm text-ink-100/85 leading-relaxed italic">{d.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing formula */}
      <section className="my-12 text-center">
        <div className="ornament my-6"><span className="ornament-glyph">۞</span></div>
        <p className="text-xs uppercase tracking-[0.2em] text-gold-600 mb-4">The Critic's signature</p>
        <p className="font-arabic text-2xl text-ink-300 mb-2 leading-loose" dir="rtl">
          {p.closing_formula_ar}
        </p>
        <p className="text-base text-ink-100 italic">{p.closing_formula_en}</p>
        <p className="text-xs text-ink-100/60 italic mt-3 max-w-xl mx-auto">
          Every verdict from this Critic ends with these words — a reminder that what speaks is the
          school, the tradition, the documented principles. Not the ghost of the man.
        </p>
      </section>

      {/* Verses panel — DCT-crawled verses if present, library matches if any, or Phase-2 marker */}
      <section className="my-12">
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-gold-600 mb-2">Attested verses</p>
          <h2 className="font-display text-3xl text-ink-300">{p.name_en}'s poetry</h2>
          {data.dct_verse_count > 0 && (
            <p className="text-xs text-ink-100/70 mt-2">
              {data.dct_verse_count} poem{data.dct_verse_count === 1 ? "" : "s"} from the
              <a href="https://poetry.dct.gov.ae" target="_blank" rel="noopener" className="gold-link mx-1">
                DCT Abu Dhabi Poetry Archive
              </a>
            </p>
          )}
        </div>

        {data.dct_verse_count > 0 ? (
          <div className="space-y-6">
            {data.dct_verses.map((v) => (
              <DctPoemCard key={v.verse_id} v={v} accentColor={p.color} />
            ))}
          </div>
        ) : data.verses.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {data.verses.map((v) => (
              <Link key={v.verse_id} href={`/library/${v.verse_id}`} className="manuscript-card rounded-sm p-5 block">
                <p className="font-arabic text-lg text-ink-300 leading-relaxed text-right" dir="rtl">{v.text_ar}</p>
                {v.translation_en && (
                  <p className="text-sm text-ink-100/75 italic mt-2">"{v.translation_en}"</p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <Phase2Panel poetName={p.name_en} ctx={data.phase2_context} />
        )}
      </section>

      {/* Convene CTA */}
      <section className="my-12 text-center">
        <div className="ornament my-6"><span className="ornament-glyph">۞</span></div>
        <p className="text-xs uppercase tracking-[0.2em] text-gold-600 mb-3">Speak with this Critic</p>
        <h2 className="font-display text-3xl text-ink-300 mb-3">
          Convene {p.name_en} alone for your verse
        </h2>
        <p className="text-sm text-ink-100/80 max-w-xl mx-auto mb-6">
          Skip the Convener. Bring your verse directly to this school. The Critic will read it
          against the principles above and render their verdict in their voice.
        </p>
        <Link
          href={`/poet?critic=${encodeURIComponent(p.agent_id)}`}
          className="inline-block px-8 py-3 rounded-sm text-parchment-50 hover:opacity-90 transition-opacity text-sm tracking-wide"
          style={{ background: p.color }}
        >
          Convene {p.name_en} →
        </Link>
      </section>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Contemporary poet — derived from the Library corpus
// ─────────────────────────────────────────────────────────────────────

function ContemporaryView({ data }: { data: ContemporaryPoetResponse }) {
  return (
    <>
      <section className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-sage-500 mb-3">Contemporary Khaleeji Master</p>
        <p className="font-arabic text-4xl md:text-5xl text-ink-300 mb-2" dir="rtl">{data.name_ar}</p>
        <h1 className="font-display text-4xl md:text-5xl text-ink-300">{data.name_en}</h1>
        <p className="text-sm text-ink-100/70 mt-3">
          {data.verse_count} verse{data.verse_count !== 1 ? "s" : ""} attested in the prototype's library
        </p>
      </section>

      <div className="ornament my-8"><span className="ornament-glyph">۞</span></div>

      {/* Fingerprint */}
      <section className="mb-12">
        <div className="text-center mb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-gold-600 mb-2">Poetic fingerprint</p>
          <h2 className="font-display text-3xl text-ink-300">What this poet works in</h2>
          <p className="text-xs text-ink-100/65 italic mt-1">
            Derived from the corpus's classifier labels. Phase 2 will improve precision as the
            corpus grows.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <FingerprintPanel title="Genres" items={data.fingerprint.genres} color="#5D4037" />
          <FingerprintPanel title="Emotions" items={data.fingerprint.emotions} color="#7E2C2C" />
          <ImageryPanel items={data.fingerprint.imagery} />
        </div>
      </section>

      {/* All verses */}
      <section className="mb-12">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-gold-600">In the library</p>
            <h2 className="font-display text-2xl text-ink-300">All {data.verse_count} verses</h2>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {data.verses.map((v) => (
            <Link key={v.verse_id} href={`/library/${v.verse_id}`} className="manuscript-card rounded-sm p-5 block">
              <p className="font-arabic text-lg text-ink-300 leading-relaxed line-clamp-3 text-right" dir="rtl">
                {v.text_ar}
              </p>
              {v.translation_en && (
                <p className="text-xs text-ink-100/75 italic line-clamp-2 mt-3">"{v.translation_en}"</p>
              )}
              {v.genre_en && (
                <span className="inline-block mt-3 text-xs px-2 py-0.5 rounded-full bg-sage-500/10 text-sage-600 border border-sage-500/20">
                  {v.genre_en.split("(")[0].trim()}
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

function FingerprintPanel({
  title,
  items,
  color,
}: {
  title: string;
  items: [string, number][];
  color: string;
}) {
  if (items.length === 0) {
    return (
      <div className="manuscript-card rounded-sm p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-600 mb-3">{title}</p>
        <p className="text-sm text-ink-100/60 italic">No labels recorded.</p>
      </div>
    );
  }
  const max = Math.max(...items.map(([, n]) => n));
  return (
    <div className="manuscript-card rounded-sm p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-gold-600 mb-3">{title}</p>
      <div className="space-y-2.5">
        {items.map(([label, n]) => (
          <div key={label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-ink-200">{label}</span>
              <span className="text-ink-100/60">{n}</span>
            </div>
            <div className="h-1.5 bg-parchment-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${(n / max) * 100}%`, background: color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImageryPanel({ items }: { items: [string, number][] }) {
  if (items.length === 0) {
    return (
      <div className="manuscript-card rounded-sm p-5">
        <p className="text-xs uppercase tracking-[0.18em] text-gold-600 mb-3">Imagery</p>
        <p className="text-sm text-ink-100/60 italic">No imagery tags recorded.</p>
      </div>
    );
  }
  return (
    <div className="manuscript-card rounded-sm p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-gold-600 mb-3">Imagery</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map(([t, n]) => (
          <span
            key={t}
            className="text-xs px-2 py-1 rounded-full bg-sage-500/10 text-sage-600 border border-sage-500/25"
            style={{ fontSize: `${Math.min(13, 10 + n)}px` }}
          >
            {t} <span className="text-sage-500/60">·{n}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────
// DCT poem card — renders an attested poem from the DCT archive
// with the proper sadr/ajuz two-hemistich layout, expand/collapse,
// and a "Convene this Critic on this poem" CTA.
// ─────────────────────────────────────────────────────────────────────

function DctPoemCard({ v, accentColor }: { v: DctVerse; accentColor: string }) {
  const previewBayts = 4;
  const [expanded, setExpanded] = useState(v.bayt_count <= previewBayts);
  const shownBayts = expanded ? v.bayts : v.bayts.slice(0, previewBayts);

  return (
    <article
      className="manuscript-card rounded-sm p-6"
      style={{ borderLeftColor: accentColor, borderLeftWidth: 3 }}
    >
      {/* Title row */}
      <div className="flex items-baseline justify-between mb-2 flex-wrap gap-2">
        <div>
          {v.title && (
            <h3 className="font-display text-xl text-ink-300">{v.title}</h3>
          )}
          {v.note && (
            <p className="text-xs italic text-ink-100/75 mt-0.5">{v.note}</p>
          )}
        </div>
        <span className="text-[10px] uppercase tracking-wider text-ink-100/60">
          {v.bayt_count} bayts
        </span>
      </div>

      {/* Metadata strip */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs text-ink-100/85">
        {v.meta.meter && (
          <span className="px-2 py-0.5 rounded-sm bg-parchment-100 border border-gold-400/25">
            <span className="text-[10px] uppercase tracking-wider text-gold-600 mr-1">Meter</span>
            {v.meta.meter}
          </span>
        )}
        {v.meta.rhyme && (
          <span className="px-2 py-0.5 rounded-sm bg-parchment-100 border border-gold-400/25">
            <span className="text-[10px] uppercase tracking-wider text-gold-600 mr-1">Rawiyy</span>
            <span className="font-arabic">{v.meta.rhyme}</span>
          </span>
        )}
        {v.meta.source && (
          <span className="px-2 py-0.5 rounded-sm bg-parchment-100 border border-gold-400/25">
            <span className="text-[10px] uppercase tracking-wider text-gold-600 mr-1">Diwan</span>
            <span className="font-arabic">{v.meta.source}</span>
          </span>
        )}
      </div>

      {/* The poem itself — sadr | ajuz table, RTL */}
      <div className="my-4" dir="rtl">
        <table className="w-full" style={{ borderCollapse: "separate", borderSpacing: "0 0.5rem" }}>
          <tbody>
            {shownBayts.map((b, i) => (
              <tr key={i} className="font-arabic">
                <td className="text-base md:text-lg text-ink-300 leading-loose w-1/2 pr-3">
                  {b.sadr}
                </td>
                <td className="text-base md:text-lg text-ink-300 leading-loose w-1/2 pl-3 border-r border-gold-400/20">
                  {b.ajuz}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {v.bayt_count > previewBayts && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-gold-600 hover:text-gold-700 underline underline-offset-2 mt-2"
          >
            {expanded ? "Collapse" : `Show all ${v.bayt_count} bayts`}
          </button>
        )}
      </div>

      {/* Footer: source + convene CTA */}
      <div className="flex items-baseline justify-between mt-4 pt-4 border-t border-gold-400/15 flex-wrap gap-3">
        <a
          href={v.source_url}
          target="_blank"
          rel="noopener"
          className="text-xs text-ink-100 hover:text-gold-600 transition-colors"
        >
          ↗ Verified source on DCT Abu Dhabi archive
        </a>
        <Link
          href={`/poet?prefill=${encodeURIComponent(v.text_ar)}&critic=${encodeURIComponent(v.agent_id)}`}
          className="text-xs px-3 py-1.5 rounded-sm text-parchment-50 hover:opacity-90 transition-opacity"
          style={{ background: accentColor }}
        >
          Convene this Critic on this poem →
        </Link>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────────────────────────────
// Phase 2 panel — shown when an anchor critic has no DCT verses yet,
// but we have biographical context, authoritative-source citations,
// and a transparent explanation of why the corpus is empty here.
// ─────────────────────────────────────────────────────────────────────

function Phase2Panel({ poetName, ctx }: { poetName: string; ctx: Phase2Context | null }) {
  if (!ctx) {
    // Generic fallback — minimal placeholder with no enriched context
    return (
      <div className="rounded-sm border-2 border-dashed border-gold-500/40 bg-parchment-100/40 p-8 text-center">
        <p className="text-xs uppercase tracking-wider text-crimson-500 mb-2">Phase 2 · Pending</p>
        <p className="text-sm text-ink-200 mb-3">
          Verified verses by {poetName} will be loaded in Phase 2 (corpus integration pending).
        </p>
        <p className="text-xs text-ink-100/70 italic max-w-xl mx-auto">
          In this prototype, this Critic speaks from the school's documented principles, not from
          verse retrieval. We chose this over fabrication.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-sm border-2 border-dashed border-gold-500/40 bg-parchment-100/40 p-7">
      <div className="flex flex-wrap items-baseline justify-between mb-5 gap-2">
        <p className="text-xs uppercase tracking-wider text-crimson-500">Phase 2 · Verses pending</p>
        {ctx.verses_known_count && (
          <p className="text-xs text-ink-100/70 italic">{ctx.verses_known_count}</p>
        )}
      </div>

      {ctx.biographical_excerpt_en && (
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-wider text-gold-600 mb-1.5">From the verified record</p>
          <p className="text-sm text-ink-200 leading-relaxed">{ctx.biographical_excerpt_en}</p>
        </div>
      )}

      {ctx.attribution_caution && (
        <div className="mb-5 rounded-sm border border-crimson-500/30 bg-crimson-500/5 p-3">
          <p className="text-[10px] uppercase tracking-wider text-crimson-600 mb-1.5">Attribution caution</p>
          <p className="text-xs text-ink-200 leading-relaxed">{ctx.attribution_caution}</p>
        </div>
      )}

      {ctx.authoritative_diwan && (
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-wider text-gold-600 mb-1.5">Authoritative diwan</p>
          <div className="rounded-sm bg-parchment-50 border border-gold-400/25 p-3">
            <p className="font-arabic text-base text-ink-300 mb-1">{ctx.authoritative_diwan.title}</p>
            <p className="text-xs text-ink-100">
              Edited by <strong>{ctx.authoritative_diwan.editor}</strong> · {ctx.authoritative_diwan.publisher} · {ctx.authoritative_diwan.year}
            </p>
            {ctx.authoritative_diwan.note && (
              <p className="text-xs text-ink-100/75 italic mt-2">{ctx.authoritative_diwan.note}</p>
            )}
          </div>
        </div>
      )}

      {ctx.additional_print_sources && ctx.additional_print_sources.length > 0 && (
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-wider text-gold-600 mb-1.5">Additional scholarly sources</p>
          <ul className="text-xs text-ink-200 space-y-1 list-none">
            {ctx.additional_print_sources.map((s, i) => (
              <li key={i} className="pl-3 border-l border-gold-400/30">{s}</li>
            ))}
          </ul>
        </div>
      )}

      {ctx.verified_authority_url && ctx.verified_authority_name && (
        <div className="mb-5">
          <p className="text-[10px] uppercase tracking-wider text-gold-600 mb-1.5">Verified authority</p>
          <a
            href={ctx.verified_authority_url}
            target="_blank"
            rel="noopener"
            className="gold-link text-sm"
          >
            {ctx.verified_authority_name} ↗
          </a>
        </div>
      )}

      {ctx.phase2_status && (
        <div className="mt-6 pt-4 border-t border-gold-400/20">
          <p className="text-[10px] uppercase tracking-wider text-gold-600 mb-1.5">Phase 2 plan</p>
          <p className="text-xs text-ink-100/85 italic leading-relaxed">{ctx.phase2_status}</p>
        </div>
      )}

      <p className="text-xs text-ink-100/70 italic mt-6 pt-4 border-t border-gold-400/20 max-w-2xl">
        In this prototype, this Critic speaks from the school's documented principles, not from
        verse retrieval. We chose this over fabrication: the council can read your verse with
        technical authority on rhyme, rhythm, and diction without claiming to quote a master
        whose attested verses we have not yet ingested with full provenance.
      </p>
    </div>
  );
}
