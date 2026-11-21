"""Pixel-tile renderer shared by the stop tiles and the landmark tiles.

Same drawing order and palette as tools/geo/pixel_tile.py (which produced the
60 stop tiles), but usable as a module so landmark accents can be layered on
top of the OSM base.

    t = Tile(51.0520, 13.7415, "frauenkirche", 160, 110)
    t.hooks.append(accents.frauenkirche)
    t.save("artifacts/landmarks")
"""
import hashlib
import json
import math
import os
import urllib.request

from PIL import Image, ImageDraw

UA = {"User-Agent": "strassenbahn-dresden-dev/0.1"}

ROOFS = ['#8d5645', '#7e5242', '#6d5e52', '#867866', '#6b7066', '#94705b', '#9b8a75',
         '#5e6259', '#7a6a5a', '#a06a4e', '#736c60', '#8a7d6a', '#565a54', '#7d7264']

PXM = 3.2


def fetch_osm(lat, lon, w_m, h_m):
    """Fetch every tagged element around (lat, lon) via the OSM map API."""
    import xml.etree.ElementTree as ET
    dlat = h_m / 2 / 111320.0 * 1.5
    dlon = w_m / 2 / (111320.0 * math.cos(math.radians(lat))) * 1.5
    url = ("https://api.openstreetmap.org/api/0.6/map?bbox="
           f"{lon - dlon},{lat - dlat},{lon + dlon},{lat + dlat}")
    raw = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=180).read()
    root = ET.fromstring(raw)
    nodes = {n.get("id"): (float(n.get("lat")), float(n.get("lon"))) for n in root.findall("node")}
    els = []
    for n in root.findall("node"):
        tags = {t.get("k"): t.get("v") for t in n.findall("tag")}
        if tags:
            la, lo = nodes[n.get("id")]
            els.append({"type": "node", "id": int(n.get("id")), "lat": la, "lon": lo, "tags": tags})
    way_refs = {}
    for w in root.findall("way"):
        tags = {t.get("k"): t.get("v") for t in w.findall("tag")}
        refs = [nd.get("ref") for nd in w.findall("nd")]
        if len(refs) < 2 or any(r not in nodes for r in refs):
            continue
        way_refs[w.get("id")] = refs
        els.append({"type": "way", "id": int(w.get("id")), "tags": tags,
                    "geometry": [{"lat": nodes[r][0], "lon": nodes[r][1]} for r in refs]})

    # Multipolygon-Relationen (z. B. Zwinger) zu geschlossenen Ringen zusammensetzen
    wanted = ("building", "landuse", "leisure", "natural", "waterway", "amenity")
    for rel in root.findall("relation"):
        tags = {t.get("k"): t.get("v") for t in rel.findall("tag")}
        if tags.get("type") != "multipolygon" or not any(k in tags for k in wanted):
            continue
        segs = [way_refs[m.get("ref")] for m in rel.findall("member")
                if m.get("role") in ("outer", "") and m.get("ref") in way_refs]
        rings = []
        for seg in segs:
            seg = list(seg)
            if any(seg[0] == r[0] and seg[-1] == r[-1] for r in rings):
                continue
            ring = seg
            for _ in range(80):
                if len(ring) > 2 and ring[0] == ring[-1]:
                    break
                for other in segs:
                    if other is seg:
                        continue
                    o = list(other)
                    if o[0] == ring[-1]:
                        ring += o[1:]
                    elif o[-1] == ring[-1]:
                        ring += o[::-1][1:]
                    elif o[0] == ring[0]:
                        ring = o[::-1][:-1] + ring
                    elif o[-1] == ring[0]:
                        ring = o[:-1] + ring
                    else:
                        continue
                    break
                else:
                    break
            if 4 <= len(ring) and ring[0] == ring[-1]:
                rings.append(ring)
        for ring in rings:
            els.append({"type": "way", "id": -int(rel.get("id")), "tags": tags,
                        "relation": True,
                        "geometry": [{"lat": nodes[r][0], "lon": nodes[r][1]} for r in ring]})
        if rings:
            print(f"  Relation {tags.get('name')!r}: {len(rings)} Ring(e)")
    print(f"  OSM-API: {len(els)} Elemente")
    return {"elements": els}


def hashf(*args):
    return int(hashlib.md5("|".join(str(a) for a in args).encode()).hexdigest()[:6], 16) / 0xFFFFFF


