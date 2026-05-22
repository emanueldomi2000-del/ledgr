# LAST TASK

Date: 2026-05-22

Current phase: PHASE 3 — Prestige + Monetization Foundation

Current objective: Sprint 7 — Progress Page Empty State ✅ COMPLETE

---

## Last completed: Sprint 7 — Progress Page Empty State (2026-05-22)

### Problem
Progress page for users with 0 picks either crashed or showed a broken layout. The early return at `buildHTML` short-circuited all sections, leaving the hero broken and every other section missing.

### Changes — `progress/index.html`

1. **Picks fetch** — changed from `GET /picks` (global feed, PUBLIC only after visibility feature) → `GET /picks?userId=USER_ID` with `Authorization: Bearer <token>`. Removed client-side `filter(p=>p.userId===USER_ID)` (now server-filtered). Array guard added.

2. **Auth check** — verified uses `localStorage.getItem('ledgr_user')`, NOT `localStorage.getItem('userId')`. No change needed — was already correct.

3. **Hero section** — when `isEmpty`:
   - Shows BRONZE I, `0 / 1,000 RP`, ELO bar at 0%
   - Sub-text: "Start your journey — post your first pick"
   - Inline CTA: "Post First Pick →" → `/dashboard`
   - Streak/rank/sharp pills hidden

4. **Journey Timeline** — empty node text changed from "Post your first pick to begin" → "Every legend begins with pick #1"

5. **Next Unlocks** — `buildUnlocks()` now returns fixed empty-state items when `picks.length === 0`:
   - 🩸 First Blood: 0/1 wins
   - 📋 Apprentice: 0/10 picks
   - 🔥 Heat Check: 0/3 streak

6. **Momentum** — when `isEmpty`: shows "No data yet" + "Post picks to see your momentum build" (no stats grid)

7. **Skill Radar** — when `isEmpty`: renders flat radar (all zeros) + label "Radar unlocks after 5 picks"

8. **Big Moments** — when `isEmpty`: all 4 cards show `—` / "Not yet achieved"

9. **Fixed bottom CTA** — renders only when `picks.length === 0`:
   - "Ready to start? Post your first pick and begin building your verified record."
   - Button: "Post First Pick →" → `/dashboard`

10. **Removed early return** — page now fully renders all sections for 0-picks users. No redirect.

---



## Last completed: Sprint 6 — Private/Public Picks (2026-05-22)

### Schema
- `picks-visibility-migration.sql` — `ALTER TABLE picks ADD COLUMN visibility ENUM('PUBLIC','PREMIUM') NOT NULL DEFAULT 'PUBLIC'`
- Migration already applied to Railway DB. File is repo documentation only.

### Changes

1. **backend-picks-endpoints.js**
   - `_formatPick()` — exposes `visibility: pick.visibility || 'PUBLIC'`
   - `POST /picks` — accepts `visibility` in body; sanitized to `PUBLIC`/`PREMIUM`; stored immutably in INSERT
   - `GET /picks` — optional JWT auth (try-catch, no 401); subscription check via `subscriptions` table (`userId` + `tipsterId` + `status='active'`); global feed (no `?userId`) hardcoded to `PUBLIC` only; per-user fetch returns all picks for own/subscriber, teaser stubs for non-subscribers on PREMIUM picks (`_teaser:true` + masked fields)

2. **dashboard/index.html**
   - State: `pickVisibility='PUBLIC'` added
   - CSS: `.vis-toggle`, `.vis-btn`, `.vis-btn.premium.active` added
   - HTML: `[🌐 Public] [🔒 Premium]` toggle inserted between immutability notice and POST PICK button
   - `setVisibility(v,el)` function added
   - `loadPicks()` — now fetches `GET /picks?userId=<id>` with `Authorization: Bearer <token>`; removes client-side `filter(p=>p.userId===user.id)` (server-filtered)
   - `postPick()` — includes `visibility:pickVisibility` in POST body; resets to PUBLIC after successful post

