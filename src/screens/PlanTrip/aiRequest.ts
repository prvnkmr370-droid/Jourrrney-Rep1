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
 * AI needs sign-in: a guest cannot use AI (see useAiAccessStore.ts), so for a
 * guest no call is made at all: the "sign in to use AI" sheet opens (once per
 * launch) and the caller gets `null`, which makes it fall back to what works
 * without AI. Signed-in calls carry the sign-in token and nothing else about the
 * phone. (Only if the server is set to give guests a few free prompts does a
 * guest call go out, carrying this phone's random id and a prompt id, one per
 * thing the person did: a trip with three stops makes three calls, one prompt.)
 *
 * Never throws — same contract as the callers: a `null` return means "no
 * usable response," and it's up to them to fall back.
 */
import { useProfileStore } from "@/store/useProfileStore";
import { useAiAccessStore } from "@/store/useAiAccessStore";
import { getDeviceId, newId } from "@/utils/deviceId";

const WAKE_RETRY_DELAY_MS = 4000;

function isWakingResponse(status: number): boolean {
  return status === 502 || status === 503;
}

export async function fetchAiJson(url: string, body: unknown, timeoutMs: number, onWaking?: () => void, promptId: string = newId()): Promise<Response | null> {
  const access = useAiAccessStore.getState();
  const signedIn = !!useProfileStore.getState().token;
  if (!signedIn && access.isBlocked()) {
    access.noteRefused();
    return null;
  }
  const deviceId = signedIn ? "" : await getDeviceId(); // only guests on free prompts reach this line, and only they need an id

  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: "POST",
        // Signed-in users send their session token so the backend can
        // personalise answers from their own earlier AI requests (see
        // journey-backend/src/lib/aiMemory.js). Guests send none and get the
        // same app-wide rules with no memory.
        headers: {
          "Content-Type": "application/json",
          ...(signedIn
            ? { Authorization: `Bearer ${useProfileStore.getState().token}` }
            : { "X-Device-Id": deviceId, "X-AI-Prompt-Id": promptId }),
        },
        signal: controller.signal,
        body: JSON.stringify(body),
      });
      clearTimeout(timeout);

      if (attempt === 0 && isWakingResponse(res.status)) {
        onWaking?.();
        await new Promise((resolve) => setTimeout(resolve, WAKE_RETRY_DELAY_MS));
        continue;
      }
      // The server says this caller cannot use AI (sign in first, or the free prompts are used up): show the sign-in sheet and let the caller fall back.
      if (res.status === 403 || res.status === 429) {
        const said = await res.clone().json().catch(() => null);
        if (said?.code === "login_required" || said?.code === "guest_limit" || said?.code === "guest_ip_limit") {
          access.noteRefused(typeof said.limit === "number" ? said.limit : undefined);
          return null;
        }
      }
      if (res.ok && !signedIn) {
        const answer = await res.clone().json().catch(() => null);
        access.noteAnswer(answer?.guest, promptId);
      }
      return res;
    } catch {
      clearTimeout(timeout);
      return null;
    }
  }
  return null;
}
