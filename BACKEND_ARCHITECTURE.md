# BACKEND ARCHITECTURE

autoVerify.js

Purpose:

- grading engine
- cron every 5 min (*/5 * * * *)
- settles picks: win / loss / push / void
- updates: ROI, PnL, CLV, Sharp Score, ELO, Reliability, Division, Streak
- MLB fully supported (baseball_mlb)
- push (draw) detection: spread + total exact-line → push
- void detection: age > 7d + no result, unknown market, HT/FT, team totals
- auto-stale void after MAX_PENDING_DAYS (7)

Sports:
- Baseball → baseball_mlb
- Basketball → basketball_nba
- Football → americanfootball_nfl
- MMA/Boxing → mma_mixed_martial_arts
- Soccer → stored sportKey or fallback to 7 common leagues
- Tennis → requires sportKey on pick (too many keys to probe)

Market grading:
- H2H: Home Win / Draw / Away Win
- Double Chance: 1X / X2 / 12
- BTTS: Yes / No
- Totals: Over/Under with push on exact line
- Spreads: +/- with push on exact cover
- Correct Score: exact match
- HT/FT + team-specific totals → void

Settlement fields (picks table):
- settledAt DATETIME
- gradedBy VARCHAR(30) — 'auto' or 'admin:{username}'
- gradedNote TEXT

Schema migration: autoVerify-schema.sql (run once) — adds settledAt, gradedBy, gradedNote, sportKey, homeTeam, awayTeam, fixtureId, stakeType, confidence, reasoning

Admin endpoints:
- POST /admin/picks/:id/grade — manual override (body: { result, note })
- GET /admin/picks/pending — review queue
- GET /admin/picks/settled — recent settled with metadata
- POST /admin/grading/run — trigger immediate run
- Auth: ADMIN_USER_IDS env var (comma-separated user IDs)

Public endpoint:
- GET /picks/:id/status — returns { id, result, settled, settledAt, source }

applyGrade() contract:
- affectedRows guard: returns early if UPDATE affects 0 rows — prevents duplicate notifications on race
- adminOverride=true bypasses WHERE result='pending' — allows admin to re-grade settled picks
- prevSnapshot includes streakType (feeds streak_milestone comparison in emitPickGraded)

Integration:
- Calls recalcUserRankings(db, userId) after every non-void grade
- Calls emitPickGraded(db, pick, prevSnapshot) for WS + notifications
- Void picks excluded from ranking calculations
- Void still sends pick_result unicast to pick owner

Requires env: ODDS_API_KEY, ADMIN_USER_IDS

---

backend-picks-endpoints.js

Purpose:

- POST /picks — create immutable pick (auth required)
- GET /picks — list picks, optional ?userId= filter (public)
- GET /picks/:id — single pick (public)

POST /picks body:
- userId, sport, event, fixtureId, homeTeam, awayTeam, sportKey
- market, odds (1.01–1001), stake (0–1000), stakeType (units/flat/percent)
- confidence (low/med/high), reasoning (max 500 chars)

GET /picks response fields per pick:
- id, userId, username, sport, event, fixtureId, homeTeam, awayTeam, sportKey
- market, odds, stake, stakeType, confidence, reasoning
- result (pending/win/loss/push/void), pnl, createdAt
- lockMetadata: { odds, stake, stakeType, market, postedAt }
- verificationStatus: { settled, settledAt, source (auto/admin/null), gradedBy, gradedNote }

Immutability: no UPDATE or DELETE path; applyGrade() in autoVerify.js is the only post-creation write

---

backend-fixtures-endpoints.js

Purpose:

- GET /fixtures — return upcoming fixtures from The Odds API enriched with sportKey
- sportKey in each fixture flows → POST /picks → autoVerify grading

Query params:
- sport {string} — "Baseball", "Basketball", "Football", "MMA/Boxing", "Soccer", "Tennis"
- dateOffset {number} — 0=today, 1=tomorrow, 2=day after (default 0)

Response fields per fixture:
- id — Odds API event ID (used as fixtureId in picks)
- sportKey — Odds API sport key (e.g. "soccer_epl", "baseball_mlb")
- home, away, league, date, time, startTime

Sport key routing:
- Baseball/Basketball/Football/MMA: single canonical key per sport
- Soccer: 8 league keys fetched in parallel, merged, sorted by commence_time
- Tennis: returns [] (too many tournament keys; future: accept sportKey param directly)

Cache: 5-minute in-memory TTL per (sportKey, dateOffset) pair
Requires env: ODDS_API_KEY

---

backend-odds-api.js

Purpose:

- The Odds API provider
- cache layer
- fixtures fallback
- provider normalization

---

backend-rankings-engine.js

Purpose:

- leaderboard
- rankings
- divisions
- rank history
- recent picks cache

---

backend-profile-endpoints.js

Purpose:

- profile persistence
- avatar (max 300KB base64)
- banner image (max 500KB base64)
- banner pack + border + theme (validated allowlists)
- bio + social links
- odds_format + timezone + hide_from_leaderboard (preferences)
- rate limited: 10 req/user/60s

Endpoints:
- GET /profile/:username — public, returns full profile including prefs
- POST /profile — auth required, upserts all profile + preference fields

---

backend-ws-events.js

Purpose:

- live websocket events
- online count
- division updates
- streak updates
- pick updates

---

notifications-system.js

Purpose:

- push notifications
- badge notifications
- live notifications