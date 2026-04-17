import { Given } from '@cucumber/cucumber';
import World from '../../support/world';
import { recreateLoggedInContext } from './reset.helper';

Given('I start from a clean logged-in state', async function (this: World) {
    if (!this.page || !this.browser) {
        throw new Error('Browser/Page not available');
    }

    const baseUrl = process.env.UI_BASE_URL!;
    let status: number | undefined;
    let badStatus = false;

    // Retry initial navigation (env may be cold-starting)
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const resp = await this.page.goto(baseUrl, { timeout: 60000 });
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
        const resp = await this.page.goto(baseUrl, { timeout: 60000 }).catch(() => null);
        if (resp) await this.page.waitForLoadState('domcontentloaded');
    }

    // Do not sign out server-side here. All parallel scenarios are seeded from the same
    // saved auth state, so logging out in one worker can invalidate the shared session for
    // other workers and trigger redirect loops. Closing the context is enough to reset the
    // browser-side state for this scenario.

    try {
        await this.context?.close();
    } catch {
        console.warn('⚠️ Failed to close context cleanly — continuing.');
    }

    // Recreate logged-in context
    const { context, page } = await recreateLoggedInContext({
        browser: this.browser!,
        baseURL: baseUrl,
        storageStatePath: this.workerStoragePath,
    });

    this.context = context;
    this.page = page;
    this.resetUiObjects();

    await this.attach('🔄 Context reset and login state reapplied', 'text/plain');
});
