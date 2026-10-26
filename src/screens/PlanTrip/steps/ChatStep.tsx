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
import { DESTINATIONS, type Destination } from "@/data/destinations";
import { useOriginStore } from "@/store/useOriginStore";
import { useThemeColors, useResolvedScheme } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";
import { getTabBarFootprint } from "@/components/BottomTabBar";
import { STYLE_CONFIGS, type TravelStyle } from "../data";
import { parseTripMessage, parseMultiDestinationMessage, extractDays, wordToNumber, MAX_TRIP_DAYS, SUGGESTED_DESTINATIONS, type TripSegment } from "../parseTripMessage";
import { tryParseTripIntent } from "../aiIntent";
import { TripChips, PopularCards, CountStepper, PeopleCards, StayCards, SummaryCard, peopleLabel, peopleLong, STAY_GENERIC, DAY_OPTIONS, type TripFacet, type PeopleOption, type StayOption } from "./ChatWidgets";

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

type Phase = "destination" | "days" | "travelers" | "style";

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
   * button (see app/(tabs)/plan/[destId].tsx) — skips the "where are you
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

const THINKING_ID = "thinking";

// "Popular right now": the photo cards under Tia's first question. A fixed,
// hand-picked six that all have verified photos, so the first screen looks the
// same for everyone. Any other place is a typed name (or Surprise me) away.
const POPULAR = ["coorg", "goa", "munnar", "udaipur", "ladakh", "darjeeling"]
  .map((id) => DESTINATIONS.find((d) => d.id === id))
  .filter((d): d is Destination => !!d);

const plainName = (d: Destination) => d.name.replace(/\s*\([^)]*\)/g, "").trim();
// "Coorg, Karnataka", but just "Goa" when the place and its state share a name.
const placeAndState = (d: Destination) => {
  const state = d.state.replace(/\s*\([^)]*\)/g, "").trim();
  return plainName(d) === state ? state : `${plainName(d)}, ${state}`;
};

/** "Surprise me": one random place from the 60 most-reviewed curated destinations. */
function surprisePick(): Destination {
  const top = DESTINATIONS.filter((d) => !d.hidden).sort((a, b) => b.reviews - a.reviews).slice(0, 60);
  return top[Math.floor(Math.random() * top.length)];
}

