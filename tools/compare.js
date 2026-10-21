// Pixelvergleich: aktueller Build (dist/) gegen einen Git-Stand, Ansicht für Ansicht, hell und dunkel.
// Für Aufräumarbeiten (CSS zusammenführen, toten Code entfernen): alles muss „gleich“ bleiben.
// Aufruf: python tools/check.py, dann node tools/compare.js [git-ref, Standard HEAD]. Abweichende Bilder -> tools/out/compare/
// Uhrzeit und Zufall sind eingefroren, Animationen aus; nach jedem Tabwechsel 900 ms warten (Zahlen und Ringe zählen per JS hoch).
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execSync } = require('child_process'), { pathToFileURL } = require('url');
const ROOT = path.join(__dirname, '..'), REF = process.argv[2] || 'HEAD';
const OUT = path.join(__dirname, 'out', 'compare'), OLD = path.join(__dirname, 'out', 'ref');
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(OUT, { recursive: true });
// Alten Stand bauen: src aus Git, build.py und public von dort
fs.rmSync(OLD, { recursive: true, force: true }); fs.mkdirSync(path.join(OLD, 'src'), { recursive: true });
const show = f => execSync('git show ' + REF + ':' + f, { cwd: ROOT, maxBuffer: 1 << 26 });
fs.writeFileSync(path.join(OLD, 'src', 'zenit.html'), show('src/zenit.html')); fs.writeFileSync(path.join(OLD, 'build.py'), show('build.py'));
fs.cpSync(path.join(ROOT, 'public'), path.join(OLD, 'public'), { recursive: true });
execSync('python build.py', { cwd: OLD });
const FIX = `(() => { const T = new Date('2026-10-21T14:00:00').getTime(), D = Date;
  globalThis.Date = class extends D { constructor(...a) { super(...(a.length ? a : [T])); } static now() { return T; } }; Math.random = () => 0.5; })();`;
const NOANIM = '*, *::before, *::after { animation: none !important; transition: none !important; }';
const VIEWS = [['heute'], ['food'], ['fort'], ['profil'], ['tage'], ['tage', '[data-pchg]'], ['tage', '[data-pman]'], ['fort', '[data-seg="ex"]'], ['fort', '[data-seg="pf"]'], ['food', '[data-seg="kp"]']];
(async () => {
  const b = await chromium.launch(), shots = {};
  for (const [lab, file] of [['alt', path.join(OLD, 'dist', 'index.html')], ['neu', path.join(ROOT, 'dist', 'index.html')]]) {
    for (const cs of ['light', 'dark']) {
      const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, colorScheme: cs, reducedMotion: 'reduce' });
      await ctx.addInitScript(FIX); const p = await ctx.newPage();
      await p.goto(pathToFileURL(file).href);
      await p.evaluate(() => { localStorage.setItem('zenit.mode', 'demo'); const bt = document.createElement('button'); bt.dataset.demo = 'mid'; document.body.appendChild(bt); bt.click(); });
      await p.waitForLoadState('load'); await p.waitForTimeout(700);
      for (const [t, extra] of VIEWS) {
        await p.click(`#tabs [data-tab="${t}"]`); await p.waitForTimeout(900);
        if (extra) { await p.click(extra, { force: true }).catch(() => {}); await p.waitForTimeout(400); }
        await p.addStyleTag({ content: NOANIM }); await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(150);
        const key = cs + '-' + t + (extra ? '-' + extra.replace(/[^a-z]/g, '') : '');
        (shots[key] = shots[key] || {})[lab] = (await p.screenshot({ fullPage: true })).toString('base64');
        if (extra === '[data-pman]') await p.click('[data-pmanx]').catch(() => {});
        if (extra === '[data-pchg]') await p.click('[data-pchg]').catch(() => {});
      }
      await ctx.close();
    }
  }
  const p = await b.newPage(); let bad = 0;
  for (const k of Object.keys(shots)) {
    const r = await p.evaluate(async ([a, n]) => {
      const load = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = 'data:image/png;base64,' + src; });
      const [ia, ib] = await Promise.all([load(a), load(n)]);
      if (ia.width !== ib.width || ia.height !== ib.height) return { size: ia.height + ' vs ' + ib.height };
      const c = document.createElement('canvas'); c.width = ia.width; c.height = ia.height; const x = c.getContext('2d');
      x.drawImage(ia, 0, 0); const da = x.getImageData(0, 0, c.width, c.height).data; x.drawImage(ib, 0, 0); const db = x.getImageData(0, 0, c.width, c.height).data;
      let n0 = 0, y0 = 1e9, y1 = -1;
      for (let i = 0; i < da.length; i += 4) if (Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]) > 24) { n0++; const y = (i / 4 / c.width) | 0; y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      return { n: n0, y0, y1 };
    }, [shots[k].alt, shots[k].neu]);
    console.log(k.padEnd(28), r.size ? 'GRÖSSE ' + r.size : r.n ? r.n + ' px anders, y ' + r.y0 + '–' + r.y1 : 'gleich');
    if (r.n || r.size) { bad++; for (const l of ['alt', 'neu']) fs.writeFileSync(path.join(OUT, k + '-' + l + '.png'), Buffer.from(shots[k][l], 'base64')); }
  }
  console.log(bad ? bad + ' Ansicht(en) anders, Bilder in tools/out/compare/' : 'Alles gleich');
  await b.close();
})();
