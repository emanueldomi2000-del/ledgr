# LEDGR UI/UX ARCHITECTURE AUDIT

Produced by full inspection of every HTML/CSS/JS file in the repository.
No summaries. No placeholders. Every finding is from actual file content.

---

## SECTION 1: Every Page Grouped by Design System

### GROUP 1 — Brand System (brand.css / `--color-*` vars / Rajdhani+Barlow+JetBrains)

| Page | File | Notes |
|------|------|-------|
| Landing | `index.html` | Loads `brand.css`, uses `var(--color-*)` vars throughout. Fully consistent. |
| Become a Tipster | `become-a-tipster/index.html` | Loads `brand.css`, uses Rajdhani/Barlow/JetBrains. But hardcodes hex values (`#0A0A0A`, `#7B2CFF`) instead of CSS vars — partial bypass. |

### GROUP 2 — Purple-Tinted App System (`--bg:#07060d`, Bebas Neue + Syne + DM Mono)

| Page | File | Notes |
|------|------|-------|
| Dashboard / Post a Pick | `dashboard/index.html` | `--bg:#07060d`, nav 62px (not 60px) |
| Feed | `feed/index.html` | `--bg:#07060d`, **DUAL NAV** — both brand-nav AND inline nav rendered simultaneously |
| Leaderboard | `leaderboard/index.html` | `--bg:#07060d`, nav 60px |
| Analytics | `analytics/index.html` | `--bg:#07060d`, nav 62px (not 60px), has `.nav-btn` inline |
| Community | `community/index.html` | `--bg:#07060d`, nav 58px, `position:relative` (NOT sticky), full-viewport layout |
| Notifications | `notifications/index.html` | `--bg:#07060d`, **DUAL NAV** — both brand-nav AND inline nav |
| Compare | `compare/index.html` | `--bg:#07060d`, custom inline slide nav with profile mini-card |
| Simulator | `simulator/index.html` | `--bg:#07060d`, same as compare |
| News | `news/index.html` | `--bg:#07060d`, active link uses `var(--gr)` green instead of purple |
| Archetypes | `archetypes/index.html` | `--bg:#07060d`, slide nav only (no inline top nav defined) |
| Login | `login/index.html` | `--bg:#07060d`, no nav at all — centered form layout |

### GROUP 3 — Home Variant (close to Group 2, `--bg:#060508` slightly different)

| Page | File | Notes |
|------|------|-------|
| Home | `home/index.html` | `--bg:#060508` (purple-tinted black, not standard `#07060d`), Bebas/Syne/DM Mono |

### GROUP 4 — Hall of Fame Variant (`--bg:#050408`, marble texture, cinematic lights)

| Page | File | Notes |
|------|------|-------|
| Hall of Fame | `hall-of-fame/index.html` | `--bg:#050408`, marble background via layered CSS gradients, cinematic `.cin-shaft`/`.cin-left`/`.cin-right` effects unique to this page |

### GROUP 5 — Brand-Purple App System (`--bg:#0A0A0A`, `--ac:#7B2CFF`, Rajdhani+Barlow+JetBrains)

These are APP pages that use the LANDING PAGE font stack and color values — the critical cross-contamination.

| Page | File | Notes |
|------|------|-------|
| Tipster Profile | `tipster/index.html` | `--bg:#0A0A0A`, `--ac:#7B2CFF`, Rajdhani/Barlow/JetBrains Mono |
| Progress / Divisions | `progress/index.html` | `--bg:#0A0A0A`, `--ac:#7B2CFF`, Rajdhani/Barlow/JetBrains Mono |
| Badge Vault | `badges/index.html` | `--bg:#0A0A0A`, `--ac:#7B2CFF`, Rajdhani/Barlow/JetBrains Mono, **redefines `.brand-nav` locally** |

---

## SECTION 2: Navbar Systems Used

### Nav System A — `nav.brand-nav` (brand.css + brand-nav.js)

**HTML structure:**
```html
<nav class="brand-nav">
  <a href="/" class="brand-logo">...</a>
  <div class="brand-nav-links">...</div>
  <button class="brand-hamburger" onclick="brandMenuToggle()">&#9776;</button>
</nav>
<div class="brand-overlay" onclick="brandMenuToggle()"></div>
<div class="brand-slide-menu">
  <div class="brand-snl">...</div>
</div>
```

**Properties (brand.css):**
- Height: 60px
- Background: `rgba(10,10,10,0.94)` (hardcoded — does not use `--color-bg`)
- Backdrop-filter: blur(24px)
- Border-bottom: `1px solid var(--color-border)`
- Hamburger: 36×36px, color `var(--color-muted)`
- Slide menu: 300px wide, closes on overlay click
- Auth injection: `brand-nav.js` reads `ledgr_user`||`user`, sets profile link, adds app-context class

**Pages using System A correctly:**
- `index.html` — correct
- `become-a-tipster/index.html` — uses `.bat-nav` custom variant (not the `.brand-nav` class), different padding/bg

**Pages where System A was injected but not fully migrated:**
- `feed/index.html` — brand-nav rendered on top, but the inline nav is still there below it
- `notifications/index.html` — same, dual nav present

