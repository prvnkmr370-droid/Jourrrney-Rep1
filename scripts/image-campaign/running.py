#!/usr/bin/env python3
"""Count jobs marked launched that have no result yet (skipping Haryana pass-1 groups that were
deliberately skipped), so a launcher knows how many of the 20 agent slots are free.
usage: python3 scripts/image-campaign/running.py <jobdir>
"""
import json, os, sys
jd = sys.argv[1]
l = set(json.load(open(os.path.join(jd, "launched.json"))))
run = []
for reg in ("groups.json", "pass2.json"):
    for g in json.load(open(os.path.join(jd, reg))):
        if g["name"] in l and not os.path.exists(g["verifiedFile"]):
            if reg == "groups.json" and g["name"].startswith("haryana-"):
                continue
            run.append(g["name"])
print(len(run), "running; free slots ~", max(0, 20 - len(run)))
