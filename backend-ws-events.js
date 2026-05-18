// ─────────────────────────────────────────────────────────────────────────────
// LEDGR — Live Event System
//
// Integration into your existing Railway Express + ws server:
//
//   const { initLiveEvents, emitPickGraded, emitPickTailed, emitPickPosted }
//     = require('./ws-events');
//
//   // After your existing `wss` (WebSocket.Server) is created:
//   initLiveEvents(wss, db);
//
//   // In your pick grading handler, AFTER recalcUserRankings():
//   await emitPickGraded(pick, prevSnapshot);
//
//   // In your tail handler:
//   await emitPickTailed(pick, tailCount);
//
//   // In your pick POST handler (pick created, pending):
//   await emitPickPosted(pick);
//
// Run backend-live-events-schema.sql before deploying.
// ─────────────────────────────────────────────────────────────────────────────

// ── Constants ─────────────────────────────────────────────────────────────────
const BIG_WIN_THRESHOLD  = parseFloat(process.env.BIG_WIN_THRESHOLD  || '5');
const UNDERDOG_MIN_ODDS  = parseFloat(process.env.UNDERDOG_MIN_ODDS  || '3.0');
const RANK_UP_BROADCAST_MAX = parseInt(process.env.RANK_UP_MAX || '20', 10);
const ONLINE_INTERVAL_MS = 60_000;  // broadcast online count every 60s
const RATE_WINDOW_MS     = 5 * 60_000;  // 5 min per-user per-type rate window
const RATE_LIMIT         = 1;           // max 1 broadcast per type per tipster per window

// ── Rarity computation ────────────────────────────────────────────────────────
function computeRarity(type, payload) {
  switch (type) {
    case 'pick_win':
    case 'pick_result':
    case 'followed_posted':
    case 'pick_tailed':
    case 'rank_change':
      return 1;

    case 'big_win':
      if (payload.pnl >= 20) return 4;
      if (payload.pnl >= 10) return 3;
      return 2;

    case 'underdog_hit':
      return payload.odds >= 5.0 ? 4 : 3;

    case 'streak_milestone':
      if (payload.streak >= 10) return 5;
      if (payload.streak >= 7)  return 4;
      if (payload.streak >= 5)  return 3;
      return 2;

    case 'division_up': {
      const map = { SILVER:1, GOLD:2, PLATINUM:3, DIAMOND:4, ELITE:4, LEGENDARY:5 };
      return map[payload.toDivision] || 2;
    }

    case 'rank_up':
      if (payload.newRank === 1) return 5;
      if (payload.newRank <= 3)  return 4;
      if (payload.newRank <= 10) return 3;
      return 2;

    case 'badge_unlock':
      return payload.badgeRarity || 2;

    case 'milestone_pick':
      if (payload.count >= 200) return 4;
      if (payload.count >= 100) return 3;
      return 2;

    default:
      return 1;
  }
}

// ── In-memory rate limiter ────────────────────────────────────────────────────
// Key: `${username}:${type}` → timestamp of last broadcast
const _rateMap = new Map();
function _isRateLimited(username, type) {
  const key = `${username}:${type}`;
  const last = _rateMap.get(key) || 0;
  if (Date.now() - last < RATE_WINDOW_MS) return true;
  _rateMap.set(key, Date.now());
  return false;
}

// ── Connected clients registry ────────────────────────────────────────────────
// Map<WebSocket, { userId, lowPower, lastEventId }>
const _clients = new Map();

