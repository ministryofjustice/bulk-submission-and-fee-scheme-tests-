// import { Given } from '@cucumber/cucumber';
// import World from '../../support/world';
// import { logoutAndWipe, recreateLoggedInContext } from './reset.helper';
// import { execSync } from 'child_process';
// import * as os from 'os';
// import * as path from 'path';
// import { checkPort } from '../../support/portForward';
// import fs from "fs";
//
// const STATIC_NAMESPACE = 'laa-submit-a-bulk-claim-uat';
// const STATIC_POD = 'uat-submit-a-bulk-claim-698449976-fjnrm';
// const STATIC_PORT = 8082;
// const LOCK_FILE = path.join(os.tmpdir(), 'sabc-portforward.lock');
//
// function tryLock() {
//     try {
//         const fd = fs.openSync(LOCK_FILE, fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_WRONLY);
//         fs.writeFileSync(fd, String(process.pid));
//         fs.closeSync(fd);
//         return true;
//     } catch {
//         return false;
//     }
// }
// function unlock() {
//     try { fs.unlinkSync(LOCK_FILE); } catch {}
// }
//
// async function restartPortForward() {
//     const locked = tryLock();
//     if (!locked) {
//         console.log('🕒 Another worker is restarting port-forward; skipping duplicate attempt.');
//         return;
//     }
//
//     try {
//         console.warn(`⚠️ Restarting SaBC port-forward (namespace=${STATIC_NAMESPACE}, pod=${STATIC_POD})`);
//
//         // Kill old process on 8082
//         try {
//             execSync(`lsof -ti:${STATIC_PORT} | xargs kill -9`, { stdio: 'ignore', shell: '/bin/bash' });
//             console.log(`🧹 Killed any process using port ${STATIC_PORT}.`);
//         } catch {
//             console.log(`ℹ️ No existing process found on ${STATIC_PORT}.`);
//         }
//
//         // Start new port-forward
//         execSync(
//             `nohup kubectl port-forward -n ${STATIC_NAMESPACE} pod/${STATIC_POD} ${STATIC_PORT}:${STATIC_PORT} > pf-${STATIC_PORT}.log 2>&1 &`,
//             { stdio: 'inherit', shell: '/bin/bash' }
//         );
//         console.log('🚀 Port-forward command started, waiting for readiness...');
//
//         // Wait for port to open
//         for (let i = 1; i <= 20; i++) {
//             if (await checkPort(STATIC_PORT)) {
//                 console.log(`✅ Port ${STATIC_PORT} responsive after ${i} checks.`);
//                 return;
//             }
//             await new Promise(r => setTimeout(r, 2000));
//         }
//
//         throw new Error(`❌ Port ${STATIC_PORT} not responding after 40s.`);
//     } finally {
//         unlock();
//     }
// }
//
// Given('I start from a clean logged-in state', async function (this: World) {
//     if (!this.page || !this.browser) throw new Error('Browser/Page not available');
//
//     let navigationSucceeded = false;
//
//     // Attempt navigation with built-in timeout
//     try {
//         await this.page.goto(process.env.UI_BASE_URL!, {
//             waitUntil: 'domcontentloaded',
//             timeout: 20000,
//         });
//         navigationSucceeded = true;
//     } catch (err: any) {
//         console.warn(`⚠️ Navigation failed or timed out: ${err.message}`);
//     }
//
//     // If failed, blank, or 502 — restart port-forward and retry
//     const bodyContent = navigationSucceeded ? await this.page.content() : '';
//     const isBlank = !bodyContent || bodyContent.trim().length < 50;
//     const errorHeading = this.page.locator('h1', { hasText: 'Unable to display the page' });
//
//     if (!navigationSucceeded || isBlank || await errorHeading.isVisible().catch(() => false)) {
//         console.warn('🔧 SaBC may be down (timeout, 502, or blank page detected) — restarting port-forward...');
//         await restartPortForward();
//
//         console.log('🔁 Retrying navigation after port-forward restart...');
//         await this.page.goto(process.env.UI_BASE_URL!, {
//             waitUntil: 'domcontentloaded',
//             timeout: 40000,
//         });
//     }
//
//     // Continue with reset
//     await logoutAndWipe(this.page);
//     try { await this.context?.close(); } catch {}
//
//     const { context, page } = await recreateLoggedInContext({
//         browser: this.browser!,
//         baseURL: process.env.UI_BASE_URL!,
//         storageStatePath: this.workerStoragePath,
//     });
//
//     this.context = context;
//     this.page = page;
//
//     await this.attach('🔄 Context reset and login state reapplied', 'text/plain');
// });
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
const STATIC_POD = 'uat-submit-a-bulk-claim-698449976-gphpb';
const STATIC_PORT = 8082;
const LOCK_FILE = path.join(os.tmpdir(), 'sabc-portforward.lock');

