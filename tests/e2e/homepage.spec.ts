import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';

test.describe('US-001 | Homepage', () => {

  test('homepage loads successfully with metadata', async ({ page }) => {

    const home = new HomePage(page);

    const response = await page.goto('/');

    expect(response).not.toBeNull();

    expect(response!.status())
      .toBeLessThan(400);

    await home.verifyLoaded();

    const title = await home.getTitle();

    expect(title.length)
      .toBeGreaterThan(0);

    const description =
      await home.getMetaDescription();

    expect(description)
      .toBeTruthy();
  });

});