import type { SharaDocument } from './schema';

export type SemanticEntityKind = 'document' | 'node' | 'edge' | 'group' | 'rule' | 'openQuestion';
export type SemanticChangeType = 'added' | 'removed' | 'changed';

export interface SemanticChange {
  kind: SemanticEntityKind;
  id: string;
  type: SemanticChangeType;
  fields: string[];
}

function changedFields(before: Record<string, unknown>, after: Record<string, unknown>): string[] {
  return [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter(key => JSON.stringify(before[key]) !== JSON.stringify(after[key]))
    .sort();
}

function compareCollection(kind: Exclude<SemanticEntityKind, 'document'>, beforeItems: Array<{ id: string }>, afterItems: Array<{ id: string }>): SemanticChange[] {
  const before = new Map(beforeItems.map(item => [item.id, item]));
  const after = new Map(afterItems.map(item => [item.id, item]));
  const ids = [...new Set([...before.keys(), ...after.keys()])].sort();
  const changes: SemanticChange[] = [];
  for (const id of ids) {
    const oldItem = before.get(id);
    const newItem = after.get(id);
    if (!oldItem) { changes.push({ kind, id, type: 'added', fields: [] }); continue; }
    if (!newItem) { changes.push({ kind, id, type: 'removed', fields: [] }); continue; }
    const fields = changedFields(oldItem as Record<string, unknown>, newItem as Record<string, unknown>).filter(field => field !== 'id');
    if (fields.length) changes.push({ kind, id, type: 'changed', fields });
  }
  return changes;
}

export function diffSemantic(before: SharaDocument, after: SharaDocument): SemanticChange[] {
  const documentFields = changedFields(
    { title: before.semantic.title, purpose: before.semantic.purpose, scope: before.semantic.scope, outOfScope: before.semantic.outOfScope },
    { title: after.semantic.title, purpose: after.semantic.purpose, scope: after.semantic.scope, outOfScope: after.semantic.outOfScope },
  );
  const changes: SemanticChange[] = documentFields.length ? [{ kind: 'document', id: after.id, type: 'changed', fields: documentFields }] : [];
  return [
    ...changes,
    ...compareCollection('node', before.semantic.nodes, after.semantic.nodes),
    ...compareCollection('edge', before.semantic.edges, after.semantic.edges),
    ...compareCollection('group', before.semantic.groups, after.semantic.groups),
    ...compareCollection('rule', before.semantic.rules, after.semantic.rules),
    ...compareCollection('openQuestion', before.semantic.openQuestions, after.semantic.openQuestions),
  ];
}

const KIND_LABELS: Record<SemanticEntityKind, string> = {
  document: '文書', node: '部品', edge: '接続', group: 'グループ', rule: 'ルール', openQuestion: '未決事項',
};
const TYPE_LABELS: Record<SemanticChangeType, string> = { added: '追加', removed: '削除', changed: '変更' };

export function describeSemanticChange(change: SemanticChange): string {
  const detail = change.fields.length ? `（${change.fields.join('、')}）` : '';
  return `${KIND_LABELS[change.kind]} ${change.id}: ${TYPE_LABELS[change.type]}${detail}`;
}
