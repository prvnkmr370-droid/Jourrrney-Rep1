/**
 * A small, hand-picked list of major Indian railway junctions — the train
 * counterpart to majorAirports.ts, used only as a non-AI fallback (see
 * screens/DestinationDetail/tabs/how-to-reach/localRouteEstimate.ts) for
 * picking the "nearest station" on each end of a route when the AI
 * route-info call (journey-backend's POST /plan-trip/route-info) is
 * unavailable. Not exhaustive — just well-known major junctions spread
 * across the country for a reasonable nearest-by-distance guess.
 * Coordinates are city-level approximations, not platform-precise (fine
 * for this — it's a coarse fallback, not the primary source; the AI path
 * remains the richer, route-specific answer when it's available).
 */
export interface MajorRailwayStation {
  name: string;
  code: string;
  city: string;
  lat: number;
  lon: number;
}

export const MAJOR_RAILWAY_STATIONS: MajorRailwayStation[] = [
  { name: "New Delhi Railway Station", code: "NDLS", city: "Delhi", lat: 28.6435, lon: 77.2197 },
  { name: "Chhatrapati Shivaji Maharaj Terminus", code: "CSMT", city: "Mumbai", lat: 18.9398, lon: 72.8355 },
  { name: "KSR Bengaluru City Junction", code: "SBC", city: "Bengaluru", lat: 12.9767, lon: 77.5703 },
  { name: "MGR Chennai Central", code: "MAS", city: "Chennai", lat: 13.0836, lon: 80.275 },
  { name: "Howrah Junction", code: "HWH", city: "Kolkata", lat: 22.5839, lon: 88.3425 },
  { name: "Secunderabad Junction", code: "SC", city: "Hyderabad", lat: 17.4344, lon: 78.5017 },
  { name: "Ahmedabad Junction", code: "ADI", city: "Ahmedabad", lat: 23.0258, lon: 72.601 },
  { name: "Pune Junction", code: "PUNE", city: "Pune", lat: 18.5286, lon: 73.8743 },
  { name: "Madgaon Junction", code: "MAO", city: "Margao", lat: 15.2832, lon: 73.9594 },
  { name: "Jaipur Junction", code: "JP", city: "Jaipur", lat: 26.9196, lon: 75.7878 },
  { name: "Lucknow Charbagh", code: "LKO", city: "Lucknow", lat: 26.8302, lon: 80.9205 },
  { name: "Chandigarh Junction", code: "CDG", city: "Chandigarh", lat: 30.6873, lon: 76.8065 },
  { name: "Guwahati Railway Station", code: "GHY", city: "Guwahati", lat: 26.1716, lon: 91.7354 },
  { name: "Bhubaneswar Railway Station", code: "BBS", city: "Bhubaneswar", lat: 20.2663, lon: 85.8366 },
  { name: "Patna Junction", code: "PNBE", city: "Patna", lat: 25.6093, lon: 85.1376 },
  { name: "Jammu Tawi", code: "JAT", city: "Jammu", lat: 32.6926, lon: 74.858 },
  { name: "Thiruvananthapuram Central", code: "TVC", city: "Thiruvananthapuram", lat: 8.4873, lon: 76.9525 },
  { name: "Ernakulam Junction", code: "ERS", city: "Kochi", lat: 9.9707, lon: 76.2847 },
  { name: "Coimbatore Junction", code: "CBE", city: "Coimbatore", lat: 11.0018, lon: 76.9629 },
  { name: "Nagpur Junction", code: "NGP", city: "Nagpur", lat: 21.1536, lon: 79.1075 },
  { name: "Indore Junction", code: "INDB", city: "Indore", lat: 22.722, lon: 75.865 },
  { name: "Bhopal Junction", code: "BPL", city: "Bhopal", lat: 23.268, lon: 77.403 },
  { name: "Varanasi Junction", code: "BSB", city: "Varanasi", lat: 25.3298, lon: 82.9937 },
  { name: "Amritsar Junction", code: "ASR", city: "Amritsar", lat: 31.6336, lon: 74.8702 },
  { name: "Dehradun Railway Station", code: "DDN", city: "Dehradun", lat: 30.3165, lon: 78.0285 },
  { name: "Raipur Junction", code: "R", city: "Raipur", lat: 21.2379, lon: 81.6532 },
  { name: "Ranchi Railway Station", code: "RNC", city: "Ranchi", lat: 23.36, lon: 85.333 },
  { name: "Visakhapatnam Railway Station", code: "VSKP", city: "Visakhapatnam", lat: 17.7128, lon: 83.2186 },
  { name: "Vijayawada Junction", code: "BZA", city: "Vijayawada", lat: 16.5162, lon: 80.6204 },
  { name: "Madurai Junction", code: "MDU", city: "Madurai", lat: 9.9195, lon: 78.1193 },
  { name: "Tiruchirappalli Junction", code: "TPJ", city: "Tiruchirappalli", lat: 10.8038, lon: 78.6855 },
  { name: "Mangalore Central", code: "MAQ", city: "Mangaluru", lat: 12.8698, lon: 74.842 },
  { name: "Udaipur City", code: "UDZ", city: "Udaipur", lat: 24.5807, lon: 73.6893 },
  { name: "Jodhpur Junction", code: "JU", city: "Jodhpur", lat: 26.287, lon: 73.018 },
  { name: "Surat Railway Station", code: "ST", city: "Surat", lat: 21.2056, lon: 72.8311 },
  // Added after a real bug: Agra has no entry in either this list or
  // MAJOR_AIRPORTS, so Delhi -> Agra (one of India's best-known train
  // routes — the Gatimaan Express) was resolving BOTH ends to Delhi's own
  // station, which the Train/Bus same-hub check then (correctly, given
  // that false premise) skipped as "no distinct route." These five cover
  // other popular destinations in this app's catalog with the same gap —
  // not exhaustive, just closing the specific holes that are large enough
  // to silently swallow an entire Train leg for a well-known route.
  { name: "Agra Cantt", code: "AGC", city: "Agra", lat: 27.1565, lon: 78.0081 },
  { name: "Mathura Junction", code: "MTJ", city: "Mathura", lat: 27.4844, lon: 77.6725 },
  { name: "New Jalpaiguri", code: "NJP", city: "Siliguri", lat: 26.6833, lon: 88.42 },
  { name: "Hosapete Junction", code: "HPT", city: "Hosapete", lat: 15.2693, lon: 76.3923 },
  { name: "Tirupati Railway Station", code: "TPTY", city: "Tirupati", lat: 13.6305, lon: 79.4152 },
  // Dimapur is Nagaland's actual rail gateway (the town itself grew up
  // around the railhead); Agartala got broad-gauge rail access via the
  // Agartala-Akhaura link — both real, both missing before.
  { name: "Dimapur Railway Station", code: "DMV", city: "Dimapur", lat: 25.9089, lon: 93.7267 },
  { name: "Agartala Railway Station", code: "AGTL", city: "Agartala", lat: 23.8696, lon: 91.2843 },
  { name: "Khajuraho Railway Station", code: "KURJ", city: "Khajuraho", lat: 24.8275, lon: 79.9342 },
  { name: "Jaisalmer Railway Station", code: "JSM", city: "Jaisalmer", lat: 26.9138, lon: 70.8773 },
  // Jhansi Junction is one of India's biggest railway hubs (Delhi-Chennai
  // and Delhi-Mumbai lines) — a significant gap to have missed.
  { name: "Jhansi Junction", code: "JHS", city: "Jhansi", lat: 25.4382, lon: 78.5684 },
  { name: "Gwalior Junction", code: "GWL", city: "Gwalior", lat: 26.2244, lon: 78.1738 },
  { name: "Shivpuri Railway Station", code: "SVPI", city: "Shivpuri", lat: 25.4231, lon: 77.6581 },
  { name: "Chunar Railway Station", code: "CAR", city: "Chunar", lat: 25.1256, lon: 82.8822 },
  // Kolhapur was missing entirely, so Jyotiba Temple (18km from Kolhapur)
  // was resolving to Madgaon Junction in Goa, 170km away.
  { name: "Kolhapur Railway Station", code: "KOP", city: "Kolhapur", lat: 16.6805, lon: 74.2433 },
  // Solapur Junction was missing entirely, so Akkalkot was resolving to
  // Kolhapur, 229km away, instead of its real nearest station ~30km away.
  { name: "Solapur Junction", code: "SUR", city: "Solapur", lat: 17.664, lon: 75.893 },
  // Nizamabad Junction is a real, significant station in the town itself
  // — missing meant it was resolving to Secunderabad, 144km away.
  { name: "Nizamabad Junction", code: "NZB", city: "Nizamabad", lat: 18.6788, lon: 78.1036 },
  // Abu Road is the real nearest station for Mount Abu — missing meant
  // Mount Abu Wildlife Sanctuary was resolving to Udaipur, 93km away,
  // instead of ~28km.
  { name: "Abu Road Railway Station", code: "ABR", city: "Abu Road", lat: 24.4807, lon: 72.7854 },
  // Vidisha Junction is a real, significant station in the town itself —
  // missing meant it would resolve to a much coarser Bhopal-only picture.
  { name: "Vidisha Junction", code: "BHS", city: "Vidisha", lat: 23.5224, lon: 77.8149 },
  // Naharlagun's own station was missing — meant it was resolving to
  // Dimapur, 133km away, instead of ~0km (it's the station in town).
  { name: "Naharlagun Railway Station", code: "NHLN", city: "Naharlagun", lat: 27.103, lon: 93.7008 },
  // Nandyal Junction is the real railhead for Ahobilam (~44km); missing
  // meant it resolved to Tirupati, 185km away.
  { name: "Nandyal Junction", code: "NDL", city: "Nandyal", lat: 15.48, lon: 78.48 },
  // Kakinada Town is the city's own station; missing meant Visakhapatnam,
  // 132km away.
  { name: "Kakinada Town Railway Station", code: "CCT", city: "Kakinada", lat: 16.9673, lon: 82.2329 },
  // Mariani Junction serves the Jorhat area (Hoollongapar sits beside it).
  { name: "Mariani Junction", code: "MXN", city: "Mariani", lat: 26.653, lon: 94.309 },
  // Silchar and Maibang were missing, so Maibang resolved to Dimapur, 89km
  // away, instead of its own station ~2km away.
  { name: "Silchar Railway Station", code: "SCL", city: "Silchar", lat: 24.82, lon: 92.8 },
  { name: "Maibang Railway Station", code: "MBG", city: "Maibang", lat: 25.305, lon: 93.1354 },
  // Kathgodam is the railhead for Kumaon; missing meant Baijnath resolved
  // to Dehradun, ~159km away.
  { name: "Kathgodam Railway Station", code: "KGM", city: "Kathgodam", lat: 29.2666, lon: 79.5467 },
  // Kumbakonam is the station for Darasuram (~5km); missing meant Tiruchirappalli, 75km.
  { name: "Kumbakonam Railway Station", code: "KMU", city: "Kumbakonam", lat: 10.9544, lon: 79.3894 },
  // The Nilgiri Mountain Railway runs Mettupalayam to Udagamandalam; both were missing,
  // so Pykara resolved to Coimbatore Junction, 64km away.
  { name: "Udagamandalam (Ooty) Railway Station", code: "UAM", city: "Ooty", lat: 11.4053, lon: 76.6962 },
  { name: "Mettupalayam Railway Station", code: "MTP", city: "Mettupalayam", lat: 11.2989, lon: 76.9355 },
  // Sambalpur, Warangal and Plassey stations were missing, so Huma resolved to
  // Bhubaneswar (230km), Pakhal to Secunderabad (169km), Plassey to Howrah (135km).
  { name: "Sambalpur Railway Station", code: "SBP", city: "Sambalpur", lat: 21.483, lon: 83.961 },
  { name: "Warangal Railway Station", code: "WL", city: "Warangal", lat: 17.9732, lon: 79.6074 },
  { name: "Plassey Railway Station", code: "PLS", city: "Plassey", lat: 23.7783, lon: 88.2849 },
  // Panvel (for Karnala), Virar (for Arnala), Satara (for Sajjangad), Nanded (for
  // Sahastrakund) and Chalsa (for Chapramari) were all missing, so these resolved to
  // CSMT, Pune, Nizamabad and NJP, tens to hundreds of km further than reality.
  { name: "Panvel Railway Station", code: "PNVL", city: "Panvel", lat: 18.9893, lon: 73.1223 },
  { name: "Virar Railway Station", code: "VR", city: "Virar", lat: 19.4553, lon: 72.812 },
  { name: "Satara Railway Station", code: "STR", city: "Satara", lat: 17.6884, lon: 74.0633 },
  { name: "Hazur Sahib Nanded Railway Station", code: "NED", city: "Nanded", lat: 19.1606, lon: 77.3083 },
  { name: "Chalsa Railway Station", code: "CLD", city: "Chalsa", lat: 26.88, lon: 88.78 },
  // Bolpur Shantiniketan (for Bakreshwar), Igatpuri (for Ratangad), Shivamogga Town (for
  // Kundadri; city-level point) and Alnavar Junction (the railhead for Dandeli/Syntheri) were
  // missing, so these resolved to Plassey (93km), Panvel (83km), Mangalore (84km) and Madgaon.
  { name: "Bolpur Shantiniketan Railway Station", code: "BHP", city: "Bolpur", lat: 23.6578, lon: 87.6981 },
  { name: "Igatpuri Railway Station", code: "IGP", city: "Igatpuri", lat: 19.6946, lon: 73.5622 },
  { name: "Shivamogga Town Railway Station", code: "SMET", city: "Shivamogga", lat: 13.933, lon: 75.567 },
  { name: "Alnavar Junction", code: "LWR", city: "Alnavar", lat: 15.4228, lon: 74.743 },
  // Added so Jaigad, Melghat, Navadwip, Mukutmanipur, Pocharam, Nagunur and Amrabad
  // resolve to their real nearby railheads instead of stations 100km+ away.
  { name: "Ratnagiri Railway Station", code: "RN", city: "Ratnagiri", lat: 17.003441, lon: 73.358159 },
  { name: "Badnera Junction", code: "BD", city: "Amravati", lat: 20.8572, lon: 77.7327 },
  { name: "Nabadwip Dham Railway Station", code: "NDAE", city: "Nabadwip", lat: 23.39792, lon: 88.356702 },
  { name: "Bankura Junction", code: "BQA", city: "Bankura", lat: 23.2244, lon: 87.0748 },
  { name: "Karimnagar Railway Station", code: "KRMR", city: "Karimnagar", lat: 18.459, lon: 79.1423 },
  { name: "Medak Railway Station", code: "MDAK", city: "Medak", lat: 18.061, lon: 78.2823 },
  { name: "Mahabubnagar Junction", code: "MBNR", city: "Mahabubnagar", lat: 16.7589, lon: 78.0011 },
  // Chitradurga (Jogimatti), Subrahmanya Road (Bisle Ghat), Kolar (Antaragange) and Mangaon
  // (Shrivardhan, Diveagar, Velas) were missing, so these resolved to hubs 60-100km further away.
  { name: "Chitradurga Railway Station", code: "CTA", city: "Chitradurga", lat: 14.2308, lon: 76.3865 },
  { name: "Subrahmanya Road Railway Station", code: "SBHR", city: "Subrahmanya", lat: 12.7315, lon: 75.558 },
  { name: "Kolar Railway Station", code: "KQZ", city: "Kolar", lat: 13.124, lon: 78.1329 },
  { name: "Mangaon Railway Station", code: "MNI", city: "Mangaon", lat: 18.2476, lon: 73.2756 },
  // Lonavala and Malavli serve Lohagad, Visapur and Bhaje — missing meant Pune Junction, 46km away.
  { name: "Lonavala Railway Station", code: "LNL", city: "Lonavala", lat: 18.749306, lon: 73.40806 },
  { name: "Malavli Railway Station", code: "MVL", city: "Malavli", lat: 18.7443, lon: 73.4806 },
  // Palakkad Junction serves Nelliyampathy and Pothundy — missing meant Coimbatore, 63km away.
  { name: "Palakkad Junction", code: "PGT", city: "Palakkad", lat: 10.8011, lon: 76.6389 },
  // Nashik Road serves Saptashrungi and the Nashik hills; Wardha serves Sevagram and Paunar;
  // Ahmednagar (Ahilyanagar) is its own junction — all were resolving to Pune/Nagpur/Igatpuri.
  { name: "Nasik Road Railway Station", code: "NK", city: "Nashik", lat: 19.9472, lon: 73.8421 },
  { name: "Wardha Junction", code: "WR", city: "Wardha", lat: 20.7331, lon: 78.5947 },
  { name: "Ahmednagar Railway Station", code: "ANG", city: "Ahmednagar (Ahilyanagar)", lat: 19.0753, lon: 74.7217 },
  // Gondia is the real railhead for Nagzira / Nawegaon — missing meant Nagpur, 92km away.
  { name: "Gondia Junction", code: "G", city: "Gondia", lat: 21.4615, lon: 80.1922 },
  // Sawantwadi Road is the Konkan Railway station for Sawantwadi, Amboli and southern Sindhudurg.
  { name: "Sawantwadi Road Railway Station", code: "SWV", city: "Sawantwadi", lat: 15.8665, lon: 73.7851 },
  // Nandurbar (Prakasha, Toranmal), Jalgaon (Chopda, Ajanta side) and Belagavi (Chorla Ghat,
  // Kittur, Bhimgad) were missing, so these resolved to Surat, Indore and Sawantwadi Road.
  { name: "Nandurbar Railway Station", code: "NDB", city: "Nandurbar", lat: 21.37408, lon: 74.24453 },
  { name: "Jalgaon Junction", code: "JL", city: "Jalgaon", lat: 21.0183, lon: 75.5631 },
  { name: "Belagavi Railway Station", code: "BGM", city: "Belagavi", lat: 15.8489, lon: 74.5089 },
  // Bhagalpur (Vikramshila), Kathua, Bidar (Basavakalyana) and Pernem were missing, so these
  // resolved to Bolpur (185km), Jammu Tawi (72km), Solapur (114km) and Sawantwadi Road (17km).
  { name: "Bhagalpur Junction", code: "BGP", city: "Bhagalpur", lat: 25.2414, lon: 86.9725 },
  { name: "Kathua Railway Station", code: "KTHU", city: "Kathua", lat: 32.3981, lon: 75.5507 },
  { name: "Bidar Railway Station", code: "BIDR", city: "Bidar", lat: 17.9117, lon: 77.5153 },
  { name: "Pernem Railway Station", code: "PERN", city: "Pernem", lat: 15.7084, lon: 73.8173 },
  // The south Gujarat main-line stations (Navsari, Bharuch, Valsad) and Himmatnagar were missing,
  // so these all resolved to Surat or Ahmedabad, 30-73km away.
  { name: "Navsari Railway Station", code: "NVS", city: "Navsari", lat: 20.9482, lon: 72.9132 },
  { name: "Bharuch Junction", code: "BH", city: "Bharuch", lat: 21.703545, lon: 72.999701 },
  { name: "Valsad Railway Station", code: "BL", city: "Valsad", lat: 20.607434, lon: 72.931341 },
  { name: "Himmatnagar Junction", code: "HMT", city: "Himmatnagar", lat: 23.591848, lon: 72.960209 },
  // Kanpur Central and Mirzapur were missing (resolved to Lucknow, 70km, and Chunar, 32km);
  // Rangapara North is the nearest main-line railhead for Bhalukpong / Sessa / Tippi.
  { name: "Kanpur Central", code: "CNB", city: "Kanpur", lat: 26.4539, lon: 80.3512 },
  { name: "Mirzapur Railway Station", code: "MZP", city: "Mirzapur", lat: 25.1346, lon: 82.5689 },
  { name: "Rangapara North Junction", code: "RPAN", city: "Rangapara", lat: 26.8212, lon: 92.6831 },
  // Balrampur, Etawah, Lalitpur, Munger and New Bongaigaon were missing, so these resolved to
  // Lucknow (142km), Gwalior (105km), Jhansi (85km), Bhagalpur (53km) and Guwahati (116km).
  { name: "Balrampur Railway Station", code: "BLP", city: "Balrampur", lat: 27.4156, lon: 82.1611 },
  { name: "Etawah Junction", code: "ETW", city: "Etawah", lat: 26.7865, lon: 79.0223 },
  { name: "Lalitpur Junction", code: "LAR", city: "Lalitpur", lat: 24.6882, lon: 78.3959 },
  { name: "Munger Railway Station", code: "MGR", city: "Munger", lat: 25.3771, lon: 86.4814 },
  { name: "New Bongaigaon Junction", code: "NBQ", city: "Bongaigaon", lat: 26.4758, lon: 90.5372 },
  // Cuttack (Netaji museum), Rishikesh (Shivpuri rafting) and Ramnagar (Corbett / Sitabani) were
  // missing, so these resolved to Bhubaneswar (23km), Dehradun (40km) and Kathgodam (35km).
  { name: "Cuttack Junction", code: "CTC", city: "Cuttack", lat: 20.4656, lon: 85.9016 },
  { name: "Rishikesh Railway Station", code: "RKSH", city: "Rishikesh", lat: 30.1077, lon: 78.288 },
  { name: "Ramnagar Railway Station", code: "RMR", city: "Ramnagar", lat: 29.3898, lon: 79.122 },
  // Anantapur was missing, so it resolved to Nandyal Junction, 130km away.
  { name: "Anantapur Railway Station", code: "ATP", city: "Anantapur", lat: 14.686, lon: 77.595 },
  // Digha and Balasore were missing, so Shankarpur and Chandaneswar resolved to Howrah (132-140km).
  { name: "Digha Railway Station", code: "DGHA", city: "Digha", lat: 21.623441, lon: 87.508409 },
  { name: "Balasore Railway Station", code: "BLS", city: "Balasore", lat: 21.5014, lon: 86.9203 },
  // Nagapattinam, Khammam, Kotdwar and Rajnandgaon were missing, so these resolved to Kumbakonam (54km),
  // Vijayawada (95km), Rishikesh (46km) and Raipur (67km). Kotdwar's coordinate is Wikipedia's rounded value.
  { name: "Nagapattinam Junction", code: "NGT", city: "Nagapattinam", lat: 10.7595, lon: 79.8457 },
  { name: "Khammam Railway Station", code: "KMT", city: "Khammam", lat: 17.249347, lon: 80.138491 },
  { name: "Kotdwar Railway Station", code: "KTW", city: "Kotdwar", lat: 29.75, lon: 78.53 },
  { name: "Rajnandgaon Railway Station", code: "RJN", city: "Rajnandgaon", lat: 21.1006, lon: 81.0386 },
];
