import { test, expect } from '@playwright/test';

test('separates search results and plays, seeks, and advances', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => {
    if (/\/music\/(?:search|direct-audio)/.test(response.url())) console.log(response.status(), response.url());
  });
  await page.goto('/');
  await page.locator('#searchInput').fill('Acid Jazz Kevin MacLeod');
  await page.locator('#searchBtn').click();

  const suggested = page.getByRole('region', { name: 'Suggested songs' });
  const community = page.getByRole('region', { name: 'Community uploads' });
  await expect(suggested).toBeVisible();
  await expect(community).toBeVisible();
  await expect(suggested).toContainText('Acid Jazz');
  await expect(suggested).toContainText('Kevin MacLeod');

  const first = suggested.locator('.list-item').filter({ hasText: 'Acid Jazz' }).first();
  await first.click();
  await expect(page.locator('#nowTitle')).toContainText('Acid Jazz');
  try {
    await expect.poll(async () => page.locator('#audioPrimary, #audioSecondary').evaluateAll(elements => Math.max(...elements.map(element => element.currentTime || 0))), { timeout: 60000 }).toBeGreaterThan(0.5);
  } catch (error) {
    console.log(await page.locator('#audioPrimary, #audioSecondary').evaluateAll(elements => elements.map(element => ({
      src: element.currentSrc,
      paused: element.paused,
      error: element.error && { code: element.error.code, message: element.error.message },
      networkState: element.networkState,
      readyState: element.readyState,
      duration: element.duration,
      time: element.currentTime
    }))));
    throw error;
  }

  await page.locator('.rail-item[data-tab="search"]').click();
  const second = suggested.locator('.list-item').nth(1);
  await second.getByRole('button', { name: 'Add to queue' }).click();
  await page.locator('.rail-item[data-tab="player"]').click();

  const before = await page.locator('#nowTitle').textContent();
  await page.locator('#audioPrimary, #audioSecondary').evaluateAll(elements => {
    const active = elements.find(element => !element.paused);
    if (!active || !Number.isFinite(active.duration)) throw new Error('No active seekable audio element');
    active.currentTime = Math.max(0, active.duration - 0.6);
  });
  await expect.poll(async () => page.locator('#nowTitle').textContent(), { timeout: 60000 }).not.toBe(before);
  await expect(page.locator('#progressBar')).toHaveAttribute('aria-valuetext', / of /);
  expect(errors).toEqual([]);
});
