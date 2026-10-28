"""
Finds a map position for every destination that has none (and re-checks the approximate
ones) with OpenStreetMap's place search (Nominatim), one request per second, as its usage
policy asks. Resumable: every answer is appended to a cache file, so a rerun skips what is done.

  python3 -I geocode.py <places.json> <out_dir>

A result is accepted only when it is in the SAME state the destination declares, and it is
scored on how well its name matches. Administrative outlines (a district's centre) are
used only if nothing better turns up, and are marked low confidence.
"""
import json, sys, time, re, unicodedata, urllib.parse, urllib.request, os

PLACES, OUT = sys.argv[1], sys.argv[2]
UA = "JourneyApp-data/1.0 (https://jourrrney.in; prvnkmr370@gmail.com)"
CACHE = os.path.join(OUT, os.environ.get("GEO_CACHE", "photon_cache.jsonl"))
MAIN = os.path.join(OUT, "geocode_cache.jsonl")

def norm(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", s).strip()

STATE_OK = {
    "Jammu and Kashmir (UT)": {"jammu and kashmir"},
    "Ladakh (UT)": {"ladakh", "jammu and kashmir"},
    "Delhi": {"delhi", "nct of delhi", "national capital territory of delhi"},
    "Puducherry (UT)": {"puducherry", "pondicherry"},
    "Chandigarh (UT)": {"chandigarh"},
    "Diu (UT)": {"dadra and nagar haveli and daman and diu", "daman and diu", "diu"},
    "Daman (UT)": {"dadra and nagar haveli and daman and diu", "daman and diu", "daman"},
    "Dadra and Nagar Haveli (UT)": {"dadra and nagar haveli and daman and diu", "dadra and nagar haveli"},
    "Andaman & Nicobar": {"andaman and nicobar islands", "andaman and nicobar"},
    "Lakshadweep": {"lakshadweep"},
}
def ok_states(state): return STATE_OK.get(state, {norm(state)})
def query_state(state): return re.sub(r"\s*\(UT\)", "", state).replace("&", "and")

TYPE_WORDS = r"\b(beach|temple|fort|palace|museum|sanctuary|national park|wildlife|reserve|lake|falls|waterfall|dam|garden|gardens|monastery|church|mosque|caves?|valley|hill|hills|resort|market|bazaar|bazar|ghat|island|point|view ?point|trek|reserved forest|conservation|rural tourism|heritage|harbour|harbor|village|town|city)\b"

def variants(name):
    base = re.sub(r"\s*\([^)]*\)", " ", name).strip()
    paren = re.findall(r"\(([^)]*)\)", name)
    out = [name.replace("&", "and") if "(" not in name else base, base]
    segs = [s.strip() for s in re.split(r",|&| and |/|–| - ", base) if s.strip()]
    out += segs[::-1] if len(segs) > 1 else []
    stripped = re.sub(TYPE_WORDS, " ", base, flags=re.I)
    stripped = re.sub(r"\s+", " ", stripped).strip()
    if stripped and stripped.lower() != base.lower(): out.append(stripped)
    for p in paren:
        if len(p) > 2 and not re.match(r"^(uttar pradesh|tamil nadu|\d)", p.lower()): out.append(p)
    generic = set(norm(TYPE_WORDS.replace("\\b", "").replace("(", "").replace(")", "").replace("?", "").replace("|", " ")).split()) | {"fishing", "view", "point", "old", "new", "main", "the"}
    seen, res = set(), []
    for v in out:
        v = v.strip(" ,")
        if v and set(norm(v).split()) <= generic: continue
        if v and norm(v) not in seen and len(norm(v)) > 2:
            seen.add(norm(v)); res.append(v)
    return res[:4]


def search(text):
    url = "https://photon.komoot.io/api/?" + urllib.parse.urlencode({"q": text, "limit": 8, "lang": "en"})
    for attempt in range(3):
        try:
            return json.load(urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=40)).get("features", [])
        except Exception:
            time.sleep(5 * (attempt + 1))
    return None

def overlap(a, b):
    ta, tb = set(norm(a).split()), set(norm(b).split())
    if not ta or not tb: return 0.0
    return len(ta & tb) / min(len(ta), len(tb))

def pick(feats, variant, state, primary=True):
    good = []
    for f in feats or []:
        p = f.get("properties", {})
        if p.get("countrycode") != "IN": continue
        if norm(p.get("state", "")) not in ok_states(state): continue
        ov = overlap(variant, p.get("name", ""))
        admin = p.get("osm_key") in ("boundary",) or p.get("type") in ("state", "county", "district")
        good.append((ov, not admin, f))
    if not good: return None
    good.sort(key=lambda x: (x[1] and x[0] >= 0.8, x[0], x[1]), reverse=True)
    ov, nonadmin, f = good[0]
    if ov < 0.5: return None
    p = f["properties"]; lon, lat = f["geometry"]["coordinates"]
    conf = "high" if (ov >= 0.8 and nonadmin and primary) else "medium" if nonadmin else "low"
    return {"lat": round(lat, 5), "lon": round(lon, 5), "osm_name": p.get("name"), "osm_type": p.get("osm_value"), "osm_state": p.get("state"), "confidence": conf, "overlap": round(ov, 2)}

def main_done():
    d = set()
    if os.path.exists(MAIN):
        for line in open(MAIN, encoding="utf-8"):
            try: d.add(json.loads(line)["id"])
            except Exception: pass
    return d

mine = set()
if os.path.exists(CACHE):
    for line in open(CACHE, encoding="utf-8"):
        try: mine.add(json.loads(line)["id"])
        except Exception: pass
places = json.load(open(PLACES))
todo = [p for p in places if p.get("src") != "hand"]
todo.sort(key=lambda p: (p.get("src") == "geocoded", p["id"]))
missing = [p for p in todo if p.get("src") != "geocoded"]
approx = [p for p in todo if p.get("src") == "geocoded"]
todo = missing[::-1] + approx[::-1]  # places with no position first, from the far end; the Nominatim worker goes from the near end
if os.environ.get("GEO_IDS"):
    only = set(json.load(open(os.environ["GEO_IDS"])))
    todo = [p for p in places if p["id"] in only]
print(f"{len(mine)} mine already, {len(todo)} to do", flush=True)
with open(CACHE, "a", encoding="utf-8") as f:
    for i, p in enumerate(todo):
        if p["id"] in mine: continue
        if not os.environ.get("GEO_IDS") and i % 5 == 0 and p["id"] in main_done(): print("met the other worker at", p["name"], flush=True); break
        rec = {"id": p["id"], "name": p["name"], "state": p["state"], "found": None, "tried": []}
        vs = variants(p["name"])
        if os.environ.get("GEO_QUERIES"):
            qq = json.load(open(os.environ["GEO_QUERIES"])).get(p["id"])
            vs = [qq] if qq else vs[:1]
        for vi, v in enumerate(vs):
            res = search(f"{v}, {query_state(p['state'])}, India")
            time.sleep(1.0)
            rec["tried"].append(v)
            if res is None: continue
            hit = pick(res, v, p["state"], primary=(vi < 2))
            if hit: hit["query"] = v; rec["found"] = hit; break
        f.write(json.dumps(rec, ensure_ascii=False) + "\n"); f.flush()
        if i % 25 == 0: print(f"[{i}] {p['name']} -> {rec['found'] and (rec['found']['confidence'], rec['found']['osm_name'])}", flush=True)
print("DONE", flush=True)
