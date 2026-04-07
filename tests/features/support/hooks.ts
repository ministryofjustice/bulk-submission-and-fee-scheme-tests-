import {
    BeforeAll,
    Before,
    After,
    AfterStep,
    setDefaultTimeout,
    Status,
    ITestCaseHookParameter,
    ITestStepHookParameter,
    AfterAll, BeforeStep,
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
    
    const dirAtt = path.join(process.cwd(), 'reports', 'attachments');
    try {
        fs.rmSync(dirAtt, {recursive: true, force: true});
        fs.mkdirSync(dirAtt, {recursive: true});
        console.log(`🧹 Cleared attachments: ${path.relative(process.cwd(), dirAtt)}`);
    } catch (err) {
        console.warn('⚠️ Could not initialize attachments directory:', err);
    }
});

Before({ tags: 'not @api' }, async function (this: World, scenario: ITestCaseHookParameter) {
    this.currentScenarioName = scenario.pickle.name || 'UnnamedScenario';
    console.log(`\n🚀 Preparing blank browser for: ${this.currentScenarioName}`);
    console.log(`📌 Scenario tags: ${scenario.pickle.tags.map((t) => t.name).join(', ') || '(none)'}`);

    try {
        try {
            console.log('🌐 Launching browser...');
            await this.openBrowser();
            console.log('✅ Browser launched');
        } catch (err) {
            // @ts-ignore
            console.warn('⚠️ Browser launch failed:', err?.message || err);
            this.browser = undefined;
            return;
        }

        const uniqueId = `${process.pid}-${Math.random().toString(36).slice(2, 8)}`;
        const globalStorage = path.resolve('storageState.json');
        const workerStorage = path.resolve(os.tmpdir(), `storageState-${uniqueId}.json`);

        console.log(`🧾 Global storage state path: ${globalStorage}`);
        console.log(`🧾 Worker storage state path: ${workerStorage}`);
        console.log(`🔎 storageState.json exists before copy: ${fs.existsSync(globalStorage)}`);

        if (fs.existsSync(globalStorage)) {
            try {
                fs.copyFileSync(globalStorage, workerStorage);
                this.workerStoragePath = workerStorage;

                const workerStats = fs.statSync(workerStorage);
                console.log(`✅ Copied storage state for worker (${workerStats.size} bytes)`);

                // Debug: Log the cookies from the storage state
                try {
                    const storageContent = JSON.parse(fs.readFileSync(workerStorage, 'utf-8'));
                    console.log('[DEBUG] Storage state cookies:');
                    storageContent.cookies?.forEach((cookie: any) => {
                        console.log(`  - ${cookie.name}: domain=${cookie.domain}, value=${cookie.value.substring(0, 20)}...`);
                    });
                } catch (err) {
                    console.warn('⚠️ Could not parse storage state for debugging');
                }
            } catch (err) {
                // @ts-ignore
                console.warn('⚠️ Failed to copy storage state:', err?.message || err);
                this.workerStoragePath = undefined;
            }
        } else {
            console.warn('⚠️ storageState.json was not found, browser will start unauthenticated');
        }

        try {
            console.log(
                `🧪 Creating context with storageState=${this.workerStoragePath ?? 'NONE'} and baseURL=${process.env.UI_BASE_URL || 'about:blank'}`
            );

            this.context = await this.browser!.newContext({
                baseURL: process.env.UI_BASE_URL || 'about:blank',
                storageState: this.workerStoragePath,
            });


            const cookies = await this.context.cookies('http://127.0.0.1:8082');
            console.log('[DEBUG] Cookies Playwright will actually send:', JSON.stringify(cookies));

            this.page = await this.context.newPage();
            console.log(`✅ Context created. Current page URL: ${this.page.url() || '(empty)'}`);

            await this.page.goto('about:blank');
            console.log('📄 Navigated to about:blank');

            this.resetUiObjects();
        } catch (err) {
            // @ts-ignore
            console.warn('⚠️ Context/Page creation failed:', err?.message || err);
            return;
        }

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

AfterStep({ tags: 'not @api' }, async function (this: World, { result }) {
    if (result?.status === Status.FAILED && this.page) {
        const scenarioName = (this.currentScenarioName || 'UnnamedScenario')
            .replace(/[^A-Za-z0-9-_]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        const stepName = (this.stepText || 'failed-step')
            .replace(/[^A-Za-z0-9-_]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        const screenshotDir = path.join(process.cwd(), 'reports', 'attachments', `${process.pid}`);
        fs.mkdirSync(screenshotDir, { recursive: true });

        const screenshotPath = path.join(
            screenshotDir,
            `${scenarioName}__${stepName}__${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.png`
        );

        const screenshot = await this.page.screenshot({
            path: screenshotPath,
            fullPage: true,
        });

        await this.attach(screenshot, 'image/png');
        console.log(`📸 Screenshot captured for failed step: ${screenshotPath}`);
    }
});

After(async function (this: World) {
    try {
        // Nothing to clean?
        if (!this.cleanupSubmissionIds || this.cleanupSubmissionIds.size === 0) {
            return;
        }

        const submissionIds = Array.from(this.cleanupSubmissionIds);

        const cleanupManager = createDataSourceManager({ label: "after_scenario_cleanup" });
        await cleanupManager.ensureInitialized();
        const db = cleanupManager.getDataSource();

        await cleanSubmissionData(db, submissionIds);

        await this.attach(
            `🧹 Cleaned DB submissions: ${submissionIds.join(", ")}`,
            "text/plain"
        );

        console.log(`🧹 Cleaned submissions for scenario: ${submissionIds.join(", ")}`);

    } catch (err) {
        console.error("❌ DB cleanup failed:", err);
        await this.attach(`❌ DB cleanup failed: ${err}`, "text/plain");
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

BeforeStep(function ({ pickleStep }) {
    this.stepText = pickleStep.text;
});
