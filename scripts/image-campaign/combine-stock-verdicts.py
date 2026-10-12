#!/usr/bin/env python3
"""Combine two independent verifier outputs (A and B) for stock-photo candidates.

usage: combine-stock-verdicts.py <stockdir> <tag> [<tag> ...] [--min-conf 3]
A photo is kept ONLY if both verifiers accepted it with confidence >= min-conf.
Writes <stockdir>/accepted.json (list of {id, name, photos:[...]}) and prints a summary
including photos the two verifiers disagreed on.
"""
import json, os, sys

d = sys.argv[1]
args = [a for a in sys.argv[2:] if not a.startswith("--")]
minc = int(sys.argv[sys.argv.index("--min-conf") + 1]) if "--min-conf" in sys.argv else 3
tags = [t for t in args if t != str(minc)]

cands = {}
for tag in tags:
    for g in json.load(open(os.path.join(d, "pk", f"index-{tag}.json"))):
        A = json.load(open(g["A"]["in"]))
        for it in A:
            for c in it["candidates"]:
                cands[(it["id"], c["cdn"])] = (it["name"], it["state"], c)
verdict = {"A": {}, "B": {}}
missing = []
for tag in tags:
    for g in json.load(open(os.path.join(d, "pk", f"index-{tag}.json"))):
        for v in ("A", "B"):
            p = g[v]["out"]
            if not os.path.exists(p):
                missing.append(p); continue
            try:
                out = json.load(open(p))
            except Exception:
                missing.append(p + " (unreadable)"); continue
            for e in out:
                for dec in e.get("decisions", []):
                    verdict[v][(e["id"], dec["cdn"])] = dec
accepted, disagree, rejected_both = {}, [], 0
for key, (name, state, c) in cands.items():
    a, b = verdict["A"].get(key), verdict["B"].get(key)
    if not a or not b:
        continue
    ok_a = a.get("accept") and a.get("confidence", 0) >= minc
    ok_b = b.get("accept") and b.get("confidence", 0) >= minc
    if ok_a and ok_b:
        accepted.setdefault(key[0], {"id": key[0], "name": name, "state": state, "photos": []})["photos"].append(
            {**c, "confA": a["confidence"], "confB": b["confidence"], "sawA": a.get("saw"), "sawB": b.get("saw")})
    elif a.get("accept") or b.get("accept"):
        disagree.append((key[0], c["cdn"], a.get("accept"), a.get("confidence"), b.get("accept"), b.get("confidence"), a.get("saw"), b.get("saw")))
    else:
        rejected_both += 1
json.dump(list(accepted.values()), open(os.path.join(d, "accepted.json"), "w"), indent=1)
print("missing outputs:", missing)
print("candidates judged by both:", sum(1 for k in cands if k in verdict["A"] and k in verdict["B"]))
print("accepted by both:", sum(len(v["photos"]) for v in accepted.values()), "photos on", len(accepted), "cards")
print("split decisions (one accepted, other rejected / low confidence):", len(disagree))
print("rejected by both:", rejected_both)
for x in disagree[:40]:
    print("  SPLIT", x[0], x[1].split("/")[-1], "A:", x[2], x[3], "B:", x[4], x[5])
