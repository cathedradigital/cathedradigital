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
  // Wait for the real auth redirect instead of sampling /auth immediately.
  // The pathname requirement is unchanged; destination-specific tests still assert query parameters and content.
  const expectedPath = new URL(destination, 'http://localhost').pathname;
  await expect(page).toHaveURL(url => url.pathname === expectedPath, { timeout: 15_000 });
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

test('Bíblia: leitor oferece retorno para a tela anterior', async ({ page }) => {
  await login(page, '/bible?book=Jo&ch=3');
  await expect(page.locator('#verse-1')).toBeVisible();
  const back = page.getByTestId('bible-reader-back');
  await expect(back).toBeVisible();
  await expect(back).toHaveAttribute('aria-label', 'Voltar para a tela anterior');
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

test('Bíblia: Nexus do Catecismo carrega mesmo com Gênesis 1 vindo do cache local', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('bible_cache_Gn_1', JSON.stringify({
      v: 8,
      timestamp: Date.now(),
      verses: [
        { number: 1, text: 'No princípio Deus criou o céu e a terra.' },
        { number: 2, text: 'A terra estava informe e vazia.' },
      ],
    }));
  });

  const bad = watchBrowserHealth(page);
  await page.goto('/bible?book=Gn&ch=1&v=1');
  await expect(page.getByTestId('verse-text-1')).toBeVisible();

  const nexusCard = page.getByTestId('nexus-connection-card').filter({ hasText: 'Catecismo' }).first();
  await expect(nexusCard).toBeVisible({ timeout: 15000 });
  await nexusCard.click();
  await expect(page.getByTestId('catechism-preview')).toBeVisible();
  await expect(page.getByTestId('catechism-preview')).toContainText('§279');
  expect(bad, 'Bible Nexus cache hit: HTTP/console errors').toEqual([]);
});

test('Bíblia: Nexus recupera conexões editoriais de capítulo sem inventar citação de versículo', async ({ page }) => {
  await page.goto('/bible?book=Gn&ch=2&v=1');
  await expect(page.getByTestId('verse-text-1')).toBeVisible();

  // Gn:2 → §§355, 371 e 373 is an existing curated chapter-level map.
  // The UI must identify it as chapter context, not claim a direct citation.
  const chapterConnection = page.getByTestId('nexus-connection-card').filter({ hasText: '§355 · capítulo' }).first();
  await expect(chapterConnection).toBeVisible({ timeout: 15000 });
  await chapterConnection.click();
  await expect(page.getByTestId('nexus-connection-popover')).toContainText(/Relação editorial com Gn 2 como capítulo/i);
  await expect(page.getByTestId('catechism-preview')).toContainText('§355');
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

test('Catecismo: alias paragraph mantém o deep-link canônico no leitor', async ({ page }) => {
  await login(page, '/catechism?paragraph=2865');
  await expect(page.locator('#p2865')).toBeVisible();
  await expect(page.locator('#heading-p2865')).toBeVisible();
  await expect(page).toHaveURL(/\/catechism\?p=2865$/);
});

test('Catecismo: busca por § atualiza a URL canônica antes da navegação', async ({ page }) => {
  await login(page, '/catechism');
  const search = page.getByRole('textbox', { name: 'Buscar no Catecismo por parágrafo ou tema' });
  await search.fill('2865');
  await search.press('Enter');
  await expect(page.locator('#p2865')).toBeVisible();
  expect(page.url()).toContain('/catechism?p=2865');
});

test('Catecismo: deep-link de fronteira §2865 abre o último parágrafo sem perder a URL', async ({ page }) => {
  const bad = watchBrowserHealth(page);
  await login(page, '/catechism?p=2865');
  await expect(page.locator('#p2865')).toBeVisible();
  await expect(page.locator('#heading-p2865')).toBeVisible();
  expect(page.url()).toContain('/catechism?p=2865');
  expect(bad).toEqual([]);
});

test('Catecismo: navegação por parágrafo atravessa a fronteira de seção', async ({ page }) => {
  await login(page, '/catechism?p=25');
  await expect(page.locator('#p25')).toBeVisible();

  const next = page.getByTestId('catechism-paragraph-next');
  await expect(next).toBeEnabled();
  await next.click();

  await expect(page.locator('#p26')).toBeVisible();
  expect(page.url()).toContain('/catechism?p=26');

  const previous = page.getByTestId('catechism-paragraph-prev');
  await expect(previous).toBeEnabled();
  await previous.click();
  await expect(page.locator('#p25')).toBeVisible();
  expect(page.url()).toContain('/catechism?p=25');
});

test('Catecismo: fronteiras desabilitam anterior em §1 e próximo em §2865', async ({ page }) => {
  await login(page, '/catechism?p=1');
  await expect(page.locator('#p1')).toBeVisible();
  await expect(page.getByTestId('catechism-paragraph-prev')).toBeDisabled();

  await page.goto('/catechism?p=2865');
  await expect(page.locator('#p2865')).toBeVisible();
  await expect(page.getByTestId('catechism-paragraph-next')).toBeDisabled();
});

test('Catecismo: §2262 preserva o texto oficial e abre a referência bíblica', async ({ page }) => {
  await page.goto('/catechism?p=2262');
  await expect(page.locator('body')).toContainText('No sermão da montanha, o Senhor lembra o preceito');
  const bibleRef = page.getByRole('button', { name: /Mt 5, 21/i }).first();
  await expect(bibleRef).toBeVisible();
  await bibleRef.click();
  await expect(page).toHaveURL(/\/bible\?book=Mt&ch=5&v=21/);
});

test('Catecismo: proveniência do texto oficial fica visível e navegável', async ({ page }) => {
  await login(page, '/catechism?p=1');
  await expect(page.locator('#p1')).toBeVisible();
  const source = page.getByText('Santa Sé · vatican.va', { exact: true });
  await expect(source).toBeVisible();
  await expect(source).toHaveAttribute('href', /vatican\.va/);
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