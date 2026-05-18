# LEDGR_BRAIN.md
> Permanent central memory of the LEDGR project.
> Every AI agent or developer who touches this codebase must read this file first.
> Last updated: 2026-05-17

---

## 1. PRODUCT IDENTITY & MISSION

**LEDGR is a verified sports tipster platform.**

The core promise: every pick is posted, graded, and immutable. No editing. No deleting. No cherry-picking. Tipsters build a cryptographically honest track record. Followers can trust the numbers absolutely.

### What LEDGR Is
- A **competitive ecosystem** — tipsters rank against each other
- A **reputation network** — ELO + division ladder establish status
- A **prestige system** — badges, archetypes, divisions, Hall of Fame
- A **betting identity platform** — each tipster has a verifiable public persona

### What LEDGR Is Not
- A sportsbook
- A casino
- A gambling site

### Core Invariant — Never Compromise
> **Picks are immutable once posted. No edits. No deletes. Ever.**
> This is the entire value proposition. The moment edits are possible, the record is untrustworthy.

### Revenue Model
- €10/month tipster subscriptions via Stripe
- Tipsters earn income from paying followers

### Network Effect
- Better tipsters → more followers → more subscription revenue
- More tipsters posting → richer leaderboard → more followers onboard
- Verified track record history (6+ months) becomes an irreplaceable moat

---

## 2. COMPLETE FOLDER STRUCTURE

```
ledgr/                              ← Vercel static deploy root
│
├── index.html                      ← Landing page (/)
├── 404.html                        ← Custom 404
├── brand.css                       ← Global design tokens + sticky nav CSS
├── vercel.json                     ← URL rewrites (all routes → index.html in subdirs)
├── package.json                    ← Root: only axios dependency (backend utility)
│
├── ── SHARED JS (IIFEs, loaded via <script> tags) ──
├── ledgr-ws.js                     ← WebSocket client (window.LedgrWS)
├── live.js                         ← Live ticker + sidebar cards (depends on ledgr-ws.js)
├── brand-nav.js                    ← Auth-aware sticky nav initialisation
├── archetypes.js                   ← Sharp Score gauge SVG + archetype labels
├── divisions.js                    ← Division visual system (auras, glows, particles)
├── badges-system.js                ← Badge unlock v2 (window.BadgeSystem)
├── animations.js                   ← Rank-up / badge / streak / season-end overlays
├── flow.js                         ← Flow state detection (window.Flow)
├── follows.js                      ← Follow/unfollow API wrapper
├── push.js                         ← Web Push subscription (window.Push)
├── notifications-sw.js             ← Service worker (push event handler)
├── share.js                        ← Canvas pick card for social sharing
├── tooltips.js                     ← Rich metric tooltip system
├── mobile.js                       ← Mobile responsive polish layer
├── verify.js                       ← Email OTP verification UI
├── football.js                     ← DEAD CODE — alert("WORKING") — delete this
│
├── ── BACKEND REFERENCE FILES (integrate into Railway server) ──
├── backend-rankings-engine.js      ← Rankings engine + ELO + division formulas
├── backend-ws-events.js            ← WebSocket event emission logic
├── backend-profile-endpoints.js    ← Profile persistence endpoints
├── backend-rankings-schema.sql     ← user_rankings, ranking_history, recent_picks_cache
├── backend-live-events-schema.sql  ← live_events, user_notifications
│
├── ── DOCUMENTATION ──
├── AGENTS.md                       ← Agent rules
├── LEDGR_MASTER_STATE.md           ← High-level state tracker
├── BACKEND_ARCHITECTURE.md         ← Backend module index
├── PRODUCT_BLUEPRINT.md            ← Full product audit (2026-05-14)
├── CLAUDE.md                       ← Claude Code context
├── LEDGR_BRAIN.md                  ← This file
│
├── ── PAGES ──
├── home/index.html                 ← /home
├── dashboard/index.html            ← /dashboard
├── feed/index.html                 ← /feed
├── analytics/index.html            ← /analytics
├── leaderboard/index.html          ← /leaderboard
├── tipster/index.html              ← /tipster?u=USERNAME
├── progress/index.html             ← /progress
├── community/index.html            ← /community
├── notifications/index.html        ← /notifications
├── settings/index.html             ← /settings
├── simulator/index.html            ← /simulator
├── compare/index.html              ← /compare
├── badges/index.html               ← /badges
├── news/index.html                 ← /news
├── hall-of-fame/index.html         ← /hall-of-fame
├── archetypes/index.html           ← /archetypes (undocumented in CLAUDE.md)
├── login/index.html                ← /login
├── register/ (implied)             ← /register
├── become-a-tipster/index.html     ← /become-a-tipster
├── privacy/ (implied)              ← /privacy
├── terms/ (implied)                ← /terms
├── subscribe/success/index.html    ← /subscribe/success
├── subscribe/cancel/index.html     ← /subscribe/cancel
├── parlay/ (implicit redirect)     ← /parlay → /dashboard
│
├── assets/
│   └── logo/
│       ├── ledgr-icon.png
│       ├── ledgr-logo.png
│       ├── ledgr-logo.svg
│       └── brand-nav.js            ← Duplicate? Legacy nav script in assets
│
├── login/
│   ├── index.html
│   ├── .env                        ← Environment file in frontend dir — RISK
│   └── api-temp/football.js        ← Dead code in login subfolder
│
└── node_modules/                   ← axios + deps (backend utility only)
```

---

## 3. COMPLETE PAGE INVENTORY

### Legend
- **FULL** — Real backend integration
- **PARTIAL** — Backend for some data; other data computed client-side
- **FRONTEND-ONLY** — All data from localStorage or client-side simulation
- **STATIC** — No dynamic data (marketing copy / legal)
- **REDIRECT** — Redirects elsewhere

### Auth Pages
| Path | Status | Detail |
|------|--------|--------|
| `/login/` | FULL | POST /auth/login → writes ledgr_user + ledgr_token to localStorage |
| `/register/` | FULL | POST /auth/register + email OTP flow via verify.js |

### Core App Pages
| Path | Status | Detail |
|------|--------|--------|
| `/home/` | PARTIAL | Fetches /picks (real). Stats, ELO, division, Sharp Score computed client-side. Uses live.js for ticker + sidebar. Push notification banner injected by push.js after 1.5s delay. |
| `/dashboard/` | FULL | Pick submission form: event/market/odds/stake → POST to backend. Pick immutability enforced server-side. |
| `/feed/` | FULL | Real-time activity stream. Reactions → POST /picks/:id/react. Tails → POST /picks/:id/tail. 30s auto-refresh. |
| `/analytics/` | PARTIAL | Fetches /picks (real). All 10+ charts (ROI curve, CLV, streaks, 26-week heatmap, variance) computed entirely client-side. |
| `/leaderboard/` | PARTIAL | Fetches /picks (real). All-time rankings computed client-side. Seasonal tabs use GET /seasons/:id/leaderboard (real). live.js injects ticker. |
| `/tipster/` | PARTIAL | Profile reconstructed from /picks. Stripe checkout via POST /create-checkout. Follow/unfollow real. Subscriber count real. Bio/avatar from localStorage (not backend). |
| `/progress/` | PARTIAL | Divisions computed client-side from /picks. Season data from GET /seasons/active (real). |
| `/community/` | FULL | Real-time WebSocket chat. REST: GET /chat/rooms, GET /chat/rooms/:id/messages, POST send. Division badges shown on users. |
| `/notifications/` | FRONTEND-ONLY | Reads/writes only localStorage key `ledgr_notifications`. No backend endpoint. Notification centre is disconnected from push.js delivery. |
| `/settings/` | PARTIAL | Bio PATCH /users/:id (real). Subscriptions GET/DELETE /subscriptions/:id (real). Avatar/banner/border/archetype/theme are localStorage-only as of last audit — profile endpoint exists in backend-profile-endpoints.js but may not be wired. |

