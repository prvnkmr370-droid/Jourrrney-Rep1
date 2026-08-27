import { View, Text, Pressable } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Star, MapPin } from "lucide-react-native";
import type { Destination } from "@/data/destinations";

interface Props {
  destination: Destination;
  onPress: () => void;
  tall?: boolean;
}

/** Ported from the Make prototype's HeroCard — image card used in the
 * Popular Destinations and Karnataka rails on the Home Feed. */
export default function DestinationCard({ destination, onPress, tall }: Props) {
  const width = tall ? 155 : 170;
  const height = tall ? 210 : 185;

  return (
    <Pressable onPress={onPress} style={{ width, height, borderRadius: 20, overflow: "hidden" }}>
      <Image source={{ uri: destination.image }} style={{ width, height }} contentFit="cover" />
      <LinearGradient
        colors={["rgba(0,0,0,0.82)", "rgba(0,0,0,0.05)", "transparent"]}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={{ position: "absolute", inset: 0 }}
      />

      {/* Category and rating badges share the same height/centering/type
          scale so the two pills — sitting at the same top offset on
          opposite corners — line up instead of one looking taller or
          off-center against the other. */}
      <View
        style={{
          position: "absolute", top: 10, right: 10, height: 20,
          flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 3,
          backgroundColor: "rgba(0,0,0,0.45)", borderRadius: 999,
          paddingHorizontal: 8,
        }}
      >
        <Star color="#FBBF24" fill="#FBBF24" size={10} />
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, lineHeight: 14, color: "#FFFFFF" }}>{destination.rating}</Text>
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
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
            {destination.state}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
