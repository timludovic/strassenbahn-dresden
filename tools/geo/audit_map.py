#!/usr/bin/env python3
"""Kartenaudit: vergleicht die echten Kartendaten (OSM-Ableitung in lines.json
und den map_<linie>.json-Ebenen) mit dem, was das Spiel daraus baut.

Ermittelt je Linie
  * Haltestellen: Lage am Fahrbahnrand / zwischen den Spuren / neben der Fahrbahn,
    ermittelt aus den Abstaenden zur naechsten befahrbaren Strasse links und rechts
    der Gleisachse (nicht aus dem Spielschema).
  * eingleisige und zweigleisige Abschnitte (aus line.single) inkl. der Regel,
    die das Spiel anwendet (Mindestlaenge 120 m, Klammerung an den Enden).
  * Kreuzungen Bahn/Kfz: Strassen, die die Gleisachse queren (gleicher Algorithmus
    wie js/game.js buildCrossings), mit Angabe, ob eine Ampel davor steht.
  * Ampelplan: Haltestellensignale und Kreuzungssignale.

Ausgabe: artifacts/verify/<ver>/audit.json und AUDIT.md
"""
import json
import math
import os
import sys

LAT0, LON0 = 51.0520, 13.7370
M_LAT = 111320
K0 = math.cos(math.radians(LAT0))
CELL = 45.0
PATH_TYPES = {'footway', 'path', 'steps', 'bridleway', 'cycleway', 'track'}


def to_xy(lat, lon):
    return ((lon - LON0) * M_LAT * K0, (LAT0 - lat) * M_LAT)


def build_segs(chain):
    segs = []
    s = 0.0
    for i in range(1, len(chain)):
        ax, ay = to_xy(*chain[i - 1])
        bx, by = to_xy(*chain[i])
        length = math.hypot(bx - ax, by - ay)
        if length < 0.05:
            continue
        segs.append({'x0': ax, 'y0': ay, 'x1': bx, 'y1': by, 'len': length,
                     's0': s, 'ang': math.atan2(by - ay, bx - ax)})
        s += length
    return segs, s


def sample(segs, total, s):
    s = max(0.0, min(total, s))
    lo, hi = 0, len(segs) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if segs[mid]['s0'] + segs[mid]['len'] < s:
            lo = mid + 1
        else:
            hi = mid
    g = segs[lo]
    f = max(0.0, min(1.0, (s - g['s0']) / g['len']))
    return (g['x0'] + (g['x1'] - g['x0']) * f,
            g['y0'] + (g['y1'] - g['y0']) * f, g['ang'])


def road_paths(map_json):
    """Befahrbare Strassen als Polylinien (wie buildStreetTraffic)."""
    out = []
    for r in map_json['layers'].get('roads', []):
        if r.get('c') in PATH_TYPES:
            continue
        if (r.get('w') or 0) < 2.2:
            continue
        p = r['p']
        pts = []
        length = 0.0
        for i in range(0, len(p) - 3, 2):
            x0, y0, x1, y1 = p[i], p[i + 1], p[i + 2], p[i + 3]
            l = math.hypot(x1 - x0, y1 - y0)
            if l < 0.5:
                continue
            pts.append((x0, y0, x1, y1, l, length))
            length += l
        if length > 26:
            out.append({'pts': pts, 'len': length, 'w': r.get('w') or 0, 'c': r.get('c') or ''})
    return out


def track_grid(segs):
    g = {}
    for i, sg in enumerate(segs):
        x0 = math.floor(min(sg['x0'], sg['x1']) / CELL)
        x1 = math.floor(max(sg['x0'], sg['x1']) / CELL)
        y0 = math.floor(min(sg['y0'], sg['y1']) / CELL)
        y1 = math.floor(max(sg['y0'], sg['y1']) / CELL)
        for cx in range(x0, x1 + 1):
            for cy in range(y0, y1 + 1):
                g.setdefault((cx, cy), []).append(i)
    return g


