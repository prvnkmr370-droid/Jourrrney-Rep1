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
  jaipur: {
    police: {
      summary: "PinkGuard (Jaipur Police tourist safety): +91 8764866144 · Tourist Police: 0141-2744999",
      details: [
        "PinkGuard — an official tourist-safety platform run by Jaipur Police specifically for Pink City visitors — Tourist Safety Helpline: +91 8764866144 (also handles complaint filing/tracking).",
        "Jaipur Tourist Police Helpline: 0141-2744999",
        "Tourist Safety Helpline (national): 1364, 24 hours",
        "General Police: 100",
        "UP/Rajasthan Police National Emergency: 112",
        "Ambulance: 108",
        "Jaipur Tourist Reception Centre (Directorate of Tourism), Paryatan Bhawan, Khasa Kothi Hotel Campus, M.I. Road: 0141-5110598",
      ],
      sourceNote: "Numbers verified from pinkguardjaipur.com (an official Jaipur Police tourist-safety platform) and the Rajasthan Tourism Department's own published Contact Us page.",
    },
    accessibility: {
      details: [
        "Amber Fort (Amer Fort) is a hilltop fort — genuinely steep terrain. Ramps exist in certain areas, but visitor reports consistently describe full wheelchair access as difficult given the hill-fort layout; an elephant/jeep ride or golf-cart option is available up to the fort from the base for those who can't manage the walk/steps.",
        "City Palace and Hawa Mahal are within Jaipur's flatter walled Old City and are generally easier ground-level access than Amber Fort, though both are heritage buildings with steps and uneven historic flooring in parts.",
        "No official accessibility statement was found for any of the three monuments — this is based on consistent visitor reporting (e.g. TripAdvisor), not an ASI/Rajasthan-government accessibility statement.",
      ],
      sourceNote: "Based on consistent third-party visitor reports, not an official government accessibility statement — treat as indicative.",
    },
    toilets: {
      details: [
        "No official source (Rajasthan Tourism's own site, or the state's official OBMS monument-booking portal) publishes toilet locations or distances for Amber Fort, City Palace, or Hawa Mahal specifically — despite checking both directly.",
        "As with any major ticketed monument, expect facilities near the ticket counter/entrance rather than deep inside the complex; carry your own tissues/sanitiser as backup.",
      ],
      sourceNote: "Official sources checked (tourism.rajasthan.gov.in, obms-tourist.rajasthan.gov.in) had no facility-location data — this is general guidance, not a verified fact for these specific monuments.",
    },
  },
  udaipur: {
    toilets: {
      summary: "City Palace Museum: dedicated accessible toilet + regular washrooms, per the museum's own facilities list",
      details: [
        "The City Palace Museum's own official website (citypalacemuseum.org) publishes a specific facilities list that includes both regular \"Washrooms\" and a separate \"Accessible Toilet\" — genuinely confirmed, not inferred.",
        "No exact in-complex distance/location is published for these — the museum's site lists them as available facilities without further detail.",
      ],
      sourceNote: "Directly confirmed on citypalacemuseum.org's own published visitor-facilities list — this is real, destination-specific data, not general guidance.",
    },
    accessibility: {
      summary: "City Palace Museum publishes a real facilities list: accessible lift, wheelchair, ramp, accessible toilet",
      details: [
        "The City Palace Museum, Udaipur explicitly states it \"provide[s] universal accessibility\" and lists these facilities on its own site: Information Desk, Accessible lift, Wheelchair, Ramp, Drinking water, Washrooms, Accessible Toilet, Childcare Room, Car parking.",
        "The museum also publishes a Sensory Guide and Social Narrative specifically for visitors on the autism spectrum — a genuinely unusual level of accessibility documentation for an Indian heritage site.",
        "Caveat from independent visitor reports: gallery sections are connected by stairs, and wheelchair users can generally reach the ground-floor ceremonial hall but may not reach every upper gallery where some artifacts are displayed — so the ground floor is confirmed accessible, upper floors are more limited.",
        "Lake Pichola boat rides and other Udaipur attractions outside the City Palace complex don't have the same published accessibility detail — treat those separately.",
      ],
      sourceNote: "Facilities list is directly from citypalacemuseum.org's own published page — real, destination-specific, and unusually detailed for this category. The upper-gallery caveat is from independent visitor reports, not the museum's own statement.",
    },
    police: {
      summary: "Udaipur Police AI WhatsApp tourist helpline: 7300059984 (launched July 2026)",
      details: [
        "Udaipur Police launched a dedicated AI chatbot WhatsApp helpline for tourists in July 2026 — number 7300059984, per IG Shrivastava's announcement, reported consistently across multiple Indian outlets (Times of India, ET TravelWorld, Dainik Bhaskar) around the same date.",
        "General Police: 100",
        "National Emergency: 112",
        "Ambulance: 108",
        "Tourist Safety Helpline (national): 1364, 24 hours",
      ],
      sourceNote: "WhatsApp helpline number corroborated across multiple independent news outlets reporting the same July 2026 launch and figure; the primary outlet pages themselves were not directly browsable due to a site-access restriction, so this rests on consistent secondary reporting rather than a first-party government page.",
    },
  },
};
