"""Recognition landmarks ("Wiedererkennungsobjekte") as pixel accents.

Each accent is drawn on top of the OSM base tile in the same 3.2 px/m grid, so
the shapes line up with the real footprints: the dome sits on the Frauenkirche
footprint, the truss follows the mapped bridge way, the Zwinger ring becomes
the courtyard, the allée follows the mapped Herkulesallee. Everything is plan
view - this is a map, not a skyline.
"""
import math

STONE = '#b3a996'
STONE_MID = '#a89f8c'
STONE_DARK = '#8b8272'
COPPER = '#5f8a78'
COPPER_DARK = '#48705f'
GLASS = '#a7b3b8'
GLASS_RIB = '#7d898f'
PAVE = '#8d887d'
GRAVEL = '#b6ad97'
PATH = '#a9a08c'
WATER = '#3f6672'
WATER_DARK = '#35535d'
WATER_LIGHT = '#5b8894'
BLUE_STEEL = '#3f5f7d'
SHADOW = '#3a3f38'


def local(t, anchor, pts, rot=0.0):
    """Metres relative to an anchor lat/lon -> metres relative to tile centre."""
    ax, ay = t.proj(*anchor)
    c, s = math.cos(math.radians(rot)), math.sin(math.radians(rot))
    return [(ax + ex * c - ey * s, ay + ex * s + ey * c) for ex, ey in pts]


def rect_pts(cx, cy, L, W, ang=0.0):
    c, s = math.cos(ang), math.sin(ang)
    return [(cx + ex * c - ey * s, cy + ex * s + ey * c)
            for ex, ey in ((-L / 2, -W / 2), (L / 2, -W / 2), (L / 2, W / 2), (-L / 2, W / 2))]


def offset_pts(pts, off):
    out = []
    for i, p in enumerate(pts):
        p0 = pts[max(0, i - 1)]
        p1 = pts[min(len(pts) - 1, i + 1)]
        ang = math.atan2(p1[1] - p0[1], p1[0] - p0[0])
        out.append((p[0] - math.sin(ang) * off, p[1] + math.cos(ang) * off))
    return out


def run_along(pts, step_m, start=0.0, end=1.0):
    """Points at even arc-length positions along a polyline (fractions start..end)."""
    segs, total = [], 0.0
    for a, b in zip(pts, pts[1:]):
        L = math.hypot(b[0] - a[0], b[1] - a[1])
        segs.append((a, b, total, L))
        total += L
    out = []
    n = max(2, int(total * abs(end - start) / step_m))
    for i in range(n + 1):
        want = total * (start + (end - start) * i / n)
        for a, b, s0, L in segs:
            if s0 + L >= want:
                f = (want - s0) / (L or 1)
                out.append((a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f))
                break
    return out


def bridge_accent(t, d, needle, deck_fill, edge_fill, deck_w, edge_w,
                  pylons=None, braces=False, arches=0):
    ways = [e for e in t.named(needle)
            if e.get("tags", {}).get("highway") or e.get("tags", {}).get("railway")
            or e.get("tags", {}).get("man_made") == "bridge"]
    way = t.longest(ways) or t.longest(t.named(needle))
    if way is None:
        print("  !! Brücke nicht gefunden:", needle)
        return
    pts = t.way_m(way)

    if arches:
        for frac in [0.08 + i * (0.84 / max(1, arches - 1)) for i in range(arches)]:
            p = run_along(pts, 1e9, frac, frac)[0]
            i = min(range(len(pts)), key=lambda k: math.dist(pts[k], p))
            a, b = pts[max(0, i - 1)], pts[min(len(pts) - 1, i + 1)]
            ang = math.atan2(b[1] - a[1], b[0] - a[0])
            t.poly_m(d, rect_pts(p[0], p[1], 17, deck_w + 12, ang), WATER_DARK)

    t.line_m(d, offset_pts(pts, 1.6), SHADOW, deck_w + 1.2)
    t.line_m(d, pts, deck_fill, deck_w)
    for off in (-deck_w / 2 + 1.2, deck_w / 2 - 1.2):
        t.line_m(d, offset_pts(pts, off), edge_fill, edge_w)
    if braces:
        for p in run_along(pts, 10.0, 0.04, 0.96):
            i = min(range(len(pts)), key=lambda k: math.dist(pts[k], p))
            a, b = pts[max(0, i - 1)], pts[min(len(pts) - 1, i + 1)]
            ang = math.atan2(b[1] - a[1], b[0] - a[0])
            n = (-math.sin(ang), math.cos(ang))
            half = deck_w / 2 - 1.0
            t.line_m(d, [(p[0] - n[0] * half, p[1] - n[1] * half),
                         (p[0] + n[0] * half, p[1] + n[1] * half)], edge_fill, 0.9, cap=False)
    for frac in (pylons or []):
        p = run_along(pts, 1e9, frac, frac)[0]
        i = min(range(len(pts)), key=lambda k: math.dist(pts[k], p))
        a, b = pts[max(0, i - 1)], pts[min(len(pts) - 1, i + 1)]
        ang = math.atan2(b[1] - a[1], b[0] - a[0])
        n = (-math.sin(ang), math.cos(ang))
        for sgn in (-1, 1):
            q = (p[0] + n[0] * sgn * (deck_w / 2 + 1.5), p[1] + n[1] * sgn * (deck_w / 2 + 1.5))
            t.poly_m(d, rect_pts(q[0], q[1], 8.0, 7.0, ang), STONE_MID, '#5d5a50')


