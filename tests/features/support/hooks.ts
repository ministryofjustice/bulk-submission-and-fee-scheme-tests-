import {
    BeforeAll,
    Before,
    After,
    AfterStep,
    setDefaultTimeout,
    Status,
    ITestCaseHookParameter,
    ITestStepHookParameter,
    AfterAll,
} from '@cucumber/cucumber';
import dotenv from 'dotenv';
import World from './world';
import * as fs from 'fs';
import * as path from 'path';
import os from 'os';
import {createDataSourceManager} from '../../utils/db/dataSourceManager';
import {cleanSubmissionData} from '../../utils/scripts/cleanup-submissions';
import {destroySubmissionPeriodManager} from '../../utils/scripts/submissionPeriodHelper';
import net from "net";
import {execSync, spawn} from 'child_process';

setDefaultTimeout(60 * 1000);
dotenv.config();

const submissionCleanupManager = createDataSourceManager({label: 'submissionCleanup'});

async function checkPort(port: number): Promise<boolean> {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(2000);
        socket.once("connect", () => {
            socket.destroy();
            resolve(true);
        });
        socket.once("timeout", () => {
            socket.destroy();
            resolve(false);
        });
        socket.once("error", () => resolve(false));
        socket.connect(port, "127.0.0.1");
    });
}

export async function ensurePortsAvailable(forceRestartFor?: string[]) {
    if (!fs.existsSync("port-forward-config.json")) {
        console.warn("⚠️ No port-forward-config.json found, skipping auto-reconnect.");
        return;
    }

    const configs = JSON.parse(fs.readFileSync("port-forward-config.json", "utf8"));

    for (const { name, port, namespace, podName, pidEnvVar } of configs) {
        // If forcing restart and this service is one of them → skip checks, just restart
        if (forceRestartFor?.includes(name)) {
            console.log(`🔄 Force restarting ${name} port-forward...`);
            await restartPortForward({ name, namespace, podName, port, pidEnvVar });
            continue;
        }

        // Otherwise, do the usual reachability check
        const ok = await checkPort(port);
        if (ok) {
            console.log(`✅ [${name}] localhost:${port} is reachable.`);
            continue;
        }

        console.warn(`⚠️ [${name}] Port ${port} is unresponsive. Restarting...`);
        await restartPortForward({ name, namespace, podName, port, pidEnvVar });
    }
}

async function restartPortForward({ name, namespace, podName, port, pidEnvVar }: any) {
    try {
        const oldPid = process.env[pidEnvVar];
        if (oldPid) {
            try {
                process.kill(Number(oldPid), 9);
                console.log(`🧹 Killed old port-forward PID ${oldPid} for ${name}`);
            } catch {
                console.warn(`⚠️ Could not kill old PID ${oldPid}`);
            }
        }

        if (!podName || podName === "unknown") {
            console.error(`❌ Cannot restart ${name} — podName not provided`);
            return;
        }

        console.log(`🚀 Restarting port-forward for ${name}: pod/${podName} (${port}:${port})`);
        const proc = spawn(
            "kubectl",
            ["port-forward", "-n", "laa-submit-a-bulk-claim-uat", `pod/uat-submit-a-bulk-claim-698449976-fjnrm`, `${port}:${port}`],
            { detached: true, stdio: "ignore" }
        );
        proc.unref();
        process.env[pidEnvVar] = String(proc.pid);
        console.log(`✅ Restarted port-forward for ${name} (PID ${proc.pid})`);
    } catch (err: any) {
        console.error(`❌ Error restarting port-forward for ${name}:`, err.message);
    }
}


// ---------- Clear Down ----------
BeforeAll(function () {
    const dir = path.join(process.cwd(), 'reports', 'attachments');
    try {
        fs.rmSync(dir, {recursive: true, force: true});
        fs.mkdirSync(dir, {recursive: true});
        console.log(`🧹 Cleared attachments: ${path.relative(process.cwd(), dir)}`);
    } catch (err) {
        console.warn('⚠️ Could not initialize attachments directory:', err);
    }
});

