# Gateways: nearest airport, railway station and bus station

The Fly / Train / Bus tabs on a destination page ("How to get there") are driven by
`src/data/gateways.ts`. A place only gets the new tabs once it has an entry there; every other
place keeps the older "From my city" card. That is on purpose: a card that says **nearest** has to
be right, and the older route data is not (it points 328 places at one airport, for example).

## Adding more places

1. **Find candidates** from open data (no keys needed; takes about 15 seconds a place):

   ```bash
   node scripts/gateways/find-candidates.mjs hampi coorg munnar
   ```

   It writes `scripts/gateways/out/candidates.json` (not committed). It only works for places that have
   a map position in `src/data/destinationCoords.ts` or `destinationCoordsGeocoded.ts`.
   Sources: OurAirports (airports), Wikidata (railway stations with an Indian Railways code),
   OpenStreetMap through Nominatim (bus stations), and OSRM (road distance).

2. **Check every candidate by hand** against current sources. The candidates are only a starting point:
   - OurAirports' "scheduled service" flag is often stale. Confirm each airport really has passenger
     flights now (airline route pages, Airports Authority of India, the airport's own site).
   - The railway list includes tiny halts. Pick the nearest station where regular trains stop, and the
     best-connected junction. Confirm the station code.
   - OpenStreetMap knows few Indian bus stations. Name the main one people use, and who runs it. Only list
     "buses from here go to" places a source confirms. Leave `bus: []` rather than guess.
   - The routing service's drive times are too optimistic for India: multiply by about 1.5 (about 1.8 in the hills).

3. **Add the entry** to `GATEWAYS` in `src/data/gateways.ts` (the interfaces there explain every field), then run:

   ```bash
   node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/gateways/check-gateways.mjs
   ```

   It catches slips (unknown place, bad codes, impossible drive times, hubs not nearest-first, a bus website
   that isn't https). It cannot tell whether an entry is *true*; only checking the sources can.

## Rules

- Honesty beats completeness. No entry is better than a wrong one: the place just keeps the older card.
- A place with no railway nearby sets `railNone`; the nearest railhead goes in `rail[0]`.
- `checked` is the month a person last checked the entry ("Oct 2026"). Re-check about once a year:
  airlines come and go, and small airports gain and lose flights.
