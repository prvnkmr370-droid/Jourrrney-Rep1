import { create } from "zustand";
import { readJson, writeJson } from "./deviceStorage";

const STORAGE_KEY = "journey-favourites-v1";
// Where the earlier, account-less "saved places" list kept its ids.
const LEGACY_KEY = "journey-saved-places";
const MAX_FAVOURITES = 200;

interface FavouritesState {
  /** Favourite destination ids per account (the account's lower-case email), newest first. */
  byAccount: Record<string, string[]>;
  /** Ids from the old account-less list, waiting to be adopted by the first registered account. */
  legacy: string[];
  /** True once the saved copy on the device has been read back. */
  hydrated: boolean;
  /** Adds the place if it is not a favourite, removes it if it is; returns what happened. */
  toggle: (account: string, id: string) => "added" | "removed";
  add: (account: string, id: string, index?: number) => void;
  remove: (account: string, id: string) => void;
  /** Moves the old account-less list into this account, once. */
  adoptLegacy: (account: string) => void;
}

/**
 * Favourites belong to a registered account: every list is stored under that
 * account's email, so a person who signs out (or a different person who signs
 * in on the same phone) never sees someone else's list, and signing back in
 * brings it back. The list lives on this device; the backend is not involved
 * (its free-plan database is wiped whenever it restarts, so it could not keep
 * a list reliably yet). The screens only call these actions for a signed-in
 * account (see hooks/useFavourites.ts).
 */
export const useFavouritesStore = create<FavouritesState>((set, get) => ({
  byAccount: {},
  legacy: [],
  hydrated: false,

  toggle: (account, id) => {
    const list = get().byAccount[account] ?? [];
    if (list.includes(id)) {
      set((s) => ({ byAccount: { ...s.byAccount, [account]: list.filter((x) => x !== id) } }));
      return "removed";
    }
    set((s) => ({ byAccount: { ...s.byAccount, [account]: [id, ...list].slice(0, MAX_FAVOURITES) } }));
    return "added";
  },

  add: (account, id, index = 0) =>
    set((s) => {
      const list = (s.byAccount[account] ?? []).filter((x) => x !== id);
      list.splice(Math.min(index, list.length), 0, id);
      return { byAccount: { ...s.byAccount, [account]: list.slice(0, MAX_FAVOURITES) } };
    }),

  remove: (account, id) =>
    set((s) => ({ byAccount: { ...s.byAccount, [account]: (s.byAccount[account] ?? []).filter((x) => x !== id) } })),

  adoptLegacy: (account) => {
    const { legacy } = get();
    if (legacy.length === 0) return;
    set((s) => {
      const mine = s.byAccount[account] ?? [];
      const known = new Set(mine);
      return { legacy: [], byAccount: { ...s.byAccount, [account]: [...mine, ...legacy.filter((id) => !known.has(id))].slice(0, MAX_FAVOURITES) } };
    });
    void writeJson(LEGACY_KEY, []);
  },
}));

// Write-through, skipped until the saved copy has been read back so the first
// (empty) state can't overwrite it.
useFavouritesStore.subscribe((state) => {
  if (state.hydrated) void writeJson(STORAGE_KEY, state.byAccount);
});

void (async () => {
  const [stored, legacy] = await Promise.all([readJson<Record<string, string[]>>(STORAGE_KEY), readJson<string[]>(LEGACY_KEY)]);
  const current = useFavouritesStore.getState().byAccount;
  const merged: Record<string, string[]> = { ...current };
  if (stored && typeof stored === "object") {
    for (const [account, ids] of Object.entries(stored)) {
      if (!Array.isArray(ids)) continue;
      const clean = ids.filter((id): id is string => typeof id === "string");
      const known = new Set(merged[account] ?? []);
      merged[account] = [...(merged[account] ?? []), ...clean.filter((id) => !known.has(id))].slice(0, MAX_FAVOURITES);
    }
  }
  useFavouritesStore.setState({
    byAccount: merged,
    legacy: Array.isArray(legacy) ? legacy.filter((id): id is string => typeof id === "string") : [],
    hydrated: true,
  });
})();