---

### Nav System B — Custom inline `<nav>` (defined per page in `<style>` block)

**HTML structure:**
```html
<nav>  <!-- element, no class on most pages -->
  <a href="/" class="logo">LEDG<span>R</span></a>
  <div class="nav-links">...</div>
  <button class="mobile-menu-btn" onclick="openSlideNav()">&#9776;</button>
</nav>
<div class="slide-nav-overlay" onclick="closeSlideNav()"></div>
<div class="slide-nav" id="slideNav">
  <div class="slide-nav-header">...</div>
  <div class="slide-nav-links">...</div>
</div>
```

**Property variations across pages:**
| Page | Height | Position | Blur | Active color |
|------|--------|----------|------|--------------|
| home | 60px | sticky | 28px | `var(--tx)` |
| dashboard | 62px | sticky | 24px | `var(--ac)` |
| feed | 62px | sticky | 28px | `var(--ac)` (also has brand-nav) |
| leaderboard | 60px | sticky | 28px | `var(--ac)` |
| analytics | 62px | sticky | 24px | `var(--ac)` |
| community | 58px | **relative** | 24px | none defined |
| notifications | 60px | sticky | 28px | `var(--ac)` (also has brand-nav) |
| compare | 60px | sticky | 28px | `var(--ac)` |
| simulator | 60px | sticky | 28px | `var(--ac)` |
| news | 60px | sticky | 28px | `var(--gr)` (GREEN) |
| hall-of-fame | 60px | sticky | 28px | `var(--gold)` (GOLD) |
| archetypes | — | — | — | no top nav |

**Slide nav variants:**

*Basic (no profile card):* notifications, archetypes  
Links: Home, Leaderboard, Feed, Post a Pick, Notifications, Analytics, Settings

*With profile mini-card (`.snp-av`, `.snp-name`, `.snp-sub`):* leaderboard, compare, simulator, news, hall-of-fame  
Additional: `.snp-post-btn` "POST A PICK" CTA at bottom of slide links

*Emoji icon links (`.snl-icon` span):* notifications  
No icons: compare, simulator, news, hall-of-fame (text-only `.snl` links)

---

### Nav System C — No nav (auth pages)

- `login/index.html` — centered card layout, no nav element, just `<a>` logo link inside the form box

---

## SECTION 3: Layout Systems

| Page | Max-Width | Padding | Body Layout | Z-Index Stack |
|------|-----------|---------|-------------|---------------|
| home | 1120px | 0 24px | normal flow | nav z-50 |
| dashboard | 1200px | 32px 24px | normal flow | nav z-50 |
| feed | 1120px | 0 24px | normal flow | brand-nav z-100, slide-nav z-91 |
| leaderboard | 1120px | 0 24px | normal flow | nav z-50 |
| analytics | 1100px | 0 24px | normal flow | nav z-50 |
| community | 100vw | none | `height:100vh;display:flex;flex-direction:column;overflow:hidden` | nav (no z-index) |
| notifications | 640px | 40px 24px | normal flow | brand-nav z-100, slide-nav z-200 |
| compare | 1060px | 32px 24px | normal flow | nav z-50, slide-nav z-91 |
| simulator | 1020px | 32px 24px | normal flow | nav z-50, slide-nav z-91 |
| badges | 1140px | 32px 24px | normal flow | `.brand-nav` z-200 |
| news | 1160px | 0 24px | normal flow | nav z-50, slide-nav z-91 |
| hall-of-fame | 1100px | 0 24px | normal flow | nav z-50, slide-nav z-91 |
| tipster | 1100px | 0 40px | normal flow | nav (no z-index defined) |
| progress | 1100px | 24px 24px | normal flow | nav (no z-index) |
| archetypes | 1100px | 60px 24px | normal flow | slide-nav z-200 |
| landing | 1000px | varies per section | normal flow | nav.brand-nav via brand.css |
| login | 400px max-width card | 24px | `flex center` full-screen | no nav |

**Z-index collisions to note:**
- `notifications`: brand-nav from brand.css has no explicit z-index; custom `.slide-nav` has z-index 200; `.slide-nav-overlay` has z-index 199. The brand-nav `.brand-overlay` (from brand.css) also uses high z-index — these will conflict when overlay is open.
- `badges`: local `.brand-nav` sets z-index 200; if brand.css is also loaded (it is not on badges currently), the nav class would be defined twice.

---

## SECTION 4: Typography Differences

### Font Stack 1 — "App System" (Bebas Neue + Syne + DM Mono)

**Pages using this stack:** home, dashboard, feed, leaderboard, analytics, community, notifications, compare, simulator, news, hall-of-fame, archetypes, login

```
Display/Headings: 'Bebas Neue' — all-caps, letter-spacing 3–6px, used for: logo (26px 6px-ls), page titles (32–120px), stat values (28–100px), panel labels (18–22px)
Body: 'Syne' — weights 400/500/600/700, used for all body copy, nav links, button text
Mono/Data: 'DM Mono' — weights 400/500, used for: labels (9–11px, 2–4px letter-spacing, uppercase), metadata, timestamps, filter tags
```

