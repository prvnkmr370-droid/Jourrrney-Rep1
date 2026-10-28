/**
 * "Gateways": the nearest airport, railway station and bus station to a place,
 * so a traveller can look up flights, trains and buses from ANY city to that
 * hub and then plan the short transfer. They power the Fly / Train / Bus tabs
 * in screens/DestinationDetail/tabs/how-to-reach/GettingThere.tsx.
 *
 * Only places listed here get the new tabs; every other place keeps the older
 * "From my city" card until it has been checked. That is on purpose: the older
 * route data names one big regional airport for many places (e.g. 328 places
 * point at Chandigarh's airport), which is often NOT the nearest, and a card that
 * says "nearest" must be right.
 *
 * Every entry here is checked by a person. How to add one (see
 * scripts/gateways/README.md):
 *   1. node scripts/gateways/find-candidates.mjs <place-id>       finds candidates from open data
 *   2. check them against the airport / railway / state transport websites
 *   3. add the entry below; node scripts/gateways/check-gateways.mjs checks its shape
 *
 * Distances and times are BY ROAD from the airport/station/bus station to the
 * place (OpenStreetMap routing), rounded, and always shown as approximate.
 */

/** How many flights an airport has, as a plain-words tag. */
export type AirService = "few" | "more" | "most";

export interface GatewayAir {
  name: string;
  /** Three-letter IATA code: what you type into a flight search. */
  code: string;
  /** Where it is, if the name alone doesn't say ("Toranagallu, near Hosapete"). */
  area?: string;
  km: number;
  minutes: number;
  /** few: a handful of flights a week or day; more: several airlines; most: a big hub. */
  service: AirService;
  /** One short caution shown under the airport ("Few flights land here. Check your dates first."). */
  note?: string;
}

export interface GatewayRail {
  name: string;
  /** Indian Railways station code: what you type into a train search. */
  code: string;
  area?: string;
  km: number;
  minutes: number;
  /** A big junction where many long-distance trains stop. */
  junction?: boolean;
  note?: string;
}

export interface GatewayBus {
  name: string;
  area?: string;
  km: number;
  minutes: number;
  /** Who runs the buses from here. "unknown" when a map lists the station but no source says who runs it. */
  operator: "government" | "private" | "both" | "unknown";
  /** The state transport corporation, e.g. "KSRTC". */
  operatorName?: string;
  /** The official booking page of that corporation, if there is one. */
  bookingUrl?: string;
  /** "Buses from here go to": only places a source confirmed. */
  goesTo?: { place: string; note?: string }[];
  note?: string;
}

export interface PlaceGateways {
  /** When this entry was last checked, e.g. "Oct 2026". */
  checked: string;
  /**
   * "reviewed": a person checked every hub against current sources (the default).
   * "mapdata": worked out from open data (see gatewaysBulk.ts) and shown with a plain warning.
   */
  basis?: "reviewed" | "mapdata";
  /** The nearest first. */
  air: GatewayAir[];
  rail: GatewayRail[];
  /** Set when there is no railway at or near the place ("There is no railway in Ladakh."); rail[] then holds the nearest railhead. */
  railNone?: string;
  bus: GatewayBus[];
  /** When bus[] is empty: the nearest bigger town people travel to by bus. */
  busTown?: { name: string; km: number; minutes: number };
  /** The last leg, as plain text, e.g. "Taxi about ₹1,000 to ₹1,500, about 1 h." */
  fromHub?: { air?: string; rail?: string; bus?: string };
}

