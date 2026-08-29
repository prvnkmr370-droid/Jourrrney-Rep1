/**
 * Itinerary-generation logic ported from the Make prototype's
 * src/screens/PlanTrip.tsx — pure data/logic, no UI. STYLE_CONFIGS and
 * PREFERENCES are unchanged; generateItinerary() is unchanged aside from
 * dropping the multi-stop "stops[]" annotation (the Figma "2.1 AI Input
 * Wizard" simplifies trip planning to a single destination, no waypoints).
 */
import { DESTINATIONS, type Destination } from "@/data/destinations";

export type TravelStyle = "backpacker" | "comfortable" | "premium";

export interface StyleConfig {
  id: TravelStyle;
  emoji: string;
  label: string;
  subtitle: string;
  color: string;
  bg: string;
  transport: string;
  transportDetail: string;
  stay: string;
  stayDetail: string;
  local: string;
  localDetail: string;
  budgetTier: "budget" | "mid" | "luxury";
  dailyRange: string;
  bookingTips: string[];
}

export const STYLE_CONFIGS: StyleConfig[] = [
  {
    id: "backpacker",
    emoji: "🎒",
    label: "Budget Explorer",
    subtitle: "Train · Dorm · Public transport",
    color: "#15803D",
    bg: "rgba(21,128,61,0.1)",
    transport: "Sleeper / 3AC Train",
    transportDetail: "Book IRCTC sleeper or 3AC class. Book 60 days ahead for Tatkal slots. Overnight trains save a night's stay cost.",
    stay: "Hostel Dorm / Budget Guesthouse",
    stayDetail: "₹300–800/night. Zostel, Goibibo hostels, and local guesthouses. Dorms cut accommodation cost by 60% vs private rooms.",
    local: "Public Bus · Shared Auto · E-Rickshaw",
    localDetail: "KSRTC/MSRTC city buses (₹10–30). Shared autos (₹20–50 fixed routes). E-rickshaws near monuments.",
    budgetTier: "budget",
    dailyRange: "₹800–1,500/day",
    bookingTips: [
      "Book train tickets 60 days ahead on IRCTC — Tatkal quota opens 1 day before departure at 30% premium",
      "Use Redbus for KSRTC night bus bookings — usually ₹300–600 from Bengaluru to most destinations",
      "Zostel and Goibibo hostels: book 7+ days ahead for peak season dorms",
      "Download offline Google Maps — public buses don't always announce stops in local language",
      "Carry ₹2,000 cash — shared autos and local dhabas are cash-only",
    ],
  },
  {
    id: "comfortable",
    emoji: "🛋️",
    label: "Comfortable Traveler",
    subtitle: "2AC Train / Flight · Hotel · Ola / Uber",
    color: "#333C81",
    bg: "rgba(51,60,129,0.1)",
    transport: "2AC Train or Budget Flight",
    transportDetail: "2AC or 1AC class trains for overnight journeys. Indigo/SpiceJet flights for routes above 8h. Budget ₹3,000–8,000 for flights.",
    stay: "3-Star Hotel / Heritage Guesthouse",
    stayDetail: "₹2,000–6,000/night. AC room with breakfast. Booking.com or MakeMyTrip for deals. Heritage properties often match chain hotel prices.",
    local: "Ola / Uber · Rented Scooter",
    localDetail: "App cabs for city reliability. Scooter rental (₹300–400/day) for beach or hill destinations where you want freedom.",
    budgetTier: "mid",
    dailyRange: "₹3,000–7,000/day",
    bookingTips: [
      "Set IRCTC price alerts — 2AC prices fluctuate; book 30–45 days ahead for best availability",
      "Google Flights Explore shows cheapest dates — mid-week travel saves 20–30% on flights",
      "Book hotels via Booking.com with free cancellation — lock in early rates, cancel if plans change",
      "Download Ola and Uber before travel — surge pricing at airports, use advance booking feature",
      "Rented scooter: show driving licence, photograph existing damage before taking it to avoid disputes",
    ],
  },
  {
    id: "premium",
    emoji: "✨",
    label: "Premium Experience",
    subtitle: "Flight · Resort · Private Cab",
    color: "#0D5C63",
    bg: "rgba(13,92,99,0.1)",
    transport: "Flight + Private Airport Transfer",
    transportDetail: "Fly direct where possible. Pre-book private cab pickup from airport (₹1,500–3,000). Vistara or Air India for better in-flight service.",
    stay: "4–5 Star Resort / Heritage Palace",
    stayDetail: "₹8,000–35,000/night. All-inclusive deals save money. Taj, Oberoi, CGH Earth, and Evolve Back group lead for immersive experiences.",
    local: "Private Chauffeur / Resort Vehicle",
    localDetail: "Pre-arranged resort cab or hire a driver for ₹3,000–5,000/day. AC vehicle, flexible stops, and local expertise included.",
    budgetTier: "luxury",
    dailyRange: "₹15,000+/day",
    bookingTips: [
      "Book premium properties 90+ days ahead — the best rooms and packages go first, especially during peak season",
      "Call hotels directly after online booking — often gives complimentary upgrades or early check-in",
      "Vistara credit card gives lounge access and upgrade vouchers — valuable for frequent trips",
      "Resort packages (2-night / 3-night all-inclusive) usually save 20–30% vs booking components separately",
      "Pre-book all activities at premium lodges — private safaris, spa slots, and guided experiences sell out first",
    ],
  },
];

