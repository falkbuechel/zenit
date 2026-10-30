# Zenit – Entwicklung

## 1. Überblick
Home-Workout-Game als PWA für das iPhone, nur für Falk. Quelle in Bereiche aufgeteilt (src/), Build zu einer Seite, kein Framework, kein Server. Daten liegen nur lokal im Browser (localStorage), Sicherung über Backup-Datei.

## 2. Aufbau
```
src/                  Quelle; build.py setzt sie zu EINER Seite zusammen
  index.html          Gerüst: Head-Platzhalter <!--PWA-->, feste Elemente (Leisten, Sheet, Toast, Dialog), <!--CSS-->, <!--JS--> in der IIFE
  css/                nach Bereichen, Reihenfolge = Dateiname
    00-basis.css      Tokens (Farben, Schriften), Grundlayout, iOS-Eigenheiten, Kopf, Navigation, Sheet, Rückmeldung, gemeinsame Bausteine, Level-up
    10-heute.css 20-plan.css 30-essen.css 40-sammlung.css 50-profil.css
    90-medien.css     globale Media-Queries, müssen zuletzt kommen
  js/                 Abschnitte EINER Funktion (gemeinsamer Gültigkeitsbereich), laufen in Dateinamen-Reihenfolge
    01-daten.js       Übungen (EX), Gruppen, Konstanten        09-training.js  Satz-Fenster, Stoppuhr, Gesamtuhr, Pause, Rückmeldung/Effekte
    02-karten.js      Karten, Muskeln, derive()                10a-essen-daten.js    Lebensmittel (FOODS, FCATS, FVAR), Summen
    03-speicher.js    Zustand, localStorage, clean*            10b-essen-ansicht.js  Rechner-Formeln, Essen-Tab, Wasser, Kacheln/Karten
    04-demo.js        Testdaten                                10c-essen-suche.js    Open Food Facts, Scan, Mengen-, Schnell-, Gerichte-Fenster
    05-hilfen.js      Hilfsfunktionen, Icons (P, ic)           10d-essen-fenster.js  Gewicht, Mahlzeiten, Ziele/Rechner, Nährwerte, Wischen/Ziehen
    06-rendern.js     render(), Tabs, Kopf                     10e-essen-plan.js     Eintragen, Mahlzeit planen, Einkauf, Klick-Handler Essen
    07-heute.js       Heute, Arena, Bergpfad                   11-plan.js      Planen-Tab, Kalender, Tag-Editor, Wochenplan-Daten (wp/act)
    08-plan-daten.js  Plan-Hilfen (GORDER, Presets)            12-sammlung.js  Verlauf, Sammlung (Karten, Muskeln, Skilltree), Profil
                                                               13-statistik.js Statistik, Diagramme
                                                               14-ereignisse.js Klick-Handler am document
                                                               15-start.js     Wischen zwischen Tabs, Start
public/               manifest, Service Worker (sw.js, Netz zuerst, Cache offline), Icons
build.py              python build.py -> dist/index.html (eine Datei: PWA-Head, CSS, JS, window.ZENIT_V) + public/*; assemble() auch für check.py
dist/                 Build-Ausgabe zum Hosten (gitignored); dist/index.html läuft auch als Claude-Artifact
tools/
  check.py            Syntax, doppelte Namen/Klick-Attribute/CSS-Selektoren, Manifest-JSON, Build; Fehler als Datei:Zeile. --fast: ohne Build, still
  hook-guard.py       Claude-Hook vor Befehl/Schreiben (Sicherheitsnetz im Bypass-Modus): sperrt Force-Push, verwerfende Git-Befehle, rekursives Löschen außer dist/tools/out/node_modules/Scratchpad, Systemeingriffe, Netz-Skripte, Installationen, Schreiben außerhalb Projekt/Scratchpad/~/.claude und in dist/ oder .git/
  hook-check.py       Claude-Hook nach Edit/Write an src/ oder public/: check.py --fast
  hook-context.py     Claude-Hook am Antwortende: Hinweis „/handoff, dann /clear“ ab 200k Kontext
  smoke.js            Rauchtest: 5 Demo-Szenarien x 5 Tabs + Ansichten/Dialoge, Screenshots -> tools/out/
  compare.js          Pixelvergleich vieler Ansichten (hell/dunkel) gegen einen Git-Stand: beim Aufräumen muss alles gleich bleiben
  make-icons.js       Icons aus SVG -> public/ (Playwright)
.github/workflows/pages.yml   Push auf main -> check + smoke -> GitHub Pages
.claude/settings.json         Rechte (erlaubt/gesperrt) + Hook
.claude/commands/             /check (alle Prüfungen), /handoff (Stand ins Log vor /clear)
.claude/agents/               reviewer (Sonnet, prüft den Diff), tester (Haiku, führt Prüfungen aus, meldet nur Fehler)
.claude/skills/               Design-Skills von Emil Kowalski (MIT), Quelle in .claude/skills/README.md
docs/                 DEVELOPMENT.md, DEVELOPMENT_LOG.md, Notes.md
```
- `<!--PWA-->` wird beim Build entfernt, der Head kommt aus `build.py`.
- Neue JS-Funktionen in die passende Datei; Code, der beim Laden läuft (z. B. `GORDER.forEach`), braucht alles Vorherige → Reihenfolge beachten.
- CSS: Regel in die Datei des Bereichs; Media-Queries direkt hinter ihre Grundregeln in derselben Datei, globale in `90-medien.css`.
- Hosting: GitHub Pages https://falkbuechel.github.io/zenit/ (öffentliches Repo). Adresse nicht wechseln, localStorage hängt an ihr.
- Aussehen: Einstellungen › Auto/Hell/Dunkel (`themeSet`, localStorage `zenit.theme`, setzt `data-theme` an `<html>` und `theme-color`).
- Version: `build.py` setzt `window.ZENIT_V` (Commit · Datum, `+` = lokale ungesicherte Änderungen), sichtbar unten im Zahnrad-Menü.
- Service-Worker-Cache heißt `zenit-v2` (`public/sw.js`). Netz zuerst, daher kein Versions-Bump für neue Builds nötig; nur erhöhen, wenn sich die Dateiliste `FILES` ändert.
- iOS-Datenrisiko: Daten nur in localStorage der Homescreen-App. App vom Homescreen löschen = Daten weg; Safari-Tab ist ein getrennter Speicher (kann nach 7 Tagen ohne Nutzung gelöscht werden). Schutz: Backup (Erinnerung im Profil).

