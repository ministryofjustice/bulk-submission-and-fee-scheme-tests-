import type { Page, Browser, BrowserContext } from '@playwright/test';

export async function logoutAndWipe(page: Page) {
    // try to sign out if button visible
    const signOutButton = page.locator('button.sign-in-button:has-text("Sign out")');
    try {
        if (await signOutButton.isVisible({ timeout: 3000 })) {
            console.log('🔐 Signing out to reset backend session...');
            await signOutButton.click();
            await page.waitForLoadState('networkidle');
        } else {
            console.log('ℹ️ No active session found, skipping sign out.');
        }
    } catch {
        console.log('ℹ️ Sign-out control not found; proceeding with wipe.');
    }

    // wipe client storage
    await page.evaluate(async () => {
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(';').forEach((c) => {
            const name = c.split('=')[0].trim();
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });

        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) await r.unregister();

        const dbs = await (indexedDB as any).databases?.();
        if (dbs) for (const db of dbs) if (db.name) indexedDB.deleteDatabase(db.name);
    });

    await page.waitForTimeout(500);
}

export async function recreateLoggedInContext(opts: {
    browser: Browser;
    baseURL: string;
    storageStatePath?: string;
}): Promise<{ context: BrowserContext; page: Page }> {
    const context = await opts.browser.newContext({
        baseURL: opts.baseURL,
        storageState: opts.storageStatePath,
    });
    const page = await context.newPage();
    await page.goto(opts.baseURL);
    return { context, page };
}