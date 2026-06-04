mod commands;
mod db;
mod files;
mod vault;
mod watcher;
mod sync;
#[cfg(feature = "postgres")]
mod postgres;

mod sync_server;

use commands::*;
use std::sync::Mutex;
use sync_server::{start_sync_server, stop_sync_server, SyncServerHandle};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(SyncServerHandle(Mutex::new(None)))
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
            save_attachment,
            read_image_base64,
            scan_vault,
            get_config,
            save_config,
            compute_content_hash,
            ping_server,
            start_sync_server,
            stop_sync_server,
            sync_server::get_local_manifest,
            sync_server::write_note_file_absolute,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
