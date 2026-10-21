# Zenit – Entwicklungslog

Neueste Einträge oben. Hier stehen Änderungen, Fehler und Lösungen sowie offene Ideen. Stabile Referenz (Aufbau, Datenformen) steht in `DEVELOPMENT.md`.

## Offen / Ideen
- Zutatendatenbank (~150 Standardzutaten) + Gerichtsvorlagen
- Barcode-Scan (Open Food Facts + ZXing, nur in der gehosteten Web-App)
- Foto der Nährwerttabelle
- Deload-Wochen
- Push-Erinnerungen (spät)
- Schlaf (später)
- Cleanup / Icons / Text reduzieren

## Verlauf

### 2026-10-21 – Tab-Leiste auf kurzen Seiten, Heute-Icon, Karten unter der Leiste, Plan-Namen
- Tab-Leiste: Falks Hinweis „bei Heute und Essen richtig“ = die langen Seiten. Auf kurzen Seiten (kürzer als der Bildschirm) sitzt die feste Leiste in der iOS-Web-App zu hoch. Lösung: `body` mindestens `100lvh`, der obere Sicherheitsabstand als `padding-top` im `body` statt an `:root` (`build.py`), so wird nichts scrollbar. `fixBar` (visualViewport-Korrektur aus dem Schritt davor) wieder entfernt, sie half nicht.
- Heute-Icon im Kalender ist immer da (nur unsichtbar), der Monatstitel springt nicht mehr.
- Karten-Hand bekommt eine eigene Ebene (`isolation`), die hervorgehobene Karte liegt unter der Menüleiste.
- Plan-Name leer → beim Verlassen kleinster freier Name „Plan n“ (`wpName`), auch für neue Pläne.
- Irrweg (1 h): Playwright-WebKit unter Windows erzeugt aus Tipps oft keinen Klick (zufällig, auch auf einfachen divs), obwohl es auf dem iPhone geht. WebKit nur noch für Layout; Interaktion mit Chromium + CDP. Karten/Tage im Planer haben jetzt trotzdem `cursor: pointer` + `role="button"` (Barrierefreiheit, ältere iOS).

### 2026-10-21 – Ausnahmen als Bausteine, anstehendes Wiegen, Monatstitel, Planer-Leiste, Tab-Leiste
- Ausnahmen eines Datums als Bausteine `plan.ovk[tag] = {s, w, b, r, a}` (ausgesetzt, getauscht mit w/übernommenes Training b, ersetzt, zusätzlich); `ov[tag]` wird daraus berechnet (`ovSetF`). So gehen Ersetzen + Zusätzlich oder Tauschen + Zusätzlich gleichzeitig, jede Aktion einzeln zurücknehmbar. Aussetzen schließt alles aus, Ersetzen/Tauschen gegenseitig. Alte Einträge ohne Bausteine (Heute-Tausch) werden als „ersetzt“ gelesen.
- Anstehend im Kalender: Wiegen fällig (letzte Messung + 7 Tage) als Waage an dem Tag; Tageskarte bietet „Jetzt eintragen“. Wird früher gewogen, wandert der Termin mit.
- Monatstitel: Name groß, Jahr klein, „Heute“ als Icon; passt bei 375 px für alle Monate.
- Planer: „Speichern“ oben entfernt; Leiste „Nicht gespeichert“ (Verwerfen/Speichern) erscheint ab der ersten Änderung. Zurück mit offenen Änderungen lässt die Leiste aufblinken, Verwerfen bleibt im Planer.
- Tab-Leiste zu hoch auf dem iPhone (nicht nachstellbar): `fixBar` misst `visualViewport.height + offsetTop - innerHeight` und schiebt die Leiste an den sichtbaren Rand (nach Tastatur, Datumswähler, App-Wechsel). Wirkung auf dem Gerät noch offen.

