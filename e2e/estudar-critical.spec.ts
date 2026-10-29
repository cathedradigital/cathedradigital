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
  const destinationPath = destination.split('?')[0];
  await expect(page).toHaveURL(url => url.pathname === destinationPath);
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

test('auth diagnostic records safe form, visible error and session state', async ({ page }, testInfo) => {
  const destination = '/bible?book=Jo&ch=3';
  await page.context().clearCookies();
  await page.goto('/login?next=' + encodeURIComponent(destination));
  await page.getByLabel('Email').fill(email!);
  await page.getByLabel('Senha').fill(password!);

  let submitted = false;
  const authApiDiagnostics: Array<{ status: number; code: string | null; category: string }> = [];
  const authNetworkDiagnostics: Array<{ event: 'request_started' | 'request_failed'; host: string; category: string }> = [];
  const isAuthTokenRequest = (rawUrl: string) => {
    try {
      const url = new URL(rawUrl);
      return url.pathname === '/auth/v1/token' && url.searchParams.has('grant_type');
    } catch {
      return false;
    }
  };
  page.on('request', request => {
    if (!isAuthTokenRequest(request.url())) return;
    try {
      authNetworkDiagnostics.push({
        event: 'request_started',
        host: new URL(request.url()).host,
        category: 'auth_token_request_started',
      });
    } catch {
      authNetworkDiagnostics.push({
        event: 'request_started',
        host: 'unavailable',
        category: 'auth_token_request_started',
      });
    }
  });
  page.on('requestfailed', request => {
    if (!isAuthTokenRequest(request.url())) return;
    const failure = request.failure()?.errorText ?? '';
    const knownNetworkErrors: Record<string, string> = {
      'net::ERR_NAME_NOT_RESOLVED': 'dns_resolution_failed',
      'net::ERR_CONNECTION_REFUSED': 'connection_refused',
      'net::ERR_CONNECTION_RESET': 'connection_reset',
      'net::ERR_TIMED_OUT': 'network_timeout',
      'net::ERR_INTERNET_DISCONNECTED': 'network_disconnected',
      'net::ERR_CERT_AUTHORITY_INVALID': 'tls_certificate_rejected',
      'net::ERR_FAILED': 'browser_network_failure',
    };
    let host = 'unavailable';
    try {
      host = new URL(request.url()).host;
    } catch {
      // Keep sanitized fallback.
    }
    authNetworkDiagnostics.push({
      event: 'request_failed',
      host,
      category: knownNetworkErrors[failure] ?? 'unclassified_network_failure',
    });
  });
  page.on('response', async response => {
    try {
      const url = new URL(response.url());
      if (url.pathname !== '/auth/v1/token' || !url.searchParams.has('grant_type')) return;
      let payload: Record<string, unknown> = {};
      try {
        payload = await response.json() as Record<string, unknown>;
      } catch {
        payload = {};
      }
      const rawCode = [payload.code, payload.error, payload.error_code]
        .find(value => typeof value === 'string') as string | undefined;
      const normalized = (rawCode ?? '').toLowerCase();
      const allowedCodes = new Set([
        'invalid_credentials', 'email_not_confirmed', 'over_request_rate_limit',
        'bad_jwt', 'invalid_api_key', 'no_api_key', 'validation_failed',
        'user_banned', 'request_timeout',
      ]);
      const code = allowedCodes.has(normalized) ? normalized : (rawCode ? 'other_service_error' : null);
      const category =
        response.status() === 401 && ['invalid_credentials', 'email_not_confirmed'].includes(normalized) ? 'credentials_or_confirmation' :
        response.status() === 401 && ['invalid_api_key', 'no_api_key'].includes(normalized) ? 'api_key_rejected' :
        response.status() === 429 || normalized === 'over_request_rate_limit' ? 'rate_limited' :
        response.status() >= 500 ? 'supabase_server_error' :
        response.status() >= 400 ? 'request_rejected' :
        response.ok() ? 'success' : 'unknown';
      authApiDiagnostics.push({ status: response.status(), code, category });
    } catch {
      authApiDiagnostics.push({ status: 0, code: null, category: 'diagnostic_capture_error' });
    }
  });
  await page.getByRole('button', { name: 'Entrar', exact: true }).click();
  submitted = true;

  const destinationPath = destination.split('?')[0];
  const outcome = await Promise.race([
    page.waitForURL(url => url.pathname === destinationPath, { timeout: 15_000 })
      .then(() => 'destination' as const).catch(() => null),
    page.getByRole('alert').waitFor({ state: 'visible', timeout: 15_000 })
      .then(() => 'visible-error' as const).catch(() => null),
  ]);

  const diagnostic = await page.evaluate(() => {
    const error = document.querySelector('[role="alert"]')?.textContent?.trim() ?? null;
    const sessionPresent = Object.keys(localStorage).some(key => {
      if (!/^sb-.+-auth-token$/.test(key)) return false;
      try {
        const value = JSON.parse(localStorage.getItem(key) ?? 'null');
        return Boolean(value?.access_token && value?.user);
      } catch {
        return false;
      }
    });
    return {
      pathname: location.pathname,
      searchKeys: [...new URLSearchParams(location.search).keys()],
      visibleError: error,
      sessionPresent,
    };
  });

  const result = { submitted, outcome, ...diagnostic, authApiDiagnostics, authNetworkDiagnostics };
  console.log('[AUTH-DIAGNOSTIC-SAFE]', JSON.stringify(result));
  await testInfo.attach('auth-diagnostic-safe.json', {
    body: JSON.stringify(result, null, 2),
    contentType: 'application/json',
  });

  expect(
    outcome,
    'Login did not reach the requested protected destination. See auth-diagnostic-safe.json for the sanitized result.',
  ).toBe('destination');
  expect(
    diagnostic.pathname,
    'Login ended on the wrong route instead of the protected destination.',
  ).toBe(destinationPath);
  expect(
    diagnostic.sessionPresent,
    'The protected destination was reached without a Supabase session in localStorage.',
  ).toBeTruthy();
  expect(
    diagnostic.visibleError,
    'The login form reported an authentication error.',
  ).toBeNull();
});

test('auth redirect preserves protected destination', async ({ page }) => {
  await page.context().clearCookies();
  await page.goto('/diario');
  await expect(page).toHaveURL(/\/auth\?next=/);
  expect(new URL(page.url()).searchParams.get('next')).toContain('diario');
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
  await login(page, '/catechism?p=2262');
  await expect(page).toHaveURL(/\/catechism\?p=2262$/);
  const paragraph = page.locator('#p2262');
  await expect(paragraph).toBeVisible();
  await expect(paragraph).toContainText('No sermão da montanha, o Senhor lembra o preceito');
  const bibleRef = paragraph.getByRole('button', { name: /Mt 5, 21/i }).first();
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
