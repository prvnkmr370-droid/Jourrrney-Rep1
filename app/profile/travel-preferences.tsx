import { router } from "expo-router";
import TravelPreferences from "@/screens/Profile/TravelPreferences";

export default function TravelPreferencesRoute() {
  return <TravelPreferences onBack={() => router.back()} />;
}
