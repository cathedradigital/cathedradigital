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
