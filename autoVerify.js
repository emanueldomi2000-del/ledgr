// ─────────────────────────────────────────────────────────────────────────────
// LEDGR — Auto-Grading Engine (autoVerify.js)
// Cron-based pick settlement engine. Integrate into your Railway backend.
//
// Integration:
//   const { runGrading, gradePickManually } = require('./autoVerify');
//   const { recalcUserRankings }           = require('./backend-rankings-engine');
//   const { emitPickGraded }               = require('./backend-ws-events');
//
// Cron (node-cron):
//   cron.schedule('*/5 * * * *', () => runGrading(db).catch(console.error));
//
// Environment variables required:
//   ODDS_API_KEY       — The Odds API key
//   ADMIN_USER_IDS     — comma-separated user IDs with admin access (e.g. "1,2,7")
//
// ─── Schema migration (run once before deploying) ─────────────────────────────
//
// MySQL:
//   ALTER TABLE picks
//     MODIFY COLUMN result ENUM('win','loss','push','void','pending') DEFAULT 'pending',
//     ADD COLUMN IF NOT EXISTS settledAt  DATETIME     DEFAULT NULL,
//     ADD COLUMN IF NOT EXISTS gradedBy   VARCHAR(30)  DEFAULT NULL,
//     ADD COLUMN IF NOT EXISTS gradedNote TEXT         DEFAULT NULL,
//     ADD COLUMN IF NOT EXISTS sportKey   VARCHAR(50)  DEFAULT NULL;
//
// PostgreSQL (Supabase):
//   ALTER TABLE picks
//     ALTER COLUMN result TYPE VARCHAR(10),
//     ADD COLUMN IF NOT EXISTS "settledAt"  TIMESTAMPTZ DEFAULT NULL,
//     ADD COLUMN IF NOT EXISTS "gradedBy"   VARCHAR(30) DEFAULT NULL,
//     ADD COLUMN IF NOT EXISTS "gradedNote" TEXT        DEFAULT NULL,
//     ADD COLUMN IF NOT EXISTS "sportKey"   VARCHAR(50) DEFAULT NULL;
//   -- Then add check constraint:
//   ALTER TABLE picks
//     ADD CONSTRAINT picks_result_check
//     CHECK (result IN ('win','loss','push','void','pending'));
//
// Also update GET /picks response to include settledAt, gradedBy (for frontend display).
//
// ─── Pick POST: add sportKey at submission time ────────────────────────────────
// In your POST /picks handler, set pick.sportKey from the fixture's sport key.
// The GET /fixtures endpoint already knows the sportKey — pass it back in the fixture
// object so the frontend can include it in the pick payload:
//   body.sportKey = req.body.sportKey || null
//
// ─────────────────────────────────────────────────────────────────────────────

const axios = require('axios');

const ODDS_API_BASE    = 'https://api.the-odds-api.com/v4';
const MAX_PENDING_DAYS = 7;   // Auto-void picks older than this with no result
const SCORES_LOOKBACK  = 3;   // Odds API daysFrom param (max 3 on free tier)

// ─── Sport key mapping ────────────────────────────────────────────────────────
// Maps LEDGR sport display name → canonical Odds API sport_key
// For multi-league sports, picks should store the specific sportKey at submission.
// These are safe fallbacks when sportKey is not stored on the pick.
const SPORT_KEY_DEFAULTS = {
  'Baseball':    'baseball_mlb',
  'Basketball':  'basketball_nba',
  'Football':    'americanfootball_nfl',
  'MMA/Boxing':  'mma_mixed_martial_arts',
  // Soccer and Tennis have many keys — require sportKey stored on pick
};

// Commonly active Soccer leagues to try when sportKey is missing from a pick.
// These are attempted in order and results are merged (expensive if many pending picks).
const SOCCER_FALLBACK_KEYS = [
  'soccer_epl',
  'soccer_spain_la_liga',
  'soccer_germany_bundesliga',
  'soccer_italy_serie_a',
  'soccer_france_ligue_one',
  'soccer_uefa_champs_league',
  'soccer_usa_mls',
  'soccer_brazil_campeonato',
];

