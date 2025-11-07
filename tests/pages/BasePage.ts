import {expect, Locator, Page} from '@playwright/test';

class BasePage {
  protected page: Page;
  private heading: Locator;
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

  async submit() {
    // Ensure page DOM and network are stable before clicking
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');

    // Ensure the button is visible and ready
    await expect(this.primaryButton).toBeVisible({ timeout: 5000 });
    await expect(this.primaryButton).toBeEnabled({ timeout: 5000 });

    // Now perform the click
    await this.primaryButton.click({ trial: false });
  }

  async signOut() {
    await this.signOutLink.click();
  }

  async waitForPageToLoad() {
    await this.page.waitForLoadState('domcontentloaded');
  }
}

export { BasePage };
