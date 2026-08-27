import { useLocalSearchParams, router } from "expo-router";
import { Text, View } from "react-native";
import { DESTINATIONS } from "@/data/destinations";
import DestinationDetail from "@/screens/DestinationDetail/DestinationDetail";
import { useThemeColors } from "@/theme/useThemeColors";

export default function DestinationRoute() {
  const c = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const destination = DESTINATIONS.find((d) => d.id === id);

  if (!destination) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: c.bg }}>
        <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 16, color: c.textPrimary }}>
          No destination with id "{id}"
        </Text>
      </View>
    );
  }

  return (
    <DestinationDetail
      destination={destination}
      onBack={() => router.back()}
      onPlanTrip={(destId) => router.push(`/plan/${destId}`)}
    />
  );
}
