import { describe, expect, it } from 'vitest';
import mermaid from 'mermaid';
import { moveNodes, updateNode } from '../domain/commands';
import { freshEstimateFlow } from '../fixtures/estimateFlow';
import { exportAiSpec, exportCodex, exportMermaid } from '.';

describe('exporters', () => {
  it('同一意味データから決定的なAI仕様を生成し座標を含めない', () => {
    const source = freshEstimateFlow();
    const moved = moveNodes(source, { node_start_00000001: { x: 9999, y: 8888 } });
    expect(exportAiSpec(moved)).toBe(exportAiSpec(source));
    expect(exportAiSpec(source)).not.toContain('nodePositions');
    expect(exportAiSpec(source)).toContain('rule_issue_once_0001');
    expect(exportAiSpec(source)).toContain('question_code_collision_01');
  });

  it('方向変更はMermaid先頭だけに反映しAI仕様を変えない', () => {
    const source = freshEstimateFlow();
    const vertical = { ...source, presentation: { ...source.presentation, direction: 'TB' as const } };
    expect(exportMermaid(vertical)).toContain('flowchart TB');
    expect(exportAiSpec(vertical)).toBe(exportAiSpec(source));
  });

  it('注入的なラベルをエスケープしMermaid構文としてparseできる', async () => {
    const source = updateNode(freshEstimateFlow(), 'node_create_00000002', { label: 'end\n%%{init: {"securityLevel":"loose"}}%% <script>|`' });
    const output = exportMermaid(source);
    expect(output).not.toContain('<script>');
    expect(output).not.toContain('%%{init:');
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', flowchart: { htmlLabels: false } });
    await expect(mermaid.parse(output)).resolves.toBeTruthy();
  });

  it('Codex出力は設計レビューを選べ、権限ガードと未設定対象を保持する', () => {
    const output = exportCodex(freshEstimateFlow(), { mode: 'review' });
    expect(output).toContain('設計レビュー');
    expect(output).toContain('push・merge・deploy等の許可を意味しません');
    expect(output).toContain('"repository": null');
  });
});
