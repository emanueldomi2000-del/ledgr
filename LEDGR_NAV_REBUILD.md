# LEDGR NAV REBUILD

---

## 1. Primary Navigation (desktop bar, always visible)

Six items. Desktop label shown in the nav bar. All `desktopVisible: true`.

| Order | Label      | href           | Icon | Key          |
|-------|------------|----------------|------|--------------|
| 1     | Home       | /home          | 🏠   | home         |
| 2     | Leaderboard| /leaderboard   | 🏆   | leaderboard  |
| 3     | Feed       | /feed          | 🔴   | feed         |
| 4     | Analytics  | /analytics     | 📊   | analytics    |
| 5     | Community  | /community     | 💬   | community    |
| 6     | Post Pick  | /dashboard     | ＋   | dashboard    |

**Change required:** `dashboard` is currently `desktopVisible: false`. Flip it to `true`. Add `desktopLabel: 'Post Pick'`.

---

## 2. Secondary Navigation (slide menu only, `desktopVisible: false`)

Ten items. Ordered as specified. These appear below the primary items in the slide menu.

| Order | Label        | href                      | Icon | Key          | Notes                        |
|-------|--------------|---------------------------|------|--------------|------------------------------|
| 1     | Profile      | /tipster?u={username}     | 👤   | profile      | href built dynamically in JS |
| 2     | Progress     | /progress                 | 🎮   | progress     | existing                     |
| 3     | Badges       | /badges                   | 🏅   | badges       | existing                     |
| 4     | Archetypes   | /archetypes               | ⚡   | archetypes   | **MISSING — must add**       |
| 5     | Simulator    | /simulator                | 📈   | simulator    | existing                     |
| 6     | Compare      | /compare                  | ⚖️   | compare      | existing                     |
| 7     | Hall of Fame | /hall-of-fame             | 🏛️  | hall-of-fame | existing                     |
| 8     | Sports Intel | /news                     | 📰   | news         | existing                     |
| 9     | Settings     | /settings                 | ⚙️   | settings     | existing                     |
| 10    | Notifications| /notifications            | 🔔   | notifications| existing                     |

**Notifications** moves from current position (after dashboard) to the end of secondary nav. Profile and Archetypes are new entries.

---

## 3. Restored Destinations & Required Changes to `app-nav.js`

### Additions
- **Archetypes** `/archetypes` — completely absent from `NAV_LINKS`. Add as secondary entry with `desktopVisible: false`.
- **Profile** `/tipster?u={username}` — not currently in nav at all. The href must be dynamic: built from `localStorage.getItem('ledgr_user')` at init time. Add to slide menu only.

### Changes to existing entries
- `dashboard`: `desktopVisible: false` → `desktopVisible: true`. Add `desktopLabel: 'Post Pick'`.
- Reorder the full `NAV_LINKS` array so primary (desktopVisible) items come first, then secondary items in the specified order.

### Current → Target NAV_LINKS order
```
// PRIMARY (desktop bar)
{ home, desktopVisible: true }
{ leaderboard, desktopVisible: true }
{ feed, desktopVisible: true }
{ analytics, desktopVisible: true }
{ community, desktopVisible: true }
{ dashboard/Post Pick, desktopVisible: true }   ← was false, now true

// SECONDARY (slide menu)
{ profile → /tipster?u=..., desktopVisible: false }   ← new, dynamic href
{ progress, desktopVisible: false }
{ badges, desktopVisible: false }
{ archetypes, desktopVisible: false }                  ← new
{ simulator, desktopVisible: false }
{ compare, desktopVisible: false }
{ hall-of-fame, desktopVisible: false }
{ news, desktopVisible: false }
{ settings, desktopVisible: false }
{ notifications, desktopVisible: false }
```

Profile `href` approach: in `AppNav.init()`, after reading the user from localStorage, replace the profile entry's href with `/tipster?u=<username>` before rendering. If no user is found, omit the Profile entry.

---

## 4. Home Page Audit

### 4a. What loads correctly (LIVE data)
- **Stats row** (Total Picks, Win Rate, ROI, P&L) — fetches `/picks`, renders immediately after `loadData()`.
- **Identity card** — avatar, division, rank, streak, ROI curve sparkline — works from picks + ranking API.
- **Mini leaderboard** (right panel) — fetches `/rankings?limit=5`. Skeleton shows until data arrives.
- **Community chat preview** — fetches `/chat/rooms` then `/chat/rooms/:id/messages`. Has error fallback.
- **Trending picks** — top 4 pending picks from `/picks`. Shows "No picks right now" correctly.
- **Community feed** — last 14 picks, rendered inline. Shows "No picks yet" correctly.
- **Elite Matchup** — top 2 tipsters from picks data. Only renders if 2+ tipsters with 5+ picks.
- **Activity ticker** — built from settled picks + pending picks. Falls back to recent posts.
- **Rising Tipsters** — uses `/rankings?limit=5` if available, else local calculation.
- **Weekly Recap modal** — fires after 6+ days if user has 2+ settled picks.

