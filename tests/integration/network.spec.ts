import { test, expect } from '@playwright/test';

import {
  monitorNetwork,
} from '../../utils/network.utils';

test.describe('Network Integration', () => {

  test(
    'US-021 | homepage should load without first-party HTTP 5xx responses',
    async ({ page }) => {

      /*
       * Register listeners BEFORE navigation.
       */
      const network =
        monitorNetwork(page);

      const response = await page.goto('/', {
        waitUntil: 'domcontentloaded',
      });

      expect(
        response,
        'Homepage should return an HTTP response'
      ).not.toBeNull();

      expect(
        response!.status(),
        `Homepage returned HTTP ${response?.status()}`
      ).toBeLessThan(400);

      await expect(
        page.locator('body')
      ).toBeVisible();

      await page.waitForLoadState('load');

      console.log(
        '\n===== FIRST-PARTY NETWORK CHECK ====='
      );

      console.log(
        `HTTP 5xx responses: ${network.serverErrors.length}`
      );

      console.log(
        `Failed first-party requests: ${network.failedRequests.length}`
      );

      if (
        network.serverErrors.length > 0
      ) {
        console.table(
          network.serverErrors
        );
      }

      if (
        network.failedRequests.length > 0
      ) {
        console.table(
          network.failedRequests
        );
      }

      expect(
        network.serverErrors,
        'Homepage should not generate first-party HTTP 5xx responses'
      ).toHaveLength(0);

      expect(
        network.failedRequests,
        'Homepage should not have failed first-party requests'
      ).toHaveLength(0);
    }
  );


  test(
    'US-022 | core Techdome routes should return successful HTTP responses',
    async ({ request }) => {

      const routes = [
        '/',
        '/careers',
        '/contact',
        '/newsletter',
      ];

      const results: {
        route: string;
        status: number;
      }[] = [];

      for (const route of routes) {

        const response =
          await request.get(route, {
            failOnStatusCode: false,
          });

        results.push({
          route,
          status: response.status(),
        });
      }

      console.log(
        '\n===== CORE ROUTE CHECK ====='
      );

      console.table(results);

      for (const result of results) {

        expect(
          result.status,
          `${result.route} returned HTTP ${result.status}`
        ).toBeLessThan(400);
      }
    }
  );
});