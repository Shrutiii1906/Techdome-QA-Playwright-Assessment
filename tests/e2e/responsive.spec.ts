import { test, expect } from '@playwright/test';

import {
  getOverflowDiagnostics,
  logOverflowDiagnostics,
} from '../../utils/responsive.utils';

const viewports = [
  {
    story: 'US-017',
    name: 'mobile',
    width: 375,
    height: 812,
  },
  {
    story: 'US-018',
    name: 'tablet',
    width: 768,
    height: 1024,
  },
];

test.describe('Responsive layout', () => {

  for (const viewport of viewports) {

    test(
      `${viewport.story} | ${viewport.name} ${viewport.width}px should not have unexpected horizontal overflow`,
      async ({ page }) => {

        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });

        await page.goto('/', {
          waitUntil: 'domcontentloaded',
        });

        await expect(
          page.locator('body')
        ).toBeVisible();

        /*
         * Confirm responsive navigation is active
         * at the tested breakpoint.
         */
        const navigationButton =
          page.getByRole('button', {
            name: 'Open navigation',
          });

        await expect(
          navigationButton
        ).toBeVisible();

        /*
         * Reusable responsive diagnostics.
         */
        const diagnostics =
          await getOverflowDiagnostics(page);

        logOverflowDiagnostics(
          viewport.story,
          viewport.name,
          diagnostics
        );

        /*
         * Expected:
         * document width must not exceed viewport width.
         *
         * Known current results:
         * 375px -> 400px document width
         * 768px -> 774px document width
         */
        expect(
          diagnostics.documentWidth,
          [
            `${viewport.story}: Unexpected horizontal overflow detected.`,
            `Viewport=${diagnostics.viewportWidth}px`,
            `Document=${diagnostics.documentWidth}px`,
            `Overflow=${diagnostics.overflowAmount}px`,
          ].join(' ')
        ).toBeLessThanOrEqual(
          diagnostics.viewportWidth
        );
      }
    );
  }
});