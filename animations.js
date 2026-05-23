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
@keyframes la-bg-in{to{background:rgba(6,5,8,.95)}}

.la-rankup-content{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:10px;transform:scale(.72) translateY(28px);opacity:0;animation:la-cnt-in .5s .2s cubic-bezier(.34,1.56,.64,1) forwards}
@keyframes la-cnt-in{to{transform:scale(1) translateY(0);opacity:1}}

.la-rankup-label{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:6px;color:rgba(240,237,255,.45);text-transform:uppercase;margin-bottom:4px}
.la-rankup-icon{font-size:72px;line-height:1;display:block;animation:la-icon-bounce .7s .45s ease both}
@keyframes la-icon-bounce{0%{transform:scale(1)}40%{transform:scale(1.38)}70%{transform:scale(.91)}100%{transform:scale(1)}}

.la-rankup-name{font-family:'Bebas Neue',sans-serif;font-size:76px;letter-spacing:10px;line-height:1;color:#f0edff;text-shadow:0 0 60px rgba(184,159,255,.25)}
.la-rankup-headline{font-family:'DM Mono',monospace;font-size:12px;letter-spacing:5px;text-transform:uppercase;margin-top:4px;opacity:.7}
.la-rankup-sub{font-family:'DM Mono',monospace;font-size:10px;color:rgba(240,237,255,.28);letter-spacing:2px;margin-top:2px}
.la-rankup-tap{font-family:'DM Mono',monospace;font-size:9px;color:rgba(240,237,255,.2);letter-spacing:2px;margin-top:18px;animation:la-blink 1.5s .8s infinite}
@keyframes la-blink{0%,100%{opacity:.2}50%{opacity:.5}}

/* GLOW ORB */
.la-glow{position:absolute;z-index:1;width:520px;height:520px;border-radius:50%;pointer-events:none;animation:la-glow-pulse 3s ease-in-out infinite}
@keyframes la-glow-pulse{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:.9;transform:scale(1.08)}}

/* LEGENDARY ROTATING RAYS */
.la-rays{position:absolute;inset:0;z-index:0;pointer-events:none;
  background:conic-gradient(from 0deg at 50% 50%,
    transparent 0deg,rgba(251,191,36,.05) 20deg,transparent 40deg,
    rgba(184,159,255,.04) 60deg,transparent 80deg,
    rgba(251,191,36,.04) 100deg,transparent 120deg,
    rgba(56,189,248,.04) 140deg,transparent 180deg,
    rgba(251,191,36,.05) 200deg,transparent 220deg,
    rgba(184,159,255,.04) 240deg,transparent 260deg,
    rgba(251,191,36,.04) 280deg,transparent 300deg,
    rgba(56,189,248,.03) 320deg,transparent 360deg);
  animation:la-rays-spin 14s linear infinite}
@keyframes la-rays-spin{to{transform:rotate(360deg)}}

