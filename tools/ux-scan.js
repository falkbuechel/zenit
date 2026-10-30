// UX-Scan: je Ansicht unslop-Audit (tools/unslop-audit.js), Tippziele < 32 px, Schriftgrößen, Screenshot -> tools/out/ux-*.png, Bericht tools/out/ux.json
// Aufruf: node tools/ux-scan.js (vorher python build.py). Ansichten in VIEWS ergänzen, wenn weitere Tabs fertig sind.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { pathToFileURL } = require('url');
const S = path.join(__dirname, 'out'), AUD = fs.readFileSync(path.join(__dirname, 'unslop-audit.js'), 'utf8'); fs.mkdirSync(S, { recursive: true });
const URL_ = pathToFileURL(path.join(__dirname, '..', 'dist', 'index.html')).href;
const VIEWS = [
  ['essen', ['#tabs [data-tab="food"]']],
  ['plan-training', ['#tabs [data-tab="tage"]']],
  ['plan-essen', ['[data-pgt="e"]']],
  ['plan-vorlagen', ['[data-pgt="v"]']],
  ['plan-gerichte', ['[data-pgt="g"]']],
  ['plan-einkauf', ['[data-pgt="s"]']],
  ['suche', ['#tabs [data-tab="food"]', '[data-fsearch]']],
];
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, reducedMotion: 'reduce' });
  await ctx.route(/openfoodfacts\.org/, r => r.fulfill({ status: 200, contentType: 'application/json', headers: { 'Access-Control-Allow-Origin': '*' }, body: '{"products":[]}' }));
  const p = await ctx.newPage();
  await p.goto(URL_);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('zenit.mode', 'demo'); const bt = document.createElement('button'); bt.dataset.demo = 'mid'; document.body.appendChild(bt); bt.click(); });
  await p.waitForTimeout(400);
  const out = {};
  for (const [n, clicks] of VIEWS) {
    for (const c of clicks) await p.locator(c).first().click({ timeout: 1500 }).catch(() => {});
    await p.waitForTimeout(250);
    await p.screenshot({ path: path.join(S, 'ux-' + n + '.png'), fullPage: true });
    const r = await p.evaluate('window.UNSLOP_OPTIONS={log:false,perRule:4};' + AUD);
    const extra = await p.evaluate(() => {
      const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
      const tap = [...document.querySelectorAll('button,[role=button],input,select,a')].filter(vis)
        .map(e => { const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), t: (e.getAttribute('aria-label') || e.textContent || e.className).trim().slice(0, 25) }; })
        .filter(x => x.w < 32 || x.h < 32);
      const fs = {}; document.querySelectorAll('body *').forEach(e => { if (vis(e) && [...e.childNodes].some(c => c.nodeType === 3 && c.textContent.trim())) { const s = getComputedStyle(e).fontSize; fs[s] = (fs[s] || 0) + 1; } });
      const noLabel = [...document.querySelectorAll('button')].filter(vis).filter(e => !e.textContent.trim() && !e.getAttribute('aria-label')).length;
      return { small: tap.length, smallEx: tap.slice(0, 8), fontSizes: fs, noLabel, height: document.documentElement.scrollHeight };
    });
    out[n] = { counts: r.counts, totals: r.totals, ex: r.issues.map(i => i.rule + ': ' + i.el.slice(-40) + ' ' + JSON.stringify(i.detail).slice(0, 60)), ...extra };
    if (n === 'suche') await p.locator('[data-sheet-close]').first().click().catch(() => {});
  }
  fs.writeFileSync(path.join(S, 'ux.json'), JSON.stringify(out, null, 1));
  for (const [n, v] of Object.entries(out)) console.log(n, JSON.stringify(v.counts), JSON.stringify(v.totals), 'klein:', v.small, 'ohneLabel:', v.noLabel, 'h:', v.height, 'fs:', Object.keys(v.fontSizes).length);
  await b.close();
})();
