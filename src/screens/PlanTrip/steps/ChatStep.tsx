/**
 * Source of truth: user-provided screenshot of the target "Plan My Trip"
 * chat screen (a conversational blank-screen AI input, replacing the old
 * multi-section form entirely — see FormStep's removal in this same
 * change). Tia, the app's AI travel companion, asks a short sequence of
 * questions — destination, days, travelers, trip style — parsing free-text
 * replies where it can (parseTripMessage.ts) and falling back to quick-
 * reply chips for anything enumerable, before handing off to the existing
 * generating/result flow.
 *
 * Three things inspired by researching how Layla.ai's chat behaves:
 *  1. Fuzzy requests ("somewhere warm and cheap in February") that the
 *     fast local matcher can't resolve fall back to a Gemini-backed
 *     interpretation (aiIntent.ts) grounded in this app's own destination
 *     list, rather than dead-ending on "I don't understand."
 *  2. The conversation isn't a rigid one-way wizard — a mid-chat
 *     correction ("actually make it 7 days", "make it premium instead")
 *     is recognized at any point past the initial destination answer, not
 *     just when the current question happens to be about that field. See
 *     applyCorrections()/proceedFromCollected() below.
 *  3. A photo can stand in for a destination name — "show Tia a picture
 *     you're inspired by" — using the same Gemini vision call as fuzzy
 *     text parsing (see pickImage() and tryParseTripIntent's optional
 *     `image` argument), grounded the same way: it can only ever land on
 *     one of this app's real destinations, never invent one.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Keyboard, Platform, Alert, type NativeSyntheticEvent, type TextInputContentSizeChangeEventData } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated";
// Deliberately NOT a static top-level import. expo-image-picker's native
// module isn't present in every client this app might run in (a plain
// Expo Go install in particular) — a static import throws
// "Cannot find native module 'ExponentImagePicker'" the instant this
// file is evaluated, which crashed the *entire* Plan Trip route (and
// silently dropped its tab from the bottom nav bar, since expo-router
// can't register a route whose module threw before exporting anything).
// Loading it lazily, only when the camera button is actually pressed,
// means a missing native module degrades just that one feature instead
// of taking the whole screen down with it — see pickImage() below.
import type * as ImagePickerType from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Send, Camera, Sparkle } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { useThemeColors, useResolvedScheme } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";
import { getTabBarFootprint } from "@/components/BottomTabBar";
import { STYLE_CONFIGS, type TravelStyle } from "../data";
import { parseTripMessage, parseMultiDestinationMessage, extractDays, SUGGESTED_DESTINATIONS, type TripSegment } from "../parseTripMessage";
import { tryParseTripIntent } from "../aiIntent";

interface Chip {
  label: string;
  onPress: () => void;
}

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  chips?: Chip[];
  /** Local file URI of a picked photo, shown as a thumbnail in the
   * user's own message bubble — display-only, separate from the base64
   * payload actually sent to the backend (see pickImage()). */
  imageUri?: string;
}

type Phase = "destination" | "days" | "travelers" | "style" | "confirm";

/** One stop on the trip — days is null until asked/answered. A single-
 * destination trip (still the vast majority) is just a one-element
 * `legs` array; multi-destination ("Mysore then Coorg") is 2+. Keeping
 * ONE model for both instead of a separate single-destination code path
 * is what let every phase-transition/correction function below stay a
 * single implementation rather than two parallel ones. */
interface Leg {
  destination: Destination;
  days: number | null;
}

interface Props {
  onBack?: () => void;
  originCity: string;
  /** Set when arriving via a specific destination's own "Plan My Trip"
   * button (see app/plan/[destId].tsx) — skips the "where are you
   * dreaming of going" question entirely and opens straight on the days
   * question, since the destination is already known. */
  preselectedDestination?: Destination | null;
  onReady: (legs: { destination: Destination; days: number }[], people: number, style: TravelStyle, interests: string[]) => void;
  tabBarHeight?: number;
}

// Seeded from the clock, NOT 0. A plain `let idCounter = 0` collides in
// dev: every Fast Refresh re-evaluates this module and resets the counter
// to 0, but React keeps the existing `messages` state across the reload —
// so the next id handed out is `m1` again, duplicating a message already
// on screen (the "two children with the same key" warning). Date.now()
// always advances faster than messages are created, so after any reload
// the sequence resumes above every id issued before it. Monotonic, so
// it also stays unique under StrictMode's double-invoked state updaters.
let idCounter = Date.now();
const nextId = () => `m${++idCounter}`;

