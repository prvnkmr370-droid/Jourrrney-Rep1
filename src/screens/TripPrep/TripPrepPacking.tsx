/**
 * Source of truth: Figma "3.3 Trip Prep & Packing Assistant". Header +
 * "Personalised for {destination}" chrome around the shared PackingSection
 * body — also embedded (without this chrome) in Destination Detail's
 * Overview tab, right after Top Highlights.
 */
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { useThemeColors } from "@/theme/useThemeColors";
import PackingSection from "./PackingSection";

interface Props {
  destination: Destination;
  onBack: () => void;
}

export default function TripPrepPacking({ destination: d, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <Pressable onPress={onBack} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft color={c.textPrimary} size={18} />
        </Pressable>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 18, color: c.textPrimary }}>Trip Prep & Packing</Text>
      </View>
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary, marginBottom: 16 }}>
        Personalised for {d.name}, {d.bestSeason}
      </Text>

      <PackingSection destination={d} />
    </ScrollView>
  );
}
