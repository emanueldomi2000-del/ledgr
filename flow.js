(function () {
  'use strict';

  // ── CSS ──────────────────────────────────────────────────────────
  function injectCSS() {
    if (document.getElementById('flow-css')) return;
    const s = document.createElement('style');
    s.id = 'flow-css';
    s.textContent = `
/* ═══════════════════════════════════════════════════════════════
   LEDGR FLOW DETECTION SYSTEM
   ═══════════════════════════════════════════════════════════════ */

/* Full badge */
.flow-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;
  border-radius:20px;font-family:'DM Mono',monospace;font-size:10px;
  font-weight:700;letter-spacing:.8px;cursor:default;transition:box-shadow .3s}

/* Compact chip (leaderboard rows, feed) */
.flow-chip{display:inline-flex;align-items:center;gap:3px;padding:2px 7px;
  border-radius:10px;font-family:'DM Mono',monospace;font-size:8px;
  font-weight:700;letter-spacing:.5px;white-space:nowrap}

/* ── State colours ── */
.flow-on_fire    {background:rgba(251,146,60,.14);border:1px solid rgba(251,146,60,.4); color:#fb923c}
.flow-cold_streak{background:rgba(56,189,248,.1); border:1px solid rgba(56,189,248,.3); color:#38bdf8}
.flow-heating_up {background:rgba(52,211,153,.12);border:1px solid rgba(52,211,153,.35);color:#34d399}
.flow-sharp_mom  {background:rgba(184,159,255,.12);border:1px solid rgba(184,159,255,.38);color:#b89fff}
.flow-consistent {background:rgba(251,191,36,.1); border:1px solid rgba(251,191,36,.32);color:#fbbf24}
.flow-underdog   {background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.35);color:#f59e0b}
.flow-clv_leader {background:rgba(34,211,238,.1); border:1px solid rgba(34,211,238,.32);color:#22d3ee}
.flow-contender  {background:rgba(244,63,94,.1);  border:1px solid rgba(244,63,94,.32); color:#f43f5e}

/* ── Animations for positive states ── */
.flow-on_fire{animation:fl-fire 1.8s ease-in-out infinite}
@keyframes fl-fire{0%,100%{box-shadow:none}50%{box-shadow:0 0 12px rgba(251,146,60,.5)}}

.flow-heating_up{animation:fl-heat 2.4s ease-in-out infinite}
@keyframes fl-heat{0%,100%{box-shadow:none}50%{box-shadow:0 0 10px rgba(52,211,153,.4)}}

.flow-contender{animation:fl-cont 2s ease-in-out infinite}
@keyframes fl-cont{0%,100%{box-shadow:none}50%{box-shadow:0 0 10px rgba(244,63,94,.4)}}

/* ── Rising card override for flow ── */
.rc-flow{display:flex;flex-direction:column;height:100%}
.rc-flow-state{font-family:'DM Mono',monospace;font-size:9px;font-weight:700;
  letter-spacing:2px;text-transform:uppercase;margin-bottom:6px}
.rc-flow-name{font-weight:700;font-size:15px;margin-bottom:6px}
.rc-flow-metric{font-family:'Bebas Neue',sans-serif;font-size:30px;letter-spacing:1px;line-height:1;margin-bottom:4px}
.rc-flow-sub{font-family:'DM Mono',monospace;font-size:9px;color:var(--mu);letter-spacing:1px}

/* Feed flow event */
.ev-badge-flow{border-radius:20px;font-family:'DM Mono',monospace;font-size:9px;font-weight:700;letter-spacing:.8px}
`;
    document.head.appendChild(s);
  }

  // ── State definitions ─────────────────────────────────────────────
  var STATES = {
    on_fire:     { id:'on_fire',     icon:'🔥', label:'🔥 On Fire',          short:'On Fire',      color:'#fb923c', desc:'5+ win streak with rising ROI',               priority:1 },
    cold_streak: { id:'cold_streak', icon:'❄️', label:'❄️ Cold Streak',       short:'Cold Streak',  color:'#38bdf8', desc:'3+ consecutive losses',                       priority:2 },
    heating_up:  { id:'heating_up',  icon:'📈', label:'📈 Heating Up',        short:'Heating Up',   color:'#34d399', desc:'Recent picks outperforming all-time ROI',      priority:3 },
    sharp_mom:   { id:'sharp_mom',   icon:'⚡', label:'⚡ Sharp Momentum',    short:'Sharp Momentum',color:'#b89fff', desc:'Positive CLV over the last 14 days',          priority:4 },
    underdog:    { id:'underdog',    icon:'🦁', label:'🦁 Underdog King',     short:'Underdog King',color:'#f59e0b', desc:'Winning high-odds picks this week',            priority:5 },
    clv_leader:  { id:'clv_leader',  icon:'💎', label:'💎 CLV Leader',       short:'CLV Leader',   color:'#22d3ee', desc:'Highest avg CLV of any tipster (14 days)',     priority:6 },
    consistent:  { id:'consistent',  icon:'🎯', label:'🎯 Most Consistent',   short:'Consistent',   color:'#fbbf24', desc:'Lowest variance on the leaderboard this month',priority:7 },
    contender:   { id:'contender',   icon:'🏆', label:'🏆 Season Contender', short:'Contender',    color:'#f43f5e', desc:'Top 5 in the current season',                 priority:8 },
  };

  // ── Core detection (single tipster) ──────────────────────────────
  function detect(picks, opts) {
    opts = opts || {};
    if (!picks || !picks.length) return null;

    var settled = picks.filter(function(p) { return p.result !== 'pending'; })
                       .sort(function(a,b) { return new Date(b.createdAt) - new Date(a.createdAt); });

    if (!settled.length) return null;

    // 1 — On Fire: 5+ win streak
    var streak = 0;
    for (var i = 0; i < settled.length; i++) {
      if (settled[i].result === 'win') streak++;
      else break;
    }
    if (streak >= 5) return STATES.on_fire;

    // 2 — Cold Streak: 3+ loss streak
    var lossStreak = 0;
    for (var j = 0; j < settled.length; j++) {
      if (settled[j].result === 'loss') lossStreak++;
      else break;
    }
    if (lossStreak >= 3) return STATES.cold_streak;

    // 3 — Heating Up: last 10 ROI significantly above all-time ROI
    if (settled.length >= 15) {
      var last10     = settled.slice(0, 10);
      var s10 = 0, p10 = 0;
      last10.forEach(function(p) { s10 += p.stake; p10 += p.pnl; });
      var roi10  = s10 > 0 ? (p10 / s10) * 100 : 0;

      var sAll = 0, pAll = 0;
      settled.forEach(function(p) { sAll += p.stake; pAll += p.pnl; });
      var roiAll = sAll > 0 ? (pAll / sAll) * 100 : 0;

      if (roi10 > roiAll + 8 && roi10 > 0) return STATES.heating_up;
    }

    // 4 — Sharp Momentum: avg CLV > +2% in last 14 days (min 3 CLV picks)
    var cut14 = Date.now() - 14 * 86400000;
    var clvPicks = settled.filter(function(p) {
      return p.clv != null && new Date(p.createdAt).getTime() > cut14;
    });
    if (clvPicks.length >= 3) {
      var avgCLV = clvPicks.reduce(function(s, p) { return s + p.clv; }, 0) / clvPicks.length;
      if (avgCLV > 2) return STATES.sharp_mom;
    }

    // 5 — Underdog King: 2+ underdog wins (odds >= 2.5) this week
    var cut7 = Date.now() - 7 * 86400000;
    var udWins = settled.filter(function(p) {
      return p.result === 'win' && p.odds >= 2.5 && new Date(p.createdAt).getTime() > cut7;
    });
    if (udWins.length >= 2) return STATES.underdog;

    // 6-8 — Global states (set via opts from detectAll)
    if (opts.isCLVLeader)       return STATES.clv_leader;
    if (opts.isMostConsistent)  return STATES.consistent;
    if (opts.rank && opts.rank <= 5) return STATES.contender;

    return null;
  }

  // ── Global detection (all tipsters) ──────────────────────────────
  // picksMap: { username → picks[] }
  // Returns: Map<username, state|null>
  function detectAll(picksMap) {
    var usernames  = Object.keys(picksMap);
    var resultMap  = {};
    var cut14      = Date.now() - 14 * 86400000;
    var cut30      = Date.now() - 30 * 86400000;

    // ── Compute per-user metrics for global comparison ──
    var clvAvgs   = {};   // username → avg CLV last 14d
    var variances = {};   // username → variance last 30d

    usernames.forEach(function(u) {
      var picks   = picksMap[u] || [];
      var settled = picks.filter(function(p) { return p.result !== 'pending'; });

      // CLV avg last 14d
      var clvPicks = settled.filter(function(p) {
        return p.clv != null && new Date(p.createdAt).getTime() > cut14;
      });
      if (clvPicks.length >= 3) {
        clvAvgs[u] = clvPicks.reduce(function(s, p) { return s + p.clv; }, 0) / clvPicks.length;
      }

      // Variance of unit returns last 30d (lower = more consistent)
      var month = settled.filter(function(p) {
        return new Date(p.createdAt).getTime() > cut30;
      });
      if (month.length >= 5) {
        var returns = month.map(function(p) {
          return p.stake > 0 ? (p.pnl / p.stake) : 0;
        });
        var mean = returns.reduce(function(s, v) { return s + v; }, 0) / returns.length;
        var variance = returns.reduce(function(s, v) { return s + Math.pow(v - mean, 2); }, 0) / returns.length;
        variances[u] = variance;
      }
    });

    // Identify leaders
    var clvLeader         = _topKey(clvAvgs, true,  function(v) { return v > 2; });
    var mostConsistentUser = _topKey(variances, false, function(v) { return v < 0.5; });

    // ── Run per-user detection + apply global states ──
    usernames.forEach(function(u) {
      var picks = picksMap[u] || [];
      if (!picks.length) { resultMap[u] = null; return; }

      var state = detect(picks, {
        isCLVLeader      : (u === clvLeader),
        isMostConsistent : (u === mostConsistentUser),
      });
      resultMap[u] = state;
    });

    return resultMap;
  }

  // Return key with max (or min) value, filtered by predicate
  function _topKey(map, wantMax, pred) {
    var best = null, bestVal = wantMax ? -Infinity : Infinity;
    Object.keys(map).forEach(function(k) {
      var v = map[k];
      if (typeof pred === 'function' && !pred(v)) return;
      if (wantMax ? v > bestVal : v < bestVal) { bestVal = v; best = k; }
    });
    return best;
  }

  // ── HTML helpers ──────────────────────────────────────────────────

  // Full badge (profile, rising cards)
  function badgeHTML(state, opts) {
    if (!state) return '';
    opts = opts || {};
    var cls = 'flow-badge flow-' + state.id;
    var tip = 'data-tip="' + state.desc + '"';
    return '<span class="' + cls + '" ' + tip + '>' + state.label + '</span>';
  }

  // Compact chip (leaderboard table rows)
  function chipHTML(state) {
    if (!state) return '';
    return '<span class="flow-chip flow-' + state.id + '" title="' + state.desc + '">' + state.icon + ' ' + state.short + '</span>';
  }

  // ── Boot ─────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCSS);
  } else {
    injectCSS();
  }

  window.Flow = {
    STATES    : STATES,
    detect    : detect,
    detectAll : detectAll,
    badgeHTML : badgeHTML,
    chipHTML  : chipHTML,
  };

})();
