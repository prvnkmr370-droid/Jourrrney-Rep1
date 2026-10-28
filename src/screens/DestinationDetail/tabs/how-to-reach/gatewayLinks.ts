/**
 * Where "Look up flights / trains / buses" sends a person. Jourrrney doesn't sell
 * tickets, so these only open another site (or copy the route). Kept as plain
 * functions with no React so they are easy to check.
 */
export type GatewayMode = "air" | "rail" | "bus";

export interface LookUpOption {
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

/** The few words a person types into a ticket site: "Chennai → VDY". */
export function routeText(origin: string, hubLabel: string): string {
  return `${origin} → ${hubLabel}`;
}

/** The sites offered for each kind of ticket. `hub.label` is the code (VDY, HPT) or, for buses, the station or town name. */
export function lookUpOptions(mode: GatewayMode, origin: string, hub: { label: string; bookingUrl?: string; operatorName?: string }): LookUpOption[] {
  if (mode === "air") {
    return [
      {
        id: "google-flights",
        title: "Google Flights",
        subtitle: "Compare many airlines, with your search ready",
        url: `https://www.google.com/travel/flights?q=${encodeURIComponent(`Flights from ${origin} to ${hub.label}`)}`,
      },
      { id: "makemytrip", title: "MakeMyTrip", subtitle: "Indian airlines and offers", url: "https://www.makemytrip.com/flights/" },
    ];
  }
  if (mode === "rail") {
    return [{ id: "irctc", title: "IRCTC", subtitle: "The official Indian Railways site and app", url: "https://www.irctc.co.in/nget/train-search" }];
  }
  const options: LookUpOption[] = [];
  if (hub.bookingUrl) {
    options.push({ id: "state-bus", title: hub.operatorName ? `${hub.operatorName} (official)` : "The state bus website", subtitle: "Government buses, booked with the corporation itself", url: hub.bookingUrl });
  }
  options.push({ id: "redbus", title: "redBus", subtitle: "Government and private buses in one place", url: "https://www.redbus.in/" });
  return options;
}
