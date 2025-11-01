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
import axios from 'axios';
import { runSubmissionCleanup } from "../../utils/scripts/cleanup-submissions";
import {chromium, firefox, webkit} from "playwright";

setDefaultTimeout(60 * 1000);

// ---------- Clear Down ----------
BeforeAll(function () {
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

  // Worker metadata
  const workerIndex = parseInt(process.env.CUCUMBER_WORKER_ID || '0', 10);
  const totalWorkers = parseInt(process.env.CUCUMBER_PARALLEL_TOTAL || process.env.THREADS || '4', 10);

  // Dynamic stagger timing: spread out startup load
  const baseDelay = Math.max(2000, 15000 / totalWorkers);
  const jitter = Math.floor(Math.random() * 2000) - 1000;
  const delayMs = workerIndex * baseDelay + jitter;

  if (delayMs > 0) {
    console.log(`⏳ Worker ${workerIndex}/${totalWorkers} waiting ${Math.round(delayMs / 1000)}s before starting`);
    await new Promise((res) => setTimeout(res, delayMs));
  }

  // 🧩 Choose a browser based on worker index (Chromium, Firefox, WebKit rotation)
  const browsers = [chromium, firefox, webkit];
  const browserType = browsers[workerIndex % browsers.length];
  console.log(`🌐 Worker ${workerIndex} launching ${browserType.name()} browser`);

  // Launch browser dynamically
  await this.openBrowser(browserType);
  await this.attach(`🌐 ${browserType.name()} launched for scenario with PID ${this.pid}`, 'text/plain');

  // 🗂️ Pick a random pre-generated auth state file (if exists)
  const statesDir = path.resolve('tests/auth-states');
  let selectedState: string | undefined;

  if (fs.existsSync(statesDir)) {
    const allStates = fs.readdirSync(statesDir).filter((f) => f.endsWith('.json'));
    if (allStates.length > 0) {
      selectedState = path.join(statesDir, allStates[Math.floor(Math.random() * allStates.length)]);
      console.log(`🔑 Using pre-generated auth state: ${path.basename(selectedState)}`);
    }
  }

  // 🚀 Create isolated context using that storage state (if available)
  this.context = await this.browser!.newContext({
    baseURL: process.env.UI_BASE_URL,
    storageState: selectedState,
  });

  // 🧭 New page per scenario
  this.page = await this.context.newPage();
  await this.attach(`🧭 New isolated context created for: ${scenario.pickle.name}`, 'text/plain');
});

// ---------- Per-scenario cleanup ----------
After({ tags: 'not @api' }, async function (this: World) {
  try {
    // 🧹 First, clear page-level caches if still open
    if (this.page) {
      try {
        await this.page.evaluate(async () => {
          localStorage.clear();
          sessionStorage.clear();
          if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((key) => caches.delete(key)));
          }
          const dbs = await indexedDB.databases();
          await Promise.all(dbs.map((db) => db.name && indexedDB.deleteDatabase(db.name)));
        });
        console.log(`🧽 Cleared local/session storage, caches, and IndexedDB`);
      } catch (err) {
        console.warn('⚠️ Failed to clear in-page storage:', err);
      }

      await this.page.close();
      this.page = undefined;
    }

    // 🧩 Clear cookies + permissions before closing context
    if (this.context) {
      try {
        await this.context.clearCookies();
        await this.context.clearPermissions();
        console.log(`🧽 Cleared cookies and permissions`);
      } catch (err) {
        console.warn('⚠️ Failed to clear context data:', err);
      }

      await this.context.close();
      this.context = undefined;
    }

    // 🌐 Finally close browser
    if (this.browser) {
      await this.browser.close();
      console.log(`🧹 Closed remote browser for PID ${this.pid}`);
      this.browser = undefined;
    }
  } catch (err) {
    console.warn('⚠️ Error closing browser/context:', err);
  }
});

// ---------- Screenshot on failed step ----------
AfterStep({ tags: 'not @api' }, async function (this: World, step: ITestStepHookParameter) {
  if (step.result?.status === Status.FAILED && this.page) {
    const rawName = step.pickle?.name ?? 'failed-step';
    const sanitizedStepName = rawName
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

// ---------- Global cleanup ----------
AfterAll(async function () {
  try {
    // Remove temp submission period files
    const files = fs.readdirSync(os.tmpdir());
    files
        .filter((f) => f.endsWith('_used_submission_periods.json'))
        .forEach((f) => {
          fs.unlinkSync(path.join(os.tmpdir(), f));
          console.log(`🧹 Deleted cache file: ${f}`);
        });

    // Scenario summary
    const registry = (global as any).__scenarioRegistry || {};
    const entries = Object.entries(registry);
    if (entries.length) {
      console.log('\n📊 Scenario-to-PID mapping summary:');
      console.table(entries.map(([pid, name]) => ({ PID: pid, Scenario: name })));
    } else {
      console.log('ℹ️ No scenarios were registered.');
    }
  } catch (err) {
    console.warn('⚠️ Failed to clean up after all tests:', err);
  }

  console.log('\n🧼 Starting database cleanup for test submissions...');
  await runSubmissionCleanup();
  console.log('✅ Database cleanup finished.');

  // Remote grid health check
  if (process.env.REMOTE_URL) {
    try {
      const jsonUrl = process.env.REMOTE_URL.replace('ws://', 'http://').replace('/playwright', '/json/list');
      const { data } = await axios.get(jsonUrl);
      console.log(`🌐 Active remote browser sessions after cleanup: ${data.length}`);
    } catch {
      console.warn('⚠️ Could not verify remote grid state.');
    }
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
