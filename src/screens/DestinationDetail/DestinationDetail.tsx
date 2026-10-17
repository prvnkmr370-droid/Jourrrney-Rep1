/**
 * Source of truth: Figma "1.2.1 Destination Detail — Overview" for the
 * hero. The page below it is no longer a set of tabs: a destination's home
 * page is the photo, the open status with the best time to visit, the address with a Map button, Directions, About <place>
 * (the description, and under "Read more" the Top highlights), Places Near (always visible), four rows that each open their own page (Where to stay,
 * How to get there, What to know before I go, Is it safe? — see
 * pages/DestinationPages.tsx), "A day at <place>" (the ready-made day that used
 * to be the Day plan tab).
 * "Plan my trip with AI" at the bottom goes straight to the AI planner.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, Animated, useWindowDimensions, Share, Linking, Alert, type NativeSyntheticEvent, type NativeScrollEvent } from "react-native";
import DestImage from "@/components/DestImage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Star, Images, MoveHorizontal, ChevronLeft, ChevronRight, Heart, Share2 } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { DESTINATION_COORDS } from "@/data/destinationCoords";
import { DESTINATION_COORDS_GEOCODED } from "@/data/destinationCoordsGeocoded";
import { useFavourites } from "@/hooks/useFavourites";
import SignInToSaveSheet from "@/components/SignInToSaveSheet";
import { QuickFacts, AddressRow, ActionRow, ExploreRows, type HubTarget } from "./HubSections";
import { placeAddress, mapSearchUrl } from "@/utils/placeAddress";
import { useRecentlyViewedStore } from "@/store/useRecentlyViewedStore";
import { readJson, writeJson } from "@/store/deviceStorage";
import { useThemeColors, useResolvedScheme } from "@/theme/useThemeColors";

import OverviewTab from "./tabs/OverviewTab";
import DayPlanCard from "./DayPlanCard";
import AboutIntro from "./AboutIntro";
import PlanBar from "./PlanBar";

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
  const [heroIndex, setHeroIndex] = useState(0);

  const markViewed = useRecentlyViewedStore((s) => s.markViewed);
  useEffect(() => {
    markViewed(d.id);
  }, [d.id, markViewed]);

  // Heart (favourite), Share and Directions. Only a registered, signed-in
  // account can favourite a place (see useFavourites); anyone else gets a short
  // "sign in to save" sheet, and the place is saved for them as soon as they
  // come back signed in.
  const fav = useFavourites();
  const saved = fav.isFavourite(d.id);
  const [signInSheet, setSignInSheet] = useState(false);
  const saveAfterSignIn = useRef(false);
  const placeName = d.name.replace(/\s*\([^)]*\)/g, "").trim();
  const stateName = d.state.replace(/\s*\([^)]*\)/g, "").trim();
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const onToggleSave = () => {
    const result = fav.toggle(d.id);
    if (result === "needs-signin") {
      saveAfterSignIn.current = true;
      setSignInSheet(true);
      return;
    }
    showToast(result === "added" ? `Saved ${placeName} to your favourites` : `Removed ${placeName} from your favourites`);
  };
  useEffect(() => {
    if (!fav.canSave || !saveAfterSignIn.current) return;
    saveAfterSignIn.current = false;
    if (!fav.isFavourite(d.id)) fav.toggle(d.id);
    showToast(`Saved ${placeName} to your favourites`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fav.canSave]);
  const onShare = async () => {
    try {
      await Share.share({ message: `${placeName}, ${stateName}${d.tagline ? ` — ${d.tagline}` : ""}\nFound on Jourrrney.` });
    } catch {
      // The person closed the share sheet, or this device can't share: nothing to report.
    }
  };
  const address = placeAddress(d);
  const onOpenMap = async () => {
    try {
      await Linking.openURL(mapSearchUrl(address.mapQuery));
    } catch {
      Alert.alert("Couldn't open maps", "Please check that a maps app or browser is available, then try again.");
    }
  };
  const onDirections = async () => {
    const coords = DESTINATION_COORDS[d.id] ?? DESTINATION_COORDS_GEOCODED[d.id];
    const destination = coords ? `${coords.lat},${coords.lon}` : encodeURIComponent(`${placeName}, ${stateName}`);
    try {
      await Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`);
    } catch {
      Alert.alert("Couldn't open maps", "Please check that a maps app or browser is available, then try again.");
    }
  };

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

  // The whole page is one vertical scroll. Once the photo has scrolled off, a
  // slim bar with a labelled Back button and the place's name pins to the top,
  // so there is always a way back without scrolling up.
  const [barVisible, setBarVisible] = useState(false);
  const onPageScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const show = e.nativeEvent.contentOffset.y >= heroHeight - (insets.top + 60);
    setBarVisible((prev) => (prev === show ? prev : show));
  };

  // The four rows each open their own page (pages/DestinationPages.tsx).
  // Planning has no row: the "Plan my trip with AI" bar opens the AI planner.
  const openPage = (target: HubTarget) => router.push(`/destination/${d.id}/${target}`);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      {/* One scroll for the whole page. */}
      <ScrollView
        style={{ flex: 1 }}
        onScroll={onPageScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 100 }}
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

          {/* A round back button, 44pt like Share and Save; screen readers still hear "Back". */}
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={{ position: "absolute", top: insets.top + 8, left: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center" }}
          >
            <ArrowLeft color="#FFFFFF" size={22} />
          </Pressable>

          {/* Share and Save on the photo, where people look for them. */}
          <Pressable
            onPress={onShare}
            accessibilityRole="button"
            accessibilityLabel={`Share ${placeName}`}
            style={{ position: "absolute", top: insets.top + 8, right: 70, width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center" }}
          >
            <Share2 color="#FFFFFF" size={20} />
          </Pressable>
          <Pressable
            onPress={onToggleSave}
            accessibilityRole="button"
            accessibilityState={{ selected: saved }}
            accessibilityLabel={saved ? `${placeName} is in your favourites. Tap to remove.` : `Save ${placeName} to your favourites`}
            style={{ position: "absolute", top: insets.top + 8, right: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(0,0,0,0.55)", alignItems: "center", justifyContent: "center" }}
          >
            <Heart color={saved ? "#FF6B81" : "#FFFFFF"} fill={saved ? "#FF6B81" : "none"} size={20} />
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
            {/* Rating on the left, "See all" on the right of the same row. It used
                to sit under Share/Save, where on a short phone it ran into the
                photo arrows; here it shares a row with the rating only, so a
                long place name above it keeps the full width. Opens the
                dedicated gallery grid (app/destination/[id]/gallery.tsx),
                which has its own back button returning here. */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
              <View style={{ flexShrink: 1, flexDirection: "row", alignItems: "center", gap: 3 }}>
                <Star color="#FBBF24" fill="#FBBF24" size={12} />
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: "#FFFFFF" }}>{d.rating}</Text>
                <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
                  ({d.reviews.toLocaleString("en-IN")})
                </Text>
              </View>
              <Pressable
                onPress={() => router.push(`/destination/${d.id}/gallery`)}
                accessibilityRole="button"
                accessibilityLabel={multiPhoto ? `Photo ${heroIndex + 1} of ${heroPhotos.length}. See all photos.` : "View photo"}
                style={{
                  minHeight: 44, flexDirection: "row", alignItems: "center", gap: 6,
                  backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 999, paddingHorizontal: 14,
                }}
              >
                <Images color="#FFFFFF" size={15} />
                <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: "#FFFFFF" }}>
                  {multiPhoto ? `${heroIndex + 1} / ${heroPhotos.length} · See all` : "View photo"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <QuickFacts destination={d} />
        <AddressRow address={address.text} placeName={placeName} onOpenMap={onOpenMap} />
        <ActionRow placeName={placeName} onDirections={onDirections} />
        <AboutIntro destination={d} />
        {/* Places Near sits directly under the About block (and its Top highlights).
            It is plain content, always visible: "Show less" folds only the
            description and the highlights, never this. */}
        <OverviewTab destination={d} />
        <ExploreRows destination={d} onOpen={openPage} />
        <DayPlanCard destination={d} onPlanTrip={() => onPlanTrip(d.id)} />
      </ScrollView>

      {/* Pinned bar: appears once the photo has scrolled out of view. */}
      {barVisible && (
        <View
          style={{
            position: "absolute", top: 0, left: 0, right: 0, paddingTop: insets.top + 8, paddingBottom: 8, paddingHorizontal: 12,
            flexDirection: "row", alignItems: "center", gap: 10,
            backgroundColor: c.surface, borderBottomWidth: 1, borderBottomColor: c.border,
          }}
        >
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surfaceAlt, alignItems: "center", justifyContent: "center" }}
          >
            <ArrowLeft color={c.textPrimary} size={22} />
          </Pressable>
          <Text numberOfLines={1} maxFontSizeMultiplier={1.3} style={{ flex: 1, fontFamily: "Poppins_700Bold", fontSize: 15, color: c.textPrimary }}>
            {placeName}
          </Text>
        </View>
      )}

      {toast && (
        <View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          style={{ position: "absolute", left: 16, right: 16, bottom: Math.max(insets.bottom, 16) + 76, backgroundColor: c.textPrimary, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11 }}
        >
          <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, lineHeight: 18, color: c.bg }}>{toast}</Text>
        </View>
      )}

      <PlanBar placeName={placeName} onPress={() => onPlanTrip(d.id)} />

      <SignInToSaveSheet
        visible={signInSheet}
        localOnlySignIn={fav.localOnlySignIn}
        onClose={() => { setSignInSheet(false); saveAfterSignIn.current = false; }}
        onContinue={() => setSignInSheet(false)}
      />
    </View>
  );
}
