# LEDGR PRESTIGE SYSTEM — VALIDATION AUDIT
## Phase 3 Risk Analysis

Date: 2026-05-18  
Scope: LEDGR_PRESTIGE_SYSTEM.md reviewed against LEDGR_BRAIN.md + LEDGR_UI_BRAIN.md  
Status: Audit only — no code changes

---

## SEVERITY SCALE

| Level | Meaning |
|-------|---------|
| CRITICAL | Breaks the product's trust proposition, creates regulatory/ethical risk, or could produce irreversible damage |
| HIGH | Significant damage to product integrity, user trust, or monetization viability if shipped as-is |
| MEDIUM | Design flaw or unfairness that users will notice, discuss negatively, or exploit within weeks |
| LOW | Minor inconsistency, polish gap, or edge case with limited blast radius |

Total issues found: **31**  
Breakdown: 2 CRITICAL · 11 HIGH · 12 MEDIUM · 6 LOW

---

## PART 1 — EXPLOITABLE MECHANICS

---

### EX-1 — Priority Notification Delivery Is a Pay-to-Win Betting Advantage
**Severity: CRITICAL**

**The problem:**  
LEDGR Pro includes "Priority notification delivery — Pro followers receive new-pick notifications faster." The product's entire value proposition for followers is receiving picks early enough to find the same odds. If a paying subscriber receives a notification 10–30 seconds before a free subscriber, they have a material betting advantage over the free user. This is not cosmetic — it directly affects real money outcomes for users.

On a platform explicitly not positioning itself as a gambling site, selling time-priority access to betting signals by subscription tier crosses the line from cosmetics into time-sensitive information brokering. This is the single most dangerous design decision in the prestige document.

**Fix:**  
Remove priority notification delivery from the Pro tier entirely. All followers receive pick notifications with identical latency. The only acceptable notification differentiation is notification *type* richness (Pro users get richer card formatting, pick context, or analytics summary in the push payload) — never timing priority. Replace with: "Pro followers receive enhanced notifications: pick card preview, tipster ROI summary, and confidence level in the push notification body."

---

### EX-2 — "Verified Pro" Badge on Pick Cards Contaminates the Trust Signal
**Severity: CRITICAL**

**The problem:**  
The Pick Card Accent slot's highest-tier item (Legendary, available to Pro subscribers) shows a "VERIFIED PRO" label on pick cards in the feed and leaderboard. "Verified" is the product's core noun — it means picks cannot be edited, deleted, or fabricated. Attaching "Verified" to a paid tier creates the false implication that some picks are more verified than others, or that Pro users have an additional verification layer. Non-paying users' picks may appear "less verified" by comparison, even though all picks are equally verified.

This is a trust signal contamination on the product's most prominent display surface.

