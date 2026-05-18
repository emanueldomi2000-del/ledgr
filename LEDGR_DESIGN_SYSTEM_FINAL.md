# LEDGR DESIGN SYSTEM — FINAL CONSTITUTION

Version 1.0 — 2026-05-18  
This document governs every visual decision on every app page.  
No page-level deviation is permitted without updating this document first.

---

## CANONICAL SOURCE FILES

| File | Role |
|------|------|
| `/app-tokens.css` | All CSS variables — colors, spacing, radius, shadows, glows, fonts, nav dimensions |
| `/app-components.css` | Reusable component classes — skeleton, division badges, avatar rings, division banners, buttons, panels, cards, badge pills, profile cards, section titles, live indicators |
| `/app-nav.js` | Unified navigation IIFE — desktop nav, mobile slide nav, auth state, active link, notification badge, user badge, AppNav API |

**Rule:** No page may define variables that duplicate or override tokens in app-tokens.css. No page may define component CSS that already exists in app-components.css. Page `<style>` blocks contain only page-specific layout CSS.

---

## 1. IDENTITY SYSTEM

### 1.1 Brand Mark (Logo)

LEDGR has two logo components that are always used together in navigation:

**Logo image:** `/assets/logo/ledgr-icon.png`  
**Logo wordmark:** The text string **"LEDGR"** set in Bebas Neue with one character accent.

```
font-family: var(--font-display)
font-size: 22px
letter-spacing: 3px
color: var(--tx)
```

One character — canonically the **"L"** — receives `color: var(--ac-vivid)` via `<span class="logo-accent">`.

**Nav logo format:**

| Viewport | Logo |
|----------|------|
| Desktop (≥ 600px) | `[logo image 24×24px] [LEDGR wordmark]` — image + text side by side |
| Mobile (< 600px) | `[logo image 24×24px]` — image only, wordmark hidden |

Never use a user avatar, division badge, or any user-specific element in the top-left branding position.

**Permitted logo image locations:**
- Top-left navbar (desktop: image+text / mobile: image only)
- Loading / splash screens
- Login and signup pages (centered, not in nav)
- Hero section watermark (opacity 0.04–0.06, `position:absolute`, non-interactive)
- Empty state illustrations (centered below empty-state message)
- Major ceremonies (rank-up overlay, first-pick overlay)
- Hall of Fame page hero

**Prohibited logo image locations:**
- Division tier icons (use geometric Unicode symbols — see §3.2)
- Badge rarity icons
- Archetype identity icons
- Generic button icon (left of button label)
- Section dividers or section headers as decorative img tags
- Any context where the logo appears more than once per viewport

Rules:
- Always a link: `/home` when authenticated, `/` when unauthenticated
- Logo image: `width:24px; height:24px; object-fit:contain`
- Logo container: `display:flex; align-items:center; gap:8px`
- Never shrinks below 20px regardless of viewport
- The logo-accent span color may shift with user theme (`--ac` override), but defaults to `var(--ac-vivid)`

### 1.2 Avatar

Avatars represent users at all sizes. They are the single most important identity element.

**Shape:** `border-radius: var(--r-lg, 14px)` — square with rounded corners. Never a circle (`border-radius:50%`). The only exception is the verified checkmark badge, which is circular.

**Default state:** Two-letter initials from username. Background from the canonical AV_COLORS array:
```javascript
const AV_COLORS = [
  'linear-gradient(135deg,#7c3aed,#a855f7)',   // violet
  'linear-gradient(135deg,#059669,#10b981)',   // emerald
  'linear-gradient(135deg,#b45309,#f59e0b)',   // amber
  'linear-gradient(135deg,#0369a1,#38bdf8)',   // sky
  'linear-gradient(135deg,#0f766e,#14b8a6)',   // teal
  'linear-gradient(135deg,#dc2626,#ef4444)',   // red
  'linear-gradient(135deg,#7c3aed,#ec4899)'    // violet-pink
]
```
Assign deterministically by username hash so the same user always gets the same color.

**Custom avatar:** Stored in `localStorage` as `ledgr_avatar_{userId}`. Displayed as `<img>` with `object-fit:cover` inside the avatar container. Container must be `position:relative` to host rings and verified mark.

**Division glow:** Applied exclusively via `Divisions.applyGlow(el, divObj)` from `divisions.js`. Never hardcoded in page CSS. Glow classes live in app-components.css.

**Canonical sizes:**

| Name | Size | Border-radius | Usage |
|------|------|---------------|-------|
| xs | 24×24px | 6px | Feed card headers, comment avatars |
| sm | 32×32px | 8px | Sidebar rows, mini leaderboard |
| md | 44×44px | 10px | Identity card on home, tipster sidebar |
| lg | 72×72px | 14px | Tipster profile hero |
| xl | 96×96px | 16px | Settings profile editor |

**Verified checkmark badge:**
```css
position: absolute;
bottom: -3px; right: -3px;
width: 16px; height: 16px;
border-radius: 50%;
background: var(--ac-vivid);
color: #fff;
font-size: 8px;
display: flex; align-items: center; justify-content: center;
border: 2px solid var(--bg);
```

Font inside verified mark: `✓` symbol (Unicode U+2713), never the word "VERIFIED".