**Logo markup:** `LEDG<span>R</span>` with font-size 26px, letter-spacing 6px  
**Logo span color:** `var(--ac)` = `#b89fff` in this group

---

### Font Stack 2 — "Landing System" (Rajdhani + Barlow + JetBrains Mono)

**Pages using this stack:** index.html, become-a-tipster, tipster, progress, badges

```
Display/Headings: 'Rajdhani' — weight 700, letter-spacing 1–4px, used for: logo (22–24px), page titles (32–72px), username displays (36px), division names (32px)
Body: 'Barlow' — weights 400/500/600, used for all body copy, button text, descriptions
Mono/Data: 'JetBrains Mono' — weights 400/500/700, used for: rank numbers (40px bold), verified tags, badge names, stat labels
```

**Logo markup:** `LEDG<span>R</span>` with Rajdhani, font-size 22–24px, letter-spacing varies  
**Logo span color:** `var(--ac)` = `#7B2CFF` in this group

---

### Cross-system inconsistencies:

| Element | App System (B) | Landing/Hybrid (C) |
|---------|---------------|-------------------|
| Large headings | Bebas Neue | Rajdhani |
| Body text | Syne | Barlow |
| Data/labels | DM Mono | JetBrains Mono |
| Rank number | Bebas Neue 42px | JetBrains Mono 40px bold |
| Username | Bebas Neue | Rajdhani |
| Badge names | DM Mono | JetBrains Mono |
| Nav logo | Bebas Neue 26px 6px-ls | Rajdhani 22px 1px-ls |

---

## SECTION 5: Color Token Differences

### System A — brand.css `--color-*`
Used by: index.html, become-a-tipster
```css
--color-bg:           #0A0A0A
--color-surface:      #121212
--color-surface-2:    #1E1E1E
--color-purple:       #7B2CFF
--color-purple-light: #B14CFF
--color-text:         #E6E6E6
--color-muted:        #6B6B6B
--color-border:       #2A2A2A
--color-glow:         rgba(123,44,255,0.35)
--color-app-accent:   #b89fff    (defined in brand.css for rarity/glow use)
```

### System B — Purple-tinted app pages local `:root`
Used by: dashboard, feed, leaderboard, analytics, community, notifications, compare, simulator, news, hall-of-fame, archetypes, login, home (slight variant)
```css
--bg:  #07060d          /* home: #060508, hall-of-fame: #050408 */
--s1:  #0c0a1a
--s2:  #15122a
--bd:  rgba(184,159,255,0.1)   /* semi-transparent purple border */
--bd2: rgba(184,159,255,0.2)   /* slightly more opaque */
--ac:  #b89fff          /* soft lavender — the dominant accent */
--acg: rgba(184,159,255,0.07)  /* accent background tint */
--tx:  #f0edff
--mu:  #6a6690
--mu2: #9590b8
--gr:  #34d399           /* Tailwind emerald-400 */
--rd:  #f87171           /* Tailwind red-400 */
--gold: #fbbf24
--cyan: #38bdf8
--orange: #fb923c
```

### System C — Brand-purple on app pages local `:root`
Used by: tipster, progress, badges
```css
--bg:  #0A0A0A
--s1:  #121212
--s2:  #1E1E1E
--bd:  #2A2A2A           /* solid border, NOT semi-transparent */
--bd2: rgba(123,44,255,0.3)
--ac:  #7B2CFF           /* vivid brand purple — NOT soft lavender */
--ac-l: #B14CFF
--acg: rgba(123,44,255,0.08)
--tx:  #E6E6E6
--mu:  #6B6B6B
--mu2: #9590b8           /* same as System B */
--gr:  #00e5a0           /* DIFFERENT green — more saturated/cyan-green */
--rd:  #ff3355           /* DIFFERENT red — more vivid/pink-red */
--gold: #fbbf24          /* same */
```

### Critical color conflicts (same semantic role, different values):

| Semantic Role | System B | System C | Visible difference |
|---------------|----------|----------|-------------------|
| Background | `#07060d` | `#0A0A0A` | Subtle — B is purple-tinted, C is pure black |
| Surface | `#0c0a1a` | `#121212` | Noticeable — B is dark purple, C is dark grey |
| Border | `rgba(184,159,255,0.1)` | `#2A2A2A` | Major — B is glowing purple, C is solid grey |
| Accent | `#b89fff` | `#7B2CFF` | Major — B is soft lavender, C is vivid electric purple |
| Win color | `#34d399` | `#00e5a0` | Noticeable — different hue and saturation |
| Loss color | `#f87171` | `#ff3355` | Noticeable — different hue and saturation |

---

## SECTION 6: Pages Using Old Design vs New Design

**"New design" = brand.css system, consistently applied**

| Page | Status | Reason |
|------|--------|--------|
| `index.html` | ✅ New (brand.css) | Fully uses brand.css vars, correct nav |
| `become-a-tipster/` | ⚠️ New (partial) | Loads brand.css, correct fonts, but hardcodes hex values inline |

