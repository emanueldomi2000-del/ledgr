# LAST TASK

Date: 2026-05-18

Current phase: PHASE 3 — Prestige + Monetization Foundation

Current objective: Home Page Identity Conversion ✅ COMPLETE

---

## Last completed: Home Page Identity Conversion

### Goal
Convert the home page hero section from a marketing landing-page feel to match the application identity of tipster/leaderboard/profile pages. Same spacing rhythm, same card language, same profile hierarchy — no landing-page feeling.

---

### Changes made: home/index.html

#### CSS changes

1. **`.hero-tagline` font size**: `clamp(52px,8vw,100px)` → `clamp(26px,3vw,34px)`. This was the single biggest fix — the 100px Bebas Neue marketing headline was the entire source of the landing-page feeling. At 34px it reads as a dashboard section header/greeting, not a marketing shout.

2. **`.hero-tagline` line metrics**: `line-height:.92;letter-spacing:2px` → `line-height:1.1;letter-spacing:3px` — tighter marketing leading replaced with legible app proportions.

3. **`.hero-eyebrow::before`**: Removed the decorative horizontal line (`display:none`). That line (content:'', width:24px, height:1px) is a pure marketing page decoration — not used anywhere in the app pages.

4. **`.hero` padding**: `padding:64px 0 0;margin-bottom:48px` → `padding:40px 0 0;margin-bottom:36px` — tighter spacing matching app rhythm.

5. **`.hero-layout` padding**: `padding:64px 0 0;margin-bottom:48px` → `padding:32px 0 0;margin-bottom:36px` — outer container tightened.

6. **`.hero-meta` top margin**: `margin-top:24px` → `margin-top:14px`

7. **`.hero-sub` top margin**: `margin-top:16px` → `margin-top:10px`

8. **Mobile override** `@media(max-width:480px)`: `.hero-tagline{font-size:44px}` → `.hero-tagline{font-size:28px}` — was overriding back to 44px on mobile, defeated the purpose.

9. **Added `.hero-arch` CSS block** — archetype identity card styled same as tipster's `.arch-hero` but slightly more compact (16px icon, 15px name, same DM Mono descriptor pattern).

#### HTML changes

- Added `<div id="heroArchHero"></div>` between `.hero-meta` and `.hero-sub` — populated by JS when user has an archetype set.

#### JS changes

- Added `renderHeroArch()` function — reads archetype from `localStorage.getItem('ledgr_profile_'+user.username)`, renders the archetype identity card using the same ARCHETYPES dict as tipster (v2 names). Silently no-ops if no archetype set.
- Called `renderHeroArch()` at the end of `renderProfileCard()` — runs after profile data has been loaded and cached to localStorage.

---

### Before/After summary

| Element | Before | After |
|---------|--------|-------|
| Hero tagline | `clamp(52px,8vw,100px)` Bebas Neue — landing page headline | `clamp(26px,3vw,34px)` — dashboard section greeting |
| Eyebrow decoration | `::before` horizontal line (marketing) | Removed |
| Hero padding | 64px top (hero-layout) + 64px (hero) | 32px + 40px — tighter app rhythm |
| Archetype | Not shown on home page | `.hero-arch` card shown if set (icon + name + desc) |
| Mobile tagline | 44px override (big marketing text) | 28px (app text) |

---

### UX impact

- **Identity consistency**: Users now move from Home → Tipster → Leaderboard and experience the same visual language throughout. The hero no longer reads as a different product.
- **Profile hierarchy**: The home page now follows: eyebrow (context) → greeting (brand line, smaller) → division badge + streak → archetype card → performance stats. This mirrors the tipster profile hierarchy.
- **Zero regression**: All IDs preserved (`heroEyebrow`, `heroTagline`, `divisionBadge`, `streakPill`, `streakText`, `hsROI`, `hsStreak`, `hsRank`, `hsRel`). All WS event handlers intact. All ceremonies (BigWin, division promotion, badge unlock) untouched.

---

### Next: Sprint 4 remaining

1. Login/signup flow consistency (B4)
2. Push confirmation UX (B6)
3. WP-9: rank column + rank_up/rank_change events (backend)