### Tools Pages
| Path | Status | Detail |
|------|--------|--------|
| `/simulator/` | PARTIAL | Fetches real /picks for tipster history. All bankroll projections (flat/Kelly/compound) client-side. |
| `/compare/` | PARTIAL | Fetches real /picks for both tipsters. All metrics (ROI delta, win rate, sharp score, CLV) client-side. |
| `/badges/` | PARTIAL | Fetches /picks + /followers + /seasons. Badge unlock logic client-side. Badge state in localStorage key `ledgr_earned_badges_v2`. |
| `/news/` | PARTIAL | GET /news?sport= from backend. Caches responses in localStorage. |
| `/hall-of-fame/` | PARTIAL | Fetches /picks + /seasons. All-time stats and season champion logic client-side. |
| `/archetypes/` | UNKNOWN | In vercel.json but not in CLAUDE.md. Must inspect archetypes/index.html. |

### Marketing / Public Pages
| Path | Status | Detail |
|------|--------|--------|
| `/` | STATIC | Landing page. Reads /picks only for live ticker text. |
| `/become-a-tipster/` | STATIC | Pure marketing copy. No form, no API calls. |
| `/privacy/` | STATIC | Legal copy. |
| `/terms/` | STATIC | Legal copy. |
| `404.html` | STATIC | Custom 404. |

### Payments & Redirects
| Path | Status | Detail |
|------|--------|--------|
| `/subscribe/success/` | FULL | Post-Stripe success. Reads session_id param, updates localStorage subscription state. |
| `/subscribe/cancel/` | FULL | Post-Stripe cancel. No payment taken, shows message. |
| `/parlay/` | REDIRECT | vercel.json rewrites /parlay → /dashboard/index.html (meta refresh + JS replace). |

---

## 4. NAVIGATION MAP

```
/ (index.html)
├─ /login
├─ /register → [email OTP via verify.js] → /home
│
├─ /home             ← authenticated home base
│   ├─ live.js (ticker + sidebar)
│   ├─ push.js (notification banner)
│   └─ links to all app pages
│
├─ /dashboard        ← post a pick
├─ /feed             ← live activity stream
├─ /leaderboard      ← rankings
│   └─ live.js (ticker injected above .main)
├─ /tipster?u=       ← public tipster profile
│   └─ /subscribe/success or /cancel
├─ /progress         ← division ladder
├─ /analytics        ← deep stats
├─ /community        ← WebSocket chat
├─ /notifications    ← alert centre (currently localStorage-only)
├─ /settings         ← profile customisation
│
├─ /simulator        ← bankroll model
├─ /compare          ← head-to-head
├─ /badges           ← achievement vault
├─ /news             ← sports intel
├─ /hall-of-fame     ← all-time records
│
└─ /become-a-tipster ← marketing onboarding (static, no form)
```

**Brand Nav hamburger links (authenticated):**
Post a Pick, Simulator, Compare Tipsters, Badges, Progress, Hall of Fame, News, Settings, Notifications

**Brand Nav hamburger links (guest):**
Leaderboard, Become a Tipster

---

## 5. FRONTEND ARCHITECTURE

### Core Principles
- Every page is a **standalone HTML file** with no shared state between pages except localStorage
- Shared behaviour injected via `<script src="/file.js">` (IIFEs — not ES modules)
- CSS: either inline `<style>` blocks in HTML or injected at runtime by shared JS IIFEs
- Auth is client-side only: `ledgr_user` JSON + `ledgr_token` string in localStorage
- No token refresh, no route guards, no auth middleware — backend validates server-side
- No framework, no bundler, no TypeScript

### Script Load Order (standard page)
1. `brand.css` — global design tokens (always first)
2. `brand-nav.js` — auth-aware nav initialisation
3. `ledgr-ws.js` — WebSocket client (if page uses live events)
4. `live.js` — live ticker / sidebar (depends on ledgr-ws.js; load after it)
5. Feature-specific IIFEs (archetypes.js, divisions.js, flow.js, etc.)
6. Page-specific inline `<script>` block

### Auth & Session Pattern
```javascript
// Read user
const raw = localStorage.getItem('ledgr_user') || localStorage.getItem('user');
const user = raw ? JSON.parse(raw) : null;
const token = localStorage.getItem('ledgr_token') || localStorage.getItem('token');

// Logout (brand-nav.js _brandLogout)
['ledgr_token','ledgr_user','token','user'].forEach(k => localStorage.removeItem(k));
window.location.replace('/');
```

### LocalStorage Keys (all known)
| Key | Owner | Purpose |
|-----|-------|---------|
| `ledgr_user` | all pages | User JSON (id, username, email, etc.) — canonical |
| `ledgr_token` | all pages | Auth token — canonical |
| `user` | legacy | Duplicate of ledgr_user — some older code reads this |
| `token` | legacy | Duplicate of ledgr_token |
| `ledgr_notifications` | /notifications | Notification centre items (no backend persistence) |
| `ledgr_earned_badges_v2` | badges-system.js | Badge unlock state (v2 system, used on /badges/) |
| `ledgr_earned_badges` | animations.js | Older badge unlock state (used by animations.js checkBadgeUnlock) |
| `ledgr_division` | animations.js | Stored division name for rank-up detection |
| `ledgr_last_streak` | animations.js | Stored streak count for streak animation trigger |
| `ledgr_push_subscribed` | push.js | Flag: push subscription active |
| `ledgr_push_banner_dismissed` | push.js | Flag: user dismissed the notification banner |
| `ledgr_badges_unlocked` | badges/index.html | May be an alias for ledgr_earned_badges_v2 |
| news cache key | /news | Caches GET /news responses (exact key unknown) |

### Design System
#### App Pages (dashboard, feed, leaderboard, home, etc.)
| Role | Font |
|------|------|
| Display / headings | Bebas Neue |
| Body / UI | Syne |
| Monospace / data | DM Mono |

#### Landing / Marketing (index.html, become-a-tipster)
| Role | Font |
|------|------|
| Display | Rajdhani |
| Body | Barlow |
| Mono | JetBrains Mono |

#### CSS Variables (brand.css)
```css
--color-bg:           #0A0A0A
--color-surface:      #121212
--color-surface-2:    #1E1E1E
--color-purple:       #7B2CFF
--color-purple-light: #B14CFF
--color-text:         #E6E6E6
--color-muted:        #6B6B6B
--color-border:       #2A2A2A
--color-glow:         rgba(123,44,255,0.35)
```
Hardcoded highlight colour used in injected styles: `#b89fff` (soft purple, not a CSS var).

**WARNING:** Many page `<style>` blocks define their own `:root { --ac, --bd, --tx, ... }` variables that are NOT the same as brand.css tokens. Two parallel CSS variable systems coexist — a known technical debt.

---

## 6. BACKEND ARCHITECTURE

### Hosting & Runtime
- **Platform:** Railway
- **Runtime:** Node.js + Express
- **URL:** `https://ledgr-backend-production-c132.up.railway.app`
- **WebSocket:** WSS on same URL

### Backend Modules (on Railway, not in frontend repo)
| Module | Purpose |
|--------|---------|
| `autoVerify.js` | Grading engine — cron every 5 min, settles picks, updates ROI/PnL/CLV/SharpScore/ELO/Reliability/Division/Streak |
| `backend-odds-api.js` | The Odds API provider, cache layer, fixtures fallback, normalization |
| `backend-rankings-engine.js` | Leaderboard, rankings, divisions, rank history, recent picks cache (also in frontend repo as reference) |
| `backend-profile-endpoints.js` | Profile persistence — avatar, banner, border, identity (reference file in frontend repo) |
| `backend-ws-events.js` | Live WebSocket events — online count, division updates, streak updates, pick updates (reference file in frontend repo) |
| `notifications-system.js` | Push notifications, badge notifications, live notifications |

