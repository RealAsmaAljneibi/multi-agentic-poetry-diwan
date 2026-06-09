"use client";

import { useState } from "react";
import Header from "@/components/Header";
import LiveDebate from "@/components/LiveDebate";
import { api } from "@/lib/api";

type Mode = "compose" | "archive" | "contribute";

export default function PoetGate() {
  const [mode, setMode] = useState<Mode>("compose");

  return (
    <>
      <Header subtitle="Poets & Scholars" />
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-crimson-500 mb-2">For the Craftsman</p>
          <h1 className="font-display text-4xl text-ink-300 mb-2">Poet &amp; Scholar Gate</h1>
          <p className="font-arabic text-xl text-ink-200" dir="rtl">بوّابة الشعراء والعلماء</p>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-1 mb-8 p-1 bg-parchment-100/50 border border-gold-400/20 rounded-sm w-fit">
          {[
            { v: "compose", label: "Compose for Critique", desc: "Submit verse to the council" },
            { v: "archive", label: "Archive", desc: "Store work in your vault" },
            { v: "contribute", label: "Contribute Term", desc: "Add to the dictionary" },
          ].map((t) => (
            <button
              key={t.v}
              onClick={() => setMode(t.v as Mode)}
              className={`px-4 py-2 text-sm rounded-sm transition-colors ${
                mode === t.v
                  ? "bg-ink-300 text-parchment-50"
                  : "text-ink-100 hover:bg-gold-400/10"
              }`}
              title={t.desc}
            >
              {t.label}
            </button>
          ))}
        </div>

        {mode === "compose" && <LiveDebate />}
        {mode === "archive" && <ArchiveForm />}
        {mode === "contribute" && <ContributeForm />}
      </main>
    </>
  );
}

