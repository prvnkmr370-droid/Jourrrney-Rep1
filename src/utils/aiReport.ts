/**
 * Reporting AI-written text. Google Play requires apps that generate content with AI to let people flag
 * harmful or offensive output from inside the app. The Report button (under Tia's AI replies and next to an
 * AI-written plan) opens ReportAiSheet, which calls sendAiReport(). The server stores the report and emails a copy
 * to the owner (journey-backend/src/routes/reports.js). Only signed-in people see AI text, so only they can report.
 */
import { API_BASE_URL } from "@/config/api";
import { useProfileStore } from "@/store/useProfileStore";
import type { TripPlan } from "@/screens/PlanTrip/data";

export type ReportKind = "chat_reply" | "trip_plan";
export type ReportReason = "wrong" | "unsafe" | "offensive" | "other";

export const REPORT_REASONS: { id: ReportReason; label: string }[] = [
  { id: "wrong", label: "It's wrong or misleading" },
  { id: "unsafe", label: "It's unsafe or could cause harm" },
  { id: "offensive", label: "It's offensive or inappropriate" },
  { id: "other", label: "Something else" },
];

export const MAX_REPORT_NOTE = 500;

/** What is being reported, and what sheet to show for it. */
export interface ReportTarget {
  kind: ReportKind;
  /** The sheet's heading, e.g. "Report this reply". */
  title: string;
  /** The AI-written text itself. */
  content: string;
  /** What the person had asked just before, when it is known. */
  context?: string;
}

export async function sendAiReport(input: { kind: ReportKind; reason: ReportReason; comment?: string; content: string; context?: string }): Promise<{ ok: boolean; error?: string }> {
  const token = useProfileStore.getState().token;
  if (!token) return { ok: false, error: "Please sign in to send a report." };
  try {
    const res = await fetch(`${API_BASE_URL}/reports`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...input, content: input.content.slice(0, 4000) }),
    });
    if (res.ok) return { ok: true };
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) return { ok: false, error: "Please sign in again to send a report." };
    return { ok: false, error: typeof data.error === "string" ? data.error : "We couldn't send your report. Please try again." };
  } catch {
    return { ok: false, error: "We couldn't reach Jourrrney. Check your internet connection and try again." };
  }
}

/** The AI-written parts of a plan, as plain text, for a report. */
export function describeAiPlan(plan: Pick<TripPlan, "destination" | "days" | "itinerary" | "tips">): string {
  const lines: string[] = [`Trip to ${plan.destination.name}, ${plan.days} days (AI-written plan)`];
  for (const d of plan.itinerary) {
    lines.push("", /^day\s*\d/i.test(d.title) ? d.title : `Day ${d.day}: ${d.title}`);
    if (d.morning) lines.push(`Morning: ${d.morning}`);
    if (d.afternoon) lines.push(`Afternoon: ${d.afternoon}`);
    if (d.evening) lines.push(`Evening: ${d.evening}`);
  }
  if (plan.tips.length > 0) lines.push("", "Tips:", ...plan.tips.map((t) => `- ${t}`));
  return lines.join("\n");
}
