# Weixdorf (Linie 7) – Belege am ausgelieferten Build v16

Build: **#2520552** · Version **16** · `https://html-classic.itch.zone/html/20722357-2520552/`
Butler-Status: `html5 | #20722357 | ✓ #2520552 (from #2520426) | 16`

## Auslieferung (HTTP 200 + Versionskennung)

| Datei | Status | Größe |
|---|---|---|
| `index.html` | 200 | 4.377 B |
| `js/game.js` | 200 | 90.873 B |
| `css/game.css` | 200 | 14.589 B |
| `assets/game/map_7.json` | 200 | 885.411 B |
| `assets/world/lines.json` | 200 | 120.509 B |

- `index.html` enthält `<meta name="build" content="v16">` sowie `src="js/game.js"` / `href="css/game.css"` (pfadbasiert).
- `js/game.js` enthält den Signal-Mindestgrößen-Code (`26 / (5.3 * S.zoom)`), 1× gefunden.

### Warum die Auslieferung in diesem Zug geändert wurde
Die vorherige Version lud Assets mit `?v=48/49`. itch cacht **404 pro exaktem URL**: der erste Abruf von `?v=49` fiel in die Build-Propagation und blieb dauerhaft 404, d. h. der Build war für Spieler defekt (HTML lud, JS/CSS nicht). Ab v16 werden die Assets ohne Query geladen; die Versionskennung steht als `meta build` im HTML und die Build-ID in der URL. Jeder Push erhält ein eigenes Verzeichnis, damit ist keine Query-Cache-Busting mehr nötig.

## Punkt 1 – Einfahrsignal bei Standard-Kamera-Zoom (cam 0), 1×-Lauf

Methode: echte Fahrt mit Tastatur (`w` = Strom) ab Start, keine Teleports; Gegenzug im Abschnitt [196, 442] gehalten (Testaufbau), Leinwand-Pixelscan auf die exakten Lampenfarben (`#ff3b30` / `#27e06a`) je Frame.

### Rot (Gegenbahn im Abschnitt, `narrowBusy = true`)
| Shot | s | v | busy | rote Pixel | Bounding-Box (192×108) |
|---|---|---|---|---|---|
| 1 | 152,4 | 7,9 | true | 43 | x 101–107, y 0–? |
| 2 | 167,6 | 7,2 | true | 35 | x 101–107, y 26–32 |
| 3 | 177,0 | 3,1 | true | 38 | x 101–107, y 43–50 |

Artefakte: `red-series-1.png`, `red-series-2.png`, `red-series-3.png`, Ausschnitt `02-red-signal-zoom.png`
(Lampe 29 × 30 px im 800 × 452-Bild, dunkles Gehäuse + heller Ring → eindeutig rot.)

### Grün (Abschnitt frei, `narrowBusy = false`)
| Shot | s | v | busy | grüne Pixel | Bounding-Box |
|---|---|---|---|---|---|
| 1 | 154,3 | 8,2 | false | 41 | x 101–107, y 2–8 |
| 2 | 170,0 | 7,5 | false | 40 | x 101–107, y 30–37 |
| 3 | 179,4 | 7,1 | false | 41 | x 101–107, y 47–54 |

Artefakte: `green-series-1.png`, `green-series-2.png`, `green-series-3.png`, Ausschnitt `03-green-signal-zoom.png`
(Lampe 29 × 34 px, eindeutig grün.)

Ergebnis: Das Einfahrsignal erscheint ab ca. s = 151 (≈ 23 m vor dem Abschnittsanfang 196 − 22 = 174) am oberen Bildrand und wandert beim Annähern sichtbar nach unten – es ist über die gesamte Anfahrt bei Standard-Zoom eindeutig rot bzw. grün.

## Punkt 2 – Echter Halte-Zyklus in Spielzeit (kein Teleport)

Ziel: „Haltepunkt Weixdorf Bad“, s = 501, Bahnsteig 25 m. Fahrt ab Start mit gepulstem Strom (Motor max. 81 °C, kein Thermoschutz).

| Schritt | Ergebnis |
|---|---|
| Anhalten | s = 509,4 · v = 0 · `stopAtPlatform()` = „Haltepunkt Weixdorf Bad“ |
| Türen öffnen (`d`) | doors = 1 · **score 0 → 130** · served = 1 · board = 3 |
| Gutschrift | Toast „Halt Haltepunkt Weixdorf Bad · +100 · pünktlich +30“ (genau einmal) |
| Ein-/Ausstieg | board 0, alight 0 · score 154 (3 × +8 Fahrgastbonus = +24, keine zweite Halt-Gutschrift) |
| Türen schließen (`d`) | doors = 0 · score 154 · served 1 |
| Weiterfahren | s = 513,2 · v = 3,07 |
| Meldungen | `missed` = **[]** → kein „Halt verpasst“; kein „Zu dicht aufgefahren“ |

Artefakte: `10-stopped.png`, `11-doors-open.png`, `12-doors-closed.png`

## Punkt 3 – Eingleisigkeit (Regressionsstichprobe, gleicher Build)

8 eingleisige Abschnitte, je 5 Stichproben (Anfang+15 m, 25 %, Mitte, 75 %, Ende−15 m) = **40 Messpunkte**:

| # | Abschnitt | `narrowFactor` an 5 Punkten | busy |
|---|---|---|---|
| 1 | 196–442 | 0 / 0 / 0 / 0 / 0 | false |
| 2 | 593–1253 | 0 / 0 / 0 / 0 / 0 | false |
| 3 | 1429–1999 | 0 / 0 / 0 / 0 / 0 | false |
| 4 | 2132–2424 | 0 / 0 / 0 / 0 / 0 | false |
| 5 | 3195–3444 | 0 / 0 / 0 / 0 / 0 | false |
| 6 | 3481–3705 | 0 / 0 / 0 / 0 / 0 | false |
| 7 | 3883–4343 | 0 / 0 / 0 / 0 / 0 | true |
| 8 | 9657–10045 | 0 / 0 / 0 / 0 / 0 | false |

`narrowFactor = 0` bedeutet genau eine sichtbare Fahrspur im Abschnitt; die Rampe auf 1,0 liegt außerhalb (16 m an den Enden). Artefakte: `single-1.png` … `single-8.png`.

## Einschränkungen / offen

- Der Rot-Fall wurde mit einem **im Abschnitt gehaltenen Gegenzug** erzeugt (Testaufbau), weil die natürlich verkehrenden Gegenzüge auf Linie 7 erst bei s ≈ 2.800–23.500 starten und den Abschnitt bei 196 erst nach mehreren Minuten erreichen. Der Grün-Fall lief ohne Eingriff.
- Die Signalgüte wurde auf der Leinwand (192 × 108, hochskaliert auf 800 × 452) geprüft. Auf sehr kleinen Fenstern (< 400 px Breite) bleibt die Lampe klein, aber farblich eindeutig.
- Keine Änderungen an Kamera, Gleisgeometrie oder anderen Streckenteilen in diesem Zug; geändert wurde nur die Auslieferung (Asset-URLs + Build-Marker) und – bereits in v15 – die Signal-Mindestgröße.
