/**
 * Lat/lon for each destination, used to query the live weather API (see
 * src/hooks/useDestinationWeather.ts). Not part of the main Destination
 * model in destinations.ts to avoid touching that large, already-stable
 * file — kept as a small side lookup instead. Coordinates point at the
 * specific town/hub each destination card represents (e.g. Kerala
 * Backwaters → Alappuzha, the classic backwater-houseboat town), not just
 * "somewhere in the state."
 */
export const DESTINATION_COORDS: Record<string, { lat: number; lon: number }> = {
  agra: { lat: 27.1767, lon: 78.0081 },
  jaipur: { lat: 26.9124, lon: 75.7873 },
  kerala: { lat: 9.4981, lon: 76.3388 }, // Alappuzha
  goa: { lat: 15.2993, lon: 74.124 },
  ladakh: { lat: 34.1526, lon: 77.5771 }, // Leh
  varanasi: { lat: 25.3176, lon: 82.9739 },
  andaman: { lat: 11.6234, lon: 92.7265 }, // Port Blair
  udaipur: { lat: 24.5854, lon: 73.7125 },
  rishikesh: { lat: 30.0869, lon: 78.2676 },
  darjeeling: { lat: 27.041, lon: 88.2663 },
  khajuraho: { lat: 24.8318, lon: 79.9199 },
  hampi: { lat: 15.335, lon: 76.46 },
  mysuru: { lat: 12.2958, lon: 76.6394 },
  coorg: { lat: 12.4244, lon: 75.7382 }, // Madikeri
  gokarna: { lat: 14.5479, lon: 74.3188 },
  kabini: { lat: 11.928, lon: 76.3341 },
  vizag: { lat: 17.6868, lon: 83.2185 },
  tirupati: { lat: 13.6288, lon: 79.4192 },
  tawang: { lat: 27.5859, lon: 91.8594 },
  "fatehpur-sikri": { lat: 27.0945, lon: 77.6679 },
  "mathura-vrindavan": { lat: 27.4924, lon: 77.6737 }, // Mathura
  lucknow: { lat: 26.8467, lon: 80.9462 },
  ayodhya: { lat: 26.7922, lon: 82.1998 },
  prayagraj: { lat: 25.4358, lon: 81.8463 },
  kaziranga: { lat: 26.5775, lon: 93.1714 },
  majuli: { lat: 26.9526, lon: 94.1656 },
  guwahati: { lat: 26.1445, lon: 91.7362 },
  tezpur: { lat: 26.6528, lon: 92.7926 },
  haflong: { lat: 25.1667, lon: 93.0167 },
};