function initLiveEvents(wss, db) {
  // Extend existing WS server message handler
  wss.on('connection', (ws) => {
    _clients.set(ws, { userId: null, lowPower: false, lastEventId: 0 });

    ws.on('message', async (raw) => {
      let msg;
      try { msg = JSON.parse(raw); } catch (_) { return; }

      const meta = _clients.get(ws) || {};

      // ── subscribe: register userId for unicast routing ──
      if (msg.type === 'subscribe') {
        meta.userId      = msg.userId   || null;
        meta.lowPower    = !!msg.lowPower;
        meta.lastEventId = msg.lastEventId || 0;
        _clients.set(ws, meta);

        // Send missed broadcast events since lastEventId
        if (msg.lastEventId) {
          try {
            const [rows] = await db.query(
              'SELECT * FROM live_events WHERE id > ? AND targetUserId IS NULL ORDER BY id ASC LIMIT 50',
              [msg.lastEventId]
            );
            rows.forEach(ev => _sendTo(ws, _formatRow(ev)));
          } catch (_) {}
        }
        return;
      }

      // ── ping / heartbeat ──
      if (msg.type === 'ping') {
        _sendTo(ws, { type: 'pong' });
        return;
      }

      // ── catch_up: client reconnected, wants missed events ──
      if (msg.type === 'catch_up') {
        const since = msg.since || meta.lastEventId || 0;
        try {
          const [rows] = await db.query(
            `SELECT * FROM live_events
             WHERE id > ? AND (targetUserId IS NULL OR targetUserId = ?)
             ORDER BY id ASC LIMIT 50`,
            [since, meta.userId || 0]
          );
          rows.forEach(ev => _sendTo(ws, _formatRow(ev)));
        } catch (_) {}
        return;
      }

      // ── low_power state change ──
      if (msg.type === 'low_power') {
        meta.lowPower = !!msg.active;
        _clients.set(ws, meta);
        return;
      }

      // All other messages (chat join, chat messages) pass through unchanged.
      // Your existing chat handler fires from the same wss.on('connection') block.
    });

    ws.on('close', () => _clients.delete(ws));
    ws.on('error', () => _clients.delete(ws));
  });

  // Broadcast online count every 60s
  setInterval(() => {
    const n = _clients.size;
    _broadcast({ type: 'online_count', n });
  }, ONLINE_INTERVAL_MS);
}

// ── Broadcast / unicast helpers ───────────────────────────────────────────────
function _sendTo(ws, msg) {
  try {
    if (ws.readyState === 1 /* OPEN */) ws.send(JSON.stringify(msg));
  } catch (_) {}
}

function _broadcast(msg) {
  _clients.forEach((meta, ws) => _sendTo(ws, msg));
}

function _unicast(userId, msg) {
  _clients.forEach((meta, ws) => {
    if (meta.userId === userId) _sendTo(ws, msg);
  });
}

function _formatRow(row) {
  return {
    eventId:  row.id,
    type:     row.type,
    rarity:   row.rarity,
    username: row.username,
    payload:  typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload,
  };
}

// ── Persist + emit ────────────────────────────────────────────────────────────
async function _emit(db, { type, username, targetUserId, payload }) {
  const rarity = computeRarity(type, payload);

  // Persist
  let eventId;
  try {
    const [result] = await db.query(
      'INSERT INTO live_events (type, rarity, username, targetUserId, payload) VALUES (?,?,?,?,?)',
      [type, rarity, username || null, targetUserId || null, JSON.stringify(payload)]
    );
    eventId = result.insertId;
  } catch (e) {
    console.error('[ws-events] persist error:', e);
    eventId = null;
  }

  const msg = { eventId, type, rarity, username, payload };

  if (targetUserId) {
    // Unicast
    _unicast(targetUserId, msg);
    // Also persist to user_notifications
    try {
      await db.query(
        'INSERT INTO user_notifications (userId, type, rarity, payload) VALUES (?,?,?,?)',
        [targetUserId, type, rarity, JSON.stringify(payload)]
      );
    } catch (_) {}
  } else {
    // Broadcast
    _broadcast(msg);
  }
}

