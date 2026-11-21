"""Line 1: route along the real OSM tram track graph, then render over aerial imagery."""
import json, math, os, heapq, urllib.request
from io import BytesIO
from PIL import Image, ImageDraw

UA = {"User-Agent": "strassenbahn-dresden-dev/0.1 (hobby project)"}
TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"

def dist(a, b):
    dy = (a[0] - b[0]) * 111320.0
    dx = (a[1] - b[1]) * 111320.0 * math.cos(math.radians((a[0] + b[0]) / 2))
    return math.hypot(dx, dy)

def merc(lat, lon, z):
    n = 2 ** z
    x = (lon + 180.0) / 360.0 * n
    s = math.sin(math.radians(lat))
    y = (0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * n
    return x, y

def fetch_tile(z, x, y):
    os.makedirs("/tmp/tiles", exist_ok=True)
    path = f"/tmp/tiles/{z}_{x}_{y}.jpg"
    if os.path.exists(path):
        return open(path, "rb").read()
    req = urllib.request.Request(TILE_URL.format(z=z, x=x, y=y), headers=UA)
    data = urllib.request.urlopen(req, timeout=30).read()
    open(path, "wb").write(data)
    return data

def render(chain, stops, z, out_path, pad_m=200, max_px=3000, title="", preview=None):
    xs, ys = zip(*[merc(lat, lon, z) for lat, lon in chain])
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    m_per_tile = 40075016.686 / (2 ** z)
    pad = pad_m / m_per_tile
    minx -= pad; maxx += pad; miny -= pad; maxy += pad
    scale = 1.0
    if (maxx - minx) * 256 > max_px:
        scale = max_px / ((maxx - minx) * 256)
    W = max(1, int((maxx - minx) * 256 * scale)); H = max(1, int((maxy - miny) * 256 * scale))
    img = Image.new("RGB", (W, H), (20, 26, 20))
    for tx in range(int(minx), int(maxx) + 1):
        for ty in range(int(miny), int(maxy) + 1):
            try:
                tile = Image.open(BytesIO(fetch_tile(z, tx, ty))).convert("RGB")
            except Exception as e:
                print("tile fail", z, tx, ty, e); continue
            tw = max(1, int(256 * scale))
            tile = tile.resize((tw, tw), Image.BILINEAR)
            img.paste(tile, (int((tx - minx) * 256 * scale), int((ty - miny) * 256 * scale)))
    d = ImageDraw.Draw(img)
    def px(lat, lon):
        x, y = merc(lat, lon, z)
        return ((x - minx) * 256 * scale, (y - miny) * 256 * scale)
    pts = [px(a, b) for a, b in chain]
    d.line(pts, fill=(255, 210, 0), width=6 if z >= 16 else 3, joint="curve")
    for s in stops:
        x, y = px(s["lat"], s["lon"])
        r = 7 if z >= 16 else 4
        d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255), outline=(15, 15, 15))
        if s.get("name") and r == 7:
            d.text((x + r + 4, y - 14), s["name"], fill=(255, 255, 255), stroke_width=3, stroke_fill=(0, 0, 0))
    if title:
        d.text((12, 10), title, fill=(255, 255, 255), stroke_width=3, stroke_fill=(0, 0, 0))
    img.save(out_path, optimize=True)
    print("saved", out_path, img.size)
    if preview:
        img.thumbnail((1600, 1600), Image.LANCZOS)
        img.save(preview, quality=88, optimize=True)
        print("saved", preview)

def nearest(points, target):
    best, bd = None, 1e18
    for p in points:
        dd = dist(p, target)
        if dd < bd: bd, best = dd, p
    return best, bd

