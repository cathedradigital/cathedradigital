import { test, expect } from '@playwright/test';

test('public browser smoke: landing and login render', async ({ page }) => {
  const bad: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error') bad.push('console: ' + message.text());
  });
  page.on('response', response => {
    if ([404, 500, 502, 503, 504].includes(response.status())) {
      bad.push('http ' + response.status() + ': ' + response.url());
    }
  });

  await page.goto('/');
  await expect(page).toHaveTitle(/Cathedra/i);
  await page.goto('/login');
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Senha')).toBeVisible();
  expect(bad).toEqual([]);
});

test('Documentos e Catecismo abrem sem erro de navegação', async ({ page }) => {
  for (const route of ['/magisterium', '/catechism']) {
    const errors: string[] = [];
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text());
    });

    const response = await page.goto(route);
    expect(response?.ok(), `${route}: HTTP ${response?.status()}`).toBeTruthy();
    await expect(page.locator('body')).not.toContainText(/Application error|Something went wrong/i);
    expect(errors, `${route}: console errors`).toEqual([]);
  }
});
test('Documentos: leitor canônico, fonte oficial e Conexo sem duplicação', async ({ page }) => {
  const errors: string[] = [];
  const badResponses: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('response', response => {
    if (response.status() >= 400) badResponses.push(`${response.status()}: ${response.url()}`);
  });

  const response = await page.goto('/magisterium/dce');
  expect(response?.ok(), `/magisterium/dce: HTTP ${response?.status()}`).toBeTruthy();
  await expect(page.locator('body')).not.toContainText(/Application error|Something went wrong/i);
  await expect(page.getByRole('heading', { name: /Deus Caritas Est/i }).first()).toBeVisible();
  await expect(page.getByText('Fonte oficial').first()).toBeVisible();
  await expect(page.getByText('vatican.va').first()).toBeVisible();
  await expect(page.locator('[id^="para-"]').first()).toBeVisible();

  const nexusKicker = page.getByText('Conexões · Deus Caritas Est', { exact: true });
  await expect(nexusKicker).toHaveCount(1);

  expect(errors, 'Magistério: console errors').toEqual([]);
  expect(badResponses, 'Magistério: HTTP errors').toEqual([]);
});


test('Bíblia abre e renderiza conteúdo real', async ({ page }) => {
  const errors: string[] = [];
  const badResponses: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('response', response => {
    if (response.status() >= 400) badResponses.push(`${response.status()}: ${response.url()}`);
  });

  const response = await page.goto('/bible?book=Gen&ch=1');
  expect(response?.ok(), `/bible: HTTP ${response?.status()}`).toBeTruthy();
  await expect(page.locator('body')).not.toContainText(/Application error|Something went wrong/i);
  await expect(page.locator('body')).toContainText(/Gênesis|Genesis/i);
  await expect(page.locator('body')).toContainText(/No princípio|No principio/i);
  expect(errors, '/bible: console errors').toEqual([]);
  expect(badResponses, '/bible: HTTP errors').toEqual([]);
});

test('Bíblia permite pesquisar uma referência real', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/bible');
  await page.getByRole('button', { name: 'Pesquisar na Bíblia' }).click();

  const input = page.getByPlaceholder('Pesquisar nas Escrituras...');
  await expect(input).toBeVisible();
  await input.fill('Jo 3:16');
  await expect(page.getByTestId('bible-search-submit')).toBeEnabled();
  await page.getByTestId('bible-search-submit').click();

  const result = page.getByRole('button').filter({ hasText: /João.*3:16/i }).first();
  await expect(result).toBeVisible();
  await expect(result).toContainText(/Deus/i);

  await result.click();
  await expect(page).toHaveURL(/\/bible\?book=Jo&ch=3&v=16/);
  await expect(page.locator('#verse-16')).toBeVisible();

  await page.goto('/bible');
  await page.getByRole('button', { name: 'Pesquisar na Bíblia' }).click();
  const searchInput = page.getByTestId('bible-search-input');
  await searchInput.fill('Porque Deus amou');
  await searchInput.press('Enter');
  await expect(page.locator('body')).toContainText(/João.*3:16/i);
  await expect(page.getByTestId('bible-search-close')).toBeVisible();
  await page.getByTestId('bible-search-close').click();
  await expect(page).toHaveURL(/\/bible$/);

  expect(errors, '/bible search: console errors').toEqual([]);
});

