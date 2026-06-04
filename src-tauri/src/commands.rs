use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use sha2::{Sha256, Digest};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppConfig {
    pub vault_path: String,
    pub file_format: String,
    pub db_path: String,
    pub postgres: Option<serde_json::Value>,
    pub tars: Option<serde_json::Value>,
    pub appearance: AppearanceConfig,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppearanceConfig {
    pub editor_font: String,
    pub code_font: String,
    pub editor_width: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            vault_path: String::new(),
            file_format: "md".to_string(),
            db_path: String::new(),
            postgres: None,
            tars: None,
            appearance: AppearanceConfig {
                editor_font: "lora".to_string(),
                code_font: "geist-mono".to_string(),
                editor_width: "comfortable".to_string(),
            },
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VaultEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub children: Option<Vec<VaultEntry>>,
}

fn get_config_path() -> PathBuf {
    let config_dir = dirs_next().unwrap_or_else(|| PathBuf::from("."));
    config_dir.join("config.json")
}

fn dirs_next() -> Option<PathBuf> {
    #[cfg(target_os = "windows")]
    {
        std::env::var("APPDATA")
            .ok()
            .map(|p| PathBuf::from(p).join("genten"))
    }
    #[cfg(not(target_os = "windows"))]
    {
        std::env::var("HOME")
            .ok()
            .map(|p| PathBuf::from(p).join(".config").join("genten"))
    }
}

#[tauri::command]
pub fn get_vault_path() -> Result<String, String> {
    let config = load_config_internal().map_err(|e| e.to_string())?;
    Ok(config.vault_path)
}

#[tauri::command]
pub fn set_vault_path(path: String) -> Result<(), String> {
    let mut config = load_config_internal().unwrap_or_default();
    config.vault_path = path;
    save_config_internal(&config).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_vault_folders(vault_path: String) -> Result<(), String> {
    let base = Path::new(&vault_path);
    let folders = [
        "Daily",
        "Study",
        "Problems",
        "System Design",
        "Diagrams",
        "Canvas",
        "Captures",
        "Attachments/images",
        ".genten/cache",
    ];
    for folder in &folders {
        let dir = base.join(folder);
        fs::create_dir_all(&dir).map_err(|e| format!("Failed to create {}: {}", folder, e))?;
    }
    Ok(())
}

#[tauri::command]
pub fn read_note_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read {}: {}", path, e))
}

#[tauri::command]
pub fn write_note_file(path: String, content: String) -> Result<(), String> {
    if let Some(parent) = Path::new(&path).parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(&path, content).map_err(|e| format!("Failed to write {}: {}", path, e))
}

#[tauri::command]
pub fn delete_note_file(path: String) -> Result<(), String> {
    fs::remove_file(&path).map_err(|e| format!("Failed to delete {}: {}", path, e))
}

#[tauri::command]
pub fn rename_note_file(old_path: String, new_path: String) -> Result<(), String> {
    fs::rename(&old_path, &new_path)
        .map_err(|e| format!("Failed to rename {} to {}: {}", old_path, new_path, e))
}

#[tauri::command]
pub fn save_attachment(vault_path: String, filename: String, bytes: Vec<u8>) -> Result<String, String> {
    let base = Path::new(&vault_path);
    let attachments_dir = base.join("Attachments").join("images");
    if !attachments_dir.exists() {
        fs::create_dir_all(&attachments_dir).map_err(|e| e.to_string())?;
    }
    
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();
    
    let safe_filename = filename.replace(" ", "_");
    let new_filename = format!("{}-{}", timestamp, safe_filename);
    
    let file_path = attachments_dir.join(&new_filename);
    fs::write(&file_path, bytes).map_err(|e| format!("Failed to save image: {}", e))?;
    
    Ok(format!("./Attachments/images/{}", new_filename))
}

use base64::{Engine as _, engine::general_purpose};

#[tauri::command]
pub fn read_image_base64(vault_path: String, relative_path: String) -> Result<String, String> {
    let base = Path::new(&vault_path);
    // Remove leading "./" if present
    let clean_path = relative_path.trim_start_matches("./");
    let full_path = base.join(clean_path);
    
    let bytes = fs::read(&full_path).map_err(|e| format!("Failed to read image at {:?}: {}", full_path, e))?;
    let b64 = general_purpose::STANDARD.encode(&bytes);
    Ok(b64)
}

#[tauri::command]
pub fn scan_vault(vault_path: String) -> Result<Vec<VaultEntry>, String> {
    let base = Path::new(&vault_path);
    if !base.exists() {
        return Ok(vec![]);
    }
    scan_directory(base, base).map_err(|e| e.to_string())
}

fn scan_directory(path: &Path, base: &Path) -> Result<Vec<VaultEntry>, std::io::Error> {
    let mut entries = Vec::new();
    for entry in fs::read_dir(path)? {
        let entry = entry?;
        let file_name = entry.file_name().to_string_lossy().to_string();
        // Skip hidden files/dirs except .genten
        if file_name.starts_with('.') && file_name != ".genten" {
            continue;
        }
        // Skip the SQLite database file
        if file_name == "genten.db" || file_name.ends_with("-journal") || file_name.ends_with("-wal") {
            continue;
        }
        let full_path = entry.path();
        let is_dir = full_path.is_dir();
        let children = if is_dir {
            Some(scan_directory(&full_path, base)?)
        } else {
            None
        };
        entries.push(VaultEntry {
            name: file_name,
            path: full_path.to_string_lossy().to_string(),
            is_dir,
            children,
        });
    }
    entries.sort_by(|a, b| {
        // Directories first, then alphabetical
        b.is_dir.cmp(&a.is_dir).then(a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });
    Ok(entries)
}

#[tauri::command]
pub fn get_config() -> Result<AppConfig, String> {
    load_config_internal().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_config(config: AppConfig) -> Result<(), String> {
    save_config_internal(&config).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn compute_content_hash(content: String) -> String {
    let mut hasher = Sha256::new();
    hasher.update(content.as_bytes());
    format!("{:x}", hasher.finalize())
}

#[tauri::command]
pub async fn ping_server(url: String) -> Result<bool, String> {
    // Simple connectivity check — frontend handles actual HTTP via fetch
    // This just validates the URL format
    if url.starts_with("http://") || url.starts_with("https://") {
        Ok(true)
    } else {
        Err("Invalid URL format".to_string())
    }
}

fn load_config_internal() -> Result<AppConfig, Box<dyn std::error::Error>> {
    let config_path = get_config_path();
    if config_path.exists() {
        let content = fs::read_to_string(&config_path)?;
        let config: AppConfig = serde_json::from_str(&content)?;
        Ok(config)
    } else {
        Ok(AppConfig::default())
    }
}

fn save_config_internal(config: &AppConfig) -> Result<(), Box<dyn std::error::Error>> {
    let config_path = get_config_path();
    if let Some(parent) = config_path.parent() {
        fs::create_dir_all(parent)?;
    }
    let content = serde_json::to_string_pretty(config)?;
    fs::write(&config_path, content)?;
    Ok(())
}