# ---------------------------------------------------------------- Frauenkirche
def frauenkirche(t, d):
    ways = t.named_building("Frauenkirche")
    if not ways:
        print("  !! Frauenkirche nicht gefunden")
        return
    way = t.longest(ways)
    pts = t.way_m(way)
    cx, cy, ang, _L, _W = t.axis_m(way)
    t.poly_m(d, pts, STONE_MID, '#6a6658')
    for sx in (-16.5, 16.5):                        # vier Treppentürme
        for sy in (-16.5, 16.5):
            t.poly_m(d, rect_pts(cx + sx * math.cos(ang) - sy * math.sin(ang),
                                 cy + sx * math.sin(ang) + sy * math.cos(ang),
                                 7.5, 7.5, ang), STONE, '#4f4f46')
    t.circle_m(d, (cx, cy), 13.4, '#5f6058')        # Kuppel
    t.circle_m(d, (cx, cy), 12.4, '#8f8b7c')
    t.circle_m(d, (cx, cy), 10.6, '#a39e8c')
    t.circle_m(d, (cx, cy), 10.6, None, '#6d6a5e', 2)
    t.circle_m(d, (cx, cy), 4.0, '#b7b1a0', '#4f4f46')
    t.circle_m(d, (cx, cy), 1.6, '#c9a227')


# ------------------------------------------------------- Zwinger + Semperoper
def zwinger(t, d):
    """Vier-Flügel-Anlage mit Innenhof, als Sprite im Maßstab der Karte."""
    ax, ay = t.proj(51.05285, 13.73395)
    rot = -20

    def R(cx, cy, L, W, fill, outline=None):
        c, s = math.cos(math.radians(rot)), math.sin(math.radians(rot))
        pts = [(ax + cx * c - cy * s + ex * c - ey * s, ay + cx * s + cy * c + ex * s + ey * c)
               for ex, ey in ((-L / 2, -W / 2), (L / 2, -W / 2), (L / 2, W / 2), (-L / 2, W / 2))]
        t.poly_m(d, pts, fill, outline)

    R(0, 0, 132, 54, '#c9c0a8', '#8f8778')       # Innenhof
    R(0, -38, 172, 22, '#a29a88', '#4f4f46')     # Nordflügel
    R(0, 38, 172, 22, '#a29a88', '#4f4f46')      # Südflügel
    R(-86, 0, 22, 98, '#a29a88', '#4f4f46')      # Westflügel
    R(86, 0, 22, 98, '#a29a88', '#4f4f46')       # Ostflügel
    for px, py in ((-86, -38), (86, -38), (-86, 38), (86, 38)):
        R(px, py, 28, 28, '#b8b0a0', '#4f4f46')  # Eckpavillons
    R(86, 0, 22, 24, COPPER, '#2f4a3f')          # Kronentor
    t.circle_m(d, (ax, ay), 8.0, '#8d8574')      # Nymphenbrunnen im Hof
    t.circle_m(d, (ax, ay), 6.6, WATER)
    t.circle_m(d, (ax - 1, ay - 1), 1.8, WATER_LIGHT)
    # Semperoper am echten Grundriss
    op = t.named_building("Semperoper")
    if op:
        way = t.longest(op)
        pts = t.way_m(way)
        cx, cy, ang, L, W = t.edge_axis(way)
        t.poly_m(d, [(x + 2, y + 2) for x, y in pts], SHADOW)
        t.ribs_in_poly(d, pts, COPPER, COPPER_DARK, 6.0, ang)
        t.poly_m(d, rect_pts(cx, cy, L * 0.24, W * 0.3, ang), '#6a7472', '#3b423f')
    else:
        print("  !! Semperoper nicht gefunden")
    # Theaterplatz + König-Johann-Denkmal
    t.poly_m(d, local(t, (51.05345, 13.73562), [(-26, -26), (26, -26), (26, 26), (-26, 26)], 0), PAVE)
    t.circle_m(d, t.proj(51.05366, 13.73563), 2.6, '#4a4a42')


