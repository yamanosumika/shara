import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Background, Controls, MiniMap, ReactFlow, ReactFlowProvider, applyNodeChanges, type Connection, type Edge as FlowEdge, type Node as FlowNode, type NodeChange, type OnSelectionChangeParams, type ReactFlowInstance } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { addEdge, addGroup, addNode, canConnect, deleteEdge, deleteNodes, duplicateSelection, moveNodes, reconnectEdge, resizeGroup } from './domain/commands';
import { describeSemanticChange, diffSemantic } from './domain/diff';
import { createBlankDocument } from './domain/document';
import { NODE_TYPE_LABELS, RELATION_LABELS } from './domain/relations';
import { nodeTypes, sharaDocumentSchema, type ConnectorSide, type NodeType, type SharaDocument, type TargetRef } from './domain/schema';
import { findNodePlacement } from './domain/placement';
import { validateWarnings, type WarningTarget } from './domain/validation';
import { Palette } from './editor/Palette';
import { Inspector } from './editor/Inspector';
import { OutputPanel } from './editor/OutputPanel';
import { GroupNode, SharaNode } from './editor/SharaNode';
import { exportCodex } from './exporters';
import { layoutDocument } from './layout/elk';
import { copyText } from './platform/clipboard';
import { openDocument, saveDocument } from './platform/files';
import { clearRecovery, listRecoveries, saveRecovery, type RecoverySnapshot } from './platform/recovery';
import { isTauri } from './platform/runtime';
import { registerPwa, type PwaUpdate } from './platform/pwa';
import { isDirty, useEditorStore } from './store/editorStore';

const nodeTypesMap = { shara: SharaNode, group: GroupNode };
interface UnsavedAction { kind: 'close' | 'continue'; run: () => void }

