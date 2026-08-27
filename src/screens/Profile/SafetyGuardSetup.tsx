/** Source of truth: Figma "5.2 Safety Guard Setup". */
import { useState } from "react";
import { View, Text, Pressable, TextInput, Switch, Modal, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { useSafetyGuardStore } from "@/store/useSafetyGuardStore";
import { withOpacity } from "@/components/withOpacity";
import { useThemeColors } from "@/theme/useThemeColors";

interface Props {
  onBack: () => void;
}

export default function SafetyGuardSetup({ onBack }: Props) {
  const insets = useSafeAreaInsets();
  const c = useThemeColors();
  const { contacts, shareLiveLocation, curfewAlerts, addContact, setShareLiveLocation, setCurfewAlerts } = useSafetyGuardStore();
  const [showAddContact, setShowAddContact] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleAddContact = () => {
    if (!name.trim() || !phone.trim()) return;
    addContact(name.trim(), phone.trim());
    setName("");
    setPhone("");
    setShowAddContact(false);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: c.bg }} contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <Pressable onPress={onBack} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: c.surface, alignItems: "center", justifyContent: "center" }}>
          <ArrowLeft color={c.textPrimary} size={18} />
        </Pressable>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 18, color: c.textPrimary }}>Safety Guard Setup</Text>
      </View>
      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 17, color: c.textSecondary, marginBottom: 20 }}>
        These settings power SOS alerts and safety nudges across the app.
      </Text>

      <SectionLabel c={c}>EMERGENCY CONTACTS</SectionLabel>
      <View style={{ gap: 10, marginBottom: 20 }}>
        {contacts.map((contact) => (
          <View key={contact.id} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 16 }}>
            <View>
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.textPrimary }}>{contact.name}</Text>
              <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, color: c.textSecondary, marginTop: 2 }}>{contact.phone}</Text>
            </View>
            {contact.isPrimary && (
              <View style={{ backgroundColor: withOpacity(c.success, 0.12), borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: c.success }}>Primary</Text>
              </View>
            )}
          </View>
        ))}
        <Pressable
          onPress={() => setShowAddContact(true)}
          style={{ backgroundColor: c.surface, borderWidth: 1.5, borderColor: withOpacity(c.primary, 0.35), borderStyle: "dashed", borderRadius: 16, paddingVertical: 16, alignItems: "center" }}
        >
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.primary }}>+ Add another contact</Text>
        </Pressable>
      </View>

      <SectionLabel c={c}>LIVE LOCATION SHARING</SectionLabel>
      <ToggleRow
        title="Share with SOS contacts"
        subtitle="During active trips only"
        value={shareLiveLocation}
        onValueChange={setShareLiveLocation}
        c={c}
      />

      <SectionLabel c={c}>SAFETY NUDGES</SectionLabel>
      <ToggleRow
        title="Curfew & area alerts"
        subtitle="Notify me near sunset in unfamiliar areas"
        value={curfewAlerts}
        onValueChange={setCurfewAlerts}
        c={c}
      />

      <Pressable onPress={onBack} style={{ backgroundColor: "#333C81", borderRadius: 16, paddingVertical: 16, alignItems: "center", marginTop: 12 }}>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: "#FFFFFF" }}>Save Safety Settings</Text>
      </Pressable>

      <Modal visible={showAddContact} transparent animationType="fade" onRequestClose={() => setShowAddContact(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: c.surface, borderRadius: 20, padding: 20 }}>
            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 16, color: c.textPrimary, marginBottom: 16 }}>Add emergency contact</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Name"
              placeholderTextColor={c.textMuted}
              style={{ height: 46, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 14, fontFamily: "Poppins_400Regular", fontSize: 14, color: c.textPrimary, marginBottom: 10 }}
            />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone number"
              placeholderTextColor={c.textMuted}
              keyboardType="phone-pad"
              style={{ height: 46, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 14, fontFamily: "Poppins_400Regular", fontSize: 14, color: c.textPrimary, marginBottom: 16 }}
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable onPress={() => setShowAddContact(false)} style={{ flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 12, backgroundColor: c.surfaceAlt }}>
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textSecondary }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleAddContact} style={{ flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 12, backgroundColor: "#333C81" }}>
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: "#FFFFFF" }}>Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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

function ToggleRow({ title, subtitle, value, onValueChange, c }: { title: string; subtitle: string; value: boolean; onValueChange: (v: boolean) => void; c: ReturnType<typeof useThemeColors> }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 16, padding: 16, marginBottom: 20 }}>
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 14, color: c.textPrimary }}>{title}</Text>
        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary, marginTop: 2 }}>{subtitle}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: "#15803D", false: "#D6D3D1" }} thumbColor="#FFFFFF" />
    </View>
  );
}
