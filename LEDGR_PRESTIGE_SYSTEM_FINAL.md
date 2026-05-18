# LEDGR PRESTIGE SYSTEM — FINAL ARCHITECTURE
## Validated, Revised, Implementation-Ready

Date: 2026-05-18
Status: Architecture only — no code changes
Supersedes: LEDGR_PRESTIGE_SYSTEM.md
Validation source: LEDGR_PRESTIGE_VALIDATION.md (31 issues resolved)
Scope: Archetypes, cosmetics, profile showcase, prestige economy, monetization

---

## CORE PRINCIPLES

1. **Reputation is earned, not bought.** The highest-prestige items come from verified performance. Premium cosmetics exist at their own visual tier — they are distinct from earned items, not superior to them.

2. **Identity reflects behavior.** Archetype, border, showcase — they tell the story of how you bet. Earned cosmetics signal what you achieved. Premium cosmetics signal support. Neither is substitutable for the other.

3. **No pay-to-win mechanics, ever.** No purchase can improve ranking, increase notification speed, add advantage on timing, or affect how picks are verified. These boundaries are absolute.

4. **Trust vocabulary is not for sale.** The word "Verified" and the concept of verification belong to the pick record. No premium tier, product name, or badge copy may use "Verified" to describe a paid feature.

5. **Desire loops must be visible and earn-first.** When a user sees a cosmetic they want, the first path shown is how to earn it. Premium paths are visible but never the first frame.

6. **Every identity loss has a narrative.** Archetype changes, streak ends, and division drops are product moments — not silent downgrades. The system acknowledges loss as part of a story, not an error state.

---

## SECTION 1 — ARCHETYPE SYSTEM

### 1.1 Philosophy

Archetypes are auto-assigned betting identity labels derived entirely from verified pick data. They cannot be manually selected (Bug B2 must be removed). They describe how a tipster actually bets — a stranger reading their profile knows their style before reading a single pick.

### 1.2 Active Archetype Roster (7 archetypes + 1 new-user state)

Seven active archetypes. Every tipster holds exactly one at a time. New users and unqualified tipsters hold THE CONTENDER, which is a real state — not a placeholder.

---

#### THE SHARP
> Consistently finds value the market underprices. Beats the closing line.

**Backend key:** `sharp`

**Visual:** Electric blue nameplate glow. SVG badge: crossed lightning bolts.

**Primary criteria (all required):**
1. Average CLV > +2.0% over last 20 settled picks
2. ROI > +8% over last 30 picks
3. Minimum 20 settled picks
4. Win rate ≥ 52%

**Secondary bonuses:** CLV > +3.0% (+25), ROI > +15% (+25)

**Distinguishing trait:** CLV is the primary qualifier. Edge quality, not just results.

---

#### THE VALUE HUNTER
> Targets mispriced odds. High-odds picks, positive long-run EV.

**Backend key:** `value-hunter`

**Visual:** Gold nameplate glow. SVG badge: magnifying glass over odds slip.

**Primary criteria (all required):**
1. Average odds > 2.20 over last 20 settled picks
2. ROI > +5% over last 30 picks
3. Minimum 15 settled picks
4. Less than 25% of picks at odds < 1.80

**Secondary bonuses:** Avg odds > 2.80 (+25), ROI > +10% (+25)

---

#### THE UNDERDOG HUNTER
> Backs underdogs. Wins where the crowd bets wrong.

**Backend key:** `underdog-king` (repurposed from existing backend key)

**Visual:** Orange nameplate glow. SVG badge: arrow pointing opposite crowd direction.

**Primary criteria (all required):**
1. ≥ 40% of settled picks on the underdog/away/higher-odds side
2. Positive ROI on those underdog picks (> 0%)
3. Average odds on underdog picks > 2.10
4. Minimum 20 settled picks

**Secondary bonuses:** Underdog ratio ≥ 55% (+25), Underdog pick ROI > +8% (+25)

**Note:** The Contrarian archetype from the original design is replaced by this. The public betting % proxy (which was gameable) is removed entirely. This archetype is defined by what a tipster bets on, not the crowd's position.

---

#### THE GRINDER
> Volume, consistency, steady edge. Wins through repetition.

**Backend key:** `grinder`

**Visual:** Steady white/silver glow. SVG badge: gear with streak counter.

**Primary criteria (all required):**
1. Total settled picks ≥ 50
2. Settled picks in last 60 days ≥ 20 (active, not posting-quota)
3. Positive ROI over last 60 days
4. ROI between +3% and +15% (consistent, not a moonshooter)

**Secondary bonuses:** Total settled picks ≥ 100 (+25), Consistent ROI variance < 10% (+25)

**Note:** The "average picks per week ≥ 4" posting quota has been removed. This was incentivizing forced picks for cosmetic maintenance. Volume is now measured by settled count and activity window, not posting rate.

---

#### THE SPECIALIST
> Dominates one sport. Focus is the edge.

**Backend key:** `specialist` (new key — must be added to VALID_ARCHETYPES)

**Visual:** Sport-specific accent color (dynamic). SVG badge: sport-specific symbol (dynamic, updates if sport changes).

**Primary criteria (all required):**
1. ≥ 65% of settled picks in a single sport
2. ROI in that sport > +10%
3. Minimum 20 picks in that sport
4. Win rate in that sport ≥ 5% above overall win rate

**Secondary bonuses:** Sport concentration ≥ 80% (+25), Sport ROI > +20% (+25)

**Dynamic badge behavior:** The badge icon and accent color update when the qualifying sport changes.

---

#### THE DOCUMENTARIAN
> Data-first. Confident when the edge is real. Calibrated, not verbose.

**Backend key:** `data-nerd` (repurposed from existing backend key; label changes to "The Documentarian")

**Visual:** Cyan nameplate glow. SVG badge: clipboard with data chart.

**Primary criteria (all required):**
1. Confidence field filled on ≥ 80% of settled picks
2. CLV > +1.5% on picks where confidence is "high" or "max"
3. Minimum 20 settled picks total
4. At least 10 high/max-confidence picks settled

**Secondary bonuses:** Confidence fill rate ≥ 90% (+25), High-confidence CLV > +3.0% (+25)

