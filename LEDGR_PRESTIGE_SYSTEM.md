# LEDGR PRESTIGE SYSTEM
## Phase 3 Architecture — Prestige + Monetization Foundation

Date: 2026-05-18  
Status: Architecture only — no code changes  
Scope: Archetypes, cosmetic rarity, profile showcase, premium inventory, unlock paths

---

## DESIGN PRINCIPLES

1. **Reputation is earned, not bought.** The highest-prestige items in LEDGR must come from verified performance, not credit cards. Premium items exist, but they are never the rarest or most impressive things in the system.

2. **Identity reflects behavior.** Your archetype, your border, your showcase — they should tell the story of how you bet. A stranger reading your profile should know your style before reading a single pick.

3. **Desire loops are visible.** When a user sees someone else's Mythic border or a Legendary badge they don't have, the system must make it immediately clear how to earn it. Opacity kills aspiration.

4. **Every rarity tier must feel meaningfully different.** Common shouldn't look like Rare with better colors. Each tier has a distinct visual language: motion, glow intensity, particle density, frame complexity.

5. **Free players must feel the system is fair.** Every cosmetic tier except the topmost premium-exclusive items must be reachable through play. The premium layer sells convenience and aesthetics, not competitive advantage.

---

## SECTION 1 — BETTOR ARCHETYPES (AUTOMATIC ASSIGNMENT)

### 1.1 Philosophy

Archetypes are LEDGR's betting identity system. They are **automatically assigned** by the grading engine based on verified pick data. They are not cosmetic choices — they are data-derived labels that describe how a tipster actually bets.

A tipster cannot choose to be "The Sharp." They either are one or they aren't. This is the product's core trust signal: your archetype is verified.

Current state: Bug B2 — archetypes are manually selectable. This must be removed.

### 1.2 Archetype Roster

Eight primary archetypes. Each tipster holds exactly one active archetype at a time. Assignment recalculates after every 5 settled picks.

---

#### THE SHARP
> Consistently finds value the market underprices. Beats the closing line.

**Visual:** Electric blue nameplate glow. SVG badge icon: crossed lightning bolts.

**Assignment criteria (all required):**
- Average CLV > +2.0% over last 20 settled picks
- ROI > +8% over last 30 settled picks
- Minimum 20 settled picks total
- Win rate ≥ 52%

**Distinguishing trait:** CLV is the primary qualifier. Sharps are identified by edge quality, not just results.

---

#### THE VALUE HUNTER
> Targets mispriced odds. High-odds picks, positive long-run EV.

**Visual:** Gold nameplate glow. SVG badge icon: magnifying glass over odds slip.

**Assignment criteria:**
- Average odds > 2.20 (decimal) over last 20 picks
- ROI > +5% over last 30 picks
- Minimum 15 settled picks
- Less than 25% of picks are odds < 1.80

**Distinguishing trait:** Operates at longer odds than the market expects. The defining stat is average odds combined with positive ROI — anyone can post long-shot picks, only Value Hunters turn a profit doing it.

---

#### THE CONTRARIAN
> Fades the public. Backs underdogs. Wins where the crowd is wrong.

**Visual:** Orange glow with slight distortion effect on nameplate. SVG badge icon: arrow pointing left against crowd.

**Assignment criteria:**
- Minimum 40% of picks are on the underdog/away team/higher odds side of a market
- Win rate on contrarian picks > 48%
- Minimum 20 settled picks
- Negative correlation with public betting percentage (where data available from The Odds API)

**Note on data availability:** Public betting % requires Odds API premium endpoints. If unavailable, use proxy: average odds > 2.10 with underdog/away bet ratio > 40%.

---

#### THE GRINDER
> Volume, consistency, steady edge. Wins through repetition, not spectacle.

**Visual:** Steady white/silver glow. SVG badge icon: gear with streak counter.

**Assignment criteria:**
- Total settled picks ≥ 50
- Average picks per week ≥ 4 (over last 8 weeks)
- ROI between +3% and +15% (not a moonshooter)
- Win rate variance < 15% between any two consecutive 10-pick windows

**Distinguishing trait:** Volume + consistency + moderate ROI. The Grinder is reliable. Their badge communicates "this person shows up every week."

---

#### THE SPECIALIST
> Dominates one sport. Their focus is their edge.