def build_crossings(segs, total, roads):
    """Port von buildCrossings() aus js/game.js."""
    grid = track_grid(segs)
    hits = []
    for path in roads:
        for (x0, y0, x1, y1, l, s0) in path['pts']:
            if l < 3:
                continue
            steps = max(1, int(round(l / 6)))
            road_ang = math.atan2(y1 - y0, x1 - x0)
            for k in range(steps + 1):
                f = k / steps
                px = x0 + (x1 - x0) * f
                py = y0 + (y1 - y0) * f
                cx, cy = math.floor(px / CELL), math.floor(py / CELL)
                best, bs, bang = 1e9, 0.0, 0.0
                for gx in (cx - 1, cx, cx + 1):
                    for gy in (cy - 1, cy, cy + 1):
                        for i in grid.get((gx, gy), ()):
                            sg = segs[i]
                            dx, dy = sg['x1'] - sg['x0'], sg['y1'] - sg['y0']
                            L2 = dx * dx + dy * dy or 1
                            t = max(0.0, min(1.0, ((px - sg['x0']) * dx + (py - sg['y0']) * dy) / L2))
                            d = math.hypot(sg['x0'] + dx * t - px, sg['y0'] + dy * t - py)
                            if d < best:
                                best, bs, bang = d, sg['s0'] + sg['len'] * t, sg['ang']
                if best > 8:
                    continue
                da = abs(bang - road_ang) % math.pi
                if da > math.pi / 2:
                    da = math.pi - da
                if da < 0.35:
                    continue          # Strasse laeuft parallel, keine Kreuzung
                hits.append({'s': bs, 'major': (path['w'] or 0) >= 4.4 or
                             path['c'] in ('trunk', 'primary', 'secondary', 'tertiary')})
    hits.sort(key=lambda h: h['s'])
    crossings = []
    for h in hits:
        if h['s'] < 60 or h['s'] > total - 60:
            continue
        if crossings and h['s'] - crossings[-1]['s'] <= 28:
            crossings[-1]['major'] = crossings[-1]['major'] or h['major']
            continue
        crossings.append({'s': h['s'], 'major': h['major']})
    return crossings


