      { book: 'Gn', chapter: 1, marker: /No princípio|No principio/i },
      { book: 'Ap', chapter: 22, marker: /vida|Deus|Apocalipse/i },
    ]) {
      await page.goto(`/bible?book=${encodeURIComponent(target.book)}&ch=${target.chapter}`);
      await expect(page.locator('[data-testid="verse-text-1"]')).toBeVisible({ timeout: 30_000 });
      await expect(page.locator('[data-testid="verse-text-1"]')).not.toHaveText(/^\s*$/);
      await expect(page.locator('body')).toContainText(target.marker);
    }
  });
});

  test('Escolher livro: painel é opaco e legível', async ({ page }) => {
    await page.goto('/bible?book=Gn&ch=1');
    if ((page.viewportSize()?.width ?? 1280) < 768) {
      await page.getByRole('button', { name: 'Escolher livro e capítulo' }).click();
    } else {
      await page.getByRole('button', { name: 'Mais opções da Bíblia' }).click();
      await page.getByRole('menuitem', { name: 'Escolher livro e capítulo' }).click();
    }

    const sheet = page.locator('[data-radix-dialog-content]').last();
    await expect(sheet).toBeVisible();

    const genesis = sheet.getByRole('button', { name: /Gênesis/i }).first();
    await expect(genesis).toBeVisible();
    await genesis.click();
    await expect(sheet.getByRole('heading', { name: 'Gênesis' })).toBeVisible();
    await expect(sheet.getByRole('button', { name: '1', exact: true }).first()).toBeVisible();

    const bg = await sheet.evaluate((el) => {
      const style = getComputedStyle(el);
      return { backgroundColor: style.backgroundColor, opacity: style.opacity };
    });

    expect(bg.opacity).toBe('1');
    expect(bg.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('leitor mobile não duplica a barra de ícones e não mostra aviso de sincronização', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/bible?book=Gn&ch=1');

    await expect(page.locator('[data-reader-toolbar]')).not.toBeVisible();
    await expect(page.getByText('Índice bíblico em sincronização')).toHaveCount(0);
    await expect(page.locator('[data-testid="verse-text-1"]')).toBeVisible();
  });

  test('Nexus vazio é apresentado como estado do capítulo, não como erro', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/bible?book=Gn&ch=2');

    const nexus = page.getByTestId('nexus-empty-state');
    await expect(nexus).toBeVisible();
    await expect(nexus.getByRole('heading', { name: 'Nexus do capítulo' })).toBeVisible();
    await expect(nexus).toContainText('Ainda não catalogado');
    await expect(nexus).toContainText('Gênesis 2');
  });
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
      await page.goto(`/bible?book=${encodeURIComponent(target.book)}&chapter=${target.chapter}`);
      await expect(page.locator('[data-testid="verse-text-1"]')).toBeVisible({ timeout: 30_000 });
      await expect(page.locator('[data-testid="verse-text-1"]')).not.toHaveText(/^\s*$/);
      await expect(page.locator('body')).toContainText(target.marker);
    }
  });
});