class Tile:
    def __init__(self, lat, lon, name, w_m, h_m, pxm=PXM, cache_dir="tools/geo", relations=False, dedupe=True, auto_centre=True):
        self.lat, self.lon = lat, lon
        self.name, self.w_m, self.h_m, self.pxm = name, w_m, h_m, pxm
        self.relations = relations
        self.dedupe = dedupe
        self.auto_centre = auto_centre
        self.cache = os.path.join(cache_dir, f"tile_cache_{name}.json")
        self.hooks = []
        self.pre_hooks = []
        self.img = None
        if os.path.exists(self.cache):
            self.data = json.load(open(self.cache))
        else:
            self.data = fetch_osm(lat, lon, w_m, h_m)
            json.dump(self.data, open(self.cache, "w"))
        if self.auto_centre:
            self.centre_on_platforms()

    # ---- geometry -------------------------------------------------------
    def centre_on_platforms(self):
        xs, ys = [], []
        for e in self.data["elements"]:
            tg = e.get("tags", {})
            if tg.get("railway") == "platform" or tg.get("public_transport") == "platform":
                for q in e.get("geometry", []):
                    x, y = self.proj(q["lat"], q["lon"])
                    xs.append(x)
                    ys.append(y)
        if xs:
            cx, cy = sum(xs) / len(xs), sum(ys) / len(ys)
            self.lat += -(cy - self.h_m / 2) / 111320.0
            self.lon += (cx - self.w_m / 2) / (111320.0 * math.cos(math.radians(self.lat)))

    def proj(self, lat, lon):
        x = (lon - self.lon) * 111320.0 * math.cos(math.radians(self.lat))
        y = (self.lat - lat) * 111320.0
        return (x + self.w_m / 2, y + self.h_m / 2)

    def xy(self, lat, lon):
        x, y = self.proj(lat, lon)
        return (x * self.pxm, y * self.pxm)

    def px(self, v):
        return int(round(v * self.pxm))

    # ---- drawing in metre space (origin = tile centre) ------------------
    def poly_m(self, d, pts, fill, outline=None):
        d.polygon([(self.px(x), self.px(y)) for x, y in pts], fill=fill, outline=outline)

    def line_m(self, d, pts, fill, w_m, cap=True):
        p = [(self.px(x), self.px(y)) for x, y in pts]
        w = max(1, int(round(w_m * self.pxm)))
        if len(p) > 1:
            d.line(p, fill=fill, width=w, joint="curve")
        r = w / 2
        if cap and p:
            for x, y in (p[0], p[-1]):
                d.ellipse([x - r, y - r, x + r, y + r], fill=fill)

    def circle_m(self, d, c, r, fill, outline=None, w=1):
        x, y = c
        d.ellipse([self.px(x - r), self.px(y - r), self.px(x + r), self.px(y + r)],
                  fill=fill, outline=outline, width=w)

    def rect_m(self, d, cx, cy, L, W, ang, fill, outline=None):
        c, s = math.cos(ang), math.sin(ang)
        pts = []
        for ex, ey in ((-L / 2, -W / 2), (L / 2, -W / 2), (L / 2, W / 2), (-L / 2, W / 2)):
            pts.append((cx + ex * c - ey * s, cy + ex * s + ey * c))
        self.poly_m(d, pts, fill, outline)

    # ---- OSM lookups ----------------------------------------------------
    def ways(self, **want):
        out = []
        for e in self.data["elements"]:
            if e.get("type") != "way" or len(e.get("geometry", [])) < 2:
                continue
            tg = e.get("tags", {})
            if all(tg.get(k) == v for k, v in want.items()):
                out.append(e)
        return out

    def named_building(self, needle):
        return [e for e in self.named(needle)
                if "building" in e.get("tags", {}) and not e.get("relation")]

    def named(self, needle):
        return [e for e in self.ways()
                if needle.lower() in (e.get("tags", {}).get("name", "") or "").lower()]

    def longest(self, ways):
        def length(e):
            pts = [(p["lat"], p["lon"]) for p in e["geometry"]]
            return sum(math.dist(self.proj(*a), self.proj(*b)) for a, b in zip(pts, pts[1:]))
        return max(ways, key=length) if ways else None

    def way_m(self, way):
        return [self.proj(p["lat"], p["lon"]) for p in way["geometry"]]

    def edge_axis(self, way):
        """Bounding box in the frame of the footprint's longest edge."""
        pts = self.way_m(way)
        ang, best = 0.0, 0.0
        for a, b in zip(pts, pts[1:]):
            L = math.dist(a, b)
            if L > best:
                best, ang = L, math.atan2(b[1] - a[1], b[0] - a[0])
        c, s = math.cos(-ang), math.sin(-ang)
        us = [x * c - y * s for x, y in pts]
        vs = [x * s + y * c for x, y in pts]
        mu, mv = (max(us) + min(us)) / 2, (max(vs) + min(vs)) / 2
        cx = mu * math.cos(ang) - mv * math.sin(ang)
        cy = mu * math.sin(ang) + mv * math.cos(ang)
        return cx, cy, ang, max(us) - min(us), max(vs) - min(vs)

    def platform_axis(self):
        pts = []
        for e in self.data["elements"]:
            tg = e.get("tags", {})
            if tg.get("railway") == "platform" or tg.get("public_transport") == "platform":
                pts += self.way_m(e) if e.get("type") == "way" else []
        if not pts:
            return None
        cx = sum(x for x, _ in pts) / len(pts)
        cy = sum(y for _, y in pts) / len(pts)
        sxx = sum((x - cx) ** 2 for x, _ in pts) / len(pts)
        syy = sum((y - cy) ** 2 for _, y in pts) / len(pts)
        sxy = sum((x - cx) * (y - cy) for x, y in pts) / len(pts)
        ang = 0.5 * math.atan2(2 * sxy, sxx - syy)
        c, s = math.cos(-ang), math.sin(-ang)
        us = [ (x - cx) * c - (y - cy) * s for x, y in pts]
        vs = [ (x - cx) * s + (y - cy) * c for x, y in pts]
        return cx, cy, ang, max(us) - min(us), max(vs) - min(vs)

    def centroid_m(self, way):
        pts = self.way_m(way)
        return (sum(x for x, _ in pts) / len(pts), sum(y for _, y in pts) / len(pts))

    def axis_m(self, way):
        """(cx, cy, angle, length, width) of a footprint's main axis."""
        pts = self.way_m(way)
        cx = sum(x for x, _ in pts) / len(pts)
        cy = sum(y for _, y in pts) / len(pts)
        sxx = sum((x - cx) ** 2 for x, _ in pts) / len(pts)
        syy = sum((y - cy) ** 2 for _, y in pts) / len(pts)
        sxy = sum((x - cx) * (y - cy) for x, y in pts) / len(pts)
        ang = 0.5 * math.atan2(2 * sxy, sxx - syy)
        c, s = math.cos(-ang), math.sin(-ang)
        us, vs = [], []
        for x, y in pts:
            dx, dy = x - cx, y - cy
            us.append(dx * c - dy * s)
            vs.append(dx * s + dy * c)
        return cx, cy, ang, max(us) - min(us), max(vs) - min(vs)

    # ---- base map -------------------------------------------------------
    def build(self):
        W, H = self.px(self.w_m), self.px(self.h_m)
        img = Image.new("RGB", (W, H), '#736f66')
        self.img = img
        d = ImageDraw.Draw(img)
        els = self.data["elements"]

        def geom(e):
            return [(p["lat"], p["lon"]) for p in e.get("geometry", [])]

        # Landnutzung / Wasser / Plätze
        for e in els:
            t = e.get("tags", {})
            g = geom(e)
            if len(g) < 3:
                continue
            pts = [self.proj(a, b) for a, b in g]
            if t.get("natural") == "water" or t.get("waterway") == "riverbank":
                self.poly_m(d, pts, '#3f6672')
            elif t.get("landuse") in ("grass", "meadow", "forest") or t.get("leisure") in ("park", "garden"):
                self.poly_m(d, pts, '#4f6a43')
            elif t.get("landuse") == "pedestrian" or t.get("highway") == "pedestrian":
                self.poly_m(d, pts, '#8d887d')

        for fn in self.pre_hooks:
            fn(self, d)

        # Straßen
        roads = [e for e in els if e.get("tags", {}).get("highway") and len(geom(e)) > 1]
        widths = {"motorway": 11, "trunk": 11, "primary": 10, "secondary": 9, "tertiary": 8,
                  "residential": 6, "service": 4, "footway": 0, "cycleway": 0, "path": 0}
        skip = {"footway", "cycleway", "path", "steps", "corridor", "pedestrian", "crossing"}
        for e in roads:
            hw = e["tags"]["highway"]
            if hw in skip or hw in ("service", "track", "driveway", "parking_aisle"):
                continue
            w = widths.get(hw, 5)
            pts = dp([self.proj(a, b) for a, b in geom(e)], 1.2)
            self.line_m(d, pts, '#3d4043', w + 1.6)
            self.line_m(d, pts, '#4d5054', w)

        # Tramgleise
        tram, taken = [], []
        for e in self.ways(railway="tram"):
            simp = dp(self.way_m(e), 1.0)
            sm = samples(simp)
            if self.dedupe and is_dup(sm, taken):
                continue
            taken.extend(sm)
            tram.append(simp)
        for pts in tram:
            self.line_m(d, pts, '#414447', 3.6)
        for pts in tram:
            for side in (-0.72, 0.72):
                self.line_m(d, offset_pts(pts, side), '#cfd3d5', 0.42)

        # Bahnsteige
        for e in els:
            t = e.get("tags", {})
            if t.get("railway") != "platform" or len(geom(e)) < 3:
                continue
            pts = [self.proj(a, b) for a, b in geom(e)]
            self.poly_m(d, [(x, y + 1.2) for x, y in pts], '#2f322e')
            self.poly_m(d, pts, '#d8cfb9', outline='#8d8574')
            self.poly_m(d, [(x + (self.w_m / 2 - x) * 0.06, y + (self.h_m / 2 - y) * 0.06)
                            for x, y in pts], '#e6dfcb')

        # Gebäude
        for e in els:
            t = e.get("tags", {})
            if "building" not in t or len(geom(e)) < 3 or (e.get("relation") and not self.relations):
                continue
            pts = [self.proj(a, b) for a, b in geom(e)]
            self.poly_m(d, [(x + 2.4, y + 2.4) for x, y in pts], '#3a3f38')
        for e in els:
            t = e.get("tags", {})
            if "building" not in t or len(geom(e)) < 3 or (e.get("relation") and not self.relations):
                continue
            pts = [self.proj(a, b) for a, b in geom(e)]
            self.poly_m(d, pts, ROOFS[int(hashf(e["id"]) * len(ROOFS))], outline='#2f322c')

        # Bäume
        for e in els:
            if e.get("type") != "node" or e.get("tags", {}).get("natural") != "tree":
                continue
            x, y = self.proj(e["lat"], e["lon"])
            self.tree(d, (x, y), 3.2)

        for fn in self.hooks:
            fn(self, d)
        return img

    def ribs_in_poly(self, d, pts, fill, rib, spacing, ang=0.0):
        """Fill a polygon with a ribbed roof pattern (glass hall, copper roof)."""
        W, H = self.px(self.w_m), self.px(self.h_m)
        mask = Image.new("L", (W, H), 0)
        ImageDraw.Draw(mask).polygon([(self.px(x), self.px(y)) for x, y in pts], fill=255)
        layer = Image.new("RGB", (W, H), fill)
        ld = ImageDraw.Draw(layer)
        dx, dy = math.cos(ang), math.sin(ang)
        nx, ny = -dy, dx
        n = int((self.w_m + self.h_m) / spacing)
        for i in range(-n, n):
            off = i * spacing
            cx, cy = self.w_m / 2 + nx * off, self.h_m / 2 + ny * off
            ld.line([(self.px(cx - dx * 500), self.px(cy - dy * 500)),
                     (self.px(cx + dx * 500), self.px(cy + dy * 500))],
                    fill=rib, width=max(1, int(0.6 * self.pxm)))
        self.img.paste(layer, (0, 0), mask)

    def tree(self, d, c, r):
        x, y = c
        d.ellipse([self.px(x - r), self.px(y - r), self.px(x + r), self.px(y + r)], fill='#33502f')
        d.ellipse([self.px(x - r * .6), self.px(y - r * .7), self.px(x + r * .6), self.px(y + r * .5)],
                  fill='#557a48')

    def save(self, outdir="artifacts/landmarks", scale=2):
        img = self.build()
        os.makedirs(outdir, exist_ok=True)
        path = os.path.join(outdir, f"{self.name}.png")
        big = img.resize((img.width * scale, img.height * scale), Image.NEAREST)
        big.save(path)
        return big, path


