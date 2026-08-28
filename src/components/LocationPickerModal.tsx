/**
 * Full-screen "pin your location on a map" picker — like Google Maps'
 * location picker: search a place (jumps the map there), tap/drag
 * anywhere to drop a pin, or use your current GPS location as the
 * starting pin. Whatever the pin's final position is when you confirm
 * gets reverse-geocoded to a real place name.
 *
 * Rendered as a React Native Modal (not a router route) so it can be
 * dropped into any of the three "starting point" inputs (Search's Origin
 * Prompt, Plan Trip's Route step, Destination Detail's How to Reach) and
 * hand its result straight back via onConfirm — no cross-screen state
 * sync needed, since it never leaves the calling component's tree.
 *
 * Needs react-native-maps, a native module — only works in the custom
 * EAS dev client, not plain Expo Go. Android additionally needs a Google
 * Maps API key in app.json (android.config.googleMaps.apiKey) — see
 * app.json's placeholder and the setup guide that came with this change.
 */
import { useRef, useState } from "react";
import { Modal, View, Text, Pressable, TextInput, ActivityIndicator, Platform } from "react-native";
import MapView, { Marker, type Region } from "react-native-maps";
import * as Location from "expo-location";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, Search, LocateFixed, Check } from "lucide-react-native";
import { useThemeColors } from "@/theme/useThemeColors";
import { useCitySearch, formatCitySuggestion } from "@/hooks/useCitySearch";

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (label: string) => void;
}

// Roughly centered on India, zoomed out enough to be a reasonable
// starting view for anyone who hasn't searched or located themselves yet.
const DEFAULT_REGION: Region = { latitude: 22.5, longitude: 79.0, latitudeDelta: 12, longitudeDelta: 12 };
const PIN_REGION_DELTA = 0.08;

export default function LocationPickerModal({ visible, onClose, onConfirm }: Props) {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [pin, setPin] = useState<{ latitude: number; longitude: number } | null>(null);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [locating, setLocating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const { suggestions } = useCitySearch(query);
  const showSuggestions = searchFocused && suggestions.length > 0;

  const goTo = (latitude: number, longitude: number) => {
    setPin({ latitude, longitude });
    mapRef.current?.animateToRegion({ latitude, longitude, latitudeDelta: PIN_REGION_DELTA, longitudeDelta: PIN_REGION_DELTA }, 400);
  };

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) return;
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
      goTo(pos.coords.latitude, pos.coords.longitude);
    } catch {
      // silent — this is a convenience shortcut; the user can still tap the map directly
    } finally {
      setLocating(false);
    }
  };

  const handleConfirm = async () => {
    if (!pin) return;
    setConfirming(true);
    try {
      const [place] = await Location.reverseGeocodeAsync(pin);
      const city = place?.city ?? place?.subregion ?? place?.region;
      const label = city ? (place?.region && place.region !== city ? `${city}, ${place.region}` : city) : `${pin.latitude.toFixed(4)}, ${pin.longitude.toFixed(4)}`;
      onConfirm(label);
    } catch {
      onConfirm(`${pin.latitude.toFixed(4)}, ${pin.longitude.toFixed(4)}`);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={DEFAULT_REGION}
          onPress={(e) => setPin(e.nativeEvent.coordinate)}
          // Android needs Google's provider explicitly for the Maps SDK
          // key in app.json to apply; iOS defaults to Apple Maps fine
          // without this.
          provider={Platform.OS === "android" ? "google" : undefined}
        >
          {pin && (
            <Marker
              coordinate={pin}
              draggable
              onDragEnd={(e) => setPin(e.nativeEvent.coordinate)}
            />
          )}
        </MapView>

        {/* Header: back + search */}
        <View style={{ position: "absolute", top: insets.top + 8, left: 16, right: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Pressable
              onPress={onClose}
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surface, alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 }}
            >
              <X color={c.textPrimary} size={20} />
            </Pressable>
            <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8, height: 44, borderRadius: 22, paddingHorizontal: 14, backgroundColor: c.surface, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 }}>
              <Search color={c.textSecondary} size={16} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search for a place"
                placeholderTextColor={c.textMuted}
                style={{ flex: 1, fontFamily: "Poppins_400Regular", fontSize: 14, color: c.textPrimary }}
              />
            </View>
          </View>

          {showSuggestions && (
            <View style={{ marginTop: 8, marginLeft: 52, backgroundColor: c.surface, borderRadius: 14, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 }}>
              {suggestions.map((s, i) => (
                <Pressable
                  key={s.id}
                  onPressIn={() => {
                    setQuery(formatCitySuggestion(s));
                    setSearchFocused(false);
                    goTo(s.latitude, s.longitude);
                  }}
                  style={{ paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: c.borderSoft }}
                >
                  <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, color: c.textPrimary }}>{s.name}</Text>
                  {(s.admin1 || s.country) && (
                    <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary, marginTop: 1 }}>
                      {[s.admin1, s.country].filter(Boolean).join(", ")}
                    </Text>
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Current-location shortcut */}
        <Pressable
          onPress={handleUseCurrentLocation}
          disabled={locating}
          style={{
            position: "absolute", right: 16, bottom: insets.bottom + 96,
            width: 44, height: 44, borderRadius: 22, backgroundColor: c.surface, alignItems: "center", justifyContent: "center",
            shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
          }}
        >
          {locating ? <ActivityIndicator color={c.primary} size="small" /> : <LocateFixed color={c.primary} size={18} />}
        </Pressable>

        {/* Bottom sheet */}
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 14, paddingBottom: Math.max(insets.bottom, 16), backgroundColor: c.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10, elevation: 6 }}>
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary, marginBottom: 10, textAlign: "center" }}>
            {pin ? "Drag the pin to fine-tune, then confirm" : "Search, tap the map, or use your current location to drop a pin"}
          </Text>
          <Pressable
            onPress={handleConfirm}
            disabled={!pin || confirming}
            style={{
              flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
              backgroundColor: pin ? "#333C81" : c.surfaceAlt, borderRadius: 16, paddingVertical: 14,
            }}
          >
            {confirming ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Check color={pin ? "#FFFFFF" : c.textMuted} size={16} />}
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: pin ? "#FFFFFF" : c.textMuted }}>
              {confirming ? "Locating…" : "Confirm this location"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
