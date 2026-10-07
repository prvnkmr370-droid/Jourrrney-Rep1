/**
 * Turns a generated TripPlan into something small enough to keep on the device
 * and back again. The plan carries whole Destination objects (huge, and
 * already shipped inside the app), so a saved copy keeps only their ids and
 * looks them up again when it is reopened. A trip whose destination no longer
 * exists in the app's data can't be rebuilt and simply isn't shown.
 */
import { DESTINATIONS } from "@/data/destinations";
import { STYLE_CONFIGS, type TripPlan, type TripLeg } from "./data";

export type SerializedPlan = Omit<TripPlan, "destination" | "styleConfig" | "legs"> & {
  destinationId: string;
  legs?: (Omit<TripLeg, "destination"> & { destinationId: string })[];
};

export function serializePlan(plan: TripPlan): SerializedPlan {
  const { destination, styleConfig: _styleConfig, legs, ...rest } = plan;
  return {
    ...rest,
    destinationId: destination.id,
    legs: legs?.map(({ destination: legDest, ...leg }) => ({ ...leg, destinationId: legDest.id })),
  };
}

export function deserializePlan(saved: SerializedPlan): TripPlan | null {
  const { destinationId, legs, ...rest } = saved;
  const destination = DESTINATIONS.find((d) => d.id === destinationId);
  const styleConfig = STYLE_CONFIGS.find((sc) => sc.id === rest.style);
  if (!destination || !styleConfig) return null;

  let rebuiltLegs: TripLeg[] | undefined;
  if (legs) {
    rebuiltLegs = [];
    for (const { destinationId: legDestId, ...leg } of legs) {
      const legDest = DESTINATIONS.find((d) => d.id === legDestId);
      if (!legDest) return null;
      rebuiltLegs.push({ ...leg, destination: legDest });
    }
  }
  return { ...rest, destination, styleConfig, legs: rebuiltLegs };
}
