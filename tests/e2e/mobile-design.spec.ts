import { expect, test } from '@playwright/test';

const mobileUserAgent =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

test.use({
  userAgent: mobileUserAgent,
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});

test('process controls wait for hydration before accepting a tap', async ({ page }) => {
  let releaseScript!: () => void;
  const scriptGate = new Promise<void>((resolve) => {
    releaseScript = resolve;
  });
  let markScriptRequested!: () => void;
  const scriptRequested = new Promise<void>((resolve) => {
    markScriptRequested = resolve;
  });
  await page.route('**/CreativeMachineMonitor.*', async (route) => {
    markScriptRequested();
    await scriptGate;
    await route.continue();
  });

  try {
    await page.goto('/@dessi', { waitUntil: 'commit' });
    await scriptRequested;
    const understand = page.getByRole('button', { name: '01 Understand' });
    const imagine = page.getByRole('button', { name: '02 Imagine' });
    const build = page.getByRole('button', { name: '03 Build' });
    for (const control of [understand, imagine, build]) {
      await expect(control).toBeVisible();
      await expect(control).toBeDisabled();
    }

    // A real early touch must be blocked by the native disabled state.
    await imagine.tap({ force: true });
    await expect(understand).toHaveAttribute('aria-pressed', 'true');
    await expect(imagine).toHaveAttribute('aria-pressed', 'false');

    releaseScript();
    for (const control of [understand, imagine, build]) {
      await expect(control).toBeEnabled();
    }
    await imagine.tap();
    await expect(imagine).toHaveAttribute('aria-pressed', 'true');
    await expect(understand).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByText('possible worlds', { exact: true })).toBeVisible();
  } finally {
    releaseScript();
  }
});

test('mobile monitor keeps primary destinations visible and changes its process', async ({
  page,
}) => {
  await page.goto('/@dessi');
  await expect(page.getByRole('heading', { name: 'Dessi Georgieva', exact: true })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'A human becoming a machine that can imagine.' })
  ).toBeVisible();

  const start = page.getByRole('navigation', { name: 'Start exploring' });
  for (const [name, href] of [
    ['Explore work', '/@dessi/workbench'],
    ['View CV', '/@dessi/resume'],
    ['Ask Profile Agent', '/mobile/apps/terminal'],
  ]) {
    const link = start.getByRole('link', { name });
    await expect(link).toHaveAttribute('href', href);
    await expect(link).toBeInViewport();
  }

  for (const [button, output] of [
    ['02 Imagine', 'possible worlds'],
    ['03 Build', 'inspectable system'],
    ['01 Understand', 'revised understanding'],
  ]) {
    const process = page.getByRole('button', { name: button });
    await process.click();
    await expect(process).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText(output, { exact: true })).toBeVisible();
    await expect(page.locator('.monitor-processes [aria-pressed="true"]')).toHaveCount(1);
    await expect(page).toHaveURL(/\/@dessi$/);
  }

  await page.emulateMedia({ reducedMotion: 'reduce' });
  expect(
    await page
      .locator('.monitor-orbit')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName)
  ).toBe('none');
  await page.evaluate(() => window.scrollTo(0, 700));
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeInViewport({
    ratio: 1,
  });

  await page
    .getByRole('navigation', { name: 'Mobile navigation' })
    .getByText('Explore', { exact: false })
    .click();
  await page
    .getByRole('navigation', { name: 'Mobile navigation' })
    .getByRole('link', { name: 'Workbench', exact: false })
    .click();
  await expect(page).toHaveURL(/\/@dessi\/workbench$/);
  await page.getByRole('link', { name: '← Profile', exact: true }).click();
  await expect(page).toHaveURL(/\/@dessi$/);
});

test('mobile diagrams and opening actions fit narrow screens', async ({ page }) => {
  for (const width of [360, 390, 430]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    const diagram = page.locator('.platform-projection-graphic');
    const bounds = await diagram.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    for (const label of await page.locator('.platform-output text').all()) {
      const labelBounds = await label.boundingBox();
      expect(labelBounds).not.toBeNull();
      expect(labelBounds!.x + labelBounds!.width).toBeLessThanOrEqual(width);
    }

    await page.goto('/@dessi');
    await expect(page.getByRole('link', { name: 'Explore work', exact: false })).toBeInViewport();
    await expect(
      page.getByRole('link', { name: 'Ask Profile Agent', exact: true })
    ).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
  }
});

test('project evidence remains accessible without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({
    baseURL,
    userAgent: mobileUserAgent,
    viewport: { width: 390, height: 844 },
    javaScriptEnabled: false,
  });
  try {
    const page = await context.newPage();
    await page.goto('/@dessi/workbench');
    const project = page.locator('article').first();
    const repository = project.getByRole('link', {
      name: 'Repository',
      exact: false,
      includeHidden: true,
    });
    await expect(repository).toHaveCount(1);
    await expect(repository).toBeHidden();
    await project.locator('summary').click();
    await expect(repository).toBeVisible();
    await expect(project.getByText('owner-reported', { exact: false })).toBeVisible();

    await page.goto('/@dessi/evolution');
    await expect(page.getByRole('heading', { name: 'Ideas in motion' })).toBeVisible();
    await page.getByText('How the public record is made', { exact: true }).click();
    await expect(
      page.getByText('Opportunity Studio uses an explicitly disclosed profile', { exact: false })
    ).toBeVisible();
  } finally {
    await context.close();
  }
});

test('legacy entrances reach the profile and the agent composer fits the viewport', async ({
  page,
  request,
}) => {
  for (const alias of ['/mobile', '/mobile/lock', '/desktop']) {
    const response = await request.get(alias, { maxRedirects: 0 });
    expect(response.status()).toBe(302);
    expect(response.headers().location).toBe('/@dessi');
  }
  for (const [alias, destination] of [
    ['/apps/projects', '/@dessi/workbench'],
    ['/apps/evolution', '/@dessi/evolution'],
    ['/apps/notes', '/@dessi/writing'],
    ['/apps/resume', '/@dessi/resume'],
    ['/apps/network', '/@dessi/network'],
  ]) {
    const response = await request.get(alias, { maxRedirects: 0 });
    expect(response.status()).toBe(302);
    expect(response.headers().location).toBe(destination);
  }
  await page.route('**/api/llm/health', (route) =>
    route.fulfill({
      json: { ok: true, providers: [] },
    })
  );
  await page.goto('/apps/terminal');
  await expect(page).toHaveURL(/\/mobile\/apps\/terminal$/);
  await expect(page.getByRole('textbox', { name: "Ask Dessi's public profile" })).toBeInViewport({
    ratio: 1,
  });
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeInViewport();
});