### 1.3 Username Display

- Always prefixed with `@` in social contexts (feed, leaderboard, tipster profile)
- No `@` prefix in personal contexts (settings page "Your profile", own identity card label)
- Font: `var(--font-display)` for hero/profile contexts; `var(--font-body)` for inline/list contexts
- Never truncated with `…` unless inside a fixed-width container with `overflow:hidden;text-overflow:ellipsis;white-space:nowrap`

---

## 2. NAVIGATION SYSTEM

### 2.1 Primary Navigation (app-nav.js)

**Rule: app-nav.js is the only navigation allowed on any app page. No custom nav HTML.**

Implementation on every page:
```html
<!-- First tag inside <body> -->
<script src="/app-nav.js"></script>

<!-- At end of page <script> block -->
AppNav.init({ active: 'pageName' });
```

Navigation properties (from app-tokens.css):
```
height:     var(--nav-h, 60px)       — fixed, never changed
z-index:    var(--nav-z, 50)
position:   sticky; top: 0
background: rgba(7,6,13,0.9); backdrop-filter: blur(16px)
```

Active link: `color: var(--ac)` — the only accent color used in the nav bar.

**Valid active keys:**
`home`, `leaderboard`, `feed`, `analytics`, `community`, `dashboard`, `notifications`, `progress`, `badges`, `compare`, `simulator`, `news`, `hall-of-fame`, `settings`

Pages whose path is not a primary nav destination (e.g. `/tipster`, `/archetypes`, `/compare`) pass a non-matching key. No link highlights. This is correct behavior — do not invent nav keys for every page.

**Nav content regions:**
- Left: logo mark (links to /home)
- Center/left: primary nav links (desktop only — desktop nav links are hidden on mobile via CSS)
- Right: notification bell, user badge (@username), slide menu trigger (mobile)

**Banned from nav area:** custom search inputs, custom dropdowns, page-specific controls, secondary page titles.

### 2.2 Secondary Navigation (in-page)

Secondary navigation = tab bars, filter chips, breadcrumbs. Applied within page content, never replacing the primary nav.

**Tab bar / filter bar:**
```css
display: flex;
background: var(--s1);
border: 1px solid var(--bd);
border-radius: var(--r-md);
padding: 4px;
gap: 2px;
```

**Tab item:**
```css
font-family: var(--font-mono);
font-size: 10px;
letter-spacing: 1px;
text-transform: uppercase;
padding: 6px 14px;
border-radius: calc(var(--r-md) - 2px);
color: var(--mu);
cursor: pointer;
transition: all .15s;
```

**Active tab item:**
```css
background: var(--acg2);
color: var(--ac);
```

**Breadcrumb** (back links, e.g. "← Leaderboard" above tipster banner):
```css
font-family: var(--font-mono);
font-size: 11px;
color: var(--mu);
letter-spacing: 1px;
text-decoration: none;
transition: color .15s;
```
Breadcrumb hover: `color: var(--ac)`. Always uses the `←` character (U+2190), never "Back" or "< Back".

**Section title headers** (within page content areas):
```css
font-family: var(--font-display);
font-size: 18-22px;
letter-spacing: 2-3px;
border-left: 2px solid var(--ac);
padding-left: 10px;
color: var(--tx);
```
Or the `.section-title` class from app-components.css.

### 2.3 Mobile Navigation

**Slide nav:** Built into app-nav.js. Width: `var(--slide-nav-w, 300px)`. Triggered by hamburger button in nav. No page-level slide nav HTML permitted.

**Floating Action Button (FAB):** Post a pick shortcut.
```css
position: fixed; bottom: 22px; right: 16px; z-index: 200;
background: var(--ac); color: #060508;
width: 52px; height: 52px; border-radius: 50%;
font-size: 22px; font-weight: 900;
box-shadow: 0 4px 24px rgba(184,159,255,0.35);
display: flex; align-items: center; justify-content: center;
```
Visible on screens ≤600px, on home page only (home is the launch pad for picks). Not shown on read-only pages.

**Bottom safe area:** Any fixed bottom element must include `padding-bottom: env(safe-area-inset-bottom)`. No hardcoded bottom offsets for iPhone notch.

**Rule:** LEDGR does not use a persistent bottom tab bar. Mobile nav = slide menu only.

---

## 3. ICON SYSTEM

### 3.1 Emoji Policy

Emoji = emotion and moments. They are never structural UI elements.

**Permitted emoji (exact list — nothing outside this set in UI-generated content):**

| Emoji | Permitted context |
|-------|------------------|
| 🔥 | Active win streak chip (`.streak-fire` class only) |
| ⚡ | "Hot moment" — sharp pick result, archetype icon for `sharp` |
| 👑 | Elite status indicator, Hall of Fame crown |
| 🏆 | Hall of Fame wins, trophy shelf items |
| 🎯 | Achievement unlocked moments, archetype icon for `specialist` |

All other emoji in UI-generated HTML are violations. The ARCHETYPES dict uses additional archetype-specific emoji (💎🐉⚙️📊🃏🥊) only inside archetype identity cards — never in any other context.

