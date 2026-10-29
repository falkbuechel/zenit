# Claude-Code-Hook vor jedem Befehl/Schreiben: Sicherheitsnetz für den Bypass-Modus (greift auch ohne Rückfragen).
# Blockiert (Exit 2 + Grund an Claude): Datenverlust in Git/GitHub, rekursives Löschen außerhalb von Wegwerf-Ordnern,
# Systemeingriffe, Skripte aus dem Netz, neue Abhängigkeiten, Schreiben außerhalb von Projekt/Scratchpad/~/.claude.
import json, os, re, sys

ROOT = os.path.normcase(os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))).replace('\\', '/')
HOME = os.path.normcase(os.path.expanduser('~')).replace('\\', '/')
# Ordner, in denen rekursives Löschen erlaubt ist (Build-Ausgabe, Testbilder, Pakete, Scratchpad)
TRASH = re.compile(r'^(\./)?(dist|tools/out|node_modules|__pycache__)(/|$)|/temp/claude/|^\$?scratch')

RULES = [
    (r'git\s+push\b[^;&|\n]*\s(--force\S*|-f\b|--mirror|--delete|-d\b|\+\S+|:\S+)', 'Erzwungenes Push/Löschen auf GitHub'),
    (r'git\s+(reset\s+[^;&|\n]*--hard|clean\s+-\w*f|stash\s+(drop|clear)|branch\s+-D|filter-branch|filter-repo|reflog\s+expire|update-ref\s+-d|rebase\b)', 'Git-Befehl kann Arbeit löschen'),
    (r'git\s+(checkout\b[^;&|\n]*\s(-f\b|--(\s|$))|checkout\s+\.\s*($|[;&|])|restore\b(?![^;&|\n]*--staged))', 'Verwirft ungesicherte Änderungen'),
    (r'git\s+config\s+--(global|system)\b(?![^;&|\n]*(--get|--list|\s-l\b))', 'Globale Git-Einstellung'),
    (r'\bgh\s+(repo\s+(delete|edit|rename|archive)|secret\b|auth\s+(token|logout|refresh)|release\s+delete|run\s+delete|workflow\s+disable)', 'GitHub-Konto/Repo-Einstellung'),
    (r'\bgh\s+api\b[^;&|\n]*(-X|--method)\s*(DELETE|PUT|PATCH)', 'Schreibender GitHub-API-Aufruf'),
    (r'\b(format(\.com)?\s+[a-z]:|diskpart|bcdedit|vssadmin|cipher\s+/w|shutdown(\.exe)?\s|(restart|stop)-computer|set-executionpolicy|takeown|icacls\b[^;&|\n]*/(grant|reset|setowner))', 'Systemeingriff'),
    (r'\breg(\.exe)?\s+(add|delete|import|load)|(set|new|remove)-itemproperty\b[^;|\n]*hk(lm|cu)', 'Registry ändern'),
    (r'(curl|wget|iwr|irm|invoke-webrequest|invoke-restmethod)\b[^\n]*\|\s*(sh|bash|iex|invoke-expression|python|node|powershell|pwsh)\b', 'Skript aus dem Netz ausführen'),
    (r'\b(npm|pnpm|yarn)\s+(i|install|add)\s+(-g\b|--global|[^-\s])|\bpip3?\s+install\b|\b(winget|choco|scoop)\s+install', 'Neue Abhängigkeit/Installation – erst Falk fragen'),
]
DELETE = re.compile(r'^\s*(rm|rmdir|rd|del|erase|remove-item|ri)\b(.*)$', re.I)

def block(why):
    sys.stderr.reconfigure(encoding='utf-8')
    sys.stderr.write('Gesperrt (tools/hook-guard.py): %s. Wenn wirklich nötig: Falk fragen, er führt es selbst aus.\n' % why)
    sys.exit(2)

def recursive_delete(seg):
    m = DELETE.match(seg)
    if not m: return False
    args = m.group(2).split()
    if not any(re.fullmatch(r'-\w*[rR]\w*|--recursive|-recurse|/s', a, re.I) for a in args): return False
    paths = [a.strip('\'"').replace('\\', '/').lower() for a in args if not a.startswith(('-', '/s', '/q'))]
    return not paths or not all(TRASH.search(p) for p in paths)

def check_cmd(cmd):
    for rx, why in RULES:
        if re.search(rx, cmd, re.I): block(why)
    for seg in re.split(r'[;&|\n]+', cmd):
        if recursive_delete(seg): block('Rekursives Löschen außerhalb von dist/, tools/out/, node_modules/ oder Scratchpad')

def check_path(p):
    p = os.path.normcase(os.path.abspath(p)).replace('\\', '/')
    if p.startswith(ROOT + '/'):
        rel = p[len(ROOT) + 1:]
        if rel.startswith('dist/'): block('dist/ ist Build-Ausgabe – src/ bearbeiten')
        if rel.startswith('.git/'): block('.git/ nie direkt bearbeiten')
        return
    if '/temp/claude/' in p or p.startswith(HOME + '/.claude/'): return
    block('Schreiben außerhalb des Projekts (%s)' % p)

try: inp = json.load(sys.stdin)
except ValueError: sys.exit(0)
ti = inp.get('tool_input') or {}
if inp.get('tool_name') in ('Bash', 'PowerShell'): check_cmd(ti.get('command', ''))
elif ti.get('file_path') or ti.get('notebook_path'): check_path(ti.get('file_path') or ti.get('notebook_path'))
