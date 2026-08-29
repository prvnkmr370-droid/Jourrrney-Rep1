/**
 * Source of truth: user-provided screenshot of the target "Plan My Trip"
 * chat screen (a conversational blank-screen AI input, replacing the old
 * multi-section form entirely — see FormStep's removal in this same
 * change). Jourr, the app's AI travel companion, asks a short sequence of
 * questions — destination, days, travelers, trip style — parsing free-text
 * replies where it can (parseTripMessage.ts) and falling back to quick-
 * reply chips for anything enumerable, before handing off to the existing
 * generating/result flow.
 */
import { useMemo, useRef, useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput, type NativeSyntheticEvent, type TextInputContentSizeChangeEventData } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, Send } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { useThemeColors } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";
import { STYLE_CONFIGS, type TravelStyle } from "../data";
import { parseTripMessage, extractDays, SUGGESTED_DESTINATIONS } from "../parseTripMessage";

interface Chip {
  label: string;
  onPress: () => void;
}

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  chips?: Chip[];
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

export default function ChatStep({ onBack, originCity, preselectedDestination, onReady, tabBarHeight = 0 }: Props) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const ctaBottomInset = tabBarHeight > 0 ? tabBarHeight + 12 : Math.max(insets.bottom, 16);

  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    preselectedDestination
      ? [
          {
            id: nextId(),
            sender: "ai",
            text: `Hey! I'm Jourr, your AI travel companion. 🧭\nLet's plan your trip to ${preselectedDestination.name}, ${preselectedDestination.state}! How many days are you planning for?`,
          },
        ]
      : [
          {
            id: nextId(),
            sender: "ai",
            text: originCity
              ? `Hey! I'm Jourr, your AI travel companion. 🧭\nI'll plan your perfect trip from ${originCity}. Where are you dreaming of going?`
              : `Hey! I'm Jourr, your AI travel companion. 🧭\nWhere are you dreaming of going? (Anywhere in India for now — tell me your starting city too if you like.)`,
          },
        ],
  );
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>(preselectedDestination ? "days" : "destination");
  const [inputHeight, setInputHeight] = useState(20);
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
  const pushUser = (text: string) => setMessages((prev) => [...prev, { id: nextId(), sender: "user", text }]);

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

  const selectDestination = (dest: Destination, daysAlreadyKnown: number | null) => {
    collected.current.destination = dest;
    pushUser(dest.name);
    if (daysAlreadyKnown) {
      collected.current.days = daysAlreadyKnown;
      pushAi(`Love it — ${daysAlreadyKnown} days in ${dest.name}! 🎒`);
      askTravelers();
    } else {
      setPhase("days");
      pushAi(`Great choice — ${dest.name}, ${dest.state}! ✨ How many days are you planning for?`);
    }
    scrollToEnd();
  };

  const selectDays = (n: number) => {
    collected.current.days = n;
    pushUser(`${n} day${n === 1 ? "" : "s"}`);
    pushAi(`Got it, ${n} day${n === 1 ? "" : "s"}.`);
    askTravelers();
  };

  const selectTravelers = (n: number) => {
    collected.current.people = n;
    pushUser(n === 4 ? "4+" : String(n));
    askStyle();
  };

  const selectStyle = (style: TravelStyle) => {
    collected.current.style = style;
    const sc = STYLE_CONFIGS.find((s) => s.id === style)!;
    pushUser(sc.label);
    const { destination, days, people } = collected.current;
    if (destination && days && people) askConfirm(destination, days, people, style);
  };

  const confirmAndGenerate = () => {
    const { destination, days, people, style, interests } = collected.current;
    if (destination && days && people && style) onReady(destination, days, people, style, interests);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    pushUser(text);
    scrollToEnd();

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
      if (parsed.unmatchedPlaceAttempt) {
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

    // Travelers/style/confirm are chip-driven; a stray typed message there
    // just gets a gentle nudge back to the chips above rather than being
    // silently ignored.
    pushAi("Tap one of the options above to continue — or the button once you're ready.");
    scrollToEnd();
  };

  const showChips = useMemo(() => messages[messages.length - 1]?.sender === "ai" && !!messages[messages.length - 1]?.chips, [messages]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
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
        contentContainerStyle={{ padding: 16, paddingBottom: 20, gap: 12 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
            multiline
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
          disabled={!input.trim()}
          style={{
            width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center",
            backgroundColor: input.trim() ? "#333C81" : c.surfaceAlt,
          }}
        >
          <Send color={input.trim() ? "#FFFFFF" : c.textMuted} size={18} />
        </Pressable>
      </View>
    </View>
  );
}

function MessageBubble({ message, c, isLastChips }: { message: ChatMessage; c: ReturnType<typeof useThemeColors>; isLastChips: boolean }) {
  const isAi = message.sender === "ai";
  return (
    <View style={{ flexDirection: "row", justifyContent: isAi ? "flex-start" : "flex-end", gap: 8 }}>
      {isAi && (
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#333C81", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: "#FFFFFF" }}>J</Text>
        </View>
      )}
      <View style={{ maxWidth: "78%", gap: 8 }}>
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