**Visual:** Sport-specific accent color (soccer: green, basketball: orange, tennis: yellow, etc.). SVG badge icon: sport-specific symbol.

**Assignment criteria:**
- ≥ 65% of settled picks in a single sport
- ROI in that sport > +10%
- Minimum 20 picks in that sport
- Win rate in that sport ≥ 5% above their overall win rate

**Dynamic sport icon:** The specialist badge shows the sport they dominate. A soccer specialist has a different badge from a tennis specialist. This is a dynamic cosmetic — the badge updates if the sport changes.

---

#### THE ANALYST
> Data-first. Posts reasoning with picks. Models the line before placing.

**Visual:** Cyan nameplate glow. SVG badge icon: clipboard with data chart.

**Assignment criteria:**
- ≥ 70% of settled picks have a reasoning field filled (non-empty)
- Reasoning word count average ≥ 15 words
- ROI > 0% (any positive return over last 30 picks)
- Confidence field filled on ≥ 80% of picks

**Distinguishing trait:** The Analyst is identified by data-first behavior, not just results. This rewards transparency and documentation even at modest ROI.

---

#### THE HIGH STAKES
> Maximum confidence, maximum stake. Swings big.

**Visual:** Gold/crimson dual-tone glow. SVG badge icon: chip stack with upward arrow.

**Assignment criteria:**
- Average stake ≥ 3× their median stake in the last 30 picks (indicates picks where they go big)
- Uses "max" confidence on ≥ 30% of their picks
- Win rate on max-confidence picks ≥ 55%
- Minimum 15 max-confidence picks settled

**Distinguishing trait:** Identifies tipsters who correctly differentiate their conviction levels. Not "bets big randomly" — bets big when they're right more often.

---

#### THE ACCUMULATOR
> Parlays, multiples, combined markets. Chases multiplied returns.

**Visual:** Rainbow shimmer on nameplate. SVG badge icon: stacked ticket slips.

**Assignment criteria:**
- ≥ 40% of pick submissions are parlays (multi-leg)
- At least one parlay win with combined odds > 5.00
- Minimum 15 parlay picks settled
- Positive P&L from parlay picks

**Note:** Requires parlay picks to be tracked separately in the picks table (parlay flag + combined odds). If this data doesn't exist yet, Accumulator archetype is deferred until parlay tracking is extended.

---

### 1.3 No-Match State

When a tipster has fewer than 10 settled picks, or doesn't meet any archetype threshold, they receive the **UNCLASSIFIED** state:

- Label: "ESTABLISHING RECORD"
- Visual: Greyed-out badge slot with a dashed border
- Tooltip: "Post more picks to unlock your betting identity"
- Minimum picks to first archetype: 10 settled

### 1.4 Assignment Algorithm

Run after every grading event that settles picks for a given user.

```
function assignArchetype(userId):
  fetch last 50 settled picks for userId
  compute: avgCLV, avgOdds, roi30, wr20, totalSettled,
           parlayRatio, reasoningRate, avgStake, sportConcentration,
           contrarian_ratio, weeklyVolume

  score each archetype 0-100 based on criteria match
  assign archetype with highest score
  if highest score < 40: assign UNCLASSIFIED
  
  only update if:
    - new archetype differs from current
    - user has been on current archetype ≥ 5 picks (prevents flickering)
  
  if assignment changes: emit WS event 'archetype_change'
  persist to profiles table: archetype column
```

### 1.5 Archetype Change Event

When archetype changes, fire a personal WS notification:

```json
{
  "type": "archetype_change",
  "targetUserId": "...",
  "payload": {
    "from": "UNCLASSIFIED",
    "to": "THE_SHARP",
    "reason": "CLV +2.4% over last 20 picks"
  }
}
```

Frontend: show an overlay on home page similar to Big Win Ceremony — "YOUR BETTING IDENTITY HAS BEEN ESTABLISHED: THE SHARP".

### 1.6 Display Rules

- Archetype badge shown: tipster profile page, leaderboard row (icon only), profile card, home hero section
- Archetype label shown in full: tipster profile hero, settings identity section
- Archetype icon shown small: leaderboard rows, feed event cards
- Archetype tooltip: shown on hover with the criteria explanation

---

## SECTION 2 — COSMETIC RARITY SYSTEM

