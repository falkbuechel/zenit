  // Online (Open Food Facts, frei, ohne Schlüssel): Suche ab 3 Zeichen kurz nach dem Tippen, Barcode über die Kamera.
  // Gewählte Produkte werden eigene Lebensmittel (mit Marke b und Barcode bc) und sind danach offline da.
  var OFF = 'https://de.openfoodfacts.org/', OFF_F = 'code,product_name,product_name_de,brands,quantity,product_quantity,serving_quantity,nutriments', fonT = null;
  function offMap(p) {
    var nu = p && p.nutriments || {}, k = nu['energy-kcal_100g'];
    if (k == null && nu.energy_100g != null) k = nu.energy_100g / 4.184;
    var n = String(p && (p.product_name_de || p.product_name) || '').trim();
    if (!n || !(+k >= 0) || !p.code) return null;
    function v(key) { var x = nu[key + '_100g']; return x == null || !isFinite(+x) ? null : Math.round(+x * 10) / 10; }
    var u = [], sq = +p.serving_quantity, pq = +p.product_quantity;
    if (sq > 0 && sq <= 2000) u.push(['Portion', Math.round(sq)]);
    if (pq > 0 && pq <= 3000 && Math.round(pq) !== Math.round(sq)) u.push(['Packung', Math.round(pq)]);
    return { bc: String(p.code), n: n.slice(0, 30), b: String(p.brands || '').split(',')[0].trim().slice(0, 24), qt: String(p.quantity || '').slice(0, 16), k: Math.round(+k), p: v('proteins'), f: v('fat'), c: v('carbohydrates'), fb: v('fiber'), su: v('sugars'), u: u, ml: /\d\s*(ml|cl|l)\b/i.test(String(p.quantity || '')) ? 1 : 0 };
  }
  function offSave(x) {
    var st = foodState(), ex = st.o.filter(function (o) { return o.bc === x.bc; })[0]; if (ex) return ex.id;
    var o = { id: 'u' + Date.now().toString(36), n: x.n, b: x.b, bc: x.bc, u: x.u.slice(0, 4) }; if (x.ml) o.ml = 1;
    NK.forEach(function (k) { o[k] = x[k] || 0; }); st.o.push(o); persist(); return o.id;
  }
  function fonHtml() {
    var o = ui.fon, q = ui.fq.trim(), w = '<p class="muted fon">' + ic('globe');
    if (q.length < 3) return '';
    if (!navigator.onLine && !(o && o.q === q && o.st === 'ok')) return w + 'Offline</p>';
    if (!o || o.q !== q || o.st === 'load') return w + 'Suche online …</p>';
    if (o.st === 'err') return w + 'Open Food Facts antwortet nicht<button class="btn small fre" data-fonr="1">' + ic('undo') + 'Nochmal</button></p>';
    if (!o.r.length) return w + 'Auch online nicht gefunden. Barcode scannen (oben) oder unten selbst anlegen.</p>';
    return '<h3 class="xg">' + ic('globe') + 'Online</h3>' + o.r.map(function (x, i) {
      return '<button class="fsi web" data-foff="' + i + '"><span><b>' + esc(x.n) + '</b><small>' + esc([x.b, x.qt].filter(Boolean).join(' · ')) + '</small></span><em>' + x.k + '</em></button>';
    }).join('');
  }
  function fonUpd() { var e = $('fon'); if (e) e.innerHTML = fonHtml(); }
  // Treffer je Suchwort zwischengespeichert (zuletzt 30 Suchen, 7 Tage): Wiederholen kommt sofort, auch offline
  var OFFC = {};
  try { OFFC = JSON.parse(localStorage.getItem('zenit.offc') || '{}') || {}; } catch (err) { OFFC = {}; }
  function offCache(q, r) {
    var k = fnorm(q);
    if (r === undefined) { var c = OFFC[k]; return c && Date.now() - c.t < 7 * 864e5 ? c.r : null; }
    OFFC[k] = { t: Date.now(), r: r };
    var ks = Object.keys(OFFC).sort(function (a, b) { return OFFC[b].t - OFFC[a].t; }); ks.slice(30).forEach(function (x) { delete OFFC[x]; });
    try { localStorage.setItem('zenit.offc', JSON.stringify(OFFC)); } catch (err) { /* voll: nur im Speicher */ }
  }
  function offSearch(q, done) {
    // Die Suche von Open Food Facts antwortet oft langsam oder mit 503 (ohne CORS = „Failed to fetch“): de und world gleichzeitig, je 8 s Zeitlimit, 12 Treffer (kleinere Antwort).
    // de mit Treffern gewinnt sofort, sonst world; beide fehlgeschlagen = null (search.openfoodfacts.org wäre schneller, erlaubt aber kein CORS).
    // Gibt eine Abbruch-Funktion zurück (weitergetippt: alte Anfragen nicht weiterladen)
    var hit = offCache(q); if (hit) { done(hit); return function () {}; }
    var res = {}, n = 0, fin = false, acs = [];
    function end(k, r) {
      res[k] = r; n++; if (fin) return;
      if (k === 'de' && r && r.length) { fin = true; offCache(q, r); done(r); return; }
      if (n === 2) { fin = true; var b = res.de && res.de.length ? res.de : res.w && res.w.length ? res.w : res.de || res.w || null; if (b && b.length) offCache(q, b); done(b); }
    }
    [['de', OFF], ['w', 'https://world.openfoodfacts.org/']].forEach(function (b) {
      var ac = window.AbortController ? new AbortController() : null, tm = setTimeout(function () { if (ac) ac.abort(); }, 8000); if (ac) acs.push(ac);
      fetch(b[1] + 'cgi/search.pl?search_terms=' + encodeURIComponent(q) + '&search_simple=1&json=1&page_size=12&sort_by=unique_scans_n&fields=' + OFF_F, ac ? { signal: ac.signal } : {})
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (d) { clearTimeout(tm); end(b[0], (d.products || []).map(offMap).filter(Boolean)); }, function () { clearTimeout(tm); end(b[0], null); });
    });
    return function () { fin = true; acs.forEach(function (a) { a.abort(); }); };
  }
  var fonAb = null;
  function fonSearch() {
    var q = ui.fq.trim(); if (q.length < 3 || (ui.fon && ui.fon.q === q && ui.fon.st !== 'err')) return;
    if (!navigator.onLine && !offCache(q)) return;
    if (fonAb) fonAb();
    ui.fon = { q: q, st: 'load', r: [] }; fonUpd();
    fonAb = offSearch(q, function (r) {
      if (!ui.fon || ui.fon.q !== q) return;
      if (!r) { ui.fon.st = 'err'; fonUpd(); return; }
      var have = {}; foodState().o.forEach(function (x) { if (x.bc) have[x.bc] = 1; });
      ui.fon.r = r.filter(function (x) { return !have[x.bc]; }).slice(0, 12); ui.fon.st = 'ok'; fonUpd();
    });
  }
  // Barcode: eingebauter BarcodeDetector, sonst (iOS) zxing über jsDelivr, erst beim ersten Scan geladen und danach vom Service Worker gecacht
  var scan = null, BCLIB = 'https://cdn.jsdelivr.net/npm/barcode-detector@3.2.2/dist/iife/ponyfill.js';
  function bcDet() {
    var F = { formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] };
    if (window.BarcodeDetector) return Promise.resolve(new window.BarcodeDetector(F));
    if (window.BarcodeDetectionAPI) return Promise.resolve(new window.BarcodeDetectionAPI.BarcodeDetector(F));
    return new Promise(function (ok, no) { var sc = document.createElement('script'); sc.src = BCLIB; sc.onload = function () { if (window.BarcodeDetectionAPI) ok(new window.BarcodeDetectionAPI.BarcodeDetector(F)); else no(); }; sc.onerror = no; document.head.appendChild(sc); });
  }
  function scanEnd(me) { me.on = false; if (me.s) me.s.getTracks().forEach(function (tr) { tr.stop(); }); if (scan === me) { scan = null; document.body.classList.remove('scan'); } }
  function scanStop() { if (scan) scanEnd(scan); }
  function openScan(mode) {
    scanStop(); ui.sheet = { fscan: true, from: mode === 'own' ? 'o' : 's', mode: mode };
    sheetOpen(shHead('scan', 'Barcode', 'In den Rahmen halten, egal wie herum', true) + '<div class="fscan"><video id="fsv" playsinline muted autoplay></video><i></i></div><p class="muted fon" id="fsm">…</p>', true);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { $('fsm').textContent = 'Keine Kamera'; return; }
    var me = scan = { on: true, s: null }; document.body.classList.add('scan');
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }).then(function (str) {
      me.s = str; if (!me.on || !$('fsv')) { scanEnd(me); return; }
      $('fsv').srcObject = str; $('fsm').textContent = '';
      bcDet().then(function (det) {
        (function tick() {
          var v = $('fsv'); if (!me.on || !v) { scanEnd(me); return; }
          (v.readyState >= 2 ? det.detect(v) : Promise.resolve([])).then(function (c) { if (!me.on) return; if (c && c[0]) { scanEnd(me); scanHit(String(c[0].rawValue)); } else setTimeout(tick, 200); }, function () { setTimeout(tick, 400); });
        })();
      }, function () { var m = $('fsm'); if (m) m.textContent = 'Scanner nicht geladen (offline?)'; });
    }).catch(function () { var m = $('fsm'); if (m) m.textContent = 'Kamera nicht erlaubt'; });
  }
  function pickFrom(id) { openPick(id); ui.sheet.from = 's'; $('sheet').innerHTML = fpickHtml(); }
  function scanHit(code) {
    if (ui.sheet && ui.sheet.mode === 'own') { buzz(20); openOwn(ui.odraft.id, code, ui.odraft); toast('Barcode erkannt', 'check'); return; }
    buzz(20); var ex = foodState().o.filter(function (o) { return o.bc === code; })[0];
    if (ex) { pickFrom(ex.id); return; }
    if (!navigator.onLine) { openOwn('new', code); toast('Offline · einmal selbst eintragen', 'bolt'); return; }
    $('fsm').textContent = code + ' …';
    fetch(OFF + 'api/v2/product/' + code + '?fields=' + OFF_F).then(function (r) { return r.json(); }).then(function (d) {
      if (!ui.sheet || !ui.sheet.fscan) return;
      var x = d && d.status === 1 ? offMap(Object.assign({ code: code }, d.product)) : null;
      if (x) pickFrom(offSave(x)); else { openOwn('new', code); toast('Unbekannt · einmal eintragen, dann kennt Zenit es', 'bolt'); }
    }).catch(function () { if (ui.sheet && ui.sheet.fscan) { openOwn('new', code); toast('Nicht erreichbar · selbst eintragen', 'bolt'); } });
  }
  function fvarHtml(it, id) {
    if (!it.vg) return '';
    return '<div class="seg fvs" style="grid-template-columns: repeat(' + it.vg.length + ', 1fr)">' + it.vg.map(function (v) { return '<button data-fvar="' + v[0] + '" aria-pressed="' + (v[0] === id) + '">' + v[1] + '</button>'; }).join('') + '</div>';
  }
  function openPick(id, a, edit) {
    var it = fItem(id); if (!it) return;
    ui.sheet = { fpick: true }; ui.fpick = { i: id, a: a != null ? a : it.dish ? 1 : it.d || (it.u.length ? it.u[it.ub && it.u[1] ? 1 : 0][1] : 100), edit: edit };
    sheetOpen(fpickHtml(), true); $('sheet').classList.add('fp');
  }
  function fpickHtml() {
    var pk = ui.fpick, it = fItem(pk.i), back = !!(ui.sheet && ui.sheet.from), un = it.ml ? 'ml' : 'g', b0 = it.u[0];
    // Schnellmengen passend zur Einheit, aufsteigend, mindestens 15 % auseinander: Stück/Portionen als 1×–3× (ein Ei wiegt keiner), Getränke in Glas-/Flaschengrößen,
    // sonst runde Mengen um die übliche; Gericht halbe Portionen, Fast Food Verkaufsportionen. Letzte Pille = zuletzt eingetragene Menge (Uhr), sonst eine fünfte Stufe
    var d0 = it.d || (b0 ? b0[1] : 100), r5 = function (x) { return Math.max(5, Math.round(x / 5) * 5); }, ch, last = null;
    foodState().e.forEach(function (x) { if (x.r && x.r.i === pk.i && (!last || x.t > last.t)) last = { t: x.t, g: x.r.g }; });
    if (it.dish) ch = [[0.5], [0.75], [1], [1.5], [2]];
    else if (it.pc) ch = (it.u.length > 1 ? it.u.slice(it.ub ? 1 : 0).map(function (u) { return [u[1]]; }) : []).concat([1, 2, 3, 4].map(function (n) { return [b0[1] * n]; }));
    else if (it.u.length) ch = it.u.map(function (u) { return [u[1]]; }).concat([[b0[1] * 2], [b0[1] * 3]], it.u[1] ? [[it.u[1][1] * 2]] : [], [[b0[1] * 4]]);
    else if (it.ml) ch = [[200, 1], [250, 1], [330, 1], [500, 1], [750, 1]];
    else ch = [[r5(d0 / 2), 1], [d0, 1], [r5(d0 * 1.5), 1], [d0 * 2, 1], [d0 * 3, 1]];
    for (var cn = 5; ch.length < 12 && !it.dish; cn++) ch.push([(b0 && !it.ml ? b0[1] : d0) * cn, !b0 || it.ml ? 1 : 0]);
    ch = ch.filter(function (x, i, a) { return !a.slice(0, i).some(function (y) { return Math.abs(y[0] - x[0]) < Math.max(y[0], x[0]) * 0.15; }); });
    if (last && !ch.slice(0, 4).some(function (y) { return y[0] === last.g; })) ch = ch.slice(0, 4).sort(function (a, b) { return a[0] - b[0]; }).concat([[last.g, 0, 1]]);
    else ch = ch.slice(0, 5).sort(function (a, b) { return a[0] - b[0]; });
    var sub = it.dish ? 'Gericht · je Portion' : (it.b ? it.b + ' · ' : '') + (it.pc ? b0[0] + ' = ' + Math.round(it.k * b0[1] / 100) + ' kcal' : '100 ' + un + ' = ' + Math.round(it.k) + ' kcal');
    var amt = it.pc ? '<label class="fpcn"><b id="fpcn">' + fAmt(it, pk.a) + '</b></label>' :
      '<label><input id="fa" type="number" inputmode="decimal" min="0" step="' + (it.dish ? 0.25 : 5) + '" value="' + pk.a + '" aria-label="Menge"><span>' + (it.dish ? 'Port.' : un) + '</span></label>';
    // Kopf: Marke wählen (eingebaute Lebensmittel) und Barcode direkt neben dem Schließen
    // Gericht: statt Barcode (hat keinen) der Zutaten-Knopf; an = Zutaten für die gewählte Portion statt der Nährwert-Kacheln
    var hasIng = it.dish && fDish(pk.i) && fDish(pk.i).ing.length, ingOn = hasIng && ui.fingo;
    var hd = shHead('food', fName(it), sub, back), hb = (FOODB[pk.i] && !it.pc && it.cat !== 'r' ? '<button class="x' + (ui.fbr && ui.fbr.i === pk.i ? ' on' : '') + '" data-fbr="1" aria-label="Marke wählen">' + ic('tag') + '</button>' : '') +
      (it.dish ? (hasIng ? '<button class="x' + (ingOn ? ' on' : '') + '" data-fingo="1" aria-pressed="' + !!ingOn + '" aria-label="Zutaten">' + ic('ing') + '</button>' : '') : '<button class="x" data-fscan="1" aria-label="Barcode scannen">' + ic('scan') + '</button>');
    hd = hd.replace('<button class="x" data-sheet-close', hb + '<button class="x" data-sheet-close');
    // Kompakt, ohne Scrollen: Menge (± und wischbar), 4 Schnellmengen, Nährwert-Icons mit Tagesbalken, Tag/Mahlzeit/Uhrzeit in einer Zeile, Eintragen mit „danach frei“
    // Gericht bearbeiten nur aus dem Gerichte-Menü (nicht beim Ändern eines Eintrags): Stift in der Zeile von Eintragen
    var ex = /^u/.test(pk.i) ? '<button class="btn ghost small" data-fown="' + pk.i + '">' + ic('edit') + 'Lebensmittel bearbeiten</button>' : '';
    var dEd = /^d/.test(pk.i) && !ui.ingm && pk.edit == null && ui.sheet && ui.sheet.from === 'd';
    return hd + '<div id="fbr">' + fbrHtml() + '</div>' + fvarHtml(it, pk.i) +
      '<div class="fstep"><button class="sb" data-fstep="-1" aria-label="Weniger">' + ic('minus') + '</button>' + amt + '<button class="sb" data-fstep="1" aria-label="Mehr">' + ic('plus') + '</button></div>' +
      // Gericht: keine Schnellmengen (Portion über ± bzw. Wischen in Vierteln), dafür die Zutaten als aufklappbare Zeile (zu: Vorschau der Namen, auf: Liste mit Mengen)
      (it.dish ? '' : '<div class="fpc">' + ch.map(function (c) { return '<button data-famt="' + c[0] + '" aria-pressed="' + (c[0] === pk.a) + '"' + (c[2] ? ' aria-label="Zuletzt: ' + fAmt(it, c[0]) + '">' + ic('clock') : '>') + fAmt(it, c[0], c[1]) + '</button>'; }).join('') + '</div>') +
      // Zutaten an: nur die Kochliste (ganze Breite), kein Tag/Mahlzeit/Uhrzeit und kein Eintragen; Gericht bearbeiten bleibt als Stift darunter
      (ingOn ? '<div class="fing" id="fing">' + fingHtml(pk.i, pk.a) + '</div>' + (dEd ? '<div class="fsb fpx"><button class="btn ghost small" data-fde="' + pk.i + '">' + ic('edit') + 'Gericht bearbeiten</button></div>' : '') :
      '<div class="ftot" id="ftot">' + ftotHtml(fNut(it, pk.a)) + '</div>' + (ui.ingm || ui.fplan ? '' : whenFor(pk.edit)) +
      // Eintragen und (beim Ändern) Löschen teilen sich die Zeile: Löschen klein, rot, nur Mülleimer
      '<div class="fpgo"><button class="btn primary big" data-fpadd="1">' + ic('check') + '<span>' + (ui.ingm ? 'Hinzufügen' : ui.fplan ? (ui.plEdit != null ? 'Ändern' : 'Einplanen') : pk.edit != null ? 'Ändern' : 'Eintragen') + (ui.ingm ? '' : '<small id="ffit">' + ffitHtml() + '</small>') + '</span></button>' +
      (pk.edit != null ? '<button class="btn big fpdel" data-fdel="' + pk.edit + '" aria-label="Eintrag löschen">' + ic('trash') + '</button>' : '') +
      (dEd ? '<button class="btn big fped" data-fde="' + pk.i + '" aria-label="Gericht bearbeiten">' + ic('edit') + '</button>' : '') + '</div>') +
      (ex ? '<div class="fsb fpx">' + ex + '</div>' : '');
  }
  function fDaySum() {
    // Tagessumme des Ziel-Tags ohne den Eintrag, der gerade geändert wird, dazu das Tagesziel
    var pk = ui.fpick, di = dayIdx(Date.now()) - (ui.fday || 0), s = foodSum(di), ox = pk && pk.edit != null ? foodState().e[pk.edit] : null;
    if (ox) NK.forEach(function (k) { s[k] -= ox[k] || 0; });
    // Beim Planen zählt das schon Geplante mit
    if (ui.fplan) { var q = planSum(di), po = ui.plEdit != null ? foodState().pl[ui.plEdit] : null; NK.forEach(function (k) { s[k] += (q[k] || 0) - (po && po[k] || 0); }); }
    return { s: s, g: foodGoal(di) };
  }
  function ffitHtml() {
    // Passt das noch? kcal danach frei bzw. drüber (Grenzen der übrigen Werte zeigen die Kacheln rot)
    var pk = ui.fpick, v = fNut(fItem(pk.i), pk.a), d = fDaySum(), rest = Math.round(d.g.k - d.s.k - (v.k || 0));
    return rest >= 0 ? rest + ' kcal danach frei' : -rest + ' kcal über dem Ziel';
  }
  function fbrLoad() {
    var bi = ui.fpick.i, bit = fItem(bi), bw = fnorm(fName(bit)).split(' ')[0]; ui.fbr = { i: bi, st: 'load', r: [] }; $('fbr').innerHTML = fbrHtml(); document.querySelector('[data-fbr]').classList.add('on');
    offSearch(fEn(bit), function (r) { if (!ui.fbr || ui.fbr.i !== bi) return; ui.fbr.st = r ? 'ok' : 'err'; ui.fbr.r = r ? r.filter(function (x) { return fnorm(x.n).indexOf(bw) >= 0; }).slice(0, 10) : []; var e = $('fbr'); if (e) e.innerHTML = fbrHtml(); });
  }
  function fbrHtml() {
    // Marke wählen: Open-Food-Facts-Produkte zum Grundnamen (nur eingebaute Lebensmittel, nicht Restaurant/Fast Food)
    var b = ui.fbr, pk = ui.fpick, it = pk && FOODB[pk.i];
    if (!it || it.pc || it.cat === 'r') return '';
    if (!b || b.i !== pk.i) return '';
    var foot = '<button class="btn fanl" data-fownb="1">' + ic('plus') + 'Fehlt? Selbst anlegen</button>';
    if (b.st === 'load') return '<p class="muted fon">' + ic('globe') + 'Suche Marken …</p>';
    if (!b.r.length) return '<p class="muted fon">' + ic('globe') + (b.st === 'err' ? 'Open Food Facts antwortet nicht<button class="btn small fre" data-fbrr="1">' + ic('undo') + 'Nochmal</button>' : 'Keine Marke gefunden. Barcode scannen oder selbst anlegen.') + '</p>' + foot;
    return '<h3 class="xg">' + ic('globe') + 'Marken</h3>' + b.r.map(function (x, i) { return '<button class="fsi web" data-fbrp="' + i + '"><span><b>' + esc(x.n) + '</b><small>' + esc([x.b, x.qt].filter(Boolean).join(' · ')) + '</small></span><em>' + x.k + '</em></button>'; }).join('') + foot;
  }
  function ftotHtml(v) {
    // Nährwert-Kacheln in den Nährwertfarben: Wert dieser Menge; Balken + Prozent = Anteil dieser Menge am Tagesziel, rot wenn der Tag damit über die Grenze geht.
    // Beim Gericht-Zutat ohne Balken
    var d = ui.ingm ? null : fDaySum();
    return NK.map(function (k) {
      var bar = '';
      if (d) { var gk = d.g[k] || 1, a = (v[k] || 0) / gk; bar = '<em' + ((d.s[k] || 0) + (v[k] || 0) > gk * FLIM[k] ? ' class="over"' : '') + '><i><i style="width:' + Math.min(100, a * 100).toFixed(1) + '%"></i></i>' + Math.round(a * 100) + '%</em>'; }
      return '<div style="--nc:var(' + NCOL[k] + ')" aria-label="' + (k === 'k' ? 'kcal' : NSH[k]) + '"><span>' + ic(NIC[k]) + '<b>' + fNv(k, v[k]) + '</b></span>' + bar + '</div>';
    }).join('');
  }
  function fpickUpd() {
    var pk = ui.fpick, it = fItem(pk.i); if (!it) return;
    if ($('ftot')) $('ftot').innerHTML = ftotHtml(fNut(it, pk.a)); if ($('ffit')) $('ffit').textContent = ffitHtml();
    var pc = $('fpcn'); if (pc) pc.textContent = fAmt(it, pk.a);
    document.querySelectorAll('[data-famt]').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.famt === pk.a)); });
    if ($('fing')) $('fing').innerHTML = fingHtml(pk.i, pk.a);
  }
  function fingHtml(id, por) {
    // Zutaten eines Gerichts für die gewählte Portionenzahl (zum Kochen): Name links, Menge rechts (gerundet auf 5 g)
    var dd = fDish(id); if (!dd || !dd.ing.length) return '';
    var f = por / Math.max(1, +dd.por || 1);
    return dd.ing.filter(function (q) { return +q.a > 0; }).map(function (q) {
      var g = (+q.a || 0) * f; return '<span>' + esc(q.n || 'Zutat') + '<em>' + (g < 20 ? Math.round(g) : Math.round(g / 5) * 5) + ' g</em></span>';
    }).join('');
  }
  function nTile(id, k, v, big, u) {
    // Nährwert-Eingabe als Kachel wie im Mengen-Fenster (Farbkante oben, Icon + Einheit, Zahl groß); in .ntg: big = halbe Breite, sonst Viertel
    return '<label class="ntl' + (big ? ' big' : '') + '" style="--nc:var(' + NCOL[k] + ')"><i>' + ic(NIC[k]) + '<small>' + (u || (k === 'k' ? 'kcal' : 'g')) + '</small></i>' +
      '<input id="' + id + '" type="number" inputmode="decimal" min="0" value="' + (v == null ? '' : v) + '" placeholder="0" aria-label="' + (k === 'k' ? 'Kalorien' : NSH[k]) + '"></label>';
  }
  function quickHtml(idx) {
    // Schnell eintragen ohne Lebensmittel (z. B. Restaurant): kcal und Nährwerte, Name, Tag/Mahlzeit/Uhrzeit; auch als Reiter in der Suche
    var x = idx != null ? foodState().e[idx] : null;
    return '<div class="ntg">' + NK.map(function (k) { return nTile('f-' + k, k, x ? x[k] : null, k === 'k' || k === 'p'); }).join('') + '</div>' +
      '<div class="fqn"><input id="f-n" class="fnm" type="text" maxlength="30" placeholder="Name (optional)" value="' + (x ? esc(x.n) : '') + '" aria-label="Name">' +
      (x ? '' : '<button class="x" data-fqm="1" aria-pressed="' + !!ui.fqm + '" aria-label="Als eigenes Lebensmittel merken">' + ic('star') + '</button>') + '</div>' + (ui.fplan ? '' : whenFor(idx)) +
      '<div class="fpgo"><button class="btn primary big" data-fsave="1">' + ic('check') + (x ? 'Ändern' : ui.fplan ? 'Einplanen' : 'Eintragen') + '</button>' + (x ? '<button class="btn big fpdel" data-fdel="' + idx + '" aria-label="Eintrag löschen">' + ic('trash') + '</button>' : '') + '</div>' +
      (x ? '' : '<div class="fsb fpx"><button class="btn ghost small" data-fown="new">' + ic('plus') + 'Lebensmittel je 100 g anlegen</button></div>');
  }
  function openQuick(idx) {
    ui.sheet = { food: true, idx: idx }; if (!ui.fplan) ui.fday = dayIdx(Date.now()) - fSd(); ui.fqm = false;
    sheetOpen(shHead('bolt', idx != null ? 'Eintrag ändern' : ui.fplan ? 'Schnell einplanen' : 'Schnell eintragen', 'Ohne Lebensmittel, z. B. Restaurant') + quickHtml(idx), true);
  }
  function openOwn(id, bc, dr) {
    // dr: Entwurf aus dem Formular (zurück vom Barcode-Scan)
    var o = id && id !== 'new' ? fOwn(id) : null, src = dr || o || {}, code = bc || (dr && dr.bc) || (o && o.bc) || '';
    ui.sheet = { fown: o ? o.id : 'new', bc: code, ml: src.ml ? 1 : 0 };
    var un = dr ? dr.un : o && o.u[0] ? o.u[0][0] : '', ug = dr ? dr.ug : o && o.u[0] ? o.u[0][1] : '';
    sheetOpen(shHead('plus', o ? 'Lebensmittel' : 'Eigenes Lebensmittel', 'Werte je 100 g bzw. 100 ml, z. B. von der Packung') +
      '<input id="o-n" class="fnm" type="text" maxlength="30" placeholder="Name, z. B. Proteinbrot" value="' + esc(src.n || '') + '" aria-label="Name">' +
      '<div class="own2"><input id="o-b" class="fnm" type="text" maxlength="24" placeholder="Marke (optional)" value="' + esc(src.b || '') + '" aria-label="Marke">' +
      '<div class="fqw"><input id="o-bc" class="fnm" type="text" inputmode="numeric" maxlength="14" placeholder="Barcode (optional)" value="' + esc(code) + '" aria-label="Barcode"><button class="x" data-fscan="own" aria-label="Barcode scannen">' + ic('scan') + '</button></div></div>' +
      '<div class="seg fvs"><button data-oml="0" aria-pressed="' + !ui.sheet.ml + '">g</button><button data-oml="1" aria-pressed="' + !!ui.sheet.ml + '">ml</button></div>' +
      '<div class="ntg">' + NK.map(function (k) { return nTile('o-' + k, k, src[k], k === 'k' || k === 'p'); }).join('') + '</div>' +
      // Portion: Name und Gramm in einer Zeile, ohne Überschriften
      '<div class="fqn"><input id="o-un" class="fnm" type="text" maxlength="12" placeholder="Portion, z. B. Scheibe" value="' + esc(String(un)) + '" aria-label="Portion">' +
      '<label class="ogm"><input id="o-ug" class="fnm" type="number" inputmode="decimal" min="0" placeholder="Menge" value="' + ug + '" aria-label="Menge der Portion"><span>g</span></label></div>' +
      '<button class="btn primary big" data-fownsave="1">' + ic('check') + 'Speichern</button>' + (o ? '<button class="btn ghost small" data-fowndel="1">' + ic('trash') + 'Löschen</button>' : ''), true);
  }
  function ownDraft() { var d = { n: $('o-n').value, b: $('o-b').value, un: $('o-un').value, ug: $('o-ug').value, ml: ui.sheet.ml, bc: $('o-bc').value }; NK.forEach(function (k) { d[k] = $('o-' + k).value; }); return d; }
  function openDishes() {
    ui.sheet = { fdishes: true }; if (!ui.fplan) ui.fday = dayIdx(Date.now()) - fSd(); sheetOpen(dishesHtml(), true);
  }
  function dishesHtml() {
    // Gerichte-Menü: Filter nach Mahlzeit (fest gewählt oder meist gegessen, dishMeals); Karten (antippen = Menge wählen und bearbeiten, nach rechts wischen = 1 Portion sofort,
    // halten und ziehen = auf eine Mahlzeit), zuletzt gegessene zuerst; als letzte Kachel gestrichelt „Neues Gericht“
    var st = foodState(), lt = {}, f = ui.dmf || '';
    st.e.forEach(function (x) { if (x.r && /^d/.test(x.r.i)) lt[x.r.i] = Math.max(lt[x.r.i] || 0, x.t); });
    var l = st.d.filter(function (x) { return !f || dishMeals(x).indexOf(f) >= 0; }).sort(function (a, b) { return (lt[b.id] || 0) - (lt[a.id] || 0); });
    return shHead('pot', 'Gerichte', st.d.length + (st.d.length === 1 ? ' Gericht' : ' Gerichte') + ' · je Portion') +
      (st.d.length ? '<div class="seg fdm">' + [['', 'Alle']].concat(MEALS.map(function (m) { return [m[1], m[2]]; })).map(function (m) {
        return '<button data-dmf="' + m[0] + '" aria-pressed="' + (f === m[0]) + '" aria-label="' + m[1] + '">' + (m[0] ? ic(MEALI[m[0]]) : 'Alle') + '</button>'; }).join('') + '</div>' : '') +
      '<div class="fdg" data-noswipe="1">' + l.map(fDishCard).join('') + '<button class="fdnew" data-fde="new" aria-label="Neues Gericht">' + ic('plus') + '<small>Neu</small></button></div>';
  }
  // Gericht bearbeiten: Zutaten aus der Datenbank füllen alle Nährwerte, sonst kcal und Protein von Hand
  function libFind(name) {
    var q = fnorm(name.trim()); if (!q) return null;
    var all = foodState().o.concat(FOODS); for (var i = 0; i < all.length; i++) if (fnorm(all[i].n) === q) return all[i];
    return null;
  }
  // Zutat fürs Gericht: Suche, Marke und Barcode im Zutat-Modus (ui.ingm); „Hinzufügen“ trägt Menge und Werte je 100 g ein
  function ingBack() { ui.ingm = false; ui.sheet = { dishEdit: true }; sheetOpen(dishEditHtml(), true); }
  function ingAdd(id, a) {
    var it = fItem(id), dd = ui.dd; if (!it || !dd) return;
    var r = { n: fEn(it).slice(0, 30), a: Math.round(a * 10) / 10, k: it.k, p: it.p, i: id }; ['f', 'c', 'fb', 'su'].forEach(function (k) { if (it[k] != null) r[k] = it[k]; });
    var last = dd.ing[dd.ing.length - 1]; if (last && !last.n && last.a === '') dd.ing.pop();
    dd.ing.push(r); ingBack();
  }
  function dishEditHtml() {
    // Gericht anlegen: Name, darunter je Portion live (Nährwert-Icons) mit Portionen ±; Zutaten kompakt (Name, Gramm, entfernen) – aus der Datenbank mit Nährwerten je 100 g,
    // von Hand mit kcal und Protein je 100 g; Zutat suchen (Suche hat Barcode) oder von Hand; Speichern und Löschen teilen sich die Zeile
    var dd = ui.dd, t = dishTot(dd);
    return shHead('pot', dd.id ? 'Gericht' : 'Neues Gericht', 'Zutaten eintragen, durch Portionen teilen') +
      '<input id="dd-n" class="fnm" type="text" maxlength="30" placeholder="Name, z. B. Chili" value="' + esc(dd.n) + '" aria-label="Name">' +
      // Mahlzeiten: keine gewählt = automatisch (wann es meist gegessen wird), sonst eine oder mehrere
      '<div class="seg fdm ddm">' + MEALS.map(function (m) { return '<button data-ddm="' + m[1] + '" aria-pressed="' + ((dd.m || []).indexOf(m[1]) >= 0) + '" aria-label="' + m[2] + '">' + ic(MEALI[m[1]]) + '</button>'; }).join('') + '</div>' +
      '<datalist id="ing-lib">' + foodState().o.concat(FOODS).map(function (x) { return '<option value="' + esc(x.n) + '">'; }).join('') + '</datalist>' +
      '<div class="dgt"><div id="dd-tot">' + dishTotHtml(t) + '</div><div class="dgpor"><button class="sb" data-dpor="-1" aria-label="Eine Portion weniger">' + ic('minus') + '</button>' +
      '<label><input id="dd-por" type="number" inputmode="decimal" min="1" step="1" value="' + dd.por + '" aria-label="Portionen"><span>Port.</span></label><button class="sb" data-dpor="1" aria-label="Eine Portion mehr">' + ic('plus') + '</button></div></div>' +
      dd.ing.map(function (q, i) {
        return '<div class="dg"><div class="dg-h"><input id="di-n-' + i + '" type="text" list="ing-lib" maxlength="30" placeholder="Zutat" value="' + esc(q.n) + '" aria-label="Zutat">' +
          '<label class="dgam"><input id="di-a-' + i + '" type="number" inputmode="decimal" min="0" value="' + (q.a === '' ? '' : q.a) + '" placeholder="0" aria-label="Menge in g"><span>g</span></label>' +
          '<button class="xs2" data-dgx="' + i + '" aria-label="Zutat entfernen">' + ic('close') + '</button></div>' +
          (q.i ? '<small class="dgl">' + ['k', 'p', 'f', 'c'].map(function (k) { return '<span style="--nc:var(' + NCOL[k] + ')">' + ic(NIC[k]) + fNv(k, q[k]) + '</span>'; }).join('') + 'je 100 g</small>' :
            '<div class="ntg two">' + nTile('di-k-' + i, 'k', q.k, false, 'kcal / 100 g') + nTile('di-p-' + i, 'p', q.p, false, 'g / 100 g') + '</div>') + '</div>';
      }).join('') +
      '<div class="fsb dga"><button class="btn small" data-dgs="1">' + ic('search') + 'Zutat suchen</button><button class="btn small" data-dga="1">' + ic('plus') + 'Von Hand</button></div>' +
      '<div class="fpgo"><button class="btn primary big" data-dsave="1">' + ic('check') + 'Speichern</button>' + (dd.id ? '<button class="btn big fpdup" data-ddup="1" aria-label="Als Kopie anlegen">' + ic('cards') + '</button><button class="btn big fpdel" data-ddel="1" aria-label="Gericht löschen">' + ic('trash') + '</button>' : '') + '</div>';
  }
  function dishTotHtml(t) {
    // Gericht: je Portion als Nährwert-Icons, darunter die Summe
    return '<div class="dgp">' + [['k', t.pk], ['p', t.pp], ['f', t.pf], ['c', t.pc]].map(function (q) { return '<span style="--nc:var(' + NCOL[q[0]] + ')">' + ic(NIC[q[0]]) + '<b>' + Math.round(q[1]) + '</b></span>'; }).join('') + '</div><small>je Portion · gesamt ' + Math.round(t.k) + ' kcal</small>';
  }
  function openDishEdit(id) {
    var x = id && id !== 'new' ? fDish(id) : null;
    ui.dd = x ? JSON.parse(JSON.stringify(x)) : { id: null, n: '', por: 1, ing: [{ n: '', a: '', k: '', p: '' }] };
    ui.ddel = 0; ui.sheet = { dishEdit: true }; sheetOpen(dishEditHtml(), true);
  }
  function readDraft() {
    var dd = ui.dd; if (!dd || !$('dd-n')) return;
    dd.n = $('dd-n').value; dd.por = Math.max(1, parseFloat($('dd-por').value) || 1);
    dd.ing.forEach(function (q, i) {
      // Fehlt das Feld (Zutat aus der Datenbank: kcal/Protein nicht editierbar), bleibt der bisherige Wert
      function v(k) { var e = $('di-' + k + '-' + i); if (!e) return q[k]; var f = parseFloat(e.value); return isFinite(f) ? f : ''; }
      q.n = $('di-n-' + i).value; q.a = v('a'); q.k = v('k'); q.p = v('p');
    });
  }
  function saveDish() {
    readDraft(); var dd = ui.dd, ing = dd.ing.filter(function (q) { return (+q.a || 0) > 0 && ((+q.k || 0) > 0 || (+q.p || 0) > 0); });
    if (!dd.n.trim()) { toast('Name fehlt', 'bolt'); return; }
    if (!ing.length) { toast('Zutat mit Menge eintragen', 'bolt'); return; }
    var st = foodState(), o = { id: dd.id || 'd' + Date.now().toString(36), n: dd.n.trim().slice(0, 30), por: dd.por, ing: ing.map(function (q) {
      var r = { n: (q.n || '').trim().slice(0, 30), a: +q.a || 0, k: +q.k || 0, p: +q.p || 0 }; ['f', 'c', 'fb', 'su'].forEach(function (k) { if (q[k] != null) r[k] = +q[k] || 0; }); if (q.i) r.i = q.i; return r;
    }) };
    if (dd.m && dd.m.length) o.m = dd.m.slice();
    var ix = st.d.map(function (y) { return y.id; }).indexOf(o.id); if (ix >= 0) st.d[ix] = o; else st.d.push(o);
    persist(); ui.fresh = false; render(); toast('Gericht gespeichert', 'check'); openDishes();
  }
