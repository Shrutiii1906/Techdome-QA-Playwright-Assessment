import { test, expect } from '@playwright/test';

const pages = [
  '/',
  '/services',
  '/work',
  '/about',
  '/careers',
  '/contact',
  '/newsletter',
];

test.describe('US-002 | Primary navigation', () => {

  for (const path of pages) {

    test(`${path} should resolve successfully`, async ({
      page
    }) => {

      const response =
        await page.goto(path);

      expect(response)
        .not.toBeNull();

      expect(response!.status())
        .toBeLessThan(400);

      await expect(
        page.locator('body')
      ).toBeVisible();
    });
  }

});