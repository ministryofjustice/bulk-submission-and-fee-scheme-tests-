import type {DataTable} from '@cucumber/cucumber';
import {Then, When} from '@cucumber/cucumber';
import type {CustomWorld} from '../../support/world';
import {SubmissionSummaryPage} from '../../../pages/SubmissionSummaryPage';
import {expect} from '@playwright/test';
import {ClaimDetailPage} from '../../../pages/ClaimDetailPage';

type SummaryRecord = Record<string, string | undefined>;

const normalizeWhitespace = (text: string) => text.replace(/\s+/g, ' ').trim();

const storeSummaryContext = (world: CustomWorld, summary: SummaryRecord) => {
  const reference = summary['Reference'];
  if (reference) {
    world.cleanupSubmissionIds.add(reference);
    world.submissionReference = reference;
  }

    const asCurrency = (value?: string) =>
        value && value.trim() !== ''
            ? `£${Number(value).toFixed(2)}`
            : '';

  const account = summary['Account'];
  if (account) {
    world.officeAccount = account;
  }

  const submissionPeriod = summary['Submission period'];
  if (submissionPeriod) {
    world.submissionPeriod = submissionPeriod;
  }
};

const locateErrorMessages = async (world: CustomWorld) => {
  const errorLocator = world.page!.locator(
      '.moj-alert__heading, .govuk-table__cell, .govuk-error-summary, .moj-banner--failure, [role="alert"]'
  );

  await errorLocator.first().waitFor({state: 'visible', timeout: 15000});

  const allText = await errorLocator.allTextContents();
  await world.attach(
      `🧾 Found error text:\n${allText.join('\n')}`,
      'text/plain'
  );

  return allText;
}

Then(
    'I should see the submission summary for {string}',
    async function (this: CustomWorld, areaOfLaw: string) {
      const summaryPage = new SubmissionSummaryPage(this.page!);
      this.submissionSummaryPage = summaryPage;

      await summaryPage.verifySuccessBanner();

      const summary = await summaryPage.validateSummary(areaOfLaw);
      storeSummaryContext(this, summary);

      await this.attach(
          `✅ Summary validated:\n${JSON.stringify(summary, null, 2)}`,
          'text/plain'
      );
    }
);

Then(
    'I should see the submission summary for {string} with {string} claims',
    async function (this: CustomWorld, areaOfLaw: string, claimCount: string) {
      const summaryPage = new SubmissionSummaryPage(this.page!);
      this.submissionSummaryPage = summaryPage;

      await summaryPage.verifySuccessBanner();

      const summary = await summaryPage.validateSummary(areaOfLaw);
      storeSummaryContext(this, summary);

      const claims = await summaryPage.validateClaimsCount(Number(claimCount));

      await this.attach(
          `✅ Summary validated:\n${JSON.stringify(summary, null, 2)}`,
          'text/plain'
      );
      await this.attach(
          `✅ Claims validated (${claims.length} found)`,
          'text/plain'
      );
    }
);

Then(`There should be {int} warnings`, async function (this: CustomWorld, warningCount: number) {
  const summaryPage = new SubmissionSummaryPage(this.page!);
  this.submissionSummaryPage = summaryPage;

  await summaryPage.verifyWarningBanner(warningCount);
})

Then(
    'The claims should have the following information for {string}:',
    async function (this: CustomWorld, areaOfLaw: string, dataTable) {
      const summaryPage = new SubmissionSummaryPage(this.page!);
      this.submissionSummaryPage = summaryPage;

      const claims = await summaryPage.getClaimsData(areaOfLaw);
      const rows = dataTable.hashes();
      const errors: string[] = [];


      for (const expectedRow of rows) {
        const matchingClaim = claims.find(claim =>
            Object.entries(expectedRow).every(([field, expectedValue]) =>
                claim[field] === expectedValue
            )
        );

        if (!matchingClaim) {
          errors.push(
              `No matching claim found for expected values: ${JSON.stringify(expectedRow)}`
          );
        }
      }

      if (rows.length !== claims.length) {
        errors.push(
            `Expected ${rows.length} claims but found ${claims.length}`
        );
      }

      if (errors.length > 0) {
        throw new Error(
            `❌ Claim validation failed:\n${errors.join('\n')}\n\nFound claims:\n${JSON.stringify(claims, null, 2)}`
        );
      }

      await this.attach(`✅ Validated ${claims.length} claims against expected values`, 'text/plain');
    }
);

