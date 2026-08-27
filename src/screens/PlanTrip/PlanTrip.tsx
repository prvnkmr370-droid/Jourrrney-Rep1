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

const GENERATE_DELAY_MS = 2200;

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

  const handleGenerate = () => {
    setStep("generating");
    setTimeout(() => {
      setPlan(generateItinerary(destination, days, people, travelStyle, prefs, originCity, startDate));
      setStep("result");
    }, GENERATE_DELAY_MS);
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
