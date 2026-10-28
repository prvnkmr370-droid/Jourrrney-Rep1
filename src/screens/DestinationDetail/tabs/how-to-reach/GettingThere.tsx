/**
 * "How to get there", the Fly / Train / Bus tabs. Instead of starting from the
 * traveller's home and burying the place they actually book to, each tab leads
 * with the NEAREST airport, railway station or bus station to the destination:
 * its name and code, how far it is by road, and one button to look up tickets
 * from the traveller's own city to that hub. Other hubs people use sit under it,
 * then the short last leg. Backed by src/data/gateways.ts (every entry checked by
 * a person); a place without an entry keeps the older air/train/road rows. Shown
 * by HowToGetThere.tsx on the destination page, which also supplies the starting
 * city and its picker (so "Use my location" and the recent cities work as before)
 * and keeps the "See the full route" button as the full step-by-step journey.
 */
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { BusFront, ChevronDown, ChevronUp, Plane, TrainFront, type LucideIcon } from "lucide-react-native";
import type { AirService, PlaceGateways } from "@/data/gateways";
import { useResolvedScheme, useThemeColors } from "@/theme/useThemeColors";
import { openMapSearch } from "@/utils/openMaps";
import LookUpSheet, { type LookUpTarget } from "./LookUpSheet";
import type { GatewayMode } from "./gatewayLinks";

type Tone = "amber" | "green" | "teal" | "red" | "grey";

const TABS: { id: GatewayMode; label: string; Icon: LucideIcon }[] = [
  { id: "air", label: "Fly", Icon: Plane },
  { id: "rail", label: "Train", Icon: TrainFront },
  { id: "bus", label: "Bus", Icon: BusFront },
];

const SERVICE_TAG: Record<AirService, { text: string; tone: Tone }> = {
  few: { text: "Few flights", tone: "amber" },
  more: { text: "More flights", tone: "green" },
  most: { text: "Most flights", tone: "green" },
};

const MODE_WORDS: Record<GatewayMode, { hub: string; chip: string; lookUp: string; other: string; button: string }> = {
  air: { hub: "airport", chip: "NEAREST AIRPORT", lookUp: "flights", other: "OTHER AIRPORTS PEOPLE USE", button: "Flights" },
  rail: { hub: "railway station", chip: "NEAREST RAILWAY STATION", lookUp: "trains", other: "OTHER STATIONS", button: "Trains" },
  bus: { hub: "bus station", chip: "NEAREST BUS STATION", lookUp: "buses", other: "OTHER BUS STATIONS", button: "Buses" },
};

/** Round a drive time to something that reads honestly ("about 1 h 30 min"), not a false-precise "83 min". */
function fmtTime(minutes: number): string {
  if (minutes < 60) return `${Math.max(5, Math.round(minutes / 5) * 5)} min`;
  const h = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (rem < 15) return `${h} h`;
  if (rem < 45) return `${h} h 30 min`;
  return `${h + 1} h`;
}
const fmtKm = (km: number) => `≈ ${Math.round(km)} km`;

/** "Hosapete (Hospet) Bus Station" -> "Hosapete": the town name a bus site understands. */
function busSearchName(name: string): string {
  return name.replace(/\([^)]*\)/g, "").replace(/\b(central\s+)?(bus\s+(station|stand|terminal|terminus|depot)|isbt)\b/gi, "").replace(/\s+/g, " ").trim() || name;
}

function useTone() {
  const dark = useResolvedScheme() === "dark";
  return (t: Tone): { bg: string; fg: string } => {
    if (dark) {
      return {
        amber: { bg: "rgba(251,191,36,0.16)", fg: "#FCD34D" },
        green: { bg: "rgba(74,222,128,0.14)", fg: "#86EFAC" },
        teal: { bg: "rgba(79,195,204,0.16)", fg: "#7DD3DB" },
        red: { bg: "rgba(248,113,113,0.16)", fg: "#FCA5A5" },
        grey: { bg: "rgba(255,255,255,0.10)", fg: "#D6D3D1" },
      }[t];
    }
    return {
      amber: { bg: "#FEF3C7", fg: "#92400E" },
      green: { bg: "#DCFCE7", fg: "#166534" },
      teal: { bg: "#CCE8EA", fg: "#0D5C63" },
      red: { bg: "#FEE2E2", fg: "#991B1B" },
      grey: { bg: "#E7E5E4", fg: "#44403C" },
    }[t];
  };
}

