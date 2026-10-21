/** Source of truth: Figma "1.1.1 Location Permission Prompt". */
import { View, Text, Pressable } from "react-native";
import * as Location from "expo-location";
import { MapPin } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { withOpacity } from "@/components/withOpacity";
import { useThemeColors } from "@/theme/useThemeColors";

interface Props {
  onDone: () => void;
}

export default function LocationPermission({ onDone }: Props) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();

  const handleAllow = async () => {
    try {
      await Location.requestForegroundPermissionsAsync();
    } finally {
      onDone();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingHorizontal: 20, paddingTop: insets.top + 40, paddingBottom: Math.max(insets.bottom, 24) }}>
      <View style={{ width: 100, height: 100, borderRadius: 24, backgroundColor: withOpacity(c.primary, 0.12) }} />
      <View style={{ marginTop: 20, marginBottom: 30 }}>
        <MapPin color={c.primary} size={40} />
      </View>

      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 26, color: c.textPrimary, marginBottom: 16 }}>
        Routes from where you are
      </Text>
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 21, color: c.textSecondary, marginBottom: 32 }}>
        Jourrrney uses your exact location to find the nearest airport, station and bus stand to you, and how to reach each place from where you are. It stays on this phone and is never sent to our servers.
      </Text>

      <Pressable onPress={handleAllow} style={{ backgroundColor: "#333C81", borderRadius: 16, paddingVertical: 16, alignItems: "center" }}>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: "#FFFFFF" }}>Allow While Using App</Text>
      </Pressable>

      <Pressable onPress={onDone} style={{ paddingVertical: 16, alignItems: "center" }}>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.textSecondary }}>Not Now</Text>
      </Pressable>

      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textMuted, textAlign: "center", marginTop: 8 }}>
        You can change this anytime in Settings.
      </Text>
    </View>
  );
}
