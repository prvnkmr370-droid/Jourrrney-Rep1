import { create } from "zustand";

interface SearchState {
  travelDate: string | null;
  setTravelDate: (date: string | null) => void;
}

/** Holds the optional travel date picked in the Search flow's "Travel
 * Dates" step, so the results screen can read it without threading it
 * through router params. */
export const useSearchStore = create<SearchState>((set) => ({
  travelDate: null,
  setTravelDate: (date) => set({ travelDate: date }),
}));
