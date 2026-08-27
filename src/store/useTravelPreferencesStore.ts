import { create } from "zustand";

export type TravelStyle = "slow" | "packed" | "mixed";
export type BudgetComfort = "backpacker" | "midRange" | "comfortPlus";

interface TravelPreferencesState {
  travelStyle: TravelStyle;
  budgetComfort: BudgetComfort;
  interests: string[];
  setTravelStyle: (s: TravelStyle) => void;
  setBudgetComfort: (b: BudgetComfort) => void;
  toggleInterest: (id: string) => void;
}

/** Shared between Profile Hub's "Interests" chips and the full Travel
 * Preferences screen — editing one is reflected in the other. Figma's
 * copy says this "feeds the AI Itinerary Engine"; PlanTrip's form doesn't
 * read from here yet — a reasonable follow-up once this store is real. */
export const useTravelPreferencesStore = create<TravelPreferencesState>((set) => ({
  travelStyle: "packed",
  budgetComfort: "midRange",
  interests: ["culture"],
  setTravelStyle: (travelStyle) => set({ travelStyle }),
  setBudgetComfort: (budgetComfort) => set({ budgetComfort }),
  toggleInterest: (id) =>
    set((state) => ({
      interests: state.interests.includes(id) ? state.interests.filter((i) => i !== id) : [...state.interests, id],
    })),
}));
