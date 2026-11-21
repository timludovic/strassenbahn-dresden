"""Build the playable Altstadt demo level: one continuous pixel map + route data.

    python3 tools/geo/demo_level.py

Writes assets/demo/map.png (1 m = 3,2 px) and assets/demo/level.json with the
tram path along the real OSM tracks and the stop positions.
"""
import heapq
import json
import math
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tilegen import Tile, dp   # noqa: E402
import landmarks               # noqa: E402

LAT, LON = 51.0513, 13.7385
W_M, H_M = 969, 823
NAME = "demo_altstadt"

STOPS = [
    ("Theaterplatz", 51.05358, 13.73655),
    ("Postplatz", 51.04949, 13.73409),
    ("Altmarkt", 51.05024, 13.73865),
    ("Pirnaischer Platz", 51.04913, 13.74332),
]


def near_key(p, clusters):
    for c in clusters:
        if math.dist((p[0] * 111320, p[1] * 70030), (c[0] * 111320, c[1] * 70030)) < 14:
            return c
    clusters.append(p)
    return p


def buildings(t):
    out = []
    for e in t.data["elements"]:
        tg = e.get("tags", {})
        if e.get("type") == "way" and "building" in tg and len(e.get("geometry", [])) > 2:
            out.append(t.way_m(e))
    return out


