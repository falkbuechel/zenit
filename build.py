import os,shutil,glob,subprocess
os.chdir(os.path.dirname(os.path.abspath(__file__)))  # von überall aufrufbar
def git(*a):
    try: return subprocess.run(['git',*a],capture_output=True,text=True,encoding='utf-8').stdout.strip()
    except OSError: return ''
# Version für Zahnrad-Menü: Commit + Datum, "+" = lokaler Build mit ungesicherten Änderungen
ver=git('rev-parse','--short','HEAD')
if ver: ver+=('+' if git('status','--porcelain') else '')+' · '+git('log','-1','--format=%cd','--date=format:%d.%m.%y %H:%M')
# utf-8 + newline='' explizit: Windows würde sonst cp1252 lesen und CRLF schreiben
s=open('src/zenit.html',encoding='utf-8').read()
head='''<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0c1110">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="Zenit">
<link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="apple-touch-icon.png"><link rel="icon" href="icon-192.png">'''
boot='''<script>
if ('serviceWorker' in navigator) addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
</script>'''
base = '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px)}body{margin:0;font:14px/1.4 system-ui,-apple-system,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>'
verjs='<script>window.ZENIT_V='+repr(ver)+'</script>' if ver else ''
s='<!doctype html>\n<html lang="de"><head><meta charset="utf-8">'+head+base+verjs+'</head><body>\n'+s.replace('<!--PWA-->','')+boot+'\n</body></html>'
os.makedirs('dist',exist_ok=True)
open('dist/index.html','w',encoding='utf-8',newline='').write(s)
for f in glob.glob('public/*'): shutil.copy(f,'dist/')
print('dist/ gebaut')
