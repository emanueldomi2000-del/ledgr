-- ─────────────────────────────────────────────────────────────────────────────
-- LEDGR — Live Events Schema
-- Run after backend-rankings-schema.sql.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── live_events ───────────────────────────────────────────────────────────────
-- Persists every broadcast event for cold-load and catch-up on reconnect.
-- Purge rows older than 7 days with a nightly cron:
--   DELETE FROM live_events WHERE createdAt < NOW() - INTERVAL 7 DAY;
CREATE TABLE IF NOT EXISTS live_events (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  type         VARCHAR(30)  NOT NULL,
  rarity       TINYINT      NOT NULL DEFAULT 1,   -- 1=ambient 2=subtle 3=medium 4=prestige 5=moment
  username     VARCHAR(50)  DEFAULT NULL,          -- tipster the event is about
  targetUserId INT          DEFAULT NULL,           -- NULL = broadcast, INT = unicast to this userId
  payload      JSON         NOT NULL,
  createdAt    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_broadcast    (targetUserId, createdAt DESC),
  INDEX idx_type_created (type, createdAt DESC),
  INDEX idx_created      (createdAt DESC)
);

-- ── user_notifications ────────────────────────────────────────────────────────
-- Personal notification history for /notifications page.
-- Separate from live_events because notifications survive > 7 days.
CREATE TABLE IF NOT EXISTS user_notifications (
  id        BIGINT AUTO_INCREMENT PRIMARY KEY,
  userId    INT          NOT NULL,
  type      VARCHAR(30)  NOT NULL,
  rarity    TINYINT      NOT NULL DEFAULT 1,
  payload   JSON         NOT NULL,
  readAt    DATETIME     DEFAULT NULL,
  createdAt TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_user_created (userId, createdAt DESC),
  INDEX idx_user_unread  (userId, readAt)
);

-- ── Rate-limit helper view (optional) ─────────────────────────────────────────
-- SELECT username, type, COUNT(*) AS cnt
-- FROM live_events
-- WHERE createdAt > NOW() - INTERVAL 5 MINUTE
-- GROUP BY username, type
-- HAVING cnt > 1;
