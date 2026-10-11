/**
 * Pulls and applies over-the-air updates promptly in test builds.
 *
 * expo-updates' default is to download an update in the background at launch
 * and only use it on the *next* launch, which means two restarts before a
 * change shows up. For internal test builds (any channel but "production") we
 * want a change to appear as soon as the app is opened or brought back to the
 * foreground, so this checks, downloads and reloads straight away.
 *
 * Does nothing in development (the dev server already serves live code),
 * when updates aren't enabled in the build, or on the production channel —
 * real users shouldn't have the app reload under them mid-task.
 * Every step is best-effort: an offline phone or a failed check just leaves
 * the current version running.
 */
import { useEffect } from "react";
import { AppState } from "react-native";
import * as Updates from "expo-updates";

export function useAutoUpdate() {
  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled || Updates.channel === "production") return;

    let busy = false;
    const checkAndApply = async () => {
      if (busy) return;
      busy = true;
      try {
        const result = await Updates.checkForUpdateAsync();
        if (result.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch {
        // offline, no update, or a transient failure — keep running as is
      } finally {
        busy = false;
      }
    };

    void checkAndApply();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void checkAndApply();
    });
    return () => subscription.remove();
  }, []);
}
