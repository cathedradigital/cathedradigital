import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const DOMPURIFY_BROWSER_BUNDLE = require.resolve('dompurify/dist/purify.js');

async function navigateToDogmasClientSide(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Bíblia, Catecismo/ })).toBeVisible();
  await page.evaluate(() => {
    window.history.pushState({}, '', '/dogmas');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(page.getByLabel('Buscar nos dogmas')).toBeVisible();
}

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
  await expect(page.getByLabel('Senha', { exact: true })).toBeVisible();
  expect(bad).toEqual([]);
});

test('Quiz da Fé abre e permite responder a primeira pergunta', async ({ page }) => {
  const errors: string[] = [];
  const badResponses: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('response', response => {
    if (response.status() >= 400) badResponses.push(`${response.status()}: ${response.url()}`);
  });

  const response = await page.goto('/quiz');
  expect(response?.ok(), `/quiz: HTTP ${response?.status()}`).toBeTruthy();
  await expect(page.getByRole('heading', { name: 'Quiz da Fé' })).toBeVisible();
  await expect(page.getByText(/Pergunta 1\//)).toBeVisible();

  const options = page.locator('button.w-full.text-left:visible:has(span.w-spacing-xl)');
  await expect(options).toHaveCount(4);
  await options.first().click();
  await expect(page.getByRole('button', { name: /Próxima Pergunta|Ver Resultado Final/ })).toBeVisible();

  expect(errors, '/quiz: console errors').toEqual([]);
  expect(badResponses, '/quiz: HTTP errors').toEqual([]);
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


test('Magistério: Código de Direito Canônico abre o PDF oficial no leitor', async ({ page }) => {
  const officialPdf = 'https://www.vatican.va/archive/cod-iuris-canonici/portuguese/codex-iuris-canonici_po.pdf';
  const pdfResponsePromise = page.waitForResponse(
    response => response.url() === officialPdf && response.request().resourceType() === 'document',
    { timeout: 20_000 },
  );

  const response = await page.goto('/magisterium/cdc');
  expect(response?.ok(), `/magisterium/cdc: HTTP ${response?.status()}`).toBeTruthy();
  await expect(page.getByTestId('magisterium-pdf-reader')).toBeVisible();
  await expect(page.getByTestId('magisterium-pdf-frame')).toHaveAttribute('src', officialPdf);
  await expect(page.getByTestId('magisterium-pdf-open-source')).toHaveAttribute('href', officialPdf);

  const pdfResponse = await pdfResponsePromise;
  expect(pdfResponse.ok(), `PDF oficial: HTTP ${pdfResponse.status()}`).toBeTruthy();
  expect(pdfResponse.headers()['content-type']).toContain('application/pdf');
});

test('Documentos: Dei Filius organiza cabeçalho, idioma original e tradução', async ({ page }) => {
  const errors: string[] = [];
  const failedResponses: string[] = [];
  const translationRequests: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('request', request => {
    const url = new URL(request.url());
    if (url.pathname.endsWith('/functions/v1/document-translate')) {
      translationRequests.push(url.origin + url.pathname);
    }
  });
  page.on('response', response => {
    if (response.status() >= 400) {
      const url = new URL(response.url());
      failedResponses.push(`${response.status()} ${url.origin}${url.pathname}`);
    }
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
  expect(failedResponses, 'Dei Filius: failed HTTP resources (origin and path only)').toEqual([]);
  expect(translationRequests, 'Dei Filius: translation must be initiated by the reader').toEqual([]);
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
  await expect.poll(
    async () =>
      (await page.locator('[data-nexus-panel]').count()) +
      (await page.getByRole('heading', { name: 'Nexus Theologicus em Processamento' }).count()),
    { timeout: 10_000 },
  ).toBe(1);
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


test('Catecismo: deep-link §2262 carrega o texto oficial sem depender do scroll', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });

  const response = await page.goto('/catechism?p=2262');
  expect(response?.ok(), `/catechism?p=2262: HTTP ${response?.status()}`).toBeTruthy();

  const paragraph = page.locator('#p2262');
  await expect(paragraph).toBeVisible();
  await expect(paragraph).toContainText('No sermão da montanha, o Senhor lembra o preceito');
  await expect(paragraph).toContainText('Não matarás');
  await expect(paragraph.getByRole('button', { name: /Mt 5, 21/i }).first()).toBeVisible();
  await expect(paragraph).not.toContainText('Rolar para carregar §2262');

  expect(errors, 'Catecismo §2262: console errors').toEqual([]);
});


test('Mobile: carrossel abre os submódulos e preserva a navegação canônica', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const carousel = page.getByTestId('mobile-module-carousel');
  await expect(carousel).toBeVisible();
  await expect(carousel).toHaveCSS('position', 'fixed');
  await expect(carousel).toHaveCSS('bottom', '0px');

  const studyingButton = carousel.getByRole('button', { name: 'Menu de navegação: Estudar' });
  const studyingHeading = carousel.getByRole('heading', { name: 'Estudar' });
  await studyingButton.click();
  await expect(studyingHeading).toBeVisible();
  await studyingButton.click();
  await expect(studyingHeading).toHaveCount(0);
  await page.reload();
  await expect(carousel).toBeVisible();
  await expect(studyingHeading).toHaveCount(0);
  await studyingButton.click();
  await expect(studyingHeading).toBeVisible();
  await carousel.getByRole('button', { name: /Bíblia/ }).click();
  await expect(page).toHaveURL(/\/bible$/);

  const prayButton = carousel.getByRole('button', { name: 'Menu de navegação: Rezar' });
  const prayHeading = carousel.getByRole('heading', { name: 'Rezar' });
  await prayButton.click();
  await expect(prayHeading).toBeVisible();
  await carousel.locator('#mobile-module-submenu').getByRole('button', { name: 'Fechar menu' }).click();
  await expect(prayHeading).toHaveCount(0);
  await page.reload();
  await expect(carousel).toBeVisible();
  await expect(prayHeading).toHaveCount(0);
  await prayButton.click();
  await expect(prayHeading).toBeVisible();
  await expect(carousel.getByRole('button', { name: /Orações/ })).toBeVisible();
  await expect(carousel.getByRole('button', { name: /Liturgia das Horas/ })).toBeVisible();
  await carousel.getByRole('button', { name: /Liturgia das Horas/ }).click();
  await expect(page).toHaveURL(/\/breviary$/);
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


test('Home: identidade visual usa a marca Cathedra Digital', async ({ page }) => {
  await page.goto('/');
  const homeBrand = page.locator('main [aria-label="Cathedra Digital"]').first();
  await expect(homeBrand).toBeVisible();
  await expect(homeBrand.getByText('Cathedra Digital', { exact: true })).toBeVisible();
  await expect(page.getByRole('contentinfo', { name: 'Rodapé' })).toContainText(/Cathedra Digital/i);
  await expect(page).toHaveTitle(/Cathedra Digital/i);
});


test('Mobile: conteúdo reserva espaço para a navegação inferior', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const paddingBottom = await page.locator('#main-content').evaluate((element) =>
    window.getComputedStyle(element).paddingBottom,
  );
  expect(Number.parseFloat(paddingBottom)).toBeGreaterThan(0);
});


test('Dogmas e aparições: a busca inclui anos e detalhes documentais', async ({ page }) => {
  await navigateToDogmasClientSide(page);
  await page.getByLabel('Buscar nos dogmas').fill('431');
  await expect(page.getByRole('heading', { name: 'Encarnação do Verbo', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Existência de Deus', exact: true })).toHaveCount(0);

  await page.goto('/aparicoes');
  await page.getByLabel('Buscar nas aparições e devoções').fill('investigação eclesiástica');
  await expect(page.getByText('Nossa Senhora de Lourdes', { exact: true })).toBeVisible();
  await expect(page.getByText('Nossa Senhora de Fátima', { exact: true })).toHaveCount(0);
});

test('Dogmas: cabeçalho e accordions permanecem legíveis no mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await navigateToDogmasClientSide(page);

  const description = page.getByText('Verdades divinamente reveladas, definidas solenemente pela Igreja como parte do depósito da fé.', { exact: true });
  await expect(description).toBeVisible();
  expect(await description.evaluate(element => element.getBoundingClientRect().width)).toBeGreaterThan(280);
  await expect(page.getByRole('heading', { name: 'Dogmas da Fé Católica', exact: true })).toHaveCount(1);

  const firstDogma = page.getByRole('button', { name: /Existência de Deus/ });
  const title = firstDogma.getByRole('heading', { name: 'Existência de Deus', exact: true });
  await expect(title).toBeVisible();
  const contrast = await firstDogma.evaluate(button => {
    const heading = button.querySelector('h3');
    if (!heading) return 0;
    const luminance = (color: string) => {
      const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
      if (!channels || channels.length !== 3) return 0;
      const [red, green, blue] = channels.map(channel => {
        const normalized = channel / 255;
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    };
    const foreground = luminance(getComputedStyle(heading).color);
    const background = luminance(getComputedStyle(button).backgroundColor);
    return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
  });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
});

test('Aparições e devoções marianas: avaliação e fonte são específicas por registro', async ({ page }) => {
  const errors: string[] = [];
  const failedResponses: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('response', response => {
    if (response.status() >= 400) failedResponses.push(`${response.status()}: ${response.url()}`);
  });

  const response = await page.goto('/aparicoes');
  expect(response?.ok(), `/aparicoes: HTTP ${response?.status()}`).toBeTruthy();
  await expect(page.getByRole('heading', { name: 'Aparições e devoções marianas' })).toBeVisible();

  await page.getByText('Nossa Senhora Aparecida', { exact: true }).first().click();
  await expect(page.getByText('Devoção mariana ligada à descoberta de uma imagem')).toBeVisible();
  await expect(page.locator('body')).toContainText('não em um relato de aparição ou visão');
  const aparecidaSource = page.getByRole('link', { name: 'Consultar publicação do Estado da Cidade do Vaticano' });
  await expect(aparecidaSource).toHaveAttribute('href', /vaticanstate\.va/);

  await page.getByLabel('Aparição — Nossa Senhora').getByRole('button', { name: 'Voltar', exact: true }).click();
  await page.getByText('Nossa Senhora de Lourdes', { exact: true }).first().click();
  await expect(page.getByText('Decreto episcopal de reconhecimento (1862)')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ler o decreto no Santuário de Lourdes' })).toHaveAttribute('href', /lourdes-france\.org/);

  expect(errors, 'Aparições: erros de console').toEqual([]);
  expect(failedResponses, 'Aparições: respostas HTTP com erro').toEqual([]);
});

test('Rezar no protótipo encaminha cada opção para seu módulo real', async ({ page }) => {
  const routes = [
    ['Missa', '/missal'],
    ['Laudes', '/breviary?h=laudes'],
    ['Meio-dia · Sexta', '/breviary?h=sexta'],
    ['Vésperas', '/breviary?h=vesperas'],
    ['Completas', '/breviary?h=completas'],
    ['Rosário', '/oracao/rosario'],
    ['Via-Sacra', '/viacrucis'],
    ['Ladainhas', '/litanies'],
    ['Lectio Divina', '/lectio'],
    ['Exame de consciência', '/oracao/exame-de-consciencia'],
    ['Novenas', '/novenas'],
    ['Livro de orações', '/oracao'],
  ] as const;

  for (const [label, destination] of routes) {
    await page.goto('/prototype-2.0/rezar');
    await page.getByRole('link', { name: label, exact: false }).click();
    await expect(page).toHaveURL(new RegExp(destination.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$'));
  }
});


test('Sanctorum: catálogo público carrega santos com fonte e status editorial', async ({ page }) => {
  const response = await page.goto('/santos');
  expect(response?.ok(), `/santos: HTTP ${response?.status()}`).toBeTruthy();

  const allTab = page.getByRole('tab', { name: 'Todos' });
  await expect(allTab, 'Sanctorum: aba Todos deve estar disponível no catálogo').toBeVisible({ timeout: 10_000 });

  const allSaintsResponsePromise = page.waitForResponse(
    candidate => {
      const url = new URL(candidate.url());
      return url.pathname.endsWith('/rest/v1/saints')
        && candidate.request().method() === 'GET'
        && url.searchParams.get('limit') === '100';
    },
    { timeout: 15_000 },
  );

  await allTab.scrollIntoViewIfNeeded();
  await allTab.click({ timeout: 10_000 });

  const allSaintsResponse = await allSaintsResponsePromise;
  expect(allSaintsResponse.status(), 'Sanctorum: consulta pública da lista deve retornar HTTP 200').toBe(200);
  const rows = await allSaintsResponse.json() as Array<{ id?: string }>;
  expect(rows.some(row => row.id === 'santo-agostinho'), 'Sanctorum: Santo Agostinho deve existir na resposta pública').toBeTruthy();

  await expect(page.getByRole('heading', { name: 'Base Sanctorum' })).toBeVisible({ timeout: 10_000 });

  const augustine = page.getByRole('button', { name: /Santo Agostinho de Hipona/ });
  await expect(augustine, 'Sanctorum: ficha de Santo Agostinho deve aparecer na lista').toBeVisible({ timeout: 10_000 });
  // Use the browser's native visibility scroll; manually offsetting the page
  // after scrolling could move the card back outside the viewport on mobile.
  await augustine.scrollIntoViewIfNeeded();
  // Clique em uma área limpa da imagem do card, sem texto/elementos internos.
  await augustine.click({ position: { x: 24, y: 24 }, timeout: 10_000 });

  await expect(page.locator('body')).toContainText('Agostinho nasceu em Tagaste', { timeout: 15_000 });
  await expect(page.getByText('Ficha em curadoria', { exact: true })).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('body')).toContainText('Santa Sé', { timeout: 10_000 });
});


test('Rezar ativo apresenta os três caminhos centrais e abre o Rosário', async ({ page }) => {
  const response = await page.goto('/rezar');
  expect(response?.ok(), `/rezar: HTTP ${response?.status()}`).toBeTruthy();
  await expect(page.getByRole('heading', { name: 'Rezar' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Uma vida de oração, três caminhos' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Liturgia das Horas' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Lectio Divina' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Rosário' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Outras formas de oração' })).toBeVisible();

  await page.getByRole('link', { name: /Rezar o Rosário/ }).click();
  await expect(page).toHaveURL(/\/oracao\/rosario$/);
});

test('SEO: robots e sitemap são servidos com URLs canônicas únicas', async ({ request }) => {
  const robotsResponse = await request.get('/robots.txt');
  expect(robotsResponse.ok(), 'robots.txt deve responder HTTP 2xx').toBeTruthy();
  const robots = await robotsResponse.text();
  expect(robots).toMatch(/^User-agent:\s*\*/m);
  expect(robots).toContain('Sitemap: https://www.cathedradigital.com.br/sitemap.xml');

  const sitemapResponse = await request.get('/sitemap.xml');
  expect(sitemapResponse.ok(), 'sitemap.xml deve responder HTTP 2xx').toBeTruthy();
  const sitemap = await sitemapResponse.text();
  expect(sitemap).toMatch(/<urlset\b/);
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].trim());
  expect(urls.length).toBeGreaterThan(0);
  expect(new Set(urls).size, 'sitemap não pode conter URLs duplicadas').toBe(urls.length);
  expect(urls.every((url) => url === 'https://www.cathedradigital.com.br' || url.startsWith('https://www.cathedradigital.com.br/'))).toBe(true);
});


test('Formar-se: rota protegida preserva destino ao exigir autenticação', async ({ page }) => {
  const response = await page.goto('/jornadas');
  expect(response?.ok(), '/jornadas: HTTP ' + response?.status()).toBeTruthy();
  await expect(page).toHaveURL(/\/auth\?next=/);
  const next = new URL(page.url()).searchParams.get('next') ?? '';
  expect(decodeURIComponent(next)).toContain('/jornadas');
});


test('Rezar: Breviário sai do skeleton com fallback ou conteúdo disponível', async ({ page }) => {
  for (const legacySlug of ['terca', 'oficio-leituras']) {
    const response = await page.goto(`/breviary?h=${legacySlug}`);
    expect(response?.ok(), `/breviary?h=${legacySlug}: HTTP ${response?.status()}`).toBeTruthy();
    const unavailable = page.getByRole('heading', { name: 'Liturgia das Horas ainda não cadastrada' });
    const available = page.getByRole('region', { name: /Espírito da Hora: Hora canônica/ });
    await expect.poll(async () => (await unavailable.isVisible()) || (await available.isVisible()), {
      timeout: 15_000,
    }).toBe(true);
    if (await unavailable.isVisible()) {
      await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Voltar ao Livro de Orações' })).toBeVisible();
    } else {
      await expect(available).toBeVisible();
    }
    await expect(page.locator('body')).not.toContainText(/Preparando Liturgia/i);
  }
});


test('Rezar: Rosário apresenta os quatro conjuntos e inicia uma sessão', async ({ page }) => {
  const response = await page.goto('/oracao/rosario');
  expect(response?.ok(), `/oracao/rosario: HTTP ${response?.status()}`).toBeTruthy();
  await expect(page.getByRole('heading', { name: 'Santo Rosário' })).toBeVisible();

  for (const setName of ['Mistérios Gozosos', 'Mistérios Luminosos', 'Mistérios Dolorosos', 'Mistérios Gloriosos']) {
    await expect(page.getByRole('button', { name: new RegExp(setName) })).toBeVisible();
  }

  await page.getByRole('button', { name: /Mistérios Gozosos/ }).click();
  await expect(page.getByRole('heading', { name: 'Mistérios Gozosos' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Escolha o modo' })).toBeVisible();
  await page.getByRole('button', { name: 'Iniciar Oração' }).click();
  await expect(page.getByRole('heading', { name: 'Sinal da Cruz' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sair da oração e voltar' })).toBeVisible();
});

test('Rezar: Via-Sacra apresenta o portal, as 14 estações e inicia a primeira', async ({ page }) => {
  const response = await page.goto('/viacrucis');
  expect(response?.ok(), `/viacrucis: HTTP ${response?.status()}`).toBeTruthy();
  await expect(page.getByRole('heading', { name: 'Via Sacra' })).toBeVisible();
  await page.getByRole('button', { name: 'Entrar em oração' }).click();
  await expect(page.getByTestId('via-sacra-journey')).toBeVisible();

  const landingPage = await page.context().newPage();
  // Isola a landing do progresso persistido pela primeira sessão do portal.
  await landingPage.addInitScript(() => {
    localStorage.removeItem('cathedra:devotional-progress:viacrucis');
  });
  const landing = await landingPage.goto('/viacrucis?enter=1');
  expect(landing?.ok(), '/viacrucis?enter=1 deve responder HTTP 2xx').toBeTruthy();
  await expect(landingPage.getByRole('heading', { name: 'Via Crucis' })).toBeVisible();
  await expect(landingPage.getByTestId('via-sacra-intro')).toBeVisible();
  await expect(landingPage.locator('[data-testid^="via-sacra-station-tile-"]')).toHaveCount(14);

  await landingPage.getByTestId('via-sacra-start').click();
  await expect(landingPage.getByTestId('via-sacra-journey')).toBeVisible();
  const activeJourney = landingPage.getByTestId('via-sacra-journey');
  await expect(activeJourney.getByText('Escritura', { exact: true }).first()).toBeVisible();
  await expect(activeJourney.getByText('Meditação', { exact: true }).first()).toBeVisible();
  await expect(activeJourney.getByText('Oração', { exact: true }).first()).toBeVisible();
  await landingPage.close();
});

test('Rezar: Ladainhas abre o texto completo e permite localizar uma invocação', async ({ page }) => {
  const response = await page.goto('/litanies');
  expect(response?.ok(), `/litanies: HTTP ${response?.status()}`).toBeTruthy();
  await expect(page.getByRole('heading', { name: 'Ladainhas' })).toBeVisible();

  await page.getByLabel('Buscar ladainha').fill('Sagrado Coração');
  const litanyCard = page.getByRole('button', { name: /Litania do Sagrado Coração de Jesus/ });
  await expect(litanyCard).toBeVisible();
  await litanyCard.click();

  await expect(page.getByRole('heading', { name: 'Litania do Sagrado Coração de Jesus' })).toBeVisible();
  await expect(page.getByText('Pai celeste, que sois Deus,')).toBeVisible();
  await expect(page.getByText('Coração de Jesus, fonte de vida e de santidade,')).toBeVisible();
  await expect(page.locator('#litany-closing')).toBeVisible();
});

test('Rezar: Novena permite navegar pelos dias e registrar conclusão', async ({ page }) => {
  const response = await page.goto('/novenas/espirito-santo');
  expect(response?.ok(), `/novenas/espirito-santo: HTTP ${response?.status()}`).toBeTruthy();
  await expect(page.getByText('Dia 1 de 9')).toBeVisible();
  await expect(page.getByText('Espírito de Sabedoria').first()).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ir para o dia 2' })).toBeVisible();

  await page.getByRole('button', { name: 'Ir para o dia 2' }).click();
  await expect(page).toHaveURL(/dia=2/);
  await expect(page.getByText('Dia 2 de 9')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Espírito de Entendimento' })).toBeVisible();

  await page.getByRole('button', { name: /Concluir dia 2/ }).click();
  await expect(page.getByText('1/9 dias completos')).toBeVisible();
});



test('Segurança editorial: DOMPurify preserva estrutura e remove conteúdo ativo', async ({ page }) => {
  await page.goto('/');
  await page.addScriptTag({ path: DOMPURIFY_BROWSER_BUNDLE });

  const result = await page.evaluate(() => {
    const purifier = (window as Window & { DOMPurify?: { sanitize: (html: string) => string } }).DOMPurify;
    if (!purifier) throw new Error('DOMPurify browser bundle was not initialized.');

    const dirty = `
      <h2>Vida e missão</h2>
      <p>Texto editorial <strong>essencial</strong> e <em>contextual</em>.</p>
      <ul><li>Primeiro ponto preservado</li></ul>
      <a href="https://www.vatican.va/content/vatican/pt.html">Fonte oficial</a>
      <a href="javascript:window.__editorialXss=1">link inválido</a>
      <img src="x" onerror="window.__editorialXss=2">
      <script>window.__editorialXss=3</script>
    `;
    const clean = purifier.sanitize(dirty);
    const article = document.createElement('article');
    article.innerHTML = clean;
    return {
      heading: article.querySelector('h2')?.textContent,
      strong: article.querySelector('strong')?.textContent,
      emphasis: article.querySelector('em')?.textContent,
      listItem: article.querySelector('li')?.textContent,
      officialHref: article.querySelector('a[href^="https://"]')?.getAttribute('href'),
      scriptCount: article.querySelectorAll('script').length,
      eventHandlerCount: article.querySelectorAll('[onerror], [onclick]').length,
      unsafeHrefCount: article.querySelectorAll('a[href^="javascript:"]').length,
    };
  });

  expect(result.heading).toBe('Vida e missão');
  expect(result.strong).toBe('essencial');
  expect(result.emphasis).toBe('contextual');
  expect(result.listItem).toBe('Primeiro ponto preservado');
  expect(result.officialHref).toContain('vatican.va');
  expect(result.scriptCount).toBe(0);
  expect(result.eventHandlerCount).toBe(0);
  expect(result.unsafeHrefCount).toBe(0);

  const bioSource = readFileSync(new URL('../src/features/saints/editorialEngine/blocks/SaintBioBlock.tsx', import.meta.url), 'utf8');
  const workSource = readFileSync(new URL('../src/pages/biblioteca/SaintWorkReaderPage.tsx', import.meta.url), 'utf8');
  expect(bioSource).toContain('DOMPurify.sanitize(html)');
  expect(workSource).toContain("DOMPurify.sanitize(chapter.body_html ?? '')");
});


test('Liturgia: provider registrado, fallback para Railway e erro de função não vira queda do banco', async ({ page }) => {
  let railwayRequests = 0;
  await page.route('**/functions/v1/liturgical-calendar**', route =>
    route.abort('failed'),
  );
  await page.route('**/functions/v1/saint-of-the-day**', route =>
    route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ code: 'NOT_FOUND', message: 'Requested function was not found' }),
    }),
  );
  await page.route('https://liturgia.up.railway.app/**', route => {
    railwayRequests += 1;
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: '09/11/2026',
        liturgia: 'Celebração de teste',
        cor: 'branco',
        dia: 'Segunda-feira',
        primeiraLeitura: { referencia: 'Sb 1,1', titulo: 'Primeira Leitura', texto: 'Texto de teste da primeira leitura.' },
        salmo: { referencia: 'Sl 1', refrao: 'Resposta de teste', texto: 'Texto de teste do salmo.' },
        segundaLeitura: null,
        evangelho: { referencia: 'Lc 10,1', titulo: 'Evangelho', texto: 'Texto de teste do Evangelho.' },
      }),
    });
  });

  const response = await page.goto('/liturgia?d=2026-11-09');
  expect(response?.ok(), `/liturgia: HTTP ${response?.status()}`).toBeTruthy();
  await expect(page.getByText('Celebração de teste').first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('Texto de teste da primeira leitura.')).toBeVisible();
  await expect(page.getByText('Banco de Dados Indisponível')).toHaveCount(0);
  expect(railwayRequests).toBeGreaterThan(0);
});