**PROHIBITED in structural UI:**
- Settings page (forms, labels, section headers, inputs)
- Dashboard page (pick form, odds display, submission flow)
- Notifications page (notification cards, headers, filters)
- Community page (room headers, member counts, system messages — NOT user messages)
- Navigation elements (nav links, mobile slide menu, notification badge)
- Buttons and form controls
- Section headers and page labels
- Data values and statistics (ROI %, win rate, stake values)
- Status indicators (LIVE, VERIFIED, WIN, LOSS)
- Division tier names and badges (no 🥉🥈🏆⚡💎🔱🐐 as division icons)

**PERMITTED in:**
- User-generated content: pick reasoning text, community chat messages (user-authored)
- Archetype identity cards (arch icon field only — 1 emoji per archetype, never decorative)
- Win streak chip (🔥 only, inside `.streak-fire` treatment)
- Toast notifications (emoji prefix — transitional, Phase 4 to replace)
- Trophy shelf items (transitional — until Phase 4 icon set)

### 3.2 Division Icon Replacement

Division indicators must use one of: a CSS class that renders geometric shapes via pseudo-elements, or Unicode geometric characters. Never emoji.

| Division | Unicode symbol | Color token |
|----------|---------------|-------------|
| Bronze | ▲ | `--bronze: #b47850` |
| Silver | ◆ | `--silver: #94a3b8` |
| Gold | ★ | `--gold: #fbbf24` |
| Platinum | ⬡ | `--cyan: #38bdf8` |
| Diamond | ✦ | `--ac: #b89fff` |
| Elite | ⊕ | `--ac-vivid: #7B2CFF` |
| Legendary | ◉ | `--gold: #fbbf24` (animated) |

**Status:** This replacement is Phase 4 work. Current emoji icons in `getDivision()` and `Divisions.pillHTML()` are a known violation. The `.div-*` CSS classes in app-components.css are ready; the icon string just needs updating.

### 3.3 Canonical UI Symbol Vocabulary

These Unicode characters are the canonical LEDGR icon vocabulary for all non-emoji UI needs:

| Purpose | Character | Notes |
|---------|-----------|-------|
| Back / previous | ← | Breadcrumbs, back buttons |
| Forward / next | → | CTAs, view-more links |
| External / expand | ↗ | Share, open in new tab, link-out |
| Close / dismiss | ✕ | Modals, overlays, chips |
| Verified check | ✓ | Verified badge only |
| Add / create | ＋ | FAB, add pick buttons |
| Separator | · | Inline metadata separators |
| Live indicator | ● | Green, animated blink — not the word "LIVE" alone |
| Streak active | W{n} | Numeric wins, not 🔥 alone — e.g. "7W" or "7-WIN STREAK" |
| Win result | WIN | Caps, no trophy emoji in result badges |
| Loss result | LOSS | Caps, no cross emoji |

### 3.4 Icon Sizing

UI symbols: `font-size` matches the surrounding text, no custom sizes.  
Decorative icons in cards (hot bar, archetype): `16-22px`, `line-height:1`, `flex-shrink:0`.  
Never use `font-size` greater than `24px` for icons — use the full Bebas Neue headline instead.

---

## 4. COMPONENT SYSTEM

### 4.1 Cards

Four card tiers — use the lowest tier that serves the content's importance.

**Tier 1 — Base card** (standard content, panels)
```css
background: var(--s1);
border: 1px solid var(--bd);
border-radius: var(--r-lg);    /* 14px */
padding: 16px 20px;
```

**Tier 2 — Elevated card** (hover target, featured rows)
```css
background: var(--s2);
border: 1px solid var(--bd2);
border-radius: var(--r-lg);
box-shadow: var(--shadow-sm);
transition: background .2s;
```

**Tier 3 — Glow card** (prestige content, win outcomes, achievements)
```css
/* Base structure */
background: var(--s1);
border-radius: var(--r-xl);   /* 20px */
/* Semantic tint — add per context */
background: linear-gradient(135deg, rgba(COLOR, 0.06), transparent 60%);
border: 1px solid rgba(COLOR, 0.18);
box-shadow: 0 0 RADIUS rgba(COLOR, ALPHA);
```

Glow radii by rarity:
- Common: none
- Rare: `0 0 12px rgba(56,189,248,0.12)`
- Epic: `0 0 16px rgba(184,159,255,0.15)`
- Legendary: `0 0 24px rgba(251,191,36,0.20)` + animated border

Semantic glow colors:
- Win: `var(--gr)` / `rgba(52,211,153,…)`
- Streak/heat: `var(--orange)` / `rgba(251,146,60,…)`
- MVP/gold: `var(--gold)` / `rgba(251,191,36,…)`
- Archetype: the archetype's own color at 0.08-0.18 alpha

**Tier 4 — Panel** (sidebar, right-column, informational)
```css
background: var(--s1);
border: 1px solid var(--bd);
border-radius: var(--r-lg);
/* No padding on panel itself — sections have own padding */
```
Panel title:
```css
font-family: var(--font-display);
font-size: 14px;
letter-spacing: 2px;
text-transform: uppercase;
color: var(--tx);
padding: 14px 16px;
border-bottom: 1px solid var(--bd);
```

**Rules:**
- Never mix tiers arbitrarily — choose based on content importance
- Hover states: `translateY(-2px) to -6px` depending on card size; larger cards use smaller lift
- Click/press: `transform: scale(0.98)` briefly
- Never `outline` on focus for cards — use `border-color` change instead

