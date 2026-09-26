import { createId } from './ids';
import type { ConnectorSide, OpenQuestion, Relation, RuleStatus, SharaDocument, SharaEdge, SharaGroup, SharaNode, SharaRule, TargetRef } from './schema';

function touch(document: SharaDocument): SharaDocument {
  return { ...document, metadata: { ...document.metadata, updatedAt: new Date().toISOString() } };
}

export function addNode(document: SharaDocument, node: Pick<SharaNode, 'type' | 'label'> & Partial<SharaNode>, position = { x: 80, y: 80 }): SharaDocument {
  const item: SharaNode = { id: createId('node'), description: '', actor: '', inputs: [], outputs: [], ...node, type: node.type, label: node.label };
  return touch({ ...document, semantic: { ...document.semantic, nodes: [...document.semantic.nodes, item] }, presentation: { ...document.presentation, nodePositions: { ...document.presentation.nodePositions, [item.id]: position } } });
}

export function updateNode(document: SharaDocument, id: string, patch: Partial<Omit<SharaNode, 'id'>>): SharaDocument {
  return touch({ ...document, semantic: { ...document.semantic, nodes: document.semantic.nodes.map(node => node.id === id ? { ...node, ...patch, id } : node) } });
}

export function moveNodes(document: SharaDocument, positions: Record<string, { x: number; y: number }>): SharaDocument {
  return touch({ ...document, presentation: { ...document.presentation, nodePositions: { ...document.presentation.nodePositions, ...positions } } });
}

function detachTarget(target: TargetRef, kind: TargetRef['kind'], id: string): TargetRef {
  return target.kind === kind && target.id === id ? { kind, needsReview: true } : target;
}

export function deleteNodes(document: SharaDocument, ids: string[]): SharaDocument {
  const removed = new Set(ids);
  const removedEdges = new Set(document.semantic.edges.filter(edge => removed.has(edge.source) || removed.has(edge.target)).map(edge => edge.id));
  const positions = { ...document.presentation.nodePositions };
  const edgeEndpoints = { ...document.presentation.edgeEndpoints };
  ids.forEach(id => delete positions[id]);
  removedEdges.forEach(id => delete edgeEndpoints[id]);
  const detach = (target: TargetRef) => {
    if (target.kind === 'node' && target.id && removed.has(target.id)) return { kind: 'node' as const, needsReview: true };
    if (target.kind === 'edge' && target.id && removedEdges.has(target.id)) return { kind: 'edge' as const, needsReview: true };
    return target;
  };
  return touch({
    ...document,
    semantic: {
      ...document.semantic,
      nodes: document.semantic.nodes.filter(node => !removed.has(node.id)),
      edges: document.semantic.edges.filter(edge => !removedEdges.has(edge.id)),
      rules: document.semantic.rules.map(rule => ({ ...rule, target: detach(rule.target) })),
      openQuestions: document.semantic.openQuestions.map(question => ({ ...question, target: detach(question.target) })),
    },
    presentation: { ...document.presentation, nodePositions: positions, edgeEndpoints },
  });
}

export function canConnect(document: SharaDocument, source: string, target: string, excludeEdgeId?: string): { ok: true } | { ok: false; reason: string } {
  if (source === target) return { ok: false, reason: '同じ部品自身には接続できません' };
  if (!document.semantic.nodes.some(node => node.id === source) || !document.semantic.nodes.some(node => node.id === target)) {
    return { ok: false, reason: '接続元または接続先が存在しません' };
  }
  if (document.semantic.edges.some(edge => edge.id !== excludeEdgeId && edge.source === source && edge.target === target)) {
    return { ok: false, reason: '同じ向きの接続が既にあります' };
  }
  return { ok: true };
}

export function addEdge(document: SharaDocument, source: string, target: string, relation: Relation = 'next', sourceSide: ConnectorSide = 'right', targetSide: ConnectorSide = 'left'): SharaDocument {
  const validity = canConnect(document, source, target);
  if (!validity.ok) throw new Error(validity.reason);
  const edge: SharaEdge = { id: createId('edge'), source, target, relation, label: '', condition: '' };
  return touch({
    ...document,
    semantic: { ...document.semantic, edges: [...document.semantic.edges, edge] },
    presentation: { ...document.presentation, edgeEndpoints: { ...document.presentation.edgeEndpoints, [edge.id]: { sourceSide, targetSide } } },
  });
}

export function updateEdge(document: SharaDocument, id: string, patch: Partial<Omit<SharaEdge, 'id'>>): SharaDocument {
  return touch({ ...document, semantic: { ...document.semantic, edges: document.semantic.edges.map(edge => edge.id === id ? { ...edge, ...patch, id } : edge) } });
}

export function reconnectEdge(document: SharaDocument, id: string, source: string, target: string, sourceSide: ConnectorSide, targetSide: ConnectorSide): SharaDocument {
  const validity = canConnect(document, source, target, id);
  if (!validity.ok) throw new Error(validity.reason);
  if (!document.semantic.edges.some(edge => edge.id === id)) throw new Error('再接続するedgeが存在しません');
  return touch({
    ...document,
    semantic: { ...document.semantic, edges: document.semantic.edges.map(edge => edge.id === id ? { ...edge, source, target } : edge) },
    presentation: { ...document.presentation, edgeEndpoints: { ...document.presentation.edgeEndpoints, [id]: { sourceSide, targetSide } } },
  });
}

export function deleteEdge(document: SharaDocument, id: string): SharaDocument {
  const edgeEndpoints = { ...document.presentation.edgeEndpoints };
  delete edgeEndpoints[id];
  return touch({
    ...document,
    semantic: { ...document.semantic, edges: document.semantic.edges.filter(edge => edge.id !== id), rules: document.semantic.rules.map(rule => ({ ...rule, target: detachTarget(rule.target, 'edge', id) })), openQuestions: document.semantic.openQuestions.map(question => ({ ...question, target: detachTarget(question.target, 'edge', id) })) },
    presentation: { ...document.presentation, edgeEndpoints },
  });
}

