(function () {
  'use strict';

  /* ── CSS ────────────────────────────────────────────────────────────── */
  if (!document.getElementById('moments-css')) {
    const s = document.createElement('style');
    s.id = 'moments-css';
    s.textContent = `
/* ══ LEDGR PRESTIGE MOMENTS v1 ══════════════════════════════════════ */

/* ── overlay ── */
#moments-overlay{position:fixed;inset:0;z-index:9900;display:flex;align-items:center;justify-content:center;pointer-events:none}
#moments-overlay.mo-active{pointer-events:all;background:rgba(4,3,12,.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);animation:mo-in .3s ease}
#moments-overlay.mo-exit{animation:mo-out .38s ease forwards;pointer-events:none}
@keyframes mo-in{from{opacity:0}to{opacity:1}}
@keyframes mo-out{from{opacity:1}to{opacity:0}}

/* ── shared canvas particles ── */
.mo-particles{position:absolute;inset:0;pointer-events:none;z-index:0}

/* ── shared animations ── */
@keyframes mo-fade-up{from{transform:translateY(18px);opacity:0}to{transform:translateY(0);opacity:1}}
@keyframes mo-glow-pulse{0%,100%{opacity:.5;transform:translate(-50%,-50%) scale(1)}50%{opacity:.9;transform:translate(-50%,-50%) scale(1.08)}}

/* ── shared tap hint ── */
.mo-tap{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;color:rgba(240,237,255,.18);margin-top:24px}

/* ════ 1. RANK UP ════════════════════════════════════════════════════ */
.mo-rankup{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;text-align:center;padding:52px 36px}
.mo-ru-glow{position:absolute;width:500px;height:500px;border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;animation:mo-glow-pulse 3s ease-in-out infinite}
.mo-ru-content{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:12px}
.mo-ru-eyebrow{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:5px;color:rgba(240,237,255,.4);text-transform:uppercase;animation:mo-fade-up .4s ease .1s both}
.mo-ru-badge{width:110px;height:110px;border-radius:50%;border:2px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;animation:mo-badge-in .65s cubic-bezier(.34,1.56,.64,1) .2s both}
@keyframes mo-badge-in{from{transform:scale(.3) rotate(-18deg);opacity:0}to{transform:scale(1) rotate(0);opacity:1}}
.mo-ru-letter{font-family:'Bebas Neue',sans-serif;font-size:52px;letter-spacing:2px}
.mo-ru-headline{font-family:'Bebas Neue',sans-serif;font-size:62px;letter-spacing:8px;line-height:1;animation:mo-fade-up .5s ease .5s both}
.mo-ru-transition{font-family:'DM Mono',monospace;font-size:13px;letter-spacing:4px;color:rgba(240,237,255,.52);animation:mo-fade-up .4s ease .7s both}
.mo-ru-bar-wrap{width:240px;height:3px;background:rgba(255,255,255,.07);border-radius:2px;overflow:hidden;animation:mo-fade-up .3s ease .9s both}
.mo-ru-bar{height:100%;border-radius:2px;width:0;animation:mo-bar-fill 1.3s ease 1.1s both}
@keyframes mo-bar-fill{from{width:0}to{width:100%}}

/* ════ 2. ARCHETYPE REVEAL ══════════════════════════════════════════ */
.mo-arch{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center;padding:56px 40px}
.mo-arch-glow{position:absolute;width:480px;height:480px;border-radius:50%;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;animation:mo-glow-pulse 4s ease-in-out infinite}
.mo-arch-eyebrow{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:6px;color:rgba(240,237,255,.35);text-transform:uppercase;animation:mo-arch-ey .55s ease .1s both}
@keyframes mo-arch-ey{from{opacity:0;letter-spacing:10px}to{opacity:1;letter-spacing:6px}}
.mo-arch-hex{width:90px;height:90px;border:2px solid transparent;display:flex;align-items:center;justify-content:center;animation:mo-arch-hex .75s cubic-bezier(.34,1.56,.64,1) .3s both}
@keyframes mo-arch-hex{from{transform:scale(0) rotate(60deg);opacity:0}to{transform:scale(1) rotate(0);opacity:1}}
.mo-arch-divider{width:36px;height:1px;opacity:.3;animation:mo-fade-up .3s ease .7s both}
.mo-arch-name{font-family:'Bebas Neue',sans-serif;font-size:52px;letter-spacing:4px;line-height:1;animation:mo-arch-name .6s ease .75s both}
@keyframes mo-arch-name{from{transform:translateY(28px) scaleY(1.25);opacity:0}to{transform:translateY(0) scaleY(1);opacity:1}}
.mo-arch-tagline{font-family:'Syne',sans-serif;font-size:14px;font-style:italic;color:rgba(240,237,255,.42);animation:mo-fade-up .4s ease .95s both}

/* ════ 3. WEEKLY RECAP ══════════════════════════════════════════════ */
.mo-recap{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:10px;padding:40px 24px;max-width:380px;width:100%}
.mo-recap-eyebrow{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:5px;color:rgba(240,237,255,.35);text-transform:uppercase}
.mo-recap-pnl{font-family:'Bebas Neue',sans-serif;font-size:72px;line-height:1;letter-spacing:2px;margin-bottom:6px}
.mo-recap-cards{width:100%;display:flex;flex-direction:column;gap:8px}
.mo-rc{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px 18px;display:flex;justify-content:space-between;align-items:center;opacity:0}
.mo-rc.in{animation:mo-card-in .4s ease forwards}
@keyframes mo-card-in{from{transform:translateY(22px);opacity:0}to{transform:translateY(0);opacity:1}}
.mo-rc-lbl{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;color:rgba(240,237,255,.35);text-transform:uppercase}
.mo-rc-val{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:2px;color:#f0edff}
.mo-recap-btn{background:transparent;border:1px solid rgba(255,255,255,.15);color:rgba(255,255,255,.45);border-radius:8px;padding:10px 28px;font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;cursor:pointer;margin-top:10px;transition:border-color .2s,color .2s;text-transform:uppercase}
.mo-recap-btn:hover{border-color:rgba(255,255,255,.3);color:rgba(255,255,255,.75)}

/* ════ 4. BIG WIN TOAST ═════════════════════════════════════════════ */
#moments-toast{position:fixed;right:24px;bottom:80px;z-index:9800;width:272px}
#moments-toast.mo-toast-in{animation:mo-slide-in .5s cubic-bezier(.34,1.4,.64,1) forwards}
#moments-toast.mo-toast-out{animation:mo-slide-out .35s ease forwards}
@keyframes mo-slide-in{from{transform:translateX(120%)}to{transform:translateX(0)}}
@keyframes mo-slide-out{from{transform:translateX(0);opacity:1}to{transform:translateX(120%);opacity:0}}
.mo-bw{background:linear-gradient(135deg,#0c0a1a,#141230);border:1px solid rgba(52,211,153,.25);border-radius:16px;padding:18px 20px;position:relative;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.65)}
.mo-bw::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(52,211,153,.5),transparent);animation:mo-bw-line 2s ease-in-out infinite}
@keyframes mo-bw-line{0%,100%{opacity:.4}50%{opacity:1}}
.mo-bw-glow{position:absolute;inset:-10px;background:radial-gradient(ellipse at 50% 60%,rgba(52,211,153,.09),transparent 65%);pointer-events:none;animation:mo-bw-glow 1.8s ease-in-out infinite}
@keyframes mo-bw-glow{0%,100%{opacity:.5}50%{opacity:1}}
.mo-bw-lbl{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:4px;color:rgba(52,211,153,.6);text-transform:uppercase;margin-bottom:4px}
.mo-bw-amt{font-family:'Bebas Neue',sans-serif;font-size:48px;letter-spacing:2px;color:#34d399;line-height:1;margin-bottom:4px}
.mo-bw-event{font-family:'DM Mono',monospace;font-size:9px;color:rgba(240,237,255,.32);margin-bottom:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mo-bw-market{font-family:'Syne',sans-serif;font-size:11px;color:rgba(240,237,255,.2)}

/* ════ 5. STREAK ENERGY ═════════════════════════════════════════════ */
/* Applied to existing streak pill element: 3W purple glow, 5W fire, 8W elite */
.se-3{animation:mo-se-3 2.5s ease-in-out infinite!important}
.se-5{animation:mo-se-5 1.8s ease-in-out infinite!important}
.se-8{animation:mo-se-8 1.2s ease-in-out infinite!important}
@keyframes mo-se-3{0%,100%{box-shadow:0 0 8px rgba(184,159,255,.35)}50%{box-shadow:0 0 20px rgba(184,159,255,.6),0 0 36px rgba(184,159,255,.14)}}
@keyframes mo-se-5{0%,100%{box-shadow:0 0 12px rgba(251,146,60,.45)}50%{box-shadow:0 0 28px rgba(251,146,60,.75),0 0 52px rgba(255,68,0,.22)}}
@keyframes mo-se-8{0%{box-shadow:0 0 22px rgba(245,158,11,.55),0 0 44px rgba(184,159,255,.22)}33%{box-shadow:0 0 22px rgba(56,189,248,.55),0 0 44px rgba(245,158,11,.22)}66%{box-shadow:0 0 22px rgba(184,159,255,.55),0 0 44px rgba(56,189,248,.22)}100%{box-shadow:0 0 22px rgba(245,158,11,.55),0 0 44px rgba(184,159,255,.22)}}

/* ════ 6. MILESTONE UNLOCK ══════════════════════════════════════════ */
.mo-ms{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:12px;padding:52px 36px;text-align:center}
.mo-ms-eyebrow{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:6px;color:rgba(240,237,255,.3);text-transform:uppercase;animation:mo-fade-up .4s ease .1s both}
.mo-ms-icon{width:86px;height:86px;border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative;animation:mo-ms-icon .7s cubic-bezier(.34,1.56,.64,1) .25s both}
@keyframes mo-ms-icon{from{transform:scale(0);opacity:0}to{transform:scale(1);opacity:1}}
.mo-ms-ring{position:absolute;inset:-6px;border-radius:50%;border:1px solid;animation:mo-ms-ring 2.5s ease-in-out infinite}
@keyframes mo-ms-ring{0%,100%{transform:scale(1);opacity:.22}50%{transform:scale(1.09);opacity:.42}}
.mo-ms-ring-2{inset:-14px;animation:mo-ms-ring 2.5s ease-in-out .75s infinite}
.mo-ms-title{font-family:'Bebas Neue',sans-serif;font-size:40px;letter-spacing:3px;line-height:1;animation:mo-fade-up .5s ease .6s both}
.mo-ms-sub{font-family:'DM Mono',monospace;font-size:10px;color:rgba(240,237,255,.35);letter-spacing:1px;animation:mo-fade-up .4s ease .75s both}

/* ── responsive ── */
@media(max-width:600px){
  .mo-rankup{padding:36px 18px}
  .mo-ru-headline{font-size:48px;letter-spacing:5px}
  .mo-ru-badge{width:88px;height:88px}
  .mo-ru-letter{font-size:40px}
  .mo-arch{padding:44px 22px}
  .mo-arch-name{font-size:40px}
  .mo-recap{padding:32px 14px}
  .mo-recap-pnl{font-size:58px}
  #moments-toast{right:12px;left:12px;width:auto;bottom:70px}
  .mo-ms{padding:44px 22px}
}
`;
    document.head.appendChild(s);
  }

  /* ── Overlay management ──────────────────────────────────────────── */
  var _ol = null;
  var _t  = null;

  function _ensureOl() {
    if (_ol) return _ol;
    _ol = document.createElement('div');
    _ol.id = 'moments-overlay';
    _ol.addEventListener('click', function (e) { if (e.target === _ol) dismiss(); });
    document.body.appendChild(_ol);
    return _ol;
  }

  function dismiss() {
    if (_t) { clearTimeout(_t); _t = null; }
    var ol = _ol;
    if (!ol || !ol.classList.contains('mo-active')) return;
    ol.classList.add('mo-exit');
    setTimeout(function () { ol.className = ''; ol.innerHTML = ''; }, 400);
  }

  function _show(html, autoMs) {
    var ol = _ensureOl();
    ol.innerHTML = html;
    ol.className = 'mo-active';
    if (autoMs) _t = setTimeout(dismiss, autoMs);
  }

  /* ── Canvas particle burst ───────────────────────────────────────── */
  function _particles(color) {
    var ol = _ensureOl();
    var cv = document.createElement('canvas');
    cv.className = 'mo-particles';
    cv.width  = window.innerWidth;
    cv.height = window.innerHeight;
    ol.prepend(cv);

    var ctx = cv.getContext('2d');
    var cx = cv.width / 2, cy = cv.height / 2;
    var ps = [];
    for (var i = 0; i < 68; i++) {
      var a  = Math.random() * Math.PI * 2;
      var sp = Math.random() * 9 + 3;
      ps.push({ x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3.5,
                life: 1, decay: Math.random() * .017 + .008, r: Math.random() * 3.5 + 1.5 });
    }

    var af;
    (function tick() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      var alive = false;
      for (var j = 0; j < ps.length; j++) {
        var p = ps[j];
        p.x += p.vx; p.y += p.vy; p.vy += .16; p.vx *= .99; p.life -= p.decay;
        if (p.life <= 0) continue;
        alive = true;
        ctx.globalAlpha = p.life * p.life;
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      if (alive) af = requestAnimationFrame(tick);
    })();
  }

  /* ── Division color map ──────────────────────────────────────────── */
  var _DIV = {
    Bronze:   { color: '#cd7f32', glow: 'rgba(205,127,50,.28)'  },
    Silver:   { color: '#94a3b8', glow: 'rgba(148,163,184,.22)' },
    Gold:     { color: '#fbbf24', glow: 'rgba(251,191,36,.32)'  },
    Platinum: { color: '#38bdf8', glow: 'rgba(56,189,248,.28)'  },
    Diamond:  { color: '#b89fff', glow: 'rgba(184,159,255,.32)' },
    Elite:    { color: '#e879a0', glow: 'rgba(232,121,160,.28)' },
    Legend:   { color: '#fbbf24', glow: 'rgba(251,191,36,.42)'  },
  };

  /* ══ 1. RANK UP ═══════════════════════════════════════════════════ */
  function rankUp(fromDiv, toDiv) {
    var d    = _DIV[toDiv]  || _DIV.Bronze;
    var from = (fromDiv || '').toUpperCase();
    var to   = (toDiv   || '').toUpperCase();
    _show(
      '<div class="mo-rankup">' +
        '<div class="mo-ru-glow" style="background:radial-gradient(circle,' + d.glow + ',transparent 68%)"></div>' +
        '<div class="mo-ru-content">' +
          '<div class="mo-ru-eyebrow">Division Promoted</div>' +
          '<div class="mo-ru-badge" style="border-color:' + d.color + '55;box-shadow:0 0 48px ' + d.glow + '">' +
            '<div class="mo-ru-letter" style="color:' + d.color + ';text-shadow:0 0 30px ' + d.glow + '">' + to.slice(0, 1) + '</div>' +
          '</div>' +
          '<div class="mo-ru-headline" style="color:' + d.color + '">RANK UP</div>' +
          '<div class="mo-ru-transition">' + from + ' &rarr; ' + to + '</div>' +
          '<div class="mo-ru-bar-wrap"><div class="mo-ru-bar" style="background:linear-gradient(90deg,' + d.color + ',' + d.color + 'aa)"></div></div>' +
          '<div class="mo-tap">Click anywhere &middot; closes in 5s</div>' +
        '</div>' +
      '</div>',
      5000
    );
    _particles(d.color);
  }

  /* ══ 2. ARCHETYPE REVEAL ══════════════════════════════════════════ */
  var _TAGLINES = {
    sniper:       'Precision over volume',
    demon:        'Win streaks are your weapon',
    grinder:      'Consistency beats luck',
    sharp:        'The market respects you',
    hunter:       'High odds, high reward',
    storm:        'Volume and velocity',
    kingmaker:    'Leaders follow your picks',
    iceblood:     'Cold, calculated, profitable',
    gambler:      'Fortune favors the bold',
    reaper:       'Longshots are your domain',
    'night-owl':  'The late shift pays',
    shark:        'Surgical, low-odds precision',
    ghost:        'Rare picks, massive returns',
    'diamond-mind':'Consistent excellence',
    hybrid:       'No category can hold you',
    contender:    'Your identity is forming',
  };

  function archetypeReveal(arch) {
    var color   = arch.color   || '#b89fff';
    var name    = (arch.name   || arch.id || 'ARCHETYPE').toUpperCase();
    var tagline = arch.tagline || _TAGLINES[arch.id] || 'Your archetype is revealed';
    _show(
      '<div class="mo-arch">' +
        '<div class="mo-arch-glow" style="background:radial-gradient(circle,' + color + '1e,transparent 65%)"></div>' +
        '<div class="mo-arch-eyebrow">New Archetype Detected</div>' +
        '<div class="mo-arch-hex" style="border-color:' + color + '44;box-shadow:0 0 44px ' + color + '2a">' +
          '<svg width="44" height="44" viewBox="0 0 44 44" fill="none">' +
            '<polygon points="22,3 39,12.5 39,31.5 22,41 5,31.5 5,12.5"' +
              ' stroke="' + color + '" stroke-width="1.5" fill="' + color + '18"/>' +
          '</svg>' +
        '</div>' +
        '<div class="mo-arch-divider" style="background:' + color + '"></div>' +
        '<div class="mo-arch-name" style="color:' + color + '">' + name + '</div>' +
        '<div class="mo-arch-tagline">' + tagline + '</div>' +
        '<div class="mo-tap">Click anywhere to continue</div>' +
      '</div>',
      6000
    );
  }

  /* ══ 3. WEEKLY RECAP ══════════════════════════════════════════════ */
  var _RECAP_KEY = 'ledgr_last_recap';

  function maybeShowWeeklyRecap(stats) {
    if (!stats || (!stats.wins && !stats.losses)) return;
    var last = parseInt(localStorage.getItem(_RECAP_KEY) || '0');
    if (Date.now() - last < 6 * 86400000) return;
    weeklyRecap(stats);
  }

  function weeklyRecap(stats) {
    localStorage.setItem(_RECAP_KEY, String(Date.now()));
    var pnl    = stats.pnl || 0;
    var pos    = pnl >= 0;
    var pnlStr = (pos ? '+' : '') + pnl.toFixed(1) + 'u';
    var pnlCol = pos ? '#34d399' : '#f87171';
    var w = stats.wins || 0, l = stats.losses || 0;
    var bwStr  = stats.biggestWin > 0 ? '+' + stats.biggestWin.toFixed(1) + 'u' : '&mdash;';
    var mkt    = stats.bestMarket || '&mdash;';

    var cards = [
      { lbl: 'Record',       val: w + 'W &mdash; ' + l + 'L' },
      { lbl: 'Best Market',  val: mkt },
      { lbl: 'Biggest Win',  val: bwStr, color: '#34d399' },
    ];
    if (stats.style) cards.push({ lbl: 'Your Style', val: stats.style });

    _show(
      '<div class="mo-recap">' +
        '<div class="mo-recap-eyebrow">This Week</div>' +
        '<div class="mo-recap-pnl" style="color:' + pnlCol + '">' + pnlStr + '</div>' +
        '<div class="mo-recap-cards">' +
          cards.map(function (c, i) {
            return '<div class="mo-rc" id="morc' + i + '">' +
              '<span class="mo-rc-lbl">' + c.lbl + '</span>' +
              '<span class="mo-rc-val"' + (c.color ? ' style="color:' + c.color + '"' : '') + '>' + c.val + '</span>' +
            '</div>';
          }).join('') +
        '</div>' +
        '<button class="mo-recap-btn" onclick="window.Moments&&window.Moments.dismiss()">Done</button>' +
      '</div>'
    );

    cards.forEach(function (_, i) {
      setTimeout(function () {
        var el = document.getElementById('morc' + i);
        if (el) el.classList.add('in');
      }, 160 + i * 140);
    });
  }

  /* ══ 4. BIG WIN TOAST ════════════════════════════════════════════ */
  var _toast = null, _toastT = null;

  function _ensureToast() {
    if (_toast) return _toast;
    _toast = document.createElement('div');
    _toast.id = 'moments-toast';
    document.body.appendChild(_toast);
    return _toast;
  }

  function bigWin(amount, pick) {
    var t   = _ensureToast();
    var amt = typeof amount === 'number' ? amount.toFixed(1) : String(amount);
    var ev  = (pick && pick.event)  ? pick.event.slice(0, 38) + (pick.event.length > 38 ? '…' : '') : '';
    var mkt = (pick && pick.market) ? pick.market : '';

    t.innerHTML =
      '<div class="mo-bw">' +
        '<div class="mo-bw-glow"></div>' +
        '<div class="mo-bw-lbl">Big Hit</div>' +
        '<div class="mo-bw-amt">+' + amt + 'u</div>' +
        (ev  ? '<div class="mo-bw-event">' + ev  + '</div>' : '') +
        (mkt ? '<div class="mo-bw-market">' + mkt + '</div>' : '') +
      '</div>';

    t.className = '';
    void t.offsetWidth; // force reflow
    t.classList.add('mo-toast-in');

    if (_toastT) clearTimeout(_toastT);
    _toastT = setTimeout(function () {
      t.classList.remove('mo-toast-in');
      t.classList.add('mo-toast-out');
      setTimeout(function () { t.className = ''; t.innerHTML = ''; }, 380);
    }, 4500);
  }

  /* ══ 5. STREAK ENERGY ════════════════════════════════════════════ */
  function applyStreak(el, count) {
    if (!el) return;
    el.classList.remove('se-3', 'se-5', 'se-8');
    if      (count >= 8) el.classList.add('se-8');
    else if (count >= 5) el.classList.add('se-5');
    else if (count >= 3) el.classList.add('se-3');
  }

  /* ══ 6. MILESTONE UNLOCK ═════════════════════════════════════════ */
  var _ICONS = {
    crosshair:
      '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">' +
        '<circle cx="20" cy="20" r="13"/><circle cx="20" cy="20" r="6"/><circle cx="20" cy="20" r="2" fill="currentColor" stroke="none"/>' +
        '<line x1="20" y1="5" x2="20" y2="10"/><line x1="20" y1="30" x2="20" y2="35"/>' +
        '<line x1="5" y1="20" x2="10" y2="20"/><line x1="30" y1="20" x2="35" y2="20"/>' +
      '</svg>',
    bars:
      '<svg width="40" height="40" viewBox="0 0 40 40" fill="none">' +
        '<rect x="5"  y="28" width="6" height="8"  rx="1" fill="currentColor" opacity=".35"/>' +
        '<rect x="13" y="21" width="6" height="15" rx="1" fill="currentColor" opacity=".55"/>' +
        '<rect x="21" y="13" width="6" height="23" rx="1" fill="currentColor" opacity=".75"/>' +
        '<rect x="29" y="6"  width="6" height="30" rx="1" fill="currentColor"/>' +
        '<line x1="3" y1="37" x2="37" y2="37" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>' +
      '</svg>',
    trend:
      '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
        '<polyline points="4,32 12,22 18,26 28,12 36,12"/>' +
        '<polyline points="28,7 36,12 31,19"/>' +
      '</svg>',
    star:
      '<svg width="40" height="40" viewBox="0 0 40 40" fill="none">' +
        '<polygon points="20,4 23.5,14.5 35,14.5 26,21.5 29.5,32 20,26 10.5,32 14,21.5 5,14.5 16.5,14.5"' +
          ' stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" fill="currentColor" opacity=".18"/>' +
      '</svg>',
    hex:
      '<svg width="40" height="40" viewBox="0 0 40 40" fill="none">' +
        '<polygon points="20,3 36,12 36,28 20,37 4,28 4,12"' +
          ' stroke="currentColor" stroke-width="1.5" fill="currentColor" opacity=".14"/>' +
      '</svg>',
  };

  var _MS = {
    'first-pick': { title: 'FIRST PICK',   sub: 'Your record begins now',        color: '#b89fff', icon: 'crosshair' },
    'picks-10':   { title: '10 PICKS',     sub: 'Building your edge',             color: '#4FC3F7', icon: 'bars'      },
    'picks-50':   { title: '50 PICKS',     sub: 'Half a century on the ledger',   color: '#38bdf8', icon: 'bars'      },
    'picks-100':  { title: '100 PICKS',    sub: 'Century on the record',           color: '#fbbf24', icon: 'bars'      },
    'profit-50':  { title: '+50U PROFIT',  sub: 'Profitable and growing',         color: '#34d399', icon: 'trend'     },
    'profit-100': { title: '+100U PROFIT', sub: 'Three figures, verified',        color: '#34d399', icon: 'trend'     },
    'top-10':     { title: 'TOP 10',       sub: 'Elite territory',                color: '#f59e0b', icon: 'star'      },
    'top-50':     { title: 'TOP 50',       sub: 'Rising fast',                    color: '#b89fff', icon: 'star'      },
  };

  function milestoneUnlock(id, customTitle, customSub) {
    var ms    = _MS[id] || { title: customTitle || id.toUpperCase().replace(/-/g, ' '), sub: customSub || 'Achievement unlocked', color: '#b89fff', icon: 'hex' };
    var title = customTitle || ms.title;
    var sub   = customSub   || ms.sub;
    var color = ms.color;
    var icon  = _ICONS[ms.icon] || _ICONS.hex;
    _show(
      '<div class="mo-ms">' +
        '<div class="mo-ms-eyebrow">Milestone Reached</div>' +
        '<div class="mo-ms-icon" style="color:' + color + ';background:' + color + '14">' +
          '<div class="mo-ms-ring"     style="border-color:' + color + '55"></div>' +
          '<div class="mo-ms-ring mo-ms-ring-2" style="border-color:' + color + '2a"></div>' +
          icon +
        '</div>' +
        '<div class="mo-ms-title" style="color:' + color + '">' + title + '</div>' +
        '<div class="mo-ms-sub">' + sub + '</div>' +
        '<div class="mo-tap">Click anywhere to continue</div>' +
      '</div>',
      7000
    );
    _particles(color);
  }

  /* ── Public API ──────────────────────────────────────────────────── */
  window.Moments = {
    rankUp:             rankUp,
    archetypeReveal:    archetypeReveal,
    weeklyRecap:        weeklyRecap,
    maybeShowWeeklyRecap: maybeShowWeeklyRecap,
    bigWin:             bigWin,
    applyStreak:        applyStreak,
    milestoneUnlock:    milestoneUnlock,
    dismiss:            dismiss,
  };

})();
