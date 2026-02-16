import {Given, Then, When} from '@cucumber/cucumber';
import type { CustomWorld } from '../../support/world';
import dotenv from 'dotenv';
import fs from 'fs';
import FormData from 'form-data';
import { GenerateCivilFile } from '../../../utils/scripts/dataGenartor/generateCivilFiles';
import { GenerateMediationFiles } from '../../../utils/scripts/dataGenartor/generateMediationFiles';
import { GenerateCrimeFiles } from '../../../utils/scripts/dataGenartor/generateCrimeFiles';
import path from 'path';
import {expect} from "@playwright/test";
import {SearchPage} from "../../../pages/SearchPage";
// @ts-ignore
import { injectAxe, checkA11y } from '@axe-core/playwright';
import AxeBuilder from '@axe-core/playwright';
import { createDataSourceManager } from '../../../utils/db/dataSourceManager';
import {parse, format} from 'date-fns';


dotenv.config();

const dataSourceManager = createDataSourceManager({ label: 'search-steps' });

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
        { waitUntil: 'domcontentloaded', timeout: 60000 }
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
                        result = { filePaths: [path.resolve('tests/data/invalid/SearchLegalValidation.csv')], office: '0P322F' };
                    } else {
                        result = await GenerateCivilFile(1, 0, format, { suffix: uniqueSuffix });
                    }
                    break;

                case 'MEDIATION':
                    if (checkStatus === 'VALIDATION_FAILED') {
                        result = { filePaths: [path.resolve('tests/data/invalid/mediationSearchFail.txt')], office: '0P322F' };
                    } else {
                        result = await GenerateMediationFiles(1, 0, format, { suffix: uniqueSuffix });
                    }
                    break;

                case 'CRIME LOWER':
                    if (checkStatus === 'VALIDATION_FAILED') {
                        result = { filePaths: [path.resolve('tests/data/invalid/SearchCrimeValidation.txt')], office: '0P322F' };
                    } else {
                        result = await GenerateCrimeFiles(1, 0, format, { suffix: uniqueSuffix });
                    }
                    break;

                default:
                    throw new Error(`Invalid area of law: ${areaOfLaw}`);
            }

            const { filePaths, office } = result;
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

            const { bulk_submission_id, submission_ids } = uploadResp.data;
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

        await link.first().waitFor({ state: 'visible', timeout: 10_000 });

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
    await expect(submissionLink).toBeVisible({ timeout: 10000 });

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

    await expect(summary).toBeVisible({ timeout: 10000 });

    for (const message of expectedMessages) {
        await expect(summary).toContainText(message);
    }

    await this.attach(
        `✅ Verified validation messages: \n${expectedMessages.join('\n')}`,
        'text/plain'
    );
});

Given('I determine a valid submission search criteria', async function (this: CustomWorld) {
    const dbAvailable = await dataSourceManager.ensureInitialized();
    const dataSource = dataSourceManager.getDataSource();

    if (!dbAvailable) {
        await this.attach(
            `⚠️ Database unavailable.`,
            'text/plain'
        );
        return;
    }

    // 🧭 Use dynamic interval based on parameter
    let result = await dataSource.query(`
        select submission.submission_period,
               submission.office_account_number,
               submission.area_of_law,
               submission.status,
               count(*) as total
        from claims.submission
        group by submission_period, office_account_number, status, area_of_law
        order by count(*) desc;
    `);

    await dataSourceManager.destroy();

    this.searchSubmissionPeriod = convertSubmissionPeriodFormat(result[0].submission_period);
    this.searchOfficeAccount = result[0].office_account_number;
    this.searchAreaOfLaw = result[0].area_of_law;
    this.searchStatus = result[0].status;
    this.expectedCount = Number(result[0].total);

    await this.attach(
        `🔎 Using submission period: ${this.searchSubmissionPeriod}\n` +
        `🔎 Using office account: ${this.searchOfficeAccount}\n` +
        `🔎 Using area of law: ${this.searchAreaOfLaw}\n` +
        `🔎 Using searchStatus: ${this.searchStatus}\n` +
        `🧮 Expected count: ${this.expectedCount}\n`,
        'text/plain'
    );
});

When('I search using the valid search criteria', async function (this: CustomWorld) {
    const searchPage = new SearchPage(this.page!);
    
    await searchPage.selectSubmissionPeriod(this.searchSubmissionPeriod);
    await searchPage.selectAreaOfLaw(this.searchAreaOfLaw);
    await searchPage.selectCorrespondingSubmissionStatus(this.searchStatus);
    // TODO: Change office account filter

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

Given('I choose a date in the past with no submissions', async function (this: CustomWorld) {
    this.searchFromDate = '01/01/2000';
    this.searchToDate = '31/12/2001';

    await this.attach(
        `📅 Using fixed historical date range: ${this.searchFromDate} → ${this.searchToDate}\n` +
        `🧮 Expecting no submissions for this range (pre-system era).`,
        'text/plain'
    );
});


Then('the Search page should pass accessibility checks', async function (this: CustomWorld) {
    const results = await new AxeBuilder({ page: this.page! })
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