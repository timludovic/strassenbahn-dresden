"""Ermittelt eingleisige Abschnitte je Linie aus den echten OSM-Gleisen.

    python3 tools/geo/single_track.py            # schreiben
    python3 tools/geo/single_track.py --check    # nur Bericht

Doppelgleisige Straßen sind in OSM als zwei parallele Einbahn-Gleise gemappt,
eingleisige Abschnitte als ein einzelnes Gleis, das beide Richtungen nutzen.
Für jeden Punkt der Linienkette wird deshalb geprüft, ob in Gleisbreite ein
zweites, paralleles Tramgleis liegt. Fehlt es, ist der Abschnitt eingleisig.
Das Ergebnis landet als `single` (Liste von [s0, s1] in Metern) in lines.json.
"""
import json
import math
import sys

LAT0 = 51.0520
M_LAT = 111320.0
KX = M_LAT * math.cos(math.radians(LAT0))
STEP = 4.0          # Abtastabstand längs der Strecke
PARALLEL = 7.0      # so nah muss das zweite Gleis liegen (Meter)
ANGLE_TOL = 0.5     # rad – nur wirklich parallele Gleise zählen
MIN_LEN = 45.0      # kürzere Einzelstücke sind Mapping-Rauschen
MERGE_GAP = 35.0

OUT = "assets/world/lines.json"
TRACKS = "tools/geo/tracks_raw.json"


def xy(lat, lon):
    return ((lon - 13.7370) * KX, (LAT0 - lat) * M_LAT)


def build_segments():
    """Alle Tramsegmente mit Way-ID und Einbahn-Kennzeichen."""
    segs = []
    doc = json.load(open(TRACKS))
    for e in doc.get("elements", []):
        t = e.get("tags") or {}
        if t.get("railway") not in ("tram", "rail", "light_rail"):
            continue
        geom = e.get("geometry") or []
        if len(geom) < 2:
            continue
        way = e.get("id")
        oneway = t.get("oneway")
        tracks = t.get("tracks")
        pts = [xy(p["lat"], p["lon"]) for p in geom]
        for a, b in zip(pts, pts[1:]):
            dx, dy = b[0] - a[0], b[1] - a[1]
            L = math.hypot(dx, dy)
            if L < 0.4:
                continue
            segs.append({
                "way": way, "oneway": oneway, "tracks": tracks,
                "x0": a[0], "y0": a[1], "x1": b[0], "y1": b[1],
                "ang": math.atan2(dy, dx), "len": L,
            })
    return segs


def grid_index(segs, cell=40.0):
    grid = {}
    for i, s in enumerate(segs):
        xa, ya = int(s["x0"] // cell), int(s["y0"] // cell)
        xb, yb = int(s["x1"] // cell), int(s["y1"] // cell)
        for cx in range(min(xa, xb), max(xa, xb) + 1):
            for cy in range(min(ya, yb), max(ya, yb) + 1):
                grid.setdefault((cx, cy), []).append(i)
    return grid


def seg_dist(s, px, py):
    dx, dy = s["x1"] - s["x0"], s["y1"] - s["y0"]
    L2 = dx * dx + dy * dy
    t = 0.0 if L2 == 0 else max(0.0, min(1.0, ((px - s["x0"]) * dx + (py - s["y0"]) * dy) / L2))
    return math.hypot(s["x0"] + dx * t - px, s["y0"] + dy * t - py)


def ang_diff(a, b):
    d = abs((a - b + math.pi) % (2 * math.pi) - math.pi)
    return d


def parallel(a, b):
    """Richtung egal – Gegenrichtung ist dasselbe Gleisbett."""
    return min(ang_diff(a, b), math.pi - ang_diff(a, b)) < ANGLE_TOL


def chain_xy(chain):
    return [xy(p[0], p[1]) for p in chain]


def sample_chain(pts, step):
    """Punkte alle `step` Meter mit Kettendistanz s und Fahrtrichtung."""
    out = []
    s = 0.0
    for a, b in zip(pts, pts[1:]):
        dx, dy = b[0] - a[0], b[1] - a[1]
        L = math.hypot(dx, dy)
        if L < 1e-6:
            continue
        ang = math.atan2(dy, dx)
        n = max(1, int(L / step))
        for k in range(n):
            f = k / n
            out.append((s + L * f, a[0] + dx * f, a[1] + dy * f, ang))
        s += L
    if pts:
        out.append((s, pts[-1][0], pts[-1][1], out[-1][3] if out else 0.0))
    return out


def detect(line, segs, grid, cell=40.0):
    pts = chain_xy(line["chain"])
    samples = sample_chain(pts, STEP)
    single = []
    for (s, x, y, ang) in samples:
        cx, cy = int(x // cell), int(y // cell)
        own = None
        best = 1e9
        near = []
        for gx in (cx - 1, cx, cx + 1):
            for gy in (cy - 1, cy, cy + 1):
                for i in grid.get((gx, gy), ()):
                    sg = segs[i]
                    d = seg_dist(sg, x, y)
                    if d > PARALLEL + 2:
                        continue
                    near.append((d, sg))
                    if d < best:
                        best, own = d, sg
        second = None
        second_d = 1e9
        if own is not None:
            for d, sg in near:
                if sg["way"] == own["way"] or d <= 0.6:
                    continue
                if parallel(sg["ang"], ang) and d < second_d:
                    second_d, second = d, sg
        is_single = best <= 8.0
        if is_single and second is not None:
            is_single = False
        if is_single and own is not None:
            if own["tracks"] == "1":
                is_single = True
            elif own["tracks"] == "2":
                is_single = False
            elif own["oneway"] in ("yes", "-1", "reversible") and second is None:
                # Einbahn ohne sichtbaren Zwilling: eher einseitig gemappt als eingleisig
                is_single = False
        single.append(1 if is_single else 0)

    ranges = []
    start = None
    for i, v in enumerate(single):
        s = samples[i][0]
        if v and start is None:
            start = s
        elif not v and start is not None:
            ranges.append([start, s])
            start = None
    if start is not None:
        ranges.append([start, samples[-1][0]])

    merged = []
    for r in ranges:
        if merged and r[0] - merged[-1][1] < MERGE_GAP:
            merged[-1][1] = r[1]
        else:
            merged.append(list(r))
    return [[round(a, 1), round(b, 1)] for a, b in merged if b - a >= MIN_LEN]


def main():
    check = "--check" in sys.argv
    doc = json.load(open(OUT))
    segs = build_segments()
    grid = grid_index(segs)
    print(f"{len(segs)} Tramsegmente, {len(grid)} Rasterzellen")
    total_single = 0.0
    for lid, line in doc["lines"].items():
        rng = detect(line, segs, grid)
        doc["lines"][lid]["single"] = rng
        length = sum(b - a for a, b in rng)
        total_single += length
        print(f"Linie {lid:>2}: {len(rng):2d} Abschnitte, {length / 1000:5.2f} km eingleisig"
              f"  {['%.0f-%.0f' % (a, b) for a, b in rng[:4]]}")
    if not check:
        json.dump(doc, open(OUT, "w"))
        print("geschrieben:", OUT)
    print(f"eingleisig gesamt: {total_single / 1000:.2f} km")


main()
