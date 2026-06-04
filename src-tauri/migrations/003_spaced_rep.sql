-- Genten SQLite Schema: Spaced repetition
-- migrations/003_spaced_rep.sql

CREATE TABLE IF NOT EXISTS spaced_rep (
  note_id         TEXT PRIMARY KEY REFERENCES notes(id) ON DELETE CASCADE,
  last_reviewed   TEXT NOT NULL,
  next_review     TEXT NOT NULL,
  interval_days   INTEGER DEFAULT 1,
  review_count    INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_spaced_rep_next ON spaced_rep(next_review);
