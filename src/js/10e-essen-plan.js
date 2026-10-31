  // Mahlzeit beim Einplanen: geänderter Eintrag behält seine, sonst die der geöffneten Mahlzeit, die abgelegte, die übliche
  function fplMk(id) { var po = ui.plEdit != null && foodState().pl[ui.plEdit]; return po ? po.mk : ui.fplan && ui.fplan.mk || ui.fdmk || mealFor(id || ''); }
  function foodPush(x, editIdx) {
    var sho = $('fmk') && $('sheet').classList.contains('open');
    // Heute für später: Schalter „Geplant“ im Mengen-Fenster an → als Geplantes für heute
    // Ohne Fenster auf eine spätere Mahlzeit gezogen (ui.fdmk): ebenfalls geplant
    if (!ui.fplan && editIdx == null && !ui.fday && (sho ? fplnOn() : ui.fdmk && mkLater(ui.fdmk))) ui.fplan = { d: dayIdx(Date.now()), mk: sho ? null : ui.fdmk, pg: 1 };
    if (ui.fplan && editIdx == null) {
      // Planen: als geplanter Eintrag (Tag, Mahlzeit) speichern, zurück zur Mahlzeit (aus einer Kachel unter der Tageskarte: Fenster zu, wie in Essen)
      // Geplanten Eintrag ändern (ui.plEdit = Index in food.pl) oder neu einplanen. Mahlzeit aus dem Fenster, sonst fplMk
      var fp = ui.fplan, pe = ui.plEdit, pl = foodState().pl; fUndo(); x.d = fp.d; x.mk = sho && $('fmk').value || fplMk(x.r ? x.r.i : ''); ui.fdmk = null; ui.fday = 0; if (pe != null && pl[pe]) pl[pe] = x; else pl.push(x);
      persist(); ui.fresh = false; render(); toast((pe != null ? 'Geändert · ' : 'Geplant · ') + Math.round(x.k) + ' kcal · ' + MEALS.filter(function (m) { return m[1] === x.mk; })[0][2], 'cal', true); if (fp.pg) closeSheet(true); else openPlanMeal(fp.d, x.mk); return;
    }
    var st = foodState(), today = dayIdx(Date.now()), before = foodSum(today).p, goal = foodGoal(today).p;
    // Uhrzeit aus dem Fenster (falls vorhanden) auf den Tag des Eintrags setzen
    var old = editIdx != null ? st.e[editIdx] : null, base = old ? old.t : Date.now() - (ui.fday || 0) * 864e5, tm = $('ftm') && $('sheet').classList.contains('open') ? $('ftm').value : '';
    if (/^\d\d:\d\d$/.test(tm)) { var q = new Date(base); q.setHours(+tm.slice(0, 2), +tm.slice(3), 0, 0); base = q.getTime(); }
    // In eine andere Mahlzeit gezogen (ui.fdmk): deren übliche Uhrzeit, wenn sie schon vorbei ist (sonst jetzt, nur als diese Mahlzeit markiert)
    if (ui.fdmk && !tm && ui.fdmk !== mealOf(base)[1]) { var mt = MEALS.filter(function (m) { return m[1] === ui.fdmk; })[0][3], qm = new Date(base); qm.setHours(Math.floor(mt), Math.round(mt % 1 * 60), 0, 0); if (qm.getTime() < Date.now()) base = qm.getTime(); }
    // Mahlzeit aus dem Fenster, sonst aus dem Ablegen eines Vorschlags auf eine Mahlzeit (ui.fdmk)
    x.t = base; var mk = $('fmk') && $('sheet').classList.contains('open') ? $('fmk').value : ui.fdmk || ''; ui.fdmk = null; if (mk && mk !== mealOf(base)[1]) x.mk = mk;
    fUndo(); if (old) st.e[editIdx] = x; else st.e.push(x);
    persist(); closeSheet(true); ui.fresh = false; render();
    var after = foodSum(today).p;
    if (editIdx == null && before < goal && after >= goal) { toast('Proteinziel erreicht', 'trophy', true); sparks(90); buzz([40, 30, 40]); }
    else toast((editIdx != null ? 'Geändert · ' : '+') + Math.round(x.k) + ' kcal · ' + fN(x.p) + ' g Protein' + (ui.fday ? ' · ' + (ui.fday === 1 ? 'gestern' : fmtDayL(dayIdx(Date.now()) - ui.fday)) : ''), 'check', true);
    ui.fday = 0;
  }
  function foodRef(id, a, editIdx) {
    var it = fItem(id); if (!it || !(a > 0)) return;
    var v = fNut(it, a), x = { n: fEn(it).slice(0, 30) };
    NK.forEach(function (k) { if (v[k] != null) x[k] = k === 'k' ? Math.round(v.k) : Math.round(v[k] * 10) / 10; });
    x.r = { i: id, g: Math.round(a * 100) / 100 }; foodPush(x, editIdx);
  }
  function openPlanMeal(d, mk, keep) {
    // Mahlzeit planen (aus Planen): oben die Summe der Mahlzeit (kcal, Protein) und das Geplante (Icon im Ton, Menge; antippen = ändern, Kreuz = entfernen),
    // darunter „Als Mahlzeit-Vorlage speichern“ (mit Namen); dann Gerichte dieser Mahlzeit und häufige Lebensmittel (antippen = einplanen), Suchen und Schnell im Plan-Modus
    var m = MEALS.filter(function (x) { return x[1] === mk; })[0], st = foodState(), ps = planSum(d).items.filter(function (o) { return o.x.mk === mk; }), seen = {};
    var tl = st.d.slice().sort(function (a, b) { return (dishMeals(b).indexOf(mk) >= 0) - (dishMeals(a).indexOf(mk) >= 0); }).slice(0, 4).map(function (x) { return { i: x.id, g: 1 }; }).concat(fTiles())
      .filter(function (x) { if (seen[x.i] || !fItem(x.i)) return false; seen[x.i] = 1; return true; }).slice(0, 8);
    if (!keep) { ui.tpnm = false; ui.tpok = ''; }
    ui.fplan = { d: d, mk: mk }; ui.fday = dayIdx(Date.now()) - d; ui.sheet = { plmeal: true }; ui.plEdit = null;
    var kc = Math.round(ps.reduce(function (a, o) { return a + (o.x.k || 0); }, 0)), pc = Math.round(ps.reduce(function (a, o) { return a + (o.x.p || 0); }, 0));
    sheetOpen(shHead(MEALI[mk], m[2] + ' planen', dayHead(d)) +
      (ps.length ? '<div class="fplh m-' + mk + '"><b>' + kc + '<small>kcal</small></b><em style="--nc:var(' + NCOL.p + ')">' + ic(NIC.p) + pc + '<small>g</small></em><small>' + ps.length + (ps.length === 1 ? ' Teil' : ' Teile') + '</small></div>' +
        '<div class="fpl">' + ps.map(function (o) {
          var id = o.x.r && o.x.r.i, it = id && fItem(id), ck = it ? (it.dish ? 'dish' : it.cat || (/^u/.test(id) ? 'u' : 'x')) : 'q';
          // Antippen = Menge ändern (nur mit Quelle), Kreuz = entfernen
          return '<div class="fplr m-' + mk + '"><i class="fsc" style="color:' + (it ? fTone(id, ck) : 'var(--gold)') + '">' + ic(it ? (it.dish ? 'pot' : fIco(id, ck)) : 'bolt') + '</i><span' + (it ? ' data-ple="' + o.i + '" role="button"' : '') + '><b>' + esc(o.x.n || 'Mahlzeit') + '</b><small>' + (it ? fAmt(it, o.x.r.g) : 'Schnell') + '</small></span>' +
            '<em>' + Math.round(o.x.k) + '<i>kcal</i></em><button class="x" data-plx="' + o.i + '" aria-label="Entfernen">' + ic('close') + '</button></div>';
        }).join('') + '</div>' + tplRowHtml('m', ps, kc, m[2]) : '') +
      '<div class="ftl fplt">' + tl.map(function (x) { return fTile({ i: x.i, g: x.g }, 'data-pla="' + x.i + '|' + x.g + '"'); }).join('') + '</div>' +
      '<div class="fact2"><div class="fsrb"><button class="fsrq" data-plsr="1">' + ic('search') + '<span>Suchen …</span></button></div><button class="fdsb" data-plq="1" aria-label="Schnell">' + ic('bolt') + '</button></div>', true);
  }
  function tplRowHtml(k, ps, kc, label) {
    // Vorlage speichern: eine Mahlzeit (k 'm') oder ein Tag (k 'd') aus mehreren Teilen zum Wiederholen – anders als ein Gericht (ein Rezept mit Zutaten und Portionen).
    // Zu: klare Zeile; angetippt: Name (vorgeschlagen) + Speichern; danach Bestätigung
    var pr = ps.filter(function (o) { return o.x.r; }), n = pr.length; if (!n) return '';
    if (ui.tpok) return '<p class="tpsd">' + ic('check') + '<span>In Menüs gespeichert · <b>' + esc(ui.tpok) + '</b></span></p>';
    var def = k === 'd' ? label : label + ' · ' + String(pr[0].x.n || '').split(' ')[0] + (n > 1 ? ' +' + (n - 1) : '');
    if (ui.tpnm) return '<div class="tpsv on"><input id="tpn" class="fnm" type="text" maxlength="24" value="' + esc(def.slice(0, 24)) + '" aria-label="Name des Menüs"><button class="btn primary" data-ptpok="' + k + '">' + ic('check') + 'Speichern</button>' +
      '<small>' + (k === 'd' ? 'Ganzer Tag' : 'Ganze Mahlzeit') + ' mit ' + n + ' Teilen – später mit einem Tipp einplanen. Kein Gericht (das ist ein Rezept mit Zutaten).</small></div>';
    return '<button class="tpsv" data-ptpm="' + k + '"><i>' + ic('cards') + '</i><span><b>Als ' + (k === 'd' ? 'Tages' : 'Mahlzeit') + '-Menü speichern</b><small>' + n + ' Teile · ' + kc + ' kcal · zum Wiederholen</small></span>' + ic('chev') + '</button>';
  }
  // Einkaufsliste aus dem Geplanten (food.pl) ab heute für n Tage: Gerichte in Zutaten zerlegt, gleiche Lebensmittel zusammengezählt,
  // Menge aufgerundet auf Packung/Stück (Portionen der Liste), sonst auf 50 g/ml; nach Kategorie, abgehakt (food.sh) grau unten.
  // Je Zeile: wofür (Tag, Mahlzeit, Gericht, Menge) und Preis als Richtwert (€/kg je Kategorie, einige Lebensmittel eigen)
  var SHP = { g: 2.5, m: 4, e: 10, h: 4, v: 3, o: 3.5, n: 14, s: 9, d: 1.2, f: 8, r: 12, u: 6, x: 6 };
  var SHPI = { hafer: 1.3, reis_r: 2, nud_r: 1.5, vknud: 2, kart: 1.2, mquark: 2.5, skyr: 3.3, joghurt: 2, whey: 25, ei: 4.5, eiklar: 5, haehn: 10, rhack: 9, lachs: 25, thun: 12, garnel: 22,
    tofu: 8, olivoel: 9, rapsoel: 3, butter: 9, parm: 20, banane: 1.5, apfel: 2.5, beeren: 5, mandeln: 14, ernmus: 8, hafmil: 1.2, sojmil: 1.5, cola: 1, colaz: 1, bier: 2, osaft: 1.8 };
  // Kaufgrößen (Richtwerte Discounter): id: Packung, Menge g/ml, Preis €. Gekauft wird in ganzen Packungen; ohne Eintrag: Stück einzeln (Preis über €/kg), sonst auf 100 g
  var SHB = {}; ('hafer Packung 500 0.89|muesli Packung 750 2.49|cornfl Packung 375 1.79|reis_r Packung 1000 1.99|nud_r Packung 500 0.99|vknud Packung 500 1.29|kart Netz 2000 2.49|quinoa Packung 400 2.99|cous Packung 500 1.49|' +
    'vkbrot Brot 500 1.79|mischbr Brot 750 1.99|toast Packung 500 1.29|wrap Packung 370 1.49|reisw Packung 100 0.99|milch15 Tüte 1000 1.09|milch35 Tüte 1000 1.19|milch03 Tüte 1000 1.05|hafmil Packung 1000 1.49|sojmil Packung 1000 1.69|' +
    'skyr Becher 450 1.79|mquark Becher 500 1.29|quark20 Becher 500 1.49|quark40 Becher 500 1.59|joghurt Becher 500 0.99|joghurt35 Becher 500 1.09|joghurt01 Becher 500 0.99|grjog Becher 500 1.99|grjog2 Becher 500 2.19|huette Becher 200 0.99|' +
    'gouda Packung 400 3.29|goudal Packung 250 2.29|mozz Kugel 125 0.79|mozzl Kugel 125 0.85|feta Packung 200 1.49|fetal Packung 200 1.59|parm Stück 150 2.99|butter Stück 250 2.39|halbf Becher 250 1.69|sahne Becher 200 0.89|sahnel Packung 200 0.69|' +
    'frisch Packung 200 1.09|frischl Packung 200 1.15|whey Dose 1000 24.90|ppudd Becher 200 0.99|ei 10er 600 3.29|eiklar Flasche 500 2.99|haehn Packung 600 6.99|pute Packung 400 5.49|rhack Packung 500 5.49|rhack5 Packung 400 4.99|' +
    'steak Stück 250 6.99|schwf Stück 500 6.49|kschin Packung 200 1.99|salami Packung 100 1.49|salamil Packung 100 1.59|lachs Packung 250 4.99|thun Dose 130 1.49|garnel Packung 250 4.49|seela Packung 400 3.99|linsen_r Packung 500 1.79|' +
    'kicher Dose 240 0.89|kidney Dose 250 0.79|tofu Packung 400 2.49|edam Beutel 500 2.49|hummus Becher 200 1.69|brok Stück 500 1.49|papr Stück 150 0.79|gurke Stück 400 0.69|karotte Beutel 1000 1.09|zucch Stück 250 0.69|' +
    'spinat Packung 450 1.29|salat Kopf 300 0.99|zwieb Netz 1000 1.29|champ Schale 400 1.99|mais Dose 285 0.99|erbsen Beutel 750 1.49|avoc Stück 200 0.99|beeren Beutel 300 2.49|erdb Schale 500 2.99|trauben Schale 500 2.49|' +
    'datteln Packung 200 1.99|mandeln Packung 200 2.79|walnuss Packung 200 2.99|erdnuss Packung 200 1.49|ernmus Glas 350 2.99|cashew Packung 200 2.99|leins Packung 500 1.49|chia Packung 200 2.49|olivoel Flasche 750 7.99|rapsoel Flasche 1000 2.29|' +
    'zbschok Tafel 100 1.19|mschok Tafel 100 0.99|priegel Riegel 45 1.49|chips Tüte 175 1.49|gummi Tüte 200 0.99|honig Glas 500 3.99|marm Glas 450 1.79|nusscr Glas 400 2.49|vaneis Packung 500 2.49|osaft Flasche 1000 1.79|' +
    'cola Flasche 1500 1.49|colaz Flasche 1500 1.49|bier Flasche 500 0.89|bieraf Flasche 500 0.89|pizza Stück 350 2.29|lasag Packung 400 2.49').split('|').forEach(function (r) { var q = r.split(' '); SHB[q[0]] = [q[1], +q[2], +q[3]]; });
  // Gekocht kauft man roh: [roh, Faktor]
  var SHRAW = { reis_g: ['reis_r', 0.4], nud_g: ['nud_r', 0.45], linsen_g: ['linsen_r', 0.45] };
  function shopList(n) {
    var st = foodState(), t = dayIdx(Date.now()), m = {}, l = [];
    function put(id, nm, g, src) {
      // Gekochtes als roh; Restaurant und Fast Food kauft man nicht (außer es gibt eine Kaufgröße, z. B. TK-Pizza)
      if (SHRAW[id]) { g *= SHRAW[id][1]; id = SHRAW[id][0]; }
      var it = id && fItem(id), key = it ? id : ('n:' + fnorm(nm)).slice(0, 40); if (!(g > 0) || it && (it.cat === 'f' || it.cat === 'r') && !SHB[id]) return;
      if (!m[key]) { m[key] = { key: key, id: it ? id : '', it: it, n: it ? fEn(it) : nm, g: 0, src: [], c: it && !it.dish ? (CATI[it.cat] ? it.cat : /^u/.test(id) ? 'u' : 'x') : 'x' }; l.push(m[key]); }
      m[key].g += g; m[key].src.push(src);
    }
    st.pl.forEach(function (x) {
      if (x.d < t || x.d >= t + n || !x.r) return;
      var dd = /^d/.test(x.r.i) && fDish(x.r.i);
      if (/^d/.test(x.r.i) && !dd) return;
      if (dd) dd.ing.forEach(function (q) { var g = (+q.a || 0) * x.r.g / Math.max(1, +dd.por || 1); put(q.i, q.n || 'Zutat', g, { d: x.d, mk: x.mk, n: dd.n, g: g }); });
      else put(x.r.i, x.n, x.r.g, { d: x.d, mk: x.mk, g: x.r.g });
    });
    l.forEach(function (o) {
      // Kaufgröße: Packung aus SHB (ganze Packungen, Preis je Packung); sonst Stück einzeln, sonst auf 100 g – Preis dann über €/kg
      var pk = SHB[o.id], u = o.it && o.it.u || [], pc = !pk && u.filter(function (q) { return /^Stück/.test(q[0]); })[0], ml = o.it && o.it.ml ? ' ml' : ' g';
      var sz = function (v) { return v >= 1000 ? fN(v / 1000) + (ml === ' ml' ? ' l' : ' kg') : v + ml; };
      // need = Bedarf, a = Kauf, pe = Preis je Packung/Stück (nur bei mehr als einer)
      var cnt = 1;
      if (pk) { cnt = Math.max(1, Math.ceil(o.g / pk[1] - 0.05)); o.bg = cnt * pk[1]; o.eur = cnt * pk[2]; o.a = pk[0] === 'Stück' ? cnt + ' Stück' : cnt + '× ' + pk[0] + (/^\d+er$/.test(pk[0]) ? '' : ' ' + sz(pk[1])); }
      else if (pc) { cnt = Math.max(1, Math.ceil(o.g / pc[1] - 0.1)); o.bg = cnt * pc[1]; o.a = cnt + ' Stück'; }
      else { o.bg = Math.ceil(o.g / 100) * 100; o.a = sz(o.bg); }
      if (!pk) o.eur = o.bg / 1000 * (SHPI[o.id] || SHP[o.c] || SHP.x);
      o.pe = cnt > 1 ? o.eur / cnt : 0; o.need = sz(Math.round(o.g));
      // Haken, Zuhause, Gelöscht gelten bis zum letzten geplanten Tag, für den sie gesetzt wurden: kommt danach Neues dazu (nächste Woche), ist die Zeile wieder offen
      o.last = Math.max.apply(null, o.src.map(function (q) { return q.d; }));
      var hs = function (k) { return st.sh[k] != null && st.sh[k] >= o.last; };
      o.ok = hs(o.key); o.gone = hs(shKx(o.key)); o.del = hs(shKd(o.key));
    });
    return l.filter(function (o) { return !o.del; });
  }
  function shopN() {
    // Zeitraum: gewählt, sonst bis zum letzten geplanten Tag der nächsten 7 Tage (mindestens heute)
    if (ui.shn) return ui.shn;
    var t = dayIdx(Date.now()), mx = 0; foodState().pl.forEach(function (x) { if (x.d >= t && x.d < t + 7) mx = Math.max(mx, x.d - t + 1); });
    return mx || 7;
  }
  function eur(v) { return v.toFixed(2).replace('.', ',') + ' €'; }
  // Nach rechts gewischt („habe ich noch“): eigener Schlüssel in food.sh; Wert = letzter geplanter Tag der Zeile (wie abgehakt), cleanFood vergisst 14 Tage danach
  function shKx(key) { return ('x:' + key).slice(0, 40); }
  function shopHtml() {
    var n = shopN(), t = dayIdx(Date.now()), l = shopList(n), co = Object.keys(CATI), h = '';
    var all = l.filter(function (o) { return !o.gone; }), open = all.filter(function (o) { return !o.ok; }), done = all.filter(function (o) { return o.ok; }), gone = l.filter(function (o) { return o.gone; });
    // Preis = alles, was gekauft wird (abgehakt bleibt drin, damit die Summe beim Einkaufen nicht sinkt)
    var sum = all.reduce(function (a, o) { return a + o.eur; }, 0), un = function (o) { return o.it && o.it.ml ? ' ml' : ' g'; };
    // Zeile: Haken links (abhaken), Mitte antippen = wofür, nach links wischen = löschen, nach rechts = „habe ich noch“; darunter Bedarf → Kauf, rechts Preis (und je Stück bei mehreren)
    function row(o) {
      var op = ui.shx === o.key, ck = o.it ? (o.it.dish ? 'dish' : o.c) : 'x', dy = {}, ds = [];
      // Aufgeklappt: je Tag eine Zeile (Mahlzeiten als Symbole, Gerichte als Namen, Menge zusammen), zuletzt der Rest der Packung
      o.src.forEach(function (q) { var y = dy[q.d]; if (!y) { y = dy[q.d] = { d: q.d, g: 0, mk: [], n: [] }; ds.push(y); } y.g += q.g; if (y.mk.indexOf(q.mk) < 0) y.mk.push(q.mk); if (q.n && y.n.indexOf(q.n) < 0) y.n.push(q.n); });
      ds.sort(function (a, b) { return a.d - b.d; });
      var rest = Math.round(o.bg - o.g);
      return '<div class="shr' + (o.ok ? ' ok' : '') + (o.gone ? ' gone' : '') + (op ? ' open' : '') + '"' + (o.gone ? '' : ' data-shrow="' + esc(o.key) + '" data-shl="' + o.last + '"') + ' style="--cc:' + (CCOL[o.c] || CCOL.x) + '">' +
        (o.gone ? '<button class="shc" data-shk="' + esc(shKx(o.key)) + '" aria-label="' + esc(o.n) + ' wieder auf die Liste">' + ic('undo') + '</button>'
          : '<button class="shc" data-shk="' + esc(o.key) + '" data-shl="' + o.last + '" aria-pressed="' + o.ok + '" aria-label="' + esc(o.n) + (o.ok ? ' wieder offen' : ' abhaken') + '">' + (o.ok ? ic('check') : '') + '</button>') +
        '<button class="shm" data-shx="' + esc(o.key) + '" aria-expanded="' + op + '"><i class="fsc" style="color:' + (o.id ? fTone(o.id, ck) : 'var(--ink3)') + '">' + ic(o.id ? fIco(o.id, ck) : 'food') + '</i><span><b>' + esc(o.n) + '</b><small>' +
        esc(o.need === o.a ? o.a : o.need + ' → ' + o.a) + '</small></span><em><b>≈ ' + eur(o.eur) + '</b>' + (o.pe ? '<small>à ' + eur(o.pe) + '</small>' : '') + '</em></button>' +
        (op ? '<div class="shw">' + ds.map(function (y) {
          return '<p class="m-' + y.mk[0] + '"><i class="shmk">' + y.mk.map(function (k) { return '<i class="m-' + k + '">' + ic(MEALI[k]) + '</i>'; }).join('') + '</i><span>' + (y.d === t ? 'Heute' : y.d === t + 1 ? 'Morgen' : WDN[wdOf(y.d)].slice(0, 2) + ' ' + fmtShort(y.d)) +
            (y.n.length ? ' · ' + esc(y.n.join(', ')) : '') + '</span><small>' + Math.round(y.g) + un(o) + '</small></p>';
        }).join('') + (rest > 0 ? '<p class="shrs"><i class="shmk"></i><span>Rest</span><small>' + rest + un(o) + '</small></p>' : '') + '</div>' : '') + '</div>';
    }
    co.forEach(function (c) {
      var g = open.filter(function (o) { return o.c === c; }); if (!g.length) return;
      h += '<h3 class="shh" style="--cc:' + (CCOL[c] || CCOL.x) + '">' + ic(CATI[c][0]) + esc(CATI[c][1]) + '<small>' + g.length + '</small></h3>' + g.map(row).join('');
    });
    if (done.length) h += '<h3 class="shh">' + ic('check') + 'Im Wagen<small>' + done.length + '</small></h3>' + done.map(row).join('');
    if (gone.length) h += '<h3 class="shh">' + ic('jar') + 'Zuhause<small>' + gone.length + '</small></h3>' + gone.map(row).join('');
    // Zeitraum: Tage ab heute zum Antippen (bis einschließlich), dazu 2 Wochen; gewählt = alle Tage bis zum Ende
    var days = [1, 2, 3, 4, 5, 6, 7].map(function (k) { return [k, k === 1 ? 'Heute' : WDN[wdOf(t + k - 1)].slice(0, 2)]; }).concat([[14, '2 Wo']]);
    return '<div class="shd" role="group" aria-label="Zeitraum">' + days.map(function (x) { var on = x[0] === 14 ? n === 14 : n < 14 && x[0] <= n; return '<button data-shn="' + x[0] + '" aria-pressed="' + on + '"' + (n === x[0] ? ' class="end"' : '') + '>' + x[1] + '</button>'; }).join('') + '</div>' +
      (l.length ? '<div class="shs"><span><b>' + open.length + '</b><small>offen</small></span><span><b>≈ ' + eur(sum) + '</b><small>Richtwert</small></span><button class="x" data-shsh="1" aria-label="Liste teilen">' + ic('share') + '</button></div>' : '') +
      '<div class="shl" data-noswipe="1">' + (h || '<p class="muted">Nichts geplant. Einen künftigen Tag oben wählen und einplanen.</p>') + '</div>';
  }
  function shopSheet() { return shHead('cart', 'Einkauf', 'Aus dem Geplanten') + '<div class="pshp">' + shopHtml() + '</div>'; }
  // Vorlagen gelten für den gewählten Tag, vergangene Tage planen heute
  function fTplDay() { return Math.max(fSd(), dayIdx(Date.now())); }
  function openTpl() { ui.dtab = 'm'; openDishes(); }
  // ---------- Menüs (food.tp, im Code „Vorlagen“/tpl): [{id, n, k: 'm' (Mahlzeit, mk) | 'd' (Tag), it: [{i, g, mk?}]}]
  function tplKcal(t) { return Math.round(t.it.reduce(function (a, q) { var it = fItem(q.i); return a + (it ? fNut(it, q.g).k || 0 : 0); }, 0)); }
  function tplTiles(sd) {
    // Kacheln: Mahlzeit-Vorlagen in der Farbe ihrer Mahlzeit, Tages-Vorlagen neutral mit Kalender-Symbol; dazu gestrichelt „Tag als Vorlage“ (wenn der Tag geplant ist).
    // Im Löschmodus (Mülleimer-Kachel) löscht Antippen eine Vorlage
    var tp = foodState().tp, del = ui.tpdel, dayHas = planSum(sd).items.some(function (o) { return o.x.r; });
    // Getrennt in „Ganze Tage“ und „Mahlzeiten“; Tages-Kachel zeigt die enthaltenen Mahlzeiten als Symbole, Mahlzeit-Kachel den Namen der Mahlzeit
    function tile(t) {
      var mks = t.k === 'd' ? MEALS.filter(function (m) { return t.it.some(function (q) { return q.mk === m[1]; }); }) : [];
      return '<button class="fti q-m tpl' + (t.k === 'm' ? ' m-' + t.mk : ' tpd') + (del ? ' tdel' : '') + '" data-ptp="' + t.id + '" aria-label="' + (t.k === 'd' ? 'Tages' : 'Mahlzeit') + '-Menü ' + esc(t.n) + (del ? ' löschen' : '') + '"><i class="ftq">' + ic(del ? 'close' : t.k === 'm' ? MEALI[t.mk] : 'cal') + '</i>' +
        '<small class="tpk">' + (t.k === 'd' ? mks.map(function (m) { return ic(MEALI[m[1]]); }).join('') : MEALS.filter(function (m) { return m[1] === t.mk; })[0][2]) + '</small>' +
        '<b class="' + fitCls(t.n, 8) + '">' + esc(t.n) + '</b><span class="ftv"><span>' + tplKcal(t) + '</span><small>' + t.it.length + '×</small></span></button>';
    }
    var td = tp.filter(function (t) { return t.k === 'd'; }), tm = tp.filter(function (t) { return t.k !== 'd'; });
    return (td.length ? '<p class="tplg">' + ic('cal') + 'Ganze Tage</p>' + td.map(tile).join('') : '') + (tm.length ? '<p class="tplg">' + ic('food') + 'Mahlzeiten</p>' + tm.map(tile).join('') : '') + (dayHas && !del ? '<button class="fti tplnew" data-ptpms="1" aria-label="Eine geplante Mahlzeit als Menü speichern">' + ic('plus') + '<small>Mahlzeit<br>speichern</small></button>' +
        '<button class="fti tplnew" data-ptpd="1" aria-label="Diesen Tag als Menü speichern">' + ic('plus') + '<small>Tag<br>speichern</small></button>' : '') +
      (tp.length ? '<button class="fti tplnew" data-ptpx="1" aria-label="' + (del ? 'Fertig' : 'Menüs löschen') + '">' + ic(del ? 'check' : 'trash') + '</button>' : '') +
      (!tp.length && !dayHas ? '<p class="muted tplh">' + ic('cards') + 'Menüs sind ganze Mahlzeiten oder Tage zum Wiederholen (Gerichte sind Rezepte). Plane zuerst eine Mahlzeit, dann „Als Menü speichern“.</p>' : '');
  }
  function tplAdd(t, di, mk) {
    // Vorlage einplanen: Mahlzeit-Vorlage in Mahlzeit mk (sonst ihre eigene), Tages-Vorlage mit den gespeicherten Mahlzeiten
    var pl = foodState().pl; fUndo();
    t.it.forEach(function (q) {
      var it = fItem(q.i); if (!it) return; var v = fNut(it, q.g), x = { d: di, mk: t.k === 'm' ? (mk || t.mk) : q.mk, n: fEn(it).slice(0, 30) };
      NK.forEach(function (k) { if (v[k] != null) x[k] = k === 'k' ? Math.round(v.k) : Math.round(v[k] * 10) / 10; }); x.r = { i: q.i, g: q.g }; pl.push(x);
    });
    persist(); ui.fresh = false; render(); buzz([10, 30, 10]); toast('Menü geplant · ' + tplKcal(t) + ' kcal', 'cal', true);
  }
  function tplSave(k, di, mk, nm) {
    // Geplantes eines Tags (k = 'd') oder einer Mahlzeit (k = 'm') als Vorlage speichern; Name selbst gewählt, sonst aus den ersten Einträgen. Gibt den Namen zurück
    // Grenzen wie in cleanFood (40 Vorlagen, 30 Einträge), sonst ginge Überzähliges beim nächsten Laden still verloren
    var l = planSum(di).items.filter(function (o) { return o.x.r && (k === 'd' || o.x.mk === mk); }).slice(0, 30); if (!l.length) return '';
    if (foodState().tp.length >= 40) { toast('Höchstens 40 Menüs', 'bolt'); return ''; }
    var n = String(nm || '').trim() || (k === 'd' ? 'Tag ' + WDN[wdOf(di)] : l[0].x.n.split(' ')[0] + (l.length > 1 ? ' +' + (l.length - 1) : ''));
    foodState().tp.push({ id: 't' + Date.now().toString(36), n: n.slice(0, 24), k: k, mk: k === 'm' ? mk : undefined, it: l.map(function (o) { var q = { i: o.x.r.i, g: o.x.r.g }; if (k === 'd') q.mk = o.x.mk; return q; }) });
    persist(); buzz([10, 30, 10]); return n.slice(0, 24);
  }
  function openTplDay(di, keep) {
    // Tag als Vorlage: je Mahlzeit kurz, was geplant ist, darunter Name + Speichern (gleich offen)
    var ps = planSum(di).items, kc = Math.round(ps.reduce(function (a, o) { return a + (o.x.k || 0); }, 0));
    if (!keep) { ui.tpnm = true; ui.tpok = ''; } ui.sheet = { tpday: di };
    sheetOpen(shHead('cal', 'Tag als Menü', dayHead(di)) + '<div class="tpdl">' + MEALS.map(function (m) {
      var l = ps.filter(function (o) { return o.x.mk === m[1]; }); if (!l.length) return '';
      return '<div class="m-' + m[1] + '">' + ic(MEALI[m[1]]) + '<span>' + l.map(function (o) { return esc(o.x.n); }).join(', ') + '</span><em>' + Math.round(l.reduce(function (a, o) { return a + o.x.k; }, 0)) + '</em></div>';
    }).join('') + '</div>' + tplRowHtml('d', ps, kc, 'Tag ' + WDN[wdOf(di)]));
  }
  // Gelöscht („brauche ich nicht“): fällt aus der Liste, bis Neues danach geplant wird
  function shKd(key) { return ('d:' + key).slice(0, 40); }
  // Einkaufszeile wischen (ab 25 % der Breite): nach links = löschen (roter Verlauf, mit Rückgängig), nach rechts = „habe ich noch“ → Zuhause; senkrecht bleibt Scrollen
  var shSw = false, shP = null;
  document.addEventListener('pointerdown', function (ev) { var r = ev.target.closest && ev.target.closest('.shr[data-shrow]'); shP = r ? { r: r, x: ev.clientX, y: ev.clientY, dx: 0, on: false, w: r.offsetWidth } : null; });
  document.addEventListener('pointermove', function (ev) {
    if (!shP) return; var dx = ev.clientX - shP.x, dy = ev.clientY - shP.y;
    if (!shP.on) { if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { shP = null; return; } if (Math.abs(dx) < 8) return; shP.on = true; shP.x = ev.clientX; dx = 0; shP.r.classList.add('drag'); }
    var p = shP, arm = Math.abs(dx) > p.w * 0.25; p.dx = dx; p.r.style.transform = 'translateX(' + dx + 'px)';
    p.r.style.setProperty('--sw', Math.min(1, Math.abs(dx) / (p.w * 0.25)).toFixed(3)); p.r.classList.toggle('swl', dx < 0); p.r.classList.toggle('swr', dx > 0);
    if (arm !== !!p.arm) { p.arm = arm; p.r.classList.toggle('arm', arm); if (arm) buzz(6); }
  });
  function shEnd() {
    var p = shP; shP = null; if (!p || !p.on) return;
    shSw = true; setTimeout(function () { shSw = false; }, 350);
    p.r.classList.remove('drag');
    if (!p.arm) { p.r.style.transform = ''; p.r.style.removeProperty('--sw'); p.r.classList.remove('swl', 'swr'); return; }
    var st = foodState(), k = p.r.dataset.shrow; p.r.style.transform = 'translateX(' + (p.dx < 0 ? -1 : 1) * p.w * 1.1 + 'px)';
    if (p.dx < 0) { fUndo(); st.sh[shKd(k)] = +p.r.dataset.shl; } else st.sh[shKx(k)] = +p.r.dataset.shl;
    persist(); buzz([10, 30, 10]); setTimeout(function () { render(); if (p.dx < 0) toast('Gelöscht', 'trash', true); }, 180);
  }
  document.addEventListener('pointerup', shEnd);
  document.addEventListener('pointercancel', function () { if (shP) { shP.arm = false; shEnd(); } });
  function shopShare() {
    // Offene Einträge als Text (Notizen, Nachrichten): nach Kategorie, Menge dahinter; ohne Teilen-Dialog in die Zwischenablage
    var n = shopN(), t = dayIdx(Date.now()), l = shopList(n).filter(function (o) { return !o.ok && !o.gone; }), txt = 'Einkauf bis ' + dayHead(t + n - 1) + '\n';
    Object.keys(CATI).forEach(function (c) { var g = l.filter(function (o) { return o.c === c; }); if (g.length) txt += '\n' + CATI[c][1] + '\n' + g.map(function (o) { return '- ' + o.n + ': ' + o.a; }).join('\n') + '\n'; });
    if (navigator.share) { navigator.share({ title: 'Einkauf', text: txt }).catch(function () {}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { toast('Liste kopiert', 'check'); }, function () { toast('Kopieren ging nicht', 'close'); });
  }
  function planEat(mk) {
    // Heute Geplantes einer Mahlzeit als gegessen eintragen: jetzt, oder zur üblichen Uhrzeit, wenn die Mahlzeit schon vorbei ist
    var st = foodState(), today = dayIdx(Date.now()), l = st.pl.filter(function (x) { return x.d === today && x.mk === mk; }); if (!l.length) return;
    var base = Date.now(), cur = mealOf(base)[1];
    if (mk !== cur) { var mt = MEALS.filter(function (m) { return m[1] === mk; })[0][3], q = new Date(base); q.setHours(Math.floor(mt), Math.round(mt % 1 * 60), 0, 0); if (q.getTime() < base) base = q.getTime(); }
    fUndo();
    l.forEach(function (o, j) { var x = JSON.parse(JSON.stringify(o)); delete x.d; delete x.mk; x.t = base + j; if (mk !== mealOf(x.t)[1]) x.mk = mk; st.e.push(x); });
    st.pl = st.pl.filter(function (x) { return !(x.d === today && x.mk === mk); });
    persist(); ui.fresh = false; render(); toast('Gegessen · ' + Math.round(l.reduce(function (a, o) { return a + o.k; }, 0)) + ' kcal', 'check', true); buzz([10, 30, 10]);
  }
  function fSheetBack() {
    // Kreuz in Essen-Fenstern geht eine Ebene zurück (wie der Zurück-Pfeil), erst auf der obersten Ebene schließt es
    if (!ui.sheet) return false;
    var fb = document.querySelector('#sheet [data-fback]'); if (fb) return foodClick(fb);
    if (ui.sheet.fsearch && ui.fcat && !ui.fq) { ui.fcat = ''; fresSet(); return true; }
    if (ui.sheet.dishEdit) { dishBack(ui.dd && ui.dd.id); return true; }
    if (ui.fplan && !ui.fplan.pg && !ui.sheet.plmeal) { openPlanMeal(ui.fplan.d, ui.fplan.mk); return true; }
    return false;
  }
  function fstpTog(on) {
    // Schritte auf/zu: das Fenster gleitet (shMorph, etwas langsamer), die Schrittliste wächst bzw. schrumpft im selben Takt auf ihre neue Höhe
    var s = $('sheet'), f0 = s.querySelector('.fsts'), fh0 = f0 ? f0.offsetHeight : 0;
    ui.fstpo = on; shMorph.ms = 480; s.classList.toggle('full', on); fpPaint(); if (on) s.scrollTo({ top: 0 });
    var f1 = s.querySelector('.fsts');
    if (f1 && fh0) { var fh1 = f1.offsetHeight; f1.style.maxHeight = fh0 + 'px'; void f1.offsetHeight; f1.style.transition = 'max-height .48s var(--drawer)'; f1.style.maxHeight = fh1 + 'px'; setTimeout(function () { f1.style.maxHeight = ''; f1.style.transition = ''; }, 500); }
    buzz(4);
  }
  var fstpY = null;
  // Wischen auf den Schritten: zu = nach oben öffnet, offen = oben angekommen nach unten schließt
  // Schließen nur, wenn das Fenster schon beim Aufsetzen oben stand (sonst war es ein Hochscrollen im Text)
  var fstpTop = false;
  document.addEventListener('touchstart', function (ev) { var p = ev.target.closest && ev.target.closest('.fsts'); fstpY = p ? ev.touches[0].clientY : null; fstpTop = $('sheet').scrollTop <= 0; }, { passive: true });
  document.addEventListener('touchmove', function (ev) {
    if (fstpY == null) return; var dy = ev.touches[0].clientY - fstpY;
    if (!ui.fstpo && dy < -28) { fstpY = null; fstpTog(true); } else if (ui.fstpo && fstpTop && dy > 40) { fstpY = null; fstpTog(false); }
  }, { passive: true });
  function foodClick(t) {
    var el, st = foodState();
    if ((el = t.closest('[data-ddm]'))) {
      readDraft(); var dm = ui.dd.m || [], on = dm.indexOf(el.dataset.ddm) < 0;
      ui.dd.m = MEALS.map(function (m) { return m[1]; }).filter(function (k) { return k === el.dataset.ddm ? on : dm.indexOf(k) >= 0; }); el.setAttribute('aria-pressed', String(on)); buzz(4); return true;
    }
    if ((el = t.closest('[data-pml]'))) { if (fswMoved) { fswMoved = false; return true; } openPlanMeal(fSd(), el.dataset.pml); return true; }
    if (t.closest('[data-fdx]')) { fdxSet(!ui.fdx); return true; }
    if ((el = t.closest('[data-dtab]'))) { ui.dtab = el.dataset.dtab; ui.tpdel = false; $('sheet').innerHTML = dishesHtml(); buzz(4); return true; }
    if (t.closest('[data-fshop]')) { ui.sheet = { fshop: true }; sheetOpen(shopSheet(), true); return true; }
    // Vorlagen-Fenster: antippen = einplanen (Fenster zu), im Löschmodus löschen; „Tag/Mahlzeit speichern“ aus dem Geplanten des Tags
    if ((el = t.closest('[data-ptp]'))) {
      var tp0 = st.tp, tpi = tp0.map(function (x) { return x.id; }).indexOf(el.dataset.ptp); if (tpi < 0) return true;
      if (ui.tpdel) { tp0.splice(tpi, 1); if (!tp0.length) ui.tpdel = false; persist(); openTpl(); buzz(8); return true; }
      closeSheet(true); tplAdd(tp0[tpi], fTplDay()); return true;
    }
    if (t.closest('[data-ptpd]')) { openTplDay(fTplDay()); return true; }
    if (t.closest('[data-ptpms]')) { var pm0 = planSum(fTplDay()).items.filter(function (o) { return o.x.r; })[0]; if (pm0) { ui.tpnm = true; ui.tpok = ''; openPlanMeal(fTplDay(), pm0.x.mk, true); } return true; }
    if (t.closest('[data-ptpx]')) { ui.tpdel = !ui.tpdel; openTpl(); buzz(4); return true; }
    if ((el = t.closest('[data-pla]'))) { var pa = el.dataset.pla.split('|'); buzz(8); foodRef(pa[0], +pa[1]); return true; }
    if ((el = t.closest('[data-plx]'))) { fUndo(); foodState().pl.splice(+el.dataset.plx, 1); persist(); ui.fresh = false; render(); openPlanMeal(ui.fplan.d, ui.fplan.mk); buzz(6); return true; }
    if ((el = t.closest('[data-shn]'))) { ui.shn = +el.dataset.shn; render(); buzz(4); return true; }
    if ((el = t.closest('[data-shx]'))) { if (shSw) { shSw = false; return true; } ui.shx = ui.shx === el.dataset.shx ? null : el.dataset.shx; render(); buzz(4); return true; }
    if (t.closest('[data-shsh]')) { shopShare(); return true; }
    if ((el = t.closest('[data-shk]'))) { if (shSw) { shSw = false; return true; } var shk = el.dataset.shk; if (el.dataset.shl == null || st.sh[shk] != null && st.sh[shk] >= +el.dataset.shl) delete st.sh[shk]; else st.sh[shk] = +el.dataset.shl; persist(); render(); buzz(6); return true; }
    if (t.closest('[data-fingo]')) { ui.fingo = !ui.fingo; ui.fstpo = false; $('sheet').classList.remove('full'); fpPaint(); buzz(4); return true; }
    // Schritte: Fenster geht ganz auf (.full), die Schritte erscheinen unter den Zutaten
    if (t.closest('[data-fstp]')) { fstpTog(!ui.fstpo); return true; }
    // Nach dem Speichern verschwindet der Knopf (kein zweites, gleiches Speichern)
    // Vorlage speichern: erst Name zeigen, dann speichern; danach bleibt eine Bestätigung im Fenster
    if ((el = t.closest('[data-ptpm]'))) { ui.tpnm = true; if (el.dataset.ptpm === 'd') openTplDay(ui.sheet.tpday, true); else openPlanMeal(ui.fplan.d, ui.fplan.mk, true); buzz(4); return true; }
    if ((el = t.closest('[data-ptpok]'))) {
      var tk = el.dataset.ptpok, tdi = tk === 'd' ? ui.sheet.tpday : ui.fplan.d, tn = tplSave(tk, tdi, tk === 'm' ? ui.fplan.mk : null, $('tpn').value); if (!tn) return true;
      ui.tpnm = false; ui.tpok = tn; ui.fresh = false; render(); if (tk === 'd') openTplDay(tdi, true); else openPlanMeal(tdi, ui.fplan.mk, true); return true;
    }
    if ((el = t.closest('[data-ple]'))) { var po = foodState().pl[+el.dataset.ple]; if (po && po.r && fItem(po.r.i)) { var pfp = ui.fplan; openPick(po.r.i, po.r.g); ui.fplan = pfp; ui.plEdit = +el.dataset.ple; fpPaint(); } return true; }
    if (t.closest('[data-plsr]')) { openFsearch(); return true; }
    if (t.closest('[data-plq]')) { openQuick(null); return true; }
    if ((el = t.closest('[data-fpe]'))) { if (fswMoved) { fswMoved = false; return true; } planEat(el.dataset.fpe); return true; }
    if (t.closest('[data-fquick]')) { openQuick(null, ui.fq.trim(), 's'); return true; }
    if ((el = t.closest('[data-fqx]'))) { var qfr = ui.sheet.from; openPick(el.dataset.fqx); ui.sheet.from = qfr; fpPaint(); return true; }
    if ((el = t.closest('[data-fqu]'))) {
      // Einheit wechseln: Mengen, die noch auf der üblichen Bezugsmenge standen, wandern mit (100 g → 1 Stück)
      var qd = quickRead(), d0 = quDef(qd.u), d1 = quDef(el.dataset.fqu); if (qd.r === d0 || !qd.r) $('f-r').value = d1; if (qd.a === d0 || !qd.a) $('f-e').value = d1;
      qd.u = el.dataset.fqu; document.querySelectorAll('[data-fqu]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === el)); }); $('fqeu').textContent = el.textContent; quickRead(); buzz(4); return true;
    }
    if ((el = t.closest('[data-fqst]'))) { var qs = quickRead(), qst = /^(g|ml)$/.test(qs.u) ? 10 : 0.5; $('f-e').value = Math.max(qst, Math.round((qs.a + qst * +el.dataset.fqst) * 10) / 10); quickRead(); buzz(4); return true; }
    if ((el = t.closest('[data-fqsv]'))) { var qe = st.e[ui.qsv && ui.qsv.i]; $('toast').className = 'toast'; if (qe && qe.t === ui.qsv.t && !qe.r) { ui.sheet = { qsv: true }; sheetOpen(qsvHtml(), true); } return true; }
    if ((el = t.closest('[data-qsc]'))) { ui.qsv.cat = el.dataset.qsc; ui.qsv.sb = ''; $('sheet').innerHTML = qsvHtml(); buzz(4); return true; }
    if ((el = t.closest('[data-qss]'))) { ui.qsv.sb = el.dataset.qss; $('sheet').innerHTML = qsvHtml(); buzz(4); return true; }
    if (t.closest('[data-qsok]')) {
      // Eigenes Lebensmittel aus dem Eintrag: g/ml je 100 umgerechnet, Portion = gegessene Menge; Stück/Portion: Rechengröße 100 = 1 Stück, Werte je Stück
      var sv = ui.qsv, se = st.e[sv.i]; if (!sv.cat) { toast('Kategorie wählen', 'bolt'); return true; } if (!se || se.t !== sv.t || !se.qa) { closeSheet(true); return true; }
      var sgm = /^(g|ml)$/.test(se.qa[1]), sf = sgm ? 100 / se.qa[0] : 1 / se.qa[0], so = { id: 'u' + Date.now().toString(36), n: se.n, cat: sv.cat, u: [[sgm ? 'Portion' : QU.filter(function (u) { return u[0] === se.qa[1]; })[0][1], sgm ? se.qa[0] : 100]] };
      if (sv.sb) so.sb = sv.sb; NK.forEach(function (k) { so[k] = Math.round((se[k] || 0) * sf * 10) / 10; }); if (se.qa[1] === 'ml') so.ml = 1;
      st.o.push(so); se.r = { i: so.id, g: sgm ? se.qa[0] : se.qa[0] * 100 }; delete se.qa; persist(); closeSheet(true); ui.fresh = false; render(); toast('Gemerkt · in der Suche unter ' + CATI[sv.cat][1], 'star'); return true;
    }
    if (t.closest('[data-fdsw]') && fdswMoved) { fdswMoved = false; return true; }
    if ((el = t.closest('[data-fdel]'))) { foodDel(+el.dataset.fdel); return true; }
    if ((el = t.closest('[data-fmk]'))) { fmkSet(el.dataset.fmk); $('fmk').dataset.man = '1'; buzz(4); return true; }
    if ((el = t.closest('[data-fpln]'))) { el.setAttribute('aria-pressed', String(!fplnOn())); fplnShow(); buzz(4); return true; }
    if ((el = t.closest('[data-fml], [data-fstk]')) && fswMoved) { fswMoved = false; return true; }
    // Auf-/Zuklappen (Mahlzeit, Gruppe): ui.fmx lässt die Zeile beim nächsten Zeichnen weich einblenden (.chg)
    if ((el = t.closest('[data-fml]'))) { ui.fmeal = el.dataset.fml ? fSd() + el.dataset.fml : null; ui.fstk = {}; ui.fmx = 1; ui.fresh = false; render(); ui.fmx = 0; buzz(4); return true; }
    if ((el = t.closest('[data-fstk]'))) { var sk = el.dataset.fstk, son = !ui.fstk[sk]; ui.fstk = {}; if (son) ui.fstk[sk] = 1; ui.fmx = 1; ui.fresh = false; render(); ui.fmx = 0; buzz(4);
      // Geöffnete Gruppe an den linken Rand der Zeile holen (die Zeile ist neu gezeichnet und stünde sonst wieder am Anfang)
      var gp = document.querySelector('.fgrp'), gsc = gp && gp.parentNode;
      if (gsc) gsc.scrollTo({ left: gp.getBoundingClientRect().left - gsc.getBoundingClientRect().left - 20, behavior: 'smooth' });
      return true;
    }
    if ((el = t.closest('[data-fedit]'))) { if (fswMoved) { fswMoved = false; return true; } var x = st.e[+el.dataset.fedit]; if (x && x.r && fItem(x.r.i)) openPick(x.r.i, x.r.g, +el.dataset.fedit); else openQuick(+el.dataset.fedit); return true; }
    if ((el = t.closest('[data-ftile]'))) { if (fswMoved) { fswMoved = false; return true; } var tl = (ui.ftiles || [])[+el.dataset.ftile]; if (tl) { ui.fday = fBack(); buzz(8); openPick(tl.i, tl.g); } return true; }
    // Leere Mahlzeit antippen: Suche mit dieser Mahlzeit vorgewählt (spätere = geplant, s. fplnSync)
    if ((el = t.closest('[data-fsearch]'))) { var emk = el.dataset.femk || null; openFsearch(); ui.fdmk = emk; return true; }
    if (t.closest('[data-fdishes]')) { openDishes(); return true; }
    if ((el = t.closest('[data-fpick]'))) { if (ui.fdgno && Date.now() - ui.fdgno < 400) return true; var from =ui.sheet && (ui.sheet.fsearch || ui.sheet.fdishes) ? (ui.sheet.fsearch ? 's' : 'd') : null; openPick(el.dataset.fpick); ui.sheet.from = from; fpPaint(); return true; }
    if (t.closest('[data-fback]')) {
      if (ui.sheet && (ui.sheet.dishImp || (ui.sheet.fsearch && ui.ingm))) ingBack();
      else if (ui.sheet && ui.sheet.from === 'o') openOwn(ui.odraft.id, null, ui.odraft); else if (ui.sheet && ui.sheet.from === 'd') openDishes();
      else { var q0 = ui.fq; openFsearch(true); ui.fq = q0 || ''; $('fq').value = ui.fq; fresSet(); } return true; }
    // Zutat im Gericht antippen: Kurzübersicht ihrer Werte in dieser Menge auf/zu (kein Wechsel ins Mengen-Fenster)
    if ((el = t.closest('[data-fing]'))) { ui.fingx = ui.fingx === +el.dataset.fing ? null : +el.dataset.fing; $('fing').innerHTML = fingHtml(ui.fpick.i, ui.fpick.a); buzz(4); return true; }
    if ((el = t.closest('[data-fvar]'))) { ui.fpick.i = el.dataset.fvar; fpPaint(); return true; }
    if ((el = t.closest('[data-foff]'))) { var ox = ui.fon && ui.fon.r[+el.dataset.foff]; if (ox) pickFrom(offSave(ox)); return true; }
    if ((el = t.closest('[data-fscan]'))) { if (el.dataset.fscan === 'own') { ui.odraft = ownDraft(); ui.odraft.id = ui.sheet.fown; openScan('own'); } else { if (el.dataset.fscan === 'go') openFsearch(); openScan(); } return true; }
    if ((el = t.closest('[data-oml]'))) { ui.sheet.ml = +el.dataset.oml; document.querySelectorAll('[data-oml]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === el)); }); return true; }
    if ((el = t.closest('[data-fsd]'))) { ui.fsd = +el.dataset.fsd; ui.fresh = false; render(); return true; }
    if ((el = t.closest('[data-fwa], [data-fwaz]'))) {
      var rc = el.getBoundingClientRect(), wq = +el.dataset.fwa || 0; waSet(el.dataset.fwaz ? 0 : (st.wa[fSd()] || 0) + wq); buzz(6);
      if (ui.sheet && ui.sheet.wa) $('sheet').innerHTML = waHtml(); if (wq > 50) floaty('+' + wq + ' ml', rc);
      return true;
    }
    if (t.closest('[data-fgoal]')) { openGoals(); return true; }
    if ((el = t.closest('[data-fnut]'))) { openNut(el.dataset.fnut); return true; }
    if ((el = t.closest('[data-fnx]'))) { el.setAttribute('aria-expanded', String(el.getAttribute('aria-expanded') !== 'true')); buzz(4); return true; }
    if (t.closest('[data-fwao]')) { ui.sheet = { wa: true }; sheetOpen(waHtml()); return true; }
    if (t.closest('[data-dgs]')) { readDraft(); ui.ingm = true; openFsearch(); return true; }
    if (t.closest('[data-fownb]')) { var bt0 = fItem(ui.fpick.i), dr0 = { n: fName(bt0), un: bt0.u[0] ? bt0.u[0][0] : '', ug: bt0.u[0] ? bt0.u[0][1] : '', ml: bt0.ml ? 1 : 0 }; NK.forEach(function (k) { dr0[k] = bt0[k] != null ? bt0[k] : ''; }); openOwn('new', null, dr0); return true; }
    if (t.closest('[data-fbr]')) {
      if (ui.fbr && ui.fbr.i === ui.fpick.i) { ui.fbr = null; $('fbr').innerHTML = ''; document.querySelector('[data-fbr]').classList.remove('on'); return true; }
      fbrLoad(); return true;
    }
    if (t.closest('[data-fbrr]')) { fbrLoad(); return true; }
    if (t.closest('[data-fonr]')) { ui.fon = null; fonSearch(); return true; }
    if ((el = t.closest('[data-fbrp]'))) { var bx = ui.fbr && ui.fbr.r[+el.dataset.fbrp]; if (bx) pickFrom(offSave(bx)); return true; }
    if ((el = t.closest('[data-fsub]'))) { var sbl = el.parentNode.scrollLeft; ui.fsub = el.dataset.fsub; fresSet(); var sbb = document.querySelector('.fsbb'); if (sbb) sbb.scrollLeft = sbl; buzz(4); return true; }
    if ((el = t.closest('[data-fcat]'))) { ui.fcat = el.dataset.fcat; ui.fsub = ''; fresSet(); $('sheet').scrollTop = 0; return true; }
    if ((el = t.closest('[data-ftab]'))) { ui.ftab = el.dataset.ftab; ui.fcat = ''; fresSet(); buzz(4); return true; }
    if ((el = t.closest('[data-famt]'))) { ui.fpick.a = +el.dataset.famt; if ($('fa')) $('fa').value = ui.fpick.a; fpickUpd(); return true; }
    if ((el = t.closest('[data-fstep]'))) { var stp = fStep(fItem(ui.fpick.i)); ui.fpick.a = Math.max(stp, Math.round((Math.round(ui.fpick.a / stp) + (+el.dataset.fstep)) * stp * 100) / 100); if ($('fa')) $('fa').value = ui.fpick.a; fpickUpd(); buzz(4); return true; }
    if (t.closest('[data-fpadd]')) { var pk = ui.fpick; if (ui.ingm) ingAdd(pk.i, pk.a); else foodRef(pk.i, pk.a, pk.edit); return true; }
    if ((el = t.closest('[data-fown]'))) { openOwn(el.dataset.fown); return true; }
    if (t.closest('[data-fownsave]')) {
      var ov = function (k) { var f = parseFloat($('o-' + k).value); return isFinite(f) && f >= 0 ? Math.round(f * 10) / 10 : 0; };
      var nm = $('o-n').value.trim(); if (!nm) { toast('Name fehlt', 'bolt'); return true; }
      if (!ov('k')) { toast('kcal je 100 g eintragen', 'bolt'); return true; }
      var oid = ui.sheet.fown !== 'new' ? ui.sheet.fown : 'u' + Date.now().toString(36), o = { id: oid, n: nm.slice(0, 30), u: [] };
      NK.forEach(function (k) { o[k] = ov(k); }); var un = $('o-un').value.trim(), ug = ov('ug'); if (un && ug) o.u.push([un.slice(0, 12), ug]);
      var o0 = fOwn(oid); if (o0) { if (o0.b) o.b = o0.b; if (o0.bc) o.bc = o0.bc; if (o0.cat) o.cat = o0.cat; if (o0.sb) o.sb = o0.sb; o.u = o.u.concat(o0.u.slice(1)); } if (ui.sheet.bc) o.bc = ui.sheet.bc; if (ui.sheet.ml) o.ml = 1; else delete o.ml;
      var bv = $('o-b').value.trim(), bcv = $('o-bc').value.replace(/\D/g, ''); if (bv) o.b = bv.slice(0, 24); else delete o.b; if (/^\d{6,14}$/.test(bcv)) o.bc = bcv; else delete o.bc;
      if (o.bc) st.o.forEach(function (y) { if (y.id !== oid && y.bc === o.bc) delete y.bc; });
      var oi = st.o.map(function (y) { return y.id; }).indexOf(oid); if (oi >= 0) st.o[oi] = o; else st.o.push(o);
      persist(); ui.fresh = false; render(); toast('Gespeichert', 'check'); openPick(oid); return true;
    }
    if (t.closest('[data-fowndel]')) { st.o = st.o.filter(function (y) { return y.id !== ui.sheet.fown; }); persist(); closeSheet(true); ui.fresh = false; render(); toast('Lebensmittel gelöscht', 'close'); return true; }
    if (t.closest('[data-wgt]')) { openWeight(); return true; }
    if (t.closest('[data-set]')) { openSettings(); return true; }
    if (t.closest('[data-wsave]')) {
      var kg = Math.round(parseFloat($('w-v').value) * 10) / 10;
      if (!(kg >= 20 && kg <= 400)) { toast('Gewicht eintragen', 'bolt'); return true; }
      var lw = lastW(), nw = Date.now(); if (lw && daysSince(lw.t) === 0) { lw.kg = kg; lw.t = nw; } else st.w.push({ t: nw, kg: kg });
      persist(); closeSheet(true); ui.fresh = false; render(); toast(fN(kg) + ' kg', 'check'); return true;
    }
    if ((el = t.closest('[data-wdel]'))) { st.w = st.w.filter(function (y) { return y.t !== +el.dataset.wdel; }); persist(); openWeight(); ui.fresh = false; render(); return true; }
    if (t.closest('[data-fcopy]')) {
      // Uhrzeit und Mahlzeit von gestern behalten (Datum um einen Tag weiter, auch über die Zeitumstellung); nie in der Zukunft, die Mahlzeit bleibt über mk
      var ys = foodSum(fSd() - 1).items, now1 = Date.now();
      fUndo(); ys.forEach(function (o, j) { var c = JSON.parse(JSON.stringify(o.x)), q = new Date(o.x.t); c.mk = mealOfE(o.x)[1]; q.setDate(q.getDate() + 1); c.t = Math.min(q.getTime(), now1 - ys.length + j); st.e.push(c); });
      persist(); ui.fresh = false; render(); toast(ys.length + ' Einträge wie gestern', 'check', true); return true;
    }
    if ((el = t.closest('[data-fday]'))) { ui.fday = +el.dataset.fday; el.outerHTML = dayTog(); fplnSync(); if ($('ftot')) fpickUpd(); buzz(4); return true; }
    if ((el = t.closest('[data-gmode]'))) { calcRead(); ui.gmode = el.dataset.gmode; $('sheet').innerHTML = goalsHtml(); calcUpd(); return true; }
    if ((el = t.closest('[data-csx]'))) { ui.cpr.s = el.dataset.csx; document.querySelectorAll('[data-csx]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === el)); }); calcUpd(); return true; }
    if ((el = t.closest('[data-crt]'))) { ui.cpr.rt = +el.dataset.crt; document.querySelectorAll('[data-crt]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === el)); }); calcUpd(); return true; }
    if ((el = t.closest('[data-ctb]'))) { ui.cpr.tb = ui.cpr.tb ? 0 : 1; el.setAttribute('aria-pressed', String(!!ui.cpr.tb)); calcUpd(); return true; }
    if ((el = t.closest('[data-cadj]'))) { ui.cpr.adj = +el.dataset.cadj; calcUpd(); toast((ui.cpr.adj ? 'Angepasst' : 'Entfernt') + ', mit „Übernehmen“ speichern', 'check'); return true; }
    if (t.closest('[data-cuse]')) { goalsSave(); return true; }
    if ((el = t.closest('[data-fde]'))) { openDishEdit(el.dataset.fde); return true; }
    if (t.closest('[data-dga]')) { readDraft(); ui.dd.ing.push({ n: '', a: '', k: '', p: '' }); $('sheet').innerHTML = dishEditHtml(); var ni = $('di-n-' + (ui.dd.ing.length - 1)); if (ni && !('ontouchstart' in window)) ni.focus(); return true; }
    if ((el = t.closest('[data-dgx]'))) { readDraft(); ui.dd.ing.splice(+el.dataset.dgx, 1); if (!ui.dd.ing.length) ui.dd.ing.push({ n: '', a: '', k: '', p: '' }); $('sheet').innerHTML = dishEditHtml(); return true; }
    if (t.closest('[data-dsave]')) { saveDish(); return true; }
    if (t.closest('[data-dsa]')) { readDraft(); (ui.dd.st = ui.dd.st || []).push(''); $('sheet').innerHTML = dishEditHtml(); var ns = $('ds-' + (ui.dd.st.length - 1)); if (ns) { ns.scrollIntoView({ block: 'center' }); if (!('ontouchstart' in window)) ns.focus(); } return true; }
    if ((el = t.closest('[data-dsx]'))) { readDraft(); ui.dd.st.splice(+el.dataset.dsx, 1); $('sheet').innerHTML = dishEditHtml(); return true; }
    if (t.closest('[data-dimp]')) { openDishImp(); return true; }
    if (t.closest('[data-dimpok]')) { dishImp(); return true; }
    if ((el = t.closest('[data-dmf]'))) { ui.dmf = el.dataset.dmf; $('sheet').innerHTML = dishesHtml(); buzz(4); return true; }
    if (t.closest('[data-ddup]')) { readDraft(); ui.dd = JSON.parse(JSON.stringify(ui.dd)); ui.dd.id = null; ui.dd.n = (ui.dd.n + ' (Kopie)').slice(0, 30); ui.ddel = 0; $('sheet').innerHTML = dishEditHtml(); toast('Kopie – anpassen und speichern', 'cards'); return true; }
    if ((el = t.closest('[data-dpor]'))) { readDraft(); ui.dd.por = Math.max(1, ui.dd.por + +el.dataset.dpor); $('dd-por').value = ui.dd.por; $('dd-tot').innerHTML = dishTotHtml(dishTot(ui.dd)); buzz(4); return true; }
    if ((el = t.closest('[data-ddel]'))) {
      if (!ui.ddel) { ui.ddel = 1; el.innerHTML = '<small>Sicher?</small>'; el.setAttribute('aria-label', 'Wirklich löschen?'); return true; }
      st.d = st.d.filter(function (y) { return y.id !== ui.dd.id; }); persist(); ui.fresh = false; render(); toast('Gericht gelöscht', 'close'); openDishes(); return true;
    }
    if (t.closest('[data-fsave]')) {
      var q = quickRead(); if (!q) return true;
      if (!q.ok) { buzz(10); toast(!(q.v.k > 0) ? 'kcal eintragen' : !(q.a > 0) ? 'Gegessene Menge eintragen' : !(q.r > 0) ? 'Bezugsmenge eintragen' : 'Wert prüfen', 'bolt'); return true; }
      var xq = { n: q.n.trim().slice(0, 30), k: Math.round(q.t.k), p: Math.round((q.t.p || 0) * 10) / 10 };
      ['f', 'c', 'fb', 'su'].forEach(function (k) { if (q.t[k] != null) xq[k] = Math.round(q.t[k] * 10) / 10; });
      // qa: gegessene Menge + Einheit (zum Ändern und Merken)
      xq.qa = [Math.round(q.a * 10) / 10, q.u];
      var qi = ui.sheet && ui.sheet.idx != null ? ui.sheet.idx : null, plan0 = !!ui.fplan, td = dayIdx(Date.now()), pg0 = foodSum(td).p < foodGoal(td).p;
      foodPush(xq, qi);
      // Gibt es das noch nicht: dezent anbieten, es zu merken (Knopf in der Rückmeldung, verschwindet von selbst); nicht über „Proteinziel erreicht“
      if (qi == null && !plan0 && xq.n && !libFind(xq.n) && !(pg0 && foodSum(td).p >= foodGoal(td).p)) { ui.qsv = { i: st.e.length - 1, t: xq.t, n: xq.n, cat: '', sb: '' }; toast('+' + xq.k + ' kcal · merken?', 'check', false, ['fqsv', 'star', 'Als Lebensmittel merken']); }
      return true;
    }
    if (t.closest('[data-fgsave]')) {
      var gg = {}; NK.forEach(function (k) { var f = Math.round(parseFloat($('g-' + k).value) || 0); if (f > 0) gg[k] = f; });
      if (!gg.k || !gg.p) { toast('kcal und Protein eintragen', 'bolt'); return true; }
      st.g = gg; persist(); closeSheet(true); ui.fresh = false; render(); toast('Ziele gespeichert', 'check'); return true;
    }
    return false;
  }
