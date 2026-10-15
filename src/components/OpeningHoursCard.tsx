/**
 * "Opening hours" card modelled on Google Maps' place panel:
 *
 *  - collapsed: one row — the label, today's hours inline, and a chevron at
 *    the right-hand corner;
 *  - tap the chevron (or the row) and it opens into the whole week, today in
 *    bold; tap again to fold it back.
 *
 * The chevron and the expansion only exist when there is a full week of data
 * that came from Google Maps (`hours.source === "google"`). The destination
 * cards' own curated hours have no per-day detail behind them, so they get a
 * plain, non-expandable row (plus the card's free-text note) rather than a
 * seven-day list we can't stand behind. Google data is credited as Google's
 * terms require.
 */
import { useState } from "react";
import { LayoutAnimation, Pressable, Text, View } from "react-native";
import { ChevronDown, ChevronUp, Clock } from "lucide-react-native";
import { useThemeColors } from "@/theme/useThemeColors";
import { DAYS, todayIndex, type DayRow, type WeeklyHours } from "@/utils/openingHours";

interface Props {
  hours: WeeklyHours;
  /** Free text from the destination card (entry fees, closing days, festival timings…). */
  note?: string;
  /** Names the card for screen readers, e.g. "Rock Garden". */
  subject?: string;
}

function Sessions({ row, bold, color, closedColor }: { row: DayRow; bold?: boolean; color: string; closedColor: string }) {
  if (row.closed) {
    return <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12, color: closedColor }}>Closed</Text>;
  }
  return (
    <>
      {row.sessions.map((s) => (
        <Text
          key={s}
          style={{ fontFamily: bold ? "Poppins_700Bold" : "Poppins_500Medium", fontSize: 12, lineHeight: 18, textAlign: "right", color }}
        >
          {s}
        </Text>
      ))}
    </>
  );
}

export default function OpeningHoursCard({ hours, note, subject }: Props) {
  const c = useThemeColors();
  const [expanded, setExpanded] = useState(false);
  const today = todayIndex();
  const todayRow = hours.rows[today];

  const expandable = hours.source === "google";

  const toggle = () => {
    if (!expandable) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((v) => !v);
  };

  const headerLabel =
    `Opening hours${subject ? ` for ${subject}` : ""}` +
    (expandable ? (expanded ? ", showing the whole week. Tap to collapse." : ", showing today. Tap to see the whole week.") : "");

  return (
    <View style={{ backgroundColor: c.surfaceAlt, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 6 }}>
      <Pressable
        onPress={toggle}
        disabled={!expandable}
        accessibilityRole={expandable ? "button" : "text"}
        accessibilityState={expandable ? { expanded } : undefined}
        accessibilityLabel={headerLabel}
        style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, minHeight: 48, paddingVertical: 10 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, height: 28 }}>
          <Clock color={c.teal} size={16} />
          <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, color: c.textPrimary }}>Opening hours</Text>
        </View>

        {/* Collapsed: today's hours sit inline, between the label and the chevron. */}
        <View style={{ flex: 1, alignItems: "flex-end", justifyContent: "center", minHeight: 28 }}>
          {!expanded && <Sessions row={todayRow} color={c.textSecondary} closedColor={c.danger} />}
        </View>

        {expandable && (
          <View style={{ width: 28, height: 28, alignItems: "center", justifyContent: "center", marginRight: -4 }}>
            {expanded ? <ChevronUp color={c.textMuted} size={20} /> : <ChevronDown color={c.textMuted} size={20} />}
          </View>
        )}
      </Pressable>

      {expandable && expanded && (
        <View style={{ paddingBottom: 6 }}>
          {hours.rows.map((row, i) => {
            const isToday = i === today;
            return (
              <View
                key={DAYS[i]}
                style={{
                  flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12,
                  paddingVertical: 8, borderTopWidth: 1, borderTopColor: c.borderSoft,
                }}
              >
                <Text
                  style={{
                    fontFamily: isToday ? "Poppins_700Bold" : "Poppins_500Medium", fontSize: 12, lineHeight: 18,
                    color: isToday ? c.textPrimary : c.textSecondary,
                  }}
                >
                  {row.day}
                </Text>
                <View style={{ alignItems: "flex-end", flexShrink: 1 }}>
                  <Sessions row={row} bold={isToday} color={isToday ? c.textPrimary : c.textSecondary} closedColor={c.danger} />
                </View>
              </View>
            );
          })}
        </View>
      )}

      {(note || hours.source === "google") && (
        <View style={{ paddingVertical: 8, borderTopWidth: 1, borderTopColor: c.borderSoft, gap: 4 }}>
          {note ? (
            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, lineHeight: 16, color: c.textSecondary }}>{note}</Text>
          ) : null}
          {hours.source === "google" && (
            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 10, color: c.textMuted }}>Hours from Google Maps</Text>
          )}
        </View>
      )}
    </View>
  );
}