**Note:** Replaces The Analyst from the original design. The Analyst was gameable by copy-pasting 15-word reasoning text. The Documentarian qualifies via confidence calibration — their stated conviction is verified through outcomes (CLV on high-confidence picks), not word count.

---

#### THE HIGH STAKES
> Maximum conviction, maximum stake. Swings big when the edge is real.

**Backend key:** `high-stakes` (new key — must be added to VALID_ARCHETYPES)

**Visual:** Gold/crimson dual-tone glow. SVG badge: chip stack with upward arrow.

**Primary criteria (all required):**
1. At least one pick with stake ≥ 3u (absolute floor — prevents sandbagging)
2. Win rate on picks with stake ≥ 2× personal median ≥ 55%
3. At least 10 picks at ≥ 2× median stake settled
4. Minimum 15 settled picks total

**Secondary bonuses:** High-stakes win rate ≥ 65% (+25), Max stake ≥ 5u (+25)

**Note:** The original relative threshold (3× median) was gameable by posting 20 tiny picks then 10 slightly larger ones. The absolute 3u floor and accuracy requirement verify genuine high-conviction behavior.

---

#### THE CONTENDER (new-user state)
> Identity in formation. The record is being written.

**Backend key:** `contender` (new key — must be added to VALID_ARCHETYPES)

**Visual:** Clean silver/slate single-color border. Full badge slot — not dashed, not greyed. Neutral professional aesthetic.

**Assignment condition:** Fewer than 10 settled picks, OR no archetype's primary criteria are met.

**Display:** Label "THE CONTENDER" shown in full. Tooltip: "Your betting style is being assessed — keep posting picks to unlock your identity."

**Rules:**
- THE CONTENDER is the entry state for new users. It looks like a real archetype, not a broken placeholder.
- Once a user holds a named archetype, they NEVER revert to THE CONTENDER. If they lose all archetype criteria, they are assigned the closest-matching archetype.
- If recalculation can find no qualifying archetype AND the user once held a named archetype: assign THE GRINDER if total picks ≥ 30 (volume exists), otherwise THE VALUE HUNTER as the default fallback.

---

### 1.3 Assignment Algorithm

Run weekly (Sunday midnight UTC, aligned with weekly ranking snapshot). Also triggered mid-week if user has 10+ new settled picks since last assignment.

```
function scoreArchetype(archetype, stats):
  score = 0
  
  // PRIMARY CRITERIA: all must be met. Each = 25 points.
  for each criterion in archetype.primary:
    if criterion.test(stats):
      score += 25
    else:
      return 0  // Hard fail — all primary criteria required

  // SECONDARY BONUSES: how far above threshold
  for each bonus in archetype.secondary:
    if bonus.test(stats): score += bonus.points

  return score  // Minimum 100 if all primary criteria met

function assignArchetype(userId, stats):
  scores = {}
  for each archetype in [SHARP, VALUE_HUNTER, UNDERDOG_HUNTER,
                          GRINDER, SPECIALIST, DOCUMENTARIAN, HIGH_STAKES]:
    scores[archetype] = scoreArchetype(archetype, stats)

  bestScore = max(scores.values())
  if bestScore < 100: return CONTENDER

  // Tiebreaker: if two archetypes score within 10 points
  // Prefer in order of specificity (harder to fake = higher priority)
  PRIORITY = [SHARP, VALUE_HUNTER, UNDERDOG_HUNTER, GRINDER,
              SPECIALIST, DOCUMENTARIAN, HIGH_STAKES]
  candidates = [a for a in PRIORITY if scores[a] >= bestScore - 10]
  return candidates[0]  // first in priority order among tied candidates
```

### 1.4 Assignment Stability Rules

**Upgrades** (moving to a higher-specificity archetype): triggered at 5 new settled picks since last check.

**Downgrades** (changing to a different archetype, losing current): require minimum 15 settled picks held on current archetype before any change. 10-pick grace period: if recalculation would result in a downgrade, emit a warning notification 10 picks before committing the change.

**Warning notification payload:**
```json
{
  "type": "archetype_at_risk",
  "targetUserId": "...",
  "payload": {
    "current": "THE_SHARP",
    "atRisk": true,
    "metric": "CLV",
    "currentValue": "+1.8%",
    "threshold": "+2.0%",
    "message": "Your Sharp status is at risk — CLV has shifted below threshold."
  }
}
```

**Change notification payload:**
```json
{
  "type": "archetype_change",
  "targetUserId": "...",
  "payload": {
    "from": "THE_SHARP",
    "to": "THE_GRINDER",
    "reason": "CLV dropped below 2.0% threshold over last 20 picks"
  }
}
```

### 1.5 Identity Loss Rules

1. Archetype cosmetics (borders, nameplates) earned while holding an archetype are permanently owned — they cannot be equipped while holding a different archetype, but they stay in inventory forever and appear in wardrobe history.

2. Archetype history is a free feature (not Pro-only): last 3 archetypes held with dates visible on own tipster profile. "Previously: THE SHARP (Nov 2025 – Feb 2026)."

3. THE CONTENDER is never assigned to a user who previously held a named archetype. The fallback logic in 1.3 applies instead.

### 1.6 Backend Migration (Deprecated Archetypes)

The following backend archetype keys are deprecated by this system. Users currently holding them are migrated on the next weekly recalculation run.

| Deprecated Key | Reason | Migration |
|---------------|--------|-----------|
| `sniper` | Subsumed — early-career sharp detection is part of THE SHARP criteria | Recalculate; assign qualifying archetype or THE CONTENDER |
| `demon` | Removed — streak-based archetype identity is now a display state, not an archetype | Recalculate; assign qualifying archetype |
| `lock-machine` | No detection logic, never assigned by engine | No migration needed (was phantom) |
| `ice-cold` | No detection logic | Same |
| `profit-farmer` | No detection logic | Same |
| `momentum-monster` | No detection logic | Same |

New keys to add to `VALID_ARCHETYPES` in `backend-profile-endpoints.js`:
`specialist`, `high-stakes`, `contender`

Apply a 10-pick grace period display buffer during migration — show old archetype for up to 10 picks after recalculation date, then switch.

### 1.7 Display Rules

