// Gerätegrößen: jede Ansicht auf allen aktuellen iPhone-Größen messen und mit dem iPhone 13 (390×844, Bezug) vergleichen.
// Gemeldet wird nur, was auf einem anderen Gerät schlechter ist als auf dem Bezug: ragt aus dem Bild, wird abgeschnitten,
// bricht in mehr Zeilen um oder überlappt anderen Text. Aufruf: python tools/check.py, dann node tools/fit.js [--all]
// --all: auch Funde, die schon auf dem Bezug bestehen. Exit 1 bei Funden.
const { chromium } = require('playwright');
const path = require('path'), { pathToFileURL } = require('url');
const ALL = process.argv.includes('--all');
const URL_ = pathToFileURL(path.join(__dirname, '..', 'dist', 'index.html')).href;
const REF = 'iPhone 13';
const DEV = [['iPhone 13', 390, 844], ['iPhone SE', 375, 667], ['iPhone 13 mini', 375, 812], ['iPhone 15', 393, 852], ['iPhone 16 Pro', 402, 874], ['iPhone 13 Pro Max', 428, 926], ['iPhone 15 Plus', 430, 932], ['iPhone 16 Pro Max', 440, 956]];
const FIX = `(() => { const T = new Date('2026-10-21T14:00:00').getTime(), D = Date;
  globalThis.Date = class extends D { constructor(...a) { super(...(a.length ? a : [T])); } static now() { return T; } }; Math.random = () => 0.5; })();`;
const NOANIM = '*, *::before, *::after { animation: none !important; transition: none !important; }';
// Ansichten: Tab, optional Klicks nacheinander (Bereich, Fenster). Fenster werden danach geschlossen
const VIEWS = [['heute'], ['heute', '[data-arena]'], ['heute', '[data-zoom]'],
  ['food'], ['food', '[data-ftile="0"]'], ['food', '[data-fsearch]'], ['food', '[data-fwao]'], ['food', '[data-fgoal]'], ['food', '[data-fdishes]'], ['food', '[data-fquick]'],
  ['tage'], ['tage', '[data-pchg]'], ['tage', '[data-pdedit]'], ['tage', '[data-pedit]'], ['tage', '[data-ptt="v"]'], ['tage', '[data-pft="e"]'], ['tage', '[data-pft="e"]', '[data-pgt="v"]'], ['tage', '[data-pft="e"]', '[data-pgt="s"]'],
  ['fort'], ['fort', '[data-col="mu"]'], ['fort', '[data-col="sk"]'], ['fort', '[data-cardo]'],
  ['profil'], ['profil', '[data-pstat="tr"]'], ['profil', '[data-pstat="er"]'], ['profil', '[data-set]']];

// Im Browser: alle sichtbaren Elemente mit eigenem Text bzw. alle sichtbaren Elemente messen
function measure() {
  const W = innerWidth, out = [], seen = {};
  const vis = el => { const cs = getComputedStyle(el); return cs.display !== 'none' && cs.visibility === 'visible' && +cs.opacity > 0.05; };
  const name = el => {
    let s = '', e = el;
    for (let i = 0; i < 3 && e && e !== document.body; i++, e = e.parentElement) s = (e.id ? '#' + e.id : e.tagName.toLowerCase() + (e.classList.length ? '.' + [...e.classList].slice(0, 2).join('.') : '')) + (s ? ' > ' + s : '');
    return s;
  };
  const text = el => [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').replace(/\s+/g, ' ').trim();
  const key = (el, t) => { const k = name(el) + (t ? ' „' + t.slice(0, 24) + '“' : ''); seen[k] = (seen[k] || 0) + 1; return seen[k] > 1 ? k + ' #' + seen[k] : k; };
  const clipBox = el => { for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) { const ox = getComputedStyle(a).overflowX; if (ox !== 'visible') return { a, scroll: ox === 'auto' || ox === 'scroll' }; } return null; };
  const app = document.getElementById('app');
  if (app && app.scrollWidth > app.clientWidth + 1) out.push({ k: 'Seite', kind: 'quer', v: app.scrollWidth - app.clientWidth });
  // Ebene = nächster fester/klebender Vorfahr (Fenster, Kopf, Leiste): Überlappen zählt nur innerhalb derselben Ebene
  const layer = el => { for (let a = el; a && a !== document.body; a = a.parentElement) { const ps = getComputedStyle(a).position; if (ps === 'fixed' || ps === 'sticky') return a; } return null; };
  const texts = [];
  for (const el of document.body.querySelectorAll('*')) {
    if (/^(SCRIPT|STYLE|svg|path|g|circle|line|rect|polyline|polygon|defs|use|text|tspan)$/.test(el.tagName)) continue;
    const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1 || r.right <= 0 || r.left >= W) continue;
    // Skilltree-Karte (#stcan) wird verschoben und gezoomt: Ausschnitt und Lage hängen vom Seitenverhältnis ab, gewollt
    if (!vis(el) || el.closest('#stcan')) continue;
    const t = text(el), k = key(el, t), cb = clipBox(el);
    if (!cb) { const o = Math.max(-r.left, r.right - W); if (o > 1) out.push({ k, kind: 'raus', v: Math.round(o) }); }
    else if (!cb.scroll) { const b = cb.a.getBoundingClientRect(), o = Math.max(b.left - r.left, r.right - b.right); if (o > 1 && t) out.push({ k, kind: 'ab', v: Math.round(o) }); }
    if (!t) continue;
    const cs = getComputedStyle(el);
    if (cs.overflowX !== 'visible' && el.scrollWidth > el.clientWidth + 1) out.push({ k, kind: 'gekürzt', v: el.scrollWidth - el.clientWidth });
    const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2, ln = Math.round((r.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) / lh);
    out.push({ k, kind: 'zeilen', v: ln });
    texts.push({ el, r, k, l: layer(el) });
  }
  for (let i = 0; i < texts.length; i++) for (let j = i + 1; j < texts.length; j++) {
    const a = texts[i], b = texts[j]; if (a.l !== b.l || a.el.contains(b.el) || b.el.contains(a.el)) continue;
    const x = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left), y = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
    if (x > 2 && y > 2) out.push({ k: a.k + '  ↔  ' + b.k, kind: 'über', v: Math.round(Math.min(x, y)) });
  }
  return out;
}

