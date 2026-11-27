# Straßenbahn Dresden – Der Simulator

Ein detailverliebter 2D-Pixelart-Straßenbahn-Simulator für das Dresdner Netz – komplett im Browser, ohne Build-Werkzeuge, ohne Server.

Du übernimmst einen Kurs der Linie 1 (und elf weiterer DVB-Linien), hältst den Fahrplan, quittierst die Sifa, bedienst Türen und Rollstuhlrampe, stellst Weichen selbst, achtest auf die Straßenbahn-Signale (Fs), rangierst nach einem Fehler zurück – und grüßt unterwegs die Kolleginnen und Kollegen.

## Spielen

Einfach `index.html` über einen beliebigen Webserver ausliefern (ES-Module brauchen HTTP):

```bash
python3 -m http.server 3002
# danach http://localhost:3002 öffnen
```

Fertiges itch.io-Paket: `release/strassenbahn-dresden.zip` (HTML-Spiel, Einstiegspunkt `index.html` im Zip-Wurzelverzeichnis). Store-Text und Upload-Notizen stehen in `release/README-ITCH.md`.

## Netzkarte (ganze Stadt)

`assets/world/tiles/` enthält das komplette Straßenbahnnetz als Korridor-Kacheln: 228 Zellen à
600 m, 1.984 × 1.984 px (1 m = 3,2 px), nur der Streifen ±70 m links/rechts der Gleise, alles
andere dunkel. Dazu `manifest.json` und die Übersicht `assets/world/city-overview.jpg`.

```bash
python3 tools/geo/city_tiles.py     # fehlende Kacheln holen + rendern (wiederaufsetzbar)
python3 tools/geo/city_overview.py  # Übersicht aus allen Kacheln neu bauen
python3 tools/geo/corridor.py       # Korridor-Maske für die Innenstadtkarte
```

## Spiel (game.html)

Querformat (16:9-Bühne, letterboxed) im Pixelstil: gezeichnet wird auf einer festen
192×108-Leinwand, die per CSS `image-rendering: pixelated` scharf hochskaliert wird; das HUD hat
harte Kanten und Pixelfont-Optik. Welt und HUD sind grob gepixelt – Umrisse, Klötzchenbäume und
das dunkle Gleisbett mit zwei hellen Schienen.

Farben: leuchtende Wiese (`#a2dd6c`) als Grund, sattgrüne Parks, warme Sandsteinbauten in sechs Tönen,
helle Straßen mit cremefarbenen Bürgersteigen, kräftig blaues Wasser, weiße Schienen.

Fahrzeugtypen mit eigener Physik: **NGT6DD** (28 m, 2 Teile, 1,95 m/s², 70 km/h), **NGT D8DD**
(33 m, 3, 1,72 m/s², 70), **NGT DXDD** (38 m, 3, 1,55 m/s², 65), **NGT D12DD** (45 m, 4,
1,38 m/s², 60) sowie der freischaltbare **Tatra T4D** (29 m, 2, 1,62 m/s², 62) ab 3000
Karrierepunkten – Umschalten mit **1**–**5** oder dem Typknopf in der Leiste. Kurze Wagen ziehen
besser, lange rollen träger und bremsen später. Der Zoom folgt der Fahrzeuglänge, der Wagen füllt die
Höhe also immer. Alle tragen den gelben DVB-Anstrich mit dem Streifen ihrer Linie.

**Doppeltraktion** (Startbild → Zug → DOPPEL): zwei Wagen mit 1,4 m Kupplungsabstand, zusammen
länger, schwerer und träger – der Zoom passt sich an. Die Wahl bleibt in `localStorage` gespeichert.

**Alle Linien 1–4 und 6–13** (also ohne 5) sind fahrbar, jede auf ihrem echten Gleisverlauf:

- Strecken: `assets/world/lines.json` – für jede Linie ein `chain` aus OSM-Gleisen, per Dijkstra
  zwischen den Haltestellen geroutet (`tools/geo/lines_build.py`), 11,7–33,2 km, 26–66 Halte mit
