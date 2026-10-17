import { test, expect } from '@playwright/test';

const publicRoutes = [
  ['Átrio', '/'],
  ['Hub Estudar', '/estudar'],
  ['Bíblia', '/bible?book=Jo&ch=3'],
  ['Catecismo', '/catechism?p=1'],
  ['Magistério', '/magisterium/dce?p=1'],
  ['Nexus', '/nexus'],
  ['Biblioteca', '/biblioteca'],
  ['Santos', '/santos'],
  ['Igreja Viva', '/community'],
  ['Livro de Orações', '/oracao'],
  ['Liturgia', '/liturgia'],
  ['Breviário', '/breviary'],
  ['Missal', '/missal'],
  ['Rosário', '/oracao/rosario'],
  ['Via-Sacra', '/viacrucis'],
  ['Ladainhas', '/litanies'],
  ['Novenas', '/novenas'],
  ['Lectio Divina', '/lectio'],
  ['Temas de formação', '/temas'],
  ['Pesquisa', '/buscar'],
  ['Glossário', '/glossario'],
  ['Atlas', '/atlas'],
  ['Santo Tomás de Aquino', '/aquinas'],
  ['Papas', '/papas'],
  ['Aparições', '/aparicoes'],
  ['Dogmas', '/dogmas'],
  ['Planos', '/pricing'],
  ['Sobre', '/about'],
  ['Privacidade', '/legal/privacy'],
  ['Termos', '/terms'],
  ['Contato', '/contato'],
] as const;

const protectedRoutes = [
  '/hoje',
  '/diario?section=notes#latest',
  '/profile',
  '/favorites',
  '/achievements',
  '/jornadas',
  '/checkout',
  '/transactions',
  '/conta/configuracoes',
  '/admin/site-health',
] as const;

for (const [label, path] of publicRoutes) {
  test('route smoke: ' + label + ' renders the application shell', async ({ page }) => {
    test.setTimeout(20000);
    const badResponses: string[] = [];
    page.on('response', (response) => {
      if ([404, 500, 502, 503, 504].includes(response.status())) {
        badResponses.push(response.status() + ' ' + response.url());
      }
    });

    const response = await page.goto(path);
    expect(response?.status(), label + ' document response').toBe(200);
    const expectedPath = new URL(path, 'http://localhost').pathname;
    await expect(page).toHaveURL((url) => url.pathname === expectedPath, { timeout: 7000 });
    await expect(page.locator('main').first(), label + ' should render a main landmark').toBeVisible({ timeout: 7000 });
    await expect(page.getByText('Página não encontrada', { exact: false })).toHaveCount(0);
    await expect(page.getByText('Não foi possível carregar esta página', { exact: false })).toHaveCount(0);
    expect(badResponses, label + ' unexpected HTTP failures').toEqual([]);
  });
}

for (const destination of protectedRoutes) {
  test('route smoke: protected destination is preserved for ' + destination, async ({ page }) => {
    test.setTimeout(20000);
    await page.goto(destination);
    await expect(page).toHaveURL((url) =>
      url.pathname === '/auth' && url.searchParams.get('next') === destination,
      { timeout: 7000 },
    );
    await expect(page.getByLabel('Email')).toBeVisible({ timeout: 7000 });
  });
}