### Sports Data
- Provider: **The Odds API**
- Used by: autoVerify.js (grading), backend-odds-api.js (pick form data)
- Cache layer exists to reduce API call volume
- Fallback to fixtures when API is unavailable

### Database
- Declared as: **Supabase PostgreSQL** (per LEDGR_MASTER_STATE.md)
- **WARNING:** All SQL schema files use **MySQL syntax** (`INT AUTO_INCREMENT`, `TINYINT`, `ENUM`, `ON DUPLICATE KEY UPDATE`, `BIGINT AUTO_INCREMENT`). This is a critical discrepancy — the schema files may not be compatible with Supabase PostgreSQL as-is. Verify actual database engine before running migrations.
- `db.query()` calls in backend JS use MySQL2-style `[rows]` destructured responses

### Authentication
- JWT or opaque token stored in localStorage under `ledgr_token`
- Backend validates ownership server-side on every protected request
- No token refresh mechanism exists — silent 401 will break all API calls for expired users

---

## 7. DATABASE SCHEMA

### Table: `users` (inferred from queries)
```sql
id          INT PRIMARY KEY
username    VARCHAR(50) NOT NULL
email       VARCHAR(100)
-- other fields unknown from frontend
```

### Table: `picks` (inferred from API responses and queries)
```sql
id          INT PRIMARY KEY
userId      INT NOT NULL          -- FK to users
username    VARCHAR(50)           -- denormalized
result      ENUM('win','loss','push','pending')
odds        DECIMAL(8,4)
stake       DECIMAL(12,2)
pnl         DECIMAL(12,2)
clv         DECIMAL(8,4)         -- closing line value, nullable
eloAfter    INT                   -- ELO after this pick was graded, nullable
sport       VARCHAR(30)
market      VARCHAR(50)
event       VARCHAR(200)
createdAt   DATETIME
```

### Table: `user_rankings` (from backend-rankings-schema.sql)
```sql
userId            INT PRIMARY KEY
username          VARCHAR(50)
totalPicks        INT DEFAULT 0
wins              INT DEFAULT 0
losses            INT DEFAULT 0
pushes            INT DEFAULT 0
totalStake        DECIMAL(12,2)
totalPnl          DECIMAL(12,2)
roi               DECIMAL(8,4)    -- percentage, e.g. 12.34
winRate           DECIMAL(6,4)    -- fraction, e.g. 0.6250
elo               INT DEFAULT 1000
divisionScore     DECIMAL(6,2)
division          ENUM('BRONZE','SILVER','GOLD','PLATINUM','DIAMOND','ELITE','LEGENDARY')
sharpScore        DECIMAL(6,2)
reliabilityScore  DECIMAL(6,2)
clvAvg            DECIMAL(8,4)    -- NULL if < 5 CLV picks
clvSum            DECIMAL(12,4)
clvCount          INT
currentStreak     INT             -- positive = win, negative = loss
streakType        ENUM('win','loss','none')
bestStreak        INT
archetype         VARCHAR(30)     -- matches archetypes.js keys
flowState         VARCHAR(30)     -- matches flow.js ids
isLive            TINYINT(1)      -- 1 if pick posted within last 2 hours
lastPickAt        DATETIME
avgOdds           DECIMAL(8,4)
createdAt         TIMESTAMP
updatedAt         TIMESTAMP
```

### Table: `ranking_history` (weekly snapshots)
```sql
id            INT AUTO_INCREMENT PRIMARY KEY
userId        INT
username      VARCHAR(50)
isoWeek       CHAR(8)             -- 'YYYY-Www', e.g. '2025-W20'
elo           INT
division      VARCHAR(20)
divisionScore DECIMAL(6,2)
sharpScore    DECIMAL(6,2)
roi           DECIMAL(8,4)
winRate       DECIMAL(6,4)
totalPicks    INT
rank          INT                 -- rank position at snapshot time
snapshotAt    TIMESTAMP
UNIQUE KEY (userId, isoWeek)
```

### Table: `recent_picks_cache` (3 most recent graded picks per tipster)
```sql
userId      INT
slot        TINYINT              -- 0=most recent, 1, 2
result      ENUM('win','loss','push','pending')
sport       VARCHAR(30)
market      VARCHAR(50)
odds        DECIMAL(8,4)
createdAt   DATETIME
PRIMARY KEY (userId, slot)
```

### Table: `live_events` (broadcast event log)
```sql
id           BIGINT AUTO_INCREMENT PRIMARY KEY
type         VARCHAR(30)
rarity       TINYINT              -- 1-5
username     VARCHAR(50)
targetUserId INT                  -- NULL = broadcast, INT = unicast
payload      JSON
createdAt    TIMESTAMP
```
Purge: rows older than 7 days should be deleted by nightly cron.

### Table: `user_notifications` (personal notification history)
```sql
id        BIGINT AUTO_INCREMENT PRIMARY KEY
userId    INT
type      VARCHAR(30)
rarity    TINYINT
payload   JSON
readAt    DATETIME               -- NULL = unread
createdAt TIMESTAMP
```

### Table: `profiles` (from backend-profile-endpoints.js migration comment)
```sql
id                    INT AUTO_INCREMENT PRIMARY KEY
userId                INT NOT NULL UNIQUE
username              VARCHAR(50)
bio                   TEXT                        -- max 160 chars (sanitized)
social_twitter        VARCHAR(50)
social_instagram      VARCHAR(50)
archetype             VARCHAR(30)
banner                VARCHAR(30)
border                VARCHAR(30)
theme                 VARCHAR(20)
fav_sports            JSON                        -- array, max 4 items
avatar_b64            LONGTEXT                    -- max 300KB post-compression
banner_b64            LONGTEXT                    -- max 500KB post-compression
odds_format           VARCHAR(20) DEFAULT 'decimal'
timezone              VARCHAR(50) DEFAULT 'UTC'
hide_from_leaderboard BOOLEAN DEFAULT FALSE
updated_at            TIMESTAMP
```

### Tables: `follows`, `seasons`, `subscriptions`, `push_subscriptions`, `chat rooms/messages`
Inferred from API calls — exact schema unknown from frontend repo.

---

## 8. API ENDPOINTS

### Base URL
`https://ledgr-backend-production-c132.up.railway.app`

### Auth
| Endpoint | Method | Body/Query | Used By |
|----------|--------|------------|---------|
| `/auth/login` | POST | { email, password } | login/ |
| `/auth/register` | POST | { username, email, password } | register/ |
| `/auth/verify-otp` | POST | { email, otp } | verify.js |

### Picks (Core)
| Endpoint | Method | Notes | Used By |
|----------|--------|-------|---------|
| `/picks` | GET | Returns all picks with nested user object | home, feed, analytics, leaderboard, tipster, progress, simulator, compare, badges, hall-of-fame, live.js, landing ticker |
| `/picks` | POST | Immutable pick creation | dashboard/ |
| `/picks/:id/react` | POST | Add reaction to a pick | feed/ |
| `/picks/:id/tail` | POST | Tail a pick (copy bet) | home/, feed/ |
| `/picks/:id/reactions` | GET | Get reactions for a pick | feed/ |
| `/picks/:id/tails` | GET | Get tail count for a pick | home/, feed/ |

### Social
| Endpoint | Method | Notes | Used By |
|----------|--------|-------|---------|
| `/follow` | POST | { followerId, followingId } | follows.js |
| `/unfollow` | POST/DELETE | { followerId, followingId } | follows.js |
| `/followers/:userId` | GET | Tipster's followers | tipster/, badges/ |
| `/following/:userId` | GET | Who user follows | tipster/ |
| `/subscribers/:tipsterId` | GET | Paying subscribers count | tipster/, settings/ |
| `/subscriptions/:userId` | GET | User's subscriptions | settings/ |
| `/subscriptions/:subId` | DELETE | Cancel a subscription | settings/ |

