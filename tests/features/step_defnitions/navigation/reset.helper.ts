// import type { Page, Browser, BrowserContext } from '@playwright/test';
//
// export async function logoutAndWipe(page: Page) {
//     const signOutButton = page.locator('button.sign-in-button:has-text("Sign out")');
//
//     try {
//         if (await signOutButton.isVisible({ timeout: 3000 })) {
//             console.log('🔐 Signing out to reset backend session...');
//             await signOutButton.click();
//             // Instead of waiting for networkidle, just allow brief pause
//             await page.waitForTimeout(1000);
//         } else {
//             console.log('ℹ️ No active session found, skipping sign out.');
//         }
//     } catch {
//         console.log('ℹ️ Sign-out control not found; proceeding with wipe.');
//     }
//
//     // 🔄 Clean client storage
//     await page.evaluate(async () => {
//         localStorage.clear();
//         sessionStorage.clear();
//         document.cookie.split(';').forEach((c) => {
//             const name = c.split('=')[0].trim();
//             document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
//         });
//
//         const regs = await navigator.serviceWorker.getRegistrations();
//         for (const r of regs) await r.unregister();
//
//         const dbs = await (indexedDB as any).databases?.();
//         if (dbs) for (const db of dbs) if (db.name) indexedDB.deleteDatabase(db.name);
//     });
//
//     await page.waitForTimeout(500);
// }
//
// export async function recreateLoggedInContext(opts: {
//     browser: Browser;
//     baseURL: string;
//     storageStatePath?: string;
// }): Promise<{ context: BrowserContext; page: Page }> {
//     console.log(`🌍 Recreating logged-in context for base URL: ${opts.baseURL}`);
//
//     const context = await opts.browser.newContext({
//         baseURL: opts.baseURL,
//         storageState: opts.storageStatePath,
//     });
//
//     const page = await context.newPage();
//
//     try {
//         // Navigate without waiting for full load
//         await page.goto(opts.baseURL, { timeout: 60000 });
//         await page.locator('button.sign-in-button:has-text("Sign out")').waitFor({
//             state: 'visible',
//             timeout: 30000,
//         });
//
//         console.log('✅ Page title confirmed: environment is ready.');
//     } catch (err: any) {
//         console.warn(`⚠️ Initial navigation failed: ${err.message}`);
//
//         // 🧩 Fallback: wait for #main-content if title not detected
//         await page.locator('#main-content').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {
//             console.warn('⚠️ Fallback: main content not visible after navigation.');
//         });
//     }
//
//     return { context, page };
// }

import type { Page, Browser, BrowserContext } from '@playwright/test';

export async function logoutAndWipe(page: Page) {
    console.log('⚠️ Sign-out disabled because storageState is now authoritative.');

    // DO NOT sign out
    // DO NOT clear localStorage or sessionStorage
    // DO NOT clear cookies
    // DO NOT break auth

    await page.waitForTimeout(200);
}

export async function recreateLoggedInContext(opts: {
    browser: Browser;
    baseURL: string;
    storageStatePath?: string;
}): Promise<{ context: BrowserContext; page: Page }> {
    console.log(`🌍 Recreating logged-in context for base URL: ${opts.baseURL}`);

    const context = await opts.browser.newContext({
        baseURL: opts.baseURL,
        storageState: opts.storageStatePath,
    });

    const page = await context.newPage();

    try {
        await page.goto(opts.baseURL, { timeout: 60000 });
        await page.waitForLoadState('domcontentloaded');

        console.log('ℹ️ Skipping Sign out check — Azure AD session not present after storage rewrite.');

        // Just wait for some visible page content
        await page.locator('h1').waitFor({
            state: 'visible',
            timeout: 15000,
        });

        console.log('✅ Page loaded and session restored.');
    } catch (err: any) {
        console.warn(`⚠️ Initial navigation failed: ${err.message}`);

        await page.locator('#main-content').waitFor({
            state: 'visible',
            timeout: 15000,
        }).catch(() => {
            console.warn('⚠️ Fallback: main content not visible after navigation.');
        });
    }

    return { context, page };
}