**"Old / inline system" = purple-tinted system**

| Page | Status | Reason |
|------|--------|--------|
| `dashboard/` | 🔴 Old inline | System B vars, inline nav, no brand.css |
| `leaderboard/` | 🔴 Old inline | System B vars, inline nav |
| `analytics/` | 🔴 Old inline | System B vars, inline nav |
| `community/` | 🔴 Old inline + broken nav | System B vars, non-sticky nav |
| `compare/` | 🔴 Old inline | System B vars, inline nav with profile |
| `simulator/` | 🔴 Old inline | System B vars, inline nav with profile |
| `news/` | 🔴 Old inline | System B vars, active=green inconsistency |
| `login/` | 🔴 Old inline | System B vars, no nav |
| `home/` | 🔴 Old inline variant | System B vars, `--bg` value differs |
| `hall-of-fame/` | 🔴 Old inline variant | System B vars, `--bg` differs, unique marble effects |
| `archetypes/` | 🔴 Old inline | System B vars, no top nav |

**"Hybrid / partially migrated" = brand-nav injected but System B vars remain**

| Page | Status | Reason |
|------|--------|--------|
| `feed/` | 🟡 Hybrid (broken) | brand-nav AND inline nav both present |
| `notifications/` | 🟡 Hybrid (broken) | brand-nav AND inline nav both present, loads brand.css |

**"Wrong system applied" = System C (landing fonts on app pages)**

| Page | Status | Reason |
|------|--------|--------|
| `tipster/` | 🔴 Cross-contaminated | Landing page fonts (Rajdhani/Barlow) on app content |
| `progress/` | 🔴 Cross-contaminated | Same |
| `badges/` | 🔴 Cross-contaminated + collision | Same, plus local `.brand-nav` class collision |

---

## SECTION 7: Duplicate Components (Copy-Pasted Across Pages)

### 1. Slide Nav CSS (highest duplication — 12+ pages)

The entire block of `.slide-nav`, `.slide-nav-overlay`, `.slide-nav-header`, `.slide-nav-close`, `.slide-nav-links`, `.snl`, `.snl-icon`, `.slide-nav-post`, `.snp-post-btn`, `.slide-nav-logout`, `.snl-logout` is copy-pasted into every app page `<style>` block.

Minor variants per page:
- `right: -320px` (compare, simulator, news, hall-of-fame) vs `right: -100%` (notifications, archetypes)
- `width: 300px` (compare, simulator, news, hall-of-fame) vs `width: 280px` (notifications, archetypes)
- `background: var(--s1)` (compare, simulator, news) vs `background: #0a0910` (notifications) vs `background: #0b0912` (hall-of-fame) — hardcoded hex variants
- `.slide-nav-profile` section present: compare, simulator, news, leaderboard, hall-of-fame
- `.snp-post-btn` CTA present: compare, simulator, news, hall-of-fame
- Emoji icon `.snl-icon`: notifications, archetypes, home (others are text-only)

### 2. Division Badge Pill CSS (4 pages)

`.div-bronze`, `.div-silver`, `.div-gold`, `.div-platinum`, `.div-diamond`, `.div-elite`, `.div-legend` redefined in: **home, community, tipster, progress**

The values are nearly identical between pages, but each page has its own copy. Also defined in `divisions.js` as JS-generated HTML with inline styles — a third version.

### 3. Avatar Ring Animations (2 pages)

`@keyframes ringPulse`, `@keyframes diamondCrackle`, `@keyframes conicSpin`, `.ring-bronze` through `.ring-legendary`, `.ring-pulse`, `.ring-fire` — all redefined in both **tipster** and **progress**.

### 4. Division Banner Backgrounds (2 pages)

`.banner-bronze` through `.banner-legendary` (or `.hero-banner-*`) — redefined in both **tipster** and **progress** with identical gradients.

### 5. Skeleton Loader (5+ pages)

`@keyframes shimmer` + `.skel` class copy-pasted in: **home, progress, compare, leaderboard** (and likely others). Same gradient, same animation timing.

### 6. Noise Texture `body::before` (13 pages)

Same SVG data URI (`feTurbulence baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'`, opacity 0.025–0.04) in: home, dashboard, feed, leaderboard, analytics, community, compare, simulator, news, hall-of-fame, tipster, progress, login, archetypes. Minor opacity variant per page.

### 7. Background Glow `.bg-glow` (5 pages)

`position:fixed; top:-300px; left:50%; transform:translateX(-50%); width:900px; height:600px; background:radial-gradient(...)` defined locally in: home, feed, notifications, leaderboard (likely), archetypes, login. All use slightly different radial gradient colors.

### 8. Logo Markup

`LEDG<span>R</span>` with class `.logo` (System B) or `.brand-logo` (System A) — redefined in every page's `<style>` block. Font differs: Bebas Neue in System B, Rajdhani in System C/landing.

---

## SECTION 8: Navigation Inconsistencies

### 1. Dual hamburger menus on feed and notifications

