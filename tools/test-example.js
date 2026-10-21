// Playwright-Beispieltest gegen dist/. Aufruf: node tools/test-example.js [url]
// Ohne url wird dist/index.html direkt geöffnet (Service Worker läuft dann nicht). Screenshots -> tools/out/
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { pathToFileURL } = require('url');
const URL_ = process.argv[2] || pathToFileURL(path.join(__dirname, '..', 'dist', 'index.html')).href;
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
(async()=>{
 const b=await chromium.launch();
 const p=await (await b.newContext({viewport:{width:400,height:800},deviceScaleFactor:1})).newPage();
 const errs=[]; p.on('pageerror',e=>errs.push(e.stack)); p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.addInitScript(()=>{ const now=Date.now(),D=864e5,logs=[],w=[],m=[]; for(let k=1;k<=40;k++){ if(k%2) logs.push({t:now-k*D,e:'chin',s:[8,8,7]}); w.push({t:now-k*D*2,kg:80-k*0.05+(k%3)*0.3}); } w.reverse(); m.push({t:now-30*D,w:84,c:100,a:33}); m.push({t:now-2*D,w:83,c:101,a:34});
  localStorage.setItem('stufenbuch.v1',JSON.stringify({u:1,logs,food:{g:{k:2800,p:150},e:[],d:[],w,m,pr:{h:180,a:30,s:'m',go:'bulk',tw:82}}})); });
 await p.goto(URL_); await p.waitForTimeout(800);
 await p.click("[data-tab=tage]"); await p.waitForTimeout(500);
 await p.click('[data-seg="kp"]'); await p.waitForTimeout(700); console.log(errs.join('\n'));
 await p.screenshot({path:path.join(OUT,'k1.png'),fullPage:true});
 await p.click('[data-rm="-1"]'); await p.click('[data-wr="30"]'); await p.waitForTimeout(400);
 await p.click('[data-seg="pf"]'); await p.waitForTimeout(400); await p.screenshot({path:path.join(OUT,'k2.png'),fullPage:false});
 await p.click('[data-tab="heute"]'); await p.waitForTimeout(500); await p.screenshot({path:path.join(OUT,'k3.png'),fullPage:false});
 console.log(errs.join('\n')||'no errors'); await b.close();
})();
