import { expect, test } from '@playwright/test';

const rows = [{ id: 'test-term', slug: 'termo-de-teste', term: 'Termo de teste', definition: 'Registro de teste', short_definition: null, category: null, editorial_completeness: null }];

test('Glossário: consulta legado sem status e filtra localmente quando o RPC falha', async ({ page }) => {
  const projections: string[] = [];
  await page.route('**/rest/v1/glossary?*', async (route) => {
    const projection = new URL(route.request().url()).searchParams.get('select') ?? '';
    projections.push(projection);
    await route.fulfill({ status: projection.split(',').includes('status') ? 400 : 200, contentType: 'application/json', body: JSON.stringify(projection.split(',').includes('status') ? { code: '42703', message: 'column glossary.status does not exist' } : rows) });
  });
  await page.route('**/rest/v1/rpc/search_glossary_fuzzy', (route) => route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ code: 'PGRST202', message: 'Function unavailable' }) }));
  await page.goto('/glossario');
  const term = page.getByRole('link').filter({ has: page.getByRole('heading', { name: 'Termo de teste' }) });
  await expect(term).toBeVisible();
  expect(projections.some((projection) => !projection.split(',').includes('status'))).toBe(true);
  const search = page.getByRole('textbox').first();
  await search.fill('inexistente');
  await expect(term).toHaveCount(0);
  await search.fill('teste');
  await expect(term).toBeVisible();
});

test('Glossário: erro de permissão não dispara fallback e permite tentar novamente', async ({ page }) => {
  let requests = 0;
  await page.route('**/rest/v1/glossary?*', async (route) => {
    requests++;
    await route.fulfill({ status: requests === 1 ? 403 : 200, contentType: 'application/json', body: JSON.stringify(requests === 1 ? { code: '42501', message: 'Permission denied' } : rows) });
  });
  await page.goto('/glossario');
  await expect(page.getByRole('alert').filter({ hasText: 'Não foi possível carregar o glossário.' })).toBeVisible();
  expect(requests).toBe(1);
  await page.getByRole('button', { name: 'Tentar novamente', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Termo de teste' })).toBeVisible();
  expect(requests).toBe(2);
});