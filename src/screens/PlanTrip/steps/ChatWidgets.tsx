/**
 * The pieces that sit inside Tia's chat on the Plan a Trip screen: the row of
 * trip chips under the header, and one tappable card set per question (popular
 * places, days, who's coming, trip style) plus the summary with "Build my trip".
 *
 * Source of truth: the "Cards inside the chat" first-screen redesign (preview in
 * docs/layout-preview/plan-trip-chat-options.html). Same questions as before, but
 * answers are photos and big buttons instead of small text chips, and what Tia
 * has understood collects in the editable chips at the top. Typing still works
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
import { STYLE_CONFIGS, type TravelStyle } from "../data";

type Colors = ReturnType<typeof useThemeColors>;

export type TripFacet = "dest" | "days" | "people" | "style";

/** The common day counts are one tap; the stepper and typing cover the rest. */
export const DAY_OPTIONS = [2, 3, 4, 5, 7];
const MAX_STEPPER_DAYS = 30;

/** The common group sizes, in the words people use. Any other number can still be typed. */
export const PEOPLE_OPTIONS = [
  { n: 1, label: "Just me", long: "Just me", Icon: User },
  { n: 2, label: "2 of us", long: "2 travellers", Icon: Users },
  { n: 4, label: "Family of 4", long: "4 travellers", Icon: Users },
  { n: 6, label: "A group of 6", long: "6 travellers", Icon: Users },
];

export const peopleLabel = (n: number) => PEOPLE_OPTIONS.find((p) => p.n === n)?.label ?? `${n} people`;
export const peopleLong = (n: number) => PEOPLE_OPTIONS.find((p) => p.n === n)?.long ?? `${n} travellers`;

export const STYLE_SHORT: Record<TravelStyle, string> = { backpacker: "Budget", comfortable: "Comfort", premium: "Premium" };

const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const plainName = (d: Destination) => d.name.replace(/\s*\([^)]*\)/g, "").trim();
const plainState = (d: Destination) => d.state.replace(/\s*\([^)]*\)/g, "").trim();

/** What Tia has understood so far, as four chips. A chosen one shows the answer and a pencil: tap to change it. */
export function TripChips({ values, onEdit, c }: { values: Record<TripFacet, string | null>; onEdit: (k: TripFacet) => void; c: Colors }) {
  const items: { k: TripFacet; empty: string; word: string }[] = [
    { k: "dest", empty: "Where?", word: "Place" },
    { k: "days", empty: "Days?", word: "Days" },
    { k: "people", empty: "Who?", word: "Travellers" },
    { k: "style", empty: "Style?", word: "Trip style" },
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

/** Big − and + with the number between; the usual day counts are one tap below. */
export function DaysStepper({ initial, onConfirm, c }: { initial: number; onConfirm: (n: number) => void; c: Colors }) {
  const [n, setN] = useState(initial);
  const round = (label: string, delta: number, Icon: typeof Plus) => (
    <Pressable
      onPress={() => setN((v) => Math.max(1, Math.min(MAX_STEPPER_DAYS, v + delta)))}
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
        accessibilityLabel={`${n} ${n === 1 ? "day" : "days"}`}
        style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 18, padding: 12, borderRadius: 18, backgroundColor: c.surface, borderWidth: 1, borderColor: c.borderSoft }}
      >
        {round("One day fewer", -1, Minus)}
        <View style={{ minWidth: 96, alignItems: "center" }}>
          <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 34, lineHeight: 40, color: c.textPrimary }}>{n}</Text>
          <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_400Regular", fontSize: 14, color: c.textSecondary }}>{n === 1 ? "day" : "days"}</Text>
        </View>
        {round("One day more", 1, Plus)}
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {DAY_OPTIONS.map((d) => (
          <Pressable
            key={d}
            onPress={() => onConfirm(d)}
            accessibilityRole="button"
            accessibilityLabel={`${d} days`}
            style={{ minHeight: 44, paddingHorizontal: 16, borderRadius: 22, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: n === d ? c.gold : c.borderSoft, backgroundColor: n === d ? withOpacity(c.gold, 0.16) : c.surface }}
          >
            <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.textPrimary }}>{d} days</Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        onPress={() => onConfirm(n)}
        accessibilityRole="button"
        accessibilityLabel={`Continue with ${n} ${n === 1 ? "day" : "days"}`}
        style={{ minHeight: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: c.gold, paddingHorizontal: 16 }}
      >
        <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: "#0E1424" }}>Continue with {n} {n === 1 ? "day" : "days"}</Text>
      </Pressable>
    </View>
  );
}

/** Four group sizes as cards, two across. */
export function PeopleCards({ onPick, c }: { onPick: (n: number) => void; c: Colors }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
      {PEOPLE_OPTIONS.map(({ n, label, Icon }) => (
        <Pressable
          key={n}
          onPress={() => onPick(n)}
          accessibilityRole="button"
          accessibilityLabel={label}
          style={{ flexBasis: "47%", flexGrow: 1, minHeight: 76, borderRadius: 16, padding: 8, alignItems: "center", justifyContent: "center", gap: 4, backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.borderSoft }}
        >
          <Icon color={c.gold} size={22} />
          <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 15, lineHeight: 20, textAlign: "center", color: c.textPrimary }}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** The three ways to travel, each with what it costs a day for this place. */
export function StyleCards({ perDay, onPick, placeName, c }: { perDay: (id: TravelStyle) => number; onPick: (id: TravelStyle) => void; placeName: string; c: Colors }) {
  return (
    <View style={{ gap: 10 }}>
      {STYLE_CONFIGS.map((sc) => (
        <Pressable
          key={sc.id}
          onPress={() => onPick(sc.id)}
          accessibilityRole="button"
          accessibilityLabel={`${sc.label}. ${sc.subtitle}. About ${rupees(perDay(sc.id))} a day for each person`}
          style={{ minHeight: 84, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.surface, borderWidth: 1.5, borderColor: c.borderSoft }}
        >
          <Text style={{ fontSize: 28, width: 40, textAlign: "center" }}>{sc.emoji}</Text>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 15.5, lineHeight: 21, color: c.textPrimary }}>{sc.label}</Text>
            <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_400Regular", fontSize: 12.5, lineHeight: 18, color: c.textSecondary }}>{sc.subtitle}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.gold }}>{rupees(perDay(sc.id))}</Text>
            <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary }}>a day each</Text>
          </View>
        </Pressable>
      ))}
      <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_400Regular", fontSize: 12.5, lineHeight: 18, color: c.textSecondary, paddingHorizontal: 4 }}>
        Costs are typical for {placeName}, per person. An estimate, not a quote.
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
