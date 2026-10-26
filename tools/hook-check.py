# Claude-Code-Hook nach Edit/Write: schnelle Prüfung (Syntax, doppelte Namen/Klick-Attribute, Manifest), nur für App-Dateien.
# Still bei Erfolg; bei Fehler kurze Meldung an Claude (Exit 2), damit sie sofort behoben wird.
import json, os, subprocess, sys
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
try: path = json.load(sys.stdin).get('tool_input', {}).get('file_path', '').replace('\\', '/')
except ValueError: path = ''
if not any(k in path for k in ('/src/', '/public/', '/tools/check.py')): sys.exit(0)
r = subprocess.run([sys.executable, os.path.join(root, 'tools', 'check.py'), '--fast'], capture_output=True, text=True, encoding='utf-8')
if r.returncode:
    sys.stderr.write((r.stdout + r.stderr).strip()[:1500] + '\n')
    sys.exit(2)
