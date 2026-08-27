import { create } from "zustand";

export type AuthProvider = "google" | "apple" | "facebook" | "email" | "phone" | null;

interface ProfileState {
  isSignedIn: boolean;
  authProvider: AuthProvider;
  name: string | null;
  /** UI-only for now — no real OAuth is wired up (that needs client IDs
   * from each provider's developer console, which we don't have yet).
   * Marks the user as signed in and stores which button they tapped, so
   * screens can render "Signed in with Google" etc. once real auth lands,
   * this is the seam to swap in actual provider responses. */
  signIn: (provider: Exclude<AuthProvider, null>, name?: string) => void;
  skip: () => void;
  signOut: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  isSignedIn: false,
  authProvider: null,
  name: null,
  signIn: (provider, name) => set({ isSignedIn: true, authProvider: provider, name: name ?? null }),
  skip: () => set({ isSignedIn: false, authProvider: null, name: null }),
  signOut: () => set({ isSignedIn: false, authProvider: null, name: null }),
}));
