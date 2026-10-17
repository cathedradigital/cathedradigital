import { test, expect } from '@playwright/test';

test('Átrio: carrossel editorial aparece na página inicial e navega entre notícias', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Notícias da Igreja' })).toBeVisible();

  const sourceLink = page.getByRole('link', { name: 'Ler na fonte original' });
  await expect(sourceLink).toHaveAttribute('href', 'https://www.vatican.va/content/leo-xiv/pt/speeches/2026/october/documents/20261007-anniversario-amoris-laetitia.html');

  await page.getByRole('button', { name: 'Próxima notícia' }).click();
  await expect(sourceLink).toHaveAttribute('href', 'https://press.vatican.va/content/salastampa/it/bollettino/pubblico/2026/10/02/0780/01454.html');

  await page.getByRole('button', { name: 'Notícia anterior' }).click();
  await expect(sourceLink).toHaveAttribute('href', 'https://www.vatican.va/content/leo-xiv/pt/speeches/2026/october/documents/20261007-anniversario-amoris-laetitia.html');

  await page.getByRole('button', { name: /Mostrar notícia 3:/ }).click();
  await expect(sourceLink).toHaveAttribute('href', 'https://www.cnbb.org.br/dom-bruno-versari-aplicacao-amoris-laetitia-no-brasil/');
});

test('Átrio: os ambientes principais mantêm destinos canônicos', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Entrar em Estudar/ })).toHaveAttribute('href', '/estudar');
  await expect(page.getByRole('link', { name: /Entrar em Rezar/ })).toHaveAttribute('href', '/oracao');
  await expect(page.getByRole('link', { name: /Entrar em Formar-se/ })).toHaveAttribute('href', '/jornadas');
  await expect(page.getByRole('link', { name: /Entrar em Pesquisar/ })).toHaveAttribute('href', '/buscar');

  await page.getByRole('link', { name: /Entrar em Estudar/ }).click();
  await expect(page).toHaveURL(/\/estudar$/);

  await page.goto('/');
  await page.getByRole('link', { name: /Entrar em Rezar/ }).click();
  await expect(page).toHaveURL(/\/oracao$/);

  await page.goto('/');
  await page.getByRole('link', { name: /Entrar em Pesquisar/ }).click();
  await expect(page).toHaveURL(/\/buscar$/);
});
