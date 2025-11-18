import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import {goToPaginationPage} from "../utils/scripts/pageNavigation";

export class SearchPage extends BasePage {
  private submittedDateFromInput: Locator;
  private submittedDateToInput: Locator;
  private submissionReferenceInput: Locator;
  private clearAllLink: Locator;
  private fieldErrorMessages: Locator;

  // --- Results locators ---
  private resultsHeading: Locator;
  private resultsTable: Locator;
  private firstResultLink: Locator;
  private firstResultStatus: Locator;
  private tableRows: Locator;
  private tableHeaders: Locator;

  constructor(page: Page) {
    super(page, 'Search for a submission', 'Search');

    // --- Page-specific locators ---
    this.submittedDateFromInput = page.locator('#submittedDateFrom-input');
    this.submittedDateToInput = page.locator('#submittedDateTo-input');
    this.submissionReferenceInput = page.locator('#submissionId-input');
    this.clearAllLink = page.getByRole('link', { name: 'Clear all' });
    this.fieldErrorMessages = page.locator('.govuk-error-message');

    // --- Results locators ---
    this.resultsHeading = page.locator('h2.govuk-heading-m');
    this.resultsTable = page.locator('table.govuk-table');
    this.firstResultLink = page.locator('table.govuk-table tbody tr:first-child td:first-child a');
    this.firstResultStatus = page.locator('table.govuk-table tbody tr:first-child td:last-child');
    this.tableRows = page.locator('table.govuk-table tbody tr');
    this.tableHeaders = page.locator('table.govuk-table thead th');
  }

  async expectSingleSearchResult() {
    await expect(this.tableRows).toHaveCount(1);
  }

  async expectTableHasCorrectHeaders() {
    const expectedHeaders = [
      'Date submitted',
      'Office account',
      'Area of law',
      'Status'
    ];
    const actualHeaders = await this.tableHeaders.allInnerTexts();
    expect(actualHeaders.map(h => h.trim())).toEqual(expectedHeaders);
  }


  // --- Actions ---
  async enterSubmittedDateFrom(date: string) {
    await this.submittedDateFromInput.fill(date);
  }

  async enterSubmittedDateTo(date: string) {
    await this.submittedDateToInput.fill(date);
  }

  async enterSubmissionReference(ref: string) {
    await this.submissionReferenceInput.fill(ref);
  }

  async clickClearAll() {
    await this.clearAllLink.click();
  }

  // --- Assertions ---
  async expectValidationSummaryVisible() {
    await expect(this.errorSummary).toBeVisible();
  }

  async expectValidationErrorMessage(text: string) {
    await expect(this.fieldErrorMessages).toContainText(text);
  }

  async expectErrorForInvalidToDateFormat() {
    await expect(this.errorSummary).toContainText(
        'Enter the submission to date in the correct format, for example, 17/5/2024'
    );
  }

  async expectErrorForMissingToDate() {
    await expect(this.errorSummary).toContainText(
        'Enter the submission to date when you enter a submission from date.'
    );
  }

  async expectNoErrors() {
    const errorCount = await this.errorSummary.count();
    expect(errorCount).toBe(0);
  }

  async expectFieldValueCleared() {
    await expect(this.submittedDateFromInput).toHaveValue('');
    await expect(this.submittedDateToInput).toHaveValue('');
    await expect(this.submissionReferenceInput).toHaveValue('');
  }

  // --- Results ---
  async expectResultsVisible() {
    await this.resultsHeading.waitFor({ state: 'visible', timeout: 10000 });
    await expect(this.resultsHeading).toContainText('Search result');
    await expect(this.resultsTable).toBeVisible();
  }

  async expectResultCount(count: number) {
    await expect(this.resultsHeading).toContainText(`${count} Search result`);
  }

  async expectResultStatus(expectedStatus: string) {
    await expect(this.firstResultStatus).toContainText(expectedStatus, { ignoreCase: true });
  }

  async expectSubmissionLinkMatches(submissionId: string) {
    await expect(this.firstResultLink).toHaveAttribute('href', new RegExp(submissionId));
  }

  async openFirstResult() {
    await this.firstResultLink.click();
  }

  async collectAllVisibleSubmissionIds(): Promise<string[]> {
    const ids = new Set<string>();
    let pageNumber = 1;

    while (true) {
      // 🧾 Collect all submission links currently visible
      const links = this.page.locator('table.govuk-table tbody tr td a[href*="/submission/"]');
      const count = await links.count();

      for (let i = 0; i < count; i++) {
        const href = await links.nth(i).getAttribute('href');
        const id = href?.split('/').pop();
        if (id) ids.add(id);
      }

      console.log(`📄 Page ${pageNumber}: Collected ${count} IDs (${ids.size} total)`);

      // 🧩 If <10 rows, or no pagination visible, stop
      if (count < 10) break;

      // 🧭 Find the “Next” link by rel="next"
      if(!(await goToPaginationPage(this.page, 'next'))) {
          break;
      }
      pageNumber++;
    }

    console.log(`✅ Finished pagination. Total collected IDs: ${ids.size}`);
    return Array.from(ids);
  }

  async verifyFutureDatesDisabled(dateField: 'from' | 'to') {
    // Identify correct toggle and calendar
    const toggleSelector =
        dateField === 'from'
            ? 'button[aria-controls="datepicker-submittedDateFrom-input"]'
            : 'button[aria-controls="datepicker-submittedDateTo-input"]';

    const calendarSelector =
        dateField === 'from'
            ? '.moj-datepicker__calendar[aria-labelledby="datepicker-title-submittedDateFrom-input"]'
            : '.moj-datepicker__calendar[aria-labelledby="datepicker-title-submittedDateTo-input"]';

    const toggle = this.page.locator(toggleSelector);
    const calendar = this.page.locator(calendarSelector);

    // 🧭 Ensure picker is open (click only if not visible)
    if (!(await calendar.isVisible())) {
      await toggle.focus();
      await toggle.press('Enter'); // less flaky than click
      await expect(calendar).toBeVisible({ timeout: 5000 });
    }

    // Determine tomorrow’s date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const formatted = `${tomorrow.getDate()}/${tomorrow.getMonth() + 1}/${tomorrow.getFullYear()}`;

    const tomorrowCell = calendar.locator(`button[data-testid="${formatted}"]`);

    // Capture screenshot with open picker for debugging
    await this.page.screenshot({
      path: `reports/attachments/date-picker-${dateField}-${Date.now()}.png`,
      fullPage: true,
    });

    // Check if the cell is disabled
    const isDisabled =
        (await tomorrowCell.getAttribute('disabled')) !== null ||
        (await tomorrowCell.getAttribute('aria-disabled')) === 'true';

    // Close picker gracefully
    await this.page.keyboard.press('Escape');
    await expect(calendar).toBeHidden({ timeout: 3000 });

    // Assert and log
    expect(isDisabled).toBeTruthy();
    console.log(`✅ Verified future date ${formatted} is disabled in ${dateField} picker`);
  }

  async verifyNoSubmissionsMessage() {
    const noResults = this.page.locator('p.govuk-body', { hasText: 'No submissions were found.' });
    await expect(noResults).toBeVisible({ timeout: 5000 });
    console.log('✅ Verified that "No submissions were found." message is displayed');
  }

}