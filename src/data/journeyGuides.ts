export interface ArrivalPoint {
  by: string;
  icon: string;
  name: string;            // e.g. "Indira Gandhi International Airport T3"
  distanceFromCity: string;
  toAccommodation: ArrivalStep[];
}

export interface ArrivalStep {
  step: number;
  icon: string;
  action: string;
  cost: string;
  duration: string;
  tip: string;
}

export interface WeatherSeason {
  season: string;
  months: string;
  icon: string;
  tempRange: string;
  feels: string;
  carry: string[];
  warning: string;
  clothingAdvice: string;
}

export interface CityHurdle {
  icon: string;
  issue: string;
  solution: string;
  severity: "high" | "medium" | "low";
}

export interface LocalAttraction {
  name: string;
  type: string;
  distanceFromCenter: string;
  entryFee: string;
  timing: string;
  bestTime: string;
  insiderTip: string;
  mustDo: boolean;
}

export interface CityEssentials {
  atm: string;
  sim: string;
  wifi: string;
  medical: string;
  language: string;
  localEmergency: string;
  upi: string;
  powerOutlet: string;
}

export interface AdvisoryAlert {
  level: "info" | "caution" | "warning";
  icon: string;
  title: string;
  detail: string;
}

export interface AdvisoryContact {
  label: string;
  number: string;
  icon: string;
}

export interface TravelAdvisory {
  updatedFrom: string;           // source, e.g. "Kerala Tourism Official"
  bestTimeToVisit: string;
  peakSeason: string;
  offSeason: string;
  alerts: AdvisoryAlert[];
  dos: string[];
  donts: string[];
  emergencyContacts: AdvisoryContact[];
  healthTips: string[];
  culturalNotes: string[];
  moneyTips: string[];
}

export interface JourneyGuide {
  destId: string;
  arrivalPoints: ArrivalPoint[];
  weatherSeasons: WeatherSeason[];
  cityHurdles: CityHurdle[];
  cityEssentials: CityEssentials;
  localAttractions: LocalAttraction[];
  fromCityToSight: string;
  firstThingsToDo: string[];
  travelAdvisory?: TravelAdvisory;
}

