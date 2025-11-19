import {expect, Locator, Page} from '@playwright/test';

class BasePage {
  protected page: Page;
  protected heading: Locator;
  private primaryButton: Locator;
  private userName: Locator;
  private signOutLink: Locator;
  private serviceNavigationImportClaims: Locator;
  private serviceNavigationSearch: Locator;
  protected errorSummary: Locator;
  private footer: Locator;


  constructor(page: Page, headingText: string, primaryButtonText: string = 'Submit') {
    this.page = page;
    // Initialize locators here
    this.heading = page.locator(`h1:text("${headingText}")`);
    this.primaryButton = page.getByRole('button', {name: primaryButtonText});
    this.userName = page.locator('#logged-in-user');
    this.signOutLink = page.locator('#sign-out-link');
    this.serviceNavigationImportClaims = page.locator('#import-claims-link');
    this.serviceNavigationSearch = page.locator('#search-link');
    this.errorSummary = page.locator("[class='govuk-error-summary']");
    this.footer = page.locator('footer');
  }

  async submit(){
    await this.primaryButton.click();
  }

  async signOut() {
    await this.signOutLink.click();
  }

  async waitForPageToLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }
}

export { BasePage };
