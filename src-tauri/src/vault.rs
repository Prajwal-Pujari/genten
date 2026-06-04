/// Vault scanning and index rebuild operations.
/// The heavy lifting is done via the scan_vault command in commands.rs.
/// This module provides additional vault-level utilities.

use std::path::Path;

/// Vault folder names that Genten creates
pub const VAULT_FOLDERS: &[&str] = &[
    "Daily",
    "Study",
    "Problems",
    "System Design",
    "Diagrams",
    "Canvas",
    "Captures",
    "Attachments/images",
];

/// Check if a path looks like a valid Genten vault
pub fn is_valid_vault(path: &str) -> bool {
    let base = Path::new(path);
    base.exists() && base.is_dir()
}