export const JOURNEY_GUIDES: JourneyGuide[] = [
  {
    destId: "agra",
    fromCityToSight: "From Agra Cantt railway station or the bus stand, the Taj Mahal East Gate is 6–8 km. Take a pre-paid auto (₹150) or an e-rickshaw (₹80) from the station. Do NOT accept rides from touts outside the gate — walk to the designated prepaid booth inside the station.",
    firstThingsToDo: [
      "Withdraw cash at Agra Cantt ATM before exiting the station — ATMs near Taj can run out",
      "Buy a prepaid auto from the station counter — don't negotiate with touts",
      "Check into your hotel and store valuables in the room safe",
      "Book your Taj entry tickets online (asi.payumoney.com) for the next morning — lines are long",
      "Buy water bottles at a general store (₹20) rather than near Taj (₹60+)",
    ],
    arrivalPoints: [
      {
        by: "Train",
        icon: "🚂",
        name: "Agra Cantt (AGC) — Main Station",
        distanceFromCity: "3 km from Taj Mahal",
        toAccommodation: [
          { step: 1, icon: "📍", action: "Exit from the main gate — ignore all touts calling out hotel names", cost: "—", duration: "2 min", tip: "Touts earn ₹200–₹500 per tourist they bring to shops. Politely ignore all unsolicited offers." },
          { step: 2, icon: "🛺", action: "Head to the Pre-Paid Auto Rickshaw counter (inside station, near exit)", cost: "₹80–₹150 to Taj Ganj area", duration: "15–20 min", tip: "Pre-paid autos have government fixed rates — show the printed receipt to the driver, not cash upfront." },
          { step: 3, icon: "🏨", action: "Check in to your hotel. Store passport photocopy and extra cash in hotel safe", cost: "—", duration: "10 min", tip: "Keep a photo of your passport on your phone — you'll need ID at every monument." },
          { step: 4, icon: "🎟️", action: "Book Taj Mahal tickets online for next-day sunrise slot", cost: "₹50 Indians / ₹1,100 foreigners", duration: "5 min online", tip: "Sunrise slot (6am–8am) — fewest crowds, best light, ethereal mist. Worth the early alarm." },
        ],
      },
      {
        by: "Flight",
        icon: "✈️",
        name: "Kheria Airport (AGR) — Limited flights",
        distanceFromCity: "7 km from city center",
        toAccommodation: [
          { step: 1, icon: "🚗", action: "Take prepaid taxi from airport — counter is just outside arrivals", cost: "₹400–₹600 to city", duration: "20–25 min", tip: "No Ola/Uber at Agra airport. Pre-paid official taxi is your only option. Bargain gently if no counter." },
          { step: 2, icon: "🏨", action: "Check in and freshen up — Agra is dusty. Drink sealed bottled water only.", cost: "—", duration: "—", tip: "Most people fly to Delhi and take Gatimaan Express (1h 40m). Direct Agra flights are rare and pricey." },
        ],
      },
      {
        by: "Road",
        icon: "🚗",
        name: "Agra Bus Stand (ISBT) / Idgah Bus Stand",
        distanceFromCity: "2–4 km from city center",
        toAccommodation: [
          { step: 1, icon: "🛺", action: "E-rickshaws wait right outside the bus stand", cost: "₹30–₹80 to old city", duration: "10–15 min", tip: "Idgah Bus Stand is closer to the tourist zone. If dropped at ISBT, take a shared e-rickshaw toward Taj Road." },
          { step: 2, icon: "📱", action: "If confused about navigation, open Google Maps offline (download Agra map before arriving)", cost: "—", duration: "—", tip: "Agra's lanes are confusing. Offline maps are a lifesaver — download before leaving Delhi." },
        ],
      },
    ],
    weatherSeasons: [
      {
        season: "Peak Winter", months: "November – February", icon: "❄️",
        tempRange: "5°C – 22°C", feels: "Cool to cold, especially mornings",
        carry: ["Light down jacket or fleece", "Scarf or shawl (morning fog is cold)", "Sunscreen (winter sun is deceptive)", "Comfortable walking shoes"],
        warning: "December–January mornings at Taj can be 5–8°C. The sunrise is glorious but COLD at 6am — dress in warm layers you can remove.",
        clothingAdvice: "Layer up: T-shirt + fleece + light jacket. The afternoon warms to 20°C so layers you can remove are key."
      },
      {
        season: "Summer", months: "April – June", icon: "🔥",
        tempRange: "35°C – 47°C", feels: "Extreme heat — oppressive by afternoon",
        carry: ["Loose cotton clothes only", "Wide-brim hat or cap mandatory", "SPF 50+ sunscreen", "Large water bottle (2L+)", "ORS sachets for rehydration", "Electrolyte drinks"],
        warning: "June temperatures touch 47°C. The white marble of Taj Mahal radiates intense heat. Visit ONLY before 9am or after 5pm. Avoid 11am–4pm entirely.",
        clothingAdvice: "Full-coverage light cotton (linen or cotton kurta). Do NOT wear dark colours — they absorb heat dangerously."
      },
      {
        season: "Monsoon", months: "July – September", icon: "🌧️",
        tempRange: "28°C – 38°C", feels: "Hot and humid with sudden heavy rain",
        carry: ["Compact raincoat or umbrella", "Waterproof sandals", "Quick-dry clothes", "Sealed plastic bags for electronics"],
        warning: "Marble gets extremely slippery when wet — hold railings on Taj steps. Fewer tourists make this actually a great time to visit if you don't mind rain.",
        clothingAdvice: "Light quick-dry fabrics. Avoid jeans — they take hours to dry and are miserable when wet."
      },
    ],
    cityHurdles: [
      { icon: "🪤", issue: "Marble shop touts outside Taj East Gate", solution: "The moment you get off your auto near Taj, you'll be surrounded by men claiming 'the entry is from this side' or 'my uncle runs the best marble shop'. Ignore completely. Entry is clearly signposted. Walk straight to the ticket counter.", severity: "high" },
      { icon: "📷", issue: "Photographers offering 'official' Taj photo service", solution: "There is no official photographer service. People asking to take your photo will demand ₹500+ afterward. Take your own photos or politely decline from the start.", severity: "high" },
      { icon: "🚫", issue: "Non-vegetarian food and alcohol not available near Taj", solution: "The entire Taj Ganj area is a green zone — no meat or alcohol sold. Plan accordingly. The wider city (Sadar Bazaar, MG Road) has full menus.", severity: "medium" },
      { icon: "💸", issue: "Overpriced rickshaws near tourist spots", solution: "Always book from prepaid booths at the railway station. Near Taj, use the app or agree on price BEFORE boarding. ₹80–₹150 for most tourist routes is fair.", severity: "medium" },
      { icon: "🌞", issue: "Severe afternoon heat exhaustion (summer)", solution: "If you feel dizzy or nauseous in summer, immediately move to shade, drink ORS-mixed water, and wet the back of your neck. Every tourist area has a tea stall — ask them for water.", severity: "high" },
      { icon: "📵", issue: "No mobile network inside Taj complex", solution: "Download offline Taj map before entering. Screenshot your hotel address and booking confirmation. Tell someone your plan before going in solo.", severity: "low" },
    ],
    cityEssentials: {
      atm: "SBI ATM inside Agra Cantt station is most reliable. ATMs near Taj Mahal often run out of cash by afternoon — withdraw from city ATMs in morning.",
      sim: "Buy at airport or authorised Airtel/Jio store in Sadar Bazaar. Needs passport + photo. Activated in 24h.",
      wifi: "Most mid-range hotels offer free WiFi. Taj Ganj area has spotty coverage. Download Google Maps offline before arriving.",
      medical: "S.N. Medical College (Govt): 0562-2600151. Pushpanjali Hospital (Private): 0562-4000555. Nearest 24h pharmacy: near Sadar Bazaar.",
      language: "Hindi is universal. Basic phrases work: 'Kitna?' (How much?), 'Bahut mehnga hai' (Too expensive). Most tourist area vendors speak survival English.",
      localEmergency: "Tourist Police Agra: 0562-2421204 | Women Helpline: 1091 | Police: 100",
      upi: "Google Pay and PhonePe widely accepted at hotels and most shops. Carry ₹500–₹1,000 cash for autos and small vendors.",
      powerOutlet: "India uses 230V, Type C/D plugs. Bring a universal adapter. Taj Mahal area: no charging points inside the monument.",
    },
    localAttractions: [
      { name: "Taj Mahal", type: "UNESCO Wonder", distanceFromCenter: "0 km (is the center)", entryFee: "₹50 Indians / ₹1,100 foreigners", timing: "Sunrise to sunset, closed Fridays", bestTime: "6am–8am (sunrise) or 1 hour before sunset", insiderTip: "The lesser-known Mehtab Bagh across the river gives the best Taj reflection photo with zero entry ₹25. Visit at full moon night for a magical experience.", mustDo: true },
      { name: "Agra Fort", type: "UNESCO Heritage Fort", distanceFromCenter: "2.5 km from Taj", entryFee: "₹50 Indians / ₹600 foreigners", timing: "6am – 6pm", bestTime: "Morning or late afternoon", insiderTip: "Musamman Burj — the octagonal tower where Shah Jahan was imprisoned — overlooks the Taj. The most moving spot in Agra.", mustDo: true },
      { name: "Itimad-ud-Daulah (Baby Taj)", type: "Mughal Tomb", distanceFromCenter: "3 km", entryFee: "₹30 Indians / ₹300 foreigners", timing: "Sunrise to sunset", bestTime: "Afternoon (east side lit)", insiderTip: "Built 17 years before Taj Mahal, it pioneered the pietra dura inlay technique. Far fewer crowds than Taj but equally exquisite marble work.", mustDo: false },
      { name: "Fatehpur Sikri", type: "Abandoned Mughal Capital", distanceFromCenter: "40 km", entryFee: "₹50 Indians / ₹610 foreigners", timing: "Sunrise to sunset", bestTime: "Early morning before tour groups", insiderTip: "The ghost city Akbar built and abandoned in 14 years. The acoustics inside Panch Mahal are extraordinary. Hire a local guide (₹400) — stories here are incredible.", mustDo: true },
      { name: "Kinari Bazaar", type: "Traditional Market", distanceFromCenter: "1 km", entryFee: "Free", timing: "10am – 8pm", bestTime: "Evening for atmosphere", insiderTip: "Genuine marble inlay work costs ₹2,000–₹50,000 depending on quality. To check authenticity: scratch the back — real marble is cold and slightly rough. Imitations are warm and smooth.", mustDo: false },
      { name: "Mehtab Bagh", type: "Mughal Garden", distanceFromCenter: "1 km across Yamuna", entryFee: "₹25", timing: "Sunrise to sunset", bestTime: "Sunset for Taj silhouette", insiderTip: "This is THE spot for Taj photos without queues or crowds. Sunset turns the Taj amber-gold against the darkening sky. A completely different perspective.", mustDo: true },
    ],
    travelAdvisory: {
      updatedFrom: "Uttar Pradesh Tourism & ASI Official Guidelines",
      bestTimeToVisit: "October to March — cool mornings, clear skies, ideal photography light. The Taj at sunrise in November–December is transcendent.",
      peakSeason: "October – March. Book Taj skip-the-line tickets (asi.payumoney.com) at least 1–2 days in advance. Arrive by 6am to beat crowds.",
      offSeason: "April – June: brutal heat (42–47°C). July – September: humid monsoon, haze reduces visibility. Taj is open but not recommended.",
      alerts: [
        { level: "warning", icon: "🌫️", title: "Air Quality (AQI)", detail: "Agra's winter AQI regularly hits 250–400+ (hazardous). If you have respiratory issues, carry an N95 mask. December–January mornings can have dense smog reducing Taj visibility to near zero. Check AQI on the day at iqair.com/india/uttar-pradesh/agra." },
        { level: "caution", icon: "🚗", title: "Taj Trapezium Zone — No Petrol Vehicles", detail: "Vehicles with petrol/diesel engines cannot enter within 500m of the Taj. E-rickshaws and electric vehicles are the only options near the East, West, and South gates. Pre-paid e-rickshaw stands are clearly marked." },
        { level: "caution", icon: "🎭", title: "Marble Emporium Scam", detail: "Drivers and guides earn commissions taking you to 'government approved' marble shops — most are private with inflated prices. Genuine marble inlay: cold to touch, slightly rough back surface. Plastic imitations feel warm. Buy from U.P. Handicrafts Emporium (official)." },
        { level: "info", icon: "🕌", title: "Friday Closure", detail: "The Taj Mahal is closed every Friday for prayers. Plan your visit accordingly. Also closed during Republic Day (Jan 26), Independence Day (Aug 15), and Gandhi Jayanti (Oct 2) for a few hours." },
      ],
      dos: [
        "Book Taj Mahal entry tickets online at asi.payumoney.com to skip the often 30-minute queue",
        "Arrive at Taj East Gate by 6am sharp — the first hour has dramatically fewer crowds",
        "Carry a refillable water bottle — no plastic bottles allowed inside Taj premises",
        "Use e-rickshaws near the Taj gates — petrol vehicles are banned in the zone",
        "Hire a certified ASI guide (₹800–1,200) — Taj stories are vastly richer with context",
        "Visit Mehtab Bagh across the river at sunset for the most uncrowded Taj views",
        "Keep a photocopy of your ID — entry requires ID matching your ticket name",
      ],
      donts: [
        "Don't carry food, tripods, or power banks inside the Taj — they will be confiscated at security",
        "Don't drink tap water — waterborne illnesses are common in Agra; stick to sealed bottles",
        "Don't visit in peak summer (April–June) — heat exceeds 45°C and humidity is intense",
        "Don't accept rides from touts outside gates — use the official prepaid e-rickshaw stands",
        "Don't buy marble souvenirs from shops your driver recommends — significant commission mark-ups",
        "Don't wear shoes inside the Taj mosque — covers are provided at the entrance",
      ],
      emergencyContacts: [
        { label: "UP Tourism Helpline", number: "1800-180-2522", icon: "📞" },
        { label: "Police", number: "100 / 112", icon: "🚔" },
        { label: "Ambulance", number: "108", icon: "🚑" },
        { label: "Taj Security", number: "0562-2227261", icon: "🛡️" },
        { label: "District Hospital Agra", number: "0562-2463020", icon: "🏥" },
        { label: "Tourist Police", number: "0562-2421204", icon: "👮" },
      ],
      healthTips: [
        "Summer heat (April–June) regularly reaches 47°C — carry ORS packets, wear light cotton, and a wide-brim hat",
        "Carry hand sanitiser — Agra's street food is tempting but hygiene standards vary widely",
        "Stomach upsets are common — carry ORS and basic antibiotics (consult doctor before travel)",
        "Yamuna river water is heavily polluted — no swimming, no contact with river water near Agra",
        "S.N. Medical College & Hospital is the best government hospital (0562-2463020)",
        "Avoid exposure between 11am–4pm in summer — heat exhaustion is a real risk",
      ],
      culturalNotes: [
        "The Taj Mahal is an active mosque — shoes must be removed, modest dress required inside",
        "Photography of cremation grounds or religious ceremonies requires express permission",
        "Agra is a Hindu-Muslim mixed city — Eid and Holi festivals bring city-wide celebrations (and some road closures)",
        "Petha (white translucent sweet) and Dalmoth are Agra's signature foods — buy from established shops like Panchhi Petha",
        "Bargaining is expected in Kinari Bazaar and tourist markets — start at 50% of asking price",
        "Friday is a day of prayer — many Muslim-owned businesses near Taj close for 2–3 hours at noon",
      ],
      moneyTips: [
        "Carry ₹2,000–₃,000 cash — many vendors, e-rickshaws, and bazaar shops are cash-only",
        "ATMs are widely available in Agra city center but sparse near the Taj gates",
        "UPI accepted at most restaurants and hotels; not at street stalls",
        "Taj entry ticket: ₹50 (Indians) + ₹200 Mughal Heritage ticket (covers Taj, Agra Fort, Fatehpur Sikri) — good value bundle",
        "Avoid currency exchange at hotels — airport or bank rates are significantly better",
      ],
    },
  },

  {
    destId: "jaipur",
    fromCityToSight: "From Jaipur Junction railway station, the Walled City (Pink City) is 3 km. Take an Ola/Uber (₹100–₹150) or a prepaid auto (₹80–₹120). For Amber Fort, you need a separate cab (₹300 round trip) or shared jeep from Hawa Mahal area (₹100/seat).",
    firstThingsToDo: [
      "Book Amber Fort jeep ride or entry ticket online — lines are 1h+ on weekends",
      "Get a Jaipur City Pass if visiting 4+ monuments — saves 30%",
      "Download Jaipur offline map — old city lanes are a maze",
      "Find your hotel (most are near MI Road or Old City) and store luggage",
      "Buy water and ORS sachets — Jaipur is dusty and hot most of the year",
    ],
    arrivalPoints: [
      {
        by: "Train",
        icon: "🚂",
        name: "Jaipur Junction (JP) — Main Station",
        distanceFromCity: "3 km from walled city center",
        toAccommodation: [
          { step: 1, icon: "📍", action: "Exit platform, cross to the main gate — not the side exits (these lead to cramped lanes)", cost: "—", duration: "5 min", tip: "Ola/Uber works perfectly here. Don't get swayed by auto-drivers quoting ₹500 'all-inclusive city tour'." },
          { step: 2, icon: "📱", action: "Book Ola or Uber from the station exit — pool option saves ₹50", cost: "₹80–₹150 to MI Road / Old City", duration: "10–15 min", tip: "City buses also run from station to Badi Chaupar (old city hub) for ₹15 — but they're crowded with luggage." },
          { step: 3, icon: "🏨", action: "Hotel check-in. Store valuables. Ask hotel for monument map and timings.", cost: "—", duration: "—", tip: "Best hotel areas: Near Badi Chaupar (walking distance to everything) or MI Road (safer, quieter, more modern)." },
        ],
      },
      {
        by: "Flight",
        icon: "✈️",
        name: "Jaipur International Airport (JAI)",
        distanceFromCity: "12 km from city center",
        toAccommodation: [
          { step: 1, icon: "🚗", action: "Prepaid taxi booth is just outside arrivals (Ground Floor, Exit Gate 2)", cost: "₹400–₹600 to city", duration: "25–35 min", tip: "Ola/Uber also works from airport pickup zone. Surge pricing during peak hours (7–10am, 5–8pm)." },
          { step: 2, icon: "🏨", action: "Hotel check-in. Freshen up — Jaipur is dusty.", cost: "—", duration: "—", tip: "Hotel near Badi Chaupar lets you walk to Hawa Mahal, Johri Bazaar, and City Palace. Prime location." },
        ],
      },
      {
        by: "Road",
        icon: "🚗",
        name: "Sindhi Camp Bus Stand (Main) / Narayan Singh Circle",
        distanceFromCity: "1 km from old city",
        toAccommodation: [
          { step: 1, icon: "🛺", action: "Auto-rickshaws are directly outside. Agree on price before boarding.", cost: "₹50–₹100 to old city", duration: "5–10 min", tip: "Sindhi Camp is very central. Most old-city accommodations are within 10 min from here." },
        ],
      },
    ],
    weatherSeasons: [
      {
        season: "Peak Winter", months: "November – February", icon: "❄️",
        tempRange: "8°C – 25°C", feels: "Pleasantly cool days, cold nights",
        carry: ["Light to medium jacket for evenings", "Layers — mornings at forts can be cold", "Sunscreen (winter sun still burns)", "Comfortable walking shoes — cobblestones are everywhere"],
        warning: "January nights drop to 8°C in Jaipur. The open forts at Amber and Nahargarh feel like freezing wind tunnels after sunset. Carry a jacket even if the day feels fine.",
        clothingAdvice: "Best dressing: Jeans + T-shirt + light jacket or cardigan. Pashmina shawls from local shops (₹500–₹2,000) are both warm and functional souvenirs."
      },
      {
        season: "Festival Season", months: "October – November", icon: "🎉",
        tempRange: "20°C – 35°C", feels: "Warm but manageable, festive energy",
        carry: ["Light cotton", "Sunscreen", "Comfortable shoes for long walking", "Small backpack"],
        warning: "Diwali and Dussehra fill hotels fast — book 2–3 months ahead. Prices surge 50–100% during festival weeks.",
        clothingAdvice: "Light cotton. Carry a bright colour — Jaipur's pink city + your colourful clothes = great photos."
      },
      {
        season: "Summer", months: "April – June", icon: "🔥",
        tempRange: "35°C – 48°C", feels: "Extreme, dangerous heat",
        carry: ["Loose cotton only — no synthetic fabrics", "Wide-brim hat", "SPF 50+ sunscreen", "2L+ water bottle", "ORS sachets", "Hand fan"],
        warning: "Jaipur summer is brutal. The sandstone forts absorb and radiate heat. Avoid outdoor sightseeing between 11am–5pm. If you must go, take water and rest frequently in shade.",
        clothingAdvice: "Light cotton kurta-pajama or linen. Protect your neck and forearms. Light-coloured clothing reflects heat."
      },
    ],
    cityHurdles: [
      { icon: "🛺", issue: "Auto drivers quoting inflated fares to tourists", solution: "Always use Ola or Uber for reliable metered prices. If using auto, fix price BEFORE boarding. Standard fare within old city: ₹60–₹120. Anything above ₹200 for short trips is a red flag.", severity: "high" },
      { icon: "💎", issue: "Gem and gemstone scams (Jaipur is Gem City)", solution: "Jaipur is famous for gemstones — and for gem scams. Never buy gems to 'resell at profit abroad' — this is the oldest scam. Only buy from Rajasthan Government certified shops (look for RTDC certification).", severity: "high" },
      { icon: "🏛️", issue: "Long queues at Amber Fort, especially weekends", solution: "Arrive before 9am. Buy entry online the previous night (bookmyshow.com or asi.payumoney.com). Jeep ride up costs ₹200 — it's not mandatory but the walk in summer heat is very strenuous.", severity: "medium" },
      { icon: "🗺️", issue: "Getting lost in the walled city lanes", solution: "Download Jaipur offline on Google Maps before entering the old city. GPS works but data connectivity can be patchy in narrow lanes. Ask shopkeepers — they're generally helpful.", severity: "low" },
      { icon: "💧", issue: "Dehydration in summer heat", solution: "Drink at least 3L of water daily. Add ORS sachets to your water every other bottle. If you feel dizzy, immediately find shade and wet the back of your neck with cool water.", severity: "high" },
      { icon: "🤝", issue: "Persistent shopkeeper follow-through", solution: "In bazaars, 'just looking' is perfectly acceptable. Say 'sirf dekh raha hoon' (I'm just looking) firmly. Start walking if someone follows — they rarely pursue beyond 10 metres.", severity: "low" },
    ],
    cityEssentials: {
      atm: "SBI and ICICI ATMs on MI Road are reliable. ATMs inside Amber Fort area are limited and often empty by 10am.",
      sim: "Airtel and Jio stores on MI Road. Nearest Airtel store: opposite Railway Station, Platform 1 exit.",
      wifi: "Most hotels have WiFi. Old city cafés (LMB Rooftop, Peacock Rooftop) offer free WiFi with orders.",
      medical: "SMS Government Hospital: 0141-2518501. Fortis Hospital (private, English-speaking): 0141-2547000. 24h pharmacy: Jan Aushadhi Kendra, MI Road.",
      language: "Hindi widely spoken. Old city: some Rajasthani dialect. Most tourist areas have English signage. Learn: 'Kitna hua?' (What's the total?), 'Bahut zyada hai' (Too much).",
      localEmergency: "Tourist Police Jaipur: 0141-2744988 | Women Helpline: 181 | Rajasthan Tourist Helpline: 1800-180-6127",
      upi: "Google Pay, PhonePe, and Paytm work everywhere in Jaipur including many small vendors. QR codes visible at most shops.",
      powerOutlet: "India standard Type C/D, 230V. Hotels provide adapters on request. Take your charger everywhere — fort visits are long.",
    },
    localAttractions: [
      { name: "Amber Fort", type: "Hill Fort Complex", distanceFromCenter: "11 km from old city", entryFee: "₹100 Indians / ₹500 foreigners + ₹200 jeep", timing: "8am – 5:30pm", bestTime: "8am sharp to beat crowds", insiderTip: "The Sound & Light Show at Amber fort (7:30pm, ₹300) is spectacular — fort walls turn gold, blue, green. Book in advance.", mustDo: true },
      { name: "Hawa Mahal", type: "Iconic Palace Facade", distanceFromCenter: "Old city center", entryFee: "₹50 Indians / ₹200 foreigners", timing: "9am – 5pm", bestTime: "7–9am from outside (golden light on facade)", insiderTip: "The INSIDE of Hawa Mahal (often skipped) has beautiful lattice-work rooms and a rooftop with City Palace views. Entry fee is worth it.", mustDo: true },
      { name: "Jantar Mantar", type: "UNESCO Astronomical Observatory", distanceFromCenter: "Old city", entryFee: "₹50 Indians / ₹200 foreigners", timing: "9am – 4:30pm", bestTime: "Morning", insiderTip: "Hire a guide (₹400) — without one, it's just stone structures. With one, you understand the genius of 18th-century astronomical measurements accurate to 2 seconds.", mustDo: false },
      { name: "Johri Bazaar", type: "Jewellery Market", distanceFromCenter: "Old city", entryFee: "Free", timing: "10am – 8pm", bestTime: "Evening", insiderTip: "Lac bangles, blue pottery, and block-print textiles here are authentic. Bargain: start at 50% of asking price. Government emporiums (Rajasthali) have fixed fair prices if you hate bargaining.", mustDo: false },
      { name: "Nahargarh Fort", type: "Hilltop Fort", distanceFromCenter: "15 km", entryFee: "₹50 Indians / ₹200 foreigners", timing: "10am – 6pm", bestTime: "Sunset (4:30–5:30pm)", insiderTip: "The Padao restaurant inside Nahargarh has the best sunset views in Jaipur with a beer (₹300). Watch the city turn golden from the fort wall.", mustDo: false },
      { name: "Chand Baori (Abhaneri)", type: "Ancient Stepwell — Hidden Gem", distanceFromCenter: "95 km", entryFee: "₹25", timing: "9am – 5pm", bestTime: "Morning light (east-facing)", insiderTip: "3,500 narrow steps descending 30m in perfect geometric symmetry — one of India's most mesmerising structures. Almost never crowded. Used as filming location for The Dark Knight Rises.", mustDo: true },
    ],
    travelAdvisory: {
      updatedFrom: "Rajasthan Tourism Official & Government of India Travel Advisory",
      bestTimeToVisit: "November to February — comfortable 10–25°C days, cool nights, all festivals and events active. Jaipur Literature Festival (Jan) and Kite Festival (Jan 14) are unmissable.",
      peakSeason: "November – February. Book accommodation 4–6 weeks ahead, especially during Pushkar Mela (Nov) and Jaipur Lit Fest (Jan).",
      offSeason: "April – June: extreme heat 42–47°C. July – August: monsoon brings relief but some roads flood. Desert heat is different from humidity — dehydration risk is severe.",
      alerts: [
        { level: "warning", icon: "🌡️", title: "Extreme Summer Heat (Apr–Jun)", detail: "Jaipur temperatures exceed 45°C in May–June. Heatstroke risk is severe. If visiting in summer, stay indoors 11am–5pm, drink 4L water daily, and carry ORS. Wear light cotton, sunhat, and sunscreen SPF 50+." },
        { level: "caution", icon: "🐘", title: "Elephant Rides at Amber Fort — Welfare Concern", detail: "Elephant rides at Amber Fort are controversial. Multiple animal welfare reports cite abuse. Rajasthan High Court has periodically banned them. Consider the jeep or walking alternative to support responsible tourism." },
        { level: "caution", icon: "💎", title: "Gemstone & Jewellery Scams", detail: "Jaipur is India's gemstone capital — also its scam capital. 'Wholesale exporters' offering to let you 'resell gems in your country at profit' are frauds. Buy only from government emporiums (Rajasthali) or accredited shops with receipts." },
        { level: "info", icon: "🎪", title: "Festival Season Crowds (Jan, Oct–Nov)", detail: "Jaipur Literature Festival (January) and Pushkar Mela (October–November) bring massive crowds. Hotels book up months in advance. Traffic in the Pink City can be gridlocked. Book early and factor extra travel time." },
      ],
      dos: [
        "Book Amber Fort entry tickets online to skip the queue — especially busy 10am–3pm",
        "Hire a Rajasthan Tourism certified guide (ask at Rajasthan Tourism Bureau, MI Road)",
        "Visit Nahargarh Fort at sunset for the best panoramic city views — bring a drink",
        "Bargain respectfully in bazaars — start at 50–60% of asking price, it's expected",
        "Try authentic Rajasthani thali at Laxmi Mishthan Bhandar (LMB) or Chokhi Dhani",
        "Use Ola/Uber — metered, reliable, and avoids auto-rickshaw overcharging",
        "Store your luggage at Jaipur Junction's cloak room if you have a late checkout",
      ],
      donts: [
        "Don't drink tap water — always buy sealed bottled water or carry a filter",
        "Don't accept gems or handicraft 'deals' from strangers or drivers — classic scam",
        "Don't wear revealing clothing in the old city and temple areas",
        "Don't visit the Walled City in a private car — parking is nearly impossible and roads narrow",
        "Don't skip pre-booking for Amber Fort during peak season — queues can be 2 hours",
        "Don't pay the first auto-rickshaw price — negotiate or use app cabs",
      ],
      emergencyContacts: [
        { label: "Rajasthan Tourism Helpline", number: "1800-200-5000", icon: "📞" },
        { label: "Police", number: "100 / 112", icon: "🚔" },
        { label: "Ambulance", number: "108", icon: "🚑" },
        { label: "Women Helpline", number: "1090", icon: "🛡️" },
        { label: "Tourist Police, Jaipur", number: "0141-2741994", icon: "👮" },
        { label: "SMS Hospital (Major)", number: "0141-2518510", icon: "🏥" },
      ],
      healthTips: [
        "Heat exhaustion is the #1 health risk April–September — hydrate aggressively and avoid outdoor exertion midday",
        "Rajasthani food is very spicy and oil-heavy — go slow if your stomach is not used to it; curd/raita helps",
        "Carry antihistamines — Jaipur's old city streets have dust and pollution that trigger allergies",
        "SMS Hospital Jaipur (Government) and Fortis Jaipur are the recommended hospitals",
        "Water at restaurants may not always be filtered — ask for sealed bottles",
      ],
      culturalNotes: [
        "Jaipur is deeply traditional — modest dress (covering shoulders and knees) is required in temples and expected in old city",
        "Holi (March) is celebrated explosively in Jaipur — join if you want the experience, but protect electronics",
        "Rajasthani hospitality: if a local invites you for chai, accepting is respectful",
        "Teej and Gangaur festivals (March–April) feature processions, folk music, and traditional dress — very photogenic",
        "The evening light-and-sound show at Amber Fort (7:30pm) is one of Rajasthan's best cultural experiences",
        "Women should exercise caution traveling alone at night in certain areas of the old city — stick to lit main streets",
      ],
      moneyTips: [
        "Currency: INR. ATMs widely available throughout Jaipur city center and MI Road",
        "Bargaining is culturally normal in bazaars — aim for 40–60% of opening price",
        "Government emporiums (Rajasthali) have fixed fair prices — ideal if you dislike bargaining",
        "Accommodation near Amber Fort or Bani Park often has better price-to-quality ratio than old city havelis",
        "Many heritage hotels add a 'tourist surcharge' — check total price including taxes before booking",
      ],
    },
  },

  {
    destId: "kerala",
    fromCityToSight: "From Kochi airport or station, you need to reach Alleppey (55–90 km) for backwaters. Take government KSRTC bus (₹50, 2h) from Ernakulam bus stand, or book a cab (₹1,200–₹1,800). For Munnar: 3.5h cab (₹2,500). Plan your base carefully — Kerala's backwater region is Alleppey, not Kochi.",
    firstThingsToDo: [
      "Confirm houseboat booking — cancellations and 'upgrades' scams are common",
      "Exchange or withdraw cash in Kochi — rural backwaters have no ATMs",
      "Buy mosquito repellent in Kochi — essential for backwater stays",
      "Get Kerala Tourism certified houseboat (look for DTPC seal)",
      "Buy local SIM if international roaming is expensive",
    ],
    arrivalPoints: [
      {
        by: "Flight",
        icon: "✈️",
        name: "Cochin International Airport (COK) — World's first solar airport",
        distanceFromCity: "28 km from Ernakulam (Kochi), 90 km from Alleppey",
        toAccommodation: [
          { step: 1, icon: "🚗", action: "Exit arrivals, go to prepaid taxi counter on the ground floor", cost: "₹800–₹1,200 to Fort Kochi / Ernakulam", duration: "45–60 min", tip: "Ola and Uber now operate from Kochi airport — often cheaper than prepaid. Compare rates on app before accepting prepaid counter." },
          { step: 2, icon: "🚌", action: "If going directly to Alleppey, take a direct bus from airport — KSRTC AC bus at Aluva (15 min cab from airport)", cost: "₹80–₹150 bus to Alleppey", duration: "2–2.5h", tip: "Don't let anyone convince you to take a private cab to Alleppey from airport for ₹3,000+ — KSRTC bus from Aluva is perfectly comfortable and a fraction of the cost." },
          { step: 3, icon: "⛵", action: "In Alleppey, your houseboat operator will pick you up or tell you to report to the boat jetty by noon", cost: "Usually included in houseboat package", duration: "—", tip: "Houseboat check-in is strictly 12pm–1pm. Arriving early means waiting in a small, hot shelter. Plan your travel to arrive around that time." },
        ],
      },
      {
        by: "Train",
        icon: "🚂",
        name: "Ernakulam Junction (ERS) / Alappuzha Station (ALLP)",
        distanceFromCity: "Alappuzha station: 4 km from boat jetty",
        toAccommodation: [
          { step: 1, icon: "🛺", action: "Auto-rickshaws from Alappuzha station — meter or negotiate ₹60–₹100 to town/jetty", cost: "₹60–₹100", duration: "10–15 min", tip: "Alleppey town is small and easy to navigate. Cycle rental (₹100/day) is very popular for exploring the canal-lined streets." },
          { step: 2, icon: "⛵", action: "Public ferries from Alleppey boat jetty (SWTD) — scenic, cheap, and authentic", cost: "₹8–₹25 per trip", duration: "30min–2h depending on route", tip: "SWTD government ferry from Alleppey to Kottayam (₹12, 2h) is one of the most scenic boat rides in India. Far better than a houseboat for the price." },
        ],
      },
    ],
    weatherSeasons: [
      {
        season: "Peak Season", months: "October – February", icon: "☀️",
        tempRange: "25°C – 32°C", feels: "Warm and pleasant",
        carry: ["Light cotton clothes", "Sunscreen", "Mosquito repellent (essential)", "Waterproof sandals", "Light shawl for AC trains/buses"],
        warning: "Humidity is constant in Kerala even in 'dry' months. Natural fabrics (cotton, linen) breathe far better than synthetic. Avoid tight synthetic clothing.",
        clothingAdvice: "Kerala is conservative in temples — women should carry a scarf/shawl. Beach areas are relaxed. Men should not enter temples shirtless."
      },
      {
        season: "Monsoon (Ayurveda Season)", months: "June – September", icon: "🌧️",
        tempRange: "26°C – 34°C", feels: "Hot, very humid, heavy rain",
        carry: ["Good quality waterproof jacket (light raincoat not enough — Kerala rains are serious)", "Waterproof shoes or rubber sandals", "Sealed zip-lock bags for electronics", "Umbrella (compact)"],
        warning: "Kerala Ayurveda treatments are traditionally most effective in monsoon — the humidity opens pores and the body absorbs better. If you can handle the rain, monsoon is actually a fantastic time with 40% fewer tourists.",
        clothingAdvice: "Quick-dry fabrics mandatory. Pack minimal — you'll be washing and drying clothes constantly in high humidity."
      },
    ],
    cityHurdles: [
      { icon: "⛵", issue: "Houseboat operators offering 'discounts' but delivering inferior boats", solution: "Only book DTPC-certified Kerala Tourism houseboats. Look for the official blue-and-white DTPC seal on the boat. Uncertified boats may have broken toilets, no AC, unhygienic cooking, and safety issues.", severity: "high" },
      { icon: "💊", issue: "Fake Ayurveda centers charging high prices for unqualified treatment", solution: "Book only at centers approved by Kerala Tourism (ktdc.kerala.gov.in/ayurveda). Genuine Ayurveda involves a proper consultation before any treatment. If a center starts treatment without a doctor consultation, leave.", severity: "high" },
      { icon: "🚢", issue: "Getting stranded due to missed houseboat check-in window", solution: "Houseboat check-in is rigid (usually 12pm). If your train is delayed, call the operator immediately. Most will wait 1–2 hours if informed, but not if you just don't show up.", severity: "medium" },
      { icon: "🦟", issue: "Mosquitoes on backwaters — can be intense", solution: "Carry DEET repellent 30%+ minimum. Apply at 4pm before sunset — this is peak mosquito hour. Most houseboats have nets but apply repellent too. Wear full sleeves from 5pm.", severity: "medium" },
      { icon: "📵", issue: "No mobile signal on backwater canals", solution: "Download offline maps of Kerala before boarding. Save houseboat operator's number offline. Tell someone your houseboat itinerary before you board.", severity: "low" },
    ],
    cityEssentials: {
      atm: "Withdraw cash in Kochi or Alleppey town before boarding houseboat. No ATMs on canal routes. Many homestays and small vendors are cash-only.",
      sim: "Airtel or BSNL have best coverage in rural Kerala. Jio is cheapest but patchy in Alleppey backwater areas. Buy in Kochi before heading to backwaters.",
      wifi: "Good WiFi in Kochi hotels and Fort Kochi cafes. Limited/no WiFi on houseboats. Some homestays offer WiFi. Download all you need before boarding.",
      medical: "Amrita Hospital Kochi (excellent): 0484-2858000. In Alleppey: District Hospital: 0477-2251004. Carry basic medications — remote backwater areas have limited pharmacies.",
      language: "Malayalam is the local language. Most Keralites have good English (highest literacy in India). Hindi understood in tourist areas. 'Nandri' = Thank you in Malayalam.",
      localEmergency: "Kerala Tourist Helpline: 0471-2321132 | Women Helpline: 1091 | Police: 100 | Pink Police (Kochi): 0484-2395100",
      upi: "Well-accepted in Kochi. Rural backwater areas are predominantly cash. Carry ₹2,000–₹3,000 in small notes for tips, local transport, and village stops.",
      powerOutlet: "Standard Indian Type C/D, 230V. Houseboats have limited power outlets (usually 1–2 per room). Bring a power bank for a full day on the water.",
    },
    localAttractions: [
      { name: "Alleppey Backwaters (Houseboat)", type: "Backwater Experience", distanceFromCenter: "0 km — is the destination", entryFee: "₹5,000–₹25,000/night houseboat", timing: "Board 12pm, return next morning", bestTime: "October – March", insiderTip: "Request your houseboat operator to take the 'canal route' rather than the main lake — the narrow canals through villages are the true backwater experience. The Vembanad Lake route is beautiful but lacks the intimacy.", mustDo: true },
      { name: "Fort Kochi & Mattancherry", type: "Heritage Port Town", distanceFromCenter: "Kochi city", entryFee: "Free to walk, Museum ₹25", timing: "All day, Jewish Synagogue closed Fridays", bestTime: "Morning walk, evening to see Chinese fishing nets", insiderTip: "The Cochin Carnival (Dec 25–Jan 1) turns Fort Kochi magical. Street food from Kerala, folk performances, and the atmosphere of this 500-year-old port is unforgettable.", mustDo: true },
      { name: "Periyar Wildlife Sanctuary (Thekkady)", type: "Wildlife Safari", distanceFromCenter: "190 km from Kochi", entryFee: "₹300 + boat safari ₹300", timing: "7am – 4pm", bestTime: "October – March (best elephant sightings)", insiderTip: "Skip the government boat (too noisy, too crowded). Book the 'Green Walk' or 'Tiger Trail' trekking experience with forest guards for genuine wildlife sightings. Advance booking: ktdc.kerala.gov.in", mustDo: false },
      { name: "Munnar Tea Estates", type: "Hill Station", distanceFromCenter: "130 km from Kochi", entryFee: "Tea factory tour: ₹100", timing: "All day", bestTime: "September – October (post-monsoon mist)", insiderTip: "The road from Kochi to Munnar passes through Valara and Cheeyappara waterfalls — stop for photos. Munnar's highest tea estate (Top Station, 1,600m) overlooks the Tamil Nadu border — spectacular.", mustDo: false },
      { name: "Pathiramanal Island", type: "Bird Sanctuary — Hidden Gem", distanceFromCenter: "12 km from Alleppey by shikara", entryFee: "₹50 + boat", timing: "6am – 5pm", bestTime: "Early morning (birds most active)", insiderTip: "A small island in Vembanad Lake, accessible only by boat. Rare migratory birds, lotus flowers, and completely peaceful. Most houseboat tours skip it — ask your captain specifically.", mustDo: false },
    ],
    travelAdvisory: {
      updatedFrom: "Kerala Tourism Official (keralatourism.org)",
      bestTimeToVisit: "October to February — cooler weather, dry days, all attractions fully operational. Book houseboats and hill-station stays at least 3–4 weeks in advance during this window.",
      peakSeason: "September – May (post-monsoon to pre-summer). Pleasant temperatures, full tourist infrastructure open. Onam festival (August–September) adds a cultural dimension.",
      offSeason: "June – August (Monsoon). Heavy rainfall, some roads and treks closed. However, ideal for Ayurveda retreats — Kerala's traditional medicine is most potent during monsoon. Tourist discounts of 30–40% available.",
      alerts: [
        {
          level: "warning",
          icon: "🌊",
          title: "Flood & Landslide Risk (June–August)",
          detail: "Kerala experienced severe floods in 2018 and 2019. During heavy monsoon, hilly areas like Munnar, Wayanad, and Idukki may face landslides. Monitor the Kerala State Disaster Management Authority (KSDMA) alerts. Avoid trekking in these zones during active red/orange weather alerts.",
        },
        {
          level: "caution",
          icon: "⛵",
          title: "Houseboat Safety Standards",
          detail: "Only board DTPC-certified houseboats carrying the official Kerala Tourism blue-and-white seal. Uncertified operators may lack fire extinguishers, life jackets, and proper waste disposal. Verify certification at ktdc.kerala.gov.in before booking.",
        },
        {
          level: "caution",
          icon: "💊",
          title: "Ayurveda Centre Verification",
          detail: "Many centers operate without qualified practitioners. Only visit centers certified by the Kerala Tourism Department. A legitimate Ayurveda session always starts with a doctor consultation (Prakriti assessment). If any center skips this, walk out.",
        },
        {
          level: "info",
          icon: "🐘",
          title: "Wildlife Sanctuary Rules",
          detail: "Follow all forest department rules at Thekkady/Periyar and Wayanad sanctuaries. Maintain distance from wild elephants — Kerala has the highest elephant-human conflict zones in India. Never feed animals. Plastic is strictly prohibited inside sanctuaries.",
        },
        {
          level: "info",
          icon: "🎭",
          title: "Upcoming Events 2026",
          detail: "Malabar River Festival: July 30 – August 2, 2026 on Chalipuzha & Iruvazhinjipuzha rivers, Kozhikode. Snake Boat Races: Nehru Trophy (2nd Saturday August), Champakkulam Moolam (July). Book accommodation months in advance around race dates.",
        },
      ],
      dos: [
        "Book DTPC-certified houseboats only — look for the official blue-and-white seal on the boat",
        "Carry cash before boarding houseboats — no ATMs on canal routes",
        "Apply DEET mosquito repellent 30%+ by 4pm daily, especially on backwaters",
        "Dress modestly at temples — women carry a scarf, men avoid sleeveless",
        "Download offline maps before entering backwater zones (no signal on canals)",
        "Book Periyar 'Green Walk' or 'Tiger Trail' in advance at ktdc.kerala.gov.in for genuine wildlife experience",
        "Use UPI or cards in Kochi; switch to cash in rural backwater areas",
        "Try government KSRTC buses — comfortable, reliable, and a fraction of private taxi cost",
      ],
      donts: [
        "Don't enter any Ayurveda centre that skips a doctor consultation before treatment",
        "Don't accept houseboat 'deals' from touts at jetties — always pre-book through certified operators",
        "Don't trek in hill areas (Munnar, Wayanad) during active red/orange weather alerts",
        "Don't carry single-use plastics into wildlife sanctuaries — ₹5,000 fine applies",
        "Don't wear synthetic fabrics — Kerala's humidity makes synthetics unbearable; cotton/linen only",
        "Don't pay more than ₹1,500 for a Kochi–Alleppey cab — KSRTC bus from Aluva is ₹80–150",
        "Don't swim at unmarked beaches — Kerala has strong rip currents; swim only at lifeguard-patrolled zones",
        "Don't disrespect temple dress codes — you will be refused entry",
      ],
      emergencyContacts: [
        { label: "Kerala Tourist Helpline", number: "0471-2321132", icon: "📞" },
        { label: "Police", number: "100 / 112", icon: "🚔" },
        { label: "Ambulance", number: "102 / 108", icon: "🚑" },
        { label: "Fire", number: "101", icon: "🚒" },
        { label: "Women Helpline", number: "1091", icon: "🛡️" },
        { label: "Pink Police (Kochi)", number: "0484-2395100", icon: "👮‍♀️" },
        { label: "Highway Helpline", number: "9846 100 100", icon: "🛣️" },
        { label: "KSDMA Disaster Alerts", number: "1070", icon: "⚠️" },
      ],
      healthTips: [
        "Mosquito repellent is non-negotiable — apply daily, especially around backwaters and forest areas",
        "Kerala's heat and humidity cause rapid dehydration — drink 3–4L water daily",
        "Choose Ayurveda centres certified by the Kerala Tourism Department with qualified Ayurvedic doctors",
        "Carry oral rehydration salts (ORS) — stomach upsets can occur if spice tolerance is low",
        "Amrita Hospital, Kochi (0484-2858000) and KIMS Hospital are the top private hospitals",
        "Travel insurance covering medical evacuation is strongly recommended for trekking or monsoon travel",
        "Kerala seafood is extremely fresh but consume only at reputable establishments if you have shellfish allergies",
        "If experiencing Ayurveda treatment during monsoon, avoid cold drinks and AC — the treatment protocol requires warmth",
      ],
      culturalNotes: [
        "Malayalam is the official language — 'Nandri' (thank you), 'Swagatham' (welcome) go a long way",
        "English is widely spoken across Kerala, which has India's highest literacy rate (96.2%)",
        "Onam (August–September) is Kerala's biggest harvest festival — streets and homes are decorated with flower rangoli (pookalam); residents wear traditional white-and-gold attire",
        "Snake Boat Races (Vallam Kali) during Onam season are a spectacle — 100+ rowers per boat, massive cheering crowds",
        "Remove footwear before entering any home, temple, or mosque — this is mandatory and deeply respectful",
        "Kerala cuisine is traditionally served on a banana leaf for Onam Sadhya — eat with your right hand",
        "Kathakali and Mohiniyattam are classical dance forms — several daily performances in Kochi's cultural centres (₹350 entry)",
        "Shopping: buy spices, tea, coffee, and coir goods from government emporiums (Khadi, KSHDC) for authentic quality",
      ],
      moneyTips: [
        "Currency: Indian Rupee (INR). Banks open Mon–Fri 10:00–15:30; first and third Saturdays only",
        "Withdraw cash in Kochi or Alleppey town before heading to backwaters — no ATMs on canal routes",
        "UPI (PhonePe, Google Pay) widely accepted in Kochi and tourist areas. Cash essential in rural Kerala",
        "Major hotels and establishments accept credit cards; small vendors, autos, and village stops are cash-only",
        "Carry ₹2,000–₹3,000 in small notes (₹100, ₹200) for tips, ferry tickets, and local snacks",
        "Bargaining is not common in Kerala (unlike Rajasthan) — fixed prices at most shops; government emporiums have no bargaining",
      ],
    },
  },

  {
    destId: "goa",
    fromCityToSight: "From Dabolim Airport (South Goa) to beaches: prepaid taxi (₹600–₹800 to Baga/Anjuna, ₹400–₹500 to Panjim). From Mopa Airport (North Goa) to beaches: ₹300–₹500. From Madgaon/Vasco stations: Kadamba bus to Panjim (₹30), then local bus or scooter rental.",
    firstThingsToDo: [
      "Rent a scooter on Day 1 — it transforms your Goa experience completely",
      "Buy a local SIM (Airtel best in North Goa)",
      "Check in and ask hotel about scooter rental nearby (most budget stays arrange it)",
      "Fill up with petrol — pumps close by 10pm in rural areas",
      "Download Goa Miles app (local taxi service, more honest than standalone taxis)",
    ],
    arrivalPoints: [
      {
        by: "Flight",
        icon: "✈️",
        name: "Dabolim Airport (GOI) — South Goa (main airport) OR Mopa Airport (GOX) — North Goa",
        distanceFromCity: "Dabolim: 29 km to Panaji, 40 km to Baga. Mopa: 40 km to Panaji, 10 km to Arambol.",
        toAccommodation: [
          { step: 1, icon: "🚗", action: "At Dabolim: Exit arrivals, go to prepaid taxi counter (pre-fixed rates, no haggling)", cost: "₹600–₹1,200 depending on beach destination", duration: "30–60 min", tip: "Don't accept 'better deal' from touts — the official prepaid counter has government-fixed rates. Ola/Uber do NOT operate from Dabolim airport." },
          { step: 2, icon: "🏨", action: "Check in to accommodation. Immediately ask about scooter rental — ₹300–₹600/day", cost: "₹300–₹600/day scooter", duration: "—", tip: "Most beach areas have scooter rental shops on the main road. Show driving licence. Inspect the scooter for existing damage — photograph it before taking it so you're not blamed later." },
        ],
      },
      {
        by: "Train",
        icon: "🚂",
        name: "Madgaon (Margao) Station (MAO) — South Goa main station",
        distanceFromCity: "35 km from Baga, 10 km from Panjim",
        toAccommodation: [
          { step: 1, icon: "🚌", action: "Kadamba bus from Madgaon to Panjim (₹25, 30 min), then local bus to beach areas", cost: "₹25–₹50", duration: "45–90 min total", tip: "Kadamba buses are reliable and AC. From Panjim bus stand, buses go directly to Calangute, Baga, Anjuna. Very cheap and easy." },
          { step: 2, icon: "🛵", action: "From Panjim, rent a scooter or take shared taxi to your beach area", cost: "₹200–₹400 taxi / ₹350/day scooter", duration: "20–40 min to beaches", tip: "Panjim (Panaji) is Goa's capital — if you have time, it's worth exploring. Beautiful Portuguese architecture." },
        ],
      },
    ],
    weatherSeasons: [
      {
        season: "Peak Season", months: "November – February", icon: "🌊",
        tempRange: "24°C – 33°C", feels: "Warm and sunny — perfect beach weather",
        carry: ["Swimwear (2 sets)", "Light cover-up/sarong for beach walks", "SPF 50+ sunscreen (water-resistant)", "Sunglasses", "Flip flops + one pair walking shoes", "Light cardigan for AC restaurants/buses"],
        warning: "December–January is prime season — book accommodation 3+ months in advance. Prices are 3x the monsoon rate. Book confirmed before arriving or you'll find no room.",
        clothingAdvice: "Goa is India's most relaxed dress code state. Beachwear is fine on beaches. However, cover up for markets, churches, and the capital Panjim — strapless tops and very short shorts in towns attract unwanted attention."
      },
      {
        season: "Shoulder Season", months: "October, March", icon: "🌤️",
        tempRange: "28°C – 35°C", feels: "Warm, occasional rain, fewer crowds",
        carry: ["Swimwear", "Light rain jacket (October still has occasional showers)", "Sunscreen", "Bug repellent"],
        warning: "March marks the beginning of heat. Beaches are less crowded and more affordable. Some beach shacks start closing from mid-March.",
        clothingAdvice: "Light cotton. March starts getting hot — breathable fabrics essential."
      },
      {
        season: "Monsoon", months: "June – September", icon: "⛈️",
        tempRange: "27°C – 33°C", feels: "Lush green, heavy rain, empty beaches",
        carry: ["Quality waterproof jacket", "Rubber sandals (floods possible)", "Waterproof bag", "Extra pair of shoes in sealed bag"],
        warning: "Swimming is PROHIBITED in monsoon — strong currents and rough sea are dangerous. Many beach shacks close. But Goa in monsoon is lush, cheap, and beautiful in a different way. Waterfalls (Dudhsagar) are at peak.",
        clothingAdvice: "Quick-dry fabrics only. Do NOT wear leather — it molds within days in Goa monsoon humidity."
      },
    ],
    cityHurdles: [
      { icon: "🛵", issue: "Scooter rental shops claiming 'damage' that wasn't yours", solution: "Before taking the scooter: photograph every scratch, dent, and existing damage from all angles, including close-ups. Send these photos to the owner via WhatsApp — creates a time-stamped record. Never pay for damage you didn't cause.", severity: "high" },
      { icon: "🚔", issue: "Police checkpoints for alcohol + driving", solution: "Goa has strict drink-driving enforcement — breathalyser tests are common. Fine: ₹10,000+. Simple solution: if you've had even 1 drink, don't ride. Take a Goa Miles taxi instead. It's ₹200 — not worth the risk.", severity: "high" },
      { icon: "🌊", issue: "Ocean currents — drowning risk is real", solution: "ALWAYS swim between red-and-yellow flag zones where lifeguards are present. Red flag = no swimming at all. Goa beaches have recorded many drowning deaths annually among tourists ignoring flags. Even strong swimmers should respect the ocean.", severity: "high" },
      { icon: "💊", issue: "Drugs approach at beaches and parties", solution: "Drug use is illegal in Goa despite its reputation. Police run frequent crackdowns. If approached, firmly decline and walk away. Penalties are severe — jail time for both use and possession.", severity: "high" },
      { icon: "🍹", issue: "Spiked drinks at parties and beach shacks", solution: "Never leave your drink unattended at a party. Accept drinks only from sealed bottles. If you feel suddenly unwell after a drink, alert a trusted person immediately and seek medical help.", severity: "high" },
    ],
    cityEssentials: {
      atm: "ATMs in Calangute, Baga, Anjuna main markets. Rural beach areas (Agonda, Patnem) have very limited ATMs — withdraw cash in Panaji or Margao. Most beach shacks are cash-only.",
      sim: "Airtel works best across North Goa. Jio has good coverage in South Goa. Buy at Airtel/Jio stores in Panaji or Margao (not at airport — they overcharge).",
      wifi: "Most mid-range+ hotels have WiFi. Beach shacks rarely do. Download offline maps of Goa before arriving — GPS navigation while scootering is essential.",
      medical: "Goa Medical College (Government): 0832-2458700. Apollo Clinic Panaji (private): 0832-2228888. Most beach areas have small clinics. Carry your travel insurance details.",
      language: "Konkani is local. Hindi widely understood. English widely spoken — Goa is India's most English-fluent state outside metros. No language barrier for tourists.",
      localEmergency: "Goa Police: 0832-2423400 | Tourist Police: 100 | Women Helpline: 1091 | Beach Patrol: 0832-2437722",
      upi: "Well-accepted in Panaji and Margao. Beach shacks prefer cash. Large restaurants and hotels accept cards. Carry ₹1,000–₹2,000 in small notes at all times.",
      powerOutlet: "Standard Indian Type C/D, 230V. Power cuts are common in monsoon season. Carry a power bank. Beach areas sometimes have generator-powered electricity.",
    },
    localAttractions: [
      { name: "Palolem Beach (South Goa)", type: "Crescent Beach", distanceFromCenter: "60 km from Panaji", entryFee: "Free", timing: "All day", bestTime: "Sunrise and sunset", insiderTip: "North Goa is parties. South Goa (Palolem, Agonda) is peace. Palolem at sunrise with fishing boats is one of India's most photogenic scenes. Silent Noise headphone party on Saturday nights is unique.", mustDo: true },
      { name: "Dudhsagar Falls", type: "Waterfall + Jeep Safari", distanceFromCenter: "60 km from Panaji", entryFee: "₹400 + ₹3,500 jeep (shared 6 people)", timing: "Best July–January", bestTime: "Morning (before afternoon heat)", insiderTip: "The Bhagwan Mahavir Wildlife Sanctuary drive to Dudhsagar passes through dense jungle where you genuinely might spot a panther or bison. Go early for best water volume at the falls.", mustDo: true },
      { name: "Old Goa Basilica of Bom Jesus", type: "UNESCO Heritage Church", distanceFromCenter: "10 km from Panaji", entryFee: "Free", timing: "9am – 6:30pm, closed Sunday mornings", bestTime: "9am to avoid tour buses", insiderTip: "St. Francis Xavier's preserved body is displayed here — a major pilgrimage site. The silver casket is opened every 10 years (next: 2034). Even non-religious visitors find the baroque interiors extraordinary.", mustDo: false },
      { name: "Saturday Night Market (Arpora)", type: "Night Market", distanceFromCenter: "3 km from Baga", entryFee: "Free entry", timing: "6pm – 12am, Saturdays only", bestTime: "After 8pm when it gets lively", insiderTip: "300+ stalls with food from 30+ countries, live music, and crafts. It's tourist-priced but genuinely entertaining. Negotiation isn't culturally expected here — prices are more fixed than bazaar shopping.", mustDo: false },
    ],
    travelAdvisory: {
      updatedFrom: "Goa Tourism Department & Ministry of Tourism India",
      bestTimeToVisit: "November to February — perfect beach weather (27–32°C), all shacks and water sports operational, vibrant nightlife. Carnival (February) and New Year are unmissable.",
      peakSeason: "December 20 – January 10: peak of peak. Prices double or triple. Book accommodation 2–3 months ahead. December 31 is the single most crowded night in Goa.",
      offSeason: "June – September (Monsoon): most beach shacks close, rough seas, heavy rain. But South Goa stays beautiful and resorts offer 50% discounts. A very different but authentic Goa experience.",
      alerts: [
        { level: "warning", icon: "🚩", title: "Beach Safety — Red Flag Warnings", detail: "Goa beaches have lifeguards and flag systems. RED flag = no swimming, dangerous currents. YELLOW = swim with caution. GREEN = safe. Multiple tourist drowning deaths occur annually from ignoring flags. Never swim at unpatrolled or unflagged beaches." },
        { level: "warning", icon: "💊", title: "Drugs — Zero Tolerance", detail: "Goa Police conducts regular narcotics raids at beach parties and hostels. Possession of any narcotics (including cannabis) is a criminal offence with a minimum 6-month sentence. This is strictly enforced. Do not accept drugs from strangers." },
        { level: "caution", icon: "🏍️", title: "Scooter Safety", detail: "Scooter accidents are the leading cause of tourist injury in Goa. Always wear a helmet (mandatory by law, ₹500 fine without). Do not ride at night after drinking. Goa roads have unexpected speed breakers. Check brake condition before renting." },
        { level: "info", icon: "🏖️", title: "Beach Shack Season", detail: "Most beach shacks operate October – May only. June–September they are dismantled for monsoon. If visiting in monsoon, stick to South Goa (Palolem, Agonda) where some year-round establishments operate." },
      ],
      dos: [
        "Always check beach flag color before swimming — never enter red-flag water regardless of conditions",
        "Rent a scooter for maximum freedom — Goa is best explored by two-wheels, but ALWAYS wear a helmet",
        "Try Goan fish curry rice at local restaurants (not tourist shacks) — far better quality and a quarter of the price",
        "Book water sports only through licensed operators on the beach with visible certification",
        "Visit Dudhsagar Falls by jeep safari from Collem — the most spectacular waterfall in South India",
        "Take the sunset cruise on the Mandovi River — traditional Goan music and feni tasting included",
        "Carry cash for beach shacks — many are card-free especially in North Goa villages",
      ],
      donts: [
        "Don't swim at beaches without lifeguards or when red flag is flying",
        "Don't carry, buy, or accept any narcotics — Goa law enforcement is strict and penalties severe",
        "Don't wear bikinis or swimwear away from beaches — cover up in markets, churches, and villages",
        "Don't rent a scooter without a valid driving licence — police checkpoints are common",
        "Don't accept 'beach party' invitations from strangers — some are scams or drug sting setups",
        "Don't eat at restaurants directly facing famous beaches — quality drops and prices double",
      ],
      emergencyContacts: [
        { label: "Goa Police Tourist Helpline", number: "0832-2423400", icon: "📞" },
        { label: "Police", number: "100 / 112", icon: "🚔" },
        { label: "Ambulance / Fire", number: "102 / 101", icon: "🚑" },
        { label: "Coast Guard Goa", number: "1554", icon: "⛵" },
        { label: "Goa Medical College (Major)", number: "0832-2458727", icon: "🏥" },
        { label: "Women Helpline", number: "1091", icon: "🛡️" },
      ],
      healthTips: [
        "Jellyfish stings are common November–March — don't touch even beached jellyfish; treat with vinegar, not freshwater",
        "Sunburn is severe at Goa's latitude — use SPF 50+ and reapply every 2 hours at the beach",
        "Hygiene at open beach shacks varies — prefer restaurants over makeshift beach stalls for cooked food",
        "Goa Medical College, Panaji is the main government hospital; Manipal Hospital is the best private option",
        "Feni (local cashew/coconut spirit) is potent — start slow, it's far stronger than it tastes",
        "Stay hydrated — beach heat plus alcohol dehydrates fast; drink a glass of water per alcoholic drink",
      ],
      culturalNotes: [
        "Goa has a strong Portuguese-Catholic heritage — Old Goa's churches (Basilica of Bom Jesus) require modest dress",
        "Carnival (February, 3 days before Ash Wednesday) is Goa's biggest festival — vivid parades, floats, music",
        "Shigmo is the Hindu spring festival (March) with traditional folk dances and processions",
        "Goa locals (Goans) are proud of their distinct identity — not 'just India' — respect the local culture",
        "Flea markets (Wednesday market Anjuna, Saturday Arpora) are for browsing and buying, not aggressive bargaining",
        "Tipping at restaurants is expected (10%) — beach shacks more so since staff wages are very low",
      ],
      moneyTips: [
        "Peak season prices (Dec–Jan) are 2–3x off-season — factor this into your budget",
        "ATMs are widely available in tourist areas but often run dry during peak season — withdraw extra on weekdays",
        "UPI widely accepted at most shops, restaurants, and taxis; beach shacks prefer cash",
        "Scooter rental: ₹300–500/day negotiated directly with owner; avoid agency-rented bikes (higher price, less maintained)",
        "Avoid taxi mafias in North Goa — Goa Miles app (local Ola equivalent) is meter-based and reliable",
      ],
    },
  },

  {
    destId: "ladakh",
    fromCityToSight: "From Leh airport, your hotel will arrange pickup (₹500–₹800). From Leh city to Pangong Tso: 5h drive (160 km). From Leh to Nubra Valley: 3h drive via Khardung La. All remote destinations require hiring a full taxi/SUV — no public transport exists beyond Leh town.",
    firstThingsToDo: [
      "REST. Do absolutely nothing strenuous for the first 24–48 hours — altitude acclimatisation is not optional",
      "Drink 3L water before you feel thirsty",
      "Get Inner Line Permit from DC Office Leh (10min walk from main market) — needed for Nubra and Pangong",
      "Arrange your taxi itinerary for the trip — book taxi union taxi from Leh taxi stand",
      "NO alcohol for first 48 hours — worsens altitude sickness severely",
    ],
    arrivalPoints: [
      {
        by: "Flight",
        icon: "✈️",
        name: "Kushok Bakula Rimpochee Airport, Leh (IXL) — 11,500 ft altitude",
        distanceFromCity: "5 km from Leh market",
        toAccommodation: [
          { step: 1, icon: "🧘", action: "DO NOT rush off the plane. Walk slowly. The altitude hits immediately — shortness of breath and lightheadedness are normal", cost: "—", duration: "—", tip: "Many tourists race to grab luggage and feel fine until they stand up from a chair 2 hours later. The altitude affects you gradually. Move at half your normal pace." },
          { step: 2, icon: "🚗", action: "Hotel pickup is standard (pre-arrange). Or take airport taxi (₹300–₹500 to city)", cost: "₹300–₹500", duration: "15 min", tip: "Your hotel will almost certainly offer airport pickup if you book in advance. Cost: ₹500–₹800. Well worth it on arrival day." },
          { step: 3, icon: "🛏️", action: "Check in to hotel. Lie down. Do not unpack standing. Rest horizontal for 2–3 hours.", cost: "—", duration: "2–3 hours rest mandatory", tip: "If you feel severe headache, vomiting, or chest tightness — these are serious altitude sickness signs. Tell hotel staff immediately. They know the protocol." },
          { step: 4, icon: "💧", action: "Drink 2 glasses of water immediately. Take Diamox 250mg if prescribed by your doctor before travel", cost: "—", duration: "—", tip: "Diamox (acetazolamide) helps acclimatisation but requires a doctor prescription. Get it before leaving your home city. Dose: 125–250mg twice daily from Day 1." },
        ],
      },
      {
        by: "Road",
        icon: "🚗",
        name: "Manali–Leh Highway (480 km, 2 days) OR Srinagar–Leh Highway (434 km, 1–2 days)",
        distanceFromCity: "Road ends in Leh city",
        toAccommodation: [
          { step: 1, icon: "🏕️", action: "Day 1: Manali → Camp at Sarchu or Keylong (3,094m). Gradual altitude gain.", cost: "₹500–₹2,000 camp/guesthouse", duration: "8–10h driving", tip: "This 2-day acclimatisation drive is the best way to arrive in Ladakh — your body adjusts gradually. Flying to Leh is faster but harsher on the body." },
          { step: 2, icon: "🏔️", action: "Day 2: Sarchu → Over Tanglang La (17,480 ft) → Leh. Cross passes early morning — after noon weather deteriorates.", cost: "₹2,500–₹8,000 shared/private taxi from Manali", duration: "10–12h", tip: "Carry passport, Manali–Leh permit (₹400, arranged in Manali). Carry warm clothes — passes are cold year-round even in summer." },
        ],
      },
    ],
    weatherSeasons: [
      {
        season: "Peak Season", months: "June – September", icon: "☀️",
        tempRange: "15°C – 30°C (day) / -5°C to 8°C (night at passes)", feels: "Pleasant by day, bitterly cold at altitude by night",
        carry: ["Thick down jacket (mandatory — even in June)", "Thermal innerwear (top and bottom)", "Wool socks and gloves", "SPF 80+ sunscreen (UV intensity triples at this altitude)", "Sunglasses (UV protection mandatory — snow blindness is real)", "Warm hat and balaclava"],
        warning: "UV radiation at 11,500–18,000 ft is EXTREME. Without SPF 80+ sunscreen and UV-blocking sunglasses, you will get severe sunburn within 2 hours. This is not exaggeration — UV burns at altitude are very painful.",
        clothingAdvice: "Layering is everything. At 8am at Khardung La: -5°C. At noon in Leh market: 28°C. You need to add and remove 4 layers through the day. Down jacket over thermals in morning, T-shirt by afternoon."
      },
      {
        season: "Winter Trekking", months: "December – February", icon: "🧊",
        tempRange: "-20°C to -5°C", feels: "Extreme cold — survival conditions",
        carry: ["Expedition-grade down jacket (-30°C rated)", "Balaclava, ski goggles, double-layer gloves", "Thermal layers x3", "Insulated boots", "Hand warmers", "Emergency whistle and survival blanket"],
        warning: "Winter Ladakh is for experienced mountaineers only. The famous Chadar Trek (frozen Zanskar River) requires extreme fitness, prior cold experience, and a certified guide. Do NOT attempt in winter without full preparation.",
        clothingAdvice: "Cotton kills in winter at altitude — it loses insulation when wet. Wool base layer, fleece mid-layer, expedition down outer layer. No exceptions."
      },
    ],
    cityHurdles: [
      { icon: "🌄", issue: "Altitude Mountain Sickness (AMS) — the #1 Ladakh danger", solution: "There is no shortcut. Rest the first day. Drink water constantly. Symptoms: headache, nausea, dizziness — these are NORMAL for 24–48h. Severe symptoms (chest tightness, confusion, can't walk straight) need IMMEDIATE descent and medical help. The Leh hospital has an altitude specialist.", severity: "high" },
      { icon: "📵", issue: "No mobile signal beyond Leh city — BSNL-only in remote areas", solution: "Buy a BSNL SIM in Leh (₹100 + ₹100 recharge) for Nubra and Pangong connectivity. Airtel/Jio have zero signal beyond Leh. Download offline maps of all routes before leaving city.", severity: "high" },
      { icon: "💰", issue: "No ATMs beyond Leh — carry sufficient cash", solution: "Withdraw cash for your entire Ladakh stay from Leh ATMs. Nubra camps, Pangong tents, and remote restaurants are 100% cash-only. Carry ₹15,000–₹25,000 in cash per person for a week. SBI ATM near Leh main market is most reliable.", severity: "high" },
      { icon: "🛣️", issue: "Road closures due to weather — no warning", solution: "Always check road status at district administration office or your hotel before departing for passes. WhatsApp groups of Leh taxi drivers share real-time road updates. Never start a pass crossing after 11am.", severity: "medium" },
      { icon: "🥾", issue: "Running out of fuel on remote roads", solution: "Fill your petrol tank FULL in Leh before every long drive. There are NO petrol stations between Leh and Pangong (160 km), Leh and Nubra (120 km), or on Manali highway. Your driver will know this — confirm before departing.", severity: "high" },
    ],
    cityEssentials: {
      atm: "SBI ATM near Leh main market (most reliable). Axis Bank ATM near bus stand. Withdraw everything here — NO ATMs in Nubra, Pangong, Tso Moriri. Many are out of service. Carry backup cash.",
      sim: "BSNL SIM is essential for remote Ladakh (₹100 SIM + ₹100 recharge). Buy at BSNL office, Leh main market. Airtel/Jio work only in Leh city. Satellite wifi available at some Pangong camps (extra cost).",
      wifi: "Hotel WiFi in Leh is decent (3–5 Mbps). Outside Leh: no WiFi except at a few luxury camps with expensive satellite service. Download everything before leaving Leh.",
      medical: "SNM Hospital Leh (Govt, has altitude specialist): 01982-252247. Altitude sickness clinic near hospital. Carry your own medications (Diamox, Dexamethasone for emergencies, Paracetamol). Flying back to Delhi is sometimes the only cure for severe AMS.",
      language: "Ladakhi and Hindi. Most guesthouse owners and drivers speak functional Hindi. English widely understood in tourist areas. 'Julay' = universal Ladakhi greeting (Hello/Thank you/Goodbye).",
      localEmergency: "Leh Police: 01982-252018 | Army Medical (24h): 01982-252247 | District Hospital: 01982-252462 | Emergency: 112",
      upi: "Google Pay/PhonePe work in Leh city only. Beyond Leh: zero digital payments. Only cash accepted at all camps, dhabas, and remote homestays.",
      powerOutlet: "Power supply in Leh is 230V but inconsistent — 2–8h cuts daily are common. Most hotels/camps have backup inverters. Charge all devices whenever power is on. Carry a large power bank (20,000mAh minimum).",
    },
    localAttractions: [
      { name: "Pangong Tso Lake", type: "High-Altitude Blue Lake", distanceFromCenter: "160 km from Leh", entryFee: "Included in Inner Line Permit", timing: "All day — overnight camping available", bestTime: "Sunrise (5am) — lake turns gold then aquamarine", insiderTip: "The lake is 134 km long — 60% in China. The famous '3 Idiots' shooting spot is on the far east shore (2h drive from the main entry). Go to the far end for isolation — most tourists stop at the first viewpoint.", mustDo: true },
      { name: "Nubra Valley (Khardung La)", type: "Desert Valley over World's Highest Pass", distanceFromCenter: "120 km via Khardung La", entryFee: "ILP included", timing: "2-day minimum", bestTime: "June–September", insiderTip: "Hunder sand dunes look impossibly surreal in Ladakh — orange dunes with snow peaks behind them. The double-humped Bactrian camel rides (₹200) are fun. Diskit Monastery has a 32m Buddha looking over Pakistan — built by the Dalai Lama.", mustDo: true },
      { name: "Thiksey Monastery", type: "Living Buddhist Monastery", distanceFromCenter: "19 km from Leh", entryFee: "₹50", timing: "6am – 6pm (puja at 6am)", bestTime: "6am monk puja — dawn prayers are extraordinary", insiderTip: "Arrive at 5:45am for the 6am morning puja (prayer). Sit quietly at the back. Monks in red robes, drums, horns, and incense at dawn light — one of the most spiritual experiences in India. Breakfast served to monks at 7am — you may be invited.", mustDo: true },
      { name: "Magnetic Hill", type: "Optical Illusion — Tourist Stop", distanceFromCenter: "30 km from Leh", entryFee: "Free", timing: "All day", bestTime: "10am–12pm", insiderTip: "Vehicles appear to roll uphill due to a classic optical illusion — the surrounding terrain makes a downhill slope appear uphill. Fun 10-min stop. The Buddha statue (Gurudwara Pathar Sahib) 2 km before is more interesting.", mustDo: false },
      { name: "Tso Moriri Lake", type: "Remote High-Altitude Lake — Hidden Gem", distanceFromCenter: "240 km from Leh", entryFee: "ILP included", timing: "2-day minimum visit", bestTime: "June–September", insiderTip: "Pangong is famous. Tso Moriri is better. Fewer than 5% of Ladakh tourists go here. The 4,500m altitude, nomadic Changpa families, and undeveloped shoreline make it the real Himalayan wilderness. The drive via Chumathang hot springs is spectacular.", mustDo: false },
    ],
    travelAdvisory: {
      updatedFrom: "Ladakh Tourism & J&K Government Official Advisory",
      bestTimeToVisit: "June to September — roads open, passes accessible, weather clear, temperatures 15–30°C in Leh valley. July–August has the most stable weather. June is best for river rafting.",
      peakSeason: "July – August: peak tourist season. Book guesthouses 3–4 weeks ahead. Leh town gets very busy but passes are fully accessible.",
      offSeason: "October–May: most roads and high passes (Khardung La, Chang La) are closed by snow. Winter (Dec–Feb) Chadar Trek on frozen Zanskar River operates but is extreme (−30°C). Only for experienced winter trekkers.",
      alerts: [
        { level: "warning", icon: "🏔️", title: "Acute Mountain Sickness (AMS) — Critical", detail: "Leh sits at 3,524m. AMS symptoms: headache, nausea, dizziness, insomnia. Rest for 24–48 hours on arrival. Do NOT ascend to higher passes (Khardung La 5,359m, Chang La 5,360m) within the first 48 hours. Diamox (Acetazolamide) can be prescribed by Leh doctors. If symptoms worsen, descend immediately — death from HACE (High Altitude Cerebral Edema) has occurred." },
        { level: "warning", icon: "⚡", title: "No Alcohol First 48 Hours", detail: "Alcohol significantly worsens altitude acclimatisation and increases AMS risk. Even one drink in the first 48 hours can trigger severe symptoms. This is not a guideline — it is a medical warning followed by all altitude medicine practitioners." },
        { level: "caution", icon: "📋", title: "Inner Line Permit Required", detail: "Foreigners and Indians both require an Inner Line Permit (ILP) for Nubra Valley, Pangong Lake, and Tso Moriri. Available at DC Office Leh (10-min walk from main market). Cost: ₹20–100 depending on area. Not available online — you must collect it in Leh in person." },
        { level: "caution", icon: "🌦️", title: "Flash Floods (July–August)", detail: "Ladakh has experienced devastating flash floods (2010, 2015, 2021). During heavy rainfall, do not camp near riverbeds. Monitor LAHDC and local weather alerts. The Indus, Shyok, and Zanskar rivers can rise in hours during cloudburst events." },
        { level: "info", icon: "📵", title: "Limited Connectivity", detail: "BSNL has the widest coverage in remote Ladakh. Jio and Airtel work in Leh city but often fail beyond. No signal in many valleys, Nubra, and remote areas. Download offline maps (MapsMe or Google Maps) and save all important contacts before leaving Leh." },
      ],
      dos: [
        "REST for the first 24–48 hours in Leh — no high passes, no strenuous activity, no alcohol",
        "Drink 3–4 litres of water daily — altitude dehydration happens faster and more silently than at sea level",
        "Get Inner Line Permit from DC Office Leh on Day 2 — needed for most scenic areas",
        "Book a reliable local taxi from Leh Taxi Union — they know the roads, weather, and permits",
        "Carry Diamox (consult doctor) — it significantly reduces AMS risk at altitude",
        "Download offline maps before leaving Leh — mobile signal fails on most routes",
        "Carry warm layers even in July — temperature at 5,000m passes drops to 0°C even in summer",
        "Apply SPF 50+ sunscreen — UV radiation at 3,500–5,000m is 3× more intense than at sea level",
      ],
      donts: [
        "Don't consume alcohol for the first 48 hours — this is a medical requirement, not a preference",
        "Don't drive to Khardung La or Chang La within 24 hours of arriving in Leh",
        "Don't trek or camp alone in remote valleys — weather can change in under 30 minutes",
        "Don't enter restricted military zones or photograph military installations — serious legal consequences",
        "Don't attempt the Manali–Leh highway self-drive without prior mountain driving experience",
        "Don't ignore worsening AMS symptoms — descent is the only cure; do not 'sleep it off' at altitude",
      ],
      emergencyContacts: [
        { label: "LAHDC Tourist Helpline", number: "01982-252094", icon: "📞" },
        { label: "SNM Hospital Leh", number: "01982-252012", icon: "🏥" },
        { label: "Police", number: "100 / 112", icon: "🚔" },
        { label: "Army Helpline (Emergencies)", number: "01982-252222", icon: "🪖" },
        { label: "Ambulance", number: "108", icon: "🚑" },
        { label: "Mountain Rescue (SDRF)", number: "01982-255067", icon: "⛑️" },
      ],
      healthTips: [
        "AMS is not predictable by fitness level — even athletes get altitude sickness; age 25–35 is highest risk group",
        "Symptoms of HACE (life-threatening): confusion, inability to walk straight, severe headache despite Diamox — evacuate immediately",
        "Carry a pulse oximeter — SpO2 below 85% at rest is a warning sign; below 80% requires immediate descent",
        "SNM Hospital Leh has a hyperbaric chamber — in serious AMS, this can be life-saving before evacuation",
        "UV radiation is extreme — sunglasses (UV400 rated) are essential, not optional. Snow blindness is a real risk",
        "Altitude causes insomnia for the first 2–3 nights — this is normal; melatonin helps but Diamox-induced urination disrupts sleep",
      ],
      culturalNotes: [
        "Ladakh is a Buddhist region — monasteries (gompas) require shoes off, clockwise circumambulation, and quiet respect",
        "Asking permission before photographing monks, locals, or prayer ceremonies is essential",
        "Prayer flags and mani walls (stone piles with inscriptions) should be passed on the left — always keep them on your right",
        "Hemis Festival (June/July) is Ladakh's most spectacular cultural event — masked dance performances at India's largest monastery",
        "Ladakhi people are warm but reserved — greet with 'Julley' (hello in Ladakhi) for an instant connection",
        "Locally-produced apricots, apricot jam, and sea buckthorn products are the best souvenirs and support local economy",
      ],
      moneyTips: [
        "Carry significant cash before leaving Leh — ATMs in Nubra, Pangong, and Zanskar are scarce and often empty",
        "Leh has multiple ATMs (SBI, J&K Bank, PNB) — withdraw ₹5,000–10,000 before heading to remote areas",
        "UPI works in Leh city but fails in remote valleys — always carry physical cash outside town",
        "Taxi rates are fixed by the Leh Taxi Union and are non-negotiable — ask for the official rate card",
        "Homestay accommodation is significantly cheaper than hotels and provides authentic cultural experience",
      ],
    },
  },

  {
    destId: "varanasi",
    fromCityToSight: "From Varanasi Junction station, the ghats are 6 km. Take a prepaid auto (₹150–₹200) to Dashashwamedh Ghat (main ghat). Be very specific about your destination — 'Dashashwamedh Ghat' not just 'ghats'. From Varanasi airport, cab to ghats costs ₹600–₹800.",
    firstThingsToDo: [
      "Head straight to your ghat-area guesthouse — drop luggage, don't wander with it",
      "Ask guesthouse owner about the 6:30pm Ganga Aarti — they'll show you the best viewing spot",
      "Book a sunrise boat ride for next morning through your guesthouse (₹200–₹400/hour)",
      "Exchange money if needed — ATMs near main ghats are limited",
      "Do NOT engage with the 'priest' who approaches you on the street to bless your dead relatives — it's a well-documented scam",
    ],
    arrivalPoints: [
      {
        by: "Train",
        icon: "🚂",
        name: "Varanasi Junction (BSB) — Main Station",
        distanceFromCity: "6 km from Dashashwamedh Ghat",
        toAccommodation: [
          { step: 1, icon: "📍", action: "Exit main gate. Go to the Pre-Paid Auto booth (inside station near exit 1)", cost: "₹150–₹200 to ghat area", duration: "20–30 min (traffic)", tip: "The road to ghats narrows significantly — autos can only go to a certain point. You'll walk the last 5–10 min through lanes. This is normal and expected." },
          { step: 2, icon: "🗺️", action: "Use Google Maps offline to navigate the lanes (gallis) to your guesthouse", cost: "—", duration: "5–10 min walk", tip: "Varanasi's old city gallis (lanes) are no wider than 2 people. Some are dead ends. Having offline maps is essential — mobile data is patchy in the narrow lanes." },
        ],
      },
      {
        by: "Flight",
        icon: "✈️",
        name: "Lal Bahadur Shastri International Airport (VNS)",
        distanceFromCity: "25 km from ghats",
        toAccommodation: [
          { step: 1, icon: "🚗", action: "Prepaid taxi from airport arrivals counter (Government booth, look for the blue board)", cost: "₹600–₹900 to ghat area", duration: "40–60 min", tip: "Ola and Uber operate from Varanasi airport pickup zone. Often 20–30% cheaper than prepaid. Check app before accepting prepaid counter rate." },
        ],
      },
    ],
    weatherSeasons: [
      {
        season: "Best Season", months: "October – February", icon: "☀️",
        tempRange: "12°C – 27°C", feels: "Pleasant days, cool evenings and early mornings",
        carry: ["Medium jacket for evening Aarti (ghats can be very cold by 6pm)", "Scarf (also useful as temple cover)", "Comfortable walking shoes — ghat steps are uneven", "Hand sanitizer — ghats are spiritually powerful but physically filthy"],
        warning: "January mornings at ghats: 8–10°C. The Ganga Aarti at 6:30pm in January requires a warm layer — the wind from the river is cold. Don't go in sandals to ghats — steps are slippery and wet.",
        clothingAdvice: "Conservative dress is non-negotiable in Varanasi. For women: salwar kameez or long skirt + covered shoulders. For men: long pants. Shorts and sleeveless tops cause genuine offence and attract harassment."
      },
      {
        season: "Summer", months: "April – June", icon: "🔥",
        tempRange: "38°C – 46°C", feels: "Intense, suffocating heat",
        carry: ["Maximum coverage lightweight cotton", "ORS sachets mandatory", "SPF 50+ sunscreen", "Wide-brim hat", "3L+ water daily"],
        warning: "Varanasi summer is extremely harsh. The marble and stone ghats radiate stored heat into the evening. Visit ghats ONLY before 8am or after 6pm in summer. The evening Aarti is still beautiful despite the heat.",
        clothingAdvice: "White or light cotton full coverage is the only sensible choice. Long-sleeved cotton kurta protects from both sun and modesty requirements simultaneously."
      },
    ],
    cityHurdles: [
      { icon: "🧙", issue: "Fake priests offering blessings, then demanding ₹5,000 'donation'", solution: "If a 'priest' approaches you on the street or near ghats and offers to perform a puja/blessing, politely decline and walk away. Legitimate temple priests do not solicit tourists. This is one of Varanasi's most common and well-documented scams.", severity: "high" },
      { icon: "⛵", issue: "Boatmen overcharging massively for boat rides", solution: "Sunrise boat: negotiate firmly. Fair price: ₹200–₹400/hour for a private boat (2–4 people). ₹600+ is tourist rate. Book through your guesthouse — they use trusted boatmen and often have fixed rates.", severity: "high" },
      { icon: "🚶", issue: "Getting lost in the labyrinthine galli (lane) network", solution: "Keep your hotel's Google Maps pin saved offline. When lost, ask any shopkeeper 'Dashashwamedh Ghat kahan hai?' — every local knows the main ghat. The lanes are confusing but not dangerous in daytime.", severity: "medium" },
      { icon: "📸", issue: "Photography restrictions at burning ghats (Manikarnika)", solution: "Photographing the burning ghats is strictly prohibited and deeply disrespectful. 'Guards' who ask for ₹500 to 'allow' photography are opportunists — there is no permit. Do not photograph funeral pyres under any circumstances.", severity: "high" },
      { icon: "💧", issue: "Stomach illness from contaminated food or water", solution: "Eat only at established restaurants with good reviews. Avoid raw salads and cut fruit from street vendors. Drink only sealed bottled water. The famous Blue Lassi (₹100) is safe — freshly made, pasteurised milk.", severity: "medium" },
    ],
    cityEssentials: {
      atm: "SBI ATM near Vishwanath Gali and Godowlia Chowk. ATMs near main ghats are few — withdraw in advance from city ATMs. Cash-heavy economy — many boats, temples, and small eateries don't accept digital payment.",
      sim: "Airtel and Jio stores near Lahurabir. Mobile signal in narrow gallis is weak — download offline maps and save important contacts before entering old city.",
      wifi: "Most guesthouse WiFi works on rooftops but weakens inside rooms due to thick old walls. Cafés on ghats (like Manpasand) offer free WiFi. Data is patchy in old city lanes.",
      medical: "Sir Sunderlal Hospital (Govt): 0542-2368001. Heritage Hospitals (private): 0542-2368888. Nearest pharmacy: Godowlia Market area.",
      language: "Bhojpuri and Hindi. Very little English in old city. Learn key phrases: 'Ghat kahan hai?' (Where is the ghat?), 'Boat ka kitna?' (How much for the boat?), 'Nahi chahiye' (I don't want it).",
      localEmergency: "UP Tourist Police: 1800-180-4010 | Varanasi Police Control: 0542-2502921 | Women Helpline: 1091 | Emergency: 112",
      upi: "Google Pay works at many shops and cafes. Old city vendors and boatmen mostly cash-only. Carry ₹1,500–₂,000 small notes daily.",
      powerOutlet: "Power cuts (load-shedding) of 2–4 hours are common in Varanasi, especially in summer. Most guesthouses have backup generators. Carry a power bank.",
    },
    localAttractions: [
      { name: "Ganga Aarti, Dashashwamedh Ghat", type: "Daily Ritual Ceremony", distanceFromCenter: "Is the center", entryFee: "Free (viewing boat: ₹150–₹300)", timing: "Daily at sunset — 6:30pm winter, 7pm summer", bestTime: "Arrive 30 min early for good position", insiderTip: "Watching from a boat on the river gives a better 360° view than fighting for ghat-side space. Book through your guesthouse. The ceremony lasts 45 min — 7 priests with fire, conch shells, bells, and camphor. Profoundly moving.", mustDo: true },
      { name: "Sunrise Boat Ride", type: "River Experience", distanceFromCenter: "Any ghat", entryFee: "₹200–₹400/hour", timing: "Sunrise: 5:30–7am", bestTime: "Sunrise (magical mist over river)", insiderTip: "Ask your boatman to row from Assi Ghat to Manikarnika (burning ghat) and back. Watching the city wake up on the ghats from the river is an experience unlike anywhere else on earth.", mustDo: true },
      { name: "Kashi Vishwanath Temple", type: "Sacred Hindu Temple", distanceFromCenter: "Old city", entryFee: "Free, but queue can be 2–3h", timing: "3am – 11pm (darshan slots)", bestTime: "Early morning for shorter queues", insiderTip: "The new Kashi Vishwanath Corridor (opened 2021) has transformed access. Book morning darshan slot online (shrikashivishwanath.in) to skip the main queue. Security is strict — no bags, phones inside.", mustDo: true },
      { name: "Sarnath", type: "Buddhist Pilgrimage Site", distanceFromCenter: "10 km from ghats", entryFee: "₹15 monument + ₹50 museum", timing: "9am – 5pm", bestTime: "Morning", insiderTip: "Buddha gave his first sermon here after enlightenment. The Dhamek Stupa (3rd century BC) is extraordinary. The Sarnath Museum houses Ashoka's original Lion Capital (now India's national emblem) — one of the most important objects in Indian history.", mustDo: false },
      { name: "Banarasi Silk Workshop", type: "Craft Experience", distanceFromCenter: "Old city", entryFee: "Free to observe", timing: "9am – 7pm", bestTime: "Morning (best light)", insiderTip: "Watch master weavers create sarees that take 15 days per piece on wooden handlooms. The intricate zari (gold thread) work is extraordinary. Buy only from certified government emporium (Gandak Gali) to get authentic Banarasi silk — not tourist-grade copies.", mustDo: false },
    ],
    travelAdvisory: {
      updatedFrom: "UP Tourism Official & Varanasi Municipal Corporation",
      bestTimeToVisit: "October to March — manageable heat, clear skies, and all ghats accessible. November is ideal: Diwali, Dev Deepawali (a thousand lamps on the ghats) transforms Varanasi into something otherworldly.",
      peakSeason: "October – February. Dev Deepawali (November, full moon) is the single most magical night. Book accommodation 2–3 months ahead for this date.",
      offSeason: "June – September: monsoon causes ghats to partially flood. Ganga water levels rise dramatically. Sunrise boat rides are harder to organise. Hot and humid, but city is quieter.",
      alerts: [
        { level: "warning", icon: "🌊", title: "Ganga Water — Do Not Consume", detail: "The Ganga at Varanasi is severely polluted with coliform bacteria at levels 3,000× WHO standards. Do not drink, swim in, or allow the water to enter your mouth. Even brief splashing during rituals — wash hands immediately after any contact." },
        { level: "caution", icon: "📸", title: "Photography at Cremation Ghats", detail: "Manikarnika and Harischandra ghats are active cremation sites running 24/7. Photography of the burning pyres is deeply disrespectful and will cause a confrontation. Some touts will offer 'rooftop photography spots' — these are scams. Observe reverently from a distance." },
        { level: "caution", icon: "🎭", title: "Fake Priest & Guide Scams", detail: "The 'boat ride baba' scam: a 'priest' offers to bless you on the ghat, performs rituals, then demands ₹3,000–10,000 for the 'ceremony'. Always confirm prices in writing before any interaction. Hire guides only through UP Tourism Bureau (Counter at Varanasi Junction station)." },
        { level: "info", icon: "🌙", title: "Best Experience: Arrive at 4:30am", detail: "The Ganga Aarti at Dashashwamedh Ghat is at sunrise and sunset. The sunrise aarti is far more atmospheric — fewer tourists, morning mist, Ganga dolphins occasionally visible. A boat on the river at dawn is the quintessential Varanasi moment." },
      ],
      dos: [
        "Take a sunrise boat ride from Dashashwamedh Ghat — the single most important Varanasi experience",
        "Hire an UP Tourism certified guide for the ghat walk — the stories layer the visual experience",
        "Attend Ganga Aarti at Dashashwamedh Ghat both morning and evening — they are completely different",
        "Try a 'lassi' from Blue Lassi shop (est. 1925) near Vishwanath Gali — legendary and authentic",
        "Walk the 84 ghats stretch once — from Rajghat to Assi Ghat along the river is 6.5 km of living history",
        "Download offline maps — Varanasi's old city lanes (gallis) are a labyrinth and signal drops frequently",
        "Buy authentic Banarasi silk from government emporium (Gandak Gali) only — significant fake market exists",
      ],
      donts: [
        "Don't drink or gargle Ganga water under any circumstances — severe health risk",
        "Don't photograph cremation ceremonies or bodies at Manikarnika Ghat",
        "Don't enter the main sanctum of Kashi Vishwanath Temple without leaving cameras and phones at the counter",
        "Don't take no-meter autos or touts' boats — fix price before boarding any transport or boat",
        "Don't wander the old city gallis alone at night — streets are dark, narrow, and disorienting",
        "Don't consume meat or eggs near the main temple area — Varanasi's religious center is strictly vegetarian",
      ],
      emergencyContacts: [
        { label: "UP Tourism Helpline", number: "1800-180-2522", icon: "📞" },
        { label: "Police", number: "100 / 112", icon: "🚔" },
        { label: "Ambulance", number: "108", icon: "🚑" },
        { label: "BHU Hospital (Major)", number: "0542-2367568", icon: "🏥" },
        { label: "Women Helpline", number: "1090", icon: "🛡️" },
        { label: "Tourist Police, Varanasi", number: "0542-2502349", icon: "👮" },
      ],
      healthTips: [
        "Waterborne disease risk is high — drink only sealed bottled water; avoid ice in non-restaurant settings",
        "Varanasi summers (April–June) reach 45°C with high humidity — stay indoors 11am–5pm",
        "Carry hand sanitizer — the ghats involve touching many shared surfaces",
        "BHU (Banaras Hindu University) hospital is the best medical facility — large, well-equipped, government",
        "Stomach upsets are common for first-time visitors — carry probiotic supplements and ORS",
        "If undergoing last rites (asthi visarjan) ceremonies, the river contact means washing hands thoroughly with soap afterward",
      ],
      culturalNotes: [
        "Varanasi is one of the world's oldest continuously inhabited cities — treat it with the depth it deserves",
        "Leather items are prohibited near the main ghats and temple areas — leave leather bags and belts at accommodation",
        "Dress completely modestly near temples and ghats — shoulders and knees covered, no sleeveless",
        "Death in Varanasi is considered sacred (moksha, liberation) — cremations are not morbid events but spiritual ones; observe with reverence",
        "Dev Deepawali (Kartik Purnima, October/November full moon): 1 million earthen lamps lit on all 84 ghats — among India's most spectacular sights",
        "The lanes of Varanasi's old city are shared by pedestrians, motorbikes, and cows — walk at their pace, not yours",
      ],
      moneyTips: [
        "ATMs available in Godaulia, Lahurabir, and near the railway station; sparse in old city gallis",
        "Carry ₹500–1,000 in small notes daily for boat rides (₹200–500), ghat activities, and street food",
        "UPI works but many ghat boatmen and old city vendors are cash-only",
        "Boat ride prices: official UTSD boats (government) from ₹150; private boats ₹300–500 — negotiate before boarding",
        "Banarasi silk can cost ₹2,000–₂,00,000 depending on quality — authenticate with a scratch test on the back of the fabric",
      ],
    },
  },

  {
    destId: "andaman",
    fromCityToSight: "From Port Blair airport: cab to hotel (₹200–₹400). From Port Blair to Havelock: ferry from Phoenix Jetty (2h, ₹600–₹1,200 depending on ferry company). From Port Blair to Neil Island: ferry (1–1.5h, ₹350–₹600). Book ferries 2–3 days in advance — very limited seats.",
    firstThingsToDo: [
      "Book ferry to Havelock BEFORE arriving in Andaman — they sell out 3–5 days in advance",
      "Collect permit for Ross Island and other restricted areas at Immigration, Port Blair",
      "Exchange currency — Havelock and Neil are mostly cash-only",
      "Get local SIM — signal is limited but important for emergency contact",
      "Book Havelock activities (scuba, snorkel) in advance if visiting Dec–Jan peak season",
    ],
    arrivalPoints: [
      {
        by: "Flight",
        icon: "✈️",
        name: "Veer Savarkar International Airport, Port Blair (IXZ)",
        distanceFromCity: "5 km from Port Blair city center",
        toAccommodation: [
          { step: 1, icon: "🚗", action: "Prepaid taxi from airport arrivals — fixed rates by zone displayed on board", cost: "₹200–₹400 to city hotels", duration: "15–20 min", tip: "Ola/Uber don't work in Andaman. Prepaid taxis from airport are your only option. Negotiate lightly if no prepaid counter is manned." },
          { step: 2, icon: "🛳️", action: "Check ferry timings to Havelock — most depart 6am–7am from Phoenix Jetty. Plan check-in accordingly.", cost: "Ferry: ₹600–₹1,200", duration: "2h crossing to Havelock", tip: "Makruzz and Nautika are the best private ferries (AC, on time, smoother). Government ferry is cheaper but 3.5h and no AC. Book private ferries at makruzz.com or nautika.in" },
        ],
      },
    ],
    weatherSeasons: [
      {
        season: "Peak Season", months: "November – April", icon: "🌊",
        tempRange: "24°C – 32°C", feels: "Warm, sunny, calm seas",
        carry: ["Swimwear (multiple sets)", "Rashguard / UV shirt (mandatory — tropical sun is fierce)", "SPF 50+ reef-safe sunscreen only (regular sunscreen kills coral)", "Water sandals", "Insect repellent (DEET) — sand flies bite painlessly but itch terribly"],
        warning: "Sand flies (no-see-ums) on Andaman beaches bite at dawn and dusk. They're tiny and nearly invisible — but their bites itch intensely for days. Apply DEET repellent and avoid sitting on sand at sunrise/sunset.",
        clothingAdvice: "Light beach wear. For Port Blair: slightly more conservative (small city feel). Havelock and Neil: very relaxed. Respectful swimwear (no topless beaches — India law applies everywhere)."
      },
      {
        season: "Monsoon", months: "May – October", icon: "⛈️",
        tempRange: "26°C – 30°C", feels: "Heavy rain, rough seas",
        carry: ["Waterproof bag mandatory for electronics", "Quick-dry clothes only", "Good raincoat"],
        warning: "Ferries are frequently cancelled during monsoon. SCUBA is not possible — zero visibility. Swimming is dangerous. If you must visit, stick to Port Blair and focus on history/culture. Cellular Jail, Ross Island, and Anthropological Museum are unaffected by rain.",
        clothingAdvice: "Quick-dry fabrics only. Leather and denim are miserable in Andaman monsoon heat and humidity."
      },
    ],
    cityHurdles: [
      { icon: "⛴️", issue: "Ferry bookings sold out for peak season", solution: "Book Makruzz or Nautika ferries at least 1 week ahead in Nov–Jan peak season. Cross-check: makruzz.com and nautika.in. If both full, government ferry is always available (3.5h, ₹300, no AC) — not comfortable but it gets you there.", severity: "high" },
      { icon: "🤿", issue: "Scuba operators offering uncertified or unsafe dives", solution: "Only dive with PADI-certified operators. Ask to see their PADI certification before booking. Legitimate operators: Dive India (Havelock), Prodivers (Neil Island), Barefoot Scuba. Uncertified operations have caused diving accidents here.", severity: "high" },
      { icon: "📵", issue: "No mobile data on Havelock and Neil — BSNL only", solution: "BSNL SIM is essential for Havelock and Neil Islands. Buy at Port Blair (BSNL office near Aberdeen Bazaar). Airtel has some signal in Havelock main village. Jio is unusable outside Port Blair.", severity: "high" },
      { icon: "🐠", issue: "Bleached coral from regular sunscreen — also causes skin problems", solution: "Use only reef-safe (biodegradable) sunscreen when snorkelling or swimming near coral. Many Havelock rental shops sell reef-safe sunscreen. Oxybenzone-based sunscreens are harmful to coral and banned at many sites.", severity: "medium" },
    ],
    cityEssentials: {
      atm: "Withdraw ALL cash in Port Blair before departing to Havelock/Neil. SBI ATMs in Aberdeen Bazaar (Port Blair) are most reliable. Havelock has 1 SBI ATM (often empty by noon on peak days). Neil Island has 0 reliable ATMs.",
      sim: "BSNL SIM: buy at BSNL office near Clock Tower, Port Blair. ₹100 + ₹100 recharge. Airtel has limited Havelock coverage. Jio works only in Port Blair.",
      wifi: "Port Blair hotels have decent WiFi. Havelock: most resorts have WiFi (variable speed). Neil Island: WiFi is satellite-based and slow at many places. Download everything in Port Blair.",
      medical: "Andaman Medical College & Hospital, Port Blair (Govt, 24h): 03192-232102. Island hospitals in Havelock (basic only). For serious medical emergencies, evacuation to Port Blair or mainland is required — travel insurance with medical evacuation cover is essential.",
      language: "Hindi widely spoken. Bengali and Tamil spoken in settlements. English at all tourist businesses. No language issues for tourists in main areas.",
      localEmergency: "Port Blair Police: 03192-232100 | Coast Guard: 03192-230420 | Emergency: 112 | Andaman Medical Hospital: 03192-232102",
      upi: "Accepted at Port Blair city restaurants and shops. Havelock and Neil: cash only at most beach shacks, activity operators, and local vendors. Bring ₹10,000–₹15,000 cash from Port Blair for a week on the islands.",
      powerOutlet: "Standard Type C/D, 230V. Power cuts of 2–4h are common on smaller islands. All resorts have backup generators. Carry a large power bank — especially important if using camera/dive lights.",
    },
    localAttractions: [
      { name: "Radhanagar Beach, Havelock", type: "Asia's Best Beach", distanceFromCenter: "12 km from Havelock Jetty", entryFee: "Free", timing: "All day", bestTime: "Sunset (5–6pm)", insiderTip: "The water is completely transparent to 3 metres depth — you can watch your own feet on the sand from standing. Arrive by 4pm, find a spot under a tree (no chairs on this natural beach), and watch the sun set into the Andaman Sea. Absolutely breathtaking.", mustDo: true },
      { name: "Elephant Beach Snorkelling", type: "Coral Reef Snorkel", distanceFromCenter: "9 km from Havelock Jetty (boat + 15min walk)", entryFee: "₹1,200–₁,500 incl. equipment", timing: "6am – 3pm (boats stop after)", bestTime: "Morning (clearest visibility)", insiderTip: "Hawksbill sea turtles regularly visit Elephant Beach. Snorkel the outer reef area (marked with buoys) for the densest fish life. The 15-minute jungle walk to the beach after the boat is scenic — stay on the path.", mustDo: true },
      { name: "Cellular Jail, Port Blair", type: "Colonial Prison — National Monument", distanceFromCenter: "Port Blair city", entryFee: "₹30 + ₹100 Sound & Light Show", timing: "9am – 12pm, 1:30pm – 4:45pm", bestTime: "Sound & Light Show: 5:30pm (Hindi) / 6:30pm (English)", insiderTip: "The solitary confinement cells where freedom fighters like Veer Savarkar were imprisoned for decades. The Sound & Light Show with actor-narrated history (45 min) is deeply moving and makes the visit meaningful beyond just the architecture.", mustDo: true },
      { name: "Baratang Limestone Caves", type: "Natural Wonder — Hidden Gem", distanceFromCenter: "100 km from Port Blair", entryFee: "₹600 per jeep + ₹50 permit", timing: "Full day trip only (6am–5pm)", bestTime: "Morning (convoy departs 6am)", insiderTip: "You travel by road convoy through Jarawa tribal forest, then speedboat through mangroves, then a 20-minute jungle walk. The limestone caves and mud volcanoes are extraordinary and almost no tourists go. MUST book a day ahead.", mustDo: false },
      { name: "Neil Island (Shaheed Dweep)", type: "Peaceful Island", distanceFromCenter: "40 km ferry from Port Blair", entryFee: "Free", timing: "All day, 2-day minimum", bestTime: "November – March", insiderTip: "If Havelock feels busy, Neil Island is its quieter sibling. Natural Bridge (Bharatpur Beach) — a limestone arch over turquoise lagoon with starfish visible at low tide — is one of Andaman's most beautiful natural formations. Only 2–3 scooter rentals needed to see the whole island.", mustDo: false },
    ],
    travelAdvisory: {
      updatedFrom: "Andaman & Nicobar Administration & India Tourism Official",
      bestTimeToVisit: "November to April — calm seas, excellent visibility for snorkelling and diving (15–30m), sunny beach days. Radhanagar Beach (Havelock) is most stunning November–January.",
      peakSeason: "December – January: peak season, flights and ferries fully booked. Reserve accommodation and Makruzz/Nautika ferries 4–6 weeks ahead.",
      offSeason: "May – October (Monsoon): rough seas, most water sports suspended, some ferries cancelled. Port Blair remains accessible but outer islands are difficult. Some resorts close.",
      alerts: [
        { level: "warning", icon: "🚫", title: "Jarawa Tribal Reserve — Strict Legal Protection", detail: "The Andaman Trunk Road passes through Jarawa tribal territory. It is ILLEGAL to photograph, interact with, or approach Jarawa tribal members. Violations are criminal offences under the Protection of Aboriginal Tribes Regulation. Do not offer food or gifts. The convoy system exists strictly to minimize contact." },
        { level: "warning", icon: "🪸", title: "Coral Reef Protection", detail: "Andaman reefs are protected under the Environment Protection Act. Touching, standing on, or removing coral is a criminal offence with heavy fines. Use only reef-safe sunscreen (no oxybenzone or octinoxate). Snorkelling operators are required to brief you — if they don't, change operators." },
        { level: "caution", icon: "🛳️", title: "Ferry Planning — Book in Advance", detail: "Only 4–6 Makruzz/Nautika ferries operate daily between Port Blair and Havelock. They sell out completely in peak season. Book at makruzz.com or nautika.in at least 1 week ahead. Government ferries are available as backup but 3.5h with no AC." },
        { level: "info", icon: "📵", title: "No International Roaming", detail: "Andaman & Nicobar Islands are on India's domestic network but outside typical roaming zones. Your mainland Indian SIM works but data speeds are slow on outer islands. WiFi at resorts is generally reliable. Offline maps are essential for island exploration." },
      ],
      dos: [
        "Book Makruzz or Nautika private ferries at makruzz.com in advance — don't rely on walk-in availability",
        "Carry adequate cash before departing Port Blair — ATMs on Havelock and Neil have limited cash and frequent outages",
        "Use reef-safe sunscreen only — standard sunscreens kill coral reefs; Andaman's underwater world depends on it",
        "Take the sunrise walk on Radhanagar Beach (Beach 7, Havelock) — one of Asia's best beaches is empty at 6am",
        "Book Scuba diving with accredited PADI operators (Dive India, Barefoot, Symphony) — not unlicensed freelancers",
        "Respect all ferry timings — they depart on schedule, not when full, and missing the last ferry leaves you stranded overnight",
        "Carry a waterproof bag or dry bag for beach days — Andaman rain is sudden and heavy",
      ],
      donts: [
        "NEVER photograph, approach, or interact with Jarawa tribal members — it is a criminal offence",
        "Don't touch or stand on coral during snorkelling — destroys decades of reef growth",
        "Don't carry single-use plastics onto beaches or islands — strict environmental enforcement applies",
        "Don't book unregistered SCUBA operators — safety certifications and equipment quality vary dramatically",
        "Don't underestimate sea conditions — swimming beyond the flagged zone at Radhanagar is extremely dangerous",
        "Don't assume ATMs will work — carry cash for at least 3–4 days before each island hop",
      ],
      emergencyContacts: [
        { label: "Andaman Tourism Helpline", number: "03192-232694", icon: "📞" },
        { label: "Police", number: "100 / 112", icon: "🚔" },
        { label: "Coast Guard Andaman", number: "1554", icon: "⛵" },
        { label: "ANET Hospital Port Blair", number: "03192-232102", icon: "🏥" },
        { label: "Ambulance", number: "102 / 108", icon: "🚑" },
        { label: "G.B. Pant Hospital (Major)", number: "03192-232102", icon: "🏥" },
      ],
      healthTips: [
        "Jellyfish stings occur especially November–February — treat with vinegar (carried by lifeguards), not freshwater",
        "Sea sickness is common on open-ocean ferries — take Avomine/Dramamine 30 minutes before boarding",
        "Tropical sun at these latitudes burns in 15 minutes — reapply SPF 50+ every 2 hours on beach days",
        "Freshwater is scarce on islands — drink bottled water; resorts provide filtered water; don't drink tap water on outer islands",
        "G.B. Pant Hospital Port Blair is the main medical facility; outer islands have only primary health centres — serious medical issues require airlift to Port Blair or mainland",
        "Carry a basic first-aid kit including antiseptic for coral scrapes — coral cuts get infected rapidly in tropical heat",
      ],
      culturalNotes: [
        "Andaman is a melting pot — Bengali, Tamil, Telugu, Nicobarese, and tribal communities coexist",
        "The Cellular Jail is a place of deep national significance — approach with the respect due to those who fought for independence",
        "Local fishing communities are conservative — dress modestly when visiting villages",
        "Island ecology is fragile — the 'island time' culture is real; schedules run on ferry and tide, not clocks",
        "Andamanese cuisine features coconut milk fish curries distinct from mainland India — try local restaurants in Havelock market",
        "Avoid plastic — multiple island panchayats have banned single-use plastic; carry a reusable bag and water bottle",
      ],
      moneyTips: [
        "Carry ₹5,000–8,000 cash before leaving Port Blair — outer islands have very limited banking",
        "ATMs in Havelock (Radha Nagar) and Neil Island exist but frequently run out of cash on weekends and holidays",
        "Most resort and restaurant UPI payments work; beach shacks and local shops are cash-only",
        "Ferry tickets: Makruzz ₹1,200–1,500 (AC, 2h); Government ferry ₹600 (3.5h, no AC) — worth the premium",
        "Scuba diving costs ₹3,500–5,500 for beginners' dive; PADI Open Water Course ₹18,000–25,000 (4 days)",
      ],
    },
  },

  {
    destId: "udaipur",
    fromCityToSight: "From Udaipur station or airport, the old city (Jagdish Chowk / City Palace) is 3–6 km. Take Ola/Uber (₹100–₹200) or auto-rickshaw (₹100–₁50). The old city is compact — once you're in the Jagdish Chowk area, everything is walkable. Lake Pichola boat rides depart from Rameshwar Ghat (walkable from old city).",
    firstThingsToDo: [
      "Check in to old city haveli — rooftop lake views are part of the Udaipur experience",
      "Buy boat cruise tickets at Rameshwar Ghat before 4pm (they sell out for sunset)",
      "Ask your hotel for a map of the old city — lanes are confusing at first but very enjoyable",
      "Avoid peak afternoon heat (11am–4pm) in summer — plan sightseeing around it",
      "Book Bagore ki Haveli cultural show (7pm, ₹60) through your hotel to secure a good seat",
    ],
    arrivalPoints: [
      {
        by: "Train",
        icon: "🚂",
        name: "Udaipur City Railway Station (UDZ)",
        distanceFromCity: "3 km from City Palace / old city",
        toAccommodation: [
          { step: 1, icon: "📱", action: "Book Ola or Uber from station — most reliable, metered, no negotiation", cost: "₹100–₁50 to old city", duration: "10–15 min", tip: "Udaipur traffic is heavier than expected for a small city. Factor 20–25 min at peak hours (5–7pm)." },
          { step: 2, icon: "🏨", action: "Old city havelis often have very narrow entrances — auto/bike only. If your haveli is inside the lanes, walk the last 200m with luggage", cost: "—", duration: "—", tip: "Ask your hotel exactly which street to alight — many havelis look the same from outside. Save the hotel pin on Google Maps before arriving." },
        ],
      },
      {
        by: "Flight",
        icon: "✈️",
        name: "Maharana Pratap Airport, Udaipur (UDR)",
        distanceFromCity: "22 km from old city",
        toAccommodation: [
          { step: 1, icon: "🚗", action: "Prepaid taxi from airport (government booth inside arrivals)", cost: "₹500–₇00 to old city", duration: "40–50 min", tip: "Ola and Uber are available from airport. Book in advance — surge pricing at arrival times. Hotel pickup can be arranged: ₹600–₹800." },
        ],
      },
    ],
    weatherSeasons: [
      {
        season: "Peak Season", months: "October – March", icon: "🌅",
        tempRange: "12°C – 28°C", feels: "Perfect — mild, sunny, beautiful light on marble",
        carry: ["Light jacket for evenings (rooftop restaurants get cool after 8pm)", "Comfortable walking sandals", "Sunscreen", "Camera — Udaipur rewards photography at every turn"],
        warning: "January evenings drop to 8–10°C. If you're doing the sunset boat cruise, carry a warm layer — the lake breeze is lovely but cold.",
        clothingAdvice: "Layers — day is warm (25°C), evening is cool (12°C). A light jacket in your bag is essential. Dress code: conservative near temples, relaxed at lake-view restaurants."
      },
      {
        season: "Summer", months: "April – June", icon: "🔥",
        tempRange: "35°C – 44°C", feels: "Hot but less extreme than Delhi or Jaipur",
        carry: ["Loose cotton only", "SPF 50+ sunscreen", "Wide-brim hat", "Large water bottle"],
        warning: "City Palace's open courtyards and Amber-style staircases radiate heat. Visit monuments before 10am or after 5pm. The lake and rooftop restaurants are pleasant even in summer evenings.",
        clothingAdvice: "Light cotton kurta-pajama or loose linen. Avoid dark colours."
      },
    ],
    cityHurdles: [
      { icon: "⛵", issue: "Unofficial 'private' boat operators near Lal Ghat", solution: "The official government RTDC boat cruise departs from Rameshwar Ghat (₹400, 1h, sunset). 'Private' boats near Lal Ghat often charge ₹800–₁,500 for the same route. Use the RTDC service or your hotel-arranged boat.", severity: "medium" },
      { icon: "🎨", issue: "'Artist' approach offering free 'demonstration' then pressuring purchase", solution: "Walk-in miniature painting demonstrations are often lead-ins to high-pressure sales. If you want to buy miniature art, go directly to the government emporium (Rajasthali) on City Palace Road.", severity: "low" },
      { icon: "🏰", issue: "City Palace combined ticket confusion", solution: "City Palace has multiple museums inside. The combined ticket (₹700) covers most sections. Buy at the main entrance counter — not from touts who offer 'guide + ticket combos' outside.", severity: "low" },
    ],
    cityEssentials: {
      atm: "Multiple ATMs on City Palace Road and near Hathipole. Generally reliable. Withdraw at city center ATMs — old city lane ATMs can be out of service.",
      sim: "Airtel store near City Palace Road. Good coverage throughout Udaipur city and nearby forts.",
      wifi: "Rooftop cafes (Ambrai, Jheel's, 1559 AD) have WiFi. Most hotels in old city provide WiFi. Coverage is good throughout Udaipur.",
      medical: "GBH American Hospital (private, 24h): 0294-2423000. Maharana Bhupal Hospital (Govt): 0294-2528811.",
      language: "Rajasthani and Hindi. Tourist areas have English signage. Very welcoming local culture toward tourists.",
      localEmergency: "Udaipur Tourist Police: 0294-2411535 | Women Helpline: 181 | Emergency: 112",
      upi: "Google Pay/PhonePe widely accepted including boat ticket counters, restaurants, and many shops.",
      powerOutlet: "Standard Type C/D, 230V. Power supply stable in Udaipur city.",
    },
    localAttractions: [
      { name: "Lake Pichola Sunset Boat Cruise", type: "Boat Ride", distanceFromCenter: "Rameshwar Ghat — walkable", entryFee: "₹400 (RTDC)", timing: "Sunset cruise: 3pm–6pm (times vary by season)", bestTime: "1 hour before sunset", insiderTip: "The boat passes the Lake Palace (Taj Hotel) and Jag Mandir island. Disembark at Jag Mandir for tea and views (₹100 entry) — the marble elephants at the jetty are extraordinary.", mustDo: true },
      { name: "City Palace Museum", type: "Royal Palace", distanceFromCenter: "Old city", entryFee: "₹300 Indians / ₹700 foreigners", timing: "9:30am – 5:30pm", bestTime: "Morning (10–12am)", insiderTip: "The Crystal Gallery inside City Palace (additional ₹500) houses Maharana Sajjan Singh's 1877 Osler glass order — crystal furniture, beds, and decanters that the Maharana never used because he died before arrival. One of India's strangest historical relics.", mustDo: true },
      { name: "Bagore ki Haveli Show", type: "Cultural Performance", distanceFromCenter: "Gangori Ghat", entryFee: "₹60", timing: "7pm daily (1 hour)", bestTime: "Arrive at 6:45pm", insiderTip: "Rajasthani folk dances, puppet shows, and the 'thali dance' (lamp balancing on head) inside an 18th-century lakeside haveli. It's touristy but genuinely entertaining and the setting is spectacular.", mustDo: false },
      { name: "Ranakpur Jain Temples", type: "Architectural Marvel — Hidden Gem", distanceFromCenter: "96 km", entryFee: "Free (camera: ₹50)", timing: "Noon–5pm (non-Jains restricted morning)", bestTime: "Noon (permitted time)", insiderTip: "1,444 marble columns — none identical. Built in 1437 with a genius spatial logic where every point inside the temple has a line of sight to the main shrine. One of India's greatest architectural achievements, almost never crowded. The drive through Aravalli forests is equally beautiful.", mustDo: true },
    ],
    travelAdvisory: {
      updatedFrom: "Rajasthan Tourism & Udaipur Municipal Travel Advisory",
      bestTimeToVisit: "October to March — comfortable 15–28°C, clear lakes, all cultural events active. Udaipur in winter morning mist over Lake Pichola is among Rajasthan's most beautiful sights.",
      peakSeason: "November – February. Mewar Festival (March, 3 days before Holi) features boat processions on the lake — the most photogenic event in Udaipur.",
      offSeason: "April – June: temperatures hit 42°C. July – September: monsoon fills the lakes and the countryside turns unexpectedly green — romantically atmospheric but some roads flood.",
      alerts: [
        { level: "caution", icon: "🏨", title: "Fake 'Lake View' Accommodations", detail: "Many guesthouses claim 'lake view' but deliver a distant glimpse of water between buildings. Always check photos from multiple sources (TripAdvisor, Google Maps satellite view) before booking. Ambrai, Haveli Braj Bhushanjee, and Jagat Niwas Palace are genuinely on the lake." },
        { level: "caution", icon: "🚣", title: "Boat Operators on Lake Pichola", detail: "Private boat operators sometimes offer rides 'to see Lake Palace' — entry to Lake Palace (Taj Hotel) is for guests only and costs ₹3,500 for a meal. The sunset RTDC boat (₹400, official) gives the best views of Lake Palace and Jag Mandir. Don't pay private operators more than ₹500 for a round trip." },
        { level: "info", icon: "🎭", title: "Mewar Festival (March)", detail: "Udaipur's most beautiful festival — celebrated just before Holi. Processions of women in traditional dress carry images of Gangaur (Goddess Parvati) to the lake in decorated boats. The ghats fill with music and lamps. If your dates allow, plan around this." },
        { level: "info", icon: "🌧️", title: "Monsoon Magic (July–Sep)", detail: "The Aravalli Hills surrounding Udaipur turn vivid green during monsoon. The lakes fill completely. While some roads to Ranakpur and Kumbhalgarh may be interrupted, Udaipur city itself is beautiful in the rain. Prices drop 30–40%." },
      ],
      dos: [
        "Take the RTDC sunset boat on Lake Pichola — best value way to photograph Lake Palace and City Palace",
        "Visit City Palace Museum's Crystal Gallery (additional ticket) — one of India's most unusual royal collections",
        "Walk the Gangaur Ghat and Lal Ghat area at sunrise — empty, golden, and the most 'real Udaipur'",
        "Eat at rooftop restaurants overlooking the lake — Ambrai Restaurant (by the lake, ground level) is the finest",
        "Attend the Bagore ki Haveli evening folk dance show (₹60) — the thali dance is extraordinary",
        "Take the 20km drive to Sajjangarh (Monsoon Palace) at sunset — views of Udaipur spread below",
        "Book heritage havelis early — rooms facing the lake are limited and book up fast in peak season",
      ],
      donts: [
        "Don't book any accommodation on a driver or auto-rickshaw's recommendation — they earn commissions",
        "Don't pay inflated prices at lake-facing tourist restaurants — walk one lane back for local prices at half the cost",
        "Don't swim or wade in Lake Pichola — water quality is poor and currents can be unexpectedly strong after monsoon",
        "Don't expect to negotiate at palace-turned-hotels — room rates are fixed; haggling is considered rude",
        "Don't miss checking road conditions if visiting Ranakpur or Kumbhalgarh during or after heavy monsoon",
      ],
      emergencyContacts: [
        { label: "Rajasthan Tourism Helpline", number: "1800-200-5000", icon: "📞" },
        { label: "Udaipur Police", number: "0294-2413500", icon: "🚔" },
        { label: "Ambulance", number: "108", icon: "🚑" },
        { label: "MB Hospital (Major)", number: "0294-2528811", icon: "🏥" },
        { label: "Women Helpline", number: "1090", icon: "🛡️" },
        { label: "Tourist Police, Udaipur", number: "0294-2411535", icon: "👮" },
      ],
      healthTips: [
        "Summer heat (April–June) is severe — hydrate constantly, wear a hat, and avoid outdoor activities 11am–5pm",
        "Udaipur's old city lanes are navigated on foot — wear comfortable flat shoes; cobblestones can be slippery after rain",
        "MB Government Hospital and Aravalli Hospital are the main medical facilities in Udaipur",
        "Rajasthani food is rich and oily — if you have digestive sensitivity, start with lighter dal-baati options",
        "Carry sunscreen (SPF 50+) even in winter — Rajasthan's thin air and low humidity means UV exposure is high",
      ],
      culturalNotes: [
        "Udaipur is the 'City of Lakes and Love' — very popular for destination weddings; the city has a romantic, unhurried pace",
        "The Mewar royal family's history is the context for everything in Udaipur — the rivalry with Mughal Emperor Akbar adds dramatic depth",
        "Dress modestly in temples — Udaipur has many active Hindu temples; shoes off, no leather items inside",
        "Women are advised to use Ola/Uber rather than autos at night — isolated lanes can be uncomfortable",
        "Photography of women in traditional dress requires consent — ask politely; most Rajasthani women appreciate the ask",
        "Mewari Rajasthani dialect is the local language but English and Hindi are widely spoken in tourist areas",
      ],
      moneyTips: [
        "ATMs available throughout Udaipur city; stock up before visiting Ranakpur or Kumbhalgarh as those areas have limited banking",
        "Heritage hotel prices are fixed and non-negotiable — book through their direct website for best rates",
        "Local restaurant prices: ₹150–300/meal (non-tourist lanes); Tourist restaurant prices: ₹400–800/meal for similar food",
        "RTDC boat (₹400) is better value than private boat operators (₹600–1,000) for lake views",
        "Mewar Utsav (March festival) period — accommodation prices spike 50%; book 2 months ahead",
      ],
    },
  },

  {
    destId: "rishikesh",
    fromCityToSight: "From Rishikesh Railway Station (or from Haridwar if coming by major train), the ghat area (Laxman Jhula / Swarg Ashram) is 5–7 km. Take a shared jeep (₹20/seat) to Ram Jhula area, or auto (₹80–₁50). Most ashrams and hostels are in the Laxman Jhula / Swarg Ashram zone — know your exact address before arriving.",
    firstThingsToDo: [
      "Rishikesh is strictly vegetarian and alcohol-free — accept this before arriving",
      "Book rafting for Day 2 immediately — seats fill up a day ahead in season",
      "Visit Ganga Aarti at Triveni Ghat (6:30pm) on your first evening",
      "Confirm your ashram/guesthouse has a lockable room safe for valuables",
      "Download offline map of Laxman Jhula area — lanes are complex",
    ],
    arrivalPoints: [
      {
        by: "Train",
        icon: "🚂",
        name: "Haridwar Junction (HW) — Best connected, 25 km from Rishikesh OR Rishikesh Station (RKSH) — limited trains",
        distanceFromCity: "Haridwar to Rishikesh: 25 km | Rishikesh station to ghats: 6 km",
        toAccommodation: [
          { step: 1, icon: "🚌", action: "From Haridwar station: Shared minivans to Rishikesh depart every 10 min from opposite main gate", cost: "₹30–₅0/seat shared van", duration: "45–60 min to Rishikesh", tip: "The shared vans (vikrams) are fast and frequent. They drop at Rishikesh bus stand — then take a shared jeep to Laxman Jhula (₹20) or auto (₹80)." },
          { step: 2, icon: "🛺", action: "From Rishikesh Bus Stand to Laxman Jhula / Ram Jhula: shared jeep or auto", cost: "₹20 shared / ₹80 auto", duration: "15–20 min", tip: "Most accommodation is in the Swarg Ashram / Laxman Jhula area — confirm which bridge you need. Ram Jhula and Laxman Jhula are 2 km apart." },
        ],
      },
      {
        by: "Road",
        icon: "🚗",
        name: "Rishikesh Bus Stand / Self-drive via NH-334 from Delhi",
        distanceFromCity: "Bus stand: 5 km from Laxman Jhula",
        toAccommodation: [
          { step: 1, icon: "🚌", action: "ISBT Delhi to Rishikesh: Volvo AC bus every 2h (₹300–₄50). Drop at Haridwar bypass or Rishikesh main bus stand.", cost: "₹300–₄50", duration: "6–7h", tip: "If driving: ample parking at Ram Jhula. The last 2 km into Laxman Jhula is very narrow — park at Ram Jhula and walk/take shared jeep." },
        ],
      },
    ],
    weatherSeasons: [
      {
        season: "Best Season — Rafting", months: "September – November, February – May", icon: "🌊",
        tempRange: "18°C – 35°C", feels: "Pleasant to warm",
        carry: ["Quick-dry clothes (you WILL get wet rafting)", "Rubber sandals or strapped shoes", "Sunscreen", "Modest cover-up for temples and ashrams", "Light jacket for early morning yoga"],
        warning: "Ganges water is cold year-round even when the air is warm. Rafting companies provide life jackets and helmets — don't raft without them regardless of what the operator says.",
        clothingAdvice: "Most important rule: dress very modestly. Rishikesh is a holy city — shorts above the knee, sleeveless tops, and beachwear are deeply inappropriate. Comfortable, modest clothing is essential to be treated respectfully."
      },
      {
        season: "Monsoon — Rafting Paused", months: "June – August", icon: "🌧️",
        tempRange: "25°C – 35°C", feels: "Hot and very humid",
        carry: ["Rain jacket", "Quick-dry clothes", "Waterproof sandals", "Mosquito repellent"],
        warning: "River rafting is shut during monsoon due to dangerous currents. The Ganges becomes unpredictably powerful. However, Rishikesh's yoga, meditation, and temple culture are entirely unaffected by rain — good time for a spiritual retreat.",
        clothingAdvice: "Quick-dry fabrics. Rain jacket is essential. The Ganges path floods in heavy downpours — waterproof footwear is practical."
      },
    ],
    cityHurdles: [
      { icon: "🛶", issue: "Fake UTDB-certified rafting operators", solution: "Only book rafting with operators certified by UTDB (Uttarakhand Tourism Development Board). Look for the green UTDB sticker on boats. Uncertified operators skip safety briefings, use old equipment, and are not insured. Ask to see certification — legitimate operators are proud to show it.", severity: "high" },
      { icon: "🙏", issue: "Fake sadhus asking for money near ghats", solution: "The orange-robed figure asking ₹200 for a blessing is rarely an actual sadhu. Authentic sadhus don't solicit tourists. Politely decline and walk on.", severity: "low" },
      { icon: "🌀", issue: "Yoga retreat scams — promising 'transformation' with expensive, low-quality courses", solution: "Check reviews on Tripadvisor and Airbnb Experiences for any yoga retreat or teacher training. Parmarth Niketan and Sivananda Ashram are decades-old legitimate institutions. New 'retreat centers' without verifiable track records should be researched carefully.", severity: "medium" },
    ],
    cityEssentials: {
      atm: "ATMs at Rishikesh main market and near Ram Jhula. Laxman Jhula area has 1 SBI ATM (often busy). Withdraw in Haridwar if coming from there — more reliable ATMs.",
      sim: "Airtel and Jio both work well in Rishikesh. BSNL for remote Himalayan treks. Buy in Haridwar or at Rishikesh main market.",
      wifi: "Most cafés at Laxman Jhula area offer free WiFi. Ashram WiFi is available but often restricted to certain hours. Good coverage in tourist zones.",
      medical: "AIIMS Rishikesh (excellent): 0135-2462900. General Hospital: 0135-2430179. Most common issues: rafting injuries, sunburn, stomach problems — all manageable locally.",
      language: "Hindi. Garhwali is local dialect. English very widely spoken in tourist and yoga areas — Rishikesh has decades of international visitor culture.",
      localEmergency: "Rishikesh Tourist Police: 0135-2431793 | Women Helpline: 1090 | Uttarakhand Emergency: 112",
      upi: "Widely accepted in cafes, restaurants, and shops around tourist zones. Some traditional ghats and boat services are cash-only. Carry ₹500–₁,000 daily.",
      powerOutlet: "Standard 230V, Type C/D. Power is generally stable in Rishikesh. Ashrams may have restricted hours. Carry power bank for long trekking days.",
    },
    localAttractions: [
      { name: "White-Water Rafting (Shivpuri to Rishikesh)", type: "Adventure Sport", distanceFromCenter: "16 km upstream", entryFee: "₹600–₁,200/person", timing: "8am – 2pm (last boat)", bestTime: "Morning", insiderTip: "Grade 3–4 rapids. The 'Three Blind Mice', 'Club House', and 'Return to Sender' rapids are genuinely thrilling. The 16 km section takes 2.5 hours. Wear old clothes you don't mind getting soaked — you WILL capsize at some point.", mustDo: true },
      { name: "Bungee Jumping at Jumping Heights", type: "Adventure (83m — India's highest)", distanceFromCenter: "20 km from Rishikesh", entryFee: "₹3,550/person", timing: "8:30am – 5pm, book in advance", bestTime: "Morning (cooler)", insiderTip: "India's highest fixed-platform bungee. Also flying fox and giant swing available. Book on jumpingheights.com — they fill up 2–3 days ahead on weekends. Weight limit: 45–110 kg.", mustDo: false },
      { name: "Beatles Ashram (Maharishi Mahesh Yogi Ashram)", type: "Heritage Attraction", distanceFromCenter: "Swarg Ashram area", entryFee: "₹150 Indians / ₹600 foreigners", timing: "9am – 5pm", bestTime: "Morning", insiderTip: "The abandoned ashram where The Beatles wrote White Album songs in 1968. Now covered in extraordinary street art and reclaimed by jungle. The meditation caves where John, Paul, George, and Ringo sat are preserved. Deeply atmospheric.", mustDo: true },
      { name: "Ganga Aarti, Triveni Ghat", type: "Evening Prayer Ceremony", distanceFromCenter: "Rishikesh main area", entryFee: "Free", timing: "6:30pm (winter) / 7pm (summer)", bestTime: "Arrive 6pm for best spot", insiderTip: "Smaller and more intimate than Varanasi's version, but equally moving. Priests swing large fire urns to conch shells and bells while devotees release flower lamps (diyas) onto the river. Sit close to the ghats rather than watching from a distance.", mustDo: true },
    ],
    travelAdvisory: {
      updatedFrom: "Uttarakhand Tourism & Rishikesh Municipal Advisory",
      bestTimeToVisit: "September to November — post-monsoon, river in best rafting condition, clear skies for trekking, temperatures 20–30°C. February to May is also excellent before the summer crowds.",
      peakSeason: "March – May and September – November. International Yoga Festival (1st week of March) draws 2,000+ practitioners — transformative but accommodation books out months ahead.",
      offSeason: "June – August: monsoon. River rafting is suspended (river too dangerous). Some trekking trails flood. But the Garhwal hills are spectacularly green and misty. July–August: reduced tourists, 30–40% lower prices.",
      alerts: [
        { level: "warning", icon: "🌊", title: "Ganga River Currents — Extremely Dangerous", detail: "The Ganga at Rishikesh has powerful, unpredictable currents. Multiple tourist drownings occur every year. Only swim at designated bathing ghats (Triveni Ghat, Ram Jhula area). NEVER enter the river during or after monsoon (July–September) — the current is lethal even for strong swimmers." },
        { level: "warning", icon: "🪂", title: "Adventure Sports Safety — Verify Operators", detail: "Rishikesh is India's adventure capital — bungee, rafting, zip-line, camping. Accident rates are high with unlicensed operators. Only use operators approved by the Uttarakhand Tourism Development Board. Ask to see their government license certificate before booking any activity." },
        { level: "caution", icon: "🍖", title: "Rishikesh is Alcohol & Meat Free", detail: "Rishikesh is officially vegetarian and alcohol-free by municipal order. No non-vegetarian food or alcohol is served anywhere in Rishikesh. This is a deeply religious city and the prohibition is strictly followed. For both, you need to travel to Haridwar or Dehradun." },
        { level: "info", icon: "🧘", title: "Yoga & Ashram Etiquette", detail: "Many ashrams offer free or nominal-cost yoga and meditation classes. Laxman Jhula area has 100+ yoga schools of varying quality. For serious practice, research the teacher's lineage and certification. Drop-in classes: ₹200–500. Residential programs: 200-hour courses start ₹25,000." },
      ],
      dos: [
        "White-water raft the Class III–IV rapids (Shivpuri to Rishikesh) — the 16 km stretch is world-class",
        "Attend the Ganga Aarti at Triveni Ghat every evening — arrive by 6pm for front ghats",
        "Cross Laxman Jhula and Ram Jhula on foot — the suspension bridges over the Ganga are Rishikesh's icons",
        "Try a yoga class even if not a practitioner — Rishikesh has the world's most experienced teachers",
        "Trek to Neelkanth Mahadev Temple (22 km round trip, 1,330m altitude) for the full Garhwal landscape experience",
        "Camp at Shivpuri beach (12 km from Rishikesh) — river-side camping under a sky full of stars",
        "Eat at cafes near Laxman Jhula — Rishikesh has India's best variety of healthy, organic, and international vegetarian food",
      ],
      donts: [
        "Don't swim in the Ganga outside designated bathing ghats — the current is dangerously deceptive",
        "Don't book adventure activities with unlicensed operators — ask for Uttarakhand Tourism Board certification",
        "Don't bring alcohol, meat, or eggs into Rishikesh — it is strictly prohibited",
        "Don't visit in peak monsoon for river activities — white-water rafting is cancelled July–August due to flood risk",
        "Don't dress immodestly on the ghats or near ashrams — cover shoulders and wear full-length bottoms",
        "Don't disrupt meditation or yoga sessions by talking or using phones — spiritual practices are active, not performative",
      ],
      emergencyContacts: [
        { label: "Uttarakhand Tourism Helpline", number: "1364", icon: "📞" },
        { label: "Police", number: "100 / 112", icon: "🚔" },
        { label: "AIIMS Rishikesh (Excellent)", number: "0135-2462900", icon: "🏥" },
        { label: "Ambulance", number: "108", icon: "🚑" },
        { label: "Garhwal Mandal Rescue", number: "0135-2743308", icon: "⛑️" },
        { label: "Women Helpline", number: "1090", icon: "🛡️" },
      ],
      healthTips: [
        "AIIMS Rishikesh is one of India's best government hospitals — fortunately, it's right here; major trauma cases are well covered",
        "Altitude is moderate (356m) — no AMS risk, but if trekking to higher peaks (Neelkanth 1,330m+), start early and carry water",
        "River activities mean sun exposure for hours — waterproof SPF 50+ and UV-protective water shoes are essential",
        "Rishikesh tap water is Himalayan spring fed and among India's cleanest, but boil or filter if you have a sensitive stomach",
        "Carry basic first-aid for trekking — antiseptic, bandages, and a compression bandage for twisted ankles on mountain trails",
        "Yoga and meditation retreats often involve dietary changes — communicate allergies and health conditions to ashram staff",
      ],
      culturalNotes: [
        "Rishikesh is the 'Yoga Capital of the World' — a title earned; The Beatles' stay at Maharishi Ashram in 1968 put it on the global map",
        "The city is deeply Shaivite (Shiva-worshipping) — the whole city follows Shiva's principles including vegetarianism",
        "Greeting people with 'Om Namah Shivaya' or 'Jai Gange Ma' at ghats is warmly received",
        "Ashrams have specific rules: wake-up times, meal times, silence periods — respect them completely",
        "The Beatles Ashram (Chaurasi Kutia) is now open to visitors (₹150 entry) — the meditation domes and psychedelic murals are extraordinary",
        "Kavad Yatra (July–August): millions of Shiva devotees carrying Ganga water — the city becomes incredibly crowded and spiritually intense",
      ],
      moneyTips: [
        "ATMs available near Laxman Jhula and Ram Jhula; less common in the ashram-heavy areas",
        "Yoga classes: ₹200–500 drop-in; 200-hour teacher training ₹25,000–60,000 (4 weeks, includes accommodation and meals)",
        "White-water rafting: ₹600–800/person (16 km, Shivpuri to Rishikesh) with a licensed operator including safety equipment",
        "Bungee jumping (Jumping Heights): ₹3,550 — India's highest fixed bungee at 83m; book online at jumpinheights.com",
        "Accommodation: ashrams offer dormitories from ₹200/night; riverside resorts from ₹4,000/night",
      ],
    },
  },

  {
    destId: "darjeeling",
    fromCityToSight: "From NJP station or Bagdogra Airport: cab/jeep (90 km, 2.5–3.5h mountain drive depending on traffic). From Siliguri (10 km from NJP): shared jeep to Darjeeling from Siliguri bus stand (₹200/seat, 3.5h). Toy Train from NJP to Darjeeling: 7h (scenic but slow — for enthusiasts).",
    firstThingsToDo: [
      "Book Tiger Hill cab for next morning (₹700 shared, ₹1,200 private) through your hotel today",
      "Check if the mountains are clear — ask hotel staff about tomorrow's forecast",
      "Book Toy Train joyride (2h) through IRCTC or station counter — sells out",
      "Get warm layer ready — temperature drops sharply at sunset",
      "Buy authentic first-flush Darjeeling tea directly from Happy Valley Estate (not tourist shops)",
    ],
    arrivalPoints: [
      {
        by: "Flight",
        icon: "✈️",
        name: "Bagdogra Airport (IXB) — Siliguri, 90 km from Darjeeling",
        distanceFromCity: "90 km and 2.5–3h mountain drive",
        toAccommodation: [
          { step: 1, icon: "🚗", action: "Prepaid taxi counter inside arrivals — government fixed rate for Darjeeling", cost: "₹2,000–₂,500 for private cab", duration: "2.5–3.5h", tip: "Share the cab if you can find fellow Darjeeling-bound passengers — standard practice, saves ₹1,000 per person." },
          { step: 2, icon: "🚌", action: "Or: take a cab to Siliguri bus stand (₹400, 20 min), then shared jeep to Darjeeling (₹200/seat, 3.5h)", cost: "₹600 total via bus stand route", duration: "4h total", tip: "Shared jeep is the authentic way to arrive. The 78 km mountain road from Siliguri is beautiful — sit on the right side for valley views." },
        ],
      },
      {
        by: "Train",
        icon: "🚂",
        name: "New Jalpaiguri (NJP) Station — 80 km from Darjeeling",
        distanceFromCity: "80 km, 3–4h mountain journey",
        toAccommodation: [
          { step: 1, icon: "🚌", action: "Shared jeep from outside NJP station — line up on the left side (Darjeeling-bound queue)", cost: "₹200–₂50/seat", duration: "3.5–4h to Darjeeling", tip: "The shared jeeps from NJP leave when full (usually within 20–30 min). Super scenic. You'll see tea estates, waterfalls, and mountain switchbacks." },
          { step: 2, icon: "🎟️", action: "Toy Train alternative: NJP to Darjeeling Toy Train (UNESCO DHR) — beautiful but 7h", cost: "₹300–₁,500 depending on class", duration: "7h", tip: "The Toy Train was built in 1881. It stops at several small stations including Ghum (India's highest railway station, 2,258m). Best booked for the journey up rather than down — you see the view better going up." },
        ],
      },
    ],
    weatherSeasons: [
      {
        season: "Spring — Best Visibility", months: "March – May", icon: "🌸",
        tempRange: "10°C – 22°C", feels: "Cool and clear — rhododendrons blooming",
        carry: ["Medium-weight jacket (fleece)", "Thermal layer for early mornings", "Rain jacket (afternoon showers in April–May)", "Sunscreen", "Camera — visibility for Kangchenjunga is best now"],
        warning: "April–May afternoons have pre-monsoon showers. Mornings are crystal clear. For Tiger Hill, the March–April sunrise is the most reliable for Kangchenjunga visibility.",
        clothingAdvice: "Layer system: thermal + fleece + light jacket. The 4am Tiger Hill trip is the coldest moment — dress as if it's winter."
      },
      {
        season: "Peak Season — Post-Monsoon", months: "October – November", icon: "🍂",
        tempRange: "8°C – 18°C", feels: "Crisp and clear — best Kangchenjunga views",
        carry: ["Down jacket", "Woollen hat and gloves", "Thermal innerwear", "Warm socks", "Sunscreen"],
        warning: "October nights drop to 5–8°C. The 4am Tiger Hill excursion requires a proper down jacket, woollen hat, and gloves. Many visitors are underprepared and miserable in the cold. Do not underestimate it.",
        clothingAdvice: "This is hill station cold — not Himalayan extreme cold but genuinely chilly. Pack as you would for a European autumn."
      },
      {
        season: "Monsoon — Avoid for Views", months: "June – September", icon: "🌧️",
        tempRange: "14°C – 20°C", feels: "Lush green, constant rain, no mountain views",
        carry: ["Heavy waterproof jacket", "Waterproof shoes", "Umbrella"],
        warning: "Landslides on the Siliguri–Darjeeling road are common in monsoon. Check road status before departing. Tiger Hill views are 95% blocked by clouds. Go only for the green landscape and tea estate experience, not mountains.",
        clothingAdvice: "Full waterproofs mandatory. Pack dry clothes in sealed bags."
      },
    ],
    cityHurdles: [
      { icon: "🌤️", issue: "Cloud cover blocking Tiger Hill views — a real possibility", solution: "There is no guarantee of clear mountain views. The best months are March–May and October–November. Even then, clouds can cover Kangchenjunga. If your first morning is cloudy, ask your hotel if a second morning is worth trying — sometimes Day 2 is clearer.", severity: "medium" },
      { icon: "🚗", issue: "Steep mountain roads causing motion sickness", solution: "Take Avomine or Scopoderm tablets 1 hour before the mountain drive from Siliguri if you're prone to motion sickness. The 80 km mountain road has 200+ curves. Sit at the front of the jeep and keep window slightly open.", severity: "medium" },
      { icon: "🎟️", issue: "Toy Train sold out / cancelled without warning", solution: "Book Toy Train at irctc.co.in at least 15 days in advance. Always confirm with Darjeeling station the day before — track issues or diesel shortages cause cancellations. Hotel staff know the train's daily status.", severity: "low" },
    ],
    cityEssentials: {
      atm: "SBI and Axis Bank ATMs near Chowrasta and at the main market. Functional and reliable in peak season. Carry extra cash — ATMs can run low on busy days.",
      sim: "Airtel and Jio work well in Darjeeling town. Signal drops on Tiger Hill route at 4am (no issue — you don't need signal there). BSNL for trekking to Sandakphu.",
      wifi: "Most hotels and cafes (Glenary's, Joey's) have WiFi. Reliable in town center. Take offline maps for remote tea estate areas.",
      medical: "Planters' Hospital (Darjeeling): 0354-2252404. Sadar Hospital (Govt): 0354-2252024. Cold-related issues are most common — hypothermia risk is real for underprepared Tiger Hill visitors.",
      language: "Nepali is widely spoken. Hindi and Bengali also understood. English is widely used — Darjeeling has a long missionary school tradition and very high English literacy.",
      localEmergency: "Darjeeling Police: 0354-2252263 | Women Helpline WB: 181 | Emergency: 112",
      upi: "Widely accepted in town. Tea estates and remote areas prefer cash. Carry ₹1,000–₂,000 small notes.",
      powerOutlet: "230V Type C/D. Scheduled power cuts happen. Most hotels have backup. Cold drains batteries faster than usual — carry power bank.",
    },
    localAttractions: [
      { name: "Tiger Hill Sunrise", type: "Sunrise Viewpoint", distanceFromCenter: "13 km from Darjeeling", entryFee: "₹100 viewpoint (car entry)", timing: "Depart 4am, sunrise 5:30–6am", bestTime: "October–November and March–April for best visibility", insiderTip: "The viewing platform has a 'sunrise hut' with hot tea (₹40). Get inside early — outside, the wind at Tiger Hill at 4:30am in October is biting cold. On the clearest days, you see Everest's peak to the west of Kangchenjunga — bring binoculars.", mustDo: true },
      { name: "Happy Valley Tea Estate", type: "Working Tea Estate", distanceFromCenter: "3 km from Chowrasta", entryFee: "₹100 factory tour", timing: "8am – 4pm, closed Sundays and Monday mornings", bestTime: "Morning (factory processing active)", insiderTip: "The 1854 estate still uses original tea-processing machines. You'll see withering, rolling, fermentation, and firing of leaves. Buy directly from the estate shop — prices are fair and tea is 100% authentic Darjeeling, not tourist-grade blends.", mustDo: true },
      { name: "Batasia Loop", type: "Toy Train Landmark", distanceFromCenter: "5 km from Darjeeling", entryFee: "₹30 + Toy Train ticket", timing: "All day", bestTime: "When Toy Train passes (check schedule)", insiderTip: "The loop was built in 1919 so the Toy Train could descend the steep hill without brakes. The garden around it has a war memorial. On a clear day, Kangchenjunga frames the train as it completes the spiral — one of India's most photogenic shots.", mustDo: false },
      { name: "Glenburn Tea Estate", type: "Heritage Stay — Hidden Gem", distanceFromCenter: "20 km from Darjeeling", entryFee: "₹15,000–₂0,000/night (stay)", timing: "2-day minimum", bestTime: "March–May or October", insiderTip: "Not cheap, but extraordinary. Working 1860s tea estate with colonial bungalow, private waterfall, and 3,000m altitude views. You pluck your own tea in the morning, which the estate processes and gives you to take home. Buchanan River walk through estate is magical.", mustDo: false },
    ],
    travelAdvisory: {
      updatedFrom: "West Bengal Tourism & Darjeeling District Administration",
      bestTimeToVisit: "October to November and March to May — the two clear-sky windows. Kangchenjunga (world's 3rd highest peak) is visible from Darjeeling on clear days in these windows. October mornings are particularly stunning.",
      peakSeason: "April – May and October. Darjeeling Tea Festival (April — first flush harvest) is a special time to visit. Tiger Hill sunrise viewings are booked out in peak season.",
      offSeason: "June – September: heavy monsoon, frequent landslides, road closures, and Tiger Hill sunrise is clouds only. The hills are lush and beautiful but mobility is severely restricted. The Toy Train is frequently suspended.",
      alerts: [
        { level: "warning", icon: "⛰️", title: "Landslides During Monsoon (June–Sep)", detail: "The Siliguri–Darjeeling mountain road (NH10 and alternative routes) is subject to severe landslides during monsoon. Roads can be closed for days. If traveling June–September, check the West Bengal government's road advisory at wbtourism.gov.in before departure. Keep 1–2 extra days' buffer in your itinerary." },
        { level: "caution", icon: "🚂", title: "Toy Train — Book Early", detail: "Darjeeling Himalayan Railway (UNESCO World Heritage) joy rides sell out completely in peak season. Book online at irctc.co.in or at NJP station on arrival. The Ghum–Darjeeling service (1 hour) is the most popular. Cancellation due to landslides and track damage is common in monsoon." },
        { level: "caution", icon: "🌡️", title: "Temperature Drops Sharply After Sunset", detail: "Darjeeling averages 7–10°C at night in December–January and 0–3°C at Tiger Hill at 4am. Even in April, Tiger Hill at 4:30am is biting cold. Bring a genuine warm jacket, thermal layers, and gloves — not just a light sweater." },
        { level: "info", icon: "🍵", title: "Authentic Darjeeling Tea — Buying Guide", detail: "Only 87 tea gardens in Darjeeling can produce authentic 'Darjeeling Tea'. Anything sold outside certified estates or the Tea Board auction is likely blended. First-flush (March–April) and second-flush (May–June) are the most sought-after. Buy directly from Happy Valley, Makaibari, or Glenburn estates." },
      ],
      dos: [
        "Depart for Tiger Hill by 4am — the drive is 13 km and the sunrise at 5:30am waits for no one",
        "Buy tea directly from Happy Valley Estate (3 km walk from Chowrasta) — ask to see the flush date certificate",
        "Ride the Toy Train (joy ride) from Darjeeling to Ghum — even 1 hour captures the UNESCO experience",
        "Walk the Batasia Loop when the Toy Train passes — one of India's most photographed moments",
        "Hire a driver from the Darjeeling Taxi Stand for Tiger Hill — the stand has fixed rates and verified drivers",
        "Visit Japanese Peace Pagoda for the finest Kangchenjunga panorama without the Tiger Hill crowds",
        "Pack warm layers even in May — 2,134m altitude means temperatures fall sharply after dark",
      ],
      donts: [
        "Don't buy Darjeeling tea from tourist shops or market stalls — most are blended, not single-estate",
        "Don't drive to Darjeeling without checking landslide advisories during or after monsoon",
        "Don't book a Tiger Hill taxi the night before in peak season — they book out; arrange 2–3 days ahead",
        "Don't trek alone on forest trails during monsoon — leech infestation and slippery paths are hazardous",
        "Don't rely on ATMs on Christmas and New Year — queues are hours long; withdraw cash in Siliguri before ascending",
        "Don't underestimate the cold at Tiger Hill at 4:30am — hypothermia risk with inadequate clothing is real",
      ],
      emergencyContacts: [
        { label: "West Bengal Tourism Helpline", number: "1800-345-5555", icon: "📞" },
        { label: "Darjeeling Police", number: "0354-2252430", icon: "🚔" },
        { label: "Ambulance", number: "102 / 108", icon: "🚑" },
        { label: "Darjeeling District Hospital", number: "0354-2254218", icon: "🏥" },
        { label: "STNM Hospital Sikkim (Nearest Major)", number: "03592-202073", icon: "🏥" },
        { label: "Mountain Rescue (SDMA)", number: "0354-2257450", icon: "⛑️" },
      ],
      healthTips: [
        "Altitude of 2,134m is comfortable for most — mild headache on day 1 is normal; drink extra water",
        "Cold air at Tiger Hill (pre-dawn) can trigger asthma or respiratory issues — carry inhalers if susceptible",
        "Leech socks are essential for forest walks during and after monsoon — leeches are harmless but disconcerting",
        "Darjeeling's water supply is treated — safe for brushing teeth; bottled water for drinking is safer",
        "Warm, freshly cooked momos and thukpa (noodle soup) are Darjeeling's best cold-weather foods and are safe and nutritious",
        "Hospital facilities are basic in Darjeeling — serious cases go to Siliguri (2.5h below) or to Kolkata",
      ],
      culturalNotes: [
        "Darjeeling's population is predominantly Nepali-speaking Gorkha — a distinct community proud of their identity",
        "Gorkhaland political sentiment is present — if political discussions come up, listen respectfully and don't take sides",
        "Buddhist gompas (Yiga Choeling at Ghum, the oldest in Darjeeling) welcome visitors — shoes off, clockwise walk",
        "Tenzing Norgay's legacy is everywhere — the first man to summit Everest was from Darjeeling; the Himalayan Mountaineering Institute has a museum",
        "Darjeeling cuisine is distinct: momos, thukpa, gyatuk (thicker noodle soup), and chhurpi (hard cheese) are authentic local foods",
        "Morning fog over the tea gardens is part of Darjeeling's magic — schedule a slow morning to sit and watch it lift",
      ],
      moneyTips: [
        "ATMs available at Chowrasta and Club Side area; withdraw before peak season weekends when ATMs run dry",
        "Tea prices at estate: First-flush Darjeeling ₹800–3,000/100g depending on grade; tourist shops charge 3× for inferior quality",
        "Toy Train joy ride: ₹1,280 (AC chair car, 1 hour); book at irctc.co.in — sells out fast in peak season",
        "Tiger Hill taxi (round trip, pre-dawn): ₹800–1,000 from Darjeeling town; fixed rate from taxi stand",
        "Accommodation: Budget guesthouses ₹800–1,500; Heritage tea estate bungalows ₹8,000–20,000/night",
      ],
    },
  },

  {
    destId: "khajuraho",
    fromCityToSight: "From Khajuraho Airport: cab to Western Temple Group is only 7 km (₹150). From Jhansi (nearest major station, 175 km): cab directly to Khajuraho (₹2,500, 3h) — no public transport option is practical. The temple complex is walkable once in town — Western, Eastern, and Southern groups are within 3 km of each other.",
    firstThingsToDo: [
      "Visit Western Temple Group at sunrise — opens 6am, best light and no crowds",
      "Book Sound & Light Show at Western Group for your first evening (6:30pm, ₹200)",
      "Hire an ASI-approved guide from inside the temple entrance (₹400) — essential context",
      "Book Panna Tiger Reserve online for Day 2 morning safari",
      "Small town — withdraw cash at Khajuraho town ATM, not near temples",
    ],
    arrivalPoints: [
      {
        by: "Flight",
        icon: "✈️",
        name: "Khajuraho Airport (HJR) — Small airport, direct Delhi flights",
        distanceFromCity: "7 km from Western Temple Group",
        toAccommodation: [
          { step: 1, icon: "🚗", action: "Very small airport — taxis wait outside. Agree on price: ₹150–₂00 to temple area hotels", cost: "₹150–₂00", duration: "10–15 min", tip: "Khajuraho airport is tiny. Your hotel can arrange pickup if notified — often free for mid-range and above. Call ahead if your flight lands at odd hours (some arrive 11pm)." },
        ],
      },
      {
        by: "Train",
        icon: "🚂",
        name: "Khajuraho Railway Station (limited trains) OR Jhansi Junction (JHS) — 175 km",
        distanceFromCity: "Khajuraho station: 3 km from temples. Jhansi: 175 km, 3h by cab.",
        toAccommodation: [
          { step: 1, icon: "🚗", action: "From Jhansi: Book a full cab to Khajuraho (₹2,500 one-way or ₹4,500 Jhansi–Khajuraho–Jhansi round trip). No direct public transport.", cost: "₹2,500 cab from Jhansi", duration: "3–3.5h via Chhatarpur", tip: "The Jhansi–Khajuraho route passes through Orchha (75 km from Jhansi) — a gorgeous medieval cenotaph town. Stop for 2 hours and add it to your itinerary at no significant extra cost." },
          { step: 2, icon: "🚲", action: "From Khajuraho station: Cycle rickshaw or auto to temple zone", cost: "₹50–₁00 rickshaw", duration: "10 min", tip: "Khajuraho is very compact. Once at the Western Group hotels, a bicycle (₹100/day) is the perfect way to visit all three temple groups." },
        ],
      },
    ],
    weatherSeasons: [
      {
        season: "Best Season", months: "October – March", icon: "🌞",
        tempRange: "10°C – 28°C", feels: "Pleasant, clear, perfect for sightseeing",
        carry: ["Light jacket for evenings", "Comfortable walking shoes — cobblestone paths", "Sunscreen", "Water bottle (no vendors inside temple complex)", "Scarf for temple modesty requirements"],
        warning: "February hosts the famous Khajuraho Dance Festival — accommodation books out 2–3 months ahead. Check festival dates and book early if you want to combine.",
        clothingAdvice: "Modest clothing required at temples (no shorts, covered shoulders). The light-coloured sandstone temples photograph beautifully in golden morning light — plan accordingly."
      },
      {
        season: "Summer", months: "April – June", icon: "🔥",
        tempRange: "38°C – 46°C", feels: "Extreme heat",
        carry: ["Maximum-coverage light cotton", "SPF 50+ sunscreen", "Large water bottle", "ORS sachets"],
        warning: "Khajuraho in summer is very harsh. The sandstone temple complex has no shade. Visit before 8am, leave by 10am, return after 5pm only.",
        clothingAdvice: "Light cotton full coverage. The temples require it anyway — practical and appropriate."
      },
    ],
    cityHurdles: [
      { icon: "🎭", issue: "Fake guides offering 'inside knowledge' of the erotic sculptures", solution: "Only hire guides from the official ASI counter inside the Western Group entrance. They have ID cards and fixed rates (₹400 for 1–4 people). Street guides outside are unvetted and often fabricate stories for tips.", severity: "medium" },
      { icon: "🏨", issue: "Very limited accommodation — small town with few options", solution: "Book your Khajuraho hotel AT LEAST 2 weeks ahead in Oct–Feb. The town has fewer than 20 proper hotels and they fill up during festival season. Budget travelers: Hotel Harmony is reliable and central.", severity: "medium" },
    ],
    cityEssentials: {
      atm: "1–2 ATMs in Khajuraho main market. Withdraw what you need — these ATMs can be out of service. Withdraw backup cash in Jhansi or Bhopal before arriving.",
      sim: "Airtel and Jio work in Khajuraho town and temple area. Signal drops toward Panna forest area — download offline maps.",
      wifi: "Major hotels have WiFi. Small guesthouses may not. Download offline maps and content in Jhansi/Bhopal before arriving.",
      medical: "District Hospital Chhatarpur (40 km): 07682-242080. Khajuraho has a small clinic — for anything serious, Chhatarpur or Bhopal is necessary. Travel insurance is essential.",
      language: "Hindi. Very little English in local shops and restaurants — but all temple staff and hotel reception speak functional English.",
      localEmergency: "Khajuraho Police: 07686-274058 | MP Tourist Helpline: 0755-2774318 | Emergency: 112",
      upi: "Works at main hotels and some restaurants. Most small eateries, rickshaws, and market stalls are cash-only. Carry ₹1,000–₁,500 in cash daily.",
      powerOutlet: "230V Type C/D. Power cuts are somewhat common in this area. Carry a power bank.",
    },
    localAttractions: [
      { name: "Western Temple Group (UNESCO)", type: "10th Century Temple Complex", distanceFromCenter: "Is the center", entryFee: "₹50 Indians / ₹600 foreigners", timing: "Sunrise – sunset", bestTime: "6–9am sunrise and 4–6pm golden hour", insiderTip: "The erotic carvings cover only 10% of the total sculpture — the other 90% depicts daily life, celestial beings, warriors, and elephants with extraordinary detail. The Kandariya Mahadeva temple spire (30m) was built without cement — only interlocking stone. Extraordinary 11th-century engineering.", mustDo: true },
      { name: "Panna Tiger Reserve Safari", type: "Wildlife Safari", distanceFromCenter: "45 km from Khajuraho", entryFee: "₹1,200–₁,500/person jeep share + ₹200 guide", timing: "Morning: 6–10am | Afternoon: 3–6pm", bestTime: "October–March (best wildlife sighting)", insiderTip: "Panna was delisted from tiger reserves in 2009 after all tigers were poached, then restocked through a pioneering relocation program. Today it has 70+ tigers. Ken River runs through the reserve — river safaris by boat are also available and extraordinary for gharials and vultures.", mustDo: true },
      { name: "Raneh Falls", type: "Natural Canyon", distanceFromCenter: "20 km from Khajuraho", entryFee: "₹100 + vehicle fee", timing: "8am – 5pm", bestTime: "October–February (best water)", insiderTip: "The Ken River has cut a 5 km gorge through pink and grey granite, creating a series of waterfalls. Completely different from the temples — a dramatic natural landscape. Hire the forest dept boat for a gorge float (₹200) — it's surreal.", mustDo: false },
      { name: "Orchha — Cenotaphs and Fortress", type: "Medieval Town — Off Beat", distanceFromCenter: "170 km via Jhansi", entryFee: "₹250 combined ticket", timing: "All day", bestTime: "Morning and late afternoon", insiderTip: "Orchha is often passed through on the Jhansi–Khajuraho drive. Stop for 2–3 hours. The 16th-century Betwa River island palace and 14 royal chhatri (cenotaphs) are beautiful and rarely crowded. One of Madhya Pradesh's best-kept secrets.", mustDo: false },
    ],
    travelAdvisory: {
      updatedFrom: "Madhya Pradesh Tourism & ASI Temple Management",
      bestTimeToVisit: "October to March — comfortable 15–28°C, all temples open, clear skies for photography. Golden hour at 6am and 5pm on the temple carvings is spectacular.",
      peakSeason: "November – February. Khajuraho Dance Festival (February/March) is held against the Western Temple backdrop — classical Indian dance forms like Kathak, Bharatanatyam, and Odissi are performed for 1 week. Book accommodation 2 months ahead for this period.",
      offSeason: "April – June: searing heat (44–47°C). Temples are open but midday visiting is physically gruelling. July – September: rain, fewer crowds, green landscape around temples.",
      alerts: [
        { level: "warning", icon: "🌡️", title: "Extreme Summer Heat (Apr–Jun)", detail: "Khajuraho temperatures exceed 45°C in May–June. The open temple complex provides little shade. Visit only between 6–9am and 4–6pm. Carry 2L water, wear a wide-brim hat, and plan to rest indoors during midday." },
        { level: "caution", icon: "🦁", title: "Panna Tiger Reserve — Safari Safety", detail: "Panna has 70+ tigers (significantly restored from 0 in 2009). Follow all forest department instructions exactly. Do not stand up in the jeep, make noise, or eat inside the park. Tigers have approached vehicles. Morning safaris have significantly higher sighting probability than afternoon." },
        { level: "caution", icon: "🎭", title: "Temple Photography — Respect Rules", detail: "The Western Group temples are active worship sites, not only tourist monuments. Photography of devotees during prayer, of the sanctum interiors during aarti, and of close-up explicit carvings in disrespectful poses is frowned upon. ASI guides will advise you on appropriate photography." },
        { level: "info", icon: "💃", title: "Khajuraho Dance Festival (Feb/March)", detail: "A week-long classical dance festival held against the illuminated Western Temple backdrop. Among India's most visually stunning cultural events. Tickets at ₹500–2,500 depending on seating. Book at mptourism.com well in advance — events sell out." },
      ],
      dos: [
        "Visit the Western Temple Group at 6am sharp when it opens — extraordinary light and zero crowds",
        "Hire a certified ASI guide (₹600–800) — the temple's historical and erotic symbolism context is transformative",
        "Buy the combined Madhya Pradesh Heritage ticket (₹50 Indians) — covers Western, Eastern, and Southern temple groups",
        "Take the Sound & Light Show at Western Temples (₹250) — excellent English narration, beautifully lit",
        "Visit Panna Tiger Reserve safari in the morning slot (6–10am) — highest tiger sighting probability",
        "Explore Raneh Falls (20 km) for dramatic granite canyon scenery — completely different from the temples",
        "Stop at Orchha on the Jhansi–Khajuraho route — 2 hours there is worth the detour",
      ],
      donts: [
        "Don't visit midday April–June — 45°C in open temple grounds with no shade is dangerous",
        "Don't bring leather items into the temple premises — many temples prohibit leather as a religious rule",
        "Don't photograph temple priests or worshippers without asking — the temples are living shrines",
        "Don't skip the guide — without context, the 1,000-year-old carvings are just stone; with it, they're extraordinary stories",
        "Don't attempt to visit Panna Tiger Reserve without a registered guide — self-entry is not permitted",
        "Don't rush Khajuraho in 2–3 hours — the three temple groups and town deserve a full day minimum",
      ],
      emergencyContacts: [
        { label: "MP Tourism Helpline", number: "1800-233-1300", icon: "📞" },
        { label: "Khajuraho Police", number: "07686-274051", icon: "🚔" },
        { label: "Ambulance", number: "108", icon: "🚑" },
        { label: "Chhatarpur District Hospital", number: "07682-242027", icon: "🏥" },
        { label: "Panna Tiger Reserve Office", number: "07732-252135", icon: "🐯" },
        { label: "Women Helpline", number: "1090", icon: "🛡️" },
      ],
      healthTips: [
        "Summer heat exhaustion is the primary health risk — ORS packets, electrolytes, and 3L+ water daily are essential April–June",
        "The nearest quality hospital is in Chhatarpur (45 km) or Satna (120 km) — carry a basic first-aid kit",
        "Khajuraho is a small town with limited pharmacies — carry any prescription medication from home",
        "Jungle safaris in Panna expose you to insects and thorny vegetation — wear full sleeves, trousers, and insect repellent",
        "Stomach upsets can occur with street food — Khajuraho town has limited health infrastructure so be cautious with roadside eating",
        "Sun protection is critical at the open temple complex — reapply sunscreen every 90 minutes in summer",
      ],
      culturalNotes: [
        "The erotic carvings represent only 10% of Khajuraho's sculpture — they depict Kama (desire) as one of the four aims of human life (Purusharthas) in Hindu philosophy, not pornography",
        "The temples were built by the Chandela dynasty between 950–1050 CE — a golden age of Central Indian art",
        "Khajuraho Dance Festival celebrates the living tradition of classical Indian dance forms that the temple carvings themselves depict",
        "The town itself is small and quiet — the contrast between the world-famous temples and the rural surroundings is striking",
        "Remove footwear before entering all temple sanctuaries — some require it even for the outer courtyard",
        "Photography is allowed in all temple areas but not inside the garbhagriha (inner sanctum) during active worship",
      ],
      moneyTips: [
        "Khajuraho has limited ATMs — SBI and Bank of India branches; withdraw extra before arriving from Jhansi or Satna",
        "Temple entry: ₹50 for Indians (Western Group); buy the combined Madhya Pradesh Heritage ticket for multiple sites",
        "Panna Tiger Reserve: ₹1,200–1,500/person jeep share + ₹200 mandatory guide — 2 sharing = ₹2,200 each total",
        "Sound & Light Show: ₹250 English show at 7:30pm — worth every rupee for the historical narrative",
        "Accommodation: limited in Khajuraho; book Radisson (decent midrange) or Lalit Temple View (best in class) early in peak season",
      ],
    },
  },
];

export function getJourneyGuide(destId: string): JourneyGuide | undefined {
  return JOURNEY_GUIDES.find(g => g.destId === destId);
}
