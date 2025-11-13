import { Then, When } from '@cucumber/cucumber';
import type { DataTable } from '@cucumber/cucumber';
import type { CustomWorld } from '../../support/world';
import { SubmissionSummaryPage } from '../../../pages/SubmissionSummaryPage';
import { expect } from '@playwright/test';
import { ClaimDetailPage } from '../../../pages/ClaimDetailPage';

type SummaryRecord = Record<string, string | undefined>;

const normalizeWhitespace = (text: string) => text.replace(/\s+/g, ' ').trim();

const storeSummaryContext = (world: CustomWorld, summary: SummaryRecord) => {
  const reference = summary['Reference'];
  if (reference) {
    world.cleanupSubmissionIds.add(reference);
    world.submissionReference = reference;
  }

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

    await errorLocator.first().waitFor({ state: 'visible', timeout: 15000 });

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
    async function (this: CustomWorld, areaOfLaw: string,  dataTable) {
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
    this.submissionSummaryPage = new SubmissionSummaryPage(this.page!);

    await this.submissionSummaryPage.verifyErrorBanner(1);

    const errors = await this.submissionSummaryPage.getSubmissionErrors();
    await this.attach(
      `📋 Found ${errors.length} submission error(s).`,
      'text/plain'
    );
    expect(errors.length).toBe(1);

    const submissionPeriod = this.submissionPeriod;


    const requestedFields = [];
    if (dataTable && typeof dataTable.raw === 'function') {
      requestedFields.push(
          ...dataTable
          .raw()
          .flat()
          .map((cell) => cell.trim())
          .filter(Boolean)
      );
    }

    if (requestedFields.length > 0) {
      await this.attach(
        `📥 Additional expectations requested: ${requestedFields.join(', ')}`,
        'text/plain'
      );

      if (requestedFields.includes('submission period')) {
        expect(
          submissionPeriod,
          'Expected a stored submission period from a previous step'
        ).toBeTruthy();
      }
    }

    const expectedMessage = `Submission already exists for Office (${office}), Area of Law (${areaOfLaw.toUpperCase()}), Period (${submissionPeriod})`;
    await this.attach(`Expecting: ${expectedMessage}`, 'text/plain');
    await this.attach(`Actual:    ${errors[0]}`, 'text/plain');

    await this.attach(
      `🔎 Expecting to find message:\n${expectedMessage}`,
      'text/plain'
    );

    const normalizedExpected = normalizeWhitespace(expectedMessage);
    const normalizedErrors = errors.map((err) => normalizeWhitespace(err));
    const match = normalizedErrors.some((err) => err.includes(normalizedExpected));

    expect(
      match,
      `Expected submission error message to include:\n"${expectedMessage}"\n\nFound:\n${errors.join('\n')}`
    ).toBeTruthy();

    await this.attach(
      `✅ Verified submission error for ${areaOfLaw}, period ${submissionPeriod}`,
      'text/plain'
    );

  }
);

Then(
  'I should see a submission error message for {string}',
  async function (this: CustomWorld, areaOfLaw: string, docString: string) {
    const expectedMessage = docString.trim();
    const errorLocator = this.page!.locator(
      '.moj-alert__heading, .govuk-table__cell'
    );

    await errorLocator.first().waitFor({ state: 'visible', timeout: 12000 });
    const text = await errorLocator.allTextContents();

    const match = text.some((t) => t.includes(expectedMessage));

    await this.attach(`🔍 Found error text:\n${text.join('\n')}`, 'text/plain');
    expect(match, `Expected error message not found for ${areaOfLaw}`).toBeTruthy();
  }
);

Then(
  'I should see the following submission error messages for {string}:',
  async function (this: CustomWorld, areaOfLaw: string, dataTable) {
    let allText = await (new SubmissionSummaryPage(this.page!))
        .getPaginatedSubmissionErrors(10)
    const paginationLink = this.page!.locator('.govuk-pagination__link', {hasText: 'Next'});

    while (await paginationLink.isVisible()) {
      await paginationLink.click();
      await this.page!.waitForLoadState('networkidle');
      const nextPageText = await locateErrorMessages(this);
      allText = [...allText, ...nextPageText];
    }

    console.log(`Found ${allText.length} error messages`);
    console.log(allText.join('\n'));
    const expectedMessages = dataTable.raw().flat().slice(1);

    for (const message of expectedMessages) {
      const found = allText.has(message.trim());
      console.log(`Checking for message (${found}): ${message}`);
      expect(
        found,
        `❌ Expected error message not found for ${areaOfLaw}: "${message.trim()}"`
      ).toBeTruthy();
    }
  }
);

Then ('I should see the following submission error messages for the {string}',
    async function (this: CustomWorld, placeHolder: string, dataTable: DataTable) {
        const allText = await locateErrorMessages(this);
        const expectedMessages = dataTable.hashes().map((row) => row['Error Message']);

        for (const message of expectedMessages) {
            let amendedMessage = message;
            if (this.currentSubmissionMonth != null) {
                amendedMessage = message.replace(placeHolder, this.currentSubmissionMonth)
            }
            const found = allText.some((t) => t.includes(amendedMessage.trim()));
            expect(
                found,
                `❌ Expected error message not found for: "${amendedMessage.trim()}"`
            ).toBeTruthy();
        }
    }
)

Then(
  'I should see an error banner saying {string}',
  async function (this: CustomWorld, expectedMessage: string) {
    const bannerLocator = this.page!.locator(
      '.govuk-error-summary, .moj-banner--failure, .moj-alert__heading, [role="alert"]'
    );

    await bannerLocator.first().waitFor({ state: 'visible', timeout: 50000 });

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
      await errorLocator.first().waitFor({ state: 'visible', timeout: 15000 });
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
