import { router } from "expo-router";
import SplashScreen from "@/screens/SplashScreen/SplashScreen";

export default function SplashRoute() {
  return <SplashScreen onComplete={() => router.replace("/onboarding")} />;
}
