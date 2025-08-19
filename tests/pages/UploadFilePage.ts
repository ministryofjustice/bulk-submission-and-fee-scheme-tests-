import { BasePage } from './BasePage';
import {Locator, Page} from "@playwright/test";

class UploadFilePage extends BasePage{
  private providerDropdown: Locator;
  private nullSubmissionCheckbox: Locator;
  private uploadButton: Locator;
  const bulkImportButton = page.locator('a', { hasText: 'Bulk import' });

  constructor(page: Page) {
    super(page, "Bulk import", "Continue");

    // Initialize additional locators specific to this page
    this.providerDropdown = page.getByRole('combobox', {name: 'Choose provider'});
    this.nullSubmissionCheckbox = page.getByRole('checkbox', {name: 'This only contains null submissions'});
    this.uploadButton = page.locator('#file-upload-1');
  }

  async selectProvider(provider: string) {
    await this.providerDropdown.selectOption(provider);
  }

  async checkNullSubmissionCheckbox(value: boolean) {
    await this.nullSubmissionCheckbox.setChecked(value);
  }
  
  async uploadFile(filePath: string) {
    await this.uploadButton.setInputFiles(filePath);
  }
}

export { UploadFilePage };