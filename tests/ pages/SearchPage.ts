import { BasePage } from './BasePage';
import {Locator, Page} from "@playwright/test";

class LoginPage extends BasePage{
  private submissionReferenceInput: Locator;
  private importDateFromInput: Locator;
  private importDateToInput: Locator;
  private clearAllLink: Locator;

  constructor(page: Page) {
    super(page, "Search", "Search");

    // Initialize additional locators specific to this page
    this.submissionReferenceInput = page.getByRole('textbox', {name: 'Enter the submission reference or firm office account'});
    this.importDateFromInput = page.getByRole('textbox', {name: 'Submitted date from'});
    this.importDateToInput = page.getByRole('textbox', {name: 'Submitted date to'});
    this.clearAllLink = page.getByRole('link', {name: 'Submitted date to'});
  }

  async enterSubmissionReference(submissionReference: string) {
    await this.submissionReferenceInput.fill(submissionReference);
  }

  async enterSubmissionDateFrom(date: string) {
    await this.importDateFromInput.fill(date);
  }

  async enterSubmissionDateTo(date: string) {
    await this.importDateToInput.fill(date);
  }

  async clickClearAll() {
    await this.clearAllLink.click();
  }
}

export { LoginPage };