#!/usr/bin/env python3
"""List verification/pass-2 jobs that have no result and have not been handed to
an agent yet; optionally mark them as launched.

usage: python3 scripts/image-campaign/next-work.py <jobdir> [--max N] [--kind verify|pass2] [--skip-prefix a,b] [--mark]
Run make-groups.py and make-pass2.py first so new chunks/weak cards are queued.
"""
import json, os, sys

jobdir = sys.argv[1]
mx = int(sys.argv[sys.argv.index("--max") + 1]) if "--max" in sys.argv else 99
mark = "--mark" in sys.argv
kind_f = sys.argv[sys.argv.index("--kind") + 1] if "--kind" in sys.argv else None
skip = sys.argv[sys.argv.index("--skip-prefix") + 1].split(",") if "--skip-prefix" in sys.argv else []
lp = os.path.join(jobdir, "launched.json")
launched = set(json.load(open(lp))) if os.path.exists(lp) else set()

jobs = []
g = os.path.join(jobdir, "groups.json")
if os.path.exists(g):
    for x in json.load(open(g)):
        jobs.append(("verify", x["name"], x["groupFile"], x["verifiedFile"], x["state"], len(x["cards"])))
p = os.path.join(jobdir, "pass2.json")
if os.path.exists(p):
    for x in json.load(open(p)):
        jobs.append(("pass2", x["name"], x["inFile"], x["verifiedFile"], x["state"], len(x["cards"])))

todo = [j for j in jobs if not os.path.exists(j[3]) and j[1] not in launched and (kind_f is None or j[0] == kind_f) and not any(j[1].startswith(x) for x in skip)][:mx]
for kind, name, inf, outf, state, n in todo:
    print(f"{kind}|{name}|{state}|{n}")
    print(f"  IN : {inf}\n  OUT: {outf}")
if mark:
    launched.update(j[1] for j in todo)
    json.dump(sorted(launched), open(lp, "w"))
print(f"-- {len(todo)} job(s) listed; total jobs {len(jobs)}, with results {sum(1 for j in jobs if os.path.exists(j[3]))}")
