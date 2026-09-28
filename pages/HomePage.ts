import { Page, Locator, expect } from '@playwright/test';

export class HomePage {

  readonly page: Page;

  readonly body: Locator;

  constructor(page: Page) {
    this.page = page;
    this.body = page.locator('body');
  }

  async goto() {
    await this.page.goto('/');
  }

  async verifyLoaded() {
    await expect(this.page).toHaveURL(/techdome\.io/);
    await expect(this.body).toBeVisible();
  }

  async getTitle() {
    return this.page.title();
  }

  async getMetaDescription() {
    return this.page
      .locator('meta[name="description"]')
      .getAttribute('content');
  }

  async hasHorizontalOverflow(): Promise<boolean> {
    return this.page.evaluate(() => {
      return (
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
      );
    });
  }
}