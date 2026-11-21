"""Hand-built pixel-art tile of a Dresden interchange, generated from OSM geometry.

Left: satellite reference. Right: pixel map at game scale (3.2 px/m).
"""
import json, math, os, sys, urllib.request, hashlib
from io import BytesIO
from PIL import Image, ImageDraw

UA = {"User-Agent": "strassenbahn-dresden-dev/0.1"}
TILE = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"

LAT, LON = 51.0512, 13.7327      # Postplatz
W_M, H_M = 170.0, 105.0

import sys
if len(sys.argv) >= 4:
    LAT, LON, NAME = float(sys.argv[1]), float(sys.argv[2]), sys.argv[3]
    if len(sys.argv) >= 6:
        W_M, H_M = float(sys.argv[4]), float(sys.argv[5])
else:
    NAME = "postplatz"
PXM = 3.2                         # Spielmaßstab

def dist_m(a, b):
    dy = (a[0] - b[0]) * 111320.0
    dx = (a[1] - b[1]) * 111320.0 * math.cos(math.radians((a[0] + b[0]) / 2))
    return math.hypot(dx, dy)

def proj(lat, lon):
    x = (lon - LON) * 111320.0 * math.cos(math.radians(LAT))
    y = (LAT - lat) * 111320.0
    return (x + W_M / 2, y + H_M / 2)

def hashf(*args):
    return int(hashlib.md5(("|".join(str(a) for a in args)).encode()).hexdigest()[:6], 16) / 0xFFFFFF

def osm_api(bb):
    """Fallback: api.openstreetmap.org map call (bb = lat_min,lon_min,lat_max,lon_max)."""
    import xml.etree.ElementTree as ET
    la1, lo1, la2, lo2 = bb
    url = f"https://api.openstreetmap.org/api/0.6/map?bbox={lo1},{la1},{lo2},{la2}"
    req = urllib.request.Request(url, headers=UA)
    raw = urllib.request.urlopen(req, timeout=90).read()
    root = ET.fromstring(raw)
    nodes = {}
    for n in root.findall("node"):
        nodes[n.get("id")] = (float(n.get("lat")), float(n.get("lon")),
                              {t.get("k"): t.get("v") for t in n.findall("tag")})
    els = []
    for n in root.findall("node"):
        lat, lon, tags = nodes[n.get("id")]
        if tags:
            els.append({"type": "node", "id": int(n.get("id")), "lat": lat, "lon": lon, "tags": tags})
    for w in root.findall("way"):
        tags = {t.get("k"): t.get("v") for t in w.findall("tag")}
        refs = [nd.get("ref") for nd in w.findall("nd")]
        if len(refs) < 2 or any(r not in nodes for r in refs):
            continue
        geom = [{"lat": nodes[r][0], "lon": nodes[r][1]} for r in refs]
        els.append({"type": "way", "id": int(w.get("id")), "tags": tags, "geometry": geom})
    print("OSM-API:", len(els), "Elemente")
    return {"elements": els}

def overpass(q, bb=None):
    import time
    hosts = ["https://overpass-api.de/api/interpreter",
             "https://overpass.kumi.systems/api/interpreter",
             "https://overpass.private.coffee/api/interpreter"]
    body = ("data=" + urllib.parse.quote(q)).encode()
    err = None
    if os.environ.get("USE_OSM_API") and bb is not None:
        return osm_api(bb)
    for attempt in range(3):
        host = hosts[attempt % len(hosts)]
        try:
            req = urllib.request.Request(host, data=body, headers=UA)
            return json.load(urllib.request.urlopen(req, timeout=25))
        except Exception as e:
            err = e
            time.sleep(3 + attempt * 2)
    if bb is not None:
        print("Overpass nicht erreichbar -> OSM-API")
        return osm_api(bb)
    raise err

import urllib.parse

