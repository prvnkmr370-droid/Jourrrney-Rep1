import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "@/config/api";

export type AuthProvider = "google" | "apple" | "facebook" | "email" | "phone" | null;

/** The persisted-on-backend profile fields — all null until the user
 * actually sets them (a brand-new real account starts empty, not with
 * placeholder demo content). */
export interface RealProfile {
  bio: string | null;
  work: string | null;
  education: string | null;
  languages: string | null;
  location: string | null;
}

const TOKEN_KEY = "journey_auth_token";
const EMPTY_PROFILE: RealProfile = { bio: null, work: null, education: null, languages: null, location: null };

interface ProfileState {
  isSignedIn: boolean;
  authProvider: AuthProvider;
  name: string | null;
  email: string | null;
  token: string | null;
  profile: RealProfile;
  /** True while the app is checking for a previously-saved session on
   * launch — lets screens avoid flashing "Guest" before the real answer
   * is known. */
  restoring: boolean;

  /** Checks SecureStore for a saved session token and, if found, verifies
   * it's still valid against the backend. Call once on app start. */
  restoreSession: () => Promise<void>;

  /** Real request to the backend: generates and stores a one-time code
   * server-side. See journey-backend/README.md — no email is actually
   * sent yet, so `devCode` (present outside production) is what the UI
   * uses to let you test the flow today. */
  requestCode: (email: string) => Promise<{ ok: boolean; devCode?: string; error?: string }>;

  /** Real request to the backend: verifies the code, creates the account
   * on first sign-in, and returns a real session token that's persisted
   * to SecureStore. */
  verifyCode: (email: string, code: string, name?: string) => Promise<{ ok: boolean; error?: string }>;

  /** Loads the signed-in user's real profile fields from the backend. */
  fetchProfile: () => Promise<void>;

  /** Saves a partial update to the backend and updates local state from
   * its response — call with just the fields that changed. */
  updateProfile: (partial: Partial<RealProfile>) => Promise<{ ok: boolean; error?: string }>;

  /** UI-only for Google/Apple/Facebook — no real OAuth is wired up (that
   * needs client credentials from each provider's developer console,
   * which only you can create). Marks the user as signed in locally so
   * screens can render "Signed in with Google" etc.; swap in real
   * provider calls at the same call sites once credentials exist. */
  signIn: (provider: Exclude<AuthProvider, null>, name?: string) => void;

  skip: () => void;
  signOut: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  isSignedIn: false,
  authProvider: null,
  name: null,
  email: null,
  token: null,
  profile: EMPTY_PROFILE,
  restoring: true,

  restoreSession: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!token) {
        set({ restoring: false });
        return;
      }
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        set({ restoring: false });
        return;
      }
      const { user } = await res.json();
      set({
        isSignedIn: true,
        authProvider: "email",
        name: user.name,
        email: user.email,
        token,
        restoring: false,
      });
      get().fetchProfile();
    } catch {
      // Backend unreachable (not running, wrong IP, phone off Wi-Fi) —
      // fail quietly into the guest state rather than blocking the app.
      set({ restoring: false });
    }
  },

  requestCode: async (email) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/request-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error ?? "Something went wrong. Try again." };
      return { ok: true, devCode: data.devCode };
    } catch {
      return { ok: false, error: "Can't reach the server — check journey-backend is running and EXPO_PUBLIC_API_URL is correct." };
    }
  },

  verifyCode: async (email, code, name) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, name }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error ?? "Something went wrong. Try again." };

      await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      set({
        isSignedIn: true,
        authProvider: "email",
        name: data.user.name,
        email: data.user.email,
        token: data.token,
      });
      get().fetchProfile();
      return { ok: true };
    } catch {
      return { ok: false, error: "Can't reach the server — check journey-backend is running and EXPO_PUBLIC_API_URL is correct." };
    }
  },

  fetchProfile: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const { profile } = await res.json();
      set({ profile: { bio: profile.bio, work: profile.work, education: profile.education, languages: profile.languages, location: profile.location } });
    } catch {
      // Leave whatever profile state we already have — a failed refresh
      // shouldn't blank out fields the user can already see.
    }
  },

  updateProfile: async (partial) => {
    const { token, profile } = get();
    if (!token) return { ok: false, error: "Not signed in." };
    try {
      const res = await fetch(`${API_BASE_URL}/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(partial),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error ?? "Couldn't save — try again." };
      set({ profile: { ...profile, ...data.profile } });
      return { ok: true };
    } catch {
      return { ok: false, error: "Can't reach the server — check your connection." };
    }
  },

  signIn: (provider, name) => set({ isSignedIn: true, authProvider: provider, name: name ?? null }),

  skip: () => set({ isSignedIn: false, authProvider: null, name: null, email: null, token: null, profile: EMPTY_PROFILE }),

  signOut: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    set({ isSignedIn: false, authProvider: null, name: null, email: null, token: null, profile: EMPTY_PROFILE });
  },
}));

// Exported so app/_layout.tsx can trigger the one-time session check on
// launch without every screen needing to know about restoreSession.
export function bootstrapProfileSession() {
  useProfileStore.getState().restoreSession();
}
