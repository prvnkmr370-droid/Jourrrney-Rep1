/**
 * The three blocks under the destination photo:
 *
 *  - QuickFacts   the live Open now / Closed now line with the closing or opening time and the
 *                 usual hours (rows when the phone's text is large), then a one-line note with the
 *                 best months to visit
 *  - AddressRow   the place's address in words, with a small Map button beside it
 *  - ActionRow    Directions, a compact button (Save and Share are on the photo)
 *  - ExploreRows  "What would you like to do?": three big rows (hotels,
 *                 there, what to know before I go, is it safe), each with a live one-line
 *                 preview taken from that place's own data. Planning is not a row: the
 *                 "Plan my trip with AI" bar at the bottom goes straight to the AI planner.
 *
 * For now the rows open the same content the tabs show, in place (the tab strip
 * is still there); later steps turn each row into its own page.
 * Sizes follow the accessibility rules for this redesign: buttons at least
 * 48pt tall, nothing needed to decide below 12pt, and text that wraps (up to
 * 130% font scale) instead of being cut off.
 */
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { Backpack, BedDouble, Bell, Calendar, CalendarClock, ChevronRight, Clock, MapPin, Navigation, ShieldCheck } from "lucide-react-native";
import type { Destination } from "@/data/destinations";
import { useThemeColors } from "@/theme/useThemeColors";
import { withOpacity } from "@/components/withOpacity";
import { bestTimeMonths, fromPrice, openStatus, type OpenStatus } from "@/utils/destinationFacts";
import { hotelsFor } from "@/utils/stayHotels";
import { headsUpCount, safetyTeaser } from "@/utils/safetyTone";
import { useNow } from "@/hooks/useNow";

export type HubTarget = "stay" | "reach" | "know" | "safety";

const MAX_FONT = 1.3;

/** Phone text size (Android "Large" is 1.15x) from which the quick facts stack into rows. */
const LARGE_TEXT_SCALE = 1.15;

/** "Opens 9:00 AM" may wrap, but never between "9:00" and "AM". */
const keepTimesTogether = (s: string) => s.replace(/(\d) (AM|PM)\b/gi, "$1\u00A0$2");

/** The dot beside the status: green open, amber closing soon, red closed. The words say the same thing, so colour is never the only cue. */
function statusDotColor(status: OpenStatus, c: ReturnType<typeof useThemeColors>): string | null {
  if (status.kind === "text") return null;
  if (status.kind === "closed") return c.danger;
  return status.soon ? c.warning : c.success;
}

