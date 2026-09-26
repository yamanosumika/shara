import ELK from 'elkjs/lib/elk.bundled.js';
import type { SharaDocument } from '../domain/schema';

const elk = new ELK();

export interface SharaLayout {
  nodePositions: Record<string, { x: number; y: number }>;
  groupGeometry: Record<string, { x: number; y: number; width: number; height: number }>;
}

export async function layoutDocument(document: SharaDocument, direction: 'LR' | 'TB'): Promise<SharaLayout> {
  const grouped = new Set(document.semantic.nodes.flatMap(node => node.groupId ? [node.id] : []));
  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': direction === 'LR' ? 'RIGHT' : 'DOWN',
      'elk.spacing.nodeNode': '70',
      'elk.layered.spacing.nodeNodeBetweenLayers': '110',
      'elk.layered.cycleBreaking.strategy': 'GREEDY',
      'elk.hierarchyHandling': 'INCLUDE_CHILDREN',
    },
    children: [
      ...document.semantic.groups.map(group => ({
        id: group.id,
        layoutOptions: { 'elk.algorithm': 'layered', 'elk.direction': direction === 'LR' ? 'RIGHT' : 'DOWN', 'elk.padding': '[top=48,left=24,bottom=24,right=24]', 'elk.spacing.nodeNode': '55' },
        children: document.semantic.nodes.filter(node => node.groupId === group.id).map(node => ({ id: node.id, width: 180, height: 76 })),
      })),
      ...document.semantic.nodes.filter(node => !grouped.has(node.id)).map(node => ({ id: node.id, width: 180, height: 76 })),
    ],
    edges: document.semantic.edges.map(edge => ({ id: edge.id, sources: [edge.source], targets: [edge.target] })),
  };
  const result = await elk.layout(graph);
  const nodePositions: SharaLayout['nodePositions'] = {};
  const groupGeometry: SharaLayout['groupGeometry'] = {};
  const groupIds = new Set(document.semantic.groups.map(group => group.id));
  for (const child of result.children ?? []) {
    if (!Number.isFinite(child.x) || !Number.isFinite(child.y)) continue;
    if (groupIds.has(child.id)) {
      groupGeometry[child.id] = { x: child.x!, y: child.y!, width: child.width ?? 420, height: child.height ?? 240 };
      for (const node of child.children ?? []) if (Number.isFinite(node.x) && Number.isFinite(node.y)) nodePositions[node.id] = { x: child.x! + node.x!, y: child.y! + node.y! };
    } else nodePositions[child.id] = { x: child.x!, y: child.y! };
  }
  if (Object.keys(nodePositions).length !== document.semantic.nodes.length) throw new Error('全ノードを整列できませんでした');
  return { nodePositions, groupGeometry };
}