export interface TripPlan {
  /** "ai" when the day-by-day itinerary and tips below came from the
   * Gemini-backed backend (see aiPlan.ts / journey-backend's
   * POST /plan-trip/ai); "template" when it's this file's own
   * generateItinerary() — either because AI planning isn't configured, or
   * the call failed/timed out. Every other field (cost breakdown,
   * transport/stay recommendations, booking checklist) always comes from
   * here regardless — only the itinerary days and tips are ever
   * AI-sourced. */
  planSource: "ai" | "template";
  destination: Destination;
  /** Origin city entered on the form — carried through purely for display
   * on the result screen (e.g. "Bengaluru → Agra"); not used in any cost
   * or itinerary-generation logic below. */
  origin: string;
  /** ISO date (yyyy-mm-dd) the user picked on the form, or null if they
   * left it flexible — also display-only, same as origin. */
  startDate: string | null;
  days: number;
  people: number;
  style: TravelStyle;
  preferences: string[];
  totalCost: number;
  itinerary: GeneratedDay[];
  styleConfig: StyleConfig;
  transportReco: string;
  stayReco: string;
  localTransportReco: string;
  foodBudget: number;
  tips: string[];
  bookingChecklist: string[];
  /** Set only for a multi-destination trip ("Mysore then Coorg") — see
   * generateMultiLegItinerary() below. Undefined for the ordinary single-
   * destination case, which is still the vast majority of plans and is
   * completely unaffected by this field's existence: `destination` stays
   * the first (or only) leg, `days`/`totalCost`/etc. stay trip-wide
   * totals, and `itinerary` stays one flat, sequentially-numbered list —
   * `legs` is purely additive metadata ResultStep.tsx uses to group that
   * same list visually and show a multi-stop route summary, not a
   * parallel/alternate data structure callers need to branch on. */
  legs?: TripLeg[];
}

export interface TripLeg {
  destination: Destination;
  days: number;
  /** 1-indexed, inclusive — this leg's days are itinerary[startDay-1..endDay-1]. */
  startDay: number;
  endDay: number;
}

export interface GeneratedDay {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  estimatedCost: number;
  stay: string;
  stayType: string;
  transport: string;
  /** Set only on multi-leg plans (see TripPlan.legs) — which leg's
   * destination this day belongs to, so ResultStep.tsx can render a
   * "📍 {name}" divider before the first day of each leg. */
  legDestinationName?: string;
}

export const PREFERENCES = [
  { id: "heritage", label: "Heritage & History" },
  { id: "nature", label: "Nature & Outdoors" },
  { id: "food", label: "Food & Cuisine" },
  { id: "adventure", label: "Adventure Sports" },
  { id: "wellness", label: "Wellness & Spa" },
  { id: "photography", label: "Photography" },
  { id: "offbeat", label: "Off-beat Places" },
  { id: "shopping", label: "Shopping" },
];

