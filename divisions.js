(function () {
  'use strict';

  // ── CSS injection ────────────────────────────────────────────────
  function injectCSS() {
    if (document.getElementById('ledgr-div-css')) return;
    const s = document.createElement('style');
    s.id = 'ledgr-div-css';
    s.textContent = `
/* ═══════════════════════════════════════════════════════════════
   LEDGR DIVISION VISUAL SYSTEM
   ═══════════════════════════════════════════════════════════════ */

/* ── Wrapper ── */
.div-av-wrap{position:relative;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}

/* ── Aura layer (rendered behind avatar via z-index) ── */
.div-av-aura{position:absolute;inset:-14px;border-radius:inherit;pointer-events:none;z-index:0}

/* ── Avatar inner sits above aura ── */
.div-av-inner{position:relative;z-index:1;display:flex;align-items:center;justify-content:center;font-family:'Bebas Neue',sans-serif;color:#fff}

/* ── Particle container ── */
.div-parts{position:absolute;inset:0;pointer-events:none;z-index:3;border-radius:inherit}
.div-part{position:absolute;border-radius:50%;top:50%;left:50%;margin:-2px 0 0 -2px}

/* ══════════ BRONZE ══════════ */
.div-wrap-bronze .div-av-inner{box-shadow:0 0 12px rgba(180,120,80,.42),0 0 28px rgba(180,120,80,.14)}
.div-wrap-bronze .div-av-aura{background:radial-gradient(circle,rgba(180,120,80,.2) 0%,transparent 68%)}

/* ══════════ SILVER ══════════ */
.div-wrap-silver .div-av-inner{box-shadow:0 0 14px rgba(148,163,184,.48),0 0 30px rgba(148,163,184,.18)}
.div-wrap-silver .div-av-aura{background:radial-gradient(circle,rgba(148,163,184,.22) 0%,transparent 68%);animation:dv-pulse 3s ease-in-out infinite}

/* ══════════ GOLD ══════════ */
.div-wrap-gold .div-av-inner{box-shadow:0 0 18px rgba(251,191,36,.58),0 0 38px rgba(251,191,36,.22)}
.div-wrap-gold .div-av-aura{background:radial-gradient(circle,rgba(251,191,36,.28) 0%,transparent 65%);animation:dv-pulse 3s ease-in-out infinite}

/* ══════════ PLATINUM ══════════ */
.div-wrap-platinum .div-av-inner{box-shadow:0 0 20px rgba(56,189,248,.62),0 0 42px rgba(56,189,248,.24)}
.div-wrap-platinum .div-av-aura{background:radial-gradient(circle,rgba(56,189,248,.3) 0%,transparent 62%);animation:dv-pulse 3s ease-in-out infinite}

/* ══════════ DIAMOND ══════════ */
.div-wrap-diamond .div-av-inner{box-shadow:0 0 22px rgba(184,159,255,.68),0 0 46px rgba(184,159,255,.3),0 0 0 1px rgba(184,159,255,.22)}
.div-wrap-diamond .div-av-aura{background:radial-gradient(circle,rgba(184,159,255,.35) 0%,transparent 60%);animation:dv-pulse-scale 3s ease-in-out infinite}

/* ══════════ ELITE ══════════ */
.div-wrap-elite .div-av-inner{box-shadow:0 0 26px rgba(232,121,160,.72),0 0 52px rgba(232,121,160,.35),0 0 0 1px rgba(232,121,160,.28)}
.div-wrap-elite .div-av-aura{inset:-6px;border-radius:inherit;background:conic-gradient(from 0deg,rgba(232,121,160,.55) 0%,rgba(139,92,246,.42) 50%,rgba(232,121,160,.55) 100%);filter:blur(9px);animation:dv-rotate 3s linear infinite}

/* ══════════ LEGENDARY ══════════ */
.div-wrap-legendary .div-av-inner{box-shadow:0 0 32px rgba(251,191,36,.78),0 0 64px rgba(251,191,36,.38)}
.div-wrap-legendary .div-av-aura{inset:-5px;border-radius:inherit;background:conic-gradient(from 0deg,#e879a0,#fb923c,#fbbf24,#34d399,#38bdf8,#818cf8,#e879a0);filter:blur(7px);animation:dv-rotate 3s linear infinite}

/* ── Keyframes ── */
@keyframes dv-pulse      {0%,100%{opacity:.6}50%{opacity:1}}
@keyframes dv-pulse-scale{0%,100%{opacity:.55;transform:scale(1)}50%{opacity:1;transform:scale(1.1)}}
@keyframes dv-rotate     {from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

/* ── Elite particles ── */
@keyframes dv-orbit-elite{
  from{transform:rotate(0deg) translateY(var(--dv-orbit,-28px)) rotate(0deg)}
  to  {transform:rotate(360deg) translateY(var(--dv-orbit,-28px)) rotate(-360deg)}
}
.div-part-elite{width:5px;height:5px;box-shadow:0 0 5px currentColor;animation:dv-orbit-elite 3s linear infinite}
.div-part-elite:nth-child(1){color:#e879a0;animation-delay:0s}
.div-part-elite:nth-child(2){color:#c026d3;animation-delay:-.6s}
.div-part-elite:nth-child(3){color:#7c3aed;animation-delay:-1.2s}
.div-part-elite:nth-child(4){color:#e879a0;animation-delay:-1.8s}

/* ── Legendary particles ── */
@keyframes dv-orbit-legend{
  from{transform:rotate(0deg) translateY(var(--dv-orbit,-28px)) rotate(0deg)}
  to  {transform:rotate(360deg) translateY(var(--dv-orbit,-28px)) rotate(-360deg)}
}
.div-part-legend{width:4px;height:4px;box-shadow:0 0 6px currentColor;animation:dv-orbit-legend 3s linear infinite}
.div-part-legend:nth-child(1){color:#e879a0;animation-delay:0s}
.div-part-legend:nth-child(2){color:#fb923c;animation-delay:-.33s}
.div-part-legend:nth-child(3){color:#fbbf24;animation-delay:-.67s}
.div-part-legend:nth-child(4){color:#34d399;animation-delay:-1s}
.div-part-legend:nth-child(5){color:#38bdf8;animation-delay:-1.33s}
.div-part-legend:nth-child(6){color:#818cf8;animation-delay:-1.67s}

/* ── Division badge pills (for replacing existing inline badges) ── */
.dv-pill{display:inline-flex;align-items:center;gap:5px;border-radius:20px;font-family:'DM Mono',monospace;font-weight:700;letter-spacing:1px;white-space:nowrap}
.dv-pill-sm{font-size:9px;padding:2px 8px}
.dv-pill-md{font-size:10px;padding:3px 11px}
.dv-pill-lg{font-size:11px;padding:4px 14px}

/* ── Pyramid icon badges (CSS mask-based tint) ── */
.dv-pyr{display:inline-block;background-repeat:no-repeat;background-position:center;background-size:contain;flex-shrink:0;
  -webkit-mask:url('/assets/logo/ledgr-icon.png') center/contain no-repeat;
  mask:url('/assets/logo/ledgr-icon.png') center/contain no-repeat}
.dv-pyr-sm{width:10px;height:10px}
.dv-pyr-md{width:13px;height:13px}
.dv-pyr-lg{width:16px;height:16px}
.dv-pyr-xl{width:22px;height:22px}
.dv-pyr-bronze  {background-color:#CD7F32}
.dv-pyr-silver  {background-color:#C0C0C0}
.dv-pyr-gold    {background-color:#FFD700}
.dv-pyr-platinum{background-color:#4FC3F7}
.dv-pyr-diamond {background-color:#00E5FF;filter:drop-shadow(0 0 4px rgba(0,229,255,0.55))}
.dv-pyr-elite   {background-color:#7B2CFF;filter:drop-shadow(0 0 5px rgba(123,44,255,0.65))}
.dv-pyr-legendary{background-color:#FFD700;animation:dv-pyr-rainbow 2.5s linear infinite}
@keyframes dv-pyr-rainbow{to{filter:hue-rotate(360deg) drop-shadow(0 0 5px rgba(251,191,36,0.5))}}

.dv-pill-bronze  {background:rgba(180,120,80,.12);border:1px solid rgba(180,120,80,.3);color:#c49070}
.dv-pill-silver  {background:rgba(148,163,184,.1);border:1px solid rgba(148,163,184,.28);color:#94a3b8}
.dv-pill-gold    {background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.38);color:#fbbf24;text-shadow:0 0 10px rgba(251,191,36,.35)}
.dv-pill-platinum{background:rgba(56,189,248,.1);border:1px solid rgba(56,189,248,.3);color:#38bdf8;text-shadow:0 0 10px rgba(56,189,248,.3)}
.dv-pill-diamond {background:rgba(184,159,255,.12);border:1px solid rgba(184,159,255,.38);color:#b89fff;text-shadow:0 0 10px rgba(184,159,255,.35);animation:dv-pulse 3s ease-in-out infinite}
.dv-pill-elite   {background:rgba(232,121,160,.1);border:1px solid rgba(232,121,160,.35);color:#e879a0;text-shadow:0 0 12px rgba(232,121,160,.5);animation:dv-badge-elite 3s ease-in-out infinite}
.dv-pill-legendary{background:linear-gradient(135deg,rgba(251,191,36,.15),rgba(184,159,255,.12),rgba(232,121,160,.1));border:1px solid rgba(251,191,36,.35);color:#fbbf24;text-shadow:0 0 14px rgba(251,191,36,.6);animation:dv-badge-legend 3s ease-in-out infinite}
.dv-pill-provisional{background:rgba(148,163,184,.07);border:1px dashed rgba(148,163,184,.28);color:var(--mu,#64748b);letter-spacing:.8px;font-style:italic}

@keyframes dv-badge-elite  {0%,100%{box-shadow:none}50%{box-shadow:0 0 14px rgba(232,121,160,.4)}}
@keyframes dv-badge-legend {0%,100%{box-shadow:none}50%{box-shadow:0 0 20px rgba(251,191,36,.45)}}
`;
    document.head.appendChild(s);
  }

  // ── Division definitions ─────────────────────────────────────────
  // Ordered highest→lowest for lookup
  const DEFS = [
    { name:'LEGENDARY', icon:'◉', cls:'div-legend',   wrapCls:'div-wrap-legendary', pillCls:'dv-pill-legendary', color:'#fbbf24', particles:6, partCls:'div-part-legend', min:92 },
    { name:'ELITE',     icon:'⊕', cls:'div-elite',    wrapCls:'div-wrap-elite',     pillCls:'dv-pill-elite',     color:'#e879a0', particles:4, partCls:'div-part-elite',  min:80 },
    { name:'DIAMOND',   icon:'✦', cls:'div-diamond',  wrapCls:'div-wrap-diamond',   pillCls:'dv-pill-diamond',   color:'#b89fff', particles:0,                             min:65 },
    { name:'PLATINUM',  icon:'⬡', cls:'div-platinum', wrapCls:'div-wrap-platinum',  pillCls:'dv-pill-platinum',  color:'#38bdf8', particles:0,                             min:50 },
    { name:'GOLD',      icon:'★', cls:'div-gold',     wrapCls:'div-wrap-gold',      pillCls:'dv-pill-gold',      color:'#fbbf24', particles:0,                             min:35 },
    { name:'SILVER',    icon:'◆', cls:'div-silver',   wrapCls:'div-wrap-silver',    pillCls:'dv-pill-silver',    color:'#94a3b8', particles:0,                             min:20 },
    { name:'BRONZE',    icon:'▲', cls:'div-bronze',   wrapCls:'div-wrap-bronze',    pillCls:'dv-pill-bronze',    color:'#b47850', particles:0,                             min:0  },
  ];

  // ── Score & division lookup ──────────────────────────────────────
  function calcScore(roi, wr, pickCount) {
    return Math.round(
      Math.min(40, Math.max(0, (roi / 20) * 40)) +   // ROI   40%
      Math.min(30, Math.max(0, (wr  / 70) * 30)) +   // WR    30%
      Math.min(20, Math.max(0, (pickCount / 100) * 20)) + // Vol 20%
      Math.min(10, pickCount)                          // Picks 10%
    );
  }

  function divFromScore(score) {
    for (var i = 0; i < DEFS.length; i++) {
      if (score >= DEFS[i].min) return DEFS[i];
    }
    return DEFS[DEFS.length - 1];
  }

  // From an array of pick objects
  function get(picks) {
    var wins   = picks.filter(function(p){return p.result==='win';}).length;
    var losses = picks.filter(function(p){return p.result==='loss';}).length;
    var stake  = picks.reduce(function(s,p){return s+p.stake;}, 0);
    var pnl    = picks.reduce(function(s,p){return s+p.pnl;}, 0);
    var roi    = stake  > 0 ? (pnl/stake)*100 : 0;
    var wr     = (wins+losses) > 0 ? (wins/(wins+losses))*100 : 0;
    var score  = calcScore(roi, wr, picks.length);
    return Object.assign({}, divFromScore(score), {score:score});
  }

  // From precomputed stats
  function getFromStats(roi, wr, pickCount) {
    var score = calcScore(roi, wr, pickCount);
    return Object.assign({}, divFromScore(score), {score:score});
  }

  // ── HTML builders ────────────────────────────────────────────────

  function _particlesHTML(divDef, orbit) {
    if (!divDef || !divDef.particles) return '';
    var html = '<div class="div-parts">';
    for (var i = 0; i < divDef.particles; i++) {
      html += '<span class="div-part ' + divDef.partCls + '"></span>';
    }
    html += '</div>';
    return html;
  }

  // Generate a complete avatar element with division glow.
  // opts: { width, height, borderRadius, fontSize, classes, style, innerContent, noParticles }
  function avHTML(initials, bgGradient, divDef, opts) {
    opts = opts || {};
    var w    = opts.width  || 40;
    var h    = opts.height || w;
    var r    = opts.borderRadius !== undefined ? opts.borderRadius : Math.round(Math.min(w,h) * 0.26);
    var rStr = typeof r === 'string' ? r : (r + 'px');
    var fs   = opts.fontSize || Math.round(w * 0.36);
    var extraCls   = opts.classes || '';
    var extraStyle = opts.style   || '';
    var innerExtra = opts.innerContent || '';
    var wrapCls    = divDef ? divDef.wrapCls : '';
    // Orbit radius: particle should sit just outside the avatar edge + a small gap
    var orbitR  = Math.round(Math.min(w,h) / 2 + 10);
    var noParticles = opts.noParticles || false;

    return '<div class="div-av-wrap ' + wrapCls + '" style="width:' + w + 'px;height:' + h + 'px;border-radius:' + rStr + ';--dv-orbit:-' + orbitR + 'px">' +
             '<div class="div-av-aura" aria-hidden="true"></div>' +
             '<div class="div-av-inner ' + extraCls + '" style="background:' + bgGradient + ';width:' + w + 'px;height:' + h + 'px;border-radius:' + rStr + ';font-size:' + fs + 'px;' + extraStyle + '">' +
               initials + innerExtra +
             '</div>' +
             ((!noParticles && divDef) ? _particlesHTML(divDef, orbitR) : '') +
           '</div>';
  }

  // Pyramid icon HTML for a division — size: 'sm'|'md'|'lg'|'xl'
  // Returns a <span> using CSS mask tinting instead of character icons
  function pyramidHTML(divDef, size) {
    size = size || 'md';
    var nameLow = divDef.name.toLowerCase();
    return '<span class="dv-pyr dv-pyr-' + size + ' dv-pyr-' + nameLow + '" aria-label="' + divDef.name + '"></span>';
  }

  // Returns a divDef augmented with provisional:true if settled < 20
  function getDisplay(settled, score) {
    var d = divFromScore(score);
    if (settled < 20) {
      return Object.assign({}, d, { provisional: true, settled: settled });
    }
    return Object.assign({}, d, { score: score, provisional: false });
  }

  // Division badge pill HTML — includes pyramid icon
  // size: 'sm' | 'md' | 'lg'
  function pillHTML(divDef, size) {
    size = size || 'md';
    if (divDef && divDef.provisional) {
      return '<span class="dv-pill dv-pill-' + size + ' dv-pill-provisional">◌ PROVISIONAL · ' + (divDef.settled||0) + '/20</span>';
    }
    var pyrSize = size === 'lg' ? 'md' : 'sm';
    return '<span class="dv-pill dv-pill-' + size + ' ' + divDef.pillCls + '">' +
             pyramidHTML(divDef, pyrSize) + ' ' + divDef.name +
           '</span>';
  }

  // Apply division glow to an EXISTING DOM element (wraps it in div-av-wrap).
  // Safe to call multiple times — detects and updates existing wrapper.
  function applyGlow(el, divDef) {
    if (!el || !divDef) return;
    var parent = el.parentElement;

    // Already wrapped — update wrapper class and particles
    if (parent && parent.classList.contains('div-av-wrap')) {
      parent.className = 'div-av-wrap ' + divDef.wrapCls;
      var orbitR = Math.round(el.offsetWidth / 2 + 10);
      parent.style.setProperty('--dv-orbit', '-' + orbitR + 'px');
      var existing = parent.querySelector('.div-parts');
      if (existing) existing.remove();
      if (divDef.particles) {
        parent.insertAdjacentHTML('beforeend', _particlesHTML(divDef));
      }
      return;
    }

    // First time — wrap the element
    var w = el.offsetWidth  || 40;
    var h = el.offsetHeight || w;
    var r = Math.round(Math.min(w,h) * 0.26);
    var orbitR = Math.round(Math.min(w,h) / 2 + 10);

    var wrap = document.createElement('div');
    wrap.className = 'div-av-wrap ' + divDef.wrapCls;
    wrap.style.cssText = 'width:' + w + 'px;height:' + h + 'px;border-radius:' + r + 'px;flex-shrink:0';
    wrap.style.setProperty('--dv-orbit', '-' + orbitR + 'px');

    var aura = document.createElement('div');
    aura.className = 'div-av-aura';
    aura.setAttribute('aria-hidden','true');

    el.parentNode.insertBefore(wrap, el);
    wrap.appendChild(aura);
    el.classList.add('div-av-inner');
    wrap.appendChild(el);

    if (divDef.particles) {
      wrap.insertAdjacentHTML('beforeend', _particlesHTML(divDef));
    }

    _observeWrap(wrap);
  }

  // ── Pause animations when off-screen ────────────────────────────
  var _io = null;
  function _observeWrap(wrap) {
    if (!('IntersectionObserver' in window)) return;
    if (!_io) {
      _io = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          var s = e.isIntersecting ? 'running' : 'paused';
          e.target.querySelectorAll('.div-av-aura,.div-part').forEach(function(el) {
            el.style.animationPlayState = s;
          });
        });
      }, {threshold: 0});
    }
    _io.observe(wrap);
  }

  // ── Boot ─────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCSS);
  } else {
    injectCSS();
  }

  window.Divisions = {
    get          : get,
    getFromStats : getFromStats,
    getDisplay   : getDisplay,
    calcScore    : calcScore,
    avHTML       : avHTML,
    pillHTML     : pillHTML,
    pyramidHTML  : pyramidHTML,
    applyGlow    : applyGlow,
    DEFS         : DEFS,
  };

})();
