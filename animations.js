(function () {
  'use strict';

  // ── Inject CSS once ──────────────────────────────────────────────────
  if (!document.getElementById('la-styles')) {
    const s = document.createElement('style');
    s.id = 'la-styles';
    s.textContent = `
/* ═══ LEDGR ANIMATION LAYER ═══════════════════════════════════ */

/* RANK-UP OVERLAY */
.la-overlay{position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;cursor:pointer;background:rgba(6,5,8,0);animation:la-bg-in .35s ease forwards}
@keyframes la-bg-in{to{background:rgba(6,5,8,.93)}}

.la-rankup-content{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:14px;transform:scale(.72) translateY(28px);opacity:0;animation:la-cnt-in .5s .2s cubic-bezier(.34,1.56,.64,1) forwards}
@keyframes la-cnt-in{to{transform:scale(1) translateY(0);opacity:1}}

.la-rankup-label{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:6px;color:#b89fff;text-transform:uppercase;opacity:.8}
.la-rankup-icon{font-size:80px;line-height:1;display:block;animation:la-icon-bounce .7s .45s ease both}
@keyframes la-icon-bounce{0%{transform:scale(1)}40%{transform:scale(1.35)}70%{transform:scale(.92)}100%{transform:scale(1)}}

.la-rankup-name{font-family:'Bebas Neue',sans-serif;font-size:76px;letter-spacing:10px;line-height:1;color:#f0edff;text-shadow:0 0 60px rgba(184,159,255,.25)}
.la-rankup-sub{font-family:'DM Mono',monospace;font-size:11px;color:rgba(240,237,255,.35);letter-spacing:3px;margin-top:2px}
.la-rankup-tap{font-family:'DM Mono',monospace;font-size:9px;color:rgba(240,237,255,.2);letter-spacing:2px;margin-top:16px;animation:la-blink 1.5s .8s infinite}
@keyframes la-blink{0%,100%{opacity:.2}50%{opacity:.5}}

/* GLOW ORB */
.la-glow{position:absolute;z-index:1;width:520px;height:520px;border-radius:50%;pointer-events:none;animation:la-glow-pulse 2s ease-in-out infinite}
@keyframes la-glow-pulse{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:.85;transform:scale(1.08)}}

/* DIVISION COLOURS */
.la-div-bronze .la-rankup-name{color:#c17f55;text-shadow:0 0 50px rgba(193,127,85,.3)}
.la-div-bronze .la-glow{background:radial-gradient(circle,rgba(193,127,85,.22),transparent 68%)}
.la-div-silver .la-rankup-name{color:#94a3b8;text-shadow:0 0 50px rgba(148,163,184,.25)}
.la-div-silver .la-glow{background:radial-gradient(circle,rgba(148,163,184,.18),transparent 68%)}
.la-div-gold .la-rankup-name{color:#fbbf24;text-shadow:0 0 60px rgba(251,191,36,.35)}
.la-div-gold .la-glow{background:radial-gradient(circle,rgba(251,191,36,.22),transparent 68%)}
.la-div-platinum .la-rankup-name{color:#38bdf8;text-shadow:0 0 60px rgba(56,189,248,.3)}
.la-div-platinum .la-glow{background:radial-gradient(circle,rgba(56,189,248,.18),transparent 68%)}
.la-div-diamond .la-rankup-name{color:#b89fff;text-shadow:0 0 60px rgba(184,159,255,.35)}
.la-div-diamond .la-glow{background:radial-gradient(circle,rgba(184,159,255,.22),transparent 68%)}
.la-div-elite .la-rankup-name{color:#f87171;text-shadow:0 0 60px rgba(248,113,113,.3)}
.la-div-elite .la-glow{background:radial-gradient(circle,rgba(248,113,113,.2),transparent 68%)}
.la-div-legend .la-rankup-name{color:#fbbf24;text-shadow:0 0 80px rgba(251,191,36,.5),0 0 20px rgba(251,191,36,.8)}
.la-div-legend .la-glow{background:radial-gradient(circle,rgba(251,191,36,.28),transparent 68%)}

/* PARTICLES */
.la-particle{position:absolute;border-radius:50%;pointer-events:none;animation:la-burst var(--dur,1.1s) var(--dly,0s) ease-out both}
@keyframes la-burst{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(0);opacity:0}}

/* BADGE UNLOCK */
.la-badge-wrap{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(130px);z-index:9000;pointer-events:none;animation:la-badge-anim 3.2s cubic-bezier(.34,1.1,.64,1) forwards}
@keyframes la-badge-anim{0%{transform:translateX(-50%) translateY(130px);opacity:0}12%{transform:translateX(-50%) translateY(0);opacity:1}80%{transform:translateX(-50%) translateY(0);opacity:1}100%{transform:translateX(-50%) translateY(130px);opacity:0}}

.la-badge-card{background:#0d0b18;border:1px solid rgba(184,159,255,.22);border-radius:18px;padding:18px 28px;display:flex;align-items:center;gap:16px;box-shadow:0 12px 56px rgba(0,0,0,.7),0 0 0 1px rgba(184,159,255,.08),0 0 40px rgba(184,159,255,.06);min-width:260px}
.la-badge-bar{width:3px;height:52px;border-radius:2px;background:linear-gradient(to bottom,#b89fff,#38bdf8);flex-shrink:0}
.la-badge-icon-wrap{font-size:44px;line-height:1;animation:la-badge-spin .75s .15s cubic-bezier(.34,1.56,.64,1) both}
@keyframes la-badge-spin{from{transform:scale(0) rotate(-200deg);opacity:0}to{transform:scale(1) rotate(0);opacity:1}}
.la-badge-title{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;color:#b89fff;text-transform:uppercase;margin-bottom:5px}
.la-badge-name{font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:4px;color:#f0edff}

/* STREAK FIRE */
.la-streak-wrap{position:fixed;top:50%;left:50%;z-index:9000;pointer-events:none;transform:translate(-50%,-50%) scale(.8);opacity:0;animation:la-streak-anim 2.6s ease forwards}
@keyframes la-streak-anim{0%{transform:translate(-50%,-50%) scale(.78);opacity:0}18%{transform:translate(-50%,-52%) scale(1.04);opacity:1}32%{transform:translate(-50%,-50%) scale(1);opacity:1}82%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,-58%) scale(.95);opacity:0}}

.la-streak-card{background:rgba(7,6,13,.96);border:1px solid rgba(251,146,60,.28);border-radius:24px;padding:28px 52px;text-align:center;box-shadow:0 0 80px rgba(251,146,60,.12),0 12px 40px rgba(0,0,0,.7)}
.la-streak-fire{font-size:56px;line-height:1;display:block;margin-bottom:8px;animation:la-fire-wave .38s ease-in-out infinite alternate}
@keyframes la-fire-wave{from{transform:scale(1) rotate(-3deg)}to{transform:scale(1.1) rotate(3deg)}}
.la-streak-count{font-family:'Bebas Neue',sans-serif;font-size:72px;letter-spacing:4px;color:#fb923c;line-height:1;text-shadow:0 0 40px rgba(251,146,60,.4)}
.la-streak-label{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:5px;color:rgba(251,146,60,.65);text-transform:uppercase;margin-top:6px}
`;
    document.head.appendChild(s);
  }

  // ── Internal helpers ─────────────────────────────────────────────────
  const PC = ['#b89fff','#38bdf8','#34d399','#fbbf24','#fb923c','#f87171','#e2e8f0'];

  function _div(picks) {
    const w = picks.filter(p => p.result === 'win').length;
    const l = picks.filter(p => p.result === 'loss').length;
    const st = picks.reduce((s, p) => s + (p.stake || 0), 0);
    const pn = picks.reduce((s, p) => s + (p.pnl || 0), 0);
    const roi = st > 0 ? (pn / st) * 100 : 0;
    const wr  = (w + l) > 0 ? (w / (w + l)) * 100 : 0;
    const sc  = Math.round(
      Math.min(40, Math.max(0, (roi / 20) * 40)) +
      Math.min(30, Math.max(0, (wr / 70) * 30)) +
      Math.min(20, Math.max(0, (picks.length / 100) * 20)) +
      Math.min(10, picks.length)
    );
    if (sc >= 90) return { name:'LEGEND',   cls:'la-div-legend',   icon:'🐐' };
    if (sc >= 75) return { name:'ELITE',    cls:'la-div-elite',    icon:'🔱' };
    if (sc >= 60) return { name:'DIAMOND',  cls:'la-div-diamond',  icon:'💎' };
    if (sc >= 45) return { name:'PLATINUM', cls:'la-div-platinum', icon:'⚡' };
    if (sc >= 30) return { name:'GOLD',     cls:'la-div-gold',     icon:'🏆' };
    if (sc >= 15) return { name:'SILVER',   cls:'la-div-silver',   icon:'🥈' };
    return { name:'BRONZE', cls:'la-div-bronze', icon:'🥉' };
  }

  function _badges(picks) {
    const w  = picks.filter(p => p.result === 'win').length;
    const l  = picks.filter(p => p.result === 'loss').length;
    const st = picks.reduce((s, p) => s + (p.stake || 0), 0);
    const pn = picks.reduce((s, p) => s + (p.pnl || 0), 0);
    const roi = st > 0 ? (pn / st) * 100 : 0;
    const wr  = (w + l) > 0 ? (w / (w + l)) * 100 : 0;
    const settled = picks.filter(p => p.result !== 'pending')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    let streak = 0;
    for (const p of settled) { if (p.result === 'win') streak++; else break; }
    const out = [];
    if (streak >= 5)                                   out.push({key:'hot5',        name:'On Fire',      icon:'🔥'});
    if (roi >= 20 && picks.length >= 50)               out.push({key:'diamond_roi', name:'Diamond ROI',  icon:'💎'});
    if (wr >= 60  && (w + l) >= 30)                   out.push({key:'sharp',       name:'Sharpshooter', icon:'🎯'});
    if (roi >= 15 && picks.length >= 10 && picks.length < 50) out.push({key:'rising', name:'Rising Star', icon:'🚀'});
    if (picks.length >= 100)                           out.push({key:'century',     name:'Century Club', icon:'👑'});
    return { list: out, streak };
  }

  // ── rankUpAnimation ──────────────────────────────────────────────────
  window.rankUpAnimation = function (div) {
    const overlay = document.createElement('div');
    overlay.className = 'la-overlay ' + div.cls;
    overlay.innerHTML =
      '<div class="la-glow"></div>' +
      '<div class="la-rankup-content">' +
        '<span class="la-rankup-label">Rank Up</span>' +
        '<span class="la-rankup-icon">' + div.icon + '</span>' +
        '<span class="la-rankup-name">' + div.name + '</span>' +
        '<span class="la-rankup-sub">New division unlocked</span>' +
        '<span class="la-rankup-tap">Tap to continue</span>' +
      '</div>';

    // Particles
    for (let i = 0; i < 32; i++) {
      const angle = (i / 32) * 360 + (Math.random() - .5) * 12;
      const dist  = 100 + Math.random() * 130;
      const dx    = Math.cos(angle * Math.PI / 180) * dist;
      const dy    = Math.sin(angle * Math.PI / 180) * dist;
      const size  = 3 + Math.random() * 5;
      const p = document.createElement('div');
      p.className = 'la-particle';
      p.style.cssText =
        'background:' + PC[i % PC.length] + ';' +
        'width:' + size + 'px;height:' + size + 'px;' +
        '--dx:' + dx.toFixed(1) + 'px;--dy:' + dy.toFixed(1) + 'px;' +
        '--dur:' + (0.75 + Math.random() * 0.55).toFixed(2) + 's;' +
        '--dly:' + (0.28 + Math.random() * 0.28).toFixed(2) + 's';
      overlay.appendChild(p);
    }

    document.body.appendChild(overlay);

    function dismiss() {
      overlay.style.transition = 'opacity .45s ease';
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 460);
    }

    overlay.addEventListener('click', dismiss);
    var tid = setTimeout(dismiss, 4000);
    overlay._tid = tid;
  };

  // ── badgeUnlockAnimation ─────────────────────────────────────────────
  window.badgeUnlockAnimation = function (badgeName, badgeIcon) {
    const wrap = document.createElement('div');
    wrap.className = 'la-badge-wrap';
    wrap.innerHTML =
      '<div class="la-badge-card">' +
        '<div class="la-badge-bar"></div>' +
        '<div class="la-badge-icon-wrap">' + badgeIcon + '</div>' +
        '<div class="la-badge-info">' +
          '<div class="la-badge-title">Badge Unlocked</div>' +
          '<div class="la-badge-name">' + badgeName + '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap);
    setTimeout(function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }, 3300);
  };

  // ── streakAnimation ──────────────────────────────────────────────────
  window.streakAnimation = function (streakCount) {
    const wrap = document.createElement('div');
    wrap.className = 'la-streak-wrap';
    wrap.innerHTML =
      '<div class="la-streak-card">' +
        '<span class="la-streak-fire">🔥</span>' +
        '<div class="la-streak-count">' + streakCount + '</div>' +
        '<div class="la-streak-label">Win Streak</div>' +
      '</div>';
    document.body.appendChild(wrap);
    setTimeout(function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }, 2700);
  };

  // ── Orchestration helpers ────────────────────────────────────────────
  window.checkRankUp = function (picks) {
    if (!picks || !picks.length) return;
    const div     = _div(picks);
    const stored  = localStorage.getItem('ledgr_division');
    // Only animate when rank genuinely improved (never on first visit)
    if (stored && stored !== div.name) window.rankUpAnimation(div);
    localStorage.setItem('ledgr_division', div.name);
    return div;
  };

  window.checkBadgeUnlock = function (picks) {
    if (!picks || !picks.length) return;
    const { list } = _badges(picks);
    var stored = [];
    try { stored = JSON.parse(localStorage.getItem('ledgr_earned_badges') || '[]'); } catch (e) {}
    const fresh = list.filter(function (b) { return stored.indexOf(b.key) === -1; });
    fresh.forEach(function (b, i) {
      setTimeout(function () { window.badgeUnlockAnimation(b.name, b.icon); }, i * 3400);
    });
    if (fresh.length) {
      localStorage.setItem('ledgr_earned_badges',
        JSON.stringify(stored.concat(fresh.map(function (b) { return b.key; }))));
    }
  };

  window.checkStreak = function (picks) {
    if (!picks || !picks.length) return;
    const { streak } = _badges(picks);
    var prev = 0;
    try { prev = parseInt(localStorage.getItem('ledgr_last_streak') || '0', 10); } catch (e) {}
    // Only show for streaks ≥ 3 that are higher than last known
    if (streak >= 3 && streak > prev) window.streakAnimation(streak);
    localStorage.setItem('ledgr_last_streak', String(streak));
  };

})();