3. **tipster/index.html**
   - `loadProfile()` restructured: profile + rankings fetched first in parallel; `tipsterUserId` derived from `rankingMeta.userId`; then picks fetched with `GET /picks?userId=<tipsterUserId>` + optional auth header
   - Removed buggy `all.filter(p=>p.user&&p.user.username===username)` — picks now server-filtered
   - Removed `tipsterUserId=allPicks[0].userId` (was always null due to the bug above)
   - Removed client-side rank fallback that used `p.user.username` (broken) — now uses `rankingMeta.rank || 0`
   - `renderPicks()` — teaser card branch added for `p._teaser === true`: shows event/sport/date/result + purple locked panel with SUBSCRIBE button

### Smoke test checklist
1. Dashboard: post pick with `🌐 Public` selected → check DB `visibility='PUBLIC'`
2. Dashboard: post pick with `🔒 Premium` selected → check DB `visibility='PREMIUM'`
3. Tipster page: logged out → PREMIUM picks show as teaser cards
4. Tipster page: logged in, not subscribed → PREMIUM picks show as teaser cards
5. Tipster page: logged in, subscribed → PREMIUM picks show full card
6. Tipster page: own profile → PREMIUM picks show full card (own picks)
7. Global feed (`GET /picks` no userId) → no PREMIUM picks appear
8. Dashboard `loadPicks` — own PREMIUM picks always visible (own token sent)

---



## Last completed: Sprint 5 — Logo Integration Pass (2026-05-22)

### Changes

1. **app-nav.js** — Nav logo updated from text+icon to `<picture>` responsive element:
   - Desktop (>768px): `ledgr-logo.png` at 32px height (full wordmark)
   - Mobile (≤768px): `ledgr-icon.png` (icon only)
   - `.an-logo-wordmark` span removed from logoHtml (wordmark now in image)

2. **Favicon** — Added `<link rel="icon" type="image/png" href="/assets/logo/ledgr-icon.png">` to all 26 pages. Previously only badges/progress had it.

3. **og:image** — Updated all pages from `https://getledgr.bet/og-image.png` → `https://getledgr.bet/assets/logo/ledgr-logo.png`. Added og:image to 9 pages that had none (compare, become-a-tipster, badges, progress, simulator, news, parlay, privacy, terms).

4. **Public page logos** — Replaced text logos with image logos:
   - `login/index.html`: in-card `.logo` → `<img>` at 56px
   - `register/index.html`: in-card `.logo` → `<img>` at 56px
   - `index.html`: nav `.logo` → `<img>` at 28px (nav-height appropriate)
   - `become-a-tipster/index.html`: nav `.bat-logo` → `<img>` at 28px

5. **Prestige watermarks** — Added fixed-position LEDGR icon watermark to 4 prestige pages:
   `position:fixed;bottom:80px;right:20px;height:100px;opacity:0.03;pointer-events:none;z-index:0`
   Pages: `home`, `leaderboard`, `tipster`, `hall-of-fame`
   (badges/progress already had internal contextual watermarks)

---

## Last completed: Browser Reality Audit + Targeted Fixes

### Canonical benchmark pages: tipster / progress / badges

### Audit findings (10 pages inspected):

**Fully migrated — no action needed:**
- home/index.html — intentional command-center hero stats, correct tokens
- feed/index.html — modern layout, PULSE identity correct
- analytics/index.html — correct tokens, sbox font-display vs font-mono acceptable
- leaderboard/index.html — podium + arena clean, COMPETITION ARENA eyebrow added
- hall-of-fame/index.html — marble/cinematic intentional prestige treatment
- compare/index.html — premium gradient hero, dual-color arena correct
- community/index.html — chat layout intentional

**Fixed this session:**

1. **dashboard/index.html** — Missing page identity header. Added `.dash-header` above stats row with eyebrow "POST A PICK" + title "YOUR DASHBOARD". Stat initial values changed from `0`/`0%`/`€0` → `—` (correct skeleton state). Stat card style upgraded: added `::before` top accent bar, changed font from font-display 28px → font-mono 26px bold to match canonical.

