import type { SharaDocument } from './schema';

export type WarningCode = 'empty-label' | 'missing-actor' | 'disconnected' | 'incomplete-decision' | 'open-question' | 'orphaned-reference' | 'dependency-cycle';
export interface WarningTarget { kind: 'document' | 'node' | 'edge' | 'group' | 'rule' | 'openQuestion'; id?: string }
export interface DocumentWarning { code: WarningCode; message: string; target?: WarningTarget }

export function validateWarnings(document: SharaDocument): DocumentWarning[] {
  const warnings: DocumentWarning[] = [];
  const connected = new Set(document.semantic.edges.flatMap(edge => [edge.source, edge.target]));
  for (const node of document.semantic.nodes) {
    const target = { kind: 'node' as const, id: node.id };
    if (!node.label.trim()) warnings.push({ code: 'empty-label', message: '名前が未入力です', target });
    if (!node.actor.trim() && !['start', 'end', 'data', 'database', 'note'].includes(node.type)) warnings.push({ code: 'missing-actor', message: `${node.label || '名称未設定'}: 担当が未設定です`, target });
    if (!connected.has(node.id) && document.semantic.nodes.length > 1) warnings.push({ code: 'disconnected', message: `${node.label || '名称未設定'}: 接続されていません`, target });
    if (node.type === 'decision') {
      const outgoing = document.semantic.edges.filter(edge => edge.source === node.id).map(edge => edge.relation);
      if (!outgoing.includes('yes') || !outgoing.includes('no')) warnings.push({ code: 'incomplete-decision', message: `${node.label || '条件分岐'}: はい/いいえの接続が揃っていません`, target });
    }
  }
  for (const question of document.semantic.openQuestions) warnings.push({ code: 'open-question', message: `未決事項: ${question.text || '本文未入力'}`, target: { kind: 'openQuestion', id: question.id } });
  for (const rule of document.semantic.rules) if (rule.target.needsReview) warnings.push({ code: 'orphaned-reference', message: `ルール「${rule.text || '本文未入力'}」の紐づけを確認してください`, target: { kind: 'rule', id: rule.id } });
  for (const question of document.semantic.openQuestions) if (question.target.needsReview) warnings.push({ code: 'orphaned-reference', message: `未決事項「${question.text || '本文未入力'}」の紐づけを確認してください`, target: { kind: 'openQuestion', id: question.id } });
  warnings.push(...dependencyCycleWarnings(document));
  return warnings;
}

function dependencyCycleWarnings(document: SharaDocument): DocumentWarning[] {
  const graph = new Map<string, string[]>();
  for (const edge of document.semantic.edges.filter(edge => edge.relation === 'depends_on')) graph.set(edge.source, [...(graph.get(edge.source) ?? []), edge.target]);
  const active = new Set<string>();
  const done = new Set<string>();
  const cycleNodes = new Set<string>();
  const visit = (id: string) => {
    if (active.has(id)) { cycleNodes.add(id); return; }
    if (done.has(id)) return;
    active.add(id);
    for (const next of graph.get(id) ?? []) { if (active.has(next)) { cycleNodes.add(id); cycleNodes.add(next); } else visit(next); }
    active.delete(id); done.add(id);
  };
  for (const id of graph.keys()) visit(id);
  return [...cycleNodes].sort().map(id => ({ code: 'dependency-cycle', message: '依存関係が循環しています', target: { kind: 'node', id } }));
}
