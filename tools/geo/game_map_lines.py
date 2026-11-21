"""Vektorkarte je Linie für die Spielansicht (alle Linien aus assets/world/lines.json).

    python3 tools/geo/game_map_lines.py

Schreibt assets/game/map_<linie>.json – Korridor um den jeweiligen Gleisverlauf,
Meter-Koordinaten (x Ost, y Süd), gleiche Struktur wie die alte line1_map.json.
"""
import glob
import json
import math
import os
import sys

LAT, LON, PXM = 51.0520, 13.7370, 3.2
K = math.cos(math.radians(LAT))
CORR = 110.0
ROAD_W = {
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
    mi, md = 0, -1.0
    for i in range(1, len(pts) - 1):
        px, py = pts[i]
        d = abs(dy * (px - ax) - dx * (py - ay)) / n
        if d > md:
            md, mi = d, i
    if md <= tol:
        return [pts[0], pts[-1]]
    return dp(pts[:mi + 1], tol)[:-1] + dp(pts[mi:], tol)


def simplify(pts, tol):
    if len(pts) > 2 and abs(pts[0][0] - pts[-1][0]) < 1e-6 and abs(pts[0][1] - pts[-1][1]) < 1e-6:
        return pts
    return dp(pts, tol)


def build_line(lid, chain):
    path = [xy(la, lo) for la, lo in chain]
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
                        if best <= 1:
                            return True
        return best <= r

    def near_way(pts, r=CORR):
        """Auch lange Wege mit weit auseinanderliegenden Knoten erwischen:
        jedes Segment alle 20 m abtasten, damit keine Straße ausfaellt."""
        for (ax, ay), (bx, by) in zip(pts, pts[1:]):
            n = max(1, int(math.hypot(bx - ax, by - ay) / 20))
            for k in range(n + 1):
                f = k / n
                if near(ax + (bx - ax) * f, ay + (by - ay) * f, r):
                    return True
        return near(pts[0][0], pts[0][1], r)

    seen = set()
    green, water, builds, roads, trees = [], [], [], [], []
    stat = {"build": 0, "green": 0, "water": 0, "road": 0, "tree": 0}

    for f in sorted(glob.glob("tools/geo/city_cache/tile_cache_c*_*.json")):
        for e in json.load(open(f)).get("elements", []):
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
            if not near_way(pts):
                continue

            if "building" in t and len(pts) >= 3:
                p = simplify(pts, 0.8)
                if len(p) >= 3:
                    builds.append([round(v, 1) for q in p for v in q])
                    stat["build"] += 1
                    seen.add(key)
                continue
            if t.get("natural") == "water" or t.get("waterway") == "riverbank" or t.get("water"):
                if len(pts) >= 3:
                    p = simplify(pts, 1.2)
                    water.append([round(v, 1) for q in p for v in q])
                    stat["water"] += 1
                    seen.add(key)
                continue
            if (t.get("landuse") in ("grass", "meadow", "forest", "village_green", "recreation_ground",
                                     "flowerbed", "cemetery", "allotments")
                    or t.get("leisure") in ("park", "garden", "pitch", "playground")
                    or t.get("natural") in ("wood", "scrub", "grassland", "heath")):
                if len(pts) >= 3:
                    p = simplify(pts, 1.4)
                    green.append([round(v, 1) for q in p for v in q])
                    stat["green"] += 1
                    seen.add(key)
                continue
            hw = t.get("highway")
            if hw and hw != "street_lamp" and len(pts) >= 2:
                p = simplify(pts, 1.0)
                roads.append({"c": hw, "w": ROAD_W.get(hw, 1.6),
                              "p": [round(v, 1) for q in p for v in q]})
                stat["road"] += 1
                seen.add(key)
                continue
            if t.get("natural") == "tree":
                if near(pts[0][0], pts[0][1], 55):
                    trees.append([round(pts[0][0], 1), round(pts[0][1], 1)])
                    stat["tree"] += 1
                seen.add(key)

    rails = []
    for e in json.load(open("tools/geo/tracks_raw.json"))["elements"]:
        t = e.get("tags") or {}
        if t.get("railway") not in ("tram", "rail", "light_rail"):
            continue
        pts = [xy(p["lat"], p["lon"]) for p in e.get("geometry", [])]
        if len(pts) < 2 or not near_way(pts):
            continue
        p = simplify(pts, 0.6)
        rails.append([round(v, 1) for q in p for v in q])

    doc = {"origin": [LAT, LON], "pxm": PXM, "corridor": CORR,
           "layers": {"green": green, "water": water, "buildings": builds,
                      "roads": roads, "rails": rails, "trees": trees}}
    out = f"assets/game/map_{lid}.json"
    json.dump(doc, open(out, "w"), separators=(",", ":"))
    print(f"Linie {lid}: {stat} rails {len(rails)} "
          f"{os.path.getsize(out) / 1e6:.2f} MB", flush=True)


def main():
    os.makedirs("assets/game", exist_ok=True)
    doc = json.load(open("assets/world/lines.json"))["lines"]
    only = sys.argv[1:] or list(doc)
    for lid in only:
        build_line(lid, doc[lid]["chain"])


main()
