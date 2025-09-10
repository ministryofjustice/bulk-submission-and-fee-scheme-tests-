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
    console.log(`🧹 cleared attachments: ${path.relative(process.cwd(), dir)}`);
  } catch (err) {
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

// ---------- Ensure API token for @api ----------
Before({ tags: '@api' }, function (this: World) {
  if (!this.getAuthToken && (this as any).setAuthToken) {
    return;
  }
  if (!this.getAuthToken() && process.env.API_TOKEN) {
    this.setAuthToken(process.env.API_TOKEN);
  }
});

// ---------- helpers ----------
function redactSecrets(text: string) {
  const token = process.env.API_TOKEN;
  let out = text;
  if (token) out = out.split(token).join('***REDACTED***');
  out = out.replace(/Authorization:\s*Bearer\s+[^\s]+/gi, 'Authorization: Bearer ***REDACTED***');
  return out;
}

async function safeAttach(world: World, label: string, content: string) {
  const redacted = redactSecrets(content);
  if (typeof world.attach === 'function') {
    await world.attach(redacted, 'text/markdown');
  } else {
    
    const dir = path.join(process.cwd(), 'reports', 'attachments');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `${Date.now()}.${label}.md`);
    fs.writeFileSync(file, redacted, 'utf8');
    console.warn(` wrote attachment to ${file}`);
  }
}

// ---------- attach on failing API step ----------
AfterStep({ tags: '@api' }, async function (this: World, step: ITestStepHookParameter) {
  if (step.result?.status !== Status.FAILED) return;

  const payloadBlock = this.requestBody
    ? `### Request Payload\n\`\`\`json\n${JSON.stringify(this.requestBody, null, 2)}\n\`\`\`\n\n`
    : '### Request Payload\n(none)\n\n';

  const authLine = this.getAuthToken ? (this.getAuthToken() ? 'Authorization: Bearer ***REDACTED***' : '(no Authorization)') : '(no Authorization)';

  const responseBlock = this.response
    ? `### Response\n- Status: ${this.response.status}\n- Body:\n\`\`\`json\n${JSON.stringify(this.response.data, null, 2)}\n\`\`\`\n`
    : '### Response\n(none)\n';

  const content = `## API Failure Context

### Request
- ${authLine}

${payloadBlock}${responseBlock}`;

  await safeAttach(this, 'api-failure', content);
});

// ---------- attach at end of failing API scenario (backup) ----------
After({ tags: '@api' }, async function (this: World, scenario: ITestCaseHookParameter) {
  if (scenario.result?.status !== Status.FAILED) return; // only on failure

  const payloadBlock = this.requestBody
    ? `### Request Payload\n\`\`\`json\n${JSON.stringify(this.requestBody, null, 2)}\n\`\`\`\n\n`
    : '### Request Payload\n(none)\n\n';

  const authLine = this.getAuthToken ? (this.getAuthToken() ? 'Authorization: Bearer ***REDACTED***' : '(no Authorization)') : '(no Authorization)';

  const responseBlock = this.response
    ? `### Response\n- Status: ${this.response.status}\n- Body:\n\`\`\`json\n${JSON.stringify(this.response.data, null, 2)}\n\`\`\`\n`
    : '### Response\n(none)\n';

  const content = `## API Failure Context (After Scenario)

### Request
- ${authLine}

${payloadBlock}${responseBlock}`;

  await safeAttach(this, 'api-failure-scenario', content);
});