// ─── PnL calculator ───────────────────────────────────────────────────────────
function calcPnl(result, stake, odds) {
  const s = parseFloat(stake) || 0;
  const o = parseFloat(odds) || 1;
  switch (result) {
    case 'win':  return parseFloat((s * (o - 1)).toFixed(4));
    case 'loss': return parseFloat((-s).toFixed(4));
    case 'push':
    case 'void': return 0;
    default:     return 0;
  }
}

// ─── Market parser ────────────────────────────────────────────────────────────
// Parses the market string stored on a pick into a structured object.
// Market strings come from the dashboard chip labels — see dashboard/index.html.
function parseMarket(market) {
  if (!market) return { type: 'unknown' };
  const m = String(market).trim();

  // ── Soccer result (H2H) ──
  if (m === 'Home Win (1)') return { type: 'h2h', selection: 'home' };
  if (m === 'Draw (X)')     return { type: 'h2h', selection: 'draw' };
  if (m === 'Away Win (2)') return { type: 'h2h', selection: 'away' };

  // ── Generic match winner (NBA, NFL, MLB, Tennis, MMA) ──
  if (m === 'Home Win')     return { type: 'h2h', selection: 'home' };
  if (m === 'Away Win')     return { type: 'h2h', selection: 'away' };

  // ── Soccer double chance ──
  if (m === '1X') return { type: 'dc', selection: '1x' };
  if (m === 'X2') return { type: 'dc', selection: 'x2' };
  if (m === '12') return { type: 'dc', selection: '12' };

  // ── BTTS ──
  if (m === 'BTTS Yes') return { type: 'btts', selection: 'yes' };
  if (m === 'BTTS No')  return { type: 'btts', selection: 'no' };

  // ── HT/FT (e.g. "HT Home / FT Home") ──
  const htftRe = /^HT (Home|Draw|Away) \/ FT (Home|Draw|Away)$/i;
  const htftM  = m.match(htftRe);
  if (htftM) return { type: 'htft', ht: htftM[1].toLowerCase(), ft: htftM[2].toLowerCase() };

  // ── Correct score (e.g. "2-1", "0-0") ──
  const csM = m.match(/^(\d+)-(\d+)$/);
  if (csM) return { type: 'correct_score', home: parseInt(csM[1]), away: parseInt(csM[2]) };

  // ── Spread (e.g. "-3.5", "+7.5") ──
  const spreadM = m.match(/^([+-]\d+\.?\d*)$/);
  if (spreadM) return { type: 'spread', spread: parseFloat(spreadM[1]) };

  // ── Team-specific total (e.g. "Lakers — Over 112.5") ──
  const teamTotalM = m.match(/^(.+)\s+[—\-]\s+(Over|Under)\s+(\d+\.?\d*)$/i);
  if (teamTotalM) return {
    type: 'team_total',
    team:      teamTotalM[1].trim(),
    direction: teamTotalM[2].toLowerCase(),
    line:      parseFloat(teamTotalM[3]),
  };

  // ── Game total (e.g. "Over 2.5", "Under 220.5") ──
  const totalM = m.match(/^(Over|Under)\s+(\d+\.?\d*)$/i);
  if (totalM) return { type: 'total', direction: totalM[1].toLowerCase(), line: parseFloat(totalM[2]) };

  return { type: 'unknown' };
}

