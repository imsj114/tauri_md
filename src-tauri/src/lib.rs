use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use std::time::SystemTime;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct FileEntry {
    name: String,
    path: String,
    is_directory: bool,
    updated_at: u64,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn list_files(path: &str) -> Result<Vec<FileEntry>, String> {
    let dir_path = Path::new(path);
    if !dir_path.exists() || !dir_path.is_dir() {
        return Err("Invalid directory path".to_string());
    }

    let mut entries = Vec::new();
    let read_dir = fs::read_dir(dir_path).map_err(|e| e.to_string())?;

    for entry in read_dir {
        let entry = entry.map_err(|e| e.to_string())?;
        let path_buf = entry.path();
        let metadata = entry.metadata().map_err(|e| e.to_string())?;
        
        let name = entry.file_name().to_string_lossy().to_string();
        let is_directory = metadata.is_dir();
        
        // Filter out hidden files (starting with .) except for configuration if needed, 
        // but for list_files we usually want to show user visible files.
        // Keeping it simple: show all or filter? 
        // Frontend filtered: entry.isDirectory || entry.name.endsWith('.md')
        // Let's return everything and let frontend filter, OR filter here.
        // Frontend logic: .filter((entry) => entry.isDirectory || entry.name.endsWith('.md'))
        
        if name.starts_with('.') {
            continue;
        }

        let updated_at = metadata
            .modified()
            .unwrap_or(SystemTime::now())
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;

        entries.push(FileEntry {
            name,
            path: path_buf.to_string_lossy().to_string(),
            is_directory,
            updated_at,
        });
    }

    Ok(entries)
}

#[tauri::command]
fn read_file(path: &str) -> Result<String, String> {
    fs::read_to_string(path).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_file(path: &str, content: &str) -> Result<(), String> {
    fs::write(path, content).map_err(|e| e.to_string())
}

#[tauri::command]
fn create_file(path: &str, name: &str, content: &str) -> Result<(), String> {
    let dir_path = Path::new(path);
    let file_path = dir_path.join(name);
    fs::write(file_path, content).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_file(path: &str) -> Result<(), String> {
    let path_obj = Path::new(path);
    if path_obj.is_dir() {
        fs::remove_dir_all(path).map_err(|e| e.to_string())
    } else {
        fs::remove_file(path).map_err(|e| e.to_string())
    }
}

#[tauri::command]
fn check_file_exists(path: &str) -> bool {
    Path::new(path).exists()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            list_files,
            read_file,
            save_file,
            create_file,
            delete_file,
            check_file_exists
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
