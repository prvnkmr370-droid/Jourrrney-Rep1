/**
 * Calls journey-backend's POST /plan-trip/ai (see that file for the
 * Gemini-backed implementation) to get a real AI-generated itinerary.
 * Deliberately never throws — every failure mode (no network, backend has
 * no GEMINI_API_KEY configured, Gemini's free-tier quota exhausted,
 * malformed response, timeout) resolves to `null`, so the caller can
 * always fall back to the local rule-based generateItinerary() and the
 * "Plan My Trip" button never just breaks because a third-party API had a
 * bad day.
 */
import { API_BASE_URL } from "@/config/api";
import type { Destination } from "@/data/destinations";
import type { StyleConfig, GeneratedDay } from "./data";

const REQUEST_TIMEOUT_MS = 20000;

export interface AiPlanResult {
  itinerary: Pick<GeneratedDay, "day" | "title" | "morning" | "afternoon" | "evening" | "estimatedCost">[];
  tips: string[];
}

export async function tryGenerateAiItinerary(
  dest: Destination,
  sc: StyleConfig,
  days: number,
  people: number,
  preferences: string[],
  origin: string,
  startDate: string | null,
  dailyBudget: number,
): Promise<AiPlanResult | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_BASE_URL}/plan-trip/ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        destination: {
          name: dest.name,
          state: dest.state,
          description: dest.description,
          bestSeason: dest.bestSeason,
          mustEat: dest.mustEat,
          packingTips: dest.packingTips,
          womenSafety: { score: dest.womenSafety.score, level: dest.womenSafety.level },
        },
        style: { label: sc.label, transport: sc.transport, stay: sc.stay, local: sc.local },
        days,
        people,
        preferences,
        origin,
        startDate,
        dailyBudget,
      }),
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data?.itinerary) || data.itinerary.length === 0) return null;

    // Basic shape validation — an LLM occasionally drops a field or
    // returns the wrong type despite the JSON-mode prompt; better to fall
    // back to the local planner than render a broken day card.
    const valid = data.itinerary.every(
      (d: unknown): d is AiPlanResult["itinerary"][number] =>
        !!d && typeof d === "object" &&
        typeof (d as Record<string, unknown>).day === "number" &&
        typeof (d as Record<string, unknown>).title === "string" &&
        typeof (d as Record<string, unknown>).morning === "string" &&
        typeof (d as Record<string, unknown>).afternoon === "string" &&
        typeof (d as Record<string, unknown>).evening === "string" &&
        typeof (d as Record<string, unknown>).estimatedCost === "number",
    );
    if (!valid) return null;

    return { itinerary: data.itinerary, tips: Array.isArray(data.tips) ? data.tips.filter((t: unknown) => typeof t === "string") : [] };
  } catch {
    clearTimeout(timeout);
    return null;
  }
}