export function QuickFacts({ destination: d }: { destination: Destination }) {
  const c = useThemeColors();
  const { fontScale } = useWindowDimensions();
  // Re-worked every minute, so "Open now" turns into "Closed now" at closing time
  // even if the page is left open.
  const now = useNow();
  const status = openStatus(d.visitingHours, now);
  const bestTime = bestTimeMonths(d.bestSeason);
  const dot = status ? statusDotColor(status, c) : null;

  if (!status && !bestTime) return null;

  // One sentence for a screen reader: "Open now, Closes 6:30 PM. Usual hours 9:00 AM to 6:30 PM. Closed Mondays."
  const hoursA11y = status
    ? [`${status.label}, ${status.detail}`, status.usual ? `Usual hours ${status.usual.replace(" – ", " to ")}` : "", status.days ?? ""].filter(Boolean).join(". ") + "."
    : "";

  // From "Large" text (about 1.15x) on, the status becomes full-width rows,
  // label on the left and value on the right, so a long value wraps instead
  // of being squeezed or cut off.
  const largeRows = fontScale >= LARGE_TEXT_SCALE && status
    ? [
        { key: "status", Icon: Clock, label: status.label, value: status.detail, a11y: `${status.label}, ${status.detail}` },
        ...(status.usual
          ? [{
              key: "usual", Icon: CalendarClock, label: "Usual hours", value: status.days ? `${status.usual}\n${status.days}` : status.usual,
              a11y: `Usual hours ${status.usual.replace(" – ", " to ")}${status.days ? `. ${status.days}` : ""}`,
            }]
          : []),
      ]
    : null;

  return (
    <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
      {status && largeRows && (
        <View style={{ backgroundColor: c.surfaceAlt, borderWidth: 1, borderColor: c.borderSoft, borderRadius: 14, paddingHorizontal: 14 }}>
          {largeRows.map(({ key, Icon, label, value, a11y }, i) => (
            <View
              key={key}
              accessible
              accessibilityLabel={a11y}
              style={{ minHeight: 52, flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8, borderTopWidth: i ? 1 : 0, borderTopColor: c.borderSoft }}
            >
              <Icon color={c.gold} size={20} />
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ flexShrink: 0, fontFamily: key === "status" ? "Poppins_700Bold" : "Poppins_400Regular", fontSize: key === "status" ? 15 : 13.5, lineHeight: 20, color: key === "status" ? c.textPrimary : c.textSecondary }}>
                {label}
              </Text>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                {key === "status" && dot ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: dot }} /> : null}
                <Text maxFontSizeMultiplier={MAX_FONT} style={{ flexShrink: 1, textAlign: "right", fontFamily: "Poppins_700Bold", fontSize: 14, lineHeight: 20, color: c.textPrimary }}>
                  {keepTimesTogether(value)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {status && !largeRows && (
        <View
          accessible
          accessibilityLabel={hoursA11y}
          style={{ backgroundColor: c.surfaceAlt, borderWidth: 1, borderColor: c.borderSoft, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11 }}
        >
          <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", columnGap: 10, rowGap: 2 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              {dot ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: dot }} /> : <Clock color={c.gold} size={16} />}
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 16, lineHeight: 22, color: c.textPrimary }}>{status.label}</Text>
            </View>
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ flexShrink: 1, fontFamily: "Poppins_600SemiBold", fontSize: 14, lineHeight: 20, color: c.textPrimary }}>
              {keepTimesTogether(status.detail)}
            </Text>
          </View>
          {status.usual ? (
            <Text maxFontSizeMultiplier={MAX_FONT} style={{ marginTop: 3, fontFamily: "Poppins_400Regular", fontSize: 13.5, lineHeight: 20, color: c.textSecondary }}>
              {keepTimesTogether(`Usual hours ${status.usual}`)}{status.days ? ` · ${status.days}` : ""}
            </Text>
          ) : null}
        </View>
      )}

      {/* A small one-line note under the status: just the months, e.g. "Sep – Apr".
          The place's own sentence (reasons, warnings) stays in the data and on
          the Trip Prep screens; see bestTimeMonths. */}
      {bestTime ? (
        <View
          accessible
          accessibilityLabel={`Best time to visit: ${bestTime}`}
          style={{ flexDirection: "row", gap: 8, marginTop: status ? 10 : 0, paddingHorizontal: 4 }}
        >
          <Calendar color={c.gold} size={16} style={{ marginTop: 2 }} />
          <Text maxFontSizeMultiplier={MAX_FONT} style={{ flex: 1, fontFamily: "Poppins_400Regular", fontSize: 13.5, lineHeight: 20, color: c.textSecondary }}>
            <Text style={{ fontFamily: "Poppins_700Bold", color: c.textPrimary }}>Best time to visit: </Text>
            {bestTime}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

/**
 * Where the place is, in words, with a small "Map" button beside it that opens
 * the place in the phone's maps app (Google Maps if it is installed, otherwise
 * the browser). The text is a verified street address where we have one, and
 * otherwise the place's name and state, which is all we know for sure.
 */
export function AddressRow({ address, placeName, onDirections }: { address: string; placeName: string; onDirections: () => void }) {
  const c = useThemeColors();
  return (
    <View style={{ paddingHorizontal: 16, marginTop: 10, flexDirection: "row", alignItems: "center", gap: 10 }}>
      <View accessible accessibilityLabel={`Address: ${address}`} style={{ flex: 1, flexDirection: "row", gap: 8, alignItems: "flex-start", paddingLeft: 4 }}>
        <MapPin color={c.gold} size={17} style={{ marginTop: 3 }} />
        <Text maxFontSizeMultiplier={MAX_FONT} style={{ flex: 1, fontFamily: "Poppins_400Regular", fontSize: 13.5, lineHeight: 20, color: c.textSecondary }}>
          {address}
        </Text>
      </View>
      <Pressable
        onPress={onDirections}
        accessibilityRole="button"
        accessibilityLabel={`Directions to ${placeName}. Opens your maps app.`}
        android_ripple={{ color: withOpacity(c.primary, 0.12) }}
        style={{ minHeight: 44, minWidth: 84, paddingHorizontal: 12, borderRadius: 22, borderWidth: 1.5, borderColor: c.border, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 }}
      >
        <Navigation color={c.primary} size={17} />
        <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 13.5, color: c.textPrimary }}>Directions</Text>
      </Pressable>
    </View>
  );
}

