/**
 * Step router for the Plan Trip wizard: form → generating → result.
 * The form and result steps are Figma source of truth ("2.1 AI Input
 * Wizard", "2.2 Generated Itinerary — Timeline"); the generating step
 * uses Figma's "2.1.1 AI Generating — Skeleton Loading" too. Behavior
 * (the itinerary-generation algorithm) is ported from the Make prototype.
 */
import { useState } from "react";
import type { Destination } from "@/data/destinations";
import { useOriginStore } from "@/store/useOriginStore";
import { STYLE_CONFIGS, generateItinerary, getDefaultDestination, type TravelStyle, type TripPlan } from "./data";
import { tryGenerateAiItinerary } from "./aiPlan";
import FormStep from "./steps/FormStep";
import GeneratingStep from "./steps/GeneratingStep";
import ResultStep from "./steps/ResultStep";

interface Props {
  preselectedId?: string;
  onBack?: () => void;
  /** Height of the floating bottom tab bar, when shown as a tab (0 for the
   * modal/stack presentation, which has no tab bar). See FormStep's doc
   * comment for why this has to be threaded through manually. */
  tabBarHeight?: number;
}

type Step = "form" | "generating" | "result";

// Floor for how long the "Building your plan…" animation stays up — a
// real Gemini call sometimes resolves in under a second, which would make
// the loading screen feel like a glitch rather than genuine generation.
// The AI attempt and this delay run concurrently (Promise.all below), so
// this only ever adds wait time when the network is fast, never stacks on
// top of a slow one.
const MIN_GENERATE_DELAY_MS = 1400;

export default function PlanTrip({ preselectedId, onBack, tabBarHeight = 0 }: Props) {
  const [step, setStep] = useState<Step>("form");
  const [destination, setDestination] = useState<Destination>(() => getDefaultDestination(preselectedId));
  const [travelStyle, setTravelStyle] = useState<TravelStyle>("comfortable");
  const [days, setDays] = useState(4);
  const [people, setPeople] = useState(2);
  const [prefs, setPrefs] = useState<string[]>(["heritage", "food"]);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [plan, setPlan] = useState<TripPlan | null>(null);
  // Origin lives in the same shared store the "How to Reach" route planner
  // and the Search flow's Origin Prompt already use — one origin city for
  // the whole app rather than a separate copy just for this form.
  const originCity = useOriginStore((s) => s.originCity);

  const togglePref = (id: string) =>
    setPrefs((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const handleGenerate = async () => {
    setStep("generating");

    // The template plan always runs — it's the source for every field
    // besides the day-by-day itinerary and tips (cost breakdown,
    // transport/stay recommendations, booking checklist all come from
    // here regardless of whether AI planning succeeds). The AI attempt
    // and the minimum-visible-loading delay run concurrently, not
    // sequentially, so a fast Gemini response doesn't get held up waiting
    // for an unrelated UI-timing floor on top of its own latency.
    const sc = STYLE_CONFIGS.find((s) => s.id === travelStyle)!;
    const budget = destination.budgetBreakdown.find((b) => b.tier === sc.budgetTier) ?? destination.budgetBreakdown[1];
    const templatePlan = generateItinerary(destination, days, people, travelStyle, prefs, originCity, startDate);

    const [aiResult] = await Promise.all([
      tryGenerateAiItinerary(destination, sc, days, people, prefs, originCity, startDate, budget.perDayPerPerson),
      new Promise((resolve) => setTimeout(resolve, MIN_GENERATE_DELAY_MS)),
    ]);

    const finalPlan: TripPlan = aiResult
      ? {
          ...templatePlan,
          planSource: "ai",
          itinerary: aiResult.itinerary.map((day, i) => ({
            ...day,
            // stay/stayType/transport aren't AI-generated (ResultStep
            // doesn't render them per-day anyway — see its Day-by-Day
            // section) — carried over from the matching template day so
            // the type stays fully populated regardless.
            stay: templatePlan.itinerary[i]?.stay ?? templatePlan.itinerary[0].stay,
            stayType: templatePlan.itinerary[i]?.stayType ?? templatePlan.itinerary[0].stayType,
            transport: templatePlan.itinerary[i]?.transport ?? templatePlan.itinerary[0].transport,
          })),
          tips: aiResult.tips.length > 0 ? aiResult.tips : templatePlan.tips,
        }
      : templatePlan;

    setPlan(finalPlan);
    setStep("result");
  };

  if (step === "generating") {
    const sc = STYLE_CONFIGS.find((s) => s.id === travelStyle)!;
    return <GeneratingStep styleConfig={sc} />;
  }

  if (step === "result" && plan) {
    return <ResultStep plan={plan} onBack={onBack} onRebuild={() => setStep("form")} tabBarHeight={tabBarHeight} />;
  }

  return (
    <FormStep
      onBack={onBack}
      destination={destination}
      onSelectDestination={setDestination}
      style={travelStyle}
      onSelectStyle={setTravelStyle}
      days={days}
      onDaysChange={setDays}
      people={people}
      onPeopleChange={setPeople}
      prefs={prefs}
      onTogglePref={togglePref}
      startDate={startDate}
      onStartDateChange={setStartDate}
      onGenerate={handleGenerate}
      tabBarHeight={tabBarHeight}
    />
  );
}
