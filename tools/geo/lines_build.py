"""Baut für alle Linien (1-4, 6-13) echte Gleisverläufe aus dem OSM-Netz.

    python3 tools/geo/lines_build.py            # bauen -> assets/world/lines.json
    python3 tools/geo/lines_build.py --check    # nur Bericht

Grundlage: das Tram-Gleisnetz aus tools/geo/tracks_raw.json (OSM),
Stop-Namen aus Overpass (gecacht), Linienführungen aus js/data.js.
Geroutet wird zwischen den Haltestellen mit Dijkstra wie in line1_graph.py.
"""
import heapq
import json
import math
import os
import sys
import time
import urllib.parse
import urllib.request

UA = {"User-Agent": "strassenbahn-dresden-dev/0.1 (hobby project)"}
CACHE = "tools/geo/city_cache/tram_stops.json"
OUT = "assets/world/lines.json"
BBOX = (50.96, 13.50, 51.22, 13.92)   # south, west, north, east


def dist(a, b):
    dy = (a[0] - b[0]) * 111320.0
    dx = (a[1] - b[1]) * 111320.0 * math.cos(math.radians((a[0] + b[0]) / 2))
    return math.hypot(dx, dy)


def norm(s):
    s = s.lower().replace("ß", "ss")
    for a, b in (("ä", "a"), ("ö", "o"), ("ü", "u")):
        s = s.replace(a, b)
    s = s.replace("(", " ").replace(")", " ").replace(",", " ").replace("-", " ")
    return " ".join(s.split())


def fetch_stops():
    if os.path.exists(CACHE):
        return json.load(open(CACHE))
    q = (f'[out:json][timeout:60];node["railway"="tram_stop"]'
         f'({BBOX[0]},{BBOX[1]},{BBOX[2]},{BBOX[3]});out;')
    last = None
    for host in ("https://overpass-api.de/api/interpreter",
                 "https://overpass.kumi.systems/api/interpreter"):
        for attempt in range(3):
            try:
                req = urllib.request.Request(host, data=("data=" + q).encode(), headers=UA)
                data = json.load(urllib.request.urlopen(req, timeout=90))
                stops = [{"name": e["tags"].get("name", ""), "lat": e["lat"], "lon": e["lon"]}
                         for e in data["elements"]]
                stops = [s for s in stops if s["name"]]
                os.makedirs(os.path.dirname(CACHE), exist_ok=True)
                json.dump(stops, open(CACHE, "w"))
                print(f"{len(stops)} Tramstops von {host.split('/')[2]} geholt")
                return stops
            except Exception as e:
                last = e
                print(f"  {host.split('/')[2]} Versuch {attempt + 1}: {e}")
                time.sleep(3)
    raise SystemExit(f"Overpass nicht erreichbar: {last}")


def build_graph():
    tracks = json.load(open("tools/geo/tracks_raw.json"))
    ways = [w for w in tracks["elements"] if w.get("geometry")]
    adj, coord = {}, {}

    def key(p):
        return (round(p[0], 6), round(p[1], 6))

    for w in ways:
        g = [(p["lat"], p["lon"]) for p in w["geometry"]]
        for a, b in zip(g, g[1:]):
            ka, kb = key(a), key(b)
            coord[ka], coord[kb] = a, b
            d = dist(a, b)
            adj.setdefault(ka, []).append((kb, d))
            adj.setdefault(kb, []).append((ka, d))
    return adj, coord


def route(adj, coord, a, b):
    def snap(p):
        best, bd, bd2 = None, 1e18, 1e18
        # erst grob über 0.001-Grad-Raster filtern, dann exakt
        for k, v in coord.items():
            dd = abs(v[0] - p[0]) + abs(v[1] - p[1])
            if dd < bd2:
                bd2 = dd
            if dd > 0.02:
                continue
            d = dist(v, p)
            if d < bd:
                bd, best = d, k
        if best is None:
            for k, v in coord.items():
                d = dist(v, p)
                if d < bd:
                    bd, best = d, k
        return best, bd

    ka, da = snap(a)
    kb, db = snap(b)
    if da > 400 or db > 400:
        return None, min(da, db)
    pq = [(0.0, ka)]
    bestd = {ka: 0.0}
    prev = {}
    while pq:
        dcur, u = heapq.heappop(pq)
        if u == kb:
            break
        if dcur > bestd.get(u, 1e18):
            continue
        for v, w in adj.get(u, []):
            nd = dcur + w
            if nd < bestd.get(v, 1e18):
                bestd[v] = nd
                prev[v] = u
                heapq.heappush(pq, (nd, v))
    if kb not in prev and kb != ka:
        return None, max(da, db)
    out = [coord[kb]]
    cur = kb
    while cur != ka:
        cur = prev[cur]
        out.append(coord[cur])
    out.reverse()
    return out, max(da, db)


def chain_xy(chain):
    pts = [(lon, lat) for lat, lon in chain]
    return pts


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


