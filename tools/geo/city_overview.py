"""Setzt alle Korridor-Kacheln zu einer Netzübersicht zusammen."""
import json
import math
import os

from PIL import Image, ImageDraw, ImageFont

LAT, LON = 51.0520, 13.7370
CELL = 600
TILE_M = 640
PXM = 3.2
OX = OY = 13000           # Meter-Offset, damit alle Zellen positiv liegen
SCALE = 0.18              # px je Meter in der Übersicht
OUT = "assets/world/city-overview.jpg"
TILES = "assets/world/tiles"
K = math.cos(math.radians(LAT))


def main():
    man = json.load(open(f"{TILES}/manifest.json"))
    cells = [v for v in man.values()]
    xs = [c["cx"] * CELL - 20 + OX for c in cells]
    ys = [c["cy"] * CELL - 20 + OY for c in cells]
    x0, y0 = min(xs) - TILE_M, min(ys) - TILE_M
    x1, y1 = max(xs) + TILE_M * 2, max(ys) + TILE_M * 2
    W = int((x1 - x0) * SCALE)
    H = int((y1 - y0) * SCALE)
    img = Image.new("RGB", (W, H), (10, 13, 17))
    n = 0
    for c in cells:
        path = f"{TILES}/{c['cx']}_{c['cy']}.jpg"
        if not os.path.exists(path):
            continue
        t = Image.open(path)
        s = int(TILE_M * SCALE)
        t = t.resize((s, s), Image.LANCZOS)
        px = int((c["cx"] * CELL - 20 + OX - x0) * SCALE)
        py = int((c["cy"] * CELL - 20 + OY - y0) * SCALE)
        img.paste(t, (px, py))
        n += 1
    d = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 13)
        fontb = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 17)
    except Exception:
        font = fontb = ImageFont.load_default()
    stops = json.load(open("tools/geo/stops_matched.json"))["matched"]
    for s in stops:
        x = ((s["lon"] - LON) * 111320 * K + OX - x0) * SCALE
        y = ((LAT - s["lat"]) * 111320 + OY - y0) * SCALE
        if not (0 <= x < W and 0 <= y < H):
            continue
        d.ellipse([x - 3, y - 3, x + 3, y + 3], fill=(247, 166, 0), outline=(10, 10, 10))
        d.text((x + 5, y - 6), s["name"], font=font, fill=(255, 255, 255),
               stroke_width=3, stroke_fill=(8, 12, 16))
    d.text((16, 12), "Dresden — ganzes Netz", font=fontb, fill=(255, 255, 255),
           stroke_width=3, stroke_fill=(8, 12, 16))
    d.text((16, 32), f"{n} Korridor-Kacheln · {CELL} m Raster · {SCALE} px/m", font=font,
           fill=(247, 166, 0), stroke_width=3, stroke_fill=(8, 12, 16))
    img.save(OUT, quality=88, optimize=True)
    json.dump({"w": W, "h": H, "pxm": SCALE, "ox": OX, "oy": OY, "x0": x0, "y0": y0,
               "lat": LAT, "lon": LON}, open("assets/world/city-overview.json", "w"))
    print(f"{n} Kacheln -> {OUT} {W}x{H} {os.path.getsize(OUT)/1e6:.1f} MB")


if __name__ == "__main__":
    main()
