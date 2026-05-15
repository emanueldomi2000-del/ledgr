(function () {
  'use strict';

  // ── CSS injection ────────────────────────────────────────────────
  function injectCSS() {
    if (document.getElementById('ledgr-bs-css')) return;
    const s = document.createElement('style');
    s.id = 'ledgr-bs-css';
    s.textContent = `
/* ═══════════════════════════════════════════════════════════════
   LEDGR BADGE SYSTEM v2
   ═══════════════════════════════════════════════════════════════ */

/* ── Unlock overlay ── */
.bs-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;
  background:rgba(7,6,13,.9);backdrop-filter:blur(16px);cursor:pointer;animation:bs-fade-in .25s ease}
@keyframes bs-fade-in{from{opacity:0}to{opacity:1}}

.bs-panel{position:relative;z-index:2;text-align:center;padding:40px 32px 32px;
  background:#0c0a1a;border-radius:24px;max-width:360px;width:calc(100vw - 48px);
  animation:bs-panel-in .55s cubic-bezier(.34,1.56,.64,1) both}
@keyframes bs-panel-in{from{opacity:0;transform:scale(.55) translateY(28px)}to{opacity:1;transform:none}}

.bs-overlay-lbl{font-family:'DM Mono',monospace;font-size:10px;letter-spacing:4px;
  text-transform:uppercase;margin-bottom:20px;opacity:.65}

.bs-ov-icon{font-size:72px;line-height:1;margin-bottom:18px;display:block;
  animation:bs-icon-pop .6s .1s cubic-bezier(.34,1.56,.64,1) both}
@keyframes bs-icon-pop{from{opacity:0;transform:scale(.2) rotate(-15deg)}to{opacity:1;transform:none}}

.bs-ov-rarity-pill{display:inline-block;padding:3px 14px;border-radius:20px;
  font-family:'DM Mono',monospace;font-size:9px;font-weight:700;letter-spacing:2px;
  text-transform:uppercase;margin-bottom:14px}

.bs-ov-name{font-family:'Bebas Neue',sans-serif;font-size:30px;letter-spacing:3px;
  color:#f0edff;margin-bottom:8px}
.bs-ov-desc{font-size:13px;color:#9590b8;line-height:1.65;margin-bottom:24px;
  font-family:'Syne',sans-serif}
.bs-ov-dismiss{font-family:'DM Mono',monospace;font-size:10px;color:#6a6690;letter-spacing:2px}

/* Rarity-specific panel borders */
.bs-panel.r-common   {border:1px solid rgba(148,163,184,.35)}
.bs-panel.r-rare     {border:1px solid rgba(56,189,248,.45);box-shadow:0 0 40px rgba(56,189,248,.12)}
.bs-panel.r-epic     {border:1px solid rgba(184,159,255,.55);box-shadow:0 0 50px rgba(184,159,255,.18)}
.bs-panel.r-legendary{border:1px solid rgba(251,191,36,.6);box-shadow:0 0 60px rgba(251,191,36,.25);
  animation:bs-panel-in .55s cubic-bezier(.34,1.56,.64,1) both, bs-legend-border 2s .5s linear infinite}
@keyframes bs-legend-border{
  0%  {border-color:rgba(251,191,36,.6);box-shadow:0 0 60px rgba(251,191,36,.25)}
  33% {border-color:rgba(184,159,255,.6);box-shadow:0 0 60px rgba(184,159,255,.22)}
  66% {border-color:rgba(56,189,248,.6);box-shadow:0 0 60px rgba(56,189,248,.22)}
  100%{border-color:rgba(251,191,36,.6);box-shadow:0 0 60px rgba(251,191,36,.25)}
}

/* Floating particles */
.bs-particle{position:fixed;border-radius:50%;pointer-events:none;z-index:9998;
  animation:bs-burst var(--dur,.8s) ease-out forwards}
@keyframes bs-burst{
  0%  {opacity:1;transform:translate(0,0) scale(1)}
  100%{opacity:0;transform:translate(var(--bx,0px),var(--by,-80px)) scale(.2)}
}
.bs-particle.sq{border-radius:2px;animation:bs-burst-spin var(--dur,.8s) ease-out forwards}
@keyframes bs-burst-spin{
  0%  {opacity:1;transform:translate(0,0) scale(1) rotate(0deg)}
  100%{opacity:0;transform:translate(var(--bx,0px),var(--by,-80px)) scale(.2) rotate(var(--rot,360deg))}
}

/* ── Badge cards (used in badges/index.html) ── */
.bg-card{position:relative;border-radius:18px;padding:22px;
  background:#0c0a1a;border:1px solid rgba(184,159,255,.08);
  transition:transform .25s,box-shadow .25s;overflow:hidden;cursor:default}
.bg-card.bg-unlocked:hover{transform:translateY(-4px)}
.bg-card.bg-locked{opacity:.42}

/* Rarity card glows (unlocked only) */
.bg-card.bg-unlocked.r-common   {border-color:rgba(148,163,184,.28)}
.bg-card.bg-unlocked.r-rare     {border-color:rgba(56,189,248,.38);box-shadow:0 0 22px rgba(56,189,248,.07)}
.bg-card.bg-unlocked.r-epic     {border-color:rgba(184,159,255,.48);box-shadow:0 0 28px rgba(184,159,255,.1)}
.bg-card.bg-unlocked.r-legendary{border-color:rgba(251,191,36,.55);box-shadow:0 0 36px rgba(251,191,36,.14);
  animation:bg-legend-pulse 2.5s ease-in-out infinite}
@keyframes bg-legend-pulse{
  0%,100%{box-shadow:0 0 36px rgba(251,191,36,.14)}
  50%     {box-shadow:0 0 52px rgba(251,191,36,.28)}
}

/* Corner glow blob */
.bg-corner-glow{position:absolute;top:-30px;right:-30px;width:100px;height:100px;
  border-radius:50%;filter:blur(28px);pointer-events:none;opacity:0;transition:opacity .4s}
.bg-unlocked .bg-corner-glow{opacity:.18}
.r-common  .bg-corner-glow{background:#94a3b8}
.r-rare    .bg-corner-glow{background:#38bdf8}
.r-epic    .bg-corner-glow{background:#b89fff}
.r-legendary .bg-corner-glow{background:#fbbf24;opacity:.22}

/* Icon area */
.bg-icon-wrap{position:relative;display:inline-flex;align-items:center;justify-content:center;
  width:56px;height:56px;border-radius:14px;margin-bottom:14px;
  background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06)}
.bg-icon-wrap .bg-icon{font-size:28px;line-height:1;display:block}
.bg-unlocked.r-common   .bg-icon-wrap{box-shadow:0 0 16px rgba(148,163,184,.25)}
.bg-unlocked.r-rare     .bg-icon-wrap{box-shadow:0 0 18px rgba(56,189,248,.35)}
.bg-unlocked.r-epic     .bg-icon-wrap{box-shadow:0 0 22px rgba(184,159,255,.45)}
.bg-unlocked.r-legendary .bg-icon-wrap{
  box-shadow:0 0 26px rgba(251,191,36,.55);
  animation:bg-icon-legend 2s ease-in-out infinite}
@keyframes bg-icon-legend{
  0%,100%{box-shadow:0 0 26px rgba(251,191,36,.55)}
  50%     {box-shadow:0 0 40px rgba(251,191,36,.8)}
}

/* Locked overlay */
.bg-lock-icon{position:absolute;bottom:4px;right:4px;font-size:13px;opacity:.5}

/* Rarity pill */
.bg-rarity-pill{display:inline-block;padding:2px 10px;border-radius:20px;
  font-family:'DM Mono',monospace;font-size:9px;font-weight:700;letter-spacing:1.5px;
  text-transform:uppercase;margin-bottom:10px}
.r-common   .bg-rarity-pill{background:rgba(148,163,184,.1);border:1px solid rgba(148,163,184,.25);color:#94a3b8}
.r-rare     .bg-rarity-pill{background:rgba(56,189,248,.1);border:1px solid rgba(56,189,248,.28);color:#38bdf8}
.r-epic     .bg-rarity-pill{background:rgba(184,159,255,.12);border:1px solid rgba(184,159,255,.35);color:#b89fff}
.r-legendary .bg-rarity-pill{background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.38);color:#fbbf24;
  animation:bg-legend-pill 2s ease-in-out infinite}
@keyframes bg-legend-pill{
  0%,100%{text-shadow:none}
  50%     {text-shadow:0 0 10px rgba(251,191,36,.7)}
}

.bg-name{font-family:'Bebas Neue',sans-serif;font-size:19px;letter-spacing:2px;
  color:#f0edff;margin-bottom:5px}
.bg-desc{font-size:11.5px;color:#9590b8;line-height:1.6;margin-bottom:10px}
.bg-req{font-size:10px;color:#6a6690;font-family:'DM Mono',monospace;font-style:italic;margin-bottom:12px}

/* Status footer */
.bg-earned-tag{display:inline-flex;align-items:center;gap:5px;
  background:rgba(52,211,153,.1);border:1px solid rgba(52,211,153,.2);
  color:#34d399;font-family:'DM Mono',monospace;font-size:9px;
  padding:3px 10px;border-radius:20px}
.bg-locked-tag{display:inline-flex;align-items:center;gap:5px;
  background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);
  color:#6a6690;font-family:'DM Mono',monospace;font-size:9px;
  padding:3px 10px;border-radius:20px}

/* Progress bar */
.bg-prog{margin-top:10px}
.bg-prog-row{display:flex;justify-content:space-between;
  font-family:'DM Mono',monospace;font-size:9px;color:#6a6690;margin-bottom:4px}
.bg-prog-track{height:3px;background:rgba(255,255,255,.06);border-radius:2px;overflow:hidden}
.bg-prog-fill{height:100%;border-radius:2px;transition:width 1.1s ease}

/* ── Tooltip ── */
.bs-tip-box{position:fixed;z-index:8000;max-width:220px;padding:9px 12px;
  background:#111027;border:1px solid rgba(184,159,255,.2);border-radius:10px;
  font-family:'DM Mono',monospace;font-size:10px;color:#9590b8;line-height:1.6;
  pointer-events:none;opacity:0;transition:opacity .15s;box-shadow:0 8px 32px rgba(0,0,0,.5)}
.bs-tip-box.show{opacity:1}
`;
    document.head.appendChild(s);

    // Global tooltip
    var tip = document.createElement('div');
    tip.id = 'bs-tip';
    tip.className = 'bs-tip-box';
    document.body.appendChild(tip);

    document.addEventListener('mouseover', function (e) {
      var el = e.target.closest('[data-bs-tip]');
      if (!el) { tip.classList.remove('show'); return; }
      tip.textContent = el.getAttribute('data-bs-tip');
      tip.classList.add('show');
    });
    document.addEventListener('mousemove', function (e) {
      if (!tip.classList.contains('show')) return;
      var x = e.clientX + 14, y = e.clientY + 14;
      if (x + 230 > window.innerWidth) x = e.clientX - 230;
      if (y + 80  > window.innerHeight) y = e.clientY - 70;
      tip.style.left = x + 'px';
      tip.style.top  = y + 'px';
    });
    document.addEventListener('mouseout', function (e) {
      if (!e.target.closest('[data-bs-tip]')) tip.classList.remove('show');
    });
  }

  // ── Rarity definitions ───────────────────────────────────────────
  var RARITIES = {
    common:    { label:'COMMON',    color:'#94a3b8', particles:6,  colors:['#94a3b8','#cbd5e1','#e2e8f0'] },
    rare:      { label:'RARE',      color:'#38bdf8', particles:12, colors:['#38bdf8','#7dd3fc','#0ea5e9','#06b6d4'] },
    epic:      { label:'EPIC',      color:'#b89fff', particles:18, colors:['#b89fff','#c4b5fd','#8b5cf6','#a78bfa','#7c3aed'] },
    legendary: { label:'LEGENDARY', color:'#fbbf24', particles:36, colors:['#fbbf24','#f59e0b','#fb923c','#f43f5e','#34d399','#38bdf8','#b89fff','#818cf8'] },
  };

  // ── Badge definitions ────────────────────────────────────────────
  var BADGES = [
    // ── COMMON ──────────────────────────────────────────────────
    {
      id:'first_pick', icon:'🎯', name:'First Pick', rarity:'common',
      desc:'Post your very first verified pick on LEDGR.',
      req:'Post 1 pick',
      tip:'Post any pick on the dashboard to earn this.',
      check: function(s) { return s.picks >= 1; },
      prog:  function(s) { return {cur:Math.min(s.picks,1), max:1}; }
    },
    {
      id:'getting_started', icon:'📊', name:'Getting Started', rarity:'common',
      desc:'Log 10 verified picks and start building your record.',
      req:'10 picks posted',
      tip:'Post picks on the dashboard. Results verified automatically.',
      check: function(s) { return s.picks >= 10; },
      prog:  function(s) { return {cur:Math.min(s.picks,10), max:10}; }
    },
    {
      id:'verified', icon:'✅', name:'Verified', rarity:'common',
      desc:'Confirm your email address and join the verified tipster community.',
      req:'Email verified',
      tip:'Check your inbox for the verification email sent during sign-up.',
      check: function(s, x) { return !!(x && x.emailVerified); },
      prog:  function(s, x) { return {cur:(x && x.emailVerified)?1:0, max:1}; }
    },

    // ── RARE ─────────────────────────────────────────────────────
    {
      id:'hot_streak', icon:'🔥', name:'Hot Streak', rarity:'rare',
      desc:'5 consecutive wins without a single loss. You\'re on fire.',
      req:'5-win streak',
      tip:'Post picks and win 5 in a row without losing.',
      check: function(s) { return s.streak >= 5; },
      prog:  function(s) { return {cur:Math.min(s.streak,5), max:5}; }
    },
    {
      id:'profitable', icon:'📈', name:'Profitable', rarity:'rare',
      desc:'Positive ROI with at least 20 picks — real edge, not luck.',
      req:'ROI > 0% with 20+ picks',
      tip:'Stay profitable as your pick count grows past 20.',
      check: function(s) { return s.roi > 0 && s.picks >= 20; },
      prog:  function(s) { return {cur:Math.min(s.picks,20), max:20}; }
    },
    {
      id:'sharp_eye', icon:'🔭', name:'Sharp Eye', rarity:'rare',
      desc:'60%+ win rate across 30 or more settled picks. Statistically significant.',
      req:'60%+ WR · 30+ picks',
      tip:'Maintain a 60% win rate over at least 30 settled picks.',
      check: function(s) { return s.wr >= 60 && s.settled >= 30; },
      prog:  function(s) { return {cur:Math.min(s.settled,30), max:30}; }
    },
    {
      id:'social', icon:'👥', name:'Social', rarity:'rare',
      desc:'10 people follow your tipster profile on LEDGR.',
      req:'10 followers',
      tip:'Share your profile. Followers track your picks in real time.',
      check: function(s, x) { return !!(x && x.followers >= 10); },
      prog:  function(s, x) { return {cur:Math.min((x&&x.followers)||0, 10), max:10}; }
    },

    // ── EPIC ─────────────────────────────────────────────────────
    {
      id:'diamond_bettor', icon:'💎', name:'Diamond Bettor', rarity:'epic',
      desc:'Reach Diamond division on the LEDGR leaderboard.',
      req:'Diamond division or higher',
      tip:'Division is based on ROI, win rate, volume, and pick count. Keep improving.',
      check: function(s, x) { return !!(x && ['DIAMOND','ELITE','LEGENDARY'].includes(x.divisionName)); },
      prog:  function(s) { return {cur:Math.min(Math.round((s.divScore||0)*0.65), 65), max:65}; }
    },
    {
      id:'rising_star', icon:'🚀', name:'Rising Star', rarity:'epic',
      desc:'Break into the top 10 leaderboard within your first 30 days.',
      req:'Top 10 within first 30 days',
      tip:'Be active and profitable from day one to land this rare achievement.',
      check: function(s, x) { return !!(x && x.leaderboardRank && x.leaderboardRank <= 10 && x.accountAgeDays <= 30); },
      prog:  function(s, x) {
        var rank = (x && x.leaderboardRank) || 999;
        return {cur:Math.min(Math.max(0, 11 - rank), 10), max:10};
      }
    },
    {
      id:'season_top3', icon:'🏆', name:'Season Top 3', rarity:'epic',
      desc:'Finish in the top 3 of any LEDGR season.',
      req:'Top 3 finish in any season',
      tip:'Compete in the current season. Top 3 at the end earns this badge.',
      check: function(s, x) { return !!(x && x.seasonBestFinish && x.seasonBestFinish <= 3); },
      prog:  function(s, x) { return {cur:(x&&x.seasonBestFinish&&x.seasonBestFinish<=3)?1:0, max:1}; }
    },
    {
      id:'clv_master', icon:'⚡', name:'CLV Master', rarity:'epic',
      desc:'Average Closing Line Value of +5% across 50+ picks. You beat the market.',
      req:'Avg CLV +5% · 50 picks with CLV data',
      tip:'CLV is calculated after each event closes. Post picks from live markets to accumulate data.',
      check: function(s) { return s.avgCLV >= 5 && s.clvCount >= 50; },
      prog:  function(s) { return {cur:Math.min(s.clvCount||0, 50), max:50}; }
    },

    // ── LEGENDARY ────────────────────────────────────────────────
    {
      id:'season_champion', icon:'👑', name:'Season Champion', rarity:'legendary',
      desc:'Win a LEDGR season outright. The absolute pinnacle of tipster achievement.',
      req:'Win any LEDGR season',
      tip:'Finish #1 on the leaderboard at season end. Immortalised in the Hall of Fame.',
      check: function(s, x) { return !!(x && x.isSeasonChampion); },
      prog:  function(s, x) { return {cur:(x&&x.isSeasonChampion)?1:0, max:1}; }
    },
    {
      id:'legendary_div', icon:'🌟', name:'Legendary', rarity:'legendary',
      desc:'Reach Legendary division — the top tier of all LEDGR tipsters.',
      req:'Reach Legendary division',
      tip:'Division is scored from ROI, win rate, volume, and picks. Score 92+ to reach Legendary.',
      check: function(s, x) { return !!(x && x.divisionName === 'LEGENDARY'); },
      prog:  function(s) { return {cur:Math.min(Math.round((s.divScore||0)*0.92), 92), max:92}; }
    },
    {
      id:'profit_500', icon:'💰', name:'500 Units', rarity:'legendary',
      desc:'Earn 500 units of total profit. An elite-level milestone.',
      req:'500u total profit',
      tip:'Total P&L across all settled picks. Compounding over time.',
      check: function(s) { return s.pnl >= 500; },
      prog:  function(s) { return {cur:Math.max(0, Math.min(Math.round(s.pnl), 500)), max:500}; }
    },
    {
      id:'year_profit', icon:'🎖️', name:'1 Year Profitable', rarity:'legendary',
      desc:'Stay profitable every single month for 12 consecutive months.',
      req:'Profitable every month for 12 months straight',
      tip:'Calculated from your pick history. Every month must show positive P&L.',
      check: function(s) { return (s.profitableMonthStreak || 0) >= 12; },
      prog:  function(s) { return {cur:Math.min(s.profitableMonthStreak||0, 12), max:12}; }
    },
  ];

  // ── Stats calculator ─────────────────────────────────────────────
  function calcStats(picks) {
    var settled  = picks.filter(function(p){return p.result==='win'||p.result==='loss';});
    var wins     = settled.filter(function(p){return p.result==='win';}).length;
    var stake    = picks.reduce(function(s,p){return s+p.stake;}, 0);
    var pnl      = picks.reduce(function(s,p){return s+p.pnl;}, 0);
    var roi      = stake > 0 ? (pnl/stake)*100 : 0;
    var wr       = settled.length > 0 ? (wins/settled.length)*100 : 0;
    var avgOdds  = picks.length > 0 ? picks.reduce(function(s,p){return s+p.odds;},0)/picks.length : 0;

    // Current win streak (from most recent pick backwards)
    var sortedDesc = settled.slice().sort(function(a,b){return new Date(b.createdAt)-new Date(a.createdAt);});
    var streak = 0;
    for (var i = 0; i < sortedDesc.length; i++) {
      if (sortedDesc[i].result === 'win') streak++;
      else break;
    }

    // CLV stats
    var withCLV = settled.filter(function(p){return p.clv != null;});
    var clvCount = withCLV.length;
    var avgCLV   = clvCount > 0 ? withCLV.reduce(function(s,p){return s+p.clv;},0)/clvCount : 0;

    // Monthly P&L for streak calculation
    var monthMap = {};
    picks.forEach(function(p) {
      var d   = new Date(p.createdAt);
      var key = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
      if (!monthMap[key]) monthMap[key] = 0;
      monthMap[key] += p.pnl;
    });
    var months = Object.keys(monthMap).sort();
    var profitableMonthStreak = 0;
    // Count from most recent month backwards
    for (var j = months.length - 1; j >= 0; j--) {
      if (monthMap[months[j]] > 0) profitableMonthStreak++;
      else break;
    }

    // Account age from first pick
    var accountAgeDays = 9999;
    if (picks.length) {
      var oldest = picks.reduce(function(a,p){
        return new Date(p.createdAt) < new Date(a.createdAt) ? p : a;
      });
      accountAgeDays = Math.floor((Date.now() - new Date(oldest.createdAt)) / 86400000);
    }

    return {
      picks: picks.length,
      wins: wins,
      settled: settled.length,
      roi: roi,
      wr: wr,
      avgOdds: avgOdds,
      pnl: pnl,
      streak: streak,
      clvCount: clvCount,
      avgCLV: avgCLV,
      profitableMonthStreak: profitableMonthStreak,
      accountAgeDays: accountAgeDays,
      divScore: 0, // filled by caller if Divisions is available
    };
  }

  // ── Check all badges ─────────────────────────────────────────────
  // Returns { unlocked: Set of badge IDs }
  function checkAll(stats, extra) {
    extra = extra || {};
    var unlocked = {};
    BADGES.forEach(function(b) {
      try { unlocked[b.id] = !!b.check(stats, extra); } catch(e) { unlocked[b.id] = false; }
    });
    return unlocked;
  }

  // ── Unlock animation ─────────────────────────────────────────────
  function playUnlockAnim(badge, onDismiss) {
    var r = RARITIES[badge.rarity] || RARITIES.common;

    var overlay = document.createElement('div');
    overlay.className = 'bs-overlay';

    var panel = document.createElement('div');
    panel.className = 'bs-panel r-' + badge.rarity;
    panel.innerHTML =
      '<div class="bs-overlay-lbl" style="color:'+r.color+'">BADGE UNLOCKED</div>' +
      '<span class="bs-ov-icon">' + badge.icon + '</span>' +
      '<span class="bs-ov-rarity-pill r-' + badge.rarity + '" style="' +
        'background:rgba('+_hexToRgb(r.color)+',.12);' +
        'border:1px solid rgba('+_hexToRgb(r.color)+',.4);' +
        'color:'+r.color+'">' + r.label + '</span>' +
      '<div class="bs-ov-name">' + badge.name + '</div>' +
      '<div class="bs-ov-desc">' + badge.desc + '</div>' +
      '<div class="bs-ov-dismiss">Tap anywhere to continue</div>';
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    // Spawn particles
    var cx = window.innerWidth / 2;
    var cy = window.innerHeight / 2;
    var n  = r.particles;

    for (var i = 0; i < n; i++) {
      (function(idx) {
        setTimeout(function() {
          var angle  = (idx / n) * 360 + (Math.random() - .5) * (360 / n);
          var dist   = 90 + Math.random() * (badge.rarity === 'legendary' ? 220 : badge.rarity === 'epic' ? 160 : 120);
          var rad    = angle * Math.PI / 180;
          var bx     = Math.cos(rad) * dist;
          var by     = Math.sin(rad) * dist - 20;
          var size   = badge.rarity === 'legendary' ? 5 + Math.random()*7 : 4 + Math.random()*5;
          var color  = r.colors[idx % r.colors.length];
          var dur    = .55 + Math.random() * .5;
          var isSquare = badge.rarity === 'legendary' && Math.random() > .5;

          var p = document.createElement('div');
          p.className = 'bs-particle' + (isSquare ? ' sq' : '');
          p.style.cssText =
            'left:'+(cx-size/2)+'px;top:'+(cy-size/2)+'px;' +
            'width:'+size+'px;height:'+size+'px;' +
            'background:'+color+';' +
            'box-shadow:0 0 '+(size*1.5)+'px '+color+';' +
            '--bx:'+bx.toFixed(1)+'px;--by:'+by.toFixed(1)+'px;' +
            '--dur:'+dur.toFixed(2)+'s;' +
            '--rot:'+(Math.random()>0.5?360:-360)+'deg;' +
            'animation-delay:'+(Math.random()*0.12).toFixed(3)+'s';
          document.body.appendChild(p);
          setTimeout(function(){ p.remove(); }, (dur + .15) * 1000 + 200);
        }, idx * (badge.rarity === 'legendary' ? 18 : 25));
      })(i);
    }

    function dismiss() {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity .3s';
      setTimeout(function() {
        overlay.remove();
        if (typeof onDismiss === 'function') onDismiss();
      }, 300);
    }

    overlay.addEventListener('click', dismiss);
    // Auto-dismiss after 6s for common, longer for rarer
    var autoDur = {common:5000, rare:6000, epic:7000, legendary:9000}[badge.rarity] || 6000;
    setTimeout(dismiss, autoDur);
  }

  // ── Queue new unlock animations ───────────────────────────────────
  // Compares current state vs stored; plays animations for freshly earned badges.
  // Uses localStorage key 'ledgr_earned_badges_v2'
  function checkForNewUnlocks(stats, extra) {
    var STORE_KEY = 'ledgr_earned_badges_v2';
    var unlocked  = checkAll(stats, extra);
    var stored    = [];
    try { stored = JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch(e) {}

    var fresh = BADGES.filter(function(b) {
      return unlocked[b.id] && stored.indexOf(b.id) === -1;
    });

    if (!fresh.length) return;

    // Save immediately so re-render doesn't re-trigger
    var newStored = stored.concat(fresh.map(function(b){return b.id;}));
    localStorage.setItem(STORE_KEY, JSON.stringify(newStored));

    // Queue animations, highest rarity first
    var order = {legendary:0, epic:1, rare:2, common:3};
    fresh.sort(function(a,b){ return (order[a.rarity]||4) - (order[b.rarity]||4); });

    var idx = 0;
    function next() {
      if (idx >= fresh.length) return;
      playUnlockAnim(fresh[idx++], next);
    }
    // Small delay so page is settled
    setTimeout(next, 600);
  }

  // ── Hex to rgb helper ─────────────────────────────────────────────
  function _hexToRgb(hex) {
    var r = parseInt(hex.slice(1,3),16);
    var g = parseInt(hex.slice(3,5),16);
    var b = parseInt(hex.slice(5,7),16);
    return r+','+g+','+b;
  }

  // ── Boot ─────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCSS);
  } else {
    injectCSS();
  }

  window.BadgeSystem = {
    BADGES             : BADGES,
    RARITIES           : RARITIES,
    calcStats          : calcStats,
    checkAll           : checkAll,
    playUnlockAnim     : playUnlockAnim,
    checkForNewUnlocks : checkForNewUnlocks,
  };

})();