Then(
    'I should see the submission summary for {string} with no matter starts message',
    async function (this: CustomWorld, areaOfLaw: string) {
      const summaryPage = new SubmissionSummaryPage(this.page!);
      this.submissionSummaryPage = summaryPage;

      await summaryPage.verifySuccessBanner();

      const summary = await summaryPage.validateSummary(areaOfLaw);
      storeSummaryContext(this, summary);

      const message = await summaryPage.validateNoMatterStartsMessage();

      await this.attach(
          `✅ Summary validated:\n${JSON.stringify(summary, null, 2)}`,
          'text/plain'
      );
      await this.attach(
          `✅ Verified no matter starts message:\n${message}`,
          'text/plain'
      );
    }
);

Then(
    'I should see the submission summary for {string} without a matter starts tab',
    async function (this: CustomWorld, areaOfLaw: string) {
      const summaryPage = new SubmissionSummaryPage(this.page!);
      this.submissionSummaryPage = summaryPage;

      await summaryPage.verifySuccessBanner();

      const summary = await summaryPage.validateSummary(areaOfLaw);
      storeSummaryContext(this, summary);

      await summaryPage.ensureMatterStartsTabHidden();

      await this.attach(
          `✅ Summary validated:\n${JSON.stringify(summary, null, 2)}`,
          'text/plain'
      );
      await this.attach('✅ Verified matter starts tab is not present', 'text/plain');
    }
);

Then(
    'I should see the submission summary for {string} with matter starts matching the generated file',
    async function (this: CustomWorld, areaOfLaw: string) {
      const summaryPage = new SubmissionSummaryPage(this.page!);
      this.submissionSummaryPage = summaryPage;

      await summaryPage.verifySuccessBanner();

      const summary = await summaryPage.validateSummary(areaOfLaw);
      storeSummaryContext(this, summary);

      const expectedMatterStarts = this.matterStartCounts || {};
      const areaKey = areaOfLaw.trim().toLowerCase();

      let validationMessage = '';
      if (areaKey === 'mediation') {
        const totalExpected = Object.values(expectedMatterStarts).reduce(
            (acc, value) => acc + value,
            0
        );
        const matterStarts = await summaryPage.getMatterStartsData();
        const totalRow =
            matterStarts.find((row) =>
                row.code.toLowerCase().includes('new matter starts')
            ) ?? matterStarts[0];

        expect(
            totalRow,
            'Expected to find a "New matter starts" total row'
        ).toBeTruthy();
        expect(totalRow?.count).toBe(totalExpected);

        validationMessage = `✅ Mediation matter starts total matched: expected ${totalExpected}, UI ${totalRow?.count}`;
        await this.attach(
            `📋 UI matter starts rows:\n${JSON.stringify(matterStarts, null, 2)}`,
            'text/plain'
        );
      } else {
        const matterStarts = await summaryPage.validateMatterStarts(
            expectedMatterStarts
        );
        validationMessage = `✅ Matter starts per code matched (${Object.keys(expectedMatterStarts).length} codes)`;
        await this.attach(
            `📋 UI matter starts rows:\n${JSON.stringify(matterStarts, null, 2)}`,
            'text/plain'
        );
      }

      await this.attach(
          `✅ Summary validated:\n${JSON.stringify(summary, null, 2)}`,
          'text/plain'
      );
      await this.attach(validationMessage, 'text/plain');
    }
);

Then(
    'I should have {int} submission error for {string}',
    async function (
        this: CustomWorld,
        expectedErrorCount: number,
        areaOfLaw: string,
        dataTable
    ) {
      this.submissionSummaryPage = new SubmissionSummaryPage(this.page!);

      await this.submissionSummaryPage.verifyErrorBanner(expectedErrorCount);

      const errors = await this.submissionSummaryPage.getSubmissionErrors();
      await this.attach(
          `📋 Found ${errors.length} submission error(s).`,
          'text/plain'
      );
      expect(errors.length).toBe(expectedErrorCount);

      const expectedMessages =
          dataTable && typeof dataTable.raw === 'function'
              ? dataTable.raw().flat().slice(1)
              : [];

      for (const message of expectedMessages) {
        const trimmed = message.trim();
        const match = errors.some((error) => error.includes(trimmed));
        expect(
            match,
            `Expected submission error message to include:\n"${trimmed}"\n\nFound:\n${errors.join('\n')}`
        ).toBeTruthy();
      }

      await this.attach(
          `✅ Verified ${errors.length} submission error(s) for ${areaOfLaw}`,
          'text/plain'
      );
    }
);

