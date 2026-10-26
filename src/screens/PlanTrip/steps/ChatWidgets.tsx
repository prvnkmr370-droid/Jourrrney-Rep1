/**
 * The pieces that sit inside Tia's chat on the Plan a Trip screen: the row of
 * trip chips under the header, and one tappable card set per question (popular
 * places, days, who's coming, trip style) plus the summary with "Build my trip".
 *
 * Source of truth: the "Cards inside the chat" first-screen redesign (preview in
 * docs/layout-preview/plan-trip-chat-options.html). Same questions as before, but
 * answers are photos and big buttons instead of small text chips, and what Tia
 * has understood collects in the editable chips at the top. The trip-style question
 * (Budget / Comfortable / Premium) is asked as "what type of stay", with the stay
 * types themselves as the cards; how many people is asked as a number, with a
 * follow-up for the exact count when it is a family or a group. Typing still works
 * for every question (ChatStep parses it); these are shortcuts.
 *
 * Accessibility rules used across the redesign: every tap target is at least
 * 44pt, text is at least 12pt, wrapped layouts survive 130% text, nothing relies
 * on colour alone, and every button has a plain-words label.
 */
import { useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Check, Pencil, Minus, Plus, Sparkles, User, Users } from "lucide-react-native";
import DestImage from "@/components/DestImage";
import { withOpacity } from "@/components/withOpacity";
import type { Destination } from "@/data/destinations";
import type { useThemeColors } from "@/theme/useThemeColors";
import type { TravelStyle } from "../data";

type Colors = ReturnType<typeof useThemeColors>;

export type TripFacet = "dest" | "days" | "people" | "style";

/** The common day counts are one tap; the stepper and typing cover the rest. */
export const DAY_OPTIONS = [2, 3, 4, 5, 7];
const MAX_STEPPER_DAYS = 30;

/**
 * Who is travelling. Just me and 2 of us are one tap. A family or a group asks "how many
 * in total?" next, starting from a sensible number with the usual sizes one tap away.
 * Any other number can still be typed.
 */
export interface PeopleOption {
  key: "solo" | "two" | "family" | "group";
  label: string;
  /** The count if the option answers on its own. */
  n: number;
  /** For family / group: the follow-up question, a starting count and its quick sizes. */
  ask?: { prompt: string; start: number; chips: number[] };
  Icon: typeof User;
}

export const PEOPLE_OPTIONS: PeopleOption[] = [
  { key: "solo", label: "Just me", n: 1, Icon: User },
  { key: "two", label: "2 of us", n: 2, Icon: Users },
  { key: "family", label: "Family", n: 4, Icon: Users, ask: { prompt: "How many of you are in the family, in all?", start: 4, chips: [3, 4, 5, 6] } },
  { key: "group", label: "A group", n: 8, Icon: Users, ask: { prompt: "How many of you are in the group, in all?", start: 8, chips: [6, 8, 10, 12] } },
];

export const peopleLabel = (n: number) => (n === 1 ? "Just me" : n === 2 ? "2 of us" : `${n} people`);
export const peopleLong = (n: number) => (n === 1 ? "Just me" : `${n} travellers`);

/** What a stay type is called when the traveller typed it ("a hostel", "a resort") or the place has no stay types of its own. */
export const STAY_GENERIC: Record<TravelStyle, string> = { backpacker: "Budget stay", comfortable: "Hotel", premium: "Luxury stay" };

const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const plainName = (d: Destination) => d.name.replace(/\s*\([^)]*\)/g, "").trim();
const plainState = (d: Destination) => d.state.replace(/\s*\([^)]*\)/g, "").trim();

/** What Tia has understood so far, as four chips. A chosen one shows the answer and a pencil: tap to change it. */
export function TripChips({ values, onEdit, c }: { values: Record<TripFacet, string | null>; onEdit: (k: TripFacet) => void; c: Colors }) {
  const items: { k: TripFacet; empty: string; word: string }[] = [
    { k: "dest", empty: "Where?", word: "Place" },
    { k: "days", empty: "Days?", word: "Days" },
    { k: "people", empty: "Who?", word: "Travellers" },
    { k: "style", empty: "Stay?", word: "Type of stay" },
  ];
  return (
    <View
      style={{
        flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: 16, paddingVertical: 8,
        backgroundColor: c.surface, borderBottomWidth: 1, borderBottomColor: c.borderSoft,
      }}
    >
      {items.map(({ k, empty, word }) => {
        const value = values[k];
        const chosen = value !== null;
        return (
          <Pressable
            key={k}
            disabled={!chosen}
            onPress={() => onEdit(k)}
            accessibilityRole="button"
            accessibilityLabel={chosen ? `${word}: ${value}. Tap to change` : `${word}: not chosen yet`}
            android_ripple={chosen ? { color: withOpacity(c.gold, 0.2), borderless: false } : undefined}
            style={{
              minHeight: 44, maxWidth: "100%", paddingHorizontal: 14, borderRadius: 22,
              flexDirection: "row", alignItems: "center", gap: 6,
              borderWidth: 1.5, borderStyle: chosen ? "solid" : "dashed", borderColor: chosen ? c.gold : c.border,
              backgroundColor: chosen ? withOpacity(c.gold, 0.16) : "transparent",
            }}
          >
            {chosen && <Check color={c.gold} size={15} />}
            <Text
              numberOfLines={1}
              maxFontSizeMultiplier={1.3}
              style={{ flexShrink: 1, fontFamily: chosen ? "Poppins_700Bold" : "Poppins_600SemiBold", fontSize: 13, color: chosen ? c.textPrimary : c.textMuted }}
            >
              {chosen ? value : empty}
            </Text>
            {chosen && <Pencil color={c.textSecondary} size={13} />}
          </Pressable>
        );
      })}
    </View>
  );
}

