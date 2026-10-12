#!/usr/bin/env python3
"""Third-pass work queue: list groups that have no result and are not launched; optionally mark them.
usage: python3 scripts/image-campaign/next-third.py <thirddir> [--max N] [--mark] [--status]
"""
import json, os, sys
d = sys.argv[1]
mx = int(sys.argv[sys.argv.index("--max") + 1]) if "--max" in sys.argv else 99
reg = json.load(open(os.path.join(d, "groups.json")))
lp = os.path.join(d, "launched.json")
launched = set(json.load(open(lp))) if os.path.exists(lp) else set()
done = [g for g in reg if os.path.exists(g["out"])]
running = [g for g in reg if g["name"] in launched and not os.path.exists(g["out"])]
todo = [g for g in reg if g["name"] not in launched and not os.path.exists(g["out"])][:mx]
if "--status" in sys.argv:
    print(f"groups {len(reg)}: done {len(done)}, running/launched {len(running)}, queued {len([g for g in reg if g['name'] not in launched and not os.path.exists(g['out'])])}")
    sys.exit()
for g in todo:
    print(g["name"])
if "--mark" in sys.argv:
    launched.update(g["name"] for g in todo)
    json.dump(sorted(launched), open(lp, "w"))
print(f"-- {len(todo)} listed; done {len(done)}, running {len(running)}, total {len(reg)}")
