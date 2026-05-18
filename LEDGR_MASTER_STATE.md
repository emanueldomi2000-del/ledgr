# LEDGR MASTER STATE

## Product Philosophy

LEDGR is:

- competitive ecosystem
- reputation network
- prestige system
- betting identity platform

LEDGR is NOT:

- sportsbook
- casino
- gambling site

---

## Current stack

Frontend:
- HTML
- CSS
- JS

Backend:
- Node.js
- Express

Database:
- Supabase PostgreSQL

Hosting:
- Railway
- Vercel

Realtime:
- WebSockets

Sports data:
- The Odds API

---

## Existing systems

✅ Profile persistence

✅ Rankings engine

✅ Websocket events

✅ Notifications

✅ Odds provider

✅ Immutable picks

✅ Dashboard provider flow

✅ Realtime activity feed

✅ Profile system

---

## Current pages

Home
Leaderboard
Dashboard
Feed
Tipster
Simulator
Compare
Badges
Progress
Hall of Fame
Settings
Notifications
News

---

## Project context files

- LEDGR_BRAIN.md — full system architecture, formulas, schema, API endpoints
- LEDGR_UI_BRAIN.md — full UI/UX audit: design systems, nav inconsistencies, migration plan
- LEDGR_EXPERIENCE_REBUILD.md — Phase 2 full experience audit: severity scores, page-by-page recs, 4-sprint implementation plan
- LEDGR_PRESTIGE_SYSTEM_FINAL.md — Phase 3 final prestige architecture: archetypes, cosmetics, rarity, unlock paths, Pro tier, monetization boundaries (supersedes LEDGR_PRESTIGE_SYSTEM.md)
- LEDGR_DESIGN_SYSTEM_FINAL.md — **Design constitution v1.0**: identity system, nav rules, icon system, component system (cards/buttons/typography/spacing/animations/glows/borders), prestige system, home/dashboard/profile relationship, full page audit table, Phase 4 violation backlog

---

## Foundation files (Phase 2)

- app-tokens.css — canonical design tokens: colors, spacing, radius, shadows, glows, typography, rarity, nav heights, brand.css bridge aliases
- app-components.css — reusable components: division badges, avatar rings, division banners, skeleton loaders, buttons, panels, stat cards, glow cards, profile cards, badge pills, section titles, live indicators
- app-nav.js — unified nav IIFE: desktop nav, mobile slide nav, auth state, active link, notification badge, user badge, AppNav API

---

## Current known bugs

1. ✅ FIXED (B15) — Profile identity persistence complete: all fields round-trip through backend. tipster + home pages apply theme CSS var (--ac) from GET /profile on load. Cross-device sync confirmed: backend is source of truth, localStorage is cache only.

2. Archetypes selectable manually

3. ✅ FIXED (B3) — Tipster visual upgrade complete: archetype hero card, streak glow chip, subscribe primary CTA, trophy shelf, banner marks, win card prestige, momentum bar, breadcrumb navigation. ARCHETYPES dict upgraded to prestige system v2.

4. Login/signup flow inconsistent

5. ✅ FIXED (B5) — autoVerify.js grading engine complete: MLB, push, void, admin override, settlement visibility. Schema migration: autoVerify-schema.sql. Deploy to Railway + run migration to activate.

6. Push handling missing

7. Void handling missing

8. ✅ FIXED — Navbar hierarchy: all 13 app pages unified to app-nav.js (System B). brand.css / brand-nav.js fully eliminated from app pages. Active link color, nav height, font tokens consistent across entire product.

9. ✅ FIXED — Feed + notifications: dual nav removed, single inline nav restored

10. ✅ FIXED — Community: nav not sticky (position:relative → AppNav handles sticky)

11. ✅ FIXED — Badges: .brand-nav renamed to .badges-top-nav, brand.css link removed

12. Tipster/Progress/Badges: landing page fonts used on app pages

13. ✅ FIXED (B9) — Notifications: full end-to-end wiring complete. GET /notifications API, fabricated localStorage purged, WS subscriptions cover all 8 personal event types, AppNav badge wired, PATCH read/:id on card click, read-all uses req.user.id, streak_milestone/milestone_pick unicast to followers, badge_unlock endpoint added (POST /notifications/badge-unlock, idempotent), badges-system.js calls API on unlock, milestone_pick personal unicast to tipster added

---

## Current phase

PHASE 3 — Prestige + Monetization Foundation

