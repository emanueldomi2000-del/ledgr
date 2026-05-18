# LEDGR EXPERIENCE REBUILD
## Phase 2 Audit — Full Product Experience Analysis

Date: 2026-05-18  
Status: Audit only — no code changes  
Scope: All 15 pages, 10 issue categories  

---

## SEVERITY SCALE

| Score | Meaning |
|-------|---------|
| 9–10 | Breaks user trust or core flow. Block on shipping. |
| 7–8 | Significantly damages retention or conversion. Fix in Phase 2. |
| 5–6 | Noticeable friction. Fix in Phase 3. |
| 3–4 | Polish. Fix when touching the page for another reason. |
| 1–2 | Cosmetic. Background task. |

---

## EXECUTIVE SUMMARY

LEDGR has excellent bones — the backend trust chain works, the data model is sound, and several pages (leaderboard, feed, compare) have strong visual polish. The core problem is **design system fragmentation at scale**: navigating from home to tipster to progress and back feels like using three different products. This is not a minor inconsistency — it actively undercuts the trust signal LEDGR is built around. A platform promising verified records cannot feel unverified in its own UI.

The second major gap is **missing prestige moments**: division advancement, first pick, win streaks, badge unlocks, and milestone picks all exist in the backend but are either invisible to users or delivered as quiet notification cards. The product has no ceremony.

Third: **monetization touchpoints are too deep in the funnel**. The only subscribe CTA is on the tipster profile page. Users viewing leaderboard rows, feed events, or rising cards have no path to subscription without navigating through 2 more pages.

---

## 1. VISUAL INCONSISTENCIES

### 1.1 Design System Fragmentation — SEVERITY 9

Five distinct CSS environments across 15 pages:

| Group | Pages | Background | Accent | Fonts |
|-------|-------|-----------|--------|-------|
| A — Landing | index.html | `#0A0A0A` via brand.css | `#7B2CFF` | Rajdhani / Barlow / JetBrains Mono |
| B — Core App | home, leaderboard, dashboard, feed, notifications, community | `#07060d` via app-tokens.css | `#b89fff` | Bebas Neue / Syne / DM Mono |
| C — Cross-contaminated | tipster, progress, badges | `#0A0A0A` inline | `#7B2CFF` | Rajdhani / Barlow / JetBrains Mono |
| D — Hall of Fame | hall-of-fame | `#050408` inline | `#b89fff` | Bebas Neue / Syne / DM Mono (custom marble variant) |
| E — Tools | compare, simulator, news, settings | `#07060d` inline | `#b89fff` | Bebas Neue / Syne / DM Mono (copy-pasted, no app-tokens.css) |

**User impact:** Moving from home (Bebas/Syne, soft lavender) to tipster (Rajdhani/Barlow, vivid purple) to progress (same as tipster) to leaderboard (back to Bebas/Syne) is visually incoherent. The product does not feel like a single system.

**Root cause:** Tipster, progress, and badges were built using the landing page design system instead of the app design system. They predate app-tokens.css.

### 1.2 Accent Color Split — SEVERITY 8

Two accent colors are used as if interchangeable:
- `#b89fff` — soft lavender, decorative, used in System B/D/E
- `#7B2CFF` — vivid saturated purple, used in System A/C

These are not variants of the same color — they read as different brands at a glance. The split is most jarring in navigation: the active link on a `#b89fff` page glows lavender; switch to tipster and it's vivid purple.

