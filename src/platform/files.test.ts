import { afterEach, describe, expect, it, vi } from 'vitest';
import { freshEstimateFlow } from '../fixtures/estimateFlow';
import { saveDocument, type BrowserFileHandle } from './files';

describe('browser save adapter', () => {
  afterEach(() => {
    Reflect.deleteProperty(window, 'showSaveFilePicker');
    vi.restoreAllMocks();
  });

  it('File System Accessではclose成功後だけ保存完了にする', async () => {
    const events: string[] = [];
    const handle: BrowserFileHandle = {
      name: 'flow.shara.json',
      getFile: vi.fn(),
      createWritable: vi.fn(async () => ({
        write: async () => { events.push('write'); },
        close: async () => { events.push('close'); },
      })),
    };
    Object.defineProperty(window, 'showSaveFilePicker', { configurable: true, value: vi.fn(async () => handle) });
    const result = await saveDocument(freshEstimateFlow());
    expect(events).toEqual(['write', 'close']);
    expect(result).toMatchObject({ kind: 'saved', adapter: 'web-fsa', fileName: 'flow.shara.json' });
  });

  it('権限拒否をdownloadへ無言で切り替えない', async () => {
    Object.defineProperty(window, 'showSaveFilePicker', { configurable: true, value: vi.fn(async () => { throw new DOMException('denied', 'NotAllowedError'); }) });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click');
    const result = await saveDocument(freshEstimateFlow());
    expect(result.kind).toBe('failed');
    expect(click).not.toHaveBeenCalled();
  });
});
