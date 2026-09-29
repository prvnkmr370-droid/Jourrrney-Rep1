import { router } from "expo-router";
import OnboardingLogin from "@/screens/OnboardingLogin/OnboardingLogin";

export default function OnboardingRoute() {
  // Used to hand off to /location-permission here, requesting location
  // access right after login before the user had done anything that
  // needed it. Location is now only ever requested on-demand — e.g. via
  // useDetectLocation when the user taps the locate button in Destination
  // Detail's "How to Reach" tab (see ArriveSection.tsx) — so onboarding
  // goes straight into the app instead.
  return <OnboardingLogin onDone={() => router.replace("/(tabs)")} />;
}
