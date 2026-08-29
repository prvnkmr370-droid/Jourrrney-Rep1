/**
 * Fuzzy trip-intent understanding — calls journey-backend's
 * POST /plan-trip/parse-intent (Gemini-backed) as a fallback when the
 * fast local matcher in parseTripMessage.ts finds nothing. Inspired by
 * Layla.ai's handling of vague requests ("a warm place in February that's
 * not too expensive") rather than requiring an exact destination name —
 * see the research summary from that session for the rest of the
 * comparison.
 *
 * Deliberately never throws — any failure (no network, backend has no
 * GEMINI_API_KEY, timeout, malformed response) resolves to `null`, same
 * contract as aiPlan.ts, so a fuzzy-parsing outage just means the chat
 * falls back to its plain "tell me a place" nudge rather than breaking.
 */
import { API_BASE_URL } from "@/config/api";
import { DESTINATIONS, type Destination } from "@/data/destinations";
import type { TravelStyle } from "./data";

// A photo needs more round-trip time than a text message (larger upload +
// Gemini's own vision processing) — text fuzzy-parsing keeps 15s.
const REQUEST_TIMEOUT_MS = 15000;
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

export async function tryParseTripIntent(message: string, image?: AiIntentImage): Promise<AiIntentResult | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), image ? IMAGE_REQUEST_TIMEOUT_MS : REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE_URL}/plan-trip/parse-intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ message, image, destinations: destinationSummaries() }),
    });
    clearTimeout(timeout);
    if (!res.ok) return null;

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
    clearTimeout(timeout);
    return null;
  }
}
