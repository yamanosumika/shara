import { describe, expect, it } from 'vitest';
import { freshEstimateFlow } from '../fixtures/estimateFlow';
import { validateWarnings } from './validation';

describe('document warnings', () => {
  it('未決事項を警告するが構造エラーにしない', () => {
    const warnings = validateWarnings(freshEstimateFlow());
    expect(warnings).toContainEqual(expect.objectContaining({ code: 'open-question', target: { kind: 'openQuestion', id: 'question_code_collision_01' } }));
  });

  it('片側のない分岐を警告する', () => {
    const document = freshEstimateFlow();
    document.semantic.edges = document.semantic.edges.filter(edge => edge.relation !== 'no');
    expect(validateWarnings(document)).toContainEqual(expect.objectContaining({ code: 'incomplete-decision' }));
  });

  it('処理フローの循環は一律警告にしないが依存循環は警告する', () => {
    const document = freshEstimateFlow();
    document.semantic.edges.push({ id: 'edge_dep_cycle_00001', source: 'node_create_00000002', target: 'node_save_00000006', relation: 'depends_on', label: '' });
    document.semantic.edges.push({ id: 'edge_dep_cycle_00002', source: 'node_save_00000006', target: 'node_create_00000002', relation: 'depends_on', label: '' });
    expect(validateWarnings(document).filter(warning => warning.code === 'dependency-cycle').length).toBeGreaterThan(0);
  });
});
