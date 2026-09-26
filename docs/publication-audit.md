# 初回ソース公開の監査

対象は [yamanosumika/shara Issue #12](https://github.com/yamanosumika/shara/issues/12)。確認日は2026-09-26。

## 対象と方法

- 開始時のローカルHEADは `c79220490d58420da8c29c90a760b1c99efacf9f`、branchはmain、作業ツリーはclean、remoteは未設定だった。
- GitHub側はPrivate、branchとGit refがなく、既存Issue #1〜#12がある状態から開始した。
- `git rev-list --all --reflog`、`git ls-tree`、`git cat-file`、`git fsck`で、既存3 commits、到達可能165 blobsと到達不能3 blobsを調べた。
- 秘密鍵・主要provider token・JWT・認証値の代入・認証URL・個人メール・電話・住所関連表現・絶対ローカルパス・旧名称・他の非公開repository参照を検査した。長い文字列はlockfileのintegrity/checksum等と区別して確認した。
- 画像を視認し、PNGの文字・EXIF metadataも確認した。既存Issue本文とコメントも確認した。
- 公開候補の変更・新規ファイルは、旧履歴とは別にcommit前に再検査した。

この監査は公開情報の混入・由来・ライセンスの確認であり、アプリケーションの全脆弱性を網羅する検査ではない。

## 由来

主要コード・テストはSHARA実装時の作成記録とGit導入差分を照合した。第三者の非公開コードを持ち込んだ具体的な証拠は検出していない。

- nativeの独自アイコンは `src-tauri/icons/icon.svg` を元にTauri CLIで各形式へ生成した。作成内容と生成成功の記録を照合した。
- PWAの独自アイコン `public/shara-icon.svg` はプロジェクト内の作成記録と一致した。
- `src/fixtures/estimateFlow.ts` は説明用の見積フローで、顧客・実案件のデータを含まない。文書出力は `scripts/write-samples.ts`、画面画像は `tests/editor.spec.ts` がこのfixtureから生成する。
- 並行して本人が依頼した「AI依頼文をコピー」へのUI整理と、Tauriの「保存して終了」「破棄して終了」の修正を含む。出力名・説明・試験・サンプル・必要な終了権限を合わせて検証した。

ローカルの会話ログや監査の生データは公開treeに含めない。

## 公開する履歴とライセンス

旧commitsには公開用noreplyではない作者メールがあったため、旧履歴を再利用しない。監査済みtreeから、親commitを持たない単一の初回commitを作り、mainのみをpushする。旧履歴はローカルに保管し、公開用commitの作者・committerにはGitHubのnoreply表記を用いる。

ソース・設定・テスト・ビルドスクリプトはApache-2.0、独自文書・画像・サンプルはCC BY 4.0とし、ファイル種別の範囲と例外を [NOTICE](../NOTICE) と [LICENSE-CONTENT](../LICENSE-CONTENT) に記載した。依存コードはvendor化していない。[第三者ライセンス一覧](../THIRD_PARTY_NOTICES.md) と [依存関係の証跡](dependencies.md) に確認範囲を記録した。

node_modules、dist、coverage、Playwright成果物、Tauri target、インストーラー、秘密情報のファイル、Tauriの再生成schema・権限定義は公開treeから除外する。

## 結果と公開後の確認

開始時の履歴・画像・Issueに、秘密情報、顧客情報、第三者非公開コード、出所不明素材の確定検出はなかった。文字列検索で非存在を形式的に証明したとは扱わない。検証コマンドの成否とWindows実機の未実施項目は [検証記録](verification.md) を参照する。

公開後にGitHubのcommit・tree・README表示・LICENSE検出・Issue保持・visibilityを照合し、commit SHAと最終結果をIssue #12へ記録する。Release、バイナリ配布、コード署名取得、Web hostingは対象外。