## 3. Daten
- localStorage `stufenbuch.v1`: `{u, logs, plan, food}`. Demo-Modus nutzt `stufenbuch.demo` (Profil > Zahnrad > Testdaten, 5 Szenarien, `demoData(kind)`).
- logs: `{t, e, s:[…], k?}`; `e` = Übungs-id, `'warm'` oder `'sess'`.
- food: `{g, e, d, o, w, pr, m, wa, pl, sh, tp}`
  - `tp: [{id: 't…', n, k: 'm'|'d', mk?, it: [{i, g, mk?}]}]` – Vorlagen zum Essen planen: Mahlzeit (`k 'm'`, Mahlzeit `mk`) oder Tag (`k 'd'`, je Eintrag `mk`); Einträge = Quelle `i` + Menge `g`. Speichern im Fenster „Mahlzeit planen“ bzw. Kachel „Tag“ in Planen › Essen › Vorlagen (`tplSave`), einplanen per Antippen/Ziehen (`tplAdd`). (`wa`: Wasser je Tag `{Tagesindex: ml}`; `sh`: Einkauf abgehakt `{Schlüssel: Tagesindex}`, Schlüssel = Lebensmittel-id oder `n:`Name, `cleanFood` vergisst nach 14 Tagen)
  - Einkaufsliste (`shopList(n)`, Planen › Essen › Einkauf): Geplantes ab heute bis Tag n (Tagesleiste `data-shn` 1–7 oder 14; ohne Wahl bis zum letzten geplanten Tag der Woche, `shopN`), Gerichte in Zutaten zerlegt, Gekochtes als roh (`SHRAW`), Restaurant/Fast Food ohne Kaufgröße weggelassen; gekauft in ganzen Packungen aus `SHB` (Packung, Menge, Preis je Lebensmittel), sonst Stück einzeln, sonst auf 100 g. Je Zeile wofür (`src`: Tag, Mahlzeit, Gericht, Menge; antippen `data-shx`) und Preis als Richtwert (Packungspreis aus `SHB`, sonst `SHPI`/`SHP` €/kg); Teilen als Text (`shopShare`).
  - `pl: [{d, mk, n, k, p, f?, c?, fb?, su?, r?}]` – geplante Einträge (Tagesindex `d`, Mahlzeit `mk`, Werte wie `e`), getrennt vom Gegessenen, zählen nicht in Bilanz/Verlauf (`planSum`). Heute Geplantes wird in Essen per Antippen gegessen (`planEat` → `e`); `cleanFood` behält 30 Tage zurück.
  - `e: [{t, n, k, p, f?, c?, fb?, su?, r?: {i, g}, qa?}]` – Einträge: kcal, Protein, Fett, Kohlenhydrate, Ballaststoffe, Zucker (fehlende = unbekannt, alte Einträge haben nur k/p). `r` = Quelle (`FOODS`-id, eigenes `u…`, Gericht `d…`) und Menge (Gramm, beim Gericht Portionen); daraus entstehen die Schnell-Kacheln (`fTiles`). `qa: [Menge, 'g'|'ml'|'st'|'po']` nur bei Schnell ohne Quelle (zum Wiederanzeigen; auch in `pl`).
  - Schnell (`openQuick`, aus der Suche über die Zeile über den Treffern): gegessene Menge + Nährwerte je Bezugsmenge (je 100 g, je Stück …); eingetragen wird gegessen/Bezug × Werte. Gibt es den Namen nicht (`libFind`), bietet die Rückmeldung „merken“ an (`toast(…, act)`, `qsvHtml`): Kategorie + Unterart, legt ein eigenes Lebensmittel mit `cat`/`sb` an (g/ml: je 100 umgerechnet, Portion = Menge; Stück/Portion: Rechengröße 100 = 1 Stück) und verbindet den Eintrag (`r`).
  - `FOODS` im Code: ca. 100 Lebensmittel je 100 g mit Portionen (Richtwerte). Kategorien für die Suche: `FCATS` (`[key, Name, ids]`, setzt `.cat`). `o: [{id: 'u…', n, b?, bc?, cat?, sb?, k, p, f, c, fb, su, u: [[Portion, g]]}]` eigene Lebensmittel (`b` Marke, `bc` Barcode, aus Open Food Facts oder Scan; `cat` = `FCATS`-Schlüssel, `sb` = Unterart aus `FSUB`, dann auch in dieser Kategorie der Suche). Unterarten `FSUB` (`[Kategorie, Schlüssel, Name, Icon, ids]`, setzt `.sb`): Leiste + Abschnitte in der Kategorie-Ansicht, Icon (`fIco`, Ausnahmen `FICO`) und Farbton (`sbTone`/`fTone`). In `FOODS` markiert `*` die vorgewählte Portion (`.d`), `FVAR` verbindet Varianten (`.vg`, `.vh`). `d: [{id, n, por, ing: [{n, a, k, p, f?, c?, fb?, su?, i?}], m?, st?}]` Gerichte (Zutatenwerte je 100 g; `m` = fest gewählte Mahlzeiten `fr|mi|sn|ab`, fehlt = automatisch aus dem Verlauf, `dishMeals`; `st` = Zubereitungsschritte als Text). „Rezept einfügen“ (`rcpParse`) liest kopierten Rezepttext: Zutatenzeilen mit Menge/Einheit (`RU`, Datenbank-Abgleich `ingMatch`), Schritte, Portionen. Zutaten mit Namen bleiben auch ohne Menge/Werte (Gewürze, 0 kcal, „n. B.“). Open-Food-Facts-Treffer je Suchwort liegen in localStorage `zenit.offc` (30 Suchen, 7 Tage).
  - `g` – Ziele: `{a: 1}` = automatisch aus dem Rechner (je Tag, `foodGoal(tag)`), sonst eigene Werte `{k, p, f?, c?, fb?, su?}` (fehlende aus kcal abgeleitet).
  - `pr` – Körper + Rechner: `h, a, s, go, tw, ex, inj, eq` (Profil) und `pal` (Alltag ohne Sport), `rt` (kg/Woche), `pkg` (Protein g/kg), `fp` (Fett %), `tb` (Trainingszuschlag 0/1), `adj` (Korrektur aus dem Verlauf). Altes `act` wird nur noch zu `pal` umgerechnet.
  - Rechner (`calcWith`): Mifflin-St Jeor × `pal` + Training (MET 5/7 × kg × Dauer, `trainKcal`) + `rt` × 1100 + `adj`. Makros: Protein g/kg, Fett %, Kohlenhydrate Rest, Ballaststoffe 14 g/1000 kcal, Zucker ≤ 10 %. Lernen (`tdeeEst`): 28 Tage, Ø gegessen − Gewichtstrend × 7700; nur bei ≥ 10 Tagen, ≥ 3 Messungen über ≥ 10 Tage und höchstens 30 % Abweichung von der Formel.
