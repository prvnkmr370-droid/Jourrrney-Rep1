import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { DESTINATIONS } from "@/data/destinations";
import DestinationPage, { isDestinationPage } from "@/screens/DestinationDetail/pages/DestinationPages";
import { useThemeColors } from "@/theme/useThemeColors";

/** /destination/<id>/stay | reach | know | safety: the pages a destination's rows open. */
export default function DestinationPageRoute() {
  const c = useThemeColors();
  const { id, page } = useLocalSearchParams<{ id: string; page: string }>();
  const destination = DESTINATIONS.find((d) => d.id === id);

  if (!destination || !isDestinationPage(page)) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: c.bg }}>
        <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 16, color: c.textPrimary }}>
          No page "{page}" for "{id}"
        </Text>
      </View>
    );
  }

  return <DestinationPage destination={destination} page={page} />;
}
