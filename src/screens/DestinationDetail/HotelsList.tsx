/**
 * The top of the Hotels page: the hotels the travel guide names for this place,
 * one card each, with a button that opens each on the map, one button for all of
 * them, and (when the guide names hotels at more than one level) large buttons to
 * show one level at a time.
 *
 * The guide holds no live price, photo or rating for a single hotel, so a card
 * shows what it does hold: the name, where it is, its stay level and that
 * level's typical price, and says so underneath. A place whose guide names no
 * single hotel says that in plain words and keeps the map button, so the page is
 * never empty. The price guide (Typical prices) follows below on the same page.
 * Sizes follow the redesign's rules: buttons 44pt or more, text 12pt or more,
 * and everything wraps at 130% text instead of being cut off.
 */
import { useMemo, useState } from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { BedDouble, Check, Info, MapPin } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { hotelsFor, type Hotel, type HotelLevel } from "@/utils/stayHotels";
import { openMapSearch } from "@/utils/openMaps";
import { useThemeColors } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";

const MAX_FONT = 1.3;
/** Phone text size (Android "Large" is 1.15x) from which a card's button moves under its text. */
const LARGE_TEXT_SCALE = 1.15;
const LEVELS: HotelLevel[] = ["Budget", "Mid-range", "Luxury"];
type Filter = "all" | HotelLevel | "other";

/** What the Typical prices section must not repeat: the lines shown here as hotels. */
export function listedHotelLines(d: Destination): Set<string> {
  return new Set(hotelsFor(d).map((h) => h.source));
}

export default function HotelsList({ destination: d }: { destination: Destination }) {
  const c = useThemeColors();
  const { fontScale } = useWindowDimensions();
  const placeName = d.name.replace(/\s*\([^)]*\)/g, "").trim();
  const hotels = useMemo(() => hotelsFor(d), [d]);
  const [filter, setFilter] = useState<Filter>("all");

  // Only the levels this place's hotels actually have, and only when there is more than one thing to choose between.
  const present = LEVELS.filter((l) => hotels.some((h) => h.level === l));
  const hasOther = hotels.some((h) => h.level === null);
  const choices: { id: Filter; label: string }[] =
    present.length + (hasOther ? 1 : 0) >= 2
      ? [{ id: "all", label: "All" }, ...present.map((l) => ({ id: l as Filter, label: l })), ...(hasOther ? [{ id: "other" as Filter, label: "Other" }] : [])]
      : [];
  const shown = hotels.filter((h) => filter === "all" || (filter === "other" ? h.level === null : h.level === filter));
  const stacked = fontScale >= LARGE_TEXT_SCALE;

  return (
    <View>
      {hotels.length === 0 && (
        <View style={{ marginHorizontal: 16, marginTop: 16, flexDirection: "row", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1, borderColor: c.borderSoft, backgroundColor: c.surfaceAlt }}>
          <Info color={c.textSecondary} size={18} style={{ marginTop: 2 }} />
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ flex: 1, fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 22, color: c.textSecondary }}>
            Our travel guide doesn't name single hotels for {placeName} yet. The map shows the ones nearby.
          </Text>
        </View>
      )}

      <Pressable
        onPress={() => openMapSearch(`hotels near ${placeName}`)}
        accessibilityRole="button"
        accessibilityLabel={`${hotels.length ? "See hotels" : "Find hotels"} near ${placeName} on the map. Opens your maps app.`}
        android_ripple={{ color: withOpacity(c.onPrimary, 0.2) }}
        style={{
          marginHorizontal: 16, marginTop: 14, minHeight: 52, borderRadius: 12, backgroundColor: c.primary,
          flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 8,
        }}
      >
        <MapPin color={c.onPrimary} size={19} />
        <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14.5, lineHeight: 20, color: c.onPrimary }}>
          {hotels.length ? "See hotels on the map" : "Find hotels on the map"}
        </Text>
      </Pressable>
      <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 12.5, lineHeight: 18, color: c.textSecondary, paddingHorizontal: 20, marginTop: 6 }}>
        Opens Google Maps with hotels near {placeName}.
      </Text>

      {hotels.length > 0 && (
        <>
          {choices.length > 0 && (
            <View accessibilityRole="tablist" style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, marginTop: 16 }}>
              {choices.map(({ id, label }) => {
                const on = filter === id;
                return (
                  <Pressable
                    key={id}
                    onPress={() => setFilter(id)}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: on }}
                    aria-selected={on}
                    accessibilityLabel={`${label} hotels${on ? ", selected" : ""}`}
                    android_ripple={{ color: withOpacity(c.gold, 0.15) }}
                    style={{
                      minHeight: 48, minWidth: 64, paddingHorizontal: 16, borderRadius: 24, borderWidth: 1.5,
                      borderColor: on ? c.gold : c.border, backgroundColor: on ? withOpacity(c.gold, 0.16) : c.surface,
                      flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
                    }}
                  >
                    {on ? <Check color={c.gold} size={16} /> : null}
                    <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: on ? "Poppins_700Bold" : "Poppins_600SemiBold", fontSize: 14, lineHeight: 20, color: on ? c.textPrimary : c.textSecondary }}>
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <Text
            accessibilityRole="header"
            maxFontSizeMultiplier={MAX_FONT}
            style={{ fontFamily: "Poppins_600SemiBold", fontSize: 14, lineHeight: 20, color: c.textSecondary, paddingHorizontal: 20, marginTop: 16, marginBottom: 8 }}
          >
            {shown.length === hotels.length ? `${hotels.length} ${hotels.length === 1 ? "hotel" : "hotels"}` : `${shown.length} of ${hotels.length} hotels`} near {placeName}
          </Text>

          <View style={{ gap: 10, paddingHorizontal: 16 }}>
            {shown.map((h) => (
              <HotelCard key={h.key} hotel={h} stacked={stacked} />
            ))}
          </View>

          <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 20, marginTop: 12 }}>
            <Info color={c.textSecondary} size={15} style={{ marginTop: 2 }} />
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ flex: 1, fontFamily: "Poppins_400Regular", fontSize: 12.5, lineHeight: 18, color: c.textSecondary }}>
              Hotels from our travel guide. Prices are typical for each level, not today's price for that hotel.
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

