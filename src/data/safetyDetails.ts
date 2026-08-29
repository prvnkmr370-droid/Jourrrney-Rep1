/**
 * The 18-item safety-detail model requested for the destination Safety
 * tab. Every field draws from one of two honest sources — never a
 * fabricated per-destination "fact":
 *
 * 1. REAL, destination-specific data already in destinations.ts — score,
 *    level, highlights, precautions, safeZones, avoidAreas, and
 *    emergencyContacts on `Destination.womenSafety` (these were curated
 *    per-destination, several sourced from official state tourist
 *    helpline listings), plus `transport`/`localTransport`/
 *    `accommodation`, which were themselves sourced from the same
 *    official tourism sites verified in the image-audit pass.
 * 2. REAL, India-wide official numbers (national police/ambulance/
 *    emergency/women's/tourist helplines — genuinely correct nationwide,
 *    not destination-specific claims).
 *
 * For the categories this app has no real per-destination source for
 * (toilets, accessibility, feeding rooms, scams, etc.) — confirmed during
 * the state-by-state tourism-site audit that this granularity simply
 * isn't published anywhere scrapable — content is written as general
 * guidance for the destination's *type* (beach town, hill station,
 * temple town, heritage/metro city, wildlife area, or a small/remote
 * spot), and every such card is labelled "General guidance" via
 * `sourceNote` so it's never presented as a verified fact about that one
 * specific place.
 */
import type { Destination } from "./destinations";

export type SafetyCategoryKey =
  | "safetyLevel"
  | "toilets"
  | "womenFriendly"
  | "medical"
  | "police"
  | "accessibility"
  | "areaConditions"
  | "transport"
  | "accommodation"
  | "locationSharing"
  | "nightGuidance"
  | "connectivity"
  | "scamAwareness"
  | "localLanguage"
  | "localCustoms"
  | "walkingConditions"
  | "charging"
  | "essentials";

export interface SafetyCategoryContent {
  emoji: string;
  label: string;
  /** One line, shown on the always-visible/collapsed card. */
  summary: string;
  /** Shown when the card is tapped for more detail. */
  details: string[];
  /** Distinguishes "real data" from "general guidance" so neither reads as more authoritative than it is. */
  sourceNote: string;
}

export const PRIME_SAFETY_KEYS: SafetyCategoryKey[] = [
  "safetyLevel",
  "toilets",
  "womenFriendly",
  "medical",
  "police",
  "accessibility",
];

export const MORE_SAFETY_KEYS: SafetyCategoryKey[] = [
  "areaConditions",
  "transport",
  "accommodation",
  "locationSharing",
  "nightGuidance",
  "connectivity",
  "scamAwareness",
  "localLanguage",
  "localCustoms",
  "walkingConditions",
  "charging",
  "essentials",
];

// Real, India-wide official numbers — not destination-specific claims.
const POLICE = "100";
const AMBULANCE = "108";
const NATIONAL_EMERGENCY = "112";
const WOMEN_HELPLINE = "1091";
const TOURIST_HELPLINE = "1363";
const FIRE = "101";

type DestClass = "beach" | "hill" | "wildlife" | "spiritual" | "heritageMetro" | "remote" | "default";

function classify(d: Destination): DestClass {
  const cat = d.category.map((c) => c.toLowerCase());
  const text = `${d.tagline} ${d.description}`.toLowerCase();
  if (cat.includes("beach") || cat.includes("coastal") || cat.includes("diving")) return "beach";
  if (cat.includes("hills") || /hill station|mountain pass|valley|trek|glacier/.test(text)) return "hill";
  if (cat.includes("wildlife")) return "wildlife";
  if (cat.includes("spiritual") || /temple|shrine|pilgrimage|jyotirlinga|monastery|gurdwara|dargah/.test(text)) return "spiritual";
  if (d.hidden) return "remote";
  if (cat.includes("heritage") || cat.includes("unesco") || cat.includes("history")) return "heritageMetro";
  return "default";
}

interface ClassGuidance {
  toiletsSummary: string;
  toiletsDetails: string[];
  womenFriendlyDetails: string[];
  medicalDetails: string[];
  accessibilitySummary: string;
  accessibilityDetails: string[];
  areaConditionsDetails: string[];
  connectivitySummary: string;
  connectivityDetails: string[];
  scamDetails: string[];
  customsDetails: string[];
  walkingDetails: string[];
  chargingDetails: string[];
  essentialsDetails: string[];
}

