import { test, expect } from '@playwright/test';

test('public browser smoke: landing and login render', async ({ page }) => {
  const bad: string[] = [];
  page.on('console', message => { if (message.type() === 'error') bad.push('console: ' + message.text()); });
  page.on('response', response => { if ([404, 500, 502, 503, 504].includes(response.status())) bad.push('http ' + response.status() + ': ' + response.url()); });
  await page.goto('/');
  await expect(page).toHaveTitle(/Cathedra/i);
  await page.goto('/login');
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('Senha')).toBeVisible();
  expect(bad).toEqual([]);
  test('Documentos e Catecismo abrem sem erro de navegação', async ({ page }) => {
    for (const route of ['/magisterium', '/catechism']) {
      const errors: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') errors.push(message.text());
      });
      const response = await page.goto(route);
      expect(response?.ok(), `${route}: HTTP ${response?.status()}`).toBeTruthy();
      await expect(page.locator('body')).not.toContainText(/Application error|Something went wrong/i);
      expect(errors, `${route}: console errors`).toEqual([]);
    }
  });

});