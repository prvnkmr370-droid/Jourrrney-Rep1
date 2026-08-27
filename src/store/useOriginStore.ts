import { create } from "zustand";

interface OriginState {
  originCity: string;
  setOriginCity: (city: string) => void;
}

/** Ported from App.tsx's `originCity` useState — now shared via Zustand
 * instead of being prop-drilled into every screen that needs it. */
export const useOriginStore = create<OriginState>((set) => ({
  originCity: "Bengaluru",
  setOriginCity: (city) => set({ originCity: city }),
}));
