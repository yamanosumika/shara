import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('ノード追加・日本語改名・ルール追加・保存・AI依頼文出力', async ({ page, context, browserName }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'showOpenFilePicker', { configurable: true, value: undefined });
    Object.defineProperty(window, 'showSaveFilePicker', { configurable: true, value: undefined });
  });
  if (browserName === 'chromium') await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await expect(page.getByText('SHARA', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '処理' }).click();
  await expect(page.getByLabel('選択対象の編集').getByRole('heading', { name: '処理' })).toBeVisible();
  const name = page.getByLabel('名前');
  await name.fill('日本語の追加処理');
  await name.blur();
  await expect(page.getByLabel('設計キャンバス').getByText('日本語の追加処理', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: '追加' }).last().click();
  const question = page.getByLabel('未決事項本文').last();
  await question.fill('担当者を決める');
  await question.blur();
  await page.getByRole('button', { name: '出力を開く' }).click();
  await page.getByRole('button', { name: 'AI依頼文', exact: true }).click();
  await expect(page.getByLabel('生成された出力')).toContainText('日本語の追加処理');
  await expect(page.getByLabel('生成された出力')).toContainText('担当者を決める');
  await page.getByRole('button', { name: 'AI依頼文をコピー' }).last().click();
  if (browserName === 'chromium') await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toContain('日本語の追加処理');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.shara\.json$/);
  const savedPath = await download.path();
  expect(savedPath).not.toBeNull();
  const saved = JSON.parse(await readFile(savedPath!, 'utf8'));
  expect(saved.format).toBe('shara');
  expect(saved.semantic.nodes.some((node: { label: string }) => node.label === '日本語の追加処理')).toBe(true);
  expect(saved.semantic.openQuestions.some((item: { text: string }) => item.text === '担当者を決める')).toBe(true);

  await page.getByRole('button', { name: '新規' }).click();
  await page.getByRole('button', { name: '破棄して続行' }).click();
  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: '開く' }).click();
  const chooser = await chooserPromise;
  await chooser.setFiles(savedPath!);
  await expect(page.getByLabel('設計キャンバス').getByText('日本語の追加処理', { exact: true })).toBeVisible();
});

test('スクリーンショット用の見積作成フローを表示する', async ({ page }) => {
  await page.goto('/');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole('button', { name: '全体表示' }).click();
  await expect(page.getByText('見積DB', { exact: true })).toBeVisible();
  await page.screenshot({ path: 'samples/shara-main.png', fullPage: true });
});

test('外部通信なしで編集とMermaid描画が動く', async ({ page }) => {
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1') await route.continue();
    else await route.abort('blockedbyclient');
  });
  await page.goto('/');
  await page.getByRole('button', { name: '開始' }).click();
  await page.getByRole('button', { name: '出力を開く' }).click();
  await expect(page.getByLabel('Mermaidプレビュー').locator('svg')).toBeVisible();
});

test('GUIで追加した部品同士を接続する', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '新規' }).click();
  await page.getByRole('button', { name: '破棄して続行' }).click();
  await page.getByRole('button', { name: '開始' }).click();
  await page.getByRole('button', { name: '処理' }).click();
  const startNode = page.locator('.react-flow__node').filter({ hasText: '開始' });
  const processNode = page.locator('.react-flow__node').filter({ hasText: '処理' });
  const source = await startNode.locator('[data-handleid="source-right"]').boundingBox();
  const target = await processNode.locator('[data-handleid="target-left"]').boundingBox();
  expect(source).not.toBeNull();
  expect(target).not.toBeNull();
  await page.mouse.move(source!.x + source!.width / 2, source!.y + source!.height / 2);
  await page.mouse.down();
  await page.mouse.move(target!.x + target!.width / 2, target!.y + target!.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect(page.locator('.react-flow__edge')).toHaveCount(1);
  await expect(page.getByLabel('選択対象の編集').getByText('接続を作成しました。関係・条件・接続面を確認してください。')).toBeVisible();
});

test('四辺をまたぐ接続を作成し接続面をInspectorで確認する', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '新規' }).click();
  await page.getByRole('button', { name: '破棄して続行' }).click();
  for (const label of ['開始', '処理', 'データ', '終了']) await page.getByRole('button', { name: label, exact: true }).click();
  const nodes = page.locator('.react-flow__node').filter({ has: page.locator('.shara-node') });
  const connect = async (from: number, sourceSide: string, to: number, targetSide: string) => {
    const source = await nodes.nth(from).locator(`[data-handleid="source-${sourceSide}"]`).boundingBox();
    const target = await nodes.nth(to).locator(`[data-handleid="target-${targetSide}"]`).boundingBox();
    expect(source).not.toBeNull(); expect(target).not.toBeNull();
    await page.mouse.move(source!.x + source!.width / 2, source!.y + source!.height / 2);
    await page.mouse.down();
    await page.mouse.move(target!.x + target!.width / 2, target!.y + target!.height / 2, { steps: 8 });
    await page.mouse.up();
  };
  await connect(0, 'bottom', 1, 'top');
  await connect(1, 'top', 2, 'bottom');
  await connect(2, 'right', 3, 'top');
  await expect(page.locator('.react-flow__edge')).toHaveCount(3);
  await expect(page.getByLabel('接続元の面')).toHaveValue('right');
  await expect(page.getByLabel('接続先の面')).toHaveValue('top');
});

test('連続追加は直前に操作した部品の右隣へ進む', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '新規' }).click();
  await page.getByRole('button', { name: '破棄して続行' }).click();
  await page.getByRole('button', { name: '開始' }).click();
  await page.getByRole('button', { name: '処理' }).click();
  const first = await page.locator('.react-flow__node').filter({ hasText: '開始' }).boundingBox();
  const second = await page.locator('.react-flow__node').filter({ hasText: '処理' }).boundingBox();
  expect(first).not.toBeNull(); expect(second).not.toBeNull();
  expect(second!.x).toBeGreaterThan(first!.x + first!.width);
});

test('グループを右下からサイズ変更しUndoで元へ戻す', async ({ page }) => {
  await page.goto('/');
  const group = page.locator('.react-flow__node-group').filter({ hasText: '見積編集' });
  await group.click({ position: { x: 12, y: 12 }, force: true });
  const before = await group.boundingBox();
  const handle = await group.locator('.react-flow__resize-control.handle').boundingBox();
  expect(before).not.toBeNull();
  expect(handle).not.toBeNull();
  await page.mouse.move(handle!.x + handle!.width / 2, handle!.y + handle!.height / 2);
  await page.mouse.down();
  await page.mouse.move(handle!.x + handle!.width / 2 + 80, handle!.y + handle!.height / 2 + 64, { steps: 8 });
  await page.mouse.up();
  await expect.poll(async () => (await group.boundingBox())?.width ?? 0).toBeGreaterThan(before!.width + 40);
  await page.getByRole('button', { name: /Undo/ }).click();
  await expect.poll(async () => (await group.boundingBox())?.width ?? 0).toBeCloseTo(before!.width, 0);
});
