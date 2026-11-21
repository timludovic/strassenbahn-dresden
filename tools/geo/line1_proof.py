"""Proof-of-concept: real OSM tram geometry of line 1 over real aerial imagery."""
import json, math, os, sys, urllib.request
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont

UA = {"User-Agent": "strassenbahn-dresden-dev/0.1 (hobby project)"}
TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"

def merc(lat, lon, z):
    n = 2 ** z
    x = (lon + 180.0) / 360.0 * n
    s = math.sin(math.radians(lat))
    y = (0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * n
    return x, y

def fetch_tile(z, x, y):
    path = f"/tmp/tiles/{z}_{x}_{y}.jpg"
    if os.path.exists(path):
        return open(path, "rb").read()
    os.makedirs("/tmp/tiles", exist_ok=True)
    req = urllib.request.Request(TILE_URL.format(z=z, x=x, y=y), headers=UA)
    data = urllib.request.urlopen(req, timeout=30).read()
    open(path, "wb").write(data)
    return data

def render(points_ll, stops, z, out_path, pad_m=260, max_px=4200, title=""):
    # bbox in tile coords
    xs, ys = zip(*[merc(lat, lon, z) for lat, lon in points_ll])
    minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
    # pad in tiles (1 tile ~ 40075016/2^z / 256 m/px)
    m_per_tile = 40075016.686 / (2 ** z)
    pad = pad_m / m_per_tile
    minx -= pad; maxx += pad; miny -= pad; maxy += pad
    scale = 1.0
    wpx = (maxx - minx) * 256; hpx = (maxy - miny) * 256
    if max(wpx, hpx) > max_px:
        scale = max_px / max(wpx, hpx)
    W = max(1, int(wpx * scale)); H = max(1, int(hpx * scale))
    img = Image.new("RGB", (W, H), (24, 32, 24))
    tx0, ty0 = int(math.floor(minx)), int(math.floor(miny))
    tx1, ty1 = int(math.floor(maxx)), int(math.floor(maxy))
    for tx in range(tx0, tx1 + 1):
        for ty in range(ty0, ty1 + 1):
            try:
                tile = Image.open(BytesIO(fetch_tile(z, tx, ty))).convert("RGB")
            except Exception as e:
                print("tile fail", z, tx, ty, e); continue
            px = (tx - minx) * 256 * scale
            py = (ty - miny) * 256 * scale
            tw = max(1, int(256 * scale))
            tile = tile.resize((tw, tw), Image.BILINEAR)
            img.paste(tile, (int(px), int(py)))
    d = ImageDraw.Draw(img)
    def to_px(lat, lon):
        x, y = merc(lat, lon, z)
        return ((x - minx) * 256 * scale, (y - miny) * 256 * scale)
    pts = [to_px(lat, lon) for lat, lon in points_ll]
    lw = 5 if z >= 16 else 3
    d.line(pts, fill=(255, 210, 0), width=lw, joint="curve")
    for s in stops:
        x, y = to_px(s["lat"], s["lon"])
        r = 6 if z >= 16 else 4
        d.ellipse([x - r, y - r, x + r, y + r], fill=(255, 255, 255), outline=(20, 20, 20))
        if s.get("name"):
            d.text((x + r + 3, y - 12), s["name"], fill=(255, 255, 255),
                   stroke_width=3, stroke_fill=(0, 0, 0))
    if title:
        d.text((10, 8), title, fill=(255, 255, 255), stroke_width=3, stroke_fill=(0, 0, 0))
    img.save(out_path, optimize=True)
    print("saved", out_path, img.size)

def main():
    d = json.load(open("tools/geo/line1.json"))
    rel = [e for e in d["elements"] if e["type"] == "relation"][0]
    ms = rel["members"]
    stops = [{"lat": m["lat"], "lon": m["lon"]} for m in ms if m["type"] == "node" and m.get("role") == "stop"]
    ways = [m for m in ms if m["type"] == "way" and m.get("geometry")]
    print("stops", len(stops), "ways", len(ways))

    # way-Kette in Mitglieder-Reihenfolge, jeweils passend gedreht
    chain = []
    for w in ways:
        g = [(p["lat"], p["lon"]) for p in w["geometry"]]
        if not chain:
            chain.extend(g); continue
        d0 = dist(chain[-1], g[0]); d1 = dist(chain[-1], g[-1])
        if d1 < d0: g = g[::-1]; d0 = d1
        if d0 > 60:
            print(f"  Lücke {d0:5.0f} m bei {len(chain)} Punkten")
        chain.extend(g[1:] if d0 < 1 else g)
    print("chain pts", len(chain), "length km", round(path_len(chain) / 1000, 2))

    # Haltestellen entlang der Kette sortieren (Projektion auf nächsten Punkt)
    with open("tools/geo/line1_chain.json", "w") as f:
        json.dump({"chain": chain, "stops": stops}, f)

    render(chain, stops, 15, "artifacts/line1-overview.png", pad_m=250,
           title="Tram 1 Prohlis - Friedrichstadt, echte Gleise + Esri-Luftbild")

def dist(a, b):
    dy = (a[0] - b[0]) * 111320.0
    dx = (a[1] - b[1]) * 111320.0 * math.cos(math.radians((a[0] + b[0]) / 2))
    return math.hypot(dx, dy)

def path_len(pts):
    return sum(dist(a, b) for a, b in zip(pts, pts[1:]))

main()
