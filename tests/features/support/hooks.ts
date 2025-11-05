import {
  BeforeAll,
  Before,
  After,
  AfterStep,
  AfterAll,
  setDefaultTimeout,
  Status,
  ITestCaseHookParameter,
  ITestStepHookParameter,
} from '@cucumber/cucumber';
import World from './world';
import * as fs from 'fs';
import * as path from 'path';
import os from 'os';
import { createDataSourceManager } from '../../utils/db/dataSourceManager';
import { cleanSubmissionData } from '../../utils/scripts/cleanup-submissions';
import { destroySubmissionPeriodManager } from '../../utils/scripts/submissionPeriodHelper';

setDefaultTimeout(60 * 1000);

// ---------- DB Cleanup Manager ----------
const submissionCleanupManager = createDataSourceManager({ label: 'submissionCleanup' });

// ---------- Pre-Test Cleanup ----------
BeforeAll(function () {
  const dir = path.join(process.cwd(), 'reports', 'attachments');
  try {
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    console.log(`🧹 Cleared attachments folder: ${path.relative(process.cwd(), dir)}`);
  } catch (err) {
    console.warn('⚠️ Could not initialize attachments directory:', err);
  }
});

// ---------- UI Hooks ----------
Before({ tags: 'not @api' }, async function (this: World, scenario: ITestCaseHookParameter) {
  this.currentScenarioName = scenario.pickle.name || 'UnnamedScenario';

  // 🧩 Create unique ID per worker for parallel safety
  const uniqueId = `${process.pid}-${Math.random().toString(36).slice(2, 8)}`;
  // ✅ Launch browser (local or BrowserStack SDK handles it internally)
  await this.openBrowser();
  await this.attach(`🌐 Browser launched for scenario: ${this.currentScenarioName}`, 'text/plain');

  // ---------- Isolated Storage State ----------
  const globalStorage = path.resolve('storageState.json');
  const workerStorage = path.resolve(os.tmpdir(), `storageState-${uniqueId}.json`);

  if (fs.existsSync(globalStorage)) {
    fs.copyFileSync(globalStorage, workerStorage);
  }

  // ---------- Context & Page ----------
  this.context = await this.browser!.newContext({
    baseURL: process.env.UI_BASE_URL,
    storageState: fs.existsSync(workerStorage) ? workerStorage : undefined,
  });

  this.page = await this.context.newPage();

  // Clear state variables
  this.cleanupSubmissionIds.clear();
  this.submissionReference = undefined;
  this.submissionPeriod = undefined;
  this.officeAccount = undefined;
  this.matterStartCounts = undefined;

  await this.attach(`🧭 Isolated context ready for: ${this.currentScenarioName}`, 'text/plain');
});

After({ tags: 'not @api' }, async function (this: World) {
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
    console.warn('⚠️ Error during browser cleanup:', err);
  }
});

// ---------- Matter Starts Cleanup ----------
After({ tags: '@matterStarts' }, async function (this: World) {
  if (!this.cleanupSubmissionIds || this.cleanupSubmissionIds.size === 0) return;

  const submissionIds = Array.from(this.cleanupSubmissionIds);

  try {
    const ready = await submissionCleanupManager.ensureInitialized();
    if (!ready) {
      await this.attach('⚠️ DB not ready for submission cleanup.', 'text/plain');
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

// ---------- Screenshot on Failure ----------
AfterStep({ tags: 'not @api' }, async function (this: World, step: ITestStepHookParameter) {
  if (step.result?.status === Status.FAILED && this.page) {
    const sanitizedName =
        (step.pickle?.name ?? 'failed-step')
            .trim()
            .replace(/[^A-Za-z0-9-_]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') || 'failed-step';

    const uniqueId = `${process.pid}-${Date.now()}`;
    const screenshotDir = path.join(process.cwd(), 'reports', 'attachments');
    fs.mkdirSync(screenshotDir, { recursive: true });

    const screenshotPath = path.join(screenshotDir, `${uniqueId}-${sanitizedName}.png`);
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    await this.attach(fs.readFileSync(screenshotPath), 'image/png');
    console.log(`📸 Screenshot captured for failed step: ${screenshotPath}`);
  }
});

// ---------- Global Cleanup ----------
AfterAll(async function () {
  try {
    // Remove temp submission cache files
    fs.readdirSync(os.tmpdir())
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
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${Date.now()}.${label}.md`);
    fs.writeFileSync(file, content, 'utf8');
    console.warn(`⚠️ wrote attachment to ${file}`);
  }
}

// ---------- Attach API Evidence ----------
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