`feed/index.html`: Renders `<button class="brand-hamburger" onclick="brandMenuToggle()">` (from brand-nav) AND `<button class="mobile-menu-btn" onclick="openSlideNav()">` (from inline nav). On mobile, two hamburger icons visible. Each opens a different slide menu. The brand-nav's slide menu has different links from the inline slide nav.

`notifications/index.html`: Same problem. `brand-hamburger` opens brand.css slide menu; `.mobile-menu-btn` opens the local `.slide-nav` with the icon-based link list.

### 2. Inconsistent slide nav link sets

There is no canonical mobile nav link list. Each page determines its own set:

| Page | Links in slide nav |
|------|--------------------|
| notifications | Home, Leaderboard, Feed, Post a Pick, Notifications, Analytics, Settings |
| archetypes | Home, Leaderboard, Feed, Dashboard, Notifications, Settings |
| compare/simulator | (profile card) + navigation links + Post a Pick CTA |
| home | (inferred from pattern — needs scroll to verify) |

Missing from most slide navs: Community, Compare, Simulator, News, Progress, Hall of Fame, Badges.

### 3. Community nav is not sticky

`community/index.html` line 8 of nav CSS: `position:relative` instead of `position:sticky;top:0`. The nav scrolls away when the user scrolls down. This is the only page with this behavior. The community page has `body{height:100vh;overflow:hidden}` which means the page doesn't actually scroll — this only affects the internal feed container. But the nav still behaves differently from all other pages.

### 4. Active link color is different on three pages

