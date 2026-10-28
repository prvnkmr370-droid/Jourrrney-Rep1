import json, re, csv, sys
D, A = sys.argv[1], sys.argv[2]
w = json.load(open(f"{D}/wiki/List_of_busiest_airports_in_India.json"))["parse"]["wikitext"]["*"]
# split the first big table into rows
tbl = w[w.find("{|"):]
tbl = tbl[:tbl.find("\n|}")]
rows = tbl.split("\n|-")
traf = {}
for r in rows[1:]:
    cells = [c.strip() for c in re.split(r"\n\|(?!\|)", r.strip("\n")) if c.strip()]
    cells = [re.sub(r"^\|", "", c).strip() for c in cells]
    if len(cells) < 7: continue
    iata = cells[4]
    if not re.fullmatch(r"[A-Z]{3}", iata): continue
    num = lambda s: int(re.sub(r"[^\d]", "", s) or 0)
    name = re.sub(r"\[\[([^\]|]*\|)?([^\]]*)\]\]", r"\2", cells[1]).strip()
    traf[iata] = {"name": name, "city": re.sub(r"\[\[([^\]|]*\|)?([^\]]*)\]\]", r"\2", cells[2]).strip(), "pax_2526": num(cells[5]), "pax_2425": num(cells[6])}
print("airports in traffic table:", len(traf))
json.dump(traf, open(f"{A}/traffic.json", "w"))
rows = {r["iata_code"]: r for r in csv.DictReader(open(f"{D}/airports/airports.csv", encoding="utf-8")) if r["iso_country"] == "IN" and r["iata_code"]}
missing = [i for i in traf if i not in rows]
print("in table but not in OurAirports:", missing)
flagged = {i for i, r in rows.items() if r["scheduled_service"] == "yes" and r["type"] in ("large_airport", "medium_airport", "small_airport")}
print("OurAirports flagged yes but NOT in traffic table:", sorted(flagged - set(traf)))
print("in table but OurAirports says not scheduled:", sorted(i for i in traf if i in rows and i not in flagged))
cal = {"AGR":"few","KJH":"few","VDY":"few","UDR":"more","JAI":"most","VNS":"most","IXL":"?","GOX":"?","GOI":"most","IXC":"?","DED":"?","KUU":"few","IXZ":"?","JDH":"?","TIR":"?","IXD":"?","IXB":"?","MYQ":"few","CJB":"?","COK":"most","IXM":"?","TRV":"?","SXR":"?"}
for i, t in sorted(traf.items(), key=lambda kv: kv[1]["pax_2526"]):
    pass
print("\npassengers 2025-26 for airports used in the 20 verified places (tag we gave):")
import ast
g = open("/Users/mpraveenkumar/Documents/Claude/journey-app/src/data/gateways.ts").read()
for m in re.finditer(r'code: "([A-Z]{3})"[^}]*?service: "(few|more|most)"', g):
    iata, svc = m.groups()
    print(f"  {iata} {svc:5s} {traf.get(iata,{}).get('pax_2526','-')}")
