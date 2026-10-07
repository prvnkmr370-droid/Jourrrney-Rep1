/**
 * Regional (state/UT-level) knowledge used to generate a JourneyGuide for
 * every destination that doesn't have one hand-written — see
 * scripts/generate-journey-guides.mjs. Deliberately NOT per-destination
 * trivia (that would need either real per-place research or an AI call,
 * both ruled out for this pass) — this is genuinely reliable knowledge at
 * the state/region level: actual climate patterns, India's nationally
 * standardized emergency numbers, primary regional languages. A specific
 * destination's generated guide combines this with REAL data this app
 * already computed (nearest airport/station via the same lookup
 * localRouteEstimate.ts uses), not fabricated local color.
 *
 * Every state has exactly 3 seasons (matching the hand-written Agra
 * reference guide's depth — Peak Winter/Summer/Monsoon) rather than 2, so
 * "What to Pack" has comparable richness everywhere, not just structural
 * parity.
 *
 * Keyed by the exact `state` strings used in destinations.ts (same 37
 * keys as stateAnchorCoords.ts).
 */
import type { WeatherSeason, CityEssentials } from "./journeyGuides";

// India-wide facts — genuinely true everywhere, not regional guesses.
const NATIONAL_EMERGENCY = "112 (all-in-one emergency), 102 (ambulance), 100 (police), 101 (fire) — toll-free from any phone, even without a SIM";
const NATIONAL_POWER = "Type C/D/M sockets, 230V — standard across India; bring a universal adapter if arriving from abroad";
const NATIONAL_UPI = "UPI (GPay/PhonePe/Paytm) is widely accepted in shops, autos, and by vendors in towns and cities; carry some cash as backup for smaller/remote spots";

export interface StateTemplate {
  weatherSeasons: WeatherSeason[];
  language: string;
  atmSimWifi: { atm: string; sim: string; wifi: string };
  medical: string;
}

const T = (overrides: Partial<StateTemplate> & Pick<StateTemplate, "weatherSeasons" | "language">): StateTemplate => ({
  atmSimWifi: {
    atm: "ATMs available in the main town/market area; carry some cash for smaller shops and remote stretches",
    sim: "Jio, Airtel, and Vi all have coverage in towns; signal can be patchy in remote/hilly stretches — download offline maps beforehand",
    wifi: "Most hotels and cafes in the main town offer WiFi; mobile data is the more reliable option while out and about",
  },
  medical: "Basic pharmacies and clinics in the nearest town for minor issues; for anything serious, head to the nearest city hospital — ask your hotel for the closest one.",
  ...overrides,
});

