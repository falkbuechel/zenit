// Rauchtest gegen dist/: jedes Demo-Szenario laden, alle Tabs, Ansichten und Dialoge durchklicken.
// Schlägt fehl bei jedem JS-Fehler. Aufruf: node tools/smoke.js [url]  (vorher python tools/check.py)
// Ohne url wird dist/index.html direkt geöffnet (Service Worker läuft dann nicht). Screenshots -> tools/out/
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { pathToFileURL } = require('url');
const URL_ = process.argv[2] || pathToFileURL(path.join(__dirname, '..', 'dist', 'index.html')).href;
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const SCEN = ['mid', 'gold', 'broken', 'fresh', 'empty'];
const TABS = ['heute', 'tage', 'food', 'fort', 'profil'];
// Je Tab: Schalter, von denen jeweils jeder Wert einmal angeklickt wird (alle harmlos, nichts löscht)
const TOGGLES = ['[data-seg]', '[data-range]', '[data-met]', '[data-gf]', '[data-xr]', '[data-xm]', '[data-pg]', '[data-mo]', '[data-cday]', '[data-cnav]', '[data-cmode]', '[data-pchg]', '[data-pman]', '[data-wv]', '[data-pmanx]'];

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true });
  const p = await ctx.newPage();
  const errs = []; let where = '';
  p.on('pageerror', e => errs.push(where + ': ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/fonts\.g/.test(m.text())) errs.push(where + ': ' + m.text()); });
  const pause = ms => p.waitForTimeout(ms);
  const click = async sel => { const el = p.locator(sel).first(); if (await el.isVisible().catch(() => false)) { await el.click({ timeout: 2000 }).catch(e => errs.push(where + ': Klick ' + sel + ' ' + e.message.split('\n')[0])); await pause(250); return true; } return false; };
  const closeSheet = async () => { await click('[data-sheet-close]'); await pause(300); };

  await p.goto(URL_);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('zenit.mode', 'demo'); });
  for (const sc of SCEN) {
    where = sc;
    // Demo-Szenario über den eingebauten Knopf laden (Klick-Handler hängt am document, lädt neu)
    await p.evaluate(k => { const bt = document.createElement('button'); bt.dataset.demo = k; document.body.appendChild(bt); bt.click(); }, sc);
    await p.waitForLoadState('load'); await pause(800);
    for (const tab of TABS) {
      where = sc + '/' + tab;
      await click(`[data-tab="${tab}"]`); await pause(400);
      await p.screenshot({ path: path.join(OUT, `${sc}-${tab}.png`) });
      for (const sel of TOGGLES) {
        const vals = await p.$$eval(sel, (els, s) => [...new Set(els.map(e => e.getAttribute(s.slice(1, -1))))], sel);
        for (const v of vals) await click(`${sel.slice(0, -1)}="${v}"]`);
      }
      if (await click('[data-open]')) { await p.screenshot({ path: path.join(OUT, `${sc}-${tab}-detail.png`) }); await click('[data-back]'); }
      if (await click('[data-pill]')) { await p.screenshot({ path: path.join(OUT, `${sc}-${tab}-sheet.png`) }); await closeSheet(); }
    }
    where = sc + '/einstellungen';
    await click('[data-tab="profil"]'); await click('[data-set]'); await pause(300);
    await p.screenshot({ path: path.join(OUT, `${sc}-einstellungen.png`) }); await closeSheet();
  }
  await b.close();
  if (errs.length) { console.log('FEHLER (' + errs.length + '):\n' + errs.join('\n')); process.exit(1); }
  console.log('OK: ' + SCEN.length + ' Szenarien × ' + TABS.length + ' Tabs ohne Fehler, Screenshots in tools/out/');
})();