/** "Popular right now": photo cards to tap, plus Surprise me. */
export function PopularCards({ places, onPick, onSurprise, c }: { places: Destination[]; onPick: (d: Destination) => void; onSurprise: () => void; c: Colors }) {
  return (
    <View style={{ gap: 8 }}>
      <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12.5, color: c.textSecondary, paddingHorizontal: 4 }}>
        Popular right now
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 2 }} keyboardShouldPersistTaps="handled">
        {places.map((d) => (
          <Pressable
            key={d.id}
            onPress={() => onPick(d)}
            accessibilityRole="button"
            accessibilityLabel={`${plainName(d)}, ${plainState(d)}. ${d.duration}`}
            style={{ width: 150, height: 160, borderRadius: 16, overflow: "hidden", backgroundColor: c.surfaceAlt, borderWidth: 1, borderColor: c.borderSoft }}
          >
            <DestImage source={{ uri: d.image }} contentFit="cover" style={StyleSheet.absoluteFill} />
            <LinearGradient colors={["rgba(8,12,24,0)", "rgba(8,12,24,0.9)"]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 10, paddingTop: 28, paddingBottom: 8 }}>
              <Text numberOfLines={1} maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: "#FFFFFF" }}>
                {plainName(d)}
              </Text>
              <Text numberOfLines={2} maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 16, color: "rgba(255,255,255,0.88)" }}>
                {plainState(d)} · {d.duration}
              </Text>
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>
      <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <Pressable
          onPress={onSurprise}
          accessibilityRole="button"
          accessibilityLabel="Surprise me with a place"
          style={{ minHeight: 44, paddingHorizontal: 16, borderRadius: 22, flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1.5, borderColor: c.border, backgroundColor: c.surface }}
        >
          <Sparkles color={c.gold} size={16} />
          <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.textPrimary }}>Surprise me</Text>
        </Pressable>
      </View>
      <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17, color: c.textMuted, paddingHorizontal: 4 }}>
        Or type a place, or a trip like “Mysore then Coorg”.
      </Text>
    </View>
  );
}

/** Big − and + with the number between; the usual counts are one tap below. Used for days and for how many people. */
export function CountStepper({
  initial, unit, chips, max = MAX_STEPPER_DAYS, onConfirm, c,
}: { initial: number; unit: [string, string]; chips: number[]; max?: number; onConfirm: (n: number) => void; c: Colors }) {
  const [n, setN] = useState(initial);
  const word = (v: number) => (v === 1 ? unit[0] : unit[1]);
  const round = (label: string, delta: number, Icon: typeof Plus) => (
    <Pressable
      onPress={() => setN((v) => Math.max(1, Math.min(max, v + delta)))}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{ width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: c.border }}
    >
      <Icon color={c.gold} size={24} />
    </Pressable>
  );
  return (
    <View style={{ gap: 10 }}>
      <View
        accessible
        accessibilityLabel={`${n} ${word(n)}`}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 18, padding: 12, borderRadius: 18, backgroundColor: c.surface, borderWidth: 1, borderColor: c.borderSoft }}
      >
        {round(`One ${unit[0]} fewer`, -1, Minus)}
        <View style={{ minWidth: 96, alignItems: "center" }}>
          <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 34, lineHeight: 40, color: c.textPrimary }}>{n}</Text>
          <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_400Regular", fontSize: 14, color: c.textSecondary }}>{word(n)}</Text>
        </View>
        {round(`One ${unit[0]} more`, 1, Plus)}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {chips.map((d) => (
          <Pressable
            key={d}
            onPress={() => onConfirm(d)}
            accessibilityRole="button"
            accessibilityLabel={`${d} ${word(d)}`}
            style={{ minHeight: 44, paddingHorizontal: 16, borderRadius: 22, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: n === d ? c.gold : c.borderSoft, backgroundColor: n === d ? withOpacity(c.gold, 0.16) : c.surface }}
          >
            <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.textPrimary }}>{d} {word(d)}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        onPress={() => onConfirm(n)}
        accessibilityRole="button"
        accessibilityLabel={`Continue with ${n} ${word(n)}`}
        style={{ minHeight: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: c.gold, paddingHorizontal: 16 }}
      >
        <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: "#0E1424" }}>Continue with {n} {word(n)}</Text>
      </Pressable>
    </View>
  );
}

