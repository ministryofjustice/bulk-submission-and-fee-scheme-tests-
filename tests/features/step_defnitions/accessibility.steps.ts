import {Then} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import type {CustomWorld} from '../support/world';
import AxeBuilder from '@axe-core/playwright';
import fs from "fs";
import {addToReport} from "../../utils/scripts/generateAccessibilityReport"; // 1

Then(
    'the page should have no accessibility violations',
    async function (this: CustomWorld) {

      await this.page?.waitForLoadState('networkidle');

      var page = this.page;
      // @ts-ignore
      const accessibilityScanResults = await new AxeBuilder({page})
      .withTags([
        'wcag2a',
        'wcag2aa',
        'wcag21a',
        'wcag21aa',
        'wcag22a',
        'wcag22aa',
        'best-practice'
      ])

      .disableRules(['meta-refresh'])
      .analyze();


      const scenarioName = this.currentScenarioName;

      const sanitized = scenarioName
      ?.replace(/[^A-Za-z0-9-_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'failed-step';

      const screenshotPath = `reports/accessibility/${Date.now()}-${sanitized}.png`;
      await this.page?.screenshot({path: screenshotPath, fullPage: true});
      await this.attach(fs.readFileSync(screenshotPath), 'image/png');

      addToReport(scenarioName, accessibilityScanResults);

      const violationIds = accessibilityScanResults.violations.map(v => v.id).join(', ');
      console.log(`Violations: ${violationIds || 'None'}`);

      expect.soft(accessibilityScanResults.violations, {message: violationIds}).toEqual([]);

      const incompleteIds = accessibilityScanResults.incomplete.map(v => v.id).join(', ');
      console.log(`Incompletes: ${incompleteIds || 'None'}`);
      expect.soft(accessibilityScanResults.incomplete, {message: incompleteIds}).toEqual([]);


    }
);