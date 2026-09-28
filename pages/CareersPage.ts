import { Page, Locator, expect } from '@playwright/test';

export class CareersPage {

  readonly page: Page;
  readonly body: Locator;

  constructor(page: Page) {
    this.page = page;
    this.body = page.locator('body');
  }

  async goto() {
    await this.page.goto('/careers');
  }

  async verifyLoaded() {
    await expect(this.body).toBeVisible();

    await expect(
      this.page
    ).toHaveURL(/\/careers/);
  }

  async findRole(role: string) {

    return this.page
      .getByText(role, { exact: false })
      .first();
  }
}