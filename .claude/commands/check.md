---
description: Alle Prüfungen vor dem Commit (Checks, Rauchtest, Aufrufstellen, PWA)
---
Führe aus und melde nur Probleme (bei Erfolg eine Zeile „Alles grün“):
1. `python tools/check.py`, dann `node tools/smoke.js` und `node tools/fit.js` (Gerätegrößen, parallel starten).
2. `git diff -U0 -- src/`: für jede geänderte oder entfernte Funktion, jedes Klick-Attribut `data-*`, jede CSS-Klasse und jedes Datenfeld per grep prüfen, ob alle Aufrufstellen noch passen und nichts doppelt definiert ist. Neue Felder in Speicherdaten: steht das Feld in der passenden `clean*`-Funktion?
3. Nur wenn `public/` oder `build.py` im Diff: Manifest-Pfade/Icons existieren, `sw.js` FILES stimmen mit `dist/` überein.
Ausgabe: Liste „Datei:Zeile – Problem – Vorschlag“, höchstens 10 Punkte.
