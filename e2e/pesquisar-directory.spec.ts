import { test, expect } from "@playwright/test";

const expectedRoutes = [
  "/bible",
  "/catechism",
  "/magisterium",
  "/santos",
  "/glossario",
  "/nexus",
  "/biblioteca",
  "/atlas",
  "/aquinas",
  "/dogmas",
  "/papas",
  "/aparicoes",
  "/temas",
  "/community",
];

test("Pesquisar apresenta os módulos e acervos com rotas canônicas", async ({ page }) => {
  const response = await page.goto("/buscar");
  expect(response?.ok(), `/buscar: HTTP ${response?.status()}`).toBeTruthy();

  await expect(page.getByRole("heading", { name: "Territórios da Pesquisa" })).toBeVisible();
  await expect(page.getByText("14 caminhos", { exact: true })).toBeVisible();
  await expect(
    page.getByText(/A busca transversal reúne santos, verbetes do Glossário/),
  ).toBeVisible();

  const routes = await page
    .locator("a.group[href]")
    .evaluateAll((links) =>
      links.map((link) => new URL((link as HTMLAnchorElement).href).pathname),
    );
  expect(routes).toEqual(expectedRoutes);
});