// ── Main trigger: called after every pick is graded ───────────────────────────
// prevSnapshot = { elo, division, rank, streak, streakType, picks }
// from user_rankings BEFORE recalcUserRankings() was called.
async function emitPickGraded(db, pick, prevSnapshot) {
  const { username, result, odds, pnl, event: matchEvent, market, sport, id: pickId } = pick;
  if (!username || !result || result === 'pending') return;

  // 1. Personal pick_result → always send to pick owner
  if (pick.userId) {
    await _emit(db, {
      type: 'pick_result',
      username,
      targetUserId: pick.userId,
      payload: { pickId, result, pnl: parseFloat(pnl || 0), event: matchEvent, market, odds: parseFloat(odds || 0) },
    });
  }

  if (result !== 'win') return; // Only wins drive broadcast events

  const pnlNum  = parseFloat(pnl  || 0);
  const oddsNum = parseFloat(odds || 0);

  // 2. pick_win (rarity 1) — broadcast all wins for ticker + leaderboard micro-updates
  //    Rate-limited: 1 per user per 5 min (prevents burst on bulk grading)
  if (!_isRateLimited(username, 'pick_win')) {
    await _emit(db, {
      type: 'pick_win',
      username,
      payload: { pickId, event: matchEvent, market, odds: oddsNum, pnl: pnlNum, sport },
    });
  }

  // 3. big_win (rarity 2-4)
  if (pnlNum >= BIG_WIN_THRESHOLD && !_isRateLimited(username, 'big_win')) {
    await _emit(db, {
      type: 'big_win',
      username,
      payload: { pickId, event: matchEvent, market, odds: oddsNum, pnl: pnlNum, sport },
    });
  }

  // 4. underdog_hit (rarity 3-4)
  if (oddsNum >= UNDERDOG_MIN_ODDS && !_isRateLimited(username, 'underdog_hit')) {
    await _emit(db, {
      type: 'underdog_hit',
      username,
      payload: { pickId, event: matchEvent, market, odds: oddsNum, pnl: pnlNum, sport },
    });
  }

  if (!prevSnapshot) return;

  // 5. streak_milestone — only at thresholds 3, 5, 7, 10
  const STREAK_THRESHOLDS = new Set([3, 5, 7, 10]);
  try {
    const [rows] = await db.query(
      'SELECT currentStreak, streakType, division FROM user_rankings WHERE username = ? LIMIT 1',
      [username]
    );
    if (rows.length) {
      const { currentStreak, streakType } = rows[0];
      const prevStreak = prevSnapshot?.streakType === 'win' ? (prevSnapshot.currentStreak || 0) : 0;
      if (streakType === 'win' && STREAK_THRESHOLDS.has(currentStreak) && currentStreak > prevStreak) {
        await _emit(db, {
          type: 'streak_milestone',
          username,
          payload: { streak: currentStreak, division: prevSnapshot.division },
        });
        // Unicast to each follower so they see it in their notification centre
        if (pick.userId) {
          try {
            const [streakFollowers] = await db.query(
              'SELECT followerId FROM follows WHERE followingId = ?',
              [pick.userId]
            );
            for (const f of streakFollowers) {
              await _emit(db, {
                type: 'streak_milestone',
                username,
                targetUserId: f.followerId,
                payload: { streak: currentStreak, division: rows[0].division || prevSnapshot.division, username },
              });
            }
          } catch (_) {}
        }
      }

      // 6. division_up — never emit division_down
      const divNow = rows[0]?.division;
      if (divNow && prevSnapshot.division && divNow !== prevSnapshot.division) {
        const DIV_ORDER = ['BRONZE','SILVER','GOLD','PLATINUM','DIAMOND','ELITE','LEGENDARY'];
        const prevIdx = DIV_ORDER.indexOf(prevSnapshot.division);
        const nowIdx  = DIV_ORDER.indexOf(divNow);
        if (nowIdx > prevIdx) {
          await _emit(db, {
            type: 'division_up',
            username,
            payload: { fromDivision: prevSnapshot.division, toDivision: divNow },
          });
          // Persist personal notification for the promoted user
          if (pick.userId) {
            await _emit(db, {
              type: 'division_up',
              username,
              targetUserId: pick.userId,
              payload: { fromDivision: prevSnapshot.division, toDivision: divNow },
            });
          }
        }
      }

      // 7. rank_up — only top RANK_UP_BROADCAST_MAX
      const rankNow = rows[0]?.rank;  // if you add rank column to user_rankings
      if (rankNow && prevSnapshot.rank &&
          rankNow < prevSnapshot.rank &&
          rankNow <= RANK_UP_BROADCAST_MAX &&
          !_isRateLimited(username, 'rank_up')) {
        await _emit(db, {
          type: 'rank_up',
          username,
          payload: { newRank: rankNow, oldRank: prevSnapshot.rank },
        });
        // Personal rank_change always
        if (pick.userId) {
          await _emit(db, {
            type: 'rank_change',
            username,
            targetUserId: pick.userId,
            payload: { newRank: rankNow, oldRank: prevSnapshot.rank, delta: prevSnapshot.rank - rankNow },
          });
        }
      }
    }
  } catch (e) {
    console.error('[ws-events] post-grade event error:', e);
  }

  // 8. milestone_pick — check pick count milestones
  const MILESTONES = [25, 50, 100, 200];
  const prevPicks = prevSnapshot?.totalPicks || 0;
  try {
    const [rows] = await db.query(
      'SELECT totalPicks FROM user_rankings WHERE username = ? LIMIT 1',
      [username]
    );
    if (rows.length) {
      const total = rows[0].totalPicks;
      for (const m of MILESTONES) {
        if (total >= m && prevPicks < m) {
          await _emit(db, {
            type: 'milestone_pick',
            username,
            payload: { count: m },
          });
          // Personal unicast to the tipster
          if (pick.userId) {
            await _emit(db, {
              type: 'milestone_pick',
              username,
              targetUserId: pick.userId,
              payload: { count: m },
            });
            // Unicast to each follower
            try {
              const [mpFollowers] = await db.query(
                'SELECT followerId FROM follows WHERE followingId = ?',
                [pick.userId]
              );
              for (const f of mpFollowers) {
                await _emit(db, {
                  type: 'milestone_pick',
                  username,
                  targetUserId: f.followerId,
                  payload: { count: m, username },
                });
              }
            } catch (_) {}
          }
          break; // only one milestone per grade
        }
      }
    }
  } catch (_) {}
}

