# LAST TASK

Date: 2026-05-20

Current phase: PHASE 3 — Prestige + Monetization Foundation

Current objective: Sprint 4 Remaining ✅ COMPLETE

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

## Next tasks

Phase 3 remaining work:
1. B2: Archetypes manually selectable in settings (currently computed-only)
2. B7: Void handling UX — user should see "VOID" state with explanation on their pick cards
3. Deploy to Railway — run autoVerify-schema.sql migration if not yet applied
4. Smoke test: post pick → /admin/grading/run → verify rank_up fires → push notification delivered