**Fix:**  
Rename the item entirely. Remove the word "Verified" from all premium cosmetic copy. Rename to "LEDGR PRO" badge on pick cards, or use a visual icon only (a small crown or star in the corner of Pro users' pick cards). Alternatively, do not put any subscription indicator on public-facing pick cards at all — keep the Pro badge only on the profile hero and leaderboard username column.

---

### EX-3 — The Analyst Archetype Is Trivially Gamed With Copy-Paste Text
**Severity: HIGH**

**The problem:**  
The Analyst requires ≥ 70% of picks with a reasoning field ≥ 15 words average. The reasoning field is free text, unmoderated, and word count is machine-measurable but not meaning-verifiable. A user can qualify as The Analyst by pasting the same 15-word sentence on every pick: "I believe this team will win based on recent form and statistical advantages." The archetype is supposed to reward data-first analysis, but the threshold rewards typing volume, not analytical depth.

This is especially damaging because archetypes are meant to be the product's verified identity signal. A gamed Analyst archetype is a lie wearing LEDGR's verification badge.

**Fix:**  
Two options:
1. **Drop The Analyst archetype** and replace with one that uses existing verified data: "The Documentarian" — uses the confidence field on ≥ 80% of picks AND their max-confidence win rate is ≥ 10% above their overall win rate (meaning their stated confidence is calibrated, not just filled in).
2. **Keep The Analyst but change the primary qualifier** to: CLV > +1.5% on picks where the confidence field is "high" or "max" (meaning they correctly identify their high-edge picks in advance). This verifies the reasoning claim through outcomes, not word count.

---

### EX-4 — The High Stakes Archetype Is Gamed by Stake Sandbagging
**Severity: HIGH**

**The problem:**  
The High Stakes archetype requires "Average stake ≥ 3× their median stake in the last 30 picks." The relative threshold is trivially gamed: post 20 picks at 0.01u stake, then post 10 picks at 0.03u stake. That satisfies 3× median with negligible actual stakes. The intent is to detect tipsters who genuinely bet large on high-conviction picks, but the relative formula has no floor.

Additionally, the formula checks "average stake ≥ 3× their median stake" — but average being 3× higher than median means a handful of large picks dominate the average. A user could post 28 small picks and 2 enormous picks to game the average, which means The High Stakes archetype describes outlier behavior on 2 picks, not a consistent stake differentiation pattern.

**Fix:**  
Replace the relative threshold with an absolute minimum floor plus a calibration check:
- Minimum: at least one pick with stake ≥ 3u (absolute floor, not relative)
- Calibration: win rate on picks with stake ≥ 2× their median ≥ 55% (high stakes picks are more accurate)
- Volume: at least 10 picks at ≥ 2× median stake settled
- Remove the "average vs. median" comparison — too easy to engineer

---

### EX-5 — Win Count Milestones Have No Quality Floor, Rewarding Low-Odds Pick Farming
**Severity: HIGH**

**The problem:**  
Path B awards "100 Settled Wins → Epic border: The Centurion" and "250 Settled Wins → Legendary border: The Proven" with no odds or ROI qualifier. A user specializing in 1.05-odds heavy favorites can accumulate 100 wins in weeks with zero edge — they're just betting near-certainties. The Centurion border on their profile would suggest 100 verified wins, implying skill, when the record demonstrates nothing about ability to find value.

Furthermore, a user could reach 100 wins while being massively net negative on P&L (100 wins + 100 losses = 50% win rate at 1.05 odds = terrible record, but still qualifies for the Epic border).

**Fix:**  
Add minimum qualifier to win-count milestones:
- "50 Wins" border → require average odds ≥ 1.60 over those 50 wins
- "100 Wins" (The Centurion) → require ROI > 0% over all settled picks (you can't be net negative and claim The Centurion)
- "250 Wins" (The Proven) → require ROI > +5% over last 100 settled picks
These filters are simple, already-computed stats that don't require new infrastructure.

---

### EX-6 — ROI Milestone Windows Are Too Narrow for Permanent Unlocks
**Severity: HIGH**

**The problem:**  
Path B grants "ROI +10% over 30 picks → Rare banner (Sharp Edge)" as a permanently unlocked item. The 30-pick window is narrow enough that a lucky run (or a cold streak in competitors leading to soft competition) permanently unlocks a banner that implies sustained sharpness. A user could achieve +10% ROI over exactly 30 picks by variance alone, then revert to -5% ROI overall — but the Sharp Edge banner stays on their profile forever, implying a quality they don't have.

Same issue for "ROI +20% over 50 picks → Epic banner" and "ROI +30% over 100 picks → Legendary banner."

**Fix:**  
Add a minimum sample AND a qualifying snapshot:
- Sharp Edge (Rare): ROI +10% over last 30 picks **AND** overall ROI > 0% across all settled picks. This prevents luck-based unlocks from users who are overall negative.
- The Edge (Epic): ROI +20% over last 50 picks **AND** total settled picks ≥ 50 **AND** overall ROI > +5%.
- Profit Machine (Legendary): ROI +25% over last 100 picks (lower threshold, harder volume requirement). The existing +30% target over 100 picks is achievable through variance; adding overall ROI > +15% makes this a genuine achievement.
The key principle: rolling window ROI alone is insufficient. Cross-reference against the overall record.

---

### EX-7 — Social Path Follow Counts Have No Anti-Gaming Infrastructure
**Severity: HIGH**

**The problem:**  
Path F grants "Epic border: The Following" for 100 followers and "Rare border: Rising" for 50 followers. The prestige document acknowledges "rate-limiting + follow-velocity checks required" as a future requirement but does not specify any implementation. Without these, mutual follow arrangements, multi-account following, and follow-farming services can trivially generate follower milestones.

The existing `follows` table schema is also inferred (LEDGR_BRAIN.md: "exact schema unknown from frontend repo"), meaning the data infrastructure for abuse detection may not exist.

**Fix:**  
Before shipping social path cosmetics:
1. Minimum follower account age: 7 days old at time of follow (prevents mass-created accounts)
2. Follower activity requirement: each qualifying follower must have at least 1 settled pick OR be a subscriber (prevents zombie follows)
3. Velocity cap: max 20 new follows counted toward milestone per 7-day window
4. Retrospective audit: at unlock time, verify the follower list against these criteria, not just the count
If these cannot be implemented, remove social path cosmetics entirely until they can be verified.

---

### EX-8 — The Drop Rate System Has No Calling Mechanism
**Severity: MEDIUM**

**The problem:**  
Section 2.4 of the prestige document defines a random drop rate table (Common 60%, Rare 25%, Epic 12%, Legendary 2.5%, Mythic 0.5%) with a pity system. However, no unlock path in Section 5 uses random drops. Every item in Section 5 unlocks deterministically from a specific condition. Section 2.4 refers to "milestone reward pulls" and "milestone chests" that are never defined or connected to any path.

This creates a contradictory architecture: the system says all items unlock deterministically (Sections 1 and 5), but also says there are random drops with pity systems (Section 2.4). If both are implemented, users will be confused about which cosmetics come from chance vs. effort.

**Fix:**  
Remove Section 2.4 entirely from the architecture. The prestige system is 100% deterministic. Every item unlocks from a named, defined condition. No randomness, no pity system, no chests. Randomness-based cosmetic systems belong in gaming contexts; LEDGR's identity is earned performance. Random drops would undermine that identity for a negligible monetization benefit that is better served by direct purchase paths anyway.

---

### EX-9 — Badge Collection Completion References Undefined Badge Set
**Severity: MEDIUM**

**The problem:**  
Path D's "Full badge vault (all badges) → Legendary pick card: The Archive" requires completing the full badge vault. But LEDGR currently has TWO separate, independent badge systems: animations.js (5-badge v1) and badges-system.js (14-badge v2). These systems have separate localStorage keys and independent state. The prestige document doesn't specify which badge system defines "the vault," and doesn't acknowledge this duplication. A user completing all v2 badges may not know about v1 badges; a user with all v1 badges can't see them in the v2 UI.

Implementation of this path is impossible until the badge systems are consolidated into one.

**Fix:**  
Block Path D implementation until badge systems are merged. The merge is already a known requirement (LEDGR_BRAIN.md: "Two badge systems with separate state"). Path D must reference a single canonical badge catalog. Define the badge catalog explicitly in the prestige document, mark which badges are in it, and ensure the v1 + v2 sets don't partially overlap.

---

### EX-10 — Contrarian Archetype Proxy Is Gameable When Primary Data Unavailable
**Severity: MEDIUM**

**The problem:**  
The Contrarian archetype uses "negative correlation with public betting percentage" as its primary distinguishing signal. When The Odds API premium endpoint (public betting %) is unavailable, the document falls back to "average odds > 2.10 with underdog/away bet ratio > 40%." This proxy is gameable: a user who always backs away teams (regardless of whether that's actually contrarian) satisfies the proxy. In some leagues, backing the away team at 2.10+ is entirely mainstream, not contrarian.

The archetype name implies fading the crowd specifically. The proxy doesn't verify crowd behavior.

**Fix:**  
If the public betting % endpoint is unavailable, don't assign the Contrarian archetype. Mark it as "data source unavailable" and display "Contrarian (unverified)" or simply don't show it. An archetype that can't be verified against its stated criterion should not be assigned. Alternatively, rename the archetype to something accurately described by the available proxy: "The Underdog Hunter" (backs underdogs, high odds, positive ROI) with the away/underdog ratio + odds as the defining criteria, not claimed crowd fading.

---

## PART 2 — PRESTIGE INFLATION RISKS

---

### PI-1 — Division Path Gives Four Legendary Items Simultaneously at LEGENDARY Division
**Severity: HIGH**

**The problem:**  
Reaching the LEGENDARY division in Path A unlocks: Legendary ring + Legendary banner + Legendary nameplate + Legendary border — four Legendary cosmetics simultaneously. Meanwhile, the hardest individual performance milestone (500 total picks) gives ONE Legendary border after months of consistent activity. A tipster who reaches LEGENDARY division in a hot streak has more Legendary items than a grinding veteran with 300 picks.

Division advancement is meaningful, but giving 4x Legendary items at once means every LEGENDARY division tipster has the same four items. The visual distinctiveness of LEGENDARY-division profiles becomes homogeneous.

**Fix:**  
Separate division cosmetic unlocks to prevent simultaneous flooding:
- LEGENDARY division: Legendary ring (automatic, division indicator) + Legendary nameplate (one free unlock)
- Second Legendary (Legendary banner): requires LEGENDARY division **AND** 50+ picks at that division (sustained, not just first touch)
- Third Legendary (Legendary border): requires LEGENDARY division **AND** remaining at LEGENDARY for 4+ consecutive weeks
This keeps the ring as the instant division signal while making the other Legendaries feel earned through time.

---

### PI-2 — Win Count Milestones Will Flood the Market With Epics on a Young Platform
**Severity: MEDIUM**

**The problem:**  
"100 Settled Wins → Epic border: The Centurion" sounds rare but will quickly become common. A tipster posting 5 picks per week with 55% win rate hits 100 wins in approximately 36 weeks — roughly 8 months of active posting. On a platform that's 12–18 months old with active users, the majority of serious users will have The Centurion. When most users have the same Epic item, it's no longer Epic in the perceived sense.

**Fix:**  
Add time compression awareness to win milestones. The rarity rating should reflect expected supply, not just achievement difficulty. Consider:
- Rename The Centurion's rarity to "Rare" (not Epic) — it will be common enough to warrant this
- Move the Epic threshold to "200 Wins" (still achievable for committed users, genuinely uncommon)
- The Proven (250 wins) → upgrade to Epic, Legendary for 500 wins
The goal is that fewer than 10% of active users have any given Epic item at any given time.

---

### PI-3 — Login Streak and Loyalty Cosmetics Dilute "Reputation Is Earned"
**Severity: MEDIUM**

**The problem:**  
Path E gives a Rare border ("Early Adopter") for 90 days of membership and an Epic border ("First Year") for 365 days. These items have the same visual weight as performance-earned cosmetics at the same rarity tier. A user who signs up, logs in daily, never posts a pick, and waits 90 days earns a Rare border equal in visual quality to "50 Verified Wins." This directly contradicts Design Principle 1.

Additionally, the "30-day login streak → Common border upgrade" rewards presence with no action. LEDGR's value comes from posting verified picks. Rewarding login streaks is a mobile-game retention mechanic that doesn't fit the platform's performance identity.

**Fix:**  
Two options:
1. **Remove login-streak cosmetics from the visual rarity system.** Replace with non-cosmetic rewards: extra wardrobe sorting options, an "OG" badge that is purely informational (not rarity-tiered), or early access to new features.
2. **Require pick activity for loyalty milestones:** "90-day member AND at least 20 picks posted" for the Early Adopter Rare border. This retains the loyalty reward while requiring genuine participation.

---

### PI-4 — The Grinder Archetype Rewards Volume Metrics Not Betting Quality
**Severity: MEDIUM**

**The problem:**  
The Grinder requires "Average picks per week ≥ 4 over last 8 weeks." This creates a posting quota. Users aware of the threshold will post to maintain their archetype regardless of conviction. Forced picking for cosmetic maintenance directly undermines pick quality and contradicts the product's integrity signal. The Grinder's identity ("wins through repetition, not spectacle") is a valid betting style, but the archetype qualification metric incentivizes posting frequency above betting conviction.

**Fix:**  
Change the volume criterion from a posting rate to a settled volume:
- Remove "Average picks per week ≥ 4 over last 8 weeks" 
- Replace with: "Total settled picks ≥ 50 AND current settled picks in the last 60 days ≥ 20" (active, not forcing a weekly cadence)
- Add a quality floor: ROI must be positive over those 60 days (active AND profitable, not just active)
This detects genuine grinders without creating a pick-posting quota.

---

## PART 3 — PAY-TO-WIN RISKS

---

### PTW-1 — Rising Pros Carousel Is Paid Discovery
**Severity: HIGH**

**The problem:**  
LEDGR Pro includes "Profile featured in 'Rising Pros' carousel (algorithmic, among Pro users with positive recent ROI)." This filter means the discovery carousel exclusively features paying subscribers. A free user with genuinely impressive recent ROI (+20% over 30 picks) never appears in this carousel. A Pro subscriber with marginal ROI (+0.1% over 20 picks) may appear. This is effectively paid-for leaderboard placement — adjacent visibility in a discovery surface that users will reasonably assume reflects performance.

Users who notice the carousel only shows Pro badges will correctly identify this as paid promotion, damaging trust in the product's fairness claims.

**Fix:**  
Remove "among Pro users" as a carousel filter. Replace with: "Rising Pros" carousel shows any user (free or Pro) who meets the performance criteria (positive recent ROI over ≥ 20 settled picks in last 30 days, with a minimum pick volume filter). Pro badge is still visible on the card — subscribers get the badge visibility, but not the algorithmic advantage. Rename to "Rising Tipsters" to remove the Pro branding from the discovery surface.

---

### PTW-2 — Pro Badge on Leaderboard Rows Creates Paid Social Class Signal
**Severity: MEDIUM**

**The problem:**  
The Pro badge is "permanent visual, shown in leaderboard rows." The leaderboard is the primary competitive surface. Any non-performance indicator on leaderboard rows is a contamination of that surface. Users will perceive the Pro badge as a marker of "this person spent money on LEDGR" next to their rank, which on a performance-ranked product creates cognitive dissonance: are they ranked 5th because of skill or because they're a Pro user?

Even if the ranking itself is untouched, the presence of a paid indicator on a performance-ranked list subtly suggests the two are related.

**Fix:**  
Remove the Pro badge from leaderboard rows. Keep the Pro badge visible on:
- The user's own profile page
- Shared pick cards (as a supporter signal, not performance)
- The wardrobe/settings page
The leaderboard row should contain only: rank, username, division badge, archetype icon, and performance stats. No payment tier indicators.

---

### PTW-3 — CLV Gating Creates Partial Information for Followers
**Severity: MEDIUM**

**The problem:**  
"Full CLV breakdown per pick (free users see CLV badge, not the raw number)." CLV is a key metric for evaluating whether a tipster genuinely has edge or just ran hot. Free users seeing "CLV badge" without the value means they know CLV exists but can't assess its magnitude. This creates information asymmetry at the point of follow/subscribe decisions: a free follower can see a tipster has positive CLV but doesn't know if it's +0.1% (noise) or +3.5% (strong edge). The subscribe decision — which costs real money — is made with incomplete information.

The product's trust model is built on transparent, verified records. Partially obscuring a key trust metric by paywall erodes that model.

**Fix:**  
Show the actual CLV number for free users on all pick cards and on the tipster's public profile. The Pro analytics benefit for CLV should instead be: deeper breakdown (CLV by sport, CLV by market type, CLV trend over time, CLV distribution chart) rather than hiding the basic per-pick number. Free users get the number; Pro users get the analysis.

---

## PART 4 — RETENTION RISKS

---

### RT-1 — Identity Loss Has No Recovery Narrative
**Severity: HIGH**

**The problem:**  
The prestige system is entirely one-directional. It describes earning and unlocking but never addresses what happens when stats decline:
- A user loses The Sharp archetype after a cold run → assigned UNCLASSIFIED or a different archetype → identity disruption with no product acknowledgment
- A user falls from GOLD to SILVER division → their Gold nameplate glow was granted at reaching Gold (Path A) — do they keep it?
- Streak cosmetics unequip after a loss

None of these identity losses are given a product moment or a recovery narrative. In the platform's design philosophy, losses are as real as wins. The prestige system should reflect this — identity erosion should have a clear state, not just a silent downgrade.

This is particularly acute for archetype reassignment. A tipster who was "The Sharp" for 3 months, shared their profile, built followers on that identity, then gets reassigned to "The Grinder" receives no explanation, no ceremony, and no way to show what they used to be.

**Fix:**  
1. **Archetype history panel on profile** (Pro benefit only in current design, but this should be free): show the last 3 archetypes held and when they changed. "Previously: The Sharp (Nov 2025 – Feb 2026)" gives context to profile visitors and prevents identity erasure.
2. **Archetype loss notification:** when archetype changes downward (SHARP → UNCLASSIFIED), send a notification: "Your betting identity has shifted — post more picks to re-establish your edge." This frames loss as an invitation, not a punishment.
3. **Permanent unlock for archetype cosmetics:** if a user earned the Sharp archetype border, they keep it in inventory permanently even if they lose the archetype. They cannot equip it while holding a different archetype (or only on the archetype-specific profile view), but it stays earned.

---

### RT-2 — UNCLASSIFIED State Has Negative Framing for New Users
**Severity: HIGH**

**The problem:**  
Every new user starts as "ESTABLISHING RECORD" — a greyed-out badge slot with a dashed border. The division system starts everyone at BRONZE (a real tier with an icon and color). The archetype system starts everyone at UNCLASSIFIED (explicitly unnamed, empty, dashed). This creates an asymmetry where new users feel incomplete rather than initiated.

Users who post picks that don't settle quickly (events in the future) can be stuck in UNCLASSIFIED for weeks, seeing the dashed slot on their profile while other visible elements (division badge, stats) are populated. A profile that partially loads its identity system feels broken.

**Fix:**  
Replace "ESTABLISHING RECORD" with an onboarding archetype that represents the new user state positively:
- Label: "THE CONTENDER" or "UNPROVEN" (neutral, not negative)
- Visual: a full badge slot with a clean, single-color border (not dashed/greyed)
- Tooltip: "Your betting style is being assessed — keep posting picks to unlock your identity"
- Same icon slot, different framing: "your identity is being revealed" rather than "your identity doesn't exist yet"
The dashed border specifically reads as "incomplete UI" rather than "aspirational progress" and should be replaced with a real badge state.

---

### RT-3 — Temporary Streak Cosmetics Create Boom-Bust Identity Cycles
**Severity: MEDIUM**

**The problem:**  
Path C gives "On Fire" nameplate (Rare) for a 5-win streak that auto-equips and auto-unequips with the streak. When the streak ends (one loss), the nameplate disappears from the profile in real time. If a user's followers visit their profile during the streak vs. after, they see two different identities. More critically, the user experiences sudden cosmetic downgrade as the emotional consequence of a normal result.

For users who are emotionally invested in their cosmetics (which is the design goal), cosmetic loss from a normal result creates outsized frustration — the nameplate disappearing may feel worse than the loss itself. This creates a Pavlovian negative association with losses that is disproportionate to the game's normal variance.

**Fix:**  
Remove the auto-equip/unequip behavior for streak cosmetics. Instead:
- Streak-active visual feedback: add a live indicator element (a small animated flame dot next to the username on the public profile) that appears when a streak is active, separate from the inventory cosmetic system
- This live indicator is not a cosmetic item — it's a live status badge that appears and disappears based on current streak state
- The Rare/Epic/Legendary nameplate items from streaks are awarded permanently once the threshold is crossed, not dependent on active streak state
- Renaming: "5-Win Streak → Rare nameplate glow: On Fire" becomes "5-Win Streak Achieved → permanent unlock: On Fire nameplate (equipped/unequipped by user choice)"

---

### RT-4 — The Mid-Game Content Desert Is Too Long
**Severity: MEDIUM**

**The problem:**  
After a user earns The Centurion border at 100 wins (approximately months 4–8 of active play), the next meaningful win-count cosmetic is The Proven at 250 wins — 150 additional wins away, which at 5 picks/week and 55% win rate is approximately 54 more weeks (another year). The ROI milestones help but require sustained performance and may not trigger. The badge collection path is unclear. The result is a multi-month period where an active, successful tipster earns no new cosmetics.

Comparing against division progression: users advancing through divisions (BRONZE → SILVER → GOLD → PLATINUM) hit unlock moments roughly every 20–40 division score points, which can happen every few weeks. The division path stays engaging; the performance milestone path goes quiet.

**Fix:**  
Add intermediate milestones in the mid-game gap (100–250 wins):
- 150 wins → Rare pick card accent (new item, no current equivalent)
- 200 wins → Epic nameplate effect (new item)
- Consider milestone clusters at 10, 25, 50, 75, 100, 150, 200, 250 (closer spacing early, wider later)
Also add ROI consistency rewards that don't require breaking records — "Positive ROI for 3 consecutive months" as a medium reward, achievable without being exceptional.

---

### RT-5 — The Desire Loop Is Only Active at Win Ceremonies and on Wardrobe Page
**Severity: MEDIUM**

**The problem:**  
Section 6.3 describes the desire loop activating at: profile visits, leaderboard scroll, win ceremonies, and notifications. Win ceremonies and notifications are already implemented. Profile visits and leaderboard scroll require new tooltip/progress UI. But there is no persistent ambient progress indicator. A user who doesn't visit their wardrobe page (most users) has no daily reminder of what they're working toward.

In effective retention systems (games, fitness apps), progress toward goals is ambient — it follows you through the product. LEDGR's desire loop only activates at specific moments, which requires the user to already be engaged enough to trigger those moments.

**Fix:**  
Add a persistent progress chip to the home page hero section, below the existing stats grid. Small, single line: "The Centurion: 67/100 wins" with a thin progress bar. One next-target only (the most imminent unlock). Clicking it goes to the wardrobe/inventory locked items section. This keeps the goal visible without cluttering the UI or requiring the user to seek out the wardrobe.

---

## PART 5 — MONETIZATION RISKS

---

### MN-1 — Free Cosmetics Are Visually Superior to Pro Cosmetics, Killing the Subscription
**Severity: HIGH**

**The problem:**  
LEDGR Pro subscribers receive Epic-tier cosmetics (Pro Aura border, Pro Dark banner, etc.). Free users who reach the LEGENDARY division receive Legendary-tier cosmetics — visually superior by two rarity tiers. A free high-performer looks more impressive than a paying Pro subscriber.

This is intentional per Design Principle 1, but it creates a monetization problem: the primary purchase motivation for cosmetics subscriptions is looking good. If the free cosmetics ceiling is above the paid cosmetics floor, the purchase incentive is almost entirely the analytics benefits. Analytics is a thin value proposition for a tipster-centric user who primarily wants status.

**Fix:**  
Two options:
1. **Increase Pro cosmetics to Legendary tier.** Accept that subscribers get Legendary-equivalent cosmetics while top performers get Mythic-equivalent. The visual hierarchy becomes: Free earned (Legendary max) < Pro subscription (Legendary with distinct Pro aesthetic) < Mythic earned (unreachable by purchase). Pro items should be visually distinct from earned items at the same rarity level — different color palette, Pro-specific aesthetic language (e.g., the "Pro Aura" has lavender/white tones distinct from the gold/orange of performance Legendaries).
2. **Remove Pro cosmetics from the rarity tier system.** Pro items are not rated by rarity — they're rated by tier (Pro Tier). They have their own distinct aesthetic that can't be compared to earned items. "You can't compare Pro items to earned items" — they're apples and oranges. This is cleaner and avoids the "whose item looks better" competition.

---

### MN-2 — No Stated Price Point for LEDGR Pro
**Severity: HIGH**

**The problem:**  
The entire Pro tier monetization section never mentions a price. The architecture for what Pro includes is complete, but without a price, the value proposition cannot be assessed. This isn't just an incomplete specification — it's a design risk because the Pro tier benefits were designed without price constraint, and the resulting offering may not justify a sustainable price point.

For context: tipster subscriptions are €10/month. If LEDGR Pro is priced above €10/month, it costs more than subscribing to the tipster whose picks you follow — that's an extremely difficult sell. If it's €5/month, the analytics benefits are probably worth it for serious tipsters, but the cosmetics are demonstrably inferior to what they can earn for free.

**Fix:**  
Define the Pro price point and design the benefits around it. Recommended approach:
- Set Pro at €5/month (half of tipster subscription)
- At this price, the analytics depth (CLV breakdown, monthly reports, opponent comparison) is compelling for serious tipsters
- The cosmetics should be reframed as "Pro visual identity" not "rarity tier" — see MN-1 fix
- Add one Pro-exclusive feature with clear utilitarian value: "Pro tipsters can see who is looking at their profile" (follower/visitor analytics) — this is a Creator Analytics feature that influencer tipsters would pay for

---

### MN-3 — Seasonal Revenue Requires Marketing Infrastructure LEDGR Doesn't Have
**Severity: MEDIUM**

**The problem:**  
Seasonal items have 14-day purchase windows tied to specific sporting events. This model requires: (1) email marketing to alert users when windows open, (2) push notifications, (3) in-app banners or homepage CTAs. LEDGR currently has no email marketing infrastructure visible in the codebase, and push notifications are currently unverified (Bug B6 in LEDGR_BRAIN.md). Without reliable notification infrastructure, seasonal items will generate near-zero revenue because users won't know the window is open.

Additionally, 14 days is a short purchase window that aligns with a specific moment users may not be emotionally primed for (e.g., Champions League Final is a soccer event, irrelevant to users who only track NBA).

**Fix:**  
- Do not launch seasonal items until push notification delivery is confirmed working (Bug B6 must be resolved first)
- Extend seasonal windows to 21 days minimum
- Add in-app banner on the home page during active seasonal windows (no external marketing required)
- Make first seasonal item free to claim (with purchase as upgrade option) to establish the seasonal cadence and train users to look for it
- Prioritize a universal seasonal event (global, multi-sport) for first launch: "Season 1 Champion Edition" tied to LEDGR's own first season end — maximally relevant to all users regardless of sport preference

---

### MN-4 — Three Separate Payment Flows Will Cause User Confusion
**Severity: MEDIUM**

**The problem:**  
Users will encounter three distinct payment contexts:
1. Tipster subscription (€10/month per tipster, existing Stripe flow on `/tipster/` page)
2. LEDGR Pro subscription (monthly platform fee, new Stripe flow in `/settings/`)
3. One-time premium cosmetic purchases (in `/settings/` store)

Each requires a separate Stripe checkout. Users who subscribe to a tipster and then encounter a LEDGR Pro upsell will experience two separate payment flows for what feel like related products. Users who purchase a cosmetic then discover LEDGR Pro exists may feel misled into a smaller purchase.

**Fix:**  
Bundle the purchase experience:
- Primary flow: LEDGR Pro subscription (includes Pro cosmetics as part of subscription)
- Secondary flow: individual cosmetic purchases (positioned as "not included in Pro" — seasonal and limited items only)
- Avoid: three separate payment flows for overlapping identity product surfaces
When LEDGR Pro is introduced, gate one-time cosmetic purchases to Pro subscribers only (or position them as LEDGR Pro upgrades). This simplifies the mental model: "Pro is the subscription. Everything else is one-time extras."

---

## PART 6 — USER FRUSTRATION RISKS

---

### UF-1 — Archetype Loss Is Sudden With No Warning
**Severity: HIGH**

**The problem:**  
The archetype reassignment algorithm runs after every 5 settled picks. A user can be mid-session, post a pick, and return to their profile to find their archetype has changed with no forewarning. The WS event fires "YOUR BETTING IDENTITY HAS CHANGED" which is framed as positive, but reassignment from a higher-status archetype (e.g., THE SHARP) to a lower-status one (e.g., THE GRINDER) or to UNCLASSIFIED will feel like a demotion regardless of framing.

The "only update if new archetype differs AND user has been on current archetype ≥ 5 picks" guard only prevents flickering between adjacent states — it doesn't prevent genuine archetype changes. A 3-pick losing run within a larger window can shift CLV enough to remove Sharp qualification.

**Fix:**  
1. **Warn before downgrade:** if recalculation would result in a lower-status archetype change, send a notification: "Your record is shifting — [specific metric] has changed. Post [X] more picks to maintain your archetype." Give a 10-pick grace period before committing a downgrade.
2. **Increase the stability window:** require current archetype to be held for 15 picks before a downgrade can happen (5 picks is too volatile). Upgrades can happen at 5 picks.
3. **Never downgrade to UNCLASSIFIED from a named archetype.** If a user loses all archetype qualification, assign them the closest-matching archetype rather than UNCLASSIFIED. UNCLASSIFIED is only for brand new users.

---

### UF-2 — "First Year" Epic Border for 365 Days May Arrive Without Fanfare
**Severity: MEDIUM**

**The problem:**  
The 1-year member Epic border is a significant milestone but the product has no mechanism to guarantee it's celebrated. If the user isn't active on their anniversary date, they get the unlock notification via the WS system — but they may be offline. If they've been inactive for 2 months, the anniversary unlock fires into a dormant notification queue with no ceremony. The emotional moment is lost.

**Fix:**  
Anniversary cosmetic unlocks should be stored with a delivery guarantee (the `ledgr_pending_rankup` localStorage pattern used for division promotions). On next login after anniversary, show a "One Year on LEDGR" ceremony overlay. This is similar to the division promotion replay (already implemented in Sprint 3). Extend the replay mechanism to cover all milestone cosmetic unlocks, not just division promotions.

---

### UF-3 — Trophy Shelf Slot Asymmetry (3 vs. 5) Creates Visible Class Divide
**Severity: MEDIUM**

**The problem:**  
On the public tipster profile, Pro users have 5 Trophy Shelf slots while free users have 3. Profile visitors see two incomplete slots on free user profiles. A free user with 10 badges earned can only display 3; their profile appears less developed than a Pro subscriber with 3 badges who fills all 5 slots. The slot count difference is permanent and visible, creating a public marker of subscription status on every profile, regardless of user intent.

Note: a user who has only earned 3 badges and subscribes to Pro gets no benefit from 5 slots — but a free user with 10 earned badges is penalized by the 3-slot limit in a way that's visible to profile visitors.

**Fix:**  
Link the slot expansion to achievement, not payment:
- All users start with 3 slots
- 4th slot unlocks at 5 badges earned (achievable by most users within weeks)
- 5th slot unlocks at 10 badges earned (achievable by dedicated users in months)
- 6th slot (Pro-exclusive) as the Pro differentiator, available only to subscribers who have also earned ≥ 10 badges
This keeps the Pro benefit but prevents the "5 slots vs. 3 slots" becoming a pay-gap display.

---

### UF-4 — Wardrobe Locked Items Screen Will Read as a Paywall to New Users
**Severity: MEDIUM**

**The problem:**  
Section 3.5 describes the Wardrobe's Inventory section as containing: "All Items, By Slot, By Rarity, Locked Items (greyed — shows how to unlock)." For a new user, the Wardrobe opens with the majority of items locked. The first experience of the prestige system is a screen that's mostly greyed out with labels saying what they don't have.

The unlock conditions visible on locked items include performance milestones (earned), Pro subscription (paid), and direct purchases (paid). New users cannot easily distinguish earned-locked items from paid-locked items. If their first interpretation is "most things here require payment," they may disengage from the entire system.

**Fix:**  
Design the Wardrobe "Locked Items" section to show only earned-locked items by default. Separate the catalog into: "Earn These" (performance/achievement paths) and "Premium" (Pro, purchase, seasonal). First-time users see the Earn These section first with clear progress toward each item. The Premium section is accessible but not the default first view. This framing makes the first experience "here's what you're working toward" instead of "here's what you'd need to pay for."

---

## PART 7 — PROGRESSION PACING ISSUES

---

### PP-1 — LEGENDARY Division Unlocks Cascade Overshadows All Other Paths
**Severity: HIGH**

**The problem:**  
Reaching LEGENDARY division (Path A) now awards 4 Legendary cosmetics simultaneously (ring, banner, nameplate, border) — plus whatever milestone cosmetics were earned along the way. The division path is the dominant progression track, and its endgame reward is so large it makes all other Legendary items from other paths redundant. After LEGENDARY division, a tipster's cosmetic profile is effectively complete. There's no visible goal to work toward in the cosmetic system.

Contrast: reaching LEGENDARY division is rare and should feel special. But four simultaneous Legendary items is excessive — it reduces the design value of each individual item and makes the entire wardrobe feel "done" in one moment.

**Fix:**  
See PI-1 fix (separate division cosmetics by time, not by moment). Additionally, define a "post-LEGENDARY" progression path:
- Seasonal items give goals across time
- The performance milestones (500 picks, 250 wins, ROI +30%) target LEGENDARY-division users who want to differentiate within the tier
- Consider a visible "LEDGR Record" title system for LEGENDARY users: "LEGENDARY — Season 2 Veteran / 400 Wins / The Veteran" displayed as a compound identity
This ensures LEGENDARY-division users still have cosmetic progression goals.

---

### PP-2 — Streak Path Rewards Luck-Sensitive Outcomes
**Severity: MEDIUM**

**The problem:**  
Path C cosmetics (Epic frame at 7-win streak, Legendary nameplate at 10-win streak) are triggered by win streaks. Two users with identical 58% win rates will have statistically different streak histories purely through variance. At 58% win rate, the probability of a 10-win streak ever occurring in 200 picks is approximately 35% (rough calculation). Meaning 65% of equally skilled tipsters never earn the Legendary nameplate, while 35% do — not because of skill but because of random run ordering.

Cosmetics that signal skill should be based on skill metrics, not variance outcomes.

**Fix:**  
Change streak cosmetics from one-time event triggers to sustained performance triggers:
- 7-win streak → change to: "Win rate ≥ 60% over last 30 settled picks, minimum 20 settled"
- 10-win streak → change to: "Win rate ≥ 65% over last 50 settled picks, minimum 30 settled"
The sustained win rate requirement is skill-based, not variance-based. Both thresholds are achievable by genuinely strong performers and not achievable by lucky streaks followed by reversion. Streak count can remain a display stat and a trigger for temporary visual flourishes (the streak pill on home page), but permanent cosmetic unlocks should be skill-verified.

---

### PP-3 — No Catch-Up Mechanism for Late Joiners on Mythic/Legacy Items
**Severity: MEDIUM**

**The problem:**  
Path J (Mythic/Legacy) items include "The Immutable" for 500+ picks before public launch and "The Founding" (Legendary) for joining before public launch. By definition, these items become permanently inaccessible to anyone who joins after launch. In the first months of the platform, new users see profiles covered with founding-era cosmetics they can never obtain. This creates visible evidence that they are permanently behind early adopters in prestige, regardless of their future skill.

In competitive prestige systems (esports, trading card games), this is a known problem that causes "I'll never catch up" disengagement from newcomers.

**Fix:**  
Limit how many founding-era items are visible simultaneously. Founding members should be able to display their legacy items but the profile should not visually telegraph "founding era" on every surface. Additionally:
- Create a "Season 1 Veteran" item (earnable by completing Season 1, not just being there from day 0) that is achievable by anyone who participates in the first season, even if they joined after launch
- Add "First Year" cohort items (earnable by first-year users regardless of founding status) as a rolling accessible version of the founding privilege
The goal: each cohort has its own era cosmetics. Founding members have unique items, but every subsequent cohort also has unique items that feel special to them.

---

### PP-4 — Archetype Scoring Algorithm Is Undefined Beyond "0–100"
**Severity: LOW**

**The problem:**  
Section 1.4 says "score each archetype 0–100 based on criteria match / assign archetype with highest score / if highest score < 40: assign UNCLASSIFIED." But the scoring function itself is not specified. The criteria for each archetype are defined as binary conditions (all required) or threshold checks. How a 0–100 score is derived from binary conditions is not architecturally specified, leaving implementation ambiguous.

Without a specified scoring function, two implementations will produce different results. Critical examples: if a user satisfies Sharp and Value Hunter simultaneously (possible — high CLV AND high average odds), which archetype wins? The "highest score" rule should resolve this, but the score calculation isn't defined.

**Fix:**  
Define the scoring formula explicitly in the architecture. Recommended approach:
- Each archetype has a set of primary criteria (binary: met or not) and secondary criteria (graded: how far above/below threshold)
- Primary criteria: each met = 25 base points. All primary criteria met = 100 base points (starting position)
- Secondary criteria: continuous score bonus/penalty based on how much the user exceeds or falls below the threshold (e.g., CLV at +4.0% vs. the 2.0% threshold gets a 25-point bonus)
- Tiebreaker: if two archetypes score within 5 points of each other, prefer the one with more specific/harder-to-fake primary criteria (Sharp > Grinder when tied)
Specify this in pseudocode in the prestige document, not just in narrative form.

---

### PP-5 — 5-Pick Recalculation Cadence Is Too Frequent for Archetype Stability
**Severity: LOW**

**The problem:**  
Archetype recalculates after every 5 settled picks. A professional tipster posting 5 picks per week has their archetype potentially reassigned weekly. Over 6 months, that's 26 potential reassignments. The archetype is supposed to describe how someone bets, but with weekly recalculation potential, it describes how they bet in the last rolling window — which may fluctuate naturally. Archetype changes become noise rather than signal.

**Fix:**  
Change recalculation cadence from "every 5 settled picks" to "weekly, on the weekly snapshot run." This aligns archetype recalculation with the existing weekly ranking snapshot (ranking_history table). It means:
- Archetype is stable for the week (users know what their archetype is)
- Changes happen on a Sunday midnight update (predictable timing)
- The 5-pick guard can be replaced with "minimum 10 new settled picks since last assignment" as an additional trigger for fast-moving users
Weekly cadence also aligns with the desire loop — users can see their archetype each Monday and know it's fresh.

---

### PP-6 — The Pinnable Record Highlight Has No Verification Boundary
**Severity: LOW**

**The problem:**  
Section 3.3 allows users to pin one custom stat highlight: "Most followers gained in a week" and "Biggest upset pick won." These are computed from different data sources (follow events vs. pick results) and may not be easily computable client-side with the existing API. "Most followers gained in a week" requires follower join timestamps — this data may not be available from `GET /followers/:userId` which likely returns current followers, not historical join dates. Building this requires additional backend endpoints.

If the pinnable highlight is implemented client-side without backend support for all options, some options will show incorrect or stale data.

**Fix:**  
Limit the initial set of pinnable highlights to stats that are already available in the existing API response:
- Best single P&L (from picks data — already available)
- Longest win streak (from user_rankings.bestStreak — already available)
- Win rate above odds > 2.50 (calculable from picks array client-side)
- Total P&L (already available)
Defer "followers gained in a week" and "biggest upset by public attention" to a later release when the required data endpoints exist. Shipping a pinnable highlight UI that shows wrong data is worse than not shipping it.

---

## REVISED ARCHITECTURE RECOMMENDATIONS

The following changes to LEDGR_PRESTIGE_SYSTEM.md are required before implementation begins.

### RA-1 — Remove From the Architecture Entirely

| Item | Reason |
|------|--------|
| Priority notification delivery in Pro | CRITICAL pay-to-win betting advantage |
| "Verified Pro" badge text on pick cards | CRITICAL trust signal contamination |
| Random drop rates and pity system (Section 2.4) | Orphaned system, no calling mechanism, wrong product fit |
| "Rising Pros" carousel Pro-only filter | Pay-for-discovery, damages fairness perception |
| Pro badge in leaderboard rows | Paid indicator on performance-ranked surface |

### RA-2 — Redesign Before Implementation

| Item | Revised Design |
|------|---------------|
| The Analyst archetype | Replace with The Documentarian (confidence calibration-based, not word count) |
| The High Stakes archetype | Replace relative stake threshold with absolute floor + accuracy verification |
| Win count milestones | Add odds floor and ROI qualifier; adjust rarity labels to match expected supply |
| ROI milestone windows | Cross-reference with overall record, not just rolling window |
| Trophy Shelf slots | Tie to badge count earned, not Pro subscription; 6th slot as Pro exclusive |
| Temporary streak cosmetics | Split into live status indicator (flame dot) + permanent earned unlock |
| Division Path A cascade | Spread Legendary unlocks over time, not all at once |
| UNCLASSIFIED state | Replace with "The Contender" — full badge, positive framing |
| Login streak cosmetics | Require pick activity or remove from rarity tier system |
| Pro cosmetics rarity | Upgrade to Legendary or create a separate Pro Tier (no rarity comparison) |

### RA-3 — Defer Until Prerequisites Are Met

| Item | Prerequisite |
|------|-------------|
| Social path cosmetics (Path F) | Anti-gaming infrastructure (age check, activity requirement, velocity cap) |
| Badge collection paths (Path D) | Single canonical badge system (v1 + v2 merge) |
| Seasonal items | Push notification delivery confirmed working (Bug B6) |
| Accumulator archetype | Parlay tracking in picks table |
| "Followers gained in a week" pinnable highlight | Follower join timestamp endpoint |
| Full badge vault (Path D) | Canonical badge catalog defined |

### RA-4 — Add to the Architecture

| Addition | Description |
|----------|-------------|
| Pro price point | Define price (recommended: €5/month) and ensure benefits justify it |
| Archetype grace period | 10-pick warning before downgrade; 15-pick minimum hold before any change |
| Identity loss narrative | Archetype history panel (free); archetype loss WS notification; permanent archetype cosmetic ownership |
| Mid-game milestones | 150 wins, 200 wins, 3-month consistent ROI — fill the 100–250 win desert |
| Win ceremony progress counter | Persistent home page chip showing closest next unlock |
| Milestone delivery guarantee | Extend ledgr_pending_rankup mechanism to cover all major milestone unlocks |
| Pro feature: visitor analytics | "Who viewed your profile" — compelling for creator tipsters, justifies price |
| Season cohort cosmetics | Each season gets its own cohort items (catch-up mechanism for late joiners) |

---

## ISSUE REGISTER

| ID | Severity | Category | Issue | Fix Reference |
|----|----------|---------|-------|--------------|
| EX-1 | CRITICAL | Exploit | Priority notifications = pay-to-win betting | RA-1 |
| EX-2 | CRITICAL | Exploit | "Verified Pro" contaminates trust signal | RA-1 |
| EX-3 | HIGH | Exploit | Analyst archetype gameable with copy-paste | RA-2 |
| EX-4 | HIGH | Exploit | High Stakes relative threshold gameable | RA-2 |
| EX-5 | HIGH | Exploit | Win count milestones reward odds farming | RA-2 |
| EX-6 | HIGH | Exploit | ROI window too narrow for permanent unlocks | RA-2 |
| EX-7 | HIGH | Exploit | Social path follow counts ungameable only in theory | RA-3 |
| EX-8 | MEDIUM | Exploit | Drop rate system has no calling mechanism | RA-1 |
| EX-9 | MEDIUM | Exploit | Badge vault path references undefined badge set | RA-3 |
| EX-10 | MEDIUM | Exploit | Contrarian proxy gameable when primary data absent | RA-2 |
| PI-1 | HIGH | Inflation | 4 Legendary items simultaneously at LEGENDARY div | RA-2 |
| PI-2 | MEDIUM | Inflation | Win count Epics will flood market on young platform | RA-2 |
| PI-3 | MEDIUM | Inflation | Login streak cosmetics dilute reputation principle | RA-2 |
| PI-4 | MEDIUM | Inflation | Grinder quota incentivizes forced picks | RA-2 |
| PTW-1 | HIGH | Pay-to-Win | Rising Pros carousel is paid discovery | RA-1 |
| PTW-2 | MEDIUM | Pay-to-Win | Pro badge in leaderboard rows = paid class signal | RA-1 |
| PTW-3 | MEDIUM | Pay-to-Win | CLV gating obscures key trust metric | RA-2 |
| RT-1 | HIGH | Retention | Identity loss has no recovery narrative | RA-4 |
| RT-2 | HIGH | Retention | UNCLASSIFIED state has negative framing | RA-2 |
| RT-3 | MEDIUM | Retention | Temporary streak cosmetics = boom-bust identity | RA-2 |
| RT-4 | MEDIUM | Retention | Mid-game content desert (100–250 wins) | RA-4 |
| RT-5 | MEDIUM | Retention | Desire loop not ambient — only fires at specific moments | RA-4 |
| MN-1 | HIGH | Monetization | Free cosmetics visually beat Pro cosmetics | RA-2 |
| MN-2 | HIGH | Monetization | No price point defined for LEDGR Pro | RA-4 |
| MN-3 | MEDIUM | Monetization | Seasonal revenue requires infrastructure LEDGR lacks | RA-3 |
| MN-4 | MEDIUM | Monetization | Three separate payment flows = user confusion | RA-4 |
| UF-1 | HIGH | Frustration | Archetype reassignment is sudden, no warning | RA-4 |
| UF-2 | MEDIUM | Frustration | "First Year" milestone arrives silently | RA-4 |
| UF-3 | MEDIUM | Frustration | 3 vs. 5 trophy slots creates visible class divide | RA-2 |
| UF-4 | MEDIUM | Frustration | Wardrobe locked items reads as a paywall | RA-2 |
| PP-1 | HIGH | Pacing | LEGENDARY division cascade makes wardrobe "done" | RA-2 |
| PP-2 | MEDIUM | Pacing | Streak cosmetics reward variance, not skill | RA-2 |
| PP-3 | MEDIUM | Pacing | No catch-up for late joiners on legacy items | RA-4 |
| PP-4 | LOW | Pacing | Archetype scoring formula undefined | RA-4 |
| PP-5 | LOW | Pacing | 5-pick recalculation cadence creates identity noise | RA-2 |
| PP-6 | LOW | Pacing | Pinnable highlight requires unavailable backend data | RA-3 |

---

## MINIMUM VIABLE PRESTIGE SYSTEM

Given the risks identified above, the following is the minimum safe architecture that can be implemented without the identified critical or high risks.

### Safe to Ship as Designed
- Division Path A cosmetics (Legendary cascade issue aside — spread them out)
- Archetype auto-assignment (with grace period and The Contender new-user state)
- Profile showcase layers (record, division, archetype — all data-driven)
- Trophy Shelf (3 slots baseline, unlock 4th/5th via badge count)
- Record Highlights (automatic stats only — defer pinnable highlight)
- Basic wardrobe UI (equipped items, earned items only — no locked items screen on first version)
- Permanent cosmetic unlocks from performance milestones (with EX-5 and EX-6 fixes applied)
- Streak live indicator (separate from inventory, temporary visual only)
- Permanent streak cosmetics (7-win, 10-win) as skill-based win rate thresholds (PP-2 fix)

### Defer Until Risks Are Resolved
- Social path cosmetics (no anti-gaming infrastructure)
- LEDGR Pro subscription (no price, PTW risks in current design)
- Premium purchase items (confusion with Pro)
- Seasonal items (requires push infrastructure)
- Random drop mechanics (remove entirely)
- The Accumulator archetype (parlay tracking required)
- Trophy Shelf slot expansion as Pro exclusive (redesign to badge-count-based)

---

*This document is audit-only. No code was modified.*  
*Required next step before Phase 3A implementation: apply RA-1 through RA-4 changes to LEDGR_PRESTIGE_SYSTEM.md.*
