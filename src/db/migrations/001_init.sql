-- Genten SQLite Schema: Core tables (frontend copy)
-- This file is for reference; actual execution happens via sqlite.ts

CREATE TABLE IF NOT EXISTS notes (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  file_path       TEXT NOT NULL UNIQUE,
  file_format     TEXT NOT NULL CHECK (file_format IN ('md','html')),
  note_type       TEXT NOT NULL,
  metadata        TEXT DEFAULT '{}',
  content_hash    TEXT,
  word_count      INTEGER DEFAULT 0,
  needs_embedding INTEGER DEFAULT 0,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);
