#!/usr/bin/env python3
"""Remove already-applied photos from cards (gallery + photo-credits.json).
usage: python3 scripts/image-campaign/unapply.py <exclude.json>   # {card-id: ["File:Title.jpg", ...]}
Afterwards run: node scripts/apply-verified-images.mjs <empty.json>   (regenerates photoCredits.ts)
"""
import json, re, sys, urllib.parse
ex = json.load(open(sys.argv[1]))
dest = "src/data/destinations.ts"
src = open(dest, encoding="utf8").read()
creds_p = "scripts/data/photo-credits.json"
creds = json.load(open(creds_p))
removed = 0
def key(u):
    parts = urllib.parse.urlparse(u).path.split("/")
    raw = parts[parts.index("thumb") + 3] if "thumb" in parts else parts[-1]
    return urllib.parse.unquote(raw).replace("_", " ").lower()
for cid, titles in ex.items():
    want = {t.replace("File:", "").replace("_", " ").lower() for t in titles}
    m = re.search(r'\n  \{\n    id: "%s",\n' % re.escape(cid), src)
    if not m: continue
    start = m.start()
    nxt = src.find('\n  {\n    id: "', m.end())
    block = src[start: nxt if nxt > 0 else len(src)]
    g = re.search(r'\n    gallery: \[([^\]]*)\],', block)
    if g:
        urls = re.findall(r'"([^"]+)"', g.group(1))
        keep = [u for u in urls if key(u) not in want]
        if len(keep) != len(urls):
            removed += len(urls) - len(keep)
            new = "\n    gallery: [\n" + "\n".join(f'      "{u}",' for u in keep) + "\n    ],"
            nb = block.replace(g.group(0), new)
            src = src[:start] + nb + src[start + len(block):]
    if cid in creds:
        creds[cid] = [c for c in creds[cid] if c["title"].replace("_", " ").lower() not in want]
open(dest, "w", encoding="utf8").write(src)
json.dump(creds, open(creds_p, "w"), indent=1)
print("removed", removed, "gallery entries")
