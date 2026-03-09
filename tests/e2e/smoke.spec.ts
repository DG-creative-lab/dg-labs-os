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
    await expect(page.getByText('DG-Labs', { exact: true })).toBeVisible();
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

    await page.route('**/api/chat/stream', async (route) => {
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
    await Promise.all([page.waitForRequest('**/api/chat/stream'), input.press('Enter')]);

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
    await expect(page.getByRole('menuitem', { name: 'Research Systems', exact: true })).toHaveCount(
      0
    );
  });

  test('menubar Window -> Contact opens Links panel', async ({ page }) => {
    await page.goto('/desktop');
    await waitForDesktopReady(page);

    await page.getByRole('menuitem', { name: 'Window', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Contact...' }).click();

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

  test('network graph toggle switches navigation mode', async ({ page }) => {
    await page.goto('/desktop');
    await waitForDesktopReady(page);
    const dockNetwork = page.getByRole('button', { name: 'Network', exact: true });
    await dockNetwork.click();
    const closeNetwork = page.getByRole('button', { name: 'Close Network', exact: true });
    if ((await closeNetwork.count()) === 0) {
      await dockNetwork.click();
    }
    await expect(closeNetwork).toBeVisible();

    const toggle = page.getByRole('button', { name: 'Navigate graph: Off', exact: true });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(
      page.getByRole('button', { name: 'Navigate graph: On', exact: true })
    ).toBeVisible();
    await page.getByRole('button', { name: 'Navigate graph: On', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Navigate graph: Off', exact: true })
    ).toBeVisible();
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
    expect(homeHtml).toContain('Notes');
    expect(homeHtml).toContain('Projects');

    const projects = await request.get('/mobile/apps/projects', {
      headers: { 'user-agent': ua },
    });
    expect(projects.status()).toBe(200);
    const projectsHtml = await projects.text();
    expect(projectsHtml).toContain('Systems and writing built around human agency');
    expect(projectsHtml).toContain('Research Systems');

    const notes = await request.get('/mobile/apps/notes', {
      headers: { 'user-agent': ua },
    });
    expect(notes.status()).toBe(200);
    const notesHtml = await notes.text();
    expect(notesHtml).toContain('Principles');
    expect(notesHtml).toContain('Pinned Deep Dives');

    const resume = await request.get('/mobile/apps/resume', {
      headers: { 'user-agent': ua },
    });
    expect(resume.status()).toBe(200);
    const resumeHtml = await resume.text();
    expect(resumeHtml).toContain('Canonical resume module with local downloadable formats.');
    expect(resumeHtml).toContain('Download PDF');

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
    expect(networkHtml).toContain('Interactive map of roles, systems, and ideas.');
    expect(networkHtml).toContain('component-url="/src/components/network/NetworkApp.tsx"');
  });
});