// // ───────────────────────────────
// // Lock helpers
// // ───────────────────────────────
// function tryLock() {
//     try {
//         const fd = fs.openSync(LOCK_FILE, fs.constants.O_CREAT | fs.constants.O_EXCL | fs.constants.O_WRONLY);
//         fs.writeFileSync(fd, String(process.pid));
//         fs.closeSync(fd);
//         return true;
//     } catch {
//         return false;
//     }
// }
// function unlock() {
//     try { fs.unlinkSync(LOCK_FILE); } catch {}
// }
//
// // ───────────────────────────────
// // Restart port-forward safely
// // ───────────────────────────────
// async function restartPortForward() {
//     const locked = tryLock();
//     if (!locked) {
//         console.log('🕒 Another worker is restarting port-forward; skipping duplicate attempt.');
//         return;
//     }
//
//     try {
//         console.warn(`⚠️ Restarting SaBC port-forward (namespace=${STATIC_NAMESPACE}, pod=${STATIC_POD})`);
//
//         // Kill old process on 8082
//         try {
//             execSync(`lsof -ti:${STATIC_PORT} | xargs kill -9`, { stdio: 'ignore', shell: '/bin/bash' });
//             console.log(`🧹 Killed any process using port ${STATIC_PORT}.`);
//         } catch {
//             console.log(`ℹ️ No existing process found on ${STATIC_PORT}.`);
//         }
//
//         // Start new port-forward
//         execSync(
//             `nohup kubectl port-forward -n ${STATIC_NAMESPACE} pod/${STATIC_POD} ${STATIC_PORT}:${STATIC_PORT} > pf-${STATIC_PORT}.log 2>&1 &`,
//             { stdio: 'inherit', shell: '/bin/bash' }
//         );
//         console.log('🚀 Port-forward command started, waiting for readiness...');
//
//         // Wait for port to open
//         for (let i = 1; i <= 20; i++) {
//             if (await checkPort(STATIC_PORT)) {
//                 console.log(`✅ Port ${STATIC_PORT} responsive after ${i} checks.`);
//                 return;
//             }
//             await new Promise(r => setTimeout(r, 2000));
//         }
//
//         throw new Error(`❌ Port ${STATIC_PORT} not responding after 40s.`);
//     } finally {
//         unlock();
//     }
// }

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
        // Ignore if file already deleted
    }
}

/**
 * Ensures the SaBC port-forward is running and reachable.
 * If another worker is restarting, waits until lock is released and port is live.
 */
async function ensurePortForwardReady() {
    const locked = tryLock();

    if (!locked) {
        console.log('🕒 Another worker is currently restarting port-forward; waiting for readiness...');

        // Poll until lock disappears and port is responsive
        for (let i = 1; i <= 30; i++) {
            if (!fs.existsSync(LOCK_FILE) && await checkPort(STATIC_PORT)) {
                console.log(`✅ Port-forward became ready after waiting (${i * 2}s).`);
                return;
            }
            await new Promise(r => setTimeout(r, 2000));
        }

        throw new Error(`❌ Timeout: waited 60s for another worker’s port-forward, but port ${STATIC_PORT} is still unreachable.`);
    }

    // If we got the lock, we perform the restart ourselves
    try {
        console.warn(`⚠️ Restarting SaBC port-forward (namespace=${STATIC_NAMESPACE}, pod=${STATIC_POD})`);

        // Kill any previous process on that port
        try {
            execSync(`lsof -ti:${STATIC_PORT} | xargs kill -9`, { stdio: 'ignore', shell: '/bin/bash' });
            console.log(`🧹 Cleared any existing process using ${STATIC_PORT}.`);
        } catch {
            console.log(`ℹ️ No existing process found on ${STATIC_PORT}.`);
        }

        // Start new port-forward
        execSync(
            `nohup kubectl port-forward -n ${STATIC_NAMESPACE} pod/${STATIC_POD} ${STATIC_PORT}:${STATIC_PORT} > pf-${STATIC_PORT}.log 2>&1 &`,
            { stdio: 'ignore', shell: '/bin/bash' }
        );
        console.log('🚀 Port-forward command started; checking readiness...');

        const ready = await checkPort(STATIC_PORT, 25, 2000);
        if (!ready) {
            throw new Error(`❌ Port ${STATIC_PORT} did not open after restart.`);
        }

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

    // Attempt navigation with built-in timeout and response capture
    try {
        const resp = await this.page.goto(process.env.UI_BASE_URL!, {
            waitUntil: 'domcontentloaded',
            timeout: 30000,
        });
        status = resp?.status();
        // @ts-ignore
        badStatus = !resp || (status >= 400);
    } catch (err: any) {
        console.warn(`⚠️ Navigation threw (timeout or connection issue): ${err.message}`);
        badStatus = true;
    }

    // Detect known error page text
    const errorHeading = this.page.locator('h1', { hasText: 'Unable to display the page' });
    const showsError = await errorHeading.isVisible().catch(() => false);

    if (badStatus || showsError) {
        console.warn(`🔧 Navigation unhealthy (status=${status ?? 'none'}) — restarting SaBC port-forward...`);
        await ensurePortForwardReady();

        console.log('🔁 Retrying navigation after port-forward restart...');
        const retryResp = await this.page.goto(process.env.UI_BASE_URL!, {
            waitUntil: 'domcontentloaded',
            timeout: 40000,
        }).catch(() => null);

        await this.page.locator('#main-content').waitFor({ state: 'visible', timeout: 10000 }).catch(() => {
            console.warn('⚠️ Main content not visible after reload.');
        });
    }

    // Continue with clean-up and recreation of context
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
