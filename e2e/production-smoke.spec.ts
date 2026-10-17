import { test, expect } from '@playwright/test';

const uiOrigins = [
  ['apex domain', 'https://cathedradigital.com.br'],
  ['www domain', 'https://www.cathedradigital.com.br'],
  ['Cloudflare Worker', 'https://cathedradigital.cathedradigital.workers.dev'],
] as const;

for (const [label, origin] of uiOrigins) {
  test('production browser smoke: ' + label + ' serves the real Cathedra UI', async ({ page }) => {
    test.setTimeout(20000);
    const response = await page.goto(origin, { waitUntil: 'domcontentloaded', timeout: 12000 });
    expect(response?.status(), label + ' document response').toBe(200);
    await expect(page.locator('main').first(), label + ' main landmark').toBeVisible({ timeout: 7000 });
    await expect(page.locator('body')).toContainText(/CATHEDRA|Cátedra/i, { timeout: 7000 });
    await expect(page.locator('body')).not.toContainText(/access denied|forbidden|just a moment|error 403/i);
  });
}

for (const domain of ['https://cathedradigital.com.br', 'https://www.cathedradigital.com.br']) {
  test('production SEO smoke: robots.txt and sitemap.xml on ' + domain, async ({ page }) => {
    test.setTimeout(20000);

    const robotsResponse = await page.goto(domain + '/robots.txt', { waitUntil: 'domcontentloaded', timeout: 10000 });
    expect(robotsResponse?.status(), domain + '/robots.txt').toBe(200);
    const robots = await robotsResponse!.text();
    expect(robots).toMatch(/User-agent:/i);
    expect(robots).toMatch(/Sitemap:\s*https:\/\/cathedradigital\.com\.br\/sitemap\.xml/i);

    const sitemapResponse = await page.goto(domain + '/sitemap.xml', { waitUntil: 'domcontentloaded', timeout: 10000 });
    expect(sitemapResponse?.status(), domain + '/sitemap.xml').toBe(200);
    const sitemap = await sitemapResponse!.text();
    expect(sitemap).toMatch(/<(urlset|sitemapindex)([\s>])/i);
    expect(sitemap).toContain('https://cathedradigital.com.br');
  });
}
