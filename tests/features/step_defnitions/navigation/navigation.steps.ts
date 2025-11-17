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
// Small Helpers
// ───────────────────────────────
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ───────────────────────────────
// Lock Helpers
// ───────────────────────────────
function cleanStaleLock(): void {
    if (!fs.existsSync(LOCK_FILE)) return;

    try {
        const pid = parseInt(fs.readFileSync(LOCK_FILE, 'utf8'), 10);
        if (!pid || Number.isNaN(pid)) throw new Error('Invalid PID');

        // Check if process is still alive
        process.kill(pid, 0);
        // If no error → process exists → keep lock
        console.log(`🔒 Active lock detected for process ${pid}, keeping lock.`);
    } catch (err: any) {
        // ESRCH means process doesn't exist
        if (err.code === 'ESRCH' || err.message.includes('Invalid PID')) {
            console.log('🧹 Removing stale lock file from previous run...');
            try {
                fs.unlinkSync(LOCK_FILE);
            } catch {
                // ignore
            }
        }
    }
}

function tryLock(): boolean {
    try {
        const fd = fs.openSync(
            LOCK_FILE,
            fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_WRONLY
        );
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
    const usePortForward = process.env.PORT_FORWARD === 'true';
    if (!usePortForward) {
        console.log('🌐 PORT_FORWARD not enabled — skipping local Kubernetes restart logic.');
        return;
    }

    // 🧹 Clean up stale locks from previous runs
    cleanStaleLock();

    const locked = tryLock();

    if (!locked) {
        console.log('🕒 Another worker is currently restarting port-forward; waiting for unlock...');
        const start = Date.now();
        const MAX_WAIT_MS = 180_000; // 3 minutes

        while (true) {
            const stillLocked = fs.existsSync(LOCK_FILE);
            const ready = await checkPort(STATIC_PORT);
            if (!stillLocked && ready) {
                console.log(`✅ Another worker finished restart; port ${STATIC_PORT} is ready.`);
                return;
            }
            if (Date.now() - start > MAX_WAIT_MS) {
                throw new Error(`❌ Timeout: waited ${MAX_WAIT_MS / 1000}s for unlock or readiness.`);
            }
            await sleep(1000);
        }
    }

    try {
        console.warn(`⚠️ Restarting SaBC port-forward (namespace=${STATIC_NAMESPACE})`);

        // 🧹 Kill any existing process using the port
        try {
            execSync(`lsof -ti:${STATIC_PORT} | xargs kill -9`, {
                stdio: 'ignore',
                shell: '/bin/bash',
            });
            console.log(`🧹 Cleared any existing process using ${STATIC_PORT}.`);
        } catch {
            console.log(`ℹ️ No existing process found on ${STATIC_PORT}.`);
        }

        // Give OS a moment to fully release the port
        await sleep(1000);

        // 🧭 Get current pod (old) using label selector
        console.log('🧭 Fetching current pod in namespace (before delete)...');
        let oldPodName = '';
        try {
            oldPodName = execSync(
                `kubectl get pods -n ${STATIC_NAMESPACE} -l ${STATIC_LABEL} -o jsonpath='{.items[0].metadata.name}'`,
                { encoding: 'utf-8', shell: '/bin/bash' }
            ).trim();
        } catch {
            // ignore; may be no pods yet
        }

        if (oldPodName) {
            console.log(`🗑️ Deleting existing pod: ${oldPodName}`);
            execSync(
                `kubectl delete pod ${oldPodName} -n ${STATIC_NAMESPACE} --wait=true --ignore-not-found`,
                { stdio: 'inherit', shell: '/bin/bash' }
            );
        } else {
            console.log('ℹ️ No existing pod found to delete (namespace may be cold-starting).');
        }

        // 🔁 Wait for a new pod (different name) to appear with the same label
        console.log('⏳ Waiting for new pod to be created...');
        const NEW_POD_TIMEOUT_MS = 180_000;
        const newPodStart = Date.now();
        let newPodName = '';

        while (true) {
            try {
                const candidate = execSync(
                    `kubectl get pods -n ${STATIC_NAMESPACE} -l ${STATIC_LABEL} -o jsonpath='{.items[0].metadata.name}'`,
                    { encoding: 'utf-8', shell: '/bin/bash' }
                )
                    .trim()
                    .replace(/^'|'$/g, ''); // strip stray quotes if any

                if (candidate && candidate !== oldPodName) {
                    newPodName = candidate;
                    break;
                }
            } catch {
                // ignore, likely no pods yet
            }

            if (Date.now() - newPodStart > NEW_POD_TIMEOUT_MS) {
                throw new Error('❌ Timeout waiting for new pod to be created.');
            }

            await sleep(2000);
        }

        console.log(`🔎 New pod detected: ${newPodName}`);
        console.log('⏳ Waiting for new pod to become Ready...');

        // ✅ Wait specifically for THIS pod to be Ready (avoids "any pod" race)
        execSync(
            `kubectl wait --for=condition=Ready pod/${newPodName} -n ${STATIC_NAMESPACE} --timeout=240s`,
            { stdio: 'inherit', shell: '/bin/bash' }
        );

        // Give the app a couple of seconds to bind ports even after Ready
        await sleep(3000);

        console.log(`✅ Pod ${newPodName} is Ready; starting port-forward...`);

        // 🚀 Start port-forward to the new pod
        execSync(
            `nohup kubectl port-forward -n ${STATIC_NAMESPACE} pod/${newPodName} ${STATIC_PORT}:${STATIC_PORT} > pf-${STATIC_PORT}.log 2>&1 &`,
            { stdio: 'ignore', shell: '/bin/bash' }
        );

        console.log('🚀 Port-forward started; validating backend availability...');

        // Double-check: retry port check until backend actually responds
        let ready = false;
        for (let i = 0; i < 60; i++) {
            ready = await checkPort(STATIC_PORT);
            if (ready) break;
            await sleep(2000);
        }

        if (!ready) {
            throw new Error(`❌ Port ${STATIC_PORT} never became responsive.`);
        }

        console.log(`✅ Port-forward established and port ${STATIC_PORT} is responding.`);
    } finally {
        unlock();
    }
}

// ───────────────────────────────
// Step Definition
// ───────────────────────────────
Given('I start from a clean logged-in state', async function (this: World) {
    if (!this.page || !this.browser) throw new Error('Browser/Page not available');

    let status: number | undefined;
    let badStatus = false;

    // Retry initial navigation with exponential backoff (in case env is just booting)
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const resp = await this.page.goto(process.env.UI_BASE_URL!, { timeout: 60000 });
            status = resp?.status();
            // @ts-ignore
            badStatus = !resp || status >= 400;
            if (!badStatus) break;
        } catch (err: any) {
            console.warn(`⚠️ Navigation attempt ${attempt} failed: ${err.message}`);
            badStatus = true;
        }

        if (badStatus) {
            const delay = attempt * 5000;
            console.log(`⏳ Navigation unhealthy, retrying in ${delay / 1000}s...`);
            await sleep(delay);
        }
    }

    const showsError = await this.page
        .locator('h1', { hasText: 'Unable to display the page' })
        .isVisible()
        .catch(() => false);

    if (badStatus || showsError) {
        console.warn(
            `🔧 Navigation unhealthy (status=${status ?? 'none'}) — re-establishing port-forward...`
        );
        await ensurePortForwardReady();

        console.log('🔁 Retrying navigation after port-forward restart...');
        await this.page.goto(process.env.UI_BASE_URL!, { timeout: 60000 }).catch(() => null);
    }

    // ✅ Wait for readiness indicator
    await this.page
        .locator('button.sign-in-button:has-text("Sign out")')
        .waitFor({ state: 'visible', timeout: 45000 })
        .catch(() => console.warn('⚠️ Sign-out button did not appear after reload.'));

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
