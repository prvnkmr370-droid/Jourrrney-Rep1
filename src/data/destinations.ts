export type SafetyLevel = "Very Safe" | "Safe" | "Moderate" | "Exercise Caution";
export type BudgetTier = "budget" | "mid" | "luxury";

export interface Transport {
  mode: string;
  icon: string;
  fromDelhi: string;
  fromMumbai: string;
  fromBangalore: string;
  duration: string;
  costRange: string;
  tips: string;
}

export interface AccommodationVenue {
  name: string;
  location?: string; // where it is, if known (e.g. "Aberdeen Bazaar, Sri Vijaya Puram")
  mapsQuery: string; // used to build a "get directions" Google Maps link
}

export interface Accommodation {
  type: string;
  priceRange: string;
  examples: string[];
  description: string;
  // Optional richer per-venue data (real names + a maps link) sourced from
  // an official tourism site. Left undefined for destinations that don't
  // have this yet — `examples` above still renders on its own in that
  // case. See StayTab.tsx.
  venues?: AccommodationVenue[];
  // Where `venues` came from, and any caveat about it (e.g. no official
  // rates published) — shown under the venue list in the UI.
  sourceNote?: string;
}

export interface LocalTransport {
  mode: string;
  cost: string;
  notes: string;
  available: boolean;
}

export interface NearbyPlace {
  name: string;
  distance: string;
  type: string;
  isHidden: boolean;
  // Optional — only set where a real, verified photo of that specific
  // place was sourced. Left undefined elsewhere rather than backfilled
  // with a generic/mismatched stand-in photo; the image-card grid in
  // OverviewTab.tsx falls back to a plain icon card when this is absent.
  image?: string;
}

export interface BudgetBreakdown {
  tier: BudgetTier;
  label: string;
  perDayPerPerson: number;
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
}

export interface ItineraryDay {
  day: number;
  title: string;
  morning: string;
  afternoon: string;
  evening: string;
  stay: string;
  meals: string;
  tips: string;
}

export interface WomenSafety {
  score: number; // out of 10
  level: SafetyLevel;
  highlights: string[];
  precautions: string[];
  soloTips: string[];
  emergencyContacts: { label: string; number: string }[];
  safeZones: string[];
  avoidAreas: string[];
}

export interface Destination {
  id: string;
  name: string;
  state: string;
  tagline: string;
  description: string;
  image: string;
  heroImage: string;
  category: string[];
  bestSeason: string;
  duration: string;
  highlights: string[];
  transport: Transport[];
  accommodation: Accommodation[];
  localTransport: LocalTransport[];
  nearbyPlaces: NearbyPlace[];
  budgetBreakdown: BudgetBreakdown[];
  defaultItinerary: ItineraryDay[];
  womenSafety: WomenSafety;
  rating: number;
  reviews: number;
  mustEat: string[];
  packingTips: string[];
}

