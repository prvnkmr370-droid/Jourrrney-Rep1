import { router } from "expo-router";
import SettingsPrivacy from "@/screens/Profile/SettingsPrivacy";

export default function SettingsRoute() {
  return <SettingsPrivacy onBack={() => router.back()} />;
}
