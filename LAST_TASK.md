# LAST TASK

Date: 2026-05-23

Current phase: PHASE 3 — Prestige + Monetization Foundation

Current objective: Hamburger nav section headers (EXPLORE / ACCOUNT) ✅ COMPLETE

---

## Last completed: Hamburger nav section headers (2026-05-23)

### Changes — app-nav.js only

All items were already present. Added visual organization into labeled sections:

**EXPLORE section:** Hall of Fame, Compare, Simulator, Analytics, Badges, Sports Intel, Archetypes

**ACCOUNT section:** Settings, Notifications

**Implementation:**
- Added `.an-snl-section` CSS: 9px mono uppercase label, muted color, padding above group
- Added `section: 'explore'` / `section: 'account'` property to all secondary NAV_LINKS
- `_buildHTML` slide renderer now iterates secondary links and inserts section header `<div>` when a new section key is first seen — preserves order from NAV_LINKS array
- Updated icons to match spec: Hall of Fame 🏛️→🏆, Simulator 📈→📊, Analytics 📊→📈, Badges 🏅→🎖️, Archetypes ⚡→🧬

**vercel.json:** All 7 routes verified present — no changes needed.
- /hall-of-fame ✅, /compare ✅, /simulator ✅, /analytics ✅, /badges ✅, /news ✅, /archetypes ✅

### Modified files
- `app-nav.js`

---

## Last completed: Cold start retry / ELO display / progress empty state / settings cosmetics / welcome message (2026-05-23)

### 1. Backend cold start — wakeBackend() added to 6 pages
Pages: home, progress, feed, leaderboard, analytics, tipster
- `async function wakeBackend()` fires a 3s fire-and-forget ping to `API+'/health'` before main data fetch
- AbortController timeout reduced 25s → 15s on all 6 pages
- Timeout error messages updated to "Server waking up — Retry" (with `location.reload()` link)

### 2. Progress "Could not load" → always shows empty state
- Catch block in `loadProgress()` changed from injecting error HTML → calling `renderAll([], null, 0, 0, null, [], [])`
- Empty state already supported by `buildHTML()` when `picks.length === 0`

### 3. ELO display fix — subtract 1000 from backend ELO everywhere
Backend stores ELO with 1000 baseline. Display formula: `Math.max(0, (backendElo||1000) - 1000)`
- `progress/index.html` lines 320/327: both `elo` and `actualElo` now adjusted
- `progress/index.html` `computeEloFromDivScore`: changed to 0-based (`(divScore/100)*3000` — removed +1000)
- `tipster/index.html` line 1244 stat panel: `rankingMeta.elo` → `Math.max(0,(rankingMeta.elo||1000)-1000)`
- `tipster/index.html` line 1252 elo-box: same adjustment
- `tipster/index.html` `getELOLabel`: thresholds shifted from 1400/1200/1100/1000/900 → 400/200/100/0 (0-based)
- `tipster/index.html` ELO tooltip text updated: "Starting ELO is 0. Above 100 is advanced."
- `home/index.html` mini-leaderboard ELO badge: `t.elo||'—'` → `t.elo!=null?Math.max(0,t.elo-1000):'—'`

### 4. Settings cosmetics section empty (snAv/snName null crash)
- Root cause: `document.getElementById('snAv').textContent=...` called on element from old nav (no longer exists)
- Fix: null-guarded both `snAv` and `snName` accesses, unblocking entire `window.onload` and all cosmetics renders

### 5. Home contextual greeting
- `updateGreeting()` function added, called at end of `loadData()` try block after `window._myRankingMeta` is populated
- Logic: rank===1 → "👑 USERNAME · #1 IN THE WORLD"; streak≥5 → "🔥 USERNAME · W{N} STREAK"; streak≥3 → "🔥 USERNAME · ON A ROLL"; else → time-of-day greeting (unchanged initial value set in window.onload)

### Modified files
- `home/index.html`
- `progress/index.html`
- `feed/index.html`
- `leaderboard/index.html`
- `analytics/index.html`
- `tipster/index.html`
- `settings/index.html`

