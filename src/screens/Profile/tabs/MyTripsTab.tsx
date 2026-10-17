/**
 * "Trips" tab on My Account: plans the traveller saved from the Plan Trip
 * result screen. Kept on this device only (see useSavedTripsStore) — nothing
 * here is sent to the backend, which is also why it works for guests.
 */
import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { ChevronRight, Trash2 } from "lucide-react-native";
import DestImage from "@/components/DestImage";
import { DESTINATIONS } from "@/data/destinations";
import { useSavedTripsStore } from "@/store/useSavedTripsStore";
import { useThemeColors } from "@/theme/useThemeColors";

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function savedOn(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`;
}

export default function MyTripsTab() {
  const c = useThemeColors();
  const trips = useSavedTripsStore((s) => s.trips);
  const removeTrip = useSavedTripsStore((s) => s.remove);

  // A trip whose destination was removed from the app's data can't be reopened,
  // so it isn't listed (it stays on the device in case the destination returns).
  const rows = trips
    .map((trip) => {
      const dest = DESTINATIONS.find((d) => d.id === trip.plan.destinationId);
      return dest ? { trip, dest } : null;
    })
    .filter((r): r is NonNullable<typeof r> => !!r);

  const confirmRemove = (id: string, title: string) =>
    Alert.alert("Remove this trip?", `${title} will be deleted from My trips on this device.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => removeTrip(id) },
    ]);

  return (
    <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 14 }} showsVerticalScrollIndicator={false}>
      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.textPrimary }}>My trips</Text>

      {rows.length === 0 ? (
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: c.textSecondary, textAlign: "center", paddingVertical: 20, lineHeight: 19 }}>
          No saved trips yet — build a plan in Plan Trip and tap Save trip to keep it here.
        </Text>
      ) : (
        <View style={{ gap: 10 }}>
          {rows.map(({ trip, dest }) => {
            const legs = trip.plan.legs;
            const title = legs && legs.length > 1 ? legs.map((l) => DESTINATIONS.find((d) => d.id === l.destinationId)?.name ?? "").filter(Boolean).join(" → ") : dest.name;
            const meta = `${trip.plan.days} day${trip.plan.days === 1 ? "" : "s"} · ${trip.plan.people} traveller${trip.plan.people === 1 ? "" : "s"} · ₹${trip.plan.totalCost.toLocaleString("en-IN")}`;
            return (
              <View key={trip.id} style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 12 }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Open saved trip: ${title}`}
                  onPress={() => router.push(`/profile/trip/${trip.id}`)}
                  style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 12 }}
                >
                  <DestImage source={{ uri: dest.image }} style={{ width: 52, height: 52, borderRadius: 12 }} contentFit="cover" />
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary }}>{title}</Text>
                    <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary, marginTop: 1 }}>{meta}</Text>
                    <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 10.5, color: c.textMuted, marginTop: 1 }}>Saved {savedOn(trip.savedAt)}</Text>
                  </View>
                  <ChevronRight color={c.textMuted} size={16} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Remove saved trip: ${title}`}
                  onPress={() => confirmRemove(trip.id, title)}
                  hitSlop={8}
                  style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c.surfaceAlt, alignItems: "center", justifyContent: "center" }}
                >
                  <Trash2 color={c.textSecondary} size={15} />
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
