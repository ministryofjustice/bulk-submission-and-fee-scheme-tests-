import { BasePage } from './BasePage';
import {Locator, Page} from "@playwright/test";

class SampleLoginPage extends BasePage{
  private usernameField: Locator;
  private passwordField: Locator;

  constructor(page: Page) {
    super(page, "Login", "Sign in");

    // Initialize additional locators specific to this page
    this.usernameField = page.locator('#username');
    this.passwordField = page.locator('#password');
  }

  async navigateTo() {
    await this.page.goto('/login');
    await this.waitForPageToLoad()
  }

  async enterUsername(username: string) {
    await this.usernameField.fill(username);
  }

  async enterPassword(password: string) {
    await this.passwordField.fill(password);
  }
  
  async clickLogin() {
    await this.page.click('button[type="submit"]');
  }
}

export { SampleLoginPage };