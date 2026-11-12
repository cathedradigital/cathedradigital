import { expect, test } from "@playwright/test";

const rows = [
  {
    id: "test-term",
    slug: "termo-de-teste",
    term: "Termo de teste",
    definition: "Registro de teste",
    short_definition: null,
    category: "Conceitos",
    editorial_completeness: "complete",
  },
  {
    id: "expanding-term",
    slug: "conceito-em-expansao",
    term: "Conceito em expansão",
    definition: "Registro em expansão",
    short_definition: null,
    category: "Conceitos",
    editorial_completeness: "expanding",
  },
];

test("Glossário: usa fallback local, oculta resultados antigos e preserva filtros na URL", async ({
  page,
}) => {
  const projections: string[] = [];
  await page.route("**/rest/v1/glossary?*", async (route) => {
    const projection = new URL(route.request().url()).searchParams.get("select") ?? "";
    projections.push(projection);
    const missingStatus = projection.split(",").includes("status");
    await route.fulfill({
      status: missingStatus ? 400 : 200,
      contentType: "application/json",
      body: JSON.stringify(
        missingStatus ? { code: "42703", message: "column glossary.status does not exist" } : rows,
      ),
    });
  });
  await page.route("**/rest/v1/rpc/search_glossary_fuzzy", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 350));
    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({ code: "PGRST202", message: "Function unavailable" }),
    });
  });

  await page.goto("/glossario");
  const completeTerm = page.getByRole("link").filter({
    has: page.getByRole("heading", { name: "Termo de teste" }),
  });
  const expandingTerm = page.getByRole("link").filter({
    has: page.getByRole("heading", { name: "Conceito em expansão" }),
  });
  await expect(completeTerm).toBeVisible();
  await expect(expandingTerm).toBeVisible();
  expect(projections.some((projection) => !projection.split(",").includes("status"))).toBe(true);

  const search = page.getByRole("searchbox", { name: "Buscar verbete", exact: true });
  await search.fill("teste");
  await expect(page.getByTestId("glossary-search-fallback")).toBeVisible();
  await expect(completeTerm).toBeVisible();

  await search.fill("inexistente");
  await expect(completeTerm).toHaveCount(0);
  await expect(
    page.getByRole("status").filter({ hasText: "Buscando verbetes para “inexistente”…" }),
  ).toBeVisible();
  await expect(page.getByTestId("glossary-search-fallback")).toHaveCount(0);
  await expect(page.getByTestId("glossary-search-fallback")).toBeVisible();
  await expect(completeTerm).toHaveCount(0);

  await search.fill("teste");
  await expect(page.getByTestId("glossary-search-fallback")).toBeVisible();
  await expect(completeTerm).toBeVisible();
  await expect(expandingTerm).toHaveCount(0);

  await search.fill("");
  const editorialFilters = page.getByRole("group", { name: "Filtrar por grau editorial" });
  await editorialFilters.getByRole("button", { name: "Em expansão", exact: true }).click();
  await expect(expandingTerm).toBeVisible();
  await expect(completeTerm).toHaveCount(0);
  await expect(page).toHaveURL(/completeness=expanding/);
  await page.reload();
  await expect(
    editorialFilters.getByRole("button", { name: "Em expansão", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(expandingTerm).toBeVisible();
  await expect(completeTerm).toHaveCount(0);

  await page.goto("/glossario?completeness=complete");
  await expect(completeTerm).toBeVisible();
  await expect(expandingTerm).toHaveCount(0);
  await page.goto("/glossario?completeness=expanding");
  await expect(expandingTerm).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/completeness=complete/);
  await expect(completeTerm).toBeVisible();
  await expect(expandingTerm).toHaveCount(0);
  await page.goForward();
  await expect(page).toHaveURL(/completeness=expanding/);
  await expect(expandingTerm).toBeVisible();
  await expect(completeTerm).toHaveCount(0);
});

test("Glossário: erro de permissão não dispara fallback e permite tentar novamente", async ({
  page,
}) => {
  let requests = 0;
  await page.route("**/rest/v1/glossary?*", async (route) => {
    requests++;
    await route.fulfill({
      status: requests === 1 ? 403 : 200,
      contentType: "application/json",
      body: JSON.stringify(requests === 1 ? { code: "42501", message: "Permission denied" } : rows),
    });
  });

  await page.goto("/glossario");
  await expect(
    page.getByRole("alert").filter({ hasText: "Não foi possível carregar o glossário." }),
  ).toBeVisible();
  expect(requests).toBe(1);
  await page.getByRole("button", { name: "Tentar novamente", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Termo de teste" })).toBeVisible();
  expect(requests).toBe(2);
});
