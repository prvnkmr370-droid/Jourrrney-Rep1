/**
 * Maps the plain-string travel-mode icons stored in data (destinations.ts
 * `transport[].icon`, journeyGuides.ts `arrivalPoints[].icon` and
 * `toAccommodation[].icon`) to a monochrome lucide icon, instead of
 * rendering color emoji. Data predates this and is a mix of emoji and a
 * few newer plain-word values ("plane", "car", ...) — this accepts both
 * so neither encoding needs a migration. Falls back to rendering the raw
 * string as-is for anything not covered (e.g. a future data entry using a
 * new emoji), rather than silently showing nothing.
 */
import { createElement } from "react";
import { Text } from "react-native";
import {
  Plane,
  TrainFront,
  Car,
  TramFront,
  Ship,
  Sailboat,
  Bike,
  Footprints,
  Mountain,
  Binoculars,
  BusFront,
  Ticket,
  MapPin,
  Map,
  Smartphone,
  Droplet,
  BedDouble,
  Tent,
  Helicopter,
  type LucideIcon,
} from "lucide-react-native";

const TRAVEL_MODE_ICONS: Record<string, LucideIcon> = {
  "✈️": Plane,
  plane: Plane,
  "🚂": TrainFront,
  train: TrainFront,
  "🚆": TrainFront,
  "🚗": Car,
  car: Car,
  "🚗⛴️": Car,
  "🚗🚆": Car,
  "🚇": TramFront,
  "🚁": Helicopter,
  "🚢": Ship,
  ship: Ship,
  "🛳️": Ship,
  "⛴️": Ship,
  "⛵": Sailboat,
  "🚤": Sailboat,
  "🏍️": Bike,
  "🛵": Bike,
  "🚲": Bike,
  "🚶": Footprints,
  "🥾": Footprints,
  "🔭": Binoculars,
  "🚌": BusFront,
  "🛺": BusFront,
  "🎟️": Ticket,
  "📍": MapPin,
  "🗺️": Map,
  "📱": Smartphone,
  "💧": Droplet,
  "🛏️": BedDouble,
  "🏨": BedDouble,
  "🏕️": Tent,
  "🏔️": Mountain,
};

export function TravelModeIcon({ value, color, size = 16 }: { value: string; color: string; size?: number }) {
  const Icon = TRAVEL_MODE_ICONS[value.trim()];
  if (!Icon) return createElement(Text, { style: { fontSize: size } }, value);
  return createElement(Icon, { color, size });
}
