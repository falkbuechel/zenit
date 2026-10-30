  // ---------- Hilfen
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  // Langer Text in engen Kacheln: erst kleiner (tf1/tf2 setzen --tf), dann Umbruch an Wortgrenzen; Silbentrennung nur als letzter Ausweg
  // n = Zeichen, die bei voller Größe in eine Zeile passen (je nach Kachelbreite). Wort etwas zu lang: kleiner, bis es passt;
  // viel zu lang: nur leicht kleiner und mit Silbentrennung auf zwei Zeilen (lesbarer als winzige Schrift)
  function fitCls(s, n) {
    s = String(s); n = n || 10; var w = s.split(/[\s\-\/]+/).reduce(function (a, x) { return Math.max(a, x.length); }, 0);
    // Klasse fit: fitNames misst nach dem Zeichnen nach; tf1–3 ist nur die Schätzung davor (kein Springen)
    if (s.length > n * 2.6) return 'fit tf3';
    return 'fit' + (w > n * 1.3 ? ' tf3' : w > n * 1.12 || s.length > n * 2.2 ? ' tf2' : w > n || s.length > n * 1.8 ? ' tf1' : '');
  }
  // Namen (Klasse fit): drei Stufen 100 / 88 / 78 %. Gewählt wird die größte, bei der jedes Wort in eine Zeile passt und der Name
  // nicht abgeschnitten wird (Zeilenzahl der Regel). Getrennt wird nur an Leerzeichen und Bindestrich; passt ein Wort selbst bei 78 % nicht: Silbentrennung
  function fitNames(root) {
    var S = [1, 0.88, 0.78];
    (root || document).querySelectorAll('.fit').forEach(function (b) {
      // Zahl und Einheit bleiben zusammen (1,5 %, 500 g)
      var nu = /(\d)[ \t]+(%|g\b|ml\b|kg\b|l\b)/g; if (!b.children.length && nu.test(b.textContent)) b.textContent = b.textContent.replace(nu, '$1' + String.fromCharCode(160) + '$2');
      b.style.setProperty('--tf', '1'); b.style.webkitHyphens = b.style.hyphens = '';
      var cs = getComputedStyle(b), av = b.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight); if (av <= 0) return;
      // breitestes Wort: alle Wörter untereinander in einem unsichtbaren Element
      var m = document.createElement('span'); m.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;display:block;width:auto';
      m.textContent = b.textContent.trim().split(/[ \t\n]+/).join('\n').replace(/-/g, '-\n'); b.appendChild(m);
      var w = m.offsetWidth; b.removeChild(m);
      for (var i = 0; i < S.length; i++) {
        if (w * S[i] > av - 2) continue;
        b.style.setProperty('--tf', S[i]);
        if (b.scrollHeight <= b.clientHeight + 1 && b.scrollWidth <= b.clientWidth + 1) return;
      }
      b.style.setProperty('--tf', S[2]); if (w * S[2] > av - 2) b.style.webkitHyphens = b.style.hyphens = 'auto';
    });
  }
  function fmtDate(ms) { return new Date(ms).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }); }
  function fmtDay(di) { return new Date(di * 864e5).toLocaleDateString('de-DE', { day: 'numeric', month: 'short', timeZone: 'UTC' }); }
  function fmtShort(di) { var q = new Date(di * 864e5); return q.getUTCDate() + '.' + (q.getUTCMonth() + 1) + '.'; }
  function dayHead(di) {
    // Überschrift eines Tages (Plan und Essen): „Mittwoch · Heute“, sonst „Montag · 19. Okt.“
    var t = dayIdx(Date.now()), q = new Date(di * 864e5), w = q.toLocaleDateString('de-DE', { weekday: 'long', timeZone: 'UTC' });
    return w + ' · ' + (di === t ? 'Heute' : di === t + 1 ? 'Morgen' : di === t - 1 ? 'Gestern' : q.toLocaleDateString('de-DE', { day: 'numeric', month: 'short', timeZone: 'UTC' }));
  }
  function fmtDayL(di) { return new Date(di * 864e5).toLocaleDateString('de-DE', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }); }
  function logsOf(id) { return state.logs.filter(function (l) { return l.e === id; }).sort(function (a, b) { return a.t - b.t; }); }
  function setsText(l) { return l.s.join(' · ') + (l.k ? '  (' + l.k + ' kg)' : ''); }
  function goalText(e) { return (e.mode === 'all' ? e.sets + '×' + e.goal : e.goal) + ' ' + e.u; }
  function gOf(k) { return GROUPS.filter(function (g) { return g.k === k; })[0]; }
  function pv(k, p) { p = Math.max(0, Math.min(1, p)); return ' data-k="' + k + '" data-p="' + p.toFixed(4) + '" style="--p:' + p.toFixed(4) + '"'; }
  function streakInfo(now) { return streakCalc(state.logs, now); }
  function msToMidnight(now) { var m = new Date(now); m.setHours(24, 0, 0, 0); return m - now; }
  function cdText(ms) { var h = Math.floor(ms / 36e5), m = Math.floor(ms % 36e5 / 6e4); return h > 0 ? h + ' h ' + (m < 10 ? '0' : '') + m + ' min' : m + ' min'; }
  function todayLog(id, today) {
    var a = state.logs.filter(function (l) { return l.e === id && dayIdx(l.t) === today; }).sort(function (x, y) { return x.t - y.t; });
    return a[a.length - 1] || null;
  }
  function lastBefore(id, today) {
    var a = state.logs.filter(function (l) { return l.e === id && dayIdx(l.t) < today; }).sort(function (x, y) { return x.t - y.t; });
    return a[a.length - 1] || null;
  }
  var P = {
    today: '<path d="M12 3c.6 3 4.600 4.800 4.600 9.200A4.600 4.600 0 0 1 12 17a4.600 4.600 0 0 1-4.600-4.800c0-1.600.7-2.800 1.600-3.800.1 1.400.7 2.300 1.500 2.800C10.400 8 11 5.500 12 3z"/><path d="M7 21h10"/>',
    chart: '<path d="M4 4.500V19.500H20"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
    path: '<path d="M4 19.500h4.500v-4h4v-4h4v-4H20"/><circle cx="19" cy="5" r="1.300"/>',
    pull: '<path d="M3.500 4.500h17"/><path d="M8 4.500v3.500M16 4.500v3.500"/><circle cx="12" cy="10.500" r="2.200"/><path d="M12 12.700V17M9.200 20l2.800-3 2.800 3"/>',
    push: '<path d="M3 19.500h18"/><path d="m5.500 16.500 10.500-5"/><circle cx="18.500" cy="9.600" r="1.900"/><path d="M8 17.700v1.800"/>',
    core: '<rect x="8" y="3.500" width="8" height="17" rx="3.500"/><path d="M8 9h8M8 14.500h8M12 3.500v17"/>',
    dumbbell: '<path d="M6.500 7.500v9M17.500 7.500v9M3.500 10v4M20.500 10v4M6.500 12h11"/>',
    star: '<path d="m12 3.500 2.600 5.400 5.900.8-4.300 4.100 1 5.900L12 16.900l-5.200 2.800 1-5.900L3.500 9.700l5.900-.8L12 3.500z"/>',
    calc: '<rect x="5" y="3.500" width="14" height="17" rx="2.500"/><path d="M8.500 7.500h7M8.500 12h.01M12 12h.01M15.500 12h.01M8.500 16h.01M12 16h.01M15.500 16h.01" stroke-width="2.400"/>',
    caltd: '<rect x="4" y="5" width="16" height="15" rx="2.500"/><path d="M4 9.500h16M8 3.500v3M16 3.500v3"/><rect x="10" y="12.500" width="4" height="4" rx="1" fill="currentColor"/>',
    gem: '<path d="M7 4h10l4 5-9 11L3 9z"/><path d="M3 9h18M9.500 4 8 9l4 11 4-11-1.500-5"/>',
    shoulder: '<circle cx="12" cy="6.500" r="2.800"/><path d="M4 20v-4.500A5.500 5.500 0 0 1 9.500 10h5a5.500 5.500 0 0 1 5.500 5.500V20"/><path d="M8.500 20v-5M15.500 20v-5"/>',
    leg: '<path d="M9 3.500v6.500l-1.500 10h3.500l1.500-6 1.500 6h3.500L15 10V3.500"/><path d="M9 7h6"/>',
    grip: '<path d="M7 11V8.500a1.700 1.700 0 0 1 3.400 0V10M10.400 9.500V7.500a1.700 1.700 0 0 1 3.400 0V10M13.800 9.500V8.500a1.700 1.700 0 0 1 3.400 0V14a6.500 6.500 0 0 1-6.500 6.500H10A5.500 5.500 0 0 1 4.500 15v-2a1.700 1.700 0 0 1 3.400 0"/>',
    ruler: '<rect x="3" y="8" width="18" height="8" rx="1.500"/><path d="M7 8v3M11 8v4M15 8v3M19 8v2"/>',
    snack: '<path d="M12 7.500c-.6-2-2.200-3-3.500-3.200M8.500 8.500C5.500 8.500 4.500 11 4.500 13.500 4.500 17 7 20 9.200 20c1.100 0 1.700-.500 2.800-.500s1.700.500 2.800.500C17 20 19.500 17 19.500 13.500c0-2.500-1-5-4-5-1.600 0-2.300.800-3.500.800S10.100 8.500 8.500 8.500z"/>',
    tag: '<path d="M3.500 12.200V4.500a1 1 0 0 1 1-1h7.700l8.300 8.300-8.700 8.700z"/><circle cx="8" cy="8" r="1.300"/>',
    drop: '<path d="M12 3.500c3 3.800 5.500 7 5.500 10a5.500 5.500 0 0 1-11 0c0-3 2.500-6.200 5.500-10z"/>',
    glass: '<path d="M6 4h12l-1.600 16H7.600z"/><path d="M6.700 10.500h10.600"/>',
    bottle: '<path d="M10 2.500h4v3l1.500 2.200V20.500a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V7.700L10 5.500z"/><path d="M8.500 12.500h7"/>',
    scan: '<path d="M4 8.500V5.500A1.500 1.500 0 0 1 5.500 4H8.500M15.500 4h3A1.500 1.500 0 0 1 20 5.500V8.500M20 15.500v3a1.500 1.500 0 0 1-1.500 1.500h-3M8.500 20h-3A1.500 1.500 0 0 1 4 18.500v-3"/><path d="M8 8.500v7M11 8.500v7M13.500 8.500v7M16 8.500v7"/>',
    globe: '<circle cx="12" cy="12" r="8.500"/><path d="M3.500 12h17M12 3.500c2.600 2.600 2.600 14.400 0 17M12 3.500c-2.600 2.600-2.600 14.400 0 17"/>',
    moon: '<path d="M19 14.500A7.500 7.500 0 0 1 9.500 5 7.500 7.500 0 1 0 19 14.500z"/>',
    back: '<path d="m15 5-7 7 7 7"/>', chev: '<path d="m9 5 7 7-7 7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>', close: '<path d="m6 6 12 12M18 6 6 18"/>',
    check: '<path d="m5 12.500 4.500 4.500L19 7.500"/>', undo: '<path d="M4.500 12a7.500 7.500 0 1 0 2.400-5.500M4.500 4.500v4h4"/>',
    lock: '<rect x="4.500" y="10.500" width="15" height="10" rx="2.500"/><path d="M8 10.500V8a4 4 0 0 1 8 0v2.500"/>',
    trophy: '<path d="M8 4.500h8v5a4 4 0 0 1-8 0v-5zM8 6.500H5.200a2 2 0 0 0 2.200 3.400M16 6.500h2.800a2 2 0 0 1-2.200 3.400M12 13.500v3.500M9 20h6"/>',
    share: '<path d="M12 3.500v11M8 7.500l4-4 4 4M7.500 11H5.500v9.500h13V11h-2"/>', out: '<path d="M9 4.500H4.500v15h15V15M13 4.500h6.500V11M19.500 4.500 11 13"/>', all: '<path d="M4 19.500v-6M10 19.500V9M16 19.500v-9M21 19.500H3"/>',
    bolt: '<path d="M13 3 5.500 13.500H11L10 21l8-11h-5.500z"/>', snow: '<path d="M12 3v18M4.500 7.500l15 9M4.500 16.500l15-9M9.500 4.500 12 7l2.500-2.500M9.500 19.500 12 17l2.500 2.500"/>',
    target: '<circle cx="12" cy="12" r="8.500"/><circle cx="12" cy="12" r="4.500"/><circle cx="12" cy="12" r=".8"/>',
    clock: '<circle cx="12" cy="12" r="8.500"/><path d="M12 7v5l3 2"/>', cart: '<path d="M3.500 4.500h2.400l2.200 10.500h9.400l2-7.500H7"/><circle cx="9.500" cy="19" r="1.300"/><circle cx="16.500" cy="19" r="1.300"/>',up: '<path d="M12 19V6M6 11l6-6 6 6"/>', down: '<path d="M12 5v13M6 13l6 6 6-6"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="2.500"/><path d="M4 9.500h16M8 3.500v3M16 3.500v3"/>', dash: '<path d="M8 12h8"/>',
    peak: '<path d="M3 19 12 4l9 15z"/><path d="m8.500 19 3.500-6 3.500 6"/>', data: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.700 3.100 3 7 3s7-1.300 7-3V6M5 12c0 1.700 3.100 3 7 3s7-1.300 7-3"/>'
  };
  P.edit = '<path d="M4 20h4L19 9l-4-4L4 16v4zM13 7l4 4"/>';
  P.ing = '<path d="M9.500 7H20M9.500 12H20M9.500 17H20"/><circle cx="5" cy="7" r="1.200"/><circle cx="5" cy="12" r="1.200"/><circle cx="5" cy="17" r="1.200"/>';
  P.trash ='<path d="M5 7h14M10 7V4.500h4V7M7 7l1 13h8l1-13"/>';
  P.swap = '<path d="M4 8h13l-3-3M20 16H7l3 3"/>';
  P.roll = '<rect x="3" y="8.500" width="18" height="7" rx="3.500"/><path d="M8 8.500v7M12 8.500v7M16 8.500v7"/>';
  P.food = '<path d="M7 3v7a2 2 0 0 0 2 2v9M11 3v7a2 2 0 0 1-2 2M9 3v6M17 21V3c-2.500 1.500-3.500 4.500-3.500 8H17"/>';
  P.play = '<path d="M8 5.500v13l11-6.500z"/>';
  P.sun = '<circle cx="12" cy="12" r="4"/><path d="M12 3v2.500M12 18.500V21M3 12h2.500M18.500 12H21M5.600 5.600l1.800 1.800M16.600 16.600l1.800 1.800M5.600 18.400l1.800-1.800M16.600 7.400l1.800-1.800"/>';
  P.bike = '<circle cx="6" cy="16" r="3.500"/><circle cx="18" cy="16" r="3.500"/><path d="M6 16l4-8h5l3 8M10 8 9 6H7M13.500 12.500h-5"/>';
  P.scale = '<circle cx="12" cy="12" r="8.500"/><path d="M12 12l3.500-3.500M7.500 12h1M12 7.500v1M16.500 12h-1"/>';
  P.dumb = '<path d="M6.500 8v8M17.500 8v8M3.500 10v4M20.500 10v4M6.500 12h11"/>';
  P.gear = '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>';
  P.user = '<circle cx="12" cy="8.500" r="3.800"/><path d="M4.500 20c.8-3.800 3.700-6 7.500-6s6.700 2.200 7.500 6"/>';
  P.bell = '<path d="M6 16.500V11a6 6 0 0 1 12 0v5.500l1.500 1.500h-15z"/><path d="M10 20.500a2 2 0 0 0 4 0"/>';
  P.skip = '<circle cx="12" cy="12" r="8.500"/><path d="M6 18 18 6"/>';
  P.repl = '<path d="M5 12a7 7 0 0 1 12.200-4.700M19 12a7 7 0 0 1-12.200 4.700"/><path d="M17.500 3.500v4h-4M6.500 20.500v-4h4"/>';
  P.sick = '<path d="M10 14.200V5a2 2 0 0 1 4 0v9.200a4 4 0 1 1-4 0z"/><path d="M12 10.500v6"/>';
  // Urlaub: Sonnenschirm im Sand; Pause: zwei Balken (Knopf im Kalender für Urlaub/Krank)
  P.beach = '<path d="M4 11a8 8 0 0 1 16 0z"/><path d="M12 3v1M12 11l-2.500 9"/><path d="M5 20.500c2-1 4-1 6.500 0s5 1 7.500 0"/>';
  // Tag ändern (Ereignisse): Kalenderblatt mit Plus; In Essen öffnen: Pfeil aus dem Kasten
  P.calev = '<rect x="4" y="5.500" width="16" height="14.500" rx="2.500"/><path d="M8 3.500v4M16 3.500v4M4 10h16M12 12.500v5M9.500 15h5"/>';
  P.open = '<path d="M13.500 5.500H18.500V10.500M18.500 5.500l-7.500 7.500"/><path d="M17 14v4a1.500 1.500 0 0 1-1.500 1.500h-9A1.500 1.500 0 0 1 5 18V9a1.500 1.500 0 0 1 1.500-1.500h4"/>';
  P.search = '<circle cx="10.500" cy="10.500" r="6.500"/><path d="m15.500 15.500 5 5"/>';
  P.cards = '<rect x="7.500" y="3.500" width="12" height="16" rx="2.500"/><path d="M5 6.500 4.500 7a2 2 0 0 0-.200 2.800l6.500 10.400a2 2 0 0 0 2.700.700"/><path d="M13.500 9.500v4M11.500 11.500h4"/>';
  // Nährwerte: kcal Flamme, Protein Keule, Fett zwei Tropfen, Kohlenhydrate drei Körner, Ballaststoffe Spross, Zucker drei Würfel
  P.nk = '<path d="M12 3c1 3.500 6 5.500 6 11a6 6 0 0 1-12 0c0-2.500 1.200-4.200 2.600-5.400.2 1.900 1 3 2.200 3.600C10.300 9 11 5.800 12 3z"/>';
  P.np = '<path d="M10 14c-2.500-2.500-2-7.500 1.500-9.500s8-.5 8.500 3.500-3 7.500-6.500 7.500c-1.300 0-2.500-.5-3.500-1.500z"/><path d="m10 14-4 4"/><path d="M6 18c-.8-.8-2.200-.6-2.600.4-.4 1 .5 2 1.400 1.800-.2.900.8 1.800 1.800 1.400 1-.4 1.200-1.800.4-2.600"/>';
  P.nf = '<path d="M14.500 8c2.600 3.200 4.600 5.800 4.600 8.300a4.600 4.600 0 0 1-9.200 0c0-2.500 2-5.100 4.600-8.300z"/><path d="M9.800 12.800C9 13.300 8.200 13.500 7.500 13.500A3.500 3.500 0 0 1 4 10c0-2 1.500-4 3.500-6.500 1.200 1.500 2.300 2.900 3 4.200"/>';
  P.nc = '<ellipse cx="8.500" cy="9" rx="2.300" ry="4.300" transform="rotate(-30 8.500 9)"/><ellipse cx="15.800" cy="9.500" rx="2.300" ry="4.300" transform="rotate(35 15.800 9.500)"/><ellipse cx="12" cy="16.500" rx="2.300" ry="4.300" transform="rotate(80 12 16.500)"/>';
  P.nfb = '<path d="M12 20.500V12"/><path d="M12 13C11.500 9.500 8.500 7.500 4.500 8c.3 3.800 3.300 5.500 7.500 5z"/><path d="M12 11c.3-3.800 3.300-6.300 7.500-6.300 0 4-3.200 6.300-7.500 6.300z"/>';
  P.nsu = '<rect x="8.500" y="6" width="7" height="7" rx="1.500"/><path d="M8.500 12H5a1.500 1.500 0 0 0-1.500 1.500v4A1.500 1.500 0 0 0 5 19h4a1.500 1.500 0 0 0 1.500-1.500V13M15.500 12H19a1.500 1.500 0 0 1 1.500 1.500v4A1.500 1.500 0 0 1 19 19h-4a1.500 1.500 0 0 1-1.500-1.500V13"/>';
  // Lebensmittel-Kategorien
  P.bread = '<path d="M5 11a4 4 0 0 1 2-7.500h10A4 4 0 0 1 19 11v8.500a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z"/><path d="M9 8.500v.01M12 8.500v.01M15 8.500v.01"/>';
  P.milk = '<path d="M8 3.500h8V6l2 3.500v10a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-10L8 6z"/><path d="M6 9.500h12M8 6h8"/>';
  P.egg = '<path d="M12 3.500c3.500 0 6 5.500 6 10a6 6 0 0 1-12 0c0-4.500 2.500-10 6-10z"/>';
  P.bean = '<path d="M8 4.500c3 0 4 2.500 6.500 3.500 3 1.200 5 3 5 6.500a5.500 5.500 0 0 1-5.500 5.500c-4.500 0-9.500-4-9.500-9.500 0-3.500 1.500-6 3.500-6z"/><path d="M9 9c1 1.500 2.500 2.500 4.500 3"/>';
  P.carrot = '<path d="M14.500 9.500 5 19a1.400 1.400 0 0 1-2-2l9.500-9.500a2.800 2.800 0 0 1 2 2z"/><path d="M15 9c1-.5 3-.2 5.500 1M15 9c.5-1 .2-3-1-5.500M15 9l3.500-3.500M8 13l1.500 1.500"/>';
  P.nut = '<path d="M5 10h14a7 7 0 0 1-14 0z"/><path d="M5 10c0-3 3-5 7-5s7 2 7 5M12 5V3"/>';
  P.candy = '<circle cx="12" cy="12" r="4"/><path d="M8.300 10.500 3.500 8v8l4.800-2.500M15.700 10.500 20.500 8v8l-4.800-2.500"/>';
  P.burger = '<path d="M4.500 10.500a7.500 5.500 0 0 1 15 0z"/><path d="M4 14h16M5 17.500h14v.5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/>';
  P.pot = '<path d="M4 10h16v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M2.500 10h19M9 7c0-1 1-1.500 1-2.500M13 7c0-1 1-1.500 1-2.500"/>';
  // Einzelne Lebensmittel (FICO): Fisch, Fleisch, Käse, Becher (Joghurt/Quark), Schale (Getreide, Reis, Nudeln)
  P.fish = '<path d="M2.500 12c2.500-3.500 6-5.500 9.500-5.500 2.500 0 4.500 1.200 6 3L21 7v10l-3-2.500c-1.500 1.800-3.500 3-6 3-3.500 0-7-2-9.500-5.500z"/><circle cx="7.500" cy="11" r=".8"/>';
  P.steak = '<path d="M6 6.500c3-3 9-3 12 0 3 3 2.500 8-1 10.500-2.500 1.800-5 1-7 2.500-2 1.500-4.500 1-5.500-1-1.200-2.500.500-4-.500-6.500C3.300 10 4 8.500 6 6.500z"/><circle cx="14" cy="10" r="2"/>';
  P.cheese = '<path d="M3.500 17.500V11L17 5.500l3.500 5.500v6.500z"/><path d="M3.500 11h17"/><circle cx="9" cy="14.500" r="1.200"/><circle cx="15" cy="14.800" r=".9"/>';
  P.cup = '<path d="M5.500 9h13l-1.300 10.200a1.500 1.500 0 0 1-1.500 1.300H8.300a1.500 1.500 0 0 1-1.500-1.300z"/><path d="M4.500 6.500h15V9h-15z"/>';
  P.bowl = '<path d="M3.500 11h17a8.500 8.500 0 0 1-17 0z"/><path d="M8 11c0-2 1.500-3.500 3.500-3.500M12.500 11c0-2.500 2-4.500 4.500-4.500"/>';
  // Unterarten der Such-Kategorien (FSUB) und einzelne Lebensmittel
  P.rice = '<path d="M3.500 12h17a8.500 8 0 0 1-17 0z"/><path d="M8 9.500l1-1.200M11.500 8.500l.500-1.500M15 9.500l1-1.200"/>';
  P.pasta = '<path d="M3.500 13h17a8.500 6 0 0 1-17 0z"/><path d="M7 13c0-3 2-5 5-5s5 2 5 5M9.500 13c0-1.700 1.100-2.800 2.500-2.800s2.500 1.100 2.500 2.800M12 3.500V8"/>';
  P.potato = '<path d="M7 5.500c3-2 8-1.500 10.500 1.500s3 8-.500 11-8.500 2.500-11-.500S4 7.500 7 5.500z"/><path d="M9 10h.01M14 8.500h.01M13 14h.01" stroke-width="2.200"/>';
  P.sausage = '<path d="M6.500 17.500c-2-2-2-5 0-7l4-4c2-2 5-2 7 0s2 5 0 7l-4 4c-2 2-5 2-7 0z"/><path d="M5 19l-1.500 1.500M19 5l1.500-1.500"/>';
  P.shrimp = '<path d="M8 6.500c4-2 10 0 10.500 5.500.300 3.500-2 6.500-5.500 6.500-2 0-3.500-1-4-2.500"/><path d="M9 16c1.500-.500 2.500-2 2-3.500-.500-1.300-2-2-3.500-1.500M8 6.500 5 4M8 6.500 4.500 8M13 18.500 12 21M15.500 17.500l1.500 2.500"/>';
  P.tofu = '<path d="M4 8.500 12 4.500l8 4v8l-8 4-8-4z"/><path d="M4 8.500l8 4 8-4M12 12.500v8"/>';
  P.jar = '<rect x="6" y="7.500" width="12" height="13" rx="2.500"/><path d="M7 4h10v3.500H7z"/><path d="M9 13h6"/>';
  P.leaf = '<path d="M5 19C4 11 9 4.500 19.500 4.500 19.500 14 14 19.500 6.500 19.500"/><path d="M5 19c3-4 6-7 10-9.500"/>';
  P.tomato = '<circle cx="12" cy="13.500" r="7"/><path d="M12 6.500V4M9 7l3 1.500L15 7M12 8.500l-2 2M12 8.500l2 2"/>';
  P.banana = '<path d="M4.500 13c3 4 9 5 13.500.500 1.500-1.500 2.300-4 2-6.500l-1-2.500"/><path d="M4.500 13c-.800 1 0 2.300 1 2.700C10 18 15.500 17 18.500 12.500M19 4.500l.500-1.500"/>';
  // Einzelne Lebensmittel (Obst, Gemüse, Eis, Öl): eigene Zeichen statt nur der Unterart
  P.apple = '<path d="M12 7c-2-1.500-6-1.200-7 2.500-1 4 1.500 10 4.500 10.500 1 .200 1.700-.400 2.500-.400s1.500.600 2.500.400c3-.500 5.500-6.500 4.500-10.500C18 5.800 14 5.500 12 7z"/><path d="M12 7c0-2 .500-3.500 2-4.500"/>';
  P.straw = '<path d="M12 7c-4 0-7 1.500-7 4.500 0 4 4 8.500 7 9.500 3-1 7-5.500 7-9.500C19 8.500 16 7 12 7z"/><path d="M9 4l3 3 3-3M12 7V3"/><path d="M9.500 12h.01M14.500 12h.01M12 15h.01M10.500 17.500h.01M13.500 17.500h.01"/>';
  P.berry = '<circle cx="8" cy="15" r="4"/><circle cx="16" cy="15" r="4"/><circle cx="12" cy="7.500" r="3.500"/><path d="M11 6.500l1 1 1-1"/>';
  P.kiwi = '<circle cx="12" cy="12" r="8.500"/><ellipse cx="12" cy="12" rx="3" ry="2.200"/><path d="M12 5.500v1M12 17.500v1M5.500 12h1M17.500 12h1M7.500 7.500l.700.700M15.800 15.800l.700.700M16.500 7.500l-.700.700M8.200 15.800l-.700.700"/>';
  P.broc = '<path d="M10 21l1-7M14 21l-1-7"/><path d="M7 14a3 3 0 0 1-1-5.800A4 4 0 0 1 12 4a4 4 0 0 1 6 4.200A3 3 0 0 1 17 14z"/>';
  P.pepper = '<path d="M12 6c-1.500-1-4.500-1-6 1-2 3-1 9 1.500 12 1.200 1.400 3 1.400 4.500.500 1.500.900 3.300.900 4.500-.500C19 16 20 10 18 7c-1.500-2-4.500-2-6-1z"/><path d="M12 6V3.500c0-.800.700-1.500 1.500-1.500M12 9.500v8"/>';
  P.cucum = '<rect x="2.500" y="9" width="19" height="6" rx="3" transform="rotate(-35 12 12)"/><path d="M8.500 14h.01M12 11.500h.01M15.500 9h.01"/>';
  P.onion = '<path d="M12 4c-1 2-6 4-6 9a6 6 0 0 0 12 0c0-5-5-7-6-9z"/><path d="M12 4V2M10 18.500c-1.500-2-1.500-7.500 2-10.500M14 18.500c1.500-2 1.500-7.500-2-10.500"/>';
  P.mush = '<path d="M3.500 12a8.500 7.500 0 0 1 17 0z"/><path d="M9.500 12v6a2.500 2.500 0 0 0 5 0v-6M9 7.500h.01M14.500 8h.01"/>';
  P.corn = '<path d="M12 3c-2.500 2-3.500 6-3.500 9.500S10 20 12 21c2-1 3.500-5 3.500-8.500S14.500 5 12 3z"/><path d="M9 10h6M9 14h6M12 4v16"/><path d="M8.800 14C6.500 15 5.500 17.500 6 20.500c2-.800 3.500-2.300 4.300-4M15.200 14c2.300 1 3.300 3.500 2.800 6.500-2-.800-3.500-2.300-4.300-4"/>';
  P.peas = '<path d="M4 19C6 11 11.500 5.500 20 4c-1 8.500-6.500 14-15 15.500z"/><circle cx="9" cy="14.500" r="1.600"/><circle cx="12.500" cy="11" r="1.600"/><circle cx="16" cy="7.500" r="1.400"/>';
  P.avo = '<path d="M12 3c-2.500 0-4 3-5 7-1.500 2-2 3.500-2 5a7 7 0 0 0 14 0c0-1.500-.500-3-2-5-1-4-2.500-7-5-7z"/><circle cx="12" cy="15" r="3"/>';
  P.lettuce = '<path d="M12 21c-5 0-8-3.500-8-8 0-3 2-5 4-5.500C8.500 5 10 3.500 12 3.500S15.500 5 16 7.500c2 .500 4 2.500 4 5.500 0 4.500-3 8-8 8z"/><path d="M12 21V10M12 14.500l-3-2.500M12 17.500l3.500-3"/>';
  P.icecr = '<path d="M8 11.500l4 9.500 4-9.500"/><path d="M7 11.500a5 5 0 1 1 10 0z"/>';
  P.oil = '<path d="M10 2h4M10.500 2v3L8 8.500V20a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V8.500L13.500 5V2M8 13h8"/>';
  P.grapes = '<circle cx="9" cy="10" r="2.300"/><circle cx="14" cy="10" r="2.300"/><circle cx="11.500" cy="14" r="2.300"/><circle cx="16.500" cy="14" r="2.300"/><circle cx="14" cy="18" r="2.300"/><path d="M12 7.500 13.500 4l3 1"/>';
  P.citrus = '<circle cx="12" cy="12" r="8"/><path d="M12 4v16M4 12h16M6.300 6.300l11.400 11.400M17.700 6.300 6.300 17.700"/>';
  P.seed = '<path d="M7 5c1.500 1.500 2 3.500 0 5.500C5 8.500 5.500 6.500 7 5zM16 7c1.500 1.500 2 3.500 0 5.500-2-2-1.500-4 0-5.500zM10.500 13c1.500 1.500 2 3.500 0 5.500-2-2-1.500-4 0-5.500z"/>';
  P.choc = '<rect x="5" y="3.500" width="14" height="17" rx="2"/><path d="M5 9.500h14M5 15h14M12 3.500v17"/>';
  P.bar = '<rect x="3" y="8.500" width="18" height="7" rx="2"/><path d="M7.500 8.500l-2 7M18.500 8.500l-2 7M10 12h4"/>';
  P.chips = '<path d="M6 3.500h12l-1 3 1 11-1 3H7l-1-3 1-11z"/><path d="M9.500 11.500c1-1 4-1 5 0M10 14.500h4"/>';
  P.can = '<rect x="7" y="3.500" width="10" height="17" rx="2"/><path d="M7 7h10M7 17h10"/>';
  P.beer = '<path d="M6 7h10v12.500a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z"/><path d="M16 10h2a2 2 0 0 1 2 2v2.500a2 2 0 0 1-2 2h-2M6 7c0-2 1.500-3 3-3 .800-1 3.200-1 4 0 1.500 0 3 1 3 3M9.500 11v6M12.500 11v6"/>';
  P.fries = '<path d="M6 10h12l-1.500 10.500h-9z"/><path d="M8 10 7 4.500M11 10V3.500M14 10l.500-6M16.500 10l1.500-4"/>';
  P.sandw = '<path d="M3.500 9.500 12 4l8.500 5.500z"/><path d="M3.500 13h17M4.500 16.500h15M3.500 9.500V11M20.500 9.500V11"/>';
  P.pizza = '<path d="M4 6c5-2.500 11-2.500 16 0L12 21z"/><path d="M5.500 9c4-1.700 9-1.700 13 0"/><circle cx="10" cy="11.500" r="1"/><circle cx="14" cy="13" r="1"/><circle cx="12" cy="16.500" r=".8"/>';
  P.butter = '<path d="M3.500 14.500 8 10h12.500v5.500a1 1 0 0 1-1 1H4.500a1 1 0 0 1-1-1z"/><path d="M3.500 14.500H16l4.500-4.500M16 14.500v2"/>';
  // Rezept einfügen: Blatt mit Pfeil hinein
  P.paste = '<path d="M9 4.500H6.500a1.500 1.500 0 0 0-1.500 1.500v13a1.500 1.500 0 0 0 1.500 1.500h11a1.500 1.500 0 0 0 1.500-1.500V6a1.500 1.500 0 0 0-1.500-1.500H15"/><rect x="9" y="3" width="6" height="3" rx="1"/><path d="M12 9.500v6M9.500 13l2.500 2.500 2.500-2.500"/>';
  P.rot ='<rect x="7" y="3" width="10" height="18" rx="2.500"/><path d="M3.500 12a8.500 8.500 0 0 0 4 7.200M20.500 12a8.500 8.500 0 0 0-4-7.200"/><path d="M16 4.300l.800.600-.900.600M8 19.700l-.800-.600.900-.600"/>';
  function ic(n, cls) { return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true">' + P[n] + '</svg>'; }
  var FL = '<svg class="ic fill" viewBox="0 0 18 18" aria-hidden="true"><path d="M9 1.500c.5 2.600 4 4.200 4 8A4 4 0 0 1 9 14.500 4 4 0 0 1 5 9.500c0-1.400.6-2.400 1.400-3.300.1 1.200.6 2 1.300 2.400C7.400 6.400 8 3.900 9 1.500z"/></svg>';
  function tchip(t) { return '<span class="tchip t' + t + '">' + TIERS[t] + '</span>'; }