function ArchiveForm() {
  const [text, setText] = useState("");
  const [translation, setTranslation] = useState("");
  const [note, setNote] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private" | "anonymous">("private");
  const [poetHandle, setPoetHandle] = useState("");
  const [done, setDone] = useState<{ id: number; visibility: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setBusy(true);
    try {
      const r = await api.submit({
        kind: "archive",
        visibility,
        poet_handle: visibility === "anonymous" ? undefined : poetHandle || undefined,
        text_ar: text,
        translation_en: translation || undefined,
        note: note || undefined,
      });
      setDone({ id: r.id, visibility: r.visibility });
      setText(""); setTranslation(""); setNote("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="manuscript-card rounded-sm p-6 max-w-3xl">
      <div className="mb-4">
        <h2 className="font-display text-2xl text-ink-300 mb-1">Archive a composition</h2>
        <p className="text-sm text-ink-100/75">
          Save a poem of your own — or one entrusted to you — into the Majlis. You decide who sees it.
        </p>
      </div>

      <label className="block text-xs uppercase tracking-wider text-ink-100/70 mb-1.5">
        The verse <span className="font-arabic" dir="rtl">(بالعربية)</span>
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        dir="rtl"
        className="w-full font-arabic text-xl bg-parchment-50 border border-gold-400/30 rounded-sm p-4 mb-4 focus:outline-none focus:border-gold-500"
      />

      <label className="block text-xs uppercase tracking-wider text-ink-100/70 mb-1.5">English translation (optional)</label>
      <textarea
        value={translation}
        onChange={(e) => setTranslation(e.target.value)}
        rows={3}
        className="w-full text-sm bg-parchment-50 border border-gold-400/30 rounded-sm p-3 mb-4"
      />

      <label className="block text-xs uppercase tracking-wider text-ink-100/70 mb-1.5">Note about provenance (optional)</label>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. Composed by my grandfather in 1972 / Recited at a wedding in Liwa"
        className="w-full text-sm bg-parchment-50 border border-gold-400/30 rounded-sm px-3 py-2 mb-5"
      />

      <div className="grid md:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink-100/70 mb-1.5">Visibility</label>
          <div className="flex gap-2">
            {["public", "anonymous", "private"].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVisibility(v as any)}
                className={`px-3 py-1.5 text-xs rounded-sm border ${
                  visibility === v ? "border-gold-500 bg-gold-400/10 text-ink-300" : "border-gold-400/25 text-ink-100/70"
                }`}
              >
                {v[0].toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {visibility !== "anonymous" && (
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink-100/70 mb-1.5">Your handle</label>
            <input
              value={poetHandle}
              onChange={(e) => setPoetHandle(e.target.value)}
              className="w-full text-sm bg-parchment-50 border border-gold-400/30 rounded-sm px-3 py-1.5"
            />
          </div>
        )}
      </div>

      <div className="rounded-sm bg-parchment-100/50 border border-gold-400/20 p-3 mb-5 text-xs text-ink-100/85">
        <strong>Privacy commitment:</strong> Private submissions remain in your vault only.
        The Majlis will not train on private work, will not surface it in search,
        and will not allow Critics to retain it after a session.
      </div>

      <button
        type="submit"
        disabled={busy || !text.trim()}
        className="px-6 py-2.5 bg-ink-300 text-parchment-50 rounded-sm hover:bg-ink-400 disabled:opacity-40 transition-colors text-sm"
      >
        {busy ? "Sealing in the archive…" : "Archive this composition"}
      </button>

      {done && (
        <p className="mt-4 text-sm text-sage-600 border-l-2 border-sage-500 pl-3">
          Archived. ID #{done.id}, visibility: {done.visibility}.
        </p>
      )}
    </form>
  );
}

function ContributeForm() {
  const [headwordAr, setHeadwordAr] = useState("");
  const [translit, setTranslit] = useState("");
  const [defAr, setDefAr] = useState("");
  const [defEn, setDefEn] = useState("");
  const [field, setField] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [poetHandle, setPoetHandle] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!headwordAr || !defAr) return;
    setBusy(true);
    try {
      await api.proposeTerm({
        headword_ar: headwordAr,
        headword_translit: translit || undefined,
        definition_ar: defAr,
        definition_en: defEn || undefined,
        semantic_field: field.split(",").map((s) => s.trim()).filter(Boolean),
        visibility,
        poet_handle: poetHandle || undefined,
      });
      setDone(true);
      setHeadwordAr(""); setTranslit(""); setDefAr(""); setDefEn(""); setField("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="manuscript-card rounded-sm p-6 max-w-3xl">
      <div className="mb-4">
        <h2 className="font-display text-2xl text-ink-300 mb-1">Contribute a term</h2>
        <p className="text-sm text-ink-100/75">
          Add a Khaleeji or Nabati word the dictionary should hold. Your contribution can be
          public (credited to you) or private (only in your dictionary).
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink-100/70 mb-1.5">Headword (Arabic) *</label>
          <input
            value={headwordAr}
            onChange={(e) => setHeadwordAr(e.target.value)}
            dir="rtl"
            className="w-full font-arabic text-lg bg-parchment-50 border border-gold-400/30 rounded-sm px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink-100/70 mb-1.5">Transliteration</label>
          <input
            value={translit}
            onChange={(e) => setTranslit(e.target.value)}
            placeholder="e.g. al-falaj"
            className="w-full text-sm bg-parchment-50 border border-gold-400/30 rounded-sm px-3 py-2"
          />
        </div>
      </div>

      <label className="block text-xs uppercase tracking-wider text-ink-100/70 mb-1.5">Definition (Arabic) *</label>
      <textarea
        value={defAr}
        onChange={(e) => setDefAr(e.target.value)}
        rows={2}
        dir="rtl"
        className="w-full text-base font-arabic bg-parchment-50 border border-gold-400/30 rounded-sm p-3 mb-4"
      />

      <label className="block text-xs uppercase tracking-wider text-ink-100/70 mb-1.5">Definition (English)</label>
      <textarea
        value={defEn}
        onChange={(e) => setDefEn(e.target.value)}
        rows={2}
        className="w-full text-sm bg-parchment-50 border border-gold-400/30 rounded-sm p-3 mb-4"
      />

      <div className="grid md:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink-100/70 mb-1.5">Semantic field (comma-sep)</label>
          <input
            value={field}
            onChange={(e) => setField(e.target.value)}
            placeholder="e.g. desert, honor, hospitality"
            className="w-full text-sm bg-parchment-50 border border-gold-400/30 rounded-sm px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-ink-100/70 mb-1.5">Visibility</label>
          <div className="flex gap-2">
            {["public", "private"].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVisibility(v as any)}
                className={`px-3 py-1.5 text-xs rounded-sm border ${
                  visibility === v ? "border-gold-500 bg-gold-400/10 text-ink-300" : "border-gold-400/25 text-ink-100/70"
                }`}
              >
                {v[0].toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <input
        value={poetHandle}
        onChange={(e) => setPoetHandle(e.target.value)}
        placeholder="Your handle (optional, for credit)"
        className="w-full text-sm bg-parchment-50 border border-gold-400/30 rounded-sm px-3 py-2 mb-5"
      />

      <button
        type="submit"
        disabled={busy || !headwordAr || !defAr}
        className="px-6 py-2.5 bg-ink-300 text-parchment-50 rounded-sm hover:bg-ink-400 disabled:opacity-40 transition-colors text-sm"
      >
        {busy ? "Submitting…" : "Propose this term"}
      </button>

      {done && (
        <p className="mt-4 text-sm text-sage-600 border-l-2 border-sage-500 pl-3">
          Thank you. Your contribution has been submitted. Public terms enter the review queue;
          private terms are stored in your dictionary only.
        </p>
      )}
    </form>
  );
}
