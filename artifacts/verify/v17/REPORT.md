# Kartenaudit und echte Rotphasen – Build v17

Build: **#2520993** (Version 17) · `https://html-classic.itch.zone/html/20722357-2520993/`

## Was geaendert wurde

Nur die Ampel-/Kreuzungslogik in `js/game.js` (76 Zeilen) und die Versionskennung:

- `crossPhase(c)`: feste Phase je Kreuzung (32 s: 18 s Bahn-Gruen, 3 s Raeumzeit,
  11 s Querverkehr-Gruen), versetzt ueber die Strecke, damit nicht alle gleich schalten.
- `tramGreen(c)`: Bahn-Gruen nur in der Bahnphase; steht noch jemand im Kreuzungsbereich,
  bleibt Rot; sobald die Bahn die Haltlinie passiert hat, bleibt ihre Fahrt gesichert.
- `signalAspect` fuer `kind: 'cross'` folgt jetzt dieser Phase statt eines Zufallstimers.
- `updateStreetTraffic`: Autos halten bei Bahn-Gruen an der Haltlinie (2,4–18 m davor),
  fahren bei Querverkehr-Gruen; Geschwindigkeit wird weich geregelt.
- `updateCrossers`: Fussgaenger/Autos queren nur waehrend ihrer eigenen Gruenphase,
  und zwar an der naechsten Kreuzung – auch wenn die Bahn dort schon wartet.
- `planAt`: 4,2 s Wartezeit je signalisierter Kreuzung sind im Fahrplan eingeplant.
- Debug-Haken: `crossPhase`, `tramGreen`, `crossingOccupied`, `crossInfo`, `setLine`.

Nicht angefasst: Haltestellen, Eingleisig-Abschnitte, Signalzeichnung, Kamera, Tueren,
Punktesystem der Halte.

## Kartenaudit (alle Linien)

`tools/geo/audit_map.py` leitet aus `assets/world/lines.json` (OSM-Gleise, Halte,
Eingleisig-Bereiche) und den Strassenachsen der Kartenebenen `map_<linie>.json` ab:

| Kennzahl | Summe |
|---|---|
| Haltestellen | 488 |
| Bahn/Kfz- und Bahn/Fussgaenger-Kreuzungen | 1583 |
| davon grosse Kreuzungen mit Ampel | 400 |
| Ampeln insgesamt (Halt + Kreuzung) | 831 |
| eingleisige Abschnitte (umgesetzt) | 24 |
| laut OSM eingleisig, im Spiel nicht gefuehrt | 3 |

Vollstaendige Tabellen je Linie (jede Haltestelle mit Lage und Abstaenden, jeder
Abschnitt, jede Kreuzung mit Ampel ja/nein): `artifacts/verify/v17/AUDIT.md`.

Haltestellenlage wird aus der Geometrie bestimmt, nicht aus dem Spielschema:
Abstand zur naechsten befahrbaren Strasse links und rechts der Gleisachse.
`<= 9 m beidseitig` = Mittellage/Insel, `<= 9 m einseitig` = Fahrbahnrand,
sonst eigener Bahnkoerper.

## Soll/Ist: Spiel gegen Audit

Im laufenden Build je Linie `setLine(id)` und die erzeugten Objekte ausgelesen:

| Objekt | Audit (Soll) | Spiel (Ist) | Ergebnis |
|---|---|---|---|
| Haltestellen | 488 | 488 | alle 12 Linien deckungsgleich |
| Kreuzungen | 1583 | 1583 | alle 12 Linien deckungsgleich |
| eingleisige Abschnitte | 24 | 24 | deckungsgleich (±1 m Rundung) |
| Ampeln | 831 | 829 | 2 weniger: Signale im Bereich der zufaelligen Baustellen-Engstelle werden unterdrueckt (Linie 6 und 12, je −1) |

## Rot/Gruen an der Kreuzung (1×-Tempo, Linie 9, Kreuzung bei s = 96,4 m, Signal bei 87 m)

Anfahrt aus dem Stand, kein Teleport, Spieltempo 1×:

| Zustand | Bahnphase | `signalAspect` | Tram | Auto auf der Querstrasse |
|---|---|---|---|---|
| Rot | `cross` | `halt` | steht bei s = 76,5, v = 0 | 9,6 m vor der Kreuzung, **8,92 m/s** (faehrt) |
| Gruen | `tram` | `free` | steht bei s = 76,5, v = 0 | 15,4 m vor der Kreuzung, **0 m/s** (wartet) |

Belege: `30-crossing-red.png` (Szene mit querendem Auto), `30-crossing-red-canvas.png`,
`30-crossing-red-zoom.png` (rote Lampe, 164 Rotpixel, Box 433–449 × 139–154),
`31-crossing-green.png`, `31-crossing-green-canvas.png`, `31-crossing-green-zoom.png`
(gruene Lampe, 216 gruene Pixel, Box 433–449 × 114–129), `32-crossing-passed-canvas.png`.

### Dauerprobe (72 s, 288 Proben à 250 ms, Tram steht an der Kreuzung)

- 168 Proben Bahn-Gruen, 120 Proben Bahn-Rot; `signalAspect` genau spiegelbildlich
  (`free` 168, `halt` 120).
- In 59 der 120 Rotproben fuhr mindestens ein Auto mit > 3 m/s ueber die Kreuzung.
- **0 Proben** mit Fussgaenger/Radfahrer im Gleisbereich, waehrend die Bahn Gruen hatte.
- Nachlaufprobe (40 s, 200 Proben, 101 davon Gruen): **0 Autos** haben bei Bahn-Gruen
  die Haltlinie passiert, **0 Autos** fuhren bei Gruen im 3–6-m-Bereich davor.
  (8 von 168 Gruenproben der ersten Messung zeigten noch ein bremsendes Auto aus dem
  Uebergang Rot→Gruen; kein Auto ist dabei ueber die Linie gefahren.)

## Regression Weixdorf (Linie 7)

- Eingleisig: 8 Abschnitte × 5 Stichproben = 40/40 `narrowFactor` = 0,000, keine Abweichung.
- Alle Linien: 24 eingleisige Abschnitte × 5 = 120/120 `narrowFactor` = 0,000.
- Signalzeichnung, Halte-Logik und Tueren sind unveraendert (Diff enthaelt keine
  Zeile aus `drawSignals`, `drawNarrows`, `stopAtPlatform` oder `serveStop`).

## Grenzen des Audits

- Die Rotphasen sind Festzeit (kein adaptiver OeV-Bevorrechtigung); die Wartezeit ist im
  Fahrplan pauschal eingeplant, nicht je Fahrt berechnet.
- Nur grosse Kreuzungen (400 von 1583) haben eine Bahnampel; an den uebrigen gilt
  Vorrang der Bahn, der Querverkehr wartet dort nicht auf ein Signal.
- Die Haltestellenlage stammt aus Strassenabstaenden, nicht aus Bahnsteigpolygonen; sie
  beschreibt die Lage im Strassenraum, nicht die exakte Bahnsteigkante.
- Drei OSM-Eingleisig-Bereiche (Linie 3, 9, 11) liegen mit unter 120 m im Endbereich und
  werden bewusst nicht als Engstelle gefuehrt; sie sind im Audit einzeln aufgelistet.
