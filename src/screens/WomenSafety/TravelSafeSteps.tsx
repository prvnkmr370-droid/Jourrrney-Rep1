/** Source of truth: Figma "3.4 Travel Safe — 5 Steps". */
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { withOpacity } from "@/components/withOpacity";
import { useThemeColors } from "@/theme/useThemeColors";

interface Props {
  onBack: () => void;
}

const STEPS = [
  { title: "Always share location", body: "Use Google Maps live location with a trusted contact before every new leg." },
  { title: "Book trusted transport", body: "Use Ola, Uber, or RedBus. Note the vehicle number and driver ID before boarding." },
  { title: "Choose central stays", body: "Established hotels or hostels in busy tourist areas, not isolated guesthouses." },
  { title: "Night travel safety", body: "Book overnight trains with AC coaches rather than unreserved seating." },
  { title: "Trust your gut", body: "If a situation, person, or place feels off — leave immediately." },
];

export default function TravelSafeSteps({ onBack }: Props) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <Pressable onPress={onBack} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft color={c.textPrimary} size={18} />
        </Pressable>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 22, color: c.textPrimary }}>Travel Safe</Text>
      </View>
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary, marginBottom: 20 }}>
        A few habits that go a long way — for anyone travelling solo, especially women.
      </Text>

      <View style={{ gap: 12, marginBottom: 20 }}>
        {STEPS.map((step, i) => (
          <View key={step.title} style={{ flexDirection: "row", gap: 14, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 16 }}>
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: withOpacity(c.teal, 0.15), alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.teal }}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.textPrimary, marginBottom: 3 }}>{step.title}</Text>
              <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17, color: c.textSecondary }}>{step.body}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ backgroundColor: c.surfaceAlt, borderRadius: 16, padding: 16 }}>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.teal, marginBottom: 4 }}>You are not alone. 🌸</Text>
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17, color: c.textSecondary }}>
          Millions of women travel solo across India every year, safely.
        </Text>
      </View>
    </ScrollView>
  );
}