def simplify_chain(chain, tol_m):
    """Douglas-Peucker in Metern (nicht in Grad)."""
    lat0 = sum(p[0] for p in chain) / len(chain)
    kx = 111320 * math.cos(math.radians(lat0))
    xy = [(lo * kx, -la * 111320) for la, lo in chain]
    keep = dp(xy, tol_m)
    out = []
    for x, y in keep:
        out.append((round(-y / 111320, 6), round(x / kx, 6)))
    return out


def stops_along(chain, stops, radius=28.0):
    """Alle echten Tramstops, die an der Strecke liegen, der Reihe nach mit s."""
    lat0 = sum(p[0] for p in chain) / len(chain)
    kx = 111320 * math.cos(math.radians(lat0))
    xy = [((lo) * kx, (-(la)) * 111320) for la, lo in chain]
    cum = [0.0]
    for a, b in zip(xy, xy[1:]):
        cum.append(cum[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
    out = []
    for st in stops:
        p = (st["lon"] * kx, -st["lat"] * 111320)
        best, bs = 1e9, 0.0
        for i in range(len(xy) - 1):
            ax, ay = xy[i]
            bx, by = xy[i + 1]
            dx, dy = bx - ax, by - ay
            L2 = dx * dx + dy * dy
            t = 0.0 if L2 == 0 else max(0.0, min(1.0, ((p[0] - ax) * dx + (p[1] - ay) * dy) / L2))
            d = math.hypot(ax + dx * t - p[0], ay + dy * t - p[1])
            if d < best:
                best, bs = d, cum[i] + math.sqrt(L2) * t
        if best <= radius:
            out.append({"name": st["name"], "s": round(bs, 1), "_d": best})
    out.sort(key=lambda z: z["s"])
    seen, clean = set(), []
    for st in out:
        if st["name"] in seen:
            continue
        seen.add(st["name"])
        clean.append({"name": st["name"], "s": st["s"]})
    return clean


def main():
    check = "--check" in sys.argv
    meta = json.load(open("/tmp/lines_meta.json"))
    nodes, lines = meta["NODES"], meta["LINES"]
    stops = fetch_stops()
    by_name = {}
    for s in stops:
        by_name.setdefault(norm(s["name"]), []).append(s)

    def stop_for(node_id):
        n = nodes[node_id]
        nn = norm(n["name"])
        if nn in by_name:
            return by_name[nn][0], 0
        cands = [(nn2, ss) for nn2, ss in by_name.items() if nn2.startswith(nn) or nn in nn2]
        if cands:
            tab = n.get("x")
            best = None
            for nn2, ss in cands:
                for s in ss:
                    if best is None:
                        best = s
            return best, 1
        return None, 2

    adj, coord = build_graph()
    print(f"Gleisgraph: {len(coord)} Knoten")

    out, report = {}, []
    for lid, ln in lines.items():
        chain, stop_list, missing, worst, fails = [], [], [], 0.0, 0
        for i, nid in enumerate(ln["route"]):
            s, how = stop_for(nid)
            if s is None:
                missing.append(nodes[nid]["name"])
                continue
            if how == 1:
                missing.append(nodes[nid]["name"] + "~" + s["name"])
            if chain:
                seg, snapd = route(adj, coord, chain[-1], (s["lat"], s["lon"]))
                worst = max(worst, snapd)
                if not seg:
                    fails += 1
                    seg = [chain[-1], (s["lat"], s["lon"])]
                elif seg[0] == chain[-1]:
                    seg = seg[1:]
                chain.extend(seg)
            else:
                chain.append((s["lat"], s["lon"]))
            cum = sum(dist(a, b) for a, b in zip(chain, chain[1:]))
            stop_list.append({"name": s["name"], "s": round(cum, 1)})
        total = sum(dist(a, b) for a, b in zip(chain, chain[1:]))
        chain = simplify_chain(chain, 1.1)
        allstops = stops_along(chain, stops)
        report.append((lid, total / 1000, len(allstops), fails, round(worst), missing[:2]))
        if chain:
            cum = [0.0]
            for a, b in zip(chain, chain[1:]):
                cum.append(cum[-1] + dist(a, b))
            out[lid] = {
                "line": lid, "color": ln["color"], "vehicle": ln["vehicle"],
                "chain": [[round(a, 6), round(b, 6)] for a, b in chain],
                "cum": [round(c, 1) for c in cum],
                "length": round(cum[-1], 1),
                "start": 40,
                "stops": allstops,
            }

    print(f"{'Linie':6s} {'km':>7s} {'Halte':>6s} {'Lücken':>7s} {'Snap':>6s}  Namen")
    for lid, km, ns, fails, worst, miss in report:
        print(f"{lid:6s} {km:7.1f} {ns:6d} {fails:7d} {worst:6d}  {', '.join(miss)}")

    if not check:
        for v in out.values():
            v["chain"] = [list(p) for p in v["chain"]]
        json.dump({"lines": out}, open(OUT, "w"))
        print("geschrieben:", OUT,
              round(os.path.getsize(OUT) / 1e6, 2), "MB")


main()