// ─── Grade a parsed market against a final score ──────────────────────────────
// Returns: 'win' | 'loss' | 'push' | 'void'
// homeScore / awayScore are integers (or numbers).
function gradeResult(parsed, homeScore, awayScore) {
  const h = Number(homeScore);
  const a = Number(awayScore);

  switch (parsed.type) {
    case 'h2h': {
      const actual = h > a ? 'home' : h < a ? 'away' : 'draw';
      return parsed.selection === actual ? 'win' : 'loss';
    }
    case 'dc': {
      const actual = h > a ? '1' : h < a ? '2' : 'x';
      if (parsed.selection === '1x' && (actual === '1' || actual === 'x')) return 'win';
      if (parsed.selection === 'x2' && (actual === 'x' || actual === '2')) return 'win';
      if (parsed.selection === '12' && (actual === '1' || actual === '2')) return 'win';
      return 'loss';
    }
    case 'btts': {
      const both = h > 0 && a > 0;
      return (parsed.selection === 'yes') === both ? 'win' : 'loss';
    }
    case 'spread': {
      // spread is the home-team handicap:
      // "-3.5" = home is -3.5 (must win by 4+); "+3.5" = home is +3.5 (can lose by 3 and cover)
      const margin = (h - a) + parsed.spread;
      if (margin > 0) return 'win';
      if (margin < 0) return 'loss';
      return 'push';
    }
    case 'total': {
      const total = h + a;
      const diff  = total - parsed.line;
      if (diff === 0) return 'push';
      return (parsed.direction === 'over' ? diff > 0 : diff < 0) ? 'win' : 'loss';
    }
    case 'correct_score': {
      return (h === parsed.home && a === parsed.away) ? 'win' : 'loss';
    }
    case 'team_total':
    case 'htft':
      // Scores endpoint does not provide halftime or team-specific sub-scores.
      // Void rather than leave pending forever.
      return 'void';
    default:
      return 'void';
  }
}

// ─── Fetch completed scores for a sport key (cached per run) ──────────────────
const _scoresCache = new Map(); // sportKey → { scores: [...], fetchedAt }

async function fetchScores(sportKey) {
  const cached = _scoresCache.get(sportKey);
  if (cached && Date.now() - cached.fetchedAt < 60_000) return cached.scores;

  try {
    const url = `${ODDS_API_BASE}/sports/${sportKey}/scores/`;
    const res  = await axios.get(url, {
      params:  { apiKey: process.env.ODDS_API_KEY, daysFrom: SCORES_LOOKBACK },
      timeout: 8000,
    });
    const data = Array.isArray(res.data) ? res.data : [];
    _scoresCache.set(sportKey, { scores: data, fetchedAt: Date.now() });
    return data;
  } catch (err) {
    const status = err.response?.status;
    if (status === 422 || status === 404) {
      // Unknown sport key — cache empty result so we don't hammer the API
      _scoresCache.set(sportKey, { scores: [], fetchedAt: Date.now() });
    }
    console.warn(`[autoVerify] fetchScores(${sportKey}) failed:`, status || err.message);
    return [];
  }
}

// ─── Build a sport-key → scores map for a batch of pending picks ─────────────
async function buildScoresMap(pendingPicks) {
  const keysNeeded = new Set();

  for (const p of pendingPicks) {
    const sportKey = p.sportKey || SPORT_KEY_DEFAULTS[p.sport];
    if (sportKey) {
      keysNeeded.add(sportKey);
    } else if (p.sport === 'Soccer') {
      for (const k of SOCCER_FALLBACK_KEYS) keysNeeded.add(k);
    }
    // Tennis without sportKey: skip (too many keys to probe)
  }

  const scoresMap = {}; // fixtureId → score record
  for (const key of keysNeeded) {
    const scores = await fetchScores(key);
    for (const s of scores) {
      scoresMap[s.id] = s;
    }
  }
  return scoresMap;
}

// ─── Parse The Odds API score record → { homeScore, awayScore } ───────────────
function extractScores(scoreRecord, homeTeam, awayTeam) {
  if (!scoreRecord?.scores || !Array.isArray(scoreRecord.scores)) return null;
  // Scores array: [{ name: 'Team A', score: '3' }, { name: 'Team B', score: '1' }]
  let homeScore = null, awayScore = null;
  for (const s of scoreRecord.scores) {
    if (!s.name || s.score == null) continue;
    const n = String(s.name).toLowerCase().trim();
    const h = String(homeTeam || '').toLowerCase().trim();
    const a = String(awayTeam || '').toLowerCase().trim();
    if (h && n.includes(h.split(' ').slice(-1)[0])) homeScore = parseInt(s.score);
    else if (a && n.includes(a.split(' ').slice(-1)[0])) awayScore = parseInt(s.score);
    else if (homeScore === null) homeScore = parseInt(s.score);
    else if (awayScore === null) awayScore = parseInt(s.score);
  }
  if (homeScore == null || awayScore == null) return null;
  return { homeScore, awayScore };
}

