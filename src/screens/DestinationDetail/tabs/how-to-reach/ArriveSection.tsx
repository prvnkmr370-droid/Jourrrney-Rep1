import { useState } from "react";
import { View, Text, Pressable, TextInput, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { Navigation, Zap, Compass as CompassIcon, Clock, Plus, X, Map as MapIcon } from "lucide-react-native";
import { DESTINATIONS, type Destination } from "@/data/destinations";
import type { JourneyGuide } from "@/data/journeyGuides";
import { useOriginStore } from "@/store/useOriginStore";
import { useThemeColors } from "@/theme/useThemeColors";
import { useDetectLocation } from "@/hooks/useDetectLocation";
import { useCitySearch, formatCitySuggestion } from "@/hooks/useCitySearch";
import LocationPickerModal from "@/components/LocationPickerModal";
import { Card, SectionLabel, Callout, NumberBadge, rgba } from "./shared";

interface Props {
  destination: Destination;
  guide?: JourneyGuide;
}

export default function ArriveSection({ destination: d, guide }: Props) {
  const c = useThemeColors();
  const originCity = useOriginStore((s) => s.originCity);
  const setOriginCity = useOriginStore((s) => s.setOriginCity);
  const [sourceCity, setSourceCity] = useState(originCity);
  const [selectedTransport, setSelectedTransport] = useState(0);
  const { locating, detect } = useDetectLocation();
  const [searchFocused, setSearchFocused] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const { suggestions } = useCitySearch(sourceCity);
  const showSuggestions = searchFocused && suggestions.length > 0;

  const pickSuggestion = (label: string) => {
    setSourceCity(label);
    setOriginCity(label);
    setSearchFocused(false);
  };

  const pickFromMap = (label: string) => {
    setSourceCity(label);
    setOriginCity(label);
    setShowMapPicker(false);
  };

  // Waypoints between the origin and this destination — kept local to the
  // screen for now (not a shared store) since it's scoped to planning
  // this one trip. This is groundwork for a future multi-stop routing
  // map; there's no map view yet, just the ability to build the stop
  // list a map feature would eventually read.
  const [stops, setStops] = useState<Destination[]>([]);
  const [showStopPicker, setShowStopPicker] = useState(false);
  const addStop = (stop: Destination) => {
    setStops((prev) => [...prev, stop]);
    setShowStopPicker(false);
  };
  const removeStop = (id: string) => setStops((prev) => prev.filter((s) => s.id !== id));
  const availableStops = DESTINATIONS.filter((dest) => dest.id !== d.id && !stops.find((s) => s.id === dest.id));

  const detectLocation = async () => {
    const city = await detect();
    if (city) {
      setSourceCity(city);
      setOriginCity(city);
    }
  };

  const selected = d.transport[selectedTransport];

  return (
    <View style={{ gap: 16 }}>
      {/* Route planner */}
      <Card borderColor={c.primary}>
        <View style={{ padding: 16, backgroundColor: rgba(c.primary, 0.06) }}>
          <SectionLabel color={c.primary}>Plan Your Route</SectionLabel>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: showSuggestions ? 0 : 10 }}>
            <TextInput
              value={sourceCity}
              onChangeText={setSourceCity}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search any city — e.g. Hyderabad"
              placeholderTextColor={c.textMuted}
              style={{
                flex: 1, backgroundColor: c.surfaceAlt, borderRadius: 12, height: 44, paddingHorizontal: 14,
                fontFamily: "Poppins_400Regular", fontSize: 13, color: c.textPrimary,
              }}
            />
            <Pressable
              onPress={detectLocation}
              disabled={locating}
              style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: rgba(c.primary, 0.12), alignItems: "center", justifyContent: "center" }}
            >
              {locating ? <ActivityIndicator color={c.primary} size="small" /> : <Navigation color={c.primary} size={16} />}
            </Pressable>
            <Pressable
              onPress={() => setShowMapPicker(true)}
              style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: rgba(c.primary, 0.12), alignItems: "center", justifyContent: "center" }}
            >
              <MapIcon color={c.primary} size={16} />
            </Pressable>
          </View>

          {/* Live search results — tapping one sets both the visible field
              and the shared origin city, same as detecting location does. */}
          {showSuggestions && (
            <View style={{ backgroundColor: c.surface, borderRadius: 12, borderWidth: 1, borderColor: c.border, marginBottom: 10, overflow: "hidden" }}>
              {suggestions.map((s, i) => {
                const label = formatCitySuggestion(s);
                return (
                  <Pressable
                    key={s.id}
                    // onPressIn fires before the TextInput's onBlur closes
                    // this list — onPress alone would never get a chance to
                    // fire, since the field loses focus (and hides this
                    // list) first.
                    onPressIn={() => pickSuggestion(label)}
                    style={{ paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: i > 0 ? 1 : 0, borderTopColor: c.borderSoft }}
                  >
                    <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, color: c.textPrimary }}>{s.name}</Text>
                    {(s.admin1 || s.country) && (
                      <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary, marginTop: 1 }}>
                        {[s.admin1, s.country].filter(Boolean).join(", ")}
                      </Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Waypoints — additional places to visit along the way */}
          {stops.length > 0 && (
            <View style={{ gap: 8, marginBottom: 10 }}>
              {stops.map((stop, i) => (
                <View
                  key={stop.id}
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 8, height: 44, borderRadius: 12,
                    paddingHorizontal: 14, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border,
                  }}
                >
                  <Text style={{ fontSize: 12, color: c.textSecondary, fontFamily: "Poppins_700Bold" }}>{i + 1}</Text>
                  <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, color: c.textPrimary, flex: 1 }}>
                    {stop.name}, {stop.state}
                  </Text>
                  <Pressable onPress={() => removeStop(stop.id)} hitSlop={8}>
                    <X color={c.textMuted} size={16} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          <View
            style={{
              flexDirection: "row", alignItems: "center", gap: 8, height: 44, borderRadius: 12,
              paddingHorizontal: 14, backgroundColor: rgba(c.primary, 0.08), borderWidth: 1, borderColor: rgba(c.primary, 0.2),
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 14 }}>🏁</Text>
            <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 13, color: c.textPrimary, flex: 1 }}>
              {d.name}, {d.state}
            </Text>
          </View>

          {showStopPicker ? (
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {availableStops.map((dest) => (
                  <Pressable
                    key={dest.id}
                    onPress={() => addStop(dest)}
                    style={{ width: 90, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: c.border }}
                  >
                    <Image source={{ uri: dest.image }} style={{ width: "100%", height: 60 }} contentFit="cover" />
                    <View style={{ padding: 6, backgroundColor: c.surface }}>
                      <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 10, color: c.textPrimary }} numberOfLines={1}>
                        {dest.name}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </View>
              <Pressable onPress={() => setShowStopPicker(false)} style={{ alignSelf: "flex-start" }}>
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: c.textSecondary }}>Cancel</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => setShowStopPicker(true)}
              style={{
                flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 40, borderRadius: 12,
                borderWidth: 1.5, borderColor: rgba(c.primary, 0.35), borderStyle: "dashed",
              }}
            >
              <Plus color={c.primary} size={14} />
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: c.primary }}>Add a stop along the way</Text>
            </Pressable>
          )}
        </View>
      </Card>

      {sourceCity.trim().length > 0 && (
        <>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: c.textSecondary, textAlign: "center" }}>
            {[sourceCity, ...stops.map((s) => s.name), d.name].join(" → ")}
          </Text>

          {/* Transport mode chips */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {d.transport.map((t, i) => {
              const active = selectedTransport === i;
              return (
                <Pressable
                  key={t.mode}
                  onPress={() => setSelectedTransport(i)}
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14,
                    backgroundColor: active ? rgba(c.primary, 0.15) : c.surface,
                    borderWidth: 1.5, borderColor: active ? c.primary : c.border,
                  }}
                >
                  <Text style={{ fontSize: 15 }}>{t.icon}</Text>
                  <View>
                    <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: active ? c.primary : c.textPrimary }}>{t.mode}</Text>
                    <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 10, color: active ? c.primary : c.textSecondary }}>{t.costRange}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Selected transport detail */}
          {selected && (
            <Card>
              <View style={{ padding: 16, backgroundColor: rgba(c.teal, 0.06), borderBottomWidth: 1, borderBottomColor: c.border }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 15, color: c.textPrimary }}>{selected.mode}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Clock color={c.textSecondary} size={12} />
                    <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: c.textSecondary }}>{selected.duration}</Text>
                  </View>
                </View>

                <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: c.textSecondary, marginBottom: 8 }}>
                  Typical routes from major cities:
                </Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {[
                    { from: "Delhi", info: selected.fromDelhi },
                    { from: "Mumbai", info: selected.fromMumbai },
                    { from: "Bengaluru", info: selected.fromBangalore },
                  ]
                    .filter((r) => r.info && r.info !== "—")
                    .map((r) => (
                      <View key={r.from} style={{ flex: 1, backgroundColor: rgba(c.teal, 0.1), borderRadius: 10, padding: 8, alignItems: "center" }}>
                        <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 10, color: c.teal, marginBottom: 2 }}>{r.from}</Text>
                        <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 10, color: c.textPrimary, textAlign: "center" }}>{r.info}</Text>
                      </View>
                    ))}
                </View>
              </View>
              <View style={{ padding: 14 }}>
                <Callout icon="💡" text={selected.tips} bg={rgba(c.gold, 0.1)} />
              </View>
            </Card>
          )}
        </>
      )}

      {guide ? (
        <>
          {/* First hour */}
          <Card>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderBottomWidth: 1, borderBottomColor: c.border }}>
              <Zap color={c.primary} size={16} />
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary }}>Your First Hour in {d.name}</Text>
            </View>
            <View style={{ padding: 14, gap: 12 }}>
              {guide.firstThingsToDo.map((step, i) => (
                <View key={step} style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
                  <NumberBadge n={i + 1} color={i === 0 ? "#333C81" : "#0D5C63"} />
                  <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18, color: c.textPrimary, flex: 1 }}>{step}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Last-mile arrival points */}
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Navigation color={c.teal} size={16} />
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary }}>Last-Mile to Your Stay</Text>
            </View>
            <View style={{ gap: 12 }}>
              {guide.arrivalPoints.map((ap) => (
                <Card key={ap.name}>
                  <View style={{ padding: 14, backgroundColor: rgba(c.teal, 0.08), borderBottomWidth: 1, borderBottomColor: c.border }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <Text style={{ fontSize: 17 }}>{ap.icon}</Text>
                      <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary }}>{ap.by}</Text>
                    </View>
                    <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: c.teal }}>{ap.name}</Text>
                    <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>{ap.distanceFromCity}</Text>
                  </View>
                  <View style={{ padding: 12, gap: 10 }}>
                    {ap.toAccommodation.map((step) => (
                      <View key={step.step} style={{ flexDirection: "row", gap: 10 }}>
                        <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: c.surfaceAlt, alignItems: "center", justifyContent: "center" }}>
                          <Text style={{ fontSize: 12 }}>{step.icon}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11.5, color: c.textPrimary, marginBottom: 3 }}>{step.action}</Text>
                          <View style={{ flexDirection: "row", gap: 10, marginBottom: 4 }}>
                            <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 11, color: c.primary }}>{step.cost}</Text>
                            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 11, color: c.textSecondary }}>{step.duration}</Text>
                          </View>
                          <Callout icon="💡" text={step.tip} bg={rgba(c.gold, 0.1)} />
                        </View>
                      </View>
                    ))}
                  </View>
                </Card>
              ))}
            </View>
          </View>

          {/* City to sight */}
          <View style={{ backgroundColor: rgba(c.teal, 0.1), borderWidth: 1, borderColor: rgba(c.teal, 0.25), borderRadius: 16, padding: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <CompassIcon color={c.teal} size={16} />
              <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.teal }}>City → Main Attraction</Text>
            </View>
            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 12, lineHeight: 18, color: c.textPrimary }}>{guide.fromCityToSight}</Text>
          </View>
        </>
      ) : (
        <View style={{ backgroundColor: c.surfaceAlt, borderRadius: 16, padding: 16 }}>
          <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 13, color: c.textPrimary, marginBottom: 10 }}>
            Local Transport at {d.name}
          </Text>
          <View style={{ gap: 8 }}>
            {d.localTransport.map((lt) => (
              <View key={lt.mode} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ fontFamily: "Poppins_500Medium", fontSize: 12, color: c.textPrimary }}>{lt.mode}</Text>
                <Text style={{ fontFamily: "Poppins_700Bold", fontSize: 12, color: c.primary }}>{lt.cost}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <LocationPickerModal visible={showMapPicker} onClose={() => setShowMapPicker(false)} onConfirm={pickFromMap} />
    </View>
  );
}