def in_poly(p, poly):
    x, y = p
    c = False
    for (x1, y1), (x2, y2) in zip(poly, poly[1:] + poly[:1]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / ((y2 - y1) or 1e-9) + x1:
            c = not c
    return c


def on_buildings(t, way, polys):
    pts = t.way_m(way)
    sm = []
    for a, b in zip(pts, pts[1:]):
        n = max(1, int(math.dist(a, b) / 4))
        sm += [(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n) for i in range(n)]
    if not sm:
        return 0.0
    hits = sum(1 for p in sm if any(in_poly(p, q) for q in polys))
    return hits / len(sm)


def build_path(t):
    polys = buildings(t)
    ways = []
    dropped = 0
    for e in t.data["elements"]:
        if e.get("tags", {}).get("railway") != "tram" or len(e.get("geometry", [])) < 2:
            continue
        if on_buildings(t, e, polys) > 0.35:
            dropped += 1
            continue
        ways.append(e)
    print(f"  Gleiswege: {len(ways)} nutzbar, {dropped} verworfen (liegen in Geb\u00e4uden)")
    clusters = []
    keyed = []
    for e in ways:
        pts = [(q["lat"], q["lon"]) for q in e["geometry"]]
        pts[0] = near_key(pts[0], clusters)
        pts[-1] = near_key(pts[-1], clusters)
        keyed.append(pts)

    adj = {}
    for pts in keyed:
        for a, b in zip(pts, pts[1:]):
            d = math.dist((a[0] * 111320, a[1] * 70030), (b[0] * 111320, b[1] * 70030))
            adj.setdefault(a, []).append((b, d))
            adj.setdefault(b, []).append((a, d))

    def nearest(lat, lon):
        return min(adj, key=lambda k: math.dist((k[0] * 111320, k[1] * 70030),
                                                (lat * 111320, lon * 70030)))

    start, goal = nearest(*STOPS[0][1:]), nearest(*STOPS[-1][1:])
    dist = {start: 0.0}
    prev = {}
    pq = [(0.0, start)]
    while pq:
        d, u = heapq.heappop(pq)
        if u == goal:
            break
        if d > dist.get(u, 1e18):
            continue
        for v, w in adj[u]:
            nd = d + w
            if nd < dist.get(v, 1e18):
                dist[v] = nd
                prev[v] = u
                heapq.heappush(pq, (nd, v))
    if goal not in dist:
        raise SystemExit("keine Gleisverbindung gefunden")

    chain, u = [], goal
    while u != start:
        chain.append(u)
        u = prev[u]
    chain.append(start)
    chain.reverse()

    path = [t.proj(la, lo) for la, lo in chain]
    path = dp(path, 0.5)

    # Am ersten Erreichen der letzten Haltestelle abschneiden (kein Umweg zum
    # nächstgelegenen Gleisknoten).
    gx, gy = t.proj(STOPS[-1][1], STOPS[-1][2])
    for i, p in enumerate(path):
        if math.dist(p, (gx, gy)) < 9:
            path = path[:i + 1]
            break
    return path


def lead_in(start, rails, dist=60.0):
    """Gleisstück vor dem Startpunkt, damit der ganze Wagen auf der Strecke steht."""
    best = None
    for poly in rails:
        for i, (x, y) in enumerate(poly):
            d = math.dist((x, y), start)
            if best is None or d < best[0]:
                best = (d, poly, i)
    if not best or best[0] > 8:
        return []
    d, poly, i = best

    near = [poly[i]]
    run = 0.0
    j = i
    while j > 0 and run < dist:
        run += math.dist(poly[j], poly[j - 1])
        j -= 1
        near.append(poly[j])
    if run < 15:
        return []

    # von hinten nach vorn exakt auf dist kürzen, Liste läuft rückwärts (nah -> fern)
    seq, acc = [near[0]], 0.0
    for a, b in zip(near, near[1:]):
        seg = math.dist(a, b)
        if acc + seg >= dist:
            f = (dist - acc) / seg
            seq.append((a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f))
            break
        seq.append(b)
        acc += seg
    return list(reversed(seq))


def main():
    t = Tile(LAT, LON, NAME, W_M, H_M, relations=True, dedupe=False, auto_centre=False)
    t.hooks += [landmarks.zwinger, landmarks.frauenkirche]
    img = t.build()
    os.makedirs("assets/demo", exist_ok=True)
    img.save("assets/demo/map.png", optimize=True)

    # proj() liefert Kartenkoordinaten 0..W; die Demo rechnet ab Kartenmitte
    rails = []
    for e in t.ways(railway="tram"):
        pts = [(x - W_M / 2, y - H_M / 2) for x, y in dp(t.way_m(e), 0.8)]
        if len(pts) >= 2:
            rails.append([[round(x, 1), round(y, 1)] for x, y in pts])

    path = [(x - W_M / 2, y - H_M / 2) for x, y in build_path(t)]
    lead = lead_in(path[0], rails)
    if lead:
        path = lead + path
        print(f"  Vorlauf: {sum(math.dist(a, b) for a, b in zip(lead, lead[1:] + path[:1])):.0f} m Gleis vor dem Start")
    # Bogenlänge
    cum = [0.0]
    for a, b in zip(path, path[1:]):
        cum.append(cum[-1] + math.dist(a, b))
    total = cum[-1]

    def at(s):
        s = max(0.0, min(total, s))
        for i in range(1, len(cum)):
            if cum[i] >= s:
                f = (s - cum[i - 1]) / ((cum[i] - cum[i - 1]) or 1e-9)
                a, b = path[i - 1], path[i]
                return (a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f)
        return path[-1]

    # Kontrolle: liegt der Weg auf gezeichnetem Gleisbett?
    bed = {(0x41, 0x44, 0x47), (0xcf, 0xd3, 0xd5), (0xb2, 0xb6, 0xb8)}

    def on_rail(x, y):
        cx, cy = int((x + W_M / 2) * t.pxm), int((y + H_M / 2) * t.pxm)
        if not (3 <= cx < img.width - 3 and 3 <= cy < img.height - 3):
            return False
        for dx in (-2, -1, 0, 1, 2):
            for dy in (-2, -1, 0, 1, 2):
                if img.getpixel((cx + dx, cy + dy)) in bed:
                    return True
        return False

    probe = []
    for a, b in zip(path, path[1:]):
        n = max(1, int(math.dist(a, b) / 3))
        probe += [(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n) for i in range(n)]
    hit = sum(1 for p in probe if on_rail(*p)) / max(1, len(probe))
    print(f"  Gleis-Abdeckung: {hit * 100:.0f}% der Wegpunkte auf gezeichnetem Gleis")

    stops = []
    for name, la, lo in STOPS:
        x, y = t.proj(la, lo)
        x -= W_M / 2
        y -= H_M / 2
        best = min(range(len(path)), key=lambda i: math.dist(path[i], (x, y)))
        stops.append({"name": name, "s": round(cum[best], 1),
                      "x": round(path[best][0], 1), "y": round(path[best][1], 1)})

    level = {
        "name": "Altstadt",
        "rails": rails,
        "pxm": t.pxm,
        "wm": W_M, "hm": H_M,
        "mapW": img.width, "mapH": img.height,
        "cx": t.lon, "cy": t.lat,
        "line": "1",
        "path": [[round(x, 1), round(y, 1)] for x, y in path],
        "cum": [round(c, 1) for c in cum],
        "length": round(total, 1),
        "stops": stops,
    }
    json.dump(level, open("assets/demo/level.json", "w"), indent=1)
    print("map", img.size, "->", round(os.path.getsize("assets/demo/map.png") / 1e6, 2), "MB")
    print("path", len(path), "Punkte,", round(total), "m")
    for s in stops:
        print("  Stop", s["name"], "bei", s["s"], "m")


if __name__ == "__main__":
    main()
