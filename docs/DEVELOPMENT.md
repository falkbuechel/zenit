# Zenit – Entwicklung

## 1. Überblick
Home-Workout-Game als PWA für das iPhone, nur für Falk. Eine einzige Quelldatei, kein Framework, kein Server. Daten liegen nur lokal im Browser (localStorage), Sicherung über Backup-Datei.

## 2. Aufbau
```
src/zenit.html     Quelle, EINE Datei (CSS + HTML + IIFE-Script, ~3200 Zeilen)
public/            manifest, Service Worker (sw.js, Netz zuerst, Cache offline), Icons
build.py           python build.py -> dist/index.html (PWA-Head, Wrapper) + Kopie von public/*
dist/              Build-Ausgabe zum Hosten (gitignored)
tools/
  make-icons.js    Icons aus SVG -> public/ (Playwright)
  test-example.js  Playwright-Beispieltest gegen dist/, Screenshots -> tools/out/
docs/              DEVELOPMENT.md, DEVELOPMENT_LOG.md, Notes.md
```
- `<!--PWA-->` in zenit.html wird beim Build entfernt, der Head kommt aus `build.py`.
- Die gleiche Datei läuft auch als Claude-Artifact (dort `window.claude` mit db/downloads).
- Hosting: `dist/` auf Netlify Drop / GitHub Pages / Cloudflare Pages.
- Service-Worker-Cache heißt `zenit-v1` (`public/sw.js`). Netz zuerst, daher kein Versions-Bump für neue Builds nötig.

## 3. Daten
- localStorage `stufenbuch.v1`: `{u, logs, plan, food}`. Demo-Modus nutzt `stufenbuch.demo` (Profil > Zahnrad > Testdaten, 5 Szenarien, `demoData(kind)`).
- logs: `{t, e, s:[…], k?}`; `e` = Übungs-id, `'warm'` oder `'sess'`.
- food: `{g:{k,p}, e:[{t,n,k,p}], d:[Gerichte], w:[{t,kg}], pr:{h,a,s,act,go,tw,ex,inj,eq}, m:[Maße]}`.
- plan: `{days:[{id,n,c,wd,ex}], v, ev, cu, ov, ovl}`.
- Neue Übungen: in `EX` ergänzen, in `NEWX` eintragen, `EV` erhöhen (Migration hängt sie an bestehende Pläne), `DAYB` für Druck-Tag.
- Backup: Profil > Zahnrad > Backup (Teilen-Dialog/Datei).

## 4. Werkzeuge
- Python 3 für `build.py` und lokalen Server (`python -m http.server 8000 -d dist`).
- Node.js + Playwright nur für `tools/` (`npm install`, dann `npx playwright install chromium`).
