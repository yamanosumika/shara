import { isTauri } from './runtime';

export async function copyText(text: string): Promise<void> {
  if (isTauri()) {
    const { writeText } = await import('@tauri-apps/plugin-clipboard-manager');
    await writeText(text);
    return;
  }
  if (!navigator.clipboard?.writeText) throw new Error('この環境ではクリップボードへ書き込めません');
  await navigator.clipboard.writeText(text);
}
