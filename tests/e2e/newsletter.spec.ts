import { test, expect } from '@playwright/test';
import { NewsletterPage } from '../../pages/NewsletterPage';

test.describe('Newsletter', () => {

  test(
    'US-009 | BUG-001 | invalid email should not be subscribed',
    async ({ page }) => {

      const newsletter =
        new NewsletterPage(page);

      await newsletter.goto();

      await newsletter.subscribe(
        'invalid-email'
      );

      await expect(
        page.getByText(
          /thank you for subscribing/i
        )
      ).not.toBeVisible();
    }
  );


  test(
    'US-009 | empty email should not subscribe',
    async ({ page }) => {

      const newsletter =
        new NewsletterPage(page);

      await newsletter.goto();

      await newsletter.emailInput.fill('');

      await newsletter.subscribeButton.click();

      await expect(
        page.getByText(
          /thank you for subscribing/i
        )
      ).not.toBeVisible();
    }
  );

});