/// SQLite database initialization and migration runner.
/// The actual SQLite connection is managed by tauri-plugin-sql on the frontend.
/// This module provides helpers for migration file reading.

/// SQL migration files embedded at compile time
pub const MIGRATION_001_INIT: &str = include_str!("../migrations/001_init.sql");
pub const MIGRATION_002_FTS: &str = include_str!("../migrations/002_fts.sql");
pub const MIGRATION_003_SPACED_REP: &str = include_str!("../migrations/003_spaced_rep.sql");

/// Get all migrations in order
pub fn get_migrations() -> Vec<(&'static str, &'static str)> {
    vec![
        ("001_init", MIGRATION_001_INIT),
        ("002_fts", MIGRATION_002_FTS),
        ("003_spaced_rep", MIGRATION_003_SPACED_REP),
    ]
}

/// Check if the database file exists at the given vault path
pub fn db_exists(vault_path: &str) -> bool {
    std::path::Path::new(vault_path).join("genten.db").exists()
}
