import {expect, Locator, Page} from '@playwright/test';

class BasePage {
  private page: Page;
  private heading: Locator;
  private userName: Locator;
  private signOutLink: Locator;
  private serviceNavigationImportClaims: Locator;
  private serviceNavigationSearch: Locator;

  constructor(page: Page, headingText: string) {
    this.page = page;
    // Initialize locators here
    this.heading = page.locator(`h1:text("${headingText}")`);
    this.userName = page.locator('#logged-in-user');
    this.signOutLink = page.locator('#sign-out-link');
    this.serviceNavigationImportClaims = page.locator('#import-claims-link');
    this.serviceNavigationSearch = page.locator('#search-link');
  }

  async signOut() {
    await this.signOutLink.click();
  }
}

export { BasePage };