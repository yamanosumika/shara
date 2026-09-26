import { useEffect, useRef } from 'react';
import { addOpenQuestion, addRule, deleteEdge, deleteGroup, deleteOpenQuestion, deleteRule, reconnectEdge, updateEdge, updateGroup, updateNode, updateRule } from '../domain/commands';
import { NODE_TYPE_LABELS, RELATION_LABELS, RULE_STATUS_LABELS } from '../domain/relations';
import { connectorSides, nodeTypes, relations, ruleStatuses, type ConnectorSide, type SharaDocument, type TargetRef } from '../domain/schema';
import type { PlacementAnchor } from '../domain/placement';
import type { WarningTarget } from '../domain/validation';

interface Props {
  document: SharaDocument;
  selection: TargetRef | null;
  apply: (document: SharaDocument, selection?: TargetRef | null) => void;
  onInteract: (anchor: PlacementAnchor) => void;
  focusRequest?: WarningTarget | null;
  onFocusHandled: () => void;
  highlightedEdgeId?: string | null;
}
const targetEqual = (a: TargetRef, b: TargetRef) => a.kind === b.kind && a.id === b.id;

function Field({ label, value, multiline = false, onCommit }: { label: string; value: string; multiline?: boolean; onCommit: (value: string) => void }) {
  const Component = multiline ? 'textarea' : 'input';
  return <label className="field"><span>{label}</span><Component key={value} defaultValue={value} onBlur={event => { if (event.currentTarget.value !== value) onCommit(event.currentTarget.value); }} /></label>;
}

