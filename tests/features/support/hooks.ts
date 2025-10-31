// // tests/features/support/hooks.ts
// import {
//   BeforeAll,
//   Before,
//   After,
//   AfterStep,
//   setDefaultTimeout,
//   Status,
//   ITestCaseHookParameter,
//   ITestStepHookParameter, AfterAll,
// } from '@cucumber/cucumber';
// import World from './world';
// import * as fs from 'fs';
// import * as path from 'path';
// import os from "os";
//
// setDefaultTimeout(60 * 1000);
//
// // ---------- Clear Down ----------
// BeforeAll(function () {
//   const dir = path.join(process.cwd(), 'reports', 'attachments');
//   try {
//     fs.rmSync(dir, { recursive: true, force: true });
//     fs.mkdirSync(dir, { recursive: true });
//     console.log(`🧹 Cleared attachments: ${path.relative(process.cwd(), dir)}`);
//   } catch (err) {
//     console.warn('⚠️ Could not initialize attachments directory:', err);
//   }
// });
//
// Before({ tags: 'not @api' }, async function (this: World, scenario) {
//   this.currentScenarioName = scenario.pickle.name || 'UnnamedScenario';
//   if (!this.browser) {
//     await this.openBrowser();
//     await this.attach('🌐 Browser launched for worker', 'text/plain');
//   }
//
//   const globalStorage = path.resolve('storageState.json');
//   const workerStorage = path.resolve(os.tmpdir(), `storageState-${process.pid}.json`);
//
//   if (fs.existsSync(globalStorage) && !fs.existsSync(workerStorage)) {
//     fs.copyFileSync(globalStorage, workerStorage);
//   }
//
//   this.context = await this.browser!.newContext({
//     baseURL: process.env.UI_BASE_URL,
//     storageState: fs.existsSync(workerStorage) ? workerStorage : undefined,
//   });
//
//   this.page = await this.context.newPage();
//   await this.attach(`🧭 New isolated context created for: ${scenario.pickle.name}`, 'text/plain');
// });
//
// After({ tags: 'not @api' }, async function (this: World) {
//   try {
//     if (this.context) {
//       await this.context.close();
//       this.context = undefined;
//     }
//     console.log('🧹 Closed browser context after scenario');
//   } catch (err) {
//     console.warn('⚠️ Error closing browser context:', err);
//   }
// });
//
// AfterStep({ tags: 'not @api' }, async function (this: World, step) {
//   if (step.result?.status === Status.FAILED && this.page) {
//     const rawName = step.pickle?.name ?? 'failed-step';
//     const sanitizedStepName =
//         rawName
//             .trim()
//             .replace(/[^A-Za-z0-9-_]+/g, '-')
//             .replace(/-+/g, '-')
//             .replace(/^-|-$/g, '') || 'failed-step';
//     const screenshotPath = `reports/attachments/${Date.now()}-${sanitizedStepName}.png`;
//     await this.page.screenshot({ path: screenshotPath, fullPage: true });
//     await this.attach(fs.readFileSync(screenshotPath), 'image/png');
//     console.log(`📸 Screenshot captured for failed step: ${screenshotPath}`);
//   }
// });
//
// AfterAll(async function () {
//   try {
//     const files = fs.readdirSync(os.tmpdir());
//     files
//         .filter(f => f.endsWith('_used_submission_periods.json'))
//         .forEach(f => {
//           fs.unlinkSync(path.join(os.tmpdir(), f));
//           console.log(`🧹 Deleted cache file: ${f}`);
//         });
//     const globalBrowsers = (global as any).__browsers;
//     if (globalBrowsers) {
//       for (const [pid, browser] of Object.entries(globalBrowsers)) {
//         // @ts-ignore
//         if (browser && browser.isConnected()) {
//           // @ts-ignore
//           await browser.close();
//           console.log(`🧹 Closed browser for worker PID: ${pid}`);
//         }
//       }
//       delete (global as any).__browsers;
//     } else {
//       console.log('ℹ️ No global browsers to close');
//     }
//   } catch (err) {
//     console.warn('⚠️ Failed to close browsers after all tests:', err);
//   }
// });
//
// // ---------- API Evidence Helpers ----------
// async function safeAttach(world: World, label: string, content: string) {
//   if (typeof world.attach === 'function') {
//     await world.attach(content, 'text/markdown');
//   } else {
//     const dir = path.join(process.cwd(), 'reports', 'attachments');
//     fs.mkdirSync(dir, { recursive: true });
//     const file = path.join(dir, `${Date.now()}.${label}.md`);
//     fs.writeFileSync(file, content, 'utf8');
//     console.warn(`⚠️ wrote attachment to ${file}`);
//   }
// }
//
// // ---------- Attach API Failure Evidence ----------
// AfterStep({ tags: '@api' }, async function (this: World, step: ITestStepHookParameter) {
//   if (step.result?.status !== Status.FAILED) return;
//
//   const payloadBlock = this.requestBody
//       ? `### Request Payload\n\`\`\`json\n${JSON.stringify(this.requestBody, null, 2)}\n\`\`\`\n\n`
//       : '### Request Payload\n(none)\n\n';
//
//   const responseBlock = this.response
//       ? `### Response\n- Status: ${this.response.status}\n- Body:\n\`\`\`json\n${JSON.stringify(this.response.data, null, 2)}\n\`\`\`\n`
//       : '### Response\n(none)\n';
//
//   await safeAttach(this, 'api-failure', `## API Failure Context\n\n${payloadBlock}${responseBlock}`);
// });
//
// // ---------- Attach API Evidence at Scenario End ----------
// After({ tags: '@api' }, async function (this: World, scenario: ITestCaseHookParameter) {
//   if (scenario.result?.status == Status.FAILED) return;
//
//   const payloadBlock = this.requestBody
//       ? `### Request Payload\n\`\`\`json\n${JSON.stringify(this.requestBody, null, 2)}\n\`\`\`\n\n`
//       : '### Request Payload\n(none)\n\n';
//
//   const responseBlock = this.response
//       ? `### Response\n- Status: ${this.response.status}\n- Body:\n\`\`\`json\n${JSON.stringify(this.response.data, null, 2)}\n\`\`\`\n`
//       : '### Response\n(none)\n';
//
//   await safeAttach(this, 'api-test-evidence', `## API Test Evidence\n\n${payloadBlock}${responseBlock}`);
// });


