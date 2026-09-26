import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('mermaid', () => ({ default: { initialize: vi.fn(), render: vi.fn().mockResolvedValue({ svg: '<svg></svg>' }) } }));
import App from '../App';
import { freshEstimateFlow } from '../fixtures/estimateFlow';
import { useEditorStore } from '../store/editorStore';

describe('SHARA editor', () => {
  beforeEach(() => {
    localStorage.clear();
    useEditorStore.getState().replace(freshEstimateFlow());
  });

  it('作業面と初期の設計レビュー出力を表示する', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByText('見積作成フロー')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '設計キャンバス' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '出力を開く' }));
    await user.click(screen.getByRole('button', { name: 'AI依頼文' }));
    expect((screen.getByLabelText('生成された出力') as HTMLTextAreaElement).value).toContain('設計レビュー');
  });

  it('パレットのクリックで部品を追加しUndoできる', async () => {
    const user = userEvent.setup();
    render(<App />);
    const before = useEditorStore.getState().document.semantic.nodes.length;
    await user.click(screen.getByRole('button', { name: '処理' }));
    expect(useEditorStore.getState().document.semantic.nodes).toHaveLength(before + 1);
    await user.click(screen.getByRole('button', { name: /Undo/ }));
    expect(useEditorStore.getState().document.semantic.nodes).toHaveLength(before);
  });

  it('警告から未決事項の入力欄へ移動してfocusする', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /未決事項: 4文字コード/ }));
    expect(screen.getByLabelText('未決事項本文')).toHaveFocus();
    expect(useEditorStore.getState().document.semantic.title).toBe('見積作成フロー');
  });

  it('保存済み文書からの意味変更を表示し配置変更を除外する', async () => {
    const user = userEvent.setup();
    const before = useEditorStore.getState().document;
    useEditorStore.getState().apply({
      ...before,
      semantic: { ...before.semantic, title: '変更後の見積作成フロー' },
      presentation: {
        ...before.presentation,
        nodePositions: {
          ...before.presentation.nodePositions,
          node_start_00000001: { x: 999, y: 999 },
        },
      },
    });
    render(<App />);
    await user.click(screen.getByRole('button', { name: '意味差分' }));
    expect(screen.getByRole('dialog', { name: '保存済み文書との意味差分' })).toHaveTextContent('文書 doc_estimate_flow_0001: 変更（title）');
    expect(screen.getByRole('dialog', { name: '保存済み文書との意味差分' })).not.toHaveTextContent('nodePositions');
  });
});
