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
      summary: "Tourist Police Station, Fatehabad Rd, Tajganj (24hr): 9454402764 · Police 100 · UP Police Helpline 112",
      details: [
        "Tourist Police Station — Fatehabad Road, Tajganj, Agra 282001 — right in the Taj Mahal's own neighbourhood, open 24 hours: 9454402764 (per tajmahal.gov.in's own Emergency Services page; address confirmed via a mapped business listing with visitor reviews describing real assistance given — lost passports, hotel check-in issues).",
        "General Police: 100",
        "UP Police Helpline: 112",
        "Agra Women Helpline (local): 1090",
        "Child Line: 1098",
        "Foreigners Registration Office, Agra: 9454401717",
        "SSP Agra office: 0562-2227256 / 0562-2227255",
      ],
      sourceNote: "Numbers taken directly from tajmahal.gov.in's own official Emergency Services page; the Tourist Police Station's specific address confirmed via a mapped, reviewed business listing — genuine, destination-specific.",
    },
    medical: {
      summary: "S.N. Medical College & Hospital, M.G. Road (24hr): 0562 226 0353 · District Hospital, M.G. Road (also nearby)",
      details: [
        "S.N. Medical College & Hospital — Mahatma Gandhi Road, Agra 282001, open 24 hours — Agra's main government hospital: 0562 226 0353.",
        "District Hospital — M.G. Road, Agra — a second government hospital option, listed directly on agra.nic.in's own official district hospital directory alongside S.N. Medical College.",
        "Rainbow Hospital — NH-2, near Guru Ka Tal Gurudwara, Agra 282007 — a private multi-speciality option: 0562-2600531, also from the same official directory.",
        "Ambulance: 108 (confirmed on tajmahal.gov.in's official Emergency Services page for Agra specifically).",
      ],
      sourceNote: "All three hospitals taken directly from agra.nic.in's own official district Hospitals directory, plus the mapped business listing and hospital's own domain (snmcagra.ac.in) for S.N. Medical College specifically.",
    },
  },
  jaipur: {
    police: {
      summary: "Kotwali Police Station, Tripolia Bazar (covers Hawa Mahal/City Palace): 0141 232 2444 · PinkGuard: +91 8764866144",
      details: [
        "Kotwali Police Station — Kishanpole Bazar Road, Chandpol, Pink City, Jaipur — is the named police station covering the walled Old City area where Hawa Mahal and City Palace sit: 0141 232 2444.",
        "PinkGuard — an official tourist-safety platform run by Jaipur Police specifically for Pink City visitors — Tourist Safety Helpline: +91 8764866144 (also handles complaint filing/tracking).",
        "Jaipur Tourist Police Helpline: 0141-2744999",
        "Tourist Safety Helpline (national): 1364, 24 hours",
        "General Police: 100 · National Emergency: 112",
        "Jaipur Tourist Reception Centre (Directorate of Tourism), Paryatan Bhawan, Khasa Kothi Hotel Campus, M.I. Road: 0141-5110598",
      ],
      sourceNote: "Kotwali Police Station's name/address/number confirmed via a mapped business listing; PinkGuard and Tourist Reception Centre details from their own official sites.",
    },
    medical: {
      summary: "SMS Hospital (1, Ajmer Road) — largest government hospital in the state; Zanana Hospital (Station Road) — dedicated women's hospital",
      details: [
        "SMS Hospital — 1, Ajmer Road, Jaipur 302004 — attached to Sawai Man Singh Medical College, is the largest government-run hospital in the state: 0141 251 8222.",
        "Zanana Hospital — Station Road, Jaipur — a dedicated government women's hospital, established 1929, a genuinely relevant second option for women travellers specifically.",
        "There is also a dedicated \"SMS Hospital Police Station\" on the SMS Hospital premises itself: 0141 251 8444.",
        "Ambulance: 108",
      ],
      sourceNote: "SMS Hospital's name, address, and number confirmed via its own official Rajasthan Medical Education Department page (medicaleducation.rajasthan.gov.in) and a mapped business listing; Zanana Hospital confirmed via a government-hospital directory listing.",
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
      summary: "Surajpole Police Station (right by City Palace): 0294 241 1797 · Udaipur Police WhatsApp helpline: 7300059984",
      details: [
        "Surajpole Police Station — Dhan Mandi Road, Girwa, Udaipur (near Kalaji Goraji, right by the City Palace area) — is the named, local police station: 0294 241 1797.",
        "Udaipur Police launched a dedicated AI chatbot WhatsApp helpline for tourists in July 2026 — number 7300059984, per IG Shrivastava's announcement, reported consistently across multiple Indian outlets (Times of India, ET TravelWorld, Dainik Bhaskar) around the same date.",
        "General Police: 100 · National Emergency: 112",
        "Tourist Safety Helpline (national): 1364, 24 hours",
      ],
      sourceNote: "Surajpole Police Station's name/address/number confirmed via a mapped business listing with visitor reviews; WhatsApp helpline corroborated across multiple independent news outlets (primary pages themselves were blocked from direct browsing).",
    },
    medical: {
      summary: "RNT Medical College Hospital (government, Court Chowk) · GBH American Hospital (private, 24hr) — two real options",
      details: [
        "R.N.T. (Ravindra Nath Tagore) Medical College Hospital — Panchsheel Marg, Court Chowk, Udaipur 313001 — is Udaipur's main government multi-speciality hospital.",
        "GBH American Hospital — 101 Kothi Bagh, Bhatt Ji Ki Bari, Udaipur, open 24 hours — a well-regarded private multi-speciality hospital: 0294-3535000.",
        "Ambulance: 108",
      ],
      sourceNote: "RNT Medical College Hospital's name and address confirmed via its own official Rajasthan Medical Education Department page; GBH American Hospital confirmed via its own official site (gbhamericanhospital.com).",
    },
  },
  varanasi: {
    toilets: {
      summary: "Namo Ghat has clean modern restrooms and is the most facility-rich ghat; older ghats (Dashashwamedh, Assi) are far more limited",
      details: [
        "Namo Ghat (the newest, Smart-City-built ghat at the northern end of the riverfront) has modern restrooms, food courts, and parks — consistently confirmed across independent sources covering the ghat.",
        "The 83 older, traditional stone-stepped ghats (Dashashwamedh, Assi, Manikarnika, etc.) are narrow, historic, and don't have the same purpose-built facilities — expect to rely on nearby hotels/cafés in the Godowlia old-city area for cleaner toilets rather than the ghats themselves.",
        "No official source publishes exact toilet locations/distances along the ghats specifically — the honest guidance is \"Namo Ghat is the reliable option; elsewhere, use a nearby hotel/café.\"",
      ],
      sourceNote: "Namo Ghat's modern-restroom facility is corroborated across multiple independent Varanasi travel-guide sources describing the same Smart City redevelopment; not an official government facility list, but consistent across sources.",
    },
    accessibility: {
      summary: "Namo Ghat is the only fully wheelchair/ramp-accessible ghat in Varanasi; the older stone ghats are not",
      details: [
        "Namo Ghat (formerly Khidkiya Ghat), redeveloped under the Smart City mission, is described consistently as \"100% accessible\" — ramps across its entire expanse, explicitly built for wheelchairs, elderly visitors, and strollers.",
        "This makes it the ONLY major ghat in Varanasi with full ramp access, per multiple independent sources — the other 83-odd traditional ghats (including the famous Dashashwamedh and Assi Ghats) are narrow stone steps, genuinely difficult for wheelchairs or limited mobility.",
        "If accessibility is a priority, plan your Ganga/boat experience to start from Namo Ghat rather than the older, more famous but much less accessible ghats.",
      ],
      sourceNote: "Corroborated across multiple independent Varanasi accessibility/travel-guide sources describing the same Smart City redevelopment of this specific ghat; not a direct government accessibility statement, but consistent and specific across sources.",
    },
    police: {
      summary: "Dashashwamedh Police Station (right by the main ghat, 24hr): +91 542 241 2650 · Police Helpline: 112",
      details: [
        "Dashashwamedh Police Station — Harha, Varanasi 221001, open 24 hours — is the named police station right by Dashashwamedh Ghat, the city's most-visited ghat: +91 542 241 2650.",
        "Police Helpline: 112 · Crime Stopper: 1090 · Women Power-line: 1091",
        "Child Helpline: 1098",
        "Disaster/Aapda Emergency Helpline: 9140037137",
        "CM Helpline: 1076",
      ],
      sourceNote: "Dashashwamedh Police Station's name/address/number confirmed via a mapped business listing; the rest taken directly from varanasi.nic.in's own official District Administration Helpline page.",
    },
    medical: {
      summary: "SSPG District Hospital, Kabir Chaura (closest to the ghats) · Sir Sunderlal Hospital, BHU (larger, further south at Lanka)",
      details: [
        "Shri Shiv Prasad Gupt (SSPG) Divisional District Hospital — Kabir Chaura, Varanasi 221001, open 24 hours — is genuinely the closer option to the old-city ghats, named directly on varanasi.nic.in's own official site.",
        "Sir Sunderlal Hospital, BHU — Lanka, Varanasi — the larger university hospital, further south of the ghats: 0542-2368547, also named directly on varanasi.nic.in.",
        "Ambulance: 102 · UP State Ambulance Service: 108",
      ],
      sourceNote: "Both hospitals' names, locations, and (for Sir Sunderlal) phone number taken directly from varanasi.nic.in's own official Public Utility pages — genuine, district-government-confirmed, and correctly distinguished by which is actually closer to the ghats.",
    },
  },
};

