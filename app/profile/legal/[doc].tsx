import { useLocalSearchParams, router } from "expo-router";
import { Text, View } from "react-native";
import LegalDocument from "@/screens/Profile/LegalDocument";
import { useThemeColors } from "@/theme/useThemeColors";

const VALID_DOCS = ["privacy", "terms", "data"] as const;

export default function LegalDocumentRoute() {
  const c = useThemeColors();
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const validDoc = VALID_DOCS.find((d) => d === doc);

  if (!validDoc) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: c.bg }}>
        <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 16, color: c.textPrimary }}>Unknown document "{doc}"</Text>
      </View>
    );
  }

  return <LegalDocument doc={validDoc} onBack={() => router.back()} />;
}