function AppContent() {
  const store = useEditorStore();
  const { document, apply, replace, selection, selectedNodeIds, generation, sessionId, markInteracted } = store;
  const warnings = useMemo(() => validateWarnings(document), [document]);
  const [flowNodes, setFlowNodes] = useState<FlowNode[]>([]);
  const [search, setSearch] = useState('');
  const [flow, setFlow] = useState<ReactFlowInstance | null>(null);
  const [unsavedAction, setUnsavedAction] = useState<UnsavedAction | null>(null);
  const pendingUnsavedAction = useRef<UnsavedAction | null>(null);
  const recoveryTimer = useRef<number | undefined>(undefined);
  const updateUnsavedAction = useCallback((action: UnsavedAction | null) => {
    pendingUnsavedAction.current = action;
    setUnsavedAction(action);
  }, []);
  const [warningFocus, setWarningFocus] = useState<WarningTarget | null>(null);
  const [highlightedEdgeId, setHighlightedEdgeId] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [recoveryCandidates, setRecoveryCandidates] = useState<RecoverySnapshot[]>([]);
  const [pwaUpdate, setPwaUpdate] = useState<PwaUpdate | null>(null);
  const copiedIds = useRef<string[]>([]);
  const initialDocument = useRef(document);
  const saving = useRef<Promise<boolean> | null>(null);

  const buildFlowNodes = useCallback((doc: SharaDocument): FlowNode[] => {
    const warningCounts = new Map<string, number>();
    validateWarnings(doc).forEach(warning => { if (warning.target?.kind === 'node' && warning.target.id) warningCounts.set(warning.target.id, (warningCounts.get(warning.target.id) ?? 0) + 1); });
    const groups: FlowNode[] = doc.semantic.groups.map(group => {
      const geometry = doc.presentation.groupGeometry[group.id] ?? { x: 20, y: 20, width: 420, height: 240 };
      const members = doc.semantic.nodes.filter(node => node.groupId === group.id).map(node => doc.presentation.nodePositions[node.id]).filter(Boolean);
      const minWidth = Math.max(160, ...members.map(point => point.x - geometry.x + 204));
      const minHeight = Math.max(100, ...members.map(point => point.y - geometry.y + 96));
      return { id: group.id, type: 'group', position: { x: geometry.x, y: geometry.y }, style: { width: geometry.width, height: geometry.height }, data: { label: group.label, minWidth, minHeight, onResizeEnd: (width: number, height: number) => { markInteracted({ kind: 'group', id: group.id }); apply(resizeGroup(doc, group.id, width, height)); } }, selectable: true, draggable: true, zIndex: -1 };
    });
    const nodes: FlowNode[] = doc.semantic.nodes.map(node => ({ id: node.id, type: 'shara', position: doc.presentation.nodePositions[node.id] ?? { x: 80, y: 80 }, data: { label: node.label, type: node.type, condition: node.condition, warningCount: warningCounts.get(node.id) ?? 0 }, selected: selectedNodeIds.includes(node.id), zIndex: 1 }));
    return [...groups, ...nodes];
  }, [selectedNodeIds, apply, markInteracted]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => { if (active) setFlowNodes(buildFlowNodes(document)); });
    return () => { active = false; };
  }, [document, buildFlowNodes]);
  useEffect(() => { const timer = window.setTimeout(() => { try { saveRecovery(document, sessionId, generation); } catch (error) { useEditorStore.getState().setMessage({ tone: 'error', text: `復旧コピーを保存できませんでした: ${String(error)}` }); } }, 700); recoveryTimer.current = timer; return () => clearTimeout(timer); }, [document, generation, sessionId]);
  useEffect(() => {
    const candidates = listRecoveries().filter(recovery => JSON.stringify(recovery.document) !== JSON.stringify(initialDocument.current));
    if (candidates.length) setRecoveryCandidates(candidates);
  }, [replace]);
  useEffect(() => {
    if (!isTauri()) return;
    let active = true;
    let unlisten: (() => void) | undefined;
    void import('@tauri-apps/api/window').then(async ({ getCurrentWindow }) => {
      const appWindow = getCurrentWindow();
      const stop = await appWindow.onCloseRequested(event => {
        if (!active) return;
        if (!isDirty(useEditorStore.getState())) return;
        event.preventDefault();
        if (pendingUnsavedAction.current?.kind === 'close') return;
        updateUnsavedAction({ kind: 'close', run: () => {
          window.clearTimeout(recoveryTimer.current);
          void appWindow.destroy().catch(error => useEditorStore.getState().setMessage({ tone: 'error', text: `終了できませんでした: ${String(error)}` }));
        } });
      });
      if (active) unlisten = stop; else stop();
    });
    return () => { active = false; unlisten?.(); };
  }, [updateUnsavedAction]);
  useEffect(() => {
    let dispose: () => void = () => undefined;
    void registerPwa(setPwaUpdate).then(stop => { dispose = stop; }).catch(error => useEditorStore.getState().setMessage({ tone: 'error', text: `offline機能を開始できませんでした: ${String(error)}` }));
    return () => dispose();
  }, []);
  useEffect(() => {
    if (isTauri()) return;
    const handler = (event: BeforeUnloadEvent) => {
      if (!isDirty(useEditorStore.getState())) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  const flowEdges = useMemo<FlowEdge[]>(() => document.semantic.edges.map(edge => {
    const endpoint = document.presentation.edgeEndpoints[edge.id];
    return { id: edge.id, source: edge.source, target: edge.target, sourceHandle: `source-${endpoint.sourceSide}`, targetHandle: `target-${endpoint.targetSide}`, label: edge.label || RELATION_LABELS[edge.relation], type: 'smoothstep', animated: edge.relation === 'triggers', style: { stroke: edge.relation === 'no' ? '#a04c3f' : '#4e6573', strokeWidth: 1.7 }, labelStyle: { fill: '#2f3e46', fontSize: 12 }, markerEnd: { type: 'arrowclosed' as const } };
  }), [document]);

  const message = (tone: 'info' | 'error', text: string) => { store.setMessage({ tone, text }); window.setTimeout(() => { if (useEditorStore.getState().message?.text === text) useEditorStore.getState().setMessage(); }, 3500); };
  const fallbackPlacement = () => flow ? flow.screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }) : { x: 120, y: 100 };
  const addFromPalette = (type: NodeType, position?: { x: number; y: number }) => {
    setHighlightedEdgeId(null);
    const target = position ?? findNodePlacement(document, store.placementAnchor, fallbackPlacement());
    if (!target) { message('error', '近くに配置できる空きがありません。部品をドラッグして位置を指定してください'); return; }
    const next = addNode(document, { type, label: NODE_TYPE_LABELS[type] }, target);
    const id = next.semantic.nodes.at(-1)!.id;
    apply(next, { kind: 'node', id });
    store.selectNodes([id]);
  };
  const sideFromHandle = (handle: string | null | undefined, prefix: 'source' | 'target', fallback: ConnectorSide): ConnectorSide => {
    const side = handle?.replace(`${prefix}-`, '') as ConnectorSide | undefined;
    return side && ['top', 'right', 'bottom', 'left'].includes(side) ? side : fallback;
  };
  const onConnect = (connection: Connection) => {
    if (!connection.source || !connection.target) return;
    try {
      const next = addEdge(document, connection.source, connection.target, 'next', sideFromHandle(connection.sourceHandle, 'source', 'right'), sideFromHandle(connection.targetHandle, 'target', 'left'));
      const id = next.semantic.edges.at(-1)!.id;
      apply(next, { kind: 'edge', id });
      useEditorStore.setState({ selectedNodeIds: [] });
      setHighlightedEdgeId(id);
    } catch (error) { message('error', String(error)); }
  };
  const onSelectionChange = ({ nodes, edges }: OnSelectionChangeParams) => {
    const semanticIds = nodes.filter(node => node.type === 'shara').map(node => node.id);
    if (semanticIds.length) store.selectNodes(semanticIds);
    if (edges.length === 1 && semanticIds.length === 0) store.select({ kind: 'edge', id: edges[0].id });
    else if (nodes.length === 1 && nodes[0].type === 'group') { store.select({ kind: 'group', id: nodes[0].id }); store.markInteracted({ kind: 'group', id: nodes[0].id }); }
  };
  const onNodesChange = (changes: NodeChange<FlowNode>[]) => setFlowNodes(nodes => applyNodeChanges(changes, nodes));
  const onNodeDragStop = (_: MouseEvent | TouchEvent, node: FlowNode) => {
    if (node.type === 'group') {
      const old = document.presentation.groupGeometry[node.id]; if (!old) return;
      const dx = node.position.x - old.x, dy = node.position.y - old.y;
      const memberPositions = Object.fromEntries(document.semantic.nodes.filter(item => item.groupId === node.id).map(item => [item.id, { x: (document.presentation.nodePositions[item.id]?.x ?? 0) + dx, y: (document.presentation.nodePositions[item.id]?.y ?? 0) + dy }]));
      apply({ ...moveNodes(document, memberPositions), presentation: { ...document.presentation, nodePositions: { ...document.presentation.nodePositions, ...memberPositions }, groupGeometry: { ...document.presentation.groupGeometry, [node.id]: { ...old, x: node.position.x, y: node.position.y } } } });
      store.markInteracted({ kind: 'group', id: node.id });
    } else { apply(moveNodes(document, { [node.id]: node.position })); store.markInteracted({ kind: 'node', id: node.id }); }
  };
  const onDrop = (event: React.DragEvent) => { event.preventDefault(); const type = event.dataTransfer.getData('application/shara-node-type') as NodeType; if (!nodeTypes.includes(type) || !flow) return; addFromPalette(type, flow.screenToFlowPosition({ x: event.clientX, y: event.clientY })); };

  const doSaveNow = async (saveAs = false): Promise<boolean> => {
    const parsed = sharaDocumentSchema.safeParse(document); if (!parsed.success) { message('error', `構造エラーのため保存できません: ${parsed.error.issues[0]?.message}`); return false; }
    const startGeneration = generation;
    const result = await saveDocument(document, store.file, saveAs);
    if (result.kind === 'cancelled') return false;
    if (result.kind === 'download-requested') { message('info', `ダウンロードを要求しました: ${result.fileName}（原本の保存完了とは異なります）`); return false; }
    if (result.kind === 'conflict') { message('error', `外部変更と競合したため保存を停止しました: ${result.message}`); return false; }
    if (result.kind === 'failed') { message('error', `保存できませんでした。現在の文書は保持されています: ${result.message}`); return false; }
    if (result.kind === 'unknown') { message('error', `保存結果を確認できません。自動再試行せず、原本と復旧候補を確認してください: ${result.message}`); return false; }
    try {
      store.markSaved(result.reference, document);
      const current = useEditorStore.getState();
      if (current.generation === startGeneration && JSON.stringify(current.document) === JSON.stringify(document)) { clearRecovery(sessionId); message('info', result.warning ? `保存しました。確認事項: ${result.warning}` : `保存しました: ${result.fileName}`); }
      else message('info', `保存開始時点の内容を保存しました: ${result.fileName}。その後の編集は未保存です`);
      return true;
    } catch (error) { message('error', `保存結果の反映に失敗しました。文書は未保存として扱います: ${String(error)}`); return false; }
  };
  const doSave = (saveAs = false): Promise<boolean> => {
    if (saving.current) return saving.current;
    saving.current = doSaveNow(saveAs).finally(() => { saving.current = null; });
    return saving.current;
  };
  const guard = (action: () => void) => { if (isDirty(store)) updateUnsavedAction({ kind: 'continue', run: action }); else action(); };
  const discardAndProceed = () => {
    if (!unsavedAction) return;
    const action = unsavedAction;
    updateUnsavedAction(null);
    try { clearRecovery(sessionId); }
    catch (error) {
      if (action.kind !== 'close') { message('error', `復旧コピーを破棄できませんでした: ${String(error)}`); return; }
      // Explicit discard-and-exit must not depend on recovery storage being writable.
    }
    action.run();
  };
  const saveAndProceed = async () => {
    const action = unsavedAction;
    if (!action || !await doSave(false)) return;
    if (pendingUnsavedAction.current !== action || isDirty(useEditorStore.getState())) return;
    updateUnsavedAction(null);
    action.run();
  };
  const doOpen = () => guard(async () => { try { const result = await openDocument(); if (result) replace(result.document, result.reference); } catch (error) { message('error', `読み込めませんでした。現在の文書は保持されています: ${String(error)}`); } });
  const autoLayout = async (direction: 'LR' | 'TB') => { const startId = document.id, startGeneration = generation; try { const layout = await layoutDocument(document, direction); const current = useEditorStore.getState(); if (current.document.id !== startId || current.generation !== startGeneration) { message('error', '編集中に整列結果が古くなったため適用しませんでした'); return; } apply({ ...moveNodes(document, layout.nodePositions), presentation: { ...document.presentation, direction, nodePositions: layout.nodePositions, groupGeometry: layout.groupGeometry } }); window.setTimeout(() => flow?.fitView({ padding: 0.18 }), 50); } catch (error) { message('error', `自動整列に失敗しました。現在の配置は保持されています: ${String(error)}`); } };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.isComposing || target?.matches('input, textarea, select, [contenteditable="true"]')) return;
      const mod = event.ctrlKey || event.metaKey;
      if (mod && event.key.toLowerCase() === 'z') { event.preventDefault(); if (event.shiftKey) store.redo(); else store.undo(); }
      else if (mod && event.key.toLowerCase() === 'y') { event.preventDefault(); store.redo(); }
      else if (mod && event.key.toLowerCase() === 'c' && selectedNodeIds.length) { copiedIds.current = selectedNodeIds; }
      else if (mod && event.key.toLowerCase() === 'v' && copiedIds.current.length) { event.preventDefault(); const result = duplicateSelection(document, copiedIds.current); apply(result.document); store.selectNodes(result.nodeIds); }
      else if (mod && event.key.toLowerCase() === 'd' && selectedNodeIds.length) { event.preventDefault(); const result = duplicateSelection(document, selectedNodeIds); apply(result.document); store.selectNodes(result.nodeIds); }
      else if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodeIds.length) { event.preventDefault(); apply(deleteNodes(document, selectedNodeIds), null); store.selectNodes([]); }
    };
    window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler);
  }, [document, selectedNodeIds, store, apply]);

  const results = search.trim() ? document.semantic.nodes.filter(node => `${node.label} ${node.description} ${node.actor}`.toLowerCase().includes(search.toLowerCase())) : [];
  const focusTarget = (target: WarningTarget | TargetRef) => {
    setWarningFocus(target as WarningTarget);
    if (target.kind === 'rule') {
      const item = document.semantic.rules.find(rule => rule.id === target.id);
      store.select(item?.target ?? null);
      return;
    }
    if (target.kind === 'openQuestion') {
      const item = document.semantic.openQuestions.find(question => question.id === target.id);
      store.select(item?.target ?? null);
      return;
    }
    store.select(target as TargetRef);
    if (target.kind === 'node' && target.id) {
      store.selectNodes([target.id], false);
      flow?.fitView({ nodes: [{ id: target.id }], padding: 1.8, duration: 300 });
    } else if (target.kind === 'group' && target.id) {
      flow?.fitView({ nodes: [{ id: target.id }], padding: 0.8, duration: 300 });
    } else if (target.kind === 'edge' && target.id) {
      const edge = document.semantic.edges.find(item => item.id === target.id);
      if (edge) flow?.fitView({ nodes: [{ id: edge.source }, { id: edge.target }], padding: 1.2, duration: 300 });
    }
  };
  const semanticChanges = store.savedDocument ? diffSemantic(store.savedDocument, document) : [];

  return <main className="app-shell">
    <header className="topbar">
      <div className="brand"><span className="brand-mark">S</span><div><b>SHARA</b><small>シャラ</small></div></div>
      <div className="document-status"><strong>{document.semantic.title}</strong><span className={isDirty(store) ? 'dirty' : 'saved'}>{isDirty(store) ? '未保存' : '保存済み'}</span></div>
      <div className="toolbar"><button onClick={() => guard(() => replace(createBlankDocument()))}>新規</button><button onClick={doOpen}>開く</button><button onClick={() => doSave(false)}>保存</button><button onClick={() => doSave(true)}>別名保存</button><span className="divider" /><button onClick={store.undo} disabled={!store.past.length}>↶ Undo</button><button onClick={store.redo} disabled={!store.future.length}>↷ Redo</button><button onClick={() => setShowDiff(true)}>意味差分</button><button onClick={() => setRecoveryCandidates(listRecoveries())}>復旧候補</button><span className="divider" /><button onClick={() => autoLayout('LR')}>左右整列</button><button onClick={() => autoLayout('TB')}>上下整列</button><button className="primary" onClick={async () => { try { await copyText(exportCodex(document, { mode: 'review' })); message('info', 'AI依頼文（設計レビュー）をコピーしました'); } catch (error) { message('error', `コピーできませんでした: ${String(error)}`); } }}>AI依頼文をコピー</button></div>
    </header>
    <div className="search-row"><label><span>検索</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="部品名・説明・担当" /></label>{results.length > 0 && <div className="search-results">{results.map(node => <button key={node.id} onClick={() => focusTarget({ kind: 'node', id: node.id })}>{node.label || '名称未設定'}</button>)}</div>}<button onClick={() => apply(addGroup(document))}>＋ グループ</button><button onClick={() => flow?.fitView({ padding: 0.15 })}>全体表示</button><span className="canvas-help">接続点をドラッグして部品をつなぐ</span></div>
    <div className="workspace">
      <Palette onAdd={type => addFromPalette(type)} />
      <section className="canvas" aria-label="設計キャンバス" onDrop={onDrop} onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }}>
        <ReactFlow nodes={flowNodes} edges={flowEdges} nodeTypes={nodeTypesMap} onInit={setFlow} onNodesChange={onNodesChange} onNodeDragStop={onNodeDragStop} onNodeClick={() => setHighlightedEdgeId(null)} onEdgeClick={(_, edge) => { setHighlightedEdgeId(edge.id); store.select({ kind: 'edge', id: edge.id }); }} onConnect={onConnect} isValidConnection={connection => Boolean(connection.source && connection.target && canConnect(document, connection.source, connection.target).ok)} onReconnect={(oldEdge, connection) => { if (!connection.source || !connection.target) return; try { apply(reconnectEdge(document, oldEdge.id, connection.source, connection.target, sideFromHandle(connection.sourceHandle, 'source', document.presentation.edgeEndpoints[oldEdge.id].sourceSide), sideFromHandle(connection.targetHandle, 'target', document.presentation.edgeEndpoints[oldEdge.id].targetSide)), { kind: 'edge', id: oldEdge.id }); } catch (error) { message('error', String(error)); } }} onSelectionChange={onSelectionChange} onEdgesDelete={(edges: FlowEdge[]) => { const next = edges.reduce((doc: SharaDocument, edge: FlowEdge) => deleteEdge(doc, edge.id), document); apply(next); }} onPaneClick={() => { setHighlightedEdgeId(null); store.select(null); store.selectNodes([], false); }} fitView minZoom={0.15} maxZoom={2.5} snapToGrid snapGrid={[16, 16]} connectionLineStyle={{ stroke: '#2d6a63', strokeWidth: 2 }} selectionOnDrag panOnScroll>
          <Background gap={24} size={1} color="#d9d7d1" /><MiniMap pannable zoomable nodeColor={node => node.type === 'group' ? '#e7e2d6' : '#79a6a0'} /><Controls showInteractive={false} />
        </ReactFlow>
        <div className="warning-drawer"><details><summary><span>検査</span><b>{warnings.length ? `${warnings.length}件の警告` : '警告なし'}</b></summary>{warnings.map((warning, index) => <button key={`${warning.code}-${index}`} onClick={() => warning.target && focusTarget(warning.target)}>{warning.message}</button>)}</details></div>
      </section>
      <Inspector document={document} selection={selection} apply={(next, nextSelection) => { try { apply(next, nextSelection); } catch (error) { message('error', String(error)); } }} onInteract={store.markInteracted} focusRequest={warningFocus} onFocusHandled={() => setWarningFocus(null)} highlightedEdgeId={highlightedEdgeId} />
    </div>
    <OutputPanel document={document} onMessage={message} />
    {store.message && <div role="status" className={`toast toast--${store.message.tone}`}>{store.message.text}</div>}
    {pwaUpdate && <div className="update-banner" role="status"><span>SHARAの新版を利用できます。未保存内容は自動再読込されません。</span><button onClick={() => { setPwaUpdate(null); pwaUpdate.apply(); }}>更新を適用</button><button onClick={() => setPwaUpdate(null)}>後で</button></div>}
    {showDiff && <div className="modal-backdrop"><div className="modal semantic-diff" role="dialog" aria-modal="true" aria-labelledby="diff-title"><h2 id="diff-title">保存済み文書との意味差分</h2>{!store.savedDocument ? <p>保存済みの比較基準がありません。</p> : semanticChanges.length === 0 ? <p>意味差分はありません。座標・接続面・表示倍率だけの変更は除外されます。</p> : <ul>{semanticChanges.map(change => <li key={`${change.kind}-${change.id}-${change.type}`}>{describeSemanticChange(change)}</li>)}</ul>}<div><button className="primary" onClick={() => setShowDiff(false)}>閉じる</button></div></div></div>}
    {recoveryCandidates.length > 0 && <div className="modal-backdrop"><div className="modal recovery-list" role="dialog" aria-modal="true" aria-labelledby="recovery-title"><h2 id="recovery-title">復旧候補</h2><ul>{recoveryCandidates.map(candidate => <li key={candidate.sessionId}><div><strong>{candidate.document.semantic.title}</strong><small>{new Date(candidate.savedAt).toLocaleString()}</small></div><button onClick={() => { replace(candidate.document); useEditorStore.setState({ savedFingerprint: '', savedDocument: undefined }); setRecoveryCandidates([]); }}>復旧</button><button onClick={() => { clearRecovery(candidate.sessionId); setRecoveryCandidates(listRecoveries()); }}>破棄</button></li>)}</ul><div><button onClick={() => setRecoveryCandidates([])}>閉じる</button></div></div></div>}
    {unsavedAction && <div className="modal-backdrop"><div className="modal" role="dialog" aria-modal="true" aria-labelledby="unsaved-title"><h2 id="unsaved-title">未保存の変更があります</h2><p>{unsavedAction.kind === 'close' ? '終了する前に保存するか、変更を破棄するか選んでください。' : '続ける前に保存するか、変更を破棄するか選んでください。'}</p><div><button onClick={() => updateUnsavedAction(null)}>キャンセル</button><button className="danger" onClick={discardAndProceed}>{unsavedAction.kind === 'close' ? '破棄して終了' : '破棄して続行'}</button><button className="primary" onClick={saveAndProceed}>{unsavedAction.kind === 'close' ? '保存して終了' : '保存して続行'}</button></div></div></div>}
  </main>;
}

export default function App() { return <ReactFlowProvider><AppContent /></ReactFlowProvider>; }
