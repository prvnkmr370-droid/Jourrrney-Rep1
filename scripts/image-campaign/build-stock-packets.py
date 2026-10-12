#!/usr/bin/env python3
"""Build verification packets for stock-photo candidates.

usage: build-stock-packets.py <stockdir> <candidates.json> <tag> [--per-group 5] [--max 12]

Joins each collected card with its identity brief, de-duplicates and caps the candidates,
and writes two packets per group: <tag>-gN-A.json and <tag>-gN-B.json (B = reversed candidate
order) for two INDEPENDENT verifiers. Writes <stockdir>/pk/index-<tag>.json.
"""
import json, os, sys, glob

d, cand_path, tag = sys.argv[1:4]
per = int(sys.argv[sys.argv.index("--per-group") + 1]) if "--per-group" in sys.argv else 5
mx = int(sys.argv[sys.argv.index("--max") + 1]) if "--max" in sys.argv else 12
briefs = {}
for f in glob.glob(os.path.join(d, "brief", "out*.json")):
    for b in json.load(open(f)):
        briefs[b["id"]] = b
cards = {c["id"]: c for c in json.load(open(os.path.join(d, "cards.json")))}
items = []
for e in json.load(open(cand_path)):
    seen, cands = set(), []
    # interleave sites so both are represented within the cap
    by = {"pexels": [], "unsplash": []}
    for c in e["candidates"]:
        if c["cdn"] in seen or "plus.unsplash.com" in c["cdn"] or "premium_photo" in c["cdn"]:
            continue
        seen.add(c["cdn"]); by.setdefault(c["site"], []).append(c)
    i = 0
    while len(cands) < mx and any(by.values()):
        for s in ("pexels", "unsplash"):
            if by.get(s) and len(cands) < mx:
                cands.append(by[s].pop(0))
    if not cands:
        continue
    b = briefs.get(e["id"], {})
    items.append({"id": e["id"], "name": e["name"], "state": e["state"], "cardText": cards.get(e["id"], {}).get("cardText", ""),
                  "brief": {k: b.get(k) for k in ("officialName", "what", "location", "visualIdentifiers", "lookalikes", "cardIssues", "confidence")},
                  "candidates": cands})
os.makedirs(os.path.join(d, "pk"), exist_ok=True)
index = []
for k in range(0, len(items), per):
    g = items[k:k + per]
    name = f"{tag}-g{k // per + 1}"
    for v in ("A", "B"):
        gg = json.loads(json.dumps(g))
        if v == "B":
            for it in gg:
                it["candidates"].reverse()
        p = os.path.join(d, "pk", f"{name}-{v}.json")
        json.dump(gg, open(p, "w"), indent=1)
    index.append({"group": name, "cards": [x["id"] for x in g],
                  "A": {"in": os.path.join(d, "pk", f"{name}-A.json"), "out": os.path.join(d, "pk", f"{name}-A_out.json")},
                  "B": {"in": os.path.join(d, "pk", f"{name}-B.json"), "out": os.path.join(d, "pk", f"{name}-B_out.json")}})
json.dump(index, open(os.path.join(d, "pk", f"index-{tag}.json"), "w"), indent=1)
print(f"{len(items)} cards, {sum(len(i['candidates']) for i in items)} candidates, {len(index)} groups")
for g in index:
    print(g["group"], len(g["cards"]), "cards")
