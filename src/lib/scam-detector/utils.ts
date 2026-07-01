/** Shared text-processing helpers used by every detector. */

const DIACRITICS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");

/** Lowercase + strip Polish diacritics, so keyword matching is accent-insensitive. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "") // strip combining diacritics (a with ogonek -> a, c with acute -> c, etc.)
    .replace(/\s+/g, " ")
    .trim();
}

export interface ExtractedUrl {
  raw: string;
  hostname: string;
}

const URL_REGEX = /\b((?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s]*)?)/gi;

/** Extract URL-like tokens from raw text, tolerant of missing "http://". */
export function extractUrls(text: string): ExtractedUrl[] {
  const matches = text.match(URL_REGEX) ?? [];
  const results: ExtractedUrl[] = [];

  for (const raw of matches) {
    // Filter out obvious false positives: things like "np. 1.5" or "godz. 14.00"
    if (!/[a-z]/i.test(raw)) continue;

    const withScheme = /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;
    try {
      const url = new URL(withScheme);
      results.push({ raw, hostname: url.hostname.toLowerCase() });
    } catch {
      // not a valid URL, skip
    }
  }
  return results;
}

/** Count how many keywords/patterns from a list appear in the normalized text. */
export function findMatches(normalized: string, patterns: RegExp[]): RegExp[] {
  return patterns.filter((p) => p.test(normalized));
}
