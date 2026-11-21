"""Baut die Vektorkarte fuer die Spielansicht entlang der Linie 1.

    python3 tools/geo/game_map.py

Liest die OSM-Caches der Kacheln, behaelt alles im Korridor +-115 m um den
Linienverlauf und schreibt daraus assets/game/line1_map.json (Meter, x Ost, y Sued).
"""
import json
import math
import os
import glob

LAT, LON, PXM = 51.0520, 13.7370, 3.2
K = math.cos(math.radians(LAT))
CORR = 115.0
OUT = "assets/game/line1_map.json"

ROAD_W = {  # halbe Breite in m
    "motorway": 7.0, "trunk": 6.5, "primary": 6.0, "secondary": 5.0,
    "tertiary": 4.5, "unclassified": 3.6, "residential": 3.4, "living_street": 3.2,
    "pedestrian": 3.0, "service": 2.2, "track": 1.8, "cycleway": 1.6,
    "footway": 1.1, "path": 1.0, "steps": 1.4, "bridleway": 1.0,
}


def xy(lat, lon):
    return ((lon - LON) * 111320 * K, (LAT - lat) * 111320)


def dp(pts, tol):
    if len(pts) < 3:
        return pts
    ax, ay = pts[0]
    bx, by = pts[-1]
    dx, dy = bx - ax, by - ay
    n = math.hypot(dx, dy) or 1e-9
    mi, md = 0, -1
    for i in range(1, len(pts) - 1):
        px, py = pts[i]
        d = abs(dy * (px - ax) - dx * (py - ay)) / n
        if d > md:
            md, mi = d, i
    if md <= tol:
        return [pts[0], pts[-1]]
    a = dp(pts[:mi + 1], tol)
    b = dp(pts[mi:], tol)
    return a[:-1] + b


def simplify(pts, tol):
    """Geschlossene Ringe unangetastet lassen, sonst Douglas-Peucker."""
    if len(pts) > 2 and abs(pts[0][0] - pts[-1][0]) < 1e-6 and abs(pts[0][1] - pts[-1][1]) < 1e-6:
        return pts
    return dp(pts, tol)


def main():
    os.makedirs("assets/game", exist_ok=True)
    ch = json.load(open("assets/world/line1.json"))["chain"]
    path = [xy(la, lo) for la, lo in ch]

    # Raster: 100-m-Zellen -> Indizes der Pfadpunkte
    grid = {}
    for i, (x, y) in enumerate(path):
        grid.setdefault((int(x // 100), int(y // 100)), []).append(i)

    def near(x, y, r=CORR):
        gx, gy = int(x // 100), int(y // 100)
        best = 1e9
        for i in range(gx - 2, gx + 3):
            for j in range(gy - 2, gy + 3):
                for k in grid.get((i, j), ()):
                    px, py = path[k]
                    d = math.hypot(px - x, py - y)
                    if d < best:
                        best = d
        return best <= r

    seen = set()
    green, water, builds, roads, trees = [], [], [], [], []
    stat = {"build": 0, "green": 0, "water": 0, "road": 0, "tree": 0}

    for f in sorted(glob.glob("tools/geo/city_cache/tile_cache_c*_*.json")):
        els = json.load(open(f)).get("elements", [])
        for e in els:
            t = e.get("tags") or {}
            key = (e.get("type"), e.get("id"))
            if key in seen:
                continue
            geom = e.get("geometry") or ([e] if "lat" in e else [])
            if not geom:
                continue
            pts = [xy(p["lat"], p["lon"]) for p in geom if "lat" in p]
            if not pts:
                continue
            if not any(near(x, y) for x, y in pts[::max(1, len(pts) // 12)]):
                continue

            if "building" in t and len(pts) >= 3:
                p = simplify(pts, 0.8)
                if len(p) >= 3:
                    builds.append([round(v, 1) for xy_ in p for v in xy_])
                    stat["build"] += 1
                    seen.add(key)
                continue
            if t.get("natural") == "water" or t.get("waterway") == "riverbank" or t.get("water"):
                if len(pts) >= 3:
                    p = simplify(pts, 1.0)
                    water.append([round(v, 1) for xy_ in p for v in xy_])
                    stat["water"] += 1
                    seen.add(key)
                continue
            if (t.get("landuse") in ("grass", "meadow", "forest", "village_green", "recreation_ground",
                                     "flowerbed", "cemetery", "allotments")
                    or t.get("leisure") in ("park", "garden", "pitch", "playground")
                    or t.get("natural") in ("wood", "scrub", "grassland", "heath")):
                if len(pts) >= 3:
                    p = simplify(pts, 1.2)
                    green.append([round(v, 1) for xy_ in p for v in xy_])
                    stat["green"] += 1
                    seen.add(key)
                continue
            hw = t.get("highway")
            if hw and hw != "street_lamp" and len(pts) >= 2:
                p = simplify(pts, 1.0)
                roads.append({"c": hw, "w": ROAD_W.get(hw, 1.6), "p": [round(v, 1) for xy_ in p for v in xy_]})
                stat["road"] += 1
                seen.add(key)
                continue
            if t.get("natural") == "tree":
                if near(pts[0][0], pts[0][1], 70):
                    trees.append([round(pts[0][0], 1), round(pts[0][1], 1)])
                    stat["tree"] += 1
                seen.add(key)

    rails = []
    for e in json.load(open("tools/geo/tracks_raw.json"))["elements"]:
        t = e.get("tags") or {}
        if t.get("railway") not in ("tram", "rail", "light_rail"):
            continue
        pts = [xy(p["lat"], p["lon"]) for p in e.get("geometry", [])]
        if len(pts) < 2 or not any(near(x, y) for x, y in pts):
            continue
        p = simplify(pts, 0.5)
        rails.append([round(v, 1) for xy_ in p for v in xy_])

    doc = {"origin": [LAT, LON], "pxm": PXM, "corridor": CORR,
           "layers": {"green": green, "water": water, "buildings": builds,
                      "roads": roads, "rails": rails, "trees": trees}}
    json.dump(doc, open(OUT, "w"), separators=(",", ":"))
    mb = os.path.getsize(OUT) / 1e6
    print(stat, "rails", len(rails), f"{mb:.2f} MB")


if __name__ == "__main__":
    main()
