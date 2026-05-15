// ─────────────────────────────────────────────────────────────────────────────
// LEDGR — Rankings Engine
// Add these routes and helpers to your Railway backend Express app.
//
// Run backend-rankings-schema.sql before deploying.
//
// Integration points:
//   1. After every pick is GRADED, call: recalcUserRankings(db, userId)
//   2. Schedule a weekly job (Sunday 23:59 UTC): snapshotWeeklyRankings(db)
//   3. Mount these routes: router.get('/rankings', ...) etc.
//
// Replace `db`, `router`, `requireAuth`, `requireInternal` with your instances.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Canonical formula constants ─────────────────────────────────────────────
const ELO_START   = 1000;
const ELO_K       = 32;
const ELO_FLOOR   = 100;

// Division thresholds (descending order)
const DIVISION_THRESHOLDS = [
  { label: 'LEGENDARY', min: 92 },
  { label: 'ELITE',     min: 80 },
  { label: 'DIAMOND',   min: 65 },
  { label: 'PLATINUM',  min: 50 },
  { label: 'GOLD',      min: 35 },
  { label: 'SILVER',    min: 20 },
  { label: 'BRONZE',    min: 0  },
];

// Archetype detection priority (matches archetypes.js)
const ARCHETYPES = [
  { key: 'demon',          test: s => s.currentStreak >= 5 },
  { key: 'sniper',         test: s => s.totalPicks < 30 && s.roi > 20 },
  { key: 'sharp',          test: s => s.sharpScore > 70 },
  { key: 'grinder',        test: s => s.totalPicks > 100 && s.roi > 0 },
  { key: 'underdog-king',  test: s => (s.avgOdds || 0) > 3.0 && s.roi > 0 },
  { key: 'value-hunter',   test: s => (s.avgOdds || 0) >= 2.5 && (s.avgOdds || 0) <= 3.5 && s.roi > 0 },
];

// Flow state detection (matches flow.js)
const FLOW_STATES = [
  { id: 'on_fire',          test: s => s.streakType === 'win'  && s.currentStreak >= 5 },
  { id: 'cold_streak',      test: s => s.streakType === 'loss' && Math.abs(s.currentStreak) >= 3 },
  { id: 'heating_up',       test: s => s.streakType === 'win'  && s.currentStreak >= 3 && s.currentStreak < 5 },
  { id: 'sharp_momentum',   test: s => (s.clvAvg || 0) > 2 },
  { id: 'underdog',         test: s => (s.avgOdds || 0) > 3.0 && s.roi > 10 },
  { id: 'clv_leader',       test: s => (s.clvAvg || 0) > 4 },
  { id: 'consistent',       test: s => s.totalPicks >= 20 && s.winRate >= 0.55 },
  { id: 'contender',        test: s => s.elo >= 1200 },
];

// Archetype metadata (mirrors archetypes.js — keep in sync)
const ARCHETYPE_META = {
  sniper:          { icon: '🎯', name: 'The Sniper',         color: '#f59e0b' },
  demon:           { icon: '😈', name: 'The Demon',          color: '#f87171' },
  grinder:         { icon: '⚙️', name: 'The Grinder',        color: '#94a3b8' },
  sharp:           { icon: '📐', name: 'The Sharp',          color: '#818cf8' },
  'value-hunter':  { icon: '🔍', name: 'Value Hunter',       color: '#34d399' },
  'lock-machine':  { icon: '🔒', name: 'Lock Machine',       color: '#fbbf24' },
  'ice-cold':      { icon: '🧊', name: 'Ice Cold',           color: '#7dd3fc' },
  'profit-farmer': { icon: '💰', name: 'Profit Farmer',      color: '#86efac' },
  'underdog-king': { icon: '👑', name: 'Underdog King',      color: '#e879f9' },
  'data-nerd':     { icon: '📊', name: 'Data Nerd',          color: '#a78bfa' },
  'momentum-monster':{ icon:'🌊', name: 'Momentum Monster',  color: '#fb923c' },
};

