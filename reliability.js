// ── LEDGR Reliability & Trust System ──────────────────────────
// Phases 1, 2, 3, 6 — shared across tipster, leaderboard, home, dashboard

// ── Phase 1: Letter grade from numeric reliability score (0-100) ──
function gradeFromScore(score) {
  if (score >= 90) return { grade: 'A+', color: '#34d399' };
  if (score >= 75) return { grade: 'A',  color: '#4ade80' };
  if (score >= 60) return { grade: 'B+', color: '#fbbf24' };
  if (score >= 45) return { grade: 'B',  color: '#fb923c' };
  if (score >= 30) return { grade: 'C',  color: '#9590b8' };
  return { grade: 'D', color: '#f87171' };
}

// Full grade computation from picks array
// Components: sampleScore(25) + consistencyScore(25) + volumeScore(20) + clvScore(15) + stabilityScore(15) = 100
function getReliabilityGrade(picks) {
  const settled = picks.filter(p => p.result === 'win' || p.result === 'loss')
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const wins = settled.filter(p => p.result === 'win').length;
  const count = picks.length;
  const settledCount = settled.length;
  const wr = settledCount > 0 ? wins / settledCount : 0;

  const sampleScore      = Math.min(25, (count / 100) * 25);
  const consistencyScore = Math.min(25, wr * 30);
  const volumeScore      = Math.min(20, (count / 50) * 20);

  const clvPicks = settled.filter(p => p.clv != null);
  let clvScore = 7.5;
  if (clvPicks.length > 0) {
    const clvAvg = clvPicks.reduce((s, p) => s + p.clv, 0) / clvPicks.length;
    clvScore = clvAvg > 0 ? 15 : Math.max(0, ((clvAvg + 5) / 5) * 15);
  }

  let stabilityScore = 7.5;
  if (settledCount >= 10) {
    const recent = settled.slice(-Math.min(20, settledCount));
    const recentWins = recent.filter(p => p.result === 'win').length;
    const recentWR = recent.length > 0 ? recentWins / recent.length : 0;
    stabilityScore = Math.max(0, 15 - Math.abs(recentWR - wr) * 30);
  }

  const score = Math.min(100, Math.max(0, Math.round(sampleScore + consistencyScore + volumeScore + clvScore + stabilityScore)));
  const { grade, color } = gradeFromScore(score);
  return { score, grade, color };
}

// ── Phase 2: Verification badge ──────────────────────────────────
function getVerificationLevel(pickCount, gradeScore, lastPickDate) {
  const daysSince = lastPickDate
    ? (Date.now() - new Date(lastPickDate).getTime()) / 86400000
    : 999;
  const activeRecently = daysSince <= 30;

  if (pickCount >= 100 && gradeScore >= 75 && activeRecently)
    return { level: 'ELITE_VERIFIED',  label: 'ELITE VERIFIED',  icon: '◆', color: '#fbbf24' };
  if (pickCount >= 50 && gradeScore >= 45)
    return { level: 'GOLD_VERIFIED',   label: 'GOLD VERIFIED',   icon: '✓✓', color: '#fbbf24' };
  if (pickCount >= 25 && gradeScore >= 30)
    return { level: 'SILVER_VERIFIED', label: 'SILVER VERIFIED', icon: '✓',  color: '#94a3b8' };
  if (pickCount >= 10)
    return { level: 'BRONZE_VERIFIED', label: 'VERIFIED',        icon: '✓',  color: '#b87c50' };
  return { level: 'UNVERIFIED', label: 'UNVERIFIED', icon: '○', color: '#6B6B6B' };
}

function verificationBadgeHTML(pickCount, gradeScore, lastPickDate) {
  const v = getVerificationLevel(pickCount, gradeScore, lastPickDate);
  if (v.level === 'UNVERIFIED') return '';
  const bgAlpha = { ELITE_VERIFIED: '0.12', GOLD_VERIFIED: '0.07', SILVER_VERIFIED: '0.07', BRONZE_VERIFIED: '0.07' };
  const bg = bgAlpha[v.level] || '0.07';
  return `<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;letter-spacing:1.5px;background:rgba(${hexToRgbStr(v.color)},${bg});border:1px solid rgba(${hexToRgbStr(v.color)},0.25);color:${v.color}">${v.icon} ${v.label}</span>`;
}

