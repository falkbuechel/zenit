# Zenit – Home-Workout-Game (PWA fürs iPhone, nur für Falk)

@docs/DEVELOPMENT.md

## Arbeitsweise
- Deutsch, kurz: keine Einleitung, keine Wiederholung der Aufgabe, keine Zusammenfassung, wenn nicht gefragt.
- Gezielte Edits statt ganze Dateien neu schreiben. Vor Vorschlägen den betroffenen Code lesen.
- Falk testet Visuelles/Interaktives selbst auf dem iPhone und meldet sich; nicht danach fragen.
- Neue Screens oder Umbauten: erst Layout-Varianten (AskUserQuestion mit Vorschau) zeigen, dann bauen.
- Rundenstart: `git status --short`, `gh run list --limit 1` (Deploy der letzten Runde).
- `docs/DEVELOPMENT_LOG.md`: nur die relevanten Abschnitte lesen; Änderungen, Fehler, Lösungen oben eintragen. Offene Punkte stehen dort unter „Offen“.

## Dateien
- Bearbeiten: `src/` (Gerüst, `css/`, `js/` nach Bereichen, siehe Aufbau), `public/`, `build.py`, `tools/`. `dist/` ist Build-Ausgabe, nie von Hand.
- Nur die Dateien des betroffenen Bereichs lesen; Funktionen/Klassen per grep über `src/` finden statt ganze Dateien zu lesen.
- `docs/Notes.md` = Falks Notizbuch: lesen ja, nie bearbeiten. `CLAUDE.md`, `README.md`, `docs/DEVELOPMENT.md` nur auf Wunsch umbauen (DEVELOPMENT.md auch bei neuen Datenformen).

## Code-Regeln
- `<!--PWA-->` nicht entfernen (Head kommt aus `build.py`). Die Datei läuft auch als Claude-Artifact (`window.claude`).
- Funktionsnamen, Klick-Attribute (`data-x`) und CSS-Selektoren nur einmal; der Hook prüft das nach jedem Edit.
- Datenform/Signatur geändert → alle Aufrufstellen per grep prüfen. Migration muss alte Daten behalten (`clean*` verwirft sonst still); vorher Falk an Backup erinnern.
- Klassenname `x` ist belegt (Button 40px). Icons: Objekt `P` + `ic(name)`.
- Klicks über einen Handler am `document`. Antippbare `div`/`span`: `cursor: pointer` + `role="button"`.
- Neue CSS-Werte in die bestehende Regel. Zeilen > 400 Zeichen beim Anfassen umbrechen.
- Keine Abhängigkeiten/Frameworks/Server ohne Rückfrage.
- Design: ruhiges Salbeigrün + Anthrazit, wenig Grün, wenig Text, Icons statt Beschriftung, klare Bereichsgrenzen.

## Prüfen und veröffentlichen
- Hook nach jedem Edit: `tools/check.py --fast` (Syntax, Duplikate, Manifest). Still bei Erfolg.
- Vor dem Commit: `/check` oder Agent `tester` (Haiku, meldet nur Fehler). Vor größeren Commits: Agent `reviewer` (Sonnet).
- Playwright: Chromium für Klick/Touch, WebKit nur für Layout. Messen statt Screenshot-Runden.
- Aufräumen: danach `node tools/compare.js` → „Alles gleich“ (dynamische Klassen wie `'g' + k` erkennt kein Scan).
- Push auf `main` = live auf Falks iPhone (die Action prüft vorher). Nach dem Push nicht auf den Deploy warten.
- Commits: Deutsch, ein kurzer Satz, was sich für die App ändert.
- Vor `/clear` oder Sessionende: `/handoff`.
