(function () {
  'use strict';

  // ── Inject CSS once ──────────────────────────────────────────────
  if (!document.getElementById('at-styles')) {
    const s = document.createElement('style');
    s.id = 'at-styles';
    s.textContent = `
/* ═══ SHARP SCORE & ARCHETYPES ═══════════════════════════════ */

/* Gauge SVG transition */
.at-gauge-arc{transition:stroke-dashoffset 1.3s cubic-bezier(.4,0,.2,1)}

/* Gauge section in profile */
.at-gauge-section{display:flex;justify-content:center;margin-bottom:18px;padding-bottom:16px;border-bottom:1px solid rgba(184,159,255,0.08)}
.at-gauge-wrap{display:flex;flex-direction:column;align-items:center;gap:6px;cursor:help}
.at-gauge-lbl{font-family:'DM Mono',monospace;font-size:9px;color:rgba(240,237,255,0.35);letter-spacing:3px;text-transform:uppercase}

/* Tooltip wrapper layout (events handled by tooltips.js) */
.at-tip{position:relative;display:inline-flex;flex-direction:column;align-items:center}

/* Archetype badge — profile & leaderboard (standard) */
.at-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;border-radius:20px;font-family:'DM Mono',monospace;font-size:9px;font-weight:700;letter-spacing:1.5px;border:1px solid;cursor:default;transition:opacity .2s}
.at-badge:hover{opacity:.8}

/* Archetype badge — small (lb rows) */
.at-badge-sm{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:20px;font-family:'DM Mono',monospace;font-size:8px;font-weight:700;letter-spacing:1px;border:1px solid;margin-top:3px;cursor:default}

/* Sharp Score cell in leaderboard table */
.at-ss-val{font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:1px;line-height:1}
.at-ss-lbl{font-size:8px;color:rgba(106,102,144,0.7);font-family:'DM Mono',monospace;letter-spacing:1px}

/* Mini gauge container in podium */
.at-podium-gauge{display:flex;flex-direction:column;align-items:center;margin-top:8px;gap:4px}
.at-podium-lbl{font-family:'DM Mono',monospace;font-size:8px;color:rgba(240,237,255,0.3);letter-spacing:2px}

/* Archetype text label (replaces pill badge) */
.arch-label{display:inline-flex;align-items:center;font-family:'DM Mono',monospace;font-size:10px;color:rgba(184,159,255,.85);letter-spacing:.3px;white-space:nowrap;cursor:default}
.arch-label-sm{font-size:9px}
.arch-dot{color:rgba(184,159,255,.28);margin:0 5px}
.arch-sub{color:rgba(106,102,144,.75)}
`;
    document.head.appendChild(s);
  }

  // ── Helpers ─────────────────────────────────────────────────────

  function _ssColor(score) {
    return score >= 70 ? '#34d399' : score >= 40 ? '#fbbf24' : '#f87171';
  }

  // ── Archetype ────────────────────────────────────────────────────

  window.getArchetype = function (picks) {
    if (!picks || !picks.length) return null;

    var settled = picks.filter(function (p) { return p.result === 'win' || p.result === 'loss'; });
    if (settled.length < 5) return null;
    var wins    = picks.filter(function (p) { return p.result === 'win'; }).length;
    var losses  = picks.filter(function (p) { return p.result === 'loss'; }).length;
    var stake   = picks.reduce(function (s, p) { return s + (p.stake || 0); }, 0);
    var pnl     = picks.reduce(function (s, p) { return s + (p.pnl   || 0); }, 0);
    var roi     = stake > 0 ? (pnl / stake) * 100 : 0;
    var avgOdds = picks.length ? picks.reduce(function (s, p) { return s + (p.odds || 1); }, 0) / picks.length : 0;
    var ss      = 0;

    var byDate = settled.slice().sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    var streak = 0;
    for (var i = 0; i < byDate.length; i++) {
      if (byDate[i].result === 'win') streak++;
      else break;
    }

    // Priority order — first match wins
    if (streak > 5)
      return { key:'demon',    icon:'😈', name:'The Demon',           subtitle:'Momentum Specialist',     color:'#f87171',
               desc:'On a relentless hot streak — win after win.' };
    if (settled.length >= 10 && picks.length < 50 && roi > 20)
      return { key:'sniper',   icon:'🎯', name:'The Sniper',          subtitle:'Precision Analyst',        color:'#34d399',
               desc:'Fewer picks, elite ROI — precision over volume.' };
    if (ss > 70)
      return { key:'sharp',    icon:'📐', name:'The Sharp',           subtitle:'Consistent Edge Player',   color:'#38bdf8',
               desc:'Sharp Score over 70 — consistent skill, not luck.' };
    if (picks.length > 100 && roi > 0)
      return { key:'grinder',  icon:'⚙️', name:'The Grinder',         subtitle:'High-Volume Strategist',   color:'#b89fff',
               desc:'Volume player with a proven positive edge.' };
    if (avgOdds > 3.0 && roi > 0)
      return { key:'underdog', icon:'🦁', name:'The Underdog Hunter', subtitle:'Value Contrarian',         color:'#fbbf24',
               desc:'Profits by backing outsiders everyone else ignores.' };
    if (avgOdds >= 2.5 && avgOdds <= 3.5 && roi > 0)
      return { key:'value',    icon:'💎', name:'The Value Hunter',    subtitle:'Odds Value Analyst',       color:'#b89fff',
               desc:'Finds consistent value in mid-range odds.' };

    return null;
  };

  // ── Sharp Score Gauge (SVG) ──────────────────────────────────────
  // Call animateSharpGauges() after inserting HTML into the DOM.

  window.sharpGaugeHTML = function (score, opts) {
    opts = opts || {};
    var size   = opts.size        || 80;
    var sw     = opts.strokeWidth || (size > 50 ? 6 : 4);
    var r      = size / 2 - sw / 2 - 2;
    var cx     = size / 2, cy = size / 2;
    var circ   = +(2 * Math.PI * r).toFixed(2);
    var val    = Math.max(0, Math.min(100, score || 0));
    var offset = +(circ - (val / 100) * circ).toFixed(2);
    var color  = _ssColor(val);
    var fs     = opts.fontSize    || Math.max(10, Math.round(size * 0.22));
    var sublbl = opts.sublabel !== false;

    return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" class="at-gauge">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="' + sw + '"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="' + sw + '"' +
        ' stroke-dasharray="' + circ + '" stroke-dashoffset="' + circ + '"' +
        ' stroke-linecap="round" transform="rotate(-90 ' + cx + ' ' + cy + ')"' +
        ' class="at-gauge-arc" data-target="' + offset + '"/>' +
      '<text x="' + cx + '" y="' + (sublbl ? cx - fs * 0.28 : cx) + '" text-anchor="middle" dominant-baseline="central"' +
        ' font-family="\'Bebas Neue\',sans-serif" font-size="' + fs + '" fill="' + color + '">' +
        (val > 0 ? Math.round(val) : '—') + '</text>' +
      (sublbl ? '<text x="' + cx + '" y="' + (cx + fs * 0.62) + '" text-anchor="middle" dominant-baseline="central"' +
        ' font-family="\'DM Mono\',monospace" font-size="' + Math.round(fs * 0.38) + '" fill="rgba(240,237,255,0.3)" letter-spacing="1">SHARP</text>' : '') +
      '</svg>';
  };

  // ── Archetype badge HTML ─────────────────────────────────────────

  window.archetypeBadgeHTML = function (arch, small) {
    if (!arch) return '';
    var sub = arch.subtitle || '';
    var inner = arch.name;
    if (sub) inner += '<span class="arch-dot">·</span><span class="arch-sub">' + sub + '</span>';
    return '<span class="arch-label' + (small ? ' arch-label-sm' : '') + '" title="' + (arch.desc || '') + '">' + inner + '</span>';
  };

  // ── Animate all gauges in DOM ────────────────────────────────────

  window.animateSharpGauges = function () {
    document.querySelectorAll('.at-gauge-arc[data-target]').forEach(function (arc) {
      var target = parseFloat(arc.getAttribute('data-target'));
      if (!isNaN(target)) {
        requestAnimationFrame(function () {
          arc.style.strokeDashoffset = target + 'px';
        });
      }
    });
  };

})();