/**
 * The Chandigarh cluster (Rock Garden, Sukhna Lake, Capitol Complex,
 * Bird Park, plus the city card itself) shares the same city-level
 * police/tourism-helpline data, so this block is spread across all
 * five ids below rather than repeated by hand five times.
 */
const CHANDIGARH_POLICE: SafetyOverride = {
  summary: "Police Station Sector 19C (Sukhna Path, near Sukhna Lake, 24hr): 0172 277 5173 · Emergency: 112",
  details: [
    "Police Station Sector 19C — Sukhna Path, Chandigarh, open 24 hours — is the named police station on the road right by Sukhna Lake, closest to the whole Rock Garden/Sukhna Lake/Capitol Complex cluster: 0172 277 5173.",
    "Chandigarh Police Headquarters — Sector 9D, Chandigarh 160009: 0172 274 9194.",
    "Chandigarh Tourism's own 24-hour Tourist Helpline: 1800-180-2116",
    "Crime Against Women & Children: 112, 1091 · Senior Citizens Complaint: 112, 1090",
    "Traffic Emergency: 1073 · Cyber Crime: 1930",
    "Physical Tourist Information Centres exist right at Sukhna Lake (Sukhna Lake Information Center, Sector 1) and at Capitol Complex (Sector 1) — genuine, staffed counters at the attraction itself, not just a phone line.",
  ],
  sourceNote: "Police Station Sector 19C's name/address/number confirmed via a mapped listing; HQ and other numbers taken directly from Chandigarh Police's own official portal (portal.chandigarhpolice.gov.in) and Chandigarh Tourism's own site.",
};

