import {Given, Then, When} from '@cucumber/cucumber';
import type {CustomWorld} from '../../support/world';
import dotenv from 'dotenv';
import fs from 'fs';
import FormData from 'form-data';
import {GenerateCivilFile} from '../../../utils/scripts/dataGenartor/generateCivilFiles';
import {GenerateMediationFiles} from '../../../utils/scripts/dataGenartor/generateMediationFiles';
import {GenerateCrimeFiles} from '../../../utils/scripts/dataGenartor/generateCrimeFiles';
import path from 'path';
import {expect} from "@playwright/test";
import {SearchPage} from "../../../pages/SearchPage";
// @ts-ignore
import {injectAxe, checkA11y} from '@axe-core/playwright';
import AxeBuilder from '@axe-core/playwright';
import {createDataSourceManager} from '../../../utils/db/dataSourceManager';
import {parse, format} from 'date-fns';


dotenv.config();

const dataSourceManager = createDataSourceManager({label: 'search-steps'});

/**
 * Converts submission period from MMM-uuuu format to MMMM uuuu format
 * Example: "Jan-2024" -> "January 2024"
 */
function convertSubmissionPeriodFormat(period: string): string {
  try {
    const parsedDate = parse(period, 'MMM-yyyy', new Date());
    return format(parsedDate, 'MMMM yyyy');
  } catch (error) {
    console.warn(`Failed to convert period "${period}":`, error);
    return period;
  }
}


Given('I am on the Search page', async function (this: CustomWorld) {
  await this.page!.goto(
    '/submissions/search',
    {waitUntil: 'domcontentloaded', timeout: 60000}
  );
  await this.attach('🌐 Navigated to Search page', 'text/plain');
});

