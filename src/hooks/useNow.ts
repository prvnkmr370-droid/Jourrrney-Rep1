import { useEffect, useState } from "react";

/**
 * The current time, refreshed on a timer, so anything computed from it (an
 * "Open now" that turns into "Closed now" at closing time) stays right while
 * a page is left open. Defaults to once a minute.
 */
export function useNow(everyMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), everyMs);
    return () => clearInterval(id);
  }, [everyMs]);
  return now;
}
