import { chromium } from '@playwright/test';
import * as dotenv from 'dotenv';
import {MockOIDCLoginPage} from "../pages/MockOIDCLoginPage";

dotenv.config();

(async () => {
    const browser = await chromium.launch({ headless: process.env.HEADLESS === 'true' });
    const page = await browser.newPage();

    const loginPage = new MockOIDCLoginPage(page);
    await loginPage.navigateTo();
    await loginPage.login();

    // ✅ Save session
    const storageState = await page.context().storageState({ path: 'storageState.json' });

    // Debug: Log the cookies that were saved
    console.log('[DEBUG] Saved cookies:');
    storageState.cookies.forEach(cookie => {
        console.log(`  - ${cookie.name}: domain=${cookie.domain}, path=${cookie.path}`);
    });

    await browser.close();
    console.log('✅ Auth state saved to storageState.json');
})();
