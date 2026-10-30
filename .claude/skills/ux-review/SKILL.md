---
name: ux-review
description: Bewertet Logik und Aufbau von Zenit-Screens (Nielsen-Heuristiken, Durchgang durch Kernaufgaben, Konsistenz zwischen Tabs) plus Messung mit tools/ux-scan.js (unslop-Audit). Nutzen vor Umbauten, beim Aufräumen eines Tabs oder wenn Falk Schwachstellen sucht. Liefert nur Funde, baut nichts.
---

# UX-Review für Zenit

Nur Bericht, keine Änderungen. Danach entscheidet Falk (Funde mit Layout-Folgen als AskUserQuestion mit Vorschau bündeln).

## 1. Messen
`python build.py`, dann `node tools/ux-scan.js` → `tools/out/ux.json` + `tools/out/ux-*.png`.
- Ernst nehmen: Tippziele < 32 px (iPhone), Silbentrennung/abgeschnittene Namen, zu viele Schriftgrößen (Ziel ≤ 8), Endlos-Animationen.
- Ignorieren: 3/5-px-Abstände, `contrast/text` auf Verläufen (misst falsch), Demo-Knopf.
- Screenshots nur der geprüften Ansichten ansehen.

## 2. Kernaufgaben durchgehen (je Schritt: Ziel klar? Knopf auffindbar? passt er zur Handlung? Rückmeldung?)
- Essen: Lebensmittel eintragen (Kachel, Suche, Scan), Mahlzeit öffnen/ändern, Wasser, Ziel prüfen.
- Planen: Woche ansehen, Training tauschen/aussetzen, Essen für morgen planen, Vorlage nutzen, Einkauf abhaken/teilen.
- Training/Heute/Sammlung/Profil erst, wenn sie ausgearbeitet sind.
Klicks zählen, Sackgassen und versteckte Funktionen (nur über Wischen/Ziehen) notieren.

## 3. Heuristiken (Nielsen, kurz)
Status sichtbar · Sprache des Nutzers · Rückgängig/Ausweg · Konsistenz · Fehler vermeiden · Erkennen statt Erinnern · Abkürzungen · Reduktion · Fehlermeldungen · Hilfe.
Konsistenz zwischen Tabs extra: gleiche Bausteine (Kacheln, Mahlzeit-Karten, Reiter) müssen gleich aussehen und gleich reagieren.

## 4. Bericht (kurz, Deutsch)
Tabelle: Ort · Fund · Heuristik · Schwere 0–4 · Aufwand (klein/Umbau). Erst schnelle Gewinne, dann Umbauten. Passt zu Zenit-Design: wenig Text, Icons, ruhig.

Quellen der Methode: FortunaTerra usability-heuristic-review (Apache-2.0), VladPolyakov ux-audit (MIT); Messung: unslop (MIT, Idee Damir Sokolovsky).
