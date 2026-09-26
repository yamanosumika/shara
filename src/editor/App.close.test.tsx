import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import capability from '../../src-tauri/capabilities/default.json';
import type { SaveOutcome } from '../platform/files';

const native = vi.hoisted(() => ({
  onCloseRequested: vi.fn(),
  destroy: vi.fn(),
  clearRecovery: vi.fn(),
  saveDocument: vi.fn(),
}));

vi.mock('mermaid', () => ({ default: { initialize: vi.fn(), render: async () => ({ svg: '<svg></svg>' }) } }));
vi.mock('../platform/runtime', () => ({ isTauri: () => true }));
vi.mock('@tauri-apps/api/window', () => ({ getCurrentWindow: () => native }));
vi.mock('../platform/files', () => ({ saveDocument: native.saveDocument, openDocument: vi.fn() }));
vi.mock('../platform/recovery', () => ({ clearRecovery: native.clearRecovery, listRecoveries: () => [], saveRecovery: vi.fn() }));
vi.mock('../platform/pwa', () => ({ registerPwa: async () => () => undefined }));

import App from '../App';
import { freshEstimateFlow } from '../fixtures/estimateFlow';
import { useEditorStore } from '../store/editorStore';

type CloseHandler = (event: { preventDefault: () => void }) => void | Promise<void>;
let closeHandler: CloseHandler;
const saved: SaveOutcome = {
  kind: 'saved', adapter: 'native', fileName: 'test.shara.json',
  reference: { kind: 'native', fileName: 'test.shara.json', handle: 'test-handle', stamp: 'saved-stamp' },
};

async function requestClose() {
  await waitFor(() => expect(native.onCloseRequested).toHaveBeenCalled());
  const event = { preventDefault: vi.fn() };
  await act(async () => { await closeHandler(event); });
  return event;
}

function pendingSave() {
  let resolve!: (outcome: SaveOutcome) => void;
  const promise = new Promise<SaveOutcome>(done => { resolve = done; });
  native.saveDocument.mockReturnValue(promise);
  return async () => { await act(async () => { resolve(saved); await promise; }); };
}

describe('未保存文書の終了確認', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    useEditorStore.getState().replace(freshEstimateFlow());
    useEditorStore.setState({ savedFingerprint: '', message: undefined });
    native.onCloseRequested.mockImplementation((handler: CloseHandler) => {
      closeHandler = handler;
      return Promise.resolve(() => undefined);
    });
    native.destroy.mockResolvedValue(undefined);
    native.saveDocument.mockResolvedValue(saved);
  });

  it('メイン画面に終了処理で使うdestroy権限を付与する', () => {
    expect(capability.windows).toContain('main');
    expect(capability.permissions).toContain('core:window:allow-destroy');
  });

  it('終了用の文言を表示しキャンセルすると編集を保持する', async () => {
    const user = userEvent.setup();
    render(<App />);
    const event = await requestClose();
    const dialog = screen.getByRole('dialog', { name: '未保存の変更があります' });
    expect(event.preventDefault).toHaveBeenCalledOnce();
    expect(within(dialog).getByRole('button', { name: '破棄して終了' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: '保存して終了' })).toBeInTheDocument();
    expect(dialog).not.toHaveTextContent('続行');
    await user.click(within(dialog).getByRole('button', { name: 'キャンセル' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(native.destroy).not.toHaveBeenCalled();
    expect(native.saveDocument).not.toHaveBeenCalled();
    expect(native.clearRecovery).not.toHaveBeenCalled();
  });

  it('破棄して終了では保存を呼ばずウィンドウを終了する', async () => {
    const user = userEvent.setup();
    const sessionId = useEditorStore.getState().sessionId;
    render(<App />);
    await requestClose();
    await user.click(screen.getByRole('button', { name: '破棄して終了' }));
    expect(native.clearRecovery).toHaveBeenCalledWith(sessionId);
    expect(native.destroy).toHaveBeenCalledOnce();
    expect(native.saveDocument).not.toHaveBeenCalled();
  });

  it('復旧コピーを消去できなくても破棄して終了する', async () => {
    const user = userEvent.setup();
    native.clearRecovery.mockImplementation(() => { throw new Error('storage unavailable'); });
    render(<App />);
    await requestClose();
    await user.click(screen.getByRole('button', { name: '破棄して終了' }));
    expect(native.destroy).toHaveBeenCalledOnce();
    expect(native.saveDocument).not.toHaveBeenCalled();
  });

  it('保存して終了では保存完了後に終了する', async () => {
    const user = userEvent.setup();
    const finishSave = pendingSave();
    render(<App />);
    await requestClose();
    await user.click(screen.getByRole('button', { name: '保存して終了' }));
    expect(native.saveDocument).toHaveBeenCalledOnce();
    expect(native.destroy).not.toHaveBeenCalled();
    await finishSave();
    await waitFor(() => expect(native.destroy).toHaveBeenCalledOnce());
  });

  it.each<SaveOutcome>([
    { kind: 'cancelled' },
    { kind: 'failed', message: 'read-only file' },
    { kind: 'conflict', message: 'external change' },
    { kind: 'unknown', message: 'no result' },
  ])('保存が完了しない結果 $kind では終了せず破棄終了を選び直せる', async outcome => {
    const user = userEvent.setup();
    native.saveDocument.mockResolvedValue(outcome);
    render(<App />);
    await requestClose();
    await user.click(screen.getByRole('button', { name: '保存して終了' }));
    expect(native.destroy).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: '破棄して終了' }));
    expect(native.destroy).toHaveBeenCalledOnce();
  });

  it('保存中に編集が増えた場合は保存完了後も終了しない', async () => {
    const user = userEvent.setup();
    const finishSave = pendingSave();
    render(<App />);
    await requestClose();
    await user.click(screen.getByRole('button', { name: '保存して終了' }));
    act(() => {
      const current = useEditorStore.getState().document;
      useEditorStore.getState().apply({ ...current, semantic: { ...current.semantic, title: '保存開始後の編集' } });
    });
    await finishSave();
    expect(native.destroy).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '破棄して終了' })).toBeInTheDocument();
  });

  it('保存待ち中も破棄して終了でき後からの保存完了で再度終了しない', async () => {
    const user = userEvent.setup();
    const finishSave = pendingSave();
    render(<App />);
    await requestClose();
    await user.click(screen.getByRole('button', { name: '保存して終了' }));
    await user.click(screen.getByRole('button', { name: '破棄して終了' }));
    expect(native.destroy).toHaveBeenCalledOnce();
    await finishSave();
    expect(native.destroy).toHaveBeenCalledOnce();
  });

  it('保存待ち中にキャンセルしたら保存完了後も終了しない', async () => {
    const user = userEvent.setup();
    const finishSave = pendingSave();
    render(<App />);
    await requestClose();
    await user.click(screen.getByRole('button', { name: '保存して終了' }));
    await user.click(screen.getByRole('button', { name: 'キャンセル' }));
    await finishSave();
    expect(native.destroy).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('新規作成の確認は続行の文言を維持する', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: '新規' }));
    expect(screen.getByRole('button', { name: '保存して続行' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '破棄して続行' }));
    expect(useEditorStore.getState().document.semantic.nodes).toHaveLength(0);
    expect(native.destroy).not.toHaveBeenCalled();
  });
});