**Recommended unification:** Adopt `#b89fff` as the primary accent for all app pages (it's already on the majority of pages and reads better at small text sizes). Reserve `#7B2CFF` for primary CTA buttons only (post, subscribe, follow), where the saturation punch is desirable.

### 1.3 Nav Height and Border Micro-inconsistency — SEVERITY 4

Pages measured:
- app-nav.js pages: 60px
- hall-of-fame: 60px, `border-bottom: rgba(184,159,255,.12)` 
- compare/simulator/news: 60px, `border-bottom: var(--bd)` = `rgba(184,159,255,.1)`
- badges: 60px, `border-bottom: var(--bd)` = `#2A2A2A` (solid, opaque)
- progress: no nav

The 2px border opacity difference is invisible individually but causes the nav to "change" between pages. The badges page border is a stark `#2A2A2A` against a `#0A0A0A` background — much heavier than the rest of the product.

### 1.4 Typography on Section Headers — SEVERITY 5

Section header patterns vary across pages:
- Core app (home, leaderboard): `Bebas Neue` for large section headers
- Tools (compare, simulator): `Bebas Neue` for large hero type — OK
- Progress: `Rajdhani` everywhere including section headers — doesn't match
- Badges: `Rajdhani` section headers alongside `JetBrains Mono` data cells
- Notifications: `Bebas Neue` for the page title, `DM Mono` for sub-labels — correct

Body text also varies: Syne on System B/E, Barlow on System A/C.

---

## 2. NAVIGATION PROBLEMS

### 2.1 Four Different Nav Implementations — SEVERITY 8

| Nav type | Pages |
|----------|-------|
| `app-nav.js` IIFE (unified) | home, leaderboard, dashboard, feed, notifications, community |
| Custom inline + slide nav | settings |
| Copy-paste slide nav (identical HTML, separate per file) | compare, simulator, news, hall-of-fame |
| `badges-top-nav` (custom inline, Rajdhani) | badges |
| No nav | progress |

The copy-paste pattern across compare/simulator/news/hall-of-fame means each file has ~80 lines of duplicate nav HTML. One change must be made 4+ times. Progress has **no nav at all** — users are stranded and must use the browser back button.

### 2.2 Slide Nav Link List Is Inconsistent — SEVERITY 8

Each slide nav copy contains a hardcoded link list. Audit shows divergence:
- Compare includes Analytics, some others don't
- Post a Pick CTA present on some, absent on others
- Icon set varies (emoji vs text label vs no icon)

A user who relies on the hamburger menu gets a different set of options depending on which page they're currently on.

### 2.3 Core Action (Post a Pick) Not Consistently Reachable — SEVERITY 7

"Post a Pick" (dashboard) is the most important action in the product. Audit:
- Present in slide nav on: compare, simulator — as a highlighted CTA button
- Present in slide nav on: news, hall-of-fame — same CTA
- Present via app-nav.js on: home, leaderboard, feed, notifications, community — visible in desktop nav
- Missing from: badges, progress (no nav)
- Dashboard page itself doesn't link back out in the nav body

### 2.4 No Active State in Slide Nav — SEVERITY 6

Desktop nav (app-nav.js) correctly marks the active page. Slide/mobile nav does not. If a user opens the hamburger on the compare page, no link is highlighted as current. Users lose positional awareness.

### 2.5 No Breadcrumb From Tipster Back to Leaderboard — SEVERITY 5

Typical flow: Leaderboard → click tipster row → Tipster profile. The tipster profile has no "← Back to Leaderboard" or even a "Leaderboard" link visible on the page. Users must hit browser back. On mobile this is a back button — fine. On desktop it's awkward.

### 2.6 Progress Has No Navigation — SEVERITY 7

Progress page (`progress/index.html`) has zero navigation — no nav bar, no back link, no logo link. Users who navigate directly to `/progress/` are stranded. This is especially bad because progress is linked from the home page stats section.

---

## 3. WEAK PAGE HIERARCHY

### 3.1 Dashboard Doesn't Feel Like the Core Action — SEVERITY 7

"Post a Pick" is the founding act of a LEDGR tipster record. The dashboard is visually a form with a sidebar — functional, but it doesn't convey that this is a significant moment. The page title is just "Post a Pick" in standard Bebas Neue. There is no framing of stakes, record permanence, or prestige. Compare: a betting platform makes placing a bet feel like an event. Posting a pick should feel like stepping up.

### 3.2 Home Page Lacks a Clear Primary Focus — SEVERITY 6

Home page sections: hero tagline, ticker (thin), 4-stat grid (ROI/streak/division/ELO), rising tipsters cards, MVP strip, hot bar. This is your own dashboard, other people's content, and a marketing pitch all in one. Returning tipsters want their stats front and center. New visitors want to understand the product. These are different pages served by the same URL.

Recommendation: Split conceptually — if authenticated, home is "my record at a glance" (your stats, your picks, your rank movement). Rising tipsters becomes a secondary section.

### 3.3 Tipster Page Is the Public-Facing Showcase But Is Cross-Contaminated — SEVERITY 8

Every shared link, every social card, every "follow this tipster" discovery moment lands on `/tipster/`. This is the product's most externally visible page. It currently runs on System C (Rajdhani/Barlow, vivid purple, `#0A0A0A`) instead of the app design system. When someone sees a LEDGR tweet and clicks through, the page they land on doesn't match what long-time users experience. The division banner visuals are excellent — they just need to be wrapped in the right system.

### 3.4 Leaderboard Is Very Strong — SEVERITY 1

Leaderboard is one of the best pages. System B, app-tokens.css, excellent FACEIT-style period tabs, sport filters, live bar, season banner. No significant hierarchy issues.

### 3.5 Hall of Fame Is Visually Beautiful But Nobody Finds It — SEVERITY 7

HoF has the best atmospheric styling in the product: marble body CSS, cinematic light shafts, gold/purple color story. But it's not in the desktop nav. It appears only in the slide nav hamburger. A new user has no path to it. On a young platform, HoF with no data reads as "Hall of Fame: coming soon" — dead.

### 3.6 Analytics Page Unknown — SEVERITY 5 (assumed)

Analytics was listed in the project inventory but was not directly audited here. Given the pattern, it likely has either System B or a copy-paste nav. It is not in the desktop nav on most pages. Deep analytics being hidden kills its ability to drive tipster engagement.

---

## 4. PAGES WITH OVERLAPPING PURPOSES

### 4.1 Home vs Tipster (Your Own Profile) — SEVERITY 6

| Page | What it shows for self |
|------|----------------------|
| Home | Stats grid (ROI, streak, division, ELO), rising cards, hot bar |
| Tipster | Full pick history, ROI chart, win rate, archetype, badge showcase, social links |

There is no dedicated "My Profile" page. Home approximates it but is not it. When a logged-in tipster wants to see their full record, they must navigate to `/tipster/?id=THEIR_ID` — a URL most users don't know. Resolution: Home should have a prominent "My Full Profile" CTA that links to the tipster page with the user's own ID.

### 4.2 Leaderboard vs Hall of Fame — SEVERITY 4

Distinction is meaningful (live rankings vs immortalised records) but the value of HoF is not apparent on a young platform. Could merge HoF as a tab on the leaderboard page ("All-Time" tab) rather than a separate page.

### 4.3 Home vs Feed — SEVERITY 4

Home ticker and rising cards give a snapshot of activity. Feed is the full real-time stream. Both answer "what's happening." These are appropriate as separate pages (home = personal dashboard with activity preview, feed = dedicated community stream). Not a blocker, but the ticker on home should link to the feed.

### 4.4 Badges vs Progress — SEVERITY 5

Progress shows division progression, ELO bars, rank history. Badges shows achievement collection. Both are personal progression surfaces. A natural merge: Progress becomes "My Journey" with divisions at top and badge vault below. Currently they're separate destinations with no cross-links.

### 4.5 Tipster vs Analytics (Self View) — SEVERITY 5

When viewing your own tipster page, you see: stats grid, ROI, win rate, pick history. Analytics (if you navigate to it) shows: deep ROI curves, CLV, variance, sharp score. For the tipster viewing themselves, 60% of this overlaps. Analytics should be a tab or section on the tipster self-view, not a standalone page.

---

## 5. WEAK MOBILE UX

### 5.1 Dashboard Pick Form Is a Hard 2-Column Grid — SEVERITY 8

`grid-template-columns: 1fr 380px` at the main panel level. On screens narrower than ~860px, the 380px sidebar squashes the primary form. Posting a pick is the core action and the mobile experience is likely broken or severely degraded.

### 5.2 Community Chat Has a Fixed 230px Sidebar — SEVERITY 7

Chat layout: `width:230px` sidebar + flex-1 main. No `@media` breakpoint detected in the first 80 lines. On a 375px phone: 230px sidebar + 145px chat = unusable chat input. Users on mobile see a chat they can barely type in.

### 5.3 Compare Hero Type Even With Clamp Is Too Large — SEVERITY 6

`clamp(64px, 10vw, 120px)` — at 375px viewport this is 64px. The word "VS" is animated in gold. Two tipster names in 64px+ type on a 375px screen may be 2-3 characters before overflow or wrapping. The "versus" framing is a strength on desktop but may be broken on mobile.

### 5.4 Leaderboard 4-Column Stat Bar — SEVERITY 6

`grid-template-columns: repeat(4,1fr)` in `.live-bar`. At 375px each cell is ~85px — feasible but tight. The 26px Bebas Neue values plus DM Mono labels at 8px may still compress OK, but needs testing.

### 5.5 Feed Filter Tabs Wrap Aggressively — SEVERITY 4

Feed has 5-6 filter pill buttons. `flex-wrap:wrap` is set, which is correct, but wrapped filter pills take 2 rows and push the feed cards down significantly on narrow screens. A horizontally scrolling single-row would be more mobile-native.

### 5.6 Badges Hero Has Animated Background Emoji Scaled to 200px — SEVERITY 4

`.hero-bg-badge { font-size:200px; transform:scale(6) }` — this creates a 1200px emoji element in the background of the hero. On mobile it may cause jank during scroll or paint.

---

## 6. DEAD / EMPTY SECTIONS

### 6.1 News Page Has No Fallback Content — SEVERITY 8

News is described as "live news, injury tracker, lineup reports" — external API-dependent. If the API key isn't set, the news feed renders empty or errors. Currently there is no static fallback or "check back soon" state that maintains brand integrity. An empty news page reads as broken.

**Required:** Add skeleton states and a graceful fallback message with styling consistent with the brand.

### 6.2 Hall of Fame Requires Accumulated Season Data — SEVERITY 7

HoF shows "season champions" and "all-time records." On a newly launched platform, both of these will be empty or need seeding. If both are empty, the page looks abandoned. If one season has completed, the champion can be featured — but HoF landing with no data reads as "under construction."

**Required:** Add a "Season 1 in progress" state that counts down to season end, or seed with founding member records as a hype moment.

### 6.3 Home Rising Cards Require Active Tipsters — SEVERITY 6

The "rising tipsters" 3-card section on home is populated from live backend data. If fewer than 3 tipsters are active, cards show blank avatars or the section collapses. On a young platform, this is the most likely page section to look empty.

**Required:** Either always populate from actual top-3 or hide the section if fewer than 3 tipsters have recent picks.

### 6.4 Community Chat — Zero Online State — SEVERITY 6

When no one is online, the sidebar shows "0 online" and the chat is silent. For a new user's first visit, this could be the first impression of the community. A silent chat room signals a dead product.

**Required:** Add a "Be the first to say something" state, or pin a welcome message from the LEDGR account.

### 6.5 Feed Empty State Zeroes Out the Stat Strip — SEVERITY 5

The feed stat strip shows 4 counters (wins today, streaks, underdogs, avg odds). On a fresh platform these all show 0. The page technically has an empty state message but the zeroed stats above it reinforce the emptiness.

---

## 7. MISSING PRESTIGE MOMENTS

### 7.1 Division Advancement Has No Guaranteed Delivery — SEVERITY 9

`animations.js` has a rank-up overlay — full-screen, Bebas Neue large type, glow orb, particle burst. It only fires if the user is on a page that receives the `division_up` WS event at the moment of advancement. If they're offline, sleeping, or on a page without a WS connection: nothing. The backend emits it to followers but there's no replay mechanism. A user advances from Silver to Gold and never sees the moment.

**Required:** Store the rank-up event. On next login, replay the animation. Add a permanent "Reached Gold on [date]" marker visible on the profile.

### 7.2 First Pick Has No Special Treatment — SEVERITY 8

Posting the first pick on LEDGR is the founding act of a tipster's verified record. It currently just adds to the picks list. No ceremony, no framing, no memorable moment. Users who feel nothing at their first pick have less attachment to their record.

**Required:** Detect `totalPicks === 1` after submission. Show a short overlay: "Pick 1 of your verified LEDGR record. From this moment on, every pick is permanent." Link it to share.

### 7.3 Win Streak Milestones Are Silent — SEVERITY 7

Backend emits `streak_milestone` WS events and writes a notification card. The frontend has no visual moment on the page where the user is most likely to be (home or dashboard) when they hit the streak. The notification sits in the notification center — a page most users check occasionally, not constantly.

**Required:** When a streak milestone fires, display an in-page toast on home/dashboard (not just a notification card). "5-game win streak — you're on fire."

### 7.4 Reaching 100 Picks Has No Monument — SEVERITY 6

100 picks is a significant credibility threshold. No marker, no badge shown prominently, no moment. The badge system likely unlocks a badge at 100 picks, but badge unlocks are themselves silent (see 7.5).

### 7.5 Badge Unlocks Are Invisible Outside the Badges Page — SEVERITY 6

`badges-system.js` has an animated unlock overlay panel. It only renders if the user is on `/badges/`. If they earn a badge while on any other page, nothing happens. The notification card eventually appears, but there's no in-context moment.

**Required:** Badge unlock toast should fire on all pages, not just `/badges/`. The overlay itself is fine — it just needs to be loaded on all app pages.

---

## 8. MISSING DELIGHT MOMENTS

### 8.1 No Live "Your Pick Won" Flash — SEVERITY 8

When the grading cron settles a pick as a win, the user gets a notification card. There is no:
- In-page toast: "BOOOOM — [Team] won. Pick graded: WIN ✓"
- ROI counter animation on home stats grid
- Visual pulse on the win stat

For a product about verified records, the moment of verification should feel like something.

**Required:** WS event `pick_graded` fires on settlement. When it fires for the logged-in user and `result === 'win'`, show a brief but impactful toast. Existing flash animation infrastructure in feed.js can be adapted.

### 8.2 Streak Active State Has No Live Indicator — SEVERITY 7

If a user is on a 5-game streak, their home page shows a small "5" in the streak stat cell. There is no "STREAK ACTIVE — 5W" badge or glowing indicator that conveys urgency and momentum. The streak is the product's most emotionally resonant stat and is treated like any other number.

**Required:** Add a streak pulse chip to the home hero area. If streak >= 3: show orange glow chip with the streak count. Existing `flow.js` already computes this — surface it more visibly.

### 8.3 No Follower Join Moment — SEVERITY 5

When someone follows you, you get a notification card. There's no counter animation on your follower count, no brief pulse on the home page. Social proof accumulation should feel rewarding.

### 8.4 Profile Card "Share My Record" Is Buried — SEVERITY 5

`share.js` draws a verified pick card to canvas for sharing. This exists on the pick detail view. Most tipsters want to share their overall record ("I'm +18 ROI on 47 picks"). There's no "Share My Record" button on the home or tipster page. This is a free acquisition channel being unused.

**Required:** Add a "Share Record" button to home stats section that draws a summary card: username, division ring, ROI, win rate, pick count.

### 8.5 Leaderboard Rank Movement Has No Delta — SEVERITY 6

Leaderboard shows current position. No "↑3 since last week" or "↓2 today" delta. This is one of the most emotionally engaging pieces of data in any competitive product. The `ranking_history` table already stores weekly snapshots — this data exists.

---

## 9. RETENTION OPPORTUNITIES

### 9.1 Streak Counter Is Not Hero-Level on Home — SEVERITY 8

The win streak counter exists in the home stats grid but is one of four equal-weight cells. A streak is a retention hook — users return to maintain it. It should be the most prominent element on the home page when a streak is active: a glowing pill in the hero area, not a stat cell.

### 9.2 No "Suggested Tipsters to Follow" Flow — SEVERITY 7

After viewing the leaderboard, there is no discovery nudge. "Users who follow Gold-tier tipsters get 3x return visits." There's no "Top Picks This Week" or "Rising Stars" section that converts leaderboard browsers into followers.

**Required:** Add a "Follow Recommendations" section to the home page (for logged-in users with 0 follows): top 3 tipsters by ROI with a one-click follow button.

### 9.3 Notification Center Has No Action CTAs — SEVERITY 6

Notification: "Tipster X posted a pick on Arsenal vs Chelsea." No inline "View Pick" button. User must navigate to tipster profile → find the pick. Three pages of navigation when the notification could include a direct link.

**Required:** Parse notification payload to include a direct link. All `new_pick` notifications should have a "View Pick →" CTA that jumps to `/dashboard/?pickId=X` or the pick detail.

### 9.4 No Weekly Performance Recap — SEVERITY 7

No "This Week: 3W-1L, +8.4 units, +2 rank positions" surface. This is a reason to open the app even when you haven't posted a pick. Email/push notifications are possible but even an in-app weekly card on the home page would drive re-engagement.

### 9.5 Community Has No Integration With Pick Events — SEVERITY 6

When a tipster hits a milestone or big win, the community chat is silent. A system message ("LEDGR: [Username] just hit a 7-game win streak") in the General room would create social moments and draw users to the chat.

### 9.6 Compare Page Result Has No Follow CTA — SEVERITY 7

A user goes to Compare, picks Tipster A vs Tipster B, sees A is clearly better. There is no "Follow Tipster A" or "Subscribe to Tipster A" button on the result page. Highest-intent moment (user just compared two people and chose one) with no conversion path.

---

## 10. MONETIZATION OPPORTUNITIES

### 10.1 Subscribe CTA Lives Only on Tipster Profile — SEVERITY 8

The "Subscribe" button appears only when you're already on a tipster's profile page. The funnel:
- User sees tipster on leaderboard → no subscribe CTA
- User sees event in feed → no subscribe CTA
- User sees rising card on home → no subscribe CTA
- User visits tipster profile → Subscribe CTA

Each missing CTA is a dropped conversion. Leaderboard rows, feed event cards, and home rising cards should all have a subscribe affordance.

### 10.2 Simulator Result Is the Highest-Intent Monetization Moment — SEVERITY 9

The simulator answers: "If you had followed [Tipster X] with $1,000, you'd have $1,847 today." This is the product's strongest conversion surface — the user has just seen their potential P&L. There is no follow or subscribe CTA anywhere in the simulator result flow.

**Required:** After simulation runs, add a CTA block below the result chart: "Follow [Tipster X] to get their next picks the moment they post." with follow + subscribe buttons.

### 10.3 Analytics Is a Natural Upsell Surface — SEVERITY 7

Deep analytics (ROI curves, CLV, variance, sharp score) is premium-quality data. There is no free/premium tier distinction currently, but adding one later is the natural path. Currently analytics is just a free page buried in navigation. At minimum, surface a teaser on the tipster profile: "Full analytics available — [View →]" to increase analytics page visits.

### 10.4 Premium Badge Category Creates Desire — SEVERITY 5

Badge vault has common/rare/epic/legendary/mythic rarities. Mythic badges exist but no badge is labelled "Premium Exclusive." Adding 2-3 badges that can only be earned by subscribers (of the platform, not individual tipsters) creates a visible status signal and subscription incentive.

### 10.5 Feed Event Cards Are Conversion Surfaces — SEVERITY 6

Feed shows: "Tipster X hit a 7-game win streak." The username links to their profile. No subscribe CTA inline. For big events (big win, streak milestone, division advancement), add a subtle "Follow" button on the card right side. These are the moments when users feel the pull to follow someone.

---

## PAGE-BY-PAGE RECOMMENDATIONS

### Landing (index.html)
- **Status:** System A (Rajdhani/Barlow, brand.css). Separate from app — correct.
- **Issues:** Stats section shows `0 / 0 / 0` if backend not seeded. Seed with real or placeholder stats before launch.
- **Priority:** Low. Landing is already visually coherent for its context.

### Home (/home/)
- **Status:** System B. app-tokens.css + app-components.css. Correct.
- **Issues:** No "My Profile" link, streak not hero-level, rising cards may be empty, no "follow recommendations" section.
- **Priority:** HIGH. This is the logged-in user's command center. Fix streak prominence, add profile CTA, add follow reco section.

### Leaderboard (/leaderboard/)
- **Status:** System B. app-tokens.css. Correct.
- **Issues:** Subscribe CTA absent from rows, rank delta missing, no discovery path.
- **Priority:** MEDIUM. Add inline follow buttons to rows. Add rank delta display.

### Dashboard (/dashboard/)
- **Status:** System B. app-tokens.css. Correct.
- **Issues:** Mobile layout likely broken (2-column grid), first pick has no ceremony, page lacks prestige framing.
- **Priority:** HIGH (mobile critical). Fix grid for mobile. Add first-pick detection and moment.

### Feed (/feed/)
- **Status:** System B. app-tokens.css. Correct.
- **Issues:** Subscribe CTA absent from event cards, empty state zeroes out stat strip.
- **Priority:** MEDIUM. Add follow/subscribe on big event cards. Improve empty state.

### Tipster (/tipster/)
- **Status:** System C — WRONG. Rajdhani/Barlow, vivid purple.
- **Issues:** Entire design system inconsistent with the rest of the app. Most externally shared page. Beautiful division banners need to be preserved but rewrapped in app-tokens.css.
- **Priority:** CRITICAL. Migrate to System B. Keep division banner visuals, avatar rings, and cinematic elements — just swap the CSS variables and font stack.

### Progress (/progress/)
- **Status:** System C — WRONG. Rajdhani/Barlow, vivid purple. NO NAV.
- **Issues:** No navigation (users are stranded), wrong design system, duplicate of badges in purpose.
- **Priority:** CRITICAL. Add nav (at minimum a logo link home). Migrate to System B. Consider merging Badges into this page as a tab.

### Badges (/badges/)
- **Status:** System C — WRONG. Rajdhani/Barlow, vivid purple. Custom `badges-top-nav`.
- **Issues:** Wrong design system, badge unlocks silent outside this page.
- **Priority:** HIGH. Migrate to System B. Move badge unlock toast to all app pages.

### Hall of Fame (/hall-of-fame/)
- **Status:** System D (own variant of System B, excellent quality, standalone nav copy).
- **Issues:** Not in desktop nav, no data on young platform, standalone nav not synced.
- **Priority:** MEDIUM. Add to desktop nav. Add "Season 1 in progress" state with founding member highlight.

### Compare (/compare/)
- **Status:** System E (System B variables, copy-pasted inline nav). Correct variable set.
- **Issues:** Copy-paste nav (12 files to maintain), no follow/subscribe CTA on result, mobile hero type.
- **Priority:** MEDIUM. Add simulator-result conversion CTA. Nav unification deferred to nav migration pass.

### Simulator (/simulator/)
- **Status:** System E. Correct variables, copy-paste nav.
- **Issues:** HIGHEST-INTENT page with NO conversion CTA after result.
- **Priority:** HIGH. Add follow + subscribe CTA after simulation result. This is the single highest ROI monetization fix.

### Settings (/settings/)
- **Status:** System B via inline style (not app-tokens.css). Custom slide nav (not app-nav.js).
- **Issues:** Not using app-tokens.css (copies variables inline), custom nav instead of app-nav.js.
- **Priority:** LOW. Functionally correct. Migrate to app-tokens.css in nav migration pass.

### Notifications (/notifications/)
- **Status:** System B. app-tokens.css. Correct.
- **Issues:** No direct CTA links in notification cards, max-width 640px feels cramped.
- **Priority:** MEDIUM. Add "View Pick →" links to `new_pick` notifications.

### News (/news/)
- **Status:** System E. Correct variables, copy-paste nav.
- **Issues:** No fallback for empty API feed, fully dead without API key.
- **Priority:** HIGH. Add robust empty/error state. Ensure API key is set before launch.

### Community (/community/)
- **Status:** System B. app-tokens.css. Correct.
- **Issues:** Mobile sidebar breaks chat layout, empty room on launch, no pick event integration.
- **Priority:** HIGH (mobile critical). Add mobile breakpoint that collapses sidebar. Add welcome message state.

---

## REDESIGN PRIORITIES

### P0 — Must Fix Before Launch

| Issue | Page | Severity |
|-------|------|---------|
| Tipster migrated to System B | tipster | 9 |
| Progress given navigation | progress | 7 |
| Dashboard mobile layout | dashboard | 8 |
| Community chat mobile sidebar | community | 7 |
| News page empty state | news | 8 |

### P1 — Phase 2 Core Experience

| Issue | Pages | Severity |
|-------|-------|---------|
| Tipster + progress + badges: migrate to System B | tipster, progress, badges | 9 |
| Streak counter made hero-level on home | home | 8 |
| Simulator result: add follow/subscribe CTA | simulator | 9 |
| Leaderboard rows: add inline follow button | leaderboard | 8 |
| "Your pick won" live toast (WS pick_graded) | all | 8 |
| Division advancement guaranteed delivery | all | 9 |
| Feed event cards: add follow CTA for milestones | feed | 6 |

### P2 — Phase 2 Retention + Delight

| Issue | Pages | Severity |
|-------|-------|---------|
| Notification cards: add direct "View Pick" link | notifications | 6 |
| Leaderboard rank delta (↑3 / ↓2) | leaderboard | 6 |
| First pick ceremony | dashboard | 8 |
| Badge unlock toast on all pages | all | 6 |
| Home: add "My Profile" CTA | home | 6 |
| Home: follow recommendations (0-follows state) | home | 7 |
| Hall of Fame: "Season 1 in progress" state | hall-of-fame | 7 |
| Badges: unlock toast on all pages (not just /badges/) | all | 6 |

### P3 — Polish + Navigation Unification

| Issue | Scope | Severity |
|-------|-------|---------|
| Unify all non-app-nav.js pages to app-nav.js | compare, simulator, news, hall-of-fame | 8 |
| Progress merged into Badges as a tab (or vice versa) | progress, badges | 5 |
| Active state in slide nav | all slide-nav pages | 6 |
| Share Record button on home/tipster | home, tipster | 5 |
| Compare: add follow CTA | compare | 7 |
| Weekly performance recap card on home | home | 7 |

---

## IMPLEMENTATION ORDER

### Sprint 1 (Pre-Launch Critical) — estimated 2-3 days

1. **Tipster: migrate to System B** — swap CSS variables and font imports. Keep all division banner + avatar ring visuals. Add app-nav.js. Remove Rajdhani/Barlow/JetBrains imports.
2. **Progress: add app-nav.js** — minimum viable: add the nav. Design system migration can follow.
3. **Dashboard: fix mobile grid** — change `grid-template-columns: 1fr 380px` to stack on mobile with a `@media` breakpoint.
4. **Community: fix mobile sidebar** — add `@media (max-width: 640px)` that hides sidebar or collapses to a room selector at top.
5. **News: add empty/error state** — if API returns empty, show styled "No stories available right now" panel.

### Sprint 2 (Phase 2 Core) — estimated 3-4 days

6. **Progress + Badges: migrate to System B** — swap variables, font stacks, and nav in both files. Migrate section headers from Rajdhani to Bebas Neue.
7. **Simulator: add post-result CTA** — after chart renders, show "Follow [Tipster] — get their next picks the moment they post" with follow + subscribe buttons.
8. **Home: streak hero treatment** — add streak glow chip to the hero area when streak >= 3. Source from existing stats load.
9. **"Your pick won" toast** — wire `pick_graded` WS event to a toast on home and dashboard for the logged-in user. Reuse existing flash animation patterns from feed.
10. **Division advancement replay** — store `division_up` event to localStorage if user isn't online at settlement. On next home load, check for pending rank-up and fire animation.

### Sprint 3 (Retention) — estimated 2-3 days

11. **Leaderboard: inline follow CTA** — add a small "Follow" button to each leaderboard row visible on hover (desktop) / always (mobile).
12. **Notification cards: add direct links** — parse each notification's payload and add a "View Pick →" anchor to `new_pick` notification cards.
13. **First pick ceremony** — detect `totalPicks === 1` in dashboard pick submission success handler. Show a one-time modal: "Pick 1 of your verified LEDGR record."
14. **Badge unlock on all pages** — move `badges-system.js` unlock toast logic to a module that can fire from any page. Use the existing overlay component.
15. **Home: follow recommendations** — if user follows 0 tipsters, show a "Top 3 to Follow" block sourced from leaderboard top 3.

### Sprint 4 (Navigation Unification) — estimated 2 days

16. **Migrate compare, simulator, news, hall-of-fame to app-nav.js** — remove 4x duplicate slide nav HTML. Wire each page to the app-nav.js IIFE. Saves ~320 lines of duplicate code.
17. **Active link state in all navs** — ensure app-nav.js correctly marks active page on all migrated pages.
18. **Leaderboard rank delta** — pull from `ranking_history` weekly snapshot. Display ↑/↓ delta next to current rank.

---

## DESIGN SYSTEM UNIFICATION PLAN

### Target State

One CSS variable set for all app pages:

```
Background family:     #07060d (near-black deep purple)
Surface:               #0c0a1a / #15122a
Border:                rgba(184,159,255, .10) / .20
Primary accent:        #b89fff  (decorative + active states)
CTA accent:            #7B2CFF  (call-to-action buttons only)
Text primary:          #f0edff
Text muted:            #6a6690 / #9590b8
Green:                 #34d399
Red:                   #f87171
Gold:                  #fbbf24
Orange:                #fb923c
Cyan:                  #38bdf8
```

```
Display / headings:    Bebas Neue
Body / UI:             Syne
Data / mono:           DM Mono
```

Landing page (index.html) intentionally stays on Rajdhani/Barlow/brand.css — that's its own marketing context and should not be touched.

### Migration Approach

1. Ensure `app-tokens.css` declares all the above variables (verify current state)
2. For each System C page (tipster, progress, badges): remove inline `:root` block, replace Google Fonts import with app fonts, add `<link rel="stylesheet" href="/app-tokens.css">`, verify visuals
3. For System E pages (compare, simulator, news): they already have the right variables inline — migration is adding `<link rel="stylesheet" href="/app-tokens.css">` and removing the inline `:root` block
4. Hall of Fame: unique marble body CSS is fine to keep — just needs app-tokens.css variables underneath it

### Files that must NOT be touched

Per project constraints:
- `backend-rankings-engine.js` — ranking formulas
- `ledgr-ws.js` — websocket architecture  
- Any pick submission or grading logic

---

## METRICS TO TRACK AFTER PHASE 2

| Metric | Baseline (launch) | Target (Phase 2 complete) |
|--------|------------------|--------------------------|
| Tipster → Follow conversion | Unknown | Establish baseline |
| Simulator → Follow conversion | 0% (no CTA) | >15% |
| Home → Pick Post rate | Unknown | Track daily |
| Streak active users (streak ≥ 3) | Unknown | Track weekly |
| Notification open rate | Unknown | >30% |
| Time on site (returning users) | Unknown | Establish baseline |

---

*This document is audit-only. No code was modified.*  
*Next step: Sprint 1 implementation starting with tipster System B migration.*
