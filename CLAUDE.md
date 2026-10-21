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
- Funktionsnamen nicht doppelt vergeben (es gab schon `spark` doppelt). Nach Änderungen auf Duplikate prüfen.
- Ändert sich eine Datenform (Tupel/Objekt), alle Aufrufstellen per grep prüfen.
- Klassenname `x` ist belegt (Button 40px). Icons: Objekt `P` + `ic(name)`.
- Design: ruhiges Salbeigrün + Anthrazit, wenig Grün, wenig Text, Icons statt Beschriftung, klare Grenzen zwischen Bereichen.
- Keine Abhängigkeiten/Frameworks/Server einführen ohne Rückfrage. Node nur für Dev-Tools.

## Prüfen
- Syntaxcheck: Script extrahieren und `node --check`.
- `python build.py` muss durchlaufen.
