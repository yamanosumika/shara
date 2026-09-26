use serde::Serialize;
use serde_json::Value;
use sha2::{Digest, Sha256};
use std::{
    collections::HashMap,
    fs,
    io::Write,
    path::{Path, PathBuf},
    sync::Mutex,
};
use tauri::State;
use uuid::Uuid;

const MAX_FILE_BYTES: u64 = 5 * 1024 * 1024;

#[derive(Default)]
struct OpenFiles(Mutex<HashMap<String, PathBuf>>);

#[derive(Serialize)]
struct FilePayload {
    content: String,
    file_name: String,
    handle: String,
    stamp: String,
}

#[derive(Serialize)]
struct SavePayload {
    file_name: String,
    handle: String,
    stamp: String,
    warning: Option<String>,
}

fn failed(message: impl std::fmt::Display) -> String {
    format!("[failed] {message}")
}

fn conflict(message: impl std::fmt::Display) -> String {
    format!("[conflict] {message}")
}

fn unknown(message: impl std::fmt::Display) -> String {
    format!("[unknown] {message}")
}

fn stamp(bytes: &[u8]) -> String {
    format!("{:x}", Sha256::digest(bytes))
}

fn file_name(path: &Path) -> Result<String, String> {
    path.file_name()
        .and_then(|name| name.to_str())
        .map(str::to_owned)
        .ok_or_else(|| "ファイル名を読み取れません".to_string())
}

fn read_limited(path: &Path) -> Result<Vec<u8>, String> {
    let metadata =
        fs::metadata(path).map_err(|error| format!("ファイル情報を取得できません: {error}"))?;
    if metadata.len() > MAX_FILE_BYTES {
        return Err(format!(
            "ファイルサイズが上限{MAX_FILE_BYTES}バイトを超えています"
        ));
    }
    fs::read(path).map_err(|error| format!("ファイルを読み取れません: {error}"))
}

fn validate_document(content: &str) -> Result<(), String> {
    let value: Value =
        serde_json::from_str(content).map_err(|error| format!("JSONを解析できません: {error}"))?;
    let root = value
        .as_object()
        .ok_or_else(|| "文書のルートはobjectである必要があります".to_string())?;
    let expected = [
        "format",
        "schemaVersion",
        "id",
        "semantic",
        "presentation",
        "metadata",
    ];
    if root.keys().any(|key| !expected.contains(&key.as_str())) {
        return Err("未知のトップレベル項目があります".to_string());
    }
    if root.get("format").and_then(Value::as_str) != Some("shara") {
        return Err("formatがsharaではありません".to_string());
    }
    let version = root.get("schemaVersion").and_then(Value::as_u64);
    if version != Some(1) && version != Some(2) {
        return Err("未知のschemaVersionです".to_string());
    }
    let semantic = root
        .get("semantic")
        .and_then(Value::as_object)
        .ok_or_else(|| "semanticがありません".to_string())?;
    let nodes = semantic
        .get("nodes")
        .and_then(Value::as_array)
        .ok_or_else(|| "nodesがありません".to_string())?;
    let edges = semantic
        .get("edges")
        .and_then(Value::as_array)
        .ok_or_else(|| "edgesがありません".to_string())?;
    let groups = semantic
        .get("groups")
        .and_then(Value::as_array)
        .ok_or_else(|| "groupsがありません".to_string())?;
    if nodes.len() > 500 || edges.len() > 1500 || groups.len() > 100 {
        return Err("文書要素数が上限を超えています".to_string());
    }
    let mut all_ids = std::collections::HashSet::new();
    let document_id = root
        .get("id")
        .and_then(Value::as_str)
        .ok_or_else(|| "文書IDがありません".to_string())?;
    all_ids.insert(document_id);
    let node_ids: std::collections::HashSet<&str> = nodes
        .iter()
        .map(|node| {
            node.get("id")
                .and_then(Value::as_str)
                .ok_or_else(|| "ノードIDがありません".to_string())
        })
        .collect::<Result<_, _>>()?;
    let group_ids: std::collections::HashSet<&str> = groups
        .iter()
        .map(|group| {
            group
                .get("id")
                .and_then(Value::as_str)
                .ok_or_else(|| "グループIDがありません".to_string())
        })
        .collect::<Result<_, _>>()?;
    for id in node_ids.iter().chain(group_ids.iter()) {
        if !all_ids.insert(*id) {
            return Err(format!("IDが重複しています: {id}"));
        }
    }
    let mut edge_ids = std::collections::HashSet::new();
    for edge in edges {
        let id = edge
            .get("id")
            .and_then(Value::as_str)
            .ok_or_else(|| "エッジIDがありません".to_string())?;
        if !all_ids.insert(id) {
            return Err(format!("IDが重複しています: {id}"));
        }
        edge_ids.insert(id);
        let source = edge
            .get("source")
            .and_then(Value::as_str)
            .ok_or_else(|| "sourceがありません".to_string())?;
        let target = edge
            .get("target")
            .and_then(Value::as_str)
            .ok_or_else(|| "targetがありません".to_string())?;
        if !node_ids.contains(source) || !node_ids.contains(target) {
            return Err(format!("接続端点が存在しません: {id}"));
        }
    }
    if version == Some(2) {
        let presentation = root
            .get("presentation")
            .and_then(Value::as_object)
            .ok_or_else(|| "presentationがありません".to_string())?;
        let endpoints = presentation
            .get("edgeEndpoints")
            .and_then(Value::as_object)
            .ok_or_else(|| "edgeEndpointsがありません".to_string())?;
        if endpoints.len() != edge_ids.len()
            || endpoints
                .keys()
                .any(|edge_id| !edge_ids.contains(edge_id.as_str()))
        {
            return Err("接続面は全edgeと一対一である必要があります".to_string());
        }
        let valid_sides = ["top", "right", "bottom", "left"];
        for endpoint in endpoints.values() {
            let endpoint = endpoint
                .as_object()
                .ok_or_else(|| "接続面の形式が不正です".to_string())?;
            let source = endpoint.get("sourceSide").and_then(Value::as_str);
            let target = endpoint.get("targetSide").and_then(Value::as_str);
            if !source.is_some_and(|side| valid_sides.contains(&side))
                || !target.is_some_and(|side| valid_sides.contains(&side))
            {
                return Err("接続面の値が不正です".to_string());
            }
        }
    }
    for node in nodes {
        if let Some(group_id) = node.get("groupId").and_then(Value::as_str) {
            if !group_ids.contains(group_id) {
                return Err(format!("所属グループが存在しません: {group_id}"));
            }
        }
    }
    Ok(())
}

