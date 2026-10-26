# Prüft die zusammengesetzte Quelle (src/index.html + css/ + js/, siehe build.py) und baut dist/. Fehler mit Datei:Zeile.
# Aufruf: python tools/check.py (vor jedem Push, läuft auch in der GitHub Action)
# 1. Syntax: Script-Blöcke extrahieren, node --check
# 2. Doppelte Namen auf oberster Ebene des IIFE (2 Leerzeichen Einzug), z. B. zweimal function spark; doppelte Klick-Attribute (data-x)
# 3. Doppelte CSS-Selektoren (ein Selektor nur einmal definieren; Media-Queries ausgenommen)
# 4. manifest.webmanifest ist gültiges JSON
# 5. Build nach dist/
# --fast (für den Hook nach jedem Edit): ohne Build, still bei Erfolg
import os, re, sys, json, shutil, subprocess, tempfile
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
sys.path.insert(0, '.')
from build import assemble, build
sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
src, where = assemble()
fail = False
fast = '--fast' in sys.argv
say = (lambda *a: None) if fast else print

node = shutil.which('node')
if not node:
    print('FEHLER: node nicht gefunden (Node LTS installieren, VS Code neu starten)'); sys.exit(1)
blocks = re.findall(r'<script>(.*?)</script>', src, re.S)
for i, b in enumerate(blocks):
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f: f.write(b)
    r = subprocess.run([node, '--check', f.name], capture_output=True, text=True, encoding='utf-8')
    os.unlink(f.name)
    if r.returncode:
        off = src[:src.index(b)].count('\n')
        m = re.search(r':(\d+)\n', r.stderr)
        print('FEHLER Syntax' + (' in ' + where(off + int(m.group(1))) if m else '') + ':\n' + r.stderr.strip()[:600])
        fail = True
say('Syntax: %d Script-Block(e) geprüft' % len(blocks))

lines = src.split('\n')
names = {}
for n, line in enumerate(lines, 1):
    m = re.match(r'  (?:function|var) ([A-Za-z_$][\w$]*)', line)
    if m: names.setdefault(m.group(1), []).append(n)
dup = {k: v for k, v in names.items() if len(v) > 1}
for k, v in dup.items(): print('FEHLER doppelt: %s in %s' % (k, ', '.join(map(where, v))))
fail = fail or bool(dup)
say('Namen: %d auf oberster Ebene, %d doppelt' % (len(names), len(dup)))

# Klick-Attribute: jedes data-x darf nur einen Handler haben (data-pf war doppelt: Profil-Sheet fing den Editor-Filter ab)
att = {}
for n, line in enumerate(lines, 1):
    for m in re.finditer(r"if \(\(?(?:el = )?t\.closest\('\[data-([a-z0-9-]+)\]'\)", line): att.setdefault(m.group(1), []).append(n)
dupa = {k: v for k, v in att.items() if len(v) > 1}
for k, v in dupa.items(): print('FEHLER Klick-Attribut doppelt: data-%s in %s' % (k, ', '.join(map(where, v))))
fail = fail or bool(dupa)
say('Klick-Attribute: %d, %d doppelt' % (len(att), len(dupa)))

# CSS: offene Kommentare oder Klammern verschlucken alle folgenden Regeln (Browser ignoriert sie still)
import glob
for f in sorted(glob.glob('src/css/*.css')):
    c = open(f, encoding='utf-8').read()
    if c.count('/*') != c.count('*/'): print('FEHLER CSS-Kommentar nicht geschlossen in %s' % f.replace('\\', '/')); fail = True
    if c.count('{') != c.count('}'): print('FEHLER CSS-Klammern ungleich in %s' % f.replace('\\', '/')); fail = True

# CSS: Regeln auf oberster Ebene (eine Regel je Zeile), jede Selektor-Liste nur einmal
sel, depth = {}, 0
for n, line in enumerate(lines, 1):
    if where(n).startswith('src/css/') and depth == 0 and re.match(r'[.#a-z*:\[]', line) and '{' in line:
        sel.setdefault(line.split('{')[0].strip(), []).append(n)
    depth = max(0, depth + line.count('{') - line.count('}')) if where(n).startswith('src/css/') and line.startswith('@') or depth else 0
dups = {k: v for k, v in sel.items() if len(v) > 1}
for k, v in dups.items(): print('FEHLER CSS doppelt: %s in %s' % (k, ', '.join(map(where, v))))
fail = fail or bool(dups)
say('CSS: %d Selektoren, %d doppelt' % (len(sel), len(dups)))

long_ = sum(1 for l in lines if len(l) > 400)
say('Hinweis: %d Zeilen über 400 Zeichen (beim Anfassen umbrechen)' % long_)

try: json.load(open('public/manifest.webmanifest', encoding='utf-8'))
except ValueError as e: print('FEHLER manifest.webmanifest kein gültiges JSON: %s' % e); fail = True

if fast: sys.exit(1 if fail else 0)
build()
print('FEHLGESCHLAGEN' if fail else 'OK')
sys.exit(1 if fail else 0)