---

## Last completed: Render chain stabilization + null data crash fixes (2026-05-23)

### Root cause
Backend `picks` response returns `username` as a flat top-level field. Some picks in the DB have `username=null` (orphaned or legacy rows). Frontend render functions that accessed `p.username` without a guard, or called `.slice()` on the value directly, threw TypeError which propagated to catch blocks showing "Could not load" / "—" across feed and home.

### 1. feed/index.html — Pulse "Could not load" fix

**Root cause confirmed:** `buildActRow(ev)` called `ev.user.slice(0,2)` — crashes when `ev.user=null`. Upstream `computeEvents()` win and pending filters had no `&&p.username` guard so null-username picks flowed into events.

**Fixes:**
- `allPicks.filter(p=>p.result==='win')` → `allPicks.filter(p=>p.result==='win'&&p.username)`
- `allPicks.filter(p=>p.result==='pending'&&...)` → added `&&p.username`
- `ev.user.slice(0,2)` → `(ev.user||'??').slice(0,2)` + `avColor(ev.user||'')`

### 2. home/index.html — Full render chain guard pass

**Render chain verified end-to-end:** `loadData()` → `renderStats()` → `renderProfileCard()` → `renderMatchup()` → `renderTrendingPicks()` → `renderFeed()` → `renderLeaderboard()` → `renderActivityTicker()` → `renderBrainRow()` → `renderSpotlight()`

**Fields confirmed safe:** `username`, `avatar`, `currentStreak` (`rm&&rm.streakType==='win'?rm.currentStreak:streak`), `rank` (`rm&&rm.rank?rm.rank:rank`), `ROI` (`stake>0?...:'0'`), `todayStats` (not consumed in home chain).

**Fixes — renderActivityTicker:**
- Win filter: `settled.filter(p=>p.result==='win')` → `&&p.username`
- Pending filter: `all.filter(p=>(!p.result||p.result==='pending')&&...)` → added leading `&&p.username`
- byUser builder: added `if(!p.username)return` guard

**Fixes — renderSpotlight:**
- `'@'+bw.username` → `'@'+(bw.username||'—')`
- `'@'+bO.username` → `'@'+(bO.username||'—')`

### Modified files
- `feed/index.html`
- `home/index.html`

### Known risks
None — all changes are defensive guards only. No behavior change for picks with a valid username.

---

## Last completed: Division Demotion System + Pyramid Division Icons (2026-05-22)

### 1. progress/index.html — Live Division Score + Demotion Warning

**Division score computed live** (ROI 40% + WR 30% + Volume 20% + Picks 10%) — same formula as backend.

**Demotion banner** injected below hero card:
- `at-risk` (red): when score < threshold + 8 and division is not BRONZE
- `safe` (green): division secure, shows +N pts above threshold
- Shows exact score vs threshold (e.g. "42 / 50")
- BRONZE excluded (floor division, no demotion possible)

**Division history** in season widget:
- Now fetches `/rankings/:USERNAME/history` in `loadProgress()`
- Detects division changes across weekly snapshots
- Shows `↑ Promoted` / `↓ Demoted` with from→to and week label
- Last 5 changes shown, most recent first

---

### 2. animations.js — divisionDownAnimation()

New function `window.divisionDownAnimation(newDivName)`:
- Dark overlay (rgba 0.88, less dramatic than promotion)
- Red accented: "DIVISION DROPPED" in #ff3355
- Shows new division name
- "Fight back →" CTA to `/dashboard`
- Auto-dismiss after 4s, tap to dismiss early

CSS: `.la-divdown-overlay`, `.la-divdown-card`, `.la-divdown-headline`, `.la-divdown-cta`

---

### 3. home/index.html — WS Event Handlers

**division_up updated**: now checks `ev.targetUserId === user.id`:
- Own promotion → fires `rankUpAnimation()` ceremony directly
- Other users' promotions → adds to ticker (unchanged)

**division_down added**: `LedgrWS.on('division_down', ...)`:
- Only fires for own demotion (`ev.targetUserId === user.id`)
- Calls `window.divisionDownAnimation(p.toDivision)`