function Tag({ text, tone }: { text: string; tone: Tone }) {
  const t = useTone()(tone);
  return (
    <View style={{ alignSelf: "flex-start", backgroundColor: t.bg, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3 }}>
      <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12, lineHeight: 18, color: t.fg }}>{text}</Text>
    </View>
  );
}

function CodeBadge({ code }: { code: string }) {
  const c = useThemeColors();
  return (
    <View style={{ borderWidth: 1.5, borderColor: c.primary, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 1 }}>
      <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_800ExtraBold", fontSize: 13, lineHeight: 20, letterSpacing: 0.5, color: c.primary }}>{code}</Text>
    </View>
  );
}

/** A short wrapped paragraph on a tinted background. */
function Note({ text, tone = "amber" }: { text: string; tone?: Tone }) {
  const t = useTone()(tone);
  return (
    <View style={{ backgroundColor: t.bg, borderRadius: 14, paddingHorizontal: 13, paddingVertical: 11 }}>
      <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 21, color: t.fg }}>{text}</Text>
    </View>
  );
}

interface Stat { value: string; label: string; warn?: boolean }

interface HubCardProps {
  chip: string;
  chipTone?: Tone;
  title: string;
  code?: string;
  area?: string;
  badge?: { text: string; tone: Tone };
  stats: Stat[];
  lookUp: { label: string; sub: string; onPress: () => void };
  mapQuery: string;
  strong?: boolean;
}

/** The main card of a tab: the nearest place to book to. */
function HubCard({ chip, chipTone = "amber", title, code, area, badge, stats, lookUp, mapQuery, strong = true }: HubCardProps) {
  const c = useThemeColors();
  const tone = useTone();
  const chipColors = tone(chipTone);
  const warn = tone("amber").fg;
  return (
    <View style={{ backgroundColor: c.surface, borderWidth: strong ? 1.5 : 1, borderColor: strong ? c.primary : c.border, borderRadius: 20, padding: 14, gap: 8 }}>
      <View style={{ alignSelf: "flex-start", backgroundColor: chipColors.bg, borderRadius: 99, paddingHorizontal: 11, paddingVertical: 4 }}>
        <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_800ExtraBold", fontSize: 12, lineHeight: 18, letterSpacing: 1, color: chipColors.fg }}>{chip}</Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <Text accessibilityRole="header" maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 19, lineHeight: 26, color: c.textPrimary, flexShrink: 1 }}>{title}</Text>
        {code ? <CodeBadge code={code} /> : null}
      </View>
      {area ? <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 21, color: c.textSecondary }}>{area}</Text> : null}
      {badge ? <Tag text={badge.text} tone={badge.tone} /> : null}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {stats.map((s) => (
          <View key={s.label} style={{ flex: 1, backgroundColor: c.bg, borderRadius: 12, paddingHorizontal: 9, paddingVertical: 8 }}>
            <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 15, lineHeight: 22, color: s.warn ? warn : c.textPrimary }}>{s.value}</Text>
            <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17, color: c.textSecondary }}>{s.label}</Text>
          </View>
        ))}
      </View>
      <Pressable
        onPress={lookUp.onPress}
        accessibilityRole="button"
        accessibilityLabel={`${lookUp.label}. ${lookUp.sub}`}
        android_ripple={{ color: "rgba(255,255,255,0.25)" }}
        style={{ backgroundColor: c.primary, borderRadius: 14, minHeight: 56, alignItems: "center", justifyContent: "center", paddingHorizontal: 12, paddingVertical: 9, marginTop: 2 }}
      >
        <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 16, lineHeight: 23, color: c.onPrimary, textAlign: "center" }}>{lookUp.label}</Text>
        <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_500Medium", fontSize: 12, lineHeight: 17, color: c.onPrimary, opacity: 0.9, textAlign: "center" }}>{lookUp.sub}</Text>
      </Pressable>
      <Pressable onPress={() => openMapSearch(mapQuery)} accessibilityRole="link" accessibilityLabel={`Show ${title} on the map`} style={{ minHeight: 44, alignItems: "center", justifyContent: "center" }}>
        <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.primary }}>Show on map</Text>
      </Pressable>
    </View>
  );
}

interface OtherRowProps { title: string; code?: string; meta: string; tag?: { text: string; tone: Tone }; button: string; onPress: () => void }