### 2026-10-21 – Mehrere Wochenpläne, Sammelkarten, Tag ändern über den Kalender, nur Hochformat
- Mehrere Pläne (Aufbau, Ausdauer …): gespeichert ≠ aktiv. Aktivieren ab heute / ab Montag / ab Datum legt einen Eintrag im Zeitstrahl `plan.act` an; erst dann übernimmt der Kalender den Plan ab diesem Tag. „Meine Pläne“ unten im Planer: Name direkt editierbar, Mini-Woche, Status (aktiv seit / ab Datum mit ✕ / gespeichert), Bearbeiten, Aktivieren, Löschen. Neue Datenform `wp[].id`, `act`, `ovk` (siehe DEVELOPMENT.md), Migration in `plan()`.
- Einstieg nur noch über ein Karten-Icon im Kalenderkopf (eine Wochenansicht statt zwei).
- Verwerfen: eigene Leiste unter dem Kopf statt Text im Zurück-Knopf (überlappte).
- Sammelkarten: Verlauf, Punktmuster, Icon im leuchtenden Kreis, Glanz läuft über die hervorgehobene Karte. Alle Karten passen auf den Bildschirm (Überlappung aus Anzahl und Breite), symmetrisch gefächert. Seitlich über die Hand wischen hebt die Karte unter dem Finger hervor, nach oben ziehen legt sie.
- Tag ändern: jede Aktion schaltet sich beim zweiten Tippen aus (kein Zurücksetzen). Tauschen hebt im Kalender die möglichen Tage hervor (ab heute, kein Urlaub, nicht dasselbe Training), Tippen tauscht beide Tage. Ausgesetzt: im Kalender durchgestrichen, in der Karte Pille mit dem ursprünglichen Training; Ersetzen/Tauschen zeigen ebenfalls eine Pille. Urlaub/Krank: nur noch die Anzahl Tage.
- Nur Hochformat: iOS ignoriert die Ausrichtung im Manifest, daher im Querformat (Höhe ≤ 500 px) ein Hinweis statt der App.
- CSS: alte und neue Karten-Regeln zu je einer Regel zusammengeführt (keine Schichten).


### 2026-10-21 – Wochenplaner (ersetzt „Woche & Tage“)
- Idee von Falk: Woche Mo–So als Entwurf (`ui.draft`, gilt erst nach „Speichern“, Zurück fragt „Verwerfen?“), darunter Trainingstage als farbige, leicht schwebende Karten in einer seitlich scrollbaren Hand. Karte nach oben auf einen Tag ziehen (Pointer-Events, Geisterkarte) oder antippen + Tag antippen; ✕ am Tag entfernt; ✎ auf der Karte öffnet den Editor. Wochentage gibt es nur noch hier (`wdChips` im Editor entfernt).
- Presets: Leer, Standard (`defaultPlan`), eigene Wochen speichern/löschen. Neue Datenform `plan.wp: [{n, m: {tagId: [wd]}}]`. Fast vergessen: `cleanPlan` hätte `wp` beim Laden verworfen (Presets nach Neustart weg); nachgetragen und mit Neuladen geprüft.
- Grenzen ohne Text: Karte über dem Wochenlimit (`LIM` je Hauptgruppe: Kraft 3, Bike 4, Mobility 7) = roter Rand, roter Punkt, ⚡; Doppelbelastung (Tag mit ≥3 Pull- bzw. Push-Übungen an zwei Tagen hintereinander, auch So → Mo) = rote Kante + ⚡ an beiden Tagen, Karte rot. Erst über die Hauptgruppe gerechnet: Druck-Tage sind hantellastig, wurden nicht erkannt.
- Plan-Seite: Einstieg „Woche planen“ mit Mini-Woche statt Trainingstage-Leiste; passt auf dem iPhone ohne Scrollen (844/844).
- Fehler: Nach dem Ziehen kam der nächste Tipp nicht an. Ursachen: Neuaufbau beim `pointerup` entfernte die berührte Karte vor dem `touchend`; außerdem lief die native Touch-Geste weiter. Lösung: Neuaufbau 40 ms verzögert, `touchmove` während des Ziehens `preventDefault`. Mit CDP-Touch-Events nachgestellt und geprüft.
- Rauchtest: schwebende Karten sind nie „stabil“, dort Klick mit `force`.
- Tote CSS-Reste der alten Ansichten entfernt (`.pbar`, `.pbc`, `.tdr`, `.wds`, `.agl/.agr/...`).

