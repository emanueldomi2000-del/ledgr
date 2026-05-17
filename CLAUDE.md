# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## What This Is

**LEDGR** (`getledgr.bet`) — a verified tipster reputation platform. Slogan: *"The only platform where tipsters can't lie."* Think FACEIT + Chess.com + League of Legends ranked. Not a gambling site — a prestige/social identity system for sports bettors.

---

## Infrastructure

| Layer | Detail |
|---|---|
| Frontend | Vercel → `github.com/emanueldomi2000-del/ledgr` (this repo) |
| Backend | Railway → `https://ledgr-backend-production-c132.up.railway.app` |
| Database | Supabase PostgreSQL (Prisma v5) |
| Domain | getledgr.bet (Namecheap) |

**No build step.** Pure HTML/CSS/JS. Deploy = push to `main`. Branch for Claude: `claude/ledgr-vision-expansion-OrSLd`.

---

## Development

There is no local dev server, package.json, or build pipeline. To preview:
- Open any `.html` file directly in browser, **or**
- `python3 -m http.server 8080` from `/home/user/ledgr`

No linting, no tests. Verify correctness by reading the code.

---

## Architecture

All pages are **self-contained** `index.html` files — CSS and JS inline in `<style>` and `<script>` tags. No shared JS bundles (the shared files listed in the handoff doc are planned but not yet built). Every page:

1. Reads auth from `localStorage.getItem('ledgr_user')` → `{id, username}` and `localStorage.getItem('ledgr_token')`
2. Fetches data from the Railway backend REST API (`const API = 'https://ledgr-backend-production-c132.up.railway.app'`)
3. Renders via JS DOM manipulation into a placeholder `<div id="mainContent">`

**URL routing** is handled by `vercel.json` rewrites — e.g. `/tipster` → `tipster/index.html`.

---

## Brand System

```css
/* Colors */
--bg: #07060d; --s1: #0c0a1a; --s2: #15122a;
--bd: rgba(184,159,255,0.1); --bd2: rgba(184,159,255,0.18);
--ac: #b89fff; --acg: rgba(184,159,255,0.08);
--tx: #f0edff; --mu: #6a6690; --mu2: #9590b8;
--gr: #34d399; --rd: #f87171; --gold: #fbbf24;
--cyan: #38bdf8; --orange: #fb923c;

/* Typography */
/* Headings/ranks: Rajdhani 700 */
/* Body: Barlow 400/500 */
/* Numbers/stats/odds: JetBrains Mono (always tabular-nums) */
/* Legacy pages: Bebas Neue + Syne + DM Mono */
```

Logo files live at `/assets/logo/ledgr-logo.svg` (nav) and `/assets/logo/ledgr-icon.png` (favicon). Every page must have `<link rel="icon" type="image/png" href="/assets/logo/ledgr-icon.png">` and the nav logo `<img src="/assets/logo/ledgr-logo.svg" class="logo-img" onerror="...">`.

---

## Key Domain Logic

### Division Scoring
Score = `ROI/20×40 + WR/70×30 + picks/100×20 + min(10,picks)` → 0–100

| Score | Division |
|---|---|
| 0–14 | Bronze |
| 15–29 | Silver |
| 30–44 | Gold |
| 45–59 | Platinum |
| 60–74 | Diamond |
| 75–89 | Elite |
| 90+ | Legend |

### Win Rate Formula
`wins / (wins + losses) * 100` — **never** divide by total picks (which includes pending).

### Sharp Score
Composite 0–100 built from ROI, WR, volume, and streaks. Requires ≥3 picks. Below 10 picks: show ⚠ Low sample size warning.

### ELO
Starts at 1000, K=32, adjusts per settled pick using implied probability from odds. Streak bonus (+2 per pick after 3-win streak, capped at +10). Labels: Beginner / Developing / Intermediate / Advanced / Expert / Grandmaster.

### Archetype System
Auto-detected from stats: The Sniper (ROI>20%, <30 picks), The Demon (streak>5), The Sharp (SharpScore>70), The Grinder (>100 picks, ROI>0), The Value Hunter (avg odds 2.5–3.5), The Underdog King (avg odds>3.0).

---

## Backend API (key endpoints)

```
GET  /picks                     → all picks with user object nested
POST /picks                     → create pick (immutable after 5min before match)
GET  /rankings                  → [{rank, username, roi, winRate, ...}]
GET  /rankings/:userId          → single tipster rank data
POST /picks/:id/react           → emoji reaction
POST /picks/:id/tail            → tail a pick
GET  /subscriptions/:userId     → subscription status
```

Picks are **immutable** — no delete, no manual result edit. Results graded automatically by `autoVerify.js` on the backend every 5 minutes.

---

## Social Features (localStorage-only for now)

These exist only in the browser; not persisted to backend yet:
- `ledgr_following` — `string[]` of usernames being followed
- `ledgr_subscription_status` — `'free'|'premium'|'pro'`
- `ledgr_profile_<username>` — profile customization config `{archetype, banner, border, favSports}`
- `ledgr_saved_parlays` — parlay builder saves

---

## Tipster Profile Page (`/tipster?u=<username>`)

The most complex page. Architecture:
1. Fetch `GET /picks` → filter by `p.user.username === username`
2. Compute all stats client-side (divisions, ELO, SharpScore, badges, DNA tags)
3. Inject full HTML into `#mainContent` via one large template literal
4. Call `animateGauge()`, `drawPnLChart()`, `renderPicks()` after 100ms timeout

**Premium picks**: `p.isPremium === true` → blur card for non-subscribers (check `ledgr_subscription_status`). Own profile always unlocked.

---

## Multi-file Nav Updates

When updating nav links across all pages, use Python `str.replace()` rather than `sed` — sed's `\n` handling is unreliable in this shell. Pattern:

```python
with open(path, 'r') as f: src = f.read()
src = src.replace(OLD, NEW)
with open(path, 'w') as f: f.write(src)
```

---

## Known Issues / Active TODOs

1. **Progress page** — content doesn't render for 0-pick users
2. **Player markets** — show "Loading…" (API-Football free plan; fix: text input)
3. **og-image.png** — missing at `/assets/logo/og-image.png` (1200×630)
4. **Upgrade page** — `/upgrade` not built yet
5. **Shared JS files** — `divisions.js`, `archetypes.js`, etc. are planned but all logic is currently inlined per-page
