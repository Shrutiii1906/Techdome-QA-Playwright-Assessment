import { test, expect } from '@playwright/test';

test.describe('Proof of Execution | Case Studies', () => {

  test(
    'US-005 | BUG-002 | content should not change unexpectedly during normal scroll',
    async ({ page }) => {

      await page.goto('/');

      const sectionHeading = page.getByRole('heading', {
        name: /Real engineers off our own bench/i,
      });

      await sectionHeading.scrollIntoViewIfNeeded();
      await expect(sectionHeading).toBeVisible();

      // Current UI exposes a slide/state indicator such as 01 / 03, 02 / 03, 03 / 03.
      const stateIndicator = page.getByText(
        /^\d{2}\s*\/\s*\d{2}$/
      );

      await expect(stateIndicator).toBeVisible();

      const before = await stateIndicator.textContent();

      console.log(`State before scroll: ${before}`);

      // Small normal vertical scroll.
      await page.mouse.wheel(0, 150);

      const after = await stateIndicator.textContent();

      console.log(`State after scroll: ${after}`);

      expect(
        after,
        'Normal page scrolling should not unexpectedly change the displayed state'
      ).toBe(before);
    }
  );

});