### 2026-10-21 – Tag ändern, Urlaub/Krank, kein unnötiges Scrollen
- Tag ändern (✎ in der Tageskarte): beschriftete Knöpfe Tauschen, Aussetzen, Ersetzen, Zusätzlich, Urlaub, Krank (`dayEdit`, `ui.pmode`); zweite Ebene darunter (Tag zum Tauschen, Trainingstag, Dauer 1–14 Tage). Vergangene Tage (bis 14 zurück): nur Urlaub/Krank. `ovSet` aufgeteilt in `ovPut` (ohne Neuaufbau) + Rendern.
- Neue Datenform `plan.off: [{a, b, k: 'vac'|'sick'}]`. `schedFor` gibt dort nichts zurück; Kalender zeigt ☀/Thermometer; Karte zeigt Zeitraum mit Löschen.
- Serie geschützt, Ziele bleiben (Falks Wahl): `streakCalc` und `derive` zählen Urlaub/Krank-Tage nicht als Lücke (`offCount`, liegt außerhalb des PURE-Teils, wird zur Laufzeit gefunden). Test: Szenario „Serie gerissen“ + 7 Tage Urlaub über die Lücke = Serie 0 → 52.
- Fehler: Seite scrollte, obwohl alles passte. Der untere Sicherheitsabstand (Home-Leiste) wurde doppelt gerechnet (`:root` in `build.py` und `.page`), dazu 112 px Puffer. Jetzt nur in `.page`, Puffer 80 px; `overscroll-behavior: none` gegen Gummiband.
- WebKit (Playwright) installiert, um iPhone-Fehler nachzustellen: `pw.webkit` + `devices['iPhone 14']`. Tab-Leiste dort korrekt; Falk schickt Screenshot.

### 2026-10-21 – Plan: Rhythmus, gesperrte Übungen, Tab-Leiste
- Neue Datenform `plan.days[].rp/st` (einmalig, jede, alle 2/3 Wochen ab Startwoche). `schedFor` und `ovSet` nutzen dafür `onDay`; Editor: Rhythmus-Wahl und Startwoche ‹ ›; Rhythmus steht an Chips und in den Listen.
- Editor: gesperrte Übungen ohne Schalter, immer ganz unten („Gesperrt“, nach Fortschritt sortiert), Fortschrittsring in Prozent (`lockPct`, Mittel der Bedingungen), Antippen zeigt die Bedingungen mit Balken (`ui.plk`). Zähler zählen nur verfügbare Übungen.
- Trainingstage-Leiste: höchstens 3 pro Reihe (Grid statt Scrollen).
- Wischen: Kalenderbox schneidet die mitgehenden Tage ab (`overflow: hidden`).
- Tab-Leiste: Safari schneidet Kinder eines Elements mit `backdrop-filter` an dessen Rand ab, dadurch war der Heute-Kreis oben abgeschnitten. Unschärfe liegt jetzt auf `.tabs::before`. Markierung wird über Bounding-Rects platziert und bei `pageshow`, Viewport-Änderung und geladenen Schriften neu gesetzt (Verdacht auf Versatz auf dem iPhone, in Chromium nicht nachstellbar).
- Fehler: `.exr span { flex: 1 }` traf auch den Ring (ebenfalls `span`), er wurde 160 px breit. Regel auf `> span:first-child` beschränkt.

### 2026-10-21 – Plan: Wischen, Tag-Icons, Glocke, Tageskarte, neuer Editor
- Wischen im Kalender: eigener Touch-Modus `cal`. Richtung nach 8 px; seitlich folgt das Raster gedämpft dem Finger, `preventDefault` stoppt das Mitscrollen der Seite (touchmove-Listener dafür `passive: false`). Loslassen: > 50 px oder schnell = blättern, sonst zurückfedern. Mit CDP-Touch-Events getestet.
- Neue Datenform: `plan.days[].i` (Icon, `DAYI`), `dIcon`/`domGroup`. Gesetzt in `defaultPlan`, `PRESETS`, neuem Tag, `dayObj` (g:), behalten in `cleanPlan`. Kalenderzellen und Chips zeigen das Icon.
- Meldungen: rote Glocke an der Heute-Zelle, „Zu tun“ mit Zähler, aufklappbar (`ui.todo`).
- Tageskarte: je Trainingstag eine kompakte Box (Icon, Übungen, Dauer, Fortschritt), Übungsliste mit Ziel und letztem Bestwert klappt auf (`ui.pdo`), „Außerdem“ für ungeplant Trainiertes, „Training starten“.
- Editor: Icon-Wahl, Farbe, Tage in einem Block; Übungen als Liste mit Schaltern je Gruppe, gesperrte gedimmt mit Schloss und Bedingung; Start im Filter der Hauptgruppe, Zähler an den Filter-Chips. Alte Karten (`xcard`, `.xc`, „Nur verfügbar“) entfernt.
- Fehler (alt): `data-pf` war doppelt belegt (Profil-Sheet und Editor-Filter), der Profil-Handler kam zuerst, der Filter öffnete ein Profil-Sheet. Lösung: Editor nutzt `data-pef`; `check.py` meldet jetzt doppelte Klick-Attribute.
- Fehler: Grid-Listen wurden durch lange `nowrap`-Untertitel breiter als der Platz (Schalter abgeschnitten). Lösung: `grid-template-columns: minmax(0, 1fr)`.
- Demo-Rauchtest klickt jetzt auch Editor, Zu tun und Tag-Boxen.

