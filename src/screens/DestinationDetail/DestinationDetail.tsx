/**
 * Source of truth: Figma "1.2.1 Destination Detail — Overview" for the
 * hero + Overview tab. The other 7 tabs (How to Reach, Stay, Local
 * Travel, Nearby, Budget, Safety, Itinerary) have no Figma frame — the
 * Make prototype's src/screens/DestinationDetail.tsx is the reference for
 * their content and behavior (simplified here: the Make version's live
 * GPS/distance and journey-guide sub-flow on "How to Reach" isn't ported;
 * that tab instead renders the destination's own `transport` data).
 */
import { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, useWindowDimensions, type NativeSyntheticEvent, type NativeScrollEvent } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Star, Clock, Calendar, Shield, Sparkles, Images } from "lucide-react-native";
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
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [heroIndex, setHeroIndex] = useState(0);

  const markViewed = useRecentlyViewedStore((s) => s.markViewed);
  useEffect(() => {
    markViewed(d.id);
  }, [d.id, markViewed]);

  const safetyColor = getSafetyColor(d.womenSafety.score);
  const safetyBg = getSafetyBg(d.womenSafety.score);

  // Falls back to the single heroImage (as a one-slide "carousel") for
  // the many destinations that don't have `gallery` populated yet — see
  // the field's own doc comment in destinations.ts. Recomputed only when
  // the destination itself changes, not on every render, since this
  // array identity feeds the ScrollView below.
  const heroPhotos = useMemo(() => (d.gallery && d.gallery.length > 0 ? d.gallery : [d.heroImage]), [d]);

  const onHeroScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== heroIndex) setHeroIndex(next);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {/* Hero — a horizontal, paged photo carousel (falls back to a
          single-slide "carousel" of just heroImage when a destination
          has no `gallery`) rather than one static image, so a page like
          Agra's shows the Taj Mahal alongside Agra Fort, Fatehpur Sikri,
          and Mehtab Bagh, not just the one landmark photo. */}
      <View style={{ height: 300 }}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onHeroScroll}
          scrollEventThrottle={16}
        >
          {heroPhotos.map((uri, i) => (
            <Image key={`${uri}-${i}`} source={{ uri }} style={{ width, height: 300 }} contentFit="cover" />
          ))}
        </ScrollView>
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

        {/* "View all" — stacked below the safety badge rather than
            anywhere near the bottom info block, since that block's height
            shifts with how many lines the rating/duration/season row
            wraps to on a given screen. Opens the dedicated gallery grid
            (app/destination/[id]/gallery.tsx), which itself has its own
            back button returning here. */}
        <Pressable
          onPress={() => router.push(`/destination/${d.id}/gallery`)}
          style={{
            position: "absolute", top: insets.top + 48, right: 16,
            flexDirection: "row", alignItems: "center", gap: 6,
            backgroundColor: "rgba(0,0,0,0.55)",
            borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
          }}
        >
          <Images color="#FFFFFF" size={14} />
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: "#FFFFFF" }}>
            {heroPhotos.length > 1 ? `View all ${heroPhotos.length}` : "View photo"}
          </Text>
        </Pressable>

        {/* Dot indicators for the hero carousel — only meaningful (and
            only rendered) once a destination actually has more than one
            photo to page through. Vertically centred on the "Agra" name
            text's own line, not sitting at either edge of it: bottom:84
            was the line's top edge, bottom:48 its baseline/bottom edge —
            the midpoint of that span, 66, is where a hyphen-in-the-middle-
            of-the-text reading actually lands. */}
        {heroPhotos.length > 1 && (
          <View style={{ position: "absolute", bottom: 66, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 6 }}>
            {heroPhotos.map((uri, i) => (
              <View
                key={`${uri}-${i}`}
                style={{
                  width: i === heroIndex ? 16 : 6, height: 6, borderRadius: 3,
                  backgroundColor: "#FFFFFF", opacity: i === heroIndex ? 1 : 0.45,
                }}
              />
            ))}
          </View>
        )}

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
