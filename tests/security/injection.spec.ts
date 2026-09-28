import { test, expect } from '@playwright/test';

test.describe('Security | Input Injection', () => {

  test(
    'SEC-002 | script-like newsletter input must not execute JavaScript',
    async ({ page }) => {

      let dialogTriggered = false;

      page.on('dialog', async (dialog) => {
        dialogTriggered = true;

        console.log(
          `Unexpected browser dialog: ${dialog.message()}`
        );

        await dialog.dismiss();
      });

      await page.goto('/newsletter', {
        waitUntil: 'domcontentloaded',
      });

      const emailInput = page
        .locator('input[type="email"]')
        .first();

      await expect(emailInput).toBeVisible();

      const payload = '<script>alert(1)</script>';

      await emailInput.fill(payload);

      /*
       * Verify that entering untrusted input does not
       * immediately execute script in the browser.
       */
      expect(
        dialogTriggered,
        'Script-like input triggered JavaScript execution'
      ).toBeFalsy();

      /*
       * The value should remain data, not become executable DOM.
       */
      await expect(emailInput).toHaveValue(payload);

      const injectedScripts = await page.locator(
        'script:not([src])'
      ).evaluateAll((scripts) =>
        scripts.some((script) =>
          script.textContent?.includes('alert(1)')
        )
      );

      expect(
        injectedScripts,
        'User-controlled payload was inserted as executable script'
      ).toBeFalsy();
    }
  );

});