// ---------- UI Hooks ----------
Before({tags: 'not @api'}, async function (this: World, scenario: ITestCaseHookParameter) {
    // if (process.env.GITHUB_RUN_NUMBER) {
    //     await ensurePortsAvailable()
    // }

    this.currentScenarioName = scenario.pickle.name || 'UnnamedScenario';
    await this.openBrowser();

    const uniqueId = `${process.pid}-${Math.random().toString(36).slice(2, 8)}`;

    const globalStorage = path.resolve('storageState.json');
    const workerStorage = path.resolve(os.tmpdir(), `storageState-${uniqueId}.json`);
    if (fs.existsSync(globalStorage) && !fs.existsSync(workerStorage)) {
        fs.copyFileSync(globalStorage, workerStorage);
    }

    // ✅ Create a new isolated browser context first
    this.context = await this.browser!.newContext({
        baseURL: process.env.UI_BASE_URL,
        // 🚫 remove the shared storage state if you want completely fresh sessions
        storageState: fs.existsSync(workerStorage) ? workerStorage : undefined,
    });

    // ✅ Create a page for cleanup & logout
    const page = await this.context.newPage();

    //if this times out . we can look to restart the sabc pod means something is becoming slow

    if (process.env.GITHUB_RUN_NUMBER) {
        try {
            // Try navigating to the app normally
            await page.goto(process.env.UI_BASE_URL!, {waitUntil: 'domcontentloaded', timeout: 1});
        } catch (err) {
            console.warn('⚠️ UI navigation timed out — likely a slow or hung SABC service.');
            console.warn('🔄 Attempting to restart affected port-forward(s)...');

            try {
                await ensurePortsAvailable(['sabc']);
                await ensurePortsAvailable(); // Automatically restarts any broken ones (including SABC)
                console.log('✅ Port-forward(s) verified or restarted. Retrying navigation...');
                await page.goto(process.env.UI_BASE_URL!, {waitUntil: 'domcontentloaded', timeout: 15000});
            } catch (innerErr) {
                console.error('❌ Failed to recover after restart attempt:', innerErr);
                throw err; // rethrow original to mark scenario failed
            }
        }
    } else {
        await page.goto(process.env.UI_BASE_URL!, {waitUntil: 'domcontentloaded'});

    }



        // 🔐 If the Sign out button is visible, click it to reset the backend session
    const signOutButton = page.locator('button.sign-in-button:has-text("Sign out")');
    if (await signOutButton.isVisible({timeout: 3000}).catch(() => false)) {
        console.log('🔐 Signing out to reset backend session...');
        await signOutButton.click();
        await page.waitForLoadState('networkidle');
    } else {
        console.log('ℹ️ No active session found, skipping sign out.');
    }

    // 🧹 Clear all frontend caches
    await page.evaluate(async () => {
        localStorage.clear();
        sessionStorage.clear();
        document.cookie.split(';').forEach(cookie => {
            const name = cookie.split('=')[0].trim();
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });

        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) await r.unregister();

        const dbs = await indexedDB.databases?.();
        if (dbs) for (const db of dbs) if (db.name) indexedDB.deleteDatabase(db.name);
    });

    await page.waitForTimeout(500);
    await page.close();

    // ✅ Fresh page for the scenario
    this.page = await this.context.newPage();

    // Reset world variables
    this.cleanupSubmissionIds.clear();
    this.submissionReference = undefined;
    this.submissionPeriod = undefined;
    this.officeAccount = undefined;
    this.matterStartCounts = undefined;

    await this.attach(`🧭 New isolated context created for: ${scenario.pickle.name}`, 'text/plain');
});


After({tags: 'not @api'}, async function (this: World) {
    try {
        if (this.context) {
            await this.context.close();
            this.context = undefined;
        }
        if (this.browser) {
            await this.browser.close();
            this.browser = undefined;
        }
        console.log('🧹 Closed browser and context after scenario');
    } catch (err) {
        console.warn('⚠️ Error closing browser context:', err);
    }
});