### Rankings & Leaderboard
| Endpoint | Method | Notes | Used By |
|----------|--------|-------|---------|
| `/rankings` | GET | Full leaderboard (pre-computed, ordered by ELO) | leaderboard/ |
| `/rankings/:username` | GET | Single tipster ranking row | tipster/ |
| `/rankings/:username/history` | GET | Weekly ELO/division history (52 weeks) | progress/, analytics/ |

### Seasons
| Endpoint | Method | Notes | Used By |
|----------|--------|-------|---------|
| `/seasons` | GET | All seasons | leaderboard, progress, badges, hall-of-fame |
| `/seasons/active` | GET | Current active season | progress/ |
| `/seasons/:id/leaderboard` | GET | Seasonal rankings | leaderboard/ |

### Profile
| Endpoint | Method | Notes | Used By |
|----------|--------|-------|---------|
| `/profile/:username` | GET | Public profile (no auth) | tipster/ |
| `/profile` | POST | Authenticated profile upsert | settings/ |
| `/users/:id` | PATCH | Bio-only update (legacy, settings/) | settings/ |

### Payments (Stripe)
| Endpoint | Method | Notes | Used By |
|----------|--------|-------|---------|
| `/create-checkout` | POST | Stripe checkout session | tipster/ |

### Push Notifications
| Endpoint | Method | Notes | Used By |
|----------|--------|-------|---------|
| `/vapid-public-key` | GET | Returns VAPID public key | push.js |
| `/push/subscribe` | POST | { userId, subscription } | push.js |
| `/push/unsubscribe` | POST | { endpoint } | push.js |

### Community (Chat)
| Endpoint | Method | Notes | Used By |
|----------|--------|-------|---------|
| `/chat/rooms` | GET | List chat rooms | community/ |
| `/chat/rooms/:id/messages` | GET | Messages in a room | community/ |
| `/chat/rooms/:id/messages` | POST | Send a message | community/ |

### Live Events
| Endpoint | Method | Notes | Used By |
|----------|--------|-------|---------|
| `/live-events` | GET | Cold load; query: limit, since | feed/, home/ cold load |

### Notifications (Backend)
| Endpoint | Method | Auth | Used By |
|----------|--------|------|---------|
| `/notifications` | GET | Required | /notifications (exists in ws-events.js but page is not wired) |
| `/notifications/read/:id` | PATCH | Required | Not wired to any frontend page yet |
| `/notifications/read-all` | PATCH | Required | Not wired to any frontend page yet |

### News
| Endpoint | Method | Notes | Used By |
|----------|--------|-------|---------|
| `/news` | GET | Query: ?sport= | news/ |

### Internal (protected)
| Endpoint | Method | Notes |
|----------|--------|-------|
| `/internal/rankings/recalculate/:userId` | POST | Trigger single-user recalculation |
| `/internal/rankings/recalculate-all` | POST | Full recalculation (expensive) |

### WebSocket
`wss://ledgr-backend-production-c132.up.railway.app`

---

## 9. WEBSOCKET EVENTS

### Architecture
- Single WSS connection on the Railway backend URL
- `ledgr-ws.js` creates one multiplexed connection per page (`window.LedgrWS`)
- Events are persisted to `live_events` table for catch-up on reconnect
- Rate limiter: in-memory Map — max 1 broadcast of same type per tipster per 5-minute window
- Online count broadcast: every 60 seconds

### Client → Server Messages
| Message Type | Payload | Purpose |
|--------------|---------|---------|
| `subscribe` | { userId, token, lastEventId, lowPower } | Register identity, request catch-up |
| `ping` | — | Heartbeat (25s normal, 60s low-power) |
| `catch_up` | { since: eventId } | Request missed events since eventId |
| `low_power` | { active: bool } | Toggle reduced heartbeat mode |

### Server → Client Broadcast Events
| Event Type | Rarity | Trigger | Payload |
|------------|--------|---------|---------|
| `pick_win` | 1 | Any win graded (rate-limited 1/user/5min) | { pickId, event, market, odds, pnl, sport } |
| `big_win` | 2–4 | pnl ≥ BIG_WIN_THRESHOLD (default 5u) | { pickId, event, market, odds, pnl, sport } |
| `underdog_hit` | 3–4 | odds ≥ UNDERDOG_MIN_ODDS (default 3.0) and win | { pickId, event, market, odds, pnl, sport } |
| `streak_milestone` | 2–5 | Win streak hits 3, 5, 7, or 10 | { streak, division } |
| `division_up` | 1–5 | Division increases (never emits down) | { fromDivision, toDivision } |
| `rank_up` | 2–5 | Rank improves, only for top 20 | { newRank, oldRank } |
| `milestone_pick` | 2–4 | Total picks reaches 25, 50, 100, 200 | { count } |
| `online_count` | 0 | Every 60s | { n } (client count) |

### Server → Client Unicast Events (targetUserId set)
| Event Type | Rarity | Trigger | Payload |
|------------|--------|---------|---------|
| `pick_result` | 1 | Always sent to pick owner after grading | { pickId, result, pnl, event, market, odds } |
| `pick_tailed` | 1 | Someone tails a pick | { pickId, count, event } |
| `followed_posted` | 1 | Followed tipster posts a new pick | { pickId, event, market, odds, sport } |
| `division_up` | 1–5 | Also unicast to user when they rank up | { fromDivision, toDivision } |
| `rank_change` | 1 | Rank changes for pick owner | { newRank, oldRank, delta } |

### Rarity Tiers (ledgr-ws.js)
| Tier | Label | UI Behaviour |
|------|-------|-------------|
| 0 | Meta | No card, no animation (online_count, ws_connected, ws_disconnected) |
| 1 | Ambient | Ticker text update only, no sidebar card |
| 2 | Subtle | Sidebar card (slide-in, green border) |
| 3 | Medium | Sidebar card with glow border |
| 4 | Prestige | Gold sidebar card, ticker highlight |
| 5 | Moment | Full-impact — special card + brief page flash overlay |

### Dynamic Rarity Calculation
```javascript
// big_win
pnl >= 20 → 4; pnl >= 10 → 3; else → 2

// underdog_hit
odds >= 5.0 → 4; else → 3

// streak_milestone
streak >= 10 → 5; streak >= 7 → 4; streak >= 5 → 3; else → 2

// division_up (toDivision)
SILVER → 1, GOLD → 2, PLATINUM → 3, DIAMOND → 4, ELITE → 4, LEGENDARY → 5

// rank_up
newRank === 1 → 5; <= 3 → 4; <= 10 → 3; else → 2

// badge_unlock
payload.badgeRarity (passed from BadgeSystem)

// milestone_pick
count >= 200 → 4; >= 100 → 3; else → 2
```

### Reconnection Strategy (ledgr-ws.js)
- Backoff sequence: [1000, 2000, 4000, 8000, 16000, 30000] ms
- Low-power mode (tab hidden): heartbeat slows to 60s, animations suppressed
- On tab return: heartbeat restored to 25s, catch_up message sent with lastEventId
- catch_up: backend resends up to 50 missed broadcast events since lastEventId

---

## 10. RANKING / ELO FORMULAS

**Source of truth: `backend-rankings-engine.js`**
These formulas must never be changed without simultaneously updating all client-side mirrors.

