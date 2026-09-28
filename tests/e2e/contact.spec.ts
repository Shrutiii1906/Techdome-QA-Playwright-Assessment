import { test, expect } from '@playwright/test';
import { ContactPage } from '../../pages/ContactPage';

test.describe('Contact scheduling', () => {

  test(
    'US-007 | BUG-003 | Calendly privacy notice remains until explicitly acknowledged',
    async ({ page, context }) => {

      /*
       * Use a fresh browser state because Calendly may remember
       * privacy acknowledgement in cookies/storage.
       */
      await context.clearCookies();

      const contact = new ContactPage(page);

      await contact.goto();

      /*
       * Confirm the Calendly iframe itself exists first.
       */
      const iframe = page.locator('iframe').first();

      await expect(
        iframe,
        'Calendly iframe should be present'
      ).toBeVisible({
        timeout: 15_000,
      });

      const calendly = iframe.contentFrame();

      /*
       * Use the user-visible control rather than assuming
       * Calendly implements the notice as role="dialog".
       */
      const understandButton = calendly.getByRole(
        'button',
        {
          name: /I understand/i,
        }
      );

      await expect(
        understandButton,
        'Calendly privacy acknowledgement should initially be visible'
      ).toBeVisible({
        timeout: 15_000,
      });

      /*
       * Locate calendar content.
       */
      const calendarContent = calendly.getByText(
        /Select a Day/i
      ).first();

      await expect(
        calendarContent
      ).toBeVisible({
        timeout: 15_000,
      });

      /*
       * Reproduce BUG-003:
       * Scroll Calendly without acknowledging the notice.
       */
      await calendarContent.scrollIntoViewIfNeeded();

      /*
       * The privacy acknowledgement should remain available
       * until the user explicitly acknowledges it.
       */
      await expect(
        understandButton,
        'Privacy acknowledgement disappeared without user consent'
      ).toBeVisible();
    }
  );

});