- plan: `{days, v, ev, cu, ov, ovl, ovk, off, wp, act}`
  - `days: [{id, n, c, i?, rp?, st?, wd, ex}]` – Trainingstage. `i` Icon (`DAYI`, sonst Hauptgruppe via `dIcon`), `rp` Rhythmus (fehlt = jede Woche, 2/3 = alle n Wochen, 0 = einmalig) ab Startwoche `st` (Montag als Tagesindex), `ex` Übungen (gesperrte dürfen drinstehen, erscheinen nach dem Freischalten).
  - `wp: [{id, n, m: {tagId: [wd]}}]` – Wochenpläne; die App ändert nur den heute aktiven (`weekSet`), ein Fenster für mehrere Pläne gibt es nicht mehr. `act: [{a, p}]` – Zeitstrahl: Plan `p` gilt ab Tag `a` (`actAt`). Wochentage eines Trainingstags an einem Datum: `wdAt`; `days[].wd` ist nur der heutige Stand (`syncWd`). Migration: alte Wochentage = Plan `w1` „Mein Plan“, aktiv ab 0.
  - Ob ein Trainingstag an einem Datum dran ist: `onDay` (Wochentag aus dem aktiven Plan + Rhythmus). Was an einem Datum geplant ist: `schedFor` (Urlaub/Krank → nichts, sonst Ausnahme, sonst `onDay`).
  - `ovk[tag] = {s?, w?, b?, r?, a?}` – Ausnahme als Bausteine (ausgesetzt, getauscht mit Tag w → Training b, ersetzt durch r, zusätzlich a); `ov[tag]` = daraus berechnete Liste von Tag-ids (`ovSetF`). `ov`/`ovl` ohne `ovk` stammen vom Tausch im Heute-Tab.
  - `off: [{a, b, k: 'vac'|'sick'}]` – Urlaub/Krank von–bis: nichts geplant, Serie geschützt (`offCount` in `streakCalc`/`derive`).
  - Jede neue Datenform auch in `cleanPlan` übernehmen, sonst geht sie beim Laden verloren.
- Neue Übungen: in `EX` ergänzen, in `NEWX` eintragen, `EV` erhöhen (Migration hängt sie an bestehende Pläne), `DAYB` für Druck-Tag.
- Backup: Profil > Zahnrad > Backup (Teilen-Dialog/Datei).

## 4. Werkzeuge
- Python 3 für `build.py` und lokalen Server (`python -m http.server 8000 -d dist`).
- Node.js + Playwright nur für `tools/` (`npm install`, dann `npx playwright install chromium webkit`). WebKit nur für iOS-Layout; Touch/Klick dort ist unzuverlässig, Interaktion mit Chromium + CDP-Touch testen.
