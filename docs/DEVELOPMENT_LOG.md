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
