/**
 * Well-known Indian city/town names — used only for fuzzy typo-correction
 * in useCitySearch.ts (e.g. "Hyderabab" -> "Hyderabad"), not as a source
 * of coordinates. Open-Meteo's geocoding API does plain substring/prefix
 * matching with no fuzzy tolerance at all — a single typo'd character
 * returns zero results — so a short edit-distance away from the user's
 * input against this list is what actually catches it; the corrected name
 * is then re-geocoded live for real coordinates, never hardcoded here.
 *
 * Covers state/UT capitals, the ~100 largest Indian cities by population,
 * and widely-known tourist/travel-origin towns. Not exhaustive — it only
 * needs to catch realistic typos of places someone would plausibly type as
 * a trip's starting city, not every settlement in India.
 */
export const INDIAN_CITY_NAMES: string[] = [
  "Mumbai", "Delhi", "New Delhi", "Bengaluru", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai",
  "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal",
  "Visakhapatnam", "Vizag", "Patna", "Vadodara", "Baroda", "Ghaziabad", "Ludhiana", "Agra", "Nashik",
  "Faridabad", "Meerut", "Rajkot", "Varanasi", "Banaras", "Srinagar", "Amritsar", "Prayagraj", "Allahabad",
  "Ranchi", "Coimbatore", "Jabalpur", "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota",
  "Guwahati", "Chandigarh", "Thiruvananthapuram", "Trivandrum", "Solapur", "Hubli", "Dharwad", "Mysuru",
  "Mysore", "Tiruchirappalli", "Trichy", "Bareilly", "Aligarh", "Moradabad", "Jalandhar", "Bhubaneswar",
  "Salem", "Warangal", "Guntur", "Bhiwandi", "Saharanpur", "Gorakhpur", "Bikaner", "Amravati", "Noida",
  "Jamshedpur", "Bhilai", "Cuttack", "Firozabad", "Kochi", "Cochin", "Ernakulam", "Nellore", "Bhavnagar",
  "Dehradun", "Durgapur", "Asansol", "Rourkela", "Nanded", "Kolhapur", "Ajmer", "Akola", "Gulbarga",
  "Kalaburagi", "Jamnagar", "Ujjain", "Siliguri", "Jhansi", "Jammu", "Mangalore", "Mangaluru", "Erode",
  "Belgaum", "Belagavi", "Tirunelveli", "Gaya", "Jalgaon", "Udaipur", "Davanagere", "Kozhikode", "Calicut",
  "Kurnool", "Rajahmundry", "Bokaro", "Bellary", "Ballari", "Patiala", "Agartala", "Bhagalpur",
  "Muzaffarnagar", "Latur", "Dhule", "Rohtak", "Korba", "Bhilwara", "Berhampur", "Muzaffarpur",
  "Ahmednagar", "Mathura", "Kollam", "Kadapa", "Bilaspur", "Shahjahanpur", "Satara", "Bijapur", "Vijayapura",
  "Rampur", "Shivamogga", "Shimoga", "Chandrapur", "Junagadh", "Thrissur", "Trichur", "Alwar",
  "Bardhaman", "Burdwan", "Nizamabad", "Parbhani", "Tumkur", "Tumakuru", "Khammam", "Panipat", "Darbhanga",
  "Aizawl", "Dewas", "Karnal", "Bathinda", "Jalna", "Eluru", "Barabanki", "Purnia", "Satna", "Mau",
  "Sonipat", "Sagar", "Durg", "Imphal", "Ratlam", "Hapur", "Arrah", "Anantapur", "Karimnagar", "Etawah",
  "Bharatpur", "Begusarai", "Gandhidham", "Puducherry", "Pondicherry", "Sikar", "Thoothukudi", "Tuticorin",
  "Rewa", "Mirzapur", "Raichur", "Pali", "Ramagundam", "Haridwar", "Vizianagaram", "Katihar", "Nagaon",
  "Singrauli", "Nadiad", "Secunderabad", "Yamunanagar", "Panchkula", "Burhanpur", "Kharagpur", "Dindigul",
  "Gandhinagar", "Hospet", "Hosapete", "Hampi", "Ooty", "Udhagamandalam", "Munnar", "Manali", "Shimla",
  "Darjeeling", "Rishikesh", "Pushkar", "Mount Abu", "Gangtok", "Leh", "Kargil", "Gokarna", "Alappuzha",
  "Alleppey", "Kovalam", "Jaisalmer", "Jaisalmer", "Khajuraho", "Puri", "Mahabalipuram", "Mamallapuram",
  "Wayanad", "Madikeri", "Coorg", "Lonavala", "Mahabaleshwar", "Panchgani", "Nainital", "Mussoorie",
  "Kasauli", "Dharamshala", "McLeodganj", "Dalhousie", "Auli", "Tawang", "Shillong", "Kaziranga", "Majuli",
  "Bodh Gaya", "Ayodhya", "Mathura", "Vrindavan", "Haridwar", "Rameswaram", "Kanyakumari", "Hampi",
  "Pushkar", "Udupi", "Gokarna", "Diu", "Daman", "Silvassa", "Itanagar", "Kohima", "Dimapur", "Imphal",
  "Agartala", "Aizawl", "Shillong", "Gangtok", "Port Blair", "Kavaratti", "Panaji", "Margao", "Vasco da Gama",
];
