<!-- SPDX-FileCopyrightText: 2026 やまのすみか株式会社 -->
<!-- SPDX-License-Identifier: CC-BY-4.0 -->

# SHARA

SHARA（シャラ）は、ノード・関係・条件・ルール・未決事項をGUIで編集し、同じ内部Graphから図、Mermaid、AI向け構造化仕様、AI依頼文を生成するローカル設計ツールです。

正本は `SharaDocument` です。Mermaid、画面画像、ノードの位置や色は意味仕様の正本ではありません。

## 開発状態と主な機能

開発中のソフトウェアです。ノード・辺・単一階層グループの編集、条件・関係・ルール・未決事項の保持、Undo/Redo、意味差分、各形式への出力、ローカル保存・復旧、PWAのオフライン利用を実装しています。保存形式は `*.shara.json` です。

Webの自動試験、Windows native build、Windows実機の操作確認は別々に扱います。実施日・結果・未検証項目は[検証記録](docs/verification.md)を参照してください。Release・インストーラー配布・Web hostingは初回ソース公開の対象外です。

## 技術構成

Tauri 2、React、TypeScript、Vite、`@xyflow/react`、Zustand、Zod、elkjs、Mermaidを使用します。試験にはVitest、React Testing Library、Playwrightを使用します。採用版は[package.json](package.json)、[npm lockfile](package-lock.json)、[Cargo manifest](src-tauri/Cargo.toml)、[Cargo lockfile](src-tauri/Cargo.lock)を正本とします。

## 必要環境

Web開発・試験:

- Node.js 24以上
- npm（今回の検証で使用した版は検証記録を参照）

