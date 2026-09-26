# 初期設計メモ

## 正本と境界

`SharaDocument.semantic` を意味の正本とする。`presentation` は座標、グループ枠、表示方向、viewportだけを保持する。選択状態や編集中の一時状態はZustand storeに置き、保存文書へ入れない。

React Flowのnode/edgeは文書から投影する表示モデルである。グループ所属は `Node.groupId` だけを正本とし、React Flowのparent-childや別memberIdsを保存しない。

## commandと履歴

domain commandは文書を受け取り新しい文書を返す。ノード削除と接続削除、参照切離しを一つのcommandで行う。Undo/Redoは文書スナップショットを最大100世代保持する。ドラッグは終了時、フォームはblur時にだけcommandを確定する。

## 非同期処理

自動整列は開始時のdocument IDと編集世代を記録し、完了時に一致しなければ結果を適用しない。保存は開始時点の文書を保存済みfingerprintの基準にする。ただし保存先・保存済み文書の反映前と読込結果の置換前には同等の文書・世代照合がなく、非同期処理中の文書切替競合は未解決。これらを自動整列と同じ保証として扱わない。

## 保存

native側はファイルダイアログをRust内で開き、選択パスをランダムハンドルへ置き換える。フロントエンドから任意パスを渡す汎用read/write commandは公開しない。上書き前にSHA-256内容ハッシュを比較する。

## セキュリティ

CSPとTauri capabilitiesを最小化し、clipboard write以外のplugin権限を与えない。文書内テキストを実行・送信しない。Mermaidはラベルをエスケープし、`securityLevel: "strict"` とHTMLラベル無効でparse/renderする。

## 設計相談の採否

ChatGPTプロジェクト「Codexさんからのご相談」の「SHARA設計レビュー」へ相談した。所属はツール応答で確認したが、応答モデル名は取得できず、GPT-6 Pro/Astraであることは未確認。

採用した指摘は、全階層の未知キー拒否、保存snapshotと現在編集の分離、同一document IDでも区別できる復旧session、Rust側path handle、application command ACL、Web downloadとnative保存完了の結果分離、集合だけをID順に正規化する規則。Windows固有の原子的置換と障害復旧は実機未検証のため完成扱いにしない。
