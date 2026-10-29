# Lokale Vorschau: baut dist/, liefert es auf http://127.0.0.1:8000 aus und baut neu, sobald sich src/, public/ oder build.py ändern.
# Startet in VS Code automatisch beim Öffnen des Ordners (.vscode/tasks.json); Edge-Tab: Launch Instance.
import http.server, os, subprocess, sys, threading, time
from functools import partial

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WATCH = [os.path.join(ROOT, 'src'), os.path.join(ROOT, 'public'), os.path.join(ROOT, 'build.py')]
PORT = 8000

def stamp():
    # Neuester Änderungszeitpunkt aller beobachteten Dateien
    t = 0
    for w in WATCH:
        if os.path.isfile(w): t = max(t, os.path.getmtime(w)); continue
        for d, _, fs in os.walk(w):
            for f in fs: t = max(t, os.path.getmtime(os.path.join(d, f)))
    return t

def build():
    r = subprocess.run([sys.executable, 'build.py'], cwd=ROOT, capture_output=True, text=True)
    print(time.strftime('%H:%M:%S'), 'gebaut' if r.returncode == 0 else 'FEHLER beim Bauen:\n' + r.stdout + r.stderr, flush=True)

def watch():
    last = stamp()
    while True:
        time.sleep(0.7)
        t = stamp()
        if t != last: last = t; build()

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
    # Kein Zwischenspeichern, damit Neuladen immer den neuen Stand zeigt
    def end_headers(self): self.send_header('Cache-Control', 'no-store'); super().end_headers()

build()
threading.Thread(target=watch, daemon=True).start()
print('Vorschau: http://127.0.0.1:%d  (Änderungen werden automatisch gebaut, dann neu laden)' % PORT, flush=True)
http.server.ThreadingHTTPServer(('127.0.0.1', PORT), partial(Quiet, directory=os.path.join(ROOT, 'dist'))).serve_forever()