### Completed: Home Page Identity Conversion ✅

Date: 2026-05-18

home/index.html hero section converted from marketing landing-page feel to application identity. Key change: hero-tagline font-size from `clamp(52px,8vw,100px)` → `clamp(26px,3vw,34px)`. Removed `::before` decorative eyebrow line. Tightened hero-layout and hero paddings. Added `.hero-arch` archetype identity card (from localStorage, silently no-ops if unset). Mobile override fixed. All existing IDs, WS event handlers, and ceremonies fully preserved.

### Completed: Tipster Visual Upgrade ✅

Date: 2026-05-18

tipster/index.html transformed into the prestige center of LEDGR. 9 focus areas upgraded: hero banner (username/division watermarks + breadcrumb), archetype as hero card (not pill), streak as glowing animated chip, subscribe as dominant gradient CTA, trophy shelf replacing flat badges row, win card green tint + glow, momentum bar in picks panel. ARCHETYPES dict updated to prestige system v2 names (The Documentarian, The Underdog Hunter, new: specialist/high-stakes/contender). All existing functionality preserved.

### Completed: Sprint 4 — Navbar Unification ✅

Date: 2026-05-18

All 13 app pages now on System B (app-tokens.css + app-components.css + app-nav.js). brand.css and brand-nav.js fully eliminated from all app pages.

Pages migrated this sprint: dashboard (brand-nav.js orphan removed), analytics (full migration), archetypes (full migration). All previous sprints' pages already done.

Consistency wins: active link color unified to `var(--ac)` everywhere; news green active bug fixed; hall-of-fame gold active bug fixed; analytics 62px nav height corrected to 60px.

### Completed: Prestige System Revision ✅

Date: 2026-05-18

LEDGR_PRESTIGE_SYSTEM_FINAL.md created. All 31 validation issues resolved or formally deferred. Key changes:
- 7 active archetypes (+ The Contender new-user state); 6 deprecated backend keys; 3 new keys needed (`specialist`, `high-stakes`, `contender`)
- The Analyst → The Documentarian (calibration-based, not word count); The Contrarian → The Underdog Hunter (proxy removed)
- CRITICAL fixes: priority notifications removed, "Verified" prohibited from premium copy
- Pro tier: €5/month, visitor analytics added, leaderboard badge removed, discovery surface open to all
- Division cascade: 4 simultaneous Legendaries replaced with time-gated unlock sequence
- THE CONTENDER replaces UNCLASSIFIED: full badge, positive framing, never re-assigned after named archetype held
- Milestone delivery guarantee system (extends ledgr_pending_rankup to all cosmetic unlocks)
- Deferred: social path, badge collection path, seasonal items (until B6 resolved), Accumulator archetype

### Completed: Sprint 3 — Delight Moments & Retention Loops ✅

Date: 2026-05-18

1. **First Pick Ceremony** (dashboard/index.html) — Full-screen overlay on first pick submission: "IT'S ON THE LEDGER" headline, permanence copy, share CTA. Triggers 600ms after `d.id` success when `allMyPicks.length === 0`.

2. **Big Win Ceremony** (home/index.html) — Upgraded `pick_result` WS handler from plain toast to animated win overlay. Wins ≥5u get gold "MONEY PRINTER" treatment; standard wins get green overlay. Auto-dismisses at 4s/6s.

3. **Division Promotion Replay** (home/index.html) — `division_up` WS handler now detects own promotion via `ev.targetUserId === user.id`. Fires `rankUpAnimation()` immediately, or stores to `ledgr_pending_rankup` localStorage for replay on next home load. Other users' promotions still go to ticker.

4. **Badge Unlock Celebration** (home/index.html) — Added `badge_unlock` WS event handler → calls `window.badgeUnlockAnimation()`. `animations.js` was already loaded on home page.

5. **Leaderboard Follow buttons** — Already implemented (`.follow-btn`, `follows.js`, `Follows.initFollowButtons()`). No changes needed.

6. **Notification action CTAs** (notifications/index.html) — `pickId` stored from backend payload in `_beNotifToLocal()`. Card template shows contextual action hints: "View Pick →", "View Analytics →", "View Badges →". `handleClick` deep-links `new_pick` to `/tipster?u=${ref}#pick-${pickId}`.

### Completed: Sprint 2 — Core Experience ✅

Date: 2026-05-18