Then(
    'I should have duplicate submission error for {string} {string}',
    async function (
        this: CustomWorld,
        office: string,
        areaOfLaw: string,
        dataTable?: DataTable
    ) {
      // @ts-ignore
      const locator = this.page.locator('[data-sort-value*="Submission already exists"]');
      const text = (await locator.getAttribute('data-sort-value'))?.trim() || '';
      await this.attach(`🔍 Error detected:\n${text}`, 'text/plain');
      expect(text.toUpperCase()).toContain(areaOfLaw.toUpperCase());
      expect(text).toContain('Submission already exists for Office');
      expect(text).toMatch(/Period \([A-Z]{3}-\d{4}\)/);
      await this.attach(`✅ Duplicate submission error verified`, 'text/plain');
    }
);

Then(
    'I should see a submission error message for {string}',
    async function (this: CustomWorld, areaOfLaw: string, docString: string) {
      const expectedMessage = docString.trim();
      const errorLocator = this.page!.locator(
          '.moj-alert__heading, .govuk-table__cell'
      );

      await errorLocator.first().waitFor({state: 'visible', timeout: 12000});
      const text = await errorLocator.allTextContents();

      const match = text.some((t) => t.includes(expectedMessage));

      await this.attach(`🔍 Found error text:\n${text.join('\n')}`, 'text/plain');
      expect(match, `Expected error message not found for ${areaOfLaw}`).toBeTruthy();
    }
);

Then(
    'I should see the following submission error messages for {string}:',
    async function (this: CustomWorld, areaOfLaw: string, dataTable) {

      const summaryPage = new SubmissionSummaryPage(this.page!);
      const allErrors = await summaryPage.getPaginatedSubmissionErrors(10);

      // Convert Set<string> → normalized array
      const actualMessages = Array.from(allErrors).map(normalize);

      // Extract expected messages from the table
      const expectedMessages = dataTable
      .raw()
      .flat()
      .slice(1)
      .map(normalize);

      const messagesNotFound: Set<string> = new Set();

      for (const expected of expectedMessages) {
        const found = actualMessages.some(actual => actual.includes(expected));

        if (!found) {
          messagesNotFound.add(expected);
        }
      }

      if (messagesNotFound.size > 0) {
        await this.attach(`❌ Missing messages:\n${Array.from(messagesNotFound).join("\n")}`, "text/plain");
        await this.attach(`📄 Actual messages:\n${actualMessages.join("\n")}`, "text/plain");
      }

      expect(
          messagesNotFound.size === 0,
          `❌ ${messagesNotFound.size} submission error messages not found for ${areaOfLaw}:\n${Array.from(messagesNotFound).join('\n')}`
      ).toBeTruthy();
    }
);

/**
 * Normalizes strings so matching is flexible:
 *  - lowercases everything
 *  - collapses multiple spaces to 1
 *  - removes extra punctuation spacing
 *  - trims both ends
 */
function normalize(msg: string): string {
  return msg
  .toLowerCase()
  .replace(/\s+/g, ' ')
  .replace(/\s*\(\s*/g, '(') // remove spaces before "("
  .replace(/\s*\)\s*/g, ')') // remove spaces around ")"
  .trim();
}

Then(
    'I should see the following submission error messages for the {string}',
    async function (this: CustomWorld, placeholder: string, dataTable: DataTable) {
      const allText = await locateErrorMessages(this);
      const expectedRows = dataTable.hashes();

      for (const row of expectedRows) {
        let msg = row['Error Message'].trim();

        if (msg.includes('CURRENT_MONTH')) {
          if (!this.currentSubmissionMonth) {
            throw new Error('currentSubmissionMonth was not set in the scenario.');
          }
          msg = msg.replace('CURRENT_MONTH', this.currentSubmissionMonth);
        }

        const found = allText.some((t) => t.includes(msg));
        expect(found, `❌ Expected error message not found: "${msg}"`).toBeTruthy();
      }
    }
);

Then(
    'I should see an error banner saying {string}',
    async function (this: CustomWorld, expectedMessage: string) {
      const bannerLocator = this.page!.locator(
          '.govuk-error-summary, .moj-banner--failure, .moj-alert__heading, [role="alert"]'
      );

      await bannerLocator.first().waitFor({state: 'visible', timeout: 50000});

      const text = await bannerLocator.allTextContents();
      const found = text.some((t) => t.includes(expectedMessage));

      await this.attach(
          `🔍 Found banner text:\n${text.join('\n')}`,
          'text/plain'
      );
      expect(found, `❌ Expected banner message not found: "${expectedMessage}"`).toBeTruthy();
    }
);

