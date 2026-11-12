import { expect, test } from "@playwright/test";

test("Biblioteca: recentes são identificados como locais e não simulam progresso de leitura", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "cathedra:biblioteca:recents:v1",
      JSON.stringify([
        {
          id: "recent-test-item",
          title: "Teste de retomada",
          subtitle: "Registro local de teste",
          path: "/biblioteca/acervo/biblia",
          visitedAt: "2026-11-11T21:00:00.000Z",
        },
      ]),
    );
  });

  await page.goto("/biblioteca");

  await expect(page.getByRole("heading", { name: "Acessados recentemente" })).toBeVisible();
  await expect(
    page.getByText("Histórico local deste navegador; não indica posição de leitura."),
  ).toBeVisible();

  const recentCard = page.getByRole("link").filter({
    has: page.getByRole("heading", { name: "Teste de retomada" }),
  });
  await expect(recentCard).toBeVisible();
  await expect(recentCard).toHaveAttribute("href", "/biblioteca/acervo/biblia");
  await expect(recentCard.getByText("Abrir novamente")).toBeVisible();
  await expect(recentCard.getByText(/%/)).toHaveCount(0);

  await expect(page.getByRole("link", { name: "Minha leitura", exact: true })).toHaveAttribute(
    "href",
    "/acervo",
  );
  await expect(page.getByRole("link", { name: /Catálogo de obras/ })).toHaveAttribute(
    "href",
    "/acervo/lista",
  );
});
