/**
 * "Photo credits" — one place that credits every photographer whose photo
 * appears in the app and states the licence it is shared under. Most photos
 * come from Wikimedia Commons under Creative Commons licences, which require
 * the author to be credited; the cards themselves stay clean and this screen
 * carries that credit instead. Built from each card's own `imageCredit`
 * (its original photo) plus GALLERY_CREDITS (photos added to galleries since).
 */
import { useMemo, useState } from "react";
import { View, Text, Pressable, SectionList, TextInput, Linking } from "react-native";
import { ArrowLeft, Search } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DESTINATIONS } from "@/data/destinations";
import { GALLERY_CREDITS } from "@/data/photoCredits";
import { useThemeColors } from "@/theme/useThemeColors";

interface Props {
  onBack: () => void;
}

interface CreditRow {
  id: string;
  name: string;
  lines: { text: string; url?: string }[];
}

export default function PhotoCredits({ onBack }: Props) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const [query, setQuery] = useState("");

  const sections = useMemo(() => {
    const byState = new Map<string, CreditRow[]>();
    for (const d of DESTINATIONS) {
      const lines: CreditRow["lines"] = [];
      if (d.imageCredit) lines.push({ text: d.imageCredit });
      for (const g of GALLERY_CREDITS[d.id] ?? []) {
        lines.push({ text: `${g.author} — ${g.title} (${g.licence})`, url: g.pageUrl });
      }
      if (lines.length === 0) continue;
      const list = byState.get(d.state) ?? [];
      list.push({ id: d.id, name: d.name, lines });
      byState.set(d.state, list);
    }
    return [...byState.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([state, data]) => ({ title: state, data: data.sort((x, y) => x.name.localeCompare(y.name)) }));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((s) => ({
        title: s.title,
        data: s.data.filter(
          (r) => s.title.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.lines.some((l) => l.text.toLowerCase().includes(q)),
        ),
      }))
      .filter((s) => s.data.length > 0);
  }, [sections, query]);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ backgroundColor: c.surface, borderBottomWidth: 1, borderBottomColor: c.border, paddingTop: insets.top + 12, paddingBottom: 12, paddingHorizontal: 20, gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back"
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.surfaceAlt, alignItems: "center", justifyContent: "center" }}
          >
            <ArrowLeft color={c.textPrimary} size={18} />
          </Pressable>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 17, color: c.textPrimary }}>Photo credits</Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: c.surfaceAlt, borderRadius: 14, paddingHorizontal: 12, height: 44 }}>
          <Search color={c.textMuted} size={16} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search a place, state or photographer"
            placeholderTextColor={c.textMuted}
            autoCorrect={false}
            style={{ flex: 1, fontFamily: "Poppins_400Regular", fontSize: 13, color: c.textPrimary, paddingVertical: 0 }}
          />
        </View>
      </View>

      <SectionList
        sections={filtered}
        keyExtractor={(row) => row.id}
        stickySectionHeadersEnabled
        initialNumToRender={20}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
        ListHeaderComponent={
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18, color: c.textSecondary, padding: 20, paddingBottom: 8 }}>
            Photos in this app come from Wikimedia Commons and other freely licensed sources. Each photographer is credited below, with the licence the photo is shared under.
          </Text>
        }
        ListFooterComponent={
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary, marginBottom: 4 }}>Addresses</Text>
            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18, color: c.textSecondary }}>
              Where a place's address is shown, the street and area come from OpenStreetMap, © OpenStreetMap contributors, available under the Open Database Licence, and the postal (PIN) code is checked against India Post's PIN directory.
            </Text>
            <Pressable
              onPress={() => Linking.openURL("https://www.openstreetmap.org/copyright").catch(() => {})}
              accessibilityRole="link"
              accessibilityLabel="OpenStreetMap copyright and licence"
              style={{ minHeight: 44, justifyContent: "center" }}
            >
              <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12, color: c.primary }}>openstreetmap.org/copyright</Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 13, color: c.textSecondary, textAlign: "center", padding: 32 }}>Nothing matches that search.</Text>
        }
        renderSectionHeader={({ section }) => (
          <View style={{ backgroundColor: c.bg, paddingHorizontal: 20, paddingVertical: 8 }}>
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, letterSpacing: 0.6, color: c.primary }}>{section.title.toUpperCase()}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={{ marginHorizontal: 20, marginBottom: 8, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 14, padding: 12, gap: 4 }}>
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary }}>{item.name}</Text>
            {item.lines.map((line, i) =>
              line.url ? (
                <Text
                  key={i}
                  onPress={() => Linking.openURL(line.url!)}
                  style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17, color: c.primary }}
                >
                  {line.text}
                </Text>
              ) : (
                <Text key={i} style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17, color: c.textSecondary }}>
                  {line.text}
                </Text>
              ),
            )}
          </View>
        )}
      />
    </View>
  );
}
