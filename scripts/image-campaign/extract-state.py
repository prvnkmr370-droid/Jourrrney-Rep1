import re,json,sys
state=sys.argv[1]; out=sys.argv[2]
s=open('src/data/destinations.ts').read()
coords={}
for f in ['src/data/destinationCoords.ts','src/data/destinationCoordsGeocoded.ts']:
    t=open(f).read()
    # any  "id": { lat: X, lng: Y }  or  id: { lat..., lng... } style
    for m in re.finditer(r'["\']?([a-z0-9][a-z0-9\-]*)["\']?\s*:\s*\{[^{}]*?lat(?:itude)?\s*:\s*(-?[0-9.]+)[^{}]*?(?:lng|lon|longitude)\s*:\s*(-?[0-9.]+)',t):
        coords[m.group(1)]=[float(m.group(2)),float(m.group(3))]
starts=[m.start() for m in re.finditer(r'\n  \{\n    id: "', s)]; starts.append(len(s))
cards=[]
for a,b in zip(starts,starts[1:]):
    blk=s[a:b]
    if '\n    state: "%s"'%state not in blk: continue
    g=lambda k:(re.search(r'\n    %s: "([^"]*)"'%k,blk) or [None,None])[1]
    id=re.search(r'id: "([^"]+)"',blk).group(1)
    gal=re.search(r'\n    gallery: \[([^\]]*)\]',blk)
    urls=re.findall(r'"(https?://[^"]+)"',gal.group(1)) if gal else []
    al=re.search(r'\n    aliases: \[([^\]]*)\]',blk)
    ex=[u for u in [g('image'),g('heroImage')]+urls if u]
    cards.append({"id":id,"name":g('name'),"aliases":re.findall(r'"([^"]+)"',al.group(1)) if al else [],"state":state,"coords":coords.get(id),"existing":ex,"galleryCount":len(urls),"hidden":'\n    hidden: true' in blk[:4000]})
json.dump(cards,open(out,'w'),indent=1)
print(len(cards),"cards;",sum(1 for c in cards if c['coords']),"with coords")
for c in cards: print(f"{c['id']:34s}|{c['name'][:36]:36s}| gal {c['galleryCount']} | coords {'yes' if c['coords'] else 'no '} | aliases {c['aliases'][:2]}")