---

### 4. backend-rankings-engine.js — Division Demotion Detection

`recalcUserRankings(db, userId, opts)` — added optional third parameter:
- Reads `prevDivision` from `user_rankings` before the upsert
- After upsert: if `DIVISION_ORDER.indexOf(newDiv) < DIVISION_ORDER.indexOf(prevDiv)`, emits demotion event
- Event: `{ type:'division_down', targetUserId, username, payload:{ fromDivision, toDivision } }`
- Calls `opts.broadcast(event)` if provided — no breaking change to existing callers
- `DIVISION_ORDER` constant added at module level

---

### 5. divisions.js — Pyramid Icon System

**CSS (injected via `injectCSS()`):**
- `.dv-pyr` base class: CSS `mask`/`-webkit-mask` using `/assets/logo/ledgr-icon.png`
- Sizes: `.dv-pyr-sm` (10px), `.dv-pyr-md` (13px), `.dv-pyr-lg` (16px), `.dv-pyr-xl` (22px)
- Per-division color: `.dv-pyr-bronze` #CD7F32, `.dv-pyr-silver` #C0C0C0, `.dv-pyr-gold` #FFD700, `.dv-pyr-platinum` #4FC3F7
- `.dv-pyr-diamond`: #00E5FF + `filter: drop-shadow(0 0 4px cyan)`
- `.dv-pyr-elite`: #7B2CFF + `filter: drop-shadow(0 0 5px purple)`
- `.dv-pyr-legendary`: #FFD700 + `animation: dv-pyr-rainbow 2.5s` (hue-rotate 0→360°)

**Functions:**
- `Divisions.pyramidHTML(divDef, size)` — new public function, returns masked pyramid span
- `pillHTML()` updated to include pyramid icon before division name text

---

## Last completed: Sprint 12 — Visual Upgrade (2026-05-22)

### 1. home/index.html — Elite Identity Card Hero

**Layout:** `hero-layout` changed from 2-column (1fr + 320px) to full-width (1fr). Left `.hero` div hidden (all IDs preserved for JS compat). `.hero-identity` now spans full width.

**Identity card restructure:**
- `id-div-banner` (3px colored top stripe, color set by JS based on division: Bronze/Silver/Gold/Platinum/Diamond/ELITE/Legendary gradients)
- `id-card-main`: horizontal grid (avatar left + stats right)
- Avatar (`id-av`): 80px × 80px, border-radius 18px, purple glow shadow
- Username (`id-name`): Bebas Neue 32px, letter-spacing 3px
- Division badge (`id-division`): animated pulse (divBadgePulse keyframe)
- `id-info` group: eyebrow + username + division badge stacked
- Stats row (4-col, DM Mono): Sharp Score | ROI | Rank | Streak — label below value, JetBrains Mono, clamp(16px,2vw,26px)
- `idRel` element kept hidden (div style=display:none) for JS compat
- ROI curve graph hidden (`display:none`) — removed clutter
- Rank bar kept below main body
- Watermark: `::after` pseudo-element on `id-card-main` → "▲" at 260px, opacity 0.04

**New JS in `renderIdentityPanel`:**
- Populates `idSharpScore` from `window._myRankingMeta.sharpScore` (fallback: 0)
- Sets `idDivBanner` background gradient based on `div.name`
- Sharp score color: green ≥70, purple ≥40, default neutral

**Missions + Season cards:** wrapped in `hero-cards-row` (2-col grid on desktop, 1-col mobile)

**Responsive:** at ≤960px: id-card-main → 1 column (avatar + info stacked, stats below). Stats stay 4-col until ≤700px → 2-col.

---

### 2. leaderboard/index.html — Header + Podium Upgrade

**Title:** `.lb-title` font-size upgraded from `clamp(26px,3vw,34px)` to `clamp(44px,6vw,80px)`, letter-spacing 5px, line-height 0.9. Span (BOARD) keeps `color:var(--ac)` with added text-shadow glow.