function OtherRow({ title, code, meta, tag, button, onPress }: OtherRowProps) {
  const c = useThemeColors();
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 10, minHeight: 64 }}>
      <View style={{ flex: 1, gap: 3 }}>
        <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
          <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 15, lineHeight: 22, color: c.textPrimary, flexShrink: 1 }}>{title}</Text>
          {code ? <CodeBadge code={code} /> : null}
        </View>
        <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary }}>{meta}</Text>
        {tag ? <Tag text={tag.text} tone={tag.tone} /> : null}
      </View>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Look up ${button.toLowerCase()} to ${title}`}
        android_ripple={{ color: "rgba(0,0,0,0.08)" }}
        style={{ minHeight: 48, minWidth: 64, borderWidth: 1.5, borderColor: c.primary, borderRadius: 12, alignItems: "center", justifyContent: "center", paddingHorizontal: 10 }}
      >
        <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.primary }}>{button}</Text>
      </Pressable>
    </View>
  );
}

function SectionTitle({ text }: { text: string }) {
  const c = useThemeColors();
  return <Text accessibilityRole="header" maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_800ExtraBold", fontSize: 13, lineHeight: 19, letterSpacing: 0.8, color: c.textSecondary, marginTop: 4 }}>{text}</Text>;
}

function Accordion({ title, body }: { title: string; body: string }) {
  const c = useThemeColors();
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={{ minHeight: 52, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderTopLeftRadius: 14, borderTopRightRadius: 14, borderBottomLeftRadius: open ? 0 : 14, borderBottomRightRadius: open ? 0 : 14, paddingHorizontal: 14, paddingVertical: 8 }}
      >
        <Text maxFontSizeMultiplier={1.3} style={{ flex: 1, fontFamily: "Poppins_600SemiBold", fontSize: 15, lineHeight: 22, color: c.textPrimary }}>{title}</Text>
        {open ? <ChevronUp color={c.textSecondary} size={20} /> : <ChevronDown color={c.textSecondary} size={20} />}
      </Pressable>
      {open ? (
        <View style={{ backgroundColor: c.surface, borderWidth: 1, borderTopWidth: 0, borderColor: c.border, borderBottomLeftRadius: 14, borderBottomRightRadius: 14, paddingHorizontal: 14, paddingBottom: 12, paddingTop: 2 }}>
          <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 21, color: c.textPrimary }}>{body}</Text>
        </View>
      ) : null}
    </View>
  );
}

interface Props {
  /** The place's plain name ("Hampi"). */
  place: string;
  gateways: PlaceGateways;
  /** The starting city the traveller chose ("Chennai"), or "" if none yet. */
  origin: string;
  /** Opens the starting-city picker (owned by the page, so it stays the same everywhere). */
  onChangeOrigin: () => void;
  /** True while that picker is open. */
  pickerOpen: boolean;
}

export default function GettingThere({ place, gateways: g, origin, onChangeOrigin, pickerOpen }: Props) {
  const c = useThemeColors();
  const [tab, setTab] = useState<GatewayMode>("air");
  const [pending, setPending] = useState<LookUpTarget | null>(null);
  const [target, setTarget] = useState<LookUpTarget | null>(null);

  // Someone tapped "Look up" before choosing a starting city: ask for the city first, then carry straight on.
  useEffect(() => {
    if (origin && pending) {
      setTarget(pending);
      setPending(null);
    }
  }, [origin, pending]);
  // They closed the picker without choosing a city: forget the look-up they were after.
  useEffect(() => {
    if (!pickerOpen && !origin) setPending(null);
  }, [pickerOpen, origin]);

  const ask = (t: LookUpTarget) => {
    if (origin) setTarget(t);
    else {
      setPending(t);
      onChangeOrigin();
    }
  };
  const sub = origin ? `Starting from ${origin}` : "Choose your starting city first";
  const words = MODE_WORDS[tab];

  const detailsComing = (extra?: React.ReactNode) => (
    <View style={{ backgroundColor: c.surface, borderWidth: 1.5, borderStyle: "dashed", borderColor: c.border, borderRadius: 20, padding: 14, gap: 8 }}>
      <Tag text="DETAILS COMING" tone="grey" />
      <Text accessibilityRole="header" maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 18, lineHeight: 25, color: c.textPrimary }}>
        We haven't added the nearest {words.hub} for {place} yet
      </Text>
      {extra}
    </View>
  );

  const airTab = () => {
    const [first, ...rest] = g.air;
    if (!first) return detailsComing();
    const svc = SERVICE_TAG[first.service];
    return (
      <>
        <HubCard
          chip={words.chip}
          title={first.name}
          code={first.code}
          area={first.area}
          stats={[
            { value: fmtKm(first.km), label: `by road to ${place}` },
            { value: fmtTime(first.minutes), label: "drive" },
            { value: svc.text, label: "check your dates", warn: first.service === "few" },
          ]}
          lookUp={{ label: `Look up flights to ${first.code}`, sub, onPress: () => ask({ mode: "air", label: first.code }) }}
          mapQuery={`${first.name} ${first.code}`}
        />
        {first.note ? <Note text={first.note} /> : null}
        {rest.length > 0 && (
          <>
            <SectionTitle text={words.other} />
            {rest.map((a) => (
              <OtherRow
                key={a.code}
                title={a.name}
                code={a.code}
                meta={`${fmtKm(a.km)} · about ${fmtTime(a.minutes)} by road`}
                tag={SERVICE_TAG[a.service]}
                button={words.button}
                onPress={() => ask({ mode: "air", label: a.code })}
              />
            ))}
          </>
        )}
        {g.fromHub?.air ? <Accordion title={`From the airport to ${place}`} body={g.fromHub.air} /> : null}
      </>
    );
  };

  const railTab = () => {
    const [first, ...rest] = g.rail;
    if (!first) return detailsComing();
    return (
      <>
        {g.railNone ? <Note tone="red" text={g.railNone} /> : null}
        <HubCard
          chip={g.railNone ? "NEAREST RAILHEAD" : words.chip}
          title={first.name}
          code={first.code}
          area={first.area}
          stats={[
            { value: fmtKm(first.km), label: `by road to ${place}`, warn: !!g.railNone },
            { value: fmtTime(first.minutes), label: g.railNone ? "on the road" : "drive", warn: !!g.railNone },
            ...(first.junction ? [{ value: "Major junction", label: "many trains stop" }] : []),
          ]}
          lookUp={{ label: `Look up trains to ${first.code}`, sub, onPress: () => ask({ mode: "rail", label: first.code }) }}
          mapQuery={`${first.name} railway station ${first.code}`}
        />
        {first.note ? <Note text={first.note} /> : null}
        {g.railNone && g.air.length > 0 ? (
          <Pressable onPress={() => setTab("air")} accessibilityRole="button" style={{ minHeight: 48, justifyContent: "center" }}>
            <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 14, lineHeight: 21, color: c.primary }}>Most visitors fly instead. See the Fly tab</Text>
          </Pressable>
        ) : null}
        {rest.length > 0 && (
          <>
            <SectionTitle text={words.other} />
            {rest.map((s) => (
              <OtherRow
                key={s.code}
                title={s.name}
                code={s.code}
                meta={`${fmtKm(s.km)} · about ${fmtTime(s.minutes)} by road`}
                tag={s.junction ? { text: "Major junction", tone: "teal" } : undefined}
                button={words.button}
                onPress={() => ask({ mode: "rail", label: s.code })}
              />
            ))}
          </>
        )}
        {g.fromHub?.rail ? <Accordion title={`From the station to ${place}`} body={g.fromHub.rail} /> : null}
        <Note tone="teal" text="Book train tickets on the official IRCTC site or app." />
      </>
    );
  };

  const busTab = () => {
    const [first, ...rest] = g.bus;
    if (!first) {
      const town = g.busTown;
      return detailsComing(
        town ? (
          <>
            <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_400Regular", fontSize: 14, lineHeight: 21, color: c.textSecondary }}>Here is the nearest bigger town people travel to by bus:</Text>
            <OtherRow
              title={town.name}
              meta={`${fmtKm(town.km)} · about ${fmtTime(town.minutes)} by road`}
              button={words.button}
              onPress={() => ask({ mode: "bus", label: town.name })}
            />
          </>
        ) : undefined,
      );
    }
    const operator =
      first.operator === "government" ? { text: `Government${first.operatorName ? ` · ${first.operatorName}` : ""}`, tone: "teal" as Tone }
      : first.operator === "private" ? { text: "Private operators", tone: "grey" as Tone }
      : first.operator === "unknown" ? undefined
      : { text: `Government${first.operatorName ? ` (${first.operatorName})` : ""} and private`, tone: "teal" as Tone };
    return (
      <>
        <HubCard
          chip={words.chip}
          title={first.name}
          area={first.area}
          badge={operator}
          stats={[
            { value: fmtKm(first.km), label: `by road to ${place}` },
            { value: fmtTime(first.minutes), label: "drive" },
          ]}
          lookUp={{ label: `Look up buses to ${busSearchName(first.name)}`, sub: origin ? `Starting from ${origin}` : "Choose your starting city first", onPress: () => ask({ mode: "bus", label: busSearchName(first.name), bookingUrl: first.bookingUrl, operatorName: first.operatorName }) }}
          mapQuery={first.name}
        />
        {first.note ? <Note text={first.note} /> : null}
        {first.goesTo && first.goesTo.length > 0 && (
          <>
            <SectionTitle text="BUSES FROM HERE GO TO" />
            {first.goesTo.map((r) => (
              <View key={r.place} style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, minHeight: 56 }}>
                <Text maxFontSizeMultiplier={1.3} style={{ flex: 1, fontFamily: "Poppins_700Bold", fontSize: 15, lineHeight: 22, color: c.textPrimary }}>{r.place}</Text>
                {r.note ? <Text maxFontSizeMultiplier={1.3} style={{ flexShrink: 1, fontFamily: "Poppins_400Regular", fontSize: 13, lineHeight: 19, color: c.textSecondary, textAlign: "right" }}>{r.note}</Text> : null}
              </View>
            ))}
          </>
        )}
        {rest.length > 0 && (
          <>
            <SectionTitle text={words.other} />
            {rest.map((b) => (
              <OtherRow
                key={b.name}
                title={b.name}
                meta={`${fmtKm(b.km)} · about ${fmtTime(b.minutes)} by road`}
                tag={b.operator === "private" ? { text: "Private operators", tone: "grey" } : b.operator === "unknown" ? undefined : { text: `Government${b.operatorName ? ` · ${b.operatorName}` : ""}`, tone: "teal" }}
                button={words.button}
                onPress={() => ask({ mode: "bus", label: busSearchName(b.name), bookingUrl: b.bookingUrl, operatorName: b.operatorName })}
              />
            ))}
          </>
        )}
        {g.fromHub?.bus ? <Accordion title={`From the bus station to ${place}`} body={g.fromHub.bus} /> : null}
      </>
    );
  };

  return (
    <View style={{ gap: 12 }}>
      <View accessibilityRole="tablist" style={{ flexDirection: "row", gap: 6, backgroundColor: c.surfaceAlt, borderRadius: 16, padding: 5 }}>
        {TABS.map(({ id, label, Icon }) => {
          const selected = tab === id;
          return (
            <Pressable
              key={id}
              onPress={() => setTab(id)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={label}
              style={{ flex: 1, minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, backgroundColor: selected ? c.primary : "transparent" }}
            >
              <Icon color={selected ? c.onPrimary : c.textSecondary} size={18} />
              <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: selected ? c.onPrimary : c.textSecondary }}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        onPress={onChangeOrigin}
        accessibilityRole="button"
        accessibilityLabel={origin ? `Looking from ${origin}. Change` : "Choose your starting city"}
        style={{ minHeight: 56, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8 }}
      >
        <View style={{ flex: 1 }}>
          <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17, color: c.textSecondary }}>Looking from</Text>
          <Text numberOfLines={1} maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 16, lineHeight: 23, color: origin ? c.textPrimary : c.textSecondary }}>{origin || "Choose your starting city"}</Text>
        </View>
        <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.primary }}>{origin ? "Change" : "Choose"}</Text>
      </Pressable>

      {tab === "air" ? airTab() : tab === "rail" ? railTab() : busTab()}

      <Text maxFontSizeMultiplier={1.3} style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18, color: c.textSecondary }}>
        {g.basis === "mapdata"
          ? `Distances are by road and approximate. Worked out from open map, railway and airport data (${g.checked}), not checked place by place. Please check before you travel.`
          : `Distances are by road and approximate. Checked ${g.checked}.`}
      </Text>

      <LookUpSheet target={target} origin={origin} onClose={() => setTarget(null)} />
    </View>
  );
}
