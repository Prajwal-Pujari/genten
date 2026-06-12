// ═══════════════════════════════════════════════════════════════
// Genten — Vault File Operations
// ═══════════════════════════════════════════════════════════════

import { invoke } from '../lib/apiAdapter'

export interface VaultEntry {
  name: string
  path: string
  is_dir: boolean
  children: VaultEntry[] | null
}

/**
 * Scan the vault directory and return its tree structure.
 */
export async function scanVault(vaultPath: string): Promise<VaultEntry[]> {
  return invoke<VaultEntry[]>('scan_vault', { vaultPath })
}

/**
 * Create all vault folders.
 */
export async function createVaultFolders(vaultPath: string): Promise<void> {
  await invoke('create_vault_folders', { vaultPath })
}

/**
 * Read a note file from disk.
 */
export async function readNoteFile(path: string): Promise<string> {
  return invoke<string>('read_note_file', { path })
}

/**
 * Write content to a note file.
 */
export async function writeNoteFile(path: string, content: string): Promise<void> {
  await invoke('write_note_file', { path, content })
}
