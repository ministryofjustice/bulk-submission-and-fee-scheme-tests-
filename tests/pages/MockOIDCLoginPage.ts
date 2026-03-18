import {Page, Locator, expect} from '@playwright/test';
import {BasePage} from './BasePage';
import {authenticator} from 'otplib';
import dotenv from 'dotenv';
import {exec} from 'child_process';
import {promisify} from 'util';

dotenv.config(); // loads .env

class MockOIDCLoginPage extends BasePage {
    private usernameInput: Locator;
    private passwordInput: Locator;
    private signInButton: Locator;


    constructor(page: Page) {
        super(page, 'Sign in', 'Enter your email, phone, or Skype');

        // Using resilient selectors for stability
        this.usernameInput = page.locator('input[name="username"]');
        this.passwordInput = page.locator('input[name="password"]');
        this.signInButton = page.getByRole('button', {name: 'Sign in'});
    }

    async waitForPage() {
        await this.usernameInput.waitFor({state: 'visible', timeout: 120_000});
    }

    async navigateTo() {
        const targetUrl = process.env.UI_BASE_URL || '/';
        console.log(`[DEBUG] Navigating to: ${targetUrl}`);
        await this.page.goto(targetUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 120_000,
        });
        await this.waitForPageToLoad();
        await this.waitForPage();
    }


    async enterUsername(username: string) {
        await this.usernameInput.fill(username);
    }

    async enterPassword(password: string) {
        await this.passwordInput.fill(password);
    }

    async clickSignIn() {
        await this.signInButton.click();
    }

    async login() {
        await this.waitForPage();
        await this.enterUsername(`provider.user@provider.com`);
        await this.enterPassword(`password`);
        await this.clickSignIn();

        const expectedBaseUrl = process.env.UI_BASE_URL;
        if (expectedBaseUrl) {
            const normalizedExpected = expectedBaseUrl.replace(/\/$/, '');
            console.log(`[DEBUG] Expected URL (normalized): ${normalizedExpected}`);

            await this.page.waitForURL(
              (url: URL) => {
                  const normalizedActual = `${url.origin}${url.pathname}`.replace(/\/$/, '');
                  console.log(`[DEBUG] Current URL (normalized): ${normalizedActual}, Expected: ${normalizedExpected}`);
                  return normalizedActual.startsWith(normalizedExpected);
                },
                {timeout: 60000}
            );
        } else {
            await this.page.waitForLoadState('networkidle');
        }
        await this.page.waitForSelector('h1:has-text("Submit a bulk claim")', { timeout: 60000 });

        const title = await this.page.title();
        await expect(title).toContain('Submit a bulk claim');
    }

}

export {MockOIDCLoginPage};
