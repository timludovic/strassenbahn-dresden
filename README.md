# Straßenbahn Dresden – Der Simulator

Ein detailverliebter 2D-Pixelart-Straßenbahn-Simulator für das Dresdner Netz – komplett im Browser, ohne Build-Werkzeuge, ohne Server.

Du übernimmst einen Kurs der Linie 1 (und elf weiterer DVB-Linien), bedienst Türen und Rollstuhlrampe, stellst Weichen selbst, achtest auf die Straßenbahn-Signale (Fs) – und grüßt unterwegs die Kolleginnen und Kollegen.

## Spielen

Einfach `index.html` über einen beliebigen Webserver ausliefern (ES-Module brauchen HTTP):

```bash
python3 -m http.server 3002
# danach http://localhost:3002 öffnen
```

Fertiges itch.io-Paket: `release/strassenbahn-dresden.zip` (HTML-Spiel, Einstiegspunkt `index.html` im Zip-Wurzelverzeichnis). Store-Text und Upload-Notizen stehen in `release/README-ITCH.md`.

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
