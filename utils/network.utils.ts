import { Page } from '@playwright/test';

export type NetworkError = {
  url: string;
  status?: number;
  error?: string;
};

/**
 * Returns true when the URL belongs to Techdome.
 */
export function isFirstPartyUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;

    return (
      hostname === 'techdome.io' ||
      hostname === 'www.techdome.io'
    );
  } catch {
    return false;
  }
}

/**
 * Captures first-party HTTP 5xx responses and failed requests.
 *
 * Call this BEFORE page.goto().
 */
export function monitorNetwork(page: Page) {
  const serverErrors: NetworkError[] = [];
  const failedRequests: NetworkError[] = [];

  page.on('response', (response) => {
    if (
      isFirstPartyUrl(response.url()) &&
      response.status() >= 500
    ) {
      serverErrors.push({
        url: response.url(),
        status: response.status(),
      });
    }
  });

  page.on('requestfailed', (request) => {
    if (isFirstPartyUrl(request.url())) {
      failedRequests.push({
        url: request.url(),
        error:
          request.failure()?.errorText ??
          'Unknown network failure',
      });
    }
  });

  return {
    serverErrors,
    failedRequests,
  };
}