### 4.2 Buttons

Five canonical types from app-components.css. No custom button classes on pages.

| Class | Use case | Font | Background |
|-------|----------|------|------------|
| `.btn.btn-primary` | Subscribe, post pick, primary CTA | `var(--font-body)` | `var(--ac-vivid)` |
| `.btn.btn-soft` | Follow, secondary CTA | `var(--font-body)` | `var(--acg)` |
| `.btn.btn-ghost` | Analytics, share, low-priority | `var(--font-body)` | transparent |
| `.btn.btn-danger` | Unsubscribe, delete (never for picks) | `var(--font-body)` | transparent |
| `.btn.btn-cta` | "POST A PICK" style mono CTAs | `var(--font-mono)` | `var(--ac)` |

**The subscribe button is a special exception.** Because it is the primary revenue action, it receives a gradient treatment beyond `.btn-primary`:
```css
background: linear-gradient(135deg, var(--ac-vivid), #a855f7);
box-shadow: 0 4px 20px rgba(123,44,255,0.28);
font-family: var(--font-display);
letter-spacing: 2px;
```
This is the only button in the product with this gradient treatment.

**Button states:**
```css
:disabled  { opacity: .55; cursor: not-allowed; }
:hover     { transform: translateY(-1px); } /* primary/soft only */
:active    { transform: scale(0.98); }
```

**Never use:**
- Emoji inside buttons
- `font-family: 'Rajdhani'` or `'Barlow'` on any app page button
- Custom border-radius not from `--r-*` tokens
- Width greater than the natural button width except full-width stacked CTAs on mobile

### 4.3 Typography

Six-level scale:

| Level | Font | Size | Letter-spacing | Line-height | Usage |
|-------|------|------|----------------|-------------|-------|
| D1 | Bebas Neue | clamp(26px,3vw,34px) | 3px | 1.1 | Home hero greeting, dashboard page header |
| D2 | Bebas Neue | clamp(34px,5vw,46px) | 2px | 1 | Tipster username, win overlay headline |
| H1 | Bebas Neue | 22–28px | 2-4px | 1.1 | Section titles, panel titles, leaderboard rank |
| H2 | Syne | 16–18px | 0 | 1.3 | Sub-heads, card titles, modal titles |
| Body | Syne | 13–15px | 0 | 1.5-1.6 | Body copy, descriptions, reasoning text |
| Label | DM Mono | 9–11px | 1–4px | 1.4 | Metadata, timestamps, stat labels, percentages |

**Large stat numbers** (4-stat grid values: picks, ROI, etc.): Bebas Neue at 32–42px. This is the one exception to "data = DM Mono" because these are display metrics, not inline data labels.

**Rules:**
- No `font-family` declarations in page `<style>` blocks — use `var(--font-display)`, `var(--font-body)`, `var(--font-mono)`
- All Bebas Neue text is uppercase by nature of the typeface — do not apply `text-transform:uppercase` to Bebas Neue (redundant)
- DM Mono labels always `text-transform:uppercase` and `letter-spacing:1px` minimum
- Syne body text: `font-weight:400` default, `600-700` for names/usernames, never heavy weight for descriptive copy
- Color hierarchy: primary text `var(--tx)`, secondary `var(--mu2)`, muted `var(--mu)` — no other text colors except semantic (win=`--gr`, loss=`--rd`, streak=`--orange`)

### 4.4 Spacing

Canonical scale from app-tokens.css:
```
--sp-xs: 4px
--sp-sm: 8px
--sp-md: 16px
--sp-lg: 24px
--sp-xl: 48px
```

Extended values used consistently but not yet tokenized:
```
12px  — compact gap (between-element, dense list rows)
20px  — card padding (standard)
28px  — between card sections
32px  — column gap, hero layout gap
40px  — page section top padding
```

**Layout constants:**
- Max content width: `1120px` (`.main { max-width:1120px; margin:0 auto; padding:0 24px }`)
- Page horizontal padding: `24px` standard; `40px` for wide-view pages (tipster body)
- Nav-to-content gap: `32–40px` at top of first section (hero-layout padding)
- Section-to-section gap: `40–44px` (never 64px — replaced in this constitution)
- Card internal padding: `16–20px` standard; `22–24px` featured/wide cards

**Rules:**
- Choose the nearest scale value — no arbitrary pixels
- Never `padding-top:64px` or `margin-bottom:48px` for section spacing — max is 40px/36px
- Column layouts: `gap:32px` for 2-col; `gap:20–24px` for 3-col grids
- Mobile: all horizontal padding reduces to `16px`

### 4.5 Animations

**Entry animations:** All new content uses `fadeSlideUp` from app-components.css.
```css
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: none; }
}
```
Duration: `0.5s–0.7s`. Stagger sibling elements with `animation-delay: 0.05s` increments.  
Always pair with `opacity:0; animation-fill-mode:forwards` on the element.

