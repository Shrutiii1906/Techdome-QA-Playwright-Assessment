import {
  test,
  expect,
  request as playwrightRequest,
} from '@playwright/test';

import {
  LoadResult,
  calculatePerformanceSummary,
  logPerformanceSummary,
} from '../../utils/performance.utils';

test.describe('Load Test', () => {

  test(
    'LOAD-001 | exactly 5 concurrent users should access homepage and contact page',
    async () => {

      /*
       * Assessment safety limit.
       * DO NOT increase beyond 5.
       */
      const CONCURRENT_USERS = 5;

      const BASE_URL =
        'https://techdome.io';

      expect(
        CONCURRENT_USERS,
        'Load test must use exactly 5 concurrent users'
      ).toBe(5);


      async function runVirtualUser(
        userNumber: number
      ): Promise<LoadResult[]> {

        const context =
          await playwrightRequest.newContext({
            baseURL: BASE_URL,
          });

        const results:
          LoadResult[] = [];

        try {

          /*
           * Requests within a virtual user are sequential.
           */
          for (
            const route of [
              '/',
              '/contact',
            ]
          ) {

            const start =
              performance.now();

            const response =
              await context.get(
                route,
                {
                  failOnStatusCode:
                    false,
                }
              );

            const duration =
              Math.round(
                performance.now() -
                  start
              );

            results.push({
              user:
                userNumber,

              route,

              status:
                response.status(),

              duration,
            });
          }

          return results;

        } finally {

          await context.dispose();
        }
      }


      /*
       * EXACTLY five concurrent virtual-user flows.
       */
      const virtualUsers =
        Array.from(
          {
            length:
              CONCURRENT_USERS,
          },

          (_, index) =>
            runVirtualUser(
              index + 1
            )
        );


      const userResults =
        await Promise.all(
          virtualUsers
        );


      const results =
        userResults.flat();


      console.log(
        '\n===== LOAD TEST REQUEST RESULTS ====='
      );

      console.table(results);


      /*
       * Performance calculations now live
       * inside performance.utils.ts.
       */
      const summary =
        calculatePerformanceSummary(
          results
        );


      logPerformanceSummary(
        CONCURRENT_USERS,
        summary
      );


      /*
       * No server errors allowed.
       */
      expect(
        summary.http5xx,
        `Expected zero HTTP 5xx responses but found ${summary.http5xx}`
      ).toBe(0);


      /*
       * Assessment threshold.
       */
      expect(
        summary.p95ResponseTime,
        `p95 response time was ${summary.p95ResponseTime} ms; requirement is < 3000 ms`
      ).toBeLessThan(3000);
    }
  );
});