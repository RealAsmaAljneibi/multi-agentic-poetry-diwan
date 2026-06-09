import Link from "next/link";
import Image from "next/image";

const CRITICS = [
  {
    id: "al_majidi_bin_zahir",
    name_ar: "الماجدي بن ظاهر",
    name_en: "Al-Mājidī bin Ẓāhir",
    epithet: "Father of Emirati Nabati Poetry",
    era: "c. 1560s–1630s · Ras Al Khaimah",
    color: "#5D4037",
    icon: "/icons/dallah.png",
    domains: "Wazn · Qāfiyah · Bedouin diction · Moral clarity",
  },
  {
    id: "ousha_bint_khalifa",
    name_ar: "عوشة بنت خليفة",
    name_en: "Ousha bint Khalifa",
    epithet: "Fatat Al-Arab — The Arabian Maiden",
    era: "1920–2018 · Al Ain",
    color: "#7E2C2C",
    icon: "/icons/dukhon.png",
    domains: "Truth of feeling · Economy of image · Intimate register",
  },
  {
    id: "sheikh_zayed",
    name_ar: "الشيخ زايد بن سلطان",
    name_en: "Sheikh Zayed",
    epithet: "Founding Father of the UAE",
    era: "1918–2004 · Al Ain & Abu Dhabi",
    color: "#1B5E20",
    icon: "/icons/dates.png",
    domains: "Wisdom · Land & unity · Falconry · Stewardship",
  },
];

const CAPABILITIES = [
  {
    icon: "/icons/finjan.png",
    title: "Critique a verse",
    body: "Submit a poem you have written. The Convener selects which Critics should speak, and they render verdict in turn — qāfiyah judged firmly, rhythm read descriptively, diction weighed against the school's lexicon.",
  },
  {
    icon: "/icons/dallah.png",
    title: "Browse the library",
    body: "Eighty verses across ten contemporary Khaleeji masters, with translations, imagery tags, and provenance. Every entry traceable to source.",
  },
  {
    icon: "/icons/dihn-oud.png",
    title: "Look up a word",
    body: "A growing dictionary of Khaleeji and classical Nabati terms — defined, attested, sourced. Poets may contribute new entries publicly or privately.",
  },
  {
    icon: "/icons/dukhon.png",
    title: "Archive your work",
    body: "Poets and scholars: store your compositions in your own vault. Mark each one public, anonymous, or strictly private. The Majlis never trains on private work.",
  },
];

