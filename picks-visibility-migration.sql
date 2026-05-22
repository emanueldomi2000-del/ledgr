-- picks-visibility-migration.sql
-- Applied to Railway DB: 2026-05-22
-- Adds visibility column to the picks table for the PUBLIC/PREMIUM feature.
--
-- This file is for repo documentation only — the migration has already been
-- executed against the production database on Railway.
-- Do NOT re-run this file against a DB that already has the column.

ALTER TABLE picks
  ADD COLUMN visibility ENUM('PUBLIC','PREMIUM') NOT NULL DEFAULT 'PUBLIC';
