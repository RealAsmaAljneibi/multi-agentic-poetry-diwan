// Why this exists: the API derives poet slugs from English names, and the
// frontend needs to produce link URLs for poet names without round-tripping.
// Keep this in sync with `_slugify` in apps/api/main.py.

const ANCHOR_SLUG_BY_NAME: Record<string, string> = {
  "Al-Mājidī bin Ẓāhir": "al_majidi_bin_zahir",
  "Ousha bint Khalifa": "ousha_bint_khalifa",
  "Ousha bint Khalifa Al Suwaidi": "ousha_bint_khalifa",
  "Sheikh Zayed": "sheikh_zayed",
  "Sheikh Zayed bin Sultan Al Nahyan": "sheikh_zayed",
};

export function poetSlug(name_en: string): string {
  const fixed = ANCHOR_SLUG_BY_NAME[name_en.trim()];
  if (fixed) return fixed;
  let s = "";
  for (const ch of name_en.toLowerCase()) {
    if (/[a-z0-9]/.test(ch)) s += ch;
    else if (ch === " " || ch === "-" || ch === "_") s += "-";
  }
  while (s.includes("--")) s = s.replace(/--/g, "-");
  return s.replace(/^-+|-+$/g, "");
}

export function poetUrl(name_en: string): string {
  return `/poet-profile/${poetSlug(name_en)}`;
}
