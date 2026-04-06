import { chromium } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import * as dotenv from 'dotenv';

dotenv.config();

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    const loginPage = new LoginPage(page);
    await loginPage.navigateTo();
    await loginPage.login();

    // ✅ Save session
    await page.context().storageState({ path: 'storageState.json' });

    await browser.close();
    console.log('✅ Auth state saved to storageState.json');
})();
