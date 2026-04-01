import { Given } from '@cucumber/cucumber';
import World from '../../support/world';
import { logoutAndWipe, recreateLoggedInContext } from './reset.helper';

Given('I start from a clean logged-in state', async function (this: World) {
    if (!this.page || !this.browser) {
        throw new Error('Browser/Page not available');
    }

    let status: number | undefined;
    let badStatus = false;

    // Retry initial navigation (env may be cold-starting)
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const resp = await this.page.goto(process.env.UI_BASE_URL!, { timeout: 60000 });
            await this.page.waitForLoadState('domcontentloaded');

            status = resp?.status();
            // @ts-ignore
            badStatus = !resp || status >= 400;

            if (!badStatus) break;
        } catch (err: any) {
            console.warn(`⚠️ Navigation attempt ${attempt} failed: ${err.message}`);
            badStatus = true;
        }

        // Wait for the browser to settle before retrying (implicit wait)
        console.log(`⏳ Navigation unhealthy, retrying (attempt ${attempt + 1})...`);
        await this.page.waitForTimeout(0); // yield to event loop
    }

    // Detect "environment down" page
    const envDownPage = await this.page
        .locator('h1', { hasText: 'Unable to display the page' })
        .isVisible()
        .catch(() => false);

    if (badStatus || envDownPage) {
        console.warn(`🔧 Navigation unhealthy (status=${status ?? 'none'}) — retrying again...`);

        // Final retry without sleeps
        const resp = await this.page.goto(process.env.UI_BASE_URL!, { timeout: 60000 }).catch(() => null);
        if (resp) await this.page.waitForLoadState('domcontentloaded');
    }

    // Wait for readiness indicator
    await this.page
        .locator('button.sign-in-button:has-text("Sign out")')
        .waitFor({ state: 'visible', timeout: 45000 })
        .catch(() => console.warn('⚠️ Sign-out button not visible — continuing.'));

    // Log out + clear session
    await logoutAndWipe(this.page);

    try {
        await this.context?.close();
    } catch {
        console.warn('⚠️ Failed to close context cleanly — continuing.');
    }

    // Recreate logged-in context
    const { context, page } = await recreateLoggedInContext({
        browser: this.browser!,
        baseURL: process.env.UI_BASE_URL!,
        storageStatePath: this.workerStoragePath,
    });

    this.context = context;
    this.page = page;
    this.resetUiObjects();

    await this.attach('🔄 Context reset and login state reapplied', 'text/plain');
});