**Ambient loops** (approved list):
| Name | Where | Duration |
|------|-------|----------|
| `shimmer` | Skeleton loaders only | 1.6s linear |
| `blink` | Live indicators (green dot) | 1.5s |
| `pulseGlow` | Low-priority ambient elements | 2s |
| `ringPulse` | Platinum avatar ring | 2.5s |
| `diamondCrackle` | Diamond avatar ring | 2s |
| `conicSpin` | Elite/Legendary rings, Elite banner | 3–4s linear |
| `legendShimmer` | Legendary banner bg | 8s ease |
| `streak-fire-pulse` | Streak fire chip | 1.2s |
| `barShimmer` | Progress bar fill | 1.4s |
| `wo-pop` / `wo-bounce` | Win overlay | 0.35s / 0.4s |
| `panelDown` | Notification panel | 0.18s |

**Rules:**
- No new `@keyframes` definitions on individual pages — add to app-components.css or this approved list
- All entry animations: `ease` or `cubic-bezier(.34,1.56,.64,1)` (spring) easing
- Ambient loops: `ease-in-out` for breathing effects; `linear` only for continuous rotation/scroll
- Reduce motion: wrap all non-essential keyframes with `@media (prefers-reduced-motion: reduce) { animation: none }`

### 4.6 Glows

Glows communicate achievement and prestige. They are never decorative backgrounds.

**When to use a glow:**
- ✓ Active streak element
- ✓ Win outcome card
- ✓ Achievement/badge unlocked
- ✓ Avatar ring (division-tier-driven, via divisions.js)
- ✓ Legendary division badge
- ✓ Hover state on prestige cards (subtle)
- ✗ Never on standard interactive cards
- ✗ Never on nav elements
- ✗ Never on form inputs
- ✗ Never as a page background effect (only `bg-glow` from app-components.css is permitted)

**Glow value scale:**
```
Ambient:    0 0 8px  rgba(color, 0.08)
Standard:   0 0 16px rgba(color, 0.12)
Strong:     0 0 24px rgba(color, 0.18)
Intense:    0 0 36px rgba(color, 0.28)
```

Semantic glow tokens from app-tokens.css:
```css
--shadow-glow:  0 0 24px rgba(184,159,255,0.15);
--shadow-gold:  0 0 24px rgba(251,191, 36,0.18);
--shadow-green: 0 0 24px rgba( 52,211,153,0.18);
--shadow-red:   0 0 24px rgba(248,113,113,0.18);
```

**Glow cap:** Maximum 3 box-shadow values on any element (standard shadow + ambient glow + inset ring).

### 4.7 Borders

Canonical border values (all from app-tokens.css):
```
Standard:   1px solid var(--bd)   = rgba(184,159,255,0.10)
Elevated:   1px solid var(--bd2)  = rgba(184,159,255,0.20)
```

Semantic borders (inline, not tokenized):
```
Positive:   1px solid rgba(52,211,153,0.25)    — win cards, positive states
Negative:   1px solid rgba(248,113,113,0.25)   — loss cards
Streak:     1px solid rgba(251,146,60,0.28–0.5) — streak elements
Gold:       1px solid rgba(251,191,36,0.22–0.38) — MVP, prestige, season
Section:    2px solid var(--ac)                — section header accent (left border)
```

**Rules:**
- Never `border: 2px solid` except avatar rings and section header left-accents
- Never hardcode border colors — use rgba() values matching the semantic system above
- No `border-top` on cards (only `border-bottom` for dividers within panels)
- Border-radius always from `--r-*` tokens — `var(--r-sm)` through `var(--r-xl)` and `var(--r-pill)`

---

## 5. PRESTIGE SYSTEM

### 5.1 Division System

Seven tiers, ascending. Score thresholds from `getReliability()` / `user_rankings.division`.

| Division | CSS class | Color | Score | Ring class |
|----------|-----------|-------|-------|------------|
| Bronze | `.div-bronze` | `#b47850` | 0–19 | `.ring-bronze` |
| Silver | `.div-silver` | `#94a3b8` (--silver) | 20–34 | `.ring-silver` |
| Gold | `.div-gold` | `#fbbf24` (--gold) | 35–49 | `.ring-gold` |
| Platinum | `.div-platinum` | `#38bdf8` (--cyan) | 50–64 | `.ring-platinum` |
| Diamond | `.div-diamond` | `#b89fff` (--ac) | 65–79 | `.ring-diamond` |
| Elite | `.div-elite` | `#f87171` (--rd) | 80–91 | `.ring-elite` |
| Legendary | `.div-legend` | `#fbbf24` (--gold) | 92+ | `.ring-legendary` |

**Division display contexts:**

| Context | Component | Source |
|---------|-----------|--------|
| Profile hero banner | `.profile-banner .banner-[tier]` | app-components.css |
| Avatar glow | `.ring-[tier]` applied by `Divisions.applyGlow()` | app-components.css / divisions.js |
| Tags row / inline | `.division-badge .div-[tier]` | app-components.css |
| Leaderboard row | `.division-badge .div-[tier]` (compact) | app-components.css |

**Rules:**
- Division values come from `user_rankings.division` (backend) → `window._myRankingMeta.division`, falling back to local `getDivision()` calculation
- Never duplicate the division display logic — `getDivision()` exists in shared JS files
- Banner applies on tipster and progress pages; never on home or leaderboard rows
- Division name always uppercase

### 5.2 Archetype System