const TRAVELER_OPTIONS = [1, 2, 3, 4];
const THINKING_ID = "thinking";

// Full label match ("Budget Explorer") first, then the plainer single
// words people actually say in a sentence ("make it premium instead") —
// checked as whole words so "comfortable" doesn't also fire on something
// like "uncomfortable".
const STYLE_KEYWORDS: Record<TravelStyle, RegExp> = {
  backpacker: /\b(budget|backpacker|backpacking)\b/,
  comfortable: /\bcomfortable\b/,
  premium: /\b(premium|luxury|luxurious)\b/,
};

const styleKeywordMatch = (lower: string) =>
  STYLE_CONFIGS.find((sc) => lower.includes(sc.label.toLowerCase()) || STYLE_KEYWORDS[sc.id].test(lower));

export default function ChatStep({ onBack, originCity, preselectedDestination, onReady, tabBarHeight = 0 }: Props) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();

  // KeyboardAvoidingView's own Android "height" behavior turned out to be
  // the actual source of the persistent gap — its internal animated
  // height offset doesn't reliably reset to 0 once the keyboard closes
  // (a known RN/Android issue, more likely to surface after a focus →
  // type → dismiss cycle than on first render), leaving the screen
  // permanently shrunk by roughly a keyboard's worth of height even
  // though every value *this* component computes (keyboardVisible,
  // ctaBottomInset) correctly says the keyboard is gone. Tracking the
  // keyboard's real height ourselves and driving the screen's bottom
  // padding directly — instead of leaning on KeyboardAvoidingView's own
  // Android animation — means there's exactly one source of truth, and
  // it resets to a hard 0 on hide rather than an animation that can get
  // stuck mid-flight.
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const keyboardVisible = keyboardHeight > 0;
  // Android's reported keyboard height (endCoordinates.height above)
  // measures the IME window itself, but doesn't reliably include Gboard's
  // (and other keyboards') word-suggestion strip riding above the actual
  // key rows — that strip's extra height was exactly what was still
  // eating into the padding meant to clear the keyboard, leaving the
  // input row's send button/textbox slightly behind it despite the
  // padding math otherwise checking out. A fixed buffer on top of the
  // measured height, rather than trying to measure the suggestion strip
  // itself (it's native chrome outside this app's view tree), reliably
  // gives the requested clear 16px of breathing room above the keyboard.
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

  // BottomTabBar (our custom floating pill) is position:"absolute" at its
  // own root, which pulls it out of react-navigation's normal flex layout
  // entirely — this screen genuinely renders full-height *behind* it (an
  // overlay, not a reserved-space sibling), so the input bar needs real
  // clearance equal to the tab bar's actual height, not just a flat 20.
  // The tabBarHeight *prop* (react-navigation's useBottomTabBarHeight())
  // is only used here as a cheap "is there a tab bar at all" signal
  // (>0 on the tab route, 0 on the no-tab-bar plan/[destId].tsx modal) —
  // its magnitude is NOT used for the actual clearance math anymore.
  // Round-tripping a live-measured height through react-navigation's own
  // height-reporting context (BottomTabBarHeightCallbackContext) proved
  // unreliable in practice — the input ended up either behind the tab bar
  // or floating well above it depending on what got measured/reported
  // when. getTabBarFootprint() instead computes the pill's height from
  // BottomTabBar.tsx's own fixed layout constants, which can't drift out
  // of sync with a live measurement the way that did. The no-tab-bar
  // modal presentation instead needs the home-indicator/gesture-bar
  // inset cleared manually. Skipped while the keyboard is open (see
  // comment above) — 20 alone is enough padding above the keyboard
  // itself, no tab bar to clear at the same time. (The extra clearance
  // requested on top of the keyboard itself — see KEYBOARD_GAP_BUFFER
  // below — lives on the *outer* container's paddingBottom instead of
  // here, since that's what was actually falling short.)
  const ctaBottomInset = keyboardVisible
    ? 20
    : (tabBarHeight > 0 ? getTabBarFootprint(insets.bottom) : Math.max(insets.bottom, 16)) + 20;

  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    preselectedDestination
      ? [
          {
            id: nextId(),
            sender: "ai",
            text: `Hey! I'm Tia, your AI travel companion. 🧭\nLet's plan your trip to ${preselectedDestination.name}, ${preselectedDestination.state}! How many days are you planning for?`,
          },
        ]
      : [
          {
            id: nextId(),
            sender: "ai",
            text: originCity
              ? `Hey! I'm Tia, your AI travel companion. 🧭\nI'll plan your perfect trip from ${originCity}. Where are you dreaming of going? (You can also say something like "Mysore then Coorg" for a multi-stop trip.)`
              : `Hey! I'm Tia, your AI travel companion. 🧭\nWhere are you dreaming of going? (Anywhere in India for now — tell me your starting city too if you like. You can also say "Mysore then Coorg" for a multi-stop trip.)`,
          },
        ],
  );
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>(preselectedDestination ? "days" : "destination");
  const [inputHeight, setInputHeight] = useState(20);
  const [sending, setSending] = useState(false);
  const collected = useRef<{ legs: Leg[]; activeLegIndex: number; people: number | null; style: TravelStyle | null; interests: string[] }>({
    legs: preselectedDestination ? [{ destination: preselectedDestination, days: null }] : [],
    activeLegIndex: 0,
    people: null,
    style: null,
    interests: [],
  });
  const scrollRef = useRef<ScrollView>(null);

  const pushAi = (text: string, chips?: Chip[]) =>
    setMessages((prev) => [...prev, { id: nextId(), sender: "ai", text, chips }]);
  const pushUser = (text: string, imageUri?: string) => setMessages((prev) => [...prev, { id: nextId(), sender: "user", text, imageUri }]);
  const removeMessage = (id: string) => setMessages((prev) => prev.filter((m) => m.id !== id));

  const scrollToEnd = () => requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));

  const askTravelers = () => {
    setPhase("travelers");
    pushAi(
      "How many travelers?",
      TRAVELER_OPTIONS.map((n) => ({
        label: n === 4 ? "4+" : String(n),
        onPress: () => selectTravelers(n),
      })),
    );
    scrollToEnd();
  };

  const askStyle = () => {
    setPhase("style");
    pushAi(
      "What kind of trip are you after?",
      STYLE_CONFIGS.map((sc) => ({
        label: `${sc.emoji} ${sc.label}`,
        onPress: () => selectStyle(sc.id),
      })),
    );
    scrollToEnd();
  };

  const askConfirm = () => {
    const { legs, people, style } = collected.current;
    if (!people || !style) return; // proceedFromCollected only calls this once both are set
    setPhase("confirm");
    const sc = STYLE_CONFIGS.find((s) => s.id === style)!;
    const totalDays = legs.reduce((sum, l) => sum + (l.days ?? 0), 0);
    const routeLabel = legs.map((l) => `${l.days} day${l.days === 1 ? "" : "s"} in ${l.destination.name}`).join(", then ");
    const fromClause = originCity ? ` from ${originCity}` : "";
    pushAi(
      `Here's the plan: ${routeLabel} (${totalDays} day${totalDays === 1 ? "" : "s"} total)${fromClause}, ${sc.label.toLowerCase()} for ${people} traveller${people === 1 ? "" : "s"}. Ready?`,
      [{ label: "✨ Plan My Trip", onPress: confirmAndGenerate }],
    );
    scrollToEnd();
  };

  // Single source of truth for "what do we still need to ask" — every
  // path that updates collected.current (a fresh answer OR a mid-chat
  // correction) calls this afterward rather than deciding the next step
  // itself, so corrections can jump straight back to confirmation once
  // every field is filled, from wherever in the conversation they happen.
  // For a multi-leg trip this asks for each leg's day count in turn
  // (tracked via activeLegIndex) before moving on to travelers/style,
  // same as it would for a single destination.
  const proceedFromCollected = () => {
    const { legs, people, style } = collected.current;
    if (legs.length === 0) {
      setPhase("destination");
      return;
    }
    const nextLegIdx = legs.findIndex((l) => l.days === null);
    if (nextLegIdx !== -1) {
      collected.current.activeLegIndex = nextLegIdx;
      setPhase("days");
      const leg = legs[nextLegIdx];
      pushAi(legs.length > 1 ? `How many days in ${leg.destination.name}?` : `How many days are you planning for ${leg.destination.name}?`);
      scrollToEnd();
      return;
    }
    if (!people) {
      askTravelers();
      return;
    }
    if (!style) {
      askStyle();
      return;
    }
    askConfirm();
  };

  // Replaces the old destination as the one place `legs` gets set —
  // handles both a single match and a multi-stop match (2+ segments from
  // parseMultiDestinationMessage) through the same path, so every caller
  // (typed text, a disambiguation chip, a suggested-destination chip, the
  // photo flow) shares one implementation regardless of which one it is.
  const setLegs = (matches: TripSegment[]) => {
    collected.current.legs = matches.map((m) => ({ destination: m.destination, days: m.days }));
    collected.current.activeLegIndex = 0;
    const routeLabel = matches.map((m) => m.destination.name).join(" → ");
    pushUser(routeLabel);
    if (matches.length > 1) {
      pushAi(`Nice, a multi-stop trip: ${routeLabel}! 🧳`);
    } else if (matches[0].days) {
      pushAi(`Love it — ${matches[0].days} days in ${matches[0].destination.name}! 🎒`);
    } else {
      pushAi(`Great choice — ${matches[0].destination.name}, ${matches[0].destination.state}! ✨`);
    }
    proceedFromCollected();
    scrollToEnd();
  };

  // Thin single-destination wrapper — kept so every existing chip
  // onPress (disambiguation candidates, suggested destinations, the
  // photo flow) that only ever deals with one place doesn't need to
  // build a TripSegment array itself.
  const selectDestination = (dest: Destination, daysAlreadyKnown: number | null) => setLegs([{ destination: dest, days: daysAlreadyKnown }]);

  const selectDays = (n: number) => {
    const leg = collected.current.legs[collected.current.activeLegIndex];
    leg.days = n;
    pushUser(`${n} day${n === 1 ? "" : "s"}`);
    pushAi(`Got it, ${n} day${n === 1 ? "" : "s"}${collected.current.legs.length > 1 ? ` in ${leg.destination.name}` : ""}.`);
    proceedFromCollected();
  };

  const selectTravelers = (n: number) => {
    collected.current.people = n;
    pushUser(n === 4 ? "4+" : String(n));
    proceedFromCollected();
  };

  const selectStyle = (style: TravelStyle) => {
    collected.current.style = style;
    const sc = STYLE_CONFIGS.find((s) => s.id === style)!;
    pushUser(sc.label);
    proceedFromCollected();
  };

  const confirmAndGenerate = () => {
    const { legs, people, style, interests } = collected.current;
    if (legs.length > 0 && legs.every((l): l is { destination: Destination; days: number } => l.days !== null) && people && style) {
      onReady(legs, people, style, interests);
    }
  };

  // Mid-chat corrections — only checked once a destination is already
  // locked in (so it never fires on the very first message, which the
  // normal destination-parsing branch below already owns) and only past
  // the destination-asking phase (so a normal reply to "where are you
  // dreaming of going?" isn't misread as a "correction" to itself).
  // Recognizes a new destination name, a day count, a traveler count
  // ("4 people", "3 travellers"), or a style keyword anywhere in a
  // message, regardless of which question is currently being asked.
  //
  // Destination/day corrections are single-destination-trip only —
  // which leg "actually make it 7 days" refers to is genuinely ambiguous
  // once there's more than one, so a multi-leg trip only allows the
  // trip-wide traveler-count/style corrections below (still useful, just
  // narrower) rather than guessing which stop a correction meant.
  const applyCorrections = (text: string): string[] => {
    const { legs } = collected.current;
    if (legs.length === 0 || phase === "destination") return [];
    const changes: string[] = [];

    if (legs.length === 1) {
      const reparsed = parseTripMessage(text);
      if (reparsed.destination && reparsed.destination.id !== legs[0].destination.id) {
        legs[0].destination = reparsed.destination;
        changes.push(`destination to ${reparsed.destination.name}`);
      }
      if (reparsed.days && reparsed.days !== legs[0].days) {
        legs[0].days = reparsed.days;
        changes.push(`${reparsed.days} day${reparsed.days === 1 ? "" : "s"}`);
      }
    }

    const travelerMatch = text.match(/\b(\d{1,2})\s*(people|travell?ers?|of us|pax)\b/i);
    if (travelerMatch) {
      const n = Number(travelerMatch[1]);
      if (n >= 1 && n <= 20 && n !== collected.current.people) {
        collected.current.people = n;
        changes.push(`${n} traveller${n === 1 ? "" : "s"}`);
      }
    }

    const styleHit = styleKeywordMatch(text.toLowerCase());
    if (styleHit && styleHit.id !== collected.current.style) {
      collected.current.style = styleHit.id;
      changes.push(styleHit.label);
    }

    return changes;
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    pushUser(text);
    scrollToEnd();

    const changes = applyCorrections(text);
    if (changes.length > 0) {
      pushAi(`Got it — updated to ${changes.join(", ")}.`);
      proceedFromCollected();
      scrollToEnd();
      return;
    }

    if (phase === "destination") {
      // Multi-destination ("Mysore then Coorg") checked first — it only
      // ever returns non-null when it found 2+ genuinely distinct,
      // unambiguously-matched legs, so this never intercepts an ordinary
      // single-destination message.
      const multi = parseMultiDestinationMessage(text);
      if (multi) {
        setLegs(multi);
        return;
      }

      const parsed = parseTripMessage(text);
      collected.current.interests = [...new Set([...collected.current.interests, ...parsed.interests])];
      if (parsed.destination) {
        selectDestination(parsed.destination, parsed.days);
        return;
      }
      if (parsed.candidates.length > 0) {
        pushAi(
          "A few places match that — which one did you mean?",
          parsed.candidates.map((d) => ({ label: `${d.name}, ${d.state}`, onPress: () => selectDestination(d, parsed.days) })),
        );
        scrollToEnd();
        return;
      }

      // Local matching found nothing at all — before deciding it's an
      // unsupported (non-Indian) place, ask Gemini to interpret the
      // request against the app's real destination list. Handles vague
      // "vibe" requests ("somewhere warm and cheap in February") the
      // local regex/fuzzy matcher was never meant to understand, same
      // spirit as Layla.ai's fuzzy-request handling. Only worth the extra
      // network round-trip when the message looks like a genuine attempt
      // at describing a trip, not filler like "hi" or "ok".
      if (parsed.unmatchedPlaceAttempt || text.split(/\s+/).length >= 4) {
        setSending(true);
        setMessages((prev) => [...prev, { id: THINKING_ID, sender: "ai", text: "Let me think about that… 🧭" }]);
        scrollToEnd();
        const intent = await tryParseTripIntent(text);
        removeMessage(THINKING_ID);
        setSending(false);

        if (intent?.destination) {
          if (intent.people) collected.current.people = intent.people;
          if (intent.style) collected.current.style = intent.style;
          if (intent.interests.length > 0) collected.current.interests = [...new Set([...collected.current.interests, ...intent.interests])];
          collected.current.legs = [{ destination: intent.destination, days: intent.days }];
          collected.current.activeLegIndex = 0;
          pushUser(intent.destination.name);
          pushAi(intent.reasoning || `Great choice — ${intent.destination.name}, ${intent.destination.state}! ✨`);
          proceedFromCollected();
          scrollToEnd();
          return;
        }

        // Gemini either explicitly declined to match anything (a real
        // international place, or nothing fits) or the call itself
        // failed — either way, same graceful redirect as a plain
        // unmatched local attempt, so a fuzzy-parsing outage never
        // blocks the conversation.
        pushAi(
          "We're currently focused on India 🇮🇳 — we'll be excited to help once we go worldwide! Here are a few popular Indian destinations to start with, or tell me another place:",
          SUGGESTED_DESTINATIONS.map((d) => ({ label: d.name, onPress: () => selectDestination(d, null) })),
        );
        scrollToEnd();
        return;
      }

      pushAi("Tell me a city or place in India you'd like to visit — e.g. \"Mysore\" or \"Kerala backwaters.\"");
      scrollToEnd();
      return;
    }

    if (phase === "days") {
      const n = extractDays(text) ?? (/^\d{1,2}$/.test(text) ? Number(text) : null);
      if (n && n >= 1 && n <= 30) {
        selectDays(n);
      } else {
        pushAi("Just the number of days works — e.g. \"5\".");
      }
      scrollToEnd();
      return;
    }

    // Travelers/style/confirm are chip-driven; a stray typed message that
    // wasn't recognized as a correction above just gets a gentle nudge
    // back to the chips rather than being silently ignored.
    pushAi("Tap one of the options above to continue — or the button once you're ready.");
    scrollToEnd();
  };

  // Loads expo-image-picker lazily (see the top-of-file comment on the
  // type-only import) and normalizes the module shape it comes back as.
  // Metro's dynamic import() of a CJS module is inconsistent about
  // whether the real exports land on the namespace object directly or
  // under `.default` — this was the actual cause of "the camera icon
  // does nothing": the import succeeded, but
  // `ImagePicker.requestMediaLibraryPermissionsAsync` was undefined
  // because the functions were actually one level deeper, and calling
  // undefined as a function threw an unhandled promise rejection with no
  // visible feedback at all.
  async function loadImagePicker(): Promise<typeof ImagePickerType | null> {
    try {
      const mod = await import("expo-image-picker");
      const resolved = (mod as unknown as { default?: typeof ImagePickerType }).default ?? mod;
      return typeof resolved.launchCameraAsync === "function" ? resolved : null;
    } catch {
      return null;
    }
  }

  // Shared by both "Take Photo" and "Choose from Library" below — once an
  // asset is picked, the rest (thinking indicator, Gemini vision call,
  // destination-found/not-found handling) is identical regardless of
  // where the photo came from.
  const processPickedAsset = async (asset: { uri: string; base64?: string | null; mimeType?: string }) => {
    if (!asset.base64) return;
    pushUser("📷 Photo", asset.uri);
    setSending(true);
    setMessages((prev) => [...prev, { id: THINKING_ID, sender: "ai", text: "Let me take a look… 🧭" }]);
    scrollToEnd();

    const mimeType = asset.mimeType && asset.mimeType.startsWith("image/") ? asset.mimeType : "image/jpeg";
    const intent = await tryParseTripIntent("", { base64: asset.base64, mimeType });
    removeMessage(THINKING_ID);
    setSending(false);

    if (intent?.destination) {
      if (intent.people) collected.current.people = intent.people;
      if (intent.style) collected.current.style = intent.style;
      if (intent.interests.length > 0) collected.current.interests = [...new Set([...collected.current.interests, ...intent.interests])];
      collected.current.legs = [{ destination: intent.destination, days: intent.days }];
      collected.current.activeLegIndex = 0;
      pushAi(intent.reasoning || `Great choice — ${intent.destination.name}, ${intent.destination.state}! ✨`);
      proceedFromCollected();
      scrollToEnd();
      return;
    }

    pushAi(
      "That doesn't look like it matches one of India's destinations we support yet 🇮🇳 — we'll be excited to help once we go worldwide! Here are a few popular ones to start with, or tell me a place:",
      SUGGESTED_DESTINATIONS.map((d) => ({ label: d.name, onPress: () => selectDestination(d, null) })),
    );
    scrollToEnd();
  };

  const takePhoto = async () => {
    const ImagePicker = await loadImagePicker();
    if (!ImagePicker) {
      pushAi("Photo suggestions aren't available in this app build right now — just tell me a place instead!");
      scrollToEnd();
      return;
    }
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        pushAi("I'd need camera permission to try that — you can enable it in your device settings, or just tell me a place instead.");
        scrollToEnd();
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.5 });
      if (!result.canceled && result.assets?.[0]) await processPickedAsset(result.assets[0]);
    } catch {
      pushAi("Couldn't open the camera just now — try again, or just tell me a place instead.");
      scrollToEnd();
    }
  };

  const chooseFromLibrary = async () => {
    const ImagePicker = await loadImagePicker();
    if (!ImagePicker) {
      pushAi("Photo suggestions aren't available in this app build right now — just tell me a place instead!");
      scrollToEnd();
      return;
    }
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        pushAi("I'd need permission to access your photos to try that — you can enable it in your device settings, or just tell me a place instead.");
        scrollToEnd();
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], base64: true, quality: 0.5 });
      if (!result.canceled && result.assets?.[0]) await processPickedAsset(result.assets[0]);
    } catch {
      pushAi("Couldn't open your photos just now — try again, or just tell me a place instead.");
      scrollToEnd();
    }
  };

  // "Show Tia a photo" — only offered during the destination question
  // (see the camera button's conditional render below). Offers both a
  // live camera shot and picking an existing photo — the button's own
  // Camera icon previously only ever opened the library, which is why
  // tapping it looked like "the camera doesn't open" even when photo
  // picking itself was working.
  const pickImage = () => {
    if (sending) return;
    Alert.alert("Add a Photo", "Where would you like the photo from?", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: chooseFromLibrary },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const showChips = useMemo(() => messages[messages.length - 1]?.sender === "ai" && !!messages[messages.length - 1]?.chips, [messages]);

  return (
    // KeyboardAvoidingView is what actually fixes "the input field is
    // hidden when the keyboard opens" — nothing in this screen previously
    // accounted for the keyboard at all, so the input bar just sat behind
    // it once the OS keyboard came up.
    //
    // iOS keeps the standard "padding" behavior — no issues reported
    // there. Android deliberately does NOT use KeyboardAvoidingView's own
    // "height" behavior: relying on the OS's default windowSoftInputMode
    // ("adjustResize") stopped working once this app's Android build
    // moved to edge-to-edge display (mandatory as of Expo SDK 54 /
    // targeting Android 15), which is what "height" was introduced to
    // replace — but KeyboardAvoidingView's own Android height-tracking
    // animation turned out to be unreliable in practice too, occasionally
    // not resetting fully after a focus → type → dismiss cycle and
    // leaving a permanent gap the size of a keyboard. paddingBottom here
    // instead applies the keyboard height *this component already tracks
    // itself* (see keyboardHeight above, driven directly off
    // Keyboard.addListener) — one source of truth that hard-resets to 0
    // on hide, rather than a second, separate animated value that can
    // get stuck mid-transition.
    <KeyboardAvoidingView
      style={{
        flex: 1,
        backgroundColor: c.bg,
        paddingBottom: Platform.OS === "android" && keyboardVisible ? keyboardHeight + KEYBOARD_GAP_BUFFER : 0,
      }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingTop: insets.top + 8, paddingBottom: 12, backgroundColor: c.surface, borderBottomWidth: 1, borderBottomColor: c.borderSoft }}>
        {onBack && (
          <Pressable onPress={onBack} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.surfaceAlt, alignItems: "center", justifyContent: "center" }}>
            <ArrowLeft color={c.textPrimary} size={18} />
          </Pressable>
        )}
        <View>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 18, color: c.textPrimary }}>Plan My Trip</Text>
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary, marginTop: 1 }}>
            Personalised itinerary with budget breakdown
          </Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        // The missing style={{flex:1}} here was the actual cause of "a
        // white patch below the chat window" — without it, the ScrollView
        // only sized itself to however tall its messages happened to be
        // (short conversations especially), leaving a gap between it and
        // the input bar that exposed the screen's default white scene
        // background instead of this app's own themed bg.
        style={{ flex: 1, backgroundColor: c.bg }}
        contentContainerStyle={{ padding: 16, paddingBottom: 20, gap: 12 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={scrollToEnd}
      >
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} c={c} isLastChips={showChips && m.id === messages[messages.length - 1].id} />
        ))}
      </ScrollView>

      <View
        style={{
          flexDirection: "row", alignItems: "flex-end", gap: 10,
          paddingHorizontal: 16, paddingTop: 10, paddingBottom: ctaBottomInset,
          backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.borderSoft,
        }}
      >
        {/* Only offered while Tia is still asking "where are you dreaming
            of going?" — a photo answers that same question, so it
            wouldn't make sense once a destination is already locked in. */}
        {phase === "destination" && (
          <Pressable
            onPress={pickImage}
            disabled={sending}
            style={{
              width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center",
              backgroundColor: c.surfaceAlt, opacity: sending ? 0.5 : 1,
            }}
          >
            <Camera color={c.primary} size={20} />
          </Pressable>
        )}
        <View
          style={{
            flex: 1, minHeight: 48, maxHeight: 110, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 12,
            backgroundColor: c.surfaceAlt, justifyContent: "center",
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            onFocus={scrollToEnd}
            multiline
            editable={!sending}
            onContentSizeChange={(e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) =>
              setInputHeight(Math.min(86, Math.max(20, e.nativeEvent.contentSize.height)))
            }
            placeholder="Type a city or destination…"
            placeholderTextColor={c.textMuted}
            style={{
              fontFamily: "Poppins_400Regular", fontSize: 14, color: c.textPrimary,
              height: inputHeight, paddingVertical: 0,
            }}
          />
        </View>
        <Pressable
          onPress={handleSend}
          disabled={!input.trim() || sending}
          style={{
            width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center",
            // Always the app's blue accent now, rather than fading to a
            // dull grey with nothing typed — still communicates "can't
            // send yet" via reduced opacity instead of a color swap.
            backgroundColor: "#333C81",
            opacity: input.trim() && !sending ? 1 : 0.4,
          }}
        >
          <Send color="#FFFFFF" size={18} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ message, c, isLastChips }: { message: ChatMessage; c: ReturnType<typeof useThemeColors>; isLastChips: boolean }) {
  const isAi = message.sender === "ai";
  return (
    <View style={{ flexDirection: "row", justifyContent: isAi ? "flex-start" : "flex-end", gap: 8 }}>
      {isAi && <TiaAvatar c={c} />}
      <View style={{ maxWidth: "78%", gap: 8 }}>
        {message.imageUri && (
          <Image source={{ uri: message.imageUri }} style={{ width: 160, height: 160, borderRadius: 16 }} contentFit="cover" />
        )}
        <View
          style={{
            backgroundColor: isAi ? c.surface : "#333C81",
            borderRadius: 18,
            borderTopLeftRadius: isAi ? 4 : 18,
            borderTopRightRadius: isAi ? 18 : 4,
            paddingHorizontal: 14, paddingVertical: 10,
            borderWidth: isAi ? 1 : 0, borderColor: c.border,
          }}
        >
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: isAi ? c.textPrimary : "#FFFFFF" }}>
            {message.text}
          </Text>
        </View>
        {message.chips && message.chips.length > 0 && (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {message.chips.map((chip, i) => (
              <Pressable
                key={i}
                onPress={chip.onPress}
                disabled={!isLastChips}
                style={{
                  paddingHorizontal: 14, paddingVertical: 9, borderRadius: 999,
                  backgroundColor: withOpacity(c.primary, 0.1), borderWidth: 1.5, borderColor: c.primary,
                  opacity: isLastChips ? 1 : 0.5,
                }}
              >
                <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12, color: c.primary }}>{chip.label}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

// Tia's avatar: a Sparkle (Gemini-style single 4-point star, not the
// tab bar's multi-point Sparkles) instead of the old "t" letter. Dark
// mode keeps a flat solid fill — the ring border + glow already echo
// the Plan Trip tab's own active-state bubble (BottomTabBar.tsx). Light
// mode gets a Gemini-esque multi-color gradient with a slow pulsing
// white highlight layered on top for a shimmer, per request — kept
// light-mode-only since a shimmer reads as a genuine effect against a
// bright background but just looks like flicker on a dark one.
function TiaAvatar({ c }: { c: ReturnType<typeof useThemeColors> }) {
  const scheme = useResolvedScheme();
  const shimmer = useSharedValue(0.15);

  useEffect(() => {
    if (scheme !== "light") return;
    shimmer.value = withRepeat(withTiming(0.55, { duration: 1100, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [scheme, shimmer]);

  const shimmerStyle = useAnimatedStyle(() => ({ opacity: shimmer.value }));

  return (
    <View style={{ alignItems: "center", marginTop: 2 }}>
      <View
        style={{
          width: 32, height: 32, borderRadius: 16, overflow: "hidden",
          borderWidth: 2, borderColor: c.surface,
          shadowColor: "#333C81", shadowOpacity: 0.4, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
          elevation: 4,
        }}
      >
        {scheme === "light" ? (
          <LinearGradient
            colors={["#4285F4", "#9B72CB", "#D96570"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          >
            <Animated.View style={[{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF" }, shimmerStyle]} />
            <Sparkle color="#FFFFFF" fill="#FFFFFF" size={16} />
          </LinearGradient>
        ) : (
          <View style={{ flex: 1, backgroundColor: "#333C81", alignItems: "center", justifyContent: "center" }}>
            <Sparkle color="#FFFFFF" size={16} />
          </View>
        )}
      </View>
      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 8, color: c.textSecondary, marginTop: 2, letterSpacing: 0.2 }}>
        Tia
      </Text>
    </View>
  );
}