### ELO Calculation
```
ELO_START = 1000
ELO_K     = 32
ELO_FLOOR = 100

impliedProbability = max(0.05, min(0.95, (1 / odds) * 0.9))
expectedScore      = 1 / (1 + 10^((ELO_START - currentElo) / 400))
actual             = win → 1.0, push → 0.5, loss → 0.0

delta = round(K × (actual − expectedScore))

// Streak bonus (wins only, streak ≥ 3)
if result === 'win' and winStreak >= 3:
    delta += min(winStreak − 2, 5) × 2   // max +10 per pick

new_elo = max(ELO_FLOOR, currentElo + delta)
```

The `winStreak` used in ELO is a running count of consecutive wins **across the entire pick history**, reset to 0 on any loss/push. If `eloAfter` is stored on the pick (from the grading event), that stored value is trusted over recalculation.

### Division Score Formula
```
roiPts    = min(40, (roi / 20) × 40)          // ROI component (40 pts max)
wrPts     = min(30, (winRate × 100 / 70) × 30) // Win rate component (30 pts max)
volumePts = min(20, (pickCount / 100) × 20)   // Volume component (20 pts max)
pickPts   = min(10, pickCount)                 // Pick count bonus (10 pts max)

divisionScore = roiPts + wrPts + volumePts + pickPts  // 0–100
```

### Division Thresholds (descending, first match wins)
| Division | Min Score |
|----------|-----------|
| LEGENDARY | 92 |
| ELITE | 80 |
| DIAMOND | 65 |
| PLATINUM | 50 |
| GOLD | 35 |
| SILVER | 20 |
| BRONZE | 0 |

**Note:** `animations.js` has slightly different thresholds (90/75/60/45/30/15) and uses 'LEGEND' instead of 'LEGENDARY'. This is a divergence — animations.js is a legacy file that has not been updated to match backend thresholds.

### Reliability Score (backend only, not shown in most UI)
```
volumeScore = min(40, (totalPicks / 50) × 40)
wrScore     = min(40, (winRate × 100 / 70) × 40)
streakScore = min(20, (bestStreak / 10) × 20)

reliabilityScore = min(100, volumeScore + wrScore + streakScore)
```

### Recalculation Trigger
After every pick is graded:
1. `recalcUserRankings(db, userId)` — full aggregate recalculation from all graded picks
2. `emitPickGraded(db, pick, prevSnapshot)` — broadcast relevant events

Weekly (Sunday 23:59 UTC):
- `snapshotWeeklyRankings(db)` — stores current ELO/division/rank into `ranking_history`

---

## 11. SHARP SCORE LOGIC

There are **two different Sharp Score formulas** in the codebase. This is critical technical debt.

### Backend Formula (backend-rankings-engine.js) — Authoritative
```
sampleFactor = min(1, totalPicks / 50)
oddsFactor   = min(1.5, avgOdds / 1.5)
streakFactor = if currentStreak > 0: min(1.3, 1 + currentStreak × 0.05) else 1.0

sharpScore = max(0, min(100, roi × sampleFactor × oddsFactor × streakFactor))
```
- `roi` is a percentage (e.g. 12.5 not 0.125)
- `currentStreak` is the positive win streak count (0 if on a loss streak)

### Frontend Formula (archetypes.js) — Used Client-Side on Most Pages
```
sampleFactor = min(n / 30, 1)           // NOTE: denominator is 30, not 50
oddsFactor   = 1 + log(max(avgOdds, 1.01)) × 0.2
              (natural log, approx 1 + 0.163 at odds 2.0)

// Variance-based streak factor (NOT win streak count)
perPickROI   = pnl[i] / stake[i] for each pick
mean         = average of perPickROI
stdDev       = sqrt(variance of perPickROI)
streakFactor = 1 / (1 + stdDev × 0.5)

raw          = roi × 100 × sampleFactor × oddsFactor × streakFactor
               (roi here is a fraction: 0.125, not 12.5)
sharpScore   = max(0, min(100, round(raw × 10) / 10))
```

### Impact
Pages that compute Sharp Score client-side (/home, /leaderboard, /tipster, /compare, /analytics) will show different values than the backend-computed score in `user_rankings.sharpScore`. The leaderboard's all-time tab shows the client-side value; the /rankings endpoint returns the backend value.

---

## 12. BADGE SYSTEM LOGIC

### Two Badge Systems
1. **`animations.js` `checkBadgeUnlock()`** — Simple 5-badge set, fires quick animation overlays from any page. Uses localStorage key `ledgr_earned_badges`.
2. **`badges-system.js` `window.BadgeSystem`** — Full 14-badge v2 system, detailed progression UI, rarity-specific animations. Uses localStorage key `ledgr_earned_badges_v2`. Used on /badges/.

These are **independent systems with separate state**. A badge earned in one system is not reflected in the other.

### v2 Badge Definitions (badges-system.js)

**COMMON (6 particles)**
| ID | Icon | Name | Condition |
|----|------|------|-----------|
| first_pick | 🎯 | First Pick | picks >= 1 |
| getting_started | 📊 | Getting Started | picks >= 10 |
| verified | ✅ | Verified | extra.emailVerified === true |

**RARE (12 particles)**
| ID | Icon | Name | Condition |
|----|------|------|-----------|
| hot_streak | 🔥 | Hot Streak | streak >= 5 |
| profitable | 📈 | Profitable | roi > 0 && picks >= 20 |
| sharp_eye | 🔭 | Sharp Eye | wr >= 60 && settled >= 30 |
| social | 👥 | Social | extra.followers >= 10 |

**EPIC (18 particles)**
| ID | Icon | Name | Condition |
|----|------|------|-----------|
| diamond_bettor | 💎 | Diamond Bettor | extra.divisionName in ['DIAMOND','ELITE','LEGENDARY'] |
| rising_star | 🚀 | Rising Star | extra.leaderboardRank <= 10 && extra.accountAgeDays <= 30 |
| season_top3 | 🏆 | Season Top 3 | extra.seasonBestFinish <= 3 |
| clv_master | ⚡ | CLV Master | avgCLV >= 5 && clvCount >= 50 |

**LEGENDARY (36 particles, animated border)**
| ID | Icon | Name | Condition |
|----|------|------|-----------|
| season_champion | 👑 | Season Champion | extra.isSeasonChampion === true |
| legendary_div | 🌟 | Legendary | extra.divisionName === 'LEGENDARY' |
| profit_500 | 💰 | 500 Units | pnl >= 500 |
| year_profit | 🎖️ | 1 Year Profitable | profitableMonthStreak >= 12 |

### Badge Rarity Colours
| Rarity | Colour | Particle Count |
|--------|--------|----------------|
| common | #94a3b8 (slate) | 6 |
| rare | #38bdf8 (sky blue) | 12 |
| epic | #b89fff (purple) | 18 |
| legendary | #fbbf24 (gold) | 36 |

### Stats Calculated by BadgeSystem.calcStats(picks)
`picks`, `wins`, `settled`, `roi`, `wr` (%), `avgOdds`, `pnl`, `streak` (current win streak), `clvCount`, `avgCLV`, `profitableMonthStreak`, `accountAgeDays`

### `extra` Object (passed alongside stats)
Must be provided by calling page from backend or localStorage:
- `emailVerified`, `followers`, `divisionName`, `leaderboardRank`, `accountAgeDays`, `seasonBestFinish`, `isSeasonChampion`

### Badge Persistence Problem
Badge state is stored only in localStorage. If a user clears their browser, switches devices, or uses private mode, all badge unlocks are lost. Backend persistence endpoint does not exist yet.

---

## 13. BETTING DNA / ARCHETYPE LOGIC

