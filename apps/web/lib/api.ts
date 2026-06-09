// Single-source-of-truth client for the Majlis API.
// Why a thin wrapper: keeps fetch ergonomics + types in one place; if we
// later move the API behind auth or a different host, only this changes.

export type Critic = {
  agent_id: string;
  name_ar: string;
  name_en: string;
  epithet_en?: string;
  epithet_ar?: string;
  era: string;
  region: string;
  icon: string;
  color: string;
  specialties: string[];
  closing_formula_ar: string;
  closing_formula_en: string;
  bio_short_en: string;
  bio_short_ar: string;
};

export type Verse = {
  verse_id: string;
  poet_en: string;
  poet_ar: string;
  poem_title: string;
  text_ar: string;
  translation_en: string;
  genre_en: string;
  genre_ar: string;
  emotion_en: string;
  emotion_ar: string;
  imagery_tags: string;
  source: string;
  audio_filename: string;
  // Added by build_tsne_map.py — present after the map artefacts have been built
  tsne_x?: number;
  tsne_y?: number;
  clip_id?: string;
  poem_id?: string;
  start?: number;
  genre_id?: number;
  emotion_id?: number;
};

export type FullPoemClip = {
  start: number;
  text_ar: string;
  translation_en: string;
  poet_en: string;
  poet_ar: string;
  imagery_tags: string;
  audio_filename: string;
};

export type VerseDetail = {
  verse: Verse;
  full_poem: FullPoemClip[];
  same_poet: Verse[];
  same_genre: Verse[];
};

export type TsnePoint = {
  clip_id: string;
  poem_id: string;
  start: number;
  x: number;
  y: number;
  genre_id: number;
  emotion_id: number;
  poet_en: string;
  text_preview: string;
};

export type TsneMap = {
  genre_classes: string[];
  emotion_classes: string[];
  points: TsnePoint[];
};

export type AnchorCriticProfile = {
  agent_id: string;
  name_ar: string;
  name_en: string;
  epithet_en?: string;
  epithet_ar?: string;
  era: string;
  region: string;
  icon: string;
  color: string;
  specialties: string[];
  closing_formula_ar: string;
  closing_formula_en: string;
  bio_short_en: string;
  bio_short_ar: string;
};

export type DctVerse = {
  agent_id: string;
  verse_id: string;
  source_url: string;
  retrieved_at: string;
  title: string;
  poet_name_dct: string;
  text_ar: string;
  bayts: { sadr: string; ajuz: string }[];
  bayt_count: number;
  note?: string;
  meta: { meter?: string; rhyme?: string; era?: string; source?: string; genre?: string };
};

export type Phase2Context = {
  biographical_excerpt_en?: string;
  verses_known_count?: string;
  attribution_caution?: string;
  authoritative_diwan?: {
    title: string;
    editor: string;
    publisher: string;
    year: number;
    edition: string;
    note: string;
  };
  additional_print_sources?: string[];
  verified_authority_url?: string;
  verified_authority_name?: string;
  phase2_status?: string;
};

export type AnchorPoetResponse = {
  kind: "anchor_critic";
  agent_id: string;
  profile: AnchorCriticProfile;
  verses: Verse[];
  verse_count: number;
  dct_verses: DctVerse[];
  dct_verse_count: number;
  phase2_note: string | null;
  phase2_context: Phase2Context | null;
};

export type ContemporaryPoetResponse = {
  kind: "contemporary";
  slug: string;
  name_en: string;
  name_ar: string;
  verses: Verse[];
  verse_count: number;
  fingerprint: {
    genres: [string, number][];
    emotions: [string, number][];
    imagery: [string, number][];
  };
};

export type PoetResponse = AnchorPoetResponse | ContemporaryPoetResponse;

export type PoetsIndex = {
  anchor_critics: { slug: string; name_en: string; name_ar: string; epithet_en: string; kind: "anchor_critic" }[];
  contemporary: { slug: string; name_en: string; name_ar: string; verse_count: number; kind: "contemporary" }[];
};

export type DictionaryEntry = {
  entry_id: string;
  headword_ar: string;
  headword_translit: string;
  pos: string;
  definition_ar: string;
  definition_en: string;
  semantic_field: string[];
  region: string;
  rarity: string;
  etymology?: string;
  attested_in: { verse_id: string; poet_en: string; poet_ar: string }[];
  attestation_count: number;
  status: string;
};

export type Verdict = {
  agent_id: string;
  verdict_md: string;
  error?: string | null;
};

export type CritiqueResult = {
  selected: string[];
  lead: string;
  convener_reasoning: string;
  verdicts: Verdict[];
  qafiyah_quick: {
    detected: string | null;
    rawiyy_candidates?: string[];
    consistent: boolean;
    lines: number;
    note: string;
  };
};

const BASE = ""; // proxied via next.config rewrites

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!r.ok) throw new Error(`GET ${path} → ${r.status}`);
  return r.json();
}

async function post<T>(path: string, body: any): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`POST ${path} → ${r.status}`);
  return r.json();
}

export const api = {
  health: () => get<{ status: string; openai_key_set: boolean; library_size: number; dictionary_size: number; critics: string[] }>("/api/health"),
  poets: () => get<{ deceased_masters_critics: Critic[]; library_poets_note: string }>("/api/poets"),
  library: (limit = 40, offset = 0, poet?: string, genre?: string) => {
    const p = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (poet) p.set("poet", poet);
    if (genre) p.set("genre", genre);
    return get<{ total: number; items: Verse[] }>(`/api/library?${p}`);
  },
  searchLibrary: (q: string) => get<{ total: number; items: Verse[] }>(`/api/library/search?q=${encodeURIComponent(q)}`),
  verseDetail: (verse_id: string) => get<VerseDetail>(`/api/library/verse/${encodeURIComponent(verse_id)}`),
  tsne: () => get<TsneMap>("/api/tsne"),
  poet: (slug: string) => get<PoetResponse>(`/api/poets/${encodeURIComponent(slug)}`),
  poetsIndex: () => get<PoetsIndex>("/api/poets-index"),
  dictionary: () => get<{ total: number; items: DictionaryEntry[] }>("/api/dictionary"),
  searchDictionary: (q: string) => get<{ total: number; items: DictionaryEntry[] }>(`/api/dictionary/search?q=${encodeURIComponent(q)}`),
  critique: (verse_text: string, forced_critics?: string[]) =>
    post<CritiqueResult>("/api/agents/critique", forced_critics ? { verse_text, forced_critics } : { verse_text }),
  convene: (verse_text: string) => post<{ convener: { selected: string[]; lead: string; reasoning: string }; qafiyah_quick: any }>("/api/agents/convene", { verse_text }),
  submit: (payload: { kind: string; visibility: string; poet_handle?: string; text_ar: string; translation_en?: string; note?: string; run_critique?: boolean }) =>
    post<{ id: number; stored: boolean; visibility: string; critique?: CritiqueResult | null }>("/api/submissions", payload),
  listSubmissions: () => get<{ total: number; items: any[] }>("/api/submissions"),
  proposeTerm: (payload: { headword_ar: string; headword_translit?: string; definition_ar: string; definition_en?: string; semantic_field?: string[]; visibility: string; poet_handle?: string }) =>
    post<{ stored: boolean; visibility: string }>("/api/dictionary/propose", payload),
};
