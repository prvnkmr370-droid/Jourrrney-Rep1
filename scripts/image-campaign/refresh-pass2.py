#!/usr/bin/env python3
"""Re-sync UNLAUNCHED pass-2 units with verified results that arrived after they were
written: drop cards that now have >= 5 photos, refresh photosNow / alreadyVerifiedTitles /
verifierNotes for the rest, and remove units that end up empty.
usage: python3 scripts/image-campaign/refresh-pass2.py <jobdir>
"""
import json, glob, os, sys
jobdir = sys.argv[1]
reg_p = os.path.join(jobdir, "pass2.json")
reg = json.load(open(reg_p))
launched = set(json.load(open(os.path.join(jobdir, "launched.json"))))
cards = {}
for f in glob.glob(os.path.join(jobdir, "chunks", "*.cards.json")):
    for c in json.load(open(f)):
        cards[c["id"]] = c
titles, notes = {}, {}
for f in glob.glob(os.path.join(jobdir, "groups", "*_verified.json")) + glob.glob(os.path.join(jobdir, "pass2", "*_verified.json")):
    try:
        for e in json.load(open(f)):
            titles.setdefault(e["id"], set()).update(v["title"] for v in e.get("verified", []))
            if e.get("note"): notes.setdefault(e["id"], []).append(e["note"])
    except Exception:
        pass
keep, dropped_cards, dropped_groups = [], 0, 0
for g in reg:
    if g["name"] in launched or os.path.exists(g["verifiedFile"]):
        keep.append(g); continue
    items = json.load(open(g["inFile"]))
    out = []
    for it in items:
        c = cards.get(it["id"])
        have = max(1, c["galleryCount"]) + len(titles.get(it["id"], ())) if c else it["photosNow"]
        if have >= 5:
            dropped_cards += 1; continue
        it["photosNow"] = have
        it["alreadyVerifiedTitles"] = sorted(titles.get(it["id"], ()))
        it["verifierNotes"] = notes.get(it["id"], [])
        out.append(it)
    if not out:
        dropped_groups += 1; continue
    json.dump(out, open(g["inFile"], "w"), indent=1)
    g["cards"] = [i["id"] for i in out]
    keep.append(g)
json.dump(keep, open(reg_p, "w"), indent=1)
print(f"dropped {dropped_cards} cards, {dropped_groups} empty units; {len(keep)} units remain")
