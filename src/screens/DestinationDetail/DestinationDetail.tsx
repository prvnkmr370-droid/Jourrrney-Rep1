/**
 * Source of truth: Figma "1.2.1 Destination Detail — Overview" for the
 * hero + Overview tab. The other 5 tabs (How to Reach, Stay, Budget,
 * Safety, Itinerary) have no Figma frame — the Make prototype's
 * src/screens/DestinationDetail.tsx is the reference for their content
 * and behavior (simplified here: the Make version's live GPS/distance
 * and journey-guide sub-flow on "How to Reach" isn't ported; that tab
 * instead renders the destination's own `transport` data). The former
 * standalone "Local Travel" and "Nearby" tabs were folded into How to
 * Reach (as a "Getting Around" sub-section) and Overview respectively —
 * both were closely related to content already shown elsewhere and read
 * as redundant as their own top-level tabs.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, Animated, KeyboardAvoidingView, Keyboard, Platform, useWindowDimensions, type NativeSyntheticEvent, type NativeScrollEvent } from "react-native";
import DestImage from "@/components/DestImage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Star, Clock, Calendar, Shield, Sparkles, Images, Map, Rocket, BedDouble, Wallet, MoveHorizontal, ChevronLeft, ChevronRight } from "lucide-react-native";
import { getSafetyColor, getSafetyBg, type Destination } from "@/data/destinations";
import { useRecentlyViewedStore } from "@/store/useRecentlyViewedStore";
import { readJson, writeJson } from "@/store/deviceStorage";
import { useThemeColors, useResolvedScheme } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";

import OverviewTab from "./tabs/OverviewTab";
import HowToReachTab from "./tabs/HowToReachTab";
import StayTab from "./tabs/StayTab";
import BudgetTab from "./tabs/BudgetTab";
import SafetyTab from "./tabs/SafetyTab";
import ItineraryTab from "./tabs/ItineraryTab";

const TABS = [
  { id: "Overview", Icon: Map },
  { id: "How to Reach", Icon: Rocket },
  { id: "Stay", Icon: BedDouble },
  { id: "Budget", Icon: Wallet },
  { id: "Safety", Icon: Shield },
  { id: "Itinerary", Icon: Calendar },
] as const;

type Tab = (typeof TABS)[number]["id"];

// The photo at the top of a destination page is 40% of the screen's height
// plus 60pt extra (it was a fixed 300, about 35% on a typical phone, which
// made it a thin strip). Using a proportion rather than one pixel count keeps
// every destination's page the same on every screen size.
const HERO_HEIGHT_RATIO = 0.4;
const HERO_EXTRA_HEIGHT = 70;

// Photo carousel: every photo is shown full width, one at a time. The "there's
// more" cue is a one-time animation (the photos slide a little to reveal the
// next one, then settle back) plus a "Swipe for more photos" note, shown only
// the first time someone opens a multi-photo destination.
const NUDGE_DISTANCE = 84; // how far the next photo is revealed during the animation
const NUDGE_HOLD_MS = 1300; // how long it stays revealed before sliding back
// Remembered on the phone so the "swipe for more photos" hint shows only once.
const HINT_KEY = "journey_hint_photo_swipe_seen";

interface Props {
  destination: Destination;
  onBack: () => void;
  onPlanTrip: (destId: string) => void;
}

export default function DestinationDetail({ destination: d, onBack, onPlanTrip }: Props) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const scheme = useResolvedScheme();
  // RGB of the colour the hero fades into: the page background in dark mode, a warm near-black in light mode.
  const scrimRgb = scheme === "dark" ? "14,20,36" : "28,25,23";
  const { width, height: windowHeight } = useWindowDimensions();
  const heroHeight = Math.round(windowHeight * HERO_HEIGHT_RATIO) + HERO_EXTRA_HEIGHT;
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [heroIndex, setHeroIndex] = useState(0);

  const markViewed = useRecentlyViewedStore((s) => s.markViewed);
  useEffect(() => {
    markViewed(d.id);
  }, [d.id, markViewed]);

  const safetyColor = getSafetyColor(d.womenSafety.score);
  const safetyBg = getSafetyBg(d.womenSafety.score);

  // General keyboard-clearance safety net for any TextInput that ends up
  // directly in this ScrollView (How to Reach's own search fields now
  // live in a full-screen Modal instead — see ArriveSection.tsx — so
  // they no longer need this, but other tabs might add an inline input
  // later). Padding the scroll content by the keyboard's real height
  // guarantees there's room to scroll a focused input clear, same
  // approach proven out in PlanTrip/ChatStep.tsx.
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const KEYBOARD_GAP_BUFFER = 16;

  useEffect(() => {
    const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvt, (e) => setKeyboardHeight(e.endCoordinates?.height ?? 0));
    const hideSub = Keyboard.addListener(hideEvt, () => setKeyboardHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Falls back to the single heroImage (as a one-slide "carousel") for
  // the many destinations that don't have `gallery` populated yet — see
  // the field's own doc comment in destinations.ts. Recomputed only when
  // the destination itself changes, not on every render, since this
  // array identity feeds the ScrollView below.
  const heroPhotos = useMemo(() => (d.gallery && d.gallery.length > 0 ? d.gallery : [d.heroImage]), [d]);

  const multiPhoto = heroPhotos.length > 1;
  const photoWidth = width;
  const snapInterval = width;

  const heroRef = useRef<ScrollView>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const hintOpacity = useRef(new Animated.Value(0)).current;
  const hintDismissed = useRef(false);
  // The slide-back after the preview. Cancelled the moment the person touches
  // the photos or an arrow, so it can never yank them back to photo 1.
  const nudgeBackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismissHint = () => {
    if (nudgeBackTimer.current) {
      clearTimeout(nudgeBackTimer.current);
      nudgeBackTimer.current = null;
    }
    if (hintDismissed.current) return;
    hintDismissed.current = true;
    Animated.timing(hintOpacity, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => setHintVisible(false));
  };

  // Arrow buttons: move one photo at a time (the swipe still works too).
  const goToPhoto = (i: number) => {
    const target = Math.min(heroPhotos.length - 1, Math.max(0, i));
    dismissHint();
    heroRef.current?.scrollTo({ x: target * snapInterval, animated: true });
    setHeroIndex(target);
  };

  const onHeroScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const next = Math.min(heroPhotos.length - 1, Math.max(0, Math.round(x / snapInterval)));
    if (next !== heroIndex) setHeroIndex(next);
    // A real swipe (not our own little nudge) retires the hint.
    if (x > NUDGE_DISTANCE + 40 && !hintDismissed.current) dismissHint();
  };

  // First time anyone opens a multi-photo destination: show "Swipe for more
  // photos" and slide the carousel to reveal part of the next photo, then
  // settle back — the motion teaches the gesture. Remembered on the phone, so
  // it never repeats. The slide waits until the first photo has actually
  // loaded (otherwise it would reveal an empty box); if that takes more than
  // five seconds only the note is shown.
  const [heroReady, setHeroReady] = useState(false);
  const [waitedLongEnough, setWaitedLongEnough] = useState(false);
  const [hintPending, setHintPending] = useState(false);

  useEffect(() => {
    setHeroReady(false);
    setWaitedLongEnough(false);
    setHintPending(false);
    setHintVisible(false);
    hintDismissed.current = false;
    hintOpacity.setValue(0);
    if (!multiPhoto) return;
    let cancelled = false;
    const giveUp = setTimeout(() => !cancelled && setWaitedLongEnough(true), 5000);
    (async () => {
      const seen = await readJson<boolean>(HINT_KEY);
      if (cancelled || seen) return;
      void writeJson(HINT_KEY, true);
      setHintPending(true);
    })();
    return () => {
      cancelled = true;
      clearTimeout(giveUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d.id, multiPhoto]);

  // One boolean so the effect below runs once, however the two inputs flip.
  const canPlayHint = hintPending && (heroReady || waitedLongEnough);
  useEffect(() => {
    if (!canPlayHint) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => {
      if (cancelled) return;
      setHintVisible(true);
      Animated.timing(hintOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      if (heroReady) {
        heroRef.current?.scrollTo({ x: NUDGE_DISTANCE, animated: true });
        nudgeBackTimer.current = setTimeout(() => {
          nudgeBackTimer.current = null;
          heroRef.current?.scrollTo({ x: 0, animated: true });
        }, NUDGE_HOLD_MS);
      }
      timers.push(setTimeout(dismissHint, NUDGE_HOLD_MS + 2600));
    }, heroReady ? 500 : 0));
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      if (nudgeBackTimer.current) clearTimeout(nudgeBackTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canPlayHint]);

  // The whole page is one vertical scroll — photo, tab strip and content move
  // together. (Before, only the content under a fixed photo + tab strip
  // scrolled, which left a small window on short screens.) Once the photo has
  // scrolled off, a compact copy of the tab strip (with a back button) pins to
  // the top so switching tabs never needs a scroll back up.
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);
  const [tabsPinned, setTabsPinned] = useState(false);

  const onPageScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    scrollY.current = y;
    const pinned = y >= heroHeight;
    setTabsPinned((prev) => (prev === pinned ? prev : pinned));
  };

  const selectTab = (id: Tab) => {
    setActiveTab(id);
    // Switching tabs from further down: start the new tab at its top.
    if (scrollY.current > heroHeight) scrollRef.current?.scrollTo({ y: heroHeight, animated: false });
  };

  const renderTabStrip = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, gap: 4, paddingVertical: 8 }}>
      {TABS.map(({ id, Icon }) => {
        const active = activeTab === id;
        return (
          <Pressable
            key={id}
            onPress={() => selectTab(id)}
            style={{
              flexDirection: "row", alignItems: "center", gap: 6,
              paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
              backgroundColor: active ? "#333C81" : "transparent",
            }}
          >
            <Icon color={active ? "#FFFFFF" : c.textSecondary} size={14} />
            <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12, color: active ? "#FFFFFF" : c.textSecondary }}>
              {id}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {/* One scroll for the whole page. The keyboard padding below is the
          same safety net as before (see keyboardHeight above). */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          onScroll={onPageScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 100 + (keyboardHeight > 0 ? keyboardHeight + KEYBOARD_GAP_BUFFER : 0) }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero — a horizontal, paged photo carousel (falls back to a
              single-slide "carousel" of just heroImage when a destination
              has no `gallery`) rather than one static image, so a page like
              Agra's shows the Taj Mahal alongside Agra Fort, Fatehpur Sikri,
              and Mehtab Bagh, not just the one landmark photo. */}
          <View style={{ height: heroHeight }}>
            <ScrollView
              ref={heroRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onHeroScroll}
              onScrollBeginDrag={dismissHint}
              scrollEventThrottle={16}
            >
              {heroPhotos.map((uri, i) => (
                <DestImage
                  key={`${uri}-${i}`}
                  source={{ uri }}
                  style={{ width: photoWidth, height: heroHeight }}
                  contentFit="cover"
                  onLoad={i === 0 ? () => setHeroReady(true) : undefined}
                />
              ))}
            </ScrollView>
            {/* Top: a light scrim behind the back button / badges. Bottom: a
                longer, denser fade into the page background so the state,
                name and rating row stay readable on busy photos. The
                intermediate stops use the same hue as the final colour so
                the fade doesn't turn grey halfway down. */}
            <LinearGradient
              colors={[
                "rgba(0,0,0,0.4)",
                `rgba(${scrimRgb},0)`,
                `rgba(${scrimRgb},0.45)`,
                `rgba(${scrimRgb},0.82)`,
                `rgb(${scrimRgb})`,
              ]}
              locations={[0, 0.3, 0.55, 0.8, 1]}
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
                backgroundColor: "rgba(0,0,0,0.6)",
                borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
              }}
            >
              <Images color="#FFFFFF" size={14} />
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: "#FFFFFF" }}>
                {multiPhoto ? `${heroIndex + 1} / ${heroPhotos.length} · See all` : "View photo"}
              </Text>
            </Pressable>

            {/* Previous / next arrows. Always visible (not only a hint) so the
                photos clearly look browsable; the left one appears from the
                second photo on. Sit at the vertical middle of the photo,
                clear of the title block and the top buttons. */}
            {multiPhoto && heroIndex > 0 && (
              <Pressable
                onPress={() => goToPhoto(heroIndex - 1)}
                accessibilityRole="button"
                accessibilityLabel="Previous photo"
                style={{
                  position: "absolute", left: 14, top: Math.round(heroHeight * 0.38) - 4, width: 44, height: 44, borderRadius: 22,
                  backgroundColor: "rgba(0,0,0,0.55)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.55)",
                  alignItems: "center", justifyContent: "center",
                }}
              >
                <ChevronLeft color="#FFFFFF" size={24} />
              </Pressable>
            )}
            {multiPhoto && heroIndex < heroPhotos.length - 1 && (
              <Pressable
                onPress={() => goToPhoto(heroIndex + 1)}
                accessibilityRole="button"
                accessibilityLabel="Next photo"
                style={{
                  position: "absolute", right: 14, top: Math.round(heroHeight * 0.38) - 4, width: 44, height: 44, borderRadius: 22,
                  backgroundColor: "rgba(0,0,0,0.55)", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.55)",
                  alignItems: "center", justifyContent: "center",
                }}
              >
                <ChevronRight color="#FFFFFF" size={24} />
              </Pressable>
            )}

            {/* Progress bar: one segment per photo, the current one in gold.
                Anchored to the bottom of the hero (not the top) because the
                bottom-anchored title block below is a fixed distance from it.
                Replaces the six-pixel dots, which were too small to notice. */}
            {multiPhoto && (
              <View
                pointerEvents="none"
                style={{ position: "absolute", bottom: 8, left: 20, right: 20, flexDirection: "row", gap: 4 }}
              >
                {heroPhotos.map((uri, i) => (
                  <View
                    key={`${uri}-${i}`}
                    style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i === heroIndex ? "#D8B878" : "rgba(255,255,255,0.45)" }}
                  />
                ))}
              </View>
            )}

            {/* One-time hint, shown the first time a multi-photo page opens. */}
            {hintVisible && (
              <Animated.View
                pointerEvents="none"
                style={{
                  position: "absolute", top: Math.round(heroHeight * 0.38), left: 0, right: 0, alignItems: "center",
                  opacity: hintOpacity,
                }}
              >
                <View
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 14,
                    backgroundColor: "rgba(14,20,36,0.88)", borderWidth: 1, borderColor: "rgba(216,184,120,0.45)",
                  }}
                >
                  <MoveHorizontal color="#D8B878" size={16} />
                  <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12.5, color: "#FFFFFF" }}>Swipe for more photos</Text>
                  <ChevronRight color="#D8B878" size={14} />
                </View>
              </Animated.View>
            )}

            <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingBottom: multiPhoto ? 24 : 14 }}>
              <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, lineHeight: 15, color: "rgba(255,255,255,0.9)", marginBottom: 1 }}>
                {d.state}
              </Text>
              <Text
                numberOfLines={2}
                ellipsizeMode="tail"
                style={{ fontFamily: "Poppins_700Bold", fontSize: 26, lineHeight: 32, color: "#FFFFFF", marginBottom: 4 }}
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
              <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", columnGap: 12, rowGap: 2 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3, flexShrink: 1 }}>
                  <Star color="#FBBF24" fill="#FBBF24" size={12} />
                  <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: "#FFFFFF" }}>{d.rating}</Text>
                  <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
                    ({d.reviews.toLocaleString("en-IN")})
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3, flexShrink: 1 }}>
                  <Clock color="rgba(255,255,255,0.8)" size={12} />
                  <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: "rgba(255,255,255,0.88)" }}>{d.duration}</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3, flexShrink: 1 }}>
                  <Calendar color="rgba(255,255,255,0.8)" size={12} />
                  <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: "rgba(255,255,255,0.88)", flexShrink: 1 }}>{d.bestSeason}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Tab bar (in the flow; a compact pinned copy appears below once this scrolls off) */}
          <View style={{ borderBottomWidth: 1, borderBottomColor: c.border, backgroundColor: c.surface }}>{renderTabStrip()}</View>

          {/* Tab content */}
          <View>
            {activeTab === "Overview" && <OverviewTab destination={d} />}
            {activeTab === "How to Reach" && <HowToReachTab destination={d} />}
            {activeTab === "Stay" && <StayTab destination={d} />}
            {activeTab === "Budget" && <BudgetTab destination={d} />}
            {activeTab === "Safety" && <SafetyTab destination={d} />}
            {activeTab === "Itinerary" && <ItineraryTab destination={d} onPlanTrip={onPlanTrip} />}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Pinned tab strip — appears once the photo has scrolled out of view. */}
      {tabsPinned && (
        <View
          style={{
            position: "absolute", top: 0, left: 0, right: 0, paddingTop: insets.top,
            flexDirection: "row", alignItems: "center",
            backgroundColor: c.surface, borderBottomWidth: 1, borderBottomColor: c.border,
          }}
        >
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center", marginLeft: 4 }}
          >
            <ArrowLeft color={c.textPrimary} size={20} />
          </Pressable>
          <View style={{ flex: 1 }}>{renderTabStrip()}</View>
        </View>
      )}

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