### 2026-10-21 – Plan-Tab als Kalender (ersetzt die Agenda-Liste)
- Falk wollte eine Kalenderansicht (vertrauter, besser zu navigieren); die Liste war ein Missverständnis. Form diesmal vorher per Skizze abgestimmt.
- Kalender: Wochenstreifen, Tipp auf den Monat klappt zum Monat auf (`ui.cm`), ‹ › und Wischen blättern (`calMove`, ±6 Monate), Anker `ui.ca`, gewählter Tag `ui.pd`. Zellen: Farbpunkte der geplanten Tage, ✓ bei Training, Punkt an heute bei Meldungen.
- Tageskarte: „Zu tun“ (Meldungen st/tr/wg/f0/fp) bei heute, geplante Tage, ✎ klappt die Ausnahme für das Datum auf (`ui.pchg`), Gruppen, „Training“. „Wochenziel wackelt“ unter dem Kalender, neue Übungen bei Trainingstage.
- Alles auf einen Bildschirm: Trainingstage als Chip-Leiste (Tipp = Editor), ✎/+ öffnet „Woche & Tage“ (`ui.pman`, `viewPlanManage`) mit Wochenvorlage, Balance, Liste.
- Demo „Leer“ trägt jetzt wirklich nichts ein (vorher heutiges Gewicht + Essen), sonst sah man nie eine Meldung.
- Fehler: zugeklappter Bereich (`grid-template-rows: 0fr`) belegte in der Karte 10 px, weil ein negativer Rand im Grid per `stretch` zur Höhe wird. Lösung: Abstände in `.pday` über Ränder statt `gap`.
- Weitere tote CSS-Reste entfernt (`.pdays`, `.pd`, alte `.pday`, `.pnew`).

### 2026-10-21 – Plan-Tab neu: Agenda, Woche, Trainingstage
- Ziel (mit Falk besprochen): Plan ist Werkzeug, kein Spiel. Flammen/XP/Monatsziel raus, Serien-Kalender bleibt im Verlauf (`#calw`).
- Agenda: vorgestern bis +6 Tage (`ui.pa`, „7 Tage“ verlängert bis +27), Tag antippen klappt auf: Gruppen, Ausnahme für das Datum (`data-ctog`/`crest`/`creset`, wie vorher über `plan.ov`), heute „Training“. Hinweise (`notices`) sitzen jetzt im Plan: Tages-Hinweise an der Heute-Zeile, „Wochenziel wackelt“ im Agenda-Kopf, neue Übungen bei Trainingstage.
- Woche: Mo–So mit Zuordnung (`data-wd`), Balance (Tage pro Gruppe, 0 bei Pull/Push/Core sichtbar), Hinweis „ohne Pause“ bei Pull/Push an zwei Tagen hintereinander (Hantel ausgenommen, mischt Zug/Druck).
- Trainingstage als Liste mit Wochentagen, Übungszahl und geschätzter Dauer (`durEst`: Mittel der letzten Einheiten, an denen genau dieser Tag geplant war).
- Aufklappen ohne Neuaufbau (`rowToggle`, `grid-template-rows`-Übergang 220 ms), Ausnahme gesetzt = kurzes Aufleuchten der Zeile, `prefers-reduced-motion` beachtet.
- Datenform unverändert. Entfernt: Monatskalender im Plan, `ui.pm`/`ui.px`, Wischen für Monate, 121 tote CSS-Regeln (`.pcx`, `.pc*`, `.pd2`, `.nt`, `fpulse` …).

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
