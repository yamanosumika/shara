# 検証記録

## 2026-09-26 初回ソース公開

[Issue #12](https://github.com/yamanosumika/shara/issues/12) の公開候補に対する検証。Node.js 24.17.0、npm 11.13.0、rustc / cargo 1.98.1、Windows x64 MSVCで実行した。結果は当日の各コマンド出力に基づく。

| 区分 | コマンド | 結果 |
|---|---|---|
| 型検査 | `npm run typecheck` | 成功 |
| Lint | `npm run lint` | 成功、warning 0 |
| 単体・UI | `npm test` | 成功、12 files / 55 tests（終了処理の回帰試験を含む） |
| E2E | `npm run test:e2e` | 成功、Chromium・Firefox・WebKitの21 tests |
| PWA | `npm run test:pwa` | 成功、1 test。build・Service Worker制御・通信遮断後の再読込と編集 |
| Web build | `npm run build` | 成功（PWA検証とTauri buildの前処理で実行） |
| npm監査 | `npm audit --json` | 成功、報告された脆弱性0件 |
| manifest/lock | `npm ls --all --package-lock-only` | 成功。manifestの依存指定・展開済み版とlockが一致 |
| Rust | `cargo fmt --manifest-path src-tauri/Cargo.toml --check` | 成功 |
| Rust | `cargo check --locked --offline --manifest-path src-tauri/Cargo.toml` | 成功 |
| Rust | `cargo test --locked --offline --manifest-path src-tauri/Cargo.toml` | 成功、5 tests |
| Windows native / bundle | `npm run tauri:build` | 成功。release実行ファイル、日本語NSIS、ja-JP MSIをローカル生成 |
| Windows実機のUI | release実行ファイルの新規起動と再読込 | 新しい「AI依頼文をコピー」表示と重複ボタンの削除を実画面・accessibilityで確認 |

E2Eの最初の実行はsandboxの親ディレクトリ読み取り拒否で開発サーバーを起動できなかった。同じコマンドを実行権限付きで再実行して成功した。テストの無効化・削除・skip追加は行っていない。Web buildにはZodのPUREコメント注釈とchunk size、RustにはMSVCのライブラリ生成通知のwarningがある。

Windowsの新規起動では当初旧UIが表示された。並行する本人依頼のUI更新タスクで、実行ファイルに新しいassetが埋め込まれていることを確認し、検証用ウィンドウを `Ctrl+Shift+R` で再読込すると新UIへ切り替わった。キャッシュの影響と判断し、追加のソース変更・再buildは行っていない。自動更新でこの状態が発生しないことまでは検証していない。

終了確認の本人依頼による追加修正として、Tauriの終了ダイアログを「保存して終了」「破棄して終了」に分け、mainウィンドウへdestroy権限を付与した。破棄終了は復旧コピー削除の失敗で阻止せず、保存終了は現在の未保存状態と保留操作の同一性を確認する。回帰試験は保存成功・失敗・競合・結果不明・キャンセル・保存中の編集と破棄を含む。

Windows実ウィンドウでの保存障害、インストーラーのインストール・アンインストールは、この公開検証では未実施。native build成功と実機操作の完了を区別する。ソース照合で保存・読込中の文書切替に世代照合がないことを確認し、READMEと設計文書の保証を実装に合わせて修正した。この競合を解消済みとは扱わない。今回の作業はソース公開で、バイナリやWeb build成果物を配布しない。

## 2026-09-23 以前の検証記録

以下は2026-09-23時点の記録。今回の再検証結果とは区別する。

| 区分 | コマンド | 状態 |
|---|---|---|
| 型検査 | `npm run typecheck` | 成功 |
| Lint | `npm run lint` | 成功、warning 0 |
| 単体・UI | `npm test` | 成功、11 files / 42 tests |
| E2E | `npm run test:e2e` | 成功、Chromium・Firefox・WebKitで21 tests |
| PWAオフライン | `npm run test:pwa` | 成功、1 test。Service Worker制御後に全network requestを遮断して再読込・編集を確認 |
| Web build | `npm run build` | 成功、`dist/`とprecache対応`sw.js`生成。Mermaid/ELKのchunk size warningあり |
| Rust format/check/test | `cargo fmt --check` / `cargo check` / `cargo test` | 成功、5 tests。MSVC linkerの生成物通知warningあり |
| Tauri build | `npm run tauri:build` | 成功、`src-tauri/target/release/shara.exe`生成 |
| Windows bundle | `npm run tauri:build` | 成功。日本語NSIS `SHARA_0.1.0_x64-setup.exe` とja-JP MSI `SHARA_0.1.0_x64_ja-JP.msi` を生成 |

上記件数は2026-09-23に実行した各コマンドの出力に基づく。最終差分反映後にも同じ検証一式を再実行する。

## 自動試験で確認した操作・不変条件

- パレットからの追加、最後に操作した要素の右側への決定的配置、明示的drop座標の優先
- 上下左右4面のsource/target handleによる16通りの接続、自己接続・同方向重複の拒否
- 接続直後のエッジ編集、接続先変更時の固定edge ID・関係・ラベル・条件の維持
- グループサイズ変更で意味データとメンバー絶対座標を維持
- 警告から対象ノード・エッジ・グループ・ルール・未決事項への移動
- 保存済み文書との差分からpresentationとmetadataを除外
- v1の厳密検証後のv2移行、未知版・不正参照・endpointキー不一致の拒否
- File System Access APIで`close()`完了後だけ保存成功とし、権限拒否をdownloadへ切り替えない
- 複数復旧候補の列挙・破棄とv1候補の移行
- native保存時の外部変更検知、原子的置換、一時ファイル掃除、Windowsの使用中原本保持
- Chromium・Firefox・WebKitで編集・接続・保存要求・再読込・Clipboard・外部host遮断
- Service Worker制御後のnetwork遮断下で再読込と編集

Webのdownloadはブラウザへ要求を出した結果であり、nativeの原本置換成功とは扱っていない。

## Windowsインストーラー

2026-09-23の生成結果は次のとおり。いずれもx64、バージョン0.1.0、コード署名なし。

| 形式 | ファイル | サイズ | SHA-256 |
|---|---|---:|---|
| NSIS | `SHARA_0.1.0_x64-setup.exe` | 2,645,515 bytes | `4F8B44BF7664FA4659579091936AEEC2FB40530F67E7275AA29D7CB774E72D02` |
| MSI | `SHARA_0.1.0_x64_ja-JP.msi` | 3,145,728 bytes | `1932053554D3F179405FF3F337C7A2ED46B49A1FE094F02899EE33E2B25976D5` |

## 未検証・残る手順

自動試験とRelease buildでは、次のWindows実操作を確認していない。

1. 実ウィンドウの終了ボタンで3択確認を表示し、保存結果ごとに終了可否が変わること
2. 読取専用保存先、保存完了通知の喪失、原本削除直後、Save As復旧の実ファイル操作
3. インストーラーのインストール・起動・アンインストール実操作と、未署名配布時のWindows警告

この確認が終わるまで、Windows保存障害系と終了確認を実機で完全検証済みとは扱わない。
