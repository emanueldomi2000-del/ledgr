/* ─────────────────────────────────────────────────────────────────────────
   LEDGR /motion.js  —  Phase 11 Premium Motion
   Shared animation utilities. No dependencies.
   Exposes: window.LEDGR.countUp(el, target, opts)
            window.LEDGR.observeReveal()
   CSS deps: app-components.css (.reveal, .revealed, .reveal-d1…d4)
───────────────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  window.LEDGR = window.LEDGR || {};

  /* ── COUNT-UP ─────────────────────────────────────────────────────────────
     Animates el.textContent from 0 → target with ease-in-out quad.
     opts: { duration:650, decimals:0, suffix:'', prefix:'', from:0 }
     Safe to call after content already set — overrides with animated version.
  ───────────────────────────────────────────────────────────────────────── */
  LEDGR.countUp = function (el, target, opts) {
    if (!el || isNaN(target)) return;
    var o    = opts || {};
    var dur  = o.duration != null ? o.duration : 650;
    var dec  = o.decimals != null ? o.decimals : 0;
    var sfx  = o.suffix   || '';
    var pfx  = o.prefix   || '';
    var from = o.from     != null ? Math.abs(o.from) : 0;
    var neg  = target < 0;
    var abs  = Math.abs(target);
    var t0   = null;

    function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

    function tick(ts) {
      if (!t0) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var v = from + (abs - from) * ease(p);
      el.textContent = pfx + (neg ? '-' : '') + v.toFixed(dec) + sfx;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = pfx + (neg ? '-' : '') + abs.toFixed(dec) + sfx;
    }
    requestAnimationFrame(tick);
  };

  /* ── SECTION REVEAL ───────────────────────────────────────────────────────
     Elements with class "reveal" start opacity:0 + translateY(10px) (from CSS).
     They gain class "revealed" when entering the viewport, triggering transition.
     Delay variants: .reveal-d1 (60ms) → .reveal-d4 (240ms)
     Call LEDGR.observeReveal() again after injecting dynamic content.
  ───────────────────────────────────────────────────────────────────────── */
  LEDGR.observeReveal = (function () {
    if (!window.IntersectionObserver) return function () {};

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.04, rootMargin: '0px 0px -16px 0px' });

    return function () {
      document.querySelectorAll('.reveal:not(.revealed)').forEach(function (el) {
        io.observe(el);
      });
    };
  })();

  /* Boot observer on ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', LEDGR.observeReveal);
  } else {
    LEDGR.observeReveal();
  }

})();
