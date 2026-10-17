import { test, expect, Page } from '@playwright/test';

const email = process.env.E2E_TEST_EMAIL;
const password = process.env.E2E_TEST_PASSWORD;

test.beforeEach(async () => {
  if (!email || !password) throw new Error('E2E_TEST_EMAIL and E2E_TEST_PASSWORD must be configured as CI secrets.');
});

async function login(page: Page, destination: string) {
  await page.goto('/auth?next=' + encodeURIComponent(destination));
  await page.getByLabel('Email').fill(email!);
  await page.getByLabel('Senha').fill(password!);
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();

  // Aguarda a navegação SPA terminar; não amostra /login ou /auth imediatamente após o clique.
  const expectedPath = new URL(destination, 'http://localhost').pathname;
  await expect(page).toHaveURL(url => url.pathname === expectedPath, { timeout: 15000 });
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
  // Each caller verifies the note persisted by reopening Diário; toast copy differs by reader.
}

async function openStudyJournal(page: Page, marker: string) {
  await page.goto('/conta/diario');
  await expect(page.getByRole('button', { name: 'Estudo e Leitura' })).toBeVisible();
  await page.getByRole('button', { name: 'Estudo e Leitura' }).click();
  const noteText = page.getByText(marker, { exact: false }).first();
  await expect(noteText).toBeVisible();
  // O botão de contexto é irmão do parágrafo dentro do cartão da anotação.
  const noteCard = noteText.locator('xpath=ancestor::*[.//button[normalize-space(.)="Ver Contexto"]][1]');
  await expect(noteCard.getByRole('button', { name: 'Ver Contexto', exact: true })).toBeVisible();
  return noteCard;
}

test('Átrio: portal de notícias identifica fontes e navegação do carrossel', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Notícias da Igreja' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Vatican News' })).toHaveAttribute('href', 'https://www.vaticannews.va/pt.html');
  await expect(page.getByRole('link', { name: 'CNBB', exact: true })).toHaveAttribute('href', 'https://www.cnbb.org.br/');
  await expect(page.getByRole('link', { name: 'Santa Sé' })).toHaveAttribute('href', 'https://press.vatican.va/content/salastampa/pt.html');
  await expect(page.getByRole('heading', { level: 3, name: 'Leão XIV agradece aos participantes e pede que partilhem os frutos do encontro' })).toBeVisible();
  await page.getByRole('button', { name: 'Próxima notícia' }).click();
  await expect(page.getByRole('heading', { level: 3, name: 'Encontro sobre Amoris laetitia: buscar novas respostas para novas perguntas' })).toBeVisible();
  await expect(page.getByText('02 / 06')).toBeVisible();
});

test('legacy /login alias preserves the full protected destination', async ({ page }) => {
  await page.goto('/login?next=' + encodeURIComponent('/diario?section=notes#latest'));
  await expect(page).toHaveURL(url =>
    url.pathname === '/auth' && url.searchParams.get('next') === '/diario?section=notes#latest',
    { timeout: 15000 },
  );
});

test('auth redirect preserves protected destination', async ({ page }) => {
  await page.context().clearCookies();
  await page.goto('/diario');
  await expect(page).toHaveURL(url =>
    url.pathname === '/auth' && url.searchParams.get('next') === '/diario',
    { timeout: 15000 },
  );
});

test('login restores the requested path, query and hash after real authentication', async ({ page }) => {
  await login(page, '/catechism?p=2865#p2865');
  await expect(page).toHaveURL(url =>
    url.pathname === '/catechism' &&
    url.searchParams.get('p') === '2865' &&
    url.hash === '#p2865',
    { timeout: 15000 },
  );
  await expect(page.locator('#p2865')).toBeVisible();
});

test('admin consoles require authentication and preserve the requested destination', async ({ page }) => {
  for (const destination of ['/admin/parceiros', '/bible-recovery']) {
    await page.context().clearCookies();
    await page.goto(destination);
    await expect(page).toHaveURL(url => {
      if (url.pathname !== '/auth') return false;
      return url.searchParams.get('next') === destination;
    });
  }
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
  // The inline reference first opens its contextual popover; navigation is an
  // explicit action inside that popover, and must preserve the exact verse.
  await page.getByRole('button', { name: 'Ir ao versículo 21', exact: true }).click();
  await expect(page).toHaveURL(/\/bible\?book=Mt&ch=5&v=21/);
});

test('Catecismo: proveniência do texto oficial fica visível e navegável', async ({ page }) => {
  await login(page, '/catechism?p=1');
  await expect(page.locator('#p1')).toBeVisible();
  // Desktop and mobile render responsive source cards; scope to the visible
  // official link rather than matching duplicate hidden labels in both layouts.
  const source = page.locator('#p1 a[href*="vatican.va"]:visible').filter({ hasText: 'Santa Sé · vatican.va' });
  await expect(source).toBeVisible();
  await expect(source).toHaveAttribute('href', /vatican\.va/);
});

test('Catecismo: Conexo prioriza relação curada e mantém a referência navegável', async ({ page }) => {
  const bad = watchBrowserHealth(page);
  await login(page, '/catechism?p=279');
  await expect(page.locator('#p279')).toBeVisible();
  await expect(page.locator('#p279').getByText('Gn 1:1', { exact: true })).toBeVisible();
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