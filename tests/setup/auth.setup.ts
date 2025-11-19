// import { chromium } from '@playwright/test';
// import { LoginPage } from '../pages/LoginPage';
// import * as dotenv from 'dotenv';
//
// dotenv.config();
//
// (async () => {
//     const browser = await chromium.launch();
//     const page = await browser.newPage();
//
//     const loginPage = new LoginPage(page);
//     await loginPage.navigateTo();
//     await loginPage.login();
//
//     // ✅ Save session
//     await page.context().storageState({ path: 'storageState.json' });
//
//     await browser.close();
//     console.log('✅ Auth state saved to storageState.json');
// })();

import { chromium } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

/**
 * Rewrites storageState.json so all cookies & origins match UI_BASE_URL.
 * This is necessary because login happens via UI_BASE_URL (HTTPS),
 * but tests run against BrowserStack Local using UI_BASE_URL (HTTP :80).
 */
function rewriteStorageState(storagePath: string, baseUrl: string) {
    const raw = fs.readFileSync(storagePath, 'utf8');
    const state = JSON.parse(raw);

    const url = new URL(baseUrl);

    const targetDomain = url.hostname;                // e.g. uat-submit-a-bulk-claim-service
    const targetProtocol = url.protocol.replace(':', ''); // "http"
    const targetPort =
        url.port ||
        (targetProtocol === 'http' ? '80' : '443');

    // 🔁 Rewrite cookies domain + secure flag
    state.cookies = state.cookies.map((c: any) => ({
        ...c,
        domain: targetDomain,
        secure: targetProtocol === 'https',
        sameSite: 'Lax',
    }));

    // 🔁 Rewrite origins (localStorage/sessionStorage origins)
    state.origins = state.origins.map((o: any) => ({
        ...o,
        origin: `${url.protocol}//${url.hostname}:${targetPort}`,
    }));

    fs.writeFileSync(storagePath, JSON.stringify(state, null, 2));
    console.log(`✨ storageState.json rewritten for runtime origin: ${baseUrl}`);
}

(async () => {
    console.log('🚀 Starting auth setup…');
    console.log('🔐 Logging in using:', process.env.UI_BASE_URL);
    console.log('🌍 Rewriting cookies for:', process.env.UI_BASE_URL);

    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Run the Microsoft login flow
    const loginPage = new LoginPage(page);
    await loginPage.navigateTo();
    await loginPage.login();

    // Save raw storage state (bound to the live HTTPS domain)
    const storagePath = 'storageState.json';
    await page.context().storageState({ path: storagePath });

    // Rewrite storage to match BrowserStack's internal domain
    rewriteStorageState(storagePath, process.env.UI_BASE_URL!);

    // Clean exit
    await browser.close();
    console.log('✅ Auth state created & rewritten → storageState.json');
})();