dlat = H_M / 2 / 111320.0 * 1.5
dlon = W_M / 2 / (111320.0 * math.cos(math.radians(LAT))) * 1.5
bbox = f"{LAT-dlat},{LON-dlon},{LAT+dlat},{LON+dlon}"
print("bbox", bbox)

CACHE = f"tools/geo/tile_cache_{NAME}.json"
if os.path.exists(CACHE):
    data = json.load(open(CACHE))
else:
    q = f"""[out:json][timeout:100];
(
  way["building"]({bbox});
  way["highway"]({bbox});
  way["railway"="tram"]({bbox});
  way["railway"="platform"]({bbox});
  way["landuse"]({bbox});
  way["leisure"]({bbox});
  way["natural"="water"]({bbox});
  way["waterway"]({bbox});
  node["natural"="tree"]({bbox});
);
out geom;"""
    bb = (LAT - dlat, LON - dlon, LAT + dlat, LON + dlon)
    data = overpass(q, bb)
    json.dump(data, open(CACHE, "w"))
print("OSM elements", len(data["elements"]))

# Kachelmitte auf den Schwerpunkt der Bahnsteige legen
_plats = [e for e in data["elements"]
          if e.get("tags", {}).get("railway") == "platform" or e.get("tags", {}).get("public_transport") == "platform"]
_xs, _ys = [], []
for e in _plats:
    for q in e.get("geometry", []):
        x, y = proj(q["lat"], q["lon"]); _xs.append(x); _ys.append(y)
if _xs:
    cx, cy = sum(_xs) / len(_xs), sum(_ys) / len(_ys)
    LAT += -(cy - H_M / 2) / 111320.0
    LON += (cx - W_M / 2) / (111320.0 * math.cos(math.radians(LAT)))
    print("neu zentriert auf", round(LAT, 6), round(LON, 6), "aus", len(_plats), "Bahnsteigen")