echten Namen.
- Karte je Linie: `assets/game/map_<linie>.json` (`tools/geo/game_map_lines.py`), Korridor ±110 m
  um die Strecke: Gebäude, Straßen, Grün, Wasser, Bäume. Lange Wege mit weit auseinanderliegenden
  Knoten werden segmentweise geprüft, damit keine Straße im Korridor ausfällt. Straßen bekommen
  erst alle Ränder und dann alle Füllungen – so bleiben keine dunklen Trennlinien an Kreuzungen.
  Das Fahrgleis zeichnet das Spiel selbst, dadurch ist die eigene Schiene lückenlos.
- Linienwahl: Linienknopf oben links oder die Knopfreihe im Startbild.

Die Kamera sitzt am Wagen, dreht mit der Fahrtrichtung und hält den Zug senkrecht in der Bildmitte
über die ganze freie Höhe – in der Kurve dreht sich die Stadt um ihn herum, der Zug biegt sich
dabei über die Gleise. Die vierte Ansicht (**VOGEL**) hängt stattdessen dicht über dem Führerhaus:
14 m Bildhöhe, der Blick von oben auf Dach und Fahrerstand, das Gleis voraus füllt fast die ganze
Höhe – deutlich näher am Boden als Verfolg oder Führerstand.

**Rechtsverkehr:** Der eigene Wagen läuft immer auf dem rechten Gleis der Fahrtrichtung, Gegenbahnen
kommen auf dem linken Gleis entgegen (Gleisabstand 4 m, damit man es im Pixelbild sieht).

**Echte eingleisige Abschnitte:** Wo in OSM nur ein Tramgleis liegt (Außenäste der Linien 1, 4, 7, 8,
13), ist auch im Spiel nur ein Gleis verlegt; beide Richtungen teilen es sich. An den Enden stehen
Einfahrsignale (grün = frei, rot = Gegenbahn im Abschnitt). Kommt eine Gegenbahn, wartet man vor der
Einfahrt, die Gegenbahn hält draußen am Signal; nach der Durchfahrt gibt es +40. Berechnet aus den
echten OSM-Gleisen mit `python3 tools/geo/single_track.py` (schreibt `single` in `lines.json`).

- Fahren: **Fahrschalter links** (hoch = Strom, Mitte = 0, runter = Bremse, bleibt stehen) in
  Stufen von 0/25/50/75/100 % – oder W/↑ / S/↓. Türen: Knopf **TÜREN** rechts oder D/Leertaste
  (nur im Stand). 1–5 Typ, R neu, +/− bzw. Mausrad Zoom, P Pause. **F** Sifa, **K** Klingel,
  **G** Sanden, **C** Kamera, **V** Foto, **M** Ansagen, **B** rangieren, **7–0** Türen Wagen 1–4.
- **Fahrmotor-Thermik**: Dauervollgas wird bestraft. Die Motortemperatur steht oben als **MOT**-Chip
  (Start je nach Wetter 20–34 °C). Fahrstufe 4 heizt mit gut 3 °C/s, ab 92 °C drosselt die Steuerung
  die Leistung (Anzeige gelb, Motorgehäuse rot umrandet), ab 102 °C schaltet der Thermoschutz ab:
  Zwangsbremsung, Hebel fällt auf 0, −60 Punkte, und erst unter 82 °C gibt es wieder Strom.
  Fahrstufe 2 (50 %) ist thermisch stabil; im Rollen kühlt der Motor mit rund 1 °C/s ab, nach einer
  Abschaltung mit 3,4 °C/s – die Zwangspause ist also schnell vorbei.
  Am Ende steht die Höchsttemperatur im Fahrbericht.
- **Fahrplan**: jede Fahrt hat eine Sollzeit (8,2 s pro 100 m plus 14 s je Halt). Oben läuft die
  Abweichung mit (±25 s grün, bis ±60 s gelb, darüber rot); pünktliche Halte geben +30, am Ende
  zählt die Restabweichung bis +240 und die Fahrgaststimmung bis +200.
- **Sifa**: alle 40 s quittieren (Knopf **SIFA** oder F), sonst Zwangsbremsung bis zum Stillstand und
  Punkteverlust. Der Knopf zählt sichtbar herunter und wird unter 8 s rot. Im Startbild unter
  **Sifa → AUS** abschaltbar, wenn man ohne Wachsamkeitskontrolle fahren möchte (dann steht im HUD
  „SIFA AUS“).
