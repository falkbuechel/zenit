# Zenit – Entwicklungslog

Neueste Einträge oben. Hier stehen Änderungen, Fehler und Lösungen sowie offene Ideen. Stabile Referenz (Aufbau, Datenformen) steht in `DEVELOPMENT.md`.

## 2026-10-27 Farben: Zenit-Oliv statt Mint, Grautöne mit Oliv-Stich
- Falk: Grautöne zu Standard, Grün soll kräftiges entsättigtes Military-Grün sein, andere Farben kräftig, nicht bunt.
- Dunkel: Grund/Flächen oliv-anthrazit (`--bg #0e0f0c` … `--line #373c2d`), Tinte warmweiß, `--ac #9db36a`. Hell: Sand-Grau (`--bg #ebebe3`), `--ac #556b26`. Gruppenfarben (`--g-*`) von Tailwind-Tönen auf eine abgestimmte, etwas entsättigte Reihe; gold/danger/flame angepasst. Stufenfarben (`--t*`) unverändert (Dopamin).
- Maskottchen in Oliv (Verlauf `#b9cc8c` → `#5f7236`), `theme-color` in build.py und Manifest `#0e0f0c`, Wochenziel-Effekt in `09-training.js` mit neuen Farben.
- Offen: App-Icon (public/, `tools/make-icons.js`) ist noch mintgrün.

## 2026-10-27 Look beruhigt: Tastenkante statt Versatz-Schatten, Stencil nur als Akzent, Balken wieder glatt
- Falk: an manchen Stellen zu tief und kindisch, Skalenbalken gefallen nicht mehr. Glanz auf Balken und Hauptknopf bleibt (Fokus, Dopamin).
- `--hs` = feine Kante nach unten (dunkel `0 2px 0` schwarz 55 %, hell Tinte 22 %), beim Drücken `translateY(2px)` ohne Kante.
- `--f-display` wieder Big Shoulders Display; neu `--f-stencil` nur für Seitentitel (`.fd-h h2`, `.pt-h h2`), kcal in der Bilanz, Level, Tagesname Heute, Arena-Zahl, Level-up. Beide Schriften im Link in `src/index.html`.
- Segmente (`--n`) überall entfernt, Spuren wieder `var(--s3)`.

## 2026-10-27 Beste Labor-Details ins Standard-Design übernommen, Demo-Schalter entfernt
- Falk: Grund (Raster, Körnung), Warnstreifen, Flackern, Dopamin-Teile (Streifen, Achtecke, Schrägecken, Nummern) nein. Ecken mittlerer Weg. Kennungen nur, wo sie etwas sagen. „Brutal“ meinte er eigentlich als Effekte/Funken, kommt später.
- Schrift: `--f-display` = Big Shoulders Stencil Display (gleiche Maße, in `src/index.html` statt Big Shoulders Display).
- Ecken: Radius-Tokens neu belegt (Karten 10, Knöpfe/Felder 8, Chips/Pillen 6, Bühne 12; Kreise bleiben).
- Harter Versatz-Schatten `--hs` (dunkel 3 px schwarz, hell 2 px dunkelgrün) nur für Antippbares (`.btn`, `.sb`, `.seg2`/`.swl`/`.swg`-Knöpfe, `.fti`, `.fcpi`, `.fmc`); beim Drücken sinkt es hinein (`translate(2px, 2px)`, Schatten weg). Reine Anzeigen bleiben flach.
- Gewählt = Tinte (`--ink` Fläche, `--bg` Text) bei `.seg`, `.seg2`, `.fchip`, `.eqs` statt Grünfüllung. Überschriften ohne `small` mit Linie bis zum Rand.
- Skalen: leere Spur in `--n` Segmenten (Standard 10), Füllung glatt. Makros 5, Wasser 1 Segment = 250 ml (`--n` im Render), Trainingsfortschritt Heute = Anzahl Übungen.
- Fokus Essen: Bilanz mit dünner Leuchtkante, glimmt beim Einstieg einmal weich auf (`fglow`). Fokus Heute: Kennung = Zustand (`data-tag`: Bereit/Läuft/Erledigt/Ruht) und Scan-Streifen alle 7 s (nicht in Ruhe, nicht bei reduzierter Bewegung).
- `85-design.css`, Schalter und `designSet` entfernt; alter Wert `zenit.design` wird beim Start gelöscht (Zeile kann später raus).

