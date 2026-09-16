/**
 * Shared POST-JSON wrapper for the AI endpoint callers (aiIntent.ts,
 * aiPlan.ts). Render's free tier spins journey-backend down after a period
 * of inactivity, so the first request after a quiet stretch can hit the
 * platform's own gateway — not our app — returning an empty 502/503 while
 * the instance wakes up (typically resolves in well under
 * WAKE_RETRY_DELAY_MS + one normal request). That's not a real failure the
 * way a malformed response or a dead API key is, so it's worth one retry
 * rather than dropping straight to the local fallback. `onWaking` lets the
 * caller swap a generic spinner for an honest "waking up" message during
 * that one retry.
 *
 * Never throws — same contract as the callers: a `null` return means "no
 * usable response," and it's up to them to fall back.
 */
const WAKE_RETRY_DELAY_MS = 4000;

function isWakingResponse(status: number): boolean {
  return status === 502 || status === 503;
}

export async function fetchAiJson(url: string, body: unknown, timeoutMs: number, onWaking?: () => void): Promise<Response | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify(body),
      });
      clearTimeout(timeout);

      if (attempt === 0 && isWakingResponse(res.status)) {
        onWaking?.();
        await new Promise((resolve) => setTimeout(resolve, WAKE_RETRY_DELAY_MS));
        continue;
      }
      return res;
    } catch {
      clearTimeout(timeout);
      return null;
    }
  }
  return null;
}