| Surface | What to Show |
|---------|-------------|
| Tipster profile hero | Full badge + full label ("THE SHARP") |
| Own home page hero | Full badge + full label |
| Leaderboard rows | Icon only (no label, no rarity indicator) |
| Feed event cards | Icon only |
| Community chat username | Icon only |
| Profile cards (follow/compare) | Badge + short label |
| Settings identity section | Full badge, full label, criteria tooltip |
| Archetype history (own profile only) | Last 3 archetypes with date range |

---

## SECTION 2 — RARITY SYSTEM

### 2.1 Rarity Tiers

Five tiers for earned/purchased cosmetics. One additional non-rarity tier for Pro items.

| Tier | Name | Color Token | Visual Language |
|------|------|-------------|-----------------|
| T1 | Common | `#6a6690` (muted) | Flat. Solid border. No animation. |
| T2 | Rare | `#b89fff` (lavender) | Single glow. Slow fade pulse (3s). |
| T3 | Epic | `#7B2CFF` (vivid purple) | Dual-color gradient. Medium pulse (1.5s). |
| T4 | Legendary | `#fbbf24` (gold) | Animated gradient sweep. Particle burst on hover. |
| T5 | Mythic | Custom per item | Unique shader. Always animated. Always moving. Never sold. |
| — | Pro Tier | `#c8b8ff` / `#f0f0ff` (lavender-white) | Distinct Pro aesthetic — not comparable to rarity tiers. Slow rotating lavender sweep. |

**Key rule:** Pro Tier cosmetics are not rated by rarity. In the wardrobe, they appear under a separate "Pro Items" tab. Asking "is my Pro border better than your Epic border?" has no answer — they are different aesthetic languages.

**No random drops.** The system is 100% deterministic. Every cosmetic unlocks from a named, specific condition. There are no chests, no pulls, no pity systems. Randomness belongs in gaming contexts; LEDGR's identity is earned performance.

### 2.2 Visual Specifications

#### T1 Common
```css
border: 1px solid rgba(106,102,144,0.4);
background: transparent;
/* No animation */
```

#### T2 Rare
```css
border: 1px solid rgba(184,159,255,0.5);
box-shadow: 0 0 12px rgba(184,159,255,0.2), inset 0 0 8px rgba(184,159,255,0.05);
animation: rare-pulse 3s ease-in-out infinite;
/* @keyframes rare-pulse: opacity 1 → 0.7 → 1 */
```

#### T3 Epic
```css
border: 1px solid transparent;
background: linear-gradient(var(--s1),var(--s1)) padding-box,
            linear-gradient(135deg,#7B2CFF,#b89fff,#7B2CFF) border-box;
box-shadow: 0 0 20px rgba(123,44,255,0.3), 0 0 40px rgba(123,44,255,0.1);
animation: epic-pulse 1.5s ease-in-out infinite;
```

#### T4 Legendary
```css
border: 1px solid transparent;
background: linear-gradient(var(--s1),var(--s1)) padding-box,
            linear-gradient(135deg,#fbbf24,#f59e0b,#d97706,#fbbf24) border-box;
background-size: 200% 200%;
box-shadow: 0 0 30px rgba(251,191,36,0.35), 0 0 60px rgba(251,191,36,0.15);
animation: legendary-sweep 2s linear infinite, legendary-glow 2s ease-in-out infinite;
/* Hover: 5-8 gold CSS sparkle particles, 600ms fade out */
```

#### T5 Mythic
Each Mythic item has a unique shader. No two Mythic items look the same. Examples:

**The Immutable** (founding members, 500+ picks before platform public launch):
- Border: animated conic-gradient cycling full spectrum at 4s
- Inner shadow: deep void black with pulsing purple core
- Hover: 12-particle ring orbiting the avatar

**The Sovereign** (Season Champions):
- Border: gold crown motif CSS clip-path, rotating slowly (0.2rpm)
- Background: subtle marble texture inside the border frame
- Permanent: cannot be removed from display

#### Pro Tier
```css
/* Pro cosmetics use lavender-white aesthetic, not the gold/purple rarity tiers */
border: 1px solid transparent;
background: linear-gradient(var(--s1),var(--s1)) padding-box,
            linear-gradient(135deg,#c8b8ff,#f0f0ff,#c8b8ff) border-box;
box-shadow: 0 0 16px rgba(200,184,255,0.25);
animation: pro-rotate 4s linear infinite;
/* @keyframes pro-rotate: background-position cycling */
```

---

## SECTION 3 — COSMETIC SLOTS

A tipster profile has five cosmetic slots. Each slot has independent unlock paths.

### Slot A — Avatar Border (Ring)

| Variant | Source | Override Rule |
|---------|--------|---------------|
| Division default | Automatic — shows current division aura | Base layer |
| Performance override | Earned via milestones | Replaces division default |
| Pro override | Pro subscription active | Replaces division default |

User chooses which override to apply from inventory. Choosing "None" reverts to division default.

### Slot B — Profile Banner

| Category | Source |
|----------|--------|
| Division banners (7 tiers) | Automatic at each division |
| Performance banners | Earned from record milestones |
| Archetype banners | Unlocked at archetype assignment |
| Premium banners | Pro subscription |
| Seasonal banners | Active event windows |

### Slot C — Nameplate

How the username is displayed in profile header and on leaderboard.

| Effect | Rarity | Description |
|--------|--------|-------------|
| None (default) | — | Plain text, `var(--tx)` |
| Glow | Rare | Color-tinted outer glow (CSS text-shadow) |
| Shimmer | Epic | CSS background-clip animation sweeping across text |
| Holo | Legendary | CSS conic-gradient sweep — rainbow reflection |
| Ember | Mythic | Orange/gold gradient with ember particle CSS animation |
| Void | Mythic | Dark crackling effect — purple-black gradient with sharp particles |
| Pro Shimmer | Pro Tier | White-to-lavender shimmer, slower sweep |

### Slot D — Badge Frame

How badges display in the Trophy Shelf and badge grid.

| Frame | Rarity | Visual |
|-------|--------|--------|
| Default | Common | Dark card, `--s1` background |
| Gleam | Rare | Inner glow on badge hover |
| Crystalline | Epic | Geometric corner accents, subtle sparkle |
| Auric | Legendary | Gold filigree border, animated shimmer |
| Sovereign | Mythic | Animated crest, division-colored energy |
| Pro Gleam | Pro Tier | Lavender crystalline Pro frame |

### Slot E — Pick Card Accent

