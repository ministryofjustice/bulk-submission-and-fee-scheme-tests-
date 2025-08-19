import { BasePage } from './BasePage';
import { Locator, Page } from '@playwright/test';

class BulkClaimSubmitPage extends BasePage {
  private submissionAlert: Locator;
  private submissionReference: Locator;
  private submissionDate: Locator;
  private submissionFileName: Locator;

    private importHeader: Locator;
    private progressBar: Locator;

  constructor(page: Page) {
    super(page, 'Submit a bulk claim', 'Submit');

    // Confirmation alert container
    this.submissionAlert = page.locator('div.moj-alert[aria-label*="Submission reference"]');

    // Individual fields
    this.submissionReference = page.locator('#bulk-submission-id');
    this.submissionDate = page.locator('#bulk-submission-date');
    this.submissionFileName = page.locator('#bulk-submission-file-name');

     this.importHeader = page.locator('h1#header', { hasText: 'Import in progress' });
        this.progressBar = page.locator('#progress-bar');
  }

  // Wait for the submission alert to show
  async waitForSubmissionAlert() {
    await this.submissionAlert.waitFor({ state: 'visible' });
  }

  // Get submission reference text
  async getSubmissionReference(): Promise<string> {
    return this.submissionReference.innerText();
  }

  // Get submission date
  async getSubmissionDate(): Promise<string> {
    return this.submissionDate.innerText();
  }

  // Get submission file name
  async getSubmissionFileName(): Promise<string> {
    return this.submissionFileName.innerText();
  }

  async waitForProgressBarVisible() {
    await this.importHeader.waitFor({ state: 'visible' });
    await this.progressBar.waitFor({ state: 'visible' });
  }

   async waitForProgressToComplete() {
      // Wait for the header to be visible first
      await this.waitForProgressBarVisible();

      // Wait until progress bar disappears or completes
      await this.progressBar.waitFor({ state: 'hidden' });
    }
}

export { BulkClaimSubmitPage };