// Full label match ("Budget Explorer") first, then the plainer single
// words people actually say in a sentence ("make it premium instead") —
// checked as whole words so "comfortable" doesn't also fire on something
// like "uncomfortable".
const STYLE_KEYWORDS: Record<TravelStyle, RegExp> = {
  backpacker: /\b(budget|backpacker|backpacking|hostel|hostels|dorm|dorms|guesthouse|guesthouses)\b/,
  comfortable: /\b(comfortable|mid-?range|hotel|hotels)\b/,
  premium: /\b(premium|luxury|luxurious|resort|resorts)\b/,
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
  // (>0 on both the Plan Trip tab and the destination-launched plan/[destId]
  // hidden tab, which share the same bottom bar) —
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

  // What the trip chips show lives in `collected` (a ref, so answers apply
  // instantly), which doesn't re-render by itself — bump() after any change.
  const [, bump] = useState(0);

  // The question days is asked with, and the first line of the conversation: short,
  // and the place's own suggested length is the hint. Used when a place is already known.
  const daysQuestion = (d: Destination) => `${plainName(d)} is lovely. How many days? (${d.duration} suits it well.)`;
  const greeting = () =>
    preselectedDestination
      ? `Hi, I'm Tia. ${daysQuestion(preselectedDestination)}`
      : originCity
        ? `Hi, I'm Tia. I'll plan your trip from ${originCity}. Where would you like to go?`
        : "Hi, I'm Tia. I'll plan your trip. Where would you like to go?";

  const [messages, setMessages] = useState<ChatMessage[]>(() => [{ id: nextId(), sender: "ai", text: greeting() }]);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>(preselectedDestination ? "days" : "destination");
  // Which answer the traveller tapped a trip chip to change (null when none), and
  // whether every answer is in and Tia is waiting for "Build my trip".
  const [editing, setEditing] = useState<TripFacet | null>(null);
  const [ready, setReady] = useState(false);
  // Set while Tia is asking "how many of you in all?" after Family or A group.
  const [countFor, setCountFor] = useState<PeopleOption | null>(null);
  const [inputHeight, setInputHeight] = useState(20);
  const [sending, setSending] = useState(false);
  const collected = useRef<{ legs: Leg[]; activeLegIndex: number; people: number | null; style: TravelStyle | null; stayType: string | null; interests: string[] }>({
    legs: preselectedDestination ? [{ destination: preselectedDestination, days: null }] : [],
    activeLegIndex: 0,
    people: null,
    style: null,
    stayType: null,
    interests: [],
  });
  const scrollRef = useRef<ScrollView>(null);

  const pushAi = (text: string, chips?: Chip[]) =>
    setMessages((prev) => [...prev, { id: nextId(), sender: "ai", text, chips }]);
  const pushUser = (text: string, imageUri?: string) => setMessages((prev) => [...prev, { id: nextId(), sender: "user", text, imageUri }]);
  const removeMessage = (id: string) => setMessages((prev) => prev.filter((m) => m.id !== id));
  const setMessageText = (id: string, text: string) => setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, text } : m)));

  const scrollToEnd = () => requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));

  // The answers themselves are cards under the question (see ChatWidgets.tsx), so
  // these just ask in words and move the typed-reply parsing to the right question.
  const askTravelers = () => {
    setPhase("travelers");
    pushAi("How many people are travelling?");
    scrollToEnd();
  };

  const askStyle = () => {
    setPhase("style");
    pushAi("What type of stay are you looking for?");
    scrollToEnd();
  };

  // Every answer is in. Tia shows what she understood and waits for "Build my
  // trip", so a wrong answer can still be changed from the chips above before
  // anything is built. `quiet` skips the line when a correction message was just
  // posted, so the two don't repeat each other.
  const askReady = (quiet = false) => {
    setPhase("style");
    setEditing(null);
    setReady(true);
    if (!quiet) pushAi("All set! Here's your trip. Shall I build it?");
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
  const proceedFromCollected = (quiet = false) => {
    bump((n) => n + 1);
    setReady(false);
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
      pushAi(legs.length > 1 ? `How many days in ${plainName(leg.destination)}?` : daysQuestion(leg.destination));
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
    askReady(quiet);
  };

  // Replaces the old destination as the one place `legs` gets set —
  // handles both a single match and a multi-stop match (2+ segments from
  // parseMultiDestinationMessage) through the same path, so every caller
  // (typed text, a disambiguation chip, a suggested-destination chip, the
  // photo flow) shares one implementation regardless of which one it is.
  // Changing the place from its trip chip keeps the days already chosen for a
  // one-place trip (so "Coorg" -> "Goa" doesn't ask for the days again).
  const previousSingleDays = (): number | null => {
    const { legs } = collected.current;
    return editing === "dest" && legs.length === 1 ? legs[0].days : null;
  };

  const setLegs = (matches: TripSegment[], origin: string | null = null, showAsUser = true) => {
    const keepDays = matches.length === 1 ? previousSingleDays() : null;
    collected.current.legs = matches.map((m) => ({ destination: m.destination, days: m.days ?? keepDays }));
    collected.current.activeLegIndex = 0;
    const routeLabel = matches.map((m) => plainName(m.destination)).join(" → ");
    if (showAsUser) pushUser(routeLabel);
    // "Coorg from Bangalore" — the start city goes into the same shared
    // origin store How to Reach and the plan itself already read.
    if (origin) useOriginStore.getState().setOriginCity(origin);
    // A one-place trip with no days yet needs no separate acknowledgement: the
    // days question that follows ("Coorg is lovely. How many days?") already is one.
    if (matches.length > 1) {
      pushAi(`Nice, a multi-stop trip: ${routeLabel}! 🧳`);
    } else if (matches[0].days) {
      pushAi(`Love it — ${matches[0].days} days in ${plainName(matches[0].destination)}!${origin ? ` Starting from ${origin}.` : ""} 🎒`);
    } else if (origin) {
      pushAi(`Starting from ${origin}.`);
    }
    setEditing(null);
    proceedFromCollected();
    scrollToEnd();
  };

  // Thin single-destination wrapper — kept so every existing chip
  // onPress (disambiguation candidates, suggested destinations, the
  // photo flow) that only ever deals with one place doesn't need to
  // build a TripSegment array itself.
  const selectDestination = (dest: Destination, daysAlreadyKnown: number | null, origin: string | null = null) =>
    setLegs([{ destination: dest, days: daysAlreadyKnown }], origin);

  // "Surprise me": one random popular place, then the usual days question.
  const surprise = () => {
    const d = surprisePick();
    pushUser("Surprise me");
    pushAi(`How about ${plainName(d)}, ${d.state.replace(/\s*\([^)]*\)/g, "").trim()}? ✨`);
    setLegs([{ destination: d, days: null }], null, false);
  };

  const selectDays = (n: number) => {
    const { legs, activeLegIndex } = collected.current;
    const leg = legs[activeLegIndex];
    leg.days = n;
    pushUser(`${n} day${n === 1 ? "" : "s"}${legs.length > 1 ? ` in ${plainName(leg.destination)}` : ""}`);
    setEditing(null);
    proceedFromCollected();
  };

  const selectTravelers = (n: number) => {
    collected.current.people = n;
    pushUser(peopleLong(n));
    setCountFor(null);
    setEditing(null);
    proceedFromCollected();
  };

  // A card answers on its own (Just me, 2 of us) or, for a family or a group, asks for the exact number next.
  const pickPeople = (o: PeopleOption) => {
    if (!o.ask) {
      selectTravelers(o.n);
      return;
    }
    pushUser(o.label);
    pushAi(o.ask.prompt);
    setCountFor(o);
    scrollToEnd();
  };

  // The stay type decides how the trip is priced and planned (budget stay, hotel, luxury stay).
  const selectStay = (o: StayOption) => {
    collected.current.style = o.style;
    collected.current.stayType = o.title;
    pushUser(o.title);
    setEditing(null);
    proceedFromCollected();
  };

  const confirmAndGenerate = () => {
    const { legs, people, style, interests } = collected.current;
    if (legs.length > 0 && legs.every((l): l is { destination: Destination; days: number } => l.days !== null) && people && style) {
      onReady(legs, people, style, interests);
    }
  };

  // "Build my trip". Guarded so a double tap can't start two plans.
  const building = useRef(false);
  const buildTrip = () => {
    if (building.current || sending) return;
    building.current = true;
    pushAi("Building it now! ✨");
    scrollToEnd();
    confirmAndGenerate();
  };

  // Tapping a filled trip chip re-opens just that question; everything else stays as it was.
  const startEdit = (facet: TripFacet) => {
    if (sending) return;
    setReady(false);
    setCountFor(null);
    const { legs } = collected.current;
    if (facet === "days" && legs.length > 1) {
      // Which stop "change the days" means is ambiguous, so ask each stop's days again.
      legs.forEach((l) => {
        l.days = null;
      });
      proceedFromCollected();
      scrollToEnd();
      return;
    }
    setEditing(facet);
    if (facet === "dest") {
      setPhase("destination");
      pushAi("Of course. Where to instead?");
    } else if (facet === "days") {
      collected.current.activeLegIndex = 0;
      setPhase("days");
      pushAi("No problem. How many days?");
    } else if (facet === "people") {
      setPhase("travelers");
      pushAi("No problem. How many people are travelling?");
    } else {
      setPhase("style");
      pushAi("No problem. What type of stay are you looking for?");
    }
    scrollToEnd();
  };

  const restart = () => {
    collected.current = {
      legs: preselectedDestination ? [{ destination: preselectedDestination, days: null }] : [],
      activeLegIndex: 0,
      people: null,
      style: null,
      stayType: null,
      interests: [],
    };
    building.current = false;
    setCountFor(null);
    setMessages([{ id: nextId(), sender: "ai", text: greeting() }]);
    setPhase(preselectedDestination ? "days" : "destination");
    setEditing(null);
    setReady(false);
    setInput("");
    bump((n) => n + 1);
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

    const travelerMatch = text.match(
      /\b(\d{1,2}|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\s*(people|travell?ers?|of us|pax)\b/i,
    );
    if (travelerMatch) {
      const n = wordToNumber(travelerMatch[1]);
      if (n && n >= 1 && n <= 20 && n !== collected.current.people) {
        collected.current.people = n;
        changes.push(`${n} traveller${n === 1 ? "" : "s"}`);
      }
    }

    const styleHit = styleKeywordMatch(text.toLowerCase());
    if (styleHit && styleHit.id !== collected.current.style) {
      collected.current.style = styleHit.id;
      collected.current.stayType = null;
      changes.push(STAY_GENERIC[styleHit.id].toLowerCase());
    }

    return changes;
  };

  const handleSend = async (presetText?: string) => {
    const text = (presetText ?? input).trim();
    if (!text || sending) return;
    setInput("");
    pushUser(text);
    scrollToEnd();

    const changes = applyCorrections(text);
    if (changes.length > 0) {
      pushAi(`Got it — updated to ${changes.join(", ")}.`);
      setEditing(null);
      proceedFromCollected(true);
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
        selectDestination(parsed.destination, parsed.days, parsed.origin);
        return;
      }
      // A recognized place outside India — checked, and returned, before
      // the fuzzy Indian-destination matcher even runs (see
      // matchNonIndiaPlace in parseTripMessage.ts), so this never lets a
      // short/coincidental match like "Dubai" -> "Dubdi Monastery" through
      // as if that's what was asked for. No destination suggestions here
      // by design — just the plain "we're India-only" fact, since offering
      // chips right after clearly naming a specific other country reads as
      // not having listened.
      if (parsed.nonIndiaPlace) {
        pushAi(
          "We're currently focused on destinations within India — happy to help you plan a trip anywhere in India though! Where in India would you like to go?",
        );
        scrollToEnd();
        return;
      }
      // Small talk or a question about Tia/the app itself, not an attempt
      // to name a place — steer back to travel instead of running it
      // through the Gemini fallback (which would only add latency to a
      // message that was never asking about a destination) or showing the
      // "we're India-focused" place-not-supported response, which would
      // read as a non-sequitur here.
      if (parsed.offTopic) {
        pushAi(
          "I'm Tia, your travel companion — I can only help with planning trips and exploring destinations in India for now! Try asking me something like:",
          [
            { label: "Plan a trip to Goa for 5 days", onPress: () => handleSend("Plan a trip to Goa for 5 days") },
            { label: "Show me hidden gems in Kerala", onPress: () => handleSend("Show me hidden gems in Kerala") },
            ...SUGGESTED_DESTINATIONS.slice(0, 2).map((d) => ({ label: d.name, onPress: () => selectDestination(d, null) })),
          ],
        );
        scrollToEnd();
        return;
      }
      if (parsed.candidates.length > 0) {
        pushAi(
          "A few places match that — which one did you mean?",
          parsed.candidates.map((d) => ({ label: `${d.name}, ${d.state}`, onPress: () => selectDestination(d, parsed.days, parsed.origin) })),
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
        const intent = await tryParseTripIntent(text, undefined, () =>
          setMessageText(THINKING_ID, "Waking up Tia — the first request of the day can take up to 30s… 🌅"),
        );
        removeMessage(THINKING_ID);
        setSending(false);

        if (intent?.destination) {
          if (intent.people) collected.current.people = intent.people;
          if (intent.style) {
            collected.current.style = intent.style;
            collected.current.stayType = null;
          }
          if (intent.interests.length > 0) collected.current.interests = [...new Set([...collected.current.interests, ...intent.interests])];
          collected.current.legs = [{ destination: intent.destination, days: intent.days ?? previousSingleDays() }];
          collected.current.activeLegIndex = 0;
          pushUser(plainName(intent.destination));
          pushAi(intent.reasoning || `Great choice — ${plainName(intent.destination)}, ${intent.destination.state}! ✨`);
          setEditing(null);
          proceedFromCollected();
          scrollToEnd();
          return;
        }

        // Gemini either explicitly declined to match anything or the call
        // itself failed (intent is null in that case). Whenever the AI
        // call actually succeeded (intent is non-null), trust its own
        // three-way signal fully rather than re-guessing locally — only
        // fall back to the local unmatchedPlaceAttempt heuristic when we
        // have no AI answer at all. The app's destination list is only a
        // growing catalog, not every real place in India, so "not in our
        // list", "recognized as a real Indian place but not in our list",
        // and "not in India" must never be treated as the same thing (see
        // buildIntentPrompt in journey-backend's planTrip.js).
        if (intent?.outsideIndia) {
          pushAi(
            "We're currently focused on India 🇮🇳 — we'll be excited to help once we go worldwide! Here are a few popular Indian destinations to start with, or tell me another place:",
            SUGGESTED_DESTINATIONS.map((d) => ({ label: d.name, onPress: () => selectDestination(d, null) })),
          );
        } else if (intent?.recognizedIndianPlace) {
          // AI positively recognized a real Indian place — just say
          // plainly that we don't have data on it rather than a vague
          // "maybe we haven't added it" hedge.
          pushAi(
            `I don't have information on ${intent.recognizedPlaceName || "that place"} yet, sorry! Meanwhile, here are some popular picks I do have:`,
            SUGGESTED_DESTINATIONS.map((d) => ({ label: d.name, onPress: () => selectDestination(d, null) })),
          );
        } else if (intent) {
          // AI ran but recognized no specific place at all (too vague/
          // generic) — don't guess at India vs. not, just ask for more.
          pushAi(
            intent.reasoning || "I couldn't tell what specific place you meant — could you name a city, town, or region? Meanwhile, here are some popular picks:",
            SUGGESTED_DESTINATIONS.map((d) => ({ label: d.name, onPress: () => selectDestination(d, null) })),
          );
        } else if (parsed.unmatchedPlaceAttempt) {
          // Gemini/Groq call itself failed (intent is null) — we genuinely
          // don't know anything about this place, so don't claim it's
          // unsupported or foreign either.
          pushAi(
            "I couldn't quite place that one — could you try a nearby bigger city, or the state name? Meanwhile, here are some popular picks:",
            SUGGESTED_DESTINATIONS.map((d) => ({ label: d.name, onPress: () => selectDestination(d, null) })),
          );
        } else {
          pushAi("Tell me a city or place in India you'd like to visit — e.g. \"Mysore\" or \"Kerala backwaters.\"");
        }
        scrollToEnd();
        return;
      }

      pushAi("Tell me a city or place in India you'd like to visit — e.g. \"Mysore\" or \"Kerala backwaters.\"");
      scrollToEnd();
      return;
    }

    if (phase === "days") {
      const n = extractDays(text) ?? wordToNumber(text);
      if (n && n >= 1 && n <= MAX_TRIP_DAYS) {
        selectDays(n);
      } else if (n && n > MAX_TRIP_DAYS) {
        pushAi(`Let's keep it to ${MAX_TRIP_DAYS} days or fewer for now.`);
      } else {
        pushAi("Just the number of days works — e.g. \"5\".");
      }
      scrollToEnd();
      return;
    }

    if (phase === "travelers") {
      const n = wordToNumber(text);
      if (n && n >= 1 && n <= 20) {
        selectTravelers(n);
      } else {
        pushAi("Just the number of travelers works — e.g. \"2\", or tap a card below.");
      }
      scrollToEnd();
      return;
    }

    // Style is card-driven; a stray typed message that wasn't recognized
    // as a correction above just gets a gentle nudge back to the cards
    // rather than being silently ignored. Once every answer is in, the
    // nudge points at the Build button and the trip chips instead.
    pushAi(ready ? "Tap Build my trip when you're ready, or tap a chip at the top to change something." : "Tap one of the options below to continue.");
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
    const intent = await tryParseTripIntent("", { base64: asset.base64, mimeType }, () =>
      setMessageText(THINKING_ID, "Waking up Tia — the first request of the day can take up to 30s… 🌅"),
    );
    removeMessage(THINKING_ID);
    setSending(false);

    if (intent?.destination) {
      if (intent.people) collected.current.people = intent.people;
      if (intent.style) {
            collected.current.style = intent.style;
            collected.current.stayType = null;
          }
      if (intent.interests.length > 0) collected.current.interests = [...new Set([...collected.current.interests, ...intent.interests])];
      collected.current.legs = [{ destination: intent.destination, days: intent.days ?? previousSingleDays() }];
      collected.current.activeLegIndex = 0;
      pushAi(intent.reasoning || `Great choice — ${plainName(intent.destination)}, ${intent.destination.state}! ✨`);
      setEditing(null);
      proceedFromCollected();
      scrollToEnd();
      return;
    }

    // Same three-way rule as the text path: a null destination does NOT
    // mean the photo shows somewhere outside India — the catalog is just a
    // growing subset of real Indian places. Only claim "outside India"
    // when Gemini itself flagged the photo as such (intent.outsideIndia);
    // if it positively recognized a real Indian place just missing from
    // the guide (intent.recognizedIndianPlace), say that plainly instead
    // of guessing at where the photo was taken.
    if (intent?.outsideIndia) {
      pushAi(
        "That looks like somewhere outside India 🌍 — we're currently focused on India, but we'll be excited to help once we go worldwide! Here are a few popular Indian destinations to start with, or tell me a place:",
        SUGGESTED_DESTINATIONS.map((d) => ({ label: d.name, onPress: () => selectDestination(d, null) })),
      );
    } else if (intent?.recognizedIndianPlace) {
      pushAi(
        `I don't have information on ${intent.recognizedPlaceName || "that place"} yet, sorry! Meanwhile, here are some popular picks I do have:`,
        SUGGESTED_DESTINATIONS.map((d) => ({ label: d.name, onPress: () => selectDestination(d, null) })),
      );
    } else {
      pushAi(
        intent?.reasoning || "I couldn't match that photo to a destination in our guide yet — try telling me the place by name, or pick one of these:",
        SUGGESTED_DESTINATIONS.map((d) => ({ label: d.name, onPress: () => selectDestination(d, null) })),
      );
    }
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

  // What each trip chip shows, and which question's cards are open under the chat.
  const { legs, people, style } = collected.current;
  const totalDays = legs.reduce((sum, l) => sum + (l.days ?? 0), 0);
  const allDays = legs.length > 0 && legs.every((l) => l.days !== null);
  const chipValues: Record<TripFacet, string | null> = {
    dest: legs.length > 0 ? legs.map((l) => plainName(l.destination)).join(" → ") : null,
    days: allDays ? `${totalDays} day${totalDays === 1 ? "" : "s"}` : null,
    people: people ? peopleLabel(people) : null,
    style: style ? collected.current.stayType ?? STAY_GENERIC[style] : null,
  };
  const openQuestion: TripFacet | "count" | "ready" | null =
    countFor ? "count" : editing ?? (ready ? "ready" : legs.length === 0 ? "dest" : !allDays ? "days" : !people ? "people" : !style ? "style" : null);
  // The three kinds of stay to choose from. A place with three stay types of its own shows them
  // (real names and prices); every other place, and any multi-stop trip, shows the app's typical
  // ranges for a hostel or guesthouse, a hotel, and a luxury stay, and says so.
  const nightly = (price: string) => (/night/i.test(price) ? price : `${price} a night`);
  const stayEmoji = ["🛏️", "🏨", "💎"];
  const ownStays = legs.length === 1 && legs[0].destination.accommodation.length >= 3 ? legs[0].destination.accommodation : null;
  const stayOptions: StayOption[] = STYLE_CONFIGS.map((sc, i) => {
    const own = ownStays?.[i];
    if (own) return { style: sc.id, emoji: stayEmoji[i], title: own.type, price: nightly(own.priceRange), detail: own.examples.slice(0, 3).join(" · ") };
    const [price, detail] = sc.stayDetail.split(/\.\s+/);
    return { style: sc.id, emoji: stayEmoji[i], title: sc.stay, price: nightly(price), detail: detail ?? "" };
  });
  const stayNote = ownStays
    ? `Prices are per room per night in ${plainName(legs[0].destination)}. Each one also sets what the rest of the trip costs.`
    : "Typical prices across India. I'll suggest real places in your plan.";
  // The same sum the plan itself uses (a day's cost × days × travellers, per stop), so the estimate here matches the plan.
  const estimate =
    people && style
      ? legs.reduce((sum, l) => {
          const tier = STYLE_CONFIGS.find((s) => s.id === style)!.budgetTier;
          const per = (l.destination.budgetBreakdown.find((b) => b.tier === tier) ?? l.destination.budgetBreakdown[1]).perDayPerPerson;
          return sum + per * (l.days ?? 0) * people;
        }, 0)
      : 0;

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
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surfaceAlt, alignItems: "center", justifyContent: "center" }}
          >
            <ArrowLeft color={c.textPrimary} size={20} />
          </Pressable>
        )}
        {/* Inside the tabs the floating profile pill sits over the header's right
            edge, so reserve room for it: the subtitle wraps instead of running underneath. */}
        <View style={{ flex: 1, paddingRight: tabBarHeight > 0 ? 84 : 0 }}>
          <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 18, color: c.textPrimary }}>Plan a trip with Tia</Text>
          <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17, color: c.textSecondary, marginTop: 1 }}>
            {preselectedDestination ? "A few quick questions and I'll plan it" : "Tell me where, or tap a place"}
          </Text>
        </View>
      </View>

      <TripChips values={chipValues} onEdit={startEdit} c={c} />

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

        {/* The open question's answers, as cards under Tia's message. Hidden while she is
            thinking, and while a message of her own chips (e.g. "which one did you mean?")
            is the thing to answer. */}
        {!sending && !showChips && openQuestion && (
          <View style={{ marginTop: 4 }}>
            {openQuestion === "dest" && <PopularCards places={POPULAR} onPick={(d) => selectDestination(d, null)} onSurprise={surprise} c={c} />}
            {openQuestion === "days" && (
              <CountStepper
                key={`days-${collected.current.activeLegIndex}-${editing ?? ""}`}
                initial={legs[collected.current.activeLegIndex]?.days ?? 3}
                unit={["day", "days"]}
                chips={DAY_OPTIONS}
                onConfirm={selectDays}
                c={c}
              />
            )}
            {openQuestion === "people" && <PeopleCards onPick={pickPeople} c={c} />}
            {openQuestion === "count" && countFor?.ask && (
              <CountStepper key={`count-${countFor.key}`} initial={countFor.ask.start} unit={["person", "people"]} chips={countFor.ask.chips} max={60} onConfirm={selectTravelers} c={c} />
            )}
            {openQuestion === "style" && <StayCards options={stayOptions} note={stayNote} onPick={selectStay} c={c} />}
            {openQuestion === "ready" && people && style && (
              <SummaryCard
                image={legs[0].destination.image}
                title={legs.length > 1 ? chipValues.dest ?? "" : placeAndState(legs[0].destination)}
                meta={`${totalDays} day${totalDays === 1 ? "" : "s"} · ${peopleLong(people)} · ${collected.current.stayType ?? STAY_GENERIC[style]}`}
                total={estimate}
                onBuild={buildTrip}
                onRestart={restart}
                c={c}
              />
            )}
          </View>
        )}
      </ScrollView>

      <View
        style={{
          flexDirection: "row", alignItems: "flex-end", gap: 10,
          paddingHorizontal: 16, paddingTop: 10, paddingBottom: ctaBottomInset,
          backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.borderSoft,
        }}
      >
        {/* Offered while trip basics are still being collected, on both entry
            points (the Plan Trip tab and a destination's own "Plan My Trip"),
            so the two screens look the same. A photo answers "where to?", so
            sending one while the days question is open just switches the trip
            to the place it shows. */}
        {(phase === "destination" || phase === "days") && (
          <Pressable
            onPress={pickImage}
            disabled={sending}
            accessibilityRole="button"
            accessibilityLabel="Add a photo of a place you like"
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
            onSubmitEditing={() => handleSend()}
            onFocus={scrollToEnd}
            multiline
            editable={!sending}
            onContentSizeChange={(e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) =>
              setInputHeight(Math.min(86, Math.max(20, e.nativeEvent.contentSize.height)))
            }
            placeholder="Type a place or idea…"
            accessibilityLabel="Message Tia"
            placeholderTextColor={c.textMuted}
            style={{
              fontFamily: "Poppins_400Regular", fontSize: 14, color: c.textPrimary,
              height: inputHeight, paddingVertical: 0,
            }}
          />
        </View>
        <Pressable
          onPress={() => handleSend()}
          disabled={!input.trim() || sending}
          accessibilityRole="button"
          accessibilityLabel="Send"
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
    </View>
  );
}
