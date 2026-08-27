import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Shield } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { useThemeColors } from "@/theme/useThemeColors";

interface Props {
  destination: Destination;
  onPress: () => void;
}

/** Ported from the Make prototype's SafeCard — used in the "Safest for
 * Women & Solo Travel" rail on the Home Feed. */
export default function SafeCard({ destination, onPress }: Props) {
  const c = useThemeColors();
  return (
    <Pressable onPress={onPress} style={{ width: 145, borderRadius: 20, overflow: "hidden" }}>
      <View style={{ height: 110 }}>
        <Image source={{ uri: destination.image }} style={{ width: 145, height: 110 }} contentFit="cover" />
        <LinearGradient
          colors={["rgba(0,0,0,0.7)", "transparent"]}
          locations={[0, 0.6]}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={{ position: "absolute", inset: 0 }}
        />
        <View
          style={{
            position: "absolute", bottom: 8, left: 8, height: 20,
            flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 3,
            backgroundColor: "rgba(21,128,61,0.9)", borderRadius: 999,
            paddingHorizontal: 8,
          }}
        >
          <Shield color="#FFFFFF" size={10} />
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, lineHeight: 14, color: "#FFFFFF" }}>
            {destination.womenSafety.score}/10
          </Text>
        </View>
      </View>
      <View style={{ backgroundColor: c.surface, padding: 10 }}>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: c.textPrimary }} numberOfLines={1}>
          {destination.name}
        </Text>
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary, marginTop: 2 }}>
          {destination.womenSafety.level}
        </Text>
      </View>
    </Pressable>
  );
}