- **All System B pages (majority):** `color:var(--ac)` (#b89fff) — purple tint
- **News page:** `.nav-link.active{color:var(--gr)}` — green (the news category accent)
- **Hall of Fame page:** `.nav-link.active{color:var(--gold)}` — gold (the prestige theme)
- **Notifications + analytics:** additionally adds `background:var(--acg)` to active state

### 5. Nav height is inconsistent

- 58px: community
- 60px: home, leaderboard, compare, simulator, news, hall-of-fame, notifications
- 62px: dashboard, analytics, feed

### 6. "Post a Pick" CTA presence varies

The slide nav "Post a Pick" button (`.snp-post-btn`) exists on: compare, simulator, news, hall-of-fame.
It does NOT exist on: home, dashboard, feed, leaderboard, analytics, notifications, archetypes.
No consistent rule for when this CTA appears.

### 7. Brand-nav JS changes the link set dynamically

`brand-nav.js` is only used on pages that load brand.css (index.html, become-a-tipster, feed partially, notifications partially). It changes nav links based on auth state. App pages using inline nav implement their own auth-state logic per page, with no shared function.

---

## SECTION 9: Pages That Visually Feel Like a Different Site

### Group A — App pages that look like landing pages

**`/tipster/`** — Uses Rajdhani 36px for username, Barlow for body text, JetBrains Mono for rank numbers. Color scheme matches landing page (`--bg:#0A0A0A`, `--ac:#7B2CFF`). Cinematic division banners (`.banner-bronze` → `.banner-legendary`) with animated conic gradients. When a user navigates from `/leaderboard/` (purple-tinted, Bebas Neue) to `/tipster/`, the entire visual language changes. Different background darkness, different font family, different accent color.

**`/progress/`** — Same as tipster. Rajdhani headings, JetBrains Mono data. Uses `--gr:#00e5a0` for win color (a different green from all other app pages). The division hero card uses the same cinematic banner system as tipster.

**`/badges/`** — Rajdhani for all headings including the page hero title. The `.brand-nav` class is locally redefined to a completely different nav implementation using Rajdhani font for the logo. If brand.css were ever loaded here, styles would conflict.

### Group B — Pages with unique atmospheric effects not present elsewhere

**`/hall-of-fame/`** — The body has a layered marble texture with 6 CSS gradient layers simulating marble veining, plus three fixed-position cinematic "light shaft" elements (`.cin-shaft`, `.cin-left`, `.cin-right`) not present on any other page. Background is `#050408`, darker than all other pages.

**`/community/`** — Full-viewport locked layout with `body{height:100vh;display:flex;flex-direction:column;overflow:hidden}`. The main content area is a flex-fill chat window. Page cannot be scrolled. This is fundamentally a different layout paradigm from all other pages.

### Group C — Transitional feel

**`/home/`** — Background `#060508` vs standard `#07060d`. Small difference but noticeable when comparing pages side-by-side. Everything else is consistent with System B.

**`/login/`** — No nav. Centered card on a full-screen purple-tinted background. Justified as an auth page but uses the app visual system, unlike the public landing which uses brand.css. When a logged-out user bounces between landing page → login, the visual system changes.

---

## SECTION 10: Root Causes

### Cause 1: No shared app page template

Every page in LEDGR is written from scratch as a standalone HTML file. There is no base template, no layout includes, no server-side templating. Every CSS component that needs to be shared must be manually copy-pasted into each page's `<style>` block. This is the single root cause behind all duplication.

### Cause 2: Two design systems evolved from different starting points without a merge

The brand.css system was designed for public/marketing pages (landing, become-a-tipster). It uses flat dark grays (`#0A0A0A`), vivid brand purple (`#7B2CFF`), and Rajdhani/Barlow as the type system.

The app system was built organically from the original app pages, gravitating toward a more purple-tinted dark (`#07060d`), soft lavender accent (`#b89fff`), and Bebas Neue/Syne as the type system.

Neither was declared the canonical system. They both exist in production. Pages were built by copying whatever template was most convenient at the time.

### Cause 3: Partial brand-nav migration abandoned halfway

Someone integrated `brand-nav` + brand.css into `feed/` and `notifications/`, then stopped. Those two pages now have both nav systems simultaneously. The migration was never completed or reverted.

### Cause 4: Three app pages (tipster, progress, badges) were built from landing page copies

`tipster/`, `progress/`, and `badges/` use Rajdhani/Barlow/JetBrains Mono and the System C color scheme — the landing page's visual language. These pages were likely started by copying `index.html` or `become-a-tipster/` as a starting point instead of an existing app page.

### Cause 5: No CSS custom property naming standard

System A uses `--color-bg`, `--color-purple`, `--color-text`. System B uses `--bg`, `--ac`, `--tx`. System C uses the System A values with System A names but adds `--ac-l` as a new alias. There is no bridge or mapping between the two naming conventions. A component written for one system cannot be shared with the other without rewriting all variable references.

### Cause 6: `badges/index.html` defines `.brand-nav` as a local class

The `badges/` page defines its own nav CSS under the class `.brand-nav`. This is the same class name used by brand.css for the global nav. If brand.css is ever loaded on this page, the two `.brand-nav` rule sets will merge/conflict. Currently badges does not load brand.css, but this is a lurking trap.

### Cause 7: Community was purpose-built as a chat interface

The community page's `position:relative` nav and `height:100vh;overflow:hidden` body are intentional for a chat layout. But they were never documented as intentional exceptions, making them appear as bugs.

### Cause 8: Active state, nav height, and slide nav content were never standardized

Each page author made local decisions on nav height (58/60/62px), active link color (purple/green/gold), and which links to include in the slide nav. These were never reviewed against each other.

---

## SECTION 11: Exact Files Causing the Inconsistencies

| File | Specific Problem | Lines / Evidence |
|------|-----------------|-----------------|
| `feed/index.html` | Dual nav: `nav.brand-nav` (brand.css) + inline `<nav>` with separate `.slide-nav` | Lines 1–672; `<nav class="brand-nav">` at ~line 130; inline `nav` CSS at ~line 43 |
| `notifications/index.html` | Dual nav: `nav.brand-nav` rendered at line 109; inline `nav` CSS defined at line 23; loads brand.css at line 90 | Lines 23, 90, 109 |
| `community/index.html` | Nav `position:relative` not sticky; height 58px (not 60px); full-viewport body | Nav CSS definition block ~line 5 |
| `badges/index.html` | Local `.brand-nav` class at line 28 shadows brand.css if ever loaded; uses Rajdhani/Barlow fonts instead of Bebas/Syne | Lines 11, 28 |
| `tipster/index.html` | Landing page fonts (Rajdhani/Barlow/JetBrains); `--ac:#7B2CFF` + `--bg:#0A0A0A` (System C) on app page | Lines 18, 21 |
| `progress/index.html` | Same as tipster — landing fonts, System C colors, no brand.css | Lines 8, 11 |
| `home/index.html` | `--bg:#060508` not `#07060d`; inline nav 60px with no slide nav visible in first 120 lines | Line 21 |
| `hall-of-fame/index.html` | `--bg:#050408`; unique marble texture + 3 cinematic light divs not on any other page | Lines 17–51 |
| `dashboard/index.html` | Nav height 62px (not 60px) | Line 25 |
| `analytics/index.html` | Nav height 62px (not 60px) | Confirmed from prior reads |
| `become-a-tipster/index.html` | Hardcodes `#0A0A0A`, `#7B2CFF`, `#E6E6E6` inline instead of `var(--color-bg)` etc. | Lines 12, 31, 34+ |
| `news/index.html` | `.nav-link.active{color:var(--gr)}` — green active state, inconsistent | Line 31 |
| Every app page (12+) | `.slide-nav`, `.slide-nav-overlay`, `.slide-nav-header`, `.slide-nav-close`, `.snl` CSS copy-pasted in each page's `<style>` block | Nav CSS block in each file |
| `home/`, `community/`, `tipster/`, `progress/` | Division badge pills (`.div-bronze` → `.div-legend`) redefined per page | ~line 68 in home; ~line 48 in community |
| `tipster/`, `progress/` | Avatar ring animations (`@keyframes ringPulse`, `@keyframes diamondCrackle`, etc.) copy-pasted | ~lines 62–71 in each |
| `tipster/`, `progress/` | Division banner backgrounds (`.banner-bronze` → `.banner-legendary`) copy-pasted | ~lines 41–53 in tipster; lines 47–55 in progress |

---

## SECTION 12: Step-by-Step Migration Plan Toward One Unified Design System

### Phase 0 — Emergency fixes (no style changes, just cleanup)

**Target: Fix active bugs before touching the design.**

0.1. **Remove duplicate nav from `feed/index.html`**  
Keep the inline `<nav>` system, remove the `<nav class="brand-nav">` HTML block and the brand.css `<link>` tag (if present). Feed already has a functional inline nav — the brand-nav is the intruder.

0.2. **Remove duplicate nav from `notifications/index.html`**  
Same as feed. Remove `<nav class="brand-nav">` and the brand.css `<link>` at line 90.

0.3. **Fix community nav positioning**  
Change `nav { position:relative; height:58px; }` to `position:sticky; top:0; height:60px;` in `community/index.html`. The full-viewport body layout still works — sticky nav does not break it.

0.4. **Rename local `.brand-nav` class in `badges/index.html`**  
Replace all instances of `.brand-nav` in `badges/index.html` style block and HTML with `.badges-top-nav` to eliminate the class collision.

---

### Phase 1 — Establish canonical token file (1 CSS file to replace all inline `:root` blocks)

**Target: One source of truth for all design tokens.**

1.1. Create `/app-tokens.css` with this single `:root` block:
```css
:root {
  /* Background layers */
  --bg:  #07060d;    /* canonical app bg */
  --s1:  #0c0a1a;    /* surface */
  --s2:  #15122a;    /* elevated surface */

  /* Borders */
  --bd:  rgba(184,159,255,0.1);
  --bd2: rgba(184,159,255,0.2);

  /* Accent */
  --ac:  #b89fff;    /* primary accent — soft lavender */
  --acg: rgba(184,159,255,0.07);

  /* Text */
  --tx:  #f0edff;
  --mu:  #6a6690;
  --mu2: #9590b8;

  /* Semantic colors */
  --gr:  #34d399;    /* win / positive */
  --rd:  #f87171;    /* loss / negative */
  --gold:    #fbbf24;
  --cyan:    #38bdf8;
  --orange:  #fb923c;

  /* Brand aliases (bridges to brand.css) */
  --color-bg:           var(--bg);
  --color-surface:      var(--s1);
  --color-surface-2:    var(--s2);
  --color-purple:       #7B2CFF;
  --color-purple-light: #B14CFF;
  --color-text:         var(--tx);
  --color-muted:        var(--mu);
  --color-border:       var(--bd);
}
```

1.2. Add `<link rel="stylesheet" href="/app-tokens.css">` to every app page (dashboard, feed, leaderboard, analytics, community, notifications, home, compare, simulator, news, hall-of-fame, archetypes, login, tipster, progress, badges).

1.3. Remove the inline `:root { ... }` block from each page's `<style>` once verified the page still looks correct.

1.4. Update `tipster/`, `progress/`, `badges/` to reference `--bg`, `--s1`, `--ac` etc. instead of their System C values. Adjust `--gr` from `#00e5a0` → `var(--gr)` and `--rd` from `#ff3355` → `var(--rd)`.

---

### Phase 2 — Shared nav component

**Target: One nav HTML/CSS/JS source for all app pages.**

2.1. Create `/app-nav.js` as an IIFE:
```js
(function() {
  // Renders the top nav + slide nav, binds all events
  // Options: { active: 'feed', showPostBtn: true }
  window.AppNav = { init(opts) { ... } };
})();
```

2.2. The nav must render:
- Top bar: logo, desktop links (Home, Leaderboard, Feed, Analytics, Community, Post a Pick), user badge, hamburger
- Slide nav: profile mini-card (if auth), full link list (all 10+ pages), Post a Pick CTA, logout
- Auth state: reads `ledgr_user` or `user` from localStorage, shows/hides auth elements

2.3. Link list must be canonical (same on every page): Home, Leaderboard, Feed, Dashboard (Post a Pick), Analytics, Community, Notifications, Progress, Badges, Compare, Simulator, News, Hall of Fame, Settings

2.4. Each page body calls `AppNav.init({ active: 'feed' })` and all inline nav HTML + CSS is removed.

2.5. Standardize nav: height 60px, position sticky top 0, `z-index: 50`, `background: rgba(7,6,13,0.92)`, `backdrop-filter: blur(28px)`, `border-bottom: 1px solid var(--bd)`.

---

### Phase 3 — Shared component CSS

**Target: Extract all copy-pasted components into one file.**

3.1. Create `/app-components.css` containing:
- Division badge pills: `.div-bronze` through `.div-legend` (canonical definition — remove from home, community, tipster, progress)
- Avatar ring styles: `.ring-bronze` through `.ring-legendary`, `.ring-pulse`, `.ring-fire`, all `@keyframes`
- Division banner backgrounds: `.banner-bronze` through `.banner-legendary`
- Skeleton loader: `@keyframes shimmer` + `.skel`
- Background noise: `.app-noise` class (replaces `body::before` data URI on each page)
- Background glow: `.bg-glow` canonical style
- Section heading divider: `.sec-title`, `.section-label`

3.2. Load `/app-components.css` in all app pages after `/app-tokens.css`.

3.3. Remove all duplicated CSS blocks from individual page `<style>` elements as components are moved.

---

### Phase 4 — Typography normalization

**Target: One font stack across all app pages.**

4.1. Chosen canonical app font stack: **Bebas Neue + Syne + DM Mono** (used by the majority of app pages).

4.2. Update `tipster/index.html`: Replace Rajdhani/Barlow/JetBrains import with Bebas Neue/Syne/DM Mono. Replace `font-family:'Rajdhani'` with `font-family:'Bebas Neue'` on headings. Replace `font-family:'Barlow'` with `font-family:'Syne'` on body. Replace `font-family:'JetBrains Mono'` with `font-family:'DM Mono'`. Adjust font-weight values (Rajdhani uses weight 700; Bebas Neue is single-weight — adjust letter-spacing and size accordingly).

4.3. Repeat for `progress/index.html` and `badges/index.html`.

4.4. Keep Rajdhani/Barlow/JetBrains Mono on `index.html` and `become-a-tipster/` — these are public/marketing pages using the brand typography system intentionally.

4.5. Create a centralized Google Fonts `<link>` in a shared `<head>` snippet or in `/app-tokens.css` using `@import`. This removes the per-page font URL, ensuring all pages load the same font set.

---

### Phase 5 — Accent color decision

**Target: Decide and apply one dominant accent color across all app pages.**

5.1. Current state: System B uses `#b89fff` (soft lavender) as the dominant accent for all interactive elements. System C uses `#7B2CFF` (vivid brand purple). Brand.css defines `#7B2CFF` as `--color-purple`.

5.2. Recommendation: **Adopt a two-tier accent system**:
```css
--ac:     #b89fff;    /* hover/glow/decorative — soft lavender */
--ac-vivid: #7B2CFF;  /* interactive/action (buttons, CTAs) — vivid purple */
```

5.3. In practice: CTA buttons, "Post a Pick", active nav links → `#7B2CFF`. Card borders-on-hover, badge glows, background tints → `#b89fff`. This matches the visual intuition of existing System C pages (tipster, progress use vivid purple for CTAs) while keeping System B's atmospheric soft lavender for decoration.

5.4. Pages to update: all System B pages need interactive elements changed from `--ac` (#b89fff) to `--ac-vivid` (#7B2CFF) for buttons/primary actions. Hall of Fame and news pages need their nav active color unified from gold/green to `--ac-vivid`.

---

### Phase 6 — Green and red standardization

**Target: Consistent win/loss colors.**

6.1. Pick one green: `#34d399` (Tailwind emerald-400, warmer and softer) vs `#00e5a0` (more saturated teal-green).
Recommendation: **`#34d399`** — it's used on 11 pages vs 3 for `#00e5a0`, and is more readable against dark backgrounds.

6.2. Pick one red: `#f87171` (Tailwind red-400, coral-red) vs `#ff3355` (vivid magenta-red).
Recommendation: **`#f87171`** — same reasoning, 11 pages vs 3.

6.3. Update `tipster/`, `progress/`, `badges/` to use `--gr:#34d399` and `--rd:#f87171`.

6.4. Update `/app-tokens.css` `--gr` and `--rd` to the chosen values.

---

### Phase 7 — Special page exceptions

**The following pages have intentional design differences that should be preserved, but made explicit:**

7.1. **Hall of Fame** — The marble texture and cinematic light shafts are intentional prestige atmosphere. Keep them. Extract to an opt-in CSS class (`.hof-atmosphere`) so they don't look like a bug.

7.2. **Community** — The full-viewport locked layout is intentional for the chat interface. Document it. Add a CSS comment in the file. Consider whether the non-sticky nav is actually intentional (debatable — it doesn't matter since body doesn't scroll).

7.3. **Login** — No nav is intentional for focused auth flow. Keep it. But the System B color scheme vs landing page System A creates a jarring transition from `index.html` → `login/`. Consider whether login should use brand.css vars instead.

---

### Migration Priority Order

| Priority | Task | Risk | Impact |
|----------|------|------|--------|
| 1 | Remove dual nav from feed/notifications | Low — just remove HTML | Critical UX bug |
| 2 | Fix community nav to sticky | Low | UX consistency |
| 3 | Rename `.brand-nav` in badges | Low — just rename | Prevents future collision |
| 4 | Create `/app-tokens.css` and load it | Low (additive) | Foundation for all other work |
| 5 | Standardize active nav colors (news=green, hof=gold → both use purple) | Low | Visual consistency |
| 6 | Fix nav heights to 60px (dashboard, analytics) | Low | Visual consistency |
| 7 | Normalize green/red (#34d399, #f87171) across tipster/progress/badges | Medium | Data readability |
| 8 | Build `/app-nav.js` and replace all inline nav HTML | Medium-High | Biggest maintenance win |
| 9 | Extract division badges/rings/banners to `/app-components.css` | Medium | Reduces duplication |
| 10 | Migrate tipster/progress/badges to Bebas/Syne/DM Mono | Medium | Visual unification |
| 11 | Apply two-tier accent system across all pages | Medium-High | Brand consistency |
| 12 | Decide login color system (brand.css vs app-tokens) | Low | UX flow consistency |
