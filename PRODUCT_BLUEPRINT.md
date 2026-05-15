# LEDGR — Product Blueprint & Architecture Audit

**Production:** https://getledgr.bet  
**Backend:** https://ledgr-backend-production-c132.up.railway.app (Railway)  
**Hosting:** Vercel — static deploy, no build step  
**Stack:** Plain HTML + CSS + vanilla JS. No framework. No bundler. No TypeScript.  
**Date:** 2026-05-14

---

## 1. Product Vision

LEDGR is a **verified sports tipster platform**. The core product promise is simple and powerful: every pick record is cryptographically honest — posted, graded, and immutable. No editing, no deleting, no cherry-picking. Tipsters build a verifiable track record; followers can trust the numbers.

### Positioning

| Dimension | LEDGR |
|---|---|
| Who it's for | Sports bettors who want to follow sharp tipsters with real, audited records |
| Core differentiator | Verified, immutable pick history — the record cannot be gamed |
| Revenue model | €10/month tipster subscriptions (Stripe); tipsters earn follower income |
| Network effect | Better tipsters attract more followers; more followers attract more tipsters |
| Moat | Verified track record history — once a tipster has 6 months of real data, it's irreplaceable |

### Core Invariant

> **Picks are immutable once posted. No edits. No deletes. Ever.**

This is not a technical detail — it is the product's entire value proposition. The moment edits are possible, the record is untrustworthy. Never compromise this.

---

## 2. Architecture Overview

```
Browser (vanilla JS)
    │
    ├─ /brand.css          — global design tokens + sticky nav
    ├─ /brand-nav.js       — nav auth state (logo, profile link, logout)
    ├─ /[shared].js        — per-feature IIFEs (archetypes, follows, push, etc.)
    │
    └─ fetch() / WebSocket
           │
           └─ Railway Backend (Node.js REST + WebSocket)
                    │
                    └─ Database (Postgres/MySQL — schema unknown from frontend)
```

**Design principles (current):**
- Each page is a standalone HTML file — zero shared state between pages except localStorage
- Shared functionality injected via `<script src="/file.js">` tags (IIFEs, not modules)
- CSS either in `<style>` blocks inline or injected by shared JS at runtime
- Auth is client-side-only: `ledgr_user` JSON + `ledgr_token` string in localStorage
- No token refresh, no auth middleware, no route guards — backend validates server-side

---

## 3. Page Inventory & Implementation Status

### Legend
- **FULL** — Real backend integration, fully functional
- **PARTIAL** — Real backend for some data, other data is client-side computed or localStorage-only
- **FRONTEND-ONLY** — No real backend. Data lives in localStorage or is simulated client-side
- **STATIC** — No dynamic data at all (marketing copy, legal pages)
- **REDIRECT** — Just redirects elsewhere

---

### 3A. Auth

| Page | Status | Notes |
|---|---|---|
| `/login/` | **FULL** | POST /auth/login; writes ledgr_user + ledgr_token to localStorage |
| `/register/` | **FULL** | POST /auth/register + email OTP via verify.js |

---

### 3B. Core App

