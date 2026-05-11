(function () {
  'use strict';

  const API = 'https://ledgr-backend-production-c132.up.railway.app';

  // Page detection
  const IS_HOME = !!document.getElementById('tickerText');
  const IS_LB   = !!document.getElementById('lbContainer');

  const AV_COLORS = [
    'linear-gradient(135deg,#7c3aed,#a855f7)',
    'linear-gradient(135deg,#059669,#10b981)',
    'linear-gradient(135deg,#b45309,#f59e0b)',
    'linear-gradient(135deg,#0369a1,#38bdf8)',
    'linear-gradient(135deg,#dc2626,#ef4444)',
    'linear-gradient(135deg,#0f766e,#14b8a6)',
    'linear-gradient(135deg,#7c3aed,#ec4899)'
  ];

  // ── Inject shared CSS ───────────────────────────────────────────
  if (!document.getElementById('lv-styles')) {
    const s = document.createElement('style');
    s.id = 'lv-styles';
    s.textContent = `
/* ═══ LEDGR LIVE LAYER ══════════════════════════════════════════ */

/* Leaderboard injected ticker */
#lv-ticker{border-top:1px solid rgba(184,159,255,0.1);border-bottom:1px solid rgba(184,159,255,0.1);background:rgba(255,255,255,0.012)}
.lv-ticker-inner{max-width:1100px;margin:0 auto;padding:6px 24px;display:flex;align-items:center;gap:12px;overflow:hidden}
.lv-scroll{overflow:hidden;flex:1}
.lv-msgs{display:flex;gap:48px;white-space:nowrap;animation:lv-tick 34s linear infinite;font-family:'DM Mono',monospace;font-size:9px;color:rgba(106,102,144,0.85)}
.lv-msgs b{color:#9590b8}
@keyframes lv-tick{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.lv-online-lbl{font-family:'DM Mono',monospace;font-size:9px;color:#34d399;flex-shrink:0;letter-spacing:1px}

/* Shared pulsing dot */
.lv-dot{width:5px;height:5px;background:#34d399;border-radius:50%;flex-shrink:0;display:inline-block;animation:lv-blink 1.5s infinite}
@keyframes lv-blink{0%,100%{opacity:1}50%{opacity:.35}}

/* Active tipster dots on leaderboard rows */
.lv-active-dot{width:7px;height:7px;background:#34d399;border-radius:50%;display:inline-block;flex-shrink:0;animation:lv-pulse 2s ease-in-out infinite;box-shadow:0 0 0 0 rgba(52,211,153,.5)}
@keyframes lv-pulse{0%{box-shadow:0 0 0 0 rgba(52,211,153,.45)}70%{box-shadow:0 0 0 6px rgba(52,211,153,0)}100%{box-shadow:0 0 0 0 rgba(52,211,153,0)}}
.lv-av-active{box-shadow:0 0 0 2px #34d399,0 0 12px rgba(52,211,153,0.25)!important}

/* Wins sidebar — fixed bottom-right */
.lv-sidebar{position:fixed;bottom:28px;right:24px;z-index:800;width:272px;pointer-events:none}
@media(max-width:640px){.lv-sidebar{display:none}}
.lv-sb-header{display:flex;align-items:center;gap:6px;margin-bottom:6px;padding:0 2px}
.lv-sb-title{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;color:rgba(52,211,153,0.7);text-transform:uppercase}

/* Win card */
.lv-win-card{background:rgba(12,10,26,0.96);border:1px solid rgba(52,211,153,0.18);border-radius:12px;padding:12px 14px;display:flex;align-items:center;gap:10px;box-shadow:0 8px 32px rgba(0,0,0,0.5),0 0 0 1px rgba(52,211,153,0.06);transform:translateX(110%);opacity:0;transition:transform .45s cubic-bezier(.34,1.1,.64,1),opacity .35s ease;pointer-events:auto;cursor:default}
.lv-win-card.lv-win-visible{transform:translateX(0);opacity:1}
.lv-win-av{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;font-size:13px;color:#fff;flex-shrink:0}
.lv-win-info{flex:1;min-width:0}
.lv-win-user{font-weight:700;font-size:11px;color:#f0edff;margin-bottom:1px}
.lv-win-event{font-size:10px;color:#8b87a8;font-family:'DM Mono',monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px}
.lv-win-meta{font-family:'DM Mono',monospace;font-size:9px;color:#544f6e}
.lv-win-pnl{color:#34d399;font-weight:700}
.lv-win-badge{font-family:'Bebas Neue',sans-serif;font-size:11px;letter-spacing:1px;color:#34d399;background:rgba(52,211,153,0.1);border:1px solid rgba(52,211,153,0.2);border-radius:4px;padding:3px 7px;flex-shrink:0}
`;
    document.head.appendChild(s);
  }

  // ── Helpers ─────────────────────────────────────────────────────

  function buildTipsterMap(picks) {
    var m = {};
    picks.forEach(function (p) {
      var u = (p.user && p.user.username) ? p.user.username : null;
      if (!u) return;
      if (!m[u]) m[u] = { username: u, wins: 0, losses: 0, picks: 0, stake: 0, pnl: 0, all: [] };
      m[u].picks++;
      m[u].all.push(p);
      if (p.result === 'win')  m[u].wins++;
      if (p.result === 'loss') m[u].losses++;
      m[u].stake += p.stake || 0;
      m[u].pnl   += p.pnl   || 0;
    });
    Object.values(m).forEach(function (t) {
      var settled = t.all.filter(function (p) { return p.result !== 'pending'; })
        .sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); });
      var streak = 0;
      for (var i = 0; i < settled.length; i++) {
        if (settled[i].result === 'win') streak++;
        else break;
      }
      t.streak = streak;
      t.roi = t.stake > 0 ? (t.pnl / t.stake) * 100 : 0;
    });
    return m;
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
    if (sc >= 90) return 'LEGEND';
    if (sc >= 75) return 'ELITE';
    if (sc >= 60) return 'DIAMOND';
    if (sc >= 45) return 'PLATINUM';
    if (sc >= 30) return 'GOLD';
    if (sc >= 15) return 'SILVER';
    return 'BRONZE';
  }

  function buildMessages(picks) {
    var msgs = [];
    var tipsters = Object.values(buildTipsterMap(picks));
    var now = Date.now();

    // Streak messages
    tipsters.filter(function (t) { return t.streak >= 3; })
      .sort(function (a, b) { return b.streak - a.streak; })
      .slice(0, 5)
      .forEach(function (t) {
        if (t.streak >= 7)      msgs.push('🔥🔥 <b>@' + t.username + '</b> is on a monstrous <b>' + t.streak + '-WIN STREAK</b>');
        else if (t.streak >= 5) msgs.push('🔥 <b>@' + t.username + '</b> just went <b>' + t.streak + '-0</b> — unstoppable');
        else                    msgs.push('⚡ <b>@' + t.username + '</b> on a <b>' + t.streak + '-win streak</b>');
      });

    // Top ROI
    var qualified = tipsters.filter(function (t) { return t.picks >= 5 && t.stake > 0; })
      .sort(function (a, b) { return b.roi - a.roi; });
    if (qualified.length) {
      var top = qualified[0];
      msgs.push('📈 <b>@' + top.username + '</b> leads the board with <b>+' + top.roi.toFixed(1) + '% ROI</b>');
    }

    // Division highlights (Diamond+)
    tipsters.filter(function (t) { return t.picks >= 5; }).forEach(function (t) {
      var div = divisionName(t);
      if      (div === 'LEGEND')   msgs.push('🐐 <b>@' + t.username + '</b> reached <b>LEGEND</b> status');
      else if (div === 'ELITE')    msgs.push('🔱 <b>@' + t.username + '</b> hit <b>ELITE</b> — top tier');
      else if (div === 'DIAMOND')  msgs.push('💎 <b>@' + t.username + '</b> is in <b>DIAMOND</b> division');
      else if (div === 'PLATINUM') msgs.push('⚡ <b>@' + t.username + '</b> reached <b>PLATINUM</b>');
    });

    // Recent big wins (last 48h)
    picks.filter(function (p) {
      return p.user && p.result === 'win' && (now - new Date(p.createdAt).getTime()) < 172800000;
    }).forEach(function (p) {
      var pnl  = parseFloat(p.pnl)  || 0;
      var odds = parseFloat(p.odds) || 0;
      var evt  = p.event.length > 28 ? p.event.slice(0, 26) + '…' : p.event;
      if      (pnl >= 10)   msgs.push('💥 <b>@' + p.user.username + '</b> banked <b>+' + pnl.toFixed(1) + 'u</b> on ' + evt);
      else if (odds >= 3.5) msgs.push('🎯 Underdog cashes — <b>@' + p.user.username + '</b> wins @ <b>' + odds.toFixed(2) + '</b>');
      else if (pnl >= 3)    msgs.push('✅ <b>@' + p.user.username + '</b> won ' + evt + ' @ <b>' + odds.toFixed(2) + '</b>');
    });

    // New #1 highlight
    if (qualified.length > 0) {
      msgs.push('🏆 New <b>#1 ROI</b> today: <b>@' + qualified[0].username + '</b>');
    }

    // Tails simulation (pick × small factor — we don't store tails)
    var recentPicks = picks.filter(function (p) {
      return now - new Date(p.createdAt).getTime() < 86400000;
    });
    if (recentPicks.length) {
      var tailCount = recentPicks.length * 3 + Math.floor(Math.random() * 12) + 8;
      msgs.push('👥 <b>' + tailCount + ' users</b> tailed picks in the last 24h');
    }

    // Community stats
    var totalWins = picks.filter(function (p) { return p.result === 'win'; }).length;
    if (totalWins > 0) msgs.push('✅ <b>' + totalWins + ' picks</b> verified as wins on LEDGR');

    // Shuffle
    for (var i = msgs.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = msgs[i]; msgs[i] = msgs[j]; msgs[j] = tmp;
    }

    return msgs.length ? msgs : ['🔥 Real picks · Verified records · Climb the leaderboard'];
  }

  function computeOnline(picks) {
    var now = Date.now();
    var seen = {};
    picks.forEach(function (p) {
      if (now - new Date(p.createdAt).getTime() < 604800000) { // 7d
        var u = (p.user && p.user.username) ? p.user.username : p.userId;
        if (u) seen[u] = 1;
      }
    });
    var active = Object.keys(seen).length;
    return Math.max(4, active * 4) + Math.floor(Math.random() * 9) + 2;
  }

  function getActiveTipsters(picks, hours) {
    var cutoff = Date.now() - hours * 3600000;
    var active = {};
    picks.forEach(function (p) {
      if (new Date(p.createdAt).getTime() > cutoff && p.user && p.user.username) {
        active[p.user.username] = true;
      }
    });
    return active; // plain object — use hasOwnProperty to check
  }

  // ── Ticker ───────────────────────────────────────────────────────

  function setMsgs(elId, msgs) {
    var el = document.getElementById(elId);
    if (!el) return;
    var doubled = msgs.concat(msgs).map(function (m) { return '<span>' + m + '</span>'; }).join('');
    el.innerHTML = doubled;
  }

  function injectLBTicker() {
    if (document.getElementById('lv-ticker')) return;
    var main = document.querySelector('.main');
    if (!main || !main.parentNode) return;
    var wrap = document.createElement('div');
    wrap.id = 'lv-ticker';
    wrap.innerHTML =
      '<div class="lv-ticker-inner">' +
        '<span class="lv-dot"></span>' +
        '<span class="lv-online-lbl" id="lv-online">— online</span>' +
        '<div class="lv-scroll"><div class="lv-msgs" id="lv-msgs"><span>Loading live data…</span><span>Loading live data…</span></div></div>' +
      '</div>';
    main.parentNode.insertBefore(wrap, main);
  }

  function updateTicker(picks) {
    var msgs = buildMessages(picks);
    if (IS_LB)   setMsgs('lv-msgs',    msgs);
    if (IS_HOME) setMsgs('tickerText', msgs);
  }

  function updateOnlineCount(picks) {
    var n = computeOnline(picks);
    var label = n + ' online';
    var homeEl = document.getElementById('onlineCount');
    if (homeEl) homeEl.textContent = label;
    var lbEl = document.getElementById('lv-online');
    if (lbEl) lbEl.textContent = label;
  }

  // ── Wins Sidebar ─────────────────────────────────────────────────

  function initWinsSidebar(picks) {
    if (document.getElementById('lv-sidebar')) return;
    var wins = picks.filter(function (p) { return p.user && p.result === 'win'; })
      .sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); })
      .slice(0, 30);
    if (!wins.length) return;

    var sidebar = document.createElement('div');
    sidebar.id = 'lv-sidebar';
    sidebar.className = 'lv-sidebar';
    sidebar.innerHTML =
      '<div class="lv-sb-header">' +
        '<span class="lv-dot"></span>' +
        '<span class="lv-sb-title">Live Wins</span>' +
      '</div>' +
      '<div id="lv-sb-feed"></div>';
    document.body.appendChild(sidebar);

    var idx = 0;

    function showNext() {
      var feed = document.getElementById('lv-sb-feed');
      if (!feed) return;
      var p    = wins[idx % wins.length];
      idx++;
      var odds = parseFloat(p.odds).toFixed(2);
      var pnl  = parseFloat(p.pnl).toFixed(1);
      var u    = p.user.username;
      var av   = u.slice(0, 2).toUpperCase();
      var ci   = u.charCodeAt(0) % AV_COLORS.length;
      var evt  = p.event.length > 30 ? p.event.slice(0, 28) + '…' : p.event;

      var card = document.createElement('div');
      card.className = 'lv-win-card';
      card.innerHTML =
        '<div class="lv-win-av" style="background:' + AV_COLORS[ci] + '">' + av + '</div>' +
        '<div class="lv-win-info">' +
          '<div class="lv-win-user">@' + u + '</div>' +
          '<div class="lv-win-event">' + evt + '</div>' +
          '<div class="lv-win-meta">@ ' + odds + ' · <span class="lv-win-pnl">+' + pnl + 'u</span></div>' +
        '</div>' +
        '<div class="lv-win-badge">WIN</div>';

      // Slide old card out, then bring new one in
      var old = feed.querySelector('.lv-win-card');
      if (old) {
        old.style.transition = 'transform .3s ease, opacity .3s ease';
        old.style.transform  = 'translateX(110%)';
        old.style.opacity    = '0';
        setTimeout(function () {
          if (old.parentNode) old.parentNode.removeChild(old);
        }, 320);
      }

      feed.appendChild(card);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          card.classList.add('lv-win-visible');
        });
      });
    }

    // First card after brief delay so page settles
    setTimeout(showNext, 400);
    setInterval(showNext, 6500);
  }

  // ── Active Dots (Leaderboard) ────────────────────────────────────

  function initActiveDots(activeTipsters) {
    var container = document.getElementById('lbContainer');
    if (!container) return;

    function addDots() {
      var rows = container.querySelectorAll('.lb-row:not([data-lv])');
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        row.setAttribute('data-lv', '1');
        var nameEl = row.querySelector('.tip-name');
        if (!nameEl) continue;
        var txt   = nameEl.textContent || '';
        var match = txt.match(/@([A-Za-z0-9_]+)/);
        if (!match) continue;
        var username = match[1];
        if (!activeTipsters[username]) continue;

        // Pulsing dot before name
        var dot = document.createElement('span');
        dot.className = 'lv-active-dot';
        dot.title     = 'Active in last 48h';
        nameEl.insertBefore(dot, nameEl.firstChild);

        // Subtle glow ring on avatar
        var av = row.querySelector('.av');
        if (av) av.classList.add('lv-av-active');
      }
    }

    // Run now and watch for future renders (filter/sort re-renders the list)
    addDots();
    var obs = new MutationObserver(addDots);
    obs.observe(container, { childList: true, subtree: true });
  }

  // ── Boot ─────────────────────────────────────────────────────────

  async function init() {
    try {
      if (IS_LB) injectLBTicker();

      var r = await fetch(API + '/picks', { cache: 'no-store' });
      var picks = await r.json();
      if (!Array.isArray(picks)) return;

      updateTicker(picks);
      updateOnlineCount(picks);

      // Sidebar after a short delay so page content loads first
      setTimeout(function () { initWinsSidebar(picks); }, 1800);

      if (IS_LB) {
        var active = getActiveTipsters(picks, 48);
        initActiveDots(active);
      }

      // Refresh online count every 30 seconds (slightly randomised each tick)
      setInterval(function () { updateOnlineCount(picks); }, 30000);

      // Reshuffle ticker messages every 90 seconds for freshness
      setInterval(function () { updateTicker(picks); }, 90000);

    } catch (e) {
      // Silent fail — this is a non-critical enhancement layer
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 80); // small delay so page's own scripts run first
  }

})();
