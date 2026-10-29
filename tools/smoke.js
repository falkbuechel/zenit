// Rauchtest gegen dist/: jedes Demo-Szenario laden, alle Tabs, Ansichten und Dialoge durchklicken.
// Schlägt fehl bei jedem JS-Fehler. Aufruf: node tools/smoke.js [url] [--shots]  (vorher python tools/check.py)
// Szenarien laufen parallel (eigener Kontext = eigener Speicher), Animationen sind aus, daher kaum Wartezeiten.
// Screenshots der Tabs -> tools/out/, mit --shots zusätzlich Dialoge, Planer, Editor.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { pathToFileURL } = require('url');
const ARGS = process.argv.slice(2), SHOTS = ARGS.includes('--shots');
const URL_ = ARGS.filter(a => !a.startsWith('--'))[0] || pathToFileURL(path.join(__dirname, '..', 'dist', 'index.html')).href;
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const SCEN = ['mid', 'gold', 'broken', 'fresh', 'empty'];
const TABS = ['heute', 'tage', 'food', 'fort', 'profil'];
// Je Tab: Schalter, von denen jeweils jeder Wert einmal angeklickt wird (alle harmlos, nichts löscht)
const TOGGLES = ['[data-xr]', '[data-xm]', '[data-cday]', '[data-cnav]', '[data-cmode]', '[data-pft]', '[data-pdb]', '[data-fsd]', '[data-fwa]', '[data-hsel]', '[data-col]', '[data-cf2]', '[data-cg]', '[data-pstat]', '[data-srng]', '[data-sall]', '[data-kmon]', '[data-lcf]', '[data-msel]', '[data-fstk]'];
const NOANIM = '*, *::before, *::after { animation: none !important; transition: none !important; }';

