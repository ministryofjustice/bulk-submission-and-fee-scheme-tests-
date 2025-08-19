import { BasePage } from './BasePage';
import {Locator, Page} from "@playwright/test";

class LoginPage extends BasePage{
  private usernameField: Locator;
  private passwordField: Locator;
  private loginButton: Locator;

  constructor(page: Page) {
    super(page, "Login", "Sign in");
   this.usernameField = page.locator('#username');
   this.passwordField = page.locator('#password');
   this.loginButton = page.locator('button[type="submit"]');

  }

  async navigateTo() {
    await this.page.goto('/');
    await this.waitForPageToLoad()
  }

  async enterUsername(username: string) {
    await this.usernameField.fill(username);
  }

  async enterPassword(password: string) {
    await this.passwordField.fill(password);
  }

  async clickLogin() {
    await this.loginButton.click()

  }

}

export { LoginPage };