import { BasePage } from './BasePage';
import {Locator, Page} from "@playwright/test";

class LoginPage extends BasePage{
  private usernameField: Locator;
  private passwordField: Locator;

  constructor(page: Page) {
    super(page, "Login", "Sign in");

    // Initialize additional locators specific to this page
    this.usernameField = page.locator('#username-input');
    this.passwordField = page.locator('#password-input');
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

}

export { LoginPage };