- **Klingel**: der Dresdner Zweiklang („ding-dong“) über den Knopf **KLL** rechts oder **K** –
  Fußgänger und Radfahrer auf den Gleisen treten zurück (+20). Sobald vorn jemand kreuzt, blinkt
  oben rechts „KLINGEL xx m“; ein Druck reicht, bevor der Wagen heran ist. Autos queren weiter.
- **Türen pro Wagen**: **TÜREN** öffnet nur die Wagen, die am Bahnsteig stehen; mit **W1–W4**
  (Tasten **7–0**) lassen sich einzelne Wagen öffnen und schließen. Ein Wagen neben dem Bahnsteig
  ist im HUD orangefarben umrandet – seine Tür zu öffnen kostet 25 Punkte.
- **Fahrschule**: im Startbild **FAHRSCHULE** – sechs Schritte von Anfahren über Klingel, Sifa,
  Zielbremsen und Türen bis zur Weiche; am Ende gibt es 200 Punkte.
- **Verkehr und Fahrgäste**: Autos fahren auf den Straßen aus den OSM-Daten, mehr Gegenbahnen
  kommen entgegen, Fahrgäste warten sichtbar am Bahnsteig und laufen animiert zur Tür.
- **Sanden** (Knopf oder G): 4 s mehr Grip gegen Schleudern bei Regen, Laub und Schnee.
- **Türen mit Störung**: ein Zwischenfall lässt die Türen nur noch mit 45 % Geschwindigkeit laufen;
  wer während des Fahrgastwechsels schließt, blockiert die Türen und muss warten.
- **Haltestellen mit Fahrgästen**: Bahnsteig, Wartehäuschen, Haltestellenschild und wartende
  Passagiere werden gezeichnet. Türen öffnen → Fahrgäste steigen aus und ein (+8 pro Zugestiegenem,
  +100 für den Halt), die Anzahl an Bord steht im HUD.
- **Ampeln (Form statt Farbe)**: Straßenbahn-Ampeln im Dresdner Stil – dunkles Gehäuse, weiße
  Formen: liegender Balken = Halt, senkrechter Balken = Fahrt, Schräge = Abzweig nach links/rechts.
  Sie stehen an jeder Haltestelle (Abfahrtsignal: Halt solange Türen offen) und an den großen
  Straßenkreuzungen; an großen Kreuzungen erkennt die Ampel die Bahn („A“-Platte, Vorrangschaltung).
  Quert ein Auto oder Radler, zeigt die Ampel Halt. Die Anzeige steht auch im HUD mit Entfernung;
  über Halt zu fahren kostet 50 Punkte, freie Fahrt gibt 5.
- **Eingleisig und Engstellen**: echte eingleisige Strecken aus den OSM-Gleisen (ein Gleis, Signale
  an beiden Enden) und dazu eingleisige Baustellenabschnitte mit Absperrung. Kommt eine Gegenbahn,
  bremst das Spiel sanft vor der Einfahrt ab, die Gegenbahn wartet draußen, dann geht es weiter (+40).
