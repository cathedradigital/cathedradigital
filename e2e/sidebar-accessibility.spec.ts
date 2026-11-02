import { expect, test } from '@playwright/test';

test('Sidebar: mantém foco no diálogo e devolve foco ao acionador ao fechar', async ({ page }) => {
  await page.goto('/');

  const trigger = page.getByRole('button', { name: /Abrir menu lateral/i });
  await expect(trigger).toBeVisible();
  await trigger.click();

  const sidebar = page.locator('#cathedra-global-sidebar');
  await expect(sidebar).toBeVisible();
  await expect(sidebar).toHaveAttribute('aria-modal', 'true');

  // Se o foco escapar do diálogo, Tab deve trazê-lo de volta para o primeiro controle.
  await page.evaluate(() => {
    (document.activeElement as HTMLElement | null)?.blur();
  });
  await page.keyboard.press('Tab');
  const firstFocusable = sidebar.locator(
    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  ).first();
  await expect(firstFocusable).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(sidebar).toBeHidden();
  await expect(trigger).toBeFocused();
});