// ─── Settle a single pick row ─────────────────────────────────────────────────
// Returns { graded: true } or { graded: false, reason }
async function settlePick(db, pick, scoresMap, recalcUserRankings, emitPickGraded) {
  const scoreRecord = scoresMap[pick.fixtureId];

  // ── Auto-void: pick is too old and no event found at all ──────────────────
  const ageDays = (Date.now() - new Date(pick.createdAt).getTime()) / 86_400_000;
  if (!scoreRecord) {
    if (ageDays > MAX_PENDING_DAYS) {
      await applyGrade(db, pick, 'void', 0, 'auto:stale', 'No event data found after ' + MAX_PENDING_DAYS + 'd', recalcUserRankings, emitPickGraded);
      return { graded: true };
    }
    return { graded: false, reason: 'event not found in scores yet' };
  }

  // ── Event not yet completed ───────────────────────────────────────────────
  if (!scoreRecord.completed) {
    return { graded: false, reason: 'event not completed' };
  }

  // ── Extract scores ────────────────────────────────────────────────────────
  const extracted = extractScores(scoreRecord, pick.homeTeam, pick.awayTeam);
  if (!extracted) {
    if (ageDays > MAX_PENDING_DAYS) {
      await applyGrade(db, pick, 'void', 0, 'auto:no-scores', 'Completed but scores unparseable', recalcUserRankings, emitPickGraded);
      return { graded: true };
    }
    return { graded: false, reason: 'scores unparseable' };
  }

  const { homeScore, awayScore } = extracted;
  const parsed = parseMarket(pick.market);
  const result = gradeResult(parsed, homeScore, awayScore);
  const pnl    = calcPnl(result, pick.stake, pick.odds);

  await applyGrade(db, pick, result, pnl, 'auto', null, recalcUserRankings, emitPickGraded);
  return { graded: true };
}

// ─── Write the grade to the DB and fire downstream effects ────────────────────
// adminOverride: true  → WHERE id = ?              (admin can re-grade any result)
// adminOverride: false → WHERE id = ? AND result='pending'  (cron: safe against races)
async function applyGrade(db, pick, result, pnl, gradedBy, gradedNote, recalcUserRankings, emitPickGraded, { adminOverride = false } = {}) {
  // Get prev snapshot for WS diff (before any change)
  let prevSnapshot = null;
  try {
    const [snapRows] = await db.query(
      'SELECT ur.division, ur.currentStreak, ur.streakType, ur.totalPicks, (SELECT COUNT(*)+1 FROM user_rankings u2 WHERE u2.elo > ur.elo) AS rank FROM user_rankings ur WHERE ur.userId = ? LIMIT 1',
      [pick.userId]
    );
    prevSnapshot = snapRows[0] || null;
  } catch (_) {}

  // Settle the pick.
  // Non-admin path: WHERE result='pending' is the duplicate-grade guard.
  // Admin path: no result filter — allows correcting a wrongly graded pick.
  const [updateRes] = await db.query(
    adminOverride
      ? `UPDATE picks SET result=?,pnl=?,settledAt=NOW(),gradedBy=?,gradedNote=? WHERE id=?`
      : `UPDATE picks SET result=?,pnl=?,settledAt=NOW(),gradedBy=?,gradedNote=? WHERE id=? AND result='pending'`,
    [result, pnl, gradedBy, gradedNote || null, pick.id]
  );

  // Guard: if another path (admin or concurrent cron tick) already settled this pick,
  // affectedRows=0. Skip all downstream effects to prevent duplicate notifications.
  if (updateRes.affectedRows === 0) {
    console.log(`[autoVerify] Pick ${pick.id} already graded — skipping downstream effects.`);
    return;
  }

  console.log(`[autoVerify] Pick ${pick.id} (${pick.username} ${pick.market}) → ${result} | PnL: ${pnl} | by: ${gradedBy}`);

  // Recalc rankings (void excluded inside recalcUserRankings via result IN ('win','loss','push'))
  if (result !== 'void') {
    try {
      await recalcUserRankings(db, pick.userId);
    } catch (e) {
      console.error(`[autoVerify] recalcUserRankings failed for userId=${pick.userId}:`, e);
    }
  }

  // Emit WS + notification events
  try {
    const updatedPick = { ...pick, result, pnl };
    await emitPickGraded(db, updatedPick, prevSnapshot);
  } catch (e) {
    console.error(`[autoVerify] emitPickGraded failed for pick ${pick.id}:`, e);
  }
}