export function ExploreRows({ destination: d, onOpen }: { destination: Destination; onOpen: (target: HubTarget) => void }) {
  const c = useThemeColors();
  const price = fromPrice(d.accommodation);
  const hotelCount = hotelsFor(d).length;

  // "Hotels" opens the Hotels page (the hotels our guide names, then its price guide).
  // Nothing is bookable yet: there is no partner price or booking link.
  const stayPreview = price ? `From ₹${price.toLocaleString("en-IN")} a night` : "Stays for every budget";
  // A place whose guide names hotels shows a couple of them in their own section above
  // (HotelsPreview.tsx); this Hotels row is only for the places that name none.
  const headsUp = headsUpCount(d);
  const rows: { id: HubTarget; Icon: typeof Calendar; title: string; preview: string; badge?: string }[] = [
    ...(hotelCount === 0 ? [{ id: "stay" as HubTarget, Icon: BedDouble, title: "Hotels", preview: stayPreview }] : []),
    { id: "know", Icon: Backpack, title: "What to know before I go", preview: "Packing, local tips, safety notices" },
    { id: "safety", Icon: ShieldCheck, title: "Is it safe?", preview: safetyTeaser(d), badge: headsUp > 0 ? `${headsUp} ${headsUp === 1 ? "heads-up" : "heads-ups"}` : undefined },
  ];

  return (
    <View style={{ marginTop: 20 }}>
      <Text accessibilityRole="header" maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 20, lineHeight: 27, color: c.textPrimary, paddingHorizontal: 20 }}>
        What would you like to do?
      </Text>
      <View style={{ marginHorizontal: 16, marginTop: 8, borderRadius: 16, borderWidth: 1, borderColor: c.borderSoft, backgroundColor: c.surfaceAlt, overflow: "hidden" }}>
        {rows.map(({ id, Icon, title, preview, badge }, i) => (
          <Pressable
            key={id}
            onPress={() => onOpen(id)}
            accessibilityRole="button"
            accessibilityLabel={`${title}. ${preview}${badge ? `. ${badge}` : ""}`}
            android_ripple={{ color: withOpacity(c.primary, 0.12) }}
            style={{
              minHeight: 74, flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 14, paddingVertical: 12,
              borderTopWidth: i ? 1 : 0, borderTopColor: c.borderSoft,
            }}
          >
            <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: withOpacity(c.gold, 0.14), alignItems: "center", justifyContent: "center" }}>
              <Icon color={c.gold} size={24} />
            </View>
            <View style={{ flex: 1 }}>
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 16, lineHeight: 21, color: c.textPrimary }}>{title}</Text>
              <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 18, color: c.textSecondary }}>{preview}</Text>
              {badge ? (
                <View style={{ alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4, borderWidth: 1, borderColor: withOpacity(c.gold, 0.6), borderRadius: 999, paddingHorizontal: 10, paddingVertical: 1 }}>
                  <Bell color={c.gold} size={12} />
                  <Text maxFontSizeMultiplier={MAX_FONT} style={{ fontFamily: "Poppins_700Bold", fontSize: 12, lineHeight: 17, color: c.gold }}>{badge}</Text>
                </View>
              ) : null}
            </View>
            <ChevronRight color={c.textMuted} size={22} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
