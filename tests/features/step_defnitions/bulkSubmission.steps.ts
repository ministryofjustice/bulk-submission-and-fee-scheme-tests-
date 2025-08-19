import { Before, Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { BulkImportPage } from '../../pages/bulkImportPage';
import {BulkClaimSubmitPage} from '../../pages/BulkClaimSubmitPage'
import type { CustomWorld } from '../support/world';
import { generateEmptyFile,generateInvalidFile,generateLargeFile } from '../../utils/filegenerator';
import * as dotenv from 'dotenv';
import * as path from 'path';

Before({ tags: "@bulkSubmission" }, async function (this: CustomWorld) {
  if (!this.page) {
    await this.openBrowser();   // ✅ ensure browser is ready
  }

  this.loginPage = new LoginPage(this.page!);
  await this.loginPage.navigateTo();
  await this.loginPage!.enterUsername( process.env.USERNAME!);
  await this.loginPage!.enterPassword( process.env.PASSWORD!);
  await this.loginPage!.clickLogin();
});

Before({ tags: "@generateEmptyFile" }, async function (this: CustomWorld) {
    this.fileName = "emptyFile.csv"
   await generateEmptyFile(`${this.fileName}`);
});

Before({ tags: "@generateInvalidFile" }, async function (this: CustomWorld) {
   await generateInvalidFile("invalid");
});

Before({ tags: "@generateLargeFile" }, async function (this: CustomWorld) {
   await generateLargeFile("largeFile.csv",20);
});


Given('I am on the bulk import page', async function (this: CustomWorld) {
this.bulkImportPage = new BulkImportPage(this.page!);
});

When('I upload {string}', async function (this: CustomWorld, file: string) {
  // If the file is "invalid", use the filename stored in process.env.FILENAME
  const filePath = file.toLowerCase() === 'invalid'
    ? `tests/data/${process.env.FILENAME}`
    : `tests/data/${file}`;

  this.fileName = path.basename(filePath); // store the actual file name for later checks
  await this.bulkImportPage!.uploadFile(filePath);
  await this.bulkImportPage!.clickUpload();
});

Then('I should be on the bulk Submission page', async function (this: CustomWorld) {
    this.bulkClaimSubmitPage = new BulkClaimSubmitPage(this.page!)
});


Then('the import is complete and submission details are displayed', async function (this: CustomWorld) {

    // Wait for submission alert
    await this.bulkClaimSubmitPage!.waitForSubmissionAlert();

    // Check submission reference and file name
    const ref = await this.bulkClaimSubmitPage!.getSubmissionReference();
    const filename = await this.bulkClaimSubmitPage!.getSubmissionFileName();
    expect(ref).toMatch(/[0-9a-f-]{36}/);
    expect(filename).toBe(this.fileName);

    await this.bulkClaimSubmitPage!.waitForProgressToComplete();
});


Then('the user sees an error message {string}', async function (this: CustomWorld, expectedMessage: string) {
    const found = await this.bulkImportPage!.checkErrorMessage(expectedMessage);
    expect(found).toBeTruthy();
});