2. **notifications/index.html** — Title was `🔔 NOTIFICATIONS` at 42px. Removed emoji, corrected to `clamp(26px,3vw,34px)` matching all canonical page titles. Split word with accent span for visual identity.

3. **settings/index.html** — Local bg-glow override had old color `rgba(124,95,230,0.05)` hardcoded. Removed local override — now inherits from app-components.css canonical shared glow.

### Phase 12 Page Identity Pass (same session):
All 8 target pages received unique atmospheric identity layers. See git diff for details.

---

## Next tasks

1. Deploy to Railway — run autoVerify-schema.sql migration if not yet applied
2. Smoke test: post pick → /admin/grading/run → verify rank_up fires → push notification delivered

---

## Last completed: Sprint 4 Remaining (B4 + B6 + WP-9)

### B4 — Register page cold-start UX parity

**File:** `register/index.html`

Added to match `/login/` flow:
- Wake bar HTML + CSS (amber cold-start indicator with animated fill)
- `showWakeBar()` / `hideWakeBar()` functions
- `fetchWithTimeout()` with 25s `AbortController` timeout
- `AbortError` handler → "Server timeout — try again in a moment"
- Network error handler → "Connection error — check your internet"
- Username regex validation `^[a-zA-Z0-9_]+$` (was missing)
- Validation messages normalized to match `/login/` ("Password min 6 characters", etc.)
- Auth redirect guard now also cleans stale localStorage (JSON parse + id check)

---

### B6 — Push notification toggle wired to real Push API

**File:** `settings/index.html`

- Added `<script src="/push.js"></script>` to settings page
- Changed toggle `onchange` from `savePref('notifications',this.checked)` → `handlePushToggle(this)`
- Added `initPushToggle()` — called in `window.onload`:
  - Calls `Push.init()` to register service worker
  - Sets toggle checked state from `Push.isSubscribed()`
  - Disables toggle + updates sub-text if `!Push.supported()`
  - Disables toggle + updates sub-text if `Notification.permission === 'denied'`
- Added `handlePushToggle(checkbox)`:
  - **Enable path**: disables toggle, shows "Enabling…" in sub-text, calls `Push.subscribe()`, shows success/failure toast; if permission denied → disables toggle permanently with browser hint
  - **Disable path**: calls `Push.unsubscribe()`, saves pref, shows toast

---

### WP-9 — rank_up / rank_change events wired

**Files:** `autoVerify.js`, `backend-ws-events.js`

No schema migration needed — rank computed via subquery at read time.

**`autoVerify.js`** — prevSnapshot query:
```sql
SELECT ur.division, ur.currentStreak, ur.streakType, ur.totalPicks,
  (SELECT COUNT(*)+1 FROM user_rankings u2 WHERE u2.elo > ur.elo) AS rank
FROM user_rankings ur WHERE ur.userId = ? LIMIT 1
```

**`backend-ws-events.js`** — post-grade rows query:
```sql
SELECT ur.currentStreak, ur.streakType, ur.division,
  (SELECT COUNT(*)+1 FROM user_rankings u2 WHERE u2.elo > ur.elo) AS rank
FROM user_rankings ur WHERE ur.username = ? LIMIT 1
```

`rank_up` broadcast fires when `rankNow < prevSnapshot.rank && rankNow <= 20`.
`rank_change` personal unicast fires to pick owner.

---

---

## Last completed: Home loading fix

**File:** `home/index.html`

**Root cause:** Three failure paths in `loadData()` all routed to a catch block that updated only `#communityFeed`. Every other skeleton element (stats row, identity card, rising grid, leaderboard panel, missions, MVP) stayed frozen permanently. Additionally the `/picks` fetch had no `.catch(()=>null)` — unlike the other three fetches in the same `Promise.all` — so any network error rejected the entire group. Railway cold-start causing `/picks` to hang had no timeout, so the page waited indefinitely.

