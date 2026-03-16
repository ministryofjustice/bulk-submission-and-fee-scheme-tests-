import { chromium } from '@playwright/test';
import * as dotenv from 'dotenv';
import {MockOIDCLoginPage} from "../pages/MockOIDCLoginPage";

dotenv.config();

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    const loginPage = new MockOIDCLoginPage(page);
    await loginPage.navigateTo();
    await loginPage.login();

    // ✅ Save session
    await page.context().storageState({ path: 'storageState.json' });

    await browser.close();
    console.log('✅ Auth state saved to storageState.json');
})();
