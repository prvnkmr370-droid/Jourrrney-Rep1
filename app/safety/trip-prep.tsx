import { router, useLocalSearchParams } from "expo-router";
import { DESTINATIONS } from "@/data/destinations";
import { useRecentlyViewedStore } from "@/store/useRecentlyViewedStore";
import TripPrepPacking from "@/screens/TripPrep/TripPrepPacking";

export default function TripPrepRoute() {
  // Destination Detail's Overview teaser links here with an explicit
  // ?destId so it always opens packing for the destination the user was
  // just looking at. The Safety tab's entry point has no destination
  // context, so it keeps falling back to the most recently viewed one.
  const { destId } = useLocalSearchParams<{ destId?: string }>();
  const recentIds = useRecentlyViewedStore((s) => s.destinationIds);
  const destination =
    DESTINATIONS.find((d) => d.id === destId) ??
    DESTINATIONS.find((d) => d.id === recentIds[0]) ??
    DESTINATIONS.find((d) => d.id === "agra") ??
    DESTINATIONS[0];

  return <TripPrepPacking destination={destination} onBack={() => router.back()} />;
}
