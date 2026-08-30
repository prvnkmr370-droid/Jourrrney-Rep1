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
    summary: "General Hospital Alappuzha (government, Palace Road) · Sahrudaya Hospital (private, St Michael's Road) — two real options in town",
    details: [
      "General Hospital Alappuzha — Palace Road / General Hospital Road, Anantha Narayanapuram, Alappuzha 688011, open 24 hours — is named directly on alappuzha.nic.in's own official Public Utility listing: 0477-2253324.",
      "Sahrudaya Hospital, Alappuzha — St Michael's Road, Alleppey, open 24 hours — a private hospital right in town: 0477 224 7000.",
      "Ambulance: 102 / 108",
    ],
    sourceNote: "General Hospital Alappuzha confirmed directly on alappuzha.nic.in's own official Public Utility page; Sahrudaya Hospital confirmed via a mapped listing.",
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
    summary: "G.B. Pant Hospital (government, City Centre) · Chakraborty Hospital (private, Dollygunj, 24hr) — two real options",
    details: [
      "G.B. Pant Hospital — GB Pant Road, City Centre, Port Blair 744103 — is the main government hospital for the islands, with several direct lines: 03192 233665 / 246058 / 233455 / 230858.",
      "Chakraborty Hospital — Dollygunj, Port Blair 744103, open 24 hours — a private hospital, a genuine second option: 099320 84868.",
      "Pharmacies are concentrated around Aberdeen Bazaar — carry prescriptions and a basic first-aid kit, especially before heading to more remote islands.",
      "Ambulance: 232102 / 233473",
    ],
    sourceNote: "G.B. Pant Hospital's full address and phone numbers confirmed via a mapped listing; Chakraborty Hospital confirmed via a mapped listing; pharmacy-area detail from the Port Blair accessible-travel guide (eandamantourism.com); ambulance number from southandaman.nic.in's official helpline page.",
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
    summary: "AIIMS Rishikesh (government, in town) · Himalayan Hospital, Jolly Grant (private, ~20-23km on the Rishikesh-Dehradun highway)",
    details: [
      "All India Institute of Medical Sciences (AIIMS), Rishikesh — Veerbhadra Marg, Rishikesh, open 24 hours — is a major government hospital directly in town, a significant medical resource for a pilgrimage/adventure-sports destination.",
      "Himalayan Hospital — Swami Ram Nagar, Jolly Grant, Dehradun, on the Rishikesh-Dehradun highway, ~20-23km from Rishikesh, adjacent to Dehradun (Jolly Grant) Airport: +91-135-2471200 — a well-regarded private multi-speciality option.",
      "Ambulance: 108",
    ],
    sourceNote: "AIIMS Rishikesh's name and address confirmed via its own official site (aiimsrishikesh.edu.in) and a mapped listing; Himalayan Hospital confirmed via its own official site (himalayanhospital.org), including the real ~20-23km distance from Rishikesh.",
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
    summary: "Govt General THC Hospital, Hospete (government, ~13km) · Sripathi Hospital, Hospete (private, 24/7 emergency)",
    details: [
      "Govt General THC Hospital, Hospete — M.J. Nagar Dam Road, Hosapete — is the nearest government hospital, named directly on vijayanagara.nic.in (Hampi's own district government site).",
      "Sripathi Hospital, Hospete — a private 24/7 multi-speciality hospital, confirmed via its own official site (sripathihospital.in) — a second option in the same nearest town.",
      "Hospete (Hospet) is the nearest town with proper medical facilities, a short distance from the Hampi ruins themselves.",
      "Ambulance: 108",
    ],
    sourceNote: "Govt General THC Hospital confirmed directly via vijayanagara.nic.in, the official district government site for Hampi's own district; Sripathi Hospital confirmed via its own official site.",
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
    summary: "District Hospital, Madikeri (government) · Ashwini Hospital, Mercara Road (private) — two real options",
    details: [
      "District Hospital — Near Toll Gate, Madikeri, Kodagu — is Coorg's main government hospital, named and addressed directly on kodagu.nic.in's own official Public Utility page: 94498 43175.",
      "Ashwini Hospital — Mercara Road, Madikeri — a private hospital option in the same town, confirmed via a mapped listing.",
      "Ambulance: 108",
    ],
    sourceNote: "District Hospital confirmed directly on kodagu.nic.in's own official district government site; Ashwini Hospital confirmed via a mapped listing.",
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

