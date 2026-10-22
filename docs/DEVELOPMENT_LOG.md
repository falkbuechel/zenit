# Zenit – Entwicklungslog

Neueste Einträge oben. Hier stehen Änderungen, Fehler und Lösungen sowie offene Ideen. Stabile Referenz (Aufbau, Datenformen) steht in `DEVELOPMENT.md`.

## Offen / Ideen
- Essen: Barcode-Scan und Online-Suche (Open Food Facts), eigene Runde
- Essen: weitere Lebensmittel / Gerichtsvorlagen nach Bedarf
- Foto der Nährwerttabelle
- Deload-Wochen
- Push-Erinnerungen (spät)
- Schlaf (später)
- Heute/Essen: doppelte CSS-Regeln aus der Chat-Zeit zusammenführen (39 Selektoren mehrfach, mit `tools/compare.js` absichern)
- Weitere anstehende Termine im Kalender (z. B. Körpermaße monatlich, wie das Wiegen)
- Icons / Text reduzieren in Heute, Essen, Verlauf, Profil (Plan ist fertig)

## Verlauf

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
