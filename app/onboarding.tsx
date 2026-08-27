import { router } from "expo-router";
import OnboardingLogin from "@/screens/OnboardingLogin/OnboardingLogin";

export default function OnboardingRoute() {
  return <OnboardingLogin onDone={() => router.replace("/location-permission")} />;
}
