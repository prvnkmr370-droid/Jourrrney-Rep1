import { router } from "expo-router";
import SafetyGuardSetup from "@/screens/Profile/SafetyGuardSetup";

export default function SafetyGuardRoute() {
  return <SafetyGuardSetup onBack={() => router.back()} />;
}
