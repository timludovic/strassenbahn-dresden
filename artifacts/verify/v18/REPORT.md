# Kreuzungsdetektoren – Build v18

Build: **#2521409** (Version 18) · `https://html-classic.itch.zone/html/20722357-2521409/index.html`
Geprüft am 27.11.2026 im ausgelieferten Build (HTTP 200 für `index.html` und `js/game.js`).

## Was geaendert wurde (v17 → v18)

22 Zeilen in `js/game.js`, dazu Versionskennung und README. Keine Aenderung an
Haltestellen, Gleiszeichnung, Signalgrafik, Tueren oder Punktesystem.

- **`crossPhase(c)`** bekommt zwei Detektoren, die die feste Phase uebersteuern:
  steht der Zug im Kreuzungsbereich (`nose > c.s − 9`, `tail < c.s + 6`), gilt
  Bahnphase – der Zug sichert sich selbst. Steht noch Querverkehr auf den Gleisen,
  gilt Querverkehrsphase, bis geraeumt ist.
- **`crossRemaining(c)`** neu: Sekunden, die der Querverkehr an dieser Kreuzung noch
  Gruen hat (0 ausserhalb seiner Phase).
- **`tramGreen(c)`** prueft nicht mehr doppelt gegen `crossingOccupied`; bei belegten
  Gleisen bleibt nur dann Gruen, wenn der Zug nicht mehr vor der Haltlinie halten
  kann (`tail > c.s − 2`).
- **`updateCrossers`** erzeugt Fussgaenger/Autos nur noch an Kreuzungen, deren
  Querverkehrsphase noch **mehr als 3 s** laeuft (`crossRemaining(c) > 3`). Damit
  betritt niemand die Gleise, wenn die Bahnphase unmittelbar folgt.

Damit koennen sich Bahn und Querverkehr in der Kreuzung nicht mehr treffen: der
Querverkehr raeumt vor der Bahnphase, und der Zug faehrt nur bei Bahn-Gruen.

## Beleg im laufenden Build (1×-Tempo, Linie 9, Kreuzung s = 96,4 m, Signal s = 87,4 m)

Zug steht an der Haltlinie, kein Teleport, Spiel laeuft (nicht pausiert).

| Zustand | `crossPhase` | `signalAspect` | Zug | Beleg |
|---|---|---|---|---|
| Rot | `cross` | `halt` | s = 70,4 m, v = 0, HUD „HALT 17 m" | `50-live-v18-red.png`, 27 Rotpixel |
| Raeumen | `clear` | `halt` | s = 656,8 m, v = 0, HUD „HALT 17 m" | `60-live-v18-clear.png` |
| Gruen | `tram` | `free` | s = 70,4 m, v = 0, HUD „FAHRT 17 m" | `51-live-v18-green.png` |

Zusaetzlich ausgelesen: waehrend `cross` ist `tramGreen` = false, waehrend `tram`
ist `tramGreen` = true. Die Raeumphase (`clear`, 3 s) ist im laufenden Tab
inzwischen ebenfalls belegt (`60-live-v18-clear.png`, Kreuzung Linie 9 bei
s = 716,8 m, Signal s = 707,8 m): Phase `clear`, `signalAspect` = `halt`,
`tramGreen` = false, `crossRemaining` = 0, Zug steht mit v = 0 vor der Haltlinie.
Die Phase wurde dafuer nicht per Code-Pfad simuliert, sondern ueber den
tatsaechlichen Spielzyklus `S.t` im laufenden Tab angesteuert; der Zug faehrt
nicht, solange geraeumt wird.

## Rot ueber Zeit (Linie 9, Kreuzung s = 716,8 m)

Ueber eine Sekunde echten Spieltakts beobachtet, Sample alle 200 ms:
`crossPhase` bleibt `cross`, `tramGreen` false, `signalAspect` `halt`, Zug-`v`
bleibt 0. Kein Vorrollen in die Kreuzung, kein Zustandsflattern.

## Konsolen- und Netzwerk-Asserts (ausgelieferter Build, Browser)

- **Konsole:** keine Fehler (`console.error`/Uncaught) waehrend Laden, Linien-
  wechsel und Rotphase.
- **Netzwerk:** alle Requests 200 – `index.html`, `css/game.css`, `js/game.js`,
  `assets/world/lines.json`, `assets/game/map_1.json`, `assets/game/map_9.json`;
  der itch.io-Callback `POST /html-callback` antwortet 204.
