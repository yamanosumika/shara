# 依存関係とライセンス証跡

確認日: 2026-09-26。バージョンの正本は [package-lock.json](../package-lock.json) と [Cargo.lock](../src-tauri/Cargo.lock)。直接依存の正本は [package.json](../package.json) と [Cargo.toml](../src-tauri/Cargo.toml)。

## 確認範囲

今回の公開物は SHARA のソース repository。node_modules、Cargo registry、dist、Tauri target、インストーラーを同梱しない。この一覧は第三者コードのライセンスを SHARA の Apache-2.0 または文書の CC BY 4.0 に変更するものではない。第三者の著作権・ライセンス本文は各配布物内の原文が正本となる。

- npm lock 全 431 エントリのライセンス宣言を確認。うちローカル展開済み 371、非展開 60。宣言がない khroma は配布物の MIT 本文で補った。
- 下表は npm の直接依存 9、直接開発依存 20 と、lock の dev が false または未設定の実行時候補 129 エントリを収録。実行時候補は全件ローカルに展開済み。開発用の推移依存はこの詳細表に収録しない。
- Rust は x86_64-pc-windows-msvc の解決グラフにある第三者 282 crates を収録。直接 8 crates（build 依存を含む）と推移依存の license 宣言を確認。build / proc-macro も含む保守的な集合であり、最終バイナリに全件のコードが含まれるという意味ではない。
- Cargo.lock は root を含め 486 エントリ。Windows 解決グラフ外の 203 crates はローカル未展開で本文未確認。非 Windows 等を含む全 target の監査完了とは扱わない。
- npm の manifest と lock root の依存指定、展開済み package の version は一致。npm ls --all --package-lock-only、および cargo metadata --locked --offline --filter-platform x86_64-pc-windows-msvc --format-version 1 は成功した。全 target 指定の offline metadata は未キャッシュ依存のため完了していない。

各行の「本文・証跡」は対象 package / crate のルートからの相対パス。固定配布物の npm URL は lock の resolved を転記し、整合性の値は lock の integrity に保持する。crate の配布元・checksum は Cargo.lock に保持する。upstream URL は同梱 manifest から取得した参照先で、リンク先の HEAD を監査バージョンと同一とは扱わない。原文未収集と記した crate は manifest の宣言までを確認した状態。

## npm 実行時依存（直接・推移）

Vite による除去・分割後の bundle 内容は別途確認が必要。この集合は、フロントエンドへの取り込み候補を漏らさないための lock ベースの一覧。複数 version の同一名は別エントリとして扱う。

