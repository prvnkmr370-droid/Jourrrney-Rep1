/**
 * Source of truth: Figma "1.1 Home Feed" — hero photo, dark gradient scrim,
 * dot-indicator auto-advancing carousel, header (logo mark, safety button,
 * profile pill), two-tone greeting, location row, search pill.
 *
 * The Figma prototype used 3 hand-picked reference photos (Taj Mahal,
 * Spiti Valley, and a lake-palace photo captioned "Jaipur"). Here the
 * carousel instead rotates through 3 real Destination records so every
 * slide is genuinely tappable and correctly captioned — "ladakh" stands in
 * for the Spiti Valley slide (no Spiti entry in the data set), and the
 * "Jaipur" slide now uses the actual Jaipur destination's own photo rather
 * than the mismatched Udaipur photo that was in the Figma reference.
 */
import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { router } from "expo-router";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { MapPin, Shield, Search } from "lucide-react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DESTINATIONS, type Destination } from "@/data/destinations";
import { resolveUnambiguousMatch } from "@/data/matchDestination";
import { useRecentSearchesStore } from "@/store/useRecentSearchesStore";
import { CompassMark } from "@/components/JourrrneyLogo";

/** Experiment: a frosted-glass panel behind the greeting text, as an
 * alternative to the white text-glow, for legibility against the photo.
 * Flip to false to revert to the plain glow-only version — nothing else
 * needs to change. */
const USE_GREETING_BACKDROP_BLUR = true;

const HERO_IDS = ["agra", "ladakh", "jaipur"];
const HERO_DESTINATIONS: Destination[] = HERO_IDS
  .map((id) => DESTINATIONS.find((d) => d.id === id))
  .filter((d): d is Destination => !!d);

const SLIDE_MS = 4000;
const HERO_HEIGHT = 380;

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

interface Props {
  onDestinationSelect: (d: Destination) => void;
}

export default function HeroCarousel({ onDestinationSelect }: Props) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const [query, setQuery] = useState("");
  const addSearch = useRecentSearchesStore((s) => s.addSearch);
  const opacity = useSharedValue(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Typing a place name here and hitting search goes straight to that
  // destination's page when the query unambiguously means one place (same
  // rule used everywhere else in the app: an exact name/state match, or a
  // query with only one live match) — no intermediate step. An ambiguous
  // or unmatched query falls through to the full Search tab, prefilled.
  const handleSearchSubmit = () => {
    const q = query.trim();
    if (!q) return;
    const target = resolveUnambiguousMatch(q);
    if (target) {
      addSearch(q, target.id);
      onDestinationSelect(target);
    } else {
      router.push({ pathname: "/search/results", params: { q } });
    }
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      opacity.value = withTiming(0, { duration: 300 }, (finished) => {
        if (finished) {
          // runOnJS not needed — setState below happens on JS thread via callback batching
        }
      });
      setTimeout(() => {
        setIndex((i) => (i + 1) % HERO_DESTINATIONS.length);
        opacity.value = withTiming(1, { duration: 300 });
      }, 300);
    }, SLIDE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  const hero = HERO_DESTINATIONS[index];
  if (!hero) return null;

  return (
    <View style={{ height: HERO_HEIGHT }}>
      <Animated.View style={[{ position: "absolute", inset: 0 }, fadeStyle]}>
        <Image source={{ uri: hero.heroImage }} style={{ width: "100%", height: HERO_HEIGHT }} contentFit="cover" />
      </Animated.View>

      <LinearGradient
        colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.2)", "rgba(28,25,23,0.92)"]}
        locations={[0, 0.4, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.1, y: 1 }}
        style={{ position: "absolute", inset: 0 }}
      />

      {/* Header */}
      <View
        style={{
          position: "absolute", top: insets.top + 8, left: 20, right: 20,
          flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <CompassMark size={28} />
          <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 16, color: "#FFFFFF" }}>Jourrrney</Text>
        </View>

        {/* Right side: the persistent profile button (app/(tabs)/_layout.tsx)
            renders above this at the same top-right spot on every tab, so
            Home doesn't need its own copy here anymore — just the safety
            shortcut, offset left to clear it. */}
        <Pressable
          onPress={() => router.push("/(tabs)/safety")}
          style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: "rgba(255,255,255,0.15)",
            alignItems: "center", justifyContent: "center",
            marginRight: 70,
          }}
        >
          <Shield color="#FFFFFF" size={16} />
        </Pressable>
      </View>

      {/* Dot indicators */}
      <View style={{ position: "absolute", top: 100, left: 0, right: 0, flexDirection: "row", justifyContent: "center", gap: 6 }}>
        {HERO_DESTINATIONS.map((d, i) => (
          <View
            key={d.id}
            style={{
              width: i === index ? 18 : 6, height: 6, borderRadius: 3,
              backgroundColor: "#FFFFFF", opacity: i === index ? 1 : 0.4,
            }}
          />
        ))}
      </View>

      {/* Greeting + location */}
      <Pressable
        onPress={() => onDestinationSelect(hero)}
        style={{ position: "absolute", left: 20, right: 20, bottom: 90 }}
      >
        {USE_GREETING_BACKDROP_BLUR && (
          <BlurView
            intensity={16}
            tint="light"
            style={{ position: "absolute", top: -10, bottom: -10, left: -12, right: -12, borderRadius: 20, overflow: "hidden" }}
          />
        )}
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: "rgba(255,255,255,0.6)", letterSpacing: 0.5, marginBottom: 2 }}>
          {greeting()} 👋
        </Text>
        <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 30, color: "#FFFFFF", lineHeight: 36 }}>
          Where will you{"\n"}
          <Text style={{ color: "#333C81" }}>Jourrrney</Text> next?
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 }}>
          <MapPin color="#333C81" size={14} />
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
            {hero.name}, {hero.state}
          </Text>
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
            — tap to explore →
          </Text>
        </View>
      </Pressable>

      {/* Search bar — the app's one and only search entry point on Home.
          Typing a place name and hitting search goes straight to that
          destination's page (handleSearchSubmit above). Previously routed
          through /search (origin city) then /search/dates (travel date)
          before landing on an unfiltered list — neither answer was ever
          actually used by anything downstream, so that whole detour was
          removed (see the deleted OriginPrompt/TravelDates files) in
          favour of this bar doing the real search directly. */}
      <View
        style={{
          position: "absolute", left: 16, right: 16, bottom: 20,
          height: 52, borderRadius: 18, paddingHorizontal: 16,
          flexDirection: "row", alignItems: "center", gap: 12,
          backgroundColor: "rgba(255,255,255,0.96)",
          shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 20, shadowOffset: { width: 0, height: 8 },
          elevation: 6,
        }}
      >
        <Search color="#333C81" size={16} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearchSubmit}
          returnKeyType="search"
          placeholder="Where do you want to go?"
          placeholderTextColor="#78716C"
          style={{
            flex: 1, fontFamily: "Poppins_400Regular", fontSize: 14, color: "#1C1917",
            paddingVertical: 0, textAlignVertical: "center", includeFontPadding: false,
          }}
        />
      </View>
    </View>
  );
}
