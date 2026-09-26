import { expect, test } from '@playwright/test';

test('初回取得後にofflineで起動・編集できる', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) {
    await page.reload();
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  }
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  const cacheState = await page.evaluate(async () => ({
    keys: await caches.keys(),
    root: Boolean(await caches.match(new URL('./', location.href).href)),
    index: Boolean(await caches.match(new URL('./index.html', location.href).href)),
    script: Boolean(await caches.match((document.querySelector('script[type="module"]') as HTMLScriptElement).src)),
  }));
  expect(cacheState.keys.length).toBeGreaterThan(0);
  expect(cacheState).toMatchObject({ root: true, index: true, script: true });
  await expect(page.getByText('SHARA', { exact: true })).toBeVisible();
  await page.route('**/*', route => route.abort('blockedbyclient'));
  await page.reload();
  await expect(page.getByText('SHARA', { exact: true })).toBeVisible();
  const before = await page.locator('.react-flow__node').count();
  await page.getByRole('button', { name: '処理' }).click();
  await expect(page.locator('.react-flow__node')).toHaveCount(before + 1);
});
