/**
 * Capital (or other major-city) coordinates for every Indian state/UT
 * string actually used as `Destination.state` in destinations.ts — a
 * last-resort anchor point for the local (non-AI) route-info fallback (see
 * screens/DestinationDetail/tabs/how-to-reach/localRouteEstimate.ts) when
 * a destination has no entry in destinationCoords.ts AND the destination's
 * own name doesn't geocode via Open-Meteo. That geocoder is a plain-
 * settlement database — it has no entry at all for most specific landmarks
 * ("Sukhna Lake" fails even with city+country appended, while "Rock
 * Garden" happens to succeed) and, worse, mishandles bare Indian state
 * names (e.g. "Kerala" alone resolves to a same-named village in Finland).
 * A static per-state anchor sidesteps both problems — coarse (state-level,
 * not landmark-level), but always available and never silently wrong.
 */
export const STATE_ANCHOR_COORDS: Record<string, { lat: number; lon: number }> = {
  "Andaman & Nicobar": { lat: 11.6234, lon: 92.7265 }, // Port Blair
  "Andhra Pradesh": { lat: 16.5062, lon: 80.648 }, // Vijayawada
  "Arunachal Pradesh": { lat: 27.0844, lon: 93.6053 }, // Itanagar
  Assam: { lat: 26.1445, lon: 91.7362 }, // Guwahati
  Bihar: { lat: 25.5941, lon: 85.1376 }, // Patna
  "Chandigarh (UT)": { lat: 30.7333, lon: 76.7794 },
  Chhattisgarh: { lat: 21.2514, lon: 81.6296 }, // Raipur
  "Dadra and Nagar Haveli (UT)": { lat: 20.2766, lon: 73.0169 }, // Silvassa
  "Daman (UT)": { lat: 20.3974, lon: 72.8328 },
  Delhi: { lat: 28.6139, lon: 77.209 },
  "Diu (UT)": { lat: 20.7144, lon: 70.9874 },
  Goa: { lat: 15.4909, lon: 73.8278 }, // Panaji
  Gujarat: { lat: 23.2156, lon: 72.6369 }, // Gandhinagar
  Haryana: { lat: 30.7333, lon: 76.7794 }, // shares Chandigarh
  "Himachal Pradesh": { lat: 31.1048, lon: 77.1734 }, // Shimla
  "Jammu and Kashmir (UT)": { lat: 34.0837, lon: 74.7973 }, // Srinagar
  Jharkhand: { lat: 23.3441, lon: 85.3096 }, // Ranchi
  Karnataka: { lat: 12.9716, lon: 77.5946 }, // Bengaluru
  Kerala: { lat: 8.5241, lon: 76.9366 }, // Thiruvananthapuram
  "Ladakh (UT)": { lat: 34.1526, lon: 77.5771 }, // Leh
  Lakshadweep: { lat: 10.5593, lon: 72.6358 }, // Kavaratti
  "Madhya Pradesh": { lat: 23.2599, lon: 77.4126 }, // Bhopal
  Maharashtra: { lat: 19.076, lon: 72.8777 }, // Mumbai
  Manipur: { lat: 24.817, lon: 93.9368 }, // Imphal
  Meghalaya: { lat: 25.5788, lon: 91.8933 }, // Shillong
  Mizoram: { lat: 23.7271, lon: 92.7176 }, // Aizawl
  Nagaland: { lat: 25.6751, lon: 94.1086 }, // Kohima
  Odisha: { lat: 20.2961, lon: 85.8245 }, // Bhubaneswar
  "Puducherry (UT)": { lat: 11.9416, lon: 79.8083 },
  Punjab: { lat: 30.7333, lon: 76.7794 }, // shares Chandigarh
  Rajasthan: { lat: 26.9124, lon: 75.7873 }, // Jaipur
  Sikkim: { lat: 27.3389, lon: 88.6065 }, // Gangtok
  "Tamil Nadu": { lat: 13.0827, lon: 80.2707 }, // Chennai
  Telangana: { lat: 17.385, lon: 78.4867 }, // Hyderabad
  Tripura: { lat: 23.8315, lon: 91.2868 }, // Agartala
  "Uttar Pradesh": { lat: 26.8467, lon: 80.9462 }, // Lucknow
  Uttarakhand: { lat: 30.3165, lon: 78.0322 }, // Dehradun
  "West Bengal": { lat: 22.5726, lon: 88.3639 }, // Kolkata
};