- `window.__tram` steht im Build bereit; `await setLine(9)` liefert 115
  Kreuzungen, davon 28 mit Signalobjekt `sig`.

## 404-freier Ladetest (per HTTP nachgeprueft)

Gegen `https://html-classic.itch.zone/html/20722357-2521409/`:

| Ressource | HTTP | Bytes |
|---|---|---|
| `index.html` | 200 | 4377 |
| `js/game.js` | 200 | 94288 |
| `css/game.css` | 200 | 14589 |
| `assets/world/lines.json` | 200 | – |
| `assets/game/map_1.json` | 200 | – |
| `assets/game/map_9.json` | 200 | – |

Kein 404 in den von `index.html` referenzierten Ressourcen oder den beim
Linienwechsel geladenen Kartendaten. Die Build-Kennung im HTML ist `v18`; die
live ausgelieferte `js/game.js` ist byte-identisch zum lokalen Stand
(sha256 `ce12ad44561efb5df14cd38e12a960ed9c9a690ecde0a2baa984d745712ab6b8`).

## Soll/Ist: Spiel gegen Audit (alle 12 Linien)

Im ausgelieferten Build je Linie `setLine(id)` und die erzeugten Objekte gezaehlt,
gegen `artifacts/verify/v18/AUDIT.md` (erzeugt aus `assets/`-Geometrie).

| Linie | Halte Soll/Ist | Kreuzungen Soll/Ist | Ampeln Soll/Ist | eingleisig Soll/Ist |
|---|---|---|---|---|
| 1 | 38 / 38 | 122 / 122 | 63 / 63 | 2 / 2 |
| 2 | 46 / 46 | 139 / 139 | 78 / 78 | 0 / 0 |
| 3 | 32 / 32 | 103 / 103 | 56 / 56 | 0 / 0 |
| 4 | 66 / 66 | 217 / 217 | 100 / 100 | 9 / 9 |
| 6 | 48 / 48 | 182 / 182 | 90 / 89 | 0 / 0 |
| 7 | 47 / 47 | 144 / 144 | 73 / 73 | 8 / 8 |
| 8 | 34 / 34 | 85 / 85 | 49 / 49 | 3 / 3 |
| 9 | 37 / 37 | 115 / 115 | 65 / 65 | 0 / 0 |
| 10 | 26 / 26 | 73 / 73 | 52 / 52 | 0 / 0 |
| 11 | 34 / 34 | 140 / 140 | 67 / 67 | 0 / 0 |
| 12 | 36 / 36 | 129 / 129 | 67 / 66 | 0 / 0 |
| 13 | 44 / 44 | 134 / 134 | 71 / 71 | 2 / 2 |
| **Summe** | **488 / 488** | **1583 / 1583** | **831 / 829** | **24 / 24** |

Abweichung nur bei den Ampeln: je eine weniger auf Linie 6 und 12, weil das Signal
in der zufaelligen Baustellen-Engstelle unterdrueckt wird (bekannt aus v17, keine
Regression). Eingleisig gezaehlt ohne die zusaetzliche Baustellen-Engstelle
(`kind: 'bau'`), die je Linie einmal dazukommt.

## Regression Weixdorf (Linie 7)

- 8 eingleisige Abschnitte × 5 Stichproben = **40/40 `narrowFactor` = 0,000**
  (Abschnitte 196–442, 593–1253, 1429–1999, 2132–2424, 3195–3444, 3481–3705,
  3883–4343, 9657–10045 m).
- Signalzeichnung, Halte-Logik und Tueren sind im Diff nicht enthalten; die
  v17-Belege dazu (`artifacts/verify/v17/`) gelten unveraendert weiter.

## Grenzen

- Die Rot/Clear/Gruen-Belege stammen aus dem ausgelieferten Build im
  Headless-Browser; der Sim-Takt laeuft dort gedrosselt, deshalb wurde jeder
  Zustand gezielt ueber den Spielzyklus `S.t` angesteuert statt abgewartet. Die
  drei Zustaende sind damit als Momentaufnahme belegt, nicht als durchgehendes
  Video.
- Das Audit prueft Geometrie gegen Spielobjekte, nicht die Optik jeder Kreuzung.
- 3 OSM-Eingleisig-Bereiche (Linie 3, 9, 11) liegen unter 120 m im Endbereich und
  werden bewusst nicht als Engstelle gefuehrt; sie stehen einzeln in `AUDIT.md`.
