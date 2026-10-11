import { router } from "expo-router";
import PhotoCredits from "@/screens/Profile/PhotoCredits";

export default function PhotoCreditsRoute() {
  return <PhotoCredits onBack={() => router.back()} />;
}
