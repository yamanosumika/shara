# データ形式と出力仕様

## SharaDocument v2

必須トップレベルは `format: "shara"`、`schemaVersion: 2`、固定document ID、`semantic`、`presentation`、`metadata`。未知フィールドはトップレベルと各入れ子objectで拒否する。

`presentation.edgeEndpoints` はエッジIDをキーに、`sourceSide` と `targetSide` を `top`、`right`、`bottom`、`left` のいずれかで保持する。エッジID集合と `edgeEndpoints` のキー集合は完全一致させる。この相互制約はJSON Schemaだけでは表現せず、実行時Zod検証とRust側検証で強制する。

v1文書はv1として厳密に検証してからv2へ移行する。既存エッジの接続面は右→左とする。未知のschemaVersionは拒否する。

IDは型別接頭辞と英数字・underscore・hyphenだけで構成する。表示名から生成せず、改名・移動・整列・保存で再採番しない。

上限:

| 対象 | 上限 |
|---|---:|
| ファイル | 5 MiB |
| ノード | 500 |
| エッジ | 1,500 |
| グループ | 100 |
| ルール | 500 |
| 未決事項 | 500 |
| 短文 | 200文字 |
| 長文 | 4,000文字 |
| 文字列配列 | 100項目 |

空の名称、未設定担当、未接続、片側だけの分岐、未決事項、参照切離しは警告であり、保存できる。未知schema、重複ID、不正参照、存在しないgroupId、非有限座標、上限超過は構造エラーであり、現在文書を置き換えない。

## 関係

`next`、`yes`、`no`、`reads`、`writes`、`calls`、`returns`、`depends_on`、`triggers` を持つ。source=A、target=Bの向きを保存し、接続先の種別から関係を推定しない。

## 決定的出力

AI仕様は各要素配列を固定ID順へ正規化する。意味上順序を持つ `scope`、`outOfScope`、`inputs`、`outputs` は保存順を維持する。presentationとmetadataを除外するため、移動・同方向整列でAI仕様は変化しない。

Mermaidはpresentationの方向だけを参照し、座標は参照しない。AI依頼文は固定ガード文、利用者入力のJSON表現、AI仕様の全文を連結する。コピー操作は「Mermaidをコピー」と「AI依頼文をコピー」にまとめ、AI仕様単体は出力パネルで閲覧・ファイル保存できる。

JSON Schemaの機械可読版は [`shara.schema.json`](shara.schema.json) にある。Zod schemaを実行時検証の正本とし、変更時は両者とfixture/testを同時更新する。
