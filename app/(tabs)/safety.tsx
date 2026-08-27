import { router } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import SafetySearchHome from "@/screens/WomenSafety/SafetySearchHome";

export default function SafetyTab() {
  const tabBarHeight = useBottomTabBarHeight();
  return (
    <SafetySearchHome
      tabBarHeight={tabBarHeight}
      onSelectDestination={(d) => router.push(`/safety/${d.id}`)}
      onTravelSafeSteps={() => router.push("/safety/travel-safe-steps")}
      onTripPrep={() => router.push("/safety/trip-prep")}
    />
  );
}
