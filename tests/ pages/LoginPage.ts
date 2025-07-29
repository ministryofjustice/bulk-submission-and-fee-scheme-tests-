import { BasePage } from './BasePage';
import {Locator, Page} from "@playwright/test";

class LoginPage extends BasePage{
  private usernameField: Locator;
  private passwordField: Locator;
  private loginButton: Locator;
  private errorMessage: Locator;

  constructor(page: Page) {
    super(page, "Login");

    // Initialize additional locators specific to this page
    this.usernameField = page.locator('#username-input');
    this.passwordField = page.locator('#password-input');
    this.loginButton = page.locator('#login-button');
    this.errorMessage = page.locator('#error-message');
  }

  async enterCredentials(username: string, password: string) {
    await this.usernameField.fill(username);
    await this.passwordField.fill(password);
  }

  async login() {
    await this.loginButton.click();
  }
}