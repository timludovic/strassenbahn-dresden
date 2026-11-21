"""Contact sheet: satellite crops of selected Dresden tram stops to classify platform types."""
import json, math, os, urllib.request
from io import BytesIO
from PIL import Image, ImageDraw

UA = {"User-Agent": "strassenbahn-dresden-dev/0.1"}
TILE = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
NAMES = ["Altmarkt", "Pirnaischer Platz", "Postplatz", "Albertplatz", "Hauptbahnhof", "Straßburger Platz",
         "Fetscherplatz", "Leipziger Straße", "Prohlis, Gleisschleife", "Schillerplatz"]

def merc(lat, lon, z):
    n = 2 ** z
    x = (lon + 180.0) / 360.0 * n
    s = math.sin(math.radians(lat))
    y = (0.5 - math.log((1 + s) / (1 - s)) / (4 * math.pi)) * n
    return x, y

def tile(z, x, y):
    p = f"/tmp/tiles/{z}_{x}_{y}.jpg"
    if os.path.exists(p):
        return Image.open(p).convert("RGB")
    req = urllib.request.Request(TILE.format(z=z, x=x, y=y), headers=UA)
    data = urllib.request.urlopen(req, timeout=30).read()
    os.makedirs("/tmp/tiles", exist_ok=True)
    open(p, "wb").write(data)
    return Image.open(BytesIO(data)).convert("RGB")

raw = json.load(open("tools/geo/stops_raw.json"))
groups = {}
for e in raw["elements"]:
    n = e.get("tags", {}).get("name")
    if not n:
        continue
    for want in NAMES:
        if n.lower().startswith(want.lower()) or want.lower() in n.lower():
            groups.setdefault(want, []).append(e)
            break

z = 19
W_M, H_M = 260.0, 150.0
cols, rows = 2, 5
cw, ch = 520, 320
sheet = Image.new("RGB", (cols * cw, rows * ch), (12, 16, 20))
draw = ImageDraw.Draw(sheet)

for i, name in enumerate(NAMES):
    els = groups.get(name)
    if not els:
        print("kein Stop:", name); continue
    lat = sum(e["lat"] for e in els) / len(els)
    lon = sum(e["lon"] for e in els) / len(els)
    x0, y0 = merc(lat, lon, z)
    m_per_px = 156543.03392 * math.cos(math.radians(lat)) / (2 ** z)
    wpx, hpx = int(W_M / m_per_px), int(H_M / m_per_px)
    img = Image.new("RGB", (wpx, hpx))
    for tx in range(int(x0 - wpx / 512), int(x0 + wpx / 512) + 1):
        for ty in range(int(y0 - hpx / 512), int(y0 + hpx / 512) + 1):
            img.paste(tile(z, tx, ty), (int((tx - x0) * 256 + wpx / 2), int((ty - y0) * 256 + hpx / 2)))
    img = img.resize((cw, ch), Image.LANCZOS)
    px, py = (i % cols) * cw, (i // cols) * ch
    sheet.paste(img, (px, py))
    d2 = ImageDraw.Draw(sheet)
    d2.text((px + 8, py + 6), f"{name}  ({len(els)} Haltepositionen)", fill=(255, 235, 120),
            stroke_width=2, stroke_fill=(0, 0, 0))
    d2.rectangle([px, py, px + cw - 1, py + ch - 1], outline=(40, 50, 60))

sheet.save("artifacts/haltestellen-sheet.jpg", quality=88, optimize=True)
print("saved artifacts/haltestellen-sheet.jpg", sheet.size)
