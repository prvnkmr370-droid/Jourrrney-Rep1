#!/usr/bin/env python3
"""Plan the photo campaign for every state that has not been done yet.

usage: python3 scripts/image-campaign/plan-jobs.py <jobdir> [--skip "State A" "State B" ...]

For each state it takes every card that has fewer than 5 gallery photos, writes
them in chunks of <= CHUNK cards to <jobdir>/chunks/<slug>-<n>.cards.json (the
input find-commons-images.mjs expects), and writes <jobdir>/manifest.json with
one entry per chunk so progress can be resumed after an interruption.
"""
import json, re, sys, os, collections

jobdir = sys.argv[1]
skip = set()
if "--skip" in sys.argv:
    skip = set(sys.argv[sys.argv.index("--skip") + 1:])
CHUNK = 20
os.makedirs(os.path.join(jobdir, "chunks"), exist_ok=True)

src = open("src/data/destinations.ts").read()
coords = {}
for f in ["src/data/destinationCoords.ts", "src/data/destinationCoordsGeocoded.ts"]:
    t = open(f).read()
    for m in re.finditer(r'["\']?([a-z0-9][a-z0-9\-]*)["\']?\s*:\s*\{[^{}]*?lat(?:itude)?\s*:\s*(-?[0-9.]+)[^{}]*?(?:lng|lon|longitude)\s*:\s*(-?[0-9.]+)', t):
        coords[m.group(1)] = [float(m.group(2)), float(m.group(3))]

starts = [m.start() for m in re.finditer(r'\n  \{\n    id: "', src)] + [len(src)]
by_state = collections.OrderedDict()
for a, b in zip(starts, starts[1:]):
    blk = src[a:b]
    g = lambda k: (re.search(r'\n    %s: "([^"]*)"' % k, blk) or [None, None])[1]
    id_ = re.search(r'id: "([^"]+)"', blk).group(1)
    state = g("state")
    gal = re.search(r"\n    gallery: \[([^\]]*)\]", blk)
    gal_urls = re.findall(r'"(https?://[^"]+)"', gal.group(1)) if gal else []
    al = re.search(r"\n    aliases: \[([^\]]*)\]", blk)
    existing = [u for u in [g("image"), g("heroImage")] + gal_urls if u]
    by_state.setdefault(state, []).append({
        "id": id_, "name": g("name"),
        "aliases": re.findall(r'"([^"]+)"', al.group(1)) if al else [],
        "coords": coords.get(id_), "existing": existing, "galleryCount": len(gal_urls),
    })

manifest = []
for state, cards in sorted(by_state.items()):
    if state in skip:
        continue
    clean = re.sub(r"\s*\(UT\)\s*", "", state).replace("&", "and").strip()
    need = [dict(c, state=clean) for c in cards if c["galleryCount"] < 5]
    slug = re.sub(r"[^a-z0-9]+", "-", clean.lower()).strip("-")
    for i in range(0, len(need), CHUNK):
        part = need[i:i + CHUNK]
        n = i // CHUNK + 1
        path = os.path.join(jobdir, "chunks", f"{slug}-{n}.cards.json")
        json.dump(part, open(path, "w"), indent=1)
        manifest.append({"state": state, "slug": slug, "chunk": n, "cards": len(part),
                         "cardsFile": path, "candidatesFile": path.replace(".cards.json", ".candidates.json"),
                         "status": "planned"})
    print(f"{state:34s} cards {len(cards):4d} | need photos {len(need):4d} | skipped (>=5): {len(cards)-len(need)}")
json.dump(manifest, open(os.path.join(jobdir, "manifest.json"), "w"), indent=1)
print("chunks:", len(manifest), "| cards:", sum(m["cards"] for m in manifest))
