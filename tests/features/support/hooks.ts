// tests/features/support/hooks.ts
import { Before, After, ITestCaseHookParameter, setDefaultTimeout } from '@cucumber/cucumber';

setDefaultTimeout(60 * 1000);

Before({ tags: "@ui" }, async function () {
  await this.openBrowser();
});

After({ tags: "@ui" }, async function () {
  await this.browser?.close();
});
