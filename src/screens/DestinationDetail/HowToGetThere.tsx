/**
 * "How to get there" on a destination's home page, straight under Places Near.
 * One row per way of reaching the place (by air, train, road, water...): its plain
 * name, where you arrive, the time and cost side by side, and small word badges
 * (Fastest, Cheapest, Book ahead). Tap a row to open its journey: the time and
 * cost in full, where to arrive with a Directions button, the tip, and the steps
 * from the airport or station to a stay. One row is open at a time, the first to
 * start. Under the rows: how to get from there to the main sight, what getting
 * around costs once you are there, and a button to the route planner page (which
 * asks where you are starting from).
 *
 * The text comes from the place's own guide (utils/howToReach.ts). Sizes follow
 * the redesign's rules: nothing under 12pt, buttons of at least 44pt, and text
 * that wraps at 130% instead of being cut off.
 */
import { useState } from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { Bike, Bus, Car, ChevronDown, ChevronUp, Compass, Footprints, MapPin, Navigation, Plane, Route, Ship, TrainFront } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { getJourneyGuide } from "@/data/journeyGuides";
import { localModes, reachModes, sightText, type LocalIcon, type ReachKind, type ReachMode, type StepIcon } from "@/utils/howToReach";
import { openMapSearch } from "@/utils/openMaps";
import { useThemeColors } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";

const MAX_FONT = 1.3;

const KIND_ICON: Record<ReachKind, typeof Plane> = { flight: Plane, train: TrainFront, water: Ship, road: Car, other: Route };
const STEP_ICON: Record<StepIcon, typeof Car> = { bike: Bike, car: Car, bus: Bus, footprints: Footprints, pin: MapPin };
const LOCAL_ICON: Record<LocalIcon, typeof Car> = { ship: Ship, bike: Bike, bus: Bus, footprints: Footprints, car: Car };
const STEP_HEAD: Record<ReachKind, string> = { flight: "the airport", train: "the station", water: "the jetty", road: "the bus stand", other: "where you arrive" };