export function generateItinerary(
  dest: Destination,
  days: number,
  people: number,
  style: TravelStyle,
  prefs: string[],
  origin: string,
  startDate: string | null,
): TripPlan {
  const sc = STYLE_CONFIGS.find((s) => s.id === style)!;
  const budgetBreak = dest.budgetBreakdown.find((b) => b.tier === sc.budgetTier) || dest.budgetBreakdown[1];
  const dailyCost = budgetBreak.perDayPerPerson;
  const totalCost = dailyCost * days * people;

  const wantsFood = prefs.includes("food");
  const wantsAdventure = prefs.includes("adventure");
  const wantsWellness = prefs.includes("wellness");
  const wantsOffbeat = prefs.includes("offbeat");

  const accIdx = style === "backpacker" ? 0 : style === "comfortable" ? 1 : Math.min(2, dest.accommodation.length - 1);
  const acc = dest.accommodation[accIdx] || dest.accommodation[0];
  const stayType = acc.type;
  const stayExample = acc.examples[0] || "Local Stay";

  const localMode =
    style === "backpacker"
      ? dest.localTransport.find((t) => t.mode.includes("Bus") || t.mode.includes("Rickshaw") || t.mode.includes("Shared"))?.mode || "Public Bus / Auto"
      : style === "comfortable"
        ? dest.localTransport.find((t) => t.mode.includes("Ola") || t.mode.includes("Uber") || t.mode.includes("App"))?.mode || "Ola / Uber"
        : "Private Cab";

  const base = dest.defaultItinerary.slice(0, Math.min(dest.defaultItinerary.length, days));
  const generated: GeneratedDay[] = base.map((d, i) => ({
    day: d.day,
    title: d.title,
    morning: d.morning,
    afternoon: d.afternoon,
    evening: d.evening + (wantsFood ? ` Must-try tonight: ${dest.mustEat[i % dest.mustEat.length]}.` : ""),
    estimatedCost: Math.round(dailyCost * people * (0.85 + i * 0.05)),
    stay: stayExample,
    stayType,
    transport: localMode,
  }));

  for (let d = base.length + 1; d <= days; d++) {
    const pool = dest.nearbyPlaces.filter((p) => (wantsOffbeat ? p.isHidden : true));
    const nearby = pool[(d - base.length - 1) % pool.length] || dest.nearbyPlaces[0];
    generated.push({
      day: d,
      title: `Day Trip: ${nearby?.name || "Nearby Attraction"}`,
      morning: `Depart early for ${nearby?.name || "nearby area"} (${nearby?.distance || "nearby"}).`,
      afternoon: wantsAdventure
        ? "Outdoor activities and local adventure experiences."
        : wantsWellness
          ? "Ayurvedic treatment or yoga session at a certified wellness center."
          : "Explore local markets and cultural spots.",
      evening: `Return to ${dest.name}. ${wantsFood ? "Dinner at a local favourite." : "Evening at leisure."}`,
      estimatedCost: Math.round(dailyCost * people * 1.1),
      stay: stayExample,
      stayType,
      transport: localMode,
    });
  }

  const trainMode = dest.transport.find((t) => t.mode.includes("Train"));
  const flightMode = dest.transport.find((t) => t.mode.includes("Flight"));
  const roadMode = dest.transport.find((t) => t.mode.includes("Road"));

  const transportReco =
    style === "backpacker"
      ? trainMode
        ? `Sleeper or 3AC train (${trainMode.costRange}). ${trainMode.tips}`
        : roadMode
          ? `KSRTC/MSRTC overnight bus. ${roadMode.tips}`
          : "Book the earliest overnight bus for best rates."
      : style === "comfortable"
        ? trainMode
          ? `2AC or 1AC train (${trainMode.costRange}). Budget flight for routes over 8h.`
          : `Budget airline (Indigo/SpiceJet). ${flightMode?.tips || ""}`
        : flightMode
          ? `Fly direct. Pre-book private airport transfer (₹${(2500 * people).toLocaleString("en-IN")}). ${flightMode.tips}`
          : "Private cab or chartered vehicle for maximum comfort.";

  const stayReco =
    style === "backpacker"
      ? `${dest.accommodation[0].type}: ${dest.accommodation[0].examples.slice(0, 3).join(", ")} — ${dest.accommodation[0].priceRange}/night`
      : style === "comfortable"
        ? `${dest.accommodation[1]?.type || "Hotel"}: ${dest.accommodation[1]?.examples.slice(0, 2).join(", ") || ""} — ${dest.accommodation[1]?.priceRange || "₹2,000–5,000"}/night`
        : `${dest.accommodation[2]?.type || "Luxury"}: ${dest.accommodation[2]?.examples[0] || "Premium Resort"} — ${dest.accommodation[2]?.priceRange || "₹15,000+"}/night`;

  const localTransportReco =
    style === "backpacker"
      ? "City buses (₹10–30) and shared autos (₹20–50). Download offline Google Maps. Carry small change for exact fares."
      : style === "comfortable"
        ? "Ola/Uber for city travel. Rent a scooter (₹300–400/day) for beach or hill areas. Confirm app availability before arriving."
        : "Pre-arrange a dedicated driver with your resort. Private A/C cab: ₹3,000–5,000/day with flexible stops.";

  const tips = [
    `Best season: ${dest.bestSeason}`,
    `Women safety score: ${dest.womenSafety.score}/10 — ${dest.womenSafety.level}`,
    style === "backpacker"
      ? "Book IRCTC tickets 60 days ahead. Tatkal opens 1 day before — last resort at 30% premium."
      : style === "comfortable"
        ? "Book hotel 2–3 weeks ahead. Mid-week flights are 15–20% cheaper."
        : "Book premium resorts 90 days ahead — best rooms and packages go first.",
    wantsFood ? `Must try: ${dest.mustEat.slice(0, 2).join(" and ")}` : `Pack: ${dest.packingTips[0]}`,
    dest.womenSafety.soloTips[0],
  ];

  return {
    planSource: "template",
    destination: dest,
    origin,
    startDate,
    days,
    people,
    style,
    preferences: prefs,
    totalCost,
    itinerary: generated,
    styleConfig: sc,
    transportReco,
    stayReco,
    localTransportReco,
    foodBudget: budgetBreak.food * days * people,
    tips,
    bookingChecklist: sc.bookingTips,
  };
}