| Page | Status | Detail |
|---|---|---|
| `/home/` | **PARTIAL** | Fetches /picks (real). Stats, ELO, divisions, Sharp Score computed client-side. tailFeed/tailTP calls real endpoint. Apostrophe + userBadge crash fixed in last session. |
| `/dashboard/` | **FULL** | Real pick submission form — selects event/market/odds/stake, POSTs to backend |
| `/feed/` | **FULL** | Real-time feed; reactions + tails hit real /picks/:id/react and /picks/:id/tail; 30s auto-refresh |
| `/analytics/` | **PARTIAL** | Fetches /picks (real); 10+ charts (ROI curve, CLV, streaks, heatmap) all computed client-side |
| `/leaderboard/` | **PARTIAL** | Fetches /picks (real); rankings computed client-side. Seasons fetch from /seasons/:id/leaderboard. Podium + table fully rendered. |
| `/tipster/` | **PARTIAL** | Profile from /picks; Stripe checkout (POST /create-checkout); follow/unfollow real; subscriber count real. Profile bio/avatar pulled from localStorage |
| `/progress/` | **PARTIAL** | Divisions computed client-side from /picks; season API real |
| `/community/` | **FULL** | Real-time WebSocket chat. REST: GET /chat/rooms, GET /chat/rooms/:id/messages, POST send. Division badges shown on users. |
| `/notifications/` | **FRONTEND-ONLY** | Reads and writes ONLY to localStorage key `ledgr_notifications`. No backend endpoint. Push notifications exist (push.js) but the notification _centre_ page is detached from them. |
| `/settings/` | **PARTIAL** | Subscriptions: GET/DELETE /subscriptions/:id (real). Subscriber count: real. Bio: PATCH /users/:id (real). Avatar, banner, border, archetype: localStorage only — not persisted server-side. |

---

### 3C. Tools

| Page | Status | Detail |
|---|---|---|
| `/simulator/` | **PARTIAL** | Fetches real /picks to get tipster histories; all bankroll projections (flat/compound/Kelly) computed entirely client-side |
| `/compare/` | **PARTIAL** | Fetches real /picks for both tipsters; all comparison metrics (ROI delta, win rate, sharp score, CLV) computed client-side |
| `/badges/` | **PARTIAL** | Fetches /picks + /followers + /seasons; badge unlock logic and persistent state in localStorage (`ledgr_badges_unlocked`) |
| `/news/` | **PARTIAL** | Fetches GET /news?sport= from backend. Caches responses in localStorage. Backend must actually serve sports news data. |
| `/hall-of-fame/` | **PARTIAL** | Fetches /picks + /seasons from backend; all-time stats and season champion logic computed client-side |

---

### 3D. Marketing / Public

| Page | Status | Detail |
|---|---|---|
| `/` (`index.html`) | **STATIC** | Landing page — hero, ticker, feature pitch, CTAs. Reads /picks for live ticker only. |
| `/become-a-tipster/` | **STATIC** | Pure marketing copy. No fetch calls whatsoever. |
| `/privacy/` | **STATIC** | Legal copy |
| `/terms/` | **STATIC** | Legal copy |
| `404.html` | **STATIC** | Custom 404 |

---

### 3E. Payments & Redirects

| Page | Status | Detail |
|---|---|---|
| `/subscribe/success/` | **FULL** | Post-Stripe success; reads session_id param, updates localStorage subscription state |
| `/subscribe/cancel/` | **FULL** | Post-Stripe cancel; shows message, no payment taken |
| `/parlay/` | **REDIRECT** | Immediate redirect to /dashboard via meta refresh + JS replace |

---

## 4. Backend Systems Audit

### 4A. Confirmed Working Endpoints

| Endpoint | Method | Used By |
|---|---|---|
| `/auth/login` | POST | login/ |
| `/auth/register` | POST | register/ |
| `/picks` | GET | home, feed, analytics, leaderboard, tipster, progress, simulator, compare, badges, hall-of-fame |
| `/picks/:id/react` | POST | feed/ |
| `/picks/:id/tail` | POST | home/, feed/ |
| `/picks/:id/reactions` | GET | feed/ |
| `/picks/:id/tails` | GET | home/, feed/ |
| `/follow` | POST | follows.js |
| `/unfollow` (or DELETE /follow) | POST/DELETE | follows.js |
| `/followers/:userId` | GET | tipster/, badges/ |
| `/following/:userId` | GET | tipster/ |
| `/subscribers/:tipsterId` | GET | tipster/, settings/ |
| `/subscriptions/:userId` | GET | settings/ |
| `/subscriptions/:subId` | DELETE | settings/ |
| `/create-checkout` | POST | tipster/ (Stripe) |
| `/vapid-public-key` | GET | push.js |
| `/push/subscribe` | POST | push.js |
| `/push/unsubscribe` | POST | push.js |
| `/seasons` | GET | leaderboard, progress, badges, hall-of-fame |
| `/seasons/active` | GET | progress/ |
| `/seasons/:id/leaderboard` | GET | leaderboard/ |
| `/chat/rooms` | GET | community/ |
| `/chat/rooms/:id/messages` | GET | community/ |
| `/chat/rooms/:id/messages` | POST | community/ |
| `/users/:id` | PATCH | settings/ (bio only) |
| `/news?sport=` | GET | news/ |
| `WebSocket /` | WSS | community/ |