### Priority-Order Archetype Detection (first match wins)
**Backend (`backend-rankings-engine.js`) — authoritative:**
| Priority | Key | Icon | Name | Condition |
|----------|-----|------|------|-----------|
| 1 | demon | 😈 | The Demon | currentStreak >= 5 |
| 2 | sniper | 🎯 | The Sniper | totalPicks < 30 && roi > 20 |
| 3 | sharp | 📐 | The Sharp | sharpScore > 70 |
| 4 | grinder | ⚙️ | The Grinder | totalPicks > 100 && roi > 0 |
| 5 | underdog-king | 👑 | Underdog King | avgOdds > 3.0 && roi > 0 |
| 6 | value-hunter | 🔍 | Value Hunter | avgOdds >= 2.5 && avgOdds <= 3.5 && roi > 0 |

**Frontend (`archetypes.js`) — slight divergence:**
- demon: streak **> 5** (backend uses **>= 5**)
- key names: 'underdog' not 'underdog-king', 'value' not 'value-hunter'
- 'value' condition: avgOdds >= 2.5 && avgOdds <= 3.5 && roi > 0 (same logic)

### Full Archetype Metadata (backend, all 11 archetypes)
| Key | Icon | Colour |
|-----|------|--------|
| sniper | 🎯 | #f59e0b |
| demon | 😈 | #f87171 |
| grinder | ⚙️ | #94a3b8 |
| sharp | 📐 | #818cf8 |
| value-hunter | 🔍 | #34d399 |
| lock-machine | 🔒 | #fbbf24 |
| ice-cold | 🧊 | #7dd3fc |
| profit-farmer | 💰 | #86efac |
| underdog-king | 👑 | #e879f9 |
| data-nerd | 📊 | #a78bfa |
| momentum-monster | 🌊 | #fb923c |

Note: lock-machine, ice-cold, profit-farmer, data-nerd, momentum-monster have no detection logic yet — they are defined in metadata but have no `test` function.

### Valid Archetypes for Profile
`sniper`, `demon`, `grinder`, `sharp`, `value-hunter`, `lock-machine`, `ice-cold`, `profit-farmer`, `underdog-king`, `data-nerd`, `momentum-monster`

---

## 14. PROGRESSION / DIVISIONS SYSTEM

### Visual Hierarchy (`divisions.js`)
| Division | Icon | Avatar Effect | Score Range |
|----------|------|---------------|-------------|
| LEGENDARY | 🐐 | Rainbow conic gradient aura, 6 orbiting coloured particles | 92+ |
| ELITE | 🔱 | Pink-purple conic gradient rotating aura, 4 pink/purple orbiting particles | 80–91 |
| DIAMOND | 💎 | Purple pulse-scale aura | 65–79 |
| PLATINUM | ⚡ | Sky blue pulsing aura | 50–64 |
| GOLD | 🏆 | Gold pulsing aura | 35–49 |
| SILVER | 🥈 | Slate pulsing aura | 20–34 |
| BRONZE | 🥉 | Bronze subtle glow (no animation) | 0–19 |

### Rank-Up Animation (`animations.js`)
- Triggered by `window.checkRankUp(picks)` — compares computed division vs stored `ledgr_division` key
- Shows: division name in Bebas Neue 76px, division colour glow orb, 32 particles
- Auto-dismisses after 4s or on click

### Streak Animation (`animations.js`)
- Triggered by `window.checkStreak(picks)` — fires for streaks >= 3 that exceed previous stored streak
- Shows: fire emoji, streak count in orange, auto-dismisses after 2.6s

### Season End Animation (`animations.js`)
- `window.seasonEndAnimation(champion, stats)` — must be called manually when a season ends
- Shows: season champion username, crown, spinning conic rays overlay, 50 confetti particles

### Division Pill HTML (`divisions.js`)
```javascript
window.Divisions.pillHTML(divDef, 'sm'|'md'|'lg')
// Returns: <span class="dv-pill dv-pill-{size} dv-pill-{division}">icon NAME</span>
```

### Division Aura Application (`divisions.js`)
```javascript
// From picks array
const divDef = window.Divisions.get(picks);  // { name, score, icon, cls, wrapCls, pillCls, ... }

// From precomputed stats
const divDef = window.Divisions.getFromStats(roi_pct, wr_pct, pickCount);

// Apply glow to existing DOM avatar element
window.Divisions.applyGlow(avatarEl, divDef);

// Generate full avatar HTML with glow built-in
const html = window.Divisions.avHTML(initials, bgGradient, divDef, opts);
```

---

## 15. NOTIFICATIONS SYSTEM

### Current State: Partially Wired
There are **three separate notification mechanisms** that are NOT fully connected to each other:

**1. Push Notifications (push.js + notifications-sw.js)**
- `push.js` registers a ServiceWorker and creates a browser push subscription
- Subscription stored on backend via `POST /push/subscribe`
- ServiceWorker (`notifications-sw.js`) handles incoming push events from backend
- Backend sends pushes when... unclear — autoVerify.js or notifications-system.js on Railway
- Delivery from backend is NOT confirmed from frontend inspection

**2. WebSocket Unicast Notifications (backend-ws-events.js)**
- When picks are graded, backend calls `_emit(...)` with `targetUserId`
- These are persisted to `user_notifications` table
- Also unicast via WebSocket to any connected tab
- `GET /notifications` and `PATCH /notifications/read/:id` endpoints exist in backend

**3. Notification Centre Page (/notifications)**
- Currently reads/writes ONLY `localStorage.ledgr_notifications`
- NOT connected to `GET /notifications` API endpoint
- NOT connected to push events
- This page is essentially a lie — notifications shown here are not real system notifications

### What Needs to Be Done
1. Wire `/notifications` page to `GET /notifications` API endpoint
2. On page load: fetch real notifications, display them
3. Mark read via `PATCH /notifications/read/:id` or `PATCH /notifications/read-all`
4. Connect LedgrWS unicast events (`pick_result`, `followed_posted`, etc.) to update badge count in nav

---

## 16. LIVE SYSTEMS

### live.js Architecture
**Loaded on:** `/home/` and `/leaderboard/` (anywhere with `#tickerText` or `#lbContainer`)

**Cold Load:**
1. Fetches `GET /picks` for historical data
2. Builds ticker messages from: streaks, top ROI, divisions (Gold+), big wins in last 48h
3. Sets initial online count from tipsters active in last 7 days (approximation)
4. Populates `_historyQueue` with recent wins for sidebar fallback

**Live Events (via LedgrWS):**
- `online_count` → updates `#onlineCount` (home) and `#lv-online` (leaderboard)
- Sidebar types: `pick_win`, `big_win`, `underdog_hit`, `streak_milestone`, `division_up`, `rank_up`, `milestone_pick`
- Rarity >= 2 → prepend message to ticker
- Rarity >= 5 → page flash (radial gradient overlay for 800ms)
- Leaderboard: in-place row patch on `streak_milestone` (updates `.streak-col`) and `rank_up` (calls `window.animateElo` if available)

**Sidebar Cycle (7s interval):**
- If `_liveQueue` has events (rarity > 1): show live event card
- Else: cycle through `_historyQueue` (every other tick = 14s effective gap)
- Cards slide in from right, previous card slides out
- Desktop only (hidden on <= 640px)

**Ticker Behaviour:**
- `#tickerText` (home) and `#lv-msgs` (leaderboard) rendered with doubled messages for seamless loop
- Speed: 40px/s scroll
- Historical refresh: every 90s if no live events are flowing
- IntersectionObserver pauses animation when ticker is off-screen

### LedgrWS Connection Details
```
WSS URL: wss://ledgr-backend-production-c132.up.railway.app
Heartbeat: 25s normal, 60s low-power (tab hidden)
Reconnect: [1000, 2000, 4000, 8000, 16000, 30000] ms backoff
```

---

## 17. CURRENT KNOWN BUGS

From LEDGR_MASTER_STATE.md + PRODUCT_BLUEPRINT.md + code inspection:

