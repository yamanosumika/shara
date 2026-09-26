import { describe, expect, it } from 'vitest';
import { freshEstimateFlow } from '../fixtures/estimateFlow';
import { exportAiSpec } from '../exporters';
import { layoutDocument } from './elk';

describe('ELK layout', () => {
  it.each(['LR', 'TB'] as const)('%s方向ですべてのノードを配置する', async direction => {
    const document = freshEstimateFlow();
    const before = exportAiSpec(document);
    const layout = await layoutDocument(document, direction);
    expect(Object.keys(layout.nodePositions)).toHaveLength(document.semantic.nodes.length);
    expect(Object.keys(layout.groupGeometry)).toHaveLength(document.semantic.groups.length);
    expect(Object.values(layout.nodePositions).every(point => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(true);
    expect(exportAiSpec(document)).toBe(before);
  });
});