1. **Simulator** — Nav migrated to System B (app-tokens.css, app-nav.js, brand-nav.js removed). Post-result follow CTA added: after simulation renders, a prominent block shows "Get @[tipster]'s next picks the moment they post" with Follow + View Profile buttons. `simFollow()` function added for inline follow via POST /follow.

2. **Home streak hero** — `.streak-pill` upgraded from plain 10px text to a glowing orange chip (border, bg, box-shadow, pulse). `.streak-pill.streak-fire` added for streak ≥ 5 with stronger `streak-fire-pulse` animation. JS updated to apply `.streak-fire` class at threshold.

3. **Badges** — Migrated from System C (Rajdhani/Barlow/JetBrains, #7B2CFF) to System B. All 21 font-family references updated. `badges-top-nav` CSS + HTML replaced with app-nav.js. Bridge aliases: `--ac-l: var(--ac-light)`, `--div-color: var(--ac-vivid)` (JS still overrides `--div-color` at runtime).

### Completed: Sprint 1 — Pre-Launch Critical ✅

Date: 2026-05-18

1. **Tipster** — Migrated from System C (Rajdhani/Barlow/JetBrains Mono, #7B2CFF) to System B (app-tokens.css + app-components.css). All 64 font-family references updated. Brand-nav + old slide-nav replaced with app-nav.js. brand.css link removed.

2. **Progress** — Migrated from System C to System B. All 30 font-family references updated. Brand-nav replaced with app-nav.js. Duplicate skeleton CSS removed (now in app-components.css).

3. **Dashboard** — Parlay panel top offset corrected from 62px → 60px to align with app-nav.js nav height. Mobile parlay panel offset corrected 52px → 60px.

4. **Community** — Mobile input area fixed: was positioned at `bottom:64px` (assumed missing bottom nav bar). Now `bottom:0` with `padding-bottom:env(safe-area-inset-bottom)` for iPhone safe-area. Messages scroll height recalculated.

### Completed: Phase 2 Experience Audit ✅

LEDGR_EXPERIENCE_REBUILD.md written.
Full audit across all 15 pages, 10 issue categories, 4-sprint implementation plan.

Key findings now resolved (Sprint 1):
- ✅ Tipster migrated to System B (was Severity 9)
- ✅ Progress navigation added via app-nav.js (was Severity 7)
- ✅ Dashboard parlay panel height aligned to app-nav
- ✅ Community mobile input anchored to bottom

Remaining (Sprint 2+):
- Badges still on System C — migrate in Sprint 2
- Simulator has no post-result follow/subscribe CTA
- Division advancement has no guaranteed delivery
- 5 design system groups across 15 pages — product feels like 3 different apps
- 4-sprint plan: pre-launch critical → core experience → retention → nav unification

### PHASE 1 — Trust Foundation ✅ COMPLETE

Production readiness: 93%.

All trust chain fixes applied (WP-1 through WP-10, except rank_up/WP-9 deferred):
- autoVerify.js: affectedRows guard, adminOverride, streakType in prevSnapshot ✅
- backend-ws-events.js: division_up SELECT, streak/milestone prevSnapshot shape ✅
- backend-picks-endpoints.js: WP-5 top-level fields, WP-8 dedup guard, per-user limit ✅
- backend-fixtures-endpoints.js: WP-10 UTC boundary ✅
- autoVerify-schema.sql: stakeType/confidence/reasoning columns ✅
- dashboard/index.html: WP-7 server-side userId filter ✅
- autoVerify.test.js: 79 tests, all passing ✅

Phase 1 finalization complete: PHASE1_FINAL_REPORT.md written.

### Next task (Sprint 1 — Pre-Launch Critical):

1. Deploy to Railway — follow PHASE1_FINAL_REPORT.md 12-step checklist
2. **Tipster: migrate to System B** (app-tokens.css, Bebas/Syne/DM Mono, app-nav.js) — keep division banners
3. **Progress: add navigation** (minimum: app-nav.js)
4. **Dashboard: fix mobile grid** (stack panels on narrow screens)
5. **Community: fix mobile sidebar** (collapse to room selector on mobile)
6. **News: add empty/error state**
7. Smoke test: post pick → /admin/grading/run → verify grade + notification + rankings
8. WP-9: add rank column to user_rankings, wire rank_up/rank_change events
9. B2: Archetypes manually selectable
10. B6: Push notification delivery confirmation

---

## DO NOT TOUCH

- ranking formulas

- websocket architecture

- existing trust systems