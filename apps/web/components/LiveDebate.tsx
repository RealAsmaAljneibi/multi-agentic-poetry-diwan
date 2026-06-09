"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { api, Critic, CritiqueResult } from "@/lib/api";
import MarkdownLite from "./MarkdownLite";

const CRITIC_META: Record<string, { name_ar: string; name_en: string; icon: string; color: string; epithet: string }> = {
  al_majidi_bin_zahir: {
    name_ar: "الماجدي بن ظاهر",
    name_en: "Al-Mājidī bin Ẓāhir",
    icon: "/icons/dallah.png",
    color: "#5D4037",
    epithet: "Father of Emirati Nabati Poetry",
  },
  ousha_bint_khalifa: {
    name_ar: "عوشة بنت خليفة",
    name_en: "Ousha bint Khalifa",
    icon: "/icons/dukhon.png",
    color: "#7E2C2C",
    epithet: "Fatat Al-Arab",
  },
  sheikh_zayed: {
    name_ar: "الشيخ زايد",
    name_en: "Sheikh Zayed",
    icon: "/icons/dates.png",
    color: "#1B5E20",
    epithet: "Founding Father",
  },
};

export default function LiveDebate() {
  const [verseText, setVerseText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CritiqueResult | null>(null);
  const [stage, setStage] = useState<"idle" | "convening" | "deliberating" | "complete">("idle");
  const [visibility, setVisibility] = useState<"public" | "private" | "anonymous">("public");
  const [poetHandle, setPoetHandle] = useState("");
  const [archiveAfter, setArchiveAfter] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // If the user came from a poet page wanting one specific Critic, this holds that pin.
  const [forcedCritics, setForcedCritics] = useState<string[]>([]);

  // Pre-fill the textarea when the URL has ?prefill=... (from "Ask the Critics" buttons in the Library)
  // Pin the critic when the URL has ?critic=al_majidi_bin_zahir (from poet pages)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const pre = params.get("prefill");
    if (pre) {
      setVerseText(pre);
      setTimeout(() => {
        document.querySelector("textarea")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
    const critic = params.get("critic");
    if (critic) {
      setForcedCritics(critic.split(",").map((s) => s.trim()).filter(Boolean));
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!verseText.trim()) return;
    setError(null);
    setResult(null);
    setSubmitting(true);
    setStage("convening");

    try {
      let skeletonSelected: string[];
      let skeletonReasoning: string;

      if (forcedCritics.length > 0) {
        // Forced path — skip the Convener call entirely; we already know who speaks.
        skeletonSelected = forcedCritics;
        skeletonReasoning = `Summoned directly: you have asked ${forcedCritics
          .map((c) => c.replace(/_/g, " "))
          .join(" and ")} to speak.`;
        setStage("deliberating");
        // Quick local qafiyah ping just to populate the badge
        setResult({
          selected: skeletonSelected,
          lead: skeletonSelected[0],
          convener_reasoning: skeletonReasoning,
          verdicts: skeletonSelected.map((id) => ({ agent_id: id, verdict_md: "" })),
          qafiyah_quick: { detected: null, consistent: false, lines: 0, note: "" },
        });
      } else {
        // Stage 1: convene (fast — gives the user immediate feedback)
        const plan = await api.convene(verseText);
        setStage("deliberating");
        skeletonSelected = plan.convener.selected;
        skeletonReasoning = plan.convener.reasoning;
        // Pre-render skeleton with the selected critics
        setResult({
          selected: plan.convener.selected,
          lead: plan.convener.lead,
          convener_reasoning: plan.convener.reasoning,
          verdicts: plan.convener.selected.map((id) => ({ agent_id: id, verdict_md: "" })),
          qafiyah_quick: plan.qafiyah_quick,
        });
      }

      // Stage 2: full critique
      const full = await api.critique(verseText, forcedCritics.length ? forcedCritics : undefined);
      setResult(full);

      // Stage 3: archive if requested
      if (archiveAfter) {
        await api.submit({
          kind: "composition",
          visibility,
          poet_handle: visibility === "anonymous" ? undefined : poetHandle || undefined,
          text_ar: verseText,
          run_critique: false, // already have it
        });
      }
      setStage("complete");
    } catch (e: any) {
      setError(e.message || "Something went wrong reaching the council.");
      setStage("idle");
    } finally {
      setSubmitting(false);
    }
  }

  const criticDisplayName: Record<string, string> = {
    al_majidi_bin_zahir: "Al-Mājidī bin Ẓāhir",
    ousha_bint_khalifa: "Ousha bint Khalifa",
    sheikh_zayed: "Sheikh Zayed",
  };

  return (
    <div className="space-y-8">
      {/* Pinned-critic banner — visible when the user landed via "?critic=" */}
      {forcedCritics.length > 0 && (
        <div className="rounded-sm border border-gold-500/40 bg-gold-400/10 px-5 py-3 flex items-center justify-between">
          <p className="text-sm text-ink-200">
            <span className="text-xs uppercase tracking-wider text-gold-600 mr-2">Pinned</span>
            Your verse will go directly to{" "}
            <strong>
              {forcedCritics.map((c) => criticDisplayName[c] || c).join(" & ")}
            </strong>
            . The Convener has been bypassed.
          </p>
          <button
            type="button"
            onClick={() => setForcedCritics([])}
            className="text-xs text-ink-100 hover:text-crimson-500 underline underline-offset-2"
          >
            Release · let the Convener decide
          </button>
        </div>
      )}

      {/* ── Submission form ─────────────────────────────────────────── */}
      <form onSubmit={onSubmit} className="manuscript-card rounded-sm p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <label className="block text-sm uppercase tracking-[0.18em] text-gold-600">
            Submit a verse for critique
          </label>
          <span className="font-arabic text-sm text-ink-100/70" dir="rtl">
            اعرض بيتاً على المجلس
          </span>
        </div>
        <textarea
          value={verseText}
          onChange={(e) => setVerseText(e.target.value)}
          rows={5}
          dir="rtl"
          placeholder={"اكتب بيتك هنا...\n(can be one or more lines)"}
          className="w-full font-arabic text-xl leading-relaxed bg-parchment-50 border border-gold-400/30 rounded-sm p-4 focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30"
        />

        {/* Privacy + handle */}
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink-100/70 mb-1.5">
              Visibility
            </label>
            <div className="flex gap-2">
              {[
                { v: "public", label: "Public", desc: "Archived openly with your name" },
                { v: "anonymous", label: "Anonymous", desc: "Public, no name attached" },
                { v: "private", label: "Private", desc: "Your vault only" },
              ].map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setVisibility(opt.v as any)}
                  title={opt.desc}
                  className={`px-3 py-1.5 text-xs rounded-sm border transition-colors ${
                    visibility === opt.v
                      ? "border-gold-500 bg-gold-400/10 text-ink-300"
                      : "border-gold-400/25 text-ink-100/70 hover:border-gold-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {visibility !== "anonymous" && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink-100/70 mb-1.5">
                Your handle (optional)
              </label>
              <input
                value={poetHandle}
                onChange={(e) => setPoetHandle(e.target.value)}
                placeholder="e.g. Asma Al Suwaidi"
                className="w-full text-sm bg-parchment-50 border border-gold-400/30 rounded-sm px-3 py-1.5 focus:outline-none focus:border-gold-500"
              />
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <label className="flex items-center gap-2 text-xs text-ink-100/80">
            <input
              type="checkbox"
              checked={archiveAfter}
              onChange={(e) => setArchiveAfter(e.target.checked)}
              className="accent-gold-500"
            />
            Archive this submission after the council reads it
          </label>
          <button
            type="submit"
            disabled={submitting || !verseText.trim()}
            className="px-6 py-2.5 bg-ink-300 text-parchment-50 rounded-sm hover:bg-ink-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm tracking-wide"
          >
            {submitting ? "The council is convening…" : "Convene the council"}
          </button>
        </div>

        {/* Phase-2 affordances visible but disabled (transparency) */}
        <div className="mt-5 pt-4 border-t border-gold-400/20 flex gap-2">
          <button
            type="button"
            disabled
            title="Voice intake — Phase 2"
            className="px-3 py-1.5 text-xs rounded-sm border border-gold-400/20 text-ink-100/40 cursor-not-allowed"
          >
            🎙 Voice (Phase 2)
          </button>
          <button
            type="button"
            disabled
            title="Manuscript image OCR — Phase 2"
            className="px-3 py-1.5 text-xs rounded-sm border border-gold-400/20 text-ink-100/40 cursor-not-allowed"
          >
            📜 Image (Phase 2)
          </button>
        </div>

        {error && (
          <p className="mt-4 text-sm text-crimson-600 border-l-2 border-crimson-500 pl-3">
            {error}
          </p>
        )}
      </form>

      {/* ── Live Debate stream ──────────────────────────────────────── */}
      {result && (
        <div className="space-y-6">
          {/* Convener verdict */}
          <div className="rounded-sm border border-gold-400/30 bg-parchment-50/60 p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs uppercase tracking-[0.2em] text-gold-600">The Convener</span>
              {result.qafiyah_quick.detected && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-sage-500/10 text-sage-600 border border-sage-500/20">
                  Qāfiyah detected: <span className="font-arabic text-sm">{result.qafiyah_quick.detected}</span>
                  {result.qafiyah_quick.consistent ? " · consistent" : " · variable"}
                </span>
              )}
            </div>
            <p className="text-sm text-ink-100 italic">{result.convener_reasoning}</p>
            <p className="text-xs text-ink-100/60 mt-2">
              Selected to speak: <strong>{result.selected.map((id) => CRITIC_META[id]?.name_en).join(" → ")}</strong>
            </p>
          </div>

          {/* Critic verdicts */}
          {result.verdicts.map((v, idx) => {
            const meta = CRITIC_META[v.agent_id];
            if (!meta) return null;
            const isLoading = !v.verdict_md && !v.error;
            return (
              <div
                key={v.agent_id}
                className="manuscript-card rounded-sm p-6"
                style={{ borderLeftColor: meta.color, borderLeftWidth: 3 }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="shrink-0 w-14 h-14 rounded-full flex items-center justify-center"
                    style={{ background: meta.color + "15" }}
                  >
                    <Image src={meta.icon} alt="" width={32} height={32} className="opacity-85" />
                  </div>
                  <div className="flex-1">
                    <p className="font-arabic text-xl text-ink-300" dir="rtl">{meta.name_ar}</p>
                    <p className="font-display text-base text-ink-200">
                      {meta.name_en}{" "}
                      <span className="text-xs uppercase tracking-wider text-ink-100/60 ml-1">
                        speaking in the tradition of
                      </span>
                    </p>
                    <p className="text-xs text-ink-100/60 italic">{meta.epithet}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-crimson-500/10 text-crimson-600 border border-crimson-500/20">
                    Critic, not author
                  </span>
                </div>

                {isLoading && (
                  <p className="text-sm text-ink-100/60 italic animate-pulse">
                    Reading the verse and gathering judgment…
                  </p>
                )}
                {v.error && (
                  <p className="text-sm text-crimson-600">{v.error}</p>
                )}
                {v.verdict_md && <MarkdownLite text={v.verdict_md} />}
              </div>
            );
          })}

          {/* Attribution footer */}
          {stage === "complete" && (
            <div className="text-center pt-4">
              <div className="ornament">
                <span className="ornament-glyph">۞</span>
              </div>
              <p className="text-xs text-ink-100/70 max-w-2xl mx-auto italic">
                These verdicts were rendered by AI Critic agents, speaking in the documented tradition
                of each named master. The poets are not consulted; the schools are. Your verse remains
                authored by you. <strong>Inspired by the council — AI Assisted.</strong>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
