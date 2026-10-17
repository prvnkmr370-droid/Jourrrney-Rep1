/**
 * Full addresses, with the postal (PIN) code where it could be confirmed, for the
 * destinations where one could be found and checked. Shown on the destination
 * page beside the "Map" button. Every other destination shows only its name and
 * state (see utils/placeAddress.ts), because that is all we know for sure.
 *
 * Sources, looked up once (not live):
 *  - Street and area: OpenStreetMap place search (https://nominatim.openstreetmap.org),
 *    © OpenStreetMap contributors, Open Database Licence
 *    (https://www.openstreetmap.org/copyright).
 *  - Postal code: India Post's PIN directory, through its public lookup
 *    (https://api.postalpincode.in). OpenStreetMap's own postcode was kept only
 *    when India Post confirmed the PIN exists in the right state and matches the
 *    area or the place's name; several were wrong (for example one for Tithal
 *    Beach did not exist) and were replaced by India Post's answer or left out.
 *
 * How the 87 entries were chosen: the 601 destinations that have coordinates were
 * searched by name and state; an address was kept only when the result had the
 * same name, was in the same state, was close to our own coordinates and was the
 * place itself (a fort, temple, cave, lake and so on, not a hotel, hospital or
 * railway station). 52 of them have a confirmed PIN; the rest have none because
 * India Post could not confirm one. Credited in Settings > Photo credits.
 */
