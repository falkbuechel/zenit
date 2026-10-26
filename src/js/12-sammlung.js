  // ---------- Verlauf
  // ---------- Sammlung (Tab „fort“): Karten, Muskeln, Skills – immer nur ein Bereich sichtbar (Statistik steht im Profil)
  var MUSI = { ru: 'pull', br: 'push', sh: 'shoulder', ar: 'dumbbell', co: 'core', be: 'leg', gr: 'grip', mo: 'roll', au: 'bike' }, MUSN = {};
  MUS.forEach(function (m) { MUSN[m[0]] = m[1]; });
  // Muskel-Embleme: Material steigt mit dem Level
  var MAT = [[1, 'Holz'], [3, 'Stein'], [5, 'Bronze'], [8, 'Silber'], [11, 'Gold'], [14, 'Platin'], [17, 'Diamant'], [20, 'Zenit']];
  function matOf(lv) { var m = 0; MAT.forEach(function (x, i) { if (lv >= x[0]) m = i; }); return m; }
  function cardTile(d, e) {
    var own = !!d.unlocked[e.id], c = cardOf(d, e), r = rarOf(e), cc = cCost(e, c.lv);
    return '<button class="hc ' + RAR[r][2] + ' l' + (own ? lookOf(c.lv) : 0) + (own ? '' : ' lk') + (own && cardReady(d, e) ? ' rdy' : '') + '" data-cardo="' + e.id + '"><small>' + RAR[r][0] + '</small><b>' + esc(e.n) + '</b>' +
      (own ? '<em>Lv ' + c.lv + '</em><i class="hcb"><i style="--p:' + (cc ? Math.min(1, c.kp / cc) : 1).toFixed(3) + '"></i></i>' : '<em>' + ic('lock') + '</em>') + '</button>';
  }
  function viewCards(d) {
    // Karten: oben drei Filter (Alle, Bereit, Gesperrt), darunter je Gruppe eine zuklappbare Zeile mit Stärke-Balken; Karten klein (Name, Seltenheit, Level, Look)
    var f = ui.cf2 || 'all', rd = EX.filter(function (e) { return d.unlocked[e.id] && cardReady(d, e); }), lk = EX.filter(function (e) { return !d.unlocked[e.id]; }), op = ui.cgo || {};
    function mini(e) {
      var own = !!d.unlocked[e.id], c = cardOf(d, e), r = rarOf(e);
      return '<button class="dk ' + RAR[r][2] + ' l' + (own ? lookOf(c.lv) : 0) + (own ? '' : ' lk') + (own && cardReady(d, e) ? ' rdy' : '') + '" data-cardo="' + e.id + '"><b>' + esc(e.n) + '</b><span class="rr">' + RAR[r][0] + '</span><em>' + (own ? c.lv : ic('lock')) + '</em></button>';
    }
    function byLv(a, b) { return cardOf(d, b).lv - cardOf(d, a).lv || rarOf(b) - rarOf(a); }
    var h = '<div class="cft rise" style="--i:1" role="group" aria-label="Filter">' + [['all', 'Alle', EX.length - lk.length], ['rdy', 'Bereit ▲', rd.length], ['lock', 'Gesperrt', lk.length]].map(function (x) {
      return '<button data-cf2="' + x[0] + '" aria-pressed="' + (f === x[0]) + '">' + x[1] + '<small>' + x[2] + '</small></button>'; }).join('') + '</div>';
    if (f !== 'all') {
      var L = f === 'rdy' ? rd.sort(byLv) : lk.sort(function (a, b) { return rarOf(a) - rarOf(b); });
      return h + (L.length ? '<div class="deck rise" style="--i:2">' + L.map(mini).join('') + '</div>' : '<p class="muted rise" style="--i:2">' + (f === 'rdy' ? 'Gerade keine Karte bereit. KP sammelst du im Training.' : 'Alles freigeschaltet.') + '</p>');
    }
    return h + GORDER.map(function (k, i) {
      var g = gOf(k), all = EX.filter(function (e) { return e.g === k; }), own = all.filter(function (e) { return d.unlocked[e.id]; }), lv = own.reduce(function (a, e) { return a + cardOf(d, e).lv; }, 0);
      var rest = all.filter(function (e) { return !d.unlocked[e.id]; }).sort(function (a, b) { return rarOf(a) - rarOf(b); });
      return '<section class="cgr rise' + (op[k] ? ' open' : '') + '" style="--i:' + (i + 2) + '"><button class="cgr-h" data-cg="' + k + '" aria-expanded="' + !!op[k] + '">' + ic(g.i) + '<b>' + g.n + '</b><small>' + own.length + '/' + all.length + '</small>' +
        '<i class="hcb"><i style="--p:' + (lv / (all.length * CMAX)).toFixed(3) + '"></i></i>' + ic('chev') + '</button>' + (op[k] ? '<div class="deck">' + own.sort(byLv).concat(rest).map(mini).join('') + '</div>' : '') + '</section>';
    }).join('');
  }
  function reqHtml(d, e) {
    // Voraussetzungen: Bestwerte anderer Übungen, bei Skills zusätzlich Muskel-Level
    var rs = (e.req || []).map(function (q) { var r = reqLine(q, d); return '<div class="rqm' + (r.ok ? ' ok' : '') + '">' + ic(r.ok ? 'check' : 'lock') + '<span>' + esc(r.name) + '</span><b>' + r.cur + ' / ' + r.need + ' ' + esc(r.u) + '</b></div>'; });
    var sq = SKQ[e.id] || {}; Object.keys(sq).forEach(function (k) { var lv = mLevel(d.mp[k] || 0).lv; rs.push('<div class="rqm' + (lv >= sq[k] ? ' ok' : '') + '">' + ic(lv >= sq[k] ? 'check' : 'lock') + '<span>' + MUSN[k] + '</span><b>Lv ' + lv + ' / ' + sq[k] + '</b></div>'); });
    return '<div class="rqw">' + rs.join('') + '</div>';
  }
  function cardSheet(d, e) {
    var own = !!d.unlocked[e.id], c = cardOf(d, e), r = rarOf(e), mw = musOf(e), lad = '';
    for (var lv = RAR[r][1]; lv <= CMAX; lv++) lad += '<div class="lad' + (own && lv === c.lv ? ' cur' : own && lv < c.lv ? ' ok' : '') + '"><i class="lk' + lookOf(lv) + '"></i><b>Lv ' + lv + '</b><span>' + rxText(e, rx(e, lv)) + '</span></div>';
    return shHead(gOf(e.g).i, e.n, RAR[r][0] + ' · ' + (own ? 'Level ' + c.lv + ' · Look ' + LOOK[lookOf(c.lv)] : 'gesperrt')) +
      '<div class="cbig">' + cardTile(d, e) + '</div>' + (own ? cardProg(d, e) : reqHtml(d, e)) +
      '<h3 class="xg">Muskeln</h3><div class="cmu">' + Object.keys(mw).map(function (k) { return '<span' + (mw[k] < 1 ? ' class="half"' : '') + '>' + ic(MUSI[k]) + MUSN[k] + '</span>'; }).join('') + '</div>' +
      '<h3 class="xg">Stufen</h3><div class="ladw">' + lad + '</div>' + (own ? '<button class="btn small" data-cdet="' + e.id + '">' + ic('chart') + 'Verlauf der Übung</button>' : '');
  }
  function embHtml(k, lv, big) { return '<i class="emb-i m' + matOf(lv) + (big ? ' big' : '') + '">' + ic(MUSI[k]) + '</i>'; }
  // Körperfigur (vorn/hinten, Wischen dreht): jede Fläche ist ein Einzelmuskel in der Farbe seines Materials; später durch Illustrationen ersetzbar
  var BODY = {
    f: [['bn', '<circle cx="100" cy="28" r="16"/><rect x="92" y="42" width="16" height="12" rx="4"/><path d="M80 164h40l-4 24H84z"/>'],
      ['so', '<ellipse cx="66" cy="68" rx="17" ry="13"/><ellipse cx="134" cy="68" rx="17" ry="13"/>'],
      ['br', '<path d="M74 62Q99 56 99 66v32q-14 7-26-1z"/><path d="M126 62Q101 56 101 66v32q14 7 26-1z"/>'],
      ['bi', '<rect x="44" y="80" width="16" height="52" rx="8"/><rect x="140" y="80" width="16" height="52" rx="8"/>'],
      ['ua', '<rect x="40" y="134" width="15" height="48" rx="7"/><rect x="145" y="134" width="15" height="48" rx="7"/><circle cx="47" cy="191" r="7"/><circle cx="153" cy="191" r="7"/>'],
      ['ab', '<rect x="87" y="104" width="26" height="58" rx="8"/>'],
      ['ob', '<rect x="77" y="106" width="9" height="52" rx="4"/><rect x="114" y="106" width="9" height="52" rx="4"/>'],
      ['qu', '<rect x="76" y="190" width="22" height="76" rx="10"/><rect x="102" y="190" width="22" height="76" rx="10"/>'],
      ['wa', '<rect x="79" y="270" width="17" height="58" rx="8"/><rect x="104" y="270" width="17" height="58" rx="8"/>']],
    b: [['bn', '<circle cx="100" cy="28" r="16"/><rect x="92" y="42" width="16" height="12" rx="4"/>'],
      ['tz', '<path d="M82 52h36l16 12-12 14H78L66 64z"/>'],
      ['sb', '<ellipse cx="62" cy="72" rx="15" ry="12"/><ellipse cx="138" cy="72" rx="15" ry="12"/>'],
      ['la', '<path d="M74 82h24v58q-15-6-24-28z"/><path d="M126 82h-24v58q15-6 24-28z"/>'],
      ['ur', '<rect x="84" y="142" width="32" height="22" rx="8"/>'],
      ['tr', '<rect x="44" y="84" width="16" height="48" rx="8"/><rect x="140" y="84" width="16" height="48" rx="8"/>'],
      ['ua', '<rect x="40" y="134" width="15" height="48" rx="7"/><rect x="145" y="134" width="15" height="48" rx="7"/><circle cx="47" cy="191" r="7"/><circle cx="153" cy="191" r="7"/>'],
      ['gs', '<ellipse cx="89" cy="181" rx="13" ry="13"/><ellipse cx="111" cy="181" rx="13" ry="13"/>'],
      ['hb', '<rect x="76" y="196" width="22" height="70" rx="10"/><rect x="102" y="196" width="22" height="70" rx="10"/>'],
      ['wa', '<rect x="79" y="270" width="17" height="58" rx="8"/><rect x="104" y="270" width="17" height="58" rx="8"/>']]
  };
  function nextMat(lv, mp, need, half) { var mi = matOf(lv), nx = MAT[mi + 1], r = need ? need - mp : 0; if (nx) for (var l = lv + 1; l < nx[0]; l++) r += half ? mCost(l) / 2 : mCost(l); return nx ? nx[1] + ' ab Lv ' + nx[0] + ' · noch ' + Math.round(r) + ' MP' : 'Höchstes Material'; }
  function viewMuscles(d) {
    var side = ui.mside || 'f', sel = ui.msel || 'g:ru', grp = sel.indexOf('g:') === 0 ? sel.slice(2) : null, fl = ui.mflip || 0, sl = {};
    ui.mflip = 0; if (!grp && !SUBB[sel]) { sel = 'g:ru'; grp = 'ru'; }
    SUBM.forEach(function (m) { sl[m[0]] = sLevel(d.smp[m[0]] || 0); });
    var fig = BODY[side].map(function (x) { return x[0] === 'bn' ? '<g class="bn">' + x[1] + '</g>' : '<g class="mp m' + matOf(sl[x[0]].lv) + (x[0] === sel || SUBB[x[0]][2] === grp ? ' on' : '') + '" data-msel="' + x[0] + '" role="button" aria-label="' + SUBB[x[0]][1] + '">' + x[1] + '</g>'; }).join('');
    var info;
    if (grp) {
      var q = mLevel(d.mp[grp] || 0), subs = SUBM.filter(function (m) { return m[2] === grp; });
      info = embHtml(grp, q.lv) + '<div><b>' + MUSN[grp] + '</b><small>Lv ' + q.lv + ' · ' + MAT[matOf(q.lv)][1] + '</small><i class="hcb"><i style="--p:' + (q.need ? q.mp / q.need : 1).toFixed(3) + '"></i></i><small>' + nextMat(q.lv, q.mp, q.need) + '</small></div>' +
        (subs.length ? '<div class="msub">' + subs.map(function (m) { return '<button data-msel="' + m[0] + '"><i class="mdot m' + matOf(sl[m[0]].lv) + '"></i>' + m[1] + '<b>' + sl[m[0]].lv + '</b></button>'; }).join('') + '</div>' : '') +
        '<button class="btn small" data-muso="' + grp + '">' + ic('dumb') + 'Übungen</button>';
    } else {
      var m = SUBB[sel], qs = sl[sel], qg = mLevel(d.mp[m[2]] || 0);
      info = embHtml(m[2], qs.lv) + '<div><b>' + m[1] + '</b><small>Lv ' + qs.lv + ' · ' + MAT[matOf(qs.lv)][1] + '</small><i class="hcb"><i style="--p:' + (qs.need ? qs.mp / qs.need : 1).toFixed(3) + '"></i></i><small>' + nextMat(qs.lv, qs.mp, qs.need, 1) + '</small></div>' +
        '<div class="msub"><button data-msel="g:' + m[2] + '">' + ic('back') + MUSN[m[2]] + '<b>' + qg.lv + '</b></button></div><button class="btn small" data-muso="' + m[2] + '">' + ic('dumb') + 'Übungen</button>';
    }
    return '<section class="mfig rise" style="--i:1" data-noswipe="1"><svg class="' + (fl ? 'fl' : '') + '" viewBox="0 0 200 340">' + fig + '</svg><div class="mside"><i' + (side === 'f' ? ' class="on"' : '') + '></i><i' + (side === 'b' ? ' class="on"' : '') + '></i></div></section>' +
      '<div class="mchips rise" style="--i:2" data-noswipe="1">' + MUS.map(function (g) { var lv = mLevel(d.mp[g[0]] || 0).lv; return '<button class="mchip' + (grp === g[0] || (!grp && SUBB[sel][2] === g[0]) ? ' on' : '') + '" data-msel="g:' + g[0] + '">' + embHtml(g[0], lv) + g[1] + '<small>' + lv + '</small></button>'; }).join('') + '</div>' +
      '<section class="minf rise" style="--i:3">' + info + '</section>';
  }
  // Figur drehen: waagerecht wischen (ab 40 px); ein Wischen löst keine Auswahl aus
  var mfx = null, mfMoved = false;
  document.addEventListener('pointerdown', function (ev) { var f = ev.target.closest && ev.target.closest('.mfig'); mfMoved = false; mfx = f ? ev.clientX : null; });
  document.addEventListener('pointermove', function (ev) { if (mfx != null && Math.abs(ev.clientX - mfx) > 10) mfMoved = true; });
  document.addEventListener('pointerup', function (ev) {
    if (mfx == null) return; var dx = ev.clientX - mfx; mfx = null;
    if (Math.abs(dx) > 40) { ui.mside = ui.mside === 'b' ? 'f' : 'b'; ui.mflip = dx < 0 ? 1 : -1; ui.fresh = false; render(); buzz(6); }
  });
  function musSheet(d, k) {
    var q = mLevel(d.mp[k] || 0), mi = matOf(q.lv), nx = MAT[mi + 1];
    var ex = EX.filter(function (e) { return musOf(e)[k]; }).sort(function (a, b) { return (d.unlocked[b.id] ? 1 : 0) - (d.unlocked[a.id] ? 1 : 0) || cardOf(d, b).lv - cardOf(d, a).lv; });
    return shHead(MUSI[k], MUSN[k], 'Level ' + q.lv + ' · ' + MAT[mi][1]) + '<div class="msh">' + embHtml(k, q.lv, 1) + '<div><b>' + (q.need ? Math.round(q.mp) + ' / ' + q.need + ' MP' : 'Maximum') + '</b><i class="hcb"><i style="--p:' + (q.need ? q.mp / q.need : 1).toFixed(3) + '"></i></i>' +
      '<small>' + (nx ? 'Ab Level ' + nx[0] + ': ' + nx[1] : 'Höchstes Material') + '</small></div></div>' +
      '<h3 class="xg">Übungen</h3><div class="cgrid">' + ex.map(function (e) { return cardTile(d, e); }).join('') + '</div>';
  }
  // Skilltree: radiales Netz auf einer 1400er-Fläche. Mitte Zenit, Ring Muskelgruppen, außen alle Übungen nach Stufe (innen leicht, außen schwer, je Stufe ein Ring), Skills groß.
  // Linien: Muskel → Grundübung, Voraussetzung → Übung. Zwei Finger zoomen, einer verschiebt (ui.stv), Antippen zeigt unten eine Info-Leiste
  var STW = 1400, STC = 700, stLay = null, stSat = {}, stWed = [];
  var MUSC = { ru: '#5b8fd6', br: '#e0a24a', sh: '#a374d8', ar: '#d9784a', co: '#57c7b8', be: '#8fae5a', gr: '#b08968', mo: '#6fb0c8', au: '#e0533d' };
  function primMus(e) { var mw = musOf(e), ks = Object.keys(mw); return ks.filter(function (k) { return mw[k] === 1; })[0] || ks[0] || 'co'; }
  function stLayout() {
    if (stLay) return stLay;
    // Hauptknoten = Skills und Übungen, auf denen etwas aufbaut. Varianten (nichts baut auf ihnen auf) werden kleine Satelliten an ihrem Ursprung
    // (erste Voraussetzung bzw. Muskelgruppe), damit breite Knoten (Liegestütz: 11 Varianten, Mobility: 14) keine eigenen Äste aufmachen
    var dep = {}, pos = {}, kids = {}, sats = {}, brM = {};
    EX.forEach(function (e) { (e.req || []).forEach(function (q) { dep[q[0]] = 1; }); });
    function par(e) { return e.req && EXB[e.req[0][0]] ? e.req[0][0] : 'm:' + primMus(e); }
    EX.forEach(function (e) { var p0 = par(e); if (e.g === 'skill' || dep[e.id]) (kids[p0] = kids[p0] || []).push(e.id); else (sats[p0] = sats[p0] || []).push(e.id); });
    stSat = {}; Object.keys(sats).forEach(function (p0) { sats[p0].forEach(function (id) { stSat[id] = p0; }); });
    function breadth(id) {
      if (brM[id]) return brM[id];
      var per = {}; (function walk(x) { (kids[x] || []).forEach(function (c) { var st = stageOf(EXB[c]); per[st] = (per[st] || 0) + (EXB[c].g === 'skill' ? 2 : 1) + (sats[c] ? Math.ceil(sats[c].length / 5) : 0); walk(c); }); })(id);
      return (brM[id] = Math.max.apply(null, [1].concat(Object.keys(per).map(function (k) { return per[k]; }))) + (sats[id] && id.indexOf('m:') === 0 ? 1 : 0));
    }
    function place(id, a1, a2) {
      var mid = (a1 + a2) / 2, r = mid * Math.PI / 180, R = id.indexOf('m:') === 0 ? 170 : 245 + stageOf(EXB[id]) * 67;
      pos[id] = { x: STC + Math.cos(r) * R, y: STC + Math.sin(r) * R };
      // Geschwister nach Zugrichtung: Äste mit Linien in einen Sektor davor (kleinerer Winkel) zuerst, in einen dahinter zuletzt
      // (z. B. Backlever Tuck an den Rand zum Griff-Sektor, wo Dead Hang liegt)
      var ch = (kids[id] || []).slice().sort(function (x, y) { return pull(x) - pull(y); }), tot = ch.reduce(function (a, c) { return a + breadth(c); }, 0), cur = a1;
      ch.forEach(function (c) { var w = breadth(c) / tot * (a2 - a1); place(c, cur, cur + w); cur += w; });
    }
    // Muskelgruppen: Bereich nach Breite, mindestens 30°
    var W0 = MUS.map(function (m) { return breadth('m:' + m[0]); }), small = W0.map(function () { return false; }), a0 = -90, ws;
    for (var it = 0; it < 4; it++) {
      var fixed = small.filter(Boolean).length, rest = W0.reduce(function (a, b, k) { return a + (small[k] ? 0 : b); }, 0);
      ws = W0.map(function (b, k) { return small[k] ? 30 : b / rest * (360 - 30 * fixed); });
      ws.forEach(function (w, k) { if (w < 30) small[k] = true; });
    }
    // Reihenfolge der Sektoren: Muskelgruppen, zwischen deren Ästen Linien laufen (z. B. Core → Frontlever unter Rücken), nebeneinander legen.
    // Alle Reihenfolgen durchprobieren (erste fest, 8! = 40320), Kosten = Linien × Winkelabstand der Sektormitten
    var mi = {}, cw = MUS.map(function () { return MUS.map(function () { return 0; }); });
    MUS.forEach(function (m, k) { mi['m:' + m[0]] = k; });
    function rk(id) { while (id.indexOf('m:') !== 0) id = par(EXB[id]); return mi[id]; }
    EX.forEach(function (e) { if (stSat[e.id] || !e.req) return; var b2 = rk(e.id); e.req.forEach(function (q) { var a2 = rk(q[0]); if (a2 !== b2) { cw[a2][b2]++; cw[b2][a2]++; } }); });
    var nM = MUS.length, ord = [0], bestO = null, bestC = 1e9, used = [true];
    (function perm(o) {
      if (o.length === nM) {
        var c = 0, ce = [], acc = 0; o.forEach(function (k) { ce.push(acc + ws[k] / 2); acc += ws[k]; });
        for (var i = 0; i < nM; i++) for (var j = i + 1; j < nM; j++) if (cw[o[i]][o[j]]) c += cw[o[i]][o[j]] * Math.min(ce[j] - ce[i], 360 - ce[j] + ce[i]);
        if (c < bestC) { bestC = c; bestO = o.slice(); } return;
      }
      for (var k = 1; k < nM; k++) if (!used[k]) { used[k] = true; o.push(k); perm(o); o.pop(); used[k] = false; }
    })(ord);
    // Sektormitten (Grad) und Zugrichtung eines Asts: mittlere Winkeldifferenz seiner Linien in andere Sektoren (für place)
    var secC = {}, acc0 = a0; bestO.forEach(function (k) { secC[k] = acc0 + ws[k] / 2; acc0 += ws[k]; });
    var plM = {};
    function pull(c) {
      if (plM[c] !== undefined) return plM[c];
      var S = {}, own = rk(c), sum = 0, n = 0; (function walk(x) { S[x] = 1; (kids[x] || []).forEach(walk); })(c);
      EX.forEach(function (e) {
        if (stSat[e.id] || !e.req) return;
        e.req.forEach(function (q) {
          var a = q[0], b = e.id; if (!S[a] === !S[b]) return;
          var o = rk(S[a] ? b : a); if (o === own) return;
          var dg = secC[o] - secC[own]; dg = ((dg + 540) % 360) - 180; sum += dg; n++;
        });
      });
      return (plM[c] = n ? sum / n : 0);
    }
    stWed = []; bestO.forEach(function (k) { var m = MUS[k]; stWed.push({ k: m[0], a1: a0, a2: a0 + ws[k] }); place('m:' + m[0], a0, a0 + ws[k]); a0 += ws[k]; });
    // Linien entwirren: jeden Ast (Knoten samt Unterbaum) probeweise drehen und behalten, was weniger Kreuzungen und kürzere Linien ergibt
    function ang(id) { var q = pos[id]; return Math.atan2(q.y - STC, q.x - STC); }
    function rot(id, da) { var q = pos[id], a = ang(id) + da, R = Math.hypot(q.x - STC, q.y - STC); pos[id] = { x: STC + Math.cos(a) * R, y: STC + Math.sin(a) * R }; (kids[id] || []).forEach(function (c) { rot(c, da); }); }
    var main = EX.filter(function (e) { return !stSat[e.id]; }), edg = [];
    main.forEach(function (e) { (e.req ? e.req.map(function (q) { return q[0]; }) : ['m:' + primMus(e)]).forEach(function (f) { edg.push([f, e.id]); }); });
    function cost() {
      var n = 0, len = 0, L = edg.map(function (g) { var a = pos[g[0]], b = pos[g[1]]; len += Math.hypot(a.x - b.x, a.y - b.y); return [a, b, g]; });
      for (var i = 0; i < L.length; i++) for (var j = i + 1; j < L.length; j++) {
        var A = L[i], B = L[j]; if (A[2][0] === B[2][0] || A[2][0] === B[2][1] || A[2][1] === B[2][0] || A[2][1] === B[2][1]) continue;
        var d = (A[1].x - A[0].x) * (B[1].y - B[0].y) - (A[1].y - A[0].y) * (B[1].x - B[0].x); if (!d) continue;
        var t = ((B[0].x - A[0].x) * (B[1].y - B[0].y) - (B[0].y - A[0].y) * (B[1].x - B[0].x)) / d, u = ((B[0].x - A[0].x) * (A[1].y - A[0].y) - (B[0].y - A[0].y) * (A[1].x - A[0].x)) / d;
        if (t > 0 && t < 1 && u > 0 && u < 1) n++;
      }
      return n * 400 + len;
    }
    // jeder Ast bleibt im Sektor seiner Muskelgruppe
    var wd = {}; stWed.forEach(function (w) { wd['m:' + w.k] = w; });
    function root(id) { while (id.indexOf('m:') !== 0) id = par(EXB[id]); return wd[id]; }
    // Ausnahme: Knoten mit Voraussetzungen aus anderen Sektoren dürfen bis zu 15° über die Grenze (näher an diese Eltern)
    function inside(id, w) {
      var a = ang(id) * 180 / Math.PI, ext = id.indexOf('m:') !== 0 && (EXB[id].req || []).some(function (q) { return rk(q[0]) !== rk(id); }) ? 15 : -3;
      while (a < w.a1 - 180) a += 360; while (a > w.a1 + 180 + (w.a2 - w.a1)) a -= 360;
      return a > w.a1 - ext && a < w.a2 + ext && (kids[id] || []).every(function (c) { return inside(c, w); });
    }
    var best = cost(), DA = [-60, -45, -32, -24, -16, -10, -6, -3, -1, 1, 3, 6, 10, 16, 24, 32, 45, 60];
    for (var pass = 0; pass < 6; pass++) main.forEach(function (e) {
      var bd = 0, w = root(e.id); DA.forEach(function (dg) { var r = dg * Math.PI / 180; rot(e.id, r); var c = inside(e.id, w) ? cost() : 1e9; rot(e.id, -r); if (c < best - 1) { best = c; bd = r; } });
      if (bd) rot(e.id, bd);
    });
    // je Ring Mindestabstand (Knotengröße + 24 px Platz für Satelliten)
    var rings = {};
    EX.forEach(function (e) { if (stSat[e.id]) return; var st = stageOf(e), q = pos[e.id]; (rings[st] = rings[st] || []).push({ id: e.id, a: Math.atan2(q.y - STC, q.x - STC) * 180 / Math.PI }); });
    Object.keys(rings).forEach(function (st) {
      var L = rings[st].sort(function (x, y) { return x.a - y.a; }), R = 245 + st * 67, sh = 0;
      function gap(x, y) { return ((EXB[x.id].g === 'skill' ? 44 : 28) + (EXB[y.id].g === 'skill' ? 44 : 28)) / 2 + (sats[x.id] || sats[y.id] ? 34 : 14); }
      for (var it2 = 0; it2 < 3; it2++) {
        for (var j = 1; j < L.length; j++) { var dA = L[j].a - L[j - 1].a, g = gap(L[j], L[j - 1]) / (2 * Math.PI * R) * 360; if (dA < g) { L[j].a += g - dA; sh += g - dA; } }
        var dW = L[0].a + 360 - L[L.length - 1].a, gW = L.length > 1 ? gap(L[0], L[L.length - 1]) / (2 * Math.PI * R) * 360 : 0;
        if (dW < gW) L.forEach(function (o, k) { o.a -= (gW - dW) * k / (L.length - 1); });
      }
      L.forEach(function (o) { var r = (o.a - sh / L.length / 2) * Math.PI / 180; pos[o.id] = { x: STC + Math.cos(r) * R, y: STC + Math.sin(r) * R }; });
    });
    // Satelliten: Bogen nach außen um den Ursprung, bei vielen in zwei Reihen
    Object.keys(sats).forEach(function (p0) {
      // je Reihe so viele, wie auf ~140° Bogen mit 24 px Abstand passen; weitere Reihen 24 px weiter außen
      var c = pos[p0], S = sats[p0], ao = Math.atan2(c.y - STC, c.x - STC), r = p0.indexOf('m:') === 0 ? 56 : 34, j = 0;
      while (j < S.length) {
        var cap = Math.max(1, Math.floor(r * 2.45 / 24) + 1), m = Math.min(cap, S.length - j), st = 24 / r;
        for (var k = 0; k < m; k++, j++) { var da = (k - (m - 1) / 2) * st; pos[S[j]] = { x: c.x + Math.cos(ao + da) * r, y: c.y + Math.sin(ao + da) * r }; }
        r += 24;
      }
    });
    return (stLay = pos);
  }
  function stInfo(d, sel) {
    // Kurzinfo unten: Kopf mit Level-Plakette, darunter Balken (Fortschritt zum nächsten Level bzw. Voraussetzungen)
    if (sel && sel.indexOf('m:') !== 0 && !EXB[sel]) sel = null;
    if (!sel) return '';
    function bar(lbl, cur, need, txt) { var ok = cur >= need; return '<div class="sir' + (ok ? ' ok' : '') + '"><span>' + lbl + '</span><b>' + txt + '</b><i class="hcb"><i style="--p:' + Math.min(1, need ? cur / need : 1).toFixed(3) + '"></i></i></div>'; }
    if (sel.indexOf('m:') === 0) {
      var k = sel.slice(2), q = mLevel(d.mp[k] || 0), nx = MAT[matOf(q.lv) + 1], ex = EX.filter(function (e) { return musOf(e)[k] === 1; }), eo = ex.filter(function (e) { return d.unlocked[e.id]; }).length;
      return '<div class="stinf" style="--rc:' + MUSC[k] + '"><div class="stinf-h">' + embHtml(k, q.lv) + '<span><b>' + MUSN[k] + '</b><small>Lv ' + q.lv + ' · ' + MAT[matOf(q.lv)][1] + (nx ? ' → ' + nx[1] + ' ab Lv ' + nx[0] : '') + '</small></span><button class="btn small" data-muso="' + k + '">Übungen</button></div>' +
        '<div class="sigr">' + bar(ic('bolt') + (q.need ? 'Lv ' + (q.lv + 1) : 'Max'), q.mp, q.need || 1, q.need ? q.mp + ' / ' + q.need + ' MP' : '-') +
        SUBM.filter(function (m) { return m[2] === k; }).map(function (m) { var sl = sLevel(d.smp[m[0]] || 0); return bar(esc(m[1]), sl.mp, sl.need || 1, 'Lv ' + sl.lv); }).join('') +
        bar(ic('star') + 'Übungen', eo, ex.length, eo + ' / ' + ex.length) + '</div></div>';
    }
    var e = EXB[sel], own = !!d.unlocked[e.id], c = cardOf(d, e), cc = cCost(e, c.lv), mw = musOf(e), rows = '';
    if (own) rows = (c.lv >= CMAX ? '' : cardReady(d, e) ? '<div class="sir ok"><span>' + ic('up') + 'Aufstiegsprüfung</span><b>' + rxText(e, rx(e, c.lv + 1)) + '</b></div>' : bar(ic('bolt') + 'Lv ' + (c.lv + 1), c.kp, cc, c.kp + ' / ' + cc + ' KP')) +
      '<div class="sir"><span>' + ic('target') + 'Vorgabe</span><b>' + rxText(e, rxNow(d, e)) + '</b></div>';
    else {
      rows = (e.req || []).map(function (q) { var r = reqLine(q, d); return bar(ic(r.ok ? 'check' : 'lock') + esc(r.name), r.cur, r.need, r.cur + ' / ' + r.need + ' ' + esc(r.u)); }).join('');
      var sq = SKQ[e.id] || {}; Object.keys(sq).forEach(function (k) { var ml = mLevel(d.mp[k] || 0).lv; rows += bar(ic(MUSI[k]) + MUSN[k], ml, sq[k], 'Lv ' + ml + ' / ' + sq[k]); });
      if (!rows) rows = '<div class="sir"><span>' + ic('target') + 'Einmal machen</span><b>' + rxText(e, rx(e, c.lv)) + '</b></div>';
    }
    return '<div class="stinf r' + rarOf(e) + (own ? ' on' : '') + '"><div class="stinf-h"><i class="stb">' + (own ? c.lv : ic('lock')) + '</i><span><b>' + esc(e.n) + '</b><small>' + RAR[rarOf(e)][0] + (stSat[e.id] ? ' · Variante' : '') + '</small></span><button class="btn small" data-cardo="' + e.id + '">Karte</button></div>' +
      '<div class="sigr">' + rows + '</div><div class="cmu sm">' + Object.keys(mw).map(function (k) { return '<span' + (mw[k] < 1 ? ' class="half"' : '') + '>' + ic(MUSI[k]) + MUSN[k] + '</span>'; }).join('') + '</div></div>';
  }
  function viewSkills(d) {
    var P = stLayout(), sel = ui.stsel || null, lines = '', glow = '', nodes = '', lit = 0, tot = 0;
    function ln(a, b, cls) { return '<line x1="' + a.x.toFixed(1) + '" y1="' + a.y.toFixed(1) + '" x2="' + b.x.toFixed(1) + '" y2="' + b.y.toFixed(1) + '"' + (cls ? ' class="' + cls + '"' : '') + '/>'; }
    MUS.forEach(function (m) { lines += ln({ x: STC, y: STC }, P['m:' + m[0]], 'on'); glow += ln({ x: STC, y: STC }, P['m:' + m[0]], 'gl'); });
    EX.forEach(function (e) {
      if (stSat[e.id]) { lines += ln(P[stSat[e.id]], P[e.id], 'st2' + (sel === e.id ? ' hl' : '')); return; }
      var from = e.req ? e.req.map(function (q) { return q[0]; }).filter(function (id) { return P[id]; }) : ['m:' + primMus(e)];
      // freigeschaltet: Linie leuchtet; gesperrt mit offenem Ursprung: grüner Strich vom Ursprung, so lang wie der Fortschritt der Voraussetzung
      from.forEach(function (f) {
        var on = d.unlocked[e.id] && (f.indexOf('m:') === 0 || d.unlocked[f]), hl = sel && (sel === e.id || sel === f), q = !on && d.unlocked[f] && (e.req || []).filter(function (r) { return r[0] === f; })[0];
        lines += ln(P[f], P[e.id], (on ? 'on' : '') + (hl ? ' hl' : '')); if (on) glow += ln(P[f], P[e.id], 'gl');
        if (q) { var pc = reqLine(q, d).pct / 100, a = P[f], b = P[e.id]; if (pc > 0) lines += ln(a, { x: a.x + (b.x - a.x) * pc, y: a.y + (b.y - a.y) * pc }, 'pg'); }
      });
    });
    MUS.forEach(function (m) { var q = mLevel(d.mp[m[0]] || 0), p = P['m:' + m[0]]; nodes += '<button class="stm' + (sel === 'm:' + m[0] ? ' sel' : '') + '" data-stn="m:' + m[0] + '" style="left:' + p.x.toFixed(0) + 'px;top:' + p.y.toFixed(0) + 'px">' + embHtml(m[0], q.lv) + '<small>' + m[1] + ' ' + q.lv + '</small></button>'; });
    EX.forEach(function (e) {
      var p = P[e.id], own = !!d.unlocked[e.id], c = cardOf(d, e), sk = e.g === 'skill', nx = !own && (e.req || []).every(function (q) { return d.unlocked[q[0]]; });
      if (sk) { tot++; if (own) lit++; }
      if (stSat[e.id]) { nodes += '<button class="sts r' + rarOf(e) + (own ? ' on' : '') + (sel === e.id ? ' sel' : '') + '" data-stn="' + e.id + '" style="left:' + p.x.toFixed(0) + 'px;top:' + p.y.toFixed(0) + 'px" aria-label="' + esc(e.n) + '"></button>'; return; }
      nodes += '<button class="stx r' + rarOf(e) + (sk ? ' sk' : '') + (own ? ' on l' + lookOf(c.lv) : nx ? ' nx' : '') + (sel === e.id ? ' sel' : '') + '" data-stn="' + e.id + '" style="left:' + p.x.toFixed(0) + 'px;top:' + p.y.toFixed(0) + 'px"><i>' + (own ? c.lv : ic('lock')) + '</i><small>' + esc(e.n) + '</small></button>';
    });
    // Sektoren: jede Muskelgruppe ein Kuchenstück in ihrer Farbe mit großem Namen am Rand (Überblick beim Herauszoomen; später Illustrationen je Region)
    var rings = '', labels = '';
    stWed.forEach(function (w) {
      function pt(a, r) { a = a * Math.PI / 180; return (STC + Math.cos(a) * r).toFixed(1) + ',' + (STC + Math.sin(a) * r).toFixed(1); }
      var R1 = 120, R2 = 690, lg = w.a2 - w.a1 > 180 ? 1 : 0, mid = (w.a1 + w.a2) / 2, mr = mid * Math.PI / 180;
      rings += '<path class="sct" style="fill:' + MUSC[w.k] + '" d="M' + pt(w.a1, R1) + 'L' + pt(w.a1, R2) + 'A' + R2 + ',' + R2 + ' 0 ' + lg + ' 1 ' + pt(w.a2, R2) + 'L' + pt(w.a2, R1) + 'A' + R1 + ',' + R1 + ' 0 ' + lg + ' 0 ' + pt(w.a1, R1) + 'Z"/>';
      labels += '<b class="stl2" style="left:' + (STC + Math.cos(mr) * 640).toFixed(0) + 'px;top:' + (STC + Math.sin(mr) * 640).toFixed(0) + 'px;color:' + MUSC[w.k] + '">' + MUSN[w.k] + '</b>';
    });
    // Ecke oben links: Fortschritt
    return '<div class="stmap rise" id="stmap" style="--i:1" data-noswipe="1"><div class="stcan" id="stcan"><svg viewBox="0 0 ' + STW + ' ' + STW + '" width="' + STW + '" height="' + STW + '" aria-hidden="true">' + rings + glow + lines + '</svg>' + labels + '<i class="stc2">' + ic('peak') + '</i>' + nodes + '</div>' +
      '<div class="stk"><b>' + lit + '<small>/' + tot + '</small></b><span>Skills</span><b>' + EX.filter(function (e) { return d.unlocked[e.id]; }).length + '<small>/' + EX.length + '</small></b><span>Übungen</span></div>' +
      stInfo(d, sel) + '</div>';
  }
  function stBox() {
    // Ausdehnung des Netzes (mit Rand für Beschriftungen)
    var P = stLayout(), xs = [], ys = []; Object.keys(P).forEach(function (k) { xs.push(P[k].x); ys.push(P[k].y); });
    return { x0: Math.min.apply(null, xs) - 70, y0: Math.min.apply(null, ys) - 50, x1: Math.max.apply(null, xs) + 70, y1: Math.max.apply(null, ys) + 50 };
  }
  function stFit() { var m = $('stmap'), b = stBox(); return m ? Math.min(m.clientWidth / (b.x1 - b.x0), (m.clientHeight - 70) / (b.y1 - b.y0)) : 0.3; }
  function stApply() {
    var m = $('stmap'), c = $('stcan'); if (!m || !c) return;
    if (!ui.stv) { var f = stFit(), b = stBox(); ui.stv = { s: f, x: (m.clientWidth - (b.x1 - b.x0) * f) / 2 - b.x0 * f, y: (m.clientHeight - 70 - (b.y1 - b.y0) * f) / 2 - b.y0 * f }; }
    c.style.transform = 'translate(' + ui.stv.x.toFixed(1) + 'px,' + ui.stv.y.toFixed(1) + 'px) scale(' + ui.stv.s.toFixed(4) + ')';
    c.classList.toggle('z2', ui.stv.s >= 0.8);
  }
  function stZoom(f, cx, cy) {
    var v = ui.stv; if (!v) return; var s2 = Math.max(stFit() * 0.8, Math.min(3, v.s * f));
    v.x = cx - (cx - v.x) * s2 / v.s; v.y = cy - (cy - v.y) * s2 / v.s; v.s = s2; stApply();
  }
  var stP = {}, stMoved = false;
  document.addEventListener('pointerdown', function (ev) { if (!ev.target.closest || !ev.target.closest('#stmap') || ev.target.closest('.stinf')) return; stP[ev.pointerId] = { x: ev.clientX, y: ev.clientY }; stMoved = false; });
  document.addEventListener('pointermove', function (ev) {
    var p0 = stP[ev.pointerId], m = $('stmap'); if (!p0 || !m || !ui.stv) return;
    var ids = Object.keys(stP);
    if (ids.length === 1) { var dx = ev.clientX - p0.x, dy = ev.clientY - p0.y; if (Math.abs(dx) + Math.abs(dy) > 3) stMoved = true; ui.stv.x += dx; ui.stv.y += dy; stApply(); }
    else { var o = stP[ids[0] === String(ev.pointerId) ? ids[1] : ids[0]], d0 = Math.hypot(p0.x - o.x, p0.y - o.y), d1 = Math.hypot(ev.clientX - o.x, ev.clientY - o.y), r = m.getBoundingClientRect(); stMoved = true; if (d0 > 0) stZoom(d1 / d0, (ev.clientX + o.x) / 2 - r.left, (ev.clientY + o.y) / 2 - r.top); }
    p0.x = ev.clientX; p0.y = ev.clientY;
  });
  function stUp(ev) { delete stP[ev.pointerId]; }
  document.addEventListener('pointerup', stUp);
  document.addEventListener('pointercancel', stUp);
  document.addEventListener('wheel', function (ev) { var m = ev.target.closest && ev.target.closest('#stmap'); if (!m) return; ev.preventDefault(); var r = m.getBoundingClientRect(); stZoom(ev.deltaY < 0 ? 1.12 : 1 / 1.12, ev.clientX - r.left, ev.clientY - r.top); }, { passive: false });
  function viewProgress(d, now) {
    if (ui.sel) return viewDetail(d, now);
    var col = ui.col === 'mu' || ui.col === 'sk' ? ui.col : 'ka', h = '<div class="seg three rise" role="group" aria-label="Sammlung">' + [['ka', 'gem', 'Karten'], ['mu', 'shoulder', 'Muskeln'], ['sk', 'star', 'Skills']].map(function (x) {
      return '<button data-col="' + x[0] + '" aria-pressed="' + (col === x[0]) + '">' + ic(x[1]) + x[2] + '</button>'; }).join('') + '</div>';
    if (col === 'ka') return h + viewCards(d);
    if (col === 'mu') return h + viewMuscles(d);
    return h + viewSkills(d);
  }
  function scl(vals, W, H, col, goal) {
    var mn = Math.min.apply(null, vals.concat(goal ? [goal] : [])), mx = Math.max.apply(null, vals.concat(goal ? [goal] : [])), pad = Math.max(0.4, (mx - mn) * 0.15);
    function Y(v) { return 5 + (H - 10) * (1 - (v - (mn - pad)) / ((mx + pad) - (mn - pad))); }
    function X(i) { return 5 + (W - 10) * (vals.length === 1 ? 1 : i / (vals.length - 1)); }
    return { X: X, Y: Y, mn: mn, mx: mx };
  }
  function monthStats(d, mo) {
    var q = new Date(Date.UTC(new Date(Date.now()).getUTCFullYear(), new Date(Date.now()).getUTCMonth() + mo, 1)), f = q.getTime() / 864e5, dim = new Date(Date.UTC(q.getUTCFullYear(), q.getUTCMonth() + 1, 0)).getUTCDate(), r = { f: f, dim: dim, days: 0, sets: 0, xp: 0, p: 0, k: 0, fd: 0, wk: 0, title: q.toLocaleDateString('de-DE', { month: 'long', year: 'numeric', timeZone: 'UTC' }) }, i;
    for (i = 0; i < dim; i++) {
      var x = d.byDay[f + i]; if (x) { r.days++; r.sets += x.sets || 0; r.xp += x.all || 0; }
      var fs = foodSum(f + i); if (fs.items.length) { r.fd++; r.p += fs.p; r.k += fs.k; }
      if (wdOf(f + i) === 0 && (d.wkc[f + i] || 0) >= WK_GOAL) r.wk++;
    }
    return r;
  }
  function dlt(a, b, unit) { var x = a - b; return b || a ? '<em class="dl ' + (x > 0 ? 'up' : x < 0 ? 'dn' : '') + '">' + (x > 0 ? '▲ ' : x < 0 ? '▼ ' : '') + (x === 0 ? '=' : Math.abs(x)) + (unit || '') + '</em>' : ''; }
  function viewBody(d, now) {
    var st = foodState(), h = '', mo = ui.rm, ms = monthStats(d, mo), pm = monthStats(d, mo - 1), w = st.w, today = dayIdx(now);
    // Rückblick
    var lim0 = ms.f, lim1 = ms.f + ms.dim - 1, prs = [];
    EX.forEach(function (e) {
      var pr = 0, im = 0; state.logs.forEach(function (l) { if (l.e !== e.id) return; var di = dayIdx(l.t), m = Math.max.apply(null, l.s.concat([0])); if (di < lim0) pr = Math.max(pr, m); else if (di <= lim1) im = Math.max(im, m); });
      if (im > pr && pr > 0) prs.push({ e: e, a: pr, b: im });
    });
    prs.sort(function (a, b) { return (b.b / b.a) - (a.b / a.a); });
    var wm = w.filter(function (x) { var di = dayIdx(x.t); return di >= lim0 && di <= lim1; }), wdl = wm.length > 1 ? Math.round((wm[wm.length - 1].kg - wm[0].kg) * 10) / 10 : null;
    h += '<section class="rv rise" style="--i:1"><div class="rv-h"><button class="x" data-rm="-1" aria-label="Vorheriger Monat"' + (mo <= -11 ? ' disabled' : '') + '>' + ic('back') + '</button><div><small>Rückblick</small><b>' + ms.title + '</b></div><button class="x" data-rm="1" aria-label="Nächster Monat"' + (mo >= 0 ? ' disabled' : '') + '>' + ic('chev') + '</button></div>' +
      '<div class="rv-g"><span><b>' + ms.days + '</b>Trainingstage' + dlt(ms.days, pm.days) + '</span><span><b>' + ms.sets + '</b>Sätze' + dlt(ms.sets, pm.sets) + '</span><span><b>' + ms.xp + '</b>XP' + dlt(ms.xp, pm.xp) + '</span><span><b>' + ms.wk + '</b>Wochenziele' + dlt(ms.wk, pm.wk) + '</span>' +
      '<span class="p"><b>' + (ms.fd ? Math.round(ms.p / ms.fd) : '–') + '</b>g Protein Ø' + (ms.fd && pm.fd ? dlt(Math.round(ms.p / ms.fd), Math.round(pm.p / pm.fd)) : '') + '</span><span class="k"><b>' + (ms.fd ? Math.round(ms.k / ms.fd) : '–') + '</b>kcal Ø</span>' +
      (wdl !== null ? '<span class="wd2"><b>' + (wdl > 0 ? '+' : '') + fN(wdl) + '</b>kg Gewicht</span>' : '') + '</div>' +
      (prs.length ? '<div class="rv-pr"><h4>' + ic('trophy') + 'Neue Rekorde</h4>' + prs.slice(0, 4).map(function (x) { return '<div><span>' + esc(x.e.n) + '</span><b>' + x.a + ' → ' + x.b + ' ' + esc(x.e.u) + '</b></div>'; }).join('') + '</div>' : '') + '</section>';
    // Gewicht
    var rng = ui.wr, cut = rng === 'all' ? 0 : today - (+rng), pts = w.filter(function (x) { return dayIdx(x.t) >= cut; });
    h += '<section class="sec rise" style="--i:2"><h2 class="sec-h">' + ic('scale') + 'Gewicht<small>' + w.length + ' Messungen</small></h2><div class="seg three wr">' + [['30', '30 Tage'], ['90', '90 Tage'], ['all', 'Alles']].map(function (o) { return '<button data-wr="' + o[0] + '" aria-pressed="' + (rng === o[0]) + '">' + o[1] + '</button>'; }).join('') + '</div>';
    if (pts.length < 2) h += '<div class="wcard"><p class="muted">' + (w.length ? 'Zu wenige Messungen in diesem Zeitraum.' : 'Noch kein Gewicht eingetragen.') + '</p><button class="btn small" data-wgt="1">' + ic('scale') + 'Wiegen</button></div>';
    else {
      var ema = [], a = 0.3; w.forEach(function (x, i) { ema.push(i ? ema[i - 1] + a * (x.kg - ema[i - 1]) : x.kg); });
      var idx0 = w.length - pts.length, tr = ema.slice(idx0), pr0 = prof(), W = 340, H = 150, vals = pts.map(function (x) { return x.kg; }).concat(tr), sp = scl(vals, W, H, 0, pr0.tw || 0), t0 = pts[0].t, t1 = pts[pts.length - 1].t;
      var X = function (t) { return 6 + (W - 12) * (t1 === t0 ? 1 : (t - t0) / (t1 - t0)); }, Y = sp.Y;
      var rate = null, last28 = w.filter(function (x) { return dayIdx(x.t) >= today - 28; });
      if (last28.length > 1 && daysSince(last28[0].t) - daysSince(last28[last28.length - 1].t) >= 10) { var i0 = w.length - last28.length; rate = (ema[ema.length - 1] - ema[i0]) / ((last28[last28.length - 1].t - last28[0].t) / (7 * 864e5)); }
      var go = pr0.go, okr = rate === null ? null : go === 'bulk' ? (rate >= 0.15 && rate <= 0.6) : go === 'cut' ? (rate <= -0.2 && rate >= -0.8) : Math.abs(rate) <= 0.2;
      var cur = w[w.length - 1], ch = Math.round((cur.kg - pts[0].kg) * 10) / 10;
      h += '<div class="wcard"><div class="wtop"><div><b>' + fN(cur.kg) + '</b><small>kg · ' + (daysSince(cur.t) === 0 ? 'heute' : 'vor ' + daysSince(cur.t) + ' Tagen') + '</small></div><span class="wd ' + (ch > 0 ? 'up' : ch < 0 ? 'dn' : '') + '">' + (ch > 0 ? '+' : '') + fN(ch) + ' kg<small>im Zeitraum</small></span></div>' +
        (rate !== null ? '<div class="rate ' + (okr ? 'ok' : 'off') + '">' + ic(okr ? 'check' : 'bolt') + '<span>' + (rate > 0 ? '+' : '') + fN(Math.round(rate * 100) / 100) + ' kg pro Woche · ' + (okr ? 'im Zielbereich (' + GOLAB[go] + ')' : go === 'bulk' ? (rate < 0.15 ? 'zu langsam für Aufbau' : 'zu schnell, Fett-Anteil steigt') : go === 'cut' ? (rate > -0.2 ? 'zu langsam für Definition' : 'zu schnell, Muskeln schützen') : 'Gewicht driftet') + '</span></div>' : '') +
        '<svg class="wsp big" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Gewichtsverlauf">' + (pr0.tw && pr0.tw >= sp.mn - 1 && pr0.tw <= sp.mx + 1 ? '<line x1="6" x2="' + (W - 6) + '" y1="' + Y(pr0.tw).toFixed(1) + '" y2="' + Y(pr0.tw).toFixed(1) + '" stroke="var(--gold)" stroke-width="1.400" stroke-dasharray="5 4"/>' : '') +
        '<polyline fill="none" stroke="var(--ink3)" stroke-width="1.400" stroke-linejoin="miter" points="' + pts.map(function (o) { return X(o.t).toFixed(1) + ',' + Y(o.kg).toFixed(1); }).join(' ') + '"/>' +
        pts.map(function (o) { return '<rect x="' + (X(o.t) - 2.500).toFixed(1) + '" y="' + (Y(o.kg) - 2.500).toFixed(1) + '" width="5" height="5" fill="var(--s1)" stroke="var(--ink3)" stroke-width="1.300"/>'; }).join('') +
        '<polyline fill="none" stroke="var(--ac)" stroke-width="3" stroke-linejoin="miter" stroke-linecap="butt" points="' + pts.map(function (o, i) { return X(o.t).toFixed(1) + ',' + Y(tr[i]).toFixed(1); }).join(' ') + '"/></svg>' +
        '<div class="wmm"><span>' + fN(sp.mn) + ' kg</span><span class="lg"><i></i>Trend' + (pr0.tw ? ' · <u></u>Ziel ' + fN(pr0.tw) : '') + '</span><span>' + fN(sp.mx) + ' kg</span></div><button class="btn small" data-wgt="1">' + ic('scale') + 'Wiegen</button></div>';
    }
    h += '</section>';
    // Maße
    var mm = st.m;
    h += '<section class="sec rise" style="--i:3"><h2 class="sec-h">' + ic('user') + 'Maße<small>cm</small></h2>';
    var any = false;
    MEAS.forEach(function (mdef) {
      var ser = mm.filter(function (x) { return x[mdef[0]] > 0; }); if (!ser.length) return; any = true;
      var v = ser.map(function (x) { return x[mdef[0]]; }), cu = v[v.length - 1], d0 = Math.round((cu - v[0]) * 10) / 10, dp = v.length > 1 ? Math.round((cu - v[v.length - 2]) * 10) / 10 : null, W = 120, H = 34, sp2 = scl(v, W, H, 0, 0);
      h += '<div class="mrow"><div class="mn"><b>' + mdef[1] + '</b><small>' + (dp !== null ? (dp > 0 ? '+' : '') + fN(dp) + ' zuletzt · ' : '') + (v.length > 1 ? (d0 > 0 ? '+' : '') + fN(d0) + ' gesamt' : 'erste Messung') + '</small></div>' +
        (v.length > 1 ? '<svg viewBox="0 0 ' + W + ' ' + H + '" class="msp"><polyline fill="none" stroke="var(--ac)" stroke-width="2.200" stroke-linejoin="miter" points="' + v.map(function (y, i) { return sp2.X(i).toFixed(1) + ',' + sp2.Y(y).toFixed(1); }).join(' ') + '"/></svg>' : '') + '<b class="mv">' + fN(cu) + '</b></div>';
    });
    if (!any) h += '<p class="muted">Noch keine Maße.</p>';
    h += '<button class="btn small" data-pf="meas">' + ic('plus') + 'Maße eintragen</button></section>';
    return h;
  }
  function sessions(e) {
    var m = {}, arr = [];
    logsOf(e.id).forEach(function (l) {
      var di = dayIdx(l.t), r = metric(e, l.s), o = m[di];
      if (!o) { o = m[di] = { d: di, t: l.t, v: 0, vol: 0, s: [] }; arr.push(o); }
      if (r.val > o.v) o.v = r.val;
      o.vol += l.s.reduce(function (a, x) { return a + setUnits(e, x); }, 0);
      o.s = o.s.concat(l.s);
    });
    arr.sort(function (a, b) { return a.d - b.d; });
    var run = 0;
    arr.forEach(function (o, i) { o.pb = i > 0 && o.v > run; if (o.v > run) run = o.v; });
    return arr;
  }
  function spark(e, t) {
    var ss = sessions(e).slice(-8);
    if (ss.length < 2) return '<svg class="spark" viewBox="0 0 72 26"><line x1="2" x2="70" y1="13" y2="13" stroke="var(--line)" stroke-width="2" stroke-dasharray="2 4"/></svg>';
    var mx = Math.max.apply(null, ss.map(function (o) { return o.v; })), mn = Math.min.apply(null, ss.map(function (o) { return o.v; })), rg = (mx - mn) || 1;
    var pts = ss.map(function (o, i) { return (2 + 68 * i / (ss.length - 1)).toFixed(1) + ',' + (23 - 20 * (o.v - mn) / rg).toFixed(1); });
    return '<svg class="spark" viewBox="0 0 72 26"><polyline points="' + pts.join(' ') + '" fill="none" stroke="var(--tc)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="' + pts[pts.length - 1].split(',')[0] + '" cy="' + pts[pts.length - 1].split(',')[1] + '" r="2.8" fill="var(--tc)"/></svg>';
  }
  function viewDetail(d, now) {
    var e = EXB[ui.sel];
    if (!e) { ui.sel = null; return viewProgress(d, now); }
    var all = sessions(e), t = exTier(d, e), today = dayIdx(now);
    var ls = ui.xr === 'all' ? all : all.filter(function (o) { return o.d >= today - (+ui.xr); });
    if (!ls.length) ls = all.slice(-1);
    if (!ls.length) return '<button class="back" data-back="1">' + ic('back') + 'Zurück</button><div class="dh rise"><h2>' + esc(e.n) + '</h2></div><div class="empty rise">' + ic('chart') + '<b>Noch keine Einheit</b></div>';
    if (ui.pt === null || ui.pt >= ls.length) ui.pt = ls.length - 1;
    var bestAll = all.length ? Math.max.apply(null, all.map(function (o) { return o.v; })) : 0;
    var gainPct = all.length > 1 && all[0].v ? Math.round(100 * (bestAll - all[0].v) / all[0].v) : 0;
    var h = '<button class="back" data-back="1">' + ic('back') + 'Zurück</button><div class="t' + t + ' g' + e.g + '">';
    h += '<div class="dh rise"><h2>' + esc(e.n) + '</h2>' + tchip(t) + '</div>';
    h += '<div class="tiles"><div class="tile rise" style="--i:1"><small>Bestwert</small><b>' + bestAll + '<em>' + e.u + '</em></b></div><div class="tile rise" style="--i:2"><small>Ziel</small><b>' + Math.round(100 * bestAll / e.goal) + '<em>% von ' + e.goal + '</em></b></div>' +
      '<div class="tile rise" style="--i:3"><small>Seit Start</small><b class="' + (gainPct >= 0 ? 'up' : 'dn') + '">' + (gainPct > 0 ? '+' : '') + gainPct + ' %</b></div><div class="tile rise" style="--i:4"><small>Einheiten</small><b>' + all.length + '</b></div></div>';
    h += '<div class="ctl rise" style="--i:5"><span class="rng" role="group" aria-label="Zeitraum">' + [['30', '30 T'], ['90', '90 T'], ['all', 'Alle']].map(function (r) { return '<button data-xr="' + r[0] + '" aria-pressed="' + (ui.xr === r[0]) + '">' + r[1] + '</button>'; }).join('') + '</span>' +
      '<span class="rng" role="group" aria-label="Messwert">' + [['best', 'Bestwert'], ['vol', 'Umfang']].map(function (r) { return '<button data-xm="' + r[0] + '" aria-pressed="' + (ui.xm === r[0]) + '">' + r[1] + '</button>'; }).join('') + '</span></div>';
    h += '<div class="chart rise" style="--i:6">' + exChart(e, ls, ui.xm) + '</div>';
    var p = ls[ui.pt];
    h += '<div class="det rise" style="--i:7"><div class="det-h"><b>' + fmtDayL(p.d) + (p.pb ? ' · Rekord' : '') + '</b><span>' + (ui.xm === 'vol' ? p.vol : p.v) + ' ' + e.u + '</span></div><div class="gchips"><span class="g' + e.g + '">' + p.s.join(' · ') + '</span></div></div></div>';
    var logs = logsOf(e.id);
    h += '<div class="cap">Einträge</div><div class="hist">' + logs.slice(-8).reverse().map(function (l) {
      var idx = state.logs.indexOf(l), sure = ui.del === idx;
      return '<div><span class="d">' + fmtDate(l.t) + '</span><span class="mono">' + esc(setsText(l)) + '</span><button class="xs' + (sure ? ' sure' : '') + '" data-act="del" data-i="' + idx + '">' + (sure ? 'Wirklich?' : 'Löschen') + '</button></div>';
    }).join('') + '</div>';
    return h;
  }
  function exChart(e, pts, mode) {
    var W = 360, H = 226, L = 32, R = 30, T = 14, B = 28, vals = pts.map(function (o) { return mode === 'vol' ? o.vol : o.v; });
    var mxv = Math.max.apply(null, vals), ymax = nice(mode === 'vol' ? mxv * 1.12 : Math.max(e.goal * 1.35, mxv * 1.08));
    var d0 = pts[0].d, d1 = pts[pts.length - 1].d;
    function X(dd) { return d1 === d0 ? (L + W - R) / 2 : L + (W - L - R) * (dd - d0) / (d1 - d0); }
    function Y(v) { return T + (H - T - B) * (1 - v / ymax); }
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Verlauf ' + esc(e.n) + '">';
    if (mode !== 'vol') {
      var th = TH, nm = ['Neu', 'Geü', 'Sta', 'Eli', 'Mei'], sw = SW[Math.min(3, stageOf(e))];
      for (var k = 0; k < 5; k++) {
        var lo = th[k] * e.goal / sw, hi = Math.min(th[k + 1] * e.goal / sw, ymax), kc = TCLS[k];
        if (lo >= ymax) break;
        s += '<rect x="' + L + '" y="' + Y(hi) + '" width="' + (W - L - R) + '" height="' + (Y(lo) - Y(hi)) + '" class="t' + kc + '" style="fill:var(--tc)" fill-opacity="0.13"/>';
        s += '<text x="' + (W - R + 4) + '" y="' + (Y((lo + hi) / 2) + 3) + '" class="t' + kc + '" style="fill:var(--tc);font-size:8.5px">' + nm[k] + '</text>';
      }
    }
    for (var q = 0; q <= 4; q++) {
      var tv = ymax * q / 4, y = Y(tv);
      s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y + '" y2="' + y + '" stroke="var(--line)" stroke-width="1" stroke-dasharray="2 4"/>';
      s += '<text x="' + (L - 6) + '" y="' + (y + 3) + '" text-anchor="end">' + (Math.round(tv * 10) / 10) + '</text>';
    }
    if (mode !== 'vol') {
      var gy = Y(e.goal);
      s += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + gy + '" y2="' + gy + '" stroke="var(--gold)" stroke-width="1.5" stroke-dasharray="5 4"/><text x="' + (L + 4) + '" y="' + (gy - 4) + '" style="fill:var(--gold)">Ziel ' + e.goal + '</text>';
    }
    var line = pts.map(function (o, i) { return X(o.d).toFixed(1) + ',' + Y(vals[i]).toFixed(1); });
    if (pts.length > 1) {
      s += '<polygon points="' + X(d0) + ',' + Y(0) + ' ' + line.join(' ') + ' ' + X(d1) + ',' + Y(0) + '" style="fill:var(--tc)" fill-opacity="0.12"/>';
      s += '<polyline class="draw" pathLength="1" points="' + line.join(' ') + '" fill="none" style="stroke:var(--tc)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>';
    }
    pts.forEach(function (o, i) {
      var tt = mode === 'vol' ? exTierBase(e) : tierOfRatio(o.v / e.goal, e), sel = i === ui.pt;
      s += '<g class="t' + tt + '">';
      if (o.pb && mode !== 'vol') s += '<circle cx="' + X(o.d) + '" cy="' + Y(vals[i]) + '" r="9" fill="none" stroke="var(--gold)" stroke-width="1.5"/>';
      s += '<circle cx="' + X(o.d) + '" cy="' + Y(vals[i]) + '" r="' + (sel ? 6 : 4) + '" style="fill:var(--tc);stroke:var(--s1)" stroke-width="2"/></g>';
      s += '<circle class="bk" data-pt="' + i + '" cx="' + X(o.d) + '" cy="' + Y(vals[i]) + '" r="15" fill="rgba(0,0,0,0)"/>';
    });
    var sp = pts[ui.pt];
    s += '<text x="' + Math.min(Math.max(X(sp.d), L + 10), W - R - 10) + '" y="' + (Y(vals[ui.pt]) - 13) + '" text-anchor="middle" style="fill:var(--ink);font-size:11px">' + vals[ui.pt] + '</text>';
    s += '<text x="' + L + '" y="' + (H - 8) + '">' + fmtDay(d0) + '</text>';
    if (pts.length > 1) s += '<text x="' + (W - R) + '" y="' + (H - 8) + '" text-anchor="end">' + fmtDay(d1) + '</text>';
    return s + '</svg>';
  }
  function exTierBase(e) { return tierOfLevel(level(derive(state.logs).xp)); }

  function viewProfile(d, now) {
    // Profil: kompakte Karte (Level, Körperwerte, 5 Schnellknöpfe) und 4 Statistik-Kacheln; Antippen öffnet die Detailansicht
    if (ui.sel) return viewDetail(d, now);
    var today = dayIdx(now), h = '<div class="fd-h rise" style="--i:0"><h2>Profil</h2><button class="x" data-set="1" aria-label="Einstellungen">' + ic('gear') + '</button></div>';
    if (ui.pstat) {
      var T = { tr: 'Training', kp: 'Körper', er: 'Ernährung', re: 'Rekorde' };
      h += '<button class="pbk rise" data-pstat="">' + ic('back') + 'Profil · <b>' + T[ui.pstat] + '</b></button>';
      return h + (ui.pstat === 're' ? recHtml() : statPage(d, now));
    }
    var p = prof(), lw = lastW(), lv = level(d.xp), c0 = lvXp(lv), c1 = lvXp(lv + 1);
    h += '<section class="pid rise" style="--i:1"><div class="pid-t"><i class="pid-l">' + ic('peak') + '<b>' + lv + '</b></i><div><b>' + (TIERS[tierOfLevel(lv)] || 'Level ' + lv) + '</b><small>' +
      [p.h ? p.h + ' cm' : '', lw ? fN(lw.kg) + ' kg' : '', p.a ? p.a + ' Jahre' : ''].filter(Boolean).join(' · ') + '</small><i class="hcb"><i style="--p:' + ((d.xp - c0) / (c1 - c0)).toFixed(3) + '"></i></i></div></div>' +
      '<div class="pid-a"><button data-wgt="1">' + ic('scale') + 'Gewicht</button>' + [['body', 'user', 'Körper'], ['meas', 'ruler', 'Maße'], ['goal', 'target', 'Ziel'], ['train', 'dumb', 'Geräte']].map(function (x) {
        return '<button data-pf="' + x[0] + '">' + ic(x[1]) + x[2] + '</button>'; }).join('') + '<button data-fgoal="1">' + ic('calc') + 'Rechner</button></div></section>';
    // Statistik-Kacheln: Kernzahl + Mini-Diagramm
    var sets = [], kc = [], nTr = 0, hk = 0, i;
    for (i = 13; i >= 0; i--) {
      var x = d.byDay[today - i], fs = foodSum(today - i), g = foodGoal(today - i);
      sets.push(x ? x.sets || 0 : 0); if (x) nTr++;
      kc.push(fs.items.length ? Math.min(1.5, fs.k / g.k) : 0);
      if (i < 7 && fs.items.length && fs.k >= g.k * 0.9 && fs.k <= g.k * 1.1) hk++;
    }
    var w = foodState().w.filter(function (q) { return dayIdx(q.t) >= today - 30; }), dw = w.length > 1 ? w[w.length - 1].kg - w[0].kg : null;
    var pb = pbList(), pb30 = pb.filter(function (q) { return q.t >= now - 30 * 864e5; }).length, lpb = pb[pb.length - 1];
    function tile(k, icn, name, val, sub, sp) { return '<button class="pstt" data-pstat="' + k + '"><span>' + ic(icn) + name + '</span><b>' + val + '</b><small>' + sub + '</small>' + sp + '</button>'; }
    return h + '<section class="pstg rise" style="--i:2">' +
      tile('tr', 'dumb', 'Training', nTr + '<small>/14</small>', 'Tage aktiv', mspk(sets)) +
      tile('kp', 'scale', 'Körper', dw == null ? '–' : (dw > 0 ? '+' : dw < 0 ? '−' : '±') + fN(Math.abs(dw)) + '<small> kg</small>', '30 Tage', mspk(w.map(function (q) { return q.kg; }), 1)) +
      tile('er', 'food', 'Ernährung', hk + '<small>/7</small>', 'Tage im Ziel', mspk(kc)) +
      tile('re', 'trophy', 'Rekorde', pb30 + '<small> neu</small>', lpb ? esc(lpb.e.n) : 'noch keine', '<i class="pstt-t">' + ic('trophy') + '</i>') + '</section>';
  }
