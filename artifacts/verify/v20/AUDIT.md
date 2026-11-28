# Kartenaudit: echte Daten gegen Spiel

Erzeugt von `tools/geo/audit_map.py` aus `assets/world/lines.json` (OSM-Gleise, Haltestellen, Eingleisig-Abschnitte) und den Strassenachsen der Kartenebenen `assets/game/map_<linie>.json`. Die Kreuzungen werden mit demselben Algorithmus bestimmt wie im Spiel (`buildCrossings`), die Haltestellenlage dagegen unabhaengig davon aus den Abstaenden zur naechsten befahrbaren Strasse links und rechts der Gleisachse.

| Kennzahl | Summe ueber alle Linien |
|---|---|
| Haltestellen | 488 |
| Bahn/Kfz-Kreuzungen | 1583 |
| davon grosse Kreuzungen (Ampel) | 400 |
| Ampeln insgesamt (Halt + Kreuzung) | 888 |
| eingleisige Abschnitte (umgesetzt) | 24 |
| eingleisig laut OSM, im Spiel nicht gefuehrt | 3 |

## Uebersicht je Linie

| Linie | Laenge | Halte | Kreuzungen | grosse Kreuzungen | Ampeln | eingleisig | nicht gefuehrt |
|---|---|---|---|---|---|---|---|
| 1 | 17634 m | 38 | 122 | 29 | 67 | 2 | 0 |
| 2 | 21181 m | 46 | 139 | 37 | 83 | 0 | 0 |
| 3 | 14942 m | 32 | 103 | 28 | 60 | 0 | 1 |
| 4 | 33190 m | 66 | 217 | 43 | 109 | 9 | 0 |
| 6 | 21871 m | 48 | 182 | 48 | 96 | 0 | 0 |
| 7 | 24549 m | 47 | 144 | 35 | 82 | 8 | 0 |
| 8 | 17950 m | 34 | 85 | 22 | 56 | 3 | 0 |
| 9 | 16487 m | 37 | 115 | 30 | 67 | 0 | 1 |
| 10 | 11697 m | 26 | 73 | 28 | 54 | 0 | 0 |
| 11 | 17687 m | 34 | 140 | 35 | 69 | 0 | 1 |
| 12 | 15480 m | 36 | 129 | 36 | 72 | 0 | 0 |
| 13 | 21894 m | 44 | 134 | 29 | 73 | 2 | 0 |


## Linie 1

### Haltestellenlage (38)

| # | Haltestelle | s | Lage laut Karte | Abstand links | Abstand rechts |
|---|---|---|---|---|---|
| 1 | Prohlis, Gleisschleife | 0 | neben der Fahrbahn (eigener Bahnkoerper) | 17.1 m | - m |
| 2 | Georg-Palitzsch-Straße | 380 | neben der Fahrbahn (eigener Bahnkoerper) | 17.2 m | 21.0 m |
| 3 | Jacob-Winter-Platz (Prohlis-Zentrum) | 776 | neben der Fahrbahn (eigener Bahnkoerper) | 15.2 m | - m |
| 4 | Albert-Wolf-Platz | 1160 | neben der Fahrbahn (eigener Bahnkoerper) | 13.3 m | - m |
| 5 | S-Bahnhof Dobritz | 1778 | am Fahrbahnrand | 3.1 m | 12.2 m |
| 6 | Breitscheidstraße | 2117 | neben der Fahrbahn (eigener Bahnkoerper) | 13.3 m | 13.1 m |
| 7 | Abzweig nach Reick | 2450 | neben der Fahrbahn (eigener Bahnkoerper) | 22.5 m | 13.6 m |
| 8 | Lassallestraße | 3125 | am Fahrbahnrand | - m | 0.6 m |
| 9 | Prof.-Ricker-Straße | 3447 | zwischen den Spuren (Mittelinsel) | 7.3 m | 8.0 m |
| 10 | Marienberger Straße | 3792 | am Fahrbahnrand | 6.8 m | 10.0 m |
| 11 | Rennplatzstraße | 4190 | am Fahrbahnrand | 8.1 m | 9.1 m |
| 12 | Rauensteinstraße | 4657 | am Fahrbahnrand | 8.9 m | 10.2 m |
| 13 | Liebstädter Straße | 5076 | neben der Fahrbahn (eigener Bahnkoerper) | 11.7 m | 11.8 m |
| 14 | Zwinglistraße | 5808 | am Fahrbahnrand | 8.3 m | 13.8 m |
| 15 | Karcherallee | 6401 | neben der Fahrbahn (eigener Bahnkoerper) | 15.5 m | 19.6 m |
| 16 | Lipsiusstraße | 6900 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 17 | Comeniusplatz | 7243 | neben der Fahrbahn (eigener Bahnkoerper) | 10.0 m | - m |
| 18 | Straßburger Platz (Gläserne Manufaktur) | 8269 | neben der Fahrbahn (eigener Bahnkoerper) | 14.4 m | 20.3 m |
| 19 | Deutsches Hygiene-Museum | 8725 | neben der Fahrbahn (eigener Bahnkoerper) | 14.9 m | - m |
| 20 | Pirnaischer Platz (Stadtmuseum) | 9258 | neben der Fahrbahn (eigener Bahnkoerper) | 10.1 m | 17.3 m |
| 21 | Altmarkt | 9585 | neben der Fahrbahn (eigener Bahnkoerper) | 15.9 m | 13.5 m |
| 22 | Postplatz | 9855 | neben der Fahrbahn (eigener Bahnkoerper) | 14.6 m | 12.9 m |
| 23 | Schweriner Straße (Hochschule für Musik) | 10562 | am Fahrbahnrand | 8.6 m | - m |
| 24 | Bahnhof Mitte / Könneritzstraße | 10994 | am Fahrbahnrand | 10.7 m | 7.7 m |
| 25 | Weißeritzstraße | 11452 | am Fahrbahnrand | 16.8 m | 8.6 m |
| 26 | Krankenhaus Friedrichstadt (Sportpark Ostra) | 11854 | am Fahrbahnrand | 4.8 m | - m |
| 27 | Bahnhof Mitte / Seminarstraße | 12553 | am Fahrbahnrand | 7.9 m | 16.0 m |
| 28 | Koreanischer Platz | 12869 | am Fahrbahnrand | 10.8 m | 8.1 m |
| 29 | Cottaer Straße | 13488 | am Fahrbahnrand | 10.0 m | 6.5 m |
| 30 | Semmelweisstraße | 14123 | neben der Fahrbahn (eigener Bahnkoerper) | 13.3 m | - m |
| 31 | Burgkstraße | 14861 | am Fahrbahnrand | 1.6 m | - m |
| 32 | Pennricher Straße | 15108 | am Fahrbahnrand | 7.7 m | 20.4 m |
| 33 | Birkenhainer Straße | 15529 | am Fahrbahnrand | - m | 5.0 m |
| 34 | Altcotta | 16023 | am Fahrbahnrand | - m | 0.7 m |
| 35 | Ockerwitzer Straße | 16438 | am Fahrbahnrand | - m | 4.7 m |
| 36 | Cossebauder Straße | 16822 | am Fahrbahnrand | - m | 1.5 m |
| 37 | Cotta, Gottfried-Keller-Straße | 17053 | am Fahrbahnrand | - m | 5.2 m |
| 38 | Leutewitz | 17613 | zwischen den Spuren (Mittelinsel) | 7.7 m | 1.9 m |

### Eingleisig / zweigleisig

| von | bis | Laenge |
|---|---|---|
| 6456 | 7305 | 849 m |
| 7394 | 7876 | 482 m |

Zweigleisig: 3 Abschnitte, davon 16183 m Strecke gesamt.

### Bahn/Kfz- und Bahn/Fussgaenger-Kreuzungen (122)

| # | s | Ampel | Fuer wen |
|---|---|---|---|
| 1 | 396 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 2 | 744 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 3 | 856 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 4 | 1280 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 5 | 1651 | ja | Bahn + Kfz/Fussgaenger |
| 6 | 1686 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 7 | 1749 | ja | Bahn + Kfz/Fussgaenger |
| 8 | 1892 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 9 | 1966 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 10 | 2084 | ja | Bahn + Kfz/Fussgaenger |
| 11 | 2542 | ja | Bahn + Kfz/Fussgaenger |
| 12 | 2698 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 13 | 2775 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 14 | 2907 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 15 | 2944 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 16 | 2998 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 17 | 3029 | ja | Bahn + Kfz/Fussgaenger |
| 18 | 3091 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 19 | 3212 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 20 | 3243 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 21 | 3331 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 22 | 3399 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 23 | 3431 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 24 | 3495 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 25 | 3634 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 26 | 3876 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 27 | 3984 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 28 | 4044 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 29 | 4088 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 30 | 4280 | ja | Bahn + Kfz/Fussgaenger |
| 31 | 4715 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 32 | 4777 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 33 | 4883 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 34 | 4933 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 35 | 5060 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 36 | 5169 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 37 | 5209 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 38 | 5281 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 39 | 5391 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 40 | 5447 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 41 | 5488 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 42 | 5536 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 43 | 5598 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 44 | 5676 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 45 | 5718 | ja | Bahn + Kfz/Fussgaenger |
| 46 | 5765 | ja | Bahn + Kfz/Fussgaenger |
| 47 | 5894 | ja | Bahn + Kfz/Fussgaenger |
| 48 | 6367 | ja | Bahn + Kfz/Fussgaenger |
| 49 | 7701 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 50 | 7832 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 51 | 8292 | ja | Bahn + Kfz/Fussgaenger |
| 52 | 8381 | ja | Bahn + Kfz/Fussgaenger |
| 53 | 9209 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 54 | 9668 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 55 | 9700 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 56 | 9966 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 57 | 10051 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 58 | 10194 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 59 | 10250 | ja | Bahn + Kfz/Fussgaenger |
| 60 | 10299 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 61 | 10396 | ja | Bahn + Kfz/Fussgaenger |
| 62 | 10458 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 63 | 10515 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 64 | 10726 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 65 | 10779 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 66 | 10810 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 67 | 10942 | ja | Bahn + Kfz/Fussgaenger |
| 68 | 11214 | ja | Bahn + Kfz/Fussgaenger |
| 69 | 11271 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 70 | 11309 | ja | Bahn + Kfz/Fussgaenger |
| 71 | 11338 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 72 | 11852 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 73 | 12268 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 74 | 12376 | ja | Bahn + Kfz/Fussgaenger |
| 75 | 12635 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 76 | 12669 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 77 | 12700 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 78 | 12844 | ja | Bahn + Kfz/Fussgaenger |
| 79 | 13242 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 80 | 13350 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 81 | 13410 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 82 | 13468 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 83 | 13561 | ja | Bahn + Kfz/Fussgaenger |
| 84 | 13592 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 85 | 13659 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 86 | 13805 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 87 | 13887 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 88 | 13936 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 89 | 13982 | ja | Bahn + Kfz/Fussgaenger |
| 90 | 14010 | ja | Bahn + Kfz/Fussgaenger |
| 91 | 14214 | ja | Bahn + Kfz/Fussgaenger |
| 92 | 14794 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 93 | 14824 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 94 | 14916 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 95 | 15050 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 96 | 15116 | ja | Bahn + Kfz/Fussgaenger |
| 97 | 15200 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 98 | 15279 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 99 | 15375 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 100 | 15464 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 101 | 15494 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 102 | 15550 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 103 | 15653 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 104 | 15711 | ja | Bahn + Kfz/Fussgaenger |
| 105 | 15915 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 106 | 16035 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 107 | 16074 | ja | Bahn + Kfz/Fussgaenger |
| 108 | 16127 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 109 | 16169 | ja | Bahn + Kfz/Fussgaenger |
| 110 | 16227 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 111 | 16286 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 112 | 16386 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 113 | 16521 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 114 | 16577 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 115 | 16685 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 116 | 16791 | ja | Bahn + Kfz/Fussgaenger |
| 117 | 16870 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 118 | 16985 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 119 | 17099 | ja | Bahn + Kfz/Fussgaenger |
| 120 | 17233 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 121 | 17481 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 122 | 17519 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |


## Linie 2

### Haltestellenlage (46)

| # | Haltestelle | s | Lage laut Karte | Abstand links | Abstand rechts |
|---|---|---|---|---|---|
| 1 | Kleinzschachwitz, Freystraße | 0 | am Fahrbahnrand | 0.1 m | 10.0 m |
| 2 | Meußlitzer Straße | 390 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 3 | Heckenweg | 1018 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 4 | Berthold-Haupt-Straße | 1654 | am Fahrbahnrand | 8.0 m | - m |
| 5 | Altleuben | 1994 | am Fahrbahnrand | 5.8 m | - m |
| 6 | Friedhof Leuben | 2305 | am Fahrbahnrand | 2.9 m | - m |
| 7 | Großglocknerstraße | 2888 | neben der Fahrbahn (eigener Bahnkoerper) | 9.3 m | - m |
| 8 | Laibacher Straße | 3485 | am Fahrbahnrand | 9.2 m | 8.2 m |
| 9 | Leubener Straße | 3901 | am Fahrbahnrand | 4.9 m | - m |
| 10 | Hermann-Seidel-Straße | 4438 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 17.0 m |
| 11 | Alttolkewitz | 4868 | am Fahrbahnrand | 16.6 m | 3.4 m |
| 12 | Wasserwerk Tolkewitz | 5693 | am Fahrbahnrand | - m | 2.5 m |
| 13 | Tolkewitz Schulcampus | 6160 | am Fahrbahnrand | - m | 2.1 m |
| 14 | Johannisfriedhof | 6439 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 15 | Striesen, Ludwig-Hartmann-Straße | 6731 | am Fahrbahnrand | - m | 2.9 m |
| 16 | Striesen, Emanuel-Goldberg-Platz | 7001 | am Fahrbahnrand | 10.7 m | 5.9 m |
| 17 | Gottleubaer Straße | 7410 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 18 | Pohlandplatz (Technische Sammlungen) | 7918 | am Fahrbahnrand | 23.4 m | 2.4 m |
| 19 | Bergmannstraße | 8390 | am Fahrbahnrand | - m | 5.4 m |
| 20 | Spenerstraße | 8772 | am Fahrbahnrand | 8.5 m | 10.8 m |
| 21 | Mosenstraße | 9103 | neben der Fahrbahn (eigener Bahnkoerper) | 23.9 m | - m |
| 22 | Fetscherplatz | 9665 | am Fahrbahnrand | 19.6 m | 7.5 m |
| 23 | Krankenhaus St. Joseph-Stift | 10177 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 24 | Straßburger Platz (Gläserne Manufaktur) | 10598 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 25 | Deutsches Hygiene-Museum | 11276 | neben der Fahrbahn (eigener Bahnkoerper) | 15.5 m | - m |
| 26 | Pirnaischer Platz (Stadtmuseum) | 11809 | neben der Fahrbahn (eigener Bahnkoerper) | 9.9 m | 17.0 m |
| 27 | Altmarkt | 12136 | neben der Fahrbahn (eigener Bahnkoerper) | 16.4 m | 13.6 m |
| 28 | Postplatz | 12406 | neben der Fahrbahn (eigener Bahnkoerper) | 15.2 m | 13.1 m |
| 29 | Schweriner Straße (Hochschule für Musik) | 13113 | neben der Fahrbahn (eigener Bahnkoerper) | 9.2 m | - m |
| 30 | Bahnhof Mitte / Könneritzstraße | 13545 | am Fahrbahnrand | 10.4 m | 7.3 m |
| 31 | Weißeritzstraße | 14003 | neben der Fahrbahn (eigener Bahnkoerper) | 17.4 m | 9.2 m |
| 32 | Krankenhaus Friedrichstadt (Sportpark Ostra) | 14405 | am Fahrbahnrand | 4.8 m | - m |
| 33 | Bahnhof Mitte / Seminarstraße | 15104 | am Fahrbahnrand | 7.4 m | 15.9 m |
| 34 | Koreanischer Platz | 15420 | am Fahrbahnrand | 10.7 m | 8.0 m |
| 35 | Cottaer Straße | 16039 | am Fahrbahnrand | 9.5 m | 6.7 m |
| 36 | Wernerstraße | 16710 | am Fahrbahnrand | 9.4 m | 3.9 m |
| 37 | Löbtau, Tharandter Straße | 17083 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 38 | Bünaustraße | 17501 | am Fahrbahnrand | 5.7 m | - m |
| 39 | Malterstraße | 17931 | zwischen den Spuren (Mittelinsel) | 3.3 m | 6.9 m |
| 40 | Koblenzer Straße | 18450 | am Fahrbahnrand | 4.1 m | 15.9 m |
| 41 | Wölfnitz | 18623 | neben der Fahrbahn (eigener Bahnkoerper) | 13.4 m | - m |
| 42 | Amalie-Dietrich-Platz | 19058 | am Fahrbahnrand | 6.0 m | 9.1 m |
| 43 | Merianplatz | 19626 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 44 | Kirschenstraße | 20167 | neben der Fahrbahn (eigener Bahnkoerper) | 18.9 m | 20.8 m |
| 45 | Schlehenstraße | 20718 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 21.7 m |
| 46 | Gorbitz, Betriebshof | 21185 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |

