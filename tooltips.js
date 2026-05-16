(function () {
  'use strict';

  // ── CSS ─────────────────────────────────────────────────────────
  if (!document.getElementById('tt-styles')) {
    const s = document.createElement('style');
    s.id = 'tt-styles';
    s.textContent = `
/* ═══ LEDGR TOOLTIP SYSTEM ══════════════════════════════════ */
.tt-q{display:inline-flex;align-items:center;justify-content:center;min-width:20px;min-height:20px;width:15px;height:15px;border-radius:50%;background:rgba(123,44,255,0.1);border:1px solid rgba(123,44,255,0.35);color:#B14CFF;font-family:'DM Mono',monospace;font-size:9px;font-weight:700;cursor:pointer;padding:0;line-height:1;margin-left:4px;flex-shrink:0;vertical-align:middle;transition:background .15s,border-color .15s;position:relative}
.tt-q::before{content:'';position:absolute;inset:-14px}
.tt-q:hover,.tt-q.tt-open{background:rgba(123,44,255,0.22);border-color:#7B2CFF}

#tt-box{position:fixed;z-index:99999;max-width:260px;width:260px;background:#1E1E1E;border:1px solid #7B2CFF;border-radius:8px;padding:10px 14px;box-shadow:0 0 20px rgba(123,44,255,0.3);pointer-events:none;opacity:0;transform:translateY(8px) scale(.97);transition:opacity .18s,transform .18s;line-height:1.5;font-size:13px;color:#E6E6E6}
#tt-box.tt-show{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}
#tt-box.tt-below .tt-arrow{top:-6px;bottom:auto;transform:rotate(-135deg)}

.tt-title{font-family:'Bebas Neue','Rajdhani',sans-serif;font-size:14px;letter-spacing:1.5px;color:#B14CFF;margin-bottom:6px}
.tt-what{font-size:12px;color:#E6E6E6;line-height:1.6;margin-bottom:8px}
.tt-row{margin-bottom:6px;font-size:11px;color:#6B6B6B;line-height:1.6}
.tt-row:last-child{margin-bottom:0}
.tt-lbl{display:block;font-family:'DM Mono',monospace;font-size:8px;letter-spacing:2px;color:#7B2CFF;text-transform:uppercase;margin-bottom:2px}
.tt-code{font-family:'DM Mono',monospace;font-size:9px;color:#b89fff;background:rgba(123,44,255,0.1);padding:1px 6px;border-radius:4px;display:inline}
.tt-arrow{position:absolute;width:10px;height:10px;background:#1E1E1E;border-right:1px solid #7B2CFF;border-bottom:1px solid #7B2CFF;transform:rotate(45deg);bottom:-6px;left:50%;margin-left:-5px}
`;
    document.head.appendChild(s);
  }

  // ── Tooltip data ─────────────────────────────────────────────────
  const TIPS = {
    roi: {
      label: 'ROI — Return on Investment',
      what: 'Profit relative to total stake. The core measure of a tipster\'s profitability over time.',
      why: 'A 10% ROI means for every 100u staked you profit 10u. Anything above 5% long-term is elite.',
      how: '(Total P&L ÷ Total Stake) × 100'
    },
    sharp: {
      label: 'Sharp Score',
      what: 'A 0–100 skill rating that goes beyond raw ROI to measure genuine edge.',
      why: 'Penalises small samples, high variance and easy odds. 70+ indicates real skill, not luck.',
      how: 'ROI × Sample Factor × Odds Difficulty × Streak Stability'
    },
    winrate: {
      label: 'Win Rate',
      what: 'Percentage of settled picks that resulted in a win.',
      why: 'Must be read alongside odds. A 45% WR at odds 2.5 can be very profitable.',
      how: 'Wins ÷ (Wins + Losses) × 100'
    },
    elo: {
      label: 'ELO Rating',
      what: 'A dynamic chess-style rating that adjusts based on the difficulty of each bet.',
      why: 'Unlike ROI, ELO rewards winning when odds imply low probability — it measures genuine skill.',
      how: 'Starts at 1000. Adjusted by K × (Actual − Expected) per pick, where Expected = implied prob.'
    },
    reliability: {
      label: 'Reliability Score',
      what: 'An overall trust score (0–100) combining multiple quality signals.',
      why: 'A 5-pick tipster with 100% WR is not reliable. Reliability rewards sustained performance.',
      how: 'ROI contribution (40%) + Win Rate (30%) + Volume (20%) + Activity (10%)'
    },
    pnl: {
      label: 'P&L — Profit & Loss',
      what: 'Total units won or lost across all settled picks.',
      why: 'Absolute profit in units. Compare alongside ROI to understand scale of edge.',
      how: 'Sum of (stake × (odds − 1)) for wins minus stake for losses'
    },
    units: {
      label: 'Units (u)',
      what: 'A normalised stake size used to compare tipsters regardless of currency.',
      why: 'Keeps comparisons fair — 1u could be £10 or £100 depending on your bankroll.',
      how: '1u = 1 unit of bankroll. Typically 1–5% of total bankroll per pick.'
    },
    archetype: {
      label: 'Archetype',
      what: 'Auto-assigned betting personality based on pick history patterns.',
      why: 'Helps you identify tipsters whose style matches your own risk appetite.',
      how: 'Computed from picks: volume, ROI, avg odds, streak, and Sharp Score thresholds.'
    },
    division: {
      label: 'Division',
      what: 'A rank tier from Bronze to Legend based on overall performance score.',
      why: 'Quick visual signal of a tipster\'s overall standing on the platform.',
      how: 'Score = ROI (max 40) + Win Rate (max 30) + Volume (max 20) + Picks (max 10)'
    },
    clv: {
      label: 'CLV — Closing Line Value',
      what: 'Whether you beat the closing market odds at kick-off.',
      why: 'The closing line is the sharpest price. Consistently beating it predicts long-term profit.',
      how: '(Your Odds − Closing Odds) ÷ Closing Odds × 100 = CLV%'
    },
    picks: {
      label: 'Pick Volume',
      what: 'Total number of picks posted by this tipster.',
      why: 'Higher volume makes results more statistically significant and harder to attribute to luck.',
      how: 'Count of all picks. 30+ is the minimum for statistical meaning; 100+ for confidence.'
    }
  };

  // ── State ────────────────────────────────────────────────────────
  let activeBtn  = null;
  let box        = null;
  let isMobile   = false;
  let hideTimer  = null;

  // Detect mobile via touchstart (not UA sniffing)
  document.addEventListener('touchstart', function () { isMobile = true; }, { once: true, passive: true });

  function getBox() {
    if (!box) {
      box = document.createElement('div');
      box.id = 'tt-box';
      box.innerHTML = '<div class="tt-arrow"></div>';
      document.body.appendChild(box);

      // Keep popup alive when mouse moves into it (desktop grace period)
      box.addEventListener('mouseenter', function () { clearTimeout(hideTimer); });
      box.addEventListener('mouseleave', function () { hide(); });

      // Close on tap outside (mobile)
      document.addEventListener('touchstart', function (e) {
        if (box.classList.contains('tt-show') &&
            !box.contains(e.target) &&
            e.target !== activeBtn &&
            !e.target.classList.contains('tt-q')) {
          hide();
        }
      }, { passive: true });

      // Close on click outside (desktop fallback)
      document.addEventListener('pointerdown', function (e) {
        if (!isMobile &&
            box.classList.contains('tt-show') &&
            !box.contains(e.target) &&
            e.target !== activeBtn &&
            !e.target.classList.contains('tt-q')) {
          hide();
        }
      });
    }
    return box;
  }

  function show(btn, key) {
    const tip = TIPS[key];
    if (!tip) return;

    // Mobile: toggle on repeated tap of same button
    if (isMobile && activeBtn === btn && getBox().classList.contains('tt-show')) {
      hide();
      return;
    }

    clearTimeout(hideTimer);
    activeBtn = btn;
    document.querySelectorAll('.tt-q.tt-open').forEach(function (b) { b.classList.remove('tt-open'); });
    btn.classList.add('tt-open');

    const b = getBox();
    b.innerHTML =
      '<div class="tt-title">' + tip.label + '</div>' +
      '<div class="tt-what">' + tip.what + '</div>' +
      '<div class="tt-row"><span class="tt-lbl">Why it matters</span>' + tip.why + '</div>' +
      '<div class="tt-row"><span class="tt-lbl">Calculation</span><span class="tt-code">' + tip.how + '</span></div>' +
      '<div class="tt-arrow"></div>';

    b.classList.remove('tt-show', 'tt-below');

    requestAnimationFrame(function () {
      const bw = b.offsetWidth  || 260;
      const bh = b.offsetHeight || 160;
      const br = btn.getBoundingClientRect();
      const spaceAbove = br.top;
      const below      = spaceAbove < bh + 20;

      let left = br.left + br.width / 2 - bw / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - bw - 8));

      const top = below
        ? br.bottom + window.scrollY + 12
        : br.top   + window.scrollY - bh - 12;

      b.style.left = left + 'px';
      b.style.top  = top  + 'px';

      const arrowLeft = br.left + br.width / 2 - left - 5;
      const arrow     = b.querySelector('.tt-arrow');
      if (arrow) arrow.style.left = Math.max(10, Math.min(arrowLeft, bw - 20)) + 'px';

      if (below) b.classList.add('tt-below');
      b.classList.add('tt-show');
    });
  }

  function hide() {
    if (!box) return;
    box.classList.remove('tt-show');
    if (activeBtn) { activeBtn.classList.remove('tt-open'); activeBtn = null; }
  }

  // ── Injection ────────────────────────────────────────────────────
  const PATTERNS = [
    { re: /\broi\b/i,              key: 'roi'         },
    { re: /sharp\s*score|^sharp$/i,key: 'sharp'       },
    { re: /win\s*rate/i,           key: 'winrate'     },
    { re: /\belo\b/i,              key: 'elo'         },
    { re: /reliabilit/i,           key: 'reliability' },
    { re: /p&(amp;)?l\b/i,        key: 'pnl'         },
    { re: /\bunits?\b/i,           key: 'units'       },
    { re: /archetype/i,            key: 'archetype'   },
    { re: /division/i,             key: 'division'    },
    { re: /\bclv\b/i,              key: 'clv'         },
    { re: /\bpicks?\b/i,           key: 'picks'       },
  ];

  const SELS = [
    '.stat-lbl', '.stat-label', '.lsl', '.sb-lbl',
    '.perf-key', '.id-stat-lbl', '.at-ss-lbl', '.at-gauge-lbl',
    '.rel-label', '.lb-head span', '.panel-title'
  ].join(',');

  function mkBtn(key) {
    const btn = document.createElement('button');
    btn.className = 'tt-q';
    btn.setAttribute('aria-label', 'Learn about ' + (TIPS[key] ? TIPS[key].label : key));
    btn.setAttribute('data-tt', key);
    btn.textContent = '?';

    // Mobile: touchstart toggle
    btn.addEventListener('touchstart', function (e) {
      e.preventDefault();
      e.stopPropagation();
      show(btn, key);
    }, { passive: false });

    // Desktop: click (fallback when not mobile)
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!isMobile) show(btn, key);
    });

    // Desktop: hover with 120ms grace period
    btn.addEventListener('mouseenter', function () {
      if (!isMobile) { clearTimeout(hideTimer); show(btn, key); }
    });
    btn.addEventListener('mouseleave', function () {
      if (!isMobile) {
        hideTimer = setTimeout(function () {
          if (box && !box.matches(':hover') && activeBtn === btn) hide();
        }, 150);
      }
    });

    return btn;
  }

  function injectTooltips() {
    document.querySelectorAll(SELS).forEach(function (el) {
      if (el.querySelector('.tt-q') || el.getAttribute('data-tt-done')) return;
      const txt = el.textContent.trim();
      for (var i = 0; i < PATTERNS.length; i++) {
        if (PATTERNS[i].re.test(txt)) {
          el.setAttribute('data-tt-done', '1');
          el.style.display = el.style.display || 'inline-flex';
          el.style.alignItems = 'center';
          el.style.gap = '3px';
          el.appendChild(mkBtn(PATTERNS[i].key));
          break;
        }
      }
    });
  }

  // Re-inject after dynamic content renders
  let debTimer;
  const obs = new MutationObserver(function () {
    clearTimeout(debTimer);
    debTimer = setTimeout(injectTooltips, 280);
  });

  function boot() {
    injectTooltips();
    obs.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    setTimeout(boot, 100);
  }

  window.initTooltips = injectTooltips;

})();