Eight active archetypes + one default state. Governed by LEDGR_PRESTIGE_SYSTEM_FINAL.md.

**Canonical ARCHETYPES dictionary** (this is the single source of truth — match exactly on every page that references it):

```javascript
const ARCHETYPES = {
  'sharp':        { icon:'⚡', name:'The Sharp',          color:'#38bdf8', desc:'Consistently finds value the market underprices. Beats the closing line.' },
  'value-hunter': { icon:'💎', name:'The Value Hunter',    color:'#fbbf24', desc:'Targets mispriced odds. High-odds picks, positive long-run EV.' },
  'underdog-king':{ icon:'🐉', name:'The Underdog Hunter', color:'#fb923c', desc:'Backs underdogs. Wins where the crowd bets wrong.' },
  'grinder':      { icon:'⚙️', name:'The Grinder',         color:'#b89fff', desc:'Volume, consistency, steady edge. Wins through repetition.' },
  'specialist':   { icon:'🎯', name:'The Specialist',      color:'#34d399', desc:'Dominates one sport. Focus is the edge.' },
  'data-nerd':    { icon:'📊', name:'The Documentarian',   color:'#38bdf8', desc:'Data-first. Confident when the edge is real. Calibrated, not verbose.' },
  'high-stakes':  { icon:'🃏', name:'The High Stakes',     color:'#fbbf24', desc:'Maximum conviction, maximum stake. Swings big when the edge is real.' },
  'contender':    { icon:'🥊', name:'The Contender',       color:'#94a3b8', desc:'Identity in formation. The record is being written.' },
  // Deprecated backend keys — display only, never re-assigned
  'sniper':       { icon:'🎯', name:'The Sniper',          color:'#34d399', desc:'' },
  'demon':        { icon:'😈', name:'The Demon',           color:'#f87171', desc:'' },
};
```

Deprecated keys: `sniper`, `demon`, `lock-machine`, `ice-cold`, `profit-farmer`, `momentum-monster`. Never assign these to new users. Display with original name if a legacy user holds one.

**Archetype display contexts:**

| Context | Component | Prominent? |
|---------|-----------|------------|
| Tipster profile hero | `.arch-hero` card (icon + name + desc) | Yes — full card |
| Home hero | `.hero-arch` card (icon + name + desc) | Yes — compact full card |
| Leaderboard row | Archetype name only in DM Mono, archetype color | Inline only |
| Feed card | Not shown — too compact | — |
| Settings | Full card for selection | Yes |

**Rules:**
- Never show archetype as a badge pill on profile/identity pages — it must be a full card
- Archetype color used only for: card border/bg tint (`color + 44`/`0d` alpha), name color, icon color
- The Contender is the default — never labeled "UNCLASSIFIED" or shown as empty state
- "VERIFIED" must never appear in archetype copy or premium copy (per Phase 3 rule)

**Archetype card CSS pattern:**
```css
display: inline-flex; align-items: center; gap: 12px;
padding: 10px 18px; border-radius: 12px; border: 1px solid;
/* Inline style provides: border-color: {color}44; background: {color}0d */
```

### 5.3 Badge and Rarity System

Governed by `badges-system.js`. Rarity tiers from app-tokens.css:

| Tier | Token | Color | Glow | Particle count |
|------|-------|-------|------|----------------|
| Common | `--rarity-common` | `#94a3b8` | none | 6 |
| Rare | `--rarity-rare` | `#38bdf8` | 8px cyan | 12 |
| Epic | `--rarity-epic` | `#b89fff` | 12px purple | 18 |
| Legendary | `--rarity-legendary` | `#fbbf24` | 24px gold + animated border | 36 |

**Badge display contexts:**
- `/badges/` page: full badge grid via `badges-system.js`
- Tipster profile: `.trophy-shelf` with `.trophy-item` colored pills
- Home/leaderboard rows: never show — too compact

**Trophy shelf classes** (tipster page):
`.trophy-fire`, `.trophy-diamond`, `.trophy-sharp`, `.trophy-rising`, `.trophy-value`, `.trophy-veteran`  
Trophy shelf requires `::before` label "TROPHY SHELF" in DM Mono 8px, positioned as floating chip above container.

**Unlock animation:** Always via `window.badgeUnlockAnimation(name, icon)` from `badges-system.js`. Never inline.

### 5.4 Division Identity Rules

Each division is a distinct identity — not a generic tier with a different color. Every division must have its own icon, glow, border, and animation. The LEDGR logo is never used to represent a division.

**Division identity matrix:**

| Division | Icon (Unicode) | Glow color | Border style | Animation |
|----------|---------------|------------|--------------|-----------|
| Bronze | ▲ (triangle) | `rgba(180,120,80,0.20)` | `1px solid rgba(180,120,80,0.35)` | none |
| Silver | ◆ (diamond) | `rgba(148,163,184,0.18)` | `1px solid rgba(148,163,184,0.30)` | none |
| Gold | ★ (star) | `rgba(251,191,36,0.20)` | `1px solid rgba(251,191,36,0.35)` | subtle `pulseGlow` |
| Platinum | ⬡ (hexagon) | `rgba(56,189,248,0.18)` | `1px solid rgba(56,189,248,0.28)` | `ringPulse` on avatar |
| Diamond | ✦ (4-point star) | `rgba(184,159,255,0.18)` | `1px solid rgba(184,159,255,0.28)` | `diamondCrackle` on avatar |
| Elite | ⊕ (circled plus) | `rgba(248,113,113,0.20)` | `1px solid rgba(248,113,113,0.32)` | `conicSpin` on avatar ring |
| Legendary | ◉ (bullseye) | `rgba(251,191,36,0.28)` | `1px solid rgba(251,191,36,0.50)` | `legendShimmer` banner + `conicSpin` avatar ring |

