# Claude-Code-Hook am Ende jeder Antwort: meldet Falk, wenn das Gespräch groß wird (je 150k ab 200k einmal).
# Jeder Aufruf liest den ganzen Kontext neu; nach /handoff + /clear arbeitet die nächste Runde billiger und genauer.
import json, os, sys, tempfile
try: inp = json.load(sys.stdin)
except ValueError: sys.exit(0)
tp, sid = inp.get('transcript_path', ''), inp.get('session_id', 'x')
if not tp or not os.path.exists(tp): sys.exit(0)
with open(tp, 'rb') as f:
    f.seek(max(0, os.path.getsize(tp) - 400000)); tail = f.read().decode('utf-8', 'ignore').splitlines()
ctx = 0
for line in reversed(tail):
    try: o = json.loads(line)
    except ValueError: continue
    u = (o.get('message') or {}).get('usage') if o.get('type') == 'assistant' and not o.get('isSidechain') else None
    if u: ctx = u.get('input_tokens', 0) + u.get('cache_read_input_tokens', 0) + u.get('cache_creation_input_tokens', 0); break
if ctx < 200000: sys.exit(0)
step = (ctx - 200000) // 150000
mark = os.path.join(tempfile.gettempdir(), 'zenit-ctx-' + sid)
try: last = int(open(mark).read())
except (OSError, ValueError): last = -1
if step <= last: sys.exit(0)
open(mark, 'w').write(str(step))
print(json.dumps({'systemMessage': 'Kontext %dk – nach dieser Runde /handoff, dann /clear.' % (ctx // 1000)}))
