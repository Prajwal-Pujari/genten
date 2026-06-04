/// PostgreSQL integration with pgvector support.
/// This entire module is feature-gated behind the "postgres" feature flag.
/// It remains dormant until the user configures a PostgreSQL connection
/// in Settings.

#[cfg(feature = "postgres")]
pub mod pg {
    // Future implementation:
    // - Connection pool management
    // - Vector similarity search
    // - Note sync from SQLite → PostgreSQL
    // - Cluster management
}
