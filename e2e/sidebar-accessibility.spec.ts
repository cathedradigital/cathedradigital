import { expect, test } from '@playwright/test';

test('Sidebar: contém foco, fecha com Escape e restaura foco e scroll', async ({ page }) => {
  await page.goto('/');

  // Preserva um estado pré-existente de overflow em vez de assumir o valor vazio.
  await page.evaluate(() => {
    document.body.style.overflow = 'clip';
  });

  const trigger = page.getByRole('button', { name: /Abrir menu lateral/i });
  await expect(trigger).toBeVisible();
  await trigger.click();

  const sidebar = page.locator('#cathedra-global-sidebar');
  await expect(sidebar).toBeVisible();
  await expect(sidebar).toHaveAttribute('aria-modal', 'true');
  await expect.poll(() => page.locator('body').evaluate((body) => getComputedStyle(body).overflow)).toBe('hidden');

  // Se o foco escapar do diálogo, Tab deve trazê-lo de volta para o primeiro controle visível.
  await page.evaluate(() => {
    (document.activeElement as HTMLElement | null)?.blur();
  });
  await page.keyboard.press('Tab');

  const firstFocusable = sidebar.locator(
    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  ).filter({ visible: true }).first();
  await expect(firstFocusable).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(sidebar).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.locator('body')).toHaveCSS('overflow', 'clip');
});
