import {DataTable, Then} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import type {CustomWorld} from '../support/world';
import AxeBuilder from '@axe-core/playwright';
import fs from "fs";
import {addToReport} from "../../utils/scripts/generateAccessibilityReport"; // 1


async function checkAccessibilityViolations(world: CustomWorld, disabledRules?: string[]) {
  var page = world.page;
  // Wait for the specific element to be present
  await page?.waitForLoadState('networkidle');

  console.log(disabledRules);

  // Wait for common dynamic elements to render
  const selectors = [
    '[id*="datepicker"]',
    '[role="dialog"]',
    '[aria-haspopup]'
  ];

  for (const selector of selectors) {
    await page?.locator(selector).first().waitFor({state: 'attached', timeout: 1000}).catch(() => {
    });
  }

  // @ts-ignore
  let axeBuilder = new AxeBuilder({page})
  .withTags([
    'wcag2a',
    'wcag2aa',
    'wcag21a',
    'wcag21aa',
    'wcag22a',
    'wcag22aa',
    'best-practice'
  ])
  // On the submission being validated page, a meta refresh is being used to reload the
  // page every 10 seconds. This is a known issue, and will be investigated post MVP. This is
  // included within the accessibility statement.
  .exclude('[id="meta-refresh"]')
  // According to GOV.UK, back links do not get added to the `<main>` element. due to this,
  // there is a false positive in which Axe believes it doesn't get contained within a
  // landmark.
  // https://design-system.service.gov.uk/components/back-link/#how-it-works
  .exclude('[id="govuk-back-link-container"]')
  // The MoJ Scrollable pane doesn't work well with some checks, specifically with
  // contrast checks. With this being a false positive, it has been excluded from
  // accessibility checks.
  // https://design-patterns.service.justice.gov.uk/components/scrollable-pane/
  .exclude('[class="moj-scrollable-pane"]')
  // The ellipsis character within the official component, and can fail stricter
  // accessibility as there is a list item with non-text characters. This is okay so is
  // being ignored.
  // https://design-patterns.service.justice.gov.uk/components/pagination/
  .exclude('[class="govuk-pagination__item govuk-pagination__item--ellipses"]');

  if (disabledRules) {
    axeBuilder = axeBuilder.disableRules(disabledRules);
  }

  //.disableRules(['meta-refresh'])
  const accessibilityScanResults = await axeBuilder.analyze();

  const scenarioName = world.currentScenarioName;

  const sanitized = scenarioName
  ?.replace(/[^A-Za-z0-9-_]+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '') || 'failed-step';

  const screenshotPath = `reports/accessibility/${Date.now()}-${sanitized}.png`;
  await world.page?.screenshot({path: screenshotPath, fullPage: true});
  await world.attach(fs.readFileSync(screenshotPath), 'image/png');

  addToReport(scenarioName, accessibilityScanResults);

  const violationIds = accessibilityScanResults.violations.map(v => v.id).join(', ');
  console.log(`Violations: ${violationIds || 'None'}`);

  expect.soft(accessibilityScanResults.violations, {message: violationIds}).toEqual([]);

  const incompleteIds = accessibilityScanResults.incomplete.map(v => v.id).join(', ');
  console.log(`Incompletes: ${incompleteIds || 'None'}`);
  expect.soft(accessibilityScanResults.incomplete, {message: incompleteIds}).toEqual([]);
}

Then(
    'the page should have no accessibility violations',
    async function (this: CustomWorld) {
      await checkAccessibilityViolations(this);
    }
);

Then(
    'the page should have no accessibility violations whilst ignoring the following rules',
    async function (this: CustomWorld, dataTable : DataTable) {
      await checkAccessibilityViolations(this, dataTable.raw()[0]);
    }
);