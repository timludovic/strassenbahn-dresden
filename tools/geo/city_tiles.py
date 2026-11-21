"""Kachelt das ganze Netz als Korridor entlang der Gleise.

    python3 tools/geo/city_tiles.py [max_zellen]

Jede 600-m-Zelle mit Gleis bekommt eine Kachel (1 m = 3,2 px), zugeschnitten auf
den Streifen links/rechts der Schienen. Alles ausserhalb ist dunkel – das Spiel
laedt nur die Kacheln, die man von der Bahn aus sieht.
"""
import json
import math
import os
import sys
import time

from PIL import Image, ImageDraw, ImageFilter
from tilegen import Tile, fetch_osm

LAT, LON, PXM = 51.0520, 13.7370, 3.2
CELL = 600
HALF = 70
OUT = "assets/world/tiles"
CACHE = "tools/geo/city_cache"
BG = (11, 15, 19)
K = math.cos(math.radians(LAT))


def track_cells():
    data = json.load(open("tools/geo/tracks_raw.json"))
    cells = set()
    for e in data["elements"]:
        pts = e.get("geometry", [])
        for a, b in zip(pts, pts[1:]):
            x1, y1 = (a["lon"] - LON) * 111320 * K, (LAT - a["lat"]) * 111320
            x2, y2 = (b["lon"] - LON) * 111320 * K, (LAT - b["lat"]) * 111320
            n = max(1, int(math.dist((x1, y1), (x2, y2)) / 150))
            for i in range(n + 1):
                f = i / n
                cells.add((math.floor((x1 + (x2 - x1) * f) / CELL),
                           math.floor((y1 + (y2 - y1) * f) / CELL)))
    return sorted(cells)


OVERPASS = "https://overpass-api.de/api/interpreter"


def fetch_overpass(lat, lon, w_m, h_m):
    """Gleiche Daten wie fetch_osm, nur ueber Overpass (eigene Limits)."""
    import urllib.parse
    import urllib.request
    dlat = h_m / 2 / 111320.0 * 1.6
    dlon = w_m / 2 / (111320.0 * math.cos(math.radians(lat))) * 1.6
    bbox = f"{lon - dlon},{lat - dlat},{lon + dlon},{lat + dlat}"
    q = f"[out:json][timeout:90];(way({bbox});relation({bbox}););out geom;"
    req = urllib.request.Request(OVERPASS, data=urllib.parse.urlencode({"data": q}).encode(),
                                 headers={"User-Agent": "strassenbahn-dresden-dev/0.1"})
    raw = urllib.request.urlopen(req, timeout=180).read()
    data = json.loads(raw)
    els = []
    for e in data.get("elements", []):
        tags = e.get("tags") or {}
        if e["type"] == "way" and e.get("geometry"):
            els.append({"type": "way", "id": e["id"], "tags": tags,
                        "geometry": [{"lat": p["lat"], "lon": p["lon"]} for p in e["geometry"]]})
        elif e["type"] == "relation":
            for m in e.get("members", []):
                g = m.get("geometry")
                if m.get("type") == "way" and g and len(g) >= 2:
                    els.append({"type": "way", "id": -e["id"], "tags": tags, "relation": True,
                                "geometry": [{"lat": p["lat"], "lon": p["lon"]} for p in g]})
    return {"elements": els}


def make_tile(cx, cy):
    lat = LAT - (cy * CELL + CELL / 2) / 111320
    lon = LON + (cx * CELL + CELL / 2) / (111320 * K)
    cache_path = f"{CACHE}/tile_cache_c{cx}_{cy}.json"
    if not os.path.exists(cache_path):
        errors = []
        for fetch in (fetch_osm, fetch_overpass):
            for attempt in range(3):
                try:
                    d = fetch(lat, lon, CELL + 40, CELL + 40)
                    if len(d["elements"]) < 20:
                        raise RuntimeError("zu wenig Daten")
                    json.dump(d, open(cache_path, "w"))
                    errors = []
                    break
                except Exception as e:
                    errors.append(f"{fetch.__name__}: {e}")
                    time.sleep(3 * (attempt + 1))
            if not errors:
                break
        else:
            raise RuntimeError("; ".join(errors[-2:]))
    t = Tile(lat, lon, f"c{cx}_{cy}", CELL + 40, CELL + 40, relations=True,
             dedupe=True, auto_centre=False, cache_dir=CACHE)
    img = t.build().convert("RGB")
    W, H = img.size
    mask = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(mask)
    rails = json.load(open("tools/geo/tracks_raw.json"))["elements"]
    for e in rails:
        pts = [(p["lat"], p["lon"]) for p in e.get("geometry", [])]
        if len(pts) < 2:
            continue
        xy = [((lo - lon) * 111320 * K * PXM + W / 2, (lat - la) * 111320 * PXM + H / 2)
              for la, lo in pts]
        d.line(xy, fill=255, width=int(HALF * 2 * PXM), joint="curve")
    mask = mask.filter(ImageFilter.GaussianBlur(2))
    bg = Image.new("RGB", (W, H), BG)
    bg.paste(img, (0, 0), mask)
    os.makedirs(OUT, exist_ok=True)
    bg.save(f"{OUT}/{cx}_{cy}.jpg", quality=86, optimize=True)
    return W


def main():
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    os.makedirs(CACHE, exist_ok=True)
    cells = track_cells()
    manifest_path = f"{OUT}/manifest.json"
    done = {}
    if os.path.exists(manifest_path):
        done = json.load(open(manifest_path))
    todo = [c for c in cells if f"{c[0]}_{c[1]}" not in done]
    print(f"{len(cells)} Zellen mit Gleis, {len(todo)} offen", flush=True)
    if limit:
        todo = todo[:limit]
    for i, (cx, cy) in enumerate(todo):
        try:
            w = make_tile(cx, cy)
        except Exception as e:
            print(f"  {cx},{cy}: {e}", flush=True)
            continue
        done[f"{cx}_{cy}"] = {"cx": cx, "cy": cy, "size": w}
        json.dump(done, open(manifest_path, "w"))
        print(f"  {i + 1}/{len(todo)}  {cx},{cy}", flush=True)
        time.sleep(1.2)
    print(f"fertig: {len(done)} Kacheln", flush=True)


if __name__ == "__main__":
    main()
