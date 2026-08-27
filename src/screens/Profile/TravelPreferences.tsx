/** Source of truth: Figma "5.3 Travel Preferences". */
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { useTravelPreferencesStore, type BudgetComfort, type TravelStyle } from "@/store/useTravelPreferencesStore";
import { withOpacity } from "@/components/withOpacity";
import { useThemeColors } from "@/theme/useThemeColors";

interface Props {
  onBack: () => void;
}

const TRAVEL_STYLES: { id: TravelStyle; label: string }[] = [
  { id: "slow", label: "Slow travel" },
  { id: "packed", label: "Packed itinerary" },
  { id: "mixed", label: "Mix of both" },
];

const BUDGET_OPTIONS: { id: BudgetComfort; label: string }[] = [
  { id: "backpacker", label: "Backpacker" },
  { id: "midRange", label: "Mid-range" },
  { id: "comfortPlus", label: "Comfort+" },
];

const INTERESTS = [
  { id: "culture", label: "Culture" },
  { id: "nature", label: "Nature" },
  { id: "food", label: "Food" },
  { id: "adventure", label: "Adventure" },
  { id: "wellness", label: "Wellness" },
];

export default function TravelPreferences({ onBack }: Props) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const { travelStyle, budgetComfort, interests, setTravelStyle, setBudgetComfort, toggleInterest } = useTravelPreferencesStore();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <Pressable onPress={onBack} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft color={c.textPrimary} size={18} />
        </Pressable>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 18, color: c.textPrimary }}>Travel Preferences</Text>
      </View>
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17, color: c.textSecondary, marginBottom: 24 }}>
        This feeds the AI Itinerary Engine — the more it knows, the better the plans.
      </Text>

      <SectionLabel c={c}>TRAVEL STYLE</SectionLabel>
      <ChipGroup>
        {TRAVEL_STYLES.map((opt) => (
          <Chip key={opt.id} label={opt.label} active={travelStyle === opt.id} onPress={() => setTravelStyle(opt.id)} c={c} />
        ))}
      </ChipGroup>

      <SectionLabel c={c}>BUDGET COMFORT</SectionLabel>
      <ChipGroup>
        {BUDGET_OPTIONS.map((opt) => (
          <Chip key={opt.id} label={opt.label} active={budgetComfort === opt.id} onPress={() => setBudgetComfort(opt.id)} c={c} />
        ))}
      </ChipGroup>

      <SectionLabel c={c}>INTERESTS</SectionLabel>
      <ChipGroup last>
        {INTERESTS.map((opt) => (
          <Chip key={opt.id} label={opt.label} active={interests.includes(opt.id)} onPress={() => toggleInterest(opt.id)} c={c} />
        ))}
      </ChipGroup>

      <Pressable onPress={onBack} style={{ backgroundColor: "#333C81", borderRadius: 16, paddingVertical: 16, alignItems: "center" }}>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: "#FFFFFF" }}>Save Preferences</Text>
      </Pressable>
    </ScrollView>
  );
}

function SectionLabel({ children, c }: { children: React.ReactNode; c: ReturnType<typeof useThemeColors> }) {
  return (
    <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, letterSpacing: 1, color: c.textSecondary, marginBottom: 10 }}>
      {children}
    </Text>
  );
}

function ChipGroup({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: last ? 28 : 24 }}>{children}</View>;
}

function Chip({ label, active, onPress, c }: { label: string; active: boolean; onPress: () => void; c: ReturnType<typeof useThemeColors> }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999, backgroundColor: active ? withOpacity(c.primary, 0.12) : c.surface, borderWidth: 1.5, borderColor: active ? c.primary : c.border }}
    >
      <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 12, color: active ? c.primary : c.textSecondary }}>{label}</Text>
    </Pressable>
  );
}
