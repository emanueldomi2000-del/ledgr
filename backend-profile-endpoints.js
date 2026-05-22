// ─────────────────────────────────────────────────────────────────────────────
// LEDGR — Profile Persistence Endpoints
// Add these routes to your Railway backend Express app.
//
// Run this SQL migration once before deploying:
//
// CREATE TABLE IF NOT EXISTS profiles (
//   id                  INT AUTO_INCREMENT PRIMARY KEY,
//   userId              INT NOT NULL UNIQUE,
//   username            VARCHAR(50) NOT NULL,
//   bio                 TEXT,
//   social_twitter      VARCHAR(50),
//   social_instagram    VARCHAR(50),
//   archetype           VARCHAR(30),   -- legacy, kept for compat
//   banner              VARCHAR(30),   -- banner pack id
//   border              VARCHAR(30),   -- border style id
//   theme               VARCHAR(20),   -- theme color id (purple/gold/emerald/etc)
//   fav_sports          JSON,
//   avatar_b64          LONGTEXT,
//   banner_b64          LONGTEXT,
//   odds_format         VARCHAR(20) DEFAULT 'decimal',
//   timezone            VARCHAR(50) DEFAULT 'UTC',
//   hide_from_leaderboard BOOLEAN DEFAULT FALSE,
//   updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
//   INDEX idx_username (username)
// );
//
// Migration for existing tables (run once):
// ALTER TABLE profiles
//   ADD COLUMN odds_format VARCHAR(20) DEFAULT 'decimal',
//   ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC',
//   ADD COLUMN hide_from_leaderboard BOOLEAN DEFAULT FALSE;
//
// Replace `db`, `router`, and `requireAuth` with your actual instances.
// ─────────────────────────────────────────────────────────────────────────────

const AVATAR_MAX_BYTES = 300 * 1024;  // 300 KB (post-compression avatar should be ~20–80 KB)
const BANNER_MAX_BYTES = 500 * 1024;  // 500 KB (post-compression banner should be ~40–150 KB)

// In-memory rate limiter: 10 requests per userId per 60 seconds
const _rlMap = new Map();
function _checkRateLimit(userId) {
  const now = Date.now();
  const window = 60_000;
  const limit = 10;
  const calls = (_rlMap.get(userId) || []).filter(t => now - t < window);
  if (calls.length >= limit) return false;
  calls.push(now);
  _rlMap.set(userId, calls);
  return true;
}

function _sanitizeBio(bio) {
  if (!bio) return '';
  return String(bio).replace(/<[^>]*>/g, '').trim().slice(0, 160);
}

function _sanitizeHandle(handle) {
  if (!handle) return null;
  const clean = String(handle).replace(/^@/, '').replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 50);
  return clean || null;
}

const VALID_ARCHETYPES  = new Set([
  // current archetype IDs
  'sniper','demon','grinder','sharp','hunter','storm','kingmaker','iceblood',
  'gambler','reaper','night-owl','shark','ghost','diamond-mind','hybrid','contender',
  // legacy keys kept for backward compat
  'value-hunter','lock-machine','ice-cold','profit-farmer','underdog-king','data-nerd','momentum-monster',
]);
const VALID_BANNERS     = new Set(['midnight','purple-fade','frost','carbon','dark-smoke','cosmic-nebula','diamond-storm','crimson-energy','electric-void','phantom-pulse','galaxy-motion','dragon-aura','eternal-flame','neon-rift','crown-energy','default','purple-haze','cyber-teal','gold-rush','fire-wave','ice-storm','diamond','legend-aura']);
const VALID_BORDERS     = new Set(['none','clean','blue-ring','diamond-ring','cosmic','electric','inferno','royal','dragon','celestial','bronze-frame','silver-frame','gold-frame','diamond-frame','elite-frame','pulse','gold','fire','legend']);
const VALID_THEMES      = new Set(['purple','gold','emerald','crimson','ice','ember','neon','platinum','default','cyan','red','green','orange','pink','white']);
const VALID_SPORTS      = new Set(['Soccer','Basketball','Tennis','Football','Baseball','MMA/Boxing']);
const VALID_ODDS_FORMAT = new Set(['decimal','american','fractional']);