fn register_path(state: &State<'_, OpenFiles>, path: PathBuf) -> Result<String, String> {
    let handle = Uuid::new_v4().to_string();
    state
        .0
        .lock()
        .map_err(|_| "ファイル管理状態を取得できません".to_string())?
        .insert(handle.clone(), path);
    Ok(handle)
}

#[tauri::command]
fn open_document_dialog(state: State<'_, OpenFiles>) -> Result<Option<FilePayload>, String> {
    let Some(path) = rfd::FileDialog::new()
        .add_filter("SHARA文書", &["shara.json", "json"])
        .pick_file()
    else {
        return Ok(None);
    };
    let bytes = read_limited(&path)?;
    let content =
        String::from_utf8(bytes.clone()).map_err(|_| "UTF-8の文書ではありません".to_string())?;
    validate_document(&content)?;
    let handle = register_path(&state, path.clone())?;
    Ok(Some(FilePayload {
        content,
        file_name: file_name(&path)?,
        handle,
        stamp: stamp(&bytes),
    }))
}

fn atomic_safe_write(path: &Path, content: &[u8]) -> Result<Option<String>, String> {
    let parent = path
        .parent()
        .ok_or_else(|| "保存先ディレクトリがありません".to_string())?;
    let token = Uuid::new_v4();
    let temp = parent.join(format!(".shara-{token}.tmp"));
    let backup = parent.join(format!(".shara-{token}.backup"));
    {
        let mut file = fs::OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(&temp)
            .map_err(|error| failed(format!("一時ファイルを作成できません: {error}")))?;
        file.write_all(content)
            .and_then(|_| file.sync_all())
            .map_err(|error| {
                let _ = fs::remove_file(&temp);
                failed(format!("一時ファイルを書き込めません: {error}"))
            })?;
    }
    if path.exists() {
        fs::rename(path, &backup).map_err(|error| {
            let _ = fs::remove_file(&temp);
            failed(format!("原本を退避できません: {error}"))
        })?;
        if let Err(error) = fs::rename(&temp, path) {
            let restored = fs::rename(&backup, path);
            let _ = fs::remove_file(&temp);
            return match restored {
                Ok(()) => Err(failed(format!("保存先を置換できません。原本は復元しました: {error}"))),
                Err(restore_error) => Err(unknown(format!("保存先を置換できず、原本の自動復元も確認できません。退避先: {} / 置換: {error} / 復元: {restore_error}", backup.display()))),
            };
        }
        if let Err(error) = fs::remove_file(&backup) {
            return Ok(Some(format!(
                "保存は完了しましたが退避ファイルを削除できません: {} ({error})",
                backup.display()
            )));
        }
    } else if let Err(error) = fs::rename(&temp, path) {
        let _ = fs::remove_file(&temp);
        return Err(failed(format!("保存先へ移動できません: {error}")));
    }
    Ok(None)
}