### Eingleisig / zweigleisig

keine eingleisigen Abschnitte.

Zweigleisig: 1 Abschnitte, davon 21061 m Strecke gesamt.

### Bahn/Kfz- und Bahn/Fussgaenger-Kreuzungen (139)

| # | s | Ampel | Fuer wen |
|---|---|---|---|
| 1 | 104 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 2 | 160 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 3 | 432 | ja | Bahn + Kfz/Fussgaenger |
| 4 | 714 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 5 | 791 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 6 | 1605 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 7 | 1676 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 8 | 1746 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 9 | 1806 | ja | Bahn + Kfz/Fussgaenger |
| 10 | 1867 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 11 | 1962 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 12 | 2054 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 13 | 2107 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 14 | 2267 | ja | Bahn + Kfz/Fussgaenger |
| 15 | 2348 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 16 | 2405 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 17 | 2781 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 18 | 2878 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 19 | 2999 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 20 | 3104 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 21 | 3225 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 22 | 3311 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 23 | 3492 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 24 | 3554 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 25 | 3598 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 26 | 3632 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 27 | 3667 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 28 | 3721 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 29 | 3841 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 30 | 3889 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 31 | 3954 | ja | Bahn + Kfz/Fussgaenger |
| 32 | 4076 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 33 | 4208 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 34 | 4342 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 35 | 4412 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 36 | 4556 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 37 | 4657 | ja | Bahn + Kfz/Fussgaenger |
| 38 | 4753 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 39 | 4806 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 40 | 4845 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 41 | 4944 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 42 | 4982 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 43 | 5374 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 44 | 5410 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 45 | 5644 | ja | Bahn + Kfz/Fussgaenger |
| 46 | 5802 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 47 | 5832 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 48 | 6034 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 49 | 6119 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 50 | 6374 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 51 | 6634 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 52 | 6673 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 53 | 6783 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 54 | 6988 | ja | Bahn + Kfz/Fussgaenger |
| 55 | 7027 | ja | Bahn + Kfz/Fussgaenger |
| 56 | 7137 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 57 | 7691 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 58 | 7756 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 59 | 7861 | ja | Bahn + Kfz/Fussgaenger |
| 60 | 8459 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 61 | 8701 | ja | Bahn + Kfz/Fussgaenger |
| 62 | 8730 | ja | Bahn + Kfz/Fussgaenger |
| 63 | 8767 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 64 | 8813 | ja | Bahn + Kfz/Fussgaenger |
| 65 | 8850 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 66 | 9297 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 67 | 9440 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 68 | 9524 | ja | Bahn + Kfz/Fussgaenger |
| 69 | 9618 | ja | Bahn + Kfz/Fussgaenger |
| 70 | 9696 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 71 | 9762 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 72 | 9822 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 73 | 9886 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 74 | 9957 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 75 | 10054 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 76 | 10432 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 77 | 10662 | ja | Bahn + Kfz/Fussgaenger |
| 78 | 10843 | ja | Bahn + Kfz/Fussgaenger |
| 79 | 10932 | ja | Bahn + Kfz/Fussgaenger |
| 80 | 11760 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 81 | 12218 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 82 | 12251 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 83 | 12516 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 84 | 12601 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 85 | 12744 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 86 | 12800 | ja | Bahn + Kfz/Fussgaenger |
| 87 | 12840 | ja | Bahn + Kfz/Fussgaenger |
| 88 | 12946 | ja | Bahn + Kfz/Fussgaenger |
| 89 | 13008 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 90 | 13065 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 91 | 13276 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 92 | 13330 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 93 | 13360 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 94 | 13493 | ja | Bahn + Kfz/Fussgaenger |
| 95 | 13765 | ja | Bahn + Kfz/Fussgaenger |
| 96 | 13822 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 97 | 13860 | ja | Bahn + Kfz/Fussgaenger |
| 98 | 13888 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 99 | 14403 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 100 | 14819 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 101 | 14927 | ja | Bahn + Kfz/Fussgaenger |
| 102 | 15186 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 103 | 15219 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 104 | 15251 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 105 | 15394 | ja | Bahn + Kfz/Fussgaenger |
| 106 | 15792 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 107 | 15900 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 108 | 15960 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 109 | 16018 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 110 | 16116 | ja | Bahn + Kfz/Fussgaenger |
| 111 | 16537 | ja | Bahn + Kfz/Fussgaenger |
| 112 | 16585 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 113 | 16622 | ja | Bahn + Kfz/Fussgaenger |
| 114 | 16659 | ja | Bahn + Kfz/Fussgaenger |
| 115 | 16787 | ja | Bahn + Kfz/Fussgaenger |
| 116 | 16873 | ja | Bahn + Kfz/Fussgaenger |
| 117 | 16902 | ja | Bahn + Kfz/Fussgaenger |
| 118 | 16947 | ja | Bahn + Kfz/Fussgaenger |
| 119 | 17181 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 120 | 17281 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 121 | 17361 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 122 | 17545 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 123 | 17660 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 124 | 17690 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 125 | 17748 | ja | Bahn + Kfz/Fussgaenger |
| 126 | 17803 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 127 | 17840 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 128 | 17934 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 129 | 18147 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 130 | 18410 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 131 | 18441 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 132 | 18481 | ja | Bahn + Kfz/Fussgaenger |
| 133 | 18756 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 134 | 18805 | ja | Bahn + Kfz/Fussgaenger |
| 135 | 18948 | ja | Bahn + Kfz/Fussgaenger |
| 136 | 19047 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 137 | 19113 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 138 | 19874 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 139 | 20999 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |


## Linie 3

### Haltestellenlage (32)

| # | Haltestelle | s | Lage laut Karte | Abstand links | Abstand rechts |
|---|---|---|---|---|---|
| 1 | Coschütz | 0 | am Fahrbahnrand | 6.4 m | 16.3 m |
| 2 | Achtbeeteweg | 101 | am Fahrbahnrand | 2.3 m | 11.2 m |
| 3 | Saarstraße | 592 | am Fahrbahnrand | 4.0 m | 15.2 m |
| 4 | Kotteweg | 1012 | neben der Fahrbahn (eigener Bahnkoerper) | 10.4 m | 23.6 m |
| 5 | Cämmerswalder Straße | 1556 | neben der Fahrbahn (eigener Bahnkoerper) | 13.2 m | - m |
| 6 | Plauen, Nöthnitzer Straße | 2663 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 10.9 m |
| 7 | Münchner Platz (Gedenkstätte) | 3235 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 17.2 m |
| 8 | Nürnberger Platz | 3581 | am Fahrbahnrand | 23.0 m | 7.0 m |
| 9 | Reichenbachstraße (Studentenwerk) | 4199 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 10.2 m |
| 10 | Hauptbahnhof | 4670 | neben der Fahrbahn (eigener Bahnkoerper) | 16.5 m | 17.8 m |
| 11 | Hauptbahnhof Nord | 5023 | am Fahrbahnrand | 3.7 m | 16.0 m |
| 12 | Walpurgisstraße | 5381 | neben der Fahrbahn (eigener Bahnkoerper) | 13.4 m | 16.3 m |
| 13 | Prager Straße | 6012 | zwischen den Spuren (Mittelinsel) | 7.4 m | 6.4 m |
| 14 | Postplatz | 6460 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 15 | Postplatz (Zwinger) | 7013 | zwischen den Spuren (Mittelinsel) | 1.9 m | 5.6 m |
| 16 | Theaterplatz | 7239 | am Fahrbahnrand | 3.8 m | 15.8 m |
| 17 | Neustädter Markt (Goldener Reiter) | 7890 | am Fahrbahnrand | 6.9 m | - m |
| 18 | Carolaplatz (Regierungsviertel) | 8523 | neben der Fahrbahn (eigener Bahnkoerper) | 20.0 m | 13.6 m |
| 19 | Albertplatz (Erich-Kästner-Museum) | 9085 | am Fahrbahnrand | - m | 3.5 m |
| 20 | Bautzner Straße / Rothenburger Straße | 9582 | am Fahrbahnrand | 7.2 m | - m |
| 21 | Rosa-Luxemburg-Platz | 9930 | am Fahrbahnrand | 15.6 m | 7.1 m |
| 22 | Albertplatz (Antonstraße) | 10785 | am Fahrbahnrand | - m | 4.3 m |
| 23 | Bahnhof Neustadt | 11025 | am Fahrbahnrand | 7.1 m | 12.3 m |
| 24 | Bahnhof Neustadt (Hansastraße) | 11326 | neben der Fahrbahn (eigener Bahnkoerper) | 15.2 m | 10.8 m |
| 25 | Lößnitzstraße | 11698 | neben der Fahrbahn (eigener Bahnkoerper) | 10.4 m | 12.8 m |
| 26 | Großenhainer Platz | 12174 | am Fahrbahnrand | 5.4 m | 22.0 m |
| 27 | Liststraße | 12556 | zwischen den Spuren (Mittelinsel) | 5.7 m | 6.9 m |
| 28 | Zeithainer Straße | 13255 | neben der Fahrbahn (eigener Bahnkoerper) | 19.1 m | 9.3 m |
| 29 | Trachenberger Platz | 13510 | am Fahrbahnrand | - m | 3.1 m |
| 30 | Hubertusplatz | 14094 | am Fahrbahnrand | - m | 5.1 m |
| 31 | Dorothea-Erxleben-Straße | 14595 | am Fahrbahnrand | - m | 3.0 m |
| 32 | Wilder Mann | 14942 | zwischen den Spuren (Mittelinsel) | 2.0 m | 3.5 m |

### Eingleisig / zweigleisig

keine eingleisigen Abschnitte.

Laut OSM eingleisig, im Spiel nicht als Engstelle gefuehrt (kuerzer als 120 m oder im Endbereich):

| von | bis | Laenge |
|---|---|---|
| 71.0 | 135.4 | 64.4 m |

Zweigleisig: 1 Abschnitte, davon 14821 m Strecke gesamt.

### Bahn/Kfz- und Bahn/Fussgaenger-Kreuzungen (103)

| # | s | Ampel | Fuer wen |
|---|---|---|---|
| 1 | 79 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 2 | 111 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 3 | 141 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 4 | 544 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 5 | 577 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 6 | 626 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 7 | 682 | ja | Bahn + Kfz/Fussgaenger |
| 8 | 763 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 9 | 2009 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 10 | 2162 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 11 | 2498 | ja | Bahn + Kfz/Fussgaenger |
| 12 | 2628 | ja | Bahn + Kfz/Fussgaenger |
| 13 | 2899 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 14 | 3014 | ja | Bahn + Kfz/Fussgaenger |
| 15 | 3116 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 16 | 3641 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 17 | 3886 | ja | Bahn + Kfz/Fussgaenger |
| 18 | 4800 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 19 | 4880 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 20 | 4995 | ja | Bahn + Kfz/Fussgaenger |
| 21 | 5026 | ja | Bahn + Kfz/Fussgaenger |
| 22 | 5116 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 23 | 5193 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 24 | 5464 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 25 | 5766 | ja | Bahn + Kfz/Fussgaenger |
| 26 | 5836 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 27 | 5937 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 28 | 6023 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 29 | 6234 | ja | Bahn + Kfz/Fussgaenger |
| 30 | 6384 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 31 | 6418 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 32 | 6665 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 33 | 6924 | ja | Bahn + Kfz/Fussgaenger |
| 34 | 6954 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 35 | 6992 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 36 | 7021 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 37 | 7088 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 38 | 7165 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 39 | 7224 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 40 | 7294 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 41 | 7324 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 42 | 7374 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 43 | 7456 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 44 | 7498 | ja | Bahn + Kfz/Fussgaenger |
| 45 | 7945 | ja | Bahn + Kfz/Fussgaenger |
| 46 | 8333 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 47 | 8393 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 48 | 8935 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 49 | 9007 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 50 | 9040 | ja | Bahn + Kfz/Fussgaenger |
| 51 | 9182 | ja | Bahn + Kfz/Fussgaenger |
| 52 | 9212 | ja | Bahn + Kfz/Fussgaenger |
| 53 | 9337 | ja | Bahn + Kfz/Fussgaenger |
| 54 | 9527 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 55 | 9815 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 56 | 9915 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 57 | 10313 | ja | Bahn + Kfz/Fussgaenger |
| 58 | 10651 | ja | Bahn + Kfz/Fussgaenger |
| 59 | 10747 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 60 | 10826 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 61 | 10915 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 62 | 10949 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 63 | 11057 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 64 | 11117 | ja | Bahn + Kfz/Fussgaenger |
| 65 | 11256 | ja | Bahn + Kfz/Fussgaenger |
| 66 | 11593 | ja | Bahn + Kfz/Fussgaenger |
| 67 | 11896 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 68 | 12016 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 69 | 12080 | ja | Bahn + Kfz/Fussgaenger |
| 70 | 12125 | ja | Bahn + Kfz/Fussgaenger |
| 71 | 12159 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 72 | 12196 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 73 | 12243 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 74 | 12337 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 75 | 12411 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 76 | 12469 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 77 | 12677 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 78 | 12892 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 79 | 12924 | ja | Bahn + Kfz/Fussgaenger |
| 80 | 13131 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 81 | 13213 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 82 | 13285 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 83 | 13404 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 84 | 13447 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 85 | 13518 | ja | Bahn + Kfz/Fussgaenger |
| 86 | 13548 | ja | Bahn + Kfz/Fussgaenger |
| 87 | 13669 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 88 | 13726 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 89 | 13770 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 90 | 13996 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 91 | 14060 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 92 | 14143 | ja | Bahn + Kfz/Fussgaenger |
| 93 | 14211 | ja | Bahn + Kfz/Fussgaenger |
| 94 | 14271 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 95 | 14311 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 96 | 14391 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 97 | 14503 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 98 | 14549 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 99 | 14624 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 100 | 14664 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 101 | 14745 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 102 | 14776 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 103 | 14812 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |


## Linie 4

### Haltestellenlage (66)

