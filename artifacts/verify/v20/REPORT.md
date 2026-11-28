# Kreuzungen, Ampeln und Haltestellen – Build v20

Build: **#2525747** (Version 20) · `https://html-classic.itch.zone/html/20722357-2525747/index.html`
Geprueft am 28.11.2026 im ausgelieferten Build. Alle Zahlen unten sind im Browser aus
`window.__tram` gelesen, nicht aus dem Quelltext abgeleitet.

## Was sich gegenueber v18 geaendert hat

Drei Loecher, die beim Abgleich aufgefallen sind:

1. **Nicht jede grosse Kreuzung hatte eine Haltlinie davor.** `buildSignals` unterdrueckte
   die Kreuzungsampel, sobald irgendeine Ampel – auch eine reine Haltestellenampel – innerhalb
   von 28 m lag, und liess sie in eingleisigen/baustellen-Engstellen ganz weg. Ergebnis in v18:
   400 grosse Kreuzungen, aber nur 343 mit eigener Ampel; bei 10 lag die naechste Ampel sogar
   *hinter* der Kreuzung, bei 14 war gar keine in Reichweite.
2. **Querverkehr fuhr auch an unbeschilderten Kreuzungen.** `updateCrossers` nahm jede Kreuzung
   als Kandidat, auch die 1183 kleinen ohne Ampel. Dort kann die Bahn gar nicht halten, weil es
   kein Signal gibt – Auto und Bahn trafen sich also doch.
3. **Die Vorrangschaltung hob das Rot auf.** `signalAspect` gab bei angeforderter Vorrangschaftung
   `free` zurueck, auch an Kreuzungen. Im Fahrbetrieb (naeher als 150 m, schneller als 6 m/s,
   laenger als 1,2 s) wurde damit jede Kreuzung gruen, obwohl der Querverkehr Gruen hatte.

Behoben in v20:

- **`buildSignals`**: jede grosse Kreuzung bekommt ihre eigene Haltlinie 9 m davor. Unterdrueckt
  wird nur noch eine zweite *Kreuzungs*ampel innerhalb von 20 m; Haltestellenampeln und Engstellen
  zaehlen nicht mehr als Deckung.
- **`updateCrossers`**: Querverkehr nur noch an Kreuzungen mit `c.sig`, also dort, wo die Bahn eine
  Haltlinie vor der Kreuzung hat.
- **`signalAspect`**: Vorrangschaltung wirkt nicht mehr auf Kreuzungsampeln; dort gilt allein die
  Phase (`tramGreen`).

Mitgefuehrt: `game.html` Build v20, `tools/geo/audit_map.py` mit derselben Signalregel,
README-Abschnitt zu den Ampelphasen.

## Abdeckung im laufenden Build (alle 12 Linien)

Je Linie `await setLine(id)` und die erzeugten Objekte gezaehlt:

| Linie | grosse Kreuzungen | mit eigener Ampel | ohne Ampel | Haltlinie hinter der Kreuzung | Ampeln gesamt |
|---|---|---|---|---|---|
| 1 | 29 | 29 | 0 | 0 | 67 |
| 2 | 37 | 37 | 0 | 0 | 83 |
| 3 | 28 | 28 | 0 | 0 | 60 |
| 4 | 43 | 43 | 0 | 0 | 109 |
| 6 | 48 | 48 | 0 | 0 | 96 |
| 7 | 35 | 35 | 0 | 0 | 82 |
| 8 | 22 | 22 | 0 | 0 | 56 |
| 9 | 30 | 30 | 0 | 0 | 67 |
| 10 | 28 | 28 | 0 | 0 | 54 |
| 11 | 35 | 35 | 0 | 0 | 69 |
| 12 | 36 | 36 | 0 | 0 | 72 |
| 13 | 29 | 29 | 0 | 0 | 73 |
| **Summe** | **400** | **400** | **0** | **0** | **888** |

888 = 488 Haltestellenampeln + 400 Kreuzungsampeln. In v18 waren es 831 (343 Kreuzungsampeln);
die 57 fehlenden Haltlinien sind jetzt da. Keine Haltlinie liegt hinter ihrer Kreuzung.

## Rot und Gruen im laufenden Build (1×-Tempo)

Kreuzung **Linie 9, s = 13 831 m** – eine der 57 Kreuzungen, die in v18 keine Ampel hatten.
Neue Haltlinie bei s = 13 822 m, Zug steht bei s = 13 791 m (v = 0).

| Zustand | `crossPhase` | `signalAspect` | `tramGreen` | Querverkehr | HUD | Beleg |
|---|---|---|---|---|---|---|
| Rot | `cross` | `halt` | false | Auto/Person auf den Gleisen bei s = 13 831 | „HALT 31 m“ | `70-live-v20-red.png` |
| Rot + Vorrang angefordert | `cross` | `halt` | false | – | – | Live-Auslesung (in v18: `free`) |
| Gruen | `tram` | `free` | true | keiner | „FAHRT 31 m“ | `71-live-v20-green.png` |