### 2.1 Rarity Tiers

Five tiers. Each tier has a distinct visual language that cannot be confused with any adjacent tier.

| Tier | Name | Color Token | Visual Language |
|------|------|-------------|-----------------|
| T1 | Common | `#6a6690` (muted) | Flat. Solid border. No animation. |
| T2 | Rare | `#b89fff` (lavender) | Single glow. Slow fade pulse (3s). |
| T3 | Epic | `#7B2CFF` (vivid purple) | Dual-color gradient. Medium pulse (1.5s). |
| T4 | Legendary | `#fbbf24` (gold) | Animated gradient sweep. Particle burst on hover. |
| T5 | Mythic | Custom per item | Unique shader. Always animated. Always moving. |

### 2.2 Cosmetic Slots

A tipster profile has five cosmetic slots. Each slot has its own rarity-independent unlock path.

#### Slot A — Avatar Border (Ring)
What wraps the profile picture. Currently division rings are automatic. The prestige system adds earned/premium rings that override the division default.

| Variant | Description |
|---------|-------------|
| Division default | Automatic. Cannot be removed. Shows current division aura. |
| Performance override | Replaces division ring. Earned via milestones. |
| Premium override | Replaces division ring. Purchased or subscribed. |

Rule: Premium override > Performance override > Division default. User chooses which override to apply (or none, to show division default).

#### Slot B — Profile Banner
The background of the profile hero card. Division banners are automatic defaults.

Currently: `.banner-bronze` through `.banner-legendary` — cinematic gradients per division.

Prestige layer adds:
- Performance banners (earned from records: e.g., "100 Picks" banner, "Legendary Streak" banner)
- Seasonal banners (issued to Season 1 champions, event participants)
- Premium banners (LEDGR Pro subscribers)
- Archetype banners (specific banner art for each archetype, unlocked at archetype threshold)

#### Slot C — Nameplate
How the username is displayed in profile header and on leaderboard. Default is plain text.

| Effect | Description |
|--------|-------------|
| None (default) | Plain text, `var(--tx)` |
| Glow | Color-tinted outer glow (CSS `text-shadow`) |
| Shimmer | CSS background-clip animation sweeping across text |
| Holo | CSS conic-gradient sweep — rainbow-ish reflection |
| Ember | CSS orange/gold gradient with ember particle CSS animation |
| Void | Dark crackling effect — purple-black gradient with sharp particles |

Nameplate effects are rarity-gated. Glow = Rare, Shimmer = Epic, Holo = Legendary, Ember/Void = Mythic.

#### Slot D — Badge Frame
How badges are displayed in the trophy shelf and badge grid. Default is a plain dark card.

| Frame | Rarity | Visual |
|-------|--------|--------|
| Default | Common | Dark card, `--s1` background, `--bd` border |
| Gleam | Rare | Inner glow on badge hover |
| Crystalline | Epic | Geometric corner accents, subtle sparkle |
| Auric | Legendary | Gold filigree border, animated shimmer |
| Sovereign | Mythic | Animated crest, division-colored energy |

#### Slot E — Pick Card Accent
How picks appear in the feed, leaderboard, and public profile. Default is the standard pick card.

| Accent | Rarity | Visual |
|--------|--------|--------|
| Default | Common | Standard card with `--bd` border |
| Elevated | Rare | Slightly brighter border, subtle drop shadow |
| Signed | Epic | Left edge accent bar in archetype color |
| Verified Pro | Legendary | Top gradient bar, subtle gold monogram |
| Iconic | Mythic | Full animated frame — rarity-specific treatment |

