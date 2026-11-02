/**
 * Sentence-case rule for prose content: the first letter must be uppercase.
 * Leading digits and punctuation are skipped ("8 Olympic…", "¿Qué…?"), and a
 * leading word with its own casing (e.g. "iOS") is accepted.
 *
 * Pure and import-free so it runs under `node --test` (see sentence-case.test.ts).
 */

/** Names whose own casing starts lowercase; accepted as the first word. */
export const OWN_CASING_WORDS: readonly string[] = [
  "iOS",
  "iPadOS",
  "macOS",
  "gRPC",
  "npm",
  "eBay",
  "jQuery",
];

export function startsWithCapital(text: string): boolean {
  const start = text.search(/\p{L}/u);
  if (start === -1) return true; // no letters at all: nothing to capitalize
  const word = /^[\p{L}\p{N}]+/u.exec(text.slice(start))?.[0] ?? "";
  if (OWN_CASING_WORDS.includes(word)) return true;
  const letter = text[start] ?? "";
  return letter === letter.toUpperCase();
}

export const SENTENCE_CASE_MESSAGE =
  "must start with an uppercase letter (sentence case; fix the text, not the CSS)";