/* DIVISION COLOURS */
.la-div-bronze .la-rankup-name{color:#c17f55;text-shadow:0 0 50px rgba(193,127,85,.3)}
.la-div-bronze .la-rankup-headline{color:rgba(193,127,85,.7)}
.la-div-bronze .la-glow{background:radial-gradient(circle,rgba(193,127,85,.22),transparent 68%)}

.la-div-silver .la-rankup-name{color:var(--silver);text-shadow:0 0 50px rgba(148,163,184,.25)}
.la-div-silver .la-rankup-headline{color:rgba(148,163,184,.65)}
.la-div-silver .la-glow{background:radial-gradient(circle,rgba(148,163,184,.18),transparent 68%)}

.la-div-gold .la-rankup-name{color:var(--gold);text-shadow:0 0 60px rgba(251,191,36,.4)}
.la-div-gold .la-rankup-headline{color:rgba(251,191,36,.75)}
.la-div-gold .la-glow{background:radial-gradient(circle,rgba(251,191,36,.22),transparent 68%)}

.la-div-platinum .la-rankup-name{color:var(--cyan);text-shadow:0 0 60px rgba(56,189,248,.35)}
.la-div-platinum .la-rankup-headline{color:rgba(56,189,248,.7)}
.la-div-platinum .la-glow{background:radial-gradient(circle,rgba(56,189,248,.2),transparent 68%)}

.la-div-diamond .la-rankup-name{color:var(--ac);text-shadow:0 0 60px rgba(184,159,255,.4)}
.la-div-diamond .la-rankup-headline{color:rgba(184,159,255,.75)}
.la-div-diamond .la-glow{background:radial-gradient(circle,rgba(184,159,255,.25),transparent 68%);animation:la-glow-pulse 2s ease-in-out infinite}

.la-div-elite .la-rankup-name{color:#e879a0;text-shadow:0 0 70px rgba(232,121,160,.4),0 0 20px rgba(232,121,160,.6)}
.la-div-elite .la-rankup-headline{color:rgba(232,121,160,.75)}
.la-div-elite .la-glow{background:radial-gradient(circle,rgba(232,121,160,.22),transparent 68%);animation:la-glow-pulse 1.8s ease-in-out infinite}

.la-div-legend .la-rankup-name{color:var(--gold);font-size:88px;text-shadow:0 0 80px rgba(251,191,36,.55),0 0 24px rgba(251,191,36,.8)}
.la-div-legend .la-rankup-headline{color:rgba(251,191,36,.8);font-size:13px;letter-spacing:6px}
.la-div-legend .la-glow{width:700px;height:700px;background:radial-gradient(circle,rgba(251,191,36,.28),transparent 65%);animation:la-glow-pulse 2s ease-in-out infinite,la-legend-double 4s ease-in-out infinite}
@keyframes la-legend-double{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}

/* Gold+ name pulse — subtle extra energy for mid-high tiers */
.la-div-gold .la-rankup-name,.la-div-platinum .la-rankup-name,
.la-div-diamond .la-rankup-name,.la-div-elite .la-rankup-name,
.la-div-legend .la-rankup-name{
  animation:la-icon-bounce .7s .45s ease both,la-name-energy 2s .8s ease-in-out infinite
}
@keyframes la-name-energy{0%,100%{opacity:1}50%{opacity:.88}}

/* PARTICLES */
.la-particle{position:absolute;border-radius:50%;pointer-events:none;animation:la-burst var(--dur,1.1s) var(--dly,0s) ease-out both}
@keyframes la-burst{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(0);opacity:0}}
.la-particle.sq{border-radius:2px;animation:la-burst-sq var(--dur,1.1s) var(--dly,0s) ease-out both}
@keyframes la-burst-sq{0%{transform:translate(0,0) scale(1) rotate(0deg);opacity:1}100%{transform:translate(var(--dx),var(--dy)) scale(0) rotate(var(--rot,360deg));opacity:0}}

/* BADGE UNLOCK TOAST (legacy — used by old checkBadgeUnlock) */
.la-badge-wrap{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(130px);z-index:9000;pointer-events:none;animation:la-badge-anim 4.5s cubic-bezier(.34,1.1,.64,1) forwards}
@keyframes la-badge-anim{0%{transform:translateX(-50%) translateY(130px);opacity:0}9%{transform:translateX(-50%) translateY(0);opacity:1}87%{transform:translateX(-50%) translateY(0);opacity:1}100%{transform:translateX(-50%) translateY(130px);opacity:0}}

.la-badge-card{background:var(--s1);border:1px solid rgba(184,159,255,.22);border-radius:18px;padding:18px 28px;display:flex;align-items:center;gap:16px;box-shadow:0 12px 56px rgba(0,0,0,.7),0 0 0 1px rgba(184,159,255,.08),0 0 40px rgba(184,159,255,.06);min-width:260px}
.la-badge-bar{width:3px;height:52px;border-radius:2px;background:linear-gradient(to bottom,var(--ac),var(--cyan));flex-shrink:0}
.la-badge-icon-wrap{font-size:44px;line-height:1;animation:la-badge-spin .75s .15s cubic-bezier(.34,1.56,.64,1) both}
@keyframes la-badge-spin{from{transform:scale(0) rotate(-200deg);opacity:0}to{transform:scale(1) rotate(0);opacity:1}}
.la-badge-title{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:3px;color:var(--ac);text-transform:uppercase;margin-bottom:5px}
.la-badge-name{font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:4px;color:var(--tx)}

/* STREAK FIRE */
.la-streak-wrap{position:fixed;top:50%;left:50%;z-index:9000;pointer-events:none;transform:translate(-50%,-50%) scale(.8);opacity:0;animation:la-streak-anim 2.5s ease forwards}
@keyframes la-streak-anim{0%{transform:translate(-50%,-50%) scale(.78);opacity:0}18%{transform:translate(-50%,-52%) scale(1.04);opacity:1}32%{transform:translate(-50%,-50%) scale(1);opacity:1}82%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(-50%,-58%) scale(.95);opacity:0}}

