import { router } from "expo-router";
import OnboardingLogin from "@/screens/OnboardingLogin/OnboardingLogin";

/**
 * Reuses the same login flow shown during onboarding, but reached later
 * from My Account's "Sign in" row (see MyAccount.tsx) — unlike the
 * onboarding route, which hands off to /location-permission on completion,
 * this one just pops back to wherever it was opened from (My Account),
 * since the user is already deep in the app rather than in first-run setup.
 */
export default function ProfileSignInRoute() {
  return <OnboardingLogin onDone={() => router.back()} />;
}
