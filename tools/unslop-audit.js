// unslop audit (MIT), https://github.com/arjunkshah12345-hash/unslop, skills/unslop/scripts/audit.js, unverändert; Idee von Damir Sokolovsky
/*
 * unslop audit: finds the measurable tells of a vibecoded UI.
 *
 * Read-only. Runs in any page:
 *   - DevTools: paste the file, the report is logged and returned.
 *   - Playwright / CDP / any "evaluate JS" tool: evaluate the file contents;
 *     the completion value is the report object.
 *   - Node: `node scripts/audit-url.mjs <url>` (wraps this file).
 *
 * Options (set before running): window.UNSLOP_OPTIONS = { grid: 4, ignore: '[data-unslop-ignore]', log: true }
 * Skip an element and its subtree with the attribute data-unslop-ignore (for example, a "before" screenshot).
 */
(() => {
  function audit(options) {
    const o = Object.assign({ grid: 4, ignore: '[data-unslop-ignore]', perRule: 30, log: true, root: document.body }, options || {});
    const issues = [];
    const totals = {}, counts = { error: 0, warn: 0, info: 0 };
    const add = (rule, severity, el, detail) => {
      totals[rule] = (totals[rule] || 0) + 1;
      counts[severity]++;
      if (totals[rule] <= o.perRule) issues.push({ rule, severity, el: el ? path(el) : '', detail });
    };

    /* ---------- helpers ---------- */
    const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'HEAD', 'META', 'LINK', 'BR', 'svg']);
    const isSvgChild = el => el instanceof SVGElement && el.tagName.toLowerCase() !== 'svg';
    const isCode = el => !!el.closest('code, pre, kbd, samp, textarea, input');
    const ignored = el => !!(o.ignore && el.closest(o.ignore));
    const shown = el => {
      if (el.checkVisibility && !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0.5 && r.height > 0.5;
    };
    function path(el) {
      const parts = [];
      for (let n = el, i = 0; n && n.nodeType === 1 && n !== document.body && i < 3; n = n.parentElement, i++) {
        let s = n.tagName.toLowerCase();
        if (n.id) { parts.unshift(s + '#' + n.id); break; }
        const cls = [...n.classList].slice(0, 2);
        if (cls.length) s += '.' + cls.join('.');
        parts.unshift(s);
      }
      return parts.join(' > ');
    }
    const px = v => parseFloat(v) || 0;
    // 4pt scale; below 8px, 2px half-steps (2, 6) are allowed for hairline tuning; 1px is a border.
    const onGrid = v => { v = Math.abs(Math.round(v * 100) / 100); return v === 0 || v === 1 || v % o.grid === 0 || (v < 8 && v % 2 === 0); };
    function rgba(str) {
      const m = str && str.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    }
    function hsl({ r, g, b }) {
      r /= 255; g /= 255; b /= 255;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
      if (!d) return { h: 0, s: 0, l };
      const s = d / (1 - Math.abs(2 * l - 1));
      let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
      return { h: (h * 60 + 360) % 360, s, l };
    }
    const vivid = c => { if (!c || c.a < 0.12) return false; const { s, l } = hsl(c); return s > 0.45 && l > 0.15 && l < 0.88; };
    const lum = ({ r, g, b }) => [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); })
      .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
    const over = (f, b) => ({ r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a), a: 1 });
    const ownText = el => [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();

    /* ---------- collect ---------- */
    const els = [o.root, ...o.root.querySelectorAll('*')].filter(el => !SKIP.has(el.tagName) && !isSvgChild(el) && !ignored(el) && shown(el));
    const weights = new Map(), sizes = new Map(), radii = new Map(), hues = new Map();

    for (const el of els) {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();

      /* spacing: declared values */
      const declared = [
        ['padding-top', cs.paddingTop], ['padding-right', cs.paddingRight], ['padding-bottom', cs.paddingBottom], ['padding-left', cs.paddingLeft],
        ['margin-top', cs.marginTop], ['margin-bottom', cs.marginBottom], // horizontal margins resolve "auto" to px; skipped
      ];
      if (/flex|grid/.test(cs.display)) declared.push(['row-gap', cs.rowGap], ['column-gap', cs.columnGap]);
      const bad = declared.filter(([, v]) => v.endsWith('px') && !onGrid(px(v)));
      if (bad.length) add('spacing/off-grid', 'error', el, bad.map(([k, v]) => `${k} ${Math.round(px(v) * 10) / 10}px`).join(', '));

      /* spacing: repeated siblings (same tag + first class) must sit at identical gaps */
      const kids = [...el.children].filter(k => !SKIP.has(k.tagName) && !ignored(k) && shown(k) && !/absolute|fixed/.test(getComputedStyle(k).position));
      // mixed text flow ("press <kbd>a</kbd> or <kbd>b</kbd>") is typesetting, not layout
      const textFlow = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      if (kids.length >= 3 && !textFlow && !/space-/.test(cs.justifyContent)) {
        const sig = k => k.tagName + '.' + (k.classList[0] || '');
        const R = kids.map(k => k.getBoundingClientRect());
        const vert = R.every((b, i) => !i || b.top >= R[i - 1].bottom - 0.5);
        const horiz = !vert && R.every((b, i) => !i || b.left >= R[i - 1].right - 0.5);
        if (vert || horiz) {
          const gaps = [];
          for (let i = 1; i < kids.length; i++) if (sig(kids[i]) === sig(kids[i - 1])) gaps.push(Math.round(vert ? R[i].top - R[i - 1].bottom : R[i].left - R[i - 1].right));
          if (gaps.length >= 2 && Math.max(...gaps) - Math.min(...gaps) > 1) add('spacing/uneven-siblings', 'error', el, `${vert ? 'vertical' : 'horizontal'} gaps ${gaps.join(', ')}px between repeated ${sig(kids[0]).toLowerCase()} siblings`);
        }
      }

      /* surfaces */
      const clip = cs.backgroundClip || cs.webkitBackgroundClip;
      if (clip === 'text' && /gradient\(/.test(cs.backgroundImage)) add('surface/gradient-text', 'error', el, (ownText(el) || el.textContent).trim().slice(0, 40));
      if (/gradient\(/.test(cs.backgroundImage) && r.width * r.height > 4000 && clip !== 'text') {
        const stops = (cs.backgroundImage.match(/rgba?\([^)]+\)/g) || []).map(rgba);
        const loud = stops.filter(vivid);
        if (loud.length >= 2 && new Set(loud.map(c => Math.round(hsl(c).h / 40))).size >= 2) add('surface/vivid-gradient', 'warn', el, `${Math.round(r.width)}×${Math.round(r.height)} gradient across ${loud.length} saturated stops`);
      }
      if (cs.textShadow !== 'none') add('surface/text-glow', 'warn', el, cs.textShadow.slice(0, 60));
      const shadows = [...(cs.boxShadow + ' ' + cs.filter).matchAll(/(rgba?\([^)]+\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+([\d.]+)px/g)];
      const glow = shadows.find(m => px(m[4]) >= 10 && vivid(rgba(m[1])));
      if (glow) add('surface/colored-glow', 'warn', el, `${glow[1]} blur ${glow[4]}px`);
      if (/blur\(/.test(cs.backdropFilter || cs.webkitBackdropFilter || '')) add('surface/glass', 'info', el, cs.backdropFilter);

      /* colour: count accent hues on sizable elements */
      if (r.width >= 14 && r.height >= 14) {
        for (const c of [rgba(cs.backgroundColor), ownText(el) ? rgba(cs.color) : null, cs.borderTopWidth !== '0px' ? rgba(cs.borderTopColor) : null]) {
          if (vivid(c)) { const h = Math.round(hsl(c).h / 30) % 12; if (!hues.has(h)) hues.set(h, el); }
        }
      }

      /* radius scale (pills/circles excluded) */
      const rad = px(cs.borderTopLeftRadius);
      if (rad > 0 && rad < Math.min(r.width, r.height) / 2 - 1) radii.set(Math.round(rad), (radii.get(Math.round(rad)) || 0) + 1);

      /* text */
      const t = ownText(el);
      if (t) {
        weights.set(cs.fontWeight, (weights.get(cs.fontWeight) || 0) + 1);
        sizes.set(Math.round(px(cs.fontSize) * 2) / 2, (sizes.get(Math.round(px(cs.fontSize) * 2) / 2) || 0) + 1);
        if (!isCode(el)) {
          const emoji = t.match(/\p{Emoji_Presentation}|\p{Extended_Pictographic}️/gu);
          if (emoji) add('icons/emoji', 'error', el, `${emoji.join('')} in "${t.slice(0, 40)}"`);
          if (/!/.test(t)) add('type/exclamation', 'warn', el, `"${t.slice(0, 50)}"`);
          const hype = t.match(/\b(blazing|crushing|elite|insane|epic|killer|supercharge\w*|next-level|game[- ]chang\w*|magic(al)?|unleash\w*|revolutionar\w*|lightning[- ]fast|ninja|rockstar|yikes|cooking)\b/gi);
          if (hype) add('type/hype', 'warn', el, `${[...new Set(hype.map(h => h.toLowerCase()))].join(', ')} in "${t.slice(0, 40)}"`);
          if ((/^[\d.,%+\-−$€£:\s]+[a-z%]{0,3}$/i.test(t)) && /\d/.test(t) && px(cs.fontSize) >= 18 && !/tabular-nums/.test(cs.fontVariantNumeric)) add('type/proportional-figures', 'info', el, `"${t}" at ${cs.fontSize} without tabular-nums`);
        }
        /* contrast against the first solid background behind the text */
        let bg = null, opacity = 1, imageBehind = false;
        for (let n = el; n; n = n.parentElement) {
          const ns = getComputedStyle(n);
          opacity *= parseFloat(ns.opacity);
          if (ns.backgroundImage !== 'none' && n !== el) { imageBehind = true; }
          const c = rgba(ns.backgroundColor);
          if (c && c.a > 0) { bg = bg ? over(bg, c) : c; if (bg.a >= 0.99) break; }
        }
        bg = bg && bg.a >= 0.99 ? bg : over(bg || { r: 255, g: 255, b: 255, a: 0 }, { r: 255, g: 255, b: 255, a: 1 });
        const fg = rgba(cs.color);
        if (fg && !imageBehind && clip !== 'text') {
          const f = over({ ...fg, a: fg.a * opacity }, bg);
          const L1 = lum(f), L2 = lum(bg), ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
          const large = px(cs.fontSize) >= 24 || (px(cs.fontSize) >= 18.66 && +cs.fontWeight >= 700);
          if (ratio < (large ? 3 : 4.5)) add('contrast/text', ratio < 3 ? 'error' : 'warn', el, `${ratio.toFixed(2)}:1 for "${t.slice(0, 30)}"`);
        }
      }
    }

    /* page-level rules */
    if (weights.size > 3) add('type/too-many-weights', 'warn', null, `${weights.size} font weights: ${[...weights.keys()].sort().join(', ')}`);
    if (sizes.size > 8) add('type/too-many-sizes', 'warn', null, `${sizes.size} font sizes: ${[...sizes.keys()].sort((a, b) => a - b).join(', ')}px`);
    if (radii.size > 4) add('radius/no-scale', 'warn', null, `${radii.size} corner radii: ${[...radii.keys()].sort((a, b) => a - b).join(', ')}px`);
    if (hues.size > 3) add('surface/too-many-accents', 'warn', null, `${hues.size} saturated hue families on sizable elements`);
    for (const a of document.getAnimations()) {
      const el = a.effect && a.effect.target;
      if (!el || ignored(el) || !shown(el)) continue;
      const it = a.effect.getComputedTiming().iterations;
      const r = el.getBoundingClientRect();
      if (it === Infinity && r.width * r.height > 900) add('motion/infinite', 'warn', el, `${a.animationName || 'animation'} loops forever on a ${Math.round(r.width)}×${Math.round(r.height)} element`);
    }

    const report = { url: location.href, viewport: `${innerWidth}×${innerHeight}`, elements: els.length, counts, rules: totals, issues };
    if (o.log) {
      console.log(`%cunslop audit%c  ${counts.error} errors · ${counts.warn} warnings · ${counts.info} info  (${els.length} visible elements)`, 'font-weight:600', '');
      if (issues.length) console.table(issues);
    }
    return report;
  }
  window.unslopAudit = audit;
  return audit(window.UNSLOP_OPTIONS);
})();
