import { test, expect, Page } from '@playwright/test';

const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;

test.beforeEach(async () => {
  if (!email || !password) throw new Error('E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be configured as CI secrets.');
});

async function login(page: Page, destination: string) {
  await page.goto('/login?next=' + encodeURIComponent(destination));
  await page.getByLabel('Email').fill(email!);
  await page.getByLabel('Senha').fill(password!);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  expect(page.url()).toContain(destination.split('?')[0]);
}

function watchBrowserHealth(page: Page) {
  const bad: string[] = [];
  page.on('console', message => { if (message.type() === 'error') bad.push('console: ' + message.text()); });
  page.on('response', response => { if ([404, 500, 502, 503, 504].includes(response.status())) bad.push('http ' + response.status() + ': ' + response.url()); });
  return bad;
}

async function saveReflection(page: Page, text: string) {
  await expect(page.getByText('Scriptum Sanctuarium')).toBeVisible();
  await page.locator('textarea[placeholder="O que esta passagem diz ao seu coração?"]').fill(text);
  await page.getByRole('button', { name: 'Salvar Reflexão', exact: true }).click();
  await expect(page.getByText('Nota salva')).toBeVisible().catch(() => {});
}

async function openStudyJournal(page: Page, marker: string) {
  await page.goto('/conta/diario');
  await expect(page.getByRole('button', { name: 'Estudo e Leitura' })).toBeVisible();
  await page.getByRole('button', { name: 'Estudo e Leitura' }).click();
  const note = page.getByText(marker, { exact: false }).first();
  await expect(note).toBeVisible();
  return note;
}

test('auth redirect preserves protected destination', async ({ page }) => {
  await page.context().clearCookies();
  await page.goto('/diario');
  expect(page.url()).toContain('/login?next=');
  expect(page.url()).toContain('diario');
});

test('Bíblia: anotação → Diário → retorno exato ao versículo', async ({ page }) => {
  const bad = watchBrowserHealth(page);
  const marker = 'E2E-BIBLE-' + Date.now();
  await login(page, '/bible?book=joao&chapter=1&v=1');
  await expect(page.locator('#verse-1')).toBeVisible();
  await page.locator('#verse-1').click();
  await saveReflection(page, marker);
  const note = await openStudyJournal(page, marker);
  await note.getByRole('button', { name: /Ver Contexto/i }).click();
  expect(page.url()).toContain('/bible?');
  expect(page.url()).toContain('v=1');
  await expect(page.locator('#verse-1')).toBeVisible();
  expect(bad).toEqual([]);
});

test('Catecismo: anotação → Diário → retorno exato ao parágrafo', async ({ page }) => {
  const bad = watchBrowserHealth(page);
  const marker = 'E2E-CATECHISM-' + Date.now();
  await login(page, '/catechism?p=1');
  await expect(page.getByRole('button', { name: /Anotar/i }).first()).toBeVisible();
  await page.getByRole('button', { name: /Anotar/i }).first().click();
  await saveReflection(page, marker);
  const note = await openStudyJournal(page, marker);
  await note.getByRole('button', { name: /Ver Contexto/i }).click();
  expect(page.url()).toContain('/catechism?p=1');
  expect(bad).toEqual([]);
});

test('Magistério: anotação → Diário → retorno ao documento/parágrafo', async ({ page }) => {
  const bad = watchBrowserHealth(page);
  const marker = 'E2E-MAGISTERIUM-' + Date.now();
  await login(page, '/magisterium/dce?p=1');
  await expect(page.getByRole('main')).toBeVisible();
  await page.getByRole('button', { name: /Anotar/i }).first().click();
  await saveReflection(page, marker);
  const note = await openStudyJournal(page, marker);
  await note.getByRole('button', { name: /Ver Contexto/i }).click();
  expect(page.url()).toContain('/magisterium/dce?p=');
  expect(bad).toEqual([]);
});

