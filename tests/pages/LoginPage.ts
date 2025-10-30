import {Page, Locator, expect} from '@playwright/test';
import {BasePage} from './BasePage';
import {authenticator} from 'otplib';
import dotenv from 'dotenv';

dotenv.config(); // loads .env

class LoginPage extends BasePage {
    private emailInput: Locator;
    private nextButton: Locator;
    private passwordInput: Locator;
    private signInButton: Locator;
    private otcInput: Locator;
    private verifyButton: Locator;


    constructor(page: Page) {
        super(page, 'Sign in', 'Enter your email, phone, or Skype');

        // Using resilient selectors for stability
        this.emailInput = page.locator('input[name="loginfmt"]');
        this.nextButton = page.getByRole('button', {name: 'Next'});
        this.passwordInput = page.getByPlaceholder('Password');
        this.signInButton = page.getByRole('button', {name: 'Sign in'});
        this.otcInput = page.locator('input[name="otc"]');
        this.verifyButton = page.locator('input[id="idSubmit_SAOTCC_Continue"]');
    }

    async navigateTo() {
        const targetUrl = process.env.UI_BASE_URL || '/';
        await this.page.goto(targetUrl, {
            waitUntil: 'domcontentloaded',
            timeout: 120_000,
        });
        await this.waitForPageToLoad();
        await this.waitForPage();
    }

    async waitForPage() {
        await this.emailInput.waitFor({state: 'visible', timeout: 120_000});
    }

    async enterEmail(email: string) {
        await this.emailInput.fill(email);
    }

    async clickNext() {
        await this.nextButton.click();
    }

    async enterPassword(password: string) {
        await this.passwordInput.fill(password);
    }

    async clickSignIn() {
        await this.signInButton.click();
    }

    async login() {
        await this.waitForPage();
        await this.enterEmail(`${process.env.USERNAME}`);
        await this.clickNext();

        // Microsoft login often has a short delay before showing password
        await this.passwordInput.waitFor({state: 'visible', timeout: 120_000});

        await this.enterPassword(`${process.env.PASSWORD}`);
        await this.clickSignIn();

        await this.otcInput.waitFor({state: 'visible'})

        const secret = process.env.MFA_SECRET;
        if (!secret) {
            console.error('Missing MFA_SECRET in .env');
            process.exit(1);
        }

        const code = authenticator.generate(secret);
        await this.otcInput.fill(code)
        await this.verifyButton.click()

        const expectedBaseUrl = process.env.UI_BASE_URL;
        if (expectedBaseUrl) {
            const normalizedExpected = expectedBaseUrl.replace(/\/$/, '');
            await this.page.waitForURL(
                (url: URL) => {
                    const normalizedActual = `${url.origin}${url.pathname}`.replace(/\/$/, '');
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

export {LoginPage};