export function addGroup(document: SharaDocument, label = '新しいグループ'): SharaDocument {
  const group: SharaGroup = { id: createId('group'), label, description: '' };
  return touch({ ...document, semantic: { ...document.semantic, groups: [...document.semantic.groups, group] }, presentation: { ...document.presentation, groupGeometry: { ...document.presentation.groupGeometry, [group.id]: { x: 40, y: 40, width: 420, height: 260 } } } });
}

export function updateGroup(document: SharaDocument, id: string, patch: Partial<Omit<SharaGroup, 'id'>>): SharaDocument {
  return touch({ ...document, semantic: { ...document.semantic, groups: document.semantic.groups.map(group => group.id === id ? { ...group, ...patch, id } : group) } });
}

export function resizeGroup(document: SharaDocument, id: string, width: number, height: number): SharaDocument {
  const current = document.presentation.groupGeometry[id];
  if (!current) return document;
  return touch({
    ...document,
    presentation: { ...document.presentation, groupGeometry: { ...document.presentation.groupGeometry, [id]: { ...current, width, height } } },
  });
}

export function deleteGroup(document: SharaDocument, id: string): SharaDocument {
  const geometry = { ...document.presentation.groupGeometry };
  delete geometry[id];
  return touch({ ...document, semantic: { ...document.semantic, groups: document.semantic.groups.filter(group => group.id !== id), nodes: document.semantic.nodes.map(node => node.groupId === id ? { ...node, groupId: undefined } : node), rules: document.semantic.rules.map(rule => ({ ...rule, target: detachTarget(rule.target, 'group', id) })), openQuestions: document.semantic.openQuestions.map(question => ({ ...question, target: detachTarget(question.target, 'group', id) })) }, presentation: { ...document.presentation, groupGeometry: geometry } });
}

export function addRule(document: SharaDocument, text: string, status: RuleStatus = 'draft', target: TargetRef = { kind: 'document' }): SharaDocument {
  const rule: SharaRule = { id: createId('rule'), text, status, target };
  return touch({ ...document, semantic: { ...document.semantic, rules: [...document.semantic.rules, rule] } });
}

export function updateRule(document: SharaDocument, id: string, patch: Partial<Omit<SharaRule, 'id'>>): SharaDocument {
  return touch({ ...document, semantic: { ...document.semantic, rules: document.semantic.rules.map(rule => rule.id === id ? { ...rule, ...patch, id } : rule) } });
}

export function deleteRule(document: SharaDocument, id: string): SharaDocument {
  return touch({ ...document, semantic: { ...document.semantic, rules: document.semantic.rules.filter(rule => rule.id !== id) } });
}

export function addOpenQuestion(document: SharaDocument, text: string, target: TargetRef = { kind: 'document' }): SharaDocument {
  const question: OpenQuestion = { id: createId('question'), text, target };
  return touch({ ...document, semantic: { ...document.semantic, openQuestions: [...document.semantic.openQuestions, question] } });
}

export function deleteOpenQuestion(document: SharaDocument, id: string): SharaDocument {
  return touch({ ...document, semantic: { ...document.semantic, openQuestions: document.semantic.openQuestions.filter(question => question.id !== id) } });
}

export function duplicateSelection(document: SharaDocument, selectedIds: string[]): { document: SharaDocument; nodeIds: string[] } {
  const selected = new Set(selectedIds);
  const idMap = new Map<string, string>();
  const copiedNodes = document.semantic.nodes.filter(node => selected.has(node.id)).map(node => {
    const newId = createId('node'); idMap.set(node.id, newId);
    return { ...node, id: newId };
  });
  const edgeIdMap = new Map<string, string>();
  const copiedEdges = document.semantic.edges.filter(edge => selected.has(edge.source) && selected.has(edge.target)).map(edge => {
    const newId = createId('edge'); edgeIdMap.set(edge.id, newId);
    return { ...edge, id: newId, source: idMap.get(edge.source)!, target: idMap.get(edge.target)! };
  });
  const copiedRules = document.semantic.rules.filter(rule => rule.target.kind === 'node' && rule.target.id && selected.has(rule.target.id)).map(rule => ({ ...rule, id: createId('rule'), target: { ...rule.target, id: idMap.get(rule.target.id!) } }));
  const copiedQuestions = document.semantic.openQuestions.filter(question => question.target.kind === 'node' && question.target.id && selected.has(question.target.id)).map(question => ({ ...question, id: createId('question'), target: { ...question.target, id: idMap.get(question.target.id!) } }));
  const positions = { ...document.presentation.nodePositions };
  const edgeEndpoints = { ...document.presentation.edgeEndpoints };
  for (const [oldId, newId] of idMap) { const point = positions[oldId] ?? { x: 0, y: 0 }; positions[newId] = { x: point.x + 36, y: point.y + 36 }; }
  for (const [oldId, newId] of edgeIdMap) edgeEndpoints[newId] = document.presentation.edgeEndpoints[oldId];
  return {
    document: touch({ ...document, semantic: { ...document.semantic, nodes: [...document.semantic.nodes, ...copiedNodes], edges: [...document.semantic.edges, ...copiedEdges], rules: [...document.semantic.rules, ...copiedRules], openQuestions: [...document.semantic.openQuestions, ...copiedQuestions] }, presentation: { ...document.presentation, nodePositions: positions, edgeEndpoints } }),
    nodeIds: copiedNodes.map(node => node.id),
  };
}
