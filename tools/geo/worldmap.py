"""Große Weltkarte: die Stadt in einem Bild, aus einem Raster von OSM-Patches.

Die OSM-Map-API liefert pro Anfrage nur ~50k Knoten, deshalb wird die Fläche in
600-m-Quadrate zerlegt, jedes einzeln geholt (und gecacht) und danach in einem
einzigen Bild gerendert. Dadurch gibt es keine Kachelkanten: Straßen und Gleise
werden aus den vollständigen Ways gezeichnet, auch über die Patchgrenzen.

    python3 tools/geo/worldmap.py            # holt + rendert
    python3 tools/geo/worldmap.py --render   # nur neu rendern (Cache vorhanden)
"""
import json
import math
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tilegen import Tile, fetch_osm   # noqa: E402
import landmarks                     # noqa: E402

LAT, LON = 51.0520, 13.7370
W_M, H_M = 2800, 2500
PATCH = 600
CACHE = "tools/geo/world_cache"
MERGED = "tools/geo/tile_cache_world.json"
OUT = "assets/world/map.png"


def grid():
    """Mittelpunkte der Patches, die die Fläche vollständig abdecken."""
    nx = math.ceil(W_M / PATCH)
    ny = math.ceil(H_M / PATCH)
    pts = []
    for j in range(ny):
        for i in range(nx):
            x = -W_M / 2 + (i + 0.5) * W_M / nx
            y = -H_M / 2 + (j + 0.5) * H_M / ny
            dlat = y / 111320.0
            dlon = x / (111320.0 * math.cos(math.radians(LAT)))
            pts.append((LAT + dlat, LON + dlon))
    return pts, nx, ny


def collect(pts):
    os.makedirs(CACHE, exist_ok=True)
    elems = {}
    for i, (la, lo) in enumerate(pts):
        path = f"{CACHE}/p_{i:02d}.json"
        if os.path.exists(path):
            d = json.load(open(path))
            state = "cache"
        else:
            for attempt in range(4):
                try:
                    d = fetch_osm(la, lo, PATCH, PATCH)
                    break
                except Exception as e:
                    print(f"  Patch {i + 1:02d} Versuch {attempt + 1} fehlgeschlagen: {e}", flush=True)
                    time.sleep(8)
            else:
                print(f"  Patch {i + 1:02d} endgültig fehlgeschlagen", flush=True)
                continue
            json.dump(d, open(path, "w"))
            state = "neu"
            time.sleep(1.0)
        for e in d["elements"]:
            elems[(e["type"], e["id"])] = e
        print(f"  Patch {i + 1:02d}/{len(pts)} ({state}): {len(d['elements'])} Elemente, "
              f"gesamt {len(elems)}", flush=True)
        json.dump({"elements": list(elems.values())}, open(MERGED, "w"))
    return elems


def main():
    only_render = "--render" in sys.argv
    pts, nx, ny = grid()
    print(f"Weltkarte {W_M} x {H_M} m, {nx} x {ny} Patches zu {PATCH} m")
    if not only_render:
        elems = collect(pts)
        print(f"  gesamt {len(elems)} Elemente -> {MERGED}")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    t = Tile(LAT, LON, "world", W_M, H_M, relations=True, dedupe=True, auto_centre=False)
    t.hooks += [landmarks.hauptbahnhof, landmarks.albertplatz, landmarks.elbbruecken]
    img = t.build()
    img.save(OUT, optimize=True)
    print(f"  Karte {img.size[0]} x {img.size[1]} px, "
          f"{os.path.getsize(OUT) / 1e6:.1f} MB -> {OUT}", flush=True)


if __name__ == "__main__":
    main()
