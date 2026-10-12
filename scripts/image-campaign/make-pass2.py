#!/usr/bin/env python3
"""Build second-pass work units: cards still under 5 photos after pass 1.

usage: python3 scripts/image-campaign/make-pass2.py <jobdir> [--per-group 4] [--direct "State" ...]

--direct queues EVERY card of the named states (that still has < 5 photos) straight
into second-pass units, skipping the name-only first pass. Use it for states whose
cards have generic names and no coordinates (e.g. "Hanuman Temple"), where a bare
name search only returns look-alikes elsewhere.

Reads every <jobdir>/groups/*_verified.json (pass-1 results incl. the
verifiers' "what to search next" notes) and the chunk card files, and writes
<jobdir>/pass2/<name>.json with, per weak card: id, name, state, aliases,
coords, how many photos it effectively has, titles already verified, and the
verifier notes. A pass-2 agent then writes its own place-specific searches,
runs find-commons-images.mjs, verifies the photos, and writes the verified file.
"""
import json, glob, os, sys, re

jobdir = sys.argv[1]
per = int(sys.argv[sys.argv.index("--per-group") + 1]) if "--per-group" in sys.argv else 4
out_dir = os.path.join(jobdir, "pass2"); os.makedirs(out_dir, exist_ok=True)
reg_path = os.path.join(jobdir, "pass2.json")
registry = json.load(open(reg_path)) if os.path.exists(reg_path) else []
queued = {c for g in registry for c in g["cards"]}

cards = {}
for f in glob.glob(os.path.join(jobdir, "chunks", "*.cards.json")):
    for c in json.load(open(f)):
        cards[c["id"]] = c

# what each card says about itself (tagline + start of description) so a pass-2
# agent can ground a generic name in a town/district without opening the 100k-line file
def card_texts():
    here = os.path.dirname(os.path.abspath(__file__))
    src = open(os.path.join(here, "..", "..", "src", "data", "destinations.ts"), encoding="utf8").read()
    out = {}
    for m in re.finditer(r'\n  \{\n    id: "([^"]+)",\n', src):
        blk = src[m.end(): m.end() + 2500]
        t = re.search(r'\n    tagline: "((?:[^"\\]|\\.)*)"', blk)
        d = re.search(r'\n    description: "((?:[^"\\]|\\.)*)"', blk)
        out[m.group(1)] = {"tagline": (t.group(1) if t else "")[:200], "description": (d.group(1) if d else "")[:420]}
    return out
TEXTS = card_texts()

verified, notes = {}, {}
for f in glob.glob(os.path.join(jobdir, "groups", "*_verified.json")) + glob.glob(os.path.join(jobdir, "pass2", "*_verified.json")):
    try:
        for e in json.load(open(f)):
            verified.setdefault(e["id"], []).extend(v["title"] for v in e.get("verified", []))
            if e.get("note"):
                notes.setdefault(e["id"], []).append(e["note"])
    except Exception:
        pass

direct_states = []
if "--direct" in sys.argv:
    i = sys.argv.index("--direct") + 1
    while i < len(sys.argv) and not sys.argv[i].startswith("--"):
        direct_states.append(sys.argv[i]); i += 1
for cid, c in cards.items():
    if c["state"] in direct_states and cid not in verified:
        verified[cid] = []

weak = []
for cid, titles in verified.items():
    c = cards.get(cid)
    if not c or cid in queued:
        continue
    have = max(1, c["galleryCount"]) + len(set(titles))
    if have < 5:
        weak.append({"id": cid, "name": c["name"], "state": c["state"], "aliases": c.get("aliases", []),
                     "coords": c.get("coords"), "photosNow": have, "alreadyVerifiedTitles": sorted(set(titles)),
                     "verifierNotes": notes.get(cid, []), "cardText": TEXTS.get(cid, {})})

weak.sort(key=lambda w: (w["state"], w["id"]))
made = 0
by_state = {}
for w in weak:
    by_state.setdefault(w["state"], []).append(w)
for state, items in by_state.items():
    slug = re.sub(r"[^a-z0-9]+", "-", state.lower()).strip("-")
    existing = sum(1 for g in registry if g["name"].startswith(slug + "-p2-"))
    for i in range(0, len(items), per):
        part = items[i:i + per]
        name = f"{slug}-p2-{existing + i // per + 1}"
        path = os.path.join(out_dir, name + ".json")
        json.dump(part, open(path, "w"), indent=1)
        registry.append({"name": name, "state": state, "inFile": path,
                         "verifiedFile": os.path.join(out_dir, name + "_verified.json"),
                         "cards": [p["id"] for p in part], "status": "pending"})
        made += 1
json.dump(registry, open(reg_path, "w"), indent=1)
print(f"weak cards queued: {sum(len(g['cards']) for g in registry[-made:]) if made else 0}; groups created: {made}")
