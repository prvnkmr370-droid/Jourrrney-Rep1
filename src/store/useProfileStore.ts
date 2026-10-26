import { create } from "zustand";
import { Linking } from "react-native";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "@/config/api";
import { useThemeStore, type ThemeMode } from "./useThemeStore";

export type AuthProvider = "google" | "apple" | "facebook" | "email" | "phone" | null;

/** The persisted-on-backend profile fields — all null until the user
 * actually sets them (a brand-new real account starts empty, not with
 * placeholder demo content). themeMode mirrors useThemeStore's own value
 * once a real account has one saved — see fetchProfile/updateProfile. */
export interface RealProfile {
  bio: string | null;
  languages: string | null;
  location: string | null;
  themeMode: ThemeMode | null;
}

const TOKEN_KEY = "journey_auth_token";
// Which button the saved session came from ("email" or "facebook"), so "Signed in with…" survives a restart.
const PROVIDER_KEY = "journey_auth_provider";
const EMPTY_PROFILE: RealProfile = { bio: null, languages: null, location: null, themeMode: null };

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

  /** Opens Facebook sign-in in the phone's browser. Only resolves once the browser
   * has been opened (or says plainly why not, e.g. Facebook isn't set up on the
   * server yet); the sign-in itself finishes in app/auth.tsx when Facebook sends
   * the person back to the app. */
  startFacebookLogin: () => Promise<{ ok: boolean; error?: string }>;

  /** Swaps the one-time code Facebook sign-in hands back for a real session, the
   * same one an email sign-in produces (a token saved to SecureStore). */
  completeFacebookLogin: (code: string) => Promise<{ ok: boolean; error?: string }>;

  /** Loads the signed-in user's real profile fields from the backend —
   * also applies a saved themeMode to useThemeStore, so a saved
   * preference follows the account across reinstalls/devices, not just
   * this one's local storage. */
  fetchProfile: () => Promise<void>;

  /** Saves a partial update to the backend and updates local state from
   * its response — call with just the fields that changed. For
   * themeMode specifically, prefer setThemeMode below, which also
   * updates useThemeStore so the UI reflects it immediately. */
  updateProfile: (partial: Partial<RealProfile>) => Promise<{ ok: boolean; error?: string }>;

  /** Updates the theme locally (immediate, works for guests too) and, for
   * a real signed-in account, also persists it to the backend so it's
   * restored on other devices/reinstalls via fetchProfile. */
  setThemeMode: (mode: ThemeMode) => void;

  /** UI-only for Google/Apple — no real OAuth is wired up for those (that
   * needs client credentials from each provider's developer console,
   * which only you can create). Marks the user as signed in locally so
   * screens can render "Signed in with Google" etc.; swap in real
   * provider calls at the same call sites once credentials exist.
   * Facebook is real: see startFacebookLogin / completeFacebookLogin. */
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
      const savedProvider = await SecureStore.getItemAsync(PROVIDER_KEY).catch(() => null);
      set({
        isSignedIn: true,
        authProvider: savedProvider === "facebook" ? "facebook" : "email",
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
      await SecureStore.setItemAsync(PROVIDER_KEY, "email").catch(() => {});
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

  startFacebookLogin: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/facebook/status`);
      const status = res.ok ? await res.json() : null;
      if (!status?.configured) {
        return { ok: false, error: "Facebook sign-in isn't available yet. Please sign in with your email for now." };
      }
      await Linking.openURL(`${API_BASE_URL}/auth/facebook/start`);
      return { ok: true };
    } catch {
      return { ok: false, error: "Can't reach the server — check your connection and try again." };
    }
  },

  completeFacebookLogin: async (code) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/facebook/exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error ?? "That sign-in has expired. Please try again." };

      await SecureStore.setItemAsync(TOKEN_KEY, data.token);
      await SecureStore.setItemAsync(PROVIDER_KEY, "facebook").catch(() => {});
      set({
        isSignedIn: true,
        authProvider: "facebook",
        name: data.user.name,
        email: data.user.email,
        token: data.token,
      });
      get().fetchProfile();
      return { ok: true };
    } catch {
      return { ok: false, error: "Can't reach the server — check your connection and try again." };
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
      set({ profile: { bio: profile.bio, languages: profile.languages, location: profile.location, themeMode: profile.themeMode } });
      // A saved server-side preference wins over whatever the device was
      // already showing (e.g. after a fresh install with no local theme
      // choice yet) — null means the account has never set one, so the
      // local default (system) is left alone.
      if (profile.themeMode) useThemeStore.getState().setMode(profile.themeMode);
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

  setThemeMode: (mode) => {
    useThemeStore.getState().setMode(mode);
    const { token } = get();
    // Only real accounts (a saved token: email or Facebook) have a backend
    // profile to save this to — Google/Apple are still local-only fake auth
    // (see signIn below), and a guest has no account at all. The theme still
    // applies immediately either way via the setMode call above; this just
    // adds cross-device persistence on top for real accounts.
    if (token) {
      get().updateProfile({ themeMode: mode });
    }
  },

  signIn: (provider, name) => set({ isSignedIn: true, authProvider: provider, name: name ?? null }),

  skip: () => set({ isSignedIn: false, authProvider: null, name: null, email: null, token: null, profile: EMPTY_PROFILE }),

  signOut: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    await SecureStore.deleteItemAsync(PROVIDER_KEY).catch(() => {});
    set({ isSignedIn: false, authProvider: null, name: null, email: null, token: null, profile: EMPTY_PROFILE });
  },
}));

// Exported so app/_layout.tsx can trigger the one-time session check on
// launch without every screen needing to know about restoreSession.
export function bootstrapProfileSession() {
  useProfileStore.getState().restoreSession();
}