export function Inspector({ document, selection, apply, onInteract, focusRequest, onFocusHandled, highlightedEdgeId }: Props) {
  const rootRef = useRef<HTMLElement>(null);
  const target = highlightedEdgeId && document.semantic.edges.some(edge => edge.id === highlightedEdgeId)
    ? { kind: 'edge' as const, id: highlightedEdgeId }
    : selection ?? { kind: 'document' as const };
  const node = target.kind === 'node' ? document.semantic.nodes.find(item => item.id === target.id) : undefined;
  const edge = target.kind === 'edge' ? document.semantic.edges.find(item => item.id === target.id) : undefined;
  const group = target.kind === 'group' ? document.semantic.groups.find(item => item.id === target.id) : undefined;
  const rules = document.semantic.rules.filter(rule => targetEqual(rule.target, target));
  const questions = document.semantic.openQuestions.filter(question => targetEqual(question.target, target));

  useEffect(() => {
    if (!focusRequest) return;
    const focusId = focusRequest.id ? `${focusRequest.kind}:${focusRequest.id}` : focusRequest.kind;
    const element = rootRef.current?.querySelector<HTMLElement>(`[data-focus-id="${focusId}"]`);
    element?.focus();
    element?.scrollIntoView?.({ block: 'center' });
    onFocusHandled();
  }, [focusRequest, onFocusHandled]);

  return <aside ref={rootRef} className="inspector" aria-label="選択対象の編集">
    <header><h2>{node ? node.label || '名称未設定' : edge ? '接続の編集' : group ? group.label : '文書の編集'}</h2><code>{target.kind === 'document' ? document.id : target.id}</code></header>
    <div className="inspector__scroll">
      {!selection && <>
        <Field label="文書名" value={document.semantic.title} onCommit={title => apply({ ...document, semantic: { ...document.semantic, title } })} />
        <Field label="目的" multiline value={document.semantic.purpose} onCommit={purpose => apply({ ...document, semantic: { ...document.semantic, purpose } })} />
        <Field label="対象範囲（1行1項目）" multiline value={document.semantic.scope.join('\n')} onCommit={value => apply({ ...document, semantic: { ...document.semantic, scope: value.split('\n').filter(Boolean) } })} />
        <Field label="対象外（1行1項目）" multiline value={document.semantic.outOfScope.join('\n')} onCommit={value => apply({ ...document, semantic: { ...document.semantic, outOfScope: value.split('\n').filter(Boolean) } })} />
      </>}
      {node && <>
        <Field label="名前" value={node.label} onCommit={label => { onInteract({ kind: 'node', id: node.id }); apply(updateNode(document, node.id, { label })); }} />
        <label className="field"><span>種別</span><select value={node.type} onChange={event => { onInteract({ kind: 'node', id: node.id }); apply(updateNode(document, node.id, { type: event.target.value as typeof node.type })); }}>{nodeTypes.map(type => <option key={type} value={type}>{NODE_TYPE_LABELS[type]}</option>)}</select></label>
        <Field label="説明" multiline value={node.description} onCommit={description => { onInteract({ kind: 'node', id: node.id }); apply(updateNode(document, node.id, { description })); }} />
        <Field label="担当" value={node.actor} onCommit={actor => { onInteract({ kind: 'node', id: node.id }); apply(updateNode(document, node.id, { actor })); }} />
        {node.type === 'decision' && <Field label="判定条件" multiline value={node.condition ?? ''} onCommit={condition => apply(updateNode(document, node.id, { condition }))} />}
        <Field label="入力（1行1項目）" multiline value={node.inputs.join('\n')} onCommit={value => apply(updateNode(document, node.id, { inputs: value.split('\n').filter(Boolean) }))} />
        <Field label="出力（1行1項目）" multiline value={node.outputs.join('\n')} onCommit={value => apply(updateNode(document, node.id, { outputs: value.split('\n').filter(Boolean) }))} />
        <label className="field"><span>所属グループ</span><select value={node.groupId ?? ''} onChange={event => apply(updateNode(document, node.id, { groupId: event.target.value || undefined }))}><option value="">所属なし</option>{document.semantic.groups.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
      </>}
      {edge && <>
        {highlightedEdgeId === edge.id && <p className="edge-editor-callout">接続を作成しました。関係・条件・接続面を確認してください。</p>}
        <div className="edge-summary"><span>{document.semantic.nodes.find(n => n.id === edge.source)?.label}</span><b>→</b><span>{document.semantic.nodes.find(n => n.id === edge.target)?.label}</span></div>
        <label className="field"><span>接続元</span><select value={edge.source} onChange={event => { const endpoint = document.presentation.edgeEndpoints[edge.id]; apply(reconnectEdge(document, edge.id, event.target.value, edge.target, endpoint.sourceSide, endpoint.targetSide), { kind: 'edge', id: edge.id }); }}>{document.semantic.nodes.map(item => <option key={item.id} value={item.id}>{item.label || '名称未設定'}</option>)}</select></label>
        <label className="field"><span>接続元の面</span><select value={document.presentation.edgeEndpoints[edge.id].sourceSide} onChange={event => { const endpoint = document.presentation.edgeEndpoints[edge.id]; apply(reconnectEdge(document, edge.id, edge.source, edge.target, event.target.value as ConnectorSide, endpoint.targetSide), { kind: 'edge', id: edge.id }); }}>{connectorSides.map(side => <option key={side} value={side}>{side}</option>)}</select></label>
        <label className="field"><span>接続先</span><select value={edge.target} onChange={event => { const endpoint = document.presentation.edgeEndpoints[edge.id]; apply(reconnectEdge(document, edge.id, edge.source, event.target.value, endpoint.sourceSide, endpoint.targetSide), { kind: 'edge', id: edge.id }); }}>{document.semantic.nodes.map(item => <option key={item.id} value={item.id}>{item.label || '名称未設定'}</option>)}</select></label>
        <label className="field"><span>接続先の面</span><select value={document.presentation.edgeEndpoints[edge.id].targetSide} onChange={event => { const endpoint = document.presentation.edgeEndpoints[edge.id]; apply(reconnectEdge(document, edge.id, edge.source, edge.target, endpoint.sourceSide, event.target.value as ConnectorSide), { kind: 'edge', id: edge.id }); }}>{connectorSides.map(side => <option key={side} value={side}>{side}</option>)}</select></label>
        <label className="field"><span>関係</span><select value={edge.relation} onChange={event => apply(updateEdge(document, edge.id, { relation: event.target.value as typeof edge.relation }))}>{relations.map(relation => <option key={relation} value={relation}>{RELATION_LABELS[relation]}</option>)}</select></label>
        <Field label="表示ラベル" value={edge.label} onCommit={label => apply(updateEdge(document, edge.id, { label }))} />
        <Field label="条件" multiline value={edge.condition ?? ''} onCommit={condition => apply(updateEdge(document, edge.id, { condition }))} />
        <button className="danger-link" onClick={() => apply(deleteEdge(document, edge.id), null)}>この接続を削除</button>
      </>}
      {group && <>
        <Field label="グループ名" value={group.label} onCommit={label => { onInteract({ kind: 'group', id: group.id }); apply(updateGroup(document, group.id, { label })); }} />
        <Field label="説明" multiline value={group.description} onCommit={description => { onInteract({ kind: 'group', id: group.id }); apply(updateGroup(document, group.id, { description })); }} />
        <p className="hint">削除しても所属ノードは残り、所属だけ解除されます。</p>
        <button className="danger-link" onClick={() => apply(deleteGroup(document, group.id), null)}>グループを解除</button>
      </>}
      <section className="inspector-section"><div className="section-title"><h3>ルール</h3><button onClick={() => apply(addRule(document, '', 'draft', target))}>追加</button></div>
        {rules.length === 0 && <p className="empty">この対象のルールはありません</p>}
        {rules.map(rule => <div className="rule-card" key={rule.id}><textarea data-focus-id={`rule:${rule.id}`} aria-label="ルール本文" defaultValue={rule.text} onBlur={event => event.currentTarget.value !== rule.text && apply(updateRule(document, rule.id, { text: event.currentTarget.value }))} /><div><select aria-label="ルール状態" value={rule.status} onChange={event => apply(updateRule(document, rule.id, { status: event.target.value as typeof rule.status }))}>{ruleStatuses.map(status => <option key={status} value={status}>{RULE_STATUS_LABELS[status]}</option>)}</select><button aria-label="ルール削除" onClick={() => apply(deleteRule(document, rule.id))}>削除</button></div></div>)}
      </section>
      <section className="inspector-section"><div className="section-title"><h3>未決事項</h3><button onClick={() => apply(addOpenQuestion(document, '', target))}>追加</button></div>
        {questions.length === 0 && <p className="empty">この対象の未決事項はありません</p>}
        {questions.map(question => <div className="rule-card" key={question.id}><textarea data-focus-id={`openQuestion:${question.id}`} aria-label="未決事項本文" defaultValue={question.text} onBlur={event => { const text = event.currentTarget.value; if (text !== question.text) apply({ ...document, semantic: { ...document.semantic, openQuestions: document.semantic.openQuestions.map(item => item.id === question.id ? { ...item, text } : item) } }); }} /><button aria-label="未決事項削除" onClick={() => apply(deleteOpenQuestion(document, question.id))}>削除</button></div>)}
      </section>
    </div>
  </aside>;
}
