/**
 * No Figma frame — reached from Settings & Privacy's 3 legal rows, which
 * only specify the row labels, not any document content. Placeholder
 * boilerplate text, clearly not real legal copy; swap in actual
 * Privacy Policy / Terms of Service / data-collection text before shipping.
 */
import { View, Text, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { useThemeColors } from "@/theme/useThemeColors";

interface Props {
  doc: "privacy" | "terms" | "data";
  onBack: () => void;
}

const CONTENT: Record<Props["doc"], { title: string; body: string }> = {
  privacy: {
    title: "Privacy Policy",
    body: "This is placeholder text standing in for Jourrrney's real Privacy Policy. It should cover what data the app collects (destination searches, safety preferences, optional profile info), how it's stored (on-device via this session's local stores, or in a real backend once one exists), who it's shared with (nobody, currently — there's no backend), and how a user can request deletion. Replace this entire screen's content before shipping.",
  },
  terms: {
    title: "Terms of Service",
    body: "This is placeholder text standing in for Jourrrney's real Terms of Service. It should cover acceptable use of the app, that Jourrrney is an informational travel guide and not a booking or payment platform, that safety information (ratings, tips, emergency contacts) is provided as general guidance and not a substitute for the user's own judgment, and standard liability/disclaimer language. Replace this entire screen's content before shipping.",
  },
  data: {
    title: "Data we collect and why",
    body: "This is placeholder text standing in for a real breakdown of data collection. Today the app stores everything locally on-device (origin city, recently viewed destinations, safety/travel preferences, emergency contacts) — nothing is sent to a server, because there is no backend yet. Location is only read when you explicitly grant permission, to show distances and travel times. Replace this entire screen's content with real specifics once a backend and its actual data flows exist.",
  },
};

export default function LegalDocument({ doc, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const { title, body } = CONTENT[doc];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 40 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Pressable onPress={onBack} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft color={c.textPrimary} size={18} />
        </Pressable>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 18, color: c.textPrimary }}>{title}</Text>
      </View>

      <View style={{ backgroundColor: c.surfaceAlt, borderRadius: 14, padding: 14, marginBottom: 16 }}>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: c.gold }}>
          ⚠️ Placeholder content — not real legal copy
        </Text>
      </View>

      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 22, color: c.textPrimary }}>{body}</Text>
    </ScrollView>
  );
}
