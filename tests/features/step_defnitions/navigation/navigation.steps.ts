import { Given } from '@cucumber/cucumber';
import World from '../../support/world';
import { logoutAndWipe, recreateLoggedInContext } from './reset.helper';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { checkPort } from '../../support/portForward'; // Ensure this exists

// ───────────────────────────────
// Constants & helpers
// ───────────────────────────────
const LOCK_FILE = path.join(os.tmpdir(), 'sabc-portforward.lock');
const STATIC_NAMESPACE = 'laa-submit-a-bulk-claim-uat';

function tryAcquireLock(): boolean {
    try {
        const fd = fs.openSync(LOCK_FILE, fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_WRONLY);
        fs.writeFileSync(fd, String(process.pid));
        fs.closeSync(fd);
        return true;
    } catch {
        return false;
    }
}
function releaseLock() {
    try { fs.unlinkSync(LOCK_FILE); } catch {}
}

interface PortConfig {
    name: string;
    namespace: string;
    podName: string;
    port: number;
    pidEnvVar: string;
}

// ───────────────────────────────
// Get SaBC pod/port dynamically from pipeline output
// ───────────────────────────────
function getSabcPortConfig(): PortConfig | undefined {
    const configPath = path.resolve('port-forward-config.json');
    if (!fs.existsSync(configPath)) {
        console.warn('⚠️ port-forward-config.json not found — cannot resolve SaBC port-forward config.');
        return undefined;
    }

    const configs: PortConfig[] = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const sabcConfig = configs.find(c => c.name === 'sabc' || c.name.includes('sabc'));
    if (!sabcConfig) {
        console.warn('⚠️ No SABC entry found in port-forward-config.json.');
        return undefined;
    }

    // Force static namespace in case pipeline JSON differs
    sabcConfig.namespace = STATIC_NAMESPACE;
    return sabcConfig;
}

// ───────────────────────────────
// Restart SaBC port-forward with safety lock
// ───────────────────────────────
async function restartSabcPortForwardWithWait(cfg: PortConfig) {
    const gotLock = tryAcquireLock();
    if (!gotLock) {
        console.log('🕒 Another worker is handling SaBC port-forward restart. Skipping this run.');
        return;
    }

    try {
        console.warn(`⚠️ Restarting SaBC port-forward for pod ${cfg.podName} (${cfg.namespace})...`);

        // Kill any process listening on the port
        try {
            execSync(`lsof -ti:${cfg.port} | xargs kill -9`, { stdio: 'ignore', shell: '/bin/bash' });
            console.log(`🧹 Cleared any existing process using port ${cfg.port}.`);
        } catch {
            console.log(`ℹ️ No existing process found on port ${cfg.port}.`);
        }

        // Start port-forward
        console.log(`🚀 Starting new port-forward for SaBC pod ${cfg.podName}...`);
        execSync(
            `nohup kubectl port-forward -n laa-submit-a-bulk-claim-uat pod/uat-submit-a-bulk-claim-698449976-gphpb 8082:8082 > pf-8082.log 2>&1 &`,
            { stdio: 'inherit', shell: '/bin/bash' }
        );

        // Wait for the port to become available
        const maxRetries = 10;
        const retryIntervalMs = 2000;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            if (await checkPort(cfg.port)) {
                console.log(`✅ Port ${cfg.port} is responsive after ${attempt} checks.`);
                return;
            }
            console.log(`⏳ Waiting for port ${cfg.port} to respond (attempt ${attempt}/${maxRetries})...`);
            await new Promise(res => setTimeout(res, retryIntervalMs));
        }

        throw new Error(`❌ Port ${cfg.port} did not become responsive after ${(maxRetries * retryIntervalMs) / 1000}s.`);
    } finally {
        releaseLock();
    }
}

// ───────────────────────────────
// Cucumber Step Definition
// ───────────────────────────────
Given('I start from a clean logged-in state', async function (this: World) {
    if (!this.page || !this.browser) throw new Error('Browser/Page not available');

    try {
        await this.page.goto(process.env.UI_BASE_URL!, { waitUntil: 'domcontentloaded', timeout: 20000 });
    } catch {
        console.warn('⚠️ Initial navigation failed, verifying error page.');
    }

    // Detect SABC downtime via the error page
    const errorHeading = this.page.locator('h1', { hasText: 'Unable to display the page' });
    if (await errorHeading.isVisible().catch(() => false)) {
        const cfg = getSabcPortConfig();
        if (!cfg) {
            console.warn('⚠️ No SaBC port-forward config found — cannot restart.');
        } else {
            await restartSabcPortForwardWithWait(cfg);

            console.log('🔁 Retrying navigation after SaBC port-forward restart...');
            await this.page.goto(process.env.UI_BASE_URL!, { waitUntil: 'domcontentloaded', timeout: 20000 });
            await this.page.locator('#main-content').waitFor({ state: 'visible', timeout: 10000 }).catch(() => {
                console.warn('⚠️ Main content not visible after reload.');
            });
        }
    }

    // Continue with login reset
    await logoutAndWipe(this.page);

    try { await this.context?.close(); } catch {}

    const { context, page } = await recreateLoggedInContext({
        browser: this.browser!,
        baseURL: process.env.UI_BASE_URL!,
        storageStatePath: this.workerStoragePath,
    });

    this.context = context;
    this.page = page;

    await this.attach('🔄 Context reset and login state reapplied', 'text/plain');
});