**Podium avatars:** `width:52 → 72px`, `height:52 → 72px` in both `Divisions.avHTML()` call and fallback div. Container `width:52 → 72`.

**Podium animations:** replaced existing `pod-in` spring with stronger `podEntrance` keyframe (more travel, more spring). Delays: p2=0.1s, p1=0.25s, p3=0.4s (staggered).

---

### 3. feed/index.html — Header + Feed Card Upgrade

**Eyebrow:** `.pm-eye` text changed from "LEDGR INTELLIGENCE" → "LIVE ACTIVITY"

**Feed card event coloring** (via JS class on act-row):
- `act-win`: green left border (2px var(--gr)) + subtle green background
- `act-bigwin`: brighter green glow treatment
- `act-streak`: orange left border + orange background tint
- `act-underdog`: gold left border + gold tint
- Others: transparent border (no visual noise)

**JS change:** `buildActRow()` now computes `_rowCls` from `ev.type` and adds it to the act-row div.

---

## Last completed: Sprint 11 — Nav Restructure (2026-05-22)

### app-nav.js changes

**Desktop bar order:** Home | Leaderboard | Progress | Feed | Community | Profile

**Removed from desktop bar:** Analytics, Post Pick (dashboard)

**Profile link:** Dynamic — reads `ledgr_user` from localStorage, href = `/tipster?u=USERNAME`. Hidden when logged out. Uses new `dynamicUser: true` flag in NAV_LINKS config.

**Slide menu (hamburger):**
Analytics | Compare | Simulator | Hall of Fame | Badges | Sports Intel | Archetypes | Settings | Notifications
(Primary nav links — Home/Leaderboard/Progress/Feed/Community/Profile — also appear in slide for mobile)
Bottom CTA: "POST A PICK → /dashboard" (unchanged)

**Feed label:** "PULSE" → "Feed"

**_buildHTML updated:**
- Desktop link renderer handles `dynamicUser: true` (skips if logged out, computes href from username)
- Slide link renderer extracted to `_slideLink()` helper (used for both primary + secondary sections)
- Primary section: Home, Leaderboard, Progress, Feed, Community, Profile
- Secondary section: Analytics, Compare, Simulator, Hall of Fame, Badges, News, Archetypes, Settings, Notifications

### Vercel routing verification
- `/hall-of-fame` → `/hall-of-fame/index.html` ✅ already present
- `/compare` → `/compare/index.html` ✅ already present
- `/simulator` → `/simulator/index.html` ✅ already present
- No changes needed to vercel.json

---

## Last completed: Sprint 10 — Analytics Fix + ELO Baseline + Ranking Verification ✅ COMPLETE

---

## Last completed: Sprint 10 — Analytics Fix + ELO Baseline + Ranking Verification (2026-05-22)

### 1. analytics/index.html — Loading fix

**Root cause (two bugs):**
- `fetch(API+'/picks', ...)` — global feed, no `?userId`, no auth. After visibility feature, global feed returns PUBLIC picks only.
- `all.filter(p=>p.user&&p.user.username===targetUser)` — wrong field path. Backend returns `p.username`, not `p.user.username`. `allPicks` was always empty.

**Fix:**
- Own analytics: `fetch(API+'/picks?userId='+user.id, { Authorization: 'Bearer '+tk })`
- `?u=username` URL param: first fetch `/rankings/<username>` to get `userId`, then `fetch(API+'/picks?userId='+tipsterUserId)`
- Removed client-side filter — server now returns only the right user's picks
- `allPicks = Array.isArray(picksRaw) ? picksRaw.sort(...) : []`
- `renderStats()` param removed (function already uses module-level `allPicks`)

### 2. ELO baseline — 1000 → 0 (frontend display only)

**Changed files (frontend starting values only, no formula changes):**
- `home/index.html`: `getELO()` — `let elo=1000` → `let elo=0`
- `tipster/index.html`: `getELOFromPicks()` — `const BASE=1000` → `const BASE=0`
- `leaderboard/index.html`:
  - Fallback in `buildTipsterMap()`: `1000` → `0`
  - Podium: `t.elo||1000` → `t.elo!=null?t.elo:0` (null-safe, handles ELO=0 correctly)
  - Table `eloClass`: `(t.elo||1000)` → `_elo = t.elo!=null?t.elo:0` (extracted variable)
  - Table ELO badge: `t.elo||1000` → `_elo`
