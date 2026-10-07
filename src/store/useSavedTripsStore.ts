import { create } from "zustand";
import type { TripPlan } from "@/screens/PlanTrip/data";
import { serializePlan, type SerializedPlan } from "@/screens/PlanTrip/savedTrips";
import { readJson, writeJson } from "./deviceStorage";

const STORAGE_KEY = "journey-saved-trips";
const MAX_SAVED_TRIPS = 30;

export interface SavedTrip {
  id: string;
  savedAt: number;
  plan: SerializedPlan;
}

interface SavedTripsState {
  trips: SavedTrip[];
  /** Saves a copy of the plan and returns its id (the newest trip goes first). */
  save: (plan: TripPlan) => string;
  remove: (id: string) => void;
}

/** Trips the traveller chose to keep, stored on this device only — nothing is
 * sent to the backend. Loaded from disk once when the app first uses it; a
 * trip saved before that finishes is kept and merged in. */
export const useSavedTripsStore = create<SavedTripsState>((set) => ({
  trips: [],
  save: (plan) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const trip: SavedTrip = { id, savedAt: Date.now(), plan: serializePlan(plan) };
    set((state) => ({ trips: [trip, ...state.trips].slice(0, MAX_SAVED_TRIPS) }));
    return id;
  },
  remove: (id) => set((state) => ({ trips: state.trips.filter((t) => t.id !== id) })),
}));

// Write-through: every change is copied to the device. Skipped until the saved
// copy has been read back, so the first (empty) state can't overwrite it.
let loaded = false;
useSavedTripsStore.subscribe((state) => {
  if (loaded) void writeJson(STORAGE_KEY, state.trips);
});

void readJson<SavedTrip[]>(STORAGE_KEY).then((stored) => {
  if (Array.isArray(stored)) {
    const known = new Set(useSavedTripsStore.getState().trips.map((t) => t.id));
    const merged = [...useSavedTripsStore.getState().trips, ...stored.filter((t) => t && typeof t.id === "string" && !known.has(t.id))];
    useSavedTripsStore.setState({ trips: merged.sort((a, b) => b.savedAt - a.savedAt).slice(0, MAX_SAVED_TRIPS) });
  }
  loaded = true;
  // Persist whatever was saved while the read was still in flight.
  void writeJson(STORAGE_KEY, useSavedTripsStore.getState().trips);
});
