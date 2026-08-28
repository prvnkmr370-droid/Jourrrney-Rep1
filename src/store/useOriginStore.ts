import { create } from "zustand";

interface OriginState {
  originCity: string;
  setOriginCity: (city: string) => void;
}

/** Ported from App.tsx's `originCity` useState — now shared via Zustand
 * instead of being prop-drilled into every screen that needs it.
 *
 * Starts empty, not a hardcoded city — every screen that reads this
 * already has a proper placeholder/fallback for an empty value (see
 * OriginPrompt, ArriveSection, FormStep), and a fake default here was
 * indistinguishable from a real detected location, which made "location
 * detection isn't actually working" look like "it detected Bengaluru." */
export const useOriginStore = create<OriginState>((set) => ({
  originCity: "",
  setOriginCity: (city) => set({ originCity: city }),
}));