def merc(lat, lon, z):
    n = 2 ** z
    x = (lon + 180.0) / 360.0 * n
    s = math.sin(math.radians(lat))
    y = (0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * n
    return x, y

def fetch_tile(z, x, y):
    p = f"/tmp/tiles/{z}_{x}_{y}.jpg"
    if os.path.exists(p):
        return Image.open(p).convert("RGB")
    req = urllib.request.Request(TILE.format(z=z, x=x, y=y), headers=UA)
    d = urllib.request.urlopen(req, timeout=30).read()
    os.makedirs("/tmp/tiles", exist_ok=True)
    open(p, "wb").write(d)
    return Image.open(BytesIO(d)).convert("RGB")

def satellite(w, h):
    z = 19
    x0, y0 = merc(LAT, LON, z)
    m_per_px = 156543.03392 * math.cos(math.radians(LAT)) / (2 ** z)
    wpx, hpx = int(w / m_per_px), int(h / m_per_px)
    left = x0 - wpx / 2 / 256.0
    top = y0 - hpx / 2 / 256.0
    img = Image.new("RGB", (wpx, hpx))
    for tx in range(int(math.floor(left)), int(math.floor(left + wpx / 256.0)) + 1):
        for ty in range(int(math.floor(top)), int(math.floor(top + hpx / 256.0)) + 1):
            img.paste(fetch_tile(z, tx, ty), (int(round((tx - left) * 256)), int(round((ty - top) * 256))))
    return img.resize((int(w * PXM), int(h * PXM)), Image.LANCZOS)

def px(v): return int(round(v * PXM))


def dp(pts, tol):
    if len(pts) < 3: return pts
    import math as _m
    def rec(a, b):
        if b <= a + 1: return [pts[a], pts[b]]
        ax, ay = pts[a]; bx, by = pts[b]
        dx, dy = bx - ax, by - ay
        L = _m.hypot(dx, dy) or 1e-9
        best, bi = -1, a
        for i in range(a + 1, b):
            px_, py_ = pts[i]
            d = abs(dy * (px_ - ax) - dx * (py_ - ay)) / L
            if d > best: best, bi = d, i
        if best <= tol: return [pts[a], pts[b]]
        left = rec(a, bi); right = rec(bi, b)
        return left[:-1] + right
    return rec(0, len(pts) - 1)

def samples(pts, step=3.0):
    out = []
    for i in range(1, len(pts)):
        a, b = pts[i-1], pts[i]
        d = math.hypot(b[0]-a[0], b[1]-a[1])
        n = max(1, int(d / step))
        for k in range(n):
            t = k / n
            out.append((a[0] + (b[0]-a[0])*t, a[1] + (b[1]-a[1])*t))
    out.append(pts[-1])
    return out

def is_dup(sm, taken, r=2.2):
    hit = 0
    for p in sm:
        for q in taken:
            if abs(p[0]-q[0]) < r and abs(p[1]-q[1]) < r: hit += 1; break
    return hit / max(1, len(sm)) > 0.7

def poly(draw, pts, fill, outline=None, width=1):
    pts = [(px(x), px(y)) for x, y in pts]
    if len(pts) > 2:
        draw.polygon(pts, fill=fill, outline=outline)

def line(draw, pts, fill, w_m):
    pts = [(px(x), px(y)) for x, y in pts]
    w = max(1, int(round(w_m * PXM)))
    draw.line(pts, fill=fill, width=w, joint="curve")
    r = w / 2
    for x, y in (pts[0], pts[-1]):
        draw.ellipse([x - r, y - r, x + r, y + r], fill=fill)

ROOFS = ['#8d5645', '#7e5242', '#6d5e52', '#867866', '#6b7066', '#94705b', '#9b8a75',
         '#5e6259', '#7a6a5a', '#a06a4e', '#736c60', '#8a7d6a', '#565a54', '#7d7264']

def build_pixel():
    W, H = px(W_M), px(H_M)
    img = Image.new("RGB", (W, H), '#736f66')   # Stadtpflaster als Grundfläche
    d = ImageDraw.Draw(img)

    els = data["elements"]
    def geom(e):
        return [(p["lat"], p["lon"]) for p in e.get("geometry", [])]

    # Landnutzung / Wasser / Plätze
    for e in els:
        t = e.get("tags", {})
        g = geom(e)
        if len(g) < 3: continue
        pts = [proj(a, b) for a, b in g]
        if t.get("natural") == "water" or t.get("waterway") == "riverbank":
            poly(d, pts, '#3f6672')
        elif t.get("landuse") in ("grass", "meadow", "forest") or t.get("leisure") in ("park", "garden"):
            poly(d, pts, '#4f6a43')
        elif t.get("landuse") == "pedestrian" or t.get("highway") == "pedestrian":
            poly(d, pts, '#8d887d')

    # Straßen (breit nach Klasse, von breit nach schmal)
    roads = [e for e in els if e.get("tags", {}).get("highway") and len(geom(e)) > 1]
    widths = {"motorway": 11, "trunk": 11, "primary": 10, "secondary": 9, "tertiary": 8,
              "residential": 6, "service": 4, "footway": 0, "cycleway": 0, "path": 0}
    skip = {"footway", "cycleway", "path", "steps", "corridor", "pedestrian", "crossing"}
    for e in roads:
        hw = e["tags"]["highway"]
        if hw in skip or hw in ("service", "track", "driveway", "parking_aisle"): continue
        w = widths.get(hw, 5)
        pts = dp([proj(a, b) for a, b in geom(e)], 1.2)
        line(d, pts, '#3d4043', w + 1.6)          # Bordstein
        line(d, pts, '#4d5054', w)

    # Tramgleise: Bett + zwei Schienen
    tram_raw = [e for e in els if e.get("tags", {}).get("railway") == "tram" and len(geom(e)) > 1]
    tram = []
    taken = []
    for e in tram_raw:
        simp = dp([proj(a, b) for a, b in geom(e)], 1.0)
        if len(simp) > 2 or True:
            sm = samples(simp)
            if is_dup(sm, taken):
                continue
            taken.extend(sm)
            tram.append((e, simp))
    for e, pts in tram:
        line(d, pts, '#414447', 3.6)
    for e, pts in tram:
        # Schienen seitlich versetzt, entlang der vereinfachten Linie
        for side in (-0.72, 0.72):  # Meterspur: 1,44 m
            off = []
            for i in range(len(pts)):
                p0 = pts[max(0, i - 1)]; p1 = pts[min(len(pts) - 1, i + 1)]
                ang = math.atan2(p1[1] - p0[1], p1[0] - p0[0])
                off.append((pts[i][0] - math.sin(ang) * side, pts[i][1] + math.cos(ang) * side))
            line(d, off, '#b2b6b8', 0.22)

    # Bahnsteige
    for e in els:
        t = e.get("tags", {})
        if t.get("railway") != "platform": continue
        g = geom(e)
        if len(g) < 3: continue
        pts = [proj(a, b) for a, b in g]
        poly(d, pts, '#2f322e')                       # Schattenkante
        sh = [(x - 0.0, y + 1.2) for x, y in pts]
        poly(d, sh, '#2f322e')
        poly(d, pts, '#d8cfb9', outline='#8d8574')    # Bahnsteigfläche
        poly(d, [(x + (W_M/2 - x) * 0.06, y + (H_M/2 - y) * 0.06) for x, y in pts], '#e6dfcb')

    # Gebäude mit Schatten
    for e in els:
        t = e.get("tags", {})
        if "building" not in t: continue
        g = geom(e)
        if len(g) < 3: continue
        pts = [proj(a, b) for a, b in g]
        sh = [(x + 2.4, y + 2.4) for x, y in pts]
        poly(d, sh, '#3a3f38')
    for e in els:
        t = e.get("tags", {})
        if "building" not in t: continue
        g = geom(e)
        if len(g) < 3: continue
        pts = [proj(a, b) for a, b in g]
        roof = ROOFS[int(hashf(e["id"]) * len(ROOFS))]
        poly(d, pts, roof, outline='#2f322c')

    # Bäume
    for e in els:
        if e.get("type") != "node" or e.get("tags", {}).get("natural") != "tree": continue
        x, y = proj(e["lat"], e["lon"])
        r = 3.2
        d.ellipse([px(x - r), px(y - r), px(x + r), px(y + r)], fill='#33502f')
        d.ellipse([px(x - r * 0.6), px(y - r * 0.7), px(x + r * 0.6), px(y + r * 0.5)], fill='#557a48')

    return img

pix = build_pixel()
os.makedirs("artifacts/tiles", exist_ok=True)
pix.resize((pix.width * 2, pix.height * 2), Image.NEAREST).save(f"artifacts/tiles/{NAME}.png")
if os.environ.get("SKIP_SAT"):
    print("tile", NAME); raise SystemExit(0)
sat = satellite(W_M, H_M)

# Vergleichsblatt
pad = 8
sheet = Image.new("RGB", (sat.width * 2 + pad * 3, sat.height + 44), (12, 16, 20))
sheet.paste(sat, (pad, 32))
sheet.paste(pix, (sat.width + pad * 2, 32))
dd = ImageDraw.Draw(sheet)
dd.text((pad + 2, 10), "Satellit (Referenz)", fill=(190, 205, 215))
dd.text((sat.width + pad * 2 + 2, 10), "Pixel-Kachel 1 m = 3,2 px", fill=(240, 170, 0))
sheet.save(f"artifacts/tile-{NAME}.jpg", quality=90, optimize=True)
pix.resize((pix.width * 2, pix.height * 2), Image.NEAREST).save(f"artifacts/tile-{NAME}-2x.png")
print("saved", sheet.size)

# Kontrollbild: Pixelkachel halbtransparent über dem Satelliten
ov = Image.blend(sat, pix, 0.55)
ov.save(f"artifacts/tile-{NAME}-overlay.jpg", quality=90)
