#!/usr/bin/env python3
"""Turn searched chunks into verification groups of a few cards each.

usage: python3 scripts/image-campaign/make-groups.py <jobdir> [--per-group 5] [--pass 1|2]

pass 1 uses the 10 best-ranked candidates per card; pass 2 uses ranks 11-20 and
only cards that still have < 5 verified photos after pass 1 (verified results
are read from <jobdir>/groups/*_verified.json). Writes <jobdir>/groups/<name>.json
and appends them to <jobdir>/groups.json (the registry). Idempotent: a chunk's
pass-N groups are created once.
"""
import json, os, sys, glob

jobdir = sys.argv[1]
per = int(sys.argv[sys.argv.index("--per-group") + 1]) if "--per-group" in sys.argv else 5
pass_no = int(sys.argv[sys.argv.index("--pass") + 1]) if "--pass" in sys.argv else 1
lo, hi = (0, 10) if pass_no == 1 else (10, 20)
gdir = os.path.join(jobdir, "groups"); os.makedirs(gdir, exist_ok=True)
reg_path = os.path.join(jobdir, "groups.json")
registry = json.load(open(reg_path)) if os.path.exists(reg_path) else []
have = {g["name"] for g in registry}
manifest = json.load(open(os.path.join(jobdir, "manifest.json")))

# titles already verified (any pass) and per-card verified counts
verified_titles, verified_count = {}, {}
for f in glob.glob(os.path.join(gdir, "*_verified.json")):
    try:
        for e in json.load(open(f)):
            verified_count[e["id"]] = verified_count.get(e["id"], 0) + len(e.get("verified", []))
            verified_titles.setdefault(e["id"], set()).update(v["title"] for v in e.get("verified", []))
    except Exception:
        pass

made = 0
for m in manifest:
    if not os.path.exists(m["candidatesFile"]):
        continue
    cands = {c["id"]: c for c in json.load(open(m["candidatesFile"]))}
    cards = {c["id"]: c for c in json.load(open(m["cardsFile"]))}
    items = []
    for cid, c in cands.items():
        if pass_no == 2 and (verified_count.get(cid, 0) + cards[cid]["galleryCount"] >= 5 or verified_count.get(cid, 0) >= 5):
            continue
        sel = [x for x in c["candidates"][lo:hi] if x["title"] not in verified_titles.get(cid, set())]
        if not sel:
            continue
        ci = cards[cid]
        items.append({"id": cid, "name": c["name"], "state": ci["state"] + ", India", "coords": ci.get("coords"),
                      "alreadyOnCard": len(ci["existing"]), "candidates": sel})
    for i in range(0, len(items), per):
        part = items[i:i + per]
        name = f"{m['slug']}-{m['chunk']}-p{pass_no}-{i // per + 1}"
        if name in have:
            continue
        path = os.path.join(gdir, name + ".json")
        json.dump(part, open(path, "w"), indent=1)
        registry.append({"name": name, "state": m["state"], "pass": pass_no, "groupFile": path,
                         "verifiedFile": os.path.join(gdir, name + "_verified.json"), "cards": [p["id"] for p in part],
                         "status": "pending"})
        made += 1
json.dump(registry, open(reg_path, "w"), indent=1)
print(f"created {made} groups; registry now {len(registry)}")