.la-streak-card{background:rgba(7,6,13,.96);border:1px solid rgba(251,146,60,.28);border-radius:24px;padding:28px 52px;text-align:center;box-shadow:0 0 80px rgba(251,146,60,.14),0 12px 40px rgba(0,0,0,.7)}
.la-streak-fire{font-size:56px;line-height:1;display:block;margin-bottom:8px;animation:la-fire-wave 0.6s ease-in-out infinite alternate}
@keyframes la-fire-wave{from{transform:scale(1) rotate(-3deg)}to{transform:scale(1.1) rotate(3deg)}}
.la-streak-count{font-family:'Bebas Neue',sans-serif;font-size:72px;letter-spacing:4px;color:#fb923c;line-height:1;text-shadow:0 0 40px rgba(251,146,60,.4)}
.la-streak-label{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:5px;color:rgba(251,146,60,.65);text-transform:uppercase;margin-top:6px}

/* STREAK BROKEN */
.la-streak-broken-card{background:rgba(7,6,13,.96);border:1px solid rgba(148,163,184,.12);border-radius:24px;padding:28px 52px;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,.5)}
.la-streak-broken-count{font-family:'Bebas Neue',sans-serif;font-size:72px;letter-spacing:4px;color:rgba(148,163,184,.35);line-height:1}
.la-streak-broken-lbl{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:4px;color:rgba(148,163,184,.4);text-transform:uppercase;margin-top:6px}
.la-streak-broken-sub{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;color:rgba(148,163,184,.25);margin-top:8px}

