use axum::{
    routing::{get, post},
    Router, Json, extract::{State, Query}, body::Bytes, http::StatusCode
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use walkdir::WalkDir;
use std::path::PathBuf;
use tower_http::cors::{CorsLayer, Any};
use tauri::State as TauriState;
use std::sync::Mutex;

#[derive(Clone)]
struct ServerState {
    vault_path: PathBuf,
}

#[derive(Serialize, Deserialize)]
pub struct FileManifestEntry {
    path: String,
    modified: u64, // Unix timestamp
}

#[derive(Deserialize)]
struct FileQuery {
    path: String,
}

// Global handle to shutdown the server
pub struct SyncServerHandle(pub Mutex<Option<tokio::sync::oneshot::Sender<()>>>);

#[tauri::command]
pub async fn start_sync_server(
    vault_path: String,
    port: u16,
    handle: TauriState<'_, SyncServerHandle>
) -> Result<String, String> {
    // Stop existing server if any
    stop_sync_server(handle.clone()).await?;

    let state = ServerState {
        vault_path: PathBuf::from(vault_path),
    };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/manifest", get(get_manifest))
        .route("/download", get(download_file))
        .route("/upload", post(upload_file))
        .layer(cors)
        .with_state(Arc::new(state));

    let addr = format!("0.0.0.0:{}", port);
    let listener = tokio::net::TcpListener::bind(&addr).await.map_err(|e| e.to_string())?;
    
    let (tx, rx) = tokio::sync::oneshot::channel();
    
    {
        let mut handle_lock = handle.0.lock().unwrap();
        *handle_lock = Some(tx);
    }

    // Spawn server in background
    tokio::spawn(async move {
        let _ = axum::serve(listener, app)
            .with_graceful_shutdown(async {
                rx.await.ok();
            })
            .await;
    });

    Ok(format!("Sync server started on port {}", port))
}

#[tauri::command]
pub async fn stop_sync_server(handle: TauriState<'_, SyncServerHandle>) -> Result<(), String> {
    let mut handle_lock = handle.0.lock().unwrap();
    if let Some(tx) = handle_lock.take() {
        let _ = tx.send(());
    }
    Ok(())
}

async fn get_manifest(State(state): State<Arc<ServerState>>) -> Result<Json<Vec<FileManifestEntry>>, (StatusCode, String)> {
    let mut entries = Vec::new();
    let walker = WalkDir::new(&state.vault_path).into_iter().filter_map(Result::ok);

    for entry in walker {
        if entry.file_type().is_file() {
            let path_str = entry.path().to_string_lossy();
            if path_str.ends_with(".md") || path_str.ends_with(".html") {
                let metadata = std::fs::metadata(entry.path()).map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
                let modified = metadata.modified()
                    .map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_secs();

                // Store relative path to make it platform-independent
                let relative_path = entry.path().strip_prefix(&state.vault_path)
                    .unwrap_or(entry.path())
                    .to_string_lossy()
                    .replace("\\", "/");

                entries.push(FileManifestEntry {
                    path: relative_path,
                    modified,
                });
            }
        }
    }
    Ok(Json(entries))
}

async fn download_file(
    State(state): State<Arc<ServerState>>,
    Query(query): Query<FileQuery>,
) -> Result<String, (StatusCode, String)> {
    let full_path = state.vault_path.join(&query.path);
    std::fs::read_to_string(full_path).map_err(|e| (StatusCode::NOT_FOUND, e.to_string()))
}

async fn upload_file(
    State(state): State<Arc<ServerState>>,
    Query(query): Query<FileQuery>,
    body: Bytes,
) -> Result<String, (StatusCode, String)> {
    let full_path = state.vault_path.join(&query.path);
    
    if let Some(parent) = full_path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    }

    std::fs::write(&full_path, body).map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    Ok("Uploaded".to_string())
}

#[tauri::command]
pub async fn get_local_manifest(vault_path: String) -> Result<Vec<FileManifestEntry>, String> {
    let mut entries = Vec::new();
    let walker = WalkDir::new(&vault_path).into_iter().filter_map(Result::ok);

    for entry in walker {
        if entry.file_type().is_file() {
            let path_str = entry.path().to_string_lossy();
            if path_str.ends_with(".md") || path_str.ends_with(".html") {
                let metadata = std::fs::metadata(entry.path()).map_err(|e| e.to_string())?;
                let modified = metadata.modified()
                    .map_err(|e| e.to_string())?
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_secs();

                let relative_path = entry.path().strip_prefix(&vault_path)
                    .unwrap_or(entry.path())
                    .to_string_lossy()
                    .replace("\\", "/");

                entries.push(FileManifestEntry {
                    path: relative_path,
                    modified,
                });
            }
        }
    }
    Ok(entries)
}

#[tauri::command]
pub async fn write_note_file_absolute(path: String, content: String) -> Result<(), String> {
    let path = PathBuf::from(path);
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    std::fs::write(path, content).map_err(|e| e.to_string())?;
    Ok(())
}
