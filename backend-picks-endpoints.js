// ─────────────────────────────────────────────────────────────────────────────
// LEDGR — Picks Endpoints
// Add these routes to your Railway backend Express app.
//
// Prerequisites: autoVerify-schema.sql must be run first.
//
// Integration points:
//   1. autoVerify.js calls applyGrade() to settle picks (do not grade here)
//   2. After grading: recalcUserRankings(db, userId) is called by autoVerify.js
//   3. Websocket events: emitPickGraded() is called by autoVerify.js
//
// Replace `db`, `router`, `requireAuth` with your actual instances.
//
// IMMUTABILITY RULE: Picks CANNOT be edited or deleted once posted.
// The only field that changes post-creation is result/pnl/settlement via
// autoVerify.js applyGrade() — which itself uses WHERE result='pending' guard.
// ─────────────────────────────────────────────────────────────────────────────

const VALID_STAKE_TYPES = ['units', 'flat', 'percent'];
const VALID_CONFIDENCE  = ['low', 'med', 'high'];
const MIN_ODDS          = 1.01;
const MAX_ODDS          = 1001;
const MAX_STAKE         = 1000;

// Sport display name → Odds API sport key
// Mirrors SPORT_KEY_DEFAULTS in autoVerify.js — keep in sync
const SPORT_KEY_DEFAULTS = {
  'Baseball':   'baseball_mlb',
  'Basketball': 'basketball_nba',
  'Football':   'americanfootball_nfl',
  'MMA/Boxing': 'mma_mixed_martial_arts',
  // Soccer / Tennis: sportKey must come from the client (fixture object carries it)
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _resolveVerificationStatus(pick) {
  const settled = !!pick.settledAt;
  const source  = !pick.gradedBy
    ? null
    : String(pick.gradedBy).startsWith('admin:') ? 'admin' : 'auto';
  return {
    settled,
    settledAt:  pick.settledAt  || null,
    source,
    gradedBy:   pick.gradedBy   || null,
    gradedNote: pick.gradedNote || null,
  };
}

// Shape every pick row the same way for all public responses.
// lockMetadata captures the state at post time for audit purposes.
function _formatPick(pick) {
  return {
    id:          pick.id,
    userId:      pick.userId,
    username:    pick.username || null,
    sport:       pick.sport,
    event:       pick.event,
    fixtureId:   pick.fixtureId   || null,
    homeTeam:    pick.homeTeam    || null,
    awayTeam:    pick.awayTeam    || null,
    sportKey:    pick.sportKey    || null,
    market:      pick.market,
    odds:        pick.odds,
    stake:       pick.stake,
    stakeType:   pick.stakeType   || 'units',
    confidence:  pick.confidence  || null,
    reasoning:   pick.reasoning   || null,
    result:      pick.result      || 'pending',
    pnl:         pick.pnl         ?? 0,
    createdAt:   pick.createdAt,
    settledAt:   pick.settledAt   || null,
    gradedBy:    pick.gradedBy    || null,
    lockMetadata: {
      odds:      pick.odds,
      stake:     pick.stake,
      stakeType: pick.stakeType || 'units',
      market:    pick.market,
      postedAt:  pick.createdAt,
    },
    verificationStatus: _resolveVerificationStatus(pick),
  };
}

// ─── POST /picks ──────────────────────────────────────────────────────────────
// Creates an immutable pick. Called by dashboard POST flow.
// Body: { userId, sport, event, fixtureId, homeTeam, awayTeam, sportKey,
//         market, odds, stake, stakeType, confidence, reasoning }
router.post('/picks', requireAuth, async (req, res) => {
  try {
    const u = req.user;
    let {
      userId,
      sport, event,
      fixtureId  = null,
      homeTeam   = null,
      awayTeam   = null,
      sportKey   = null,
      market,
      odds, stake,
      stakeType  = 'units',
      confidence = null,
      reasoning  = null,
    } = req.body;

    // Auth: userId in body must match authenticated user
    if (String(userId) !== String(u.id)) {
      return res.status(403).json({ error: 'userId mismatch' });
    }

    // Required fields
    if (!sport || !event || !market) {
      return res.status(400).json({ error: 'sport, event and market are required' });
    }

    // Numeric validation
    odds  = parseFloat(odds);
    stake = parseFloat(stake);
    if (isNaN(odds) || odds < MIN_ODDS || odds > MAX_ODDS) {
      return res.status(400).json({ error: `odds must be between ${MIN_ODDS} and ${MAX_ODDS}` });
    }
    if (isNaN(stake) || stake <= 0 || stake > MAX_STAKE) {
      return res.status(400).json({ error: `stake must be between 0.01 and ${MAX_STAKE}` });
    }

    // Sanitize enums
    if (!VALID_STAKE_TYPES.includes(stakeType)) stakeType = 'units';
    if (confidence && !VALID_CONFIDENCE.includes(confidence)) confidence = null;

    // Truncate free-text fields
    if (reasoning) reasoning = String(reasoning).slice(0, 500);
    if (market)    market    = String(market).slice(0, 200);
    if (event)     event     = String(event).slice(0, 200);

    // Resolve sportKey: client should pass it (fixture object carries it).
    // Fall back to SPORT_KEY_DEFAULTS for sports with a single canonical key.
    if (!sportKey && SPORT_KEY_DEFAULTS[sport]) {
      sportKey = SPORT_KEY_DEFAULTS[sport];
    }

    // Duplicate submission guard: reject if same (userId, fixtureId, market) or
    // (userId, event, market) was posted within the last 60 seconds.
    // Covers double-clicks and network retries without blocking legitimate re-picks
    // on the same match with a different market.
    {
      const dedupSql = fixtureId
        ? `SELECT id FROM picks WHERE userId=? AND fixtureId=? AND market=?
             AND createdAt > NOW() - INTERVAL 60 SECOND LIMIT 1`
        : `SELECT id FROM picks WHERE userId=? AND fixtureId IS NULL AND event=? AND market=?
             AND createdAt > NOW() - INTERVAL 60 SECOND LIMIT 1`;
      const dedupParams = fixtureId
        ? [u.id, fixtureId, market]
        : [u.id, event, market];
      const [dup] = await db.query(dedupSql, dedupParams);
      if (dup.length > 0) {
        return res.status(409).json({ error: 'Duplicate pick — same match and market posted within 60 seconds', existingId: dup[0].id });
      }
    }

    // Insert — picks are immutable once created; no update path exists
    const [result] = await db.query(
      `INSERT INTO picks
         (userId, sport, event, fixtureId, homeTeam, awayTeam, sportKey,
          market, odds, stake, stakeType, confidence, reasoning,
          result, pnl, createdAt)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'pending',0,NOW())`,
      [
        u.id,
        sport, event,
        fixtureId || null,
        homeTeam  || null,
        awayTeam  || null,
        sportKey  || null,
        market, odds, stake, stakeType,
        confidence || null,
        reasoning  || null,
      ]
    );

    const pickId = result.insertId;

    // Return full formatted pick for immediate UI display
    const [[pick]] = await db.query(
      `SELECT p.*, u.username
         FROM picks p
         JOIN users u ON u.id = p.userId
        WHERE p.id = ?`,
      [pickId]
    );

    res.json(_formatPick(pick));
  } catch (err) {
    console.error('[POST /picks]', err);
    res.status(500).json({ error: 'Failed to create pick' });
  }
});

// ─── GET /picks ───────────────────────────────────────────────────────────────
// Returns picks list. Optional ?userId= to filter by user.
// Public — no auth required.
router.get('/picks', async (req, res) => {
  try {
    const { userId, limit, offset = 0 } = req.query;
    // Per-user fetches (dashboard) may request up to 2000 picks to avoid truncation.
    // Global feed requests (no userId) are capped at 200 for performance.
    const defaultLimit = userId ? 2000 : 200;
    const maxLimit     = userId ? 2000 : 200;
    const safeLimit  = Math.min(Math.max(parseInt(limit) || defaultLimit, 1), maxLimit);
    const safeOffset = Math.max(parseInt(offset) || 0, 0);

    const params = [];
    let where = '';
    if (userId) {
      where = 'WHERE p.userId = ?';
      params.push(parseInt(userId));
    }

    const [rows] = await db.query(
      `SELECT p.*, u.username
         FROM picks p
         JOIN users u ON u.id = p.userId
        ${where}
        ORDER BY p.createdAt DESC
        LIMIT ? OFFSET ?`,
      [...params, safeLimit, safeOffset]
    );

    res.json(rows.map(_formatPick));
  } catch (err) {
    console.error('[GET /picks]', err);
    res.status(500).json({ error: 'Failed to fetch picks' });
  }
});

// ─── GET /picks/:id ───────────────────────────────────────────────────────────
// Single pick — public.
router.get('/picks/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid pick id' });

    const [[pick]] = await db.query(
      `SELECT p.*, u.username
         FROM picks p
         JOIN users u ON u.id = p.userId
        WHERE p.id = ?`,
      [id]
    );
    if (!pick) return res.status(404).json({ error: 'Pick not found' });

    res.json(_formatPick(pick));
  } catch (err) {
    console.error('[GET /picks/:id]', err);
    res.status(500).json({ error: 'Failed to fetch pick' });
  }
});

module.exports = {};
