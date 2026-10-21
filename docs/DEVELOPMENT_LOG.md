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