// ─── Main grading loop ────────────────────────────────────────────────────────
// Called by cron every 5 minutes.
async function runGrading(db, recalcUserRankings, emitPickGraded) {
  _scoresCache.clear(); // Fresh scores each cron tick

  // Fetch all pending picks (with supporting columns)
  let pending;
  try {
    [pending] = await db.query(`
      SELECT p.id, p.userId, p.sport, p.sportKey, p.fixtureId, p.homeTeam, p.awayTeam,
             p.market, p.odds, p.stake, p.createdAt, u.username
      FROM picks p
      JOIN users u ON u.id = p.userId
      WHERE p.result = 'pending'
      ORDER BY p.createdAt ASC
    `);
  } catch (e) {
    console.error('[autoVerify] Failed to fetch pending picks:', e);
    return;
  }

  if (!pending.length) {
    console.log('[autoVerify] No pending picks to grade.');
    return;
  }

  console.log(`[autoVerify] Grading ${pending.length} pending pick(s)...`);

  const scoresMap = await buildScoresMap(pending);

  let settled = 0, skipped = 0;
  for (const pick of pending) {
    try {
      const res = await settlePick(db, pick, scoresMap, recalcUserRankings, emitPickGraded);
      if (res.graded) settled++;
      else skipped++;
    } catch (e) {
      console.error(`[autoVerify] Error settling pick ${pick.id}:`, e);
      skipped++;
    }
  }

  console.log(`[autoVerify] Done. Settled: ${settled}, Skipped: ${skipped}`);
}

// ─── Manual grade (admin override) ───────────────────────────────────────────
// Can grade ANY pick in any current state. Intended only for admin use.
async function gradePickManually(db, pickId, result, note, adminUsername, recalcUserRankings, emitPickGraded) {
  const valid = ['win', 'loss', 'push', 'void'];
  if (!valid.includes(result)) throw new Error('Invalid result: ' + result);

  const [rows] = await db.query(
    'SELECT * FROM picks WHERE id = ? LIMIT 1',
    [pickId]
  );
  if (!rows.length) throw new Error('Pick not found: ' + pickId);
  const pick = rows[0];

  // Get username if not on pick
  if (!pick.username) {
    const [uRows] = await db.query('SELECT username FROM users WHERE id = ? LIMIT 1', [pick.userId]);
    pick.username = uRows[0]?.username || 'unknown';
  }

  const pnl = calcPnl(result, pick.stake, pick.odds);
  await applyGrade(
    db, pick, result, pnl,
    'admin:' + (adminUsername || 'unknown'),
    note || null,
    recalcUserRankings, emitPickGraded,
    { adminOverride: true }
  );
}