// Flow state metadata (mirrors flow.js — keep in sync)
const FLOW_META = {
  on_fire:        { icon: '🔥', label: '🔥 On Fire',      short: 'On Fire',        color: '#fb923c' },
  cold_streak:    { icon: '🥶', label: '🥶 Cold Streak',  short: 'Cold Streak',    color: '#7dd3fc' },
  heating_up:     { icon: '🌡️', label: '🌡️ Heating Up',  short: 'Heating Up',     color: '#fbbf24' },
  sharp_momentum: { icon: '📈', label: '📈 Sharp Momentum',short:'Sharp Momentum', color: '#818cf8' },
  underdog:       { icon: '🐉', label: '🐉 Underdog',     short: 'Underdog',       color: '#e879f9' },
  clv_leader:     { icon: '💡', label: '💡 CLV Leader',   short: 'CLV Leader',     color: '#34d399' },
  consistent:     { icon: '🧱', label: '🧱 Consistent',   short: 'Consistent',     color: '#94a3b8' },
  contender:      { icon: '⚡', label: '⚡ Contender',    short: 'Contender',      color: '#f59e0b' },
};

// ─── Formula helpers ──────────────────────────────────────────────────────────

function calcEloChange(currentElo, result, odds, winStreak) {
  // impliedProbability from decimal odds, clamped to [0.05, 0.95], with 10% vig correction
  const rawIp = 1 / (odds || 2);
  const ip = Math.max(0.05, Math.min(0.95, rawIp * 0.9));
  // Expected score
  const expected = 1 / (1 + Math.pow(10, (ELO_START - currentElo) / 400));
  const actual = result === 'win' ? 1 : (result === 'push' ? 0.5 : 0);
  let delta = Math.round(ELO_K * (actual - expected));
  // Streak bonus: +2 per consecutive win beyond 2 (max +10)
  if (result === 'win' && winStreak >= 3) {
    delta += Math.min((winStreak - 2), 5) * 2;
  }
  return Math.max(ELO_FLOOR, currentElo + delta) - currentElo;
}

function calcDivisionScore(picks, winRate, roi) {
  const roiPct  = roi;         // already a percentage
  const wrPct   = winRate * 100;
  return (
    Math.min(40, (roiPct / 20) * 40) +
    Math.min(30, (wrPct  / 70) * 30) +
    Math.min(20, (picks  / 100) * 20) +
    Math.min(10, picks)
  );
}

function divisionFromScore(score) {
  for (const t of DIVISION_THRESHOLDS) {
    if (score >= t.min) return t.label;
  }
  return 'BRONZE';
}

function calcSharpScore(roi, totalPicks, avgOdds, currentStreak) {
  const sampleFactor = Math.min(1, totalPicks / 50);
  const oddsFactor   = Math.min(1.5, (avgOdds || 1.5) / 1.5);
  const streakFactor = currentStreak > 0 ? Math.min(1.3, 1 + currentStreak * 0.05) : 1;
  return Math.max(0, Math.min(100, roi * sampleFactor * oddsFactor * streakFactor));
}

function calcReliabilityScore(totalPicks, winRate, bestStreak) {
  const volumeScore  = Math.min(40, (totalPicks / 50) * 40);
  const wrScore      = Math.min(40, (winRate * 100 / 70) * 40);
  const streakScore  = Math.min(20, (bestStreak / 10) * 20);
  return Math.min(100, volumeScore + wrScore + streakScore);
}

function detectArchetype(stats) {
  for (const a of ARCHETYPES) {
    if (a.test(stats)) return a.key;
  }
  return null;
}

function detectFlowState(stats) {
  for (const f of FLOW_STATES) {
    if (f.test(stats)) return f.id;
  }
  return null;
}

function enrichArchetype(key) {
  if (!key || !ARCHETYPE_META[key]) return null;
  return { key, ...ARCHETYPE_META[key] };
}

