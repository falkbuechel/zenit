# Zenit

Home-Workout-Game als PWA fürs iPhone. Eine Quelldatei (`src/zenit.html`), kein Framework, kein Server.

**Für AI-gestützte Arbeit:** zuerst [`CLAUDE.md`](./CLAUDE.md), dann [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md) und bei Bedarf [`docs/DEVELOPMENT_LOG.md`](./docs/DEVELOPMENT_LOG.md).

## Bauen und veröffentlichen
1. Push auf `main` → GitHub Action baut mit `build.py` und veröffentlicht auf https://falkbuechel.github.io/zenit/
2. iPhone: Safari → Teilen → Zum Home-Bildschirm (Adresse nicht wechseln, die Daten hängen an ihr)

Lokal testen: `python -m http.server 8000 -d dist` → http://localhost:8000

## Struktur
- `src/zenit.html` – die App (CSS + HTML + Script)
- `public/` – manifest, Service Worker, Icons
- `build.py` – baut `dist/` (gitignored)
- `tools/` – Icon-Generator, Playwright-Beispieltest (Node nur hierfür: `npm install`)
- `docs/DEVELOPMENT.md` – Aufbau und Datenformen
- `docs/DEVELOPMENT_LOG.md` – Verlauf, Fehler/Lösungen, offene Ideen
- `docs/Notes.md` – persönliches Notizbuch, nicht für AI-Agents, nur lokal (gitignored, Repo ist öffentlich)

`README.md` und `CLAUDE.md` bleiben im Hauptordner, alle anderen Markdown-Dokumente liegen in `docs/`.
