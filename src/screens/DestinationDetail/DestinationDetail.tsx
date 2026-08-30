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

        {/* Hero-carousel dot indicators — deliberately their own
            absolutely-positioned layer at a FIXED offset from the top of
            the (fixed-height, 300px) hero, entirely independent of the
            state/name/rating block below. That block is bottom-anchored
            and its own height varies card-to-card (a 2-line name, a
            wrapped rating row), which is exactly why an earlier version —
            with the dots living inside that block, right above the name —
            drifted to a different vertical position on every card: shorter
            content pushed the whole block (and the dots inside it) down
            toward mid-image, longer content pushed it up near the top.
            Anchoring the dots to the top of the hero instead, below the
            back/safety/"view all" icon row, makes their position identical
            on every card regardless of how long that destination's name or
            season text is. Only rendered once there's more than one photo
            to page through. */}
        {heroPhotos.length > 1 && (
          <View
            pointerEvents="none"
            style={{ position: "absolute", top: insets.top + 86, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 6 }}
          >
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

        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: 20 }}>
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>
            {d.state}
          </Text>
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={{ fontFamily: "Poppins_700Bold", fontSize: 30, color: "#FFFFFF", marginBottom: 8 }}
          >
            {d.name}
          </Text>
          {/* flexWrap on this row only wraps whole items onto a new line —
              it does nothing for a single long item's own text, which by
              default renders on one line and overflows past the hero's
              horizontal padding rather than wrapping (bestSeason strings
              like "November – February (winter migratory season); dawn is
              the best time of day" ran straight past the right edge,
              blowing through the margin entirely). flexShrink: 1 on each
              icon+text pair lets that pair shrink to the row's actual
              available width so its Text wraps inside it instead of
              spilling out — same fix applied to all three pairs for
              consistency, even though rating/duration are normally short. */}
          <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 1 }}>
              <Star color="#FBBF24" fill="#FBBF24" size={14} />
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: "#FFFFFF" }}>{d.rating}</Text>
              <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                ({d.reviews.toLocaleString("en-IN")})
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 1 }}>
              <Clock color="rgba(255,255,255,0.6)" size={14} />
              <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: "rgba(255,255,255,0.7)" }}>{d.duration}</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, flexShrink: 1 }}>
              <Calendar color="rgba(255,255,255,0.6)" size={14} />
              <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: "rgba(255,255,255,0.7)", flexShrink: 1 }}>{d.bestSeason}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Wikimedia Commons images are CC BY-SA — attribution is a license
          requirement, not a style choice. Unsplash images (the majority)
          carry no imageCredit and this renders nothing. Deliberately laid
          out in normal flow, in its own dedicated strip below the hero,
          rather than absolutely positioned over it: an overlay sharing the
          same bottom-right corner as the name/rating block wrapped onto
          multiple lines for longer multi-photographer credits (e.g. six
          names) and grew upward into that block. Fixed to a single line
          with a trailing ellipsis so its height — and therefore this
          strip's — never varies. */}
      {d.imageCredit && (
        <View style={{ paddingHorizontal: 20, paddingVertical: 4, backgroundColor: c.bg }}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ fontFamily: "Poppins_400Regular", fontSize: 9, color: c.textMuted }}
          >
            {d.imageCredit}
          </Text>
        </View>
      )}

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
