-- ─────────────────────────────────────────────────────────────────────────────
-- LEDGR — Rankings Persistence Schema
-- Run this migration once on your Railway MySQL database.
-- Safe to re-run (all statements use IF NOT EXISTS / IF EXISTS guards).
-- ─────────────────────────────────────────────────────────────────────────────

-- ── user_rankings ─────────────────────────────────────────────────────────────
-- One row per tipster. Pre-computed aggregate stats, updated on every pick grade.
-- This is the authoritative source for ELO, division, sharp score, streaks, etc.
CREATE TABLE IF NOT EXISTS user_rankings (
  userId            INT NOT NULL PRIMARY KEY,
  username          VARCHAR(50) NOT NULL,

  -- Volume
  totalPicks        INT NOT NULL DEFAULT 0,
  wins              INT NOT NULL DEFAULT 0,
  losses            INT NOT NULL DEFAULT 0,
  pushes            INT NOT NULL DEFAULT 0,   -- void/push picks (excluded from WR)

  -- Financial
  totalStake        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  totalPnl          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  roi               DECIMAL(8,4) NOT NULL DEFAULT 0.0000,   -- percentage, e.g. 12.34

  -- Rate
  winRate           DECIMAL(6,4) NOT NULL DEFAULT 0.0000,   -- 0–1 fraction, e.g. 0.6250

  -- ELO (canonical: start=1000, K=32, floor=100)
  elo               INT NOT NULL DEFAULT 1000,

  -- Division score (0–100) and label
  divisionScore     DECIMAL(6,2) NOT NULL DEFAULT 0.00,
  division          ENUM('BRONZE','SILVER','GOLD','PLATINUM','DIAMOND','ELITE','LEGENDARY')
                    NOT NULL DEFAULT 'BRONZE',

  -- Sharp Score (0–100)
  sharpScore        DECIMAL(6,2) NOT NULL DEFAULT 0.00,

  -- Reliability Score (0–100)
  reliabilityScore  DECIMAL(6,2) NOT NULL DEFAULT 0.00,

  -- CLV (Closing Line Value) average over last 30 picks, NULL if insufficient data
  clvAvg            DECIMAL(8,4) DEFAULT NULL,

  -- Streaks
  currentStreak     INT NOT NULL DEFAULT 0,    -- positive = win streak, negative = loss streak
  streakType        ENUM('win','loss','none') NOT NULL DEFAULT 'none',
  bestStreak        INT NOT NULL DEFAULT 0,    -- all-time best win streak

  -- Archetype (computed from stats, matches archetypes.js keys)
  archetype         VARCHAR(30) DEFAULT NULL,

  -- Flow state (matches flow.js ids)
  flowState         VARCHAR(30) DEFAULT NULL,

  -- Activity
  isLive            TINYINT(1) NOT NULL DEFAULT 0,   -- pick posted within last 2 hours
  lastPickAt        DATETIME DEFAULT NULL,

  -- Average odds (for archetype detection)
  avgOdds           DECIMAL(8,4) DEFAULT NULL,

  -- CLV data: sum of (impliedProb - closingImplied) over all picks with CLV data
  clvSum            DECIMAL(12,4) NOT NULL DEFAULT 0.0000,
  clvCount          INT NOT NULL DEFAULT 0,

  -- Timestamps
  createdAt         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt         TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_division    (division),
  INDEX idx_elo         (elo DESC),
  INDEX idx_roi         (roi DESC),
  INDEX idx_username    (username),
  INDEX idx_updatedAt   (updatedAt DESC)
);

-- ── ranking_history ────────────────────────────────────────────────────────────
-- Weekly snapshots. One row per (userId, isoWeek).
-- Written by the scheduled weekly job (Sunday 23:59 UTC).
-- Used for division progression charts and prestige records.
CREATE TABLE IF NOT EXISTS ranking_history (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  userId        INT NOT NULL,
  username      VARCHAR(50) NOT NULL,
  isoWeek       CHAR(8) NOT NULL,     -- 'YYYY-Www', e.g. '2025-W20'
  elo           INT NOT NULL,
  division      VARCHAR(20) NOT NULL,
  divisionScore DECIMAL(6,2) NOT NULL,
  sharpScore    DECIMAL(6,2) NOT NULL,
  roi           DECIMAL(8,4) NOT NULL,
  winRate       DECIMAL(6,4) NOT NULL,
  totalPicks    INT NOT NULL,
  rank          INT DEFAULT NULL,     -- their rank position at snapshot time
  snapshotAt    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uq_user_week (userId, isoWeek),
  INDEX idx_userId  (userId),
  INDEX idx_isoWeek (isoWeek)
);

-- ── recent_picks_cache ─────────────────────────────────────────────────────────
-- Stores the 3 most recent graded picks per tipster for the /rankings payload.
-- Avoids a full picks table scan for every leaderboard load.
-- Upserted on every pick grade.
CREATE TABLE IF NOT EXISTS recent_picks_cache (
  userId      INT NOT NULL,
  slot        TINYINT NOT NULL,    -- 0, 1, 2  (0 = most recent)
  result      ENUM('win','loss','push','pending') NOT NULL DEFAULT 'pending',
  sport       VARCHAR(30) DEFAULT NULL,
  market      VARCHAR(50) DEFAULT NULL,
  odds        DECIMAL(8,4) DEFAULT NULL,
  createdAt   DATETIME DEFAULT NULL,

  PRIMARY KEY (userId, slot),
  INDEX idx_userId (userId)
);
