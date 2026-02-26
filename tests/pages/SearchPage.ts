import {Page, Locator, expect} from '@playwright/test';
import {BasePage} from './BasePage';
import {goToPaginationPage} from "../utils/scripts/pageNavigation";

export class SearchPage extends BasePage {
  private submissionPeriodInput: Locator;
  private areaOfLawInput: Locator;
  private submissionOutcomeSucceededInput: Locator;
  private submissionOutcomeFailedInput: Locator;
  private submissionOutcomeAllInput: Locator;
  private chooseOfficeAccountsDetails: Locator;
  private officeAccountLegend: Locator;
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
    this.submissionPeriodInput = page.locator('#submission-period');
    this.areaOfLawInput = page.locator('#area-of-law');
    this.submissionOutcomeSucceededInput = page.locator('#succeeded-radio-option');
    this.submissionOutcomeFailedInput = page.locator('#failed-radio-option');
    this.submissionOutcomeAllInput = page.locator('#all-radio-option');
    this.clearAllLink = page.getByRole('link', {name: 'Clear all'});
    this.fieldErrorMessages = page.locator('.govuk-error-message');
    this.chooseOfficeAccountsDetails = page.locator('#choose-office-account-details-summary');
    this.officeAccountLegend = page.locator('#office-account-legend');

    // --- Results locators ---
    this.resultsHeading = page.locator('#results-heading');
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
      'Submission period',
      'Status'
    ];
    const actualHeaders = await this.tableHeaders.allInnerTexts();
    expect(actualHeaders.map(h => h.trim())).toEqual(expectedHeaders);
  }


  // --- Actions ---
  async selectSubmissionPeriod(period: string) {
    if (period) {
      await this.submissionPeriodInput.fill(period);
      await this.submissionPeriodInput.press('Enter');
    }
  }

  async selectAreaOfLaw(areaOfLaw: string) {
    if (areaOfLaw) {
      await this.areaOfLawInput.selectOption(areaOfLaw);
    }
  }

  async selectSucceededSubmissionOutcomeRadio() {
    await this.submissionOutcomeSucceededInput.click();
  }

  async selectFailedSubmissionOutcomeRadio() {
    await this.submissionOutcomeFailedInput.click();
  }

  async selectAllSubmissionOutcomeRadio() {
    await this.submissionOutcomeAllInput.click();
  }

  async selectCorrespondingSubmissionStatus(submissionStatus: string) {
    if (submissionStatus) {
      if(submissionStatus === 'VALIDATION_SUCCEEDED'){
        await this.selectSucceededSubmissionOutcomeRadio();
      }else{
        await this.selectFailedSubmissionOutcomeRadio();
      }
    } else{
      await this.selectAllSubmissionOutcomeRadio();
    }
  }

  async selectOfficeAccount(officeAccount: string) {
    if (officeAccount) {
      await this.deselectAllOfficeAccounts();
      await this.page.locator(`input[value="${officeAccount}"]`).click();
    }
  }

  async deselectAllOfficeAccounts() {
    if (!await this.officeAccountLegend.isVisible()) {
      await this.chooseOfficeAccountsDetails.click();
    }
    const checkedOfficeAccounts = this.page.locator('.govuk-checkboxes__input:checked');

    while (await checkedOfficeAccounts.count() > 0) {
      await checkedOfficeAccounts.first().uncheck();
    }
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
    await expect(this.submissionPeriodInput).toHaveValue('');
    await expect(this.areaOfLawInput).toHaveValue('All');
    await expect(this.submissionOutcomeSucceededInput).toBeChecked({checked: true});
    await expect(this.submissionOutcomeAllInput).toBeChecked({checked: false});
  }

  // --- Results ---
  async expectResultsVisible() {
    await this.resultsHeading.waitFor({state: 'visible', timeout: 10000});
    await expect(this.resultsHeading).toContainText('Search result');
    await expect(this.resultsTable).toBeVisible();
  }

  async expectResultCount(count: number) {
    await expect(this.resultsHeading).toContainText(`${count} Search result`);
  }

  async expectResultStatus(expectedStatus: string) {
    await expect(this.firstResultStatus).toContainText(expectedStatus, {ignoreCase: true});
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
      if (!(await goToPaginationPage(this.page, 'next'))) {
        break;
      }
      pageNumber++;
    }

    console.log(`✅ Finished pagination. Total collected IDs: ${ids.size}`);
    return Array.from(ids);
  }

  async verifyNoSubmissionsMessage() {
    const noResults = this.page.locator('p.govuk-body', {hasText: 'No submissions were found.'});
    await expect(noResults).toBeVisible({timeout: 5000});
    console.log('✅ Verified that "No submissions were found." message is displayed');
  }

}