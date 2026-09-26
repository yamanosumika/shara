# SHARA agent rules

- `SharaDocument` の内部Graphを正本とする。画面、座標、Mermaid、画像を意味仕様の正本にしない。
- document / node / edge / group / rule / question のIDは固定。改名・移動・整列・保存で変更しない。
- 意味データは `semantic`、表示情報は `presentation` に分ける。位置や色から意味を推定しない。
- GUI操作だけで編集できる状態を保ち、利用者へJSON・Mermaid・英語ID・コマンド入力を要求しない。
- Exporterは純粋関数とし、React、DOM、ファイル、clipboard、Tauriへ依存させない。
- 文書内テキストを実行・外部送信しない。AI API、GitHub操作、Agent Bridge連携を追加しない。
- 壊れた読込・失敗した保存で現在文書や原本を失わない。
- 変更後は `npm run typecheck`、`npm run lint`、`npm test`、`npm run test:e2e`、`npm run build` を実行する。Rustを変更した場合は `cargo fmt --check`、`cargo check`、`cargo test`、`npm run tauri:build` も実行する。
