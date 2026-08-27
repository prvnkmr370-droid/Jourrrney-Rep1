import { create } from "zustand";

export interface RecentSearch {
  id: string;
  query: string;
  destinationId?: string;
  timestamp: number;
}

const MAX_RECENT = 10;

interface RecentSearchesState {
  searches: RecentSearch[];
  addSearch: (query: string, destinationId?: string) => void;
  clearAll: () => void;
}

/**
 * Real search history — populated by src/screens/Search/SearchResults.tsx
 * whenever a user picks a destination while a query is active (i.e. an
 * actual completed search, not just browsing the unfiltered list).
 * Shared by the Home Feed's "Recent Searches" rail and the "My Account"
 * Searches tab, so there's one real source instead of two disconnected
 * (and previously fake) lists.
 */
export const useRecentSearchesStore = create<RecentSearchesState>((set) => ({
  searches: [],
  addSearch: (query, destinationId) =>
    set((state) => {
      const trimmed = query.trim();
      if (!trimmed) return state;
      const withoutDupes = state.searches.filter((s) => s.query.toLowerCase() !== trimmed.toLowerCase());
      const entry: RecentSearch = { id: `${Date.now()}`, query: trimmed, destinationId, timestamp: Date.now() };
      return { searches: [entry, ...withoutDupes].slice(0, MAX_RECENT) };
    }),
  clearAll: () => set({ searches: [] }),
}));

export function timeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return "Last week";
}