// ── Trigger: pick tailed ──────────────────────────────────────────────────────
async function emitPickTailed(db, pick, tailCount) {
  if (!pick || !pick.userId) return;
  await _emit(db, {
    type: 'pick_tailed',
    username: pick.username,
    targetUserId: pick.userId,
    payload: { pickId: pick.id, count: tailCount, event: pick.event },
  });
}

// ── Trigger: pick posted (send to followers) ──────────────────────────────────
async function emitPickPosted(db, pick) {
  if (!pick || !pick.userId) return;
  try {
    // Get all followers of this tipster
    const [followers] = await db.query(
      'SELECT followerId FROM follows WHERE followingId = ?',
      [pick.userId]
    );
    for (const row of followers) {
      await _emit(db, {
        type: 'followed_posted',
        username: pick.username,
        targetUserId: row.followerId,
        payload: {
          pickId:   pick.id,
          event:    pick.event,
          market:   pick.market,
          odds:     parseFloat(pick.odds || 0),
          sport:    pick.sport,
          username: pick.username,  // included so user_notifications can display tipster name
        },
      });
    }
  } catch (e) {
    console.error('[ws-events] emitPickPosted error:', e);
  }
}

// ── REST endpoints ────────────────────────────────────────────────────────────

// GET /live-events?limit=50&since=0
// Cold load for feed page and catch-up on reconnect.
router.get('/live-events', async (req, res) => {
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 50);
  const since = parseInt(req.query.since, 10) || 0;
  try {
    const [rows] = await db.query(
      `SELECT id AS eventId, type, rarity, username, payload, createdAt
       FROM live_events
       WHERE targetUserId IS NULL AND id > ?
       ORDER BY id DESC LIMIT ?`,
      [since, limit]
    );
    res.json(rows.map(r => ({
      ...r,
      payload: typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload,
    })));
  } catch (e) {
    console.error('GET /live-events error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /notifications?userId=&limit=30
router.get('/notifications', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const limit  = Math.min(50, parseInt(req.query.limit, 10) || 30);
  try {
    const [rows] = await db.query(
      `SELECT id, type, rarity, payload, readAt, createdAt
       FROM user_notifications
       WHERE userId = ?
       ORDER BY createdAt DESC LIMIT ?`,
      [userId, limit]
    );
    res.json(rows.map(r => ({
      ...r,
      payload: typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload,
    })));
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /notifications/read/:id
router.patch('/notifications/read/:id', requireAuth, async (req, res) => {
  const userId = req.user.id;
  const id     = parseInt(req.params.id, 10);
  try {
    await db.query(
      'UPDATE user_notifications SET readAt = NOW() WHERE id = ? AND userId = ?',
      [id, userId]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /notifications/read-all
router.patch('/notifications/read-all', requireAuth, async (req, res) => {
  const userId = req.user.id;
  try {
    await db.query(
      'UPDATE user_notifications SET readAt = NOW() WHERE userId = ? AND readAt IS NULL',
      [userId]
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── Badge unlock ──────────────────────────────────────────────────────────────
// Called from POST /notifications/badge-unlock (frontend fires this when BadgeSystem
// detects a newly unlocked badge).  Idempotent — silently skips if the badge was
// already recorded for this user.
async function emitBadgeUnlock(db, userId, username, badgeId, badgeName, badgeRarity) {
  try {
    const [existing] = await db.query(
      `SELECT id FROM user_notifications
       WHERE userId = ? AND type = 'badge_unlock'
       AND JSON_UNQUOTE(JSON_EXTRACT(payload, '$.badgeId')) = ? LIMIT 1`,
      [userId, badgeId]
    );
    if (existing.length > 0) return;
  } catch (_) {}
  await _emit(db, {
    type: 'badge_unlock',
    username,
    targetUserId: userId,
    payload: { badgeId, badgeName, badgeRarity },
  });
}

router.post('/notifications/badge-unlock', requireAuth, async (req, res) => {
  const userId   = req.user.id;
  const username = req.user.username;
  const { badgeId, badgeName, badgeRarity } = req.body;
  if (!badgeId || !badgeName) return res.status(400).json({ error: 'badgeId and badgeName required' });
  if (typeof badgeRarity !== 'number' || badgeRarity < 1 || badgeRarity > 5)
    return res.status(400).json({ error: 'badgeRarity must be 1–5' });
  try {
    await emitBadgeUnlock(db, userId, username, badgeId, badgeName, badgeRarity);
    res.json({ success: true });
  } catch (e) {
    console.error('POST /notifications/badge-unlock error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = { initLiveEvents, emitPickGraded, emitPickTailed, emitPickPosted, emitBadgeUnlock };

// ── Usage example in app.js ───────────────────────────────────────────────────
//
// const WebSocket = require('ws');
// const { initLiveEvents, emitPickGraded, emitPickTailed, emitPickPosted }
//   = require('./ws-events');
//
// // Create your ws server (already done for chat):
// const wss = new WebSocket.Server({ server: httpServer });
// initLiveEvents(wss, db);
//
// // In your pick grading function:
// async function gradePick(pickId, result, pnl) {
//   // Snapshot BEFORE update
//   const [[prev]] = await db.query(
//     'SELECT elo, division, totalPicks AS picks, currentStreak AS streak, streakType FROM user_rankings WHERE userId = ?',
//     [pick.userId]
//   );
//   // Add rank snapshot (optional, if you track rank column):
//   const [[rankRow]] = await db.query(
//     'SELECT COUNT(*)+1 AS rank FROM user_rankings WHERE elo > (SELECT elo FROM user_rankings WHERE userId = ?)',
//     [pick.userId]
//   );
//   const prevSnapshot = { ...prev, rank: rankRow?.rank };
//
//   // Grade the pick (update picks table, pnl, result)
//   await db.query('UPDATE picks SET result=?, pnl=? WHERE id=?', [result, pnl, pickId]);
//
//   // Recalculate rankings
//   await recalcUserRankings(db, pick.userId);
//
//   // Emit live events
//   await emitPickGraded(db, { ...pick, result, pnl }, prevSnapshot);
// }