fn save_registered(
    state: &State<'_, OpenFiles>,
    handle: &str,
    content: &str,
    expected_stamp: Option<&str>,
) -> Result<SavePayload, String> {
    if content.as_bytes().len() as u64 > MAX_FILE_BYTES {
        return Err(failed(format!(
            "ファイルサイズが上限{MAX_FILE_BYTES}バイトを超えています"
        )));
    }
    validate_document(content).map_err(failed)?;
    let path = state
        .0
        .lock()
        .map_err(|_| failed("ファイル管理状態を取得できません"))?
        .get(handle)
        .cloned()
        .ok_or_else(|| failed("保存先の選択情報が無効です。名前を付けて保存してください"))?;
    if path.exists() {
        let current = read_limited(&path).map_err(failed)?;
        if let Some(expected) = expected_stamp {
            if stamp(&current) != expected {
                return Err(conflict(
                    "保存後にファイルが外部変更されています。再読込または別名保存を選んでください",
                ));
            }
        }
    }
    let warning = atomic_safe_write(&path, content.as_bytes())?;
    Ok(SavePayload {
        file_name: file_name(&path).map_err(failed)?,
        handle: handle.to_string(),
        stamp: stamp(content.as_bytes()),
        warning,
    })
}

#[tauri::command]
fn save_document(
    state: State<'_, OpenFiles>,
    handle: String,
    content: String,
    expected_stamp: Option<String>,
) -> Result<SavePayload, String> {
    save_registered(&state, &handle, &content, expected_stamp.as_deref())
}

#[tauri::command]
fn save_document_as_dialog(
    state: State<'_, OpenFiles>,
    content: String,
) -> Result<Option<SavePayload>, String> {
    let Some(mut path) = rfd::FileDialog::new()
        .add_filter("SHARA文書", &["shara.json"])
        .set_file_name("名称未設定.shara.json")
        .save_file()
    else {
        return Ok(None);
    };
    let value = path.to_string_lossy().to_string();
    if !value.ends_with(".shara.json") {
        path = PathBuf::from(format!("{value}.shara.json"));
    }
    let handle = register_path(&state, path)?;
    save_registered(&state, &handle, &content, None).map(Some)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(OpenFiles::default())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![
            open_document_dialog,
            save_document,
            save_document_as_dialog
        ])
        .run(tauri::generate_context!())
        .expect("SHARAの起動に失敗しました");
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_directory() -> PathBuf {
        let path = std::env::temp_dir().join(format!("shara-test-{}", Uuid::new_v4()));
        fs::create_dir_all(&path).expect("test directory");
        path
    }

    #[test]
    fn stamp_changes_with_content() {
        assert_ne!(stamp(b"a"), stamp(b"b"));
    }

    #[test]
    fn invalid_document_is_rejected() {
        assert!(validate_document(r#"{"format":"other"}"#).is_err());
    }

    #[test]
    fn version_two_requires_exact_edge_endpoints() {
        let valid = r#"{
          "format":"shara","schemaVersion":2,"id":"doc_00000000",
          "semantic":{"nodes":[{"id":"node_00000001"},{"id":"node_00000002"}],"edges":[{"id":"edge_00000001","source":"node_00000001","target":"node_00000002"}],"groups":[]},
          "presentation":{"edgeEndpoints":{"edge_00000001":{"sourceSide":"bottom","targetSide":"top"}}},"metadata":{}
        }"#;
        assert!(validate_document(valid).is_ok());
        assert!(validate_document(&valid.replace("\"bottom\"", "\"diagonal\"")).is_err());
        assert!(validate_document(&valid.replace("\"edgeEndpoints\":{\"edge_00000001\":{\"sourceSide\":\"bottom\",\"targetSide\":\"top\"}}", "\"edgeEndpoints\":{}" )).is_err());
    }

    #[test]
    fn atomic_write_replaces_content_and_removes_temporary_files() {
        let directory = test_directory();
        let path = directory.join("document.shara.json");
        fs::write(&path, b"old").expect("old file");
        let warning = atomic_safe_write(&path, b"new").expect("atomic save");
        assert!(warning.is_none());
        assert_eq!(fs::read(&path).expect("saved file"), b"new");
        assert_eq!(fs::read_dir(&directory).expect("directory").count(), 1);
        fs::remove_dir_all(directory).expect("cleanup");
    }

    #[cfg(windows)]
    #[test]
    fn locked_original_is_preserved_on_replace_failure() {
        use std::os::windows::fs::OpenOptionsExt;
        let directory = test_directory();
        let path = directory.join("locked.shara.json");
        fs::write(&path, b"original").expect("original file");
        let lock = fs::OpenOptions::new()
            .read(true)
            .share_mode(0)
            .open(&path)
            .expect("exclusive lock");
        let error = atomic_safe_write(&path, b"replacement").expect_err("locked save must fail");
        assert!(error.starts_with("[failed]"));
        drop(lock);
        assert_eq!(fs::read(&path).expect("original remains"), b"original");
        fs::remove_dir_all(directory).expect("cleanup");
    }
}
