-- Genten SQLite Schema: Core tables
-- migrations/001_init.sql

CREATE TABLE IF NOT EXISTS notes (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,
  file_path       TEXT NOT NULL UNIQUE,
  file_format     TEXT NOT NULL CHECK (file_format IN ('md','html')),
  note_type       TEXT NOT NULL CHECK (note_type IN (
                    'study','problem','system_design',
                    'diagram','canvas','capture','daily'
                  )),
  metadata        TEXT DEFAULT '{}',
  content_hash    TEXT,
  word_count      INTEGER DEFAULT 0,
  needs_embedding INTEGER DEFAULT 0,
  created_at      TEXT NOT NULL,
  updated_at      TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS links (
  id          TEXT PRIMARY KEY,
  source_id   TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  target_id   TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  link_type   TEXT NOT NULL CHECK (link_type IN ('explicit','semantic')),
  strength    REAL DEFAULT 1.0,
  created_at  TEXT NOT NULL,
  UNIQUE(source_id, target_id, link_type)
);

CREATE TABLE IF NOT EXISTS sync_queue (
  id          TEXT PRIMARY KEY,
  operation   TEXT NOT NULL CHECK (operation IN ('insert','update','delete')),
  table_name  TEXT NOT NULL,
  record_id   TEXT NOT NULL,
  payload     TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  synced_at   TEXT
);

CREATE TABLE IF NOT EXISTS clusters (
  id          TEXT PRIMARY KEY,
  name        TEXT,
  note_ids    TEXT DEFAULT '[]',
  created_at  TEXT NOT NULL
);