export const DESTINATIONS: Destination[] = [
  {
    id: "agra",
    name: "Agra",
    state: "Uttar Pradesh",
    tagline: "Home of the Eternal Taj",
    description: "Agra is home to one of the Seven Wonders of the World — the magnificent Taj Mahal. Beyond the ivory marble mausoleum, explore Mughal-era forts, bazaars full of marble inlay work, and the rich culinary legacy of Awadhi cuisine.",
    image: "https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=600&h=400&fit=crop&auto=format",
    heroImage: "https://images.unsplash.com/photo-1587135941948-670b381f08ce?w=900&h=600&fit=crop&auto=format",
    category: ["Heritage", "UNESCO", "History"],
    bestSeason: "October – March",
    duration: "2–3 days",
    highlights: ["Taj Mahal at sunrise", "Agra Fort", "Fatehpur Sikri", "Mehtab Bagh moonrise view", "Kinari Bazaar"],
    transport: [
      { mode: "Train", icon: "🚂", fromDelhi: "Gatimaan Express – 1h 40m", fromMumbai: "Mumbai–Agra Express – 22h", fromBangalore: "Via Delhi – 30h+", duration: "1.5–3h from Delhi", costRange: "₹200–₹1,500", tips: "Gatimaan Express is fastest; book 60+ days in advance on IRCTC." },
      { mode: "Road", icon: "🚗", fromDelhi: "Yamuna Expressway – 3–4h", fromMumbai: "NH-48 – 22h", fromBangalore: "—", duration: "3–4h from Delhi", costRange: "₹800–₹2,500 cab / ₹200 bus", tips: "Yamuna Expressway toll is ₹315 one-way. Avoid weekends — heavy traffic." },
      { mode: "Flight", icon: "✈️", fromDelhi: "No direct flights – Kheria airport limited", fromMumbai: "Delhi then train", fromBangalore: "Delhi then train", duration: "N/A (train preferred)", costRange: "—", tips: "Fly into Delhi or Lucknow, then take the Gatimaan Express to Agra." },
    ],
    accommodation: [
      { type: "Budget Guesthouses", priceRange: "₹500–₹1,500/night", examples: ["Hotel Kamal", "Zostel Agra", "Hotel Safari"], description: "Clean rooms near Taj East Gate; great rooftop views." },
      { type: "Mid-Range Hotels", priceRange: "₹2,500–₹6,000/night", examples: ["Coral Court Boutique", "Hotel Amar Vilas", "Mansingh Palace"], description: "Air-conditioned rooms with breakfast; closer to Taj and Fort." },
      { type: "Luxury Resorts", priceRange: "₹15,000–₹80,000/night", examples: ["Oberoi Amarvilas", "ITC Mughal", "The Taj Hotel & Convention Centre"], description: "World-class stays with Taj views from your room." },
    ],
    localTransport: [
      { mode: "Auto Rickshaw", cost: "₹30–₹200", notes: "Negotiate before boarding; common for short trips", available: true },
      { mode: "E-Rickshaw", cost: "₹10–₹50", notes: "Eco-friendly, good for Taj Ganj area", available: true },
      { mode: "Cycle Rickshaw", cost: "₹20–₹100", notes: "Ideal within old city lanes", available: true },
      { mode: "App Cab (Ola/Uber)", cost: "₹150–₹600", notes: "Available but surge on weekends", available: true },
      { mode: "Bus (City)", cost: "₹10–₹30", notes: "Limited routes; not tourist-friendly", available: true },
      { mode: "Tonga (Horse Cart)", cost: "₹100–₹300", notes: "Unique heritage experience", available: true },
    ],
    nearbyPlaces: [
      { name: "Fatehpur Sikri", distance: "40 km", type: "UNESCO Heritage", isHidden: false, image: "https://images.unsplash.com/photo-1736959453077-c6bfb10a60cd?w=400&h=400&fit=crop&auto=format" },
      { name: "Mathura & Vrindavan", distance: "58 km", type: "Spiritual", isHidden: false, image: "https://images.unsplash.com/photo-1652448642708-ddefcedbc1ff?w=400&h=400&fit=crop&auto=format" },
      { name: "Bharatpur Bird Sanctuary", distance: "56 km", type: "Wildlife", isHidden: false },
      { name: "Bateshwar Temple Complex", distance: "70 km", type: "Hidden Gem", isHidden: true },
      { name: "Keetham Lake (Sur Sarovar)", distance: "20 km", type: "Nature", isHidden: true },
      { name: "Ram Bagh (Aram Bagh)", distance: "3 km", type: "Hidden Garden", isHidden: true },
    ],
    budgetBreakdown: [
      { tier: "budget", label: "Backpacker", perDayPerPerson: 1200, accommodation: 600, food: 300, transport: 150, activities: 150 },
      { tier: "mid", label: "Comfortable", perDayPerPerson: 4000, accommodation: 2200, food: 900, transport: 400, activities: 500 },
      { tier: "luxury", label: "Premium", perDayPerPerson: 22000, accommodation: 17000, food: 2500, transport: 1500, activities: 1000 },
    ],
    defaultItinerary: [
      { day: 1, title: "Taj Mahal & Agra Fort", morning: "Reach Taj Mahal before sunrise (gates open 6am) — the marble glows gold at dawn. Book tickets online (₹1,100 for foreigners, ₹50 for Indians).", afternoon: "Visit Agra Fort — the Red Fort complex with Diwan-i-Am, Diwan-i-Khas, and Musamman Burj where Shah Jahan was imprisoned.", evening: "Stroll Kinari Bazaar for marble souvenirs. Dinner at Pinch of Spice for Mughlai cuisine.", stay: "Hotel near Taj East Gate", meals: "Street petha (₹50), Mughlai dinner (₹400–₹800)", tips: "Keep Agra Fort ticket — gives slight discount on other monuments." },
      { day: 2, title: "Fatehpur Sikri & Mehtab Bagh", morning: "Drive 40 km to Fatehpur Sikri — Akbar's ghost capital, beautifully preserved. Allow 3 hours.", afternoon: "Return to Agra. Visit Itimad-ud-Daulah (Baby Taj) — fewer crowds, equally stunning marble inlay.", evening: "Mehtab Bagh at sunset — the garden across the Yamuna gives the best Taj silhouette view without the entry fee.", stay: "Same hotel", meals: "Local thali lunch (₹120), rooftop dinner (₹600)", tips: "Hire a government-approved guide at Fatehpur Sikri for ₹400." },
      { day: 3, title: "Mathura–Vrindavan Day Trip", morning: "Drive to Mathura (58 km) — birthplace of Lord Krishna. Visit Shri Krishna Janmabhoomi temple.", afternoon: "Vrindavan — explore ISKCON temple and Banke Bihari temple.", evening: "Return to Agra. Shopping for petha (sweet) to carry home.", stay: "Check out", meals: "Vegetarian prasad meals (₹80–₹200)", tips: "No leather items in Mathura–Vrindavan temples. Dress modestly." },
    ],
    womenSafety: {
      score: 6,
      level: "Moderate",
      highlights: ["Well-policed tourist zones around Taj", "Licensed female guides available", "Tourist police hotline active"],
      precautions: ["Avoid dark lanes in Taj Ganj after 9pm", "Don't accept unsolicited guides", "Use app cabs rather than standalone autos at night"],
      soloTips: ["Stay in tourist-area guesthouses (Taj East Gate side)", "Join a group tour for Fatehpur Sikri", "Carry a whistle and fully charged phone", "Inform your guesthouse of daily plans"],
      emergencyContacts: [{ label: "Tourist Police Agra", number: "0562-2421204" }, { label: "Women Helpline", number: "1091" }, { label: "Police", number: "100" }],
      safeZones: ["Taj Mahal complex", "Sadar Bazaar", "Hotels on MG Road"],
      avoidAreas: ["Isolated ghats after dark", "Unnamed lanes in old city after 9pm"],
    },
    rating: 4.8,
    reviews: 12400,
    mustEat: ["Agra Petha (Panchhi Petha shop)", "Mughlai Biryani", "Dalmoth", "Bedhai & Jalebi breakfast", "Parantha at Deviram"],
    packingTips: ["Light cotton clothes (hot summers)", "Scarf for temple/mosque visits", "Comfortable walking shoes", "Sunscreen & sunglasses", "Cash — many small vendors"],
  },

  {
    id: "jaipur",
    name: "Jaipur",
    state: "Rajasthan",
    tagline: "The Pink City of Palaces",
    description: "Jaipur, the Pink City, is a riot of color, heritage, and bazaars. Opulent palaces, towering forts, and bustling markets make it the crown jewel of Rajasthan. The city thrums with the legacy of the Kachwaha Rajputs and the vibrant energy of modern India.",
    image: "https://images.unsplash.com/photo-1695395550316-8995ae9d35ff?w=600&h=400&fit=crop&auto=format",
    heroImage: "https://images.unsplash.com/photo-1757237367150-3c134720f075?w=900&h=600&fit=crop&auto=format",
    category: ["Heritage", "Culture", "Shopping"],
    bestSeason: "October – February",
    duration: "3–4 days",
    highlights: ["Amber Fort", "Hawa Mahal", "City Palace", "Jantar Mantar", "Johari Bazaar"],
    transport: [
      { mode: "Train", icon: "🚂", fromDelhi: "Shatabdi / Double Decker – 4.5h", fromMumbai: "Mumbai–Jaipur Express – 18h", fromBangalore: "Via Delhi – 28h", duration: "4.5–6h from Delhi", costRange: "₹300–₹1,800", tips: "Jaipur Junction is well-connected. Book Shatabdi for comfort." },
      { mode: "Road", icon: "🚗", fromDelhi: "NH-48 / NH-248 – 5–6h", fromMumbai: "NH-48 – 20h", fromBangalore: "—", duration: "5–6h from Delhi", costRange: "₹1,000–₹3,500 cab / ₹400 RSRTC bus", tips: "RSRTC Volvo buses are comfortable and affordable (₹400–₹600)." },
      { mode: "Flight", icon: "✈️", fromDelhi: "1h flight – Jaipur International Airport", fromMumbai: "2h direct", fromBangalore: "2.5h direct", duration: "1–2.5h", costRange: "₹2,500–₹8,000", tips: "Jaipur Airport is 12 km from city. Pre-paid taxi: ₹400–₹600." },
    ],
    accommodation: [
      { type: "Heritage Havelis (Budget)", priceRange: "₹800–₹2,000/night", examples: ["Zostel Jaipur", "Moustache Hostel", "Hotel Pearl Palace"], description: "Charming old-city havelis with rooftop restaurants and cultural events." },
      { type: "Boutique Hotels", priceRange: "₹3,000–₹8,000/night", examples: ["Narain Niwas Palace", "Shahpura House", "Alsisar Haveli"], description: "Converted palaces with antique decor, heritage ambiance." },
      { type: "Palace Hotels", priceRange: "₹18,000–₹1,00,000/night", examples: ["Rambagh Palace (Taj)", "Samode Palace", "Jai Mahal Palace"], description: "Live like royalty — former royal residences with polo grounds and spa." },
    ],
    localTransport: [
      { mode: "Auto Rickshaw", cost: "₹50–₹300", notes: "Meter rarely used; negotiate", available: true },
      { mode: "App Cab (Ola/Uber)", cost: "₹150–₹800", notes: "Most reliable in Jaipur", available: true },
      { mode: "City Bus (JCTSL)", cost: "₹10–₹40", notes: "Good routes to major sights", available: true },
      { mode: "Cycle Rickshaw", cost: "₹50–₹150", notes: "Best for walled city exploration", available: true },
      { mode: "Rental Bicycle/Scooter", cost: "₹200–₹600/day", notes: "Available at many hostels", available: true },
      { mode: "Heritage Walk (on foot)", cost: "Free – ₹500 guided", notes: "Best for walled city lanes", available: true },
    ],
    nearbyPlaces: [
      { name: "Amber Fort", distance: "11 km", type: "Heritage", isHidden: false },
      { name: "Nahargarh Fort", distance: "15 km", type: "Heritage", isHidden: false },
      { name: "Abhaneri Step Well (Chand Baori)", distance: "95 km", type: "Hidden Gem", isHidden: true },
      { name: "Samode Village", distance: "42 km", type: "Off-beat Village", isHidden: true },
      { name: "Pushkar", distance: "145 km", type: "Spiritual", isHidden: false },
      { name: "Bhangarh Fort", distance: "83 km", type: "Mysterious Ruins", isHidden: true },
    ],
    budgetBreakdown: [
      { tier: "budget", label: "Backpacker", perDayPerPerson: 1500, accommodation: 700, food: 400, transport: 200, activities: 200 },
      { tier: "mid", label: "Comfortable", perDayPerPerson: 5000, accommodation: 3000, food: 1000, transport: 500, activities: 500 },
      { tier: "luxury", label: "Royal Experience", perDayPerPerson: 30000, accommodation: 25000, food: 3000, transport: 1000, activities: 1000 },
    ],
    defaultItinerary: [
      { day: 1, title: "Walled City & Markets", morning: "Hawa Mahal at sunrise — facade is best seen from outside. Then City Palace complex (2–3 hours, ₹700 entry).", afternoon: "Jantar Mantar astronomical observatory. Johari Bazaar for gemstones and textiles.", evening: "Rooftop dinner at Peacock Rooftop Restaurant with Hawa Mahal view.", stay: "Haveli in walled city", meals: "Dal Baati Churma lunch (₹150), rooftop dinner (₹600)", tips: "Book City Palace entry tickets online to skip queues." },
      { day: 2, title: "Amber Fort & Nahargarh", morning: "Amber Fort (11 km out) — take a jeep up (₹200) or walk. Allow 3 hours for the full complex.", afternoon: "Jaigarh Fort — connected walk from Amber, houses Asia's largest wheeled cannon.", evening: "Nahargarh Fort at sunset — panoramic city views. Sunset Terrace bar inside the fort.", stay: "Same hotel", meals: "Street kachoris (₹30), thali dinner (₹300)", tips: "Combined ticket for Amber + Jaigarh + Nahargarh saves ₹200." },
      { day: 3, title: "Chand Baori Day Trip", morning: "Drive 95 km to Abhaneri — the stunning 10-century stepwell (Chand Baori) used in The Dark Knight Rises.", afternoon: "Harshat Mata temple adjacent. Return via Fatehpur Sikri route.", evening: "Bapu Bazaar for block-print textiles and blue pottery shopping.", stay: "Same hotel", meals: "Roadside dhaba lunch (₹120), Rajasthani thali (₹350)", tips: "Chand Baori has no entry fee and very few tourists — go early." },
    ],
    womenSafety: {
      score: 7,
      level: "Safe",
      highlights: ["Tourist police present at all major monuments", "Women-only compartments on trains", "Well-lit heritage zones", "Active Women Helpline"],
      precautions: ["Stay in established tourist zones", "Dress conservatively in temples and old city", "Avoid poorly lit areas after 10pm"],
      soloTips: ["Stay in hostels on MI Road or near Badi Chaupar — central and busy", "Join heritage walks (safe, guided)", "Restaurant culture is very tourist-friendly for solo women", "Local women are generally helpful for directions"],
      emergencyContacts: [{ label: "Women Helpline Rajasthan", number: "181" }, { label: "Tourist Police Jaipur", number: "0141-2744988" }, { label: "Police", number: "100" }],
      safeZones: ["MI Road area", "C-Scheme", "Walled City daytime", "Hotel zones"],
      avoidAreas: ["Isolated areas of Nahargarh after sunset alone", "Unfamiliar old-city lanes past 9pm"],
    },
    rating: 4.7,
    reviews: 18900,
    mustEat: ["Dal Baati Churma", "Pyaaz Kachori (Rawat Misthan Bhandar)", "Laal Maas", "Ghevar (sweet)", "Kulfi Faluda at MI Road"],
    packingTips: ["Light cotton (summer)", "Shawl for temple visits", "Comfortable walking shoes (cobblestone lanes)", "Reusable water bottle", "Small backpack for market days"],
  },

  {
    id: "kerala",
    name: "Kerala Backwaters",
    state: "Kerala",
    tagline: "God's Own Country",
    description: "Kerala's backwaters are a network of interconnected canals, lakes, and lagoons running parallel to the Arabian Sea coast. Drift through emerald-green landscapes on a houseboat, watching village life glide past in slow motion — one of India's most soul-restoring experiences.",
    image: "https://images.unsplash.com/photo-1661174607003-d9d36388c916?w=600&h=400&fit=crop&auto=format",
    heroImage: "https://images.unsplash.com/photo-1506461883276-594a12b11cf3?w=900&h=600&fit=crop&auto=format",
    category: ["Nature", "Wellness", "Culture"],
    bestSeason: "September – March",
    duration: "5–7 days",
    highlights: ["Houseboat in Alleppey", "Vembanad Lake", "Kumarakom Bird Sanctuary", "Kochi Fort area", "Ayurvedic treatments"],
    transport: [
      { mode: "Flight", icon: "✈️", fromDelhi: "3h direct to Kochi", fromMumbai: "2h direct to Kochi", fromBangalore: "1.5h to Kochi", duration: "1.5–3h to Kochi", costRange: "₹3,000–₹12,000", tips: "Kochi (COK) is the main hub. Trivandrum and Calicut are alternatives." },
      { mode: "Train", icon: "🚂", fromDelhi: "Kerala Express – 44h", fromMumbai: "Netravati Express – 26h", fromBangalore: "Island Express – 12h", duration: "12–44h", costRange: "₹400–₹2,500", tips: "Book sleeper or 3AC for long routes. Alleppey (Alappuzha) station for backwaters." },
      { mode: "Road", icon: "🚗", fromDelhi: "Not practical – 2,400 km", fromMumbai: "20+ hours via NH-66", fromBangalore: "7–8h via NH-275", duration: "7–8h from Bangalore", costRange: "₹1,500–₹4,000 cab", tips: "From Bangalore, cab via Mysore–Waynad is scenic but takes 8–9h." },
    ],
    accommodation: [
      { type: "Houseboat (Kettuvallam)", priceRange: "₹5,000–₹25,000/night", examples: ["Alleppey Houseboat Club", "TripBoat Kerala", "CGH Earth Emerald Isle"], description: "The quintessential Kerala experience — floating bedroom with meals included." },
      { type: "Homestays", priceRange: "₹1,200–₹3,500/night", examples: ["Kovilakam Heritage", "Green Gates Homestay", "Abad Whispering Palms"], description: "Family-run homestays with home-cooked Kerala meals." },
      { type: "Heritage Resorts", priceRange: "₹8,000–₹35,000/night", examples: ["CGH Earth Coconut Lagoon", "Kumarakom Lake Resort", "Taj Kumarakom"], description: "Luxury waterfront resorts with Ayurvedic spa and backwater views." },
    ],
    localTransport: [
      { mode: "Houseboat", cost: "₹5,000–₹25,000/day", notes: "Best way to experience backwaters; includes meals", available: true },
      { mode: "Shikara (small boat)", cost: "₹300–₹800/hour", notes: "For shorter backwater trips and village visits", available: true },
      { mode: "Ferry (SWTD)", cost: "₹8–₹30", notes: "Public ferries connect towns — very authentic", available: true },
      { mode: "Auto Rickshaw", cost: "₹50–₹300", notes: "Available in towns like Alleppey and Kottayam", available: true },
      { mode: "App Cab", cost: "₹200–₹600", notes: "Limited in rural areas; good in Kochi", available: true },
      { mode: "Cycle Rental", cost: "₹100–₹200/day", notes: "Best for exploring Alleppey canal town", available: true },
    ],
    nearbyPlaces: [
      { name: "Kochi (Fort Kochi)", distance: "55 km from Alleppey", type: "Heritage Port City", isHidden: false },
      { name: "Munnar Tea Estates", distance: "130 km", type: "Nature", isHidden: false },
      { name: "Periyar Wildlife Sanctuary", distance: "190 km", type: "Wildlife", isHidden: false },
      { name: "Pathiramanal Island", distance: "12 km", type: "Hidden Bird Sanctuary", isHidden: true },
      { name: "Kuttanad (Rice Bowl of Kerala)", distance: "30 km", type: "Off-beat Farming Land", isHidden: true },
      { name: "Marari Beach", distance: "14 km", type: "Secluded Beach", isHidden: true },
    ],
    budgetBreakdown: [
      { tier: "budget", label: "Backpacker", perDayPerPerson: 1800, accommodation: 800, food: 500, transport: 300, activities: 200 },
      { tier: "mid", label: "Comfortable", perDayPerPerson: 6000, accommodation: 3500, food: 1200, transport: 800, activities: 500 },
      { tier: "luxury", label: "Premium", perDayPerPerson: 20000, accommodation: 15000, food: 3000, transport: 1500, activities: 500 },
    ],
    defaultItinerary: [
      { day: 1, title: "Arrive Kochi – Fort Kochi Exploration", morning: "Arrive Kochi. Explore Fort Kochi — Chinese Fishing Nets, Mattancherry Palace, Jewish Synagogue.", afternoon: "Spice Market at Mattancherry. Kerala cuisine lunch at Oceanos.", evening: "Kathakali or Kalaripayattu performance at Kerala Kathakali Centre (₹350).", stay: "Fort Kochi Heritage Guesthouse", meals: "Kerala fish curry lunch (₹250), seafood dinner (₹500)", tips: "Walk Fort Kochi — it's compact and best explored on foot." },
      { day: 2, title: "Drive to Alleppey – Board Houseboat", morning: "Drive 1.5h to Alleppey (Alappuzha). Check into houseboat by 12 noon.", afternoon: "Drift through Vembanad Lake and narrow village canals. Watch toddy-tappers, farmers, and village life.", evening: "Sunset over the lake from your houseboat deck. Fresh Kerala seafood dinner cooked on board.", stay: "Houseboat on backwaters", meals: "All meals included on houseboat (Kerala thali)", tips: "Avoid monsoon months for houseboat (June–August can be rough)." },
      { day: 3, title: "Kumarakom & Bird Sanctuary", morning: "Early morning shikara ride through narrow canals to Kumarakom Bird Sanctuary.", afternoon: "Ayurvedic massage at a certified center (Panchakarma treatment, ₹1,500–₹3,000).", evening: "Explore Alleppey lighthouse and beach. Fresh coconut water (₹20).", stay: "Backwater homestay", meals: "Appam & stew breakfast, prawn curry lunch, Kerala rice dinner", tips: "Book Ayurvedic centers certified by Kerala Tourism for authentic treatments." },
    ],
    womenSafety: {
      score: 8,
      level: "Very Safe",
      highlights: ["Kerala consistently ranks among India's safest states for women", "High literacy means respectful culture", "Tourist police active in all districts", "Women auto-rickshaw drivers available in Kochi"],
      precautions: ["Use licensed houseboat operators only (check Kerala Tourism certification)", "Inform houseboat operator of your return plans", "Modest dress in temples"],
      soloTips: ["Kerala is one of the best states in India for solo women travel", "Homestays are particularly safe — family environment", "Join houseboat group tours if solo — cost-effective and social", "Local women readily help with directions and guidance"],
      emergencyContacts: [{ label: "Kerala Women Helpline", number: "1091" }, { label: "Tourist Police Kerala", number: "0484-2722721" }, { label: "Pink Police Patrol (Kochi)", number: "0484-2395100" }],
      safeZones: ["Fort Kochi", "Alleppey town center", "All certified resorts and homestays"],
      avoidAreas: ["Isolated canal banks after dark", "Remote ferry ghats at night alone"],
    },
    rating: 4.9,
    reviews: 22000,
    mustEat: ["Kerala Fish Curry with Red Rice", "Appam & Stew", "Karimeen Pollichathu (Pearl Spot Fish)", "Puttu & Kadala Curry", "Kerala Prawn Biryani"],
    packingTips: ["Light cotton/linen (humid climate)", "Rain jacket or poncho", "Mosquito repellent", "Waterproof sandals", "Modest clothing for temples"],
  },

  {
    id: "goa",
    name: "Goa",
    state: "Goa",
    tagline: "Sun, Sand & Portuguese Soul",
    description: "Goa is India's smallest state and its most vibrant beach destination. Portuguese colonial architecture, white-sand beaches, spiced seafood, and a laid-back culture make it irresistible. From silent sunset beaches to pulsing nightlife, Goa rewrites every traveller's mood.",
    image: "https://images.unsplash.com/photo-1642922835816-e2ac68db5c42?w=600&h=400&fit=crop&auto=format",
    heroImage: "https://images.unsplash.com/photo-1605015239078-95f963a8b35c?w=900&h=600&fit=crop&auto=format",
    category: ["Beach", "Nightlife", "Heritage"],
    bestSeason: "November – March",
    duration: "4–7 days",
    highlights: ["Baga & Anjuna Beach (North)", "Palolem Beach (South)", "Old Goa Basilica", "Dudhsagar Falls", "Saturday Night Market"],
    transport: [
      { mode: "Flight", icon: "✈️", fromDelhi: "2.5h direct to Dabolim/Mopa", fromMumbai: "1h direct", fromBangalore: "1h direct", duration: "1–2.5h", costRange: "₹2,500–₹10,000", tips: "Goa has two airports: Dabolim (South Goa) and Mopa (North Goa). Choose based on where you stay." },
      { mode: "Train", icon: "🚂", fromDelhi: "Rajdhani / Goa Express – 24–27h", fromMumbai: "Konkan Railway – 10–12h", fromBangalore: "Vasco Express – 15h", duration: "10–27h", costRange: "₹400–₹2,000", tips: "Konkan Railway from Mumbai is scenic — book well in advance (60 days)." },
      { mode: "Road", icon: "🚗", fromDelhi: "Not practical – 1,900 km", fromMumbai: "NH-66 – 9–10h", fromBangalore: "NH-748 – 8–9h", duration: "8–10h from Mumbai/Bangalore", costRange: "₹2,000–₹5,000", tips: "Mumbai–Goa road via Pune is fastest. NH-66 coastal route is more scenic." },
    ],
    accommodation: [
      { type: "Beach Shacks / Budget", priceRange: "₹600–₹2,000/night", examples: ["Zostel Goa", "Jungle Joe", "Hilltop Hostel"], description: "Beachfront shacks and hostels — social atmosphere, steps from the water." },
      { type: "Mid-Range Resorts", priceRange: "₹3,500–₹9,000/night", examples: ["Lemon Tree Amarante", "Cidade de Goa", "Park Hyatt Goa"], description: "Pool-facing rooms with beach access; popular with families." },
      { type: "Luxury Villas", priceRange: "₹12,000–₹80,000/night", examples: ["W Goa", "The Lalit Golf Resort", "Taj Holiday Village"], description: "Private pool villas, spa, and world-class beach access." },
    ],
    localTransport: [
      { mode: "Scooter Rental", cost: "₹300–₹600/day", notes: "Most popular — freedom to explore beaches; need valid license", available: true },
      { mode: "Bike Rental (Royal Enfield)", cost: "₹700–₹1,200/day", notes: "Great for North–South Goa runs", available: true },
      { mode: "App Cab (Ola/Goa Miles)", cost: "₹200–₹800", notes: "Goa Miles is the local app", available: true },
      { mode: "Local Bus (Kadamba)", cost: "₹10–₹50", notes: "Connects major towns; infrequent", available: true },
      { mode: "Taxi (Pilot)", cost: "₹400–₹1,500", notes: "Fixed-rate metered taxis; widely available", available: true },
      { mode: "Bicycle", cost: "₹100–₹200/day", notes: "For flat North Goa beaches only", available: true },
    ],
    nearbyPlaces: [
      { name: "Dudhsagar Falls", distance: "60 km", type: "Waterfall", isHidden: false },
      { name: "Arambol Beach", distance: "52 km", type: "Off-beat Hippie Beach", isHidden: true },
      { name: "Divar Island", distance: "10 km", type: "Secluded Island Village", isHidden: true },
      { name: "Chapora Fort", distance: "22 km", type: "Heritage Fort", isHidden: false },
      { name: "Bhagwan Mahavir Wildlife Sanctuary", distance: "53 km", type: "Wildlife", isHidden: false },
      { name: "Cabo de Rama Fort", distance: "70 km", type: "Hidden Heritage", isHidden: true },
    ],
    budgetBreakdown: [
      { tier: "budget", label: "Backpacker", perDayPerPerson: 1500, accommodation: 600, food: 500, transport: 300, activities: 100 },
      { tier: "mid", label: "Comfortable", perDayPerPerson: 5500, accommodation: 3500, food: 1200, transport: 500, activities: 300 },
      { tier: "luxury", label: "Villa Life", perDayPerPerson: 20000, accommodation: 15000, food: 3500, transport: 1000, activities: 500 },
    ],
    defaultItinerary: [
      { day: 1, title: "North Goa – Beaches & Basilica", morning: "Old Goa — Basilica of Bom Jesus (St. Francis Xavier's relics), Se Cathedral. 2 hours.", afternoon: "Anjuna Flea Market (Wednesdays only) or Baga Beach. Water sports: parasailing, jet ski.", evening: "Tito's Lane, Baga. Sunset at Vagator cliff with views of Chapora Fort.", stay: "Hostel/shack near Anjuna", meals: "Prawn curry rice (₹200), beach shack seafood dinner (₹500)", tips: "Haggle at Anjuna Flea Market — price usually drops to 40% of first ask." },
      { day: 2, title: "South Goa – Palolem & Serenity", morning: "Drive 60 km south to Palolem Beach — crescent-shaped, calm, stunning.", afternoon: "Kayaking through mangroves (₹500/2h). Colomb Bay and Patnem Beach walk.", evening: "Silent Noise headphone party at Palolem (seasonal). Beachside bonfire dinner.", stay: "Beach hut at Palolem", meals: "Goan fish thali (₹180), seafood BBQ dinner (₹600)", tips: "South Goa beaches are calmer and better for families and solo women." },
      { day: 3, title: "Dudhsagar Falls Day Trip", morning: "Jeep safari from Colem to Dudhsagar Falls (₹3,500/jeep, shared 6 people). 2h drive through Bhagwan Mahavir Wildlife Sanctuary.", afternoon: "Swim in the pool at the waterfall base. Return by 4pm.", evening: "Saturday Night Market (Arpora) — shopping, live music, food trucks.", stay: "Same hotel", meals: "Packed lunch for falls, market food evening (₹400)", tips: "Falls are best July–January; check road access status before booking." },
    ],
    womenSafety: {
      score: 7,
      level: "Safe",
      highlights: ["International tourist presence creates safer culture", "Beach shacks have security", "Active tourist police", "Well-lit popular beach areas"],
      precautions: ["Avoid isolated stretches of beach after dark", "Keep valuables in hotel safe", "Be cautious with drinks at parties", "North Goa nightlife areas — stay in groups"],
      soloTips: ["South Goa (Palolem, Agonda) is more peaceful and safer for solo women", "Rent a scooter for daytime freedom", "Stay in women-friendly hostels like Zostel", "Join day tours for Dudhsagar and spice plantations"],
      emergencyContacts: [{ label: "Goa Police", number: "100" }, { label: "Tourist Police Goa", number: "0832-2423400" }, { label: "Women Helpline", number: "1091" }],
      safeZones: ["Palolem Beach area", "Anjuna during day", "Hotel and resort zones"],
      avoidAreas: ["Isolated beaches after dark alone", "Unknown parties without friends"],
    },
    rating: 4.6,
    reviews: 28500,
    mustEat: ["Prawn Balchão", "Goan Fish Curry with Red Rice", "Bebinca (layered dessert)", "Feni (cashew spirit)", "Choriz Pão (chorizo bread)"],
    packingTips: ["Swimwear & beach cover-ups", "Sunscreen SPF 50+", "Light summer clothes", "Rain jacket (if Nov)", "Waterproof phone case"],
  },

  {
    id: "ladakh",
    name: "Ladakh",
    state: "Ladakh (UT)",
    tagline: "The Land of High Passes",
    description: "Ladakh is India's roof — a high-altitude desert of surreal landscapes, ancient Buddhist monasteries perched on cliff faces, glassy lakes reflecting snow peaks, and a sparse tranquility that resets the soul. One of the last great wilderness frontiers on earth.",
    image: "https://images.unsplash.com/photo-1760835251791-1fda687de791?w=600&h=400&fit=crop&auto=format",
    heroImage: "https://images.unsplash.com/photo-1592450620607-efefef574bd0?w=900&h=600&fit=crop&auto=format",
    category: ["Adventure", "Nature", "Spiritual"],
    bestSeason: "June – September",
    duration: "7–10 days",
    highlights: ["Pangong Tso Lake", "Nubra Valley & Bactrian Camels", "Khardung La Pass", "Thiksey Monastery", "Magnetic Hill"],
    transport: [
      { mode: "Flight", icon: "✈️", fromDelhi: "1.5h direct to Leh (Kushok Bakula Airport)", fromMumbai: "Via Delhi – 3.5h total", fromBangalore: "Via Delhi – 4h", duration: "1.5h from Delhi", costRange: "₹4,000–₹18,000", tips: "Always acclimatize 24–48h before any activity after flying to Leh (11,500 ft). Take it easy the first day." },
      { mode: "Road (Manali–Leh)", icon: "🚗", fromDelhi: "Via Manali – 2 days (480 km from Manali)", fromMumbai: "—", fromBangalore: "—", duration: "2 days via Manali Highway (seasonal – June–Oct)", costRange: "₹2,500 shared jeep / ₹8,000–₹15,000 private", tips: "Manali–Leh Highway closes Oct–May due to snow. Most scenic road trip in India." },
      { mode: "Road (Srinagar–Leh)", icon: "🚗", fromDelhi: "Via Srinagar – 434 km, 1–2 days", fromMumbai: "—", fromBangalore: "—", duration: "1–2 days (seasonal)", costRange: "₹2,000–₹12,000", tips: "Srinagar–Leh via NH-1 is slightly less dramatic than Manali route but equally beautiful." },
    ],
    accommodation: [
      { type: "Guest Houses & Homestays", priceRange: "₹600–₹2,500/night", examples: ["Stok Palace Homestay", "Chokhang Villas", "Dragon Guest House"], description: "Warm Ladakhi hospitality, home-cooked food, family atmosphere." },
      { type: "Mid-Range Hotels", priceRange: "₹3,000–₹8,000/night", examples: ["The Grand Dragon Ladakh", "Namra Retreat", "Ladakh Sarai Resort"], description: "Comfortable, heated rooms with mountain views and restaurant." },
      { type: "Luxury Camps & Hotels", priceRange: "₹12,000–₹50,000/night", examples: ["Chamba Camp Thiksey", "The Indus", "Nimmu House"], description: "Luxury glamping by rivers, heated tents with Himalayan views." },
    ],
    localTransport: [
      { mode: "Shared Taxi", cost: "₹200–₹800/seat", notes: "Main mode of transport between Leh and villages", available: true },
      { mode: "Private Taxi/SUV", cost: "₹2,500–₹6,000/day", notes: "Essential for Pangong, Nubra; book in advance", available: true },
      { mode: "Rented Royal Enfield", cost: "₹1,200–₹2,000/day", notes: "Iconic Leh–Manali biking experience; need riding experience", available: true },
      { mode: "Local Bus (HRTC)", cost: "₹50–₹200", notes: "Runs Leh to nearby villages; infrequent", available: true },
      { mode: "E-Bicycle", cost: "₹500–₹800/day", notes: "For Leh town exploration only", available: true },
    ],
    nearbyPlaces: [
      { name: "Pangong Tso Lake", distance: "160 km", type: "Scenic Lake", isHidden: false },
      { name: "Nubra Valley", distance: "120 km", type: "Desert Valley", isHidden: false },
      { name: "Tso Moriri Lake", distance: "240 km", type: "Remote Lake – Hidden Gem", isHidden: true },
      { name: "Zanskar Valley", distance: "250 km", type: "Off-beat Adventure", isHidden: true },
      { name: "Hemis National Park", distance: "40 km", type: "Snow Leopard Habitat", isHidden: false },
      { name: "Wari La Pass", distance: "180 km", type: "Unexplored Route", isHidden: true },
    ],
    budgetBreakdown: [
      { tier: "budget", label: "Backpacker", perDayPerPerson: 2000, accommodation: 800, food: 500, transport: 500, activities: 200 },
      { tier: "mid", label: "Comfortable", perDayPerPerson: 6500, accommodation: 4000, food: 1200, transport: 1000, activities: 300 },
      { tier: "luxury", label: "Premium", perDayPerPerson: 18000, accommodation: 13000, food: 2500, transport: 2000, activities: 500 },
    ],
    defaultItinerary: [
      { day: 1, title: "Arrive Leh – Acclimatise", morning: "Arrive Leh airport. Transfer to hotel. REST — absolutely no strenuous activity. Altitude sickness is real at 11,500 ft.", afternoon: "Light walk in Leh Bazaar (10 min only). See Leh Palace facade from below.", evening: "Early dinner. Sleep early. Drink plenty of water. Take Diamox if prescribed.", stay: "Guesthouse in Leh", meals: "Light Ladakhi thukpa soup (₹150), bread & butter", tips: "No alcohol first 2 days. No rushing. Headache is normal — it passes." },
      { day: 2, title: "Leh Monastery Circuit", morning: "Shanti Stupa for sunrise views. Hemis Monastery and Thiksey Monastery (50 km south).", afternoon: "Rancho's School (3 Idiots filming location) at Druk White Lotus. Sindhu Ghat riverside.", evening: "Leh main market shopping — pashmina, prayer flags, dried apricots.", stay: "Same hotel", meals: "Tibetan thali (₹200), momos dinner (₹150)", tips: "Thiksey Monastery has a monk puja at 6am — worth waking up early for." },
      { day: 3, title: "Nubra Valley – Diskit & Hunder", morning: "Drive over Khardung La (18,380 ft — world's highest motorable road). 40 km north to Nubra Valley.", afternoon: "Diskit Monastery & 32-meter Buddha statue. Sand dunes at Hunder — double-humped Bactrian camel ride (₹200).", evening: "Camp in Nubra under Milky Way sky.", stay: "Luxury tent camp in Nubra", meals: "Camp breakfast, packed lunch, camp dinner (included)", tips: "Inner Line Permit required for Nubra & Pangong — arrange in Leh (₹400 per person)." },
    ],
    womenSafety: {
      score: 9,
      level: "Very Safe",
      highlights: ["One of India's safest destinations for solo women", "Buddhist culture — deeply respectful", "Small communities where everyone knows each other", "Very low crime rate"],
      precautions: ["Altitude sickness can be dangerous alone — always inform someone of your route", "High-altitude roads can be dangerous in bad weather", "Carry emergency cash — ATMs unreliable beyond Leh"],
      soloTips: ["Ladakh is exceptional for solo women — locals are genuinely helpful and respectful", "Stay with local families in homestays for warmth and safety", "Join group biking/trekking tours from Leh for remote areas", "Download offline maps (Maps.me or OsmAnd) — no signal on passes"],
      emergencyContacts: [{ label: "Leh Police", number: "01982-252018" }, { label: "Army Medical (Leh)", number: "01982-252247" }, { label: "Emergency", number: "112" }],
      safeZones: ["Entire Leh town", "All monastery areas", "Certified camps in Nubra and Pangong"],
      avoidAreas: ["Isolated mountain roads alone after dark", "High passes in sudden snowstorms"],
    },
    rating: 4.9,
    reviews: 9800,
    mustEat: ["Thukpa (Tibetan noodle soup)", "Momos with red chutney", "Butter Tea (Gur Gur Chai)", "Skyu (pasta stew)", "Dried Apricots & Walnuts"],
    packingTips: ["Warm layers — fleece & down jacket", "Thermal innerwear", "Sunscreen SPF 80+ (UV intense at altitude)", "Lip balm & moisturizer", "Altitude sickness medicine (Diamox — consult doctor)", "Offline maps downloaded"],
  },

  {
    id: "varanasi",
    name: "Varanasi",
    state: "Uttar Pradesh",
    tagline: "The Eternal City on the Ganges",
    description: "Varanasi is one of the world's oldest living cities — a place where life and death meet openly on the ghats of the Ganges. Every evening, the Ganga Aarti transforms the river into a river of light. Ancient, intense, and unlike anywhere else on earth.",
    image: "https://images.unsplash.com/photo-1571536802807-30451e3955d8?w=600&h=400&fit=crop&auto=format",
    heroImage: "https://images.unsplash.com/photo-1652396507015-74b259a6f58d?w=900&h=600&fit=crop&auto=format",
    category: ["Spiritual", "Heritage", "Culture"],
    bestSeason: "October – March",
    duration: "2–3 days",
    highlights: ["Dashashwamedh Ghat Aarti", "Sunrise boat ride", "Kashi Vishwanath Temple", "Sarnath Buddhist site", "Silk weaving workshops"],
    transport: [
      { mode: "Train", icon: "🚂", fromDelhi: "Shivganga / Vande Bharat – 8–9h", fromMumbai: "Mahanagari Express – 26h", fromBangalore: "Via Delhi – 34h", duration: "8–9h from Delhi", costRange: "₹300–₹2,000", tips: "Varanasi Junction (BSB) is the main station. Vande Bharat from Delhi is fastest." },
      { mode: "Flight", icon: "✈️", fromDelhi: "1.5h to Lal Bahadur Shastri Airport", fromMumbai: "2.5h direct", fromBangalore: "2h direct", duration: "1.5–2.5h", costRange: "₹3,000–₹10,000", tips: "Airport is 25 km from city; cab ₹600–₹1,000. Traffic can be dense." },
      { mode: "Road", icon: "🚗", fromDelhi: "NH-19 – 8–9h", fromMumbai: "—", fromBangalore: "—", duration: "8–9h from Delhi", costRange: "₹1,500–₹3,500", tips: "Combine Agra–Varanasi road trip — Lucknow stopover recommended." },
    ],
    accommodation: [
      { type: "Heritage Guesthouses", priceRange: "₹600–₹2,000/night", examples: ["Brijrama Palace", "Zostel Varanasi", "Hotel Ganges View"], description: "Ghat-facing guesthouses with balconies — wake up to river sounds." },
      { type: "Boutique Hotels", priceRange: "₹3,000–₹8,000/night", examples: ["Guleria Kothi", "Mango Hotels", "BrijRama Palace (Taj SeleQtions)"], description: "Heritage havelis converted into intimate hotels with personal service." },
      { type: "Luxury Stays", priceRange: "₹10,000–₹40,000/night", examples: ["Taj Ganges", "Radisson Varanasi", "Ramada Plaza"], description: "Modern luxury with concierge-arranged ghat rituals and experiences." },
    ],
    localTransport: [
      { mode: "Boat (Nau)", cost: "₹150–₹600/hour", notes: "Essential for ghat exploration; negotiate with boatmen", available: true },
      { mode: "Cycle Rickshaw", cost: "₹30–₹150", notes: "Best for narrow gali (lanes) of old city", available: true },
      { mode: "E-Rickshaw", cost: "₹20–₹100", notes: "Environment-friendly, common in newer areas", available: true },
      { mode: "Auto Rickshaw", cost: "₹80–₹300", notes: "Can't access old city lanes; good for wider roads", available: true },
      { mode: "Walking", cost: "Free", notes: "Old city lanes are best explored on foot — no vehicles fit", available: true },
      { mode: "App Cab", cost: "₹200–₹600", notes: "Useful for airport/station transfers", available: true },
    ],
    nearbyPlaces: [
      { name: "Sarnath", distance: "10 km", type: "Buddhist Pilgrimage", isHidden: false },
      { name: "Ramnagar Fort", distance: "15 km", type: "Heritage", isHidden: false },
      { name: "Chunar Fort", distance: "40 km", type: "Hidden Mughal Fort", isHidden: true },
      { name: "Vindhyachal Temple", distance: "75 km", type: "Spiritual", isHidden: false },
      { name: "Kaimur Wildlife Sanctuary", distance: "130 km", type: "Off-beat Wildlife", isHidden: true },
    ],
    budgetBreakdown: [
      { tier: "budget", label: "Backpacker", perDayPerPerson: 1000, accommodation: 500, food: 250, transport: 150, activities: 100 },
      { tier: "mid", label: "Comfortable", perDayPerPerson: 4000, accommodation: 2500, food: 800, transport: 400, activities: 300 },
      { tier: "luxury", label: "Premium", perDayPerPerson: 15000, accommodation: 11000, food: 2000, transport: 1000, activities: 1000 },
    ],
    defaultItinerary: [
      { day: 1, title: "Ghats, Aarti & Old City", morning: "Sunrise boat ride from Assi Ghat to Manikarnika Ghat. Watch the living city wake up on 84 ghats.", afternoon: "Kashi Vishwanath Temple corridor (new entry via ticket system). Narrow lanes of Kashi — get lost deliberately.", evening: "Dashashwamedh Ghat Ganga Aarti at 6:30pm — arrive 30 min early for good viewing spot.", stay: "Guesthouse near Assi Ghat", meals: "Kachori–sabzi breakfast (₹40), thali lunch (₹100), lassi (₹60)", tips: "Photography at Manikarnika burning ghat is strictly prohibited — respect the rituals." },
      { day: 2, title: "Sarnath & Silk Trail", morning: "Drive 10 km to Sarnath — where Buddha gave his first sermon. Dhamek Stupa, Sarnath Museum (Ashoka's Lion Capital).", afternoon: "Visit a Banarasi silk weaving workshop — watch master weavers create ₹50,000 sarees on handlooms.", evening: "Dev Deepawali (if Nov) — ghats lit with 1 million diyas. Or rooftop dinner overlooking the Ganges.", stay: "Same guesthouse", meals: "Buddhist veg lunch at Sarnath (₹120), street chaat (₹80)", tips: "Buy Banarasi silk only from certified government emporiums to avoid fakes." },
    ],
    womenSafety: {
      score: 5,
      level: "Moderate",
      highlights: ["Religious pilgrimage culture means crowds and visible activity", "Tourist ghats are well-monitored", "Guesthouse owners are protective of guests"],
      precautions: ["Old city lanes can be disorienting and isolated at night", "Avoid accepting food/drink from strangers", "Dress very conservatively (salwar kameez preferred)", "Avoid alone night walks in narrow gallis"],
      soloTips: ["Stay near Assi Ghat — more international tourists, safer feel", "Join guided ghat walks with reputed tour operators", "Take guided sunrise boat rides rather than negotiating alone", "Varanasi can be intense — mental preparation helps; take breaks"],
      emergencyContacts: [{ label: "UP Tourist Police", number: "1800-180-4010" }, { label: "Women Helpline", number: "1091" }, { label: "Varanasi Police Control", number: "0542-2502921" }],
      safeZones: ["Assi Ghat area", "Godowlia Chowk", "Hotels on Cantonment Road"],
      avoidAreas: ["Isolated lanes past 9pm alone", "Remote ghats after dark"],
    },
    rating: 4.7,
    reviews: 14200,
    mustEat: ["Kachori Sabzi (Deena Chaat Bhandar)", "Banarasi Lassi (Blue Lassi)", "Tamatar Chaat", "Chena Dahi Vada", "Malaiyyo (winter dessert)"],
    packingTips: ["Conservative clothing (cover shoulders & knees)", "Waterproof sandals (ghat steps get wet)", "Small backpack for ghat walks", "Sunscreen", "Hand sanitizer"],
  },

  {
    id: "andaman",
    name: "Andaman Islands",
    state: "Andaman & Nicobar",
    tagline: "India's Secret Tropical Paradise",
    description: "The Andaman Islands are India's best-kept secret — 572 islands with crystalline turquoise waters, untouched coral reefs, and dense tropical rainforests. Barely touched by mass tourism, these islands offer world-class diving, pristine beaches, and a frontier tranquility that feels nothing like mainland India.",
    image: "https://images.unsplash.com/photo-1586359716568-3e1907e4cf9f?w=600&h=400&fit=crop&auto=format",
    heroImage: "https://images.unsplash.com/photo-1586053226626-febc8817962f?w=900&h=600&fit=crop&auto=format",
    category: ["Beach", "Diving", "Nature"],
    bestSeason: "November – May",
    duration: "6–10 days",
    highlights: ["Radhanagar Beach (Havelock)", "Scuba Diving Neil Island", "Cellular Jail", "Baratang Limestone Caves", "Bioluminescent plankton beaches"],
    transport: [
      // Airport name, connected cities, and airlines verified against
      // tourism.andamannicobar.gov.in/how-to-reach.php.
      { mode: "Flight", icon: "✈️", fromDelhi: "Direct to Veer Savarkar International Airport, Sri Vijaya Puram (Port Blair)", fromMumbai: "Via Chennai/Bangalore — no direct flight listed", fromBangalore: "Direct to Veer Savarkar International Airport", duration: "2.5–3.5h", costRange: "₹5,000–₹18,000", tips: "Also connected from Chennai, Kolkata, Hyderabad, and Visakhapatnam. Flown by Air India, Indigo, Vistara, Go First, and SpiceJet. Book flights 3–6 months ahead — limited seats and prices spike." },
      { mode: "Ferry", icon: "⛵", fromDelhi: "—", fromMumbai: "Ship from Kolkata – 56h", fromBangalore: "Ship from Chennai – 60h", duration: "56–60h by ship", costRange: "₹2,500–₹12,000 (ship)", tips: "Ships are an adventure but slow. Once on the islands, government ferries leave from Phoenix Bay Jetty (Sri Vijaya Puram) for inter-island travel; private boats leave from Aberdeen Jetty. Daily helicopter service also connects Sri Vijaya Puram to Neil, Havelock, Diglipur, and Hutbay." },
    ],
    accommodation: [
      {
        type: "Government Tourist Lodges", priceRange: "₹800–₹2,500/night (estimate)",
        examples: ["Hawabill Nest", "Turtle Resort", "Municipal Lodging House (Dugong)", "Megapode Resort"],
        description: "A.N. Islands Tourism-run guesthouses across the main islands — basic but reliably clean and well-located.",
        venues: [
          { name: "Hawabill Nest", location: "Shaheed Dweep (Neil Island)", mapsQuery: "Hawabill Nest Neil Island Andaman" },
          { name: "Turtle Resort", location: "Kalipur, Diglipur, North Andaman", mapsQuery: "Turtle Resort Kalipur Diglipur Andaman" },
          { name: "Municipal Lodging House (Dugong)", location: "Aberdeen Bazaar, Sri Vijaya Puram", mapsQuery: "Municipal Lodging House Dugong Aberdeen Bazaar Port Blair" },
          { name: "Megapode Resort", location: "Sri Vijaya Puram (Port Blair)", mapsQuery: "Megapode Resort Port Blair Andaman" },
          { name: "Dolphin Resort (New Block)", location: "Swaraj Dweep (Havelock Island)", mapsQuery: "Dolphin Resort Havelock Island Andaman" },
          { name: "Hornbill Nest Resort", location: "Near Corbyn's Cove, Sri Vijaya Puram", mapsQuery: "Hornbill Nest Resort Corbyn's Cove Port Blair" },
          { name: "Hawksbill Nest", location: "Cutbert Bay, Rangat, Middle Andaman", mapsQuery: "Hawksbill Nest Cutbert Bay Rangat Andaman" },
        ],
        sourceNote: "Real government-run properties listed on tourism.andamannicobar.gov.in — the site does not publish nightly rates; the range above is an estimate, not an official figure.",
      },
      {
        type: "Mid-Range Resorts (A/B Grade)", priceRange: "₹4,000–₹10,000/night (estimate)",
        examples: ["Holiday Inn Beach Resort", "N K Havelock Eco Resorts"],
        description: "The official directory lists 100+ graded A/B private resorts across Sri Vijaya Puram, Swaraj Dweep, and Shaheed Dweep — these two are named as examples on the site.",
        sourceNote: "Rates not published on tourism.andamannicobar.gov.in.",
      },
      {
        type: "Premium Private Hotels (A+ Grade)", priceRange: "₹15,000–₹60,000/night (estimate)",
        examples: ["Taj Exotica Resort & SPA", "Hotel TSG Blue", "Summer Sands", "Sea Shell (Neil Island) Hotel & Resorts", "T.S.G Hotels & Resorts"],
        description: "The island's top-graded private hotels, concentrated on Swaraj Dweep and Shaheed Dweep.",
        sourceNote: "Rates and exact addresses not published on tourism.andamannicobar.gov.in — use each hotel's own site/booking platform for current pricing.",
      },
    ],
    localTransport: [
      { mode: "Ferry (Govt / Private)", cost: "₹200–₹600", notes: "Port Blair – Havelock (Neil Island). Book 2 days ahead", available: true },
      { mode: "Scooter Rental", cost: "₹400–₹700/day", notes: "Best for island exploration on Havelock and Neil", available: true },
      { mode: "Auto Rickshaw", cost: "₹100–₹400", notes: "Available in Port Blair", available: true },
      { mode: "Bus (Port Blair)", cost: "₹10–₹40", notes: "ANIIDCO buses; limited island coverage", available: true },
      { mode: "Kayak", cost: "₹500–₹1,200/day", notes: "For mangrove and lagoon exploration", available: true },
    ],
    nearbyPlaces: [
      { name: "Neil Island (Shaheed Dweep)", distance: "40 km ferry", type: "Relaxed Island", isHidden: false },
      { name: "Baratang Limestone Caves", distance: "100 km from Port Blair", type: "Hidden Natural Wonder", isHidden: true },
      { name: "Ross Island (Netaji Subhas Chandra Bose Island)", distance: "2 km ferry", type: "Heritage Ruins", isHidden: false },
      { name: "Diglipur – Saddle Peak", distance: "330 km", type: "Remote Trek", isHidden: true },
      { name: "Cinque Island", distance: "25 km", type: "Restricted Uninhabited Island", isHidden: true },
    ],
    budgetBreakdown: [
      { tier: "budget", label: "Backpacker", perDayPerPerson: 2200, accommodation: 1000, food: 600, transport: 400, activities: 200 },
      { tier: "mid", label: "Comfortable", perDayPerPerson: 7000, accommodation: 4500, food: 1200, transport: 800, activities: 500 },
      { tier: "luxury", label: "Eco-Luxury", perDayPerPerson: 22000, accommodation: 16000, food: 3500, transport: 1500, activities: 1000 },
    ],
    defaultItinerary: [
      { day: 1, title: "Port Blair – Cellular Jail & Light Show", morning: "Arrive Port Blair. Ross Island by ferry (30 min, ₹500). Explore British colonial ruins taken over by jungle.", afternoon: "Cellular Jail — India's Alcatraz. Deeply moving museum of freedom struggle.", evening: "Sound & Light Show at Cellular Jail (₹100). Aberdeen Bazaar for fresh seafood.", stay: "Port Blair hotel", meals: "Andaman fish curry (₹250), seafood thali (₹350)", tips: "Book Light Show tickets early; shows sell out." },
      { day: 2, title: "Havelock Island – Radhanagar Beach", morning: "Ferry to Havelock (2h). Straight to Radhanagar Beach — Asia's best beach (Beach No. 7).", afternoon: "Elephant Beach — snorkeling with sea turtles and coral reefs (₹1,200 including equipment).", evening: "Sunset at Kalapathar Beach. Fresh grilled lobster for dinner.", stay: "Beach resort on Havelock", meals: "Fresh coconut, grilled fish lunch (₹300), lobster dinner (₹800)", tips: "Radhanagar sunset is unmissable — arrive by 5pm for best light." },
      { day: 3, title: "Scuba Diving & Neil Island", morning: "Scuba dive (₹3,500 for certified; ₹4,500 for beginners) at Nemo Reef or Dixon's Pinnacle.", afternoon: "Ferry to Neil Island (1h, ₹350). Laxmanpur Beach — starfish in shallow water.", evening: "Natural Bridge at Neil — limestone arch over sea. Bonfire at beach.", stay: "Hut on Neil Island", meals: "Fresh catch BBQ (₹400)", tips: "Freediving courses available at Dive India (Havelock) for certified divers." },
    ],
    womenSafety: {
      score: 9,
      level: "Very Safe",
      highlights: ["One of India's safest destinations overall", "Small island community", "Heavy naval and security presence", "International tourist culture"],
      precautions: ["Restricted tribal areas — respect Protected Area Permit rules", "Don't swim at night or in areas without lifeguards", "Book ferry tickets in advance — don't accept last-minute boat offers", "G.B. Pant Hospital and AYUSH Hospital (Sri Vijaya Puram) handle emergencies; smaller primary health centres are on Swaraj Dweep, Shaheed Dweep, Rangat, and Diglipur — per tourism.andamannicobar.gov.in"],
      soloTips: ["Andaman is exceptional for solo women travellers", "Resort/hotel staff are very helpful and trustworthy", "Join group snorkelling and diving trips — social and safe", "Beach areas are well-lit and regularly patrolled"],
      emergencyContacts: [{ label: "Port Blair Police", number: "03192-232100" }, { label: "Coast Guard Andaman", number: "03192-230420" }, { label: "Emergency", number: "112" }],
      safeZones: ["All major beaches on Havelock and Neil", "Port Blair town", "Certified resort areas"],
      avoidAreas: ["Restricted tribal reserve areas (Jarawa)", "Unregistered boats and ferry operators"],
    },
    rating: 4.9,
    reviews: 7600,
    mustEat: ["Andaman Lobster Curry", "Grilled Red Snapper", "Coconut Prawn Curry", "Fresh Tuna Steaks", "Andamani Fish Tikka"],
    packingTips: ["Swimwear & rashguard (sun protection)", "Waterproof bag", "Snorkel & fins (or rent there)", "Anti-seasickness tablets", "DEET mosquito repellent", "Reef-safe sunscreen"],
  },
  {
    id: "udaipur",
    name: "Udaipur",
    state: "Rajasthan",
    tagline: "The City of Lakes & Palaces",
    description: "Udaipur is Rajasthan's most romantic city — a maze of white-washed havelis, glittering lakes, and fairy-tale palaces. The Lake Palace rising from Pichola's waters, the City Palace rambling up a hillside, and the Aravalli Hills as a backdrop make it one of India's most photogenic cities.",
    image: "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?w=600&h=400&fit=crop&auto=format",
    heroImage: "https://images.unsplash.com/photo-1695956353120-54ce5e91632b?w=900&h=600&fit=crop&auto=format",
    category: ["Heritage", "Culture", "Romantic"],
    bestSeason: "October – March",
    duration: "3–4 days",
    highlights: ["Lake Palace (Taj Hotel)", "City Palace Museum", "Lake Pichola sunset boat", "Jagdish Temple", "Monsoon Palace (Sajjangarh)"],
    transport: [
      { mode: "Train", icon: "🚂", fromDelhi: "Mewar Express – 12h overnight", fromMumbai: "Bandra Terminus Express – 11h", fromBangalore: "Via Jaipur – 22h+", duration: "11–12h from Delhi/Mumbai", costRange: "₹400–₹2,000", tips: "Udaipur City railway station is 3 km from the old city. Book overnight trains to save a day." },
      { mode: "Flight", icon: "✈️", fromDelhi: "1.5h to Maharana Pratap Airport", fromMumbai: "1.5h direct", fromBangalore: "2h direct", duration: "1.5–2h", costRange: "₹2,500–₹9,000", tips: "Airport is 22 km from city. Cab ₹500–₹700. Fly in morning for best daylight exploration." },
      { mode: "Road", icon: "🚗", fromDelhi: "NH-48 via Ajmer – 9–10h", fromMumbai: "NH-48 – 10h", fromBangalore: "—", duration: "9–10h", costRange: "₹1,500–₹4,000 cab", tips: "Golden Triangle road trip: Delhi → Jaipur → Udaipur is very popular (2 days). Jaipur to Udaipur is 5–6h." },
    ],
    accommodation: [
      { type: "Heritage Havelis", priceRange: "₹1,000–₹3,000/night", examples: ["Zostel Udaipur", "Nukkad Guest House", "Hotel Krishna Niwas"], description: "Old city havelis with rooftop lake views — the best budget experience in India." },
      { type: "Boutique Lake-View Hotels", priceRange: "₹4,000–₹12,000/night", examples: ["Amet Haveli", "Jaiwana Haveli", "The Jaiwana Haveli"], description: "Heritage properties with stunning Lake Pichola views from private balconies." },
      { type: "Palace Hotels", priceRange: "₹20,000–₹1,50,000/night", examples: ["Taj Lake Palace (on water)", "Oberoi Udaivilas", "Fateh Prakash Palace"], description: "Live inside actual Mewar royal palaces. The Lake Palace is accessible only by boat." },
    ],
    localTransport: [
      { mode: "Auto Rickshaw", cost: "₹50–₹300", notes: "Negotiate; many run on meter in old city", available: true },
      { mode: "E-Rickshaw", cost: "₹20–₹100", notes: "Eco-friendly, common in bazaar areas", available: true },
      { mode: "Boat (Lake Pichola)", cost: "₹400 (sunset cruise)", notes: "Government RTDC boats at Rameshwar Ghat — sunset cruise unmissable", available: true },
      { mode: "App Cab (Ola)", cost: "₹150–₹600", notes: "Available; use for airport transfers", available: true },
      { mode: "Bicycle/Scooter Rental", cost: "₹200–₹500/day", notes: "Perfect for old city exploration", available: true },
      { mode: "Walking", cost: "Free", notes: "Old city lanes around Jagdish Chowk best on foot", available: true },
    ],
    nearbyPlaces: [
      { name: "Chittorgarh Fort", distance: "115 km", type: "UNESCO Heritage Fort", isHidden: false },
      { name: "Kumbhalgarh Fort & Wildlife Sanctuary", distance: "84 km", type: "Great Wall of India", isHidden: false },
      { name: "Ranakpur Jain Temple", distance: "96 km", type: "Hidden Marble Marvel", isHidden: true },
      { name: "Eklingji & Nagda Temples", distance: "22 km", type: "Spiritual – Less Visited", isHidden: true },
      { name: "Jaisamand Lake (Asia's 2nd largest)", distance: "48 km", type: "Off-beat Picnic Spot", isHidden: true },
      { name: "Nathdwara (Shreenathji Temple)", distance: "48 km", type: "Spiritual", isHidden: false },
    ],
    budgetBreakdown: [
      { tier: "budget", label: "Backpacker", perDayPerPerson: 1400, accommodation: 700, food: 350, transport: 200, activities: 150 },
      { tier: "mid", label: "Comfortable", perDayPerPerson: 5500, accommodation: 3500, food: 1000, transport: 500, activities: 500 },
      { tier: "luxury", label: "Royal Palace", perDayPerPerson: 35000, accommodation: 30000, food: 3000, transport: 1000, activities: 1000 },
    ],
    defaultItinerary: [
      { day: 1, title: "City Palace & Lake Pichola", morning: "City Palace Museum (allow 3 hours, ₹300 entry). Crystal Gallery inside is extraordinary — 19th-century Mewar artefacts.", afternoon: "Jagdish Temple (free). Explore old city bazaar — silver jewellery and miniature paintings.", evening: "Sunset boat cruise on Lake Pichola (₹400, 1 hour) — best view of Lake Palace glowing gold.", stay: "Old city haveli", meals: "Thali at Natraj Dining Hall (₹180), rooftop dinner overlooking lake (₹600)", tips: "Book boat cruise tickets at Rameshwar Ghat before 4pm — they sell out." },
      { day: 2, title: "Monsoon Palace & Shilpgram", morning: "Monsoon Palace (Sajjangarh, 9 km) — panoramic city views. Best with guide (₹300 guide fee).", afternoon: "Shilpgram Rural Arts Festival area — tribal arts, crafts workshops, folk performances.", evening: "Bagore ki Haveli cultural show (₹60, 7pm) — folk dances inside an 18th-century haveli on the lake.", stay: "Same hotel", meals: "Rajasthani thali lunch (₹200), haveli cafe dinner (₹500)", tips: "Bagore ki Haveli show is one of Rajasthan's most authentic cultural experiences." },
      { day: 3, title: "Kumbhalgarh Day Trip", morning: "Drive 84 km to Kumbhalgarh Fort — 36 km of walls (2nd longest after Great Wall of China).", afternoon: "Ranakpur Jain Temple (30 km south of Kumbhalgarh) — 1,444 marble columns, no two alike.", evening: "Return to Udaipur. Dinner at Ambrai Restaurant — lake-facing, iconic.", stay: "Same hotel", meals: "Dhaba lunch en route (₹150), Ambrai dinner (₹800)", tips: "Hire a car for this day (₹2,000–₹2,500). No public transport to Kumbhalgarh." },
    ],
    womenSafety: {
      score: 8,
      level: "Very Safe",
      highlights: ["International tourist crowd makes it very foreigner-friendly", "Old city is well-lit and busy till late", "Rooftop restaurants are safe solo dining spaces", "Police presence around lake and palace areas"],
      precautions: ["Be firm with persistent souvenir sellers near City Palace", "Avoid accepting boat rides from unofficial vendors at night", "Dress modestly in temple areas"],
      soloTips: ["Udaipur is among Rajasthan's safest cities for solo women", "Stay in old city near Jagdish Chowk — central, very active", "Rooftop cafes are perfect solo dining spots with incredible lake views", "Join the RTDC sunset boat cruise — group setting, government-run"],
      emergencyContacts: [{ label: "Udaipur Tourist Police", number: "0294-2411535" }, { label: "Women Helpline Rajasthan", number: "181" }, { label: "Police", number: "100" }],
      safeZones: ["Old City / Jagdish Chowk", "City Palace Road", "Fateh Sagar Lake area"],
      avoidAreas: ["Dark lanes south of the old city after 10pm alone", "Unofficial boat operators after dark"],
    },
    rating: 4.8,
    reviews: 16200,
    mustEat: ["Dal Baati Churma", "Laal Maas", "Ker Sangri", "Mawa Kachori", "Ghewar (sweet)"],
    packingTips: ["Light cotton for day, light wrap for evenings", "Sunscreen SPF 50+", "Comfortable walking sandals", "Small daypack", "Cash for bazaar shopping"],
  },

  {
    id: "rishikesh",
    name: "Rishikesh",
    state: "Uttarakhand",
    tagline: "Yoga Capital of the World",
    description: "Rishikesh sits at the foothills of the Himalayas where the Ganges emerges from the mountains — sacred, spectacular, and buzzing with spiritual energy. World-renowned for yoga and meditation ashrams, it's equally thrilling for white-water rafting, bungee jumping, and camping under Himalayan stars.",
    image: "https://images.unsplash.com/photo-1650341259809-9314b0de9268?w=600&h=400&fit=crop&auto=format",
    heroImage: "https://images.unsplash.com/photo-1650341278999-d1b5142cfe30?w=900&h=600&fit=crop&auto=format",
    category: ["Adventure", "Spiritual", "Wellness"],
    bestSeason: "September – November, February – May",
    duration: "3–5 days",
    highlights: ["Ganga Aarti at Triveni Ghat", "Laxman Jhula & Ram Jhula", "White-water rafting Grade 3–4", "Bungee jumping (83m — India's highest)", "Beatles Ashram (Maharishi Ashram)"],
    transport: [
      { mode: "Train", icon: "🚂", fromDelhi: "Shatabdi to Haridwar (4.5h) + 25km cab to Rishikesh", fromMumbai: "Mumbai–Haridwar Express – 24h + 25km", fromBangalore: "Via Delhi – 28h+", duration: "5–6h from Delhi via Haridwar", costRange: "₹300–₹1,500 + ₹400 cab", tips: "Rishikesh has its own station (Rishikesh Railway Station) but limited trains. Haridwar Junction is better connected — 25 km away." },
      { mode: "Road", icon: "🚗", fromDelhi: "NH-334 – 6–7h", fromMumbai: "—", fromBangalore: "—", duration: "6–7h from Delhi", costRange: "₹1,500–₹3,500 cab / ₹300 Volvo bus", tips: "Delhi ISBT Kashmere Gate has frequent Volvo AC buses to Rishikesh (₹300–₹450, 6h)." },
      { mode: "Flight", icon: "✈️", fromDelhi: "Nearest airport: Dehradun (Jolly Grant) – 35 km – 45 min flight", fromMumbai: "1.5h to Dehradun", fromBangalore: "2.5h to Dehradun", duration: "45min–2.5h to Dehradun", costRange: "₹3,000–₹9,000", tips: "Cab from Dehradun airport to Rishikesh is 1h, ₹800–₹1,200." },
    ],
    accommodation: [
      { type: "Ashrams & Yoga Retreats", priceRange: "₹300–₹2,500/night (incl. meals)", examples: ["Parmarth Niketan Ashram", "Sivananda Ashram", "Rishikesh Yog Peeth"], description: "Authentic ashram stays with yoga, meditation, and vegetarian meals. Pre-book well in advance." },
      { type: "Guesthouses & Hostels", priceRange: "₹600–₹2,000/night", examples: ["Zostel Rishikesh", "The Drifters Inn", "Hotel Brijwasi Palace"], description: "Budget stays near Laxman Jhula with Ganges views. Backpacker social scene." },
      { type: "Riverside Camps & Boutique Hotels", priceRange: "₹3,000–₹15,000/night", examples: ["Camp Ganga Vatika", "Aloha on the Ganges", "Tattva Shivpuri Camp"], description: "Luxury riverside tents with rafting packages. Very popular for groups." },
    ],
    localTransport: [
      { mode: "Auto Rickshaw", cost: "₹50–₹300", notes: "Main mode in Rishikesh town; agree on price beforehand", available: true },
      { mode: "Shared Jeep", cost: "₹20–₹100/seat", notes: "Frequent between Rishikesh, Laxman Jhula, Haridwar", available: true },
      { mode: "Walking/Cycling", cost: "₹150/day bike rental", notes: "Best way around Laxman Jhula and Ram Jhula area", available: true },
      { mode: "Raft (river transport)", cost: "₹400–₹600/person", notes: "River rafting doubles as transport downriver", available: true },
    ],
    nearbyPlaces: [
      { name: "Haridwar", distance: "25 km", type: "Spiritual City – Har Ki Pauri", isHidden: false },
      { name: "Neelkanth Mahadev Temple", distance: "32 km", type: "Sacred Trek", isHidden: false },
      { name: "Rajaji National Park", distance: "19 km", type: "Wildlife Safari", isHidden: false },
      { name: "Shivpuri Beach", distance: "16 km", type: "River Beach Camping", isHidden: true },
      { name: "Kunjapuri Temple Trek", distance: "20 km", type: "Sunrise Trek – Hidden Gem", isHidden: true },
      { name: "Badrinath / Kedarnath Gateway", distance: "300 km", type: "Char Dham Yatra Start", isHidden: false },
    ],
    budgetBreakdown: [
      { tier: "budget", label: "Backpacker", perDayPerPerson: 1000, accommodation: 400, food: 250, transport: 150, activities: 200 },
      { tier: "mid", label: "Comfortable", perDayPerPerson: 4500, accommodation: 2500, food: 800, transport: 400, activities: 800 },
      { tier: "luxury", label: "Camp & Adventure", perDayPerPerson: 12000, accommodation: 8000, food: 2000, transport: 500, activities: 1500 },
    ],
    defaultItinerary: [
      { day: 1, title: "Arrive & Explore Laxman Jhula", morning: "Arrive. Walk Ram Jhula and Laxman Jhula suspension bridges over the Ganges. Explore café culture on the banks.", afternoon: "Beatles Ashram (Maharishi Mahesh Yogi Ashram) — ₹150 entry. Stunning murals and jungle ruins.", evening: "Ganga Aarti at Triveni Ghat — most moving at dusk. Sit riverside, join the prayers.", stay: "Guesthouse or ashram near Laxman Jhula", meals: "Banana lassi ₹80, café dinner (strictly vegetarian in Rishikesh) ₹250", tips: "No alcohol or non-veg food sold in most of Rishikesh — this is a dry, vegetarian holy city." },
      { day: 2, title: "White-Water Rafting Adventure", morning: "Rafting from Shivpuri to Rishikesh (16 km, Grade 3–4, 2.5 hours, ₹600–₹1,200/person). Wear life jacket always.", afternoon: "Bungee jumping (₹3,500, 83m), flying fox, cliff jumping at Jumping Heights.",
        evening: "Yoga class at Parmarth Niketan (free evening class on the ghats). Sunset meditation.", stay: "Riverside camp or guesthouse", meals: "Riverside café lunch ₹200, thali dinner ₹300", tips: "Book rafting with registered operators — look for UTDB (Uttarakhand Tourism) certification." },
      { day: 3, title: "Yoga, Meditation & Neelkanth Trek", morning: "Morning yoga at a certified ashram (2 hours). Pranayama, asanas, meditation — deeply restorative.", afternoon: "Trek or cab to Neelkanth Mahadev Temple (32 km) through dense forest. Sacred Shiva shrine.", evening: "Return to Rishikesh. Farewell walk by the Ganges at golden hour.", stay: "Ashram or check out", meals: "Ashram meal ₹100, simple café dinner ₹250", tips: "Many ashrams offer multi-day yoga TTC (Teacher Training Courses) — enquire if interested." },
    ],
    womenSafety: {
      score: 8,
      level: "Very Safe",
      highlights: ["Spiritual atmosphere attracts respectful, conscious crowd", "International yoga community — very open and safe culture", "Police patrol the ghats regularly", "Well-lit tourist areas"],
      precautions: ["Modest dress is essential — short clothes attract unwanted attention near temples", "Secure your valuables in ashrams", "Avoid isolated forest paths alone after dark"],
      soloTips: ["Rishikesh is one of the best solo women destinations in India", "Ashram stays are extremely safe — family/community environment", "International women solo travellers are very common here — easy to find travel companions", "Join a yoga retreat for a structured, safe social experience"],
      emergencyContacts: [{ label: "Rishikesh Tourist Police", number: "0135-2431793" }, { label: "Women Helpline Uttarakhand", number: "1090" }, { label: "Emergency", number: "112" }],
      safeZones: ["Laxman Jhula market area", "Ghat areas (Triveni & Swarg Ashram)", "All registered ashrams"],
      avoidAreas: ["Isolated forest paths toward Neelkanth after dark alone", "Unknown ashrams without verifying online reviews"],
    },
    rating: 4.7,
    reviews: 19500,
    mustEat: ["Café Nirvana's thali (₹250)", "Madras Café dosa", "Chotiwala restaurant (iconic, since 1958)", "Fresh coconut water on ghats (₹30)", "Ayurvedic herbal teas"],
    packingTips: ["Modest clothes covering shoulders & knees", "Rubber/water sandals for ghats and rafting", "Quick-dry towel", "Sunscreen", "Rain jacket (monsoon)", "Yoga mat (or rent ₹50/day)"],
  },

  {
    id: "darjeeling",
    name: "Darjeeling",
    state: "West Bengal",
    tagline: "The Queen of Hills & Champagne of Tea",
    description: "Darjeeling floats above the clouds at 2,000 metres, draped in tea gardens and presided over by the mighty Kangchenjunga. The Toy Train puffing through misty hills, sunrise over the world's third-highest peak from Tiger Hill, and the clink of a first-flush Darjeeling in a colonial tea house — this is a different India entirely.",
    image: "https://images.unsplash.com/photo-1710314408818-dbfc395cb48e?w=600&h=400&fit=crop&auto=format",
    heroImage: "https://images.unsplash.com/photo-1674076336187-e118bc24f430?w=900&h=600&fit=crop&auto=format",
    category: ["Nature", "Heritage", "Culture"],
    bestSeason: "March – May, October – November",
    duration: "3–4 days",
    highlights: ["Tiger Hill sunrise over Kangchenjunga", "Darjeeling Himalayan Railway (Toy Train)", "Happy Valley Tea Estate tour", "Batasia Loop", "Peace Pagoda"],
    transport: [
      { mode: "Train", icon: "🚂", fromDelhi: "To New Jalpaiguri (NJP) – 12–16h, then cab/shared jeep 4h", fromMumbai: "To NJP – 28h + 4h cab", fromBangalore: "Via Kolkata – 30h+ to NJP", duration: "4h from NJP (90 km, mountain roads)", costRange: "₹400–₹2,000 train + ₹200–₹500 jeep", tips: "New Jalpaiguri (NJP) is the gateway. Take a shared jeep from NJP to Darjeeling (₹200, 4h) — scenic mountain road." },
      { mode: "Flight", icon: "✈️", fromDelhi: "To Bagdogra Airport (2.5h) + 2h cab to Darjeeling", fromMumbai: "2h to Bagdogra + 2h cab", fromBangalore: "2.5h to Bagdogra + 2h cab", duration: "2.5h flight + 2h mountain drive", costRange: "₹3,500–₹12,000 flight + ₹1,500 cab", tips: "Bagdogra airport is 90 km away. The mountain drive takes 2–3h but the views are spectacular." },
      { mode: "Toy Train (UNESCO)", icon: "🚂", fromDelhi: "As above to NJP, then Toy Train from NJP to Darjeeling – 7h", fromMumbai: "—", fromBangalore: "—", duration: "7h (Toy Train – romantic, slow)", costRange: "₹300–₹1,500 (tourist class)", tips: "The DHR Toy Train (UNESCO Heritage) is an experience in itself. Book 30+ days ahead on IRCTC. Don't rely on it for punctuality." },
    ],
    accommodation: [
      { type: "Budget Guesthouses", priceRange: "₹600–₹1,800/night", examples: ["Zostel Darjeeling", "Andy's Guest House", "Hotel Dekeling"], description: "Cozy mountain guesthouses with Kangchenjunga views on clear mornings." },
      { type: "Colonial Heritage Hotels", priceRange: "₹3,500–₹10,000/night", examples: ["Mayfair Darjeeling", "Cedar Inn", "Hotel Windamere"], description: "British Raj-era hotels with fireplaces, four-poster beds, and afternoon tea service." },
      { type: "Boutique Tea Estate Stays", priceRange: "₹8,000–₹25,000/night", examples: ["Glenburn Tea Estate", "Makaibari Tea Estate", "Cochrane Place"], description: "Stay inside working tea estates — garden walks, plucking sessions, private bungalows." },
    ],
    localTransport: [
      { mode: "Shared Jeep (Sumo)", cost: "₹30–₹200/seat", notes: "Main transport between Darjeeling, Kurseong, Mirik, Siliguri", available: true },
      { mode: "Toy Train (joyride)", cost: "₹250–₹1,500", notes: "2h joyride from Darjeeling station — booking essential", available: true },
      { mode: "Taxi (local)", cost: "₹300–₹1,200", notes: "Hire full-day for Tiger Hill + sightseeing (₹1,200–₹1,800)", available: true },
      { mode: "Walking", cost: "Free", notes: "Mall Road, Chowrasta, market areas all walkable", available: true },
    ],
    nearbyPlaces: [
      { name: "Tiger Hill (sunrise point)", distance: "13 km", type: "Iconic Sunrise", isHidden: false },
      { name: "Mirik Lake", distance: "50 km", type: "Peaceful Hill Lake", isHidden: false },
      { name: "Kurseong (Eagle's Nest)", distance: "32 km", type: "Quieter Hill Station", isHidden: true },
      { name: "Lamahatta Eco Park", distance: "23 km", type: "Off-beat Nature Park", isHidden: true },
      { name: "Tonglu Trek to Sandakphu", distance: "32 km trek start", type: "Epic Trek to Sleeping Buddha peak", isHidden: true },
      { name: "Gangtok, Sikkim", distance: "100 km", type: "State Capital", isHidden: false },
    ],
    budgetBreakdown: [
      { tier: "budget", label: "Backpacker", perDayPerPerson: 1200, accommodation: 600, food: 350, transport: 150, activities: 100 },
      { tier: "mid", label: "Comfortable", perDayPerPerson: 5000, accommodation: 3000, food: 1000, transport: 500, activities: 500 },
      { tier: "luxury", label: "Tea Estate", perDayPerPerson: 16000, accommodation: 12000, food: 2500, transport: 1000, activities: 500 },
    ],
    defaultItinerary: [
      { day: 1, title: "Arrive & Mall Road Exploration", morning: "Arrive Darjeeling. Settle in. Walk to Chowrasta — the main square with Kangchenjunga views (on clear days).", afternoon: "Happy Valley Tea Estate tour (₹100) — watch tea processing from plucking to packing. Buy first-flush Darjeeling.", evening: "Mall Road stroll. Glenary's Bakery for momos and hot chocolate. Peace Pagoda at dusk.", stay: "Heritage guesthouse", meals: "Glenary's breakfast (₹200), thali lunch (₹150), restaurant dinner (₹400)", tips: "Carry cash — ATMs sometimes run dry in Darjeeling. Withdraw in Siliguri/NJP before arriving." },
      { day: 2, title: "Tiger Hill Sunrise & Toy Train", morning: "4am: Cab to Tiger Hill (₹1,200 cab, shared) for sunrise — on clear days you see Everest. Return by 8am.", afternoon: "Toy Train joyride (2h, ₹250–₹1,500 first class) — Batasia Loop, war memorial, mountain views.", evening: "Himalayan Mountaineering Institute & Zoo (₹100) — where Tenzing Norgay trained. Evening at Nathmull's Tea Room.", stay: "Same hotel", meals: "Hot chai at Tiger Hill (₹20), momos lunch (₹80), Nepali thali dinner (₹250)", tips: "Tiger Hill sunrise: Book cab night before (₹700 shared/₹1,200 private). Clear days: Oct–Nov, March–April." },
      { day: 3, title: "Tea Estate Stay or Kurseong Day Trip", morning: "Visit Makaibari Tea Estate (world's oldest certified organic tea estate, 1859). Meet the owner-family.", afternoon: "Drive to Kurseong (32 km) — quieter hill town with Eagle's Nest. Genuine colonial atmosphere.", evening: "Return to Darjeeling. Last sunset from Chowrasta with chai and Nepali snacks.", stay: "Tea estate bungalow or hotel", meals: "Estate breakfast (₹300), dal bhat lunch (₹120), dinner with estate family", tips: "Makaibari offers overnight stays in village homes — extraordinary community experience." },
    ],
    womenSafety: {
      score: 9,
      level: "Very Safe",
      highlights: ["Nepali-speaking community — extremely respectful and warm", "Small hill town where locals know each other", "Very low crime rate historically", "Tourist police active at all major points"],
      precautions: ["Mountain roads can be treacherous in monsoon — avoid travel during heavy rain", "Carry layers — temperature drops sharply at night even in summer", "Tiger Hill road is dark at 4am — use organized cabs, not solo walks"],
      soloTips: ["Darjeeling is one of India's most welcoming places for solo women", "Guesthouse owners are protective and helpful", "Tea estate homestays are extremely safe and intimate", "Join Toy Train joyride — instant social setting"],
      emergencyContacts: [{ label: "Darjeeling Police", number: "0354-2252263" }, { label: "Women Helpline WB", number: "181" }, { label: "Emergency", number: "112" }],
      safeZones: ["Chowrasta and Mall Road area", "Hotel and tea estate zones", "All tourist spots"],
      avoidAreas: ["Isolated forest paths after dark", "Unknown jeep shares at night"],
    },
    rating: 4.8,
    reviews: 11800,
    mustEat: ["Darjeeling First Flush Tea", "Veg Momos with chutney", "Thukpa soup", "Sel Roti (Nepali sweet)", "Sha Phaley (stuffed bread)", "Sikkimese Dal Bhat"],
    packingTips: ["Warm layers (fleece + down jacket)", "Waterproof jacket", "Comfortable walking boots", "Thermal innerwear (for Tiger Hill 4am)", "Sunscreen (UV strong at altitude)", "Camera with extra battery (cold drains fast)"],
  },

  {
    id: "khajuraho",
    name: "Khajuraho",
    state: "Madhya Pradesh",
    tagline: "Temples of the Heart of India",
    description: "Khajuraho is home to a UNESCO World Heritage complex of 10th–11th century temples — extraordinary in their erotic and devotional carvings. Unexpectedly beautiful and far less visited than its fame suggests, Khajuraho offers an intimate encounter with medieval Indian art and the philosophical acceptance of life in all its dimensions.",
    image: "https://images.unsplash.com/photo-1606298855672-3efb63017be8?w=600&h=400&fit=crop&auto=format",
    heroImage: "https://images.unsplash.com/photo-1672215055915-e6143dc70e6a?w=900&h=600&fit=crop&auto=format",
    category: ["Heritage", "UNESCO", "Culture"],
    bestSeason: "October – March",
    duration: "2–3 days",
    highlights: ["Western Temple Group (UNESCO)", "Kandariya Mahadeva Temple", "Khajuraho Dance Festival (Feb)", "Raneh Falls", "Panna Tiger Reserve"],
    transport: [
      { mode: "Flight", icon: "✈️", fromDelhi: "1.5h direct to Khajuraho Airport", fromMumbai: "Via Delhi – 3.5h total", fromBangalore: "Via Delhi – 4h", duration: "1.5h from Delhi direct", costRange: "₹3,500–₹12,000", tips: "Khajuraho has its own small airport — direct flights from Delhi. Easiest way to reach. Cab to town: ₹150." },
      { mode: "Train", icon: "🚂", fromDelhi: "Uttar Pradesh Sampark Kranti – 10h to Jhansi + 3h cab", fromMumbai: "Via Jhansi – 18h + 3h cab", fromBangalore: "Via Jhansi – 28h+", duration: "12–15h via Jhansi (175 km)", costRange: "₹400–₹1,500 train + ₹1,500 cab", tips: "Nearest major station is Jhansi (175 km). Khajuraho station exists but few trains. Fly or go via Jhansi." },
      { mode: "Road", icon: "🚗", fromDelhi: "Via Jhansi – 10–12h", fromMumbai: "—", fromBangalore: "—", duration: "10–12h from Delhi", costRange: "₹3,000–₹6,000 cab", tips: "Combine with Orchha (170 km) and Jhansi for a Madhya Pradesh heritage circuit." },
    ],
    accommodation: [
      { type: "Budget Guesthouses", priceRange: "₹500–₹1,500/night", examples: ["Hotel Harmony", "Yogi Lodge", "Hotel Surya"], description: "Simple clean rooms near temple complex; many have rooftop views of temple spires." },
      { type: "Mid-Range Hotels", priceRange: "₹2,500–₹7,000/night", examples: ["Ramada Khajuraho", "Hotel Chandela", "Usha Bundela"], description: "Pool, restaurant, and comfortable rooms — some face the Western temple group." },
      { type: "Heritage Resorts", priceRange: "₹10,000–₹35,000/night", examples: ["Taj Chandela", "Ken River Lodge (near Panna)", "Lalit Temple View"], description: "Luxury resorts with temple views, spa, and jungle safari packages." },
    ],
    localTransport: [
      { mode: "Cycle Rickshaw", cost: "₹50–₹200", notes: "Perfect for visiting three temple groups", available: true },
      { mode: "Auto Rickshaw", cost: "₹80–₹400", notes: "Hire for day visit to Eastern and Southern groups", available: true },
      { mode: "Bicycle Rental", cost: "₹100–₹150/day", notes: "Ideal — temple groups are within 3 km of each other", available: true },
      { mode: "Taxi", cost: "₹800–₹1,500/day", notes: "For Raneh Falls and Panna day trips", available: true },
    ],
    nearbyPlaces: [
      { name: "Panna Tiger Reserve", distance: "45 km", type: "Wildlife Safari", isHidden: false },
      { name: "Raneh Falls (Ken River)", distance: "20 km", type: "Canyon Waterfall", isHidden: false },
      { name: "Ajaigarh Fort", distance: "80 km", type: "Ruined Chandela Fort – Hidden", isHidden: true },
      { name: "Orchha", distance: "170 km", type: "Medieval Town & Cenotaphs", isHidden: false },
      { name: "Kalinjar Fort", distance: "105 km", type: "Mysterious Hilltop Fort", isHidden: true },
    ],
    budgetBreakdown: [
      { tier: "budget", label: "Backpacker", perDayPerPerson: 900, accommodation: 500, food: 200, transport: 100, activities: 100 },
      { tier: "mid", label: "Comfortable", perDayPerPerson: 4000, accommodation: 2500, food: 800, transport: 400, activities: 300 },
      { tier: "luxury", label: "Heritage Resort", perDayPerPerson: 18000, accommodation: 14000, food: 2500, transport: 1000, activities: 500 },
    ],
    defaultItinerary: [
      { day: 1, title: "Western Temple Group at Dawn & Dusk", morning: "Western Group at sunrise (opens 6am) — Kandariya Mahadeva, Devi Jagadamba, Lakshmana Temple. Hire a guide (₹400) to understand the iconography.", afternoon: "Eastern Group — Jain temples and Brahmanical cluster. Archaelogical Museum (₹15).", evening: "Sound & Light Show at Western Group (₹200, Hindi/English, 6:30pm). The temples lit at night are magical.", stay: "Hotel near Western Group", meals: "Local dhaba thali (₹100), restaurant dinner (₹350)", tips: "Best photos of temples: early morning light (east-facing) and late afternoon golden hour (west-facing)." },
      { day: 2, title: "Raneh Falls & Panna Safari", morning: "Drive 20 km to Raneh Falls — a crystalline canyon of Ken River through pink granite. Best Oct–Feb.", afternoon: "Panna Tiger Reserve jeep safari (₹2,500–₹3,500 total for jeep, shared). Tigers, vultures, gharials.", evening: "Return to Khajuraho. Browse local Chanderi silk and tribal crafts shops.", stay: "Same hotel or check out", meals: "Packed lunch for safari, dinner at hotel", tips: "Book Panna safari online at mpforest.gov.in — limited vehicles per slot." },
    ],
    womenSafety: {
      score: 7,
      level: "Safe",
      highlights: ["Small tourist town — low anonymity, higher accountability", "Temple complex well-policed", "Mostly domestic and international tourists — respectful environment"],
      precautions: ["Small town — limited nightlife; stay in hotel compound after 9pm", "Accept that locals will be curious — firm but polite deflection works", "Only hire guides at the Archaeological Survey of India counter inside the temple"],
      soloTips: ["Khajuraho is very manageable solo — it's compact and tourist-focused", "Join organized sunset tours from your hotel", "The erotic temple carvings attract no inappropriate behaviour — treat them as the art historical marvels they are", "Stay in hotel zones rather than remote guesthouses"],
      emergencyContacts: [{ label: "Khajuraho Police", number: "07686-274058" }, { label: "MP Tourist Helpline", number: "0755-2774318" }, { label: "Emergency", number: "112" }],
      safeZones: ["Western Temple Group area", "Main town market", "All registered hotels"],
      avoidAreas: ["Isolated roads toward southern group after dark alone", "Remote fields around temples at night"],
    },
    rating: 4.6,
    reviews: 8200,
    mustEat: ["Dal Bafla (MP version of Dal Baati)", "Poha Jalebi breakfast", "Bhutte ka Kees (corn curry)", "Malpua (sweet)", "Tribal Forest Honey"],
    packingTips: ["Light cotton for day", "Scarf for temple visits", "Walking shoes (cobblestone paths)", "Insect repellent (near forest)", "Small daypack for safari"],
  },

  // ── KARNATAKA ─────────────────────────────────────────────────────────────
  {
    id: "hampi",
    name: "Hampi",
    state: "Karnataka",
    tagline: "Ruins of a Forgotten Empire",
    description: "Hampi is the magnificent ruined capital of the Vijayanagara Empire, a UNESCO World Heritage Site spread across 26 sq km of boulder-strewn landscape along the Tungabhadra River. More than 1,600 surviving structures include temples, royal pavilions, elephant stables, and stone chariots — the remains of what was once the world's second-largest medieval city.",
    image: "https://images.unsplash.com/photo-1695981152719-3fc012dc3da4?w=600&h=400&fit=crop&auto=format",
    heroImage: "https://images.unsplash.com/photo-1695981152719-3fc012dc3da4?w=900&h=600&fit=crop&auto=format",
    category: ["Heritage", "UNESCO", "Adventure", "Photography"],
    bestSeason: "October – February",
    duration: "3–4 days",
    highlights: ["Vittala Temple Stone Chariot", "Virupaksha Temple (still active)", "Matanga Hill sunrise", "Hippie Island (Virupapur Gaddi)", "Hampi Bazaar ruins"],
    transport: [
      { mode: "Train", icon: "🚂", fromDelhi: "Via Bengaluru/Hospet — 30h+", fromMumbai: "To Hospet Jn (HPT) — 18–20h via Pune", fromBangalore: "To Hospet Jn — 9h overnight (Hampi Express, Train #16592)", duration: "Hospet is 13 km from Hampi", costRange: "₹300–₹1,800", tips: "Hampi Express (Bangalore–Hospet, 16592) departs KSR Bengaluru at 10pm, arrives Hospet 6:55am. Perfect overnight — wake up in Hampi. Book sleeper or 3AC." },
      { mode: "Road", icon: "🚗", fromDelhi: "Via Bengaluru — 600+ km from Bengaluru", fromMumbai: "Via Pune/Solapur — 600 km", fromBangalore: "370 km, NH-48 + NH-67 — 7–8h drive or KSRTC bus", duration: "7–8h from Bengaluru", costRange: "₹400 KSRTC bus / ₹4,000–₆,000 cab", tips: "KSRTC Airavata (AC Volvo) from Bengaluru Majestic to Hospet departs 8pm, arrives 5am — cheaper than a guesthouse night! Book at ksrtc.in." },
      { mode: "Flight", icon: "✈️", fromDelhi: "Fly to Bengaluru (2h) + Hampi Express overnight", fromMumbai: "Fly to Bengaluru (1.5h) + Hampi Express overnight", fromBangalore: "No direct flight to Hampi — overnight train/bus", duration: "Fly to Bengaluru, then overnight train", costRange: "₹3,000–₈,000 flight + ₹400 train", tips: "The nearest airport is Bengaluru (375 km) or Hubli (170 km). Hubli has limited flights but much closer." },
    ],
    accommodation: [
      { type: "Guesthouses / Camps", priceRange: "₹400–₹1,200/night", examples: ["Mowgli Guest House", "Hampi's Boulders Hostel", "Gopi Guest House", "Shanthi Guest House"], description: "Basic rooms or tents in Hampi Bazaar and Hippie Island (Virupapur). Hammocks and rooftop beds available." },
      { type: "Mid-Range Stays", priceRange: "₹2,000–₅,000/night", examples: ["Evolve Back Hampi (Club Mahindra)", "Heritage Resort Hampi", "Kishkinda Heritage Resort"], description: "Comfortable AC rooms with pool; some on the river bank with views of boulders and ruins." },
      { type: "Luxury Boutique", priceRange: "₹12,000–₃5,000/night", examples: ["Evolve Back Kamalapura Palace", "Orange County Kabini (for pre/post trip)", "The Hampi Ritz"], description: "Unique luxury experiences within heritage settings; private plunge pools and guided heritage walks." },
    ],
    localTransport: [
      { mode: "Bicycle", cost: "₹80–₁50/day", notes: "Best way to explore — 26 sq km covered in a day on cycle", available: true },
      { mode: "Auto Rickshaw", cost: "₹150–₃00 half day", notes: "Negotiate for a full-day tour — saves time covering spread-out ruins", available: true },
      { mode: "Coracle (Putti)", cost: "₹50–₁00", notes: "Round wicker boats cross Tungabhadra to Hippie Island — unique experience", available: true },
      { mode: "Moped/Scooter", cost: "₹300–₄00/day", notes: "Best for independent exploration; available at Hospet and some Hampi shops", available: true },
    ],
    nearbyPlaces: [
      { name: "Vittala Temple Stone Chariot", distance: "2 km from Hampi Bazaar", type: "Iconic Monument", isHidden: false, image: "https://images.unsplash.com/photo-1651569213711-b29d1fc3f995?w=400&h=400&fit=crop&auto=format" },
      { name: "Hospet Town", distance: "13 km", type: "Gateway Town", isHidden: false },
      { name: "Daroji Bear Sanctuary", distance: "15 km", type: "Wildlife", isHidden: false },
      { name: "Tungabhadra Dam", distance: "5 km from Hospet", type: "Nature/Dam", isHidden: false },
      { name: "Anegundi Village (across river)", distance: "6 km by road", type: "Hidden Heritage Village", isHidden: true },
      { name: "Kamalapur Archaeological Museum", distance: "4 km", type: "Museum", isHidden: false },
    ],
    budgetBreakdown: [
      { tier: "budget", label: "Backpacker", perDayPerPerson: 800, accommodation: 350, food: 200, transport: 120, activities: 130 },
      { tier: "mid", label: "Comfortable", perDayPerPerson: 3500, accommodation: 2200, food: 700, transport: 300, activities: 300 },
      { tier: "luxury", label: "Heritage Resort", perDayPerPerson: 16000, accommodation: 12500, food: 2000, transport: 800, activities: 700 },
    ],
    defaultItinerary: [
      { day: 1, title: "Vittala Complex & Hampi Bazaar", morning: "Cycle to Vittala Temple complex — the Stone Chariot and musical pillars of the Vittala Temple are extraordinary. Arrive before 8am to beat tour groups.", afternoon: "Hampi Bazaar ruins and Virupaksha Temple (still an active temple; daily puja at 11am).", evening: "Sunset from Matanga Hill — 360° panoramic view of the entire ruined city and boulders. 30-min climb. Carry a torch for descent.", stay: "Guesthouse in Hampi Bazaar area", meals: "Mango lassi breakfast (₹60), thali lunch (₹100), rooftop dinner (₹200)", tips: "Buy the combined ticket (₹600 Indians/₹1,200 foreigners) for all major monuments." },
      { day: 2, title: "Royal Enclosure & Hippie Island", morning: "Royal Centre — Elephant Stables, Lotus Mahal, Hazara Rama Temple. Hire a guide (₹400) — these tell the stories of the empire's glory and fall.", afternoon: "Take a coracle (putti) across the Tungabhadra to Virupapur Gaddi (Hippie Island). Rent a scooter to explore banana plantations and paddy fields.", evening: "Sunset from Hippie Island's rooftop cafes — views of Hampi ruins across the river. Stay for dinner.", stay: "Hippie Island guesthouse (better view and quieter)", meals: "Hostel breakfast (₹80), island restaurant lunch (₹150), riverside dinner (₹250)", tips: "Last coracle back from Hippie Island: ~6:30pm. Check with boatmen." },
      { day: 3, title: "Boulder Walk & Anegundi", morning: "Self-guided boulder scramble in the southern plains — ancient inscriptions, hidden temples, and views unlike anywhere in India.", afternoon: "Boat/road to Anegundi village — the mythological Kishkinda where Ramayana events took place. Visit Anjani Parvata (Hanuman's birthplace).", evening: "Tungabhadra sunset with reflection of ruins in the water.", stay: "Check out or final night", meals: "Village lunch in Anegundi (₹80), packed snacks for bouldering", tips: "Wear proper shoes for boulder climbing — not sandals." },
    ],
    womenSafety: {
      score: 8,
      level: "Very Safe",
      highlights: ["International backpacker community creates safe, inclusive vibe", "Hippie Island is well-regarded for safety", "ASI and local police actively patrol heritage zones"],
      precautions: ["Remote boulder areas — go with at least one other person", "Hippie Island — last coracle at 6:30pm; don't miss it", "Hampi Bazaar at night is quiet and safe but poorly lit"],
      soloTips: ["Hampi has a large solo traveler culture — you'll make friends easily at guesthouses", "Join group cycling tours organized by guesthouses", "Hippie Island rooftop cafes are great for solo travelers — communal tables", "Most guesthouse owners will help with safety information and guide contacts"],
      emergencyContacts: [{ label: "Hampi Police", number: "08394-241244" }, { label: "Karnataka Tourist Helpline", number: "1800-425-5678" }, { label: "Emergency", number: "112" }],
      safeZones: ["Hampi Bazaar main street", "Vittala Temple approach road", "Hippie Island guesthouses"],
      avoidAreas: ["Isolated boulder fields after sunset alone", "Remote temple sites outside main circuit after 6pm"],
    },
    rating: 4.8,
    reviews: 9600,
    mustEat: ["Jolada Rotti (jowar flatbread)", "Bisi Bele Bath", "Mango Lassi at Mango Tree restaurant", "Set Dosa at local cafes", "Fresh sugarcane juice (₹20)"],
    packingTips: ["Good walking/trekking shoes — mandatory for bouldering", "Torch/headlamp (for early Matanga Hill climb)", "Sunscreen + hat (fully exposed ruins)", "Water bottle (2L+)", "Light cotton clothes", "Cycle lock if renting"],
  },

  {
    id: "mysuru",
    name: "Mysuru",
    state: "Karnataka",
    tagline: "The Cultural Capital of Karnataka",
    description: "Mysuru (Mysore) is the former seat of the Wadiyar Dynasty, a city of palaces, sandalwood, silk, and yoga. The Mysore Palace — one of India's most visited monuments — blazes with nearly 100,000 light bulbs every Sunday. Wide tree-lined boulevards, the Chamundi Hills temple, a centuries-old flower market, and the world's greatest yoga tradition make Mysuru a richly cultural destination.",
    image: "https://images.unsplash.com/photo-1659126574791-13313aa424bd?w=600&h=400&fit=crop&auto=format",
    heroImage: "https://images.unsplash.com/photo-1659126574791-13313aa424bd?w=900&h=600&fit=crop&auto=format",
    category: ["Heritage", "Culture", "Wellness", "History"],
    bestSeason: "October – February",
    duration: "2–3 days",
    highlights: ["Mysore Palace (Sunday illumination)", "Chamundi Hills & Nandi Bull", "Devaraja Flower Market", "Mysore Yoga tradition", "Dasara Festival (October)"],
    transport: [
      { mode: "Train", icon: "🚂", fromDelhi: "Via Bengaluru — 25h+ (Rajdhani to Bengaluru + 2h train)", fromMumbai: "Udyan Express to Bengaluru (24h) + Shatabdi to Mysuru (2h)", fromBangalore: "Shatabdi/Express — 2.5–3h (multiple daily trains)", duration: "2.5–3h from Bengaluru", costRange: "₹100–₆00 from Bengaluru", tips: "Shatabdi Express from Bengaluru (KSR to MYS) departs 11am. Kaveri Express at 7am is the budget option (Sleeper, ₹100)." },
      { mode: "Road", icon: "🚗", fromDelhi: "—", fromMumbai: "NH-48 + NH-275 — 12h from Bengaluru region", fromBangalore: "KSRTC AC bus from Majestic every 30 min, 3h — ₹200", duration: "3h from Bengaluru (140 km)", costRange: "₹200 KSRTC / ₹2,000–₃,000 cab", tips: "KSRTC Airavata (AC Volvo) from Bengaluru Majestic is the most comfortable and frequent option (every 20 min during peak hours)." },
      { mode: "Flight", icon: "✈️", fromDelhi: "Fly to Bengaluru (2h) + train/bus to Mysuru (3h)", fromMumbai: "Fly to Bengaluru (1.5h) + train/bus to Mysuru", fromBangalore: "No direct flights — Bengaluru airport to Mysuru is 3.5–4h", duration: "Total 6–8h via Bengaluru", costRange: "₹3,000–₁0,000 flight + ₹200–₃,000 onward", tips: "Mysuru has a small airport (MYQ) with limited Bengaluru connectivity. Fly to Bengaluru, then take KSRTC bus (₹200, very comfortable)." },
    ],
    accommodation: [
      { type: "Budget Lodges / Hostels", priceRange: "₹600–₁,500/night", examples: ["Zostel Mysore", "Hotel Siddharta", "Indra Bhavan", "Hotel Dasaprakash"], description: "Clean budget rooms near Mysore Palace and bus stand. Several have rooftop restaurants with Chamundi Hills views." },
      { type: "Heritage Hotels / Guesthouses", priceRange: "₹3,000–₈,000/night", examples: ["Windflower Spa & Resort", "Pai Vista Hotel", "Hotel Royal Orchid Metropole", "Stone Water Eco Resort"], description: "Colonial and heritage properties; some are former Wadiyar hunting lodges. Excellent value compared to northern India equivalents." },
      { type: "Luxury Resorts", priceRange: "₹12,000–₃5,000/night", examples: ["Radisson Blu Plaza Hotel", "Lalitha Mahal Palace Hotel (Taj)", "The Quorum Hotel"], description: "Lalitha Mahal Palace is a converted royal palace — staying here is a living Mysore royal experience." },
    ],
    localTransport: [
      { mode: "Auto Rickshaw", cost: "₹50–₂00", notes: "Metered autos are common and reliable in Mysuru", available: true },
      { mode: "KSRTC City Bus", cost: "₹10–₂5", notes: "Cheap and covers all tourist areas", available: true },
      { mode: "Ola/Uber", cost: "₹80–₃00", notes: "Well-connected, reliable for city trips", available: true },
      { mode: "Cycle/E-Bike Rental", cost: "₹150–₂50/day", notes: "City is flat and compact — cycling is pleasant", available: true },
    ],
    nearbyPlaces: [
      { name: "Srirangapatna", distance: "15 km", type: "Heritage Island Fort", isHidden: false },
      { name: "Brindavan Gardens", distance: "19 km", type: "Musical Fountain Gardens", isHidden: false },
      { name: "Nagarhole National Park", distance: "90 km", type: "Tiger Reserve / Wildlife", isHidden: false },
      { name: "Talakadu (Sand-buried temples)", distance: "45 km", type: "Hidden Archaeological Wonder", isHidden: true },
      { name: "Shivanasamudra Falls", distance: "80 km", type: "Hidden Waterfall", isHidden: true },
    ],
    budgetBreakdown: [
      { tier: "budget", label: "Backpacker", perDayPerPerson: 1000, accommodation: 500, food: 250, transport: 100, activities: 150 },
      { tier: "mid", label: "Comfortable", perDayPerPerson: 4500, accommodation: 2800, food: 900, transport: 400, activities: 400 },
      { tier: "luxury", label: "Palace Experience", perDayPerPerson: 18000, accommodation: 14000, food: 2500, transport: 800, activities: 700 },
    ],
    defaultItinerary: [
      { day: 1, title: "Mysore Palace & Devaraja Market", morning: "Mysore Palace opens 10am (arrive 9:30am). Inside: the Durbar Hall, golden howdah, and ornate rooms. Dress code: covered shoulders + legs.", afternoon: "Devaraja Flower Market — one of India's most photogenic. Jasmine garlands, marigolds, vendors since 1928.", evening: "Sunday evening illumination: 7–7:45pm (₹0 — best viewed from palace grounds). Or visit Jaganmohan Palace Art Gallery (6pm close).", stay: "Hotel near Mysore Palace / Sayyaji Rao Road area", meals: "Mysore pak at K.C. Das (₹20), dosa at Hotel Dasaprakash (₹80), set meal dinner (₹200)", tips: "Palace audio guide: ₹100 — gives historical context that makes each room meaningful." },
      { day: 2, title: "Chamundi Hills & Silk", morning: "Early Chamundi Hills drive (or walk 1,008 steps) — Chamundeshwari Temple and the giant Nandi Bull carved from a single rock.", afternoon: "Mysore Silk — visit Government Silk Weaving Factory on Mananthody Road to see traditional silk saree weaving.", evening: "Zoo (one of India's best; ₹100 entry, allow 2–3h). Or cycling through wide Bangalore–Mysore highway.", stay: "Same hotel", meals: "Temple prasad breakfast, silk factory canteen thali, Zoo canteen snacks", tips: "Mysore sandalwood soap (₹80–₂00) and Mysore incense (₹50) are the best souvenirs from the government store." },
    ],
    womenSafety: {
      score: 8,
      level: "Very Safe",
      highlights: ["Well-maintained and clean city", "Strong police presence at all tourist sites", "Yoga community creates safe, international atmosphere"],
      precautions: ["Avoid deserted areas at night", "Take registered autos or Ola/Uber"],
      soloTips: ["Mysuru is one of South India's safest cities for solo women", "Yoga Mysore community has excellent social networks for solo travelers", "KSRTC buses are safe and well-monitored"],
      emergencyContacts: [{ label: "Mysuru Police Control", number: "0821-2441151" }, { label: "Women Helpline", number: "1091" }, { label: "Emergency", number: "112" }],
      safeZones: ["Mysore Palace area", "Sayyaji Rao Road", "Chamundi Hills (till 7pm)"],
      avoidAreas: ["Isolated areas after 10pm"],
    },
    rating: 4.7,
    reviews: 11500,
    mustEat: ["Mysore Pak (K.C. Das — original recipe)", "Set Dosa", "Bisi Bele Bath", "Idli Vada Sambar", "Curd Rice with Mysore pickle", "Coconut ice cream"],
    packingTips: ["Comfortable walking shoes (palace has marble floors)", "Modest dress for temples and palace", "Sunscreen", "Camera (palace photography: ₹200 fee inside)", "Light cotton clothes"],
  },

  {
    id: "coorg",
    name: "Coorg",
    state: "Karnataka",
    tagline: "The Land of Coffee, Clouds & Kodava Pride",
    description: "Coorg (Kodagu district) is Karnataka's coffee heartland — a rolling highland at 900–1,900m altitude, draped in coffee, cardamom, and pepper plantations, and crisscrossed by waterfalls and rivers. Home to the fiercely proud Kodava people with their own language, cuisine, and martial tradition, Coorg is the perfect highland retreat: cool air, ancient forests, and the headwaters of the Cauvery River.",
    image: "https://images.unsplash.com/photo-1676140428072-62fa84ba5800?w=600&h=400&fit=crop&auto=format",
    heroImage: "https://images.unsplash.com/photo-1676140428072-62fa84ba5800?w=900&h=600&fit=crop&auto=format",
    category: ["Nature", "Wellness", "Adventure", "Culture"],
    bestSeason: "October – May (avoid June–August monsoon)",
    duration: "3–4 days",
    highlights: ["Abbey Falls", "Raja's Seat viewpoint", "Coffee Estate walks", "Dubare Elephant Camp", "Namdroling Monastery (Golden Temple)"],
    transport: [
      { mode: "Road", icon: "🚗", fromDelhi: "Fly to Bengaluru + road to Madikeri (5–6h)", fromMumbai: "Fly to Bengaluru + road to Madikeri (5–6h)", fromBangalore: "NH-275 + MD Rd to Madikeri — 265 km, 5.5–6h. KSRTC bus ₹350, daily.", duration: "5.5–6h from Bengaluru", costRange: "₹350 bus / ₹3,500–₄,500 cab from Bengaluru", tips: "No trains reach Coorg (Madikeri). Nearest station is Mysuru (120 km). Road is the only option — the drive through the Ghats is beautiful." },
      { mode: "Train", icon: "🚂", fromDelhi: "Train to Mysuru then 3h cab to Madikeri", fromMumbai: "Train to Mysuru then 3h cab (₹2,000)", fromBangalore: "KSRTC Night Bus from Bengaluru Majestic to Madikeri (9pm–4am)", duration: "8h (night bus from Bengaluru)", costRange: "₹350 KSRTC bus / ₹500–₁,800 train to Mysuru + cab", tips: "KSRTC night bus from Bengaluru (9pm) reaches Madikeri by 4am — economical and saves a night's accommodation." },
      { mode: "Flight", icon: "✈️", fromDelhi: "Fly to Bengaluru (2h) + road to Coorg (5h)", fromMumbai: "Fly to Mangaluru (1.5h) + road to Coorg (3.5h)", fromBangalore: "No airport in Coorg — Bengaluru is nearest (265 km)", duration: "Total 7–9h via Bengaluru", costRange: "₹3,000–₈,000 flight + ₹3,500 cab", tips: "Mangaluru airport (Bajpe) is an excellent alternative — 3.5h drive from Madikeri vs 5.5h from Bengaluru." },
    ],
    accommodation: [
      { type: "Coffee Estate Homestays", priceRange: "₹1,500–₃,000/night (incl. meals)", examples: ["Rainforest Retreat", "Coorg Citadel", "Silver Brooks Homestay", "Heritage Coorg"], description: "Stay in a planter's house surrounded by coffee bushes. Home-cooked Kodava food, plantation walks included. Best Coorg experience at any budget." },
      { type: "Mid-Range Resorts", priceRange: "₹5,000–₁2,000/night", examples: ["Orange County", "Amanvana Spa Resort", "Misty Valley Resort"], description: "Cottages in estates with pool, spa, and guided plantation walks. Popular for couples and families." },
      { type: "Luxury Retreats", priceRange: "₹18,000–₅0,000/night", examples: ["The Tamara Coorg", "Evolve Back Chikmagalur", "Vythiri Village Resort"], description: "Treehouse suites, infinity pools overlooking the Western Ghats, and private coffee plantation experiences." },
    ],
    localTransport: [
      { mode: "Rented Car / Self-drive", cost: "₹1,500–₂,500/day", notes: "Best way — Coorg's sites are spread across 4,000 sq km", available: true },
      { mode: "Cab (local Indica/SUV)", cost: "₹2,500–₃,500/day", notes: "Hire for full-day sightseeing with driver", available: true },
      { mode: "Auto Rickshaw", cost: "₹100–₂50", notes: "Available in Madikeri town for short trips", available: true },
    ],
    nearbyPlaces: [
      { name: "Abbey Falls", distance: "9 km from Madikeri", type: "Waterfall", isHidden: false },
      { name: "Dubare Elephant Camp", distance: "35 km", type: "Wildlife / Elephant interaction", isHidden: false },
      { name: "Namdroling Monastery", distance: "35 km (Kushalnagar)", type: "Buddhist Monastery (Golden Temple)", isHidden: false },
      { name: "Talacauvery (Cauvery source)", distance: "48 km", type: "Spiritual / Hidden Highland", isHidden: true },
      { name: "Iruppu Falls", distance: "80 km", type: "Hidden Waterfall", isHidden: true },
    ],
    budgetBreakdown: [
      { tier: "budget", label: "Backpacker", perDayPerPerson: 1500, accommodation: 800, food: 400, transport: 200, activities: 100 },
      { tier: "mid", label: "Comfortable", perDayPerPerson: 5500, accommodation: 3500, food: 1000, transport: 600, activities: 400 },
      { tier: "luxury", label: "Estate Luxury", perDayPerPerson: 22000, accommodation: 17000, food: 2500, transport: 1500, activities: 1000 },
    ],
    defaultItinerary: [
      { day: 1, title: "Arrive & Coffee Estate Walk", morning: "Arrive from Bengaluru. Check into your estate homestay. Afternoon coffee estate walk with the planter — see, smell, and pick coffee cherries.", afternoon: "Raja's Seat — a Kodava king's favourite sunset viewpoint (free entry). Rose garden below.", evening: "Home-cooked Kodava meal: Pandi Curry (pork), Koli Curry (chicken), Akki Rotti (rice bread). Traditional evening at the homestay.", stay: "Coffee estate homestay", meals: "Home-cooked meals included in most homestay packages", tips: "If vegetarian, inform your homestay in advance — Kodava cuisine is meat-heavy but they always have alternatives." },
      { day: 2, title: "Abbey Falls & Elephant Camp", morning: "Abbey Falls (9 km from Madikeri) — 70-foot falls surrounded by coffee and spice plantations. Arrive before 9am for minimal crowds.", afternoon: "Dubare Elephant Camp (35 km) — bathe elephants in the Cauvery River at 9am. Book ahead.", evening: "Namdroling Monastery (Kushalnagar) — the gilded Zangdog Palri Fo-Brang temple is breathtaking at sunset. Tibetan exile community.", stay: "Same homestay", meals: "Packed breakfast from homestay, lunch at Madikeri town, monastery canteen momos (₹60)", tips: "Elephant bathing at Dubare: ₹300. Book at junglelodges.com." },
      { day: 3, title: "Mandalpatti Peak & Return", morning: "Early jeep ride to Mandalpatti — through misty forest to a clifftop with panoramic views of the Ghats. Jeep only (₹1,500 shared).", afternoon: "Explore Madikeri market — Kodava honey, coffee powder, cardamom, pepper. Best buys to carry home.", evening: "Depart for Bengaluru overnight bus.", stay: "Check out", meals: "Tea at summit, market snacks", tips: "Mandalpatti jeep safari: book through hotel the previous evening." },
    ],
    womenSafety: {
      score: 8,
      level: "Very Safe",
      highlights: ["Kodava community is traditionally respectful toward women", "Homestay environment is family-oriented and safe", "Very low crime rate in Coorg"],
      precautions: ["Don't trek alone in dense forest areas", "Respect local customs at traditional Kodava events"],
      soloTips: ["Coffee estate homestays are ideal for solo women — warm, family-run environments", "Join group jeep safaris to Mandalpatti for social experiences", "Coorg has an active solo travel community — easy to connect at homestays"],
      emergencyContacts: [{ label: "Madikeri Police", number: "08272-228133" }, { label: "Women Helpline", number: "181" }, { label: "Emergency", number: "112" }],
      safeZones: ["Madikeri town", "All registered homestays", "Kushalnagar town"],
      avoidAreas: ["Dense jungle trails after sunset without a guide"],
    },
    rating: 4.7,
    reviews: 8900,
    mustEat: ["Pandi Curry (Kodava pork curry)", "Koli Curry (country chicken)", "Akki Rotti (rice flatbread)", "Coorg Honey (pure wildflower)", "Bamboo Shoot Curry", "Fresh-filter Coorg coffee"],
    packingTips: ["Light jacket / fleece (cool even in summer, 15–22°C)", "Raincoat (monsoon risk Oct–May)", "Trekking shoes", "Mosquito repellent", "Carry cash — very few ATMs outside Madikeri"],
  },

  {
    id: "gokarna",
    name: "Gokarna",
    state: "Karnataka",
    tagline: "Beaches, Boulders & a Sacred Bull Temple",
    description: "Gokarna sits at a unique intersection: an ancient pilgrimage town sacred to Shiva (the Mahabaleshwara Temple houses the pranalingam), surrounded by five pristine beaches that rival Goa at a fraction of the price and crowds. Half the town is devout pilgrims, half is backpackers — this unusual coexistence creates one of India's most distinctive coastal atmospheres.",
    image: "https://images.unsplash.com/photo-1587923623987-c7e4083beb23?w=600&h=400&fit=crop&auto=format",
    heroImage: "https://images.unsplash.com/photo-1587923623987-c7e4083beb23?w=900&h=600&fit=crop&auto=format",
    category: ["Beach", "Spiritual", "Adventure", "Nature"],
    bestSeason: "October – May",
    duration: "3–4 days",
    highlights: ["Om Beach (Om-shaped bay)", "Kudle Beach sunset", "Half Moon & Paradise Beaches (trekking)", "Mahabaleshwara Temple darshan", "Cliff jumping at Om Beach"],
    transport: [
      { mode: "Train", icon: "🚂", fromDelhi: "Via Mumbai/Mangaluru — Konkan Railway Cruise Exp to Gokarna Rd (GOK) — 2 days", fromMumbai: "Konkan Railway (Madgaon Exp or Matsyagandha Exp) to Gokarna Rd — 10–12h", fromBangalore: "Karwar Express or Matsyagandha Express — 8–9h overnight", duration: "8–10h from Bengaluru / 10–12h from Mumbai", costRange: "₹400–₁,800", tips: "Gokarna Road station is 9 km from town. Auto (₹200) or bus available. Konkan Railway is one of India's most scenic routes — coastal tunnel-and-bridge journey through the Western Ghats." },
      { mode: "Road", icon: "🚗", fromDelhi: "—", fromMumbai: "Via NH-66 coastal highway — 12–13h (scenic drive)", fromBangalore: "NH-75 via Mangaluru / NH-66 — 490 km, 9–10h", duration: "9–10h from Bengaluru", costRange: "₹600 KSRTC bus / ₹5,000 cab from Bengaluru", tips: "KSRTC night bus from Bengaluru (8:30pm–6am) to Gokarna is the budget option. Alternatively, bus to Goa and back-track to Gokarna (60 km north of Goa)." },
      { mode: "Flight", icon: "✈️", fromDelhi: "Fly to Goa (2h) + road to Gokarna (100 km, 2.5h)", fromMumbai: "Fly to Goa (1h) + bus/cab to Gokarna", fromBangalore: "Fly to Mangaluru (1h) + road (155 km, 3h)", duration: "4–5h total via Goa or Mangaluru", costRange: "₹2,000–₆,000 flight + ₹600 onward", tips: "Goa approach: take a KSRTC bus from Panjim to Karwar (₹200), then shared jeep to Gokarna (₹80). Total ₹280 from Goa." },
    ],
    accommodation: [
      { type: "Beach Huts / Hostels", priceRange: "₹500–₁,500/night", examples: ["Namaste Café Huts (Om Beach)", "Zostel Gokarna", "Shiva Prakash Guest House", "Nirvana Café huts"], description: "Bamboo huts on Om Beach and Kudle Beach — hammocks, beachfront, basic but perfectly atmospheric." },
      { type: "Mid-Range Beach Stays", priceRange: "₹2,500–₆,000/night", examples: ["CGH Earth Svasara", "Om Beach Resort", "Gokarna International Beach Resort"], description: "AC rooms with beach access; pool in some properties. Good for couples and families wanting comfort with beach proximity." },
      { type: "Boutique / Eco Resorts", priceRange: "₹8,000–₂0,000/night", examples: ["Svasara Jungle Lodge", "The Sitar Beach Resort", "Evolve Back Coorg (pre/post trip)"], description: "Eco-luxe with yoga, Ayurveda, and immersive coastal Karnataka experiences." },
    ],
    localTransport: [
      { mode: "Beach Trek (Walking)", cost: "Free", notes: "Om→Half Moon→Paradise Beach: 2h walk over clifftops — the most rewarding way to explore", available: true },
      { mode: "Auto Rickshaw", cost: "₹100–₂50", notes: "Town to beaches; negotiate return trip", available: true },
      { mode: "Boat (Om Beach to Half Moon)", cost: "₹100–₁50 pp", notes: "Avoid the cliff trek? Take the boat between beaches", available: true },
      { mode: "Scooter Rental", cost: "₹300–₄00/day", notes: "Good for exploring town and beaches; available near bus stand", available: true },
    ],
    nearbyPlaces: [
      { name: "Kudle Beach", distance: "1.5 km from town", type: "Calm, local beach", isHidden: false },
      { name: "Half Moon Beach", distance: "3 km trek from Om Beach", type: "Remote beach — no road access", isHidden: true },
      { name: "Paradise Beach", distance: "5 km trek", type: "Most isolated — truly pristine", isHidden: true },
      { name: "Mirjan Fort", distance: "21 km", type: "Ruined fort in jungle", isHidden: true },
      { name: "Yana Caves (Bhairaveshwara Rocks)", distance: "57 km", type: "Rock formation + caves", isHidden: false },
    ],
    budgetBreakdown: [
      { tier: "budget", label: "Backpacker", perDayPerPerson: 900, accommodation: 500, food: 250, transport: 80, activities: 70 },
      { tier: "mid", label: "Comfortable", perDayPerPerson: 4000, accommodation: 2500, food: 900, transport: 300, activities: 300 },
      { tier: "luxury", label: "Boutique Stay", perDayPerPerson: 14000, accommodation: 10000, food: 2500, transport: 800, activities: 700 },
    ],
    defaultItinerary: [
      { day: 1, title: "Mahabaleshwara Temple & Gokarna Beach", morning: "Morning darshan at Mahabaleshwara Temple (5:30am puja) — one of India's 7 most sacred Shiva temples. No photography inside. Dress conservatively.", afternoon: "Gokarna main beach and town. Wander the old streets — Brahmin settlement, temple tanks, ancient well.", evening: "Kudle Beach sunset. Beach shack dinner with fresh fish (₹250–₄00).", stay: "Beach hut on Om Beach or Kudle", meals: "Temple prasad breakfast (₹20), beach café lunch (₹150), fish thali dinner (₹300)", tips: "Gokarna beach itself is the pilgrims' bathing ghat — swimwear not appropriate here. Om Beach and Kudle Beach are the leisure beaches." },
      { day: 2, title: "Om Beach & Half Moon Trek", morning: "Om Beach — swim, kayak (₹300/h), cliff jump (if experienced). The natural Om shape is visible from the cliffs above.", afternoon: "Trek over the headland to Half Moon Beach (45 min) and continue to Paradise Beach (another 30 min). Pack water and snacks.", evening: "Return by boat from Om Beach (₹150). Sunset yoga at any of the beach cafes.", stay: "Beach hut", meals: "Beach café breakfast (₹100), packed snacks for trek, fresh seafood dinner (₹400)", tips: "Trek to Half Moon is rocky and steep in parts — wear shoes, not flip flops. Take 2L water." },
    ],
    womenSafety: {
      score: 7,
      level: "Safe",
      highlights: ["International backpacker community creates inclusive environment", "Pilgrim town culture means relatively conservative — less harassment than Goa party beaches"],
      precautions: ["Don't trek to remote beaches alone after 4pm", "Cliff paths are treacherous in wet weather — avoid after rain", "Dress modestly in town areas"],
      soloTips: ["Excellent solo destination — beach café culture makes it easy to meet fellow travelers", "Stay on Om Beach where there are always people", "Join organized beach trek groups from your guesthouse"],
      emergencyContacts: [{ label: "Gokarna Police", number: "08386-256333" }, { label: "Karnataka Helpline", number: "1800-425-5678" }, { label: "Emergency", number: "112" }],
      safeZones: ["Om Beach (always populated)", "Town center", "Kudle Beach (busy until sunset)"],
      avoidAreas: ["Half Moon and Paradise beach after sunset alone", "Deserted cliff paths in the dark"],
    },
    rating: 4.6,
    reviews: 7200,
    mustEat: ["Fresh Fish Thali (beach shacks, ₹200–₃50)", "Coconut Prawn Curry", "Goli Bajji (Mangalorean snack)", "Uttapam with coconut chutney", "Fresh coconut water (₹30)"],
    packingTips: ["Reef-safe sunscreen", "Trekking shoes (cliff paths)", "2L water bottle", "Light cotton + swimwear", "Cash only on beaches (no ATMs)", "Insect repellent"],
  },

  {
    id: "kabini",
    name: "Kabini",
    state: "Karnataka",
    tagline: "Where the Black Panther Hunts",
    description: "Kabini, on the southern edge of Nagarhole National Park, is one of India's finest wildlife destinations and home to the world's most documented Black Panther — a melanistic leopard named Saya, whose sightings have made Kabini globally famous. The Kabini backwater reservoir draws enormous concentrations of wildlife at its banks — large elephant herds, gaur, spotted deer, and predators including tigers and the legendary black panther.",
    image: "https://images.unsplash.com/photo-1634874587938-08ca3a5f1a48?w=600&h=400&fit=crop&auto=format",
    heroImage: "https://images.unsplash.com/photo-1634874587938-08ca3a5f1a48?w=900&h=600&fit=crop&auto=format",
    category: ["Wildlife", "Nature", "Adventure", "Photography"],
    bestSeason: "October – May (best wildlife: February – May)",
    duration: "2–3 days",
    highlights: ["Black Panther (melanistic leopard) sightings", "Large elephant herd crossings at reservoir", "Kabini boat safari", "Tiger sightings in Nagarhole", "Night wildlife sounds from riverside camp"],
    transport: [
      { mode: "Road", icon: "🚗", fromDelhi: "Fly to Bengaluru + 230 km drive (5h)", fromMumbai: "Fly to Bengaluru + road", fromBangalore: "NH-212 → Kabini (Kakkabe/Karapura) — 230 km, 5h drive or cab", duration: "5h from Bengaluru", costRange: "₹3,500–₅,000 cab from Bengaluru", tips: "There is NO public transport to Kabini resort zone. A cab from Bengaluru is the only option unless you have your own vehicle. Most resorts offer pickup: ₹4,000–₆,000 from Bengaluru." },
      { mode: "Train", icon: "🚂", fromDelhi: "Train to Mysuru (or Bengaluru) + 90 km cab", fromMumbai: "Train to Mysuru + 90 km cab", fromBangalore: "Train to Mysuru (2.5h), then cab to Kabini (90 km, 2.5h)", duration: "5–6h total (train + cab)", costRange: "₹200 train + ₹2,000 cab from Mysuru", tips: "Train to Mysuru (₹100–₆00) + cab from Mysuru to Kabini (₹1,800–₂,500) is the budget-friendliest approach without a full Bengaluru cab." },
      { mode: "Flight", icon: "✈️", fromDelhi: "Fly to Bengaluru (2h) + road (5h)", fromMumbai: "Fly to Bengaluru (1.5h) + road", fromBangalore: "Bengaluru airport to Kabini — 260 km, 5h cab", duration: "7–8h total from major cities", costRange: "₹3,000–₈,000 flight + ₹4,000 cab", tips: "Fly to Bengaluru, then pre-book a resort cab transfer. Most premium lodges include airport pickup in packages." },
    ],
    accommodation: [
      { type: "JLRDA Forest Lodges", priceRange: "₹2,500–₆,000/night (incl. safaris)", examples: ["Jungle Lodges River Tern Lodge", "Kabini Forest Lodge"], description: "Government-run lodges inside the buffer zone. Safaris included. Book at junglelodges.com — sells out 90 days ahead. Best value-to-experience ratio in Indian wildlife." },
      { type: "Mid-Range Eco Resorts", priceRange: "₹6,000–₁5,000/night", examples: ["Kabini River Lodge", "Waterwoods Lodge", "Bison River Resort"], description: "Private resorts on the reservoir bank. Boat safaris, evening campfire, and excellent wildlife guides." },
      { type: "Premium Wildlife Lodges", priceRange: "₹20,000–₆0,000/night", examples: ["Orange County Kabini", "Evolve Back Kuruba Safari Lodge", "Taj Kabini"], description: "Luxury tented camps and private villas with personal naturalist guides; photography hides and private boat safaris." },
    ],
    localTransport: [
      { mode: "Resort Jeep Safari", cost: "₹2,000–₄,000 pp (shared)", notes: "Morning and evening safaris are mandatory booking — limited slots inside national park", available: true },
      { mode: "Boat Safari", cost: "₹1,500–₂,500 pp", notes: "Evening boat on Kabini reservoir — elephants, otters, gharials, kingfishers", available: true },
      { mode: "Nature Walk", cost: "₹500 guide fee", notes: "Guided walks in the buffer zone; best for birds and smaller wildlife", available: true },
    ],
    nearbyPlaces: [
      { name: "Nagarhole National Park Core Zone", distance: "Inside Kabini buffer", type: "Tiger Reserve", isHidden: false },
      { name: "Wayanad (Kerala)", distance: "75 km", type: "Cross-border Wildlife Area", isHidden: false },
      { name: "Mysuru", distance: "90 km", type: "City / Heritage", isHidden: false },
      { name: "Bandipur Tiger Reserve", distance: "80 km via Nanjangud", type: "Connected Tiger Reserve", isHidden: false },
      { name: "Iruppu Falls (Brahmagiri Wildlife Sanctuary)", distance: "60 km", type: "Hidden Waterfall + Wildlife", isHidden: true },
    ],
    budgetBreakdown: [
      { tier: "budget", label: "Forest Lodge", perDayPerPerson: 3500, accommodation: 2200, food: 500, transport: 500, activities: 300 },
      { tier: "mid", label: "Eco Resort", perDayPerPerson: 9000, accommodation: 6500, food: 1200, transport: 700, activities: 600 },
      { tier: "luxury", label: "Premium Lodge", perDayPerPerson: 28000, accommodation: 22000, food: 3000, transport: 1500, activities: 1500 },
    ],
    defaultItinerary: [
      { day: 1, title: "Arrive & Evening Boat Safari", morning: "Arrive from Bengaluru/Mysuru. Resort check-in, lunch.", afternoon: "Evening boat safari on Kabini reservoir (3:30pm–5:30pm) — crocodiles, kingfishers, otters, and large elephant herds coming to drink at dusk.", evening: "Campfire at the lodge. Naturalist briefing on black panther behavior and tracking.", stay: "Riverside eco resort or JLRDA lodge", meals: "All-inclusive at most Kabini lodges", tips: "Evening golden hour at the reservoir is extraordinary for photography — bring a telephoto lens." },
      { day: 2, title: "Jeep Safari & Black Panther Tracking", morning: "6am jeep safari into Nagarhole — the black panther is most active at dawn. Your naturalist guide will know recent sighting locations.", afternoon: "Rest + forest walk. Kabini is home to 250+ bird species — morning or evening is peak birding time.", evening: "Second evening boat safari. The water's edge at dusk brings out the most wildlife.", stay: "Same lodge", meals: "All-inclusive", tips: "Black panther sightings are never guaranteed — Kabini has the highest sighting rate in India but it's still wild. If you see it, consider yourself privileged." },
    ],
    womenSafety: {
      score: 9,
      level: "Very Safe",
      highlights: ["Resort-based stays with staff presence 24/7", "Wildlife reserves have armed forest guards", "International wildlife tourism creates respectful environment"],
      precautions: ["Never walk outside your lodge after dark unescorted — wild animals are present", "Book verified resorts only"],
      soloTips: ["Kabini is extremely safe for solo women in resort context", "Group safaris make it easy to meet fellow wildlife enthusiasts", "Staff at all lodges are experienced with solo travelers"],
      emergencyContacts: [{ label: "Nagarhole Forest Dept", number: "08228-252041" }, { label: "Karnataka Tourism", number: "1800-425-5678" }, { label: "Emergency", number: "112" }],
      safeZones: ["All registered resorts", "Forest department zones", "Resort dining and common areas"],
      avoidAreas: ["Outside resort boundaries after dark — seriously, wild animals are present"],
    },
    rating: 4.9,
    reviews: 5800,
    mustEat: ["Coorg Pandi Curry (served at most lodges)", "Ragi Mudde with Saaru (local staple)", "Kerala-style fish curry (Wayanad influence)", "Fresh forest honey (buy from local tribes)"],
    packingTips: ["Neutral / muted colours only (no bright/white — disturbs wildlife)", "Binoculars — essential", "Telephoto camera lens", "Mosquito repellent DEET 30%+", "Closed shoes (never sandals in forest)"],
  },
  // Andhra Pradesh's official tourism site (tourism.ap.gov.in) has a
  // broken SSL certificate (misconfigured to a different domain's cert),
  // so it could not be fetched directly. Visakhapatnam and Tirupati below
  // are built from general public sources (Incredible India, TTD's own
  // published info, established travel guides) instead — same
  // sourcing standard as this file's other pre-existing destinations, not
  // the stricter single-source-only standard used for the Andaman entry.
  {
    id: "vizag",
    name: "Visakhapatnam",
    state: "Andhra Pradesh",
    tagline: "The Jewel of the East Coast",
    description: "Visakhapatnam (Vizag) is a port city where the Eastern Ghats meet the Bay of Bengal — a working city with a beach-town soul. Long promenades, a hilltop park with a cable car, a decommissioned submarine you can walk through, and some of the east coast's cleanest beaches make it an easy, uncrowded coastal break.",
    image: "https://images.unsplash.com/photo-1753187815676-f97de6508d91?w=600&h=400&fit=crop&auto=format",
    heroImage: "https://images.unsplash.com/photo-1753187815676-f97de6508d91?w=900&h=600&fit=crop&auto=format",
    category: ["Beach", "Nature", "Coastal"],
    bestSeason: "November – February",
    duration: "3–4 days",
    highlights: ["RK Beach (Ramakrishna Beach) promenade", "Kailasagiri hilltop park & cable car", "INS Kursura Submarine Museum", "Rushikonda Beach", "Bheemili (Bheemunipatnam) Beach"],
    transport: [
      { mode: "Flight", icon: "✈️", fromDelhi: "Direct to Visakhapatnam Airport (VTZ)", fromMumbai: "Direct to VTZ", fromBangalore: "Direct to VTZ", duration: "2–2.5h", costRange: "₹3,500–₹12,000", tips: "Airport is ~12 km from the city centre; cabs available outside arrivals." },
      { mode: "Train", icon: "🚂", fromDelhi: "Via Visakhapatnam Junction — well connected", fromMumbai: "Via Visakhapatnam Junction", fromBangalore: "Via Visakhapatnam Junction", duration: "Varies by route", costRange: "₹500–₹3,000", tips: "Visakhapatnam Junction is the main rail hub, connected to Hyderabad, Chennai, Kolkata, and Delhi." },
      { mode: "Road", icon: "🚗", fromDelhi: "—", fromMumbai: "—", fromBangalore: "APSRTC & private buses from nearby AP/Telangana cities", duration: "Varies", costRange: "₹400–₹1,500", tips: "Good APSRTC network within Andhra Pradesh; less practical from farther states." },
    ],
    accommodation: [
      {
        type: "Budget Hotels", priceRange: "₹1,200–₹2,800/night (estimate)",
        examples: ["The Beacon Hotel Visakhapatnam", "Hotel Ocean Vista Bay", "Treebo Lalitha, RK Beach"],
        description: "Simple hotels within walking distance of RK Beach.",
        venues: [
          { name: "The Beacon Hotel Visakhapatnam", location: "Near RK Beach", mapsQuery: "The Beacon Hotel Visakhapatnam RK Beach" },
          { name: "Hotel Ocean Vista Bay", location: "Near RK Beach", mapsQuery: "Hotel Ocean Vista Bay Visakhapatnam" },
          { name: "Treebo Lalitha, RK Beach", location: "RK Beach Road", mapsQuery: "Treebo Lalitha RK Beach Visakhapatnam" },
        ],
        sourceNote: "Real, currently-operating hotels per public travel-booking listings — not sourced from tourism.ap.gov.in (unreachable, broken SSL certificate). Rates are an estimate, not an official figure.",
      },
      {
        type: "Mid-Range Hotels", priceRange: "₹4,500–₹9,000/night (estimate)",
        examples: ["Radisson Blu Resort Visakhapatnam", "Fairfield by Marriott Visakhapatnam", "Hotel Rio Beach"],
        description: "3–4 star beach-adjacent chain hotels with pools and sea views.",
        venues: [
          { name: "Radisson Blu Resort, Visakhapatnam", mapsQuery: "Radisson Blu Resort Visakhapatnam" },
          { name: "Fairfield by Marriott Visakhapatnam", mapsQuery: "Fairfield by Marriott Visakhapatnam" },
        ],
        sourceNote: "Rates are an estimate, not an official figure.",
      },
      {
        type: "Luxury Hotels", priceRange: "₹10,000–₹25,000/night (estimate)",
        examples: ["Novotel Visakhapatnam Varun Beach", "Four Points by Sheraton Visakhapatnam"],
        description: "5-star beachfront properties.",
        venues: [{ name: "Novotel Visakhapatnam Varun Beach", mapsQuery: "Novotel Visakhapatnam Varun Beach" }],
        sourceNote: "Rates are an estimate, not an official figure.",
      },
    ],
    localTransport: [
      { mode: "App Cab (Ola/Uber)", cost: "₹100–₹400", notes: "Widely available across the city", available: true },
      { mode: "Auto Rickshaw", cost: "₹50–₹250", notes: "Negotiate fare or ask for meter", available: true },
      { mode: "APSRTC City Bus", cost: "₹10–₹40", notes: "Covers the main beach road and city routes", available: true },
      { mode: "Cable Car (Kailasagiri)", cost: "₹75 one-way (approx.)", notes: "Up to the Kailasagiri hilltop park", available: true },
    ],
    nearbyPlaces: [
      { name: "Araku Valley", distance: "115 km", type: "Hill Station & Coffee Country", isHidden: false },
      { name: "Borra Caves", distance: "90 km", type: "Limestone Caves", isHidden: true },
      { name: "Simhachalam Temple", distance: "16 km", type: "Hilltop Temple", isHidden: false },
    ],
    budgetBreakdown: [
      { tier: "budget", label: "Backpacker", perDayPerPerson: 1600, accommodation: 900, food: 400, transport: 200, activities: 100 },
      { tier: "mid", label: "Comfortable", perDayPerPerson: 5500, accommodation: 3800, food: 900, transport: 400, activities: 400 },
      { tier: "luxury", label: "Beachfront", perDayPerPerson: 14000, accommodation: 10500, food: 1800, transport: 700, activities: 1000 },
    ],
    defaultItinerary: [
      { day: 1, title: "RK Beach & Submarine Museum", morning: "Walk the RK Beach promenade. INS Kursura Submarine Museum — walk through a real decommissioned Indian Navy submarine (₹40 entry).", afternoon: "Visakha Museum and the beach-road aquarium nearby.", evening: "Sunset at RK Beach; street food along the promenade.", stay: "City hotel near RK Beach", meals: "Andhra thali (₹200), beach-road street food (₹150)", tips: "The submarine museum interior is narrow and low — not ideal if you're claustrophobic." },
      { day: 2, title: "Kailasagiri & Rushikonda", morning: "Kailasagiri hilltop park via cable car — panoramic views over the city and coast.", afternoon: "Rushikonda Beach — calmer and cleaner than RK Beach, good for a swim.", evening: "Bheemili (Bheemunipatnam) Beach for a quieter sunset.", stay: "Same hotel", meals: "Seafood lunch near Rushikonda (₹350)", tips: "Cable car queues build up on weekends — go early." },
      { day: 3, title: "Araku Valley Day Trip", morning: "Early train or drive to Araku Valley (the Araku toy-train route via the Eastern Ghats is a scenic option).", afternoon: "Borra Caves en route — dramatic limestone caverns.", evening: "Return to Visakhapatnam by evening.", stay: "Same hotel", meals: "Local Araku coffee, tribal-style lunch (₹300)", tips: "The Vizag–Araku train ride itself is a big part of the appeal — book in advance." },
    ],
    womenSafety: {
      score: 8,
      level: "Very Safe",
      highlights: ["Established coastal city with steady tourist footfall", "RK Beach promenade is lit and populated into the evening", "Good hotel and hospital infrastructure"],
      precautions: ["Avoid swimming at unmanned/unmarked beach stretches", "Use app-cabs after dark rather than unmarked autos"],
      soloTips: ["Comfortable for solo travel — well-established as a domestic tourist city", "Beach promenade and Kailasagiri are both easy solo daytime outings"],
      emergencyContacts: [{ label: "Police", number: "100" }, { label: "Women Helpline", number: "181" }, { label: "Emergency", number: "112" }],
      safeZones: ["RK Beach promenade", "Kailasagiri park", "MVP Colony / main city area"],
      avoidAreas: ["Isolated beach stretches after dark"],
    },
    rating: 4.6,
    reviews: 4200,
    mustEat: ["Andhra-style fish pulusu", "Bongulo chicken (bamboo-smoked)", "Royyala iguru (prawn curry)", "Filter coffee at an Araku-coffee cafe"],
    packingTips: ["Light cottons — humid coastal climate", "Sunscreen", "Comfortable walking shoes for the promenade and Kailasagiri", "Light jacket if heading up to Araku Valley"],
  },
  {
    id: "tirupati",
    name: "Tirupati",
    state: "Andhra Pradesh",
    tagline: "India's Most-Visited Pilgrimage Town",
    description: "Tirupati sits at the base of the Tirumala hills, home to the Sri Venkateswara Temple — one of the most-visited religious sites in the world. The pilgrimage is highly organised: TTD (Tirumala Tirupati Devasthanams) runs the temple, accommodation, and free meals for pilgrims at genuinely massive scale.",
    image: "https://images.unsplash.com/photo-1741003415192-ea5c163aadd4?w=600&h=400&fit=crop&auto=format",
    heroImage: "https://images.unsplash.com/photo-1741003415192-ea5c163aadd4?w=900&h=600&fit=crop&auto=format",
    category: ["Spiritual", "Heritage"],
    bestSeason: "September – February",
    duration: "1–2 days",
    highlights: ["Sri Venkateswara Temple, Tirumala", "Alipiri Mettu / Srivari Mettu step-climb", "Sri Venkateswara Zoological Park", "Talakona Waterfall", "TTD museums on the hill"],
    transport: [
      { mode: "Flight", icon: "✈️", fromDelhi: "Direct to Tirupati Airport (TIR)", fromMumbai: "Direct to TIR", fromBangalore: "Direct to TIR", duration: "1.5–2.5h", costRange: "₹3,000–₹10,000", tips: "Tirupati Airport (Renigunta) is ~15 km from Tirupati city, ~30 km from Tirumala. Direct flights from Delhi, Mumbai, Hyderabad, Kolkata, and Vizag on IndiGo/Air India." },
      { mode: "Train", icon: "🚂", fromDelhi: "Via Tirupati Main / Renigunta station", fromMumbai: "Via Tirupati Main / Renigunta station", fromBangalore: "Via Tirupati Main / Renigunta station", duration: "Varies by route", costRange: "₹300–₹2,000", tips: "Three stations serve the area — Renigunta, Tirupati Main, and Anantarajupet. Popular trains: Tirumala Express and Sapthagiri Express, both from Chennai (~3h)." },
      { mode: "Road", icon: "🚗", fromDelhi: "—", fromMumbai: "—", fromBangalore: "APSRTC buses from Chennai/Bangalore/Hyderabad", duration: "Tirupati–Tirumala: ~1h by ghat road", costRange: "₹50 (APSRTC bus, Tirupati to Tirumala)", tips: "From Tirupati town, APSRTC buses run every ~5 minutes up the ghat road to Tirumala. Pilgrims on foot climb via Alipiri Mettu (7 km) or the shorter Srivari Mettu (2 km) and get a free Divya Darshanam token at the top." },
    ],
    accommodation: [
      {
        type: "TTD Guest Houses (Official)", priceRange: "Free – ₹1,000/night (per TTD's own published rates)",
        examples: ["Srinivasam", "Vishnu Nivasam", "Madhavam"],
        description: "TTD's own accommodation complexes near Tirupati railway station — official, secure, walkable, and the standard choice for most pilgrims. On the hill at Tirumala itself, TTD rooms are far harder to get.",
        venues: [
          { name: "Srinivasam", location: "Near Tirupati Railway Station", mapsQuery: "Srinivasam TTD Tirupati" },
          { name: "Vishnu Nivasam", location: "Near Tirupati Railway Station", mapsQuery: "Vishnu Nivasam TTD Tirupati" },
          { name: "Madhavam", location: "Near Tirupati Railway Station", mapsQuery: "Madhavam TTD Tirupati" },
        ],
        sourceNote: "Real TTD-run complexes, per TTD's own public information — not sourced from tourism.ap.gov.in (unreachable, broken SSL certificate). Book via the official TTD website/app; rates and availability change with demand.",
      },
      {
        type: "Private Hotels (Tirupati town)", priceRange: "₹1,500–₹6,000/night (estimate)",
        examples: ["Multiple private hotels around the railway station and bus stand"],
        description: "A realistic fallback when TTD accommodation is full, especially in peak pilgrimage season.",
        sourceNote: "No specific venue names verified for this entry — rates are an estimate, not an official figure.",
      },
    ],
    localTransport: [
      { mode: "APSRTC Bus (Tirupati–Tirumala)", cost: "₹50", notes: "Runs every ~5 minutes from the Central Bus Stand; ~1h via ghat road", available: true },
      { mode: "Step climb (Alipiri Mettu)", cost: "Free", notes: "7 km on foot; free Divya Darshanam token on arrival", available: true },
      { mode: "Step climb (Srivari Mettu)", cost: "Free", notes: "Shorter, steeper 2 km route", available: true },
      { mode: "App Cab / Auto (Tirupati town)", cost: "₹80–₹300", notes: "For getting around Tirupati town itself", available: true },
    ],
    nearbyPlaces: [
      { name: "Sri Venkateswara Zoological Park", distance: "In Tirupati town", type: "Zoo & Nature Park", isHidden: false },
      { name: "Talakona Waterfall", distance: "~50 km", type: "Andhra Pradesh's tallest waterfall", isHidden: true },
      { name: "Chandragiri Fort", distance: "~15 km", type: "Historic Fort", isHidden: true },
    ],
    budgetBreakdown: [
      { tier: "budget", label: "Pilgrim (TTD)", perDayPerPerson: 800, accommodation: 200, food: 200, transport: 300, activities: 100 },
      { tier: "mid", label: "Comfortable", perDayPerPerson: 3000, accommodation: 1800, food: 500, transport: 500, activities: 200 },
      { tier: "luxury", label: "Private Hotel + Special Darshan", perDayPerPerson: 8000, accommodation: 5000, food: 800, transport: 700, activities: 1500 },
    ],
    defaultItinerary: [
      { day: 1, title: "Arrival & Tirumala Darshan", morning: "Arrive Tirupati. Check into TTD accommodation (Srinivasam/Vishnu Nivasam) if pre-booked, or head straight up via APSRTC bus (₹50, ~1h).", afternoon: "Free Sarva Darshan queue (can run several hours) or pre-booked Special Darshan (₹300–₹500) at Sri Venkateswara Temple.", evening: "Explore Tirumala's temple complex and TTD museums.", stay: "TTD guest house or Tirupati town hotel", meals: "Free TTD prasadam/annadanam, or local Andhra meals in town (₹150)", tips: "Book darshan tickets via the official TTD app/website ahead of time — it saves hours of queueing." },
      { day: 2, title: "Talakona & Chandragiri", morning: "Day trip to Talakona Waterfall (~50 km) — Andhra Pradesh's tallest waterfall, in a reserve forest.", afternoon: "Chandragiri Fort — Vijayanagara-era fort and palace museum.", evening: "Return to Tirupati town for departure.", stay: "Same", meals: "Local Andhra thali (₹200)", tips: "Hire a car for the Talakona/Chandragiri loop — limited public transport to either." },
    ],
    womenSafety: {
      score: 8,
      level: "Very Safe",
      highlights: ["Extremely high security presence — one of India's most heavily managed pilgrimage sites", "TTD accommodation is gated and monitored", "Constant crowds mean you're rarely alone"],
      precautions: ["Keep track of belongings in queue crowds", "Use official TTD counters/app for bookings — avoid unofficial ticket touts"],
      soloTips: ["Very manageable solo — queue systems and TTD infrastructure are built for large volumes of individual pilgrims", "TTD guest houses are a safe, straightforward base"],
      emergencyContacts: [{ label: "Police", number: "100" }, { label: "Women Helpline", number: "181" }, { label: "Emergency", number: "112" }],
      safeZones: ["TTD accommodation complexes", "Temple complex on the hill", "Main Tirupati town"],
      avoidAreas: ["Unofficial ticket/darshan touts outside official TTD counters"],
    },
    rating: 4.8,
    reviews: 12400,
    mustEat: ["TTD Tirupati laddu (temple prasadam)", "Andhra-style pulihora", "Pongal at a Tirupati town mess", "Filter coffee"],
    packingTips: ["Comfortable clothes for long queue waits", "ID proof — needed for darshan booking/verification", "Modest clothing (temple dress code applies)", "Water bottle for the step-climb routes"],
  },
  // Sourced from arunachaltourism.com (homepage, the Tezpur–Bhalukpong–
  // Bomdila–Tawang circuit page, and the official state Hotel List PDF
  // linked from the accommodation page) — real how-to-reach, permit, and
  // hotel-registry facts. The site does not publish room rates anywhere
  // (homepage, circuit page, or the hotel-registry PDF), so none are
  // invented; accommodation priceRange below is explicitly marked as an
  // estimate. Tawang is the flagship destination of Arunachal's most
  // detailed circuit — kept as one curated entry rather than one per
  // circuit town, per the "select few per state" approach discussed.
  {
    id: "tawang",
    name: "Tawang",
    state: "Arunachal Pradesh",
    tagline: "A Himalayan Monastery Town on the Roof of India",
    description: "Tawang sits at 10,000 ft in the far northwest of Arunachal Pradesh, home to India's largest monastery and one of the most dramatic high-Himalayan road journeys in the country — via the Sela Pass, past glacial lakes and pine forests, right up to the Tibetan border region.",
    image: "https://images.unsplash.com/photo-1633728476110-9827024ed86b?w=600&h=400&fit=crop&auto=format",
    heroImage: "https://images.unsplash.com/photo-1633728476110-9827024ed86b?w=900&h=600&fit=crop&auto=format",
    category: ["Heritage", "Nature", "Spiritual"],
    bestSeason: "March – October (Sela Pass can close in heavy winter snow)",
    duration: "5–7 days",
    highlights: ["Tawang Monastery (17th century, 10,000 ft)", "Sela Pass", "Shonga-tser Lake (Madhuri Lake)", "Bomdila monasteries & craft centres", "Sessa Orchid Sanctuary"],
    transport: [
      { mode: "Flight + Road", icon: "✈️", fromDelhi: "Fly to Guwahati, then ~11h drive to Tawang", fromMumbai: "Fly to Guwahati, then ~11h drive to Tawang", fromBangalore: "Fly to Guwahati, then ~11h drive to Tawang", duration: "11h drive from Guwahati", costRange: "₹3,500–₹12,000 (flight) + ₹4,000–₹8,000 (cab/shared sumo)", tips: "Lokpriya Gopinath Bordoloi International Airport, Guwahati is the nearest airport — there's no airport in Tawang itself. Break the drive into 2 days via Bomdila or Dirang rather than doing it in one go." },
      { mode: "Train", icon: "🚂", fromDelhi: "Via Naharlagun/Itanagar station", fromMumbai: "Via Naharlagun/Itanagar station", fromBangalore: "Via Naharlagun/Itanagar station", duration: "~4h Naharlagun to Bhalukpong, then onward by road", costRange: "₹500–₹2,500", tips: "Naharlagun (near Itanagar) is the nearest railhead — daily trains to Guwahati, plus a twice-weekly Rajdhani Express." },
      { mode: "Road", icon: "🚗", fromDelhi: "—", fromMumbai: "—", fromBangalore: "Tezpur (Assam) to Tawang — 350 km via Bhalukpong, Bomdila, Dirang, Sela Pass", duration: "~10–12h drive (best split over 2 days)", costRange: "₹5,000–₹10,000 (hired cab, one-way)", tips: "This is the classic overland route and the most scenic way in — Sela Pass (13,700 ft) is the highlight but can close briefly after heavy snowfall." },
    ],
    accommodation: [
      {
        type: "Registered Hotels — Tawang Town", priceRange: "₹1,500–₹5,000/night (estimate)",
        examples: ["Vivanta Tawang", "Tashi Gatsel", "Gakyi Khang Zhang", "Tawang Heights", "Kalawangpo"],
        description: "From the official state Hotel List — Tawang district alone has 100+ registered hotels; these are among the larger registered properties by room count.",
        venues: [
          { name: "Vivanta Tawang", location: "Tawang town", mapsQuery: "Vivanta Tawang Arunachal Pradesh" },
          { name: "Tashi Gatsel", location: "Tawang town", mapsQuery: "Hotel Tashi Gatsel Tawang" },
          { name: "Gakyi Khang Zhang", location: "Tawang town", mapsQuery: "Hotel Gakyi Khang Zhang Tawang" },
          { name: "Tawang Heights", location: "Tawang town", mapsQuery: "Hotel Tawang Heights Tawang" },
          { name: "Kalawangpo", location: "Tawang town", mapsQuery: "Hotel Kalawangpo Tawang" },
        ],
        sourceNote: "Real, currently-registered hotels per the Arunachal Pradesh Tourism official Hotel List (PDF, arunachaltourism.com). No rates are published anywhere on the official site — the range above is an estimate, not an official figure.",
      },
      {
        type: "Registered Hotels — Bomdila / West Kameng (en route)", priceRange: "₹1,200–₹4,000/night (estimate)",
        examples: ["Hotel Siphiyangphong", "Hotel Pemaling", "Hotel Grand", "Hotel Green View"],
        description: "West Kameng district (Bomdila/Dirang) is the usual overnight stop on the 2-day drive up from Tezpur/Guwahati.",
        venues: [
          { name: "Hotel Siphiyangphong", location: "Bomdila, West Kameng", mapsQuery: "Hotel Siphiyangphong Bomdila" },
          { name: "Hotel Pemaling", location: "Bomdila, West Kameng", mapsQuery: "Hotel Pemaling Bomdila" },
          { name: "Hotel Grand", location: "Bomdila, West Kameng", mapsQuery: "Hotel Grand Bomdila Arunachal Pradesh" },
        ],
        sourceNote: "Real, currently-registered hotels per the Arunachal Pradesh Tourism official Hotel List (PDF). No rates published — the range above is an estimate.",
      },
    ],
    localTransport: [
      { mode: "Shared Sumo/Jeep", cost: "₹300–₹800", notes: "Main way to get between Tawang, Bomdila, and Dirang", available: true },
      { mode: "Hired Cab (full day)", cost: "₹2,500–₹4,000/day", notes: "For Sela Pass, Madhuri Lake, and monastery-hopping around Tawang", available: true },
      { mode: "Walking", cost: "Free", notes: "Tawang Monastery complex and the town centre are walkable", available: true },
    ],
    nearbyPlaces: [
      { name: "Sela Pass", distance: "78 km from Tawang", type: "High-Altitude Mountain Pass", isHidden: false },
      { name: "Shonga-tser Lake (Madhuri Lake)", distance: "35 km from Tawang", type: "Glacial Lake", isHidden: true },
      { name: "Bomdila", distance: "180 km from Tawang", type: "Monastery Town & Craft Centre", isHidden: false },
      { name: "Sessa Orchid Sanctuary", distance: "Near Bomdila", type: "Protected Orchid Reserve", isHidden: true },
      { name: "Dirang", distance: "140 km from Tawang", type: "Hot Springs & Orchards", isHidden: true },
    ],
    budgetBreakdown: [
      { tier: "budget", label: "Backpacker", perDayPerPerson: 1800, accommodation: 800, food: 400, transport: 500, activities: 100 },
      { tier: "mid", label: "Comfortable", perDayPerPerson: 5000, accommodation: 2800, food: 800, transport: 1000, activities: 400 },
      { tier: "luxury", label: "Premium", perDayPerPerson: 12000, accommodation: 7000, food: 1500, transport: 2500, activities: 1000 },
    ],
    defaultItinerary: [
      { day: 1, title: "Guwahati to Bomdila", morning: "Depart Guwahati early by road (or fly to Tezpur if available).", afternoon: "Drive via Bhalukpong — stop at Sessa Orchid Sanctuary if in season.", evening: "Arrive Bomdila — monasteries and craft centres in the evening light.", stay: "Hotel in Bomdila", meals: "Local Monpa-style meal", tips: "Break the journey here rather than pushing straight to Tawang — it's a long drive." },
      { day: 2, title: "Bomdila to Tawang via Sela Pass", morning: "Drive through Dirang — hot springs and apple/kiwi orchards.", afternoon: "Cross Sela Pass (13,700 ft) — stop at Shonga-tser Lake (Madhuri Lake) nearby.", evening: "Arrive Tawang.", stay: "Hotel in Tawang town", meals: "Butter tea and thukpa en route", tips: "Carry warm layers — Sela Pass is cold even outside winter." },
      { day: 3, title: "Tawang Monastery & Town", morning: "Tawang Monastery — India's largest monastery, 17th century, home to a huge Monpa Buddhist community.", afternoon: "Explore Tawang town and local markets.", evening: "Sunset views over the Tawang valley.", stay: "Same hotel", meals: "Monpa thali", tips: "The monastery museum houses an important collection of Buddhist manuscripts and thangkas." },
    ],
    womenSafety: {
      score: 8,
      level: "Very Safe",
      highlights: ["Heavy Indian Army presence throughout the region (border area)", "Small, close-knit mountain communities", "Low crime — remoteness itself is a natural deterrent"],
      precautions: [
        "Inner Line Permit (eILP) is mandatory for all Indian citizens — apply at eilp.arunachal.gov.in before travel (valid up to 14 days; longer stays need a provisional ILP)",
        "Foreign nationals need a Protected Area Permit (PAP) — apply via the FRRO",
        "Roads (especially Sela Pass) can close briefly after heavy snow — build slack into your itinerary",
      ],
      soloTips: ["Solo travel is manageable but remote — let your hotel know your day plans", "Shared sumo/jeep travel is a good way to meet other travellers on the Bomdila–Tawang route"],
      emergencyContacts: [{ label: "Police", number: "100" }, { label: "Women Helpline", number: "181" }, { label: "Emergency", number: "112" }],
      safeZones: ["Tawang Monastery complex", "Tawang town centre", "Registered hotels in Bomdila/Dirang/Tawang"],
      avoidAreas: ["Unmarked high-altitude routes without a local guide/driver"],
    },
    rating: 4.7,
    reviews: 3100,
    mustEat: ["Thukpa (Tibetan noodle soup)", "Momos", "Butter tea", "Monpa-style pork with bamboo shoot"],
    packingTips: ["Heavy winter layers even outside winter — high altitude", "Original ID + eILP printout — checked at multiple road checkposts", "Motion-sickness tablets for the mountain drive", "Power bank — patchy electricity in remote stretches"],
  },
];

