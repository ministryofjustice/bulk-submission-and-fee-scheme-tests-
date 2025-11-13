import { Given } from '@cucumber/cucumber';
import World from '../../support/world';
import { logoutAndWipe, recreateLoggedInContext } from './reset.helper';



Given('I start from a clean logged-in state', async function (this: World) {
    if (!this.page || !this.browser) throw new Error('Browser/Page not available');

    await this.page.goto(process.env.UI_BASE_URL!, {
        waitUntil: 'domcontentloaded',
        timeout: 40000,
    });
    
    await logoutAndWipe(this.page);

    try {
        await this.context?.close();
    } catch {
        console.warn('⚠️ Failed to close context cleanly — continuing.');
    }

    const { context, page } = await recreateLoggedInContext({
        browser: this.browser!,
        baseURL: process.env.UI_BASE_URL!,
        storageStatePath: this.workerStoragePath,
    });

    this.context = context;
    this.page = page;

    await this.attach('🔄 Context reset and login state reapplied', 'text/plain');
});
