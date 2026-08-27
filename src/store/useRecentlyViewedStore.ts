import { create } from "zustand";

const MAX_RECENT = 5;

interface RecentlyViewedState {
  destinationIds: string[];
  markViewed: (id: string) => void;
}

/** Bumps a destination to the front of a small MRU list. DestinationDetail
 * calls markViewed() on mount; Safety Search Home reads destinationIds for
 * its "Recently Viewed" rail. */
export const useRecentlyViewedStore = create<RecentlyViewedState>((set) => ({
  destinationIds: [],
  markViewed: (id) =>
    set((state) => ({
      destinationIds: [id, ...state.destinationIds.filter((existing) => existing !== id)].slice(0, MAX_RECENT),
    })),
}));