### 2.3 Visual Specifications Per Tier

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
/* On hover: particle burst (5–8 gold CSS sparkle particles, 600ms fade out) */
```

#### T5 Mythic
Each Mythic item has a unique shader. No two Mythic items look the same. Examples:

**The Immutable** (awarded to founding members with 500+ picks before platform launch):
- Border: animated conic-gradient cycling through full spectrum at 4s
- Inner shadow: deep void black with pulsing purple core
- On hover: 12-particle ring orbits the avatar

**The Sovereign** (awarded to Season Champions):
- Border: gold crown motif CSS clip-path, rotating very slowly (0.2 rpm)
- Background: subtle marble texture (Hall of Fame style) inside the border frame
- Permanent: cannot be removed, will not appear in the standard inventory

### 2.4 Rarity Drop Rates (Earned Items)

For items earned from random badge draws or milestone chests:

| Tier | Base Drop Rate | Notes |
|------|---------------|-------|
| Common | 60% | Always available at first pick milestone |
| Rare | 25% | First Rare guaranteed at 20 picks |
| Epic | 12% | First Epic guaranteed at 50 picks |
| Legendary | 2.5% | First Legendary guaranteed at 100 picks |
| Mythic | 0.5% | No guaranteed drop — only from specific achievements |

"Pity system": If a Legendary has not dropped in 40 milestone reward pulls, the next pull is guaranteed Legendary.

---

## SECTION 3 — PROFILE SHOWCASE ARCHITECTURE

### 3.1 Profile Identity Stack

The profile is read in layers, from most permanent to most cosmetic:

```
Layer 1 — Verified Record (immutable)
  └─ Pick count, ROI, win rate, biggest single win, longest streak
  └─ First pick date ("on LEDGR since")
  └─ Division history log (reached Gold on [date])

Layer 2 — Computed Identity (auto-assigned)
  └─ Current division + division ring
  └─ Archetype + archetype badge
  └─ Sharp Score (existing gauge)
  └─ ELO rating

Layer 3 — Showcased Achievements (user-selected)
  └─ Trophy Shelf: 3–5 badge slots (user chooses which badges to display)
  └─ Record Highlight: one custom stat to pin ("Best ROI: +34% in Jan 2026")
  └─ Archetype Banner (if unlocked)

Layer 4 — Active Cosmetics (user-equipped)
  └─ Avatar Border (override or division default)
  └─ Profile Banner
  └─ Nameplate Effect
  └─ Badge Frame
  └─ Pick Card Accent
```

### 3.2 Trophy Shelf

The Trophy Shelf sits below the stats grid on the tipster profile page.

- **3 slots by default** (free for all users)
- **5 slots** for LEDGR Pro subscribers
- Each slot holds one badge
- User selects which badges to showcase from their full badge collection
- Empty slots show a dimmed placeholder with the text "EMPTY SLOT"
- Slots are draggable to reorder (on the settings page, not inline on profile)

Trophy Shelf rules:
- Only badges the user has actually earned can be displayed
- Showcased badges display at full size with their rarity frame applied
- Hovering a badge in the shelf shows: badge name, rarity, how it was earned, earn date
- The shelf is public — always visible to profile visitors

### 3.3 Record Highlights

A Record Highlights block below the Trophy Shelf. Shows 3 highlighted stats:

**Automatic highlights** (always shown):
- Best single pick (highest P&L, verified)
- Longest win streak
- Division reached (highest ever, not current — shows prestige even if demoted)

**Pinnable highlight** (user-selected, 1 slot):
User can pin any stat from their record. Options:
- Best ROI in a calendar month
- Most followers gained in a week
- Win rate against odds > 3.00
- Favorite market by volume
- Biggest upset pick won (odds > 5.00, won)

Pinnable highlight is a vanity signal. It lets tipsters define their own narrative within the constraints of verified data.

### 3.4 Profile Card Data Model

What the `GET /profile/:username` endpoint returns (architecture — no backend change required now):

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
    "id": "SHARP",
    "label": "The Sharp",
    "assignedOn": "2026-01-20",
    "confidence": 87
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
    "activeBorder": { "id": "legendary_100wins", "rarity": "legendary" },
    "activeBanner": { "id": "gold_division_default" },
    "nameplateEffect": "shimmer",
    "badgeFrame": "auric",
    "pickCardAccent": "verified_pro"
  },
  "trophyShelf": ["badge_id_1", "badge_id_2", "badge_id_3"],
  "pinnedHighlight": {
    "label": "Best Month",
    "value": "+34% ROI — January 2026"
  }
}
```

### 3.5 Settings / Inventory Page Architecture

The `/settings/` page identity section becomes the **Wardrobe**:

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
    └── Locked Items (greyed — shows how to unlock)