async function scenario(b, sc, errs) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true, reducedMotion: 'reduce' });
  await ctx.addInitScript(css => { document.addEventListener('DOMContentLoaded', () => { const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s); }); }, NOANIM);
  // Open Food Facts nicht wirklich fragen (Suche ab 3 Zeichen): leere Antwort, Test bleibt offline und gleich
  await ctx.route(/openfoodfacts\.org/, r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: '{"products":[],"status":0}' }));
  const p = await ctx.newPage(); let where = sc;
  // Fehler mit erster Stack-Zeile (Funktion + Zeile im gebauten dist/index.html)
  p.on('pageerror', e => errs.push(where + ': ' + e.message + ' @ ' + ((e.stack || '').split('\n')[1] || '').trim()));
  p.on('console', m => { if (m.type() === 'error' && !/fonts\.g/.test(m.text())) errs.push(where + ': ' + m.text()); });
  const shot = (n, all) => (all || SHOTS) ? p.screenshot({ path: path.join(OUT, `${sc}-${n}.png`) }) : null;
  // Klicks lösen synchrones Rendern aus; ohne Animationen reicht ein kurzer Takt. Karten im Planer: force.
  // Verdeckt (z. B. Rückgängig-Toast über der untersten Kachel): einmal erzwungen wiederholen, erst dann als Fehler zählen
  const click = async sel => {
    const el = p.locator(sel).first(); if (!(await el.isVisible().catch(() => false))) return false;
    await el.click({ timeout: 1500, force: sel.startsWith('.pk') || sel === '[data-pedit]' }).catch(() => el.click({ timeout: 1500, force: true })).catch(e => errs.push(where + ': Klick ' + sel + ' ' + e.message.split('\n')[0]));
    await p.waitForTimeout(30); return true;
  };
  const closeSheet = () => click('[data-sheet-close]');

  await p.goto(URL_);
  await p.evaluate(k => { localStorage.clear(); localStorage.setItem('zenit.mode', 'demo'); const bt = document.createElement('button'); bt.dataset.demo = k; document.body.appendChild(bt); bt.click(); }, sc);
  await p.waitForLoadState('load'); await p.waitForTimeout(300);
  for (const tab of TABS) {
    where = sc + '/' + tab;
    await click(`#tabs [data-tab="${tab}"]`);
    await shot(tab, true);
    for (const sel of TOGGLES) {
      const vals = await p.$$eval(sel, (els, s) => [...new Set(els.map(e => e.getAttribute(s.slice(1, -1))))], sel);
      for (const v of vals) await click(`${sel.slice(0, -1)}="${v}"]`);
    }
    // Essen: Kachel → Menge bestätigen, Suche → Menge → Eintragen, Schnell, Ziele (beide Modi), Gerichte, eigenes Lebensmittel
    if (tab === 'food') {
      await click('[data-ftile="0"]'); await click('[data-fpadd]'); await click('[data-fsearch]'); await p.fill('#fq', 'ei').catch(() => {}); await click('[data-fpick]'); await click('[data-fstep="1"]'); await click('[data-fpadd]');
      await click('[data-fnut="f"]'); await click('.fnr'); await closeSheet(); await click('[data-fnut="k"]'); await closeSheet(); await click('[data-fwa="250"]'); await click('[data-fwa="500"]');
      await click('[data-fquick]'); await closeSheet(); await click('[data-fgoal]'); await click('[data-ctb]'); await click('[data-gmode="m"]'); await click('[data-gmode="a"]'); await closeSheet();
      await click('[data-fdishes]'); await click('[data-fde]'); await closeSheet(); await click('[data-fsearch]'); await click('[data-fown="new"]'); await closeSheet();
      await click('[data-fedit]'); await closeSheet();
      // Wasser genau, Gericht: Zutat über die Suche hinzufügen
      await click('[data-fwao]'); await click('[data-fwa="500"]'); await closeSheet();
      await click('[data-fdishes]'); await click('[data-fde="new"]'); await click('[data-dgs]'); await p.fill('#fq', 'skyr').catch(() => {}); await click('[data-fpick]'); await click('[data-fpadd]'); await closeSheet();
    }
    // Plan: Training ändern (Tauschen über den Kalender, Ersetzen, Aussetzen, Zusätzlich; jede Aktion schaltet sich beim zweiten Tippen aus), Pause (Urlaub) im Kalender
    if (tab === 'tage') {
      await click('[data-cnow]');
      const ed = () => click('[data-pdedit]'), pz = ed;
      await ed(); await click('[data-pmode="swap"]'); await click('.pc2.pick'); await ed(); await click('[data-pmode="swap"]');
      await ed(); await click('[data-pmode="repl"]'); await click('[data-preplx]'); await ed(); await click('[data-pmode="repl"]');
      await ed(); await click('[data-pmode="skip"]'); await ed(); await click('[data-pmode="skip"]'); await ed(); await click('[data-pmode="add"]'); await click('[data-paddx]');
      await pz(); await click('[data-pmode="vac"]'); await click('[data-poff="3"]'); await shot('tage-urlaub');
      await pz(); await click('[data-pmode="vac"]'); await closeSheet(); await click('[data-pft="e"]');
      // Essen planen (Kachel einplanen, Gericht antippen = übliche Mahlzeit), Einkaufsliste: Zeitraum, abhaken
      await click('[data-pml]'); await click('[data-pla]'); await closeSheet(); await click('[data-pfd]'); await shot('tage-essen');
      // Vorlagen: Tag speichern, einplanen, Löschmodus, zurück zu Gerichten
      await click('[data-pgt="v"]'); await click('[data-ptpd]'); await click('[data-ptp]'); await shot('tage-vorlagen'); await click('[data-ptpx]'); await click('[data-ptp]'); await click('[data-pgt="g"]'); await click('[data-pws="4"]');
      await click('[data-pshop]'); await click('[data-shn="3"]'); await click('[data-shk]'); await shot('tage-einkauf'); await closeSheet(); await click('[data-pft="t"]');
      if (await click('[data-pnts]')) await closeSheet();
      await click('[data-pdays]'); await shot('tage-tage'); await click('[data-sheet-close]');
    }
    // Plan: Trainingstag-Editor öffnen, Übung an/aus, Icon, Filter, Rhythmus, gesperrte Übung, zurück
    if (tab === 'tage' && await click('[data-pedit]')) {
      await click('[data-ptog]'); await click('[data-ptog]'); await click('[data-pic="star"]'); await click('[data-pef="pull"]'); await click('[data-pef="all"]');
      await click('[data-prp="2"]'); await click('[data-pst="1"]'); await click('[data-prp="0"]'); await click('[data-prp="1"]'); await click('[data-plk]'); await click('[data-plk]');
      await shot('tage-editor'); await click('[data-pback]');
    }
    // Heute: Bergpfad (Kopfzeile antippen) und zurück, Arena öffnen (Karte, Punkte), verlassen
    if (tab === 'heute') { await click('.hm-lv'); await click('.bp'); await click('[data-arena]'); await click('[data-arv="1"]'); await click('[data-arsave]'); await click('[data-rest="sub"]'); await click('[data-rest="skip"]'); await click('.arm-s .hc'); await closeSheet(); await click('.ar-dots button:last-child'); await click('[data-arx]'); for (let k = 0; k < 8; k++) { await p.waitForTimeout(1700); if (!(await click('.lvfx'))) break; } }
    // Sammlung: Karte, Muskel, zurück zu Karten
    if (tab === 'fort') { await click('[data-col="ka"]'); await click('[data-cardo]'); await closeSheet(); await click('[data-col="mu"]'); await click('.minf [data-muso]'); await closeSheet(); await click('[data-col="sk"]'); await click('.stx.sk'); await click('.stm'); await click('.sts'); }
    if (await click('[data-open]')) { await shot(tab + '-detail'); await click('[data-back]'); }
    if (await click('[data-pill]')) { await shot(tab + '-sheet'); await closeSheet(); }
  }
  where = sc + '/einstellungen';
  await click('#tabs [data-tab="profil"]'); await click('[data-set]'); await shot('einstellungen'); await closeSheet();
  await ctx.close();
}

(async () => {
  const t0 = Date.now(), b = await chromium.launch(), errs = [];
  await Promise.all(SCEN.map(sc => scenario(b, sc, errs)));
  await b.close();
  if (errs.length) { console.log('FEHLER (' + errs.length + '):\n' + errs.join('\n')); process.exit(1); }
  console.log('OK: ' + SCEN.length + ' Szenarien × ' + TABS.length + ' Tabs ohne Fehler in ' + Math.round((Date.now() - t0) / 1000) + ' s, Screenshots in tools/out/');
})();
