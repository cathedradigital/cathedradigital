import { expect, test } from "@playwright/test";

test("Seletor de idioma do cabeçalho: disponível em mobile, acessível e preserva a rota", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/biblioteca?ref=cabecalho#preservar");

  const trigger = page.locator('div[data-mobile-topbar="true"] button[aria-label^="Idioma:"]');
  await expect(trigger).toBeVisible();
  await expect(trigger).toHaveAttribute("aria-label", /Português/);
  const box = await trigger.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);

  await trigger.click();
  const menu = page.getByRole("menu");
  for (const nativeName of [
    "Português",
    "English",
    "Español",
    "Italiano",
    "Latina",
    "Français",
    "Deutsch",
  ]) {
    await expect(menu.getByRole("menuitem", { name: new RegExp(nativeName) })).toBeVisible();
  }

  await menu.getByRole("menuitem", { name: /English/ }).click();
  await expect(page).toHaveURL(/\/en\/biblioteca\?ref=cabecalho#preservar$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