| # | Haltestelle | s | Lage laut Karte | Abstand links | Abstand rechts |
|---|---|---|---|---|---|
| 1 | Prohlis, Gleisschleife | 0 | neben der Fahrbahn (eigener Bahnkoerper) | 17.1 m | - m |
| 2 | Georg-Palitzsch-Straße | 380 | neben der Fahrbahn (eigener Bahnkoerper) | 17.2 m | 21.1 m |
| 3 | Jacob-Winter-Platz (Prohlis-Zentrum) | 776 | neben der Fahrbahn (eigener Bahnkoerper) | 15.0 m | - m |
| 4 | Albert-Wolf-Platz | 1160 | neben der Fahrbahn (eigener Bahnkoerper) | 13.1 m | - m |
| 5 | S-Bahnhof Dobritz | 1776 | am Fahrbahnrand | 10.9 m | 2.9 m |
| 6 | Breitscheidstraße | 2116 | neben der Fahrbahn (eigener Bahnkoerper) | 10.7 m | 15.0 m |
| 7 | Abzweig nach Reick | 2449 | neben der Fahrbahn (eigener Bahnkoerper) | 20.5 m | 16.5 m |
| 8 | Lassallestraße | 3122 | zwischen den Spuren (Mittelinsel) | 3.6 m | 7.1 m |
| 9 | Prof.-Ricker-Straße | 3446 | am Fahrbahnrand | 10.2 m | 5.0 m |
| 10 | Marienberger Straße | 3791 | am Fahrbahnrand | 9.9 m | 8.9 m |
| 11 | Rennplatzstraße | 4190 | am Fahrbahnrand | 9.3 m | 6.7 m |
| 12 | Rauensteinstraße | 4657 | am Fahrbahnrand | 12.3 m | 6.6 m |
| 13 | Liebstädter Straße | 5076 | neben der Fahrbahn (eigener Bahnkoerper) | 14.9 m | 9.4 m |
| 14 | Zwinglistraße | 5802 | neben der Fahrbahn (eigener Bahnkoerper) | 10.9 m | 13.4 m |
| 15 | Karcherallee | 6401 | neben der Fahrbahn (eigener Bahnkoerper) | 19.1 m | 15.3 m |
| 16 | Lipsiusstraße | 6900 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 11.5 m |
| 17 | Comeniusplatz | 7242 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 14.2 m |
| 18 | Straßburger Platz (Gläserne Manufaktur) | 8268 | neben der Fahrbahn (eigener Bahnkoerper) | 13.7 m | 20.4 m |
| 19 | Georg-Arnhold-Bad (Deutsches Hygiene-Museum) | 8687 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 20 | Lennéplatz | 9367 | am Fahrbahnrand | 10.9 m | 8.1 m |
| 21 | Gret-Palucca-Straße | 9874 | zwischen den Spuren (Mittelinsel) | 4.1 m | 7.8 m |
| 22 | Hauptbahnhof | 10407 | zwischen den Spuren (Mittelinsel) | 3.8 m | 5.4 m |
| 23 | Hauptbahnhof Nord | 10544 | am Fahrbahnrand | 6.3 m | 15.0 m |
| 24 | Walpurgisstraße | 10902 | neben der Fahrbahn (eigener Bahnkoerper) | 15.4 m | 16.3 m |
| 25 | Prager Straße | 11533 | zwischen den Spuren (Mittelinsel) | 7.4 m | 3.7 m |
| 26 | Postplatz | 11980 | neben der Fahrbahn (eigener Bahnkoerper) | 22.7 m | - m |
| 27 | Schweriner Straße (Hochschule für Musik) | 13030 | am Fahrbahnrand | 4.0 m | - m |
| 28 | Bahnhof Mitte / Könneritzstraße | 13462 | neben der Fahrbahn (eigener Bahnkoerper) | 13.2 m | 11.5 m |
| 29 | Kongresszentrum (Haus der Presse) | 13867 | am Fahrbahnrand | 8.6 m | 11.4 m |
| 30 | Antonstraße / Leipziger Straße | 14634 | am Fahrbahnrand | 11.3 m | 7.1 m |
| 31 | Alter Schlachthof | 15412 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 13.9 m |
| 32 | Alexander-Puschkin-Platz | 15771 | am Fahrbahnrand | - m | 5.4 m |
| 33 | Oschatzer Straße | 16314 | am Fahrbahnrand | - m | 4.0 m |
| 34 | Altpieschen | 16818 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 11.1 m |
| 35 | Mickten | 17318 | neben der Fahrbahn (eigener Bahnkoerper) | 14.8 m | 10.4 m |
| 36 | Trachauer Straße | 17938 | am Fahrbahnrand | 19.1 m | 4.2 m |
| 37 | Alttrachau | 19062 | am Fahrbahnrand | 22.6 m | 4.3 m |
| 38 | Rankestraße | 19409 | am Fahrbahnrand | 17.1 m | 5.9 m |
| 39 | Peschelstraße | 19737 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 40 | S-Bahnhof Trachau West | 19950 | neben der Fahrbahn (eigener Bahnkoerper) | 11.3 m | 9.7 m |
| 41 | Kleestraße | 20271 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 42 | Radebeul, Forststraße | 20817 | zwischen den Spuren (Mittelinsel) | 7.8 m | 6.0 m |
| 43 | Radebeul Ost, Schillerstraße | 21286 | am Fahrbahnrand | - m | 8.8 m |
| 44 | Radebeul, Zinzendorfstraße | 21654 | am Fahrbahnrand | 11.3 m | 6.0 m |
| 45 | Radebeul, Hauptstraße | 21980 | am Fahrbahnrand | 23.6 m | 4.1 m |
| 46 | Radebeul, Schildenstraße | 22481 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 10.4 m |
| 47 | Radebeul, Wasastraße | 22885 | am Fahrbahnrand | - m | 1.2 m |
| 48 | Radebeul, Landesbühnen Sachsen | 23544 | zwischen den Spuren (Mittelinsel) | 7.9 m | 4.1 m |
| 49 | Radebeul, Zillerstraße (Elblandklinikum) | 24003 | am Fahrbahnrand | - m | 2.7 m |
| 50 | Radebeul, Dr.-Külz-Straße | 24512 | am Fahrbahnrand | - m | 4.2 m |
| 51 | Radebeul, Borstraße | 24909 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 14.3 m |
| 52 | Radebeul, Gradsteg | 25317 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 18.4 m |
| 53 | Radebeul, Moritzburger Straße | 25645 | am Fahrbahnrand | - m | 1.5 m |
| 54 | Radebeul, Moritzburger Straße (Kötzschenbroda) | 25652 | am Fahrbahnrand | - m | 6.5 m |
| 55 | Radebeul West, Flemmingstraße | 26104 | am Fahrbahnrand | - m | 1.3 m |
| 56 | Radebeul, Schloss Wackerbarth | 26678 | zwischen den Spuren (Mittelinsel) | 7.2 m | 6.7 m |
| 57 | Radebeul, Johannisbergstraße | 27179 | am Fahrbahnrand | - m | 5.4 m |
| 58 | Radebeul, Gerhart-Hauptmann-Straße | 27998 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 20.7 m |
| 59 | Radebeul, Eisenbahnbrücke | 28678 | neben der Fahrbahn (eigener Bahnkoerper) | 16.2 m | 16.4 m |
| 60 | Coswig, Radebeuler Straße | 29384 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 61 | Coswig, Zentrum / Börse | 29956 | zwischen den Spuren (Mittelinsel) | 4.6 m | 4.3 m |
| 62 | Coswig, Rathaus | 30195 | neben der Fahrbahn (eigener Bahnkoerper) | 12.3 m | 11.5 m |
| 63 | Coswig, Salzstraße | 31247 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 64 | Coswig, Auerstraße | 31771 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 65 | Coswig, Steinbacher Weg | 32158 | am Fahrbahnrand | - m | 4.5 m |
| 66 | Weinböhla, Köhlerstraße | 33182 | am Fahrbahnrand | 4.3 m | 14.7 m |

### Eingleisig / zweigleisig

| von | bis | Laenge |
|---|---|---|
| 6458 | 7306 | 848 m |
| 7382 | 7842 | 460 m |
| 26445 | 27152 | 707 m |
| 27292 | 27951 | 659 m |
| 28123 | 29347 | 1224 m |
| 29485 | 30135 | 650 m |
| 30332 | 31176 | 844 m |
| 31401 | 31698 | 297 m |
| 31850 | 33113 | 1263 m |

Zweigleisig: 10 Abschnitte, davon 26117 m Strecke gesamt.

### Bahn/Kfz- und Bahn/Fussgaenger-Kreuzungen (217)

| # | s | Ampel | Fuer wen |
|---|---|---|---|
| 1 | 396 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 2 | 744 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 3 | 856 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 4 | 1282 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 5 | 1647 | ja | Bahn + Kfz/Fussgaenger |
| 6 | 1751 | ja | Bahn + Kfz/Fussgaenger |
| 7 | 2083 | ja | Bahn + Kfz/Fussgaenger |
| 8 | 2430 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 9 | 2541 | ja | Bahn + Kfz/Fussgaenger |
| 10 | 2698 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 11 | 2774 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 12 | 3021 | ja | Bahn + Kfz/Fussgaenger |
| 13 | 3053 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 14 | 3094 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 15 | 3168 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 16 | 3209 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 17 | 3240 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 18 | 3331 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 19 | 3399 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 20 | 3431 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 21 | 3496 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 22 | 3532 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 23 | 3634 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 24 | 4045 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 25 | 4089 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 26 | 4281 | ja | Bahn + Kfz/Fussgaenger |
| 27 | 4778 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 28 | 4884 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 29 | 4934 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 30 | 5171 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 31 | 5207 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 32 | 5283 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 33 | 5447 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 34 | 5489 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 35 | 5598 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 36 | 5675 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 37 | 5722 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 38 | 5761 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 39 | 5886 | ja | Bahn + Kfz/Fussgaenger |
| 40 | 6369 | ja | Bahn + Kfz/Fussgaenger |
| 41 | 8293 | ja | Bahn + Kfz/Fussgaenger |
| 42 | 9196 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 43 | 9321 | ja | Bahn + Kfz/Fussgaenger |
| 44 | 9508 | ja | Bahn + Kfz/Fussgaenger |
| 45 | 9809 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 46 | 9995 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 47 | 10222 | ja | Bahn + Kfz/Fussgaenger |
| 48 | 10302 | ja | Bahn + Kfz/Fussgaenger |
| 49 | 10404 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 50 | 10519 | ja | Bahn + Kfz/Fussgaenger |
| 51 | 10549 | ja | Bahn + Kfz/Fussgaenger |
| 52 | 10640 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 53 | 10716 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 54 | 10988 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 55 | 11290 | ja | Bahn + Kfz/Fussgaenger |
| 56 | 11360 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 57 | 11461 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 58 | 11546 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 59 | 11757 | ja | Bahn + Kfz/Fussgaenger |
| 60 | 11908 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 61 | 11941 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 62 | 12188 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 63 | 12439 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 64 | 12525 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 65 | 12668 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 66 | 12723 | ja | Bahn + Kfz/Fussgaenger |
| 67 | 12772 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 68 | 12869 | ja | Bahn + Kfz/Fussgaenger |
| 69 | 12931 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 70 | 12988 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 71 | 13200 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 72 | 13284 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 73 | 13416 | ja | Bahn + Kfz/Fussgaenger |
| 74 | 14034 | ja | Bahn + Kfz/Fussgaenger |
| 75 | 14590 | ja | Bahn + Kfz/Fussgaenger |
| 76 | 14729 | ja | Bahn + Kfz/Fussgaenger |
| 77 | 14758 | ja | Bahn + Kfz/Fussgaenger |
| 78 | 14800 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 79 | 14997 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 80 | 15054 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 81 | 15088 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 82 | 15175 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 83 | 15359 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 84 | 15480 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 85 | 15536 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 86 | 15581 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 87 | 15609 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 88 | 15674 | ja | Bahn + Kfz/Fussgaenger |
| 89 | 15708 | ja | Bahn + Kfz/Fussgaenger |
| 90 | 15927 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 91 | 15956 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 92 | 15988 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 93 | 16033 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 94 | 16141 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 95 | 16261 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 96 | 16367 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 97 | 16446 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 98 | 16619 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 99 | 16654 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 100 | 16690 | ja | Bahn + Kfz/Fussgaenger |
| 101 | 16730 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 102 | 16948 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 103 | 16987 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 104 | 17070 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 105 | 17139 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 106 | 17180 | ja | Bahn + Kfz/Fussgaenger |
| 107 | 17218 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 108 | 17361 | ja | Bahn + Kfz/Fussgaenger |
| 109 | 17445 | ja | Bahn + Kfz/Fussgaenger |
| 110 | 17649 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 111 | 17878 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 112 | 17921 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 113 | 18528 | ja | Bahn + Kfz/Fussgaenger |
| 114 | 18560 | ja | Bahn + Kfz/Fussgaenger |
| 115 | 18765 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 116 | 18850 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 117 | 18924 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 118 | 18974 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 119 | 19014 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 120 | 19089 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 121 | 19221 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 122 | 19308 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 123 | 19389 | ja | Bahn + Kfz/Fussgaenger |
| 124 | 19478 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 125 | 19880 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 126 | 19930 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 127 | 19960 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 128 | 20008 | ja | Bahn + Kfz/Fussgaenger |
| 129 | 20193 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 130 | 20811 | ja | Bahn + Kfz/Fussgaenger |
| 131 | 20879 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 132 | 20919 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 133 | 20990 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 134 | 21114 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 135 | 21162 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 136 | 21233 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 137 | 21577 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 138 | 21690 | ja | Bahn + Kfz/Fussgaenger |
| 139 | 21791 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 140 | 21877 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 141 | 22012 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 142 | 22113 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 143 | 22181 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 144 | 22530 | ja | Bahn + Kfz/Fussgaenger |
| 145 | 22633 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 146 | 22673 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 147 | 22730 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 148 | 22816 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 149 | 22915 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 150 | 23010 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 151 | 23091 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 152 | 23167 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 153 | 23392 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 154 | 23571 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 155 | 23658 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 156 | 23826 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 157 | 23895 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 158 | 23942 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 159 | 24153 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 160 | 24217 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 161 | 24301 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 162 | 24372 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 163 | 24420 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 164 | 24566 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 165 | 24640 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 166 | 24734 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 167 | 24796 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 168 | 24863 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 169 | 24927 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 170 | 24987 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 171 | 25075 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 172 | 25116 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 173 | 25171 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 174 | 25236 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 175 | 25608 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 176 | 25693 | ja | Bahn + Kfz/Fussgaenger |
| 177 | 25787 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 178 | 25822 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 179 | 25926 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 180 | 26014 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 181 | 26142 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 182 | 26175 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 183 | 26331 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 184 | 26381 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 185 | 26498 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 186 | 26671 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 187 | 26922 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 188 | 27034 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 189 | 27083 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 190 | 27111 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 191 | 27268 | ja | Bahn + Kfz/Fussgaenger |
| 192 | 27338 | ja | Bahn + Kfz/Fussgaenger |
| 193 | 27474 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 194 | 27796 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 195 | 27894 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 196 | 27942 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 197 | 28042 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 198 | 28412 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 199 | 28487 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 200 | 28935 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 201 | 29562 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 202 | 29884 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 203 | 29961 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 204 | 30022 | ja | Bahn + Kfz/Fussgaenger |
| 205 | 30184 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 206 | 30321 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 207 | 30384 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 208 | 31009 | ja | Bahn + Kfz/Fussgaenger |
| 209 | 31270 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 210 | 31588 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 211 | 31659 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 212 | 31742 | ja | Bahn + Kfz/Fussgaenger |
| 213 | 31953 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 214 | 32270 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 215 | 32328 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 216 | 32356 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 217 | 32824 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |


