import { create } from "zustand";
import { readJson, writeJson } from "./deviceStorage";

const STORAGE_KEY = "journey-saved-places";
const MAX_SAVED_PLACES = 200;

interface SavedPlacesState {
  /** Destination ids, newest first. */
  ids: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
}

/** Places the traveller tapped the heart on, kept on this device only (same
 * approach as saved trips; nothing is sent to the backend, so it also works
 * for guests). Listed in My Account > Trips. */
export const useSavedPlacesStore = create<SavedPlacesState>((set) => ({
  ids: [],
  toggle: (id) =>
    set((state) =>
      state.ids.includes(id) ? { ids: state.ids.filter((x) => x !== id) } : { ids: [id, ...state.ids].slice(0, MAX_SAVED_PLACES) },
    ),
  remove: (id) => set((state) => ({ ids: state.ids.filter((x) => x !== id) })),
}));

// Write-through, skipped until the saved copy has been read back so the first
// (empty) state can't overwrite it.
let loaded = false;
useSavedPlacesStore.subscribe((state) => {
  if (loaded) void writeJson(STORAGE_KEY, state.ids);
});

void readJson<string[]>(STORAGE_KEY).then((stored) => {
  if (Array.isArray(stored)) {
    const current = useSavedPlacesStore.getState().ids;
    const known = new Set(current);
    // Anything saved while the read was in flight stays first.
    useSavedPlacesStore.setState({ ids: [...current, ...stored.filter((id) => typeof id === "string" && !known.has(id))].slice(0, MAX_SAVED_PLACES) });
  }
  loaded = true;
  void writeJson(STORAGE_KEY, useSavedPlacesStore.getState().ids);
});
