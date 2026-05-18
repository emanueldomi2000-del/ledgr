-- ─────────────────────────────────────────────────────────────────────────────
-- LEDGR — autoVerify schema migration
-- Run once before deploying autoVerify.js.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── MySQL (Railway / PlanetScale) ─────────────────────────────────────────────

ALTER TABLE picks
  MODIFY COLUMN result ENUM('win','loss','push','void','pending') DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS settledAt  DATETIME     DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS gradedBy   VARCHAR(30)  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS gradedNote TEXT         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sportKey   VARCHAR(50)  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS homeTeam   VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS awayTeam   VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS fixtureId  VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS stakeType  VARCHAR(20)  DEFAULT 'units',
  ADD COLUMN IF NOT EXISTS confidence VARCHAR(10)  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS reasoning  TEXT         DEFAULT NULL;

-- Add index on result for fast pending pick lookup
CREATE INDEX IF NOT EXISTS idx_picks_result ON picks (result);
CREATE INDEX IF NOT EXISTS idx_picks_userId_result ON picks (userId, result);

-- ── PostgreSQL (Supabase) ─────────────────────────────────────────────────────
-- Run this block instead if your DB is PostgreSQL:

/*
ALTER TABLE picks
  ALTER COLUMN result TYPE VARCHAR(10),
  ADD COLUMN IF NOT EXISTS "settledAt"   TIMESTAMPTZ  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS "gradedBy"    VARCHAR(30)  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS "gradedNote"  TEXT         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS "sportKey"    VARCHAR(50)  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS "homeTeam"    VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS "awayTeam"    VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS "fixtureId"   VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS "stakeType"   VARCHAR(20)  DEFAULT 'units',
  ADD COLUMN IF NOT EXISTS "confidence"  VARCHAR(10)  DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS "reasoning"   TEXT         DEFAULT NULL;

ALTER TABLE picks
  DROP CONSTRAINT IF EXISTS picks_result_check;

ALTER TABLE picks
  ADD CONSTRAINT picks_result_check
  CHECK (result IN ('win','loss','push','void','pending'));

CREATE INDEX IF NOT EXISTS idx_picks_result ON picks (result);
CREATE INDEX IF NOT EXISTS idx_picks_userid_result ON picks ("userId", result);
*/

-- ── Backfill homeTeam/awayTeam/fixtureId from event string ───────────────────
-- If your existing picks stored homeTeam/awayTeam in the JSON body but not as
-- columns, update them now. Skip if the columns are already populated.
--
-- UPDATE picks
-- SET homeTeam = SUBSTRING_INDEX(event, ' vs ', 1),
--     awayTeam = SUBSTRING_INDEX(event, ' vs ', -1)
-- WHERE homeTeam IS NULL AND event LIKE '% vs %';
