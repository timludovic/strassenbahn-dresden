"""Schneidet aus der Weltkarte nur den Korridor links und rechts der Gleise.

    python3 tools/geo/corridor.py [halbbreite_m]

Alles ausserhalb des Streifens wird transparent – im Spiel wird nur das
gezeichnet, was man von der Bahn aus wirklich sieht.
"""
import json
import math
import os
import sys

from PIL import Image, ImageDraw, ImageFilter

LAT, LON, PXM = 51.0520, 13.7370, 3.2
MAP = "assets/world/map.png"
OUT = "assets/world/corridor.png"
VIEW = "assets/world/corridor-view.png"
HALF = float(sys.argv[1]) if len(sys.argv) > 1 else 70.0


def main():
    im = Image.open(MAP).convert("RGBA")
    W, H = im.size
    K = math.cos(math.radians(LAT))
    mask = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(mask)
    data = json.load(open("tools/geo/tracks_raw.json"))
    n = 0
    for e in data["elements"]:
        pts = [(p["lat"], p["lon"]) for p in e.get("geometry", [])]
        if len(pts) < 2:
            continue
        xy = [((lo - LON) * 111320 * K * PXM + W / 2,
               (LAT - la) * 111320 * PXM + H / 2) for la, lo in pts]
        d.line(xy, fill=255, width=int(HALF * 2 * PXM), joint="curve")
        n += 1
    print(f"  {n} Gleiswege, Korridor ±{HALF:.0f} m")
    mask = mask.filter(ImageFilter.GaussianBlur(3))
    im.putalpha(mask)
    im.save(OUT, optimize=True)
    vw = 6000
    vh = round(H * vw / W)
    im.resize((vw, vh), Image.LANCZOS).save(VIEW, optimize=True)
    print(f"  {OUT} {os.path.getsize(OUT)/1e6:.1f} MB, {VIEW} {os.path.getsize(VIEW)/1e6:.1f} MB")


if __name__ == "__main__":
    main()
