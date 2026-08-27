import { router } from "expo-router";
import TravelSafeSteps from "@/screens/WomenSafety/TravelSafeSteps";

export default function TravelSafeStepsRoute() {
  return <TravelSafeSteps onBack={() => router.back()} />;
}