How picks appear in the feed, leaderboard, and public profile.

| Accent | Rarity | Visual |
|--------|--------|--------|
| Default | Common | Standard card with `--bd` border |
| Elevated | Rare | Slightly brighter border, subtle drop shadow |
| Signed | Epic | Left edge accent bar in archetype color |
| Legacy | Legendary | Top gradient bar, subtle gold monogram |
| Iconic | Mythic | Full animated frame — rarity-specific treatment |
| Pro Accent | Pro Tier | Small crown icon (♛) in top-right corner of pick card |

**IMPORTANT — Trust Signal Rule:** No cosmetic, badge, or copy on any pick card or profile surface may use the word "Verified" to describe a premium or paid feature. "Verified" belongs exclusively to the pick verification system (immutable record). The Pro Accent uses a crown symbol, not text.

---

## SECTION 4 — PROFILE SHOWCASE ARCHITECTURE

### 4.1 Profile Identity Stack

```
Layer 1 — Verified Record (immutable)
  ├─ Pick count, ROI, win rate, biggest single win, longest streak
  ├─ First pick date ("on LEDGR since")
  └─ Division history log (reached Gold on [date])

Layer 2 — Computed Identity (auto-assigned)
  ├─ Current division + division ring
  ├─ Archetype + archetype badge
  ├─ Archetype history: last 3 archetypes (free feature)
  ├─ Sharp Score (existing gauge)
  └─ ELO rating

Layer 3 — Showcased Achievements (user-selected)
  ├─ Trophy Shelf: 3–5 badge slots (user-chosen, badge-count-gated expansion)
  ├─ Record Highlight: pinnable stat from verified data
  └─ Archetype Banner (if unlocked)

Layer 4 — Active Cosmetics (user-equipped)
  ├─ Avatar Border
  ├─ Profile Banner
  ├─ Nameplate Effect
  ├─ Badge Frame
  └─ Pick Card Accent
```

### 4.2 Trophy Shelf

The Trophy Shelf sits below the stats grid on the tipster profile page.

**Slot expansion (badge-count-gated):**
| Slots Available | Unlock Condition |
|----------------|-----------------|
| 3 | All users — default |
| 4 | 5 badges earned (achievable within weeks) |
| 5 | 10 badges earned (achievable within months) |
| 6 | Pro subscription active AND ≥ 10 badges earned |

Rules:
- Only earned badges can be displayed
- Badges display at full size with rarity frame applied
- Hover shows: badge name, rarity, earn condition, earn date
- Shelf is always public
- Empty slots show "EMPTY SLOT" placeholder (no Pro upsell visible here)
- Slot order is drag-reorderable in wardrobe settings, not inline on profile

### 4.3 Record Highlights

A Record Highlights block below the Trophy Shelf. Shows 3 automatic highlights and 1 pinnable slot.

**Automatic highlights (always shown, no user selection):**
- Best single pick (highest P&L, verified)
- Longest win streak
- Highest division ever reached (not current — prestige survives demotion)

**Pinnable highlight (1 user-selectable slot):**
Initial options (constrained to data already in API responses):
- Best single P&L (from picks data)
- Longest win streak (from user_rankings.bestStreak)
- Win rate at odds > 2.50 (calculable from picks array client-side)
- Total P&L

Deferred until backend endpoints exist: "followers gained in a week" and "biggest upset by public attention." These require new data that does not exist in the current API.

### 4.4 Profile Card Data Model

`GET /profile/:username` — architecture for what the endpoint will return:

```json
{
  "identity": {
    "userId": "...",
    "username": "...",
    "avatarUrl": "...",
    "motto": "...",
    "memberSince": "2025-11-01"
  },
  "division": {
    "current": "GOLD",
    "highest": "PLATINUM",
    "reachedHighestOn": "2026-03-14"
  },
  "archetype": {
    "id": "sharp",
    "label": "The Sharp",
    "assignedOn": "2026-01-20",
    "history": [
      { "id": "contender", "label": "The Contender", "from": "2025-11-01", "to": "2025-12-14" },
      { "id": "value-hunter", "label": "The Value Hunter", "from": "2025-12-14", "to": "2026-01-20" },
      { "id": "sharp", "label": "The Sharp", "from": "2026-01-20", "to": null }
    ]
  },
  "record": {
    "totalPicks": 234,
    "settledPicks": 198,
    "winRate": 0.57,
    "roi": 0.142,
    "pnl": 28.4,
    "longestStreak": 9,
    "biggestWin": { "event": "Arsenal vs Chelsea", "pnl": 4.5, "odds": 3.4 }
  },
  "cosmetics": {
    "activeBorder": { "id": "centurion_100wins", "rarity": "rare" },
    "activeBanner": { "id": "gold_division_default" },
    "nameplateEffect": "shimmer",
    "badgeFrame": "auric",
    "pickCardAccent": "signed"
  },
  "trophyShelf": ["badge_id_1", "badge_id_2", "badge_id_3"],
  "pinnedHighlight": {
    "label": "Best Month",
    "value": "+34% ROI — January 2026"
  }
}
```

### 4.5 Wardrobe UI Architecture

The `/settings/` page identity section is the Wardrobe.

```
WARDROBE
├── Active Loadout
│   ├── [Avatar Border] — equipped item preview
│   ├── [Profile Banner] — equipped item preview
│   ├── [Nameplate Effect] — live text preview
│   ├── [Badge Frame] — badge preview
│   └── [Pick Card Accent] — card preview
│
├── Trophy Shelf Editor
│   └── Drag/drop badge slots from inventory
│
└── Inventory
    ├── All Items tab
    ├── By Slot tab
    ├── By Rarity tab
    ├── "Earn These" tab ← DEFAULT first view
    │   └── Locked items with earn conditions + progress bars
    └── "Premium" tab ← secondary, not default
        └── Pro items (subscription required) + purchase items
```

**UX Rule:** New users see "Earn These" first. The Premium tab is accessible but never the default entry point. Every locked earn item shows its unlock condition and current progress (e.g., "67/100 wins for The Centurion Border"). The wardrobe's first impression must be "here is what you are working toward" — not "here is what you need to pay for."

---

## SECTION 5 — UNLOCK PATHS

Every item belongs to exactly one unlock path. Paths do not overlap. An item is not both earnable and purchasable.

