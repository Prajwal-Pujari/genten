use axum::{
    extract::{Query, State},
    response::IntoResponse,
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use tokio::sync::Mutex;
use std::fs;
use std::path::PathBuf;
use tauri::State as TauriState;
use tokio::sync::oneshot;

#[derive(Default)]
pub struct SyncServerState {
    pub tx: Mutex<Option<oneshot::Sender<()>>>,
}

#[derive(Clone)]
struct AppState {
    vault_path: PathBuf,
    app_handle: tauri::AppHandle,
}

#[derive(serde::Deserialize)]
struct FileQuery {
    path: String,
}

#[derive(serde::Serialize)]
struct ManifestEntry {
    path: String,
    modified: u64,
}

async fn get_manifest(State(state): State<AppState>) -> impl IntoResponse {
    let mut entries = Vec::new();
    let base_path = &state.vault_path;
    
    if let Ok(walker) = walkdir::WalkDir::new(base_path).into_iter().collect::<Result<Vec<_>, _>>() {
        for entry in walker {
            let path = entry.path();
            if path.is_file() {
                let file_name = path.file_name().unwrap_or_default().to_string_lossy();
                if file_name == "genten.db" || file_name.ends_with("-journal") || file_name.ends_with("-wal") || file_name.starts_with(".") {
                    continue;
                }
                
                if let Ok(metadata) = entry.metadata() {
                    if let Ok(modified) = metadata.modified() {
                        let rel_path = path.strip_prefix(base_path).unwrap_or(path).to_string_lossy().replace("\\", "/");
                        let secs = modified.duration_since(std::time::UNIX_EPOCH).unwrap().as_secs();
                        entries.push(ManifestEntry {
                            path: rel_path.to_string(),
                            modified: secs,
                        });
                    }
                }
            }
        }
    }
    
    axum::Json(entries)
}

async fn download_file(
    State(state): State<AppState>,
    Query(query): Query<FileQuery>,
) -> impl IntoResponse {
    let full_path = state.vault_path.join(&query.path);
    if let Ok(bytes) = fs::read(full_path) {
        bytes
    } else {
        vec![]
    }
}

async fn upload_file(
    State(state): State<AppState>,
    Query(query): Query<FileQuery>,
    body: axum::body::Bytes,
) -> impl IntoResponse {
    let full_path = state.vault_path.join(&query.path);
    if let Some(parent) = full_path.parent() {
        let _ = fs::create_dir_all(parent);
    }
    let _ = fs::write(full_path, body);
    "OK"
}

async fn sync_complete(State(state): State<AppState>) -> impl IntoResponse {
    use tauri::Emitter;
    let _ = state.app_handle.emit("sync:finished", ());
    "OK"
}

#[tauri::command]
pub async fn start_sync_server(
    vault_path: String,
    port: u16,
    server_state: TauriState<'_, Arc<SyncServerState>>,
    app_handle: tauri::AppHandle,
) -> Result<(), String> {
    let mut tx_lock = server_state.tx.lock().await;
    
    if tx_lock.is_some() {
        return Ok(()); // Already running
    }

    let (tx, rx) = oneshot::channel::<()>();
    *tx_lock = Some(tx);
    
    let app_state = AppState {
        vault_path: PathBuf::from(vault_path),
        app_handle,
    };

    let app = Router::new()
        .route("/manifest", get(get_manifest))
        .route("/download", get(download_file))
        .route("/upload", post(upload_file))
        .route("/sync_complete", get(sync_complete))
        .layer(axum::extract::DefaultBodyLimit::disable())
        .with_state(app_state);

    let addr = std::net::SocketAddr::from(([0, 0, 0, 0], port));
    
    tauri::async_runtime::spawn(async move {
        if let Ok(listener) = tokio::net::TcpListener::bind(addr).await {
            let _ = axum::serve(listener, app)
                .with_graceful_shutdown(async {
                    rx.await.ok();
                })
                .await;
        }
    });

    Ok(())
}

#[tauri::command]
pub async fn stop_sync_server(
    server_state: TauriState<'_, Arc<SyncServerState>>,
) -> Result<(), String> {
    let mut tx_lock = server_state.tx.lock().await;
    if let Some(tx) = tx_lock.take() {
        let _ = tx.send(());
    }
    Ok(())
}

#[tauri::command]
pub async fn fetch_remote_manifest(url: String) -> Result<Vec<serde_json::Value>, String> {
    let client = reqwest::Client::builder().timeout(std::time::Duration::from_secs(5)).build().unwrap();
    let res = client.get(&url).send().await.map_err(|e| e.to_string())?;
    res.json::<Vec<serde_json::Value>>().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn fetch_remote_file(url: String) -> Result<Vec<u8>, String> {
    let client = reqwest::Client::builder().timeout(std::time::Duration::from_secs(30)).build().unwrap();
    let res = client.get(&url).send().await.map_err(|e| e.to_string())?;
    Ok(res.bytes().await.map_err(|e| e.to_string())?.to_vec())
}

#[tauri::command]
pub async fn upload_remote_file(url: String, bytes: Vec<u8>) -> Result<(), String> {
    let client = reqwest::Client::builder().timeout(std::time::Duration::from_secs(30)).build().unwrap();
    client.post(&url).body(bytes).send().await.map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_local_manifest(vault_path: String) -> Result<Vec<serde_json::Value>, String> {
    let mut entries = Vec::new();
    let base_path = PathBuf::from(&vault_path);
    
    if let Ok(walker) = walkdir::WalkDir::new(&base_path).into_iter().collect::<Result<Vec<_>, _>>() {
        for entry in walker {
            let path = entry.path();
            if path.is_file() {
                let file_name = path.file_name().unwrap_or_default().to_string_lossy();
                if file_name == "genten.db" || file_name.ends_with("-journal") || file_name.ends_with("-wal") || file_name.starts_with(".") {
                    continue;
                }
                
                if let Ok(metadata) = entry.metadata() {
                    if let Ok(modified) = metadata.modified() {
                        let rel_path = path.strip_prefix(&base_path).unwrap_or(path).to_string_lossy().replace("\\", "/");
                        let secs = modified.duration_since(std::time::UNIX_EPOCH).unwrap().as_secs();
                        entries.push(serde_json::json!({
                            "path": rel_path,
                            "modified": secs
                        }));
                    }
                }
            }
        }
    }
    
    Ok(entries)
}

#[tauri::command]
pub fn write_note_file_absolute(path: String, content: String) -> Result<(), String> {
    if let Some(parent) = PathBuf::from(&path).parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create dir {:?}: {}", parent, e))?;
    }
    fs::write(&path, content).map_err(|e| format!("Failed to write to {}: {}", path, e))
}

#[tauri::command]
pub fn write_file_bytes_absolute(path: String, bytes: Vec<u8>) -> Result<(), String> {
    if let Some(parent) = PathBuf::from(&path).parent() {
        fs::create_dir_all(parent).map_err(|e| format!("Failed to create dir {:?}: {}", parent, e))?;
    }
    fs::write(&path, bytes).map_err(|e| format!("Failed to write to {}: {}", path, e))
}

#[tauri::command]
pub fn read_file_bytes_absolute(path: String) -> Result<Vec<u8>, String> {
    fs::read(&path).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn download_remote_file_to_disk(url: String, absolute_path: String) -> Result<(), String> {
    let client = reqwest::Client::builder().timeout(std::time::Duration::from_secs(30)).build().unwrap();
    let res = client.get(&url).send().await.map_err(|e| e.to_string())?.error_for_status().map_err(|e| e.to_string())?;
    let bytes = res.bytes().await.map_err(|e| e.to_string())?;
    if let Some(parent) = PathBuf::from(&absolute_path).parent() {
        let _ = fs::create_dir_all(parent);
    }
    fs::write(&absolute_path, bytes).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn upload_local_file_to_remote(absolute_path: String, url: String) -> Result<(), String> {
    let bytes = fs::read(&absolute_path).map_err(|e| e.to_string())?;
    let client = reqwest::Client::builder().timeout(std::time::Duration::from_secs(30)).build().unwrap();
    client.post(&url).body(bytes).send().await.map_err(|e| e.to_string())?.error_for_status().map_err(|e| e.to_string())?;
    Ok(())
}