### 4b. Sections that appear EMPTY or DEAD

**Records of the Day grid** (`#recordsWrap`)
- Shows `—` and "No data yet today" for all 4 cards (Biggest Win, Hottest Streak, Highest Odds Win, Best ROI) whenever there are no recent settled picks.
- On quiet days or for new users, all 4 cards render empty simultaneously. Looks broken, not just quiet.
- Fix: show community-level fallback data (e.g. best pick from last 48h instead of last 24h). Widen the window.

**Hot-bar strip** (Most Backed / Most Active / Best ROI)
- All three values start as `—` before JS fills them.
- If there are no pending picks (`trendBacked` stays `—`), Most Backed never renders. No empty state — just a dash.
- Most Active and Best ROI both check only `today`'s picks — zero on quiet mornings.
- Fix: extend "today" to last 24h for these counters; add "quiet" copy if all three are empty.

**Season Info Card** (`#seasonInfoCard`)
- Remains `display:none` unless `/seasons/active` returns a valid season with `startDate`/`endDate`.
- If there is no active season (common state for early-stage product), this card is fully invisible, leaving an unexplained gap in the right-panel layout.
- Fix: show a "Season starting soon" placeholder when the API returns null.

**Tail counts in community feed**
- All feed cards render with "0 tailed" before the async `loadHomeTailCount()` calls resolve.
- Users see 14 cards all saying "0 tailed" on load — looks like a dead feature.
- Fix: omit "0 tailed" text entirely; only show the count once it's >0 and loaded.

**Comments / Reactions**
- Comments are localStorage-only. Clearing cache wipes all comments. Not a bug but means the section always feels empty for new users or after cache clear.
- Reactions (🔥 🤯) are also localStorage-only — counts always start at 0, no persistence.
- These are known product limitations, not fixable without backend work.

**Community Chat Preview**
- Shows "Chat unavailable" on any fetch error — including backend downtime or empty rooms.
- "No messages yet — be the first!" renders if rooms exist but have no messages. Reasonable.
- Risk: if `/chat/rooms` is slow, the "Loading…" state persists visibly for the entire page load.

### 4c. Oversized / Broken Spacing

**Post CTA strip** (`.post-cta-wrap`)
- Sits directly below the main `.main` padding (32px top). The CTA itself has its own padding.
- On desktop, this creates a large empty band between the hot-bar strip and the main grid.
- The CTA is also duplicated as a floating FAB on mobile (`#floatingPost`). On mobile the static CTA wastes space.

**Hero section height**
- Two-column layout. Right identity card has significant internal padding.
- On mobile the columns stack, making the hero section very tall before any content is visible.
- The login streak bar in the RIGHT panel repeats streak information that's also in the identity card.

**Match-up section** (`.matchup-section`)
- Lives outside `.main`, below the grid. Has its own full-width background treatment.
- Gap between the bottom of `.main-grid` and the matchup section is large and feels like the page ended.
- On mobile, the momentum bar layout breaks if tipster names are long.

**Section spacing in left column**
- 3 × `margin-bottom:28px` blocks (Chat Preview → Trending Picks → Community Feed) stacked with section headers — feels padded rather than dense.
- On a quiet day (no trending picks, no feed items), all three show "Loading…" or "No data" simultaneously, making the left column look empty below the quick actions.

### 4d. Dead or Missing Widgets

**Archetype chip in hero** (`#heroArchHero`)
- Renders `renderHeroArch()` from `user.archetype` in localStorage.
- Only populates if user has set an archetype in `/archetypes` — but that page is missing from nav entirely.
- For users who haven't visited `/archetypes`, the hero archetype chip never appears (returns early).

**Subscriber count** (`#idSubscriberCount`)
- Hidden by default. Only shown if `/subscribers/:userId` returns `count > 0`.
- New users / tipsters with no subscribers: invisible element, no impact, correct.

**`exportWinCard` (canvas export)**
- No loading state while canvas draws. Triggers a file download immediately — no visual confirmation.
- Minor UX issue, not a structural problem.

---

## 5. Home Page Hub Rebuild Plan

The page is architecturally complete but feels empty because:
1. Loading states render dashes and "Loading…" text with no animation.
2. On quiet days, 4–6 sections simultaneously show empty states.
3. Spacing is too generous — sections feel disconnected rather than dense.
4. The archetype chip (a key identity signal) never renders for users who haven't set an archetype.

