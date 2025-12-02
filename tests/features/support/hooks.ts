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
import net from 'net';
import {execSync} from 'child_process';
import {createDataSourceManager} from '../../utils/db/dataSourceManager';
import {cleanSubmissionData} from '../../utils/scripts/cleanup-submissions';
import {destroySubmissionPeriodManager} from '../../utils/scripts/dataGenartor/submissionPeriodHelper';

setDefaultTimeout(180 * 1000);
console.log('⏱️ Cucumber step timeout set to 180s');
dotenv.config();

const submissionCleanupManager = createDataSourceManager({label: 'submissionCleanup'});

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

Before({ tags: 'not @api' }, async function (this: World, scenario: ITestCaseHookParameter) {
    this.currentScenarioName = scenario.pickle.name || 'UnnamedScenario';
    console.log(`\n🚀 Preparing blank browser for: ${this.currentScenarioName}`);

    try {
        // 1️⃣ Always try to open browser — no dependency on backend
        try {
            await this.openBrowser();
        } catch (err) {
            // @ts-ignore
            console.warn('⚠️ Browser launch failed:', err?.message || err);
            this.browser = undefined;
            return; // don't throw, let retry logic handle it
        }

        // 2️⃣ Prepare unique storage state (optional, safe)
        const uniqueId = `${process.pid}-${Math.random().toString(36).slice(2, 8)}`;
        const globalStorage = path.resolve('storageState.json');
        const workerStorage = path.resolve(os.tmpdir(), `storageState-${uniqueId}.json`);
        if (fs.existsSync(globalStorage)) {
            try {
                fs.copyFileSync(globalStorage, workerStorage);
                this.workerStoragePath = workerStorage;
            } catch {
                this.workerStoragePath = undefined;
            }
        }

        // 3️⃣ Create context + blank page
        try {
            this.context = await this.browser!.newContext({
                baseURL: process.env.UI_BASE_URL || 'about:blank',
                storageState: this.workerStoragePath,
            });
            this.page = await this.context.newPage();
            // 🚫 Do NOT go to UI_BASE_URL here — stay blank
            await this.page.goto('about:blank');
        } catch (err) {
            // @ts-ignore
            console.warn('⚠️ Context/Page creation failed:', err?.message || err);
            return;
        }

        // 4️⃣ Reset any world data
        this.cleanupSubmissionIds?.clear?.();
        this.submissionReference = undefined;
        this.submissionPeriod = undefined;
        this.officeAccount = undefined;
        this.matterStartCounts = undefined;

        await this.attach('🧭 Blank context created and ready.', 'text/plain');
        console.log(`✅ Blank environment ready for: ${this.currentScenarioName}`);
    } catch (outerErr) {
        // @ts-ignore
        console.error('💥 Unexpected error in Before hook:', outerErr?.message || outerErr);
    }
});


After({tags: 'not @api'}, async function (this: World) {
    try {
        if (this.context) await this.context.close();
        if (this.browser) await this.browser.close();
        console.log('🧹 Closed browser and context after scenario');
    } catch (err) {
        console.warn('⚠️ Error closing browser context:', err);
    }
});

AfterStep({tags: 'not @api'}, async function (this: World, step) {
    if (step.result?.status === Status.FAILED && this.page) {
        const rawName = step.pickle?.name ?? 'failed-step';
        const sanitized = rawName.replace(/[^A-Za-z0-9-_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'failed-step';
        const screenshotPath = `reports/attachments/${Date.now()}-${sanitized}.png`;
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
            .forEach((f) => fs.unlinkSync(path.join(os.tmpdir(), f)));

        await submissionCleanupManager.destroy();
    } catch (err) {
        console.warn('⚠️ Error during global cleanup:', err);
    } finally {
        await destroySubmissionPeriodManager();
    }
});
