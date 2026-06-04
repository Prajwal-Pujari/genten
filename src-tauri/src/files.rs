/// File system operations for reading and writing note files.
/// Core operations are exposed via commands.rs; this module
/// provides additional utilities for file manipulation.

use std::path::Path;

/// Supported file extensions for notes
pub const NOTE_EXTENSIONS: &[&str] = &["md", "html"];

/// Check if a file is a supported note format
pub fn is_note_file(path: &Path) -> bool {
    path.extension()
        .and_then(|ext| ext.to_str())
        .map(|ext| NOTE_EXTENSIONS.contains(&ext))
        .unwrap_or(false)
}

/// Get the note type folder name from a note type string
pub fn type_to_folder(note_type: &str) -> &str {
    match note_type {
        "study" => "Study",
        "problem" => "Problems",
        "system_design" => "System Design",
        "diagram" => "Diagrams",
        "canvas" => "Canvas",
        "capture" => "Captures",
        "daily" => "Daily",
        _ => "Captures",
    }
}