export const CATEGORIES = ["All", "Heritage", "Beach", "Nature", "Adventure", "Spiritual", "Culture", "Romantic"];

export function getDestinationById(id: string): Destination | undefined {
  return DESTINATIONS.find(d => d.id === id);
}

// The safety badge on Destination Detail's hero sits on a photo (with its
// own dark scrim), so its color doesn't need to track app theme — that
// call site keeps using the plain light-mode values below. The Safety
// tab's rating list renders this as text/icon color on an actual card
// surface, which DOES need to flip for dark-mode contrast, hence the
// optional `dark` flag rather than a second pair of functions.
export function getSafetyColor(score: number, dark = false): string {
  if (dark) {
    if (score >= 8) return "#4ADE80";
    if (score >= 6) return "#FBBF24";
    return "#F87171";
  }
  if (score >= 8) return "#15803D";
  if (score >= 6) return "#D97706";
  return "#DC2626";
}

export function getSafetyBg(score: number, dark = false): string {
  if (dark) {
    if (score >= 8) return "rgba(74,222,128,0.14)";
    if (score >= 6) return "rgba(251,191,36,0.14)";
    return "rgba(248,113,113,0.14)";
  }
  if (score >= 8) return "rgba(21,128,61,0.1)";
  if (score >= 6) return "rgba(217,119,6,0.1)";
  return "rgba(220,38,38,0.1)";
}
