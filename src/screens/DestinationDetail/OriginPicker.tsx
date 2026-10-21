/**
 * "Where are you starting from?": a bottom sheet to choose the city a trip starts from.
 * "Use my current location" comes first (the phone asks permission only when it is tapped,
 * and a refusal just says so kindly and leaves the rest of the sheet working), then a
 * search box for any Indian city, the cities used recently, and a few popular ones.
 * It only chooses a city: where the routes come from is worked out by the caller.
 */
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Building2, ChevronRight, Info, LocateFixed, Search, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatCitySuggestion, useCitySearch } from "@/hooks/useCitySearch";
import { useThemeColors } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";

const MAX_FONT = 1.3;

/** What is stored and searched is "City, State" so the route lookup finds the right place. */
export const POPULAR_ORIGINS = ["Delhi", "Mumbai, Maharashtra", "Chennai, Tamil Nadu", "Bengaluru, Karnataka", "Kolkata, West Bengal", "Hyderabad, Telangana", "Chandigarh", "Jaipur, Rajasthan"];
export const shortCity = (label: string) => label.split(",")[0].trim();

interface Props {
  visible: boolean;
  onClose: () => void;
  onPick: (city: string) => void;
  onUseLocation: () => void;
  detecting: boolean;
  /** A friendly sentence when location could not be used, or null. */
  notice: string | null;
  /** What the phone allows right now. */
  permission: "granted" | "denied" | "unasked";
  recents: string[];
}

export default function OriginPicker({ visible, onClose, onPick, onUseLocation, detecting, notice, permission, recents }: Props) {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const { suggestions, loading } = useCitySearch(query);
  const searching = query.trim().length >= 2;
  const denied = permission === "denied";

  const pick = (label: string) => {
    setQuery("");
    onPick(label);
  };
  const close = () => {
    setQuery("");
    onClose();
  };

  const CityRow = ({ label, sub }: { label: string; sub?: string }) => (
    <Pressable
      onPress={() => pick(label)}
      accessibilityRole="button"
      accessibilityLabel={`Start from ${label}`}
      android_ripple={{ color: withOpacity(c.gold, 0.12) }}
      style={{ minHeight: 52, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8, borderTopWidth: 1, borderTopColor: c.borderSoft }}
    >
      <Building2 color={c.textSecondary} size={18} />
      <Text maxFontSizeMultiplier={MAX_FONT} style={{ flex: 1, fontFamily: "Poppins_600SemiBold", fontSize: 14.5, lineHeight: 21, color: c.textPrimary }}>
        {shortCity(label)}
        {sub ? <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12.5, color: c.textSecondary }}>{`, ${sub}`}</Text> : null}
      </Text>
      <ChevronRight color={c.textMuted} size={18} />
    </Pressable>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.55)" }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={close} style={{ flex: 1 }} />
        <View style={{ maxHeight: "88%", backgroundColor: c.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22, borderTopWidth: 1, borderTopColor: c.border }}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: Math.max(insets.bottom, 16) + 8 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, paddingBottom: 10 }}>
              <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT} style={{ flex: 1, fontFamily: "Poppins_700Bold", fontSize: 18, lineHeight: 25, color: c.textPrimary }}>
                Where are you starting from?
              </Text>
              <Pressable
                onPress={close}
                accessibilityRole="button"
                accessibilityLabel="Close"
                style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surfaceAlt, alignItems: "center", justifyContent: "center" }}
              >
                <X color={c.textPrimary} size={20} />
              </Pressable>
            </View>

            <Pressable
              onPress={onUseLocation}
              disabled={detecting}
              accessibilityRole="button"
              accessibilityLabel={detecting ? "Finding your city" : "Use my current location"}
              android_ripple={{ color: withOpacity(c.gold, 0.14) }}
              style={{
                minHeight: 64, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1.5,
                borderColor: denied ? c.borderSoft : c.gold, backgroundColor: denied ? c.surfaceAlt : withOpacity(c.gold, 0.1),
              }}
            >
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: withOpacity(c.gold, 0.2), alignItems: "center", justifyContent: "center" }}>
                {detecting ? <ActivityIndicator color={c.gold} /> : <LocateFixed color={c.gold} size={20} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 15, lineHeight: 21, color: c.textPrimary }}>
                  {detecting ? "Finding your city…" : "Use my current location"}
                </Text>
                <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 12.5, lineHeight: 18, color: c.textSecondary }}>
                  {detecting ? "Hold on a moment" : denied ? "Location is off for this app. You can turn it on in Settings." : permission === "granted" ? "Uses your exact position" : "Your phone will ask for permission"}
                </Text>
              </View>
            </Pressable>

            {notice ? (
              <View style={{ flexDirection: "row", gap: 8, marginTop: 10, padding: 12, borderRadius: 12, backgroundColor: withOpacity(c.gold, 0.1) }}>
                <Info color={c.gold} size={16} style={{ marginTop: 3 }} />
                <Text maxFontSizeMultiplier={MAX_FONT} style={{ flex: 1, fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20, color: c.textPrimary }}>{notice}</Text>
              </View>
            ) : null}

            <View style={{ marginTop: 12, justifyContent: "center" }}>
              <Search color={c.textSecondary} size={18} style={{ position: "absolute", left: 14, zIndex: 1 }} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search any city"
                placeholderTextColor={c.textMuted}
                accessibilityLabel="Search any city"
                autoCorrect={false}
                style={{
                  minHeight: 48, borderRadius: 12, borderWidth: 1.5, borderColor: c.border, backgroundColor: c.surfaceAlt,
                  paddingLeft: 42, paddingRight: 14, fontFamily: "Poppins_400Regular", fontSize: 14, color: c.textPrimary,
                }}
              />
            </View>

            {searching ? (
              <View style={{ marginTop: 6 }}>
                {suggestions.map((s) => (
                  <CityRow key={s.id} label={formatCitySuggestion(s)} sub={s.admin1} />
                ))}
                {suggestions.length === 0 ? (
                  <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 20, color: c.textSecondary, paddingVertical: 14, paddingHorizontal: 4 }}>
                    {loading ? "Looking…" : "No match yet. Try another spelling."}
                  </Text>
                ) : null}
              </View>
            ) : (
              <>
                {recents.length > 0 ? (
                  <>
                    <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 12.5, lineHeight: 18, color: c.textSecondary, marginTop: 14, marginBottom: 2, marginLeft: 2 }}>RECENT</Text>
                    {recents.map((r) => (
                      <CityRow key={r} label={r} sub={r.includes(",") ? r.split(",").slice(1).join(",").trim() : undefined} />
                    ))}
                  </>
                ) : null}
                <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 12.5, lineHeight: 18, color: c.textSecondary, marginTop: 14, marginBottom: 8, marginLeft: 2 }}>POPULAR CITIES</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {POPULAR_ORIGINS.map((label) => (
                    <Pressable
                      key={label}
                      onPress={() => pick(label)}
                      accessibilityRole="button"
                      accessibilityLabel={`Start from ${shortCity(label)}`}
                      android_ripple={{ color: withOpacity(c.gold, 0.12) }}
                      style={{ minHeight: 44, paddingHorizontal: 14, borderRadius: 22, borderWidth: 1.5, borderColor: c.border, alignItems: "center", justifyContent: "center" }}
                    >
                      <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13.5, lineHeight: 19, color: c.textPrimary }}>{shortCity(label)}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
