import { Given } from '@cucumber/cucumber';
import World from '../../support/world';
import { logoutAndWipe, recreateLoggedInContext } from './reset.helper';
import { execSync } from 'child_process';
import * as os from 'os';
import * as path from 'path';
import { checkPort } from '../../support/portForward';
import fs from 'fs';

// ───────────────────────────────
// Constants
// ───────────────────────────────
const STATIC_NAMESPACE = 'laa-submit-a-bulk-claim-uat';
const STATIC_LABEL = 'app.kubernetes.io/name=uat-submit-a-bulk-claim';
const STATIC_PORT = 8082;
const LOCK_FILE = path.join(os.tmpdir(), 'sabc-portforward.lock');

// ───────────────────────────────
// Lock Helpers
// ───────────────────────────────
function tryLock(): boolean {
    try {
        const fd = fs.openSync(LOCK_FILE, fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_WRONLY);
        fs.writeFileSync(fd, String(process.pid));
        fs.closeSync(fd);
        return true;
    } catch {
        return false;
    }
}

function unlock() {
    try {
        fs.unlinkSync(LOCK_FILE);
    } catch {
        // ignore
    }
}

// ───────────────────────────────
// Core Logic
// ───────────────────────────────
async function ensurePortForwardReady() {
    const locked = tryLock();

    if (!locked) {
        console.log('🕒 Another worker is currently restarting port-forward; waiting for readiness...');
        for (let i = 1; i <= 30; i++) {
            if (!fs.existsSync(LOCK_FILE) && await checkPort(STATIC_PORT)) {
                console.log(`✅ Port-forward became ready after waiting (${i * 2}s).`);
                return;
            }
            await new Promise(r => setTimeout(r, 2000));
        }
        throw new Error(`❌ Timeout: waited 60s for another worker’s port-forward, but port ${STATIC_PORT} is still unreachable.`);
    }

    try {
        console.warn(`⚠️ Restarting SaBC port-forward (namespace=${STATIC_NAMESPACE})`);

        // Kill existing process using port
        try {
            execSync(`lsof -ti:${STATIC_PORT} | xargs kill -9`, { stdio: 'ignore', shell: '/bin/bash' });
            console.log(`🧹 Cleared any existing process using ${STATIC_PORT}.`);
        } catch {
            console.log(`ℹ️ No existing process found on ${STATIC_PORT}.`);
        }

        // Delete old pods
        try {
            console.log('🗑️  Deleting old pods...');
            execSync(
                `kubectl delete pod -l ${STATIC_LABEL} -n ${STATIC_NAMESPACE} --ignore-not-found`,
                { stdio: 'inherit', shell: '/bin/bash' }
            );
        } catch {
            console.warn('⚠️ Failed to delete old pods — continuing.');
        }

        // Wait for new pod to be ready
        console.log('⏳ Waiting for new pod to be ready...');
        execSync(
            `kubectl wait --for=condition=ready pod -l ${STATIC_LABEL} -n ${STATIC_NAMESPACE} --timeout=180s`,
            { stdio: 'inherit', shell: '/bin/bash' }
        );

        // Get the latest pod name
        const podName = execSync(
            `kubectl get pods -n ${STATIC_NAMESPACE} -l ${STATIC_LABEL} -o jsonpath='{.items[-1].metadata.name}'`,
            { encoding: 'utf-8', shell: '/bin/bash' }
        ).trim();

        if (!podName) {
            throw new Error('❌ Unable to detect new pod name.');
        }

        console.log(`📦 Latest pod detected: ${podName}`);

        // Start port-forward
        execSync(
            `nohup kubectl port-forward -n ${STATIC_NAMESPACE} pod/${podName} ${STATIC_PORT}:${STATIC_PORT} > pf-${STATIC_PORT}.log 2>&1 &`,
            { stdio: 'ignore', shell: '/bin/bash' }
        );

        console.log('🚀 Port-forward command started; checking readiness...');
        const ready = await checkPort(STATIC_PORT, 25, 2000);
        if (!ready) throw new Error(`❌ Port ${STATIC_PORT} did not open after restart.`);

        console.log(`✅ Port-forward established and port ${STATIC_PORT} is responsive.`);
    } finally {
        unlock();
    }
}

// ───────────────────────────────
// Step Definition
// ───────────────────────────────
Given('I start from a clean logged-in state', async function (this: World) {
    if (!this.page || !this.browser) throw new Error('Browser/Page not available');

    let status: number | undefined = undefined;
    let badStatus = false;

    try {
        const resp = await this.page.goto(process.env.UI_BASE_URL!, {
            waitUntil: 'domcontentloaded',
            timeout: 60000,
        });
        status = resp?.status();
        // @ts-ignore
        badStatus = !resp || (status >= 400);
    } catch (err: any) {
        console.warn(`⚠️ Navigation threw (timeout or connection issue): ${err.message}`);
        badStatus = true;
    }

    const errorHeading = this.page.locator('h1', { hasText: 'Unable to display the page' });
    const showsError = await errorHeading.isVisible().catch(() => false);

    if (badStatus || showsError) {
        console.warn(`🔧 Navigation unhealthy (status=${status ?? 'none'}) — restarting SaBC port-forward...`);
        await ensurePortForwardReady();

        console.log('🔁 Retrying navigation after port-forward restart...');
        await this.page.goto(process.env.UI_BASE_URL!, {
            waitUntil: 'domcontentloaded',
            timeout: 40000,
        }).catch(() => null);

        await this.page.locator('#main-content').waitFor({ state: 'visible', timeout: 10000 }).catch(() => {
            console.warn('⚠️ Main content not visible after reload.');
        });
    }

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
