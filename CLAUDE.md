# LEDGR — Claude Context

**Production URL:** https://getledgr.bet  
**Backend:** https://ledgr-backend-7hmh.onrender.com  
**Hosting:** Vercel (static deploy, no build step)  
**Stack:** Plain HTML + CSS + vanilla JS — no framework, no bundler, no TypeScript.

---

## Core Rule

**Picks are immutable once posted. No edits. No deletes. Ever.**  
This is the product's entire value proposition — verified, tamper-proof records. Never write code that allows a posted pick to be modified or removed, even soft-deletes.

---

## Auth & Session

User session is stored in `localStorage` under the key `ledgr_user` (some older code also checks `user`). It is a JSON object. All API calls read from this directly — there is no auth middleware or token refresh layer. The backend validates ownership server-side.

---

## Design System

### App pages (dashboard, feed, leaderboard, etc.)
| Role | Font |
|------|------|
| Display / headings | Bebas Neue |
| Body / UI | Syne |
| Monospace / data | DM Mono |

### Landing page (index.html, marketing)
| Role | Font |
|------|------|
| Display / headings | Rajdhani |
| Body | Barlow |
| Mono | JetBrains Mono |

### CSS variables (brand.css)
```
--color-bg:           #0A0A0A      /* page background */
--color-surface:      #121212      /* card surfaces */
--color-surface-2:    #1E1E1E      /* elevated surfaces */
--color-purple:       #7B2CFF      /* primary accent */
--color-purple-light: #B14CFF      /* hover / lighter accent */
--color-text:         #E6E6E6      /* primary text */
--color-muted:        #6B6B6B      /* secondary / labels */
--color-border:       #2A2A2A      /* dividers */
--color-glow:         rgba(123,44,255,0.35)
```

The soft purple `#b89fff` appears throughout component JS styles as a highlight/glow colour (not a CSS var — it's hardcoded in injected styles). Dark theme only; no light mode.

### Nav
`brand.css` provides `nav.brand-nav` — a sticky, 60px, backdrop-blur nav used across all app pages. Logo uses Rajdhani/Bebas Neue with a purple accent `<span>`.

---

## Pages

### Public / Marketing
| Path | Purpose |
|------|---------|
| `/` (`index.html`) | Landing page — hero, ticker, feature pitch, sign-up CTAs |
| `/become-a-tipster/` | Onboarding pitch for new tipsters |
| `/privacy/` | Privacy policy |
| `/terms/` | Terms of service |
| `404.html` | Custom 404 |

### Auth
| Path | Purpose |
|------|---------|
| `/login/` | Login form |
| `/register/` | Sign-up form (includes email OTP verification via `verify.js`) |

### Core App (authenticated)
| Path | Purpose |
|------|---------|
| `/home/` | Authenticated home — user's own verified pick record and dashboard |
| `/dashboard/` | Post a Pick — select match, set market/odds, submit immutable pick |
| `/feed/` | Live Feed — real-time activity stream of wins, streaks, milestones from all tipsters |
| `/analytics/` | Deep analytics — ROI curve, CLV, markets, streaks, variance, sharp score |
| `/leaderboard/` | Rankings — all tipsters ranked by verified performance |
| `/tipster/` | Public tipster profile — pick history, ROI, win rate, full stats |
| `/progress/` | Division progression — Bronze → Legendary rank, rewards |
| `/community/` | Real-time community chat |
| `/notifications/` | Alert centre — picks, streaks, division changes from followed tipsters |
| `/settings/` | Profile customization — archetype, banner, border, subscription management |

### Tools
| Path | Purpose |
|------|---------|
| `/simulator/` | Bankroll simulator — model growth following a tipster (flat/compound/Kelly) |
| `/compare/` | Head-to-head — compare two tipsters across all performance metrics |
| `/badges/` | Achievement collection — earned for streaks, ROI milestones, win rates |
| `/news/` | Sports intel — live news, injury tracker, lineup reports |
| `/hall-of-fame/` | All-time greatest tipsters, season champions |

### Payments (Stripe flow)
| Path | Purpose |
|------|---------|
| `/subscribe/success/` | Post-checkout success — user subscribed to a tipster |
| `/subscribe/cancel/` | Post-checkout cancellation — no payment taken |

### Redirects / Legacy
| Path | Purpose |
|------|---------|
| `/parlay/` | Redirect page — parlay feature replaced by post-pick flow |

---

## Shared JS Files (root level)

These are standalone IIFEs loaded via `<script>` tags in individual pages. They inject their own CSS when first loaded. No module system.

| File | What it does |
|------|-------------|
| `live.js` | Injects a live activity ticker on home/leaderboard; polls backend for recent pick results and renders them as scrolling feed items |
| `archetypes.js` | Renders the Sharp Score gauge SVG and tipster archetype labels (e.g. "Contrarian", "Value Hunter") with CSS tooltips |
| `tooltips.js` | Global tooltip system — `?` icon triggers (`tt-q` class) render rich metric explanations in a positioned `#tt-box` panel |
| `mobile.js` | Mobile polish layer — injects responsive fixes, bottom nav padding, font clamping, and page fade-in animation for screens ≤600px |
| `follows.js` | Follow/unfollow API wrapper — manages a per-user follow list cached in memory, calls `/follow` and `/unfollow` endpoints, renders follow button states |
| `verify.js` | Email OTP verification screen — shown post-registration, renders 6-box OTP input UI and calls backend to verify the code |
| `push.js` | Web Push setup — registers `notifications-sw.js` service worker, subscribes user to push via the Web Push API, stores subscription on backend |
| `notifications-sw.js` | Service worker — handles incoming push events, shows browser notifications with "View Pick" / "Dismiss" actions |
| `animations.js` | Rank-up celebration overlay — full-screen animated panel shown when a user advances to a new division (Bebas Neue large type, glow orb, particle burst) |
| `divisions.js` | Division visual system — wraps avatars with tier-specific auras, glows, and particle effects for Bronze / Silver / Gold / Platinum / Diamond / Legendary |
| `badges-system.js` | Badge unlock system v2 — renders badge grid on `/badges/`, triggers animated unlock overlay panel when a new badge is earned |
| `share.js` | Share modal — draws a pick card to `<canvas>` for social sharing (1:1 aspect ratio), provides download and native share via Web Share API |
| `flow.js` | Flow detection — computes and renders momentum state chips (On Fire, Cold Streak, Heating Up, Sharp Momentum, Consistent, Underdog) based on recent pick results |
| `football.js` | Placeholder / test file — currently just `alert("WORKING")`, not used in production |

---

## Backend API

Base URL: `https://ledgr-backend-7hmh.onrender.com`

Known endpoints (from shared JS):
- `POST /follow` — follow a tipster `{ followerId, followingId }`
- `POST /unfollow` — unfollow a tipster
- Push subscription registration endpoint (in `push.js`)
- Pick submission, results, leaderboard, analytics — called from individual page scripts

---

## Conventions

- Every page is a standalone HTML file. Shared behaviour comes from `<script src="/shared.js">` style includes.
- CSS is either in `<style>` blocks within the HTML or injected at runtime by the shared JS IIFEs.
- `brand.css` is the only global stylesheet — always link it first.
- No test suite, no CI lint step. Changes go live on merge to main via Vercel.
- `node_modules/` exists at the root (likely for a small backend utility) but the frontend has zero npm dependencies.
