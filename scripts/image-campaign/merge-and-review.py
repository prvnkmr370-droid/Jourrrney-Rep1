"""Merge verified-image result files for one state, write the merged file the
apply script consumes, and build an HTML review page for the user.

usage: python3 merge_and_review.py <state label> <merged_out.json> <review_out.html> <cards_in.json> <verified.json>...
Env EXCLUDE='{"card-id": ["File:Title.jpg", ...]}' drops specific files.
"""
import json, sys, os, html

state, merged_out, review_out, cards_in, *vfiles = sys.argv[1:]
exclude = json.load(open(os.environ["EXCLUDE_FILE"])) if os.environ.get("EXCLUDE_FILE") else {}
cards = {c["id"]: c for c in json.load(open(cards_in))}
order = [c["id"] for c in json.load(open(cards_in))]

merged, notes = {}, {}
for f in vfiles:
    if not os.path.exists(f):
        print("missing (skipped):", f); continue
    for entry in json.load(open(f)):
        m = merged.setdefault(entry["id"], {"id": entry["id"], "name": entry["name"], "verified": []})
        seen = {v["title"] for v in m["verified"]}
        for v in entry.get("verified", []):
            if v["title"] in seen or v["title"] in exclude.get(entry["id"], []):
                continue
            m["verified"].append(v); seen.add(v["title"])
        if entry.get("note"):
            notes.setdefault(entry["id"], []).append(entry["note"])

out = [merged[i] for i in order if i in merged]
json.dump(out, open(merged_out, "w"), indent=1)

def thumb(u, w=500):
    return u.replace("/1280px-", f"/{w}px-")

total = sum(len(m["verified"]) for m in out)
below = [(m["id"], m["name"], len(cards[m["id"]]["existing"]), len(m["verified"])) for m in out]
css = """
:root{--bg:#FBF7F2;--ink:#1C1917;--muted:#6a625a;--card:#fff;--line:rgba(28,25,23,.14);--accent:#333C81}
@media (prefers-color-scheme:dark){:root{--bg:#15120E;--ink:#F5EFE6;--muted:#a79f94;--card:#211C16;--line:rgba(255,255,255,.14);--accent:#8891E0}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:system-ui,-apple-system,Segoe UI,sans-serif;line-height:1.5}
.wrap{max-width:1000px;margin:0 auto;padding:28px 16px 80px}h1{font-size:24px;margin:0 0 6px}.sub{color:var(--muted);margin:0 0 18px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px;margin:16px 0}
.card h2{font-size:17px;margin:0 0 2px}.meta{color:var(--muted);font-size:13px;margin-bottom:10px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
.ph img{width:100%;height:150px;object-fit:cover;border-radius:10px;display:block;background:rgba(120,120,120,.2)}
.cap{font-size:12px;color:var(--muted);margin-top:4px}.cap a{color:var(--accent)}
.flag{display:inline-block;font-size:11px;font-weight:700;border-radius:99px;padding:1px 9px;margin-left:8px}
.ok{background:rgba(21,128,61,.15);color:#15803D}.low{background:rgba(201,152,31,.2);color:#9a6f00}.none{background:rgba(220,38,38,.15);color:#b91c1c}
.note{font-size:13px;background:rgba(201,152,31,.12);border-radius:8px;padding:8px 10px;margin-top:10px}
"""
parts = [f"<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>{html.escape(state)} photos review</title><style>{css}</style></head><body><div class='wrap'>",
         f"<h1>{html.escape(state)}: new photos to review</h1>",
         f"<p class='sub'>{len(out)} cards · {total} new photos. Every photo was looked at and checked against the place. Photos load from Wikimedia Commons, so you need internet to view this page. Click a photo's caption to open its source page.</p>"]
for m in out:
    n = len(m["verified"]); ex = len({u.split("?")[0] for u in cards[m["id"]]["existing"]})
    cls, label = ("ok", f"{n} new") if n >= 5 else (("low", f"{n} new") if n > 0 else ("none", "0 new"))
    after = ex + n
    parts.append(f"<div class='card'><h2>{html.escape(m['name'])}<span class='flag {cls}'>{label}</span></h2>"
                 f"<div class='meta'>id: {m['id']} · had {ex} photo(s) · will have about {after}</div><div class='grid'>")
    for v in m["verified"]:
        t = v["title"].replace("File:", "")
        parts.append(f"<div class='ph'><a href='{html.escape(v['pageUrl'])}' target='_blank'><img loading='lazy' src='{html.escape(thumb(v['thumbUrl']))}' alt=''></a>"
                     f"<div class='cap'>{html.escape(v.get('why','')[:110])}<br>{html.escape(v['author'][:50])} · {html.escape(v['licence'])} · <a href='{html.escape(v['pageUrl'])}' target='_blank'>source</a></div></div>")
    parts.append("</div>")
    for n_ in notes.get(m["id"], []):
        parts.append(f"<div class='note'>{html.escape(n_)}</div>")
    parts.append("</div>")
parts.append("</div></body></html>")
open(review_out, "w").write("".join(parts))
print(f"cards {len(out)} | new photos {total}")
for i, name, ex, n in below:
    print(f"  {i:34s} had {ex} -> +{n}")