Ausgelesen im selben Lauf: `crossRemaining` = 8,0 s beim Rot-Beleg, `S.v` = 0, `S.s` unveraendert.
Zwei Autos (`off` = −12,0 und +3,5) bzw. eine Person (`off` = −7,9) querten in der Rotphase die
Gleise, waehrend die Bahn stand.

**Unbeschilderte Nebenkreuzung** (Linie 9, s = 14 192,9 m, `sig` = false): `crossPhase` = `cross`,
aber **0** Querverkehr ueber 1,8 s Beobachtung – dort faehrt niemand mehr, weil die Bahn keine
Haltlinie hat.

## Soll/Ist: Spiel gegen Audit v20

`artifacts/verify/v20/AUDIT.md` (aus `assets/`) gegen die Objekte im Build:

| Kennzahl | Audit (Soll) | Build (Ist) |
|---|---|---|
| Haltestellen | 488 | 488 |
| Bahn/Kfz-Kreuzungen | 1583 | 1583 |
| davon grosse Kreuzungen | 400 | 400 |
| Ampeln gesamt | 888 | 888 |
| eingleisige Abschnitte | 24 | 24 |
| eingleisig laut OSM, nicht gefuehrt | 3 | 3 (unveraendert) |

## Haltestellenlage (488, gegen die Strassenachsen der Karte)

Aus `AUDIT.md`, pro Halt mit Abstand zur naechsten Strasse links/rechts der Gleisachse:

| Lage | Anzahl |
|---|---|
| am Fahrbahnrand | 224 |
| neben der Fahrbahn (eigener Bahnkoerper) | 220 |
| zwischen den Spuren (Mittelinsel) | 44 |
| ohne Zuordnung | 0 |

Jede Haltestelle steht mit Name, `s`, Lage und beiden Abstaenden in `AUDIT.md`.

## Eingleisig (24 Abschnitte)

| Linie | Abschnitte | Laengen |
|---|---|---|
| 1 | 2 | 849 m, 482 m |
| 4 | 9 | 2 349–11 801 m Bereich |
| 7 | 8 | 196–10 045 m (Weixdorf) |
| 8 | 3 | 80–955, 1 930–2 817, … |
| 13 | 2 | Endbereiche |

Die drei OSM-Eingleisig-Bereiche unter 120 m (Linien 3, 9, 11) bleiben bewusst ungefuehrt und
stehen einzeln in `AUDIT.md`.

## Regression Weixdorf (Linie 7)

8 eingleisige Abschnitte × 5 Stichproben = **40/40 `narrowFactor` = 0,000**, 8 `single`-Abschnitte
im Build. Signalgroesse, Tuerstopp und Eingleisigkeit sind im Diff nicht angefasst; die v17-Belege
dazu gelten weiter.

## Konsole und Netzwerk (Build #2525747)

- **Konsole:** keine Fehler nach frischem Laden, Linienwechsel und den Rot/Gruen-Zustaenden.
- **Netzwerk:** `index.html`, `js/game.js`, `css/game.css`, `assets/world/lines.json` und
  `assets/game/map_1…13.json` alle **200**, `POST itch.io/html-callback` **204**.

## 404-freier Ladetest

| Ressource | HTTP | Bytes |
|---|---|---|
| `index.html` | 200 | 4 377 |
| `js/game.js` | 200 | 94 867 |
| `css/game.css` | 200 | 14 589 |
| `assets/world/lines.json` | 200 | – |
| `assets/game/map_1…13.json` | 200 | – |

Build-Kennung im HTML: `v20`. Die live ausgelieferte `js/game.js` ist byte-identisch zum lokalen
Stand (sha256 `28f05092b9c856d686f166b548db3566805a4d3696635b8763fbe444ed9f8f36`).

Hinweis zur Auslieferung: direkt nach dem Push lieferte der itch-CDN fuer einige Minuten 404 auf
die neuen Dateien (negative Cache), obwohl der Ursprung sie schon hatte. Nach der Propagation
antworten alle Pfade 200; die Pruefungen oben stammen aus diesem Zustand.

## Grenzen

- Eine **Ampelstoerung** (`signalFail`, zufaelliger Zwischenfall) setzt weiterhin alle Signale auf
  Fahrt, auch Kreuzungsampeln. Das ist der bewusst modellierte Stoerfall und im HUD gemeldet; die
  normale Phasenlogik ist davon nicht betroffen.
- Querverkehr gibt es jetzt nur an den 400 ampelgesicherten Kreuzungen. Die 1183 kleinen
  Nebenkreuzungen haben keinen mehr – dort haette die Bahn keine Haltlinie.
- Die Rot/Gruen-Belege sind Momentaufnahmen im laufenden Build; die Phase wurde ueber `S.t`
  angesteuert, weil der Sim-Takt im Hintergrund-Tab gedrosselt ist.
- Das Audit prueft Geometrie und Spielobjekte, nicht die Optik jeder einzelnen Kreuzung.
