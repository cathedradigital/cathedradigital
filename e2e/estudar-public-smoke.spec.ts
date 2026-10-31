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

  const nexusKicker = page.getByText(/^Conexões · Deus caritas est/i);
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

  const response = await page.goto('/bible?book=Gn&ch=1');
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
  await input.fill('João 3:16');
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
  await expect(page).toHaveURL(/\/bible\??$/);

  expect(errors, '/bible search: console errors').toEqual([]);
});

test('Bíblia preserva contexto no Nexus Gn 1:1 → CIC §279 → retorno exato', async ({ page }) => {
  const errors: string[] = [];
  const badResponses: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('response', response => {
    if (response.status() >= 400) {
      badResponses.push(`${response.status()} ${new URL(response.url()).pathname}`);
    }
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

  expect(errors, `Nexus return flow: console errors; HTTP failures: ${badResponses.join(', ') || 'none'}`).toEqual([]);
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
  await expect(page).toHaveURL(/\/bible\??$/);

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

test('Magistério: filtros editoriais por categoria e temas são acessíveis e funcionais', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });

  const response = await page.goto('/magisterium');
  expect(response?.ok(), `/magisterium: HTTP ${response?.status()}`).toBeTruthy();

  await expect(page.getByRole('heading', { name: 'Temas do Magistério' })).toBeVisible();
  const category = page.getByRole('button', { name: 'Encíclicas', exact: true });
  await expect(category).toBeVisible();
  await category.click();
  await expect(category).toHaveAttribute('aria-pressed', 'true');

  const themes = page.getByRole('group', { name: 'Carrossel de temas do Magistério' });
  await expect(themes).toBeVisible();
  const firstTheme = themes.getByRole('button').first();
  await expect(firstTheme).toContainText(/documentos?/i);
  await expect(firstTheme).toHaveAttribute('aria-pressed', 'false');
  await firstTheme.click();
  await expect(firstTheme).toHaveAttribute('aria-pressed', 'true');

  expect(errors, 'Magistério filters: console errors').toEqual([]);
});

test('Catecismo: leitor usa um único bloco de Conexo e não mantém Relatio duplicado', async ({ page }) => {
  const response = await page.goto('/catechism?p=279');
  expect(response?.ok(), `/catechism?p=279: HTTP ${response?.status()}`).toBeTruthy();
  await expect(page.locator('#p279')).toBeVisible();
  const populatedNexusPanels = await page.locator('[data-nexus-panel]').count();
  const processingNexusPanels = await page.getByRole('heading', { name: 'Nexus Theologicus em Processamento' }).count();
  expect(populatedNexusPanels + processingNexusPanels).toBe(1);
  await expect(page.locator('#relatio-heading')).toHaveCount(0);
});


test('Catecismo: alias paragraph=N é canonicalizado para p=N sem perder o deep-link', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });

  const response = await page.goto('/catechism?paragraph=2865');
  expect(response?.ok(), `/catechism?paragraph=2865: HTTP ${response?.status()}`).toBeTruthy();
  await expect(page).toHaveURL(/\/catechism\?p=2865$/);
  await expect(page.locator('#p2865')).toBeVisible();
  await page.waitForTimeout(250);
  await expect(page).toHaveURL(/\/catechism\?p=2865$/);
  expect(errors, 'Catechism deep-link: console errors').toEqual([]);
});


test('Mobile: carrossel inferior alterna entre os ambientes canônicos', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const carousel = page.getByTestId('mobile-module-carousel');
  await expect(carousel).toBeVisible();
  await expect(carousel).toHaveCSS('position', 'fixed');
  await expect(carousel).toHaveCSS('bottom', '0px');
  await expect(carousel.getByRole('button', { name: 'Abrir módulo Estudar' })).toBeVisible();

  await carousel.getByRole('button', { name: 'Abrir módulo Estudar' }).click();
  await expect(page).toHaveURL(/\/estudar$/);
  await expect(carousel.getByRole('button', { name: 'Abrir módulo Estudar' })).toHaveAttribute('aria-current', 'page');
});

test('Desktop: carrossel inferior permanece oculto', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await expect(page.getByTestId('mobile-module-carousel')).toBeHidden();
});


test('Átrio: notícias atuais mostram data, fonte e link original', async ({ page }) => {
  await page.goto('/');
  const news = page.locator('section[aria-label="Notícias da Igreja"]');
  await expect(news).toBeVisible();
  await expect(news.getByRole('heading', { name: 'Notícias da Igreja' })).toBeVisible();
  await expect(news.getByRole('heading', { name: 'Leão XIV: a IA jamais deve decidir sobre a vida humana' })).toBeVisible();
  await expect(news.getByText('30 out. 2026').first()).toBeVisible();
  await expect(news.getByRole('link', { name: 'Ler na fonte original' })).toHaveAttribute(
    'href',
    'https://www.vaticannews.va/pt/papa/news/2026-10/papa-leao-xiv-audiencia-academia-vida-inteligencia-artificial.html',
  );
});


test('Home: identidade visual usa a marca Cátedra Digital', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Cátedra Digital', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Cátedra', { exact: true }).first()).toBeVisible();
  await expect(page.locator('footer').getByText('Cátedra', { exact: true }).first()).toBeVisible();
  await expect(page).toHaveTitle(/Cátedra Digital/);
});


test('Mobile: conteúdo reserva espaço para a navegação inferior', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const paddingBottom = await page.locator('#main-content').evaluate((element) =>
    window.getComputedStyle(element).paddingBottom,
  );
  expect(Number.parseFloat(paddingBottom)).toBeGreaterThan(0);
});
