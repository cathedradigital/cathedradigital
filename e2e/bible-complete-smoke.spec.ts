import { test, expect } from '@playwright/test';
import { BIBLE_DATA } from '../src/data/bible-books';

const books = Object.values(BIBLE_DATA).flatMap((categories) =>
  categories.flatMap((category) => category.books),
);

test.describe('Bíblia — catálogo completo', () => {
  test('backend retorna primeiro e último capítulo de todos os livros', async ({ request }) => {
    const baseUrl = process.env.VITE_SUPABASE_URL;
    const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    test.skip(!baseUrl || !publishableKey, 'NÃO VALIDADO — VITE_SUPABASE_URL/VITE_SUPABASE_PUBLISHABLE_KEY ausentes.');

    expect(books).toHaveLength(73);

    const checks = books.flatMap((book) =>
      [...new Set([1, book.chapters])].map((chapter) => ({ book, chapter })),
    );

    // Preserve full 73-book coverage while avoiding a serial 146-request E2E
    // that can make CI appear hung when the Edge Function is cold-starting.
    for (let i = 0; i < checks.length; i += 6) {
      const batch = checks.slice(i, i + 6);
      await Promise.all(batch.map(async ({ book, chapter }) => {
        const response = await request.post(
          `${baseUrl}/functions/v1/bible-text`,
          {
            headers: {
              apikey: publishableKey!,
              Authorization: `Bearer ${publishableKey!}`,
              'Content-Type': 'application/json',
            },
            data: { abbrev: book.abbr, chapter },
            timeout: 20_000,
          },
        );

        expect(response.ok(), `${book.name} ${chapter}: HTTP ${response.status()}`).toBeTruthy();
        const body = await response.json();
        expect(body.book, `${book.name} ${chapter}: livro`).toBe(book.name);
        expect(body.chapter, `${book.name} ${chapter}: capítulo`).toBe(chapter);
        expect(body.verses?.length, `${book.name} ${chapter}: versículos`).toBeGreaterThan(0);
        expect(body.verses?.every((verse: { number: number; text: string }) =>
          Number.isInteger(verse.number) && verse.number > 0 && typeof verse.text === 'string' && verse.text.trim().length > 0
        ), `${book.name} ${chapter}: texto`).toBeTruthy();
      }));
    }
  });

  test('as 73 abreviações do catálogo local equivalem ao cânon único', async () => {
    const { BIBLE_CANON, findBookByAbbr, normalizeAbbr } = await import('../src/lib/bibleCanon');

    expect(BIBLE_CANON).toHaveLength(73);
    expect(books).toHaveLength(73);

    for (const book of books) {
      const canonical = findBookByAbbr(book.abbr);
      expect(canonical, `Catálogo → cânon: ${book.name} [${book.abbr}]`).toBeDefined();
      expect(canonical?.name, `Nome divergente: ${book.name} [${book.abbr}]`).toBe(book.name);
      expect(normalizeAbbr(book.abbr), `Abreviação não normalizada: ${book.abbr}`).toBe(canonical?.abbr);
    }

    for (const canonical of BIBLE_CANON) {
      expect(findBookByAbbr(canonical.abbr)?.name).toBe(canonical.name);
      expect(normalizeAbbr(canonical.abbr)).toBe(canonical.abbr);
    }
  });

  test('parser resolve abreviações católicas e intervalos de versículos', async () => {
    const { parseBibleReferences } = await import('../src/lib/bibleRefParser');

    const cases = [
      ['1 Cor 13,4-7', '1Co', 13, 4, 7],
      ['1 Pe 3:15-16', '1Pe', 3, 15, 16],
      ['Esd 1,1-3', 'Ed', 1, 1, 3],
      ['Hab 2,4', 'Hc', 2, 4, undefined],
      ['2 Mac 7,13-14', '2Mc', 7, 13, 14],
    ] as const;

    for (const [input, abbr, chapter, verse, endVerse] of cases) {
      const ref = parseBibleReferences(input).find((segment) => segment.type === 'bibleRef');
      expect(ref, input).toBeDefined();
      expect(ref?.abbr, input).toBe(abbr);
      expect(ref?.chapter, input).toBe(chapter);
      expect(ref?.verse, input).toBe(verse);
      expect(ref?.endVerse, input).toBe(endVerse);
    }
  });

  test('deep-link destaca o versículo solicitado', async ({ page }) => {
    await page.goto('/bible?book=Jo&ch=3&v=16');
    const verse = page.locator('#verse-16');
    await expect(verse).toBeVisible({ timeout: 30_000 });
    await expect(verse).toHaveClass(/bg-secondary\/20/);
  });

  test('ref de intervalo navega para o início e destaca todo o intervalo', async ({ page }) => {
    await page.goto('/bible?ref=' + encodeURIComponent('1 Cor 13,4-7'));
    await expect(page.locator('[data-testid="verse-text-4"]')).toBeVisible({ timeout: 30_000 });
    for (const verse of [4, 5, 6, 7]) {
      await expect(page.locator(`#verse-${verse}`)).toHaveClass(/bg-secondary\/20/);
    }
  });

  test('deep-link com capítulo fora do limite é normalizado para o último capítulo', async ({ page }) => {
    await page.goto('/bible?book=Ap&ch=999');
    await expect(page.locator('[data-testid="verse-text-1"]')).toBeVisible({ timeout: 30_000 });
    await expect(page).toHaveURL(/book=Ap.*ch=22/);
  });

  test('Gênesis 1 e Apocalipse 22 aparecem no navegador', async ({ page }) => {
    for (const target of [
      { book: 'Gn', chapter: 1, marker: /No princípio|No principio/i },
      { book: 'Ap', chapter: 22, marker: /vida|Deus|Apocalipse/i },
    ]) {
      await page.goto(`/bible?book=${encodeURIComponent(target.book)}&ch=${target.chapter}`);
      await expect(page.locator('[data-testid="verse-text-1"]')).toBeVisible({ timeout: 30_000 });
      await expect(page.locator('[data-testid="verse-text-1"]')).not.toHaveText(/^\s*$/);
      await expect(page.locator('body')).toContainText(target.marker);
    }
  });
  test('aceita as abreviações canônicas dos livros católicos no leitor', async ({ page }) => {
    for (const target of [
      { book: 'Tb', chapter: 1 },
      { book: 'Ab', chapter: 1 },
      { book: 'Hc', chapter: 1 },
      { book: '1Mc', chapter: 1 },
      { book: '1Co', chapter: 1 },
      { book: '1Pe', chapter: 1 },
      { book: 'Ap', chapter: 22 },
    ]) {
      await page.goto(`/bible?book=${encodeURIComponent(target.book)}&ch=${target.chapter}`);
      await expect(page.locator('[data-testid="verse-text-1"]')).toBeVisible({ timeout: 30_000 });
      await expect(page.locator('[data-testid="verse-text-1"]')).not.toHaveText(/^\s*$/);
    }
  });

});
