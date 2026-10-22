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
const TOGGLES = ['[data-xr]', '[data-xm]', '[data-cday]', '[data-cnav]', '[data-cmode]', '[data-todo]', '[data-pdb]', '[data-pchg]', '[data-fsd]', '[data-fwa]', '[data-hsel]', '[data-col]', '[data-cf2]', '[data-cg]', '[data-pstat]', '[data-srng]', '[data-sall]', '[data-kmon]', '[data-lcf]', '[data-msel]', '[data-fstk]'];
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
      await click('[data-fquick]'); await closeSheet(); await click('[data-fgoal]'); await click('[data-ctb]'); await click('[data-gmode="m"]'); await click('[data-gmode="a"]'); await closeSheet();
      await click('[data-fdishes]'); await click('[data-fde]'); await closeSheet(); await click('[data-fsearch]'); await click('[data-fown="new"]'); await closeSheet();
      await click('[data-fedit]'); await closeSheet();
      // Wasser genau, Gericht: Zutat über die Suche hinzufügen
      await click('[data-fwao]'); await click('[data-fwa="500"]'); await closeSheet();
      await click('[data-fdishes]'); await click('[data-fde="new"]'); await click('[data-dgs]'); await p.fill('#fq', 'skyr').catch(() => {}); await click('[data-fpick]'); await click('[data-fpadd]'); await closeSheet();
    }
    // Plan: Tag ändern (Tauschen über den Kalender, Ersetzen, Aussetzen, Urlaub; jede Aktion schaltet sich beim zweiten Tippen aus)
    if (tab === 'tage') {
      await click('[data-cnow]');
      if (!(await p.$('.pday.open'))) await click('[data-pchg]');
      await click('[data-pmode="swap"]'); await click('.pc2.pick'); await click('[data-pmode="swap"]');
      await click('[data-pmode="repl"]'); await click('[data-preplx]'); await click('[data-pmode="repl"]');
      await click('[data-pmode="skip"]'); await click('[data-pmode="skip"]'); await click('[data-pmode="add"]'); await click('[data-paddx]');
      await click('[data-pmode="vac"]'); await click('[data-poff="3"]'); await shot('tage-urlaub');
      await click('[data-pmode="vac"]'); await click('[data-pchg]');
    }
    // Plan: Wochenplaner (Karte antippen + Tag antippen, entfernen, speichern, neuer Plan, aktivieren), daraus den Editor öffnen
    if (tab === 'tage' && await click('[data-pman]')) {
      await click('.pk[data-pkid]'); await click('[data-pslot="6"]'); await click('[data-punset]'); await click('[data-psave]');
      await click('[data-wpnew]'); await click('.pk[data-pkid]'); await click('[data-pslot="0"]'); await click('[data-psave]');
      await click('[data-wpact]'); await click('[data-wpon]'); await shot('tage-planer');
    }
    // Plan: Trainingstag-Editor öffnen, Übung an/aus, Icon, Filter, Rhythmus, gesperrte Übung, zurück
    if (tab === 'tage' && await click('[data-pedit]')) {
      await click('[data-ptog]'); await click('[data-ptog]'); await click('[data-pic="star"]'); await click('[data-pef="pull"]'); await click('[data-pef="all"]');
      await click('[data-prp="2"]'); await click('[data-pst="1"]'); await click('[data-prp="0"]'); await click('[data-prp="1"]'); await click('[data-plk]'); await click('[data-plk]');
      await shot('tage-editor'); await click('[data-pback]');
      await click('[data-pmanx]'); await click('[data-pdiscok]');
    }
    // Heute: Bergpfad (Kopfzeile antippen) und zurück, Arena öffnen (Karte, Punkte), verlassen
    if (tab === 'heute') { await click('#hud [data-zoom]'); await click('#hud [data-zoom]'); await click('[data-arena]'); await click('.hc.big'); await closeSheet(); await click('.ar-dots button:last-child'); await click('[data-arx]'); }
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
