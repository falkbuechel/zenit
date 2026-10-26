  // ---------- Hilfen
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
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
    scan: '<path d="M4 8.500V5.500A1.500 1.500 0 0 1 5.500 4H8.500M15.500 4h3A1.500 1.500 0 0 1 20 5.500V8.500M20 15.500v3a1.500 1.500 0 0 1-1.500 1.500h-3M8.500 20h-3A1.500 1.500 0 0 1 4 18.500v-3"/><path d="M8 8.500v7M11 8.500v7M13.500 8.500v7M16 8.500v7"/>',
    globe: '<circle cx="12" cy="12" r="8.500"/><path d="M3.500 12h17M12 3.500c2.600 2.600 2.600 14.400 0 17M12 3.500c-2.600 2.600-2.600 14.400 0 17"/>',
    moon: '<path d="M19 14.500A7.500 7.500 0 0 1 9.500 5 7.500 7.500 0 1 0 19 14.500z"/>',
    back: '<path d="m15 5-7 7 7 7"/>', chev: '<path d="m9 5 7 7-7 7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>', close: '<path d="m6 6 12 12M18 6 6 18"/>',
    check: '<path d="m5 12.500 4.500 4.500L19 7.500"/>', undo: '<path d="M4.500 12a7.500 7.500 0 1 0 2.400-5.500M4.500 4.500v4h4"/>',
    lock: '<rect x="4.500" y="10.500" width="15" height="10" rx="2.500"/><path d="M8 10.500V8a4 4 0 0 1 8 0v2.500"/>',
    trophy: '<path d="M8 4.500h8v5a4 4 0 0 1-8 0v-5zM8 6.500H5.200a2 2 0 0 0 2.200 3.400M16 6.500h2.800a2 2 0 0 1-2.200 3.400M12 13.500v3.500M9 20h6"/>',
    out: '<path d="M9 4.500H4.500v15h15V15M13 4.500h6.500V11M19.500 4.500 11 13"/>', all: '<path d="M4 19.500v-6M10 19.500V9M16 19.500v-9M21 19.500H3"/>',
    bolt: '<path d="M13 3 5.500 13.500H11L10 21l8-11h-5.500z"/>', snow: '<path d="M12 3v18M4.500 7.500l15 9M4.500 16.500l15-9M9.500 4.500 12 7l2.500-2.500M9.500 19.500 12 17l2.500 2.500"/>',
    target: '<circle cx="12" cy="12" r="8.500"/><circle cx="12" cy="12" r="4.500"/><circle cx="12" cy="12" r=".8"/>',
    clock: '<circle cx="12" cy="12" r="8.500"/><path d="M12 7v5l3 2"/>', up: '<path d="M12 19V6M6 11l6-6 6 6"/>', down: '<path d="M12 5v13M6 13l6 6 6-6"/>',
    cal: '<rect x="4" y="5" width="16" height="15" rx="2.500"/><path d="M4 9.500h16M8 3.500v3M16 3.500v3"/>', dash: '<path d="M8 12h8"/>',
    peak: '<path d="M3 19 12 4l9 15z"/><path d="m8.500 19 3.500-6 3.500 6"/>', data: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v12c0 1.700 3.100 3 7 3s7-1.300 7-3V6M5 12c0 1.700 3.100 3 7 3s7-1.300 7-3"/>'
  };
  P.edit = '<path d="M4 20h4L19 9l-4-4L4 16v4zM13 7l4 4"/>';
  P.trash = '<path d="M5 7h14M10 7V4.500h4V7M7 7l1 13h8l1-13"/>';
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
  P.search = '<circle cx="10.500" cy="10.500" r="6.500"/><path d="m15.500 15.500 5 5"/>';
  P.cards = '<rect x="7.500" y="3.500" width="12" height="16" rx="2.500"/><path d="M5 6.500 4.500 7a2 2 0 0 0-.200 2.800l6.500 10.400a2 2 0 0 0 2.700.700"/><path d="M13.500 9.500v4M11.500 11.500h4"/>';
  P.rot = '<rect x="7" y="3" width="10" height="18" rx="2.500"/><path d="M3.500 12a8.500 8.500 0 0 0 4 7.200M20.500 12a8.500 8.500 0 0 0-4-7.200"/><path d="M16 4.300l.800.600-.900.600M8 19.700l-.800-.600.900-.600"/>';
  function ic(n, cls) { return '<svg class="ic' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true">' + P[n] + '</svg>'; }
  var FL = '<svg class="ic fill" viewBox="0 0 18 18" aria-hidden="true"><path d="M9 1.500c.5 2.600 4 4.200 4 8A4 4 0 0 1 9 14.500 4 4 0 0 1 5 9.500c0-1.400.6-2.400 1.400-3.300.1 1.200.6 2 1.300 2.400C7.400 6.400 8 3.900 9 1.500z"/></svg>';
  function tchip(t) { return '<span class="tchip t' + t + '">' + TIERS[t] + '</span>'; }

