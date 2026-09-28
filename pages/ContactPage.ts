import { Page, Locator } from '@playwright/test';

export class ContactPage {

  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/contact');
  }

  getUnderstandControl(): Locator {

    return this.page
      .getByText(/I understand/i)
      .first();
  }
}