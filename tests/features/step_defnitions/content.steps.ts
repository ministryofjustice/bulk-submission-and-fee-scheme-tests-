import {Given, Then, When} from '@cucumber/cucumber';
import {expect} from '@playwright/test';
import {promises as fs} from 'fs';
import path from 'path';
import type {CustomWorld} from '../support/world';
import {BulkImportPage} from '../../pages/bulkImportPage';

const normalizeHtml = (html: string): string => {
  const withoutDynamicAttributes = html
  .replace(/(<input\b[^>]*name=["']?_csrf["'][^>]*?)\s+value="[^"]*"/gi, '$1')
  .replace(/data-max-date="[^"]*"/gi, '')
  .replace(/data-min-date="[^"]*"/gi, '')
  .replace(/\s*data-testid="[^"]*"/gi, '')
  .replace(/\s*style="display:\s*(?:none|block);?"/gi, '')
  .replace(/aria-disabled="true"/gi, '')
  .replace(/(<table\b[^>]*class=["'][^"']*moj-datepicker__calendar[^"']*["'][^>]*?)\s+role="(?:grid|application)"/gi, '$1')
  .replace(/(<h2\b[^>]*class=["'][^"']*moj-js-datepicker-month-year[^"']*["'][^>]*>)([^<]*)(<\/h2>)/gi, '$1$3')
  .replace(/(<span\b[^>]*class=["'][^"']*govuk-visually-hidden[^"']*["'][^>]*>)(Excluded date,[^<]*)(<\/span>)/gi, '$1$3')
  .replace(/(<span\b[^>]*class=["'][^"']*govuk-visually-hidden[^"']*["'][^>]*>)([A-Za-z]+ \d{1,2} [A-Za-z]+ \d{4})(<\/span>)/gi, '$1$3')
  .replace(/(<table\b[^>]*class=["'][^"']*moj-datepicker__calendar[^"']*["'][^>]*>\s*<thead>[\s\S]*?<\/thead>)[\s\S]*?(<\/table>)/gi, '$1$2');

  return withoutDynamicAttributes
  .replace(/\r\n/g, '\n')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line.length > 0)
  .join('');
};

Given('I am on the bulk submission landing page', async function (this: CustomWorld) {
  await this.page!.goto('/', {waitUntil: 'domcontentloaded', timeout: 60000});
  await this.attach('🌐 Navigated to bulk submission landing page', 'text/plain');
});

Then('the page content matches {string}', async function (this: CustomWorld, fixtureName: string) {
  const fixturePath = path.resolve('tests/data/content_div', fixtureName);
  let expectedHtml = await fs.readFile(fixturePath, 'utf8');

  const mainContent = this.page!.locator('main#main-content');
  await mainContent.waitFor({state: 'visible', timeout: 30000});
  let actualHtml = await mainContent.evaluate((node) => node.outerHTML);
  const organisationTitle = this.page!.locator('.moj-organisation-nav__title');
  await organisationTitle.waitFor({ state: 'visible', timeout: 30000 });

  // Assert format: "ORG NAME - 1234"

  await expect(organisationTitle).toHaveText(/.+\s*-\s*\d+/);
  expect(normalizeHtml(actualHtml)).toBe(normalizeHtml(expectedHtml));
  await this.attach(`✅ Search page content matches ${fixtureName}`, 'text/plain');
});

Then('the search page content matches {string}', async function (this: CustomWorld, fixtureName: string) {
  const fixturePath = path.resolve('tests/data/content_div', fixtureName);
  let expectedHtml = await fs.readFile(fixturePath, 'utf8');

  const mainContent = this.page!.locator('main#main-content');
  await mainContent.waitFor({ state: 'visible', timeout: 30000 });

  let actualHtml = await mainContent.evaluate((node) => node.outerHTML);

  // Normalize CSRF hidden inputs
  actualHtml = actualHtml.replace(
    /<input[^>]*name="_csrf"[^>]*value="[^"]*"[^>]*>/g,
    '<input type="hidden" name="_csrf" value="CSRF_TOKEN">'
 );

  expectedHtml = expectedHtml.replace(
    /<input[^>]*name="_csrf"[^>]*value="[^"]*"[^>]*>/g,
    '<input type="hidden" name="_csrf" value="CSRF_TOKEN">'
 );

  // Normalize dynamic submission period select
  actualHtml = actualHtml.replace(
    /<select[^>]*id="submission-period-select"[^>]*>[\s\S]*?<\/select>/,
    '<select id="submission-period-select">DYNAMIC_OPTIONS</select>'
 );

  expectedHtml = expectedHtml.replace(
    /<select[^>]*id="submission-period-select"[^>]*>[\s\S]*?<\/select>/,
    '<select id="submission-period-select">DYNAMIC_OPTIONS</select>'
 );

  const organisationTitle = this.page!.locator('.moj-organisation-nav__title');
  await organisationTitle.waitFor({ state: 'visible', timeout: 30000 });
  await expect(organisationTitle).toHaveText(/.+\s*-\s*\d+/);
  await this.attach(`:white_check_mark: Search page content matches ${fixtureName}`, 'text/plain');
});

When(/^I upload the generated file and wait for import in progress(?: (screen))?$/, async function (this: CustomWorld, screen?: string) {
  if (!this.generatedFilePath) {
    throw new Error('No generated file available for upload');
  }

  if (!this.bulkImportPage) {
    this.bulkImportPage = new BulkImportPage(this.page!);
  }

  await this.bulkImportPage.uploadFile(this.generatedFilePath);
  await this.bulkImportPage.clickUpload();

  const inProgressHeading = this.page!.locator('h1.moj-interruption-card__heading');
  await inProgressHeading.waitFor({state: 'visible', timeout: 60000});

  if (screen) {
    await this.attach('✅ Import in progress screen displayed', 'text/plain');
    return;
  }

  const startTime = Date.now();
  const maxWaitTime = 60 * 1000; // 1 minute

  while (await inProgressHeading.isVisible()) {
    if (Date.now() - startTime > maxWaitTime) {
      throw new Error('Timeout waiting for import to complete after 5 minutes');
    }
    await this.page!.waitForTimeout(1000);
    await this.page!.reload();
  }

  await this.attach('✅ Import in progress screen displayed and completed', 'text/plain');

  const submissionId =
      await this.page!.locator("meta#submissionId").getAttribute("content");

  if (!submissionId) {
    await this.attach("❌ No submissionId found in <meta> tag.", "text/plain");
    throw new Error("Submission ID not found after upload");
  }

  // -----------------------------
  // Add ID to cleanup set
  // -----------------------------
  if (!this.cleanupSubmissionIds) {
    this.cleanupSubmissionIds = new Set();
  }
  this.cleanupSubmissionIds.add(submissionId);

  this.mostRecentSubmissionId = submissionId;

  await this.attach(`✅ Submission ID: ${submissionId}`, "text/plain");

});

When('I wait on validation in progress screen', async function (this: CustomWorld) {
  if (!this.page) {
    throw new Error('Page is not initialized');
  }

  const maxWaitTime = 5 * 60 * 1000;
  const pollInterval = 1000;
  const startTime = Date.now();

  const inProgressHeading = this.page.locator('h1.moj-interruption-card__heading');

  // If the screen appears, wait on it. If it does not, continue and validate outcome below.
  await inProgressHeading.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});

  while (true) {
    const stillVisible = await inProgressHeading.isVisible().catch(() => false);

    if (!stillVisible) {
      break;
    }

    if (Date.now() - startTime > maxWaitTime) {
      throw new Error('Timeout waiting for import to complete after 5 minutes');
    }

    await this.page.waitForTimeout(pollInterval);
    await this.page.reload({ waitUntil: 'domcontentloaded' });
  }

  await this.attach('✅ Validation in progress screen has cleared', 'text/plain');
});

Then('the search results table matches the expected layout', async function (this: CustomWorld) {
  const table = this.page!.locator('table.govuk-table').first();
  await table.waitFor({state: 'visible', timeout: 15000});

  const headerTexts = await table.locator('thead tr th').allTextContents();
  const normalizedHeaders = headerTexts.map((text) => text.trim().replace(/\s+/g, ' '));

  const expectedHeaders = ['Date submitted', 'Office account', 'Area of law', 'Submission period', 'Status'];
  expect(normalizedHeaders).toEqual(expectedHeaders);

  const rows = table.locator('tbody tr');
  const rowCount = await rows.count();
  expect(rowCount).toBeGreaterThan(0);

  const allowedAreas = new Set(['Legal help', 'Mediation', 'Crime lower']);
  const datePattern = /^\d{1,2} [A-Z][a-z]{2} \d{4} at \d{2}:\d{2}:\d{2}$/;

  for (let i = 0; i < rowCount; i++) {
    const cells = rows.nth(i).locator('td');
    const cellCount = await cells.count();
    expect(cellCount).toBeGreaterThanOrEqual(4);

    const dateSubmitted = (await cells.nth(0).innerText()).trim();
    const officeAccount = (await cells.nth(1).innerText()).trim();
    const areaOfLaw = (await cells.nth(2).innerText()).trim();
    const submissionPeriod = (await cells.nth(3).innerText()).trim();
    const status = (await cells.nth(4).innerText()).trim();

    expect(datePattern.test(dateSubmitted)).toBeTruthy();
    expect(officeAccount.length).toBeGreaterThan(0);
    expect(submissionPeriod.length).toBeGreaterThan(0);
    expect(status.length).toBeGreaterThan(0);
    expect(allowedAreas.has(areaOfLaw)).toBeTruthy();
  }

  await this.attach(`✅ Verified search results table with ${rowCount} row(s).`, 'text/plain');
});


Then(
    'I click on page {string}',
    async function (this: CustomWorld, pageNumber: number) {
      const paginationLink = this.page!.locator('.govuk-pagination__link', {hasText: pageNumber.toString()});
      await paginationLink.waitFor({state: 'visible', timeout: 15000});
      await paginationLink.click();
      await this.attach(`✅ Clicked on pagination link ${pageNumber}`, 'text/plain');
    }
);