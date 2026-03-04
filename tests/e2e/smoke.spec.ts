import { expect, test } from '@playwright/test';

test.describe('desktop smoke', () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, 'desktop smoke runs only on desktop project');
  });

  test('desktop shell loads with menubar', async ({ page }) => {
    await page.goto('/desktop');
    await expect(page).toHaveURL(/\/desktop$/);
    await expect(page.getByRole('menubar', { name: 'Application menu bar' })).toBeVisible();
    await expect(page.getByText('DG-Labs', { exact: true })).toBeVisible();
  });

  test('dock opens and closes Workbench window', async ({ page }) => {
    await page.goto('/desktop');
    const dockWorkbench = page.getByRole('button', { name: 'Workbench', exact: true });
    const closeWorkbench = page.getByRole('button', { name: 'Close Workbench' });

    await dockWorkbench.click();
    if ((await closeWorkbench.count()) === 0) {
      await dockWorkbench.click();
    }
    await expect(closeWorkbench).toBeVisible();

    await dockWorkbench.click();
    await expect(closeWorkbench).toHaveCount(0);
  });

  test('dock opens Agents Terminal window', async ({ page }) => {
    await page.goto('/desktop');
    await page.getByRole('button', { name: 'Agents' }).click();
    await expect(page.getByRole('dialog', { name: 'Agents Terminal' })).toBeVisible();
    await expect(page.getByText('Agents Runtime', { exact: true })).toBeVisible();
  });
});

test.describe('mobile smoke', () => {
  test('mobile request redirects to lock and mobile routes resolve', async ({ request }) => {
    const ua =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

    const redirect = await request.get('/', {
      headers: { 'user-agent': ua },
      maxRedirects: 0,
    });
    expect(redirect.status()).toBe(302);
    expect(redirect.headers()['location']).toBe('/mobile/lock');

    const lock = await request.get('/mobile/lock', {
      headers: { 'user-agent': ua },
    });
    expect(lock.status()).toBe(200);
    const lockHtml = await lock.text();
    expect(lockHtml).toContain('aria-label="Unlock"');
    expect(lockHtml).toContain('Tap to unlock');

    const home = await request.get('/mobile', {
      headers: { 'user-agent': ua },
    });
    expect(home.status()).toBe(200);
    const homeHtml = await home.text();
    expect(homeHtml).toContain('Notes');
    expect(homeHtml).toContain('Projects');
  });
});