function enrichFlowState(id) {
  if (!id || !FLOW_META[id]) return null;
  return { id, ...FLOW_META[id] };
}

// ─── Core recalculation function ──────────────────────────────────────────────
// Call this after every pick is graded.
async function recalcUserRankings(db, userId) {
  // Fetch all graded picks for this user (win/loss/push only)
  const [picks] = await db.query(`
    SELECT result, odds, stake, pnl, sport, market, eloAfter, clv, createdAt
    FROM picks
    WHERE userId = ? AND result IN ('win','loss','push')
    ORDER BY createdAt ASC
  `, [userId]);

  if (!picks.length) return;

  // Aggregate
  let wins = 0, losses = 0, pushes = 0;
  let totalStake = 0, totalPnl = 0;
  let oddsSum = 0, oddsCount = 0;
  let clvSum = 0, clvCount = 0;
  let currentStreak = 0, bestStreak = 0;
  let streakType = 'none';
  let elo = ELO_START;
  let winStreakForElo = 0;

  for (const p of picks) {
    if (p.result === 'win')       wins++;
    else if (p.result === 'loss') losses++;
    else                          pushes++;

    totalStake += parseFloat(p.stake || 0);
    totalPnl   += parseFloat(p.pnl   || 0);

    if (p.odds) { oddsSum += parseFloat(p.odds); oddsCount++; }
    if (p.clv  != null) { clvSum += parseFloat(p.clv); clvCount++; }

    // ELO
    if (p.result !== 'push') {
      if (p.result === 'win') winStreakForElo++;
      else                    winStreakForElo = 0;
    }
    // Use stored eloAfter if available (trust backend grading service)
    if (p.eloAfter) {
      elo = parseInt(p.eloAfter);
    } else {
      elo = Math.max(ELO_FLOOR, elo + calcEloChange(elo, p.result, parseFloat(p.odds || 2), winStreakForElo));
    }
  }

  // Streak: walk backwards
  const graded = picks.filter(p => p.result === 'win' || p.result === 'loss');
  if (graded.length) {
    const last = graded[graded.length - 1].result;
    streakType = last === 'win' ? 'win' : 'loss';
    let streak = 0;
    for (let i = graded.length - 1; i >= 0; i--) {
      if (graded[i].result === last) streak++;
      else break;
    }
    currentStreak = streakType === 'win' ? streak : -streak;
    // Best win streak
    let run = 0;
    for (const p of graded) {
      if (p.result === 'win') { run++; bestStreak = Math.max(bestStreak, run); }
      else run = 0;
    }
  }

  const totalPicks = wins + losses + pushes;
  const gradedCount = wins + losses;
  const winRate = gradedCount > 0 ? wins / gradedCount : 0;
  const roi = totalStake > 0 ? (totalPnl / totalStake) * 100 : 0;
  const avgOdds = oddsCount > 0 ? oddsSum / oddsCount : null;
  const clvAvg = clvCount >= 5 ? clvSum / clvCount : null;

  const divisionScore = calcDivisionScore(totalPicks, winRate, roi);
  const division = divisionFromScore(divisionScore);
  const sharpScore = calcSharpScore(roi, totalPicks, avgOdds, currentStreak > 0 ? currentStreak : 0);
  const reliabilityScore = calcReliabilityScore(totalPicks, winRate, bestStreak);
  const lastPickAt = picks[picks.length - 1].createdAt;
  const isLive = (Date.now() - new Date(lastPickAt).getTime()) < 2 * 60 * 60 * 1000 ? 1 : 0;

  const statsForDetection = {
    currentStreak, streakType, roi, totalPicks, sharpScore, avgOdds, winRate, elo, clvAvg,
  };
  const archetype = detectArchetype(statsForDetection);
  const flowState = detectFlowState(statsForDetection);

  // Get username
  const [userRows] = await db.query('SELECT username FROM users WHERE id = ? LIMIT 1', [userId]);
  if (!userRows.length) return;
  const { username } = userRows[0];

  // Upsert user_rankings
  await db.query(`
    INSERT INTO user_rankings
      (userId, username, totalPicks, wins, losses, pushes, totalStake, totalPnl, roi,
       winRate, elo, divisionScore, division, sharpScore, reliabilityScore,
       clvAvg, clvSum, clvCount, currentStreak, streakType, bestStreak,
       archetype, flowState, isLive, lastPickAt, avgOdds)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON DUPLICATE KEY UPDATE
      username=VALUES(username), totalPicks=VALUES(totalPicks), wins=VALUES(wins),
      losses=VALUES(losses), pushes=VALUES(pushes), totalStake=VALUES(totalStake),
      totalPnl=VALUES(totalPnl), roi=VALUES(roi), winRate=VALUES(winRate),
      elo=VALUES(elo), divisionScore=VALUES(divisionScore), division=VALUES(division),
      sharpScore=VALUES(sharpScore), reliabilityScore=VALUES(reliabilityScore),
      clvAvg=VALUES(clvAvg), clvSum=VALUES(clvSum), clvCount=VALUES(clvCount),
      currentStreak=VALUES(currentStreak), streakType=VALUES(streakType),
      bestStreak=VALUES(bestStreak), archetype=VALUES(archetype), flowState=VALUES(flowState),
      isLive=VALUES(isLive), lastPickAt=VALUES(lastPickAt), avgOdds=VALUES(avgOdds),
      updatedAt=NOW()
  `, [
    userId, username, totalPicks, wins, losses, pushes,
    totalStake.toFixed(2), totalPnl.toFixed(2), roi.toFixed(4),
    winRate.toFixed(4), elo, divisionScore.toFixed(2), division,
    sharpScore.toFixed(2), reliabilityScore.toFixed(2),
    clvAvg != null ? clvAvg.toFixed(4) : null,
    clvSum.toFixed(4), clvCount,
    currentStreak, streakType, bestStreak,
    archetype, flowState, isLive, lastPickAt, avgOdds != null ? avgOdds.toFixed(4) : null,
  ]);

  // Update recent_picks_cache with the 3 most recent graded picks
  const recent = picks.slice(-3).reverse();  // [newest, ..., oldest]
  await db.query('DELETE FROM recent_picks_cache WHERE userId = ?', [userId]);
  for (let i = 0; i < recent.length; i++) {
    const p = recent[i];
    await db.query(`
      INSERT INTO recent_picks_cache (userId, slot, result, sport, market, odds, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [userId, i, p.result, p.sport || null, p.market || null,
        p.odds != null ? parseFloat(p.odds).toFixed(4) : null, p.createdAt]);
  }
}

// ─── Weekly snapshot job ──────────────────────────────────────────────────────
// Schedule at Sunday 23:59 UTC (cron: 59 23 * * 0)
async function snapshotWeeklyRankings(db) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const week = getISOWeek(now);
  const isoWeek = `${year}-W${String(week).padStart(2, '0')}`;

  const [rows] = await db.query(`
    SELECT userId, username, elo, division, divisionScore, sharpScore, roi, winRate, totalPicks
    FROM user_rankings
    ORDER BY elo DESC
  `);

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    await db.query(`
      INSERT INTO ranking_history
        (userId, username, isoWeek, elo, division, divisionScore, sharpScore, roi, winRate, totalPicks, rank)
      VALUES (?,?,?,?,?,?,?,?,?,?,?)
      ON DUPLICATE KEY UPDATE
        elo=VALUES(elo), division=VALUES(division), divisionScore=VALUES(divisionScore),
        sharpScore=VALUES(sharpScore), roi=VALUES(roi), winRate=VALUES(winRate),
        totalPicks=VALUES(totalPicks), rank=VALUES(rank), snapshotAt=NOW()
    `, [r.userId, r.username, isoWeek, r.elo, r.division, r.divisionScore,
        r.sharpScore, r.roi, r.winRate, r.totalPicks, i + 1]);
  }
  console.log(`[rankings] Weekly snapshot complete: ${isoWeek}, ${rows.length} tipsters`);
}

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// ─── Format a single ranking row for the API response ─────────────────────────
function formatRankingRow(r, recentPicks) {
  return {
    userId:          r.userId,
    username:        r.username,
    totalPicks:      r.totalPicks,
    wins:            r.wins,
    losses:          r.losses,
    pushes:          r.pushes,
    totalStake:      parseFloat(r.totalStake),
    totalPnl:        parseFloat(r.totalPnl),
    roi:             parseFloat(r.roi),
    winRate:         parseFloat(r.winRate),
    elo:             r.elo,
    divisionScore:   parseFloat(r.divisionScore),
    division:        r.division,
    sharpScore:      parseFloat(r.sharpScore),
    reliabilityScore:parseFloat(r.reliabilityScore),
    clvAvg:          r.clvAvg != null ? parseFloat(r.clvAvg) : null,
    currentStreak:   r.currentStreak,
    streakType:      r.streakType,
    bestStreak:      r.bestStreak,
    avgOdds:         r.avgOdds != null ? parseFloat(r.avgOdds) : null,
    archetype:       enrichArchetype(r.archetype),
    flowState:       enrichFlowState(r.flowState),
    isLive:          !!r.isLive,
    lastPickAt:      r.lastPickAt,
    recentPicks:     recentPicks,
  };
}

// ─── GET /rankings — full leaderboard ─────────────────────────────────────────
router.get('/rankings', async (req, res) => {
  try {
    // Fetch all ranked tipsters, ordered by ELO desc
    const [rows] = await db.query(`
      SELECT * FROM user_rankings
      ORDER BY elo DESC
    `);

    if (!rows.length) return res.json({ tipsters: [], todayStats: _emptyTodayStats() });

    // Fetch all recent picks in one query
    const userIds = rows.map(r => r.userId);
    const [cacheRows] = await db.query(`
      SELECT userId, slot, result, sport, market, odds, createdAt
      FROM recent_picks_cache
      WHERE userId IN (?)
      ORDER BY userId, slot ASC
    `, [userIds]);

    // Group cache rows by userId
    const cacheMap = {};
    for (const c of cacheRows) {
      if (!cacheMap[c.userId]) cacheMap[c.userId] = [];
      cacheMap[c.userId].push({
        result:    c.result,
        sport:     c.sport,
        market:    c.market,
        odds:      c.odds != null ? parseFloat(c.odds) : null,
        createdAt: c.createdAt,
      });
    }

    // Today stats (wins/losses posted today)
    const todayStats = await _computeTodayStats(db);

    const tipsters = rows.map(r => formatRankingRow(r, cacheMap[r.userId] || []));
    res.json({ tipsters, todayStats });
  } catch (e) {
    console.error('GET /rankings error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── GET /rankings/:username — single tipster ─────────────────────────────────
router.get('/rankings/:username', async (req, res) => {
  const { username } = req.params;
  if (!/^[a-zA-Z0-9_\-]{1,50}$/.test(username)) {
    return res.status(400).json({ error: 'Invalid username' });
  }
  try {
    const [rows] = await db.query(
      'SELECT * FROM user_rankings WHERE username = ? LIMIT 1',
      [username]
    );
    if (!rows.length) return res.json(null);

    const r = rows[0];
    const [cacheRows] = await db.query(
      'SELECT result,sport,market,odds,createdAt FROM recent_picks_cache WHERE userId = ? ORDER BY slot ASC',
      [r.userId]
    );
    const recentPicks = cacheRows.map(c => ({
      result: c.result, sport: c.sport, market: c.market,
      odds: c.odds != null ? parseFloat(c.odds) : null, createdAt: c.createdAt,
    }));

    // Also compute rank position
    const [[{ rank }]] = await db.query(
      'SELECT COUNT(*) + 1 AS rank FROM user_rankings WHERE elo > ?',
      [r.elo]
    );

    res.json({ ...formatRankingRow(r, recentPicks), rank });
  } catch (e) {
    console.error('GET /rankings/:username error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── GET /rankings/:username/history — weekly progression ─────────────────────
router.get('/rankings/:username/history', async (req, res) => {
  const { username } = req.params;
  if (!/^[a-zA-Z0-9_\-]{1,50}$/.test(username)) {
    return res.status(400).json({ error: 'Invalid username' });
  }
  try {
    const [rows] = await db.query(`
      SELECT isoWeek, elo, division, divisionScore, sharpScore, roi, winRate, totalPicks, rank, snapshotAt
      FROM ranking_history
      WHERE username = ?
      ORDER BY isoWeek ASC
      LIMIT 52
    `, [username]);
    res.json(rows);
  } catch (e) {
    console.error('GET /rankings/:username/history error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /internal/rankings/recalculate/:userId ──────────────────────────────
// Trigger a single-user recalculation (call after grading a pick).
// Protect with requireInternal or an internal secret header.
router.post('/internal/rankings/recalculate/:userId', requireInternal, async (req, res) => {
  const userId = parseInt(req.params.userId, 10);
  if (!userId || isNaN(userId)) return res.status(400).json({ error: 'Invalid userId' });
  try {
    await recalcUserRankings(db, userId);
    res.json({ success: true });
  } catch (e) {
    console.error('recalculate error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /internal/rankings/recalculate-all ──────────────────────────────────
// Full recalculation for all users. Use sparingly (expensive).
router.post('/internal/rankings/recalculate-all', requireInternal, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id FROM users');
    let done = 0, failed = 0;
    for (const u of users) {
      try {
        await recalcUserRankings(db, u.id);
        done++;
      } catch (e) {
        console.error(`recalc failed for userId=${u.id}:`, e);
        failed++;
      }
    }
    res.json({ success: true, done, failed });
  } catch (e) {
    console.error('recalculate-all error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Today stats helper ───────────────────────────────────────────────────────
async function _computeTodayStats(db) {
  try {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const [rows] = await db.query(`
      SELECT result, pnl, userId
      FROM picks
      WHERE createdAt >= ? AND result IN ('win','loss','push')
    `, [todayStart]);

    let winsToday = 0, lossesToday = 0, bigWinPnl = 0;
    const activeSet = new Set();
    for (const p of rows) {
      if (p.result === 'win')  winsToday++;
      if (p.result === 'loss') lossesToday++;
      if (parseFloat(p.pnl) > bigWinPnl) bigWinPnl = parseFloat(p.pnl);
      activeSet.add(p.userId);
    }

    // Active = posted a pick in last 24h (any result including pending)
    const [activeRows] = await db.query(`
      SELECT COUNT(DISTINCT userId) AS cnt
      FROM picks
      WHERE createdAt >= ?
    `, [todayStart]);

    return {
      winsToday,
      lossesToday,
      bigWinPnl: bigWinPnl > 0 ? bigWinPnl : null,
      activeToday: activeRows[0].cnt,
    };
  } catch (e) {
    console.error('_computeTodayStats error:', e);
    return _emptyTodayStats();
  }
}

function _emptyTodayStats() {
  return { winsToday: 0, lossesToday: 0, bigWinPnl: null, activeToday: 0 };
}

// ─── Exports (for use in your app.js) ─────────────────────────────────────────
module.exports = { recalcUserRankings, snapshotWeeklyRankings };

// ─── Usage in app.js ──────────────────────────────────────────────────────────
//
// const { recalcUserRankings, snapshotWeeklyRankings } = require('./rankings-engine');
//
// After grading a pick:
//   await recalcUserRankings(db, pick.userId);
//
// Weekly cron (node-cron or similar):
//   cron.schedule('59 23 * * 0', () => snapshotWeeklyRankings(db));
//
// Mount routes (in app.js, before module.exports):
//   require('./rankings-engine');  // assuming router/db/requireInternal are global
