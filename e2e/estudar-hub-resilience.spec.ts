import { test, expect } from '@playwright/test';

test('Estudar omite conexões quando a consulta do Nexus falha', async ({ page }) => {
  let nexusRequested = false;
  await page.route('**/rest/v1/nexus_relations?**', async route => {
    nexusRequested = true;
    await route.fulfill({ status: 404, contentType: 'application/json', body: JSON.stringify({ code: 'PGRST205', message: 'Table unavailable' }) });
  });
  await page.goto('/estudar');
  await expect.poll(() => nexusRequested).toBe(true);
  await expect(page.locator('section[aria-labelledby="estudar-conexoes"]')).toHaveCount(0);
  await expect(page.locator('section[aria-labelledby="estudar-fontes"]')).toBeVisible();
});

test('Estudar transforma João 3,16 em um destino bíblico interno', async ({ page }) => {
  await page.route('**/rest/v1/**', async route => {
    const url = new URL(route.request().url());
    const table = url.pathname.split('/').pop();
    if (table === 'bible_verses' && url.searchParams.has('text')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
        { number: 16, bible_chapters: { number: 3, bible_books: { abbrev: 'João' } } },
      ]) });
      return;
    }
    if (['bible_verses', 'catechism_official', 'authority_sources', 'corpus_documents', 'journeys', 'nexus_relations'].includes(table ?? '')) {
      await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'content-range': '0-0/0' }, body: '[]' });
      return;
    }
    await route.continue();
  });
  await page.goto('/estudar');
  await page.locator('section[aria-labelledby="estudar-busca"] input').fill('João');
  await expect(page.locator('a[href="/bible?book=Jo%C3%A3o&ch=3&v=16"]')).toBeVisible();
});