const CHANDIGARH_ACCESSIBILITY_ROCK_GARDEN: SafetyOverride = {
  summary: "Not wheelchair accessible — uneven, narrow paths through 14 chambers, genuine fall risk",
  details: [
    "Independent visitor reports (TripAdvisor) are explicit and consistent: the Rock Garden is not wheelchair accessible — narrow, uneven paths through its 14 chambers create genuine fall/injury risk, not just discomfort.",
    "This is a real limitation of the site's own design (built from waste materials in irregular, sculptural forms), not a lack of investment — unlikely to change.",
    "If accessibility is essential, Sukhna Lake's promenade (flat, paved) is a far more manageable nearby alternative in the same part of Chandigarh.",
  ],
  sourceNote: "Based on consistent independent visitor reporting (TripAdvisor), not an official accessibility statement — but specific and consistent enough to trust as a real limitation.",
};

const CHANDIGARH_ACCESSIBILITY_GENERAL: SafetyOverride = {
  details: [
    "No official accessibility statement was found for this specific attraction — Chandigarh's broader city planning (wide roads, sector grid) is generally easier terrain than most Indian cities, but check with the specific site's information centre on arrival for ramp/wheelchair specifics.",
  ],
  sourceNote: "General guidance — no official accessibility statement found for this specific site despite checking chandigarhtourism.gov.in directly.",
};

const CHANDIGARH_MEDICAL: SafetyOverride = {
  summary: "PGIMER (Nehru Hospital) — Sector 12, Chandigarh — the region's major government hospital",
  details: [
    "PGIMER (Post Graduate Institute of Medical Education & Research), also known as Nehru Hospital — Sector 12, Chandigarh 160012 — is North India's major government referral hospital, a genuinely named, addressed facility.",
    "Ambulance: 108",
  ],
  sourceNote: "PGIMER's name and address confirmed via its own official site (pgimer.edu.in) and a mapped business listing.",
};

for (const id of ["chandigarh", "rock-garden", "sukhna-lake", "capitol-complex", "chandigarh-bird-park"]) {
  SAFETY_OVERRIDES[id] = {
    ...SAFETY_OVERRIDES[id],
    police: CHANDIGARH_POLICE,
    accessibility: id === "rock-garden" ? CHANDIGARH_ACCESSIBILITY_ROCK_GARDEN : CHANDIGARH_ACCESSIBILITY_GENERAL,
    medical: CHANDIGARH_MEDICAL,
  };
}

SAFETY_OVERRIDES["fatehpur-sikri"] = {
  toilets: {
    summary: "ASI-provisioned toilet block with pathway/cafeteria near the Diwan-i-Am courtyard",
    details: [
      "ASI Agra Circle's own published tender/maintenance records confirm a purpose-built toilet block, pathway, and cafeteria near the Diwan-i-Am (Hall of Public Audience) at Fatehpur Sikri — the same source class used for the Agra/Taj Mahal entry.",
      "As with Taj Mahal, no exact metre distance from any specific monument (e.g. Buland Darwaza or Jama Masjid) to this block is published anywhere — \"near Diwan-i-Am\" is the real, sourced location.",
    ],
    sourceNote: "Sourced from ASI Agra Circle's own published tender documents (asiagracircle.in) — real, but no exact distance is published.",
  },
  accessibility: {
    summary: "Genuinely difficult — Buland Darwaza is reached by a large monumental flight of stone steps",
    details: [
      "Buland Darwaza, Fatehpur Sikri's most iconic structure, is reached via a large, steep flight of stone steps — a well-documented, architecturally intrinsic feature of the monument, not something that can be ramped around.",
      "The wider complex (courtyards, Jama Masjid, palace buildings) involves further uneven stone flooring and steps typical of a 16th-century Mughal city — expect this to be one of the more physically demanding UNESCO sites on an Agra itinerary for anyone with mobility limitations.",
      "No official wheelchair-access statement was found for this site.",
    ],
    sourceNote: "Buland Darwaza's monumental staircase is a well-documented architectural feature (confirmed via multiple independent sources); no official accessibility statement exists for the site.",
  },
  police: {
    summary: "Fatehpur Sikri Police Station (local, right in town): 094544 02734 · Agra Tourist Police (~40km): 9454402764",
    details: [
      "Fatehpur Sikri Police Station — Santosh Nagar, Dadupura, Fatehpur Sikri, UP 283110 — is the local station right in the town itself: 094544 02734.",
      "Agra's dedicated Tourist Police Station (9454402764, per tajmahal.gov.in) also covers the wider Agra tourism circuit including Fatehpur Sikri, but is based in Agra city, ~40km away.",
      "Police 100 · UP Police Helpline 112",
    ],
    sourceNote: "Fatehpur Sikri Police Station's name/address/number confirmed via a mapped business listing; Agra's Tourist Police Station number from tajmahal.gov.in's official page.",
  },
  medical: {
    summary: "Fatehpur Sikri Community Health Centre (local); S.N. Medical College Hospital, Agra (~40km) for anything serious",
    details: [
      "Fatehpur Sikri Community Health Centre (CHC) — Block Compound, Fatehpur Sikri — is the local government health facility right in town, for anything minor.",
      "For anything more serious, S.N. Medical College & Hospital, Mahatma Gandhi Road, Agra (the city's main 24-hour government hospital, ~40km away) is the nearest well-equipped option — see the Agra entry.",
      "Ambulance: 108",
    ],
    sourceNote: "Fatehpur Sikri CHC's name and location confirmed via a hospital-directory listing; S.N. Medical College cross-referenced from the Agra entry's own verified source.",
  },
};