| ID | Severity | Bug | Location |
|----|----------|-----|---------|
| B1 | HIGH | **Settings theme/colour not persisting** — `theme` field saves to `profiles` table server-side (via `POST /profile`) but if the profile endpoint isn't wired in the settings page, changes are localStorage-only | settings/index.html |
| B2 | HIGH | **Archetypes selectable manually** — users can pick any archetype in settings; the backend-computed archetype in `user_rankings.archetype` should be the authoritative display but settings allows manual override without validation against actual stats | settings/index.html, backend-profile-endpoints.js |
| B3 | MEDIUM | **Tipster page visually weak** — profile bio/avatar pulled from localStorage, not backend; if user hasn't set them in this browser, they show blank | tipster/index.html |
| B4 | MEDIUM | **Login/signup flow inconsistent** — two localStorage key systems coexist (`ledgr_user`/`ledgr_token` and legacy `user`/`token`); some pages read one, others read both; logout in brand-nav.js clears all 4 but not all pages do | brand-nav.js, various pages |
| B5 | CRITICAL | **MLB (baseball) grading missing** — autoVerify.js on Railway may not handle MLB result grading, leaving baseball picks in pending state permanently | autoVerify.js (Railway backend) |
| B6 | HIGH | **Push delivery unconfirmed** — push.js registers subscription with backend but it's not confirmed that backend sends push events when picks are graded | autoVerify.js, notifications-system.js |
| B7 | HIGH | **Void/push pick handling missing** — no frontend or grading UI for voiding picks or handling push (draw) outcomes consistently across all sports | dashboard, autoVerify.js |
| B8 | MEDIUM | **Navbar hierarchy weak** — hamburger menu links are injected by brand-nav.js at runtime; inconsistent ordering, no active state indicator | brand-nav.js |
| B9 | CRITICAL | **Notifications page disconnected from backend** — /notifications reads only localStorage; real notifications from WebSocket/push are not shown here | notifications/index.html |
| B10 | MEDIUM | **Sharp Score divergence** — backend and archetypes.js use different formulas; /leaderboard, /analytics, /tipster show different values than /rankings endpoint | archetypes.js, backend-rankings-engine.js |
| B11 | HIGH | **Badge state lost on device change** — badge unlocks in localStorage; lost when user switches devices or clears cache | badges-system.js |
| B12 | LOW | **`football.js` dead code** — file in root with `alert("WORKING")`, also `/login/api-temp/football.js` | football.js, login/api-temp/football.js |
| B13 | HIGH | **No 401 interceptor** — expired tokens cause silent failures; no shared wrapper redirects to /login | All pages with API calls |
| B14 | MEDIUM | **Dual CSS variable systems** — brand.css tokens vs per-page `:root { --ac, --bd, --tx }` variables coexist | All pages |
| B15 | HIGH | **Profile not persisted server-side** (avatar, banner, border, archetype) — if /profile endpoint is wired in settings, this is fixed; if not, all visual identity is localStorage-only | settings/index.html |
| B16 | LOW | **.env file in /login** — `login/.env` is tracked in the repo directory; verify it doesn't contain secrets | login/.env |

---

## 18. MISSING FEATURES

| Feature | Priority | Notes |
|---------|----------|-------|
| **Pick grading pipeline confirmation** | BLOCKER | autoVerify.js exists on Railway; confirm it actually grades picks end-to-end. Without this, the whole product doesn't work. |
| **Tipster onboarding flow** | HIGH | /become-a-tipster is static marketing. No form, no verification, no approval flow. |
| **Admin dashboard** | HIGH | No admin panel visible in this repo. Pick grading, dispute resolution, user management all invisible from frontend. |
| **Real notifications page** | HIGH | Wire /notifications to GET /notifications API. |
| **Push notification delivery** | HIGH | Confirm backend sends picks when autoVerify grades. |
| **Server-side profile persistence** | HIGH | Ensure POST /profile is wired in settings page (endpoint exists in backend-profile-endpoints.js). |
| **Subscription price control** | MEDIUM | Tipsters can't set their €X/month price from settings. |
| **Pick search / discovery** | MEDIUM | No search by sport/market/date across tipsters. |
| **Historical seasons UI** | MEDIUM | /seasons/:id/leaderboard API exists but no UI to browse past seasons. |
| **Dispute / correction flow** | MEDIUM | No mechanism to dispute a wrongly graded pick. |
| **Tipster revenue dashboard** | MEDIUM | Tipsters can't see how much they earn from subscribers. |
| **Subscriber-only picks** | MEDIUM | No mechanism for tipsters to post picks visible only to paying subscribers. |
| **Referral / invite system** | LOW | Mentioned in become-a-tipster copy but not implemented. |
| **PWA manifest** | LOW | Site is responsive but not installable as PWA. |
| **Pick share improvements** | LOW | share.js cards are static; social proof stats (win rate, ROI) could be included. |
| **Leaderboard badge state for demo-style archetypes** | LOW | lock-machine, ice-cold, profit-farmer, data-nerd, momentum-monster have no detection logic. |

---

## 19. CURRENT PROJECT PHASE

**PHASE 1 — Trust Foundation**

Goal: Get to one complete, trustworthy user journey before adding features.
Critical path: **tipster posts pick → pick gets auto-graded → follower sees the result → notification delivered.**

Current focus:
- Fix grading reliability (MLB grading, void handling)
- Identity system (profile persistence, settings rework)

Next tasks:
- Wire /notifications page to backend
- Confirm push delivery end-to-end
- Ensure profile POST endpoint is wired in settings

Phase 2 (next): Retention & Discovery — badge persistence, historical seasons, search
Phase 3 (future): Monetisation Layer — tipster revenue dashboard, subscriber-only picks

---

## 20. DEPENDENCIES BETWEEN SYSTEMS

```
autoVerify.js (Railway cron)
  ├── reads: picks table
  ├── calls: recalcUserRankings(db, userId)   → writes user_rankings
  ├── calls: emitPickGraded(db, pick, prev)   → writes live_events + user_notifications
  │          ├── broadcasts WS events to all clients (pick_win, big_win, etc.)
  │          └── unicasts pick_result to pick owner
  └── sends: push notifications via notifications-system.js

ledgr-ws.js (client, loaded first)
  └── live.js depends on ledgr-ws.js being loaded before it

BadgeSystem.checkForNewUnlocks (badges-system.js)
  └── requires: picks array (from GET /picks) + extra object (from GET /followers, seasons, leaderboard)

divisions.js
  └── no external dependencies (pure calculation)

archetypes.js
  └── no external dependencies (pure calculation from picks)

flow.js
  └── no external dependencies (pure calculation from picks)

animations.js
  └── calls window.checkRankUp → depends on division formula (internally duplicated)
  └── calls window.checkBadgeUnlock → uses its own internal badge set (not BadgeSystem v2)

share.js
  └── no external dependencies

follows.js
  └── requires: ledgr_user in localStorage

push.js
  └── requires: ledgr_user.id in localStorage
  └── requires: /vapid-public-key endpoint

brand-nav.js
  └── requires: brand.css (CSS vars it references)
  └── called after DOMContentLoaded

live.js
  └── requires: ledgr-ws.js (must be loaded first)
  └── requires: GET /picks API

Leaderboard real-time patches (live.js _patchLbRow)
  └── requires: window.animateElo (optional — defined in leaderboard/index.html script)
```

---

## 21. RISKS / TECHNICAL DEBT