**Rules:**
- Division identity = icon + glow + border + animation. All four must be present for Platinum and above.
- Never reuse the LEDGR logo (`/assets/logo/ledgr-icon.png`) to represent a division — the logo is the product brand, not a tier symbol.
- Division icons (Unicode symbols) replace all emoji tier icons. This is Phase 4 work. The `getDivision()` function and `Divisions.pillHTML()` are the two locations to update.
- Division colors must come from canonical tokens (see §5.1 table). No inline hex for division colors.
- The `.div-[tier]` and `.ring-[tier]` classes in app-components.css are the canonical CSS. No page redefines these.
- Legendary is the only tier with both a banner animation (`legendShimmer`) and a ring animation (`conicSpin`) simultaneously — this exclusivity preserves rarity signal.

### 5.5 Streak Visuals

Two-tier streak display:

| Threshold | Treatment | CSS class |
|-----------|-----------|-----------|
| streak ≥ 3 | Glowing orange chip | `.streak-hero` (tipster) / `.streak-pill` (home) |
| streak ≥ 5 | Intensified fire treatment | add `.streak-fire` to base class |

The streak chip always shows: `{N}-WIN STREAK` for ≥3; `{N}-WIN STREAK — ON FIRE` for ≥5.  
Never just "🔥 5 WIN STREAK" as flat text. The chip is the container — not a plain badge.

---

## 6. HOME / DASHBOARD / PROFILE RELATIONSHIP

### 6.1 Purpose Hierarchy

Three core authenticated views of the product. Each has a distinct function and visual weight:

| Page | URL | Purpose | Identity presence | Primary action |
|------|-----|---------|-------------------|----------------|
| **Home** | `/home` | Personal performance hub + community pulse | Compact — identity card sidebar, division badge in hero, archetype card | Navigate: post pick, follow tipster, view leaderboard |
| **Dashboard** | `/dashboard` | Pick submission form | Minimal — username only, no division ring, no archetype | Submit a pick |
| **Profile** | `/tipster?u=...` | Public prestige showcase — own or others | Maximum — banner + avatar ring + archetype hero + trophy shelf + streak chip | Follow / Subscribe |

### 6.2 Home Page Rules

- Home is not a marketing page — no landing-page-scale type (D1 max size: `clamp(26px,3vw,34px)`)
- Home is not a profile — it shows activity context, not the full record
- Hero section communicates: "here is your current standing" not "here is LEDGR's value proposition"
- The rotating brand taglines ("NO LUCK. JUST EDGE.", "VERIFIED. UNDENIABLE.") are acceptable at D1 scale — they read as dashboard greetings, not marketing headlines
- The `.identity-card` sidebar (right column, ≥960px) is a compact version of the user's profile — it links to `/tipster?u=...` for the full view
- The hero left column hierarchy: eyebrow (context) → tagline (brand greeting) → division badge + streak pill → archetype card → performance stats
- No subscribe/follow CTAs on home — those live on the tipster profile

### 6.3 Dashboard Page Rules

- Dashboard = pick submission flow only
- Post-submission: show confirmation + pending picks list
- No performance analytics, no social feed, no leaderboard
- First-pick ceremony (`IT'S ON THE LEDGER` overlay): triggers once per user lifetime (checked via `allMyPicks.length === 0` before submission)
- Parlay panel: `top: var(--nav-h)` offset — never hardcoded 62px
- **Core rule: Picks are immutable once posted. No edits. No deletes. Ever.** The dashboard's only job is submission — never present modification controls.

### 6.4 Profile (Tipster) Page Rules

- Profile is the prestige center — every visual element signals achievement and identity
- Banner tier must match the user's actual division — set via `.banner-[tier]` class in JS
- The archetype card is the single most important identity element after username + division
- Trophy shelf appears only when badges ≥ 1
- Momentum bar appears only when streak ≥ 3
- Subscribe CTA is the dominant action (gradient hero button); Follow is secondary in same row; Analytics/Share are tertiary below
- Breadcrumb "← Leaderboard" is always present above the banner
- The page works for both own profile and others' profiles — JS detects and adjusts CTA visibility

### 6.5 Data Flow Rules

```
User action → Dashboard (pick submission)
     ↓
Backend (immutable write to picks table)
     ↓
autoVerify.js (grade when fixture completes)
     ↓
WS events: pick_result (personal) + big_win/streak_milestone (broadcast)
     ↓
Home win overlay (personal) / Feed ticker (broadcast)
     ↓
Rankings engine (re-score) → division change → division_up WS
     ↓
Home rankUpAnimation / pending_rankup localStorage
     ↓
Tipster profile (reflects updated picks, stats, division)
```