// tests/features/support/hooks.ts


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
import {runSubmissionCleanup} from "../../utils/scripts/cleanup-submissions";

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

  // Launch a new browser and incognito context per scenario
  await this.openBrowser();
  await this.attach(`🌐 Browser launched for scenario with PID ${this.pid}`, 'text/plain');

  const globalStorage = path.resolve('storageState.json');
  const storageState = fs.existsSync(globalStorage) ? globalStorage : undefined;

  this.context = await this.browser!.newContext({
    baseURL: process.env.UI_BASE_URL,
    storageState,
  });

  this.page = await this.context.newPage();
  await this.attach(`🧭 New isolated context created for: ${scenario.pickle.name}`, 'text/plain');
});

After({ tags: 'not @api' }, async function (this: World) {
  try {
    if (this.context) {
      await this.context.close();
      this.context = undefined;
    }
    if (this.browser) {
      await this.browser.close();
      console.log(`🧹 Closed browser for PID ${this.pid}`);
      this.browser = undefined;
    }
  } catch (err) {
    console.warn('⚠️ Error closing browser/context:', err);
  }
});

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

AfterAll(async function () {
  try {
    // Clean temp files
    const files = fs.readdirSync(os.tmpdir());
    files
        .filter((f) => f.endsWith('_used_submission_periods.json'))
        .forEach((f) => {
          fs.unlinkSync(path.join(os.tmpdir(), f));
          console.log(`🧹 Deleted cache file: ${f}`);
        });

    // Print PID registry summary
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