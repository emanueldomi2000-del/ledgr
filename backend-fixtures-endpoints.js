// ─────────────────────────────────────────────────────────────────────────────
// LEDGR — Fixtures Endpoint
// Add these routes to your Railway backend Express app.
//
// Purpose: Return upcoming fixtures from The Odds API, enriched with
// sportKey so the dashboard can include it in the POST /picks body.
// autoVerify.js then uses sportKey to look up scores for grading.
//
// Requires env: ODDS_API_KEY
//
// Replace `router` with your actual Express router instance.
// ─────────────────────────────────────────────────────────────────────────────

const axios = require('axios');

const ODDS_API_BASE = 'https://api.the-odds-api.com/v4';
const ODDS_API_KEY  = process.env.ODDS_API_KEY;

// Sport display name → single Odds API sport key
// Used for sports with one canonical key (no per-league branching)
const SPORT_KEY_SINGLE = {
  'Baseball':   'baseball_mlb',
  'Basketball': 'basketball_nba',
  'Football':   'americanfootball_nfl',
  'MMA/Boxing': 'mma_mixed_martial_arts',
};

// Soccer: multiple league keys, each fetched independently.
// Fixtures are merged and sorted by commence_time.
// Each fixture carries its own sportKey so picks store the correct one.
const SOCCER_SPORT_KEYS = [
  { key: 'soccer_epl',                 league: 'Premier League'   },
  { key: 'soccer_spain_la_liga',       league: 'La Liga'          },
  { key: 'soccer_germany_bundesliga',  league: 'Bundesliga'       },
  { key: 'soccer_italy_serie_a',       league: 'Serie A'          },
  { key: 'soccer_france_ligue_one',    league: 'Ligue 1'          },
  { key: 'soccer_uefa_champs_league',  league: 'Champions League' },
  { key: 'soccer_usa_mls',             league: 'MLS'              },
  { key: 'soccer_brazil_campeonato',   league: 'Brasileirao'      },
];

// Tennis: too many ATP/WTA keys to probe in a single request.
// Client must select a tournament and pass its sportKey explicitly.
// Return an empty list here — handled by a separate tennis lookup flow if needed.
const TENNIS_SPORT_KEYS = [];

// In-memory fixture cache: 5-minute TTL per cache key
const _fixtureCache = new Map();
const FIXTURE_CACHE_TTL = 5 * 60 * 1000;

function _cacheKey(sportKey, dateOffset) {
  return `${sportKey}:${dateOffset}`;
}

function _getCached(key) {
  const entry = _fixtureCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > FIXTURE_CACHE_TTL) { _fixtureCache.delete(key); return null; }
  return entry.data;
}

function _setCache(key, data) {
  _fixtureCache.set(key, { ts: Date.now(), data });
}

// Build commenceTimeFrom / commenceTimeTo for a given dateOffset (0 = today, 1 = tomorrow, etc.)
// Uses UTC day boundaries so Railway server timezone doesn't shift match-day windows.
function _buildTimeRange(dateOffset) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + (parseInt(dateOffset) || 0));
  d.setUTCHours(0, 0, 0, 0);
  const from = d.toISOString();
  d.setUTCHours(23, 59, 59, 999);
  const to = d.toISOString();
  return { from, to };
}

// Fetch events from The Odds API for a single sport key + date offset.
// Returns normalised fixture array, each with sportKey injected.
async function _fetchEvents(sportKey, leagueName, dateOffset) {
  const ck = _cacheKey(sportKey, dateOffset);
  const hit = _getCached(ck);
  if (hit) return hit;

  const { from, to } = _buildTimeRange(dateOffset);
  try {
    const { data } = await axios.get(
      `${ODDS_API_BASE}/sports/${sportKey}/events`,
      {
        params: {
          apiKey:             ODDS_API_KEY,
          dateFormat:         'iso',
          commenceTimeFrom:   from,
          commenceTimeTo:     to,
        },
        timeout: 8000,
      }
    );

    const fixtures = (Array.isArray(data) ? data : []).map(ev => {
      const dt = new Date(ev.commence_time);
      return {
        id:        ev.id,                              // Odds API event ID — used as fixtureId in picks
        sportKey,                                      // which Odds API key this fixture belongs to
        home:      ev.home_team,
        away:      ev.away_team,
        league:    leagueName || sportKey,
        date:      dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        time:      dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
        startTime: ev.commence_time,
      };
    });

    _setCache(ck, fixtures);
    return fixtures;
  } catch (err) {
    // 404 from Odds API = sport not in season; return empty, not an error
    if (err.response?.status === 404) return [];
    console.error(`[fixtures] Failed to fetch ${sportKey}:`, err.message);
    return [];
  }
}

// ─── GET /fixtures ────────────────────────────────────────────────────────────
// Query params:
//   sport       {string}  — display name e.g. "Baseball", "Soccer", "Basketball"
//   dateOffset  {number}  — 0 = today, 1 = tomorrow, 2 = day after (default 0)
//
// Response: Array of fixture objects:
//   { id, sportKey, home, away, league, date, time, startTime }
//
// The `sportKey` field is critical for autoVerify grading — it must be stored
// on the pick when posted (backend-picks-endpoints.js resolves it too, but
// having it in the fixture object is the authoritative source).
router.get('/fixtures', async (req, res) => {
  const { sport, dateOffset = 0 } = req.query;

  if (!sport) return res.status(400).json({ error: 'sport is required' });

  try {
    let fixtures = [];

    if (SPORT_KEY_SINGLE[sport]) {
      // Single-key sport: one API call
      const key = SPORT_KEY_SINGLE[sport];
      fixtures = await _fetchEvents(key, sport, dateOffset);

    } else if (sport === 'Soccer') {
      // Multi-key sport: fetch all leagues in parallel, merge + sort
      const results = await Promise.all(
        SOCCER_SPORT_KEYS.map(({ key, league }) => _fetchEvents(key, league, dateOffset))
      );
      fixtures = results.flat().sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    } else if (sport === 'Tennis') {
      // Tennis fixtures require a specific tournament sportKey.
      // Future: accept sportKey query param directly for tennis tournaments.
      fixtures = [];

    } else {
      return res.status(400).json({ error: `Unknown sport: ${sport}` });
    }

    res.json(fixtures);
  } catch (err) {
    console.error('[GET /fixtures]', err);
    res.status(500).json({ error: 'Failed to fetch fixtures' });
  }
});

module.exports = {};