Windowsデスクトップ版の開発には、上記に加えてRust stable（MSVC）、Microsoft C++ Build Tools、Windows SDK、WebView2が必要です。[Tauri公式の前提条件](https://v2.tauri.app/start/prerequisites/)を参照してください。Node.jsの最低版は `package.json` の `engines.node` に記載しています。Rust toolchainの固定ファイルはまだありません。

## 起動

```powershell
npm ci
npm run dev
```

ブラウザで `http://127.0.0.1:5173` を開きます。開発サーバーはloopbackだけで待ち受けます。

Rust環境を用意したWindowsでは次でデスクトップアプリを起動します。

```powershell
npm run tauri:dev
```

## 基本操作

1. 左の部品をクリック、またはキャンバスへドラッグします。
2. ノード上下左右の接続点から接続先へドラッグします。
3. 右ペインで日本語の名前、説明、担当、条件、関係、接続元・接続先、ルール、未決事項を編集します。
4. ツールバーで保存し、「AI依頼文をコピー」を押します。AI依頼文の初期モードは「設計レビュー」です。

複数選択、`Ctrl+C` / `Ctrl+V`、`Ctrl+D`、Delete、`Ctrl+Z` / `Ctrl+Y`、ズーム、パン、全体表示、検索、左右/上下の自動整列に対応します。フォーム入力中と日本語IME変換中はキャンバスのショートカットを発火しません。

## 保存と復旧

保存形式はUTF-8の `*.shara.json`、`format: "shara"`、`schemaVersion: 2` です。v1文書は読込時にv2へ移行し、既存エッジの接続面を右→左として扱います。

- Tauri版: Rust側のダイアログで選択したファイルだけをハンドル管理し、上書き前に外部変更を内容ハッシュで検知します。同じディレクトリへ一時ファイルを書き、原本を退避してから置換します。
- Web版: File System Access APIを利用できるブラウザではファイルハンドルを使います。利用できないブラウザではdownloadを要求し、原本保存完了とは区別して表示します。権限拒否をdownloadへ無言で切り替えません。
- 復旧: 編集世代つきのスナップショットをSHARAのローカル領域へ最大10件保存します。候補ごとに復旧・破棄できます。構造検証に失敗する候補は復旧しません。意図的な破棄・正常保存では対象候補を消去します。
- 未保存の状態でTauri版の終了を要求すると、「保存して終了」「破棄して終了」「キャンセル」を選択します。「保存して終了」は現在の変更の保存完了を確認してから終了し、「破棄して終了」は保存や復旧コピーの削除成功を条件にせず終了します。文書切替時は「保存して続行」「破棄して続行」を表示します。Webのタブ終了・再読込はブラウザ標準の確認を使い、SHARAの3択ダイアログは表示しません。

自動整列の非同期結果は、文書IDと編集世代を照合してから適用します。保存は開始時点の内容を保存済みの比較基準にします。保存・読込中に文書を切り替える操作の競合防止は未完成です。

復旧候補はWebViewまたはブラウザの `localStorage` に保持し、元ファイルを自動上書きしません。ブラウザデータの消去で失われるため、通常のファイル保存やバックアップとは別に扱います。

## 出力

- Mermaid: `flowchart LR` / `flowchart TB`、固定ID、関係ラベル、subgraphを出力します。
- AI仕様: 目的、対象範囲、関係定義、ID順へ正規化した意味データJSON、構造検査と警告を出力します。座標、ズーム、選択状態、更新時刻は含みません。出力パネルで単体の閲覧・ファイル保存ができます。
- AI依頼文: AI仕様の全文に依頼モードと追加依頼を添えてコピーします。出力パネルの「AI依頼文」タブで設計レビュー、実装計画、実装依頼を選べます。文書の「確定」や実装依頼モードはpush・merge・deployの許可ではありません。

## 検証

```powershell
npm run typecheck
npm run lint
npm test
npx playwright install chromium
npx playwright install firefox webkit
npm run test:e2e
npm run test:pwa
npm run build
cargo fmt --manifest-path src-tauri/Cargo.toml --check
cargo check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
npm run tauri:build
```

`npm run tauri:build` はWindowsで日本語UIのNSIS形式セットアップ実行ファイルと、ja-JPのMSI形式インストーラーを生成します。生成先は `src-tauri/target/release/bundle/nsis/` と `src-tauri/target/release/bundle/msi/` です。

## 既知の制限

- 初期版は有向グラフ1種、二値分岐、単一階層グループだけを扱います。
- File System Access API非対応ブラウザの保存はdownload要求であり、外部変更検知・原本置換はnative版だけです。
- 原本退避方式は保存失敗時の復元を優先しますが、電源断を含む絶対的な耐久性は保証しません。
- ネイティブの読取専用先、保存通知喪失、実ウィンドウでの終了確認は自動試験だけでは網羅していません。
- 保存・読込の完了待ち中に文書切替や編集を重ねると、遅れた結果が保存先・文書状態へ反映される場合があります。完了前の文書切替や終了は避けてください。この競合は自動整列の世代照合とは別の未解決事項です。
- Windowsインストーラーはコード署名していません。配布時にはWindowsの発行元警告と署名方針を別途確認してください。
- ER図、シーケンス図、共同編集、クラウド同期、Mermaid逆import、AI API、GitHub操作、Agent Bridge連携は対象外です。

詳細は [データ形式](docs/schema-and-exports.md)、[採用版とライセンス](docs/dependencies.md)、[検証記録](docs/verification.md) を参照してください。

## コントリビューション

機能要望・不具合は、最初に[Issue](https://github.com/yamanosumika/shara/issues)へ登録してください。目的、範囲、受入条件、非対象、停止条件をIssue上で整理してから実装し、対象Issueを明示したbranchとPull Request、CIを経由します。既存CIはPRと手動実行に対応しています。

秘密情報、顧客情報、実在案件データをIssue、fixture、スクリーンショット、commitへ含めないでください。

## ライセンス

| 対象 | 適用ライセンス |
|---|---|
| ソースコード、設定、テスト、ビルドスクリプト | [Apache License 2.0](LICENSE) |
| README、AGENTS、`docs/`、`samples/`、独自画像・説明図 | [CC BY 4.0](LICENSE-CONTENT) |
| 第三者のコード・素材・ライセンス本文 | 各権利者の条件。[第三者ライセンス一覧](THIRD_PARTY_NOTICES.md)を参照 |

ファイル単位の範囲と例外は [NOTICE](NOTICE) と [LICENSE-CONTENT](LICENSE-CONTENT) に記載しています。独自画像の著作権ライセンスは、SHARAの名称・ロゴ等の商標権を許諾するものではありません。