### Critical
| Risk | Detail | Fix |
|------|--------|-----|
| No server-side profile persistence | Avatar/banner/archetype/border/theme in localStorage. Lost on device change, private mode, or cache clear. | Wire POST /profile in settings page (endpoint exists in backend-profile-endpoints.js). |
| No server-side notifications | /notifications is entirely localStorage. Real notification delivery is unverified. | Wire GET /notifications in /notifications page. |
| Dual localStorage key systems | `ledgr_user`/`ledgr_token` + legacy `user`/`token`. Inconsistent reads. | Deprecate legacy keys everywhere; enforce `ledgr_*` only. |
| No 401 interceptor | Expired tokens cause silent API failures. No shared `apiFetch()` wrapper. | Add a shared fetch wrapper that redirects to /login on 401. |
| Sharp Score divergence | Frontend (archetypes.js) and backend use different formulas. Values disagree across pages. | Move Sharp Score computation to backend; pages display value from user_rankings.sharpScore. |
| MySQL syntax in SQL files vs Supabase | Schema files use MySQL syntax. If DB is PostgreSQL (Supabase), migrations will fail. | Verify actual database engine. Rewrite migrations in PostgreSQL syntax if needed. |

### High
| Risk | Detail |
|------|--------|
| Badge state ephemeral | Badge unlocks in localStorage. Backend persistence endpoint does not exist. |
| No input validation on pick form | /dashboard client-side validation only; backend must enforce immutability. |
| `football.js` in root | Dead code with `alert("WORKING")`. Also present in `login/api-temp/`. |
| News cache stale | Backend news format change would serve wrong data silently from localStorage. |
| Settings bio is 1-field PATCH | Saving bio via PATCH /users/:id doesn't save other profile fields. POST /profile is the correct endpoint for a full save. |
| Two badge systems | `animations.js` (5 quick badges) and `badges-system.js` (14 badges v2) are independent systems with separate localStorage keys. Can cause confusion. |

### Medium
| Risk | Detail |
|------|--------|
| No error handling standard | Each page rolls its own try/catch and error UI. |
| Dual CSS variable systems | brand.css tokens vs per-page `:root { --ac, --bd, --tx }` variables. |
| No CSP headers | Static Vercel deploy with no content security policy. |
| No analytics / observability | No error tracking, no performance monitoring, no conversion funnel data. |
| live.js polling on every page load | Starts immediately with no cleanup if user navigates away quickly. |
| Division threshold divergence | animations.js uses different thresholds (90/75/60/45/30/15) vs canonical (92/80/65/50/35/20). Division names also differ in animations.js ('LEGEND' vs 'LEGENDARY'). |
| Archetype detection divergence | demon threshold: >= 5 (backend) vs > 5 (archetypes.js frontend). |

---

## 22. CURRENT TODO ROADMAP

### Immediate (Phase 1 Stability)
1. **[BLOCKER]** Confirm autoVerify.js grades picks end-to-end in production. Verify MLB sport coverage.
2. **[BLOCKER]** Wire /notifications page to `GET /notifications` API endpoint. Remove localStorage dependency.
3. **[HIGH]** Wire `POST /profile` in settings page for avatar/banner/border/archetype/theme persistence.
4. **[HIGH]** Add `GET /profile/:username` call to tipster page and community page for server-side profile data.
5. **[HIGH]** Implement void/push pick handling in autoVerify.js and frontend.
6. **[HIGH]** Confirm push notification delivery — add test push from backend after a graded pick.
7. **[MEDIUM]** Replace all `localStorage.clear()` calls with targeted key removal to avoid nuking unrelated state.
8. **[MEDIUM]** Consolidate Sharp Score to one formula — use backend value from user_rankings; remove archetypes.js recalculation.
9. **[MEDIUM]** Consolidate division thresholds — update animations.js to match canonical values.
10. **[MEDIUM]** Add a shared `apiFetch()` wrapper with 401 redirect to /login.
11. **[LOW]** Delete `football.js` and `login/api-temp/football.js`.
12. **[LOW]** Audit `login/.env` — verify no secrets are committed to repo.

### Phase 1 Core Journey
- Pick grading pipeline fully verified
- Tipster onboarding form on /become-a-tipster
- Subscription price control in settings
- Server-side leaderboard (use GET /rankings instead of client-side computation)

### Phase 2 Retention
- Badge persistence backend endpoint
- Historical season browser UI
- Search/discovery by sport and performance
- Share card improvements (add win rate + ROI to canvas)

### Phase 3 Monetisation
- Tipster revenue dashboard
- Subscriber-only picks
- Referral/invite system

---

## 23. FILES THAT MUST NEVER BE MODIFIED WITHOUT CAUTION

| File | Risk Level | Reason |
|------|-----------|--------|
| `backend-rankings-engine.js` | CRITICAL | Contains canonical ELO, division, sharp score, reliability formulas. Any change breaks all rankings data. Backend and ALL client-side mirrors must be updated simultaneously. |
| `backend-ws-events.js` | CRITICAL | WebSocket event schema and rarity system. Changes break live.js, ledgr-ws.js, and all event-consuming pages. |
| `backend-rankings-schema.sql` | CRITICAL | Core database schema. Irreversible structural changes can corrupt all ranking data. |
| `backend-live-events-schema.sql` | HIGH | live_events and user_notifications schema. |
| `ledgr-ws.js` | HIGH | Single shared WS client. All pages using live events depend on its API (`LedgrWS.on`, `LedgrWS.off`, `LedgrWS.rarity`). |
| `live.js` | HIGH | Live ticker + sidebar. Depends on ledgr-ws.js API; changing event types or payload shapes breaks the UI. |
| `brand.css` | HIGH | Global design tokens used by every page. Renaming or removing CSS variables breaks all pages simultaneously. |
| `brand-nav.js` | MEDIUM | Auth state, logout, hamburger links. Every page uses this. Any change that breaks nav breaks all pages. |
| `badges-system.js` | MEDIUM | Badge unlock logic and localStorage state key (`ledgr_earned_badges_v2`). Changing the storage key orphans all existing earned badge data. |
| `divisions.js` | MEDIUM | Division visual system. The `DEFS` array order must remain highest-to-lowest. `calcScore()` must match backend `calcDivisionScore()` exactly. |
| `backend-profile-endpoints.js` | MEDIUM | Profile validation allowlists (VALID_ARCHETYPES, VALID_BANNERS, VALID_BORDERS, VALID_THEMES). Adding to these is safe; removing values will reject existing valid profiles. |
| `notifications-sw.js` | MEDIUM | Service worker. Changes require clearing the SW registration in all existing browsers. The scope is `/` (entire site). |
| `vercel.json` | MEDIUM | All URL rewrites. Any path added, removed, or mistyped here breaks that route in production. |

---

## APPENDIX: VALID PROFILE VALUES

### Archetypes
`sniper`, `demon`, `grinder`, `sharp`, `value-hunter`, `lock-machine`, `ice-cold`, `profit-farmer`, `underdog-king`, `data-nerd`, `momentum-monster`

### Banners
`midnight`, `purple-fade`, `frost`, `carbon`, `dark-smoke`, `cosmic-nebula`, `diamond-storm`, `crimson-energy`, `electric-void`, `phantom-pulse`, `galaxy-motion`, `dragon-aura`, `eternal-flame`, `neon-rift`, `crown-energy`, `default`, `purple-haze`, `cyber-teal`, `gold-rush`, `fire-wave`, `ice-storm`, `diamond`, `legend-aura`

### Borders
`none`, `clean`, `blue-ring`, `diamond-ring`, `cosmic`, `electric`, `inferno`, `royal`, `dragon`, `celestial`, `bronze-frame`, `silver-frame`, `gold-frame`, `diamond-frame`, `elite-frame`, `pulse`, `gold`, `fire`, `legend`

### Themes
`purple`, `gold`, `emerald`, `crimson`, `ice`, `ember`, `neon`, `platinum`, `default`, `cyan`, `red`, `green`, `orange`, `pink`, `white`

### Sports
`Soccer`, `Basketball`, `Tennis`, `Football`, `Baseball`, `MMA/Boxing`

### Odds Formats
`decimal`, `american`, `fractional`

---

*End of LEDGR_BRAIN.md — updated 2026-05-17*