**Changes made:**

1. **Added `_renderDataError()` function** — clears all skeleton sections atomically: stats row, hero stats, identity card fields, division badge, community feed, trending picks, rising grid, mini leaderboard, MVP wrap, matchup section, daily missions. Each section shows `—` or is hidden instead of hanging.

2. **Fixed `loadData()`:**
   - Added `AbortController` with 25s timeout (same pattern as login/register) to prevent infinite wait on cold start
   - Added `.catch(()=>null)` to the `/picks` fetch (was the only one without it in `Promise.all`)
   - Replaced `if(!picksRes.ok)throw` → `if(!picksRes||!picksRes.ok){_renderDataError();return;}`
   - Wrapped `picksRes.json()` in try/catch → `_renderDataError();return` instead of throw
   - Replaced `if(!Array.isArray(all))throw` → `_renderDataError();return`
   - Replaced catch block `communityFeed.innerHTML=...` → `_renderDataError()`

3. **Fixed `loadChatPreview()`:**
   - Replaced `.then(r=>r.json())` chain on rooms fetch with proper null/ok guard
   - Rooms response validated as array before calling `.find()`
   - Messages fetch guarded with null/ok check; `msgs.slice(-3)` replaced with `Array.isArray(msgs)?msgs.slice(-3):[]`

**Before:** `/picks` network error → Promise.all rejects → catch writes "Syncing feed..." to one div → all skeletons frozen forever. Cold start → infinite loading wait.

**After:** `/picks` failure (network, 4xx/5xx, timeout, malformed JSON) → `_renderDataError()` → all sections show `—` within 25s max. Page always terminates loading.

---

## Last completed: B2 + B7 (2026-05-20)

### B2 — Archetypes manually selectable in settings

**Files:** `settings/index.html`, `backend-profile-endpoints.js`

`backend-profile-endpoints.js` — expanded `VALID_ARCHETYPES` to include all current frontend archetype IDs (`hunter`, `storm`, `kingmaker`, `iceblood`, `gambler`, `reaper`, `night-owl`, `shark`, `ghost`, `diamond-mind`, `hybrid`, `contender`) alongside legacy keys. Old IDs were silently rejected before this fix.

`settings/index.html` — added manual archetype override in section 04 (Betting DNA):
- New CSS: `.arch-grid` (3-col, 2-col mobile), `.arch-card` (hover + selected state via `--arch-color`/`--arch-rgb` CSS vars), `.arch-ck` checkmark, `.arch-override-banner`, `.arch-clear-btn`
- `config.manualArchetype: null` — new state field
- `renderArchetypePicker()` — builds a 3-col grid of all 15 archetypes; selected tile gets border in archetype color + glow
- `selectArchOverride(id)` — toggles selection (click again = deselect)
- `clearArchOverride()` — clears to auto-detect
- `_updateArchBanner()` — shows/hides banner with archetype name when override is active
- `fetchOwnProfile()` — reads `data.archetype` → `config.manualArchetype`; calls `renderArchetypePicker()` after fetch
- `postProfile()` — includes `archetype: config.manualArchetype || null` in PUT payload
- Called `renderArchetypePicker()` in `window.onload`

---

### B7 — Void handling UX

**Files:** `dashboard/index.html`, `tipster/index.html`

Both pages already had VOID badge + grey left border on void pick cards. Added explanation note inside the card:

New CSS `.pick-void-note` (both pages): muted grey box, `font-mono` 10px, 8px 12px padding, 8px radius.

Dashboard `renderPicks()` — added after reasoning block:
```
🚫 Pick voided — event was cancelled, postponed, or declared invalid. Stake returned. Not counted in your win/loss record.
```

Tipster `renderPicks()` — same note added before the react-bar.

---

## Next tasks

Phase 3 remaining work:
1. Deploy to Railway — run autoVerify-schema.sql migration if not yet applied
2. Smoke test: post pick → /admin/grading/run → verify rank_up fires → push notification delivered
