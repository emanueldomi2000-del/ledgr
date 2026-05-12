(function () {
  'use strict';

  // ── CSS ──────────────────────────────────────────────────────────
  function injectCSS() {
    if (document.getElementById('sh-css')) return;
    const s = document.createElement('style');
    s.id = 'sh-css';
    s.textContent = `
/* ═══ LEDGR SHARE MODAL ══════════════════════════════════════ */
#sh-modal{position:fixed;inset:0;z-index:8000;display:none;
  align-items:center;justify-content:center;
  background:rgba(7,6,13,.92);backdrop-filter:blur(18px)}
#sh-modal.open{display:flex;animation:sh-in .22s ease}
@keyframes sh-in{from{opacity:0}to{opacity:1}}

.sh-box{display:flex;flex-direction:column;align-items:center;gap:16px;
  max-width:min(480px,92vw);width:100%}

.sh-preview-wrap{position:relative;width:100%;aspect-ratio:1/1;
  border-radius:16px;overflow:hidden;
  box-shadow:0 24px 80px rgba(0,0,0,.7);
  border:1px solid rgba(184,159,255,.12);cursor:pointer}
#sh-canvas{width:100%;height:100%;display:block}

.sh-label{font-family:'DM Mono',monospace;font-size:9px;color:rgba(106,102,144,.7);
  letter-spacing:2px;text-transform:uppercase;text-align:center}

.sh-btns{display:flex;gap:10px;width:100%}
.sh-btn{flex:1;padding:13px 8px;border-radius:10px;border:none;
  font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:2px;
  cursor:pointer;transition:all .18s;display:flex;align-items:center;
  justify-content:center;gap:7px}
.sh-btn-dl  {background:#b89fff;color:#07060d}
.sh-btn-dl:hover{background:#cdb8ff;transform:translateY(-1px)}
.sh-btn-x   {background:rgba(255,255,255,.08);color:#f0edff;
  border:1px solid rgba(255,255,255,.12)}
.sh-btn-x:hover{background:rgba(255,255,255,.14);transform:translateY(-1px)}
.sh-btn-cls {background:transparent;color:#6a6690;border:1px solid rgba(255,255,255,.08);
  flex:0 0 52px;padding:13px}
.sh-btn-cls:hover{color:#f87171;border-color:rgba(248,113,113,.3)}

/* Share triggers injected in pick cards */
.pick-share-btn{display:inline-flex;align-items:center;gap:4px;
  padding:4px 10px;border-radius:6px;border:1px solid rgba(52,211,153,.25);
  background:rgba(52,211,153,.07);color:#34d399;font-size:10px;
  font-family:'DM Mono',monospace;cursor:pointer;transition:all .18s;
  letter-spacing:.5px}
.pick-share-btn:hover{background:rgba(52,211,153,.14);border-color:rgba(52,211,153,.4)}

.sh-streak-btn{display:inline-flex;align-items:center;gap:6px;
  padding:6px 14px;border-radius:8px;border:1px solid rgba(251,146,60,.3);
  background:rgba(251,146,60,.08);color:#fb923c;font-size:11px;
  font-family:'DM Mono',monospace;cursor:pointer;transition:all .18s}
.sh-streak-btn:hover{background:rgba(251,146,60,.18)}

.sh-recap-btn{display:inline-flex;align-items:center;gap:6px;
  padding:6px 14px;border-radius:8px;border:1px solid rgba(184,159,255,.25);
  background:rgba(184,159,255,.07);color:#b89fff;font-size:11px;
  font-family:'DM Mono',monospace;cursor:pointer;transition:all .18s}
.sh-recap-btn:hover{background:rgba(184,159,255,.16)}

.sh-action-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:6px}
`;
    document.head.appendChild(s);

    // Modal DOM
    const m = document.createElement('div');
    m.id = 'sh-modal';
    m.innerHTML = `
      <div class="sh-box">
        <div class="sh-preview-wrap">
          <canvas id="sh-canvas"></canvas>
        </div>
        <div class="sh-label">Tap preview to zoom · Click outside to close</div>
        <div class="sh-btns">
          <button class="sh-btn sh-btn-dl"  id="sh-dl-btn">📥 Download PNG</button>
          <button class="sh-btn sh-btn-x"   id="sh-x-btn">𝕏 Share</button>
          <button class="sh-btn sh-btn-cls" id="sh-cls-btn">✕</button>
        </div>
      </div>`;
    document.body.appendChild(m);

    m.addEventListener('click', function (e) {
      if (e.target === m) closeModal();
    });
    document.getElementById('sh-cls-btn').addEventListener('click', closeModal);
    document.getElementById('sh-dl-btn').addEventListener('click', downloadCard);
    document.getElementById('sh-x-btn').addEventListener('click', shareToX);
  }

  // ── Modal state ───────────────────────────────────────────────────
  let _offscreenCanvas = null;
  let _filename        = 'ledgr-card.png';
  let _xText           = '';

  function showModal(canvas, filename, xText) {
    _offscreenCanvas = canvas;
    _filename        = filename || 'ledgr-card.png';
    _xText           = xText   || 'Check out my LEDGR record → getledgr.bet';

    // Draw into the preview canvas (scaled to fit)
    const preview = document.getElementById('sh-canvas');
    const size    = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.72, 480);
    preview.width  = size;
    preview.height = size;
    preview.getContext('2d').drawImage(canvas, 0, 0, size, size);

    document.getElementById('sh-modal').classList.add('open');
  }

  function closeModal() {
    document.getElementById('sh-modal').classList.remove('open');
  }

  function downloadCard() {
    if (!_offscreenCanvas) return;
    const a    = document.createElement('a');
    a.download = _filename;
    a.href     = _offscreenCanvas.toDataURL('image/png');
    a.click();
  }

  function shareToX() {
    const url  = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(_xText);
    window.open(url, '_blank', 'noopener');
  }

  // ── Colour palette ────────────────────────────────────────────────
  const C = {
    bg:   '#07060d', s1:'#0c0a1a', s2:'#15122a',
    ac:   '#b89fff', gr:'#34d399', rd:'#f87171',
    gold: '#fbbf24', cyan:'#38bdf8', orange:'#fb923c',
    tx:   '#f0edff', mu:'#6a6690', mu2:'#9590b8',
  };

  const DIV_META = {
    BRONZE:    { color:'#c49070', icon:'🥉' },
    SILVER:    { color:'#94a3b8', icon:'🥈' },
    GOLD:      { color:'#fbbf24', icon:'🏆' },
    PLATINUM:  { color:'#38bdf8', icon:'⚡' },
    DIAMOND:   { color:'#b89fff', icon:'💎' },
    ELITE:     { color:'#f43f5e', icon:'🔱' },
    LEGENDARY: { color:'#fbbf24', icon:'🐐' },
  };

  // ── Drawing helpers ───────────────────────────────────────────────
  function newCanvas(w, h) {
    const c  = document.createElement('canvas');
    c.width  = w; c.height = h;
    return c;
  }

  function rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  function hex2rgba(hex, a) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  }

  // Draw the top accent gradient bar
  function drawAccentBar(ctx, W, colors) {
    const g = ctx.createLinearGradient(0, 0, W, 0);
    colors = colors || ['#7c3aed','#b89fff','#fbbf24'];
    colors.forEach(function(c, i) { g.addColorStop(i / (colors.length-1), c); });
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, 6);
  }

  // Draw LEDGR wordmark
  function drawLogo(ctx, x, y, size) {
    size = size || 52;
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `700 ${size}px "Bebas Neue", sans-serif`;
    ctx.fillStyle = C.tx;
    ctx.fillText('LEDG', x, y);
    const lw = ctx.measureText('LEDG').width;
    ctx.fillStyle = C.ac;
    ctx.fillText('R', x + lw, y);
  }

  // Draw division badge pill
  function drawDivBadge(ctx, divName, cx, cy, sz) {
    sz = sz || 1;
    const meta  = DIV_META[divName] || DIV_META.BRONZE;
    const label = meta.icon + ' ' + divName;
    const fs    = Math.round(20 * sz);
    ctx.font    = `700 ${fs}px "DM Mono", monospace`;
    const tw    = ctx.measureText(label).width;
    const pw    = tw + Math.round(28 * sz);
    const ph    = Math.round(36 * sz);
    const x     = cx - pw / 2;
    const y     = cy - ph / 2;
    const r     = ph / 2;

    rrect(ctx, x, y, pw, ph, r);
    ctx.fillStyle = hex2rgba(meta.color, 0.15);
    ctx.fill();

    rrect(ctx, x, y, pw, ph, r);
    ctx.strokeStyle = hex2rgba(meta.color, 0.55);
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    ctx.fillStyle    = meta.color;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.font         = `700 ${fs}px "DM Mono", monospace`;
    ctx.fillText(label, cx, cy);
  }

  // Fit text into maxWidth by reducing font size
  function fitFont(ctx, text, family, weight, baseSize, maxWidth, minSize) {
    minSize = minSize || 24;
    let sz  = baseSize;
    ctx.font = `${weight} ${sz}px ${family}`;
    while (ctx.measureText(text).width > maxWidth && sz > minSize) {
      sz -= 2;
      ctx.font = `${weight} ${sz}px ${family}`;
    }
    return sz;
  }

  // Draw horizontal divider line
  function hline(ctx, y, W, alpha) {
    ctx.strokeStyle = `rgba(184,159,255,${alpha || 0.1})`;
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(60, y);
    ctx.lineTo(W - 60, y);
    ctx.stroke();
  }

  // Background: dark fill + subtle radial glow
  function drawBg(ctx, W, H, glowColor) {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle grid
    ctx.strokeStyle = 'rgba(184,159,255,0.03)';
    ctx.lineWidth   = 1;
    for (let x = 0; x <= W; x += 90) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y <= H; y += 90) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Radial glow
    glowColor = glowColor || 'rgba(124,58,237,0.07)';
    const rg = ctx.createRadialGradient(W/2, H*0.3, 0, W/2, H*0.3, W*0.7);
    rg.addColorStop(0, glowColor);
    rg.addColorStop(1, 'transparent');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);
  }

  // Username + avatar circle
  function drawUserRow(ctx, username, divName, cx, y, avSize) {
    avSize = avSize || 56;
    // Avatar circle
    const avX = cx - 160;
    ctx.beginPath();
    ctx.arc(avX, y, avSize/2, 0, Math.PI*2);
    const ag = ctx.createLinearGradient(avX-avSize/2, y-avSize/2, avX+avSize/2, y+avSize/2);
    ag.addColorStop(0, '#7c3aed'); ag.addColorStop(1, '#a855f7');
    ctx.fillStyle = ag;
    ctx.fill();

    // Initials
    ctx.font      = `700 ${Math.round(avSize*0.4)}px "Bebas Neue", sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(username.slice(0,2).toUpperCase(), avX, y);

    // @username
    ctx.font      = `600 26px "Syne", sans-serif`;
    ctx.fillStyle = C.tx;
    ctx.textAlign = 'left';
    ctx.fillText('@' + username, avX + avSize/2 + 16, y - 12);

    // Division badge (small, inline)
    const meta  = DIV_META[divName] || DIV_META.BRONZE;
    ctx.font      = `700 18px "DM Mono", monospace`;
    ctx.fillStyle = meta.color;
    ctx.fillText(meta.icon + ' ' + divName, avX + avSize/2 + 16, y + 18);
  }

  // Footer text
  function drawFooter(ctx, W, H) {
    ctx.font         = `500 22px "DM Mono", monospace`;
    ctx.fillStyle    = C.mu;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Verified on LEDGR  ·  getledgr.bet', W/2, H - 44);
  }

  // ── 1. WIN CARD ───────────────────────────────────────────────────
  async function generateWinCard(pick, username, divisionObj) {
    await document.fonts.ready;
    const W = 1080, H = 1080;
    const c = newCanvas(W, H);
    const ctx = c.getContext('2d');

    const divName = (divisionObj && divisionObj.name) || 'BRONZE';
    const pnlPos  = pick.pnl >= 0;

    // Background
    drawBg(ctx, W, H, 'rgba(52,211,153,0.04)');
    drawAccentBar(ctx, W, ['#059669','#34d399','#b89fff']);

    // LEDGR logo
    drawLogo(ctx, 60, 88);

    // VERIFIED badge (top right)
    ctx.font         = `700 18px "DM Mono", monospace`;
    ctx.fillStyle    = hex2rgba(C.gr, 0.7);
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('✓ VERIFIED', W - 60, 88);

    hline(ctx, 130, W);

    // Sport tag
    const sportIcon = {'Soccer':'⚽','Basketball':'🏀','Tennis':'🎾','Football':'🏈','Baseball':'⚾','MMA/Boxing':'🥊'};
    const sIcon = sportIcon[pick.sport] || '🎯';
    ctx.font      = `700 22px "DM Mono", monospace`;
    ctx.fillStyle = C.mu2;
    ctx.textAlign = 'left';
    ctx.fillText(sIcon + '  ' + (pick.sport || 'Sport').toUpperCase(), 60, 180);

    // Date (top right)
    ctx.textAlign = 'right';
    ctx.fillText(new Date(pick.createdAt || Date.now()).toLocaleDateString('en-GB', {day:'2-digit',month:'short',year:'numeric'}), W-60, 180);

    // Event name (big, centered, adaptive size)
    const evText = pick.event || 'Match';
    fitFont(ctx, evText, '"Syne", sans-serif', '700', 68, W - 160, 32);
    ctx.fillStyle    = C.tx;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(evText, W/2, 300);

    // Market
    ctx.font         = `500 30px "DM Mono", monospace`;
    ctx.fillStyle    = C.mu2;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    const mkt = (pick.market || '').length > 38 ? pick.market.slice(0,36)+'…' : (pick.market || '');
    ctx.fillText(mkt, W/2, 378);

    hline(ctx, 426, W);

    // Big odds
    ctx.font         = `700 118px "Bebas Neue", sans-serif`;
    ctx.fillStyle    = C.ac;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('@ ' + parseFloat(pick.odds).toFixed(2), W/2, 540);

    // Stake info
    ctx.font         = `500 24px "DM Mono", monospace`;
    ctx.fillStyle    = C.mu;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Stake: ' + pick.stake + 'u', W/2, 618);

    // WIN Result box
    const bx = 80, by = 660, bw = W - 160, bh = 220, br = 20;
    rrect(ctx, bx, by, bw, bh, br);
    const bg2 = ctx.createLinearGradient(bx, by, bx, by+bh);
    bg2.addColorStop(0, 'rgba(52,211,153,0.14)');
    bg2.addColorStop(1, 'rgba(52,211,153,0.05)');
    ctx.fillStyle = bg2;
    ctx.fill();

    rrect(ctx, bx, by, bw, bh, br);
    ctx.strokeStyle = 'rgba(52,211,153,0.45)';
    ctx.lineWidth   = 2;
    ctx.stroke();

    // WIN badge inside box
    ctx.font         = `700 36px "DM Mono", monospace`;
    ctx.fillStyle    = C.gr;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✅  WIN', W/2, by + 62);

    // P&L amount
    const pnlText = (pnlPos ? '+' : '') + pick.pnl.toFixed(2) + 'u';
    fitFont(ctx, pnlText, '"Bebas Neue", sans-serif', '700', 108, bw - 60, 48);
    ctx.fillStyle    = pnlPos ? C.gr : C.rd;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pnlText, W/2, by + 160);

    hline(ctx, 920, W);

    // User + division row
    drawUserRow(ctx, username, divName, W/2, 978, 60);

    drawFooter(ctx, W, H);

    const xText = `✅ ${pick.event} @ ${parseFloat(pick.odds).toFixed(2)} — ${pnlText} profit\n@LEDGR — getledgr.bet`;
    showModal(c, 'ledgr-win.png', xText);
    return c;
  }

  // ── 2. STREAK CARD ────────────────────────────────────────────────
  async function generateStreakCard(streakCount, username, divisionObj, stats) {
    await document.fonts.ready;
    const W = 1080, H = 1080;
    const c = newCanvas(W, H);
    const ctx = c.getContext('2d');
    stats = stats || {};

    const divName = (divisionObj && divisionObj.name) || 'BRONZE';

    // Background with fire glow
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    // Warm glow from bottom
    const fg = ctx.createRadialGradient(W/2, H, 0, W/2, H, H*0.85);
    fg.addColorStop(0, 'rgba(251,146,60,0.18)');
    fg.addColorStop(0.5, 'rgba(251,191,36,0.07)');
    fg.addColorStop(1, 'transparent');
    ctx.fillStyle = fg;
    ctx.fillRect(0, 0, W, H);

    // Top glow
    const tg = ctx.createRadialGradient(W/2, 0, 0, W/2, 0, W*0.6);
    tg.addColorStop(0, 'rgba(251,146,60,0.1)');
    tg.addColorStop(1, 'transparent');
    ctx.fillStyle = tg;
    ctx.fillRect(0, 0, W, H);

    drawAccentBar(ctx, W, ['#dc2626','#fb923c','#fbbf24','#fb923c','#dc2626']);

    // LEDGR logo (top left)
    drawLogo(ctx, 60, 88, 48);

    // Fire emojis arc (top center)
    const fires = streakCount >= 10 ? '🔥🔥🔥🔥🔥' : streakCount >= 7 ? '🔥🔥🔥🔥' : '🔥🔥🔥';
    ctx.font         = `400 72px serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fires, W/2, 210);

    // BIG streak number
    ctx.font         = `700 320px "Bebas Neue", sans-serif`;
    ctx.fillStyle    = C.tx;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    // Glow effect — draw multiple layers
    ctx.shadowColor  = '#fb923c';
    ctx.shadowBlur   = 60;
    ctx.fillText(String(streakCount), W/2, 520);
    ctx.shadowBlur   = 0;
    ctx.shadowColor  = 'transparent';

    // "WIN STREAK" text
    ctx.font         = `700 80px "Bebas Neue", sans-serif`;
    ctx.fillStyle    = C.orange;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('WIN STREAK', W/2, 690);

    hline(ctx, 756, W);

    // Stats row
    const roiStr  = stats.roi    != null ? (stats.roi >= 0 ? '+' : '') + parseFloat(stats.roi).toFixed(1) + '% ROI'  : '';
    const wrStr   = stats.wr     != null ? parseFloat(stats.wr).toFixed(0) + '% WR'   : '';
    const pnlStr  = stats.pnl    != null ? (stats.pnl >= 0 ? '+' : '') + parseFloat(stats.pnl).toFixed(1) + 'u P&L' : '';
    const parts   = [roiStr, wrStr, pnlStr].filter(Boolean).join('  ·  ');
    if (parts) {
      ctx.font         = `500 26px "DM Mono", monospace`;
      ctx.fillStyle    = C.mu2;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(parts, W/2, 820);
    }

    // User + division
    drawUserRow(ctx, username, divName, W/2, 920, 56);

    drawFooter(ctx, W, H);

    const xText = `🔥 ${streakCount}-win streak on LEDGR!\nBuilding a verified record: getledgr.bet`;
    showModal(c, 'ledgr-streak.png', xText);
    return c;
  }

  // ── 3. WEEKLY RECAP CARD ─────────────────────────────────────────
  async function generateRecapCard(stats, username, divisionObj) {
    await document.fonts.ready;
    const W = 1080, H = 1080;
    const c = newCanvas(W, H);
    const ctx = c.getContext('2d');
    stats = stats || {};

    const divName = (divisionObj && divisionObj.name) || 'BRONZE';
    const roiPos  = (stats.roi || 0) >= 0;
    const pnlPos  = (stats.pnl || 0) >= 0;

    drawBg(ctx, W, H, 'rgba(184,159,255,0.05)');
    drawAccentBar(ctx, W);

    // LEDGR logo
    drawLogo(ctx, 60, 88, 48);

    // Date range (top right)
    const now  = new Date();
    const week = new Date(now - 7 * 86400000);
    const fmt  = function(d) { return d.toLocaleDateString('en-GB',{day:'2-digit',month:'short'}); };
    ctx.font         = `500 22px "DM Mono", monospace`;
    ctx.fillStyle    = C.mu;
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(fmt(week) + ' – ' + fmt(now), W - 60, 88);

    hline(ctx, 130, W);

    // "WEEKLY RECAP" header
    ctx.font         = `700 88px "Bebas Neue", sans-serif`;
    ctx.fillStyle    = C.tx;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('WEEKLY RECAP', W/2, 212);

    // @username
    ctx.font         = `700 32px "Syne", sans-serif`;
    ctx.fillStyle    = C.ac;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('@' + username, W/2, 280);

    hline(ctx, 320, W);

    // 4-stat boxes (2×2 grid)
    const boxW  = 430, boxH = 180, gap = 20;
    const startX = (W - (boxW * 2 + gap)) / 2;
    const rows   = [
      [{ label:'PICKS', val: String(stats.picks || 0), color: C.ac },
       { label:'WINS · LOSSES', val: (stats.wins||0) + ' · ' + (stats.losses||0), color: C.mu2 }],
      [{ label:'ROI', val: (roiPos ? '+':'') + parseFloat(stats.roi||0).toFixed(1) + '%', color: roiPos ? C.gr : C.rd },
       { label:'P&L', val: (pnlPos ? '+':'-') + Math.abs(parseFloat(stats.pnl||0)).toFixed(1) + 'u', color: pnlPos ? C.gr : C.rd }],
    ];

    rows.forEach(function(row, ri) {
      row.forEach(function(box, ci) {
        const bx = startX + ci * (boxW + gap);
        const by = 350 + ri * (boxH + gap);

        rrect(ctx, bx, by, boxW, boxH, 16);
        ctx.fillStyle = C.s1;
        ctx.fill();
        rrect(ctx, bx, by, boxW, boxH, 16);
        ctx.strokeStyle = 'rgba(184,159,255,0.1)';
        ctx.lineWidth   = 1;
        ctx.stroke();

        ctx.font         = `700 54px "Bebas Neue", sans-serif`;
        ctx.fillStyle    = box.color;
        ctx.textAlign    = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(box.val, bx + boxW/2, by + boxH/2 - 10);

        ctx.font      = `500 18px "DM Mono", monospace`;
        ctx.fillStyle = C.mu;
        ctx.fillText(box.label, bx + boxW/2, by + boxH/2 + 38);
      });
    });

    // Best pick section
    hline(ctx, 760, W);

    if (stats.bestPick) {
      const bp = stats.bestPick;
      ctx.font         = `700 22px "DM Mono", monospace`;
      ctx.fillStyle    = C.mu;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('BEST PICK THIS WEEK', W/2, 806);

      const bpText = bp.event + '  @  ' + parseFloat(bp.odds).toFixed(2);
      fitFont(ctx, bpText, '"Syne", sans-serif', '700', 40, W - 200, 24);
      ctx.fillStyle    = C.tx;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(bpText, W/2, 854);

      ctx.font         = `700 36px "Bebas Neue", sans-serif`;
      ctx.fillStyle    = C.gr;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+' + bp.pnl.toFixed(2) + 'u', W/2, 898);
    }

    hline(ctx, 940, W);
    drawUserRow(ctx, username, divName, W/2, 990, 52);
    drawFooter(ctx, W, H);

    const roiStr = (roiPos ? '+' : '') + parseFloat(stats.roi||0).toFixed(1) + '%';
    const xText  = `📊 My week on LEDGR: ${stats.picks||0} picks · ${roiStr} ROI\nVerified record → getledgr.bet`;
    showModal(c, 'ledgr-recap.png', xText);
    return c;
  }

  // ── 4. RANK UP CARD ───────────────────────────────────────────────
  async function generateRankUpCard(newDivision, username, stats, oldDivision) {
    await document.fonts.ready;
    const W = 1080, H = 1080;
    const c = newCanvas(W, H);
    const ctx = c.getContext('2d');
    stats = stats || {};

    const meta    = DIV_META[newDivision]  || DIV_META.BRONZE;
    const oldMeta = DIV_META[oldDivision || 'BRONZE'] || DIV_META.BRONZE;
    const divColor = meta.color;

    // Background with division-coloured glow
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, W, H);

    const rg = ctx.createRadialGradient(W/2, H*0.45, 0, W/2, H*0.45, W*0.65);
    rg.addColorStop(0, hex2rgba(divColor, 0.14));
    rg.addColorStop(0.6, hex2rgba(divColor, 0.04));
    rg.addColorStop(1, 'transparent');
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);

    drawAccentBar(ctx, W, [divColor, '#f0edff', divColor]);
    drawLogo(ctx, 60, 88, 48);

    // "DIVISION UP" label (top right)
    ctx.font         = `700 22px "DM Mono", monospace`;
    ctx.fillStyle    = hex2rgba(divColor, 0.8);
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('DIVISION UP', W - 60, 88);

    hline(ctx, 130, W);

    // Old → New division icons (large)
    if (oldDivision) {
      ctx.font         = `400 90px serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.globalAlpha  = 0.5;
      ctx.fillText(oldMeta.icon, W/2 - 110, 252);
      ctx.globalAlpha  = 1;

      ctx.font      = `700 56px "Bebas Neue", sans-serif`;
      ctx.fillStyle = C.mu;
      ctx.fillText('→', W/2, 252);

      ctx.font         = `400 90px serif`;
      ctx.fillText(meta.icon, W/2 + 110, 252);
    } else {
      ctx.font         = `400 90px serif`;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(meta.icon, W/2, 252);
    }

    // "PROMOTED TO" label
    ctx.font         = `700 36px "DM Mono", monospace`;
    ctx.fillStyle    = C.mu2;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('PROMOTED TO', W/2, 360);

    // Division name (massive)
    ctx.font         = `700 160px "Bebas Neue", sans-serif`;
    ctx.fillStyle    = divColor;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor  = divColor;
    ctx.shadowBlur   = 50;
    ctx.fillText(newDivision, W/2, 520);
    ctx.shadowBlur   = 0;
    ctx.shadowColor  = 'transparent';

    hline(ctx, 640, W);

    // Stats row (3 items)
    const statItems = [
      { label:'ROI',      val: stats.roi    != null ? (parseFloat(stats.roi)>=0?'+':'')+parseFloat(stats.roi).toFixed(1)+'%' : '—' },
      { label:'WIN RATE', val: stats.wr     != null ? parseFloat(stats.wr).toFixed(0)+'%' : '—' },
      { label:'PICKS',    val: stats.picks  != null ? String(stats.picks) : '—' },
    ];

    const sw = (W - 120) / 3;
    statItems.forEach(function(it, i) {
      const sx = 60 + i * sw + sw/2;
      ctx.font         = `700 64px "Bebas Neue", sans-serif`;
      ctx.fillStyle    = i === 0 ? (parseFloat(stats.roi||0)>=0 ? C.gr : C.rd) : C.tx;
      ctx.textAlign    = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(it.val, sx, 730);

      ctx.font      = `500 20px "DM Mono", monospace`;
      ctx.fillStyle = C.mu;
      ctx.fillText(it.label, sx, 782);

      if (i < statItems.length - 1) {
        ctx.strokeStyle = 'rgba(184,159,255,0.1)';
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(60 + (i+1)*sw, 688);
        ctx.lineTo(60 + (i+1)*sw, 820);
        ctx.stroke();
      }
    });

    hline(ctx, 860, W);
    drawUserRow(ctx, username, newDivision, W/2, 940, 56);
    drawFooter(ctx, W, H);

    const xText = `🏆 Just reached ${newDivision} division on LEDGR!\nVerified record: getledgr.bet`;
    showModal(c, 'ledgr-rankup.png', xText);
    return c;
  }

  // ── Boot ─────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCSS);
  } else {
    injectCSS();
  }

  window.Share = {
    winCard     : generateWinCard,
    streakCard  : generateStreakCard,
    recapCard   : generateRecapCard,
    rankUpCard  : generateRankUpCard,
    closeModal  : closeModal,
  };

})();
