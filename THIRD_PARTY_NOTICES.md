# Third-party notices

SHARA は第三者のライブラリ・開発ツールに依存する。それぞれの権利は著作権者に帰属し、第三者のコード・資産には各 upstream の条件が適用される。SHARA の [LICENSE](LICENSE) と [LICENSE-CONTENT](LICENSE-CONTENT) を第三者の依存関係へ適用しない。

今回の初回公開はソース repository の公開で、依存パッケージ、ビルド済み Web アプリ、実行ファイル、インストーラーの再配布を含まない。lockfile は依存バージョンと配布元の記録であり、このファイルだけで将来のバイナリ配布に必要な告知・本文・ソース提供を完了したとは扱わない。

## 対象と証跡

[依存関係一覧](docs/dependencies.md) に、npm の全直接依存・全直接開発依存、実行時候補の全推移依存、および Windows x64 MSVC の Cargo 解決グラフ全件を収録した。各行にバージョン、ライセンス宣言、upstream / 固定配布元、ライセンス本文または宣言の所在を記載している。正確なライセンス原文と著作権表示はそのバージョンの配布物を参照する。全プラットフォームの監査完了を意味しない。

## ELK / elkjs

elkjs 0.12.0 は [upstream の当該版](https://github.com/kieler/elkjs/tree/0.12.0) に由来する。配布物の LICENSE.md は EPL-2.0 本文で、lib/elk.bundled.js のヘッダーは Copyright (c) 2017 Kiel University and others と EPL-2.0 OR GPL-3.0-or-later を記載する。SHARA の src/layout/elk.ts はこの bundle を import する。EPL-2.0 に基づく取り扱いを前提とし、SHARA 自身の Apache-2.0 表記に置き換えない。

将来 ELK を含む Web bundle / 実行形式を配布するときは、対象 Program のソースを EPL に従い入手できる旨と入手方法を添え、ソース配布には EPL 本文を付け、既存の権利表示を保持する。変換された JavaScript だけでソース提供が充足すると決めず、元の ELK / elkjs と対応版を確保する。根拠: [EPL-2.0 第3節](https://www.eclipse.org/org/documents/epl-2.0/EPL-2.0.html)、[elkjs の構成・ビルド説明](https://github.com/kieler/elkjs/tree/0.12.0)。

## MPL-2.0 の Rust 依存

Windows 解決グラフに cssparser 0.36.0、cssparser-macros 0.6.1、dtoa-short 0.3.5、option-ext 0.2.0、selectors 0.36.1 がある。各 crate の Cargo.toml は MPL-2.0 を宣言する。selectors は lib.rs の MPL ヘッダーも確認し、ほかの4件は配布物の LICENSE または LICENSE.txt に本文がある。build 用も含むため、すべてが最終バイナリに含まれるとは主張しない。

MPL 対象コードを実行形式で配布する場合、対象ソースを MPL の条件で入手できるようにし、入手方法を利用者へ知らせ、ライセンス・権利表示を保持する。SHARA の別ファイルにあるコードの条件と、MPL 対象ファイルの条件を区別する。根拠: [MPL-2.0 第3.1〜3.4節](https://www.mozilla.org/en-US/MPL/2.0/)。

## その他の個別条件

- DOMPurify の宣言は MPL-2.0 OR Apache-2.0。複数選択肢を一律に SHARA のライセンスとして読み替えない。本文は同梱 LICENSE を参照する。
- khroma 2.1.0 は package.json / lock の license 欄がないが、同梱 license に MIT 本文と著作権表示がある。[upstream の原文](https://github.com/fabiospampinato/khroma/blob/v2.1.0/license)も参照できる。fastdom / strictdom の MIT 本文は各 README.md の License 節にある。
- brotli は BSD-3-Clause AND MIT、dpi は Apache-2.0 AND MIT、unicode-ident は (MIT OR Apache-2.0) AND Unicode-3.0。AND の追加条件を落とさず、各配布物内の複数本文・著作権表示を保持する。その他の Unicode / BSD / ISC / Zlib / BSL 等も個別の原文に従う。
- npm 開発用の推移依存 caniuse-lite は CC-BY-4.0。Tauri の README はコードとロゴの条件を分けているため、コードの許諾を第三者ロゴの転載へ拡張しない。これらの資産を今回の公開物へ取り込む根拠にはしていない。

## 将来の配布物

ビルド済み Web アプリの公開、Tauri の実行ファイル・インストーラー配布、依存コードの vendor 化を行う前に、その成果物に対応するライセンス本文・著作権表示・必要な NOTICE とソース入手方法を揃える。ライセンス宣言のみ確認済みの crate、今回未展開の非 Windows 等の依存、生成物内の資産をその段階で確認する。変更した第三者コードがあれば変更内容と対応ソースを記録する。
