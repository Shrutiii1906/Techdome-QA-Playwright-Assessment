import { test, expect } from '@playwright/test';

test.describe('Careers Integration | External Job Links', () => {

  test(
    'US-020 | advertised career roles should have valid application links',
    async ({ page, request }) => {

      await page.goto('/careers', {
        waitUntil: 'domcontentloaded',
      });

      await expect(page.locator('body')).toBeVisible();

      /*
       * Find all application links exposed by the Careers page.
       */
      const applyLinks = page.getByRole('link', {
        name: 'Apply for role',
        exact: true,
      });

      const count = await applyLinks.count();

      console.log(
        `\nFound ${count} advertised job application link(s).`
      );

      expect(
        count,
        'Careers page should contain at least one application link'
      ).toBeGreaterThan(0);

      /*
       * Capture the links first.
       *
       * This is better than navigating while iterating over live
       * DOM elements because navigation could invalidate locators.
       */
      const jobs: {
        index: number;
        href: string;
      }[] = [];

      for (let i = 0; i < count; i++) {

        const link = applyLinks.nth(i);

        const href = await link.getAttribute('href');

        expect(
          href,
          `Career application link ${i + 1} should have an href`
        ).toBeTruthy();

        if (href) {
          jobs.push({
            index: i + 1,
            href,
          });
        }
      }

      console.log('\nCareer destinations:');
      console.table(jobs);

      /*
       * Validate each advertised destination at HTTP level.
       */
      for (const job of jobs) {

        const response = await request.get(job.href, {
          failOnStatusCode: false,
        });

        console.log(
          `Job ${job.index}: ${response.status()} -> ${job.href}`
        );

        /*
         * External ATS systems may use redirects,
         * so the main requirement here is that the
         * advertised destination is not a server error.
         */
        expect(
          response.status(),
          `Career destination returned server error: ${job.href}`
        ).toBeLessThan(500);
      }
    }
  );


  test(
    'US-014 | BUG-007 | Shopify Developer should point to an active job',
    async ({ page, context }) => {

      await page.goto('/careers', {
        waitUntil: 'domcontentloaded',
      });

      /*
       * Locate Shopify Developer using its semantic heading.
       */
      const shopifyHeading = page.getByRole('heading', {
        name: 'Shopify Developer',
        exact: true,
      });

      await expect(shopifyHeading).toBeVisible();

      /*
       * Find the job container associated specifically
       * with Shopify Developer.
       */
      const shopifyCard = shopifyHeading.locator(
        'xpath=ancestor::*[.//a[normalize-space()="Apply for role"]][1]'
      );

      await expect(shopifyCard).toBeVisible();

      const applyLink = shopifyCard.getByRole('link', {
        name: 'Apply for role',
        exact: true,
      });

      await expect(applyLink).toBeVisible();

      const href = await applyLink.getAttribute('href');

      expect(
        href,
        'Shopify Developer should expose an application URL'
      ).toBeTruthy();

      console.log(
        `\nShopify Developer destination: ${href}`
      );

      /*
       * Techdome currently uses Keka as the external
       * recruitment system.
       */
      expect(href).toMatch(
        /^https:\/\/techdome\.keka\.com\/careers\/jobdetails\//
      );

      /*
       * Open the external destination.
       *
       * We check visible content in addition to HTTP status
       * because an ATS can return HTTP 200 while rendering a
       * "job does not exist" page.
       */
      const jobPage = await context.newPage();

      try {

        const response = await jobPage.goto(href!, {
          waitUntil: 'domcontentloaded',
          timeout: 30_000,
        });

        expect(
          response,
          'Shopify job destination should return an HTTP response'
        ).not.toBeNull();

        if (response) {

          console.log(
            `Shopify destination HTTP status: ${response.status()}`
          );

          expect(
            response.status(),
            'Shopify job destination should not return a server error'
          ).toBeLessThan(500);
        }

        await expect(
          jobPage.locator('body')
        ).toBeVisible();

        /*
         * Detect common missing-job states.
         */
        const missingJob = jobPage.getByText(
          /job.*(does not exist|not found)|no such job/i
        );

        await expect(
          missingJob,
          'BUG-007: Shopify Developer is advertised but its job destination is unavailable'
        ).toHaveCount(0);

      } finally {

        await jobPage.close();
      }
    }
  );

});