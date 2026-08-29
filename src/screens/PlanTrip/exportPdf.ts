/**
 * "Download my itinerary" — renders the same TripPlan ResultStep.tsx
 * already displays into a printable HTML page, turns it into a PDF via
 * expo-print, then hands it to the OS share sheet via expo-sharing (save
 * to Files, email, WhatsApp, etc. — whatever the device offers).
 *
 * Both are loaded lazily (dynamic import, not a static top-level one),
 * same lesson learned from the photo-picker fix: a static import of a
 * native module that isn't available in the current client (a plain
 * Expo Go install in particular) throws the instant this file is
 * evaluated, which would crash the whole Plan Trip route again. Loading
 * only when the user actually taps "Download" means a missing module
 * degrades just this one feature. Also normalizes the CJS/ESM `.default`
 * interop quirk that broke expo-image-picker the same way.
 */
import type * as PrintType from "expo-print";
import type * as SharingType from "expo-sharing";
import type { TripPlan } from "./data";

function unwrap<T extends object>(mod: T & { default?: T }): T {
  return mod.default ?? mod;
}

function formatDate(iso: string | null): string {
  if (!iso) return "Flexible dates";
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildHtml(plan: TripPlan): string {
  const perPersonPerDay = Math.round(plan.totalCost / plan.days / plan.people);
  const days = plan.itinerary
    .map(
      (day) => `
      <div class="day">
        <div class="day-head">
          <span class="day-badge">${day.day}</span>
          <div>
            <div class="day-title">${escapeHtml(day.title)}</div>
            <div class="day-cost">Est. ₹${day.estimatedCost.toLocaleString("en-IN")}</div>
          </div>
        </div>
        <div class="day-body">
          <p><strong>Morning:</strong> ${escapeHtml(day.morning)}</p>
          <p><strong>Afternoon:</strong> ${escapeHtml(day.afternoon)}</p>
          <p><strong>Evening:</strong> ${escapeHtml(day.evening)}</p>
        </div>
      </div>`,
    )
    .join("");

  const checklist = plan.bookingChecklist.map((tip) => `<li>${escapeHtml(tip)}</li>`).join("");
  const tips = plan.tips.map((tip) => `<li>💡 ${escapeHtml(tip)}</li>`).join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  body { font-family: -apple-system, Helvetica, Arial, sans-serif; color: #1C1917; padding: 24px; }
  h1 { font-size: 22px; margin-bottom: 4px; }
  .subtitle { color: #78716C; font-size: 13px; margin-bottom: 20px; }
  .summary { background: linear-gradient(135deg, #333C81, #C44A0A); color: #fff; border-radius: 16px; padding: 20px; margin-bottom: 20px; }
  .summary .style { font-weight: bold; font-size: 14px; }
  .summary .meta { font-size: 12px; opacity: 0.85; margin-top: 4px; }
  .summary .total { font-size: 26px; font-weight: bold; margin-top: 10px; }
  h2 { font-size: 16px; margin-top: 24px; margin-bottom: 10px; border-bottom: 1px solid #E7E2DA; padding-bottom: 6px; }
  .breakdown-row { display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; }
  ul { padding-left: 18px; margin: 0; }
  li { font-size: 13px; margin-bottom: 6px; line-height: 1.5; }
  .day { border: 1px solid #E7E2DA; border-radius: 12px; padding: 14px; margin-bottom: 10px; page-break-inside: avoid; }
  .day-head { display: flex; align-items: center; gap: 10px; }
  .day-badge { background: #4A1F35; color: #fff; width: 28px; height: 28px; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; font-weight: bold; font-size: 13px; }
  .day-title { font-weight: bold; font-size: 13px; }
  .day-cost { font-size: 11px; color: #0D5C63; }
  .day-body { margin-top: 10px; padding-top: 10px; border-top: 1px solid #F0EBE3; font-size: 12px; line-height: 1.5; }
  .day-body p { margin: 0 0 6px; }
  .footer { margin-top: 24px; font-size: 10px; color: #A8A29E; text-align: center; }
</style>
</head>
<body>
  <h1>${escapeHtml(plan.destination.name)} Trip Plan</h1>
  <div class="subtitle">${escapeHtml(plan.origin || "—")} → ${escapeHtml(plan.destination.name)} · ${plan.days} days · ${escapeHtml(plan.styleConfig.label)} · ${formatDate(plan.startDate)}</div>

  <div class="summary">
    <div class="style">${escapeHtml(plan.styleConfig.label)}</div>
    <div class="meta">${plan.days} days · ${plan.people} people · ${escapeHtml(plan.destination.name)}</div>
    <div class="total">₹${plan.totalCost.toLocaleString("en-IN")} total</div>
    <div class="meta">≈ ₹${perPersonPerDay.toLocaleString("en-IN")}/person/day</div>
  </div>

  <h2>Travel Breakdown</h2>
  <div class="breakdown-row"><span>Getting There</span><strong>${escapeHtml(plan.styleConfig.transport)}</strong></div>
  <div class="breakdown-row"><span>Where to Stay</span><strong>${escapeHtml(plan.styleConfig.stay)}</strong></div>
  <div class="breakdown-row"><span>Getting Around</span><strong>${escapeHtml(plan.styleConfig.local)}</strong></div>
  <div class="breakdown-row"><span>Food Budget</span><strong>₹${plan.foodBudget.toLocaleString("en-IN")} total</strong></div>

  <h2>Booking Checklist</h2>
  <ul>${checklist}</ul>

  <h2>Day-by-Day Plan</h2>
  ${days}

  <h2>Smart Tips</h2>
  <ul>${tips}</ul>

  <div class="footer">Generated by Jourrrney${plan.planSource === "ai" ? " · AI-generated itinerary" : ""}</div>
</body>
</html>`;
}

export interface ExportResult {
  ok: boolean;
  /** User-facing message on failure — null on success. */
  error: string | null;
}

export async function exportItineraryPdf(plan: TripPlan): Promise<ExportResult> {
  let Print: typeof PrintType;
  let Sharing: typeof SharingType;
  try {
    const [printMod, sharingMod] = await Promise.all([import("expo-print"), import("expo-sharing")]);
    Print = unwrap(printMod as typeof PrintType & { default?: typeof PrintType });
    Sharing = unwrap(sharingMod as typeof SharingType & { default?: typeof SharingType });
    if (typeof Print.printToFileAsync !== "function" || typeof Sharing.shareAsync !== "function") {
      throw new Error("module shape unexpected");
    }
  } catch {
    return { ok: false, error: "PDF export isn't available in this app build right now." };
  }

  try {
    const { uri } = await Print.printToFileAsync({ html: buildHtml(plan), base64: false });
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      return { ok: false, error: "Sharing isn't available on this device." };
    }
    await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: `${plan.destination.name} Trip Plan` });
    return { ok: true, error: null };
  } catch {
    return { ok: false, error: "Couldn't generate the PDF — try again in a moment." };
  }
}
