import { BasePage } from './BasePage';
import { Locator, Page } from '@playwright/test';

class BulkImportPage extends BasePage {
  private fileInput: Locator;
  private uploadButton: Locator;

  constructor(page: Page) {
    super(page, "Bulk import", "Continue");
    this.fileInput = page.locator('#file-input-input'); // hidden actual input
    this.uploadButton = page.locator('button.govuk-button', { hasText: 'Upload' });
    this.errorSummary = page.locator('#error-summary');


  }

  async uploadFile(filePath: string) {
    await this.fileInput.setInputFiles(filePath);
  }

  async clickUpload() {
    await this.uploadButton.click();
  }

  async checkErrorMessage(expectedMessage: string) {
    await this.errorSummary.waitFor(); // inherited from BasePage
    const text = await this.errorSummary.textContent();
    return text?.includes(expectedMessage);
  }
}

export { BulkImportPage };
