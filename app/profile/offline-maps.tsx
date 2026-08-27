import { router } from "expo-router";
import OfflineMaps from "@/screens/Profile/OfflineMaps";

export default function OfflineMapsRoute() {
  return <OfflineMaps onBack={() => router.back()} />;
}