Then(
    'I should now see the following detailed submission error messages for {string}:',
    async function (this: CustomWorld, areaOfLaw: string, docString: string) {
      const expectedMessages = docString
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

      const paginationNext = this.page!.locator('a:has-text("Next")');
      const paginationPrev = this.page!.locator('a:has-text("Previous")');
      const errorLocator = this.page!.locator(
          '.govuk-table__cell, .moj-alert__heading, .govuk-error-summary, .moj-banner--failure, [role="alert"]'
      );

      const collectedText: string[] = [];

      const capturePageErrors = async () => {
        await errorLocator.first().waitFor({state: 'visible', timeout: 15000});
        const text = await errorLocator.allTextContents();
        collectedText.push(
            ...text.map((t) => t.trim()).filter(Boolean)
        );
      };

      await capturePageErrors();

      while (await paginationNext.isVisible()) {
        await paginationNext.click();
        await this.page!.waitForLoadState('networkidle');
        await capturePageErrors();
      }

      if (await paginationPrev.isVisible()) {
        await paginationPrev.click();
        await this.page!.waitForLoadState('networkidle');
      }

      await this.attach(
          `🧾 Collected UI error messages across all pages:\n${collectedText.join('\n')}`,
          'text/plain'
      );

      for (const message of expectedMessages) {
        const found = collectedText.some((t) => t.includes(message));
        expect(
            found,
            `❌ Expected error message not found for ${areaOfLaw}: "${message}"`
        ).toBeTruthy();
      }
    }
);

When('I open the first claim in the submission', async function (this: CustomWorld) {
  if (!this.submissionSummaryPage) {
    throw new Error('Submission summary page is not available. Ensure you opened the submission details first.');
  }

  await this.submissionSummaryPage.openClaimByIndex(0);
  this.claimDetailPage = new ClaimDetailPage(this.page!);
  await this.claimDetailPage.waitForPage();

  await this.attach('📄 Opened the first claim from the submission', 'text/plain');
});

Then('I should see the following fee calculation headings:', async function (this: CustomWorld, dataTable) {
  if (!this.claimDetailPage) {
    if (!this.submissionSummaryPage) {
      throw new Error('Submission summary page is not available, cannot open claim details.');
    }
    await this.submissionSummaryPage.openClaimByIndex(0);
    this.claimDetailPage = new ClaimDetailPage(this.page!);
    await this.claimDetailPage.waitForPage();
  }

  const expectedHeadings: string[] = dataTable.raw().slice(1).map((row: string[]) => row[0].trim().toLowerCase());
  const actualHeadings = (await this.claimDetailPage.getFeeCalculationHeadings()).map(h => h.toLowerCase());

  const missing = expectedHeadings.filter((heading: string) => !actualHeadings.includes(heading));

  expect(missing, `Missing headings: ${missing.join(', ')}`).toHaveLength(0);

  await this.attach(
      `✅ Verified headings:\n${expectedHeadings.join('\n')}`,
      'text/plain'
  );
});

Then('I click the {string} tab', async function (this: CustomWorld, tabName: string) {


  if (!this.submissionSummaryPage) {
    throw new Error('Submission summary page is not available, cannot open claim details.');
  }

  if (tabName == "Messages") {
    await this.submissionSummaryPage.messagesTab.click();
  }else if(tabName == "Matter starts"){
    await this.submissionSummaryPage.matterStartsTab.click();
  }else{
    throw new Error(`Tab ${tabName} not found`);
  }
});


Then(
    'the submission summary total should be {string}',
    async function (this: CustomWorld, expectedTotal: string) {

        const summaryPage = this.submissionSummaryPage!;
        const summary = await summaryPage.getSummaryData();

        expect(summary['Calculated bulk claim value']).toBe(expectedTotal);
    }
);

Then(
    'the claim calculated value should be {string}',
    async function (this: CustomWorld, expected: string) {

        const claims = await this.submissionSummaryPage!.getClaimsData('Legal help');

        expect(claims.length).toBeGreaterThan(0);
        expect(claims[0].value).toBe(expected);
    }
);

When(
    'I view the first claim',
    async function (this: CustomWorld) {
        await this.submissionSummaryPage!.openClaimByIndex(0);
    }
);
