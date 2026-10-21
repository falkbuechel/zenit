# Zenit – Home-Workout-Game (Web-App, nur für Falk)

Sprache: Deutsch (UI und Antworten). Antworten kurz, ohne Einleitung/Recap. Änderungen als gezielte Edits, keine ganzen Dateien neu schreiben. Visuelles/Interaktives testet Falk selbst auf dem iPhone, nicht danach fragen.

## Vor der Arbeit
1. Diese Datei, dann `docs/DEVELOPMENT.md` (Aufbau, Datenformen), bei Bedarf die passenden Abschnitte in `docs/DEVELOPMENT_LOG.md`.
2. `git status --short` und `git diff --stat`.
3. Betroffenen Code in `src/zenit.html` lesen, bevor etwas vorgeschlagen wird.

## Dateien
- Nur `src/zenit.html`, `public/`, `build.py`, `tools/` bearbeiten. `dist/` ist Build-Ausgabe (gitignored), nie von Hand ändern.
- `docs/DEVELOPMENT_LOG.md`: relevante Änderungen, Fehler und Lösungen eintragen (neueste oben). `docs/DEVELOPMENT.md` nur ändern, wenn sich Aufbau oder Datenformen ändern.
- `docs/Notes.md` ist Falks Notizbuch: lesen ja, nie bearbeiten.
- `CLAUDE.md`, `README.md`, `docs/DEVELOPMENT.md` nur auf ausdrücklichen Wunsch umbauen.

## Konventionen
- `<!--PWA-->` in zenit.html ist der Platzhalter für den Head, nicht entfernen. Die gleiche Datei läuft auch als Claude-Artifact (dort `window.claude` mit db/downloads).
- Funktionsnamen und Klick-Attribute (`data-x`) nicht doppelt vergeben (es gab schon `spark` und `data-pf` doppelt). `tools/check.py` prüft beides.
- Ändert sich eine Datenform (Tupel/Objekt), alle Aufrufstellen per grep prüfen.
- Klassenname `x` ist belegt (Button 40px). Icons: Objekt `P` + `ic(name)`.
- Klicks laufen über einen Handler am `document`. Antippbare `div`/`span` bekommen `cursor: pointer` und `role="button"` (ältere iOS-Versionen klicken sonst nicht). Playwright-WebKit nur für Layout nutzen, Touch/Klick dort ist unzuverlässig; Interaktion mit Chromium + CDP-Touch testen.
- Design: ruhiges Salbeigrün + Anthrazit, wenig Grün, wenig Text, Icons statt Beschriftung, klare Grenzen zwischen Bereichen.
- Keine Abhängigkeiten/Frameworks/Server einführen ohne Rückfrage. Node nur für Dev-Tools.

## Prüfen und veröffentlichen
- `python tools/check.py` (Syntax, doppelte Namen, Build) und `node tools/smoke.js` (alle Demo-Szenarien und Tabs parallel, ~10 s, schlägt bei JS-Fehlern fehl) müssen durchlaufen. Screenshots aller Dialoge: `--shots`.
- Nach dem Push nicht auf den Deploy warten; das Ergebnis zu Beginn der nächsten Runde prüfen (`gh run list --limit 1`).
- Push auf `main` = live auf Falks iPhone (GitHub Pages, die Action prüft vorher noch einmal). Nur nach bestandenen Prüfungen committen und pushen.
- Commit-Nachrichten: Deutsch, ein kurzer Satz, was sich für die App ändert.
- Datenform-Änderungen: Migration muss alte Daten behalten (`clean*`-Funktionen verwerfen sonst still). Vorher Falk an ein Backup erinnern.
- Lange Zeilen (>400 Zeichen) beim Anfassen umbrechen, keine neuen anlegen.
- Aufräumen (CSS zusammenführen, toten Code entfernen): danach `node tools/compare.js` muss „Alles gleich“ melden. Klassen aus Code-Teilen (`'g' + k`, `'t' + tier`, `'l' + n`) erkennt kein Scan.
- Ein Selektor nur einmal im CSS definieren; neue Werte in die bestehende Regel, keine zweite Regel darunter.