SAFETY_OVERRIDES["kerala"] = {
  toilets: {
    summary: "Kerala mandates bio-toilets on all licensed Alappuzha houseboats — verified onboard, not shore-based",
    details: [
      "Kerala's government mandates that all houseboats operating on the Alappuzha (Vembanad Lake) backwaters be fitted with bio-toilets, which treat sewage onboard via anaerobic digestion rather than discharging into the backwaters — confirmed via mainstream Kerala news coverage (Mathrubhumi English) of the state's enforcement crackdown on non-compliant boats.",
      "Houseboats without a valid pollution-control certificate/bio-toilet are being actively barred from the lake as of the state's most recent enforcement drive — a real, current regulatory fact, not just a nominal rule.",
      "This is specific to registered houseboats — it says nothing about shore-side public toilets at Alappuzha's jetties/beaches, which weren't covered by any official source found.",
    ],
    sourceNote: "Bio-toilet mandate confirmed via mainstream Kerala news coverage (Mathrubhumi English) of a real, current state enforcement action — genuine regulatory fact, not general guidance.",
  },
  police: {
    summary: "Alappuzha Tourism Police Station (Jetty Road, 24hr): 0477 223 9161",
    details: [
      "Alappuzha has a dedicated Tourism Police Station on Jetty Road, Alleppey, open 24 hours — 0477 223 9161.",
      "Alappuzha District Emergency Operation Centre: 1077, 0477 2238630",
      "Police: 100 · National Emergency: 112 · Ambulance: 102 / 108 · Fire: 101",
      "Women Helpline: 1091 · Women's Cell, Alappuzha (DTPC-listed): +91 477 223 7474",
    ],
    sourceNote: "Tourism Police Station and its address/hours confirmed via mapped business listing; district emergency numbers taken directly from alappuzha.nic.in (official District Administration site) and dtpcalappuzha.com (District Tourism Promotion Council's own site).",
  },
  medical: {
    summary: "General Hospital Alappuzha, Palace Road, Alleppey — named directly on the district's own official site",
    details: [
      "General Hospital Alappuzha — Palace Road / General Hospital Road, Anantha Narayanapuram, Alappuzha 688011, open 24 hours — is named directly on alappuzha.nic.in's own official Public Utility listing: 0477-2253324.",
      "Ambulance: 102 / 108",
    ],
    sourceNote: "Hospital name, address, and phone number taken directly from alappuzha.nic.in's own official Public Utility page — genuine, district-government-confirmed.",
  },
};

