import { describe, expect, it } from 'vitest';
import { moveNodes, updateEdge, updateNode } from './commands';
import { diffSemantic } from './diff';
import { freshEstimateFlow } from '../fixtures/estimateFlow';

describe('semantic diff', () => {
  it('座標・接続面・metadataだけの変更を除外する', () => {
    const before = freshEstimateFlow();
    const after = moveNodes(before, { node_start_00000001: { x: 900, y: 700 } });
    after.presentation.edgeEndpoints.edge_start_create_001.sourceSide = 'top';
    expect(diffSemantic(before, after)).toEqual([]);
  });

  it('改名と関係変更を固定IDで分類する', () => {
    const before = freshEstimateFlow();
    const renamed = updateNode(before, 'node_create_00000002', { label: '見積編集' });
    const after = updateEdge(renamed, 'edge_save_db_000001', { relation: 'reads' });
    expect(diffSemantic(before, after)).toEqual(expect.arrayContaining([
      expect.objectContaining({ kind: 'node', id: 'node_create_00000002', type: 'changed', fields: ['label'] }),
      expect.objectContaining({ kind: 'edge', id: 'edge_save_db_000001', type: 'changed', fields: ['relation'] }),
    ]));
  });
});
