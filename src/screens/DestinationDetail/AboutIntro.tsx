/**
 * "About <place>" right under Directions: the description, four lines with a
 * "Read more" toggle. Tapping it opens the full description and, directly
 * under it, the place's Top highlights; "Show less" folds both away together.
 * The highlights use the same body text as the description, so the two read as
 * one piece. Everything else that used to be in the About tab (places near)
 * follows the rows, in OverviewTab.
 */
import { Pressable, Text, View, type TextStyle } from "react-native";
import { router } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import ExpandableText from "@/components/ExpandableText";
import { withOpacity } from "@/components/withOpacity";
import { useThemeColors } from "@/theme/useThemeColors";

const MAX_FONT = 1.3;

export default function AboutIntro({ destination: d }: { destination: Destination }) {
  const c = useThemeColors();
  const placeName = d.name.replace(/\s*\([^)]*\)/g, "").trim();

  // One text style for the description and for the highlights, so they match.
  const bodyText: TextStyle = { fontFamily: "Poppins_400Regular", fontSize: 15, lineHeight: 23, color: c.textSecondary };

  const highlights = d.highlights.length > 0 ? (
    <View style={{ marginTop: 14 }}>
      <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 16, lineHeight: 23, color: c.textPrimary, marginBottom: 4 }}>
        Top highlights
      </Text>
      {d.highlights.map((h, i) => {
        // A highlight that is a place with a page of its own (e.g. Agra's
        // "Fatehpur Sikri") opens that page; the rest are plain lines.
        const row = (
          <>
            <Text maxFontSizeMultiplier={MAX_FONT} style={[bodyText, { width: 26, fontFamily: "Poppins_600SemiBold", color: c.primary }]}>{i + 1}.</Text>
            <Text maxFontSizeMultiplier={MAX_FONT} style={[bodyText, { flex: 1 }]}>{h.name}</Text>
            {h.id ? <ChevronRight color={c.primary} size={18} style={{ marginTop: 3 }} /> : null}
          </>
        );
        return h.id ? (
          <Pressable
            key={h.name}
            onPress={() => router.push(`/destination/${h.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`${i + 1}. ${h.name}. Opens its own page.`}
            android_ripple={{ color: withOpacity(c.primary, 0.12) }}
            style={{ flexDirection: "row", alignItems: "flex-start", gap: 4, minHeight: 44, paddingVertical: 6 }}
          >
            {row}
          </Pressable>
        ) : (
          <View key={h.name} accessible accessibilityLabel={`${i + 1}. ${h.name}`} style={{ flexDirection: "row", alignItems: "flex-start", gap: 4, paddingVertical: 6 }}>
            {row}
          </View>
        );
      })}
    </View>
  ) : null;

  return (
    <View style={{ marginTop: 24, paddingHorizontal: 20 }}>
      <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 20, lineHeight: 27, color: c.textPrimary, marginBottom: 6 }}>
        About {placeName}
      </Text>
      {/* Clamped to 4 lines with a "Read more" toggle: the full description
          can run to a dozen lines and would push the rows below it off the page. */}
      <ExpandableText key={d.id} text={d.description} lines={4} subject={d.name} textStyle={bodyText} expandedExtra={highlights} />
    </View>
  );
}