```
PATH A — Division Progression
PATH B — Performance Milestones (picks, wins, ROI)
PATH C — Sustained Win Rate Records
PATH D — Badge Collection Completion [DEFERRED]
PATH E — Time / Loyalty (with pick activity requirement)
PATH F — Community / Social [DEFERRED]
PATH G — LEDGR Pro (subscription)
PATH H — Premium Purchase
PATH I — Seasonal / Limited Event [DEFERRED]
PATH J — Mythic / Legacy (unrepeatable, admin-awarded)
```

---

### Path A — Division Progression

Division cosmetics unlock automatically when a division is reached. The four-Legendary-simultaneous problem has been resolved by time-gating the LEGENDARY tier unlocks.

| Division | Instant Unlocks | Time-Gated Unlocks |
|----------|----------------|-------------------|
| BRONZE | Bronze ring, Bronze banner | — |
| SILVER | Silver ring, Silver banner | — |
| GOLD | Gold ring, Gold banner, Gold nameplate glow (Rare) | — |
| PLATINUM | Platinum ring, Platinum banner, Crystalline badge frame (Epic) | — |
| DIAMOND | Diamond ring, Diamond banner, Diamond nameplate shimmer (Epic) | — |
| ELITE | Elite ring, Elite banner, Elite pick card accent (Legendary) | — |
| LEGENDARY | Legendary ring | Legendary nameplate: 50 picks while at LEGENDARY; Legendary banner: 4 consecutive weeks at LEGENDARY; Legendary border: 100 picks while at LEGENDARY |

**Post-LEGENDARY progression:** Performance milestone cosmetics (500 picks, 250 wins, Profit Machine banner) are the primary cosmetic goals for LEGENDARY-division users. Seasonal items provide time-based goals. A compound "LEDGR Record" title system may be added: "LEGENDARY — 400 Wins — Season 2 Veteran."

---

### Path B — Performance Milestones

Triggered by grading engine after pick settlement.

| Milestone | Trigger | Rarity | Qualification |
|-----------|---------|--------|--------------|
| First Win | First win result | Common | — |
| 25 Wins | 25 cumulative wins | Common | Avg odds ≥ 1.50 on those wins |
| 50 Wins | 50 wins | Rare | Avg odds ≥ 1.60 on those wins |
| 100 Wins | 100 wins | Rare | ROI > 0% all-time settled picks |
| 150 Wins | 150 wins | Rare | ROI > 0% over last 60 picks (mid-game gap fill) |
| 200 Wins | 200 wins | Epic | ROI > +3% over last 100 picks (mid-game gap fill) |
| 250 Wins | 250 wins | Epic | ROI > +5% over last 100 picks |
| 500 Wins | 500 wins | Legendary | ROI > +10% all-time |
| ROI +10% | Rolling 30 picks, +10% ROI AND overall ROI > 0% | Rare | Cross-referenced against all-time record |
| ROI +20% | Rolling 50 picks, +20% ROI AND settled ≥ 50 AND overall ROI > +5% | Epic | — |
| ROI +25% | Rolling 100 picks, +25% ROI AND overall ROI > +15% | Legendary | — |
| 3-Month Consistent ROI | Positive ROI in 3 consecutive calendar months | Rare | Banner: "Consistent Edge" |
| 6-Month Consistent ROI | Positive ROI in 6 consecutive months | Epic | Border: "The Patient" |
| 100 Total Picks | Posting milestone | Rare | Badge frame: "Centurion Frame" |
| 500 Total Picks | Posting milestone | Legendary | Border: "The Veteran" |
| Archetype First Assigned | Any archetype threshold met | Rare | Archetype-specific border (kept permanently, cannot equip while on different archetype) |

**Rarity note:** "100 Wins" is Rare, not Epic. On an active platform, the majority of dedicated users will reach 100 wins within 8–12 months. Epics should be held by fewer than 10% of active users at any given time.

**ROI window integrity:** Rolling-window ROI alone is insufficient for permanent unlocks. Every ROI milestone cross-references the overall record to prevent lucky short windows from producing misleading permanent cosmetics.

---

### Path C — Sustained Win Rate (Permanent Cosmetics)

Permanent cosmetics unlock based on sustained win rate thresholds, not one-time win streaks. This makes streak cosmetics skill-based, not variance-based.

| Threshold | Rarity | Reward |
|-----------|--------|--------|
| Win rate ≥ 60% over last 30 settled picks (min 20 settled) | Rare | Nameplate glow: "On Fire" |
| Win rate ≥ 65% over last 50 settled picks (min 30 settled) | Epic | Badge frame: "Blaze Frame" |
| Win rate ≥ 70% over last 50 settled picks (min 30 settled) | Legendary | Nameplate: "Inferno" |
| 15-win streak (any point in career) | Mythic candidate | "The Unbreakable" — permanent, requires manual verification before award. Fewer than 5 users at any time. |

**Live streak indicator (separate from inventory):** A small animated flame dot appears next to the username on the public profile when an active win streak ≥ 3 is present. This is a live status indicator, not a cosmetic item — it appears and disappears based on current streak state and is not managed through the wardrobe.

---

### Path D — Badge Collection Completion [DEFERRED]

**Prerequisite not met:** Two independent badge systems exist (animations.js v1, badges-system.js v2) with separate localStorage state and separate unlock conditions. Path D is impossible to implement correctly until:
1. A single canonical badge catalog is defined
2. The two badge systems are merged into one
3. Badge persistence is moved to the backend (Bug B11)

This path is architecturally deferred until those prerequisites are complete. Do not implement any Path D cosmetics until the canonical badge catalog is defined and documented.

---

### Path E — Time / Loyalty (Activity-Gated)

Loyalty cosmetics require pick activity — platform loyalty alone does not award rarity-tier cosmetics. Login streaks are not rewarded with cosmetics (the "login streak = cosmetic" mechanic belongs to mobile gaming, not a performance-identity platform).

| Trigger | Reward | Activity Gate |
|---------|--------|--------------|
| 90-day member | "Early Adopter" OG badge (informational only, no rarity tier) | AND ≥ 20 picks posted |
| 1-year member | Rare border: "First Year" | AND ≥ 50 picks posted |
| Founding member (before public launch) | Legendary border: "The Founding" | No additional gate — founding is the gate |

