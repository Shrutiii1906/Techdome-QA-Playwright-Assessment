import { test, expect } from '@playwright/test';

import {
  checkSecurityHeaders,
  getMissingSecurityHeaders,
} from '../../utils/security.utils';

test.describe('Security | HTTP Headers', () => {

  test(
    'SEC-001 | homepage should expose recommended security headers',
    async ({ request }) => {

      const response =
        await request.get('/', {
          failOnStatusCode: false,
        });

      expect(
        response.status(),
        'Homepage should respond successfully'
      ).toBeLessThan(400);

      const headers =
        response.headers();

      const headerResults =
        checkSecurityHeaders(headers);

      console.log(
        '\n===== SECURITY HEADER CHECK ====='
      );

      console.table(
        headerResults.map(
          (header) => ({
            Header: header.name,
            Status:
              header.present
                ? 'PRESENT'
                : 'MISSING',
            Value:
              header.value ??
              'MISSING',
          })
        )
      );

      const missingHeaders =
        getMissingSecurityHeaders(headers);

      expect(
        missingHeaders,
        `Missing recommended security headers: ${missingHeaders.join(', ')}`
      ).toHaveLength(0);
    }
  );
});