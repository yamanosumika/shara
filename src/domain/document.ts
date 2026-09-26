import { createId } from './ids';
import { CURRENT_SCHEMA_VERSION, type SharaDocument } from './schema';

export function createBlankDocument(): SharaDocument {
  const now = new Date().toISOString();
  return {
    format: 'shara', schemaVersion: CURRENT_SCHEMA_VERSION, id: createId('doc'),
    semantic: { title: '名称未設定', purpose: '', scope: [], outOfScope: [], nodes: [], edges: [], groups: [], rules: [], openQuestions: [] },
    presentation: { direction: 'LR', nodePositions: {}, groupGeometry: {}, edgeEndpoints: {}, viewport: { x: 0, y: 0, zoom: 1 } },
    metadata: { createdAt: now, updatedAt: now },
  };
}
