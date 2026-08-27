import { create } from "zustand";

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  isPrimary: boolean;
}

interface SafetyGuardState {
  contacts: EmergencyContact[];
  shareLiveLocation: boolean;
  curfewAlerts: boolean;
  addContact: (name: string, phone: string) => void;
  setShareLiveLocation: (v: boolean) => void;
  setCurfewAlerts: (v: boolean) => void;
}

export const useSafetyGuardStore = create<SafetyGuardState>((set) => ({
  contacts: [{ id: "seed-1", name: "Mother", phone: "+91 98••• •••21", isPrimary: true }],
  shareLiveLocation: true,
  curfewAlerts: false,
  addContact: (name, phone) =>
    set((state) => ({
      contacts: [...state.contacts, { id: `${Date.now()}`, name, phone, isPrimary: state.contacts.length === 0 }],
    })),
  setShareLiveLocation: (shareLiveLocation) => set({ shareLiveLocation }),
  setCurfewAlerts: (curfewAlerts) => set({ curfewAlerts }),
}));