export default function HowToGetThere({ destination: d, onOpenPlanner }: { destination: Destination; onOpenPlanner: () => void }) {
  const c = useThemeColors();
  const { width } = useWindowDimensions();
  const guide = getJourneyGuide(d.id);
  const placeName = d.name.replace(/\s*\([^)]*\)/g, "").trim();
  const modes = reachModes(d, guide);
  const sight = sightText(guide);
  const local = localModes(d);
  const [openKey, setOpenKey] = useState<string | null>(() => modes[0]?.key ?? null);
  const kindColor: Record<ReachKind, string> = { flight: c.teal, train: c.gold, road: "#7CC4FF", water: "#A78BFA", other: c.gold };
  const tileWidth = (width - 32 - 10) / 2;

  const Badge = ({ text, color }: { text: string; color: string }) => (
    <View style={{ borderWidth: 1, borderColor: withOpacity(color, 0.55), borderRadius: 999, paddingHorizontal: 10, paddingVertical: 2 }}>
      <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 12, lineHeight: 17, color }}>{text}</Text>
    </View>
  );

  return (
    <View style={{ marginTop: 24 }}>
      <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 20, lineHeight: 27, color: c.textPrimary, paddingHorizontal: 20 }}>
        How to get there
      </Text>
      <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary, paddingHorizontal: 20, marginTop: 2, marginBottom: 12 }}>
        All the ways at a glance. Tap one for the journey.
      </Text>

      <View style={{ marginHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: c.borderSoft, backgroundColor: c.surfaceAlt, overflow: "hidden" }}>
        {modes.map((m, i) => {
          const open = openKey === m.key;
          const Icon = KIND_ICON[m.kind];
          const subtitle = m.arrivalName ? m.arrivalName.split(/ — | \(/)[0] : (m.tip.split(/(?<=[.!?])\s/)[0] ?? "");
          const hasBadges = m.fastest || m.cheapest || m.bookAhead;
          const spoken = [m.label, m.arrivalName, [m.durationShort, m.costShort].filter(Boolean).join(", "), m.fastest ? "fastest" : "", m.cheapest ? "cheapest" : "", m.bookAhead ? "book ahead" : ""].filter(Boolean).join(". ");
          return (
            <View key={m.key} style={{ borderTopWidth: i ? 1 : 0, borderTopColor: c.borderSoft, backgroundColor: open ? withOpacity(c.gold, 0.06) : "transparent" }}>
              <Pressable
                onPress={() => setOpenKey(open ? null : m.key)}
                accessibilityRole="button"
                accessibilityState={{ expanded: open }}
                aria-expanded={open}
                accessibilityLabel={`${spoken}. ${open ? "Open, tap to close" : "Closed, tap to open"}`}
                android_ripple={{ color: withOpacity(c.gold, 0.12) }}
                style={{ paddingHorizontal: 14, paddingVertical: 12 }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 56 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: open ? withOpacity(c.gold, 0.18) : c.surface, alignItems: "center", justifyContent: "center" }}>
                    <Icon color={kindColor[m.kind]} size={22} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 16, lineHeight: 21, color: c.textPrimary }}>{m.label}</Text>
                    {subtitle ? (
                      <Text maxFontSizeMultiplier={MAX_FONT} numberOfLines={2} style={{ fontFamily: "Poppins_400Regular", fontSize: 12.5, lineHeight: 17, color: c.textSecondary }}>{subtitle}</Text>
                    ) : null}
                  </View>
                  <View style={{ alignItems: "flex-end", maxWidth: 112 }}>
                    {m.durationShort ? (
                      <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14, lineHeight: 19, color: c.textPrimary, textAlign: "right" }}>{m.durationShort}</Text>
                    ) : null}
                    {m.costShort ? (
                      <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 13, lineHeight: 18, color: c.gold, textAlign: "right" }}>{m.costShort}</Text>
                    ) : null}
                  </View>
                  {open ? <ChevronUp color={c.gold} size={22} /> : <ChevronDown color={c.textMuted} size={22} />}
                </View>
                {hasBadges ? (
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6, marginLeft: 56 }}>
                    {m.fastest ? <Badge text="Fastest" color={c.success} /> : null}
                    {m.cheapest ? <Badge text="Cheapest" color={c.success} /> : null}
                    {m.bookAhead ? <Badge text="Book ahead" color={c.warning} /> : null}
                  </View>
                ) : null}
              </Pressable>

              {open ? <Journey mode={m} placeName={placeName} /> : null}
            </View>
          );
        })}
      </View>

      {sight ? (
        <View style={{ marginHorizontal: 16, marginTop: 12, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: withOpacity(c.teal, 0.3), backgroundColor: withOpacity(c.teal, 0.08) }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Compass color={c.teal} size={18} />
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14.5, lineHeight: 21, color: c.teal }}>From there to the sights</Text>
          </View>
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 22, color: c.textPrimary }}>{sight}</Text>
        </View>
      ) : null}

      {local.length > 0 ? (
        <>
          <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 17, lineHeight: 24, color: c.textPrimary, paddingHorizontal: 20, marginTop: 22, marginBottom: 8 }}>
            Getting around once you're there
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 16 }}>
            {local.map((l) => {
              const Icon = LOCAL_ICON[l.icon];
              return (
                <View key={l.key} style={{ width: tileWidth, minHeight: 84, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: c.borderSoft, backgroundColor: c.surfaceAlt }}>
                  <Icon color={c.gold} size={20} />
                  <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 13.5, lineHeight: 19, color: c.textPrimary, marginTop: 6 }}>{l.mode}</Text>
                  {l.cost ? (
                    <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 13.5, lineHeight: 19, color: c.gold }}>{l.cost}</Text>
                  ) : null}
                </View>
              );
            })}
          </View>
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 12.5, lineHeight: 18, color: c.textSecondary, paddingHorizontal: 20, marginTop: 8 }}>
            Fares are typical. Agree the price before you get in.
          </Text>
        </>
      ) : null}

      <Pressable
        onPress={onOpenPlanner}
        accessibilityRole="button"
        accessibilityLabel={`Find my route to ${placeName} from my city`}
        android_ripple={{ color: withOpacity(c.onPrimary, 0.2) }}
        style={{
          marginHorizontal: 16, marginTop: 14, minHeight: 52, borderRadius: 12, backgroundColor: c.primary,
          flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 8,
        }}
      >
        <Route color={c.onPrimary} size={19} />
        <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14.5, lineHeight: 20, color: c.onPrimary }}>Find my route from my city</Text>
      </Pressable>
      <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 12.5, lineHeight: 18, color: c.textSecondary, paddingHorizontal: 20, marginTop: 6 }}>
        Type your city to see the distance and the best way to come.
      </Text>
    </View>
  );
}