export default function Landing() {
  return (
    <main id="main" className="min-h-screen">
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* decorative calligraphy hero */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
          <Image
            src="/calligraphy-hero.png"
            alt=""
            fill
            priority
            className="object-cover"
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 text-center">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-gold-400/40 bg-parchment-50/80 text-xs uppercase tracking-[0.18em] text-ink-200 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
            Emirati Nabati Poetry · Multi-Agent System
            <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
          </div>

          <h1 className="font-arabic text-4xl md:text-6xl text-ink-300 mb-3 leading-tight" dir="rtl">
            مجلس القصيد الإماراتي - متعدد الوكلاء
          </h1>
          <p className="font-display text-3xl md:text-5xl font-medium text-crimson-500 mb-8 leading-tight">
            The Emirati Multi-Agentic Poetic Majlis
          </p>

          <p className="max-w-2xl mx-auto text-lg text-ink-100 leading-relaxed mb-10">
            A council of master Critics — drawn from the documented schools of
            Al-Mājidī bin Ẓāhir, Ousha bint Khalifa, and Sheikh Zayed — convenes
            to read the verses of living poets. Not to write for them. To listen,
            to weigh, and to teach.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <a
              href="#capabilities"
              className="px-6 py-3 bg-ink-300 text-parchment-50 rounded-sm hover:bg-ink-400 transition-colors text-sm tracking-wide"
            >
              See what the Majlis can do
            </a>
            <a
              href="#enter"
              className="px-6 py-3 border border-gold-500 text-ink-200 rounded-sm hover:bg-gold-400/10 transition-colors text-sm tracking-wide"
            >
              Enter the Majlis ↓
            </a>
          </div>

          {/* Critics peek */}
          <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {CRITICS.map((c) => (
              <Link
                key={c.id}
                href={`/poet-profile/${c.id}`}
                className="manuscript-card rounded-sm p-6 text-left block group relative"
              >
                <div className="flex items-start gap-4 mb-3">
                  <div className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: c.color + "15" }}>
                    <Image src={c.icon} alt="" width={28} height={28} className="opacity-80" />
                  </div>
                  <div className="flex-1">
                    <p className="font-arabic text-xl text-ink-300 mb-0.5" dir="rtl">{c.name_ar}</p>
                    <p className="font-display text-lg text-ink-200">{c.name_en}</p>
                  </div>
                </div>
                <p className="text-xs uppercase tracking-wider text-ink-100 mb-1">{c.epithet}</p>
                <p className="text-xs text-ink-100/70 mb-3">{c.era}</p>
                <p className="text-xs text-ink-100/80 italic border-t border-gold-400/20 pt-3">
                  {c.domains}
                </p>
                <span className="absolute bottom-3 right-4 text-xs text-gold-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Read more →
                </span>
              </Link>
            ))}
          </div>

          <div className="ornament mt-16">
            <span className="ornament-glyph">۞</span>
          </div>

          <p className="text-xs text-ink-100/60 max-w-xl mx-auto">
            The Critics are <strong>educators, not authors</strong>. They speak from
            the documented principles of each school. They never write verse on the
            poet's behalf, never claim to channel the historical figure, and never
            invent a quotation. This is the Curator & Critic Protocol.
          </p>

          {/* scroll cue */}
          <div className="flex flex-col items-center mt-16">
            <p className="text-xs uppercase tracking-[0.2em] text-ink-100/60 mb-2">Scroll to enter</p>
            <span className="scroll-cue text-2xl text-gold-500">↓</span>
          </div>
        </div>
      </section>

      {/* ── Capabilities ────────────────────────────────────────────────── */}
      <section id="capabilities" className="bg-parchment-100/40 border-y border-gold-400/20 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.2em] text-gold-600 mb-3">What the Majlis offers</p>
            <h2 className="font-display text-4xl text-ink-300 mb-4">A council, a library, a living dictionary</h2>
            <p className="font-arabic text-xl text-crimson-500" dir="rtl">مجلسٌ، ومكتبةٌ، ومعجمٌ حيّ</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {CAPABILITIES.map((cap) => (
              <div key={cap.title} className="manuscript-card rounded-sm p-6 flex gap-5">
                <div className="shrink-0 w-14 h-14 rounded-full bg-gold-400/10 flex items-center justify-center">
                  <Image src={cap.icon} alt="" width={32} height={32} />
                </div>
                <div>
                  <h3 className="font-display text-xl text-ink-300 mb-2">{cap.title}</h3>
                  <p className="text-sm text-ink-100/85 leading-relaxed">{cap.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Two Gates Choose-Your-Path ──────────────────────────────────── */}
      <section id="enter" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.2em] text-gold-600 mb-3">Choose your gate</p>
            <h2 className="font-display text-4xl text-ink-300 mb-4">How will you enter the Majlis?</h2>
            <p className="text-ink-100 max-w-xl mx-auto">
              The Majlis has two doors. Both lead to the same council, but they offer
              different tools — chosen for what you have come to do today.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Poet Gate */}
            <Link
              href="/poet"
              className="group manuscript-card rounded-sm p-10 block relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.05] pointer-events-none">
                <Image src="/icons/dallah.png" alt="" fill className="object-contain" />
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-crimson-500 mb-3">For the Craftsman</p>
              <h3 className="font-display text-3xl text-ink-300 mb-2">Poets &amp; Scholars</h3>
              <p className="font-arabic text-lg text-ink-200 mb-6" dir="rtl">للشعراء والعلماء</p>
              <ul className="space-y-2.5 text-sm text-ink-100/85 mb-8">
                <li className="flex gap-2"><span className="text-gold-500">۞</span> Archive your compositions — public or private vault</li>
                <li className="flex gap-2"><span className="text-gold-500">۞</span> Submit verse for Critic review (Live Debate)</li>
                <li className="flex gap-2"><span className="text-gold-500">۞</span> Contribute terms to the Unified Dictionary</li>
                <li className="flex gap-2"><span className="text-gold-500">۞</span> Attribution preserved on every output</li>
              </ul>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-ink-200 group-hover:text-gold-600 transition-colors">
                Enter as Poet · Scholar →
              </span>
            </Link>

            {/* Enthusiast Gate */}
            <Link
              href="/enthusiast"
              className="group manuscript-card rounded-sm p-10 block relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.05] pointer-events-none">
                <Image src="/icons/finjan.png" alt="" fill className="object-contain" />
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-sage-500 mb-3">For the Explorer</p>
              <h3 className="font-display text-3xl text-ink-300 mb-2">Enthusiasts &amp; Visitors</h3>
              <p className="font-arabic text-lg text-ink-200 mb-6" dir="rtl">للمحبين والزائرين</p>
              <ul className="space-y-2.5 text-sm text-ink-100/85 mb-8">
                <li className="flex gap-2"><span className="text-gold-500">۞</span> Browse 80 verses across ten masters</li>
                <li className="flex gap-2"><span className="text-gold-500">۞</span> Look up Khaleeji words and their stories</li>
                <li className="flex gap-2"><span className="text-gold-500">۞</span> Ask "What would Sheikh Zayed say about this?"</li>
                <li className="flex gap-2"><span className="text-gold-500">۞</span> Learn through guided readings of classical verse</li>
              </ul>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-ink-200 group-hover:text-gold-600 transition-colors">
                Enter as Enthusiast →
              </span>
            </Link>
          </div>

          {/* Integrity note */}
          <div className="max-w-2xl mx-auto mt-20 text-center">
            <div className="ornament">
              <span className="ornament-glyph">۞</span>
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold-600 mb-3">A commitment</p>
            <p className="text-sm text-ink-100/80 italic leading-relaxed">
              The Majlis labels every AI-assisted output. Critics never impersonate the poets they speak for.
              Private submissions remain private — they are never used to train the system.
              Every verse, every entry, every citation is traceable to its source.
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-gold-400/20 py-8 bg-parchment-100/30">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-xs text-ink-100/60">
            The Poetic Majlis · A research prototype on Emirati Nabati poetry · Built with reverence
          </p>
        </div>
      </footer>
    </main>
  );
}
