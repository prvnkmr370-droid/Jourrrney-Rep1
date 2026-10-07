/** Make-only reference (no Figma frame). Formerly its own top-level
 * "Local Travel" tab — folded in here as a How to Reach sub-section since
 * "getting around once you've arrived" is naturally part of reaching a
 * destination, not a separate concern. */
import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { Bus, ChevronRight } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { withOpacity } from "@/components/withOpacity";
import { useThemeColors } from "@/theme/useThemeColors";
import { getCurrentCoords } from "@/hooks/useCurrentCoords";
import { getDestinationPoint } from "./localRouteEstimate";
import { isRideBookingApp, openRideApp } from "./rideAppLinks";

export default function LocalTransportSection({ destination: d }: { destination: Destination }) {
  const c = useThemeColors();
  // Which card's ride app is currently being opened — tracks the GPS fix +
  // destination-lookup round trip so just that card shows a spinner
  // instead of blocking the whole tab.
  const [openingMode, setOpeningMode] = useState<string | null>(null);

  const handlePress = async (mode: string) => {
    if (openingMode) return; // already opening one — ignore taps on others until it resolves
    setOpeningMode(mode);
    try {
      const pickup = await getCurrentCoords(); // shows its own alert on failure
      if (!pickup) return;
      const destPoint = await getDestinationPoint({ id: d.id, name: d.name, state: d.state });
      await openRideApp(mode, pickup, destPoint ? { latitude: destPoint.lat, longitude: destPoint.lon, name: d.name } : null);
    } finally {
      setOpeningMode(null);
    }
  };

  return (
    <View>
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: c.textSecondary, marginBottom: 16 }}>
        How to get around once you're in {d.name}.
      </Text>

      <View style={{ gap: 12 }}>
        {d.localTransport.map((t) => {
          const isRideApp = isRideBookingApp(t.mode);
          const opening = openingMode === t.mode;
          return (
            <Pressable
              key={t.mode}
              disabled={!isRideApp || !!openingMode}
              onPress={() => handlePress(t.mode)}
              style={{
                flexDirection: "row", alignItems: "center", gap: 14,
                backgroundColor: c.surface, borderRadius: 16, borderWidth: 1, borderColor: c.border, padding: 14,
                opacity: t.available ? 1 : 0.5,
              }}
            >
              <View
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  backgroundColor: withOpacity(c.teal, 0.12), alignItems: "center", justifyContent: "center",
                }}
              >
                <Bus color={c.teal} size={18} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 2 }}>
                  <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary, flexShrink: 1 }}>{t.mode}</Text>
                  <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.primary, flexShrink: 1, textAlign: "right" }}>{t.cost}</Text>
                </View>
                <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>
                  {t.notes}{!t.available ? " — not available here" : ""}
                </Text>
              </View>
              {isRideApp && (opening ? <ActivityIndicator color={c.primary} size="small" /> : <ChevronRight color={c.textMuted} size={18} />)}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
