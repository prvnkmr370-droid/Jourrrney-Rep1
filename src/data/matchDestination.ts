/**
 * Shared "does this typed query mean one specific destination" logic —
 * used by both the Search tab (SearchResults.tsx) and the Home page's own
 * search bar, so typing a place name behaves the same everywhere in the
 * app: an unambiguous query (an exact name/state match, or a query with
 * only one live match) goes straight to that destination's page. An
 * ambiguous multi-match query is left for the user to pick from, rather
 * than guessed.
 */
import { DESTINATIONS, type Destination } from "./destinations";

// Autocomplete-style prefix matching (like a search engine's suggestion
// dropdown) — matches on the START of a word, not anywhere inside it.
// Typing "aham" should suggest "Ahmedabad" as you approach it letter by
// letter, but typing "ada" (a mid-word fragment) shouldn't match it — a
// plain substring `.includes()` would incorrectly do both.
function startsWithWord(text: string, q: string): boolean {
  return text.toLowerCase().split(/\s+/).some((word) => word.startsWith(q));
}

export function findLiveMatches(query: string, limit = 4): Destination[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  // Rank so a name match ("Agra" for "ag") outranks a state-only match
  // ("Tawang" in "Arunachal Pradesh" for "aru") — both are shown, but the
  // more directly-relevant one sorts first.
  return DESTINATIONS.filter((d) => startsWithWord(d.name, q) || startsWithWord(d.state, q))
    .sort((a, b) => Number(startsWithWord(b.name, q)) - Number(startsWithWord(a.name, q)))
    .slice(0, limit);
}

export function resolveUnambiguousMatch(query: string): Destination | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  const exact = DESTINATIONS.find((d) => d.name.toLowerCase() === q || d.state.toLowerCase() === q);
  if (exact) return exact;
  const matches = findLiveMatches(query);
  return matches.length === 1 ? matches[0] : null;
}