## Linie 6

### Haltestellenlage (48)

| # | Haltestelle | s | Lage laut Karte | Abstand links | Abstand rechts |
|---|---|---|---|---|---|
| 1 | S-Bahnhof Niedersedlitz | 0 | am Fahrbahnrand | 5.5 m | - m |
| 2 | Försterlingstraße | 81 | am Fahrbahnrand | 2.9 m | - m |
| 3 | Straße des 17. Juni | 375 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 4 | Guerickestraße | 748 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 9.5 m |
| 5 | Berthold-Haupt-Straße | 1346 | zwischen den Spuren (Mittelinsel) | 4.6 m | 6.4 m |
| 6 | Altleuben | 1702 | am Fahrbahnrand | 5.5 m | - m |
| 7 | Friedhof Leuben | 2013 | am Fahrbahnrand | 3.7 m | - m |
| 8 | Großglocknerstraße | 2596 | neben der Fahrbahn (eigener Bahnkoerper) | 9.0 m | - m |
| 9 | Laibacher Straße | 3194 | am Fahrbahnrand | 9.6 m | 8.5 m |
| 10 | Leubener Straße | 3609 | am Fahrbahnrand | 4.6 m | - m |
| 11 | Laubegast, Kronstädter Platz | 3920 | am Fahrbahnrand | 6.3 m | 21.0 m |
| 12 | Hermann-Seidel-Straße | 4417 | neben der Fahrbahn (eigener Bahnkoerper) | 16.6 m | - m |
| 13 | Alttolkewitz | 4847 | am Fahrbahnrand | 3.2 m | 9.7 m |
| 14 | Wasserwerk Tolkewitz | 5673 | am Fahrbahnrand | 2.9 m | - m |
| 15 | Tolkewitz Schulcampus | 6140 | am Fahrbahnrand | 2.6 m | - m |
| 16 | Johannisfriedhof | 6420 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 17 | Striesen, Ludwig-Hartmann-Straße | 6711 | zwischen den Spuren (Mittelinsel) | 2.6 m | 8.9 m |
| 18 | Gustav-Freytag-Straße | 7231 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 19 | Heinrich-Schütz-Straße | 7784 | am Fahrbahnrand | 14.6 m | 2.4 m |
| 20 | Jüngststraße | 8224 | am Fahrbahnrand | - m | 6.9 m |
| 21 | Blasewitz, Schillerplatz | 8743 | am Fahrbahnrand | - m | 7.3 m |
| 22 | Prellerstraße | 9156 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 23 | Lene-Glatzer-Straße | 9567 | am Fahrbahnrand | - m | 4.8 m |
| 24 | Königsheimplatz | 10082 | am Fahrbahnrand | - m | 1.6 m |
| 25 | Augsburger Straße (Universitätsklinikum) | 10375 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 26 | Blasewitzer Straße / Fetscherstraße | 10657 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 10.4 m |
| 27 | Trinitatisplatz | 11268 | am Fahrbahnrand | 8.1 m | - m |
| 28 | Permoserstraße | 11700 | am Fahrbahnrand | 1.3 m | - m |
| 29 | Sachsenallee | 12141 | neben der Fahrbahn (eigener Bahnkoerper) | 17.6 m | 15.2 m |
| 30 | Rosa-Luxemburg-Platz | 12798 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 10.1 m |
| 31 | Bautzner Straße / Rothenburger Straße | 13150 | am Fahrbahnrand | - m | 7.6 m |
| 32 | Albertplatz (Erich-Kästner-Museum) | 13460 | am Fahrbahnrand | 9.1 m | 8.3 m |
| 33 | Albertplatz (Antonstraße) | 14936 | am Fahrbahnrand | - m | 2.8 m |
| 34 | Bahnhof Neustadt | 15176 | am Fahrbahnrand | 7.7 m | 12.0 m |
| 35 | Antonstraße / Leipziger Straße | 15617 | am Fahrbahnrand | 5.0 m | 15.3 m |
| 36 | Kongresszentrum (Haus der Presse) | 16396 | am Fahrbahnrand | 7.0 m | 13.0 m |
| 37 | Bahnhof Mitte / Könneritzstraße | 16805 | neben der Fahrbahn (eigener Bahnkoerper) | 10.9 m | 12.8 m |
| 38 | Weißeritzstraße | 17212 | neben der Fahrbahn (eigener Bahnkoerper) | 17.3 m | 9.1 m |
| 39 | Krankenhaus Friedrichstadt (Sportpark Ostra) | 17614 | am Fahrbahnrand | 4.9 m | - m |
| 40 | Bahnhof Mitte / Seminarstraße | 18312 | am Fahrbahnrand | 7.6 m | 16.1 m |
| 41 | Koreanischer Platz | 18628 | am Fahrbahnrand | 10.8 m | 8.1 m |
| 42 | Cottaer Straße | 19248 | am Fahrbahnrand | 9.6 m | 6.7 m |
| 43 | Wernerstraße | 19918 | am Fahrbahnrand | 9.6 m | 3.9 m |
| 44 | Löbtau, Tharandter Straße | 20292 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 45 | Bünaustraße | 20709 | am Fahrbahnrand | 5.5 m | - m |
| 46 | Malterstraße | 21139 | zwischen den Spuren (Mittelinsel) | 3.4 m | 7.3 m |
| 47 | Koblenzer Straße | 21658 | am Fahrbahnrand | 4.0 m | 15.7 m |
| 48 | Wölfnitz | 21822 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 14.5 m |

### Eingleisig / zweigleisig

keine eingleisigen Abschnitte.

Zweigleisig: 1 Abschnitte, davon 21750 m Strecke gesamt.

### Bahn/Kfz- und Bahn/Fussgaenger-Kreuzungen (182)

| # | s | Ampel | Fuer wen |
|---|---|---|---|
| 1 | 116 | ja | Bahn + Kfz/Fussgaenger |
| 2 | 204 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 3 | 244 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 4 | 291 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 5 | 550 | ja | Bahn + Kfz/Fussgaenger |
| 6 | 806 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 7 | 894 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 8 | 923 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 9 | 952 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 10 | 981 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 11 | 1033 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 12 | 1095 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 13 | 1140 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 14 | 1202 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 15 | 1254 | ja | Bahn + Kfz/Fussgaenger |
| 16 | 1286 | ja | Bahn + Kfz/Fussgaenger |
| 17 | 1328 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 18 | 1375 | ja | Bahn + Kfz/Fussgaenger |
| 19 | 1454 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 20 | 1521 | ja | Bahn + Kfz/Fussgaenger |
| 21 | 1576 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 22 | 1670 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 23 | 1763 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 24 | 1816 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 25 | 1976 | ja | Bahn + Kfz/Fussgaenger |
| 26 | 2057 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 27 | 2114 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 28 | 2489 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 29 | 2587 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 30 | 2708 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 31 | 2812 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 32 | 2934 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 33 | 3020 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 34 | 3201 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 35 | 3263 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 36 | 3307 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 37 | 3341 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 38 | 3376 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 39 | 3429 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 40 | 3550 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 41 | 3598 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 42 | 3663 | ja | Bahn + Kfz/Fussgaenger |
| 43 | 3788 | ja | Bahn + Kfz/Fussgaenger |
| 44 | 3818 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 45 | 3887 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 46 | 3937 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 47 | 4037 | ja | Bahn + Kfz/Fussgaenger |
| 48 | 4162 | ja | Bahn + Kfz/Fussgaenger |
| 49 | 4321 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 50 | 4392 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 51 | 4535 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 52 | 4636 | ja | Bahn + Kfz/Fussgaenger |
| 53 | 4732 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 54 | 4785 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 55 | 4825 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 56 | 4923 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 57 | 4961 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 58 | 5354 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 59 | 5390 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 60 | 5625 | ja | Bahn + Kfz/Fussgaenger |
| 61 | 5785 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 62 | 5813 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 63 | 6014 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 64 | 6100 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 65 | 6355 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 66 | 6614 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 67 | 6654 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 68 | 6755 | ja | Bahn + Kfz/Fussgaenger |
| 69 | 6847 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 70 | 6948 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 71 | 7019 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 72 | 7185 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 73 | 7276 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 74 | 7320 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 75 | 7498 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 76 | 7602 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 77 | 7661 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 78 | 7700 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 79 | 7783 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 80 | 7819 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 81 | 7892 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 82 | 7967 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 83 | 8030 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 84 | 8117 | ja | Bahn + Kfz/Fussgaenger |
| 85 | 8202 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 86 | 8282 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 87 | 8354 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 88 | 8392 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 89 | 8459 | ja | Bahn + Kfz/Fussgaenger |
| 90 | 8566 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 91 | 8630 | ja | Bahn + Kfz/Fussgaenger |
| 92 | 8680 | ja | Bahn + Kfz/Fussgaenger |
| 93 | 8772 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 94 | 8820 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 95 | 8885 | ja | Bahn + Kfz/Fussgaenger |
| 96 | 8915 | ja | Bahn + Kfz/Fussgaenger |
| 97 | 8945 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 98 | 9038 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 99 | 9520 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 100 | 9660 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 101 | 9729 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 102 | 9758 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 103 | 9800 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 104 | 9885 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 105 | 9952 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 106 | 9997 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 107 | 10064 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 108 | 10692 | ja | Bahn + Kfz/Fussgaenger |
| 109 | 10724 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 110 | 11122 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 111 | 11218 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 112 | 11319 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 113 | 11397 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 114 | 11461 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 115 | 11568 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 116 | 11664 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 117 | 11932 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 118 | 12032 | ja | Bahn + Kfz/Fussgaenger |
| 119 | 12062 | ja | Bahn + Kfz/Fussgaenger |
| 120 | 12091 | ja | Bahn + Kfz/Fussgaenger |
| 121 | 12283 | ja | Bahn + Kfz/Fussgaenger |
| 122 | 12377 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 123 | 12461 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 124 | 12852 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 125 | 12931 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 126 | 13240 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 127 | 13433 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 128 | 13695 | ja | Bahn + Kfz/Fussgaenger |
| 129 | 14671 | ja | Bahn + Kfz/Fussgaenger |
| 130 | 14796 | ja | Bahn + Kfz/Fussgaenger |
| 131 | 14897 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 132 | 14976 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 133 | 15065 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 134 | 15099 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 135 | 15207 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 136 | 15276 | ja | Bahn + Kfz/Fussgaenger |
| 137 | 15334 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 138 | 15431 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 139 | 15512 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 140 | 15568 | ja | Bahn + Kfz/Fussgaenger |
| 141 | 15709 | ja | Bahn + Kfz/Fussgaenger |
| 142 | 16278 | ja | Bahn + Kfz/Fussgaenger |
| 143 | 16491 | ja | Bahn + Kfz/Fussgaenger |
| 144 | 16619 | ja | Bahn + Kfz/Fussgaenger |
| 145 | 16973 | ja | Bahn + Kfz/Fussgaenger |
| 146 | 17030 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 147 | 17068 | ja | Bahn + Kfz/Fussgaenger |
| 148 | 17097 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 149 | 17611 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 150 | 18028 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 151 | 18135 | ja | Bahn + Kfz/Fussgaenger |
| 152 | 18394 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 153 | 18428 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 154 | 18459 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 155 | 18603 | ja | Bahn + Kfz/Fussgaenger |
| 156 | 19001 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 157 | 19109 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 158 | 19169 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 159 | 19227 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 160 | 19325 | ja | Bahn + Kfz/Fussgaenger |
| 161 | 19745 | ja | Bahn + Kfz/Fussgaenger |
| 162 | 19794 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 163 | 19830 | ja | Bahn + Kfz/Fussgaenger |
| 164 | 19868 | ja | Bahn + Kfz/Fussgaenger |
| 165 | 19996 | ja | Bahn + Kfz/Fussgaenger |
| 166 | 20082 | ja | Bahn + Kfz/Fussgaenger |
| 167 | 20110 | ja | Bahn + Kfz/Fussgaenger |
| 168 | 20155 | ja | Bahn + Kfz/Fussgaenger |
| 169 | 20389 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 170 | 20490 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 171 | 20569 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 172 | 20754 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 173 | 20869 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 174 | 20899 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 175 | 20956 | ja | Bahn + Kfz/Fussgaenger |
| 176 | 21011 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 177 | 21048 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 178 | 21142 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 179 | 21355 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 180 | 21618 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 181 | 21650 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 182 | 21690 | ja | Bahn + Kfz/Fussgaenger |


## Linie 7

### Haltestellenlage (47)

| # | Haltestelle | s | Lage laut Karte | Abstand links | Abstand rechts |
|---|---|---|---|---|---|
| 1 | Weixdorf, Rathenaustraße | 0 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 2 | Haltepunkt Weixdorf Bad | 501 | am Fahrbahnrand | 4.8 m | - m |
| 3 | Fuchsberg | 1323 | am Fahrbahnrand | 6.3 m | 12.8 m |
| 4 | Industriepark Klotzsche | 2029 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 18.2 m |
| 5 | Arkonastraße | 2534 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 9.6 m |
| 6 | Käthe-Kollwitz-Platz | 3110 | am Fahrbahnrand | 3.6 m | 12.4 m |
| 7 | Zur Neuen Brücke | 3762 | neben der Fahrbahn (eigener Bahnkoerper) | 10.3 m | 17.6 m |
| 8 | Karl-Marx-Straße | 4425 | am Fahrbahnrand | - m | 6.4 m |
| 9 | Infineon Nord | 4753 | zwischen den Spuren (Mittelinsel) | 7.7 m | 5.3 m |
| 10 | Infineon Süd (Abzweig nach Hellerau) | 5372 | neben der Fahrbahn (eigener Bahnkoerper) | 23.1 m | - m |
| 11 | Moritzburger Weg | 5806 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 12 | Hellersiedlung | 6659 | neben der Fahrbahn (eigener Bahnkoerper) | 11.0 m | - m |
| 13 | S-Bahnhof Industriegelände | 7201 | neben der Fahrbahn (eigener Bahnkoerper) | 12.6 m | - m |
| 14 | Heeresbäckerei (Stadtarchiv) | 7853 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 15 | Stauffenbergallee (Militärhistorisches Museum) | 8445 | am Fahrbahnrand | 7.7 m | 10.3 m |
| 16 | Tannenstraße (Goethe-Institut) | 8823 | neben der Fahrbahn (eigener Bahnkoerper) | 10.3 m | - m |
| 17 | Bischofsweg | 9171 | am Fahrbahnrand | - m | 7.0 m |
| 18 | Alaunplatz | 9557 | am Fahrbahnrand | - m | 5.1 m |
| 19 | Görlitzer Straße (Nordbad) | 10070 | am Fahrbahnrand | 2.0 m | - m |
| 20 | Albertplatz (Erich-Kästner-Museum) | 10686 | zwischen den Spuren (Mittelinsel) | 8.2 m | 7.9 m |
| 21 | Carolaplatz (Regierungsviertel) | 11410 | neben der Fahrbahn (eigener Bahnkoerper) | 18.9 m | - m |
| 22 | Neustädter Markt (Goldener Reiter) | 11864 | neben der Fahrbahn (eigener Bahnkoerper) | 15.5 m | 13.5 m |
| 23 | Theaterplatz | 12591 | am Fahrbahnrand | 21.6 m | 2.2 m |
| 24 | Postplatz (Zwinger) | 12983 | zwischen den Spuren (Mittelinsel) | 5.0 m | 2.7 m |
| 25 | Postplatz | 13191 | neben der Fahrbahn (eigener Bahnkoerper) | 12.6 m | 14.1 m |
| 26 | Prager Straße | 13908 | neben der Fahrbahn (eigener Bahnkoerper) | 20.2 m | 17.3 m |
| 27 | Walpurgisstraße | 14556 | neben der Fahrbahn (eigener Bahnkoerper) | 11.8 m | 9.6 m |
| 28 | Hauptbahnhof Nord | 14886 | am Fahrbahnrand | 16.6 m | 8.1 m |
| 29 | Hauptbahnhof | 15109 | zwischen den Spuren (Mittelinsel) | 4.6 m | 6.0 m |
| 30 | Budapester Straße | 15744 | neben der Fahrbahn (eigener Bahnkoerper) | 19.7 m | 12.2 m |
| 31 | S-Bahnhof Freiberger Straße | 16386 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 32 | Florastraße | 16715 | am Fahrbahnrand | 7.8 m | - m |
| 33 | Oederaner Straße | 17399 | neben der Fahrbahn (eigener Bahnkoerper) | 16.0 m | - m |
| 34 | Löbtau, Tharandter Straße | 17858 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 35 | Bünaustraße | 18275 | am Fahrbahnrand | 1.3 m | - m |
| 36 | Malterstraße | 18705 | am Fahrbahnrand | 2.7 m | 10.5 m |
| 37 | Koblenzer Straße | 19224 | am Fahrbahnrand | 2.3 m | 10.8 m |
| 38 | Wölfnitz | 19387 | neben der Fahrbahn (eigener Bahnkoerper) | 15.2 m | - m |
| 39 | Amalie-Dietrich-Platz | 19874 | zwischen den Spuren (Mittelinsel) | 1.3 m | 6.1 m |
| 40 | Merianplatz | 20442 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 41 | Kirschenstraße | 20982 | neben der Fahrbahn (eigener Bahnkoerper) | 17.0 m | 20.3 m |
| 42 | Schlehenstraße | 21533 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 23.1 m |
| 43 | Gorbitz, Betriebshof | 22001 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 44 | Altnossener Straße | 22959 | am Fahrbahnrand | 13.7 m | 5.7 m |
| 45 | Rudolf-Walther-Straße | 23540 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 15.0 m |
| 46 | Gompitz, Gompitzer Höhe | 24014 | neben der Fahrbahn (eigener Bahnkoerper) | 13.4 m | 10.4 m |
| 47 | Pennrich, Gleisschleife | 24546 | neben der Fahrbahn (eigener Bahnkoerper) | 15.5 m | - m |