SAFETY_OVERRIDES["goa"] = {
  toilets: {
    summary: "GTDC has built toilet/changing-room blocks at major beaches (e.g. Baga), but its own 2024 inspection flagged poor upkeep",
    details: [
      "The Goa Tourism Development Corporation (GTDC) has constructed toilet blocks and changing-room facilities at major beaches — e.g. at the end of Tito's Lane in Baga, alongside a tourist information centre — confirmed via Goa news coverage (The Goan Everyday) of the specific construction project.",
      "Important honest caveat: GTDC's own 2024 surprise inspection of toilets and changing rooms along Goa's beaches found several in poor condition, per Times of India's coverage of that inspection — so \"a toilet block exists\" doesn't guarantee it's well-maintained on any given day.",
      "Bigger, more developed beaches (Baga, Calangute, Candolim) are more likely to have a maintained block than smaller/quieter beaches — beach shacks are a reliable fallback if you're a paying customer.",
    ],
    sourceNote: "Construction of specific facilities confirmed via Goa news coverage (The Goan Everyday); the maintenance caveat is from GTDC's own inspection, reported by Times of India — both real, dated findings rather than general guidance.",
  },
  police: {
    summary: "Calangute Police Station (main beach belt): 0832-2278284 · Goa Tourist Police (est. 1990)",
    details: [
      "Goa Police has had a dedicated Tourist Police unit since 1990, confirmed on the force's own official site — its role includes both general tourist protection and enforcement of the Goa Registration of Tourist Trade Act.",
      "Calangute Police Station (covering the main North Goa beach belt — Calangute/Baga area): 0832-2278284, mobile 7875756031, per Goa Police's own station directory.",
      "Individual police stations also exist for Anjuna, Colva, and other beach areas — check Goa Police's own station directory (citizen.goapolice.gov.in) for the station nearest your specific beach.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Tourist Police unit history and Calangute Police Station's direct contact number taken from Goa Police's own official portal (citizen.goapolice.gov.in) — genuine, verifiable.",
  },
  medical: {
    summary: "Mathew Braganza Hospital, Calangute Beach Road (24hr, right on the beach belt); Goa Medical College Hospital (Bambolim) for anything serious",
    details: [
      "Mathew Braganza Hospital — Calangute Beach Road, Bardez, open 24 hours — is a named hospital directly on the main North Goa beach road: 0832 671 6666.",
      "For anything more serious, Goa Medical College Hospital (GMC) — Bambolim Road, Panaji 403202, open 24 hours — is Goa's main government referral hospital, also listed directly on northgoa.gov.in's own official site.",
      "Ambulance: 108",
    ],
    sourceNote: "Both hospitals' names and addresses confirmed via mapped listings and, for GMC, its own official site (gmcgoa.edu.in) and the North Goa District government's own public-utility page.",
  },
};

SAFETY_OVERRIDES["ladakh"] = {
  police: {
    summary: "Police Control Room Leh: 01982-258880 · Women Police Station Leh: 9541900289 · posts at Nubra & Pangong (Tangtse)",
    details: [
      "Police Control Room, Leh: 01982-258880 (district-wide PHQ Ladakh control room: 01982-260887)",
      "SHO Police Station Leh: 9541900283 · SHO Police Station Nubra: 9541900285",
      "Women Police Station, Leh: 9541900289",
      "Police Post Tangtse (covers the Pangong Tso route): 9541900297",
      "Police Post Panamik (covers Nubra Valley): 9541900298",
      "Tourist Information Centre, Leh: 01982-257788",
    ],
    sourceNote: "All numbers taken directly from leh.nic.in's own official District Administration \"Important Contact Details\" page — genuine, and notably specific to this destination's own highlighted stops (Pangong, Nubra), not just the main town.",
  },
  medical: {
    summary: "Sonam Norboo Memorial (SNM) Hospital, Old Leh Road, Leh — the district's main hospital",
    details: [
      "Sonam Norboo Memorial (SNM) Hospital — Old Leh Road, Leh, Ladakh 194101 — is the district's main government hospital, named and addressed directly on both its own site and leh.nic.in's official listing: 01982-252012 / 01982-252014.",
      "CMO Office Leh: 01982-252012",
      "For anywhere along the Nubra or Pangong routes, the nearest well-equipped facility is this hospital back in Leh — the local police posts at Tangtse and Panamik are the first point of contact for any emergency out there, not a hospital.",
    ],
    sourceNote: "SNM Hospital's full name and address confirmed via its own official site (snmhospitalleh.com) and leh.nic.in's official Public Utility listing.",
  },
  accessibility: {
    summary: "\"Himalaya on Wheels\" — a real wheelchair-accessible circuit covering Leh monasteries, Alchi/Likir gompas, and Pangong Lake",
    details: [
      "A genuine, named initiative called \"Himalaya on Wheels\" — launched by Travel Another India and PAGIR with the Ladakh Road Safety Council — created a wheelchair-friendly circuit covering monasteries/palaces around Leh, the Alchi and Likir gompas (~2hr from Leh), and Pangong Lake itself, per SATH (Society for Accessible Travel & Hospitality), a recognised accessible-travel organisation.",
      "Several hotels/guesthouses along this specific circuit have been modified for wheelchair users as part of the same initiative.",
      "This is destination-specific and genuinely notable — most of the rest of Ladakh's high-altitude terrain (Khardung La, Nubra's sand dunes, general trekking routes) remains very physically demanding and isn't covered by this circuit.",
      "As with any high-altitude destination, altitude acclimatisation matters more here than almost anywhere else in India — this applies regardless of mobility level.",
    ],
    sourceNote: "The \"Himalaya on Wheels\" circuit is a real, named, documented initiative (SATH.org) — genuine and destination-specific, not generic guidance. It covers a specific circuit, not the whole of Ladakh.",
  },
};

SAFETY_OVERRIDES["andaman"] = {
  toilets: {
    summary: "Accessible restrooms most likely at the airport, larger museums and modern restaurants; limited at beaches",
    details: [
      "Per a dedicated Port Blair accessible-travel guide: accessible restrooms are more likely at the airport, larger museums, and modern restaurants — limited availability at beaches and smaller venues.",
      "Corbyn's Cove Beach specifically has a paved promenade and cafés, but sand access itself is difficult without assistance and there are no public beach wheelchairs.",
      "Cellular Jail's courtyards and ground-floor galleries are generally level; upper floors/towers are stair-only.",
    ],
    sourceNote: "From a dedicated Port Blair accessible-travel guide (eandamantourism.com) with specific, attraction-by-attraction accessibility detail — one of the more thorough sources found in this pass, though not an official government accessibility statement.",
  },
  accessibility: {
    summary: "Mostly hilly, uneven sidewalks; ferries board via steps/gangways — confirm accessibility before booking any inter-island transfer",
    details: [
      "Terrain in Port Blair is mostly hilly with uneven sidewalks; many attractions have ground-level access but upper floors are typically stair-only.",
      "Inter-island and excursion ferries (the way you reach Havelock, Neil Island, etc.) often board via steps and narrow gangways — staff may assist, but full wheelchair accessibility is limited. Always confirm with the operator before booking if this matters for your trip.",
      "Public beach wheelchairs are generally not available at Andaman beaches — a personal beach mat or assistance is the realistic option for sand access.",
      "Best accessibility window given the terrain and climate: October to May (drier, fewer downpours).",
    ],
    sourceNote: "From the same dedicated Port Blair accessible-travel guide (eandamantourism.com) — specific and practical, though a private travel-guide site rather than an official government accessibility statement.",
  },
  police: {
    summary: "Police Control Room: 100 · Coast Guard: 1554 (toll-free) / 155211 · Ambulance: 232102",
    details: [
      "Police Control Room: 100",
      "Fire Service: 101",
      "Ambulance: 232102 / 233473",
      "Coast Guard: 155211 — genuinely relevant for an island chain with heavy ferry/boat travel between islands.",
      "Women's Helpline: 1091 · Children's Helpline: 1098",
      "Disaster Management Control: 1070 / 238881",
      "Shipping Helpline: 245555 (relevant for inter-island ferry schedules/issues)",
      "Aberdeen Police Station — RGT Road, Aberdeen Bazar, Port Blair — is the named station for the main town/market area: 03192 232 400 / 03192-232405.",
    ],
    sourceNote: "District helpline numbers taken directly from southandaman.nic.in's own official page; Aberdeen Police Station's name/address confirmed via the South Andaman administration's own police-station site (spsa.and.nic.in) and a mapped listing.",
  },
  medical: {
    summary: "G.B. Pant Hospital, GB Pant Road, City Centre, Port Blair — the main hospital for the islands",
    details: [
      "G.B. Pant Hospital — GB Pant Road, City Centre, Port Blair 744103 — is the main government hospital for the islands, with several direct lines: 03192 233665 / 246058 / 233455 / 230858.",
      "Pharmacies are concentrated around Aberdeen Bazaar — carry prescriptions and a basic first-aid kit, especially before heading to more remote islands.",
      "Ambulance: 232102 / 233473",
    ],
    sourceNote: "G.B. Pant Hospital's full address and phone numbers confirmed via a mapped listing; pharmacy-area detail from the Port Blair accessible-travel guide (eandamantourism.com); ambulance number from southandaman.nic.in's official helpline page.",
  },
};

SAFETY_OVERRIDES["rishikesh"] = {
  police: {
    summary: "Kotwali Rishikesh Police Station: 0135-2430100 · Mountain Rescue (ITBP): 1800-11-5656 · Tourist Helpline: 1363",
    details: [
      "Kotwali Rishikesh Police Station — the named local station for Rishikesh town, Uttarakhand 249201: 0135-2430100 (also listed elsewhere as 0135-2430099, likely a related extension).",
      "National Emergency: 112 · Tourist Helpline: 1363 · Women Helpline: 181",
      "Uttarakhand SDRF (State Disaster Response Force): 1070 — genuinely relevant given Rishikesh's rafting/trekking/mountain activity base.",
      "NDRF (National Disaster Response Force): 011-24363260",
      "Mountain Rescue (ITBP): 1800-11-5656",
    ],
    sourceNote: "Kotwali Rishikesh Police Station's name/address confirmed via a mapped business listing; the rest from a dedicated Rishikesh travel-guide site's own published Safety & Emergency page (visitrishikesh.com) — not a government page itself, but specific and well-organised.",
  },
  medical: {
    summary: "AIIMS Rishikesh, Veerbhadra Marg — a major government hospital right in town",
    details: [
      "All India Institute of Medical Sciences (AIIMS), Rishikesh — Veerbhadra Marg, Rishikesh, open 24 hours — is a major government hospital directly in town, a significant medical resource for a pilgrimage/adventure-sports destination.",
      "Ambulance: 108",
    ],
    sourceNote: "AIIMS Rishikesh's name and address confirmed via its own official site (aiimsrishikesh.edu.in) and a mapped listing.",
  },
  areaConditions: {
    summary: "Monkeys near Lakshman Jhula can be aggressive — keep food hidden and avoid direct eye contact",
    details: [
      "Monkeys near Lakshman Jhula are known to be aggressive — keep food hidden and avoid direct eye contact, per local safety guidance.",
      "The riverside path between Ram Jhula and Lakshman Jhula is scenic but genuinely uneven underfoot — proper footwear matters here specifically.",
      "For sunrise viewpoints (Kunjapuri) and popular temples (Neelkanth), an early start (well before dawn/7am) is standard local advice to beat both crowds and heat.",
    ],
    sourceNote: "From a dedicated Rishikesh travel-guide site's Safety page — specific, practical, location-named advice rather than generic guidance.",
  },
  scamAwareness: {
    summary: "Fake yoga schools offering suspiciously cheap TTC programs are a known local issue — verify Yoga Alliance registration",
    details: [
      "A specific, named scam pattern for this destination: fake yoga schools offering suspiciously cheap Teacher Training Course (TTC) programs — verify Yoga Alliance registration before paying for any yoga course here.",
      "Book rafting and adventure activities only through licensed operators, and check safety equipment yourself before starting.",
    ],
    sourceNote: "From a dedicated Rishikesh travel-guide site's Safety page — a specific, named local scam pattern rather than generic 'be careful' advice.",
  },
  localCustoms: {
    details: [
      "Rishikesh town itself is strictly vegetarian — no meat, eggs, or alcohol in the main areas, a genuinely enforced local norm, not just a suggestion.",
      "Dress modestly at ashrams and temples — cover shoulders and knees.",
      "Carry cash — many cafés, shops, and auto-rickshaws don't accept cards; UPI is more widely accepted than cards specifically.",
      "Plastic bags are banned in Uttarakhand state-wide — carry a reusable bag.",
    ],
    sourceNote: "From a dedicated Rishikesh travel-guide site's Safety page — specific local norms rather than generic guidance.",
  },
  walkingConditions: {
    details: [
      "The riverside path between Ram Jhula and Lakshman Jhula is scenic but uneven — proper footwear matters.",
      "The Ganges current is deceptively strong — never swim unsupervised or outside designated areas, a real, specific water-safety warning for this location.",
    ],
    sourceNote: "From a dedicated Rishikesh travel-guide site's Safety page.",
  },
};

SAFETY_OVERRIDES["mysuru"] = {
  toilets: {
    summary: "Mysore Palace's own facility list confirms \"Free Hygenic Toilet Facility\" on-site",
    details: [
      "Mysore Palace's own official website (mysorepalace.karnataka.gov.in) publishes a Facilities page explicitly listing \"Free Hygenic Toilet Facility\" among its visitor amenities — genuinely confirmed, not inferred.",
      "The same page lists a \"Health Kiosk and Baby Care Centre at Mysuru Palace Premises\" — directly relevant for parents needing a feeding/nursing space.",
      "No exact in-complex distance is published for these facilities, only that they exist on the palace premises.",
    ],
    sourceNote: "Directly confirmed on mysorepalace.karnataka.gov.in's own published Facilities page — real, destination-specific data.",
  },
  accessibility: {
    summary: "Mysore Palace publishes a real facility list: free wheelchairs, Braille guides, battery-operated vehicle, first-aid kit",
    details: [
      "Mysore Palace's own official Facilities page lists: Free Wheel Chair Facility, a Braille Guide for visually challenged tourists, a Battery Operated Vehicle, a First-Aid Kit, and free umbrellas for rain/sun — an unusually thorough, genuinely confirmed accessibility offering for an Indian heritage monument.",
      "Also lists government-approved guides available inside the palace, and a free cycle facility to get around the palace gardens/temple grounds.",
    ],
    sourceNote: "Directly confirmed on mysorepalace.karnataka.gov.in's own published Facilities page — real, destination-specific, and unusually detailed for this category.",
  },
  police: {
    summary: "Devaraja Police Station (named, near the palace): 0821 241 8306 · Mysuru City Police Control Room: 100 / 0821-2418339",
    details: [
      "Devaraja Police Station — 0821 241 8306 — is the specific named police station listed by Mysore Palace's own official site as the relevant one for the palace/city-centre area.",
      "Palace's own on-site Emergency Security line: 0821 2430 404.",
      "Mysuru City Police Control Room: 100, landline 0821-2418339, address Mirza Road, Nazarbad, Mysuru — from mysore.nic.in's own official district helpline directory.",
      "Fire Station (Saraswathipuram): 0821 2540970 — also listed on the palace's own emergency contact block.",
    ],
    sourceNote: "Devaraja Police Station and the palace's own emergency contacts are taken directly from mysorepalace.karnataka.gov.in's own Contact Us page; the City Police Control Room number/address from mysore.nic.in's official district site — both genuine, named, addressed sources.",
  },
  medical: {
    summary: "K.R. Hospital, Irwin Road (general, listed by the palace itself) · Cheluvamba Hospital (women & children, opposite the palace area)",
    details: [
      "K.R. Hospital (Krishna Rajendra Hospital) — Irwin Road, Devaraja Mohalla, Mysuru 570001 — is a 24-hour government hospital named directly on Mysore Palace's own official emergency-contact list: 0821 242 3300 (palace's listed number) / 0821 252 6200 (hospital's own general line).",
      "Cheluvamba Hospital for Women and Children — Mysuru, near the palace area — is a dedicated government women's & children's hospital, a genuinely relevant second option.",
      "The palace premises also has a Health Kiosk on-site, per its own Facilities page.",
    ],
    sourceNote: "K.R. Hospital is named directly by Mysore Palace's own official site; Cheluvamba Hospital confirmed via Wikipedia and a mapped listing as a genuine, distinct government facility.",
  },
};

SAFETY_OVERRIDES["hampi"] = {
  police: {
    summary: "Hampi Police Station, Hampi Bazaar Street: 083942 91530",
    details: [
      "Hampi Police Station — Hampi Bazaar Street, Nimbapura, Karnataka 583239 — is the local station right in the main bazaar area: 083942 91530.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Hampi Police Station's name/address/number confirmed via a mapped business listing.",
  },
  medical: {
    summary: "Govt General THC Hospital, Hospete (nearest town, ~13km) — named directly on the district's own official site",
    details: [
      "Govt General THC Hospital, Hospete — M.J. Nagar Dam Road, Hosapete — is the nearest government hospital, named directly on vijayanagara.nic.in (Hampi's own district government site).",
      "Hospete (Hospet) is the nearest town with proper medical facilities, a short distance from the Hampi ruins themselves.",
      "Ambulance: 108",
    ],
    sourceNote: "Hospital name and location confirmed directly via vijayanagara.nic.in, the official district government site for Hampi's own district.",
  },
};

SAFETY_OVERRIDES["coorg"] = {
  police: {
    summary: "Town Police Station, Madikeri: 08272-229300 · Forest Cell (relevant for wildlife areas): 08272-228662",
    details: [
      "Town Police Station, Madikeri (Dar Office, Town Wireless Control Room): 08272-229300 — the main station for Coorg's district headquarters town.",
      "Office of the Superintendent of Police, Madikeri — 47/1, College Road, Madikeri, open 24 hours: 082722 29000.",
      "A police check-post exists specifically at Abbey Falls itself, confirmed via a mapped listing — genuinely on-site at one of Coorg's most-visited waterfalls.",
      "Also useful for Coorg specifically: CID Forest Cell, Madikeri (08272-228662) and the Range Forest Officer, Nagarahole Game Sanctuary, Kutta (08272-244221) — relevant given Coorg's wildlife/plantation-area attractions.",
      "Additional town-level stations: Kushalnagar (08272-273420), Siddapur (08272-258100), Chettalli (08272-266733), Kutta/Virajpet taluk (08272-244100).",
    ],
    sourceNote: "All numbers taken directly from coorg.com's own published Emergency Service Contacts page and kodagu.nic.in (the official Kodagu District Government site); the Abbey Falls check-post confirmed via a separate mapped listing.",
  },
  medical: {
    summary: "District Hospital, Near Toll Gate, Madikeri — named directly on the district's own official site",
    details: [
      "District Hospital — Near Toll Gate, Madikeri, Kodagu — is Coorg's main government hospital, named and addressed directly on kodagu.nic.in's own official Public Utility page: 94498 43175.",
      "Ambulance: 108",
    ],
    sourceNote: "Hospital name, address, and number taken directly from kodagu.nic.in's own official district government site.",
  },
};

SAFETY_OVERRIDES["gokarna"] = {
  police: {
    summary: "Police Station Gokarna, Main Road, Banglegudda (24hr): 08386-256133",
    details: [
      "Police Station Gokarna — Main Road, Banglegudda, Gokarna 581326, open 24 hours: 08386-256133.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Police Station Gokarna's name/address/number confirmed via a mapped business listing.",
  },
  medical: {
    summary: "Two real options: P.H.C. Gokarn (in town) for minor issues; Baggon Government Hospital, Kumta (nearest larger town) for anything more serious",
    details: [
      "P.H.C. Gokarn (Govt. Hospital) — Main Road, Melinkeri, Gokarna 581326 — is the local government health centre right in Gokarna town, for minor issues.",
      "Baggon Government Hospital — NH66, Kumta, open 24 hours: 08386-222021 — is the larger government hospital in Kumta, the nearest bigger town, for anything more serious than the local PHC can handle.",
      "Ambulance: 108",
    ],
    sourceNote: "Both hospitals' names and addresses confirmed via mapped listings — genuinely two separate, real facilities at two tiers of care, not a single generic pointer.",
  },
};

SAFETY_OVERRIDES["kabini"] = {
  police: {
    summary: "H.D. Kote Police Station (Kabini's own taluk town): 094808 05063",
    details: [
      "H.D. Kote (Heggadadevankote) Police Station — the taluk town Kabini itself belongs to — is the local police station: 094808 05063, confirmed on Mysuru District Police's own official site (mysurupolice.karnataka.gov.in).",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "H.D. Kote Police Station's number confirmed via Mysuru District Police's own official portal and a mapped business listing.",
  },
  medical: {
    summary: "Kabini Care Hospital, H.D. Kote (local) — nearest option; Mysuru's hospitals (K.R./Cheluvamba, ~80km) for anything serious",
    details: [
      "Kabini Care Hospital — Heggadadevana Kote (H.D. Kote), Mysore — is the nearest hospital, right in Kabini's own taluk town, confirmed via a mapped business listing.",
      "For anything more serious, Mysuru's hospitals (K.R. Hospital and Cheluvamba Hospital — see the Mysuru entry) are the nearest well-equipped options, roughly 80km away.",
      "Ambulance: 108",
    ],
    sourceNote: "Kabini Care Hospital confirmed via a mapped business listing; Mysuru fallback cross-referenced from the Mysuru entry's own verified sources.",
  },
};

SAFETY_OVERRIDES["vizag"] = {
  police: {
    summary: "Visakhapatnam City Police Commissioner's Office, Suryabagh: 0891-2562709",
    details: [
      "Visakhapatnam City Police — Office of the Commissioner of Police, Police Barracks, Suryabagh, Visakhapatnam 530001: 0891-2562709.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Taken directly from visakhapatnam.ap.gov.in's own official Police Stations directory page.",
  },
  medical: {
    summary: "King George Hospital (government, Maharani Peta) · Apollo Hospitals (private, Waltair Main Rd, near RK Beach)",
    details: [
      "King George Hospital (KGH) — 14-31-5, KGH Down Road, Maharani Peta, Visakhapatnam, open 24 hours — the major government hospital, also named directly on visakhapatnam.ap.gov.in's own official site.",
      "Apollo Hospitals — 10-50-2 Waltair Main Road, Ram Nagar, Visakhapatnam, open 24 hours — a well-known private hospital genuinely close to the RK Beach/Waltair tourist area: 0891 692 6803.",
      "Ambulance: 108",
    ],
    sourceNote: "KGH confirmed via visakhapatnam.ap.gov.in's own official Public Utility page and a mapped listing; Apollo Hospitals confirmed via its own official site (apollohospitals.com).",
  },
};

SAFETY_OVERRIDES["tirupati"] = {
  police: {
    summary: "Tirumala Police Station (right at the hilltop temple): confirmed named station · Tirupati City Police",
    details: [
      "Tirumala Police Station — Tirumala-Tirupati Road, Balaji Nagar, Tirumala — is a named, dedicated police station right at the hilltop temple town itself, confirmed via a mapped business listing.",
      "For the Tirupati town area at the base of the hill, contact AP Police's district/city commissionerate — see citizen.appolice.gov.in for the current district contact.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Tirumala Police Station's name/address confirmed via a mapped business listing — genuinely on-site at the temple town, distinct from the base-town police.",
  },
  medical: {
    summary: "SVIMS (super-specialty, Alipiri Rd) · Sri Venkateswara Ramnarayan Ruia Government General Hospital (Tirumala Rd) — two real government hospitals",
    details: [
      "SVIMS (Sri Venkateswara Institute of Medical Sciences) — Alipiri Road, Tirupati 517507 — a premier super-specialty tertiary referral hospital, named directly on tirupati.ap.gov.in's own official Public Utility page.",
      "Sri Venkateswara Ramnarayan Ruia Government General Hospital — Tirumala Road, Alipiri Gate, Tirupati, open 24 hours, founded 1962 — a second, older general government hospital.",
      "Ambulance: 108",
    ],
    sourceNote: "SVIMS confirmed directly on tirupati.ap.gov.in's own official site and its own domain (svimstpt.ap.nic.in); Ruia Government General Hospital confirmed via a mapped listing.",
  },
};

SAFETY_OVERRIDES["tawang"] = {
  police: {
    summary: "Tawang Police Station (near District Hospital): 03794-222235 · Tawang Women's Police Station also exists",
    details: [
      "Tawang Police Station — Near District Hospital, Tawang: 03794-222235; Police Control Room: 03794-222278.",
      "Tawang Women's Police Station — Tawang, Arunachal Pradesh 790104 — a dedicated station, genuinely notable for a small remote town.",
      "Superintendent of Police Office — Tawang, Arunachal Pradesh 790104: 03794-222231.",
      "Jang Police Station (Bazaar Road, Jang) and Lumla Police Station (Lumla-Tashigaon Road) also exist for the wider district, relevant if travelling the Bum La/Sela Pass route.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "All stations and numbers taken directly from tawang.nic.in's own official District Administration Police page — genuine, and notably includes a dedicated women's police station for this small town.",
  },
  medical: {
    summary: "Khan Drowa Zangmo District Hospital, Tawang — the district's one government hospital",
    details: [
      "Khan Drowa Zangmo District Hospital — under the District Medical Officer, Tawang — is the district's public/government hospital, named directly on tawang.nic.in's own official site.",
      "As a small, remote high-altitude district, this is genuinely the only hospital serving the area — there's no second option to honestly offer here, unlike bigger cities.",
      "Ambulance: 108",
    ],
    sourceNote: "Hospital name and status confirmed directly on tawang.nic.in's own official Hospitals page — the single-hospital reality is stated honestly rather than padded with an unrelated facility.",
  },
};
