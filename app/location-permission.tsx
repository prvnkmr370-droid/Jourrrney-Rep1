import { router } from "expo-router";
import LocationPermission from "@/screens/LocationPermission/LocationPermission";

export default function LocationPermissionRoute() {
  return <LocationPermission onDone={() => router.replace("/(tabs)")} />;
}
