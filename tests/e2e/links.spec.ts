import { test, expect } from '@playwright/test';

test(
  'US-016 | footer contains functional links',
  async ({ page }) => {

    await page.goto('/');

    const footer =
      page.locator('footer');

    await footer
      .scrollIntoViewIfNeeded();

    await expect(footer)
      .toBeVisible();

    const links =
      footer.locator('a[href]');

    const count =
      await links.count();

    expect(count)
      .toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {

      const href =
        await links.nth(i)
          .getAttribute('href');

      expect(href)
        .toBeTruthy();
    }
  }
);