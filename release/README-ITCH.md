# itch.io – Straßenbahn Dresden (HTML5)

## Paket
`release/linie-1-itch.zip` (2,4 MB, 8,1 MB entpackt) – Wurzelverzeichnis enthält `index.html`,
`css/`, `js/`, `assets/`. Kein Server, keine externen Requests, läuft offline im Browser.

Enthält `assets/world/lines.json` und `assets/game/map_<linie>.json` für alle zwölf Linien.
Neu bauen: `python3 tools/itch_build.py` – hochladen: `bash tools/itch_publish.sh`
(Key aus `BUTLER_API_KEY` oder `Itch_Api_Key`, Ziel `timludovic/tramsim:html5`).

## Hochladen
**Weg A (ohne API-Key):** itch.io → *Create new project* → **Kind of project: HTML** →
*Uploads* → Zip reinziehen → „This file will be played in the browser" ✓ →
Embed: **1280 × 720** oder *fullscreen*.

**Weg B (butler):** `bash tools/itch_publish.sh` (baut und pusht in den Kanal `html5`).

## Store-Seite

**Titel:** Straßenbahn Dresden – Der Simulator

**Kurzbeschreibung:** Zwölf Dresdner Straßenbahnlinien auf echtem Gleisnetz: Fahrschalter,
Fahrgäste, Signale, Engstellen mit Gegenverkehr, Weichen von Hand – Pixelart im Querformat.

**Beschreibung:**
> Alle Linien 1–4 und 6–13, jede auf ihrem echten Gleisverlauf: 12 bis 33 km, 26 bis 66 Halte.
>
> Die Kamera sitzt am Wagen und dreht mit der Fahrtrichtung – der Zug bleibt immer senkrecht in
> der Bildmitte und füllt die Höhe, in der Kurve dreht sich die Stadt um ihn.
>
> Rechts fahren: der eigene Wagen läuft auf dem rechten Gleis, Gegenbahnen kommen links entgegen.
> An eingleisigen Engstellen heißt es warten, bis der Gegenwagen durch ist.
>
> An jeder Haltestelle warten Fahrgäste am Bahnsteig. Türen öffnen, aus- und einsteigen lassen,
> weiterfahren. Unterwegs warten Signale, falsch gestellte Weichen, Falschparker, Kinder auf dem
> Gleis und kurze Ansagen aus der Leitstelle.
>
> Vier Fahrzeugtypen (NGT6DD 28 m, NGT D8DD 33 m, NGT DXDD 38 m, NGT D12DD 45 m) mit eigener
> Physik. Strecke und Stadt aus OpenStreetMap-Daten, Pixelart auf 192×108.

**Controls (itch-Feld):** Fahrschalter links antippen/ziehen (hoch = Strom, runter = Bremse) ·
TÜREN-Knopf rechts · WEICHE ◀ ▶ unten · W/↑ und S/↓ auf der Tastatur · Z/X Weiche links/rechts ·
1–4 Wagentyp · Linienknopf oben links · R neu · +/− Zoom · P Pause

**Tags:** `pixel-art`, `tram`, `driving`, `simulation`, `2d`, `germany`, `dresden`

## Hinweis
Kein offizielles Angebot der DVB AG. Gleisverlauf und Haltestellen aus OpenStreetMap (ODbL).