After({tags: '@matterStarts'}, async function (this: World) {
    if (!this.cleanupSubmissionIds || this.cleanupSubmissionIds.size === 0) {
        return;
    }

    const submissionIds = Array.from(this.cleanupSubmissionIds);

    try {
        const ready = await submissionCleanupManager.ensureInitialized();
        if (!ready) {
            await this.attach('⚠️ Unable to connect to database for submission cleanup.', 'text/plain');
            return;
        }

        await cleanSubmissionData(submissionCleanupManager.getDataSource(), submissionIds);
        await this.attach(`🧹 Cleaned submission data for: ${submissionIds.join(', ')}`, 'text/plain');
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        await this.attach(`⚠️ Submission cleanup failed: ${message}`, 'text/plain');
        console.warn('⚠️ Submission cleanup failed:', message);
    } finally {
        this.cleanupSubmissionIds.clear();
    }
});

AfterStep({tags: 'not @api'}, async function (this: World, step) {
    if (step.result?.status === Status.FAILED && this.page) {
        const rawName = step.pickle?.name ?? 'failed-step';
        const sanitizedStepName =
            rawName
                .trim()
                .replace(/[^A-Za-z0-9-_]+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '') || 'failed-step';
        const screenshotPath = `reports/attachments/${Date.now()}-${sanitizedStepName}.png`;
        await this.page.screenshot({path: screenshotPath, fullPage: true});
        await this.attach(fs.readFileSync(screenshotPath), 'image/png');
        console.log(`📸 Screenshot captured for failed step: ${screenshotPath}`);
    }
});

AfterAll(async function () {
    try {
        const files = fs.readdirSync(os.tmpdir());
        files
            .filter((f) => f.endsWith('_used_submission_periods.json'))
            .forEach((f) => {
                fs.unlinkSync(path.join(os.tmpdir(), f));
                console.log(`🧹 Deleted cache file: ${f}`);
            });

        await submissionCleanupManager.destroy();
    } catch (err) {
        console.warn('⚠️ Error during global cleanup:', err);
    } finally {
        await destroySubmissionPeriodManager();
    }
});

// ---------- API Evidence Helpers ----------
async function safeAttach(world: World, label: string, content: string) {
    if (typeof world.attach === 'function') {
        await world.attach(content, 'text/markdown');
    } else {
        const dir = path.join(process.cwd(), 'reports', 'attachments');
        fs.mkdirSync(dir, {recursive: true});
        const file = path.join(dir, `${Date.now()}.${label}.md`);
        fs.writeFileSync(file, content, 'utf8');
        console.warn(`⚠️ wrote attachment to ${file}`);
    }
}

// ---------- Attach API Failure Evidence ----------
AfterStep({tags: '@api'}, async function (this: World, step: ITestStepHookParameter) {
    if (step.result?.status !== Status.FAILED) return;

    const payloadBlock = this.requestBody
        ? `### Request Payload\n\`\`\`json\n${JSON.stringify(this.requestBody, null, 2)}\n\`\`\`\n\n`
        : '### Request Payload\n(none)\n\n';

    const responseBlock = this.response
        ? `### Response\n- Status: ${this.response.status}\n- Body:\n\`\`\`json\n${JSON.stringify(this.response.data, null, 2)}\n\`\`\`\n`
        : '### Response\n(none)\n';

    await safeAttach(this, 'api-failure', `## API Failure Context\n\n${payloadBlock}${responseBlock}`);
});

// ---------- Attach API Evidence at Scenario End ----------
After({tags: '@api'}, async function (this: World, scenario: ITestCaseHookParameter) {
    if (scenario.result?.status === Status.FAILED) return;

    const payloadBlock = this.requestBody
        ? `### Request Payload\n\`\`\`json\n${JSON.stringify(this.requestBody, null, 2)}\n\`\`\`\n\n`
        : '### Request Payload\n(none)\n\n';

    const responseBlock = this.response
        ? `### Response\n- Status: ${this.response.status}\n- Body:\n\`\`\`json\n${JSON.stringify(this.response.data, null, 2)}\n\`\`\`\n`
        : '### Response\n(none)\n';

    await safeAttach(this, 'api-test-evidence', `## API Test Evidence\n\n${payloadBlock}${responseBlock}`);
});