export const STATE_JOURNEY_TEMPLATES: Record<string, StateTemplate> = {
  Rajasthan: T({
    language: "Hindi and Rajasthani are widely spoken; English works fine in tourist areas and hotels",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "5°C – 25°C", feels: "Pleasant by day, cold at night", carry: ["Warm jacket", "Thermals for desert nights", "Comfortable walking shoes"], warning: "Desert nights can drop near freezing even when the day was warm — layer up for evenings.", clothingAdvice: "Light layers by day, a proper warm layer for nights — the day-night swing is the biggest surprise here." },
      { season: "Summer", months: "April – June", icon: "🔥", tempRange: "25°C – 48°C", feels: "Extremely hot and dry", carry: ["Light cotton clothing", "Sunscreen", "Wide-brim hat", "Extra water bottles"], warning: "Peak summer heat here is genuinely dangerous — avoid outdoor sightseeing between noon and 4pm.", clothingAdvice: "Loose, breathable cotton; cover up rather than expose skin to that sun." },
      { season: "Monsoon", months: "July – September", icon: "🌧️", tempRange: "25°C – 38°C", feels: "Humid, with short intense bursts of rain", carry: ["Light raincoat", "Quick-dry clothing"], warning: "Rain is lighter and less reliable here than most of India, but flash flooding in low-lying desert areas is still possible — check conditions.", clothingAdvice: "Light, breathable clothing with basic rain protection." },
    ],
  }),
  Delhi: T({
    language: "Hindi and English both work everywhere; Delhi is comfortable for English-only travellers",
    weatherSeasons: [
      { season: "Winter", months: "December – February", icon: "❄️", tempRange: "5°C – 20°C", feels: "Cold, foggy mornings", carry: ["Warm jacket", "Scarf", "Layers for the day's warm-up"], warning: "Dense winter fog (late Dec–Jan) regularly delays flights and trains — build buffer time into travel plans.", clothingAdvice: "Layer up — mornings are cold, afternoons can be mild." },
      { season: "Summer", months: "April – June", icon: "🔥", tempRange: "28°C – 45°C", feels: "Hot and dry, building to monsoon humidity", carry: ["Light cotton clothing", "Sunscreen", "Water bottle"], warning: "Heatwaves are common and genuinely intense — minimize outdoor time in peak afternoon heat.", clothingAdvice: "Loose, breathable fabrics; stay hydrated." },
      { season: "Monsoon", months: "July – September", icon: "🌧️", tempRange: "26°C – 35°C", feels: "Hot and humid with heavy downpours", carry: ["Raincoat", "Quick-dry clothing", "Waterproof footwear"], warning: "Sudden waterlogging on roads is common after heavy spells — factor in extra travel time.", clothingAdvice: "Light, quick-dry clothing with rain protection." },
    ],
  }),
  "Chandigarh (UT)": T({
    language: "Punjabi and Hindi are common; English works well in this well-planned, tourist-friendly city",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "5°C – 20°C", feels: "Cool to cold", carry: ["Jacket", "Light sweaters"], warning: "Morning fog can affect visibility on early drives.", clothingAdvice: "Layer up for cold mornings that warm by afternoon." },
      { season: "Summer", months: "April – June", icon: "🔥", tempRange: "25°C – 42°C", feels: "Hot and dry", carry: ["Light cotton clothing", "Sunscreen"], warning: "Afternoons get very hot — plan sightseeing for morning or evening.", clothingAdvice: "Light, breathable fabrics." },
      { season: "Monsoon", months: "July – September", icon: "🌧️", tempRange: "25°C – 34°C", feels: "Humid with regular rain", carry: ["Raincoat", "Quick-dry clothing"], warning: "Waterlogging on roads is common after heavy spells.", clothingAdvice: "Light, quick-dry clothing with rain protection." },
    ],
  }),
  Haryana: T({
    language: "Haryanvi and Hindi are the main languages; Hindi/English work fine for travellers",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "4°C – 20°C", feels: "Cold, foggy mornings", carry: ["Warm jacket", "Scarf"], warning: "Dense fog is common on winter mornings — factor in extra travel time.", clothingAdvice: "Layer up; mornings are notably colder than afternoons." },
      { season: "Summer", months: "April – June", icon: "🔥", tempRange: "27°C – 45°C", feels: "Hot and dry", carry: ["Light cotton clothing", "Sunscreen", "Water bottle"], warning: "Summer heat is intense — avoid midday outdoor activity.", clothingAdvice: "Loose, breathable fabrics." },
      { season: "Monsoon", months: "July – September", icon: "🌧️", tempRange: "26°C – 35°C", feels: "Hot and humid with heavy spells", carry: ["Raincoat", "Quick-dry clothing"], warning: "Roads can waterlog after heavy rain — build in extra travel time.", clothingAdvice: "Light, quick-dry clothing with rain protection." },
    ],
  }),
  Punjab: T({
    language: "Punjabi is the main language; Hindi and English are widely understood, especially in tourist areas",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "4°C – 19°C", feels: "Cold, often foggy", carry: ["Warm jacket", "Thermals"], warning: "Winter fog regularly disrupts road and rail travel — check ahead.", clothingAdvice: "Layer up; evenings get cold fast." },
      { season: "Summer", months: "April – June", icon: "🔥", tempRange: "26°C – 44°C", feels: "Hot and dry", carry: ["Light cotton clothing", "Sunscreen"], warning: "Summer afternoons are harsh — plan around them.", clothingAdvice: "Loose, light fabrics." },
      { season: "Monsoon", months: "July – September", icon: "🌧️", tempRange: "25°C – 34°C", feels: "Humid with regular rain", carry: ["Raincoat", "Quick-dry clothing"], warning: "Canal/low-lying areas can see localized flooding after heavy spells.", clothingAdvice: "Light, quick-dry clothing with rain protection." },
    ],
  }),
  "Uttar Pradesh": T({
    language: "Hindi is the main language; English works in tourist hubs and hotels",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "5°C – 22°C", feels: "Cold mornings, mild afternoons", carry: ["Warm jacket", "Scarf", "Layers"], warning: "Morning fog is common and can delay early trains/flights, especially in December–January.", clothingAdvice: "Layer up for the cold start, lighter by afternoon." },
      { season: "Summer", months: "April – June", icon: "🔥", tempRange: "27°C – 45°C", feels: "Hot and dry", carry: ["Light cotton clothing", "Sunscreen", "Extra water"], warning: "Peak summer heat is intense — sightsee early morning or evening.", clothingAdvice: "Loose, breathable cotton." },
      { season: "Monsoon", months: "July – September", icon: "🌧️", tempRange: "26°C – 34°C", feels: "Hot and humid with heavy spells", carry: ["Raincoat", "Quick-dry clothing"], warning: "Low-lying riverside areas (Ganga/Yamuna) can see flooding in a heavy monsoon — check conditions.", clothingAdvice: "Light, quick-dry clothing with rain protection." },
    ],
  }),
  Uttarakhand: T({
    language: "Hindi and Garhwali/Kumaoni locally; English works in the more touristy hill towns",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "-2°C – 15°C", feels: "Cold, snow at higher altitudes", carry: ["Heavy jacket", "Thermals", "Gloves", "Sturdy shoes"], warning: "Higher hill towns can see snow and road closures — check conditions before travelling.", clothingAdvice: "Proper winter layers, especially above 1,500m." },
      { season: "Summer", months: "April – June", icon: "☀️", tempRange: "15°C – 30°C", feels: "Pleasant in the hills, warmer in the plains/foothills", carry: ["Light layers", "A light jacket for evenings", "Sunscreen"], warning: "Peak tourist season for hill stations — book stays and transport well ahead.", clothingAdvice: "Light daywear with a jacket for cool hill evenings." },
      { season: "Monsoon", months: "July – September", icon: "🌧️", tempRange: "15°C – 28°C", feels: "Wet, humid", carry: ["Raincoat", "Quick-dry clothing", "Waterproof footwear"], warning: "Landslides are a real risk on hill roads during heavy monsoon — check road status before driving.", clothingAdvice: "Light, quick-dry layers with rain protection." },
    ],
  }),
  "Himachal Pradesh": T({
    language: "Hindi and Pahari locally; English works well in touristy hill stations",
    weatherSeasons: [
      { season: "Winter", months: "December – February", icon: "❄️", tempRange: "-5°C – 12°C", feels: "Cold, snow likely at higher elevations", carry: ["Heavy jacket", "Thermals", "Gloves", "Snow boots"], warning: "Snowfall can close mountain roads for days — have a flexible itinerary.", clothingAdvice: "Serious winter layers, especially above 2,000m." },
      { season: "Summer", months: "April – June", icon: "☀️", tempRange: "15°C – 30°C", feels: "Pleasant, the classic hill-station escape from the plains' heat", carry: ["Light layers", "A light jacket for evenings"], warning: "This is peak tourist season — book stays and transport well ahead.", clothingAdvice: "Light daywear, a proper jacket for cool evenings." },
      { season: "Monsoon", months: "July – September", icon: "🌧️", tempRange: "15°C – 25°C", feels: "Wet, cooler", carry: ["Raincoat", "Waterproof shoes"], warning: "Landslides and road blocks are common on mountain routes — check conditions ahead.", clothingAdvice: "Light layers with rain protection." },
    ],
  }),
  "Jammu and Kashmir (UT)": T({
    language: "Kashmiri, Dogri, and Urdu locally; Hindi and English both work for travellers",
    weatherSeasons: [
      { season: "Winter", months: "December – February", icon: "❄️", tempRange: "-7°C – 10°C", feels: "Very cold, heavy snow likely", carry: ["Heavy winter jacket", "Thermals", "Snow boots", "Gloves"], warning: "Roads to higher areas can close for days after snowfall — build in flexible days.", clothingAdvice: "Full winter gear; layering is essential." },
      { season: "Summer", months: "April – June", icon: "☀️", tempRange: "15°C – 30°C", feels: "Pleasant, cool evenings", carry: ["Light layers", "A light jacket for evenings"], warning: "This is peak tourist season — book ahead for stays and transport.", clothingAdvice: "Light daywear, a jacket for cool evenings." },
      { season: "Monsoon", months: "July – September", icon: "🌧️", tempRange: "18°C – 30°C", feels: "Warm with occasional rain — much lighter monsoon than the plains", carry: ["Light raincoat", "Layers for cooler evenings"], warning: "Generally a safe time to visit, but mountain roads can still see brief closures after heavy spells.", clothingAdvice: "Light layers with a jacket for evenings." },
    ],
  }),
  "Ladakh (UT)": T({
    language: "Ladakhi locally; Hindi and English both work in tourist areas",
    weatherSeasons: [
      { season: "Summer (peak season)", months: "May – September", icon: "☀️", tempRange: "4°C – 25°C", feels: "Cool, intense sun, cold nights", carry: ["Sun protection", "Warm layers for night", "Lip balm", "Moisturizer"], warning: "High-altitude sun is intense even when it's cool — sunburn happens fast. Acclimatize for 1-2 days before any strenuous activity.", clothingAdvice: "Layer heavily — big day-night temperature swings even in 'summer'." },
      { season: "Shoulder Season", months: "April & October", icon: "🍂", tempRange: "-5°C – 15°C", feels: "Cold, passes just opening/closing", carry: ["Heavy jacket", "Thermals", "Warm gloves"], warning: "High mountain passes may still be closed or just reopening — confirm road status before planning a route through them.", clothingAdvice: "Pack for genuine cold even though it's technically spring/autumn." },
      { season: "Winter", months: "November – March", icon: "❄️", tempRange: "-25°C – 5°C", feels: "Extremely cold", carry: ["Heavy-duty winter gear", "Thermals", "Insulated boots"], warning: "Most high passes close entirely — Ladakh is largely accessible by air only in deep winter.", clothingAdvice: "Serious expedition-grade winter clothing." },
    ],
  }),
  Sikkim: T({
    language: "Nepali, Bhutia, and Lepcha locally; Hindi and English both work for travellers",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "-2°C – 15°C", feels: "Cold, snow at higher elevations", carry: ["Heavy jacket", "Thermals", "Gloves"], warning: "Higher-altitude roads can close after snowfall — check ahead.", clothingAdvice: "Proper winter layers, more at higher elevations." },
      { season: "Spring/Summer", months: "March – May", icon: "☀️", tempRange: "10°C – 22°C", feels: "Pleasant, rhododendrons in bloom at altitude", carry: ["Light layers", "A light jacket for evenings"], warning: "A popular season for trekking — book permits and stays ahead.", clothingAdvice: "Light layers with a warm layer for higher altitude." },
      { season: "Monsoon", months: "June – September", icon: "🌧️", tempRange: "12°C – 24°C", feels: "Wet, humid", carry: ["Raincoat", "Waterproof shoes"], warning: "Landslides are common on hill roads — check conditions before travelling.", clothingAdvice: "Light layers with rain protection." },
    ],
  }),
  "Arunachal Pradesh": T({
    language: "Many local languages; Hindi and English both work for travellers in main towns",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "0°C – 18°C", feels: "Cold, colder at altitude", carry: ["Warm jacket", "Thermals"], warning: "Permits are required for many areas — arrange these well in advance.", clothingAdvice: "Layer up, especially for higher-altitude areas." },
      { season: "Spring/Summer", months: "March – May", icon: "☀️", tempRange: "12°C – 25°C", feels: "Pleasant", carry: ["Light layers", "A light jacket for evenings"], warning: "A good window before the monsoon sets in — roads are generally more reliable.", clothingAdvice: "Light layers with a warm layer for altitude." },
      { season: "Monsoon", months: "June – September", icon: "🌧️", tempRange: "15°C – 28°C", feels: "Wet, humid", carry: ["Raincoat", "Quick-dry clothing"], warning: "Heavy rain can disrupt mountain roads — build in flexible days.", clothingAdvice: "Light, quick-dry layers with rain protection." },
    ],
  }),
  Assam: T({
    language: "Assamese locally; Hindi and English both work for travellers",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "10°C – 25°C", feels: "Mild and pleasant", carry: ["Light jacket for mornings/evenings"], warning: "This is the most comfortable season to visit — book ahead as it's popular.", clothingAdvice: "Light layers; mornings and evenings are cooler." },
      { season: "Summer", months: "March – May", icon: "🔥", tempRange: "22°C – 32°C", feels: "Warm and humid, building toward monsoon", carry: ["Light cotton clothing", "Sunscreen"], warning: "Humidity builds noticeably through May.", clothingAdvice: "Light, breathable clothing." },
      { season: "Monsoon", months: "June – September", icon: "🌧️", tempRange: "24°C – 33°C", feels: "Hot and very humid", carry: ["Raincoat", "Quick-dry clothing", "Insect repellent"], warning: "Heavy monsoon flooding is common, including around the Brahmaputra — check conditions before travelling.", clothingAdvice: "Light, breathable, quick-dry clothing." },
    ],
  }),
  Meghalaya: T({
    language: "Khasi, Garo, and Jaintia locally; Hindi and English both work for travellers",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "8°C – 22°C", feels: "Cool and pleasant", carry: ["Light jacket", "Layers for evenings"], warning: "The most comfortable season to visit — book stays ahead.", clothingAdvice: "Light layers; evenings are noticeably cooler." },
      { season: "Spring", months: "March – April", icon: "☀️", tempRange: "12°C – 24°C", feels: "Pleasant, before the rains build", carry: ["Light layers"], warning: "A good shoulder-season window with fewer crowds than winter.", clothingAdvice: "Light layers." },
      { season: "Monsoon", months: "May – September", icon: "🌧️", tempRange: "15°C – 25°C", feels: "Extremely wet", carry: ["Serious raincoat", "Waterproof footwear", "Dry bags for electronics"], warning: "This region includes some of the wettest places on Earth — expect near-daily heavy rain and check road conditions before travelling.", clothingAdvice: "Proper rain gear is non-negotiable here." },
    ],
  }),
  Nagaland: T({
    language: "Many local languages; Nagamese, Hindi, and English all work for travellers",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "8°C – 24°C", feels: "Mild and pleasant", carry: ["Light jacket for mornings/evenings"], warning: "The most comfortable season, and when the Hornbill Festival (December) draws crowds — book ahead.", clothingAdvice: "Light layers for cool mornings and evenings." },
      { season: "Spring", months: "March – April", icon: "☀️", tempRange: "14°C – 26°C", feels: "Pleasant, before the rains build", carry: ["Light layers"], warning: "A quieter, pleasant shoulder season.", clothingAdvice: "Light layers." },
      { season: "Monsoon", months: "May – September", icon: "🌧️", tempRange: "18°C – 30°C", feels: "Hot and humid", carry: ["Raincoat", "Quick-dry clothing"], warning: "Heavy rain can affect hill roads — check conditions ahead.", clothingAdvice: "Light, breathable, quick-dry clothing." },
    ],
  }),
  Manipur: T({
    language: "Meiteilon (Manipuri) locally; Hindi and English both work for travellers",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "6°C – 22°C", feels: "Cool and pleasant", carry: ["Light jacket"], warning: "The most comfortable season to visit.", clothingAdvice: "Light layers for cooler mornings and evenings." },
      { season: "Spring", months: "March – April", icon: "☀️", tempRange: "14°C – 25°C", feels: "Pleasant, before the rains build", carry: ["Light layers"], warning: "A quieter, pleasant shoulder season.", clothingAdvice: "Light layers." },
      { season: "Monsoon", months: "May – September", icon: "🌧️", tempRange: "20°C – 30°C", feels: "Hot and humid", carry: ["Raincoat", "Quick-dry clothing"], warning: "Heavy rain is common — check road conditions before travelling.", clothingAdvice: "Light, breathable clothing with rain protection." },
    ],
  }),
  Mizoram: T({
    language: "Mizo locally; Hindi and English both work for travellers",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "11°C – 24°C", feels: "Mild and pleasant", carry: ["Light jacket for evenings"], warning: "The most comfortable season to visit.", clothingAdvice: "Light layers; evenings are cooler." },
      { season: "Spring", months: "March – April", icon: "☀️", tempRange: "16°C – 26°C", feels: "Pleasant, before the rains build", carry: ["Light layers"], warning: "A quieter, pleasant shoulder season.", clothingAdvice: "Light layers." },
      { season: "Monsoon", months: "May – September", icon: "🌧️", tempRange: "18°C – 28°C", feels: "Wet and humid", carry: ["Raincoat", "Quick-dry clothing"], warning: "Heavy rain can affect hill roads — check conditions ahead.", clothingAdvice: "Light, quick-dry clothing with rain protection." },
    ],
  }),
  Tripura: T({
    language: "Bengali and Kokborok locally; Hindi and English both work for travellers",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "12°C – 25°C", feels: "Mild and pleasant", carry: ["Light jacket for evenings"], warning: "The most comfortable season to visit.", clothingAdvice: "Light layers." },
      { season: "Summer", months: "March – April", icon: "☀️", tempRange: "20°C – 30°C", feels: "Warm, building humidity", carry: ["Light cotton clothing"], warning: "A quieter shoulder season before the rains.", clothingAdvice: "Light, breathable clothing." },
      { season: "Monsoon", months: "May – September", icon: "🌧️", tempRange: "24°C – 32°C", feels: "Hot and humid", carry: ["Raincoat", "Quick-dry clothing"], warning: "Heavy rainfall is common this season.", clothingAdvice: "Light, breathable clothing." },
    ],
  }),
  "Madhya Pradesh": T({
    language: "Hindi is the main language; English works in tourist hubs",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "8°C – 25°C", feels: "Pleasant, cool mornings", carry: ["Light jacket", "Layers for mornings"], warning: "The most comfortable season for sightseeing and wildlife safaris.", clothingAdvice: "Light layers for cool mornings and evenings." },
      { season: "Summer", months: "April – June", icon: "🔥", tempRange: "25°C – 45°C", feels: "Hot and dry", carry: ["Light cotton clothing", "Sunscreen", "Extra water"], warning: "Summer heat is intense — plan outdoor activity for early morning.", clothingAdvice: "Loose, breathable fabrics." },
      { season: "Monsoon", months: "July – September", icon: "🌧️", tempRange: "24°C – 33°C", feels: "Humid with regular rain", carry: ["Raincoat", "Quick-dry clothing"], warning: "Many wildlife parks close for the season (check specific park dates) and roads can be affected by heavy rain.", clothingAdvice: "Light, quick-dry clothing with rain protection." },
    ],
  }),
  Chhattisgarh: T({
    language: "Hindi and Chhattisgarhi locally; Hindi works well for travellers",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "10°C – 26°C", feels: "Pleasant", carry: ["Light jacket for mornings"], warning: "The most comfortable season to visit.", clothingAdvice: "Light layers." },
      { season: "Summer", months: "April – June", icon: "🔥", tempRange: "26°C – 44°C", feels: "Hot and dry", carry: ["Light cotton clothing", "Sunscreen"], warning: "Summer afternoons get very hot.", clothingAdvice: "Loose, breathable fabrics." },
      { season: "Monsoon", months: "July – September", icon: "🌧️", tempRange: "23°C – 32°C", feels: "Humid with heavy spells", carry: ["Raincoat", "Quick-dry clothing"], warning: "Waterfalls are at their most dramatic now, but access roads can be slippery — take care.", clothingAdvice: "Light, quick-dry clothing with rain protection." },
    ],
  }),
  Jharkhand: T({
    language: "Hindi is the main language, alongside regional tribal languages; English works in tourist hubs",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "8°C – 25°C", feels: "Pleasant, cool mornings", carry: ["Light jacket"], warning: "The most comfortable season to visit.", clothingAdvice: "Light layers for cooler mornings." },
      { season: "Summer", months: "April – June", icon: "🔥", tempRange: "25°C – 42°C", feels: "Hot and dry", carry: ["Light cotton clothing", "Sunscreen"], warning: "Afternoons get very hot — plan around it.", clothingAdvice: "Loose, breathable fabrics." },
      { season: "Monsoon", months: "July – September", icon: "🌧️", tempRange: "23°C – 32°C", feels: "Humid with heavy spells", carry: ["Raincoat", "Quick-dry clothing"], warning: "Waterfalls and dams are at their fullest now, but paths can be slippery.", clothingAdvice: "Light, quick-dry clothing with rain protection." },
    ],
  }),
  Bihar: T({
    language: "Hindi and Maithili/Bhojpuri locally; Hindi works well for travellers",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "7°C – 24°C", feels: "Cool, foggy mornings", carry: ["Warm layers for mornings"], warning: "Morning fog can delay early travel in December–January.", clothingAdvice: "Layer up for cool mornings that warm by afternoon." },
      { season: "Summer", months: "April – June", icon: "🔥", tempRange: "26°C – 43°C", feels: "Hot and dry", carry: ["Light cotton clothing", "Sunscreen", "Extra water"], warning: "Summer heat is intense — avoid midday sightseeing.", clothingAdvice: "Loose, breathable cotton." },
      { season: "Monsoon", months: "July – September", icon: "🌧️", tempRange: "25°C – 33°C", feels: "Hot and humid", carry: ["Raincoat", "Quick-dry clothing"], warning: "Riverside/low-lying areas can see flooding in a heavy monsoon — check conditions.", clothingAdvice: "Light, quick-dry clothing with rain protection." },
    ],
  }),
  "West Bengal": T({
    language: "Bengali is the main language; Hindi and English both work in tourist areas",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "10°C – 27°C", feels: "Pleasant and mild", carry: ["Light jacket for evenings"], warning: "The most comfortable, and most popular, season — book ahead.", clothingAdvice: "Light layers for cooler evenings." },
      { season: "Summer", months: "March – May", icon: "🔥", tempRange: "24°C – 38°C", feels: "Hot and humid, with sudden pre-monsoon thunderstorms (kalbaishakhi)", carry: ["Light cotton clothing", "Sunscreen"], warning: "Sudden, intense afternoon thunderstorms are common — keep an eye on the sky.", clothingAdvice: "Light, breathable clothing." },
      { season: "Monsoon", months: "June – September", icon: "🌧️", tempRange: "26°C – 33°C", feels: "Hot and very humid", carry: ["Raincoat", "Quick-dry clothing"], warning: "Coastal/delta areas face real cyclone risk in this season — check weather advisories before travelling.", clothingAdvice: "Light, breathable, quick-dry clothing." },
    ],
  }),
  Odisha: T({
    language: "Odia is the main language; Hindi and English both work in tourist areas",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "14°C – 28°C", feels: "Pleasant and mild", carry: ["Light jacket for evenings"], warning: "The most comfortable season for sightseeing.", clothingAdvice: "Light layers." },
      { season: "Summer", months: "March – May", icon: "🔥", tempRange: "26°C – 40°C", feels: "Hot and humid near the coast", carry: ["Light cotton clothing", "Sunscreen"], warning: "Coastal humidity makes the heat feel worse than the number suggests.", clothingAdvice: "Light, breathable clothing." },
      { season: "Monsoon", months: "June – September", icon: "🌧️", tempRange: "25°C – 33°C", feels: "Hot and humid", carry: ["Raincoat", "Quick-dry clothing"], warning: "Coastal Odisha faces real cyclone risk in this season — check advisories before travelling.", clothingAdvice: "Light, breathable, quick-dry clothing." },
    ],
  }),
  Gujarat: T({
    language: "Gujarati is the main language; Hindi and English both work in tourist areas",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "10°C – 28°C", feels: "Pleasant, cool evenings", carry: ["Light jacket for evenings"], warning: "The most comfortable season for sightseeing.", clothingAdvice: "Light layers for cooler evenings." },
      { season: "Summer", months: "April – June", icon: "🔥", tempRange: "28°C – 45°C", feels: "Hot and dry", carry: ["Light cotton clothing", "Sunscreen", "Extra water"], warning: "Summer heat is intense, especially inland (Kutch/Ahmedabad) — plan around it.", clothingAdvice: "Loose, breathable cotton." },
      { season: "Monsoon", months: "July – September", icon: "🌧️", tempRange: "26°C – 34°C", feels: "Humid with heavy spells", carry: ["Raincoat", "Quick-dry clothing"], warning: "The Rann of Kutch becomes inaccessible/flooded in this season — check specific site access.", clothingAdvice: "Light, quick-dry clothing with rain protection." },
    ],
  }),
  Maharashtra: T({
    language: "Marathi is the main language; Hindi and English both work well, especially near Mumbai/Pune",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "12°C – 30°C", feels: "Mild and pleasant", carry: ["Light layers for evenings"], warning: "The most comfortable season for sightseeing.", clothingAdvice: "Light layers." },
      { season: "Summer", months: "March – May", icon: "🔥", tempRange: "24°C – 40°C", feels: "Hot, especially inland", carry: ["Light cotton clothing", "Sunscreen", "Extra water"], warning: "Interior Maharashtra (Nagpur/Vidarbha) gets considerably hotter than the Mumbai/coastal belt.", clothingAdvice: "Loose, breathable fabrics." },
      { season: "Monsoon", months: "June – September", icon: "🌧️", tempRange: "22°C – 30°C", feels: "Wet and humid", carry: ["Raincoat", "Quick-dry clothing", "Waterproof footwear"], warning: "Coastal and hill areas see very heavy rain and occasional flooding — check conditions before travelling.", clothingAdvice: "Light, quick-dry clothing with real rain protection." },
    ],
  }),
  Goa: T({
    language: "Konkani is the main language; Hindi and English both work everywhere here",
    weatherSeasons: [
      { season: "Winter (peak season)", months: "November – February", icon: "☀️", tempRange: "20°C – 32°C", feels: "Warm and pleasant", carry: ["Light cotton clothing", "Sunscreen", "Swimwear"], warning: "This is peak tourist season — book stays and transport well ahead.", clothingAdvice: "Light, breathable summer clothing." },
      { season: "Summer", months: "March – May", icon: "🔥", tempRange: "26°C – 35°C", feels: "Hot and increasingly humid ahead of the rains", carry: ["Light cotton clothing", "Sunscreen", "Extra water"], warning: "Noticeably quieter and hotter than winter — some travellers prefer it for lower prices, but midday heat is intense.", clothingAdvice: "Light, breathable clothing." },
      { season: "Monsoon", months: "June – September", icon: "🌧️", tempRange: "24°C – 30°C", feels: "Wet and humid", carry: ["Raincoat", "Quick-dry clothing"], warning: "Beaches get rough and many shacks close for the season — check what's actually open before planning around them.", clothingAdvice: "Light, quick-dry clothing with rain protection." },
    ],
  }),
  Karnataka: T({
    language: "Kannada is the main language; Hindi and English both work well, especially in Bengaluru/Mysuru",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "15°C – 28°C", feels: "Pleasant and mild", carry: ["Light jacket for evenings"], warning: "The most comfortable season for sightseeing.", clothingAdvice: "Light layers." },
      { season: "Summer", months: "March – May", icon: "🔥", tempRange: "22°C – 38°C", feels: "Warm, hotter inland/north", carry: ["Light cotton clothing", "Sunscreen"], warning: "Interior/northern Karnataka gets considerably hotter than Bengaluru — check local conditions.", clothingAdvice: "Light, breathable fabrics." },
      { season: "Monsoon", months: "June – September", icon: "🌧️", tempRange: "20°C – 28°C", feels: "Wet, especially along the coast and Western Ghats", carry: ["Raincoat", "Quick-dry clothing", "Waterproof footwear"], warning: "Coastal Karnataka and hill areas (Coorg, Chikmagalur) see very heavy rain — check road/trek conditions.", clothingAdvice: "Light, quick-dry clothing with real rain protection." },
    ],
  }),
  Kerala: T({
    language: "Malayalam is the main language; Hindi and English both work in tourist areas",
    weatherSeasons: [
      { season: "Winter/Dry Season", months: "November – February", icon: "☀️", tempRange: "22°C – 32°C", feels: "Warm and humid, most comfortable time", carry: ["Light cotton clothing", "Sunscreen"], warning: "Peak tourist season — book houseboats and stays well ahead.", clothingAdvice: "Light, breathable cotton." },
      { season: "Summer", months: "March – May", icon: "🔥", tempRange: "25°C – 36°C", feels: "Hot and increasingly humid ahead of the rains", carry: ["Light cotton clothing", "Sunscreen", "Extra water"], warning: "Humidity builds noticeably through May.", clothingAdvice: "Light, breathable cotton." },
      { season: "Monsoon", months: "June – September", icon: "🌧️", tempRange: "23°C – 30°C", feels: "Very wet and humid", carry: ["Raincoat", "Quick-dry clothing", "Waterproof footwear"], warning: "Kerala's monsoon is intense (it's the state that gets it first each year) — backwater/boat plans can be affected.", clothingAdvice: "Light, quick-dry clothing with serious rain protection." },
    ],
  }),
  "Tamil Nadu": T({
    language: "Tamil is the main language; Hindi is less common here — English works well in tourist areas",
    weatherSeasons: [
      { season: "Winter/Dry Season", months: "January – February", icon: "☀️", tempRange: "20°C – 30°C", feels: "Warm and pleasant, coolest time of year", carry: ["Light cotton clothing", "Sunscreen"], warning: "The most comfortable season for sightseeing.", clothingAdvice: "Light, breathable cotton." },
      { season: "Summer", months: "March – June", icon: "🔥", tempRange: "26°C – 40°C", feels: "Hot and dry, especially inland", carry: ["Light cotton clothing", "Sunscreen", "Extra water"], warning: "Interior Tamil Nadu (Madurai, Tiruchirappalli) gets considerably hotter than the coast.", clothingAdvice: "Loose, breathable cotton." },
      { season: "Northeast Monsoon", months: "October – December", icon: "🌧️", tempRange: "22°C – 29°C", feels: "Wet and humid", carry: ["Raincoat", "Quick-dry clothing"], warning: "Unlike most of India, Tamil Nadu's main monsoon is in Oct-Dec (not June-Sept) — check this before planning around 'monsoon season.'", clothingAdvice: "Light, quick-dry clothing with rain protection." },
    ],
  }),
  Telangana: T({
    language: "Telugu is the main language; Hindi and English both work well, especially in Hyderabad",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "14°C – 29°C", feels: "Pleasant and mild", carry: ["Light jacket for evenings"], warning: "The most comfortable season for sightseeing.", clothingAdvice: "Light layers." },
      { season: "Summer", months: "March – June", icon: "🔥", tempRange: "24°C – 42°C", feels: "Hot and dry", carry: ["Light cotton clothing", "Sunscreen", "Extra water"], warning: "Summer heat is intense — plan outdoor activity for morning or evening.", clothingAdvice: "Loose, breathable fabrics." },
      { season: "Monsoon", months: "July – September", icon: "🌧️", tempRange: "23°C – 32°C", feels: "Humid with regular rain", carry: ["Raincoat", "Quick-dry clothing"], warning: "Roads can waterlog after heavy spells — factor in extra travel time.", clothingAdvice: "Light, quick-dry clothing with rain protection." },
    ],
  }),
  "Andhra Pradesh": T({
    language: "Telugu is the main language; Hindi and English both work in tourist areas",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "16°C – 29°C", feels: "Pleasant and mild", carry: ["Light jacket for evenings"], warning: "The most comfortable season for sightseeing.", clothingAdvice: "Light layers." },
      { season: "Summer", months: "March – June", icon: "🔥", tempRange: "26°C – 42°C", feels: "Hot and humid near the coast", carry: ["Light cotton clothing", "Sunscreen", "Extra water"], warning: "Coastal humidity makes summer heat feel worse than the number suggests.", clothingAdvice: "Light, breathable fabrics." },
      { season: "Monsoon", months: "July – September", icon: "🌧️", tempRange: "24°C – 32°C", feels: "Humid with regular rain", carry: ["Raincoat", "Quick-dry clothing"], warning: "Coastal Andhra faces occasional cyclone risk in this season — check advisories before travelling.", clothingAdvice: "Light, quick-dry clothing with rain protection." },
    ],
  }),
  Puducherry: T({
    language: "Tamil and French influence locally; English works well throughout this touristy town",
    weatherSeasons: [
      { season: "Winter/Dry Season", months: "January – February", icon: "☀️", tempRange: "20°C – 30°C", feels: "Warm and pleasant", carry: ["Light cotton clothing", "Sunscreen"], warning: "The most comfortable season for sightseeing.", clothingAdvice: "Light, breathable cotton." },
      { season: "Summer", months: "March – June", icon: "🔥", tempRange: "26°C – 38°C", feels: "Hot and humid", carry: ["Light cotton clothing", "Sunscreen", "Extra water"], warning: "Midday heat is intense near the coast.", clothingAdvice: "Light, breathable cotton." },
      { season: "Northeast Monsoon", months: "October – December", icon: "🌧️", tempRange: "23°C – 29°C", feels: "Wet and humid", carry: ["Raincoat", "Quick-dry clothing"], warning: "Main monsoon here is Oct-Dec, not the June-Sept most of India sees.", clothingAdvice: "Light, quick-dry clothing with rain protection." },
    ],
  }),
  Lakshadweep: T({
    language: "Malayalam is widely spoken; English works for travellers (permits required for most islands)",
    weatherSeasons: [
      { season: "Peak Season", months: "November – February", icon: "☀️", tempRange: "24°C – 31°C", feels: "Warm, tropical, calmest seas", carry: ["Light cotton clothing", "Reef-safe sunscreen", "Swimwear"], warning: "The most popular and most reliable window — book well ahead.", clothingAdvice: "Light, breathable tropical wear." },
      { season: "Shoulder Season", months: "March – May", icon: "☀️", tempRange: "26°C – 33°C", feels: "Warm and increasingly humid", carry: ["Light cotton clothing", "Reef-safe sunscreen"], warning: "Still a workable window before monsoon, with fewer crowds.", clothingAdvice: "Light, breathable tropical wear." },
      { season: "Monsoon", months: "June – September", icon: "🌧️", tempRange: "24°C – 30°C", feels: "Wet, rough seas", carry: ["Raincoat"], warning: "Ferry/boat access is unreliable in this season — most trips are scheduled outside it.", clothingAdvice: "Light, quick-dry clothing." },
    ],
  }),
  "Andaman & Nicobar": T({
    language: "Hindi, Bengali, and Tamil are common among settlers; English works well for travellers",
    weatherSeasons: [
      { season: "Peak Season", months: "December – February", icon: "☀️", tempRange: "23°C – 30°C", feels: "Warm, tropical, best diving visibility", carry: ["Light cotton clothing", "Reef-safe sunscreen", "Swimwear"], warning: "The best window for diving/snorkeling visibility — book ahead, it's popular.", clothingAdvice: "Light, breathable tropical wear." },
      { season: "Shoulder Season", months: "November & March – April", icon: "☀️", tempRange: "24°C – 31°C", feels: "Warm, tropical, slightly more humid", carry: ["Light cotton clothing", "Reef-safe sunscreen"], warning: "Good value window with fewer crowds and still-decent conditions.", clothingAdvice: "Light, breathable tropical wear." },
      { season: "Monsoon", months: "May – October", icon: "🌧️", tempRange: "23°C – 30°C", feels: "Wet, rough seas", carry: ["Raincoat", "Quick-dry clothing"], warning: "Inter-island ferries are often disrupted — build flexibility into island-hopping plans.", clothingAdvice: "Light, quick-dry clothing with rain protection." },
    ],
  }),
  "Dadra and Nagar Haveli (UT)": T({
    language: "Gujarati and Hindi are common; English works in tourist areas",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "14°C – 30°C", feels: "Pleasant", carry: ["Light layers for evenings"], warning: "The most comfortable season for sightseeing.", clothingAdvice: "Light layers." },
      { season: "Summer", months: "March – May", icon: "🔥", tempRange: "26°C – 40°C", feels: "Hot and humid", carry: ["Light cotton clothing", "Sunscreen"], warning: "Heat and humidity build through May ahead of monsoon.", clothingAdvice: "Light, breathable fabrics." },
      { season: "Monsoon", months: "June – September", icon: "🌧️", tempRange: "24°C – 32°C", feels: "Humid with heavy spells", carry: ["Raincoat", "Quick-dry clothing"], warning: "Heavy rain is common — check conditions before travelling.", clothingAdvice: "Light, quick-dry clothing with rain protection." },
    ],
  }),
  "Daman (UT)": T({
    language: "Gujarati and Hindi are common; English works in tourist areas",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "❄️", tempRange: "15°C – 29°C", feels: "Pleasant, coastal", carry: ["Light layers for evenings"], warning: "The most comfortable season for sightseeing.", clothingAdvice: "Light layers." },
      { season: "Summer", months: "March – May", icon: "🔥", tempRange: "27°C – 38°C", feels: "Hot and humid", carry: ["Light cotton clothing", "Sunscreen"], warning: "Coastal humidity builds through May ahead of monsoon.", clothingAdvice: "Light, breathable clothing." },
      { season: "Monsoon", months: "June – September", icon: "🌧️", tempRange: "24°C – 30°C", feels: "Wet and humid", carry: ["Raincoat", "Quick-dry clothing"], warning: "Coastal monsoon can be heavy — check conditions before travelling.", clothingAdvice: "Light, quick-dry clothing." },
    ],
  }),
  "Diu (UT)": T({
    language: "Gujarati and Hindi are common; English works in tourist areas",
    weatherSeasons: [
      { season: "Winter", months: "November – February", icon: "☀️", tempRange: "16°C – 29°C", feels: "Pleasant, coastal breeze", carry: ["Light layers for evenings"], warning: "The most comfortable season, and peak season for this small coastal town — book ahead.", clothingAdvice: "Light, breathable clothing." },
      { season: "Summer", months: "March – May", icon: "🔥", tempRange: "27°C – 37°C", feels: "Hot and humid", carry: ["Light cotton clothing", "Sunscreen"], warning: "Coastal humidity builds through May ahead of monsoon.", clothingAdvice: "Light, breathable clothing." },
      { season: "Monsoon", months: "June – September", icon: "🌧️", tempRange: "24°C – 30°C", feels: "Wet and humid", carry: ["Raincoat", "Quick-dry clothing"], warning: "Coastal monsoon can be heavy with rough seas — check conditions.", clothingAdvice: "Light, quick-dry clothing." },
    ],
  }),
};

