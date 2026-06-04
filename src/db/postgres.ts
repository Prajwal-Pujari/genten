// ═══════════════════════════════════════════════════════════════
// Genten — PostgreSQL Query Layer (optional, feature-flagged)
// ═══════════════════════════════════════════════════════════════

// This module is dormant until the user configures a PostgreSQL
// connection string in Settings. All functions are no-ops when
// postgres is not configured.

export function isPostgresConfigured(): boolean {
  return false // Will check settingsStore in Phase 5
}

export async function syncNoteToPostgres(_noteId: string): Promise<void> {
  // No-op until configured
}

export async function searchSimilar(_embedding: number[], _limit: number): Promise<string[]> {
  // No-op until configured
  return []
}