### Eingleisig / zweigleisig

| von | bis | Laenge |
|---|---|---|
| 196 | 442 | 246 m |
| 592 | 1253 | 661 m |
| 1429 | 1999 | 570 m |
| 2132 | 2424 | 292 m |
| 3195 | 3444 | 249 m |
| 3481 | 3705 | 224 m |
| 3883 | 4342 | 459 m |
| 9657 | 10045 | 388 m |

Zweigleisig: 9 Abschnitte, davon 21340 m Strecke gesamt.

### Bahn/Kfz- und Bahn/Fussgaenger-Kreuzungen (144)

| # | s | Ampel | Fuer wen |
|---|---|---|---|
| 1 | 112 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 2 | 468 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 3 | 554 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 4 | 850 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 5 | 1079 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 6 | 1594 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 7 | 2102 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 8 | 2320 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 9 | 2465 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 10 | 2578 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 11 | 2670 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 12 | 2722 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 13 | 2753 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 14 | 2802 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 15 | 2867 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 16 | 2927 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 17 | 2970 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 18 | 3007 | ja | Bahn + Kfz/Fussgaenger |
| 19 | 3044 | ja | Bahn + Kfz/Fussgaenger |
| 20 | 3085 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 21 | 3120 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 22 | 3201 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 23 | 3303 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 24 | 3348 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 25 | 3459 | ja | Bahn + Kfz/Fussgaenger |
| 26 | 3501 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 27 | 3590 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 28 | 3656 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 29 | 3701 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 30 | 3745 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 31 | 3777 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 32 | 3810 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 33 | 4290 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 34 | 4379 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 35 | 4471 | ja | Bahn + Kfz/Fussgaenger |
| 36 | 4616 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 37 | 6374 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 38 | 7459 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 39 | 8102 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 40 | 8224 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 41 | 8282 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 42 | 8416 | ja | Bahn + Kfz/Fussgaenger |
| 43 | 8505 | ja | Bahn + Kfz/Fussgaenger |
| 44 | 8572 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 45 | 8723 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 46 | 9070 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 47 | 9098 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 48 | 9140 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 49 | 9202 | ja | Bahn + Kfz/Fussgaenger |
| 50 | 9284 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 51 | 9341 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 52 | 9389 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 53 | 9536 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 54 | 9627 | ja | Bahn + Kfz/Fussgaenger |
| 55 | 9729 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 56 | 10036 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 57 | 10115 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 58 | 10206 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 59 | 10440 | ja | Bahn + Kfz/Fussgaenger |
| 60 | 10469 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 61 | 10658 | ja | Bahn + Kfz/Fussgaenger |
| 62 | 10770 | ja | Bahn + Kfz/Fussgaenger |
| 63 | 10799 | ja | Bahn + Kfz/Fussgaenger |
| 64 | 10935 | ja | Bahn + Kfz/Fussgaenger |
| 65 | 10963 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 66 | 11061 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 67 | 11603 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 68 | 11663 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 69 | 12044 | ja | Bahn + Kfz/Fussgaenger |
| 70 | 12480 | ja | Bahn + Kfz/Fussgaenger |
| 71 | 12509 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 72 | 12540 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 73 | 12621 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 74 | 12665 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 75 | 12700 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 76 | 12771 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 77 | 12830 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 78 | 12881 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 79 | 12948 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 80 | 12984 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 81 | 13025 | ja | Bahn + Kfz/Fussgaenger |
| 82 | 13054 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 83 | 13319 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 84 | 13565 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 85 | 13611 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 86 | 13752 | ja | Bahn + Kfz/Fussgaenger |
| 87 | 13973 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 88 | 14050 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 89 | 14153 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 90 | 14215 | ja | Bahn + Kfz/Fussgaenger |
| 91 | 14524 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 92 | 14802 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 93 | 14879 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 94 | 14968 | ja | Bahn + Kfz/Fussgaenger |
| 95 | 14999 | ja | Bahn + Kfz/Fussgaenger |
| 96 | 15089 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 97 | 15263 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 98 | 15320 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 99 | 15756 | ja | Bahn + Kfz/Fussgaenger |
| 100 | 15785 | ja | Bahn + Kfz/Fussgaenger |
| 101 | 15830 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 102 | 16498 | ja | Bahn + Kfz/Fussgaenger |
| 103 | 16671 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 104 | 16777 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 105 | 16890 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 106 | 17048 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 107 | 17123 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 108 | 17262 | ja | Bahn + Kfz/Fussgaenger |
| 109 | 17343 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 110 | 17455 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 111 | 17544 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 112 | 17628 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 113 | 17729 | ja | Bahn + Kfz/Fussgaenger |
| 114 | 17760 | ja | Bahn + Kfz/Fussgaenger |
| 115 | 17823 | ja | Bahn + Kfz/Fussgaenger |
| 116 | 17963 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 117 | 18061 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 118 | 18140 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 119 | 18325 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 120 | 18440 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 121 | 18470 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 122 | 18528 | ja | Bahn + Kfz/Fussgaenger |
| 123 | 18582 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 124 | 18619 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 125 | 18713 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 126 | 18926 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 127 | 19189 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 128 | 19221 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 129 | 19261 | ja | Bahn + Kfz/Fussgaenger |
| 130 | 19578 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 131 | 19627 | ja | Bahn + Kfz/Fussgaenger |
| 132 | 19770 | ja | Bahn + Kfz/Fussgaenger |
| 133 | 19869 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 134 | 19935 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 135 | 20696 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 136 | 21821 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 137 | 22571 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 138 | 22710 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 139 | 22917 | ja | Bahn + Kfz/Fussgaenger |
| 140 | 22991 | ja | Bahn + Kfz/Fussgaenger |
| 141 | 23024 | ja | Bahn + Kfz/Fussgaenger |
| 142 | 23964 | ja | Bahn + Kfz/Fussgaenger |
| 143 | 24000 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 144 | 24111 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |


## Linie 8

### Haltestellenlage (34)

| # | Haltestelle | s | Lage laut Karte | Abstand links | Abstand rechts |
|---|---|---|---|---|---|
| 1 | Hellerau, Kiefernweg | 0 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 2 | Brunnenweg | 452 | neben der Fahrbahn (eigener Bahnkoerper) | 9.1 m | - m |
| 3 | Festspielhaus Hellerau | 973 | am Fahrbahnrand | 8.9 m | - m |
| 4 | Heinrich-Tessenow-Weg | 1591 | neben der Fahrbahn (eigener Bahnkoerper) | 11.2 m | - m |
| 5 | Am Hellerrand (Deutsche Werkstätten) | 1849 | neben der Fahrbahn (eigener Bahnkoerper) | 11.8 m | 22.6 m |
| 6 | Infineon Süd (Abzweig nach Hellerau) | 2870 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 7 | Moritzburger Weg | 3466 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 8 | Hellersiedlung | 4320 | neben der Fahrbahn (eigener Bahnkoerper) | 11.0 m | - m |
| 9 | S-Bahnhof Industriegelände | 4862 | neben der Fahrbahn (eigener Bahnkoerper) | 12.5 m | - m |
| 10 | Heeresbäckerei (Stadtarchiv) | 5514 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 11 | Stauffenbergallee (Militärhistorisches Museum) | 6105 | am Fahrbahnrand | 8.0 m | 10.2 m |
| 12 | Tannenstraße (Goethe-Institut) | 6484 | neben der Fahrbahn (eigener Bahnkoerper) | 9.9 m | - m |
| 13 | Bischofsweg | 6832 | am Fahrbahnrand | - m | 6.5 m |
| 14 | Alaunplatz | 7217 | am Fahrbahnrand | - m | 5.5 m |
| 15 | Görlitzer Straße (Nordbad) | 7730 | am Fahrbahnrand | 2.2 m | - m |
| 16 | Albertplatz (Erich-Kästner-Museum) | 8347 | zwischen den Spuren (Mittelinsel) | 8.2 m | 8.5 m |
| 17 | Bautzner Straße / Rothenburger Straße | 8620 | am Fahrbahnrand | 5.8 m | - m |
| 18 | Rosa-Luxemburg-Platz | 8967 | am Fahrbahnrand | 7.8 m | 14.9 m |
| 19 | Sachsenallee | 9577 | neben der Fahrbahn (eigener Bahnkoerper) | 16.3 m | 14.2 m |
| 20 | Carolaplatz (Regierungsviertel) | 11532 | neben der Fahrbahn (eigener Bahnkoerper) | 19.1 m | - m |
| 21 | Neustädter Markt (Goldener Reiter) | 11990 | am Fahrbahnrand | - m | 4.1 m |
| 22 | Theaterplatz | 12486 | am Fahrbahnrand | 22.6 m | 2.8 m |
| 23 | Postplatz (Zwinger) | 12876 | zwischen den Spuren (Mittelinsel) | 5.4 m | 2.8 m |
| 24 | Postplatz | 13000 | neben der Fahrbahn (eigener Bahnkoerper) | 12.8 m | 13.6 m |
| 25 | Altmarkt | 13310 | zwischen den Spuren (Mittelinsel) | 8.8 m | 8.8 m |
| 26 | Pirnaischer Platz (Stadtmuseum) | 13594 | neben der Fahrbahn (eigener Bahnkoerper) | 12.7 m | 9.4 m |
| 27 | Deutsches Hygiene-Museum | 14131 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 23.1 m |
| 28 | Straßburger Platz (Gläserne Manufaktur) | 14528 | neben der Fahrbahn (eigener Bahnkoerper) | 12.8 m | 12.7 m |
| 29 | Georg-Arnhold-Bad (Deutsches Hygiene-Museum) | 14967 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 30 | Lennéplatz | 15647 | am Fahrbahnrand | 11.0 m | 8.1 m |
| 31 | Gret-Palucca-Straße | 16154 | zwischen den Spuren (Mittelinsel) | 5.0 m | 8.0 m |
| 32 | Hauptbahnhof | 16686 | zwischen den Spuren (Mittelinsel) | 3.2 m | 4.7 m |
| 33 | Reichenbachstraße (Studentenwerk) | 17357 | neben der Fahrbahn (eigener Bahnkoerper) | 19.8 m | - m |
| 34 | Nürnberger Platz | 17947 | am Fahrbahnrand | 8.4 m | 13.3 m |

### Eingleisig / zweigleisig

| von | bis | Laenge |
|---|---|---|
| 80 | 955 | 875 m |
| 1930 | 2817 | 887 m |
| 7319 | 7706 | 387 m |

Zweigleisig: 4 Abschnitte, davon 15681 m Strecke gesamt.

### Bahn/Kfz- und Bahn/Fussgaenger-Kreuzungen (85)

| # | s | Ampel | Fuer wen |
|---|---|---|---|
| 1 | 136 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 2 | 198 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 3 | 316 | ja | Bahn + Kfz/Fussgaenger |
| 4 | 419 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 5 | 502 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 6 | 555 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 7 | 605 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 8 | 769 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 9 | 820 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 10 | 863 | ja | Bahn + Kfz/Fussgaenger |
| 11 | 911 | ja | Bahn + Kfz/Fussgaenger |
| 12 | 1047 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 13 | 1102 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 14 | 1301 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 15 | 1398 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 16 | 1450 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 17 | 1707 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 18 | 1868 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 19 | 1959 | ja | Bahn + Kfz/Fussgaenger |
| 20 | 3151 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 21 | 4034 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 22 | 5120 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 23 | 5763 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 24 | 5885 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 25 | 5943 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 26 | 6077 | ja | Bahn + Kfz/Fussgaenger |
| 27 | 6166 | ja | Bahn + Kfz/Fussgaenger |
| 28 | 6233 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 29 | 6384 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 30 | 6731 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 31 | 6759 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 32 | 6801 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 33 | 6863 | ja | Bahn + Kfz/Fussgaenger |
| 34 | 6946 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 35 | 7002 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 36 | 7050 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 37 | 7197 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 38 | 7296 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 39 | 7390 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 40 | 7696 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 41 | 7776 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 42 | 7867 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 43 | 8101 | ja | Bahn + Kfz/Fussgaenger |
| 44 | 8129 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 45 | 8322 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 46 | 8854 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 47 | 8955 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 48 | 9523 | ja | Bahn + Kfz/Fussgaenger |
| 49 | 10781 | ja | Bahn + Kfz/Fussgaenger |
| 50 | 10894 | ja | Bahn + Kfz/Fussgaenger |
| 51 | 10922 | ja | Bahn + Kfz/Fussgaenger |
| 52 | 11058 | ja | Bahn + Kfz/Fussgaenger |
| 53 | 11086 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 54 | 11184 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 55 | 11726 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 56 | 11786 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 57 | 11933 | ja | Bahn + Kfz/Fussgaenger |
| 58 | 12376 | ja | Bahn + Kfz/Fussgaenger |
| 59 | 12435 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 60 | 12516 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 61 | 12560 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 62 | 12596 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 63 | 12667 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 64 | 12726 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 65 | 12776 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 66 | 12843 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 67 | 12880 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 68 | 12912 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 69 | 12944 | ja | Bahn + Kfz/Fussgaenger |
| 70 | 13240 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 71 | 13272 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 72 | 13302 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 73 | 13335 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 74 | 13727 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 75 | 14559 | ja | Bahn + Kfz/Fussgaenger |
| 76 | 15477 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 77 | 15602 | ja | Bahn + Kfz/Fussgaenger |
| 78 | 15789 | ja | Bahn + Kfz/Fussgaenger |
| 79 | 16090 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 80 | 16276 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 81 | 16503 | ja | Bahn + Kfz/Fussgaenger |
| 82 | 16582 | ja | Bahn + Kfz/Fussgaenger |
| 83 | 16684 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 84 | 16769 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 85 | 17662 | ja | Bahn + Kfz/Fussgaenger |