```

The Locked Items section is critical for desire loops: it shows items the user doesn't have yet with the unlock condition beneath each one. Seeing "Reach 50 wins to unlock [Epic Border: Crimson Veil]" creates a specific target.

---

## SECTION 4 — PREMIUM INVENTORY STRUCTURE

### 4.1 Revenue Model

Three monetization vectors:

1. **Tipster Subscriptions** — already exists. User pays tipster directly for private picks. Platform takes a cut.
2. **LEDGR Pro** — platform subscription. Unlocks Pro cosmetics + analytics features.
3. **Premium Cosmetics** — one-time purchase items. Limited edition or always-available.

LEDGR Pro is **never** required to access the core product (posting picks, viewing rankings, competing on leaderboard). It is strictly identity and analytics depth.

### 4.2 LEDGR Pro Tier

**Monthly subscription. What it includes:**

**Identity benefits:**
- `pro` badge on profile (permanent visual, shown in leaderboard rows)
- Access to all Pro-tier cosmetics (see below)
- 5 Trophy Shelf slots (vs 3 free)
- Custom motto/tagline field on profile (free users get default motto only)
- Access to archetype history log (see all past archetypes and when they changed)

**Analytics benefits:**
- Full CLV breakdown per pick (free users see CLV badge, not the raw number)
- Monthly P&L report (exportable)
- Opponent comparison: see how your metrics compare to other archetype members
- Streak analytics: win rate by day of week, sport, odds range
- Advanced sharp score breakdown (free users see the gauge, Pro sees the components)

**Discovery benefits:**
- Profile featured in "Rising Pros" carousel (algorithmic, among Pro users with positive recent ROI)
- Priority notification delivery (Pro followers receive new-pick notifications faster)
- Profile verified Pro badge shows on all shared cards and social picks

**Pro does NOT include:**
- Higher ranking
- Better odds data
- Any influence on the verified record
- Archetype manipulation

### 4.3 Free Cosmetic Items (Earned)

All of these are earnable with zero payment. The best free items should be visually impressive.

| Item | Slot | Rarity | How to Earn |
|------|------|--------|-------------|
| Division rings (all 7) | Border | varies | Automatic at each division |
| Division banners (all 7) | Banner | varies | Automatic at each division |
| Archetype border (each archetype) | Border | Rare | Reach archetype threshold |
| "First Pick" nameplate glow | Nameplate | Common | Post your first pick |
| "50 Wins" border | Border | Rare | 50 verified wins |
| "100 Picks" border: Centurion | Border | Epic | 100 total picks |
| "ROI 20%" banner: The Edge | Banner | Epic | Sustained +20% ROI over 50 picks |
| "Streak 7" badge frame: On Fire | Frame | Epic | 7-win streak |
| "Streak 10" nameplate: Inferno | Nameplate | Legendary | 10-win streak |
| "500 Picks" border: The Veteran | Border | Legendary | 500 total picks |
| "ROI 30%" banner: Profit Machine | Banner | Legendary | +30% ROI over 100 picks |
| "Season Champion" border | Border | Mythic | Win a season on the leaderboard |
| "Hall of Fame" banner | Banner | Mythic | Inducted into Hall of Fame |
| "The Immutable" border | Border | Mythic | 500+ picks before platform exits beta |

### 4.4 Pro-Tier Cosmetic Items

Available to LEDGR Pro subscribers only. Not for sale individually.

| Item | Slot | Rarity | Notes |
|------|------|--------|-------|
| Pro Aura border | Border | Epic | Purple/lavender split-tone ring |
| Pro Dark banner | Banner | Epic | Deep space gradient, subtle Pro watermark |
| Pro Shimmer nameplate | Nameplate | Epic | White-to-lavender shimmer sweep |
| Pro Gleam badge frame | Frame | Epic | Crystalline Pro frame |
| Pro Verified pick card | Card | Epic | "VERIFIED PRO" badge on pick cards |

Pro cosmetics are removed from display if subscription lapses. User retains them in inventory but cannot equip unearned items. Existing equipped cosmetics are auto-swapped back to division default on lapse.

### 4.5 Purchase-Only Premium Items (One-Time)

Limited catalog. Rotates seasonally. Each item is **only cosmetic** — no stat effect.

| Item | Slot | Rarity | Notes |
|------|------|--------|-------|
| Void Border | Border | Legendary | Deep black/purple crackling energy ring |
| Ember Banner | Banner | Legendary | Dark orange/crimson ember drift animation |
| Holo Nameplate | Nameplate | Legendary | Full rainbow holographic text sweep |
| Carbon pick card | Card | Legendary | Dark weave texture accent |
| Arcane badge frame | Frame | Legendary | Deep blue rune-corner frame |

Seasonal items (3-4 per year, 2-week availability window):
- World Cup Edition border/banner set
- Champions League Final edition
- Major League Baseball playoffs edition
- New Year "Clean Slate" edition

### 4.6 Inventory Data Model

```
table: user_inventory
  id             uuid
  userId         uuid (FK users)
  itemId         varchar  (e.g., "border_centurion_100picks")
  slot           enum (border, banner, nameplate, frame, card_accent)
  rarity         enum (common, rare, epic, legendary, mythic)
  source         enum (division, performance, badge, seasonal, pro, purchase)
  unlockedAt     timestamp
  isEquipped     boolean
  