def stop_layout(roads, x, y, ang):
    """Lage der Haltestelle relativ zur Fahrbahn, aus den Strassenachsen."""
    rx, ry = -math.sin(ang), math.cos(ang)
    left = right = None
    for path in roads:
        for (x0, y0, x1, y1, l, s0) in path['pts']:
            m = min(4, int(l // 6) + 1)
            for k in range(m + 1):
                f = k / m
                px, py = x0 + (x1 - x0) * f, y0 + (y1 - y0) * f
                d = math.hypot(px - x, py - y)
                if d > 24:
                    continue
                off = (px - x) * rx + (py - y) * ry
                if off >= 0:
                    if right is None or d < right:
                        right = d
                else:
                    if left is None or d < left:
                        left = d
    dl = 99.0 if left is None else left
    dr = 99.0 if right is None else right
    if dl <= 9 and dr <= 9:
        lage = 'zwischen den Spuren (Mittelinsel)'
    elif min(dl, dr) <= 9:
        lage = 'am Fahrbahnrand'
    else:
        lage = 'neben der Fahrbahn (eigener Bahnkoerper)'
    return lage, round(dl, 1), round(dr, 1)


def audit_line(lid, meta, map_json):
    segs, total = build_segs(meta['chain'])
    roads = road_paths(map_json)

    stops = []
    for st in meta['stops']:
        x, y, ang = sample(segs, total, st['s'])
        lage, dl, dr = stop_layout(roads, x, y, ang)
        stops.append({'name': st['name'], 's': round(st['s'], 1), 'lage': lage,
                      'dLinks': dl, 'dRechts': dr})

    single_raw = meta.get('single') or []
    single_game, single_skipped = [], []
    for a, b in single_raw:
        s0 = max(80, round(a))
        s1 = min(total - 60, round(b))
        rec = {'von': round(a, 1), 'bis': round(b, 1), 'laenge': round(b - a, 1)}
        if s1 - s0 < 120:
            single_skipped.append(rec)
        else:
            single_game.append({'s0': s0, 's1': s1, 'laenge': s1 - s0})
    double = []
    prev = 60
    for sec in single_game:
        if sec['s0'] - prev > 0:
            double.append({'s0': prev, 's1': sec['s0'], 'laenge': sec['s0'] - prev})
        prev = sec['s1']
    if total - 60 - prev > 0:
        double.append({'s0': prev, 's1': total - 60, 'laenge': total - 60 - prev})

    crossings = build_crossings(segs, total, roads)

    # Signale wie buildSignals(): Haltestellen und grosse Kreuzungen
    signals = []
    for st in meta['stops']:
        signals.append({'s': min(total - 20, st['s'] + 26), 'kind': 'Haltestelle',
                        'fuer': 'Bahn', 'name': st['name']})
    # Jede grosse Kreuzung bekommt eine eigene Haltlinie 9 m davor; nur eine
    # zweite Kreuzungsampel direkt hinter der ersten wird unterdrueckt.
    for c in crossings:
        if not c['major']:
            continue
        s = c['s'] - 9
        if s < 60 or s > total - 80:
            continue
        if any(g['kind'] == 'Kreuzung' and abs(g['s'] - s) < 20 for g in signals):
            continue
        signals.append({'s': s, 'kind': 'Kreuzung', 'fuer': 'Bahn',
                        'name': 'Bahn/Kfz + Fussgaenger'})
    signals.sort(key=lambda x: x['s'])
    for s in signals:
        s['s'] = round(s['s'], 1)

    return {
        'line': lid, 'total': round(total, 1),
        'stops': stops,
        'single': single_game, 'singleSkipped': single_skipped, 'double': double,
        'crossings': [{'s': round(c['s'], 1), 'major': bool(c['major'])} for c in crossings],
        'signals': signals,
        'counts': {
            'stops': len(stops), 'crossings': len(crossings),
            'majorCrossings': sum(1 for c in crossings if c['major']),
            'signals': len(signals),
            'singleSections': len(single_game), 'singleSkipped': len(single_skipped),
        },
    }


def main():
    ver = sys.argv[1] if len(sys.argv) > 1 else 'v17'
    lines = json.load(open('assets/world/lines.json'))['lines']
    out = {}
    for lid in sorted(lines, key=lambda x: int(x)):
        map_json = json.load(open('assets/game/map_%s.json' % lid))
        out[lid] = audit_line(lid, lines[lid], map_json)
        print('Linie %-2s  Halte %3d  Kreuzungen %3d (%2d mit Ampel)  eingleisig %d  Ampeln %3d' % (
            lid, out[lid]['counts']['stops'], out[lid]['counts']['crossings'],
            out[lid]['counts']['majorCrossings'], out[lid]['counts']['singleSections'],
            out[lid]['counts']['signals']))

    os.makedirs('artifacts/verify/%s' % ver, exist_ok=True)
    json.dump(out, open('artifacts/verify/%s/audit.json' % ver, 'w'), ensure_ascii=False, indent=1)

    tot = {k: 0 for k in ('stops', 'crossings', 'majorCrossings', 'signals',
                          'singleSections', 'singleSkipped')}
    for a in out.values():
        for k in tot:
            tot[k] += a['counts'][k]

    L = []
    L.append('# Kartenaudit: echte Daten gegen Spiel\n')
    L.append('Erzeugt von `tools/geo/audit_map.py` aus `assets/world/lines.json` (OSM-Gleise, '
             'Haltestellen, Eingleisig-Abschnitte) und den Strassenachsen der Kartenebenen '
             '`assets/game/map_<linie>.json`. Die Kreuzungen werden mit demselben Algorithmus '
             'bestimmt wie im Spiel (`buildCrossings`), die Haltestellenlage dagegen unabhaengig '
             'davon aus den Abstaenden zur naechsten befahrbaren Strasse links und rechts der '
             'Gleisachse.\n')
    L.append('| Kennzahl | Summe ueber alle Linien |')
    L.append('|---|---|')
    L.append('| Haltestellen | %d |' % tot['stops'])
    L.append('| Bahn/Kfz-Kreuzungen | %d |' % tot['crossings'])
    L.append('| davon grosse Kreuzungen (Ampel) | %d |' % tot['majorCrossings'])
    L.append('| Ampeln insgesamt (Halt + Kreuzung) | %d |' % tot['signals'])
    L.append('| eingleisige Abschnitte (umgesetzt) | %d |' % tot['singleSections'])
    L.append('| eingleisig laut OSM, im Spiel nicht gefuehrt | %d |' % tot['singleSkipped'])
    L.append('')
    L.append('## Uebersicht je Linie\n')
    L.append('| Linie | Laenge | Halte | Kreuzungen | grosse Kreuzungen | Ampeln | eingleisig | nicht gefuehrt |')
    L.append('|---|---|---|---|---|---|---|---|')
    for lid, a in out.items():
        L.append('| %s | %.0f m | %d | %d | %d | %d | %d | %d |' % (
            lid, a['total'], a['counts']['stops'], a['counts']['crossings'],
            a['counts']['majorCrossings'], a['counts']['signals'],
            a['counts']['singleSections'], a['counts']['singleSkipped']))
    L.append('')

    for lid, a in out.items():
        L.append('\n## Linie %s\n' % lid)
        L.append('### Haltestellenlage (%d)\n' % len(a['stops']))
        L.append('| # | Haltestelle | s | Lage laut Karte | Abstand links | Abstand rechts |')
        L.append('|---|---|---|---|---|---|')
        for i, s in enumerate(a['stops'], 1):
            L.append('| %d | %s | %.0f | %s | %s m | %s m |' % (
                i, s['name'].replace('|', '/'), s['s'], s['lage'],
                '-' if s['dLinks'] >= 99 else s['dLinks'],
                '-' if s['dRechts'] >= 99 else s['dRechts']))
        L.append('\n### Eingleisig / zweigleisig\n')
        if a['single']:
            L.append('| von | bis | Laenge |')
            L.append('|---|---|---|')
            for sec in a['single']:
                L.append('| %d | %d | %d m |' % (sec['s0'], sec['s1'], sec['laenge']))
        else:
            L.append('keine eingleisigen Abschnitte.')
        if a['singleSkipped']:
            L.append('\nLaut OSM eingleisig, im Spiel nicht als Engstelle gefuehrt '
                     '(kuerzer als 120 m oder im Endbereich):\n')
            L.append('| von | bis | Laenge |')
            L.append('|---|---|---|')
            for sec in a['singleSkipped']:
                L.append('| %.1f | %.1f | %.1f m |' % (sec['von'], sec['bis'], sec['laenge']))
        L.append('\nZweigleisig: %d Abschnitte, davon %d m Strecke gesamt.' % (
            len(a['double']), sum(d['laenge'] for d in a['double'])))
        L.append('\n### Bahn/Kfz- und Bahn/Fussgaenger-Kreuzungen (%d)\n' % len(a['crossings']))
        L.append('| # | s | Ampel | Fuer wen |')
        L.append('|---|---|---|---|')
        sig_at = {s['s']: s for s in a['signals'] if s['kind'] == 'Kreuzung'}
        for i, c in enumerate(a['crossings'], 1):
            has = any(abs(c['s'] - 9 - s) < 0.5 for s in sig_at)
            L.append('| %d | %.0f | %s | %s |' % (
                i, c['s'], 'ja' if has else 'nein (Vorrang Bahn)',
                'Bahn + Kfz/Fussgaenger' if has else 'Bahn hat Vorrang, Querverkehr wartet'))
        L.append('')
    open('artifacts/verify/%s/AUDIT.md' % ver, 'w').write('\n'.join(L))
    print('\nSumme: %d Halte, %d Kreuzungen, %d Ampeln, %d eingleisige Abschnitte' % (
        tot['stops'], tot['crossings'], tot['signals'], tot['singleSections']))
    print('geschrieben: artifacts/verify/%s/AUDIT.md + audit.json' % ver)


if __name__ == '__main__':
    main()