test('Bíblia: reload → back → forward preservam o deep-link do versículo', async ({ page }) => {
  await login(page, '/bible?book=joao&chapter=1&v=1');
  await expect(page.locator('#verse-1')).toBeVisible();
  await page.reload();
  await expect(page.locator('#verse-1')).toBeVisible();
  await page.goBack();
  await page.goForward();
  expect(page.url()).toContain('/bible?');
  expect(page.url()).toContain('v=1');
  await expect(page.locator('#verse-1')).toBeVisible();
});

test('Bíblia: seletor de livro e capítulo permanece sincronizado com a URL canônica', async ({ page }) => {
  await login(page, '/bible?book=Jo&ch=3');
  await expect(page.locator('#verse-1')).toBeVisible();

  await page.getByRole('button', { name: 'Escolher livro e capítulo' }).click();
  await expect(page.getByText('João', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Trocar livro' }).click();
  await page.getByRole('button', { name: /^Gênesis/ }).click();
  await page.getByRole('button', { name: '1', exact: true }).click();

  await expect(page).toHaveURL(/\/bible\?book=Gn&ch=1/);
  await expect(page.locator('#verse-1')).toBeVisible();
});

test('Bíblia: deep-link por referência abre o capítulo e o versículo correto', async ({ page }) => {
  await login(page, '/bible?ref=Jo%203%3A16');
  await expect(page.locator('#verse-16')).toBeVisible();
  expect(page.url()).toContain('/bible?ref=');
});

test('Catecismo: deep-link de fronteira §2865 abre o último parágrafo sem perder a URL', async ({ page }) => {
  const bad = watchBrowserHealth(page);
  await login(page, '/catechism?p=2865');
  await expect(page.locator('#p2865')).toBeVisible();
  await expect(page.locator('#heading-p2865')).toBeVisible();
  expect(page.url()).toContain('/catechism?p=2865');
  expect(bad).toEqual([]);
});

test('Catecismo: Conexo prioriza relação curada e mantém a referência navegável', async ({ page }) => {
  const bad = watchBrowserHealth(page);
  await login(page, '/catechism?p=279');
  await expect(page.locator('#p279')).toBeVisible();
  await expect(page.getByText('Gn 1:1', { exact: true })).toBeVisible();
  await expect(page.getByText('Referência editorial', { exact: true })).toBeVisible();
  expect(bad).toEqual([]);
});


test('Catecismo: leitor não exibe a barra duplicada Bíblia/Catecismo/Documentos no mobile', async ({ page }) => {
  await login(page, '/catechism?p=10');
  await expect(page.locator('#p10')).toBeVisible();
  await expect(page.locator('nav[aria-label="Estudar modules"]')).toHaveCount(0);
});

test('Catecismo: gatilho do Nexus/Yá permanece visível e acionável no mobile', async ({ page }) => {
  await login(page, '/catechism?p=10');
  await expect(page.locator('#p10')).toBeVisible();
  const trigger = page.getByTestId('catechism-nexus-trigger-10');
  await expect(trigger).toBeVisible();
  await expect(trigger).toBeEnabled();
  await expect(trigger).toHaveAttribute('aria-label', 'Abrir Yá para o parágrafo 10');
});

test('Catecismo: texto oficial com entidades HTML é exibido como caracteres reais', async ({ page }) => {
  await login(page, '/catechism?p=10');
  await expect(page.locator('#p10')).toBeVisible();
  await expect(page.getByText(/Não admira, pois/)).toBeVisible();
  await expect(page.getByText(/&atilde;/)).toHaveCount(0);
});

test.describe('responsive critical flow', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('Bíblia abre sem overflow horizontal no mobile', async ({ page }) => {
    await login(page, '/bible?book=joao&chapter=1&v=1');
    await expect(page.locator('#verse-1')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(overflow).toBe(false);
  });

  test('Catecismo abre no último parágrafo sem overflow horizontal no mobile', async ({ page }) => {
    await login(page, '/catechism?p=2865');
    await expect(page.locator('#p2865')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(overflow).toBe(false);
  });
});