export function HotelCard({ hotel: h, stacked }: { hotel: Hotel; stacked: boolean }) {
  const c = useThemeColors();
  const where = h.area ? `${h.name}, ${h.area}` : h.name;
  const priceLine = h.price.hasAmount && h.price.unit
    ? `Typically ${h.price.main} ${h.price.unit}${h.price.estimate ? " (estimate)" : ""}`
    : "";
  const button = (
    <Pressable
      onPress={() => openMapSearch(h.mapQuery)}
      accessibilityRole="button"
      accessibilityLabel={`See ${where} on the map. Opens your maps app.`}
      android_ripple={{ color: withOpacity(c.primary, 0.14) }}
      style={{
        minHeight: 44, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 22, borderWidth: 1.5, borderColor: c.border,
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
        ...(stacked ? { alignSelf: "stretch", marginTop: 10 } : {}),
      }}
    >
      <MapPin color={c.gold} size={16} />
      <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 13, lineHeight: 18, color: c.textPrimary }}>See on map</Text>
    </Pressable>
  );

  return (
    <View style={{ padding: 14, borderRadius: 16, borderWidth: 1, borderColor: c.borderSoft, backgroundColor: c.surfaceAlt }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: withOpacity(c.gold, 0.14), alignItems: "center", justifyContent: "center" }}>
          <BedDouble color={c.gold} size={26} />
        </View>
        <View style={{ flex: 1 }}>
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 15.5, lineHeight: 21, color: c.textPrimary }}>{h.name}</Text>
          {h.area ? (
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 5, marginTop: 1 }}>
              <MapPin color={c.textSecondary} size={13} style={{ marginTop: 3 }} />
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ flex: 1, fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary }}>{h.area}</Text>
            </View>
          ) : null}
          <View style={{ flexDirection: "row", marginTop: 4 }}>
            <View style={{ flexShrink: 1, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 1 }}>
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 12, lineHeight: 17, color: c.textSecondary }}>{h.level ?? h.typeLabel}</Text>
            </View>
          </View>
          {priceLine ? (
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary, marginTop: 4 }}>{priceLine}</Text>
          ) : null}
          {h.note ? (
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 12.5, lineHeight: 18, color: c.textSecondary, marginTop: 2 }}>{h.note}</Text>
          ) : null}
        </View>
        {stacked ? null : button}
      </View>
      {stacked ? button : null}
    </View>
  );
}
