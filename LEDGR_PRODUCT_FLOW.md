# LEDGR PRODUCT FLOW AUDIT

> Produced by full analysis of all page purposes, navigation systems, and user journeys.
> Based on: LEDGR_BRAIN.md, LEDGR_UI_BRAIN.md, LEDGR_MASTER_STATE.md, BACKEND_ARCHITECTURE.md, and CLAUDE.md.
> No code was modified. Audit only.
> Date: 2026-05-18

---

## 1. CURRENT NAVIGATION MAP

### Desktop nav (primary — always visible)

```
LEDGR logo  |  Home  |  Leaderboard  |  Feed  |  Analytics  |  Community  |  Profile (user badge)
                                                                             [hamburger ☰]
```

### Hamburger slide menu contents

```
Post a Pick
Simulator
Compare Tipsters
Badges
Progress
Hall of Fame
Become a Tipster
Settings
Notifications
News
```

### Problems immediately visible in this layout

| Issue | Impact |
|-------|--------|
| "Post a Pick" is buried in hamburger | Tipsters must hunt for their core action every session |
| "Home" and "Profile" both appear in nav and mean different things | Confusing — one is your stats dashboard, one is your public page |
| "Analytics" lives in the primary nav alongside lightweight pages | A deep power tool sitting next to Leaderboard and Feed raises the cognitive weight of the nav |
| Notifications and Settings are in the hamburger content list | These are utility actions, not content pages — they don't belong alongside Pick, Badges, News |
| No clear visual weight distinction between content pages and tools | Simulator, Compare, Hall of Fame, and News feel equally important, which they are not |

---

## 2. COMPLETE PAGE INVENTORY — PURPOSE AND TIER

### Tier 1 — Core loop (visited every session)

| Page | Path | True Purpose | Who Uses It |
|------|------|--------------|-------------|
| Dashboard | /dashboard | Post a pick — the single most important action for tipsters | Tipsters |
| Home | /home | Your own verified record — stats, streak, current picks, division | Tipsters |
| Feed | /feed | Real-time activity stream of all tipsters posting and winning | Tipsters + Followers |

### Tier 2 — Discovery (visited frequently, 2-3×/week)

| Page | Path | True Purpose | Who Uses It |
|------|------|--------------|-------------|
| Leaderboard | /leaderboard | Find and rank all tipsters by performance | Followers + Tipsters |
| Tipster Profile | /tipster?u= | Evaluate any individual tipster's full record | Followers evaluating follows |
| Community | /community | Live chat by sport room — discussion, debate, sharing | Both |
| Notifications | /notifications | See picks from followed tipsters, division changes, results | Followers |

### Tier 3 — Prestige / Gamification (visited occasionally, weekly or on milestone)

| Page | Path | True Purpose | Who Uses It |
|------|------|--------------|-------------|
| Progress | /progress | Track your division standing, season position, ELO history | Tipsters |
| Badges | /badges | View achievement vault, see what's locked vs unlocked | Tipsters |
| Hall of Fame | /hall-of-fame | All-time records, season champions, historical bests | Power users |

### Tier 4 — Tools (visited on demand, high intent)

| Page | Path | True Purpose | Who Uses It |
|------|------|--------------|-------------|
| Analytics | /analytics | Deep stats: ROI curve, CLV, variance, 26-week heatmap | Performance-focused tipsters |
| Compare | /compare | Head-to-head two tipsters across all metrics | Followers deciding between two tipsters |
| Simulator | /simulator | Model bankroll growth following a tipster | Followers evaluating risk |

### Tier 5 — Supplementary (passive, visit when curious)

| Page | Path | True Purpose | Who Uses It |
|------|------|--------------|-------------|
| News | /news | Sports intel, injury reports, lineup data before posting picks | Tipsters researching picks |
| Archetypes | /archetypes | Explains betting DNA archetypes | Curiosity, onboarding context |

### Tier 6 — Utility (visited when needed, not browsed)