export const GATEWAYS: Record<string, PlaceGateways> = {
  agra: {
    checked: "Oct 2026",
    air: [
      { name: "Agra Airport", code: "AGR", km: 6, minutes: 15, service: "few", note: "Few flights. Only IndiGo flies here, to a handful of cities. Check your dates first, or fly to Delhi." },
      { name: "Gwalior Airport", code: "GWL", km: 125, minutes: 185, service: "more" },
      { name: "Noida International Airport", code: "DXN", area: "Jewar, near Greater Noida", km: 144, minutes: 175, service: "more", note: "A new airport that opened in June 2026. Routes are still being added." },
      { name: "Indira Gandhi International Airport", code: "DEL", area: "Delhi", km: 210, minutes: 240, service: "most" },
    ],
    rail: [
      { name: "Agra Fort", code: "AF", km: 2, minutes: 5, note: "Close to Agra Fort. Agra Cantt is the main station, so check that your train stops here." },
      { name: "Agra Cantt", code: "AGC", km: 3, minutes: 5, note: "Agra's main station." },
    ],
    bus: [
      { name: "Idgah Bus Stand", km: 2, minutes: 5, operator: "government", operatorName: "UPSRTC", bookingUrl: "https://www.onlineupsrtc.co.in/", goesTo: [{ place: "Delhi" }, { place: "Jaipur" }, { place: "Mathura" }, { place: "Lucknow" }, { place: "Gwalior" }], note: "The main stand for buses towards Rajasthan and Madhya Pradesh." },
      { name: "ISBT Agra", area: "Transport Nagar", km: 8, minutes: 10, operator: "government", operatorName: "UPSRTC", bookingUrl: "https://www.onlineupsrtc.co.in/", note: "On the far side of the city. Most long-distance buses stop here, except Rajasthan-bound buses that start at Idgah." },
    ],
    fromHub: { rail: "A prepaid taxi stand is outside Agra Cantt station." },
  },
  coorg: {
    checked: "Oct 2026",
    air: [
      { name: "Kannur International Airport", code: "CNN", area: "Mattannur, Kannur (Kerala)", km: 89, minutes: 170, service: "more" },
      { name: "Mysuru Airport", code: "MYQ", area: "Mandakalli, south of Mysuru", km: 127, minutes: 175, service: "few", note: "Few flights land here. Check your dates first." },
      { name: "Mangaluru International Airport", code: "IXE", area: "Bajpe, Mangaluru", km: 137, minutes: 225, service: "more" },
      { name: "Kempegowda International Airport", code: "BLR", area: "Bengaluru", km: 294, minutes: 360, service: "most" },
    ],
    rail: [
      { name: "Subrahmanya Road", code: "SBHR", area: "near Kukke Subramanya", km: 86, minutes: 140, note: "A small station with a handful of trains a day. Check your dates." },
      { name: "Mysuru Junction", code: "MYS", area: "Mysuru", km: 118, minutes: 160, junction: true, note: "The big station with trains from Bengaluru, Chennai and other cities. Buses and taxis go on to Madikeri." },
      { name: "Mangaluru Central", code: "MAQ", area: "Mangaluru", km: 136, minutes: 215, note: "Main station of Mangaluru, with trains from Kerala, Mumbai and Chennai." },
    ],
    railNone: "There is no railway in Kodagu (Coorg).",
    bus: [
      { name: "Madikeri KSRTC Bus Stand", area: "College Road, Madikeri", km: 1, minutes: 5, operator: "government", operatorName: "KSRTC", bookingUrl: "https://ksrtc.in/", goesTo: [{ place: "Bengaluru" }, { place: "Mysuru" }, { place: "Mangaluru" }] },
      { name: "Madikeri New Private Bus Stand", area: "College Road, Madikeri", km: 1, minutes: 5, operator: "private" },
    ],
    fromHub: { air: "From Bengaluru airport, KSRTC Flybus buses run to Madikeri." },
  },
  darjeeling: {
    checked: "Oct 2026",
    air: [
      { name: "Bagdogra Airport", code: "IXB", area: "Bagdogra, near Siliguri", km: 70, minutes: 180, service: "more", note: "The airport is in the plains near Siliguri. The hill drive to Darjeeling takes about 3 hours." },
    ],
    rail: [
      { name: "Darjeeling", code: "DJ", km: 1, minutes: 5, note: "Narrow-gauge toy train station. Services are mostly tourist joyrides to Ghum, so most travellers arrive by train at New Jalpaiguri and finish by road." },
      { name: "New Jalpaiguri Junction", code: "NJP", area: "Siliguri", km: 73, minutes: 180, junction: true },
    ],
    bus: [
    ],
    busTown: { name: "Siliguri", km: 64, minutes: 165 },
    fromHub: { air: "Prepaid taxis are available at the airport. Allow about 3 hours to reach Darjeeling.", rail: "Prepaid taxis are available at the station and shared jeeps wait outside. Allow about 3 hours to reach Darjeeling." },
  },
  goa: {
    checked: "Oct 2026",
    air: [
      { name: "Goa Dabolim International Airport", code: "GOI", area: "Dabolim, near Vasco da Gama", km: 52, minutes: 105, service: "most", note: "Shares its runway with the Indian Navy, so civil flights avoid some late-morning hours. Nearer South Goa. Distances are to central Goa." },
      { name: "Manohar International Airport", code: "GOX", area: "Mopa, North Goa", km: 75, minutes: 140, service: "most", note: "Goa's newer airport, in the north. For North Goa beaches it is much closer than Dabolim." },
    ],
    rail: [
      { name: "Madgaon Junction", code: "MAO", area: "Margao, South Goa", km: 29, minutes: 50, junction: true, note: "Goa's main station, where the Vasco da Gama line meets the Konkan Railway. Nearer South Goa." },
      { name: "Thivim", code: "THVM", area: "North Goa", km: 60, minutes: 100, note: "One of the main Konkan Railway stations for North Goa. Closer than Madgaon to Mapusa and the North Goa beaches." },
    ],
    bus: [
      { name: "Margao (Madgaon) Kadamba Bus Stand", area: "Margao, South Goa", km: 31, minutes: 55, operator: "government", operatorName: "KTC", bookingUrl: "https://www.goakadamba.com", goesTo: [{ place: "Mumbai", note: "Via Panaji, Mapusa and Kolhapur" }, { place: "Pune", note: "Via Ponda, Panaji, Mapusa and Kolhapur" }, { place: "Hubballi", note: "Via Ponda and Anmod" }, { place: "Gokarna", note: "Via Canacona and Karwar" }, { place: "Hyderabad" }] },
      { name: "Panaji (Panjim) Kadamba Bus Stand", area: "Patto, Panaji", km: 50, minutes: 85, operator: "government", operatorName: "KTC", bookingUrl: "https://www.goakadamba.com", goesTo: [{ place: "Kolhapur" }, { place: "Belagavi", note: "Via Ponda and Anmod" }, { place: "Hubballi", note: "Via Ponda and Anmod" }, { place: "Hosapete (for Hampi)", note: "Via Ponda, Anmod, Hubballi and Gadag" }, { place: "Karwar" }], note: "Mumbai and Pune buses start at Margao and pass through Panaji." },
    ],
    fromHub: { air: "Kadamba (KTCL) electric AC buses link Dabolim with Panaji and Calangute, and Mopa with Panaji, Mapusa, Margao and Calangute." },
  },
  gokarna: {
    checked: "Oct 2026",
    air: [
      { name: "Goa Dabolim International Airport", code: "GOI", area: "Dabolim, Goa", km: 144, minutes: 225, service: "most", note: "Nearest airport with many flights. Goa's other airport, Mopa (GOX), is farther from Gokarna." },
      { name: "Hubballi Airport", code: "HBX", area: "Hubballi", km: 149, minutes: 220, service: "more", note: "Fewer flights than Goa. The road to the coast crosses the Western Ghats." },
      { name: "Mangaluru International Airport", code: "IXE", area: "Bajpe, Mangaluru", km: 229, minutes: 305, service: "more" },
    ],
    rail: [
      { name: "Gokarna Road", code: "GOK", area: "Torke, near Gokarna", km: 10, minutes: 20, note: "Small Konkan Railway station. Only some trains stop here (for example Matsyagandha Express, KSR Bengaluru-Karwar Express, Poorna Express, Marusagar Express). Check that your train stops here." },
      { name: "Karwar", code: "KAWR", area: "Karwar", km: 53, minutes: 90, note: "One of the main stations in Uttara Kannada and the Konkan Railway's Karwar division headquarters." },
      { name: "Madgaon Junction", code: "MAO", area: "Margao, Goa", km: 108, minutes: 165, junction: true, note: "Goa's main station, where the Vasco da Gama line meets the Konkan Railway." },
    ],
    bus: [
      { name: "Gokarna Bus Stand (KSRTC)", km: 1, minutes: 5, operator: "both", operatorName: "KSRTC", bookingUrl: "https://ksrtc.in", goesTo: [{ place: "Bengaluru", note: "Overnight" }, { place: "Mangaluru" }, { place: "Margao (Goa)", note: "Via Karwar and Canacona" }, { place: "Karwar" }], note: "The stand is in Gokarna town. Some private buses drop at Gokarna Cross (Gokarna Road) or the check post instead." },
    ],
  },
  hampi: {
    checked: "Oct 2026",
    air: [
      { name: "Jindal Vijaynagar Airport", code: "VDY", area: "Toranagallu, near Hosapete", km: 39, minutes: 55, service: "few", note: "Very few flights land here, mostly to Bengaluru. Check your dates first, or fly to Hubballi or Bengaluru and continue by road." },
      { name: "Hubballi Airport", code: "HBX", km: 167, minutes: 205, service: "more" },
      { name: "Kempegowda International Airport", code: "BLR", area: "Bengaluru", km: 354, minutes: 395, service: "most" },
    ],
    rail: [
      { name: "Hosapete Junction", code: "HPT", area: "Hosapete (Hospet) town", km: 13, minutes: 25, note: "Overnight trains run from Bengaluru, Hyderabad and Goa." },
    ],
    bus: [
      { name: "Hosapete (Hospet) Bus Station", area: "Hosapete (Hospet) town", km: 12, minutes: 20, operator: "both", operatorName: "KKRTC / KSRTC", bookingUrl: "https://ksrtc.in/", goesTo: [{ place: "Bengaluru" }, { place: "Mysuru" }, { place: "Gokarna" }] },
    ],
    fromHub: { rail: "Local buses and auto-rickshaws run from Hosapete to Hampi, about 13 km.", bus: "Local buses run from Hosapete bus station to Hampi about every 15 to 20 minutes." },
  },
  jaipur: {
    checked: "Oct 2026",
    air: [
      { name: "Jaipur International Airport", code: "JAI", area: "Sanganer", km: 17, minutes: 25, service: "more" },
    ],
    rail: [
      { name: "Jaipur Junction", code: "JP", km: 2, minutes: 5, junction: true },
    ],
    bus: [
      { name: "Sindhi Camp Bus Stand", area: "Station Road", km: 3, minutes: 5, operator: "both", operatorName: "RSRTC", bookingUrl: "https://rsrtconline.rajasthan.gov.in/", goesTo: [{ place: "Delhi", note: "Frequent" }, { place: "Kota" }, { place: "Bundi" }], note: "Some RSRTC buses also leave from Narayan Singh Circle." },
    ],
  },
  khajuraho: {
    checked: "Oct 2026",
    air: [
      { name: "Khajuraho Airport", code: "HJR", km: 3, minutes: 10, service: "few", note: "Few flights, mostly to Delhi and Varanasi. Check your dates first." },
      { name: "Prayagraj Airport", code: "IXD", km: 252, minutes: 320, service: "more", note: "Fewer flights than a year ago. Check your dates first." },
      { name: "Chaudhary Charan Singh International Airport", code: "LKO", area: "Lucknow", km: 317, minutes: 340, service: "more" },
    ],
    rail: [
      { name: "Khajuraho", code: "KURJ", km: 6, minutes: 10, note: "The station is a few km outside the town and has fewer trains than Satna or Jhansi." },
      { name: "Satna Junction", code: "STA", km: 115, minutes: 125, junction: true },
      { name: "Jhansi Junction (Virangana Lakshmibai)", code: "VGLJ", km: 175, minutes: 195, junction: true, note: "The booking code changed from JHS to VGLJ in 2022." },
    ],
    bus: [
    ],
    busTown: { name: "Chhatarpur", km: 44, minutes: 50 },
    fromHub: { air: "Taxis and auto-rickshaws run between the airport and the temples.", rail: "No bus runs from Khajuraho station to the town, so take an auto-rickshaw or taxi." },
  },
  ladakh: {
    checked: "Oct 2026",
    air: [
      { name: "Kushok Bakula Rimpochee Airport", code: "IXL", area: "Leh", km: 8, minutes: 20, service: "more", note: "Flights land in the morning only and can be delayed by weather. Leh is about 3,500 m high: officials ask for at least 48 hours of rest before going higher." },
    ],
    rail: [
      { name: "Srinagar Railway Station", code: "SINA", area: "Nowgam, Srinagar", km: 428, minutes: 720, note: "Nearest railhead. Reach it by Vande Bharat from Jammu Tawi (about 5 h). The Srinagar-Leh road is open only part of the year, roughly May to November or December, and the drive is usually split over two days." },
      { name: "Jammu Tawi", code: "JAT", area: "Jammu", km: 658, minutes: 1110, junction: true, note: "Main railhead of Jammu and Kashmir, with many long-distance trains. Then the Vande Bharat to Srinagar, then road to Leh." },
    ],
    railNone: "There is no railway in Ladakh.",
    bus: [
      { name: "Leh Bus Stand", km: 1, minutes: 5, operator: "government", operatorName: "JKSRTC", goesTo: [{ place: "Srinagar", note: "Overnight halt at Kargil. Only while the Zoji La road is open." }, { place: "Manali", note: "Only while the Manali-Leh road is open, roughly June to October." }], note: "Long-distance buses run only when the high roads are open. Check the road and the bus before you travel." },
    ],
  },
  manali: {
    checked: "Oct 2026",
    air: [
      { name: "Kullu-Manali Airport", code: "KUU", area: "Bhuntar, near Kullu", km: 54, minutes: 95, service: "few", note: "Very few flights. Check your dates first." },
      { name: "Chandigarh International Airport", code: "IXC", area: "Chandigarh", km: 276, minutes: 455, service: "more", note: "Long mountain drive, about 7 to 8 hours." },
    ],
    rail: [
      { name: "Joginder Nagar", code: "JDNX", area: "End of the Kangra Valley narrow-gauge line", km: 160, minutes: 345, note: "A small narrow-gauge line with only a few trains. Most visitors take a train to Chandigarh and continue by road." },
      { name: "Chandigarh Junction", code: "CDG", area: "Chandigarh", km: 275, minutes: 445, junction: true, note: "The railhead most travellers use. Then about 7 to 9 hours by bus or taxi." },
    ],
    railNone: "There is no railway in the Kullu-Manali valley. The nearest station, Joginder Nagar, is a small narrow-gauge halt about 160 km away by road, so most travellers take a train to Chandigarh and continue by road.",
    bus: [
      { name: "Manali Bus Stand (Inter State Bus Terminus)", area: "Near Mall Road", km: 3, minutes: 10, operator: "both", operatorName: "HRTC", bookingUrl: "https://online.hrtchp.com/oprs-web/", goesTo: [{ place: "Delhi", note: "Overnight Volvo buses" }, { place: "Chandigarh" }, { place: "Shimla" }], note: "Private Volvo operators may use other pick-up points. Check your ticket." },
    ],
    fromHub: { rail: "Buses and taxis run on to Manali from Chandigarh. Allow 7 to 9 hours." },
  },
  "mount-abu": {
    checked: "Oct 2026",
    air: [
      { name: "Maharana Pratap Airport", code: "UDR", area: "Dabok, Udaipur", km: 177, minutes: 220, service: "more", note: "Mount Abu has no airport of its own. Expect a long drive, with a hill road at the end." },
      { name: "Sardar Vallabhbhai Patel International Airport", code: "AMD", area: "Ahmedabad", km: 231, minutes: 310, service: "most" },
    ],
    rail: [
      { name: "Abu Road", code: "ABR", area: "Abu Road town", km: 28, minutes: 55, note: "Mount Abu has no railway. Abu Road is the railhead, at the foot of the hill." },
    ],
    bus: [
      { name: "Mount Abu Bus Stand", km: 1, minutes: 5, operator: "both", operatorName: "RSRTC", bookingUrl: "https://rsrtconline.rajasthan.gov.in/", goesTo: [{ place: "Abu Road" }, { place: "Udaipur" }, { place: "Ahmedabad" }, { place: "Jaipur" }, { place: "Jodhpur" }] },
      { name: "Abu Road Bus Stand", area: "Abu Road town", km: 27, minutes: 55, operator: "both", operatorName: "RSRTC", bookingUrl: "https://rsrtconline.rajasthan.gov.in/", note: "At the foot of the hill. Buses and taxis go up to Mount Abu from Abu Road." },
    ],
    fromHub: { rail: "Taxis and buses to Mount Abu wait outside Abu Road station. Fewer run in the evening, so try to arrive by day." },
  },
  munnar: {
    checked: "Oct 2026",
    air: [
      { name: "Cochin International Airport", code: "COK", area: "Nedumbassery, near Kochi", km: 104, minutes: 210, service: "most", note: "The drive up to Munnar is a slow hill road." },
    ],
    rail: [
      { name: "Aluva", code: "AWY", area: "north of Kochi", km: 109, minutes: 210, note: "Closest well-served station on the Kerala side. KSRTC buses to Munnar run from here." },
      { name: "Ernakulam Junction", code: "ERS", area: "Kochi", km: 124, minutes: 240, junction: true },
    ],
    railNone: "There is no railway in Munnar.",
    bus: [
      { name: "Munnar Bus Stand (Main Bazaar)", area: "Main Bazaar, Munnar town", km: 1, minutes: 5, operator: "both", goesTo: [{ place: "Ernakulam (Kochi)" }, { place: "Theni" }] },
      { name: "Munnar KSRTC Bus Station", area: "Moolakadai, Munnar", km: 2, minutes: 5, operator: "government", operatorName: "KSRTC (Kerala)", bookingUrl: "https://onlineksrtcswift.com/" },
    ],
    fromHub: { air: "Taxis are easy to find at Kochi airport.", rail: "Taxis are easy to find at the stations. KSRTC buses to Munnar leave from the Aluva and Ernakulam bus stands, about 4 hours." },
  },
  mysuru: {
    checked: "Oct 2026",
    air: [
      { name: "Mysuru Airport", code: "MYQ", area: "Mandakalli, south of Mysuru", km: 9, minutes: 15, service: "few", note: "Few flights land here. Check your dates first, or fly to Bengaluru and continue by Flybus, train or road." },
      { name: "Kempegowda International Airport", code: "BLR", area: "Bengaluru", km: 184, minutes: 225, service: "most" },
    ],
    rail: [
      { name: "Mysuru Junction", code: "MYS", km: 4, minutes: 10, junction: true, note: "Direct trains to Bengaluru and Chennai (including Vande Bharat) and other cities." },
    ],
    bus: [
      { name: "Mysuru Sub Urban Bus Station", area: "Lashkar Mohalla, Bangalore-Nilgiri Road", km: 4, minutes: 10, operator: "government", operatorName: "KSRTC", bookingUrl: "https://ksrtc.in/", goesTo: [{ place: "Bengaluru" }, { place: "Madikeri (Coorg)" }, { place: "Mangaluru" }, { place: "Ooty" }, { place: "Ernakulam (Kochi)" }], note: "This is the KSRTC stand for long-distance buses. Local city buses use the City Bus Stand on Sayyaji Rao Road." },
    ],
    fromHub: { air: "From Bengaluru airport, KSRTC Flybus buses run to Mysuru." },
  },
  ooty: {
    checked: "Oct 2026",
    air: [
      { name: "Coimbatore International Airport", code: "CJB", area: "Coimbatore", km: 99, minutes: 205, service: "more", note: "The road up to Ooty is a winding ghat road." },
    ],
    rail: [
      { name: "Udagamandalam (Ooty)", code: "UAM", km: 2, minutes: 5, note: "End of the Nilgiri Mountain Railway toy train: about one train a day each way to Mettupalayam, slow, and cancelled in heavy rain." },
      { name: "Mettupalayam", code: "MTP", km: 51, minutes: 120, note: "Nearest broad-gauge station. The Nilgiri Express from Chennai ends here, and the toy train goes on to Ooty." },
      { name: "Coimbatore Junction", code: "CBE", area: "Coimbatore", km: 98, minutes: 190, junction: true },
    ],
    bus: [
      { name: "Ooty Bus Stand (Udhagamandalam Central Bus Stand)", area: "near Ooty railway station", km: 2, minutes: 5, operator: "government", operatorName: "TNSTC", bookingUrl: "https://www.tnstc.in/OTRSOnline/", goesTo: [{ place: "Coimbatore", note: "TNSTC" }, { place: "Mysuru", note: "KSRTC (Karnataka)" }, { place: "Bengaluru", note: "KSRTC (Karnataka)" }, { place: "Chennai", note: "SETC" }, { place: "Thiruvananthapuram", note: "SETC" }] },
    ],
    fromHub: { rail: "From Mettupalayam the Nilgiri Mountain Railway toy train climbs to Ooty." },
  },
  pushkar: {
    checked: "Oct 2026",
    air: [
      { name: "Kishangarh Airport", code: "KQH", area: "Kishangarh, near Ajmer", km: 36, minutes: 50, service: "few", note: "Few flights, and routes change from season to season. Check your dates first, or fly to Jaipur and continue by road." },
      { name: "Jaipur International Airport", code: "JAI", km: 148, minutes: 175, service: "more" },
      { name: "Indira Gandhi International Airport", code: "DEL", area: "Delhi", km: 403, minutes: 460, service: "most", note: "A long road trip of about 7 to 8 hours." },
    ],
    rail: [
      { name: "Ajmer Junction", code: "AII", km: 14, minutes: 30, junction: true, note: "Pushkar's own station (PUHT) has very few trains, so most travellers arrive at Ajmer." },
    ],
    bus: [
      { name: "Pushkar Bus Stand", km: 1, minutes: 5, operator: "both", operatorName: "RSRTC", bookingUrl: "https://rsrtconline.rajasthan.gov.in/", goesTo: [{ place: "Ajmer" }, { place: "Jaipur" }, { place: "Udaipur" }, { place: "Delhi", note: "Night buses" }], note: "Some buses stop at other points in town, such as the New Bus Stand, so check your ticket." },
    ],
    fromHub: { rail: "From Ajmer station, take a taxi (about 30 min) or a bus to Pushkar from Ajmer Bus Station." },
  },
  rishikesh: {
    checked: "Oct 2026",
    air: [
      { name: "Dehradun Jolly Grant Airport", code: "DED", area: "Jolly Grant, near Dehradun", km: 23, minutes: 35, service: "more" },
    ],
    rail: [
      { name: "Rishikesh", code: "RKSH", km: 4, minutes: 10 },
      { name: "Yog Nagari Rishikesh", code: "YNRK", km: 5, minutes: 10, note: "Newer station (opened January 2021) where several long-distance trains stop." },
      { name: "Haridwar Junction", code: "HW", area: "Haridwar", km: 21, minutes: 40, junction: true, note: "The main railhead for this area, much better connected than Rishikesh's own stations." },
    ],
    bus: [
      { name: "Rishikesh Bus Stand (ISBT)", area: "Adarsh Gram, on NH 7, next to the Yatra Bus Stand", km: 6, minutes: 10, operator: "both", operatorName: "UTC", bookingUrl: "https://utconline.uk.gov.in/", goesTo: [{ place: "Delhi" }, { place: "Haridwar" }, { place: "Dehradun" }] },
    ],
    fromHub: { rail: "From Haridwar station, a bus to Rishikesh takes about 45 minutes and a taxi about 30 minutes." },
  },
  shimla: {
    checked: "Oct 2026",
    air: [
      { name: "Shimla Airport", code: "SLV", area: "Jubbarhatti", km: 19, minutes: 40, service: "few", note: "Very few flights, all on one airline (Alliance Air), and service has been stopped for months before. Check your dates first." },
      { name: "Chandigarh International Airport", code: "IXC", area: "Chandigarh", km: 116, minutes: 205, service: "more" },
      { name: "Indira Gandhi International Airport", code: "DEL", area: "Delhi", km: 385, minutes: 460, service: "most", note: "Long drive, about 8 hours." },
    ],
    rail: [
      { name: "Shimla", code: "SML", km: 1, minutes: 5, note: "Narrow-gauge toy train station. Trains run only from Kalka and take about 5 hours." },
      { name: "Kalka", code: "KLK", area: "Kalka, near Chandigarh", km: 86, minutes: 130, note: "The broad-gauge railhead. The toy train to Shimla takes about 5 hours; a bus or taxi about 2 hours." },
      { name: "Chandigarh Junction", code: "CDG", area: "Chandigarh", km: 105, minutes: 190, junction: true },
    ],
    bus: [
      { name: "Shimla Old Bus Stand (Old ISBT)", area: "West of Lower Bazaar", km: 1, minutes: 5, operator: "government", operatorName: "HRTC", bookingUrl: "https://online.hrtchp.com/oprs-web/", note: "Mostly regional and local buses." },
      { name: "Shimla ISBT (Tutikandi)", area: "Tutikandi, about 4 km from the town centre", km: 4, minutes: 10, operator: "both", operatorName: "HRTC", bookingUrl: "https://online.hrtchp.com/oprs-web/", goesTo: [{ place: "Chandigarh" }, { place: "Delhi" }, { place: "Manali" }, { place: "Mandi" }], note: "Local buses link it to the Mall and the town centre." },
    ],
    fromHub: { air: "A pre-paid taxi is the easiest way into town.", rail: "From Kalka, the narrow-gauge train to Shimla takes about 5 hours." },
  },
  tirupati: {
    checked: "Oct 2026",
    air: [
      { name: "Tirupati International Airport", code: "TIR", area: "Renigunta, near Tirupati", km: 17, minutes: 35, service: "more" },
      { name: "Chennai International Airport", code: "MAA", area: "Chennai", km: 149, minutes: 175, service: "most" },
      { name: "Kempegowda International Airport", code: "BLR", area: "Bengaluru", km: 227, minutes: 280, service: "most" },
    ],
    rail: [
      { name: "Tirupati Railway Station", code: "TPTY", area: "Tirupati city", km: 1, minutes: 5, note: "The city's main station for pilgrims going to Tirumala." },
      { name: "Renigunta Junction", code: "RU", area: "Renigunta", km: 10, minutes: 15, junction: true, note: "Major junction on the Mumbai-Chennai line. Many pilgrims get off here for Tirupati." },
    ],
    bus: [
      { name: "Tirupati Central Bus Station", area: "Tatanagar, Tirupati", km: 1, minutes: 5, operator: "government", operatorName: "APSRTC", bookingUrl: "https://www.apsrtconline.in", goesTo: [{ place: "Tirumala", note: "From the Yedukondala section of the station" }, { place: "Chennai" }, { place: "Bengaluru" }, { place: "Hyderabad" }, { place: "Vijayawada" }] },
    ],
  },
  udaipur: {
    checked: "Oct 2026",
    air: [
      { name: "Maharana Pratap Airport", code: "UDR", area: "Dabok, Udaipur", km: 21, minutes: 30, service: "more" },
    ],
    rail: [
      { name: "Rana Pratap Nagar", code: "RPZ", area: "Khempura, Udaipur", km: 2, minutes: 5, note: "Udaipur's second station. Only some trains stop here, so check yours does." },
      { name: "Udaipur City", code: "UDZ", km: 4, minutes: 5, note: "The main station. Long-distance trains such as the Mewar Express and the Ahmedabad Vande Bharat start here." },
    ],
    bus: [
      { name: "Udaipur City Bus Stand", area: "Udaipole, Station Road", km: 2, minutes: 5, operator: "both", operatorName: "RSRTC", bookingUrl: "https://rsrtconline.rajasthan.gov.in/", goesTo: [{ place: "Jaipur" }, { place: "Ahmedabad" }, { place: "Jodhpur" }, { place: "Delhi" }, { place: "Mount Abu" }] },
    ],
  },
  varanasi: {
    checked: "Oct 2026",
    air: [
      { name: "Lal Bahadur Shastri International Airport", code: "VNS", area: "Babatpur, north-west of the city", km: 25, minutes: 30, service: "more" },
    ],
    rail: [
      { name: "Varanasi Junction (Cantt)", code: "BSB", area: "Cantt", km: 2, minutes: 5, junction: true },
      { name: "Banaras (formerly Manduadih)", code: "BNRS", km: 4, minutes: 5, note: "The code was recently changed from BSBS to BNRS. If a train app cannot find it, search for Banaras." },
      { name: "Varanasi City", code: "BCY", km: 5, minutes: 5, note: "A smaller satellite station built to relieve Varanasi Junction." },
    ],
    bus: [
      { name: "Varanasi Cantt Bus Station (Chaudhary Charan Singh Bus Station)", area: "Next to Varanasi Cantt railway station", km: 2, minutes: 5, operator: "government", operatorName: "UPSRTC", bookingUrl: "https://upsrtc.up.gov.in/", goesTo: [{ place: "Prayagraj" }, { place: "Lucknow" }, { place: "Patna" }] },
    ],
  },
};

/** The entries a person reviewed by hand. Use getGateways() from placeGateways.ts to also get the generated ones. */
export function getReviewedGateways(destId: string): PlaceGateways | undefined {
  return GATEWAYS[destId];
}