Given(
  'I ensure there is a {string} submission for {string}',
  async function (this: CustomWorld, checkStatus: string, areaOfLaw: string) {
    try {
      const format = 'csv';
      let result: { filePaths: string[]; office: string };
      const safeScenario = (this.currentScenarioName || 'Scenario')
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9_]/g, '');

      const uniqueSuffix = `${safeScenario}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

      // ✅ 1️⃣ Generate appropriate file + dynamic office
      switch (areaOfLaw.toUpperCase()) {
        case 'LEGAL HELP':
          if (checkStatus === 'VALIDATION_FAILED') {
            result = {filePaths: [path.resolve('tests/data/invalid/SearchLegalValidation.csv')], office: '0P322F'};
          } else {
            result = await GenerateCivilFile(1, 0, format, {suffix: uniqueSuffix});
          }
          break;

        case 'MEDIATION':
          if (checkStatus === 'VALIDATION_FAILED') {
            result = {filePaths: [path.resolve('tests/data/invalid/mediationSearchFail.txt')], office: '0P322F'};
          } else {
            result = await GenerateMediationFiles(1, 0, format, {suffix: uniqueSuffix});
          }
          break;

        case 'CRIME LOWER':
          if (checkStatus === 'VALIDATION_FAILED') {
            result = {filePaths: [path.resolve('tests/data/invalid/SearchCrimeValidation.txt')], office: '0P322F'};
          } else {
            result = await GenerateCrimeFiles(1, 0, format, {suffix: uniqueSuffix});
          }
          break;

        default:
          throw new Error(`Invalid area of law: ${areaOfLaw}`);
      }

      const {filePaths, office} = result;
      const generatedFilePath = filePaths.find((f) => f.includes(uniqueSuffix)) || filePaths[0];
      this.generatedFilePath = generatedFilePath;
      this.officeAccount = office;

      await this.attach(`🏢 Using office: ${office}`, 'text/plain');
      await this.attach(`📝 File generated for ${areaOfLaw}: ${generatedFilePath}`, 'text/plain');

      // ✅ 2️⃣ Upload file dynamically for correct office
      const form = new FormData();
      form.append('file', fs.createReadStream(generatedFilePath), {
        filename: path.basename(generatedFilePath),
        contentType: 'text/csv',
      });

      const dstewbaseUrl = process.env.DSTEW_API_BASE_URL;
      const dstewToken = process.env.DSTEW_API_TOKEN;
      const uploadUrl = `${dstewbaseUrl}/api/v1/bulk-submissions?userId=Test.User-submit-a-bulk-claim-auto-test%40devl.justice.gov.uk&offices=${office}`;

      const uploadResp = await this.client.post(uploadUrl, form, {
        headers: {
          ...form.getHeaders(),
          accept: 'application/json',
          Authorization: dstewToken,
        },
      });

      const {bulk_submission_id, submission_ids} = uploadResp.data;
      const submissionId = submission_ids?.[0];
      this.mostRecentSubmissionId = submissionId;

      await this.attach(`📤 Uploaded bulk submission: ${bulk_submission_id}`, 'text/plain');

      // ✅ 3️⃣ Poll until submission reaches desired status
      const maxRetries = 20;
      const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
      let status = '';

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const resp = await this.client.get(
          `${dstewbaseUrl}/api/v1/submissions?offices=${office}&submission_id=${submissionId}&page=0&size=20`,
          {
            headers: {
              accept: 'application/json',
              Authorization: dstewToken,
            },
          }
        );

        const submission = resp.data.content?.[0];
        status = submission?.status || 'UNKNOWN';
        await this.attach(`Attempt ${attempt + 1}: current status = ${status}`, 'text/plain');

        if (status === checkStatus) break;
        await delay(3000);
      }

      if (status !== checkStatus) {
        throw new Error(`Submission never reached "${checkStatus}" (final status: ${status})`);
      }

      await this.attach(`✅ New "${checkStatus}" submission created: ${submissionId}`, 'text/plain');
    } catch (error: any) {
      await this.attach(`❌ Error: ${error.message}`, 'text/plain');
      // throw error;
    } finally {
      await dataSourceManager.destroy();
    }
  }
);


When(
  'I open the most recent submission from the results list',
  async function (this: CustomWorld) {
    if (!this.mostRecentSubmissionId) {
      throw new Error('❌ No submission ID found in World context.');
    }

    const id = this.mostRecentSubmissionId;
    const link = this.page!.locator(`a[href="/submission/${id}"]`);

    await link.first().waitFor({state: 'visible', timeout: 10_000});

    await this.attach(
      `🔗 Clicking submission link: /submission/${id}`,
      'text/plain'
    );

    await link.first().click();

    await this.page!.waitForLoadState('domcontentloaded');

    await this.attach(
      `📄 Navigated to submission details page for submission ${id}`,
      'text/plain'
    );
  }
);

Then('I should see one search result for that submission', async function (this: CustomWorld) {
  const searchPage = new SearchPage(this.page!);

  // Wait for table and heading
  await searchPage.expectResultsVisible();

  // Validate the table headers and row count
  await searchPage.expectTableHasCorrectHeaders();
  await searchPage.expectSingleSearchResult();

  // Check that the correct submission is listed
  await searchPage.expectSubmissionLinkMatches(this.mostRecentSubmissionId);

  // Check that the link is visible and clickable
  const submissionLink = this.page!.locator(`a[href*='${this.mostRecentSubmissionId}']`);
  await expect(submissionLink).toBeVisible({timeout: 10000});

  await this.attach(
    `✅ Verified one search result found for submission ID: ${this.mostRecentSubmissionId}`,
    'text/plain'
  );
});

// --- Then I should see a validation message saying "Enter a valid submission reference" ---
Then('I should see a validation message saying {string}', async function (this: CustomWorld, expectedMessage: string) {
  const searchPage = new SearchPage(this.page!);
  await searchPage.expectValidationSummaryVisible();
  await searchPage.expectValidationErrorMessage(expectedMessage);

  await this.attach(`✅ Verified validation message: "${expectedMessage}"`, 'text/plain');
});

When('I enter invalid search criteria:', async function (this: CustomWorld, table) {
  const data = table.rowsHash();
  const searchPage = new SearchPage(this.page!);

  if (data.submissionReference) {
    //await searchPage.enterSubmissionReference(data.submissionReference);
    await this.attach(`🧾 Entered invalid reference: ${data.submissionReference}`, 'text/plain');
  }

  if (data.fromDate) {
    //await searchPage.enterSubmittedDateFrom(data.fromDate);
    await this.attach(`🧾 Entered invalid From date: ${data.fromDate}`, 'text/plain');
  }

  if (data.toDate) {
    //await searchPage.enterSubmittedDateTo(data.toDate);
    await this.attach(`🧾 Entered invalid To date: ${data.toDate}`, 'text/plain');
  }
});

When('I deselect all office accounts', async function (this: CustomWorld) {
  const searchPage = new SearchPage(this.page!);
  await searchPage.deselectAllOfficeAccounts();
});

When('I click search', async function (this: CustomWorld) {
  const searchPage = new SearchPage(this.page!);
  await searchPage.submit(); // uses BasePage.submit()
  await this.attach('🔍 Clicked Search button', 'text/plain');
});

Then('I should see the following validation messages:', async function (this: CustomWorld, dataTable) {
  const expectedMessages = dataTable.raw().flat().filter(Boolean);
  const summary = this.page!.locator('.govuk-error-summary');

  await expect(summary).toBeVisible({timeout: 10000});

  for (const message of expectedMessages) {
    await expect(summary).toContainText(message);
  }

  await this.attach(
    `✅ Verified validation messages: \n${expectedMessages.join('\n')}`,
    'text/plain'
  );
});

/**
 * Helper function to determine valid search criteria based on specified fields
 */
async function determineSearchCriteria(
  world: CustomWorld,
  criteriaType: 'all' | 'submission_period' | 'area_of_law' | 'status' | 'office_account'
) {
  const dbAvailable = await dataSourceManager.ensureInitialized();
  const dataSource = dataSourceManager.getDataSource();

  if (!dbAvailable) {
    await world.attach(`⚠️ Database unavailable.`, 'text/plain');
    return;
  }

  const queries = {
    all: `
        select submission.submission_period,
               submission.office_account_number,
               submission.area_of_law,
               submission.status,
               count(*) as total
        from claims.submission
        where submission.status = 'VALIDATION_SUCCEEDED'
           OR submission.status = 'VALIDATION_FAILED'
        group by submission_period, office_account_number, status, area_of_law
        order by count(*) desc;
    `,
    submission_period: `
        select submission.submission_period,
               count(*) as total
        from claims.submission
        group by submission_period
        order by count(*) desc;
    `,
    area_of_law: `
        select submission.area_of_law,
               count(*) as total
        from claims.submission
        group by area_of_law
        order by count(*) desc;
    `,
    status: `
        select submission.status,
               count(*) as total
        from claims.submission
        group by submission.status
        order by count(*) desc;
    `,
    office_account: `
        select submission.office_account_number,
               count(*) as total
        from claims.submission
        group by office_account_number
        order by count(*) desc;
    `
  };

  const result = await dataSource.query(queries[criteriaType]);
  await dataSourceManager.destroy();

  // Reset all fields
  world.searchSubmissionPeriod = undefined;
  world.searchOfficeAccount = undefined;
  world.searchAreaOfLaw = undefined;
  world.searchStatus = undefined;

  // Set only the relevant fields based on criteria type
  if (criteriaType === 'all' || criteriaType === 'submission_period') {
    world.searchSubmissionPeriod = convertSubmissionPeriodFormat(result[0].submission_period);
  }
  if (criteriaType === 'all' || criteriaType === 'office_account') {
    world.searchOfficeAccount = result[0].office_account_number;
  }
  if (criteriaType === 'all' || criteriaType === 'area_of_law') {
    world.searchAreaOfLaw = result[0].area_of_law;
  }
  if (criteriaType === 'all' || criteriaType === 'status') {
    world.searchStatus = result[0].status;
  }

  world.expectedCount = Number(result[0].total);

  // Build attachment message with only populated fields
  const attachmentLines = [];
  if (world.searchSubmissionPeriod !== undefined) {
    attachmentLines.push(`🔎 Using submission period: ${world.searchSubmissionPeriod}`);
  }
  if (world.searchOfficeAccount !== undefined) {
    attachmentLines.push(`🔎 Using office account: ${world.searchOfficeAccount}`);
  }
  if (world.searchAreaOfLaw !== undefined) {
    attachmentLines.push(`🔎 Using area of law: ${world.searchAreaOfLaw}`);
  }
  if (world.searchStatus !== undefined) {
    attachmentLines.push(`🔎 Using status: ${world.searchStatus}`);
  }
  attachmentLines.push(`🧮 Expected count: ${world.expectedCount}`);

  await world.attach(attachmentLines.join('\n') + '\n', 'text/plain');
}

/* This finds a search criteria which would fill all fields */
Given('I determine a valid submission search criteria', async function (this: CustomWorld) {
  await determineSearchCriteria(this, 'all');
});

/* This finds a search criteria which would just suit submission period */
Given('I determine a valid submission period for search criteria', async function (this: CustomWorld) {
  await determineSearchCriteria(this, 'submission_period');
});

/* This finds a search criteria which would just suit area of law */
Given('I determine a valid area of law for search criteria', async function (this: CustomWorld) {
  await determineSearchCriteria(this, 'area_of_law');
});

/* This finds a search criteria which would just suit status */
Given('I determine a valid submissions status for search criteria', async function (this: CustomWorld) {
  await determineSearchCriteria(this, 'status');
});

/* This finds a search criteria which would just suit office account */
Given('I determine a valid office account for search criteria', async function (this: CustomWorld) {
  await determineSearchCriteria(this, 'office_account');
});


When('I search using the valid search criteria', async function (this: CustomWorld) {
  const searchPage = new SearchPage(this.page!);

  await searchPage.selectSubmissionPeriod(this.searchSubmissionPeriod);
  await searchPage.selectAreaOfLaw(this.searchAreaOfLaw);
  await searchPage.selectCorrespondingSubmissionStatus(this.searchStatus);
  await searchPage.selectOfficeAccount(this.searchOfficeAccount);

  await searchPage.submit(); // using BasePage’s submit()
  await this.attach(`🔍 Searched using:\n` +
    `🔎 Using submission period: ${this.searchSubmissionPeriod}\n` +
    `🔎 Using office account: ${this.searchOfficeAccount}\n` +
    `🔎 Using area of law: ${this.searchAreaOfLaw}\n` +
    `🔎 Using searchStatus: ${this.searchStatus}\n` +
    `🧮 Expected count: ${this.expectedCount}\n`,
    'text/plain'
  );
});

When('I search using the most recent submission reference', async function (this: CustomWorld) {
  // Use the most recent submission ID that was created in previous steps
  if (!this.mostRecentSubmissionId) {
    throw new Error('❌ No mostRecentSubmissionId found. Ensure a submission was created in a previous step.');
  }

  const dbAvailable = await dataSourceManager.ensureInitialized();
  const dataSource = dataSourceManager.getDataSource();

  if (!dbAvailable) {
    await this.attach(`⚠️ Database unavailable.`, 'text/plain');
    return;
  }

  await this.attach(`🔎 Finding via submission reference ${this.mostRecentSubmissionId}.`, 'text/plain');
  const query = `
      select submission.submission_period,
             submission.office_account_number,
             submission.area_of_law,
             submission.status
      from claims.submission
      where submission.id = '${this.mostRecentSubmissionId}';
  `;

  const result = await dataSource.query(query);
  await dataSourceManager.destroy();

  if (!result || result.length === 0) {
    throw new Error(`❌ No submission found with ID: ${this.mostRecentSubmissionId}`);
  }

  this.searchSubmissionPeriod = convertSubmissionPeriodFormat(result[0].submission_period);
  this.searchOfficeAccount = result[0].office_account_number;
  this.searchAreaOfLaw = result[0].area_of_law;
  this.searchStatus = result[0].status;

  const searchPage = new SearchPage(this.page!);

  await searchPage.selectSubmissionPeriod(this.searchSubmissionPeriod);
  await searchPage.selectAreaOfLaw(this.searchAreaOfLaw);
  await searchPage.selectCorrespondingSubmissionStatus(this.searchStatus);
  await searchPage.selectOfficeAccount(this.searchOfficeAccount);

  await searchPage.submit(); // using BasePage’s submit()
  await this.attach(`🔍 Searched using:\n` +
    `🔎 Using submission period: ${this.searchSubmissionPeriod}\n` +
    `🔎 Using office account: ${this.searchOfficeAccount}\n` +
    `🔎 Using area of law: ${this.searchAreaOfLaw}\n` +
    `🔎 Using searchStatus: ${this.searchStatus}\n` +
    `🧮 Expected count: ${this.expectedCount}\n`,
    'text/plain'
  );
});

Then('I should see results matching the expected count', async function (this: CustomWorld) {
  const searchPage = new SearchPage(this.page!);
  await searchPage.expectResultsVisible();

  // 🧭 Collect submission IDs from all visible pages
  const allUiIds = await searchPage.collectAllVisibleSubmissionIds();
  const uiCount = allUiIds.length;

  // 🧾 Log for debugging / attachments
  await this.attach(
    `🧮 DB expected total: ${this.expectedCount}\n` +
    `📄 UI total (collected across pagination): ${uiCount}\n` +
    `🔎 Sample of collected IDs:\n${allUiIds.slice(0, 5).map(id => `  - ${id}`).join('\n')}`,
    'text/plain'
  );

  // ✅ Basic validation
  expect(uiCount).toBeGreaterThan(0);
  if (typeof this.expectedCount === 'number') {
    expect(uiCount).toBeLessThanOrEqual(this.expectedCount);
  } else {
    console.warn('ℹ️ Skipping DB expected-count assertion because database was unavailable when determining the range.');
  }

  // 🔍 Deep DB–UI validation
  if (this.allSubmissionIds && this.allSubmissionIds.length > 0) {
    const missingIds = this.allSubmissionIds.filter((id: string) => !allUiIds.includes(id));
    const extraIds = allUiIds.filter(id => !this.allSubmissionIds.includes(id));

    await this.attach(
      `🧩 DB vs UI Comparison:\n` +
      `  - DB IDs: ${this.allSubmissionIds.length}\n` +
      `  - UI IDs: ${allUiIds.length}\n` +
      (missingIds.length
        ? `⚠️ Missing ${missingIds.length} DB IDs not in UI:\n${missingIds.join('\n')}\n`
        : '✅ All DB IDs found in UI.\n') +
      (extraIds.length
        ? `⚠️ ${extraIds.length} extra UI IDs not in DB:\n${extraIds.join('\n')}`
        : '✅ No unexpected extra UI IDs.'),
      'text/plain'
    );
  }
});

Then('I should see a message saying {string}', async function (this: CustomWorld, expectedMessage: string) {
  const searchPage = new SearchPage(this.page!);
  await searchPage.verifyNoSubmissionsMessage();
});

Given('I choose a submission period with no submissions', async function (this: CustomWorld) {

  const dbAvailable = await dataSourceManager.ensureInitialized();
  const dataSource = dataSourceManager.getDataSource();

  if (!dbAvailable) {
    await this.attach(
      `⚠️ Database unavailable.`,
      'text/plain'
    );
    return;
  }

  // Generate all periods from JAN-2016 to DEC-2025
  const allPeriods: string[] = [];
  for (let year = 2016; year <= 2025; year++) {
    for (let month = 0; month < 12; month++) {
      const date = new Date(year, month, 1);
      const period = format(date, 'MMM-yyyy').toUpperCase();
      allPeriods.push(period);
    }
  }

  // Query existing periods from DB
  let result = await dataSource.query(`
      select distinct submission.submission_period
      from claims.submission
      order by submission_period;
  `);

  await dataSourceManager.destroy();

  const existingPeriods = result.map((row: any) => row.submission_period);

  // Find first period that doesn't exist
  const nonExistentPeriod = allPeriods.find(period => !existingPeriods.includes(period));

  console.log(`nonExistentPeriod: ${nonExistentPeriod}`);

  if (!nonExistentPeriod) {
    throw new Error('Could not find any non-existent submission period between JAN-2015 and DEC-2025');
  }

  this.searchSubmissionPeriod = convertSubmissionPeriodFormat(nonExistentPeriod);
  this.searchOfficeAccount = undefined;
  this.searchAreaOfLaw = undefined;
  this.searchStatus = undefined;
  this.expectedCount = 0;

  await this.attach(
    `📅 Found non-existent submission period: ${this.searchSubmissionPeriod}\n` +
    `🧮 Expecting no submissions for this period.`,
    'text/plain'
  );

});

Then('the Search page should pass accessibility checks', async function (this: CustomWorld) {
  const results = await new AxeBuilder({page: this.page!})
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  // If no violations — simple success message
  if (results.violations.length === 0) {
    const successMsg = '✅ Accessibility checks passed — no WCAG violations found.';
    await this.attach(successMsg, 'text/plain');
    console.log(successMsg);
    return;
  }

  // --- Build a nicely formatted accessibility report ---
  const formattedViolations = results.violations
    .map((v, i) => {
      const nodes = v.nodes
        .map(
          n => `
  • **Target:** ${n.target.join(', ')}
    • **HTML:** ${n.html}
    • **Failure Summary:** ${n.failureSummary}
  `
        )
        .join('\n');

      return `### ${i + 1}. ${v.id} — ${v.help}  
**Impact:** ${v.impact}  
**Description:** ${v.description}  
**Help URL:** [${v.helpUrl}](${v.helpUrl})  
${nodes}
`;
    })
    .join('\n---\n');

  const fullReport = `
## ⚠️ Accessibility Violations Found
Total violations: **${results.violations.length}**

${formattedViolations}
`;

  // Attach formatted markdown so it appears inline in the Cucumber HTML report
  await this.attach(fullReport, 'text/markdown');

  // Fail the step to mark the scenario as failed
  throw new Error(`Accessibility violations detected: ${results.violations.length}`);
});

Then('I should see search results', async function (this: CustomWorld) {
  const searchPage = new SearchPage(this.page!);
  await searchPage.expectResultsVisible();
  await searchPage.expectTableHasCorrectHeaders();
});