const CLASS_GUIDANCE: Record<DestClass, ClassGuidance> = {
  beach: {
    toiletsSummary: "Beach-side toilets are usually basic — check before you commit to a stretch",
    toiletsDetails: [
      "Public toilets directly on the beach are often limited or seasonal — larger, more developed beaches near hotels/resorts tend to have cleaner options.",
      "Changing rooms are typically available at paid beach-resort stretches rather than open public sand, so plan around a resort/shack if you'll need one.",
      "Carry your own tissues/sanitiser as a backup — cleanliness varies a lot beach to beach.",
    ],
    womenFriendlyDetails: [
      "Stick to the main, visibly busy stretch of beach and beach-shack row rather than isolated coves, especially outside daylight hours.",
      "Resort and hotel cafés along the beach road are generally the more comfortable option for a solo woman traveller than an empty stretch of sand.",
    ],
    medicalDetails: [
      "Coastal towns usually have at least one government or private hospital in the main town, a short ride from the beach — ask your hotel for the nearest one on arrival.",
      "Jellyfish stings, sunburn, and dehydration are the most common beach-day medical issues here — carry basic first aid.",
    ],
    accessibilitySummary: "Sand limits wheelchair access — ask about boardwalks or firmer-ground stretches",
    accessibilityDetails: [
      "Loose sand is genuinely difficult for wheelchairs and unsteady walking — resort properties with boardwalks to the water are the more accessible option than open public beach.",
      "Ask your accommodation directly about step-free access and beach-wheelchair availability — provision varies a lot by property, not by destination.",
    ],
    areaConditionsDetails: [
      "Main beach roads are usually lit and busy into the evening near shacks/restaurants; the open sand itself gets dark and empty fast once the sun sets.",
      "Weekends and holiday season bring much heavier crowds than weekday off-season visits.",
    ],
    connectivitySummary: "Decent near the main beach strip, patchier further out",
    connectivityDetails: [
      "Mobile network is usually solid along the main tourist beach road; coverage can drop on quieter, more remote stretches.",
      "Most beach cafés and resorts offer Wi-Fi to paying customers.",
    ],
    scamDetails: [
      "Overpriced water-sport/parasailing packages sold by unlicensed touts are the most common issue — book through your resort or a clearly signed operator instead.",
      "Agree on shack food prices before ordering if there's no visible menu.",
    ],
    customsDetails: [
      "Swimwear is fine directly on the beach itself, but cover up when walking into town, markets, or local restaurants away from the beach.",
      "Alcohol rules vary by state — check local regulations before carrying it onto public beaches.",
    ],
    walkingDetails: [
      "Soft sand makes for slow, tiring walking over distance — factor that into how far you plan to cover on foot.",
      "Beach roads can lack proper lit pavements after dark; stick to the main tourist stretch at night.",
    ],
    chargingDetails: ["Beach shacks and cafés generally allow charging for paying customers — carry a power bank for full days on the sand away from outlets."],
    essentialsDetails: ["ATMs and pharmacies are usually in the main town rather than directly on the beach — stock up before heading to quieter stretches."],
  },
  hill: {
    toiletsSummary: "Concentrated at major viewpoints/parking areas — sparse along trekking stretches",
    toiletsDetails: [
      "Public toilets tend to cluster at main viewpoints, bus stands, and parking areas rather than along the trail itself.",
      "Carry your own supplies (tissues, hand sanitiser) for anything beyond the main tourist stops — facilities thin out fast once you're off the main road.",
    ],
    womenFriendlyDetails: [
      "Stick to established viewpoints and the main market/mall-road area rather than isolated trail sections, especially solo.",
      "Homestays with genuinely good reviews from women travellers tend to be a safer, more comfortable option here than isolated standalone guesthouses.",
    ],
    medicalDetails: [
      "The main town usually has a government hospital or at least a primary health centre — response time from remote viewpoints/passes can be significantly longer, so plan accordingly for high-altitude or remote treks.",
      "Altitude-related illness is a real risk above ~2,500m — acclimatise properly and know the early symptoms before heading higher.",
    ],
    accessibilitySummary: "Uneven, sloped terrain — genuinely difficult for wheelchairs/limited mobility",
    accessibilityDetails: [
      "Steep roads, steps, and uneven ground are the norm in hill towns — most viewpoints and monasteries involve some walking/climbing with no ramp alternative.",
      "Ask specifically about vehicle drop-off proximity when booking accommodation or planning a specific sight — some properties/attractions are far more accessible than others even within the same town.",
    ],
    areaConditionsDetails: [
      "Main market/mall-road areas are usually lit and active into the evening; roads outside town centre go dark and quiet fast once you're past the main strip.",
      "Fog and low visibility are common in hill areas, especially early morning/monsoon — affects both walking and driving safety.",
    ],
    connectivitySummary: "Reliable in town, drops off fast on passes and remote roads",
    connectivityDetails: [
      "Mobile network is usually fine in the main town/market area; expect patchy-to-no signal on mountain passes and remote stretches between towns.",
      "Download offline maps before heading out on any longer drive or trek here.",
    ],
    scamDetails: [
      "Overpriced 'guide required' claims for viewpoints that don't actually need one, and inflated taxi fares for tourists, are the most common issues — confirm with your hotel what's genuinely required/fair.",
    ],
    customsDetails: [
      "Modest dress is appreciated at monasteries and temples — cover shoulders/knees.",
      "Remove shoes before entering monastery prayer halls; ask before photographing inside.",
    ],
    walkingDetails: [
      "Genuinely steep, uneven terrain in most hill towns — comfortable, broken-in shoes matter more here than almost anywhere else on a typical India trip.",
      "Isolated forest/trail stretches should be walked in daylight and ideally not alone.",
    ],
    chargingDetails: ["Carry a power bank for day treks — outlets are only reliably available back at your accommodation, not along trails or at remote viewpoints."],
    essentialsDetails: ["Stock up on essentials (pharmacy, cash) in the main town before heading to a remote viewpoint or pass — options thin out fast outside it."],
  },
  wildlife: {
    toiletsSummary: "Available at the reserve/park entrance and visitor centre; none inside the core zone",
    toiletsDetails: [
      "Toilets are typically at the park gate/visitor centre, not inside the actual sanctuary or safari zone — plan your bio-break before entering.",
      "Facilities at the gate are usually basic but functional; carry your own tissues/sanitiser as backup.",
    ],
    womenFriendlyDetails: [
      "Book safaris through the official forest department counter or a recognised resort rather than an unlicensed tout.",
      "Group/shared safari jeeps are a more comfortable option for a solo woman traveller than a private booking with an unknown driver.",
    ],
    medicalDetails: [
      "The nearest real hospital is often in a town some distance from the reserve itself — resorts near wildlife areas usually keep a first-aid kit and know the nearest facility; ask on check-in.",
      "Carry any personal medication with you — pharmacies are rarely close to reserve accommodation.",
    ],
    accessibilitySummary: "Safari jeeps have limited step-free access — check with the operator directly",
    accessibilityDetails: [
      "Open safari jeeps generally require climbing in/out and aren't step-free — contact the specific resort/park office ahead of time about accessible-vehicle options if needed.",
      "Visitor centres at major reserves are usually more accessible than the safari zone itself.",
    ],
    areaConditionsDetails: [
      "Reserve areas are typically quiet, low-crowd zones by design — safaris run in structured morning/evening slots rather than open access.",
      "No general area lighting once outside the gate/resort — this is genuinely rural, undeveloped terrain after dark.",
    ],
    connectivitySummary: "Weak to absent inside the reserve; patchy even at gate-side resorts",
    connectivityDetails: [
      "Mobile signal is often weak or absent once inside the actual reserve — expect to be offline during safaris.",
      "Resorts near reserves may have Wi-Fi, but don't count on strong mobile data in the wider area.",
    ],
    scamDetails: [
      "Only book safaris through the official forest department counter, park website, or your resort — unlicensed touts promising 'guaranteed tiger sightings' at inflated prices are a known issue near popular reserves.",
    ],
    customsDetails: [
      "Follow forest department rules strictly — noise, feeding animals, and leaving the vehicle in the core zone are prohibited for real safety reasons, not just courtesy.",
      "Neutral-coloured clothing is recommended for safaris.",
    ],
    walkingDetails: [
      "Walking inside the core reserve zone is generally prohibited/dangerous — safaris are vehicle-based for a reason.",
      "Around the gate/resort area, stick to marked paths, especially after dark — this is genuine wildlife habitat, not a landscaped park.",
    ],
    chargingDetails: ["Carry a power bank — outlets are limited to your resort/lodge, and safaris run for hours with no charging access."],
    essentialsDetails: ["Stock up on essentials in the nearest town before heading to the reserve — the gate area itself rarely has more than a couple of basic shops."],
  },
  spiritual: {
    toiletsSummary: "Available near the main temple complex, often separate queues for women",
    toiletsDetails: [
      "Major temple complexes generally have public toilets near the entrance/queue area, with reasonable footfall keeping them maintained during peak pilgrimage times.",
      "Facilities thin out quickly once you're away from the main temple complex into the surrounding town.",
    ],
    womenFriendlyDetails: [
      "Large pilgrimage towns are usually heavily trafficked and well-patrolled around the main temple, which works in favour of solo women travellers during daylight/temple hours.",
      "Devasthanam or temple-trust guesthouses, where available, are a reliably safe stay option specifically built for pilgrims.",
    ],
    medicalDetails: [
      "Major temple towns typically have a first-aid post at the temple itself plus a government hospital in town — ask at the temple information counter on arrival.",
      "Heat exhaustion and crowd-related dehydration are common on high-footfall darshan days — carry water.",
    ],
    accessibilitySummary: "Long queue lines and temple steps are common — check for a separate/wheelchair queue",
    accessibilityDetails: [
      "Many major temples offer a separate, shorter queue or wheelchair assistance for elderly/disabled devotees — ask at the entrance information counter rather than assuming there isn't one.",
      "Temple architecture itself often involves steps and uneven stone floors with no ramp alternative — factor in extra time and possibly assistance.",
    ],
    areaConditionsDetails: [
      "The main temple/market area is typically busy and well-lit into the evening; side lanes away from it can be much quieter and dimmer.",
      "Festival days bring dramatically heavier crowds — check the local festival calendar before planning a visit if you prefer a quieter trip.",
    ],
    connectivitySummary: "Fine in the main town; can bottleneck under heavy pilgrimage crowds",
    connectivityDetails: [
      "Mobile network is generally decent in temple towns given the volume of visitors, though it can slow down under very heavy festival-day crowds.",
    ],
    scamDetails: [
      "Unofficial 'guides' offering to skip the queue for a fee, and inflated prasadam/offering prices from unauthorised vendors, are the most common issues — use the temple's own official counters.",
    ],
    customsDetails: [
      "Modest, conservative dress is expected — cover shoulders and knees; some temples require it strictly at entry.",
      "Leather items (belts, bags) are barred from some temple complexes — check before you queue.",
      "Photography is often restricted inside the sanctum — follow posted signage.",
    ],
    walkingDetails: [
      "Expect real walking and standing time in queues, often on stone floors, sometimes barefoot by temple rule — comfortable prep matters.",
      "Stick to the main pilgrim path after dark rather than quieter back lanes.",
    ],
    chargingDetails: ["Carry a power bank — phones and lockers/bags are sometimes restricted near the sanctum itself, and charging points are limited within the temple complex."],
    essentialsDetails: ["Pharmacies, ATMs, and basic shops are usually clustered along the main approach road to the temple."],
  },
  heritageMetro: {
    toiletsSummary: "Available at major monuments/museums; variable elsewhere in the city",
    toiletsDetails: [
      "Ticketed monuments and museums typically maintain public toilets near the entrance — generally the more reliable option compared to open street areas.",
      "Larger malls and chain cafés in the city are a good fallback for clean facilities away from the main monument.",
    ],
    womenFriendlyDetails: [
      "Stick to well-known, well-reviewed hotels, cafés, and monument areas — as with any city, footfall and lighting are the biggest factors in comfort, not the destination itself.",
      "Ride-hailing apps with driver tracking are generally a safer choice for getting around than an unmetered/unmarked cab.",
    ],
    medicalDetails: [
      "Being an established city/heritage town, there's usually a reasonable choice of hospitals and 24-hour pharmacies — ask your hotel to point you to the nearest one on arrival.",
    ],
    accessibilitySummary: "Varies a lot by monument — some have ramps, older heritage sites often don't",
    accessibilityDetails: [
      "Larger, better-funded monuments and museums increasingly offer wheelchair access and ramps; older or less-visited heritage sites are far less likely to.",
      "Check the specific monument's own visitor information (or call ahead) rather than assuming — accessibility provision varies site to site even within the same city.",
    ],
    areaConditionsDetails: [
      "Main tourist and market areas are typically lit and active well into the evening; side streets can be quieter and dimmer once shops close.",
    ],
    connectivitySummary: "Generally reliable across the city",
    connectivityDetails: ["Mobile network and 4G/5G coverage is generally solid in established cities and heritage towns; Wi-Fi is widely available at hotels and cafés."],
    scamDetails: [
      "Unofficial 'guides' outside major monuments, inflated souvenir prices in tourist-heavy markets, and unmetered taxis are the most commonly reported issues — use official ticket counters and metered/app-based transport.",
    ],
    customsDetails: [
      "Modest dress is appreciated at religious sites within the city even if the city itself is otherwise cosmopolitan.",
      "Bargaining is normal and expected in local markets, less so in fixed-price shops.",
    ],
    walkingDetails: ["Pavements and walkability vary a lot by area — main tourist zones are generally fine; check specific routes for late-night walking rather than assuming citywide."],
    chargingDetails: ["Cafés and malls generally allow charging for customers; carry a power bank for full sightseeing days at monuments with no outlets."],
    essentialsDetails: ["ATMs, pharmacies, and convenience stores are generally easy to find in the main city/tourist areas."],
  },
  remote: {
    toiletsSummary: "Limited — this is a smaller, less-developed spot; plan accordingly",
    toiletsDetails: [
      "As a smaller or less-developed destination, public facilities are genuinely limited — check with your accommodation or a local dhaba/eatery rather than expecting standalone public toilets.",
      "Carry your own tissues/sanitiser as standard practice here.",
    ],
    womenFriendlyDetails: [
      "Being less touristed, this is best visited with some pre-arranged accommodation/contact rather than showing up and figuring it out on arrival.",
      "Check recent reviews specifically before booking any homestay/guesthouse here — options are fewer, so vetting each one matters more than in a bigger tourist town.",
    ],
    medicalDetails: [
      "Medical facilities here are likely basic — the nearest well-equipped hospital may be in a larger town some distance away. Worth identifying that town and its hospital before you travel, especially for a longer or more remote stay.",
    ],
    accessibilitySummary: "Limited infrastructure overall — expect uneven paths and few ramps",
    accessibilityDetails: [
      "As a smaller, less-developed destination, purpose-built accessible infrastructure (ramps, accessible toilets) is unlikely to be widely available — check directly with your specific accommodation.",
    ],
    areaConditionsDetails: [
      "Expect a quiet, low-footfall area with limited lighting outside the main road — plan movement around daylight hours where possible.",
    ],
    connectivitySummary: "Patchy to weak — download what you need in advance",
    connectivityDetails: ["Mobile network and data can be genuinely unreliable in smaller, more remote spots — download offline maps and let someone know your plan before heading out."],
    scamDetails: ["Fewer reported tourist-scam patterns simply because there's less tourist traffic — the bigger real risk here is being under-prepared (fuel, cash, connectivity) rather than being targeted."],
    customsDetails: ["Local customs may be more conservative than in bigger tourist towns — modest dress and a respectful approach go a long way in smaller communities."],
    walkingDetails: ["Terrain and path quality can be genuinely rough — sturdy footwear matters, and walking after dark isn't advisable without local knowledge of the area."],
    chargingDetails: ["Charge fully before arriving and carry a power bank — outlets may be limited to your one accommodation option."],
    essentialsDetails: ["Stock up on essentials (cash, medication, fuel) in the nearest larger town before arriving — options here may be minimal."],
  },
  default: {
    toiletsSummary: "Available at major sights; quality varies — carry your own supplies as backup",
    toiletsDetails: [
      "Public toilets are generally available near ticketed attractions and major markets; standards vary, so carrying tissues/hand sanitiser is a sensible backup.",
      "Hotel lobbies and chain cafés are a reliable fallback for clean facilities.",
    ],
    womenFriendlyDetails: [
      "Stick to well-reviewed hotels, cafés, and well-lit main areas, and use tracked ride-hailing apps over unmarked cabs where available.",
    ],
    medicalDetails: ["Ask your accommodation for the nearest hospital/clinic and pharmacy on arrival — provision varies by exact location."],
    accessibilitySummary: "Varies by specific site — check ahead for ramps/step-free access",
    accessibilityDetails: ["Accessibility provision varies a lot by specific attraction/property — check directly ahead of your visit rather than assuming."],
    areaConditionsDetails: ["Main tourist and market areas are typically busier and better-lit than side streets, especially after dark."],
    connectivitySummary: "Generally reasonable — can vary by exact area",
    connectivityDetails: ["Mobile network coverage is generally reasonable; download offline maps as a backup for any more remote stretch of the trip."],
    scamDetails: ["Standard India-travel caution applies — agree prices upfront, use official ticket counters, and be wary of unsolicited 'guide' offers."],
    customsDetails: ["Modest dress is appreciated at religious sites; check specific local norms for the exact place you're visiting."],
    walkingDetails: ["Walkability varies by area — check the specific route, especially for anything after dark."],
    chargingDetails: ["Carry a power bank for full sightseeing days away from your accommodation."],
    essentialsDetails: ["ATMs, pharmacies, and convenience stores are generally available in main tourist/market areas."],
  },
};