# ------------------------------------------------------------- Hauptbahnhof
def hauptbahnhof(t, d):
    """Empfangsgebäude als eigener Sprite: lange Glashalle + steinerne Front."""
    ax, ay = t.proj(51.03905, 13.73465)
    rot = -18

    def R(cx, cy, L, Wd, fill, outline=None):
        c, s = math.cos(math.radians(rot)), math.sin(math.radians(rot))
        pts = [(ax + cx * c - cy * s + ex * c - ey * s, ay + cx * s + cy * c + ex * s + ey * c)
               for ex, ey in ((-L / 2, -Wd / 2), (L / 2, -Wd / 2), (L / 2, Wd / 2), (-L / 2, Wd / 2))]
        t.poly_m(d, pts, fill, outline)

    R(0, 0, 154, 64, '#3f4548', '#2f322c')       # Grundriss mit Schattenkante
    R(-2, -2, 150, 60, GLASS, '#5f6a70')         # Glashalle
    c, s = math.cos(math.radians(rot)), math.sin(math.radians(rot))
    for i in range(-6, 7):                        # Dachrippen
        ex = i * 11.5
        p0 = (ax + ex * c - (-30) * s, ay + ex * s + (-30) * c)
        p1 = (ax + ex * c - (30) * s, ay + ex * s + (30) * c)
        t.line_m(d, [p0, p1], GLASS_RIB, 0.7, cap=False)
    R(0, -42, 118, 20, STONE, '#5d5a50')         # steinerne Front zum Wiener Platz
    R(0, 42, 104, 16, STONE_MID, '#5d5a50')      # Rückseite


# ------------------------------------------------------------ Albertplatz
def albertplatz(t, d):
    A = t.proj(51.063242, 13.747143)
    t.circle_m(d, A, 49.0, '#6f6a60')
    t.circle_m(d, A, 47.5, PAVE)
    t.circle_m(d, A, 35.0, '#3d4043')
    t.circle_m(d, A, 34.0, '#4f6a43')
    t.poly_m(d, [(A[0] + x, A[1] + y) for x, y in rect_pts(0, 0, 68, 6, 0)], GRAVEL)
    t.poly_m(d, [(A[0] + x, A[1] + y) for x, y in rect_pts(0, 0, 68, 6, math.pi / 2)], GRAVEL)
    for ex in (-19, 19):
        c = (A[0] + ex, A[1])
        t.circle_m(d, c, 7.2, '#8d8574')
        t.circle_m(d, c, 6.2, WATER)
        t.circle_m(d, (c[0] - 1, c[1] - 1.2), 1.6, WATER_LIGHT)
    for i in range(14):
        a = math.radians(i * (360 / 14) + 9)
        t.tree(d, (A[0] + math.cos(a) * 28.5, A[1] + math.sin(a) * 28.5), 3.0)


# ---------------------------------------------------------------- Blaues Wunder
def blaues_wunder(t, d):
    bridge_accent(t, d, "Loschwitzer Brücke", '#8b929b', BLUE_STEEL, 11.5, 1.4,
                  pylons=(0.24, 0.76), braces=True)


# ---------------------------------------------------------------- Elbbrücken
def elbbruecken(t, d):
    bridge_accent(t, d, "Marienbrücke", '#8b8b84', '#6a6a62', 15.0, 1.2, arches=5)


# ------------------------------------------------------------- Großer Garten
def grosser_garten(t, d):
    # Hauptallee aus der echten OSM-Geometrie (Herkulesallee)
    allee = t.longest([e for e in t.ways(highway="footway") + t.ways(highway="path")
                       + t.ways(highway="track")
                       if "herkules" in (e["tags"].get("name") or "").lower()])
    if allee:
        pts = t.way_m(allee)
        t.line_m(d, pts, PATH, 22)
        for off in (-15.0, 15.0):
            for p in run_along(offset_pts(pts, off), 9.0):
                t.tree(d, p, 3.0)
    else:
        print("  !! Herkulesallee nicht gefunden")
    # Palais mit Kupferdach
    pal = t.named_building("Palais im Großen Garten")
    if pal:
        way = t.longest(pal)
        pts = t.way_m(way)
        cx, cy, ang, L, W = t.axis_m(way)
        t.ribs_in_poly(d, pts, COPPER, COPPER_DARK, 5.0, ang)
        t.poly_m(d, rect_pts(cx, cy, L * 0.24, W * 0.3, ang), '#6a7472', '#3b423f')
    else:
        print("  !! Palais nicht gefunden")


ACCENTS = {
    "frauenkirche": frauenkirche,
    "zwinger": zwinger,
    "hauptbahnhof_lm": hauptbahnhof,
    "albertplatz_lm": albertplatz,
    "blaues_wunder": blaues_wunder,
    "elbbruecken": elbbruecken,
    "grosser_garten": grosser_garten,
}
PRE = {}
