/* ═══ LEDGR Live Layer ══════════════════════════════════════════════════════
 * Depends on: ledgr-ws.js (loaded first)
 * Pages: /home/ (tickerText, onlineCount), /leaderboard/ (lv-ticker, lbContainer)
 *
 * Rarity-aware event handling:
 *   1 (ambient)  → ticker text update only
 *   2 (subtle)   → sidebar card, normal green
 *   3 (medium)   → sidebar card with glow, ticker prepend
 *   4 (prestige) → gold sidebar card, ticker highlight
 *   5 (moment)   → special sidebar card + brief page flash
 * ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var API = 'https://ledgr-backend-7hmh.onrender.com';
  var IS_HOME = !!document.getElementById('tickerText');
  var IS_LB   = !!document.getElementById('lbContainer');

  var AV_COLORS = [
    'linear-gradient(135deg,#7c3aed,#a855f7)',
    'linear-gradient(135deg,#059669,#10b981)',
    'linear-gradient(135deg,#b45309,#f59e0b)',
    'linear-gradient(135deg,#0369a1,#38bdf8)',
    'linear-gradient(135deg,#dc2626,#ef4444)',
    'linear-gradient(135deg,#0f766e,#14b8a6)',
    'linear-gradient(135deg,#7c3aed,#ec4899)',
  ];

  // ── Inject CSS ───────────────────────────────────────────────────────────────
  if (!document.getElementById('lv-styles')) {
    var s = document.createElement('style');
    s.id = 'lv-styles';
    s.textContent = [
      '/* ═══ LEDGR LIVE LAYER ══════════════════════════════════════════ */',

      // Leaderboard injected ticker
      '#lv-ticker{border-top:1px solid rgba(184,159,255,.1);border-bottom:1px solid rgba(184,159,255,.1);background:rgba(255,255,255,.012)}',
      '.lv-ticker-inner{max-width:1100px;margin:0 auto;padding:6px 24px;display:flex;align-items:center;gap:12px;overflow:hidden}',
      '.lv-scroll{overflow:hidden;flex:1}',
      '.lv-msgs{display:flex;gap:48px;white-space:nowrap;animation:lv-tick 20s linear infinite;font-family:\'DM Mono\',monospace;font-size:9px;color:rgba(106,102,144,.85)}',
      '.lv-msgs b{color:#9590b8}',
      '@keyframes lv-tick{from{transform:translateX(0)}to{transform:translateX(-50%)}}',
      '.lv-online-lbl{font-family:\'DM Mono\',monospace;font-size:9px;color:#34d399;flex-shrink:0;letter-spacing:1px}',

      // Shared pulsing dot
      '.lv-dot{width:5px;height:5px;background:#34d399;border-radius:50%;flex-shrink:0;display:inline-block;animation:lv-blink 1.5s infinite}',
      '@keyframes lv-blink{0%,100%{opacity:1}50%{opacity:.35}}',

      // Active tipster dots on leaderboard rows
      '.lv-active-dot{width:6px;height:6px;background:#34d399;border-radius:50%;display:inline-block;flex-shrink:0;opacity:.65}',
      '.lv-av-active{box-shadow:0 0 0 1px rgba(52,211,153,.3)!important}',

      // Wins sidebar
      '.lv-sidebar{position:fixed;bottom:28px;right:24px;z-index:800;width:272px;pointer-events:none}',
      '@media(max-width:640px){.lv-sidebar{display:none}}',
      '.lv-sb-header{display:flex;align-items:center;gap:6px;margin-bottom:6px;padding:0 2px}',
      '.lv-sb-title{font-family:\'DM Mono\',monospace;font-size:9px;letter-spacing:2px;color:rgba(52,211,153,.7);text-transform:uppercase}',

      // Win cards — base
      '.lv-win-card{background:rgba(12,10,26,.96);border:1px solid rgba(52,211,153,.18);border-radius:12px;padding:12px 14px;display:flex;align-items:center;gap:10px;box-shadow:0 8px 32px rgba(0,0,0,.5);transform:translateX(110%);opacity:0;transition:transform .45s cubic-bezier(.34,1.1,.64,1),opacity .35s ease;pointer-events:auto;cursor:default}',
      '.lv-win-card.lv-visible{transform:translateX(0);opacity:1}',
      '.lv-win-av{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:\'Bebas Neue\',sans-serif;font-size:13px;color:#fff;flex-shrink:0}',
      '.lv-win-info{flex:1;min-width:0}',
      '.lv-win-user{font-weight:700;font-size:11px;color:#f0edff;margin-bottom:1px}',
      '.lv-win-event{font-size:10px;color:#8b87a8;font-family:\'DM Mono\',monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px}',
      '.lv-win-meta{font-family:\'DM Mono\',monospace;font-size:9px;color:#544f6e}',
      '.lv-win-pnl{color:#34d399;font-weight:700}',
      '.lv-win-badge{font-family:\'Bebas Neue\',sans-serif;font-size:11px;letter-spacing:1px;color:#34d399;background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.2);border-radius:4px;padding:3px 7px;flex-shrink:0}',

      // Rarity 2: subtle green glow
      '.lv-win-card.lv-r2{border-color:rgba(52,211,153,.32)}',

      // Rarity 3: medium glow
      '.lv-win-card.lv-r3{border-color:rgba(52,211,153,.5);box-shadow:0 8px 32px rgba(0,0,0,.5),0 0 20px rgba(52,211,153,.1)}',
      '.lv-win-card.lv-r3 .lv-win-badge{background:rgba(52,211,153,.15);border-color:rgba(52,211,153,.35)}',

      // Rarity 4: prestige gold
      '.lv-win-card.lv-r4{border-color:rgba(251,191,36,.45);background:rgba(14,11,28,.98);box-shadow:0 8px 36px rgba(0,0,0,.6),0 0 24px rgba(251,191,36,.1)}',
      '.lv-win-card.lv-r4 .lv-win-badge{background:rgba(251,191,36,.12);border-color:rgba(251,191,36,.3);color:#fbbf24}',
      '.lv-win-card.lv-r4 .lv-win-pnl{color:#fbbf24}',
      '.lv-win-card.lv-r4 .lv-win-user{color:#fde68a}',

      // Rarity 5: moment — purple/gold
      '.lv-win-card.lv-r5{border-color:rgba(184,159,255,.6);background:linear-gradient(135deg,rgba(12,10,26,.99),rgba(21,18,42,.99));box-shadow:0 8px 40px rgba(0,0,0,.7),0 0 32px rgba(184,159,255,.18)}',
      '.lv-win-card.lv-r5 .lv-win-badge{background:rgba(184,159,255,.15);border-color:rgba(184,159,255,.4);color:#b89fff;letter-spacing:2px}',
      '.lv-win-card.lv-r5 .lv-win-pnl{color:#b89fff}',
      '.lv-win-card.lv-r5 .lv-win-user{color:#f0edff}',

      // Moment flash overlay (rarity 5)
      '#lv-moment-flash{position:fixed;inset:0;z-index:9999;pointer-events:none;opacity:0;transition:opacity .15s ease}',
      '#lv-moment-flash.lv-flash-in{opacity:1}',
      '#lv-moment-flash.lv-flash-out{opacity:0;transition:opacity .6s ease}',
    ].join('');
    document.head.appendChild(s);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────
  function avColor(username) {
    var h = 0;
    for (var i = 0; i < username.length; i++) h = (h * 31 + username.charCodeAt(i)) % AV_COLORS.length;
    return AV_COLORS[h];
  }

  function divisionName(t) {
    var roi = t.roi || 0;
    var wr  = (t.wins + t.losses) > 0 ? (t.wins / (t.wins + t.losses)) * 100 : 0;
    var sc  = Math.round(
      Math.min(40, Math.max(0, (roi / 20) * 40)) +
      Math.min(30, Math.max(0, (wr / 70) * 30)) +
      Math.min(20, Math.max(0, (t.picks / 100) * 20)) +
      Math.min(10, t.picks)
    );
    if (sc >= 92) return 'LEGENDARY';
    if (sc >= 80) return 'ELITE';
    if (sc >= 65) return 'DIAMOND';
    if (sc >= 50) return 'PLATINUM';
    if (sc >= 35) return 'GOLD';
    if (sc >= 20) return 'SILVER';
    return 'BRONZE';
  }

  // ── Ticker state ─────────────────────────────────────────────────────────────
  var _tickerMsgs = [];
  var MAX_TICKER  = 24;

  function _buildHistoricalMsgs(picks) {
    var msgs = [];
    var tmap = {};
    picks.forEach(function (p) {
      var u = p.user && p.user.username;
      if (!u) return;
      if (!tmap[u]) tmap[u] = { username: u, wins: 0, losses: 0, picks: 0, stake: 0, pnl: 0, all: [] };
      tmap[u].picks++; tmap[u].all.push(p);
      tmap[u].stake += p.stake || 0;
      tmap[u].pnl   += p.pnl   || 0;
      if (p.result === 'win')  tmap[u].wins++;
      if (p.result === 'loss') tmap[u].losses++;
    });
    Object.values(tmap).forEach(function (t) {
      var settled = t.all.filter(function (p) { return p.result !== 'pending'; })
        .sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
      var streak = 0;
      for (var i = 0; i < settled.length; i++) { if (settled[i].result === 'win') streak++; else break; }
      t.streak = streak;
      t.roi = t.stake > 0 ? (t.pnl / t.stake) * 100 : 0;
    });
    var tipsters = Object.values(tmap);
    var now = Date.now();

    // Streak messages (rarity 2+)
    tipsters.filter(function (t) { return t.streak >= 3; })
      .sort(function (a, b) { return b.streak - a.streak; }).slice(0, 4)
      .forEach(function (t) {
        if      (t.streak >= 7) msgs.push('🔥🔥 <b>@' + t.username + '</b> — <b>' + t.streak + '-win streak</b>');
        else if (t.streak >= 5) msgs.push('🔥 <b>@' + t.username + '</b> on a <b>' + t.streak + '-0</b> run');
        else                    msgs.push('⚡ <b>@' + t.username + '</b> · <b>' + t.streak + '-win streak</b>');
      });

    // Top ROI
    var qualified = tipsters.filter(function (t) { return t.picks >= 5 && t.stake > 0; })
      .sort(function (a, b) { return b.roi - a.roi; });
    if (qualified.length) {
      var top = qualified[0];
      msgs.push('📈 <b>@' + top.username + '</b> leads · <b>+' + top.roi.toFixed(1) + '% ROI</b>');
    }

    // Division highlights (Gold+)
    tipsters.filter(function (t) { return t.picks >= 5; }).slice(0, 6).forEach(function (t) {
      var d = divisionName(t);
      if      (d === 'LEGENDARY') msgs.push('🐐 <b>@' + t.username + '</b> · <b>LEGENDARY</b>');
      else if (d === 'ELITE')     msgs.push('🔱 <b>@' + t.username + '</b> · <b>ELITE</b>');
      else if (d === 'DIAMOND')   msgs.push('💎 <b>@' + t.username + '</b> · <b>DIAMOND</b>');
      else if (d === 'PLATINUM')  msgs.push('⚡ <b>@' + t.username + '</b> · <b>PLATINUM</b>');
    });

    // Recent big wins (last 48h)
    picks.filter(function (p) {
      return p.user && p.result === 'win' && (now - new Date(p.createdAt).getTime()) < 172800000;
    }).forEach(function (p) {
      var pnl = parseFloat(p.pnl) || 0;
      var odds = parseFloat(p.odds) || 0;
      var evt  = p.event.length > 28 ? p.event.slice(0, 26) + '…' : p.event;
      if      (pnl >= 10)   msgs.push('💥 <b>@' + p.user.username + '</b> banked <b>+' + pnl.toFixed(1) + 'u</b> — ' + evt);
      else if (odds >= 3.5) msgs.push('🎯 Underdog cash — <b>@' + p.user.username + '</b> @ <b>' + odds.toFixed(2) + '</b>');
      else if (pnl >= 3)    msgs.push('✅ <b>@' + p.user.username + '</b> · ' + evt + ' @ <b>' + odds.toFixed(2) + '</b>');
    });

    // Shuffle
    for (var i = msgs.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = msgs[i]; msgs[i] = msgs[j]; msgs[j] = tmp;
    }

    return msgs.length ? msgs : ['🔥 Real picks · Verified records · Climb the leaderboard'];
  }

  function _setTickerEl(elId, msgs) {
    var el = document.getElementById(elId);
    if (!el) return;
    var doubled = msgs.concat(msgs).map(function (m) { return '<span>' + m + '</span>'; }).join('');
    el.innerHTML = doubled;
    // Set duration for 40px/s scroll speed (el scrolls by 50% of its own width)
    requestAnimationFrame(function() {
      var w = el.scrollWidth * 0.5;
      if (w > 0) el.style.animationDuration = Math.max(8, Math.round(w / 40)) + 's';
    });
  }

  function _refreshTicker() {
    if (IS_LB)   _setTickerEl('lv-msgs',    _tickerMsgs);
    if (IS_HOME) _setTickerEl('tickerText', _tickerMsgs);
  }

  // Prepend a new message (rarity 2+) without rebuilding the whole ticker
  function _prependTickerMsg(msg) {
    _tickerMsgs.unshift(msg);
    if (_tickerMsgs.length > MAX_TICKER) _tickerMsgs.length = MAX_TICKER;
    _refreshTicker();
  }

  // ── Online count ─────────────────────────────────────────────────────────────
  var _lastOnlineUpdate = 0;
  function _setOnline(n) {
    var now = Date.now();
    if (now - _lastOnlineUpdate < 45000) return;
    _lastOnlineUpdate = now;
    var label = n + ' online';
    var homeEl = document.getElementById('onlineCount');
    if (homeEl) homeEl.textContent = label;
    var lbEl = document.getElementById('lv-online');
    if (lbEl) lbEl.textContent = label;
  }

  // ── Sidebar ──────────────────────────────────────────────────────────────────
  var _sidebarReady  = false;
  var _historyQueue  = [];   // picks from cold fetch (fallback)
  var _liveQueue     = [];   // real WS events (priority)
  var _historyIdx    = 0;
  var _historySkip   = false;
  var _cycleTimer    = null;

  function _initSidebar() {
    if (_sidebarReady || document.getElementById('lv-sidebar')) return;
    _sidebarReady = true;
    var sidebar = document.createElement('div');
    sidebar.id        = 'lv-sidebar';
    sidebar.className = 'lv-sidebar';
    sidebar.innerHTML =
      '<div class="lv-sb-header"><span class="lv-dot"></span><span class="lv-sb-title">Live</span></div>' +
      '<div id="lv-sb-feed"></div>';
    document.body.appendChild(sidebar);
    _cycleSidebar();
    _cycleTimer = setInterval(_cycleSidebar, 7000);
  }

  function _buildCard(opts) {
    // opts: { user, eventLabel, meta, pnl, badgeText, rarity }
    var rarity  = opts.rarity || 1;
    var ci      = opts.user.charCodeAt(0) % AV_COLORS.length;
    var av      = opts.user.slice(0, 2).toUpperCase();
    var classes = 'lv-win-card lv-r' + Math.max(1, Math.min(5, rarity));

    var card = document.createElement('div');
    card.className = classes;
    card.innerHTML =
      '<div class="lv-win-av" style="background:' + AV_COLORS[ci] + '">' + av + '</div>' +
      '<div class="lv-win-info">' +
        '<div class="lv-win-user">@' + opts.user + '</div>' +
        '<div class="lv-win-event">' + (opts.eventLabel || '') + '</div>' +
        '<div class="lv-win-meta">' + (opts.meta || '') + (opts.pnl != null ? ' <span class="lv-win-pnl">+' + parseFloat(opts.pnl).toFixed(1) + 'u</span>' : '') + '</div>' +
      '</div>' +
      '<div class="lv-win-badge">' + (opts.badgeText || 'WIN') + '</div>';
    return card;
  }

  function _showCard(card) {
    var feed = document.getElementById('lv-sb-feed');
    if (!feed) return;

    var old = feed.querySelector('.lv-win-card');
    if (old) {
      old.style.transition = 'transform .3s ease,opacity .3s ease';
      old.style.transform  = 'translateX(110%)';
      old.style.opacity    = '0';
      setTimeout(function () { if (old.parentNode) old.parentNode.removeChild(old); }, 320);
    }

    feed.appendChild(card);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { card.classList.add('lv-visible'); });
    });
  }

  function _cycleSidebar() {
    if (!_sidebarReady) return;

    // Rarity 1 WS events don't get a sidebar card — drain them silently
    while (_liveQueue.length && _liveQueue[0]._rarity <= 1) _liveQueue.shift();

    if (_liveQueue.length) {
      // Real event — show it; reset skip so history resumes at natural pace
      _historySkip = false;
      var ev = _liveQueue.shift();
      _showCard(_buildCardFromEvent(ev));
    } else if (_historyQueue.length) {
      // Fallback: historical picks cycle every other tick (effective 14s gap)
      if (_historySkip) { _historySkip = false; return; }
      _historySkip = true;
      var p = _historyQueue[_historyIdx % _historyQueue.length];
      _historyIdx++;
      _showCard(_buildCardFromPick(p));
    }
  }

  function _buildCardFromEvent(ev) {
    var p  = ev.payload || {};
    var r  = ev._rarity || 1;
    var t  = ev.type;
    var u  = ev.username || '';

    var label = '', meta = '', badge = '', pnl = null;

    if (t === 'pick_win' || t === 'big_win') {
      label = (p.event || '').slice(0, 32);
      meta  = '@ ' + parseFloat(p.odds || 0).toFixed(2);
      pnl   = p.pnl;
      badge = t === 'big_win' ? '🔥 BIG WIN' : 'WIN';
    } else if (t === 'underdog_hit') {
      label = (p.event || '').slice(0, 32);
      meta  = '@ ' + parseFloat(p.odds || 0).toFixed(2);
      pnl   = p.pnl;
      badge = '👑 UNDERDOG';
    } else if (t === 'streak_milestone') {
      label = p.streak + '-win streak';
      meta  = '';
      badge = 'W' + p.streak;
    } else if (t === 'division_up') {
      label = '→ ' + p.toDivision;
      meta  = 'Division promoted';
      badge = p.toDivision === 'LEGENDARY' ? '🐐' : p.toDivision === 'ELITE' ? '🔱' : '💎';
    } else if (t === 'rank_up') {
      label = 'Moved to #' + p.newRank;
      meta  = 'from #' + p.oldRank;
      badge = '#' + p.newRank;
    } else if (t === 'milestone_pick') {
      label = p.count + '-pick milestone';
      meta  = 'Track record growing';
      badge = '🎯 ' + p.count;
    }

    return _buildCard({ user: u, eventLabel: label, meta: meta, pnl: pnl, badgeText: badge, rarity: r });
  }

  function _timeAgo(ts) {
    var d = Date.now() - ts;
    var h = Math.floor(d / 3600000);
    var m = Math.floor(d / 60000);
    if (h >= 24) return Math.floor(h / 24) + 'd ago';
    if (h >= 1) return h + 'h ago';
    if (m >= 1) return m + 'm ago';
    return 'just now';
  }

  function _buildCardFromPick(p) {
    var u    = p.user.username;
    var odds = parseFloat(p.odds).toFixed(2);
    var pnl  = parseFloat(p.pnl).toFixed(1);
    var evt  = p.event.length > 30 ? p.event.slice(0, 28) + '…' : p.event;
    var ts   = new Date(p.createdAt).getTime();
    return _buildCard({ user: u, eventLabel: evt, meta: '@ ' + odds + ' · ' + _timeAgo(ts), pnl: pnl, badgeText: 'WIN', rarity: 2 });
  }

  // ── Rarity 5: momentary page flash (non-intrusive) ───────────────────────────
  function _flashMoment(rarity) {
    if (rarity < 5) return;
    if (!window.LedgrWS || !window.LedgrWS.isVisible()) return;
    var el = document.getElementById('lv-moment-flash');
    if (!el) {
      el = document.createElement('div');
      el.id = 'lv-moment-flash';
      el.style.cssText = 'position:fixed;inset:0;z-index:9999;pointer-events:none;opacity:0;transition:opacity .15s ease;background:radial-gradient(ellipse at 50% 30%,rgba(184,159,255,.12),transparent 70%)';
      document.body.appendChild(el);
    }
    el.style.transition = 'opacity .15s ease';
    el.style.opacity    = '1';
    setTimeout(function () {
      el.style.transition = 'opacity .8s ease';
      el.style.opacity    = '0';
    }, 200);
  }

  // ── Active dots on leaderboard ────────────────────────────────────────────────
  function _initActiveDots(activeTipsters) {
    var container = document.getElementById('lbContainer');
    if (!container) return;

    function addDots() {
      var rows = container.querySelectorAll('.lb-row:not([data-lv])');
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        row.setAttribute('data-lv', '1');
        var nameEl = row.querySelector('.tip-name');
        if (!nameEl) continue;
        var match = (nameEl.textContent || '').match(/@([A-Za-z0-9_]+)/);
        if (!match || !activeTipsters[match[1]]) continue;
        var dot = document.createElement('span');
        dot.className = 'lv-active-dot';
        dot.title     = 'Active recently';
        nameEl.insertBefore(dot, nameEl.firstChild);
        var av = row.querySelector('.av');
        if (av) av.classList.add('lv-av-active');
      }
    }

    addDots();
    new MutationObserver(addDots).observe(container, { childList: true, subtree: true });
  }

  // ── Leaderboard: in-place row updates from WS events ─────────────────────────
  function _patchLbRow(username, ev) {
    var container = document.getElementById('lbContainer');
    if (!container) return;
    var rows = container.querySelectorAll('.lb-row');
    for (var i = 0; i < rows.length; i++) {
      var nameEl = rows[i].querySelector('.tip-name');
      if (!nameEl) continue;
      var m = (nameEl.textContent || '').match(/@([A-Za-z0-9_]+)/);
      if (!m || m[1] !== username) continue;

      var p = ev.payload || {};

      // Update streak display
      if (ev.type === 'streak_milestone') {
        var streakEl = rows[i].querySelector('.streak-col');
        if (streakEl) {
          streakEl.textContent = '🔥 W' + p.streak;
          streakEl.style.transition = 'color .4s';
          streakEl.style.color = '#fb923c';
          setTimeout(function (el) { el.style.color = ''; }, 2000, streakEl);
        }
      }

      // Update ELO/score cell (via animateElo if available)
      if (ev.type === 'rank_up' && p.newRank) {
        var rankEl = rows[i].querySelector('.rank-num');
        if (rankEl && window.animateElo) window.animateElo(rankEl, p.newRank);
      }

      break;
    }
  }

  // ── WS event routing ──────────────────────────────────────────────────────────
  function _wireWS() {
    if (!window.LedgrWS) return;

    // All broadcast event types that reach this layer
    var SIDEBAR_TYPES = ['pick_win', 'big_win', 'underdog_hit', 'streak_milestone', 'division_up', 'rank_up', 'milestone_pick'];
    var TICKER_MIN_RARITY = 2;

    window.LedgrWS.on('online_count', function (ev) {
      _setOnline(ev.n != null ? ev.n : (ev.payload && ev.payload.n));
    });

    SIDEBAR_TYPES.forEach(function (type) {
      window.LedgrWS.on(type, function (ev) {
        if (!window.LedgrWS.isVisible()) return;  // tab hidden — suppress UI, keep processing

        var rarity = ev._rarity || 1;

        // Sidebar queue — rarity 1 is filtered in _cycleSidebar
        _liveQueue.push(ev);
        if (_liveQueue.length > 30) _liveQueue.shift();

        // Ticker: rarity 2+ gets a live message
        if (rarity >= TICKER_MIN_RARITY) {
          var msg = _buildTickerMsg(ev);
          if (msg) _prependTickerMsg(msg);
        }

        // Leaderboard: in-place row patch
        if (IS_LB && ev.username) _patchLbRow(ev.username, ev);

        // Rarity 5: page flash
        if (rarity >= 5) _flashMoment(rarity);
      });
    });
  }

  function _buildTickerMsg(ev) {
    var p = ev.payload || {};
    var u = '<b>@' + ev.username + '</b>';
    var r = ev._rarity || 1;

    switch (ev.type) {
      case 'big_win':
        return (r >= 4 ? '💥 ' : '✅ ') + u + ' banked <b>+' + parseFloat(p.pnl || 0).toFixed(1) + 'u</b> · ' + (p.event || '').slice(0, 24);
      case 'underdog_hit':
        return '🎯 Underdog hit — ' + u + ' @ <b>' + parseFloat(p.odds || 0).toFixed(2) + '</b>';
      case 'streak_milestone':
        if (p.streak >= 10) return '🔥🔥🔥 ' + u + ' — <b>' + p.streak + '-WIN STREAK</b> — unstoppable';
        if (p.streak >= 7)  return '🔥🔥 ' + u + ' · <b>' + p.streak + ' straight wins</b>';
        return '🔥 ' + u + ' on a <b>' + p.streak + '-win streak</b>';
      case 'division_up':
        return '🏆 ' + u + ' promoted to <b>' + p.toDivision + '</b>';
      case 'rank_up':
        return (p.newRank === 1 ? '👑' : p.newRank <= 3 ? '⚡' : '📈') + ' ' + u + ' moved to <b>#' + p.newRank + '</b>';
      case 'milestone_pick':
        return '🎯 ' + u + ' · <b>' + p.count + '-pick</b> milestone reached';
      case 'pick_win':
        return '✅ ' + u + ' · ' + (p.event || '').slice(0, 28) + ' @ <b>' + parseFloat(p.odds || 0).toFixed(2) + '</b>';
      default:
        return null;
    }
  }

  // ── Pause ticker animation when off-screen ────────────────────────────────────
  function _observeTicker(elId) {
    if (!('IntersectionObserver' in window)) return;
    var el = document.getElementById(elId);
    if (!el) return;
    var container = el.parentElement || el;
    new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        el.style.animationPlayState = e.isIntersecting ? 'running' : 'paused';
      });
    }, {threshold: 0}).observe(container);
  }

  // ── Ticker inject for LB ──────────────────────────────────────────────────────
  function _injectLBTicker() {
    if (document.getElementById('lv-ticker')) return;
    var main = document.querySelector('.main');
    if (!main || !main.parentNode) return;
    var wrap = document.createElement('div');
    wrap.id = 'lv-ticker';
    wrap.innerHTML =
      '<div class="lv-ticker-inner">' +
        '<span class="lv-dot"></span>' +
        '<span class="lv-online-lbl" id="lv-online">— online</span>' +
        '<div class="lv-scroll"><div class="lv-msgs" id="lv-msgs"><span>Loading…</span><span>Loading…</span></div></div>' +
      '</div>';
    main.parentNode.insertBefore(wrap, main);
  }

  // ── Boot ─────────────────────────────────────────────────────────────────────
  async function init() {
    try {
      if (IS_LB) _injectLBTicker();

      // Wire WS handlers first (before fetch, so events during fetch aren't missed)
      _wireWS();

      // Cold fetch for initial ticker + sidebar history
      var r = await fetch(API + '/picks', { cache: 'no-store' });
      var picks = await r.json();
      if (!Array.isArray(picks)) return;

      _tickerMsgs = _buildHistoricalMsgs(picks);
      _refreshTicker();
      _observeTicker('lv-msgs');
      _observeTicker('tickerText');

      // Online count: server will push real count, show reasonable placeholder from picks
      // Active in last 7 days (not faked with multiplier)
      var now = Date.now();
      var active = {};
      picks.forEach(function (p) {
        if (now - new Date(p.createdAt).getTime() < 604800000 && p.user && p.user.username)
          active[p.user.username] = 1;
      });
      _setOnline(Object.keys(active).length);

      // Sidebar: populate history queue with recent wins (fallback for idle periods)
      setTimeout(function () {
        _historyQueue = picks
          .filter(function (p) { return p.user && p.result === 'win'; })
          .sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); })
          .slice(0, 30);
        _initSidebar();
      }, 1800);

      // Active dots on leaderboard
      if (IS_LB) {
        var active48 = {};
        picks.forEach(function (p) {
          if (now - new Date(p.createdAt).getTime() < 172800000 && p.user && p.user.username)
            active48[p.user.username] = true;
        });
        _initActiveDots(active48);
      }

      // Re-shuffle historical ticker every 90s (only if no live events flowing)
      setInterval(function () {
        if (_liveQueue.length === 0) {
          _tickerMsgs = _buildHistoricalMsgs(picks);
          _refreshTicker();
        }
      }, 90000);

    } catch (_) { /* Non-critical — silent fail */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 80);
  }

})();
