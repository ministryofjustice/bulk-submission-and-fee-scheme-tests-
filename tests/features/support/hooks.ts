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
} from '@cucumber/cucumber';
import World from './world';
import * as fs from 'fs';
import * as path from 'path';

setDefaultTimeout(60 * 1000);

// ---------- Clear Down ----------
BeforeAll(function () {
const dir = path.join(process.cwd(), 'reports', 'attachments');
  try {
    fs.rmSync(dir, { recursive: true, force: true }); // clear old attachments
    fs.mkdirSync(dir, { recursive: true });           // recreate
    // eslint-disable-next-line no-console
    console.log(`🧹 cleared attachments: ${path.relative(process.cwd(), dir)}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Could not initialize attachments directory:', err);
  }
});
// ---------- UI hooks ----------
Before({ tags: '@ui' }, async function (this: World) {
  await this.openBrowser();
});

After({ tags: '@ui' }, async function (this: World) {
  await this.browser?.close();
});

// ---------- helpers ----------
function scenarioSlug(s: ITestCaseHookParameter | ITestStepHookParameter) {
  const name = s.pickle?.name ?? 'scenario';
  const id = s.pickle?.id ?? '';
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + (id ? `-${id}` : '')
  );
}

async function safeAttach(world: World, label: string, content: string) {
  if (typeof world.attach === 'function') {
    await world.attach(content, 'text/markdown');
  } else {
    // fallback: dump into file
    const dir = path.join(process.cwd(), 'reports', 'attachments');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${Date.now()}.${label}.md`);
    fs.writeFileSync(file, content, 'utf8');
    console.warn(`⚠️ wrote attachment to ${file}`);
  }
}

// ---------- attach on failing API step ----------
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

// ---------- attach at end of failing API scenario (backup) ----------
After({ tags: '@api' }, async function (this: World, scenario: ITestCaseHookParameter) {
  if (scenario.result?.status == Status.FAILED) return;

  const payloadBlock = this.requestBody
    ? `### Request Payload\n\`\`\`json\n${JSON.stringify(this.requestBody, null, 2)}\n\`\`\`\n\n`
    : '### Request Payload\n(none)\n\n';

  const responseBlock = this.response
    ? `### Response\n- Status: ${this.response.status}\n- Body:\n\`\`\`json\n${JSON.stringify(this.response.data, null, 2)}\n\`\`\`\n`
    : '### Response\n(none)\n';

  await safeAttach(this, 'api-test-evidence', `## API Test Evidence\n\n${payloadBlock}${responseBlock}`);
});