**The "Early Adopter" badge** is informational — it appears in the badge collection as historical record, but it does not have a rarity tier and does not display in the rarity comparison system.

---

### Path F — Community / Social [DEFERRED]

**Prerequisite not met:** No anti-gaming infrastructure exists. Social path cosmetics cannot be shipped safely until:
1. Follower account age check (minimum 7 days old at time of follow)
2. Follower activity requirement (at least 1 settled pick OR paying subscriber)
3. Follow velocity cap (max 20 new follows counted per milestone per 7-day window)
4. Retroactive audit at unlock time

Without these, follower milestones are trivially gamed by mutual-follow arrangements or multi-account creation.

---

### Path G — LEDGR Pro

See Section 6.

---

### Path H — Premium Purchase

One-time purchases. Non-repeatable.

Rules:
- No purchase item can be Mythic rarity — Mythic is never sold
- No purchase item has a performance stat or ranking effect
- Purchase items display a "✦ Premium" indicator in the wardrobe only — not visible on public profile
- The item looks identical on the public profile to the equivalent earned item at the same visual weight
- Pro badge is separate — it is visible on profile as a "supporter" signal, not on leaderboard rows

| Item | Slot | Rarity | Notes |
|------|------|--------|-------|
| Void Border | Border | Legendary | Deep black/purple crackling energy ring |
| Ember Banner | Banner | Legendary | Dark orange/crimson ember drift animation |
| Holo Nameplate | Nameplate | Legendary | Full rainbow holographic text sweep |
| Carbon pick card | Card | Legendary | Dark weave texture accent |
| Arcane badge frame | Frame | Legendary | Deep blue rune-corner frame |

**Payment integration rule:** Purchase items are accessible only from the wardrobe, not from a standalone store. The wardrobe purchase tab is clearly labeled "one-time purchases" and visually separated from "Earn These" content.

---

### Path I — Seasonal / Limited Event [DEFERRED]

**Prerequisite not met:** Push notification delivery (Bug B6) must be confirmed working before seasonal items are launched. Without push delivery, 14–21 day windows will generate near-zero revenue because users will not know the window is open.

When launching seasonal items:
- Windows: 21 days minimum
- First seasonal item: tied to LEDGR Season 1 end (universal — relevant to all users regardless of sport preference)
- First item: free to claim, paid visual upgrade option available
- In-app banner on home page during active window (no external marketing required)
- Items are tagged with their event name in inventory
- Never re-issued after the window closes

---

### Path J — Mythic / Legacy (Unrepeatable)

Mythic items are awarded retroactively or for unrepeatable moments. Never announced in advance. Never for sale.

| Item | Condition | Notes |
|------|-----------|-------|
| The Immutable | 500+ picks before platform public launch | Retroactive award on launch day |
| Season Champion border | #1 ranked tipster at season end | One per season, unique visual per season |
| Hall of Fame Banner | Hall of Fame induction | One per person, permanent |
| The Unbreakable | 15-win streak | Requires manual admin verification; fewer than 5 users at any time |

**Season Cohort System (catch-up mechanism):** Each season generates its own cohort item — a "Season N Veteran" earnable by anyone who completes Season N, regardless of when they joined. This prevents permanent cosmetic stratification between founding-era users and newcomers. Every cohort has its own era items.

Mythic items tracked in `mythic_awards` table: `{ userId, itemId, reason, adminApprovalFlag, awardedAt }`.

---

## SECTION 6 — LEDGR PRO

### 6.1 Price Point

**€5/month** — half the cost of a tipster subscription (€10/month). At this price, the analytics depth is compelling for serious tipsters, and the cosmetics are correctly framed as "Pro visual identity" rather than competition with earned items.

### 6.2 Benefits

**Identity:**
- Pro badge on profile page (visible to profile visitors — NOT shown in leaderboard rows)
- Access to all Pro Tier cosmetics (see wardrobe)
- 6th Trophy Shelf slot (requires ≥ 10 badges earned to activate)
- Custom motto/tagline field (free users get default motto only)
- Archetype history log (last 10 archetypes with reasoning, not just 3)

**Analytics:**
- Full CLV breakdown per pick (CLV number is free; Pro unlocks breakdown by sport, market type, trend chart)
- Monthly P&L report (exportable PDF/CSV)
- Streak analytics: win rate by day of week, sport, odds range
- Advanced sharp score breakdown (free users see the gauge; Pro sees the component weights)
- Opponent comparison: see how your metrics compare to other archetype members

**Discovery:**
- Enhanced push notifications: richer payload — pick card preview, tipster ROI context, confidence level in notification body (content richness, not timing priority — all subscribers receive notifications with identical latency)
- Pro badge visible on "Rising Tipsters" cards — the carousel is open to ALL users with qualifying performance; Pro badge is a visual indicator of support, not a filter

**Visitor Analytics (new):**
- "Who viewed your profile this week" — profile visitor count and recent viewer list
- Designed for creator-tipsters who want to understand their audience reach
- This is the clearest Pro-exclusive utility feature: it has no bearing on rankings, performance, or pick quality

### 6.3 What Pro Does NOT Include

- Higher ranking
- Better odds data
- Any influence on the verified pick record
- Archetype selection or manipulation
- Notification timing priority (all notifications are equal-latency)
- CLV number hiding for free users (free users see the CLV number; Pro sees the analysis)
- Leaderboard row Pro badge (the leaderboard shows rank, username, division, archetype icon, stats — no payment indicators)
- "Verified" label on any surface

### 6.4 Pro Cosmetics

Available to active Pro subscribers only. Suspended (not deleted) if subscription lapses.

| Item | Slot | Tier | Visual |
|------|------|------|--------|
| Pro Aura border | Border | Pro Tier | Lavender/white dual-tone ring, 4s rotating sweep |
| Pro Dark banner | Banner | Pro Tier | Deep midnight gradient with subtle hexagonal texture |
| Pro Shimmer nameplate | Nameplate | Pro Tier | White-to-lavender shimmer, 5s sweep cycle |
| Pro Gleam badge frame | Frame | Pro Tier | Lavender crystalline frame |
| Pro Accent pick card | Card | Pro Tier | Small crown icon (♛) in top-right corner |

On subscription lapse: equipped Pro items are auto-swapped to division defaults. Items remain in inventory (suspended state). They are re-activated when subscription resumes.

