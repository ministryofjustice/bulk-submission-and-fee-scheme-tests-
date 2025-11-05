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
import World from './world';
import * as fs from 'fs';
import * as path from 'path';
import os from 'os';
import { chromium } from 'playwright';
import dotenv from 'dotenv';
import { Local } from 'browserstack-local';
import { createDataSourceManager } from '../../utils/db/dataSourceManager';
import { cleanSubmissionData } from '../../utils/scripts/cleanup-submissions';
import { destroySubmissionPeriodManager } from '../../utils/scripts/submissionPeriodHelper';

dotenv.config();
setDefaultTimeout(60 * 1000);

const submissionCleanupManager = createDataSourceManager({ label: 'submissionCleanup' });
let bsLocal: any;

// ---------- BrowserStack Local Setup ----------
BeforeAll(async function () {
  bsLocal = new Local();
  console.log('🔌 Starting BrowserStack Local...');
  await new Promise<void>((resolve, reject) => {
    // @ts-ignore
    bsLocal.start({ key: process.env.BROWSERSTACK_ACCESS_KEY }, (err) => {
      if (err) return reject(err);
      console.log('✅ BrowserStack Local tunnel established');
      resolve();
    });
  });

  // Clear attachments directory
  const dir = path.join(process.cwd(), 'reports', 'attachments');
  try {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    console.log(`🧹 Cleared attachments: ${path.relative(process.cwd(), dir)}`);
  } catch (err) {
    console.warn('⚠️ Could not initialize attachments directory:', err);
  }
});

// ---------- UI Hooks ----------
Before({ tags: 'not @api' }, async function (this: World, scenario: ITestCaseHookParameter) {
  this.currentScenarioName = scenario.pickle.name || 'UnnamedScenario';

  // --- Connect to BrowserStack ---
  (global as any).__browsers = (global as any).__browsers || {};
  let browser = (global as any).__browsers[process.pid];

  if (!browser) {
    const caps = {
      browser: 'chrome',
      browser_version: 'latest',
      os: 'osx',
      os_version: 'big sur',
      name: this.currentScenarioName,
      build: 'playwright-cucumber-browserstack-build',
      'browserstack.username': process.env.BROWSERSTACK_USERNAME,
      'browserstack.accessKey': process.env.BROWSERSTACK_ACCESS_KEY,
      'browserstack.local': true,
      'browserstack.console': 'errors',
      'browserstack.networkLogs': false,
    };

    const wsEndpoint = `wss://cdp.browserstack.com/playwright?caps=${encodeURIComponent(
        JSON.stringify(caps)
    )}`;

    console.log(`🔗 Connecting to BrowserStack via WebSocket...`);
    browser = await chromium.connect({ wsEndpoint });
    (global as any).__browsers[process.pid] = browser;

    console.log(`🌐 Connected to BrowserStack Chrome for PID ${process.pid}`);
  } else {
    console.log(`♻️ Reusing existing BrowserStack browser for PID ${process.pid}`);
  }

  this.browser = browser;
  await this.attach('🌐 Browser launched for scenario', 'text/plain');

  // --- Context Setup ---
  const globalStorage = path.resolve('storageState.json');
  const workerStorage = path.resolve(os.tmpdir(), `storageState-${process.pid}.json`);

  if (fs.existsSync(globalStorage) && !fs.existsSync(workerStorage)) {
    fs.copyFileSync(globalStorage, workerStorage);
  }

  this.context = await this.browser!.newContext({
    baseURL: process.env.UI_BASE_URL,
    storageState: fs.existsSync(workerStorage) ? workerStorage : undefined,
  });

  this.page = await this.context.newPage();
  this.cleanupSubmissionIds.clear();
  this.submissionReference = undefined;
  this.submissionPeriod = undefined;
  this.officeAccount = undefined;
  this.matterStartCounts = undefined;

  await this.attach(`🧭 New isolated context created for: ${scenario.pickle.name}`, 'text/plain');
});

After({ tags: 'not @api' }, async function (this: World) {
  try {
    if (this.context) {
      await this.context.close();
      this.context = undefined;
    }
    console.log('🧹 Closed browser context after scenario');
  } catch (err) {
    console.warn('⚠️ Error closing browser context:', err);
  }
});

After({ tags: '@matterStarts' }, async function (this: World) {
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

AfterStep({ tags: 'not @api' }, async function (this: World, step) {
  if (step.result?.status === Status.FAILED && this.page) {
    const rawName = step.pickle?.name ?? 'failed-step';
    const sanitizedStepName =
        rawName
            .trim()
            .replace(/[^A-Za-z0-9-_]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') || 'failed-step';
    const screenshotPath = `reports/attachments/${Date.now()}-${sanitizedStepName}.png`;
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
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

    const globalBrowsers = (global as any).__browsers;
    if (globalBrowsers) {
      for (const [pid, browser] of Object.entries(globalBrowsers)) {
        // @ts-ignore
        if (browser && browser.isConnected()) {
          // @ts-ignore
          await browser.close();
          console.log(`🧹 Closed browser for worker PID: ${pid}`);
        }
      }
      delete (global as any).__browsers;
    } else {
      console.log('ℹ️ No global browsers to close');
    }

    // Stop BrowserStack Local if running
    if (bsLocal && bsLocal.isRunning()) {
      console.log('🛑 Stopping BrowserStack Local...');
      await new Promise<void>((resolve) => bsLocal.stop(() => resolve()));
      console.log('✅ BrowserStack Local stopped');
    }
  } catch (err) {
    console.warn('⚠️ Failed to close browsers after all tests:', err);
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
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${Date.now()}.${label}.md`);
    fs.writeFileSync(file, content, 'utf8');
    console.warn(`⚠️ wrote attachment to ${file}`);
  }
}

// ---------- Attach API Failure Evidence ----------
AfterStep({ tags: '@api' }, async function (this: World, step: ITestStepHookParameter) {
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
After({ tags: '@api' }, async function (this: World, scenario: ITestCaseHookParameter) {
  if (scenario.result?.status === Status.FAILED) return;

  const payloadBlock = this.requestBody
      ? `### Request Payload\n\`\`\`json\n${JSON.stringify(this.requestBody, null, 2)}\n\`\`\`\n\n`
      : '### Request Payload\n(none)\n\n';

  const responseBlock = this.response
      ? `### Response\n- Status: ${this.response.status}\n- Body:\n\`\`\`json\n${JSON.stringify(this.response.data, null, 2)}\n\`\`\`\n`
      : '### Response\n(none)\n';

  await safeAttach(this, 'api-test-evidence', `## API Test Evidence\n\n${payloadBlock}${responseBlock}`);
});
