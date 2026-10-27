import os,shutil,glob,subprocess
ROOT=os.path.dirname(os.path.abspath(__file__))
# Quelle: src/index.html (Gerüst) + src/css/*.css an <!--CSS--> + src/js/*.js an <!--JS--> (jeweils in Dateinamen-Reihenfolge).
# Die JS-Teile sind Abschnitte EINER Funktion (IIFE im Gerüst): gemeinsamer Gültigkeitsbereich, Reihenfolge zählt (Code läuft beim Laden von oben nach unten).
def parts():
    out=[]
    for line in open(os.path.join(ROOT,'src','index.html'),encoding='utf-8').read().splitlines(True):
        k={'<!--CSS-->\n':'css','<!--JS-->\n':'js'}.get(line)
        if not k: out.append(('src/index.html',line)); continue
        for f in sorted(glob.glob(os.path.join(ROOT,'src',k,'*.'+k))):
            out.append((os.path.relpath(f,ROOT).replace('\\','/'),open(f,encoding='utf-8').read()))
    return out
def assemble():
    # zusammengesetzte Quelle und Zeilen-Zuordnung für Fehlermeldungen: where(n) -> 'src/js/10-essen.js:12'
    txt,idx,n='',[],0
    for f,t in parts():
        c=t.count('\n'); idx.append((n,f,c)); txt+=t; n+=c
    def where(line):
        for a,f,c in idx:
            if a<line<=a+c: return f if f=='src/index.html' else '%s:%d'%(f,line-a)
        return '?'
    return txt, where
def git(*a):
    try: return subprocess.run(['git',*a],capture_output=True,text=True,encoding='utf-8',cwd=ROOT).stdout.strip()
    except OSError: return ''
def build():
    # Version für Zahnrad-Menü: Commit + Datum, "+" = lokaler Build mit ungesicherten Änderungen
    ver=git('rev-parse','--short','HEAD')
    if ver: ver+=('+' if git('status','--porcelain') else '')+' · '+git('log','-1','--format=%cd','--date=format:%d.%m.%y %H:%M')
    s=assemble()[0]
    head='''<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<meta name="theme-color" content="#0d0f0c">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="Zenit">
<link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="apple-touch-icon.png"><link rel="icon" href="icon-192.png">'''
    boot='''<script>
if ('serviceWorker' in navigator) addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
</script>'''
    base='<style>:root{color-scheme:light}body{margin:0;font:14px/1.4 system-ui,-apple-system,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>'
    verjs='<script>window.ZENIT_V='+repr(ver)+'</script>' if ver else ''
    s='<!doctype html>\n<html lang="de"><head><meta charset="utf-8">'+head+base+verjs+'</head><body>\n'+s.replace('<!--PWA-->','')+boot+'\n</body></html>'
    os.makedirs(os.path.join(ROOT,'dist'),exist_ok=True)
    # utf-8 + newline='' explizit: Windows würde sonst cp1252 lesen und CRLF schreiben
    open(os.path.join(ROOT,'dist','index.html'),'w',encoding='utf-8',newline='').write(s)
    for f in glob.glob(os.path.join(ROOT,'public','*')): shutil.copy(f,os.path.join(ROOT,'dist'))
    print('dist/ gebaut')
if __name__=='__main__': build()