---

## SECTION 7 — MONETIZATION BOUNDARIES

### 7.1 The Hard Lines (Never Cross)

| Prohibited | Why |
|-----------|-----|
| Selling notification timing priority | Directly affects real betting decisions — this is pay-to-win on a betting platform |
| Using "Verified" in premium copy | "Verified" belongs exclusively to the pick verification system |
| Pro badge in leaderboard rows | Paid indicator on a performance-ranked surface creates false correlation |
| Selling Mythic items | Mythic rarity is defined by being unachievable by purchase |
| Hiding CLV number behind paywall | CLV is a trust metric; obscuring it undermines follower decision-making |
| Discovery/algorithm advantage by subscription | "Rising Tipsters" carousel must be open to all qualifying performers |
| Archetype selection or override | Archetypes are verified labels, not cosmetic choices |

### 7.2 The Allowed Layers

```
LAYER 1 — Earned (free, performance-gated)
  ├─ Division cosmetics
  ├─ Performance milestone cosmetics
  ├─ Sustained win rate cosmetics
  └─ Time/loyalty cosmetics (with activity requirement)

LAYER 2 — LEDGR Pro (subscription, €5/month)
  ├─ Pro Tier cosmetics (distinct aesthetic, not rarity competition)
  ├─ Analytics depth (deeper breakdown, not hiding base numbers)
  ├─ Visitor analytics (creator-utility feature)
  └─ 6th trophy shelf slot (activity-gated even within Pro)

LAYER 3 — Premium Purchase (one-time)
  ├─ Legendary-tier cosmetics (max rarity for purchase)
  ├─ Purchase-only items have no gameplay effect
  └─ Wardrobe-only access (not a storefront UX)

LAYER 4 — Tipster Subscriptions (existing, separate product)
  └─ €10/month, tipster-set, handled on tipster profile page
```

### 7.3 Payment Flow Rules (Simplified)

Three payment contexts exist. Do not present more than one at a time.

| Payment Type | Entry Point | Stripe Flow |
|-------------|-------------|-------------|
| Tipster subscription | Tipster profile page | Existing checkout |
| LEDGR Pro | Settings page (identity tab) | New checkout |
| One-time cosmetic purchase | Wardrobe settings (premium tab only) | One-time payment |

Rule: LEDGR Pro upsell and cosmetic purchase CTAs must never appear on the same screen. When LEDGR Pro launches, position one-time purchases as "not included in Pro — seasonal and limited items only."

---

## SECTION 8 — PROGRESSION PACING & DESIRE LOOPS

### 8.1 Milestone Cadence

The progression system ensures active tipsters have a visible cosmetic goal at all times.

**Early game (0–50 picks):** Division cosmetics and performance milestones fire frequently. The Contender state transitions to a named archetype. First badge unlocks happen.

**Mid-game (50–200 picks):** The original design had a content desert between 100–250 wins. This is resolved by Path B's new milestones at 150 wins, 200 wins, and the 3/6-month consistent ROI rewards. A tipster posting 5 picks/week at 55% win rate should see a new cosmetic unlock approximately every 6–8 weeks.

**Late game (200+ picks, LEGENDARY division):** Time-gated LEGENDARY cosmetics (50, 100 picks at division) spread the division unlocks. Performance milestones (500 picks, 500 wins, Profit Machine) give long-term goals. Season cohort items provide rolling seasonal goals.

### 8.2 Persistent Progress Indicator

The home page hero section displays a persistent progress chip below the stats grid:

```
[ ⚡ Next: The Centurion Border — 67/100 wins ]
```

Rules:
- Single line, one next-target only (most imminent unlock across all earned paths)
- Not shown for Pro-only or purchase items
- Clicking navigates to wardrobe "Earn These" section filtered to that item
- Updates after each pick grading event
- Hidden if no earn-path unlocks are pending (e.g., after LEGENDARY division with all milestones reached)

### 8.3 Milestone Delivery Guarantee

All major cosmetic unlocks use a delivery guarantee system (extending the existing `ledgr_pending_rankup` pattern from Sprint 3):

1. Grading engine checks unlock thresholds after each settlement
2. If unlock triggers: emit WS event `cosmetic_unlock` to user
3. If user is offline when event fires: store to `ledgr_pending_unlocks` localStorage array
4. On next home page load: replay pending unlock ceremonies with overlay (one per load, or queue them with 3s gap)
5. After display: clear the stored pending unlock
6. The ceremony shows: item preview, rarity, how it was earned, "Equip Now" CTA

WS event shape for cosmetic unlocks:
```json
{
  "type": "cosmetic_unlock",
  "targetUserId": "...",
  "payload": {
    "itemId": "border_centurion",
    "itemName": "The Centurion",
    "slot": "border",
    "rarity": "rare",
    "earnedVia": "100 verified wins with positive ROI",
    "earnedAt": "2026-05-18T20:34:00Z"
  }
}
```

### 8.4 Desire Loops at Four Moments

1. **On profile visit:** User sees another tipster's Epic border. Clicking it shows: "Earned — 200 Verified Wins with positive ROI over last 100 picks. You have 87 wins." Goal is immediate, specific, visible.

2. **On leaderboard scroll:** Archetype icons next to usernames. User sees "THE SHARP" next to #3 ranked. They click the icon — tooltip shows exact criteria and their current metric values vs. threshold.

3. **On grading result:** Win ceremony shows closest next unlock progress: "54/100 wins toward The Centurion Border."

4. **On notification:** Cosmetic unlock notification shows item preview with "Equip Now →" CTA.

---

## SECTION 9 — INVENTORY DATA MODEL

```
table: user_inventory
  id             uuid PRIMARY KEY
  userId         uuid (FK users)
  itemId         varchar  (e.g., "border_centurion")
  slot           enum (border, banner, nameplate, frame, card_accent)
  rarity         enum (common, rare, epic, legendary, mythic, pro_tier)
  source         enum (division, performance, streak, badge, loyalty, pro, purchase, seasonal, mythic_legacy)
  unlockedAt     timestamp
  isEquipped     boolean DEFAULT false
  isSuspended    boolean DEFAULT false  -- true if pro item and sub lapsed

table: cosmetic_items
  id             varchar PRIMARY KEY  (slug)
  slot           enum
  rarity         enum
  name           varchar
  description    text
  unlockCondition text
  source         enum
  cssClass       varchar  (maps to CSS in app-components.css)
  previewUrl     varchar  (thumbnail for wardrobe)
  isActive       boolean DEFAULT true  (false = retired/limited)
  isProOnly      boolean DEFAULT false
  isPurchase     boolean DEFAULT false

table: mythic_awards
  id             uuid PRIMARY KEY
  userId         uuid
  itemId         varchar
  reason         text
  adminApproved  boolean DEFAULT false
  approvedBy     varchar
  awardedAt      timestamp
```