| Package | Version | License | 関係 | 出所 | 本文・証跡 |
| --- | --- | --- | --- | --- | --- |
| `@antfu/install-pkg` | `2.1.0` | MIT | 推移 | [upstream](https://github.com/antfu-collective/install-pkg) / [固定配布物](https://registry.npmjs.org/@antfu/install-pkg/-/install-pkg-2.1.0.tgz) | `LICENSE` |
| `@braintree/sanitize-url` | `7.1.2` | MIT | 推移 | [upstream](https://github.com/braintree/sanitize-url) / [固定配布物](https://registry.npmjs.org/@braintree/sanitize-url/-/sanitize-url-7.1.2.tgz) | `LICENSE` |
| `@chevrotain/types` | `11.1.2` | Apache-2.0 | 推移 | [upstream](https://github.com/Chevrotain/chevrotain) / [固定配布物](https://registry.npmjs.org/@chevrotain/types/-/types-11.1.2.tgz) | `LICENSE.txt` |
| `@iconify/types` | `2.0.0` | MIT | 推移 | [upstream](https://github.com/iconify/iconify) / [固定配布物](https://registry.npmjs.org/@iconify/types/-/types-2.0.0.tgz) | `license.txt` |
| `@iconify/utils` | `3.1.7` | MIT | 推移 | [upstream](https://github.com/iconify/iconify) / [固定配布物](https://registry.npmjs.org/@iconify/utils/-/utils-3.1.7.tgz) | `license.txt` |
| `@mermaid-js/parser` | `1.2.1` | MIT | 推移 | [upstream](https://github.com/mermaid-js/mermaid) / [固定配布物](https://registry.npmjs.org/@mermaid-js/parser/-/parser-1.2.1.tgz) | `LICENSE` |
| `@tauri-apps/api` | `2.11.1` | Apache-2.0 OR MIT | 直接 | [upstream](https://github.com/tauri-apps/tauri) / [固定配布物](https://registry.npmjs.org/@tauri-apps/api/-/api-2.11.1.tgz) | `LICENSE_APACHE-2.0`, `LICENSE_MIT` |
| `@tauri-apps/plugin-clipboard-manager` | `2.3.3` | MIT OR Apache-2.0 | 直接 | [upstream](https://github.com/tauri-apps/plugins-workspace) / [固定配布物](https://registry.npmjs.org/@tauri-apps/plugin-clipboard-manager/-/plugin-clipboard-manager-2.3.3.tgz) | `LICENSE.spdx` |
| `@types/d3` | `7.4.3` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3/-/d3-7.4.3.tgz) | `LICENSE` |
| `@types/d3-array` | `3.2.2` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-array/-/d3-array-3.2.2.tgz) | `LICENSE` |
| `@types/d3-axis` | `3.0.6` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-axis/-/d3-axis-3.0.6.tgz) | `LICENSE` |
| `@types/d3-brush` | `3.0.6` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-brush/-/d3-brush-3.0.6.tgz) | `LICENSE` |
| `@types/d3-chord` | `3.0.6` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-chord/-/d3-chord-3.0.6.tgz) | `LICENSE` |
| `@types/d3-color` | `3.1.3` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-color/-/d3-color-3.1.3.tgz) | `LICENSE` |
| `@types/d3-contour` | `3.0.6` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-contour/-/d3-contour-3.0.6.tgz) | `LICENSE` |
| `@types/d3-delaunay` | `6.0.4` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-delaunay/-/d3-delaunay-6.0.4.tgz) | `LICENSE` |
| `@types/d3-dispatch` | `3.0.7` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-dispatch/-/d3-dispatch-3.0.7.tgz) | `LICENSE` |
| `@types/d3-drag` | `3.0.7` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-drag/-/d3-drag-3.0.7.tgz) | `LICENSE` |
| `@types/d3-dsv` | `3.0.7` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-dsv/-/d3-dsv-3.0.7.tgz) | `LICENSE` |
| `@types/d3-ease` | `3.0.2` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-ease/-/d3-ease-3.0.2.tgz) | `LICENSE` |
| `@types/d3-fetch` | `3.0.7` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-fetch/-/d3-fetch-3.0.7.tgz) | `LICENSE` |
| `@types/d3-force` | `3.0.10` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-force/-/d3-force-3.0.10.tgz) | `LICENSE` |
| `@types/d3-format` | `3.0.4` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-format/-/d3-format-3.0.4.tgz) | `LICENSE` |
| `@types/d3-geo` | `3.1.1` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-geo/-/d3-geo-3.1.1.tgz) | `LICENSE` |
| `@types/d3-hierarchy` | `3.1.7` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-hierarchy/-/d3-hierarchy-3.1.7.tgz) | `LICENSE` |
| `@types/d3-interpolate` | `3.0.4` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-interpolate/-/d3-interpolate-3.0.4.tgz) | `LICENSE` |
| `@types/d3-path` | `3.1.1` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-path/-/d3-path-3.1.1.tgz) | `LICENSE` |
| `@types/d3-polygon` | `3.0.2` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-polygon/-/d3-polygon-3.0.2.tgz) | `LICENSE` |
| `@types/d3-quadtree` | `3.0.6` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-quadtree/-/d3-quadtree-3.0.6.tgz) | `LICENSE` |
| `@types/d3-random` | `3.0.4` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-random/-/d3-random-3.0.4.tgz) | `LICENSE` |
| `@types/d3-scale` | `4.0.9` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-scale/-/d3-scale-4.0.9.tgz) | `LICENSE` |
| `@types/d3-scale-chromatic` | `3.1.0` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-scale-chromatic/-/d3-scale-chromatic-3.1.0.tgz) | `LICENSE` |
| `@types/d3-selection` | `3.0.12` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-selection/-/d3-selection-3.0.12.tgz) | `LICENSE` |
| `@types/d3-shape` | `3.2.0` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-shape/-/d3-shape-3.2.0.tgz) | `LICENSE` |
| `@types/d3-time` | `3.0.4` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-time/-/d3-time-3.0.4.tgz) | `LICENSE` |
| `@types/d3-time-format` | `4.0.3` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-time-format/-/d3-time-format-4.0.3.tgz) | `LICENSE` |
| `@types/d3-timer` | `3.0.2` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-timer/-/d3-timer-3.0.2.tgz) | `LICENSE` |
| `@types/d3-transition` | `3.0.9` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-transition/-/d3-transition-3.0.9.tgz) | `LICENSE` |
| `@types/d3-zoom` | `3.0.8` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/d3-zoom/-/d3-zoom-3.0.8.tgz) | `LICENSE` |
| `@types/geojson` | `7946.0.16` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/geojson/-/geojson-7946.0.16.tgz) | `LICENSE` |
| `@types/react` | `19.3.0` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/react/-/react-19.3.0.tgz) | `LICENSE` |
| `@types/react-dom` | `19.3.0` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/react-dom/-/react-dom-19.3.0.tgz) | `LICENSE` |
| `@types/trusted-types` | `2.0.7` | MIT | 推移 | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/trusted-types/-/trusted-types-2.0.7.tgz) | `LICENSE` |
| `@upsetjs/venn.js` | `2.0.0` | MIT | 推移 | [upstream](https://github.com/upsetjs/venn.js) / [固定配布物](https://registry.npmjs.org/@upsetjs/venn.js/-/venn.js-2.0.0.tgz) | `LICENSE` |
| `@xyflow/react` | `12.11.6` | MIT | 直接 | [upstream](https://github.com/xyflow/xyflow) / [固定配布物](https://registry.npmjs.org/@xyflow/react/-/react-12.11.6.tgz) | `LICENSE` |
| `zustand` | `4.5.7` | MIT | 推移 | [upstream](https://github.com/pmndrs/zustand) / [固定配布物](https://registry.npmjs.org/zustand/-/zustand-4.5.7.tgz) | `LICENSE` |
| `@xyflow/system` | `0.0.82` | MIT | 推移 | [upstream](https://github.com/xyflow/xyflow) / [固定配布物](https://registry.npmjs.org/@xyflow/system/-/system-0.0.82.tgz) | `LICENSE` |
| `classcat` | `5.0.5` | MIT | 推移 | [固定配布物](https://registry.npmjs.org/classcat/-/classcat-5.0.5.tgz) | `LICENSE.md` |
| `commander` | `7.2.0` | MIT | 推移 | [upstream](https://github.com/tj/commander.js) / [固定配布物](https://registry.npmjs.org/commander/-/commander-7.2.0.tgz) | `LICENSE` |
| `cose-base` | `1.0.3` | MIT | 推移 | [upstream](https://github.com/iVis-at-Bilkent/cose-base) / [固定配布物](https://registry.npmjs.org/cose-base/-/cose-base-1.0.3.tgz) | `LICENSE` |
| `csstype` | `3.2.3` | MIT | 推移 | [upstream](https://github.com/frenic/csstype) / [固定配布物](https://registry.npmjs.org/csstype/-/csstype-3.2.3.tgz) | `LICENSE` |
| `cytoscape` | `3.34.3` | MIT | 推移 | [upstream](https://github.com/cytoscape/cytoscape.js) / [固定配布物](https://registry.npmjs.org/cytoscape/-/cytoscape-3.34.3.tgz) | `LICENSE`, `license-update.mjs` |
| `cytoscape-cose-bilkent` | `4.1.0` | MIT | 推移 | [upstream](https://github.com/cytoscape/cytoscape.js-cose-bilkent) / [固定配布物](https://registry.npmjs.org/cytoscape-cose-bilkent/-/cytoscape-cose-bilkent-4.1.0.tgz) | `LICENSE` |
| `cytoscape-fcose` | `2.2.0` | MIT | 推移 | [upstream](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose) / [固定配布物](https://registry.npmjs.org/cytoscape-fcose/-/cytoscape-fcose-2.2.0.tgz) | `LICENSE` |
| `cose-base` | `2.2.0` | MIT | 推移 | [upstream](https://github.com/iVis-at-Bilkent/cose-base) / [固定配布物](https://registry.npmjs.org/cose-base/-/cose-base-2.2.0.tgz) | `LICENSE` |
| `layout-base` | `2.0.1` | MIT | 推移 | [upstream](https://github.com/iVis-at-Bilkent/layout-base) / [固定配布物](https://registry.npmjs.org/layout-base/-/layout-base-2.0.1.tgz) | `LICENSE` |
| `d3` | `7.9.0` | ISC | 推移 | [upstream](https://github.com/d3/d3) / [固定配布物](https://registry.npmjs.org/d3/-/d3-7.9.0.tgz) | `LICENSE` |
| `d3-array` | `3.2.4` | ISC | 推移 | [upstream](https://github.com/d3/d3-array) / [固定配布物](https://registry.npmjs.org/d3-array/-/d3-array-3.2.4.tgz) | `LICENSE` |
| `d3-axis` | `3.0.0` | ISC | 推移 | [upstream](https://github.com/d3/d3-axis) / [固定配布物](https://registry.npmjs.org/d3-axis/-/d3-axis-3.0.0.tgz) | `LICENSE` |
| `d3-brush` | `3.0.0` | ISC | 推移 | [upstream](https://github.com/d3/d3-brush) / [固定配布物](https://registry.npmjs.org/d3-brush/-/d3-brush-3.0.0.tgz) | `LICENSE` |
| `d3-chord` | `3.0.1` | ISC | 推移 | [upstream](https://github.com/d3/d3-chord) / [固定配布物](https://registry.npmjs.org/d3-chord/-/d3-chord-3.0.1.tgz) | `LICENSE` |
| `d3-color` | `3.1.0` | ISC | 推移 | [upstream](https://github.com/d3/d3-color) / [固定配布物](https://registry.npmjs.org/d3-color/-/d3-color-3.1.0.tgz) | `LICENSE` |
| `d3-contour` | `4.0.2` | ISC | 推移 | [upstream](https://github.com/d3/d3-contour) / [固定配布物](https://registry.npmjs.org/d3-contour/-/d3-contour-4.0.2.tgz) | `LICENSE` |
| `d3-delaunay` | `6.0.4` | ISC | 推移 | [upstream](https://github.com/d3/d3-delaunay) / [固定配布物](https://registry.npmjs.org/d3-delaunay/-/d3-delaunay-6.0.4.tgz) | `LICENSE` |
| `d3-dispatch` | `3.0.1` | ISC | 推移 | [upstream](https://github.com/d3/d3-dispatch) / [固定配布物](https://registry.npmjs.org/d3-dispatch/-/d3-dispatch-3.0.1.tgz) | `LICENSE` |
| `d3-drag` | `3.0.0` | ISC | 推移 | [upstream](https://github.com/d3/d3-drag) / [固定配布物](https://registry.npmjs.org/d3-drag/-/d3-drag-3.0.0.tgz) | `LICENSE` |
| `d3-dsv` | `3.0.1` | ISC | 推移 | [upstream](https://github.com/d3/d3-dsv) / [固定配布物](https://registry.npmjs.org/d3-dsv/-/d3-dsv-3.0.1.tgz) | `LICENSE` |
| `d3-ease` | `3.0.1` | BSD-3-Clause | 推移 | [upstream](https://github.com/d3/d3-ease) / [固定配布物](https://registry.npmjs.org/d3-ease/-/d3-ease-3.0.1.tgz) | `LICENSE` |
| `d3-fetch` | `3.0.1` | ISC | 推移 | [upstream](https://github.com/d3/d3-fetch) / [固定配布物](https://registry.npmjs.org/d3-fetch/-/d3-fetch-3.0.1.tgz) | `LICENSE` |
| `d3-force` | `3.0.0` | ISC | 推移 | [upstream](https://github.com/d3/d3-force) / [固定配布物](https://registry.npmjs.org/d3-force/-/d3-force-3.0.0.tgz) | `LICENSE` |
| `d3-format` | `3.1.2` | ISC | 推移 | [upstream](https://github.com/d3/d3-format) / [固定配布物](https://registry.npmjs.org/d3-format/-/d3-format-3.1.2.tgz) | `LICENSE` |
| `d3-geo` | `3.1.1` | ISC | 推移 | [upstream](https://github.com/d3/d3-geo) / [固定配布物](https://registry.npmjs.org/d3-geo/-/d3-geo-3.1.1.tgz) | `LICENSE` |
| `d3-hierarchy` | `3.1.2` | ISC | 推移 | [upstream](https://github.com/d3/d3-hierarchy) / [固定配布物](https://registry.npmjs.org/d3-hierarchy/-/d3-hierarchy-3.1.2.tgz) | `LICENSE` |
| `d3-interpolate` | `3.0.1` | ISC | 推移 | [upstream](https://github.com/d3/d3-interpolate) / [固定配布物](https://registry.npmjs.org/d3-interpolate/-/d3-interpolate-3.0.1.tgz) | `LICENSE` |
| `d3-path` | `3.1.0` | ISC | 推移 | [upstream](https://github.com/d3/d3-path) / [固定配布物](https://registry.npmjs.org/d3-path/-/d3-path-3.1.0.tgz) | `LICENSE` |
| `d3-polygon` | `3.0.1` | ISC | 推移 | [upstream](https://github.com/d3/d3-polygon) / [固定配布物](https://registry.npmjs.org/d3-polygon/-/d3-polygon-3.0.1.tgz) | `LICENSE` |
| `d3-quadtree` | `3.0.1` | ISC | 推移 | [upstream](https://github.com/d3/d3-quadtree) / [固定配布物](https://registry.npmjs.org/d3-quadtree/-/d3-quadtree-3.0.1.tgz) | `LICENSE` |
| `d3-random` | `3.0.1` | ISC | 推移 | [upstream](https://github.com/d3/d3-random) / [固定配布物](https://registry.npmjs.org/d3-random/-/d3-random-3.0.1.tgz) | `LICENSE` |
| `d3-sankey` | `0.12.3` | BSD-3-Clause | 推移 | [upstream](https://github.com/d3/d3-sankey) / [固定配布物](https://registry.npmjs.org/d3-sankey/-/d3-sankey-0.12.3.tgz) | `LICENSE` |
| `d3-array` | `2.12.1` | BSD-3-Clause | 推移 | [upstream](https://github.com/d3/d3-array) / [固定配布物](https://registry.npmjs.org/d3-array/-/d3-array-2.12.1.tgz) | `LICENSE` |
| `d3-path` | `1.0.9` | BSD-3-Clause | 推移 | [upstream](https://github.com/d3/d3-path) / [固定配布物](https://registry.npmjs.org/d3-path/-/d3-path-1.0.9.tgz) | `LICENSE` |
| `d3-shape` | `1.3.7` | BSD-3-Clause | 推移 | [upstream](https://github.com/d3/d3-shape) / [固定配布物](https://registry.npmjs.org/d3-shape/-/d3-shape-1.3.7.tgz) | `LICENSE` |
| `internmap` | `1.0.1` | ISC | 推移 | [upstream](https://github.com/mbostock/internmap) / [固定配布物](https://registry.npmjs.org/internmap/-/internmap-1.0.1.tgz) | `LICENSE` |
| `d3-scale` | `4.0.2` | ISC | 推移 | [upstream](https://github.com/d3/d3-scale) / [固定配布物](https://registry.npmjs.org/d3-scale/-/d3-scale-4.0.2.tgz) | `LICENSE` |
| `d3-scale-chromatic` | `3.1.0` | ISC | 推移 | [upstream](https://github.com/d3/d3-scale-chromatic) / [固定配布物](https://registry.npmjs.org/d3-scale-chromatic/-/d3-scale-chromatic-3.1.0.tgz) | `LICENSE` |
| `d3-selection` | `3.0.0` | ISC | 推移 | [upstream](https://github.com/d3/d3-selection) / [固定配布物](https://registry.npmjs.org/d3-selection/-/d3-selection-3.0.0.tgz) | `LICENSE` |
| `d3-shape` | `3.2.0` | ISC | 推移 | [upstream](https://github.com/d3/d3-shape) / [固定配布物](https://registry.npmjs.org/d3-shape/-/d3-shape-3.2.0.tgz) | `LICENSE` |
| `d3-time` | `3.1.0` | ISC | 推移 | [upstream](https://github.com/d3/d3-time) / [固定配布物](https://registry.npmjs.org/d3-time/-/d3-time-3.1.0.tgz) | `LICENSE` |
| `d3-time-format` | `4.1.0` | ISC | 推移 | [upstream](https://github.com/d3/d3-time-format) / [固定配布物](https://registry.npmjs.org/d3-time-format/-/d3-time-format-4.1.0.tgz) | `LICENSE` |
| `d3-timer` | `3.0.1` | ISC | 推移 | [upstream](https://github.com/d3/d3-timer) / [固定配布物](https://registry.npmjs.org/d3-timer/-/d3-timer-3.0.1.tgz) | `LICENSE` |
| `d3-transition` | `3.0.1` | ISC | 推移 | [upstream](https://github.com/d3/d3-transition) / [固定配布物](https://registry.npmjs.org/d3-transition/-/d3-transition-3.0.1.tgz) | `LICENSE` |
| `d3-zoom` | `3.0.0` | ISC | 推移 | [upstream](https://github.com/d3/d3-zoom) / [固定配布物](https://registry.npmjs.org/d3-zoom/-/d3-zoom-3.0.0.tgz) | `LICENSE` |
| `dagre-d3-es` | `7.0.14` | MIT | 推移 | [upstream](https://github.com/tbo47/dagre-es) / [固定配布物](https://registry.npmjs.org/dagre-d3-es/-/dagre-d3-es-7.0.14.tgz) | `LICENSE.md` |
| `dayjs` | `1.11.23` | MIT | 推移 | [upstream](https://github.com/iamkun/dayjs) / [固定配布物](https://registry.npmjs.org/dayjs/-/dayjs-1.11.23.tgz) | `LICENSE` |
| `delaunator` | `5.1.0` | ISC | 推移 | [upstream](https://github.com/mapbox/delaunator) / [固定配布物](https://registry.npmjs.org/delaunator/-/delaunator-5.1.0.tgz) | `LICENSE` |
| `dompurify` | `3.4.15` | (MPL-2.0 OR Apache-2.0) | 推移 | [upstream](https://github.com/cure53/DOMPurify) / [固定配布物](https://registry.npmjs.org/dompurify/-/dompurify-3.4.15.tgz) | `LICENSE`, `LICENSE-MPL` |
| `elkjs` | `0.12.0` | EPL-2.0 OR GPL-3.0-or-later | 直接 | [upstream](https://github.com/kieler/elkjs) / [固定配布物](https://registry.npmjs.org/elkjs/-/elkjs-0.12.0.tgz) | `LICENSE.md` |
| `es-toolkit` | `1.52.0` | MIT | 推移 | [upstream](https://github.com/toss/es-toolkit) / [固定配布物](https://registry.npmjs.org/es-toolkit/-/es-toolkit-1.52.0.tgz) | `LICENSE`, `NOTICE` |
| `fastdom` | `1.0.12` | MIT | 推移 | [upstream](https://github.com/wilsonpage/fastdom) / [固定配布物](https://registry.npmjs.org/fastdom/-/fastdom-1.0.12.tgz) | `README.md (License section)` |
| `hachure-fill` | `0.5.2` | MIT | 推移 | [upstream](https://github.com/pshihn/hachure-fill) / [固定配布物](https://registry.npmjs.org/hachure-fill/-/hachure-fill-0.5.2.tgz) | `LICENSE` |
| `iconv-lite` | `0.6.3` | MIT | 推移 | [upstream](https://github.com/ashtuchkin/iconv-lite) / [固定配布物](https://registry.npmjs.org/iconv-lite/-/iconv-lite-0.6.3.tgz) | `LICENSE` |
| `import-meta-resolve` | `4.2.0` | MIT | 推移 | [固定配布物](https://registry.npmjs.org/import-meta-resolve/-/import-meta-resolve-4.2.0.tgz) | `license` |
| `internmap` | `2.0.3` | ISC | 推移 | [upstream](https://github.com/mbostock/internmap) / [固定配布物](https://registry.npmjs.org/internmap/-/internmap-2.0.3.tgz) | `LICENSE` |
| `katex` | `0.16.47` | MIT | 推移 | [upstream](https://github.com/KaTeX/KaTeX) / [固定配布物](https://registry.npmjs.org/katex/-/katex-0.16.47.tgz) | `LICENSE` |
| `commander` | `8.3.0` | MIT | 推移 | [upstream](https://github.com/tj/commander.js) / [固定配布物](https://registry.npmjs.org/commander/-/commander-8.3.0.tgz) | `LICENSE` |
| `khroma` | `2.1.0` | MIT | 推移 | [upstream](https://github.com/fabiospampinato/khroma) / [固定配布物](https://registry.npmjs.org/khroma/-/khroma-2.1.0.tgz) | `license` |
| `layout-base` | `1.0.2` | MIT | 推移 | [upstream](https://github.com/iVis-at-Bilkent/layout-base) / [固定配布物](https://registry.npmjs.org/layout-base/-/layout-base-1.0.2.tgz) | `LICENSE` |
| `lodash-es` | `4.18.1` | MIT | 推移 | [固定配布物](https://registry.npmjs.org/lodash-es/-/lodash-es-4.18.1.tgz) | `LICENSE` |
| `marked` | `16.4.2` | MIT | 推移 | [upstream](https://github.com/markedjs/marked) / [固定配布物](https://registry.npmjs.org/marked/-/marked-16.4.2.tgz) | `LICENSE.md` |
| `mermaid` | `11.17.2` | MIT | 直接 | [upstream](https://github.com/mermaid-js/mermaid) / [固定配布物](https://registry.npmjs.org/mermaid/-/mermaid-11.17.2.tgz) | `LICENSE` |
| `package-manager-detector` | `1.8.0` | MIT | 推移 | [upstream](https://github.com/antfu-collective/package-manager-detector) / [固定配布物](https://registry.npmjs.org/package-manager-detector/-/package-manager-detector-1.8.0.tgz) | `LICENSE` |
| `path-data-parser` | `0.1.0` | MIT | 推移 | [upstream](https://github.com/pshihn/path-data-parser) / [固定配布物](https://registry.npmjs.org/path-data-parser/-/path-data-parser-0.1.0.tgz) | `LICENSE` |
| `points-on-curve` | `0.2.0` | MIT | 推移 | [upstream](https://github.com/pshihn/bezier-points) / [固定配布物](https://registry.npmjs.org/points-on-curve/-/points-on-curve-0.2.0.tgz) | `LICENSE` |
| `points-on-path` | `0.2.1` | MIT | 推移 | [upstream](https://github.com/pshihn/points-on-path) / [固定配布物](https://registry.npmjs.org/points-on-path/-/points-on-path-0.2.1.tgz) | `LICENSE` |
| `react` | `19.3.0` | MIT | 直接 | [upstream](https://github.com/react/react) / [固定配布物](https://registry.npmjs.org/react/-/react-19.3.0.tgz) | `LICENSE` |
| `react-dom` | `19.3.0` | MIT | 直接 | [upstream](https://github.com/react/react) / [固定配布物](https://registry.npmjs.org/react-dom/-/react-dom-19.3.0.tgz) | `LICENSE` |
| `robust-predicates` | `3.0.3` | Unlicense | 推移 | [upstream](https://github.com/mourner/robust-predicates) / [固定配布物](https://registry.npmjs.org/robust-predicates/-/robust-predicates-3.0.3.tgz) | `LICENSE` |
| `roughjs` | `4.6.6` | MIT | 推移 | [upstream](https://github.com/pshihn/rough) / [固定配布物](https://registry.npmjs.org/roughjs/-/roughjs-4.6.6.tgz) | `LICENSE` |
| `rw` | `1.3.3` | BSD-3-Clause | 推移 | [upstream](http://github.com/mbostock/rw) / [固定配布物](https://registry.npmjs.org/rw/-/rw-1.3.3.tgz) | `LICENSE` |
| `safer-buffer` | `2.1.2` | MIT | 推移 | [upstream](https://github.com/ChALkeR/safer-buffer) / [固定配布物](https://registry.npmjs.org/safer-buffer/-/safer-buffer-2.1.2.tgz) | `LICENSE` |
| `scheduler` | `0.28.0` | MIT | 推移 | [upstream](https://github.com/react/react) / [固定配布物](https://registry.npmjs.org/scheduler/-/scheduler-0.28.0.tgz) | `LICENSE` |
| `strictdom` | `1.0.1` | MIT | 推移 | [upstream](https://github.com/wilsonpage/strictdom) / [固定配布物](https://registry.npmjs.org/strictdom/-/strictdom-1.0.1.tgz) | `README.md (License section)` |
| `stylis` | `4.4.0` | MIT | 推移 | [upstream](https://github.com/thysultan/stylis.js) / [固定配布物](https://registry.npmjs.org/stylis/-/stylis-4.4.0.tgz) | `LICENSE` |
| `tinyexec` | `1.3.1` | MIT | 推移 | [upstream](https://github.com/tinylibs/tinyexec) / [固定配布物](https://registry.npmjs.org/tinyexec/-/tinyexec-1.3.1.tgz) | `LICENSE` |
| `ts-dedent` | `2.3.0` | MIT | 推移 | [upstream](https://github.com/tamino-martinius/node-ts-dedent) / [固定配布物](https://registry.npmjs.org/ts-dedent/-/ts-dedent-2.3.0.tgz) | `LICENSE` |
| `use-sync-external-store` | `1.7.0` | MIT | 推移 | [upstream](https://github.com/react/react) / [固定配布物](https://registry.npmjs.org/use-sync-external-store/-/use-sync-external-store-1.7.0.tgz) | `LICENSE` |
| `uuid` | `14.0.2` | MIT | 推移 | [upstream](https://github.com/uuidjs/uuid) / [固定配布物](https://registry.npmjs.org/uuid/-/uuid-14.0.2.tgz) | `LICENSE.md` |
| `zod` | `4.6.5` | MIT | 直接 | [upstream](https://github.com/colinhacks/zod) / [固定配布物](https://registry.npmjs.org/zod/-/zod-4.6.5.tgz) | `LICENSE` |
| `zustand` | `5.0.15` | MIT | 直接 | [upstream](https://github.com/pmndrs/zustand) / [固定配布物](https://registry.npmjs.org/zustand/-/zustand-5.0.15.tgz) | `LICENSE` |

## npm 直接開発依存

| Package | Version | License | 出所 | 本文・証跡 |
| --- | --- | --- | --- | --- |
| `@eslint/js` | `10.0.1` | MIT | [upstream](https://github.com/eslint/eslint) / [固定配布物](https://registry.npmjs.org/@eslint/js/-/js-10.0.1.tgz) | `LICENSE` |
| `@playwright/test` | `1.63.0` | Apache-2.0 | [upstream](https://github.com/microsoft/playwright) / [固定配布物](https://registry.npmjs.org/@playwright/test/-/test-1.63.0.tgz) | `LICENSE`, `NOTICE` |
| `@tauri-apps/cli` | `2.11.5` | Apache-2.0 OR MIT | [upstream](https://github.com/tauri-apps/tauri) / [固定配布物](https://registry.npmjs.org/@tauri-apps/cli/-/cli-2.11.5.tgz) | `LICENSE_APACHE-2.0`, `LICENSE_MIT` |
| `@testing-library/jest-dom` | `7.0.1` | MIT | [upstream](https://github.com/testing-library/jest-dom) / [固定配布物](https://registry.npmjs.org/@testing-library/jest-dom/-/jest-dom-7.0.1.tgz) | `LICENSE` |
| `@testing-library/react` | `16.3.3` | MIT | [upstream](https://github.com/testing-library/react-testing-library) / [固定配布物](https://registry.npmjs.org/@testing-library/react/-/react-16.3.3.tgz) | `LICENSE` |
| `@testing-library/user-event` | `14.6.7` | MIT | [upstream](https://github.com/testing-library/user-event) / [固定配布物](https://registry.npmjs.org/@testing-library/user-event/-/user-event-14.6.7.tgz) | `LICENSE` |
| `@types/node` | `24.5.2` | MIT | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/node/-/node-24.5.2.tgz) | `LICENSE` |
| `@types/react` | `19.3.0` | MIT | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/react/-/react-19.3.0.tgz) | `LICENSE` |
| `@types/react-dom` | `19.3.0` | MIT | [upstream](https://github.com/DefinitelyTyped/DefinitelyTyped) / [固定配布物](https://registry.npmjs.org/@types/react-dom/-/react-dom-19.3.0.tgz) | `LICENSE` |
| `@vitejs/plugin-react` | `5.0.3` | MIT | [upstream](https://github.com/vitejs/vite-plugin-react) / [固定配布物](https://registry.npmjs.org/@vitejs/plugin-react/-/plugin-react-5.0.3.tgz) | `LICENSE` |
| `eslint` | `10.11.0` | MIT | [固定配布物](https://registry.npmjs.org/eslint/-/eslint-10.11.0.tgz) | `LICENSE` |
| `eslint-plugin-react-hooks` | `7.1.1` | MIT | [upstream](https://github.com/facebook/react) / [固定配布物](https://registry.npmjs.org/eslint-plugin-react-hooks/-/eslint-plugin-react-hooks-7.1.1.tgz) | `LICENSE` |
| `eslint-plugin-react-refresh` | `0.5.7` | MIT | [upstream](https://github.com/ArnaudBarre/eslint-plugin-react-refresh) / [固定配布物](https://registry.npmjs.org/eslint-plugin-react-refresh/-/eslint-plugin-react-refresh-0.5.7.tgz) | `LICENSE` |
| `globals` | `17.12.0` | MIT | [固定配布物](https://registry.npmjs.org/globals/-/globals-17.12.0.tgz) | `license` |
| `jsdom` | `30.1.0` | MIT | [upstream](https://github.com/jsdom/jsdom) / [固定配布物](https://registry.npmjs.org/jsdom/-/jsdom-30.1.0.tgz) | `LICENSE.txt` |
| `tsx` | `4.23.15` | MIT | [固定配布物](https://registry.npmjs.org/tsx/-/tsx-4.23.15.tgz) | `LICENSE` |
| `typescript` | `6.0.3` | Apache-2.0 | [upstream](https://github.com/microsoft/TypeScript) / [固定配布物](https://registry.npmjs.org/typescript/-/typescript-6.0.3.tgz) | `LICENSE.txt` |
| `typescript-eslint` | `8.70.1` | MIT | [upstream](https://github.com/typescript-eslint/typescript-eslint) / [固定配布物](https://registry.npmjs.org/typescript-eslint/-/typescript-eslint-8.70.1.tgz) | `LICENSE` |
| `vite` | `7.3.6` | MIT | [upstream](https://github.com/vitejs/vite) / [固定配布物](https://registry.npmjs.org/vite/-/vite-7.3.6.tgz) | `LICENSE.md` |
| `vitest` | `5.0.1` | MIT | [upstream](https://github.com/vitest-dev/vitest) / [固定配布物](https://registry.npmjs.org/vitest/-/vitest-5.0.1.tgz) | `LICENSE.md` |

## Rust 直接依存

| Crate | Version | License | 関係 | 出所 | 本文・証跡 |
| --- | --- | --- | --- | --- | --- |
| `rfd` | `0.17.2` | MIT | 直接 | [crate](https://crates.io/crates/rfd/0.17.2) / [upstream](https://github.com/PolyMeilex/rfd) | `LICENSE` |
| `serde` | `1.0.229` | MIT OR Apache-2.0 | 直接 | [crate](https://crates.io/crates/serde/1.0.229) / [upstream](https://github.com/serde-rs/serde) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `serde_json` | `1.0.151` | MIT OR Apache-2.0 | 直接 | [crate](https://crates.io/crates/serde_json/1.0.151) / [upstream](https://github.com/serde-rs/json) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `sha2` | `0.10.9` | MIT OR Apache-2.0 | 直接 | [crate](https://crates.io/crates/sha2/0.10.9) / [upstream](https://github.com/RustCrypto/hashes) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `tauri` | `2.11.6` | Apache-2.0 OR MIT | 直接 | [crate](https://crates.io/crates/tauri/2.11.6) / [upstream](https://github.com/tauri-apps/tauri) | `LICENSE_APACHE-2.0`, `LICENSE_MIT` |
| `tauri-build` | `2.6.3` | Apache-2.0 OR MIT | 直接 build | [crate](https://crates.io/crates/tauri-build/2.6.3) / [upstream](https://github.com/tauri-apps/tauri) | `LICENSE_APACHE-2.0`, `LICENSE_MIT` |
| `tauri-plugin-clipboard-manager` | `2.3.3` | Apache-2.0 OR MIT | 直接 | [crate](https://crates.io/crates/tauri-plugin-clipboard-manager/2.3.3) / [upstream](https://github.com/tauri-apps/plugins-workspace) | `LICENSE.spdx`, `LICENSE_APACHE-2.0`, `LICENSE_MIT` |
| `uuid` | `1.26.1` | Apache-2.0 OR MIT | 直接 | [crate](https://crates.io/crates/uuid/1.26.1) / [upstream](https://github.com/uuid-rs/uuid) | `LICENSE-APACHE`, `LICENSE-MIT` |

## Rust Windows 解決グラフ全件

直接依存も再掲する。license の AND / OR および古いスラッシュ表記は upstream の宣言をそのまま記載しており、単一ライセンスへ正規化していない。

| Crate | Version | License | 関係 | 出所 | 本文・証跡 |
| --- | --- | --- | --- | --- | --- |
| `adler2` | `2.0.1` | 0BSD OR MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/adler2/2.0.1) / [upstream](https://github.com/oyvindln/adler2) | `LICENSE-0BSD`, `LICENSE-APACHE`, `LICENSE-MIT` |
| `aho-corasick` | `1.1.5` | Unlicense OR MIT | 推移 | [crate](https://crates.io/crates/aho-corasick/1.1.5) / [upstream](https://github.com/BurntSushi/aho-corasick) | `COPYING`, `LICENSE-MIT` |
| `alloc-no-stdlib` | `2.0.4` | BSD-3-Clause | 推移 | [crate](https://crates.io/crates/alloc-no-stdlib/2.0.4) / [upstream](https://github.com/dropbox/rust-alloc-no-stdlib) | `LICENSE` |
| `alloc-stdlib` | `0.2.4` | BSD-3-Clause | 推移 | [crate](https://crates.io/crates/alloc-stdlib/0.2.4) / [upstream](https://github.com/dropbox/rust-alloc-no-stdlib) | Cargo.toml の license 宣言のみ（本文未収集） |
| `anyhow` | `1.0.104` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/anyhow/1.0.104) / [upstream](https://github.com/dtolnay/anyhow) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `arboard` | `3.6.1` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/arboard/3.6.1) / [upstream](https://github.com/1Password/arboard) | `LICENSE-APACHE.txt`, `LICENSE-MIT.txt` |
| `autocfg` | `1.5.1` | Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/autocfg/1.5.1) / [upstream](https://github.com/cuviper/autocfg) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `base64` | `0.22.1` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/base64/0.22.1) / [upstream](https://github.com/marshallpierce/rust-base64) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `base64` | `0.23.1` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/base64/0.23.1) / [upstream](https://github.com/marshallpierce/rust-base64) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `bit-set` | `0.8.0` | Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/bit-set/0.8.0) / [upstream](https://github.com/contain-rs/bit-set) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `bit-vec` | `0.8.0` | Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/bit-vec/0.8.0) / [upstream](https://github.com/contain-rs/bit-vec) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `bitflags` | `1.3.2` | MIT/Apache-2.0 | 推移 | [crate](https://crates.io/crates/bitflags/1.3.2) / [upstream](https://github.com/bitflags/bitflags) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `bitflags` | `2.13.2` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/bitflags/2.13.2) / [upstream](https://github.com/bitflags/bitflags) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `block-buffer` | `0.10.4` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/block-buffer/0.10.4) / [upstream](https://github.com/RustCrypto/utils) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `brotli` | `8.0.4` | BSD-3-Clause AND MIT | 推移 | [crate](https://crates.io/crates/brotli/8.0.4) / [upstream](https://github.com/dropbox/rust-brotli) | `LICENSE.BSD-3-Clause`, `LICENSE.MIT` |
| `brotli-decompressor` | `5.0.3` | BSD-3-Clause/MIT | 推移 | [crate](https://crates.io/crates/brotli-decompressor/5.0.3) / [upstream](https://github.com/dropbox/rust-brotli-decompressor) | `LICENSE` |
| `bs58` | `0.5.1` | MIT/Apache-2.0 | 推移 | [crate](https://crates.io/crates/bs58/0.5.1) / [upstream](https://github.com/Nullus157/bs58-rs) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `bytemuck` | `1.25.2` | Zlib OR Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/bytemuck/1.25.2) / [upstream](https://github.com/Lokathor/bytemuck) | `LICENSE-APACHE`, `LICENSE-MIT`, `LICENSE-ZLIB` |
| `byteorder` | `1.5.0` | Unlicense OR MIT | 推移 | [crate](https://crates.io/crates/byteorder/1.5.0) / [upstream](https://github.com/BurntSushi/byteorder) | `COPYING`, `LICENSE-MIT` |
| `byteorder-lite` | `0.1.0` | Unlicense OR MIT | 推移 | [crate](https://crates.io/crates/byteorder-lite/0.1.0) / [upstream](https://github.com/image-rs/byteorder-lite) | `LICENSE-MIT` |
| `bytes` | `1.12.1` | MIT | 推移 | [crate](https://crates.io/crates/bytes/1.12.1) / [upstream](https://github.com/tokio-rs/bytes) | `LICENSE` |
| `camino` | `1.2.6` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/camino/1.2.6) / [upstream](https://github.com/camino-rs/camino) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `cargo-platform` | `0.1.9` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/cargo-platform/0.1.9) / [upstream](https://github.com/rust-lang/cargo) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `cargo_metadata` | `0.19.2` | MIT | 推移 | [crate](https://crates.io/crates/cargo_metadata/0.19.2) / [upstream](https://github.com/oli-obk/cargo_metadata) | `LICENSE-MIT` |
| `cargo_toml` | `0.22.3` | Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/cargo_toml/0.22.3) / [upstream](https://gitlab.com/lib.rs/cargo_toml) | `LICENSE` |
| `cc` | `1.4.7` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/cc/1.4.7) / [upstream](https://github.com/rust-lang/cc-rs) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `cfb` | `0.7.3` | MIT | 推移 | [crate](https://crates.io/crates/cfb/0.7.3) / [upstream](https://github.com/mdsteele/rust-cfb) | `LICENSE` |
| `cfg-if` | `1.0.5` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/cfg-if/1.0.5) / [upstream](https://github.com/rust-lang/cfg-if) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `chrono` | `0.4.45` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/chrono/0.4.45) / [upstream](https://github.com/chronotope/chrono) | `LICENSE.txt` |
| `clipboard-win` | `5.4.1` | BSL-1.0 | 推移 | [crate](https://crates.io/crates/clipboard-win/5.4.1) / [upstream](https://github.com/DoumanAsh/clipboard-win) | Cargo.toml の license 宣言のみ（本文未収集） |
| `cookie` | `0.18.2` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/cookie/0.18.2) / [upstream](https://github.com/SergioBenitez/cookie-rs) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `cpufeatures` | `0.2.17` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/cpufeatures/0.2.17) / [upstream](https://github.com/RustCrypto/utils) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `crc32fast` | `1.5.2` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/crc32fast/1.5.2) / [upstream](https://github.com/srijs/rust-crc32fast) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `crossbeam-channel` | `0.5.17` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/crossbeam-channel/0.5.17) / [upstream](https://github.com/crossbeam-rs/crossbeam) | `LICENSE-APACHE`, `LICENSE-MIT`, `LICENSE-THIRD-PARTY` |
| `crossbeam-utils` | `0.8.23` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/crossbeam-utils/0.8.23) / [upstream](https://github.com/crossbeam-rs/crossbeam) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `crypto-common` | `0.1.7` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/crypto-common/0.1.7) / [upstream](https://github.com/RustCrypto/traits) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `cssparser` | `0.36.0` | MPL-2.0 | 推移 | [crate](https://crates.io/crates/cssparser/0.36.0) / [upstream](https://github.com/servo/rust-cssparser) | `LICENSE` |
| `cssparser-macros` | `0.6.1` | MPL-2.0 | 推移 | [crate](https://crates.io/crates/cssparser-macros/0.6.1) / [upstream](https://github.com/servo/rust-cssparser) | `LICENSE` |
| `ctor` | `0.8.0` | Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/ctor/0.8.0) / [upstream](https://github.com/mmastrac/rust-ctor) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `ctor-proc-macro` | `0.0.7` | Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/ctor-proc-macro/0.0.7) / [upstream](https://github.com/mmastrac/rust-ctor) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `darling` | `0.24.1` | MIT | 推移 | [crate](https://crates.io/crates/darling/0.24.1) / [upstream](https://github.com/TedDriggs/darling) | `LICENSE` |
| `darling_core` | `0.24.1` | MIT | 推移 | [crate](https://crates.io/crates/darling_core/0.24.1) / [upstream](https://github.com/TedDriggs/darling) | `LICENSE` |
| `darling_macro` | `0.24.1` | MIT | 推移 | [crate](https://crates.io/crates/darling_macro/0.24.1) / [upstream](https://github.com/TedDriggs/darling) | `LICENSE` |
| `defmt` | `1.1.1` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/defmt/1.1.1) / [upstream](https://github.com/knurling-rs/defmt) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `defmt-macros` | `1.1.1` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/defmt-macros/1.1.1) / [upstream](https://github.com/knurling-rs/defmt) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `defmt-parser` | `1.0.0` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/defmt-parser/1.0.0) / [upstream](https://github.com/knurling-rs/defmt) | Cargo.toml の license 宣言のみ（本文未収集） |
| `deranged` | `0.5.8` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/deranged/0.5.8) / [upstream](https://github.com/jhpratt/deranged) | `LICENSE-Apache`, `LICENSE-MIT` |
| `derive_more` | `2.1.1` | MIT | 推移 | [crate](https://crates.io/crates/derive_more/2.1.1) / [upstream](https://github.com/JelteF/derive_more) | `LICENSE` |
| `derive_more-impl` | `2.1.1` | MIT | 推移 | [crate](https://crates.io/crates/derive_more-impl/2.1.1) / [upstream](https://github.com/JelteF/derive_more) | `LICENSE` |
| `digest` | `0.10.7` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/digest/0.10.7) / [upstream](https://github.com/RustCrypto/traits) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `dirs` | `6.0.0` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/dirs/6.0.0) / [upstream](https://github.com/soc/dirs-rs) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `dirs-sys` | `0.5.0` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/dirs-sys/0.5.0) / [upstream](https://github.com/dirs-dev/dirs-sys-rs) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `displaydoc` | `0.2.7` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/displaydoc/0.2.7) / [upstream](https://github.com/yaahc/displaydoc) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `dom_query` | `0.27.0` | MIT | 推移 | [crate](https://crates.io/crates/dom_query/0.27.0) / [upstream](https://github.com/niklak/dom_query) | `LICENSE` |
| `dpi` | `0.1.2` | Apache-2.0 AND MIT | 推移 | [crate](https://crates.io/crates/dpi/0.1.2) / [upstream](https://github.com/rust-windowing/winit) | `LICENSE`, `LICENSE-LIBM-MIT` |
| `dtoa` | `1.0.11` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/dtoa/1.0.11) / [upstream](https://github.com/dtolnay/dtoa) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `dtoa-short` | `0.3.5` | MPL-2.0 | 推移 | [crate](https://crates.io/crates/dtoa-short/0.3.5) / [upstream](https://github.com/upsuper/dtoa-short) | `LICENSE` |
| `dtor` | `0.3.0` | Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/dtor/0.3.0) / [upstream](https://github.com/mmastrac/rust-ctor) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `dtor-proc-macro` | `0.0.6` | Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/dtor-proc-macro/0.0.6) / [upstream](https://github.com/mmastrac/rust-ctor) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `dunce` | `1.0.5` | CC0-1.0 OR MIT-0 OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/dunce/1.0.5) / [upstream](https://gitlab.com/kornelski/dunce) | `LICENSE` |
| `dyn-clone` | `1.0.20` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/dyn-clone/1.0.20) / [upstream](https://github.com/dtolnay/dyn-clone) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `embed-resource` | `3.0.11` | MIT | 推移 | [crate](https://crates.io/crates/embed-resource/3.0.11) / [upstream](https://github.com/nabijaczleweli/rust-embed-resource) | `LICENSE` |
| `equivalent` | `1.0.2` | Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/equivalent/1.0.2) / [upstream](https://github.com/indexmap-rs/equivalent) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `erased-serde` | `0.4.10` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/erased-serde/0.4.10) / [upstream](https://github.com/dtolnay/erased-serde) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `error-code` | `3.4.0` | BSL-1.0 | 推移 | [crate](https://crates.io/crates/error-code/3.4.0) / [upstream](https://github.com/DoumanAsh/error-code) | `LICENSE` |
| `fastrand` | `2.5.0` | Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/fastrand/2.5.0) / [upstream](https://github.com/smol-rs/fastrand) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `fax` | `0.2.7` | MIT | 推移 | [crate](https://crates.io/crates/fax/0.2.7) / [upstream](https://github.com/pdf-rs/fax) | `LICENSE` |
| `fdeflate` | `0.3.7` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/fdeflate/0.3.7) / [upstream](https://github.com/image-rs/fdeflate) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `find-msvc-tools` | `0.1.13` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/find-msvc-tools/0.1.13) / [upstream](https://github.com/rust-lang/cc-rs) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `flate2` | `1.1.10` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/flate2/1.1.10) / [upstream](https://github.com/rust-lang/flate2-rs) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `fnv` | `1.0.7` | Apache-2.0 / MIT | 推移 | [crate](https://crates.io/crates/fnv/1.0.7) / [upstream](https://github.com/servo/rust-fnv) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `foldhash` | `0.2.0` | Zlib | 推移 | [crate](https://crates.io/crates/foldhash/0.2.0) / [upstream](https://github.com/orlp/foldhash) | `LICENSE` |
| `form_urlencoded` | `1.2.2` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/form_urlencoded/1.2.2) / [upstream](https://github.com/servo/rust-url) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `generic-array` | `0.14.7` | MIT | 推移 | [crate](https://crates.io/crates/generic-array/0.14.7) / [upstream](https://github.com/fizyk20/generic-array) | `LICENSE` |
| `getrandom` | `0.3.4` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/getrandom/0.3.4) / [upstream](https://github.com/rust-random/getrandom) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `getrandom` | `0.4.3` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/getrandom/0.4.3) / [upstream](https://github.com/rust-random/getrandom) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `glob` | `0.3.4` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/glob/0.3.4) / [upstream](https://github.com/rust-lang/glob) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `half` | `2.7.1` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/half/2.7.1) / [upstream](https://github.com/VoidStarKat/half-rs) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `hashbrown` | `0.12.3` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/hashbrown/0.12.3) / [upstream](https://github.com/rust-lang/hashbrown) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `hashbrown` | `0.17.1` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/hashbrown/0.17.1) / [upstream](https://github.com/rust-lang/hashbrown) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `heck` | `0.5.0` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/heck/0.5.0) / [upstream](https://github.com/withoutboats/heck) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `hex` | `0.4.3` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/hex/0.4.3) / [upstream](https://github.com/KokaKiwi/rust-hex) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `html5ever` | `0.38.0` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/html5ever/0.38.0) / [upstream](https://github.com/servo/html5ever) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `http` | `1.5.0` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/http/1.5.0) / [upstream](https://github.com/hyperium/http) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `ico` | `0.5.0` | MIT | 推移 | [crate](https://crates.io/crates/ico/0.5.0) / [upstream](https://github.com/mdsteele/rust-ico) | `LICENSE` |
| `icu_collections` | `2.3.0` | Unicode-3.0 | 推移 | [crate](https://crates.io/crates/icu_collections/2.3.0) / [upstream](https://github.com/unicode-org/icu4x) | `LICENSE` |
| `icu_locale_core` | `2.3.0` | Unicode-3.0 | 推移 | [crate](https://crates.io/crates/icu_locale_core/2.3.0) / [upstream](https://github.com/unicode-org/icu4x) | `LICENSE` |
| `icu_normalizer` | `2.3.0` | Unicode-3.0 | 推移 | [crate](https://crates.io/crates/icu_normalizer/2.3.0) / [upstream](https://github.com/unicode-org/icu4x) | `LICENSE` |
| `icu_normalizer_data` | `2.3.0` | Unicode-3.0 | 推移 | [crate](https://crates.io/crates/icu_normalizer_data/2.3.0) / [upstream](https://github.com/unicode-org/icu4x) | `LICENSE` |
| `icu_properties` | `2.3.0` | Unicode-3.0 | 推移 | [crate](https://crates.io/crates/icu_properties/2.3.0) / [upstream](https://github.com/unicode-org/icu4x) | `LICENSE` |
| `icu_properties_data` | `2.3.0` | Unicode-3.0 | 推移 | [crate](https://crates.io/crates/icu_properties_data/2.3.0) / [upstream](https://github.com/unicode-org/icu4x) | `LICENSE` |
| `icu_provider` | `2.3.1` | Unicode-3.0 | 推移 | [crate](https://crates.io/crates/icu_provider/2.3.1) / [upstream](https://github.com/unicode-org/icu4x) | `LICENSE` |
| `ident_case` | `1.0.1` | MIT/Apache-2.0 | 推移 | [crate](https://crates.io/crates/ident_case/1.0.1) / [upstream](https://github.com/TedDriggs/ident_case) | `LICENSE` |
| `idna` | `1.1.0` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/idna/1.1.0) / [upstream](https://github.com/servo/rust-url/) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `idna_adapter` | `1.2.2` | Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/idna_adapter/1.2.2) / [upstream](https://github.com/hsivonen/idna_adapter) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `image` | `0.25.10` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/image/0.25.10) / [upstream](https://github.com/image-rs/image) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `indexmap` | `1.9.3` | Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/indexmap/1.9.3) / [upstream](https://github.com/bluss/indexmap) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `indexmap` | `2.14.2` | Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/indexmap/2.14.2) / [upstream](https://github.com/indexmap-rs/indexmap) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `infer` | `0.19.0` | MIT | 推移 | [crate](https://crates.io/crates/infer/0.19.0) / [upstream](https://github.com/bojand/infer) | `LICENSE` |
| `itoa` | `1.0.18` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/itoa/1.0.18) / [upstream](https://github.com/dtolnay/itoa) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `jiff` | `0.2.37` | Unlicense OR MIT | 推移 | [crate](https://crates.io/crates/jiff/0.2.37) / [upstream](https://github.com/BurntSushi/jiff) | `COPYING`, `LICENSE-MIT` |
| `jiff-core` | `0.1.1` | Unlicense OR MIT | 推移 | [crate](https://crates.io/crates/jiff-core/0.1.1) / [upstream](https://github.com/BurntSushi/jiff) | `COPYING`, `LICENSE-MIT` |
| `jiff-tzdb` | `0.1.8` | Unlicense OR MIT | 推移 | [crate](https://crates.io/crates/jiff-tzdb/0.1.8) / [upstream](https://github.com/BurntSushi/jiff) | `COPYING`, `LICENSE-MIT` |
| `jiff-tzdb-platform` | `0.1.3` | Unlicense OR MIT | 推移 | [crate](https://crates.io/crates/jiff-tzdb-platform/0.1.3) / [upstream](https://github.com/BurntSushi/jiff) | `COPYING`, `LICENSE-MIT` |
| `json-patch` | `3.0.1` | MIT/Apache-2.0 | 推移 | [crate](https://crates.io/crates/json-patch/3.0.1) / [upstream](https://github.com/idubrov/json-patch) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `jsonptr` | `0.6.3` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/jsonptr/0.6.3) / [upstream](https://github.com/chanced/jsonptr) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `keyboard-types` | `0.7.0` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/keyboard-types/0.7.0) / [upstream](https://github.com/pyfisch/keyboard-types) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `libc` | `0.2.189` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/libc/0.2.189) / [upstream](https://github.com/rust-lang/libc) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `litemap` | `0.8.3` | Unicode-3.0 | 推移 | [crate](https://crates.io/crates/litemap/0.8.3) / [upstream](https://github.com/unicode-org/icu4x) | `LICENSE` |
| `lock_api` | `0.4.14` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/lock_api/0.4.14) / [upstream](https://github.com/Amanieu/parking_lot) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `log` | `0.4.34` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/log/0.4.34) / [upstream](https://github.com/rust-lang/log) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `markup5ever` | `0.38.0` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/markup5ever/0.38.0) / [upstream](https://github.com/servo/html5ever) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `memchr` | `2.8.3` | Unlicense OR MIT | 推移 | [crate](https://crates.io/crates/memchr/2.8.3) / [upstream](https://github.com/BurntSushi/memchr) | `COPYING`, `LICENSE-MIT` |
| `mime` | `0.3.17` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/mime/0.3.17) / [upstream](https://github.com/hyperium/mime) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `miniz_oxide` | `0.8.9` | MIT OR Zlib OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/miniz_oxide/0.8.9) / [upstream](https://github.com/Frommi/miniz_oxide/tree/master/miniz_oxide) | `LICENSE`, `LICENSE-APACHE.md`, `LICENSE-MIT.md`, `LICENSE-ZLIB.md` |
| `miniz_oxide` | `0.9.1` | MIT OR Zlib OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/miniz_oxide/0.9.1) / [upstream](https://github.com/Frommi/miniz_oxide/tree/master/miniz_oxide) | `LICENSE`, `LICENSE-APACHE.md`, `LICENSE-MIT.md`, `LICENSE-ZLIB.md` |
| `mio` | `1.2.3` | MIT | 推移 | [crate](https://crates.io/crates/mio/1.2.3) / [upstream](https://github.com/tokio-rs/mio) | `LICENSE` |
| `moxcms` | `0.8.1` | BSD-3-Clause OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/moxcms/0.8.1) / [upstream](https://github.com/awxkee/moxcms) | `LICENSE-APACHE.md`, `LICENSE.md` |
| `muda` | `0.19.3` | Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/muda/0.19.3) / [upstream](https://github.com/tauri-apps/muda) | `LICENSE-APACHE`, `LICENSE-MIT`, `LICENSE.spdx` |
| `new_debug_unreachable` | `1.0.6` | MIT | 推移 | [crate](https://crates.io/crates/new_debug_unreachable/1.0.6) / [upstream](https://github.com/mbrubeck/rust-debug-unreachable) | `LICENSE-MIT` |
| `num-conv` | `0.2.2` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/num-conv/0.2.2) / [upstream](https://github.com/jhpratt/num-conv) | `LICENSE-Apache`, `LICENSE-MIT` |
| `num-traits` | `0.2.19` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/num-traits/0.2.19) / [upstream](https://github.com/rust-num/num-traits) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `once_cell` | `1.21.4` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/once_cell/1.21.4) / [upstream](https://github.com/matklad/once_cell) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `option-ext` | `0.2.0` | MPL-2.0 | 推移 | [crate](https://crates.io/crates/option-ext/0.2.0) / [upstream](https://github.com/soc/option-ext) | `LICENSE.txt` |
| `parking_lot` | `0.12.5` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/parking_lot/0.12.5) / [upstream](https://github.com/Amanieu/parking_lot) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `parking_lot_core` | `0.9.12` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/parking_lot_core/0.9.12) / [upstream](https://github.com/Amanieu/parking_lot) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `percent-encoding` | `2.3.2` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/percent-encoding/2.3.2) / [upstream](https://github.com/servo/rust-url/) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `phf` | `0.13.1` | MIT | 推移 | [crate](https://crates.io/crates/phf/0.13.1) / [upstream](https://github.com/rust-phf/rust-phf) | `LICENSE` |
| `phf_codegen` | `0.13.1` | MIT | 推移 | [crate](https://crates.io/crates/phf_codegen/0.13.1) / [upstream](https://github.com/rust-phf/rust-phf) | `LICENSE` |
| `phf_generator` | `0.13.1` | MIT | 推移 | [crate](https://crates.io/crates/phf_generator/0.13.1) / [upstream](https://github.com/rust-phf/rust-phf) | `LICENSE` |
| `phf_macros` | `0.13.1` | MIT | 推移 | [crate](https://crates.io/crates/phf_macros/0.13.1) / [upstream](https://github.com/rust-phf/rust-phf) | `LICENSE` |
| `phf_shared` | `0.13.1` | MIT | 推移 | [crate](https://crates.io/crates/phf_shared/0.13.1) / [upstream](https://github.com/rust-phf/rust-phf) | `LICENSE` |
| `pin-project-lite` | `0.2.17` | Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/pin-project-lite/0.2.17) / [upstream](https://github.com/taiki-e/pin-project-lite) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `plist` | `1.10.1` | MIT | 推移 | [crate](https://crates.io/crates/plist/1.10.1) / [upstream](https://github.com/ebarnard/rust-plist/) | `LICENCE` |
| `png` | `0.17.16` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/png/0.17.16) / [upstream](https://github.com/image-rs/image-png) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `png` | `0.18.1` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/png/0.18.1) / [upstream](https://github.com/image-rs/image-png) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `potential_utf` | `0.1.6` | Unicode-3.0 | 推移 | [crate](https://crates.io/crates/potential_utf/0.1.6) / [upstream](https://github.com/unicode-org/icu4x) | `LICENSE` |
| `powerfmt` | `0.2.0` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/powerfmt/0.2.0) / [upstream](https://github.com/jhpratt/powerfmt) | `LICENSE-Apache`, `LICENSE-MIT` |
| `precomputed-hash` | `0.1.1` | MIT | 推移 | [crate](https://crates.io/crates/precomputed-hash/0.1.1) / [upstream](https://github.com/emilio/precomputed-hash) | `LICENSE` |
| `proc-macro2` | `1.0.107` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/proc-macro2/1.0.107) / [upstream](https://github.com/dtolnay/proc-macro2) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `pxfm` | `0.1.30` | BSD-3-Clause OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/pxfm/0.1.30) / [upstream](https://github.com/awxkee/pxfm) | `LICENSE-APACHE.md`, `LICENSE.md` |
| `quick-error` | `2.0.1` | MIT/Apache-2.0 | 推移 | [crate](https://crates.io/crates/quick-error/2.0.1) / [upstream](http://github.com/tailhook/quick-error) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `quick-xml` | `0.42.0` | MIT | 推移 | [crate](https://crates.io/crates/quick-xml/0.42.0) / [upstream](https://github.com/tafia/quick-xml) | `LICENSE-MIT.md` |
| `quote` | `1.0.47` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/quote/1.0.47) / [upstream](https://github.com/dtolnay/quote) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `raw-window-handle` | `0.6.2` | MIT OR Apache-2.0 OR Zlib | 推移 | [crate](https://crates.io/crates/raw-window-handle/0.6.2) / [upstream](https://github.com/rust-windowing/raw-window-handle) | `LICENSE-APACHE.md`, `LICENSE-MIT.md`, `LICENSE-ZLIB.md` |
| `ref-cast` | `1.0.27` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/ref-cast/1.0.27) / [upstream](https://github.com/dtolnay/ref-cast) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `ref-cast-impl` | `1.0.27` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/ref-cast-impl/1.0.27) / [upstream](https://github.com/dtolnay/ref-cast) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `regex` | `1.13.1` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/regex/1.13.1) / [upstream](https://github.com/rust-lang/regex) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `regex-automata` | `0.4.18` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/regex-automata/0.4.18) / [upstream](https://github.com/rust-lang/regex) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `regex-syntax` | `0.8.11` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/regex-syntax/0.8.11) / [upstream](https://github.com/rust-lang/regex) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `rfd` | `0.17.2` | MIT | 直接 | [crate](https://crates.io/crates/rfd/0.17.2) / [upstream](https://github.com/PolyMeilex/rfd) | `LICENSE` |
| `rustc-hash` | `2.1.3` | Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/rustc-hash/2.1.3) / [upstream](https://github.com/rust-lang/rustc-hash) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `rustc_version` | `0.4.1` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/rustc_version/0.4.1) / [upstream](https://github.com/djc/rustc-version-rs) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `same-file` | `1.0.6` | Unlicense/MIT | 推移 | [crate](https://crates.io/crates/same-file/1.0.6) / [upstream](https://github.com/BurntSushi/same-file) | `COPYING`, `LICENSE-MIT` |
| `schemars` | `0.8.22` | MIT | 推移 | [crate](https://crates.io/crates/schemars/0.8.22) / [upstream](https://github.com/GREsau/schemars) | `LICENSE` |
| `schemars` | `0.9.0` | MIT | 推移 | [crate](https://crates.io/crates/schemars/0.9.0) / [upstream](https://github.com/GREsau/schemars) | `LICENSE` |
| `schemars` | `1.2.2` | MIT | 推移 | [crate](https://crates.io/crates/schemars/1.2.2) / [upstream](https://github.com/GREsau/schemars) | `LICENSE` |
| `schemars_derive` | `0.8.22` | MIT | 推移 | [crate](https://crates.io/crates/schemars_derive/0.8.22) / [upstream](https://github.com/GREsau/schemars) | `LICENSE` |
| `scopeguard` | `1.2.0` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/scopeguard/1.2.0) / [upstream](https://github.com/bluss/scopeguard) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `selectors` | `0.36.1` | MPL-2.0 | 推移 | [crate](https://crates.io/crates/selectors/0.36.1) / [upstream](https://github.com/servo/stylo) | `lib.rs (MPL header)` |
| `semver` | `1.0.28` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/semver/1.0.28) / [upstream](https://github.com/dtolnay/semver) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `serde` | `1.0.229` | MIT OR Apache-2.0 | 直接 | [crate](https://crates.io/crates/serde/1.0.229) / [upstream](https://github.com/serde-rs/serde) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `serde-untagged` | `0.1.9` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/serde-untagged/0.1.9) / [upstream](https://github.com/dtolnay/serde-untagged) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `serde_core` | `1.0.229` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/serde_core/1.0.229) / [upstream](https://github.com/serde-rs/serde) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `serde_derive` | `1.0.229` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/serde_derive/1.0.229) / [upstream](https://github.com/serde-rs/serde) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `serde_derive_internals` | `0.29.1` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/serde_derive_internals/0.29.1) / [upstream](https://github.com/serde-rs/serde) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `serde_json` | `1.0.151` | MIT OR Apache-2.0 | 直接 | [crate](https://crates.io/crates/serde_json/1.0.151) / [upstream](https://github.com/serde-rs/json) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `serde_repr` | `0.1.21` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/serde_repr/0.1.21) / [upstream](https://github.com/dtolnay/serde-repr) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `serde_spanned` | `1.1.1` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/serde_spanned/1.1.1) / [upstream](https://github.com/toml-rs/toml) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `serde_with` | `3.23.0` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/serde_with/3.23.0) / [upstream](https://github.com/jonasbb/serde_with/) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `serde_with_macros` | `3.23.0` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/serde_with_macros/3.23.0) / [upstream](https://github.com/jonasbb/serde_with/) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `serialize-to-javascript` | `0.1.2` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/serialize-to-javascript/0.1.2) / [upstream](https://github.com/chippers/serialize-to-javascript) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `serialize-to-javascript-impl` | `0.1.2` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/serialize-to-javascript-impl/0.1.2) / [upstream](https://github.com/chippers/serialize-to-javascript) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `servo_arc` | `0.4.3` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/servo_arc/0.4.3) / [upstream](https://github.com/servo/stylo) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `sha2` | `0.10.9` | MIT OR Apache-2.0 | 直接 | [crate](https://crates.io/crates/sha2/0.10.9) / [upstream](https://github.com/RustCrypto/hashes) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `shlex` | `2.0.1` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/shlex/2.0.1) / [upstream](https://github.com/comex/rust-shlex) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `simd-adler32` | `0.3.10` | MIT | 推移 | [crate](https://crates.io/crates/simd-adler32/0.3.10) / [upstream](https://github.com/mcountryman/simd-adler32) | `LICENSE.md` |
| `siphasher` | `1.0.3` | MIT/Apache-2.0 | 推移 | [crate](https://crates.io/crates/siphasher/1.0.3) / [upstream](https://github.com/jedisct1/rust-siphash) | `COPYING` |
| `smallvec` | `1.16.1` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/smallvec/1.16.1) / [upstream](https://github.com/servo/rust-smallvec) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `socket2` | `0.6.5` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/socket2/0.6.5) / [upstream](https://github.com/rust-lang/socket2) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `softbuffer` | `0.4.8` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/softbuffer/0.4.8) / [upstream](https://github.com/rust-windowing/softbuffer) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `stable_deref_trait` | `1.2.1` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/stable_deref_trait/1.2.1) / [upstream](https://github.com/storyyeller/stable_deref_trait) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `string_cache` | `0.9.0` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/string_cache/0.9.0) / [upstream](https://github.com/servo/string-cache) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `string_cache_codegen` | `0.6.1` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/string_cache_codegen/0.6.1) / [upstream](https://github.com/servo/string-cache) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `strsim` | `0.11.1` | MIT | 推移 | [crate](https://crates.io/crates/strsim/0.11.1) / [upstream](https://github.com/rapidfuzz/strsim-rs) | `LICENSE` |
| `syn` | `2.0.119` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/syn/2.0.119) / [upstream](https://github.com/dtolnay/syn) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `syn` | `3.0.6` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/syn/3.0.6) / [upstream](https://github.com/dtolnay/syn) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `synstructure` | `0.14.0` | MIT | 推移 | [crate](https://crates.io/crates/synstructure/0.14.0) / [upstream](https://github.com/mystor/synstructure) | `LICENSE` |
| `tao` | `0.35.3` | Apache-2.0 | 推移 | [crate](https://crates.io/crates/tao/0.35.3) / [upstream](https://github.com/tauri-apps/tao) | `LICENSE`, `LICENSE.spdx` |
| `tauri` | `2.11.6` | Apache-2.0 OR MIT | 直接 | [crate](https://crates.io/crates/tauri/2.11.6) / [upstream](https://github.com/tauri-apps/tauri) | `LICENSE_APACHE-2.0`, `LICENSE_MIT` |
| `tauri-build` | `2.6.3` | Apache-2.0 OR MIT | 直接 build | [crate](https://crates.io/crates/tauri-build/2.6.3) / [upstream](https://github.com/tauri-apps/tauri) | `LICENSE_APACHE-2.0`, `LICENSE_MIT` |
| `tauri-codegen` | `2.6.3` | Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/tauri-codegen/2.6.3) / [upstream](https://github.com/tauri-apps/tauri) | `LICENSE_APACHE-2.0`, `LICENSE_MIT` |
| `tauri-macros` | `2.6.3` | Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/tauri-macros/2.6.3) / [upstream](https://github.com/tauri-apps/tauri) | `LICENSE_APACHE-2.0`, `LICENSE_MIT` |
| `tauri-plugin` | `2.6.3` | Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/tauri-plugin/2.6.3) / [upstream](https://github.com/tauri-apps/tauri) | Cargo.toml の license 宣言のみ（本文未収集） |
| `tauri-plugin-clipboard-manager` | `2.3.3` | Apache-2.0 OR MIT | 直接 | [crate](https://crates.io/crates/tauri-plugin-clipboard-manager/2.3.3) / [upstream](https://github.com/tauri-apps/plugins-workspace) | `LICENSE.spdx`, `LICENSE_APACHE-2.0`, `LICENSE_MIT` |
| `tauri-runtime` | `2.11.3` | Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/tauri-runtime/2.11.3) / [upstream](https://github.com/tauri-apps/tauri) | `LICENSE_APACHE-2.0`, `LICENSE_MIT` |
| `tauri-runtime-wry` | `2.11.4` | Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/tauri-runtime-wry/2.11.4) / [upstream](https://github.com/tauri-apps/tauri) | `LICENSE_APACHE-2.0`, `LICENSE_MIT` |
| `tauri-utils` | `2.9.3` | Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/tauri-utils/2.9.3) / [upstream](https://github.com/tauri-apps/tauri) | `LICENSE_APACHE-2.0`, `LICENSE_MIT` |
| `tauri-winres` | `0.3.6` | MIT | 推移 | [crate](https://crates.io/crates/tauri-winres/0.3.6) / [upstream](https://github.com/tauri-apps/winres) | `LICENSE` |
| `tendril` | `0.5.1` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/tendril/0.5.1) / [upstream](https://github.com/servo/html5ever) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `thiserror` | `1.0.69` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/thiserror/1.0.69) / [upstream](https://github.com/dtolnay/thiserror) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `thiserror` | `2.0.20` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/thiserror/2.0.20) / [upstream](https://github.com/dtolnay/thiserror) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `thiserror-impl` | `1.0.69` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/thiserror-impl/1.0.69) / [upstream](https://github.com/dtolnay/thiserror) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `thiserror-impl` | `2.0.20` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/thiserror-impl/2.0.20) / [upstream](https://github.com/dtolnay/thiserror) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `tiff` | `0.11.3` | MIT | 推移 | [crate](https://crates.io/crates/tiff/0.11.3) / [upstream](https://github.com/image-rs/image-tiff) | `LICENSE` |
| `time` | `0.3.55` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/time/0.3.55) / [upstream](https://github.com/time-rs/time) | `LICENSE-Apache`, `LICENSE-MIT` |
| `time-core` | `0.1.9` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/time-core/0.1.9) / [upstream](https://github.com/time-rs/time) | `LICENSE-Apache`, `LICENSE-MIT` |
| `time-macros` | `0.2.32` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/time-macros/0.2.32) / [upstream](https://github.com/time-rs/time) | `LICENSE-Apache`, `LICENSE-MIT` |
| `tinystr` | `0.8.4` | Unicode-3.0 | 推移 | [crate](https://crates.io/crates/tinystr/0.8.4) / [upstream](https://github.com/unicode-org/icu4x) | `LICENSE` |
| `tinyvec` | `1.13.3` | Zlib OR Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/tinyvec/1.13.3) / [upstream](https://github.com/Lokathor/tinyvec) | `LICENSE-APACHE.md`, `LICENSE-MIT.md`, `LICENSE-ZLIB.md` |
| `tokio` | `1.53.1` | MIT | 推移 | [crate](https://crates.io/crates/tokio/1.53.1) / [upstream](https://github.com/tokio-rs/tokio) | `LICENSE` |
| `toml` | `0.9.12+spec-1.1.0` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/toml/0.9.12+spec-1.1.0) / [upstream](https://github.com/toml-rs/toml) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `toml` | `1.1.6+spec-1.1.0` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/toml/1.1.6+spec-1.1.0) / [upstream](https://github.com/toml-rs/toml) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `toml_datetime` | `0.7.5+spec-1.1.0` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/toml_datetime/0.7.5+spec-1.1.0) / [upstream](https://github.com/toml-rs/toml) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `toml_datetime` | `1.1.1+spec-1.1.0` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/toml_datetime/1.1.1+spec-1.1.0) / [upstream](https://github.com/toml-rs/toml) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `toml_parser` | `1.1.3+spec-1.1.0` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/toml_parser/1.1.3+spec-1.1.0) / [upstream](https://github.com/toml-rs/toml) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `toml_writer` | `1.1.2+spec-1.1.0` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/toml_writer/1.1.2+spec-1.1.0) / [upstream](https://github.com/toml-rs/toml) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `tracing` | `0.1.44` | MIT | 推移 | [crate](https://crates.io/crates/tracing/0.1.44) / [upstream](https://github.com/tokio-rs/tracing) | `LICENSE` |
| `tracing-core` | `0.1.36` | MIT | 推移 | [crate](https://crates.io/crates/tracing-core/0.1.36) / [upstream](https://github.com/tokio-rs/tracing) | `LICENSE` |
| `tray-icon` | `0.24.2` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/tray-icon/0.24.2) / [upstream](https://github.com/tauri-apps/tray-icon) | `LICENSE-APACHE`, `LICENSE-MIT`, `LICENSE.spdx` |
| `typeid` | `1.0.3` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/typeid/1.0.3) / [upstream](https://github.com/dtolnay/typeid) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `typenum` | `1.20.1` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/typenum/1.20.1) / [upstream](https://github.com/paholg/typenum) | `LICENSE`, `LICENSE-APACHE`, `LICENSE-MIT` |
| `unic-char-property` | `0.9.0` | MIT/Apache-2.0 | 推移 | [crate](https://crates.io/crates/unic-char-property/0.9.0) / [upstream](https://github.com/open-i18n/rust-unic/) | Cargo.toml の license 宣言のみ（本文未収集） |
| `unic-char-range` | `0.9.0` | MIT/Apache-2.0 | 推移 | [crate](https://crates.io/crates/unic-char-range/0.9.0) / [upstream](https://github.com/open-i18n/rust-unic/) | Cargo.toml の license 宣言のみ（本文未収集） |
| `unic-common` | `0.9.0` | MIT/Apache-2.0 | 推移 | [crate](https://crates.io/crates/unic-common/0.9.0) / [upstream](https://github.com/open-i18n/rust-unic/) | Cargo.toml の license 宣言のみ（本文未収集） |
| `unic-ucd-ident` | `0.9.0` | MIT/Apache-2.0 | 推移 | [crate](https://crates.io/crates/unic-ucd-ident/0.9.0) / [upstream](https://github.com/open-i18n/rust-unic/) | Cargo.toml の license 宣言のみ（本文未収集） |
| `unic-ucd-version` | `0.9.0` | MIT/Apache-2.0 | 推移 | [crate](https://crates.io/crates/unic-ucd-version/0.9.0) / [upstream](https://github.com/open-i18n/rust-unic/) | Cargo.toml の license 宣言のみ（本文未収集） |
| `unicode-ident` | `1.0.26` | (MIT OR Apache-2.0) AND Unicode-3.0 | 推移 | [crate](https://crates.io/crates/unicode-ident/1.0.26) / [upstream](https://github.com/dtolnay/unicode-ident) | `LICENSE-APACHE`, `LICENSE-MIT`, `LICENSE-UNICODE` |
| `unicode-segmentation` | `1.13.3` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/unicode-segmentation/1.13.3) / [upstream](https://github.com/unicode-rs/unicode-segmentation) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `url` | `2.5.8` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/url/2.5.8) / [upstream](https://github.com/servo/rust-url) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `urlpattern` | `0.3.0` | MIT | 推移 | [crate](https://crates.io/crates/urlpattern/0.3.0) / [upstream](https://github.com/denoland/rust-urlpattern) | `LICENSE` |
| `utf8_iter` | `1.0.4` | Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/utf8_iter/1.0.4) / [upstream](https://github.com/hsivonen/utf8_iter) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `uuid` | `1.26.1` | Apache-2.0 OR MIT | 直接 | [crate](https://crates.io/crates/uuid/1.26.1) / [upstream](https://github.com/uuid-rs/uuid) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `version_check` | `0.9.5` | MIT/Apache-2.0 | 推移 | [crate](https://crates.io/crates/version_check/0.9.5) / [upstream](https://github.com/SergioBenitez/version_check) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `vswhom` | `0.1.0` | MIT | 推移 | [crate](https://crates.io/crates/vswhom/0.1.0) / [upstream](https://github.com/nabijaczleweli/vswhom.rs) | `LICENSE` |
| `vswhom-sys` | `0.1.3` | MIT | 推移 | [crate](https://crates.io/crates/vswhom-sys/0.1.3) / [upstream](https://github.com/nabijaczleweli/vswhom-sys.rs) | `LICENSE` |
| `walkdir` | `2.5.0` | Unlicense/MIT | 推移 | [crate](https://crates.io/crates/walkdir/2.5.0) / [upstream](https://github.com/BurntSushi/walkdir) | `COPYING`, `LICENSE-MIT` |
| `web_atoms` | `0.2.6` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/web_atoms/0.2.6) / [upstream](https://github.com/servo/html5ever) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `webview2-com` | `0.38.2` | MIT | 推移 | [crate](https://crates.io/crates/webview2-com/0.38.2) / [upstream](https://github.com/wravery/webview2-rs) | Cargo.toml の license 宣言のみ（本文未収集） |
| `webview2-com-macros` | `0.8.1` | MIT | 推移 | [crate](https://crates.io/crates/webview2-com-macros/0.8.1) / [upstream](https://github.com/wravery/webview2-rs) | Cargo.toml の license 宣言のみ（本文未収集） |
| `webview2-com-sys` | `0.38.2` | MIT | 推移 | [crate](https://crates.io/crates/webview2-com-sys/0.38.2) / [upstream](https://github.com/wravery/webview2-rs) | Cargo.toml の license 宣言のみ（本文未収集） |
| `weezl` | `0.1.12` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/weezl/0.1.12) / [upstream](https://github.com/image-rs/weezl) | `LICENSE-APACHE`, `LICENSE-MIT` |
| `winapi-util` | `0.1.11` | Unlicense OR MIT | 推移 | [crate](https://crates.io/crates/winapi-util/0.1.11) / [upstream](https://github.com/BurntSushi/winapi-util) | `COPYING`, `LICENSE-MIT` |
| `window-vibrancy` | `0.6.0` | Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/window-vibrancy/0.6.0) / [upstream](https://github.com/tauri-apps/tauri-plugin-vibrancy) | `LICENSE-APACHE`, `LICENSE-MIT`, `LICENSE.spdx` |
| `windows` | `0.61.3` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/windows/0.61.3) / [upstream](https://github.com/microsoft/windows-rs) | `license-apache-2.0`, `license-mit` |
| `windows-collections` | `0.2.0` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/windows-collections/0.2.0) / [upstream](https://github.com/microsoft/windows-rs) | `license-apache-2.0`, `license-mit` |
| `windows-core` | `0.61.2` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/windows-core/0.61.2) / [upstream](https://github.com/microsoft/windows-rs) | `license-apache-2.0`, `license-mit` |
| `windows-future` | `0.2.1` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/windows-future/0.2.1) / [upstream](https://github.com/microsoft/windows-rs) | `license-apache-2.0`, `license-mit` |
| `windows-implement` | `0.60.2` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/windows-implement/0.60.2) / [upstream](https://github.com/microsoft/windows-rs) | `license-apache-2.0`, `license-mit` |
| `windows-interface` | `0.59.3` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/windows-interface/0.59.3) / [upstream](https://github.com/microsoft/windows-rs) | `license-apache-2.0`, `license-mit` |
| `windows-link` | `0.1.3` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/windows-link/0.1.3) / [upstream](https://github.com/microsoft/windows-rs) | `license-apache-2.0`, `license-mit` |
| `windows-link` | `0.2.1` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/windows-link/0.2.1) / [upstream](https://github.com/microsoft/windows-rs) | `license-apache-2.0`, `license-mit` |
| `windows-numerics` | `0.2.0` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/windows-numerics/0.2.0) / [upstream](https://github.com/microsoft/windows-rs) | `license-apache-2.0`, `license-mit` |
| `windows-result` | `0.3.4` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/windows-result/0.3.4) / [upstream](https://github.com/microsoft/windows-rs) | `license-apache-2.0`, `license-mit` |
| `windows-strings` | `0.4.2` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/windows-strings/0.4.2) / [upstream](https://github.com/microsoft/windows-rs) | `license-apache-2.0`, `license-mit` |
| `windows-sys` | `0.59.0` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/windows-sys/0.59.0) / [upstream](https://github.com/microsoft/windows-rs) | `license-apache-2.0`, `license-mit` |
| `windows-sys` | `0.60.2` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/windows-sys/0.60.2) / [upstream](https://github.com/microsoft/windows-rs) | `license-apache-2.0`, `license-mit` |
| `windows-sys` | `0.61.2` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/windows-sys/0.61.2) / [upstream](https://github.com/microsoft/windows-rs) | `license-apache-2.0`, `license-mit` |
| `windows-targets` | `0.52.6` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/windows-targets/0.52.6) / [upstream](https://github.com/microsoft/windows-rs) | `license-apache-2.0`, `license-mit` |
| `windows-targets` | `0.53.5` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/windows-targets/0.53.5) / [upstream](https://github.com/microsoft/windows-rs) | `license-apache-2.0`, `license-mit` |
| `windows-threading` | `0.1.0` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/windows-threading/0.1.0) / [upstream](https://github.com/microsoft/windows-rs) | `license-apache-2.0`, `license-mit` |
| `windows-version` | `0.1.7` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/windows-version/0.1.7) / [upstream](https://github.com/microsoft/windows-rs) | `license-apache-2.0`, `license-mit` |
| `windows_x86_64_msvc` | `0.52.6` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/windows_x86_64_msvc/0.52.6) / [upstream](https://github.com/microsoft/windows-rs) | `license-apache-2.0`, `license-mit` |
| `windows_x86_64_msvc` | `0.53.1` | MIT OR Apache-2.0 | 推移 | [crate](https://crates.io/crates/windows_x86_64_msvc/0.53.1) / [upstream](https://github.com/microsoft/windows-rs) | `license-apache-2.0`, `license-mit` |
| `winnow` | `0.7.15` | MIT | 推移 | [crate](https://crates.io/crates/winnow/0.7.15) / [upstream](https://github.com/winnow-rs/winnow) | `LICENSE-MIT` |
| `winnow` | `1.0.4` | MIT | 推移 | [crate](https://crates.io/crates/winnow/1.0.4) / [upstream](https://github.com/winnow-rs/winnow) | `LICENSE-MIT` |
| `winreg` | `0.55.0` | MIT | 推移 | [crate](https://crates.io/crates/winreg/0.55.0) / [upstream](https://github.com/gentoo90/winreg-rs) | `LICENSE` |
| `writeable` | `0.6.4` | Unicode-3.0 | 推移 | [crate](https://crates.io/crates/writeable/0.6.4) / [upstream](https://github.com/unicode-org/icu4x) | `LICENSE` |
| `wry` | `0.55.1` | Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/wry/0.55.1) / [upstream](https://github.com/tauri-apps/wry) | `LICENSE-APACHE`, `LICENSE-MIT`, `LICENSE.spdx` |
| `yoke` | `0.8.3` | Unicode-3.0 | 推移 | [crate](https://crates.io/crates/yoke/0.8.3) / [upstream](https://github.com/unicode-org/icu4x) | `LICENSE` |
| `yoke-derive` | `0.8.3` | Unicode-3.0 | 推移 | [crate](https://crates.io/crates/yoke-derive/0.8.3) / [upstream](https://github.com/unicode-org/icu4x) | `LICENSE` |
| `zerocopy` | `0.8.57` | BSD-2-Clause OR Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/zerocopy/0.8.57) / [upstream](https://github.com/google/zerocopy) | `LICENSE-APACHE`, `LICENSE-BSD`, `LICENSE-MIT` |
| `zerocopy-derive` | `0.8.57` | BSD-2-Clause OR Apache-2.0 OR MIT | 推移 | [crate](https://crates.io/crates/zerocopy-derive/0.8.57) / [upstream](https://github.com/google/zerocopy) | `LICENSE-APACHE`, `LICENSE-BSD`, `LICENSE-MIT` |
| `zerofrom` | `0.1.8` | Unicode-3.0 | 推移 | [crate](https://crates.io/crates/zerofrom/0.1.8) / [upstream](https://github.com/unicode-org/icu4x) | `LICENSE` |
| `zerofrom-derive` | `0.1.8` | Unicode-3.0 | 推移 | [crate](https://crates.io/crates/zerofrom-derive/0.1.8) / [upstream](https://github.com/unicode-org/icu4x) | `LICENSE` |
| `zerotrie` | `0.2.5` | Unicode-3.0 | 推移 | [crate](https://crates.io/crates/zerotrie/0.2.5) / [upstream](https://github.com/unicode-org/icu4x) | `LICENSE` |
| `zerovec` | `0.11.8` | Unicode-3.0 | 推移 | [crate](https://crates.io/crates/zerovec/0.11.8) / [upstream](https://github.com/unicode-org/icu4x) | `LICENSE` |
| `zerovec-derive` | `0.11.6` | Unicode-3.0 | 推移 | [crate](https://crates.io/crates/zerovec-derive/0.11.6) / [upstream](https://github.com/unicode-org/icu4x) | `LICENSE` |
| `zlib-rs` | `0.6.8` | Zlib | 推移 | [crate](https://crates.io/crates/zlib-rs/0.6.8) / [upstream](https://github.com/trifectatechfoundation/zlib-rs) | `LICENSE` |
| `zmij` | `1.0.23` | MIT | 推移 | [crate](https://crates.io/crates/zmij/1.0.23) / [upstream](https://github.com/dtolnay/zmij) | `LICENSE-MIT` |
| `zune-core` | `0.5.3` | MIT OR Apache-2.0 OR Zlib | 推移 | [crate](https://crates.io/crates/zune-core/0.5.3) / [upstream](https://github.com/etemesi254/zune-image) | `LICENSE-APACHE`, `LICENSE-MIT`, `LICENSE-ZLIB` |
| `zune-jpeg` | `0.5.15` | MIT OR Apache-2.0 OR Zlib | 推移 | [crate](https://crates.io/crates/zune-jpeg/0.5.15) / [upstream](https://github.com/etemesi254/zune-image/tree/dev/crates/zune-jpeg) | `LICENSE-APACHE`, `LICENSE-MIT`, `LICENSE-ZLIB` |

## 再配布前に確認する項目

ELK の EPL-2.0、Rust の MPL-2.0、複数条件の AND、著作権表示、本文の同梱については [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md) を参照する。この一覧はバイナリ・Web 配信物向けの完了済み notice bundle ではない。配布する正確な成果物・target・lock ごとに、実際に含むコード、生成コード、フォント等の資産、OS / WebView 再配布条件、本文が未収集の crate を再確認する。
