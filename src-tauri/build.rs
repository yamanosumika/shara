fn main() {
    tauri_build::try_build(tauri_build::Attributes::new().app_manifest(
        tauri_build::AppManifest::new().commands(&[
            "open_document_dialog",
            "save_document",
            "save_document_as_dialog",
        ]),
    ))
    .expect("failed to run tauri-build");
}
