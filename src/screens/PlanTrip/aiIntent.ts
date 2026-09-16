/**
 * Fuzzy trip-intent understanding — calls journey-backend's
 * POST /plan-trip/parse-intent (Gemini-backed, with a same-request Groq
 * retry as a failsafe when Gemini's free tier has a bad moment — see
 * planTrip.js) as a fallback when the fast local matcher in
 * parseTripMessage.ts finds nothing. Inspired by Layla.ai's handling of
 * vague requests ("a warm place in February that's not too expensive")
 * rather than requiring an exact destination name — see the research
 * summary from that session for the rest of the comparison.
 *
 * Deliberately never throws — any failure (no network, neither provider
 * configured/available, timeout, malformed response) resolves to `null`,
 * same contract as aiPlan.ts, so a fuzzy-parsing outage just means the
 * chat falls back to its plain "tell me a place" nudge rather than
 * breaking.
 */
import { API_BASE_URL } from "@/config/api";
import { DESTINATIONS, type Destination } from "@/data/destinations";
import { fetchAiJson } from "./aiRequest";
import type { TravelStyle } from "./data";

// The backend now has a Gemini→Groq failsafe for text requests (see
// planTrip.js), so a text call can legitimately take as long as a Gemini
// attempt PLUS a full Groq attempt back-to-back (~22s worst case) —
// 15s used to cut that off before the fallback ever got a chance to run.
// A photo needs more round-trip time on top of that (larger upload +
// Gemini's own vision processing), and stays Gemini-only (no Groq
// fallback for images), so its budget is unchanged.
const REQUEST_TIMEOUT_MS = 28000;
const IMAGE_REQUEST_TIMEOUT_MS = 30000;

export interface AiIntentResult {
  destination: Destination | null;
  days: number | null;
  people: number | null;
  style: TravelStyle | null;
  interests: string[];
  reasoning: string;
}

export interface AiIntentImage {
  base64: string;
  mimeType: string;
}

// Sent once per call, not the full Destination objects — Gemini only
// needs enough to judge a vibe/theme match, and this keeps the prompt
// (and token cost) small regardless of how large the destination catalog
// grows. `hidden` destinations are included on purpose: a fuzzy vibe-match
// ("somewhere for a quiet turtle-nesting getaway") should be able to land
// on one of those the same as any curated destination could.
function destinationSummaries() {
  return DESTINATIONS.map((d) => ({ id: d.id, name: d.name, state: d.state, tagline: d.tagline, category: d.category }));
}

export async function tryParseTripIntent(message: string, image?: AiIntentImage, onWaking?: () => void): Promise<AiIntentResult | null> {
  const res = await fetchAiJson(
    `${API_BASE_URL}/plan-trip/parse-intent`,
    { message, image, destinations: destinationSummaries() },
    image ? IMAGE_REQUEST_TIMEOUT_MS : REQUEST_TIMEOUT_MS,
    onWaking,
  );
  if (!res || !res.ok) return null;

  try {
    const data = await res.json();
    const destination = typeof data?.destinationId === "string" ? (DESTINATIONS.find((d) => d.id === data.destinationId) ?? null) : null;

    return {
      destination,
      days: typeof data?.days === "number" ? data.days : null,
      people: typeof data?.people === "number" ? data.people : null,
      style: ["backpacker", "comfortable", "premium"].includes(data?.style) ? data.style : null,
      interests: Array.isArray(data?.interests) ? data.interests.filter((i: unknown) => typeof i === "string") : [],
      reasoning: typeof data?.reasoning === "string" ? data.reasoning : "",
    };
  } catch {
    return null;
  }
}
