import { test, expect } from '@playwright/test';

import {
  findSensitiveData,
} from '../../utils/security.utils';

test.describe(
  'Security | Sensitive Data Exposure',
  () => {

    test(
      'SEC-003 | public homepage should not expose obvious private credentials',
      async ({ page }) => {

        await page.goto('/', {
          waitUntil:
            'domcontentloaded',
        });

        await expect(
          page.locator('body')
        ).toBeVisible();

        const html =
          await page.content();

        const findings =
          findSensitiveData(html);

        console.log(
          '\n===== SENSITIVE DATA CHECK ====='
        );

        if (
          findings.length === 0
        ) {

          console.log(
            'No obvious private credential patterns detected.'
          );

        } else {

          console.table(
            findings.map(
              (finding) => ({
                Finding: finding,
              })
            )
          );
        }

        expect(
          findings,
          `Potential sensitive information detected: ${findings.join(', ')}`
        ).toHaveLength(0);
      }
    );
  }
);