Deep links from notifications:
- `new_pick` → `/tipster?u={username}`
- `streak_milestone` → `/tipster?u={username}`
- `division_up` (own) → home `rankUpAnimation()`, then `/progress`
- `badge_unlock` → `/badges/`

---

## 7. PAGE AUDIT

Status of every app page against this constitution as of 2026-05-18.

Legend: ✅ Compliant · ⚠️ Minor violation · ❌ Non-compliant · ? Unknown/unread

| Page | app-nav.js | app-tokens.css | app-components.css | No brand.css | No brand-nav.js | No custom slide nav | Correct fonts | Hero/D1 scale | Notes |
|------|------------|----------------|-------------------|--------------|-----------------|--------------------|--------------|--------------| ------|
| `/home` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Hero tagline fixed to 34px. Archetype card added. |
| `/dashboard` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | brand-nav.js orphan removed Sprint 4. |
| `/tipster` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Full prestige upgrade complete. |
| `/leaderboard` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ? | Verify no D1-scale marketing text. |
| `/feed` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ? | Dual nav removed. Verify no residual brand CSS. |
| `/analytics` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ? | Full migration Sprint 4. Verify no inline :root vars. |
| `/progress` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ? | Migration Sprint 1. |
| `/community` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ? | Mobile input fixed. Verify sticky nav. |
| `/notifications` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ? | Dual nav removed. |
| `/settings` | ✅ | ✅ | ✅ | ? | ? | ? | ? | ? | Audit needed: check for brand-nav.js remnants. |
| `/badges` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ? | Sprint 2 migration. `.badges-top-nav` was renamed — verify removed. |
| `/compare` | ? | ? | ? | ? | ? | ? | ? | ? | **Full audit needed.** Status unknown. |
| `/simulator` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ? | Sprint 2 migration. Post-result follow CTA added. |
| `/hall-of-fame` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ? | ? | Sprint 4. Verify gold active-link rule. |
| `/news` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ? | ? | Verify green active-link fix from Sprint 4 holds. |
| `/archetypes` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ? | Dead nav refs removed Sprint 4. |

### Known Violations (Phase 4 backlog)

| ID | Violation | Severity | Pages affected |
|----|-----------|----------|----------------|
| V1 | Division icons use emoji (🥉🥈🏆⚡💎🔱🐐) in `getDivision()` and `Divisions.pillHTML()` | Medium | All pages showing division badges |
| V2 | Streak indicators use 🔥 emoji as primary signal in multiple page scripts | Low | home, tipster, leaderboard, feed |
| V3 | ARCHETYPES dict duplicated across tipster/index.html, home/index.html, and any other page that reads archetype — must be extracted to a shared `/archetypes-dict.js` | Medium | tipster, home |
| V4 | `/compare` page status completely unknown — likely on old design system | High | compare |
| V5 | Division banner classes in tipster/progress may still reference old color vars | Low | tipster, progress |
| V6 | `@media (prefers-reduced-motion)` not implemented anywhere | Low | All pages |
| V7 | `getDivision()` function duplicated in home, tipster, and likely leaderboard — should be extracted to shared JS | Medium | home, tipster, leaderboard |

### Phase 4 Prerequisites (before any new feature work)

In priority order:
1. Audit `/compare` — unknown state is the highest-risk gap
2. Audit `/settings` — auth-critical page
3. Extract ARCHETYPES dict to `/archetypes-dict.js` — shared IIFE loaded on pages that need it
4. Replace emoji division icons with Unicode geometric symbols in `Divisions.pillHTML()`
5. Implement `@media (prefers-reduced-motion)` wrapper in app-components.css

---

## APPENDIX: CSS VARIABLE QUICK REFERENCE

```
/* Backgrounds */
--bg:    #07060d       page background
--s1:    #0c0a1a       surface — cards
--s2:    #15122a       elevated surface

/* Borders */
--bd:    rgba(184,159,255,0.10)   default
--bd2:   rgba(184,159,255,0.20)   elevated/hover

/* Accent */
--ac:       #b89fff               soft lavender — glows, labels, active nav
--ac-vivid: #7B2CFF               brand purple — primary CTAs
--ac-light: #B14CFF               hover on vivid
--acg:      rgba(184,159,255,0.07) tint bg
--acg2:     rgba(184,159,255,0.14) stronger tint

/* Text */
--tx:  #f0edff    primary
--mu:  #6a6690    muted
--mu2: #9590b8    medium muted

/* Semantic */
--gr:     #34d399   win/positive
--rd:     #f87171   loss/negative
--gold:   #fbbf24   prestige/rank
--cyan:   #38bdf8   platinum/data
--orange: #fb923c   streak/heat
--silver: #94a3b8   silver division
--bronze: #b47850   bronze division

/* Rarity */
--rarity-common:    #94a3b8
--rarity-rare:      #38bdf8
--rarity-epic:      #b89fff
--rarity-legendary: #fbbf24

/* Fonts */
--font-display: 'Bebas Neue', sans-serif
--font-body:    'Syne', sans-serif
--font-mono:    'DM Mono', monospace

/* Nav */
--nav-h: 60px
--nav-z: 50

/* Border radius */
--r-xs: 4px    --r-sm: 6px    --r-md: 10px
--r-lg: 14px   --r-xl: 20px   --r-pill: 999px
```