---

## SECTION 10 — IMPLEMENTATION ROADMAP

### Phase 3A — Foundation (prerequisite for everything else)

1. Remove manual archetype selection from settings page (Bug B2)
2. Add new archetype keys to `VALID_ARCHETYPES` in backend-profile-endpoints.js (`specialist`, `high-stakes`, `contender`)
3. Build archetype scoring function (Section 1.3 pseudocode) in backend
4. Weekly archetype recalculation cron (Sunday midnight UTC)
5. Archetype grace period and warning notification logic
6. THE CONTENDER display state on profiles (replace dashed/greyed slot)
7. Display auto-assigned archetype on tipster page and home hero section
8. Archetype history panel (last 3 archetypes with dates) on own profile
9. Cosmetic unlock event emission framework (`cosmetic_unlock` WS event)
10. `ledgr_pending_unlocks` localStorage pattern on home page

### Phase 3B — Cosmetics Layer (identity system visible)

1. Add `user_inventory` and `cosmetic_items` tables
2. Document all division cosmetics as Path A items in inventory (seed existing users)
3. Add cosmetic CSS classes to `app-components.css` for T1–T4 tiers
4. Wardrobe UI in settings page (Sections 4.5)
5. Apply equipped cosmetics to profile rendering
6. Persistent progress chip on home hero (Section 8.2)
7. Live streak indicator (flame dot) on profiles
8. Permanent streak cosmetics via sustained win rate thresholds (Path C)

### Phase 3C — Prestige Inventory (desire loops active)

1. Full `user_inventory` with seed for all existing earned items
2. Wardrobe "Earn These" section with locked items + progress bars
3. Trophy Shelf editor (3 baseline slots, badge-count expansion logic)
4. Record Highlights block on tipster page
5. Cosmetic unlock ceremony overlay (delivery guarantee system)
6. Desire loop tooltip on profile visit (click cosmetic → see earn condition + progress)

### Phase 3D — Premium Layer (revenue)

1. LEDGR Pro Stripe subscription (€5/month, separate from tipster subscriptions)
2. Pro cosmetics gated behind subscription check
3. Visitor analytics feature (who viewed your profile)
4. Pro badge on profile page (NOT leaderboard rows)
5. Wardrobe "Premium" tab for purchase items
6. One-time cosmetic purchase flow

### Phase 3E — Seasonal Layer [Prerequisite: Bug B6 resolved]

1. Confirm push notification delivery end-to-end
2. First seasonal item: Season 1 Champion Edition
3. In-app home page banner during active seasonal window
4. Season cohort cosmetic system

---

## SECTION 11 — BACKEND COMPATIBILITY CHECKLIST

Before Phase 3A, verify:

| Requirement | Status | Action |
|------------|--------|--------|
| `profiles.archetype` column exists | ✅ (LEDGR_BRAIN.md confirms) | None |
| `user_rankings.archetype` column exists | ✅ | None |
| VALID_ARCHETYPES in backend-profile-endpoints.js | Partial | Add: `specialist`, `high-stakes`, `contender` |
| Weekly ranking snapshot cron | ✅ (Sunday 23:59 UTC) | Piggyback archetype recalculation |
| WS event emission framework | ✅ | Add `cosmetic_unlock` and `archetype_at_risk` event types |
| `user_inventory` table | ❌ | Create (Phase 3B) |
| `cosmetic_items` table | ❌ | Create (Phase 3B) |
| `mythic_awards` table | ❌ | Create (Phase 3D) |
| Badge system unified | ❌ | Prerequisite for Path D (no Phase 3 blocker) |
| Push delivery confirmed (B6) | ❌ | Prerequisite for Path I only |

---

## GLOSSARY

| Term | Definition |
|------|-----------|
| Archetype | Auto-assigned betting identity derived entirely from verified pick stats. Cannot be manually selected. |
| THE CONTENDER | The entry state for new users or unqualified tipsters. A real archetype state — not a placeholder or error. Never assigned after a named archetype is held. |
| Cosmetic | A visual item that changes how a profile or pick looks. Zero gameplay effect. |
| Division Ring | Automatic aura around the avatar showing current division. Always visible. Cosmetic overrides sit above it. |
| Trophy Shelf | 3–6 badge display slots on a profile. Expansion gated by badge count earned (not payment). |
| Wardrobe | The settings UI where users equip cosmetics and view their inventory. |
| Rarity | Tier for earned/purchased cosmetics: Common / Rare / Epic / Legendary / Mythic |
| Pro Tier | A distinct aesthetic tier for LEDGR Pro cosmetics. Not comparable to rarity tiers — different visual language. |
| Unlock Path | The category of action required to earn an item (A–J). Paths do not overlap. |
| Desire Loop | A system mechanic that makes visible what a user could earn and how close they are. |
| LEDGR Pro | €5/month platform subscription. Analytics depth + Pro cosmetics + visitor analytics. No pay-to-win mechanics. |
| Seasonal Item | A time-limited cosmetic issued during a sporting event window (21+ days). Never re-issued. |
| Mythic | Rarity T5. Never sold. Never repeated. Admin-awarded for unrepeatable achievements. |
| Grace Period | A 15-pick buffer before an archetype downgrade is committed. 10-pick advance warning sent. |
| Delivery Guarantee | System that stores missed milestone unlocks and replays them as ceremonies on the next home load. |
| Season Cohort Item | A cosmetic earnable by all users who participate in a given season, creating per-cohort era items. |

---

*This document is architecture-only. No code was modified.*
*Supersedes LEDGR_PRESTIGE_SYSTEM.md. All 31 validation issues resolved or formally deferred.*
*Reference: LEDGR_PRESTIGE_VALIDATION.md for full issue register and original risk analysis.*