## 2026-10-27 Design-Demo „Labor“ (ersetzt „Kante“)
- Falk zu „Kante“: nur anderer Look, gleicher Stil und gleiche Farben, wirkt wie Standard-AI-Schwarz. Wunsch: Anordnung und feste Farben (Nährwerte, Stufen, Mahlzeiten) bleiben, Rest im Ideen-Theme „System-Labor, das das Maskottchen hochlevelt“, brutal, rough, dopamingeladen. Klappt es nicht, Einzelteile übernehmen; Falk gestaltet später UI-Elemente selbst, die nachgebaut werden.
- Zahnrad > „Design Labor (Demo)“ (`designSet`, localStorage `zenit.design`, `html[data-design="labor"]`, lädt Big Shoulders Stencil Display nach, setzt `theme-color`). Regeln nur in `src/css/85-design.css`: Beton-Schwarz mit Rasterpapier und Körnung (fixes `body::after`), Stencil für alle Display-Texte, harte schwarze Versatz-Schatten, Knöpfe sinken beim Drücken in den Schatten, Hauptknopf mit laufenden Streifen, Abschnitte nummeriert (01, 02 …), Marken mit abgeschnittenen Ecken, gewählt = weiß auf schwarz, Balken als Segment-Skala, Zuviel und Warnungen als Gefahrenstreifen, Griff im Fenster als Warnband, Toast als Terminal-Zeile.
- Fokus: Essen = Bilanz als Messgerät (Leuchtkante, Eckmarken, Kennung „MESSUNG // NAHRUNG“, flackerndes Hochfahren beim Einstieg); Heute = Versuchskammer (Raster, Glasglanz, Kennung „KAMMER 01 · PROBE ZENIT“, laufender Scan), Mitte der Leiste als Achteck, Level als goldenes Achteck.

## 2026-10-26 Design-Demo „Kante“ (verworfen)
- Erst „Kante“: dunkel, Ecken 2–4 px, flach, eine leuchtende Kante je Screen.
- Dafür alle Radien in `src/css` als Tokens (`--r8` … `--r999`, Name = Standardwert, in `:root`); Tab-Anzeige nutzt `var(--rmid, 50%)` / `var(--r16)`. Standard-Design pixelgleich (`compare.js`: Alles gleich).

## Stand 2026-10-26
- Zuletzt: Essen-Tab in 7 Runden umgebaut (alles live, Commit 436f160): Tagesleiste wischbar, Gegessen als Mahlzeit-Karten mit Stapeln, Nährwert-Icons/-Farben, Nährwert-Fenster mit Ring, Mengen-Fenster, Suche (Zuletzt/Kategorien/Schnell), Gerichte-Menü, Rechner im Profil.
- Falk testet am iPhone: letzte Runde (Bilanz-Kopf „offen“, Vorschlag auf Mahlzeit ziehen, leere Zeile, Suche mit Werten je 100 g, Gerichte-Menü mit Filter/„+“, Rechner im Profil, Wasser dunkler über 100 %).
- Offene Entscheidung: Gruppe per Wischen löschen hat kein Rückgängig – Rückgängig oder Rückfrage gewünscht?
- Offene Entscheidung: Skilltree – Dead Hang/Hollow nach außen rücken (kürzere Linien zu Backlever/Frontlever)?
- Nächster Schritt: Falks Rückmeldung zu Essen abarbeiten; danach Heute weiter umbauen (erst fragen, was am meisten stört, dann Varianten).
- Nicht committet: nichts.

## Offen / Ideen
- Falks Essen-Rückmeldung (2026-10-26): Wasser in Logik/Animation wie die anderen Balken; Gegessen: leere Platzhalter je fehlender Mahlzeit als Ziehziel (Frage: welche Uhrzeit beim Reinziehen?); Suche: je Kategorie die relevanten Nährwerte (z. B. Zucker bei Süßem), Kategorien standardmäßig offen, Kreuz geht eine Ebene zurück statt ganz zu schließen (auch Gerichte); Gerichte: Stift und Plus weg, Hinzufügen beim Öffnen oder per Wischen, Mahlzeit-Zeit entfernen oder mehrere hinzufügen
- iPhone-Test offen: Pause-Vollbild in der Arena, Skilltree (Linien, Leuchten, Info-Leiste)
- iPhone-Test offen Essen: Barcode-Scan quer, Marken-/Online-Suche (Open Food Facts de+world parallel), Wischen/Ziehen auf echtem Touch
- Essen: Open Food Facts schneller (Bedingungen im Verlauf „Open Food Facts besser einbinden“); Rückgängig beim Gruppen-Löschen
- Essen: eigenes Lebensmittel nur noch über „Marke fehlt“ oder unbekannten Barcode anlegbar – prüfen, ob ein Weg in der Suche fehlt
- Heute: weiterer Umbau der Startseite; Bergpfad-Belohnungen / Tages-Drops, Tagesaufgaben, Saison; Vorwoche-Vergleich ist aus Heute raus (neuen Platz finden)
- Serie: zu langweilig, beim Redesign aufwerten
- Maskottchen: echte Illustration mit Stufen (ComfyUI), ersetzt den SVG-Platzhalter `mascot()`
- Statistik-Detailansichten schlanker (Training sehr lang)
- Icons / Text reduzieren in Heute, Essen, Verlauf, Profil
- Weitere anstehende Termine im Kalender (z. B. Körpermaße monatlich, wie das Wiegen)
- Später: Deload-Wochen, Foto der Nährwerttabelle, Push-Erinnerungen, Schlaf, mehr Lebensmittel/Gerichte
- Ganz am Ende: Design und Illustrationen (ComfyUI-Assets, Karten-Schema zuerst)

## Verlauf

### 2026-10-26 – Essen: Kopf mit Fokus „offen“, Vorschläge auf Mahlzeit ziehen, Suche mit Schnell-Reiter, Gerichte-Menü, Rechner im Profil
- „Montag · Heute“ wieder da (ohne kcal-Zusatz). Bilanz-Kopf: gegessen, Ziel klein, rechts groß „offen“/„drüber“; Trainings-Zuschlag-Chip und Ziel-Symbol entfernt.
- Rechner: Rechner-Icon, Knopf im Profil (`.pid-a`, 6 Spalten, `data-fgoal`), kompakter (Sheet-Klasse `fp`, kleinere Abstände).
- Wasser über 100 % deutlich dunkler.
- Gegessen leer: Platzhalter passen in die Breite (`.fchips.fem`), kein Wischen. Vorschlag hochziehen folgt dem Finger; über einer Mahlzeit (Karte, Platzhalter, Gruppe) wird sie markiert (`.drop`) und der Eintrag bekommt diese Mahlzeit (`ui.fdmk` → `foodPush`), sonst nach Uhrzeit.
- Suche: Zuletzt nur 6; Kategorien alphabetisch in zwei Spalten (+ „Eigene“, wenn vorhanden); dritter Reiter „Schnell“ mit dem Schnell-Formular im Fenster (`quickHtml`, auch für `openQuick`). Zeilen: kleine Werte je 100 g (Protein/Fett/Kohlenhydrate in festen Spalten, `.f100`), rechts kcal und „1 Einheit“. `.fsi em`-Regeln nur noch für direkte Kinder (hängten sonst „kcal“ an).
- Gerichte-Menü (`openDishes`/`dishesHtml`): Filter nach meist gegessener Mahlzeit (`ui.dmf`), Karten mit „+“ = 1 Portion sofort eintragen (`data-fdq`), Stift = bearbeiten, „Neues Gericht“ unten. Editor: Kopie anlegen (`data-ddup`).

### 2026-10-26 – Essen: ohne Überschrift, Gruppen löschen, „Meins“ in der Suche, Gerichte mit Farbe, Rechner neu
- Essen-Seite ohne „Essen“-Überschrift und ohne „Montag · Heute“-Zeile; Ziele/Rechner über das Ziel-Symbol (`.fgo`) hinter „/ kcal“ in der Bilanz (data-fgoal wird vor data-fnut geprüft).
- Offenen Tab erneut antippen (14-ereignisse.js): kein Neuzeichnen, nur sanft nach oben (außer in Unteransichten).
- Gegessen: leer = Platzhalter-Karten je Mahlzeit (+ „Wie gestern“), Zeile bleibt 118 px. Mahlzeit-Karten und Stapel per Ziehen nach unten löschen (`data-fdelg` = Indizes, `foodDel` nimmt Liste). Stapel-Schlüssel ohne Uhrzeit (Tag + Mahlzeit + Kategorie) → Löschen des ersten Eintrags schließt die Gruppe nicht mehr. Geöffnete Gruppe rastet links ein (`.fgrp` scroll-snap-align). Gruppen getönt in Mahlzeitfarbe.
- Wasser: über 100 % dunkler (`.wsl.hi`), über 150 % rot.
- Mengen-Fenster: genau 5 Pillen ohne Wischen (gleich breit, kürzen); Löschen als kleiner roter Mülleimer neben Eintragen (`.fpgo`-Zeile, auch Gericht und Ziele); Marke fehlt → „Selbst anlegen“ über ganze Breite, Barcode dort entfernt (oben vorhanden).
- Suche: Reiter Zuletzt / Kategorien / Meins (Kacheln Schnell, + Lebensmittel, + Gericht; Gerichte als Karten; eigene Lebensmittel). Gerichte-Knopf öffnet „Meins“ (`openDishes`). Zeilen: Menge + Makro-Leiste (`fMx`, Anteil P/F/K an kcal), rechts kcal und Protein.
- Gerichte-Karten (`fDishCard`): Farbe und Icon der Zutat-Kategorie mit den meisten kcal (`CCOL`), dazu Symbol der meist gegessenen Mahlzeit.
- Gericht-Editor: Summe je Portion + Portionen ± oben, Zutat-Zeile Name/Gramm/✕, Nährwerte aus der Datenbank als Icons, von Hand kcal/Protein; `readDraft` behält Werte, wenn das Feld fehlt.
- Rechner: Ziel-Symbol, Nährwert-Icons und -Farben (Makros, Schieber, eigene Werte), Übernehmen unten fixiert.

### 2026-10-26 – Essen: Anteil-Ring, Ziel neben Icon, Wasser live, ein Stapel offen, Schnellmengen nach Einheit, Gerichte als Karten
- Nährwert-Fenster: Ring links (`.fnp`, conic-gradient) mit Prozent am Tag, darunter „n× gegessen“; Balken unten entfällt (war bei Stapeln schief).
- Bilanz: Icon, Wert und Ziel klein in einer Zeile (`.fmb span`), Balken darunter; ✓ entfällt.
- Wasser: `waBar` füllt den Bilanz-Balken live; über dem Ziel bleibt er voll, Ziel-Strich (`em`) rückt nach links, rot über 1,5 × Ziel. Rote `fOv`-Schicht beim Wasser entfällt.
- Gegessen: nur ein Stapel offen (`ui.fstk` hat höchstens einen Schlüssel); alle Karten 96 px hoch, Klammer per Schatten-Ring → nichts verschiebt sich beim Öffnen.
- Mengen-Fenster: Schnellmengen nach Einheit (Stück 1×–5×, Getränke 200–750 ml, sonst um die übliche Menge), letzte Pille = zuletzt eingetragene Menge (Uhr); Pillen füllen die Breite. Kacheln: Balken + % = Anteil dieser Menge am Tagesziel (rot, wenn der Tag damit über die Grenze geht). `.sheet` mit `grid-template-columns: minmax(0, 1fr)` und `.sheet.tall` `overflow-x: hidden` (Marken-Liste machte das Fenster seitlich scrollbar).
- Suche: Zeilen zeigen eine ganze Einheit (Stück, Glas, Portion; Getränke ohne Einheit 250 ml) und alle Nährwerte ≥ 0,5 g als farbige Icons; Marke klein hinter dem Namen. Schnell als Blitz-Knopf neben Barcode; auf der Essen-Seite nur noch „Suchen, scannen …“ und „Gerichte“.
- Gerichte-Fenster: Karten in zwei Spalten (zuletzt gegessene zuerst), kcal groß, Protein/Fett/Kohlenhydrate je Portion, Stift oben rechts, gestrichelte Karte „Neues Gericht“.

### 2026-10-26 – Essen: Feinschliff Icons, Suche mit Reitern, Nährwert-Fenster-Bug
- Nährwert-Fenster überlappte die Überschrift: Klasse `stk` war schon in `40-sammlung.css` mit `position: absolute` belegt (check.py findet nur gleiche Selektoren, nicht gleiche Klassen in anderem Zusammenhang) → `fnrs`. Lehre: neue Klassennamen vorher per grep über `src/css` prüfen. Zusätzlich `.sheet.tall { grid-auto-rows: max-content }`, Nährwert-Fenster jetzt `tall` (scrollt).
- Farben: Protein violett (`--g-kh`), Ballaststoffe türkis (`--g-pull`). Icons: Fett zwei Tropfen, Zucker drei Würfel, Kohlenhydrate drei Körner, Ballaststoffe Spross.
- Bilanz: Icon und Wert nebeneinander (bis 999), Ziel klein unter dem Balken.
- Gegessen: Mahlzeit-Karte Symbol + ×n oben, kcal groß ohne Einheit (passt 4-stellig); aufgeklappter Kategorie-Stapel hat vorne einen Zuklapp-Knopf (Icon, ×n, Kreuz).
- Vorschläge im Stil der Karten (Akzent oben, gestrichelt, kcal groß).
- Mengen-Fenster: 5 Schnellmengen (übliche Menge, Portionen, ½/1½/2×, runde Gramm; ≥ 15 % auseinander, aufsteigend) in einer Zeile; Kacheln Icon + Wert nebeneinander; `.sheet.fp` enger.
- Suche: Reiter Zuletzt / Kategorien / Eigene (`ui.ftab`), alles als gleiche Zeilen (`fRow` mit Kategorie-Icon); Kategorien als Liste mit Anzahl und Pfeil.
- Barcode: quadratischer Rahmen (10 % Rand), Text „egal wie herum“. Wasser-Zahl links neben dem Balken.

### 2026-10-26 – Essen: Gegessen in einer Zeile, Icons statt Nährwert-Namen, kompaktes Mengen-Fenster, Suche mit Kategorie-Icons
- Gegessen: eine Zeile Mahlzeit-Karten (`fMealCard`: Symbol, kcal, Kategorien als überlappende Kreise, Anzahl); antippen zeigt nur diese Mahlzeit in derselben Zeile (`fMeal`, Zurück-Knopf `.fmz`, `ui.fmeal` = Tagesindex + Mahlzeit). Kategorie-Stapel wie zuvor. `fCat` liefert jetzt nur den Schlüssel, Icon und Kurzname aus `CATI`.
- Reihenfolge: Gegessen → Suchen/Gerichte/Schnell → Vorschläge.
- Nährwert-Icons (eigene Linien-SVG, `P.nk/np/nf/nc/nfb/nsu`: Flamme, Keule, Avocado, Ähre, Blatt, Würfel; `NIC`, `nIc`) ersetzen die Namen in Bilanz, Nährwert-Fenster, Mengen-Kacheln, Schnell, Eigenes Lebensmittel, Gericht. Name bleibt als aria-label. Kategorie-Icons `P.bread/milk/egg/bean/carrot/nut/candy/burger/pot`.
- Nährwert-Fenster: Zeilen als `div role=button` mit Flex-Kopf `.fnh` statt `button` mit Grid (Safari überlappte); Icon des Werts im Kopf.
- Mengen-Fenster ohne Scrollen: Menge oben, 4 Schnellmengen, Kacheln mit Icons, Tag als ein Knopf (`dayTog` wechselt Heute → Gestern → älterer Tag, `.fdt`), Mahlzeit nur Symbole, „danach frei“ im Eintragen-Knopf (`ffitHtml` gibt nur Text). Fett/Zucker-Warnchips entfallen (Kacheln werden rot).
- Suche leer: Zuletzt-Chips (`.frc`) und Kategorie-Icon-Kacheln (4 Spalten).
- Wasser: Zahl feste Breite (Balken springt nicht mehr bei 1- vs. 2-stelligen Werten); Antippen ohne Ziehen öffnet das Fenster (`wsl.mv`).
- Barcode: beim Scannen `body.scan` → Querformat-Hinweis aus, Kamera geht in jeder Lage.

### Open Food Facts besser einbinden – Bedingungen (Notiz)
- Heute: `cgi/search.pl` (de + world parallel, 8 s) – langsam, oft 503. Barcode (`api/v2/product/…`) ist zuverlässig und hat CORS.
- `search.openfoodfacts.org` (search-a-licious, Elasticsearch, ~0,3 s) wäre ideal, schickt aber keinen `Access-Control-Allow-Origin` → im Browser blockiert. Bedingung: OFF aktiviert CORS dort (Issue im Repo openfoodfacts/search-a-licious beobachten) – dann nur URL und Antwortformat (`hits`, `brands` als Liste) in `offSearch` anpassen.
- Alternative ohne OFF-Änderung: kleiner Proxy (z. B. Cloudflare Worker, kostenlos), der CORS ergänzt. Bedingung: Falk ist mit einem Server/Dienst einverstanden (Regel „keine Server ohne Rückfrage“), Adresse bleibt stabil.
- Offline-Variante: deutsche Teilmenge (z. B. die 5–10 000 meistgescannten Produkte, nur Name/Marke/Barcode/Nährwerte) als JSON beim Build einbinden oder beim ersten Start laden und im Cache halten. Bedingung: Größe < ~2 MB gzip, Update-Skript in `tools/`, Lizenz ODbL (Quelle nennen).
- Weitere Quellen: USDA FoodData Central nur mit API-Schlüssel und englisch; BLS (Bundeslebensmittelschlüssel) nicht frei. Daher bleibt OFF die Quelle.

### 2026-10-26 – Essen: Gegessen nach Mahlzeit und Kategorie, 4 Vorschläge, Nährwert- und Mengen-Fenster neu
- Gegessen steht jetzt über den Vorschlägen. Je Mahlzeit eine Zeile (`fMeal`, `fGroups` gruppiert nur noch nach Mahlzeit, nicht mehr 45-min-Fenster), darin Einträge gleicher Kategorie (`fCat`: FCATS, Eigene, Gerichte, Schnell) ab 2 als Stapel mit Anzahl; Chips zeigen die Menge statt Mahlzeit/Uhrzeit.
- Vorschläge (`fTiles`): 2 zuletzt + 2 häufigste der letzten 21 Tage, je Lebensmittel einmal, aufgefüllt aus `TILEDEF`; 4er-Raster statt Scrollreihe.
- Nährwert-Fenster: gleiche Lebensmittel zusammengefasst (×n, gestapelt), Gesamtbalken oben, nicht mehr editierbar; Antippen klappt die übrigen Nährwerte in ihren Farben auf (`data-fnx`). Nährwertfarben zentral in `NCOL`, Zahlformat `fNv` (ersetzt `fV`).
- Mengen-Fenster: Barcode-Knopf im Kopf (neben Marke), Nährwert-Kacheln in Nährwertfarben mit Tagesbalken (Tag bisher blass + diese Menge, rot über `FLIM`), `fDaySum` gemeinsam für Kacheln und „danach frei“, Eintragen-Knopf klebt unten (`.fpgo`).
- Open Food Facts: `cgi/search.pl` antwortete oft 503/langsam. Jetzt de und world parallel mit 8 s Zeitlimit, de mit Treffern gewinnt. `search.openfoodfacts.org` (schnell) geht nicht: kein CORS-Header. Andere freie Quellen ohne Schlüssel/CORS gibt es kaum (USDA braucht Schlüssel, englisch). Klarere Meldungen bei „nicht gefunden“.
- Wasser-Balken sprang nach dem Ziehen zurück: `hydrate` animierte vom alten `data-p` → `wslSet` setzt jetzt auch `data-p`. Monatsanzeige höher.
- Fehler gefunden: `render()` scrollte die erste `.fchips` ans Ende (Rest aus der alten Leiste) → entfernt.

### 2026-10-26 – Essen: Tagesleiste wischbar, Wasser-Regler und neues Wasser-Fenster
- Tagesleiste: Wischen springt 7 Tage zurück/vor (rollend, heute rechts, bis 1 Jahr zurück), Auswahl wandert mit; neuer Monat erscheint kurz als Pille darüber (`fdsMove`, `fMon`, Wischmodus `fds` neben `cal` in 15-start.js). `fSd` erlaubt jetzt jeden Tag im letzten Jahr.
- Wasser in der Bilanz: Glas/Flasche-Knöpfe raus, Balken ziehbar (relativ, 50 ml, `data-rel`) – erneutes Ziehen addiert über das Ziel hinaus.
- Wasser-Fenster neu (Variante „breiter Regler mit Skala“): Zahl in Litern tippen/wischen (Werte > 20 gelten als ml), ±50 ml, Regler mit Strichen je 250 ml, Ziel-Marke, rot über dem Höchstwert (1,5 × Ziel), Kacheln +250/+500/+750/0. Live-Anzeige gebündelt in `waShow`.
- Falsch beim ersten Versuch: Klasse `.wtop` war schon im Profil belegt → `.wahd`.

### 2026-10-26 – Essen: Nährwert-Fenster, Wasser per Glas/Flasche, ohne Rückgängig
- Nährwert antippen (kcal-Zeile oder Mini-Balken, `data-fnut`): Fenster `openNut` mit allen Einträgen des Tages, sortiert nach diesem Wert, Menge, Anteil in % als Balken in der Wertfarbe, linker Rand = Mahlzeit; Eintrag antippen = ändern; „ohne Angabe“ zählt Einträge ohne diesen Wert.
- Wasser: Balken nur Anzeige (`.wsl[data-ro]`, Ziehen nur noch im Feineingabe-Fenster), Knöpfe Glas +250 ml und Flasche +500 ml (`.fwq`, neue Icons `glass`, `bottle`) mit „+250 ml“-Floaty; Zahl antippen = Feineingabe.
- Rückgängig im Essen entfernt (Eintragen, Löschen, „Wie gestern“): Toasts ohne Knopf, `ui.undo` wird dort nicht mehr gesetzt.

### 2026-10-26 – Heute als Spiel-Startseite mit Maskottchen, Essen: Grenzen und neues Zuviel
- Heute (Variante A, Clash-Stil): oben Level-Plakette mit Titel und XP (Antippen = Bergpfad) und Serien-Chip (Tage, ×Bonus, Countdown; rot pulsierend bei letzter Chance), links Tagesziel-Ring und Aufwärmen, rechts Bergpfad und Ändern, Mitte Bühne (Himmel, Bergketten, Schein) mit Maskottchen (Antippen = Arena), unten Plan, Fortschritt, großer Start-Knopf. Ruhetag: Maskottchen schläft, Knopf „Trotzdem trainieren“. Alte Übersicht (`.tov`, `.hrow`, Serie-Zeile, `hudSlim`, `restCard`) entfernt; Vorwoche-Balken ist damit aus Heute raus.
- Maskottchen `mascot(mood, tier)`: SVG-Platzhalter (idle/happy/sleep/cheer), Stirnband in Stufenfarbe, wächst mit der Titel-Stufe, wippt. In der Arena unten unter dem Knopf, freut sich ab Ziel, jubelt bei erledigter Übung. Arena blendet weich ein (`arin`).
- Essen: Grenzen `FLIM` (kcal/Fett/KH 110 %, Zucker 100 %, Protein 140 %, Ballaststoffe 160 %, Wasser 150 % als gesundes Maximum). Zu viel: roter, leuchtender Balken füllt sich über der eigenen Farbe neu (`fOv`, Animation `ovfill`); Wackeln bei jedem Eintrag, der über die Grenze bringt oder weiter darüber (`fAnim` merkt sich Wert und Zustand). Wasser in Blau mit Ziel-Leuchten und gleichem Zuviel.
- Fehler: Das Entfernen toter CSS-Regeln per Regex hat zwei Kommentare abgeschnitten (Kommentartext mit `;` wurde Teil des Selektors); ein offener Kommentar verschluckt still alle folgenden Regeln (Arena ohne Layout). `check.py` prüft jetzt offene Kommentare und ungleiche Klammern je CSS-Datei.

### 2026-10-26 – Belohnungen nach dem Training, Essen-Farben und -Animationen, Skilltree-Feinschliff
- Belohnungen (Freischaltung, Karten-Level, Muskel-Level, Wochen-/Monatsziel, Konto-Level) werden gesammelt (`rwq`, `rwAdd`, localStorage `zenit.rwq`) und erst im Heute-Tab außerhalb der Arena gezeigt (`rwPlay` aus `render()`), einzeln mit Zähler, Konto-Level als goldenes Finale (`.lvacc`, Zahl zählt hoch, neue Stufe = Titel). Freischaltung: gesperrte Karte bricht auf, darunter die erfüllten Voraussetzungen. In der Arena nur Toast „Belohnung gesammelt“.
- Alter Dialog (`#scrim`, `.unlock`, `dq`, `nextDialog`) und `cardFx`/`musFx`/`fxq` entfernt; `fxShow` nimmt jetzt ein Objekt mit `done`-Callback.
- Essen: jeder Wert eigene Farbe (`--fc`: kcal orange, Protein türkis, Fett gelb, Kohlenhydrate blau, Ballaststoffe violett, Zucker pink), auch im Ziel; Ziel = Zahl in Farbe + ✓. Balkenende dunkler. Einmal-Animation beim Wechsel ins Ziel (`fa-hit`: Leuchten, Zahl springt) bzw. ins Zuviel (`fa-bad`: Ruckeln, roter Blitz), `fAnim` merkt sich den Zustand je Tag.
- Skilltree: Geschwister nach Zugrichtung sortiert (Äste mit Linien in den Sektor davor zuerst), Knoten mit Voraussetzungen aus anderen Sektoren dürfen 15° über die Sektorgrenze. 4 → 3 Kreuzungen. Lange Linien (Hollow → Frontlever, Dead Hang → Backlever) bleiben ~340 px, weil die Ringe nach Stufe liegen (Dead Hang innen, Backlever außen: 268 px allein durch den Radius).
- Serie-Zeile: passt, wird beim Redesign aufgewertet.

### 2026-10-26 – Quelle nach Bereichen aufgeteilt, CSS aufgeräumt, Tester-Agent
- `src/zenit.html` (5200 Zeilen) → `src/index.html` (Gerüst) + `src/css/` (7 Bereichsdateien) + `src/js/` (15 Abschnitte der IIFE, Originalreihenfolge). `build.py` setzt zusammen (`assemble()`), der JS-Teil war byte-gleich zum alten Stand.
- `check.py` arbeitet auf der zusammengesetzten Quelle, meldet Fehler als Datei:Zeile und prüft neu doppelte CSS-Selektoren.
- CSS: 58 Selektoren des alten Serie-Blocks entfernt (hero, rw, chase, ringw, week …), 22 doppelte Selektoren in die erste Regel zusammengeführt (spätere Werte gewinnen), dann nach Bereichen verteilt; globale Media-Queries in `90-medien.css` (müssen zuletzt kommen). 6 KB kleiner.
- `compare.js` baut den alten Stand per `git archive` (funktioniert für alte und neue Struktur) und vergleicht jetzt 17 Ansichten × hell/dunkel (Arena, Muskeln, Skilltree, Karte, Statistik, Suche, Wasser, Bergpfad dazu). Ergebnis jeder Stufe: Alles gleich.
- Agent `tester` (Haiku): führt check/smoke/compare aus und meldet nur Fehler, damit lange Ausgaben nicht im Hauptgespräch landen.

### 2026-10-26 – Claude-Code-Workflow: Hook, Rechte, /check, /handoff, Reviewer
- Hook nach jedem Edit/Write an `src/`/`public/`: `tools/hook-check.py` → `check.py --fast` (Syntax, Duplikate, Manifest-JSON), still bei Erfolg, Exit 2 mit kurzer Meldung bei Fehler.
- `.claude/settings.json`: zusätzlich erlaubt (compare, grep, git show/branch), gesperrt: force-push, `reset --hard`, `rm -rf`, `.env*`/Backup-Dateien lesen, `Notes.md`/`dist/` bearbeiten.
- `/check` (alle Prüfungen + Aufrufstellen des Diffs), `/handoff` (Stand ins Log vor `/clear`), Agent `reviewer` (Diff auf Bugs, iOS, Datenverlust; Sonnet).
- `CLAUDE.md` gestrafft, bindet `docs/DEVELOPMENT.md` per `@` ein (eine Leseaktion weniger je Session). Manifest mit `"id"`. Bewusst weggelassen: `/release` mit Cache-Bump (Service Worker ist „Netz zuerst“), PR-Template (Arbeit direkt auf `main`), zweiter Pages-Workflow (der vorhandene prüft vor dem Deploy).

### 2026-10-23 – Arena mit Zähler und Pause-Vollbild, Serie als kompakte Zeile
- Arena: flache Karte oben (`.hc.arc`, wischen = andere Übung), darunter großer Zähler `#arn` für den nächsten Satz (±, waagerecht wischen 16 px je Schritt; Akzentfarbe ab Ziel), vorbelegt wie im Fenster (`setPrefill`). „Satz eintragen“ (`data-arsave`, `arSave`) speichert direkt, Gewicht wie zuletzt (Chip öffnet das Fenster). Erledigte Sätze als kleine Pills (antippen = ändern).
- Speichern als gemeinsame Funktion `logSet` (Fenster und Arena). Pause: `startRest(e, nx)` mit Text „Satz 2 von 3“, −15 s (`data-rest="sub"`); in der Arena als Vollbild mit Ring (`body.arm .rest`, `--p` am `#rest`), nach Ablauf schließt sie sich nach 1,2 s von selbst.
- Heute: „Serie und Belohnungen“ (großer Block mit Flamme, Ring, Kacheln, Vorwoche) ersetzt durch eine Zeile `.hser`: Flamme + Tage, Wochenpunkte, Multiplikator-Chip, Vorwoche-Balken. `weekStrip`/`rwTile` entfernt. CSS von `.hero`, `.rw`, `.chase`, `.week`, `.sk`, `.ringw` ist jetzt tot → beim nächsten Aufräumen mit `compare.js` entfernen.
- Fehler: `.unlock .big` (Symbolkreis) traf auch den Knopf `btn big` → „Weiter“ als Ellipse. Jetzt `.unlock div.big`.
- Smoke: Arena trägt einen Satz ein, schließt Dialoge (die erscheinen verzögert; sonst blockiert der Schleier alle folgenden Klicks und der Lauf dauert 150 s), Pause −15 s und Weiter.

### 2026-10-23 – Balken blass → kräftig, 24-h-Uhrzeit, Wischen ohne iOS-Geste, Freischalten nur über Voraussetzungen, Sektor-Reihenfolge
- Balken: Verlauf von blass (weiße Überlagerung) zu voller Farbe an der Spitze.
- Uhrzeit: iPhone zeigte AM/PM und schnitt ab → eigene 24-h-Anzeige `#ftmv`, das echte `type=time`-Feld liegt unsichtbar darüber (öffnet weiter das Rad).
- Senkrechtes Wischen auf Kacheln/Einträgen: `touchmove` mit `preventDefault` (passive: false), sobald die Bewegung senkrecht ist, damit iOS nicht die Seite/Geste mitnimmt.
- Freischalten: Üben einer gesperrten Übung schaltet sie nicht mehr frei; nur erfüllte Voraussetzungen (+ Muskel-Level bei Skills). Achtung: bisher so freigeschaltete Übungen sind wieder gesperrt (Karten-KP bleiben).
- Skilltree: Reihenfolge der Muskel-Sektoren wird optimiert (alle 8! Reihenfolgen, Kosten = Querlinien × Winkelabstand der Sektormitten), Drehsuche weiter (±60°, 6 Durchgänge). Gemessen: 5 → 4 Kreuzungen, Linienlänge 8127 → 7479 px, längste Linie 628 → 337 px.

### 2026-10-23 – Essen-Gruppen, Wischrichtung getauscht, Skilltree entwirrt mit Leuchten und Fortschritt
- Essen: Mahlzeit-Leiste und Uhrzeit in einer Zeile (Tag darüber, nur bei neuen Einträgen). Wischen getauscht: Vorschlag nach oben = eintragen, Eintrag nach unten = löschen. Gleiche Mahlzeit innerhalb 45 min = Stapel (`fGroups`, `fChip`, `data-fstk`, `ui.fstk`), Antippen klappt auf (getönte Klammer, Schließen-Knopf); Stapel selbst lassen sich nicht wegwischen. Balken dunkler mit stärkerem Verlauf (dunkle Basis → helle Spitze).
- Diagramme: feine Wochenlinien (ab 14 Tagen) bzw. Monatslinien (ab 120 Tagen).
- Skilltree: Äste werden probeweise gedreht (±3–24°, drei Durchgänge), behalten wird, was weniger Kreuzungen + kürzere Linien ergibt; jeder Ast bleibt im Sektor seiner Muskelgruppe. Gemessen: 16 → 5 Kreuzungen, Linienlänge 9167 → 8127 px. Die einfache Variante (zur Mitte der Eltern drehen) machte es schlechter (20) und warf Äste aus ihren Sektoren.
- Skilltree: „Als Nächstes“ entfernt. Freigeschaltete Linien leuchten (`line.gl`), gesperrte füllen sich vom Ursprung aus grün nach Fortschritt der Voraussetzung (`line.pg`), freigeschaltete Knoten mit Schein. Info-Leiste mit Level-Plakette in Seltenheitsfarbe, Balken (KP zum nächsten Level bzw. jede Voraussetzung und Muskel-Level), Vorgabe, Muskeln; bei Muskelgruppen MP-Balken, Einzelmuskeln, freigeschaltete Übungen.

### 2026-10-23 – Wischen zum Eintragen/Löschen, Mahlzeit-Leiste, Balken-Glanz, lesbare Diagramme, Skilltree-Sektoren
- Essen: Vorschlag nach unten ziehen = sofort eintragen, Eintrag nach oben ziehen = löschen mit Rückgängig (Pointer-Events, `touch-action: pan-x` auf den Reihen, waagerecht bleibt Scrollen, Wischen löst kein Antippen aus; `foodDel`). Uhrzeit als Pille neben Heute/Gestern, Mahlzeit als Symbol-Leiste (`MEALI`, Icon `snack`, verstecktes `#fmk`, `fmkSet`). Balken mit Verlauf zur Spitze und wanderndem Glanz (auch Wasser).
- Diagramme: Wertlinien mit Zahlen (0/Mitte/oben), Endwert an jeder Linie, Legende antippen hebt eine Kurve hervor (`data-lcf`, `data-f` am SVG).
- Skilltree: farbige Sektoren je Muskelgruppe mit großem Namen am Rand (`stWed`, `MUSC`), Ecken: Fortschritt (Skills/Übungen) und „Als Nächstes“ (erreichbare Skills, antippbar).

### 2026-10-23 – Skilltree geordnet: Hauptwege und Varianten
- Analyse: 31 Grundübungen, 24 ohne Folgeübung (14 Mobility); breite Knoten: Liegestütz 11, Goblet 7, Hollow/Pike 5 Folgeübungen.
- Hauptknoten nur noch Skills und Übungen, auf denen etwas aufbaut; Varianten (nichts baut darauf auf) sind kleine Satelliten-Punkte am Ursprung (`stSat`, Bogen nach außen, Abstand 24 px, mehrere Reihen). Ringabstand der Hauptknoten berücksichtigt Satelliten. Messung: 4 knappe Berührungen bei 107 Knoten.
- Zoom-Knöpfe und Hinweis entfernt (Finger/Mausrad), Info-Leiste nur nach Antippen (Muskel zeigt Anzahl Varianten).

### 2026-10-23 – Einzelmuskeln, Figur per Wischen
- 15 Einzelmuskeln (`SUBM`: Latissimus, Nacken & Trapez, unterer Rücken, Brust, vordere/hintere Schulter, Bizeps, Trizeps, Unterarme & Griff, Bauch, seitlicher Bauch, Quadrizeps, Beinbeuger, Gesäß, Waden) mit eigenem Level (`subOf` verteilt die Wörter aus `e.mu`, `d.smp`, `sLevel` mit halben Kosten). Die 9 Gruppen bleiben Oberbegriff für Skill-Voraussetzungen und Balance.
- Figur: Flächen je Einzelmuskel in Materialfarbe, vorn/hinten per waagerechtem Wischen (Dreh-Animation, zwei Punkte zeigen die Seite), keine Knöpfe. Gruppe antippen markiert ihre Einzelmuskeln; Info-Karte zeigt Gruppe mit Einzelmuskel-Chips oder Einzelmuskel mit Rückweg zur Gruppe.

### 2026-10-23 – Mahlzeit wählbar, Wasser-Regler neu, schmale Toasts, lineare Diagramme, Rekorde je Übung
- Essen: unter Heute/Gestern Mahlzeit (Auswahl) + Uhrzeit nebeneinander (`whenRow`/`whenFor`); Mahlzeit folgt der Uhrzeit, bis man sie wählt; gespeichert nur, wenn sie von der Uhrzeit abweicht (`x.mk`, `cleanFood` behält `mk`; `mealOfE`). Neue Datenform-Erweiterung, abwärtskompatibel.
- Wasser: eigener Regler (`.wsl`, Pointer: Antippen oder Ziehen setzt den Wert, Loslassen speichert) statt `input type=range` mit unsichtbarem Knopf (reagierte schlecht).
- Toasts schmal als Pille direkt über der Tab-Leiste (in der Arena unten).
- Kacheln: grüner Punkt + Gramm statt „g Protein“. Zu-viel-Rot schon ab 100 % (kcal, Fett, Kohlenhydrate, Zucker).
- Diagramme: gerade Linien statt Kurven, Maximalwert oben links, Ziel beschriftet. Auswahl per Antippen/Ziehen über Pointer-Events ohne Neuzeichnen (`LCD`, `lcPick`) – vorher riss das Ziehen ab, weil `render()` das SVG unter dem Finger ersetzte.
- Rekorde: eine Zeile je Übung (neueste zuerst) mit Bestwert, Plus seit Start, Anzahl; 3 Kennzahlen oben; Antippen öffnet die Übung im Profil.

### 2026-10-23 – Skilltree als zoombares radiales Netz
Mit Falk: wie ein Dungeon-Skilltree, aber radial; Übungen gehören dazu, Navigation mit Zoomen, Infos kompakt.
- `viewSkills`: Fläche 1400 px (`.stcan`, `ui.stv` = Verschiebung/Zoom), Mitte Zenit, Ring Muskelgruppen (Embleme), außen alle 98 Übungen, je Stufe ein Ring, Skills als große Knoten. Linien: Muskel → Grundübung, Voraussetzung → Übung; frei = grün, gewählter Weg = gold.
- Layout (`stLayout`): radialer Baum (Eltern = erste Voraussetzung), Winkelbereich je Ast nach seiner Breite (Skills zählen doppelt), Muskelgruppen mindestens 30°, danach je Ring Mindestabstand nach Knotengröße inkl. Übergang über ±180°. Messung: 107 Knoten, 0 Überlappungen. Startansicht passt auf die Ausdehnung des Netzes (`stBox`).
- Bedienung: ein Finger verschiebt, zwei zoomen (Pointer-Events, `touch-action: none`), Mausrad, Knöpfe +/−/Ganzes Netz; Antippen zeigt unten eine Info-Leiste (Name, Seltenheit, Level bzw. Voraussetzungen, „Karte“/„Übungen“), ein Ziehen löst kein Antippen aus. Beschriftungen kleiner Knoten erst ab Zoom 0,8.
- Fehler: `.stcan svg` traf auch die Icons in den Knoten (Schlösser außerhalb) → `.stcan > svg`.

### 2026-10-23 – Muskeln als Körperfigur
- Mockup A: stilisierte Figur (`BODY`, vorn/hinten), jede Fläche = Muskelgruppe in Materialfarbe (ab Gold mit Leuchten), Antippen wählt (`ui.msel`), Chips für alle 9 Gruppen (auch Beweglichkeit/Ausdauer), Info-Karte mit Level, MP-Balken, „Silber ab Lv 8 · noch X MP“, Übungen öffnen das bisherige Muskel-Fenster. Platzhalter bis zu den Illustrationen.

### 2026-10-23 – Statistik als Kurven auf einer Seite
Mit Falk per Mockup (A): keine Kachel→Großansicht mehr, je Bereich eine Seite.
- `statPage`: Zeitraum 7/30/90, 3 Kennzahlen (`kpis`), Diagramm-Karten mit weichen Kurven (`lineChart`, `smooth` = Catmull-Rom), zusammengehörige Werte teilen sich ein Diagramm (Sätze+XP, kcal+Ziel, Protein+Ziel, Fett+Zucker, Gewicht+Zielgewicht, alle Maße). Antippen oder Wischen über die Kurve wählt einen Tag (`ui.lsel`, `data-lc`, Touch-Scrub umgebaut von der alten Ernährungs-Grafik), Werte stehen im Kopf.
- Training: Gruppen-Anteile, Übungen als eine Zeile je Übung mit Mini-Kurve und Trend (6, „Alle anzeigen“). Körper: Monatsrückblick aufklappbar.
- Entfernt: `statDefs`, `bigChart`, `statFocus`, `statDash`, `foodStats`, `fchart`, `calHtml`, `viewList`, Handler `data-sfoc/fd/hd/mo`, 54 CSS-Regeln. `compare.js`: gleich.

### 2026-10-23 – Essen: Uhrzeit und Mahlzeiten, Zu-viel-Balken, Wasser nur Regler
- Einträge haben eine einstellbare Uhrzeit (`whenRow`, `#ftm`, in `foodPush` auf den Tag gesetzt); daraus die Mahlzeit (`MEALS`/`mealOf`: bis 10:30 Frühstück, bis 14:30 Mittag, bis 17:30 Snack, danach Abend). Chips nach Uhrzeit, Farbe und Text der Mahlzeit, Leiste startet am neuesten Eintrag.
- Zu viel: Balken bleibt voll in seiner Farbe, darüber füllt sich Rot neu (`i.ov`, 3× schneller: 10 % drüber = 30 % Rot), für kcal, Fett, Kohlenhydrate, Zucker. Fehler: die Makro-Farbregel überdeckte das Rot (Spezifität) → `.fmb .fbt > i.ov`.
- Schnell-Kacheln zeigen Protein statt Menge (Menge brach oft um, steht im aria-label). Wasser ohne Plus, nur Regler. Karten-Gruppen: Pfeil nach unten/oben.

### 2026-10-23 – Essen ohne Scrollen, Statistik als Kachel-Dashboard
Mit Falk per Mockups: Essen „Gegessen“ als wischbare Chip-Leiste, Statistik-Details als Kachel-Dashboard.
- Essen: Einträge als Chips (`.fcpi`, Antippen = Bearbeiten-Fenster mit „Eintrag löschen“); die Seite passt ohne Scrollen auf den Bildschirm. Heute: Aufwärmen wieder als Zeile.
- Statistik (Profil › Training/Körper/Ernährung): Zeitraum 7/30/90 (`ui.srng`), oben die große Ansicht der gewählten Kachel (`ui.sfoc`, `bigChart` mit Ø/Min/Max/Ziel bzw. Kalender, Gruppen, Übungsliste, Monatsrückblick, % vom Ziel), darunter Kachelraster (`statDefs`, `statDash`).
- Entfernt: `viewOverview`, `buckets`, `barChart`, `topGain`, Handler `data-range/met/gf/bk`, 21 CSS-Regeln (alte Essen-Liste, alter Überblick). `compare.js`: Alles gleich.
- Fehler: Detailansicht einer Übung ohne Einheit stürzte im Diagramm ab (`exChart` mit leerer Liste) – jetzt „Noch keine Einheit“.
- Smoke: verdeckte Klicks (Toast) werden einmal erzwungen wiederholt; Fehler zeigen die erste Stack-Zeile.

### 2026-10-23 – Aufräumen
- Ungenutzte Funktionen entfernt: `hudHtml`, `toolRow`, `warmHtml`, `weightSec`, `profTiles`, `viewPath` (nur noch Ausweich-Ansicht), `nextUnlock`. Tote Klick-Handler: `data-gx`, `data-pday`, `data-pg`, `data-seg`. 118 CSS-Regeln, die nur tote Klassen betrafen (alter HUD, Plan-Kopf, Werkzeugzeile, Gruppenlisten, alte Arena/Deck-Reste, Profil-Kacheln, Kartenkopf). `tools/compare.js`: Alles gleich.
- Fehler gefunden: mit dem Heute-Umbau war das Aufwärmen nicht mehr erreichbar (kommt als Zeile zurück).
- Werkzeuge (Scratchpad): Suche ungenutzter Funktionen per Wortzählung, Entfernen ganzer Funktionen per Klammerzählung; `data-p' + m + 'x` wird dynamisch erzeugt (nicht löschen).

### 2026-10-22 – Heute-Übersicht + Vollbild-Arena, Karten nach Gruppen, Skilltree radial, Profil mit Statistik
Mit Falk per Mockups (alle Empfehlungen gewählt):
- Heute: Übersicht (Training mit Name, Dauer, Fortschritt, ein Start-Knopf; Zeilen Tagesziel, Bergpfad, Serie). „Training starten“ öffnet die Arena im Vollbild (`ui.arena`, `body.arm` blendet Tab-Leiste, Kopf und Brandbar aus): große Karte, Wischen (Touch auf `#arm-s`) oder Punkte zum Wechseln, ein Hauptknopf, ✕ zurück; startet die Trainingszeit.
- Sammlung/Karten: Filter Alle · Bereit ▲ · Gesperrt (`ui.cf2`), Gruppen zuklappbar (`ui.cgo`) mit Stärke-Balken, kleine Karten (`.dk`).
- Skills: radialer Skilltree (`viewSkills`), Mitte Grundlagen, je Linie ein Ast, Etappen auf 4 Ringen, freie Wege leuchten; Fläche 150 % breit, seitlich verschiebbar, beim Öffnen mittig.
- Profil: Karte (Level/Titel, Körperwerte, XP-Balken, Schnellknöpfe Gewicht/Körper/Maße/Ziel/Geräte) und 4 Statistik-Kacheln (Training 14 Tage, Körper 30 Tage, Ernährung 7 Tage, Rekorde 30 Tage) mit Mini-Diagramm (`mspk`); Antippen → Detail (`ui.pstat`: bisherige Ansichten, Rekorde neu über `pbList`). Statistik aus der Sammlung entfernt, Sprünge (`go('cal'/'xp')`) zeigen ins Profil.
- Smoke: `[data-fedit]` mit force (liegt nach dem Eintragen unter dem Rückgängig-Toast, wenn die Trainingszeit oben läuft).
- Offen: Detailansichten der Statistik überarbeiten (Training sehr lang), toter Code (`toolRow`, `warmHtml`, `viewPath`, `profTiles`, `weightSec`, alte Arena-CSS) aufräumen, Muskel-Illustrationen je Stufe.

### 2026-10-22 – Heute als Arena mit Bergpfad, Level-Up-Effekte, Haptik auf dem iPhone
- Heute: Arena (Trainingsname, große Karte der aktuellen Übung im Look, Vorgabe/Prüfung, ein Hauptknopf „Satz n eintragen“ bzw. „Weiter: …“, Sätze), Deck im 4er-Raster (Aufwärmen + alle Übungen, Look-Rahmen, ▲ bereit), Tagesziel mit Ring, „Serie und Belohnungen“ aufklappbar. Satz-Fenster nutzt die Vorgabe des Karten-Levels (`openSheet` mit `rxNow`).
- Bergpfad (`pathHtml`): Kopfzeile oder Arena-Hintergrund antippen (`data-zoom`, nicht auf Bedienelementen) zoomt heraus; Konto-Level als Stationen, Titel-Stufen als Meilensteine, Gipfel oben; Zoom-Animationen `zin`/`zout`.
- Effekte: `confetti` ersetzt durch `sparks` (aufsteigende Lichtfunken, Lichtschein). Level-Up-Moment `cardFx` (Karte dreht sich herein, Strahlen in Look-Farbe, neuer Rahmen) und `musFx` (Emblem wird geschmiedet, neues Material), nacheinander über `fxq`. Test-Hook `window.__zfx`.
- Haptik: Safari kann nicht vibrieren; `buzz` schaltet auf dem iPhone einen versteckten `<input type="checkbox" switch>` um (iOS 18+), Klick wird nicht an den Dokument-Handler weitergereicht.
- Offen: `toolRow`, `warmHtml`, `viewPath` werden auf Heute/Sammlung nicht mehr genutzt → beim nächsten Aufräumen prüfen.

### 2026-10-22 – Sammlung statt Verlauf: Karten, Muskeln, Skills, Statistik
- Tab „fort“ heißt jetzt Sammlung (Icon `gem`), oben 4 Bereiche (`ui.col`: ka/mu/sk/st), immer nur einer sichtbar. Statistik enthält Überblick/Übungen/Körper (später ins Profil).
- Karten: Kopfzahlen (Karten, Stärke = Summe der Level, bereit zum Aufstieg), Gruppenfilter, Raster (eigene nach Level, gesperrte gestrichelt). Antippen: Sheet mit großer Karte, Fortschritt bzw. Voraussetzungen, Muskeln, alle Stufen der Leiter mit Look-Farbe, Sprung in den Übungsverlauf.
- Muskeln: 9 Embleme, Material nach Level (Holz, Stein, Bronze, Silber, Gold, Platin, Diamant, Zenit, ab Silber mit Glanz), Sheet mit MP und allen Übungen der Gruppe. Kosten jetzt 250 × 1,17^(L−1).
- Skills: 10 Skill-Linien (`SKL`) als Etappen-Pfad; Skills brauchen zusätzlich Muskel-Level (`SKQ`, `skqOk` in `derive`). Was schon trainiert wurde, bleibt frei (jede geloggte Übung gilt als freigeschaltet).
- Neue Icons: gem, shoulder, leg, grip.

### 2026-10-22 – Kartensystem 2.0: 6 Seltenheiten, Looks, Leiter, Aufstiegsprüfung
Mit Falk: 6 Seltenheiten (Gewöhnlich 1, Selten 3, Episch 5, Legendär 7, Mythisch 8, Zenit 9), Seltenheit fest = Abzeichen, Look (Rahmen/Effekte) nach Level (1–2/3–4/5–6/7–8/9/10). Langsamer (`CSES`: 154–220 Einheiten bis Lv 10). Legendär: wenige sichtbare Schritte, je Schritt viele Einheiten. Steigerung `LAD`: Wiederholungen → +1 Satz (max 4) → Tempo 3 s ab → Pause (Halten: länger), später Zusatzgewicht. Skills feste Seltenheit `SKR`. Pfad aus Heute = Bergpfad zum Zenit; Sammlung im Verlauf-Tab; Reihenfolge System → Sammlung → Heute → Effekte.
- `rx(e, lv)` Vorgabe je Level, `rxNow`: bei genug KP Aufstiegsprüfung mit der Vorgabe des nächsten Levels (ein Level pro Einheit). Heute zeigt Karten mit Seltenheits-Abzeichen und Look-Rahmen (Glanz ab Episch, Glut Mythisch, rotierender Rand Zenit, `@property --za`), Sätze der gewählten Karte nach Vorgabe.

### 2026-10-22 – Kartensystem Phase 1 und Heute im Layout B
Mit Falk festgelegt: Übungen sind Karten mit Seltenheit (Gewöhnlich/Selten/Episch/Legendär, Startlevel 1/3/5/7, Max 10, später Kraftstufen 11+). Level-Up braucht Leistung (Satzziel des nächsten Levels in einer Einheit) UND Fleiß (KP). Muskelgruppen (Rücken, Brust, Schultern, Arme, Core, Beine, Griff, Beweglichkeit, Ausdauer) leveln über alle Übungen (Level 1–20, Kosten 150 × 1,18^(L−1)). Skills sollen später über Muskel-Level freischalten. Heute-Layout B (Karten-Reihe) gewählt.
- Umsetzung: alles in `derive()` aus den Logs berechnet (`cards`, `mp`), keine neue Datenform. KP je Satz = 10 × Leistung / Ziel des aktuellen Levels (max 15). Satzziel `cTarget`: 30 % → 150 % des Grundziels, geometrisch ab Startlevel. Kosten `cCost` = Einheiten (`CSES`) × 10 × Sätze. Seltenheit `rarOf` aus der Tiefe im Freischalt-Pfad. Muskeln `musOf` aus `e.mu` (erstes Wort 1,0, weitere 0,5).
- Heute: schlanke Kopfzeile (`hudSlim`: Tag, Serie, Level), Status nur bei offener Serie, Karten-Reihe (`.hc`, Farbe je Seltenheit, KP-Balken), darunter `cardProg` (Lv → Lv+1: Leistung, KP) und die Sätze der gewählten Karte. Alter Hero und „Vorwoche jagen“ in „Serie und Belohnungen“ (aufklappbar). Toast bei Karten-Level-Up.
- Offen: Muskel-Ansicht/Sammelbuch, Skills über Muskel-Level, Sätze je Level, Tages-Drop, Aufgaben, Saison.

### 2026-10-22 – Wasser ohne Knopf, Zahl wischen, Icons, einheitliche Tagesüberschrift
- Wasser-Regler ohne sichtbaren Knopf (Thumb transparent, 28 px greifbar).
- Zahl wischen: waagerecht über Menge (`#fa`, `#fpcn`) oder Wasser (`#wa-n`) ziehen ändert den Wert (Pointer-Events, ab 8 px, je 10 px ein Schritt). Fehler: Name `scrub` gab es schon (Diagramm) → `nsw`; `check.py` hat es gefunden.
- Icons: Plan „Heute“ = `caltd` (Kalender mit markiertem Tag), Essen „Ziele“ = `sliders` (vorher beide `target`).
- `dayHead(di)`: „Donnerstag · Heute“, „Montag · 19. Okt.“ – Plan-Tageskarte und Essen-Liste. Essen-Tagesleiste: heute als dunkler Kreis wie im Plan.

### 2026-10-22 – Wasser-Regler, Farben für zu wenig, Nochmal, Suchfeld über der Tastatur
- Wasser: Schieberegler in der Zeile (`#fw-r`, 0 bis Ziel) und im Sheet (`#wa-r`); beim Ziehen nur Anzeige, beim Loslassen (`change`) speichern (`waSet`), sonst zerstört `render()` den Regler mitten im Ziehen.
- Farben: grün ab 90 % (Protein/Ballaststoffe), orange = deutlich hinter dem Tagesstand (`fExp`: heute 8–20 Uhr linear, vergangene Tage 1; orange wenn < 60 % davon), rot = zu viel. Tagesleiste: vergangene Tage orange bei Protein < 60 % oder kcal < 60 %.
- „Nochmal“ bei nicht erreichbarer Online-Suche und Markenliste (`fbrLoad`).
- Suche-Sheet mit fester Höhe (`.sheet.fs`, 88dvh), sonst schrumpft es bei wenig Treffern und das Feld liegt hinter der Tastatur.
- Eigenes Lebensmittel: Feld „Barcode (optional)“ mit Scan-Knopf.
- Fehler beim Patchen: `waSet` doppelt statt `fSd` – `check.py` hat es gefunden.

### 2026-10-22 – Wasser genau, Tagesleiste mit Balken, Zutaten suchen, „zu viel“ in Rot
- Wasser: Zeile mit fester Breite (Wert 92 px, tabellarische Ziffern), + = 250 ml, Antippen öffnet Sheet (`waHtml`): Chips +150…+750 ml, ±50 ml, Feld für den genauen Wert. `data-fwa` addiert jetzt ml.
- Tagesleiste: kcal-Balken je Tag statt Punkt; grün = Protein erreicht und kcal im Rahmen, rot = über 110 %.
- Zu viel: `fbar` kennt `over` für Fett/Kohlenhydrate (> 110 %) und Zucker (> Grenze), rot gestreift; Protein/Ballaststoffe dürfen drüber. Mengenwahl warnt mit roten Chips („Fett +50 g“).
- Gericht: „Zutat suchen“ öffnet die normale Suche im Zutat-Modus (`ui.ingm`, `ingAdd`, `ingBack`) inkl. Kategorien, Online, Marke, Barcode; „Von Hand“ wie bisher.
- Marke: Icon oben im Kopf der Mengenwahl, Liste darunter mit „Barcode“ und „Fehlt? Anlegen“ (eigenes Lebensmittel mit Werten des Grundprodukts vorbefüllt). Eigenes Lebensmittel hat ein Feld „Marke“.
- Listen zeigen „x g Protein“ statt P/F/K. Suche ohne „Zuletzt“ (nur Kategorien).
- Rauchtest: Open Food Facts wird per `ctx.route` mit leerer Antwort ersetzt (sonst echte Anfragen und CORS-Fehler aus `file://`).

### 2026-10-21 – Rechner klarer, Tagesleiste, Wasser, „Passt das noch?“, Marken, Fast Food je Portion
- Rechner: Ergebnis klebt oben im Sheet (sticky, feste Höhe, Ziffern gleich breit) → kein Springen beim Schieben; Lernen und Rechenweg unter den Reglern. Ruhetag/Training mit Beschriftung, Training mit Kästchen (Zuschlag an/aus). Makros als 5 Spalten mit Namen. Rechenweg als Tabelle inkl. Makro-Herleitung. Echter Bedarf geprüft: est = Ø gegessen − Gewichtstrend × 7700, Anpassung = est − Formel (ohne Anpassung), wird zu `pr.adj`; „Anpassung entfernen“ setzt 0.
- Fehler: `.cres2 > div` überschrieb `.ctop` (Spezifität) → Rechner-CSS neu (`.cres`, `.cday`, `.cmac`, `#c-way`).
- Sheets ohne Scrollbalken.
- Varianten mit Grundname (`bn`, `vl`): Listen zeigen „Milch“, Einträge „Milch 1,5 %“ (`fEn`), Suche findet über alle Varianten (`fHay`), zeigt nur die erste. Getränke in ml (`ml`, auch eigene/importierte).
- Fast Food (`pc`): nur Verkaufsportionen (6er-Box, Portion mittel), Schritte in der Grundeinheit (`~` = Grundeinheit, `ub`). Werte über Nährwert-Datenbanken an die offiziellen Portionsgewichte angepasst (Big Mac 232 g/545 kcal, Cheeseburger 121 g/307, 6 Nuggets 109 g/267, Pommes mittel 114 g/329, Whopper 275 g/~600).
- Mengenwahl: „Passt das noch?“ (`ffitHtml`: Balken bisher + diese Menge, kcal frei/drüber, Protein), „Marke wählen“ (`fbrHtml`, Open Food Facts zum Grundnamen).
- Eigenes Lebensmittel: Barcode scannen (Entwurf bleibt erhalten, `ownDraft`), g/ml.
- Essen: Tagesleiste (7 Tage, `ui.fsd`/`fSd`), Sheets tragen in den gewählten Tag ein. Wasser `food.wa {Tag: ml}`, Ziel 35 ml/kg.

### 2026-10-21 – Online-Suche, Barcode, Varianten, Fast Food, Rechner ohne Worte
- Tab-Leiste wieder nicht am Rand (iOS-Web-App, nach `html/body height: 100%`) → `html { height: 100lvh }` wie früher am body. Scrollbalken von `#app` ausgeblendet.
- Open Food Facts (frei, ohne Schlüssel): Suche ab 3 Zeichen (600 ms nach dem Tippen) über `cgi/search.pl`; Barcode über `api/v2/product`. `search.openfoodfacts.org` ist ohne CORS, also unbrauchbar. Die cgi-Suche antwortet oft mit 503 ohne CORS-Header („Failed to fetch“) → bis zu 3 Versuche, abwechselnd de/world. Gewählte Produkte werden eigene Lebensmittel mit `b` (Marke) und `bc` (Barcode), danach offline.
- Barcode: `BarcodeDetector`, sonst (iOS) `barcode-detector@3.2.2` (zxing-wasm) von jsDelivr, erst beim ersten Scan geladen; Service Worker (v2) cacht jsDelivr. Unbekannter Barcode → eigenes Lebensmittel mit diesem Barcode anlegen.
- `FOODS`: `*` markiert die vorgewählte Portion (Skyr 500 g, Restaurant „Teller“). Varianten `FVAR` (Light, Fettstufen, Zero, alkoholfrei), umschaltbar in der Mengenwahl, in Kategorien nur die erste. Kategorie Fast Food (McDonald's, BK, Subway, KFC).
- Rechner: Ruhetag (Mond) und Trainingstag (Hantel, antippen = Zuschlag an/aus) statt Schalter, Makros als P/F/K/B/Z, Regler nur mit Wert, „sitzend–körperlich“ als Skala. `palText` entfernt.

### 2026-10-21 – Seite steht fest, kein Markieren/Zoom, Rechner kompakt, Restaurant-Gerichte
- Nur noch `#app` scrollt (`position: fixed; overflow-y: auto`), `html/body` haben `overflow: hidden`. Kurze Seiten (Plan) scrollen nicht mehr, kein Gummiband an Kopf und Tab-Leiste. Alle `window.scrollTo/scrollY` → `$('app')`. `compare.js` hebt das für Ganzseiten-Screenshots auf.
- Markieren aus (`user-select: none` am body, Eingabefelder ausgenommen, sonst lässt iOS nicht tippen). Zoom aus: Viewport `maximum-scale=1,user-scalable=no`, `touch-action: pan-x pan-y`, `gesturestart` blockiert.
- Fehler: `.rng` war doppelt (Zeitraum-Knöpfe im Verlauf + Rechner-Regler) → Regler lagen in grünen Kästen. Rechner nutzt jetzt `.crg`; Ergebnis oben (Ruhetag/Training groß, Makros in einer Zeile, Rechenweg aufklappbar), Eingaben in einer Zeile.
- Kachel antippen öffnet die Mengenwahl mit der letzten Menge (statt sofort einzutragen).
- 12 Restaurant-Gerichte mit Tellergröße klein/normal/groß (mittlere vorgewählt), Kategorie „Restaurant & Imbiss“.

### 2026-10-21 – Essen: Kachelreihe zum Wischen, Kategorien, Statistik im Verlauf
- Schnell-Kacheln: eine Reihe mit bis zu 12, wischbar (Scroll-Snap, 4 sichtbar, die 5. lugt hervor, `data-noswipe`).
- Suche ohne Eingabe: 5 × „Zuletzt“, darunter Kategorien (`FCATS`, setzt `FOODB[id].cat`) plus Eigene und Gerichte; `ui.fcat` bleibt beim Zurück aus der Mengenwahl erhalten.
- Ernährungs-Statistik aus Essen entfernt, jetzt `foodStats` unter Verlauf › Körper.
- Teller-Foto verworfen (bräuchte externen KI-Dienst, ±20–40 % ungenau).

### 2026-10-21 – Essen neu: Schnell-Kacheln, Datenbank, Mengenwahl, Rechner mit Training und Lernen
Mit Falk per Skizze abgestimmt: Schnell-Kacheln zuerst; Rechner = Formel + Trainingstage + Lernen aus dem Gewicht; Nährwerte inkl. Ballaststoffe und Zucker; Barcode später.
- Seite: Bilanz (kcal groß mit Balken und Trainingszuschlag, 5 Mini-Balken; Zucker als Obergrenze), 8 Schnell-Kacheln (häufigste Einträge mit Menge, 1 Tipp, Rückgängig im Toast, kurzes Aufleuchten), Suchen / Gerichte / Schnell, Liste Heute, Verlauf.
- Suche: Datenbank (`FOODS`, ~100 Lebensmittel), eigene Lebensmittel, Gerichte, ohne Eingabe „Zuletzt“. Antippen → Mengenwahl (Portionen und Gramm, Stepper, Live-Werte), Heute/Gestern.
- Gerichte: Zutat aus der Datenbank wählen füllt alle Nährwerte. Eigene Lebensmittel mit Werten je 100 g und Portion.
- Ziele: automatisch (Rechner, je Tag; Trainingstage mehr) oder eigene Werte. Neue Datenformen siehe DEVELOPMENT.md; `cleanFood` behält alles (auch für Rückgängig, das über `cleanFood` lädt).
- Alte Daten geprüft: Stand der Vorversion erzeugt und in die neue geladen. 233 Einträge erhalten, eigene Ziele bleiben eigene, alte Einträge öffnen im Schnell-Eintrag, alte Gerichte zeigen unbekannte Werte als „–“ statt 0.
- Fehler: Portion „2 Portion“ statt „1 Schale“ und 100 g als „2,5 Portion“ → kleinste ganze Portion, Gramm-Knöpfe immer in Gramm, Mehrzahl als „2× Scheibe“. Lernen schlug −1650 kcal vor (Demo trug zu wenig ein, im echten Leben = vergessene Einträge) → Vorschlag nur bei ≤ 30 % Abweichung, sonst Hinweis. Toast lag über offenen Sheets → bei offenem Sheet oben.
- Profil „Ziel“: Aktivität entfernt (jetzt „Alltag ohne Sport“ im Rechner), neues Ziel setzt das Tempo auf den Standard.
- 53 tote CSS-Regeln der alten Essen-Ansicht entfernt (Ringe, alter Rechner, alte Gerichte-/Schnellansicht); andere Tabs per Pixelvergleich geprüft (Abweichungen nur durch andere Demo-Zufallswerte).

### 2026-10-21 – Aufräumen nach dem Plan-Umbau
- Toter Code per Scan entfernt: 73 CSS-Regeln (u. a. alte Heatmap, Reste aus den Chat-Iterationen), Funktionen `stageHtml`, `goalChips`, `sessRow`, `reqText`, ui-Schlüssel `data`/`wgnow`, Icon `list`. Doppelte Regeln für Plan und Tab-Leiste zusammengeführt (Rest betrifft Heute/Essen, kommt mit deren Umbau).
- Absicherung: Pixelvergleich aller Ansichten (hell/dunkel) alt gegen neu mit fester Uhrzeit, festem Zufall, ohne Animationen. Fand einen Fehler: `.cd.l1–l4` (Verlaufskalender) wirkten tot, weil die Klasse zusammengesetzt wird (`'l' + Stufe`) – wiederhergestellt. Lehre: Klassen aus Code-Teilen (`'g' + k`, `'t' + tier`, `'l' + n`) erkennt kein Scan, daher immer mit dem Pixelvergleich prüfen.

### 2026-10-21 – Plan-Tab neu (Endstand nach mehreren Runden mit Falk)
Ziel: Plan ist Werkzeug, kein Spiel. Serie/XP bleiben in Heute/Verlauf. Weg dorthin: Agenda-Liste → Kalender (Falk: vertrauter) → Planer mit Karten → mehrere Pläne. Formen jeweils vorher per Skizze abgestimmt.
- **Kalender:** Wochenstreifen, Tipp auf den Monat klappt zum Monat auf; ‹ ›, Wischen (folgt dem Finger, Seite scrollt nicht), Heute-Icon (immer da, nur unsichtbar). Zellen: Icon des Trainingstags, ✓, rote Glocke (Meldungen heute), Waage (Wiegen fällig, auch künftig), ☀/Thermometer (Urlaub/Krank), durchgestrichen (ausgesetzt). Karten-Icon im Kopf öffnet den Planer.
- **Tageskarte:** „Zu tun“ (Meldungen), Boxen je Trainingstag (Übungen, Dauer `durEst`, Fortschritt, aufklappbare Liste mit Ziel/letztem Bestwert), Pillen für das ursprünglich Geplante, „Training starten“. ✎ = Tag ändern: Tauschen (Partner im Kalender wählen), Aussetzen, Ersetzen, Zusätzlich, Urlaub, Krank; jede Aktion schaltet sich beim zweiten Tippen aus.
- **Planer:** Woche Mo–So als Entwurf, Leiste „Nicht gespeichert“ ab der ersten Änderung. Sammelkarten (alle passen auf den Bildschirm, Wischen hebt hervor, nach oben ziehen legt), Grenzen ohne Text (zu oft, Doppelbelastung Pull/Push auch So→Mo). „Meine Pläne“: Name, Mini-Woche, Status, Aktivieren ab heute/Montag/Datum.
- **Editor:** Icon, Farbe, Rhythmus (jede/alle 2/3 Wochen/einmalig ab Startwoche); Übungen mit Schaltern, gesperrte ganz unten mit Fortschrittsring und Bedingungen.
- **Datenformen** (Details in DEVELOPMENT.md): `days[].i/rp/st`, `wp`, `act`, `off`, `ovk`. Migration in `plan()`, alles in `cleanPlan` behalten.
- **Serie:** Urlaub/Krank-Tage zählen nicht als Lücke (`offCount` in `streakCalc`/`derive`), Ziele bleiben.

Fehler und Lösungen:
- `data-pf` doppelt (Profil-Sheet fing den Editor-Filter ab) → Editor `data-pef`, `check.py` prüft doppelte Klick-Attribute.
- Grid-Listen breiter als der Platz (lange `nowrap`-Texte) → `grid-template-columns: minmax(0, 1fr)`.
- Zugeklappter Bereich (`grid-template-rows: 0fr`) belegte Platz: negativer Rand wird im Grid per `stretch` zur Höhe → Abstände über Ränder statt `gap`.
- Nach dem Ziehen kam der nächste Tipp nicht an: Neuaufbau beim `pointerup` entfernte die berührte Karte vor `touchend` → Neuaufbau 40 ms später, `touchmove` beim Ziehen `preventDefault`.
- `cleanPlan` hätte neue Felder (`wp`) beim Laden verworfen → bei jeder neuen Datenform `cleanPlan` mitziehen und mit Neuladen testen.
- Doppelbelastung nicht erkannt (Druck-Tage hantellastig) → Belastung = ≥3 Pull- bzw. Push-Übungen, nicht Hauptgruppe.
- Seite scrollte unnötig: Sicherheitsabstand unten doppelt (`build.py` + `.page`). Tab-Leiste zu hoch auf kurzen Seiten (iOS-Web-App) → `body` mindestens `100lvh`, oberer Sicherheitsabstand im `body` statt an `:root`.
- Safari schneidet Kinder eines `backdrop-filter`-Elements ab (Heute-Kreis) → Unschärfe auf `.tabs::before`.
- Hervorgehobene Karte über der Menüleiste → Hand mit eigener Ebene (`isolation`).
- Irrweg (1 h): Playwright-WebKit unter Windows erzeugt aus Tipps oft keinen Klick, obwohl es auf dem iPhone geht. WebKit nur für Layout, Interaktion mit Chromium + CDP-Touch.

### 2026-10-21 – Design-Skills
- 11 Skills aus `emilkowalski/skills` (Commit 2d22863) nach `.claude/skills/` übernommen, vorher gelesen (nur Markdown, keine Scripts). Weggelassen: animate-expo, write-swift, ask-sonner, pick-ui-library.

### 2026-10-21 – Prüfskript, Rauchtest, sicherer Deploy, Versionsanzeige
- `tools/check.py`: Syntax, doppelte Namen auf IIFE-Ebene, Build in einem Aufruf.
- `tools/smoke.js` (ersetzt `test-example.js`): lädt jedes Demo-Szenario über einen eingeschobenen `data-demo`-Knopf, klickt Tabs, Segmente, Detail und Sheet durch. Erster Lauf: keine Fehler, ~50 s.
- Action prüft vor dem Veröffentlichen (check + smoke), Runner auf `ubuntu-24.04` gepinnt (`ubuntu-latest` wechselt auf Ubuntu-26-Beta).
- Versionsanzeige unten im Zahnrad-Menü.

### 2026-10-21 – Setup: Node, Git, öffentliches GitHub-Repo
- Node 24 LTS installiert (vorher nur npm-Reste, `node --check` ging nicht), Git-Identität gesetzt.
- Repo wird öffentlich auf GitHub (Pages kostenlos). Deshalb: `docs/Notes.md` und `*backup*.json` gitignored, Commit-E-Mail ist die GitHub-noreply-Adresse.
- Hosting einmal festlegen: localStorage hängt an der Adresse, ein Hostwechsel heißt Backup + Wiederherstellen.

### 2026-10-21 – Umzug aus Claude Chat auf lokalen Rechner
- Projekt aus Claude Chat übernommen, Git-Repo angelegt, Ordner im üblichen Stil aufgeräumt (`docs/`, `.gitignore`, `.gitattributes`, `.vscode/`, `package.json` für Dev-Tools).
- `CLAUDE.md` aufgeteilt: Regeln bleiben dort, Aufbau/Daten nach `docs/DEVELOPMENT.md`, Ideen hierher.
- `build.py`: liest/schreibt jetzt explizit UTF-8 ohne CRLF-Umwandlung. Vorher las Python unter Windows cp1252 und schrieb CRLF (Ausgabe wich ab, manche Emoji hätten den Build abstürzen lassen). Läuft jetzt von jedem Ordner aus und legt `dist/` selbst an. Ausgabe ist byteidentisch zum alten `dist/index.html`.
- `tools/*.js`: Sandbox-Pfade (`/opt/pw-browsers/chromium`, `/tmp/work/webapp/`) entfernt. Icons gehen nach `public/`, Test-Screenshots nach `tools/out/`, Test öffnet `dist/index.html` über eine gültige file-URL.
- `dist/` ist jetzt gitignored (wird aus `src/` + `public/` gebaut).
- Duplikat-Check: nur lokale Hilfsfunktionen `X`/`Y`/`v` in verschiedenen Funktionen, kein Konflikt.
