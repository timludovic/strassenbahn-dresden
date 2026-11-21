"""Holt fehlende Kacheln blockweise (4 Zellen pro Overpass-Abfrage) und verteilt sie."""
import json
import math
import os
import sys
import time
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from city_tiles import CELL, LAT, LON, K, CACHE, OUT, make_tile, track_cells   # noqa: E402

OVERPASS = "https://overpass-api.de/api/interpreter"


def query(bbox):
    q = (f"[out:json][timeout:120];(way({bbox});relation({bbox}););out geom;")
    req = urllib.request.Request(OVERPASS, data=urllib.parse.urlencode({"data": q}).encode(),
                                 headers={"User-Agent": "strassenbahn-dresden-dev/0.1"})
    return json.loads(urllib.request.urlopen(req, timeout=240).read())


def elements(data):
    out = []
    for e in data.get("elements", []):
        tags = e.get("tags") or {}
        if e["type"] == "way" and e.get("geometry"):
            out.append({"type": "way", "id": e["id"], "tags": tags,
                        "geometry": [{"lat": p["lat"], "lon": p["lon"]} for p in e["geometry"]]})
        elif e["type"] == "relation":
            for m in e.get("members", []):
                g = m.get("geometry")
                if m.get("type") == "way" and g and len(g) >= 2:
                    out.append({"type": "way", "id": -e["id"], "tags": tags, "relation": True,
                                "geometry": [{"lat": p["lat"], "lon": p["lon"]} for p in g]})
    return out


def main():
    os.makedirs(CACHE, exist_ok=True)
    man = json.load(open(f"{OUT}/manifest.json"))
    todo = [c for c in track_cells() if f"{c[0]}_{c[1]}" not in man]
    blocks = {}
    for cx, cy in todo:
        blocks.setdefault((cx // 2, cy // 2), []).append((cx, cy))
    print(f"{len(todo)} Zellen, {len(blocks)} Blöcke", flush=True)

    for bi, (bk, cells) in enumerate(sorted(blocks.items())):
        xs = [c[0] * CELL - 40 for c in cells]
        ys = [c[1] * CELL - 40 for c in cells]
        x0, y0 = min(xs), min(ys)
        x1, y1 = max(xs) + CELL + 40, max(ys) + CELL + 40
        bbox = (f"{LAT - y1 / 111320},{LON + x0 / (111320 * K)},"
                f"{LAT - y0 / 111320},{LON + x1 / (111320 * K)}")
        els = []
        for attempt in range(3):
            try:
                els = elements(query(bbox))
                break
            except Exception as e:
                print(f"  Block {bi + 1}/{len(blocks)} {bk}: {e}", flush=True)
                time.sleep(8 * (attempt + 1))
        if len(els) < 50:
            print(f"  Block {bi + 1}/{len(blocks)} {bk}: nur {len(els)} Elemente", flush=True)
            continue
        for cx, cy in cells:
            path = f"{CACHE}/tile_cache_c{cx}_{cy}.json"
            if os.path.exists(path):
                continue
            box = (cx * CELL - 40, cy * CELL - 40, (cx + 1) * CELL + 40, (cy + 1) * CELL + 40)
            mine = []
            for e in els:
                g = e.get("geometry", [])
                ex = [(p["lon"] - LON) * 111320 * K for p in g]
                ey = [(LAT - p["lat"]) * 111320 for p in g]
                if min(ex) <= box[2] and max(ex) >= box[0] and min(ey) <= box[3] and max(ey) >= box[1]:
                    mine.append(e)
            if len(mine) >= 20:
                json.dump({"elements": mine}, open(path, "w"))
        print(f"  Block {bi + 1}/{len(blocks)} {bk}: {len(els)} Elemente -> {len(cells)} Zellen", flush=True)

    for cx, cy in todo:
        try:
            make_tile(cx, cy)
            man[f"{cx}_{cy}"] = {"cx": cx, "cy": cy, "size": 1984}
            json.dump(man, open(f"{OUT}/manifest.json", "w"))
        except Exception as e:
            print(f"  {cx},{cy}: {e}", flush=True)
    print(f"fertig: {len(man)} Kacheln", flush=True)


if __name__ == "__main__":
    main()
