#!/usr/bin/env python3
"""Per-state progress: chunks searched, pass-1 groups verified, pass-2 groups, weak cards left.
usage: python3 scripts/image-campaign/state-status.py <jobdir>
"""
import json, os, sys, glob, collections
jobdir = sys.argv[1]
man = json.load(open(os.path.join(jobdir, "manifest.json")))
groups = json.load(open(os.path.join(jobdir, "groups.json"))) if os.path.exists(os.path.join(jobdir, "groups.json")) else []
p2 = json.load(open(os.path.join(jobdir, "pass2.json"))) if os.path.exists(os.path.join(jobdir, "pass2.json")) else []
cards = {}
for f in glob.glob(os.path.join(jobdir, "chunks", "*.cards.json")):
    for c in json.load(open(f)): cards[c["id"]] = c
ver = collections.defaultdict(set)
for f in glob.glob(os.path.join(jobdir, "groups", "*_verified.json")) + glob.glob(os.path.join(jobdir, "pass2", "*_verified.json")):
    try:
        for e in json.load(open(f)): ver[e["id"]].update(v["title"] for v in e.get("verified", []))
    except Exception: pass
rows = collections.OrderedDict()
for m in man:
    r = rows.setdefault(m["state"], {"chunks": 0, "searched": 0, "g": 0, "gdone": 0, "p2": 0, "p2done": 0, "weak": 0, "cards": 0})
    r["chunks"] += 1; r["searched"] += os.path.exists(m["candidatesFile"])
for g in groups:
    r = rows.setdefault(g["state"], {"chunks": 0, "searched": 0, "g": 0, "gdone": 0, "p2": 0, "p2done": 0, "weak": 0, "cards": 0}); r["g"] += 1; r["gdone"] += os.path.exists(g["verifiedFile"])
for g in p2:
    r = rows.setdefault(g["state"], {"chunks": 0, "searched": 0, "g": 0, "gdone": 0, "p2": 0, "p2done": 0, "weak": 0, "cards": 0}); r["p2"] += 1; r["p2done"] += os.path.exists(g["verifiedFile"])
for cid, c in cards.items():
    st = next((s for s in rows if s.replace(" (UT)", "").replace("&", "and") == c["state"] or s == c["state"]), None)
    if st is None: continue
    rows[st]["cards"] += 1
    if max(1, c["galleryCount"]) + len(ver.get(cid, ())) < 5 and cid in ver: rows[st]["weak"] += 1
print(f"{'state':32s} chunks  pass1   pass2   weak/cards")
for s, r in rows.items():
    print(f"{s:32s} {r['searched']}/{r['chunks']:<5} {r['gdone']}/{r['g']:<6} {r['p2done']}/{r['p2']:<6} {r['weak']}/{r['cards']}")
