/**
 * "Hotels" on a destination's home page, between How to get there and the rows
 * below: a couple of the hotels the travel guide names for the place (one cheaper,
 * one dearer when the guide has both), each with its "See on map" button, and a
 * "See all N hotels" button that opens the Hotels page (all the hotels, the level
 * filter, the map button and the price guide). A place whose guide names no single
 * hotel shows nothing here: its Hotels row stays in the list below instead.
 */
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { ArrowRight } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { hotelsFor, previewHotels } from "@/utils/stayHotels";
import { HotelCard } from "./HotelsList";
import { useThemeColors } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";

const MAX_FONT = 1.3;
/** Phone text size (Android "Large" is 1.15x) from which a card's button moves under its text. */
const LARGE_TEXT_SCALE = 1.15;

export default function HotelsPreview({ destination: d, onSeeAll }: { destination: Destination; onSeeAll: () => void }) {
  const c = useThemeColors();
  const { fontScale } = useWindowDimensions();
  const placeName = d.name.replace(/\s*\([^)]*\)/g, "").trim();
  const hotels = hotelsFor(d);
  if (hotels.length === 0) return null;
  const shown = previewHotels(hotels);
  const label = hotels.length > shown.length ? `See all ${hotels.length} hotels` : "See hotels on the map and prices";

  return (
    <View style={{ marginTop: 24 }}>
      <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 20, lineHeight: 27, color: c.textPrimary, paddingHorizontal: 20 }}>
        Hotels
      </Text>
      <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary, paddingHorizontal: 20, marginTop: 2, marginBottom: 10 }}>
        {hotels.length > shown.length ? `A couple of the hotels near ${placeName}, from our travel guide.` : `Hotels near ${placeName}, from our travel guide.`}
      </Text>

      <View style={{ gap: 10, paddingHorizontal: 16 }}>
        {shown.map((h) => (
          <HotelCard key={h.key} hotel={h} stacked={fontScale >= LARGE_TEXT_SCALE} />
        ))}
      </View>

      <Pressable
        onPress={onSeeAll}
        accessibilityRole="button"
        accessibilityLabel={`${label}. Opens the Hotels page.`}
        android_ripple={{ color: withOpacity(c.gold, 0.14) }}
        style={{
          marginHorizontal: 16, marginTop: 10, minHeight: 48, borderRadius: 12, borderWidth: 1.5, borderColor: withOpacity(c.gold, 0.6), backgroundColor: c.surface,
          flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 8,
        }}
      >
        <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14, lineHeight: 20, color: c.gold }}>{label}</Text>
        <ArrowRight color={c.gold} size={20} />
      </Pressable>
    </View>
  );
}
