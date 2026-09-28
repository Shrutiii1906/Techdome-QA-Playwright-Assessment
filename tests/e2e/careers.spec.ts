import { test, expect } from '@playwright/test';
import { CareersPage } from '../../pages/CareersPage';

test.describe('Careers', () => {

  test(
    'US-013 | BUG-006 | Shopify Developer should have appropriate category',
    async ({ page }) => {

      const careers = new CareersPage(page);

      await careers.goto();
      await careers.verifyLoaded();

      const shopifyHeading = page.getByRole('heading', {
        name: 'Shopify Developer',
        exact: true,
      });

      await expect(shopifyHeading).toBeVisible();

      /*
       * Find the job container that contains both the
       * Shopify Developer heading and its job metadata.
       */
      const jobCard = shopifyHeading.locator(
        'xpath=ancestor::*[.//a[contains(normalize-space(.), "Apply for role")]][1]'
      );

      await expect(jobCard).toBeVisible();

      /*
       * BUG-006 regression assertion:
       * Shopify Developer should not be categorized
       * under Business Development.
       *
       * Expected to fail while BUG-006 exists.
       */
      await expect(jobCard).not.toContainText(
        /Business Development/i
      );
    }
  );


  test(
    'US-014 | BUG-007 | advertised Shopify Developer role should have active destination',
    async ({ page, context }) => {

      const careers = new CareersPage(page);

      await careers.goto();
      await careers.verifyLoaded();

      // Step 1: Locate Shopify Developer
      const shopifyHeading = page.getByRole('heading', {
        name: 'Shopify Developer',
        exact: true,
      });

      await expect(shopifyHeading).toBeVisible();

      /*
       * Step 2:
       * Find the container belonging to Shopify Developer.
       *
       * The Playwright snapshot shows that the heading
       * itself is NOT wrapped in an anchor.
       */
      const jobCard = shopifyHeading.locator(
        'xpath=ancestor::*[.//a[contains(normalize-space(.), "Apply for role")]][1]'
      );

      await expect(jobCard).toBeVisible();

      /*
       * Step 3:
       * Locate the actual Apply for role link inside
       * this specific job card.
       */
      const applyLink = jobCard.getByRole('link', {
        name: 'Apply for role',
        exact: true,
      });

      await expect(applyLink).toBeVisible();

      // Step 4: Capture the destination
      const href = await applyLink.getAttribute('href');

      expect(
        href,
        'Shopify Developer should have an application URL'
      ).toBeTruthy();

      console.log(`Shopify Developer application URL: ${href}`);

      /*
       * The current snapshot shows:
       * https://techdome.keka.com/careers/jobdetails/160178
       */
      expect(href).toMatch(
        /^https:\/\/techdome\.keka\.com\/careers\/jobdetails\//
      );

      // Step 5: Open the external Keka job page
      const jobPage = await context.newPage();

      try {

        const response = await jobPage.goto(href!, {
          waitUntil: 'domcontentloaded',
          timeout: 30_000,
        });

        expect(
          response,
          'Keka job destination should return an HTTP response'
        ).not.toBeNull();

        /*
         * Do not rely on HTTP status alone.
         *
         * Some external job systems can return HTTP 200
         * while displaying a "job does not exist" page.
         */
        if (response) {
          expect(
            response.status(),
            `Unexpected HTTP status: ${response.status()}`
          ).toBeLessThan(500);
        }

        await expect(jobPage.locator('body')).toBeVisible();

        /*
         * Step 6:
         * BUG-007 regression assertion.
         *
         * An active job advertised by Techdome should
         * not lead to a missing-job page.
         */
        const missingJobMessage = jobPage.getByText(
          /job.*(does not exist|not found)|no such job/i
        );

        await expect(
          missingJobMessage,
          'BUG-007: Advertised Shopify Developer role leads to a missing-job page'
        ).toHaveCount(0);

      } finally {

        await jobPage.close();

      }
    }
  );

});