// ─── GET /profile/:username — public, no auth ────────────────────────────────
router.get('/profile/:username', async (req, res) => {
  const { username } = req.params;
  if (!/^[a-zA-Z0-9_\-]{1,50}$/.test(username)) {
    return res.status(400).json({ error: 'Invalid username' });
  }
  try {
    const [rows] = await db.query(
      'SELECT * FROM profiles WHERE username = ? LIMIT 1',
      [username]
    );
    if (!rows.length) return res.json({});
    const p = rows[0];
    return res.json({
      archetype:            p.archetype || null,
      banner:               p.banner || 'default',
      border:               p.border || 'clean',
      theme:                p.theme || 'default',
      fav_sports:           p.fav_sports ? (typeof p.fav_sports === 'string' ? JSON.parse(p.fav_sports) : p.fav_sports) : [],
      bio:                  p.bio || '',
      social_twitter:       p.social_twitter || null,
      social_instagram:     p.social_instagram || null,
      avatar_b64:           p.avatar_b64 || null,
      banner_b64:           p.banner_b64 || null,
      odds_format:          p.odds_format || 'decimal',
      timezone:             p.timezone || 'UTC',
      hide_from_leaderboard: !!p.hide_from_leaderboard,
    });
  } catch (e) {
    console.error('GET /profile error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── POST /profile — authenticated upsert ────────────────────────────────────
router.post('/profile', requireAuth, async (req, res) => {
  const userId = req.user.id;

  if (!_checkRateLimit(userId)) {
    return res.status(429).json({ error: 'Too many requests — wait a minute' });
  }

  const { archetype, banner, border, theme, favSports, bio, social, avatarB64, bannerB64,
          oddsFormat, timezone, hideFromLeaderboard } = req.body;

  // ── Size guards (before any DB work) ──
  if (avatarB64 != null && avatarB64.length > AVATAR_MAX_BYTES) {
    return res.status(413).json({ error: 'Avatar image too large — max 300 KB' });
  }
  if (bannerB64 != null && bannerB64.length > BANNER_MAX_BYTES) {
    return res.status(413).json({ error: 'Banner image too large — max 500 KB' });
  }

  // ── Sanitize ──
  const safeArchetype  = VALID_ARCHETYPES.has(archetype) ? archetype : null;
  const safeBanner     = VALID_BANNERS.has(banner) ? banner : 'default';
  const safeBorder     = VALID_BORDERS.has(border) ? border : 'clean';
  const safeTheme      = VALID_THEMES.has(theme) ? theme : 'default';
  const safeSports     = Array.isArray(favSports) ? favSports.filter(s => VALID_SPORTS.has(s)).slice(0, 4) : [];
  const safeBio        = _sanitizeBio(bio);
  const safeTwitter    = _sanitizeHandle(social && social.twitter);
  const safeInstagram  = _sanitizeHandle(social && social.instagram);
  const safeOddsFormat = VALID_ODDS_FORMAT.has(oddsFormat) ? oddsFormat : 'decimal';
  const safeTZ         = (typeof timezone === 'string' && timezone.length > 0 && timezone.length <= 50) ? timezone : 'UTC';
  const safeHideBoard  = !!hideFromLeaderboard;

  // avatarB64/bannerB64 key presence = "user explicitly changed this field"
  const avatarChanged = 'avatarB64' in req.body;
  const bannerChanged = 'bannerB64' in req.body;
  const safeAvatar    = avatarChanged ? (avatarB64 || null) : undefined;
  const safeBannerImg = bannerChanged ? (bannerB64 || null) : undefined;

  try {
    // Ownership: get username from DB (not from client — never trust client for ownership)
    const [userRows] = await db.query(
      'SELECT username FROM users WHERE id = ? LIMIT 1',
      [userId]
    );
    if (!userRows.length) return res.status(404).json({ error: 'User not found' });
    const username = userRows[0].username;

    // Step 1: Upsert all non-image config fields
    await db.query(`
      INSERT INTO profiles
        (userId, username, bio, social_twitter, social_instagram, archetype, banner, border, theme, fav_sports,
         odds_format, timezone, hide_from_leaderboard)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        username              = VALUES(username),
        bio                   = VALUES(bio),
        social_twitter        = VALUES(social_twitter),
        social_instagram      = VALUES(social_instagram),
        archetype             = VALUES(archetype),
        banner                = VALUES(banner),
        border                = VALUES(border),
        theme                 = VALUES(theme),
        fav_sports            = VALUES(fav_sports),
        odds_format           = VALUES(odds_format),
        timezone              = VALUES(timezone),
        hide_from_leaderboard = VALUES(hide_from_leaderboard),
        updated_at            = NOW()
    `, [userId, username, safeBio, safeTwitter, safeInstagram, safeArchetype, safeBanner, safeBorder, safeTheme,
        JSON.stringify(safeSports), safeOddsFormat, safeTZ, safeHideBoard]);

    // Step 2: Update images only if explicitly sent (null = clear, b64 = update)
    if (avatarChanged) {
      await db.query('UPDATE profiles SET avatar_b64 = ?, updated_at = NOW() WHERE userId = ?', [safeAvatar, userId]);
    }
    if (bannerChanged) {
      await db.query('UPDATE profiles SET banner_b64 = ?, updated_at = NOW() WHERE userId = ?', [safeBannerImg, userId]);
    }

    res.json({ success: true });
  } catch (e) {
    console.error('POST /profile error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});
