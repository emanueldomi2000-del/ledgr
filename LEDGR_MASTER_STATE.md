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

---

## Foundation files (Phase 2)

- app-tokens.css — canonical design tokens: colors, spacing, radius, shadows, glows, typography, rarity, nav heights, brand.css bridge aliases
- app-components.css — reusable components: division badges, avatar rings, division banners, skeleton loaders, buttons, panels, stat cards, glow cards, profile cards, badge pills, section titles, live indicators
- app-nav.js — unified nav IIFE: desktop nav, mobile slide nav, auth state, active link, notification badge, user badge, AppNav API

---

## Current known bugs

1. Settings theme color not applying

2. Archetypes selectable manually

3. Tipster page weak visually

4. Login/signup flow inconsistent

5. MLB grading missing

6. Push handling missing

7. Void handling missing

8. Navbar hierarchy weak

9. ✅ FIXED — Feed + notifications: dual nav removed, single inline nav restored

10. ✅ FIXED — Community: nav not sticky (position:relative → AppNav handles sticky)

11. ✅ FIXED — Badges: .brand-nav renamed to .badges-top-nav, brand.css link removed

12. Tipster/Progress/Badges: landing page fonts used on app pages

---

## Current phase

PHASE 2

Design Foundation

Current task:

Style Alignment Phase complete

Completed:

All 6 target pages migrated to foundation files and style-aligned:
- feed/index.html ✅
- notifications/index.html ✅
- dashboard/index.html ✅ (panel-title border-left accent added)
- community/index.html ✅ (critical nav sticky bug fixed, brand.css removed)
- home/index.html ✅ (full migration: div-* removed, section-head-row h2 + .section-head border-left accent added)
- leaderboard/index.html ✅ (full migration)

Next task:

Remaining app pages: analytics, tipster, compare, simulator, settings, progress, badges, hall-of-fame, news

---

## DO NOT TOUCH

- ranking formulas

- websocket architecture

- existing trust systems