import { describe, expect, it } from 'vitest';
import { freshEstimateFlow } from '../fixtures/estimateFlow';
import { findNodePlacement } from './placement';

describe('new node placement', () => {
  it('直前のnodeの右隣へ配置する', () => {
    const document = freshEstimateFlow();
    const point = findNodePlacement(document, { kind: 'node', id: 'node_db_00000007' }, { x: 0, y: 0 });
    expect(point).toEqual({ x: 1438, y: 160 });
  });

  it('右隣が埋まっている場合も決定的に空き位置を選ぶ', () => {
    const document = freshEstimateFlow();
    const first = findNodePlacement(document, { kind: 'node', id: 'node_start_00000001' }, { x: 0, y: 0 });
    const second = findNodePlacement(document, { kind: 'node', id: 'node_start_00000001' }, { x: 0, y: 0 });
    expect(first).toEqual(second);
    expect(first).not.toEqual({ x: 308, y: 160 });
  });

  it('group枠はnode配置の衝突物として扱わない', () => {
    const document = freshEstimateFlow();
    document.semantic.nodes = [];
    document.presentation.nodePositions = {};
    document.semantic.edges = [];
    document.presentation.edgeEndpoints = {};
    expect(findNodePlacement(document, null, { x: 100, y: 100 })).toEqual({ x: 100, y: 100 });
  });
});
