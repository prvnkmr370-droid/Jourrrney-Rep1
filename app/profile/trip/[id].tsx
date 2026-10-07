import { useMemo } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Text, View } from "react-native";
import { deserializePlan } from "@/screens/PlanTrip/savedTrips";
import ResultStep from "@/screens/PlanTrip/steps/ResultStep";
import { useSavedTripsStore } from "@/store/useSavedTripsStore";
import { useThemeColors } from "@/theme/useThemeColors";

/** A trip reopened from My trips — the same result screen as a fresh plan,
 * minus the controls that only make sense while building one. */
export default function SavedTripRoute() {
  const c = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  // Select the stored list (a stable reference) and rebuild the plan from it
  // here: rebuilding inside the selector returns a new object on every read,
  // which makes the store hook re-render forever.
  const trips = useSavedTripsStore((s) => s.trips);
  const plan = useMemo(() => {
    const trip = trips.find((t) => t.id === id);
    return trip ? deserializePlan(trip.plan) : null;
  }, [trips, id]);

  if (!plan) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: c.bg, padding: 24 }}>
        <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 15, color: c.textPrimary, textAlign: "center" }}>This saved trip is no longer available.</Text>
        <Text onPress={() => router.back()} style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.primary, marginTop: 12 }}>
          Go back
        </Text>
      </View>
    );
  }
  return <ResultStep plan={plan} savedTripId={id} onBack={() => router.back()} />;
}