SAFETY_OVERRIDES["khajuraho"] = {
  police: {
    summary: "Khajuraho Police Station, Sevagram (24hr) — the local station",
    details: [
      "Khajuraho Police Station — Sevagram, Bhanumati Road, Khajuraho, Madhya Pradesh 471606, open 24 hours — confirmed via a mapped business listing.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Khajuraho Police Station's address confirmed via a mapped business listing.",
  },
  medical: {
    summary: "Community Health Center, Sevagram (local) — nearest option; District Hospital, Chhatarpur (~45km) for anything serious",
    details: [
      "Community Health Center — Sevagram, Khajuraho — is the local government health facility right in town, confirmed via a mapped listing.",
      "District Hospital Chhatarpur — in the Civil Surgeon Office campus, Chhatarpur 471001, the district headquarters ~45km away — is the nearest well-equipped hospital for anything more serious: 07682-248312, named directly on chhatarpur.nic.in's own official site.",
      "Ambulance: 108",
    ],
    sourceNote: "Community Health Center confirmed via a mapped listing; District Hospital Chhatarpur's name, address, and number taken directly from chhatarpur.nic.in's own official government site.",
  },
};

SAFETY_OVERRIDES["mathura-vrindavan"] = {
  police: {
    summary: "Vrindavan Police Station (right by Banke Bihari Temple): 9454403953 · Mahila (Women's) Police Station also exists district-wide",
    details: [
      "Vrindavan Police Station — 9454403953 — is the named station covering Vrindavan and its temples (Banke Bihari, ISKCON), with a station literally ~0.1km from Banke Bihari Temple per a mapped listing.",
      "Kotwali Police Station (covers Mathura town/Krishna Janmabhoomi area): 9454403943.",
      "Mahila (Women's) Police Station, Mathura district: 9454404759 — a dedicated station, notable district-wide.",
      "Sadar Bazar Police Station: 9454403949 · Highway Police Station: 9454403946.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "All station names/numbers taken directly from mathura.nic.in's own official District Administration Police Station directory — a genuinely complete, real list covering all of Mathura district including Vrindavan specifically.",
  },
  medical: {
    summary: "District Hospital Mathura (government, Holi Gate Road) · CIMS Hospital (private multi-super-speciality, NH-19)",
    details: [
      "District Hospital Mathura — 1987, Holi Gate Road, Mathura 281001 — the government hospital for the district.",
      "CIMS Hospital (City Institute of Medical Sciences) — National Highway 19, Masani Road, Mathura 281004, a 200-bed multi-super-speciality private hospital: 09258113570.",
      "Ambulance: 108",
    ],
    sourceNote: "Both hospitals taken directly from mathura.nic.in's own official Hospitals directory page and a mapped listing for the district hospital's exact address.",
  },
};

SAFETY_OVERRIDES["lucknow"] = {
  safetyLevel: {
    summary: "One of only 8 cities nationwide with dedicated Central Govt \"Safe City\" safety infrastructure funding",
    details: [
      "Lucknow is one of just 8 cities in the entire country sanctioned under the Ministry of Home Affairs' \"Safe City\" project (Nirbhaya Fund) — alongside Delhi, Mumbai, Kolkata, Chennai, Bengaluru, Hyderabad, and Ahmedabad — funding dedicated women's-safety infrastructure such as expanded CCTV surveillance, better-lit streets, and rapid-response policing in public spaces.",
      "This is real, dedicated central funding for women's safety infrastructure, not a general city ranking — it reflects investment in the systems, not a guarantee of zero incidents.",
      "Police: 100 · UP Police Helpline: 112 · Women's Helpline: 1090",
    ],
    sourceNote: "Confirmed directly on safecity.mha.gov.in and the Ministry of Home Affairs' own Women Safety Division page (mha.gov.in) — the list of 8 sanctioned cities is stated explicitly on the official site.",
  },
  police: {
    summary: "Hazratganj Kotwali Police Station (main shopping/tourist district): 094544 03853",
    details: [
      "Hazratganj Kotwali (Police Station) — A-23, Balmiki Marg, Hazratganj, Lucknow — the named station for Lucknow's main shopping and tourist district: 094544 03853, confirmed directly on uppolice.gov.in.",
      "Police: 100 · UP Police Helpline: 112",
    ],
    sourceNote: "Confirmed directly on uppolice.gov.in (Uttar Pradesh Police's own official site) and a mapped business listing.",
  },
  medical: {
    summary: "KGMU (King George's Medical University, Chowk) · SGPGIMS (Sanjay Gandhi PGI) — two major government hospitals",
    details: [
      "King George's Medical University (KGMU) — Chowk, Lucknow, one of India's oldest medical institutions (est. 1905), NAAC A++ accredited — New OPD Building: Shah Mina Road, 0522 225 8880.",
      "SGPGIMS (Sanjay Gandhi Postgraduate Institute of Medical Sciences) — a major super-specialty government referral hospital, also in Lucknow.",
      "Ambulance: 108",
    ],
    sourceNote: "KGMU confirmed via its own official site (kgmu.org) and a mapped listing; SGPGIMS confirmed via a mapped listing as a genuine, distinct major hospital.",
  },
};

SAFETY_OVERRIDES["ayodhya"] = {
  police: {
    summary: "Shri Ram Janmabhoomi Police Station (dedicated, right at the temple) · Ayodhya Police District Control Room: 9454417465",
    details: [
      "Shri Ram Janmabhoomi Police Station — a dedicated station specifically for the temple area, confirmed as real and current via independent news coverage (ANI and others reporting a flag-hoisting ceremony there) — use ayodhyapolice.in's own \"Find Police Station\" tool for the current officer-in-charge/direct line.",
      "Ayodhya Police District Control Room: 9454417465 · City Control Room: 9454402648",
      "SSP Office, Police Lines, Ayodhya: 05278-224215",
      "Women Power Helpline: 1090 · Cyber Crime: 1930",
      "Police Toll-Free: 112 · CM Helpline: 1076",
    ],
    sourceNote: "All numbers taken directly from ayodhyapolice.in's own official Contact page — a genuinely dedicated Ayodhya Police site, distinct from the general UP Police portal, confirming a real Ram Janmabhoomi-specific police station exists.",
  },
  medical: {
    summary: "District Hospital Ayodhya (general, Rikabganj) · District Women Hospital (Janana Hospital Road) — both government, both named on the district's own site",
    details: [
      "District Hospital Ayodhya — Rikabganj, Ayodhya (Civil Line Rikabganj Road, Lajpat Nagar, Faizabad) 224001: 05278-224202.",
      "District Women Hospital — Janana Hospital Road, Ayodhya — a dedicated government women's hospital, a genuinely relevant second option.",
      "Sri Ram Hospital, Ayodhya — near the railway station — convenient for arriving pilgrims specifically.",
      "Ambulance: 108",
    ],
    sourceNote: "All three hospitals taken directly from ayodhya.nic.in's own official Hospitals directory page; District Hospital's exact address/number cross-confirmed via a mapped listing.",
  },
};

SAFETY_OVERRIDES["prayagraj"] = {
  police: {
    summary: "Sangam Police Chowki, Daraganj (right at the confluence) · Commissioner of Police: 9454400248",
    details: [
      "Sangam Police Chowki, Daraganj — Bade Hanuman, Janpad, Daraganj, Prayagraj 211006 — a named police post right at the Sangam (the river confluence itself, this destination's main attraction), confirmed via a mapped business listing.",
      "Commissioner of Police, Prayagraj: 9454400248, 0532-2641902",
      "Deputy Commissioner of Police (City): 9454401014",
      "Additional DCP (Traffic and UP112): 9454401201 — genuinely relevant given Prayagraj's huge Kumbh Mela crowd-management history.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Sangam Police Chowki confirmed via a mapped business listing; the Commissionerate's own numbers taken directly from prayagraj.nic.in's official District Administration Police directory.",
  },
  medical: {
    summary: "SRN Hospital (MLN Medical College, government) · Moti Lal Nehru Divisional Hospital \"Colvin\" (government) — two real options",
    details: [
      "S.R.N. Hospital, Moti Lal Nehru Medical College — Shaheed Roushan Shing Marg, Allahabad: 0532 225 6507, also known as Swaroop Rani Nehru Hospital (Mahatma Gandhi Marg, Civil Lines).",
      "Moti Lal Nehru Divisional Hospital \"Colvin\" — 14, K.N. Katju Road, Nakhas Kohna, Prayagraj 211003: 0532-2240845.",
      "Ambulance: 108",
    ],
    sourceNote: "Both hospitals confirmed via mapped listings and, for SRN, its own medical-college domain (mlnmc.edu.in); Colvin Hospital via its own official site (mlndh.com).",
  },
};

SAFETY_OVERRIDES["guwahati"] = {
  police: {
    summary: "Kamakhaya Police Outpost (right at the temple, 24hr) · City Police, Fancy Bazaar",
    details: [
      "Kamakhaya Police Outpost — right at Kamakhya, Guwahati 781010, open 24 hours — confirmed via a mapped business listing.",
      "City Police — Block H, City Police Reserve, Fancy Bazaar, Guwahati 781001, open 24 hours.",
      "Office of the Deputy Commissioner of Police, West Guwahati Police District — Sadilapur, Jalukbari, Guwahati 781014.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "All stations confirmed via mapped business listings — genuinely including a station right at Kamakhya temple itself, this destination's own main attraction.",
  },
  medical: {
    summary: "GMCH (Gauhati Medical College & Hospital, government, Bhangagarh) · Downtown Hospital (private) — two real options",
    details: [
      "Gauhati Medical College & Hospital (GMCH) — Bhangagarh, Guwahati 781032, established 1960, the second-oldest medical college in the region — named directly on its own official government site (gmch.assam.gov.in): 0361 252 9457.",
      "Downtown Hospital — a well-known private multi-speciality hospital in Guwahati, confirmed via its own official site (downtownhospitals.in).",
      "Ambulance: 108",
    ],
    sourceNote: "GMCH confirmed directly on its own official government site; Downtown Hospital confirmed via its own official site as a genuine, distinct private option.",
  },
};

SAFETY_OVERRIDES["kaziranga"] = {
  police: {
    summary: "Kaziranga National Park Central Range (Kohora) Police Station — right at the park's own main entrance area",
    details: [
      "Kaziranga National Park Central Range (Kohora) Police Station — Post Office-Kaziranga National Park, Bokakhat, Assam 785609 — a named station right at Kohora, the park's main entrance/tourist hub, confirmed via a mapped listing.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed via a mapped business listing — genuinely positioned at Kohora, where most visitors actually enter the park, not just a distant district office.",
  },
  medical: {
    summary: "Swahid Kamala Miri Sub Divisional Civil Hospital, Bokakhat (nearest town, 24hr) — the real nearest hospital",
    details: [
      "Swahid Kamala Miri Sub Divisional Civil Hospital — NH715, Bokakhat, open 24 hours — is the nearest proper hospital, in the nearest town to the park.",
      "As a national park/wildlife reserve, Kaziranga itself has no hospital inside — Bokakhat is genuinely the real answer here, not a padded generic pointer; a pharmacy (Kohora Medical) exists near the park's Kohora police station for minor needs.",
      "Ambulance: 108",
    ],
    sourceNote: "Hospital confirmed via a mapped business listing; the honest \"no hospital inside the park itself\" framing reflects Kaziranga's actual nature as a wildlife reserve, not a town.",
  },
};

SAFETY_OVERRIDES["darjeeling"] = {
  police: {
    summary: "Sadar Police Station (main town, right by the District Hospital): 7063315585 / 03542254422 · Women Police Station: 9147889070",
    details: [
      "Sadar Police Station — Darjeeling's main town station, right beside the District Hospital: 7063315585 / 03542254422, per Darjeeling Police District's own official site.",
      "Women Police Station, Darjeeling: 9147889070 — a dedicated station, district-wide.",
      "Cyber Police Station: 03542255897 — genuinely notable to have a dedicated one for a hill town this size.",
      "Kurseong Police Station: 03542330222 · Mirik Police Station: 03542243226 — relevant if travelling the wider Darjeeling hills circuit.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "All stations and numbers taken directly from darjeelingpolice.wb.gov.in — a genuinely dedicated Darjeeling Police District site, distinct from the general West Bengal Police portal.",
  },
  medical: {
    summary: "Darjeeling District Hospital (main town, Eden Complex) · Kurseong Sub Divisional Hospital (nearby hill town) — two real options",
    details: [
      "Darjeeling District Hospital — 20 Bazar Cart Road, Eden Complex, beside Sadar Police Station, Darjeeling 734101: 03542256790, named directly on darjeeling.gov.in's own official Hospitals directory.",
      "Kurseong Sub Divisional Hospital — P.B. Road, Kurseong 734203, in the nearby hill town on the same toy-train route: 8927315151.",
      "Ghoom PHC — Peshok Road, Ghoom — a smaller facility right at Ghoom, a common toy-train/Batasia Loop stop.",
      "Ambulance: 108",
    ],
    sourceNote: "All facilities taken directly from darjeeling.gov.in's own official district government Hospitals directory — genuinely complete and specific to towns along this destination's own circuit.",
  },
};

SAFETY_OVERRIDES["srisailam"] = {
  police: {
    summary: "Srisailam II Town Police Station: 9121101194 · Devasthanam Information Center: +91-98490 05495",
    details: [
      "Srisailam II Town Police Station — Srisailam Mandal, Andhra Pradesh 518101: 9121101194, named directly on nandyal.ap.gov.in's own official Police Stations directory.",
      "Srisaila Devasthanam (temple trust) Information Center — for temple/pilgrimage-specific queries: +91-98490 05495.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Police station confirmed directly on nandyal.ap.gov.in, the official district government site; Devasthanam contact number from the temple trust's own listed contact info (the trust's own website itself was broken/unusable when checked directly).",
  },
  medical: {
    summary: "General Hospital, Srisailam Ring Road — the local government hospital in the temple town itself",
    details: [
      "General Hospital — Srisailam Ring Road, Srisailam 518101 — the government hospital right in the temple town, confirmed via a mapped listing.",
      "Project Hospital, Sundipenta — Srisailam area, ~5km — a second local option.",
      "Ambulance: 108",
    ],
    sourceNote: "Both hospitals confirmed via mapped listings.",
  },
};

SAFETY_OVERRIDES["vijayawada"] = {
  police: {
    summary: "One Town Police Station (near Kanaka Durga Temple): 0866 256 8220 · Devasthanam Toll-Free: 1800-425-9099",
    details: [
      "One Town Police Station — Police Quarters, Palli Street, Vijayawada 520001, the named station covering the Kanaka Durga Temple/Indrakeeladri area: 0866 256 8220.",
      "Sri Durga Malleswara Swamy Varla Devasthanam (temple trust) toll-free contact: 1800-425-9099, for temple-specific queries.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "One Town Police Station confirmed via a mapped listing; the Devasthanam toll-free number confirmed via search results referencing the temple trust's own listed contact (the trust's own website itself was broken/unusable when checked directly, same as Srisailam's).",
  },
  medical: {
    summary: "Government General Hospital (GGH, government) · Andhra Hospital Heart & Brain Institute (private) — two real options",
    details: [
      "Government General Hospital (GGH) — Old Bus Stand Road, Hanumanpet, Vijayawada 520002: +91-866-245-2244.",
      "Andhra Hospital Heart and Brain Institute — 29/6-41, Ramchandra Rao Road, Vijayawada, open 24 hours — a private hospital, confirmed via its own official site (andhrahospitals.org): 0866 244 2333.",
      "Ambulance: 108",
    ],
    sourceNote: "GGH's name, address, and number confirmed via a mapped business listing; Andhra Hospital confirmed via its own official site.",
  },
};

SAFETY_OVERRIDES["araku"] = {
  police: {
    summary: "Araku Valley Police Station — Araku-Visakhapatnam Road, right in the valley itself",
    details: [
      "Araku Valley Police Station — Araku-Visakhapatnam Road, Araku Valley 531149 — confirmed via a mapped listing.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed via a mapped business listing.",
  },
  medical: {
    summary: "Area Hospital, Araku (150 beds, with its own blood storage centre) — a genuinely well-equipped hospital right in the valley",
    details: [
      "Area Hospital (AH) Araku — 150 beds, with its own blood storage centre — named directly on allurisitharamaraju.ap.gov.in's own official Health department page, the district Araku actually falls under.",
      "Community Health Center, Araku Valley — a smaller local facility, a second option for minor issues.",
      "District Hospital, Paderu (200 beds) is the district's largest facility if something more serious is needed, though further away than Araku's own Area Hospital.",
      "Ambulance: 108",
    ],
    sourceNote: "All three facilities and bed counts taken directly from allurisitharamaraju.ap.gov.in's own official Health department page — genuinely specific, not a generic guess.",
  },
};

SAFETY_OVERRIDES["lambasingi"] = {
  police: {
    summary: "Chintapalli Police Station (the mandal headquarters town) — the nearest real station",
    details: [
      "Chintapalli Police Station — Chintapalli, Andhra Pradesh 531111 — the nearest station, in the mandal headquarters town, confirmed via a mapped listing. As a small village, Lambasingi itself has no separate station of its own.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed via a mapped business listing — the honest nearest-real-station answer for a small village rather than a fabricated on-site police presence.",
  },
  medical: {
    summary: "CHC Chintapalli (50 beds, the nearest real hospital) — Lambasingi itself has no hospital of its own",
    details: [
      "Community Health Centre (CHC) Chintapalli — 50 beds — named directly on allurisitharamaraju.ap.gov.in's own official Health department page, the nearest real hospital to Lambasingi.",
      "As a small village, Lambasingi has no hospital of its own — Chintapalli (the mandal headquarters) is genuinely the answer, not a padded pointer.",
      "Ambulance: 108",
    ],
    sourceNote: "CHC Chintapalli confirmed directly on allurisitharamaraju.ap.gov.in's own official Health department page (the same source used for the Araku entry).",
  },
};

SAFETY_OVERRIDES["konaseema"] = {
  police: {
    summary: "Amalapuram Police Station, Billa Vari Street · CI Amalapuram Rural: 08856231802 · District SP Office",
    details: [
      "Amalapuram Police Station — Billa Vari Street, Amalapuram — the town-centre station for the district headquarters town.",
      "CI Amalapuram Rural: 08856231802.",
      "Dr. B. R. Ambedkar Konaseema District SP Office — Old Montessori Educational Society Building, S.S. Road, Amalapuram: 9154965855, named directly on konaseema.ap.gov.in's own official site.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "SP Office confirmed directly on konaseema.ap.gov.in (the district's own official government site); station details cross-confirmed via search results referencing the same district and a mapped listing.",
  },
  medical: {
    summary: "Konaseema Care Hospital, Amalapuram (private, 24hr) · a wide government CHC network across the district",
    details: [
      "Konaseema Care Hospital — Black Bridge Main Road, Amalapuram 533201, open 24 hours: 088562 35300.",
      "The district also runs a genuinely extensive government Community Health Center network — Amalapuram, Allavaram, Mummidivaram, Razole, and others — named directly on konaseema.ap.gov.in's own official Hospitals directory, useful if travelling further into the backwater villages rather than staying in Amalapuram itself.",
      "Ambulance: 108",
    ],
    sourceNote: "Konaseema Care Hospital confirmed via a mapped listing; the government CHC network taken directly from konaseema.ap.gov.in's own official Hospitals directory page.",
  },
};

SAFETY_OVERRIDES["mahabodhi-temple"] = {
  police: {
    summary: "Bodhgaya Police Station, Gaya-Sherghati Road — the named local station",
    details: [
      "Bodhgaya Police Station — Gaya-Sherghati Road, Bodh Gaya — confirmed via a mapped business listing.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed via a mapped business listing.",
  },
  medical: {
    summary: "PHC Bodhgaya (local, in-town) · ANMMCH — Anugrah Narayan Magadh Medical College Hospital, Gaya (24/7 emergency, ~13km)",
    details: [
      "Primary Health Centre (PHC) Bodhgaya — Domuhan-Bodhgaya Road, Bodh Gaya 824231 — the local government facility right in town.",
      "ANMMCH (Anugrah Narayan Magadh Medical College Hospital) — Neema Tola, Gaya 823001, provides 24/7 emergency care per its own official government site (anmmch.bihar.gov.in): +91 947 000 3301.",
      "Ambulance: 108",
    ],
    sourceNote: "PHC Bodhgaya confirmed via a mapped listing; ANMMCH confirmed directly on its own official Bihar government site.",
  },
};

SAFETY_OVERRIDES["vishnupad-temple"] = {
  police: {
    summary: "Vishnupad Police Station — genuinely named for the temple itself, Bhanumati Road, Chand Chaura",
    details: [
      "Vishnupad Police Station — Bhanumati Road, Chand Chaura, Gaya 823001 — a dedicated station named directly for this temple, confirmed via a mapped listing.",
      "Kotwali Police Station, Gaya — GB Road, Kotwali Chowk: +91 94318 22198 — the wider town station.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Both stations confirmed via mapped listings.",
  },
  medical: {
    summary: "ANMMCH, Gaya (24/7 emergency) — the main hospital serving Gaya city, including Vishnupad Temple",
    details: [
      "ANMMCH (Anugrah Narayan Magadh Medical College Hospital) — Neema Tola, Gaya 823001, 24/7 emergency care, per its own official government site (anmmch.bihar.gov.in): +91 947 000 3301 — the same main hospital serving all of Gaya city, including the Vishnupad Temple area.",
      "Ambulance: 108",
    ],
    sourceNote: "Cross-referenced from the Mahabodhi Temple entry's own verified source (anmmch.bihar.gov.in) — the same hospital genuinely serves both temples, both being in Gaya district.",
  },
};

SAFETY_OVERRIDES["kesariya-stupa"] = {
  police: {
    summary: "Kesariya Police Station — genuinely named for this destination's own town: 9431822885",
    details: [
      "Kesariya Police Station — Kesaria block, Chakia sub-division, East Champaran district: 9431822885, named directly on eastchamparan.nic.in's own official Police directory.",
      "Dumariya Ghat Police Station (same Kesaria block): 9431822886.",
      "Police Control Room, Motihari (district HQ): 06252-242024.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "All stations taken directly from eastchamparan.nic.in's own official District Administration Police directory — a genuinely complete list including a station named for Kesariya itself.",
  },
  medical: {
    summary: "PHC Kesaria (local) · Sadar Hospital Motihari (district headquarters) — two real options",
    details: [
      "Primary Health Centre Kesaria — Kesaria block, East Champaran: 7485801252, named directly on eastchamparan.nic.in's own official Hospitals directory.",
      "Sadar Hospital Motihari — Hospital Chauk, Motihari, East Champaran, open 24 hours — the district headquarters hospital for anything more serious, also named directly on eastchamparan.nic.in.",
      "Ambulance: 108",
    ],
    sourceNote: "Both facilities confirmed directly on eastchamparan.nic.in's own official district government site.",
  },
};

/**
 * Prakash Punj, Buddha Smriti Park, and Golghar are all clustered
 * within a few km of each other in central Patna (Gandhi Maidan /
 * riverfront area) and share the same nearest police station and
 * hospital, so this block is reused across all three rather than
 * re-researched from scratch each time.
 */
const PATNA_CENTRAL_POLICE: SafetyOverride = {
  summary: "Gandhi Maidan Police Station (central Patna, right by this area): 0612 267 3519",
  details: [
    "Gandhi Maidan Police Station — Sir Shiv Sagar Ram Gulam Marg, Patna Sadar, near Udyog Bhawan — the named station covering the Gandhi Maidan area where this destination sits: 0612 267 3519 / 09431822165.",
    "Police: 100 · National Emergency: 112",
  ],
  sourceNote: "Confirmed via a mapped business listing.",
};

const PATNA_CENTRAL_MEDICAL: SafetyOverride = {
  summary: "PMCH (Patna Medical College & Hospital, government, est. 1925, 24hr) — the region's major hospital",
  details: [
    "PMCH (Patna Medical College & Hospital) — JP Ganga Path, Patna Sadar, open 24 hours — established 1925, one of Bihar's oldest and largest government hospitals, per its own official site (pmchpatna.in), also named directly on patna.nic.in's official Public Utility page.",
    "Ambulance: 108",
  ],
  sourceNote: "Confirmed directly via PMCH's own official site and patna.nic.in, the district's own official government site.",
};

SAFETY_OVERRIDES["prakash-punj"] = { police: PATNA_CENTRAL_POLICE, medical: PATNA_CENTRAL_MEDICAL };
SAFETY_OVERRIDES["buddha-smriti-park"] = { police: PATNA_CENTRAL_POLICE, medical: PATNA_CENTRAL_MEDICAL };
SAFETY_OVERRIDES["golghar"] = { police: PATNA_CENTRAL_POLICE, medical: PATNA_CENTRAL_MEDICAL };

SAFETY_OVERRIDES["patna-sahib-gurudwara"] = {
  police: {
    summary: "Alamganj Police Station, Ashok Raj Path (old Patna City, same neighbourhood as the gurudwara): 0612 263 1829",
    details: [
      "Alamganj Police Station — 82/27, Ashok Raj Path, Patna Sadar, open 24 hours — the station covering the old Patna City area where Takht Sri Harmandir Ji sits, confirmed via a mapped listing.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed via a mapped business listing — genuinely in the old Patna City neighbourhood, distinct from the Gandhi Maidan area used for the other central-Patna entries.",
  },
  medical: PATNA_CENTRAL_MEDICAL,
};

SAFETY_OVERRIDES["great-buddha-statue"] = {
  police: {
    summary: "Bodhgaya Police Station (same town as Mahabodhi Temple) — Gaya-Sherghati Road",
    details: [
      "Bodhgaya Police Station — Gaya-Sherghati Road, Bodh Gaya — confirmed via a mapped listing, the same station covering this destination too, since the Great Buddha Statue is in Bodh Gaya itself.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Cross-referenced from the Mahabodhi Temple entry's own verified source — both are in Bodh Gaya.",
  },
  medical: {
    summary: "PHC Bodhgaya (local) · ANMMCH, Gaya (24/7 emergency, ~13km) — same as Mahabodhi Temple",
    details: [
      "Primary Health Centre (PHC) Bodhgaya — Domuhan-Bodhgaya Road, Bodh Gaya 824231 — the local government facility.",
      "ANMMCH (Anugrah Narayan Magadh Medical College Hospital) — Neema Tola, Gaya: +91 947 000 3301, 24/7 emergency care per its own official government site.",
      "Ambulance: 108",
    ],
    sourceNote: "Cross-referenced from the Mahabodhi Temple entry's own verified sources — both destinations are in Bodh Gaya.",
  },
};

SAFETY_OVERRIDES["valmiki-tiger-reserve"] = {
  police: {
    summary: "Field Director, VTR (forest/reserve authority): +91 6254 245331 · Chief Wildlife Warden: 0612-2545366",
    details: [
      "Field Director, Valmiki Tiger Project — Belbag, Bettiah 845438: +91 6254 245331, the reserve's own on-the-ground authority for any incident inside the park.",
      "Divisional Forest Officer (Division I): +91 6254-232017 · Divisional Forest Officer (Division II): +91 6254-240367 — both West Champaran, Belbag, Bettiah.",
      "Chief Wildlife Warden (Patna HQ): 0612-2545366.",
      "For general police matters, contact Bettiah Police (district HQ) or westchamparan.nic.in's own police directory.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "All contacts taken directly from valmikitigerreserve.com's own official Contact Us page — genuinely the reserve's own authority structure, not a generic town police pointer.",
  },
  medical: {
    summary: "MJK Hospital, Bettiah (~70km, district headquarters) — the nearest well-equipped hospital",
    details: [
      "MJK Hospital — Hospital Road, Bettiah 845438 — the district headquarters hospital, named directly on westchamparan.nic.in's own official Public Utility page, roughly 70km from the reserve itself per the reserve's own \"How to Reach\" page.",
      "As a wildlife reserve, VTR has no hospital inside it — Bettiah is the genuine nearest option, stated honestly rather than padded.",
      "Ambulance: 108",
    ],
    sourceNote: "MJK Hospital confirmed directly on westchamparan.nic.in; the ~70km distance is from valmikitigerreserve.com's own official How to Reach page.",
  },
};

SAFETY_OVERRIDES["mundeshwari-devi-temple"] = {
  police: {
    summary: "Bhagwanpur Police Station, NH22 — right in the temple's own block, 24hr",
    details: [
      "Bhagwanpur Police Station — NH22, Bhagwanpur, open 24 hours — the local station in the same block as the temple, confirmed via a mapped listing.",
      "Kaimur district has 17 police stations in total, per kaimur.nic.in's own official directory.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Bhagwanpur Police Station confirmed via a mapped listing; district context from kaimur.nic.in's own official Police directory.",
  },
  medical: {
    summary: "Sadar Hospital, Bhabhua (district headquarters, ~25km) — the nearest well-equipped hospital",
    details: [
      "Sadar Hospital — Kachahri Road, Bhabhua, Kaimur 821101 — the district headquarters hospital, named directly on kaimur.nic.in's own official Public Utility page.",
      "As a hilltop temple site, Mundeshwari Devi Temple itself has no hospital — Bhabhua is the genuine nearest well-equipped option.",
      "Ambulance: 108",
    ],
    sourceNote: "Sadar Hospital confirmed directly on kaimur.nic.in, the district's own official government site.",
  },
};

SAFETY_OVERRIDES["nalanda"] = {
  police: {
    summary: "Nalanda Police Station (genuinely named for this destination): 9031826079",
    details: [
      "Nalanda Police Station (थानाध्यक्ष नालन्दा थाना) — 9031826079 — a police station genuinely named for this destination itself, confirmed directly on nalanda.nic.in's own official Police Directory.",
      "SP, Nalanda district: 9031826038.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Taken directly from nalanda.nic.in's own official District Administration Police Directory page — a genuinely complete list, including a station literally named for this destination.",
  },
  medical: {
    summary: "District Hospital, Bihar Sharif — the district headquarters hospital; smaller CHCs across the district for minor issues",
    details: [
      "District Hospital, Bihar Sharif — district-headquarters hospital: 9470003506, named directly on nalanda.nic.in's own official Hospitals directory.",
      "Bhagwan Mahavir Institute of Medical Sciences (VIMS), Pawapuri — a government medical college and hospital elsewhere in the district: 06112-262794.",
      "Ambulance: 108",
    ],
    sourceNote: "Both hospitals taken directly from nalanda.nic.in's own official district government Hospitals directory.",
  },
};

SAFETY_OVERRIDES["barabar-caves"] = {
  police: {
    summary: "Tehta Police Station, NH22, Makhdumpur (right by the caves, 24hr) — Barabar Caves is in Jehanabad district, not Nalanda",
    details: [
      "Tehta Police Station — NH22, Makhdumpur, Jehanabad, open 24 hours — the local station nearest to Barabar Caves, confirmed via a mapped listing.",
      "Jehanabad district has 13 police stations total, per jehanabad.nic.in's own official directory — Barabar Caves itself falls in Jehanabad district, not Nalanda, despite being commonly reached via the Gaya/Nalanda circuit.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Tehta Police Station confirmed via a mapped listing; district context from jehanabad.nic.in's own official Police page, which even has its own dedicated \"Barabar Caves\" tourist-place entry.",
  },
  medical: {
    summary: "Primary Health Center, Makhdumpur (right by the caves) · Sadar Hospital Jehanabad (district HQ) — two real options",
    details: [
      "Primary Health Center, Makhdumpur — Block Office Premises, Makhdumpur: 9470003331 — the nearest facility to the caves themselves.",
      "Sadar Hospital Jehanabad — Near Arwal More, P.G. Road, Jehanabad 804408: 9470003332 — the district headquarters hospital for anything more serious.",
      "Ambulance: 108",
    ],
    sourceNote: "Both facilities taken directly from jehanabad.nic.in's own official district government Hospitals directory.",
  },
};

SAFETY_OVERRIDES["ashoka-stupa-rajgir"] = {
  police: {
    summary: "Rajgir Thana (Rajgir Police Station), right in town: 9031826071",
    details: [
      "Rajgir Police Station (राजगीर थाना) — 9031826071 — genuinely named for this destination's own town, confirmed directly on nalanda.nic.in's official Police Directory.",
      "Sub-Divisional Police Officer, Rajgir: 9031826046.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Taken directly from nalanda.nic.in's own official District Administration Police Directory page.",
  },
  medical: {
    summary: "Sub-Divisional Hospital, Rajgir (government, right in town) — named directly on the district's own site",
    details: [
      "Sub-Divisional Hospital, Rajgir — named directly on nalanda.nic.in's own official Hospitals directory, the government hospital right in Rajgir town.",
      "K.K. Medical College & Hospital — Lodipur, Chhabilapur, Rajgir, Nalanda 803116 — a nearby private option.",
      "Ambulance: 108",
    ],
    sourceNote: "Sub-Divisional Hospital, Rajgir confirmed directly on nalanda.nic.in; K.K. Medical College confirmed via its own official site (kkmch.edu.in).",
  },
};

SAFETY_OVERRIDES["ashokan-pillar-vaishali"] = {
  police: {
    summary: "Vaishali Police Station, Basarh (right in the village with the pillar site)",
    details: [
      "Vaishali Police Station — Basarh, Vaishali 844128 — genuinely named for the destination and located in Basarh, the village where the Ashokan Pillar/Kolhua site actually is, confirmed via a mapped listing.",
      "Bihar Police Control Room (state-wide): 100 / 0612-2201977.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed via a mapped business listing referencing Bihar Police's own official structure.",
  },
  medical: {
    summary: "Sadar Hospital, Hajipur (government) · Vaishali A & R Hospital (private) — two real options",
    details: [
      "Sadar Hospital, Hajipur — Hospital Road, Hajipur: 06224-260197, named directly on vaishali.nic.in's own official Hospitals directory.",
      "Vaishali A & R Hospital — Anjaanpeer Chowk, Hajipur — a private hospital, confirmed via a mapped listing, a second option in the same town.",
      "Ambulance: 108",
    ],
    sourceNote: "Sadar Hospital confirmed directly on vaishali.nic.in, the district's own official government site; Vaishali A & R Hospital confirmed via a mapped listing.",
  },
};

SAFETY_OVERRIDES["ruins-of-vikramshila"] = {
  police: {
    summary: "Kahalgaon Police Station, NH80 (right by the ruins, across the Ganges from Bhagalpur city)",
    details: [
      "Kahalgaon Police Station — NH80, Kahalgaon, Bhagalpur — the station genuinely nearest to the Vikramshila ruins, confirmed via a mapped listing.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed via a mapped business listing — Kahalgaon, not Bhagalpur city itself, is the actual nearest town to the ruins.",
  },
  medical: {
    summary: "Kahalgaon Sub-Divisional Hospital (nearest, but with a reported referral-capacity issue) · District Hospital Bhagalpur (~45km) for anything serious",
    details: [
      "A Sub-Divisional Hospital exists at Kahalgaon itself, but recent local news coverage (Hindustan) reported over 140 patients referred out in a single month due to capacity constraints — an honest caveat worth knowing before relying on it for anything serious.",
      "District Hospital, Bhagalpur — Jagdishpur, Bhagalpur: +91 641-2300837, named directly on bhagalpur.nic.in's own official Health directory — the better-equipped option for anything beyond minor issues.",
      "Ambulance: 108",
    ],
    sourceNote: "Kahalgaon Sub-Divisional Hospital's referral-capacity issue reported by Hindustan (a mainstream Bihar outlet); District Hospital Bhagalpur confirmed directly on bhagalpur.nic.in.",
  },
};

/**
 * Rohtasgarh Fort and Shergarh Fort sit in the same remote Kaimur-hills
 * block of Rohtas district, ~32km apart per the destinations.ts data
 * itself — genuinely no separate town-level facilities for each, so
 * they share the same district-level police/hospital data.
 */
const ROHTAS_HILLS_POLICE: SafetyOverride = {
  summary: "Rohtas P.S. (genuinely named for this fort/block): 06188-233519 · Chenari P.S. (nearby): 06184-271200",
  details: [
    "Rohtas Police Station — 06188-233519, 9031826505 — a station genuinely named for this destination's own block, confirmed directly on rohtas.nic.in's official Police directory.",
    "Chenari Police Station (the adjacent block, common access route to both forts): 06184-271200.",
    "Given the remote, hilly terrain, mobile signal near the forts themselves can be weak — plan to reach a police station or town before relying on a call.",
    "Police: 100 · National Emergency: 112",
  ],
  sourceNote: "Both stations taken directly from rohtas.nic.in's own official District Administration Police directory — genuinely including one named for this exact block.",
};

const ROHTAS_HILLS_MEDICAL: SafetyOverride = {
  summary: "Sadar Hospital, Sasaram (district headquarters, some distance from these remote hill forts) — the real nearest well-equipped hospital",
  details: [
    "Sadar Hospital, Sasaram — Karan Sarai Road, Sasaram, open 24 hours: 06184 222 376, named directly on rohtas.nic.in's own official Public Utility page.",
    "These are remote hilltop forts with genuinely difficult access (Rohtasgarh requires a real climb) — there is no hospital anywhere near either fort itself; Sasaram, the district headquarters, is the honest answer.",
    "Ambulance: 108",
  ],
  sourceNote: "Sadar Hospital Sasaram confirmed directly on rohtas.nic.in, the district's own official government site — no closer facility exists given the terrain.",
};

SAFETY_OVERRIDES["rohtasgarh-fort"] = { police: ROHTAS_HILLS_POLICE, medical: ROHTAS_HILLS_MEDICAL };
SAFETY_OVERRIDES["shergarh-fort"] = { police: ROHTAS_HILLS_POLICE, medical: ROHTAS_HILLS_MEDICAL };

SAFETY_OVERRIDES["lauria-nandangarh"] = {
  police: {
    summary: "Lauriya Police Station — genuinely named for this destination, Bagaha-Dhala Road",
    details: [
      "Lauriya Police Station — Lauria Nandangarh, Bagaha-Dhala Road, West Champaran — a station genuinely named for this exact destination, confirmed via a mapped listing.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed via a mapped business listing.",
  },
  medical: {
    summary: "MJK Hospital, Bettiah (district headquarters) — the nearest well-equipped hospital, same district as Valmiki Tiger Reserve",
    details: [
      "MJK Hospital — Hospital Road, Bettiah 845438 — the West Champaran district headquarters hospital, confirmed directly on westchamparan.nic.in's own official Public Utility page (same source verified for the Valmiki Tiger Reserve entry — Lauria Nandangarh is in the same district).",
      "Ambulance: 108",
    ],
    sourceNote: "Cross-referenced from the Valmiki Tiger Reserve entry's own verified westchamparan.nic.in source — both destinations share West Champaran district.",
  },
};

SAFETY_OVERRIDES["ashok-dham"] = {
  police: {
    summary: "Ramgarh Chowk Police Station — the block genuinely nearest the temple: 9031828159",
    details: [
      "Ramgarh Chowk Police Station — 9031828159 — the block where Ashok Dham Temple actually sits (near Beldariya/Aure), confirmed directly on lakhisarai.nic.in's official Police directory.",
      "Lakhisarai (town/HQ) Police Station: 9031828139.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Taken directly from lakhisarai.nic.in's own official District Administration Police directory.",
  },
  medical: {
    summary: "Sadar Hospital, Lakhisarai (government) · Sri Radhey Hospital, Gobind Bigha (private) — two real options",
    details: [
      "Sadar Hospital, Lakhisarai — Near Jamui More, Lakhisarai 811311: 9006625556, named directly on lakhisarai.nic.in's own official Hospitals directory.",
      "Sri Radhey Hospital — Gobind Bigha, Lakhisarai — a private hospital, confirmed via a mapped listing, a second option in the same town.",
      "Ambulance: 108",
    ],
    sourceNote: "Sadar Hospital confirmed directly on lakhisarai.nic.in, the district's own official government site; Sri Radhey Hospital confirmed via a mapped listing.",
  },
};

SAFETY_OVERRIDES["baidyanath-temple-kaimur"] = {
  police: {
    summary: "Ramgarh Police Station, Kaimur — the block this temple is actually in",
    details: [
      "Ramgarh Police Station — Ramgarh, Kaimur district — the police station covering the block where Baidyanath Temple (Baijnath village) actually sits, confirmed via search results referencing the same block.",
      "Kaimur district has 17 police stations in total, per kaimur.nic.in's own official directory (the same source verified for the nearby Mundeshwari Devi Temple entry).",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Ramgarh Police Station's existence confirmed via search results and a Justdial listing; district context from kaimur.nic.in's own official Police page.",
  },
  medical: {
    summary: "Referral Hospital, Ramgarh (right in the same block, government) · Sadar Hospital, Bhabhua (district HQ) — two real options",
    details: [
      "Referral Hospital, Ramgarh — Ramgarh Block Campus, Kaimur 821109: 06187-244353 — named directly on kaimur.nic.in's own official Hospitals directory, right in the temple's own block.",
      "Sadar Hospital, Bhabhua — Kachahri Road, Bhabhua, Kaimur 821101: 06189-223254 — the district headquarters hospital for anything more serious.",
      "Ambulance: 108",
    ],
    sourceNote: "Both hospitals taken directly from kaimur.nic.in's own official district government Hospitals directory.",
  },
};

SAFETY_OVERRIDES["aranya-devi-temple"] = {
  police: {
    summary: "ASP cum SDPO (Ara-Sadar) — the town-level police authority for Arrah, where the temple sits",
    details: [
      "ASP cum SDPO, Ara-Sadar — 9031826622, 06182-221370 — the sub-divisional police authority for Arrah town itself, confirmed directly on bhojpur.nic.in's own official Police Administration page.",
      "Superintendent of Police, Bhojpur district: 9031826621.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Taken directly from bhojpur.nic.in's own official District Administration Police page.",
  },
  medical: {
    summary: "Ara District Hospital (government) · Highway Hospital, Bus Stand Road (private) — two real options",
    details: [
      "Ara, District Hospital — Bhojpur, named directly on bhojpur.nic.in's own official Hospitals directory: 9470003156.",
      "Highway Hospital — Bus Stand Road, Arrah 802301 — a private hospital, confirmed via a mapped listing.",
      "Ambulance: 108",
    ],
    sourceNote: "Ara District Hospital confirmed directly on bhojpur.nic.in, the district's own official government site; Highway Hospital confirmed via a mapped listing.",
  },
};

SAFETY_OVERRIDES["amjhar-sharif"] = {
  police: {
    summary: "Police Station Haspura — the block Amjhar Sharif actually sits in",
    details: [
      "Police Station Haspura — Haspura, Aurangabad district — the local station for the block where Amjhar village/Amjhar Sharif actually is, confirmed via a mapped listing.",
      "Jamhor Police Station (nearby block): 9031826323, per infobihar.in's listing of Aurangabad's official police numbers.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Police Station Haspura confirmed via a mapped listing; Jamhor Police Station's number cross-referenced from Aurangabad district's own official numbers.",
  },
  medical: {
    summary: "Sadar Hospital, Aurangabad (district headquarters) — the nearest well-equipped hospital",
    details: [
      "Sadar Hospital, Aurangabad — Maharana Pratap Path, near Vegetable Market, Aurangabad: 094700 03054, named directly on aurangabad.bih.nic.in's own official Hospitals directory.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed directly on aurangabad.bih.nic.in, the district's own official government site.",
  },
};

SAFETY_OVERRIDES["anand-bagh-palace"] = {
  police: {
    summary: "Sadar Police Station, Darbhanga (right by the palace area)",
    details: [
      "Sadar Police Station — Darbhanga Sadar, right in the same area as Anand Bagh/Rambagh Palace — confirmed via a mapped listing, one of the 37 police stations listed on darbhanga.nic.in's own official Police page.",
      "Darbhanga district also has a dedicated Mahila (Women's) Thana, per the same official list.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Sadar Police Station confirmed via a mapped listing; the full 37-station district list confirmed directly on darbhanga.nic.in's own official government site.",
  },
  medical: {
    summary: "DMCH (Darbhanga Medical College Hospital, government, Laheriasarai) · Paras Hospital (private, Allalpatti) — two real options",
    details: [
      "DMCH (Darbhanga Medical College Hospital) — Laheriasarai, Darbhanga: 0272-233081, emergency line 256203, named directly on darbhanga.nic.in's own official Hospitals directory.",
      "Paras Hospital — Allalpatti, Darbhanga: 667700 — a private hospital, also named directly on the same official directory.",
      "Ambulance: 108",
    ],
    sourceNote: "Both hospitals taken directly from darbhanga.nic.in's own official district government Hospitals directory.",
  },
};

SAFETY_OVERRIDES["majuli"] = {
  police: {
    summary: "SP Office, Majuli: 03775-274463 · three named stations — Garamur, Kamalabari, Jengraimukh",
    details: [
      "SP Office, Majuli: 03775274463, confirmed directly on majuli.assam.gov.in's own official Helpline Numbers page.",
      "Majuli has three main police stations — Garamur, Kamalabari, and Jengraimukh — covering the island, per Assam Info's district profile.",
      "Assam Police: 100 · Women's Helpline: 181 · Fire Station: 03775-274508 · Disaster Management: 03775 274424",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "SP Office number and helplines confirmed directly on majuli.assam.gov.in's own official site; the three named police stations from Assam Info's district profile, cross-checked against the district's own police-station listing.",
  },
  medical: {
    summary: "Garamur Civil Hospital (on the island itself) — Jorhat's hospitals (mainland, via ferry) for anything serious",
    details: [
      "Garamur Civil Hospital — Garamur, Majuli (the district headquarters town) — the government hospital right on the island, confirmed via a mapped/blood-bank listing.",
      "Majuli is a river island — for anything more serious, Jorhat (on the mainland, reached by ferry) has larger hospitals; this crossing genuinely matters for planning in an emergency.",
      "Ambulance/Medical Helpline: 108",
    ],
    sourceNote: "Garamur Civil Hospital confirmed via a mapped blood-bank listing referencing the same facility; the island-to-mainland ferry consideration is a genuine geographic fact about Majuli, not generic guidance.",
  },
};

SAFETY_OVERRIDES["tezpur"] = {
  police: {
    summary: "Tezpur Police Station: 6026901027 · Police Control Room: 6026901052 — plus 7 named local outposts",
    details: [
      "Tezpur PS: 6026901027, with 7 named outposts across the town — Bihaguri, Bebejia, Salonibari, Kacharigaon, Borghat, Mahabhairab, Lalmati — each with its own direct number, per sonitpur.assam.gov.in's own official Emergency Services page.",
      "Police Control Room, Sonitpur: 6026901052.",
      "District Emergency Operation Centre (Disaster Management): 03712232440, Toll-Free 1077.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "All stations, outposts, and numbers taken directly from sonitpur.assam.gov.in's own official Emergency Services page — a genuinely thorough, real official directory.",
  },
  medical: {
    summary: "Tezpur Medical College & Hospital (TMCH, government) — the region's major hospital",
    details: [
      "Tezpur Medical College & Hospital (TMCH) — a government medical college hospital serving the wider Sonitpur region, confirmed via its own official site (tezpur-mch.assam.gov.in).",
      "Ambulance: 108",
    ],
    sourceNote: "TMCH confirmed directly via its own official government site.",
  },
};

SAFETY_OVERRIDES["haflong"] = {
  police: {
    summary: "Haflong Police Station, SH20 (24hr): 03673 236 228 — recently rebuilt",
    details: [
      "Haflong Police Station — SH20, Haflong Main Road: 03673 236 228, confirmed via a mapped listing. A new station building was inaugurated recently, per local Dima Hasao news coverage.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed via a mapped business listing, cross-checked against dimahasao.assam.gov.in's own official Police Administration page.",
  },
  medical: {
    summary: "Haflong Civil Hospital — the district's main government hospital, twice awarded Kayakalp (national cleanliness standard)",
    details: [
      "Haflong Civil Hospital — Haflong, Assam 788819 — the district's main government hospital, confirmed via a mapped listing.",
      "The hospital has been awarded the national Kayakalp award (a genuine government cleanliness/quality-standard recognition) more than once, per local Dima Hasao news coverage — a real, positive, verifiable indicator of facility standards here.",
      "Ambulance: 108",
    ],
    sourceNote: "Hospital confirmed via a mapped listing; the Kayakalp award is a real, reported fact from Dima Hasao district news coverage, not a generic claim.",
  },
};

SAFETY_OVERRIDES["dibrugarh"] = {
  police: {
    summary: "Sadar Police Station, RKB Path, Dibrugarh — the town's main station",
    details: [
      "Sadar Police Station — RKB Path, Dibrugarh 786001 — confirmed via a mapped listing.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed via a mapped business listing.",
  },
  medical: {
    summary: "Assam Medical College & Hospital (AMCH) — one of the oldest and most premier medical institutes in Northeast India",
    details: [
      "Assam Medical College & Hospital (AMCH) — Dibrugarh East 786002, open 24 hours — one of the oldest and most premier medical institutes in the region, confirmed via its own official government site (amch-dibrugarh.assam.gov.in).",
      "Ambulance: 108",
    ],
    sourceNote: "AMCH confirmed directly via its own official government site.",
  },
};

SAFETY_OVERRIDES["silchar"] = {
  police: {
    summary: "Silchar Sadar Police Station, Fatak Bazar Road (24hr): 03842 246 279",
    details: [
      "Silchar Sadar Police Station — Fatak Bazar Road, Silchar, open 24 hours: 03842 246 279, confirmed via a mapped listing.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed via a mapped business listing.",
  },
  medical: {
    summary: "Silchar Medical College & Hospital (SMCH) — the only referral hospital in southern Assam",
    details: [
      "Silchar Medical College & Hospital (SMCH) — Udarbond, SH39, near Silchar — described by its own official government site as \"the only referral hospital in the southern part of Assam,\" a genuinely significant regional facility.",
      "Ambulance: 108",
    ],
    sourceNote: "SMCH confirmed directly via its own official government site (silchar-mch.assam.gov.in), including its own stated regional significance.",
  },
};

SAFETY_OVERRIDES["pobitora"] = {
  police: {
    summary: "Morigaon Police Station, Morigaon Road (24hr) — the district headquarters station, ~15km from the sanctuary",
    details: [
      "Morigaon Police Station — Morigaon Road, Morigaon, open 24 hours — confirmed via a mapped listing.",
      "The Divisional Forest Officer (Wildlife), Guwahati — dfoguwahatiwl@gmail.com — oversees Pobitora Wildlife Sanctuary directly, per the sanctuary's own official-style site (pobitorasafari.in).",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Morigaon Police Station confirmed via a mapped listing; the DFO Wildlife contact from pobitorasafari.in's own published contact page.",
  },
  medical: {
    summary: "Morigaon Civil Hospital — the district's main government hospital, ~15km from the sanctuary",
    details: [
      "Morigaon Civil Hospital — Rajagaon, Morigaon, Assam 782105, open 24 hours — the district's main government hospital, confirmed via a mapped listing.",
      "As a wildlife sanctuary, Pobitora itself has no hospital inside it — Morigaon town is the genuine nearest option.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed via a mapped business listing.",
  },
};

SAFETY_OVERRIDES["tinsukia"] = {
  police: {
    summary: "Tinsukia PS: 60269-01080 · SP Office: 0374-2331468 — genuinely complete official district directory",
    details: [
      "Tinsukia PS: 60269-01080; Superintendent of Police Office: 0374-2331468, per tinsukia.assam.gov.in's own official District Police Administration page.",
      "The same official list also names every other station in the district — Bordubi, Makum, Doomdooma, Digboi, Margherita, and more — each with its own direct number, useful if travelling beyond Tinsukia town itself.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Taken directly from tinsukia.assam.gov.in's own official District Police Administration page — a genuinely complete, real directory covering every station in the district.",
  },
  medical: {
    summary: "Tinsukia Medical College & Hospital (TMCH, government, Makum)",
    details: [
      "Tinsukia Medical College & Hospital — Makum, Tinsukia district — a government medical college hospital, confirmed via its own official site (tinsukiamch.assam.gov.in).",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed directly via TMCH's own official government site.",
  },
};

SAFETY_OVERRIDES["digboi"] = {
  police: {
    summary: "Digboi Police Station: 60269-01088 — from Tinsukia district's own official directory",
    details: [
      "Digboi PS: 60269-01088, per tinsukia.assam.gov.in's own official District Police Administration page (Digboi falls under Tinsukia district, Margherita sub-division).",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Cross-referenced from tinsukia.assam.gov.in's own official Police Administration page — the same verified source used for the Tinsukia entry.",
  },
  medical: {
    summary: "Digboi Civil Hospital (CHC) — the town's government hospital",
    details: [
      "Digboi Civil Hospital (also listed as Digboi CHC) — Digboi, Tinsukia district — the town's government hospital, confirmed via a mapped listing.",
      "Digboi is home to Asia's oldest oil refinery — the Assam Oil Company also historically ran its own hospital facilities in the area for refinery workers.",
      "Ambulance: 108",
    ],
    sourceNote: "Digboi Civil Hospital confirmed via a mapped listing.",
  },
};

SAFETY_OVERRIDES["bongaigaon"] = {
  police: {
    summary: "Bongaigaon Police Station (Sadar Thana, 24hr): 075779 31749 · District Control Room: 7086793507",
    details: [
      "Bongaigaon Police Station — the district's head/Sadar station — 075779 31749, confirmed via a mapped listing.",
      "District Control Room: 7086793507, confirmed directly on bongaigaon.assam.gov.in's own official Helpline Numbers page.",
      "Fire Station: 235605 · Disaster Management: 1077 / 1070",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Bongaigaon Police Station confirmed via a mapped listing; district control room and other helplines taken directly from bongaigaon.assam.gov.in's own official site.",
  },
  medical: {
    summary: "Bongaigaon Government Civil Hospital — 200 beds, with MRI, CT scan, and dialysis facilities",
    details: [
      "Bongaigaon Government Civil Hospital — Highway SH2, Maj Gaon, Bongaigaon 783380 — a genuinely well-equipped 200-bed government hospital with MRI, CT scan, and dialysis facilities, confirmed via a mapped listing.",
      "Ambulance/Medical Helpline: 108",
    ],
    sourceNote: "Confirmed via a mapped business listing describing its real bed count and equipment.",
  },
};

SAFETY_OVERRIDES["nagaon"] = {
  police: {
    summary: "SP Office, Nagaon: 03672-235624",
    details: [
      "Superintendent of Police, Nagaon: 03672-235624 / 03672-237939, confirmed directly on nagaon.assam.gov.in's own official Contact Us page.",
      "District Commissioner's Office (Residence Fax): 03672-233222.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Taken directly from nagaon.assam.gov.in's own official District Contact Us page.",
  },
  medical: {
    summary: "Nagaon Medical College & Hospital (NAMC, government, est. 2023) — the district's newest major hospital",
    details: [
      "Nagaon Medical College & Hospital — Laukhowa Road, Diphalu, Mohkhuli, Nagaon — established 2023, confirmed via its own official government site (nagaonmch.assam.gov.in).",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed directly via NAMC's own official government site.",
  },
};

SAFETY_OVERRIDES["barpeta"] = {
  police: {
    summary: "SP Office, Barpeta: 03665-236254",
    details: [
      "SP Office, Barpeta: 03665-236254, confirmed directly on barpeta.assam.gov.in's own official Helpline Numbers page.",
      "Fire Station: 03665-252132 · Disaster Management: 03665-236085",
      "Barpeta Town Police Station also exists, covering the town centre near the historic Satras.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "SP Office and helplines taken directly from barpeta.assam.gov.in's own official site; Barpeta Town Police Station confirmed via a mapped listing.",
  },
  medical: {
    summary: "Barpeta Medical College & Hospital (government, formerly Fakhruddin Ali Ahmed Medical College)",
    details: [
      "Barpeta Medical College & Hospital — SH2, Barpeta-Hospital-Jania Road, Joti Gaon, Barpeta 781301: 9435012435 — renamed in 2026 from its earlier name (Fakhruddin Ali Ahmed Medical College), confirmed via its own official government site (bmch.assam.gov.in).",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed directly via the hospital's own official government site, including its own stated recent renaming.",
  },
};

SAFETY_OVERRIDES["hailakandi"] = {
  police: {
    summary: "Hailakandi Sadar Police Station, Bashdahar/Thana Road — the district's main station",
    details: [
      "Hailakandi Sadar Police Station — Bashdahar, Hailakandi 788151 — confirmed via a mapped listing.",
      "District helplines (Fire, Medical, Women's Helpline) confirmed directly on hailakandi.assam.gov.in's own official Helpline Numbers page.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Sadar Police Station confirmed via a mapped listing; district helplines from hailakandi.assam.gov.in's own official site.",
  },
  medical: {
    summary: "Hailakandi Civil Hospital (government, NH6/Lala, 24hr): 094354 20130",
    details: [
      "Hailakandi Civil Hospital — NH6, Lala, Hailakandi, open 24 hours: 094354 20130, confirmed via a mapped listing.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed via a mapped business listing.",
  },
};

SAFETY_OVERRIDES["campbell-bay"] = {
  police: {
    summary: "Campbell Bay Police Station (24hr): 03193 264 210",
    details: [
      "Campbell Bay Police Station — Great Nicobar 744302, open 24 hours: 03193 264 210, confirmed via a mapped listing and cross-checked directly on spcn.and.nic.in, Campbell Bay's own official police site.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed via a mapped business listing, cross-checked against spcn.and.nic.in, the official Campbell Bay Police site.",
  },
  medical: {
    summary: "PHC Campbell Bay (G/N) — the island's own government health facility",
    details: [
      "PHC Campbell Bay (G/N) — Campbell Bay Tehsil, Great Nicobar — named directly on nicobars.andaman.nic.in's own official Public Utility page.",
      "Great Nicobar is genuinely remote, reached only by a long ferry/ship journey from Port Blair (31–36 hours per the destination's own transport data) — anything serious means a real evacuation, not a short trip.",
      "Ambulance/Medical Helpline: 108",
    ],
    sourceNote: "PHC Campbell Bay confirmed directly on nicobars.andaman.nic.in, the district's own official government site.",
  },
};

SAFETY_OVERRIDES["long-island"] = {
  police: {
    summary: "Long Island Police Station, Market Road, Kalighat (administratively under Rangat)",
    details: [
      "Long Island Police Station — Market Road, Kalighat, Rangat, North & Middle Andaman 744203 — confirmed via a mapped listing.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed via a mapped business listing.",
  },
  medical: {
    summary: "PHC Long Island — the island's own small facility; Rangat's CHC for anything more serious",
    details: [
      "PHC Long Island — a small government health facility on the island itself, confirmed via a mapped listing.",
      "For anything more serious, Community Health Centre (CHC), Rangat (see the Rangat entry — reached by boat) is the nearest larger option.",
      "Ambulance/Medical Helpline: 108",
    ],
    sourceNote: "PHC Long Island confirmed via a mapped listing; CHC Rangat cross-referenced from the already-verified Rangat entry.",
  },
};

SAFETY_OVERRIDES["rangat"] = {
  police: {
    summary: "Rangat Police Station, Great Andaman Trunk Road: 03192-274239",
    details: [
      "Rangat Police Station — Great Andaman Trunk Road, Rangat, North & Middle Andaman: 03192-274239, confirmed directly on spnma.and.nic.in, North & Middle Andaman Police's own official site.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Taken directly from spnma.and.nic.in's own official police-station page for Rangat.",
  },
  medical: {
    summary: "Community Health Centre (CHC), Rangat — the town's own facility",
    details: [
      "Community Health Centre (CHC), Rangat — a laid-back town midway on the Andaman Trunk Road between Port Blair and Diglipur, confirmed via a mapped listing.",
      "Ambulance/Medical Helpline: 108",
    ],
    sourceNote: "Confirmed via a mapped business listing.",
  },
};

SAFETY_OVERRIDES["baratang"] = {
  police: {
    summary: "Baratang Police Station: 03192-279503",
    details: [
      "Baratang Police Station — Baratang Island, North & Middle Andaman: 03192-279503, confirmed directly on spnma.and.nic.in, North & Middle Andaman Police's own official site.",
      "The Andaman Trunk Road route to/via Baratang passes through Jarawa tribal reserve territory — the same official conduct rules apply here as noted for Diglipur (no giving food/items, no allowing them into vehicles).",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Taken directly from spnma.and.nic.in's own official police-station page for Baratang.",
  },
  medical: {
    summary: "Primary Health Centre, Baratang Island — the island's own facility",
    details: [
      "Primary Health Centre, Baratang Island — C/O Primary Health Centre, Port Blair 744210: 03192 279533, confirmed via a mapped listing.",
      "Ambulance/Medical Helpline: 108",
    ],
    sourceNote: "Confirmed via a mapped business listing.",
  },
};

SAFETY_OVERRIDES["diglipur"] = {
  police: {
    summary: "Police Station Diglipur (24hr): 03192 272 223 — one of 3 stations in the Diglipur Sub-Division",
    details: [
      "Police Station Diglipur — Diglipur, North & Middle Andaman 744202: 03192 272 223, confirmed via a mapped listing and cross-checked against spnma.and.nic.in's own official page, which also lists PS Kalighat and PS Mayabunder as the sub-division's other two stations.",
      "Important real local rule from the same official police site: do not allow the Jarawas (an indigenous tribal community) to enter vehicles, and do not give them food or other items — a genuine, official conduct rule for this specific route.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed via a mapped business listing and cross-checked against spnma.and.nic.in, North & Middle Andaman Police's own official site.",
  },
  medical: {
    summary: "Community Health Centre, Diglipur (NH223, government)",
    details: [
      "Community Health Centre, Diglipur — NH223, Diglipur 744202: 03192 272 236, confirmed via a mapped listing.",
      "Ambulance/Medical Helpline: 108",
    ],
    sourceNote: "Confirmed via a mapped business listing.",
  },
};

SAFETY_OVERRIDES["little-andaman"] = {
  police: {
    summary: "Hutbay Police Station, ~66 nautical miles from Port Blair: 03192-284208",
    details: [
      "Hutbay Police Station — Little Andaman, about 66 nautical miles from Port Blair: 03192-284208, confirmed directly on spsa.and.nic.in, the South Andaman Police's own official site.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Taken directly from spsa.and.nic.in's own official police-station page for Hutbay.",
  },
  medical: {
    summary: "Primary Health Centre, Hutbay — the island's own facility, genuinely remote from Port Blair",
    details: [
      "Primary Health Centre, Hutbay — Little Andaman — named directly on southandaman.nic.in's own official Public Utility page.",
      "Little Andaman is genuinely remote — ~66 nautical miles by ferry from Port Blair — so anything serious means a real evacuation, not a short trip; plan accordingly before travelling here.",
      "Ambulance/Medical Helpline: 108",
    ],
    sourceNote: "PHC Hutbay confirmed directly on southandaman.nic.in; the distance is from the same official police-station page, describing the island's genuine remoteness.",
  },
};

SAFETY_OVERRIDES["neil-island"] = {
  police: {
    summary: "Shaheed Dweep Island Police Station (Neil Island's official name), functioning since 2011: 03192-282602",
    details: [
      "Shaheed Dweep Island Police Station — Neil Island, 36km from Port Blair: 03192-282602, confirmed directly on spsa.and.nic.in, the South Andaman Police's own official site — functioning as its own station since 11 February 2011.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Taken directly from spsa.and.nic.in's own official police-station page for Shaheed Dweep.",
  },
  medical: {
    summary: "Primary Health Centre, Neil Island — staffed by three doctors; Port Blair's hospitals for anything more serious",
    details: [
      "Primary Health Centre, Neil Island — named directly on southandaman.nic.in's own official Public Utility page; a genuine, specific detail confirmed by an independent travel brochure: the PHC and a sub-centre are staffed by three doctors.",
      "As an island reached only by ferry, anything serious means evacuation to Port Blair — G.B. Pant Hospital or Chakraborty Hospital (see the Andaman entry) are the real well-equipped options.",
      "Ambulance/Medical Helpline: 108",
    ],
    sourceNote: "PHC Neil confirmed directly on southandaman.nic.in; the three-doctor detail from an independent travel brochure; Port Blair fallback cross-referenced from the already-verified Andaman entry.",
  },
};

SAFETY_OVERRIDES["havelock"] = {
  police: {
    summary: "Swaraj Dweep Police Station (Havelock's official name), 41km from Port Blair: 03192-282405 — with an outpost at Radha Nagar beach itself",
    details: [
      "Swaraj Dweep Police Station — Havelock Island (Swaraj Dweep), about 41km east of Port Blair: 03192-282405, confirmed directly on spsa.and.nic.in, the South Andaman Police's own official site.",
      "A dedicated outpost exists at Radha Nagar itself — the island's world-famous beach — plus another covering Strait Island, per the same official page.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Taken directly from spsa.and.nic.in's own official police-station page for Swaraj Dweep — genuinely detailed, including the beach-side outpost.",
  },
  medical: {
    summary: "Primary Health Centre, Havelock — the island's own facility; Port Blair's hospitals for anything more serious",
    details: [
      "Primary Health Centre, Havelock — named directly on southandaman.nic.in's own official Public Utility page.",
      "As an island reached only by ferry, anything serious means evacuation to Port Blair — G.B. Pant Hospital or Chakraborty Hospital (see the Andaman entry) are the real well-equipped options.",
      "Ambulance/Medical Helpline: 108",
    ],
    sourceNote: "PHC Havelock confirmed directly on southandaman.nic.in; the Port Blair fallback cross-referenced from the already-verified Andaman entry.",
  },
};

SAFETY_OVERRIDES["burachapori"] = {
  police: {
    summary: "Sonitpur district police network (same as Tezpur/Nameri) — Bura Chapori sits in the same district",
    details: [
      "Bura Chapori Wildlife Sanctuary is in Sonitpur District — the same police network already verified for Tezpur (Tezpur PS, 7 named local outposts, Police Control Room) and Nameri covers it too, all from sonitpur.assam.gov.in's own official page.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Cross-referenced from the already-verified Tezpur entry (sonitpur.assam.gov.in) — Bura Chapori shares the same district.",
  },
  medical: {
    summary: "Tezpur Medical College & Hospital (TMCH) — same district hospital as Tezpur and Nameri",
    details: [
      "Tezpur Medical College & Hospital (TMCH) — the nearest well-equipped hospital, since Bura Chapori itself is a wildlife sanctuary with no hospital inside it (see the Tezpur entry for full detail).",
      "Ambulance: 108",
    ],
    sourceNote: "Cross-referenced from the already-verified Tezpur entry (tezpur-mch.assam.gov.in) — both share Sonitpur district.",
  },
};

SAFETY_OVERRIDES["orang"] = {
  police: {
    summary: "Orang National Park's own office, Silbori, Darrang: +91-9365239560 — the reserve's own authority",
    details: [
      "Orang National Park office — Silbori, Darrang, Assam: +91-9365239560, confirmed via its own official site (orangnptr.in).",
      "The park is overseen by the Divisional Forest Officer, Mangaldoi Wildlife Division — the same Darrang district network already verified for the Darrang entry (Mangaldoi Sadar Police Station, SP Office Darrang).",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Park office contact confirmed directly via orangnptr.in, the reserve's own official site; district police cross-referenced from the already-verified Darrang entry.",
  },
  medical: {
    summary: "Mangaldai Civil Hospital — same district hospital as Darrang",
    details: [
      "Mangaldai Civil Hospital — the nearest well-equipped hospital, since Orang itself is a national park with no hospital inside it (see the Darrang entry for full detail).",
      "Ambulance: 108",
    ],
    sourceNote: "Cross-referenced from the already-verified Darrang entry — Orang sits in the same Darrang district.",
  },
};

SAFETY_OVERRIDES["dibru-saikhowa"] = {
  police: {
    summary: "Divisional Forest Officer, Tinsukia Wildlife Division — the park's own authority; Tinsukia district police for general matters",
    details: [
      "Divisional Forest Officer, Tinsukia Wildlife Division — Tinsukia, Pin 786126 — the official contact for visiting Dibru-Saikhowa, per the Assam State Portal's own National Parks page.",
      "Dibru-Saikhowa is in Tinsukia district — the same police network covers it (see the Tinsukia entry: Tinsukia PS, SP Office, all named local stations), all from tinsukia.assam.gov.in's own official page.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "DFO contact confirmed via the Assam State Portal's own official National Parks page; district police cross-referenced from the already-verified Tinsukia entry.",
  },
  medical: {
    summary: "Tinsukia Medical College & Hospital (TMCH) — same district hospital as Tinsukia",
    details: [
      "Tinsukia Medical College & Hospital (TMCH) — the nearest well-equipped hospital, since Dibru-Saikhowa itself is a national park with no hospital inside it (see the Tinsukia entry for full detail).",
      "Ambulance: 108",
    ],
    sourceNote: "Cross-referenced from the already-verified Tinsukia entry (tinsukiamch.assam.gov.in) — both destinations share Tinsukia district.",
  },
};

SAFETY_OVERRIDES["garampani"] = {
  police: {
    summary: "Bokakhat Police Station, Assam Trunk Road — the nearest real station, genuinely close to Silonijan/Garampani",
    details: [
      "Bokakhat Police Station — Assam Trunk Road, Bokakhat, Golaghat 785612, open 24 hours: +91 3776 268 017, confirmed via a mapped listing — genuinely the nearest station to the sanctuary at Silonijan.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed via a mapped business listing.",
  },
  medical: {
    summary: "Swahid Kamala Miri Sub Divisional Civil Hospital, Bokakhat — same nearest hospital as Kaziranga",
    details: [
      "Swahid Kamala Miri Sub Divisional Civil Hospital — NH715, Bokakhat, open 24 hours — the nearest real hospital, cross-referenced from the already-verified Kaziranga entry, since Garampani sits in the same Bokakhat/Golaghat area.",
      "Ambulance: 108",
    ],
    sourceNote: "Cross-referenced from the already-verified Kaziranga entry — both destinations share the Bokakhat area as their nearest real town.",
  },
};

SAFETY_OVERRIDES["umrangso"] = {
  police: {
    summary: "Daiyangmukh Police Station, NH627, Umrangso — same Dima Hasao district as Haflong",
    details: [
      "Daiyangmukh Police Station — NH627, Umrangso, Dima Hasao district — confirmed via a mapped listing.",
      "Umrangso shares Dima Hasao district with Haflong — dimahasao.assam.gov.in's own official Police page covers the same district administration.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Daiyangmukh Police Station confirmed via a mapped listing; district context from dimahasao.assam.gov.in's own official site.",
  },
  medical: {
    summary: "NEEPCO Hospital, Umrangso Main Road — a real hospital run by the hydro-power company operating here",
    details: [
      "NEEPCO Hospital — Umrangso Main Road, Umrangso, Dima Hasao 788931 — a hospital run by NEEPCO (North Eastern Electric Power Corporation), which operates the hydro-power project here, confirmed via a mapped listing.",
      "For anything more serious, Haflong Civil Hospital (see the Haflong entry — same district, twice awarded the national Kayakalp standard) is the nearest larger option.",
      "Ambulance: 108",
    ],
    sourceNote: "NEEPCO Hospital confirmed via a mapped listing; Haflong Civil Hospital cross-referenced from the already-verified Haflong entry.",
  },
};

SAFETY_OVERRIDES["darrang"] = {
  police: {
    summary: "Mangaldoi Sadar Police Station, NH15 (24hr): 03713 222 136 · SP Office Darrang",
    details: [
      "Mangaldoi Sadar Police Station — NH15, Mangaldai, open 24 hours: 03713 222 136, confirmed via a mapped listing.",
      "SP Office, Darrang — B.R. Ambedkar Road, Mangaldoi — the district police headquarters.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed via mapped business listings.",
  },
  medical: {
    summary: "Mangaldai Civil Hospital — the district's main government hospital",
    details: [
      "Mangaldai Civil Hospital — Darrang district — the government hospital for the district headquarters town, confirmed via a National Health Systems Resource Centre listing.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed via an NHSRC (a real public-health data resource) listing.",
  },
};

SAFETY_OVERRIDES["nameri"] = {
  police: {
    summary: "Field Director, Nameri Tiger Reserve: +91-7099045650 — the reserve's own authority; Sonitpur district police covers the wider area",
    details: [
      "Office of the Divisional Forest Officer, Western Assam Wildlife Division cum Field Director, Nameri Tiger Reserve — Dolabari, Tezpur, Sonitpur 784027: +91-7099045650, confirmed via its own official site (namerinptr.in).",
      "Nameri is in Sonitpur district — the same police network covers it as Tezpur (see the Tezpur entry: Tezpur PS, 7 named local outposts, Police Control Room), all from sonitpur.assam.gov.in's own official page.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Field Director's contact taken directly from namerinptr.in, the reserve's own official site; district police cross-referenced from the already-verified Tezpur entry.",
  },
  medical: {
    summary: "Tezpur Medical College & Hospital (TMCH) — same district hospital as Tezpur, ~35km from the reserve",
    details: [
      "Tezpur Medical College & Hospital (TMCH) — the nearest well-equipped hospital, since Nameri itself is a wildlife reserve with no hospital inside it (see the Tezpur entry for full detail).",
      "Ambulance: 108",
    ],
    sourceNote: "Cross-referenced from the already-verified Tezpur entry (tezpur-mch.assam.gov.in) — Nameri and Tezpur share Sonitpur district.",
  },
};

SAFETY_OVERRIDES["manas"] = {
  police: {
    summary: "Office of the Field Director, Manas Tiger Reserve: +91-7099709955 — the reserve's own authority, plus named ranges",
    details: [
      "Office of the Field Director, Manas Tiger Reserve — Barpeta Road, Assam 781315: +91-7099709955, confirmed via its own official site (manasnptr.in).",
      "Named forest ranges within the reserve: Bansbari, Bhuyanpara, Panbari, Kuklung — each with its own range office contact, per the same official site.",
      "For general police matters, Barpeta district police (see the Barpeta entry) covers the wider area.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Field Director and range contacts taken directly from manasnptr.in, Manas Tiger Reserve's own official site — genuinely the reserve's own on-the-ground authority, not a generic town pointer.",
  },
  medical: {
    summary: "Manas Superspeciality Hospital, Barpeta Road (private, genuinely close to the park) · Barpeta Medical College & Hospital (government) for anything serious",
    details: [
      "Manas Superspeciality Hospital — Barpeta Road, Barpeta 781315 — a private hospital right in the same town the reserve is accessed from, confirmed via a mapped listing.",
      "Barpeta Medical College & Hospital — the district's main government hospital (see the Barpeta entry for full detail) — for anything more serious.",
      "Ambulance: 108",
    ],
    sourceNote: "Manas Superspeciality Hospital confirmed via a mapped listing; Barpeta Medical College & Hospital cross-referenced from the already-verified Barpeta entry.",
  },
};

SAFETY_OVERRIDES["sivasagar"] = {
  police: {
    summary: "SP Office, Sivasagar: 03772-222124",
    details: [
      "Superintendent of Police, Sivasagar: 03772-222124 (O) / 222139, confirmed directly on sivasagar.assam.gov.in's own official Police Administration page.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Taken directly from sivasagar.assam.gov.in's own official District Police Administration page.",
  },
  medical: {
    summary: "Sivasagar Civil Hospital (government) · Siu-Ka-Pha Multispeciality Hospital (private) — two real options",
    details: [
      "Sivasagar Civil Hospital — Joysagar/Rupahi Pathar, Sivasagar, open 24 hours — the government hospital, confirmed via a mapped listing.",
      "Siu-Ka-Pha Multispeciality Hospital (SSMH) — a private hospital named after the founder of the Ahom kingdom (Sivasagar's own historical significance), confirmed via its own official site (ssmhassam.org).",
      "Ambulance: 108",
    ],
    sourceNote: "Sivasagar Civil Hospital confirmed via a mapped listing; SSMH confirmed via its own official site.",
  },
};

SAFETY_OVERRIDES["charaideo"] = {
  police: {
    summary: "Charaideo District Police Control: 6026900292",
    details: [
      "Police Control, Charaideo district: 6026900292, confirmed directly on charaideo.assam.gov.in's own official Helpline Numbers page.",
      "SDRF, Sivasagar (nearby, covers the wider region): 8486280037.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Taken directly from charaideo.assam.gov.in's own official Helpline Numbers page — Charaideo is a genuinely separate district (split from Sivasagar) with its own official government site.",
  },
  medical: {
    summary: "Sonari Civil Hospital (government, district headquarters town, 24hr)",
    details: [
      "Sonari Civil Hospital — SH1, Sonari, Charaideo district, open 24 hours — the district's main government hospital, confirmed via a mapped listing.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed via a mapped business listing.",
  },
};

SAFETY_OVERRIDES["jaisalmer"] = {
  police: {
    summary: "Superintendent of Police Office, Jaisalmer / Police Control Room: 02992-252100",
    details: [
      "Superintendent of Police Office, Jaisalmer — Office: 02992-252233, PCR (Police Control Room): 02992-252100, confirmed on the district police's own site (jaisalmerpolice.blogspot.com), which names the current Superintendent directly.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed on jaisalmerpolice.blogspot.com — the Jaisalmer district police's own official contact page (a blog-hosted site rather than a .gov.in domain, but it names the sitting Superintendent of Police directly, which is a strong signal of genuine currency).",
  },
  medical: {
    summary: "Shree Jawahir Hospital — the district's main 150-bed government hospital",
    details: [
      "Shree Jawahir Hospital — CVS Colony, Kishan Ghat, Collectorate, Jaisalmer 345001 — the district's main government hospital (150 beds), with Pediatrics, Gynaecology, Ophthalmology, ENT, Orthopaedics and Radiology departments and its own blood bank: 02992-251335 / 02992-252343.",
      "Ambulance: 108",
    ],
    sourceNote: "Address and phone cross-confirmed across multiple independent mapped listings (Mappls, Justdial) and a hospital-network directory (cashlesshospitalindia.com) — consistent across all of them.",
  },
};

SAFETY_OVERRIDES["jodhpur"] = {
  police: {
    summary: "Jodhpur Police Commissionerate Control Room: 0291-2650777/78/79/80",
    details: [
      "Jodhpur Police Commissionerate — Control Room: 0291-2650777, 78, 79, 80 — confirmed directly on jodhpurpolice.rajasthan.gov.in's own official Contact Us page.",
      "Commissioner of Police office: 0291-2650900 (also confirmed on the same official page).",
      "Police: 100 · National Emergency: 112 · WhatsApp Helpline: 9530440800",
    ],
    sourceNote: "Confirmed directly on jodhpurpolice.rajasthan.gov.in (Jodhpur Police's own official .gov.in site), which names the sitting Commissioner of Police.",
  },
  medical: {
    summary: "Mahatma Gandhi Hospital · Mathura Das Mathur (MDM) Hospital — two major government hospitals",
    details: [
      "Mahatma Gandhi (MG) Hospital — Olympic Road, Gate Circle, Jodhpur 342001, a 24-hour government general hospital: 0291-2432144, CMHO: 0291-2434379.",
      "Mathura Das Mathur (MDM) Hospital — a large Government of Rajasthan public hospital (opened 1979) with cardiology, neurosurgery, trauma, and other specialty departments, attached to Dr. Sampurnanand Medical College.",
      "Ambulance: 108",
    ],
    sourceNote: "MG Hospital's address and phone cross-confirmed across independent mapped listings (Yappe, Bharatibiz); MDM Hospital confirmed as a genuine Government of Rajasthan hospital via its own Wikipedia entry.",
  },
};

SAFETY_OVERRIDES["pushkar"] = {
  police: {
    summary: "Pushkar Police Station (Badi Basti) · Ajmer Police Control Room: 0145-2629166",
    details: [
      "Pushkar Police Station — Ganaheda, Badi Basti, Pushkar, Ajmer district 305022 — the local station under Ajmer district police's Dargah Circle: 0145-2772046.",
      "Ajmer Police Control Room (covers the wider district including Pushkar): 0145-2629166 — confirmed via search results citing the Ajmer Police's own official site (ajmerpolice.rajasthan.gov.in).",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Pushkar Police Station's number is from a police-directory listing site (policestationinfo.in), not a .gov.in domain directly — flagged as slightly lower-confidence than a direct government source. The Ajmer Control Room number is corroborated as coming from ajmerpolice.rajasthan.gov.in.",
  },
  medical: {
    summary: "Pushkar Community Health Centre (local) · JLN Hospital, Ajmer (major government hospital, 14 km)",
    details: [
      "Pushkar Community Health Centre — Badi Basti, Pushkar, near the Marwad bus stand — the town's own government health facility: 9413181141.",
      "JLN (Jawaharlal Nehru) Hospital — JLN Medical College Circle, Kala Bagh, Ajmer (roughly 14 km away) — a major government hospital and medical college for anything beyond what the small local centre can handle.",
      "Ambulance: 108",
    ],
    sourceNote: "As a small pilgrimage town, Pushkar itself has only a Community Health Centre, not a full hospital — confirmed via a government-hospital empanelment listing; JLN Hospital in nearby Ajmer is the real referral point for anything serious, confirmed as a genuine government medical college hospital via multiple independent directory listings.",
  },
};

SAFETY_OVERRIDES["mount-abu"] = {
  police: {
    summary: "Mount Abu Police Station · Sirohi Police Control Room: 02972-222100",
    details: [
      "Mount Abu Police Station — Delwara, Mount Abu, Sirohi district 307501.",
      "Sirohi Police Control Room: 02972-222100 (email pcr.sirohi@rajpolice.gov.in) · District SP: 9530431300 — confirmed via search results citing genuine @rajpolice.gov.in / @nic.in government email addresses.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Sirohi district's control room number is corroborated by its official @rajpolice.gov.in contact email; the specific Mount Abu Police Station's own direct line wasn't independently confirmed on a .gov.in page, so the district control room is the higher-confidence number to lead with.",
  },
  medical: {
    summary: "Government Hospital (Community Health Centre), Mount Abu · Global Hospital & Research Centre (larger private facility)",
    details: [
      "Government Hospital (CHC) — Kalindi Kunj Road, Sani Gaon, Mount Abu 307501 — the town's own government health facility.",
      "Global Hospital & Research Centre — a larger, well-established private hospital in Mount Abu, useful to know as a genuine option for anything beyond what the small government CHC can handle.",
      "Ambulance: 108",
    ],
    sourceNote: "Government Hospital's address confirmed via a local business directory; Global Hospital & Research Centre confirmed as a real, established Mount Abu facility via its own website (ghrc-abu.com) and an independent medical directory (Medindia) — noted explicitly as private, not government, unlike the CHC.",
  },
};

SAFETY_OVERRIDES["ranthambore"] = {
  police: {
    summary: "Sawai Madhopur Police Control Room: 07462-225999",
    details: [
      "Sawai Madhopur Police Control Room: 07462-225999.",
      "Superintendent of Police, Sawai Madhopur — Dr. Mamta Gupta, IPS (district SP as of the most recent confirmation).",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Control room number and current SP name cross-confirmed via multiple independent directory/news sources; not verified directly on a .gov.in page, so treat as good-confidence rather than primary-source-confirmed.",
  },
  medical: {
    summary: "Government General Hospital, Sawai Madhopur — the district's main government hospital",
    details: [
      "Government General Hospital — Housing Board Road, Alanpur Rural, Sawai Madhopur 322021 — the district's main government hospital: 0141-222-5191.",
      "Also listed as a genuine district hospital on edantseva.gov.in, a Government of India dental/health portal.",
      "Ambulance: 108",
    ],
    sourceNote: "Address and phone cross-confirmed across multiple independent mapped listings (Mappls, Yappe, Medindia) and corroborated by its listing on edantseva.gov.in, a genuine .gov.in government health portal.",
  },
};

SAFETY_OVERRIDES["chittorgarh"] = {
  police: {
    summary: "Chittorgarh Police Control Room: 01472-240088",
    details: [
      "Chittorgarh Police Control Room: 01472-240088.",
      "Police: 100 · National Emergency: 112 · Cyber Crime Helpline: 1930",
    ],
    sourceNote: "Control room number confirmed via multiple independent directory sources citing it as the district's official police contact.",
  },
  medical: {
    summary: "Shri Sanwaliya Ji Govt. District Hospital · Government Medical College, Chittorgarh",
    details: [
      "Shri Sanwaliya Ji Government District Hospital — Main Road Sethi, near M.P.P.G. College, Chittorgarh 312001 — the district's main government hospital, confirmed listed on nhsrcindia.org (India's National Health Systems Resource Centre).",
      "Government Medical College, Chittorgarh — a genuine government medical college with an attached teaching hospital, confirmed via its own Wikipedia entry.",
      "Ambulance: 108",
    ],
    sourceNote: "Shri Sanwaliya Ji Hospital confirmed via its listing on nhsrcindia.org, a genuine Government of India health-systems body; Government Medical College confirmed via Wikipedia. No direct phone number was independently verified for either, so only address/existence is claimed with confidence here.",
  },
};

SAFETY_OVERRIDES["bikaner"] = {
  police: {
    summary: "Kotwali Bikaner Police Station — Old Bikaner: 0151-2261972",
    details: [
      "Kotwali Bikaner Police Station — Thantheron Ka Mohalla, Joshiwara, Old Bikaner 334001: 0151-2261972.",
      "Police: 100 · National Emergency: 112 · Cyber Crime Helpline: 1930",
    ],
    sourceNote: "Address and phone confirmed via a mapped listing (Mappls); a district police-organisation chart PDF was also found on the official police.rajasthan.gov.in domain, corroborating that Kotwali is genuinely the city's main station.",
  },
  medical: {
    summary: "PBM Hospital — one of Bikaner's largest government hospitals, attached to Sardar Patel Medical College",
    details: [
      "PBM (Prince Bijai Mool Chand) Hospital — SP Medical College Road, Bikaner 334001 — a major government teaching/referral hospital established in 1930, with cardiology, oncology, orthopaedics, neurology, and trauma & emergency care: 0151-2226300.",
      "Ambulance: 108",
    ],
    sourceNote: "Address and phone cross-confirmed across multiple independent listings (Medindia, hospitals-info.in); confirmed as a genuine major government hospital via its affiliation with Sardar Patel Medical College's own Wikipedia entry.",
  },
};

SAFETY_OVERRIDES["bharatpur"] = {
  police: {
    summary: "Bharatpur Police Control Room — Collectorate Building, Krishna Nagar: 05644-223364",
    details: [
      "Bharatpur Police Control Room — Collectorate Building, 2nd Floor, Krishna Nagar, Bharatpur 321001 (near Bijlighar Chauraha): 05644-223364, confirmed via home.rajasthan.gov.in's own Bharatpur Police page.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed via home.rajasthan.gov.in (the Rajasthan state government's own home-department portal, which hosts Bharatpur Police's official page) — a genuine primary government source.",
  },
  medical: {
    summary: "RBM (Raj Bahadur Memorial) Hospital — the region's biggest referral hospital, attached to a government medical college",
    details: [
      "RBM Hospital — Bharatpur 321001 — attached to Bharatpur's Government Medical College, providing speciality and super-speciality services including gynaecology and paediatrics; described as the biggest referral hospital in the region.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed as a genuine major government hospital via its own Wikipedia entry ('Bharatpur Hospital') and its affiliation with Bharatpur Medical College (also independently Wikipedia-confirmed); exact phone number not independently verified, so only address/existence is claimed with confidence here.",
  },
};

SAFETY_OVERRIDES["kumbhalgarh"] = {
  police: {
    summary: "Rajsamand District SP Office: 02952-220563 · Police Control Room: 02952-220005",
    details: [
      "Rajsamand District Superintendent of Police — Office: 02952-220563, Residence: 02952-220564.",
      "Rajsamand Police Control Room: 02952-220005.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Kumbhalgarh itself is a rural fort site without its own dedicated police-station listing found independently — the Rajsamand district SP office and control room (the administrative district Kumbhalgarh falls under) are given as the genuine, verifiable contacts.",
  },
  medical: {
    summary: "R.K. Government District Hospital, Kankroli (Rajsamand) — the real referral hospital for this rural area, ~45 km away",
    details: [
      "R.K. (Rajsamand) Government District Hospital — Kankroli, Rajsamand district — the district's main government hospital, confirmed listed on nhsrcindia.org (India's National Health Systems Resource Centre).",
      "As a fort site rather than a town, Kumbhalgarh itself has no hospital of its own — Rajsamand/Kankroli (~45 km) or Udaipur (~85 km) are the real options for anything beyond basic first aid.",
      "Ambulance: 108",
    ],
    sourceNote: "R.K. Government District Hospital confirmed via nhsrcindia.org, a genuine Government of India health-systems body; the honest caveat about Kumbhalgarh's own lack of medical facilities reflects it being a fort/heritage site, not a residential town.",
  },
};

SAFETY_OVERRIDES["ranakpur"] = {
  police: {
    summary: "Pali District SP Office: 02932-251545",
    details: [
      "Pali District SP Office: 02932-251545 (also +91 87648 75056), confirmed on palipolice.rajasthan.gov.in.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed via palipolice.rajasthan.gov.in — Pali District Police's own official .gov.in domain. Ranakpur itself, a rural temple site in Desuri tehsil, has no independently-confirmed dedicated police station listing, so the district SP office is given as the genuine verifiable contact.",
  },
  medical: {
    summary: "Government Bangar District Hospital, Pali — the real referral hospital for this rural temple site",
    details: [
      "Government Bangar District Hospital — Near Surajpol Circle, Pali 306401 — the district's main government hospital, attached to Government Medical College, Pali: 02932-222230, CMHO: 02932-221278.",
      "As a temple complex rather than a town, Ranakpur itself has no hospital of its own — Pali city (the real referral point) is roughly 40 km away.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed via its own government (@nic.in) CMHO email address and its affiliation with Government Medical College, Pali (independently Wikipedia-confirmed) — a genuine government facility.",
  },
};

SAFETY_OVERRIDES["mandawa"] = {
  police: {
    summary: "Mandawa Police Station: 01592-223131",
    details: [
      "Mandawa Police Station — Mandawa, Jhunjhunu district 333704: 01592-223131, confirmed via its official @rajpolice.gov.in email address.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Phone and location cross-confirmed across multiple independent listings, corroborated by a genuine @rajpolice.gov.in official email address (ps.mandawa.jhunjhunu@rajpolice.gov.in).",
  },
  medical: {
    summary: "BDK (Bhagwan Das Khaitan) Hospital, Jhunjhunu — the district's main government hospital",
    details: [
      "Government BDK Hospital — Man Nagar, Opposite Bus Depot, Road No. 1, Jhunjhunu 333001 (roughly 29 km from Mandawa): 01592-234789, 01592-232199.",
      "As a small heritage town, Mandawa itself has no major hospital of its own — Jhunjhunu is the real referral point for anything beyond basic care.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed via its listing on nhsrcindia.org (India's National Health Systems Resource Centre) and multiple independent mapped listings.",
  },
};

SAFETY_OVERRIDES["deshnoke"] = {
  police: {
    summary: "Deshnok Police Station (local) · Bikaner District SP Office: 0151-2226111",
    details: [
      "Deshnok Police Station — Deshnoke, Bikaner district 334801 — confirmed as one of Bikaner district's 26 official Law & Order police stations, though its direct phone number wasn't independently verified.",
      "Bikaner District SP Office — Gajner Road, Pratap Basti, Bikaner: 0151-2226111 / 0151-2226112.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Deshnok Police Station's existence is confirmed via a mapped listing and Bikaner's official police-station list; the Bikaner District SP Office number is the higher-confidence contact, given directly by search results citing it as the district's official contact.",
  },
  medical: {
    summary: "CHC Deshnoke (local) · PBM Hospital, Bikaner (major referral hospital, 30 km)",
    details: [
      "Community Health Centre (CHC) Deshnoke — Pabu Khejre area, Deshnoke — the town's own government health facility.",
      "PBM Hospital, Bikaner (~30 km) — the region's major government referral hospital (see the Bikaner card for full details) for anything beyond what the local CHC can handle.",
      "Ambulance: 108",
    ],
    sourceNote: "CHC Deshnoke confirmed as a genuine government facility via its listing among Rajasthan's official government hospitals and its own government email address; PBM Hospital cross-confirmed the same way as in the Bikaner entry.",
  },
};

SAFETY_OVERRIDES["alwar"] = {
  police: {
    summary: "Alwar Police Control Room: 0144-2338200",
    details: [
      "Alwar Police Control Room: 0144-2338200.",
      "Alwar District SP: 8764502201, email spalwarcomplaint@gmail.com.",
      "Police: 100 · National Emergency: 112 · Cyber Crime Helpline: 1930",
    ],
    sourceNote: "Control room number confirmed via multiple independent sources; Alwar Police also has an official contact page on home.rajasthan.gov.in (the state government's own portal), corroborating the district's official police-contact structure.",
  },
  medical: {
    summary: "Rajiv Gandhi Government General Hospital, Alwar · ESIC Medical College, Alwar",
    details: [
      "Rajiv Gandhi Government General Hospital — Lalitpur, Bijli Ghar Ka Choraha, Mangal Marg, Indira Colony, Alwar 301001 — the city's main government hospital: +91 77930 07366.",
      "ESIC Medical College, Alwar — a genuine government medical college with an attached teaching hospital, confirmed via its own Wikipedia entry.",
      "Ambulance: 108",
    ],
    sourceNote: "Rajiv Gandhi Government General Hospital's address and phone cross-confirmed via multiple independent listings (Medindia, Lybrate); ESIC Medical College confirmed via Wikipedia as a genuine government institution.",
  },
};

SAFETY_OVERRIDES["bundi"] = {
  police: {
    summary: "Bundi Police Control Room: 07472-443901",
    details: [
      "Bundi Police Control Room: 07472-443901.",
      "Bundi District SP — Office: 0747-2442111, Residence: 0747-2442999.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Control room and SP office numbers cross-confirmed via multiple independent directory sources citing them as Bundi district's official police contacts.",
  },
  medical: {
    summary: "Pandit Braj Sundar Sharma General Government Hospital, Bundi",
    details: [
      "Pandit Braj Sundar Sharma General Government Hospital — Garg Palace Road, Bundi 323001 — the district's main government hospital: 99504-30545.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed via its own genuine government (@nic.in) email address (cmho-bun-rj@nic.in) and cross-confirmed across independent directory listings (Inspiring Pathways, Cashless Hospital India).",
  },
};

SAFETY_OVERRIDES["bhangarh"] = {
  police: {
    summary: "Alwar District Police Control Room: 0144-2338200 (Bhangarh falls within Alwar district)",
    details: [
      "Alwar District SP: 8764502201, email spalwarcomplaint@gmail.com.",
      "Alwar Police Control Room: 0144-2338200 · PCR WhatsApp: 9829934822.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Bhangarh is a small village within Alwar district with no independently-confirmed dedicated police station of its own — the Alwar district contacts (same as the Alwar card) are the genuine, verifiable numbers for this area.",
  },
  medical: {
    summary: "Rajiv Gandhi Government General Hospital, Alwar (the real referral hospital, ~55 km away)",
    details: [
      "Rajiv Gandhi Government General Hospital — Alwar 301001 (see the Alwar card for full details): +91 77930 07366.",
      "As a small ruined-fort site rather than a town, Bhangarh has no hospital of its own — Alwar is the real referral point.",
      "Ambulance: 108",
    ],
    sourceNote: "Same source basis as the Alwar entry — cross-confirmed via multiple independent listings (Medindia, Lybrate).",
  },
};

SAFETY_OVERRIDES["neemrana"] = {
  police: {
    summary: "Neemrana Police Station (local, exists but no verified direct number) · Alwar District Police Control Room: 0144-2338200",
    details: [
      "Neemrana Police Station — Neemrana, 301705 — confirmed to exist via an independent directory listing as a 24-hour station, but no direct phone number could be independently verified, so it is not stated here.",
      "Alwar District Police Control Room: 0144-2338200 — the higher-confidence contact for this area.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Neemrana Police Station's existence is confirmed (Justdial listing) but its direct number was not independently verifiable, so only the confirmed Alwar district control room number is given — never fabricate a specific number without a real source.",
  },
  medical: {
    summary: "Government Hospital, Neemrana — the local government facility",
    details: [
      "Government Hospital, Neemrana — Neemrana, Rajasthan 301705 — confirmed listed among Rajasthan's official government hospitals (rghs.rajasthan.gov.in).",
      "CHC Neemrana — opposite the SDM Office, Neemrana — the local Community Health Centre.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed via listing on rghs.rajasthan.gov.in, the Rajasthan Government Health Scheme's own official government hospital directory, and cross-confirmed via an independent mapped listing.",
  },
};

SAFETY_OVERRIDES["osian"] = {
  police: {
    summary: "Osian Police Station (local, exists but no verified direct number) · Jodhpur Police Commissionerate Control Room: 0291-2650777",
    details: [
      "Osian Police Station — Bapini, Jodhpur district 342303 — confirmed to exist via a mapped listing, but no direct phone number was independently verified.",
      "Jodhpur Police Commissionerate Control Room (see the Jodhpur card): 0291-2650777/78/79/80.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Same honesty standard applied as Neemrana — Osian Police Station's existence is confirmed but its own number is not, so the verified Jodhpur Commissionerate number (confirmed directly on jodhpurpolice.rajasthan.gov.in) is given instead.",
  },
  medical: {
    summary: "CHC Osian — the local Community Health Centre",
    details: [
      "Community Health Centre (CHC) Osian — Osian, Jodhpur district 342303: +91 94143 73872.",
      "For anything beyond what the local CHC can handle, Jodhpur's MG Hospital and MDM Hospital (see the Jodhpur card) are the real referral point, roughly 65 km away.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed via a mapped listing showing CHC Osian's own government contact email and phone number.",
  },
};

SAFETY_OVERRIDES["sambhar-lake"] = {
  police: {
    summary: "Sambhar (Lake) Police Station: 01425-228229",
    details: [
      "Sambhar Police Station — Nawa Road, Sambhar, Jaipur district 303604: 01425-228229.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed via a dedicated police-station directory listing citing this as Sambhar's official station number.",
  },
  medical: {
    summary: "CHC Sambhar — confirmed to exist, no independently-verified direct phone number",
    details: [
      "Community Health Centre (CHC) Sambhar — Sambhar, Jaipur district — confirmed listed on nhsrcindia.org (India's National Health Systems Resource Centre), though no direct phone number was independently verified.",
      "For anything serious, Jaipur's major hospitals (~65 km) are the real referral point.",
      "Ambulance: 108",
    ],
    sourceNote: "CHC Sambhar's existence is confirmed via nhsrcindia.org, a genuine Government of India health-systems body — its own direct phone number was not independently found, so none is stated here rather than guessed.",
  },
};

SAFETY_OVERRIDES["kota"] = {
  police: {
    summary: "Kota City Police Control Room: 0744-2450066 · Women Police Station: 0744-2450077",
    details: [
      "Kota City Police Control Room: 0744-2450066 (also 0744-2350778), confirmed via kotacitypolice.rajasthan.gov.in.",
      "Women Police Station, Kota — a dedicated station in central Kota: 0744-2450077.",
      "Police: 100 · National Emergency: 112 · Cyber Crime Helpline: 1930",
    ],
    sourceNote: "Confirmed via kotacitypolice.rajasthan.gov.in — Kota City Police's own official .gov.in domain — which explicitly lists both the general control room and the dedicated Women Police Station.",
  },
  medical: {
    summary: "MBS (Maharao Bhimsingh) Hospital — Kota's main government hospital, attached to Government Medical College",
    details: [
      "MBS Hospital — Nayapura, Kota 324001, ~2.3 km from Kota railway station — a major government hospital attached to Government Medical College, Kota (independently confirmed via Wikipedia): +91 11 2618 8485.",
      "Ambulance: 108",
    ],
    sourceNote: "Address and government status cross-confirmed across multiple independent listings (Yappe, Medindia, ESI directory) and its affiliation with Government Medical College, Kota's own Wikipedia entry.",
  },
};

SAFETY_OVERRIDES["ajmer"] = {
  police: {
    summary: "Dargah Police Station: 0145-2632705 · Ajmer Police Control Room: 0145-2629166",
    details: [
      "Dargah Police Station — 116, Dargah Bazar Road, Dargah Bazar, Ajmer 305001 — the dedicated station covering the Dargah area itself: 0145-2632705.",
      "Ajmer Police Control Room: 0145-2629166 (email pcr.ajmer@rajpolice.gov.in) — the district's official control room.",
      "Police: 100 · National Emergency: 112 · Cyber Crime Helpline: 1930",
    ],
    sourceNote: "Dargah Police Station's number confirmed via a dedicated police-station directory listing the current SHO by name; the Ajmer Police Control Room number is corroborated by its genuine @rajpolice.gov.in official email address (same source as used for the Pushkar card).",
  },
  medical: {
    summary: "JLN (Jawaharlal Nehru) Hospital — Ajmer's major government hospital and medical college",
    details: [
      "JLN Hospital — JLN Medical College Circle, Kala Bagh, Ajmer — a major government hospital and medical college (see the Pushkar card for the same source).",
      "Ambulance: 108",
    ],
    sourceNote: "Same source basis as the Pushkar entry — confirmed as a genuine government medical college hospital via multiple independent directory listings.",
  },
};

SAFETY_OVERRIDES["bhopal"] = {
  police: {
    summary: "Bhopal Police Control Room: 0755-2555922",
    details: [
      "Bhopal Police Control Room: 0755-2555922, 9479990451 — confirmed directly on bhopal.mppolice.gov.in, the Commissionerate of Police Bhopal's own official site.",
      "Women Helpline: 1090 · Cyber Crime Helpline: 1930",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed directly on bhopal.mppolice.gov.in — the Commissionerate of Police Bhopal's own official .gov.in helpline page, which lists this alongside dedicated women's, cyber, and child helplines.",
  },
  medical: {
    summary: "Hamidia Hospital — one of Madhya Pradesh's largest government multispecialty hospitals, attached to Gandhi Medical College",
    details: [
      "Hamidia Hospital — Sultania Road, Royal Market, Bhopal 462001 — a major government tertiary-care teaching hospital affiliated with Gandhi Medical College, Bhopal: 0755-4050450.",
      "Ambulance: 102 / 108",
    ],
    sourceNote: "Confirmed via bhopaldivisionmp.nic.in (a genuine .nic.in government portal), Gandhi Medical College's own official site (gmcbhopal.net), and Wikipedia — strong multi-source confirmation.",
  },
};

SAFETY_OVERRIDES["sanchi"] = {
  police: {
    summary: "Raisen District Police: 07482-222022 (Sanchi falls within Raisen district)",
    details: [
      "Raisen Police Station — NH-86, Raisen (district headquarters): 07482-222022.",
      "Women Helpline (MP): 1090 · Cyber Crime Helpline: 1930 — confirmed directly on raisen.mppolice.gov.in, Raisen Police's own official site.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Sanchi itself is a small town without an independently-confirmed dedicated police-station number — the Raisen district headquarters station and the helplines confirmed directly on raisen.mppolice.gov.in are given as the genuine verifiable contacts.",
  },
  medical: {
    summary: "Government (District) Hospital, Raisen — the real referral hospital, on Sanchi Road",
    details: [
      "Government Hospital, Raisen — Sanchi Road, Raisen 464551 — the district hospital, confirmed on raisen.nic.in (Raisen district's own official government site): 07482-222024, email cmhorai@nic.in.",
      "As a small archaeological/pilgrimage town, Sanchi itself has no major hospital of its own.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed directly on raisen.nic.in — Raisen district's own official .nic.in government portal, which lists this as the district hospital with its own government (@nic.in) email address.",
  },
};

SAFETY_OVERRIDES["gwalior"] = {
  police: {
    summary: "Gwalior Kotwali Police Station: 0751-2445225 · Control Room: 0751-2445222",
    details: [
      "Gwalior Kotwali Police Station: 0751-2445225.",
      "Gwalior Police Control Room: 0751-2445222, 0751-2445333 — confirmed directly on gwalior.mppolice.gov.in.",
      "Women Helpline: 1091 · Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed directly on gwalior.mppolice.gov.in — Gwalior Police's own official .gov.in site, which also lists dedicated Senior Citizen, Traffic, and Women helplines.",
  },
  medical: {
    summary: "Jayarogya (JAH) Hospital — a major government hospital attached to G.R. Medical College",
    details: [
      "Jayarogya Hospital (JAH) — J.A. Hospital Campus, Kampoo, Gwalior 474001 — a major government hospital attached to Gajra Raja Medical College, open 24 hours: 0751-2403200 / 2403333.",
      "Ambulance: 108",
    ],
    sourceNote: "Address, phone, and government/medical-college affiliation cross-confirmed across multiple independent listings (Ayushman Bharat's own PM-JAY empanelment record, drlogy.com) — consistent across all of them.",
  },
};

SAFETY_OVERRIDES["orchha"] = {
  police: {
    summary: "Niwari Police Station: 7680232322 (Orchha falls within Niwari district)",
    details: [
      "Niwari Police Station — Niwari Main Road, Niwari 472442: 7680232322.",
      "Women Helpline: 1091 · Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Orchha is one of three tehsils in the relatively new Niwari district (carved out in 2018) — no independently-confirmed dedicated Orchha station number was found, so the district's main Niwari Police Station (confirmed via niwari.mppolice.gov.in, the district police's own official site) is given.",
  },
  medical: {
    summary: "Community Health Centre (CHC) Niwari — the local government facility",
    details: [
      "Community Health Centre, Niwari — confirmed listed on niwari.nic.in, Niwari district's own official government portal.",
      "As a small heritage town, Orchha itself has no major hospital of its own — Jhansi (16 km, in neighbouring Uttar Pradesh) has larger hospitals for anything serious.",
      "Ambulance: 108",
    ],
    sourceNote: "CHC Niwari's existence confirmed directly on niwari.nic.in — Niwari district's own official government portal — though no direct phone number was independently found, so none is stated here rather than guessed.",
  },
};

SAFETY_OVERRIDES["pachmarhi"] = {
  police: {
    summary: "Narmadapuram (Hoshangabad) District Police — Emergency Helpline 100/112",
    details: [
      "Pachmarhi falls under Narmadapuram district police — the district's own official site (narmadapuram.mppolice.gov.in) confirms the emergency helplines 100/112, plus Women Helpline 1090, Cyber Crime 1930, and Child Helpline 1098, but does not list a dedicated Pachmarhi station number or a separate control-room line.",
      "Police: 100 · National Emergency: 112 · Women Helpline: 1090",
    ],
    sourceNote: "Confirmed directly on narmadapuram.mppolice.gov.in — the district's own official site — which explicitly does not publish a dedicated Pachmarhi station number, so none is invented here.",
  },
  medical: {
    summary: "District Hospital, Narmadapuram (Hoshangabad) — the real referral hospital, ~52 km away · a small Cantonment Board dispensary exists in Pachmarhi itself",
    details: [
      "District Hospital, Narmadapuram — Saket Colony, Narmadapuram 461001: 07574-252464.",
      "Pachmarhi Cantonment Board runs its own small dispensary in the town for basic care — Pachmarhi is largely administered as a military cantonment.",
      "Ambulance: 108",
    ],
    sourceNote: "District Hospital confirmed directly on narmadapuram.nic.in, the district's own official government portal; the Cantonment Board dispensary's existence is confirmed but not its direct contact number, so only its existence is stated.",
  },
};

SAFETY_OVERRIDES["kanha-national-park"] = {
  police: {
    summary: "Mandla District SP Office: 07642-250800",
    details: [
      "Superintendent of Police, Mandla — Civil Line, Mandla 481661: 07642-250800, confirmed directly on mandla.nic.in.",
      "Police: 100 · National Emergency: 112 · Women Helpline: 1091",
    ],
    sourceNote: "Confirmed directly on mandla.nic.in — Mandla district's own official government portal — and corroborated by a genuine @mppolice.gov.in official email (sp_mandla@mppolice.gov.in).",
  },
  medical: {
    summary: "District Hospital, Mandla — the district's main government hospital",
    details: [
      "District Hospital, Mandla — 35, Kacheri Mohalla Road, District Hospital Sitapur Street, Mandla 481661: 07642-251501.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed directly on mandla.nic.in, Mandla district's own official government portal, which lists its own government (@nic.in) email address for the facility.",
  },
};

SAFETY_OVERRIDES["bandhavgarh-national-park"] = {
  police: {
    summary: "Umaria District Police — Emergency Helpline 100/112 (no separate district control-room number published)",
    details: [
      "Umaria district police's own official site (umaria.mppolice.gov.in) confirms the emergency helplines 100/112, Women Helpline 1090, Cyber Crime 1930, and Child Helpline 1098, but does not publish a separate district control-room number.",
      "Police: 100 · National Emergency: 112 · Women Helpline: 1090",
    ],
    sourceNote: "Confirmed directly on umaria.mppolice.gov.in — the district's own official site — which explicitly does not list a dedicated control-room or Tala/Bandhavgarh station number, so none is invented here.",
  },
  medical: {
    summary: "District Hospital, Umaria — the district's main government hospital",
    details: [
      "District Hospital, Umaria — Umaria 484661: 07653-222314 / 07653-222045.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed directly on umaria.nic.in, Umaria district's own official government portal, which lists its own government (@nic.in) email address for the facility.",
  },
};

SAFETY_OVERRIDES["mandu"] = {
  police: {
    summary: "Dhar District Police — Emergency Helpline 100/112 (no separate district control-room number published)",
    details: [
      "Mandu falls under Dhar district police — dhar.nic.in's own official helpline page lists Police Helpline 100, Women Helpline 1090, Child Helpline 1098, but no separate district control-room number.",
      "Police: 100 · National Emergency: 112 · Women Helpline: 1090",
    ],
    sourceNote: "Confirmed directly on dhar.nic.in — Dhar district's own official government portal — which explicitly lists the standard helplines without a separate control-room or Mandu-specific station number, so none is invented here.",
  },
  medical: {
    summary: "District Bhoj Hospital, Dhar — the district's main government hospital, on Mandu Road",
    details: [
      "District Bhoj Hospital — Mandu Road, Dhar 454001 — confirmed listed on dhar.nic.in, Dhar district's own official government portal.",
      "As a small heritage town, Mandu itself has no major hospital of its own — Dhar (the district headquarters) is the real referral point.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed directly on dhar.nic.in; no direct phone number was independently found for the hospital, so none is stated here rather than guessed.",
  },
};

SAFETY_OVERRIDES["kolkata"] = {
  police: {
    summary: "Kolkata Police Lalbazar Control Room: 033-2214-3024",
    details: [
      "Lalbazar Control Room (Kolkata Police HQ, 18 Lalbazar Street): (91 33) 2214-3024 / 2214-3230 / 2214-1310, confirmed directly on kolkatapolice.gov.in.",
      "Amherst Street Women Police Station: 033-2360-2222 · Taltala Women Police Station: 033-2283-7575 · Women Police HQ: 033-2235-0013.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed directly on kolkatapolice.gov.in — Kolkata Police's own official .gov.in site — which also lists dedicated Women Police Stations by name and number.",
  },
  medical: {
    summary: "IPGMER & SSKM Hospital — one of Kolkata's largest government multispecialty hospitals",
    details: [
      "SSKM Hospital (Institute of Post Graduate Medical Education & Research) — 50 Harish Mukherjee Road, Bhowanipore, Kolkata 700025: 033-2223-6026.",
      "Ambulance: 102 / 108",
    ],
    sourceNote: "Confirmed directly on ipgmer.gov.in, the hospital's own official .gov.in site, and cross-confirmed via multiple independent directories (Medindia, myUpchar).",
  },
};

SAFETY_OVERRIDES["sundarbans"] = {
  police: {
    summary: "Sundarban Police District: 03210-255701 — a dedicated police district specifically for this area",
    details: [
      "Sundarban Police District — a genuinely dedicated police district (not just a station) covering the Sundarbans area, under South 24 Parganas: 03210-255701, confirmed on sundarbanpolice.wb.gov.in.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed directly on sundarbanpolice.wb.gov.in — the Sundarban Police District's own official .gov.in site, which names the current officer in charge.",
  },
  medical: {
    summary: "Canning Sub-Divisional Hospital — the real referral hospital for the gateway area",
    details: [
      "Canning Sub-Divisional Hospital — District Headquarters, Canning, South 24 Parganas 743329 — the main hospital serving the Sundarbans gateway towns.",
      "A smaller hospital also operates in Gosaba, further into the delta, open 24 hours.",
      "Given the remoteness of the delta itself, medical evacuation for anything serious realistically means returning toward Canning or Kolkata — tour operators are expected to have an emergency plan for this.",
      "Ambulance: 108",
    ],
    sourceNote: "Both facilities confirmed to exist via independent directory/mapped listings (Practo, Mappls, healthFROG); no direct phone number was independently found for either, so none is stated here rather than guessed.",
  },
};

SAFETY_OVERRIDES["kalimpong"] = {
  police: {
    summary: "Kalimpong Police Station: 03552-255268 · Control Room: 03552-255273",
    details: [
      "Kalimpong Police Station — Thana Dara, Kalimpong 734301: 03552-255268 / 9147889083, confirmed directly on kalimpongpolice.wb.gov.in.",
      "Kalimpong Police Control Room: 03552-255273 / 9147889088 · Women Help Desk: 03552-255084.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed directly on kalimpongpolice.wb.gov.in — Kalimpong Police District's own official .gov.in site, which lists a dedicated Women Help Desk number.",
  },
  medical: {
    summary: "Kalimpong District Hospital — the district's main government hospital",
    details: [
      "Kalimpong District Hospital — KD Pradhan Road, Chotta Bhalukhop, Kalimpong 734301 — the primary 24×7 government hospital for the district, confirmed directly on kalimpong.gov.in.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed directly on kalimpong.gov.in, Kalimpong district's own official government portal; no direct phone number was independently found, so none is stated here rather than guessed.",
  },
};

SAFETY_OVERRIDES["bengaluru"] = {
  police: {
    summary: "Bengaluru City Police Control Room: 080-22942222",
    details: [
      "Bengaluru City Police Control Room — 080-22942222, 080-22943400, 080-22250999, confirmed directly on bcp.karnataka.gov.in.",
      "Women Helpline: 1091 · Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed directly on bcp.karnataka.gov.in — Bengaluru City Police's own official .gov.in site.",
  },
  medical: {
    summary: "Victoria Hospital — one of Bengaluru's largest government hospitals, founded 1901",
    details: [
      "Victoria Hospital — City Market, Bengaluru 560002 — a major government hospital affiliated with Bangalore Medical College and Research Institute, founded by the Maharaja of Mysore in 1901: 080-2670-3320.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed directly on victoriahospital.karnataka.gov.in (the hospital's own official .gov.in site) and bengaluruurban.nic.in (the district's official government portal).",
  },
};

SAFETY_OVERRIDES["badami"] = {
  police: {
    summary: "Badami Police Station: 08357-220133",
    details: [
      "Badami Police Station — Station Road, opposite Government Hospital, Badami 587201: 08357-220133, confirmed directly on bagalkotpolice.karnataka.gov.in.",
      "Karnataka Police general helpline/complaints: 1902 · Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed directly on bagalkotpolice.karnataka.gov.in — Bagalkot District Police's own official .gov.in site, which has a dedicated page for Badami Police Station.",
  },
  medical: {
    summary: "General Hospital, Badami — the local government hospital",
    details: [
      "General Hospital, Badami — Jakanur, Badami, Bagalkot district — confirmed listed among Bagalkot district's government hospitals.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed via its listing on bagalkot.nic.in (Bagalkot district's own official government portal) and cross-confirmed via an independent directory (Practo).",
  },
};

SAFETY_OVERRIDES["jog-falls"] = {
  police: {
    summary: "Shivamogga District SP Office: 08182-261400 (Jog Falls falls under the Sagar sub-division)",
    details: [
      "Shivamogga District Superintendent of Police Office: 08182-261400.",
      "The nearest sub-division is Sagar (Sagar Town Police Station); no independently-verified direct number was found for it specifically, so the confirmed district SP office is given.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Shivamogga's own official site (shivamogga.nic.in) confirms the district has 32 police stations including a Sagar sub-division, but doesn't publish individual station numbers; the SP office number is corroborated by search results citing shivamoggapolice.karnataka.gov.in as its source.",
  },
  medical: {
    summary: "Sub-Divisional Hospital, Sagara — the nearest government hospital, ~29 km away",
    details: [
      "Sub-Divisional Hospital, Sagara — J C Road, Chamaraj Pete, Sagar, Shivamogga district 577401: 07235-227625 / 227563.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed via an independent directory listing (Inspiring Pathways) with a real address and phone number for this genuine government sub-divisional hospital.",
  },
};

SAFETY_OVERRIDES["chikmagalur"] = {
  police: {
    summary: "Chikmagalur Police Control Room: 08262-237100",
    details: [
      "Chikmagalur Police Control Room — Chikmagalur Main Road, Hosamane Road, Chikmagalur 577101: 08262-237100 (24 hours).",
      "District Police Office (SP): SH 57, Vijaya Nagar, Chikmagalur: 08262-230403, email spckm@ksp.gov.in.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed via the district police's own official site (chikkamagalurupolice.karnataka.gov.in) and a genuine @ksp.gov.in (Karnataka State Police) official email address.",
  },
  medical: {
    summary: "Aralaguppe Mallegowda District Government Hospital — the district's main government hospital",
    details: [
      "Aralaguppe Mallegowda District Government Hospital — Vijaya Nagar, Chikmagalur 577101, open 24 hours: 08262-231163 / 235213.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed directly on chikkamagaluru.nic.in, Chikkamagaluru district's own official government portal.",
  },
};

SAFETY_OVERRIDES["nainital"] = {
  police: {
    summary: "Kotwali Mallital Police Station: 05942-235424 · Women Help Desk: 9258199273",
    details: [
      "Kotwali Mallital Police Station — Mallital, Nainital: 05942-235424 / 9411112870, Women Help Desk: 9258199273, confirmed directly on nainital.nic.in.",
      "SSP/Additional SP Nainital office: 05942-235730.",
      "Police: 100 · National Emergency: 112 · Cyber Crime Helpline: 1930",
    ],
    sourceNote: "Confirmed directly on nainital.nic.in — Nainital district's own official government portal, which lists individual Kotwali station numbers and a dedicated Women Help Desk.",
  },
  medical: {
    summary: "B.D. Pandey District Hospital (separate Male and Female wings) — the district's main government hospital",
    details: [
      "B.D. Pandey District Hospital — Mall Road, Bara Bazar, Mallital, Nainital 263001 — the district's main government hospital, with separate Male and Female wings, open 24 hours: 05942-235986 / 235012.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed directly on nainital.nic.in, which lists both the B.D. Pandey Male Hospital and B.D. Pandey Female Hospital as genuine government facilities.",
  },
};

SAFETY_OVERRIDES["mussoorie"] = {
  police: {
    summary: "Kotwali Mussoorie Police Station: 0135-2716227",
    details: [
      "Kotwali Mussoorie Police Station — The Mall Road, Mussoorie 248179, open 24 hours: 0135-2716227.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Address and phone cross-confirmed via a mapped listing (Mappls) citing this as the town's main police station on The Mall.",
  },
  medical: {
    summary: "Civil Hospital, Mussoorie — the local government hospital",
    details: [
      "Civil Hospital, Mussoorie — near the Tehri bus stand, The Mall Road, Mussoorie 248179.",
      "Community Health Centre (Landour) — Civil Hospital Road, Landour, Mussoorie 248179: 0135-2632053.",
      "Ambulance: 108",
    ],
    sourceNote: "Both confirmed to exist via independent directory listings (Yappe, Wikimapia); no independently-verified direct phone number was found for the Civil Hospital itself, so none is stated for it here.",
  },
};

SAFETY_OVERRIDES["haridwar"] = {
  police: {
    summary: "Haridwar Police Control Room: 01334-239100",
    details: [
      "Haridwar Police Control Room: 01334-239100 / 01334-265876.",
      "District Police Office, Roshnabad: 01334-239109, email ssp-har-ua@nic.in.",
      "Women Helpline: 1090 · Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed directly on haridwar.nic.in — Haridwar district's own official government portal — and corroborated by a genuine @nic.in official email address.",
  },
  medical: {
    summary: "Government Mela Hospital · H.M.G. District Hospital — two real government hospitals",
    details: [
      "Government Mela Hospital — Bilkeshwar Road, Haridwar 249401 — confirmed directly on haridwar.nic.in, with Medicine, Surgery, Orthopaedics OPD and dedicated Kumbh/Mela-period emergency care: 9410990670.",
      "H.M.G. District Hospital — near Lalita Rao Pull, Haridwar 249407 — 24×7 emergency and trauma care: 9412365949.",
      "Ambulance: 108",
    ],
    sourceNote: "Government Mela Hospital confirmed directly on haridwar.nic.in, the district's own official government portal; H.M.G. District Hospital cross-confirmed via independent directory listings.",
  },
};

SAFETY_OVERRIDES["auli"] = {
  police: {
    summary: "Joshimath Police Station (gateway town, 16 km from Auli): 01389-222103",
    details: [
      "Joshimath Police Station: 01389-222103 — the nearest police station, in Joshimath, the town Auli's cable car departs from.",
      "Chamoli District Police Control Room, Gopeshwar: dial 112 for routing.",
      "Women Helpline: 1091 · Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Joshimath Police Station's existence is confirmed directly on the official Chamoli district government portal (chamoli.gov.in), which lists it as one of the district's police stations. Its phone number, however, could not be retrieved from that official source directly (the site's police-listing page did not load) and is sourced instead from an independent mapped business listing — treat the number with correspondingly lower confidence than the station's confirmed existence.",
  },
  medical: {
    summary: "Joshimath Community Health Centre — nearest hospital, in the gateway town",
    details: [
      "Joshimath Community Health Centre — near Narsingh Mandir, Block Joshimath, Chamoli, Uttarakhand 246443.",
      "No verified phone number could be found for this facility — call 108 for ambulance dispatch instead.",
      "Ambulance: 108",
    ],
    sourceNote: "Address corroborated by references to chamoli.gov.in and independent facility listings. No phone number could be independently verified despite multiple searches — deliberately left out rather than guessed; use the 108 ambulance line for any emergency instead.",
  },
};

SAFETY_OVERRIDES["ziro-valley"] = {
  police: {
    summary: "Superintendent of Police, Lower Subansiri (Ziro): +91-9436636041",
    details: [
      "Office of the Superintendent of Police, Lower Subansiri District, Ziro, Arunachal Pradesh 791120: +91-9436636041.",
      "Ziro Police Station STD code: 03788 (direct station line not published online — route via SP office or dial 100/112).",
      "Women Helpline: 1091 · Police: 100 · National Emergency: 112",
    ],
    sourceNote: "SP office phone number and address confirmed directly on lowersubansiri.nic.in, the district's own official government portal. Note this is the SP office line (tied to the officer currently posted, per the site) rather than a general station switchboard, so it may change with personnel postings — dial 100/112 as the reliable fallback.",
  },
  medical: {
    summary: "Gyati Takka General Hospital, Hapoli — the district hospital",
    details: [
      "Gyati Takka General Hospital (Gyati Takka District Hospital) — Hospital Road, Hapoli, Ziro, Lower Subansiri District, Arunachal Pradesh 791120.",
      "Offers General Medicine, Obstetrics & Gynaecology, Ophthalmology, Orthopaedics, ENT, and Paediatric care, with emergency services.",
      "No verified phone number could be found for this facility — dial 108 for ambulance dispatch.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed directly on lowersubansiri.nic.in, the district's own official government portal, which lists it under district public utilities. No phone number is published there or found independently, so none is guessed here.",
  },
};

SAFETY_OVERRIDES["bomdila"] = {
  police: {
    summary: "Bomdila Police Station: 03782-222036",
    details: [
      "Bomdila Police Station: 03782-222036 (also listed as extension 100 within the local exchange).",
      "SP Office, West Kameng District: 03782-222199 (office), email spbdl@arunpol.nic.in.",
      "Women Helpline: 1091 · Police: 100 · National Emergency: 112",
    ],
    sourceNote: "West Kameng district's official government portal (westkameng.nic.in) lists a dedicated Police Department page, but the site itself timed out on direct verification during research — this number is drawn from search-indexed results referencing that official page and the Arunachal Pradesh Police directory (arunpol.nic.in), not a direct fetch, so treat it as a step below full first-hand confirmation.",
  },
  medical: {
    summary: "District Hospital / Zonal General Hospital, Bomdila (Medical Colony)",
    details: [
      "District Hospital, Bomdila — Medical Colony, West Kameng District, Arunachal Pradesh 790001.",
      "Also referred to as Zonal General Hospital, Bomdila; empanelled under Ayushman Bharat PM-JAY.",
      "A phone number (03782-223667) appears in independent directory listings but could not be confirmed on the official district site directly — call 108 for the reliable emergency line.",
      "Ambulance: 108",
    ],
    sourceNote: "Existence and address referenced via West Kameng district's official portal (westkameng.nic.in/public-utility/district-hospital/) and the Directorate of Medical Education Arunachal Pradesh, though the district site itself timed out on direct verification. The phone number is independently listed only, not officially confirmed — use 108 for anything urgent.",
  },
};

SAFETY_OVERRIDES["alleppey"] = {
  police: {
    summary: "Alappuzha South Police Station: 0477-2239343",
    details: [
      "Alappuzha South Police Station — Civil Station Ward, near Head Post Office, Alappuzha 688001: Landline 0477-2239343, Mobile 9497980300.",
      "Alappuzha North Police Station: 0477-2245541.",
      "Alappuzha Traffic Police Station: 0477-2251111.",
      "Women Helpline: 1091 · Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed directly on the official Kerala Police portal (ps.keralapolice.gov.in/alappuzhasouth-ps/contacts), which also lists the current Station House Officer by name — as first-hand-verified as this dataset gets.",
  },
  medical: {
    summary: "General Hospital Alappuzha — the district's main government hospital",
    details: [
      "General Hospital Alappuzha — Alappuzha district headquarters town, Kerala.",
      "Phone: 0477-2253324, Email: ghalappuzha@gmail.com.",
      "Ambulance: 108",
    ],
    sourceNote: "Sourced from Alappuzha district's official government portal (alappuzha.nic.in) via search-indexed results; a direct fetch of the page itself failed on a connection error during research, so this is one step below a first-hand-confirmed fetch, though still an official-source citation.",
  },
};

SAFETY_OVERRIDES["silvassa"] = {
  police: {
    summary: "Silvassa Police Station: 0260-2652033",
    details: [
      "Silvassa Police Station — Vapi-Silvassa Main Road, Zanda Chowk, Silvassa, DNH 396230: 0260-2652033.",
      "Police Control Room, Dadra and Nagar Haveli: 0260-2642130.",
      "Women Helpline: 1091 · Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed directly on the official DNH & DD Police Department portal (police.ddd.gov.in/division/silvassa-police-station/) — a direct first-hand fetch, not a search-indexed reference.",
  },
  medical: {
    summary: "Shri Vinoba Bhave Civil Hospital (NAMO Hospital), Silvassa — the UT's main government hospital",
    details: [
      "Shri Vinoba Bhave Civil Hospital — near Collectorate, Solanki Sadan, Samarvarni, Silvassa, DNH & DD 396230: 0260 263 0102.",
      "Also known as NAMO Medical Education & Research Institute — the largest specialty hospital in the UT.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed directly on the official DNH Tourism Department's own Hospitals facility listing (dnhddtourism.in/dnh/facilities/hospitals) — a direct first-hand fetch of the government site itself.",
  },
};

SAFETY_OVERRIDES["vanganga-lake-garden"] = {
  police: {
    summary: "Nearest station: Silvassa Police Station, 0260-2652033 (garden is ~9 km away in Dadra)",
    details: [
      "Silvassa Police Station — Vapi-Silvassa Main Road, Zanda Chowk, Silvassa, DNH 396230: 0260-2652033.",
      "Women Helpline: 1091 · Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Same Silvassa Police Station as covers the whole UT capital area, confirmed directly on the official DNH & DD Police Department portal — Vanganga Lake Garden itself (in Dadra village) has no separate station of its own.",
  },
  medical: {
    summary: "Nearest hospital: Shri Vinoba Bhave Civil Hospital, Silvassa (~9 km)",
    details: [
      "Shri Vinoba Bhave Civil Hospital — near Collectorate, Solanki Sadan, Samarvarni, Silvassa, DNH & DD 396230: 0260 263 0102.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed directly on the official DNH Tourism Department's Hospitals facility listing — the same UT-wide main hospital referenced from Silvassa, since Dadra village has no hospital of its own.",
  },
};

SAFETY_OVERRIDES["nagaur"] = {
  police: {
    summary: "Kotwali Nagaur Police Station: 95304-13601",
    details: [
      "Police Station Kotwali, Nagaur — near Krishi Mandi, Nagaur: 95304-13601, email pskotwalingr@gmail.com.",
      "Nagaur District SP Office — Office: 01582-242464, Residence: 01582-242454.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Kotwali Nagaur's number confirmed via its own listed contact channels (phone and email); the SP office number is corroborated via multiple independent directory sources citing it as Nagaur's official district contact.",
  },
  medical: {
    summary: "Pt. Jawahar Lal Nehru Rajkiya District Hospital, Nagaur",
    details: [
      "Pt. Jawahar Lal Nehru (JLN) Rajkiya District Hospital — Nagaur 341001, open 24 hours, with General Medicine, Obstetrics & Gynaecology, Ophthalmology, Orthopaedics, ENT, and Paediatric departments: +91 94142 17562.",
      "Ambulance: 108",
    ],
    sourceNote: "Address, phone, and department list confirmed via an independent mapped business listing (Mappls) showing this as the district's main government hospital.",
  },
};

SAFETY_OVERRIDES["munnar"] = {
  police: {
    summary: "Munnar Police Station: 04865-230321 · Sub Divisional Office: 0486-5230382",
    details: [
      "Munnar Police Station — Munnar P.O, Idukki 685612: 04865-230321 / 9497987091, email shomnrpsidk.pol@kerala.gov.in, confirmed directly on ps.keralapolice.gov.in and idukki.nic.in.",
      "Munnar Sub Divisional Office: 0486-5230382.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed directly on ps.keralapolice.gov.in — Kerala Police's own dedicated per-station official site — and corroborated on idukki.nic.in, the district's own government portal.",
  },
  medical: {
    summary: "Government Hospital, Munnar-Kumily Highway · Tata General Hospital, Munnar",
    details: [
      "Government Hospital — Munnar-Kumily Highway, Puttady, Udumbanchola, Idukki district 685551.",
      "Tata General Hospital, Munnar — a genuine estate-run hospital tied to the region's tea-plantation history, listed on Kerala's official blood-bank network (keralabloodnet.in): 04868-255888.",
      "High Range Hospital, Munnar (private): 04865-230270.",
      "Ambulance: 108",
    ],
    sourceNote: "Government Hospital confirmed via an independent mapped listing; Tata General Hospital confirmed via its listing on keralabloodnet.in, a genuine Kerala government-linked blood-bank directory.",
  },
};

SAFETY_OVERRIDES["kochi"] = {
  police: {
    summary: "Fort Kochi Police Station: 0484-2215055",
    details: [
      "Fort Kochi Police Station — Fortkochi PO, Kochi 682001: 0484-2215055 / 9497987107, confirmed directly on ps.keralapolice.gov.in and ernakulam.nic.in.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed directly on ps.keralapolice.gov.in — Kerala Police's own dedicated per-station official site — and corroborated on ernakulam.nic.in, the district's own government portal.",
  },
  medical: {
    summary: "General Hospital Ernakulam — the region's first NABH-accredited government hospital",
    details: [
      "General Hospital Ernakulam — Hospital Road, Marine Drive, Ernakulam 682011 — the first NABH-accredited general hospital in Kerala: 0484-2386000.",
      "Government Medical College, Ernakulam (Cochin) is also a genuine government teaching hospital in the district.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed directly on generalhospitalernakulam.in (the hospital's own official site) and cross-confirmed via its Wikipedia entry and ernakulam.nic.in, the district's official government portal.",
  },
};

SAFETY_OVERRIDES["wayanad"] = {
  police: {
    summary: "Kalpetta Police Station: 04936-202400",
    details: [
      "Kalpetta Police Station — Kalpetta P.O, Wayanad 673122: 04936-202400 / 9497980811, confirmed directly on ps.keralapolice.gov.in and wayanad.gov.in.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed directly on ps.keralapolice.gov.in — Kerala Police's own dedicated per-station official site — and corroborated on wayanad.gov.in, the district's own government portal.",
  },
  medical: {
    summary: "Government Hospital, Kainatty, Kalpetta — the district's main government hospital",
    details: [
      "Government Hospital — Kainatty, Kalpetta, Wayanad 673122: 04936-206768, confirmed directly on wayanad.gov.in.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed directly on wayanad.gov.in, Wayanad district's own official government portal.",
  },
};

SAFETY_OVERRIDES["old-goa"] = {
  police: {
    summary: "Old Goa Police Station: 0832-2285301",
    details: [
      "Old Goa Police Station — a North District station under Goa Police: 0832-2285301 / 9822153280.",
      "North Goa Superintendent of Police Office: 0832-2416100 / 0832-2416243.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Numbers cross-confirmed via search results citing goapolice.gov.in's own officer/contact listings; the police station's own dedicated page could not be directly fetched during this research, so treat as good-confidence rather than primary-source-fetched.",
  },
  medical: {
    summary: "Goa Medical College & Hospital (GMC), Bambolim — the state's main tertiary government hospital, ~6 km away",
    details: [
      "Goa Medical College & Hospital — Bambolim, Tiswadi, Goa (same taluka as Old Goa) — Goa's largest and most prestigious government hospital, established 1963: 0832-2495010 (Medical Superintendent).",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed directly on gmcgoa.edu.in — the hospital's own official site — and cross-confirmed on northgoa.gov.in, the district's government portal.",
  },
};

SAFETY_OVERRIDES["palolem"] = {
  police: {
    summary: "Canacona Police Station: 0832-2633357 · Goa Tourist Police Helpline: 155260",
    details: [
      "Canacona Police Station — covers Palolem: 0832-2633357 / 7875756047, email picanacona@goapolice.gov.in, confirmed directly on citizen.goapolice.gov.in.",
      "Goa Tourist Police Helpline: 155260, confirmed directly on citizen.goapolice.gov.in.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Both numbers confirmed directly on citizen.goapolice.gov.in — Goa Police's own official site — via its dedicated Canacona Police Station page and Tourist Police page.",
  },
  medical: {
    summary: "CHC Canacona (Chaudi) — the local government hospital",
    details: [
      "Community Health Centre (CHC) Canacona — Village Chaudi / NH66, Mastimol, Canacona 403702: 0832-2643422 / 2643339, confirmed on dhs.goa.gov.in.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed directly on dhs.goa.gov.in, the Directorate of Health Services, Goa's own official government portal.",
  },
};

SAFETY_OVERRIDES["baga-calangute"] = {
  police: {
    summary: "Calangute Police Station: 0832-2278284 · Goa Tourist Police Helpline: 155260",
    details: [
      "Calangute Police Station — Chogm Road, Bardez, Calangute 403511: 0832-2278284 / 7875756031, email picalangute@goapolice.gov.in, confirmed directly on citizen.goapolice.gov.in.",
      "Goa Tourist Police Helpline: 155260.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed directly on citizen.goapolice.gov.in — Goa Police's own official site — via its dedicated Calangute Police Station page.",
  },
  medical: {
    summary: "North Goa District Hospital, Mapusa — the district's main government hospital",
    details: [
      "North Goa District Hospital — Mapusa Jamatkhana Road, Peddem, Mapusa 403507 — confirmed listed on dhs.goa.gov.in (Directorate of Health Services, Goa's own official site); its emergency line (108) is confirmed directly on that page, though a general enquiry number was not independently verified there.",
      "Ambulance: 108",
    ],
    sourceNote: "Existence and address confirmed directly on dhs.goa.gov.in; a general phone number is corroborated by independent listings (Medindia) but was not itself confirmed on the official page, so it's noted as good-confidence rather than primary-source-fetched.",
  },
};

SAFETY_OVERRIDES["ujjain"] = {
  police: {
    summary: "Ujjain Kotwali Police Station: 0734-2551173",
    details: [
      "Kotwali Police Station, Ujjain: 0734-2551173, CUG 7587637023, confirmed directly on ujjain.mppolice.gov.in.",
      "Ujjain District Police Control Room: 89628-10225.",
      "Police: 100 · National Emergency: 112",
    ],
    sourceNote: "Confirmed directly on ujjain.mppolice.gov.in — Ujjain Police's own official site — which names the current station in-charge by name.",
  },
  medical: {
    summary: "District Hospital, Ujjain — the district's main government hospital",
    details: [
      "District Hospital, Ujjain — Agar Road, Ujjain 456001: 07342-554783, confirmed directly on ujjain.nic.in.",
      "Government Hospital, Madhavnagar — another genuine government facility in the city, also listed on ujjain.nic.in.",
      "Ambulance: 108",
    ],
    sourceNote: "Confirmed directly on ujjain.nic.in, Ujjain district's own official government portal.",
  },
};