/**
 * Multi-destination trip ("Mysore then Coorg") — deliberately built by
 * calling generateItinerary() once per leg and merging the results,
 * rather than a parallel implementation, so every per-destination detail
 * (budget tier lookup, accommodation/transport recommendations, the
 * day-by-day content itself) stays exactly as accurate per leg as a
 * single-destination trip to that same place would be. The only new work
 * here is renumbering days sequentially across legs and combining the
 * summary fields (cost, tips, checklist) into one trip-wide plan.
 */
export function generateMultiLegItinerary(
  legs: { destination: Destination; days: number }[],
  people: number,
  style: TravelStyle,
  prefs: string[],
  origin: string,
  startDate: string | null,
): TripPlan {
  const sc = STYLE_CONFIGS.find((s) => s.id === style)!;
  const legPlans = legs.map((leg) => generateItinerary(leg.destination, leg.days, people, style, prefs, origin, startDate));

  let dayOffset = 0;
  const mergedItinerary: GeneratedDay[] = [];
  const tripLegs: TripLeg[] = [];
  legPlans.forEach((legPlan, i) => {
    const leg = legs[i];
    const startDay = dayOffset + 1;
    legPlan.itinerary.forEach((day, di) => {
      mergedItinerary.push({ ...day, day: dayOffset + di + 1, legDestinationName: leg.destination.name });
    });
    dayOffset += leg.days;
    tripLegs.push({ destination: leg.destination, days: leg.days, startDay, endDay: dayOffset });
  });

  return {
    planSource: "template",
    // First leg stands in for any code path that still reads
    // plan.destination directly (e.g. a screen title fallback) — the
    // real multi-stop route lives in `legs` below.
    destination: legs[0].destination,
    origin,
    startDate,
    days: dayOffset,
    people,
    style,
    preferences: prefs,
    totalCost: legPlans.reduce((sum, lp) => sum + lp.totalCost, 0),
    itinerary: mergedItinerary,
    styleConfig: sc,
    transportReco: legPlans.map((lp, i) => `${legs[i].destination.name}: ${lp.transportReco}`).join(" · Then: "),
    stayReco: legPlans.map((lp, i) => `${legs[i].destination.name}: ${lp.stayReco}`).join(" · Then: "),
    localTransportReco: legPlans[0].localTransportReco,
    foodBudget: legPlans.reduce((sum, lp) => sum + lp.foodBudget, 0),
    // A couple of tips per leg rather than every tip from every leg —
    // stays readable on a Smart Tips card meant for a skim, not a wall
    // of text once there are 2-3 legs each contributing 5 tips.
    tips: legPlans.flatMap((lp) => lp.tips.slice(0, 2)),
    // Booking checklists overlap heavily across legs at the same travel
    // style (e.g. "book IRCTC tickets 60 days ahead" applies trip-wide,
    // not per-leg) — de-duplicated rather than repeated.
    bookingChecklist: [...new Set(legPlans.flatMap((lp) => lp.bookingChecklist))].slice(0, 6),
    legs: tripLegs,
  };
}
