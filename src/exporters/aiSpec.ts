import { RELATION_MEANINGS } from '../domain/relations';
import type { SharaDocument } from '../domain/schema';
import { validateWarnings } from '../domain/validation';
import { normalizedMeaning } from './stable';

export function exportAiSpec(document: SharaDocument): string {
  const warnings = validateWarnings(document);
  const relationText = Object.entries(RELATION_MEANINGS).map(([key, value]) => `- \`${key}\`: ${value}`).join('\n');
  return `# SHARA AI向け構造化仕様

## 文書

- 文書ID: \`${document.id}\`
- schemaVersion: \`${document.schemaVersion}\`
- タイトル: ${document.semantic.title || '未入力'}

## 目的・対象範囲・対象外

目的: ${document.semantic.purpose || '未入力'}

対象範囲:
${document.semantic.scope.length ? document.semantic.scope.map(item => `- ${item}`).join('\n') : '- 未入力'}

対象外:
${document.semantic.outOfScope.length ? document.semantic.outOfScope.map(item => `- ${item}`).join('\n') : '- 未入力'}

## 関係の定義

source=A、target=Bとして解釈する。

${relationText}

## 正規化した意味データJSON

${JSON.stringify(normalizedMeaning(document), null, 2)}

## 構造検査・仕様上の警告

構造検査: 合格（この出力は検証済みSharaDocumentから生成）

${warnings.length ? warnings.map(warning => `- [${warning.code}] ${warning.message}`).join('\n') : '- 警告なし'}
`;
}