## Linie 9

### Haltestellenlage (37)

| # | Haltestelle | s | Lage laut Karte | Abstand links | Abstand rechts |
|---|---|---|---|---|---|
| 1 | Laubegast, Kronstädter Platz | 0 | am Fahrbahnrand | 6.6 m | 21.3 m |
| 2 | Leubener Straße | 136 | zwischen den Spuren (Mittelinsel) | 2.6 m | 7.8 m |
| 3 | Hermann-Seidel-Straße | 497 | neben der Fahrbahn (eigener Bahnkoerper) | 16.2 m | - m |
| 4 | Alttolkewitz | 927 | am Fahrbahnrand | 2.8 m | 9.9 m |
| 5 | Wasserwerk Tolkewitz | 1753 | am Fahrbahnrand | 3.3 m | - m |
| 6 | Tolkewitz Schulcampus | 2220 | am Fahrbahnrand | 3.2 m | - m |
| 7 | Johannisfriedhof | 2499 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 8 | Striesen, Ludwig-Hartmann-Straße | 2791 | am Fahrbahnrand | 3.5 m | - m |
| 9 | Striesen, Emanuel-Goldberg-Platz | 3060 | am Fahrbahnrand | 6.7 m | - m |
| 10 | Gottleubaer Straße | 3875 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 11 | Pohlandplatz (Technische Sammlungen) | 4384 | am Fahrbahnrand | - m | 3.4 m |
| 12 | Bergmannstraße | 4855 | am Fahrbahnrand | - m | 6.9 m |
| 13 | Spenerstraße | 5238 | am Fahrbahnrand | 8.0 m | 12.5 m |
| 14 | Mosenstraße | 5568 | neben der Fahrbahn (eigener Bahnkoerper) | 22.8 m | - m |
| 15 | Fetscherplatz | 6130 | am Fahrbahnrand | 20.1 m | 7.9 m |
| 16 | Krankenhaus St. Joseph-Stift | 6642 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 17 | Straßburger Platz (Gläserne Manufaktur) | 7063 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 18 | Deutsches Hygiene-Museum | 7741 | neben der Fahrbahn (eigener Bahnkoerper) | 13.4 m | - m |
| 19 | Pirnaischer Platz (Stadtmuseum) | 8274 | neben der Fahrbahn (eigener Bahnkoerper) | 10.0 m | 17.1 m |
| 20 | Altmarkt | 8600 | neben der Fahrbahn (eigener Bahnkoerper) | 14.3 m | 13.5 m |
| 21 | Postplatz | 8871 | neben der Fahrbahn (eigener Bahnkoerper) | 12.8 m | 12.5 m |
| 22 | Schweriner Straße (Hochschule für Musik) | 9577 | am Fahrbahnrand | 6.3 m | - m |
| 23 | Bahnhof Mitte / Könneritzstraße | 10009 | neben der Fahrbahn (eigener Bahnkoerper) | 11.9 m | 9.4 m |
| 24 | Kongresszentrum (Haus der Presse) | 10413 | neben der Fahrbahn (eigener Bahnkoerper) | 10.1 m | 12.5 m |
| 25 | Antonstraße / Leipziger Straße | 11181 | am Fahrbahnrand | 13.2 m | 6.5 m |
| 26 | Alter Schlachthof | 11958 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 12.0 m |
| 27 | Alexander-Puschkin-Platz | 12318 | am Fahrbahnrand | - m | 3.1 m |
| 28 | Oschatzer Straße | 12861 | am Fahrbahnrand | - m | 6.8 m |
| 29 | Altpieschen | 13365 | am Fahrbahnrand | - m | 8.1 m |
| 30 | Mickten | 13807 | am Fahrbahnrand | 10.4 m | 5.3 m |
| 31 | Trachauer Straße | 14485 | am Fahrbahnrand | - m | 2.1 m |
| 32 | Brockwitzer Straße | 14844 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 14.2 m |
| 33 | An der Flutrinne | 15151 | am Fahrbahnrand | 8.4 m | 11.0 m |
| 34 | Sörnewitzer Straße | 15507 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 23.2 m |
| 35 | Elbepark | 15838 | am Fahrbahnrand | 10.1 m | 4.2 m |
| 36 | Washingtonstraße | 16176 | am Fahrbahnrand | 13.1 m | 5.6 m |
| 37 | Kaditz, Riegelplatz | 16486 | am Fahrbahnrand | 22.1 m | 8.1 m |

### Eingleisig / zweigleisig

keine eingleisigen Abschnitte.

Laut OSM eingleisig, im Spiel nicht als Engstelle gefuehrt (kuerzer als 120 m oder im Endbereich):

| von | bis | Laenge |
|---|---|---|
| 58.6 | 112.2 | 53.6 m |

Zweigleisig: 1 Abschnitte, davon 16367 m Strecke gesamt.

### Bahn/Kfz- und Bahn/Fussgaenger-Kreuzungen (115)

| # | s | Ampel | Fuer wen |
|---|---|---|---|
| 1 | 96 | ja | Bahn + Kfz/Fussgaenger |
| 2 | 132 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 3 | 240 | ja | Bahn + Kfz/Fussgaenger |
| 4 | 402 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 5 | 472 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 6 | 616 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 7 | 717 | ja | Bahn + Kfz/Fussgaenger |
| 8 | 813 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 9 | 866 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 10 | 905 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 11 | 1004 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 12 | 1041 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 13 | 1435 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 14 | 1471 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 15 | 1705 | ja | Bahn + Kfz/Fussgaenger |
| 16 | 1865 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 17 | 1894 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 18 | 2095 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 19 | 2180 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 20 | 2435 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 21 | 2695 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 22 | 2735 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 23 | 2843 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 24 | 2982 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 25 | 3048 | ja | Bahn + Kfz/Fussgaenger |
| 26 | 3389 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 27 | 3457 | ja | Bahn + Kfz/Fussgaenger |
| 28 | 3494 | ja | Bahn + Kfz/Fussgaenger |
| 29 | 3604 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 30 | 4158 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 31 | 4223 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 32 | 4328 | ja | Bahn + Kfz/Fussgaenger |
| 33 | 4926 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 34 | 5168 | ja | Bahn + Kfz/Fussgaenger |
| 35 | 5197 | ja | Bahn + Kfz/Fussgaenger |
| 36 | 5234 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 37 | 5280 | ja | Bahn + Kfz/Fussgaenger |
| 38 | 5317 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 39 | 5764 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 40 | 5907 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 41 | 5991 | ja | Bahn + Kfz/Fussgaenger |
| 42 | 6085 | ja | Bahn + Kfz/Fussgaenger |
| 43 | 6163 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 44 | 6229 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 45 | 6290 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 46 | 6353 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 47 | 6424 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 48 | 6521 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 49 | 6899 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 50 | 7129 | ja | Bahn + Kfz/Fussgaenger |
| 51 | 7310 | ja | Bahn + Kfz/Fussgaenger |
| 52 | 7399 | ja | Bahn + Kfz/Fussgaenger |
| 53 | 8227 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 54 | 8686 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 55 | 8718 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 56 | 8983 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 57 | 9068 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 58 | 9212 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 59 | 9267 | ja | Bahn + Kfz/Fussgaenger |
| 60 | 9316 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 61 | 9413 | ja | Bahn + Kfz/Fussgaenger |
| 62 | 9475 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 63 | 9532 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 64 | 9744 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 65 | 9828 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 66 | 9960 | ja | Bahn + Kfz/Fussgaenger |
| 67 | 10578 | ja | Bahn + Kfz/Fussgaenger |
| 68 | 11134 | ja | Bahn + Kfz/Fussgaenger |
| 69 | 11280 | ja | Bahn + Kfz/Fussgaenger |
| 70 | 11344 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 71 | 11541 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 72 | 11598 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 73 | 11632 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 74 | 11719 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 75 | 11903 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 76 | 12024 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 77 | 12080 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 78 | 12125 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 79 | 12153 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 80 | 12218 | ja | Bahn + Kfz/Fussgaenger |
| 81 | 12252 | ja | Bahn + Kfz/Fussgaenger |
| 82 | 12471 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 83 | 12500 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 84 | 12532 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 85 | 12577 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 86 | 12685 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 87 | 12805 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 88 | 12911 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 89 | 12990 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 90 | 13163 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 91 | 13198 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 92 | 13234 | ja | Bahn + Kfz/Fussgaenger |
| 93 | 13274 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 94 | 13492 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 95 | 13532 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 96 | 13614 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 97 | 13683 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 98 | 13724 | ja | Bahn + Kfz/Fussgaenger |
| 99 | 13762 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 100 | 13831 | ja | Bahn + Kfz/Fussgaenger |
| 101 | 13905 | ja | Bahn + Kfz/Fussgaenger |
| 102 | 13989 | ja | Bahn + Kfz/Fussgaenger |
| 103 | 14193 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 104 | 14486 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 105 | 14541 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 106 | 14668 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 107 | 14737 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 108 | 14937 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 109 | 15019 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 110 | 15095 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 111 | 15240 | ja | Bahn + Kfz/Fussgaenger |
| 112 | 15344 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 113 | 15664 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 114 | 15771 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 115 | 16409 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |


## Linie 10

### Haltestellenlage (26)

| # | Haltestelle | s | Lage laut Karte | Abstand links | Abstand rechts |
|---|---|---|---|---|---|
| 1 | Messe Dresden | 0 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 2 | Messering (Halle 1) | 340 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 3 | Alberthafen | 828 | neben der Fahrbahn (eigener Bahnkoerper) | 16.0 m | - m |
| 4 | Vorwerkstraße | 1025 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 15.1 m |
| 5 | Krankenhaus Friedrichstadt (Sportpark Ostra) | 1364 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 6 | Weißeritzstraße | 1818 | am Fahrbahnrand | 6.6 m | 14.8 m |
| 7 | Bahnhof Mitte / Könneritzstraße | 2224 | neben der Fahrbahn (eigener Bahnkoerper) | 15.2 m | 12.1 m |
| 8 | Schweriner Straße (Hochschule für Musik) | 2681 | am Fahrbahnrand | - m | 4.7 m |
| 9 | Postplatz | 3330 | neben der Fahrbahn (eigener Bahnkoerper) | 13.2 m | 11.9 m |
| 10 | Prager Straße | 4132 | neben der Fahrbahn (eigener Bahnkoerper) | 20.7 m | 17.2 m |
| 11 | Walpurgisstraße | 4780 | neben der Fahrbahn (eigener Bahnkoerper) | 11.5 m | 9.8 m |
| 12 | Hauptbahnhof Nord | 5111 | neben der Fahrbahn (eigener Bahnkoerper) | 17.4 m | 9.5 m |
| 13 | Hauptbahnhof | 5333 | zwischen den Spuren (Mittelinsel) | 7.2 m | 5.7 m |
| 14 | Gret-Palucca-Straße | 5802 | am Fahrbahnrand | 9.1 m | 2.1 m |
| 15 | Lennéplatz | 6311 | neben der Fahrbahn (eigener Bahnkoerper) | 9.1 m | 11.0 m |
| 16 | Georg-Arnhold-Bad (Deutsches Hygiene-Museum) | 6900 | neben der Fahrbahn (eigener Bahnkoerper) | 13.1 m | - m |
| 17 | Straßburger Platz (Gläserne Manufaktur) | 7411 | neben der Fahrbahn (eigener Bahnkoerper) | 13.9 m | 10.8 m |
| 18 | Krankenhaus St. Joseph-Stift | 8061 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 19 | Fetscherplatz | 8596 | zwischen den Spuren (Mittelinsel) | 3.5 m | 6.8 m |
| 20 | Mosenstraße | 9123 | am Fahrbahnrand | 5.1 m | 20.0 m |
| 21 | Spenerstraße | 9509 | zwischen den Spuren (Mittelinsel) | 2.9 m | 8.4 m |
| 22 | Bergmannstraße | 9867 | am Fahrbahnrand | 6.6 m | - m |
| 23 | Pohlandplatz (Technische Sammlungen) | 10349 | am Fahrbahnrand | 5.6 m | 13.6 m |
| 24 | Gottleubaer Straße | 10791 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 25 | Striesen, Emanuel-Goldberg-Platz | 11182 | neben der Fahrbahn (eigener Bahnkoerper) | 14.9 m | - m |
| 26 | Striesen, Ludwig-Hartmann-Straße | 11434 | am Fahrbahnrand | 1.8 m | - m |

### Eingleisig / zweigleisig

keine eingleisigen Abschnitte.

Zweigleisig: 1 Abschnitte, davon 11577 m Strecke gesamt.

### Bahn/Kfz- und Bahn/Fussgaenger-Kreuzungen (73)

| # | s | Ampel | Fuer wen |
|---|---|---|---|
| 1 | 137 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 2 | 780 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 3 | 906 | ja | Bahn + Kfz/Fussgaenger |
| 4 | 1125 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 5 | 1209 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 6 | 1242 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 7 | 1591 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 8 | 1625 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 9 | 1832 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 10 | 1930 | ja | Bahn + Kfz/Fussgaenger |
| 11 | 1959 | ja | Bahn + Kfz/Fussgaenger |
| 12 | 1989 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 13 | 2047 | ja | Bahn + Kfz/Fussgaenger |
| 14 | 2321 | ja | Bahn + Kfz/Fussgaenger |
| 15 | 2447 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 16 | 2514 | ja | Bahn + Kfz/Fussgaenger |
| 17 | 2542 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 18 | 2753 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 19 | 2810 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 20 | 2862 | ja | Bahn + Kfz/Fussgaenger |
| 21 | 2969 | ja | Bahn + Kfz/Fussgaenger |
| 22 | 3000 | ja | Bahn + Kfz/Fussgaenger |
| 23 | 3074 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 24 | 3197 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 25 | 3280 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 26 | 3548 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 27 | 3787 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 28 | 3834 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 29 | 3975 | ja | Bahn + Kfz/Fussgaenger |
| 30 | 4195 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 31 | 4273 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 32 | 4376 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 33 | 4438 | ja | Bahn + Kfz/Fussgaenger |
| 34 | 4746 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 35 | 5025 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 36 | 5102 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 37 | 5191 | ja | Bahn + Kfz/Fussgaenger |
| 38 | 5222 | ja | Bahn + Kfz/Fussgaenger |
| 39 | 5312 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 40 | 5426 | ja | Bahn + Kfz/Fussgaenger |
| 41 | 5513 | ja | Bahn + Kfz/Fussgaenger |
| 42 | 5737 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 43 | 5927 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 44 | 6213 | ja | Bahn + Kfz/Fussgaenger |
| 45 | 6421 | ja | Bahn + Kfz/Fussgaenger |
| 46 | 6546 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 47 | 7444 | ja | Bahn + Kfz/Fussgaenger |
| 48 | 7616 | ja | Bahn + Kfz/Fussgaenger |
| 49 | 7845 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 50 | 8236 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 51 | 8333 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 52 | 8383 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 53 | 8468 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 54 | 8527 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 55 | 8572 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 56 | 8665 | ja | Bahn + Kfz/Fussgaenger |
| 57 | 8766 | ja | Bahn + Kfz/Fussgaenger |
| 58 | 8849 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 59 | 8991 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 60 | 9440 | ja | Bahn + Kfz/Fussgaenger |
| 61 | 9472 | ja | Bahn + Kfz/Fussgaenger |
| 62 | 9523 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 63 | 9560 | ja | Bahn + Kfz/Fussgaenger |
| 64 | 9589 | ja | Bahn + Kfz/Fussgaenger |
| 65 | 9831 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 66 | 10422 | ja | Bahn + Kfz/Fussgaenger |
| 67 | 10508 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 68 | 10598 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 69 | 11153 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 70 | 11255 | ja | Bahn + Kfz/Fussgaenger |
| 71 | 11298 | ja | Bahn + Kfz/Fussgaenger |
| 72 | 11368 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 73 | 11619 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |


## Linie 11

### Haltestellenlage (34)

| # | Haltestelle | s | Lage laut Karte | Abstand links | Abstand rechts |
|---|---|---|---|---|---|
| 1 | Bühlau, Ullersdorfer Platz | 0 | zwischen den Spuren (Mittelinsel) | 2.9 m | 2.8 m |
| 2 | Grundstraße | 404 | am Fahrbahnrand | 1.5 m | - m |
| 3 | Hegereiterstraße | 725 | am Fahrbahnrand | 5.1 m | 14.2 m |
| 4 | Schwimmhalle Bühlau | 1097 | am Fahrbahnrand | 5.4 m | - m |
| 5 | Am Weißen Adler | 1596 | am Fahrbahnrand | 4.0 m | - m |
| 6 | Plattleite | 2350 | am Fahrbahnrand | 1.5 m | - m |
| 7 | Mordgrundbrücke | 3136 | am Fahrbahnrand | 2.9 m | - m |
| 8 | Elbschlösser | 4065 | neben der Fahrbahn (eigener Bahnkoerper) | 13.6 m | - m |
| 9 | Wilhelminenstraße | 4752 | zwischen den Spuren (Mittelinsel) | 7.3 m | 6.9 m |
| 10 | Angelikastraße (Gedenkstätte Bautzner Straße) | 5016 | zwischen den Spuren (Mittelinsel) | 3.5 m | 6.8 m |
| 11 | Waldschlößchen | 5558 | am Fahrbahnrand | 2.6 m | 13.9 m |
| 12 | Nordstraße | 6098 | neben der Fahrbahn (eigener Bahnkoerper) | 14.6 m | 20.3 m |
| 13 | Diakonissenkrankenhaus | 6722 | am Fahrbahnrand | 4.9 m | 20.2 m |
| 14 | Pulsnitzer Straße | 7001 | neben der Fahrbahn (eigener Bahnkoerper) | 12.7 m | - m |
| 15 | Bautzner Straße / Rothenburger Straße | 7365 | neben der Fahrbahn (eigener Bahnkoerper) | 14.6 m | 12.1 m |
| 16 | Albertplatz (Erich-Kästner-Museum) | 7702 | zwischen den Spuren (Mittelinsel) | 8.1 m | 7.4 m |
| 17 | Rosa-Luxemburg-Platz | 8322 | am Fahrbahnrand | 6.9 m | 15.8 m |
| 18 | Albertplatz (Antonstraße) | 9178 | am Fahrbahnrand | - m | 4.7 m |
| 19 | Bahnhof Neustadt | 9418 | am Fahrbahnrand | 7.1 m | 12.5 m |
| 20 | Antonstraße / Leipziger Straße | 9858 | am Fahrbahnrand | 5.7 m | 13.9 m |
| 21 | Kongresszentrum (Haus der Presse) | 10637 | am Fahrbahnrand | 6.3 m | 12.0 m |
| 22 | Bahnhof Mitte / Könneritzstraße | 11046 | neben der Fahrbahn (eigener Bahnkoerper) | 14.6 m | 12.3 m |
| 23 | Schweriner Straße (Hochschule für Musik) | 11503 | am Fahrbahnrand | - m | 5.0 m |
| 24 | Postplatz | 12152 | neben der Fahrbahn (eigener Bahnkoerper) | 13.1 m | 12.2 m |
| 25 | Prager Straße | 12954 | neben der Fahrbahn (eigener Bahnkoerper) | 20.5 m | 17.2 m |
| 26 | Walpurgisstraße | 13602 | neben der Fahrbahn (eigener Bahnkoerper) | 11.6 m | 9.7 m |
| 27 | Hauptbahnhof Nord | 13932 | neben der Fahrbahn (eigener Bahnkoerper) | 17.2 m | 9.1 m |
| 28 | Hauptbahnhof | 14155 | zwischen den Spuren (Mittelinsel) | 5.6 m | 7.1 m |
| 29 | Gret-Palucca-Straße | 14624 | am Fahrbahnrand | 2.0 m | 9.6 m |
| 30 | Lennéplatz | 15138 | am Fahrbahnrand | 12.2 m | 7.6 m |
| 31 | Strehlener Platz | 15895 | neben der Fahrbahn (eigener Bahnkoerper) | 11.1 m | 11.1 m |
| 32 | Zellescher Weg | 16487 | am Fahrbahnrand | 9.0 m | 6.9 m |
| 33 | Räcknitzhöhe | 17072 | zwischen den Spuren (Mittelinsel) | 8.1 m | 7.6 m |
| 34 | Zschertnitz, Münzmeisterstraße | 17685 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 14.7 m |

### Eingleisig / zweigleisig

keine eingleisigen Abschnitte.

Laut OSM eingleisig, im Spiel nicht als Engstelle gefuehrt (kuerzer als 120 m oder im Endbereich):

| von | bis | Laenge |
|---|---|---|
| 17529.8 | 17598.3 | 68.5 m |

Zweigleisig: 1 Abschnitte, davon 17566 m Strecke gesamt.

### Bahn/Kfz- und Bahn/Fussgaenger-Kreuzungen (140)

| # | s | Ampel | Fuer wen |
|---|---|---|---|
| 1 | 109 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 2 | 159 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 3 | 233 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 4 | 293 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 5 | 339 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 6 | 442 | ja | Bahn + Kfz/Fussgaenger |
| 7 | 506 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 8 | 619 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 9 | 691 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 10 | 881 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 11 | 962 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 12 | 1036 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 13 | 1078 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 14 | 1133 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 15 | 1161 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 16 | 1214 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 17 | 1264 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 18 | 1438 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 19 | 1508 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 20 | 1621 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 21 | 1760 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 22 | 2044 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 23 | 2124 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 24 | 2173 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 25 | 2242 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 26 | 2309 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 27 | 2388 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 28 | 2427 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 29 | 3034 | ja | Bahn + Kfz/Fussgaenger |
| 30 | 3826 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 31 | 3916 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 32 | 4253 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 33 | 4354 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 34 | 4646 | ja | Bahn + Kfz/Fussgaenger |
| 35 | 4683 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 36 | 4713 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 37 | 4811 | ja | Bahn + Kfz/Fussgaenger |
| 38 | 4876 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 39 | 4917 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 40 | 4987 | ja | Bahn + Kfz/Fussgaenger |
| 41 | 5197 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 42 | 5236 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 43 | 5355 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 44 | 5415 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 45 | 5639 | ja | Bahn + Kfz/Fussgaenger |
| 46 | 5803 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 47 | 5940 | ja | Bahn + Kfz/Fussgaenger |
| 48 | 6027 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 49 | 6080 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 50 | 6158 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 51 | 6188 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 52 | 6298 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 53 | 6392 | ja | Bahn + Kfz/Fussgaenger |
| 54 | 6445 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 55 | 6482 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 56 | 6549 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 57 | 6594 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 58 | 6640 | ja | Bahn + Kfz/Fussgaenger |
| 59 | 6683 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 60 | 6768 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 61 | 6809 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 62 | 6888 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 63 | 7047 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 64 | 7224 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 65 | 7311 | ja | Bahn + Kfz/Fussgaenger |
| 66 | 7432 | ja | Bahn + Kfz/Fussgaenger |
| 67 | 7483 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 68 | 7676 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 69 | 8109 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 70 | 8208 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 71 | 8309 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 72 | 8915 | ja | Bahn + Kfz/Fussgaenger |
| 73 | 9040 | ja | Bahn + Kfz/Fussgaenger |
| 74 | 9141 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 75 | 9220 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 76 | 9308 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 77 | 9342 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 78 | 9450 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 79 | 9520 | ja | Bahn + Kfz/Fussgaenger |
| 80 | 9577 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 81 | 9674 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 82 | 9756 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 83 | 9812 | ja | Bahn + Kfz/Fussgaenger |
| 84 | 9953 | ja | Bahn + Kfz/Fussgaenger |
| 85 | 10522 | ja | Bahn + Kfz/Fussgaenger |
| 86 | 10735 | ja | Bahn + Kfz/Fussgaenger |
| 87 | 10863 | ja | Bahn + Kfz/Fussgaenger |
| 88 | 11144 | ja | Bahn + Kfz/Fussgaenger |
| 89 | 11270 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 90 | 11337 | ja | Bahn + Kfz/Fussgaenger |
| 91 | 11576 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 92 | 11632 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 93 | 11684 | ja | Bahn + Kfz/Fussgaenger |
| 94 | 11792 | ja | Bahn + Kfz/Fussgaenger |
| 95 | 11822 | ja | Bahn + Kfz/Fussgaenger |
| 96 | 11896 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 97 | 12019 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 98 | 12102 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 99 | 12370 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 100 | 12610 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 101 | 12656 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 102 | 12797 | ja | Bahn + Kfz/Fussgaenger |
| 103 | 13018 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 104 | 13095 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 105 | 13198 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 106 | 13260 | ja | Bahn + Kfz/Fussgaenger |
| 107 | 13569 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 108 | 13848 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 109 | 13924 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 110 | 14013 | ja | Bahn + Kfz/Fussgaenger |
| 111 | 14044 | ja | Bahn + Kfz/Fussgaenger |
| 112 | 14134 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 113 | 14248 | ja | Bahn + Kfz/Fussgaenger |
| 114 | 14342 | ja | Bahn + Kfz/Fussgaenger |
| 115 | 14563 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 116 | 14748 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 117 | 15036 | ja | Bahn + Kfz/Fussgaenger |
| 118 | 15403 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 119 | 15432 | ja | Bahn + Kfz/Fussgaenger |
| 120 | 15482 | ja | Bahn + Kfz/Fussgaenger |
| 121 | 15528 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 122 | 15863 | ja | Bahn + Kfz/Fussgaenger |
| 123 | 15908 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 124 | 15960 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 125 | 16035 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 126 | 16073 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 127 | 16372 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 128 | 16404 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 129 | 16451 | ja | Bahn + Kfz/Fussgaenger |
| 130 | 16481 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 131 | 16643 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 132 | 16732 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 133 | 16948 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 134 | 17034 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 135 | 17128 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 136 | 17165 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 137 | 17198 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 138 | 17276 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 139 | 17308 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 140 | 17486 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |


## Linie 12

### Haltestellenlage (36)

| # | Haltestelle | s | Lage laut Karte | Abstand links | Abstand rechts |
|---|---|---|---|---|---|
| 1 | Leutewitz | 0 | am Fahrbahnrand | 0.5 m | 21.7 m |
| 2 | Cotta, Gottfried-Keller-Straße | 582 | am Fahrbahnrand | 5.7 m | - m |
| 3 | Cossebauder Straße | 788 | am Fahrbahnrand | 1.4 m | - m |
| 4 | Ockerwitzer Straße | 1141 | am Fahrbahnrand | 2.7 m | - m |
| 5 | Altcotta | 1607 | am Fahrbahnrand | 2.4 m | - m |
| 6 | Birkenhainer Straße | 2037 | am Fahrbahnrand | 5.2 m | - m |
| 7 | Pennricher Straße | 2496 | am Fahrbahnrand | 4.8 m | 21.7 m |
| 8 | Conertplatz | 2845 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 21.9 m |
| 9 | Neuer Annenfriedhof | 3162 | zwischen den Spuren (Mittelinsel) | 8.3 m | 5.0 m |
| 10 | Bünaustraße | 3432 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 10.1 m |
| 11 | Löbtau, Tharandter Straße | 3779 | neben der Fahrbahn (eigener Bahnkoerper) | 17.9 m | - m |
| 12 | Oederaner Straße | 4289 | neben der Fahrbahn (eigener Bahnkoerper) | 23.3 m | 11.9 m |
| 13 | Florastraße | 4971 | am Fahrbahnrand | - m | 8.1 m |
| 14 | S-Bahnhof Freiberger Straße | 5273 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 15 | Budapester Straße | 5926 | neben der Fahrbahn (eigener Bahnkoerper) | 16.8 m | 14.0 m |
| 16 | Hauptbahnhof | 6556 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 20.1 m |
| 17 | Hauptbahnhof Nord | 6750 | am Fahrbahnrand | 3.8 m | 16.0 m |
| 18 | Walpurgisstraße | 7108 | neben der Fahrbahn (eigener Bahnkoerper) | 13.9 m | 15.7 m |
| 19 | Prager Straße | 7739 | zwischen den Spuren (Mittelinsel) | 7.6 m | 6.3 m |
| 20 | Pirnaischer Platz (Stadtmuseum) | 8240 | am Fahrbahnrand | 4.5 m | 22.6 m |
| 21 | Deutsches Hygiene-Museum | 8772 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 22 | Straßburger Platz (Gläserne Manufaktur) | 9168 | neben der Fahrbahn (eigener Bahnkoerper) | 13.9 m | 12.9 m |
| 23 | Krankenhaus St. Joseph-Stift | 9900 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 24 | Fetscherplatz | 10435 | zwischen den Spuren (Mittelinsel) | 3.6 m | 6.8 m |
| 25 | Gabelsbergerstraße | 10885 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 26 | Blasewitzer Straße / Fetscherstraße | 11262 | neben der Fahrbahn (eigener Bahnkoerper) | 9.7 m | - m |
| 27 | Augsburger Straße (Universitätsklinikum) | 11628 | neben der Fahrbahn (eigener Bahnkoerper) | 16.3 m | - m |
| 28 | Königsheimplatz | 11948 | am Fahrbahnrand | 6.0 m | - m |
| 29 | Lene-Glatzer-Straße | 12321 | neben der Fahrbahn (eigener Bahnkoerper) | 15.6 m | - m |
| 30 | Prellerstraße | 12792 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 31 | Blasewitz, Schillerplatz | 13234 | am Fahrbahnrand | 1.8 m | - m |
| 32 | Jüngststraße | 13774 | am Fahrbahnrand | 7.4 m | 23.0 m |
| 33 | Heinrich-Schütz-Straße | 14184 | neben der Fahrbahn (eigener Bahnkoerper) | 9.9 m | - m |
| 34 | Gustav-Freytag-Straße | 14703 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 35 | Striesen, Ludwig-Hartmann-Straße | 15215 | am Fahrbahnrand | 5.2 m | - m |
| 36 | Striesen, Emanuel-Goldberg-Platz | 15481 | am Fahrbahnrand | 6.6 m | - m |

### Eingleisig / zweigleisig

keine eingleisigen Abschnitte.

Zweigleisig: 1 Abschnitte, davon 15360 m Strecke gesamt.

### Bahn/Kfz- und Bahn/Fussgaenger-Kreuzungen (129)

