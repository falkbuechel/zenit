# Prüft src/zenit.html und baut dist/. Aufruf: python tools/check.py (vor jedem Push, läuft auch in der GitHub Action)
# 1. Syntax: Script-Blöcke extrahieren, node --check
# 2. Doppelte Namen auf oberster Ebene des IIFE (2 Leerzeichen Einzug), z. B. zweimal function spark
# 3. python build.py
import os, re, sys, shutil, subprocess, tempfile
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
src = open('src/zenit.html', encoding='utf-8').read()
fail = False

node = shutil.which('node')
if not node:
    print('FEHLER: node nicht gefunden (Node LTS installieren, VS Code neu starten)'); sys.exit(1)
blocks = re.findall(r'<script>(.*?)</script>', src, re.S)
for i, b in enumerate(blocks):
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f: f.write(b)
    r = subprocess.run([node, '--check', f.name], capture_output=True, text=True, encoding='utf-8')
    os.unlink(f.name)
    if r.returncode:
        # Zeilennummer im Block auf zenit.html umrechnen
        off = src[:src.index(b)].count('\n')
        m = re.search(r':(\d+)\n', r.stderr)
        print('FEHLER Syntax' + (' in zenit.html Zeile %d' % (off + int(m.group(1))) if m else '') + ':\n' + r.stderr.strip())
        fail = True
print('Syntax: %d Script-Block(e) geprüft' % len(blocks))

names = {}
for n, line in enumerate(src.split('\n'), 1):
    m = re.match(r'  (?:function|var) ([A-Za-z_$][\w$]*)', line)
    if m: names.setdefault(m.group(1), []).append(n)
dup = {k: v for k, v in names.items() if len(v) > 1}
for k, v in dup.items(): print('FEHLER doppelt: %s in Zeilen %s' % (k, ', '.join(map(str, v))))
fail = fail or bool(dup)
print('Namen: %d auf oberster Ebene, %d doppelt' % (len(names), len(dup)))

long_ = sum(1 for l in src.split('\n') if len(l) > 400)
print('Hinweis: %d Zeilen über 400 Zeichen (beim Anfassen umbrechen)' % long_)

if subprocess.run([sys.executable, 'build.py']).returncode: fail = True
print('FEHLGESCHLAGEN' if fail else 'OK')
sys.exit(1 if fail else 0)