### Target: Home feels alive immediately after login

**No new features. Existing data, better presentation.**

---

### Change 1 — Compact the hero section

Current: Two-column hero with large identity card + separate stats row below.
Target: Single compact profile bar at top, then stats row immediately.

- Identity card stays but loses bottom padding. Reduce internal gaps.
- The ROI sparkline in the identity card is small enough to keep.
- Move the login streak out of the right panel (it's a duplicate of identity card streak). Remove `loginStreakDays2`/`loginStreakCount2` from right panel, keep only in identity card.
- The hero tagline text (`YOUR RECORD / SPEAKS.`) can stay but shrink font-size by ~10%.

---

### Change 2 — Records of the Day: extend time window

Current: Only picks from the last 24h count.
Target: Use 48h window, label as "Recent Records" when today has no data.

- In `renderRecords()`: change `Date.now()-86400000` to `Date.now()-172800000` for the initial fetch.
- If all picks come from yesterday rather than today, change card labels from "TODAY" to "RECENT".
- This prevents all 4 cards from showing empty simultaneously during morning hours.

---

### Change 3 — Hot-bar strip: fix "—" placeholders

Current: Static `—` until JS fills them; stays `—` if no data for "today".
Target: Show meaningful fallback copy.

- If `trendBacked` has no data: show "No live picks" with muted styling.
- If `trendTipster` (Most Active today) has no data: show "Check back later" or last-24h data.
- Replace raw `—` with styled empty-state copy inside each `hot-val`.

---

### Change 4 — Hide "0 tailed" in community feed

Current: Every feed card renders "0 tailed" on load, updated asynchronously.
Target: Show nothing until count > 0.

- In `renderFeed()`, the tail count span `<span class="tail-count" id="tc_${p.id}">0 tailed</span>` → start with empty text: `''`.
- `loadHomeTailCount()` already only sets text when `d.count > 0` — so this fixes itself once async resolves.
- Only the initial render needs the change: replace `0 tailed` with empty string.

---

### Change 5 — Archetype prompt in hero (for users without archetype set)

Current: `renderHeroArch()` returns early if no archetype → chip never appears.
Target: Show a "Set your archetype →" CTA chip if no archetype is set.

- In `renderHeroArch()`, when `arch` is falsy: render `<a class="hero-arch hero-arch-cta" href="/archetypes">⚡ SET ARCHETYPE →</a>` instead of returning.
- This makes the archetype nav destination visible from the home page and gives users a reason to visit it.

---

### Change 6 — Season card fallback

Current: Card stays hidden if no active season.
Target: Show "Off-Season" card so the right panel layout doesn't have an invisible gap.

- In `loadSeasonInfo()`, when the API returns non-OK or empty: render the card with copy "OFF-SEASON · Next season coming soon" and `display:block`.
- Keep the same card styling, just no progress bar.

---

### Change 7 — Reduce left column spacing

Current: 3 × `margin-bottom:28px` between Community Chat Preview / Trending Picks / Community Feed.
Target: Tighten to `margin-bottom:20px` for each.

- Also reduce `.section-head` / `.section-head-row` margin-bottom from current value to 10px.
- Net effect: left column feels denser, less "one section per screen" paging.

---

### Change 8 — Post CTA: hide on mobile (use FAB instead)

Current: Static Post CTA banner visible on all screen sizes; FAB also shows on mobile ≤600px.
Target: Static CTA hidden on mobile. FAB is the only post entry point on mobile.

- Add `@media(max-width:600px){ .post-cta-wrap { display:none; } }` to home's style block.
- The FAB (`#floatingPost`) is already `display:flex` on mobile — this just removes the redundant static CTA.
- Saves ~80px of vertical space above the main grid on mobile.

---

## Implementation Order

1. `app-nav.js` — nav structure changes (section 1–3)
2. `home/index.html` — change 4 (tail counts): 1-line fix, lowest risk
3. `home/index.html` — change 3 (hot-bar copy): replace 3 dash strings
4. `home/index.html` — change 2 (records time window): 1-line change in `renderRecords()`
5. `home/index.html` — change 8 (mobile CTA): 1 CSS rule
6. `home/index.html` — change 7 (spacing): 3 margin-bottom values
7. `home/index.html` — change 5 (archetype CTA): add 2 lines to `renderHeroArch()`
8. `home/index.html` — change 6 (season fallback): update `loadSeasonInfo()` catch
9. `home/index.html` — change 1 (hero compact): layout + remove duplicate streak widget