| Page | Path | True Purpose |
|------|------|--------------|
| Settings | /settings | Identity customisation, subscriptions, profile data |
| Notifications | /notifications | See recent alerts from followed tipsters |
| Login / Register | /login, /register | Auth entry and OTP verification |
| Subscribe success/cancel | /subscribe/* | Stripe post-payment redirect pages |
| Become a Tipster | /become-a-tipster | Marketing conversion page for new tipsters |

---

## 3. DUPLICATE PAGE PURPOSES — WHAT OVERLAPS WHAT

### Overlap 1: Home vs Tipster (your own profile)

| | Home (/home/) | Your Tipster Page (/tipster?u=you) |
|-|--------------|-----------------------------------|
| Shows your stats | ✅ ROI, streak, division, ELO | ✅ Same stats, different layout |
| Shows your pick history | ✅ Community feed section | ✅ Full pick history |
| Shows your archetype | ✅ Hero card | ✅ DNA section |
| Follow button | ❌ | ✅ (awkward on own profile) |
| Subscribe button | ❌ | ✅ (awkward on own profile) |

**Verdict:** Home is your private dashboard (full auth context, live data, post CTA). Tipster is the public-facing view of any user. When you navigate to your own tipster page you see a near-duplicate. The distinction is unclear and the overlap creates confusion about which one is "your profile."

**Recommended fix:** Home = action hub. Tipster = public portfolio. Make them clearly different. Home should not replicate the pick history grid that Tipster already does — it should focus on today's context (what to post, your streak status, who to watch).

---

### Overlap 2: Leaderboard vs Hall of Fame

| | Leaderboard (/leaderboard/) | Hall of Fame (/hall-of-fame/) |
|-|-----------------------------|-------------------------------|
| Shows ranked tipsters | ✅ Current season and all-time tabs | ✅ All-time records only |
| Seasonal data | ✅ Multiple season tabs | ✅ Season champions list |
| Podium top 3 | ✅ Animated podium | ✅ Historical podium entries |
| Navigation to tipster | ✅ Every row links to /tipster | Varies |

**Verdict:** The Leaderboard already has an all-time tab. Hall of Fame is a more atmospheric version of data that exists inside Leaderboard. Hall of Fame is currently a semi-dead page — users who find the leaderboard satisfying have no reason to seek out Hall of Fame.

**Recommended fix:** Hall of Fame should differentiate by focusing on: season champions (one winner per season), milestone holders (most wins ever, longest streak ever, highest single ROI). It should NOT be a parallel leaderboard — it should be a shrine to exceptional moments and records.

---

### Overlap 3: Home (activity section) vs Feed

| | Home activity section | Feed (/feed/) |
|-|-----------------------|----------------|
| Shows live pick activity | ✅ Community feed cards, trending picks | ✅ Full real-time stream |
| Reactions | ✅ Tail buttons | ✅ Full reactions + tails |
| Filtering by sport | ❌ | ✅ |
| All tipsters | Partial | ✅ All |

**Verdict:** Home includes a trimmed-down version of the feed as part of its layout. Feed is the full version. Users who want the full activity stream should go to Feed — but the home page already satisfies a casual "see what's happening" need.

**Recommended fix:** Home's activity section should be deliberately lightweight — "top 3 most recent notable picks" with a "See Full Feed →" link. It should not try to replicate the Feed page; it should tease it.

---

### Overlap 4: Badges vs Progress (both are prestige systems)

| | Progress (/progress/) | Badges (/badges/) |
|-|-----------------------|---------------------|
| Division ladder | ✅ Main focus | ❌ |
| ELO history | ✅ | ❌ |
| Achievements | ❌ | ✅ Main focus |
| Season standings | ✅ | Partial |
| Rewards tied to performance | ✅ Division is performance-based | ✅ Badges are performance-based |

**Verdict:** These are distinct systems but users don't know that. Both live in the "prestige" mental bucket. If I've improved my ROI, should I go check Progress or Badges to see what changed? Answer: both, possibly. There is no link between them on either page.

**Recommended fix:** Progress and Badges should link to each other. Progress should show "Badges you can unlock at this division." Badges should show "Your current division is X — check your Progress." They are the two pillars of the same prestige system.

---

### Overlap 5: Analytics vs Home (your stats)

| | Home (/home/) | Analytics (/analytics/) |
|-|--------------|--------------------------|
| Your ROI | ✅ Hero stat | ✅ Full ROI curve |
| Win rate | ✅ Hero sub | ✅ Chart breakdown |
| Division | ✅ Badge | ❌ |
| CLV | ❌ | ✅ |
| Variance / heatmap | ❌ | ✅ |
| Sharp Score | ✅ archetypes.js gauge | ✅ Full breakdown |

**Verdict:** Home is the summary, Analytics is the deep dive. These are appropriately different in depth, but the path from Home → Analytics is not clear. There is no "See Full Analytics →" on Home's stats section.

**Recommended fix:** Add a single persistent "Analytics →" link to the stats section on Home. Make the relationship explicit: Home = overview, Analytics = go deeper.

---

## 4. PAGES USERS MAY NEVER VISIT

These pages have high discovery friction and low organic traffic:

| Page | Why Users Miss It | Risk |
|------|-------------------|------|
| /archetypes/ | Not in any nav, not in CLAUDE.md, path unclear | Orphaned page — users never find it |
| /hall-of-fame/ | Deep in hamburger menu, purpose overlaps leaderboard | Low discovery, low return visits |
| /simulator/ | Requires high intent (knowing a specific tipster to simulate) | Power user only, invisible to casual users |
| /compare/ | Same as simulator — requires knowing two tipsters to compare | Power user only |
| /news/ | Users don't think "I should check LEDGR for sports news" when they have ESPN, Twitter, etc. | Supplementary feature with low pull |
| /become-a-tipster/ | Static marketing page with no form or action | Dead conversion funnel — no path from here to registration |

---

## 5. WEAK USER FLOWS

### Flow A: First-Time Tipster (New Registration)

**Current path:**
```
/ → /register → OTP verify → /home (empty stats, no picks)
```

**Problem:** Empty state on home is demoralizing. A new tipster sees:
- ROI: 0%
- Streak: —
- Picks: 0
- Division: Bronze
- Feed: other tipsters' picks (not theirs)

**There is no guided onboarding.** /become-a-tipster is a static marketing page with no link to register from. There is no welcome flow, no "here's what to do first," no empty state CTA that celebrates the new user.

**Recommended path:**
```
/ → /register → OTP verify → /welcome (onboarding 3-step) → /dashboard (post first pick)
```

---

### Flow B: Daily Tipster (posts picks regularly)

**Current path:**
```
Open LEDGR → home → hamburger → Post a Pick → dashboard → post pick → where?
```

**Problem:** After posting a pick on /dashboard, there is no confirmation redirect. The user is left on the dashboard looking at the form. The pick they just posted is not shown anywhere on the dashboard page (picks are shown on /home).

**Recommended path:**
```
Open LEDGR → home (stats + today's standing) → [POST A PICK] button (prominent, in hero) → dashboard → post pick → /home (with pick now visible)
```

---

### Flow C: Follower Discovering Tipsters

**Current path:**
```
Open LEDGR → feed (see a name they like) → click on username → tipster profile → follow/subscribe → ???
```

**Problem after subscribing:**
- After clicking Subscribe, user is sent to Stripe checkout
- After Stripe, lands on /subscribe/success
- /subscribe/success has no nav, no "Go back to X tipster" link, no clear next step
- User is lost

**Recommended path:**
```
Open LEDGR → leaderboard (ranked list) → tipster profile → [Follow] or [Subscribe →] → Stripe → /subscribe/success (with clear "Back to @tipster" button) → tipster profile (now showing subscribed state)
```

---

### Flow D: Follower Checking Results

**Current path:**
```
Push notification → (push.js broken) → nothing
OR
Open LEDGR → home → feed section → manually find result
OR
Open LEDGR → /notifications → (localStorage only, may not have real notifications)
```

**Problem:** The entire notification delivery chain is broken. Push notifications may not fire. The /notifications page reads only localStorage, not the backend. A follower who wants to know "did @tipster win last night?" has no reliable automatic notification path.

**Recommended path (requires B9 bug fix):**
```
Push notification fires → /notifications (backend-wired) → shows result with link to pick
```

---

### Flow E: Power User Evaluating a Tipster

**Current path:**
```
Leaderboard → tipster profile (basic stats) → no direct path to simulator or compare from profile page
```

**Problem:** The evaluation tools (Simulator, Compare) are not surfaced from the Tipster profile page. A user wanting to model bankroll must:
1. Remember that /simulator exists
2. Navigate to hamburger → Simulator
3. Manually type in the tipster's username

**Recommended path:**
```
Leaderboard → tipster profile → [Simulate Following] button → /simulator?u=username (pre-filled)
→ OR → [Compare] button → /compare?a=username (pre-filled with one tipster)
```

---

## 6. DEAD-END PAGES

Pages with no clear next action after reading:

| Page | Dead End | Recommended Exit |
|------|----------|-----------------|
| /hall-of-fame/ | After seeing the all-time records, no CTA | "See Current Leaderboard →" button |
| /news/ | After reading news, no link to post a pick | "Post a Pick →" button in top right |
| /badges/ | After seeing your badges, no path to unlock more | "See Your Progress →" link to /progress/ |
| /archetypes/ | Orphaned page with no nav or next step | Integrate into /home or /settings |
| /subscribe/success/ | No navigation, just a message | "Back to @tipster" + "View Your Feed" |
| /subscribe/cancel/ | Same | "Back to @tipster" |
| /simulator/ | After running simulation, no "Follow This Tipster" CTA | "Follow @tipster" + "Subscribe to @tipster" CTAs |
| /compare/ | After comparing, no path to act on the comparison | "View @tipsterA" + "View @tipsterB" CTAs |

---

## 7. IDEAL NAVIGATION STRUCTURE

### Principle

```
Primary nav    = pages you visit EVERY session
Secondary nav  = pages you visit ON INTENT  
User menu      = utility actions (not content)
```

### Recommended Desktop Nav

```
[LEDGR logo]  |  Discover  |  Feed  |  Community  |  [Post a Pick]  |  [🔔]  |  [@username ▾]
```

Where:
- **Discover** — opens a mega-dropdown or links to Leaderboard (current rankings)
- **Feed** — live activity stream
- **Community** — chat rooms  
- **Post a Pick** — primary CTA button (accent colour, always visible to authenticated tipsters)
- **🔔** — notification bell with badge count, links to /notifications
- **@username ▾** — user dropdown containing: My Profile, My Analytics, Progress, Badges, Simulator, Compare, Hall of Fame, News, Settings, Log Out

### Recommended Mobile Nav (Bottom Tab Bar)

```
[🏠 Home]  [🏆 Board]  [+]  [🔴 Feed]  [👤 Me]
```

Where:
- **Home** — /home (your dashboard)
- **Board** — /leaderboard
- **+** — centre FAB button → /dashboard (Post a Pick) — permanently visible
- **Feed** — /feed
- **Me** — slide-up user menu: Profile, Analytics, Progress, Badges, Community, Notifications, Settings

---

## 8. PAGE HIERARCHY (CANONICAL)

```
LEDGR
│
├─ PUBLIC / UNAUTHENTICATED
│   ├── / (landing)
│   ├── /leaderboard (public — anyone can browse)
│   ├── /tipster?u= (public profile — anyone can view)
│   ├── /hall-of-fame (public — anyone can view)
│   ├── /become-a-tipster
│   ├── /login
│   ├── /register
│   ├── /privacy
│   └── /terms
│
├─ AUTHENTICATED — CORE LOOP
│   ├── /home            ← daily starting point for tipsters
│   ├── /dashboard       ← post a pick (PRIMARY ACTION)
│   ├── /feed            ← see all activity
│   └── /notifications   ← your alerts
│
├─ AUTHENTICATED — DISCOVERY
│   ├── /leaderboard     ← find tipsters
│   ├── /tipster?u=      ← evaluate a tipster
│   └── /community       ← discuss picks
│
├─ AUTHENTICATED — PRESTIGE
│   ├── /progress        ← division + ELO ladder
│   └── /badges          ← achievement vault
│
├─ AUTHENTICATED — TOOLS
│   ├── /analytics       ← your deep stats (link FROM /home)
│   ├── /simulator?u=    ← model following a tipster (link FROM /tipster)
│   └── /compare?a=&b=   ← head-to-head (link FROM /leaderboard or /tipster)
│
├─ AUTHENTICATED — SUPPLEMENTARY
│   ├── /news            ← sports intel (link FROM /dashboard as "research")
│   └── /hall-of-fame    ← all-time records (link FROM /leaderboard)
│
├─ AUTHENTICATED — UTILITY
│   └── /settings        ← profile, subscriptions, preferences
│
└─ PAYMENTS
    ├── /subscribe/success
    └── /subscribe/cancel
```

---

## 9. DAILY USER FLOW (RETURNING TIPSTER)

```
Login / already authed
        │
        ▼
/home — check overnight results
  ├── Streak updated? → division badge in hero
  ├── Any new followers? → check /notifications
  └── Today has fixtures? → click News icon → /news
        │
        ▼
/news (optional research)
  └── Done → click "Post a Pick" in nav
        │
        ▼
/dashboard — post pick(s)
  └── Pick submitted → auto-redirect to /home (pick now visible)
        │
        ▼
/feed (optional) — see community reaction to picks
  └── React to others' picks, community activity
        │
        ▼
/community (optional) — discuss the day's slates
```

---

## 10. FIRST-TIME USER FLOW

```
/ (landing) — "LEDGR is the verified sports tipster platform"
  └── "Get Started" CTA
        │
        ▼
/register → email OTP (verify.js)
        │
        ▼
/home (empty state)
  ├── ❌ CURRENT: shows empty stats, no guidance
  └── ✅ RECOMMENDED: show onboarding welcome card:
      "Welcome @username. You have 0 picks posted.
       Your record starts now — post your first pick."
       [POST YOUR FIRST PICK →]
        │
        ▼
/dashboard — post first pick
  ├── Select sport, event, market, odds, stake
  ├── Submit → immutable pick created
  └── Redirect to /home (pick now in record)
        │
        ▼
/home — sees first pick, Bronze division badge, streak starts
  └── "Explore the leaderboard to see who you're competing against →"
        │
        ▼
/leaderboard — discovery of community
  └── Click on a tipster → /tipster — evaluates another player
```

---

## 11. POWER USER FLOW

```
/leaderboard — scan current rankings
  ├── Filter by sport
  ├── Check ELO distribution
  └── Click on rising tipster
        │
        ▼
/tipster?u=sharptipster
  ├── Review pick history, ROI curve
  ├── Check archetype (The Sharp, The Demon, etc.)
  ├── Click "Simulate Following" → /simulator?u=sharptipster (pre-filled)
  │       └── Run Kelly/compound model → bankroll projection
  │
  └── Click "Compare" → /compare?a=sharptipster&b=othertipster
            └── Head-to-head all metrics
                    │
                    ▼
            Decide to subscribe → /subscribe/success
                    │
                    ▼
            /tipster?u=sharptipster (return, see subscriber state)
```

---

## 12. MOBILE FLOW

On mobile the hamburger nav is the primary navigation. Current problems:

1. **Post a Pick is in the hamburger** — a tipster on mobile must open the menu to do their primary action
2. **No bottom tab bar** — all navigation is top-right hamburger, which requires two-handed use
3. **Notifications badge** — not visible on mobile without opening the hamburger

**Recommended mobile-first navigation:**
- Bottom tab bar with 5 tabs: Home | Leaderboard | [+] | Feed | Me
- The `[+]` tab is a permanently visible FAB (floating action button) that opens /dashboard
- The "Me" tab opens a slide-up sheet: Profile, Analytics, Progress, Badges, Community, Notifications, Settings
- Notification badge appears on the "Me" tab icon

---

## 13. RECOMMENDED STRUCTURAL CHANGES

These are product-structure recommendations. No visual redesign required.

### Priority 1 — Fix dead flows

| Change | Why | Effort |
|--------|-----|--------|
| Add "Simulate Following" button to /tipster page | Tools are invisible from context where they're most needed | Low |
| Add "Post a Pick" link/button to /news page | News is research for picking — the next action should be obvious | Low |
| Add "See Your Progress →" link from /badges | These two systems need to be cross-linked | Low |
| Add clear navigation to /subscribe/success and /subscribe/cancel | Users are stranded after Stripe | Low |
| Empty state on /home for new users with zero picks | New users see confusing empty stats | Medium |

### Priority 2 — Reduce duplication

| Change | Why | Effort |
|--------|-----|--------|
| Remove the trimmed feed section from /home OR explicitly link it to /feed | Partial feed on home creates ambiguity about what Feed is | Medium |
| Differentiate /hall-of-fame from /leaderboard (all-time tab) | Users need to understand why both exist | Medium |
| Link /progress and /badges to each other | They're two pillars of the same prestige system | Low |

### Priority 3 — Improve primary nav

| Change | Why | Effort |
|--------|-----|--------|
| Surface "Post a Pick" as a persistent nav button, not hamburger item | Most important tipster action buried 2 taps deep | Medium |
| Move Settings + Notifications to a user dropdown (not hamburger content list) | These are utility actions, not content pages | Medium |
| Add "Simulate →" and "Compare →" quick-links to /tipster page | Tools discovery requires knowing they exist | Low |
| Rename "Home" + "Profile" in nav — they mean different things | "Home" = your dashboard, "Profile" = public tipster page | Low |

### Priority 4 — Reduce orphaned pages

| Change | Why | Effort |
|--------|-----|--------|
| Either document and link /archetypes/ into the nav or absorb its content into /settings or /home | It's invisible and undiscoverable | Low |
| Add /become-a-tipster → /register conversion path | Static marketing with no action is a dead end | Low |

---

## 14. OVERALL ASSESSMENT

### What works well

- **Leaderboard → Tipster profile flow** — discovering and evaluating tipsters is smooth
- **Dashboard pick posting** — the core product action is clear and functional
- **Feed as a standalone page** — real-time activity stream is well-focused
- **Community** — distinct from feed (chat vs passive), appropriate for its purpose
- **Progress + Badges separation** — conceptually parallel, each goes deep on its own system

### What is confused

- **Home vs Tipster (your own profile)** — users don't know which one is "their profile"
- **Badges vs Progress** — users don't know which page to go to for "how am I doing"
- **Leaderboard vs Hall of Fame** — purpose of Hall of Fame unclear when leaderboard has all-time tab
- **Notifications** — visible in the product but entirely disconnected from the actual notification system (B9 bug)

### What is invisible

- **Simulator** — users who would benefit most (followers evaluating a tipster) never encounter it
- **Compare** — same. No entry point from context where the decision is being made
- **Archetypes page** — not in CLAUDE.md, not in any nav. Purpose unclear
- **Analytics** — accessible in primary nav but no deep link from the stats sections that would motivate a user to go there

### Critical flow at risk

The **follower retention flow** is broken:
```
Tipster posts pick → autoVerify grades it → notification sent to followers → followers check result
```
If step 3 fails (notifications not wired), followers have no reason to return to LEDGR the next day unless they happen to open the app. The product's core retention hook — "come back to see how your picks did" — depends on notification delivery working end-to-end.

---

*End of LEDGR_PRODUCT_FLOW.md*
