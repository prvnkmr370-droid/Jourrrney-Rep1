/**
 * Who can use AI right now. Signing in is never required, but AI is what an account unlocks: a guest gets a few
 * free AI prompts (5 unless the server says otherwise) and then needs to sign in to keep using AI. Everything
 * that is not AI stays open to everyone. The server enforces the limit (journey-backend/src/middleware/
 * aiGuestLimit.js); this store keeps the count on the phone too, so the app can say how many are left, stop
 * asking the server once they are gone, and show the "sign in to keep using AI" sheet once.
 */
import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "@/config/api";
import { useProfileStore } from "@/store/useProfileStore";
import { getDeviceId } from "@/utils/deviceId";

const USED_KEY = "journey.aiGuestUsed";
export const DEFAULT_GUEST_LIMIT = 5;

interface GuestInfo {
  used?: number;
  limit?: number;
}

interface AiAccessState {
  /** Free prompts this phone has used as a guest. */
  used: number;
  limit: number;
  /** The "sign in to keep using AI" sheet is showing. */
  sheetOpen: boolean;
  hydrated: boolean;

  /** Reads the saved count and asks the server how many are left. Safe to call more than once. */
  hydrate: () => Promise<void>;
  /** A guest with no free prompts left. A signed-in person is never blocked. */
  isBlocked: () => boolean;
  remaining: () => number;
  /** A guest's AI call was answered. `guest` is what the server said; `promptId` keeps one prompt from counting twice. */
  noteAnswer: (guest: GuestInfo | undefined, promptId: string) => void;
  /** The server (or this phone) said the free prompts are used up. Opens the sheet once per app launch. */
  noteRefused: (limit?: number) => void;
  closeSheet: () => void;
}

const counted = new Set<string>(); // prompts already counted here, for a server that does not report its own count
let sheetShown = false;

const signedIn = () => !!useProfileStore.getState().token;
const save = (used: number) => SecureStore.setItemAsync(USED_KEY, String(used)).catch(() => {});

export const useAiAccessStore = create<AiAccessState>((set, get) => ({
  used: 0,
  limit: DEFAULT_GUEST_LIMIT,
  sheetOpen: false,
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    set({ hydrated: true });
    try {
      const saved = Number.parseInt((await SecureStore.getItemAsync(USED_KEY)) ?? "", 10);
      if (Number.isFinite(saved) && saved > get().used) set({ used: saved });
    } catch {
      // no secure storage: the count starts from what the server says
    }
    if (signedIn()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/plan-trip/ai-access`, { headers: { "X-Device-Id": await getDeviceId() } });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.signedIn === false && typeof data.used === "number") {
        const used = Math.max(get().used, data.used);
        set({ used, limit: typeof data.limit === "number" ? data.limit : get().limit });
        save(used);
      }
    } catch {
      // offline or the server is waking up: the saved count is good enough
    }
  },

  isBlocked: () => !signedIn() && get().used >= get().limit,
  remaining: () => Math.max(0, get().limit - get().used),

  noteAnswer: (guest, promptId) => {
    if (signedIn()) return;
    let used = get().used;
    if (typeof guest?.used === "number") used = Math.max(used, guest.used);
    else if (!counted.has(promptId)) { counted.add(promptId); used += 1; }
    set({ used, limit: typeof guest?.limit === "number" ? guest.limit : get().limit });
    save(used);
  },

  noteRefused: (limit) => {
    const nextLimit = typeof limit === "number" ? limit : get().limit;
    const used = Math.max(get().used, nextLimit);
    set({ used, limit: nextLimit });
    save(used);
    if (!sheetShown) { sheetShown = true; set({ sheetOpen: true }); }
  },

  closeSheet: () => set({ sheetOpen: false }),
}));