table: cosmetic_items
  id             varchar (slug)
  slot           enum
  rarity         enum
  name           varchar
  description    text
  unlockCondition text
  source         enum
  cssClass       varchar  (maps to CSS in app-components.css)
  previewUrl     varchar  (thumbnail for wardrobe)
  isActive       boolean  (false = retired/limited)
```

---

## SECTION 5 — UNLOCK PATHS AND PROGRESSION RULES

### 5.1 Unlock Path Matrix

Every item in the system belongs to exactly one unlock path. Paths never overlap — an item is not "earned via performance AND purchasable." This preserves status signal integrity.

```
PATH A — Division Progression
PATH B — Performance Milestones (pick count + ROI + win rate)
PATH C — Streak Records
PATH D — Badge Collection Completion
PATH E — Time/Loyalty
PATH F — Community/Social
PATH G — LEDGR Pro (subscription)
PATH H — Premium Purchase
PATH I — Seasonal / Limited Event
PATH J — Mythic / Legacy (unrepeatable)
```

### 5.2 Path A — Division Progression

Unlocks triggered automatically when a division is reached.

| Division | Unlocks |
|----------|---------|
| BRONZE | Bronze division ring, Bronze banner, "First Division" Common border |
| SILVER | Silver ring, Silver banner |
| GOLD | Gold ring, Gold banner, "Gold Tier" nameplate glow (Rare) |
| PLATINUM | Platinum ring, Platinum banner, Crystalline badge frame (Epic) |
| DIAMOND | Diamond ring, Diamond banner, "Diamond" nameplate shimmer (Epic) |
| ELITE | Elite ring, Elite banner, Elite pick card accent (Legendary) |
| LEGENDARY | Legendary ring, Legendary banner, "The Legendary" nameplate (Legendary), Legendary border (Legendary) |

All Path A items are free, automatic, and cannot be traded or removed from inventory.

### 5.3 Path B — Performance Milestones

Triggered by grading engine after pick settlement. Threshold checked after each grading run.

| Milestone | Trigger Condition | Reward |
|-----------|-----------------|--------|
| First Settled Win | First win result | Common border + "First Win" badge |
| 10 Settled Wins | 10 cumulative wins | Rare badge |
| 50 Settled Wins | 50 wins | Rare border: "Fifty Wins" |
| 100 Settled Wins | 100 wins | Epic border: "The Centurion" |
| 250 Settled Wins | 250 wins | Legendary border: "The Proven" |
| ROI +10% | Over 30 picks, +10% ROI | Rare banner: "Sharp Edge" |
| ROI +20% | Over 50 picks, +20% ROI | Epic banner: "The Edge" |
| ROI +30% | Over 100 picks, +30% ROI | Legendary banner: "Profit Machine" |
| 100 Total Picks | Posting milestone | Epic badge frame: "Centurion Frame" |
| 500 Total Picks | Posting milestone | Legendary border: "The Veteran" |
| Archetype First Assigned | Any archetype threshold met | Rare archetype-specific border |
| Max Confidence Win | Win a Max Confidence pick | Rare pick card accent: "Conviction" |

### 5.4 Path C — Streak Records

Streak unlocks are based on the current active win streak. The record is stored permanently.

| Streak Milestone | Reward | Notes |
|-----------------|--------|-------|
| 3-Win Streak | Common nameplate glow: "Hot" | Reset if streak ends |
| 5-Win Streak | Rare nameplate glow: "On Fire" | Reset if streak ends |
| 7-Win Streak | Epic badge frame: "Blaze Frame" | Permanent — streak can end, item kept |
| 10-Win Streak | Legendary nameplate: "Inferno" | Permanent |
| 15-Win Streak | Mythic candidate: "The Unbreakable" | Permanent. Requires verification review. |

Key rule: items at 3-win and 5-win streaks are **temporary display buffs** — they equip automatically when streak is active and un-equip when streak ends. Items at 7-win and above are permanent unlocks added to inventory.

### 5.5 Path D — Badge Collection Completion

Earning a complete set of badges in a category unlocks a cosmetic reward.

| Badge Set | Completion Reward |
|-----------|-----------------|
| All Common badges (n) | Rare banner: "The Completionist" |
| All Streak badges | Epic border: "Streak Chaser" |
| All ROI badges | Epic nameplate: "Value King" |
| All Volume badges | Epic border: "The Grinder's Seal" |
| Full badge vault (all badges) | Legendary pick card: "The Archive" |

### 5.6 Path E — Time/Loyalty

Triggered by account anniversary or login streak (not betting streak).

| Trigger | Reward |
|---------|--------|
| 30-day login streak | Common border upgrade |
| 90-day member | Rare border: "Early Adopter" |
| 180-day member | Rare banner |
| 1-year member | Epic border: "First Year" |
| Founding member (before public launch) | Legendary border: "The Founding" |

Login streak ≠ win streak. This path rewards platform loyalty regardless of betting performance.

### 5.7 Path F — Community / Social

| Trigger | Reward |
|---------|--------|
| First 10 followers | Common nameplate glow |
| First 50 followers | Rare border: "Rising" |
| First 100 followers | Epic border: "The Following" |
| Tipped pick that won (someone tailed and won) | Rare pick card badge: "The Influence" |
| Featured in Leaderboard Top 10 | Rare banner: "Top 10" |
| Featured in Hall of Fame | Mythic banner: "Immortalized" |

Follower counts are verified at time of unlock and cannot be gamed by bot follows (rate-limiting + follow-velocity checks required).

### 5.8 Path G — LEDGR Pro

As described in Section 4.2. Subscription active = Pro cosmetics available to equip. Subscription lapsed = Pro cosmetics suspended (not deleted, suspended).

### 5.9 Path H — Premium Purchase

One-time purchases. Non-repeatable. Visible in wardrobe immediately after purchase.

Rules:
- No purchase item can be Mythic rarity
- No purchase item has a performance stat or ranking effect
- Purchase items display a small "✦ Premium" indicator in the wardrobe only (not visible on public profile — the item looks identical to an earned equivalent in public view)
- Exception to above: Pro badge is always visible on public profile (it signals "supporter" not "pay to win")

### 5.10 Path I — Seasonal / Limited Event

Seasonal items are available for 14 days around a major sporting event.

Rules:
- Seasonal items are tagged with their event (e.g., "CL Final 2026 Edition")
- After the window closes, the item is never re-issued
- Users who obtained it keep it permanently
- The rarity tag shows "Seasonal — [Event Name]" instead of a standard rarity tier
- Seasonal items are Epic-equivalent in visual weight

### 5.11 Path J — Mythic / Legacy

Mythic items are never announced in advance. They are awarded retroactively or for unrepeatable moments.

Examples:
- **The Immutable** — Awarded to users with 500+ picks before the platform's public launch date. Retroactive award, announced on launch day. Never available again.
- **Season Champion** — Awarded to the #1 ranked tipster at season end. One per season. Unique visual per season.
- **Hall of Fame Inductee Banner** — Awarded on HoF induction. One per person.
- **The Unbreakable** — A 15-win streak. At any given time, fewer than 5 users in the entire platform have achieved this. Manual verification required before award.

Mythic items are tracked in a separate `mythic_awards` table with a timestamp, reason, and admin approval flag.

---

## SECTION 6 — INTEGRATION POINTS (NO BACKEND CHANGES NOW)

These are the integration points where the prestige system connects to existing systems. Listed for future implementation reference.

### 6.1 Backend Dependencies (deferred)

| Feature | Requires |
|---------|---------|
| Archetype auto-assignment | New column: `profiles.archetype` + assignment function in grading cron |
| Inventory storage | New tables: `user_inventory`, `cosmetic_items` |
| Unlock event emission | New function in autoVerify.js / grading cron: `checkUnlocks(userId, picks)` |
| WS archetype_change event | New event type in backend-ws-events.js |
| Seasonal item window | Cron job to activate/deactivate seasonal items |

### 6.2 Frontend Dependencies (deferred)

| Feature | Requires |
|---------|---------|
| Wardrobe UI | Settings page expansion |
| Trophy shelf editor | New draggable slot component |
| Cosmetic CSS classes | New section in app-components.css: `.border-centurion`, `.border-the-edge`, etc. |
| Archetype badge rendering | Update archetypes.js to render auto-assigned archetype |
| Nameplate effect CSS | New section in app-components.css: `.np-glow`, `.np-shimmer`, `.np-holo` |
| Locked items showcase | Inventory section showing un-earned items with unlock hints |

### 6.3 The Desire Loop Architecture

The prestige system creates desire loops at 4 moments:

1. **On profile visit:** User sees another tipster's Epic border. They click it → tooltip shows "Earned: 100 Verified Wins." They check their profile — 34 wins. Goal visible.

2. **On leaderboard scroll:** Small archetype icons next to usernames. User sees "THE SHARP" next to the #3 ranked tipster. They don't have an archetype yet. Bottom of leaderboard shows their pick count and what they need for first assignment.

3. **On grading result:** Win ceremony shows current unlock progress: "54/100 wins for The Centurion border."

4. **On notifications:** Unlock notifications for all path completions: "You've earned: Epic Border — The Centurion" with a preview of the item and a "Equip Now" CTA.

---

## SECTION 7 — PRESTIGE PHASE ROLLOUT PLAN

### Phase 3A — Foundation (implement first)

Priority: Build the structural pieces with no visible UI yet.

1. Add `archetype` column to `profiles` table
2. Build archetype scoring function (can run manually at first)
3. Create `cosmetic_items` catalog (static JSON file initially, table later)
4. Add cosmetic CSS classes to `app-components.css` for T1-T3 tiers
5. Remove manual archetype selection from settings (bug B2)
6. Display auto-assigned archetype on tipster page and home hero

### Phase 3B — Cosmetics Layer

Priority: Visual system without full inventory.

1. Division rings already exist — document them as Path A unlocks
2. Add performance milestone tracking to grading cron output
3. Emit unlock events via WS when thresholds are crossed
4. Build Wardrobe section in settings page
5. Apply equipped cosmetics to profile rendering

### Phase 3C — Prestige Inventory

Priority: Full inventory + desire loops.

1. Launch `user_inventory` table + seed existing users' earned items
2. Locked items showcase in wardrobe
3. Trophy shelf editor (3 slots)
4. Record highlights block on tipster page

### Phase 3D — Premium Layer

Priority: Revenue.

1. LEDGR Pro Stripe subscription (separate from tipster subscriptions)
2. Pro cosmetics gated behind subscription check
3. Purchase-only items in settings store
4. Seasonal item windows (first window: World Cup)

---

## GLOSSARY

| Term | Definition |
|------|-----------|
| Archetype | Auto-assigned betting identity label derived from verified pick stats |
| Cosmetic | A visual item that changes how a profile or pick looks. Zero gameplay effect. |
| Division Ring | The aura around an avatar that shows current division. Auto-assigned. |
| Trophy Shelf | 3–5 showcase slots on a profile where the user displays their chosen badges |
| Wardrobe | The settings UI section where users equip cosmetics and manage inventory |
| Rarity | The tier of an item: Common / Rare / Epic / Legendary / Mythic |
| Unlock Path | The category of action required to earn an item |
| Desire Loop | A system mechanic that makes visible what a user could earn and how close they are |
| LEDGR Pro | The platform subscription tier. Cosmetic + analytics benefits only. |
| Seasonal Item | A time-limited cosmetic issued during a major sporting event window |
| Mythic | Rarity tier 5. Never sold. Never repeated. Earned only through exceptional or unrepeatable actions. |

---

*This document is architecture-only. No code was modified.*  
*Next step: Phase 3A implementation — archetype auto-assignment and cosmetic CSS foundations.*