function hexToRgbStr(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `${r},${g},${b}`;
}

// ── Phase 3: Low sample warning ──────────────────────────────────
function sampleWarningHTML(pickCount) {
  if (pickCount >= 100)
    return `<span style="display:inline-flex;align-items:center;gap:4px;font-family:'JetBrains Mono',monospace;font-size:9px;color:#34d399;letter-spacing:1px">✓ ESTABLISHED TRACK RECORD</span>`;
  if (pickCount >= 50) return '';
  if (pickCount >= 25)
    return `<span style="display:inline-flex;align-items:center;gap:4px;font-family:'JetBrains Mono',monospace;font-size:9px;color:#6a6690;letter-spacing:1px">· Building track record</span>`;
  if (pickCount >= 10)
    return `<span style="display:inline-flex;align-items:center;gap:4px;font-family:'JetBrains Mono',monospace;font-size:9px;color:#9590b8;letter-spacing:1px">ℹ Limited data — ${pickCount} picks</span>`;
  return `<span style="display:inline-flex;align-items:center;gap:4px;font-family:'JetBrains Mono',monospace;font-size:9px;color:#fbbf24;letter-spacing:1px">⚠ Low sample — stats unreliable</span>`;
}

// ── Phase 6: Anti-manipulation flags ─────────────────────────────
// Returns array of {type, message, severity:'info'} — informational only
function computeSuspicionFlags(picks) {
  const flags = [];
  if (picks.length < 5) return flags;

  const chronoPicks = [...picks].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const overallAvg = picks.reduce((s, p) => s + (p.stake || 0), 0) / picks.length;

  // Stake inflation: last 5 have avg stake > 2× overall avg
  const last5 = chronoPicks.slice(-5);
  const last5Avg = last5.reduce((s, p) => s + (p.stake || 0), 0) / 5;
  if (overallAvg > 0 && last5Avg > overallAvg * 2) {
    flags.push({ type: 'stake_inflation', message: 'Stake size increasing recently', severity: 'info' });
  }

  // Odds clustering: >80% of picks within ±0.15 of median odds
  if (picks.length >= 10) {
    const odds = picks.map(p => p.odds || 0).filter(o => o > 1).sort((a, b) => a - b);
    const mid = odds[Math.floor(odds.length / 2)];
    const inRange = odds.filter(o => Math.abs(o - mid) <= 0.15).length;
    if (inRange / odds.length > 0.8) {
      flags.push({ type: 'odds_clustering', message: 'Narrow odds range', severity: 'info' });
    }
  }

  // Recent inactivity: no picks in 30 days, account active for 60+ days
  const firstDate = new Date(chronoPicks[0].createdAt).getTime();
  const lastDate  = new Date(chronoPicks[chronoPicks.length - 1].createdAt).getTime();
  const accountAge   = (Date.now() - firstDate) / 86400000;
  const daysSinceLast = (Date.now() - lastDate)  / 86400000;
  if (accountAge > 60 && daysSinceLast > 30) {
    flags.push({ type: 'recent_inactivity', message: 'Inactive last 30 days', severity: 'info' });
  }

  return flags;
}

// Render data notes row — returns '' if no flags
function suspicionFlagsHTML(picks) {
  const flags = computeSuspicionFlags(picks);
  if (!flags.length) return '';
  return `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">${
    flags.map(f => `<span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:20px;font-family:'JetBrains Mono',monospace;font-size:9px;color:#6a6690;border:1px solid rgba(106,102,144,0.25);background:rgba(106,102,144,0.05)">ℹ ${f.message}</span>`).join('')
  }</div>`;
}
