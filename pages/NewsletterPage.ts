import { Page, Locator, expect } from '@playwright/test';

export class NewsletterPage {

  readonly page: Page;

  readonly emailInput: Locator;
  readonly subscribeButton: Locator;

  constructor(page: Page) {

    this.page = page;

    this.emailInput = page.locator(
      'input[type="email"]'
    ).first();

    this.subscribeButton = page.getByRole(
      'button',
      { name: /subscribe/i }
    ).first();
  }

  async goto() {
    await this.page.goto('/newsletter');
  }

  async subscribe(email: string) {

    await this.emailInput.fill(email);

    await this.subscribeButton.click();
  }

  async expectSuccessNotVisible() {

    await expect(
      this.page.getByText(
        /thank you for subscribing/i
      )
    ).not.toBeVisible();
  }
}