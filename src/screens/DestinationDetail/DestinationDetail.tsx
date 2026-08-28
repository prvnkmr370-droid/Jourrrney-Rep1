/**
 * Source of truth: Figma "1.2.1 Destination Detail — Overview" for the
 * hero + Overview tab. The other 7 tabs (How to Reach, Stay, Local
 * Travel, Nearby, Budget, Safety, Itinerary) have no Figma frame — the
 * Make prototype's src/screens/DestinationDetail.tsx is the reference for
 * their content and behavior (simplified here: the Make version's live
 * GPS/distance and journey-guide sub-flow on "How to Reach" isn't ported;
 * that tab instead renders the destination's own `transport` data).
 */
import { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Star, Clock, Calendar, Shield, Sparkles } from "lucide-react-native";
import { getSafetyColor, getSafetyBg, type Destination } from "@/data/destinations";
import { useRecentlyViewedStore } from "@/store/useRecentlyViewedStore";
import { useThemeColors } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";

import OverviewTab from "./tabs/OverviewTab";
import HowToReachTab from "./tabs/HowToReachTab";
import StayTab from "./tabs/StayTab";
import LocalTravelTab from "./tabs/LocalTravelTab";
import NearbyTab from "./tabs/NearbyTab";
import BudgetTab from "./tabs/BudgetTab";
import SafetyTab from "./tabs/SafetyTab";
import ItineraryTab from "./tabs/ItineraryTab";

const TABS = [
  { id: "Overview", emoji: "🗺️" },
  { id: "How to Reach", emoji: "🚀" },
  { id: "Stay", emoji: "🏨" },
  { id: "Local Travel", emoji: "🛺" },
  { id: "Nearby", emoji: "📍" },
  { id: "Budget", emoji: "💰" },
  { id: "Safety", emoji: "🛡️" },
  { id: "Itinerary", emoji: "📅" },
] as const;

type Tab = (typeof TABS)[number]["id"];

interface Props {
  destination: Destination;
  onBack: () => void;
  onPlanTrip: (destId: string) => void;
}

export default function DestinationDetail({ destination: d, onBack, onPlanTrip }: Props) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  const markViewed = useRecentlyViewedStore((s) => s.markViewed);
  useEffect(() => {
    markViewed(d.id);
  }, [d.id, markViewed]);

  const safetyColor = getSafetyColor(d.womenSafety.score);
  const safetyBg = getSafetyBg(d.womenSafety.score);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Hero */}
      <View style={{ height: 300 }}>
        <Image source={{ uri: d.heroImage }} style={{ width: "100%", height: 300 }} contentFit="cover" />
        <LinearGradient
          colors={["rgba(0,0,0,0.4)", "transparent", "#1C1917"]}
          locations={[0, 0.4, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ position: "absolute", inset: 0 }}
        />

        <Pressable
          onPress={onBack}
          style={{
            position: "absolute", top: insets.top + 8, left: 16,
            width: 40, height: 40, borderRadius: 20,
            backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center",
          }}
        >
          <ArrowLeft color="#FFFFFF" size={20} />
        </Pressable>

        <View
          style={{
            position: "absolute", top: insets.top + 8, right: 16,
            flexDirection: "row", alignItems: "center", gap: 6,
            backgroundColor: safetyBg, borderWidth: 1, borderColor: safetyColor,
            borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
          }}
        >
          <Shield color={safetyColor} size={14} />
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: safetyColor }}>
            Safety {d.womenSafety.score}/10
          </Text>
        </View>

        {/* Wikimedia Commons images are CC BY-SA — attribution is a
            license requirement, not a style choice. Unsplash images (the
            majority) carry no imageCredit and this renders nothing. */}
        {d.imageCredit && (
          <Text
            style={{
              position: "absolute", bottom: 8, right: 12,
              fontFamily: "Poppins_400Regular", fontSize: 9, color: "rgba(255,255,255,0.7)",
            }}
          >
            {d.imageCredit}
          </Text>
        )}

        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 20 }}>
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>
            {d.state}
          </Text>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 30, color: "#FFFFFF", marginBottom: 8 }}>
            {d.name}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Star color="#FBBF24" fill="#FBBF24" size={14} />
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: "#FFFFFF" }}>{d.rating}</Text>
              <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                ({d.reviews.toLocaleString("en-IN")})
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Clock color="rgba(255,255,255,0.6)" size={14} />
              <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{d.duration}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Calendar color="rgba(255,255,255,0.6)" size={14} />
              <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{d.bestSeason}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tab bar */}
      <View style={{ borderBottomWidth: 1, borderBottomColor: c.border, backgroundColor: c.surface }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 4, paddingVertical: 8 }}>
          {TABS.map(({ id, emoji }) => {
            const active = activeTab === id;
            return (
              <Pressable
                key={id}
                onPress={() => setActiveTab(id)}
                style={{
                  flexDirection: "row", alignItems: "center", gap: 6,
                  paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
                  backgroundColor: active ? "#333C81" : "transparent",
                }}
              >
                <Text style={{ fontSize: 13 }}>{emoji}</Text>
                <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12, color: active ? "#FFFFFF" : c.textSecondary }}>
                  {id}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Tab content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {activeTab === "Overview" && <OverviewTab destination={d} />}
        {activeTab === "How to Reach" && <HowToReachTab destination={d} />}
        {activeTab === "Stay" && <StayTab destination={d} />}
        {activeTab === "Local Travel" && <LocalTravelTab destination={d} />}
        {activeTab === "Nearby" && <NearbyTab destination={d} />}
        {activeTab === "Budget" && <BudgetTab destination={d} />}
        {activeTab === "Safety" && <SafetyTab destination={d} />}
        {activeTab === "Itinerary" && <ItineraryTab destination={d} onPlanTrip={onPlanTrip} />}
      </ScrollView>

      {/* Sticky CTA */}
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 16), backgroundColor: withOpacity(c.bg, 0.97), borderTopWidth: 1, borderTopColor: c.borderSoft }}>
        <Pressable
          onPress={() => onPlanTrip(d.id)}
          style={{
            flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
            backgroundColor: "#333C81", borderRadius: 16, paddingVertical: 14,
          }}
        >
          <Sparkles color="#FFFFFF" size={16} />
          <Text
            style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: "#FFFFFF", flexShrink: 1 }}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {/* Some destination names carry a parenthetical alt-name
                (e.g. "Havelock Island (Swaraj Dweep)") that made this
                button overflow — stripped here for just the short name.
                numberOfLines+adjustsFontSizeToFit stay as a safety net
                for any name that's still long. */}
            Plan My Trip to {d.name.replace(/\s*\([^)]*\)/, "")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