- `progress/index.html`: Fixed falsy-0 guard — `rankingMeta.elo ? elo : fallback` → `rankingMeta.elo != null ? elo : fallback` (ELO=0 was being treated as missing)

### 3. Premium picks ranking verification

**Result: already correct — no changes needed.**
- `backend-rankings-engine.js` `recalcUserRankings` queries picks with no visibility filter
- `autoVerify.js` grading also has no visibility filter
- Both PUBLIC and PREMIUM picks count toward: ELO, wins/losses, ROI, streak, division score
- Only pick CONTENT (market, odds, stake, reasoning) is hidden from non-subscribers

---

## Last completed: Sprint 9 — Final Verification Pass (2026-05-22)

### Static Audit — 8 pages inspected
Pages: index.html, login, register, dashboard, tipster, progress, leaderboard, home

**Findings — all clear:**
- No localhost/127.0.0.1 references anywhere
- All 28 referenced JS files exist on disk (including new untracked: insights.js, moments.js, motion.js, social.js)
- All CSS files exist: app-tokens.css, app-components.css, brand.css
- All pages have favicon + og:image set to production URL
- API URL is correct production backend across all pages
- No duplicate script imports

### Vercel routing
- `/archetypes` — already present ✅
- `/tools` — no directory exists, no route added

### OG image
- `assets/logo/ledgr-logo.png` — EXISTS, no generator needed ✅

---

## Production ready
- All sprint 5–9 changes committed and pushed
- Private/public picks (visibility feature) — fully shipped
- Progress page empty state — fully renders for 0-picks users
- Pre-launch polish — 404, terms, privacy, become-a-tipster, index.html all updated
- Logo integration — all 26 pages have favicon + og:image
- No localhost refs, no missing assets, no broken script refs

## Manual actions remaining
1. **Railway smoke test**: post pick → `/admin/grading/run` → verify `rank_up` event fires → push notification delivered
2. **Verify autoVerify-schema.sql applied**: confirm `autoVerify_log` table exists on Railway DB
3. **Stripe webhook**: test subscription purchase flow end-to-end (subscribe/success, subscribe/cancel pages)

---

## Last completed: Sprint 8 — Pre-Launch Polish (2026-05-22)

### Changes

**terms/index.html + privacy/index.html**
- `--ac:#e8ff00` → `--ac:#b89fff` (removed legacy neon-yellow accent, canonical soft purple)

**404.html**
- `--bg:#07060d` → `--bg:#0A0A0A` (canonical black background)
- Logo: text "LEDG<span>R</span>" → `<img src="/assets/logo/ledgr-logo.png" height:28px opacity:0.55>` (centered image logo)
- `.logo` CSS stripped to `display:block;margin-bottom:48px;line-height:0` (font properties removed)

**become-a-tipster/index.html**
- Benefit card 3: "EARN MONTHLY" → "MONETIZE YOUR RECORD"
- Founding perk 2 label: "Founding Badge" → "Founding Member Badge"
- Founding perk 3 value: "Top" → "6mo"; desc: added "for 6 months"
- body: added `overflow-x:hidden` (mobile scroll fix)

**index.html (landing page)**
- Background flash fix: `<style>html{background:#0a0a0a}</style>` added before external stylesheets
- Auth redirect: replaced instant token-check redirect with async session validation — calls `GET /profile` with Bearer token; only redirects on 200 OK; clears stale localStorage on 4xx; silently ignores network errors
- `loadData()`: added `AbortController` with 6s timeout; changed URL to `?limit=3`; on failure hides `.tipsters-section` silently (no error message shown)
- Trust section text already correct: "Picks Verified Automatically", "Records Cannot Be Edited", "Real Closing Line Value" ✅
- Top tipsters cards already show username, ROI, division badge, `/tipster?u=USERNAME` link ✅

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
