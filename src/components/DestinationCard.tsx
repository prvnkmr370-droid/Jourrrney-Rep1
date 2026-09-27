import { View, Text, Pressable } from "react-native";
import DestImage from "@/components/DestImage";
import { LinearGradient } from "expo-linear-gradient";
import { Star, MapPin, Shield } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { useThemeColors } from "@/theme/useThemeColors";

interface Props {
  destination: Destination;
  onPress: () => void;
  /** "grid" (default) = image-first card for horizontal rails on Home.
   *  "row" = full-width horizontal list row, used by Search results and
   *  any other list-style destination browse. One shared visual language
   *  (same radius, badge style, type scale) across both shapes, so a
   *  destination looks like "the same card" everywhere it's previewed. */
  layout?: "grid" | "row";
  /** Taller grid card — used by rails that want more vertical room. */
  tall?: boolean;
  /** Smaller row with no stat/price line — used for live search suggestions. */
  compact?: boolean;
  /** Which stat pill to surface on the card: gold star + rating (default),
   *  or green shield + women-safety score (the "Safest for Women & Solo
   *  Travel" rail). */
  stat?: "rating" | "safety";
  /** Also show the starting daily budget next to the stat (row layout only). */
  showPrice?: boolean;
}

const RADIUS = 16;

/** Single destination-preview card used across the app — Home's rails,
 * Search's results, and anywhere else a Destination gets a tappable
 * thumbnail. Two layouts (`grid` / `row`) share the same badge style,
 * corner radius, and type scale so every preview reads as one consistent
 * card design rather than several different ones. */
export default function DestinationCard({
  destination,
  onPress,
  layout = "grid",
  tall,
  compact,
  stat = "rating",
  showPrice,
}: Props) {
  const c = useThemeColors();
  const isSafety = stat === "safety";

  const StatPill = ({ tone }: { tone: "onImage" | "onSurface" }) =>
    isSafety ? (
      <>
        <Shield color={tone === "onImage" ? "#FFFFFF" : "#15803D"} fill={tone === "onImage" ? "#FFFFFF" : "#15803D"} size={tone === "onImage" ? 10 : 12} />
        <Text
          style={{
            fontFamily: "Poppins_700Bold",
            fontSize: tone === "onImage" ? 11 : 12,
            lineHeight: tone === "onImage" ? 14 : undefined,
            color: tone === "onImage" ? "#FFFFFF" : c.textPrimary,
          }}
        >
          {destination.womenSafety.score}/10
        </Text>
      </>
    ) : (
      <>
        <Star color="#FBBF24" fill="#FBBF24" size={tone === "onImage" ? 10 : 12} />
        <Text
          style={{
            fontFamily: "Poppins_700Bold",
            fontSize: tone === "onImage" ? 11 : 12,
            lineHeight: tone === "onImage" ? 14 : undefined,
            color: tone === "onImage" ? "#FFFFFF" : c.textPrimary,
          }}
        >
          {destination.rating}
        </Text>
      </>
    );

  if (layout === "row") {
    const imageSize = compact ? 48 : 64;
    return (
      <Pressable
        onPress={onPress}
        style={{
          flexDirection: "row", alignItems: "center", gap: 14,
          backgroundColor: c.surface, borderWidth: 1, borderColor: c.border,
          borderRadius: RADIUS, padding: compact ? 10 : 12,
        }}
      >
        <DestImage source={{ uri: destination.image }} style={{ width: imageSize, height: imageSize, borderRadius: 12 }} contentFit="cover" />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: compact ? 14 : 15, color: c.textPrimary }} numberOfLines={1}>
            {destination.name}
          </Text>
          {compact ? (
            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }} numberOfLines={1}>
              {destination.state} · {destination.category[0]}
            </Text>
          ) : (
            <>
              <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary, marginBottom: 4 }} numberOfLines={1}>
                {destination.state}
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <StatPill tone="onSurface" />
                {showPrice && (
                  <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12, color: c.primary, marginLeft: 6 }}>
                    ₹{destination.budgetBreakdown[0]?.perDayPerPerson.toLocaleString("en-IN")}+/day
                  </Text>
                )}
              </View>
            </>
          )}
        </View>
      </Pressable>
    );
  }

  const width = tall ? 155 : 170;
  const height = tall ? 210 : 185;

  return (
    <Pressable onPress={onPress} style={{ width, height, borderRadius: RADIUS, overflow: "hidden" }}>
      <DestImage source={{ uri: destination.image }} style={{ width, height }} contentFit="cover" />
      <LinearGradient
        colors={["rgba(0,0,0,0.85)", "rgba(0,0,0,0.55)", "rgba(0,0,0,0.28)", "rgba(0,0,0,0.08)", "transparent"]}
        locations={[0, 0.25, 0.5, 0.75, 1]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={{ position: "absolute", inset: 0 }}
      />

      {/* Category and stat badges share the same height/centering/type
          scale so the two pills — sitting at the same top offset on
          opposite corners — line up instead of one looking taller or
          off-center against the other. */}
      <View
        style={{
          position: "absolute", top: 10, right: 10, height: 20,
          flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 3,
          backgroundColor: isSafety ? "rgba(21,128,61,0.9)" : "rgba(0,0,0,0.45)", borderRadius: 999,
          paddingHorizontal: 8,
        }}
      >
        <StatPill tone="onImage" />
      </View>

      <View
        style={{
          position: "absolute", top: 10, left: 10, height: 20,
          flexDirection: "row", alignItems: "center", justifyContent: "center",
          backgroundColor: "rgba(51,60,129,0.85)", borderRadius: 999,
          paddingHorizontal: 8,
        }}
      >
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, lineHeight: 14, color: "#FFFFFF" }}>
          {destination.category[0]}
        </Text>
      </View>

      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 12 }}>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: "#FFFFFF" }} numberOfLines={1}>
          {destination.name}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 }}>
          <MapPin color="rgba(255,255,255,0.6)" size={10} />
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: "rgba(255,255,255,0.6)" }} numberOfLines={1}>
            {destination.state}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
