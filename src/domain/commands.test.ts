import { describe, expect, it } from 'vitest';
import { freshEstimateFlow } from '../fixtures/estimateFlow';
import { addEdge, deleteNodes, duplicateSelection, moveNodes, reconnectEdge, resizeGroup, updateNode } from './commands';
import { connectorSides } from './schema';

describe('editing commands', () => {
  it('改名・移動で固定IDと関係を維持する', () => {
    const source = freshEstimateFlow();
    const renamed = updateNode(source, 'node_create_00000002', { label: '見積を編集' });
    const moved = moveNodes(renamed, { node_create_00000002: { x: 999, y: 888 } });
    expect(moved.semantic.nodes.find(node => node.id === 'node_create_00000002')?.label).toBe('見積を編集');
    expect(moved.semantic.edges.find(edge => edge.id === 'edge_create_decide_01')).toMatchObject({ source: 'node_create_00000002', target: 'node_decide_00000003' });
  });

  it('複製集合内の参照だけを新IDへ付け替える', () => {
    const source = freshEstimateFlow();
    const result = duplicateSelection(source, ['node_decide_00000003', 'node_issue_00000004']);
    expect(result.nodeIds).toHaveLength(2);
    const copiedEdge = result.document.semantic.edges.at(-1)!;
    expect(result.nodeIds).toContain(copiedEdge.source);
    expect(result.nodeIds).toContain(copiedEdge.target);
    expect(copiedEdge.source).not.toBe('node_decide_00000003');
    expect(result.document.semantic.edges.filter(edge => edge.source === 'node_issue_00000004' && edge.target === 'node_save_00000006')).toHaveLength(1);
    expect(result.document.presentation.edgeEndpoints[copiedEdge.id]).toEqual(source.presentation.edgeEndpoints.edge_decide_issue_01);
  });

  it('削除時に接続を同時削除しルール本文を保持して要確認にする', () => {
    const source = freshEstimateFlow();
    const deleted = deleteNodes(source, ['node_decide_00000003']);
    expect(deleted.semantic.edges.some(edge => edge.source === 'node_decide_00000003' || edge.target === 'node_decide_00000003')).toBe(false);
    const rule = deleted.semantic.rules.find(item => item.id === 'rule_issue_once_0001')!;
    expect(rule.text).toContain('初回保存時だけ');
    expect(rule.target).toEqual({ kind: 'node', needsReview: true });
  });

  it('四辺×四辺の接続面を保持しsemanticへ混入させない', () => {
    for (const sourceSide of connectorSides) for (const targetSide of connectorSides) {
      const source = freshEstimateFlow();
      const connected = addEdge(source, 'node_db_00000007', 'node_start_00000001', 'next', sourceSide, targetSide);
      const edge = connected.semantic.edges.at(-1)!;
      expect(connected.presentation.edgeEndpoints[edge.id]).toEqual({ sourceSide, targetSide });
      expect(edge).not.toHaveProperty('sourceSide');
      expect(edge).not.toHaveProperty('targetSide');
    }
  });

  it('再接続でedge ID・関係・条件を維持し面と端点を一括更新する', () => {
    const source = freshEstimateFlow();
    const updated = reconnectEdge(source, 'edge_start_create_001', 'node_start_00000001', 'node_db_00000007', 'bottom', 'top');
    expect(updated.semantic.edges.find(edge => edge.id === 'edge_start_create_001')).toMatchObject({ id: 'edge_start_create_001', source: 'node_start_00000001', target: 'node_db_00000007', relation: 'next' });
    expect(updated.presentation.edgeEndpoints.edge_start_create_001).toEqual({ sourceSide: 'bottom', targetSide: 'top' });
  });

  it('自己接続と同方向の重複接続を面の変更でも拒否する', () => {
    const source = freshEstimateFlow();
    expect(() => addEdge(source, 'node_start_00000001', 'node_start_00000001')).toThrow('自身');
    expect(() => addEdge(source, 'node_start_00000001', 'node_create_00000002', 'next', 'top', 'bottom')).toThrow('既に');
  });

  it('グループresizeで子の絶対座標とsemanticを変えない', () => {
    const source = freshEstimateFlow();
    const semantic = structuredClone(source.semantic);
    const positions = structuredClone(source.presentation.nodePositions);
    const resized = resizeGroup(source, 'group_estimate_editor_0001', 640, 480);
    expect(resized.presentation.groupGeometry.group_estimate_editor_0001).toMatchObject({ width: 640, height: 480 });
    expect(resized.presentation.nodePositions).toEqual(positions);
    expect(resized.semantic).toEqual(semantic);
  });
});