### 4B. Missing Backend Endpoints (Frontend Expects But Doesn't Have)

| Missing Endpoint | Impact |
|---|---|
| `GET /notifications` or `POST /notifications/read` | Notifications page reads only localStorage — no server-side persistence |
| `GET/PUT /users/:id/profile` | Avatar, banner, border, archetype are localStorage-only; lost on device change, private mode |
| `GET /users/:id` (full profile) | tipster/ reconstructs profile from picks data; no dedicated user profile endpoint |
| Badge persistence endpoint | Badge unlocks live in localStorage — lost on clear |
| Push notification delivery for pick results | push.js registers the subscription but the backend must send push events when picks are graded |

### 4C. Client-Side Computed (NOT from backend)

Everything below is calculated in the browser from raw /picks data. It is re-derived every page load, is not stored anywhere, and could diverge between pages if the formula changes.

- **Sharp Score** — ROI × sample factor × odds factor × streak factor
- **ELO Rating** — starts at 1000, K=32, game-by-game calculation
- **Flow States** — On Fire, Cold Streak, Heating Up, Sharp Momentum, Consistent, Underdog, Contender, CLV Leader
- **Division / Rank** — ROI(40pts) + Win Rate(30pts) + Volume(20pts) + Pick count(10pts) → Bronze/Silver/Gold/Platinum/Diamond/Elite/Legendary
- **Archetype Labels** — Contrarian, Value Hunter, etc. (archetypes.js)
- **All charts in /analytics/** — ROI curve, CLV, streaks, 26-week heatmap, variance bands
- **Simulator projections** — flat/Kelly/compound bankroll growth
- **Hall of Fame rankings** — derived from client-side aggregate of all picks
- **Leaderboard rankings** (all-time tab) — derived client-side; seasonal tabs use backend leaderboard endpoint
- **Badge unlocks** — computed from picks history client-side; state persisted to localStorage

---

## 5. Shared Frontend Systems Audit

| File | Status | Notes |
|---|---|---|
| `brand.css` | **SOLID** | Design tokens, nav, consistently applied |
| `brand-nav.js` | **SOLID** | Auth state, logout — does NOT create #userBadge (known crash risk if pages assume it does) |
| `live.js` | **SOLID** | Polls /picks, renders scrolling ticker — works on home and leaderboard |
| `archetypes.js` | **SOLID** | Client-side sharp score + archetype labels; no backend dependency |
| `tooltips.js` | **SOLID** | Rich metric explanations; no backend dependency |
| `mobile.js` | **SOLID** | Responsive polish; no backend dependency |
| `follows.js` | **SOLID** | Real follow/unfollow API, in-memory cache per session |
| `verify.js` | **SOLID** | Email OTP UI + backend verification |
| `push.js` | **PARTIAL** | Registers push subscription with backend. Delivery from backend not confirmed. |
| `notifications-sw.js` | **PARTIAL** | Service worker handles push events. Delivery depends on push.js being fully wired. |
| `animations.js` | **FRONTEND-ONLY** | Rank-up celebration overlay; fires on client-side division change, no backend trigger |
| `divisions.js` | **FRONTEND-ONLY** | Avatar aura/glow system; purely visual, client-side computed division |
| `badges-system.js` | **PARTIAL** | Badge grid on /badges/ real; unlock animation real; persistence localStorage-only |
| `share.js` | **SOLID** | Canvas pick card for social share; Web Share API; no backend dependency |
| `flow.js` | **FRONTEND-ONLY** | Momentum state chips; client-side from last N picks |
| `football.js` | **DEAD CODE** | `alert("WORKING")` — never used in production, should be deleted |

---

## 6. Technical Debt Catalogue

### Critical (affects correctness or security)

| Risk | Detail | Fix |
|---|---|---|
| **No server-side profile persistence** | Avatar, banner, archetype, border are stored in localStorage. User data is lost on device change, browser clear, or private browsing. | Add GET/PATCH /users/:id/profile endpoint; store profile in DB |
| **No server-side notifications** | /notifications reads localStorage only — no real notification delivery to the centre | Wire push.js events to /notifications page OR add GET /notifications endpoint |
| **Duplicate localStorage keys** | Both `ledgr_user`/`ledgr_token` and legacy `user`/`token` keys exist. Code reads both. On logout, all 4 must be cleared (most pages do this; some don't). | Deprecate legacy keys; enforce `ledgr_*` everywhere |
| **Auth token never refreshes** | JWT or opaque token in localStorage never refreshes. If token expires, user gets silent 401 errors on API calls. No interceptor, no redirect to login. | Add a 401 interceptor in a shared JS module that redirects to /login |
| **Client-side metric divergence** | Sharp Score, ELO, divisions all computed client-side from raw picks. Formula changes don't backfill historical records. /analytics, /leaderboard, /tipster could show different values for the same tipster. | Move metric computation to backend; return pre-computed stats per tipster |

### High (UX / data integrity)

| Risk | Detail |
|---|---|
| **Badge state lost on clear** | Badge unlocks in localStorage — earned badges disappear on device change |
| **No input validation on pick form** | /dashboard client-side only; backend must enforce pick immutability and validity |
| **`football.js` in root** | Dead code in repo root; could confuse contributors or accidentally be loaded |
| **news.js caches in localStorage** | If backend changes news format, stale cache serves wrong data silently |
| **Settings bio is 1-field PATCH** | Only bio is saved to backend; all other settings are localStorage. A PATCH on bio doesn't "save settings" as a whole. |

### Medium (maintenance / scale)

| Risk | Detail |
|---|---|
| **No error handling standard** | Each page rolls its own try/catch and error UI. No shared error component. |
| **CSS design token split** | `brand.css` defines `--color-*` vars; most app pages define their own `:root` with `--ac`, `--bd`, `--tx` etc. These aren't the same variables — two parallel systems. |
| **No content security policy** | Static Vercel deploy with no CSP headers; inline script and `eval()` risks |
| **No analytics / observability** | No error tracking, no performance monitoring, no conversion funnel data |
| **`live.js` polls every page load** | Starts polling immediately on home and leaderboard with no cleanup if user navigates away |

---

## 7. Missing Pages / Features (Not Yet Built)

Based on the product vision, these features are implied but don't exist yet:

| Feature | Priority | Notes |
|---|---|---|
| **Pick grading flow** | CRITICAL | How do picks get marked as Won/Lost? Is there an admin panel? A backend cron? Not visible from frontend. |
| **Tipster verification / onboarding** | HIGH | /become-a-tipster is static marketing. No actual onboarding form, verification, or approval flow. |
| **Admin dashboard** | HIGH | No admin panel visible. Pick grading, user management, dispute resolution — all invisible from frontend. |
| **Server-side user profiles** | HIGH | No profile page exists beyond /tipster which reconstructs profile from picks |
| **Push notification delivery** | HIGH | Subscription is registered but no confirmation that backend sends pick result pushes |
| **Real notifications endpoint** | HIGH | /notifications page is entirely localStorage-based |
| **Pick search / discovery** | MEDIUM | No search for picks across all tipsters by sport/market/date |
| **Tipster onboarding email flow** | MEDIUM | Register → verify → first pick walkthrough |
| **Referral / invite system** | LOW | Mentioned in become-a-tipster copy but no implementation |
| **Season leaderboard (historical)** | MEDIUM | API exists (/seasons/:id/leaderboard) but no UI to browse past seasons |
| **Dispute / correction flow** | MEDIUM | If a pick result is graded wrong, there is no dispute mechanism |
| **Subscription management for tipsters** | MEDIUM | Tipsters can't set/change their subscription price from the UI |

---

## 8. MVP Roadmap

Thinking like a startup CTO: the goal is to get to **one complete, trustworthy user journey** before adding features. Right now the product has a wide surface area but several holes that undermine the core trust proposition.

### Phase 0 — Stabilise (1–2 weeks)

These are not features, they are correctness fixes that must happen before onboarding real users.

1. **Pick grading** — Confirm backend grades Won/Lost picks automatically or build the admin grading UI. Without this, the entire record system is broken.
2. **Profile persistence** — Move avatar/banner/archetype to backend. A user on mobile who clears their cache loses their identity.
3. **Auth 401 interceptor** — Add a shared `apiFetch()` wrapper that redirects to /login on expired token. One day this will silently break for every user simultaneously.
4. **Remove `football.js`** — Dead file in root. Delete it.
5. **Notifications backend** — Either wire /notifications page to push events, or add GET /notifications endpoint. Currently the notification centre is a lie.

### Phase 1 — Core Journey (2–4 weeks)

The single most important user journey: **tipster posts a pick → pick gets graded → follower sees the result**.

1. **Pick result grading pipeline** — Backend auto-grades via sports data API, or admin UI to grade manually. This is the entire product.
2. **Real notifications** — When a followed tipster's pick settles, subscriber gets a push + notification centre entry (server-side).
3. **Tipster onboarding flow** — /become-a-tipster needs a real form: name, sport focus, verification step. Right now it goes nowhere.
4. **Subscription price control** — Tipsters need to set their €X/month price from Settings. Currently hardcoded.
5. **Server-side leaderboard** — Move leaderboard computation to backend. Exposing raw pick data to compute rankings client-side is wasteful and inconsistent.

### Phase 2 — Retention & Discovery (4–8 weeks)

1. **Search & discovery** — Users can't discover tipsters by sport or performance without browsing the leaderboard manually
2. **Historical seasons UI** — Seasons API exists; build a proper season browser in /hall-of-fame and /leaderboard
3. **Badge persistence** — Move badge unlocks to backend; they're currently ephemeral
4. **Share improvements** — Pick cards from share.js are static; add social proof stats (win rate, ROI) to shared cards
5. **Mobile app shell** — The site is responsive but not installable. Add a PWA manifest + offline shell.

### Phase 3 — Monetisation Layer (8–12 weeks)

1. **Tipster revenue dashboard** — Show tipsters how much they're earning from subscribers (currently invisible)
2. **Subscriber-only picks** — Mechanism for tipsters to post picks visible only to paying subscribers
3. **Referral system** — /become-a-tipster mentions referrals; build the actual invite flow
4. **Analytics for tipsters** — Who followed me, who unsubscribed, what my CLV curve looks like to potential subscribers

---

## 9. Immediate Action Items (This Week)

Ordered by risk × impact:

1. **[BLOCKER]** Confirm pick grading pipeline works end-to-end in production. If it doesn't, nothing else matters.
2. **[HIGH]** Add `PATCH /users/:id/profile` endpoint and wire settings avatar/banner/archetype to it.
3. **[HIGH]** Add `GET /notifications` endpoint; wire /notifications page to real data.
4. **[MEDIUM]** Replace all `localStorage.clear()` calls with explicit key removal (some pages nuke the entire localStorage on logout, breaking cached preferences).
5. **[MEDIUM]** Consolidate CSS design token systems — either brand.css or the inline `:root` blocks, not both.
6. **[LOW]** Delete `football.js`.
7. **[LOW]** Add `/news` endpoint to CLAUDE.md and confirm backend actually serves real sports news data.

---

*Generated 2026-05-14. Stack: static HTML/CSS/vanilla JS on Vercel + Railway backend.*
