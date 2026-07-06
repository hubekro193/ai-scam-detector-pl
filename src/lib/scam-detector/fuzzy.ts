/**
 * Fuzzy keyword/phrase matching (detection quality improvement).
 *
 * Context: over the course of this project, several real false negatives
 * came from the SAME root cause — a regex written as a literal stem
 * ("skan dowodu", "przelew bezposrednio") missed a message that used a
 * different word form or word order ("skanu dowodu", "bezposrednio
 * przelewem"). Each one got patched individually as it was found, which
 * means there are almost certainly more still lurking, undetected, in
 * word forms nobody has tested yet.
 *
 * This module provides a systematic fix for that whole bug class: instead
 * of matching an exact stem, check whether the message contains a word
 * within a small edit distance of the target — tolerant of Polish
 * inflection (different endings) AND of typos, without needing every
 * grammatical form spelled out by hand.
 *
 * Deliberately NOT applied to every pattern in the engine — only to the
 * specific terms that have already caused real bugs (see dataRequest.ts,
 * payment.ts, context.ts). Applying it everywhere without care would risk
 * new false positives: fuzzy matching on short, common words (e.g. "nie",
 * "kod") would collide with unrelated text. See allowedDistance() below for
 * how that risk is bounded.
 */

/** Classic Levenshtein edit distance (insertions, deletions, substitutions). */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let previousRow = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 0; i < a.length; i++) {
    const currentRow = [i + 1];
    for (let j = 0; j < b.length; j++) {
      const insertCost = currentRow[j]! + 1;
      const deleteCost = previousRow[j + 1]! + 1;
      const substituteCost = previousRow[j]! + (a[i] === b[j] ? 0 : 1);
      currentRow.push(Math.min(insertCost, deleteCost, substituteCost));
    }
    previousRow = currentRow;
  }

  return previousRow[b.length]!;
}

/**
 * How many edits we tolerate, scaled by word length. Short words get zero
 * tolerance on purpose — "kod" is 3 letters away from a dozen unrelated
 * words, so fuzzy-matching it would produce false positives, not catch typos.
 */
function allowedDistance(targetLength: number): number {
  if (targetLength <= 3) return 0;
  if (targetLength <= 7) return 1;
  return 2;
}

function tokenize(normalized: string): string[] {
  return normalized.split(/[^a-z0-9]+/).filter(Boolean);
}

/** Does the (already-normalized) text contain a word within edit distance of `target`? */
export function containsFuzzyWord(normalized: string, target: string): boolean {
  const maxDistance = allowedDistance(target.length);
  const tokens = tokenize(normalized);

  return tokens.some((token) => {
    // Cheap length-based pre-filter before paying for the full DP table.
    if (Math.abs(token.length - target.length) > maxDistance) return false;
    return levenshteinDistance(token, target) <= maxDistance;
  });
}

/**
 * Does the text contain each word in `words`, in order, fuzzy-matched,
 * allowing up to `maxGap` unrelated tokens between consecutive matches?
 * (e.g. ["skan", "dowodu"] matches "przeslij nam skanu swojego dowodu" —
 * "skanu" fuzzy-matches "skan", then "dowodu" appears 1 token later.)
 */
export function containsFuzzyPhrase(normalized: string, words: string[], maxGap = 2): boolean {
  if (words.length === 0) return false;
  const tokens = tokenize(normalized);
  const distances = words.map((w) => allowedDistance(w.length));

  function fuzzyEquals(token: string, target: string, maxDistance: number): boolean {
    if (Math.abs(token.length - target.length) > maxDistance) return false;
    return levenshteinDistance(token, target) <= maxDistance;
  }

  let searchFrom = 0;
  for (let w = 0; w < words.length; w++) {
    const target = words[w]!;
    const maxDistance = distances[w]!;
    const windowEnd = w === 0 ? tokens.length : Math.min(tokens.length, searchFrom + maxGap + 1);

    let foundAt = -1;
    for (let i = searchFrom; i < windowEnd; i++) {
      if (fuzzyEquals(tokens[i]!, target, maxDistance)) {
        foundAt = i;
        break;
      }
    }

    if (foundAt === -1) return false;
    searchFrom = foundAt + 1;
  }

  return true;
}
