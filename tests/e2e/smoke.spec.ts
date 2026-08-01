import { expect, test } from '@playwright/test';

const waitForDesktopReady = async (page: import('@playwright/test').Page) => {
  await page.waitForFunction(() => document.documentElement.dataset.desktopReady === 'true');
};

test.describe('desktop smoke', () => {
  test.beforeEach(({ isMobile }) => {
    test.skip(isMobile, 'desktop smoke runs only on desktop project');
  });

  test('desktop shell loads with menubar', async ({ page }) => {
    await page.goto('/desktop');
    await waitForDesktopReady(page);
    await expect(page).toHaveURL(/\/desktop$/);
    await expect(page.getByRole('menubar', { name: 'Application menu bar' })).toBeVisible();
    await expect(page.getByText('Dessi Georgieva', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Connect', exact: true })).toBeVisible();
  });

  test('creative machine monitor explains and changes its working mode', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('dialog', { name: 'DG-OS Browser' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'A human becoming a machine that can imagine.' })
    ).toBeVisible();
    await expect(
      page.getByText(
        'Projects, readings, questions, decisions, and failures become traceable patterns',
        { exact: false }
      )
    ).toBeVisible();
    await expect(page.getByText('One pattern substrate', { exact: false })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Greg Egan’s Permutation City' })).toHaveAttribute(
      'href',
      'https://www.gregegan.net/PERMUTATION/Permutation.html'
    );
    await expect(page.getByText('trace --sources --uncertainty')).toBeVisible();

    await page.getByRole('button', { name: '02 Imagine' }).click();
    await expect(page.getByText('associate --across-domains')).toBeVisible();
    await expect(page.getByText('possible worlds')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Enter workspace' })).toHaveAttribute(
      'href',
      '/desktop'
    );

    await page.getByRole('button', { name: 'Close browser' }).click();
    await expect(page.getByRole('dialog', { name: 'DG-OS Browser' })).toHaveCount(0);
    await expect(
      page.getByRole('heading', { name: 'A human becoming a machine that can imagine.' })
    ).toHaveCount(0);

    await page.getByRole('button', { name: 'Browser', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'DG-OS Browser' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'A human becoming a machine that can imagine.' })
    ).toBeVisible();
  });

  test('canonical public profile resolves with its own metadata', async ({ page }) => {
    await page.goto('/@dessi');
    await expect(page).toHaveURL(/\/@dessi$/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://dg-os.com/@dessi'
    );
    await expect(page.getByRole('dialog', { name: 'DG-OS Browser' })).toBeVisible();
    await expect(
      page.getByText("Dessi's practice is becoming computational", { exact: false })
    ).toBeVisible();
  });

  test('home browser refits when the desktop viewport moves between displays', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    const browserWindow = page.getByRole('dialog', { name: 'DG-OS Browser' });
    const compactBounds = await browserWindow.boundingBox();
    expect(compactBounds).not.toBeNull();

    await page.setViewportSize({ width: 2048, height: 1150 });
    await expect
      .poll(async () => (await browserWindow.boundingBox())?.width ?? 0)
      .toBeGreaterThan((compactBounds?.width ?? 0) * 1.45);
    const expandedBounds = await browserWindow.boundingBox();
    expect(expandedBounds).not.toBeNull();
    expect(
      Math.abs((expandedBounds?.x ?? 0) - (2048 - (expandedBounds?.width ?? 0)) / 2)
    ).toBeLessThan(3);

    await page.setViewportSize({ width: 1280, height: 720 });
    await page.setViewportSize({ width: 2048, height: 1150 });
    await expect
      .poll(async () => (await browserWindow.boundingBox())?.width ?? 0)
      .toBeGreaterThan((compactBounds?.width ?? 0) * 1.45);
  });

  test('public systems dossier is employer-neutral', async ({ page }) => {
    await page.goto('/systems');
    await expect(
      page.getByRole('heading', {
        name: 'I build the layer where agent capability becomes accountable behaviour.',
      })
    ).toBeVisible();
    await expect(page.getByText('AI Systems Engineer · London, UK')).toBeVisible();
    await expect(page.getByText('Target role')).toHaveCount(0);
    await expect(
      page.getByRole('heading', { name: 'What the evidence does not establish.' })
    ).toBeVisible();
  });

  test('targeted application remains unindexed', async ({ page }) => {
    await page.goto('/apply/openai-codex');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow'
    );
    await expect(page.getByText('Target role')).toBeVisible();
  });

  test('dock opens and closes Workbench window', async ({ page }) => {
    await page.goto('/desktop');
    await waitForDesktopReady(page);
    const dockWorkbench = page.getByRole('button', { name: 'Workbench', exact: true });
    const workbenchAnchor = page.getByText('Intent Recognition Agent', { exact: true });

    await dockWorkbench.click();
    await expect(workbenchAnchor).toBeVisible();

    await dockWorkbench.click();
    await expect(workbenchAnchor).toHaveCount(0);
  });

  test('dock opens Agents Terminal window', async ({ page }) => {
    await page.goto('/desktop');
    await waitForDesktopReady(page);
    await page.getByRole('button', { name: 'Agents' }).click();
    await expect(page.getByRole('dialog', { name: 'Agents Terminal' })).toBeVisible();
    await expect(page.getByText('Agents Runtime', { exact: true })).toBeVisible();
  });

  test('terminal tools panel runs list_projects quick action', async ({ page }) => {
    await page.goto('/desktop');
    await waitForDesktopReady(page);
    const dockAgents = page.getByRole('button', { name: 'Agents', exact: true });
    await dockAgents.click();
    const terminalDialog = page.getByRole('dialog', { name: 'Agents Terminal' });
    await expect(terminalDialog).toBeVisible();

    await page.getByRole('button', { name: 'Tools', exact: true }).click();
    await page.getByRole('button', { name: 'List projects', exact: true }).click();
    await expect(page.getByText(/Tool list_projects returned \d+ project\(s\):/)).toBeVisible();
  });

  test('terminal shows streaming status before final answer', async ({ page }) => {
    let releaseResponse!: () => void;
    const responseGate = new Promise<void>((resolve: () => void) => {
      releaseResponse = resolve;
    });
    let markRequestIntercepted!: () => void;
    const requestIntercepted = new Promise<void>((resolve: () => void) => {
      markRequestIntercepted = resolve;
    });

    await page.route('**/api/llm/health', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          providers: [
            {
              provider: 'openrouter',
              configured: true,
              status: 'healthy',
              message: 'Ready',
              latencyMs: 1,
            },
          ],
        }),
      });
    });

    await page.route('**/api/chat/stream', async (route) => {
      markRequestIntercepted();
      await responseGate;
      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream; charset=utf-8',
        body: [
          'event: delta',
          'data: {"type":"delta","delta":"Dessi builds "}',
          '',
          'event: delta',
          'data: {"type":"delta","delta":"agentic systems."}',
          '',
          'event: result',
          'data: {"ok":true,"message":"Dessi builds agentic systems.","meta":{"provider":"openrouter","model":"openai/gpt-oss-120b","latencyMs":1200,"fallbackUsed":false}}',
          '',
          'event: done',
          'data: {"ok":true}',
          '',
        ].join('\n'),
      });
    });

    await page.goto('/desktop');
    await waitForDesktopReady(page);
    await page.getByRole('button', { name: 'Agents', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Agents Terminal' })).toBeVisible();

    const input = page.getByRole('textbox', { name: 'Terminal command input' });
    await input.fill('tell me about dessi');
    await input.press('Enter');
    await requestIntercepted;

    await expect(page.getByText('Preparing answer…', { exact: true })).toBeVisible();
    releaseResponse();
    await expect(page.getByText('Dessi builds agentic systems.', { exact: true })).toBeVisible();
  });

  test('menubar View opens Workbench and resets after close', async ({ page }) => {
    await page.goto('/desktop');
    await waitForDesktopReady(page);

    const viewMenu = page.getByRole('menuitem', { name: 'View', exact: true });
    await viewMenu.click();
    await page.getByRole('menuitem', { name: 'Projects', exact: true }).click();
    const closeWorkbench = page.getByRole('button', { name: 'Close Workbench' });
    await expect(closeWorkbench).toBeVisible();

    await closeWorkbench.click();
    await expect(closeWorkbench).toHaveCount(0);

    await viewMenu.click();
    await expect(page.getByRole('menuitem', { name: 'Projects', exact: true })).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Selected Systems', exact: true })).toHaveCount(
      0
    );
  });

  test('menubar Window -> Contact opens Connect menu', async ({ page }) => {
    await page.goto('/desktop');
    await waitForDesktopReady(page);

    await page.getByRole('menuitem', { name: 'Window', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Contact...' }).click();

    await expect(page.getByRole('button', { name: 'Connect', exact: true })).toHaveAttribute(
      'aria-expanded',
      'true'
    );
    await expect(page.getByRole('link', { name: 'LinkedIn', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'GitHub', exact: true })).toBeVisible();
  });

  test('menubar Help -> DG-Labs User Guide opens and closes help window', async ({ page }) => {
    await page.goto('/desktop');
    await waitForDesktopReady(page);

    await page.getByRole('menuitem', { name: 'Help', exact: true }).click();
    await page.getByRole('menuitem', { name: 'DG-Labs User Guide' }).click();

    const guideDialog = page.getByTestId('help-guide-window');
    const closeGuide = page.getByRole('button', { name: 'Close Guide', exact: true });

    await expect(guideDialog).toBeVisible();
    await expect(
      guideDialog.getByRole('heading', { name: 'DG-Labs User Guide', exact: true })
    ).toBeVisible();
    await closeGuide.click();
    await expect(guideDialog).toHaveCount(0);
  });

  test('system map reveals a guided path and switches to the index', async ({ page }) => {
    await page.goto('/desktop');
    await waitForDesktopReady(page);
    const dockMap = page.getByRole('button', { name: 'System Map', exact: true });
    await dockMap.click();
    const closeMap = page.getByRole('button', { name: 'Close System Map', exact: true });
    if ((await closeMap.count()) === 0) {
      await dockMap.click();
    }
    await expect(closeMap).toBeVisible();

    const evolutionPath = page.getByText('How did Dessi move from data work to agent systems?', {
      exact: true,
    });
    await evolutionPath.click();
    await expect(
      page.getByText(
        'Operational data work became analytics platforms, then multi-tenant AI systems where evaluation and policy are first-class concerns.',
        { exact: true }
      )
    ).toBeVisible();

    await page.getByRole('button', { name: 'Index', exact: true }).click();
    await expect(page.getByRole('button', { name: /Data Operations/ })).toBeVisible();
  });

  test('window lifecycle survives rapid open/close and refocus', async ({ page }) => {
    await page.goto('/desktop');
    await waitForDesktopReady(page);

    const dockWorkbench = page.getByRole('button', { name: 'Workbench', exact: true });
    const dockAgents = page.getByRole('button', { name: 'Agents', exact: true });
    const closeWorkbench = page.getByRole('button', { name: 'Close Workbench', exact: true });
    const closeAgents = page.getByRole('button', { name: 'Close Agents Terminal', exact: true });

    // Rapid lifecycle operations via dock toggles (more stable than titlebar dots during motion).
    await dockWorkbench.click();
    await dockAgents.click();
    await expect(closeWorkbench).toBeVisible();
    await expect(closeAgents).toBeVisible();

    await dockWorkbench.click();
    await expect(closeWorkbench).toHaveCount(0);
    await dockWorkbench.click();
    await expect(closeWorkbench).toBeVisible();

    await dockAgents.click();
    await expect(closeAgents).toHaveCount(0);
    await dockAgents.click();
    await expect(closeAgents).toBeVisible();
    await expect(closeWorkbench).toBeVisible();
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
    expect(homeHtml).toContain('Writing');
    expect(homeHtml).toContain('Projects');

    const projects = await request.get('/mobile/apps/projects', {
      headers: { 'user-agent': ua },
    });
    expect(projects.status()).toBe(200);
    const projectsHtml = await projects.text();
    expect(projectsHtml).toContain('Selected systems Dessi can show');
    expect(projectsHtml).toContain('Selected Systems');

    const notes = await request.get('/mobile/apps/notes', {
      headers: { 'user-agent': ua },
    });
    expect(notes.status()).toBe(200);
    const notesHtml = await notes.text();
    expect(notesHtml).toContain('Technical Writing');
    expect(notesHtml).toContain('Selected analysis');

    const evolution = await request.get('/mobile/apps/evolution', {
      headers: { 'user-agent': ua },
    });
    expect(evolution.status()).toBe(200);
    const evolutionHtml = await evolution.text();
    expect(evolutionHtml).toContain('DG-OS is a record of work in motion');
    expect(evolutionHtml).toContain('How the loop works');
    expect(evolutionHtml).toContain('Ideas in motion');

    const resume = await request.get('/mobile/apps/resume', {
      headers: { 'user-agent': ua },
    });
    expect(resume.status()).toBe(200);
    const resumeHtml = await resume.text();
    expect(resumeHtml).toContain('experience, technical focus, and selected systems.');
    expect(resumeHtml).toContain('Download PDF');

    const systems = await request.get('/systems', {
      headers: { 'user-agent': ua },
    });
    expect(systems.status()).toBe(200);
    const systemsHtml = await systems.text();
    expect(systemsHtml).toContain('AI Systems Engineer');
    expect(systemsHtml).toContain('What the evidence does not establish.');

    const profile = await request.get('/@dessi', {
      headers: { 'user-agent': ua },
      maxRedirects: 0,
    });
    expect(profile.status()).toBe(200);
    const profileHtml = await profile.text();
    expect(profileHtml).toContain('Public profile / @dessi');
    expect(profileHtml).toContain('Dessi Georgieva');
    expect(profileHtml).toContain('Explore the profile');
    expect(profileHtml).toContain('https://dg-os.com/@dessi');

    const missingProfile = await request.get('/@missing-profile', {
      headers: { 'user-agent': ua },
      maxRedirects: 0,
    });
    expect(missingProfile.status()).toBe(404);
    expect(missingProfile.headers()['x-robots-tag']).toBe('noindex, nofollow');

    const terminal = await request.get('/mobile/apps/terminal', {
      headers: { 'user-agent': ua },
    });
    expect(terminal.status()).toBe(200);
    const terminalHtml = await terminal.text();
    expect(terminalHtml).toContain('Ask targeted questions');
    expect(terminalHtml).toContain('aria-label="Terminal command input"');

    const network = await request.get('/mobile/apps/network', {
      headers: { 'user-agent': ua },
    });
    expect(network.status()).toBe(200);
    const networkHtml = await network.text();
    expect(networkHtml).toContain('System Map');
    expect(networkHtml).toContain('The mobile index keeps every relationship readable.');
    expect(networkHtml).toContain('component-url="/src/components/network/NetworkApp.tsx"');
  });
});
