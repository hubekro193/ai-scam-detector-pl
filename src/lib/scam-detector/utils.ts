/** Shared text-processing helpers used by every detector. */

const DIACRITICS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");

/**
 * Direct map for Polish letters that do NOT canonically decompose under
 * Unicode NFD — "ł"/"Ł" in particular is its own letter, not "l" + a
 * combining stroke, so `.normalize("NFD")` leaves it untouched. Relying on
 * NFD alone silently breaks matching on very common words like "przesyłka",
 * "dopłata", "błąd", "złoty" — this was a real bug found via manual testing
 * (Module 10: evaluation). Handled explicitly here instead of trusting NFD.
 */
const NON_DECOMPOSING_PL_LETTERS: Record<string, string> = {
  ł: "l",
};

function replaceNonDecomposingLetters(text: string): string {
  let result = text;
  for (const [from, to] of Object.entries(NON_DECOMPOSING_PL_LETTERS)) {
    result = result.split(from).join(to);
  }
  return result;
}

/** Lowercase + strip Polish diacritics, so keyword matching is accent-insensitive. */
export function normalize(text: string): string {
  return replaceNonDecomposingLetters(
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(DIACRITICS_REGEX, "") // strip combining diacritics (a with ogonek -> a, c with acute -> c, etc.)
  )
    .replace(/\s+/g, " ")
    .trim();
}

export interface ExtractedUrl {
  raw: string;
  hostname: string;
}

const URL_REGEX = /\b((?:https?:\/\/)?(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s]*)?)/gi;

/**
 * "Refang" defanged URLs (hxxp://, example[.]com, example(.)com) back into
 * a parseable form. Security-conscious users routinely paste IOCs in this
 * defanged form to avoid triggering link previews or accidental clicks —
 * without this step, those messages silently skip link detection entirely.
 */
function refang(text: string): string {
  return text
    .replace(/hxxps/gi, "https")
    .replace(/hxxp/gi, "http")
    .replace(/\[\.\]|\(\.\)|\{\.\}/g, ".")
    .replace(/\[:\]/g, ":");
}

/** Extract URL-like tokens from raw text, tolerant of missing "http://" and defanged links. */
export function extractUrls(text: string): ExtractedUrl[] {
  const matches = refang(text).match(URL_REGEX) ?? [];
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
