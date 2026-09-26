import { invoke } from '@tauri-apps/api/core';
import { parseDocumentText, serializeDocument, type SharaDocument } from '../domain/schema';
import { isTauri } from './runtime';

interface BrowserWritable {
  write(data: string): Promise<void>;
  close(): Promise<void>;
}

export interface BrowserFileHandle {
  name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<BrowserWritable>;
}

interface FilePickerWindow extends Window {
  showOpenFilePicker?: (options: unknown) => Promise<BrowserFileHandle[]>;
  showSaveFilePicker?: (options: unknown) => Promise<BrowserFileHandle>;
}

export type FileReference =
  | { kind: 'native'; fileName: string; handle: string; stamp: string }
  | { kind: 'web-fsa'; fileName: string; handle: BrowserFileHandle }
  | { kind: 'web-import'; fileName: string };

export interface OpenedDocument { document: SharaDocument; reference: FileReference }

export type SaveOutcome =
  | { kind: 'saved'; adapter: 'native' | 'web-fsa'; fileName: string; reference: FileReference; warning?: string }
  | { kind: 'download-requested'; fileName: string }
  | { kind: 'cancelled' }
  | { kind: 'conflict'; message: string }
  | { kind: 'failed'; message: string }
  | { kind: 'unknown'; message: string };

function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

function classifyNativeFailure(error: unknown): SaveOutcome {
  const message = String(error);
  if (message.includes('[conflict]')) return { kind: 'conflict', message: message.replace('[conflict]', '').trim() };
  if (message.includes('[failed]')) return { kind: 'failed', message: message.replace('[failed]', '').trim() };
  return { kind: 'unknown', message };
}

async function openWithInput(): Promise<OpenedDocument | null> {
  return await new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.shara.json,application/json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) { resolve(null); return; }
      try { resolve({ document: parseDocumentText(await file.text()), reference: { kind: 'web-import', fileName: file.name } }); } catch (error) { reject(error); }
    };
    input.click();
  });
}

export async function openDocument(): Promise<OpenedDocument | null> {
  if (isTauri()) {
    const result = await invoke<{ content: string; file_name: string; handle: string; stamp: string } | null>('open_document_dialog');
    if (!result) return null;
    return {
      document: parseDocumentText(result.content),
      reference: { kind: 'native', fileName: result.file_name, handle: result.handle, stamp: result.stamp },
    };
  }
  const picker = (window as FilePickerWindow).showOpenFilePicker;
  if (!picker) return openWithInput();
  try {
    const [handle] = await picker({ multiple: false, types: [{ description: 'SHARA文書', accept: { 'application/json': ['.shara.json'] } }] });
    if (!handle) return null;
    const file = await handle.getFile();
    return { document: parseDocumentText(await file.text()), reference: { kind: 'web-fsa', fileName: file.name, handle } };
  } catch (error) {
    if (isAbort(error)) return null;
    throw error;
  }
}

function download(name: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function writeBrowserFile(handle: BrowserFileHandle, content: string): Promise<SaveOutcome> {
  try {
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
    return { kind: 'saved', adapter: 'web-fsa', fileName: handle.name, reference: { kind: 'web-fsa', fileName: handle.name, handle } };
  } catch (error) {
    if (isAbort(error)) return { kind: 'cancelled' };
    return { kind: 'failed', message: String(error) };
  }
}

export async function saveDocument(document: SharaDocument, current?: FileReference, saveAs = false): Promise<SaveOutcome> {
  const content = serializeDocument(document);
  if (isTauri()) {
    try {
      if (!saveAs && current?.kind === 'native') {
        const result = await invoke<{ file_name: string; handle: string; stamp: string; warning?: string }>('save_document', { handle: current.handle, content, expectedStamp: current.stamp });
        const reference: FileReference = { kind: 'native', fileName: result.file_name, handle: result.handle, stamp: result.stamp };
        return { kind: 'saved', adapter: 'native', fileName: result.file_name, reference, warning: result.warning };
      }
      const result = await invoke<{ file_name: string; handle: string; stamp: string; warning?: string } | null>('save_document_as_dialog', { content });
      if (!result) return { kind: 'cancelled' };
      const reference: FileReference = { kind: 'native', fileName: result.file_name, handle: result.handle, stamp: result.stamp };
      return { kind: 'saved', adapter: 'native', fileName: result.file_name, reference, warning: result.warning };
    } catch (error) {
      return classifyNativeFailure(error);
    }
  }
  if (!saveAs && current?.kind === 'web-fsa') return writeBrowserFile(current.handle, content);
  const safeName = `${(document.semantic.title || '名称未設定').replace(/[\\/:*?"<>|]/g, '_')}.shara.json`;
  const picker = (window as FilePickerWindow).showSaveFilePicker;
  if (picker) {
    try {
      const handle = await picker({ suggestedName: safeName, types: [{ description: 'SHARA文書', accept: { 'application/json': ['.shara.json'] } }] });
      return writeBrowserFile(handle, content);
    } catch (error) {
      if (isAbort(error)) return { kind: 'cancelled' };
      return { kind: 'failed', message: String(error) };
    }
  }
  download(safeName, content, 'application/json;charset=utf-8');
  return { kind: 'download-requested', fileName: safeName };
}

export function saveTextFile(name: string, content: string): void {
  download(name, content, 'text/plain;charset=utf-8');
}
