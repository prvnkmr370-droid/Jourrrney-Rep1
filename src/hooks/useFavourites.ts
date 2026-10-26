/**
 * The favourites of whoever is signed in, and whether anyone may save at all.
 *
 * Only a registered account can save: that means a real session (a token from
 * the backend, which only an email-code sign-in produces), not a guest, and
 * not the Google / Apple buttons, which today only mark the phone
 * as signed in without creating an account.
 */
import { useEffect } from "react";
import { useProfileStore } from "@/store/useProfileStore";
import { useFavouritesStore } from "@/store/useFavouritesStore";

const NONE: string[] = [];

export type FavouriteResult = "added" | "removed" | "needs-signin";

export function useFavourites() {
  const isSignedIn = useProfileStore((s) => s.isSignedIn);
  const token = useProfileStore((s) => s.token);
  const email = useProfileStore((s) => s.email);
  const restoring = useProfileStore((s) => s.restoring);
  const authProvider = useProfileStore((s) => s.authProvider);

  const account = isSignedIn && token && email ? email.trim().toLowerCase() : null;
  const hydrated = useFavouritesStore((s) => s.hydrated);
  const hasLegacy = useFavouritesStore((s) => s.legacy.length > 0);
  const ids = useFavouritesStore((s) => (account ? s.byAccount[account] ?? NONE : NONE));

  // The first registered account on a phone that has hearts from before
  // accounts were required takes them over (once).
  useEffect(() => {
    if (account && hydrated && hasLegacy) useFavouritesStore.getState().adoptLegacy(account);
  }, [account, hydrated, hasLegacy]);

  return {
    /** The registered account's key, or null for a guest / local-only sign-in. */
    account,
    canSave: account !== null,
    /** Signed in on this phone, but only locally (no real account), so saving still needs an email sign-in. */
    localOnlySignIn: isSignedIn && !account,
    authProvider,
    /** Still checking for a saved session, or still reading saved favourites. */
    loading: restoring || !hydrated,
    ids,
    isFavourite: (id: string) => ids.includes(id),
    toggle: (id: string): FavouriteResult => (account ? useFavouritesStore.getState().toggle(account, id) : "needs-signin"),
    remove: (id: string) => {
      if (account) useFavouritesStore.getState().remove(account, id);
    },
    restore: (id: string, index: number) => {
      if (account) useFavouritesStore.getState().add(account, id, index);
    },
  };
}