- **Weichen von Hand**: Vor jeder Weiche zeigt das HUD Entfernung und Richtung (◀/▶). Mit den
  Knöpfen **◀ ▶** unten oder **Z**/**X** stellen. Falsch gestellt → der Wagen rollt ins Stumpfgleis
  (−80); dort **RANGIEREN** (Knopf oder B), der Wagen setzt langsam zurück, die Weiche wird richtig
  gestellt, dann geht es weiter. Richtig gestellt → +30.
- **Langsamfahrstellen und Baustellen**: La-Schilder begrenzen das Tempo (30/20 km/h), zu schnell
  kostet 30; Baustellen sperren einen Halt, im HUD steht dann „Halt entfällt“, Türen bleiben zu.
- **Querverkehr** an Kreuzungen: Autos und Radler kreuzen das Gleis – rechtzeitig bremsen, sonst
  Zusammenstoß (−120, Stimmung runter).
- **Vorrangschaltung**: nähert man sich einem Signal, schaltet die Leitstelle auf Grün (HUD „VORRANG“).
- **Wetter, Nacht und Nebel** (Startbild): Sonne, Regen, Schnee, Laub und Nebel ändern Grip und
  Sicht; nachts fährt der Scheinwerferkegel mit, Regen und Schnee liegen als Partikel über der Stadt.
- **Fahrgaststimmung**: sauberes Anfahren, pünktliche Halte und die Rampe heben sie, Rempler,
  verpasste Halte und Zusammenstöße senken sie; der Balken oben rechts zeigt sie.
- **Rampe**: an nicht barrierefreien Haltestellen fragt das Spiel beim Öffnen nach der Rampe
  (+10, mehr Zustimmung); ohne Rampe bleiben Fahrgäste draußen.
- **Ansagen** (Startbild oder TON-Knopf): sprechen den nächsten Halt über die Browser-Stimme.
- **Entscheidungen**: Bei Vorfällen wie einem ohnmächtigen Fahrgast hält das Spiel an und bietet
  zwei Wege an (z. B. Notruf +60 oder weiterfahren) – mit Folgen für Punkte und Stimmung.
- **Karriere**: Punkte, Fahrten und Bestwerte je Linie werden in `localStorage` gespeichert, Level
  steigen alle 2500 Punkte, ab 3000 ist der Tatra frei.
- **Minimap, Foto und Kamera**: oben links läuft die Linie als Miniaturkarte mit Positionspunkt;
  **FOTO** speichert einen 4-fach vergrößerten PNG-Schnappschuss, **KAM** schaltet zwischen Verfolg,
  Führerstand, Mitfahrer und **VOGEL** um (Vogel = dicht über dem Führerhaus, 14 m Bildhöhe).
- **Zwischenfälle** unterwegs: Kind auf dem Gleis (rechtzeitig bremsen, +70), Falschparker
  (anhalten und warten, +50), Türstörung, Ampelstörung, Fahrgastgeschichten. Dazu kurze Ansagen und
  Funksprüche im Meldungsband unter der Kopfzeile.
- **Kollegen anderer Linien** fahren voraus und entgegen; zu dicht auffahren kostet 60 Punkte.
- Halte, die man vorbeifährt, werden gemeldet; am letzten Halt kommt die Auswertung.

## Fahrende Straßenbahn

Auf der Netzkarte fährt die **Linie 1** (Prohlis – Betriebshof Waltherstraße, 12,5 km, 28 Halte) auf
dem echten Gleisverlauf: `assets/world/line1.json` (`chain`, `cum` in Metern, `stops` mit OSM-Namen).
Der Viewer (`js/world.js`) animiert sie mit 14 m/s; ab etwa 0,5 px/m wird sie maßstäblich als
dreiteiliger Zug gezeichnet, darunter als gelbe Marke mit Liniennummer. Der Knopf **Zug** schaltet
sie ein/aus und zentriert die Ansicht auf den Wagen, unten rechts steht der nächste Halt.

## Weltkarte

`assets/world/map.png` ist die große Karte: 2.800 × 2.500 m Dresden (Altstadt + Neustadt, beide
Elbufer, Hauptbahnhof bis Albertplatz) als **ein** Bild, 1 m = 3,2 px, also 8.960 × 8.000 px.
Gebaut aus 25 OSM-Patches à 600 m, die vor dem Rendern zu einem Datensatz verschmolzen werden –
deshalb keine Kachelkanten an den Patchgrenzen.

```bash
python3 tools/geo/worldmap.py            # Patches holen (Cache) + rendern
python3 tools/geo/worldmap.py --render   # nur neu rendern
```

## Altstadt-Demo (spielbar)

`demo.html` ist die spielbare Demo auf der echten Karte: Theaterplatz → Postplatz → Altmarkt →
Pirnaischer Platz, 1,32 km auf den OSM-Gleisen. Gedacht fürs Handy im Querformat: die Bahn liegt
gedreht in Fahrtrichtung von oben bis unten im Bild, links und rechts läuft die Karte mit.

```bash
python3 -m http.server 3002
# danach http://localhost:3002/demo.html öffnen
```

Karte und Fahrweg werden erzeugt mit `python3 tools/geo/demo_level.py` (schreibt
`assets/demo/map.png` und `assets/demo/level.json`, inklusive Gleispolylinien für die Nahansicht).

Steuerung: `W`/`↑` Gas, `S`/`↓` Bremse, `D` Türen, `Leertaste` Notbremse, `V` Ansicht wechseln,
`P` Pause, `R` neu starten, Mausrad/`+`/`−` Zoom.

## Steuerung

| Taste | Funktion |
| --- | --- |
| `W` / `↑` | Fahrschalter nach oben (Gas) |
| `S` / `↓` | Fahrschalter nach unten (Bremse) |
| Maus | Fahrschalter-Hebel ziehen – bleibt in der Stellung; Klick auf die Mittellinie = Neutral |
| `D` | Türen öffnen/schließen |
| `R` | Rollstuhlrampe an der ersten Tür aus-/einfahren |
| `Q` / `E` | Weiche links/rechts stellen |
| `K` | Klingel |
| `G` | Kolleginnen/Kollegen grüßen (+XP) |
| `T` | Türen für Nachläufer noch einmal öffnen |
| `Leertaste` | Notbremse |
| `P` | Pause |
| `M` | Ton an/aus |
| Mausrad / `+` `−` | Zoom (auch per Buttons im Panel „Ansicht“) |
| `0` | Standardansicht |
| — | Tempo 1× / 2× / 3× im Panel „Ansicht“ (Standard: 3×) |

## Funktionen

- **Schnelles Spieltempo**: standardmäßig 3× Zeitraffer, per Klick auf 1×/2× drosselbar; Türen, Fahrgastwechsel und Signale sind zusätzlich gestrafft.
- **Luftbild-Optik**: Dächer mit Schlagschatten, Wiesen und Bäume, Asphalt mit Gehwegen, parkende Autos, Elbe – gerendert in halber Auflösung und ohne Weichzeichnung hochskaliert, also bewusst grob gepixelt.
- **Fahrschalter-Hebel** mit Neutralstellung: oben Gas, unten Bremse, stufenlos; Türen und Rampe sind verriegelt.
- **12 echte DVB-Linien** (1, 2, 3, 4, 6–13) mit Endstellen und Haltestellenfolgen (Stand 2026), beide Richtungen – der komplette Streckenverlauf der gewählten Linie liegt beim Start schon berechnet vor und ist von Anfang an auf der Karte eingezeichnet.
- **Straßenbahn-Signale (Fs)** wie in Dresden: weißer Balken im schwarzen Gehäuse – Hp0 waagerecht, Hp1 senkrecht, Hp2 schräg (die Schräge zeigt den Weichenast); dazu Signalhalt, Hp0-Überfahren kostet Punkte.
- **Weichen** selbst stellen – falsche Stellung bleibt rot und führt in die Umleitung; die Karte zeigt den gebogenen Weichenverlauf.
- **Fahrgastwechsel** mit Ein-/Aussteigen, Nachläufer-Event und kleinen Sprechblasen.
- **Rollstuhl-Event**: An nicht barrierefreien Haltestellen muss die Rampe an der ersten Tür ausgeklappt werden – beim Ein- und Aussteigen, sonst gehen die Türen nicht zu.
- **Andere Bahnen**: entgegenkommende und kreuzende Kurse auf dem Gegengleis, grüßbar per Klingel (+XP).
- **Ereignisse**: Unfall mit Streckensperrung und Umleitung, Hindernis auf dem Gleis, Leitstellenfunk.
- **Bewertung** am Endterminus: Pünktlichkeit, bediente Halte, Signalvergehen, Vorfälle, Zufriedenheit.

## Aufbau

```
index.html        HUD, Menü, Auswertung
css/style.css     Pixel-HUD, Layout
js/data.js        Netz-Daten (Knoten, Kanten, Linien, Landmarken, Sprüche)
js/net.js         Graph, Dijkstra, Geometrie
js/render.js      Canvas-Rendering (Karte, Fahrzeuge, Signale, Weichen)
js/game.js        Spielzustand, Fahrphysik, Türen, Events, HUD, Eingabe
js/audio.js       WebAudio (Gong, Klingel, Signal)
```

Die Karte ist eine spielbare, schematische Zeichnung des Dresdner Netzes – keine maßstabsgetreue Vermessung. Linienverläufe orientieren sich an den DVB-Linienübersichten (Stand Januar 2026); Zwischenhalte sind auf die wichtigen beschränkt.

Kein offizielles Angebot der DVB AG. Nur zu Unterhaltungszwecken.