/* DIVISION DROPPED */
.la-divdown-overlay{position:fixed;inset:0;z-index:8900;display:flex;align-items:center;justify-content:center;cursor:pointer;background:rgba(6,5,8,0);animation:la-dd-bg .3s ease forwards}
@keyframes la-dd-bg{to{background:rgba(6,5,8,.88)}}
.la-divdown-card{background:#0d0508;border:1px solid rgba(255,51,85,.22);border-radius:20px;padding:36px 52px;text-align:center;box-shadow:0 0 60px rgba(255,51,85,.1),0 20px 60px rgba(0,0,0,.7);transform:scale(.82) translateY(20px);opacity:0;animation:la-dd-in .45s .15s cubic-bezier(.34,1.4,.64,1) forwards}
@keyframes la-dd-in{to{transform:scale(1) translateY(0);opacity:1}}
.la-divdown-eyebrow{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:5px;color:rgba(255,51,85,.6);text-transform:uppercase;margin-bottom:10px}
.la-divdown-headline{font-family:'Bebas Neue',sans-serif;font-size:52px;letter-spacing:6px;color:#ff3355;line-height:1;text-shadow:0 0 40px rgba(255,51,85,.3);margin-bottom:8px}
.la-divdown-division{font-family:'DM Mono',monospace;font-size:13px;letter-spacing:3px;color:rgba(230,200,210,.6);margin-bottom:24px}
.la-divdown-cta{display:inline-block;padding:10px 28px;border-radius:10px;background:rgba(255,51,85,.12);border:1px solid rgba(255,51,85,.3);font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:3px;color:#ff8899;text-decoration:none;cursor:pointer;transition:background .2s}
.la-divdown-cta:hover{background:rgba(255,51,85,.22)}
.la-divdown-tap{font-family:'DM Mono',monospace;font-size:9px;color:rgba(240,237,255,.18);letter-spacing:2px;margin-top:16px;animation:la-blink 1.5s .6s infinite}

/* ── SEASON END ── */
.la-season-overlay{position:fixed;inset:0;z-index:9100;display:flex;align-items:center;justify-content:center;cursor:pointer;background:rgba(4,3,9,0);animation:la-sn-bg .5s ease forwards}
@keyframes la-sn-bg{to{background:rgba(4,3,9,.97)}}
.la-season-rays{position:absolute;inset:0;background:conic-gradient(from 0deg at 50% 50%,transparent 0deg,rgba(251,191,36,.04) 20deg,transparent 40deg,rgba(184,159,255,.04) 60deg,transparent 80deg,rgba(251,191,36,.03) 100deg,transparent 120deg,rgba(56,189,248,.03) 140deg,transparent 180deg,rgba(251,191,36,.04) 200deg,transparent 220deg,rgba(184,159,255,.04) 240deg,transparent 260deg,rgba(251,191,36,.03) 280deg,transparent 300deg,rgba(56,189,248,.03) 320deg,transparent 360deg);animation:la-sn-spin 20s linear infinite;pointer-events:none}
@keyframes la-sn-spin{to{transform:rotate(360deg)}}
.la-season-content{position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:10px;transform:scale(.7) translateY(40px);opacity:0;animation:la-sn-in .6s .3s cubic-bezier(.34,1.4,.64,1) forwards;text-align:center;padding:0 24px}
@keyframes la-sn-in{to{transform:scale(1) translateY(0);opacity:1}}
.la-sn-season{font-family:'DM Mono',monospace;font-size:11px;letter-spacing:6px;color:rgba(251,191,36,.7);text-transform:uppercase;margin-bottom:4px}
.la-sn-title{font-family:'Bebas Neue',sans-serif;font-size:clamp(22px,4vw,32px);letter-spacing:8px;color:rgba(240,237,255,.55);margin-bottom:4px}
.la-sn-crown{font-size:64px;line-height:1;animation:la-sn-crown-bounce .8s .6s cubic-bezier(.34,1.56,.64,1) both}
@keyframes la-sn-crown-bounce{from{transform:scale(0) rotate(-20deg);opacity:0}to{transform:scale(1) rotate(0);opacity:1}}
.la-sn-name{font-family:'Bebas Neue',sans-serif;font-size:clamp(56px,10vw,96px);letter-spacing:6px;line-height:1;color:var(--gold);text-shadow:0 0 80px rgba(251,191,36,.5),0 0 24px rgba(251,191,36,.7);margin:4px 0}
.la-sn-div{display:inline-flex;align-items:center;gap:6px;padding:5px 16px;border-radius:20px;background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.3);font-family:'DM Mono',monospace;font-size:10px;font-weight:700;letter-spacing:2px;color:var(--gold);margin-bottom:8px}
.la-sn-stats{display:flex;gap:24px;flex-wrap:wrap;justify-content:center;margin-top:4px}
.la-sn-stat{text-align:center}
.la-sn-stat-val{font-family:'Bebas Neue',sans-serif;font-size:28px;letter-spacing:2px;color:#f0edff;line-height:1}
.la-sn-stat-lbl{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;color:rgba(240,237,255,.35);text-transform:uppercase;margin-top:2px}
.la-sn-tap{font-family:'DM Mono',monospace;font-size:9px;letter-spacing:2px;color:rgba(240,237,255,.2);margin-top:24px;animation:la-blink 1.5s 1s infinite}
.la-sn-glow{position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(251,191,36,.14),transparent 70%);pointer-events:none;animation:la-glow-pulse 3s ease-in-out infinite}
`;

    document.head.appendChild(s);
  }

  // ── Division ceremony copy + particle palette ────────────────────────
  var DIV_COPY = {
    'la-div-bronze':   {
      headline: 'WELCOME TO THE GAME',
      sub:      'Your record begins here.',
      pcount:   20,
      pcols:    ['#c17f55','#d4956e','#a06040','#e8b090','#8a4530']
    },
    'la-div-silver':   {
      headline: 'THE RECORD GROWS',
      sub:      'Consistency is the edge.',
      pcount:   24,
      pcols:    ['#94a3b8','#b0bece','#e2e8f0','#64748b','#cbd5e1']
    },
    'la-div-gold':     {
      headline: 'CERTIFIED PERFORMER',
      sub:      'The market is noticing.',
      pcount:   32,
      pcols:    ['#fbbf24','#f59e0b','#fcd34d','#fb923c','#d97706']
    },
    'la-div-platinum': {
      headline: 'ELITE TERRITORY',
      sub:      'Fewer than 20% reach this.',
      pcount:   42,
      pcols:    ['#38bdf8','#7dd3fc','#0ea5e9','#06b6d4','#0284c7','#bae6fd']
    },
    'la-div-diamond':  {
      headline: 'THE SHARP CIRCLE',
      sub:      'This level demands precision.',
      pcount:   52,
      pcols:    ['#b89fff','#c4b5fd','#8b5cf6','#a78bfa','#7c3aed','#ddd6fe','#38bdf8']
    },
    'la-div-elite':    {
      headline: 'TOP ECHELON',
      sub:      'You are among the rarest.',
      pcount:   60,
      pcols:    ['#e879a0','#f43f5e','#fb923c','#b89fff','#38bdf8','#f87171','#fbbf24','#34d399']
    },
    'la-div-legend':   {
      headline: 'HISTORY MAKER',
      sub:      'The LEDGR records this moment.',
      pcount:   80,
      pcols:    ['#fbbf24','#f59e0b','#fb923c','#34d399','#38bdf8','#b89fff','#f0edff','#f43f5e','#fcd34d']
    }
  };

  // ── Internal helpers ─────────────────────────────────────────────────
  function _div(picks) {
    const w  = picks.filter(p => p.result === 'win').length;
    const l  = picks.filter(p => p.result === 'loss').length;
    const st = picks.reduce((s, p) => s + (p.stake || 0), 0);
    const pn = picks.reduce((s, p) => s + (p.pnl   || 0), 0);
    const roi = st > 0 ? (pn / st) * 100 : 0;
    const wr  = (w + l) > 0 ? (w / (w + l)) * 100 : 0;
    const sc  = Math.round(
      Math.min(40, Math.max(0, (roi / 20) * 40)) +
      Math.min(30, Math.max(0, (wr  / 70) * 30)) +
      Math.min(20, Math.max(0, (picks.length / 100) * 20)) +
      Math.min(10, picks.length)
    );
    if (sc >= 90) return { name:'LEGENDARY', cls:'la-div-legend',   icon:'◉' };
    if (sc >= 75) return { name:'ELITE',     cls:'la-div-elite',    icon:'⊕' };
    if (sc >= 60) return { name:'DIAMOND',   cls:'la-div-diamond',  icon:'✦' };
    if (sc >= 45) return { name:'PLATINUM',  cls:'la-div-platinum', icon:'⬡' };
    if (sc >= 30) return { name:'GOLD',      cls:'la-div-gold',     icon:'★' };
    if (sc >= 15) return { name:'SILVER',    cls:'la-div-silver',   icon:'◆' };
    return { name:'BRONZE', cls:'la-div-bronze', icon:'▲' };
  }

  function _badges(picks) {
    const w  = picks.filter(p => p.result === 'win').length;
    const l  = picks.filter(p => p.result === 'loss').length;
    const st = picks.reduce((s, p) => s + (p.stake || 0), 0);
    const pn = picks.reduce((s, p) => s + (p.pnl   || 0), 0);
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

  // ── Spawn a single particle onto an element ──────────────────────────
  function _spawnParticle(parent, color, options) {
    options = options || {};
    var angle = options.angle !== undefined ? options.angle : Math.random() * 360;
    var dist  = options.minDist + Math.random() * (options.maxDist - options.minDist);
    var dx    = Math.cos(angle * Math.PI / 180) * dist;
    var dy    = Math.sin(angle * Math.PI / 180) * dist;
    var size  = options.minSize + Math.random() * (options.maxSize - options.minSize);
    var dur   = options.minDur  + Math.random() * (options.maxDur  - options.minDur);
    var dly   = options.minDly  + Math.random() * (options.maxDly  - options.minDly);
    var isSquare = options.allowSq && Math.random() > 0.65;
    var p = document.createElement('div');
    p.className = 'la-particle' + (isSquare ? ' sq' : '');
    p.style.cssText =
      'background:' + color + ';' +
      'width:' + size.toFixed(1) + 'px;height:' + size.toFixed(1) + 'px;' +
      '--dx:' + dx.toFixed(1) + 'px;--dy:' + dy.toFixed(1) + 'px;' +
      '--dur:' + dur.toFixed(2) + 's;' +
      '--dly:' + dly.toFixed(2) + 's;' +
      (isSquare ? '--rot:' + (Math.random() > .5 ? 360 : -360) + 'deg;' : '');
    parent.appendChild(p);
    return p;
  }

  // ── rankUpAnimation ──────────────────────────────────────────────────
  window.rankUpAnimation = function (div) {
    var copy     = DIV_COPY[div.cls] || { headline:'RANK UP', sub:'New division unlocked.', pcount:32, pcols:['#b89fff','#38bdf8','#34d399','#fbbf24','#fb923c'] };
    var isLegend = div.cls === 'la-div-legend';
    var isElite  = div.cls === 'la-div-elite';

    var overlay = document.createElement('div');
    overlay.className = 'la-overlay ' + div.cls;

    overlay.innerHTML =
      '<div class="la-glow"></div>' +
      (isLegend ? '<div class="la-rays"></div>' : '') +
      '<div class="la-rankup-content">' +
        '<span class="la-rankup-label">DIVISION REACHED</span>' +
        '<span class="la-rankup-icon">' + div.icon + '</span>' +
        '<span class="la-rankup-name">' + div.name + '</span>' +
        '<span class="la-rankup-headline">' + copy.headline + '</span>' +
        '<span class="la-rankup-sub">' + copy.sub + '</span>' +
        '<span class="la-rankup-tap">Tap to continue</span>' +
      '</div>';

    // ── Primary particle burst ───────────────────────────────────────
    var n = copy.pcount;
    for (var i = 0; i < n; i++) {
      _spawnParticle(overlay, copy.pcols[i % copy.pcols.length], {
        angle:   (i / n) * 360 + (Math.random() - .5) * (360 / n * 1.6),
        minDist: 80, maxDist: isLegend ? 220 : isElite ? 180 : 150,
        minSize: isLegend ? 3.5 : 3, maxSize: 8,
        minDur:  0.7, maxDur: isLegend ? 1.4 : 1.15,
        minDly:  0.25, maxDly: 0.45,
        allowSq: isLegend || isElite
      });
    }

    // ── Legendary: second burst at 700ms ────────────────────────────
    if (isLegend) {
      setTimeout(function () {
        for (var j = 0; j < 30; j++) {
          _spawnParticle(overlay, copy.pcols[j % copy.pcols.length], {
            angle:   Math.random() * 360,
            minDist: 40, maxDist: 200,
            minSize: 2.5, maxSize: 7,
            minDur:  0.55, maxDur: 1.0,
            minDly:  0, maxDly: 0.08,
            allowSq: true
          });
        }
      }, 700);
    }

    document.body.appendChild(overlay);

    function dismiss() {
      overlay.style.transition = 'opacity .5s ease';
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 520);
    }

    overlay.addEventListener('click', dismiss);
    var autoTime = isLegend ? 6500 : (isElite || div.cls === 'la-div-diamond' ? 5000 : 4000);
    setTimeout(dismiss, autoTime);
  };

  // ── badgeUnlockAnimation (legacy toast — used by old checkBadgeUnlock) ─
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
    setTimeout(function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }, 4600);
  };

  // ── divisionDownAnimation ────────────────────────────────────────────
  window.divisionDownAnimation = function (newDivName) {
    newDivName = (newDivName || 'BRONZE').toUpperCase();
    var overlay = document.createElement('div');
    overlay.className = 'la-divdown-overlay';
    overlay.innerHTML =
      '<div class="la-divdown-card">' +
        '<div class="la-divdown-eyebrow">DIVISION CHANGE</div>' +
        '<div class="la-divdown-headline">DIVISION DROPPED</div>' +
        '<div class="la-divdown-division">Now in ' + newDivName + '</div>' +
        '<a class="la-divdown-cta" href="/dashboard">Fight back →</a>' +
        '<div class="la-divdown-tap">Tap to dismiss</div>' +
      '</div>';
    document.body.appendChild(overlay);
    function dismiss() {
      overlay.style.transition = 'opacity .4s ease';
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 420);
    }
    overlay.addEventListener('click', dismiss);
    setTimeout(dismiss, 4000);
  };

  // ── streakAnimation ──────────────────────────────────────────────────
  window.streakAnimation = function (streakCount, opts) {
    opts = opts || {};
    var isBroken = opts.broken || false;

    var wrap = document.createElement('div');
    wrap.className = 'la-streak-wrap';

    if (isBroken) {
      wrap.innerHTML =
        '<div class="la-streak-broken-card">' +
          '<div class="la-streak-broken-count">' + streakCount + '</div>' +
          '<div class="la-streak-broken-lbl">WIN STREAK — ENDED</div>' +
          '<div class="la-streak-broken-sub">RECORD STANDS</div>' +
        '</div>';
    } else {
      var label = streakCount >= 10 ? 'UNSTOPPABLE' : streakCount >= 7 ? 'ON FIRE' : 'WIN STREAK';
      wrap.innerHTML =
        '<div class="la-streak-card">' +
          '<span class="la-streak-fire">🔥</span>' +
          '<div class="la-streak-count">' + streakCount + '</div>' +
          '<div class="la-streak-label">' + label + '</div>' +
        '</div>';
    }

    document.body.appendChild(wrap);
    setTimeout(function () { if (wrap.parentNode) wrap.parentNode.removeChild(wrap); }, 2600);
  };

  // ── Orchestration helpers ────────────────────────────────────────────
  window.checkRankUp = function (picks) {
    if (!picks || !picks.length) return;
    const div    = _div(picks);
    const stored = localStorage.getItem('ledgr_division');
    if (stored && stored !== div.name) {
      if (window.Moments) window.Moments.rankUp(stored, div.name);
      else window.rankUpAnimation(div);
    }
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

  // ── seasonEndAnimation ───────────────────────────────────────────────
  window.seasonEndAnimation = function (champion, stats) {
    stats = stats || {};
    var overlay = document.createElement('div');
    overlay.className = 'la-season-overlay';

    var seasonLabel = stats.seasonName || ('SEASON ' + (stats.seasonNumber || ''));
    var divSymbol   = stats.division ? ({LEGENDARY:'◉',ELITE:'⊕',DIAMOND:'✦',PLATINUM:'⬡',GOLD:'★',SILVER:'◆',BRONZE:'▲'}[stats.division] || '★') : '★';

    var statsHtml = '';
    if (stats.roi != null)     statsHtml += '<div class="la-sn-stat"><div class="la-sn-stat-val">' + (stats.roi >= 0 ? '+' : '') + parseFloat(stats.roi).toFixed(1) + '%</div><div class="la-sn-stat-lbl">ROI</div></div>';
    if (stats.winRate != null) statsHtml += '<div class="la-sn-stat"><div class="la-sn-stat-val">' + parseFloat(stats.winRate).toFixed(0) + '%</div><div class="la-sn-stat-lbl">Win Rate</div></div>';
    if (stats.picks != null)   statsHtml += '<div class="la-sn-stat"><div class="la-sn-stat-val">' + stats.picks + '</div><div class="la-sn-stat-lbl">Picks</div></div>';

    overlay.innerHTML =
      '<div class="la-sn-glow"></div>' +
      '<div class="la-season-rays"></div>' +
      '<div class="la-season-content">' +
        '<div class="la-sn-season">' + seasonLabel + '</div>' +
        '<div class="la-sn-title">SEASON CHAMPION</div>' +
        '<div class="la-sn-crown">👑</div>' +
        '<div class="la-sn-name">@' + champion + '</div>' +
        (stats.division ? '<div class="la-sn-div">' + divSymbol + ' ' + stats.division + '</div>' : '') +
        (statsHtml ? '<div class="la-sn-stats">' + statsHtml + '</div>' : '') +
        '<div class="la-sn-tap">Tap to continue</div>' +
      '</div>';

    var confettiColors = ['#fbbf24','#b89fff','#34d399','#38bdf8','#fb923c','#f87171','#f0edff'];
    for (var i = 0; i < 56; i++) {
      _spawnParticle(overlay, confettiColors[i % confettiColors.length], {
        angle:   (i / 56) * 360 + (Math.random() - .5) * 14,
        minDist: 120, maxDist: 220,
        minSize: 3,   maxSize: 9,
        minDur:  1.0, maxDur:  1.8,
        minDly:  0.3, maxDly:  0.8,
        allowSq: true
      });
    }

    document.body.appendChild(overlay);

    function dismiss() {
      overlay.style.transition = 'opacity .5s ease';
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
      setTimeout(function () { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 520);
    }

    overlay.addEventListener('click', dismiss);
    setTimeout(dismiss, 8000);
  };

  window.checkStreak = function (picks) {
    if (!picks || !picks.length) return;
    const { streak } = _badges(picks);
    var prev = 0;
    try { prev = parseInt(localStorage.getItem('ledgr_last_streak') || '0', 10); } catch (e) {}

    if (streak >= 3 && streak > prev) {
      window.streakAnimation(streak);
    } else if (streak === 0 && prev >= 3) {
      // Streak was broken — acknowledge the run
      window.streakAnimation(prev, { broken: true });
    }

    localStorage.setItem('ledgr_last_streak', String(streak));
  };

})();