export function getStateTemplate(state: string): StateTemplate {
  const key = state === "Puducherry (UT)" ? "Puducherry" : state;
  return (
    STATE_JOURNEY_TEMPLATES[key] ??
    // Generic, honest fallback for any state string that doesn't match
    // (shouldn't happen given the 37 keys above cover every state used in
    // destinations.ts, but this avoids a hard crash if a new one is ever
    // added without updating this file too).
    T({
      language: "Hindi and English both work for travellers in most tourist areas, alongside the local regional language",
      weatherSeasons: [
        { season: "Winter", months: "November – February", icon: "❄️", tempRange: "10°C – 28°C", feels: "Generally the most pleasant season", carry: ["Light jacket for mornings/evenings"], warning: "Check local conditions closer to your travel date.", clothingAdvice: "Light layers." },
        { season: "Summer", months: "April – June", icon: "🔥", tempRange: "25°C – 42°C", feels: "Hot", carry: ["Light cotton clothing", "Sunscreen", "Extra water"], warning: "Expect hot conditions — plan outdoor activity for morning or evening.", clothingAdvice: "Loose, breathable fabrics." },
        { season: "Monsoon", months: "July – September", icon: "🌧️", tempRange: "24°C – 33°C", feels: "Humid with regular rain", carry: ["Raincoat", "Quick-dry clothing"], warning: "Check local road/rain conditions before travelling in this season.", clothingAdvice: "Light, quick-dry clothing with rain protection." },
      ],
    })
  );
}

export { NATIONAL_EMERGENCY, NATIONAL_POWER, NATIONAL_UPI };
