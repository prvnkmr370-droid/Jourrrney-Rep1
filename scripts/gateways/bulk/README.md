# Gateways for every place, worked out from open data

`src/data/gatewaysBulk.ts` (generated, do not edit by hand) holds the nearest airport, railway station
and bus station for the places nobody has reviewed one by one. The 20 places in `src/data/gateways.ts`
are checked by a person and always win. Generated entries show a plain warning in the app
("worked out from open map, railway and airport data ... please check before you travel").

## What goes in, and how far each source is trusted

| Part | Source | Checked how |
| --- | --- | --- |
| Where the place is | OpenStreetMap search (`geocode.py`), Photon (`photon_pass.py`), Wikidata (`wikidata_pass.py`), the older approximate list | A result is accepted only if it is in the **same state** as the place and shares a distinctive word with its name (`positions.mjs`). Area outlines and disagreeing answers are dropped. Places with no trustworthy position get no generated entry. |
| Airports | OurAirports + Wikipedia's AAI passenger table (`traffic.py`) | The 117 airports outside the traffic table were each checked for scheduled flights **now** against airline, airport and news sources. A third of OurAirports' "scheduled" flags were stale. |
| Railway stations | Datameet stations + 2016 timetable (used only to count trains) | Codes cross-checked with Wikidata's current Indian Railways codes. Known renames are mapped (Mughal Sarai to DDU, Allahabad to PRYJ, ...). Codes Wikidata does not know are listed and checked by hand before use (`station_fixes.json`). |
| Bus stations | OpenStreetMap `amenity=bus_station` | Names only. Who runs the buses is not known, so the badge is left off; the state corporation's booking site is offered from a per-state table. |
| Road distance | OSRM public server | Times are scaled for Indian roads: x1.5, or x1.8 where the routing speed is under 40 km/h. |

## Rules the picker follows (`pick.mjs`)

- **Airport**: the nearest by road with scheduled flights; plus another airport about as near, the nearest "more flights" airport, and a big hub within reach (three at most).
- **Station**: the nearest by road, unless a clearly better connected one is about as near; plus the nearest junction or hub, the nearest well-served station, and a close second (three at most). Cabins, sidings, closed and unopened stations are left out.
- **Bus**: the nearest named bus station within 30 km by road (travel agents, depots, route labels, "bus stops" and taxi stands are filtered out); otherwise the nearest bigger town.
- More than 100 km from a station means "no railway close by", with the nearest railhead shown.
- It was tested against the 20 reviewed places: the first airport agrees in most cases, and the differences are small stations at similar distances.

## What was found when the result was audited (28 Oct 2026)

Two rounds of 36 random generated cards were checked by independent readers against web sources.
Round 1 (before the safeguards below): 2 correct, 19 acceptable, 15 wrong. Round 2: 9 correct, 19 acceptable, 8 wrong
(airports right in 33 of 36; stations wrong in 5; bus stands wrong in 6 and unverifiable in 8). "Acceptable" mostly
means a real hub is missing (OpenStreetMap lists few bus stations in the north-east, for example), not that a wrong one is shown.
Safeguards that came out of it: a position is kept only if two independent sources agree (or the card's own
"X km from Y" distances support it); stations Wikidata calls unopened or closed are left out; station
positions come from Wikidata when the old dataset disagrees by over 3 km; cabins, sidings and bus "stops" are filtered;
roads shorter than the straight line, or far longer than it, are rejected (islands).
A few more problems found after round 2 were fixed but not re-measured. Known weak spots: the router shortens some
long remote roads (Dholavira), tiny halts can still be shown as "nearest station", and bus stations are thin in the north-east.

## Re-running (about once a year, airlines and stations change)

```bash
python3 -I geocode.py places.json out/                     # OpenStreetMap search, one request a second
WD_IDS=ids.json python3 -I wikidata_pass.py places.json out/   # Wikidata, for places without a second source
node geonames-pass.mjs <geonames-dir> out/places.json out/geonames_cache.jsonl
node registries.mjs <open-data-dir> out out/registries.json
node positions2.mjs out out/positions_v2.json              # trust a position only when sources agree
node consistency.mjs out/positions_v2.json out/consistency.json
node final-positions.mjs out/positions_v2.json out/consistency.json out/positions_final.json
node pick.mjs out/registries.json out/positions_final.json out     # road distances, cached
node write-bulk.mjs out out/positions_final.json data/state-bus.json <app-root> --write
node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON ../check-gateways.mjs
```

`places.json` is the list of destinations with their old positions (id, name, state, src, coord); `data/` holds the
inputs that were researched by people or research passes: `airports_verified.json` (flights now, per airport),
`state-bus.json` (each state's bus corporation and booking site), `station_fixes.json` (station codes checked by hand),
`traffic.json` (AAI passenger numbers). Photon (photon.komoot.io) blocked this machine after parallel use: go slowly.
