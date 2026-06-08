mod commands;
mod db;
mod files;
mod vault;
mod watcher;
mod sync;
mod sync_server;
use sync_server::*;

#[cfg(feature = "postgres")]
mod postgres;

use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(std::sync::Arc::new(SyncServerState::default()))
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            get_vault_path,
            set_vault_path,
            create_vault_folders,
            read_note_file,
            write_note_file,
            delete_note_file,
            rename_note_file,
            scan_vault,
            get_config,
            save_config,
            compute_content_hash,
            ping_server,
            start_sync_server,
            stop_sync_server,
            fetch_remote_manifest,
            fetch_remote_file,
            upload_remote_file,
            get_local_manifest,
            write_note_file_absolute,
            write_file_bytes_absolute,
            read_file_bytes_absolute,
            save_attachment,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