// ─── Admin middleware ─────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const adminIds = (process.env.ADMIN_USER_IDS || '')
    .split(',').map(s => parseInt(s.trim())).filter(Boolean);
  if (!adminIds.includes(req.user.id)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

// ─── Admin endpoints ──────────────────────────────────────────────────────────

// POST /admin/picks/:id/grade
// Body: { result: 'win'|'loss'|'push'|'void', note?: string }
// Auth: admin only (ADMIN_USER_IDS env var)
router.post('/admin/picks/:id/grade', requireAuth, requireAdmin, async (req, res) => {
  const pickId = parseInt(req.params.id, 10);
  if (!pickId || isNaN(pickId)) return res.status(400).json({ error: 'Invalid pick id' });

  const { result, note } = req.body;
  const VALID_RESULTS = ['win', 'loss', 'push', 'void'];
  if (!VALID_RESULTS.includes(result)) {
    return res.status(400).json({ error: 'result must be one of: win, loss, push, void' });
  }

  try {
    const [adminRows] = await db.query(
      'SELECT username FROM users WHERE id = ? LIMIT 1', [req.user.id]
    );
    const adminUsername = adminRows[0]?.username || String(req.user.id);

    await gradePickManually(
      db, pickId, result, note || null, adminUsername,
      recalcUserRankings, emitPickGraded
    );
    res.json({ success: true, pickId, result, gradedBy: 'admin:' + adminUsername });
  } catch (e) {
    if (e.message?.startsWith('Pick not found')) return res.status(404).json({ error: e.message });
    console.error('POST /admin/picks/:id/grade error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /admin/picks/pending
// Returns all pending picks (for admin review queue)
router.get('/admin/picks/pending', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.id, p.userId, u.username, p.sport, p.event, p.market, p.odds, p.stake,
             p.fixtureId, p.homeTeam, p.awayTeam, p.createdAt,
             TIMESTAMPDIFF(HOUR, p.createdAt, NOW()) AS hoursOld
      FROM picks p
      JOIN users u ON u.id = p.userId
      WHERE p.result = 'pending'
      ORDER BY p.createdAt ASC
      LIMIT 200
    `);
    res.json({ picks: rows, count: rows.length });
  } catch (e) {
    console.error('GET /admin/picks/pending error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /admin/picks/settled
// Returns recently settled picks with grading metadata
router.get('/admin/picks/settled', requireAuth, requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const [rows] = await db.query(`
      SELECT p.id, p.userId, u.username, p.sport, p.event, p.market, p.odds, p.stake,
             p.result, p.pnl, p.settledAt, p.gradedBy, p.gradedNote, p.createdAt
      FROM picks p
      JOIN users u ON u.id = p.userId
      WHERE p.result IN ('win','loss','push','void')
      ORDER BY p.settledAt DESC
      LIMIT ?
    `, [limit]);
    res.json({ picks: rows, count: rows.length });
  } catch (e) {
    console.error('GET /admin/picks/settled error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /picks/:id/status
// Public endpoint — returns grading status for a single pick (no PnL/sensitive data for others)
router.get('/picks/:id/status', async (req, res) => {
  const pickId = parseInt(req.params.id, 10);
  if (!pickId || isNaN(pickId)) return res.status(400).json({ error: 'Invalid pick id' });

  try {
    const [rows] = await db.query(`
      SELECT id, result, settledAt, gradedBy
      FROM picks
      WHERE id = ? LIMIT 1
    `, [pickId]);
    if (!rows.length) return res.status(404).json({ error: 'Pick not found' });

    const p = rows[0];
    res.json({
      id:         p.id,
      result:     p.result,
      settled:    p.result !== 'pending',
      settledAt:  p.settledAt || null,
      source:     p.gradedBy
        ? (p.gradedBy.startsWith('admin:') ? 'admin' : 'auto')
        : null,
    });
  } catch (e) {
    console.error('GET /picks/:id/status error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Trigger manual grading run (admin only) ──────────────────────────────────
// POST /admin/grading/run — immediately runs the grading loop once
router.post('/admin/grading/run', requireAuth, requireAdmin, async (req, res) => {
  try {
    runGrading(db, recalcUserRankings, emitPickGraded)
      .catch(e => console.error('[autoVerify] manual run error:', e));
    res.json({ success: true, message: 'Grading run started' });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = {
  runGrading,
  gradePickManually,
  parseMarket,
  gradeResult,
  calcPnl,
};

// ─── Integration in app.js ────────────────────────────────────────────────────
//
// const cron                          = require('node-cron');
// const { recalcUserRankings }        = require('./backend-rankings-engine');
// const { emitPickGraded }            = require('./backend-ws-events');
// const { runGrading }                = require('./autoVerify');
//
// // Bind db + downstream functions (so the cron closure has them)
// const boundRunGrading = () => runGrading(db, recalcUserRankings, emitPickGraded);
//
// // Run cron every 5 minutes
// cron.schedule('*/5 * * * *', () => {
//   boundRunGrading().catch(e => console.error('[autoVerify] Cron error:', e));
// });
//
// // Also run once on startup (picks posted while server was down)
// boundRunGrading().catch(console.error);
//
// // Mount routes (router, db, requireAuth must be in scope)
// require('./autoVerify');