/** The opened row: a short journey line, the tip, and the steps from the arrival point to a stay. */
function Journey({ mode: m, placeName }: { mode: ReachMode; placeName: string }) {
  const c = useThemeColors();
  const dot = (shape: "round" | "square", color: string) => (
    <View style={{ position: "absolute", left: -26, top: 3, width: 14, height: 14, borderRadius: shape === "round" ? 7 : 3, backgroundColor: color }} />
  );
  const showTime = !!(m.duration || m.cost);
  return (
    <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
      {showTime || m.arrivalName ? (
        <View style={{ marginLeft: 22, borderLeftWidth: 2, borderLeftColor: withOpacity(c.gold, 0.3), paddingLeft: 18, gap: 12 }}>
          {showTime ? (
            <View>
              {dot("round", c.gold)}
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13.5, lineHeight: 20, color: c.textPrimary }}>
                <Text style={{ fontFamily: "Poppins_700Bold" }}>{m.label}</Text>
                {m.duration ? ` · ${m.duration}` : ""}
                {m.cost ? <Text>{" · "}<Text style={{ fontFamily: "Poppins_700Bold", color: c.gold }}>{m.cost}</Text></Text> : null}
              </Text>
            </View>
          ) : null}
          {m.arrivalName ? (
            <View>
              {dot("square", c.teal)}
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12.5, lineHeight: 17, color: c.textSecondary }}>Arrive at</Text>
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 14, lineHeight: 20, color: c.textPrimary }}>{m.arrivalName}</Text>
              {m.arrivalDistance ? (
                <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary }}>{m.arrivalDistance}</Text>
              ) : null}
              <Pressable
                onPress={() => openMapSearch(`${m.arrivalName.split(/ — /)[0]}, ${placeName}`)}
                accessibilityRole="button"
                accessibilityLabel={`Directions to ${m.arrivalName}. Opens your maps app.`}
                android_ripple={{ color: withOpacity(c.primary, 0.14) }}
                style={{
                  alignSelf: "flex-start", marginTop: 8, minHeight: 44, paddingHorizontal: 14, borderRadius: 22, borderWidth: 1.5, borderColor: c.border,
                  flexDirection: "row", alignItems: "center", gap: 6,
                }}
              >
                <Navigation color={c.gold} size={16} />
                <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 13, lineHeight: 18, color: c.textPrimary }}>Directions</Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : null}

      {m.tip ? (
        <View style={{ marginTop: 10, padding: 12, borderRadius: 12, backgroundColor: withOpacity(c.gold, 0.1) }}>
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20, color: c.textPrimary }}>{m.tip}</Text>
        </View>
      ) : null}

      {m.steps.length > 0 ? (
        <View style={{ marginTop: 12 }}>
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 12.5, lineHeight: 18, color: c.textSecondary, marginBottom: 6 }}>
            From {STEP_HEAD[m.kind]} to your stay
          </Text>
          {m.steps.map((s, i) => {
            const Icon = STEP_ICON[s.icon];
            return (
              <View key={`${i}-${s.action}`} style={{ flexDirection: "row", gap: 10, paddingVertical: 7, borderTopWidth: i ? 1 : 0, borderTopColor: c.borderSoft }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" }}>
                  <Icon color={c.textSecondary} size={15} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13.5, lineHeight: 20, color: c.textPrimary }}>{s.action}</Text>
                  {s.cost || s.duration ? (
                    <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 12.5, lineHeight: 18, color: c.textSecondary }}>
                      <Text style={{ fontFamily: "Poppins_700Bold", color: c.gold }}>{s.cost}</Text>
                      {s.cost && s.duration ? " · " : ""}
                      {s.duration}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}
