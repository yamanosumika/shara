import { beforeEach, describe, expect, it } from 'vitest';
import { deleteNodes, updateNode } from '../domain/commands';
import { freshEstimateFlow } from '../fixtures/estimateFlow';
import { isDirty, useEditorStore } from './editorStore';

describe('editor history and saved baseline', () => {
  beforeEach(() => useEditorStore.getState().replace(freshEstimateFlow(), { kind: 'web-import', fileName: '見積作成フロー.shara.json' }));

  it('削除とUndoで接続・ルール参照まで復元する', () => {
    const source = useEditorStore.getState().document;
    useEditorStore.getState().apply(deleteNodes(source, ['node_decide_00000003']));
    expect(useEditorStore.getState().document.semantic.rules.find(rule => rule.id === 'rule_issue_once_0001')?.target.needsReview).toBe(true);
    useEditorStore.getState().undo();
    expect(useEditorStore.getState().document.semantic.rules.find(rule => rule.id === 'rule_issue_once_0001')?.target).toEqual({ kind: 'node', id: 'node_decide_00000003' });
    expect(useEditorStore.getState().document.semantic.edges.some(edge => edge.source === 'node_decide_00000003')).toBe(true);
  });

  it('保存開始後の編集を保存済みにせず、保存snapshotへUndoすると保存済みになる', () => {
    const state = useEditorStore.getState();
    const saving = updateNode(state.document, 'node_create_00000002', { label: '保存対象' });
    state.apply(saving);
    const afterSaveEdit = updateNode(saving, 'node_create_00000002', { label: '保存後の編集' });
    useEditorStore.getState().apply(afterSaveEdit);
    useEditorStore.getState().markSaved({ kind: 'web-import', fileName: 'flow.shara.json' }, saving);
    expect(isDirty(useEditorStore.getState())).toBe(true);
    useEditorStore.getState().undo();
    expect(useEditorStore.getState().document.semantic.nodes.find(node => node.id === 'node_create_00000002')?.label).toBe('保存対象');
    expect(isDirty(useEditorStore.getState())).toBe(false);
  });

  it('配置基準は選択解除で維持し、削除と文書切替で無効化する', () => {
    useEditorStore.getState().selectNodes(['node_create_00000002']);
    useEditorStore.getState().selectNodes([], false);
    expect(useEditorStore.getState().placementAnchor).toEqual({ kind: 'node', id: 'node_create_00000002' });
    useEditorStore.getState().apply(deleteNodes(useEditorStore.getState().document, ['node_create_00000002']));
    expect(useEditorStore.getState().placementAnchor).toBeNull();
    useEditorStore.getState().markInteracted({ kind: 'group', id: 'group_estimate_editor_0001' });
    useEditorStore.getState().replace(freshEstimateFlow());
    expect(useEditorStore.getState().placementAnchor).toBeNull();
  });
});
