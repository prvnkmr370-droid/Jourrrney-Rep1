/**
 * Source of truth: Figma "5.4 Offline Maps & Saved Guides". No real
 * offline-tile caching is wired up (that's a substantial native feature —
 * map tile storage, background download, cache eviction); "Get" just
 * flips a local "downloaded" flag so the interaction is real even though
 * nothing is actually cached to disk yet.
 */
import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Check } from "lucide-react-native";
import { useThemeColors } from "@/theme/useThemeColors";

interface Props {
  onBack: () => void;
}

interface Guide {
  id: string;
  title: string;
  sizeMb: number;
  downloaded: boolean;
}

const INITIAL_GUIDES: Guide[] = [
  { id: "udaipur", title: "Udaipur — City Map", sizeMb: 48, downloaded: true },
  { id: "jaipur", title: "Jaipur — City Map", sizeMb: 62, downloaded: true },
  { id: "karnataka", title: "Karnataka — Region Guide", sizeMb: 112, downloaded: true },
  { id: "hampi", title: "Hampi — City Map", sizeMb: 36, downloaded: false },
];

export default function OfflineMaps({ onBack }: Props) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const [guides, setGuides] = useState(INITIAL_GUIDES);

  const totalMb = guides.filter((g) => g.downloaded).reduce((sum, g) => sum + g.sizeMb, 0);

  const handleGet = (id: string) => {
    setGuides((prev) => prev.map((g) => (g.id === id ? { ...g, downloaded: true } : g)));
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <Pressable onPress={onBack} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft color={c.textPrimary} size={18} />
        </Pressable>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 18, color: c.textPrimary }}>Offline Maps & Guides</Text>
      </View>
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary, marginBottom: 20 }}>
        {totalMb} MB downloaded · Available without signal
      </Text>

      <View style={{ gap: 10 }}>
        {guides.map((g) => (
          <View key={g.id} style={{ flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 12 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: c.surfaceAlt, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 18 }}>🗺️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary }}>{g.title}</Text>
              <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: g.downloaded ? c.success : c.textSecondary }}>
                {g.downloaded ? `${g.sizeMb} MB · Ready offline` : "Not downloaded"}
              </Text>
            </View>
            {g.downloaded ? (
              <Check color={c.success} size={18} />
            ) : (
              <Pressable onPress={() => handleGet(g.id)} style={{ backgroundColor: c.surfaceAlt, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 }}>
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: c.primary }}>Get</Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
