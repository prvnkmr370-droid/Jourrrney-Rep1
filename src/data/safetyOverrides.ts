/**
 * Real, per-destination safety-facility facts that override the
 * class-based general guidance in safetyDetails.ts — populated only
 * where a genuine source was actually found and checked, following the
 * user's request to scrape the official sites for real facility
 * detail (toilets, ramps/wheelchairs, dedicated police counters)
 * rather than rely on generic guidance alone.
 *
 * Important honesty note: no source (official or otherwise) publishes
 * exact meter distances from a monument to its toilets/police post for
 * any destination checked so far — confirmed across tajmahal.gov.in,
 * asiagracircle.in (ASI's own tender/maintenance records), and multiple
 * independent travel guides for Agra specifically. So these entries
 * describe real, sourced *locations* (e.g. "at the East and West
 * facility centers, not beside the mausoleum platform itself") rather
 * than a fabricated distance figure. If a genuinely sourced distance
 * turns up for a specific place, it belongs here as free text in
 * `details`, not as a hardcoded field, since most places won't have one.
 */
import type { SafetyCategoryKey } from "./safetyDetails";

export interface SafetyOverride {
  summary?: string;
  details?: string[];
  sourceNote: string;
}

export const SAFETY_OVERRIDES: Partial<Record<string, Partial<Record<SafetyCategoryKey, SafetyOverride>>>> = {
  agra: {
    toilets: {
      summary: "ASI-maintained toilet blocks at the East & West facility centers, not beside the mausoleum",
      details: [
        "The Archaeological Survey of India (ASI) maintains dedicated toilet blocks at the East and West \"facility centers\"/Dallan near the entry gates, plus a separate block near the CISF security office — confirmed via ASI Agra Circle's own published tender and annual-maintenance records for the Taj Mahal complex.",
        "There are no toilets directly beside the mausoleum/marble platform itself — use the facility-center toilets near your entry gate (East or West) before heading in, as the walk from the platform back out is a genuine distance.",
        "RO drinking-water points are installed at the same East & West Dallan facility centers, per the same ASI records — a reasonable indicator these are the main visitor-facility hubs.",
        "No official source publishes an exact metre distance from the mausoleum to these blocks — treat \"near the entry gate you use\" as the reliable guidance rather than a precise figure.",
      ],
      sourceNote: "Sourced from ASI Agra Circle's own published tender/maintenance documents (asiagracircle.in) — real, but no exact distance is published anywhere.",
    },
    accessibility: {
      summary: "Wheelchairs available near entry gates (first-come-first-served); battery-cart shuttle from parking",
      details: [
        "Battery-operated shuttle vehicles run from the designated parking areas to the East and West entry gates — private/petrol vehicles aren't allowed close to the monument, so this shuttle is how most visitors, including those with mobility issues, cover that stretch.",
        "Wheelchairs are generally available near the entrance gates on a first-come, first-served basis; visitors may also bring their own.",
        "Paths through the gardens are mostly smooth with some gentle ramps; benches are placed throughout for rest stops.",
        "The marble platform around the mausoleum itself requires shoes to be removed or covered, and can get slippery when wet — wheelchair users may need assistance on this specific section.",
        "East Gate is generally recommended over West/South for senior or mobility-limited visitors — less crowded and better for private-vehicle drop-off before the shuttle/walk-in.",
      ],
      sourceNote: "Battery-cart shuttle and general layout confirmed across multiple independent Agra tour-guide sources; not an ASI-published accessibility statement, so treat specifics (e.g. exact wheelchair count) as indicative, not guaranteed on any given day.",
    },
    police: {
      summary: "Dedicated Agra Tourist Police Station: 9454402764 · Police 100 · UP Police Helpline 112",
      details: [
        "Agra has a dedicated Tourist Police Station with its own number — 9454402764 — specifically for tourist assistance, separate from the general police line, per tajmahal.gov.in's own Emergency Services page.",
        "General Police: 100",
        "UP Police Helpline: 112",
        "Agra Women Helpline (local): 1090",
        "Child Line: 1098",
        "Foreigners Registration Office, Agra: 9454401717",
        "SSP Agra office: 0562-2227256 / 0562-2227255",
      ],
      sourceNote: "All numbers taken directly from tajmahal.gov.in's own official Emergency Services page — genuine, destination-specific.",
    },
    medical: {
      details: [
        "Ambulance: 108 (confirmed on tajmahal.gov.in's official Emergency Services page for Agra specifically).",
        "The ASI/UP Tourism office (22 The Mall, Agra) and the ticket counters at both gates can direct you to the nearest hospital if needed — Agra is a major city with multiple government and private hospitals a short drive from the monument.",
      ],
      sourceNote: "Ambulance number confirmed on tajmahal.gov.in; hospital availability is general city-level knowledge, not a specific verified facility list.",
    },
  },
};
