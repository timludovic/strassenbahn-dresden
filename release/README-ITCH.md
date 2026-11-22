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

**Kurzbeschreibung:** Zwölf Dresdner Straßenbahnlinien auf echtem Gleisnetz: Fahrplan, Sifa,
Weichen, Rangieren, Wetter, Fahrgäste – Pixelart im Querformat mit Karriere.

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
> Fahrplan mit Pünktlichkeitsanzeige, Sifa alle 40 Sekunden, Fahrstufen, Sanden bei Nässe,
> Langsamfahrstellen und Baustellen mit „Halt entfällt", Querverkehr, Vorrangschaltung an Signalen
> und echte Rangierarbeit, wenn die Weiche falsch stand: ins Stumpfgleis, zurücksetzen, weiter.
>
> Wetter und Tageszeit (Sonne, Regen, Schnee, Laub, Nebel, Nacht mit Scheinwerfer), Fahrgaststimmung,
> Rollstuhlrampe, Ansagen und Entscheidungen bei Vorfällen. Doppeltraktion auf Wunsch.
>
> Fünf Fahrzeugtypen (NGT6DD 28 m, NGT D8DD 33 m, NGT DXDD 38 m, NGT D12DD 45 m und der
> freischaltbare Tatra T4D) mit eigener Physik. Karriere mit Punkten, Leveln und Bestwerten je Linie,
> Minimap, Foto-Modus und drei Kameras. Strecke und Stadt aus OpenStreetMap-Daten, Pixelart auf
> 192×108.

**Controls (itch-Feld):** Fahrschalter links antippen/ziehen (hoch = Strom, runter = Bremse) ·
TÜREN-Knopf rechts · WEICHE ◀ ▶ und SIFA/SAND unten · KAM/FOTO/TON rechts · W/↑ und S/↓ auf der
Tastatur · Z/X Weiche links/rechts · F Sifa · G Sanden · C Kamera · V Foto · M Ansagen · B rangieren ·
1–5 Wagentyp · Linienknopf oben links (auch Wetter, Nacht, Doppeltraktion, Kamera, Ansagen) ·
R neu · +/− Zoom · P Pause

**Tags:** `pixel-art`, `tram`, `driving`, `simulation`, `2d`, `germany`, `dresden`

## Hinweis
Kein offizielles Angebot der DVB AG. Gleisverlauf und Haltestellen aus OpenStreetMap (ODbL).
