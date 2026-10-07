/**
 * Plan My Trip opened from a destination card (app/(tabs)/plan/[destId].tsx)
 * deliberately starts over every time it loses focus. Opening one of the plan's
 * own stop cards also moves focus away, but the traveller is about to come
 * straight back, so that one case must keep the plan. ResultStep raises this
 * flag right before navigating; the route reads it when focus is lost.
 */
let hold = false;

export function holdPlanSession(): void {
  hold = true;
}

export function releasePlanSession(): void {
  hold = false;
}

export function isPlanSessionHeld(): boolean {
  return hold;
}
