#!/usr/bin/env python3
"""Merge every verified result (pass 1 + pass 2) for the given states and write, per state,
<outdir>/<slug>_merged.json and <outdir>/<slug>_review.html. Also writes <outdir>/all_merged.json
(all given states together) for apply-verified-images.mjs.

usage: python3 scripts/image-campaign/build-state.py <jobdir> <outdir> "<State>" ["<State>" ...]
Env EXCLUDE_FILE (JSON {card-id: [File:Title, ...]}) drops specific files.
"""
import json, os, subprocess, sys, glob, re
jobdir, outdir, *states = sys.argv[1:]
os.makedirs(outdir, exist_ok=True)
here = os.path.dirname(os.path.abspath(__file__))
man = json.load(open(os.path.join(jobdir, "manifest.json")))
vfiles = []
for reg in ("groups.json", "pass2.json"):
    p = os.path.join(jobdir, reg)
    if os.path.exists(p):
        vfiles += [g["verifiedFile"] for g in json.load(open(p)) if os.path.exists(g["verifiedFile"])]
all_merged = []
for st in states:
    cards = []
    for m in man:
        if m["state"] == st:
            cards += json.load(open(m["cardsFile"]))
    if not cards:
        print("no cards for", st); continue
    ids = {c["id"] for c in cards}
    use = []
    for f in vfiles:
        try:
            ents = json.load(open(f))
        except Exception:
            continue
        if any(e["id"] in ids for e in ents):
            use.append(f)
    slug = re.sub(r"[^a-z0-9]+", "-", st.lower()).strip("-")
    cards_f = os.path.join(outdir, f"{slug}_cards.json")
    json.dump(cards, open(cards_f, "w"))
    merged_f = os.path.join(outdir, f"{slug}_merged.json")
    review_f = os.path.join(outdir, f"{slug}_review.html")
    label = re.sub(r"\s*\(UT\)", "", st)
    print(f"== {st}: {len(cards)} cards, {len(use)} verified files")
    subprocess.run([sys.executable, os.path.join(here, "merge-and-review.py"), label, merged_f, review_f, cards_f, *use], check=True)
    all_merged += json.load(open(merged_f))
json.dump(all_merged, open(os.path.join(outdir, "all_merged.json"), "w"), indent=1)
print("TOTAL cards", len(all_merged), "photos", sum(len(m["verified"]) for m in all_merged))