export function getSafetyDetails(d: Destination): Record<SafetyCategoryKey, SafetyCategoryContent> {
  const ws = d.womenSafety;
  const g = CLASS_GUIDANCE[classify(d)];
  const localState = d.state.replace(/\s*\(UT\)\s*/, "");

  return {
    safetyLevel: {
      emoji: "🛡️",
      label: "Safety level",
      summary: `${ws.score}/10 · ${ws.level}`,
      details: [
        `Overall safety score: ${ws.score}/10 (${ws.level}).`,
        ...ws.highlights,
        ...(ws.precautions.length ? [`Precautions: ${ws.precautions.join("; ")}`] : []),
      ],
      sourceNote: "This app's own destination safety assessment, based on location, footfall, and available reporting.",
    },
    toilets: {
      emoji: "🚻",
      label: "Toilets",
      summary: g.toiletsSummary,
      details: g.toiletsDetails,
      sourceNote: "General guidance for this type of destination — official tourism sites don't publish facility-level detail, so this isn't a verified fact about this specific spot.",
    },
    womenFriendly: {
      emoji: "👩",
      label: "Women-friendly places",
      summary: ws.safeZones.length ? `Safe zones: ${ws.safeZones.join(", ")}` : "See details for guidance",
      details: [
        ...(ws.safeZones.length ? [`Safe zones: ${ws.safeZones.join(", ")}`] : []),
        ...(ws.avoidAreas.length ? [`Avoid after dark: ${ws.avoidAreas.join(", ")}`] : []),
        ...ws.soloTips,
        ...g.womenFriendlyDetails,
      ],
      sourceNote: "Safe zones, avoid-areas, and solo tips are this app's own curated assessment for this destination; stay suggestions are general guidance.",
    },
    medical: {
      emoji: "🏥",
      label: "Emergency medical help",
      summary: `Ambulance ${AMBULANCE} · National Emergency ${NATIONAL_EMERGENCY}`,
      details: [`National ambulance number: ${AMBULANCE}`, `National emergency number: ${NATIONAL_EMERGENCY}`, ...g.medicalDetails],
      sourceNote: "Helpline numbers are official, nationwide numbers; hospital/facility guidance is general for this destination type.",
    },
    police: {
      emoji: "👮",
      label: "Police & emergency contacts",
      summary: ws.emergencyContacts.length ? ws.emergencyContacts.map((c) => `${c.label}: ${c.number}`).join(" · ") : `Police: ${POLICE}`,
      details: [
        ...ws.emergencyContacts.map((c) => `${c.label}: ${c.number}`),
        `National Police: ${POLICE}`,
        `National Emergency: ${NATIONAL_EMERGENCY}`,
        `Women's Helpline: ${WOMEN_HELPLINE}`,
        `24x7 Tourist Helpline: ${TOURIST_HELPLINE}`,
        `Fire: ${FIRE}`,
      ],
      sourceNote: "Destination-specific contacts curated for this app (several from official state tourist-helpline listings), plus verified national numbers.",
    },
    accessibility: {
      emoji: "♿",
      label: "Accessibility",
      summary: g.accessibilitySummary,
      details: g.accessibilityDetails,
      sourceNote: "General guidance for this type of destination — official sites rarely publish accessibility specifics, so confirm with the specific attraction/property directly.",
    },
    areaConditions: {
      emoji: "💡",
      label: "Area conditions",
      summary: "See details for lighting/crowd guidance",
      details: g.areaConditionsDetails,
      sourceNote: "General guidance for this type of destination.",
    },
    transport: {
      emoji: "🚕",
      label: "Transport safety",
      summary: d.localTransport[0] ? `${d.localTransport[0].mode} available locally` : "See details",
      details: d.localTransport.length
        ? d.localTransport.map((t) => `${t.mode}${t.cost ? ` (${t.cost})` : ""}${t.notes ? ` — ${t.notes}` : ""}`)
        : ["Use official/app-based transport where available; agree fares upfront otherwise."],
      sourceNote: "Based on this destination's own listed local transport options.",
    },
    accommodation: {
      emoji: "🏨",
      label: "Accommodation safety",
      summary: d.accommodation[0]?.type ?? "See details",
      details: d.accommodation.length
        ? d.accommodation.map((a) => `${a.type} (${a.priceRange}): ${a.description}`)
        : ["Check for 24/7 reception, secure entry, and recent women-traveller reviews before booking."],
      sourceNote: "Based on this destination's own listed accommodation options; verify specific-property safety details (reception hours, entry security) directly before booking.",
    },
    locationSharing: {
      emoji: "📍",
      label: "Location sharing",
      summary: "Share your live trip with a trusted contact",
      details: [
        "Share your itinerary and live location with a trusted contact before heading out, especially for solo trips or remote areas.",
        "Agree a simple check-in time with someone back home for each day of the trip.",
      ],
      sourceNote: "General safety practice, not destination-specific.",
    },
    nightGuidance: {
      emoji: "🌙",
      label: "Night-time guidance",
      summary: ws.avoidAreas.length ? `Avoid: ${ws.avoidAreas.join(", ")}` : "Stick to main, lit areas after dark",
      details: [...(ws.avoidAreas.length ? [`Avoid after dark: ${ws.avoidAreas.join(", ")}`] : []), "Prefer well-lit, busy main roads over shortcuts or quiet side streets at night.", "Book transport in advance for late-night arrivals/departures rather than arranging it on the spot."],
      sourceNote: "Avoid-area guidance is this app's own curated assessment; the rest is general night-travel practice.",
    },
    connectivity: {
      emoji: "📶",
      label: "Connectivity",
      summary: g.connectivitySummary,
      details: g.connectivityDetails,
      sourceNote: "General guidance for this type of destination.",
    },
    scamAwareness: {
      emoji: "💰",
      label: "Scam awareness",
      summary: "See details for common local issues",
      details: g.scamDetails,
      sourceNote: "General guidance for this type of destination.",
    },
    localLanguage: {
      emoji: "🗣️",
      label: "Local language",
      summary: `Hindi and English are widely understood in ${localState}'s tourist areas`,
      details: [
        "Hindi is understood in most tourist-facing settings across India alongside the local state language; English is common in hotels and major attractions.",
        "Useful phrases: \"Madad chahiye\" (I need help), \"Aspataal kahaan hai?\" (Where is the hospital?), \"Police ko bulao\" (Call the police).",
        `Learning a few words of ${localState}'s own local language is appreciated but rarely necessary for tourist logistics.`,
      ],
      sourceNote: "General guidance — Hindi/English usage is broadly true across Indian tourist destinations.",
    },
    localCustoms: {
      emoji: "🧳",
      label: "Local customs",
      summary: "See details for dress and etiquette guidance",
      details: g.customsDetails,
      sourceNote: "General guidance for this type of destination.",
    },
    walkingConditions: {
      emoji: "🚶",
      label: "Walking conditions",
      summary: "See details for terrain and isolated-stretch guidance",
      details: g.walkingDetails,
      sourceNote: "General guidance for this type of destination.",
    },
    charging: {
      emoji: "🔋",
      label: "Charging",
      summary: "Carry a power bank for full sightseeing days",
      details: g.chargingDetails,
      sourceNote: "General guidance for this type of destination.",
    },
    essentials: {
      emoji: "🛒",
      label: "Essentials nearby",
      summary: "See details for pharmacy/ATM/fuel guidance",
      details: g.essentialsDetails,
      sourceNote: "General guidance for this type of destination.",
    },
  };
}
