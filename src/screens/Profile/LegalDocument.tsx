/**
 * The Privacy Policy, Terms of Service and "Data we collect and why" screens,
 * reached from Settings & Privacy. The words are generated from the backend's
 * single source (journey-backend/src/legal/content.js -> src/data/legalContent.ts),
 * so this says exactly what the public web pages say. Stored in the app so it
 * reads offline; Privacy and Terms also link to the web version Google Play uses.
 */
import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, ExternalLink } from "lucide-react-native";
import { useThemeColors } from "@/theme/useThemeColors";
import { API_BASE_URL } from "@/config/api";
import { LEGAL_DOCS, LEGAL_UPDATED, type LegalBlock } from "@/data/legalContent";

interface Props {
  doc: "privacy" | "terms" | "data";
  onBack: () => void;
}

const WEB_PAGE: Partial<Record<Props["doc"], string>> = { privacy: "/privacy", terms: "/terms" };

// The app can't know the support address (it is set on the server), so it points to the store listing,
// which always shows the developer's contact email.
const CONTACT_IN_APP = "Questions about your information? Use the contact email shown on Jourrrney's Google Play page.";

export default function LegalDocument({ doc, onBack }: Props) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const { title, sections } = LEGAL_DOCS[doc];
  const webPath = WEB_PAGE[doc];

  const renderBlock = (block: LegalBlock, i: number) => {
    if (typeof block === "string") {
      return (
        <Text key={i} style={{ fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 22, color: c.textPrimary, marginBottom: 10 }}>
          {block}
        </Text>
      );
    }
    if ("list" in block) {
      return (
        <View key={i} style={{ marginBottom: 10, gap: 6 }}>
          {block.list.map((item) => (
            <View key={item} style={{ flexDirection: "row", gap: 10 }}>
              <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 22, color: c.textSecondary }}>•</Text>
              <Text style={{ flex: 1, fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 22, color: c.textPrimary }}>{item}</Text>
            </View>
          ))}
        </View>
      );
    }
    return (
      <Text key={i} style={{ fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 22, color: c.textPrimary, marginBottom: 10 }}>
        {CONTACT_IN_APP}
      </Text>
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 48 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 6 }}>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" }}
        >
          <ArrowLeft color={c.textPrimary} size={20} />
        </Pressable>
        <Text style={{ flex: 1, fontFamily: "Poppins_700Bold", fontSize: 20, lineHeight: 28, color: c.textPrimary }}>{title}</Text>
      </View>
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18, color: c.textSecondary, marginBottom: 12, marginLeft: 56 }}>
        Last updated {LEGAL_UPDATED}
      </Text>

      {sections.map((section) => (
        <View key={section.heading} style={{ marginTop: 14 }}>
          <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 16, lineHeight: 24, color: c.textPrimary, marginBottom: 6 }}>{section.heading}</Text>
          {section.body.map(renderBlock)}
        </View>
      ))}

      {webPath && (
        <Pressable
          onPress={() => Linking.openURL(`${API_BASE_URL}${webPath}`)}
          accessibilityRole="link"
          style={{ marginTop: 24, minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderWidth: 1.5, borderColor: c.border, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 10 }}
        >
          <ExternalLink color={c.primary} size={16} />
          <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 14, color: c.primary }}>Read this on the web</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}
