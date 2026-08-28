/** Source of truth: Figma "1.3.2 Origin Prompt". */
import { useState } from "react";
import { View, Text, Pressable, TextInput, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Navigation, MapPin } from "lucide-react-native";
import { useOriginStore } from "@/store/useOriginStore";
import { withOpacity } from "@/components/withOpacity";
import { useThemeColors } from "@/theme/useThemeColors";
import { useDetectLocation } from "@/hooks/useDetectLocation";

const RECENT = ["Bengaluru, Karnataka", "Chennai, Tamil Nadu"];

interface Props {
  destinationName?: string;
  onContinue: () => void;
}

export default function OriginPrompt({ destinationName, onContinue }: Props) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const originCity = useOriginStore((s) => s.originCity);
  const setOriginCity = useOriginStore((s) => s.setOriginCity);
  const [value, setValue] = useState(originCity);
  const { locating, detect } = useDetectLocation();

  const detectLocation = async () => {
    const city = await detect();
    if (city) setValue(city);
  };

  const handleContinue = () => {
    setOriginCity(value.split(",")[0].trim() || value);
    onContinue();
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingHorizontal: 20, paddingTop: insets.top + 40, paddingBottom: Math.max(insets.bottom, 24) }}>
      <View style={{ width: 100, height: 100, borderRadius: 24, backgroundColor: withOpacity(c.primary, 0.12), alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <Navigation color={c.primary} size={36} />
      </View>

      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 24, color: c.textPrimary, marginBottom: 12 }}>
        Where are you travelling from?
      </Text>
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary, marginBottom: 24 }}>
        So we can show real distances and travel times to {destinationName ?? "your next destination"}.
      </Text>

      <View
        style={{
          flexDirection: "row", alignItems: "center", gap: 10, height: 52, borderRadius: 16, paddingHorizontal: 16,
          borderWidth: 1.5, borderColor: c.primary, backgroundColor: c.surface, marginBottom: 24,
        }}
      >
        <MapPin color={c.primary} size={16} />
        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder="Enter your city"
          placeholderTextColor={c.textMuted}
          style={{ flex: 1, fontFamily: "Poppins_500Medium", fontSize: 14, color: c.textPrimary }}
        />
        <Pressable
          onPress={detectLocation}
          disabled={locating}
          style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.surfaceAlt, alignItems: "center", justifyContent: "center" }}
        >
          {locating ? <ActivityIndicator size="small" color={c.primary} /> : <Navigation color={c.primary} size={14} />}
        </Pressable>
      </View>

      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, letterSpacing: 1, color: c.textSecondary, marginBottom: 12 }}>RECENT</Text>
      <View style={{ gap: 10, marginBottom: 32 }}>
        {RECENT.map((city) => (
          <Pressable
            key={city}
            onPress={() => setValue(city)}
            style={{ flexDirection: "row", alignItems: "center", gap: 10, height: 44, borderRadius: 14, paddingHorizontal: 14, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }}
          >
            <MapPin color={c.textSecondary} size={13} />
            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: c.textPrimary }}>{city}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={handleContinue} style={{ backgroundColor: "#333C81", borderRadius: 16, paddingVertical: 16, alignItems: "center" }}>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: "#FFFFFF" }}>Continue</Text>
      </Pressable>
    </View>
  );
}
