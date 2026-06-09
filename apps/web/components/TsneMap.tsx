"use client";

import { useEffect, useMemo, useState } from "react";
import { api, TsneMap as TsneMapData } from "@/lib/api";

// Why pure SVG (not D3/Plotly): 3,340 circles render snappily in SVG without
// a charting library; we get full control over the heritage palette; bundle
// size stays small. The trade-off is no tooltips out of the box — we hand-roll.

const GENRE_COLORS = [
  "#E63946", // Ghazal
  "#457B9D", // Shajan
  "#2DC653", // Fakhr
  "#F4A261", // Hikma
  "#A8DADC", // Badawa
  "#6A0572", // Wataniyya
  "#FFB703", // Ritha
  "#023E8A", // Hija
];

const EMOTION_COLORS = [
  "#E63946", // Longing
  "#FF758C", // Delicate Love
  "#457B9D", // Sorrow
  "#2DC653", // Pride
  "#F4A261", // Admiration
  "#A8DADC", // Contemplation
  "#6A0572", // Disappointment
  "#023E8A", // Defiance
  "#FFB703", // Hope
  "#8ECAE6", // Compassion
  "#FFBA08", // Humor
  "#ADB5BD", // Neutral
];

function shortLabel(s: string): string {
  for (const sep of ["(", ",", "/", "،"]) {
    if (s.includes(sep)) return s.split(sep)[0].trim();
  }
  return s;
}

type Props = {
  /** Highlight this point with a gold ring (the verse currently being viewed). */
  highlightPoemId?: string;
  highlightStart?: number;
  /** Default panel to show. Both panels are always available via the toggle. */
  defaultMode?: "genre" | "emotion";
};

export default function TsneMap({ highlightPoemId, highlightStart, defaultMode = "genre" }: Props) {
  const [data, setData] = useState<TsneMapData | null>(null);
  const [mode, setMode] = useState<"genre" | "emotion">(defaultMode);
  const [hovered, setHovered] = useState<{ x: number; y: number; text: string } | null>(null);

  useEffect(() => {
    api.tsne().then(setData).catch(() => setData(null));
  }, []);

  const pal = mode === "genre" ? GENRE_COLORS : EMOTION_COLORS;
  const classes = data ? (mode === "genre" ? data.genre_classes : data.emotion_classes) : [];

  // The class-id for our highlighted verse (so we can dim everything else if useful)
  const highlight = useMemo(() => {
    if (!data || !highlightPoemId) return null;
    return data.points.find(
      (p) => p.poem_id === highlightPoemId && (highlightStart === undefined || p.start === highlightStart)
    );
  }, [data, highlightPoemId, highlightStart]);

  if (!data) {
    return (
      <div className="manuscript-card rounded-sm p-8 text-center">
        <p className="text-sm text-ink-100/60 italic">
          Loading the t-SNE projection of {3340} clips…
        </p>
        <p className="text-xs text-ink-100/50 mt-2">
          (If this stays blank, run <code className="text-gold-600">python3 scripts/build_tsne_map.py</code>)
        </p>
      </div>
    );
  }

  return (
    <div className="manuscript-card rounded-sm p-5">
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-gold-600">
            t-SNE projection · AraPoemBERT CLS embeddings
          </p>
          <p className="text-xs text-ink-100/60 mt-0.5">
            {data.points.length.toLocaleString()} clips from the multimodal corpus
            {highlight && <span className="text-gold-600"> · this verse highlighted in gold</span>}
          </p>
        </div>
        <div className="flex gap-1 p-0.5 bg-parchment-100 border border-gold-400/25 rounded-sm">
          {(["genre", "emotion"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-3 py-1 text-xs rounded-sm transition-colors ${
                mode === m ? "bg-ink-300 text-parchment-50" : "text-ink-100 hover:bg-gold-400/10"
              }`}
            >
              {m === "genre" ? "By Genre" : "By Emotion"}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox="-5 -5 110 110"
          preserveAspectRatio="xMidYMid meet"
          className="w-full h-auto bg-parchment-50/50 border border-gold-400/15 rounded-sm"
          style={{ minHeight: 360 }}
        >
          {/* All points. Render in two passes so the highlighted one paints last on top. */}
          {data.points.map((p) => {
            const cid = mode === "genre" ? p.genre_id : p.emotion_id;
            const color = cid >= 0 && cid < pal.length ? pal[cid] : "#CCCCCC";
            const isHigh =
              highlight && p.poem_id === highlight.poem_id && p.start === highlight.start;
            if (isHigh) return null; // drawn in second pass
            return (
              <circle
                key={p.clip_id}
                cx={p.x}
                cy={p.y}
                r={0.6}
                fill={color}
                opacity={highlight ? 0.42 : 0.6}
                onMouseEnter={() =>
                  setHovered({ x: p.x, y: p.y, text: `${p.poet_en} — ${p.text_preview}` })
                }
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}
          {/* Highlight ring */}
          {highlight && (
            <>
              <circle
                cx={highlight.x}
                cy={highlight.y}
                r={2.4}
                fill="none"
                stroke="#A8821F"
                strokeWidth={0.5}
                opacity={0.7}
              >
                <animate attributeName="r" values="2.4;3.4;2.4" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0.25;0.7" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle
                cx={highlight.x}
                cy={highlight.y}
                r={1.4}
                fill="#A8821F"
                stroke="#FDF9F0"
                strokeWidth={0.4}
              />
            </>
          )}
        </svg>

        {/* Tooltip */}
        {hovered && (
          <div
            className="absolute pointer-events-none bg-ink-300 text-parchment-50 text-xs px-2 py-1 rounded-sm max-w-xs"
            style={{
              left: `calc(${hovered.x}% + 8px)`,
              top: `calc(${hovered.y}% + 8px)`,
              transform: "translateY(-100%)",
            }}
          >
            {hovered.text}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
        {classes.map((cn, i) => (
          <span key={cn} className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-parchment-100 rounded-sm">
            <span className="inline-block w-2 h-2 rounded-full" style={{ background: pal[i] }} />
            <span className="text-ink-200">{shortLabel(cn)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