/** Who is travelling, as four cards two across. A family or a group asks for the exact number next. */
export function PeopleCards({ onPick, c }: { onPick: (o: PeopleOption) => void; c: Colors }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {PEOPLE_OPTIONS.map((o) => (
        <Pressable
          key={o.key}
          onPress={() => onPick(o)}
          accessibilityRole="button"
          accessibilityLabel={o.ask ? `${o.label}. I will ask how many` : o.label}
          style={{ flexBasis: "47%", flexGrow: 1, minHeight: 76, borderRadius: 16, padding: 8, alignItems: "center", justifyContent: "center", gap: 4, backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.borderSoft }}
        >
          <o.Icon color={c.gold} size={22} />
          <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 15, lineHeight: 20, textAlign: "center", color: c.textPrimary }}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** One kind of stay to choose from: what it is, what a night costs, and a few real names. */
export interface StayOption {
  style: TravelStyle;
  emoji: string;
  title: string;
  price: string;
  detail: string;
}

/** The kinds of stay as cards. Each one also sets how the trip is priced and planned. */
export function StayCards({ options, note, onPick, c }: { options: StayOption[]; note: string; onPick: (o: StayOption) => void; c: Colors }) {
  return (
    <View style={{ gap: 10 }}>
      {options.map((o) => (
        <Pressable
          key={o.style}
          onPress={() => onPick(o)}
          accessibilityRole="button"
          accessibilityLabel={`${o.title}. ${o.price}. ${o.detail}`}
          style={{ minHeight: 84, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.borderSoft }}
        >
          <Text style={{ fontSize: 28, width: 40, textAlign: "center" }}>{o.emoji}</Text>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 15.5, lineHeight: 21, color: c.textPrimary }}>{o.title}</Text>
            <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 13.5, lineHeight: 19, color: c.gold }}>{o.price}</Text>
            {o.detail ? (
              <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_400Regular", fontSize: 12.5, lineHeight: 18, color: c.textSecondary }}>{o.detail}</Text>
            ) : null}
          </View>
        </Pressable>
      ))}
      <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_400Regular", fontSize: 12.5, lineHeight: 18, color: c.textSecondary, paddingHorizontal: 4 }}>
        {note}
      </Text>
    </View>
  );
}

/** Everything Tia understood, with the photo, an honest estimate, and the Build button. */
export function SummaryCard({
  image, title, meta, total, onBuild, onRestart, c,
}: { image: string; title: string; meta: string; total: number; onBuild: () => void; onRestart: () => void; c: Colors }) {
  return (
    <View style={{ gap: 8 }}>
      <View style={{ borderRadius: 18, overflow: "hidden", backgroundColor: c.surface, borderWidth: 1, borderColor: c.borderSoft }}>
        <DestImage source={{ uri: image }} contentFit="cover" style={{ width: "100%", height: 140 }} />
        <View style={{ padding: 14, gap: 2 }}>
          <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 18, lineHeight: 24, color: c.textPrimary }}>{title}</Text>
          <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_400Regular", fontSize: 13.5, lineHeight: 20, color: c.textSecondary }}>{meta}</Text>
          <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 21, color: c.textPrimary, marginTop: 4 }}>
            About <Text style={{ fontFamily: "Poppins_700Bold", color: c.gold }}>{rupees(total)}</Text> in all <Text style={{ color: c.textSecondary }}>(estimate)</Text>
          </Text>
        </View>
      </View>
      <Pressable
        onPress={onBuild}
        accessibilityRole="button"
        accessibilityLabel="Build my trip"
        style={{ minHeight: 54, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: c.gold, paddingHorizontal: 16 }}
      >
        <Sparkles color="#0E1424" size={20} />
        <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 16, color: "#0E1424" }}>Build my trip</Text>
      </Pressable>
      <Pressable onPress={onRestart} accessibilityRole="button" accessibilityLabel="Start again" style={{ minHeight: 48, alignItems: "center", justifyContent: "center" }}>
        <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 14, color: c.textSecondary }}>Start again</Text>
      </Pressable>
    </View>
  );
}
