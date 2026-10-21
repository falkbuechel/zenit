# Zenit – Entwicklung

## 1. Überblick
Home-Workout-Game als PWA für das iPhone, nur für Falk. Eine einzige Quelldatei, kein Framework, kein Server. Daten liegen nur lokal im Browser (localStorage), Sicherung über Backup-Datei.

## 2. Aufbau
```
src/zenit.html     Quelle, EINE Datei (CSS + HTML + IIFE-Script, ~3200 Zeilen)
public/            manifest, Service Worker (sw.js, Netz zuerst, Cache offline), Icons
build.py           python build.py -> dist/index.html (PWA-Head, Wrapper, window.ZENIT_V) + Kopie von public/*
dist/              Build-Ausgabe zum Hosten (gitignored)
tools/
  check.py         Syntax (node --check), doppelte Namen, Build; Exit 1 bei Fehler
  smoke.js         Rauchtest: 5 Demo-Szenarien x 5 Tabs + Ansichten/Dialoge, Screenshots -> tools/out/
  make-icons.js    Icons aus SVG -> public/ (Playwright)
.github/workflows/pages.yml   Push auf main -> check + smoke -> GitHub Pages
.claude/skills/               Design-Skills von Emil Kowalski (MIT), Quelle in .claude/skills/README.md
docs/              DEVELOPMENT.md, DEVELOPMENT_LOG.md, Notes.md
```
- `<!--PWA-->` in zenit.html wird beim Build entfernt, der Head kommt aus `build.py`.
- Die gleiche Datei läuft auch als Claude-Artifact (dort `window.claude` mit db/downloads).
- Hosting: GitHub Pages https://falkbuechel.github.io/zenit/ (öffentliches Repo). Adresse nicht wechseln, localStorage hängt an ihr.
- Version: `build.py` setzt `window.ZENIT_V` (Commit · Datum, `+` = lokale ungesicherte Änderungen), sichtbar unten im Zahnrad-Menü.
- Service-Worker-Cache heißt `zenit-v1` (`public/sw.js`). Netz zuerst, daher kein Versions-Bump für neue Builds nötig.

## 3. Daten
- localStorage `stufenbuch.v1`: `{u, logs, plan, food}`. Demo-Modus nutzt `stufenbuch.demo` (Profil > Zahnrad > Testdaten, 5 Szenarien, `demoData(kind)`).
- logs: `{t, e, s:[…], k?}`; `e` = Übungs-id, `'warm'` oder `'sess'`.
- food: `{g:{k,p}, e:[{t,n,k,p}], d:[Gerichte], w:[{t,kg}], pr:{h,a,s,act,go,tw,ex,inj,eq}, m:[Maße]}`.
- plan: `{days:[{id,n,c,i?,rp?,st?,wd,ex}], v, ev, cu, ov, ovl, off, wp}`. `wp` = gespeicherte Wochen-Presets des Planers `[{n, m: {tagId: [wd]}}]`. `off` = Urlaub/Krank `[{a, b, k}]` (Tagesindex von–bis, `vac`|`sick`): nichts geplant, Serie geschützt (`offCount` in `streakCalc`/`derive`). `i` = Icon des Trainingstags (Schlüssel aus `DAYI`), fehlt es, nimmt `dIcon` das Icon der Hauptgruppe. `rp` = Rhythmus (fehlt = jede Woche, 2/3 = alle n Wochen, 0 = einmalig), `st` = Montag (Tagesindex) der Startwoche; ob ein Tag an einem Datum dran ist, entscheidet `onDay`. Gesperrte Übungen dürfen in `ex` stehen (aus `defaultPlan`), sie erscheinen erst nach dem Freischalten; im Editor sind sie nicht wählbar. `ov[tag]` = Ausnahme für ein Datum (Liste von Tag-ids oder `g:gruppe`).
- Neue Übungen: in `EX` ergänzen, in `NEWX` eintragen, `EV` erhöhen (Migration hängt sie an bestehende Pläne), `DAYB` für Druck-Tag.
- Backup: Profil > Zahnrad > Backup (Teilen-Dialog/Datei).

## 4. Werkzeuge
- Python 3 für `build.py` und lokalen Server (`python -m http.server 8000 -d dist`).
- Node.js + Playwright nur für `tools/` (`npm install`, dann `npx playwright install chromium`).
