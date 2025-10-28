import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

class BulkInProgressPage extends BasePage {
  private pageHeading: Locator; // renamed to avoid conflict
  private dateOfUpload: Locator;
  private submissionReference: Locator;
  private fileName: Locator;
  private goToSearchButton: Locator;
  private copyRefButton: Locator;

  constructor(page: Page) {
    super(page, 'Bulk Submission In Progress', 'Your file is being uploaded');
    this.pageHeading = page.locator('h1.moj-interruption-card__heading'); // updated
    this.dateOfUpload = page.locator('#bulk-submission-date');
    this.submissionReference = page.locator('#bulk-submission-id');
    this.fileName = page.locator('#bulk-submission-file-name');
    this.goToSearchButton = page.locator('#go-to-search-button');
    this.copyRefButton = page.locator('a:has-text("Copy submission reference")');
  }

  async waitForPage() {
    await this.pageHeading.waitFor({ state: 'visible' });
  }

  async getHeading(): Promise<string> {
    return this.pageHeading.innerText();
  }

  async getDateOfUpload(): Promise<string> {
    return this.dateOfUpload.innerText();
  }

  async getSubmissionReference(): Promise<string> {
    return this.submissionReference.innerText();
  }

  async getFileName(): Promise<string> {
    return this.fileName.innerText();
  }

  async clickGoToSearch() {
    await this.goToSearchButton.click();
  }

  async clickCopyReference() {
    await this.copyRefButton.click();
  }

  async isGoToSearchVisible(): Promise<boolean> {
    return this.goToSearchButton.isVisible();
  }

  async isCopyRefVisible(): Promise<boolean> {
    return this.copyRefButton.isVisible();
  }
}

export { BulkInProgressPage };
