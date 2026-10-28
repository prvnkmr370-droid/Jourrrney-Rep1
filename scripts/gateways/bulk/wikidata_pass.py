"""
Second pass for places OpenStreetMap's search could not find: look them up on Wikidata
(which carries Wikipedia's coordinates for temples, parks, museums, sanctuaries...).
A candidate is accepted only if its "located in" chain reaches the SAME state as the
destination, and its label matches the place's name.

  python3 -I wikidata_pass.py <places.json> <out_dir>
Reads geocode_cache.jsonl (read only); appends to wikidata_cache.jsonl; resumable.
"""
import json, sys, os, re, time, unicodedata, urllib.parse, urllib.request

PLACES, OUT = sys.argv[1], sys.argv[2]
UA = "JourneyApp-data/1.0 (https://jourrrney.in; prvnkmr370@gmail.com)"
API = "https://www.wikidata.org/w/api.php"
CACHE = os.path.join(OUT, os.environ.get("WD_CACHE", "wikidata_cache.jsonl"))

def norm(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", s).strip()

# Wikidata's names for the app's states
STATE_LABELS = {
    "Jammu and Kashmir (UT)": {"jammu and kashmir"}, "Ladakh (UT)": {"ladakh"}, "Delhi": {"delhi", "national capital territory of delhi"},
    "Puducherry (UT)": {"puducherry", "pondicherry"}, "Chandigarh (UT)": {"chandigarh"},
    "Diu (UT)": {"daman and diu", "dadra and nagar haveli and daman and diu", "diu"},
    "Daman (UT)": {"daman and diu", "dadra and nagar haveli and daman and diu", "daman"},
    "Dadra and Nagar Haveli (UT)": {"dadra and nagar haveli", "dadra and nagar haveli and daman and diu"},
    "Andaman & Nicobar": {"andaman and nicobar islands"}, "Lakshadweep": {"lakshadweep"},
}
def state_labels(s): return STATE_LABELS.get(s, {norm(s)})

def call(params):
    url = API + "?" + urllib.parse.urlencode({**params, "format": "json"})
    for a in range(3):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=40))
        except Exception:
            time.sleep(3 * (a + 1))
    return {}

_ent = {}
def entities(ids):
    need = [i for i in ids if i not in _ent]
    for k in range(0, len(need), 40):
        chunk = need[k:k + 40]
        d = call({"action": "wbgetentities", "ids": "|".join(chunk), "props": "claims|labels|descriptions", "languages": "en"})
        for i, e in (d.get("entities") or {}).items(): _ent[i] = e
    return {i: _ent.get(i) for i in ids}

def claim_ids(e, p):
    out = []
    for c in (e or {}).get("claims", {}).get(p, []):
        v = c.get("mainsnak", {}).get("datavalue", {}).get("value")
        if isinstance(v, dict) and "id" in v: out.append(v["id"])
    return out

def label(e): return ((e or {}).get("labels", {}).get("en") or {}).get("value", "")

def reaches_state(eid, wanted, depth=0, seen=None):
    seen = seen or set()
    if eid in seen or depth > 5: return False
    seen.add(eid)
    e = entities([eid])[eid]
    if norm(label(e)) in wanted: return True
    parents = claim_ids(e, "P131")
    if parents: entities(parents)
    return any(reaches_state(p, wanted, depth + 1, seen) for p in parents)

def coord(e):
    for c in (e or {}).get("claims", {}).get("P625", []):
        v = c.get("mainsnak", {}).get("datavalue", {}).get("value")
        if v: return round(v["latitude"], 5), round(v["longitude"], 5)
    return None

def overlap(a, b):
    ta, tb = set(norm(a).split()), set(norm(b).split())
    return len(ta & tb) / min(len(ta), len(tb)) if ta and tb else 0.0

def variants(name):
    base = re.sub(r"\s*\([^)]*\)", " ", name).strip()
    out = [base] + [s.strip() for s in re.split(r",|&| and |/|–| - ", base) if s.strip()]
    for p in re.findall(r"\(([^)]*)\)", name):
        if len(p) > 2 and not re.match(r"^(uttar pradesh|tamil nadu|\d)", p.lower()): out.append(p)
    seen, res = set(), []
    for v in out:
        if norm(v) and norm(v) not in seen and len(norm(v)) > 2: seen.add(norm(v)); res.append(v)
    return res[:3]

done = {}
if os.path.exists(CACHE):
    for line in open(CACHE, encoding="utf-8"):
        try: d = json.loads(line); done[d["id"]] = d
        except Exception: pass

places = {p["id"]: p for p in json.load(open(PLACES))}
failed = []
for line in open(os.path.join(OUT, "geocode_cache.jsonl"), encoding="utf-8"):
    try: d = json.loads(line)
    except Exception: continue
    if not d.get("found") and d["id"] not in done: failed.append(d["id"])
if os.environ.get("WD_IDS"):
    failed = [i for i in json.load(open(os.environ["WD_IDS"])) if i not in done]
print(f"{len(done)} cached, {len(failed)} to try", flush=True)
with open(CACHE, "a", encoding="utf-8") as f:
    for n, pid in enumerate(failed):
        p = places[pid]; rec = {"id": pid, "name": p["name"], "found": None}
        wanted = state_labels(p["state"])
        for v in variants(p["name"]):
            s = call({"action": "wbsearchentities", "search": v, "language": "en", "limit": 6, "type": "item"})
            time.sleep(0.4)
            ids = [r["id"] for r in s.get("search", [])]
            if not ids: continue
            ents = entities(ids)
            best = None
            for i in ids:
                e = ents[i]; c = coord(e)
                if not c: continue
                ov = overlap(v, label(e))
                if ov < 0.8: continue
                if not reaches_state(i, wanted): continue
                if best is None or ov > best[0]: best = (ov, i, c, label(e), (e.get("descriptions", {}).get("en") or {}).get("value", ""))
            if best:
                rec["found"] = {"lat": best[2][0], "lon": best[2][1], "qid": best[1], "wd_label": best[3], "wd_desc": best[4][:80], "confidence": "medium", "query": v}
                break
        f.write(json.dumps(rec, ensure_ascii=False) + "\n"); f.flush()
        if n % 20 == 0: print(f"[{n}/{len(failed)}] {p['name']} -> {rec['found'] and rec['found']['wd_label']}", flush=True)
print("DONE", flush=True)