def main():
    tracks = json.load(open("tools/geo/tracks_raw.json"))
    ways = [w for w in tracks["elements"] if w.get("geometry")]
    adj = {}
    coord = {}
    def key(p): return (round(p[0], 6), round(p[1], 6))
    for w in ways:
        g = [(p["lat"], p["lon"]) for p in w["geometry"]]
        for a, b in zip(g, g[1:]):
            ka, kb = key(a), key(b)
            coord[ka], coord[kb] = a, b
            adj.setdefault(ka, []).append((kb, dist(a, b)))
            adj.setdefault(kb, []).append((ka, dist(a, b)))
    print("graph nodes", len(coord), "edges", sum(len(v) for v in adj.values()) // 2)

    rel = [e for e in json.load(open("tools/geo/line1.json"))["elements"] if e["type"] == "relation"][0]
    stops = [{"lat": m["lat"], "lon": m["lon"], "ref": m["ref"]} for m in rel["members"]
             if m["type"] == "node" and m.get("role") == "stop"]

    # Namen zu den Stop-IDs holen
    ids = "(" + ",".join(str(s["ref"]) for s in stops) + ")"
    try:
        req = urllib.request.Request("https://overpass-api.de/api/interpreter",
            data=("data=[out:json][timeout:40];node(id:%s);out;" % ids).encode(), headers=UA)
        named = {e["id"]: e["tags"].get("name", "") for e in json.load(urllib.request.urlopen(req, timeout=60))["elements"]}
        for s in stops: s["name"] = named.get(s["ref"], "")
    except Exception as e:
        print("names fail", e)
        for s in stops: s["name"] = ""

    def route(a, b):
        ka, d0 = nearest(coord.keys(), a)
        kb, d1 = nearest(coord.keys(), b)
        if d0 > 120 or d1 > 120:
            print(f"  Snap zu weit: {d0:.0f}/{d1:.0f} m")
        pq = [(0.0, ka)]
        bestd = {ka: 0.0}
        prev = {}
        while pq:
            dcur, u = heapq.heappop(pq)
            if u == kb: break
            if dcur > bestd.get(u, 1e18): continue
            for v, w in adj.get(u, []):
                nd = dcur + w
                if nd < bestd.get(v, 1e18):
                    bestd[v] = nd; prev[v] = u
                    heapq.heappush(pq, (nd, v))
        if kb not in prev and kb != ka:
            return None
        out = [coord[kb]]
        cur = kb
        while cur != ka:
            cur = prev[cur]
            out.append(coord[cur])
        out.reverse()
        return out

    chain = []
    for s0, s1 in zip(stops, stops[1:]):
        seg = route((s0["lat"], s0["lon"]), (s1["lat"], s1["lon"]))
        if not seg:
            print("  keine Route:", s0.get("name"), "->", s1.get("name"))
            seg = [(s0["lat"], s0["lon"]), (s1["lat"], s1["lon"])]
        if chain: seg = seg[1:]
        chain.extend(seg)
        print(f"  {s0['name'][:26]:26s} -> {s1['name'][:26]:26s} {sum(dist(a,b) for a,b in zip(seg,seg[1:])):7.0f} m")

    total = sum(dist(a, b) for a, b in zip(chain, chain[1:]))
    print("gesamt km", round(total / 1000, 2))
    json.dump({"chain": chain, "stops": stops}, open("tools/geo/line1_chain.json", "w"))

    render(chain, stops, 15, "artifacts/line1-overview.png", pad_m=220,
           title="Linie 1: echte Gleise (OSM) auf Esri-Luftbild", preview="artifacts/line1-overview.jpg")

    # Ausschnitt Altstadt um Pirnaischer Platz
    focus = [(51.0455, 13.7330), (51.0525, 13.7470)]
    sub = [p for p in chain if focus[0][0] - 0.01 < p[0] < focus[1][0] + 0.01 and focus[0][1] - 0.01 < p[1] < focus[1][1] + 0.01]
    if len(sub) > 5:
        render(sub, stops, 17, "artifacts/line1-altstadt.png", pad_m=120, max_px=2200,
               title="Altstadt-Ausschnitt: Pirnaischer Platz / Altmarkt / Postplatz",
               preview="artifacts/line1-altstadt.jpg")

main()