test('Bíblia preserva contexto no Nexus Gn 1:1 → CIC §279 → retorno exato', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/bible?book=Gn&ch=1&v=1');

  const nexusCard = page.getByTestId('nexus-connection-card').filter({ hasText: 'Catecismo' }).first();
  await expect(nexusCard).toBeVisible();
  await nexusCard.click();

  await expect(page.getByTestId('catechism-preview')).toBeVisible();
  await expect(page.getByTestId('catechism-preview')).toContainText('§279');

  await page.getByTestId('nexus-popover-nav-link').click();
  await expect(page).toHaveURL(/\/catechism\?p=279/);
  await expect(page.getByText(/Retorno de estudo/i)).toBeVisible();
  await expect(page.getByText(/Gênesis 1:1/i)).toBeVisible();

  await page.getByRole('button', { name: /Voltar à passagem/i }).click();
  await expect(page).toHaveURL(/\/bible\?book=Gn&ch=1&v=1/);
  await expect(page.locator('#verse-1')).toBeVisible();

  expect(errors, 'Nexus return flow: console errors').toEqual([]);
});

test('Bíblia: os controles principais da barra funcionam', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/bible');

  await page.getByTestId('bible-toolbar-search').click();
  await expect(page.getByTestId('bible-search-input')).toBeVisible();
  await page.getByTestId('bible-search-close').click();
  await expect(page).toHaveURL(/\/bible$/);

  await page.getByTestId('bible-toolbar-bookmarks').click();
  await expect(page.getByText(/Marcadores/i).first()).toBeVisible();
  await page.getByRole('button', { name: /Voltar|Fechar/i }).first().click().catch(() => {});
  await page.goto('/bible');

  await page.getByTestId('bible-toolbar-more').click();
  await expect(page.getByRole('menuitem', { name: /Anotações/i })).toBeVisible();
  await expect(page.getByRole('menuitem', { name: /Editor Bíblia/i })).toBeVisible();
  await page.keyboard.press('Escape');

  expect(errors, 'Bible toolbar: console errors').toEqual([]);
});

test('Bíblia: leitura mantém espaçamento compacto e Nexus sem bolhas excessivas', async ({ page }) => {
  await page.goto('/bible?book=Gn&ch=1&v=1');
  const verse1 = page.getByTestId('verse-text-1');
  const verse2 = page.getByTestId('verse-text-2');
  await expect(verse1).toBeVisible();
  await expect(verse2).toBeVisible();

  const spacing = await page.evaluate(() => {
    const a = document.querySelector('[data-testid="verse-text-1"]')?.closest('[id^="verse-"]');
    const b = document.querySelector('[data-testid="verse-text-2"]')?.closest('[id^="verse-"]');
    if (!a || !b) return null;
    const ar = a.getBoundingClientRect();
    const br = b.getBoundingClientRect();
    return { gap: br.top - ar.bottom };
  });
  expect(spacing).not.toBeNull();
  expect(spacing!.gap).toBeLessThan(16);

  const bubbles = page.locator('[data-testid="nexus-bubbles-1"]');
  if (await bubbles.count()) {
    await expect(bubbles.first()).toBeVisible();
    const bubbleBox = await bubbles.first().boundingBox();
    expect(bubbleBox?.height ?? 0).toBeLessThan(140);
  }
});


test('Documentos: Dei Filius organiza cabeçalho, idioma original e tradução', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });

  const response = await page.goto('/magisterium/dfil');
  expect(response?.ok(), `/magisterium/dfil: HTTP ${response?.status()}`).toBeTruthy();
  await expect(page.locator('body')).not.toContainText(/Application error|Something went wrong/i);
  await expect(page.getByRole('heading', { name: /Dei Filius/i }).first()).toBeVisible();
  await expect(page.getByText(/Fonte oficial/i).first()).toBeVisible();
  await expect(page.getByText(/Idioma original · Latina/i)).toBeVisible();
  await expect(page.getByTestId('magisterium-translate')).toBeVisible();
  await expect(page.getByText('Temas', { exact: true })).toHaveCount(0);
  expect(errors, 'Dei Filius: console errors').toEqual([]);
});


test('canonical public modules render on mobile and desktop without horizontal overflow', async ({ page }) => {
  const publicRoutes = [
    '/',
    '/bible?book=Gn&ch=1&v=1',
    '/catechism?p=279',
    '/magisterium/dce',
    '/oracao',
    '/liturgia',
    '/breviary',
    '/temas',
    '/buscar',
    '/nexus',
    '/acervo',
    '/santos',
  ];
  const viewports = [
    { width: 390, height: 844, label: 'mobile' },
    { width: 1365, height: 900, label: 'desktop' },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });

    for (const route of publicRoutes) {
      const response = await page.goto(route);
      expect(response?.ok(), `${viewport.label} ${route}: HTTP ${response?.status()}`).toBeTruthy();
      await expect(page.locator('body')).not.toContainText(/Application error|Something went wrong/i);

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      expect(overflow, `${viewport.label} ${route}: horizontal overflow`).toBe(false);
    }

    for (const protectedRoute of ['/hoje', '/diario', '/jornadas']) {
      await page.goto(protectedRoute);
      await expect(page).toHaveURL(/\/login\?next=/);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      );
      expect(overflow, `${viewport.label} ${protectedRoute} login redirect: horizontal overflow`).toBe(false);
    }
  }
});