(async () => {
  const t0 = Date.now(), b = await chromium.launch(), res = {};
  await Promise.all(DEV.map(async ([dev, w, h]) => {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: true, reducedMotion: 'reduce' });
    await ctx.addInitScript(FIX); const p = await ctx.newPage(); res[dev] = {};
    await p.goto(URL_);
    await p.evaluate(() => { localStorage.setItem('zenit.mode', 'demo'); const bt = document.createElement('button'); bt.dataset.demo = 'mid'; document.body.appendChild(bt); bt.click(); });
    await p.waitForLoadState('load'); await p.waitForTimeout(500); await p.addStyleTag({ content: NOANIM });
    for (const [t, ...cl] of VIEWS) {
      await p.click(`#tabs [data-tab="${t}"]`); await p.waitForTimeout(250);
      // Fenster ändern ihre Höhe per JS (shMorph, 340 ms): erst danach messen
      for (const c of cl) { await p.click(c, { force: true, timeout: 1500 }).catch(() => {}); await p.waitForTimeout(450); }
      await p.addStyleTag({ content: NOANIM });
      res[dev][[t, ...cl].join(' ')] = await p.evaluate(measure);
      if (cl.includes('[data-pchg]')) await p.click('[data-pchg]').catch(() => {});
      if (cl.includes('[data-arena]')) await p.click('[data-arx]').catch(() => {});
      if (cl.includes('[data-pedit]')) await p.click('[data-pback]').catch(() => {});
      await p.click('[data-sheet-close]', { timeout: 300 }).catch(() => {});
      await p.evaluate(() => { const a = document.getElementById('app'); if (a) a.scrollTop = 0; });
    }
    await ctx.close();
  }));
  await b.close();
  // Vergleich mit dem Bezug: Zeilen nur, wenn es mehr werden; sonst Fund, den es auf dem Bezug nicht gibt (oder größer ist)
  const LAB = { quer: 'Seite scrollt quer', raus: 'ragt raus', ab: 'abgeschnitten', 'gekürzt': 'Text gekürzt', zeilen: 'mehr Zeilen', 'über': 'überlappt' };
  let n = 0;
  for (const [dev, w, h] of DEV) {
    if (dev === REF && !ALL) continue;
    const lines = [];
    for (const v of VIEWS) {
      const id = v.join(' '), ref = {}; for (const f of res[REF][id]) ref[f.kind + f.k] = f.v;
      for (const f of res[dev][id]) {
        const r = ref[f.kind + f.k];
        if (f.kind === 'zeilen') { if (r !== undefined && f.v > r) lines.push(`  ${id}: ${LAB.zeilen} ${r}→${f.v}  ${f.k}`); continue; }
        if (dev === REF || r === undefined || f.v > r + 1) lines.push(`  ${id}: ${LAB[f.kind]} ${f.v}px  ${f.k}`);
      }
    }
    if (lines.length) { n += lines.length; console.log(`${dev} (${w}×${h}): ${lines.length}\n` + lines.slice(0, 25).join('\n') + (lines.length > 25 ? `\n  … ${lines.length - 25} weitere` : '')); }
  }
  console.log(n ? n + ' Fund(e) gegenüber ' + REF : 'Alle Geräte wie ' + REF, '(' + Math.round((Date.now() - t0) / 1000) + ' s)');
  process.exit(n ? 1 : 0);
})();