# ---- maths helpers ------------------------------------------------------
def dp(pts, tol):
    if len(pts) < 3:
        return pts

    def rec(a, b):
        if b <= a + 1:
            return [pts[a], pts[b]]
        ax, ay = pts[a]
        bx, by = pts[b]
        dx, dy = bx - ax, by - ay
        L = math.hypot(dx, dy) or 1e-9
        best, bi = -1, a
        for i in range(a + 1, b):
            px_, py_ = pts[i]
            dd = abs(dy * (px_ - ax) - dx * (py_ - ay)) / L
            if dd > best:
                best, bi = dd, i
        if best <= tol:
            return [pts[a], pts[b]]
        left, right = rec(a, bi), rec(bi, b)
        return left[:-1] + right

    return rec(0, len(pts) - 1)


def samples(pts, step=3.0):
    out = []
    for i in range(1, len(pts)):
        a, b = pts[i - 1], pts[i]
        dd = math.hypot(b[0] - a[0], b[1] - a[1])
        n = max(1, int(dd / step))
        for k in range(n):
            t = k / n
            out.append((a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t))
    out.append(pts[-1])
    return out


def is_dup(sm, taken, r=2.2):
    hit = 0
    for p in sm:
        for q in taken:
            if abs(p[0] - q[0]) < r and abs(p[1] - q[1]) < r:
                hit += 1
                break
    return hit / max(1, len(sm)) > 0.7


def offset_pts(pts, off):
    out = []
    for i, p in enumerate(pts):
        p0 = pts[max(0, i - 1)]
        p1 = pts[min(len(pts) - 1, i + 1)]
        ang = math.atan2(p1[1] - p0[1], p1[0] - p0[0])
        out.append((p[0] - math.sin(ang) * off, p[1] + math.cos(ang) * off))
    return out
