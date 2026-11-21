"""Crop a high-res aerial base for the design sheet (Altstadt around Altmarkt/Pirnaischer)."""
import json, math, os, urllib.request
from io import BytesIO
from PIL import Image

UA = {"User-Agent": "strassenbahn-dresden-dev/0.1"}
TILE = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"

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

lat0, lon0 = 51.0502, 13.7382      # zwischen Altmarkt und Pirnaischer Platz
W_M, H_M = 320.0, 180.0            # Ausschnitt in Metern
z = 19
x0, y0 = merc(lat0, lon0, z)
m_per_px = 156543.03392 * math.cos(math.radians(lat0)) / (2 ** z)
wpx = W_M / m_per_px
hpx = H_M / m_per_px
x1, y1 = x0 + wpx / 256, y0 + hpx / 256
img = Image.new("RGB", (int(wpx), int(hpx)))
for tx in range(int(x0), int(x1) + 1):
    for ty in range(int(y0), int(y1) + 1):
        img.paste(tile(z, tx, ty), (int((tx - x0) * 256), int((ty - y0) * 256)))
img = img.crop((0, 0, int(wpx), int(hpx)))
img.save("design/altstadt-base.jpg", quality=88, optimize=True)
print("saved design/altstadt-base.jpg", img.size, "m/px", round(m_per_px, 3))
print("bbox", lat0, lon0, W_M, H_M)
