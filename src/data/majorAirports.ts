/**
 * A small, hand-picked list of major Indian airports with scheduled
 * commercial flights — used only as a non-AI fallback (see
 * screens/DestinationDetail/tabs/how-to-reach/localRouteEstimate.ts) for
 * picking the "nearest airport to the origin" when the AI route-info call
 * (journey-backend's POST /plan-trip/route-info) is unavailable. Not
 * exhaustive — just enough well-known hubs spread across the country for a
 * reasonable nearest-by-distance guess. Coordinates are city-level
 * approximations, not runway-precise (fine for this — it's a coarse
 * fallback, not the primary source; the AI path remains the richer answer
 * when it's available).
 */
export interface MajorAirport {
  name: string;
  iata: string;
  city: string;
  lat: number;
  lon: number;
}

export const MAJOR_AIRPORTS: MajorAirport[] = [
  { name: "Indira Gandhi International Airport", iata: "DEL", city: "Delhi", lat: 28.5562, lon: 77.1 },
  { name: "Chhatrapati Shivaji Maharaj International Airport", iata: "BOM", city: "Mumbai", lat: 19.0896, lon: 72.8656 },
  { name: "Kempegowda International Airport", iata: "BLR", city: "Bengaluru", lat: 13.1986, lon: 77.7066 },
  { name: "Chennai International Airport", iata: "MAA", city: "Chennai", lat: 12.9941, lon: 80.1709 },
  { name: "Netaji Subhas Chandra Bose International Airport", iata: "CCU", city: "Kolkata", lat: 22.6547, lon: 88.4467 },
  { name: "Rajiv Gandhi International Airport", iata: "HYD", city: "Hyderabad", lat: 17.2403, lon: 78.4294 },
  { name: "Sardar Vallabhbhai Patel International Airport", iata: "AMD", city: "Ahmedabad", lat: 23.0772, lon: 72.6347 },
  { name: "Pune Airport", iata: "PNQ", city: "Pune", lat: 18.5822, lon: 73.9197 },
  { name: "Goa International Airport", iata: "GOI", city: "Vasco da Gama", lat: 15.3808, lon: 73.8314 },
  { name: "Jaipur International Airport", iata: "JAI", city: "Jaipur", lat: 26.8242, lon: 75.8122 },
  { name: "Chaudhary Charan Singh International Airport", iata: "LKO", city: "Lucknow", lat: 26.7606, lon: 80.8893 },
  { name: "Shaheed Bhagat Singh International Airport", iata: "IXC", city: "Chandigarh / Mohali", lat: 30.6735, lon: 76.7885 },
  { name: "Lokpriya Gopinath Bordoloi International Airport", iata: "GAU", city: "Guwahati", lat: 26.1061, lon: 91.5859 },
  { name: "Biju Patnaik International Airport", iata: "BBI", city: "Bhubaneswar", lat: 20.2444, lon: 85.8178 },
  { name: "Jay Prakash Narayan Airport", iata: "PAT", city: "Patna", lat: 25.5913, lon: 85.088 },
  { name: "Sheikh ul-Alam International Airport", iata: "SXR", city: "Srinagar", lat: 33.9871, lon: 74.7742 },
  { name: "Trivandrum International Airport", iata: "TRV", city: "Thiruvananthapuram", lat: 8.4821, lon: 76.92 },
  { name: "Cochin International Airport", iata: "COK", city: "Kochi", lat: 10.152, lon: 76.4019 },
  { name: "Coimbatore International Airport", iata: "CJB", city: "Coimbatore", lat: 11.03, lon: 77.0434 },
  { name: "Dr. Babasaheb Ambedkar International Airport", iata: "NAG", city: "Nagpur", lat: 21.0922, lon: 79.0472 },
  { name: "Devi Ahilya Bai Holkar Airport", iata: "IDR", city: "Indore", lat: 22.7218, lon: 75.8011 },
  { name: "Raja Bhoj Airport", iata: "BHO", city: "Bhopal", lat: 23.2875, lon: 77.3374 },
  { name: "Lal Bahadur Shastri Airport", iata: "VNS", city: "Varanasi", lat: 25.4524, lon: 82.8593 },
  { name: "Sri Guru Ram Dass Jee International Airport", iata: "ATQ", city: "Amritsar", lat: 31.7096, lon: 74.7973 },
  { name: "Jolly Grant Airport", iata: "DED", city: "Dehradun", lat: 30.1897, lon: 78.1803 },
  { name: "Swami Vivekananda Airport", iata: "RPR", city: "Raipur", lat: 21.1804, lon: 81.7388 },
  { name: "Birsa Munda Airport", iata: "IXR", city: "Ranchi", lat: 23.3143, lon: 85.3217 },
  { name: "Veer Savarkar International Airport", iata: "IXZ", city: "Port Blair", lat: 11.641, lon: 92.7297 },
  { name: "Visakhapatnam Airport", iata: "VTZ", city: "Visakhapatnam", lat: 17.721, lon: 83.2245 },
  { name: "Vijayawada Airport", iata: "VGA", city: "Vijayawada", lat: 16.5304, lon: 80.7967 },
  { name: "Madurai Airport", iata: "IXM", city: "Madurai", lat: 9.8345, lon: 78.0934 },
  { name: "Tiruchirappalli International Airport", iata: "TRZ", city: "Tiruchirappalli", lat: 10.7654, lon: 78.7097 },
  { name: "Mangalore International Airport", iata: "IXE", city: "Mangaluru", lat: 12.9613, lon: 74.89 },
  { name: "Maharana Pratap Airport", iata: "UDR", city: "Udaipur", lat: 24.6177, lon: 73.8961 },
  { name: "Jodhpur Airport", iata: "JDH", city: "Jodhpur", lat: 26.2511, lon: 73.0488 },
  { name: "Surat Airport", iata: "STV", city: "Surat", lat: 21.1141, lon: 72.7416 },
  // Added after a gap found generating journey guides — the Northeast
  // state capitals were entirely missing, so nearby destinations in those
  // states (e.g. Dimapur, Nagaland) were resolving to Guwahati, 200km+
  // away, instead of their own real, much closer airport.
  { name: "Dimapur Airport", iata: "DMU", city: "Dimapur", lat: 25.8838, lon: 93.7712 },
  { name: "Bir Tikendrajit International Airport", iata: "IMF", city: "Imphal", lat: 24.76, lon: 93.8967 },
  { name: "Maharaja Bir Bikram Airport", iata: "IXA", city: "Agartala", lat: 23.887, lon: 91.2404 },
  { name: "Lengpui Airport", iata: "AJL", city: "Aizawl", lat: 23.8406, lon: 92.6196 },
  { name: "Shillong Airport", iata: "SHL", city: "Shillong", lat: 25.7042, lon: 91.9787 },
  { name: "Pakyong Airport", iata: "PYG", city: "Gangtok", lat: 27.2306, lon: 88.5892 },
  { name: "Jammu Airport", iata: "IXJ", city: "Jammu", lat: 32.6891, lon: 74.8378 },
  // Khajuraho has a real, if small, airport — missing despite being one
  // of the 11 destinations with a full hand-written journey guide.
  { name: "Khajuraho Airport", iata: "HJR", city: "Khajuraho", lat: 24.8178, lon: 79.9189 },
  // Jaisalmer is the real gateway airport for the whole western Thar
  // desert region — missing meant nearby destinations (Khuri, Longewala)
  // were resolving to Jodhpur, 200km+ further away than reality.
  { name: "Jaisalmer Airport", iata: "JSA", city: "Jaisalmer", lat: 26.8884, lon: 70.8647 },
  // Gwalior is the real nearest airport for Jhansi and Shivpuri — missing
  // meant both were resolving 150km+ further away, to Khajuraho.
  { name: "Gwalior Airport", iata: "GWL", city: "Gwalior", lat: 26.2934, lon: 78.2278 },
  // Kolhapur was missing entirely, so Jyotiba Temple (18km from Kolhapur)
  // was resolving to Goa's airport, 161km away.
  { name: "Kolhapur Airport", iata: "KLH", city: "Kolhapur", lat: 16.6642, lon: 74.2886 },
  // Hubli was missing entirely, so Hospet (gateway to Hampi) was
  // resolving to Bangalore, 270km away instead of ~140km.
  { name: "Hubli Airport", iata: "HBX", city: "Hubli", lat: 15.3617, lon: 75.0849 },
  // Solapur was missing entirely, so Akkalkot was resolving to Kolhapur,
  // 225km away, instead of its real nearest airport ~30km away.
  { name: "Solapur Airport", iata: "SSE", city: "Solapur", lat: 17.625, lon: 75.9361 },
  // Bagdogra is the real gateway airport for the Dooars region — missing
  // meant Chilapata Forest was resolving to Pakyong (Sikkim), 109km away.
  { name: "Bagdogra Airport", iata: "IXB", city: "Bagdogra", lat: 26.6811, lon: 88.3286 },
  // Diu has its own small airport — missing meant Jallandhar Beach was
  // resolving to Surat, 188km away, instead of ~2km.
  { name: "Diu Airport", iata: "DIU", city: "Diu", lat: 20.713, lon: 70.925 },
  // Itanagar's own airport (opened 2022) was missing — meant Naharlagun
  // was resolving to Dimapur, 136km away, instead of ~15km.
  { name: "Donyi Polo Airport", iata: "HGI", city: "Itanagar", lat: 26.97, lon: 93.6647 },
  // Kadapa/Kurnool were missing, so Ahobilam resolved to Hyderabad, 236km
  // away, instead of ~70-85km.
  { name: "Kadapa Airport", iata: "CDP", city: "Kadapa", lat: 14.51, lon: 78.7728 },
  { name: "Kurnool Airport", iata: "KJB", city: "Kurnool", lat: 15.7061, lon: 78.1608 },
  // Rajahmundry is the real gateway for Kakinada — missing meant Kakinada
  // resolved to Visakhapatnam, 133km away, instead of ~60km.
  { name: "Rajahmundry Airport", iata: "RJA", city: "Rajahmundry", lat: 17.1103, lon: 81.8183 },
  // Jorhat and Silchar were missing, so Hoollongapar resolved to Itanagar
  // (74km, wrong side of the state) and Maibang to Dimapur.
  { name: "Jorhat Airport", iata: "JRH", city: "Jorhat", lat: 26.7317, lon: 94.1756 },
  { name: "Silchar Airport", iata: "IXS", city: "Silchar", lat: 24.9131, lon: 92.9786 },
  // Pantnagar is the real air gateway for Kumaon — missing meant Baijnath
  // resolved to Dehradun's Jolly Grant, across the Garhwal hills.
  { name: "Pantnagar Airport", iata: "PGH", city: "Pantnagar", lat: 29.0322, lon: 79.4742 },
  // Jharsuguda is the real air gateway for Sambalpur and Huma — missing meant
  // Huma resolved to Raipur, 226km away.
  { name: "Veer Surendra Sai Airport", iata: "JRG", city: "Jharsuguda", lat: 21.9133, lon: 84.0503 },
  // Nanded is the real air gateway for Sahastrakund — missing meant Nagpur, 212km away.
  { name: "Shri Guru Gobind Singh Ji Airport", iata: "NDC", city: "Nanded", lat: 19.1819, lon: 77.3186 },
  // Andal (Durgapur) serves Bakreshwar and Shantiniketan; Shivamogga serves Kundadri and the
  // Malnad hills. Both were missing, so these resolved to Kolkata (175km) and Mangalore (73km).
  { name: "Kazi Nazrul Islam Airport", iata: "RDP", city: "Andal (Durgapur)", lat: 23.6214, lon: 87.2433 },
  { name: "Shivamogga Airport", iata: "RQY", city: "Shivamogga", lat: 13.8547, lon: 75.6106 },
  // Nashik (Ozar) has scheduled IndiGo flights — missing meant Saptashrungi's Markandeya Hill
  // resolved to Surat, 148km away.
  { name: "Nashik Airport", iata: "ISK", city: "Nashik", lat: 20.11944, lon: 73.91361 },
  // Mopa (opened Jan 2023) is Goa's second airport and the real gateway for North Goa and
  // Sawantwadi / Sindhudurg — missing meant Dabolim, ~90km further south.
  { name: "Manohar International Airport", iata: "GOX", city: "Mopa", lat: 15.7322, lon: 73.868 },
  // Pasighat (Alliance Air, UDAN) is the real air gateway for Aalo / Along — missing meant
  // Jorhat, 171km away across the Assam plains.
  { name: "Pasighat Airport", iata: "IXT", city: "Pasighat", lat: 28.068472, lon: 95.334528 },
  // Belagavi has scheduled IndiGo flights — missing meant Mopa (Goa), 72km away across the ghats.
  { name: "Belgaum Airport", iata: "IXG", city: "Belagavi", lat: 15.85917, lon: 74.6175 },
  // Tezpur (Alliance Air) is the real air gateway for Bhalukpong / Sessa / western Arunachal —
  // missing meant Itanagar's Donyi Polo, 114km away over the hills.
  { name: "Tezpur Airport", iata: "TEZ", city: "Tezpur", lat: 26.71222, lon: 92.78722 },
];