| # | s | Ampel | Fuer wen |
|---|---|---|---|
| 1 | 115 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 2 | 153 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 3 | 401 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 4 | 535 | ja | Bahn + Kfz/Fussgaenger |
| 5 | 646 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 6 | 762 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 7 | 838 | ja | Bahn + Kfz/Fussgaenger |
| 8 | 948 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 9 | 1055 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 10 | 1113 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 11 | 1242 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 12 | 1348 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 13 | 1407 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 14 | 1454 | ja | Bahn + Kfz/Fussgaenger |
| 15 | 1507 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 16 | 1555 | ja | Bahn + Kfz/Fussgaenger |
| 17 | 1599 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 18 | 1717 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 19 | 1911 | ja | Bahn + Kfz/Fussgaenger |
| 20 | 1981 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 21 | 2083 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 22 | 2136 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 23 | 2170 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 24 | 2259 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 25 | 2355 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 26 | 2434 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 27 | 2517 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 28 | 2622 | ja | Bahn + Kfz/Fussgaenger |
| 29 | 2666 | ja | Bahn + Kfz/Fussgaenger |
| 30 | 2721 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 31 | 3076 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 32 | 3105 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 33 | 3166 | ja | Bahn + Kfz/Fussgaenger |
| 34 | 3198 | ja | Bahn + Kfz/Fussgaenger |
| 35 | 3253 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 36 | 3281 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 37 | 3398 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 38 | 3582 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 39 | 3660 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 40 | 3760 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 41 | 3900 | ja | Bahn + Kfz/Fussgaenger |
| 42 | 3957 | ja | Bahn + Kfz/Fussgaenger |
| 43 | 3987 | ja | Bahn + Kfz/Fussgaenger |
| 44 | 4067 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 45 | 4179 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 46 | 4267 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 47 | 4362 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 48 | 4461 | ja | Bahn + Kfz/Fussgaenger |
| 49 | 4598 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 50 | 4674 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 51 | 4831 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 52 | 4945 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 53 | 5052 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 54 | 5210 | ja | Bahn + Kfz/Fussgaenger |
| 55 | 5893 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 56 | 5938 | ja | Bahn + Kfz/Fussgaenger |
| 57 | 5967 | ja | Bahn + Kfz/Fussgaenger |
| 58 | 6402 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 59 | 6446 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 60 | 6618 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 61 | 6723 | ja | Bahn + Kfz/Fussgaenger |
| 62 | 6753 | ja | Bahn + Kfz/Fussgaenger |
| 63 | 6844 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 64 | 6920 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 65 | 7191 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 66 | 7494 | ja | Bahn + Kfz/Fussgaenger |
| 67 | 7669 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 68 | 7878 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 69 | 8010 | ja | Bahn + Kfz/Fussgaenger |
| 70 | 8064 | ja | Bahn + Kfz/Fussgaenger |
| 71 | 8094 | ja | Bahn + Kfz/Fussgaenger |
| 72 | 8174 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 73 | 8366 | ja | Bahn + Kfz/Fussgaenger |
| 74 | 9196 | ja | Bahn + Kfz/Fussgaenger |
| 75 | 9282 | ja | Bahn + Kfz/Fussgaenger |
| 76 | 9455 | ja | Bahn + Kfz/Fussgaenger |
| 77 | 9684 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 78 | 10074 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 79 | 10172 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 80 | 10222 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 81 | 10306 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 82 | 10365 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 83 | 10410 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 84 | 10505 | ja | Bahn + Kfz/Fussgaenger |
| 85 | 10559 | ja | Bahn + Kfz/Fussgaenger |
| 86 | 11222 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 87 | 11332 | ja | Bahn + Kfz/Fussgaenger |
| 88 | 11409 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 89 | 11969 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 90 | 12032 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 91 | 12082 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 92 | 12126 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 93 | 12234 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 94 | 12276 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 95 | 12305 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 96 | 12372 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 97 | 12514 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 98 | 12550 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 99 | 12990 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 100 | 13089 | ja | Bahn + Kfz/Fussgaenger |
| 101 | 13119 | ja | Bahn + Kfz/Fussgaenger |
| 102 | 13149 | ja | Bahn + Kfz/Fussgaenger |
| 103 | 13195 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 104 | 13262 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 105 | 13349 | ja | Bahn + Kfz/Fussgaenger |
| 106 | 13400 | ja | Bahn + Kfz/Fussgaenger |
| 107 | 13442 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 108 | 13575 | ja | Bahn + Kfz/Fussgaenger |
| 109 | 13642 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 110 | 13680 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 111 | 13747 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 112 | 13828 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 113 | 13917 | ja | Bahn + Kfz/Fussgaenger |
| 114 | 13992 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 115 | 14066 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 116 | 14141 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 117 | 14214 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 118 | 14250 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 119 | 14332 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 120 | 14372 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 121 | 14431 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 122 | 14534 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 123 | 14849 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 124 | 14929 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 125 | 15003 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 126 | 15086 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 127 | 15186 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 128 | 15263 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 129 | 15402 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |


## Linie 13

### Haltestellenlage (44)

| # | Haltestelle | s | Lage laut Karte | Abstand links | Abstand rechts |
|---|---|---|---|---|---|
| 1 | Prohlis, Gleisschleife | 0 | neben der Fahrbahn (eigener Bahnkoerper) | 17.1 m | - m |
| 2 | Georg-Palitzsch-Straße | 380 | neben der Fahrbahn (eigener Bahnkoerper) | 17.2 m | 21.0 m |
| 3 | Jacob-Winter-Platz (Prohlis-Zentrum) | 776 | neben der Fahrbahn (eigener Bahnkoerper) | 15.1 m | - m |
| 4 | Albert-Wolf-Platz | 1160 | neben der Fahrbahn (eigener Bahnkoerper) | 13.2 m | - m |
| 5 | S-Bahnhof Dobritz | 1777 | am Fahrbahnrand | 11.2 m | 3.1 m |
| 6 | Breitscheidstraße | 2117 | neben der Fahrbahn (eigener Bahnkoerper) | 11.0 m | 14.7 m |
| 7 | Abzweig nach Reick | 2450 | neben der Fahrbahn (eigener Bahnkoerper) | 20.8 m | 16.1 m |
| 8 | Lassallestraße | 3123 | zwischen den Spuren (Mittelinsel) | 3.6 m | 6.8 m |
| 9 | Prof.-Ricker-Straße | 3447 | am Fahrbahnrand | 10.0 m | 5.2 m |
| 10 | Marienberger Straße | 3792 | am Fahrbahnrand | 9.6 m | 8.3 m |
| 11 | Rennplatzstraße | 4191 | am Fahrbahnrand | 9.7 m | 7.1 m |
| 12 | Rauensteinstraße | 4658 | am Fahrbahnrand | 11.6 m | 7.2 m |
| 13 | Liebstädter Straße | 5077 | neben der Fahrbahn (eigener Bahnkoerper) | 13.8 m | 9.8 m |
| 14 | Zwinglistraße | 5804 | neben der Fahrbahn (eigener Bahnkoerper) | 11.3 m | 12.2 m |
| 15 | Karcherallee | 6402 | neben der Fahrbahn (eigener Bahnkoerper) | 19.5 m | 15.6 m |
| 16 | Lipsiusstraße | 6902 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 12.5 m |
| 17 | Comeniusplatz | 7244 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 12.3 m |
| 18 | Straßburger Platz (Gläserne Manufaktur) | 8270 | neben der Fahrbahn (eigener Bahnkoerper) | 14.4 m | 20.2 m |
| 19 | Deutsches Hygiene-Museum | 8726 | neben der Fahrbahn (eigener Bahnkoerper) | 14.1 m | - m |
| 20 | Pirnaischer Platz (Stadtmuseum) | 9259 | neben der Fahrbahn (eigener Bahnkoerper) | 10.2 m | 17.1 m |
| 21 | Altmarkt | 9586 | am Fahrbahnrand | 5.4 m | 11.0 m |
| 22 | Postplatz | 9856 | neben der Fahrbahn (eigener Bahnkoerper) | 13.6 m | 12.6 m |
| 23 | Postplatz (Zwinger) | 10062 | zwischen den Spuren (Mittelinsel) | 2.0 m | 5.2 m |
| 24 | Theaterplatz | 10291 | am Fahrbahnrand | 4.3 m | 15.9 m |
| 25 | Neustädter Markt (Goldener Reiter) | 10942 | am Fahrbahnrand | 6.6 m | - m |
| 26 | Carolaplatz (Regierungsviertel) | 11348 | neben der Fahrbahn (eigener Bahnkoerper) | 20.0 m | 13.6 m |
| 27 | Albertplatz (Erich-Kästner-Museum) | 11909 | am Fahrbahnrand | - m | 3.5 m |
| 28 | Bautzner Straße / Rothenburger Straße | 12406 | am Fahrbahnrand | 7.4 m | - m |
| 29 | Rosa-Luxemburg-Platz | 12754 | am Fahrbahnrand | 6.2 m | 16.8 m |
| 30 | Sachsenallee | 13364 | neben der Fahrbahn (eigener Bahnkoerper) | 13.4 m | 15.7 m |
| 31 | Albertplatz (Antonstraße) | 16071 | am Fahrbahnrand | - m | 3.9 m |
| 32 | Bahnhof Neustadt | 16311 | am Fahrbahnrand | 7.2 m | 12.2 m |
| 33 | Alter Schlachthof | 17367 | neben der Fahrbahn (eigener Bahnkoerper) | 10.7 m | - m |
| 34 | Alexander-Puschkin-Platz | 17727 | am Fahrbahnrand | 1.6 m | - m |
| 35 | Oschatzer Straße | 18270 | am Fahrbahnrand | 8.2 m | - m |
| 36 | Altpieschen | 18774 | am Fahrbahnrand | 6.2 m | 10.7 m |
| 37 | Mickten | 19166 | zwischen den Spuren (Mittelinsel) | 6.1 m | 5.3 m |
| 38 | Trachauer Straße | 19894 | am Fahrbahnrand | - m | 2.4 m |
| 39 | Brockwitzer Straße | 20252 | neben der Fahrbahn (eigener Bahnkoerper) | - m | 15.4 m |
| 40 | An der Flutrinne | 20560 | am Fahrbahnrand | 8.9 m | 10.3 m |
| 41 | Sörnewitzer Straße | 20916 | neben der Fahrbahn (eigener Bahnkoerper) | - m | - m |
| 42 | Elbepark | 21247 | am Fahrbahnrand | 11.2 m | 5.8 m |
| 43 | Washingtonstraße | 21585 | am Fahrbahnrand | 12.2 m | 7.2 m |
| 44 | Kaditz, Riegelplatz | 21895 | am Fahrbahnrand | 22.7 m | 7.7 m |

### Eingleisig / zweigleisig

| von | bis | Laenge |
|---|---|---|
| 6458 | 7306 | 848 m |
| 7382 | 7842 | 460 m |

Zweigleisig: 3 Abschnitte, davon 20465 m Strecke gesamt.

### Bahn/Kfz- und Bahn/Fussgaenger-Kreuzungen (134)

| # | s | Ampel | Fuer wen |
|---|---|---|---|
| 1 | 396 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 2 | 744 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 3 | 856 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 4 | 1282 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 5 | 1647 | ja | Bahn + Kfz/Fussgaenger |
| 6 | 1751 | ja | Bahn + Kfz/Fussgaenger |
| 7 | 2083 | ja | Bahn + Kfz/Fussgaenger |
| 8 | 2430 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 9 | 2541 | ja | Bahn + Kfz/Fussgaenger |
| 10 | 2698 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 11 | 2774 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 12 | 3021 | ja | Bahn + Kfz/Fussgaenger |
| 13 | 3053 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 14 | 3094 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 15 | 3168 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 16 | 3209 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 17 | 3240 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 18 | 3331 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 19 | 3399 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 20 | 3445 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 21 | 3496 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 22 | 3532 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 23 | 3634 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 24 | 4045 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 25 | 4089 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 26 | 4281 | ja | Bahn + Kfz/Fussgaenger |
| 27 | 4778 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 28 | 4884 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 29 | 4934 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 30 | 5171 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 31 | 5207 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 32 | 5283 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 33 | 5447 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 34 | 5489 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 35 | 5598 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 36 | 5675 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 37 | 5722 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 38 | 5761 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 39 | 5887 | ja | Bahn + Kfz/Fussgaenger |
| 40 | 6369 | ja | Bahn + Kfz/Fussgaenger |
| 41 | 7766 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 42 | 7834 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 43 | 8295 | ja | Bahn + Kfz/Fussgaenger |
| 44 | 8384 | ja | Bahn + Kfz/Fussgaenger |
| 45 | 9212 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 46 | 9608 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 47 | 9640 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 48 | 9670 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 49 | 9703 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 50 | 9976 | ja | Bahn + Kfz/Fussgaenger |
| 51 | 10006 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 52 | 10036 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 53 | 10072 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 54 | 10140 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 55 | 10217 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 56 | 10275 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 57 | 10346 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 58 | 10376 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 59 | 10426 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 60 | 10507 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 61 | 10549 | ja | Bahn + Kfz/Fussgaenger |
| 62 | 10996 | ja | Bahn + Kfz/Fussgaenger |
| 63 | 11157 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 64 | 11216 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 65 | 11759 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 66 | 11831 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 67 | 11864 | ja | Bahn + Kfz/Fussgaenger |
| 68 | 12006 | ja | Bahn + Kfz/Fussgaenger |
| 69 | 12036 | ja | Bahn + Kfz/Fussgaenger |
| 70 | 12161 | ja | Bahn + Kfz/Fussgaenger |
| 71 | 12369 | ja | Bahn + Kfz/Fussgaenger |
| 72 | 12639 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 73 | 12739 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 74 | 13308 | ja | Bahn + Kfz/Fussgaenger |
| 75 | 14376 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 76 | 14569 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 77 | 15937 | ja | Bahn + Kfz/Fussgaenger |
| 78 | 16033 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 79 | 16112 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 80 | 16201 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 81 | 16235 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 82 | 16343 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 83 | 16403 | ja | Bahn + Kfz/Fussgaenger |
| 84 | 16472 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 85 | 16568 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 86 | 16651 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 87 | 16685 | ja | Bahn + Kfz/Fussgaenger |
| 88 | 16751 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 89 | 16948 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 90 | 17006 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 91 | 17040 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 92 | 17127 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 93 | 17310 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 94 | 17431 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 95 | 17487 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 96 | 17532 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 97 | 17560 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 98 | 17625 | ja | Bahn + Kfz/Fussgaenger |
| 99 | 17659 | ja | Bahn + Kfz/Fussgaenger |
| 100 | 17690 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 101 | 17879 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 102 | 17907 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 103 | 17940 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 104 | 17984 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 105 | 18093 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 106 | 18213 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 107 | 18319 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 108 | 18398 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 109 | 18569 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 110 | 18607 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 111 | 18643 | ja | Bahn + Kfz/Fussgaenger |
| 112 | 18683 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 113 | 18834 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 114 | 18901 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 115 | 18939 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 116 | 19021 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 117 | 19090 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 118 | 19130 | ja | Bahn + Kfz/Fussgaenger |
| 119 | 19170 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 120 | 19302 | ja | Bahn + Kfz/Fussgaenger |
| 121 | 19396 | ja | Bahn + Kfz/Fussgaenger |
| 122 | 19600 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 123 | 19893 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 124 | 19948 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 125 | 20075 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 126 | 20144 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 127 | 20344 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 128 | 20426 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 129 | 20502 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 130 | 20647 | ja | Bahn + Kfz/Fussgaenger |
| 131 | 20751 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 132 | 21071 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 133 | 21178 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
| 134 | 21816 | nein (Vorrang Bahn) | Bahn hat Vorrang, Querverkehr wartet |