export const DESTINATION_ADDRESSES: Record<string, string> = {
  "achalgarh-fort": "Goa Gaon Road, Mount Abu, Rajasthan",
  "ajanta-caves": "NH753F, Phardapur, Maharashtra 431118",
  "ambaji-temple": "State Highway 9, Ambaji, Gujarat 385110",
  "amboli": "Valvan, Maharashtra",
  "araku": "Araku Valley, Andhra Pradesh 531151",
  "badi-lake": "Upli Badi, Rajasthan",
  "bekal-fort": "Bekal, Kerala 671316",
  "betla-national-park": "SH9, Betla, Jharkhand 822111",
  "bhadra-fort": "Swami Vivekananda Road, Khadia, Ahmedabad, Gujarat 380001",
  "bhakra-dam": "Naina Devi, Bilaspur, Himachal Pradesh 174310",
  "bhangarh": "SH29A / 77, Gola Ka Bas, Rajasthan",
  "bhimashankar": "Bhimashankar, Maharashtra 410509",
  "bhongir-fort": "Bhuvanagiri Main Road, Bhongir, Telangana",
  "biate-mizoram": "Champhai, Mizoram 796370",
  "borra-caves": "Eguvamamidi, Andhra Pradesh",
  "carambolim-lake": "Corlim, Gandaulim, Goa 403110",
  "champaner-pavagadh-archaeological-park": "Pavagadh Hills Road, Manchi Haveli, Pavagadh, Gujarat 389360",
  "chandil-dam": "Chandil, Jharkhand 832401",
  "chandragiri-fort-ap": "Chandragiri, Andhra Pradesh 517101",
  "chandragiri-fort-kasaragod": "MDR100, Melparamba, Kerala 671317",
  "chang-la": "Nubra, Ladakh",
  "chapora-fort": "Chapora Jetty Road, Anjuna, Chapora, Goa 403509",
  "chembra-peak": "Vythiri, Kerala 673576",
  "cherai-beach": "Cherai, Kerala 683514",
  "corjuem-fort": "Bicholim Road, Aldona, Corjuem, Goa 403508",
  "dal-lake": "Srinagar, Jammu and Kashmir",
  "daulatabad-fort": "Beed Chalisgaon, Daulatabad, Maharashtra 431002",
  "edakkal-caves": "Sultan Bathery, Kerala",
  "eklingji": "NH58, Bilota, Rajasthan 313202",
  "ellora-caves": "Beed Chalisgaon, Ellora, Maharashtra",
  "ghoom-monastery": "Hill Cart Road, Ghoom, West Bengal 734102",
  "gingee-fort": "Thiruvannamalai Road, Alampoondi, Tamil Nadu 604202",
  "gobindgarh-fort-amritsar": "Cantonment, Amritsar, Punjab 143001",
  "gokak-falls": "Gokak taluku, Karnataka 591307",
  "golconda-fort": "Golconda, Hyderabad, Telangana 500008",
  "horsley-hills": "Mogasalamarri, Andhra Pradesh",
  "hundru-falls": "Angara, Jharkhand",
  "jog-falls": "Kargal, Karnataka 577421",
  "jonha-falls": "Angara, Jharkhand",
  "kalsubai": "Karanda, Maharashtra",
  "kamakhya-temple": "Pandu Kamakhya Road, Kamakhya Dham, Maligaon, Assam 781010",
  "kangra-fort": "Pandit Bal Krishna Sharma Marg, Old Kangra, Kaswara, Himachal Pradesh 176001",
  "kanke-dam": "Patrā Gondātoli, Ranchi, Jharkhand",
  "kappad-beach": "Chemanchery, Kerala",
  "kasarkod-beach": "Tonka, Karnataka 581342",
  "kashid-beach": "Kashid, Maharashtra 402401",
  "kesariya-stupa": "Mehsi - Rampur Khajuriya Rd, Kesariya, Bihar",
  "khajjiar": "Khajjiar, Himachal Pradesh 176314",
  "khardung-la": "Leh, Ladakh",
  "kondapalli-fort": "Kondapalli, Andhra Pradesh 521228",
  "kovalam-beach": "Kovalam, Neyyattinkara, Kerala 695527",
  "kudle-beach": "Gokarna, Karnataka 581326",
  "kumhrar": "Rajendra Nagar, Patna, Bihar 800026",
  "linganamakki-dam": "Linganamakki, Karnataka 577421",
  "lodh-falls": "Mahuadanr, Jharkhand",
  "lohagarh-fort": "Kali Bagichi, Bharatpur, Rajasthan 321001",
  "mandarmani": "Mandarmani, West Bengal",
  "mansar-lake": "Samba, Jammu and Kashmir 184121",
  "marari-beach": "Marari Beach, Mararikkulam, Kerala",
  "mayem-lake": "Bicholim, Goa",
  "mirjan-fort": "Edapally- Panvel Highway, Mirjana, Karnataka 581440",
  "nagara-fort-bidanur": "NH766C, Nagara, Karnataka",
  "nahargarh-fort": "New Rambah Road, Bani Park, Jaipur, Rajasthan 302006",
  "omkareshwar": "SH36A, Kothi, Omkareshwar, Madhya Pradesh 450554",
  "padri-bhaderwah": "Bhaderwah, Jammu and Kashmir 182222",
  "palakkad-fort": "East Fort Road, Kunnathurmedu, Palakkad, Kerala 678001",
  "panchet-dam": "Nirsa-Cum-Chirkunda, Jharkhand",
  "panhala-fort": "NH166, Navali, Maharashtra",
  "panipat-museum": "Krishanpura Main Bazaar, Panipat, Haryana 132106",
  "penukonda-fort": "Penukonda, Andhra Pradesh 515110",
  "pul-kanjri-amritsar": "Grand Trunk Road, Rorawala Khurd, Punjab",
  "rachol-fort": "Raia Santimol Road, Raia, Rachol, Goa 403720",
  "ramappa-temple": "Palampet, Telangana 506165",
  "ranchi-lake": "Harmu, Ranchi, Jharkhand",
  "reis-magos-fort": "Reis Magos Road, Verem, Reis Magos, Goa 403114",
  "renuka-lake": "Renuka Ji, Himachal Pradesh",
  "rock-garden": "Sector 1, Chandigarh 160001",
  "sandakphu": "Darjeeling Pulbazar, West Bengal",
  "singur-dam": "Bhusareddipalle, Telangana",
  "talakona-waterfall": "Talakona, Andhra Pradesh",
  "tithal-beach": "SH6 / SH67, Valsad, Gujarat",
  "triund": "Dharamshala, Himachal Pradesh",
  "tungabhadra-dam": "Tungabhadra Colony, Hosapete, Karnataka",
  "tura-peak": "Tura, Meghalaya 794001",
  "undavalli-caves": "Undavalli Road, Undavalli, Andhra Pradesh 522501",
  "varkala-beach": "Varkala, Kerala",
  "vellore-fort": "Fort Round Road, Kosapet, Vellore, Tamil Nadu 632008",
};
