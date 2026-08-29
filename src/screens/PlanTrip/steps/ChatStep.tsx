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
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert, type NativeSyntheticEvent, type TextInputContentSizeChangeEventData } from "react-native";
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
import { STYLE_CONFIGS, type TravelStyle } from "../data";
import { parseTripMessage, extractDays, SUGGESTED_DESTINATIONS } from "../parseTripMessage";
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

interface Props {
  onBack?: () => void;
  originCity: string;
  /** Set when arriving via a specific destination's own "Plan My Trip"
   * button (see app/plan/[destId].tsx) — skips the "where are you
   * dreaming of going" question entirely and opens straight on the days
   * question, since the destination is already known. */
  preselectedDestination?: Destination | null;
  onReady: (destination: Destination, days: number, people: number, style: TravelStyle, interests: string[]) => void;
  tabBarHeight?: number;
}

let idCounter = 0;
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
  // +20 beyond the tab bar's own height/inset — per feedback, the input
  // bar sat too close to the floating tab bar underneath it.
  const ctaBottomInset = (tabBarHeight > 0 ? tabBarHeight + 12 : Math.max(insets.bottom, 16)) + 20;

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
              ? `Hey! I'm Tia, your AI travel companion. 🧭\nI'll plan your perfect trip from ${originCity}. Where are you dreaming of going?`
              : `Hey! I'm Tia, your AI travel companion. 🧭\nWhere are you dreaming of going? (Anywhere in India for now — tell me your starting city too if you like.)`,
          },
        ],
  );
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>(preselectedDestination ? "days" : "destination");
  const [inputHeight, setInputHeight] = useState(20);
  const [sending, setSending] = useState(false);
  const collected = useRef<{ destination: Destination | null; days: number | null; people: number | null; style: TravelStyle | null; interests: string[] }>({
    destination: preselectedDestination ?? null,
    days: null,
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

  const askConfirm = (dest: Destination, days: number, people: number, style: TravelStyle) => {
    setPhase("confirm");
    const sc = STYLE_CONFIGS.find((s) => s.id === style)!;
    const fromClause = originCity ? ` from ${originCity}` : "";
    pushAi(
      `Here's the plan: a ${days}-day ${sc.label.toLowerCase()} trip to ${dest.name}${fromClause} for ${people} traveller${people === 1 ? "" : "s"}. Ready?`,
      [{ label: "✨ Plan My Trip", onPress: confirmAndGenerate }],
    );
    scrollToEnd();
  };

  // Single source of truth for "what do we still need to ask" — every
  // path that updates collected.current (a fresh answer OR a mid-chat
  // correction) calls this afterward rather than deciding the next step
  // itself, so corrections can jump straight back to confirmation once
  // every field is filled, from wherever in the conversation they happen.
  const proceedFromCollected = () => {
    const { destination, days, people, style } = collected.current;
    if (!destination) {
      setPhase("destination");
      return;
    }
    if (!days) {
      setPhase("days");
      pushAi(`How many days are you planning for ${destination.name}?`);
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
    askConfirm(destination, days, people, style);
  };

  const selectDestination = (dest: Destination, daysAlreadyKnown: number | null) => {
    collected.current.destination = dest;
    pushUser(dest.name);
    if (daysAlreadyKnown) collected.current.days = daysAlreadyKnown;
    pushAi(
      daysAlreadyKnown
        ? `Love it — ${daysAlreadyKnown} days in ${dest.name}! 🎒`
        : `Great choice — ${dest.name}, ${dest.state}! ✨`,
    );
    proceedFromCollected();
    scrollToEnd();
  };

  const selectDays = (n: number) => {
    collected.current.days = n;
    pushUser(`${n} day${n === 1 ? "" : "s"}`);
    pushAi(`Got it, ${n} day${n === 1 ? "" : "s"}.`);
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
    const { destination, days, people, style, interests } = collected.current;
    if (destination && days && people && style) onReady(destination, days, people, style, interests);
  };

  // Mid-chat corrections — only checked once a destination is already
  // locked in (so it never fires on the very first message, which the
  // normal destination-parsing branch below already owns) and only past
  // the destination-asking phase (so a normal reply to "where are you
  // dreaming of going?" isn't misread as a "correction" to itself).
  // Recognizes a new destination name, a day count, a traveler count
  // ("4 people", "3 travellers"), or a style keyword anywhere in a
  // message, regardless of which question is currently being asked.
  const applyCorrections = (text: string): string[] => {
    if (!collected.current.destination || phase === "destination") return [];
    const changes: string[] = [];

    const reparsed = parseTripMessage(text);
    if (reparsed.destination && reparsed.destination.id !== collected.current.destination.id) {
      collected.current.destination = reparsed.destination;
      changes.push(`destination to ${reparsed.destination.name}`);
    }
    if (reparsed.days && reparsed.days !== collected.current.days) {
      collected.current.days = reparsed.days;
      changes.push(`${reparsed.days} day${reparsed.days === 1 ? "" : "s"}`);
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
          if (intent.days) collected.current.days = intent.days;
          if (intent.people) collected.current.people = intent.people;
          if (intent.style) collected.current.style = intent.style;
          if (intent.interests.length > 0) collected.current.interests = [...new Set([...collected.current.interests, ...intent.interests])];
          collected.current.destination = intent.destination;
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
      if (intent.days) collected.current.days = intent.days;
      if (intent.people) collected.current.people = intent.people;
      if (intent.style) collected.current.style = intent.style;
      if (intent.interests.length > 0) collected.current.interests = [...new Set([...collected.current.interests, ...intent.interests])];
      collected.current.destination = intent.destination;
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
    // behavior is iOS-only ("padding") deliberately — this app's Android
    // build already uses the default windowSoftInputMode ("adjustResize"),
    // meaning Android itself already shrinks the screen for the keyboard.
    // Also applying KeyboardAvoidingView's "height" behavior on top of
    // that double-compensated: the screen shrank once for the OS resize,
    // then shrank *again* for KeyboardAvoidingView, leaving a gap of
    // unfilled space at the bottom that exposed the default white scene
    // background underneath — the exact "white patch that appears the
    // moment I tap the input" bug. `behavior={undefined}` on Android
    // means KeyboardAvoidingView still renders as a plain flex:1 View
    // (so the styling here is unaffected) but doesn't add its own
    // adjustment on top of what Android is already doing correctly.
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
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
