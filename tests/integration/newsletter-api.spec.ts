import { test } from '@playwright/test';

test(
  'US-019 | inspect newsletter subscription request',
  async ({ page }) => {

    page.on('request', request => {

      if (
        request.method() === 'POST'
      ) {

        console.log(
          'POST:',
          request.url()
        );

        console.log(
          'Payload:',
          request.postData()
        );
      }
    });

    await page.goto('/newsletter');

    // Replace selector after DOM inspection.
    const email =
      page.locator(
        'input[type="email"]'
      ).first();

    await email.fill(
      'invalid-email'
    );

    await page.getByRole(
      'button',
      { name: /subscribe/i }
    ).first().click();
  }
);